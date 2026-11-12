import { Router } from 'express';
import { 
  register, registerTrainer, registerGymOwner, login, getMe, sendOtp, verifyOtp, 
  forgotPassword, resetPassword, sendGymOwnerInvitation, sendGymOwnerExpiryWarning 
} from '../controllers/authController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/register/customer', register);
router.post('/register-trainer', registerTrainer);
router.post('/register-gym-owner', registerGymOwner);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/send-gym-invitation', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), sendGymOwnerInvitation);
router.post('/send-expiry-warning', authenticate, authorize(['SUPER_ADMIN', 'ADMIN']), sendGymOwnerExpiryWarning);
router.get('/me', authenticate, getMe);

export default router;
