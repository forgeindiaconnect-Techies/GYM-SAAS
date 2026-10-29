import express from 'express';
import { 
  getPublicJobs, 
  getPublicJobById, 
  createOwnerJob, 
  getOwnerJobs, 
  getOwnerJobById, 
  updateOwnerJob, 
  toggleJobStatus, 
  deleteOwnerJob, 
  getOwnerApplications, 
  getOwnerApplicationById, 
  updateApplicationStatus, 
  scheduleInterview, 
  getOwnerInterviews, 
  updateInterview, 
  issueJobOffer, 
  getOwnerOffers, 
  getOwnerHiredTrainers,
  applyToJob,
  getTrainerApplications,
  getTrainerApplicationById,
  withdrawApplication,
  getTrainerInterviews,
  getTrainerOffers,
  respondToJobOffer,
  // Direct Hiring & Trainer Discovery
  getPublicTrainers,
  getPublicTrainerById,
  uploadDocument,
  getOwnerTrainers,
  toggleShortlistTrainer,
  createHiringRequest,
  getOwnerHiringRequests,
  confirmHiringRequest,
  ownerNegotiateHiringRequest,
  getTrainerHiringRequests,
  respondToHiringRequest,
  getTrainerRecruitmentProfile,
  updateTrainerRecruitmentProfile
} from '../controllers/hiringController';
import { authenticate } from '../middlewares/auth';
import { resumeUpload } from '../middlewares/resumeUpload';

const router = express.Router();

// ==========================================
// Public routes
// ==========================================
router.get('/jobs', getPublicJobs);
router.get('/jobs/:id', getPublicJobById);
router.get('/public/trainers', getPublicTrainers);
router.get('/public/trainers/:id', getPublicTrainerById);
router.post('/upload', resumeUpload.single('file'), uploadDocument);

// ==========================================
// Gym Owner routes
// ==========================================
router.post('/owner/jobs', authenticate, createOwnerJob);
router.post('/admin/jobs', authenticate, createOwnerJob);
router.get('/owner/jobs', authenticate, getOwnerJobs);
router.get('/admin/jobs', authenticate, getOwnerJobs);
router.get('/owner/jobs/:id', authenticate, getOwnerJobById);
router.get('/admin/jobs/:id', authenticate, getOwnerJobById);
router.put('/owner/jobs/:id', authenticate, updateOwnerJob);
router.put('/admin/jobs/:id', authenticate, updateOwnerJob);
router.patch('/owner/jobs/:id/status', authenticate, toggleJobStatus);
router.patch('/admin/jobs/:id/status', authenticate, toggleJobStatus);
router.delete('/owner/jobs/:id', authenticate, deleteOwnerJob);
router.delete('/admin/jobs/:id', authenticate, deleteOwnerJob);

router.get('/owner/applications', authenticate, getOwnerApplications);
router.get('/admin/applications', authenticate, getOwnerApplications);
router.get('/owner/applications/:id', authenticate, getOwnerApplicationById);
router.get('/admin/applications/:id', authenticate, getOwnerApplicationById);
router.patch('/owner/applications/:id/status', authenticate, updateApplicationStatus);
router.patch('/admin/applications/:id/status', authenticate, updateApplicationStatus);

router.post('/owner/applications/:id/interview', authenticate, scheduleInterview);
router.post('/admin/interviews', authenticate, scheduleInterview);
router.get('/owner/interviews', authenticate, getOwnerInterviews);
router.get('/admin/interviews', authenticate, getOwnerInterviews);
router.patch('/owner/interviews/:id', authenticate, updateInterview);
router.patch('/admin/interviews/:id', authenticate, updateInterview);

router.post('/owner/applications/:id/offer', authenticate, issueJobOffer);
router.post('/admin/offers', authenticate, issueJobOffer);
router.get('/owner/offers', authenticate, getOwnerOffers);
router.get('/admin/offers', authenticate, getOwnerOffers);
router.get('/owner/hired', authenticate, getOwnerHiredTrainers);

// Direct Hiring: Gym Owner
router.get('/owner/trainers', authenticate, getOwnerTrainers);
router.post('/owner/trainers/:id/shortlist', authenticate, toggleShortlistTrainer);
router.post('/owner/hiring-requests', authenticate, createHiringRequest);
router.get('/owner/hiring-requests', authenticate, getOwnerHiringRequests);
router.post('/owner/hiring-requests/:id/confirm', authenticate, confirmHiringRequest);
router.post('/owner/hiring-requests/:id/negotiate', authenticate, ownerNegotiateHiringRequest);

// ==========================================
// Trainer routes
// ==========================================
router.post('/trainer/apply/:jobId', authenticate, resumeUpload.single('resume'), applyToJob);
router.get('/trainer/my-applications', authenticate, getTrainerApplications);
router.get('/trainer/applications', authenticate, getTrainerApplications);
router.get('/trainer/my-applications/:id', authenticate, getTrainerApplicationById);
router.get('/trainer/applications/:id', authenticate, getTrainerApplicationById);
router.patch('/trainer/my-applications/:id/withdraw', authenticate, withdrawApplication);
router.patch('/trainer/applications/:id/withdraw', authenticate, withdrawApplication);
router.get('/trainer/my-interviews', authenticate, getTrainerInterviews);
router.get('/trainer/my-offers', authenticate, getTrainerOffers);
router.post('/trainer/my-offers/:id/respond', authenticate, respondToJobOffer);

// Direct Hiring: Trainer
router.get('/trainer/hiring-requests', authenticate, getTrainerHiringRequests);
router.post('/trainer/hiring-requests/:id/respond', authenticate, respondToHiringRequest);
router.get('/trainer/profile', authenticate, getTrainerRecruitmentProfile);
router.put('/trainer/profile', authenticate, updateTrainerRecruitmentProfile);

export default router;
