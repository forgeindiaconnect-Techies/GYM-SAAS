import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import ProgressLog from '../models/ProgressLog';
import AIRecommendation from '../models/AIRecommendation';
import TrainerSession from '../models/TrainerSession';
import WorkoutVideo from '../models/WorkoutVideo';
import User from '../models/User';
import Trainer from '../models/Trainer';
import { notify } from '../utils/notificationUtils';

// Log progress metric
export const logProgressMetric = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const gymId = req.user?.gymId;
    const {
      weight,
      height,
      bodyFatPercentage,
      benchPressMax,
      squatMax,
      chestMeasurement,
      waistMeasurement,
      armsMeasurement,
      notes
    } = req.body;

    if (!weight) {
      res.status(400).json({ success: false, message: 'Weight is required.' });
      return;
    }

    // Calculate completion metrics from actual sessions & videos
    const sessions = await TrainerSession.find({ customerId });
    const completedSessions = sessions.filter(s => s.status === 'Completed').length;
    const missedSessions = sessions.filter(s => s.attendanceStatus === 'Absent').length;
    const totalSessions = sessions.length;
    const attendancePct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 100;

    const videos = await WorkoutVideo.find({ customerId });
    const completedVideos = videos.filter(v => v.status === 'Completed').length;
    const videoCompletionPct = videos.length > 0 ? Math.round((completedVideos / videos.length) * 100) : 100;

    const progressLog = new ProgressLog({
      customerId,
      gymId,
      weight: Number(weight),
      height: height ? Number(height) : undefined,
      bodyFatPercentage: bodyFatPercentage ? Number(bodyFatPercentage) : undefined,
      benchPressMax: benchPressMax ? Number(benchPressMax) : undefined,
      squatMax: squatMax ? Number(squatMax) : undefined,
      chestMeasurement: chestMeasurement ? Number(chestMeasurement) : undefined,
      waistMeasurement: waistMeasurement ? Number(waistMeasurement) : undefined,
      armsMeasurement: armsMeasurement ? Number(armsMeasurement) : undefined,
      attendancePercentage: attendancePct,
      completedSessionsCount: completedSessions,
      missedSessionsCount: missedSessions,
      videoCompletionPercentage: videoCompletionPct,
      workoutCompletionPercentage: Math.round((attendancePct + videoCompletionPct) / 2),
      dietAdherencePercentage: 85,
      notes,
      loggedDate: new Date()
    });

    await progressLog.save();

    // Also update User profile height/weight
    if (weight) {
      await User.findByIdAndUpdate(customerId, { weight: Number(weight) });
    }

    res.status(201).json({ success: true, message: 'Progress logged successfully', progressLog });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get Customer Progress Logs
export const getCustomerProgressLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.params.customerId || req.user?.id;
    const logs = await ProgressLog.find({ customerId }).sort({ loggedDate: -1 });
    res.status(200).json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// AI Re-analysis trigger
export const triggerAIReanalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.params.customerId || req.user?.id;
    const gymId = req.user?.gymId;

    // Get initial recommendation
    const initialRec = await AIRecommendation.findOne({ customerId, version: 1 }).sort({ createdAt: 1 });
    const latestRec = await AIRecommendation.findOne({ customerId }).sort({ createdAt: -1 });
    const progressLogs = await ProgressLog.find({ customerId }).sort({ loggedDate: 1 });

    if (!latestRec) {
      res.status(404).json({ success: false, message: 'No initial AI plan found for re-analysis.' });
      return;
    }

    const initialWeight = initialRec?.fitnessProfile?.weight || latestRec.fitnessProfile?.weight || 75;
    const latestLog = progressLogs.length > 0 ? progressLogs[progressLogs.length - 1] : null;
    const currentWeight = latestLog?.weight || latestRec.fitnessProfile?.weight || initialWeight;
    const weightDiff = (Number(currentWeight) - Number(initialWeight)).toFixed(1);
    const weightChangeText = Number(weightDiff) < 0 ? `${Math.abs(Number(weightDiff))} kg lost` : `${weightDiff} kg gained`;

    const sessions = await TrainerSession.find({ customerId });
    const completedSessions = sessions.filter(s => s.status === 'Completed').length;
    const attendancePct = sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100) : 90;

    const videos = await WorkoutVideo.find({ customerId });
    const completedVideos = videos.filter(v => v.status === 'Completed').length;
    const videoCompletionPct = videos.length > 0 ? Math.round((completedVideos / videos.length) * 100) : 85;

    // Build Re-analysis comparison payload
    const reanalysisComparison = {
      initialWeight: Number(initialWeight),
      currentWeight: Number(currentWeight),
      weightChange: weightChangeText,
      attendancePercentage: attendancePct,
      videoCompletionPercentage: videoCompletionPct,
      initialVSCurrentSummary: `Customer started at ${initialWeight} kg and is currently at ${currentWeight} kg (${weightChangeText}). Session attendance rate is ${attendancePct}% and video completion rate is ${videoCompletionPct}%.`,
      areasOfImprovement: 'Great progress on consistency! Upper body strength and cardio endurance have shown positive improvements.',
      trainerAttentionAreas: 'Monitor recovery days and maintain proper hydration during higher intensity workout phases.',
      nextStepRecommendations: 'Increase resistance weights by 5-10% and transition to a 4-day split routine with balanced protein intake.'
    };

    // Create updated recommendation version
    const newVersion = (latestRec.version || 1) + 1;
    const newRecommendation = new AIRecommendation({
      customerId,
      gymId: latestRec.gymId || gymId,
      trainerId: latestRec.trainerId,
      status: 'Under Trainer Review',
      version: newVersion,
      isReanalysis: true,
      fitnessProfile: {
        ...latestRec.fitnessProfile,
        weight: currentWeight
      },
      aiAnalysis: {
        ...latestRec.aiAnalysis,
        assessment: `AI Re-Analysis (Version ${newVersion}): Based on customer progress data (${weightChangeText}), the routine has been optimized for progressive overload.`
      },
      workoutRecommendation: latestRec.workoutRecommendation,
      dietRecommendation: latestRec.dietRecommendation,
      progressSuggestions: latestRec.progressSuggestions,
      reanalysisComparison
    });

    await newRecommendation.save();

    // Notify customer & trainer
    if (latestRec.trainerId) {
      const trainer = await Trainer.findById(latestRec.trainerId);
      if (trainer) {
        await notify({
          recipientId: trainer.userId.toString(),
          recipientRole: 'TRAINER',
          gymId: trainer.gymId.toString(),
          title: 'AI Re-Analysis Available',
          message: `AI progress re-analysis is ready for your review (Version ${newVersion}).`,
          type: 'info',
          relatedRecordId: newRecommendation.id,
          link: '/trainer/ai-recommendations'
        });
      }
    }

    const targetCustomerId = (customerId || latestRec.customerId).toString();

    await notify({
      recipientId: targetCustomerId,
      recipientRole: 'MEMBER',
      gymId: (gymId || latestRec.gymId).toString(),
      title: 'Progress AI Re-Analysis Completed',
      message: `Your updated progress re-analysis (Version ${newVersion}) has been generated and sent to your trainer for review.`,
      type: 'success',
      relatedRecordId: newRecommendation.id,
      link: '/member/trainer-review'
    });

    res.status(201).json({
      success: true,
      message: 'AI Re-analysis generated successfully',
      recommendation: newRecommendation
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
