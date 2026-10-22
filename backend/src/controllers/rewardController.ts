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
      category,
      rewardType,
      requiredPoints,
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

    const reward = await RewardDefinition.create({
      gymId,
      createdBy: userId,
      title: title.trim(),
      description: description.trim(),
      recipientType: recipientType || 'Customer',
      category: category.trim(),
      rewardType: rewardType || 'Reward',
      requiredPoints: requiredPoints !== undefined ? Number(requiredPoints) : 0,
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
      category,
      rewardType,
      requiredPoints,
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
    if (category) reward.category = category.trim();
    if (rewardType) reward.rewardType = rewardType;
    if (requiredPoints !== undefined) reward.requiredPoints = Number(requiredPoints);
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

    const [rewards, wallet, transactions, claims] = await Promise.all([
      RewardDefinition.find({
        gymId,
        recipientType: { $in: ['Customer', 'Both'] },
        status: 'Active',
        $or: [{ expiryDate: { $exists: false } }, { expiryDate: null }, { expiryDate: { $gte: now } }]
      })
        .populate('requiredChallengeId', 'title challengeType')
        .sort({ requiredPoints: 1 }),
      CustomerPointsWallet.findOne({ gymId, userId }),
      PointsTransaction.find({ gymId, userId }).sort({ createdAt: -1 }).limit(20),
      RewardClaim.find({ gymId, userId }).populate('rewardId').sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      rewards,
      wallet: wallet || {
        currentBalance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        badges: []
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

    // Check user max claims
    const userClaimCount = await RewardClaim.countDocuments({
      rewardId,
      userId,
      claimStatus: { $ne: 'Rejected' }
    });
    if (userClaimCount >= (reward.maxClaimsPerUser || 1)) {
      res.status(400).json({ success: false, message: `You have reached the limit of ${reward.maxClaimsPerUser} claim(s) for this reward` });
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
    if (reward.requiredPoints && reward.requiredPoints > 0) {
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
