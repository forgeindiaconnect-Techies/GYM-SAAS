import express from 'express';
import {
  createAward,
  updateAward,
  getOwnerAwards,
  getEligibleCandidates,
  confirmAwardWinner,
  publishAward,
  getHallOfFame,
  getMyAwards,
  deleteAward
} from '../controllers/awardController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.use(authenticate);

// Owner operations
router.post('/', createAward);
router.get('/owner', getOwnerAwards);
router.put('/:awardId', updateAward);
router.get('/:awardId/candidates', getEligibleCandidates);
router.put('/:awardId/confirm-winner', confirmAwardWinner);
router.put('/:awardId/publish', publishAward);
router.delete('/:awardId', deleteAward);

// Common / Hall of Fame & Member/Trainer operations
router.get('/hall-of-fame', getHallOfFame);
router.get('/my-awards', getMyAwards);

export default router;
