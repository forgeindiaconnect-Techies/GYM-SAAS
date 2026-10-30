import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift, Share2, Copy, Check, MessageCircle, Users, Award,
  Clock, CheckCircle2, AlertCircle, Sparkles, TrendingUp,
  Tag, ChevronRight, Coins, Mail, Send, Smartphone, QrCode,
  CheckCircle, RefreshCw, X, CreditCard, ShoppingBag, HelpCircle,
  DollarSign, ArrowDownRight, Eye
} from 'lucide-react';
import QRCode from 'react-qr-code';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface CustomerReferralStats {
  totalInvited: number;
  registeredCount: number;
  pendingPaymentCount: number;
  successfulCount: number;
  pendingRewardsCount: number;
  totalEarned: number;
  totalRedeemed: number;
  availableBalance: number;
  rewardType: string;
}

interface CustomerReferralItem {
  _id: string;
  refereeName?: string;
  referredName?: string;
  inviteeEmail?: string;
  inviteChannel?: string;
  registrationDate?: string;
  createdAt?: string;
  membershipPlan?: string;
  membershipPlanName?: string;
  status: 'Invited' | 'Registered' | 'Membership Pending' | 'Payment Verified' | 'Reward Pending' | 'Reward Issued' | 'Expired' | 'Cancelled' | 'Rejected' | string;
  rewardType: string;
  rewardAmount: number;
  rewardStatus: string;
  rewardIssuedAt?: string;
}

interface PointsTx {
  _id: string;
  transactionType: 'EARN_REFERRAL' | 'REDEEM_MEMBERSHIP' | 'REDEEM_STORE' | 'REDEEM_CUSTOM' | 'ADMIN_ADJUST' | 'REFUND_POINTS';
  points: number;
  balanceAfter: number;
  conversionRateUsed?: {
    points: number;
    currencyValue: number;
  };
  discountAmount?: number;
  reason?: string;
  orderReference?: string;
  status: 'COMPLETED' | 'PENDING' | 'REVERSED';
  createdAt: string;
}

interface CustomRewardClaim {
  _id: string;
  rewardId: any;
  rewardTitle: string;
  pointsCost: number;
  voucherCode: string;
  status: 'PENDING' | 'APPROVED' | 'REDEEMED' | 'REJECTED';
  claimedAt: string;
  reviewNotes?: string;
}

interface RewardSettings {
  pointsPerConversionUnit: number;
  currencyValuePerUnit: number;
  minPointsForRedemption: number;
  maxDiscountPerTransaction: number;
  enableMembershipDiscount: boolean;
  enableStorePurchase: boolean;
  enableCustomRewards: boolean;
  eligibleMembershipPlans: string[];
  eligibleStoreProducts: string[];
  storeRedemptionScope: 'ALL' | 'SELECTED';
  pointsExpiryDays: number;
  rewardInstructions: string;
  termsAndConditions?: string;
}

interface CustomRewardItem {
  _id: string;
  title: string;
  description: string;
  pointsRequired: number;
  category: string;
  validityDays: number;
  redemptionLimitPerUser: number;
  requiresApproval: boolean;
  terms?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const MemberReferrals: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Page Sub-Tab: 'invite' (Refer & Earn) vs 'redemption' (Points & Redemption)
  const [activeSubTab, setActiveSubTab] = useState<'invite' | 'redemption'>('invite');

  // Referral states
  const [referralCode, setReferralCode] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>('');
  const [networkShareLink, setNetworkShareLink] = useState<string>('');
  const [gymName, setGymName] = useState<string>('Our Gym');
  const [gymDetails, setGymDetails] = useState<any>(null);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [stats, setStats] = useState<CustomerReferralStats>({
    totalInvited: 0,
    registeredCount: 0,
    pendingPaymentCount: 0,
    successfulCount: 0,
    pendingRewardsCount: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    availableBalance: 0,
    rewardType: 'Points'
  });
  const [referrals, setReferrals] = useState<CustomerReferralItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Rewards & Points System States
  const [rewardSettings, setRewardSettings] = useState<RewardSettings>({
    pointsPerConversionUnit: 100,
    currencyValuePerUnit: 50,
    minPointsForRedemption: 100,
    maxDiscountPerTransaction: 1000,
    enableMembershipDiscount: true,
    enableStorePurchase: true,
    enableCustomRewards: true,
    eligibleMembershipPlans: [],
    eligibleStoreProducts: [],
    storeRedemptionScope: 'ALL',
    pointsExpiryDays: 0,
    rewardInstructions: 'Earn points by inviting friends. Redeem points during membership renewals, gym store checkouts, or custom gym rewards.'
  });

  const [wallet, setWallet] = useState<{
    currentBalance: number;
    totalEarned: number;
    totalRedeemed: number;
  }>({
    currentBalance: 0,
    totalEarned: 0,
    totalRedeemed: 0
  });

  const [pointsHistory, setPointsHistory] = useState<PointsTx[]>([]);
  const [customClaims, setCustomClaims] = useState<CustomRewardClaim[]>([]);
  const [availableCustomRewards, setAvailableCustomRewards] = useState<CustomRewardItem[]>([]);
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<any | null>(null);

  // Redemption Dropdown / Modal state
  const [showRedeemModal, setShowRedeemModal] = useState<boolean>(false);
  const [selectedRedeemChannel, setSelectedRedeemChannel] = useState<'MEMBERSHIP' | 'STORE' | 'CUSTOM' | null>(null);

  // Option A: Membership Discount interactive calculator
  const [selectedPlanForDiscount, setSelectedPlanForDiscount] = useState<any>(null);
  const [pointsToRedeemInput, setPointsToRedeemInput] = useState<number>(0);

  // Option C: Claim Custom Reward
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [claimFeedback, setClaimFeedback] = useState<{ type: 'success' | 'error'; message: string; voucher?: string } | null>(null);

