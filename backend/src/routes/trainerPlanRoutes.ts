import express from 'express';
import {
  createManualPlanRequest,
  getCustomerTrainerPlans,
  getTrainerPlanRequests,
  approveTrainerPlanRequest,
  rejectTrainerPlanRequest,
  getAvailableTrainers,
  approveAndAssignDirectly,
  getTrainerClientsList,
  getTrainerEquipments,
  approveGymEquipment,
  getCustomerEquipments
} from '../controllers/trainerPlanRequestController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Customer routes
router.post('/manual-request', authenticate, createManualPlanRequest);
router.get('/customer', authenticate, getCustomerTrainerPlans);
router.get('/trainers', authenticate, getAvailableTrainers);
router.get('/equipments/customer', authenticate, getCustomerEquipments);

// Trainer routes
router.get('/trainer-requests', authenticate, getTrainerPlanRequests);
router.get('/clients', authenticate, getTrainerClientsList);
router.post('/trainer/approve-and-assign', authenticate, approveAndAssignDirectly);
router.patch('/requests/:id/approve', authenticate, approveTrainerPlanRequest);
router.patch('/requests/:id/reject', authenticate, rejectTrainerPlanRequest);

// Gym Equipment routes
router.get('/equipments/trainer', authenticate, getTrainerEquipments);
router.patch('/equipments/:id/approve', authenticate, approveGymEquipment);

export default router;

