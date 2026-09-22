import express from 'express';
import { authenticate } from '../middlewares/auth';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notification.controller';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
