import express from 'express';
import { 
  generateRecommendation, 
  getLatestRecommendation, 
  getAssignedCustomersWithAI, 
  getCustomerRecommendation, 
  reviewRecommendation 
} from '../controllers/aiController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// Member Routes
router.post('/member/generate', authenticate, authorize(['MEMBER']), generateRecommendation);
router.get('/member/latest', authenticate, authorize(['MEMBER']), getLatestRecommendation);

// Trainer Routes
router.get('/trainer/customers', authenticate, authorize(['TRAINER']), getAssignedCustomersWithAI);
router.get('/trainer/customer/:customerId', authenticate, authorize(['TRAINER']), getCustomerRecommendation);
router.put('/trainer/recommendation/:id/review', authenticate, authorize(['TRAINER']), reviewRecommendation);

export default router;
