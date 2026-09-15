import express from 'express';
import { 
  createBranch, 
  getBranches, 
  getBranchById,
  updateBranch,
  updateBranchStatus,
  deleteBranch
} from '../controllers/branchController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/', authenticate, createBranch);
router.get('/', authenticate, getBranches);
router.get('/:id', authenticate, getBranchById);
router.put('/:id', authenticate, updateBranch);
router.patch('/:id/status', authenticate, updateBranchStatus);
router.delete('/:id', authenticate, deleteBranch);

export default router;
