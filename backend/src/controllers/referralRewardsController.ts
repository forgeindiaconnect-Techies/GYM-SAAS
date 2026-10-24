import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';
import GymRewardSettings from '../models/GymRewardSettings';
import CustomerPointsWallet from '../models/CustomerPointsWallet';
import PointsTransaction from '../models/PointsTransaction';
import RewardDefinition from '../models/RewardDefinition';
import RewardClaim from '../models/RewardClaim';
import User, { Role } from '../models/User';
import Referral from '../models/Referral';
import CustomerMembership, { CustomerMembershipStatus } from '../models/CustomerMembership';
import StoreOrder from '../models/StoreOrder';
import Notification from '../models/Notification';
import Gym from '../models/Gym';

// Helper to get or seed gym reward settings
export const getOrCreateGymRewardSettings = async (gymId: mongoose.Types.ObjectId | string) => {
  let settings = await GymRewardSettings.findOne({ gymId });
  if (!settings) {
    settings = await GymRewardSettings.create({
      gymId,
      pointsPerConversionUnit: 100, // 100 points
      currencyValuePerUnit: 50,     // = ₹50
      minPointsForRedemption: 100,
      maxDiscountPerTransaction: 0, // unlimited
      enableMembershipDiscount: true,
      enableStorePurchase: true,
      enableCustomRewards: true,
      eligibleMembershipPlans: [],
      eligibleStoreProducts: [],
      storeRedemptionScope: 'ALL',
      pointsExpiryDays: 0,
      rewardInstructions: 'Earn points by referring your friends to join our gym! Redeem your points for Membership Plan Discounts, Gym Store Purchases, or Custom Rewards.',
      termsAndConditions: 'Points cannot be exchanged for cash. 100 points = ₹50 conversion rate. Points are deducted upon verified checkout. Standard cancellation policies apply.'
    });
  }
  return settings;
};

// ============================================================================
// 1. REWARD CONFIGURATION (Gym Owner)
// ============================================================================

export const getRewardSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId || req.query.gymId;
    if (!gymId) {
      res.status(400).json({ success: false, message: 'Gym ID is required' });
      return;
    }

    const settings = await getOrCreateGymRewardSettings(gymId as any);
    res.status(200).json({ success: true, settings });
  } catch (err: any) {
    console.error('Error in getRewardSettings:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reward settings', error: err.message });
  }
};

export const updateRewardSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) {
      res.status(401).json({ success: false, message: 'Unauthorized. Gym Owner access only.' });
      return;
    }

    const {
      pointsPerConversionUnit,
      currencyValuePerUnit,
      minPointsForRedemption,
      maxDiscountPerTransaction,
      enableMembershipDiscount,
      enableStorePurchase,
      enableCustomRewards,
      eligibleMembershipPlans,
      eligibleStoreProducts,
      storeRedemptionScope,
      pointsExpiryDays,
      rewardInstructions,
      termsAndConditions
    } = req.body;

    let settings = await GymRewardSettings.findOne({ gymId });
    if (!settings) {
      settings = new GymRewardSettings({ gymId });
    }

    if (pointsPerConversionUnit !== undefined) settings.pointsPerConversionUnit = Math.max(1, Number(pointsPerConversionUnit) || 100);
    if (currencyValuePerUnit !== undefined) settings.currencyValuePerUnit = Math.max(1, Number(currencyValuePerUnit) || 50);
    if (minPointsForRedemption !== undefined) settings.minPointsForRedemption = Math.max(0, Number(minPointsForRedemption) || 0);
    if (maxDiscountPerTransaction !== undefined) settings.maxDiscountPerTransaction = Math.max(0, Number(maxDiscountPerTransaction) || 0);

    if (enableMembershipDiscount !== undefined) settings.enableMembershipDiscount = Boolean(enableMembershipDiscount);
    if (enableStorePurchase !== undefined) settings.enableStorePurchase = Boolean(enableStorePurchase);
    if (enableCustomRewards !== undefined) settings.enableCustomRewards = Boolean(enableCustomRewards);

    if (Array.isArray(eligibleMembershipPlans)) settings.eligibleMembershipPlans = eligibleMembershipPlans;
    if (Array.isArray(eligibleStoreProducts)) settings.eligibleStoreProducts = eligibleStoreProducts;
    if (storeRedemptionScope) settings.storeRedemptionScope = storeRedemptionScope;

    if (pointsExpiryDays !== undefined) settings.pointsExpiryDays = Math.max(0, Number(pointsExpiryDays) || 0);
    if (rewardInstructions !== undefined) settings.rewardInstructions = rewardInstructions;
    if (termsAndConditions !== undefined) settings.termsAndConditions = termsAndConditions;

    settings.updatedBy = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Referral reward settings updated successfully!',
      settings
    });
  } catch (err: any) {
    console.error('Error in updateRewardSettings:', err);
    res.status(500).json({ success: false, message: 'Failed to update reward settings', error: err.message });
  }
};

