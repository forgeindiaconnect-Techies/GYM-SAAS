import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  upload,
  validateImport,
  executeImport,
  getImportHistory,
  getImportHistoryById,
} from '../controllers/importController';

const router = Router();

// All import routes require authentication + GYM_OWNER or ADMIN role
router.use(authenticate);
router.use(authorize(['GYM_OWNER', 'ADMIN']));

// Validate uploaded file (parse + validate, no DB writes)
router.post('/validate', upload.single('file'), validateImport);

// Execute import (create/update customers in DB)
router.post('/execute', executeImport);

// Import history
router.get('/history', getImportHistory);
router.get('/history/:id', getImportHistoryById);

export default router;
