import express from 'express';
import {
  getGymCustomersPerformance,
  getGymTrainersPerformance,
  getMyCustomerPerformance,
  getMyTrainerPerformance
} from '../controllers/performanceController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);

// Gym Owner routes
router.get('/customers', getGymCustomersPerformance);
router.get('/trainers', getGymTrainersPerformance);

// Customer self route
router.get('/my-performance', getMyCustomerPerformance);

// Trainer self route
router.get('/my-trainer-performance', getMyTrainerPerformance);

export default router;
