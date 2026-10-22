import express from 'express';
import {
  createChallenge,
  getOwnerChallenges,
  updateChallenge,
  deleteChallenge,
  getChallengeParticipants,
  getMemberChallenges,
  joinChallenge,
  syncProgress,
  getChallengeLeaderboard,
  getTrainerCustomerProgress,
  trainerVerifyWorkout
} from '../controllers/challengeController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All challenge routes require authentication
router.use(authenticate);

// Owner operations
router.post('/', createChallenge);
router.get('/owner', getOwnerChallenges);
router.put('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);
router.get('/:id/participants', getChallengeParticipants);

// Member operations
router.get('/member', getMemberChallenges);
router.post('/:id/join', joinChallenge);
router.post('/sync-progress', syncProgress);

// Leaderboard (All authenticated members, trainers, owners)
router.get('/:id/leaderboard', getChallengeLeaderboard);

// Trainer operations
router.get('/trainer/progress', getTrainerCustomerProgress);
router.post('/trainer/verify-workout', trainerVerifyWorkout);

export default router;
