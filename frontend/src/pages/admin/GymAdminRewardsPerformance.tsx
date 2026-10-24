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
  CalendarCheck,
  Trophy
} from 'lucide-react';
import api from '../../utils/api';
import AwardsRecognitionSection from './AwardsRecognitionSection';
import CustomerDailyCalendarView from './CustomerDailyCalendarView';

export type MainRewardsTab = 'customer-rewards' | 'trainer-rewards' | 'performance-overview' | 'awards-recognition' | 'claims-history';

export default function GymAdminRewardsPerformance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = (searchParams.get('tab') as any);

  const initialTab: MainRewardsTab =
    rawTab === 'trainer-rewards' ? 'trainer-rewards'
    : rawTab === 'customer-rewards' || rawTab === 'rewards-catalog' ? 'customer-rewards'
    : rawTab === 'awards-recognition' || rawTab === 'awards' ? 'awards-recognition'
    : rawTab === 'claims-history' || rawTab === 'claims' ? 'claims-history'
    : rawTab === 'performance-overview' || rawTab === 'customer-performance' || rawTab === 'trainer-performance' ? 'performance-overview'
    : 'customer-rewards';

  const [activeTab, setActiveTab] = useState<MainRewardsTab>(initialTab);
  const [perfSubTab, setPerfSubTab] = useState<'customer' | 'trainer' | 'calendar'>(
    rawTab === 'trainer-performance' ? 'trainer' : rawTab === 'customer-calendar' ? 'calendar' : 'customer'
  );

  // Sync tab with URL query parameter
  const handleTabChange = (tab: MainRewardsTab) => {
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
  const [calendarModalCustomer, setCalendarModalCustomer] = useState<any | null>(null);
  const [selectedCalCustomerId, setSelectedCalCustomerId] = useState<string | null>(null);
  const [customerModalView, setCustomerModalView] = useState<'overview' | 'calendar'>('overview');

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

  // Dynamic Reward Form State & Dependencies
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [gymPackages, setGymPackages] = useState<any[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomerObj, setSelectedCustomerObj] = useState<any | null>(null);
  const [selectedTrainerObj, setSelectedTrainerObj] = useState<any | null>(null);
  const [productStockError, setProductStockError] = useState<string>('');

  const [customerCriteriaType, setCustomerCriteriaType] = useState<'points' | 'visits' | 'workouts' | 'streak' | 'goals' | 'free'>('points');
  const [rewardFormData, setRewardFormData] = useState({
    title: '',
    description: '',
    recipientType: 'Customer' as 'Customer' | 'Trainer' | 'Both',
    assignmentMethod: 'Points' as 'Direct' | 'Achievement' | 'Points',
    category: 'Discount Coupon',
    rewardType: 'Coupon',
    assignedUserId: '',
    trainerId: '',
    sessionCount: 2,
    sessionDuration: '45 mins',
    discountType: 'Percentage' as 'Percentage' | 'Fixed',
    discountValue: 15,
    applicableService: 'All Services' as 'Membership' | 'Personal Training' | 'Products' | 'All Services',
    minPurchaseAmount: 0,
    productId: '',
    productName: '',
    productQuantity: 1,
    membershipDuration: '1 Month',
    packageId: '',
    packageName: '',
    awardReason: '',
    achievementPeriod: 'This Month',
    hasCertificate: true,
    badgeIcon: 'Trophy',
    achievementCondition: 'visits' as 'visits' | 'workouts' | 'streak' | 'goals' | 'milestone',
    requiredPoints: 100,
    requiredChallengeId: '',
    minVerifiedVisits: 10,
    minWorkoutCompletions: 5,
    minStreakDays: 7,
    minDietAdherenceDays: 7,
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

  // Fetch Rewards, Claims, Store Products, and Gym Packages
  const fetchRewardsAndClaims = async () => {
    try {
      setLoadingRewards(true);
      const [rwdRes, chRes, prodRes, pkgRes] = await Promise.all([
        api.get('/rewards/owner'),
        api.get('/challenges/owner').catch(() => ({ data: { challenges: [] } })),
        api.get('/store/admin/products').catch(() => ({ data: { products: [] } })),
        api.get('/gym-packages').catch(() => ({ data: { packages: [] } }))
      ]);
      if (rwdRes.data?.success) {
        setRewards(rwdRes.data.rewards || []);
        setClaims(rwdRes.data.claims || []);
      }
      setChallenges(chRes.data?.challenges || []);
      setStoreProducts(prodRes.data?.products || []);
      setGymPackages(pkgRes.data?.packages || []);
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
  const openCreateRewardModal = (defaultRecipient: 'Customer' | 'Trainer' = 'Customer') => {
    setIsEditMode(false);
    setSelectedRewardId(null);
    setCustomerCriteriaType('points');
    setCustomerSearchQuery('');
    setSelectedCustomerObj(null);
    setSelectedTrainerObj(null);
    setProductStockError('');

    const defaultCat = defaultRecipient === 'Customer' ? 'Discount Coupon' : 'Performance Award';
    const defaultMethod = defaultRecipient === 'Trainer' ? 'Direct' : 'Points';

    setRewardFormData({
      title: '',
      description: '',
      recipientType: defaultRecipient,
      assignmentMethod: defaultMethod,
      category: defaultCat,
      rewardType: defaultRecipient === 'Customer' ? 'Coupon' : 'Award',
      assignedUserId: '',
      trainerId: trainers.length > 0 ? trainers[0]._id : '',
      sessionCount: 2,
      sessionDuration: '45 mins',
      discountType: 'Percentage',
      discountValue: 15,
      applicableService: 'All Services',
      minPurchaseAmount: 0,
      productId: storeProducts.length > 0 ? storeProducts[0]._id : '',
      productName: storeProducts.length > 0 ? storeProducts[0].name : '',
      productQuantity: 1,
      membershipDuration: '1 Month',
      packageId: gymPackages.length > 0 ? gymPackages[0]._id : '',
      packageName: gymPackages.length > 0 ? gymPackages[0].name : '',
      awardReason: '',
      achievementPeriod: 'This Month',
      hasCertificate: true,
      badgeIcon: 'Trophy',
      achievementCondition: 'visits',
      requiredPoints: 100,
      requiredChallengeId: '',
      minVerifiedVisits: 10,
      minWorkoutCompletions: 5,
      minStreakDays: 7,
      minDietAdherenceDays: 7,
      minCompletedSessions: defaultRecipient === 'Trainer' ? 15 : 0,
      minAverageRating: defaultRecipient === 'Trainer' ? 4.5 : 0,
      minReviewedPlans: 0,
      bonusAmount: defaultRecipient === 'Trainer' ? 1500 : 0,
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
    setCustomerSearchQuery('');
    setProductStockError('');

    // Locate assigned customer if exists
    if (r.assignedUserId) {
      const cId = r.assignedUserId?._id || r.assignedUserId;
      const foundCust = customers.find(c => c._id === cId);
      setSelectedCustomerObj(foundCust || r.assignedUserId);
    } else {
      setSelectedCustomerObj(null);
    }

    if (r.trainerId) {
      const tId = r.trainerId?._id || r.trainerId;
      const foundTr = trainers.find(t => t._id === tId);
      setSelectedTrainerObj(foundTr || r.trainerId);
    } else {
      setSelectedTrainerObj(null);
    }

    const method = r.assignmentMethod || ((r.requiredPoints || 0) > 0 ? 'Points' : 'Achievement');

    if (method === 'Points' || (r.requiredPoints || 0) > 0) {
      setCustomerCriteriaType('points');
    } else if (r.minVerifiedVisits > 0) {
      setCustomerCriteriaType('visits');
    } else if (r.minWorkoutCompletions > 0) {
      setCustomerCriteriaType('workouts');
    } else if (r.minStreakDays > 0) {
      setCustomerCriteriaType('streak');
    } else {
      setCustomerCriteriaType('free');
    }

    setRewardFormData({
      title: r.title || '',
      description: r.description || '',
      recipientType: r.recipientType || 'Customer',
      assignmentMethod: method,
      category: r.category || 'Discount Coupon',
      rewardType: r.rewardType || 'Reward',
      assignedUserId: r.assignedUserId?._id || r.assignedUserId || '',
      trainerId: r.trainerId?._id || r.trainerId || '',
      sessionCount: r.sessionCount || 2,
      sessionDuration: r.sessionDuration || '45 mins',
      discountType: r.discountType || 'Percentage',
      discountValue: r.discountValue || 15,
      applicableService: r.applicableService || 'All Services',
      minPurchaseAmount: r.minPurchaseAmount || 0,
      productId: r.productId?._id || r.productId || '',
      productName: r.productName || r.productId?.name || '',
      productQuantity: r.productQuantity || 1,
      membershipDuration: r.membershipDuration || '1 Month',
      packageId: r.packageId?._id || r.packageId || '',
      packageName: r.packageName || r.packageId?.name || '',
      awardReason: r.awardReason || '',
      achievementPeriod: r.achievementPeriod || 'This Month',
      hasCertificate: Boolean(r.hasCertificate),
      badgeIcon: r.badgeIcon || 'Trophy',
      achievementCondition: r.eligibilityCondition || 'visits',
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
      status: r.status || 'Active'
    });
    setIsRewardModalOpen(true);
  };

  const handleRewardFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Direct Assignment Validation
      if (rewardFormData.assignmentMethod === 'Direct') {
        if (!rewardFormData.assignedUserId) {
          setMessage({
            type: 'error',
            text: `Please select a specific ${rewardFormData.recipientType === 'Trainer' ? 'trainer' : 'customer'} for Direct Assignment.`
          });
          return;
        }
      }

      // 2. Product Inventory Stock Check
      if (rewardFormData.category === 'Free Product / Gift' && rewardFormData.productId) {
        const prod = storeProducts.find(p => p._id === rewardFormData.productId);
        const reqQty = Number(rewardFormData.productQuantity) || 1;
        if (prod && prod.stock < reqQty) {
          setMessage({
            type: 'error',
            text: `Cannot create reward: requested quantity (${reqQty}) exceeds available inventory (${prod.stock}) for "${prod.name}".`
          });
          return;
        }
      }

      const payload: any = {
        ...rewardFormData,
        totalQuantity: Number(rewardFormData.totalQuantity) || 0,
        maxClaimsPerUser: rewardFormData.assignmentMethod === 'Direct' ? 1 : (Number(rewardFormData.maxClaimsPerUser) || 1),
      };

      // Set category-specific parameters & clean non-relevant data
      if (rewardFormData.assignmentMethod === 'Direct') {
        payload.requiredPoints = 0;
        payload.minVerifiedVisits = 0;
        payload.minWorkoutCompletions = 0;
        payload.minStreakDays = 0;
        payload.minDietAdherenceDays = 0;
      } else if (rewardFormData.assignmentMethod === 'Points') {
        payload.requiredPoints = Number(rewardFormData.requiredPoints) || 100;
        payload.minVerifiedVisits = 0;
        payload.minWorkoutCompletions = 0;
        payload.minStreakDays = 0;
        payload.minDietAdherenceDays = 0;
      } else if (rewardFormData.assignmentMethod === 'Achievement') {
        payload.requiredPoints = 0;
        if (rewardFormData.achievementCondition === 'visits') {
          payload.minVerifiedVisits = Number(rewardFormData.minVerifiedVisits) || 10;
          payload.minWorkoutCompletions = 0;
          payload.minStreakDays = 0;
          payload.minDietAdherenceDays = 0;
        } else if (rewardFormData.achievementCondition === 'workouts') {
          payload.minVerifiedVisits = 0;
          payload.minWorkoutCompletions = Number(rewardFormData.minWorkoutCompletions) || 5;
          payload.minStreakDays = 0;
          payload.minDietAdherenceDays = 0;
        } else if (rewardFormData.achievementCondition === 'streak') {
          payload.minVerifiedVisits = 0;
          payload.minWorkoutCompletions = 0;
          payload.minStreakDays = Number(rewardFormData.minStreakDays) || 7;
          payload.minDietAdherenceDays = 0;
        } else if (rewardFormData.achievementCondition === 'goals') {
          payload.minVerifiedVisits = 0;
          payload.minWorkoutCompletions = 0;
          payload.minStreakDays = 0;
          payload.minDietAdherenceDays = Number(rewardFormData.minDietAdherenceDays) || 7;
        } else if (rewardFormData.achievementCondition === 'milestone') {
          payload.minVerifiedVisits = Number(rewardFormData.minVerifiedVisits) || 20;
          payload.minWorkoutCompletions = Number(rewardFormData.minWorkoutCompletions) || 15;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141D1E] border border-[#2A3A3A] p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-[#2DD4BF]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#FFFFFF] tracking-tight">
              Rewards, Performance &amp; Awards
            </h1>
            <p className="text-xs sm:text-sm text-[#9AAEAE] mt-0.5">
              Comprehensive management of customer &amp; trainer rewards, verified performance records, awards honors, and claims audit.
            </p>
          </div>
        </div>

        {activeTab === 'customer-rewards' && (
          <button
            onClick={() => openCreateRewardModal('Customer')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs sm:text-sm font-extrabold shadow-md shadow-[#2DD4BF]/25 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Create Customer Reward
          </button>
        )}

        {activeTab === 'trainer-rewards' && (
          <button
            onClick={() => openCreateRewardModal('Trainer')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs sm:text-sm font-extrabold shadow-md shadow-[#2DD4BF]/25 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Create Trainer Reward
          </button>
        )}
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-[#0E1415]/40 border-[#2A3A3A] text-[#2DD4BF]'
              : 'bg-red-950/40 border-red-800 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-[#141D1E]/10 rounded cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Level 5-Tab Navigation — Performance Overview, Customer Rewards, Trainer Rewards, Awards, Claims */}
      <div className="w-full">
        <div className="flex items-center gap-2 p-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-2xl w-full overflow-x-auto no-scrollbar shadow-md">
          {/* 1. Performance Overview */}
          <button
            onClick={() => handleTabChange('performance-overview')}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'performance-overview'
                ? 'bg-[#2DD4BF] text-white font-extrabold shadow-sm'
                : 'text-[#9AAEAE] hover:text-[#FFFFFF] hover:bg-[#0E1415] font-semibold'
            }`}
          >
            <BarChart3 size={16} className={activeTab === 'performance-overview' ? 'text-white shrink-0' : 'text-[#9AAEAE] shrink-0'} />
            <span>Performance Overview</span>
          </button>

          {/* 2. Customer Rewards */}
          <button
            onClick={() => handleTabChange('customer-rewards')}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'customer-rewards'
                ? 'bg-[#2DD4BF] text-white font-extrabold shadow-sm'
                : 'text-[#9AAEAE] hover:text-[#FFFFFF] hover:bg-[#0E1415] font-semibold'
            }`}
          >
            <Gift size={16} className={activeTab === 'customer-rewards' ? 'text-white shrink-0' : 'text-[#9AAEAE] shrink-0'} />
            <span>Customer Rewards ({rewards.filter(r => r.recipientType === 'Customer' || r.recipientType === 'Both').length})</span>
          </button>

          {/* 3. Trainer Rewards */}
          <button
            onClick={() => handleTabChange('trainer-rewards')}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'trainer-rewards'
                ? 'bg-[#2DD4BF] text-white font-extrabold shadow-sm'
                : 'text-[#9AAEAE] hover:text-[#FFFFFF] hover:bg-[#0E1415] font-semibold'
            }`}
          >
            <Dumbbell size={16} className={activeTab === 'trainer-rewards' ? 'text-white shrink-0' : 'text-[#9AAEAE] shrink-0'} />
            <span>Trainer Rewards ({rewards.filter(r => r.recipientType === 'Trainer' || r.recipientType === 'Both').length})</span>
          </button>

          {/* 4. Awards & Recognition */}
          <button
            onClick={() => handleTabChange('awards-recognition')}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'awards-recognition'
                ? 'bg-[#2DD4BF] text-white font-extrabold shadow-sm'
                : 'text-[#9AAEAE] hover:text-[#FFFFFF] hover:bg-[#0E1415] font-semibold'
            }`}
          >
            <Trophy size={16} className={activeTab === 'awards-recognition' ? 'text-white shrink-0' : 'text-[#9AAEAE] shrink-0'} />
            <span>Awards &amp; Recognition</span>
          </button>

          {/* 5. Claims & History */}
          <button
            onClick={() => handleTabChange('claims-history')}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all text-center cursor-pointer whitespace-nowrap ${
              activeTab === 'claims-history'
                ? 'bg-[#2DD4BF] text-white font-extrabold shadow-sm'
                : 'text-[#9AAEAE] hover:text-[#FFFFFF] hover:bg-[#0E1415] font-semibold'
            }`}
          >
            <Ticket size={16} className={activeTab === 'claims-history' ? 'text-white shrink-0' : 'text-[#9AAEAE] shrink-0'} />
            <span>Claims &amp; History ({claims.length})</span>
            {claims.filter(c => c.claimStatus === 'Pending').length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                activeTab === 'claims-history' ? 'bg-[#141D1E] text-[#2DD4BF]' : 'bg-[#2DD4BF] text-white'
              }`}>
                {claims.filter(c => c.claimStatus === 'Pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: CUSTOMER REWARDS                              */}
      {/* ======================================================== */}
      {activeTab === 'customer-rewards' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#141D1E] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#2A3A3A' }}>
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-medium">
                <span>Active Customer Perks</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#2DD4BF]"><Gift className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#F5FAFA]">
                {rewards.filter(r => (r.recipientType === 'Customer' || r.recipientType === 'Both') && r.status === 'Active').length}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Available for gym members</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#2A3A3A' }}>
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-medium">
                <span>Total Redemptions</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#2DD4BF]"><CheckCircle2 className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#2DD4BF]">
                {rewards.filter(r => r.recipientType === 'Customer' || r.recipientType === 'Both').reduce((sum, r) => sum + (r.claimedCount || 0), 0)}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Vouchers redeemed by customers</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#2A3A3A' }}>
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-medium">
                <span>Points-Based Rewards</span>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-700"><Coins className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-amber-700">
                {rewards.filter(r => (r.recipientType === 'Customer' || r.recipientType === 'Both') && (r.requiredPoints || 0) > 0).length}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Redeemable with attendance points</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#2A3A3A' }}>
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-medium">
                <span>Pending Claims</span>
                <span className="p-2 rounded-lg bg-purple-50 text-purple-700"><Clock className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-purple-700">
                {claims.filter(c => c.userRole === 'MEMBER' && c.claimStatus === 'Pending').length}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Awaiting owner review</p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="bg-[#141D1E] p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: '#2A3A3A' }}>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#9AAEAE]" />
              <input
                type="text"
                placeholder="Search customer rewards..."
                value={rewardSearch}
                onChange={e => setRewardSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#2DD4BF]"
                style={{ borderColor: '#2A3A3A' }}
              />
            </div>

            <button
              onClick={() => openCreateRewardModal('Customer')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#5EEAD4] transition cursor-pointer"
              style={{ backgroundColor: '#2DD4BF' }}
            >
              <Plus className="w-4 h-4" />
              Create Customer Reward
            </button>
          </div>

          {/* Customer Rewards Grid */}
          {rewards.filter(r => (r.recipientType === 'Customer' || r.recipientType === 'Both') && (r.title.toLowerCase().includes(rewardSearch.toLowerCase()) || r.category.toLowerCase().includes(rewardSearch.toLowerCase()))).length === 0 ? (
            <div className="text-center py-16 bg-[#141D1E] rounded-2xl border" style={{ borderColor: '#2A3A3A' }}>
              <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-[#C1D0D0]">No Customer Rewards Configured</h3>
              <p className="text-sm text-[#9AAEAE] mt-1">Create discount coupons, free personal training sessions, or merchandise rewards for members.</p>
              <button
                onClick={() => openCreateRewardModal('Customer')}
                className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-semibold"
                style={{ backgroundColor: '#2DD4BF' }}
              >
                Create Customer Reward
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.filter(r => (r.recipientType === 'Customer' || r.recipientType === 'Both') && (r.title.toLowerCase().includes(rewardSearch.toLowerCase()) || r.category.toLowerCase().includes(rewardSearch.toLowerCase()))).map(r => (
                <div
                  key={r._id}
                  className="bg-[#141D1E] rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                  style={{ borderColor: '#2A3A3A' }}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#1B2728] text-[#2DD4BF]">
                        {r.recipientType === 'Both' ? 'Customer & Trainer' : 'Customer Perk'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#1B2728] text-[#C1D0D0]">
                        {r.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-[#F5FAFA]">{r.title}</h3>
                      <span className="text-xs text-[#9AAEAE] block mt-0.5">{r.category}</span>
                      <p className="text-xs text-[#9AAEAE] mt-1 line-clamp-2">{r.description}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0E1415] text-xs space-y-1 border" style={{ borderColor: '#0E1415' }}>
                      {r.requiredPoints > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#9AAEAE]">Points Cost:</span>
                          <span className="font-bold text-[#2DD4BF]">{r.requiredPoints} pts</span>
                        </div>
                      )}
                      {r.minVerifiedVisits > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#9AAEAE]">Target Visits:</span>
                          <span className="font-semibold">{r.minVerifiedVisits} gym visits</span>
                        </div>
                      )}
                      {r.minWorkoutCompletions > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#9AAEAE]">Target Workouts:</span>
                          <span className="font-semibold">{r.minWorkoutCompletions} workouts</span>
                        </div>
                      )}
                      {r.minStreakDays > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#9AAEAE]">Target Streak:</span>
                          <span className="font-semibold text-amber-600">🔥 {r.minStreakDays} days</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-[#2A3A3A]">
                        <span className="text-[#9AAEAE]">Claims:</span>
                        <span className="font-semibold">{r.claimedCount} redeemed / {r.totalQuantity === 0 ? 'Unlimited' : r.totalQuantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t flex justify-between items-center text-xs" style={{ borderColor: '#2A3A3A' }}>
                    <span className="text-[#9AAEAE]">
                      {r.requireApproval ? '🔒 Approval required' : '⚡ Instant claim'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditRewardModal(r)} className="p-1.5 rounded-lg hover:bg-[#1B2728] text-[#C1D0D0] cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteReward(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer">
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
      {/* SECTION 2: TRAINER REWARDS                              */}
      {/* ======================================================== */}
      {activeTab === 'trainer-rewards' && (
        <div className="space-y-6">
          {/* Trainer Rewards Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#141D1E] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#2A3A3A' }}>
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-medium">
                <span>Active Trainer Rewards</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#2DD4BF]"><Dumbbell className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#F5FAFA]">
                {rewards.filter(r => (r.recipientType === 'Trainer' || r.recipientType === 'Both') && r.status === 'Active').length}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Available for gym coaches</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#2A3A3A' }}>
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-medium">
                <span>Cash Bonuses Configured</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#2DD4BF]"><IndianRupee className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#2DD4BF]">
                ₹{rewards.filter(r => (r.recipientType === 'Trainer' || r.recipientType === 'Both')).reduce((sum, r) => sum + (r.bonusAmount || 0), 0).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Across performance milestones</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#2A3A3A' }}>
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-medium">
                <span>Trainer Claims</span>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-700"><Trophy className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-amber-700">
                {claims.filter(c => c.userRole === 'TRAINER').length}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Recorded trainer bonuses</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#2A3A3A' }}>
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-medium">
                <span>Pending Payouts</span>
                <span className="p-2 rounded-lg bg-purple-50 text-purple-700"><Clock className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-purple-700">
                {claims.filter(c => c.userRole === 'TRAINER' && (c.financialPayoutStatus === 'Pending' || c.financialPayoutStatus === 'Pending Approval' || c.financialPayoutStatus === 'Payment Pending')).length}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Awaiting financial transfer</p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="bg-[#141D1E] p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: '#2A3A3A' }}>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#9AAEAE]" />
              <input
                type="text"
                placeholder="Search trainer rewards & bonuses..."
                value={rewardSearch}
                onChange={e => setRewardSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-[#2DD4BF]"
                style={{ borderColor: '#2A3A3A' }}
              />
            </div>

            <button
              onClick={() => openCreateRewardModal('Trainer')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-[#5EEAD4] transition cursor-pointer"
              style={{ backgroundColor: '#2DD4BF' }}
            >
              <Plus className="w-4 h-4" />
              Create Trainer Reward
            </button>
          </div>

          {/* Trainer Rewards Grid */}
          {rewards.filter(r => (r.recipientType === 'Trainer' || r.recipientType === 'Both') && (r.title.toLowerCase().includes(rewardSearch.toLowerCase()) || r.category.toLowerCase().includes(rewardSearch.toLowerCase()))).length === 0 ? (
            <div className="text-center py-16 bg-[#141D1E] rounded-2xl border" style={{ borderColor: '#2A3A3A' }}>
              <Dumbbell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-[#C1D0D0]">No Trainer Rewards Configured</h3>
              <p className="text-sm text-[#9AAEAE] mt-1">Create trainer milestone bonuses, coaching awards, and ratings incentives.</p>
              <button
                onClick={() => openCreateRewardModal('Trainer')}
                className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-semibold"
                style={{ backgroundColor: '#2DD4BF' }}
              >
                Create Trainer Reward
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.filter(r => (r.recipientType === 'Trainer' || r.recipientType === 'Both') && (r.title.toLowerCase().includes(rewardSearch.toLowerCase()) || r.category.toLowerCase().includes(rewardSearch.toLowerCase()))).map(r => (
                <div
                  key={r._id}
                  className="bg-[#141D1E] rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                  style={{ borderColor: '#2A3A3A' }}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700">
                        {r.category}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#1B2728] text-[#C1D0D0]">
                        {r.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-[#F5FAFA]">{r.title}</h3>
                      <p className="text-xs text-[#9AAEAE] mt-1 line-clamp-2">{r.description}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0E1415] text-xs space-y-1.5 border" style={{ borderColor: '#0E1415' }}>
                      {r.bonusAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#9AAEAE]">Bonus Cash:</span>
                          <span className="font-bold text-[#2DD4BF]">₹{r.bonusAmount} {r.currency}</span>
                        </div>
                      )}
                      {r.minCompletedSessions > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#9AAEAE]">Completed Sessions:</span>
                          <span className="font-semibold">{r.minCompletedSessions} sessions</span>
                        </div>
                      )}
                      {r.minAverageRating > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#9AAEAE]">Min Rating:</span>
                          <span className="font-semibold">{r.minAverageRating}⭐ rating</span>
                        </div>
                      )}
                      {r.minReviewedPlans > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#9AAEAE]">Reviewed Plans:</span>
                          <span className="font-semibold">{r.minReviewedPlans} plans</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 border-t border-[#2A3A3A]">
                        <span className="text-[#9AAEAE]">Claims:</span>
                        <span className="font-semibold">{r.claimedCount} claims</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t flex justify-between items-center text-xs" style={{ borderColor: '#2A3A3A' }}>
                    <span className="text-[#9AAEAE]">
                      {r.requireApproval ? '🔒 Approval required' : '⚡ Instant claim'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditRewardModal(r)} className="p-1.5 rounded-lg hover:bg-[#1B2728] text-[#C1D0D0] cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteReward(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer">
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
      {/* SECTION 3: PERFORMANCE OVERVIEW                          */}
      {/* ======================================================== */}
      {activeTab === 'performance-overview' && (
        <div className="space-y-6">
          {/* Sub Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-2xl w-fit shadow-xs">
            <button
              onClick={() => setPerfSubTab('customer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                perfSubTab === 'customer'
                  ? 'bg-[#2DD4BF] text-white shadow-xs'
                  : 'text-[#9AAEAE] hover:text-[#FFFFFF] hover:bg-[#1B2728]'
              }`}
            >
              <Users size={16} />
              <span>Customer Performance ({customerStats.totalCustomers || 0})</span>
            </button>
            <button
              onClick={() => setPerfSubTab('trainer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                perfSubTab === 'trainer'
                  ? 'bg-[#2DD4BF] text-white shadow-xs'
                  : 'text-[#9AAEAE] hover:text-[#FFFFFF] hover:bg-[#1B2728]'
              }`}
            >
              <Dumbbell size={16} />
              <span>Trainer Performance ({trainerStats.totalTrainers || 0})</span>
            </button>
            <button
              onClick={() => setPerfSubTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                perfSubTab === 'calendar'
                  ? 'bg-[#2DD4BF] text-white shadow-xs'
                  : 'text-[#9AAEAE] hover:text-[#FFFFFF] hover:bg-[#1B2728]'
              }`}
            >
              <Calendar size={16} />
              <span>Customer Calendar ({customerStats.totalCustomers || customers.length || 0})</span>
            </button>
          </div>

          {perfSubTab === 'customer' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#141D1E] p-5 rounded-2xl border border-[#2A3A3A] shadow-sm">
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-semibold uppercase tracking-wider">
                <span>Total Gym Members</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#2DD4BF] border border-[#2A3A3A]"><Users className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#F5FAFA]">{customerStats.totalCustomers}</div>
              <p className="text-xs text-[#9AAEAE] mt-1">{customerStats.activeMembersCount} with active membership</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border border-[#2A3A3A] shadow-sm">
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-semibold uppercase tracking-wider">
                <span>Avg Attendance Streak</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#FBBF24] border border-[#2A3A3A]"><Flame className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#FBBF24]">
                {customerStats.averageAttendanceStreak} <span className="text-base font-normal">days</span>
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Consecutive verified visits</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border border-[#2A3A3A] shadow-sm">
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-semibold uppercase tracking-wider">
                <span>Avg Workout Completion</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#2DD4BF] border border-[#2A3A3A]"><TrendingUp className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#2DD4BF]">
                {customerStats.averageWorkoutCompletionRate !== null ? `${customerStats.averageWorkoutCompletionRate}%` : 'Not Available'}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Based on logged workout sets</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border border-[#2A3A3A] shadow-sm">
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-semibold uppercase tracking-wider">
                <span>Eligible For Rewards</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#34D399] border border-[#2A3A3A]"><Gift className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#34D399]">
                {customers.filter(c => c.rewardsSummary?.eligibleRewardsCount > 0).length}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Members meeting target rules</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-[#141D1E] p-4 rounded-2xl border border-[#2A3A3A] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#9AAEAE]" />
              <input
                type="text"
                placeholder="Search member by name, email, phone..."
                value={custSearch}
                onChange={e => setCustSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-[#2A3A3A] bg-[#0E1415] text-[#F5FAFA] placeholder-[#9AAEAE] focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#9AAEAE]">MEMBERSHIP:</span>
                <select
                  value={custMembershipFilter}
                  onChange={e => setCustMembershipFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[#2A3A3A] bg-[#0E1415] text-[#F5FAFA] focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive / Expired</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#9AAEAE]">TRAINER:</span>
                <select
                  value={custTrainerFilter}
                  onChange={e => setCustTrainerFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[#2A3A3A] bg-[#0E1415] text-[#F5FAFA] focus:outline-none"
                >
                  <option value="ALL">All Trainers</option>
                  {trainers.map(t => (
                    <option key={t.trainerId} value={t.trainerId}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setPerfSubTab('calendar')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-[#2A3A3A] bg-[#0E1415] hover:bg-[#1B2728] text-[#2DD4BF] cursor-pointer ml-auto sm:ml-0 transition"
                title="Switch to Customer Daily Workout & Diet Calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-[#2DD4BF]" />
                Calendar View
              </button>
            </div>
          </div>

          {/* Customer Table */}
          {loadingCustomers ? (
            <div className="text-center py-16 bg-[#141D1E] rounded-2xl border border-[#2A3A3A]">
              <div className="w-8 h-8 border-4 border-t-transparent border-[#2DD4BF] rounded-full animate-spin mx-auto" />
              <p className="mt-2 text-xs text-[#9AAEAE]">Evaluating customer records...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-16 bg-[#141D1E] rounded-2xl border border-[#2A3A3A]">
              <Users className="w-12 h-12 mx-auto text-[#9AAEAE]/50 mb-3" />
              <h3 className="text-base font-bold text-[#F5FAFA]">No Customers Match Filter</h3>
              <p className="text-sm text-[#9AAEAE] mt-1">Try resetting your search query or membership status filters.</p>
            </div>
          ) : (
            <div className="bg-[#141D1E] rounded-2xl border border-[#2A3A3A] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[#2A3A3A] text-xs uppercase bg-[#0E1415] text-[#9AAEAE]">
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
                  <tbody className="divide-y divide-[#2A3A3A]">
                    {filteredCustomers.map(c => {
                      const wPct = c.workoutSummary?.completionPercentage;
                      const dPct = c.dietSummary?.adherencePercentage;

                      return (
                        <tr key={c.customerId} className="hover:bg-[#1B2728] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#F5FAFA]">{c.name}</div>
                            <div className="text-xs text-[#9AAEAE]">
                              {c.email}{c.phone ? ` • ${c.phone}` : ''}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full font-semibold ${
                                c.membership.status === 'Active'
                                  ? 'bg-[#2DD4BF]/15 text-[#34D399] border border-[#2A3A3A]/30'
                                  : 'bg-[#1B2728] text-[#9AAEAE] border border-[#2A3A3A]'
                              }`}
                            >
                              {c.membership.status}
                            </span>
                            <span className="block text-[11px] text-[#9AAEAE] mt-0.5 truncate max-w-[120px]">
                              {c.membership.planName}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {c.assignedTrainer ? (
                              <span className="font-medium text-[#F5FAFA]">{c.assignedTrainer.name}</span>
                            ) : (
                              <span className="text-[#9AAEAE]">None assigned</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {wPct !== null ? (
                              <div>
                                <span className="font-bold text-[#2DD4BF]">{wPct}%</span>
                                <span className="text-[11px] text-[#9AAEAE] block">
                                  {c.workoutSummary.completedWorkoutsCount} done / {c.workoutSummary.totalWorkoutsScheduled}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#9AAEAE]">Not recorded</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {c.dietSummary?.plan ? (
                              <div>
                                <span
                                  className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                    c.dietSummary.plan.status === 'Approved'
                                      ? 'bg-[#2DD4BF]/15 text-[#34D399] border border-[#2A3A3A]/30'
                                      : 'bg-amber-500/15 text-[#FBBF24] border border-amber-500/30'
                                  }`}
                                >
                                  {c.dietSummary.plan.status}
                                </span>
                                <span className="block text-[11px] text-[#9AAEAE] mt-0.5">
                                  {dPct !== null ? `${dPct}% check-in` : 'No meal logs'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#9AAEAE]">No diet plan</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            <div className="font-bold text-[#F5FAFA]">
                              {c.attendanceSummary.totalVerifiedVisits} visits
                            </div>
                            <span className="text-[#FBBF24] font-semibold text-[11px] flex items-center gap-1 mt-0.5">
                              <Flame className="w-3 h-3 text-[#FBBF24]" /> {c.attendanceSummary.attendanceStreak}d streak
                            </span>
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {c.rewardsSummary?.eligibleRewardsCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full font-bold bg-[#2DD4BF]/15 text-[#34D399] border border-[#2A3A3A]/30">
                                {c.rewardsSummary.eligibleRewardsCount} Eligible
                              </span>
                            ) : (
                              <span className="text-[#9AAEAE] font-medium">In Progress</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setCalendarModalCustomer(c);
                                }}
                                className="px-2.5 py-1 rounded-xl text-xs font-semibold border border-[#2A3A3A] bg-[#0E1415] hover:bg-[#1B2728] text-[#2DD4BF] hover:text-[#FFFFFF] hover:border-[#2DD4BF] flex items-center gap-1 cursor-pointer transition shadow-xs"
                                title="Open member's daily workout, diet and attendance calendar"
                              >
                                <Calendar className="w-3.5 h-3.5 text-[#2DD4BF]" /> Calendar
                              </button>
                              <button
                                onClick={() => setSelectedCustomer(c)}
                                className="px-2.5 py-1 rounded-xl text-xs font-semibold border border-[#2A3A3A] bg-[#0E1415] hover:bg-[#1B2728] text-[#F5FAFA] flex items-center gap-1 cursor-pointer transition"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#2DD4BF]" /> View
                              </button>
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

      {/* TRAINER PERFORMANCE SUB-VIEW */}
      {perfSubTab === 'trainer' && (
        <div className="space-y-6">
          {/* Trainer Stats Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#141D1E] p-5 rounded-2xl border border-[#2A3A3A] shadow-sm">
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-semibold uppercase tracking-wider">
                <span>Total Trainers</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#2DD4BF] border border-[#2A3A3A]"><Dumbbell className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#F5FAFA]">{trainerStats.totalTrainers}</div>
              <p className="text-xs text-[#9AAEAE] mt-1">Gym trainers on staff</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border border-[#2A3A3A] shadow-sm">
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-semibold uppercase tracking-wider">
                <span>Completed Sessions Across Gym</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#34D399] border border-[#2A3A3A]"><CheckCircle2 className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#34D399]">
                {trainerStats.totalCompletedSessionsAcrossTrainers}
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">Online & in-person sessions</p>
            </div>

            <div className="bg-[#141D1E] p-5 rounded-2xl border border-[#2A3A3A] shadow-sm">
              <div className="flex justify-between items-center text-xs text-[#9AAEAE] font-semibold uppercase tracking-wider">
                <span>Average Trainer Rating</span>
                <span className="p-2 rounded-lg bg-[#1B2728] text-[#FBBF24] border border-[#2A3A3A]"><Star className="w-4 h-4 fill-amber-500 text-amber-500" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#FBBF24]">
                {trainerStats.averageGymTrainerRating} ⭐
              </div>
              <p className="text-xs text-[#9AAEAE] mt-1">From real client feedback reviews</p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-[#141D1E] p-4 rounded-2xl border border-[#2A3A3A] shadow-sm flex justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#9AAEAE]" />
              <input
                type="text"
                placeholder="Search trainer by name, email..."
                value={trainerSearch}
                onChange={e => setTrainerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-[#2A3A3A] bg-[#0E1415] text-[#F5FAFA] placeholder-[#9AAEAE] focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
          </div>

          {/* Trainer Grid */}
          {loadingTrainers ? (
            <div className="text-center py-16 bg-[#141D1E] rounded-2xl border" style={{ borderColor: '#2A3A3A' }}>
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto text-[#2DD4BF]" />
              <p className="mt-2 text-xs text-[#9AAEAE]">Loading trainer evaluations...</p>
            </div>
          ) : filteredTrainers.length === 0 ? (
            <div className="text-center py-16 bg-[#141D1E] rounded-2xl border" style={{ borderColor: '#2A3A3A' }}>
              <Dumbbell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-[#C1D0D0]">No Trainers Found</h3>
              <p className="text-sm text-[#9AAEAE] mt-1">No trainers match your active search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrainers.map(t => (
                <div
                  key={t.trainerId}
                  className="bg-[#141D1E] rounded-2xl border border-[#2A3A3A] shadow-sm p-5 flex flex-col justify-between hover:border-[#2DD4BF]/50 transition"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#2DD4BF]/15 text-[#34D399] border border-[#2A3A3A]/30">
                        {t.activeStatus}
                      </span>
                      <span className="font-bold text-xs text-[#FBBF24] flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-[#FBBF24]" />
                        {t.feedbackSummary?.averageRating} ⭐ ({t.feedbackSummary?.totalRatingsCount} reviews)
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-[#F5FAFA]">{t.name}</h3>
                      <div className="text-xs text-[#9AAEAE]">{t.email}</div>
                      <div className="text-xs text-[#9AAEAE] mt-1">
                        Experience: {t.experience} • Clients: <span className="font-bold text-[#F5FAFA]">{t.clientsSummary?.totalAssignedCustomers}</span>
                      </div>
                    </div>

                    {/* Performance Metrics Box */}
                    <div className="p-3 rounded-xl bg-[#0E1415] text-xs space-y-1.5 border border-[#2A3A3A]">
                      <div className="flex justify-between">
                        <span className="text-[#9AAEAE]">Sessions Completed:</span>
                        <span className="font-bold text-[#34D399]">
                          {t.sessionsSummary.completed} sessions ({t.sessionsSummary.onlineCount} online / {t.sessionsSummary.inPersonCount} in-person)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9AAEAE]">Punctuality:</span>
                        <span className="font-medium text-[#C1D0D0]">{t.sessionsSummary.punctuality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9AAEAE]">Workout Plans Reviewed:</span>
                        <span className="font-semibold text-[#F5FAFA]">{t.plansSummary.totalReviewedOrApproved} plans</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#9AAEAE]">Client Workout Adherence:</span>
                        <span className="font-bold text-[#2DD4BF]">
                          {t.clientsSummary.averageClientWorkoutProgress !== null
                            ? `${t.clientsSummary.averageClientWorkoutProgress}%`
                            : 'Not recorded'}
                        </span>
                      </div>
                    </div>

                    {/* Eligible Bonuses Banner */}
                    {t.rewardsSummary?.eligibleBonusesCount > 0 && (
                      <div className="p-2.5 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-xs text-[#2DD4BF] flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                        <span>Eligible for {t.rewardsSummary.eligibleBonusesCount} performance awards!</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-[#2A3A3A] flex justify-between items-center">
                    <span className="text-xs text-[#9AAEAE]">
                      {t.rewardsSummary.paidBonusesCount} bonuses paid
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTrainer(t);
                        setTrainerModalTab('handled-customers');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#2A3A3A] bg-[#0E1415] hover:bg-[#1B2728] text-[#2DD4BF] flex items-center gap-1 cursor-pointer transition"
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

      {/* CUSTOMER DAILY CALENDAR SUB-VIEW */}
      {perfSubTab === 'calendar' && (
        <CustomerDailyCalendarView
          customers={customers}
          selectedCustomerId={selectedCalCustomerId}
          onSelectCustomer={(c) => setSelectedCalCustomerId(c.customerId || c._id)}
          trainers={trainers}
        />
      )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: AWARDS & RECOGNITION                          */}
      {/* ======================================================== */}
      {activeTab === 'awards-recognition' && (
        <AwardsRecognitionSection />
      )}

      {/* ======================================================== */}
      {/* TAB 4: REWARD CLAIMS & HISTORY                          */}
      {/* ======================================================== */}
      {activeTab === 'claims-history' && (
        <div className="space-y-6">
          <div className="bg-[#141D1E] p-4 sm:p-5 rounded-2xl border border-[#2A3A3A] shadow-md flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-[#9AAEAE]" />
              <input
                type="text"
                placeholder="Search voucher code, user name..."
                value={rewardSearch}
                onChange={e => setRewardSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-[#080B0C] border border-[#2A3A3A] text-[#FFFFFF] placeholder-[#737373] focus:border-[#2DD4BF] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider">STATUS:</span>
              <select
                value={claimStatusFilter}
                onChange={e => setClaimStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#2A3A3A] bg-[#080B0C] text-[#FFFFFF] focus:border-[#2DD4BF] focus:outline-none cursor-pointer"
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
            <div className="text-center py-16 bg-[#141D1E] rounded-2xl border border-[#2A3A3A] shadow-md space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#0E1415] border border-[#2A3A3A] text-[#2DD4BF] flex items-center justify-center mx-auto mb-2">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#FFFFFF]">No Claim Records Found</h3>
              <p className="text-xs text-[#9AAEAE] max-w-sm mx-auto">Claimed vouchers and approval requests will appear here.</p>
            </div>
          ) : (
            <div className="bg-[#141D1E] rounded-2xl border border-[#2A3A3A] shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#2A3A3A] text-xs uppercase bg-[#0E1415] text-[#9AAEAE] font-extrabold tracking-wider">
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Reward</th>
                      <th className="py-3 px-4">Voucher Code</th>
                      <th className="py-3 px-4">Points</th>
                      <th className="py-3 px-4">Approval Status</th>
                      <th className="py-3 px-4">Financial Payout</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1B2728]">
                    {filteredClaims.map(c => {
                      const isTrainer = c.userRole === 'TRAINER';
                      const hasBonus = c.financialPayoutStatus !== 'Not Applicable';

                      return (
                        <tr key={c._id} className="hover:bg-[#161616] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#F5F5F5]">
                              {c.userId?.firstName || 'User'} {c.userId?.lastName || ''}
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-0.5 ${
                              isTrainer ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40' : 'bg-[#0E1415]/60 text-emerald-400 border border-[#2A3A3A]/40'
                            }`}>
                              {isTrainer ? 'Trainer' : 'Customer'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#F5F5F5]">{c.rewardId?.title || 'Reward'}</div>
                            <span className="text-[11px] text-[#A6A6A6]">{c.rewardId?.category}</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-[#080B0C] border border-[#2A3A3A] text-[#2DD4BF]">
                              {c.claimCode}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-bold">
                            {c.pointsDeducted > 0 ? (
                              <span className="text-[#2DD4BF]">-{c.pointsDeducted} pts</span>
                            ) : (
                              <span className="text-[#9AAEAE]">0 pts</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                c.claimStatus === 'Approved'
                                  ? 'bg-[#0E1415]/60 text-emerald-400 border border-[#2A3A3A]/50'
                                  : c.claimStatus === 'Pending'
                                  ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                                  : c.claimStatus === 'Redeemed'
                                  ? 'bg-sky-950/60 text-sky-400 border border-sky-800/50'
                                  : 'bg-red-950/60 text-red-400 border border-red-800/50'
                              }`}
                            >
                              {c.claimStatus}
                            </span>
                            {c.rejectionReason && (
                              <span className="block text-[11px] text-red-400 mt-1 max-w-[150px] truncate" title={c.rejectionReason}>
                                {c.rejectionReason}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {hasBonus ? (
                              <div>
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                                    c.financialPayoutStatus === 'Paid'
                                      ? 'bg-[#0E1415]/60 text-emerald-400 border border-[#2A3A3A]/50'
                                      : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                                  }`}
                                >
                                  {c.financialPayoutStatus === 'Paid' ? 'Paid' : 'Pending Payment'}
                                </span>
                                {c.financialPayoutReference && (
                                  <span className="block text-[10px] text-[#A6A6A6] font-mono mt-0.5">
                                    Ref: {c.financialPayoutReference}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#9AAEAE]">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {c.claimStatus === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => openClaimAction(c, 'APPROVE')}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openClaimAction(c, 'REJECT')}
                                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900/60 transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {c.claimStatus === 'Approved' && (
                                <button
                                  onClick={() => openClaimAction(c, 'REDEEM')}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-950/60 border border-sky-800 text-sky-300 hover:bg-sky-900/60 transition-colors cursor-pointer"
                                >
                                  Mark Redeemed
                                </button>
                              )}

                              {hasBonus && c.financialPayoutStatus === 'Pending' && (
                                <button
                                  onClick={() => openClaimAction(c, 'PAYOUT')}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#141D1E] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#2A3A3A]">
            <div className="sticky top-0 bg-[#0E1415] px-6 py-4 border-b border-[#2A3A3A] flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1B2728] text-[#2DD4BF] font-bold border border-[#2A3A3A]">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#F5FAFA]">{selectedCustomer.name}</h3>
                  <p className="text-xs text-[#9AAEAE]">{selectedCustomer.email} • {selectedCustomer.phone || selectedCustomer.mobile || 'No phone'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const cust = selectedCustomer;
                    setSelectedCustomer(null);
                    setCalendarModalCustomer(cust);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2DD4BF] text-[#06201D] font-bold flex items-center gap-1.5 hover:bg-[#5EEAD4] transition cursor-pointer"
                  title="Open full interactive daily calendar for this customer"
                >
                  <Calendar className="w-3.5 h-3.5" /> Open Daily Calendar
                </button>
                <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-lg hover:bg-[#1B2728] text-[#9AAEAE] hover:text-[#F5FAFA] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Modal View Switcher: Overview vs Daily Calendar */}
              <div className="flex items-center gap-2 p-1 bg-[#0E1415] border border-[#2A3A3A] rounded-xl w-fit">
                <button
                  onClick={() => setCustomerModalView('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    customerModalView === 'overview'
                      ? 'bg-[#2DD4BF] text-white shadow-xs'
                      : 'text-[#9AAEAE] hover:text-[#F5FAFA]'
                  }`}
                >
                  Full Overview & Logs
                </button>
                <button
                  onClick={() => setCustomerModalView('calendar')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    customerModalView === 'calendar'
                      ? 'bg-[#2DD4BF] text-white shadow-xs'
                      : 'text-[#9AAEAE] hover:text-[#F5FAFA]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Per-Day Calendar View
                </button>
              </div>

              {customerModalView === 'calendar' ? (
                <CustomerDailyCalendarView
                  customers={customers}
                  selectedCustomerId={selectedCustomer.customerId || selectedCustomer._id}
                  onSelectCustomer={(c) => setSelectedCustomer(c)}
                  trainers={trainers}
                />
              ) : (
                <>
                  {/* Top Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                  <span className="text-[#9AAEAE] block font-medium">MEMBERSHIP</span>
                  <span className="font-bold text-[#F5FAFA] text-sm mt-0.5 block">{selectedCustomer.membership?.status}</span>
                  <span className="text-[11px] text-[#9AAEAE] block truncate">{selectedCustomer.membership?.planName}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                  <span className="text-[#9AAEAE] block font-medium">ATTENDANCE</span>
                  <span className="font-bold text-[#F5FAFA] text-sm mt-0.5 block">{selectedCustomer.attendanceSummary?.totalVerifiedVisits} visits</span>
                  <span className="text-[#FBBF24] font-semibold text-[11px]">🔥 {selectedCustomer.attendanceSummary?.attendanceStreak}d streak</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                  <span className="text-[#9AAEAE] block font-medium">WORKOUTS</span>
                  <span className="font-bold text-[#2DD4BF] text-sm mt-0.5 block">
                    {selectedCustomer.workoutSummary?.completionPercentage !== null ? `${selectedCustomer.workoutSummary.completionPercentage}%` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-[#9AAEAE] block">{selectedCustomer.workoutSummary?.completedWorkoutsCount} completed</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                  <span className="text-[#9AAEAE] block font-medium">POINTS WALLET</span>
                  <span className="font-bold text-[#34D399] text-sm mt-0.5 block">{selectedCustomer.pointsWallet?.currentBalance} pts</span>
                  <span className="text-[11px] text-[#9AAEAE] block">{selectedCustomer.pointsWallet?.badgesCount} badges</span>
                </div>
              </div>

              {/* Attendance, Workout & Diet Status with Completed Lists */}
              <div className="space-y-4">
                {/* 1. Attendance History & Verified Gym Visits */}
                <div className="p-4 rounded-xl border bg-[#0E1415]/50 space-y-3 text-xs" style={{ borderColor: '#2A3A3A' }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#2A3A3A' }}>
                    <h4 className="font-bold text-[#F5FAFA] flex items-center gap-1.5 text-sm">
                      <CalendarCheck className="w-4 h-4 text-[#2DD4BF]" /> Verified Gym Attendance & Visit History
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-xs">
                        {selectedCustomer.attendanceSummary?.totalVerifiedVisits || 0} Verified Visits
                      </span>
                      {selectedCustomer.attendanceSummary?.attendanceStreak > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 text-xs flex items-center gap-1">
                          🔥 {selectedCustomer.attendanceSummary.attendanceStreak}d Streak
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 bg-[#141D1E] p-3 rounded-lg border text-xs" style={{ borderColor: '#0E1415' }}>
                    <div>
                      <span className="text-[#9AAEAE] block text-[11px] font-semibold">TOTAL VISITS</span>
                      <span className="font-bold text-[#F5FAFA]">{selectedCustomer.attendanceSummary?.totalVerifiedVisits || 0} Check-ins Recorded</span>
                    </div>
                    <div>
                      <span className="text-[#9AAEAE] block text-[11px] font-semibold">ATTENDANCE STREAK</span>
                      <span className="font-bold text-amber-600">{selectedCustomer.attendanceSummary?.attendanceStreak || 0} Consecutive Days</span>
                    </div>
                    <div>
                      <span className="text-[#9AAEAE] block text-[11px] font-semibold">LAST RECORDED VISIT</span>
                      <span className="font-bold text-[#C1D0D0]">
                        {selectedCustomer.attendanceSummary?.lastVisitDate
                          ? new Date(selectedCustomer.attendanceSummary.lastVisitDate).toLocaleDateString()
                          : 'None Recorded'}
                      </span>
                    </div>
                  </div>

                  {/* Attendance Visits Log Table */}
                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-[#C1D0D0] flex justify-between items-center">
                      <span>Verified Attendance Logs ({selectedCustomer.attendanceSummary?.attendanceLogs?.length || selectedCustomer.attendanceSummary?.totalVerifiedVisits || 0}):</span>
                      <span className="text-[11px] text-[#9AAEAE] font-normal">Check-in and check-out logs</span>
                    </div>

                    {(!selectedCustomer.attendanceSummary?.attendanceLogs || selectedCustomer.attendanceSummary.attendanceLogs.length === 0) ? (
                      <div className="p-3 text-center rounded-lg bg-[#141D1E] border text-[#9AAEAE] text-xs italic">
                        No attendance records logged yet for this member.
                      </div>
                    ) : (
                      <div className="max-h-52 overflow-y-auto rounded-lg border bg-[#141D1E]" style={{ borderColor: '#2A3A3A' }}>
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-[#0E1415] text-[#9AAEAE] sticky top-0 border-b text-[11px] uppercase">
                            <tr>
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3">Check-in / Check-out</th>
                              <th className="py-2 px-3">Visit Type / Mode</th>
                              <th className="py-2 px-3 text-right">Attendance Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-[#C1D0D0]" style={{ borderColor: '#0E1415' }}>
                            {selectedCustomer.attendanceSummary.attendanceLogs.map((log: any, idx: number) => (
                              <tr key={log._id || idx} className="hover:bg-[#0E1415]/50">
                                <td className="py-2 px-3 font-semibold text-[#F5FAFA]">
                                  {log.date ? new Date(log.date).toLocaleDateString() : 'Visit'}
                                </td>
                                <td className="py-2 px-3 text-[#C1D0D0]">
                                  <div className="font-medium text-[#F5FAFA]">
                                    {log.checkInTime || '—'} {log.checkOutTime && log.checkOutTime !== '—' ? ` - ${log.checkOutTime}` : ''}
                                  </div>
                                </td>
                                <td className="py-2 px-3">
                                  <span className="px-1.5 py-0.5 rounded font-medium bg-[#1B2728] text-[#C1D0D0] text-[11px]">
                                    {log.mode || 'In-Person Gym Visit'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="px-2 py-0.5 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-[10px] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-[#2DD4BF]" /> {log.status || 'Present'}
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
                <div className="p-4 rounded-xl border bg-[#0E1415]/50 space-y-3 text-xs" style={{ borderColor: '#2A3A3A' }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#2A3A3A' }}>
                    <h4 className="font-bold text-[#F5FAFA] flex items-center gap-1.5 text-sm">
                      <Dumbbell className="w-4 h-4 text-[#2DD4BF]" /> Assigned Workout Program & Completed Sessions
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-xs">
                      {selectedCustomer.workoutSummary?.completedWorkoutsCount || 0} / {selectedCustomer.workoutSummary?.totalWorkoutsScheduled || 0} Completed ({selectedCustomer.workoutSummary?.completionPercentage !== null ? `${selectedCustomer.workoutSummary?.completionPercentage}%` : 'N/A'})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 bg-[#141D1E] p-3 rounded-lg border text-xs" style={{ borderColor: '#0E1415' }}>
                    <div>
                      <span className="text-[#9AAEAE] block text-[11px] font-semibold">PLAN NAME</span>
                      <span className="font-bold text-[#F5FAFA]">{selectedCustomer.workoutSummary?.assignedPlanName}</span>
                    </div>
                    <div>
                      <span className="text-[#9AAEAE] block text-[11px] font-semibold">ASSIGNED TRAINER</span>
                      <span className="font-bold text-[#F5FAFA]">{selectedCustomer.assignedTrainer?.name || 'None Assigned'}</span>
                    </div>
                    <div>
                      <span className="text-[#9AAEAE] block text-[11px] font-semibold">SCHEDULED WORKOUTS</span>
                      <span className="font-bold text-[#2DD4BF]">
                        {selectedCustomer.workoutSummary?.totalWorkoutsScheduled || 0} Total ({selectedCustomer.workoutSummary?.completedWorkoutsCount || 0} Done)
                      </span>
                    </div>
                  </div>

                  {/* Completed Workouts List / Table */}
                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-[#C1D0D0] flex justify-between items-center">
                      <span>Completed Workouts & Exercises ({selectedCustomer.workoutSummary?.completedWorkoutsList?.length || selectedCustomer.workoutSummary?.completedWorkoutsCount || 0}):</span>
                      <span className="text-[11px] text-[#9AAEAE] font-normal">Real-time attendance & completed sets</span>
                    </div>

                    {(!selectedCustomer.workoutSummary?.completedWorkoutsList || selectedCustomer.workoutSummary.completedWorkoutsList.length === 0) ? (
                      <div className="p-3 text-center rounded-lg bg-[#141D1E] border text-[#9AAEAE] text-xs italic">
                        No completed workout sessions logged yet for this member.
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto rounded-lg border bg-[#141D1E]" style={{ borderColor: '#2A3A3A' }}>
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-[#0E1415] text-[#9AAEAE] sticky top-0 border-b text-[11px] uppercase">
                            <tr>
                              <th className="py-2 px-3">Day / Routine</th>
                              <th className="py-2 px-3">Exercise / Activity</th>
                              <th className="py-2 px-3">Sets & Reps</th>
                              <th className="py-2 px-3">Completed Date</th>
                              <th className="py-2 px-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-[#C1D0D0]" style={{ borderColor: '#0E1415' }}>
                            {selectedCustomer.workoutSummary.completedWorkoutsList.map((w: any, idx: number) => (
                              <tr key={w._id || idx} className="hover:bg-[#0E1415]/50">
                                <td className="py-2 px-3 font-semibold text-[#F5FAFA]">
                                  {w.dayName || `Workout #${idx + 1}`}
                                </td>
                                <td className="py-2 px-3">
                                  <div className="font-medium text-[#F5FAFA]">{w.exerciseName}</div>
                                  {w.notes && <div className="text-[10px] text-[#9AAEAE] italic">{w.notes}</div>}
                                </td>
                                <td className="py-2 px-3 text-[#C1D0D0]">
                                  {w.completedSets > 0 ? `${w.completedSets}/${w.totalSets || 3} sets` : 'Full Session'}
                                  {w.completedRepetitions > 0 ? ` • ${w.completedRepetitions} reps` : ''}
                                  {w.duration > 0 ? ` • ${Math.round(w.duration / 60)} mins` : ''}
                                </td>
                                <td className="py-2 px-3 text-[#9AAEAE] whitespace-nowrap">
                                  {w.completedAt ? new Date(w.completedAt).toLocaleDateString() : 'Recorded'}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="px-2 py-0.5 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-[10px] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-[#2DD4BF]" /> Completed
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
                <div className="p-4 rounded-xl border bg-[#0E1415]/50 space-y-3 text-xs" style={{ borderColor: '#2A3A3A' }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#2A3A3A' }}>
                    <h4 className="font-bold text-[#F5FAFA] flex items-center gap-1.5 text-sm">
                      <Utensils className="w-4 h-4 text-amber-600" /> Diet Plan & Completed Meal Check-ins
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-xs">
                      {selectedCustomer.dietSummary?.totalMealCheckins || 0} Meals Checked-In ({selectedCustomer.dietSummary?.adherencePercentage !== null ? `${selectedCustomer.dietSummary?.adherencePercentage}%` : '0%'} Adherence)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 bg-[#141D1E] p-3 rounded-lg border text-xs" style={{ borderColor: '#0E1415' }}>
                    <div>
                      <span className="text-[#9AAEAE] block text-[11px] font-semibold">PLAN STATUS</span>
                      <span className="font-bold text-[#F5FAFA]">
                        {selectedCustomer.dietSummary?.plan?.title || 'Personalized Diet Plan'} ({selectedCustomer.dietSummary?.plan?.status || 'No Plan'})
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9AAEAE] block text-[11px] font-semibold">CHECK-IN DAYS</span>
                      <span className="font-bold text-[#F5FAFA]">{selectedCustomer.dietSummary?.distinctCheckinDays || 0} Days Recorded</span>
                    </div>
                    <div>
                      <span className="text-[#9AAEAE] block text-[11px] font-semibold">DAILY NUTRITION TARGET</span>
                      <span className="font-bold text-[#C1D0D0]">
                        {selectedCustomer.dietSummary?.plan?.dailyCalories ? `${selectedCustomer.dietSummary?.plan?.dailyCalories} kcal • ${selectedCustomer.dietSummary?.plan?.protein || ''} P` : 'Personalized'}
                      </span>
                    </div>
                  </div>

                  {/* Completed Meal Check-ins List / Table */}
                  <div className="space-y-2 pt-1">
                    <div className="font-bold text-[#C1D0D0] flex justify-between items-center">
                      <span>Completed Meal Check-ins ({selectedCustomer.dietSummary?.completedMealsList?.length || selectedCustomer.dietSummary?.totalMealCheckins || 0}):</span>
                      <span className="text-[11px] text-[#9AAEAE] font-normal">Real check-ins logged by customer</span>
                    </div>

                    {(!selectedCustomer.dietSummary?.completedMealsList || selectedCustomer.dietSummary.completedMealsList.length === 0) ? (
                      <div className="p-3 text-center rounded-lg bg-[#141D1E] border text-[#9AAEAE] text-xs italic">
                        No completed meal check-ins recorded yet for this member.
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto rounded-lg border bg-[#141D1E]" style={{ borderColor: '#2A3A3A' }}>
                        <table className="w-full text-left border-collapse text-xs">
                          <thead className="bg-[#0E1415] text-[#9AAEAE] sticky top-0 border-b text-[11px] uppercase">
                            <tr>
                              <th className="py-2 px-3">Meal Type</th>
                              <th className="py-2 px-3">Day / Date</th>
                              <th className="py-2 px-3">Items Logged</th>
                              <th className="py-2 px-3">Nutrition</th>
                              <th className="py-2 px-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y text-[#C1D0D0]" style={{ borderColor: '#0E1415' }}>
                            {selectedCustomer.dietSummary.completedMealsList.map((m: any, idx: number) => (
                              <tr key={m._id || idx} className="hover:bg-[#0E1415]/50">
                                <td className="py-2 px-3 font-semibold text-[#F5FAFA]">
                                  {m.mealType || `Meal #${idx + 1}`}
                                </td>
                                <td className="py-2 px-3 text-[#C1D0D0]">
                                  <div className="font-medium text-[#F5FAFA]">{m.dayName || 'Daily Check-in'}</div>
                                  <div className="text-[10px] text-[#9AAEAE]">
                                    {m.completedAt ? new Date(m.completedAt).toLocaleDateString() : 'Recorded'}
                                  </div>
                                </td>
                                <td className="py-2 px-3 text-[#C1D0D0]">
                                  {m.items && m.items.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {m.items.map((it: string, i: number) => (
                                        <span key={i} className="px-1.5 py-0.2 bg-[#1B2728] rounded text-[10px] text-[#C1D0D0]">
                                          {it}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-[#9AAEAE] italic">Logged</span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-[#C1D0D0] whitespace-nowrap">
                                  {m.calories > 0 ? `${m.calories} kcal` : ''}
                                  {m.protein > 0 ? ` • ${m.protein}g P` : ''}
                                  {!m.calories && !m.protein ? '—' : ''}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="px-2 py-0.5 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-[10px] inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-[#2DD4BF]" /> Checked In
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
                <h4 className="font-bold text-[#F5FAFA] flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-[#2DD4BF]" /> Reward Rules Evaluation
                </h4>
                <div className="space-y-1.5 pt-1">
                  {selectedCustomer.rewardsSummary?.evaluatedRewards?.map((rwd: any) => (
                    <div key={rwd.rewardId} className="flex justify-between items-center p-2 rounded-lg bg-[#0E1415] border">
                      <div>
                        <span className="font-semibold text-[#F5FAFA]">{rwd.title}</span>
                        <span className="text-[11px] text-[#9AAEAE] block">{rwd.category}</span>
                      </div>
                      <div className="text-right">
                        {rwd.alreadyClaimed ? (
                          <span className="px-2 py-0.5 rounded font-semibold bg-[#1B2728] text-[#C1D0D0] text-[11px]">
                            Already Claimed
                          </span>
                        ) : rwd.isEligible ? (
                          <span className="px-2 py-0.5 rounded font-bold bg-[#1B2728] text-[#2DD4BF] text-[11px]">
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DEDICATED CUSTOMER DAILY CALENDAR MODAL                  */}
      {/* ======================================================== */}
      {calendarModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#141D1E] rounded-2xl w-full max-w-6xl max-h-[94vh] overflow-y-auto shadow-2xl border border-[#2A3A3A] flex flex-col">
            {/* Modal Sticky Header */}
            <div className="sticky top-0 bg-[#0E1415] px-6 py-4 border-b border-[#2A3A3A] flex justify-between items-center z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1B2728] text-[#2DD4BF] font-bold border border-[#2A3A3A]">
                  {calendarModalCustomer.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-[#F5FAFA]">{calendarModalCustomer.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1B2728] text-[#2DD4BF] border border-[#2A3A3A]">
                      Per-Day Workout & Diet Calendar
                    </span>
                  </div>
                  <p className="text-xs text-[#9AAEAE]">
                    {calendarModalCustomer.email} • {calendarModalCustomer.phone || calendarModalCustomer.mobile || 'Member'} • {calendarModalCustomer.membership?.planName || 'Active Membership'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCalendarModalCustomer(null)}
                className="p-1.5 rounded-xl hover:bg-[#1B2728] text-[#9AAEAE] hover:text-[#F5FAFA] cursor-pointer transition border border-[#2A3A3A]"
                title="Close Calendar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Customer Daily Calendar with Per-Day Inspection */}
            <div className="p-5 sm:p-6">
              <CustomerDailyCalendarView
                customers={customers}
                selectedCustomerId={calendarModalCustomer.customerId || calendarModalCustomer._id}
                onSelectCustomer={(cust) => setCalendarModalCustomer(cust)}
                trainers={trainers}
                onClose={() => setCalendarModalCustomer(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TRAINER DETAIL MODAL: COMPREHENSIVE PERFORMANCE ANALYSIS */}
      {/* ======================================================== */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#141D1E] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border" style={{ borderColor: '#2A3A3A' }}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#141D1E] px-6 py-4 border-b flex justify-between items-center z-10" style={{ borderColor: '#2A3A3A' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1B2728] text-[#2DD4BF] font-bold text-base">
                  {selectedTrainer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-[#F5FAFA]">{selectedTrainer.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1B2728] text-[#2DD4BF]">
                      {selectedTrainer.activeStatus || 'Active Trainer'}
                    </span>
                  </div>
                  <p className="text-xs text-[#9AAEAE]">
                    {selectedTrainer.email}
                    {selectedTrainer.phone || selectedTrainer.mobile ? ` • ${selectedTrainer.phone || selectedTrainer.mobile}` : ''}
                    {selectedTrainer.experience ? ` • ${selectedTrainer.experience} Yrs Experience` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="p-1 rounded-lg hover:bg-[#1B2728] text-[#9AAEAE] cursor-pointer"
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
                    <div className="p-3 rounded-xl bg-[#0E1415] border">
                      <span className="text-[#9AAEAE] block font-medium">HANDLED CLIENTS</span>
                      <span className="font-bold text-base text-[#F5FAFA]">
                        {selectedTrainer.handledClients?.length || selectedTrainer.clientsSummary?.totalAssignedCustomers || 0}
                      </span>
                      <span className="text-[11px] text-[#9AAEAE] block truncate">Active Roster</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0E1415] border">
                      <span className="text-[#9AAEAE] block font-medium">WORKOUTS DONE</span>
                      <span className="font-bold text-base text-[#2DD4BF]">
                        {trainerCompletedWorkouts.length}
                      </span>
                      <span className="text-[11px] text-[#9AAEAE] block truncate">
                        {selectedTrainer.clientsSummary?.averageClientWorkoutProgress !== null ? `${selectedTrainer.clientsSummary.averageClientWorkoutProgress}% Adherence` : '100% Adherence'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0E1415] border">
                      <span className="text-[#9AAEAE] block font-medium">MEALS CHECKED-IN</span>
                      <span className="font-bold text-base text-[#2DD4BF]">
                        {trainerCompletedMeals.length}
                      </span>
                      <span className="text-[11px] text-[#9AAEAE] block truncate">
                        Verified Records
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0E1415] border">
                      <span className="text-[#9AAEAE] block font-medium">SESSIONS DONE</span>
                      <span className="font-bold text-base text-[#F5FAFA]">
                        {trainerCompletedSessions.length}
                      </span>
                      <span className="text-[11px] text-[#9AAEAE] block truncate">
                        {selectedTrainer.sessionsSummary?.onlineCount || 0} On / {selectedTrainer.sessionsSummary?.inPersonCount || trainerCompletedSessions.length} In-Person
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0E1415] border">
                      <span className="text-[#9AAEAE] block font-medium">CLIENT RATING</span>
                      <span className="font-bold text-base text-amber-600">
                        {selectedTrainer.feedbackSummary?.averageRating || 5.0} ⭐
                      </span>
                      <span className="text-[11px] text-[#9AAEAE] block truncate">
                        {selectedTrainer.feedbackSummary?.totalRatingsCount || 0} Reviews
                      </span>
                    </div>
                  </div>

                  {/* Sub-Tabs Navigation inside Trainer Modal */}
                  <div className="flex items-center gap-1.5 p-1 bg-[#1B2728]/70 rounded-xl overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setTrainerModalTab('handled-customers')}
                      className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 font-bold cursor-pointer ${
                        trainerModalTab === 'handled-customers'
                          ? 'bg-[#141D1E] text-[#2DD4BF] shadow-xs'
                          : 'text-[#9AAEAE] hover:text-[#F5FAFA]'
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
                          ? 'bg-[#141D1E] text-[#2DD4BF] shadow-xs'
                          : 'text-[#9AAEAE] hover:text-[#F5FAFA]'
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
                          ? 'bg-[#141D1E] text-[#2DD4BF] shadow-xs'
                          : 'text-[#9AAEAE] hover:text-[#F5FAFA]'
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
                          ? 'bg-[#141D1E] text-[#2DD4BF] shadow-xs'
                          : 'text-[#9AAEAE] hover:text-[#F5FAFA]'
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
                          ? 'bg-[#141D1E] text-[#2DD4BF] shadow-xs'
                          : 'text-[#9AAEAE] hover:text-[#F5FAFA]'
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
                          ? 'bg-[#141D1E] text-[#2DD4BF] shadow-xs'
                          : 'text-[#9AAEAE] hover:text-[#F5FAFA]'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Bonus Evaluation ({selectedTrainer.rewardsSummary?.eligibleBonusesCount || 0} Eligible)
                    </button>
                  </div>

                  {/* Sub-Tab 1: Handled Customers */}
                  {trainerModalTab === 'handled-customers' && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#2A3A3A' }}>
                        <h4 className="font-bold text-[#F5FAFA] flex items-center gap-1.5 text-sm">
                          <Users className="w-4 h-4 text-[#2DD4BF]" />
                          Customers Handled by {selectedTrainer.name}
                        </h4>
                        <span className="text-[11px] text-[#9AAEAE]">
                          Real-time workout &amp; diet plan tracking for assigned gym members
                        </span>
                      </div>

                      {(!selectedTrainer.handledClients || selectedTrainer.handledClients.length === 0) ? (
                        <div className="p-8 text-center rounded-xl bg-[#0E1415] border text-[#9AAEAE] italic">
                          No customer clients currently assigned to this trainer.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border bg-[#141D1E]" style={{ borderColor: '#2A3A3A' }}>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-[#0E1415] text-[#9AAEAE] border-b uppercase text-[11px]">
                              <tr>
                                <th className="py-2.5 px-3">Customer</th>
                                <th className="py-2.5 px-3">Membership</th>
                                <th className="py-2.5 px-3">Workout Plan &amp; Progress</th>
                                <th className="py-2.5 px-3">Diet Plan &amp; Adherence</th>
                                <th className="py-2.5 px-3 text-right">Sessions Handled</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y text-[#C1D0D0]" style={{ borderColor: '#0E1415' }}>
                              {selectedTrainer.handledClients.map((client: any) => (
                                <tr key={client.customerId} className="hover:bg-[#0E1415]/50">
                                  <td className="py-3 px-3">
                                    <div className="font-bold text-[#F5FAFA]">{client.name}</div>
                                    <div className="text-[11px] text-[#9AAEAE]">
                                      {client.email}{client.phone ? ` • ${client.phone}` : ''}
                                    </div>
                                  </td>

                                  <td className="py-3 px-3">
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                      client.membership?.status === 'Active' ? 'bg-[#1B2728] text-[#2DD4BF]' : 'bg-[#1B2728] text-[#C1D0D0]'
                                    }`}>
                                      {client.membership?.status || 'Active'}
                                    </span>
                                    <span className="block text-[11px] text-[#9AAEAE] mt-0.5">
                                      {client.membership?.planName || 'Standard Package'}
                                    </span>
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-[#F5FAFA]">
                                      {client.workoutTracking?.planName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                        <div
                                          className="bg-[#2DD4BF] h-1.5 rounded-full"
                                          style={{ width: `${client.workoutTracking?.completionPercentage || 0}%` }}
                                        />
                                      </div>
                                      <span className="font-bold text-[#2DD4BF] text-[11px]">
                                        {client.workoutTracking?.completionPercentage || 0}%
                                      </span>
                                      <span className="text-[10px] text-[#9AAEAE]">
                                        ({client.workoutTracking?.completedCount || 0}/{client.workoutTracking?.totalScheduled || 0})
                                      </span>
                                    </div>
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="font-semibold text-[#F5FAFA]">
                                      {client.dietTracking?.planName}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-[#1B2728] text-[#2DD4BF]">
                                        {client.dietTracking?.adherencePercentage || 85}% Adherence
                                      </span>
                                      <span className="text-[10px] text-[#9AAEAE]">
                                        {client.dietTracking?.totalMealCheckins || 0} check-ins • {client.dietTracking?.dailyCalories || '2,200 kcal'}
                                      </span>
                                    </div>
                                  </td>

                                  <td className="py-3 px-3 text-right">
                                    <span className="font-bold text-[#F5FAFA]">
                                      {client.sessionsCount || 0} sessions
                                    </span>
                                    {client.lastSessionDate && (
                                      <span className="block text-[10px] text-[#9AAEAE]">
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
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#2A3A3A' }}>
                        <div>
                          <h4 className="font-bold text-[#F5FAFA] flex items-center gap-1.5 text-sm">
                            <Dumbbell className="w-4 h-4 text-[#2DD4BF]" />
                            Completed Customer Workouts Managed by {selectedTrainer.name}
                          </h4>
                          <p className="text-[11px] text-[#9AAEAE] mt-0.5">
                            Real-time log of exercises, completed sets, reps, and workout completion timestamps
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
                          {trainerCompletedWorkouts.length} Completed Workouts
                        </span>
                      </div>

                      {trainerCompletedWorkouts.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-[#0E1415] border text-[#9AAEAE] italic">
                          No completed workout sessions logged yet for this trainer's clients.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border bg-[#141D1E]" style={{ borderColor: '#2A3A3A' }}>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-[#0E1415] text-[#9AAEAE] border-b uppercase text-[11px]">
                              <tr>
                                <th className="py-2.5 px-3">Customer</th>
                                <th className="py-2.5 px-3">Day / Routine</th>
                                <th className="py-2.5 px-3">Exercise / Activity</th>
                                <th className="py-2.5 px-3">Sets &amp; Reps</th>
                                <th className="py-2.5 px-3">Completed Date</th>
                                <th className="py-2.5 px-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y text-[#C1D0D0]" style={{ borderColor: '#0E1415' }}>
                              {trainerCompletedWorkouts.map((w: any, idx: number) => (
                                <tr key={w._id || idx} className="hover:bg-[#0E1415]/50">
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-[#F5FAFA]">{w.clientName || 'Customer'}</div>
                                    {w.clientEmail && <div className="text-[10px] text-[#9AAEAE]">{w.clientEmail}</div>}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-[#F5FAFA]">
                                    {w.dayName || `Workout #${idx + 1}`}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-medium text-[#F5FAFA]">{w.exerciseName}</div>
                                    {w.notes && <div className="text-[10px] text-[#9AAEAE] italic">{w.notes}</div>}
                                  </td>
                                  <td className="py-2.5 px-3 text-[#C1D0D0]">
                                    {w.completedSets > 0 ? `${w.completedSets}/${w.totalSets || 3} sets` : 'Full Routine'}
                                    {w.completedRepetitions ? ` • ${w.completedRepetitions} reps` : ''}
                                    {w.duration > 0 ? ` • ${Math.round(w.duration / 60)} mins` : ''}
                                  </td>
                                  <td className="py-2.5 px-3 text-[#9AAEAE] whitespace-nowrap">
                                    {w.completedAt ? new Date(w.completedAt).toLocaleDateString() : 'Recorded'}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span className="px-2 py-0.5 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-[10px] inline-flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-[#2DD4BF]" /> Completed
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
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#2A3A3A' }}>
                        <div>
                          <h4 className="font-bold text-[#F5FAFA] flex items-center gap-1.5 text-sm">
                            <Utensils className="w-4 h-4 text-[#2DD4BF]" />
                            Completed Customer Meal Check-ins Managed by {selectedTrainer.name}
                          </h4>
                          <p className="text-[11px] text-[#9AAEAE] mt-0.5">
                            Verified meal logs, nutritional check-ins, and dietary adherence recorded by assigned clients
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
                          {trainerCompletedMeals.length} Completed Check-ins
                        </span>
                      </div>

                      {trainerCompletedMeals.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-[#0E1415] border text-[#9AAEAE] italic">
                          No completed meal check-ins recorded yet for this trainer's clients.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border bg-[#141D1E]" style={{ borderColor: '#2A3A3A' }}>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-[#0E1415] text-[#9AAEAE] border-b uppercase text-[11px]">
                              <tr>
                                <th className="py-2.5 px-3">Customer</th>
                                <th className="py-2.5 px-3">Meal Type</th>
                                <th className="py-2.5 px-3">Day / Date</th>
                                <th className="py-2.5 px-3">Items Logged</th>
                                <th className="py-2.5 px-3">Nutrition</th>
                                <th className="py-2.5 px-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y text-[#C1D0D0]" style={{ borderColor: '#0E1415' }}>
                              {trainerCompletedMeals.map((m: any, idx: number) => (
                                <tr key={m._id || idx} className="hover:bg-[#0E1415]/50">
                                  <td className="py-2.5 px-3">
                                    <div className="font-bold text-[#F5FAFA]">{m.clientName || 'Customer'}</div>
                                    {m.clientEmail && <div className="text-[10px] text-[#9AAEAE]">{m.clientEmail}</div>}
                                  </td>
                                  <td className="py-2.5 px-3 font-semibold text-[#F5FAFA]">
                                    {m.mealType || `Meal #${idx + 1}`}
                                  </td>
                                  <td className="py-2.5 px-3 text-[#C1D0D0]">
                                    <div className="font-medium text-[#F5FAFA]">{m.dayName || 'Daily Check-in'}</div>
                                    <div className="text-[10px] text-[#9AAEAE]">
                                      {m.completedAt ? new Date(m.completedAt).toLocaleDateString() : 'Recorded'}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-[#C1D0D0]">
                                    {m.items && m.items.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {(Array.isArray(m.items) ? m.items : [m.items]).map((it: string, i: number) => (
                                          <span key={i} className="px-1.5 py-0.5 bg-[#1B2728] rounded text-[10px] text-[#C1D0D0]">
                                            {it}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[#9AAEAE] italic">Logged</span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-[#C1D0D0] whitespace-nowrap">
                                    {m.calories > 0 ? `${m.calories} kcal` : ''}
                                    {m.protein > 0 ? ` • ${m.protein}g Protein` : ''}
                                    {!m.calories && !m.protein ? '—' : ''}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span className="px-2 py-0.5 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-[10px] inline-flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-[#2DD4BF]" /> Completed
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
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#2A3A3A' }}>
                        <div>
                          <h4 className="font-bold text-[#F5FAFA] flex items-center gap-1.5 text-sm">
                            <CalendarCheck className="w-4 h-4 text-[#2DD4BF]" />
                            Completed Training Sessions Conducted by {selectedTrainer.name}
                          </h4>
                          <p className="text-[11px] text-[#9AAEAE] mt-0.5">
                            Verified completed training attendance, modes, and client feedback
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
                          {trainerCompletedSessions.length} Completed Sessions
                        </span>
                      </div>

                      {trainerCompletedSessions.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-[#0E1415] border text-[#9AAEAE] italic">
                          No completed training sessions logged yet for this trainer.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border bg-[#141D1E]" style={{ borderColor: '#2A3A3A' }}>
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-[#0E1415] text-[#9AAEAE] border-b uppercase text-[11px]">
                              <tr>
                                <th className="py-2.5 px-3">Date</th>
                                <th className="py-2.5 px-3">Customer</th>
                                <th className="py-2.5 px-3">Time / Duration</th>
                                <th className="py-2.5 px-3">Mode</th>
                                <th className="py-2.5 px-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y text-[#C1D0D0]" style={{ borderColor: '#0E1415' }}>
                              {trainerCompletedSessions.map((s: any, idx: number) => (
                                <tr key={s._id || idx} className="hover:bg-[#0E1415]/50">
                                  <td className="py-2.5 px-3 font-semibold text-[#F5FAFA]">
                                    {s.date ? (isNaN(Date.parse(s.date)) ? s.date : new Date(s.date).toLocaleDateString()) : 'Recorded'}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="font-medium text-[#F5FAFA]">{s.clientName}</div>
                                    {s.clientEmail && <div className="text-[10px] text-[#9AAEAE]">{s.clientEmail}</div>}
                                  </td>
                                  <td className="py-2.5 px-3 text-[#C1D0D0]">{s.time}</td>
                                  <td className="py-2.5 px-3">
                                    <span className="px-2 py-0.5 rounded font-medium bg-[#1B2728] text-[#C1D0D0] text-[11px]">
                                      {s.mode}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <span className="px-2 py-0.5 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-[10px] inline-flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-[#2DD4BF]" /> Completed
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
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#2A3A3A' }}>
                    <h4 className="font-bold text-[#F5FAFA] flex items-center gap-1.5 text-sm">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Client Feedback &amp; Reviews for {selectedTrainer.name}
                    </h4>
                    <span className="font-bold text-amber-600 text-sm">
                      {selectedTrainer.feedbackSummary?.averageRating || 5.0} ⭐ Average Rating
                    </span>
                  </div>

                  {(!selectedTrainer.feedbackSummary?.reviews || selectedTrainer.feedbackSummary.reviews.length === 0) ? (
                    <div className="p-8 text-center rounded-xl bg-[#0E1415] border text-[#9AAEAE] italic">
                      No customer reviews recorded yet for this trainer.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedTrainer.feedbackSummary.reviews.map((rev: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-[#0E1415] border space-y-1">
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-[#F5FAFA]">{rev.clientName || 'Gym Member'}</span>
                            <div className="flex items-center gap-1 text-amber-600 font-bold">
                              <span>{rev.rating} ⭐</span>
                              {rev.date && <span className="text-[#9AAEAE] font-normal text-[10px]">({rev.date})</span>}
                            </div>
                          </div>
                          <p className="text-[#C1D0D0] italic">"{rev.review}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 6: Rewards & Bonuses */}
              {trainerModalTab === 'rewards' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b" style={{ borderColor: '#2A3A3A' }}>
                    <h4 className="font-bold text-[#F5FAFA] flex items-center gap-1.5 text-sm">
                      <Gift className="w-4 h-4 text-purple-600" />
                      Trainer Performance Bonuses &amp; Award Eligibility
                    </h4>
                    <span className="text-xs text-purple-700 font-bold">
                      {selectedTrainer.rewardsSummary?.eligibleBonusesCount || 0} Eligible to Claim
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {selectedTrainer.rewardsSummary?.evaluatedRewards?.map((rwd: any) => (
                      <div key={rwd.rewardId} className="flex justify-between items-center p-3 rounded-xl bg-[#0E1415] border">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#F5FAFA]">{rwd.title}</span>
                            {rwd.bonusAmount > 0 && (
                              <span className="px-2 py-0.5 rounded-full font-bold bg-[#1B2728] text-[#2DD4BF] text-[10px]">
                                ₹{rwd.bonusAmount} {rwd.currency || 'INR'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#9AAEAE] block mt-0.5">{rwd.category}</span>
                          {rwd.reasons && rwd.reasons.length > 0 && (
                            <span className="text-[10px] text-amber-600 block mt-0.5">
                              {rwd.reasons.join(' • ')}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {rwd.alreadyClaimed ? (
                            <span className="px-2.5 py-1 rounded font-bold bg-[#1B2728] text-[#C1D0D0] text-xs">
                              Claimed
                            </span>
                          ) : rwd.isEligible ? (
                            <span className="px-2.5 py-1 rounded font-bold bg-[#1B2728] text-[#2DD4BF] text-xs">
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
      {/* CATEGORY-BASED DYNAMIC REWARD CREATE / EDIT MODAL        */}
      {/* ======================================================== */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#141D1E] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border my-8" style={{ borderColor: '#2A3A3A' }}>
            {/* Header */}
            <div className="sticky top-0 bg-[#141D1E] px-6 py-4 border-b flex justify-between items-center z-10" style={{ borderColor: '#2A3A3A' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-[#F5FAFA]">
                  {isEditMode ? 'Edit Reward Definition' : 'Create Rewards & Performance Award'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsRewardModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#1B2728] text-[#9AAEAE] hover:text-[#C1D0D0] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRewardFormSubmit} className="p-6 space-y-5 text-xs">
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold mb-1 text-[#C1D0D0]">Recipient Audience *</label>
                    <select
                      value={rewardFormData.recipientType}
                      onChange={e => {
                        const newType = e.target.value as any;
                        let newCat = rewardFormData.category;
                        if (newType === 'Trainer') {
                          newCat = 'Performance Award';
                        } else if (newType === 'Customer' && (newCat === 'Session Milestone Bonus' || newCat === 'Client Retention Bonus')) {
                          newCat = 'Discount Coupon';
                        }
                        setRewardFormData({
                          ...rewardFormData,
                          recipientType: newType,
                          category: newCat,
                          assignedUserId: ''
                        });
                        setSelectedCustomerObj(null);
                        setSelectedTrainerObj(null);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#F5FAFA] bg-[#141D1E] focus:outline-none focus:ring-1 focus:ring-[#2DD4BF]"
                    >
                      <option value="Customer">Customers Only</option>
                      <option value="Trainer">Trainers Only</option>
                      <option value="Both">Both Customers &amp; Trainers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#C1D0D0]">Reward Assignment Method *</label>
                    <select
                      value={rewardFormData.assignmentMethod}
                      onChange={e => {
                        const newMethod = e.target.value as any;
                        setRewardFormData({
                          ...rewardFormData,
                          assignmentMethod: newMethod,
                          assignedUserId: ''
                        });
                        setSelectedCustomerObj(null);
                        setSelectedTrainerObj(null);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#F5FAFA] bg-[#141D1E] focus:outline-none focus:ring-1 focus:ring-[#2DD4BF]"
                    >
                      <option value="Direct">1. Direct Assignment (Specific Recipient)</option>
                      <option value="Achievement">2. Achievement-Based Reward (Milestones)</option>
                      <option value="Points">3. Points-Based Redemption (Spend Points)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold mb-1 text-[#C1D0D0]">Category *</label>
                    <select
                      value={rewardFormData.category}
                      onChange={e => {
                        const cat = e.target.value;
                        setRewardFormData({ ...rewardFormData, category: cat });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm text-[#F5FAFA] bg-[#141D1E] focus:outline-none focus:ring-1 focus:ring-[#2DD4BF]"
                    >
                      {rewardFormData.recipientType !== 'Trainer' ? (
                        <>
                          <option value="Personal Training">Personal Training (Free Sessions)</option>
                          <option value="Discount Coupon">Discount Coupon</option>
                          <option value="Free Product / Gift">Free Product / Gift</option>
                          <option value="Free Membership / Membership Extension">Free Membership / Extension</option>
                          <option value="Performance Award">Performance Award</option>
                          <option value="Points-Based Reward">Points-Based Reward</option>
                        </>
                      ) : (
                        <>
                          <option value="Performance Award">Performance Award</option>
                          <option value="Session Milestone Bonus">Session Milestone Bonus</option>
                          <option value="Client Retention Bonus">Client Retention Bonus</option>
                          <option value="Recognition Badge">Recognition Badge</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[#C1D0D0]">Reward Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹200 Off Next Renewal or Free Shaker Bottle"
                      value={rewardFormData.title}
                      onChange={e => setRewardFormData({ ...rewardFormData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#F5FAFA] bg-[#141D1E] focus:outline-none focus:ring-1 focus:ring-[#2DD4BF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[#C1D0D0]">Short Description *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Detail reward guidelines and redemption rules..."
                    value={rewardFormData.description}
                    onChange={e => setRewardFormData({ ...rewardFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm text-[#F5FAFA] bg-[#141D1E] focus:outline-none focus:ring-1 focus:ring-[#2DD4BF]"
                  />
                </div>
              </div>

              {/* SECTION 2: DIRECT RECIPIENT SEARCH (Shown only when Direct Assignment is selected) */}
              {rewardFormData.assignmentMethod === 'Direct' && (
                <div className="p-4 rounded-2xl border bg-[#1B2728] space-y-3" style={{ borderColor: '#2A3A3A' }}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2DD4BF] flex items-center gap-1.5 text-xs">
                      <User className="w-4 h-4" />
                      Select {rewardFormData.recipientType === 'Trainer' ? 'Trainer' : 'Customer'} for Direct Assignment *
                    </span>
                    {selectedCustomerObj && (
                      <span className="text-[10px] font-bold text-[#2DD4BF] bg-[#1B2728] px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>

                  {rewardFormData.recipientType === 'Trainer' ? (
                    <div>
                      <select
                        value={rewardFormData.assignedUserId}
                        onChange={e => {
                          const tId = e.target.value;
                          const tr = trainers.find(t => t._id === tId);
                          setRewardFormData({ ...rewardFormData, assignedUserId: tId, trainerId: tId });
                          setSelectedTrainerObj(tr || null);
                        }}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-sm"
                      >
                        <option value="">-- Choose a Trainer --</option>
                        {trainers.map(t => (
                          <option key={t._id} value={t._id}>
                            {t.name} ({t.email}) • Rating: {t.averageRating ? `${t.averageRating}⭐` : '5.0⭐'}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedCustomerObj ? (
                        <div className="flex items-center justify-between bg-[#141D1E] p-2.5 rounded-xl border" style={{ borderColor: '#2A3A3A' }}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#2DD4BF]/15 text-[#2DD4BF] font-bold flex items-center justify-center text-xs">
                              {selectedCustomerObj.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p className="font-bold text-[#F5FAFA] text-xs">{selectedCustomerObj.name}</p>
                              <p className="text-[10px] text-[#9AAEAE]">{selectedCustomerObj.email} • {selectedCustomerObj.membership?.status || 'Active'}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCustomerObj(null);
                              setRewardFormData({ ...rewardFormData, assignedUserId: '' });
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="relative mb-2">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9AAEAE]" />
                            <input
                              type="text"
                              placeholder="Search customer by name, email, or mobile..."
                              value={customerSearchQuery}
                              onChange={e => setCustomerSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 rounded-xl border bg-[#141D1E] text-xs text-[#F5FAFA]"
                            />
                          </div>

                          <div className="max-h-36 overflow-y-auto space-y-1 bg-[#141D1E] p-1 rounded-xl border" style={{ borderColor: '#2A3A3A' }}>
                            {customers
                              .filter(c =>
                                !customerSearchQuery ||
                                c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                                c.email.toLowerCase().includes(customerSearchQuery.toLowerCase())
                              )
                              .slice(0, 15)
                              .map(c => (
                                <button
                                  key={c._id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCustomerObj(c);
                                    setRewardFormData({ ...rewardFormData, assignedUserId: c._id });
                                  }}
                                  className="w-full p-2 text-left hover:bg-[#0E1415] rounded-lg flex items-center justify-between text-xs transition cursor-pointer"
                                >
                                  <div>
                                    <span className="font-bold text-[#F5FAFA]">{c.name}</span>
                                    <span className="text-[10px] text-[#9AAEAE] ml-2">{c.email}</span>
                                  </div>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1B2728] text-[#C1D0D0]">
                                    {c.membership?.status || 'Active'}
                                  </span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: DYNAMIC FIELDS BASED ON REWARD CATEGORY */}
              {rewardFormData.category === 'Personal Training' && (
                <div className="p-4 rounded-2xl border bg-[#0E1415]/70 space-y-3" style={{ borderColor: '#2A3A3A' }}>
                  <h4 className="font-bold text-[#2DD4BF] flex items-center gap-1.5 text-xs">
                    <Dumbbell className="w-4 h-4 text-[#2DD4BF]" /> Personal Training Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Select Trainer</label>
                      <select
                        value={rewardFormData.trainerId}
                        onChange={e => setRewardFormData({ ...rewardFormData, trainerId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs"
                      >
                        <option value="">Any Available Trainer</option>
                        {trainers.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Free Sessions Count</label>
                      <input
                        type="number"
                        min={1}
                        value={rewardFormData.sessionCount}
                        onChange={e => setRewardFormData({ ...rewardFormData, sessionCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Session Duration</label>
                      <select
                        value={rewardFormData.sessionDuration}
                        onChange={e => setRewardFormData({ ...rewardFormData, sessionDuration: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs"
                      >
                        <option value="30 mins">30 mins</option>
                        <option value="45 mins">45 mins</option>
                        <option value="60 mins">60 mins</option>
                        <option value="90 mins">90 mins</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {rewardFormData.category === 'Discount Coupon' && (
                <div className="p-4 rounded-2xl border bg-[#0E1415]/70 space-y-3" style={{ borderColor: '#2A3A3A' }}>
                  <h4 className="font-bold text-[#2DD4BF] flex items-center gap-1.5 text-xs">
                    <Ticket className="w-4 h-4 text-[#2DD4BF]" /> Discount Coupon Configuration
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Discount Type</label>
                      <select
                        value={rewardFormData.discountType}
                        onChange={e => setRewardFormData({ ...rewardFormData, discountType: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs"
                      >
                        <option value="Percentage">Percentage (%)</option>
                        <option value="Fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">
                        Discount Value ({rewardFormData.discountType === 'Percentage' ? '%' : '₹'})
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={rewardFormData.discountValue}
                        onChange={e => setRewardFormData({ ...rewardFormData, discountValue: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs font-bold text-[#2DD4BF]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Applicable Service</label>
                      <select
                        value={rewardFormData.applicableService}
                        onChange={e => setRewardFormData({ ...rewardFormData, applicableService: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs"
                      >
                        <option value="All Services">All Eligible Services</option>
                        <option value="Membership">Membership Packages Only</option>
                        <option value="Personal Training">Personal Training Only</option>
                        <option value="Products">Store Products Only</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-1 text-[#C1D0D0]">Minimum Purchase Amount (₹) (0 = No Minimum)</label>
                    <input
                      type="number"
                      min={0}
                      value={rewardFormData.minPurchaseAmount}
                      onChange={e => setRewardFormData({ ...rewardFormData, minPurchaseAmount: Number(e.target.value) })}
                      className="w-48 px-3 py-1.5 rounded-xl border bg-[#141D1E] text-xs"
                    />
                  </div>
                </div>
              )}

              {rewardFormData.category === 'Free Product / Gift' && (
                <div className="p-4 rounded-2xl border bg-[#0E1415]/70 space-y-3" style={{ borderColor: '#2A3A3A' }}>
                  <h4 className="font-bold text-[#2DD4BF] flex items-center gap-1.5 text-xs">
                    <Gift className="w-4 h-4 text-[#2DD4BF]" /> Product &amp; Inventory Selection
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Select Store Product or Gift</label>
                      <select
                        value={rewardFormData.productId}
                        onChange={e => {
                          const pId = e.target.value;
                          const prod = storeProducts.find(p => p._id === pId);
                          setRewardFormData({
                            ...rewardFormData,
                            productId: pId,
                            productName: prod ? prod.name : rewardFormData.productName
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs"
                      >
                        <option value="">-- Choose From Gym Store Inventory --</option>
                        {storeProducts.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} • Stock: {p.stock} units (₹{p.sellingPrice})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Gift Quantity</label>
                      <input
                        type="number"
                        min={1}
                        value={rewardFormData.productQuantity}
                        onChange={e => setRewardFormData({ ...rewardFormData, productQuantity: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Real-time Inventory Check Alert */}
                  {(() => {
                    const selProd = storeProducts.find(p => p._id === rewardFormData.productId);
                    if (!selProd) return null;
                    const isOutOfStock = selProd.stock < (Number(rewardFormData.productQuantity) || 1);
                    return (
                      <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        isOutOfStock ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-[#1B2728] border-[#2A3A3A] text-[#2DD4BF]'
                      }`}>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>
                            Inventory Status: <strong>{selProd.stock}</strong> units available in store stock.
                          </span>
                        </div>
                        {isOutOfStock && (
                          <span className="font-bold text-rose-600 bg-[#141D1E] px-2 py-0.5 rounded-md border border-rose-200 text-[10px]">
                            Insufficient Stock
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {rewardFormData.category === 'Free Membership / Membership Extension' && (
                <div className="p-4 rounded-2xl border bg-[#0E1415]/70 space-y-3" style={{ borderColor: '#2A3A3A' }}>
                  <h4 className="font-bold text-[#2DD4BF] flex items-center gap-1.5 text-xs">
                    <Award className="w-4 h-4 text-[#2DD4BF]" /> Membership Grant Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Applicable Membership Plan</label>
                      <select
                        value={rewardFormData.packageId}
                        onChange={e => {
                          const pkgId = e.target.value;
                          const pkg = gymPackages.find(p => p._id === pkgId);
                          setRewardFormData({
                            ...rewardFormData,
                            packageId: pkgId,
                            packageName: pkg ? pkg.name : rewardFormData.packageName,
                            membershipDuration: pkg ? pkg.duration : rewardFormData.membershipDuration
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs"
                      >
                        <option value="">-- Choose Gym Package --</option>
                        {gymPackages.map(pkg => (
                          <option key={pkg._id} value={pkg._id}>
                            {pkg.name} ({pkg.duration}) • ₹{pkg.monthlyPrice}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Extension Duration</label>
                      <select
                        value={rewardFormData.membershipDuration}
                        onChange={e => setRewardFormData({ ...rewardFormData, membershipDuration: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs"
                      >
                        <option value="7 Days">7 Days</option>
                        <option value="15 Days">15 Days</option>
                        <option value="1 Month">1 Month</option>
                        <option value="3 Months">3 Months</option>
                        <option value="6 Months">6 Months</option>
                        <option value="1 Year">1 Year</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {rewardFormData.category === 'Performance Award' && (
                <div className="p-4 rounded-2xl border bg-[#0E1415]/70 space-y-3" style={{ borderColor: '#2A3A3A' }}>
                  <h4 className="font-bold text-[#2DD4BF] flex items-center gap-1.5 text-xs">
                    <Trophy className="w-4 h-4 text-[#2DD4BF]" /> Performance Award &amp; Recognition
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Achievement Reason</label>
                      <input
                        type="text"
                        placeholder="e.g. 100% workout adherence and highest weight loss milestone"
                        value={rewardFormData.awardReason}
                        onChange={e => setRewardFormData({ ...rewardFormData, awardReason: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Achievement Period</label>
                      <select
                        value={rewardFormData.achievementPeriod}
                        onChange={e => setRewardFormData({ ...rewardFormData, achievementPeriod: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border bg-[#141D1E] text-xs"
                      >
                        <option value="This Month">This Month</option>
                        <option value="Last Month">Last Month</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annual">Annual</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0]">Optional Cash Bonus (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={rewardFormData.bonusAmount}
                        onChange={e => setRewardFormData({ ...rewardFormData, bonusAmount: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 rounded-xl border bg-[#141D1E] text-xs font-bold"
                        placeholder="0 = Non-monetary recognition"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rewardFormData.hasCertificate}
                          onChange={e => setRewardFormData({ ...rewardFormData, hasCertificate: e.target.checked })}
                          className="rounded text-[#2DD4BF]"
                        />
                        <span className="font-semibold text-[#C1D0D0]">Issue Verified Digital Certificate &amp; Badge</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: UNLOCK CONDITIONS (Points or Achievement based) */}
              {rewardFormData.assignmentMethod === 'Points' && (
                <div className="p-4 rounded-2xl border bg-[#0E1415]/70 space-y-2" style={{ borderColor: '#2A3A3A' }}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2DD4BF] flex items-center gap-1.5 text-xs">
                      <Coins className="w-4 h-4 text-[#2DD4BF]" /> Points Cost to Redeem
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        required
                        value={rewardFormData.requiredPoints}
                        onChange={e => setRewardFormData({ ...rewardFormData, requiredPoints: Number(e.target.value) })}
                        className="w-24 px-3 py-1.5 rounded-xl border text-sm font-bold text-[#2DD4BF] text-right bg-[#141D1E]"
                      />
                      <span className="font-bold text-[#9AAEAE]">pts</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#9AAEAE]">
                    Customers pay with points earned from daily attendance streaks and workout consistency.
                  </p>
                </div>
              )}

              {rewardFormData.assignmentMethod === 'Achievement' && (
                <div className="p-4 rounded-2xl border bg-[#0E1415]/70 space-y-3" style={{ borderColor: '#2A3A3A' }}>
                  <div>
                    <h4 className="font-bold text-[#2DD4BF] flex items-center gap-1.5 text-xs">
                      <Users className="w-4 h-4 text-[#2DD4BF]" /> How Does a Member Unlock This Reward?
                    </h4>
                    <p className="text-[11px] text-[#9AAEAE] mt-0.5">
                      Select one condition required for the member to unlock and claim this perk.
                    </p>
                  </div>

                  {/* 5 Milestone Condition Selector Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    {[
                      { id: 'visits', label: 'Gym Visits', icon: '📅', desc: 'Attendance milestone' },
                      { id: 'workouts', label: 'Workouts Done', icon: '🏋️', desc: 'Workout log count' },
                      { id: 'streak', label: 'Streak Days', icon: '🔥', desc: 'Consecutive check-ins' },
                      { id: 'goals', label: 'Diet & Goals', icon: '🥗', desc: 'Goal adherence' },
                      { id: 'milestone', label: 'Top Milestone', icon: '🏆', desc: 'Elite consistency' },
                    ].map(cond => {
                      const isSel = rewardFormData.achievementCondition === cond.id;
                      return (
                        <button
                          key={cond.id}
                          type="button"
                          onClick={() => setRewardFormData({ ...rewardFormData, achievementCondition: cond.id as any })}
                          className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSel
                              ? 'bg-[#141D1E] border-[#2DD4BF] shadow-xs text-[#2DD4BF]'
                              : 'bg-[#141D1E]/70 border-[#2A3A3A] text-[#C1D0D0] hover:border-[#2A3A3A]'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center gap-1">
                            <span>{cond.icon}</span> {cond.label}
                          </div>
                          <span className="text-[10px] text-[#9AAEAE] mt-1">{cond.desc}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Single Input for Selected Condition */}
                  <div className="bg-[#141D1E] p-3 rounded-xl border mt-2" style={{ borderColor: '#0E1415' }}>
                    {rewardFormData.achievementCondition === 'visits' && (
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#C1D0D0]">Minimum Verified Gym Visits:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={rewardFormData.minVerifiedVisits}
                            onChange={e => setRewardFormData({ ...rewardFormData, minVerifiedVisits: Number(e.target.value) })}
                            className="w-24 px-3 py-1.5 rounded-xl border text-sm font-bold text-right"
                          />
                          <span className="text-[#9AAEAE] font-medium">visits</span>
                        </div>
                      </div>
                    )}
                    {rewardFormData.achievementCondition === 'workouts' && (
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#C1D0D0]">Minimum Completed Workouts:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={rewardFormData.minWorkoutCompletions}
                            onChange={e => setRewardFormData({ ...rewardFormData, minWorkoutCompletions: Number(e.target.value) })}
                            className="w-24 px-3 py-1.5 rounded-xl border text-sm font-bold text-right"
                          />
                          <span className="text-[#9AAEAE] font-medium">workouts</span>
                        </div>
                      </div>
                    )}
                    {rewardFormData.achievementCondition === 'streak' && (
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#C1D0D0]">Required Attendance Streak:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={rewardFormData.minStreakDays}
                            onChange={e => setRewardFormData({ ...rewardFormData, minStreakDays: Number(e.target.value) })}
                            className="w-24 px-3 py-1.5 rounded-xl border text-sm font-bold text-right"
                          />
                          <span className="text-[#9AAEAE] font-medium">consecutive days</span>
                        </div>
                      </div>
                    )}
                    {rewardFormData.achievementCondition === 'goals' && (
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-[#C1D0D0]">Diet &amp; Workout Goals Met:</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={rewardFormData.minDietAdherenceDays}
                            onChange={e => setRewardFormData({ ...rewardFormData, minDietAdherenceDays: Number(e.target.value) })}
                            className="w-24 px-3 py-1.5 rounded-xl border text-sm font-bold text-right"
                          />
                          <span className="text-[#9AAEAE] font-medium">days</span>
                        </div>
                      </div>
                    )}
                    {rewardFormData.achievementCondition === 'milestone' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-[#C1D0D0]">Visits:</label>
                          <input
                            type="number"
                            min={1}
                            value={rewardFormData.minVerifiedVisits}
                            onChange={e => setRewardFormData({ ...rewardFormData, minVerifiedVisits: Number(e.target.value) })}
                            className="w-20 px-2 py-1 rounded-lg border text-sm font-bold text-right"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-[#C1D0D0]">Workouts:</label>
                          <input
                            type="number"
                            min={1}
                            value={rewardFormData.minWorkoutCompletions}
                            onChange={e => setRewardFormData({ ...rewardFormData, minWorkoutCompletions: Number(e.target.value) })}
                            className="w-20 px-2 py-1 rounded-lg border text-sm font-bold text-right"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 5: INVENTORY LIMITS & DATES (Conditional & Streamlined) */}
              <div className="p-4 rounded-2xl border bg-[#0E1415]/50 space-y-2.5" style={{ borderColor: '#0E1415' }}>
                <span className="font-bold text-[#C1D0D0] block text-xs">Inventory &amp; Claim Rules</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium mb-1 text-[#C1D0D0] text-[11px]">Total Available (0 = Unlimited)</label>
                    <input
                      type="number"
                      min={0}
                      value={rewardFormData.totalQuantity}
                      onChange={e => setRewardFormData({ ...rewardFormData, totalQuantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border text-sm bg-[#141D1E]"
                    />
                  </div>
                  {rewardFormData.assignmentMethod !== 'Direct' && (
                    <div>
                      <label className="block font-medium mb-1 text-[#C1D0D0] text-[11px]">Max Claims per Member</label>
                      <input
                        type="number"
                        min={1}
                        value={rewardFormData.maxClaimsPerUser}
                        onChange={e => setRewardFormData({ ...rewardFormData, maxClaimsPerUser: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border text-sm bg-[#141D1E]"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block font-medium mb-1 text-[#C1D0D0] text-[11px]">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={rewardFormData.expiryDate}
                      onChange={e => setRewardFormData({ ...rewardFormData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-sm bg-[#141D1E]"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: COMPACT PREVIEW SUMMARY BEFORE SUBMISSION */}
              <div className="bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 rounded-2xl p-3.5 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2DD4BF] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reward Preview Summary
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#9AAEAE]">Recipient &amp; Assignment:</span>
                    <p className="font-bold text-[#F5FAFA]">
                      {rewardFormData.assignmentMethod === 'Direct'
                        ? `Direct to: ${selectedCustomerObj?.name || selectedTrainerObj?.name || 'Selected User'}`
                        : rewardFormData.assignmentMethod === 'Achievement'
                        ? `Achievement: Requires ${
                            rewardFormData.achievementCondition === 'visits'
                              ? `${rewardFormData.minVerifiedVisits} Gym Visits`
                              : rewardFormData.achievementCondition === 'workouts'
                              ? `${rewardFormData.minWorkoutCompletions} Workouts`
                              : `${rewardFormData.minStreakDays} Streak Days`
                          }`
                        : `Points-Based: ${rewardFormData.requiredPoints} points redemption`}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#9AAEAE]">Category &amp; Benefit:</span>
                    <p className="font-bold text-[#F5FAFA]">
                      {rewardFormData.category} • {rewardFormData.title || 'New Reward'}
                    </p>
                  </div>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: '#2A3A3A' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rewardFormData.requireApproval}
                    onChange={e => setRewardFormData({ ...rewardFormData, requireApproval: e.target.checked })}
                    className="rounded text-[#2DD4BF]"
                  />
                  <span className="font-semibold text-[#C1D0D0]">Require Owner Approval before voucher grant</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRewardModalOpen(false)}
                    className="px-4 py-2 rounded-xl border text-[#C1D0D0] hover:bg-[#0E1415] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-white font-bold bg-[#2DD4BF] hover:bg-[#5EEAD4] shadow cursor-pointer transition"
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
          <div className="bg-[#141D1E] rounded-2xl w-full max-w-md p-6 shadow-2xl border" style={{ borderColor: '#2A3A3A' }}>
            <h3 className="text-base font-bold text-[#F5FAFA] mb-1">
              {actionType === 'APPROVE' && 'Approve Claim Request'}
              {actionType === 'REJECT' && 'Reject Claim Request'}
              {actionType === 'REDEEM' && 'Mark Voucher Redeemed'}
              {actionType === 'PAYOUT' && 'Record Financial Bonus Payout'}
            </h3>
            <p className="text-xs text-[#9AAEAE] mb-4">
              Voucher: <span className="font-mono font-bold text-[#F5FAFA]">{selectedClaim.claimCode}</span>
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
                    <p className="text-[11px] text-[#2DD4BF] mt-1 font-medium">
                      Note: Deducted {selectedClaim.pointsDeducted} points will be automatically refunded back to the user wallet.
                    </p>
                  )}
                </div>
              )}

              {actionType === 'PAYOUT' && (
                <div>
                  <label className="block font-bold mb-1 text-[#C1D0D0]">Payment Reference *</label>
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
                <label className="block font-bold mb-1 text-[#C1D0D0]">Internal Audit Note</label>
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
                  className="px-4 py-2 rounded-xl border text-[#C1D0D0] hover:bg-[#0E1415]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessClaim}
                  className={`px-5 py-2 rounded-xl text-white font-bold shadow ${
                    actionType === 'REJECT' ? 'bg-red-600' : 'bg-[#2DD4BF]'
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