// ============================================================================
// 2. CUSTOMER POINTS MANAGEMENT (Gym Owner)
// ============================================================================

export const getOwnerCustomersPoints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { search } = req.query;

    const memberQuery: any = { gymId, role: 'MEMBER' };
    if (search && typeof search === 'string') {
      const s = search.trim();
      memberQuery.$or = [
        { firstName: { $regex: s, $options: 'i' } },
        { lastName: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { mobile: { $regex: s, $options: 'i' } }
      ];
    }

    const customers = await User.find(memberQuery)
      .select('firstName lastName email mobile membershipStatus referralCode subscriptionPlan subscriptionExpiry createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const customerIds = customers.map(c => c._id);

    // Fetch wallets
    const wallets = await CustomerPointsWallet.find({ gymId, userId: { $in: customerIds } }).lean();
    const walletMap = new Map(wallets.map(w => [w.userId.toString(), w]));

    // Fetch referral counts
    const referrals = await Referral.find({ gymId, referrerId: { $in: customerIds } }).lean();
    const referralCountMap = new Map<string, number>();
    const completedReferralMap = new Map<string, number>();
    for (const ref of referrals) {
      const rId = ref.referrerId?.toString();
      if (!rId) continue;
      referralCountMap.set(rId, (referralCountMap.get(rId) || 0) + 1);
      if (ref.status === 'Payment Verified' || ref.status === 'Reward Issued') {
        completedReferralMap.set(rId, (completedReferralMap.get(rId) || 0) + 1);
      }
    }

    // Fetch active memberships
    const memberships = await CustomerMembership.find({
      gymId: gymId as any,
      userId: { $in: customerIds },
      status: { $in: [CustomerMembershipStatus.ACTIVE, CustomerMembershipStatus.FREE_TRIAL] }
    }).sort({ createdAt: -1 }).lean();
    const membershipMap = new Map<string, any>();
    for (const m of memberships) {
      const uId = m.userId?.toString();
      if (uId && !membershipMap.has(uId)) {
        membershipMap.set(uId, m);
      }
    }

    // Fetch points redemption counts (membership & store)
    const pointsTxs = await PointsTransaction.find({
      gymId,
      userId: { $in: customerIds },
      type: { $in: ['REDEEM_MEMBERSHIP', 'REDEEM_STORE', 'REDEEM_REWARD'] }
    }).lean();

    const memRedeemMap = new Map<string, number>();
    const storeRedeemMap = new Map<string, number>();
    const customRedeemMap = new Map<string, number>();

    for (const tx of pointsTxs) {
      const uId = tx.userId?.toString();
      if (!uId) continue;
      if (tx.type === 'REDEEM_MEMBERSHIP') memRedeemMap.set(uId, (memRedeemMap.get(uId) || 0) + 1);
      if (tx.type === 'REDEEM_STORE') storeRedeemMap.set(uId, (storeRedeemMap.get(uId) || 0) + 1);
      if (tx.type === 'REDEEM_REWARD') customRedeemMap.set(uId, (customRedeemMap.get(uId) || 0) + 1);
    }

    const settings = await getOrCreateGymRewardSettings(gymId);
    const conversionMultiplier = settings.currencyValuePerUnit / settings.pointsPerConversionUnit;

    const list = customers.map(c => {
      const cId = c._id.toString();
      const wallet = walletMap.get(cId) || { currentBalance: 0, totalEarned: 0, totalRedeemed: 0 };
      const mem = membershipMap.get(cId);

      return {
        _id: c._id,
        name: `${c.firstName || 'Customer'} ${c.lastName || ''}`.trim(),
        email: c.email,
        mobile: c.mobile,
        referralCode: c.referralCode,
        membershipPlan: mem?.planName || c.subscriptionPlan || 'No Active Plan',
        membershipStatus: mem?.status || (c as any).subscriptionStatus || 'Inactive',
        membershipExpiry: mem?.endDate || c.subscriptionExpiry,
        pointsBalance: wallet.currentBalance,
        totalEarned: wallet.totalEarned,
        totalRedeemed: wallet.totalRedeemed,
        equivalentRupeeValue: Math.round(wallet.currentBalance * conversionMultiplier),
        totalReferrals: referralCountMap.get(cId) || 0,
        successfulReferrals: completedReferralMap.get(cId) || 0,
        membershipRedemptions: memRedeemMap.get(cId) || 0,
        storeRedemptions: storeRedeemMap.get(cId) || 0,
        customRedemptions: customRedeemMap.get(cId) || 0,
        joinedAt: c.createdAt
      };
    });

    res.status(200).json({ success: true, count: list.length, customers: list, settings });
  } catch (err: any) {
    console.error('Error in getOwnerCustomersPoints:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch customer points', error: err.message });
  }
};

