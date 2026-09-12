import express from 'express';
import { 
  createTrainer, 
  getTrainers, 
  getTrainerById, 
  updateTrainerStatus, 
  deleteTrainer 
} from '../controllers/trainerController';

const router = express.Router();

router.post('/', createTrainer);
router.get('/', getTrainers);
router.get('/:id', getTrainerById);
router.patch('/:id/status', updateTrainerStatus);
router.delete('/:id', deleteTrainer);

export default router;
