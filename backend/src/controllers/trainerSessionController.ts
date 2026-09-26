import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import TrainerSession, { TrainerSessionStatus, TrainerSessionMode } from '../models/TrainerSession';
import Trainer from '../models/Trainer';
import User from '../models/User';
import { notify } from '../utils/notificationUtils';

// 1. Create a Booking Request
export const createSessionRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
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

    const session = new TrainerSession({
      customerId,
      trainerId,
      gymId: trainer.gymId,
      mode,
      date,
      startTime,
      endTime,
      duration,
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
      res.status(400).json({ success: false, message: 'Only pending requests can be accepted' });
      return;
    }

    session.status = TrainerSessionStatus.AWAITING_PAYMENT;
    await session.save();

    // Notify customer
    await notify({
      recipientId: session.customerId.toString(),
      recipientRole: 'MEMBER',
      gymId: session.gymId.toString(),
      title: 'Session Accepted',
      message: `Your session on ${session.date} was accepted. Please complete payment.`,
      type: 'success',
      relatedRecordId: session.id,
      link: '/member/sessions'
    });

    res.status(200).json({ success: true, message: 'Session accepted. Awaiting payment.', session });
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
      title: 'Session Rejected',
      message: `Your session on ${session.date} was rejected.`,
      type: 'error',
      relatedRecordId: session.id
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

    if (session.status !== TrainerSessionStatus.AWAITING_PAYMENT) {
      res.status(400).json({ success: false, message: 'Session is not awaiting payment' });
      return;
    }

    // Process payment integration here (Mocked for now)
    session.status = TrainerSessionStatus.CONFIRMED;
    session.paymentStatus = 'Paid';
    session.sessionId = 'SESS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    if (session.mode === TrainerSessionMode.ONLINE) {
      session.meetingId = Math.floor(100000000 + Math.random() * 900000000).toString();
      session.meetingLink = `https://meet.aigym.com/${session.meetingId}`;
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
    if (!session || session.status !== TrainerSessionStatus.COMPLETED) {
      res.status(400).json({ success: false, message: 'Session not eligible for rating' });
      return;
    }

    session.customerRating = rating;
    session.customerReview = review;
    await session.save();

    res.status(200).json({ success: true, message: 'Rating submitted', session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 9. Get Member Sessions
export const getMemberSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customerId = req.user?.id;
    const sessions = await TrainerSession.find({ customerId })
      .populate('trainerId', 'name profilePhoto specialization')
      .sort({ date: -1, startTime: -1 });
    res.status(200).json({ success: true, sessions });
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
    res.status(200).json({ success: true, sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// 11. Get Gym Sessions
export const getGymSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const sessions = await TrainerSession.find({ gymId })
      .populate('trainerId', 'name profilePhoto specialization')
      .populate('customerId', 'firstName lastName profilePhoto')
      .sort({ date: -1, startTime: -1 });
    res.status(200).json({ success: true, sessions });
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
