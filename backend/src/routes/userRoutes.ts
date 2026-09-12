import { Router } from 'express';
import { getUsersByRole, updateUserStatus, updateUser, deleteUser } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getUsersByRole);
router.put('/:id/status', authenticate, updateUserStatus);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