  // Email Referral Form State
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteMessage, setInviteMessage] = useState<string>(
    "Hey! Come workout with me at our gym. Use my referral link to get an exclusive discount on your membership!"
  );
  const [sendingInvite, setSendingInvite] = useState<boolean>(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // QR Modal
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Conversion rate helper
  const pointRate = useMemo(() => {
    const pts = rewardSettings.pointsPerConversionUnit || 100;
    const val = rewardSettings.currencyValuePerUnit || 50;
    return val / pts;
  }, [rewardSettings]);

  const equivalentRupeeValue = useMemo(() => {
    return Math.floor(wallet.currentBalance * pointRate);
  }, [wallet.currentBalance, pointRate]);

  // Load All Referral & Points Data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [codeRes, statsRes, histRes, detailedRes, settingsRes, customRes, gymRes] = await Promise.all([
        api.get('/referrals/my-code').catch(() => ({ data: { success: false } })),
        api.get('/referrals/my-stats').catch(() => ({ data: { success: false } })),
        api.get('/referrals/my-history').catch(() => ({ data: { success: false } })),
        api.get('/referrals/my-detailed-history').catch(() => ({ data: { success: false } })),
        api.get('/referrals/settings').catch(() => ({ data: { success: false } })),
        api.get('/referrals/custom-rewards').catch(() => ({ data: { success: false } })),
        user?.gymId ? api.get(`/gyms/${user.gymId}`).catch(() => ({ data: { gym: null } })) : Promise.resolve({ data: { gym: null } })
      ]);

      if (codeRes.data?.success) {
        setReferralCode(codeRes.data.referralCode || '');
        setShareLink(codeRes.data.shareLink || '');
        setNetworkShareLink(codeRes.data.networkShareLink || '');
        setGymName(codeRes.data.gymName || user?.gymName || 'Our Gym');
        setActiveCampaign(codeRes.data.campaign);
      } else {
        const fallbackCode = `${(user?.firstName || 'MEMBER').toUpperCase().slice(0, 5)}${Math.floor(1000 + Math.random() * 9000)}`;
        setReferralCode(fallbackCode);
        setShareLink(`${window.location.origin}/register/customer?ref=${fallbackCode}`);
      }

      if (gymRes.data?.gym) {
        setGymDetails(gymRes.data.gym);
        if (gymRes.data.gym.name) setGymName(gymRes.data.gym.name);
      }

      if (statsRes.data?.success) {
        const s = statsRes.data.stats || {};
        setStats({
          totalInvited: s.totalInvited ?? s.totalInvitations ?? 0,
          registeredCount: s.registeredCount ?? s.registeredReferrals ?? 0,
          pendingPaymentCount: s.pendingPaymentCount ?? s.pendingMembershipPayments ?? 0,
          successfulCount: s.successfulCount ?? s.successfulReferrals ?? 0,
          pendingRewardsCount: s.pendingRewardsCount ?? s.pendingRewards ?? 0,
          totalEarned: s.totalEarned ?? s.totalRewardsEarned ?? 0,
          totalRedeemed: s.totalRedeemed ?? s.totalRewardsRedeemed ?? 0,
          availableBalance: s.availableBalance ?? s.creditsBalance ?? 0,
          rewardType: s.rewardType || 'Points'
        });
      }

      if (histRes.data?.success) {
        setReferrals(histRes.data.history || histRes.data.referrals || []);
      }

      if (detailedRes.data?.success) {
        if (detailedRes.data.wallet) {
          setWallet({
            currentBalance: detailedRes.data.wallet.currentBalance ?? 0,
            totalEarned: detailedRes.data.wallet.totalEarned ?? 0,
            totalRedeemed: detailedRes.data.wallet.totalRedeemed ?? 0
          });
        }
        if (detailedRes.data.transactions) {
          setPointsHistory(detailedRes.data.transactions);
        }
        if (detailedRes.data.customClaims) {
          setCustomClaims(detailedRes.data.customClaims);
        }
      }

      if (settingsRes.data?.success && settingsRes.data.settings) {
        setRewardSettings(settingsRes.data.settings);
      }

      if (customRes.data?.success && customRes.data.rewards) {
        setAvailableCustomRewards(customRes.data.rewards);
      }
    } catch (err) {
      console.error('Failed to load referral data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const friendBenefit = activeCampaign
    ? activeCampaign.refereeDiscountType === 'Percentage'
      ? `${activeCampaign.refereeRewardValue}% off`
      : `₹${activeCampaign.refereeRewardValue} off`
    : 'exclusive discount';

  const defaultShareText = `Hey! I workout at ${gymName || 'our gym'}. Use my referral code ${referralCode} to get ${friendBenefit} on your membership! Join here: ${shareLink}`;

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(defaultShareText);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSmsShare = () => {
    const text = encodeURIComponent(defaultShareText);
    window.open(`sms:?body=${text}`, '_blank');
  };

  const handleMailtoClient = () => {
    const subject = encodeURIComponent(`Invitation to workout together at ${gymName}!`);
    const body = encodeURIComponent(
      `Hi ${inviteName || 'there'},\n\n${inviteMessage}\n\nPromo Code: ${referralCode}\nDiscount: ${friendBenefit}\nJoin here: ${shareLink}\n\nCheers,\n${user?.firstName || 'Your friend'}`
    );
    window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${gymName} with my referral!`,
          text: defaultShareText,
          url: shareLink
        });
      } catch (err) {
        console.error('Share cancelled or failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      setInviteFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    try {
      setSendingInvite(true);
      setInviteFeedback(null);
      const res = await api.post('/referrals/invite', {
        inviteeName: inviteName,
        inviteeEmail: inviteEmail,
        personalMessage: inviteMessage
      });
      if (res.data?.success) {
        setInviteFeedback({
          type: 'success',
          message: `Referral invite successfully sent to ${inviteEmail}!`
        });
        setInviteName('');
        setInviteEmail('');
        fetchAllData();
      } else {
        setInviteFeedback({
          type: 'error',
          message: res.data?.message || 'Failed to send invite email.'
        });
      }
    } catch (err: any) {
      setInviteFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send invite email. Please try again or use the Mail App option.'
      });
    } finally {
      setSendingInvite(false);
    }
  };

  // Option A calculation: Membership Plan Discount
  const gymPlans = useMemo(() => {
    const list = gymDetails?.subscriptionPlans || [];
    if (list.length > 0) return list;
    return [
      { name: '1 Month Standard Plan', price: 1500, duration: '1 month' },
      { name: '3 Months Pro Plan', price: 3800, duration: '3 months' },
      { name: '6 Months Elite Plan', price: 7000, duration: '6 months' },
      { name: '12 Months Annual VIP', price: 12000, duration: '12 months' }
    ];
  }, [gymDetails]);

  const isPlanEligible = (planName: string) => {
    if (!rewardSettings.enableMembershipDiscount) return false;
    if (!rewardSettings.eligibleMembershipPlans || rewardSettings.eligibleMembershipPlans.length === 0) {
      return true;
    }
    return rewardSettings.eligibleMembershipPlans.includes(planName);
  };

  const maxRedeemablePointsForSelectedPlan = useMemo(() => {
    if (!selectedPlanForDiscount) return 0;
    const planPrice = Number(selectedPlanForDiscount.price || 0);
    const maxDiscountLimit = rewardSettings.maxDiscountPerTransaction || 1000;
    const effectiveMaxDiscount = Math.min(planPrice, maxDiscountLimit);
    const maxPointsByDiscount = Math.floor(effectiveMaxDiscount / pointRate);
    return Math.min(wallet.currentBalance, maxPointsByDiscount);
  }, [selectedPlanForDiscount, rewardSettings, pointRate, wallet.currentBalance]);

  const previewDiscountAmount = useMemo(() => {
    return Math.floor(pointsToRedeemInput * pointRate);
  }, [pointsToRedeemInput, pointRate]);

  const previewFinalPrice = useMemo(() => {
    if (!selectedPlanForDiscount) return 0;
    const original = Number(selectedPlanForDiscount.price || 0);
    return Math.max(0, original - previewDiscountAmount);
  }, [selectedPlanForDiscount, previewDiscountAmount]);

  const handleProceedMembershipCheckout = () => {
    if (!selectedPlanForDiscount) {
      alert('Please select an eligible membership plan.');
      return;
    }
    if (wallet.currentBalance < rewardSettings.minPointsForRedemption) {
      alert(`Minimum points required for redemption is ${rewardSettings.minPointsForRedemption} points.`);
      return;
    }
    if (pointsToRedeemInput <= 0) {
      alert('Please specify points to redeem.');
      return;
    }

    const gymObj = gymDetails || {
      _id: user?.gymId,
      name: gymName,
      branches: []
    };
    const intentPayload = {
      gym: gymObj,
      plan: selectedPlanForDiscount,
      branch: gymObj.branches?.[0] || null
    };

    sessionStorage.setItem('checkout_intent', JSON.stringify(intentPayload));
    sessionStorage.setItem('redeem_membership_points', String(pointsToRedeemInput));

    setShowRedeemModal(false);
    navigate('/gym-checkout', {
      state: {
        ...intentPayload,
        pointsToRedeem: pointsToRedeemInput
      }
    });
  };

  const handleClaimCustomReward = async (reward: CustomRewardItem) => {
    if (wallet.currentBalance < reward.pointsRequired) {
      alert(`You need ${reward.pointsRequired} points for this reward. Available: ${wallet.currentBalance} points.`);
      return;
    }

    const confirmMsg = reward.requiresApproval
      ? `Redeem "${reward.title}" for ${reward.pointsRequired} points? This reward requires gym owner confirmation.`
      : `Redeem "${reward.title}" for ${reward.pointsRequired} points? Your voucher will be generated immediately.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setClaimingRewardId(reward._id);
      setClaimFeedback(null);
      const res = await api.post(`/referrals/custom-rewards/${reward._id}/redeem`);
      if (res.data?.success) {
        setClaimFeedback({
          type: 'success',
          message: res.data.message || 'Reward claimed successfully!',
          voucher: res.data.claim?.voucherCode
        });
        fetchAllData();
      } else {
        setClaimFeedback({
          type: 'error',
          message: res.data?.message || 'Failed to redeem reward.'
        });
      }
    } catch (err: any) {
      setClaimFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to claim reward. Please check your points balance.'
      });
    } finally {
      setClaimingRewardId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#292524] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Bar with Referral Sub-Tabs and Redeem Points Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E7DADD] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveSubTab('invite')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'invite'
                ? 'bg-[#B76E79] text-white shadow-lg shadow-[#B76E79]/20'
                : 'bg-[#FFFFFF] text-[#57534E] hover:text-[#292524] border border-[#E7DADD]'
            }`}
          >
            <Gift size={18} />
            Refer & Earn Friends
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('redemption')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'redemption'
                ? 'bg-[#B76E79] text-white shadow-lg shadow-[#B76E79]/20'
                : 'bg-[#FFFFFF] text-[#57534E] hover:text-[#292524] border border-[#E7DADD]'
            }`}
          >
            <Coins size={18} />
            Points & Redemption ({wallet.currentBalance} Pts)
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedRedeemChannel(null);
            setShowRedeemModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#B76E79] hover:bg-[#9F5965] text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-[#B76E79]/20 cursor-pointer"
        >
          <Sparkles size={16} />
          Redeem Points
        </button>
      </div>

      {activeSubTab === 'invite' ? (
        /* ========================================================================= */
        /* SUB-TAB 1: REFER & EARN (INVITATION WORKFLOW)                            */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Top Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#F3E8E8] border border-[#E7DADD] p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(183,110,121,0.12)_0%,_transparent_70%)] pointer-events-none" />
            
            <div className="max-w-3xl space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B76E79]/15 border border-[#B76E79]/30 rounded-full text-xs font-bold uppercase tracking-wider text-[#B76E79]">
                <Gift size={14} className="text-[#B76E79]" />
                Refer & Earn Rewards
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#292524]">
                Invite Friends & Family, <span className="text-[#B76E79]">Get Rewarded Together!</span>
              </h1>
              <p className="text-[#57534E] text-sm sm:text-base leading-relaxed">
                Give your friends an exclusive gym membership discount at <strong className="text-[#292524]">{gymName}</strong>, 
                and earn referral points for every friend who joins and activates a membership!
              </p>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2 Cols): Code, Share Bar, Email Invite */}
            <div className="lg:col-span-2 space-y-6">
              {/* Unique Referral Invite */}
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7DADD] p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#E7DADD] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#B76E79]/15 text-[#B76E79] flex items-center justify-center border border-[#B76E79]/30">
                      <Share2 size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#292524]">Your Unique Referral Invite</h2>
                      <p className="text-xs text-[#57534E]">Share with friends via link, mail, QR, or chat apps.</p>
                    </div>
                  </div>
                </div>

                {/* Referral Code Box */}
                <div className="p-5 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs uppercase font-bold text-[#57534E] tracking-wider">Your Referral Code</span>
                      <div className="text-2xl sm:text-3xl font-black text-[#B76E79] tracking-wider font-mono mt-0.5">
                        {referralCode || 'GENERATING...'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#B76E79] hover:bg-[#9F5965] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#B76E79]/20 cursor-pointer"
                      >
                        {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                        {copiedCode ? 'Copied Code!' : 'Copy Code'}
                      </button>
                      <button
                        onClick={() => setShowQrModal(true)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-[#F3E8E8] hover:bg-[#E7DADD] text-[#292524] rounded-xl text-xs font-bold transition-all border border-[#E7DADD] cursor-pointer"
                        title="Display QR Code"
                      >
                        <QrCode size={16} className="text-[#B76E79]" />
                        QR
                      </button>
                    </div>
                  </div>

                  {/* Share Link Input */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E7DADD]/60">
                    <span className="text-[11px] font-medium text-[#57534E]">Direct Referral Registration Link</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shareLink}
                        className="flex-1 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl px-3.5 py-2 text-xs text-[#57534E] font-mono select-all focus:outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 bg-[#F3E8E8] hover:bg-[#E7DADD] text-[#292524] rounded-xl text-xs font-bold transition-all border border-[#E7DADD] shrink-0 cursor-pointer"
                      >
                        {copiedLink ? 'Copied Link!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Share Buttons Bar */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-[#57534E] uppercase tracking-wider">Instant Sharing Channels</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleWhatsAppShare}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <MessageCircle size={16} />
                      WhatsApp
                    </button>
                    <button
                      onClick={handleMailtoClient}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Mail size={16} />
                      Mail App
                    </button>
                    <button
                      onClick={handleNativeShare}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-[#B76E79]/15 hover:bg-[#B76E79]/25 text-[#B76E79] border border-[#B76E79]/30 rounded-2xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Share2 size={16} />
                      More Apps
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Referral Invitation Form */}
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7DADD] p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3 border-b border-[#E7DADD] pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#B76E79] text-white flex items-center justify-center font-bold">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#292524]">Send Personalized Email Invitation</h3>
                    <p className="text-xs text-[#57534E]">
                      We'll dispatch an official email invitation to your friend with your promo code attached.
                    </p>
                  </div>
                </div>

                {inviteFeedback && (
                  <div
                    className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-3 ${
                      inviteFeedback.type === 'success'
                        ? 'bg-[#15803D]/15 border border-[#15803D]/30 text-[#15803D]'
                        : 'bg-[#B91C1C]/15 border border-[#B91C1C]/30 text-[#B91C1C]'
                    }`}
                  >
                    {inviteFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{inviteFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleSendInvite} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#57534E]">Friend's Name</label>
                      <input
                        type="text"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        placeholder="e.g. Alex Sharma"
                        className="w-full bg-[#FFFFFF] border border-[#E7DADD] rounded-xl px-4 py-2.5 text-xs text-[#292524] placeholder-[#57534E] focus:outline-none focus:border-[#B76E79]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#57534E]">
                        Friend's Email Address <span className="text-[#B76E79]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="friend@example.com"
                        className="w-full bg-[#FFFFFF] border border-[#E7DADD] rounded-xl px-4 py-2.5 text-xs text-[#292524] placeholder-[#57534E] focus:outline-none focus:border-[#B76E79]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#57534E]">Personal Note (Optional)</label>
                    <textarea
                      rows={2}
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E7DADD] rounded-xl p-3 text-xs text-[#292524] placeholder-[#57534E] focus:outline-none focus:border-[#B76E79] resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={sendingInvite}
                      className="flex items-center gap-2 px-6 py-3 bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-[#B76E79]/20 cursor-pointer disabled:opacity-50"
                    >
                      {sendingInvite ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                      {sendingInvite ? 'Sending...' : 'Send Referral Invitation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Reward Rules & Summary */}
            <div className="space-y-6">
              {/* Dual Reward Benefits Card */}
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7DADD] p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-3 border-b border-[#E7DADD] pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#292524]">Dual Reward Benefit</h3>
                    <p className="text-xs text-[#57534E]">Both you & your friend benefit!</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[#B76E79] font-bold">
                      <span>FOR YOUR FRIEND</span>
                      <Tag size={14} />
                    </div>
                    <div className="text-base font-extrabold text-[#292524]">{friendBenefit}</div>
                    <p className="text-[11px] text-[#57534E]">
                      Instant discount applied during checkout when they register with your code.
                    </p>
                  </div>

                  <div className="p-4 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[#15803D] font-bold">
                      <span>FOR YOU (REFERRER)</span>
                      <Coins size={14} />
                    </div>
                    <div className="text-base font-extrabold text-[#292524]">
                      {activeCampaign?.referrerRewardValue ? `${activeCampaign.referrerRewardValue} Points` : 'Points Reward'}
                    </div>
                    <p className="text-[11px] text-[#57534E]">
                      Credited directly into your points balance upon confirmed payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Simple Steps */}
              <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7DADD] p-6 space-y-4 shadow-xl">
                <h4 className="text-sm font-bold text-[#292524]">How It Works</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-[#292524]">Share Your Code</p>
                      <p className="text-[11px] text-[#57534E] mt-0.5">Send your code or link to friends.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-[#292524]">Friend Joins & Pays</p>
                      <p className="text-[11px] text-[#57534E] mt-0.5">They receive an instant promo discount on signup.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-[#292524]">Earn Your Points</p>
                      <p className="text-[11px] text-[#57534E] mt-0.5">Your points balance is automatically credited.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Statistics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-md space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Total Invited</span>
              <div className="text-2xl font-black text-[#292524]">{stats.totalInvited}</div>
              <span className="text-[11px] text-[#57534E]">Friends signed up or invited</span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-md space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Pending Payments</span>
              <div className="text-2xl font-black text-[#B45309]">{stats.pendingPaymentCount}</div>
              <span className="text-[11px] text-[#57534E]">Awaiting plan purchase</span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-md space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Successful Referrals</span>
              <div className="text-2xl font-black text-[#15803D]">{stats.successfulCount}</div>
              <span className="text-[11px] text-[#15803D] font-medium">Paid members confirmed</span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-md space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">Rewards Issued</span>
              <div className="text-2xl font-black text-[#B76E79]">
                {wallet.totalEarned > 0 ? `${wallet.totalEarned} Pts` : '0 Pts'}
              </div>
              <span className="text-[11px] text-[#B76E79] font-medium">Total earned</span>
            </div>
          </div>

          {/* Referral History & Step-by-Step Progress Tracker */}
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7DADD] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E7DADD] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#292524]">My Referral History & Progress Tracker</h2>
                <p className="text-xs text-[#57534E]">
                  Track your invitations step-by-step from invitation to verified member reward.
                </p>
              </div>
              <span className="text-xs font-bold text-[#FFFFFF] bg-[#B76E79] px-3 py-1 rounded-full">
                {referrals.length} Total Invites
              </span>
            </div>

            {referrals.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#FFFFFF] border border-[#E7DADD] text-[#57534E] flex items-center justify-center mx-auto">
                  <Users size={28} className="text-[#B76E79]" />
                </div>
                <h3 className="text-base font-bold text-[#292524]">No Referrals Recorded Yet</h3>
                <p className="text-xs text-[#57534E] max-w-sm mx-auto">
                  Use the email form above or share your code <strong className="text-[#B76E79]">{referralCode}</strong> with friends to earn your first reward!
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={handleWhatsAppShare}
                    className="px-5 py-2.5 bg-[#B76E79] hover:bg-[#9F5965] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Share on WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((item) => {
                  const displayName = item.refereeName || item.referredName || item.inviteeEmail || 'Invited Friend';
                  const displayDate = item.registrationDate || item.createdAt;

                  return (
                    <div key={item._id} className="p-5 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#B76E79]/15 border border-[#B76E79]/30 text-[#B76E79] flex items-center justify-center font-bold text-sm">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-[#292524]">{displayName}</h4>
                              {item.inviteChannel && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E7DADD] text-[#57534E]">
                                  via {item.inviteChannel}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#57534E]">
                              {displayDate ? `Date: ${new Date(displayDate).toLocaleDateString()}` : 'Recently Invited'}
                            </p>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xs font-bold text-[#B76E79]">
                            Reward: +{item.rewardAmount || 300} Points
                          </span>
                          <div className="text-[11px] text-[#57534E] mt-0.5">
                            Status:{' '}
                            <span
                              className={`font-semibold ${
                                item.status === 'Reward Issued'
                                  ? 'text-[#B76E79]'
                                  : item.status === 'Payment Verified'
                                  ? 'text-[#15803D]'
                                  : item.status === 'Invited'
                                  ? 'text-[#B45309]'
                                  : 'text-sky-400'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Step-by-Step Progress Timeline */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#57534E] mb-2 overflow-x-auto gap-2">
                          {['Invited', 'Registered', 'Membership Pending', 'Payment Verified', 'Reward Issued'].map(
                            (stage, idx) => {
                              const isComplete =
                                stage === 'Invited' ||
                                (stage === 'Registered' && item.status !== 'Invited') ||
                                (stage === 'Membership Pending' &&
                                  ['Membership Pending', 'Payment Verified', 'Reward Pending', 'Reward Issued'].includes(
                                    item.status
                                  )) ||
                                (stage === 'Payment Verified' &&
                                  ['Payment Verified', 'Reward Pending', 'Reward Issued'].includes(item.status)) ||
                                (stage === 'Reward Issued' && item.status === 'Reward Issued');

                              return (
                                <div key={stage} className="flex items-center gap-1.5 shrink-0">
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                      isComplete
                                        ? 'bg-[#B76E79] text-white'
                                        : 'bg-[#F3E8E8] text-[#57534E] border border-[#E7DADD]'
                                    }`}
                                  >
                                    {isComplete ? <Check size={11} /> : idx + 1}
                                  </div>
                                  <span className={isComplete ? 'text-[#292524] font-bold' : 'text-[#57534E]'}>
                                    {stage}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* SUB-TAB 2: POINTS & REDEMPTION (DETAILS THAT USER SPECIFIED)              */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#F3E8E8] border border-[#E7DADD] p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(183,110,121,0.15)_0%,_transparent_70%)] pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B76E79]/15 border border-[#B76E79]/30 rounded-full text-xs font-bold uppercase tracking-wider text-[#B76E79]">
                  <Coins size={14} className="text-[#B76E79]" />
                  Referral Points Balance
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#292524]">
                  My Referral Points & Redemption
                </h1>
                <p className="text-[#57534E] text-sm leading-relaxed">
                  Earned from your referred friends at <strong className="text-[#292524]">{gymName}</strong>. 
                  Redeem directly towards membership renewals, gym store gear, or special training sessions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedRedeemChannel(null);
                  setShowRedeemModal(true);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#B76E79] hover:bg-[#9F5965] text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-[#B76E79]/30 cursor-pointer shrink-0"
              >
                <Coins size={18} />
                Redeem Points Now
              </button>
            </div>
          </div>

          {/* Reward Summary 4-Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Available Points */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E7DADD] shadow-lg space-y-2 relative overflow-hidden group hover:border-[#B76E79]/50 transition">
              <div className="flex items-center justify-between text-[#57534E]">
                <span className="text-xs font-bold uppercase tracking-wider">Available Points</span>
                <div className="w-10 h-10 rounded-2xl bg-[#B76E79]/10 text-[#B76E79] flex items-center justify-center">
                  <Coins size={20} />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#292524]">
                {wallet.currentBalance.toLocaleString()}
              </div>
              <div className="text-xs text-[#B76E79] font-semibold flex items-center gap-1.5 pt-1">
                <span>Supports 5,000+ balances</span>
              </div>
            </div>

            {/* 2. Equivalent Discount Value */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E7DADD] shadow-lg space-y-2 relative overflow-hidden group hover:border-[#15803D]/50 transition">
              <div className="flex items-center justify-between text-[#57534E]">
                <span className="text-xs font-bold uppercase tracking-wider">Equivalent Value</span>
                <div className="w-10 h-10 rounded-2xl bg-[#15803D]/10 text-[#15803D] flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#15803D]">
                ₹{equivalentRupeeValue.toLocaleString()}
              </div>
              <div className="text-xs text-[#57534E] pt-1">
                Rate: {rewardSettings.pointsPerConversionUnit} pts = ₹{rewardSettings.currencyValuePerUnit}
              </div>
            </div>

            {/* 3. Total Points Earned */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E7DADD] shadow-lg space-y-2 relative overflow-hidden group hover:border-purple-500/50 transition">
              <div className="flex items-center justify-between text-[#57534E]">
                <span className="text-xs font-bold uppercase tracking-wider">Total Earned</span>
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-purple-300">
                {wallet.totalEarned.toLocaleString()}
              </div>
              <div className="text-xs text-[#57534E] pt-1">
                From successful referrals & bonuses
              </div>
            </div>

            {/* 4. Total Points Redeemed */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E7DADD] shadow-lg space-y-2 relative overflow-hidden group hover:border-amber-500/50 transition">
              <div className="flex items-center justify-between text-[#57534E]">
                <span className="text-xs font-bold uppercase tracking-wider">Total Redeemed</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <ArrowDownRight size={20} />
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-300">
                {wallet.totalRedeemed.toLocaleString()}
              </div>
              <div className="text-xs text-[#57534E] pt-1">
                Redeemed on plans & gym store
              </div>
            </div>
          </div>

          {/* Available Redemption Channels */}
          <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E7DADD] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#292524]">Available Redemption Channels</h3>
                <p className="text-xs text-[#57534E]">Choose how to use your referral points today.</p>
              </div>
              <span className="text-xs text-[#B76E79] font-bold bg-[#B76E79]/10 px-3 py-1 rounded-full border border-[#B76E79]/20">
                Min. {rewardSettings.minPointsForRedemption} pts required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Option A: Membership */}
              <div
                onClick={() => {
                  if (rewardSettings.enableMembershipDiscount) {
                    setSelectedRedeemChannel('MEMBERSHIP');
                    setShowRedeemModal(true);
                  }
                }}
                className={`p-5 rounded-2xl border transition text-left cursor-pointer ${
                  rewardSettings.enableMembershipDiscount
                    ? 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79] hover:bg-[#F3E8E8]'
                    : 'bg-[#FFFFFF]/50 border-red-500/20 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#B76E79]/15 text-[#B76E79] flex items-center justify-center">
                    <CreditCard size={20} />
                  </div>
                  {rewardSettings.enableMembershipDiscount ? (
                    <span className="text-[10px] font-bold text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-full border border-[#15803D]/20">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                      Disabled by Gym
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-[#292524]">1. Membership Plan Discount</h4>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  Apply your points directly during membership renewal or upgrade checkout for instant rupee discounts.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#B76E79]">
                  <span>Calculate discount</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Option B: Gym Store */}
              <div
                onClick={() => {
                  if (rewardSettings.enableStorePurchase) {
                    setSelectedRedeemChannel('STORE');
                    setShowRedeemModal(true);
                  }
                }}
                className={`p-5 rounded-2xl border transition text-left cursor-pointer ${
                  rewardSettings.enableStorePurchase
                    ? 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79] hover:bg-[#F3E8E8]'
                    : 'bg-[#FFFFFF]/50 border-red-500/20 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                  {rewardSettings.enableStorePurchase ? (
                    <span className="text-[10px] font-bold text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-full border border-[#15803D]/20">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                      Disabled by Gym
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-[#292524]">2. Gym Store Purchases</h4>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  Redeem points against protein supplements, gym apparel, and accessories in the official Gym Store.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#B76E79]">
                  <span>Explore store products</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Option C: Custom Rewards */}
              <div
                onClick={() => {
                  if (rewardSettings.enableCustomRewards) {
                    setSelectedRedeemChannel('CUSTOM');
                    setShowRedeemModal(true);
                  }
                }}
                className={`p-5 rounded-2xl border transition text-left cursor-pointer ${
                  rewardSettings.enableCustomRewards
                    ? 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79] hover:bg-[#F3E8E8]'
                    : 'bg-[#FFFFFF]/50 border-red-500/20 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  {rewardSettings.enableCustomRewards ? (
                    <span className="text-[10px] font-bold text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-full border border-[#15803D]/20">
                      {availableCustomRewards.length} Available
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                      Disabled by Gym
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-[#292524]">3. Other Custom Rewards</h4>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  Claim Personal Training Sessions, workout vouchers, and exclusive gym perks crafted by your gym owner.
                </p>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#B76E79]">
                  <span>Browse vouchers</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Instructions — Must Be Clearly Visible */}
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7DADD] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-[#E7DADD] pb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#B76E79]/15 text-[#B76E79] flex items-center justify-center">
                <HelpCircle size={22} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#292524]">How to Use Your Referral Points</h2>
                <p className="text-xs text-[#57534E]">
                  Simple step-by-step instructions and important policy terms for your referral points.
                </p>
              </div>
            </div>

            {/* 7 Steps List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]/60">
                  <div className="w-7 h-7 rounded-full bg-[#B76E79] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <p className="text-xs text-[#292524] leading-relaxed pt-0.5">
                    <strong>Earn points</strong> when your referred friend completes an eligible membership payment.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]/60">
                  <div className="w-7 h-7 rounded-full bg-[#B76E79] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <p className="text-xs text-[#292524] leading-relaxed pt-0.5">
                    Open <strong>Points & Redemption</strong> to check your available points balance and equivalent rupee value.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]/60">
                  <div className="w-7 h-7 rounded-full bg-[#B76E79] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </div>
                  <p className="text-xs text-[#292524] leading-relaxed pt-0.5">
                    Click <strong>Redeem Points</strong> and select <em>Membership Plan Discount</em>, <em>Gym Store Purchase</em>, or another available reward.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]/60">
                  <div className="w-7 h-7 rounded-full bg-[#B76E79] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </div>
                  <p className="text-xs text-[#292524] leading-relaxed pt-0.5">
                    Review the required points, discount value, and eligibility rules before confirming your redemption.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]/60">
                  <div className="w-7 h-7 rounded-full bg-[#B76E79] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    5
                  </div>
                  <p className="text-xs text-[#292524] leading-relaxed pt-0.5">
                    Apply your points during eligible checkout or submit your custom reward voucher request.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]/60">
                  <div className="w-7 h-7 rounded-full bg-[#B76E79] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    6
                  </div>
                  <p className="text-xs text-[#292524] leading-relaxed pt-0.5">
                    For purchases, points are deducted only after successful payment. For custom rewards, follow the displayed confirmation and approval status.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]/60">
                  <div className="w-7 h-7 rounded-full bg-[#B76E79] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    7
                  </div>
                  <p className="text-xs text-[#292524] leading-relaxed pt-0.5">
                    Check your <strong>Points History</strong> and <strong>Redemption History</strong> below to track every transaction.
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notes Box (Dynamic from Gym Owner's Settings) */}
            <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <AlertCircle size={16} />
                <span>Important Notes (Configured by {gymName})</span>
              </div>
              <ul className="text-xs text-[#57534E] space-y-2 list-disc list-inside leading-relaxed">
                <li>
                  The conversion rate is dynamically set by your gym owner:{' '}
                  <strong className="text-[#292524]">
                    {rewardSettings.pointsPerConversionUnit} points = ₹{rewardSettings.currencyValuePerUnit}
                  </strong>{' '}
                  (₹{pointRate.toFixed(2)} per point).
                </li>
                <li>
                  Minimum points required for redemption:{' '}
                  <strong className="text-[#292524]">{rewardSettings.minPointsForRedemption} points</strong>.
                </li>
                <li>
                  Maximum discount allowed per transaction:{' '}
                  <strong className="text-[#292524]">₹{rewardSettings.maxDiscountPerTransaction}</strong>.
                </li>
                <li>
                  Unused points remain available for future eligible redemptions:{' '}
                  <strong className="text-[#292524]">
                    {rewardSettings.pointsExpiryDays > 0 ? `${rewardSettings.pointsExpiryDays} days validity` : 'No expiry date'}
                  </strong>.
                </li>
                <li>Redemption is available only for eligible plans, products, and custom rewards enabled by your gym.</li>
                <li>Points cannot be transferred to another customer or withdrawn as cash.</li>
                <li>Failed payments or cancelled orders will never permanently deduct points; your balance is safely refunded.</li>
                {rewardSettings.rewardInstructions && (
                  <li className="text-[#B76E79]">
                    <strong>Special Gym Note:</strong> {rewardSettings.rewardInstructions}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Points Transaction History Ledger */}
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7DADD] p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7DADD] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#292524]">Points Transaction History</h3>
                <p className="text-xs text-[#57534E]">
                  Complete ledger of earned, redeemed, refunded, and adjusted points.
                </p>
              </div>
              <span className="text-xs font-bold text-[#57534E] bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#E7DADD]">
                {pointsHistory.length} Recorded Transactions
              </span>
            </div>

            {pointsHistory.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Coins size={32} className="mx-auto text-[#B76E79]/50" />
                <p className="text-sm font-semibold text-[#57534E]">No points transactions yet</p>
                <p className="text-xs text-[#57534E]">Invite friends or make eligible purchases to earn points.</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F3E8E8] text-[#57534E] uppercase text-[10px] tracking-wider border-b border-[#E7DADD]">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Transaction Type</th>
                        <th className="py-3 px-4">Points</th>
                        <th className="py-3 px-4">Discount Value</th>
                        <th className="py-3 px-4">Reason / Notes</th>
                        <th className="py-3 px-4">Balance After</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-[#E7DADD]">
                      {pointsHistory.map((tx: any) => {
                        const txType = tx.transactionType || tx.type || 'EARN_BONUS';
                        const txPoints = tx.points !== undefined ? tx.points : Math.abs(tx.amount || 0);
                        const isPositive = ['EARN_REFERRAL', 'EARN_BONUS', 'EARN_ACTIVITY', 'REFUND_POINTS'].includes(txType) || (txType === 'ADMIN_ADJUST' && ((tx.amount || tx.points || 0) > 0));
                        const txStatus = tx.status || 'COMPLETED';
                        const txNote = tx.reason || tx.description || tx.orderReference || 'Reward points transaction';

                        return (
                          <tr key={tx._id} className="hover:bg-[#F3E8E8]/50 transition">
                            <td className="py-3 px-4 text-[#57534E] whitespace-nowrap">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Today'} {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#292524]">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FFFFFF] border border-[#E7DADD]">
                                {String(txType).replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className={`py-3 px-4 font-black ${isPositive ? 'text-[#15803D]' : 'text-amber-400'}`}>
                              {isPositive ? `+${txPoints}` : `-${txPoints}`}
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#B76E79]">
                              {tx.discountAmount ? `₹${tx.discountAmount}` : '—'}
                            </td>
                            <td className="py-3 px-4 text-[#292524] max-w-xs truncate">
                              {txNote}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#292524]">
                              {tx.balanceAfter !== undefined ? `${tx.balanceAfter} pts` : '—'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                txStatus === 'COMPLETED' ? 'bg-[#15803D]/15 text-[#15803D] border border-[#15803D]/30' :
                                txStatus === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                              }`}>
                                {txStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedTxForDetails(tx)}
                                className="px-3 py-1.5 bg-[#B76E79]/15 hover:bg-[#B76E79]/25 text-[#B76E79] hover:text-white border border-[#B76E79]/30 hover:border-[#B76E79] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs whitespace-nowrap"
                                title="View complete transaction breakdown"
                              >
                                <Eye size={13} />
                                <span>View Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile-Friendly Transaction Cards (visible on phones < md) */}
                <div className="md:hidden space-y-3">
                  {pointsHistory.map((tx: any) => {
                    const txType = tx.transactionType || tx.type || 'EARN_BONUS';
                    const txPoints = tx.points !== undefined ? tx.points : Math.abs(tx.amount || 0);
                    const isPositive = ['EARN_REFERRAL', 'EARN_BONUS', 'EARN_ACTIVITY', 'REFUND_POINTS'].includes(txType) || (txType === 'ADMIN_ADJUST' && ((tx.amount || tx.points || 0) > 0));
                    const txStatus = tx.status || 'COMPLETED';
                    const txNote = tx.reason || tx.description || tx.orderReference || 'Reward points transaction';

                    return (
                      <div key={tx._id} className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#57534E] font-medium">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'} • {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            txStatus === 'COMPLETED' ? 'bg-[#15803D]/15 text-[#15803D] border border-[#15803D]/30' :
                            txStatus === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {txStatus}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFFFF] text-[#B76E79] border border-[#E7DADD] inline-block">
                              {String(txType).replace(/_/g, ' ')}
                            </span>
                            <p className="text-xs text-[#292524] font-medium line-clamp-1">
                              {txNote}
                            </p>
                          </div>
                          <div className={`text-right text-lg font-black shrink-0 ${isPositive ? 'text-[#15803D]' : 'text-amber-400'}`}>
                            {isPositive ? `+${txPoints}` : `-${txPoints}`}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E7DADD]/60">
                          <span className="text-[#57534E]">Balance after: <strong className="text-[#292524]">{tx.balanceAfter !== undefined ? `${tx.balanceAfter} pts` : '—'}</strong></span>
                          {tx.discountAmount ? (
                            <span className="text-[#B76E79] font-semibold">Value: ₹{tx.discountAmount}</span>
                          ) : null}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedTxForDetails(tx)}
                          className="w-full py-2 bg-[#B76E79]/15 hover:bg-[#B76E79]/25 text-[#B76E79] hover:text-white border border-[#B76E79]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Custom Reward Claims & Vouchers */}
          {customClaims.length > 0 && (
            <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7DADD] p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7DADD] pb-3">
                <h3 className="text-base font-extrabold text-[#292524]">My Claimed Reward Vouchers</h3>
                <span className="text-xs font-bold text-[#FFFFFF] bg-[#B76E79] px-3 py-1 rounded-full">
                  {customClaims.length} Vouchers
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customClaims.map((claim) => (
                  <div key={claim._id} className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-[#292524]">{claim.rewardTitle}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        claim.status === 'APPROVED' ? 'bg-[#15803D]/10 text-[#15803D]' :
                        claim.status === 'REDEEMED' ? 'bg-[#B76E79]/10 text-[#B76E79]' :
                        claim.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#57534E]">Voucher Code:</span>
                      <span className="font-mono font-bold text-[#B76E79] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E7DADD]">
                        {claim.voucherCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#57534E]">Points Cost:</span>
                      <span className="font-semibold text-[#292524]">{claim.pointsCost} points</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#57534E]">Claim Date:</span>
                      <span className="text-[#57534E]">{new Date(claim.claimedAt).toLocaleDateString()}</span>
                    </div>
                    {claim.reviewNotes && (
                      <p className="text-[11px] text-[#B76E79] bg-[#F3E8E8] p-2 rounded-xl mt-1">
                        <strong>Gym Note:</strong> {claim.reviewNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Redemption Modal: "How would you like to use your points?" */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E7DADD] flex items-center justify-between bg-[#FFFFFF]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#B76E79]/15 text-[#B76E79] flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#292524]">How would you like to use your points?</h3>
                  <p className="text-xs text-[#57534E]">
                    Available Balance: <strong className="text-[#B76E79]">{wallet.currentBalance} points</strong> (₹{equivalentRupeeValue})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRedeemModal(false);
                  setSelectedRedeemChannel(null);
                  setClaimFeedback(null);
                }}
                className="w-8 h-8 rounded-full bg-[#F3E8E8] text-[#57534E] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {!selectedRedeemChannel && (
                <div className="space-y-4">
                  <p className="text-xs text-[#57534E]">
                    Select a redemption destination below. Only options enabled by <strong className="text-[#292524]">{gymName}</strong> are active:
                  </p>

                  {/* 1. Membership Plan Discount */}
                  <div
                    onClick={() => {
                      if (rewardSettings.enableMembershipDiscount) {
                        setSelectedRedeemChannel('MEMBERSHIP');
                        if (gymPlans.length > 0) {
                          setSelectedPlanForDiscount(gymPlans[0]);
                          setPointsToRedeemInput(Math.min(wallet.currentBalance, 200));
                        }
                      }
                    }}
                    className={`p-5 rounded-2xl border transition text-left cursor-pointer ${
                      rewardSettings.enableMembershipDiscount
                        ? 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79] hover:bg-[#F3E8E8]'
                        : 'bg-[#FFFFFF]/40 border-red-500/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#B76E79]/15 text-[#B76E79] flex items-center justify-center">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#292524]">1. Membership Plan Discount</h4>
                          <p className="text-xs text-[#57534E]">
                            Apply points to renew or upgrade your gym membership with instant rupee discounts.
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#B76E79]" />
                    </div>
                    {!rewardSettings.enableMembershipDiscount && (
                      <p className="text-[11px] text-red-400 mt-2 font-medium">
                        Currently disabled by your gym owner in reward settings.
                      </p>
                    )}
                  </div>

                  {/* 2. Gym Store Purchase */}
                  <div
                    onClick={() => {
                      if (rewardSettings.enableStorePurchase) {
                        setSelectedRedeemChannel('STORE');
                      }
                    }}
                    className={`p-5 rounded-2xl border transition text-left cursor-pointer ${
                      rewardSettings.enableStorePurchase
                        ? 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79] hover:bg-[#F3E8E8]'
                        : 'bg-[#FFFFFF]/40 border-red-500/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#292524]">2. Gym Store Purchase</h4>
                          <p className="text-xs text-[#57534E]">
                            Use points at Gym Store checkout on protein, supplements, and gym accessories.
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#B76E79]" />
                    </div>
                    {!rewardSettings.enableStorePurchase && (
                      <p className="text-[11px] text-red-400 mt-2 font-medium">
                        Currently disabled by your gym owner in reward settings.
                      </p>
                    )}
                  </div>

                  {/* 3. Other Custom Rewards */}
                  <div
                    onClick={() => {
                      if (rewardSettings.enableCustomRewards) {
                        setSelectedRedeemChannel('CUSTOM');
                      }
                    }}
                    className={`p-5 rounded-2xl border transition text-left cursor-pointer ${
                      rewardSettings.enableCustomRewards
                        ? 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79] hover:bg-[#F3E8E8]'
                        : 'bg-[#FFFFFF]/40 border-red-500/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                          <Award size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#292524]">3. Other Custom Rewards</h4>
                          <p className="text-xs text-[#57534E]">
                            Redeem points for Personal Training sessions, workout gear, or vouchers.
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#B76E79]" />
                    </div>
                    {!rewardSettings.enableCustomRewards && (
                      <p className="text-[11px] text-red-400 mt-2 font-medium">
                        Currently disabled by your gym owner in reward settings.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW A: MEMBERSHIP PLAN DISCOUNT INTERFACE */}
              {selectedRedeemChannel === 'MEMBERSHIP' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E7DADD] pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRedeemChannel(null)}
                      className="text-xs font-bold text-[#B76E79] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to Options
                    </button>
                    <span className="text-xs font-bold text-[#15803D] bg-[#15803D]/10 px-2.5 py-0.5 rounded-full border border-[#15803D]/20">
                      Option A: Membership Plan Discount
                    </span>
                  </div>

                  {wallet.currentBalance < rewardSettings.minPointsForRedemption ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 space-y-1">
                      <div className="font-bold flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>Minimum Points Required: {rewardSettings.minPointsForRedemption}</span>
                      </div>
                      <p>
                        You currently have {wallet.currentBalance} points. Refer friends to earn more points before redeeming!
                      </p>
                    </div>
                  ) : null}

                  {/* Plan Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#57534E] uppercase">
                      Select Eligible Membership Plan
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {gymPlans.map((plan: any, idx: number) => {
                        const eligible = isPlanEligible(plan.name);
                        const isSelected = selectedPlanForDiscount?.name === plan.name;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              if (eligible) {
                                setSelectedPlanForDiscount(plan);
                                const maxAllowed = Math.min(
                                  wallet.currentBalance,
                                  Math.floor((Number(plan.price || 0)) / pointRate)
                                );
                                setPointsToRedeemInput(Math.min(maxAllowed, wallet.currentBalance));
                              }
                            }}
                            className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-[#F3E8E8] border-[#B76E79]'
                                : eligible
                                ? 'bg-[#FFFFFF] border-[#E7DADD] hover:border-[#B76E79]/50'
                                : 'bg-[#FFFFFF]/40 border-red-500/20 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-sm text-[#292524]">{plan.name}</div>
                              <div className="text-xs text-[#57534E]">Duration: {plan.duration || 'Standard'}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold text-sm text-[#292524]">₹{plan.price}</div>
                              {eligible ? (
                                <span className="text-[10px] text-[#15803D] font-bold">Eligible</span>
                              ) : (
                                <span className="text-[10px] text-red-400 font-bold">Ineligible</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Points Slider / Input */}
                  {selectedPlanForDiscount && (
                    <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#57534E] uppercase">
                          Points to Redeem (Max: {maxRedeemablePointsForSelectedPlan})
                        </span>
                        <span className="font-extrabold text-[#B76E79] text-base">
                          {pointsToRedeemInput} Points
                        </span>
                      </div>

                      <input
                        type="range"
                        min={rewardSettings.minPointsForRedemption}
                        max={Math.max(rewardSettings.minPointsForRedemption, maxRedeemablePointsForSelectedPlan)}
                        step={10}
                        value={pointsToRedeemInput}
                        onChange={(e) => setPointsToRedeemInput(Number(e.target.value))}
                        disabled={maxRedeemablePointsForSelectedPlan < rewardSettings.minPointsForRedemption}
                        className="w-full accent-[#B76E79] cursor-pointer"
                      />

                      {/* Calculation Breakdown Preview */}
                      <div className="pt-3 border-t border-[#E7DADD] space-y-1.5 text-xs">
                        <div className="flex justify-between text-[#57534E]">
                          <span>Original Membership Price:</span>
                          <span className="font-bold text-[#292524]">₹{selectedPlanForDiscount.price}</span>
                        </div>
                        <div className="flex justify-between text-[#57534E]">
                          <span>Conversion Rate:</span>
                          <span>{rewardSettings.pointsPerConversionUnit} pts = ₹{rewardSettings.currencyValuePerUnit}</span>
                        </div>
                        <div className="flex justify-between text-[#15803D] font-bold">
                          <span>Discount Applied ({pointsToRedeemInput} pts):</span>
                          <span>- ₹{previewDiscountAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-[#292524] pt-1 border-t border-[#E7DADD]">
                          <span>Final Payable Price:</span>
                          <span className="text-[#B76E79]">₹{previewFinalPrice}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleProceedMembershipCheckout}
                        disabled={pointsToRedeemInput < rewardSettings.minPointsForRedemption}
                        className="w-full py-3 bg-[#B76E79] hover:bg-[#9F5965] text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-[#B76E79]/20 cursor-pointer disabled:opacity-50"
                      >
                        Apply ₹{previewDiscountAmount} Discount & Proceed to Checkout →
                      </button>
                      <p className="text-[11px] text-[#57534E] text-center">
                        Points are deducted only after payment confirmation.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW B: GYM STORE PURCHASE INTERFACE */}
              {selectedRedeemChannel === 'STORE' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E7DADD] pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRedeemChannel(null)}
                      className="text-xs font-bold text-[#B76E79] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to Options
                    </button>
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      Option B: Gym Store Purchase
                    </span>
                  </div>

                  <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                        <ShoppingBag size={24} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-[#292524]">Shop the Official Gym Store</h4>
                        <p className="text-xs text-[#57534E]">
                          Redeem your referral points directly at store checkout.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#292524] bg-[#F3E8E8] p-4 rounded-xl border border-[#E7DADD]">
                      <div className="flex justify-between">
                        <span>Your Available Points:</span>
                        <strong className="text-[#B76E79]">{wallet.currentBalance} points</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Equivalent Store Discount:</span>
                        <strong className="text-[#15803D]">Up to ₹{equivalentRupeeValue}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Conversion Rate:</span>
                        <span>{rewardSettings.pointsPerConversionUnit} pts = ₹{rewardSettings.currencyValuePerUnit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Discount Per Order:</span>
                        <span>₹{rewardSettings.maxDiscountPerTransaction}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Product Eligibility:</span>
                        <span>{rewardSettings.storeRedemptionScope === 'ALL' ? 'All Store Products' : 'Selected Products'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#57534E] leading-relaxed">
                      Simply browse products in the Gym Store, add them to your cart, and check <strong>"Redeem Referral Points"</strong> during checkout. Your points will automatically reduce the order total!
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setShowRedeemModal(false);
                        navigate('/member/store');
                      }}
                      className="w-full py-3 bg-[#B76E79] hover:bg-[#9F5965] text-white font-extrabold text-sm rounded-xl transition shadow-lg cursor-pointer"
                    >
                      Go to Gym Store & Shop Now →
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW C: OTHER CUSTOM REWARDS INTERFACE */}
              {selectedRedeemChannel === 'CUSTOM' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E7DADD] pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRedeemChannel(null)}
                      className="text-xs font-bold text-[#B76E79] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to Options
                    </button>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Option C: Custom Rewards & Vouchers
                    </span>
                  </div>

                  {claimFeedback && (
                    <div
                      className={`p-4 rounded-2xl text-xs font-medium space-y-1 ${
                        claimFeedback.type === 'success'
                          ? 'bg-[#15803D]/15 border border-[#15803D]/30 text-[#15803D]'
                          : 'bg-red-500/15 border border-red-500/30 text-red-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {claimFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{claimFeedback.message}</span>
                      </div>
                      {claimFeedback.voucher && (
                        <p className="text-xs text-[#292524]">
                          Voucher Code:{' '}
                          <span className="font-mono font-bold text-[#B76E79] bg-[#FFFFFF] px-2 py-0.5 rounded">
                            {claimFeedback.voucher}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {availableCustomRewards.length === 0 ? (
                    <div className="py-10 text-center space-y-2 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] p-6">
                      <Award size={32} className="mx-auto text-amber-400/50" />
                      <p className="text-sm font-semibold text-[#57534E]">No Custom Rewards Currently Listed</p>
                      <p className="text-xs text-[#57534E]">
                        Your gym owner has not added any custom rewards yet. Check back soon!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {availableCustomRewards.map((reward) => {
                        const canAfford = wallet.currentBalance >= reward.pointsRequired;
                        const isClaiming = claimingRewardId === reward._id;
                        return (
                          <div
                            key={reward._id}
                            className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold text-sm text-[#292524]">{reward.title}</h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F3E8E8] text-[#B76E79] rounded-full border border-[#E7DADD]">
                                  {reward.category}
                                </span>
                              </div>
                              <p className="text-xs text-[#57534E] line-clamp-2">{reward.description}</p>
                              <div className="flex items-center gap-3 text-[11px] text-[#57534E] pt-1">
                                <span>Valid for {reward.validityDays} days</span>
                                {reward.requiresApproval && (
                                  <span className="text-amber-400 font-medium">• Requires Gym Owner Approval</span>
                                )}
                              </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0 space-y-2">
                              <div className="text-base font-black text-[#B76E79]">
                                {reward.pointsRequired} Points
                              </div>
                              <button
                                type="button"
                                disabled={!canAfford || isClaiming}
                                onClick={() => handleClaimCustomReward(reward)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                  canAfford
                                    ? 'bg-[#B76E79] hover:bg-[#9F5965] text-white shadow'
                                    : 'bg-[#F3E8E8] text-[#57534E] cursor-not-allowed border border-[#E7DADD]'
                                }`}
                              >
                                {isClaiming ? <RefreshCw className="animate-spin" size={14} /> : <Gift size={14} />}
                                {canAfford ? 'Claim Reward' : 'Insufficient Points'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E7DADD] bg-[#FFFFFF] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowRedeemModal(false);
                  setSelectedRedeemChannel(null);
                  setClaimFeedback(null);
                }}
                className="px-5 py-2.5 bg-[#F3E8E8] hover:bg-[#E7DADD] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F3E8E8] text-[#57534E] hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#292524]">Scan to Join with Referral</h3>
              <p className="text-xs text-[#57534E]">
                Scan with any phone camera to register with promo discount at <strong className="text-[#292524]">{gymName}</strong>.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl mx-auto w-fit shadow-inner">
              <QRCode value={shareLink} size={180} />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-[#57534E]">Promo Code</span>
              <div className="text-lg font-mono font-black text-[#B76E79]">{referralCode}</div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-[#B76E79] hover:bg-[#9F5965] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── Transaction Details Modal ── */}
      {selectedTxForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-[#E7DADD] flex items-center justify-between bg-[#F3E8E8] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#B76E79]/15 rounded-xl text-[#B76E79]">
                  <Coins size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#292524]">Points Transaction Details</h3>
                  <p className="text-xs text-[#57534E]">ID: <span className="font-mono text-[11px] text-[#B76E79]">{selectedTxForDetails._id || 'TXN-REF'}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxForDetails(null)}
                className="p-2 rounded-xl text-[#57534E] hover:text-[#292524] hover:bg-[#F3E8E8] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              {/* Top Banner with Points & Type */}
              <div className="p-4 rounded-2xl bg-[#F3E8E8] border border-[#E7DADD] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#57534E] block mb-1 font-medium">Transaction Type</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFFFFF] text-[#B76E79] border border-[#B76E79]/30 inline-block">
                    {String(selectedTxForDetails.transactionType || selectedTxForDetails.type || 'EARN_BONUS').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#57534E] block mb-1 font-medium">Points Change</span>
                  {(() => {
                    const txType = selectedTxForDetails.transactionType || selectedTxForDetails.type || 'EARN_BONUS';
                    const txPoints = selectedTxForDetails.points !== undefined ? selectedTxForDetails.points : Math.abs(selectedTxForDetails.amount || 0);
                    const isPositive = ['EARN_REFERRAL', 'EARN_BONUS', 'EARN_ACTIVITY', 'REFUND_POINTS'].includes(txType) || (txType === 'ADMIN_ADJUST' && ((selectedTxForDetails.amount || selectedTxForDetails.points || 0) > 0));
                    return (
                      <span className={`text-2xl font-black ${isPositive ? 'text-[#15803D]' : 'text-amber-400'}`}>
                        {isPositive ? `+${txPoints}` : `-${txPoints}`} pts
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Grid of Key Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#F3E8E8] rounded-xl border border-[#E7DADD] space-y-1">
                  <span className="text-[#57534E] font-medium block">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (selectedTxForDetails.status || 'COMPLETED') === 'COMPLETED' ? 'bg-[#15803D]/15 text-[#15803D] border border-[#15803D]/30' :
                    (selectedTxForDetails.status || 'COMPLETED') === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {selectedTxForDetails.status || 'COMPLETED'}
                  </span>
                </div>

                <div className="p-3 bg-[#F3E8E8] rounded-xl border border-[#E7DADD] space-y-1">
                  <span className="text-[#57534E] font-medium block">Discount Value</span>
                  <span className="text-sm font-bold text-[#B76E79]">
                    {selectedTxForDetails.discountAmount ? `₹${selectedTxForDetails.discountAmount}` : '—'}
                  </span>
                </div>

                <div className="p-3 bg-[#F3E8E8] rounded-xl border border-[#E7DADD] space-y-1">
                  <span className="text-[#57534E] font-medium block">Balance After</span>
                  <span className="text-sm font-bold text-[#292524]">
                    {selectedTxForDetails.balanceAfter !== undefined ? `${selectedTxForDetails.balanceAfter} pts` : '—'}
                  </span>
                </div>

                <div className="p-3 bg-[#F3E8E8] rounded-xl border border-[#E7DADD] space-y-1">
                  <span className="text-[#57534E] font-medium block">Date & Time</span>
                  <span className="text-xs font-semibold text-[#292524] block">
                    {selectedTxForDetails.createdAt ? new Date(selectedTxForDetails.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Today'}
                  </span>
                </div>
              </div>

              {/* Reason / Notes */}
              <div className="p-4 bg-[#F3E8E8] rounded-xl border border-[#E7DADD] space-y-1.5">
                <span className="text-xs font-semibold text-[#57534E] block">Reason / Description</span>
                <p className="text-xs text-[#292524] leading-relaxed font-medium">
                  {selectedTxForDetails.reason || selectedTxForDetails.description || selectedTxForDetails.orderReference || 'Reward points transaction credited to your member account.'}
                </p>
              </div>

              {/* Order Reference or Additional Meta */}
              {selectedTxForDetails.orderReference && (
                <div className="p-3 bg-[#F3E8E8] rounded-xl border border-[#E7DADD] flex items-center justify-between text-xs">
                  <span className="text-[#57534E]">Order / Claim Reference:</span>
                  <span className="font-mono font-bold text-[#B76E79]">{selectedTxForDetails.orderReference}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E7DADD] bg-[#F3E8E8] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTxForDetails(null)}
                className="px-5 py-2.5 bg-[#B76E79] hover:bg-[#9F5965] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberReferrals;
