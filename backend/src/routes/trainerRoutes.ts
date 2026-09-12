import express from 'express';
import { 
  manualAddTrainer, 
  inviteTrainer,
  getTrainers, 
  getTrainerById, 
  updateTrainerStatus, 
  deleteTrainer,
  verifyInvitation,
  acceptInvitation,
  completeProfile
} from '../controllers/trainerController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes for onboarding
router.get('/invitation/:token', verifyInvitation);
router.post('/invitation/:token/accept', acceptInvitation);
router.post('/profile', completeProfile); // Completes profile, sets to pending

// Protected gym owner routes
router.post('/manual-add', authenticate, manualAddTrainer);
router.post('/invite', authenticate, inviteTrainer);
router.get('/', authenticate, getTrainers);
router.get('/:id', authenticate, getTrainerById);
router.patch('/:id/status', authenticate, updateTrainerStatus);
router.delete('/:id', authenticate, deleteTrainer);

export default router;
