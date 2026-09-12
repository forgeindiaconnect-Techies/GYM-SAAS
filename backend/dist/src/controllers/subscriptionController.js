"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMySubscription = exports.processPayment = exports.selectPlan = void 0;
const Subscription_1 = __importStar(require("../models/Subscription"));
const User_1 = __importStar(require("../models/User"));
const PLAN_PRICING = {
    FREE_TRIAL: { monthly: 0, annual: 0, trial: 0, trialDays: 7 },
    SILVER: { monthly: 799, annual: 7999, trial: 0, trialDays: 0 },
    GOLD: { monthly: 1499, annual: 14999, trial: 0, trialDays: 0 },
    PREMIUM: { monthly: 2499, annual: 24999, trial: 0, trialDays: 0 },
};
const selectPlan = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { plan, billingCycle } = req.body;
        if (!plan || !billingCycle) {
            res.status(400).json({ success: false, message: 'Plan and billing cycle are required' });
            return;
        }
        const pricing = PLAN_PRICING[plan];
        if (!pricing) {
            res.status(400).json({ success: false, message: 'Invalid plan' });
            return;
        }
        const now = new Date();
        let endDate = new Date(now);
        let amount = 0;
        if (plan === 'FREE_TRIAL') {
            endDate.setDate(endDate.getDate() + 7);
            amount = 0;
        }
        else if (billingCycle === 'annual') {
            endDate.setFullYear(endDate.getFullYear() + 1);
            amount = pricing.annual;
        }
        else {
            endDate.setMonth(endDate.getMonth() + 1);
            amount = pricing.monthly;
        }
        // Cancel existing active subscriptions
        await Subscription_1.default.updateMany({ userId, status: Subscription_1.SubscriptionPaymentStatus.ACTIVE }, { status: Subscription_1.SubscriptionPaymentStatus.CANCELLED });
        const subscription = new Subscription_1.default({
            userId,
            plan: plan,
            billingCycle: plan === 'FREE_TRIAL' ? Subscription_1.BillingCycle.TRIAL : billingCycle,
            status: plan === 'FREE_TRIAL' ? Subscription_1.SubscriptionPaymentStatus.ACTIVE : Subscription_1.SubscriptionPaymentStatus.PENDING,
            startDate: now,
            endDate,
            amount,
        });
        await subscription.save();
        if (plan === 'FREE_TRIAL') {
            await User_1.default.findByIdAndUpdate(userId, {
                subscriptionStatus: User_1.SubscriptionStatus.TRIAL,
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.selectPlan = selectPlan;
const processPayment = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { subscriptionId } = req.body;
        if (!subscriptionId) {
            res.status(400).json({ success: false, message: 'Subscription ID is required' });
            return;
        }
        const subscription = await Subscription_1.default.findOne({ _id: subscriptionId, userId, status: Subscription_1.SubscriptionPaymentStatus.PENDING });
        if (!subscription) {
            res.status(404).json({ success: false, message: 'Pending subscription not found' });
            return;
        }
        // Simulate successful payment processing
        subscription.status = Subscription_1.SubscriptionPaymentStatus.ACTIVE;
        await subscription.save();
        await User_1.default.findByIdAndUpdate(userId, {
            subscriptionStatus: User_1.SubscriptionStatus.ACTIVE,
            subscriptionPlan: subscription.plan,
            subscriptionExpiry: subscription.endDate,
        });
        res.status(200).json({
            success: true,
            message: 'Payment processed successfully. Subscription is now active.',
            subscription,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.processPayment = processPayment;
const getMySubscription = async (req, res) => {
    try {
        const userId = req.user?.id;
        const subscription = await Subscription_1.default.findOne({
            userId,
            status: { $in: [Subscription_1.SubscriptionPaymentStatus.ACTIVE, Subscription_1.SubscriptionPaymentStatus.PENDING] }
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, subscription });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
exports.getMySubscription = getMySubscription;
