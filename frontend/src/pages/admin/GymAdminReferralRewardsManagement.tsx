import React, { useState, useEffect } from 'react';
import {
  Coins, Settings, Users, Gift, Plus, Search, CheckCircle2,
  AlertCircle, ArrowUpRight, ArrowDownRight, Edit2, Check, X,
  Clock, ShieldCheck, Tag, ShoppingBag, CreditCard, Sparkles,
  Info, RefreshCw, FileText
} from 'lucide-react';
import api from '../../utils/api';

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

interface CustomerPointItem {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  referralCode?: string;
  membershipPlan: string;
  membershipStatus: string;
  membershipExpiry?: string;
  pointsBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  equivalentRupeeValue: number;
  totalReferrals: number;
  successfulReferrals: number;
  membershipRedemptions: number;
  storeRedemptions: number;
  customRedemptions: number;
  joinedAt: string;
}

interface CustomReward {
  _id: string;
  title: string;
  description: string;
  requiredPoints: number;
  requireApproval: boolean;
  totalQuantity: number;
  claimedCount: number;
  status: 'Active' | 'Paused' | 'Draft';
  termsAndConditions?: string;
  icon?: string;
  createdAt: string;
}

interface CustomClaim {
  _id: string;
  claimCode: string;
  pointsDeducted: number;
  claimStatus: 'Pending' | 'Approved' | 'Rejected' | 'Redeemed';
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  rewardId?: {
    _id: string;
    title: string;
    category?: string;
    requiredPoints?: number;
    requireApproval?: boolean;
  };
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
  };
  reviewedBy?: {
    firstName: string;
    lastName: string;
  };
}

const GymAdminReferralRewardsManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'customers' | 'custom_rewards'>('config');

  // 1. Settings State
  const [settings, setSettings] = useState<RewardSettings>({
    pointsPerConversionUnit: 100,
    currencyValuePerUnit: 50,
    minPointsForRedemption: 100,
    maxDiscountPerTransaction: 0,
    enableMembershipDiscount: true,
    enableStorePurchase: true,
    enableCustomRewards: true,
    eligibleMembershipPlans: [],
    eligibleStoreProducts: [],
    storeRedemptionScope: 'ALL',
    pointsExpiryDays: 0,
    rewardInstructions: '',
    termsAndConditions: ''
  });
  const [settingsLoading, setSettingsLoading] = useState<boolean>(true);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Available Gym Membership plans & store products for eligible selector
  const [availablePlans, setAvailablePlans] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);

  // 2. Customer Points Management State
  const [customers, setCustomers] = useState<CustomerPointItem[]>([]);
  const [customersLoading, setCustomersLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Manual Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerPointItem | null>(null);
  const [adjustMode, setAdjustMode] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [adjustAmount, setAdjustAmount] = useState<number | string>(100);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustLoading, setAdjustLoading] = useState<boolean>(false);
  const [adjustFeedback, setAdjustFeedback] = useState<string | null>(null);

  // View Customer History Modal
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [customerHistory, setCustomerHistory] = useState<any>(null);

  // 3. Custom Rewards & Claims State
  const [customRewards, setCustomRewards] = useState<CustomReward[]>([]);
  const [customClaims, setCustomClaims] = useState<CustomClaim[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState<boolean>(false);
  const [showCreateRewardModal, setShowCreateRewardModal] = useState<boolean>(false);
  const [rewardForm, setRewardForm] = useState({
    title: '',
    description: '',
    requiredPoints: 200,
    requireApproval: false,
    totalQuantity: 0,
    termsAndConditions: 'Redeemable with your available points at our gym desk.'
  });
  const [creatingReward, setCreatingReward] = useState<boolean>(false);
  const [reviewingClaimId, setReviewingClaimId] = useState<string | null>(null);

  // Fetch initial configuration
  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const [stRes, plansRes, prodsRes] = await Promise.all([
        api.get('/referrals/settings'),
        api.get('/memberships/plans').catch(() => ({ data: { plans: [] } })),
        api.get('/store/admin/products').catch(() => ({ data: { products: [] } }))
      ]);

      if (stRes.data?.success && stRes.data.settings) {
        setSettings(stRes.data.settings);
      }

      if (plansRes.data?.plans) {
        const pNames = plansRes.data.plans.map((p: any) => p.name || p.planName).filter(Boolean);
        setAvailablePlans(Array.from(new Set(pNames)));
      }
      if (prodsRes.data?.products) {
        const prodNames = prodsRes.data.products.map((p: any) => p.name).filter(Boolean);
        setAvailableProducts(Array.from(new Set(prodNames)));
      }
    } catch (err: any) {
      console.error('Failed to load reward settings', err);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Fetch customers points list
  const loadCustomers = async () => {
    try {
      setCustomersLoading(true);
      const res = await api.get('/referrals/owner/customers-points', {
        params: { search: searchQuery || undefined }
      });
      if (res.data?.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (err: any) {
      console.error('Failed to load customers points', err);
    } finally {
      setCustomersLoading(false);
    }
  };

  // Fetch custom rewards & claims
  const loadCustomRewardsAndClaims = async () => {
    try {
      setRewardsLoading(true);
      const [rwRes, clRes] = await Promise.all([
        api.get('/referrals/custom-rewards'),
        api.get('/referrals/custom-claims')
      ]);
      if (rwRes.data?.success) setCustomRewards(rwRes.data.rewards || []);
      if (clRes.data?.success) setCustomClaims(clRes.data.claims || []);
    } catch (err: any) {
      console.error('Failed to load custom rewards', err);
    } finally {
      setRewardsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'customers') {
      loadCustomers();
    } else if (activeSubTab === 'custom_rewards') {
      loadCustomRewardsAndClaims();
    }
  }, [activeSubTab]);

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setSettingsMessage(null);
      const res = await api.put('/referrals/settings', settings);
      if (res.data?.success) {
        setSettings(res.data.settings);
        setSettingsMessage({ type: 'success', text: 'Reward configuration saved successfully!' });
        setTimeout(() => setSettingsMessage(null), 4000);
      }
    } catch (err: any) {
      setSettingsMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update reward settings.'
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle Points Adjustment Submit
  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const numAmt = Number(adjustAmount);
    if (!numAmt || numAmt <= 0) {
      setAdjustFeedback('Please enter a valid points amount greater than zero.');
      return;
    }
    if (!adjustReason.trim()) {
      setAdjustFeedback('A reason is mandatory for manual point adjustments.');
      return;
    }

    try {
      setAdjustLoading(true);
      setAdjustFeedback(null);
      const signedAmount = adjustMode === 'ADD' ? numAmt : -numAmt;

      const res = await api.post('/referrals/owner/adjust-points', {
        customerId: selectedCustomer._id,
        amount: signedAmount,
        reason: adjustReason.trim()
      });

      if (res.data?.success) {
        // Update local state
        setCustomers(prev => prev.map(c => {
          if (c._id === selectedCustomer._id) {
            return {
              ...c,
              pointsBalance: res.data.newBalance,
              totalEarned: signedAmount > 0 ? c.totalEarned + signedAmount : c.totalEarned,
              totalRedeemed: signedAmount < 0 ? c.totalRedeemed + Math.abs(signedAmount) : c.totalRedeemed,
              equivalentRupeeValue: Math.round(res.data.newBalance * (settings.currencyValuePerUnit / settings.pointsPerConversionUnit))
            };
          }
          return c;
        }));
        setShowAdjustModal(false);
        setSelectedCustomer(null);
        setAdjustReason('');
        setAdjustAmount(100);
      }
    } catch (err: any) {
      setAdjustFeedback(err.response?.data?.message || 'Failed to adjust points.');
    } finally {
      setAdjustLoading(false);
    }
  };

  // Handle Open History
  const handleOpenHistory = async (cust: CustomerPointItem) => {
    setSelectedCustomer(cust);
    setShowHistoryModal(true);
    try {
      setHistoryLoading(true);
      const res = await api.get(`/referrals/owner/customer-history/${cust._id}`);
      if (res.data?.success) {
        setCustomerHistory(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle Create Custom Reward
  const handleCreateCustomReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardForm.title.trim() || Number(rewardForm.requiredPoints) <= 0) {
      alert('Please enter a valid title and required points (> 0).');
      return;
    }

    try {
      setCreatingReward(true);
      const res = await api.post('/referrals/custom-rewards', rewardForm);
      if (res.data?.success) {
        setCustomRewards(prev => [res.data.reward, ...prev]);
        setShowCreateRewardModal(false);
        setRewardForm({
          title: '',
          description: '',
          requiredPoints: 200,
          requireApproval: false,
          totalQuantity: 0,
          termsAndConditions: 'Redeemable with your available points at our gym desk.'
        });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create reward');
    } finally {
      setCreatingReward(false);
    }
  };

  // Handle Review Claim
  const handleReviewClaim = async (claimId: string, action: 'Approve' | 'Reject' | 'Redeem') => {
    let rejectionReason = '';
    if (action === 'Reject') {
      const reason = window.prompt('Please enter the reason for rejecting this claim (points will be automatically refunded to member):');
      if (reason === null) return;
      if (!reason.trim()) {
        alert('A rejection reason is required.');
        return;
      }
      rejectionReason = reason.trim();
    }

    try {
      setReviewingClaimId(claimId);
      const res = await api.patch(`/referrals/custom-claims/${claimId}/review`, {
        action,
        rejectionReason
      });
      if (res.data?.success) {
        setCustomClaims(prev => prev.map(c => c._id === claimId ? res.data.claim : c));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to review claim');
    } finally {
      setReviewingClaimId(null);
    }
  };

  // Total gym point stats
  const totalGymPoints = customers.reduce((sum, c) => sum + (c.pointsBalance || 0), 0);
  const totalGymEarned = customers.reduce((sum, c) => sum + (c.totalEarned || 0), 0);
  const totalGymRedeemed = customers.reduce((sum, c) => sum + (c.totalRedeemed || 0), 0);
  const totalValueInRupees = Math.round(totalGymPoints * (settings.currencyValuePerUnit / settings.pointsPerConversionUnit));

  return (
    <div className="space-y-8">
      {/* Section Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'config'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15'
              : 'text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED]'
          }`}
        >
          <Settings size={16} />
          Reward Configuration & Rules
        </button>

        <button
          onClick={() => setActiveSubTab('customers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'customers'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15'
              : 'text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED]'
          }`}
        >
          <Users size={16} />
          Customer Points Management ({customers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('custom_rewards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'custom_rewards'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15'
              : 'text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED]'
          }`}
        >
          <Gift size={16} />
          Custom Rewards & Claims ({customRewards.length})
        </button>
      </div>

      {/* =========================================================================
          SUB-TAB 1: REWARD CONFIGURATION & CONVERSION SETTINGS
          ========================================================================= */}
      {activeSubTab === 'config' && (
        <div className="space-y-6">
          {settingsMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center gap-3 border text-sm font-medium ${
                settingsMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-800/60 text-emerald-300'
                  : 'bg-red-50 border-rose-800/60 text-rose-300'
              }`}
            >
              {settingsMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{settingsMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Card 1: Points Conversion Rate */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#111827] flex items-center gap-2">
                    <Coins className="text-[#EA580C]" size={20} />
                    Points-to-Rupee Conversion Rate
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Configure how many points equal ₹1. Default standard is 100 points = ₹50 (₹0.50 per point).
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] rounded-xl text-xs font-bold">
                  Effective Rate: ₹{(settings.currencyValuePerUnit / settings.pointsPerConversionUnit).toFixed(2)} / pt
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                    Points Unit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.pointsPerConversionUnit}
                    onChange={(e) => setSettings({ ...settings, pointsPerConversionUnit: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-[#FDBA74]"
                  />
                  <span className="text-[10px] text-[#64748B] mt-1 block">Number of points (e.g. 100)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                    Equivalent Value (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.currencyValuePerUnit}
                    onChange={(e) => setSettings({ ...settings, currencyValuePerUnit: Math.max(1, Number(e.target.value)) })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-[#FDBA74]"
                  />
                  <span className="text-[10px] text-[#64748B] mt-1 block">Rupee worth (e.g. ₹50)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                    Min Points for Redemption
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.minPointsForRedemption}
                    onChange={(e) => setSettings({ ...settings, minPointsForRedemption: Math.max(0, Number(e.target.value)) })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-[#FDBA74]"
                  />
                  <span className="text-[10px] text-[#64748B] mt-1 block">E.g. 100 points minimum</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                    Max Discount / Order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={settings.maxDiscountPerTransaction}
                    onChange={(e) => setSettings({ ...settings, maxDiscountPerTransaction: Math.max(0, Number(e.target.value)) })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-[#FDBA74]"
                  />
                  <span className="text-[10px] text-[#64748B] mt-1 block">0 for no maximum limit</span>
                </div>
              </div>
            </div>

            {/* Card 2: Enabled Redemption Channels */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-6">
              <div className="border-b border-[#E2E8F0] pb-4">
                <h2 className="text-lg font-extrabold text-[#111827] flex items-center gap-2">
                  <Tag className="text-[#EA580C]" size={20} />
                  Available Redemption Channels
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Choose which redemption options are available to your gym members. Disabled options will not appear in the customer dropdown.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. Membership Plan Discount */}
                <div className={`p-5 rounded-2xl border transition-all ${settings.enableMembershipDiscount ? 'bg-[#F8FAFC] border-[#FFEDD5]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-bold text-white text-sm">
                      <CreditCard className="text-[#EA580C]" size={18} />
                      Membership Plan Discount
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableMembershipDiscount}
                        onChange={(e) => setSettings({ ...settings, enableMembershipDiscount: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C2410C]"></div>
                    </label>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                    Members can redeem points to discount membership purchases and renewals at checkout.
                  </p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${settings.enableMembershipDiscount ? 'bg-emerald-50 text-[#15803D] border border-emerald-800' : 'bg-zinc-800 text-zinc-400'}`}>
                    {settings.enableMembershipDiscount ? 'Option Enabled' : 'Option Disabled'}
                  </span>
                </div>

                {/* 2. Gym Store Purchase */}
                <div className={`p-5 rounded-2xl border transition-all ${settings.enableStorePurchase ? 'bg-[#F8FAFC] border-[#FFEDD5]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-bold text-white text-sm">
                      <ShoppingBag className="text-[#EA580C]" size={18} />
                      Gym Store Purchase
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableStorePurchase}
                        onChange={(e) => setSettings({ ...settings, enableStorePurchase: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C2410C]"></div>
                    </label>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                    Members can apply points for instant discounts on Gym Store items during online checkout.
                  </p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${settings.enableStorePurchase ? 'bg-emerald-50 text-[#15803D] border border-emerald-800' : 'bg-zinc-800 text-zinc-400'}`}>
                    {settings.enableStorePurchase ? 'Option Enabled' : 'Option Disabled'}
                  </span>
                </div>

                {/* 3. Other Custom Rewards */}
                <div className={`p-5 rounded-2xl border transition-all ${settings.enableCustomRewards ? 'bg-[#F8FAFC] border-[#FFEDD5]' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-bold text-white text-sm">
                      <Gift className="text-[#EA580C]" size={18} />
                      Other Custom Rewards
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableCustomRewards}
                        onChange={(e) => setSettings({ ...settings, enableCustomRewards: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C2410C]"></div>
                    </label>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                    Special rewards like Personal Training Sessions, Gym Vouchers, and Fitness Accessories.
                  </p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${settings.enableCustomRewards ? 'bg-emerald-50 text-[#15803D] border border-emerald-800' : 'bg-zinc-800 text-zinc-400'}`}>
                    {settings.enableCustomRewards ? 'Option Enabled' : 'Option Disabled'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Instructions, Terms & Validity */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-5">
              <div className="border-b border-[#E2E8F0] pb-4">
                <h2 className="text-lg font-extrabold text-[#111827] flex items-center gap-2">
                  <FileText className="text-[#EA580C]" size={20} />
                  Customer Instructions & Terms
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  These instructions appear dynamically on the Customer Dashboard under "How to Use Your Referral Points".
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                  Reward Instructions Message
                </label>
                <textarea
                  rows={3}
                  value={settings.rewardInstructions}
                  onChange={(e) => setSettings({ ...settings, rewardInstructions: e.target.value })}
                  placeholder="Explain how members can earn and redeem their referral points..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 text-xs text-white outline-none focus:border-[#FDBA74]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                  Terms & Conditions
                </label>
                <textarea
                  rows={2}
                  value={settings.termsAndConditions || ''}
                  onChange={(e) => setSettings({ ...settings, termsAndConditions: e.target.value })}
                  placeholder="Point expiration, transferability, cancellation policies..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 text-xs text-white outline-none focus:border-[#FDBA74]"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-8 py-3.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:opacity-90 disabled:opacity-50 text-[#FFFFFF] font-bold font-extrabold rounded-2xl shadow-lg shadow-orange-500/15 transition-all flex items-center gap-2 cursor-pointer"
              >
                {savingSettings ? <RefreshCw className="animate-spin" size={18} /> : <Check size={18} />}
                Save Reward Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2: CUSTOMER POINTS MANAGEMENT
          ========================================================================= */}
      {activeSubTab === 'customers' && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] space-y-1">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">Total Members</span>
              <span className="text-2xl font-black text-[#111827]">{customers.length}</span>
              <span className="text-[11px] text-[#EA580C] block">In your gym rewards system</span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] space-y-1">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">Total Points Balance</span>
              <span className="text-2xl font-black text-[#111827]">{totalGymPoints.toLocaleString('en-IN')} <span className="text-xs font-semibold text-[#EA580C]">pts</span></span>
              <span className="text-[11px] text-[#15803D] block font-semibold">≈ ₹{totalValueInRupees.toLocaleString('en-IN')} value</span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] space-y-1">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">Total Points Earned</span>
              <span className="text-2xl font-black text-[#111827]">{totalGymEarned.toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-[#64748B] block">Lifetime points generated</span>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] space-y-1">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">Total Points Redeemed</span>
              <span className="text-2xl font-black text-[#111827]">{totalGymRedeemed.toLocaleString('en-IN')}</span>
              <span className="text-[11px] text-[#64748B] block">Membership & Store discounts</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadCustomers()}
                placeholder="Search member name, email or phone..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#111827] placeholder:text-[#64748B] outline-none focus:border-[#FDBA74]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={loadCustomers}
                className="px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#111827] text-xs font-bold rounded-xl border border-[#E2E8F0] flex items-center gap-2 cursor-pointer transition"
              >
                <RefreshCw size={14} className={customersLoading ? 'animate-spin' : ''} />
                Refresh List
              </button>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/80 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Membership</th>
                    <th className="p-4">Points Balance</th>
                    <th className="p-4">Lifetime Earned</th>
                    <th className="p-4">Total Redeemed</th>
                    <th className="p-4">Referrals</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {customersLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#64748B]">
                        <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                        Loading customer points balances...
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#64748B]">
                        No gym members found matching your search.
                      </td>
                    </tr>
                  ) : (
                    customers.map((cust) => (
                      <tr key={cust._id} className="hover:bg-[#FFF7ED]/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#111827] text-sm">{cust.name}</div>
                          <div className="text-[#64748B] text-[11px]">{cust.email}</div>
                          {cust.mobile && <div className="text-[#EA580C] text-[10px]">{cust.mobile}</div>}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-[#111827]">{cust.membershipPlan}</div>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                            cust.membershipStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                          }`}>
                            {cust.membershipStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-base font-black text-[#111827]">
                            {cust.pointsBalance.toLocaleString('en-IN')} <span className="text-xs font-semibold text-[#EA580C]">pts</span>
                          </div>
                          <div className="text-[11px] text-[#15803D] font-semibold">
                            ≈ ₹{cust.equivalentRupeeValue.toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-[#111827]">
                          {cust.totalEarned.toLocaleString('en-IN')} pts
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-rose-700">
                            {cust.totalRedeemed.toLocaleString('en-IN')} pts
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            {cust.membershipRedemptions} mem • {cust.storeRedemptions} store
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#111827]">
                            {cust.successfulReferrals} / {cust.totalReferrals}
                          </div>
                          <div className="text-[10px] text-[#EA580C]">successful / invited</div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedCustomer(cust);
                                setShowAdjustModal(true);
                                setAdjustMode('ADD');
                                setAdjustAmount(100);
                                setAdjustReason('');
                                setAdjustFeedback(null);
                              }}
                              className="px-3 py-1.5 bg-[#FFF7ED] hover:bg-[#C2410C] text-[#EA580C] hover:text-[#FFFFFF] font-bold border border-[#FFEDD5] rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <Coins size={13} />
                              Adjust Points
                            </button>

                            <button
                              onClick={() => handleOpenHistory(cust)}
                              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#111827] border border-[#E2E8F0] rounded-xl font-bold transition-all text-xs cursor-pointer"
                            >
                              View History
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3: CUSTOM REWARDS & CLAIMS REVIEW
          ========================================================================= */}
      {activeSubTab === 'custom_rewards' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2E8F0]">
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">Custom Gym Rewards & Perks</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Create special rewards that members can claim using their referral points (e.g. PT Sessions, Vouchers).
              </p>
            </div>
            <button
              onClick={() => setShowCreateRewardModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-[#FFFFFF] font-bold text-xs font-bold rounded-xl shadow-lg shadow-orange-500/15 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              Create Custom Reward
            </button>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRewards.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[#64748B] bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
                No custom rewards created yet. Click "Create Custom Reward" to get started!
              </div>
            ) : (
              customRewards.map((rw) => (
                <div key={rw._id} className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] space-y-4 hover:border-[#FFEDD5] transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-[#111827] text-base">{rw.title}</h3>
                      <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{rw.description || 'Custom member benefit'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
                      <Gift size={20} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-b border-[#E2E8F0]/60 py-2.5 text-xs">
                    <span className="text-[#64748B]">Points Required:</span>
                    <span className="font-black text-[#111827] text-sm">{rw.requiredPoints} pts</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Requires Confirmation:</span>
                    <span className={`font-bold ${rw.requireApproval ? 'text-[#B45309]' : 'text-[#15803D]'}`}>
                      {rw.requireApproval ? 'Yes (Approval Required)' : 'Instant Voucher'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>Total Claimed:</span>
                    <span className="font-bold text-[#111827]">{rw.claimedCount} claims</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pending & Historical Claims Table */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xl space-y-4 p-6">
            <h3 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <Clock className="text-[#EA580C]" size={18} />
              Member Reward Claims & Approvals
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]/80 text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                    <th className="p-3.5">Voucher Code</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Reward Title</th>
                    <th className="p-3.5">Points</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {customClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#64748B]">
                        No reward claims submitted yet.
                      </td>
                    </tr>
                  ) : (
                    customClaims.map((claim) => (
                      <tr key={claim._id} className="hover:bg-[#FFF7ED]/40 transition">
                        <td className="p-3.5 font-mono font-bold text-[#EA580C]">
                          {claim.claimCode}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-[#111827]">{claim.userId ? `${claim.userId.firstName} ${claim.userId.lastName}` : 'Gym Member'}</div>
                          <div className="text-[10px] text-[#64748B]">{claim.userId?.email}</div>
                        </td>
                        <td className="p-3.5 font-medium text-[#111827]">
                          {claim.rewardId?.title || 'Custom Reward'}
                        </td>
                        <td className="p-3.5 font-bold text-[#111827]">
                          {claim.pointsDeducted} pts
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            claim.claimStatus === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : claim.claimStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : claim.claimStatus === 'Redeemed'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {claim.claimStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {claim.claimStatus === 'Pending' && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                disabled={reviewingClaimId === claim._id}
                                onClick={() => handleReviewClaim(claim._id, 'Approve')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                disabled={reviewingClaimId === claim._id}
                                onClick={() => handleReviewClaim(claim._id, 'Reject')}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {claim.claimStatus === 'Approved' && (
                            <button
                              disabled={reviewingClaimId === claim._id}
                              onClick={() => handleReviewClaim(claim._id, 'Redeem')}
                              className="px-2.5 py-1 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-lg text-[11px] font-bold transition cursor-pointer"
                            >
                              Mark Fulfilled
                            </button>
                          )}
                          {(claim.claimStatus === 'Redeemed' || claim.claimStatus === 'Rejected') && (
                            <span className="text-[11px] text-[#64748B] italic">Finished</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADJUST CUSTOMER POINTS
          ========================================================================= */}
      {showAdjustModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#111827]">Manual Points Adjustment</h3>
                <p className="text-xs text-[#64748B] mt-0.5">{selectedCustomer.name} ({selectedCustomer.email})</p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-[#64748B] hover:text-[#C2410C]">
                <X size={20} />
              </button>
            </div>

            {adjustFeedback && (
              <div className="p-3 bg-red-50 border border-rose-800 text-rose-300 rounded-xl text-xs">
                {adjustFeedback}
              </div>
            )}

            <form onSubmit={handleAdjustPointsSubmit} className="space-y-4">
              <div className="flex items-center gap-2 p-1.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setAdjustMode('ADD')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    adjustMode === 'ADD' ? 'bg-[#C2410C] text-white' : 'text-[#64748B]'
                  }`}
                >
                  + Add Points
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustMode('DEDUCT')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    adjustMode === 'DEDUCT' ? 'bg-rose-600 text-white' : 'text-[#64748B]'
                  }`}
                >
                  - Deduct Points
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Points Amount (Supports &gt; 5,000 pts)
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-[#FDBA74]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Reason for Adjustment <span className="text-[#B91C1C]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Required: e.g. Customer loyalty bonus, goodwill adjustment, dispute resolution..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-white outline-none focus:border-[#FDBA74]"
                />
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs space-y-1">
                <div className="flex justify-between text-[#64748B]">
                  <span>Current Balance:</span>
                  <span className="font-bold text-white">{selectedCustomer.pointsBalance} pts</span>
                </div>
                <div className="flex justify-between font-bold text-[#15803D]">
                  <span>Projected Balance:</span>
                  <span>
                    {adjustMode === 'ADD'
                      ? selectedCustomer.pointsBalance + (Number(adjustAmount) || 0)
                      : Math.max(0, selectedCustomer.pointsBalance - (Number(adjustAmount) || 0))} pts
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-3 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#111827] font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading}
                  className={`flex-1 py-3 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                    adjustMode === 'ADD' ? 'bg-[#C2410C] hover:bg-[#9A3412]' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {adjustLoading ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                  Confirm {adjustMode === 'ADD' ? 'Addition' : 'Deduction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VIEW CUSTOMER FULL POINTS & REDEMPTION HISTORY
          ========================================================================= */}
      {showHistoryModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 w-full max-w-3xl shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#111827]">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#64748B]">{selectedCustomer.email} • Points & Redemption History</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-[#64748B] hover:text-[#C2410C]">
                <X size={20} />
              </button>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-[#64748B]">
                <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                Loading detailed customer records...
              </div>
            ) : !customerHistory ? (
              <div className="py-8 text-center text-[#64748B]">No records found.</div>
            ) : (
              <div className="space-y-6">
                {/* Balance Summary Header */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Available Balance</span>
                    <span className="text-lg font-black text-white">{customerHistory.summary.availablePoints} pts</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Equivalent Value</span>
                    <span className="text-lg font-black text-[#15803D]">₹{customerHistory.summary.equivalentRupeeValue}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Lifetime Earned</span>
                    <span className="text-lg font-black text-white">{customerHistory.summary.totalEarned}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] uppercase font-bold block">Lifetime Redeemed</span>
                    <span className="text-lg font-black text-rose-300">{customerHistory.summary.totalRedeemed}</span>
                  </div>
                </div>

                {/* 1. Points Ledger Transactions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <Coins size={16} className="text-[#EA580C]" />
                    Points Transactions & Adjustments ({customerHistory.transactions?.length || 0})
                  </h4>
                  <div className="divide-y divide-[#E2E8F0] bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] overflow-hidden max-h-48 overflow-y-auto">
                    {customerHistory.transactions?.length === 0 ? (
                      <div className="p-4 text-center text-[#64748B] text-xs">No points transactions recorded yet.</div>
                    ) : (
                      customerHistory.transactions.map((tx: any) => (
                        <div key={tx._id} className="p-3 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-semibold text-white">{tx.description}</div>
                            <div className="text-[10px] text-[#64748B]">
                              {new Date(tx.createdAt).toLocaleString()} • Type: {tx.type}
                            </div>
                            {tx.reason && <div className="text-[10px] text-[#EA580C]">Reason: {tx.reason}</div>}
                          </div>
                          <div className="text-right">
                            <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
                              {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                            </span>
                            <span className="text-[10px] text-[#64748B] block">Bal: {tx.balanceAfter} pts</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Store Orders with Points Redeemed */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <ShoppingBag size={16} className="text-[#EA580C]" />
                    Gym Store Redemptions ({customerHistory.storeRedemptions?.length || 0})
                  </h4>
                  <div className="divide-y divide-[#E2E8F0] bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] overflow-hidden max-h-40 overflow-y-auto">
                    {customerHistory.storeRedemptions?.length === 0 ? (
                      <div className="p-4 text-center text-[#64748B] text-xs">No store points redemptions recorded.</div>
                    ) : (
                      customerHistory.storeRedemptions.map((ord: any) => (
                        <div key={ord._id} className="p-3 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-semibold text-white">Order #{ord.orderNumber}</div>
                            <div className="text-[10px] text-[#64748B]">{new Date(ord.createdAt).toLocaleDateString()} • Status: {ord.status}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#15803D]">
                              - ₹{ord.pointsDiscount || 0} Discount
                            </span>
                            <span className="text-[10px] text-[#EA580C] block">({ord.pointsRedeemed} pts used)</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE CUSTOM REWARD
          ========================================================================= */}
      {showCreateRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-[#111827]">New Custom Reward</h3>
                <p className="text-xs text-[#64748B]">Define a special reward redeemable with points.</p>
              </div>
              <button onClick={() => setShowCreateRewardModal(false)} className="text-[#64748B] hover:text-[#C2410C]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomReward} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Reward Title</label>
                <input
                  type="text"
                  required
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  placeholder="e.g. 1-on-1 Personal Training Session"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#FDBA74]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={2}
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  placeholder="Details about the session, voucher or accessories..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-xs text-white outline-none focus:border-[#FDBA74]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Points Required</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={rewardForm.requiredPoints}
                    onChange={(e) => setRewardForm({ ...rewardForm, requiredPoints: Number(e.target.value) })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#FDBA74]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">Total Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={rewardForm.totalQuantity}
                    onChange={(e) => setRewardForm({ ...rewardForm, totalQuantity: Number(e.target.value) })}
                    placeholder="0 = unlimited"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#FDBA74]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div>
                  <span className="text-xs font-bold text-white block">Require Owner Approval</span>
                  <span className="text-[10px] text-[#64748B] block">Hold claim as Pending until confirmed</span>
                </div>
                <input
                  type="checkbox"
                  checked={rewardForm.requireApproval}
                  onChange={(e) => setRewardForm({ ...rewardForm, requireApproval: e.target.checked })}
                  className="w-4 h-4 rounded text-[#EA580C] bg-[#FFFFFF] border-[#E2E8F0] cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRewardModal(false)}
                  className="flex-1 py-2.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#111827] font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingReward}
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-[#FFFFFF] font-bold font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {creatingReward ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
                  Create Reward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminReferralRewardsManagement;
