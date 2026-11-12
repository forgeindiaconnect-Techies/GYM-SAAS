import { Router } from 'express';
import { getUsersByRole, updateUserStatus, updateUser, deleteUser, createUser, assignTrainerToCustomer, getCustomerDashboardSummary } from '../controllers/userController';
import { selectCustomerGym } from '../controllers/gymController';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();
const staffAuth = authorize(['GYM_OWNER', 'GYM_MANAGER', 'ADMIN', 'SUPER_ADMIN']);

router.get('/customer/dashboard-summary', authenticate, getCustomerDashboardSummary);
router.post('/me/select-gym', authenticate, selectCustomerGym);
router.get('/', authenticate, getUsersByRole);
router.post('/', authenticate, staffAuth, createUser);
router.post('/member', authenticate, staffAuth, createUser);
router.put('/:id/status', authenticate, staffAuth, updateUserStatus);
router.patch('/:id/status', authenticate, staffAuth, updateUserStatus);
router.patch('/:id/assign-trainer', authenticate, staffAuth, assignTrainerToCustomer);
router.put('/:id', authenticate, updateUser);
router.patch('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, staffAuth, deleteUser);

export default router;
