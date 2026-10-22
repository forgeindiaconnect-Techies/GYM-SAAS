import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';
import FitnessChallenge, { IFitnessChallenge } from '../models/FitnessChallenge';
import ChallengeParticipant from '../models/ChallengeParticipant';
import ChallengeActivityLog from '../models/ChallengeActivityLog';
import PointsTransaction from '../models/PointsTransaction';
import CustomerPointsWallet from '../models/CustomerPointsWallet';
import RewardDefinition from '../models/RewardDefinition';
import CustomerMembership from '../models/CustomerMembership';
import TrainerSession from '../models/TrainerSession';
import WorkoutProgress from '../models/WorkoutProgress';
import User from '../models/User';
import Notification from '../models/Notification';

// Helper: Format privacy-safe display name (e.g., "John D.")
export const getPrivacyDisplayName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) return 'Member';
  const first = firstName ? firstName.trim() : '';
  const lastInitial = lastName ? ` ${lastName.trim().charAt(0).toUpperCase()}.` : '';
  return `${first}${lastInitial}`.trim() || 'Member';
};

// Helper: Sync participant's progress from verified records
export const evaluateParticipantProgress = async (
  participantId: string | mongoose.Types.ObjectId,
  challenge: IFitnessChallenge,
  customerId: string | mongoose.Types.ObjectId,
  gymId: string | mongoose.Types.ObjectId
) => {
  const pId = new mongoose.Types.ObjectId(participantId.toString());
  const cId = new mongoose.Types.ObjectId(customerId.toString());
  const gId = new mongoose.Types.ObjectId(gymId.toString());

  const participant = await ChallengeParticipant.findById(pId);
  if (!participant) return null;

  const startDate = new Date(challenge.startDate);
  const endDate = new Date(challenge.endDate);
  // Ensure endDate covers the whole day
  endDate.setHours(23, 59, 59, 999);

  let verifiedDates: Set<string> = new Set();
  let activityLogsToInsert: any[] = [];

  if (challenge.challengeType === 'Attendance') {
    // 1. Check verified sessions from TrainerSession
    const sessions = await (TrainerSession as any).find({
      customerId: cId,
      gymId: gId,
      $or: [
        { status: 'Completed' },
        { attendanceStatus: 'Present' }
      ]
    }).lean();

    for (const session of sessions) {
      if (!session.date) continue;
      const sDate = new Date(session.date);
      if (sDate >= startDate && sDate <= endDate) {
        verifiedDates.add(session.date);
      }
    }
  } else if (challenge.challengeType === 'Workout Completion') {
    // 2. Check completed workouts from WorkoutProgress
    const workouts = await WorkoutProgress.find({
      customerId: cId,
      status: 'Completed',
      completedAt: { $gte: startDate, $lte: endDate }
    }).lean();

    for (const w of workouts) {
      if (w.completedAt) {
        const dateStr = new Date(w.completedAt).toISOString().split('T')[0];
        verifiedDates.add(dateStr);
      }
    }
  } else if (challenge.challengeType === 'Consistency Streak') {
    // 3. Consistency Streak: check both attendance and workouts
    const [sessions, workouts] = await Promise.all([
      (TrainerSession as any).find({
        customerId: cId,
        gymId: gId,
        $or: [{ status: 'Completed' }, { attendanceStatus: 'Present' }]
      }).lean(),
      (WorkoutProgress as any).find({
        customerId: cId,
        status: 'Completed',
        completedAt: { $gte: startDate, $lte: endDate }
      }).lean()
    ]);

    for (const s of sessions) {
      if (s.date) {
        const sDate = new Date(s.date);
        if (sDate >= startDate && sDate <= endDate) {
          verifiedDates.add(s.date);
        }
      }
    }
    for (const w of workouts) {
      if (w.completedAt) {
        const dateStr = new Date(w.completedAt).toISOString().split('T')[0];
        if (new Date(w.completedAt) >= startDate && new Date(w.completedAt) <= endDate) {
          verifiedDates.add(dateStr);
        }
      }
    }
  }

  // Also include any manual trainer-verified activity logs
  const existingLogs = await ChallengeActivityLog.find({
    challengeId: challenge._id,
    customerId: cId
  }).lean();

  for (const log of existingLogs) {
    if (log.activityDate) {
      const dStr = new Date(log.activityDate).toISOString().split('T')[0];
      verifiedDates.add(dStr);
    }
  }

  // Calculate current progress count or streak
  let currentProgress = 0;
  let streakDays = 0;

  if (challenge.challengeType === 'Consistency Streak') {
    // Sort dates ascending
    const sortedDates = Array.from(verifiedDates).sort();
    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of sortedDates) {
      const curDate = new Date(dStr);
      if (prevDate) {
        const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = curDate;
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
    }
    streakDays = maxStreak;
    currentProgress = maxStreak;
  } else {
    currentProgress = verifiedDates.size;
  }

  // Save new activity logs for unlogged dates
  const loggedSourceIds = new Set(existingLogs.map(l => l.sourceReferenceId));
  let newlyAwardedPoints = 0;

  for (const dateStr of verifiedDates) {
    if (!loggedSourceIds.has(dateStr)) {
      const pts = challenge.pointsPerActivity || 0;
      newlyAwardedPoints += pts;
      activityLogsToInsert.push({
        challengeId: challenge._id,
        participantId: participant._id,
        customerId: cId,
        gymId: gId,
        activityType: challenge.challengeType === 'Attendance' ? 'Attendance' : 'Workout',
        sourceReferenceId: dateStr,
        activityDate: new Date(dateStr),
        pointsAwarded: pts
      });
    }
  }

  if (activityLogsToInsert.length > 0) {
    try {
      await ChallengeActivityLog.insertMany(activityLogsToInsert, { ordered: false });
    } catch (e) {
      // Ignore duplicate key collision if concurrent
    }
  }

  // Atomic Points Wallet Updates for activity points
  if (newlyAwardedPoints > 0) {
    let wallet = await CustomerPointsWallet.findOne({ gymId: gId, userId: cId });
    if (!wallet) {
      wallet = await CustomerPointsWallet.create({
        gymId: gId,
        userId: cId,
        currentBalance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        badges: []
      });
    }
    const newBalance = wallet.currentBalance + newlyAwardedPoints;
    wallet.currentBalance = newBalance;
    wallet.totalEarned += newlyAwardedPoints;
    wallet.lastUpdated = new Date();
    await wallet.save();

    await PointsTransaction.create({
      gymId: gId,
      userId: cId,
      type: 'EARN_ACTIVITY',
      amount: newlyAwardedPoints,
      balanceAfter: newBalance,
      challengeId: challenge._id,
      description: `Earned ${newlyAwardedPoints} points for activity in challenge "${challenge.title}"`,
      sourceEvent: 'Activity Progress'
    });

    participant.pointsEarned += newlyAwardedPoints;
  }

  // Check if challenge is newly completed
  const isCompleted = currentProgress >= challenge.targetValue;
  const wasCompletedBefore = participant.completed;

  participant.currentProgress = currentProgress;
  participant.streakDays = streakDays;

  if (isCompleted && !wasCompletedBefore) {
    participant.completed = true;
    participant.completedAt = new Date();

    // Award completion bonus points
    const bonus = challenge.completionBonusPoints || 0;
    if (bonus > 0 && !participant.bonusAwarded) {
      let wallet = await CustomerPointsWallet.findOne({ gymId: gId, userId: cId });
      if (!wallet) {
        wallet = await CustomerPointsWallet.create({
          gymId: gId,
          userId: cId,
          currentBalance: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          badges: []
        });
      }
      const newBal = wallet.currentBalance + bonus;
      wallet.currentBalance = newBal;
      wallet.totalEarned += bonus;

      // Add badge if configured
      if (challenge.badgeName) {
        wallet.badges.push({
          badgeName: challenge.badgeName,
          badgeIcon: challenge.badgeIcon || 'Award',
          challengeTitle: challenge.title,
          challengeId: challenge._id as mongoose.Types.ObjectId,
          earnedAt: new Date()
        });
      }
      wallet.lastUpdated = new Date();
      await wallet.save();

      await PointsTransaction.create({
        gymId: gId,
        userId: cId,
        type: 'EARN_BONUS',
        amount: bonus,
        balanceAfter: newBal,
        challengeId: challenge._id,
        description: `Completion bonus for completing challenge "${challenge.title}"`,
        sourceEvent: 'Challenge Completed'
      });

      participant.pointsEarned += bonus;
      participant.bonusAwarded = true;
      participant.badgeEarned = true;
    }

    // Set reward claim status if challenge offers a reward
    if (challenge.rewardId) {
      participant.rewardClaimStatus = 'Eligible';
    }

    // Increment completion count on challenge
    await FitnessChallenge.findByIdAndUpdate(challenge._id, { $inc: { completionCount: 1 } });

    // Send completion notification to customer
    await Notification.create({
      recipientId: cId,
      recipientRole: 'MEMBER',
      gymId: gId,
      title: '🏆 Challenge Completed!',
      message: `Congratulations! You have completed the challenge "${challenge.title}". You earned ${bonus} bonus points and the "${challenge.badgeName}" badge!`,
      type: 'success',
      relatedRecordId: challenge._id,
      link: '/member/challenges'
    });
  }

  await participant.save();
  return participant;
};

