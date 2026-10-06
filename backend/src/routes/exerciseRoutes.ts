import express from 'express';
import {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  toggleExerciseStatus,
  seedStandardExercises,
  uploadExerciseMedia
} from '../controllers/exerciseController';
import { authenticate } from '../middlewares/auth';
import { exerciseMediaUpload } from '../middlewares/exerciseUpload';

const router = express.Router();

// Public / Authenticated views
router.get('/', authenticate, getExercises);
router.get('/:id', authenticate, getExerciseById);

// Gym Owner Actions
router.post('/', authenticate, createExercise);
router.put('/:id', authenticate, updateExercise);
router.delete('/:id', authenticate, deleteExercise);
router.patch('/:id/status', authenticate, toggleExerciseStatus);
router.post('/seed-defaults', authenticate, seedStandardExercises);

// Media Upload (Video / Thumbnail)
router.post('/upload-media', authenticate, exerciseMediaUpload.single('file'), uploadExerciseMedia);

export default router;
