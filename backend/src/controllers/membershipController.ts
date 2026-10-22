import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import CustomerMembership, { CustomerMembershipStatus } from '../models/CustomerMembership';
import User, { Role, ApprovalStatus, SubscriptionStatus } from '../models/User';
import Gym from '../models/Gym';
import Notification from '../models/Notification';
import Payment, { PaymentStatus } from '../models/Payment';

export const getGymMemberships = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    // Get the gym for this owner
    const user = await User.findById(userId).select('gymId branchId');
    if (!user?.gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }
    const branchIdQuery = req.query.branchId as string;
    const effectiveBranchId = user.branchId || branchIdQuery;
    let query: any = { gymId: user.gymId };
    if (effectiveBranchId && effectiveBranchId !== 'all') {
      if (effectiveBranchId === 'main') {
        query.$or = [{ branchId: { $exists: false } }, { branchId: null }];
      } else {
        query.branchId = effectiveBranchId;
      }
    }

    const memberships = await CustomerMembership.find(query)
      .select('userId planName duration status startDate endDate paymentMethod finalAmount createdAt branchId')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, memberships });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const joinGym = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      gymId, branchId, planName, duration, price, discount,
      paymentMethod, paymentReference, paymentProofUrl,
      packageId, billingPlan, fitnessGoal
    } = req.body;

    // ── Server-side price verification ──────────────────────────────────────
    // If a packageId is supplied, look up the real price from the DB.
    // Never trust the price the client sends when a package is selected.
    let verifiedPrice: number | null = null;
    let verifiedDuration: string | null = null;
    let verifiedFitnessGoal: string | null = fitnessGoal || null;

    if (packageId) {
      const GymPackage = require('../models/GymPackage').default;
      const pkg = await GymPackage.findById(packageId);
      if (!pkg) {
        res.status(404).json({ success: false, message: 'Selected package not found' });
        return;
      }
      if (pkg.status !== 'Active') {
        res.status(400).json({ success: false, message: 'Selected package is no longer active' });
        return;
      }
      if (pkg.gymId.toString() !== gymId) {
        res.status(400).json({ success: false, message: 'Package does not belong to this gym' });
        return;
      }

      const plan = billingPlan === 'annual' ? 'annual' : 'monthly';
      if (pkg.availablePlans === 'monthly' && plan === 'annual') {
        res.status(400).json({ success: false, message: 'This package does not offer an annual plan' });
        return;
      }
      if (pkg.availablePlans === 'annual' && plan === 'monthly') {
        res.status(400).json({ success: false, message: 'This package does not offer a monthly plan' });
        return;
      }

      verifiedPrice = plan === 'annual' ? pkg.annualPrice : pkg.monthlyPrice;
      verifiedDuration = plan === 'annual' ? '1 Year' : '1 Month';
      verifiedFitnessGoal = pkg.fitnessGoal;
    }


    
    const gym = await Gym.findById(gymId);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    // Use server-verified price if a package was selected; otherwise fall back to client-submitted price
    const numPrice = verifiedPrice !== null ? verifiedPrice : (Number(price) || 0);
    const memDuration = verifiedDuration || duration || (numPrice === 0 ? '1 Week' : '1 Month');
    const isFreeTrial = numPrice === 0 || (planName && planName.toLowerCase().includes('trial'));
    const finalAmount = Math.max(0, numPrice - (Number(discount) || 0));

    let endDate = new Date();

    if (isFreeTrial) {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      const durLower = (memDuration || '').toLowerCase();
      if (durLower.includes('year')) {
        endDate.setFullYear(endDate.getFullYear() + (parseInt(durLower) || 1));
      } else if (durLower.includes('month')) {
        endDate.setMonth(endDate.getMonth() + (parseInt(durLower) || 1));
      } else if (durLower.includes('week')) {
        endDate.setDate(endDate.getDate() + ((parseInt(durLower) || 1) * 7));
      } else if (durLower.includes('day')) {
        endDate.setDate(endDate.getDate() + (parseInt(durLower) || 1));
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }
    }

    const membership = new CustomerMembership({
      userId,
      gymId,
      branchId,
      packageId: packageId || undefined,
      fitnessGoal: verifiedFitnessGoal || undefined,
      billingPlan: packageId ? (billingPlan === 'annual' ? 'annual' : 'monthly') : undefined,
      planName: planName || (isFreeTrial ? 'Free Trial' : 'Standard'),
      duration: memDuration,
      price: numPrice,
      discount: Number(discount) || 0,
      finalAmount: isFreeTrial ? 0 : finalAmount,
      paymentMethod: isFreeTrial ? 'Free Trial' : (paymentMethod || 'UPI'),
      status: isFreeTrial ? CustomerMembershipStatus.FREE_TRIAL : CustomerMembershipStatus.ACTIVE,
      startDate: new Date(),
      endDate: endDate,
    });

    await membership.save();


    const userDoc = await User.findByIdAndUpdate(userId, {
      $set: {
        paymentStatus: 'Approved',
        approvalStatus: ApprovalStatus.APPROVED,
        subscriptionStatus: isFreeTrial ? SubscriptionStatus.FREE_TRIAL : SubscriptionStatus.ACTIVE,
        subscriptionPlan: planName || (isFreeTrial ? 'Free Trial' : 'Standard'),
        subscriptionExpiry: endDate,
        subscriptionExpiryDate: endDate,
        branchId: branchId || undefined,
        gymId: gymId,
        isActive: true,
      }
    }, { new: true });

    // Record payment for paid plan or Free Trial
    let paymentRecord: any = null;
    try {
      paymentRecord = await Payment.create({
        customerId: userId,
        gymId,
        branchId,
        planName: planName || (isFreeTrial ? 'Free Trial' : 'Standard'),
        amount: isFreeTrial ? 0 : finalAmount,
        paymentMethod: isFreeTrial ? 'Trial' : (paymentMethod || 'UPI'),
        transactionId: paymentReference || `${isFreeTrial ? 'TRX' : 'TXN'}-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`,
        status: PaymentStatus.APPROVED,
        paymentDate: new Date(),
        approvedAt: new Date(),
        notes: isFreeTrial ? 'Free Trial Membership' : `Purchased via Checkout (${memDuration})`
      });
    } catch (payErr) {
      console.error('Failed to create payment record in joinGym:', payErr);
    }

    // Process referral eligibility and reward issuance for paid memberships
    if (!isFreeTrial) {
      try {
        const { processReferralOnPayment } = require('./referralController');
        await processReferralOnPayment({
          gymId: gym._id,
          userId,
          membershipId: membership._id,
          planName: planName || 'Standard',
          planAmount: numPrice,
          finalPaidAmount: finalAmount,
          paymentId: paymentRecord?._id,
          paymentReference,
          referralCodeSubmitted: req.body.referralCode
        });
      } catch (refErr) {
        console.error('Referral processing error in joinGym:', refErr);
      }
    }

    if (gym.ownerId) {
      const custName = userDoc ? `${userDoc.firstName} ${userDoc.lastName}`.trim() : 'New Member';
      await Notification.create({
        recipientId: gym.ownerId,
        recipientRole: 'GYM_OWNER',
        gymId: gym._id,
        title: isFreeTrial ? 'New Member Trial Signup' : 'New Membership Purchase',
        message: isFreeTrial
          ? `${custName} joined on Free Trial (${planName || 'General'}).`
          : `${custName} purchased ${planName} for ₹${finalAmount.toLocaleString('en-IN')} via ${paymentMethod || 'UPI'}.`,
        type: 'success',
        relatedRecordId: membership._id,
        link: '/admin/members'
      }).catch(err => console.error('Notif error:', err));
    }

    res.status(201).json({
      success: true,
      message: isFreeTrial ? 'Free trial activated successfully' : `${planName} activated successfully!`,
      membership
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMyMemberships = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const memberships = await CustomerMembership.find({
      $or: [{ userId }, { customerId: userId }]
    }).populate('gymId', 'name location logo phone email').sort({ createdAt: -1 });

    const now = new Date();
    for (const m of memberships) {
      if (m.endDate && new Date(m.endDate) < now) {
        if (m.status === CustomerMembershipStatus.ACTIVE || m.status === CustomerMembershipStatus.FREE_TRIAL) {
          m.status = CustomerMembershipStatus.EXPIRED;
          await m.save();
        }
      }
    }

    res.status(200).json({ success: true, memberships });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const verifyMembership = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // In a real app, verify that req.user is the owner of the gym tied to this membership
    const membership = await CustomerMembership.findById(id);
    if (!membership) {
      res.status(404).json({ success: false, message: 'Membership not found' });
      return;
    }

    membership.status = CustomerMembershipStatus.ACTIVE;
    membership.startDate = new Date();
    
    const endDate = new Date();
    if (membership.planName.toLowerCase().includes('trial')) {
      endDate.setDate(endDate.getDate() + 1);
    } else if (membership.duration.toLowerCase().includes('month')) {
      endDate.setMonth(endDate.getMonth() + (parseInt(membership.duration) || 1));
    } else if (membership.duration.toLowerCase().includes('year')) {
      endDate.setFullYear(endDate.getFullYear() + (parseInt(membership.duration) || 1));
    } else if (membership.duration.toLowerCase().includes('day')) {
      endDate.setDate(endDate.getDate() + (parseInt(membership.duration) || 1));
    } else if (membership.duration.toLowerCase().includes('week')) {
      endDate.setDate(endDate.getDate() + ((parseInt(membership.duration) || 1) * 7));
    }
    membership.endDate = endDate;

    await membership.save();

    await User.findByIdAndUpdate(membership.userId, {
      $set: {
        approvalStatus: ApprovalStatus.APPROVED,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionExpiry: endDate,
        subscriptionExpiryDate: endDate,
        paymentStatus: 'Approved',
        isActive: true
      }
    });

    await Notification.create({
      recipientId: membership.userId,
      recipientRole: 'MEMBER',
      gymId: membership.gymId,
      title: 'Membership Verified & Active',
      message: `Your ${membership.planName} membership is active until ${endDate.toLocaleDateString()}.`,
      type: 'success',
      relatedRecordId: membership._id,
      link: '/member/dashboard'
    }).catch(err => console.error('Notif error:', err));

    res.status(200).json({ success: true, message: 'Membership verified and activated', membership });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
