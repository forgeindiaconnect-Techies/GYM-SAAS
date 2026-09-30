import express from 'express';
import {
  createWorkoutVideo,
  getCustomerWorkoutVideos,
  getTrainerWorkoutVideos,
  updateWorkoutVideoStatus
} from '../controllers/workoutVideoController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/assign', authenticate, createWorkoutVideo);
router.get('/customer', authenticate, getCustomerWorkoutVideos);
router.get('/trainer', authenticate, getTrainerWorkoutVideos);
router.patch('/:id/status', authenticate, updateWorkoutVideoStatus);

export default router;
