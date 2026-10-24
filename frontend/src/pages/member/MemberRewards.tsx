import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins, Sparkles, TrendingUp, CreditCard, ShoppingBag,
  Award, HelpCircle, AlertCircle, CheckCircle2, ChevronRight,
  X, DollarSign, ArrowDownRight, RefreshCw, Gift, Eye
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

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

const MemberRewards: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gymName, setGymName] = useState<string>('Our Gym');
  const [gymDetails, setGymDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

  // Conversion rate helper
  const pointRate = useMemo(() => {
    const pts = rewardSettings.pointsPerConversionUnit || 100;
    const val = rewardSettings.currencyValuePerUnit || 50;
    return val / pts;
  }, [rewardSettings]);

  const equivalentRupeeValue = useMemo(() => {
    return Math.floor(wallet.currentBalance * pointRate);
  }, [wallet.currentBalance, pointRate]);

  // Load All Rewards & Points Data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [detailedRes, settingsRes, customRes, gymRes] = await Promise.all([
        api.get('/referrals/my-detailed-history').catch(() => ({ data: { success: false } })),
        api.get('/referrals/settings').catch(() => ({ data: { success: false } })),
        api.get('/referrals/custom-rewards').catch(() => ({ data: { success: false } })),
        user?.gymId ? api.get(`/gyms/${user.gymId}`).catch(() => ({ data: { gym: null } })) : Promise.resolve({ data: { gym: null } })
      ]);

      if (gymRes.data?.gym) {
        setGymDetails(gymRes.data.gym);
        if (gymRes.data.gym.name) setGymName(gymRes.data.gym.name);
      } else if (user?.gymName) {
        setGymName(user.gymName);
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
      console.error('Failed to load rewards & points data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

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
    <div className="min-h-screen bg-[#080B0C] text-[#FFFFFF] p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141D1E] via-[#151515] to-[#0E1415] border border-[#2A3A3A] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(45, 212, 191,0.15)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 rounded-full text-xs font-bold uppercase tracking-wider text-[#2DD4BF]">
              <Coins size={14} className="text-[#2DD4BF]" />
              Loyalty & Referral Rewards
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#FFFFFF]">
              My Rewards & Points Balance
            </h1>
            <p className="text-[#9AAEAE] text-sm leading-relaxed">
              Earn points every time a friend joins <strong className="text-[#FFFFFF]">{gymName}</strong>. 
              Redeem your points directly towards membership renewals, gym store gear, or special training sessions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedRedeemChannel(null);
                setShowRedeemModal(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] hover:from-[#5EEAD4] hover:to-[#14B8A6] text-[#06201D] font-bold font-black text-sm rounded-2xl transition-all shadow-xl shadow-[#2DD4BF]/30 cursor-pointer"
            >
              <Coins size={18} />
              Redeem Points Now
            </button>
          </div>
        </div>
      </div>

      {/* Reward Summary 4-Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Available Points */}
        <div className="bg-[#141D1E] p-6 rounded-3xl border border-[#2A3A3A] shadow-lg space-y-2 relative overflow-hidden group hover:border-[#2DD4BF]/50 transition">
          <div className="flex items-center justify-between text-[#9AAEAE]">
            <span className="text-xs font-bold uppercase tracking-wider">Available Points</span>
            <div className="w-10 h-10 rounded-2xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
              <Coins size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#F5FAFA]">
            {wallet.currentBalance.toLocaleString()}
          </div>
          <div className="text-xs text-[#2DD4BF] font-semibold flex items-center gap-1.5 pt-1">
            <span>Supports 5,000+ balances</span>
          </div>
        </div>

        {/* 2. Equivalent Discount Value */}
        <div className="bg-[#141D1E] p-6 rounded-3xl border border-[#2A3A3A] shadow-lg space-y-2 relative overflow-hidden group hover:border-[#34D399]/50 transition">
          <div className="flex items-center justify-between text-[#9AAEAE]">
            <span className="text-xs font-bold uppercase tracking-wider">Equivalent Value</span>
            <div className="w-10 h-10 rounded-2xl bg-[#34D399]/10 text-[#34D399] flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#34D399]">
            ₹{equivalentRupeeValue.toLocaleString()}
          </div>
          <div className="text-xs text-[#9AAEAE] pt-1">
            Rate: {rewardSettings.pointsPerConversionUnit} pts = ₹{rewardSettings.currencyValuePerUnit}
          </div>
        </div>

        {/* 3. Total Points Earned */}
        <div className="bg-[#141D1E] p-6 rounded-3xl border border-[#2A3A3A] shadow-lg space-y-2 relative overflow-hidden group hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between text-[#9AAEAE]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Earned</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-purple-300">
            {wallet.totalEarned.toLocaleString()}
          </div>
          <div className="text-xs text-[#9AAEAE] pt-1">
            From successful referrals & bonuses
          </div>
        </div>

        {/* 4. Total Points Redeemed */}
        <div className="bg-[#141D1E] p-6 rounded-3xl border border-[#2A3A3A] shadow-lg space-y-2 relative overflow-hidden group hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between text-[#9AAEAE]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Redeemed</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-300">
            {wallet.totalRedeemed.toLocaleString()}
          </div>
          <div className="text-xs text-[#9AAEAE] pt-1">
            Redeemed on plans & gym store
          </div>
        </div>
      </div>

      {/* Available Redemption Channels */}
      <div className="bg-[#141D1E] p-6 rounded-3xl border border-[#2A3A3A] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#F5FAFA]">Available Redemption Channels</h3>
            <p className="text-xs text-[#9AAEAE]">Choose how to use your referral points today.</p>
          </div>
          <span className="text-xs text-[#2DD4BF] font-bold bg-[#2DD4BF]/10 px-3 py-1 rounded-full border border-[#2DD4BF]/20">
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
                ? 'bg-[#0E1415] border-[#2A3A3A] hover:border-[#2DD4BF] hover:bg-[#141D1E]'
                : 'bg-[#0E1415]/50 border-red-500/20 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/15 text-[#2DD4BF] flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              {rewardSettings.enableMembershipDiscount ? (
                <span className="text-[10px] font-bold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full border border-[#34D399]/20">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                  Disabled by Gym
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-[#F5FAFA]">1. Membership Plan Discount</h4>
            <p className="text-xs text-[#9AAEAE] mt-1 leading-relaxed">
              Apply your points directly during membership renewal or upgrade checkout for instant rupee discounts.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#2DD4BF]">
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
                ? 'bg-[#0E1415] border-[#2A3A3A] hover:border-[#2DD4BF] hover:bg-[#141D1E]'
                : 'bg-[#0E1415]/50 border-red-500/20 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <ShoppingBag size={20} />
              </div>
              {rewardSettings.enableStorePurchase ? (
                <span className="text-[10px] font-bold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full border border-[#34D399]/20">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                  Disabled by Gym
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-[#F5FAFA]">2. Gym Store Purchases</h4>
            <p className="text-xs text-[#9AAEAE] mt-1 leading-relaxed">
              Redeem points against protein supplements, gym apparel, and accessories in the official Gym Store.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#2DD4BF]">
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
                ? 'bg-[#0E1415] border-[#2A3A3A] hover:border-[#2DD4BF] hover:bg-[#141D1E]'
                : 'bg-[#0E1415]/50 border-red-500/20 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Award size={20} />
              </div>
              {rewardSettings.enableCustomRewards ? (
                <span className="text-[10px] font-bold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full border border-[#34D399]/20">
                  {availableCustomRewards.length} Available
                </span>
              ) : (
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                  Disabled by Gym
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-[#F5FAFA]">3. Other Custom Rewards</h4>
            <p className="text-xs text-[#9AAEAE] mt-1 leading-relaxed">
              Claim Personal Training Sessions, workout vouchers, and exclusive gym perks crafted by your gym owner.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#2DD4BF]">
              <span>Browse vouchers</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Instructions — Must Be Clearly Visible */}
      <div className="bg-[#141D1E] rounded-3xl border border-[#2A3A3A] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-[#2A3A3A] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#2DD4BF]/15 text-[#2DD4BF] flex items-center justify-center">
            <HelpCircle size={22} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#F5FAFA]">How to Use Your Referral Points</h2>
            <p className="text-xs text-[#9AAEAE]">
              Simple step-by-step instructions and important policy terms for your gym points.
            </p>
          </div>
        </div>

        {/* 7 Steps List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-3.5 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]/60">
              <div className="w-7 h-7 rounded-full bg-[#2DD4BF] text-[#06201D] font-bold flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <p className="text-xs text-[#C1D0D0] leading-relaxed pt-0.5">
                <strong>Earn points</strong> when your referred friend completes an eligible membership payment.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]/60">
              <div className="w-7 h-7 rounded-full bg-[#2DD4BF] text-[#06201D] font-bold flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <p className="text-xs text-[#C1D0D0] leading-relaxed pt-0.5">
                Open <strong>My Rewards & Points</strong> to check your available points balance and equivalent rupee value.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]/60">
              <div className="w-7 h-7 rounded-full bg-[#2DD4BF] text-[#06201D] font-bold flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <p className="text-xs text-[#C1D0D0] leading-relaxed pt-0.5">
                Click <strong>Redeem Points</strong> and select <em>Membership Plan Discount</em>, <em>Gym Store Purchase</em>, or another available reward.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]/60">
              <div className="w-7 h-7 rounded-full bg-[#2DD4BF] text-[#06201D] font-bold flex items-center justify-center text-xs font-bold shrink-0">
                4
              </div>
              <p className="text-xs text-[#C1D0D0] leading-relaxed pt-0.5">
                Review the required points, discount value, and eligibility rules before confirming your redemption.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-3.5 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]/60">
              <div className="w-7 h-7 rounded-full bg-[#2DD4BF] text-[#06201D] font-bold flex items-center justify-center text-xs font-bold shrink-0">
                5
              </div>
              <p className="text-xs text-[#C1D0D0] leading-relaxed pt-0.5">
                Apply your points during eligible checkout or submit your custom reward voucher request.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]/60">
              <div className="w-7 h-7 rounded-full bg-[#2DD4BF] text-[#06201D] font-bold flex items-center justify-center text-xs font-bold shrink-0">
                6
              </div>
              <p className="text-xs text-[#C1D0D0] leading-relaxed pt-0.5">
                For purchases, points are deducted only after successful payment. For custom rewards, follow the displayed confirmation and approval status.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]/60">
              <div className="w-7 h-7 rounded-full bg-[#2DD4BF] text-[#06201D] font-bold flex items-center justify-center text-xs font-bold shrink-0">
                7
              </div>
              <p className="text-xs text-[#C1D0D0] leading-relaxed pt-0.5">
                Check your <strong>Points History</strong> and <strong>Redemption History</strong> below to track every transaction.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notes Box (Dynamic from Gym Owner's Settings) */}
        <div className="p-5 bg-[#0E1415] rounded-2xl border border-[#2A3A3A] space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <AlertCircle size={16} />
            <span>Important Notes (Configured by {gymName})</span>
          </div>
          <ul className="text-xs text-[#9AAEAE] space-y-2 list-disc list-inside leading-relaxed">
            <li>
              The conversion rate is dynamically set by your gym owner:{' '}
              <strong className="text-[#F5FAFA]">
                {rewardSettings.pointsPerConversionUnit} points = ₹{rewardSettings.currencyValuePerUnit}
              </strong>{' '}
              (₹{pointRate.toFixed(2)} per point).
            </li>
            <li>
              Minimum points required for redemption:{' '}
              <strong className="text-[#F5FAFA]">{rewardSettings.minPointsForRedemption} points</strong>.
            </li>
            <li>
              Maximum discount allowed per transaction:{' '}
              <strong className="text-[#F5FAFA]">₹{rewardSettings.maxDiscountPerTransaction}</strong>.
            </li>
            <li>
              Unused points remain available for future eligible redemptions:{' '}
              <strong className="text-[#F5FAFA]">
                {rewardSettings.pointsExpiryDays > 0 ? `${rewardSettings.pointsExpiryDays} days validity` : 'No expiry date'}
              </strong>.
            </li>
            <li>Redemption is available only for eligible plans, products, and custom rewards enabled by your gym.</li>
            <li>Points cannot be transferred to another customer or withdrawn as cash.</li>
            <li>Failed payments or cancelled orders will never permanently deduct points; your balance is safely refunded.</li>
            {rewardSettings.rewardInstructions && (
              <li className="text-[#2DD4BF]">
                <strong>Special Gym Note:</strong> {rewardSettings.rewardInstructions}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Points Transaction History Ledger */}
      <div className="bg-[#141D1E] rounded-3xl border border-[#2A3A3A] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A3A3A] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#F5FAFA]">Points Transaction History</h3>
            <p className="text-xs text-[#9AAEAE]">
              Complete ledger of earned, redeemed, refunded, and adjusted points.
            </p>
          </div>
          <span className="text-xs font-bold text-[#9AAEAE] bg-[#0E1415] px-3 py-1 rounded-full border border-[#2A3A3A]">
            {pointsHistory.length} Recorded Transactions
          </span>
        </div>

        {pointsHistory.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Coins size={32} className="mx-auto text-[#2DD4BF]/50" />
            <p className="text-sm font-semibold text-[#9AAEAE]">No points transactions yet</p>
            <p className="text-xs text-[#9AAEAE]">Invite friends or make eligible purchases to earn points.</p>
          </div>
        ) : (
          <div>
            {/* Desktop / Tablet Table View (hidden on small mobile screens) */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-[#0E1415] text-[#9AAEAE] uppercase text-[10px] tracking-wider border-b border-[#2A3A3A]">
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
                <tbody className="divide-y divide-[#2A3A3A]">
                  {pointsHistory.map((tx: any) => {
                    const txType = tx.transactionType || tx.type || 'EARN_BONUS';
                    const txPoints = tx.points !== undefined ? tx.points : Math.abs(tx.amount || 0);
                    const isPositive = ['EARN_REFERRAL', 'EARN_BONUS', 'EARN_ACTIVITY', 'REFUND_POINTS'].includes(txType) || (txType === 'ADMIN_ADJUST' && ((tx.amount || tx.points || 0) > 0));
                    const txStatus = tx.status || 'COMPLETED';
                    const txNote = tx.reason || tx.description || tx.orderReference || 'Reward points transaction';

                    return (
                      <tr key={tx._id} className="hover:bg-[#1B2728]/50 transition">
                        <td className="py-3 px-4 text-[#9AAEAE] whitespace-nowrap">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Today'} {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#F5FAFA]">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#0E1415] border border-[#2A3A3A]">
                            {String(txType).replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className={`py-3 px-4 font-black ${isPositive ? 'text-[#34D399]' : 'text-amber-400'}`}>
                          {isPositive ? `+${txPoints}` : `-${txPoints}`}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#2DD4BF]">
                          {tx.discountAmount ? `₹${tx.discountAmount}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-[#C1D0D0] max-w-xs truncate">
                          {txNote}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#F5FAFA]">
                          {tx.balanceAfter !== undefined ? `${tx.balanceAfter} pts` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            txStatus === 'COMPLETED' ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30' :
                            txStatus === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {txStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedTxForDetails(tx)}
                            className="px-3 py-1.5 bg-[#2DD4BF]/15 hover:bg-[#2DD4BF]/25 text-[#2DD4BF] hover:text-white border border-[#2DD4BF]/30 hover:border-[#2DD4BF] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs whitespace-nowrap"
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
                  <div key={tx._id} className="p-4 bg-[#0E1415] rounded-2xl border border-[#2A3A3A] space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#9AAEAE] font-medium">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'} • {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        txStatus === 'COMPLETED' ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30' :
                        txStatus === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}>
                        {txStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#141D1E] text-[#2DD4BF] border border-[#2A3A3A] inline-block">
                          {String(txType).replace(/_/g, ' ')}
                        </span>
                        <p className="text-xs text-[#C1D0D0] font-medium line-clamp-1">
                          {txNote}
                        </p>
                      </div>
                      <div className={`text-right text-lg font-black shrink-0 ${isPositive ? 'text-[#34D399]' : 'text-amber-400'}`}>
                        {isPositive ? `+${txPoints}` : `-${txPoints}`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2A3A3A]/60">
                      <span className="text-[#9AAEAE]">Balance after: <strong className="text-[#F5FAFA]">{tx.balanceAfter !== undefined ? `${tx.balanceAfter} pts` : '—'}</strong></span>
                      {tx.discountAmount ? (
                        <span className="text-[#2DD4BF] font-semibold">Value: ₹{tx.discountAmount}</span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTxForDetails(tx)}
                      className="w-full py-2 bg-[#2DD4BF]/15 hover:bg-[#2DD4BF]/25 text-[#2DD4BF] hover:text-white border border-[#2DD4BF]/30 hover:border-[#2DD4BF] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Eye size={13} />
                      <span>View Details</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Custom Reward Claims & Vouchers */}
      {customClaims.length > 0 && (
        <div className="bg-[#141D1E] rounded-3xl border border-[#2A3A3A] p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-3">
            <h3 className="text-base font-extrabold text-[#F5FAFA]">My Claimed Reward Vouchers</h3>
            <span className="text-xs font-bold text-[#2DD4BF] bg-[#2DD4BF]/10 px-3 py-1 rounded-full">
              {customClaims.length} Vouchers
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customClaims.map((claim) => (
              <div key={claim._id} className="p-4 bg-[#0E1415] rounded-2xl border border-[#2A3A3A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#F5FAFA]">{claim.rewardTitle}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    claim.status === 'APPROVED' ? 'bg-[#34D399]/10 text-[#34D399]' :
                    claim.status === 'REDEEMED' ? 'bg-[#2DD4BF]/10 text-[#2DD4BF]' :
                    claim.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {claim.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#9AAEAE]">Voucher Code:</span>
                  <span className="font-mono font-bold text-[#2DD4BF] bg-[#141D1E] px-2 py-0.5 rounded border border-[#2A3A3A]">
                    {claim.voucherCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9AAEAE]">Points Cost:</span>
                  <span className="font-semibold text-[#F5FAFA]">{claim.pointsCost} points</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9AAEAE]">Claim Date:</span>
                  <span className="text-[#9AAEAE]">{new Date(claim.claimedAt).toLocaleDateString()}</span>
                </div>
                {claim.reviewNotes && (
                  <p className="text-[11px] text-[#2DD4BF] bg-[#1B2728] p-2 rounded-xl mt-1">
                    <strong>Gym Note:</strong> {claim.reviewNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redemption Modal: "How would you like to use your points?" */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2A3A3A] flex items-center justify-between bg-[#1B2728]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2DD4BF]/15 text-[#2DD4BF] flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#F5FAFA]">How would you like to use your points?</h3>
                  <p className="text-xs text-[#9AAEAE]">
                    Available Balance: <strong className="text-[#2DD4BF]">{wallet.currentBalance} points</strong> (₹{equivalentRupeeValue})
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
                className="w-8 h-8 rounded-full bg-[#1B2728] text-[#9AAEAE] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {!selectedRedeemChannel && (
                <div className="space-y-4">
                  <p className="text-xs text-[#9AAEAE]">
                    Select a redemption destination below. Only options enabled by <strong className="text-[#F5FAFA]">{gymName}</strong> are active:
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
                        ? 'bg-[#0E1415] border-[#2A3A3A] hover:border-[#2DD4BF] hover:bg-[#1B2728]'
                        : 'bg-[#0E1415]/40 border-red-500/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/15 text-[#2DD4BF] flex items-center justify-center">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#F5FAFA]">1. Membership Plan Discount</h4>
                          <p className="text-xs text-[#9AAEAE]">
                            Apply points to renew or upgrade your gym membership with instant rupee discounts.
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#2DD4BF]" />
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
                        ? 'bg-[#0E1415] border-[#2A3A3A] hover:border-[#2DD4BF] hover:bg-[#1B2728]'
                        : 'bg-[#0E1415]/40 border-red-500/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#F5FAFA]">2. Gym Store Purchase</h4>
                          <p className="text-xs text-[#9AAEAE]">
                            Use points at Gym Store checkout on protein, supplements, and gym accessories.
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#2DD4BF]" />
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
                        ? 'bg-[#0E1415] border-[#2A3A3A] hover:border-[#2DD4BF] hover:bg-[#1B2728]'
                        : 'bg-[#0E1415]/40 border-red-500/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                          <Award size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#F5FAFA]">3. Other Custom Rewards</h4>
                          <p className="text-xs text-[#9AAEAE]">
                            Redeem points for Personal Training sessions, workout gear, or vouchers.
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#2DD4BF]" />
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
                  <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRedeemChannel(null)}
                      className="text-xs font-bold text-[#2DD4BF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to Options
                    </button>
                    <span className="text-xs font-bold text-[#34D399] bg-[#34D399]/10 px-2.5 py-0.5 rounded-full border border-[#34D399]/20">
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
                    <label className="text-xs font-bold text-[#9AAEAE] uppercase">
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
                                ? 'bg-[#1B2728] border-[#2DD4BF]'
                                : eligible
                                ? 'bg-[#0E1415] border-[#2A3A3A] hover:border-[#2DD4BF]/50'
                                : 'bg-[#0E1415]/40 border-red-500/20 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-sm text-[#F5FAFA]">{plan.name}</div>
                              <div className="text-xs text-[#9AAEAE]">Duration: {plan.duration || 'Standard'}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold text-sm text-[#F5FAFA]">₹{plan.price}</div>
                              {eligible ? (
                                <span className="text-[10px] text-[#34D399] font-bold">Eligible</span>
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
                    <div className="p-5 bg-[#0E1415] rounded-2xl border border-[#2A3A3A] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#9AAEAE] uppercase">
                          Points to Redeem (Max: {maxRedeemablePointsForSelectedPlan})
                        </span>
                        <span className="font-extrabold text-[#2DD4BF] text-base">
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
                        className="w-full accent-[#2DD4BF] cursor-pointer"
                      />

                      {/* Calculation Breakdown Preview */}
                      <div className="pt-3 border-t border-[#2A3A3A] space-y-1.5 text-xs">
                        <div className="flex justify-between text-[#9AAEAE]">
                          <span>Original Membership Price:</span>
                          <span className="font-bold text-[#F5FAFA]">₹{selectedPlanForDiscount.price}</span>
                        </div>
                        <div className="flex justify-between text-[#9AAEAE]">
                          <span>Conversion Rate:</span>
                          <span>{rewardSettings.pointsPerConversionUnit} pts = ₹{rewardSettings.currencyValuePerUnit}</span>
                        </div>
                        <div className="flex justify-between text-[#34D399] font-bold">
                          <span>Discount Applied ({pointsToRedeemInput} pts):</span>
                          <span>- ₹{previewDiscountAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-[#F5FAFA] pt-1 border-t border-[#2A3A3A]">
                          <span>Final Payable Price:</span>
                          <span className="text-[#2DD4BF]">₹{previewFinalPrice}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleProceedMembershipCheckout}
                        disabled={pointsToRedeemInput < rewardSettings.minPointsForRedemption}
                        className="w-full py-3 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] hover:from-[#5EEAD4] hover:to-[#14B8A6] text-[#06201D] font-bold font-extrabold text-sm rounded-xl transition shadow-lg shadow-[#2DD4BF]/20 cursor-pointer disabled:opacity-50"
                      >
                        Apply ₹{previewDiscountAmount} Discount & Proceed to Checkout →
                      </button>
                      <p className="text-[11px] text-[#9AAEAE] text-center">
                        Points are deducted only after payment confirmation.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW B: GYM STORE PURCHASE INTERFACE */}
              {selectedRedeemChannel === 'STORE' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRedeemChannel(null)}
                      className="text-xs font-bold text-[#2DD4BF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to Options
                    </button>
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      Option B: Gym Store Purchase
                    </span>
                  </div>

                  <div className="p-5 bg-[#0E1415] rounded-2xl border border-[#2A3A3A] space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                        <ShoppingBag size={24} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-[#F5FAFA]">Shop the Official Gym Store</h4>
                        <p className="text-xs text-[#9AAEAE]">
                          Redeem your referral points directly at store checkout.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#C1D0D0] bg-[#1B2728] p-4 rounded-xl border border-[#2A3A3A]">
                      <div className="flex justify-between">
                        <span>Your Available Points:</span>
                        <strong className="text-[#2DD4BF]">{wallet.currentBalance} points</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Equivalent Store Discount:</span>
                        <strong className="text-[#34D399]">Up to ₹{equivalentRupeeValue}</strong>
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

                    <p className="text-xs text-[#9AAEAE] leading-relaxed">
                      Simply browse products in the Gym Store, add them to your cart, and check <strong>"Redeem Referral Points"</strong> during checkout. Your points will automatically reduce the order total!
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setShowRedeemModal(false);
                        navigate('/member/store');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-[#2DD4BF] text-white font-extrabold text-sm rounded-xl transition shadow-lg cursor-pointer"
                    >
                      Go to Gym Store & Shop Now →
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW C: OTHER CUSTOM REWARDS INTERFACE */}
              {selectedRedeemChannel === 'CUSTOM' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRedeemChannel(null)}
                      className="text-xs font-bold text-[#2DD4BF] hover:underline flex items-center gap-1 cursor-pointer"
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
                          ? 'bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399]'
                          : 'bg-red-500/15 border border-red-500/30 text-red-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {claimFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{claimFeedback.message}</span>
                      </div>
                      {claimFeedback.voucher && (
                        <p className="text-xs text-[#F5FAFA]">
                          Voucher Code:{' '}
                          <span className="font-mono font-bold text-[#2DD4BF] bg-[#0E1415] px-2 py-0.5 rounded">
                            {claimFeedback.voucher}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {availableCustomRewards.length === 0 ? (
                    <div className="py-10 text-center space-y-2 bg-[#0E1415] rounded-2xl border border-[#2A3A3A] p-6">
                      <Award size={32} className="mx-auto text-amber-400/50" />
                      <p className="text-sm font-semibold text-[#9AAEAE]">No Custom Rewards Currently Listed</p>
                      <p className="text-xs text-[#9AAEAE]">
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
                            className="p-4 bg-[#0E1415] rounded-2xl border border-[#2A3A3A] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold text-sm text-[#F5FAFA]">{reward.title}</h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#1B2728] text-[#2DD4BF] rounded-full border border-[#2A3A3A]">
                                  {reward.category}
                                </span>
                              </div>
                              <p className="text-xs text-[#9AAEAE] line-clamp-2">{reward.description}</p>
                              <div className="flex items-center gap-3 text-[11px] text-[#9AAEAE] pt-1">
                                <span>Valid for {reward.validityDays} days</span>
                                {reward.requiresApproval && (
                                  <span className="text-amber-400 font-medium">• Requires Gym Owner Approval</span>
                                )}
                              </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0 space-y-2">
                              <div className="text-base font-black text-[#2DD4BF]">
                                {reward.pointsRequired} Points
                              </div>
                              <button
                                type="button"
                                disabled={!canAfford || isClaiming}
                                onClick={() => handleClaimCustomReward(reward)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                  canAfford
                                    ? 'bg-[#2DD4BF] hover:bg-[#5EEAD4] text-white shadow'
                                    : 'bg-[#1B2728] text-[#9AAEAE] cursor-not-allowed border border-[#2A3A3A]'
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
            <div className="p-4 border-t border-[#2A3A3A] bg-[#1B2728] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowRedeemModal(false);
                  setSelectedRedeemChannel(null);
                  setClaimFeedback(null);
                }}
                className="px-5 py-2.5 bg-[#1B2728] hover:bg-[#2A3A3A] text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Transaction Details Modal ── */}
      {selectedTxForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="p-5 border-b border-[#2A3A3A] flex items-center justify-between bg-[#0E1415]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#2DD4BF]/15 rounded-xl text-[#2DD4BF]">
                  <Coins size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#F5FAFA]">Points Transaction Details</h3>
                  <p className="text-xs text-[#9AAEAE]">ID: <span className="font-mono text-[11px] text-[#2DD4BF]">{selectedTxForDetails._id || 'TXN-REF'}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxForDetails(null)}
                className="p-2 rounded-xl text-[#9AAEAE] hover:text-[#F5FAFA] hover:bg-[#1B2728] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Top Banner with Points & Type */}
              <div className="p-4 rounded-2xl bg-[#0E1415] border border-[#2A3A3A] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#9AAEAE] block mb-1 font-medium">Transaction Type</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#141D1E] text-[#2DD4BF] border border-[#2DD4BF]/30 inline-block">
                    {String(selectedTxForDetails.transactionType || selectedTxForDetails.type || 'EARN_BONUS').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#9AAEAE] block mb-1 font-medium">Points Change</span>
                  {(() => {
                    const txType = selectedTxForDetails.transactionType || selectedTxForDetails.type || 'EARN_BONUS';
                    const txPoints = selectedTxForDetails.points !== undefined ? selectedTxForDetails.points : Math.abs(selectedTxForDetails.amount || 0);
                    const isPositive = ['EARN_REFERRAL', 'EARN_BONUS', 'EARN_ACTIVITY', 'REFUND_POINTS'].includes(txType) || (txType === 'ADMIN_ADJUST' && ((selectedTxForDetails.amount || selectedTxForDetails.points || 0) > 0));
                    return (
                      <span className={`text-2xl font-black ${isPositive ? 'text-[#34D399]' : 'text-amber-400'}`}>
                        {isPositive ? `+${txPoints}` : `-${txPoints}`} pts
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Grid of Key Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0E1415] rounded-xl border border-[#2A3A3A] space-y-1">
                  <span className="text-[#9AAEAE] font-medium block">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (selectedTxForDetails.status || 'COMPLETED') === 'COMPLETED' ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30' :
                    (selectedTxForDetails.status || 'COMPLETED') === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}>
                    {selectedTxForDetails.status || 'COMPLETED'}
                  </span>
                </div>

                <div className="p-3 bg-[#0E1415] rounded-xl border border-[#2A3A3A] space-y-1">
                  <span className="text-[#9AAEAE] font-medium block">Discount Value</span>
                  <span className="text-sm font-bold text-[#2DD4BF]">
                    {selectedTxForDetails.discountAmount ? `₹${selectedTxForDetails.discountAmount}` : '—'}
                  </span>
                </div>

                <div className="p-3 bg-[#0E1415] rounded-xl border border-[#2A3A3A] space-y-1">
                  <span className="text-[#9AAEAE] font-medium block">Balance After</span>
                  <span className="text-sm font-bold text-[#F5FAFA]">
                    {selectedTxForDetails.balanceAfter !== undefined ? `${selectedTxForDetails.balanceAfter} pts` : '—'}
                  </span>
                </div>

                <div className="p-3 bg-[#0E1415] rounded-xl border border-[#2A3A3A] space-y-1">
                  <span className="text-[#9AAEAE] font-medium block">Date & Time</span>
                  <span className="text-xs font-semibold text-[#F5FAFA] block">
                    {selectedTxForDetails.createdAt ? new Date(selectedTxForDetails.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Today'}
                  </span>
                </div>
              </div>

              {/* Reason / Notes */}
              <div className="p-4 bg-[#0E1415] rounded-xl border border-[#2A3A3A] space-y-1.5">
                <span className="text-xs font-semibold text-[#9AAEAE] block">Reason / Description</span>
                <p className="text-xs text-[#F5FAFA] leading-relaxed font-medium">
                  {selectedTxForDetails.reason || selectedTxForDetails.description || selectedTxForDetails.orderReference || 'Reward points transaction credited to your member account.'}
                </p>
              </div>

              {/* Order Reference or Additional Meta */}
              {selectedTxForDetails.orderReference && (
                <div className="p-3 bg-[#0E1415] rounded-xl border border-[#2A3A3A] flex items-center justify-between text-xs">
                  <span className="text-[#9AAEAE]">Order / Claim Reference:</span>
                  <span className="font-mono font-bold text-[#2DD4BF]">{selectedTxForDetails.orderReference}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2A3A3A] bg-[#0E1415] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTxForDetails(null)}
                className="px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
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

export default MemberRewards;
