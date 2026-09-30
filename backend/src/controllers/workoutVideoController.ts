import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import WorkoutVideo from '../models/WorkoutVideo';
import Trainer from '../models/Trainer';
import TrainerSession from '../models/TrainerSession';
import { notify } from '../utils/notificationUtils';

// Trainer creates/assigns workout video to customer
export const createWorkoutVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUserId = req.user?.id;
    const { customerId, title, exerciseName, videoUrl, difficultyLevel, duration, instructions, sets, reps, trainerNotes, sessionRefId } = req.body;

    const trainer = await Trainer.findOne({ userId: trainerUserId });
    if (!trainer) {
      res.status(403).json({ success: false, message: 'Trainer profile not found' });
      return;
    }

    if (!customerId || !title || !exerciseName || !videoUrl) {
      res.status(400).json({ success: false, message: 'Required fields missing' });
      return;
    }

    const video = new WorkoutVideo({
      trainerId: trainer._id,
      customerId,
      gymId: trainer.gymId,
      title,
      exerciseName,
      videoUrl,
      difficultyLevel: difficultyLevel || 'Beginner',
      duration: duration || '10 mins',
      instructions: instructions || '',
      sets: sets || '3',
      reps: reps || '12',
      trainerNotes: trainerNotes || '',
      sessionRefId: sessionRefId || undefined,
      status: 'Assigned'
    });

    await video.save();

    // If assigned for a missed/rescheduled session, mark session attendance as Self-Learning
    if (sessionRefId) {
      await TrainerSession.findByIdAndUpdate(sessionRefId, {
        isSelfLearning: true,
        attendanceStatus: 'Self-Learning'
      });
    }

    // Notify Customer
    await notify({
      recipientId: customerId.toString(),
      recipientRole: 'MEMBER',
      gymId: trainer.gymId.toString(),
      title: 'New Workout Video Assigned',
      message: `Your trainer ${trainer.name} assigned a workout video: "${title}".`,
      type: 'info',
      relatedRecordId: video.id,
      link: '/member/workout-videos'
    });

    res.status(201).json({ success: true, message: 'Workout video assigned successfully', video });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Customer views assigned videos
export const getCustomerWorkoutVideos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const videos = await WorkoutVideo.find({ customerId })
      .populate('trainerId', 'name profilePhoto specialization')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, videos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Trainer views videos assigned by them
export const getTrainerWorkoutVideos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUserId = req.user?.id;
    const trainer = await Trainer.findOne({ userId: trainerUserId });
    if (!trainer) {
      res.status(403).json({ success: false, message: 'Trainer profile not found' });
      return;
    }

    const videos = await WorkoutVideo.find({ trainerId: trainer._id })
      .populate('customerId', 'firstName lastName profilePhoto email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, videos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Customer updates video status (In Progress / Completed)
export const updateWorkoutVideoStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'In Progress' | 'Completed'

    const video = await WorkoutVideo.findById(id);
    if (!video) {
      res.status(404).json({ success: false, message: 'Video not found' });
      return;
    }

    video.status = status;
    if (status === 'Completed') {
      video.completedAt = new Date();
    }
    await video.save();

    // Notify trainer when completed
    if (status === 'Completed') {
      const trainer = await Trainer.findById(video.trainerId);
      if (trainer) {
        await notify({
          recipientId: trainer.userId.toString(),
          recipientRole: 'TRAINER',
          gymId: video.gymId.toString(),
          title: 'Workout Video Completed',
          message: `A client completed the assigned video exercise "${video.title}".`,
          type: 'success',
          relatedRecordId: video.id,
          link: '/trainer/workout-videos'
        });
      }
    }

    res.status(200).json({ success: true, message: `Video marked as ${status}`, video });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