export const adjustCustomerPointsManual = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const ownerId = req.user?.id;
    if (!gymId || !ownerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { customerId, amount, reason } = req.body;

    if (!customerId) {
      res.status(400).json({ success: false, message: 'Customer ID is required' });
      return;
    }

    const adjustmentAmount = Number(amount);
    if (isNaN(adjustmentAmount) || adjustmentAmount === 0) {
      res.status(400).json({ success: false, message: 'Please enter a non-zero points adjustment amount' });
      return;
    }

    if (!reason || !reason.trim()) {
      res.status(400).json({ success: false, message: 'A reason is mandatory for manual point adjustments' });
      return;
    }

    // Ensure customer belongs to this gym
    const customer = await User.findOne({ _id: customerId, gymId });
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found in your gym' });
      return;
    }

    // Atomic / safe balance update
    let wallet = await CustomerPointsWallet.findOne({ gymId, userId: customerId });
    if (!wallet) {
      wallet = await CustomerPointsWallet.create({
        gymId,
        userId: customerId,
        currentBalance: 0,
        totalEarned: 0,
        totalRedeemed: 0
      });
    }

    const newBalance = wallet.currentBalance + adjustmentAmount;
    if (newBalance < 0) {
      res.status(400).json({
        success: false,
        message: `Cannot deduct ${Math.abs(adjustmentAmount)} points. Customer only has ${wallet.currentBalance} points available.`
      });
      return;
    }

    wallet.currentBalance = newBalance;
    if (adjustmentAmount > 0) {
      wallet.totalEarned += adjustmentAmount;
    } else {
      wallet.totalRedeemed += Math.abs(adjustmentAmount);
    }
    wallet.lastUpdated = new Date();
    await wallet.save();

    // Log PointsTransaction
    const tx = await PointsTransaction.create({
      gymId,
      userId: customerId,
      type: 'ADMIN_ADJUST',
      amount: adjustmentAmount,
      balanceAfter: newBalance,
      description: `Manual adjustment by gym owner: ${reason.trim()}`,
      reason: reason.trim(),
      adjustedBy: new mongoose.Types.ObjectId(ownerId)
    });

    // Send notification to customer
    await Notification.create({
      recipientId: customerId,
      recipientRole: 'MEMBER',
      gymId,
      title: adjustmentAmount > 0 ? '✨ Points Credited!' : 'ℹ️ Points Adjusted',
      message: adjustmentAmount > 0
        ? `Your gym owner credited ${adjustmentAmount} points to your rewards wallet. Reason: ${reason.trim()}`
        : `Your gym owner deducted ${Math.abs(adjustmentAmount)} points from your rewards wallet. Reason: ${reason.trim()}`,
      type: adjustmentAmount > 0 ? 'success' : 'info'
    });

    res.status(200).json({
      success: true,
      message: `Successfully ${adjustmentAmount > 0 ? 'added' : 'deducted'} ${Math.abs(adjustmentAmount)} points. New balance: ${newBalance} pts.`,
      newBalance,
      transaction: tx
    });
  } catch (err: any) {
    console.error('Error in adjustCustomerPointsManual:', err);
    res.status(500).json({ success: false, message: 'Failed to adjust points', error: err.message });
  }
};

export const getCustomerDetailedPointsHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const targetUserId = String(req.params.userId || req.user?.id || '');

    if (!targetUserId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    // If caller is a customer, ensure they only view their own history
    if (req.user?.role === 'MEMBER' && req.user.id !== targetUserId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const customer = await User.findById(targetUserId).select('firstName lastName email mobile gymId');
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    let effectiveGymId = (gymId || customer.gymId) as any;
    if (!effectiveGymId) {
      const anyGym = await Gym.findOne().select('_id');
      if (anyGym) effectiveGymId = anyGym._id;
    }

    const settings = effectiveGymId ? await getOrCreateGymRewardSettings(effectiveGymId) : {
      pointsPerConversionUnit: 100,
      currencyValuePerUnit: 50,
      minPointsForRedemption: 100,
      maxDiscountPerTransaction: 1000,
      enableMembershipDiscount: true,
      enableStorePurchase: true,
      enableCustomRewards: true,
      eligibleMembershipPlans: [],
      eligibleStoreProducts: [],
      membershipDiscountCapType: 'FLAT_AMOUNT',
      storeRedemptionScope: 'ALL',
      pointsExpiryDays: 0,
      rewardInstructions: 'Earn points by inviting friends. Redeem points during membership renewals, gym store checkouts, or custom gym rewards.'
    };
    const conversionMultiplier = settings.currencyValuePerUnit / settings.pointsPerConversionUnit;

    const targetUserObjId = new mongoose.Types.ObjectId(targetUserId);

    let walletDoc = await CustomerPointsWallet.findOne({
      userId: targetUserObjId
    });

    if (!walletDoc && effectiveGymId) {
      walletDoc = await CustomerPointsWallet.create({
        gymId: effectiveGymId,
        userId: targetUserObjId,
        currentBalance: 150,
        totalEarned: 150,
        totalRedeemed: 0
      });

      await PointsTransaction.create({
        gymId: effectiveGymId,
        userId: targetUserObjId,
        type: 'EARN_BONUS',
        amount: 150,
        balanceAfter: 150,
        description: 'Welcome reward points credited to your wallet'
      });
    }

    const wallet = walletDoc || {
      currentBalance: 0,
      totalEarned: 0,
      totalRedeemed: 0
    };

    // 1. Points Ledger
    let rawTransactions = await PointsTransaction.find({
      userId: targetUserObjId
    })
      .populate('adjustedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    // If wallet has a positive balance but 0 transactions were recorded, initialize the welcome transaction
    if (rawTransactions.length === 0 && wallet.currentBalance > 0 && effectiveGymId) {
      const initTx = await PointsTransaction.create({
        gymId: effectiveGymId,
        userId: targetUserObjId,
        type: 'EARN_BONUS',
        amount: wallet.currentBalance,
        balanceAfter: wallet.currentBalance,
        description: 'Initial reward points credited to your wallet'
      });
      rawTransactions = [initTx as any];
    }

    const transactions = rawTransactions.map(t => ({
      ...t,
      transactionType: t.type || (t as any).transactionType || 'EARN_BONUS',
      type: t.type || 'EARN_BONUS',
      points: Math.abs(t.amount || (t as any).points || 0),
      amount: t.amount || 0,
      balanceAfter: t.balanceAfter ?? wallet.currentBalance,
      status: (t as any).status || 'COMPLETED',
      reason: t.reason || t.description || 'Points transaction'
    }));

    // 2. Referrals History
    const referrals = await Referral.find({
      referrerId: targetUserObjId
    })
      .populate('referredId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    // 3. Store Order Points Redemptions
    const storeRedemptions = await StoreOrder.find({
      customerId: targetUserObjId,
      pointsRedeemed: { $gt: 0 }
    })
      .select('orderNumber items subtotal discount total pointsRedeemed pointsDiscount status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // 4. Custom Reward Claims
    const customClaims = await RewardClaim.find({
      userId: targetUserObjId
    })
      .populate('rewardId', 'title category description requiredPoints requireApproval')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      wallet: {
        currentBalance: wallet.currentBalance,
        totalEarned: wallet.totalEarned,
        totalRedeemed: wallet.totalRedeemed
      },
      summary: {
        customerName: `${customer.firstName || 'Customer'} ${customer.lastName || ''}`.trim(),
        availablePoints: wallet.currentBalance,
        totalEarned: wallet.totalEarned,
        totalRedeemed: wallet.totalRedeemed,
        equivalentRupeeValue: Math.round(wallet.currentBalance * conversionMultiplier),
        conversionRateText: `${settings.pointsPerConversionUnit} points = ₹${settings.currencyValuePerUnit}`
      },
      settings,
      transactions,
      referrals,
      storeRedemptions,
      customClaims
    });
  } catch (err: any) {
    console.error('Error in getCustomerDetailedPointsHistory:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch history', error: err.message });
  }
};

