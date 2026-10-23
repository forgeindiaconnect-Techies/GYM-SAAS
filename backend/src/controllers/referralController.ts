import { Request, Response } from 'express';
import mongoose from 'mongoose';
import os from 'os';
import { AuthRequest } from '../middlewares/auth';
import ReferralCampaign, { IReferralCampaign } from '../models/ReferralCampaign';
import Referral, { IReferral } from '../models/Referral';
import ReferralRewardTransaction from '../models/ReferralRewardTransaction';
import User from '../models/User';
import Gym from '../models/Gym';
import Notification from '../models/Notification';
import CustomerPointsWallet from '../models/CustomerPointsWallet';
import PointsTransaction from '../models/PointsTransaction';
import { sendReferralInvitationEmail } from '../utils/emailService';

// Helper to generate a unique referral code
const generateReferralCode = (firstName: string): string => {
  const cleanName = (firstName || 'MEMBER').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomSuffix}`;
};

// ============================================================================
// GYM OWNER CAMPAIGN MANAGEMENT
// ============================================================================

export const getGymCampaigns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) {
      res.status(400).json({ success: false, message: 'Gym ID required' });
      return;
    }

    let campaigns = await ReferralCampaign.find({ gymId }).sort({ createdAt: -1 });

    // Seed a standard active default campaign if none exists
    if (campaigns.length === 0) {
      const defaultCampaign = await ReferralCampaign.create({
        gymId,
        campaignName: 'Friends & Family Gym Referral Program',
        campaignDescription: 'Invite your friends to our gym. You earn ₹300 membership credit, and your friend gets ₹200 off their first package!',
        startDate: new Date(),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
        status: 'Active',
        referrerRewardType: 'Membership Credit',
        referrerRewardValue: 300,
        refereeRewardType: 'Membership Discount',
        refereeRewardValue: 200,
        refereeDiscountType: 'Fixed',
        minMembershipPurchase: 500,
        maxReferralsPerUser: 10,
        campaignReferralLimit: 100,
        rewardBudget: 50000,
        budgetSpent: 0,
        termsAndConditions: 'Valid on 1-month or higher memberships. Rewards issued once payment is verified.',
        createdBy: req.user?.id
      });
      campaigns = [defaultCampaign];
    }

    res.status(200).json({ success: true, campaigns });
  } catch (err: any) {
    console.error('Error in getGymCampaigns:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const createGymCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const userId = req.user?.id;
    if (!gymId || !userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      campaignName,
      campaignDescription,
      startDate,
      endDate,
      status,
      referrerRewardType,
      referrerRewardValue,
      refereeRewardType,
      refereeRewardValue,
      refereeDiscountType,
      minMembershipPurchase,
      eligiblePlans,
      maxReferralsPerUser,
      campaignReferralLimit,
      rewardBudget,
      termsAndConditions
    } = req.body;

    if (!campaignName || !startDate || !endDate) {
      res.status(400).json({ success: false, message: 'Campaign name, start date, and end date are required.' });
      return;
    }

    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
    if (eDate < sDate) {
      res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
      return;
    }

    if (Number(referrerRewardValue) < 0 || Number(refereeRewardValue) < 0) {
      res.status(400).json({ success: false, message: 'Reward amounts cannot be negative.' });
      return;
    }

    if (refereeDiscountType === 'Percentage' && Number(refereeRewardValue) > 100) {
      res.status(400).json({ success: false, message: 'Discount percentage cannot exceed 100%.' });
      return;
    }

    const campaign = new ReferralCampaign({
      gymId,
      campaignName,
      campaignDescription: campaignDescription || '',
      startDate: sDate,
      endDate: eDate,
      status: status || 'Active',
      referrerRewardType: referrerRewardType || 'Membership Credit',
      referrerRewardValue: Number(referrerRewardValue) || 300,
      refereeRewardType: refereeRewardType || 'Membership Discount',
      refereeRewardValue: Number(refereeRewardValue) || 200,
      refereeDiscountType: refereeDiscountType || 'Fixed',
      minMembershipPurchase: Number(minMembershipPurchase) || 0,
      eligiblePlans: Array.isArray(eligiblePlans) ? eligiblePlans : [],
      maxReferralsPerUser: Number(maxReferralsPerUser) || 0,
      campaignReferralLimit: Number(campaignReferralLimit) || 0,
      rewardBudget: Number(rewardBudget) || 0,
      budgetSpent: 0,
      termsAndConditions: termsAndConditions || '',
      createdBy: userId
    });

    await campaign.save();

    res.status(201).json({ success: true, message: 'Campaign created successfully', campaign });
  } catch (err: any) {
    console.error('Error in createGymCampaign:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const updateGymCampaign = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const { id } = req.params;

    const campaign = await ReferralCampaign.findOne({ _id: id, gymId });
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    const updates = { ...req.body };
    if (updates.startDate && updates.endDate) {
      if (new Date(updates.endDate) < new Date(updates.startDate)) {
        res.status(400).json({ success: false, message: 'End date cannot be earlier than start date.' });
        return;
      }
    }

    Object.assign(campaign, updates);
    await campaign.save();

    res.status(200).json({ success: true, message: 'Campaign updated successfully', campaign });
  } catch (err: any) {
    console.error('Error in updateGymCampaign:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const toggleGymCampaignStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const { id } = req.params;
    const { status } = req.body;

    const campaign = await ReferralCampaign.findOne({ _id: id, gymId });
    if (!campaign) {
      res.status(404).json({ success: false, message: 'Campaign not found' });
      return;
    }

    campaign.status = status;
    await campaign.save();

    res.status(200).json({ success: true, message: `Campaign status changed to ${status}`, campaign });
  } catch (err: any) {
    console.error('Error in toggleGymCampaignStatus:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================================
// GYM OWNER OVERVIEW STATS & MANAGEMENT TABLE
// ============================================================================

export const getOwnerReferralStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) {
      res.status(400).json({ success: false, message: 'Gym ID required' });
      return;
    }

    const referrals = await Referral.find({ gymId });

    const totalReferrals = referrals.length;
    const totalInvited = referrals.filter(r => r.status === 'Invited').length;
    const registeredCustomers = referrals.filter(r => r.status !== 'Invited').length;
    const membershipPaymentsCompleted = referrals.filter(
      r => r.status === 'Payment Verified' || r.status === 'Reward Pending' || r.status === 'Reward Issued'
    ).length;
    const pendingReferrals = referrals.filter(
      r => r.status === 'Registered' || r.status === 'Membership Pending' || r.status === 'Reward Pending'
    ).length;
    const successfulReferrals = referrals.filter(r => r.status === 'Reward Issued').length;
    const pendingRewards = referrals.filter(r => r.referrerRewardStatus === 'Pending').length;

    // Total rewards issued (amount)
    const totalRewardsIssued = referrals
      .filter(r => r.referrerRewardStatus === 'Issued' || r.referrerRewardStatus === 'Redeemed')
      .reduce((acc, r) => acc + (r.referrerRewardAmount || 0), 0);

    // Revenue generated from referrals
    const revenueGenerated = referrals
      .filter(r => r.status === 'Payment Verified' || r.status === 'Reward Issued')
      .reduce((acc, r) => acc + (r.finalPaymentAmount || 0), 0);

    // Referral reward expenditure (discounts + credits)
    const referralRewardExpenditure = referrals.reduce(
      (acc, r) => acc + (r.discountApplied || 0) + (r.referrerRewardStatus === 'Issued' ? r.referrerRewardAmount || 0 : 0),
      0
    );

    const referralConversionRate =
      totalReferrals > 0 ? Math.round((successfulReferrals / totalReferrals) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalReferrals,
        totalInvited,
        invitedCount: totalInvited,
        registeredCustomers,
        registeredCount: registeredCustomers,
        membershipPaymentsCompleted,
        paymentCompletedCount: membershipPaymentsCompleted,
        pendingReferrals,
        successfulReferrals,
        successfulCount: successfulReferrals,
        pendingRewards,
        pendingRewardsCount: pendingRewards,
        totalRewardsIssued,
        rewardsIssuedCount: totalRewardsIssued,
        referralConversionRate,
        conversionRate: String(referralConversionRate),
        revenueGenerated,
        referralRewardExpenditure,
        rewardExpenditure: referralRewardExpenditure
      }
    });
  } catch (err: any) {
    console.error('Error in getOwnerReferralStats:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getOwnerReferralRecords = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    if (!gymId) {
      res.status(400).json({ success: false, message: 'Gym ID required' });
      return;
    }

    const { status, campaignId, search } = req.query;

    const query: any = { gymId };
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (campaignId && campaignId !== 'ALL') {
      query.campaignId = campaignId;
    }

    let records = await Referral.find(query)
      .populate('referrerId', 'firstName lastName email mobile referralCode')
      .populate('referredId', 'firstName lastName email mobile createdAt customerType')
      .populate('campaignId', 'campaignName referrerRewardType referrerRewardValue refereeRewardValue refereeRewardType')
      .populate('paymentId', 'amount paymentMethod status transactionId paymentDate')
      .populate('membershipId', 'planName duration finalAmount startDate endDate')
      .sort({ createdAt: -1 });

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      records = records.filter((r: any) => {
        const refName = `${r.referrerId?.firstName || ''} ${r.referrerId?.lastName || ''}`.toLowerCase();
        const refEmail = (r.referrerId?.email || '').toLowerCase();
        const refCode = (r.referralCode || '').toLowerCase();
        const newName = `${r.referredId?.firstName || ''} ${r.referredId?.lastName || ''}`.toLowerCase();
        const newEmail = (r.referredId?.email || '').toLowerCase();
        return (
          refName.includes(q) ||
          refEmail.includes(q) ||
          refCode.includes(q) ||
          newName.includes(q) ||
          newEmail.includes(q)
        );
      });
    }

    res.status(200).json({ success: true, count: records.length, referrals: records });
  } catch (err: any) {
    console.error('Error in getOwnerReferralRecords:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const issueReferralRewardManual = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const gymId = req.user?.gymId;
    const { id } = req.params;

    const referral = await Referral.findOne({ _id: id, gymId })
      .populate('referrerId', 'firstName lastName email referralCreditsBalance')
      .populate('referredId', 'firstName lastName email')
      .populate('campaignId');

    if (!referral) {
      res.status(404).json({ success: false, message: 'Referral record not found' });
      return;
    }

    if (referral.referrerRewardStatus === 'Issued') {
      res.status(400).json({ success: false, message: 'Reward has already been issued for this referral.' });
      return;
    }

    const campaign = referral.campaignId as any;
    const rewardType = referral.referrerRewardType || campaign?.referrerRewardType || 'Membership Credit';
    const rewardValue = referral.referrerRewardAmount || campaign?.referrerRewardValue || 300;

    // Issue reward to referrer
    referral.status = 'Reward Issued';
    referral.referrerRewardStatus = 'Issued';
    referral.referrerRewardIssuedAt = new Date();
    await referral.save();

    // Create Reward Transaction
    await ReferralRewardTransaction.create({
      gymId,
      userId: referral.referrerId._id,
      referralId: referral._id,
      campaignId: referral.campaignId?._id || referral.campaignId,
      rewardType,
      amount: rewardValue,
      status: 'Available',
      sourceEvent: `Referral Reward for referring ${(referral.referredId as any)?.firstName || 'new customer'}`,
      issuedAt: new Date()
    });

    // If wallet points
    if (rewardType === 'Wallet Points') {
      let wallet = await CustomerPointsWallet.findOne({ gymId, userId: referral.referrerId._id });
      if (!wallet) {
        wallet = await CustomerPointsWallet.create({
          gymId,
          userId: referral.referrerId._id,
          currentBalance: 0,
          totalEarned: 0,
          totalRedeemed: 0
        });
      }
      wallet.currentBalance += rewardValue;
      wallet.totalEarned += rewardValue;
      await wallet.save();

      await PointsTransaction.create({
        gymId,
        userId: referral.referrerId._id,
        type: 'EARN_BONUS',
        amount: rewardValue,
        balanceAfter: wallet.currentBalance,
        description: `Earned ${rewardValue} points from successful referral`
      });
    } else if (rewardType === 'Membership Credit') {
      await User.findByIdAndUpdate(referral.referrerId._id, {
        $inc: { referralCreditsBalance: rewardValue }
      });
    }

    // Send Notification to Referrer
    await Notification.create({
      recipientId: referral.referrerId._id,
      recipientRole: 'MEMBER',
      gymId,
      title: '🎁 Referral Reward Issued!',
      message: `Your referral reward of ${rewardValue} (${rewardType}) for inviting ${(referral.referredId as any)?.firstName || 'a member'} has been issued to your account!`,
      type: 'success'
    });

    res.status(200).json({ success: true, message: 'Reward issued successfully', referral });
  } catch (err: any) {
    console.error('Error in issueReferralRewardManual:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================================
// CUSTOMER (MEMBER) REFER & EARN
// ============================================================================

export const getCustomerReferralCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const gymId = req.user?.gymId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Ensure user has a referral code
    if (!user.referralCode) {
      user.referralCode = generateReferralCode(user.firstName || 'FIT');
      await user.save();
    }

    // Get active campaign for this gym
    const campaign = await ReferralCampaign.findOne({
      gymId: gymId || user.gymId,
      status: 'Active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    const gym = await Gym.findById(gymId || user.gymId).select('name slug');

    // Share link
    let baseUrl = process.env.FRONTEND_URL;
    if (!baseUrl) {
      const origin = req.get('origin') || req.get('referer');
      if (origin) {
        try {
          const u = new URL(origin);
          baseUrl = `${u.protocol}//${u.host}`;
        } catch {
          baseUrl = 'http://localhost:5173';
        }
      } else {
        baseUrl = 'http://localhost:5173';
      }
    }
    const targetGymId = (gymId || user.gymId)?.toString();
    const gymQuery = targetGymId ? `&gymId=${targetGymId}` : '';
    const shareLink = `${baseUrl}/register/customer?ref=${user.referralCode}${gymQuery}`;

    // Also determine LAN network URL for direct mobile phone QR scanning over local Wi-Fi
    let networkShareLink = shareLink;
    try {
      const ifaces = os.networkInterfaces();
      for (const dev in ifaces) {
        ifaces[dev]?.forEach((details: any) => {
          if (details.family === 'IPv4' && !details.internal && !details.address.startsWith('127.')) {
            networkShareLink = `http://${details.address}:5173/register/customer?ref=${user.referralCode}${gymQuery}`;
          }
        });
      }
    } catch {
      // fallback
    }

    res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      shareLink,
      networkShareLink,
      gymName: gym?.name || 'Our Gym',
      creditsBalance: user.referralCreditsBalance || 0,
      campaign: campaign || {
        campaignName: 'Member Referral Rewards',
        campaignDescription: 'Invite friends and family to join our fitness club and enjoy exclusive perks.',
        referrerRewardType: 'Membership Credit',
        referrerRewardValue: 300,
        refereeRewardType: 'Membership Discount',
        refereeRewardValue: 200,
        refereeDiscountType: 'Fixed',
        termsAndConditions: 'Applies on new customer signups with verified membership payment.'
      }
    });
  } catch (err: any) {
    console.error('Error in getCustomerReferralCode:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getCustomerReferralStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const referrals = await Referral.find({ referrerId: userId });
    const user = await User.findById(userId).select('referralCreditsBalance');

    const totalInvitations = referrals.length;
    const registeredReferrals = referrals.filter(r => r.status === 'Registered' || r.status === 'Membership Pending').length;
    const pendingMembershipPayments = referrals.filter(r => r.status === 'Membership Pending').length;
    const successfulReferrals = referrals.filter(
      r => r.status === 'Payment Verified' || r.status === 'Reward Issued'
    ).length;
    const pendingRewards = referrals.filter(r => r.referrerRewardStatus === 'Pending').length;

    // Total rewards earned by this customer
    const totalRewardsEarned = referrals
      .filter(r => r.referrerRewardStatus === 'Issued' || r.referrerRewardStatus === 'Redeemed')
      .reduce((acc, r) => acc + (r.referrerRewardAmount || 0), 0);

    // Total redeemed
    const redeemedTransactions = await ReferralRewardTransaction.find({
      userId,
      status: 'Redeemed'
    });
    const totalRewardsRedeemed = redeemedTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalInvitations,
        totalInvited: totalInvitations,
        registeredReferrals,
        registeredCount: registeredReferrals,
        pendingMembershipPayments,
        pendingPaymentCount: pendingMembershipPayments,
        successfulReferrals,
        successfulCount: successfulReferrals,
        pendingRewards,
        pendingRewardsCount: pendingRewards,
        totalRewardsEarned,
        totalEarned: totalRewardsEarned,
        totalRewardsRedeemed,
        totalRedeemed: totalRewardsRedeemed,
        creditsBalance: user?.referralCreditsBalance || 0,
        availableBalance: user?.referralCreditsBalance || 0,
        rewardType: 'Membership Credit'
      }
    });
  } catch (err: any) {
    console.error('Error in getCustomerReferralStats:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const getCustomerReferralHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const referrals = await Referral.find({ referrerId: userId })
      .populate('referredId', 'firstName lastName createdAt')
      .populate('campaignId', 'campaignName referrerRewardType referrerRewardValue')
      .sort({ createdAt: -1 });

    const history = referrals.map(r => {
      const refUser = r.referredId as any;
      const maskedName = refUser
        ? `${refUser.firstName || 'Friend'} ${(refUser.lastName || '').slice(0, 1)}.`
        : (r.inviteeName ? `${r.inviteeName} (Invited)` : (r.inviteeEmail || 'Invited Friend'));

      return {
        _id: r._id,
        referredName: maskedName,
        refereeName: maskedName,
        inviteeEmail: r.inviteeEmail,
        inviteChannel: r.inviteChannel || 'Email',
        referralCode: r.referralCode,
        status: r.status,
        membershipPlan: r.membershipPlanName || 'Pending Selection',
        rewardStatus: r.referrerRewardStatus,
        rewardType: r.referrerRewardType,
        rewardAmount: r.referrerRewardAmount,
        rewardIssuedAt: r.referrerRewardIssuedAt,
        registrationDate: r.createdAt,
        createdAt: r.createdAt
      };
    });

    res.status(200).json({ success: true, history, referrals: history });
  } catch (err: any) {
    console.error('Error in getCustomerReferralHistory:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const sendEmailInvite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const gymId = req.user?.gymId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { friendName, friendEmail, personalMessage } = req.body;

    if (!friendEmail || !friendEmail.includes('@')) {
      res.status(400).json({ success: false, message: 'A valid email address is required.' });
      return;
    }

    const cleanEmail = friendEmail.trim().toLowerCase();
    const cleanName = (friendName || 'Friend').trim();

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Ensure user has a referral code
    if (!user.referralCode) {
      user.referralCode = generateReferralCode(user.firstName || 'FIT');
      await user.save();
    }

    // Prevent referring self
    if (user.email && user.email.toLowerCase() === cleanEmail) {
      res.status(400).json({ success: false, message: 'You cannot send a referral invitation to your own email address.' });
      return;
    }

    // Get active campaign or latest gym campaign
    let campaign = await ReferralCampaign.findOne({
      gymId: gymId || user.gymId,
      status: 'Active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).sort({ createdAt: -1 });

    if (!campaign) {
      campaign = await ReferralCampaign.findOne({
        gymId: gymId || user.gymId
      }).sort({ createdAt: -1 });
    }

    const gym = await Gym.findById(gymId || user.gymId).select('name');
    const gymName = gym?.name || 'Our Fitness Club';

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${baseUrl}/register/customer?ref=${user.referralCode}&gymId=${gymId || user.gymId}&email=${encodeURIComponent(cleanEmail)}`;

    const discountDetails = campaign
      ? (campaign.refereeDiscountType === 'Percentage'
          ? `${campaign.refereeRewardValue}% Discount`
          : `₹${campaign.refereeRewardValue} Discount`)
      : '₹200 Exclusive Discount';

    // Send invitation email via email service
    const emailResult = await sendReferralInvitationEmail(
      cleanEmail,
      cleanName,
      `${user.firstName || 'Your Friend'} ${user.lastName || ''}`.trim(),
      gymName,
      user.referralCode,
      inviteLink,
      discountDetails,
      personalMessage
    );

    if (emailResult && !emailResult.success) {
      res.status(502).json({
        success: false,
        message: emailResult.error || 'Failed to deliver invitation email.',
        error: emailResult.error
      });
      return;
    }

    // Save or update referral record with status 'Invited'
    let referralRecord = await Referral.findOne({
      gymId: gymId || user.gymId,
      referrerId: user._id,
      inviteeEmail: cleanEmail
    });

    if (referralRecord) {
      referralRecord.inviteeName = cleanName;
      referralRecord.inviteChannel = 'Email';
      referralRecord.invitedAt = new Date();
      if (referralRecord.status === 'Invited') {
        referralRecord.referralCode = user.referralCode;
      }
      await referralRecord.save();
    } else {
      referralRecord = await Referral.create({
        gymId: gymId || user.gymId,
        campaignId: campaign?._id || new mongoose.Types.ObjectId(),
        referrerId: user._id,
        inviteeName: cleanName,
        inviteeEmail: cleanEmail,
        inviteChannel: 'Email',
        invitedAt: new Date(),
        referralCode: user.referralCode,
        status: 'Invited',
        referrerRewardStatus: 'Pending',
        referrerRewardType: campaign?.referrerRewardType || 'Membership Credit',
        referrerRewardAmount: campaign?.referrerRewardValue || 300,
        refereeRewardStatus: 'Pending',
        refereeRewardType: campaign?.refereeRewardType || 'Membership Discount',
        refereeRewardAmount: campaign?.refereeRewardValue || 200,
        notes: `Invited via direct email by ${user.firstName || 'member'}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Invitation email sent successfully to ${cleanEmail}!`,
      referral: referralRecord,
      emailResult
    });
  } catch (err: any) {
    console.error('Error in sendEmailInvite:', err);
    res.status(500).json({ success: false, message: 'Failed to send invite email', error: err.message });
  }
};

export const getCustomerRewardsLedger = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const gymId = req.user?.gymId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('referralCreditsBalance');
    const wallet = await CustomerPointsWallet.findOne({ userId });

    const transactions = await ReferralRewardTransaction.find({ userId })
      .populate('campaignId', 'campaignName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      creditsBalance: user?.referralCreditsBalance || 0,
      pointsBalance: wallet?.currentBalance || 0,
      transactions
    });
  } catch (err: any) {
    console.error('Error in getCustomerRewardsLedger:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

export const redeemCustomerReward = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const gymId = req.user?.gymId;
    const { amount, notes } = req.body;

    if (!amount || Number(amount) <= 0) {
      res.status(400).json({ success: false, message: 'Invalid redemption amount' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const currentCredits = user.referralCreditsBalance || 0;
    if (currentCredits < Number(amount)) {
      res.status(400).json({
        success: false,
        message: `Insufficient referral credits. You have ₹${currentCredits}, requested ₹${amount}.`
      });
      return;
    }

    user.referralCreditsBalance = currentCredits - Number(amount);
    await user.save();

    const tx = await ReferralRewardTransaction.create({
      gymId: gymId || user.gymId,
      userId,
      rewardType: 'Membership Credit',
      amount: -Number(amount),
      status: 'Redeemed',
      sourceEvent: notes || 'Redeemed referral credits toward gym membership renewal',
      redeemedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: `Successfully redeemed ₹${amount} referral credit!`,
      newBalance: user.referralCreditsBalance,
      transaction: tx
    });
  } catch (err: any) {
    console.error('Error in redeemCustomerReward:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ============================================================================
// PUBLIC & CHECKOUT VALIDATION
// ============================================================================

export const validateReferralCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const query = req.query as { gymId?: string; currentUserId?: string };
    const queryGymId = query.gymId;
    const currentUserId = query.currentUserId;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, valid: false, message: 'Referral code is required.' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Find referrer user
    const referrer = await User.findOne({
      referralCode: cleanCode,
      isActive: true
    }).select('firstName lastName gymId role');

    if (!referrer) {
      res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid referral code. Please check the code and try again.'
      });
      return;
    }

    // 2. Prevent self-referral
    if (currentUserId && referrer._id.toString() === currentUserId.toString()) {
      res.status(400).json({
        success: false,
        valid: false,
        message: 'You cannot use your own referral code.'
      });
      return;
    }

    const targetGymId = referrer.gymId || queryGymId;

    // 3. Find active campaign with safe ObjectId casting and fallback
    let campaign = null;
    if (targetGymId) {
      try {
        const gymObjId = new mongoose.Types.ObjectId(targetGymId.toString());
        campaign = await ReferralCampaign.findOne({
          gymId: gymObjId,
          status: 'Active',
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }).sort({ createdAt: -1 });

        // Fallback: check any active campaign for this gym
        if (!campaign) {
          campaign = await ReferralCampaign.findOne({
            gymId: gymObjId,
            status: 'Active'
          }).sort({ createdAt: -1 });
        }
      } catch (castErr) {
        console.warn('Notice querying campaign for gymId:', castErr);
      }
    }

    // 4. Check budget / limit if a specific campaign is active
    if (campaign) {
      if (campaign.rewardBudget > 0 && campaign.budgetSpent >= campaign.rewardBudget) {
        res.status(400).json({
          success: false,
          valid: false,
          message: 'This referral campaign has reached its reward budget limit.'
        });
        return;
      }

      if (campaign.maxReferralsPerUser > 0) {
        const userReferralCount = await Referral.countDocuments({
          referrerId: referrer._id,
          campaignId: campaign._id,
          status: { $in: ['Payment Verified', 'Reward Issued'] }
        });
        if (userReferralCount >= campaign.maxReferralsPerUser) {
          res.status(400).json({
            success: false,
            valid: false,
            message: 'The referring member has reached the maximum referral limit for this campaign.'
          });
          return;
        }
      }
    }

    const effectiveCampaign = campaign ? {
      _id: campaign._id,
      campaignName: campaign.campaignName,
      campaignDescription: campaign.campaignDescription,
      refereeRewardType: campaign.refereeRewardType || 'Membership Discount',
      refereeRewardValue: Number(campaign.refereeRewardValue) || 200,
      refereeDiscountType: campaign.refereeDiscountType || 'Fixed',
      referrerRewardType: campaign.referrerRewardType || 'Wallet Points',
      referrerRewardValue: Number(campaign.referrerRewardValue) || 300,
      minMembershipPurchase: campaign.minMembershipPurchase || 0,
      eligiblePlans: campaign.eligiblePlans || []
    } : {
      _id: null,
      campaignName: 'Friends & Family Referral Program',
      campaignDescription: 'Special welcome discount for new joining members referred by our gym family.',
      refereeRewardType: 'Membership Discount',
      refereeRewardValue: 200,
      refereeDiscountType: 'Fixed',
      referrerRewardType: 'Wallet Points',
      referrerRewardValue: 300,
      minMembershipPurchase: 0,
      eligiblePlans: []
    };

    res.status(200).json({
      success: true,
      valid: true,
      message: 'Referral code applied successfully!',
      campaign: effectiveCampaign,
      refereeReward: {
        type: effectiveCampaign.refereeRewardType,
        value: effectiveCampaign.refereeRewardValue,
        discountType: effectiveCampaign.refereeDiscountType
      },
      referrerReward: {
        type: effectiveCampaign.referrerRewardType,
        value: effectiveCampaign.referrerRewardValue
      },
      referrer: {
        _id: referrer._id,
        name: `${referrer.firstName || 'Gym Member'} ${(referrer.lastName || '').slice(0, 1)}.`,
        gymId: referrer.gymId
      }
    });
  } catch (err: any) {
    console.error('Error in validateReferralCode:', err);
    res.status(500).json({ success: false, valid: false, message: 'Server error', error: err.message });
  }
};

// ============================================================================
// AUTOMATIC REFERRAL PAYMENT & REWARD ISSUANCE PIPELINE
// (Exported helper to be called in membershipController upon payment)
// ============================================================================

export const processReferralOnPayment = async (params: {
  gymId: any;
  userId: any;
  membershipId: any;
  planName: string;
  planAmount: number;
  finalPaidAmount: number;
  paymentId?: any;
  paymentReference?: string;
  referralCodeSubmitted?: string;
}): Promise<{ processed: boolean; message: string; discountApplied: number }> => {
  try {
    const {
      gymId,
      userId,
      membershipId,
      planName,
      planAmount,
      finalPaidAmount,
      paymentId,
      paymentReference,
      referralCodeSubmitted
    } = params;

    const user = await User.findById(userId);
    if (!user) return { processed: false, message: 'User not found', discountApplied: 0 };

    // Find pending referral or find code from registration / submission
    let referral = await Referral.findOne({
      gymId,
      referredId: userId,
      status: { $in: ['Registered', 'Membership Pending', 'Invited'] }
    });

    const codeToUse = referralCodeSubmitted || referral?.referralCode || user.referralCode;

    if (!referral && codeToUse) {
      const referrerUser = await User.findOne({
        referralCode: codeToUse.trim().toUpperCase(),
        isActive: true
      });
      if (referrerUser && referrerUser._id.toString() !== userId.toString()) {
        const activeCamp = await ReferralCampaign.findOne({
          gymId,
          status: 'Active',
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }).sort({ createdAt: -1 });

        if (activeCamp) {
          referral = new Referral({
            gymId,
            campaignId: activeCamp._id,
            referrerId: referrerUser._id,
            referredId: userId,
            referralCode: codeToUse.trim().toUpperCase(),
            status: 'Registered',
            referrerRewardType: activeCamp.referrerRewardType,
            referrerRewardAmount: activeCamp.referrerRewardValue,
            refereeRewardType: activeCamp.refereeRewardType,
            refereeRewardAmount: activeCamp.refereeRewardValue
          });
          await referral.save();
        }
      }
    }

    if (!referral) {
      return { processed: false, message: 'No referral associated with this member', discountApplied: 0 };
    }

    const campaign = await ReferralCampaign.findById(referral.campaignId);
    if (!campaign) {
      return { processed: false, message: 'Campaign not found', discountApplied: 0 };
    }

    // Eligibility Checks
    if (campaign.minMembershipPurchase > 0 && planAmount < campaign.minMembershipPurchase) {
      referral.status = 'Rejected';
      referral.ineligibilityReason = `Plan amount (₹${planAmount}) below campaign minimum (₹${campaign.minMembershipPurchase})`;
      await referral.save();
      return { processed: false, message: referral.ineligibilityReason, discountApplied: 0 };
    }

    if (campaign.eligiblePlans && campaign.eligiblePlans.length > 0) {
      const match = campaign.eligiblePlans.some(p => p.toLowerCase() === planName.toLowerCase());
      if (!match) {
        referral.status = 'Rejected';
        referral.ineligibilityReason = `Plan ${planName} is not eligible for referral campaign`;
        await referral.save();
        return { processed: false, message: referral.ineligibilityReason, discountApplied: 0 };
      }
    }

    // Calculate discount for referee
    let discountApplied = 0;
    if (campaign.refereeRewardType === 'Membership Discount') {
      if (campaign.refereeDiscountType === 'Percentage') {
        discountApplied = Math.round((planAmount * campaign.refereeRewardValue) / 100);
      } else {
        discountApplied = campaign.refereeRewardValue;
      }
    }

    // Mark referral as Payment Verified & Reward Issued
    referral.status = 'Reward Issued';
    referral.membershipId = membershipId;
    referral.paymentId = paymentId;
    referral.paymentReference = paymentReference;
    referral.membershipPlanName = planName;
    referral.planAmount = planAmount;
    referral.discountApplied = discountApplied;
    referral.finalPaymentAmount = finalPaidAmount;

    referral.refereeRewardStatus = 'Issued';
    referral.refereeRewardIssuedAt = new Date();
    referral.referrerRewardStatus = 'Issued';
    referral.referrerRewardIssuedAt = new Date();
    await referral.save();

    // Issue Referrer Reward
    const referrerRewardType = campaign.referrerRewardType;
    const referrerRewardValue = campaign.referrerRewardValue;

    await ReferralRewardTransaction.create({
      gymId,
      userId: referral.referrerId,
      referralId: referral._id,
      campaignId: campaign._id,
      rewardType: referrerRewardType,
      amount: referrerRewardValue,
      status: 'Available',
      sourceEvent: `Referral Reward for referring ${user.firstName || 'a new customer'}`,
      issuedAt: new Date()
    });

    if (referrerRewardType === 'Wallet Points') {
      let wallet = await CustomerPointsWallet.findOne({ gymId, userId: referral.referrerId });
      if (!wallet) {
        wallet = await CustomerPointsWallet.create({
          gymId,
          userId: referral.referrerId,
          currentBalance: 0,
          totalEarned: 0,
          totalRedeemed: 0
        });
      }
      wallet.currentBalance += referrerRewardValue;
      wallet.totalEarned += referrerRewardValue;
      await wallet.save();

      await PointsTransaction.create({
        gymId,
        userId: referral.referrerId,
        type: 'EARN_BONUS',
        amount: referrerRewardValue,
        balanceAfter: wallet.currentBalance,
        description: `Earned ${referrerRewardValue} points from referral of ${user.firstName || 'a member'}`
      });
    } else if (referrerRewardType === 'Membership Credit') {
      await User.findByIdAndUpdate(referral.referrerId, {
        $inc: { referralCreditsBalance: referrerRewardValue }
      });
    } else if (referrerRewardType === 'Free Membership Days') {
      const referrerUser = await User.findById(referral.referrerId);
      if (referrerUser && referrerUser.subscriptionExpiry) {
        const newExpiry = new Date(referrerUser.subscriptionExpiry);
        newExpiry.setDate(newExpiry.getDate() + referrerRewardValue);
        referrerUser.subscriptionExpiry = newExpiry;
        referrerUser.subscriptionExpiryDate = newExpiry;
        await referrerUser.save();
      }
    }

    // Update campaign budget
    campaign.budgetSpent += (referrerRewardValue + discountApplied);
    await campaign.save();

    // Send Notifications
    await Notification.create({
      recipientId: referral.referrerId,
      recipientRole: 'MEMBER',
      gymId,
      title: '🎉 Referral Successful & Reward Credited!',
      message: `Your friend ${user.firstName || 'customer'} just purchased a membership! We have issued your ${referrerRewardType} reward (${referrerRewardValue}) to your account.`,
      type: 'success'
    });

    await Notification.create({
      recipientId: userId,
      recipientRole: 'MEMBER',
      gymId,
      title: '🎁 Welcome Referral Benefit Applied!',
      message: `Your referral benefit has been successfully applied to your ${planName} membership. Welcome to our gym!`,
      type: 'success'
    });

    return { processed: true, message: 'Referral reward issued successfully', discountApplied };
  } catch (err: any) {
    console.error('Error in processReferralOnPayment:', err);
    return { processed: false, message: err.message, discountApplied: 0 };
  }
};
