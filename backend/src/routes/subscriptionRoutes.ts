import express from 'express';
import { selectPlan, processPayment, getMySubscription, getAllSubscriptions, updateSubscriptionStatus } from '../controllers/subscriptionController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/select', authenticate, selectPlan);
router.post('/process-payment', authenticate, processPayment);
router.get('/my', authenticate, getMySubscription);
router.get('/all', authenticate, getAllSubscriptions);
router.put('/:id/status', authenticate, updateSubscriptionStatus);

export default router;