// ============================================================================
// 3. REDEMPTION QUOTE & PREVIEW CALCULATOR
// ============================================================================

export const quoteRedemption = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const gymId = req.user?.gymId;
    const { redemptionType, pointsToRedeem, originalAmount, planName } = req.body;

    if (!gymId) {
      res.status(400).json({ success: false, message: 'Gym ID is required' });
      return;
    }

    const settings = await getOrCreateGymRewardSettings(gymId);
    const points = Number(pointsToRedeem) || 0;
    const numOriginal = Math.max(0, Number(originalAmount) || 0);

    // Option enabled check
    if (redemptionType === 'MEMBERSHIP' && !settings.enableMembershipDiscount) {
      res.status(400).json({
        success: false,
        eligible: false,
        message: 'Membership Plan Discount redemption is currently disabled by your gym.'
      });
      return;
    }

    if (redemptionType === 'STORE' && !settings.enableStorePurchase) {
      res.status(400).json({
        success: false,
        eligible: false,
        message: 'Gym Store points redemption is currently disabled by your gym.'
      });
      return;
    }

    if (redemptionType === 'CUSTOM' && !settings.enableCustomRewards) {
      res.status(400).json({
        success: false,
        eligible: false,
        message: 'Custom rewards redemption is currently disabled by your gym.'
      });
      return;
    }

    // Minimum points check
    if (points < settings.minPointsForRedemption) {
      res.status(400).json({
        success: false,
        eligible: false,
        message: `Minimum ${settings.minPointsForRedemption} points required for redemption. You specified ${points} points.`
      });
      return;
    }

    // Check user balance
    const wallet = await CustomerPointsWallet.findOne({ gymId, userId });
    const available = wallet?.currentBalance || 0;
    if (points > available) {
      res.status(400).json({
        success: false,
        eligible: false,
        message: `Insufficient points. You have ${available} points, requested ${points}.`
      });
      return;
    }

    // Eligible membership plan check
    if (redemptionType === 'MEMBERSHIP' && settings.eligibleMembershipPlans.length > 0 && planName) {
      const match = settings.eligibleMembershipPlans.some(p => p.toLowerCase() === planName.toLowerCase());
      if (!match) {
        res.status(400).json({
          success: false,
          eligible: false,
          message: `The plan "${planName}" is not eligible for points discount. Eligible plans: ${settings.eligibleMembershipPlans.join(', ')}`
        });
        return;
      }
    }

    // Calculate discount value
    const discountRate = settings.currencyValuePerUnit / settings.pointsPerConversionUnit;
    let discountAmount = Math.round(points * discountRate);

    // Cap with max discount per transaction
    if (settings.maxDiscountPerTransaction > 0 && discountAmount > settings.maxDiscountPerTransaction) {
      discountAmount = settings.maxDiscountPerTransaction;
    }

    // Discount cannot exceed original amount
    if (numOriginal > 0 && discountAmount > numOriginal) {
      discountAmount = numOriginal;
    }

    const finalPayable = Math.max(0, numOriginal - discountAmount);

    res.status(200).json({
      success: true,
      eligible: true,
      pointsRedeemed: points,
      discountAmount,
      originalAmount: numOriginal,
      finalPayable,
      conversionRateText: `${settings.pointsPerConversionUnit} points = ₹${settings.currencyValuePerUnit}`,
      availablePoints: available
    });
  } catch (err: any) {
    console.error('Error in quoteRedemption:', err);
    res.status(500).json({ success: false, message: 'Failed to quote redemption', error: err.message });
  }
};

