import express from 'express';
import {
  getMyPublishedPlan,
  getCustomerWorkoutPlans,
  getTrainerWorkoutPlans,
  getWorkoutPlanById,
  createWorkoutPlan,
  updateWorkoutPlan,
  publishWorkoutPlan,
  deleteWorkoutPlan,
  buildPlanFromAI
} from '../controllers/workoutPlanController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Customer
router.get('/my', authenticate, getMyPublishedPlan);
router.get('/my-plan', authenticate, getMyPublishedPlan);

// Root fallback (Trainer / Customer)
router.get('/', authenticate, (req: any, res: any) => {
  if (req.user?.role === 'TRAINER') {
    return getTrainerWorkoutPlans(req, res);
  }
  return getMyPublishedPlan(req, res);
});

// Trainer / Staff
router.get('/trainer', authenticate, getTrainerWorkoutPlans);
router.get('/customer/:customerId', authenticate, getCustomerWorkoutPlans);
router.get('/:id', authenticate, getWorkoutPlanById);

router.post('/', authenticate, createWorkoutPlan);
router.put('/:id', authenticate, updateWorkoutPlan);
router.patch('/:id/publish', authenticate, publishWorkoutPlan);
router.delete('/:id', authenticate, deleteWorkoutPlan);

// AI Integration
router.post('/build-from-ai', authenticate, buildPlanFromAI);

export default router;
