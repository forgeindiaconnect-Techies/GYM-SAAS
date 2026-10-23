import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getGymCampaigns,
  createGymCampaign,
  updateGymCampaign,
  toggleGymCampaignStatus,
  getOwnerReferralStats,
  getOwnerReferralRecords,
  issueReferralRewardManual,
  getCustomerReferralCode,
  getCustomerReferralStats,
  getCustomerReferralHistory,
  getCustomerRewardsLedger,
  redeemCustomerReward,
  validateReferralCode,
  sendEmailInvite
} from '../controllers/referralController';

const router = Router();

// Public Route for Referral Code Validation
router.get('/validate/:code', validateReferralCode);

// Gym Owner Routes (Requires Authentication)
router.get('/campaigns', authenticate, getGymCampaigns);
router.post('/campaigns', authenticate, createGymCampaign);
router.put('/campaigns/:id', authenticate, updateGymCampaign);
router.patch('/campaigns/:id/status', authenticate, toggleGymCampaignStatus);

router.get('/owner/stats', authenticate, getOwnerReferralStats);
router.get('/owner/records', authenticate, getOwnerReferralRecords);
router.post('/owner/records/:id/issue-reward', authenticate, issueReferralRewardManual);

// Customer (Member) Routes (Requires Authentication)
router.get('/my-code', authenticate, getCustomerReferralCode);
router.get('/my-stats', authenticate, getCustomerReferralStats);
router.get('/my-history', authenticate, getCustomerReferralHistory);
router.get('/my-rewards', authenticate, getCustomerRewardsLedger);
router.get('/my-rewards-ledger', authenticate, getCustomerRewardsLedger);
router.post('/redeem', authenticate, redeemCustomerReward);
router.post('/my-rewards/redeem', authenticate, redeemCustomerReward);
router.post('/invite-email', authenticate, sendEmailInvite);

export default router;
