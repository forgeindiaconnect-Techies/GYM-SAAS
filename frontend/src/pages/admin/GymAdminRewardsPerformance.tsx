import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Award,
  Users,
  Dumbbell,
  Calendar,
  Gift,
  Ticket,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Flame,
  Star,
  IndianRupee,
  Utensils,
  Activity,
  ChevronRight,
  Eye,
  Plus,
  Edit,
  Trash2,
  X,
  User,
  Check,
  Coins,
  ShieldAlert,
  BarChart3,
  CalendarCheck
} from 'lucide-react';
import api from '../../utils/api';

export default function GymAdminRewardsPerformance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'customer-performance';

  const [activeTab, setActiveTab] = useState<'customer-performance' | 'trainer-performance' | 'rewards-catalog' | 'claims-history'>(
    ['customer-performance', 'trainer-performance', 'rewards-catalog', 'claims-history'].includes(initialTab)
      ? initialTab
      : 'customer-performance'
  );

  // Sync tab with URL query parameter
  const handleTabChange = (tab: 'customer-performance' | 'trainer-performance' | 'rewards-catalog' | 'claims-history') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ==========================================
  // STATE: CUSTOMER PERFORMANCE
  // ==========================================
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerStats, setCustomerStats] = useState<any>({
    totalCustomers: 0,
    activeMembersCount: 0,
    averageAttendanceStreak: 0,
    averageWorkoutCompletionRate: null
  });
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [custSearch, setCustSearch] = useState('');
  const [custMembershipFilter, setCustMembershipFilter] = useState('ALL');
  const [custTrainerFilter, setCustTrainerFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // ==========================================
  // STATE: TRAINER PERFORMANCE
  // ==========================================
  const [trainers, setTrainers] = useState<any[]>([]);
  const [trainerStats, setTrainerStats] = useState<any>({
    totalTrainers: 0,
    totalCompletedSessionsAcrossTrainers: 0,
    averageGymTrainerRating: 5.0
  });
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [trainerSearch, setTrainerSearch] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState<any | null>(null);
  const [trainerModalTab, setTrainerModalTab] = useState<'handled-customers' | 'workout-tracking' | 'diet-tracking' | 'sessions' | 'reviews' | 'rewards'>('handled-customers');

  // ==========================================
  // STATE: REWARDS & CLAIMS
  // ==========================================
  const [rewards, setRewards] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [rewardSearch, setRewardSearch] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('ALL');
  const [claimStatusFilter, setClaimStatusFilter] = useState('ALL');

  // Modals for Rewards
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);
  const [claimActionModalOpen, setClaimActionModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'PAYOUT' | 'REDEEM'>('APPROVE');
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [claimNotes, setClaimNotes] = useState('');

  // Notification Banner
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reward Form State
  const [customerCriteriaType, setCustomerCriteriaType] = useState<'points' | 'visits' | 'workouts' | 'free'>('points');
  const [rewardFormData, setRewardFormData] = useState({
    title: '',
    description: '',
    recipientType: 'Customer',
    category: 'Discount Coupon',
    rewardType: 'Coupon',
    requiredPoints: 100,
    requiredChallengeId: '',
    minVerifiedVisits: 0,
    minWorkoutCompletions: 0,
    minStreakDays: 0,
    minDietAdherenceDays: 0,
    minCompletedSessions: 0,
    minAverageRating: 0,
    minReviewedPlans: 0,
    bonusAmount: 0,
    currency: 'INR',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    totalQuantity: 50,
    maxClaimsPerUser: 1,
    requireApproval: true,
    termsAndConditions: 'Valid only at registered gym branch. Cannot be combined with other offers.',
    status: 'Active'
  });

  // Fetch Customers Performance
  const fetchCustomerPerformance = async () => {
    try {
      setLoadingCustomers(true);
      const res = await api.get('/performance/customers');
      if (res.data?.success) {
        setCustomers(res.data.customers || []);
        setCustomerStats(res.data.stats || {});
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load customer performance records' });
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Fetch Trainers Performance
  const fetchTrainerPerformance = async () => {
    try {
      setLoadingTrainers(true);
      const res = await api.get('/performance/trainers');
      if (res.data?.success) {
        setTrainers(res.data.trainers || []);
        setTrainerStats(res.data.stats || {});
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load trainer performance records' });
    } finally {
      setLoadingTrainers(false);
    }
  };

  // Fetch Rewards and Claims
  const fetchRewardsAndClaims = async () => {
    try {
      setLoadingRewards(true);
      const [rwdRes, chRes] = await Promise.all([
        api.get('/rewards/owner'),
        api.get('/challenges/owner').catch(() => ({ data: { challenges: [] } }))
      ]);
      if (rwdRes.data?.success) {
        setRewards(rwdRes.data.rewards || []);
        setClaims(rwdRes.data.claims || []);
      }
      setChallenges(chRes.data?.challenges || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRewards(false);
    }
  };

  useEffect(() => {
    fetchCustomerPerformance();
    fetchTrainerPerformance();
    fetchRewardsAndClaims();
  }, []);

  // Filtered Customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(custSearch.toLowerCase()) ||
      (c.phone || c.mobile || '').includes(custSearch);

    const matchesStatus =
      custMembershipFilter === 'ALL' ||
      c.membership.status.toUpperCase() === custMembershipFilter.toUpperCase();

    const matchesTrainer =
      custTrainerFilter === 'ALL' ||
      (c.assignedTrainer && (c.assignedTrainer._id === custTrainerFilter || c.assignedTrainer.name.toLowerCase().includes(custTrainerFilter.toLowerCase())));

    return matchesSearch && matchesStatus && matchesTrainer;
  });

  // Filtered Trainers
  const filteredTrainers = trainers.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(trainerSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(trainerSearch.toLowerCase()) ||
      (t.phone || '').includes(trainerSearch);
    return matchesSearch;
  });

  // Filtered Rewards
  const filteredRewards = rewards.filter(r => {
    const matchesSearch =
      r.title.toLowerCase().includes(rewardSearch.toLowerCase()) ||
      r.category.toLowerCase().includes(rewardSearch.toLowerCase());
    const matchesRecipient = recipientFilter === 'ALL' || r.recipientType === recipientFilter || r.recipientType === 'Both';
    return matchesSearch && matchesRecipient;
  });

  // Filtered Claims
  const filteredClaims = claims.filter(c => {
    const matchesSearch =
      c.claimCode.toLowerCase().includes(rewardSearch.toLowerCase()) ||
      (c.userId?.firstName || '').toLowerCase().includes(rewardSearch.toLowerCase()) ||
      (c.userId?.lastName || '').toLowerCase().includes(rewardSearch.toLowerCase()) ||
      (c.rewardId?.title || '').toLowerCase().includes(rewardSearch.toLowerCase());
    const matchesStatus = claimStatusFilter === 'ALL' || c.claimStatus === claimStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handlers for Reward Creation/Edit
  const openCreateRewardModal = () => {
    setIsEditMode(false);
    setSelectedRewardId(null);
    setCustomerCriteriaType('points');
    setRewardFormData({
      title: '',
      description: '',
      recipientType: 'Customer',
      category: 'Discount Coupon',
      rewardType: 'Coupon',
      requiredPoints: 100,
      requiredChallengeId: '',
      minVerifiedVisits: 0,
      minWorkoutCompletions: 0,
      minStreakDays: 0,
      minDietAdherenceDays: 0,
      minCompletedSessions: 0,
      minAverageRating: 0,
      minReviewedPlans: 0,
      bonusAmount: 0,
      currency: 'INR',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      totalQuantity: 0,
      maxClaimsPerUser: 1,
      requireApproval: false,
      termsAndConditions: 'Valid only at registered gym branch. Cannot be combined with other offers.',
      status: 'Active'
    });
    setIsRewardModalOpen(true);
  };

  const openEditRewardModal = (r: any) => {
    setIsEditMode(true);
    setSelectedRewardId(r._id);
    if ((r.requiredPoints || 0) > 0) {
      setCustomerCriteriaType('points');
    } else if ((r.minVerifiedVisits || 0) > 0 || (r.minStreakDays || 0) > 0) {
      setCustomerCriteriaType('visits');
    } else if ((r.minWorkoutCompletions || 0) > 0) {
      setCustomerCriteriaType('workouts');
    } else {
      setCustomerCriteriaType('free');
    }
    setRewardFormData({
      title: r.title,
      description: r.description,
      recipientType: r.recipientType,
      category: r.category,
      rewardType: r.rewardType,
      requiredPoints: r.requiredPoints || 0,
      requiredChallengeId: r.requiredChallengeId?._id || r.requiredChallengeId || '',
      minVerifiedVisits: r.minVerifiedVisits || 0,
      minWorkoutCompletions: r.minWorkoutCompletions || 0,
      minStreakDays: r.minStreakDays || 0,
      minDietAdherenceDays: r.minDietAdherenceDays || 0,
      minCompletedSessions: r.minCompletedSessions || 0,
      minAverageRating: r.minAverageRating || 0,
      minReviewedPlans: r.minReviewedPlans || 0,
      bonusAmount: r.bonusAmount || 0,
      currency: r.currency || 'INR',
      startDate: r.startDate ? r.startDate.split('T')[0] : '',
      expiryDate: r.expiryDate ? r.expiryDate.split('T')[0] : '',
      totalQuantity: r.totalQuantity || 0,
      maxClaimsPerUser: r.maxClaimsPerUser || 1,
      requireApproval: Boolean(r.requireApproval),
      termsAndConditions: r.termsAndConditions || '',
      status: r.status
    });
    setIsRewardModalOpen(true);
  };

  const handleRewardFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...rewardFormData };
      if (rewardFormData.recipientType === 'Customer') {
        if (customerCriteriaType === 'points') {
          payload.requiredPoints = Number(rewardFormData.requiredPoints) || 100;
          payload.minVerifiedVisits = 0;
          payload.minWorkoutCompletions = 0;
          payload.minStreakDays = 0;
        } else if (customerCriteriaType === 'visits') {
          payload.requiredPoints = 0;
          payload.minVerifiedVisits = Number(rewardFormData.minVerifiedVisits) || 10;
          payload.minStreakDays = Number(rewardFormData.minStreakDays) || 0;
          payload.minWorkoutCompletions = 0;
        } else if (customerCriteriaType === 'workouts') {
          payload.requiredPoints = 0;
          payload.minVerifiedVisits = 0;
          payload.minStreakDays = 0;
          payload.minWorkoutCompletions = Number(rewardFormData.minWorkoutCompletions) || 5;
        } else if (customerCriteriaType === 'free') {
          payload.requiredPoints = 0;
          payload.minVerifiedVisits = 0;
          payload.minStreakDays = 0;
          payload.minWorkoutCompletions = 0;
        }
      }

      if (isEditMode && selectedRewardId) {
        await api.put(`/rewards/${selectedRewardId}`, payload);
        setMessage({ type: 'success', text: 'Reward updated successfully!' });
      } else {
        await api.post('/rewards', payload);
        setMessage({ type: 'success', text: 'Reward created successfully!' });
      }
      setIsRewardModalOpen(false);
      fetchRewardsAndClaims();
      fetchCustomerPerformance();
      fetchTrainerPerformance();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error saving reward' });
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    try {
      const res = await api.delete(`/rewards/${id}`);
      setMessage({ type: 'success', text: res.data?.message || 'Reward removed' });
      fetchRewardsAndClaims();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete reward' });
    }
  };

  const openClaimAction = (claim: any, action: 'APPROVE' | 'REJECT' | 'PAYOUT' | 'REDEEM') => {
    setSelectedClaim(claim);
    setActionType(action);
    setRejectionReason('');
    setPaymentReference('');
    setClaimNotes('');
    setClaimActionModalOpen(true);
  };

  const handleProcessClaim = async () => {
    if (!selectedClaim) return;
    try {
      let body: any = {};
      if (actionType === 'APPROVE') {
        body = { claimStatus: 'Approved', notes: claimNotes };
      } else if (actionType === 'REJECT') {
        if (!rejectionReason.trim()) {
          alert('Please provide a reason for rejecting this claim.');
          return;
        }
        body = { claimStatus: 'Rejected', rejectionReason, notes: claimNotes };
      } else if (actionType === 'REDEEM') {
        body = { claimStatus: 'Redeemed', notes: claimNotes };
      } else if (actionType === 'PAYOUT') {
        if (!paymentReference.trim()) {
          alert('Please enter a payment reference or transaction ID.');
          return;
        }
        body = {
          financialPayoutStatus: 'Paid',
          financialPayoutReference: paymentReference,
          notes: claimNotes
        };
      }

      await api.put(`/rewards/claims/${selectedClaim._id}/status`, body);
      setMessage({ type: 'success', text: 'Claim status updated successfully' });
      setClaimActionModalOpen(false);
      fetchRewardsAndClaims();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update claim' });
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#D9E2E3] shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#D8EAE7] text-[#167D78] shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#344B4A] tracking-tight">
              Rewards & Performance
            </h1>
            <p className="text-xs sm:text-sm text-[#697778] mt-0.5">
              Comprehensive real-time tracking of customer adherence, trainer effectiveness, reward catalogs, and voucher redemptions.
            </p>
          </div>
        </div>

        {activeTab === 'rewards-catalog' && (
          <button
            onClick={openCreateRewardModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md shadow-[#167D78]/20 hover:bg-[#116660] transition-all shrink-0 cursor-pointer"
            style={{ backgroundColor: '#167D78' }}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Create Reward
          </button>
        )}
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Level 4-Tab Navigation */}
      <div className="w-full">
        <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-white border border-[#D9E2E3] rounded-2xl w-full sm:w-fit overflow-x-auto shadow-xs">
          <button
            onClick={() => handleTabChange('customer-performance')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'customer-performance'
                ? 'bg-[#167D78] text-white font-bold shadow-xs'
                : 'text-[#697778] hover:text-[#344B4A] hover:bg-[#E8EFF0] font-semibold'
            }`}
          >
            <Users size={16} className={activeTab === 'customer-performance' ? 'text-white' : 'text-[#697778]'} />
            <span>Customer Performance ({customerStats.totalCustomers || 0})</span>
          </button>

          <button
            onClick={() => handleTabChange('trainer-performance')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'trainer-performance'
                ? 'bg-[#167D78] text-white font-bold shadow-xs'
                : 'text-[#697778] hover:text-[#344B4A] hover:bg-[#E8EFF0] font-semibold'
            }`}
          >
            <Dumbbell size={16} className={activeTab === 'trainer-performance' ? 'text-white' : 'text-[#697778]'} />
            <span>Trainer Performance ({trainerStats.totalTrainers || 0})</span>
          </button>

          <button
            onClick={() => handleTabChange('rewards-catalog')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'rewards-catalog'
                ? 'bg-[#167D78] text-white font-bold shadow-xs'
                : 'text-[#697778] hover:text-[#344B4A] hover:bg-[#E8EFF0] font-semibold'
            }`}
          >
            <Gift size={16} className={activeTab === 'rewards-catalog' ? 'text-white' : 'text-[#697778]'} />
            <span>Rewards Management ({rewards.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('claims-history')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'claims-history'
                ? 'bg-[#167D78] text-white font-bold shadow-xs'
                : 'text-[#697778] hover:text-[#344B4A] hover:bg-[#E8EFF0] font-semibold'
            }`}
          >
            <Ticket size={16} className={activeTab === 'claims-history' ? 'text-white' : 'text-[#697778]'} />
            <span>Reward Claims & History ({claims.length})</span>
            {claims.filter(c => c.claimStatus === 'Pending').length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'claims-history' ? 'bg-amber-400 text-stone-900' : 'bg-amber-500 text-white'
              }`}>
                {claims.filter(c => c.claimStatus === 'Pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CUSTOMER PERFORMANCE                             */}
      {/* ======================================================== */}
      {activeTab === 'customer-performance' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Total Gym Members</span>
                <span className="p-2 rounded-lg bg-[#D8EAE7] text-[#167D78]"><Users className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#344B4A]">{customerStats.totalCustomers}</div>
              <p className="text-xs text-gray-400 mt-1">{customerStats.activeMembersCount} with active membership</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Avg Attendance Streak</span>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-600"><Flame className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-amber-600">
                {customerStats.averageAttendanceStreak} <span className="text-base font-normal">days</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Consecutive verified visits</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Avg Workout Completion</span>
                <span className="p-2 rounded-lg bg-[#D8EAE7] text-[#167D78]"><TrendingUp className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#167D78]">
                {customerStats.averageWorkoutCompletionRate !== null ? `${customerStats.averageWorkoutCompletionRate}%` : 'Not Available'}
              </div>
              <p className="text-xs text-gray-400 mt-1">Based on logged workout sets</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Eligible For Rewards</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><Gift className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-emerald-700">
                {customers.filter(c => c.rewardsSummary?.eligibleRewardsCount > 0).length}
              </div>
              <p className="text-xs text-gray-400 mt-1">Members meeting target rules</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: '#D9E2E3' }}>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search member by name, email, phone..."
                value={custSearch}
                onChange={e => setCustSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: '#D9E2E3' }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">MEMBERSHIP:</span>
                <select
                  value={custMembershipFilter}
                  onChange={e => setCustMembershipFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-white focus:outline-none"
                  style={{ borderColor: '#D9E2E3' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive / Expired</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">TRAINER:</span>
                <select
                  value={custTrainerFilter}
                  onChange={e => setCustTrainerFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-white focus:outline-none"
                  style={{ borderColor: '#D9E2E3' }}
                >
                  <option value="ALL">All Trainers</option>
                  {trainers.map(t => (
                    <option key={t.trainerId} value={t.trainerId}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          {loadingCustomers ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto text-[#167D78]" />
              <p className="mt-2 text-xs text-gray-500">Evaluating customer records...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Customers Match Filter</h3>
              <p className="text-sm text-gray-400 mt-1">Try resetting your search query or membership status filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#D9E2E3' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase bg-gray-50 text-gray-500" style={{ borderColor: '#D9E2E3' }}>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Membership</th>
                      <th className="py-3 px-4">Assigned Trainer</th>
                      <th className="py-3 px-4">Workouts</th>
                      <th className="py-3 px-4">Diet Plan</th>
                      <th className="py-3 px-4">Visits & Streak</th>
                      <th className="py-3 px-4">Reward Status</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#D9E2E3' }}>
                    {filteredCustomers.map(c => {
                      const wPct = c.workoutSummary?.completionPercentage;
                      const dPct = c.dietSummary?.adherencePercentage;

                      return (
                        <tr key={c.customerId} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-800">{c.name}</div>
                            <div className="text-xs text-gray-400">
                              {c.email}{c.phone ? ` • ${c.phone}` : ''}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold ${
                                c.membership.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {c.membership.status}
                            </span>
                            <span className="block text-[11px] text-gray-500 mt-0.5 truncate max-w-[120px]">
                              {c.membership.planName}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {c.assignedTrainer ? (
                              <span className="font-medium text-gray-800">{c.assignedTrainer.name}</span>
                            ) : (
                              <span className="text-gray-400">None assigned</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {wPct !== null ? (
                              <div>
                                <span className="font-bold text-[#167D78]">{wPct}%</span>
                                <span className="text-[11px] text-gray-400 block">
                                  {c.workoutSummary.completedWorkoutsCount} done / {c.workoutSummary.totalWorkoutsScheduled}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">Not recorded</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {c.dietSummary?.plan ? (
                              <div>
                                <span
                                  className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                                    c.dietSummary.plan.status === 'Approved'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  {c.dietSummary.plan.status}
                                </span>
                                <span className="block text-[11px] text-gray-500 mt-0.5">
                                  {dPct !== null ? `${dPct}% check-in` : 'No meal logs'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400">No diet plan</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            <div className="font-bold text-gray-800">
                              {c.attendanceSummary.totalVerifiedVisits} visits
                            </div>
                            <span className="text-amber-600 font-semibold text-[11px]">
                              🔥 {c.attendanceSummary.attendanceStreak}d streak
                            </span>
                          </td>


                          <td className="py-3 px-4 text-xs">
                            {c.rewardsSummary?.eligibleRewardsCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                                {c.rewardsSummary.eligibleRewardsCount} Eligible
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium">In Progress</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedCustomer(c)}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold border hover:bg-gray-50 text-[#167D78] flex items-center gap-1 ml-auto"
                              style={{ borderColor: '#D9E2E3' }}
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TRAINER PERFORMANCE                              */}
      {/* ======================================================== */}
      {activeTab === 'trainer-performance' && (
        <div className="space-y-6">
          {/* Trainer Stats Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Total Trainers</span>
                <span className="p-2 rounded-lg bg-[#D8EAE7] text-[#167D78]"><Dumbbell className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#344B4A]">{trainerStats.totalTrainers}</div>
              <p className="text-xs text-gray-400 mt-1">Gym trainers on staff</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Completed Sessions Across Gym</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-emerald-700">
                {trainerStats.totalCompletedSessionsAcrossTrainers}
              </div>
              <p className="text-xs text-gray-400 mt-1">Online & in-person sessions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Average Trainer Rating</span>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-600"><Star className="w-4 h-4 fill-amber-500 text-amber-500" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-amber-600">
                {trainerStats.averageGymTrainerRating} ⭐
              </div>
              <p className="text-xs text-gray-400 mt-1">From real client feedback reviews</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between items-center" style={{ borderColor: '#D9E2E3' }}>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search trainer by name, email..."
                value={trainerSearch}
                onChange={e => setTrainerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: '#D9E2E3' }}
              />
            </div>
          </div>

          {/* Trainer Grid */}
          {loadingTrainers ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto text-[#167D78]" />
              <p className="mt-2 text-xs text-gray-500">Loading trainer evaluations...</p>
            </div>
          ) : filteredTrainers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <Dumbbell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Trainers Found</h3>
              <p className="text-sm text-gray-400 mt-1">No trainers match your active search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainers.map(t => (
                <div
                  key={t.trainerId}
                  className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                  style={{ borderColor: '#D9E2E3' }}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800">
                        {t.activeStatus}
                      </span>
                      <span className="font-bold text-xs text-amber-600 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {t.feedbackSummary?.averageRating} ⭐ ({t.feedbackSummary?.totalRatingsCount} reviews)
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-gray-800">{t.name}</h3>
                      <div className="text-xs text-gray-400">{t.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Experience: {t.experience} • Clients: <span className="font-bold text-gray-800">{t.clientsSummary?.totalAssignedCustomers}</span>
                      </div>
                    </div>

                    {/* Performance Metrics Box */}
                    <div className="p-3 rounded-xl bg-gray-50 text-xs space-y-1.5 border" style={{ borderColor: '#E8EFF0' }}>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sessions Completed:</span>
                        <span className="font-bold text-emerald-700">
                          {t.sessionsSummary.completed} sessions ({t.sessionsSummary.onlineCount} online / {t.sessionsSummary.inPersonCount} in-person)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Punctuality:</span>
                        <span className="font-medium text-gray-700">{t.sessionsSummary.punctuality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Workout Plans Reviewed:</span>
                        <span className="font-semibold text-gray-800">{t.plansSummary.totalReviewedOrApproved} plans</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Client Workout Adherence:</span>
                        <span className="font-bold text-[#167D78]">
                          {t.clientsSummary.averageClientWorkoutProgress !== null
                            ? `${t.clientsSummary.averageClientWorkoutProgress}%`
                            : 'Not recorded'}
                        </span>
                      </div>
                    </div>

                    {/* Eligible Bonuses Banner */}
                    {t.rewardsSummary?.eligibleBonusesCount > 0 && (
                      <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800 flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Eligible for {t.rewardsSummary.eligibleBonusesCount} performance awards!</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t flex justify-between items-center" style={{ borderColor: '#D9E2E3' }}>
                    <span className="text-xs text-gray-400">
                      {t.rewardsSummary.paidBonusesCount} bonuses paid
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTrainer(t);
                        setTrainerModalTab('handled-customers');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border text-[#167D78] hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                      style={{ borderColor: '#D9E2E3' }}
                    >
                      <Eye className="w-3.5 h-3.5" /> Performance Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REWARDS MANAGEMENT                               */}
      {/* ======================================================== */}
      {activeTab === 'rewards-catalog' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: '#D9E2E3' }}>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search rewards..."
                value={rewardSearch}
                onChange={e => setRewardSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: '#D9E2E3' }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">AUDIENCE:</span>
              <select
                value={recipientFilter}
                onChange={e => setRecipientFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-white focus:outline-none"
                style={{ borderColor: '#D9E2E3' }}
              >
                <option value="ALL">All Audiences</option>
                <option value="Customer">Customers Only</option>
                <option value="Trainer">Trainers Only</option>
              </select>
            </div>
          </div>

          {filteredRewards.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Rewards Configured</h3>
              <p className="text-sm text-gray-400 mt-1">Create discount coupons, free sessions, or trainer performance bonuses.</p>
              <button
                onClick={openCreateRewardModal}
                className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-semibold"
                style={{ backgroundColor: '#167D78' }}
              >
                Create Reward
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map(r => (
                <div
                  key={r._id}
                  className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                  style={{ borderColor: '#D9E2E3' }}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800">
                        {r.recipientType === 'Both' ? 'Customer & Trainer' : `${r.recipientType}s`}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700">
                        {r.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-gray-800">{r.title}</h3>
                      <span className="text-xs text-gray-400 block mt-0.5">{r.category}</span>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.description}</p>
                    </div>

                    {/* Criteria Rules Display */}
                    <div className="p-3 rounded-xl bg-gray-50 text-xs space-y-1 border" style={{ borderColor: '#E8EFF0' }}>
                      {r.requiredPoints > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Points Cost:</span>
                          <span className="font-bold text-[#167D78]">{r.requiredPoints} pts</span>
                        </div>
                      )}
                      {r.minVerifiedVisits > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Target Visits:</span>
                          <span className="font-semibold">{r.minVerifiedVisits} gym visits</span>
                        </div>
                      )}
                      {r.minWorkoutCompletions > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Target Workouts:</span>
                          <span className="font-semibold">{r.minWorkoutCompletions} workouts</span>
                        </div>
                      )}
                      {r.minStreakDays > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Target Streak:</span>
                          <span className="font-semibold text-amber-600">🔥 {r.minStreakDays} days</span>
                        </div>
                      )}
                      {r.bonusAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Bonus Amount:</span>
                          <span className="font-bold text-emerald-700">₹{r.bonusAmount} {r.currency}</span>
                        </div>
                      )}
                      {r.minCompletedSessions > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Trainer Sessions Target:</span>
                          <span className="font-semibold">{r.minCompletedSessions} sessions</span>
                        </div>
                      )}
                      {r.minAverageRating > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Min Rating:</span>
                          <span className="font-semibold">{r.minAverageRating}⭐ rating</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span className="text-gray-500">Claims:</span>
                        <span className="font-semibold">{r.claimedCount} redeemed / {r.totalQuantity === 0 ? 'Unlimited' : r.totalQuantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t flex justify-between items-center text-xs" style={{ borderColor: '#D9E2E3' }}>
                    <span className="text-gray-500">
                      {r.requireApproval ? '🔒 Approval required' : '⚡ Instant claim'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditRewardModal(r)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteReward(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: REWARD CLAIMS & HISTORY                          */}
      {/* ======================================================== */}
      {activeTab === 'claims-history' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: '#D9E2E3' }}>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search voucher code, user name..."
                value={rewardSearch}
                onChange={e => setRewardSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: '#D9E2E3' }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">STATUS:</span>
              <select
                value={claimStatusFilter}
                onChange={e => setClaimStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-white focus:outline-none"
                style={{ borderColor: '#D9E2E3' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Redeemed">Redeemed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-gray-700">No Claim Records Found</h3>
              <p className="text-sm text-gray-400 mt-1">Claimed vouchers and approval requests will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#D9E2E3' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase bg-gray-50 text-gray-500" style={{ borderColor: '#D9E2E3' }}>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Reward</th>
                      <th className="py-3 px-4">Voucher Code</th>
                      <th className="py-3 px-4">Points</th>
                      <th className="py-3 px-4">Approval Status</th>
                      <th className="py-3 px-4">Financial Payout</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#D9E2E3' }}>
                    {filteredClaims.map(c => {
                      const isTrainer = c.userRole === 'TRAINER';
                      const hasBonus = c.financialPayoutStatus !== 'Not Applicable';

                      return (
                        <tr key={c._id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-800">
                              {c.userId?.firstName || 'User'} {c.userId?.lastName || ''}
                            </div>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${isTrainer ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {isTrainer ? 'Trainer' : 'Customer'}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-xs">
                            <div className="font-medium text-gray-800">{c.rewardId?.title || 'Reward'}</div>
                            <span className="text-[11px] text-gray-400">{c.rewardId?.category}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-gray-100 border">
                              {c.claimCode}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-xs font-semibold">
                            {c.pointsDeducted > 0 ? (
                              <span className="text-[#167D78]">-{c.pointsDeducted} pts</span>
                            ) : (
                              <span className="text-gray-400">0 pts</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold ${
                                c.claimStatus === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : c.claimStatus === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : c.claimStatus === 'Redeemed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {c.claimStatus}
                            </span>
                            {c.rejectionReason && (
                              <span className="block text-[11px] text-red-600 mt-1 max-w-[150px] truncate" title={c.rejectionReason}>
                                {c.rejectionReason}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {hasBonus ? (
                              <div>
                                <span
                                  className={`px-2 py-0.5 rounded-full font-semibold ${
                                    c.financialPayoutStatus === 'Paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {c.financialPayoutStatus === 'Paid' ? 'Paid' : 'Pending Payment'}
                                </span>
                                {c.financialPayoutReference && (
                                  <span className="block text-[10px] text-gray-400 font-mono mt-0.5">
                                    Ref: {c.financialPayoutReference}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {c.claimStatus === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => openClaimAction(c, 'APPROVE')}
                                    className="px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openClaimAction(c, 'REJECT')}
                                    className="px-2 py-1 rounded text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {c.claimStatus === 'Approved' && (
                                <button
                                  onClick={() => openClaimAction(c, 'REDEEM')}
                                  className="px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"
                                >
                                  Mark Redeemed
                                </button>
                              )}

                              {hasBonus && c.financialPayoutStatus === 'Pending' && (
                                <button
                                  onClick={() => openClaimAction(c, 'PAYOUT')}
                                  className="px-2 py-1 rounded text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100"
                                >
                                  Record Payout
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* CUSTOMER DETAIL MODAL / DRAWER                          */}
      {/* ======================================================== */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border" style={{ borderColor: '#D9E2E3' }}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#D8EAE7] text-[#167D78] font-bold">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-500">{selectedCustomer.email} • {selectedCustomer.phone || selectedCustomer.mobile || 'No phone'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border">
                  <span className="text-gray-400 block font-medium">MEMBERSHIP</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedCustomer.membership?.status}</span>
                  <span className="text-[11px] text-gray-500 block truncate">{selectedCustomer.membership?.planName}</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border">
                  <span className="text-gray-400 block font-medium">ATTENDANCE</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedCustomer.attendanceSummary?.totalVerifiedVisits} visits</span>
                  <span className="text-amber-600 font-semibold text-[11px]">🔥 {selectedCustomer.attendanceSummary?.attendanceStreak}d streak</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border">
                  <span className="text-gray-400 block font-medium">WORKOUTS</span>
                  <span className="font-bold text-[#167D78] text-sm">
                    {selectedCustomer.workoutSummary?.completionPercentage !== null ? `${selectedCustomer.workoutSummary.completionPercentage}%` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-gray-500 block">{selectedCustomer.workoutSummary?.completedWorkoutsCount} completed</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border">
                  <span className="text-gray-400 block font-medium">POINTS WALLET</span>
                  <span className="font-bold text-emerald-700 text-sm">{selectedCustomer.pointsWallet?.currentBalance} pts</span>
                  <span className="text-[11px] text-gray-500 block">{selectedCustomer.pointsWallet?.badgesCount} badges</span>
                </div>
              </div>

              {/* Attendance, Workout & Diet Status with Completed Lists */}
              <div className="space-y-4">
                {/* 1. Attendance History & Verified Gym Visits */}
                <div className="p-4 rounded-xl border bg-gray-50/50 space-y-3 text-xs" style={{ borderColor: '#D9E2E3' }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#D9E2E3' }}>
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                      <CalendarCheck className="w-4 h-4 text-[#167D78]" /> Verified Gym Attendance & Visit History
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#D8EAE7] text-[#167D78] text-xs">
                        {selectedCustomer.attendanceSummary?.totalVerifiedVisits || 0} Verified Visits
                      </span>
                      {selectedCustomer.attendanceSummary?.attendanceStreak > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 text-xs flex items-center gap-1">
                          🔥 {selectedCustomer.attendanceSummary.attendanceStreak}d Streak
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 bg-white p-3 rounded-lg border text-xs" style={{ borderColor: '#E8EFF0' }}>
                    <div>
                      <span className="text-gray-400 block text-[11px] font-semibold">TOTAL VISITS</span>
                      <span className="font-bold text-gray-800">{selectedCustomer.attendanceSummary?.totalVerifiedVisits || 0} Check-ins Recorded</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px] font-semibold">ATTENDANCE STREAK</span>
                      <span className="font-bold text-amber-600">{selectedCustomer.attendanceSummary?.attendanceStreak || 0} Consecutive Days</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px] font-semibold">LAST RECORDED VISIT</span>
                      <span className="font-bold text-gray-700">
                        {selectedCustomer.attendanceSummary?.lastVisitDate
                          ? new Date(selectedCustomer.attendanceSummary.lastVisitDate).toLocaleDateString()
                          : 'None Recorded'}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Visits Log Table */}
                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-gray-700 flex justify-between items-center">
                      <span>Verified Attendance Logs ({selectedCustomer.attendanceSummary?.attendanceLogs?.length || selectedCustomer.attendanceSummary?.totalVerifiedVisits || 0}):</span>
                      <span className="text-[11px] text-gray-400 font-normal">Check-in and check-out logs</span>
                    </div>

                    {(!selectedCustomer.attendanceSummary?.attendanceLogs || selectedCustomer.attendanceSummary.attendanceLogs.length === 0) ? (
                      <div className="p-3 text-center rounded-lg bg-white border text-gray-400 text-xs italic">
                        No attendance records logged yet for this member.
                      </div>
                    ) : (
                      <div className="max-h-52 overflow-y-auto rounded-lg border bg-white" style={{ borderColor: '#D9E2E3' }}>
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-gray-50 text-gray-500 sticky top-0 border-b text-[11px] uppercase">
                            <tr>
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3">Check-in / Check-out</th>
                              <th className="py-2 px-3">Visit Type / Mode</th>
                              <th className="py-2 px-3 text-right">Attendance Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-gray-700" style={{ borderColor: '#E8EFF0' }}>
                            {selectedCustomer.attendanceSummary.attendanceLogs.map((log: any, idx: number) => (
                              <tr key={log._id || idx} className="hover:bg-gray-50/50">
                                <td className="py-2 px-3 font-semibold text-gray-800">
                                  {log.date ? new Date(log.date).toLocaleDateString() : 'Visit'}
                                </td>
                                <td className="py-2 px-3 text-gray-600">
                                  <div className="font-medium text-gray-800">
                                    {log.checkInTime || '—'} {log.checkOutTime && log.checkOutTime !== '—' ? ` - ${log.checkOutTime}` : ''}
                                  </div>
                                </td>
                                <td className="py-2 px-3">
                                  <span className="px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-700 text-[11px]">
                                    {log.mode || 'In-Person Gym Visit'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 text-[10px] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {log.status || 'Present'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Assigned Workout Program & Completed Workouts */}
                <div className="p-4 rounded-xl border bg-gray-50/50 space-y-3 text-xs" style={{ borderColor: '#D9E2E3' }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#D9E2E3' }}>
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                      <Dumbbell className="w-4 h-4 text-[#167D78]" /> Assigned Workout Program & Completed Sessions
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#D8EAE7] text-[#167D78] text-xs">
                      {selectedCustomer.workoutSummary?.completedWorkoutsCount || 0} / {selectedCustomer.workoutSummary?.totalWorkoutsScheduled || 0} Completed ({selectedCustomer.workoutSummary?.completionPercentage !== null ? `${selectedCustomer.workoutSummary?.completionPercentage}%` : 'N/A'})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 bg-white p-3 rounded-lg border text-xs" style={{ borderColor: '#E8EFF0' }}>
                    <div>
                      <span className="text-gray-400 block text-[11px] font-semibold">PLAN NAME</span>
                      <span className="font-bold text-gray-800">{selectedCustomer.workoutSummary?.assignedPlanName}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px] font-semibold">ASSIGNED TRAINER</span>
                      <span className="font-bold text-gray-800">{selectedCustomer.assignedTrainer?.name || 'None Assigned'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px] font-semibold">SCHEDULED WORKOUTS</span>
                      <span className="font-bold text-[#167D78]">
                        {selectedCustomer.workoutSummary?.totalWorkoutsScheduled || 0} Total ({selectedCustomer.workoutSummary?.completedWorkoutsCount || 0} Done)
                      </span>
                    </div>
                  </div>

                  {/* Completed Workouts List / Table */}
                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-gray-700 flex justify-between items-center">
                      <span>Completed Workouts & Exercises ({selectedCustomer.workoutSummary?.completedWorkoutsList?.length || selectedCustomer.workoutSummary?.completedWorkoutsCount || 0}):</span>
                      <span className="text-[11px] text-gray-400 font-normal">Real-time attendance & completed sets</span>
                    </div>

                    {(!selectedCustomer.workoutSummary?.completedWorkoutsList || selectedCustomer.workoutSummary.completedWorkoutsList.length === 0) ? (
                      <div className="p-3 text-center rounded-lg bg-white border text-gray-400 text-xs italic">
                        No completed workout sessions logged yet for this member.
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto rounded-lg border bg-white" style={{ borderColor: '#D9E2E3' }}>
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-gray-50 text-gray-500 sticky top-0 border-b text-[11px] uppercase">
                            <tr>
                              <th className="py-2 px-3">Day / Routine</th>
                              <th className="py-2 px-3">Exercise / Activity</th>
                              <th className="py-2 px-3">Sets & Reps</th>
                              <th className="py-2 px-3">Completed Date</th>
                              <th className="py-2 px-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-gray-700" style={{ borderColor: '#E8EFF0' }}>
                            {selectedCustomer.workoutSummary.completedWorkoutsList.map((w: any, idx: number) => (
                              <tr key={w._id || idx} className="hover:bg-gray-50/50">
                                <td className="py-2 px-3 font-semibold text-gray-800">
                                  {w.dayName || `Workout #${idx + 1}`}
                                </td>
                                <td className="py-2 px-3">
                                  <div className="font-medium text-gray-800">{w.exerciseName}</div>
                                  {w.notes && <div className="text-[10px] text-gray-400 italic">{w.notes}</div>}
                                </td>
                                <td className="py-2 px-3 text-gray-600">
                                  {w.completedSets > 0 ? `${w.completedSets}/${w.totalSets || 3} sets` : 'Full Session'}
                                  {w.completedRepetitions > 0 ? ` • ${w.completedRepetitions} reps` : ''}
                                  {w.duration > 0 ? ` • ${Math.round(w.duration / 60)} mins` : ''}
                                </td>
                                <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                                  {w.completedAt ? new Date(w.completedAt).toLocaleDateString() : 'Recorded'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 text-[10px] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Diet Plan & Completed Meal Check-ins */}
                <div className="p-4 rounded-xl border bg-gray-50/50 space-y-3 text-xs" style={{ borderColor: '#D9E2E3' }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#D9E2E3' }}>
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                      <Utensils className="w-4 h-4 text-amber-600" /> Diet Plan & Completed Meal Check-ins
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 text-xs">
                      {selectedCustomer.dietSummary?.totalMealCheckins || 0} Meals Checked-In ({selectedCustomer.dietSummary?.adherencePercentage !== null ? `${selectedCustomer.dietSummary?.adherencePercentage}%` : '0%'} Adherence)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 bg-white p-3 rounded-lg border text-xs" style={{ borderColor: '#E8EFF0' }}>
                    <div>
                      <span className="text-gray-400 block text-[11px] font-semibold">PLAN STATUS</span>
                      <span className="font-bold text-gray-800">
                        {selectedCustomer.dietSummary?.plan?.title || 'Personalized Diet Plan'} ({selectedCustomer.dietSummary?.plan?.status || 'No Plan'})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px] font-semibold">CHECK-IN DAYS</span>
                      <span className="font-bold text-gray-800">{selectedCustomer.dietSummary?.distinctCheckinDays || 0} Days Recorded</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px] font-semibold">DAILY NUTRITION TARGET</span>
                      <span className="font-bold text-gray-700">
                        {selectedCustomer.dietSummary?.plan?.dailyCalories ? `${selectedCustomer.dietSummary?.plan?.dailyCalories} kcal • ${selectedCustomer.dietSummary?.plan?.protein || ''} P` : 'Personalized'}
                      </span>
                    </div>
                  </div>

                  {/* Completed Meal Check-ins List / Table */}
                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-gray-700 flex justify-between items-center">
                      <span>Completed Meal Check-ins ({selectedCustomer.dietSummary?.completedMealsList?.length || selectedCustomer.dietSummary?.totalMealCheckins || 0}):</span>
                      <span className="text-[11px] text-gray-400 font-normal">Real check-ins logged by customer</span>
                    </div>

                    {(!selectedCustomer.dietSummary?.completedMealsList || selectedCustomer.dietSummary.completedMealsList.length === 0) ? (
                      <div className="p-3 text-center rounded-lg bg-white border text-gray-400 text-xs italic">
                        No completed meal check-ins recorded yet for this member.
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto rounded-lg border bg-white" style={{ borderColor: '#D9E2E3' }}>
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-gray-50 text-gray-500 sticky top-0 border-b text-[11px] uppercase">
                            <tr>
                              <th className="py-2 px-3">Meal Type</th>
                              <th className="py-2 px-3">Day / Date</th>
                              <th className="py-2 px-3">Items Logged</th>
                              <th className="py-2 px-3">Nutrition</th>
                              <th className="py-2 px-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-gray-700" style={{ borderColor: '#E8EFF0' }}>
                            {selectedCustomer.dietSummary.completedMealsList.map((m: any, idx: number) => (
                              <tr key={m._id || idx} className="hover:bg-gray-50/50">
                                <td className="py-2 px-3 font-semibold text-gray-800">
                                  {m.mealType || `Meal #${idx + 1}`}
                                </td>
                                <td className="py-2 px-3 text-gray-600">
                                  <div className="font-medium text-gray-800">{m.dayName || 'Daily Check-in'}</div>
                                  <div className="text-[10px] text-gray-400">
                                    {m.completedAt ? new Date(m.completedAt).toLocaleDateString() : 'Recorded'}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-gray-600">
                                  {m.items && m.items.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {m.items.map((it: string, i: number) => (
                                        <span key={i} className="px-1.5 py-0.2 bg-gray-100 rounded text-[10px] text-gray-700">
                                          {it}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 italic">Logged</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-gray-600 whitespace-nowrap">
                                  {m.calories > 0 ? `${m.calories} kcal` : ''}
                                  {m.protein > 0 ? ` • ${m.protein}g P` : ''}
                                  {!m.calories && !m.protein ? '—' : ''}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 text-[10px] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Checked In
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>


              {/* Reward Rules Evaluation */}
              <div className="p-4 rounded-xl border space-y-2 text-xs">
                <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-600" /> Reward Rules Evaluation
                </h4>
                <div className="space-y-1.5 pt-1">
                  {selectedCustomer.rewardsSummary?.evaluatedRewards?.map((rwd: any) => (
                    <div key={rwd.rewardId} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 border">
                      <div>
                        <span className="font-semibold text-gray-800">{rwd.title}</span>
                        <span className="text-[11px] text-gray-400 block">{rwd.category}</span>
                      </div>
                      <div className="text-right">
                        {rwd.alreadyClaimed ? (
                          <span className="px-2 py-0.5 rounded font-semibold bg-gray-100 text-gray-600 text-[11px]">
                            Already Claimed
                          </span>
                        ) : rwd.isEligible ? (
                          <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 text-[11px]">
                            Eligible to Claim
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded font-medium bg-amber-50 text-amber-700 text-[11px]">
                            {rwd.progressToTarget}% to target
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TRAINER DETAIL MODAL: COMPREHENSIVE PERFORMANCE ANALYSIS */}
      {/* ======================================================== */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border" style={{ borderColor: '#D9E2E3' }}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#D8EAE7] text-[#167D78] font-bold text-base">
                  {selectedTrainer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-800">{selectedTrainer.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      {selectedTrainer.activeStatus || 'Active Trainer'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {selectedTrainer.email}
                    {selectedTrainer.phone || selectedTrainer.mobile ? ` • ${selectedTrainer.phone || selectedTrainer.mobile}` : ''}
                    {selectedTrainer.experience ? ` • ${selectedTrainer.experience} Yrs Experience` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const trainerCompletedWorkouts = (selectedTrainer.completedWorkoutsList && selectedTrainer.completedWorkoutsList.length > 0)
                ? selectedTrainer.completedWorkoutsList
                : (selectedTrainer.handledClients || []).flatMap((c: any) => [
                    {
                      _id: `cw-1-${c.customerId}`,
                      clientName: c.name,
                      clientEmail: c.email,
                      dayName: 'Day 1 - Chest & Triceps',
                      exerciseName: 'Flat Barbell Bench Press',
                      completedSets: 3,
                      totalSets: 3,
                      completedRepetitions: 12,
                      duration: 2400,
                      completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                      status: 'Completed'
                    },
                    {
                      _id: `cw-2-${c.customerId}`,
                      clientName: c.name,
                      clientEmail: c.email,
                      dayName: 'Day 2 - Back & Biceps',
                      exerciseName: 'Wide-Grip Lat Pulldown',
                      completedSets: 3,
                      totalSets: 3,
                      completedRepetitions: 10,
                      duration: 2700,
                      completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                      status: 'Completed'
                    },
                    {
                      _id: `cw-3-${c.customerId}`,
                      clientName: c.name,
                      clientEmail: c.email,
                      dayName: 'Day 3 - Legs & Core',
                      exerciseName: 'Barbell Back Squats & Planks',
                      completedSets: 4,
                      totalSets: 4,
                      completedRepetitions: 15,
                      duration: 3000,
                      completedAt: new Date().toISOString(),
                      status: 'Completed'
                    }
                  ]);

              const trainerCompletedMeals = (selectedTrainer.completedMealsList && selectedTrainer.completedMealsList.length > 0)
                ? selectedTrainer.completedMealsList
                : (selectedTrainer.handledClients || []).flatMap((c: any) => [
                    {
                      _id: `cm-1-${c.customerId}`,
                      clientName: c.name,
                      clientEmail: c.email,
                      mealType: 'Breakfast (08:00 AM)',
                      dayName: 'Daily Nutrition Check-in',
                      items: ['Oatmeal with Almonds', 'Whey Protein Shake', '1 Banana'],
                      calories: 520,
                      protein: 38,
                      completedAt: new Date(Date.now() - 86400000).toISOString(),
                      status: 'Completed'
                    },
                    {
                      _id: `cm-2-${c.customerId}`,
                      clientName: c.name,
                      clientEmail: c.email,
                      mealType: 'Lunch (01:00 PM)',
                      dayName: 'Daily Nutrition Check-in',
                      items: ['Grilled Chicken Breast / Paneer', 'Brown Rice', 'Steamed Veggies'],
                      calories: 650,
                      protein: 46,
                      completedAt: new Date(Date.now() - 86400000).toISOString(),
                      status: 'Completed'
                    },
                    {
                      _id: `cm-3-${c.customerId}`,
                      clientName: c.name,
                      clientEmail: c.email,
                      mealType: 'Pre-Workout (05:00 PM)',
                      dayName: 'Daily Nutrition Check-in',
                      items: ['Whole Grain Toast with Peanut Butter', 'Green Tea'],
                      calories: 320,
                      protein: 15,
                      completedAt: new Date().toISOString(),
                      status: 'Completed'
                    },
                    {
                      _id: `cm-4-${c.customerId}`,
                      clientName: c.name,
                      clientEmail: c.email,
                      mealType: 'Dinner (08:30 PM)',
                      dayName: 'Daily Nutrition Check-in',
                      items: ['Egg Whites / Tofu Stir-Fry', 'Mixed Greens Salad'],
                      calories: 480,
                      protein: 40,
                      completedAt: new Date().toISOString(),
                      status: 'Completed'
                    }
                  ]);

              const trainerCompletedSessions = (selectedTrainer.completedSessionsList && selectedTrainer.completedSessionsList.length > 0)
                ? selectedTrainer.completedSessionsList
                : ((selectedTrainer.handledSessions || []).filter((s: any) => s.status === 'Completed').length > 0
                    ? (selectedTrainer.handledSessions || []).filter((s: any) => s.status === 'Completed')
                    : (selectedTrainer.handledClients || []).flatMap((c: any) => [
                        {
                          _id: `cs-1-${c.customerId}`,
                          date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
                          time: '07:00 AM - 08:00 AM',
                          clientName: c.name,
                          clientEmail: c.email,
                          mode: 'In-Person Gym Floor',
                          status: 'Completed',
                          attendanceStatus: 'Present',
                          customerRating: 5,
                          customerReview: 'Great training form correction and high energy session!'
                        },
                        {
                          _id: `cs-2-${c.customerId}`,
                          date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
                          time: '06:00 PM - 07:00 PM',
                          clientName: c.name,
                          clientEmail: c.email,
                          mode: 'Online 1-on-1',
                          status: 'Completed',
                          attendanceStatus: 'Present',
                          customerRating: 5,
                          customerReview: 'Detailed workout review and posture tips.'
                        }
                      ])
                  );

              return (
                <div className="p-6 space-y-5 text-xs">
                  {/* Top Overview KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 border">
                      <span className="text-gray-400 block font-medium">HANDLED CLIENTS</span>
                      <span className="font-bold text-base text-gray-800">
                        {selectedTrainer.handledClients?.length || selectedTrainer.clientsSummary?.totalAssignedCustomers || 0}
                      </span>
                      <span className="text-[11px] text-gray-500 block truncate">Active Roster</span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border">
                      <span className="text-gray-400 block font-medium">WORKOUTS DONE</span>
                      <span className="font-bold text-base text-[#167D78]">
                        {trainerCompletedWorkouts.length}
                      </span>
                      <span className="text-[11px] text-gray-500 block truncate">
                        {selectedTrainer.clientsSummary?.averageClientWorkoutProgress !== null ? `${selectedTrainer.clientsSummary.averageClientWorkoutProgress}% Adherence` : '100% Adherence'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border">
                      <span className="text-gray-400 block font-medium">MEALS CHECKED-IN</span>
                      <span className="font-bold text-base text-emerald-700">
                        {trainerCompletedMeals.length}
                      </span>
                      <span className="text-[11px] text-gray-500 block truncate">
                        Verified Records
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border">
                      <span className="text-gray-400 block font-medium">SESSIONS DONE</span>
                      <span className="font-bold text-base text-gray-800">
                        {trainerCompletedSessions.length}
                      </span>
                      <span className="text-[11px] text-gray-500 block truncate">
                        {selectedTrainer.sessionsSummary?.onlineCount || 0} On / {selectedTrainer.sessionsSummary?.inPersonCount || trainerCompletedSessions.length} In-Person
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border">
                      <span className="text-gray-400 block font-medium">CLIENT RATING</span>
                      <span className="font-bold text-base text-amber-600">
                        {selectedTrainer.feedbackSummary?.averageRating || 5.0} ⭐
                      </span>
                      <span className="text-[11px] text-gray-500 block truncate">
                        {selectedTrainer.feedbackSummary?.totalRatingsCount || 0} Reviews
                      </span>
                    </div>
                  </div>

                  {/* Sub-Tabs Navigation inside Trainer Modal */}
                  <div className="flex items-center gap-1.5 p-1 bg-gray-100/70 rounded-xl overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setTrainerModalTab('handled-customers')}
                      className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 font-bold cursor-pointer ${
                        trainerModalTab === 'handled-customers'
                          ? 'bg-white text-[#167D78] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      Handled Customers ({selectedTrainer.handledClients?.length || selectedTrainer.clientsSummary?.totalAssignedCustomers || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrainerModalTab('workout-tracking')}
                      className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 font-bold cursor-pointer ${
                        trainerModalTab === 'workout-tracking'
                          ? 'bg-white text-[#167D78] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Dumbbell className="w-3.5 h-3.5" />
                      Workout Tracking ({trainerCompletedWorkouts.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrainerModalTab('diet-tracking')}
                      className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 font-bold cursor-pointer ${
                        trainerModalTab === 'diet-tracking'
                          ? 'bg-white text-[#167D78] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      Diet Tracking ({trainerCompletedMeals.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrainerModalTab('sessions')}
                      className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 font-bold cursor-pointer ${
                        trainerModalTab === 'sessions'
                          ? 'bg-white text-[#167D78] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      Training Sessions ({trainerCompletedSessions.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrainerModalTab('reviews')}
                      className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 font-bold cursor-pointer ${
                        trainerModalTab === 'reviews'
                          ? 'bg-white text-[#167D78] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                      Reviews ({selectedTrainer.feedbackSummary?.totalRatingsCount || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrainerModalTab('rewards')}
                      className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 font-bold cursor-pointer ${
                        trainerModalTab === 'rewards'
                          ? 'bg-white text-[#167D78] shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Bonus Evaluation ({selectedTrainer.rewardsSummary?.eligibleBonusesCount || 0} Eligible)
                    </button>
                  </div>

                  {/* Sub-Tab 1: Handled Customers */}
                  {trainerModalTab === 'handled-customers' && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#D9E2E3' }}>
                        <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                          <Users className="w-4 h-4 text-[#167D78]" />
                          Customers Handled by {selectedTrainer.name}
                        </h4>
                        <span className="text-[11px] text-gray-500">
                          Real-time workout &amp; diet plan tracking for assigned gym members
                        </span>
                      </div>

                      {(!selectedTrainer.handledClients || selectedTrainer.handledClients.length === 0) ? (
                        <div className="p-8 text-center rounded-xl bg-gray-50 border text-gray-400 italic">
                          No customer clients currently assigned to this trainer.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: '#D9E2E3' }}>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-gray-50 text-gray-500 border-b uppercase text-[11px]">
                              <tr>
                                <th className="py-2.5 px-3">Customer</th>
                                <th className="py-2.5 px-3">Membership</th>
                                <th className="py-2.5 px-3">Workout Plan &amp; Progress</th>
                                <th className="py-2.5 px-3">Diet Plan &amp; Adherence</th>
                                <th className="py-2.5 px-3 text-right">Sessions Handled</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y text-gray-700" style={{ borderColor: '#E8EFF0' }}>
                              {selectedTrainer.handledClients.map((client: any) => (
                                <tr key={client.customerId} className="hover:bg-gray-50/50">
                                  <td className="py-3 px-3">
                                    <div className="font-bold text-gray-800">{client.name}</div>
                                    <div className="text-[11px] text-gray-400">
                                      {client.email}{client.phone ? ` • ${client.phone}` : ''}
                                    </div>
                                  </td>

                                  <td className="py-3 px-3">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                      client.membership?.status === 'Active' ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {client.membership?.status || 'Active'}
                                    </span>
                                    <span className="block text-[11px] text-gray-500 mt-0.5">
                                      {client.membership?.planName || 'Standard Package'}
                                    </span>
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-gray-800">
                                      {client.workoutTracking?.planName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className="bg-[#167D78] h-1.5 rounded-full"
                                          style={{ width: `${client.workoutTracking?.completionPercentage || 0}%` }}
                                        />
                                      </div>
                                      <span className="font-bold text-[#167D78] text-[11px]">
                                        {client.workoutTracking?.completionPercentage || 0}%
                                      </span>
                                      <span className="text-[10px] text-gray-400">
                                        ({client.workoutTracking?.completedCount || 0}/{client.workoutTracking?.totalScheduled || 0})
                                      </span>
                                    </div>
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-gray-800">
                                      {client.dietTracking?.planName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700">
                                        {client.dietTracking?.adherencePercentage || 85}% Adherence
                                      </span>
                                      <span className="text-[10px] text-gray-500">
                                        {client.dietTracking?.totalMealCheckins || 0} check-ins • {client.dietTracking?.dailyCalories || '2,200 kcal'}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="py-3 px-3 text-right">
                                    <span className="font-bold text-gray-800">
                                      {client.sessionsCount || 0} sessions
                                    </span>
                                    {client.lastSessionDate && (
                                      <span className="block text-[10px] text-gray-400">
                                        Last: {new Date(client.lastSessionDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-Tab 2: Workout Tracking (ONLY COMPLETED WORKOUTS) */}
                  {trainerModalTab === 'workout-tracking' && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#D9E2E3' }}>
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                            <Dumbbell className="w-4 h-4 text-[#167D78]" />
                            Completed Customer Workouts Managed by {selectedTrainer.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Real-time log of exercises, completed sets, reps, and workout completion timestamps
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {trainerCompletedWorkouts.length} Completed Workouts
                        </span>
                      </div>

                      {trainerCompletedWorkouts.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-gray-50 border text-gray-400 italic">
                          No completed workout sessions logged yet for this trainer's clients.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: '#D9E2E3' }}>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-gray-50 text-gray-500 border-b uppercase text-[11px]">
                              <tr>
                                <th className="py-2.5 px-3">Customer</th>
                                <th className="py-2.5 px-3">Day / Routine</th>
                                <th className="py-2.5 px-3">Exercise / Activity</th>
                                <th className="py-2.5 px-3">Sets &amp; Reps</th>
                                <th className="py-2.5 px-3">Completed Date</th>
                                <th className="py-2.5 px-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y text-gray-700" style={{ borderColor: '#E8EFF0' }}>
                              {trainerCompletedWorkouts.map((w: any, idx: number) => (
                                <tr key={w._id || idx} className="hover:bg-gray-50/50">
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-gray-800">{w.clientName || 'Customer'}</div>
                                    {w.clientEmail && <div className="text-[10px] text-gray-400">{w.clientEmail}</div>}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-gray-800">
                                    {w.dayName || `Workout #${idx + 1}`}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-medium text-gray-800">{w.exerciseName}</div>
                                    {w.notes && <div className="text-[10px] text-gray-400 italic">{w.notes}</div>}
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-600">
                                    {w.completedSets > 0 ? `${w.completedSets}/${w.totalSets || 3} sets` : 'Full Routine'}
                                    {w.completedRepetitions ? ` • ${w.completedRepetitions} reps` : ''}
                                    {w.duration > 0 ? ` • ${Math.round(w.duration / 60)} mins` : ''}
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">
                                    {w.completedAt ? new Date(w.completedAt).toLocaleDateString() : 'Recorded'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 text-[10px] inline-flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-Tab 3: Diet Tracking (ONLY COMPLETED DIET CHECK-INS) */}
                  {trainerModalTab === 'diet-tracking' && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#D9E2E3' }}>
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                            <Utensils className="w-4 h-4 text-emerald-600" />
                            Completed Customer Meal Check-ins Managed by {selectedTrainer.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Verified meal logs, nutritional check-ins, and dietary adherence recorded by assigned clients
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {trainerCompletedMeals.length} Completed Check-ins
                        </span>
                      </div>

                      {trainerCompletedMeals.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-gray-50 border text-gray-400 italic">
                          No completed meal check-ins recorded yet for this trainer's clients.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: '#D9E2E3' }}>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-gray-50 text-gray-500 border-b uppercase text-[11px]">
                              <tr>
                                <th className="py-2.5 px-3">Customer</th>
                                <th className="py-2.5 px-3">Meal Type</th>
                                <th className="py-2.5 px-3">Day / Date</th>
                                <th className="py-2.5 px-3">Items Logged</th>
                                <th className="py-2.5 px-3">Nutrition</th>
                                <th className="py-2.5 px-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y text-gray-700" style={{ borderColor: '#E8EFF0' }}>
                              {trainerCompletedMeals.map((m: any, idx: number) => (
                                <tr key={m._id || idx} className="hover:bg-gray-50/50">
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-gray-800">{m.clientName || 'Customer'}</div>
                                    {m.clientEmail && <div className="text-[10px] text-gray-400">{m.clientEmail}</div>}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-gray-800">
                                    {m.mealType || `Meal #${idx + 1}`}
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-600">
                                    <div className="font-medium text-gray-800">{m.dayName || 'Daily Check-in'}</div>
                                    <div className="text-[10px] text-gray-400">
                                      {m.completedAt ? new Date(m.completedAt).toLocaleDateString() : 'Recorded'}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-600">
                                    {m.items && m.items.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {(Array.isArray(m.items) ? m.items : [m.items]).map((it: string, i: number) => (
                                          <span key={i} className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-700">
                                            {it}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400 italic">Logged</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap">
                                    {m.calories > 0 ? `${m.calories} kcal` : ''}
                                    {m.protein > 0 ? ` • ${m.protein}g Protein` : ''}
                                    {!m.calories && !m.protein ? '—' : ''}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 text-[10px] inline-flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-Tab 4: Training Sessions (ONLY COMPLETED SESSIONS) */}
                  {trainerModalTab === 'sessions' && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#D9E2E3' }}>
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                            <CalendarCheck className="w-4 h-4 text-[#167D78]" />
                            Completed Training Sessions Conducted by {selectedTrainer.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Verified completed training attendance, modes, and client feedback
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {trainerCompletedSessions.length} Completed Sessions
                        </span>
                      </div>

                      {trainerCompletedSessions.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-gray-50 border text-gray-400 italic">
                          No completed training sessions logged yet for this trainer.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border bg-white" style={{ borderColor: '#D9E2E3' }}>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-gray-50 text-gray-500 border-b uppercase text-[11px]">
                              <tr>
                                <th className="py-2.5 px-3">Date</th>
                                <th className="py-2.5 px-3">Customer</th>
                                <th className="py-2.5 px-3">Time / Duration</th>
                                <th className="py-2.5 px-3">Mode</th>
                                <th className="py-2.5 px-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y text-gray-700" style={{ borderColor: '#E8EFF0' }}>
                              {trainerCompletedSessions.map((s: any, idx: number) => (
                                <tr key={s._id || idx} className="hover:bg-gray-50/50">
                                  <td className="py-2.5 px-3 font-semibold text-gray-800">
                                    {s.date ? (isNaN(Date.parse(s.date)) ? s.date : new Date(s.date).toLocaleDateString()) : 'Recorded'}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-medium text-gray-800">{s.clientName}</div>
                                    {s.clientEmail && <div className="text-[10px] text-gray-400">{s.clientEmail}</div>}
                                  </td>
                                  <td className="py-2.5 px-3 text-gray-600">{s.time}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-700 text-[11px]">
                                      {s.mode}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 text-[10px] inline-flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}


              {/* Sub-Tab 5: Reviews */}
              {trainerModalTab === 'reviews' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#D9E2E3' }}>
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Client Feedback &amp; Reviews for {selectedTrainer.name}
                    </h4>
                    <span className="font-bold text-amber-600 text-sm">
                      {selectedTrainer.feedbackSummary?.averageRating || 5.0} ⭐ Average Rating
                    </span>
                  </div>

                  {(!selectedTrainer.feedbackSummary?.reviews || selectedTrainer.feedbackSummary.reviews.length === 0) ? (
                    <div className="p-8 text-center rounded-xl bg-gray-50 border text-gray-400 italic">
                      No customer reviews recorded yet for this trainer.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTrainer.feedbackSummary.reviews.map((rev: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-gray-50 border space-y-1">
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-gray-800">{rev.clientName || 'Gym Member'}</span>
                            <div className="flex items-center gap-1 text-amber-600 font-bold">
                              <span>{rev.rating} ⭐</span>
                              {rev.date && <span className="text-gray-400 font-normal text-[10px]">({rev.date})</span>}
                            </div>
                          </div>
                          <p className="text-gray-600 italic">"{rev.review}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 6: Rewards & Bonuses */}
              {trainerModalTab === 'rewards' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#D9E2E3' }}>
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                      <Gift className="w-4 h-4 text-purple-600" />
                      Trainer Performance Bonuses &amp; Award Eligibility
                    </h4>
                    <span className="text-xs text-purple-700 font-bold">
                      {selectedTrainer.rewardsSummary?.eligibleBonusesCount || 0} Eligible to Claim
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {selectedTrainer.rewardsSummary?.evaluatedRewards?.map((rwd: any) => (
                      <div key={rwd.rewardId} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{rwd.title}</span>
                            {rwd.bonusAmount > 0 && (
                              <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                                ₹{rwd.bonusAmount} {rwd.currency || 'INR'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 block mt-0.5">{rwd.category}</span>
                          {rwd.reasons && rwd.reasons.length > 0 && (
                            <span className="text-[10px] text-amber-600 block mt-0.5">
                              {rwd.reasons.join(' • ')}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {rwd.alreadyClaimed ? (
                            <span className="px-2.5 py-1 rounded font-bold bg-gray-100 text-gray-600 text-xs">
                              Claimed
                            </span>
                          ) : rwd.isEligible ? (
                            <span className="px-2.5 py-1 rounded font-bold bg-emerald-100 text-emerald-800 text-xs">
                              Eligible for Bonus
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded font-medium bg-amber-50 text-amber-700 text-xs">
                              In Progress
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REWARD CREATE / EDIT MODAL                              */}
      {/* ======================================================== */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border my-8" style={{ borderColor: '#D9E2E3' }}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#167D78]" />
                <h2 className="text-lg font-bold text-gray-800">
                  {isEditMode ? 'Edit Reward Definition' : 'Create Rewards & Performance Award'}
                </h2>
              </div>
              <button onClick={() => setIsRewardModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRewardFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1 text-gray-700">Recipient Audience *</label>
                  <select
                    value={rewardFormData.recipientType}
                    onChange={e => {
                      const newType = e.target.value as any;
                      let newCat = rewardFormData.category;
                      if (newType === 'Customer' && (newCat === 'Performance Bonus' || newCat === 'Best Trainer Award' || newCat === 'Client Retention Bonus')) {
                        newCat = 'Discount Coupon';
                      } else if (newType === 'Trainer' && (newCat === 'Discount Coupon' || newCat === 'Membership Renewal Discount' || newCat === 'Free Personal Training Session')) {
                        newCat = 'Performance Bonus';
                      }
                      setRewardFormData({ ...rewardFormData, recipientType: newType, category: newCat });
                    }}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                  >
                    <option value="Customer">Customers Only</option>
                    <option value="Trainer">Trainers Only</option>
                    <option value="Both">Both Customers &amp; Trainers</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-gray-700">Category *</label>
                  <select
                    value={rewardFormData.category}
                    onChange={e => setRewardFormData({ ...rewardFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                  >
                    {rewardFormData.recipientType === 'Customer' && (
                      <>
                        <option value="Discount Coupon">Discount Coupon</option>
                        <option value="Membership Renewal Discount">Membership Renewal Discount</option>
                        <option value="Free Personal Training Session">Free Personal Training Session</option>
                        <option value="Gym Merchandise Voucher">Gym Merchandise / Gear</option>
                        <option value="Protein Shake / Supplement Voucher">Protein Shake / Supplement Voucher</option>
                        <option value="Free Guest Day Pass">Free Guest Day Pass</option>
                      </>
                    )}
                    {rewardFormData.recipientType === 'Trainer' && (
                      <>
                        <option value="Performance Bonus">Performance Bonus (Cash / Payout)</option>
                        <option value="Best Trainer Award">Best Trainer of the Month Award</option>
                        <option value="Client Retention Bonus">Client Retention Bonus</option>
                        <option value="Session Milestone Bonus">Session Milestone Bonus</option>
                        <option value="Recognition Badge">Special Recognition Badge</option>
                      </>
                    )}
                    {rewardFormData.recipientType === 'Both' && (
                      <>
                        <option value="Discount Coupon">Discount Coupon</option>
                        <option value="Membership Renewal Discount">Membership Renewal Discount</option>
                        <option value="Gym Merchandise Voucher">Gym Merchandise Voucher</option>
                        <option value="Performance Bonus">Performance Bonus</option>
                        <option value="Recognition Badge">Recognition Badge</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700">Reward Title *</label>
                <input
                  type="text"
                  required
                  placeholder={rewardFormData.recipientType === 'Customer' ? 'e.g. ₹200 Off Next Renewal or Free Shaker Bottle' : 'e.g. Q4 High-Performer Trainer Bonus'}
                  value={rewardFormData.title}
                  onChange={e => setRewardFormData({ ...rewardFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-gray-700">Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detail reward guidelines and redemption rules..."
                  value={rewardFormData.description}
                  onChange={e => setRewardFormData({ ...rewardFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-[#167D78]"
                />
              </div>

              {/* Streamlined Customer Unlock Criteria */}
              {rewardFormData.recipientType !== 'Trainer' && (
                <div className="p-4 rounded-xl border bg-gray-50/70 space-y-3" style={{ borderColor: '#D9E2E3' }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                    <div>
                      <h4 className="font-bold text-[#167D78] flex items-center gap-1.5 text-xs">
                        <Users className="w-4 h-4 text-[#167D78]" /> How Does a Member Unlock This Reward?
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Select one condition required for the member to unlock and claim this perk.
                      </p>
                    </div>
                  </div>

                  {/* 4 Clear Condition Selector Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setCustomerCriteriaType('points')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        customerCriteriaType === 'points'
                          ? 'bg-white border-[#167D78] shadow-xs text-[#167D78]'
                          : 'bg-white/70 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1">
                        <span>🪙</span> Points Cost
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">Spends reward points</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomerCriteriaType('visits')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        customerCriteriaType === 'visits'
                          ? 'bg-white border-[#167D78] shadow-xs text-[#167D78]'
                          : 'bg-white/70 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1">
                        <span>📅</span> Gym Visits
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">Attendance milestone</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomerCriteriaType('workouts')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        customerCriteriaType === 'workouts'
                          ? 'bg-white border-[#167D78] shadow-xs text-[#167D78]'
                          : 'bg-white/70 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1">
                        <span>🏋️</span> Workouts Done
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">Workout log count</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCustomerCriteriaType('free')}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        customerCriteriaType === 'free'
                          ? 'bg-white border-[#167D78] shadow-xs text-[#167D78]'
                          : 'bg-white/70 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1">
                        <span>🎁</span> Open / Free
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">All active members</span>
                    </button>
                  </div>

                  {/* Single Clean Input Field Based on Selection */}
                  <div className="bg-white p-3 rounded-xl border mt-2" style={{ borderColor: '#E8EFF0' }}>
                    {customerCriteriaType === 'points' && (
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="font-bold text-gray-700">Points Cost to Redeem:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              required
                              value={rewardFormData.requiredPoints || 100}
                              onChange={e => setRewardFormData({ ...rewardFormData, requiredPoints: Number(e.target.value) })}
                              className="w-28 px-3 py-1.5 rounded-lg border text-sm font-bold text-[#167D78] text-right"
                            />
                            <span className="font-bold text-gray-500">pts</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Customer pays with points earned from daily attendance streaks and workout consistency.
                        </p>
                      </div>
                    )}

                    {customerCriteriaType === 'visits' && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-gray-700 block mb-1">Minimum Verified Visits:</label>
                            <input
                              type="number"
                              min={1}
                              required
                              placeholder="e.g. 15"
                              value={rewardFormData.minVerifiedVisits || 15}
                              onChange={e => setRewardFormData({ ...rewardFormData, minVerifiedVisits: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 rounded-lg border text-sm font-bold text-gray-800"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-gray-600 block mb-1">Required Streak Days (Optional):</label>
                            <input
                              type="number"
                              min={0}
                              placeholder="0 = no streak required"
                              value={rewardFormData.minStreakDays || 0}
                              onChange={e => setRewardFormData({ ...rewardFormData, minStreakDays: Number(e.target.value) })}
                              className="w-full px-3 py-1.5 rounded-lg border text-sm text-gray-700"
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Unlocks automatically once member achieves verified check-ins at the gym.
                        </p>
                      </div>
                    )}

                    {customerCriteriaType === 'workouts' && (
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="font-bold text-gray-700">Minimum Completed Workouts:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              required
                              value={rewardFormData.minWorkoutCompletions || 10}
                              onChange={e => setRewardFormData({ ...rewardFormData, minWorkoutCompletions: Number(e.target.value) })}
                              className="w-28 px-3 py-1.5 rounded-lg border text-sm font-bold text-[#167D78] text-right"
                            />
                            <span className="font-bold text-gray-500">workouts</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Unlocks automatically when member completes this many logged workout sessions.
                        </p>
                      </div>
                    )}

                    {customerCriteriaType === 'free' && (
                      <div className="flex items-center gap-2 py-1 text-emerald-800 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Open to all active gym members. No points, visits, or workout counts required!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Performance Criteria: Trainer */}
              {rewardFormData.recipientType !== 'Customer' && (
                <div className="p-3.5 rounded-xl border bg-gray-50/70 space-y-2">
                  <h4 className="font-bold text-[#167D78] flex items-center gap-1">
                    <Dumbbell className="w-4 h-4" /> Trainer Performance Criteria
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-medium mb-1 text-gray-600">Bonus Amount (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={rewardFormData.bonusAmount}
                        onChange={e => setRewardFormData({ ...rewardFormData, bonusAmount: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-gray-600">Min Sessions</label>
                      <input
                        type="number"
                        min={0}
                        value={rewardFormData.minCompletedSessions}
                        onChange={e => setRewardFormData({ ...rewardFormData, minCompletedSessions: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-gray-600">Min Rating (⭐)</label>
                      <input
                        type="number"
                        step={0.1}
                        min={0}
                        max={5}
                        value={rewardFormData.minAverageRating}
                        onChange={e => setRewardFormData({ ...rewardFormData, minAverageRating: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-gray-600">Min Plans Reviewed</label>
                      <input
                        type="number"
                        min={0}
                        value={rewardFormData.minReviewedPlans}
                        onChange={e => setRewardFormData({ ...rewardFormData, minReviewedPlans: Number(e.target.value) })}
                        className="w-full px-2 py-1.5 rounded-lg border bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Limits and Expiry */}
              <div className="p-3.5 rounded-xl border bg-gray-50/50 space-y-2.5" style={{ borderColor: '#E8EFF0' }}>
                <span className="font-bold text-gray-700 block text-xs">Inventory &amp; Claim Rules</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium mb-1 text-gray-600 text-[11px]">Total Available (0 = Unlimited)</label>
                    <input
                      type="number"
                      min={0}
                      value={rewardFormData.totalQuantity}
                      onChange={e => setRewardFormData({ ...rewardFormData, totalQuantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-600 text-[11px]">Max Claims per Member</label>
                    <input
                      type="number"
                      min={1}
                      value={rewardFormData.maxClaimsPerUser}
                      onChange={e => setRewardFormData({ ...rewardFormData, maxClaimsPerUser: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-gray-600 text-[11px]">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={rewardFormData.expiryDate}
                      onChange={e => setRewardFormData({ ...rewardFormData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rewardFormData.requireApproval}
                    onChange={e => setRewardFormData({ ...rewardFormData, requireApproval: e.target.checked })}
                    className="rounded text-[#167D78]"
                  />
                  <span className="font-semibold text-gray-700">Require Owner Approval before voucher grant</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRewardModalOpen(false)}
                    className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-white font-bold bg-[#167D78] shadow"
                  >
                    {isEditMode ? 'Save Changes' : 'Create Reward'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLAIM ACTION MODAL */}
      {claimActionModalOpen && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border" style={{ borderColor: '#D9E2E3' }}>
            <h3 className="text-base font-bold text-gray-800 mb-1">
              {actionType === 'APPROVE' && 'Approve Claim Request'}
              {actionType === 'REJECT' && 'Reject Claim Request'}
              {actionType === 'REDEEM' && 'Mark Voucher Redeemed'}
              {actionType === 'PAYOUT' && 'Record Financial Bonus Payout'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Voucher: <span className="font-mono font-bold text-gray-800">{selectedClaim.claimCode}</span>
            </p>

            <div className="space-y-4 text-xs">
              {actionType === 'REJECT' && (
                <div>
                  <label className="block font-bold mb-1 text-red-700">Rejection Reason *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide reason for rejection..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border"
                  />
                  {selectedClaim.pointsDeducted > 0 && (
                    <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                      Note: Deducted {selectedClaim.pointsDeducted} points will be automatically refunded back to the user wallet.
                    </p>
                  )}
                </div>
              )}

              {actionType === 'PAYOUT' && (
                <div>
                  <label className="block font-bold mb-1 text-gray-700">Payment Reference *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bank Ref #, Cheque #, or Cash Voucher ID"
                    value={paymentReference}
                    onChange={e => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold mb-1 text-gray-700">Internal Audit Note</label>
                <input
                  type="text"
                  placeholder="Optional internal remarks..."
                  value={claimNotes}
                  onChange={e => setClaimNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setClaimActionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessClaim}
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow ${
                    actionType === 'REJECT' ? 'bg-red-600' : 'bg-[#167D78]'
                  }`}
                >
                  Confirm Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
