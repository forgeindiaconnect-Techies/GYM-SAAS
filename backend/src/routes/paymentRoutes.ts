import express from 'express';
import { authenticate } from '../middlewares/auth';
import { submitPayment, verifyPayment, getGymPayments, getMyPaymentHistory } from '../controllers/paymentController';

const router = express.Router();

router.post('/submit', authenticate, submitPayment);
router.post('/verify/:id', authenticate, verifyPayment); // For Gym Owner
router.get('/gym', authenticate, getGymPayments); // For Gym Owner
router.get('/my-history', authenticate, getMyPaymentHistory); // For Customer

export default router;
