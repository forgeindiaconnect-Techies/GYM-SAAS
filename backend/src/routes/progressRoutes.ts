import express from 'express';
import {
  logProgressMetric,
  getCustomerProgressLogs,
  triggerAIReanalysis
} from '../controllers/progressController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.post('/log', authenticate, logProgressMetric);
router.get('/logs', authenticate, getCustomerProgressLogs);
router.get('/logs/:customerId', authenticate, getCustomerProgressLogs);
router.post('/reanalyze', authenticate, triggerAIReanalysis);
router.post('/reanalyze/:customerId', authenticate, triggerAIReanalysis);

export default router;
