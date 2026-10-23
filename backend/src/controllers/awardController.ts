import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';
import AwardRecognition from '../models/AwardRecognition';
import User from '../models/User';
import CustomerMembership from '../models/CustomerMembership';
import WorkoutProgress from '../models/WorkoutProgress';
import DietProgress from '../models/DietProgress';
import ChallengeParticipant from '../models/ChallengeParticipant';
import TrainerSession from '../models/TrainerSession';
import Notification from '../models/Notification';

// Helper to generate unique Certificate ID
const generateCertificateId = (): string => {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${year}-${rand}`;
};

// 1. Create an Award
export const createAward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('gymId role');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const {
      title,
      recipientType,
      category,
      description,
      badgeIcon,
      awardPeriod,
      startDate,
      endDate,
      announcementDate,
      criteriaMetric,
      minCriteriaValue,
      winnerSelectionMethod,
      prizeBonusAmount,
      prizeDescription,
      allowDuplicateWinner,
      status
    } = req.body;

    if (!title || !recipientType || !category || !description) {
      res.status(400).json({ success: false, message: 'Title, recipient type, category and description are required' });
      return;
    }

    const award = await AwardRecognition.create({
      gymId,
      createdBy: userId,
      title: title.trim(),
      recipientType,
      category: category.trim(),
      description: description.trim(),
      badgeIcon: badgeIcon || 'Trophy',
      awardPeriod: awardPeriod || 'Monthly',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      announcementDate: announcementDate ? new Date(announcementDate) : undefined,
      criteriaMetric: criteriaMetric || (recipientType === 'Trainer' ? 'completed_sessions' : 'workout_completions'),
      minCriteriaValue: Number(minCriteriaValue) || 0,
      winnerSelectionMethod: winnerSelectionMethod || 'OWNER_CONFIRMATION',
      prizeBonusAmount: Number(prizeBonusAmount) || 0,
      prizeDescription: prizeDescription?.trim(),
      allowDuplicateWinner: Boolean(allowDuplicateWinner),
      status: status || 'Active'
    });

    res.status(201).json({ success: true, award, message: 'Award created successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Get Owner Awards
export const getOwnerAwards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const awards = await AwardRecognition.find({ gymId })
      .populate('winnerUserId', 'firstName lastName email profilePicture role')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, awards });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 3. Get Eligible Candidates for an Award based on verified records
export const getEligibleCandidates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { awardId } = req.params;
    const user = await User.findById(req.user?.id).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const award = await AwardRecognition.findOne({ _id: awardId, gymId });
    if (!award) {
      res.status(404).json({ success: false, message: 'Award not found' });
      return;
    }

    if (award.recipientType === 'Customer') {
      // Find all active or registered gym customers
      const customers = await (User as any).find({
        $or: [{ gymId }, { role: 'MEMBER' }]
      }).select('firstName lastName email profilePicture createdAt').lean();

      const candidateResults: any[] = [];

      for (const cust of customers) {
        // Attendance & streak from membership
        const membership: any = await (CustomerMembership as any).findOne({ userId: cust._id }).sort({ createdAt: -1 });
        const attendanceStreak = membership?.attendanceStreak || 0;
        const totalVisits = (membership?.attendanceHistory || []).filter((h: any) => h.status === 'Present').length;

        // Workout completions
        const workoutsCount = await (WorkoutProgress as any).countDocuments({
          customerId: cust._id,
          status: 'COMPLETED'
        });

        // Diet logs count
        const dietLogsCount = await (DietProgress as any).countDocuments({
          customerId: cust._id,
          'dailyLogs.date': { $exists: true }
        });

        // Challenges completed
        const completedChallengesCount = await (ChallengeParticipant as any).countDocuments({
          customerId: cust._id,
          completed: true
        });

        let primaryScore = 0;
        let metricDescription = '';

        if (award.criteriaMetric === 'attendance_streak') {
          primaryScore = attendanceStreak;
          metricDescription = `${attendanceStreak} days streak (${totalVisits} verified visits)`;
        } else if (award.criteriaMetric === 'workout_completions') {
          primaryScore = workoutsCount;
          metricDescription = `${workoutsCount} completed workout sessions`;
        } else if (award.criteriaMetric === 'challenge_completions') {
          primaryScore = completedChallengesCount;
          metricDescription = `${completedChallengesCount} completed challenges`;
        } else {
          primaryScore = workoutsCount + totalVisits;
          metricDescription = `${workoutsCount} workouts & ${totalVisits} visits`;
        }

        candidateResults.push({
          userId: cust._id,
          name: `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'Member',
          email: cust.email,
          profilePicture: cust.profilePicture,
          role: 'MEMBER',
          primaryScore,
          metricDescription,
          stats: {
            attendanceStreak,
            totalVisits,
            workoutsCount,
            dietLogsCount,
            completedChallengesCount
          }
        });
      }

      // Sort by primaryScore descending
      candidateResults.sort((a, b) => b.primaryScore - a.primaryScore);

      res.status(200).json({ success: true, candidates: candidateResults, award });
      return;
    }

    // Trainer Candidates
    const trainers = await (User as any).find({
      $or: [{ gymId, role: 'TRAINER' }, { role: 'TRAINER' }]
    }).select('firstName lastName email profilePicture').lean();

    const trainerResults: any[] = [];

    for (const tr of trainers) {
      // Completed sessions
      const completedSessions = await (TrainerSession as any).countDocuments({
        trainerId: tr._id,
        $or: [{ status: 'Completed' }, { attendanceStatus: 'Present' }]
      });

      // Average rating
      const ratedSessions = await (TrainerSession as any).find({
        trainerId: tr._id,
        customerRating: { $exists: true, $gt: 0 }
      }).select('customerRating');

      const avgRating = ratedSessions.length > 0
        ? Number((ratedSessions.reduce((acc: number, s: any) => acc + (s.customerRating || 0), 0) / ratedSessions.length).toFixed(1))
        : 5.0;

      // Distinct active customers
      const assignedCustomersCount = (await (TrainerSession as any).find({ trainerId: tr._id }).distinct('customerId')).length;

      let primaryScore = 0;
      let metricDescription = '';

      if (award.criteriaMetric === 'average_rating') {
        primaryScore = avgRating;
        metricDescription = `${avgRating}⭐ Rating (${ratedSessions.length} reviews)`;
      } else {
        primaryScore = completedSessions;
        metricDescription = `${completedSessions} completed sessions (${assignedCustomersCount} clients)`;
      }

      trainerResults.push({
        userId: tr._id,
        name: `${tr.firstName || ''} ${tr.lastName || ''}`.trim() || 'Trainer',
        email: tr.email,
        profilePicture: tr.profilePicture,
        role: 'TRAINER',
        primaryScore,
        metricDescription,
        stats: {
          completedSessions,
          avgRating,
          reviewCount: ratedSessions.length,
          assignedCustomersCount
        }
      });
    }

    trainerResults.sort((a, b) => b.primaryScore - a.primaryScore);

    res.status(200).json({ success: true, candidates: trainerResults, award });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Confirm Award Winner