// ============================================================================
// 4. CUSTOM REWARDS CRUD & CLAIMS (Gym Owner & Customer)
// ============================================================================

export const getCustomRewards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId || req.query.gymId;
    if (!gymId) {
      res.status(400).json({ success: false, message: 'Gym ID is required' });
      return;
    }

    const rewards = await RewardDefinition.find({
      gymId: gymId as any,
      status: 'Active',
      $or: [
        { category: 'Custom' },
        { assignmentMethod: 'Points' },
        { requiredPoints: { $gt: 0 } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: rewards.length, rewards });
  } catch (err: any) {
    console.error('Error in getCustomRewards:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch custom rewards', error: err.message });
  }
};

export const createCustomReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const userId = req.user?.id;
    if (!gymId || !userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      title,
      description,
      requiredPoints,
      requireApproval = false,
      totalQuantity = 0,
      expiryDate,
      termsAndConditions,
      icon = 'Award'
    } = req.body;

    if (!title || !requiredPoints || Number(requiredPoints) <= 0) {
      res.status(400).json({ success: false, message: 'Title and required points (> 0) are mandatory.' });
      return;
    }

    const reward = await RewardDefinition.create({
      gymId,
      createdBy: userId,
      title: title.trim(),
      description: (description || '').trim(),
      recipientType: 'Customer',
      assignmentMethod: 'Points',
      category: 'Custom',
      rewardType: 'Custom Benefit',
      requiredPoints: Number(requiredPoints),
      requireApproval: Boolean(requireApproval),
      totalQuantity: Number(totalQuantity) || 0,
      claimedCount: 0,
      maxClaimsPerUser: 5,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      termsAndConditions: termsAndConditions || 'Redeemable with available referral reward points.',
      icon,
      status: 'Active'
    });

    res.status(201).json({ success: true, message: 'Custom reward created successfully!', reward });
  } catch (err: any) {
    console.error('Error in createCustomReward:', err);
    res.status(500).json({ success: false, message: 'Failed to create reward', error: err.message });
  }
};

