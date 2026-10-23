import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Subscription, { SubscriptionPlan, BillingCycle, SubscriptionPaymentStatus } from '../models/Subscription';
import User, { SubscriptionStatus, ApprovalStatus } from '../models/User';
import Gym, { GymStatus } from '../models/Gym';
import Notification from '../models/Notification';
import { sendGymOwnerSubscriptionConfirmationEmail } from '../utils/emailService';

export const PLAN_PRICING: Record<string, { monthly: number; annual: number; trial: number; trialDays: number }> = {
  FREE_TRIAL:   { monthly: 0, annual: 0, trial: 0, trialDays: 1 },
  STARTER:      { monthly: 799, annual: 7190, trial: 0, trialDays: 0 },
  SILVER:       { monthly: 799, annual: 7190, trial: 0, trialDays: 0 },
  PROFESSIONAL: { monthly: 1499, annual: 13490, trial: 0, trialDays: 0 },
  GOLD:         { monthly: 1499, annual: 13490, trial: 0, trialDays: 0 },
  ENTERPRISE:   { monthly: 2499, annual: 22490, trial: 0, trialDays: 0 },
  PREMIUM:      { monthly: 2499, annual: 22490, trial: 0, trialDays: 0 },
  BASIC:        { monthly: 399, annual: 3990, trial: 0, trialDays: 0 },
};

export const PLAN_TIER_RANK: Record<string, number> = {
  FREE_TRIAL: 0,
  TRIAL: 0,
  BASIC: 1,
  STARTER: 1,
  SILVER: 1,
  PROFESSIONAL: 2,
  GOLD: 2,
  ENTERPRISE: 3,
  PREMIUM: 3,
};

export const PLAN_LIMITS: Record<string, { members: number; trainers: number; staff: number; branches: number }> = {
  FREE_TRIAL:   { members: 10, trainers: 1, staff: 1, branches: 1 },
  SILVER:       { members: 100, trainers: 5, staff: 2, branches: 1 },
  STARTER:      { members: 100, trainers: 3, staff: 2, branches: 1 },
  GOLD:         { members: 500, trainers: 15, staff: 5, branches: 2 },
  PROFESSIONAL: { members: 500, trainers: 15, staff: 5, branches: 1 },
  PREMIUM:      { members: -1, trainers: -1, staff: -1, branches: 5 },
  ENTERPRISE:   { members: 1000, trainers: 50, staff: 10, branches: 2 },
};

