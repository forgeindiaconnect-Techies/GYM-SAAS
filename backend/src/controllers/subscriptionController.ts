import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Subscription, { SubscriptionPlan, BillingCycle, SubscriptionPaymentStatus } from '../models/Subscription';
import User, { SubscriptionStatus } from '../models/User';
import Gym from '../models/Gym';

const PLAN_PRICING: Record<string, { monthly: number; annual: number; trial: number; trialDays: number }> = {
  FREE_TRIAL: { monthly: 0, annual: 0, trial: 0, trialDays: 1 },
  BASIC:      { monthly: 399, annual: 3990, trial: 0, trialDays: 0 },
  PREMIUM:    { monthly: 799, annual: 7990, trial: 0, trialDays: 0 },
};

export const selectPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { plan, billingCycle } = req.body;

    if (!plan || !billingCycle) {
      res.status(400).json({ success: false, message: 'Plan and billing cycle are required' });
      return;
    }

    const pricing = PLAN_PRICING[plan as string];
    if (!pricing) {
      res.status(400).json({ success: false, message: 'Invalid plan' });
      return;
    }

    const now = new Date();
    let endDate = new Date(now);
    let amount = 0;

    if (plan === 'FREE_TRIAL') {
      endDate.setDate(endDate.getDate() + 1);
      amount = 0;
    } else if (billingCycle === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
      amount = pricing.annual;
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
      amount = pricing.monthly;
    }

    // Cancel existing active subscriptions
    await Subscription.updateMany(
      { userId, status: SubscriptionPaymentStatus.ACTIVE },
      { status: SubscriptionPaymentStatus.CANCELLED }
    );

    const subscription = new Subscription({
      userId,
      plan: plan as SubscriptionPlan,
      billingCycle: plan === 'FREE_TRIAL' ? BillingCycle.TRIAL : billingCycle as BillingCycle,
      status: plan === 'FREE_TRIAL' ? SubscriptionPaymentStatus.ACTIVE : SubscriptionPaymentStatus.PENDING,
      startDate: now,
      endDate,
      amount,
    });

    await subscription.save();

    if (plan === 'FREE_TRIAL') {
      await User.findByIdAndUpdate(userId, {
        subscriptionStatus: SubscriptionStatus.TRIAL,
        subscriptionPlan: plan,
        subscriptionExpiry: endDate,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan selected successfully',
      subscription: {
        id: subscription._id,
        plan,
        billingCycle,
        status: subscription.status,
        startDate: now,
        endDate,
        amount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { subscriptionId, paymentMethod } = req.body;
    
    if (!subscriptionId) {
      res.status(400).json({ success: false, message: 'Subscription ID is required' });
      return;
    }

    const subscription = await Subscription.findOne({ _id: subscriptionId, userId, status: SubscriptionPaymentStatus.PENDING });
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Pending subscription not found' });
      return;
    }

    // Simulate successful payment processing
    const generatedTransactionId = 'txn_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    subscription.status = SubscriptionPaymentStatus.ACTIVE;
    subscription.paymentMethod = paymentMethod || 'Online';
    subscription.transactionId = generatedTransactionId;
    await subscription.save();

    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: subscription.plan,
      subscriptionExpiry: subscription.endDate,
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully. Subscription is now active.',
      subscription,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMySubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const subscription = await Subscription.findOne({ 
      userId, 
      status: { $in: [SubscriptionPaymentStatus.ACTIVE, SubscriptionPaymentStatus.PENDING] }
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, subscription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getAllSubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscriptions = await Subscription.find({}).sort({ createdAt: -1 });

    // Enrich with user and gym info
    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const user = await User.findById(sub.userId).select('firstName lastName gymId');
        let gymName = 'N/A';
        if (user?.gymId) {
          const gym = await Gym.findById(user.gymId).select('name');
          gymName = gym?.name || 'N/A';
        }
        const ownerName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
        
        // Format dates as YYYY-MM-DD for the frontend table
        const start = sub.startDate ? new Date(sub.startDate).toISOString().split('T')[0] : 'N/A';
        const renewal = sub.endDate ? new Date(sub.endDate).toISOString().split('T')[0] : 'N/A';

        // Format status to match UI expectations (Title Case)
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
    );

    res.status(200).json({ success: true, subscriptions: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateSubscriptionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., 'Inactive', 'Active', 'Pending'
    
    // Normalize status to match enum
    const enumStatus = status.toUpperCase() as SubscriptionPaymentStatus;

    const subscription = await Subscription.findById(id);
    if (!subscription) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }

    subscription.status = enumStatus;
    await subscription.save();

    // If subscription is anything other than ACTIVE, suspend the user
    const isActive = (enumStatus === SubscriptionPaymentStatus.ACTIVE);
    
    const user = await User.findById(subscription.userId);
    if (user) {
      user.isActive = isActive;
      user.suspensionReason = enumStatus.charAt(0).toUpperCase() + enumStatus.slice(1).toLowerCase();
      
      // If we are specifically marking it inactive, maybe also update subscriptionStatus on user
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
