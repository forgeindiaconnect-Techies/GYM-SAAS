import express from 'express';
import { joinGym, getMyMemberships, verifyMembership, getGymMemberships } from '../controllers/membershipController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/join', authenticate, joinGym);
router.get('/my', authenticate, getMyMemberships);
router.get('/gym', authenticate, getGymMemberships);
router.put('/:id/verify', authenticate, verifyMembership);

export default router;
