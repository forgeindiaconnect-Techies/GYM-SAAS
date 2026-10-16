import express from 'express';
import { authenticate } from '../middlewares/auth';
import { 
  getContacts, 
  getHistory, 
  sendMessage, 
  uploadAttachment, 
  messageUploadMiddleware 
} from '../controllers/directMessageController';

const router = express.Router();

router.use(authenticate);

router.get('/contacts', getContacts);
router.get('/history/:otherUserId', getHistory);
router.post('/send', sendMessage);
router.post('/upload', messageUploadMiddleware.single('file'), uploadAttachment);

export default router;