// ==========================================
// GYM OWNER CONTROLLER ACTIONS
// ==========================================

// Create a new challenge
export const createChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('gymId role');
    const gymId = req.user?.gymId || user?.gymId;
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found for this user' });
      return;
    }

    const {
      title,
      description,
      challengeType,
      startDate,
      endDate,
      targetValue,
      targetUnit,
      pointsPerActivity,
      completionBonusPoints,
      badgeName,
      badgeIcon,
      eligiblePackageIds,
      rewardId,
      rewardQuantity,
      rewardExpiryDate,
      requireApproval,
      isLeaderboardEnabled,
      status
    } = req.body;

    if (!title || !description || !challengeType || !startDate || !endDate || !targetValue) {
      res.status(400).json({ success: false, message: 'All required fields must be provided' });
      return;
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (sDate >= eDate) {
      res.status(400).json({ success: false, message: 'Start date must be before end date' });
      return;
    }

    if (Number(targetValue) <= 0) {
      res.status(400).json({ success: false, message: 'Target value must be greater than 0' });
      return;
    }

    const challenge = await FitnessChallenge.create({
      gymId,
      createdBy: userId,
      title: title.trim(),
      description: description.trim(),
      challengeType,
      startDate: sDate,
      endDate: eDate,
      targetValue: Number(targetValue),
      targetUnit: targetUnit || (challengeType === 'Attendance' ? 'Visits' : challengeType === 'Workout Completion' ? 'Workouts' : 'Days'),
      pointsPerActivity: pointsPerActivity !== undefined ? Number(pointsPerActivity) : 10,
      completionBonusPoints: completionBonusPoints !== undefined ? Number(completionBonusPoints) : 50,
      badgeName: badgeName?.trim() || 'Fitness Champion',
      badgeIcon: badgeIcon?.trim() || 'Award',
      eligiblePackageIds: Array.isArray(eligiblePackageIds) ? eligiblePackageIds : [],
      rewardId: rewardId || undefined,
      rewardQuantity: rewardQuantity ? Number(rewardQuantity) : 0,
      rewardExpiryDate: rewardExpiryDate ? new Date(rewardExpiryDate) : undefined,
      requireApproval: Boolean(requireApproval),
      isLeaderboardEnabled: isLeaderboardEnabled !== false,
      status: status || 'Published'
    });

    // Notify gym members if published
    if (challenge.status === 'Published') {
      const members = await (User as any).find({ gymId, role: 'MEMBER' }).select('_id');
      if (members.length > 0) {
        const notifications = members.map((m: any) => ({
          recipientId: m._id,
          recipientRole: 'MEMBER',
          gymId,
          title: '🔥 New Fitness Challenge Available!',
          message: `Join the "${challenge.title}" challenge and earn rewards!`,
          type: 'info',
          relatedRecordId: challenge._id,
          link: '/member/challenges'
        }));
        await Notification.insertMany(notifications).catch(() => {});
      }
    }

    res.status(201).json({ success: true, challenge, message: 'Challenge created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all challenges for Gym Owner with aggregated metrics
export const getOwnerChallenges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const challenges = await FitnessChallenge.find({ gymId })
      .populate('eligiblePackageIds', 'name planName price duration')
      .populate('rewardId', 'title category totalQuantity claimedCount')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, challenges });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update challenge
export const updateChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const user = await User.findById(userId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    const challenge = await FitnessChallenge.findOne({ _id: id, gymId });
    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found' });
      return;
    }

    const {
      title,
      description,
      challengeType,
      startDate,
      endDate,
      targetValue,
      targetUnit,
      pointsPerActivity,
      completionBonusPoints,
      badgeName,
      badgeIcon,
      eligiblePackageIds,
      rewardId,
      rewardQuantity,
      rewardExpiryDate,
      requireApproval,
      isLeaderboardEnabled,
      status
    } = req.body;

    if (title) challenge.title = title.trim();
    if (description) challenge.description = description.trim();
    if (challengeType) challenge.challengeType = challengeType;
    if (startDate) challenge.startDate = new Date(startDate);
    if (endDate) challenge.endDate = new Date(endDate);
    if (targetValue !== undefined) challenge.targetValue = Number(targetValue);
    if (targetUnit) challenge.targetUnit = targetUnit;
    if (pointsPerActivity !== undefined) challenge.pointsPerActivity = Number(pointsPerActivity);
    if (completionBonusPoints !== undefined) challenge.completionBonusPoints = Number(completionBonusPoints);
    if (badgeName) challenge.badgeName = badgeName.trim();
    if (badgeIcon) challenge.badgeIcon = badgeIcon.trim();
    if (eligiblePackageIds !== undefined) challenge.eligiblePackageIds = eligiblePackageIds;
    if (rewardId !== undefined) challenge.rewardId = rewardId || undefined;
    if (rewardQuantity !== undefined) challenge.rewardQuantity = Number(rewardQuantity);
    if (rewardExpiryDate) challenge.rewardExpiryDate = new Date(rewardExpiryDate);
    if (requireApproval !== undefined) challenge.requireApproval = Boolean(requireApproval);
    if (isLeaderboardEnabled !== undefined) challenge.isLeaderboardEnabled = Boolean(isLeaderboardEnabled);
    if (status) challenge.status = status;

    await challenge.save();
    res.status(200).json({ success: true, challenge, message: 'Challenge updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete challenge
export const deleteChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user?.id).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    const challenge = await FitnessChallenge.findOne({ _id: id, gymId });
    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found' });
      return;
    }

    await FitnessChallenge.findByIdAndDelete(id);
    await ChallengeParticipant.deleteMany({ challengeId: id });
    await ChallengeActivityLog.deleteMany({ challengeId: id });

    res.status(200).json({ success: true, message: 'Challenge removed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get participants of a challenge
export const getChallengeParticipants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user?.id).select('gymId role');
    const gymId = req.user?.gymId || user?.gymId;

    const participants = await ChallengeParticipant.find({ challengeId: id, gymId })
      .populate('customerId', 'firstName lastName email profilePicture phone')
      .populate('verifiedByTrainerId', 'firstName lastName')
      .sort({ completed: -1, currentProgress: -1 });

    res.status(200).json({ success: true, participants });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==========================================
// CUSTOMER CONTROLLER ACTIONS
// ==========================================

// Get all member challenges (available, active, completed)
export const getMemberChallenges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    if (!customerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const customer = await User.findById(customerId).select('gymId');
    const gymId = req.user?.gymId || customer?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Customer gym not found' });
      return;
    }

    // Get customer's active membership to check package eligibility
    const activeMembership = await (CustomerMembership as any).findOne({
      userId: customerId,
      status: 'Active'
    }).sort({ createdAt: -1 });

    // Fetch all published or active challenges for this gym
    const allGymChallenges = await FitnessChallenge.find({
      gymId,
      status: { $in: ['Published', 'Completed'] }
    })
      .populate('rewardId', 'title category totalQuantity claimedCount')
      .sort({ startDate: -1 })
      .lean();

    // Fetch customer's enrollments
    const enrollments = await ChallengeParticipant.find({
      customerId,
      gymId
    })
      .populate('challengeId')
      .sort({ enrolledAt: -1 })
      .lean();

    const enrolledMap = new Map();
    for (const en of enrollments) {
      if (en.challengeId) {
        enrolledMap.set((en.challengeId as any)._id?.toString() || en.challengeId.toString(), en);
      }
    }

    const available: any[] = [];
    const active: any[] = [];
    const completed: any[] = [];

    const now = new Date();

    for (const ch of allGymChallenges) {
      const chId = ch._id.toString();
      const enrollment = enrolledMap.get(chId);

      // Package eligibility check
      let isPackageEligible = true;
      if (ch.eligiblePackageIds && ch.eligiblePackageIds.length > 0) {
        if (!activeMembership || !activeMembership.planName) {
          isPackageEligible = false;
        } else {
          // Check if package matches
          const matchPkg = ch.eligiblePackageIds.some(
            (pkgId: any) => pkgId.toString() === activeMembership._id?.toString()
          );
          if (!matchPkg) {
            isPackageEligible = false;
          }
        }
      }

      if (enrollment) {
        const item = { ...ch, participantData: enrollment };
        if (enrollment.completed) {
          completed.push(item);
        } else {
          active.push(item);
        }
      } else {
        // Can join if not expired and status is Published
        const isExpired = new Date(ch.endDate) < now;
        available.push({
          ...ch,
          isPackageEligible,
          isExpired
        });
      }
    }

    // Also get Customer Points Wallet & Badges
    const wallet = await CustomerPointsWallet.findOne({ gymId, userId: customerId });

    res.status(200).json({
      success: true,
      available,
      active,
      completed,
      wallet: wallet || {
        currentBalance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        badges: []
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Customer joins a challenge
export const joinChallenge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const { id } = req.params;

    if (!customerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const customer = await User.findById(customerId).select('gymId firstName lastName');
    const gymId = req.user?.gymId || customer?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const challenge = await FitnessChallenge.findOne({ _id: id, gymId });
    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found' });
      return;
    }

    if (challenge.status !== 'Published') {
      res.status(400).json({ success: false, message: 'Challenge is not currently open for enrollment' });
      return;
    }

    const now = new Date();
    if (new Date(challenge.endDate) < now) {
      res.status(400).json({ success: false, message: 'Challenge has already ended' });
      return;
    }

    // Check duplicate enrollment
    const existing = await ChallengeParticipant.findOne({ challengeId: id, customerId });
    if (existing) {
      res.status(400).json({ success: false, message: 'You have already enrolled in this challenge' });
      return;
    }

    // Create participant
    const participant = await ChallengeParticipant.create({
      challengeId: challenge._id,
      customerId,
      gymId,
      targetValue: challenge.targetValue,
      currentProgress: 0,
      pointsEarned: 0,
      streakDays: 0,
      rewardClaimStatus: challenge.rewardId ? 'Not Eligible' : 'Not Eligible'
    });

    await FitnessChallenge.findByIdAndUpdate(challenge._id, { $inc: { participantCount: 1 } });

    // Sync any historical verified activities within the challenge window
    await evaluateParticipantProgress(participant._id, challenge, customerId, gymId);

    // Create confirmation notification
    await Notification.create({
      recipientId: customerId,
      recipientRole: 'MEMBER',
      gymId,
      title: '🎯 Challenge Joined!',
      message: `You successfully joined "${challenge.title}". Start logging your progress today!`,
      type: 'success',
      relatedRecordId: challenge._id,
      link: '/member/challenges'
    });

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in challenge',
      participant
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Customer manual progress sync (or system sync)
export const syncProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const { challengeId } = req.body;

    if (!customerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(customerId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;
    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const challenge = await FitnessChallenge.findOne({ _id: challengeId, gymId });
    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found' });
      return;
    }

    const participant = await ChallengeParticipant.findOne({ challengeId, customerId, gymId });
    if (!participant) {
      res.status(404).json({ success: false, message: 'You are not enrolled in this challenge' });
      return;
    }

    const updated = await evaluateParticipantProgress(participant._id, challenge, customerId, gymId);

    res.status(200).json({
      success: true,
      message: 'Progress synchronized successfully',
      participant: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Challenge Leaderboard with privacy-safe display names
export const getChallengeLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user?.id).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    const challenge = await FitnessChallenge.findOne({ _id: id, gymId });
    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found' });
      return;
    }

    if (!challenge.isLeaderboardEnabled) {
      res.status(403).json({ success: false, message: 'Leaderboard is disabled for this challenge' });
      return;
    }

    const participants = await ChallengeParticipant.find({ challengeId: id, gymId })
      .populate('customerId', 'firstName lastName profilePicture')
      .sort({ completed: -1, currentProgress: -1, pointsEarned: -1, completedAt: 1 })
      .limit(50)
      .lean();

    const currentUserId = req.user?.id?.toString();

    // Map to ranked leaderboard entries with privacy-safe display names
    const leaderboard = participants.map((p: any, index: number) => {
      const isMe = p.customerId?._id?.toString() === currentUserId;
      const displayName = isMe
        ? `${p.customerId?.firstName || 'You'} (You)`
        : getPrivacyDisplayName(p.customerId?.firstName, p.customerId?.lastName);

      return {
        rank: index + 1,
        participantId: p._id,
        displayName,
        profilePicture: p.customerId?.profilePicture,
        currentProgress: p.currentProgress,
        targetValue: p.targetValue,
        completed: p.completed,
        completedAt: p.completedAt,
        pointsEarned: p.pointsEarned,
        badgeEarned: p.badgeEarned,
        streakDays: p.streakDays,
        isCurrentUser: isMe
      };
    });

    res.status(200).json({
      success: true,
      challengeTitle: challenge.title,
      targetValue: challenge.targetValue,
      targetUnit: challenge.targetUnit,
      badgeName: challenge.badgeName,
      leaderboard
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==========================================
// TRAINER ACTIONS
// ==========================================

// Get challenge progress of assigned customers
export const getTrainerCustomerProgress = async (req: AuthRequest, res: Response): Promise<void> => {
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

    // Find customers assigned to this trainer (via TrainerSession or memberships)
    const trainerSessions = await TrainerSession.find({ trainerId, gymId }).distinct('customerId');

    // Also get customers who requested workout plans or have trainerId assigned
    const assignedWorkouts = await WorkoutProgress.find({ trainerId, gymId }).distinct('customerId');

    const customerIds = Array.from(
      new Set([...trainerSessions.map(id => id.toString()), ...assignedWorkouts.map(id => id.toString())])
    );

    // Get participants matching these customerIds or all active gym challenges if no specific assignments yet
    let query: any = { gymId };
    if (customerIds.length > 0) {
      query.customerId = { $in: customerIds };
    }

    const participants = await ChallengeParticipant.find(query)
      .populate('challengeId', 'title challengeType targetValue targetUnit startDate endDate status badgeName')
      .populate('customerId', 'firstName lastName email profilePicture')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, participants });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Trainer verifies workout completion and provides feedback
export const trainerVerifyWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const { participantId, feedback, workoutProgressId, verificationNote } = req.body;

    if (!trainerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const participant = await ChallengeParticipant.findById(participantId);
    if (!participant) {
      res.status(404).json({ success: false, message: 'Participant record not found' });
      return;
    }

    const challenge = await FitnessChallenge.findById(participant.challengeId);
    if (!challenge) {
      res.status(404).json({ success: false, message: 'Challenge not found' });
      return;
    }

    // If a specific workoutProgressId is provided, mark it verified/completed
    if (workoutProgressId) {
      await WorkoutProgress.findByIdAndUpdate(workoutProgressId, {
        status: 'Completed',
        trainerId,
        notes: verificationNote ? `Trainer Verified: ${verificationNote}` : 'Verified by Trainer'
      });
    }

    // Update participant record with feedback
    if (feedback) {
      participant.trainerFeedback = feedback.trim();
      participant.trainerFeedbackAt = new Date();
    }
    participant.verifiedByTrainerId = new mongoose.Types.ObjectId(trainerId);
    await participant.save();

    // Re-evaluate progress
    const updated = await evaluateParticipantProgress(
      participant._id,
      challenge,
      participant.customerId,
      participant.gymId
    );

    // Notify customer
    await Notification.create({
      recipientId: participant.customerId,
      recipientRole: 'MEMBER',
      gymId: participant.gymId,
      title: '💪 Trainer Verified Your Progress',
      message: feedback
        ? `Your trainer verified your workout in "${challenge.title}" and left feedback: "${feedback}"`
        : `Your trainer verified your workout in "${challenge.title}".`,
      type: 'info',
      relatedRecordId: challenge._id,
      link: '/member/challenges'
    });

    res.status(200).json({
      success: true,
      message: 'Workout verified and feedback recorded',
      participant: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