export const confirmAwardWinner = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { awardId } = req.params;
    const { winnerUserId, winnerMetricAchieved } = req.body;

    const user = await User.findById(req.user?.id).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const award = await AwardRecognition.findOne({ _id: awardId, gymId });
    if (!award) {
      res.status(404).json({ success: false, message: 'Award not found' });
      return;
    }

    const winnerUser = await User.findById(winnerUserId);
    if (!winnerUser) {
      res.status(404).json({ success: false, message: 'Selected winner user not found' });
      return;
    }

    // Check duplicate award winner for the same period if not allowed
    if (!award.allowDuplicateWinner && award.awardPeriod) {
      const existingAward = await AwardRecognition.findOne({
        gymId,
        winnerUserId,
        awardPeriod: award.awardPeriod,
        category: award.category,
        _id: { $ne: award._id },
        status: { $in: ['Under Review', 'Published'] }
      });
      if (existingAward) {
        res.status(400).json({
          success: false,
          message: `${winnerUser.firstName} already has an award for this category and ${award.awardPeriod} period.`
        });
        return;
      }
    }

    award.winnerUserId = winnerUser._id as any;
    award.winnerName = `${winnerUser.firstName || ''} ${winnerUser.lastName || ''}`.trim();
    award.winnerRole = winnerUser.role === 'TRAINER' ? 'TRAINER' : 'MEMBER';
    award.winnerMetricAchieved = winnerMetricAchieved || 'Top Performance Criteria Met';
    award.status = 'Under Review';

    await award.save();

    res.status(200).json({ success: true, award, message: 'Award winner confirmed and moved to Under Review!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 5. Publish Award and Issue Certificate
export const publishAward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { awardId } = req.params;
    const user = await User.findById(req.user?.id).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const award = await AwardRecognition.findOne({ _id: awardId, gymId });
    if (!award) {
      res.status(404).json({ success: false, message: 'Award not found' });
      return;
    }

    if (!award.winnerUserId) {
      res.status(400).json({ success: false, message: 'Please select and confirm a winner before publishing' });
      return;
    }

    const certId = award.certificateId || generateCertificateId();
    award.certificateId = certId;
    award.certificateIssuedAt = new Date();
    award.publishedAt = new Date();
    award.status = 'Published';
    await award.save();

    // Send in-app notification to the winner
    await Notification.create({
      recipientId: award.winnerUserId,
      recipientRole: award.winnerRole === 'TRAINER' ? 'TRAINER' : 'MEMBER',
      gymId,
      title: '🏆 You Won an Official Gym Award!',
      message: `Congratulations! You have been awarded "${award.title}" (${award.category}). Your certificate is ready to download!`,
      type: 'success',
      relatedRecordId: award._id,
      link: award.winnerRole === 'TRAINER' ? '/trainer/rewards' : '/member/challenges'
    });

    res.status(200).json({
      success: true,
      award,
      certificateId: certId,
      message: 'Award officially published! Winner has been notified and certificate issued.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 6. Hall of Fame (Public / Authenticated Gym Members)
export const getHallOfFame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    if (!gymId) {
      res.status(404).json({ success: false, message: 'Gym not found' });
      return;
    }

    const hallOfFame = await AwardRecognition.find({
      gymId,
      status: 'Published'
    })
      .populate('winnerUserId', 'firstName lastName email profilePicture role')
      .sort({ publishedAt: -1 });

    res.status(200).json({ success: true, hallOfFame });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 7. My Awards (Customer or Trainer personal awards)
export const getMyAwards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    const myAwards = await AwardRecognition.find({
      $or: [{ gymId, winnerUserId: userId }, { winnerUserId: userId }],
      status: 'Published'
    }).sort({ publishedAt: -1 });

    res.status(200).json({ success: true, awards: myAwards });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 8. Delete Award
export const deleteAward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { awardId } = req.params;
    const user = await User.findById(req.user?.id).select('gymId');
    const gymId = req.user?.gymId || user?.gymId;

    const award = await AwardRecognition.findOneAndDelete({ _id: awardId, gymId });
    if (!award) {
      res.status(404).json({ success: false, message: 'Award not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Award deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
