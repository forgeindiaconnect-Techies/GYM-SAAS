import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middlewares/auth';
import AwardRecognition from '../models/AwardRecognition';
import AwardCertificate from '../models/AwardCertificate';
import GymSignature from '../models/GymSignature';
import Gym from '../models/Gym';
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

const formatPeriodLabel = (award: any): string => {
  const fmt = (d: Date) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (award.startDate && award.endDate) {
    return `${award.awardPeriod || 'Custom'} (${fmt(award.startDate)} – ${fmt(award.endDate)})`;
  }
  return award.awardPeriod || 'Monthly';
};

// Helper: Generate (or return existing) certificate snapshot in MongoDB
const issueCertificateForAward = async (
  award: any,
  winnerUser: any,
  gymId: any
) => {
  const existing = await AwardCertificate.findOne({
    awardId: award._id,
    winnerUserId: winnerUser._id
  });
  if (existing) {
    if (!award.certificateId) {
      award.certificateId = existing.certificateId;
      award.certificateIssuedAt = existing.issuedAt;
    }
    return existing;
  }

  const gym = await Gym.findById(gymId).select('name logo ownerId').lean();
  const gymOwnerId = (gym as any)?.ownerId || award.createdBy;
  const [signature, ownerUser] = await Promise.all([
    GymSignature.findOne({ gymId }).lean(),
    User.findById(gymOwnerId).select('firstName lastName').lean()
  ]);

  const ownerFullName = ownerUser
    ? `${(ownerUser as any).firstName || ''} ${(ownerUser as any).lastName || ''}`.trim()
    : '';
  const certId = award.certificateId || generateCertificateId();
  const issuedAt = new Date();
  const achievementDate = award.announcementDate || award.endDate || issuedAt;
  const winnerName =
    award.winnerName ||
    `${winnerUser.firstName || ''} ${winnerUser.lastName || ''}`.trim() ||
    'Award Recipient';

  const signatureType: 'DIGITAL' | 'MANUAL' =
    award.signatureType === 'MANUAL' ? 'MANUAL' : 'DIGITAL';

  const cert = await AwardCertificate.create({
    certificateId: certId,
    gymId,
    awardId: award._id,
    winnerUserId: winnerUser._id,
    gymOwnerId,
    gymName: (gym as any)?.name || 'Gymora Fitness Center',
    gymLogo: (gym as any)?.logo || undefined,
    winnerName,
    winnerRole: winnerUser.role === 'TRAINER' ? 'TRAINER' : 'MEMBER',
    awardTitle: award.title,
    awardCategory: award.category,
    awardDescription: award.description,
    awardPeriod: formatPeriodLabel(award),
    achievementDate,
    metricAchieved: award.winnerMetricAchieved || 'Top Performance Criteria Met',
    ownerName: (signature as any)?.signatoryName || ownerFullName || 'Gym Owner',
    ownerDesignation: (signature as any)?.designation || 'Gym Owner',
    ownerSignatureImage:
      signatureType === 'DIGITAL' ? (signature as any)?.signatureImage || undefined : undefined,
    signatureType,
    issuedAt
  });

  award.certificateId = cert.certificateId;
  award.certificateIssuedAt = cert.issuedAt;
  return cert;
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
      signatureType,
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
      signatureType: signatureType === 'MANUAL' ? 'MANUAL' : 'DIGITAL',
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
      .sort({ createdAt: -1 })
      .lean();

    const awardIds = awards.map((a: any) => a._id);
    const certs = await AwardCertificate.find({ awardId: { $in: awardIds }, gymId }).lean();
    const certByAward = new Map<string, any>();
    certs.forEach((c: any) => certByAward.set(c.awardId.toString(), c));

    // Backfill AwardCertificate for any legacy award that already has a winner but no certificate record yet
    for (const a of awards as any[]) {
      if (a.winnerUserId && !certByAward.has(a._id.toString())) {
        try {
          const winnerId = a.winnerUserId?._id || a.winnerUserId;
          const winnerUser = await User.findById(winnerId).select('firstName lastName role').lean();
          if (winnerUser) {
            const createdCert = await issueCertificateForAward(a, winnerUser, gymId);
            certByAward.set(a._id.toString(), createdCert.toObject ? createdCert.toObject() : createdCert);
          }
        } catch {
          // Ignore duplicate race errors
        }
      }
    }

    const enrichedAwards = awards.map((a: any) => ({
      ...a,
      certificate: certByAward.get(a._id.toString()) || null
    }));

    res.status(200).json({ success: true, awards: enrichedAwards });
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
      // Find all active or registered gym customers strictly within this gym
      const customers = await (User as any).find({
        gymId,
        role: 'MEMBER'
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

    // Trainer Candidates strictly within this gym
    const trainers = await (User as any).find({
      gymId,
      role: 'TRAINER'
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

    const previousWinnerId = award.winnerUserId ? award.winnerUserId.toString() : null;
    if (previousWinnerId && previousWinnerId !== winnerUser._id.toString()) {
      await AwardCertificate.deleteMany({ awardId: award._id, winnerUserId: award.winnerUserId });
      award.certificateId = undefined;
      award.certificateIssuedAt = undefined;
    }

    award.winnerUserId = winnerUser._id as any;
    award.winnerName = `${winnerUser.firstName || ''} ${winnerUser.lastName || ''}`.trim();
    award.winnerRole = winnerUser.role === 'TRAINER' ? 'TRAINER' : 'MEMBER';
    award.winnerMetricAchieved = winnerMetricAchieved || 'Top Performance Criteria Met';
    award.status = 'Under Review';

    // Automatically generate certificate upon winner confirmation (no duplicates)
    const certificate = await issueCertificateForAward(award, winnerUser, gymId);

    await award.save();

    res.status(200).json({
      success: true,
      award,
      certificate,
      certificateId: certificate.certificateId,
      message: 'Award winner confirmed and official certificate generated!'
    });
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

    const winnerUser = await User.findById(award.winnerUserId);
    let certificate: any = null;
    if (winnerUser) {
      certificate = await issueCertificateForAward(award, winnerUser, gymId);
    }

    const certId = certificate?.certificateId || award.certificateId || generateCertificateId();
    award.certificateId = certId;
    award.certificateIssuedAt = certificate?.issuedAt || award.certificateIssuedAt || new Date();
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
      certificate,
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
    })
      .populate('gymId', 'name logo')
      .sort({ publishedAt: -1 })
      .lean();

    const awardIds = myAwards.map((a: any) => a._id);
    const certs = await AwardCertificate.find({
      awardId: { $in: awardIds },
      winnerUserId: userId
    }).lean();
    const certByAward = new Map<string, any>();
    certs.forEach((c: any) => certByAward.set(c.awardId.toString(), c));

    const enrichedMyAwards = myAwards.map((a: any) => ({
      ...a,
      certificate: certByAward.get(a._id.toString()) || null
    }));

    res.status(200).json({ success: true, awards: enrichedMyAwards });
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

// 9. Update Award Details
export const updateAward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { awardId } = req.params;
    const userId = req.user?.id;
    const user = await User.findById(userId).select('gymId');
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
      signatureType,
      prizeBonusAmount,
      prizeDescription,
      allowDuplicateWinner,
      status
    } = req.body;

    const award = await AwardRecognition.findOne({ _id: awardId, gymId });
    if (!award) {
      res.status(404).json({ success: false, message: 'Award not found' });
      return;
    }

    if (title !== undefined) award.title = title.trim();
    if (recipientType !== undefined) award.recipientType = recipientType;
    if (category !== undefined) award.category = category.trim();
    if (description !== undefined) award.description = description.trim();
    if (badgeIcon !== undefined) award.badgeIcon = badgeIcon;
    if (awardPeriod !== undefined) award.awardPeriod = awardPeriod;
    if (startDate !== undefined) award.startDate = startDate ? new Date(startDate) : undefined;
    if (endDate !== undefined) award.endDate = endDate ? new Date(endDate) : undefined;
    if (announcementDate !== undefined) award.announcementDate = announcementDate ? new Date(announcementDate) : undefined;
    if (criteriaMetric !== undefined) award.criteriaMetric = criteriaMetric;
    if (minCriteriaValue !== undefined) award.minCriteriaValue = Number(minCriteriaValue) || 0;
    if (winnerSelectionMethod !== undefined) award.winnerSelectionMethod = winnerSelectionMethod;
    if (signatureType !== undefined) {
      award.signatureType = signatureType === 'MANUAL' ? 'MANUAL' : 'DIGITAL';
    }
    if (prizeBonusAmount !== undefined) award.prizeBonusAmount = Number(prizeBonusAmount) || 0;
    if (prizeDescription !== undefined) award.prizeDescription = prizeDescription?.trim();
    if (allowDuplicateWinner !== undefined) award.allowDuplicateWinner = Boolean(allowDuplicateWinner);
    if (status !== undefined) award.status = status;

    await award.save();

    // Sync certificate details & signatureType when the award is edited
    if (award.winnerUserId) {
      const winnerUser = await User.findById(award.winnerUserId).select('firstName lastName role').lean();
      if (winnerUser) {
        await issueCertificateForAward(award, winnerUser, gymId);
        await award.save();
      }
      const sigType: 'DIGITAL' | 'MANUAL' = award.signatureType === 'MANUAL' ? 'MANUAL' : 'DIGITAL';
      const certUpdate: any = {
        awardTitle: award.title,
        awardCategory: award.category,
        awardDescription: award.description,
        awardPeriod: formatPeriodLabel(award),
        signatureType: sigType
      };
      if (signatureType !== undefined) {
        if (sigType === 'MANUAL') {
          certUpdate.$unset = { ownerSignatureImage: 1 };
        } else {
          const gymSig = await GymSignature.findOne({ gymId }).lean();
          if (gymSig) {
            certUpdate.ownerSignatureImage = (gymSig as any).signatureImage;
            certUpdate.ownerName = (gymSig as any).signatoryName;
            certUpdate.ownerDesignation = (gymSig as any).designation;
          }
        }
      }
      await AwardCertificate.findOneAndUpdate(
        { awardId: award._id, winnerUserId: award.winnerUserId },
        certUpdate
      );
    }

    res.status(200).json({ success: true, award, message: 'Award updated successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =========================================================
// DIGITAL SIGNATURE MANAGEMENT (GYM OWNER)
// =========================================================

const resolveOwnerGym = async (req: AuthRequest) => {
  const userId = req.user?.id;
  if (!userId) return { error: { status: 401, message: 'Unauthorized' } };

  const user = await User.findById(userId).select('firstName lastName role gymId').lean();
  if (!user) return { error: { status: 401, message: 'User not found' } };

  if (!['GYM_OWNER', 'ADMIN', 'SUPER_ADMIN'].includes((user as any).role)) {
    return { error: { status: 403, message: 'Only gym owners can manage gym digital signatures' } };
  }

  let gym: any = null;
  const gymId = req.user?.gymId || (user as any).gymId;
  if (gymId) {
    gym = await Gym.findById(gymId).select('name logo ownerId').lean();
  }
  if (!gym && (user as any).role === 'GYM_OWNER') {
    gym = await Gym.findOne({ ownerId: userId }).select('name logo ownerId').lean();
  }

  if (!gym) {
    return { error: { status: 404, message: 'Gym not found' } };
  }

  if ((user as any).role === 'GYM_OWNER' && gym.ownerId && gym.ownerId.toString() !== userId.toString()) {
    return { error: { status: 403, message: 'Access denied for this gym' } };
  }

  return { user, gym };
};

// 10. Get saved Digital Signature for the authenticated Gym Owner's gym
export const getGymSignature = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resolved = await resolveOwnerGym(req);
    if (resolved.error) {
      res.status(resolved.error.status).json({ success: false, message: resolved.error.message });
      return;
    }

    const { user, gym } = resolved;
    const signature = await GymSignature.findOne({ gymId: gym._id }).lean();
    const defaultSignatoryName =
      `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() || 'Gym Owner';

    res.status(200).json({
      success: true,
      signature: signature || null,
      gym: { _id: gym._id, name: gym.name, logo: gym.logo },
      defaultSignatoryName
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 11. Save or Update Digital Signature (PNG/JPG upload or canvas drawing)
export const upsertGymSignature = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resolved = await resolveOwnerGym(req);
    if (resolved.error) {
      res.status(resolved.error.status).json({ success: false, message: resolved.error.message });
      return;
    }

    const { user, gym } = resolved;
    const { signatureImage, signatoryName, designation } = req.body;

    if (!signatureImage || typeof signatureImage !== 'string') {
      res.status(400).json({ success: false, message: 'Signature image is required' });
      return;
    }

    const isValidImage =
      signatureImage.startsWith('data:image/png;base64,') ||
      signatureImage.startsWith('data:image/jpeg;base64,') ||
      signatureImage.startsWith('data:image/jpg;base64,');

    if (!isValidImage) {
      res.status(400).json({ success: false, message: 'Only PNG or JPG signature images are supported' });
      return;
    }

    // Limit base64 payload to ~3MB
    if (signatureImage.length > 4 * 1024 * 1024) {
      res.status(400).json({ success: false, message: 'Signature image size must be under 3MB' });
      return;
    }

    const resolvedName =
      (signatoryName && signatoryName.trim()) ||
      `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() ||
      'Gym Owner';
    const resolvedDesignation = (designation && designation.trim()) || 'Gym Owner';

    const signature = await GymSignature.findOneAndUpdate(
      { gymId: gym._id },
      {
        gymId: gym._id,
        ownerId: gym.ownerId || (user as any)._id,
        signatureImage,
        signatoryName: resolvedName,
        designation: resolvedDesignation
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      signature,
      message: 'Digital signature saved successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 12. Remove Digital Signature
export const deleteGymSignature = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resolved = await resolveOwnerGym(req);
    if (resolved.error) {
      res.status(resolved.error.status).json({ success: false, message: resolved.error.message });
      return;
    }

    const { gym } = resolved;
    await GymSignature.findOneAndDelete({ gymId: gym._id });

    res.status(200).json({
      success: true,
      message: 'Digital signature removed successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =========================================================
// CERTIFICATES (AUTHORIZED VIEW / DOWNLOAD)
// =========================================================

// 13. Get certificates issued ONLY to the authenticated Member / Trainer
export const getMyCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const certificates = await AwardCertificate.find({ winnerUserId: userId })
      .sort({ issuedAt: -1 })
      .lean();

    res.status(200).json({ success: true, certificates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 14. Get single certificate by certificateId (strict authorization)
export const getCertificateById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { certificateId } = req.params;
    const certificate = await AwardCertificate.findOne({ certificateId }).lean();
    if (!certificate) {
      res.status(404).json({ success: false, message: 'Certificate not found' });
      return;
    }

    if (role === 'MEMBER' || role === 'TRAINER') {
      if (certificate.winnerUserId.toString() !== userId.toString()) {
        res.status(403).json({ success: false, message: 'You can only access certificates issued to you' });
        return;
      }
    } else if (role === 'GYM_OWNER' || role === 'ADMIN') {
      const user = await User.findById(userId).select('gymId').lean();
      const userGymId = req.user?.gymId || (user as any)?.gymId;
      if (!userGymId || certificate.gymId.toString() !== userGymId.toString()) {
        res.status(403).json({ success: false, message: 'Access denied for this gym certificate' });
        return;
      }
    } else if (role !== 'SUPER_ADMIN') {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    res.status(200).json({ success: true, certificate });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


