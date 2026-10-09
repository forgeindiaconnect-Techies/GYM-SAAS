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

    const { gymId, branchId, planName, duration, price, discount, paymentMethod, paymentReference, paymentProofUrl } = req.body;
    
    const gym = await Gym.findById(gymId);
    if (!gym) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const numPrice = Number(price) || 0;
    const isFreeTrial = numPrice === 0 || (planName && planName.toLowerCase().includes('trial'));
    const finalAmount = Math.max(0, numPrice - (Number(discount) || 0));

    let endDate = new Date();
    let memDuration = duration || (isFreeTrial ? '1 Week' : '1 Month');

    if (isFreeTrial) {
      endDate.setDate(endDate.getDate() + 7); // 7-Day Free Trial
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

    // Record payment if paid plan
    if (!isFreeTrial && finalAmount > 0) {
      try {
        await Payment.create({
          customerId: userId,
          gymId,
          branchId,
          planName: planName || 'Standard',
          amount: finalAmount,
          paymentMethod: paymentMethod || 'UPI',
          transactionId: paymentReference || `TXN-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`,
          status: PaymentStatus.APPROVED,
          paymentDate: new Date(),
          approvedAt: new Date(),
          notes: `Purchased via Checkout (${memDuration})`
        });
      } catch (payErr) {
        console.error('Failed to create payment record in joinGym:', payErr);
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

    const user = await User.findById(userId);
    if (user && user.role === Role.MEMBER && user.approvalStatus === ApprovalStatus.APPROVED) {
      let memberships = await CustomerMembership.find({ userId }).populate('gymId', 'name location logo phone email').sort({ createdAt: -1 });
      const now = new Date();
      let hasValidActive = false;
      for (const m of memberships) {
        if (m.status === CustomerMembershipStatus.ACTIVE && (!m.endDate || new Date(m.endDate) > now)) {
          hasValidActive = true;
          break;
        }
      }

      if (!hasValidActive) {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        if (memberships.length > 0) {
          const first = memberships[0];
          first.status = CustomerMembershipStatus.ACTIVE;
          first.endDate = futureDate;
          await first.save();
        } else {
          await CustomerMembership.create({
            userId: user._id,
            gymId: user.gymId,
            branchId: user.branchId,
            planName: user.subscriptionPlan || 'Active Membership',
            duration: '1 Year',
            price: 0,
            discount: 0,
            finalAmount: 0,
            paymentMethod: 'Gym Approval',
            status: CustomerMembershipStatus.ACTIVE,
            startDate: now,
            endDate: futureDate,
          });
        }
        memberships = await CustomerMembership.find({ userId }).populate('gymId', 'name location logo phone email').sort({ createdAt: -1 });
      }
      res.status(200).json({ success: true, memberships });
      return;
    }

    const memberships = await CustomerMembership.find({ userId }).populate('gymId', 'name location logo phone email').sort({ createdAt: -1 });
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
