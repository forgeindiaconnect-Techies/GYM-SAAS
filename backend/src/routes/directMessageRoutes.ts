import express from 'express';
import { authenticate } from '../middlewares/auth';
import { getContacts, getHistory, sendMessage } from '../controllers/directMessageController';

const router = express.Router();

router.use(authenticate);

router.get('/contacts', getContacts);
router.get('/history/:otherUserId', getHistory);
router.post('/send', sendMessage);

export default router;
