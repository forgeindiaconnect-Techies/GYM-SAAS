import express from 'express';
import { 
  selectPlan, 
  processPayment, 
  renewSubscription,
  upgradeSubscription,
  getMySubscription, 
  getMySubscriptionHistory,
  getAllSubscriptions, 
  updateSubscriptionStatus,
  deleteSubscription,
  resendSubscriptionEmail
} from '../controllers/subscriptionController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/select', authenticate, selectPlan);
router.post('/process-payment', authenticate, processPayment);
router.post('/process', authenticate, processPayment);
router.post('/renew', authenticate, renewSubscription);
router.post('/upgrade', authenticate, upgradeSubscription);
router.post('/resend-email', authenticate, resendSubscriptionEmail);
router.get('/my', authenticate, getMySubscription);
router.get('/my-history', authenticate, getMySubscriptionHistory);
router.get('/all', authenticate, getAllSubscriptions);
router.put('/:id/status', authenticate, updateSubscriptionStatus);
router.delete('/:id', authenticate, deleteSubscription);

export default router;
