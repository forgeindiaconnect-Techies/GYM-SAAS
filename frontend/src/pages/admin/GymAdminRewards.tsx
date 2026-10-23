import React, { useState, useEffect } from 'react';
import {
  Gift,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  Users,
  Award,
  IndianRupee,
  Coins,
  Ticket,
  ChevronRight,
  X,
  CreditCard,
  Check
} from 'lucide-react';
import api from '../../utils/api';

interface RewardDefinition {
  _id: string;
  title: string;
  description: string;
  recipientType: 'Customer' | 'Trainer' | 'Both';
  category: string;
  rewardType: string;
  requiredPoints: number;
  requiredChallengeId?: any;
  minCompletedSessions: number;
  minAverageRating: number;
  bonusAmount: number;
  currency: string;
  startDate?: string;
  expiryDate?: string;
  totalQuantity: number;
  claimedCount: number;
  maxClaimsPerUser: number;
  requireApproval: boolean;
  termsAndConditions?: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Expired';
  createdAt: string;
}

interface RewardClaim {
  _id: string;
  rewardId: RewardDefinition;
  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role: string;
    profilePicture?: string;
    phone?: string;
  };
  userRole: 'MEMBER' | 'TRAINER';
  challengeId?: {
    _id: string;
    title: string;
  };
  claimCode: string;
  pointsDeducted: number;
  claimStatus: 'Pending' | 'Approved' | 'Rejected' | 'Redeemed' | 'Expired';
  reviewedBy?: {
    firstName?: string;
    lastName?: string;
  };
  reviewedAt?: string;
  rejectionReason?: string;
  redeemedAt?: string;
  financialPayoutStatus: 'Not Applicable' | 'Pending' | 'Paid';
  financialPayoutReference?: string;
  financialPayoutDate?: string;
  notes?: string;
  createdAt: string;
}

interface FitnessChallenge {
  _id: string;
  title: string;
}