export const selectPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { plan, billingCycle, isRenewal } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!plan || !billingCycle) {
      res.status(400).json({ success: false, message: 'Plan and billing cycle are required' });
      return;
    }

    const planKey = (plan as string).toUpperCase().trim();
    const pricing = PLAN_PRICING[planKey];
    if (!pricing) {
      res.status(400).json({ success: false, message: 'Invalid plan selected' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Find current active subscription
    const currentActiveSub = await Subscription.findOne({
      userId,
      status: SubscriptionPaymentStatus.ACTIVE
    }).sort({ endDate: -1 });

    const now = new Date();
    let startDate = new Date(now);
    let endDate = new Date(now);
    let amount = 0;
    let actionType: 'NEW' | 'RENEWAL' | 'UPGRADE' | 'SWITCH' = 'NEW';

    const currentPlanKey = (user.subscriptionPlan || currentActiveSub?.plan || 'NONE').toUpperCase();
    const isSamePlan = planKey === currentPlanKey;

    if (isRenewal || isSamePlan) {
      actionType = 'RENEWAL';
    } else if (currentActiveSub) {
      const currentRank = PLAN_TIER_RANK[currentPlanKey] ?? 0;
      const targetRank = PLAN_TIER_RANK[planKey] ?? 0;
      actionType = targetRank > currentRank ? 'UPGRADE' : 'SWITCH';
    }

    // Free Trial
    if (planKey === 'FREE_TRIAL') {
      endDate.setDate(endDate.getDate() + 1);
      amount = 0;
    } else {
      // If renewing an active subscription, schedule renewal period to begin after existing period ends
      if (actionType === 'RENEWAL' && currentActiveSub && new Date(currentActiveSub.endDate) > now) {
        startDate = new Date(currentActiveSub.endDate);
        endDate = new Date(currentActiveSub.endDate);
      } else {
        startDate = new Date(now);
        endDate = new Date(now);
      }

      if (billingCycle === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
        amount = pricing.annual;
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
        amount = pricing.monthly;
      }
    }

    // Cancel any prior PENDING subscriptions for this user to avoid stale orders
    await Subscription.updateMany(
      { userId, status: SubscriptionPaymentStatus.PENDING },
      { status: SubscriptionPaymentStatus.CANCELLED }
    );

    // Create the pending subscription record (keeps active subscription untouched until payment!)
    const subscription = new Subscription({
      userId,
      plan: planKey as SubscriptionPlan,
      billingCycle: planKey === 'FREE_TRIAL' ? BillingCycle.TRIAL : billingCycle as BillingCycle,
      status: planKey === 'FREE_TRIAL' ? SubscriptionPaymentStatus.ACTIVE : SubscriptionPaymentStatus.PENDING,
      startDate,
      endDate,
      amount,
      actionType,
      previousPlan: currentPlanKey !== 'NONE' ? currentPlanKey : undefined,
      notes: `${actionType} to ${planKey} (${billingCycle})`,
    });

    await subscription.save();

    // Free Trial activates immediately
    if (planKey === 'FREE_TRIAL') {
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: SubscriptionStatus.FREE_TRIAL,
        subscriptionPlan: planKey,
        subscriptionStartDate: startDate,
        subscriptionExpiry: endDate,
        subscriptionExpiryDate: endDate,
        approvalStatus: ApprovalStatus.APPROVED,
      });

      if (user.gymId) {
        await Gym.findByIdAndUpdate(user.gymId, {
          status: GymStatus.ACTIVE,
          'subscription.plan': planKey,
          'subscription.status': 'Active',
          'subscription.startDate': startDate,
          'subscription.endDate': endDate,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `${actionType} order prepared successfully`,
      subscription: {
        id: subscription._id,
        _id: subscription._id,
        plan: planKey,
        billingCycle,
        status: subscription.status,
        startDate,
        endDate,
        amount,
        actionType,
      },
    });
  } catch (error: any) {
    console.error('Error in selectPlan:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { subscriptionId, paymentMethod, paymentReference } = req.body;
    
    if (!subscriptionId) {
      res.status(400).json({ success: false, message: 'Subscription ID is required' });
      return;
    }

    let subscription = await Subscription.findOne({ _id: subscriptionId, userId });
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription order not found' });
      return;
    }

    // Idempotent: If already active, return without duplicate operations
    if (subscription.status === SubscriptionPaymentStatus.ACTIVE) {
      res.status(200).json({
        success: true,
        message: 'Subscription is already active.',
        subscription,
      });
      return;
    }

    const now = new Date();
    const generatedTransactionId = paymentReference || 'txn_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

    // Check if user currently has an active subscription
    const existingActive = await Subscription.findOne({
      userId,
      _id: { $ne: subscription._id },
      status: SubscriptionPaymentStatus.ACTIVE
    }).sort({ endDate: -1 });

    let finalStartDate = subscription.startDate || now;
    let finalEndDate = subscription.endDate || now;

    // If Renewal on an active subscription, extend from the existing expiry date
    if (subscription.actionType === 'RENEWAL' && existingActive && new Date(existingActive.endDate) > now) {
      finalStartDate = new Date(existingActive.endDate);
      finalEndDate = new Date(existingActive.endDate);
      if (subscription.billingCycle === BillingCycle.ANNUAL) {
        finalEndDate.setFullYear(finalEndDate.getFullYear() + 1);
      } else {
        finalEndDate.setMonth(finalEndDate.getMonth() + 1);
      }
    } else {
      // New / Upgrade / Expired Renewal starts now
      finalStartDate = new Date(now);
      finalEndDate = new Date(now);
      if (subscription.billingCycle === BillingCycle.ANNUAL) {
        finalEndDate.setFullYear(finalEndDate.getFullYear() + 1);
      } else {
        finalEndDate.setMonth(finalEndDate.getMonth() + 1);
      }
    }

    // Archive prior active subscriptions
    await Subscription.updateMany(
      { userId, _id: { $ne: subscription._id }, status: SubscriptionPaymentStatus.ACTIVE },
      { status: SubscriptionPaymentStatus.CANCELLED }
    );

    subscription.status = SubscriptionPaymentStatus.ACTIVE;
    subscription.startDate = finalStartDate;
    subscription.endDate = finalEndDate;
    subscription.paymentMethod = paymentMethod || 'Online (UPI / Card)';
    subscription.transactionId = generatedTransactionId;
    await subscription.save();

    // Update User
    const updatedUser = await User.findByIdAndUpdate(userId, {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: subscription.plan,
      subscriptionStartDate: finalStartDate,
      subscriptionExpiry: finalEndDate,
      subscriptionExpiryDate: finalEndDate,
      paymentStatus: 'Approved',
      approvalStatus: ApprovalStatus.APPROVED,
      isActive: true,
    }, { new: true });

    // Update Gym
    if (updatedUser?.gymId) {
      await Gym.findByIdAndUpdate(updatedUser.gymId, {
        status: GymStatus.ACTIVE,
        'subscription.plan': subscription.plan,
        'subscription.status': 'Active',
        'subscription.startDate': finalStartDate,
        'subscription.endDate': finalEndDate,
      });
    }

    // Send In-App Notification
    try {
      const isRenewal = subscription.actionType === 'RENEWAL';
      const isUpgrade = subscription.actionType === 'UPGRADE';
      const notificationTitle = isRenewal 
        ? `🎉 Subscription Renewed — ${subscription.plan}`
        : isUpgrade
        ? `🚀 Plan Upgraded to ${subscription.plan}!`
        : `✅ Subscription Activated — ${subscription.plan}`;

      await Notification.create({
        recipientId: userId,
        recipientRole: 'GYM_OWNER',
        gymId: updatedUser?.gymId,
        title: notificationTitle,
        message: `Your ${subscription.plan} subscription (${subscription.billingCycle}) is active until ${new Date(finalEndDate).toLocaleDateString('en-IN')}. Transaction ID: ${generatedTransactionId}.`,
        type: 'success',
        link: '/admin/subscription'
      });
    } catch (notifErr) {
      console.warn('Could not create subscription notification:', notifErr);
    }

    // Send automated confirmation email to gym owner
    if (updatedUser?.email) {
      setImmediate(async () => {
        try {
          const gymDoc = await Gym.findOne({ ownerId: userId }) || (updatedUser.gymId ? await Gym.findById(updatedUser.gymId) : null);
          const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.SILVER;
          await sendGymOwnerSubscriptionConfirmationEmail({
            toEmail: updatedUser.email,
            ownerName: `${updatedUser.firstName || 'Gym'} ${updatedUser.lastName || 'Owner'}`.trim(),
            gymName: gymDoc?.name || 'Your Gym Enterprise',
            planName: `${subscription.plan} Plan`,
            billingCycle: subscription.billingCycle || 'Monthly',
            amount: subscription.amount,
            paymentMethod: subscription.paymentMethod || 'Online Payment',
            transactionId: generatedTransactionId || subscription.transactionId,
            startDate: finalStartDate,
            endDate: finalEndDate,
            limits,
            clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
          });
        } catch (mailErr) {
          console.error('Async subscription confirmation email error:', mailErr);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment successful! Your ${subscription.plan} plan is active.`,
      subscription,
      user: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        subscriptionPlan: subscription.plan,
        subscriptionStartDate: finalStartDate,
        subscriptionExpiryDate: finalEndDate,
      }
    });
  } catch (error: any) {
    console.error('Error in processPayment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Direct 1-Click Renewal Endpoint
export const renewSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { billingCycle = 'monthly', paymentMethod = 'Online' } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Use current or last active plan
    const currentActiveSub = await Subscription.findOne({
      userId,
      status: SubscriptionPaymentStatus.ACTIVE
    }).sort({ endDate: -1 });

    const planToRenew = (user.subscriptionPlan || currentActiveSub?.plan || 'SILVER').toUpperCase();
    const pricing = PLAN_PRICING[planToRenew] || PLAN_PRICING.SILVER;
    const isAnnual = billingCycle.toLowerCase() === 'annual';
    const amount = isAnnual ? pricing.annual : pricing.monthly;

    const now = new Date();
    let startDate = new Date(now);
    let endDate = new Date(now);

    // If current subscription is still active, renewal begins after existing period ends
    if (currentActiveSub && new Date(currentActiveSub.endDate) > now) {
      startDate = new Date(currentActiveSub.endDate);
      endDate = new Date(currentActiveSub.endDate);
    }

    if (isAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Archive previous active subscriptions
    await Subscription.updateMany(
      { userId, status: SubscriptionPaymentStatus.ACTIVE },
      { status: SubscriptionPaymentStatus.CANCELLED }
    );

    const generatedTransactionId = 'RNW-' + Math.random().toString(36).substr(2, 8).toUpperCase() + Date.now().toString().slice(-4);

    const newSub = new Subscription({
      userId,
      plan: planToRenew as SubscriptionPlan,
      billingCycle: isAnnual ? BillingCycle.ANNUAL : BillingCycle.MONTHLY,
      status: SubscriptionPaymentStatus.ACTIVE,
      startDate,
      endDate,
      amount,
      paymentMethod,
      transactionId: generatedTransactionId,
      actionType: 'RENEWAL',
      previousPlan: planToRenew,
      notes: `Direct renewal of ${planToRenew} plan`,
    });

    await newSub.save();

    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: planToRenew,
      subscriptionStartDate: startDate,
      subscriptionExpiry: endDate,
      subscriptionExpiryDate: endDate,
      paymentStatus: 'Approved',
      approvalStatus: ApprovalStatus.APPROVED,
      isActive: true,
    });

    if (user.gymId) {
      await Gym.findByIdAndUpdate(user.gymId, {
        status: GymStatus.ACTIVE,
        'subscription.plan': planToRenew,
        'subscription.status': 'Active',
        'subscription.startDate': startDate,
        'subscription.endDate': endDate,
      });
    }

    await Notification.create({
      recipientId: userId,
      recipientRole: 'GYM_OWNER',
      gymId: user.gymId,
      title: `🔄 Subscription Renewed — ${planToRenew}`,
      message: `Your ${planToRenew} subscription has been renewed until ${endDate.toLocaleDateString('en-IN')}.`,
      type: 'success',
      link: '/admin/subscription'
    });

    res.status(200).json({
      success: true,
      message: `Your ${planToRenew} plan has been renewed successfully!`,
      subscription: newSub,
    });
  } catch (error: any) {
    console.error('Error in renewSubscription:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Direct 1-Click Upgrade Endpoint
export const upgradeSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { targetPlan, billingCycle = 'monthly', paymentMethod = 'Online' } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!targetPlan) {
      res.status(400).json({ success: false, message: 'Target plan is required' });
      return;
    }

    const cleanTargetPlan = targetPlan.toUpperCase().trim();
    const pricing = PLAN_PRICING[cleanTargetPlan];
    if (!pricing) {
      res.status(400).json({ success: false, message: 'Invalid target plan' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isAnnual = billingCycle.toLowerCase() === 'annual';
    const amount = isAnnual ? pricing.annual : pricing.monthly;
    const now = new Date();
    const startDate = new Date(now);
    const endDate = new Date(now);

    if (isAnnual) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const previousPlan = user.subscriptionPlan || 'STARTER';

    // Cancel old active subscriptions
    await Subscription.updateMany(
      { userId, status: SubscriptionPaymentStatus.ACTIVE },
      { status: SubscriptionPaymentStatus.CANCELLED }
    );

    const generatedTransactionId = 'UPG-' + Math.random().toString(36).substr(2, 8).toUpperCase() + Date.now().toString().slice(-4);

    const newSub = new Subscription({
      userId,
      plan: cleanTargetPlan as SubscriptionPlan,
      billingCycle: isAnnual ? BillingCycle.ANNUAL : BillingCycle.MONTHLY,
      status: SubscriptionPaymentStatus.ACTIVE,
      startDate,
      endDate,
      amount,
      paymentMethod,
      transactionId: generatedTransactionId,
      actionType: 'UPGRADE',
      previousPlan,
      notes: `Upgraded from ${previousPlan} to ${cleanTargetPlan}`,
    });

    await newSub.save();

    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: cleanTargetPlan,
      subscriptionStartDate: startDate,
      subscriptionExpiry: endDate,
      subscriptionExpiryDate: endDate,
      paymentStatus: 'Approved',
      approvalStatus: ApprovalStatus.APPROVED,
      isActive: true,
    });

    if (user.gymId) {
      await Gym.findByIdAndUpdate(user.gymId, {
        status: GymStatus.ACTIVE,
        'subscription.plan': cleanTargetPlan,
        'subscription.status': 'Active',
        'subscription.startDate': startDate,
        'subscription.endDate': endDate,
      });
    }

    await Notification.create({
      recipientId: userId,
      recipientRole: 'GYM_OWNER',
      gymId: user.gymId,
      title: `⚡ Plan Upgraded to ${cleanTargetPlan}!`,
      message: `Your gym now has access to all ${cleanTargetPlan} features through ${endDate.toLocaleDateString('en-IN')}.`,
      type: 'success',
      link: '/admin/subscription'
    });

    res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${cleanTargetPlan} plan!`,
      subscription: newSub,
    });
  } catch (error: any) {
    console.error('Error in upgradeSubscription:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMySubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    let subscription = await Subscription.findOne({ 
      userId, 
      status: SubscriptionPaymentStatus.ACTIVE
    }).sort({ endDate: -1 });

    // Fallback to most recent subscription if none active
    if (!subscription) {
      subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });
    }

    const now = new Date();
    const expiryDate = subscription?.endDate || user.subscriptionExpiryDate || user.subscriptionExpiry || now;
    const isExpired = new Date(expiryDate) < now;
    const remainingDays = isExpired ? 0 : Math.max(0, Math.ceil((new Date(expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isExpiringSoon = remainingDays <= 7 && remainingDays > 0;

    const currentPlanKey = (subscription?.plan || user.subscriptionPlan || 'STARTER').toUpperCase();
    const limits = PLAN_LIMITS[currentPlanKey] || PLAN_LIMITS.SILVER;
    const pricing = PLAN_PRICING[currentPlanKey] || PLAN_PRICING.SILVER;

    let computedStatus = subscription?.status || SubscriptionPaymentStatus.ACTIVE;
    if (isExpired && computedStatus === SubscriptionPaymentStatus.ACTIVE) {
      computedStatus = SubscriptionPaymentStatus.EXPIRED;
      // Also update user record if not marked expired
      if (user.subscriptionStatus === SubscriptionStatus.ACTIVE) {
        await User.findByIdAndUpdate(userId, { subscriptionStatus: SubscriptionStatus.EXPIRED });
      }
    }

    res.status(200).json({ 
      success: true, 
      subscription,
      details: {
        planKey: currentPlanKey,
        planName: currentPlanKey.charAt(0) + currentPlanKey.slice(1).toLowerCase(),
        status: computedStatus,
        startDate: subscription?.startDate || user.subscriptionStartDate || now,
        endDate: expiryDate,
        remainingDays,
        isExpiringSoon,
        isExpired,
        billingCycle: subscription?.billingCycle || 'monthly',
        amount: subscription?.amount ?? pricing.monthly,
        limits,
        pricing,
      }
    });
  } catch (error: any) {
    console.error('Error in getMySubscription:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMySubscriptionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 });

    const history = subscriptions.map((sub, idx) => {
      const d = sub.createdAt ? new Date(sub.createdAt) : new Date(sub.startDate || Date.now());
      const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateStr = `${d.getDate().toString().padStart(2, '0')} ${allMonths[d.getMonth()]} ${d.getFullYear()}`;
      
      const cleanTrx = (sub.transactionId || '').replace(/^txn_|^PAY-|^RNW-|^UPG-/, '');
      const invId = cleanTrx 
        ? `#INV-${d.getFullYear()}-${cleanTrx.slice(-6).toUpperCase()}`
        : `#INV-${d.getFullYear()}-${String(sub._id).slice(-6).toUpperCase()}`;

      const planName = (sub.plan || 'STARTER');
      const formattedPlan = `${planName.charAt(0).toUpperCase() + planName.slice(1).toLowerCase()} Plan (${sub.billingCycle === 'annual' ? 'Annual' : 'Monthly'})`;

      return {
        _id: sub._id,
        id: invId,
        date: dateStr,
        plan: formattedPlan,
        rawPlan: sub.plan,
        amount: `₹${Number(sub.amount || 0).toLocaleString('en-IN')}`,
        rawAmount: sub.amount,
        paymentMethod: sub.paymentMethod || 'Online',
        paymentDetails: sub.transactionId ? `TRX ID: ${sub.transactionId}` : `Method: ${sub.paymentMethod || 'Online'}`,
        status: sub.status === SubscriptionPaymentStatus.ACTIVE ? 'Paid' : sub.status === SubscriptionPaymentStatus.PENDING ? 'Pending' : sub.status,
        year: d.getFullYear(),
        startDate: sub.startDate,
        endDate: sub.endDate,
        actionType: sub.actionType || 'NEW',
        isCurrent: idx === 0 && sub.status === SubscriptionPaymentStatus.ACTIVE,
      };
    });

    res.status(200).json({ success: true, history });
  } catch (error: any) {
    console.error('Error in getMySubscriptionHistory:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getAllSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscriptions = await Subscription.find({}).sort({ createdAt: -1 });

    const enriched = (
      await Promise.all(
        subscriptions.map(async (sub) => {
          const user = await User.findById(sub.userId).select('firstName lastName gymId role');
          if (!user || user.role !== 'GYM_OWNER') {
            return null;
          }

          let gymName = 'N/A';
          if (user?.gymId) {
            const gym = await Gym.findById(user.gymId).select('name');
            gymName = gym?.name || 'N/A';
          }
          const ownerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';
          
          const start = sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : 'N/A';
          const renewal = sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : 'N/A';
          const formattedStatus = sub.status.charAt(0).toUpperCase() + sub.status.slice(1).toLowerCase();

          return {
            id: sub._id,
            userId: sub.userId,
            gymName,
            owner: ownerName,
            plan: sub.plan,
            billing: sub.billingCycle,
            amount: `₹${sub.amount.toLocaleString('en-IN')}`,
            paymentMethod: sub.paymentMethod || 'Manual',
            transactionId: sub.transactionId,
            start: start,
            renewal: renewal,
            status: formattedStatus,
          };
        })
      )
    ).filter((s): s is NonNullable<typeof s> => s !== null);

    res.status(200).json({ success: true, subscriptions: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const deleteSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findByIdAndDelete(id);
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Subscription deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateSubscriptionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const enumStatus = status.toUpperCase() as SubscriptionPaymentStatus;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }

    subscription.status = enumStatus;
    await subscription.save();

    const isActive = (enumStatus === SubscriptionPaymentStatus.ACTIVE);
    
    const user = await User.findById(subscription.userId);
    if (user) {
      user.isActive = isActive;
      user.suspensionReason = enumStatus.charAt(0).toUpperCase() + enumStatus.slice(1).toLowerCase();
      
      if (enumStatus === SubscriptionPaymentStatus.INACTIVE || enumStatus === SubscriptionPaymentStatus.CANCELLED) {
        user.subscriptionStatus = SubscriptionStatus.EXPIRED;
      } else if (enumStatus === SubscriptionPaymentStatus.ACTIVE) {
        user.subscriptionStatus = SubscriptionStatus.ACTIVE;
      }
      
      await user.save();
    }

    res.status(200).json({ success: true, message: `Subscription status updated to ${status}`, subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const resendSubscriptionEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const sub = await Subscription.findOne({ userId, status: SubscriptionPaymentStatus.ACTIVE }).sort({ createdAt: -1 });
    if (!sub) {
      res.status(404).json({ success: false, message: 'No active subscription found' });
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.email) {
      res.status(400).json({ success: false, message: 'User registered email not found' });
      return;
    }

    const gymDoc = await Gym.findOne({ ownerId: userId }) || (user.gymId ? await Gym.findById(user.gymId) : null);
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.SILVER;

    const emailRes = await sendGymOwnerSubscriptionConfirmationEmail({
      toEmail: user.email,
      ownerName: `${user.firstName || 'Gym'} ${user.lastName || 'Owner'}`.trim(),
      gymName: gymDoc?.name || 'Your Gym Enterprise',
      planName: `${sub.plan} Plan`,
      billingCycle: sub.billingCycle || 'Monthly',
      amount: sub.amount,
      paymentMethod: sub.paymentMethod || 'Online Payment',
      transactionId: sub.transactionId || 'Manual / Online',
      startDate: sub.startDate,
      endDate: sub.endDate,
      limits,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
    });

    if (emailRes.success) {
      res.status(200).json({ success: true, message: 'Subscription confirmation email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: emailRes.error || 'Failed to dispatch email' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
