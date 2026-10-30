import React, { useState, useEffect, useMemo } from 'react';
import {
  Share2, Users, Gift, CheckCircle2, Clock, AlertCircle, Plus,
  Search, Filter, ChevronLeft, ChevronRight, Eye, ShieldCheck,
  TrendingUp, IndianRupee, Tag, Award, Sparkles, RefreshCw,
  Calendar, Check, X, ArrowUpRight, Percent, FileText, PauseCircle, PlayCircle, Coins
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import GymAdminReferralRewardsManagement from './GymAdminReferralRewardsManagement';

interface Campaign {
  _id: string;
  gymId: string;
  campaignName: string;
  campaignDescription?: string;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  referrerRewardType: 'Wallet Points' | 'Membership Credit' | 'Free Membership Days' | 'Cash Payout';
  referrerRewardValue: number;
  refereeRewardType: 'Membership Discount' | 'Wallet Points' | 'Free Membership Days';
  refereeRewardValue: number;
  refereeDiscountType: 'Fixed' | 'Percentage';
  minMembershipPurchase: number;
  eligiblePlans: string[];
  maxReferralsPerUser: number;
  campaignReferralLimit: number;
  rewardBudget: number;
  budgetSpent: number;
  termsAndConditions?: string;
  createdAt: string;
}

interface ReferralRecord {
  _id: string;
  gymId: string;
  campaignId: any;
  referrerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    referralCode?: string;
  };
  referredId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  };
  referralCode: string;
  membershipPlanName?: string;
  planAmount?: number;
  discountApplied?: number;
  finalPaymentAmount?: number;
  paymentReference?: string;
  status: 'Invited' | 'Registered' | 'Membership Pending' | 'Payment Verified' | 'Reward Pending' | 'Reward Issued' | 'Expired' | 'Cancelled' | 'Rejected';
  referrerRewardStatus: string;
  referrerRewardType: string;
  referrerRewardAmount: number;
  referrerRewardIssuedAt?: string;
  refereeRewardStatus: string;
  refereeRewardType: string;
  refereeRewardAmount: number;
  refereeRewardIssuedAt?: string;
  ineligibilityReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReferralStats {
  totalReferrals: number;
  invitedCount: number;
  registeredCount: number;
  paymentCompletedCount: number;
  successfulCount: number;
  pendingRewardsCount: number;
  rewardsIssuedCount: number;
  conversionRate: string;
  revenueGenerated: number;
  rewardExpenditure: number;
}

