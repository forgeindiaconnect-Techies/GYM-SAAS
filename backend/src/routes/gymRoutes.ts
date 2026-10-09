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
  getPublicGymById,
  updatePaymentSettings,
  getCommunityTestimonials,
  updateGymLocation
} from '../controllers/gymController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/', createGym);
router.get('/', getGyms);
router.get('/public', getPublicGyms);
router.get('/community-testimonials', getCommunityTestimonials);
router.get('/public/:id', getPublicGymById);
router.get('/my-gym', authenticate, getMyGym);
router.put('/my-gym/location', authenticate, updateGymLocation);
router.get('/:id', getGymById);
router.patch('/:id/status', updateGymStatus);
router.patch('/:id/payment-settings', authenticate, updatePaymentSettings);
router.put('/:id', updateGym);
router.delete('/:id', deleteGym);

export default router;

