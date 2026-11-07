import { Router } from 'express';
import { getUsersByRole, updateUserStatus, updateUser, deleteUser, createUser } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/', authenticate, getUsersByRole);
router.post('/', authenticate, createUser);
router.put('/:id/status', authenticate, updateUserStatus);
router.patch('/:id/status', authenticate, updateUserStatus);
router.put('/:id', authenticate, updateUser);
router.patch('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
