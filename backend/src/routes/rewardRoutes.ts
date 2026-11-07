import express from 'express';
import {
  createReward,
  getOwnerRewards,
  updateReward,
  deleteReward,
  updateClaimStatus,
  getMemberRewards,
  claimReward,
  getTrainerRewards
} from '../controllers/rewardController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All reward routes require authentication
router.use(authenticate);

// Dynamic root rewards endpoint for all roles
router.get('/', (req: any, res: any) => {
  if (req.user?.role === 'TRAINER') return getTrainerRewards(req, res);
  if (req.user?.role === 'MEMBER') return getMemberRewards(req, res);
  return getOwnerRewards(req, res);
});

// Owner operations
router.post('/', createReward);
router.get('/owner', getOwnerRewards);
router.put('/:id', updateReward);
router.delete('/:id', deleteReward);
router.put('/claims/:claimId/status', updateClaimStatus);

// Member operations
router.get('/member', getMemberRewards);
router.post('/claim', claimReward);

// Trainer operations
router.get('/trainer', getTrainerRewards);
router.post('/trainer/claim', claimReward);

export default router;
