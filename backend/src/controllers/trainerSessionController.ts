import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import TrainerSession, { TrainerSessionStatus, TrainerSessionMode } from '../models/TrainerSession';
import Trainer from '../models/Trainer';
import User from '../models/User';
import Gym from '../models/Gym';
import { notify } from '../utils/notificationUtils';

// 1. Create a Booking Request
export const createSessionRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.body.customerId || req.user?.id;
    if (!customerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { trainerId, mode, date, startTime, endTime, duration } = req.body;

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }

    let sessionMode = TrainerSessionMode.ONLINE;
    if (trainer.trainingMode === 'online') {
      sessionMode = TrainerSessionMode.ONLINE;
    } else if (trainer.trainingMode === 'offline') {
      sessionMode = TrainerSessionMode.OFFLINE;
    } else if (mode && typeof mode === 'string') {
      sessionMode = mode.toLowerCase() === 'offline' ? TrainerSessionMode.OFFLINE : TrainerSessionMode.ONLINE;
    }

    const session = new TrainerSession({
      customerId,
      trainerId,
      gymId: trainer.gymId,
      mode: sessionMode,
      date,
      startTime,
      endTime,
      duration: duration || 60,
      fee: trainer.fee || 0,
      status: TrainerSessionStatus.PENDING,
      bookingId: 'BKG-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    });

    await session.save();

    // Notify trainer
    await notify({
      recipientId: trainer.userId.toString(),
      recipientRole: 'TRAINER',
      gymId: trainer.gymId.toString(),
      title: 'New Session Request',
      message: `You have a new ${mode} session request for ${date} at ${startTime}.`,
      type: 'info',
      relatedRecordId: session.id,
      link: '/trainer/sessions'
    });

    res.status(201).json({ success: true, message: 'Session request sent successfully', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 2. Accept Session
export const acceptSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUserId = req.user?.id;
    const { id } = req.params;

    const trainer = await Trainer.findOne({ userId: trainerUserId });
    if (!trainer) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const session = await TrainerSession.findOne({ _id: id, trainerId: trainer._id });
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    if (session.status !== TrainerSessionStatus.PENDING) {
      res.status(400).json({ success: false, message: 'Only pending requests can be approved' });
      return;
    }

    session.status = TrainerSessionStatus.CONFIRMED;
    await session.save();

    // Notify customer
    await notify({
      recipientId: session.customerId.toString(),
      recipientRole: 'MEMBER',
      gymId: session.gymId.toString(),
      title: 'Booking Approved',
      message: `Your training session with ${trainer.name} on ${session.date} at ${session.startTime} has been confirmed.`,
      type: 'success',
      relatedRecordId: session.id,
      link: '/member/bookings'
    });

    res.status(200).json({ success: true, message: 'Session approved and confirmed successfully', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 3. Reject Session
export const rejectSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUserId = req.user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    const trainer = await Trainer.findOne({ userId: trainerUserId });
    if (!trainer) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const session = await TrainerSession.findOne({ _id: id, trainerId: trainer._id });
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    session.status = TrainerSessionStatus.REJECTED;
    session.cancelledBy = 'Trainer';
    session.cancellationReason = reason || 'Trainer rejected request';
    await session.save();

    await notify({
      recipientId: session.customerId.toString(),
      recipientRole: 'MEMBER',
      gymId: session.gymId.toString(),
      title: 'Booking Request Rejected',
      message: `Your session request for ${session.date} at ${session.startTime} was declined by ${trainer.name}.`,
      type: 'error',
      relatedRecordId: session.id,
      link: '/member/bookings'
    });

    res.status(200).json({ success: true, message: 'Session rejected', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 4. Pay For Session
export const payForSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const { id } = req.params;
    const { paymentMethod, transactionReference } = req.body;

    const session = await TrainerSession.findOne({ _id: id, customerId });
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    if (
      session.status !== TrainerSessionStatus.AWAITING_PAYMENT &&
      session.status !== TrainerSessionStatus.PENDING &&
      session.status !== TrainerSessionStatus.CONFIRMED
    ) {
      res.status(400).json({ success: false, message: 'Session is not eligible for payment' });
      return;
    }

    // Process payment integration here (Mocked for now)
    session.status = TrainerSessionStatus.CONFIRMED;
    session.paymentStatus = 'Paid';
    session.sessionId = 'SESS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    if (session.mode === TrainerSessionMode.ONLINE) {
      session.meetingId = Math.floor(100000000 + Math.random() * 900000000).toString();
      session.meetingLink = `https://meet.jit.si/aigym-${session.meetingId}`;
    }

    await session.save();

    await notify({
      recipientId: session.trainerId.toString(),
      recipientRole: 'TRAINER',
      gymId: session.gymId.toString(),
      title: 'Session Confirmed',
      message: `Payment received for session on ${session.date}.`,
      type: 'success',
      relatedRecordId: session.id
    });

    res.status(200).json({ success: true, message: 'Payment successful, session confirmed', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 5. Cancel Session
export const cancelSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    const session = await TrainerSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    const isCustomer = session.customerId.toString() === userId;
    
    session.status = TrainerSessionStatus.CANCELLED;
    session.cancelledBy = isCustomer ? 'Customer' : 'Trainer';
    session.cancellationReason = reason || 'User cancelled';
    session.cancelledAt = new Date();
    
    if (session.paymentStatus === 'Paid') {
      session.refundEligible = true;
      session.refundAmount = session.fee;
      session.refundStatus = 'Pending';
    }

    await session.save();

    const recipientId = isCustomer ? session.trainerId : session.customerId;
    const role = isCustomer ? 'TRAINER' : 'MEMBER';

    await notify({
      recipientId: recipientId.toString(),
      recipientRole: role,
      gymId: session.gymId.toString(),
      title: 'Session Cancelled',
      message: `Session on ${session.date} has been cancelled.`,
      type: 'error',
      relatedRecordId: session.id
    });

    res.status(200).json({ success: true, message: 'Session cancelled successfully', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 6. Reschedule Session
export const rescheduleSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { newDate, newStartTime, newEndTime, reason } = req.body;

    const session = await TrainerSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    session.originalDate = session.date;
    session.originalStartTime = session.startTime;
    session.date = newDate;
    session.startTime = newStartTime;
    session.endTime = newEndTime;
    session.rescheduleReason = reason;
    session.rescheduleRequestedBy = session.customerId.toString() === userId ? 'Customer' : 'Trainer';
    session.rescheduleTimestamp = new Date();
    
    if (session.status === TrainerSessionStatus.CONFIRMED || session.status === TrainerSessionStatus.UPCOMING) {
        session.status = TrainerSessionStatus.RESCHEDULE_REQUESTED;
    }

    await session.save();
    res.status(200).json({ success: true, message: 'Session reschedule requested', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 7. Complete Session
export const completeSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await TrainerSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    session.status = TrainerSessionStatus.COMPLETED;
    session.completedAt = new Date();
    await session.save();

    await notify({
      recipientId: session.customerId.toString(),
      recipientRole: 'MEMBER',
      gymId: session.gymId.toString(),
      title: 'Session Completed',
      message: `Your session on ${session.date} is complete. Please rate your trainer!`,
      type: 'info',
      relatedRecordId: session.id
    });

    res.status(200).json({ success: true, message: 'Session marked as completed', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 8. Rate Session
export const rateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    
    const session = await TrainerSession.findById(id);
    if (!session || (session.status !== TrainerSessionStatus.COMPLETED && session.status !== TrainerSessionStatus.CONFIRMED)) {
      res.status(400).json({ success: false, message: 'Session not eligible for rating' });
      return;
    }

    session.customerRating = Number(rating);
    session.customerReview = review;
    await session.save();

    // Update trainer rating summary
    const trainer = await Trainer.findById(session.trainerId);
    if (trainer) {
      const ratedSessions = await TrainerSession.find({ trainerId: trainer._id, customerRating: { $gt: 0 } });
      const totalReviews = ratedSessions.length;
      const sumRatings = ratedSessions.reduce((acc, s) => acc + (s.customerRating || 0), 0);
      const avg = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 5.0;
      trainer.averageRating = avg;
      trainer.totalReviews = totalReviews;
      await trainer.save();
    }

    res.status(200).json({ success: true, message: 'Rating submitted', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const checkInSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await TrainerSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    session.checkInTime = new Date();
    session.attendanceStatus = 'Present';
    session.status = TrainerSessionStatus.IN_PROGRESS;
    session.actualStartTime = new Date();
    await session.save();

    res.status(200).json({ success: true, message: 'Checked in successfully', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const checkOutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await TrainerSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    const now = new Date();
    session.checkOutTime = now;
    session.actualEndTime = now;
    session.status = TrainerSessionStatus.COMPLETED;
    session.attendanceStatus = 'Present';

    if (session.checkInTime) {
      const diffMs = now.getTime() - new Date(session.checkInTime).getTime();
      session.actualDuration = Math.max(1, Math.round(diffMs / 60000));
    } else {
      const autoIn = new Date(now.getTime() - 60 * 60 * 1000);
      session.checkInTime = autoIn;
      session.actualDuration = 60;
    }
    await session.save();

    const populated = await TrainerSession.findById(id)
      .populate('trainerId', 'name')
      .populate('customerId', 'firstName lastName');

    if (populated && session.gymId) {
      const gym = await Gym.findById(session.gymId);
      if (gym?.ownerId) {
        const cName = `${(populated.customerId as any)?.firstName || ''} ${(populated.customerId as any)?.lastName || ''}`.trim() || 'Member';
        const tName = (populated.trainerId as any)?.name || 'Trainer';
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        await notify({
          recipientId: gym.ownerId.toString(),
          recipientRole: 'GYM_OWNER',
          gymId: session.gymId.toString(),
          title: 'Member Checked Out',
          message: `${cName} completed training session with ${tName} and checked out at ${timeStr}.`,
          type: 'success',
          relatedRecordId: session._id.toString(),
          link: '/admin/session-bookings'
        });
      }
    }

    res.status(200).json({ success: true, message: 'Checked out successfully', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const submitSessionNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      exercisesCompleted,
      customerPerformance,
      problemsNoticed,
      dietRecommendations,
      workoutModifications,
      nextSessionFocus,
      additionalComments
    } = req.body;

    const session = await TrainerSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    session.sessionNotes = {
      exercisesCompleted,
      customerPerformance,
      problemsNoticed,
      dietRecommendations,
      workoutModifications,
      nextSessionFocus,
      additionalComments,
      submittedAt: new Date()
    };

    session.status = TrainerSessionStatus.COMPLETED;
    session.completedAt = new Date();
    if (!session.attendanceStatus) {
      session.attendanceStatus = 'Present';
    }
    await session.save();

    const trainer = await Trainer.findById(session.trainerId);
    if (trainer && session.fee > 0) {
      trainer.totalEarnings = (trainer.totalEarnings || 0) + session.fee;
      trainer.availableBalance = (trainer.availableBalance || 0) + session.fee;
      await trainer.save();
    }

    await notify({
      recipientId: session.customerId.toString(),
      recipientRole: 'MEMBER',
      gymId: session.gymId.toString(),
      title: 'Session Completed',
      message: 'Your trainer submitted session notes. You can view feedback and leave a rating.',
      type: 'success',
      relatedRecordId: session.id,
      link: '/member/sessions'
    });

    res.status(200).json({ success: true, message: 'Session notes submitted and session completed', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 9. Get Member Sessions
export const getMemberSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const sessions = await TrainerSession.find({ customerId })
      .populate('trainerId', 'name profilePhoto specialization trainingMode')
      .sort({ date: -1, startTime: -1 });

    const normalizedSessions = sessions.map(s => {
      const doc = s.toObject ? s.toObject() : s;
      if (doc.trainerId && (doc.trainerId as any).trainingMode === 'online') {
        doc.mode = TrainerSessionMode.ONLINE;
      }
      return doc;
    });

    res.status(200).json({ success: true, sessions: normalizedSessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 10. Get Trainer Sessions
export const getTrainerSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerUserId = req.user?.id;
    const trainer = await Trainer.findOne({ userId: trainerUserId });
    if (!trainer) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const sessions = await TrainerSession.find({ trainerId: trainer._id })
      .populate('customerId')
      .sort({ date: -1, startTime: -1 });

    const normalizedSessions = sessions.map(s => {
      const doc = s.toObject ? s.toObject() : s;
      if (trainer.trainingMode === 'online') {
        doc.mode = TrainerSessionMode.ONLINE;
      }
      return doc;
    });

    res.status(200).json({ success: true, sessions: normalizedSessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 11. Get Gym Sessions
export const getGymSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const sessions = await TrainerSession.find({ gymId })
      .populate('trainerId', 'name profilePhoto specialization trainingMode')
      .populate('customerId', 'firstName lastName profilePhoto email')
      .sort({ date: -1, startTime: -1 });

    const normalizedSessions = sessions.map(s => {
      const doc = s.toObject ? s.toObject() : s;
      if (doc.trainerId && (doc.trainerId as any).trainingMode === 'online') {
        doc.mode = TrainerSessionMode.ONLINE;
      }
      return doc;
    });

    res.status(200).json({ success: true, sessions: normalizedSessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 12. Refund Session
export const refundSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await TrainerSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    if (session.paymentStatus !== 'Paid') {
      res.status(400).json({ success: false, message: 'Session is not paid' });
      return;
    }

    session.status = TrainerSessionStatus.REFUNDED;
    session.refundStatus = 'Processed';
    session.paymentStatus = 'Refunded';
    await session.save();

    await notify({
      recipientId: session.customerId.toString(),
      recipientRole: 'MEMBER',
      gymId: session.gymId.toString(),
      title: 'Session Refunded',
      message: `Your payment for session on ${session.date} has been refunded.`,
      type: 'info',
      relatedRecordId: session.id
    });

    res.status(200).json({ success: true, message: 'Session refunded successfully', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 13. Update Session Status / Mode / Date
export const updateAdminSessionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, mode, date, startTime, endTime } = req.body;

    const session = await TrainerSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    if (status) session.status = status;
    if (mode) session.mode = mode;
    if (date) session.date = date;
    if (startTime) session.startTime = startTime;
    if (endTime) session.endTime = endTime;
    if (req.body.attendanceStatus) session.attendanceStatus = req.body.attendanceStatus;
    if (req.body.checkInTime) session.checkInTime = new Date(req.body.checkInTime);
    if (req.body.checkOutTime) session.checkOutTime = new Date(req.body.checkOutTime);

    await session.save();

    await notify({
      recipientId: session.customerId.toString(),
      recipientRole: 'MEMBER',
      gymId: session.gymId.toString(),
      title: `Session Updated (${session.status})`,
      message: `Your session booking ${session.bookingId || ''} has been updated to ${session.status}.`,
      type: 'info',
      relatedRecordId: session.id
    });

    res.status(200).json({ success: true, message: 'Session updated successfully', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 14. Update Session Attendance Status (Present / Late / Self-Learning / Absent)
export const updateSessionAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { attendanceStatus, checkInTime, checkOutTime } = req.body;

    const session = await TrainerSession.findById(id);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    if (attendanceStatus) {
      session.attendanceStatus = attendanceStatus;
      if (attendanceStatus === 'Present') {
        if (!session.checkInTime) session.checkInTime = new Date();
        session.status = TrainerSessionStatus.COMPLETED;
      } else if (attendanceStatus === 'Late') {
        if (!session.checkInTime) session.checkInTime = new Date();
      } else if (attendanceStatus === 'Self-Learning') {
        session.isSelfLearning = true;
      }
    }

    if (checkInTime) session.checkInTime = new Date(checkInTime);
    if (checkOutTime) session.checkOutTime = new Date(checkOutTime);

    await session.save();
    res.status(200).json({ success: true, message: 'Attendance updated successfully', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all reviews/ratings for a trainer
export const getTrainerReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trainerId = (req.user as any)?.trainerId || req.user?.id;
    if (!trainerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Find trainer document
    const trainer = await Trainer.findOne({
      $or: [{ _id: trainerId }, { userId: trainerId }]
    });
    if (!trainer) {
      res.status(404).json({ success: false, message: 'Trainer not found' });
      return;
    }

    const sessions = await TrainerSession.find({
      trainerId: trainer._id,
      customerRating: { $exists: true, $gt: 0 }
    })
      .populate('customerId', 'firstName lastName email profileImage')
      .sort({ updatedAt: -1 });

    // Summary stats
    const totalReviews = sessions.length;
    const avgRating = totalReviews > 0
      ? Number((sessions.reduce((acc, s) => acc + (s.customerRating || 0), 0) / totalReviews).toFixed(1))
      : 0;
    const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: sessions.filter(s => s.customerRating === star).length
    }));

    res.status(200).json({
      success: true,
      reviews: sessions,
      summary: { totalReviews, avgRating, ratingBreakdown }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
