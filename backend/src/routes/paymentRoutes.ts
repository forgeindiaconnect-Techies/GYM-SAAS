import express from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { submitPayment, verifyPayment, getGymPayments, getMyPaymentHistory } from '../controllers/paymentController';

const router = express.Router();
const staffAuth = authorize(['GYM_OWNER', 'GYM_MANAGER', 'ADMIN', 'SUPER_ADMIN']);

router.post('/submit', authenticate, submitPayment);
router.post('/verify/:id', authenticate, staffAuth, verifyPayment); // For Gym Owner
router.get('/gym', authenticate, staffAuth, getGymPayments); // For Gym Owner
router.get('/my', authenticate, getMyPaymentHistory); // For Customer
router.get('/my-history', authenticate, getMyPaymentHistory); // For Customer

export default router;
