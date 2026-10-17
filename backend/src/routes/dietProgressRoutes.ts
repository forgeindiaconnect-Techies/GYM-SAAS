import express from 'express';
import {
  toggleMealProgress,
  batchLogDayMeals,
  resetDayDietMeals,
  getMyDietProgress,
  getTrainerDietClientsOverview,
  getCustomerDietProgress
} from '../controllers/dietProgressController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Customer
router.post('/toggle-meal', authenticate, toggleMealProgress);
router.post('/batch-log', authenticate, batchLogDayMeals);
router.post('/reset-day', authenticate, resetDayDietMeals);
router.get('/my-progress', authenticate, getMyDietProgress);
router.get('/my', authenticate, getMyDietProgress);

// Trainer
router.get('/trainer/clients-overview', authenticate, getTrainerDietClientsOverview);
router.get('/clients-overview', authenticate, getTrainerDietClientsOverview);
router.get('/customer/:customerId', authenticate, getCustomerDietProgress);

export default router;
