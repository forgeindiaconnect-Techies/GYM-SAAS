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
    <div className="min-h-screen bg-[#FFFFFF] text-[#1F2937] p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#F8FAFC] border border-[#E2E8F0] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(183,110,121,0.15)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF7ED] border border-[#FFEDD5] rounded-full text-xs font-bold uppercase tracking-wider text-[#EA580C]">
              <Coins size={14} className="text-[#EA580C]" />
              Loyalty & Referral Rewards
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#FFFFFF]">
              My Rewards & Points Balance
            </h1>
            <p className="text-[#64748B] text-sm leading-relaxed">
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
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#9A3412] hover:to-[#9A3412] text-[#FFFFFF] font-bold font-black text-sm rounded-2xl transition-all shadow-xl shadow-orange-500/15 cursor-pointer"
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
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2E8F0] shadow-lg space-y-2 relative overflow-hidden group hover:border-[#FFEDD5] transition">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Available Points</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
              <Coins size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#111827]">
            {wallet.currentBalance.toLocaleString()}
          </div>
          <div className="text-xs text-[#EA580C] font-semibold flex items-center gap-1.5 pt-1">
            <span>Supports 5,000+ balances</span>
          </div>
        </div>

        {/* 2. Equivalent Discount Value */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2E8F0] shadow-lg space-y-2 relative overflow-hidden group hover:border-[#15803D]/50 transition">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Equivalent Value</span>
            <div className="w-10 h-10 rounded-2xl bg-[#15803D]/10 text-[#15803D] flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#15803D]">
            ₹{equivalentRupeeValue.toLocaleString()}
          </div>
          <div className="text-xs text-[#64748B] pt-1">
            Rate: {rewardSettings.pointsPerConversionUnit} pts = ₹{rewardSettings.currencyValuePerUnit}
          </div>
        </div>

        {/* 3. Total Points Earned */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2E8F0] shadow-lg space-y-2 relative overflow-hidden group hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Earned</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-purple-300">
            {wallet.totalEarned.toLocaleString()}
          </div>
          <div className="text-xs text-[#64748B] pt-1">
            From successful referrals & bonuses
          </div>
        </div>

        {/* 4. Total Points Redeemed */}
        <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2E8F0] shadow-lg space-y-2 relative overflow-hidden group hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-bold uppercase tracking-wider">Total Redeemed</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#B45309] flex items-center justify-center">
              <ArrowDownRight size={20} />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-300">
            {wallet.totalRedeemed.toLocaleString()}
          </div>
          <div className="text-xs text-[#64748B] pt-1">
            Redeemed on plans & gym store
          </div>
        </div>
      </div>

      {/* Available Redemption Channels */}
      <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2E8F0] shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#111827]">Available Redemption Channels</h3>
            <p className="text-xs text-[#64748B]">Choose how to use your referral points today.</p>
          </div>
          <span className="text-xs text-[#EA580C] font-bold bg-[#FFF7ED] px-3 py-1 rounded-full border border-[#FFEDD5]">
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
                ? 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#FDBA74] hover:bg-[#FFFFFF]'
                : 'bg-[#FFF7ED] border-red-500/20 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
                <CreditCard size={20} />
              </div>
              {rewardSettings.enableMembershipDiscount ? (
                <span className="text-[10px] font-bold text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-full border border-[#15803D]/20">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#B91C1C] bg-red-500/10 px-2 py-0.5 rounded-full">
                  Disabled by Gym
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-[#111827]">1. Membership Plan Discount</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Apply your points directly during membership renewal or upgrade checkout for instant rupee discounts.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#EA580C]">
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
                ? 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#FDBA74] hover:bg-[#FFFFFF]'
                : 'bg-[#FFF7ED] border-red-500/20 opacity-60 cursor-not-allowed'
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
                <span className="text-[10px] font-bold text-[#B91C1C] bg-red-500/10 px-2 py-0.5 rounded-full">
                  Disabled by Gym
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-[#111827]">2. Gym Store Purchases</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Redeem points against protein supplements, gym apparel, and accessories in the official Gym Store.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#EA580C]">
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
                ? 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#FDBA74] hover:bg-[#FFFFFF]'
                : 'bg-[#FFF7ED] border-red-500/20 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#B45309] flex items-center justify-center">
                <Award size={20} />
              </div>
              {rewardSettings.enableCustomRewards ? (
                <span className="text-[10px] font-bold text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-full border border-[#15803D]/20">
                  {availableCustomRewards.length} Available
                </span>
              ) : (
                <span className="text-[10px] font-bold text-[#B91C1C] bg-red-500/10 px-2 py-0.5 rounded-full">
                  Disabled by Gym
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-[#111827]">3. Other Custom Rewards</h4>
            <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
              Claim Personal Training Sessions, workout vouchers, and exclusive gym perks crafted by your gym owner.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[#EA580C]">
              <span>Browse vouchers</span>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Instructions — Must Be Clearly Visible */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
            <HelpCircle size={22} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#111827]">How to Use Your Referral Points</h2>
            <p className="text-xs text-[#64748B]">
              Simple step-by-step instructions and important policy terms for your gym points.
            </p>
          </div>
        </div>

        {/* 7 Steps List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/60">
              <div className="w-7 h-7 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center text-xs font-bold shrink-0">
                1
              </div>
              <p className="text-xs text-[#111827] leading-relaxed pt-0.5">
                <strong>Earn points</strong> when your referred friend completes an eligible membership payment.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/60">
              <div className="w-7 h-7 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center text-xs font-bold shrink-0">
                2
              </div>
              <p className="text-xs text-[#111827] leading-relaxed pt-0.5">
                Open <strong>My Rewards & Points</strong> to check your available points balance and equivalent rupee value.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/60">
              <div className="w-7 h-7 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <p className="text-xs text-[#111827] leading-relaxed pt-0.5">
                Click <strong>Redeem Points</strong> and select <em>Membership Plan Discount</em>, <em>Gym Store Purchase</em>, or another available reward.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/60">
              <div className="w-7 h-7 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center text-xs font-bold shrink-0">
                4
              </div>
              <p className="text-xs text-[#111827] leading-relaxed pt-0.5">
                Review the required points, discount value, and eligibility rules before confirming your redemption.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/60">
              <div className="w-7 h-7 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center text-xs font-bold shrink-0">
                5
              </div>
              <p className="text-xs text-[#111827] leading-relaxed pt-0.5">
                Apply your points during eligible checkout or submit your custom reward voucher request.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/60">
              <div className="w-7 h-7 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center text-xs font-bold shrink-0">
                6
              </div>
              <p className="text-xs text-[#111827] leading-relaxed pt-0.5">
                For purchases, points are deducted only after successful payment. For custom rewards, follow the displayed confirmation and approval status.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]/60">
              <div className="w-7 h-7 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center text-xs font-bold shrink-0">
                7
              </div>
              <p className="text-xs text-[#111827] leading-relaxed pt-0.5">
                Check your <strong>Points History</strong> and <strong>Redemption History</strong> below to track every transaction.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notes Box (Dynamic from Gym Owner's Settings) */}
        <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-3">
          <div className="flex items-center gap-2 text-[#B45309] font-bold text-xs uppercase tracking-wider">
            <AlertCircle size={16} />
            <span>Important Notes (Configured by {gymName})</span>
          </div>
          <ul className="text-xs text-[#64748B] space-y-2 list-disc list-inside leading-relaxed">
            <li>
              The conversion rate is dynamically set by your gym owner:{' '}
              <strong className="text-[#111827]">
                {rewardSettings.pointsPerConversionUnit} points = ₹{rewardSettings.currencyValuePerUnit}
              </strong>{' '}
              (₹{pointRate.toFixed(2)} per point).
            </li>
            <li>
              Minimum points required for redemption:{' '}
              <strong className="text-[#111827]">{rewardSettings.minPointsForRedemption} points</strong>.
            </li>
            <li>
              Maximum discount allowed per transaction:{' '}
              <strong className="text-[#111827]">₹{rewardSettings.maxDiscountPerTransaction}</strong>.
            </li>
            <li>
              Unused points remain available for future eligible redemptions:{' '}
              <strong className="text-[#111827]">
                {rewardSettings.pointsExpiryDays > 0 ? `${rewardSettings.pointsExpiryDays} days validity` : 'No expiry date'}
              </strong>.
            </li>
            <li>Redemption is available only for eligible plans, products, and custom rewards enabled by your gym.</li>
            <li>Points cannot be transferred to another customer or withdrawn as cash.</li>
            <li>Failed payments or cancelled orders will never permanently deduct points; your balance is safely refunded.</li>
            {rewardSettings.rewardInstructions && (
              <li className="text-[#EA580C]">
                <strong>Special Gym Note:</strong> {rewardSettings.rewardInstructions}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Points Transaction History Ledger */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#111827]">Points Transaction History</h3>
            <p className="text-xs text-[#64748B]">
              Complete ledger of earned, redeemed, refunded, and adjusted points.
            </p>
          </div>
          <span className="text-xs font-bold text-[#64748B] bg-[#F8FAFC] px-3 py-1 rounded-full border border-[#E2E8F0]">
            {pointsHistory.length} Recorded Transactions
          </span>
        </div>

        {pointsHistory.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Coins size={32} className="mx-auto text-[#EA580C]/50" />
            <p className="text-sm font-semibold text-[#64748B]">No points transactions yet</p>
            <p className="text-xs text-[#64748B]">Invite friends or make eligible purchases to earn points.</p>
          </div>
        ) : (
          <div>
            {/* Desktop / Tablet Table View (hidden on small mobile screens) */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[750px]">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] tracking-wider border-b border-[#E2E8F0]">
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
                <tbody className="divide-y divide-[#E2E8F0]">
                  {pointsHistory.map((tx: any) => {
                    const txType = tx.transactionType || tx.type || 'EARN_BONUS';
                    const txPoints = tx.points !== undefined ? tx.points : Math.abs(tx.amount || 0);
                    const isPositive = ['EARN_REFERRAL', 'EARN_BONUS', 'EARN_ACTIVITY', 'REFUND_POINTS'].includes(txType) || (txType === 'ADMIN_ADJUST' && ((tx.amount || tx.points || 0) > 0));
                    const txStatus = tx.status || 'COMPLETED';
                    const txNote = tx.reason || tx.description || tx.orderReference || 'Reward points transaction';

                    return (
                      <tr key={tx._id} className="hover:bg-[#FFF7ED]/50 transition">
                        <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Today'} {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#111827]">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#F8FAFC] border border-[#E2E8F0]">
                            {String(txType).replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className={`py-3 px-4 font-black ${isPositive ? 'text-[#15803D]' : 'text-[#B45309]'}`}>
                          {isPositive ? `+${txPoints}` : `-${txPoints}`}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#EA580C]">
                          {tx.discountAmount ? `₹${tx.discountAmount}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-[#111827] max-w-xs truncate">
                          {txNote}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#111827]">
                          {tx.balanceAfter !== undefined ? `${tx.balanceAfter} pts` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            txStatus === 'COMPLETED' ? 'bg-[#15803D]/15 text-[#15803D] border border-[#15803D]/30' :
                            txStatus === 'PENDING' ? 'bg-amber-500/15 text-[#B45309] border border-amber-500/30' : 'bg-red-500/15 text-[#B91C1C] border border-red-500/30'
                          }`}>
                            {txStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedTxForDetails(tx)}
                            className="px-3 py-1.5 bg-[#FFF7ED] hover:bg-[#FFF7ED] text-[#EA580C] hover:text-[#C2410C] border border-[#FFEDD5] hover:border-[#FDBA74] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 mx-auto cursor-pointer shadow-xs whitespace-nowrap"
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
                  <div key={tx._id} className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B] font-medium">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'} • {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        txStatus === 'COMPLETED' ? 'bg-[#15803D]/15 text-[#15803D] border border-[#15803D]/30' :
                        txStatus === 'PENDING' ? 'bg-amber-500/15 text-[#B45309] border border-amber-500/30' : 'bg-red-500/15 text-[#B91C1C] border border-red-500/30'
                      }`}>
                        {txStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFFFF] text-[#EA580C] border border-[#E2E8F0] inline-block">
                          {String(txType).replace(/_/g, ' ')}
                        </span>
                        <p className="text-xs text-[#111827] font-medium line-clamp-1">
                          {txNote}
                        </p>
                      </div>
                      <div className={`text-right text-lg font-black shrink-0 ${isPositive ? 'text-[#15803D]' : 'text-[#B45309]'}`}>
                        {isPositive ? `+${txPoints}` : `-${txPoints}`}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E2E8F0]/60">
                      <span className="text-[#64748B]">Balance after: <strong className="text-[#111827]">{tx.balanceAfter !== undefined ? `${tx.balanceAfter} pts` : '—'}</strong></span>
                      {tx.discountAmount ? (
                        <span className="text-[#EA580C] font-semibold">Value: ₹{tx.discountAmount}</span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTxForDetails(tx)}
                      className="w-full py-2 bg-[#FFF7ED] hover:bg-[#FFF7ED] text-[#EA580C] hover:text-[#C2410C] border border-[#FFEDD5] hover:border-[#FDBA74] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
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
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <h3 className="text-base font-extrabold text-[#111827]">My Claimed Reward Vouchers</h3>
            <span className="text-xs font-bold text-[#EA580C] bg-[#FFF7ED] px-3 py-1 rounded-full">
              {customClaims.length} Vouchers
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customClaims.map((claim: any) => {
              const title = claim.rewardId?.title || claim.rewardTitle || 'Reward Voucher';
              const code = claim.claimCode || claim.voucherCode || '---';
              const points = claim.pointsDeducted ?? claim.pointsCost ?? 0;
              const rawStatus = (claim.claimStatus || claim.status || 'Pending').toUpperCase();
              const dateStr = claim.createdAt || claim.claimedAt;
              const formattedDate = dateStr && !isNaN(new Date(dateStr).getTime())
                ? new Date(dateStr).toLocaleDateString()
                : 'Recently';
              const note = claim.notes || claim.reviewNotes;

              return (
                <div key={claim._id} className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#111827]">{title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rawStatus === 'APPROVED' ? 'bg-[#15803D]/10 text-[#15803D]' :
                      rawStatus === 'REDEEMED' ? 'bg-[#FFF7ED] text-[#EA580C]' :
                      rawStatus === 'PENDING' ? 'bg-amber-500/10 text-[#B45309]' : 'bg-red-500/10 text-[#B91C1C]'
                    }`}>
                      {claim.claimStatus || claim.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#64748B]">Voucher Code:</span>
                    <span className="font-mono font-bold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded border border-[#FFEDD5]">
                      {code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Points Cost:</span>
                    <span className="font-semibold text-[#111827]">{points} points</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Claim Date:</span>
                    <span className="text-[#64748B]">{formattedDate}</span>
                  </div>
                  {note && (
                    <p className="text-[11px] text-[#EA580C] bg-[#F8FAFC] p-2 rounded-xl mt-1">
                      <strong>Gym Note:</strong> {note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Redemption Modal: "How would you like to use your points?" */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#111827]">How would you like to use your points?</h3>
                  <p className="text-xs text-[#64748B]">
                    Available Balance: <strong className="text-[#EA580C]">{wallet.currentBalance} points</strong> (₹{equivalentRupeeValue})
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
                className="w-8 h-8 rounded-full bg-[#F8FAFC] text-[#64748B] hover:text-[#C2410C] flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {!selectedRedeemChannel && (
                <div className="space-y-4">
                  <p className="text-xs text-[#64748B]">
                    Select a redemption destination below. Only options enabled by <strong className="text-[#111827]">{gymName}</strong> are active:
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
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#FDBA74] hover:bg-[#FFF7ED]'
                        : 'bg-[#FFF7ED] border-red-500/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#111827]">1. Membership Plan Discount</h4>
                          <p className="text-xs text-[#64748B]">
                            Apply points to renew or upgrade your gym membership with instant rupee discounts.
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#EA580C]" />
                    </div>
                    {!rewardSettings.enableMembershipDiscount && (
                      <p className="text-[11px] text-[#B91C1C] mt-2 font-medium">
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
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#FDBA74] hover:bg-[#FFF7ED]'
                        : 'bg-[#FFF7ED] border-red-500/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#111827]">2. Gym Store Purchase</h4>
                          <p className="text-xs text-[#64748B]">
                            Use points at Gym Store checkout on protein, supplements, and gym accessories.
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#EA580C]" />
                    </div>
                    {!rewardSettings.enableStorePurchase && (
                      <p className="text-[11px] text-[#B91C1C] mt-2 font-medium">
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
                        ? 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#FDBA74] hover:bg-[#FFF7ED]'
                        : 'bg-[#FFF7ED] border-red-500/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#B45309] flex items-center justify-center">
                          <Award size={20} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#111827]">3. Other Custom Rewards</h4>
                          <p className="text-xs text-[#64748B]">
                            Redeem points for Personal Training sessions, workout gear, or vouchers.
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#EA580C]" />
                    </div>
                    {!rewardSettings.enableCustomRewards && (
                      <p className="text-[11px] text-[#B91C1C] mt-2 font-medium">
                        Currently disabled by your gym owner in reward settings.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW A: MEMBERSHIP PLAN DISCOUNT INTERFACE */}
              {selectedRedeemChannel === 'MEMBERSHIP' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRedeemChannel(null)}
                      className="text-xs font-bold text-[#EA580C] hover:underline flex items-center gap-1 cursor-pointer"
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
                    <label className="text-xs font-bold text-[#64748B] uppercase">
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
                                ? 'bg-[#F8FAFC] border-[#FDBA74]'
                                : eligible
                                ? 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#FFEDD5]'
                                : 'bg-[#FFF7ED] border-red-500/20 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-sm text-[#111827]">{plan.name}</div>
                              <div className="text-xs text-[#64748B]">Duration: {plan.duration || 'Standard'}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-extrabold text-sm text-[#111827]">₹{plan.price}</div>
                              {eligible ? (
                                <span className="text-[10px] text-[#15803D] font-bold">Eligible</span>
                              ) : (
                                <span className="text-[10px] text-[#B91C1C] font-bold">Ineligible</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Points Slider / Input */}
                  {selectedPlanForDiscount && (
                    <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#64748B] uppercase">
                          Points to Redeem (Max: {maxRedeemablePointsForSelectedPlan})
                        </span>
                        <span className="font-extrabold text-[#EA580C] text-base">
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
                        className="w-full accent-[#F97316] cursor-pointer"
                      />

                      {/* Calculation Breakdown Preview */}
                      <div className="pt-3 border-t border-[#E2E8F0] space-y-1.5 text-xs">
                        <div className="flex justify-between text-[#64748B]">
                          <span>Original Membership Price:</span>
                          <span className="font-bold text-[#111827]">₹{selectedPlanForDiscount.price}</span>
                        </div>
                        <div className="flex justify-between text-[#64748B]">
                          <span>Conversion Rate:</span>
                          <span>{rewardSettings.pointsPerConversionUnit} pts = ₹{rewardSettings.currencyValuePerUnit}</span>
                        </div>
                        <div className="flex justify-between text-[#15803D] font-bold">
                          <span>Discount Applied ({pointsToRedeemInput} pts):</span>
                          <span>- ₹{previewDiscountAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-[#111827] pt-1 border-t border-[#E2E8F0]">
                          <span>Final Payable Price:</span>
                          <span className="text-[#EA580C]">₹{previewFinalPrice}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleProceedMembershipCheckout}
                        disabled={pointsToRedeemInput < rewardSettings.minPointsForRedemption}
                        className="w-full py-3 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-[#9A3412] hover:to-[#9A3412] text-[#FFFFFF] font-bold font-extrabold text-sm rounded-xl transition shadow-lg shadow-orange-500/15 cursor-pointer disabled:opacity-50"
                      >
                        Apply ₹{previewDiscountAmount} Discount & Proceed to Checkout →
                      </button>
                      <p className="text-[11px] text-[#64748B] text-center">
                        Points are deducted only after payment confirmation.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW B: GYM STORE PURCHASE INTERFACE */}
              {selectedRedeemChannel === 'STORE' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRedeemChannel(null)}
                      className="text-xs font-bold text-[#EA580C] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to Options
                    </button>
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      Option B: Gym Store Purchase
                    </span>
                  </div>

                  <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                        <ShoppingBag size={24} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base text-[#111827]">Shop the Official Gym Store</h4>
                        <p className="text-xs text-[#64748B]">
                          Redeem your referral points directly at store checkout.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-[#111827] bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                      <div className="flex justify-between">
                        <span>Your Available Points:</span>
                        <strong className="text-[#EA580C]">{wallet.currentBalance} points</strong>
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

                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Simply browse products in the Gym Store, add them to your cart, and check <strong>"Redeem Referral Points"</strong> during checkout. Your points will automatically reduce the order total!
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setShowRedeemModal(false);
                        navigate('/member/store');
                      }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-[#EA580C] text-white font-extrabold text-sm rounded-xl transition shadow-lg cursor-pointer"
                    >
                      Go to Gym Store & Shop Now →
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW C: OTHER CUSTOM REWARDS INTERFACE */}
              {selectedRedeemChannel === 'CUSTOM' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRedeemChannel(null)}
                      className="text-xs font-bold text-[#EA580C] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ← Back to Options
                    </button>
                    <span className="text-xs font-bold text-[#B45309] bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      Option C: Custom Rewards & Vouchers
                    </span>
                  </div>

                  {claimFeedback && (
                    <div
                      className={`p-4 rounded-2xl text-xs font-medium space-y-1 ${
                        claimFeedback.type === 'success'
                          ? 'bg-[#15803D]/15 border border-[#15803D]/30 text-[#15803D]'
                          : 'bg-red-500/15 border border-red-500/30 text-[#B91C1C]'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {claimFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        <span>{claimFeedback.message}</span>
                      </div>
                      {claimFeedback.voucher && (
                        <p className="text-xs text-[#111827]">
                          Voucher Code:{' '}
                          <span className="font-mono font-bold text-[#EA580C] bg-[#F8FAFC] px-2 py-0.5 rounded">
                            {claimFeedback.voucher}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {availableCustomRewards.length === 0 ? (
                    <div className="py-10 text-center space-y-2 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6">
                      <Award size={32} className="mx-auto text-[#B45309]/50" />
                      <p className="text-sm font-semibold text-[#64748B]">No Custom Rewards Currently Listed</p>
                      <p className="text-xs text-[#64748B]">
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
                            className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold text-sm text-[#111827]">{reward.title}</h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#F8FAFC] text-[#EA580C] rounded-full border border-[#E2E8F0]">
                                  {reward.category}
                                </span>
                              </div>
                              <p className="text-xs text-[#64748B] line-clamp-2">{reward.description}</p>
                              <div className="flex items-center gap-3 text-[11px] text-[#64748B] pt-1">
                                <span>Valid for {reward.validityDays} days</span>
                                {reward.requiresApproval && (
                                  <span className="text-[#B45309] font-medium">• Requires Gym Owner Approval</span>
                                )}
                              </div>
                            </div>

                            <div className="text-left sm:text-right shrink-0 space-y-2">
                              <div className="text-base font-black text-[#EA580C]">
                                {reward.pointsRequired} Points
                              </div>
                              <button
                                type="button"
                                disabled={!canAfford || isClaiming}
                                onClick={() => handleClaimCustomReward(reward)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                  canAfford
                                    ? 'bg-[#C2410C] hover:bg-[#9A3412] text-white shadow'
                                    : 'bg-[#F8FAFC] text-[#64748B] cursor-not-allowed border border-[#E2E8F0]'
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
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowRedeemModal(false);
                  setSelectedRedeemChannel(null);
                  setClaimFeedback(null);
                }}
                className="px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#111827] text-xs font-bold rounded-xl transition cursor-pointer"
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
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#FFF7ED] rounded-xl text-[#EA580C]">
                  <Coins size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#111827]">Points Transaction Details</h3>
                  <p className="text-xs text-[#64748B]">ID: <span className="font-mono text-[11px] text-[#EA580C]">{selectedTxForDetails._id || 'TXN-REF'}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTxForDetails(null)}
                className="p-2 rounded-xl text-[#64748B] hover:text-[#111827] hover:bg-[#FFF7ED] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Top Banner with Points & Type */}
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#64748B] block mb-1 font-medium">Transaction Type</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFFFFF] text-[#EA580C] border border-[#FFEDD5] inline-block">
                    {String(selectedTxForDetails.transactionType || selectedTxForDetails.type || 'EARN_BONUS').replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#64748B] block mb-1 font-medium">Points Change</span>
                  {(() => {
                    const txType = selectedTxForDetails.transactionType || selectedTxForDetails.type || 'EARN_BONUS';
                    const txPoints = selectedTxForDetails.points !== undefined ? selectedTxForDetails.points : Math.abs(selectedTxForDetails.amount || 0);
                    const isPositive = ['EARN_REFERRAL', 'EARN_BONUS', 'EARN_ACTIVITY', 'REFUND_POINTS'].includes(txType) || (txType === 'ADMIN_ADJUST' && ((selectedTxForDetails.amount || selectedTxForDetails.points || 0) > 0));
                    return (
                      <span className={`text-2xl font-black ${isPositive ? 'text-[#15803D]' : 'text-[#B45309]'}`}>
                        {isPositive ? `+${txPoints}` : `-${txPoints}`} pts
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Grid of Key Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                  <span className="text-[#64748B] font-medium block">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    (selectedTxForDetails.status || 'COMPLETED') === 'COMPLETED' ? 'bg-[#15803D]/15 text-[#15803D] border border-[#15803D]/30' :
                    (selectedTxForDetails.status || 'COMPLETED') === 'PENDING' ? 'bg-amber-500/15 text-[#B45309] border border-amber-500/30' : 'bg-red-500/15 text-[#B91C1C] border border-red-500/30'
                  }`}>
                    {selectedTxForDetails.status || 'COMPLETED'}
                  </span>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                  <span className="text-[#64748B] font-medium block">Discount Value</span>
                  <span className="text-sm font-bold text-[#EA580C]">
                    {selectedTxForDetails.discountAmount ? `₹${selectedTxForDetails.discountAmount}` : '—'}
                  </span>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                  <span className="text-[#64748B] font-medium block">Balance After</span>
                  <span className="text-sm font-bold text-[#111827]">
                    {selectedTxForDetails.balanceAfter !== undefined ? `${selectedTxForDetails.balanceAfter} pts` : '—'}
                  </span>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1">
                  <span className="text-[#64748B] font-medium block">Date & Time</span>
                  <span className="text-xs font-semibold text-[#111827] block">
                    {selectedTxForDetails.createdAt ? new Date(selectedTxForDetails.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Today'}
                  </span>
                </div>
              </div>

              {/* Reason / Notes */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <span className="text-xs font-semibold text-[#64748B] block">Reason / Description</span>
                <p className="text-xs text-[#111827] leading-relaxed font-medium">
                  {selectedTxForDetails.reason || selectedTxForDetails.description || selectedTxForDetails.orderReference || 'Reward points transaction credited to your member account.'}
                </p>
              </div>

              {/* Order Reference or Additional Meta */}
              {selectedTxForDetails.orderReference && (
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Order / Claim Reference:</span>
                  <span className="font-mono font-bold text-[#EA580C]">{selectedTxForDetails.orderReference}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTxForDetails(null)}
                className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
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
