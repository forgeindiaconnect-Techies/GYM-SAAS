import express from 'express';
import {
  logWorkoutProgress,
  getMyProgress,
  getCustomerProgress,
  getTrainerClientsOverview,
  getTrainerRecentActivity
} from '../controllers/workoutProgressController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Customer
router.post('/log', authenticate, logWorkoutProgress);
router.get('/my-progress', authenticate, getMyProgress);

// Trainer
router.get('/trainer/clients-overview', authenticate, getTrainerClientsOverview);
router.get('/trainer/recent-activity', authenticate, getTrainerRecentActivity);
router.get('/customer/:customerId', authenticate, getCustomerProgress);

export default router;
