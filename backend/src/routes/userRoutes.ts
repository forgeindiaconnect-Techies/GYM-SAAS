import { Router } from 'express';
import { getUsersByRole, updateUserStatus, updateUser, deleteUser, createUser, assignTrainerToCustomer, getCustomerDashboardSummary } from '../controllers/userController';
import { selectCustomerGym } from '../controllers/gymController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/customer/dashboard-summary', authenticate, getCustomerDashboardSummary);
router.post('/me/select-gym', authenticate, selectCustomerGym);
router.get('/', authenticate, getUsersByRole);
router.post('/', authenticate, createUser);
router.put('/:id/status', authenticate, updateUserStatus);
router.patch('/:id/status', authenticate, updateUserStatus);
router.patch('/:id/assign-trainer', authenticate, assignTrainerToCustomer);
router.put('/:id', authenticate, updateUser);
router.patch('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export default router;
