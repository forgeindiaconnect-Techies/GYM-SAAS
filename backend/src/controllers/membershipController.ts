import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import CustomerMembership, { CustomerMembershipStatus } from '../models/CustomerMembership';
import User, { Role, ApprovalStatus, SubscriptionStatus } from '../models/User';
import Gym from '../models/Gym';
import Notification from '../models/Notification';
import Payment, { PaymentStatus } from '../models/Payment';
import GymRewardSettings from '../models/GymRewardSettings';
import CustomerPointsWallet from '../models/CustomerPointsWallet';
import PointsTransaction from '../models/PointsTransaction';
import {
  sendMembershipConfirmationEmail,
  sendMembershipExpiryReminderEmail
} from '../utils/emailService';

/**
 * Triggers automated membership purchase confirmation email
 * Includes idempotency check to avoid duplicate emails upon webhook/action retries
 */
export const triggerMembershipConfirmationEmail = async (
  membershipId: string | any,
  forceResend: boolean = false
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const membership = await CustomerMembership.findById(membershipId)
      .populate('userId', 'firstName lastName email mobile')
      .populate('gymId', 'name logo email phone location')
      .populate('paymentId');

    if (!membership) {
      return { success: false, error: 'Membership not found' };
    }

    if (membership.status !== CustomerMembershipStatus.ACTIVE && membership.status !== CustomerMembershipStatus.FREE_TRIAL) {
      return { success: false, error: 'Cannot send confirmation email for unverified or inactive membership' };
    }

    // Idempotency: avoid sending duplicate emails unless explicitly requested via resend
    if (membership.confirmationEmailSent && !forceResend) {
      return { success: true, message: 'Confirmation email already sent' };
    }

    const user: any = membership.userId;
    const gym: any = membership.gymId;
    const payment: any = membership.paymentId;

    if (!user?.email) {
      return { success: false, error: 'User does not have a registered email address' };
    }

    const gymAddressStr = gym?.location
      ? [gym.location.address, gym.location.area, gym.location.city, gym.location.state, gym.location.pinCode].filter(Boolean).join(', ')
      : undefined;

    const emailRes = await sendMembershipConfirmationEmail({
      toEmail: user.email,
      customerName: `${user.firstName || 'Valued'} ${user.lastName || 'Member'}`.trim(),
      customerId: `CUST-${user._id.toString().slice(-6).toUpperCase()}`,
      gymName: gym?.name || 'Our Fitness Center',
      gymLogo: gym?.logo || undefined,
      gymPhone: gym?.phone || undefined,
      gymEmail: gym?.email || undefined,
      gymAddress: gymAddressStr,
      membershipId: membership.membershipId || `MEM-${membership._id.toString().slice(-6).toUpperCase()}`,
      packageName: membership.planName,
      packageDescription: membership.packageDescription || `${membership.duration} Gym Membership Plan`,
      features: (membership.features && membership.features.length > 0)
        ? membership.features
        : ['Full Gym Facility Access', 'Cardio & Strength Zones', 'Locker Room Access', 'AI Fitness Assistant'],
      duration: membership.duration,
      startDate: membership.startDate || (membership as any).createdAt || new Date(),
      endDate: membership.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      membershipStatus: membership.status,
      orderId: membership.orderId || membership.receiptNumber || `ORD-${membership._id.toString().slice(-6).toUpperCase()}`,
      transactionId: membership.paymentReference || payment?.transactionId || `TXN-${membership._id.toString().slice(-6).toUpperCase()}`,
      paymentDate: payment?.paymentDate || membership.startDate || (membership as any).createdAt || new Date(),
      packagePrice: membership.price || 0,
      discount: membership.discount || 0,
      tax: membership.tax || 0,
      finalAmount: membership.finalAmount || 0,
      paymentMethod: membership.paymentMethod || 'Online Payment',
      paymentStatus: 'Successful',
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
    });

    // Update delivery audit record on CustomerMembership
    membership.confirmationEmailSent = emailRes.success;
    membership.confirmationEmailSentAt = new Date();
    membership.confirmationEmailStatus = emailRes.success ? 'Sent' : 'Failed';
    membership.confirmationEmailError = emailRes.error || undefined;
    await membership.save();

    return emailRes;
  } catch (err: any) {
    console.error('Error in triggerMembershipConfirmationEmail:', err);
    return { success: false, error: err.message };
  }
};

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
      .populate('userId', 'firstName lastName email mobile')
      .populate('paymentId')
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
      packageId, billingPlan, fitnessGoal, features: clientFeatures,
      packageDescription: clientDescription
    } = req.body;

    // Prevent duplicate activation if paymentReference already processed
    if (paymentReference) {
      const existingMembership = await CustomerMembership.findOne({
        userId,
        gymId,
        paymentReference,
        status: CustomerMembershipStatus.ACTIVE
      });
      if (existingMembership) {
        res.status(200).json({
          success: true,
          message: 'Membership is already active',
          membership: existingMembership
        });
        return;
      }
    }

    // ── Server-side price & feature verification ────────────────────────────
    let verifiedPrice: number | null = null;
    let verifiedDuration: string | null = null;
    let verifiedFitnessGoal: string | null = fitnessGoal || null;
    let verifiedFeatures: string[] = Array.isArray(clientFeatures) ? clientFeatures : [];
    let verifiedDescription: string = clientDescription || '';

    const GymPackage = require('../models/GymPackage').default;
    let targetPkg: any = null;

    if (packageId) {
      targetPkg = await GymPackage.findById(packageId);
      if (!targetPkg) {
        res.status(404).json({ success: false, message: 'Selected package not found' });
        return;
      }
      if (targetPkg.status !== 'Active') {
        res.status(400).json({ success: false, message: 'Selected package is no longer active' });
        return;
      }
      if (targetPkg.gymId.toString() !== gymId) {
        res.status(400).json({ success: false, message: 'Package does not belong to this gym' });
        return;
      }

      const plan = billingPlan === 'annual' ? 'annual' : 'monthly';
      if (targetPkg.availablePlans === 'monthly' && plan === 'annual') {
        res.status(400).json({ success: false, message: 'This package does not offer an annual plan' });
        return;
      }
      if (targetPkg.availablePlans === 'annual' && plan === 'monthly') {
        res.status(400).json({ success: false, message: 'This package does not offer a monthly plan' });
        return;
      }

      verifiedPrice = plan === 'annual' ? targetPkg.annualPrice : targetPkg.monthlyPrice;
      verifiedDuration = plan === 'annual' ? '1 Year' : '1 Month';
      verifiedFitnessGoal = targetPkg.fitnessGoal;
      if (Array.isArray(targetPkg.features) && targetPkg.features.length > 0) {
        verifiedFeatures = targetPkg.features;
      }
      if (targetPkg.description) {
        verifiedDescription = targetPkg.description;
      }
    } else if (planName) {
      targetPkg = await GymPackage.findOne({ gymId, name: planName, status: 'Active' });
      if (targetPkg) {
        if (Array.isArray(targetPkg.features) && targetPkg.features.length > 0) {
          verifiedFeatures = targetPkg.features;
        }
        if (targetPkg.description) {
          verifiedDescription = targetPkg.description;
        }
      }
    }

    if (verifiedFeatures.length === 0) {
      verifiedFeatures = [
        'Full gym equipment and workout floor access',
        'Locker room & hydration bar access',
        'AI personalized fitness & diet plan generation',
        'Trainer support & session booking access'
      ];
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

    // Handle points redemption for membership discount
    const requestedPoints = Math.max(0, Number(req.body.pointsToRedeem) || 0);
    let pointsDiscount = 0;
    let customerWallet: any = null;
    let rewardSettings: any = null;

    if (requestedPoints > 0 && !isFreeTrial) {
      rewardSettings = await GymRewardSettings.findOne({ gymId });
      if (!rewardSettings || !rewardSettings.enableMembershipDiscount) {
        res.status(400).json({ success: false, message: 'Membership Plan points redemption is currently disabled by this gym.' });
        return;
      }
      if (requestedPoints < (rewardSettings.minPointsForRedemption || 0)) {
        res.status(400).json({ success: false, message: `Minimum ${rewardSettings.minPointsForRedemption} points required for redemption.` });
        return;
      }
      customerWallet = await CustomerPointsWallet.findOne({ gymId, userId });
      if (!customerWallet || customerWallet.currentBalance < requestedPoints) {
        res.status(400).json({
          success: false,
          message: `Insufficient points. Available: ${customerWallet?.currentBalance || 0} pts, Requested: ${requestedPoints} pts.`
        });
        return;
      }

      if (rewardSettings.eligibleMembershipPlans?.length > 0 && planName) {
        const eligibleNames = rewardSettings.eligibleMembershipPlans.map((p: string) => p.toLowerCase());
        const isEligible = eligibleNames.includes(planName.toLowerCase());
        if (!isEligible) {
          res.status(400).json({
            success: false,
            message: `The plan "${planName}" is not eligible for points discount.`
          });
          return;
        }
      }

      const rate = (rewardSettings.currencyValuePerUnit || 50) / (rewardSettings.pointsPerConversionUnit || 100);
      pointsDiscount = Math.round(requestedPoints * rate);
      if (rewardSettings.maxDiscountPerTransaction > 0 && pointsDiscount > rewardSettings.maxDiscountPerTransaction) {
        pointsDiscount = rewardSettings.maxDiscountPerTransaction;
      }
    }

    const appliedDiscount = Math.min(numPrice, (Number(discount) || 0) + pointsDiscount);
    const discountedPrice = Math.max(0, numPrice - appliedDiscount);
    const calculatedTax = isFreeTrial ? 0 : Math.round(discountedPrice * 0.18);
    const finalAmount = isFreeTrial ? 0 : Math.round(discountedPrice + calculatedTax);

    const startDate = new Date();
    let endDate = new Date(startDate);

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

    const dateSlug = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const membershipIdCode = `MEM-${dateSlug}-${randomSuffix}`;
    const receiptNumberCode = `REC-${dateSlug}-${randomSuffix}`;
    const orderIdCode = `ORD-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
    const finalTxnReference = paymentReference || `${isFreeTrial ? 'TRX' : 'PAY'}-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;

    const membership = new CustomerMembership({
      userId,
      gymId,
      branchId,
      packageId: packageId || undefined,
      membershipId: membershipIdCode,
      receiptNumber: receiptNumberCode,
      orderId: orderIdCode,
      fitnessGoal: verifiedFitnessGoal || undefined,
      billingPlan: packageId ? (billingPlan === 'annual' ? 'annual' : 'monthly') : undefined,
      planName: planName || (isFreeTrial ? 'Free Trial' : 'Standard'),
      packageDescription: verifiedDescription || undefined,
      features: verifiedFeatures,
      duration: memDuration,
      price: numPrice,
      discount: appliedDiscount,
      tax: calculatedTax,
      finalAmount: finalAmount,
      paymentMethod: isFreeTrial ? 'Free Trial' : (paymentMethod || 'UPI'),
      paymentReference: finalTxnReference,
      paymentProofUrl,
      status: isFreeTrial ? CustomerMembershipStatus.FREE_TRIAL : CustomerMembershipStatus.ACTIVE,
      startDate: startDate,
      endDate: endDate,
      confirmationEmailStatus: 'Pending',
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
        subscriptionStartDate: startDate,
        branchId: branchId || undefined,
        gymId: gymId,
        isActive: true,
      }
    }, { new: true });

    // Record verified payment transaction
    let paymentRecord: any = null;
    try {
      paymentRecord = await Payment.create({
        customerId: userId,
        gymId,
        branchId,
        membershipId: membership._id,
        orderId: orderIdCode,
        receiptNumber: receiptNumberCode,
        planName: planName || (isFreeTrial ? 'Free Trial' : 'Standard'),
        packagePrice: numPrice,
        discount: appliedDiscount,
        tax: calculatedTax,
        amount: finalAmount,
        paymentMethod: isFreeTrial ? 'Trial' : (paymentMethod || 'UPI'),
        transactionId: finalTxnReference,
        status: PaymentStatus.APPROVED,
        paymentDate: startDate,
        approvedAt: startDate,
        notes: isFreeTrial ? 'Free Trial Membership' : `Purchased via Checkout (${memDuration})`
      });

      membership.paymentId = paymentRecord._id;
      await membership.save();

      // Atomically deduct redeemed points if used
      if (requestedPoints > 0 && customerWallet) {
        customerWallet.currentBalance -= requestedPoints;
        customerWallet.totalRedeemed += requestedPoints;
        customerWallet.lastUpdated = new Date();
        await customerWallet.save();

        await PointsTransaction.create({
          gymId: gym._id,
          userId,
          type: 'REDEEM_MEMBERSHIP',
          amount: -requestedPoints,
          balanceAfter: customerWallet.currentBalance,
          description: `Redeemed ${requestedPoints} points for ₹${pointsDiscount} discount on ${planName || 'Membership'} (${receiptNumberCode})`,
          conversionRateUsed: rewardSettings ? `${rewardSettings.pointsPerConversionUnit} pts = ₹${rewardSettings.currencyValuePerUnit}` : '100 pts = ₹50',
          discountAmount: pointsDiscount,
          orderReference: receiptNumberCode
        });
      }
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
          paymentReference: finalTxnReference,
          referralCodeSubmitted: req.body.referralCode
        });
      } catch (refErr) {
        console.error('Referral processing error in joinGym:', refErr);
      }
    }

    // Send automated purchase confirmation email asynchronously
    setImmediate(async () => {
      try {
        await triggerMembershipConfirmationEmail(membership._id);
      } catch (mailErr) {
        console.error('Async confirmation email error:', mailErr);
      }
    });

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
        link: '/admin/payments'
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
    })
      .populate('gymId', 'name location logo phone email')
      .populate('paymentId')
      .sort({ createdAt: -1 });

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
    
    const membership = await CustomerMembership.findById(id);
    if (!membership) {
      res.status(404).json({ success: false, message: 'Membership not found' });
      return;
    }

    const startDate = new Date();
    membership.status = CustomerMembershipStatus.ACTIVE;
    membership.startDate = startDate;
    
    const endDate = new Date(startDate);
    if (membership.planName.toLowerCase().includes('trial')) {
      endDate.setDate(endDate.getDate() + 7);
    } else if (membership.duration.toLowerCase().includes('month')) {
      endDate.setMonth(endDate.getMonth() + (parseInt(membership.duration) || 1));
    } else if (membership.duration.toLowerCase().includes('year')) {
      endDate.setFullYear(endDate.getFullYear() + (parseInt(membership.duration) || 1));
    } else if (membership.duration.toLowerCase().includes('day')) {
      endDate.setDate(endDate.getDate() + (parseInt(membership.duration) || 1));
    } else if (membership.duration.toLowerCase().includes('week')) {
      endDate.setDate(endDate.getDate() + ((parseInt(membership.duration) || 1) * 7));
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    membership.endDate = endDate;

    if (!membership.membershipId) {
      const dateSlug = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      membership.membershipId = `MEM-${dateSlug}-${randomSuffix}`;
      membership.receiptNumber = `REC-${dateSlug}-${randomSuffix}`;
    }

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

    // Send confirmation email asynchronously
    setImmediate(async () => {
      try {
        await triggerMembershipConfirmationEmail(membership._id);
      } catch (err) {
        console.error('Async verify email error:', err);
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
      link: '/member/subscription'
    }).catch(err => console.error('Notif error:', err));

    res.status(200).json({ success: true, message: 'Membership verified and activated', membership });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Resend membership purchase confirmation email (for gym owner or member)
 */
export const resendMembershipEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const membership = await CustomerMembership.findById(id);
    if (!membership) {
      res.status(404).json({ success: false, message: 'Membership not found' });
      return;
    }

    // Role-based authorization
    if (userRole === Role.MEMBER && membership.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized to resend this membership email' });
      return;
    }

    if (userRole === Role.GYM_OWNER || userRole === Role.ADMIN) {
      const gym = await Gym.findById(membership.gymId);
      if (gym?.ownerId && gym.ownerId.toString() !== userId && req.user?.gymId?.toString() !== membership.gymId.toString()) {
        res.status(403).json({ success: false, message: 'Unauthorized to access this gym record' });
        return;
      }
    }

    const emailResult = await triggerMembershipConfirmationEmail(membership._id, true);

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Confirmation email resent successfully',
        deliveryStatus: 'Sent'
      });
    } else {
      res.status(500).json({
        success: false,
        message: emailResult.error || 'Failed to resend confirmation email',
        deliveryStatus: 'Failed'
      });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Expiry Scanner: Automatically sends 7-day, 3-day, and on-expiry reminder emails
 * and updates expired memberships consistently
 */
export const runMembershipExpiryCheck = async (): Promise<{ processed: number; remindersSent: number }> => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    let remindersSent = 0;

    // 1. Find all active memberships
    const activeMemberships = await CustomerMembership.find({
      status: { $in: [CustomerMembershipStatus.ACTIVE, CustomerMembershipStatus.FREE_TRIAL] },
      endDate: { $exists: true }
    })
      .populate('userId', 'firstName lastName email')
      .populate('gymId', 'name');

    for (const mem of activeMemberships) {
      if (!mem.endDate) continue;
      const endDate = new Date(mem.endDate);
      const user: any = mem.userId;
      const gym: any = mem.gymId;

      if (!user?.email) continue;

      // Case A: Membership expired
      if (endDate < now) {
        mem.status = CustomerMembershipStatus.EXPIRED;
        if (!mem.reminderExpiryDaySent) {
          await sendMembershipExpiryReminderEmail({
            toEmail: user.email,
            customerName: `${user.firstName || 'Member'} ${user.lastName || ''}`.trim(),
            gymName: gym?.name || 'Our Fitness Center',
            packageName: mem.planName,
            membershipId: mem.membershipId || `MEM-${mem._id.toString().slice(-6).toUpperCase()}`,
            expiryDate: endDate,
            reminderType: 'EXPIRED_TODAY',
            clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
          });
          mem.reminderExpiryDaySent = true;
          remindersSent++;
        }
        await mem.save();

        await User.findByIdAndUpdate(mem.userId, {
          $set: { subscriptionStatus: SubscriptionStatus.EXPIRED }
        });
        continue;
      }

      // Case B: Expiring in <= 3 days
      if (endDate <= threeDaysFromNow) {
        if (!mem.reminder3DaysSent) {
          await sendMembershipExpiryReminderEmail({
            toEmail: user.email,
            customerName: `${user.firstName || 'Member'} ${user.lastName || ''}`.trim(),
            gymName: gym?.name || 'Our Fitness Center',
            packageName: mem.planName,
            membershipId: mem.membershipId || `MEM-${mem._id.toString().slice(-6).toUpperCase()}`,
            expiryDate: endDate,
            reminderType: '3_DAYS',
            clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
          });
          mem.reminder3DaysSent = true;
          await mem.save();
          remindersSent++;
        }
        continue;
      }

      // Case C: Expiring in <= 7 days
      if (endDate <= sevenDaysFromNow) {
        if (!mem.reminder7DaysSent) {
          await sendMembershipExpiryReminderEmail({
            toEmail: user.email,
            customerName: `${user.firstName || 'Member'} ${user.lastName || ''}`.trim(),
            gymName: gym?.name || 'Our Fitness Center',
            packageName: mem.planName,
            membershipId: mem.membershipId || `MEM-${mem._id.toString().slice(-6).toUpperCase()}`,
            expiryDate: endDate,
            reminderType: '7_DAYS',
            clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
          });
          mem.reminder7DaysSent = true;
          await mem.save();
          remindersSent++;
        }
      }
    }

    return { processed: activeMemberships.length, remindersSent };
  } catch (err) {
    console.error('Error running membership expiry check:', err);
    return { processed: 0, remindersSent: 0 };
  }
};

