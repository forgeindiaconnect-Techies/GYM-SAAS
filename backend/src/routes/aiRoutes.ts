import express from 'express';
import { 
  generateRecommendation, 
  getLatestRecommendation, 
  getAssignedCustomersWithAI, 
  getCustomerRecommendation, 
  reviewRecommendation,
  getAdminRecommendations,
  getAdminRecommendationDetails,
  getTrainerRecommendations
} from '../controllers/aiController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// Member Routes
router.post('/member/generate', authenticate, authorize(['MEMBER']), generateRecommendation);
router.get('/member/latest', authenticate, authorize(['MEMBER']), getLatestRecommendation);

// Trainer Routes
router.get('/trainer/customers', authenticate, authorize(['TRAINER']), getAssignedCustomersWithAI);
router.get('/trainer/customer/:customerId', authenticate, authorize(['TRAINER']), getCustomerRecommendation);
router.get('/trainer/recommendations', authenticate, authorize(['TRAINER']), getTrainerRecommendations);
router.put('/trainer/recommendation/:id/review', authenticate, authorize(['TRAINER']), reviewRecommendation);
// Admin Routes
router.get('/admin/recommendations', authenticate, authorize(['GYM_OWNER', 'GYM_ADMIN', 'ADMIN']), getAdminRecommendations);
router.get('/admin/recommendation/:id', authenticate, authorize(['GYM_OWNER', 'GYM_ADMIN', 'ADMIN']), getAdminRecommendationDetails);

export default router;
