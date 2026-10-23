import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';
import RewardDefinition, { IRewardDefinition } from '../models/RewardDefinition';
import RewardClaim from '../models/RewardClaim';
import CustomerPointsWallet from '../models/CustomerPointsWallet';
import PointsTransaction from '../models/PointsTransaction';
import ChallengeParticipant from '../models/ChallengeParticipant';
import TrainerSession from '../models/TrainerSession';
import User from '../models/User';
import Notification from '../models/Notification';
import StoreProduct from '../models/StoreProduct';
import GymPackage from '../models/GymPackage';
import WorkoutProgress from '../models/WorkoutProgress';
import ProgressLog from '../models/ProgressLog';

// Helper: Generate unique Claim Voucher Code (e.g. RWD-7K2X9P)
const generateClaimCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'RWD-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ==========================================
// GYM OWNER CONTROLLER ACTIONS
// ==========================================

// Create a reward
export const createReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const {
      title,
      description,
      recipientType,
      assignmentMethod,
      category,
      rewardType,
      // Direct assignment targets
      assignedUserId,
      assignedUserIds,
      // Category A: Personal Training
      trainerId,
      sessionCount,
      sessionDuration,
      // Category B: Discount Coupon
      discountType,
      discountValue,
      applicableService,
      minPurchaseAmount,
      // Category C: Free Product / Gift
      productId,
      productName,
      productQuantity,
      // Category D: Free Membership / Extension
      membershipDuration,
      packageId,
      packageName,
      // Category E: Performance Award
      awardReason,
      achievementPeriod,
      hasCertificate,
      badgeIcon,
      // Category F: Points-Based & Conditions
      requiredPoints,
      redemptionBenefit,
      eligibilityCondition,
      requiredChallengeId,
      minCompletedSessions,
      minAverageRating,
      minVerifiedVisits,
      minWorkoutCompletions,
      minStreakDays,
      minDietAdherenceDays,
      minReviewedPlans,
      bonusAmount,
      currency,
      startDate,
      expiryDate,
      totalQuantity,
      maxClaimsPerUser,
      requireApproval,
      termsAndConditions,
      status
    } = req.body;

    if (!title || !description || !category) {
      res.status(400).json({ success: false, message: 'Title, description and category are required' });
      return;
    }

    const method = assignmentMethod || (requiredPoints && Number(requiredPoints) > 0 ? 'Points' : 'Achievement');

    // Validation for Direct Assignment
    if (method === 'Direct' && !assignedUserId && (!assignedUserIds || assignedUserIds.length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Recipient selection is required for Direct Assignment'
      });
      return;
    }

    // Validation for Product / Gift Inventory Availability
    if (productId) {
      const storeProd = await StoreProduct.findOne({ _id: productId, gymId });
      if (!storeProd) {
        res.status(400).json({ success: false, message: 'Selected gym store product was not found' });
        return;
      }
      const neededQty = productQuantity ? Number(productQuantity) : 1;
      if (storeProd.stock < neededQty) {
        res.status(400).json({
          success: false,
          message: `Cannot assign product reward: Insufficient stock. Available: ${storeProd.stock}, Requested: ${neededQty}`
        });
        return;
      }
    }

    const reward = await RewardDefinition.create({
      gymId,
      createdBy: userId,
      title: title.trim(),
      description: description.trim(),
      recipientType: recipientType || 'Customer',
      assignmentMethod: method,
      category: category.trim(),
      rewardType: rewardType || 'Reward',
      assignedUserId: assignedUserId || undefined,
      assignedUserIds: assignedUserIds || (assignedUserId ? [assignedUserId] : []),
      trainerId: trainerId || undefined,
      sessionCount: sessionCount !== undefined ? Number(sessionCount) : 0,
      sessionDuration: sessionDuration?.trim(),
      discountType: discountType || 'Percentage',
      discountValue: discountValue !== undefined ? Number(discountValue) : 0,
      applicableService: applicableService || 'All Services',
      minPurchaseAmount: minPurchaseAmount !== undefined ? Number(minPurchaseAmount) : 0,
      productId: productId || undefined,
      productName: productName?.trim(),
      productQuantity: productQuantity !== undefined ? Number(productQuantity) : 1,
      membershipDuration: membershipDuration?.trim(),
      packageId: packageId || undefined,
      packageName: packageName?.trim(),
      awardReason: awardReason?.trim(),
      achievementPeriod: achievementPeriod?.trim(),
      hasCertificate: Boolean(hasCertificate),
      badgeIcon: badgeIcon?.trim(),
      requiredPoints: method === 'Points' && requiredPoints !== undefined ? Number(requiredPoints) : 0,
      redemptionBenefit: redemptionBenefit?.trim(),
      eligibilityCondition: eligibilityCondition || 'points',
      requiredChallengeId: requiredChallengeId || undefined,
      minCompletedSessions: minCompletedSessions !== undefined ? Number(minCompletedSessions) : 0,
      minAverageRating: minAverageRating !== undefined ? Number(minAverageRating) : 0,
      minVerifiedVisits: minVerifiedVisits !== undefined ? Number(minVerifiedVisits) : 0,
      minWorkoutCompletions: minWorkoutCompletions !== undefined ? Number(minWorkoutCompletions) : 0,
      minStreakDays: minStreakDays !== undefined ? Number(minStreakDays) : 0,
      minDietAdherenceDays: minDietAdherenceDays !== undefined ? Number(minDietAdherenceDays) : 0,
      minReviewedPlans: minReviewedPlans !== undefined ? Number(minReviewedPlans) : 0,
      bonusAmount: bonusAmount !== undefined ? Number(bonusAmount) : 0,
      currency: currency || 'INR',
      startDate: startDate ? new Date(startDate) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      totalQuantity: totalQuantity !== undefined ? Number(totalQuantity) : 0,
      maxClaimsPerUser: maxClaimsPerUser !== undefined ? Number(maxClaimsPerUser) : 1,
      requireApproval: Boolean(requireApproval),
      termsAndConditions: termsAndConditions?.trim(),
      status: status || 'Active'
    });

    res.status(201).json({ success: true, reward, message: 'Reward created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all rewards for Gym Owner + claims summary
export const getOwnerRewards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const [rewards, claims] = await Promise.all([
      RewardDefinition.find({ gymId })
        .populate('requiredChallengeId', 'title challengeType')
        .populate('assignedUserId', 'firstName lastName email phone role')
        .populate('trainerId', 'firstName lastName email phone')
        .populate('productId', 'name image stock sellingPrice')
        .populate('packageId', 'name duration monthlyPrice')
        .sort({ createdAt: -1 }),
      RewardClaim.find({ gymId })
        .populate('rewardId')
        .populate('userId', 'firstName lastName email role phone profilePicture')
        .populate('challengeId', 'title')
        .populate('reviewedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
    ]);

    res.status(200).json({ success: true, rewards, claims });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update reward definition
export const updateReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user?.id).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    const reward = await RewardDefinition.findOne({ _id: id, gymId });
    if (!reward) {
      res.status(404).json({ success: false, message: 'Reward not found' });
      return;
    }

    const {
      title,
      description,
      recipientType,
      assignmentMethod,
      category,
      rewardType,
      assignedUserId,
      assignedUserIds,
      trainerId,
      sessionCount,
      sessionDuration,
      discountType,
      discountValue,
      applicableService,
      minPurchaseAmount,
      productId,
      productName,
      productQuantity,
      membershipDuration,
      packageId,
      packageName,
      awardReason,
      achievementPeriod,
      hasCertificate,
      badgeIcon,
      requiredPoints,
      redemptionBenefit,
      eligibilityCondition,
      requiredChallengeId,
      minCompletedSessions,
      minAverageRating,
      minVerifiedVisits,
      minWorkoutCompletions,
      minStreakDays,
      minDietAdherenceDays,
      minReviewedPlans,
      bonusAmount,
      currency,
      startDate,
      expiryDate,
      totalQuantity,
      maxClaimsPerUser,
      requireApproval,
      termsAndConditions,
      status
    } = req.body;

    if (title) reward.title = title.trim();
    if (description) reward.description = description.trim();
    if (recipientType) reward.recipientType = recipientType;
    if (assignmentMethod) reward.assignmentMethod = assignmentMethod;
    if (category) reward.category = category.trim();
    if (rewardType) reward.rewardType = rewardType;
    if (assignedUserId !== undefined) reward.assignedUserId = assignedUserId || undefined;
    if (assignedUserIds !== undefined) reward.assignedUserIds = assignedUserIds;
    if (trainerId !== undefined) reward.trainerId = trainerId || undefined;
    if (sessionCount !== undefined) reward.sessionCount = Number(sessionCount);
    if (sessionDuration !== undefined) reward.sessionDuration = sessionDuration;
    if (discountType !== undefined) reward.discountType = discountType;
    if (discountValue !== undefined) reward.discountValue = Number(discountValue);
    if (applicableService !== undefined) reward.applicableService = applicableService;
    if (minPurchaseAmount !== undefined) reward.minPurchaseAmount = Number(minPurchaseAmount);
    if (productId !== undefined) reward.productId = productId || undefined;
    if (productName !== undefined) reward.productName = productName;
    if (productQuantity !== undefined) reward.productQuantity = Number(productQuantity);
    if (membershipDuration !== undefined) reward.membershipDuration = membershipDuration;
    if (packageId !== undefined) reward.packageId = packageId || undefined;
    if (packageName !== undefined) reward.packageName = packageName;
    if (awardReason !== undefined) reward.awardReason = awardReason;
    if (achievementPeriod !== undefined) reward.achievementPeriod = achievementPeriod;
    if (hasCertificate !== undefined) reward.hasCertificate = Boolean(hasCertificate);
    if (badgeIcon !== undefined) reward.badgeIcon = badgeIcon;
    if (requiredPoints !== undefined) reward.requiredPoints = Number(requiredPoints);
    if (redemptionBenefit !== undefined) reward.redemptionBenefit = redemptionBenefit;
    if (eligibilityCondition !== undefined) reward.eligibilityCondition = eligibilityCondition;
    if (requiredChallengeId !== undefined) reward.requiredChallengeId = requiredChallengeId || undefined;
    if (minCompletedSessions !== undefined) reward.minCompletedSessions = Number(minCompletedSessions);
    if (minAverageRating !== undefined) reward.minAverageRating = Number(minAverageRating);
    if (minVerifiedVisits !== undefined) reward.minVerifiedVisits = Number(minVerifiedVisits);
    if (minWorkoutCompletions !== undefined) reward.minWorkoutCompletions = Number(minWorkoutCompletions);
    if (minStreakDays !== undefined) reward.minStreakDays = Number(minStreakDays);
    if (minDietAdherenceDays !== undefined) reward.minDietAdherenceDays = Number(minDietAdherenceDays);
    if (minReviewedPlans !== undefined) reward.minReviewedPlans = Number(minReviewedPlans);
    if (bonusAmount !== undefined) reward.bonusAmount = Number(bonusAmount);
    if (currency) reward.currency = currency;
    if (startDate) reward.startDate = new Date(startDate);
    if (expiryDate) reward.expiryDate = new Date(expiryDate);
    if (totalQuantity !== undefined) reward.totalQuantity = Number(totalQuantity);
    if (maxClaimsPerUser !== undefined) reward.maxClaimsPerUser = Number(maxClaimsPerUser);
    if (requireApproval !== undefined) reward.requireApproval = Boolean(requireApproval);
    if (termsAndConditions !== undefined) reward.termsAndConditions = termsAndConditions?.trim();
    if (status) reward.status = status;

    await reward.save();
    res.status(200).json({ success: true, reward, message: 'Reward updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete or pause reward
export const deleteReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user?.id).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    const reward = await RewardDefinition.findOne({ _id: id, gymId });
    if (!reward) {
      res.status(404).json({ success: false, message: 'Reward not found' });
      return;
    }

    // Check if there are existing claims
    const claimCount = await RewardClaim.countDocuments({ rewardId: id });
    if (claimCount > 0) {
      // Just mark expired so history is preserved
      reward.status = 'Expired';
      await reward.save();
      res.status(200).json({
        success: true,
        message: 'Reward has existing claims and was marked Expired to preserve audit records'
      });
      return;
    }

    await RewardDefinition.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Reward deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Owner approves/rejects claim or updates financial payout
export const updateClaimStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { claimId } = req.params;
    const {
      claimStatus,
      rejectionReason,
      financialPayoutStatus,
      financialPayoutReference,
      notes
    } = req.body;

    const ownerId = req.user?.id;
    const user = await User.findById(ownerId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    const claim = await RewardClaim.findOne({ _id: claimId, gymId }).populate('rewardId');
    if (!claim) {
      res.status(404).json({ success: false, message: 'Claim not found' });
      return;
    }

    const prevStatus = claim.claimStatus;
    if (claimStatus) claim.claimStatus = claimStatus;
    if (rejectionReason) claim.rejectionReason = rejectionReason;
    if (notes) claim.notes = notes;

    claim.reviewedBy = new mongoose.Types.ObjectId(ownerId);
    claim.reviewedAt = new Date();

    if (claimStatus === 'Redeemed' && !claim.redeemedAt) {
      claim.redeemedAt = new Date();
    }

    // Financial Payout handling
    if (financialPayoutStatus) {
      claim.financialPayoutStatus = financialPayoutStatus;
      if (financialPayoutStatus === 'Paid') {
        claim.financialPayoutDate = new Date();
        claim.financialPayoutReference = financialPayoutReference || 'Direct Bank/Cash Transfer';
      }
    }

    // If claim is rejected and user had points deducted, refund points!
    if (claimStatus === 'Rejected' && prevStatus !== 'Rejected' && claim.pointsDeducted > 0) {
      let wallet = await CustomerPointsWallet.findOne({ gymId, userId: claim.userId });
      if (wallet) {
        const refunded = claim.pointsDeducted;
        const newBal = wallet.currentBalance + refunded;
        wallet.currentBalance = newBal;
        wallet.totalRedeemed = Math.max(0, wallet.totalRedeemed - refunded);
        wallet.lastUpdated = new Date();
        await wallet.save();

        await PointsTransaction.create({
          gymId,
          userId: claim.userId,
          type: 'ADMIN_ADJUST',
          amount: refunded,
          balanceAfter: newBal,
          rewardId: claim.rewardId._id,
          claimId: claim._id,
          description: `Refunded ${refunded} points due to claim rejection (${rejectionReason || 'Rejected by gym owner'})`,
          sourceEvent: 'Claim Rejected'
        });
      }
    }

    await claim.save();

    // Notify user
    const rewardTitle = (claim.rewardId as any)?.title || 'Reward';
    let title = 'Reward Request Updated';
    let message = `Your request for "${rewardTitle}" has been updated to: ${claim.claimStatus}.`;
    let type: 'info' | 'success' | 'alert' = 'info';

    if (claim.claimStatus === 'Approved') {
      title = '🎉 Reward Request Approved!';
      message = `Your claim for "${rewardTitle}" was approved! Your voucher code is: ${claim.claimCode}.`;
      type = 'success';
    } else if (claim.claimStatus === 'Rejected') {
      title = '❌ Reward Request Rejected';
      message = `Your claim for "${rewardTitle}" was rejected. Reason: ${rejectionReason || 'No reason provided.'}`;
      type = 'alert';
    } else if (financialPayoutStatus === 'Paid') {
      title = '💰 Bonus Payment Processed!';
      message = `Your bonus payment for "${rewardTitle}" has been recorded as paid. Ref: ${claim.financialPayoutReference}`;
      type = 'success';
    }

    await Notification.create({
      recipientId: claim.userId,
      recipientRole: claim.userRole,
      gymId,
      title,
      message,
      type,
      relatedRecordId: claim._id,
      link: claim.userRole === 'TRAINER' ? '/trainer/rewards' : '/member/challenges'
    });

    res.status(200).json({ success: true, claim, message: 'Claim status updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==========================================
// CUSTOMER CONTROLLER ACTIONS
// ==========================================

// Get rewards available to Customer & their wallet/badges/claims
export const getMemberRewards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const now = new Date();

    // Fetch user's actual progress for achievement criteria
    const [workoutsCount, userLogs, rawRewards, wallet, transactions, claims] = await Promise.all([
      WorkoutProgress.countDocuments({ customerId: new mongoose.Types.ObjectId(userId), status: 'Completed' } as any),
      ProgressLog.find({ customerId: userId, gymId }).select('loggedDate attendancePercentage workoutCompletionPercentage'),
      RewardDefinition.find({
        gymId,
        recipientType: { $in: ['Customer', 'Both'] },
        status: 'Active',
        $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }]
      })
        .populate('requiredChallengeId', 'title challengeType')
        .populate('trainerId', 'firstName lastName')
        .populate('productId', 'name image stock sellingPrice')
        .populate('packageId', 'name duration monthlyPrice')
        .sort({ requiredPoints: 1 }),
      CustomerPointsWallet.findOne({ gymId, userId }),
      PointsTransaction.find({ gymId, userId }).sort({ createdAt: -1 }).limit(20),
      RewardClaim.find({ gymId, userId }).populate('rewardId').sort({ createdAt: -1 })
    ]);

    const userVisitsCount = userLogs.length;
    const currentPoints = wallet?.currentBalance || 0;

    // Filter and compute dynamic status for each reward
    const userClaimsMap: Record<string, number> = {};
    const pendingClaimsMap: Record<string, boolean> = {};

    claims.forEach(c => {
      const rId = (c.rewardId as any)?._id?.toString() || c.rewardId?.toString();
      if (rId && c.claimStatus !== 'Rejected') {
        userClaimsMap[rId] = (userClaimsMap[rId] || 0) + 1;
      }
      if (rId && c.claimStatus === 'Pending') {
        pendingClaimsMap[rId] = true;
      }
    });

    const eligibleRewards = rawRewards.filter(r => {
      // Direct Assignment: only show to assigned customer
      if (r.assignmentMethod === 'Direct') {
        const isAssigned =
          (r.assignedUserId && r.assignedUserId.toString() === userId.toString()) ||
          (r.assignedUserIds && r.assignedUserIds.some((id: any) => id.toString() === userId.toString()));
        return isAssigned;
      }
      return true;
    }).map(r => {
      const rObj = r.toObject();
      const rId = r._id.toString();
      const claimCount = userClaimsMap[rId] || 0;
      const isPending = !!pendingClaimsMap[rId];
      const isExpired = r.expiryDate && new Date(r.expiryDate) < now;
      const isOutOfStock = r.totalQuantity > 0 && r.claimedCount >= r.totalQuantity;

      let memberStatus: 'Available' | 'Locked' | 'Claimed' | 'Expired' | 'Pending Approval' = 'Available';
      let progressInfo: { current: number; required: number; label: string; met: boolean } = {
        current: 0,
        required: 0,
        label: '',
        met: true
      };

      if (isPending) {
        memberStatus = 'Pending Approval';
      } else if (claimCount >= (r.maxClaimsPerUser || 1)) {
        memberStatus = 'Claimed';
      } else if (isExpired) {
        memberStatus = 'Expired';
      } else if (isOutOfStock) {
        memberStatus = 'Locked';
      } else if (r.assignmentMethod === 'Direct') {
        memberStatus = 'Available';
      } else if (r.assignmentMethod === 'Points' || (r.requiredPoints && r.requiredPoints > 0)) {
        const met = currentPoints >= (r.requiredPoints || 0);
        memberStatus = met ? 'Available' : 'Locked';
        progressInfo = {
          current: currentPoints,
          required: r.requiredPoints || 0,
          label: 'Points Cost',
          met
        };
      } else if (r.assignmentMethod === 'Achievement') {
        if (r.minVerifiedVisits && r.minVerifiedVisits > 0) {
          const met = userVisitsCount >= r.minVerifiedVisits;
          memberStatus = met ? 'Available' : 'Locked';
          progressInfo = {
            current: userVisitsCount,
            required: r.minVerifiedVisits,
            label: 'Gym Visits',
            met
          };
        } else if (r.minWorkoutCompletions && r.minWorkoutCompletions > 0) {
          const met = workoutsCount >= r.minWorkoutCompletions;
          memberStatus = met ? 'Available' : 'Locked';
          progressInfo = {
            current: workoutsCount,
            required: r.minWorkoutCompletions,
            label: 'Completed Workouts',
            met
          };
        } else {
          memberStatus = 'Available';
        }
      }

      return {
        ...rObj,
        memberStatus,
        progressInfo,
        userClaimCount: claimCount
      };
    });

    res.status(200).json({
      success: true,
      rewards: eligibleRewards,
      wallet: wallet || {
        currentBalance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        badges: []
      },
      userPerformanceSnapshot: {
        visits: userVisitsCount,
        workouts: workoutsCount,
        points: currentPoints
      },
      transactions,
      claims
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Customer or Trainer claims a reward
export const claimReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { rewardId, challengeId } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('gymId role firstName lastName email');
    const gymId = req.user?.gymId || user?.gymId;
    const userRole = (user?.role === 'TRAINER' ? 'TRAINER' : 'MEMBER') as 'MEMBER' | 'TRAINER';

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const reward = await RewardDefinition.findOne({ _id: rewardId, gymId });
    if (!reward) {
      res.status(404).json({ success: false, message: 'Reward not found' });
      return;
    }

    if (reward.status !== 'Active') {
      res.status(400).json({ success: false, message: 'Reward is not currently active' });
      return;
    }

    const now = new Date();
    if (reward.expiryDate && new Date(reward.expiryDate) < now) {
      res.status(400).json({ success: false, message: 'Reward has expired' });
      return;
    }

    if (reward.totalQuantity > 0 && reward.claimedCount >= reward.totalQuantity) {
      res.status(400).json({ success: false, message: 'Reward is completely out of stock / reached maximum redemptions' });
      return;
    }

    // Direct Assignment Check: ensure only assigned user can claim
    if (reward.assignmentMethod === 'Direct') {
      const isDirectTarget =
        (reward.assignedUserId && reward.assignedUserId.toString() === userId.toString()) ||
        (reward.assignedUserIds && reward.assignedUserIds.some((id: any) => id.toString() === userId.toString()));

      if (!isDirectTarget) {
        res.status(403).json({
          success: false,
          message: 'Access denied: This reward was directly assigned to another specific member'
        });
        return;
      }
    }

    // Achievement Eligibility Verification
    if (reward.assignmentMethod === 'Achievement') {
      if (reward.minVerifiedVisits && reward.minVerifiedVisits > 0) {
        const visitLogs = await ProgressLog.countDocuments({ customerId: userId, gymId });
        if (visitLogs < reward.minVerifiedVisits) {
          res.status(400).json({
            success: false,
            message: `Eligibility not met: You have ${visitLogs} verified visits, but this reward requires ${reward.minVerifiedVisits}`
          });
          return;
        }
      }
      if (reward.minWorkoutCompletions && reward.minWorkoutCompletions > 0) {
        const completedWorkouts = await WorkoutProgress.countDocuments({
          customerId: new mongoose.Types.ObjectId(userId),
          status: 'Completed'
        } as any);
        if (completedWorkouts < reward.minWorkoutCompletions) {
          res.status(400).json({
            success: false,
            message: `Eligibility not met: You have ${completedWorkouts} completed workouts, but this reward requires ${reward.minWorkoutCompletions}`
          });
          return;
        }
      }
    }

    // Physical product stock verification & reduction
    if (reward.productId) {
      const neededQty = reward.productQuantity || 1;
      const product = await StoreProduct.findOne({ _id: reward.productId, gymId });
      if (!product || product.stock < neededQty) {
        res.status(400).json({
          success: false,
          message: 'Selected physical product reward is currently out of stock'
        });
        return;
      }
      // Decrement stock
      await StoreProduct.findByIdAndUpdate(reward.productId, { $inc: { stock: -neededQty } });
    }

    // Check user max claims
    const userClaimCount = await RewardClaim.countDocuments({
      rewardId,
      userId,
      claimStatus: { $ne: 'Rejected' }
    });
    if (userClaimCount >= (reward.maxClaimsPerUser || 1)) {
      res.status(400).json({
        success: false,
        message: `You have reached the limit of ${reward.maxClaimsPerUser} claim(s) for this reward`
      });
      return;
    }

    // Verify challenge completion requirement if linked
    const targetChallengeId = challengeId || reward.requiredChallengeId;
    if (targetChallengeId) {
      const participant = await ChallengeParticipant.findOne({
        challengeId: targetChallengeId,
        customerId: userId,
        gymId
      });
      if (!participant || !participant.completed) {
        res.status(400).json({ success: false, message: 'You must complete the required challenge before claiming this reward' });
        return;
      }
    }

    // Points deduction validation if points required
    let pointsDeducted = 0;
    if (reward.assignmentMethod === 'Points' && reward.requiredPoints && reward.requiredPoints > 0) {
      const wallet = await CustomerPointsWallet.findOne({ gymId, userId });
      if (!wallet || wallet.currentBalance < reward.requiredPoints) {
        res.status(400).json({
          success: false,
          message: `Insufficient points balance. You need ${reward.requiredPoints} points, but have ${wallet?.currentBalance || 0}.`
        });
        return;
      }

      pointsDeducted = reward.requiredPoints;
      const newBal = wallet.currentBalance - pointsDeducted;
      wallet.currentBalance = newBal;
      wallet.totalRedeemed += pointsDeducted;
      wallet.lastUpdated = new Date();
      await wallet.save();

      await PointsTransaction.create({
        gymId,
        userId,
        type: 'REDEEM_REWARD',
        amount: -pointsDeducted,
        balanceAfter: newBal,
        rewardId: reward._id,
        description: `Redeemed ${pointsDeducted} points for "${reward.title}"`,
        sourceEvent: 'Reward Redemption'
      });
    }

    // Generate unique claim code
    let claimCode = generateClaimCode();
    while (await RewardClaim.findOne({ claimCode })) {
      claimCode = generateClaimCode();
    }

    // Determine initial status
    const initialStatus = reward.requireApproval ? 'Pending' : 'Approved';

    const claim = await RewardClaim.create({
      gymId,
      rewardId: reward._id,
      userId,
      userRole,
      challengeId: targetChallengeId || undefined,
      claimCode,
      pointsDeducted,
      claimStatus: initialStatus,
      financialPayoutStatus: reward.bonusAmount && reward.bonusAmount > 0 ? 'Pending' : 'Not Applicable'
    });

    // Increment claimed count
    await RewardDefinition.findByIdAndUpdate(reward._id, { $inc: { claimedCount: 1 } });

    // If linked to challenge participant, update their claim status
    if (targetChallengeId) {
      await ChallengeParticipant.findOneAndUpdate(
        { challengeId: targetChallengeId, customerId: userId },
        {
          rewardClaimStatus: reward.requireApproval ? 'Pending Approval' : 'Claimed',
          rewardClaimedAt: new Date(),
          claimCode
        }
      );
    }

    // If manual approval is required, notify the gym owner
    if (reward.requireApproval) {
      const gymOwner = await (User as any).findOne({ gymId, role: 'GYM_OWNER' });
      if (gymOwner) {
        await Notification.create({
          recipientId: gymOwner._id,
          recipientRole: 'GYM_OWNER',
          gymId,
          title: '🎁 Reward Claim Needs Approval',
          message: `${user?.firstName || 'A user'} has requested to claim "${reward.title}". Please review the request.`,
          type: 'alert',
          relatedRecordId: claim._id,
          link: '/admin/rewards'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: reward.requireApproval
        ? 'Claim submitted and pending Gym Owner approval'
        : 'Reward claimed successfully!',
      claim
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==========================================
// TRAINER CONTROLLER ACTIONS
// ==========================================

// Get trainer rewards & automated criteria assessment
export const getTrainerRewards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    if (!trainerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(trainerId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    // Compute Trainer Verified Performance metrics:
    // 1. Completed sessions
    const completedSessionsCount = await (TrainerSession as any).countDocuments({
      trainerId,
      gymId,
      $or: [{ status: 'Completed' }, { attendanceStatus: 'Present' }]
    });

    // 2. Average rating from completed sessions
    const sessionsWithRating = await (TrainerSession as any).find({
      trainerId,
      gymId,
      customerRating: { $exists: true, $gt: 0 }
    }).select('customerRating');

    const totalRatings = sessionsWithRating.reduce((sum: number, s: any) => sum + (s.customerRating || 0), 0);
    const averageRating = sessionsWithRating.length > 0 ? (totalRatings / sessionsWithRating.length).toFixed(1) : '5.0';

    // 3. Assigned customers count
    const assignedCustomersCount = (await TrainerSession.find({ trainerId, gymId }).distinct('customerId')).length;

    // Fetch trainer rewards
    const rewards = await RewardDefinition.find({
      gymId,
      recipientType: { $in: ['Trainer', 'Both'] },
      status: 'Active'
    }).sort({ createdAt: -1 });

    // Fetch trainer's past claims
    const claims = await RewardClaim.find({ gymId, userId: trainerId, userRole: 'TRAINER' })
      .populate('rewardId')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Evaluate eligibility for each reward
    const evaluatedRewards = rewards.map((r: any) => {
      let isEligible = true;
      let reasons: string[] = [];

      if (r.minCompletedSessions && completedSessionsCount < r.minCompletedSessions) {
        isEligible = false;
        reasons.push(`Requires ${r.minCompletedSessions} completed sessions (current: ${completedSessionsCount})`);
      }

      if (r.minAverageRating && Number(averageRating) < r.minAverageRating) {
        isEligible = false;
        reasons.push(`Requires minimum ${r.minAverageRating}⭐ rating (current: ${averageRating}⭐)`);
      }

      const hasClaimed = claims.some(c => c.rewardId?._id?.toString() === r._id.toString() && c.claimStatus !== 'Rejected');

      return {
        ...r.toObject(),
        isEligible,
        eligibilityReasons: reasons,
        alreadyClaimed: hasClaimed
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        completedSessionsCount,
        averageRating: Number(averageRating),
        ratingCount: sessionsWithRating.length,
        assignedCustomersCount
      },
      rewards: evaluatedRewards,
      claims
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
