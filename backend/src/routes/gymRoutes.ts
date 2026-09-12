import express from 'express';
import { 
  createGym, 
  getGyms, 
  getGymById,
  getMyGym,
  updateGymStatus, 
  updateGym,
  deleteGym,
  getPublicGyms,
  getPublicGymById
} from '../controllers/gymController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/', createGym);
router.get('/', getGyms);
router.get('/public', getPublicGyms);
router.get('/public/:id', getPublicGymById);
router.get('/my-gym', authenticate, getMyGym);
router.get('/:id', getGymById);
router.patch('/:id/status', updateGymStatus);
router.put('/:id', updateGym);
router.delete('/:id', deleteGym);

export default router;
