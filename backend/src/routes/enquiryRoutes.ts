import express from 'express';
import { createEnquiry, getEnquiries, updateEnquiryStatus } from '../controllers/enquiryController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public route to submit an enquiry
router.post('/', createEnquiry);

// Protected routes
router.get('/', authenticate, getEnquiries);
router.put('/:id/status', authenticate, updateEnquiryStatus);

export default router;
