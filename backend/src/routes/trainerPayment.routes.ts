import express from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  setTrainerFee,
  updateTrainerFeeStatus,
  getTrainerFees,
  getPendingPayments,
  processPayment,
  getPaymentHistoryGymOwner,
  getTrainerEarningsGymOwner,
  getMyTrainerFee,
  getMyEarnings,
  getMyPaymentHistory,
  requestWithdrawal,
  getWithdrawalRequests,
  approveWithdrawal,
  rejectWithdrawal
} from '../controllers/trainerPayment.controller';

const router = express.Router();

router.use(authenticate);

// --- Gym Owner Routes ---
const gymOwnerAuth = authorize(['GYM_OWNER', 'GYM_MANAGER']);

router.post('/fee', gymOwnerAuth, setTrainerFee);
router.put('/fee/status', gymOwnerAuth, updateTrainerFeeStatus);
router.get('/fees', gymOwnerAuth, getTrainerFees);
router.get('/pending', gymOwnerAuth, getPendingPayments);
router.get('/withdrawals', gymOwnerAuth, getWithdrawalRequests);
router.put('/withdrawals/:id/approve', gymOwnerAuth, approveWithdrawal);
router.put('/withdrawals/:id/reject', gymOwnerAuth, rejectWithdrawal);
router.post('/process', gymOwnerAuth, processPayment);
router.get('/history', gymOwnerAuth, getPaymentHistoryGymOwner);
router.get('/gym-earnings', gymOwnerAuth, getTrainerEarningsGymOwner);

// --- Trainer Routes ---
const trainerAuth = authorize(['TRAINER']);

router.get('/my-fee', trainerAuth, getMyTrainerFee);
router.get('/my-earnings', trainerAuth, getMyEarnings);
router.get('/my-history', trainerAuth, getMyPaymentHistory);
router.post('/withdraw', trainerAuth, requestWithdrawal);

export default router;
