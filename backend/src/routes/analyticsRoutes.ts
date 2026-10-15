import express from 'express';
import { getRevenueAnalytics } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// Route accessible by Super Admin, Gym Owner, Gym Admin, and Manager
router.get(
  '/revenue',
  authenticate,
  authorize(['SUPER_ADMIN', 'ADMIN', 'GYM_OWNER', 'GYM_MANAGER']),
  getRevenueAnalytics
);

export default router;
