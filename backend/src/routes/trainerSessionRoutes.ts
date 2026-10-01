import express from 'express';
import {
  createSessionRequest,
  getMemberSessions,
  getTrainerSessions,
  getGymSessions,
  acceptSession,
  rejectSession,
  payForSession,
  cancelSession,
  rescheduleSession,
  completeSession,
  rateSession,
  refundSession,
  checkInSession,
  checkOutSession,
  submitSessionNotes,
  updateAdminSessionStatus
} from '../controllers/trainerSessionController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Member routes
router.post('/request', authenticate, createSessionRequest);
router.get('/member', authenticate, getMemberSessions);
router.post('/:id/pay', authenticate, payForSession);
router.post('/:id/cancel', authenticate, cancelSession);
router.post('/:id/reschedule', authenticate, rescheduleSession);
router.post('/:id/rate', authenticate, rateSession);
router.post('/:id/check-in', authenticate, checkInSession);
router.post('/:id/check-out', authenticate, checkOutSession);

// Trainer routes
router.get('/trainer', authenticate, getTrainerSessions);
router.post('/:id/accept', authenticate, acceptSession);
router.post('/:id/reject', authenticate, rejectSession);
router.post('/:id/complete', authenticate, completeSession);
router.post('/:id/session-notes', authenticate, submitSessionNotes);

// Admin / Gym Owner routes
router.get('/gym', authenticate, getGymSessions);
router.post('/:id/refund', authenticate, refundSession);
router.patch('/:id/status', authenticate, updateAdminSessionStatus);
router.put('/:id/status', authenticate, updateAdminSessionStatus);

export default router;
