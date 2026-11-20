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
  completeProfile,
  getMyProfile,
  updateMyProfile,
  getMyGymTrainers,
  updateTrainer,
  getOnlineTrainers,
  toggleTrainerAvailability,
  getTrainerDashboardSummary,
  getMyAssignedClients,
  updateClientMetrics
} from '../controllers/trainerController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes for onboarding
router.get('/invitation/:token', verifyInvitation);
router.post('/invitation/:token/accept', acceptInvitation);
router.post('/profile', completeProfile); // Completes profile, sets to pending

// Trainer self-profile & isolated dashboard routes
router.get('/dashboard-summary', authenticate, getTrainerDashboardSummary);
router.get('/my-clients', authenticate, getMyAssignedClients);
router.get('/my-members', authenticate, getMyAssignedClients);
router.patch('/clients/:customerId/metrics', authenticate, updateClientMetrics);
router.put('/clients/:customerId/metrics', authenticate, updateClientMetrics);
router.get('/my-profile', authenticate, getMyProfile);
router.patch('/my-profile', authenticate, updateMyProfile);
router.put('/my-profile', authenticate, updateMyProfile);
router.patch('/availability', authenticate, toggleTrainerAvailability);

// Member routes
router.get('/my-gym', authenticate, getMyGymTrainers);
router.get('/online-available', authenticate, getOnlineTrainers);

// Protected gym owner routes
router.get('/invitations/list', authenticate, async (req: any, res: any) => {
  try {
    const TrainerInvitation = (await import('../models/TrainerInvitation')).default;
    const invitations = await TrainerInvitation.find({ invitedBy: req.user?._id || req.user?.id }).lean();
    res.json({ success: true, invitations });
  } catch {
    res.json({ success: true, invitations: [] });
  }
});
router.post('/manual-add', authenticate, manualAddTrainer);
router.post('/invite', authenticate, inviteTrainer);

router.post('/', authenticate, manualAddTrainer);
router.get('/', authenticate, getTrainers);
router.get('/:id', authenticate, getTrainerById);
router.patch('/:id/status', authenticate, updateTrainerStatus);
router.put('/:id/status', authenticate, updateTrainerStatus);
router.put('/:id', authenticate, updateTrainer);
router.delete('/:id', authenticate, deleteTrainer);

export default router;
