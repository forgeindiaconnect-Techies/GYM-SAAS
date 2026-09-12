import express from 'express';
import { joinGym, getMyMemberships, verifyMembership } from '../controllers/membershipController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/join', authenticate, joinGym);
router.get('/my', authenticate, getMyMemberships);
router.put('/:id/verify', authenticate, verifyMembership); // Normally you'd add role-based auth here

export default router;