const GymAdminReferrals: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    invitedCount: 0,
    registeredCount: 0,
    paymentCompletedCount: 0,
    successfulCount: 0,
    pendingRewardsCount: 0,
    rewardsIssuedCount: 0,
    conversionRate: '0.0',
    revenueGenerated: 0,
    rewardExpenditure: 0,
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Tab State
  const [activeMainTab, setActiveMainTab] = useState<'rewards' | 'campaigns'>('rewards');

  // Modal States
  const [showCampaignModal, setShowCampaignModal] = useState<boolean>(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<ReferralRecord | null>(null);

  // Campaign Form State
  const initialCampaignForm = {
    campaignName: '',
    campaignDescription: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active' as 'Draft' | 'Active' | 'Paused' | 'Completed',
    referrerRewardType: 'Membership Credit' as 'Wallet Points' | 'Membership Credit' | 'Free Membership Days' | 'Cash Payout',
    referrerRewardValue: 300,
    refereeRewardType: 'Membership Discount' as 'Membership Discount' | 'Wallet Points' | 'Free Membership Days',
    refereeRewardValue: 200,
    refereeDiscountType: 'Fixed' as 'Fixed' | 'Percentage',
    minMembershipPurchase: 500,
    eligiblePlans: '',
    maxReferralsPerUser: 5,
    campaignReferralLimit: 100,
    rewardBudget: 15000,
    termsAndConditions: 'Valid only for newly registered members who complete full payment of an eligible membership plan.'
  };

  const [campaignForm, setCampaignForm] = useState(initialCampaignForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, campRes, refRes] = await Promise.all([
        api.get('/referrals/owner/stats'),
        api.get('/referrals/campaigns'),
        api.get('/referrals/owner/records', {
          params: {
            page,
            limit: 10,
            search: searchQuery || undefined,
            status: statusFilter !== 'All' ? statusFilter : undefined
          }
        })
      ]);

      if (statsRes.data?.success) {
        const s = statsRes.data.stats || {};
        setStats({
          totalReferrals: s.totalReferrals ?? 0,
          invitedCount: s.invitedCount ?? s.totalInvited ?? 0,
          registeredCount: s.registeredCount ?? s.registeredCustomers ?? 0,
          paymentCompletedCount: s.paymentCompletedCount ?? s.membershipPaymentsCompleted ?? 0,
          successfulCount: s.successfulCount ?? s.successfulReferrals ?? 0,
          pendingRewardsCount: s.pendingRewardsCount ?? s.pendingRewards ?? 0,
          rewardsIssuedCount: s.rewardsIssuedCount ?? s.totalRewardsIssued ?? 0,
          conversionRate: String(s.conversionRate ?? s.referralConversionRate ?? '0.0'),
          revenueGenerated: s.revenueGenerated ?? 0,
          rewardExpenditure: s.rewardExpenditure ?? s.referralRewardExpenditure ?? 0,
        });
      }
      if (campRes.data?.success) {
        setCampaigns(campRes.data.campaigns || []);
      }
      if (refRes.data?.success) {
        setReferrals(refRes.data.referrals || []);
        setTotalPages(refRes.data.pagination?.totalPages || 1);
        setTotalCount(refRes.data.pagination?.total || (refRes.data.referrals?.length ?? 0));
      }
    } catch (err) {
      console.error('Failed to load referral data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  // Open Edit Campaign
  const handleOpenEdit = (camp: Campaign) => {
    setEditingCampaign(camp);
    setCampaignForm({
      campaignName: camp.campaignName,
      campaignDescription: camp.campaignDescription || '',
      startDate: new Date(camp.startDate).toISOString().split('T')[0],
      endDate: new Date(camp.endDate).toISOString().split('T')[0],
      status: camp.status as any,
      referrerRewardType: camp.referrerRewardType as any,
      referrerRewardValue: camp.referrerRewardValue,
      refereeRewardType: camp.refereeRewardType as any,
      refereeRewardValue: camp.refereeRewardValue,
      refereeDiscountType: camp.refereeDiscountType || 'Fixed',
      minMembershipPurchase: camp.minMembershipPurchase || 0,
      eligiblePlans: (camp.eligiblePlans || []).join(', '),
      maxReferralsPerUser: camp.maxReferralsPerUser || 0,
      campaignReferralLimit: camp.campaignReferralLimit || 0,
      rewardBudget: camp.rewardBudget || 0,
      termsAndConditions: camp.termsAndConditions || ''
    });
    setFormErrors({});
    setShowCampaignModal(true);
  };

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setCampaignForm(initialCampaignForm);
    setFormErrors({});
    setShowCampaignModal(true);
  };

  // Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!campaignForm.campaignName.trim()) {
      errs.campaignName = 'Campaign name is required';
    }
    if (!campaignForm.startDate) {
      errs.startDate = 'Start date is required';
    }
    if (!campaignForm.endDate) {
      errs.endDate = 'End date is required';
    }
    if (new Date(campaignForm.endDate) < new Date(campaignForm.startDate)) {
      errs.endDate = 'End date cannot be earlier than start date';
    }
    if (Number(campaignForm.referrerRewardValue) <= 0) {
      errs.referrerRewardValue = 'Reward value must be greater than 0';
    }
    if (Number(campaignForm.refereeRewardValue) <= 0) {
      errs.refereeRewardValue = 'Reward value must be greater than 0';
    }
    if (campaignForm.refereeDiscountType === 'Percentage' && Number(campaignForm.refereeRewardValue) > 100) {
      errs.refereeRewardValue = 'Percentage discount cannot exceed 100%';
    }
    if (Number(campaignForm.minMembershipPurchase) < 0) {
      errs.minMembershipPurchase = 'Amount cannot be negative';
    }
    if (Number(campaignForm.rewardBudget) < 0) {
      errs.rewardBudget = 'Budget cannot be negative';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setActionLoading(true);
      const payload = {
        ...campaignForm,
        referrerRewardValue: Number(campaignForm.referrerRewardValue),
        refereeRewardValue: Number(campaignForm.refereeRewardValue),
        minMembershipPurchase: Number(campaignForm.minMembershipPurchase),
        maxReferralsPerUser: Number(campaignForm.maxReferralsPerUser),
        campaignReferralLimit: Number(campaignForm.campaignReferralLimit),
        rewardBudget: Number(campaignForm.rewardBudget),
        eligiblePlans: campaignForm.eligiblePlans
          ? campaignForm.eligiblePlans.split(',').map(s => s.trim()).filter(Boolean)
          : []
      };

      if (editingCampaign) {
        await api.put(`/referrals/campaigns/${editingCampaign._id}`, payload);
      } else {
        await api.post('/referrals/campaigns', payload);
      }

      setShowCampaignModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (campaignId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
      await api.patch(`/referrals/campaigns/${campaignId}/status`, { status: newStatus });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update campaign status');
    }
  };

  const handleManualIssueReward = async (referralId: string) => {
    if (!window.confirm('Are you sure you want to manually verify and issue rewards for this referral?')) return;
    try {
      setActionLoading(true);
      await api.post(`/referrals/${referralId}/issue-reward`);
      alert('Reward issued successfully!');
      fetchData();
      if (selectedReferral?._id === referralId) {
        setSelectedReferral(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue reward');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Reward Issued':
      case 'Payment Verified':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]"><CheckCircle2 size={12} /> {status}</span>;
      case 'Reward Pending':
      case 'Membership Pending':
      case 'Registered':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]"><Clock size={12} /> {status}</span>;
      case 'Invited':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200"><Tag size={12} /> {status}</span>;
      case 'Expired':
      case 'Cancelled':
      case 'Rejected':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle size={12} /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F8FAFC] text-[#111827]">{status}</span>;
    }
  };

  const activeCampaign = useMemo(() => {
    return campaigns.find(c => c.status === 'Active') || campaigns[0];
  }, [campaigns]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveMainTab('rewards')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              activeMainTab === 'rewards'
                ? 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-lg shadow-orange-500/15'
                : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#111827] border border-[#E2E8F0]'
            }`}
          >
            <Coins size={18} />
            Referral Rewards Management
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('campaigns')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
              activeMainTab === 'campaigns'
                ? 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-lg shadow-orange-500/15'
                : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#111827] border border-[#E2E8F0]'
            }`}
          >
            <Share2 size={18} />
            Campaigns & Referral Tracking
          </button>
        </div>

        {activeMainTab === 'campaigns' && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold font-bold text-sm rounded-2xl transition-all shadow-md shadow-orange-500/15 cursor-pointer"
          >
            <Plus size={18} />
            Create Campaign
          </button>
        )}
      </div>

      {activeMainTab === 'rewards' ? (
        <GymAdminReferralRewardsManagement />
      ) : (
        <div className="space-y-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-3xl border border-[#E2E8F0] shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
                  <Share2 size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-[#111827] tracking-tight">Customer Referral Campaigns</h1>
                  <p className="text-sm text-[#64748B]">Empower gym members to invite friends with automated dual rewards.</p>
                </div>
              </div>
            </div>
          </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Referrals */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Referrals</span>
            <Users size={18} className="text-[#EA580C]" />
          </div>
          <div className="text-2xl font-black text-[#111827]">{stats.totalReferrals}</div>
          <div className="text-[11px] text-[#64748B]">Invited & Joined Members</div>
        </div>

        {/* Registered */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Registered</span>
            <CheckCircle2 size={18} className="text-[#EA580C]" />
          </div>
          <div className="text-2xl font-black text-[#111827]">{stats.registeredCount}</div>
          <div className="text-[11px] text-[#EA580C] font-medium">Signed up with referral code</div>
        </div>

        {/* Payments Completed */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Paid Members</span>
            <ShieldCheck size={18} className="text-[#EA580C]" />
          </div>
          <div className="text-2xl font-black text-[#111827]">{stats.paymentCompletedCount}</div>
          <div className="text-[11px] text-[#EA580C] font-medium">Verified membership payments</div>
        </div>

        {/* Successful & Rewards Issued */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Rewards Issued</span>
            <Gift size={18} className="text-purple-600" />
          </div>
          <div className="text-2xl font-black text-[#111827]">{stats.rewardsIssuedCount}</div>
          <div className="text-[11px] text-purple-600 font-medium">{stats.pendingRewardsCount} pending issuance</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-[#64748B]">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversion</span>
            <TrendingUp size={18} className="text-[#EA580C]" />
          </div>
          <div className="text-2xl font-black text-[#111827]">{stats.conversionRate}%</div>
          <div className="text-[11px] text-[#64748B]">Visitor to paid member</div>
        </div>
      </div>

      {/* Financial Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-[#E2E8F0]/80 p-5 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C2410C] text-white font-bold flex items-center justify-center font-bold">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">Revenue Generated by Referrals</p>
              <h2 className="text-3xl font-black text-[#EA580C] mt-0.5">₹{(stats?.revenueGenerated || 0).toLocaleString('en-IN')}</h2>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-[#F8FAFC]/70 text-[#EA580C] rounded-full border border-[#E2E8F0]">
            Direct Plan Sales
          </span>
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-[#E2E8F0] p-5 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C2410C] text-white font-bold flex items-center justify-center font-bold">
              <Award size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#EA580C]">Referral Reward Expenditure</p>
              <h2 className="text-3xl font-black text-[#111827] mt-0.5">₹{(stats?.rewardExpenditure || 0).toLocaleString('en-IN')}</h2>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-[#F8FAFC] text-[#EA580C] rounded-full border border-[#FFEDD5]">
            Customer Incentives
          </span>
        </div>
      </div>

      {/* Campaign Configuration Card */}
      {activeCampaign && (
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#111827]">{activeCampaign.campaignName}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    activeCampaign.status === 'Active'
                      ? 'bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {activeCampaign.status}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">{activeCampaign.campaignDescription}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleStatus(activeCampaign._id, activeCampaign.status)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  activeCampaign.status === 'Active'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : 'bg-[#F8FAFC] text-[#EA580C] border-[#E2E8F0] hover:bg-[#FFF7ED]'
                }`}
              >
                {activeCampaign.status === 'Active' ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
                {activeCampaign.status === 'Active' ? 'Pause Campaign' : 'Activate Campaign'}
              </button>
              <button
                onClick={() => handleOpenEdit(activeCampaign)}
                className="px-4 py-2 bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FDBA74] text-[#111827] text-xs font-bold rounded-xl transition-all"
              >
                Edit Rules
              </button>
            </div>
          </div>

          {/* Campaign Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* Existing Member (Referrer) Reward */}
            <div className="p-4 bg-[#FFF7ED] rounded-2xl border border-[#E2E8F0] space-y-2">
              <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
                <Gift size={14} /> Referrer (Existing Member) Reward
              </span>
              <div className="text-xl font-extrabold text-[#111827]">
                {activeCampaign.referrerRewardType === 'Membership Credit' || activeCampaign.referrerRewardType === 'Cash Payout' ? '₹' : ''}
                {activeCampaign.referrerRewardValue ?? 0}
                {activeCampaign.referrerRewardType === 'Wallet Points' ? ' Points' : ''}
                {activeCampaign.referrerRewardType === 'Free Membership Days' ? ' Free Days' : ''}
              </div>
              <p className="text-xs text-[#64748B]">Type: <strong className="text-[#111827]">{activeCampaign.referrerRewardType || 'Credit'}</strong></p>
            </div>

            {/* New Member (Referee) Benefit */}
            <div className="p-4 bg-[#FFF7ED] rounded-2xl border border-[#E2E8F0] space-y-2">
              <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
                <Tag size={14} /> Referee (New Member) Benefit
              </span>
              <div className="text-xl font-extrabold text-[#111827]">
                {activeCampaign.refereeDiscountType === 'Percentage' ? `${activeCampaign.refereeRewardValue ?? 0}% OFF` : `₹${activeCampaign.refereeRewardValue ?? 0} OFF`}
              </div>
              <p className="text-xs text-[#64748B]">Type: <strong className="text-[#111827]">{activeCampaign.refereeRewardType || 'Discount'}</strong></p>
            </div>

            {/* Campaign Guardrails & Budget */}
            <div className="p-4 bg-[#FFF7ED] rounded-2xl border border-[#E2E8F0] space-y-2">
              <span className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} /> Guardrails & Budget
              </span>
              <div className="text-xs text-[#64748B] space-y-1">
                <p>Min Purchase: <strong className="text-[#111827]">₹{activeCampaign.minMembershipPurchase ?? 0}</strong></p>
                <p>Max Referrals / User: <strong className="text-[#111827]">{activeCampaign.maxReferralsPerUser || 'Unlimited'}</strong></p>
                <p>Budget Spent: <strong className="text-[#111827]">₹{activeCampaign.budgetSpent ?? 0}</strong> / {activeCampaign.rewardBudget ? `₹${activeCampaign.rewardBudget}` : 'Unlimited'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Referral Records Management Table */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">Referral Management Records</h2>
            <p className="text-xs text-[#64748B]">Total {totalCount} referral activities tracked.</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search member, code, email..."
                className="pl-9 pr-4 py-2 bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] outline-none focus:border-[#FDBA74] w-60"
              />
            </form>

            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="py-2 px-3 bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl text-xs text-[#111827] outline-none focus:border-[#FDBA74]"
            >
              <option value="All">All Statuses</option>
              <option value="Registered">Registered</option>
              <option value="Membership Pending">Membership Pending</option>
              <option value="Payment Verified">Payment Verified</option>
              <option value="Reward Pending">Reward Pending</option>
              <option value="Reward Issued">Reward Issued</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] font-bold uppercase tracking-wider text-[#64748B] bg-[#FFF7ED]">
                <th className="py-3 px-4">Referrer (Existing Member)</th>
                <th className="py-3 px-4">Referee (New Member)</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Plan / Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Referrer Reward</th>
                <th className="py-3 px-4">Referee Benefit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B]">
                    <RefreshCw className="animate-spin inline-block mr-2" size={18} />
                    Loading referral records...
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B]">
                    No referral records found matching your filters.
                  </td>
                </tr>
              ) : (
                referrals.map(record => (
                  <tr key={record._id} className="hover:bg-[#FFF7ED]/30 transition-colors">
                    {/* Referrer */}
                    <td className="py-3.5 px-4 font-semibold text-[#111827]">
                      <div>{record.referrerId?.firstName} {record.referrerId?.lastName}</div>
                      <div className="text-[11px] text-[#64748B]">{record.referrerId?.email}</div>
                    </td>

                    {/* Referee */}
                    <td className="py-3.5 px-4 font-semibold text-[#111827]">
                      <div>{record.referredId?.firstName} {record.referredId?.lastName}</div>
                      <div className="text-[11px] text-[#64748B]">{record.referredId?.email}</div>
                    </td>

                    {/* Code */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[#EA580C]">
                        {record.referralCode}
                      </span>
                    </td>

                    {/* Plan & Amount */}
                    <td className="py-3.5 px-4">
                      {record.membershipPlanName ? (
                        <div>
                          <div className="font-medium text-[#111827]">{record.membershipPlanName}</div>
                          <div className="text-[11px] text-[#EA580C] font-semibold">₹{record.finalPaymentAmount ?? record.planAmount}</div>
                        </div>
                      ) : (
                        <span className="text-[#64748B] italic">No plan yet</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(record.status)}
                    </td>

                    {/* Referrer Reward */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-[#111827]">
                          {record.referrerRewardType === 'Membership Credit' || record.referrerRewardType === 'Cash Payout' ? '₹' : ''}
                          {record.referrerRewardAmount}
                          {record.referrerRewardType === 'Wallet Points' ? ' pts' : ''}
                          {record.referrerRewardType === 'Free Membership Days' ? ' days' : ''}
                        </span>
                        <div className="text-[10px] text-[#64748B]">{record.referrerRewardStatus}</div>
                      </div>
                    </td>

                    {/* Referee Reward */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-[#EA580C]">
                          ₹{record.refereeRewardAmount}
                        </span>
                        <div className="text-[10px] text-[#64748B]">{record.refereeRewardStatus}</div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedReferral(record)}
                        className="p-1.5 hover:bg-[#FFF7ED] text-[#111827] rounded-lg transition-colors"
                        title="View Full Details"
                      >
                        <Eye size={16} />
                      </button>

                      {record.status === 'Reward Pending' && (
                        <button
                          onClick={() => handleManualIssueReward(record._id)}
                          className="px-2.5 py-1 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-lg text-[11px] font-bold"
                          title="Issue Reward Now"
                        >
                          Issue
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4 text-xs">
            <span className="text-[#64748B]">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 border border-[#E2E8F0] rounded-xl hover:bg-[#FFF7ED] disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 border border-[#E2E8F0] rounded-xl hover:bg-[#FFF7ED] disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT CAMPAIGN MODAL */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4.5 bg-[#FFFFFF] shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-[#111827]">
                  {editingCampaign ? 'Edit Referral Campaign' : 'Create Referral Campaign'}
                </h3>
                <p className="text-xs text-[#64748B]">Configure dual customer incentives and eligibility rules.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCampaignModal(false)}
                className="p-2 rounded-xl text-[#64748B] hover:bg-[#FFF7ED] transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="campaign-form" onSubmit={handleSaveCampaign} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Campaign Name & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#111827] mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    value={campaignForm.campaignName}
                    onChange={e => setCampaignForm({ ...campaignForm, campaignName: e.target.value })}
                    placeholder="e.g. Friends & Family Monsoon Special"
                    className="w-full bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] outline-none focus:border-[#FDBA74]"
                  />
                  {formErrors.campaignName && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.campaignName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1">Status</label>
                  <select
                    value={campaignForm.status}
                    onChange={e => setCampaignForm({ ...campaignForm, status: e.target.value as any })}
                    className="w-full bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-xs text-[#111827] outline-none focus:border-[#FDBA74]"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#111827] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={campaignForm.campaignDescription}
                  onChange={e => setCampaignForm({ ...campaignForm, campaignDescription: e.target.value })}
                  placeholder="Details for members..."
                  className="w-full bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#111827] outline-none focus:border-[#FDBA74]"
                />
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={campaignForm.startDate}
                    onChange={e => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                    className="w-full bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#111827] outline-none focus:border-[#FDBA74]"
                  />
                  {formErrors.startDate && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#111827] mb-1">End Date *</label>
                  <input
                    type="date"
                    value={campaignForm.endDate}
                    onChange={e => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                    className="w-full bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#111827] outline-none focus:border-[#FDBA74]"
                  />
                  {formErrors.endDate && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.endDate}</p>}
                </div>
              </div>

              {/* Referrer Reward Configuration */}
              <div className="p-4 bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl space-y-3">
                <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
                  <Gift size={14} /> Existing Customer (Referrer) Reward
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Reward Type</label>
                    <select
                      value={campaignForm.referrerRewardType}
                      onChange={e => setCampaignForm({ ...campaignForm, referrerRewardType: e.target.value as any })}
                      className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827]"
                    >
                      <option value="Membership Credit">Membership Credit (₹)</option>
                      <option value="Wallet Points">Wallet Points</option>
                      <option value="Free Membership Days">Free Membership Days</option>
                      <option value="Cash Payout">Cash Payout (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Amount / Value</label>
                    <input
                      type="number"
                      min={1}
                      value={campaignForm.referrerRewardValue}
                      onChange={e => setCampaignForm({ ...campaignForm, referrerRewardValue: Number(e.target.value) })}
                      className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827]"
                    />
                    {formErrors.referrerRewardValue && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.referrerRewardValue}</p>}
                  </div>
                </div>
              </div>

              {/* Referee Benefit Configuration */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3">
                <span className="text-xs font-bold text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={14} /> New Customer (Referee) Benefit
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Reward Type</label>
                    <select
                      value={campaignForm.refereeRewardType}
                      onChange={e => setCampaignForm({ ...campaignForm, refereeRewardType: e.target.value as any })}
                      className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827]"
                    >
                      <option value="Membership Discount">Membership Discount</option>
                      <option value="Wallet Points">Wallet Points</option>
                      <option value="Free Membership Days">Free Membership Days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Discount Mode</label>
                    <select
                      value={campaignForm.refereeDiscountType}
                      onChange={e => setCampaignForm({ ...campaignForm, refereeDiscountType: e.target.value as any })}
                      className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827]"
                    >
                      <option value="Fixed">Fixed Amount (₹)</option>
                      <option value="Percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Value</label>
                    <input
                      type="number"
                      min={1}
                      value={campaignForm.refereeRewardValue}
                      onChange={e => setCampaignForm({ ...campaignForm, refereeRewardValue: Number(e.target.value) })}
                      className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827]"
                    />
                    {formErrors.refereeRewardValue && <p className="text-rose-600 text-[11px] mt-0.5">{formErrors.refereeRewardValue}</p>}
                  </div>
                </div>
              </div>

              {/* Guardrails */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Min Plan Purchase (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={campaignForm.minMembershipPurchase}
                    onChange={e => setCampaignForm({ ...campaignForm, minMembershipPurchase: Number(e.target.value) })}
                    className="w-full bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Max Referrals / User</label>
                  <input
                    type="number"
                    min={0}
                    value={campaignForm.maxReferralsPerUser}
                    onChange={e => setCampaignForm({ ...campaignForm, maxReferralsPerUser: Number(e.target.value) })}
                    placeholder="0 for unlimited"
                    className="w-full bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Total Budget (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={campaignForm.rewardBudget}
                    onChange={e => setCampaignForm({ ...campaignForm, rewardBudget: Number(e.target.value) })}
                    placeholder="0 for unlimited"
                    className="w-full bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827]"
                  />
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={campaignForm.termsAndConditions}
                  onChange={e => setCampaignForm({ ...campaignForm, termsAndConditions: e.target.value })}
                  className="w-full bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827]"
                />
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0] bg-[#FFF7ED] shrink-0">
              <button
                type="button"
                onClick={() => setShowCampaignModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] text-xs font-bold hover:bg-[#FFF7ED] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="campaign-form"
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs font-bold shadow-md shadow-orange-500/15 transition-all cursor-pointer"
              >
                {actionLoading ? 'Saving...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFERRAL DETAILS MODAL */}
      {selectedReferral && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Sticky Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4 shrink-0 bg-[#FFFFFF]">
              <h3 className="text-base font-bold text-[#111827]">Referral Record Details</h3>
              <button onClick={() => setSelectedReferral(null)} className="p-1 rounded-lg text-[#64748B] hover:bg-[#FFF7ED]">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Details Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Referrer & Referee */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FFF7ED] rounded-2xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B]">Referrer</span>
                  <p className="font-bold text-[#111827]">{selectedReferral.referrerId?.firstName} {selectedReferral.referrerId?.lastName}</p>
                  <p className="text-[11px] text-[#64748B]">{selectedReferral.referrerId?.email}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B]">Referred Friend</span>
                  <p className="font-bold text-[#111827]">{selectedReferral.referredId?.firstName} {selectedReferral.referredId?.lastName}</p>
                  <p className="text-[11px] text-[#64748B]">{selectedReferral.referredId?.email}</p>
                </div>
              </div>

              {/* Referral Status & Code */}
              <div className="flex items-center justify-between p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B]">Referral Code</span>
                  <p className="font-mono font-bold text-[#EA580C] text-sm">{selectedReferral.referralCode}</p>
                </div>
                <div>
                  {getStatusBadge(selectedReferral.status)}
                </div>
              </div>

              {/* Membership details */}
              <div className="p-3 bg-[#FFF7ED] rounded-2xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Plan Purchased:</span>
                  <span className="font-bold text-[#111827]">{selectedReferral.membershipPlanName || 'Pending'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Plan Original Price:</span>
                  <span className="font-medium text-[#111827]">₹{selectedReferral.planAmount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Referral Discount Applied:</span>
                  <span className="font-medium text-[#EA580C]">- ₹{selectedReferral.discountApplied || 0}</span>
                </div>
                <div className="flex justify-between border-t border-[#E2E8F0] pt-1">
                  <span className="font-bold text-[#111827]">Paid Amount:</span>
                  <span className="font-extrabold text-[#111827]">₹{selectedReferral.finalPaymentAmount || 0}</span>
                </div>
                {selectedReferral.paymentReference && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64748B]">Payment Ref:</span>
                    <span className="font-mono text-[#111827]">{selectedReferral.paymentReference}</span>
                  </div>
                )}
              </div>

              {/* Dual Rewards Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                  <span className="text-[10px] font-bold text-[#EA580C] uppercase">Referrer Reward</span>
                  <p className="font-extrabold text-[#111827] text-sm mt-0.5">
                    {selectedReferral.referrerRewardAmount} ({selectedReferral.referrerRewardType})
                  </p>
                  <p className="text-[10px] text-[#EA580C] mt-0.5">Status: {selectedReferral.referrerRewardStatus}</p>
                </div>
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
                  <span className="text-[10px] font-bold text-[#EA580C] uppercase">Referee Benefit</span>
                  <p className="font-extrabold text-[#111827] text-sm mt-0.5">
                    ₹{selectedReferral.refereeRewardAmount} ({selectedReferral.refereeRewardType})
                  </p>
                  <p className="text-[10px] text-[#EA580C] mt-0.5">Status: {selectedReferral.refereeRewardStatus}</p>
                </div>
              </div>

              {selectedReferral.notes && (
                <div className="text-[11px] text-[#64748B] p-2 bg-[#F8FAFC] rounded-xl">
                  <strong>Notes:</strong> {selectedReferral.notes}
                </div>
              )}
            </div>

            {/* Sticky Footer */}
            <div className="flex justify-end px-6 py-3.5 border-t border-[#E2E8F0] bg-[#FFF7ED] shrink-0">
              <button
                type="button"
                onClick={() => setSelectedReferral(null)}
                className="px-5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};

export default GymAdminReferrals;
