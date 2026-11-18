import express from 'express';
import { authenticate } from '../middlewares/auth';
import { getMemberSessions } from '../controllers/trainerSessionController';

const router = express.Router();

router.use(authenticate);

// Customer/Member attendance endpoint
router.get('/my', getMemberSessions);

export default router;