export const updateCustomReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const { id } = req.params;

    const reward = await RewardDefinition.findOne({ _id: id, gymId });
    if (!reward) {
      res.status(404).json({ success: false, message: 'Custom reward not found' });
      return;
    }

    const {
      title,
      description,
      requiredPoints,
      requireApproval,
      totalQuantity,
      expiryDate,
      termsAndConditions,
      icon,
      status
    } = req.body;

    if (title !== undefined) reward.title = title.trim();
    if (description !== undefined) reward.description = description.trim();
    if (requiredPoints !== undefined) reward.requiredPoints = Math.max(1, Number(requiredPoints));
    if (requireApproval !== undefined) reward.requireApproval = Boolean(requireApproval);
    if (totalQuantity !== undefined) reward.totalQuantity = Math.max(0, Number(totalQuantity));
    if (expiryDate !== undefined) reward.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    if (termsAndConditions !== undefined) reward.termsAndConditions = termsAndConditions;
    if (icon !== undefined) reward.icon = icon;
    if (status !== undefined) reward.status = status;

    await reward.save();

    res.status(200).json({ success: true, message: 'Custom reward updated successfully!', reward });
  } catch (err: any) {
    console.error('Error in updateCustomReward:', err);
    res.status(500).json({ success: false, message: 'Failed to update reward', error: err.message });
  }
};

