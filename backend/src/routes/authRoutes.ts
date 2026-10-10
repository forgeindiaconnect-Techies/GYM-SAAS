import { Router } from 'express';
import { register, registerGymOwner, login, getMe, sendOtp, verifyOtp } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/register-gym-owner', registerGymOwner);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', authenticate, getMe);

export default router;
