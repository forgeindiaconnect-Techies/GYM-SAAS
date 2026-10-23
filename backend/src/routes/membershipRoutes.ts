import express from 'express';
import {
  joinGym,
  getMyMemberships,
  verifyMembership,
  getGymMemberships,
  resendMembershipEmail,
  runMembershipExpiryCheck
} from '../controllers/membershipController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/join', authenticate, joinGym);
router.get('/my', authenticate, getMyMemberships);
router.get('/gym', authenticate, getGymMemberships);
router.put('/:id/verify', authenticate, verifyMembership);
router.post('/:id/resend-email', authenticate, resendMembershipEmail);
router.post('/check-expiry', authenticate, async (req, res) => {
  const result = await runMembershipExpiryCheck();
  res.status(200).json({ success: true, ...result });
});

export default router;