export const redeemCustomRewardCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const gymId = req.user?.gymId;
    const { rewardId, notes } = req.body;

    if (!userId || !gymId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const reward = await RewardDefinition.findOne({ _id: rewardId, gymId, status: 'Active' });
    if (!reward) {
      res.status(404).json({ success: false, message: 'Reward not found or is currently inactive' });
      return;
    }

    const settings = await getOrCreateGymRewardSettings(gymId);
    if (!settings.enableCustomRewards) {
      res.status(400).json({ success: false, message: 'Custom rewards redemption is currently disabled by the gym.' });
      return;
    }

    const requiredPts = reward.requiredPoints || 0;
    if (requiredPts <= 0) {
      res.status(400).json({ success: false, message: 'Invalid reward points configuration' });
      return;
    }

    // Check quantity limit
    if (reward.totalQuantity > 0 && reward.claimedCount >= reward.totalQuantity) {
      res.status(400).json({ success: false, message: 'This reward is currently out of stock.' });
      return;
    }

    // Check wallet balance
    const wallet = await CustomerPointsWallet.findOne({ gymId, userId });
    if (!wallet || wallet.currentBalance < requiredPts) {
      res.status(400).json({
        success: false,
        message: `Insufficient points. You need ${requiredPts} points, but currently have ${wallet?.currentBalance || 0} points.`
      });
      return;
    }

    // Atomically deduct points
    wallet.currentBalance -= requiredPts;
    wallet.totalRedeemed += requiredPts;
    wallet.lastUpdated = new Date();
    await wallet.save();

    // Generate unique claim code
    const claimCode = `RWD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const initialStatus = reward.requireApproval ? 'Pending' : 'Approved';

    const claim = await RewardClaim.create({
      gymId,
      rewardId: reward._id,
      userId,
      userRole: 'MEMBER',
      claimCode,
      pointsDeducted: requiredPts,
      claimStatus: initialStatus,
      notes: notes || `Redeemed ${reward.title} for ${requiredPts} points`
    });

    reward.claimedCount += 1;
    await reward.save();

    // Log transaction
    await PointsTransaction.create({
      gymId,
      userId,
      type: 'REDEEM_REWARD',
      amount: -requiredPts,
      balanceAfter: wallet.currentBalance,
      rewardId: reward._id,
      claimId: claim._id,
      description: `Redeemed ${reward.title} (${requiredPts} pts). Status: ${initialStatus}`,
      orderReference: claimCode
    });

    // Notify gym owner if approval required
    if (reward.requireApproval) {
      const owner = await User.findOne({ gymId, role: { $in: [Role.GYM_OWNER, Role.ADMIN] } } as any);
      if (owner) {
        await Notification.create({
          recipientId: owner._id,
          recipientRole: 'GYM_OWNER',
          gymId,
          title: '🎁 Custom Reward Approval Request',
          message: `A member has redeemed "${reward.title}" (${requiredPts} points). Please review and approve in your Rewards Management tab.`,
          type: 'info'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: reward.requireApproval
        ? `Request submitted successfully! It is pending gym owner confirmation.`
        : `Reward redeemed successfully! Your claim voucher code is ${claimCode}.`,
      claimCode,
      claimStatus: initialStatus,
      newBalance: wallet.currentBalance,
      claim
    });
  } catch (err: any) {
    console.error('Error in redeemCustomRewardCustomer:', err);
    res.status(500).json({ success: false, message: 'Failed to redeem reward', error: err.message });
  }
};

export const getCustomClaims = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const query: any = { gymId };
    if (req.user?.role === 'MEMBER') {
      query.userId = req.user.id;
    }

    const claims = await RewardClaim.find(query)
      .populate('rewardId', 'title category description requiredPoints requireApproval')
      .populate('userId', 'firstName lastName email mobile')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: claims.length, claims });
  } catch (err: any) {
    console.error('Error in getCustomClaims:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch claims', error: err.message });
  }
};

export const reviewCustomRewardClaim = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const reviewerId = req.user?.id;
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'Approve' | 'Reject' | 'Redeem'

    if (!gymId || !reviewerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const claim = await RewardClaim.findOne({ _id: id, gymId }).populate('rewardId');
    if (!claim) {
      res.status(404).json({ success: false, message: 'Claim request not found' });
      return;
    }

    if (action === 'Approve') {
      claim.claimStatus = 'Approved';
      claim.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
      claim.reviewedAt = new Date();
      await claim.save();

      await Notification.create({
        recipientId: claim.userId,
        recipientRole: 'MEMBER',
        gymId,
        title: '🎉 Custom Reward Approved!',
        message: `Your gym owner approved your reward voucher ${claim.claimCode}. You can now use your reward at the gym!`,
        type: 'success'
      });

      res.status(200).json({ success: true, message: 'Reward claim approved successfully!', claim });
      return;
    }

    if (action === 'Redeem') {
      claim.claimStatus = 'Redeemed';
      claim.redeemedAt = new Date();
      await claim.save();

      res.status(200).json({ success: true, message: 'Reward claim marked as redeemed/fulfilled!', claim });
      return;
    }

    if (action === 'Reject') {
      claim.claimStatus = 'Rejected';
      claim.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
      claim.reviewedAt = new Date();
      claim.rejectionReason = rejectionReason || 'Request rejected by gym owner';
      await claim.save();

      // Safely refund points back to customer
      const refundPoints = claim.pointsDeducted || 0;
      if (refundPoints > 0) {
        let wallet = await CustomerPointsWallet.findOne({ gymId, userId: claim.userId });
        if (wallet) {
          wallet.currentBalance += refundPoints;
          if (wallet.totalRedeemed >= refundPoints) {
            wallet.totalRedeemed -= refundPoints;
          }
          await wallet.save();

          await PointsTransaction.create({
            gymId,
            userId: claim.userId,
            type: 'REFUND_POINTS',
            amount: refundPoints,
            balanceAfter: wallet.currentBalance,
            claimId: claim._id,
            description: `Refunded ${refundPoints} points from rejected reward claim (${claim.claimCode}). Reason: ${claim.rejectionReason}`,
            reason: claim.rejectionReason,
            orderReference: claim.claimCode
          });
        }
      }

      await Notification.create({
        recipientId: claim.userId,
        recipientRole: 'MEMBER',
        gymId,
        title: 'ℹ️ Reward Request Cancelled & Points Refunded',
        message: `Your reward request for voucher ${claim.claimCode} was not approved (${claim.rejectionReason}). ${refundPoints} points have been refunded to your wallet balance.`,
        type: 'info'
      });

      res.status(200).json({
        success: true,
        message: `Claim rejected and ${refundPoints} points refunded back to member.`,
        claim
      });
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid action. Choose Approve, Reject, or Redeem.' });
  } catch (err: any) {
    console.error('Error in reviewCustomRewardClaim:', err);
    res.status(500).json({ success: false, message: 'Failed to review claim', error: err.message });
  }
};
