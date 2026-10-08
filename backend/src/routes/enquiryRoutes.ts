import express from 'express';
import { createEnquiry, getEnquiries, updateEnquiryStatus, submitContactMessage } from '../controllers/enquiryController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public route to submit contact message / enquiry
router.post('/contact', submitContactMessage);
router.post('/', createEnquiry);

// Protected routes
router.get('/', authenticate, getEnquiries);
router.put('/:id/status', authenticate, updateEnquiryStatus);

export default router;