export default function GymAdminRewards() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'claims'>('catalog');
  const [rewards, setRewards] = useState<RewardDefinition[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [challenges, setChallenges] = useState<FitnessChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [recipientFilter, setRecipientFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [claimStatusFilter, setClaimStatusFilter] = useState('ALL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  // Claim action modal
  const [claimActionModalOpen, setClaimActionModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<RewardClaim | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'PAYOUT' | 'REDEEM'>('APPROVE');
  const [rejectionReason, setRejectionReason] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [claimNotes, setClaimNotes] = useState('');

  // Banner
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recipientType: 'Customer' as 'Customer' | 'Trainer' | 'Both',
    category: 'Discount Coupon',
    rewardType: 'Coupon',
    requiredPoints: 100,
    requiredChallengeId: '',
    minCompletedSessions: 0,
    minAverageRating: 0,
    bonusAmount: 0,
    currency: 'INR',
    startDate: '',
    expiryDate: '',
    totalQuantity: 50,
    maxClaimsPerUser: 1,
    requireApproval: true,
    termsAndConditions: '',
    status: 'Active' as 'Draft' | 'Active' | 'Paused' | 'Expired'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res, chRes] = await Promise.all([
        api.get('/rewards/owner'),
        api.get('/challenges/owner').catch(() => ({ data: { challenges: [] } }))
      ]);

      if (res.data?.success) {
        setRewards(res.data.rewards || []);
        setClaims(res.data.claims || []);
      }
      setChallenges(chRes.data?.challenges || []);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load rewards' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedRewardId(null);
    setFormData({
      title: '',
      description: '',
      recipientType: 'Customer',
      category: 'Discount Coupon',
      rewardType: 'Coupon',
      requiredPoints: 100,
      requiredChallengeId: '',
      minCompletedSessions: 0,
      minAverageRating: 0,
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
    setIsModalOpen(true);
  };

  const openEditModal = (r: RewardDefinition) => {
    setIsEditMode(true);
    setSelectedRewardId(r._id);
    setFormData({
      title: r.title,
      description: r.description,
      recipientType: r.recipientType,
      category: r.category,
      rewardType: r.rewardType,
      requiredPoints: r.requiredPoints || 0,
      requiredChallengeId: r.requiredChallengeId?._id || r.requiredChallengeId || '',
      minCompletedSessions: r.minCompletedSessions || 0,
      minAverageRating: r.minAverageRating || 0,
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
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedRewardId) {
        await api.put(`/rewards/${selectedRewardId}`, formData);
        setMessage({ type: 'success', text: 'Reward updated successfully!' });
      } else {
        await api.post('/rewards', formData);
        setMessage({ type: 'success', text: 'Reward created successfully!' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error saving reward' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reward definition?')) return;
    try {
      const res = await api.delete(`/rewards/${id}`);
      setMessage({ type: 'success', text: res.data?.message || 'Reward removed' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete reward' });
    }
  };

  const openClaimAction = (claim: RewardClaim, action: 'APPROVE' | 'REJECT' | 'PAYOUT' | 'REDEEM') => {
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
      fetchData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update claim' });
    }
  };

  // Metrics
  const totalRewardsCount = rewards.length;
  const pendingClaimsCount = claims.filter(c => c.claimStatus === 'Pending').length;
  const totalRedeemedCount = claims.filter(c => c.claimStatus === 'Redeemed' || c.claimStatus === 'Approved').length;
  const pendingBonusesCount = claims.filter(c => c.financialPayoutStatus === 'Pending').length;

  // Filters
  const filteredRewards = rewards.filter(r => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRecipient = recipientFilter === 'ALL' || r.recipientType === recipientFilter || r.recipientType === 'Both';
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesRecipient && matchesStatus;
  });

  const filteredClaims = claims.filter(c => {
    const matchesSearch =
      c.claimCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.userId?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.userId?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.rewardId?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = claimStatusFilter === 'ALL' || c.claimStatus === claimStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6" style={{ backgroundColor: '#0B0B12', minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: '#292940' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#17172A' }}>
            <Gift className="w-7 h-7" style={{ color: '#6366F1' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#11111F' }}>
              Rewards Management
            </h1>
            <p className="text-sm" style={{ color: '#A1A1AA' }}>
              Configure member & trainer rewards, manage vouchers, and review reward claim requests.
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium shadow transition hover:opacity-90"
          style={{ backgroundColor: '#6366F1' }}
        >
          <Plus className="w-5 h-5" />
          Create Reward
        </button>
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
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#292940' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#A1A1AA' }}>Active Rewards</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#17172A', color: '#6366F1' }}>
              <Gift className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: '#11111F' }}>{totalRewardsCount}</div>
          <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>Customer & Trainer rewards</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#292940' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#A1A1AA' }}>Pending Approvals</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: '#D99A27' }}>
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: pendingClaimsCount > 0 ? '#D99A27' : '#11111F' }}>
            {pendingClaimsCount}
          </div>
          <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>Awaiting your review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#292940' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#A1A1AA' }}>Approved / Redeemed</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#17172A', color: '#27845A' }}>
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: '#27845A' }}>{totalRedeemedCount}</div>
          <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>Completed redemptions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#292940' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#A1A1AA' }}>Pending Trainer Bonuses</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#17172A', color: '#6366F1' }}>
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: '#11111F' }}>{pendingBonusesCount}</div>
          <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>Financial payouts awaiting transfer</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-6" style={{ borderColor: '#292940' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'catalog'
              ? 'border-[#6366F1] text-[#6366F1]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Gift className="w-4 h-4" />
          Rewards Catalog ({rewards.length})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'claims'
              ? 'border-[#6366F1] text-[#6366F1]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Ticket className="w-4 h-4" />
          Claims & Approvals ({claims.length})
          {pendingClaimsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-amber-500 text-white font-bold">
              {pendingClaimsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: REWARDS CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center" style={{ borderColor: '#292940' }}>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search rewards..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: '#292940' }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: '#A1A1AA' }}>FOR:</span>
                <select
                  value={recipientFilter}
                  onChange={e => setRecipientFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-white focus:outline-none"
                  style={{ borderColor: '#292940', color: '#11111F' }}
                >
                  <option value="ALL">All Recipients</option>
                  <option value="Customer">Customers</option>
                  <option value="Trainer">Trainers</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: '#A1A1AA' }}>STATUS:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-white focus:outline-none"
                  style={{ borderColor: '#292940', color: '#11111F' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#292940' }}>
              <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#6366F1', borderTopColor: 'transparent' }} />
              <p className="mt-3 text-sm font-medium" style={{ color: '#A1A1AA' }}>Loading rewards...</p>
            </div>
          ) : filteredRewards.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#292940' }}>
              <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold" style={{ color: '#11111F' }}>No Rewards Configured</h3>
              <p className="text-sm max-w-md mx-auto mt-1" style={{ color: '#A1A1AA' }}>
                Create discount coupons, free sessions, or trainer performance bonuses to reward your gym community.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ backgroundColor: '#6366F1' }}
              >
                Create Reward
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map(reward => {
                const isUnlimited = !reward.totalQuantity || reward.totalQuantity === 0;
                const remaining = isUnlimited ? 'Unlimited' : Math.max(0, reward.totalQuantity - reward.claimedCount);

                return (
                  <div
                    key={reward._id}
                    className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                    style={{ borderColor: '#292940' }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            reward.recipientType === 'Customer'
                              ? 'bg-emerald-50 text-emerald-800'
                              : reward.recipientType === 'Trainer'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-purple-50 text-purple-800'
                          }`}
                        >
                          {reward.recipientType === 'Both' ? 'Customer & Trainer' : `${reward.recipientType}s`}
                        </span>

                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            reward.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : reward.status === 'Paused'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {reward.status}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg leading-tight" style={{ color: '#11111F' }}>
                          {reward.title}
                        </h3>
                        <span className="text-xs font-medium text-gray-500 block mt-0.5">
                          Category: {reward.category}
                        </span>
                        <p className="text-xs line-clamp-2 mt-2 text-gray-600">
                          {reward.description}
                        </p>
                      </div>

                      {/* Criteria & Requirements Box */}
                      <div className="p-3 rounded-xl bg-gray-50 text-xs space-y-1.5 border" style={{ borderColor: '#0B0B12' }}>
                        {reward.requiredPoints > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Points Cost:</span>
                            <span className="font-bold text-[#6366F1]">{reward.requiredPoints} points</span>
                          </div>
                        )}

                        {reward.bonusAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Bonus Payout:</span>
                            <span className="font-bold text-[#27845A]">
                              ₹{reward.bonusAmount} {reward.currency}
                            </span>
                          </div>
                        )}

                        {reward.minCompletedSessions > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Min Sessions:</span>
                            <span className="font-semibold">{reward.minCompletedSessions} completed sessions</span>
                          </div>
                        )}

                        {reward.minAverageRating > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Min Rating:</span>
                            <span className="font-semibold">{reward.minAverageRating}⭐ rating</span>
                          </div>
                        )}

                        {reward.requiredChallengeId && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Challenge:</span>
                            <span className="font-semibold truncate max-w-[150px]">
                              {(reward.requiredChallengeId as any).title || 'Required'}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between pt-1 border-t border-gray-200">
                          <span className="text-gray-500">Inventory:</span>
                          <span className="font-bold">
                            {reward.claimedCount} claimed / {remaining} left
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t flex justify-between items-center text-xs" style={{ borderColor: '#292940' }}>
                      <span className="text-gray-500">
                        {reward.requireApproval ? '🔒 Approval required' : '⚡ Instant claim'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(reward)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(reward._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLAIMS & APPROVALS */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center" style={{ borderColor: '#292940' }}>
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code or user name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: '#292940' }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: '#A1A1AA' }}>STATUS:</span>
              <select
                value={claimStatusFilter}
                onChange={e => setClaimStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-white focus:outline-none"
                style={{ borderColor: '#292940', color: '#11111F' }}
              >
                <option value="ALL">All Claim Statuses</option>
                <option value="Pending">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Redeemed">Redeemed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#292940' }}>
              <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold" style={{ color: '#11111F' }}>No Claim Requests Yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">
                When members or trainers claim rewards or bonuses, their voucher requests will appear here for verification and approval.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#292940' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase bg-gray-50" style={{ borderColor: '#292940', color: '#A1A1AA' }}>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Reward</th>
                      <th className="py-3 px-4">Voucher Code</th>
                      <th className="py-3 px-4">Points</th>
                      <th className="py-3 px-4">Claim Status</th>
                      <th className="py-3 px-4">Bonus Payment</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#292940' }}>
                    {filteredClaims.map(claim => {
                      const isTrainer = claim.userRole === 'TRAINER';
                      const hasBonus = claim.financialPayoutStatus !== 'Not Applicable';

                      return (
                        <tr key={claim._id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4">
                            <div className="font-semibold" style={{ color: '#11111F' }}>
                              {claim.userId?.firstName || 'User'} {claim.userId?.lastName || ''}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <span className={`px-1.5 py-0.2 rounded font-medium text-[10px] ${isTrainer ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {isTrainer ? 'Trainer' : 'Customer'}
                              </span>
                              <span>• {claim.userId?.email}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-xs text-gray-800">
                              {claim.rewardId?.title || 'Reward'}
                            </div>
                            <div className="text-[11px] text-gray-500">
                              {claim.rewardId?.category}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-xs px-2 py-1 rounded bg-gray-100 border text-gray-800">
                              {claim.claimCode}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-xs font-semibold">
                            {claim.pointsDeducted > 0 ? (
                              <span className="text-[#6366F1]">-{claim.pointsDeducted} pts</span>
                            ) : (
                              <span className="text-gray-400">0 pts</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                claim.claimStatus === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : claim.claimStatus === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : claim.claimStatus === 'Redeemed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {claim.claimStatus}
                            </span>
                            {claim.rejectionReason && (
                              <span className="block text-[11px] text-red-600 mt-1 max-w-[150px] truncate" title={claim.rejectionReason}>
                                {claim.rejectionReason}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-xs">
                            {hasBonus ? (
                              <div>
                                <span
                                  className={`px-2 py-0.5 rounded-full font-semibold ${
                                    claim.financialPayoutStatus === 'Paid'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {claim.financialPayoutStatus === 'Paid' ? 'Paid' : 'Pending Payment'}
                                </span>
                                {claim.financialPayoutReference && (
                                  <div className="text-[11px] text-gray-500 mt-0.5 font-mono">
                                    Ref: {claim.financialPayoutReference}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {claim.claimStatus === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => openClaimAction(claim, 'APPROVE')}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openClaimAction(claim, 'REJECT')}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {claim.claimStatus === 'Approved' && (
                                <button
                                  onClick={() => openClaimAction(claim, 'REDEEM')}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                                >
                                  Mark Redeemed
                                </button>
                              )}

                              {hasBonus && claim.financialPayoutStatus === 'Pending' && (
                                <button
                                  onClick={() => openClaimAction(claim, 'PAYOUT')}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
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

      {/* CREATE / EDIT REWARD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border my-8" style={{ borderColor: '#292940' }}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10" style={{ borderColor: '#292940' }}>
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5" style={{ color: '#6366F1' }} />
                <h2 className="text-lg font-bold" style={{ color: '#11111F' }}>
                  {isEditMode ? 'Edit Reward Definition' : 'Create New Gym Reward'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {/* Recipient & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#11111F' }}>
                    Recipient Audience *
                  </label>
                  <select
                    value={formData.recipientType}
                    onChange={e => setFormData({ ...formData, recipientType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#292940' }}
                  >
                    <option value="Customer">Customers Only</option>
                    <option value="Trainer">Trainers Only</option>
                    <option value="Both">Both Customers & Trainers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#11111F' }}>
                    Reward Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#292940' }}
                  >
                    <option value="Discount Coupon">Discount Coupon</option>
                    <option value="Membership Renewal Discount">Membership Renewal Discount</option>
                    <option value="Gym Store Discount">Gym Store Discount</option>
                    <option value="Free Personal Training Session">Free Personal Training Session</option>
                    <option value="Gym Merchandise Voucher">Gym Merchandise Voucher</option>
                    <option value="Challenge Completion Certificate">Challenge Completion Certificate</option>
                    <option value="Best Trainer Award">Best Trainer Award</option>
                    <option value="Performance Bonus">Performance Bonus</option>
                    <option value="Recognition Badge">Recognition Badge</option>
                    <option value="Training & Certification Benefit">Training & Certification Benefit</option>
                  </select>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#11111F' }}>
                  Reward Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20% Membership Renewal Coupon or Best Trainer Performance Bonus"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#292940' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#11111F' }}>
                  Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detail what is included and how to redeem..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none"
                  style={{ borderColor: '#292940' }}
                />
              </div>

              {/* Customer Specific Options */}
              {formData.recipientType !== 'Trainer' && (
                <div className="p-4 rounded-xl border bg-gray-50/50 space-y-3" style={{ borderColor: '#292940' }}>
                  <h4 className="text-xs font-bold text-[#6366F1] flex items-center gap-1.5">
                    <Coins className="w-4 h-4" /> Customer Eligibility & Points
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#A1A1AA' }}>
                        Required Points to Claim (0 if free / challenge reward)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.requiredPoints}
                        onChange={e => setFormData({ ...formData, requiredPoints: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
                        style={{ borderColor: '#292940' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#A1A1AA' }}>
                        Required Challenge Completion (Optional)
                      </label>
                      <select
                        value={formData.requiredChallengeId}
                        onChange={e => setFormData({ ...formData, requiredChallengeId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
                        style={{ borderColor: '#292940' }}
                      >
                        <option value="">No specific challenge required</option>
                        {challenges.map(ch => (
                          <option key={ch._id} value={ch._id}>
                            {ch.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Trainer Specific Options */}
              {formData.recipientType !== 'Customer' && (
                <div className="p-4 rounded-xl border bg-gray-50/50 space-y-3" style={{ borderColor: '#292940' }}>
                  <h4 className="text-xs font-bold text-[#6366F1] flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Trainer Performance Criteria & Financial Bonus
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#A1A1AA' }}>
                        Min Completed Sessions
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.minCompletedSessions}
                        onChange={e => setFormData({ ...formData, minCompletedSessions: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
                        style={{ borderColor: '#292940' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#A1A1AA' }}>
                        Min Average Rating (⭐)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.1}
                        value={formData.minAverageRating}
                        onChange={e => setFormData({ ...formData, minAverageRating: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
                        style={{ borderColor: '#292940' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#A1A1AA' }}>
                        Bonus Amount (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.bonusAmount}
                        onChange={e => setFormData({ ...formData, bonusAmount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border text-sm bg-white"
                        style={{ borderColor: '#292940' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory & Expiry */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#11111F' }}>
                    Total Quantity (0 = unlimited)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.totalQuantity}
                    onChange={e => setFormData({ ...formData, totalQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    style={{ borderColor: '#292940' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#11111F' }}>
                    Max Claims Per User
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxClaimsPerUser}
                    onChange={e => setFormData({ ...formData, maxClaimsPerUser: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    style={{ borderColor: '#292940' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#11111F' }}>
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    style={{ borderColor: '#292940' }}
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#11111F' }}>
                  Terms & Conditions
                </label>
                <textarea
                  rows={2}
                  placeholder="Redemption guidelines, expiry terms, non-transferability..."
                  value={formData.termsAndConditions}
                  onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm"
                  style={{ borderColor: '#292940' }}
                />
              </div>

              {/* Toggles & Submit */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: '#292940' }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requireApproval}
                    onChange={e => setFormData({ ...formData, requireApproval: e.target.checked })}
                    className="rounded text-[#6366F1] focus:ring-[#6366F1]"
                  />
                  <span className="text-xs font-semibold" style={{ color: '#11111F' }}>Require Gym Owner Manual Approval</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">Status:</span>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
                    style={{ borderColor: '#292940' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                    <option value="Expired">Expired</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: '#292940' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 text-gray-600"
                  style={{ borderColor: '#292940' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-white text-sm font-semibold shadow hover:opacity-90"
                  style={{ backgroundColor: '#6366F1' }}
                >
                  {isEditMode ? 'Save Changes' : 'Create Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLAIM ACTION MODAL (APPROVE / REJECT / REDEEM / RECORD PAYOUT) */}
      {claimActionModalOpen && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border" style={{ borderColor: '#292940' }}>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#11111F' }}>
              {actionType === 'APPROVE' && 'Approve Reward Claim'}
              {actionType === 'REJECT' && 'Reject Reward Claim'}
              {actionType === 'REDEEM' && 'Mark Voucher as Redeemed'}
              {actionType === 'PAYOUT' && 'Record Financial Bonus Payment'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Voucher: <span className="font-mono font-bold text-gray-800">{selectedClaim.claimCode}</span> • Recipient: {selectedClaim.userId?.firstName} {selectedClaim.userId?.lastName}
            </p>

            <div className="space-y-4">
              {actionType === 'REJECT' && (
                <div>
                  <label className="block text-xs font-bold mb-1 text-red-700">
                    Rejection Reason *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide a clear reason (e.g. Terms not met, duplicate request)..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
                    style={{ borderColor: '#292940' }}
                  />
                  {selectedClaim.pointsDeducted > 0 && (
                    <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                      Note: Rejecting will automatically refund {selectedClaim.pointsDeducted} points back to the user's wallet.
                    </p>
                  )}
                </div>
              )}

              {actionType === 'PAYOUT' && (
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700">
                    Payment Reference / Transaction ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UPI/NEFT Ref #, Cheque #, or Cash Receipt"
                    value={paymentReference}
                    onChange={e => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-sm"
                    style={{ borderColor: '#292940' }}
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Marking as paid ensures financial audit integrity.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold mb-1 text-gray-700">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="Internal audit notes..."
                  value={claimNotes}
                  onChange={e => setClaimNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  style={{ borderColor: '#292940' }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: '#292940' }}>
                <button
                  type="button"
                  onClick={() => setClaimActionModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50 text-gray-600"
                  style={{ borderColor: '#292940' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessClaim}
                  className={`px-5 py-2 rounded-xl text-white text-sm font-semibold shadow hover:opacity-90 ${
                    actionType === 'REJECT' ? 'bg-red-600' : 'bg-[#6366F1]'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
