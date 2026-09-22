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
  getMyWithdrawalHistory,
  getMyPendingPayments,
  requestWithdrawal,
  getWithdrawalRequests,
  getAllWithdrawalRequests,
  updateWithdrawalStatus
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
router.put('/withdrawals/:id/status', gymOwnerAuth, updateWithdrawalStatus);
router.post('/process', gymOwnerAuth, processPayment);
router.get('/history', gymOwnerAuth, getPaymentHistoryGymOwner);
router.get('/gym-earnings', gymOwnerAuth, getTrainerEarningsGymOwner);

// --- Super Admin Routes ---
const superAdminAuth = authorize(['SUPER_ADMIN']);
router.get('/admin/withdrawals', superAdminAuth, getAllWithdrawalRequests);
router.put('/admin/withdrawals/:id/status', superAdminAuth, updateWithdrawalStatus);


// --- Trainer Routes ---
const trainerAuth = authorize(['TRAINER']);

router.get('/my-fee', trainerAuth, getMyTrainerFee);
router.get('/my-earnings', trainerAuth, getMyEarnings);
router.get('/my-history', trainerAuth, getMyPaymentHistory);
router.get('/my-pending', trainerAuth, getMyPendingPayments);
router.get('/my-withdrawals', trainerAuth, getMyWithdrawalHistory);
router.post('/withdraw', trainerAuth, requestWithdrawal);

export default router;
