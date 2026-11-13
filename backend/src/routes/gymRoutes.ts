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
  selectCustomerGym,
  updatePaymentSettings,
  getCommunityTestimonials,
  updateGymLocation,
  addGymReview,
  getGymOwnerReviews,
  getPlatformStats
} from '../controllers/gymController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();
const staffAuth = authorize(['GYM_OWNER', 'GYM_MANAGER', 'ADMIN', 'SUPER_ADMIN']);

router.post('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN', 'GYM_OWNER']), createGym);
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), getGyms);
router.get('/public', getPublicGyms);
router.get('/platform-stats', getPlatformStats);
router.get('/community-testimonials', getCommunityTestimonials);
router.get('/public/:id', getPublicGymById);
router.post('/public/:id/reviews', authenticate, addGymReview);
router.post('/:id/reviews', authenticate, addGymReview);
router.get('/my-gym', authenticate, getMyGym);
router.post('/select', authenticate, selectCustomerGym);
router.put('/select', authenticate, selectCustomerGym);
router.get('/owner/reviews', authenticate, getGymOwnerReviews);
router.put('/my-gym/location', authenticate, staffAuth, updateGymLocation);
router.get('/:id', authenticate, getGymById);
router.patch('/:id/status', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), updateGymStatus);
router.patch('/:id/payment-settings', authenticate, staffAuth, updatePaymentSettings);
router.put('/:id', authenticate, staffAuth, updateGym);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), deleteGym);

export default router;

