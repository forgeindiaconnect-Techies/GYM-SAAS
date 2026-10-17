import express from 'express';
import {
  getMyGymPackages,
  getPublicGymPackages,
  getGymPackageById,
  createGymPackage,
  updateGymPackage,
  toggleGymPackageStatus,
  deleteGymPackage,
  getFitnessGoals,
} from '../controllers/gymPackageController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes (no auth required)
router.get('/public', getPublicGymPackages);           // GET /api/gym-packages/public?gymId=&fitnessGoal=
router.get('/fitness-goals', getFitnessGoals);          // GET /api/gym-packages/fitness-goals
router.get('/public/:id', getGymPackageById);           // GET /api/gym-packages/public/:id

// Gym Owner routes (auth required)
router.get('/', authenticate, getMyGymPackages);        // GET /api/gym-packages (owner's packages)
router.post('/', authenticate, createGymPackage);       // POST /api/gym-packages
router.put('/:id', authenticate, updateGymPackage);     // PUT /api/gym-packages/:id
router.patch('/:id/status', authenticate, toggleGymPackageStatus); // PATCH /api/gym-packages/:id/status
router.delete('/:id', authenticate, deleteGymPackage);  // DELETE /api/gym-packages/:id
router.get('/:id', authenticate, getGymPackageById);    // GET /api/gym-packages/:id

export default router;
