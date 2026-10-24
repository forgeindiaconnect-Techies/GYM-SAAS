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
import {
  getRewardSettings,
  updateRewardSettings,
  getOwnerCustomersPoints,
  adjustCustomerPointsManual,
  getCustomerDetailedPointsHistory,
  quoteRedemption,
  getCustomRewards,
  createCustomReward,
  updateCustomReward,
  redeemCustomRewardCustomer,
  getCustomClaims,
  reviewCustomRewardClaim
} from '../controllers/referralRewardsController';

const router = Router();

// ============================================================================
// PUBLIC ROUTES
// ============================================================================
router.get('/validate/:code', validateReferralCode);
router.get('/settings/public', getRewardSettings);

// ============================================================================
// GYM OWNER REWARD CONFIGURATION & MANAGEMENT
// ============================================================================
router.get('/settings', authenticate, getRewardSettings);
router.put('/settings', authenticate, updateRewardSettings);

router.get('/owner/customers-points', authenticate, getOwnerCustomersPoints);
router.post('/owner/adjust-points', authenticate, adjustCustomerPointsManual);
router.get('/owner/customer-history/:userId', authenticate, getCustomerDetailedPointsHistory);

// Campaign Routes
router.get('/campaigns', authenticate, getGymCampaigns);
router.post('/campaigns', authenticate, createGymCampaign);
router.put('/campaigns/:id', authenticate, updateGymCampaign);
router.patch('/campaigns/:id/status', authenticate, toggleGymCampaignStatus);

router.get('/owner/stats', authenticate, getOwnerReferralStats);
router.get('/owner/records', authenticate, getOwnerReferralRecords);
router.post('/owner/records/:id/issue-reward', authenticate, issueReferralRewardManual);

// Custom Rewards (Owner & Member)
router.get('/custom-rewards', authenticate, getCustomRewards);
router.post('/custom-rewards', authenticate, createCustomReward);
router.put('/custom-rewards/:id', authenticate, updateCustomReward);
router.get('/custom-claims', authenticate, getCustomClaims);
router.patch('/custom-claims/:id/review', authenticate, reviewCustomRewardClaim);

// ============================================================================
// CUSTOMER (MEMBER) ROUTES
// ============================================================================
router.get('/my-code', authenticate, getCustomerReferralCode);
router.get('/my-stats', authenticate, getCustomerReferralStats);
router.get('/my-history', authenticate, getCustomerReferralHistory);
router.get('/my-rewards', authenticate, getCustomerRewardsLedger);
router.get('/my-rewards-ledger', authenticate, getCustomerRewardsLedger);
router.get('/my-full-history', authenticate, getCustomerDetailedPointsHistory);
router.get('/my-detailed-history', authenticate, getCustomerDetailedPointsHistory);
router.post('/quote-redemption', authenticate, quoteRedemption);
router.post('/redeem-custom', authenticate, redeemCustomRewardCustomer);
router.post('/redeem', authenticate, redeemCustomerReward);
router.post('/my-rewards/redeem', authenticate, redeemCustomerReward);
router.post('/invite-email', authenticate, sendEmailInvite);

export default router;
