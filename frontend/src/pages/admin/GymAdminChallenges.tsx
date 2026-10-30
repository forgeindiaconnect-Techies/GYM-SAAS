import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Award,
  Flame,
  Zap,
  Shield,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Gift,
  X,
  ChevronRight,
  TrendingUp,
  Activity,
  Check
} from 'lucide-react';
import api from '../../utils/api';

interface Challenge {
  _id: string;
  title: string;
  description: string;
  challengeType: 'Attendance' | 'Workout Completion' | 'Consistency Streak';
  startDate: string;
  endDate: string;
  targetValue: number;
  targetUnit: string;
  pointsPerActivity: number;
  completionBonusPoints: number;
  badgeName: string;
  badgeIcon: string;
  eligiblePackageIds?: any[];
  rewardId?: any;
  rewardQuantity?: number;
  rewardClaimedCount?: number;
  rewardExpiryDate?: string;
  requireApproval: boolean;
  isLeaderboardEnabled: boolean;
  status: 'Draft' | 'Published' | 'Paused' | 'Completed';
  participantCount: number;
  completionCount: number;
  createdAt: string;
}

interface GymPackage {
  _id: string;
  name?: string;
  planName?: string;
  price?: number;
}

interface Reward {
  _id: string;
  title: string;
  category: string;
}

interface Participant {
  _id: string;
  customerId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
    phone?: string;
  };
  currentProgress: number;
  targetValue: number;
  completed: boolean;
  completedAt?: string;
  pointsEarned: number;
  streakDays: number;
  rewardClaimStatus: string;
  claimCode?: string;
  trainerFeedback?: string;
  enrolledAt: string;
}

const BADGE_ICONS: { [key: string]: any } = {
  Award,
  Trophy,
  Flame,
  Zap,
  Shield,
  Star
};

export default function GymAdminChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  // Participants Modal
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [viewingChallenge, setViewingChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Leaderboard Modal
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Feedback / Notification banner
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challengeType: 'Attendance' as 'Attendance' | 'Workout Completion' | 'Consistency Streak',
    startDate: '',
    endDate: '',
    targetValue: 12,
    targetUnit: 'Visits',
    pointsPerActivity: 10,
    completionBonusPoints: 50,
    badgeName: 'Fitness Champion',
    badgeIcon: 'Award',
    eligiblePackageIds: [] as string[],
    rewardId: '',
    rewardQuantity: 0,
    rewardExpiryDate: '',
    requireApproval: false,
    isLeaderboardEnabled: true,
    status: 'Published' as 'Draft' | 'Published' | 'Paused' | 'Completed'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [challengesRes, packagesRes, rewardsRes] = await Promise.all([
        api.get('/challenges/owner'),
        api.get('/gym-packages').catch(() => ({ data: { packages: [] } })),
        api.get('/rewards/owner').catch(() => ({ data: { rewards: [] } }))
      ]);

      if (challengesRes.data?.success) {
        setChallenges(challengesRes.data.challenges || []);
      }
      setPackages(packagesRes.data?.packages || []);
      setRewards(rewardsRes.data?.rewards || []);
    } catch (err: any) {
      console.error('Failed to load challenges data', err);
      setMessage({ type: 'error', text: 'Failed to load challenges' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setIsEditMode(false);
    setSelectedChallengeId(null);
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

    setFormData({
      title: '',
      description: '',
      challengeType: 'Attendance',
      startDate: today,
      endDate: nextMonth,
      targetValue: 12,
      targetUnit: 'Visits',
      pointsPerActivity: 10,
      completionBonusPoints: 50,
      badgeName: '30-Day Master',
      badgeIcon: 'Award',
      eligiblePackageIds: [],
      rewardId: '',
      rewardQuantity: 0,
      rewardExpiryDate: '',
      requireApproval: false,
      isLeaderboardEnabled: true,
      status: 'Published'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Challenge) => {
    setIsEditMode(true);
    setSelectedChallengeId(c._id);
    setFormData({
      title: c.title,
      description: c.description,
      challengeType: c.challengeType,
      startDate: c.startDate ? c.startDate.split('T')[0] : '',
      endDate: c.endDate ? c.endDate.split('T')[0] : '',
      targetValue: c.targetValue,
      targetUnit: c.targetUnit,
      pointsPerActivity: c.pointsPerActivity,
      completionBonusPoints: c.completionBonusPoints,
      badgeName: c.badgeName,
      badgeIcon: c.badgeIcon,
      eligiblePackageIds: (c.eligiblePackageIds || []).map((p: any) => p._id || p),
      rewardId: c.rewardId?._id || c.rewardId || '',
      rewardQuantity: c.rewardQuantity || 0,
      rewardExpiryDate: c.rewardExpiryDate ? c.rewardExpiryDate.split('T')[0] : '',
      requireApproval: c.requireApproval || false,
      isLeaderboardEnabled: c.isLeaderboardEnabled !== false,
      status: c.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        setMessage({ type: 'error', text: 'Start date must be before end date' });
        return;
      }

      if (isEditMode && selectedChallengeId) {
        await api.put(`/challenges/${selectedChallengeId}`, formData);
        setMessage({ type: 'success', text: 'Challenge updated successfully!' });
      } else {
        await api.post('/challenges', formData);
        setMessage({ type: 'success', text: 'Challenge published successfully!' });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error saving challenge' });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.put(`/challenges/${id}`, { status: newStatus });
      setChallenges(prev =>
        prev.map(c => (c._id === id ? { ...c, status: newStatus as any } : c))
      );
      setMessage({ type: 'success', text: `Challenge status changed to ${newStatus}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge and its history?')) return;
    try {
      await api.delete(`/challenges/${id}`);
      setChallenges(prev => prev.filter(c => c._id !== id));
      setMessage({ type: 'success', text: 'Challenge deleted successfully' });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Failed to delete challenge' });
    }
  };

  const openParticipantsModal = async (c: Challenge) => {
    setViewingChallenge(c);
    setParticipantsModalOpen(true);
    setLoadingParticipants(true);
    try {
      const res = await api.get(`/challenges/${c._id}/participants`);
      if (res.data?.success) {
        setParticipants(res.data.participants || []);
      }
    } catch (err) {
      console.error('Failed to load participants', err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const openLeaderboardModal = async (c: Challenge) => {
    setViewingChallenge(c);
    setLeaderboardModalOpen(true);
    setLoadingLeaderboard(true);
    try {
      const res = await api.get(`/challenges/${c._id}/leaderboard`);
      if (res.data?.success) {
        setLeaderboardData(res.data.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Filter challenges
  const filteredChallenges = challenges.filter(c => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || c.challengeType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate Metrics
  const totalChallenges = challenges.length;
  const activeChallenges = challenges.filter(c => c.status === 'Published').length;
  const totalParticipants = challenges.reduce((acc, c) => acc + (c.participantCount || 0), 0);
  const totalCompletions = challenges.reduce((acc, c) => acc + (c.completionCount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6" style={{ backgroundColor: '#F3E8E8', minHeight: '100vh' }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FFFFFF] p-6 rounded-2xl border shadow-sm" style={{ borderColor: '#E7DADD' }}>
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F3E8E8' }}>
              <Trophy className="w-7 h-7" style={{ color: '#B76E79' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
                Fitness Challenges
              </h1>
              <p className="text-sm" style={{ color: '#57534E' }}>
                Create, track, and manage gym attendance and workout challenges to boost member engagement.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium shadow transition hover:opacity-90"
          style={{ backgroundColor: '#B76E79' }}
        >
          <Plus className="w-5 h-5" />
          Create Challenge
        </button>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-[#F3E8E8] border-[#E7DADD] text-[#B76E79]'
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
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#E7DADD' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#57534E' }}>Total Challenges</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#F3E8E8', color: '#B76E79' }}>
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: '#FFFFFF' }}>{totalChallenges}</div>
          <p className="text-xs mt-1" style={{ color: '#57534E' }}>All time created</p>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#E7DADD' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#57534E' }}>Active Challenges</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#F3E8E8', color: '#B76E79' }}>
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: '#B76E79' }}>{activeChallenges}</div>
          <p className="text-xs mt-1" style={{ color: '#57534E' }}>Currently published & active</p>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#E7DADD' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#57534E' }}>Enrolled Members</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#F3E8E8', color: '#B76E79' }}>
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: '#FFFFFF' }}>{totalParticipants}</div>
          <p className="text-xs mt-1" style={{ color: '#57534E' }}>Total participant enrollments</p>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#E7DADD' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#57534E' }}>Completed Goals</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#F3E8E8', color: '#15803D' }}>
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: '#15803D' }}>{totalCompletions}</div>
          <p className="text-xs mt-1" style={{ color: '#57534E' }}>Successful finishes</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center" style={{ borderColor: '#E7DADD' }}>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3" style={{ color: '#57534E' }} />
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2"
            style={{ borderColor: '#E7DADD' }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: '#57534E' }} />
            <span className="text-xs font-semibold" style={{ color: '#57534E' }}>TYPE:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-[#FFFFFF] focus:outline-none"
              style={{ borderColor: '#E7DADD', color: '#FFFFFF' }}
            >
              <option value="ALL">All Types</option>
              <option value="Attendance">Attendance</option>
              <option value="Workout Completion">Workout Completion</option>
              <option value="Consistency Streak">Consistency Streak</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: '#57534E' }}>STATUS:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-[#FFFFFF] focus:outline-none"
              style={{ borderColor: '#E7DADD', color: '#FFFFFF' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      {loading ? (
        <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border" style={{ borderColor: '#E7DADD' }}>
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#B76E79', borderTopColor: 'transparent' }} />
          <p className="mt-3 text-sm font-medium" style={{ color: '#57534E' }}>Loading challenges...</p>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border" style={{ borderColor: '#E7DADD' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F3E8E8', color: '#B76E79' }}>
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>No Fitness Challenges Found</h3>
          <p className="text-sm max-w-md mx-auto mt-1" style={{ color: '#57534E' }}>
            {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No challenges match your active filters. Try resetting the search or filter options.'
              : 'Launch your first gym challenge today to motivate your members with verified attendance and workout streaks.'}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 px-5 py-2.5 rounded-xl text-white font-medium inline-flex items-center gap-2"
            style={{ backgroundColor: '#B76E79' }}
          >
            <Plus className="w-4 h-4" /> Create Challenge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map(challenge => {
            const IconComponent = BADGE_ICONS[challenge.badgeIcon] || Award;
            const completionRate =
              challenge.participantCount > 0
                ? Math.round((challenge.completionCount / challenge.participantCount) * 100)
                : 0;

            const isExpired = new Date(challenge.endDate) < new Date();

            return (
              <div
                key={challenge._id}
                className="bg-[#FFFFFF] rounded-2xl border shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow"
                style={{ borderColor: '#E7DADD' }}
              >
                {/* Card Top */}
                <div className="p-5 space-y-4">
                  {/* Status & Type Pills */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{
                        backgroundColor:
                          challenge.challengeType === 'Attendance'
                            ? '#F3E8E8'
                            : challenge.challengeType === 'Workout Completion'
                            ? '#FEF3C7'
                            : '#EDE9FE',
                        color:
                          challenge.challengeType === 'Attendance'
                            ? '#B76E79'
                            : challenge.challengeType === 'Workout Completion'
                            ? '#B45309'
                            : '#7C3AED'
                      }}
                    >
                      {challenge.challengeType}
                    </span>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        challenge.status === 'Published'
                          ? 'bg-[#F3E8E8] text-[#B76E79]'
                          : challenge.status === 'Paused'
                          ? 'bg-amber-100 text-amber-800'
                          : challenge.status === 'Completed'
                          ? 'bg-[#F3E8E8] text-[#B76E79]'
                          : 'bg-[#F3E8E8] text-[#292524]'
                      }`}
                    >
                      {challenge.status}
                    </span>
                  </div>

                  {/* Title & Badge */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg" style={{ backgroundColor: '#F3E8E8', color: '#B76E79' }}>
                        <IconComponent className="w-5 h-5" />
                      </span>
                      <h3 className="font-bold text-lg leading-tight line-clamp-1" style={{ color: '#FFFFFF' }}>
                        {challenge.title}
                      </h3>
                    </div>
                    <p className="text-xs line-clamp-2 mt-2" style={{ color: '#57534E' }}>
                      {challenge.description}
                    </p>
                  </div>

                  {/* Target & Rules */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl text-xs" style={{ backgroundColor: '#FFFFFF' }}>
                    <div>
                      <span className="text-muted block text-[11px]" style={{ color: '#57534E' }}>TARGET GOAL</span>
                      <span className="font-bold text-sm" style={{ color: '#FFFFFF' }}>
                        {challenge.targetValue} {challenge.targetUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block text-[11px]" style={{ color: '#57534E' }}>POINTS / ACTIVITY</span>
                      <span className="font-bold text-sm" style={{ color: '#B76E79' }}>
                        +{challenge.pointsPerActivity} pts
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block text-[11px]" style={{ color: '#57534E' }}>COMPLETION BONUS</span>
                      <span className="font-bold text-sm" style={{ color: '#15803D' }}>
                        +{challenge.completionBonusPoints} pts
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block text-[11px]" style={{ color: '#57534E' }}>BADGE AWARD</span>
                      <span className="font-semibold text-xs truncate block" style={{ color: '#FFFFFF' }}>
                        {challenge.badgeName}
                      </span>
                    </div>
                  </div>

                  {/* Reward Attached */}
                  {challenge.rewardId && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed text-xs" style={{ borderColor: '#B76E79', backgroundColor: '#F0F9F8' }}>
                      <Gift className="w-4 h-4 shrink-0" style={{ color: '#B76E79' }} />
                      <div className="truncate">
                        <span className="font-bold" style={{ color: '#B76E79' }}>Linked Reward: </span>
                        <span style={{ color: '#FFFFFF' }}>{(challenge.rewardId as any).title || 'Coupon'}</span>
                      </div>
                    </div>
                  )}

                  {/* Date Range */}
                  <div className="flex items-center justify-between text-xs" style={{ color: '#57534E' }}>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}</span>
                    </div>
                    {isExpired && <span className="text-red-500 font-semibold">Ended</span>}
                  </div>

                  {/* Participation Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span style={{ color: '#57534E' }}>{challenge.participantCount} Enrolled</span>
                      <span style={{ color: '#15803D' }}>{challenge.completionCount} Completed ({completionRate}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F3E8E8' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, completionRate)}%`, backgroundColor: '#B76E79' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 border-t flex flex-wrap items-center justify-between gap-2" style={{ borderColor: '#E7DADD', backgroundColor: '#FAFCFC' }}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openParticipantsModal(challenge)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition hover:bg-[#FFFFFF]"
                      style={{ borderColor: '#E7DADD', color: '#FFFFFF' }}
                      title="View enrolled participants & verified progress"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Participants
                    </button>

                    {challenge.isLeaderboardEnabled && (
                      <button
                        onClick={() => openLeaderboardModal(challenge)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition hover:bg-[#FFFFFF]"
                        style={{ borderColor: '#E7DADD', color: '#B76E79' }}
                        title="View live challenge leaderboard"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        Rankings
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {challenge.status === 'Published' ? (
                      <button
                        onClick={() => handleStatusChange(challenge._id, 'Paused')}
                        className="p-1.5 text-xs rounded-lg hover:bg-amber-50 text-amber-700"
                        title="Pause Challenge"
                      >
                        Pause
                      </button>
                    ) : challenge.status === 'Paused' ? (
                      <button
                        onClick={() => handleStatusChange(challenge._id, 'Published')}
                        className="p-1.5 text-xs rounded-lg hover:bg-[#F3E8E8] text-[#B76E79]"
                        title="Publish Challenge"
                      >
                        Publish
                      </button>
                    ) : null}

                    <button
                      onClick={() => openEditModal(challenge)}
                      className="p-1.5 rounded-lg hover:bg-[#F3E8E8] text-[#292524]"
                      title="Edit Challenge"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(challenge._id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
                      title="Delete Challenge"
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

      {/* CREATE / EDIT CHALLENGE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border my-8" style={{ borderColor: '#E7DADD' }}>
            <div className="sticky top-0 bg-[#FFFFFF] px-6 py-4 border-b flex justify-between items-center z-10" style={{ borderColor: '#E7DADD' }}>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" style={{ color: '#B76E79' }} />
                <h2 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                  {isEditMode ? 'Edit Fitness Challenge' : 'Create New Fitness Challenge'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F3E8E8] text-[#57534E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {/* Challenge Name */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  Challenge Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 30-Day Summer Shred Challenge"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E7DADD' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                  Description & Rules *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the rules, requirements, and motivation..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#E7DADD' }}
                />
              </div>

              {/* Type & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    Challenge Type *
                  </label>
                  <select
                    value={formData.challengeType}
                    onChange={e => {
                      const t = e.target.value as any;
                      setFormData({
                        ...formData,
                        challengeType: t,
                        targetUnit: t === 'Attendance' ? 'Visits' : t === 'Workout Completion' ? 'Workouts' : 'Days'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#E7DADD' }}
                  >
                    <option value="Attendance">Attendance</option>
                    <option value="Workout Completion">Workout Completion</option>
                    <option value="Consistency Streak">Consistency Streak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#E7DADD' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#E7DADD' }}
                  />
                </div>
              </div>

              {/* Target & Units */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    Target Goal Value *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.targetValue}
                    onChange={e => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#E7DADD' }}
                  />
                  <span className="text-[11px] mt-0.5 block" style={{ color: '#57534E' }}>
                    e.g. 12 gym visits, 15 workouts, or 14 streak days
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    Target Unit
                  </label>
                  <input
                    type="text"
                    value={formData.targetUnit}
                    onChange={e => setFormData({ ...formData, targetUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#E7DADD' }}
                  />
                </div>
              </div>

              {/* Points Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    Points Per Verified Activity
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.pointsPerActivity}
                    onChange={e => setFormData({ ...formData, pointsPerActivity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none bg-[#FFFFFF]"
                    style={{ borderColor: '#E7DADD' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    Completion Bonus Points
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.completionBonusPoints}
                    onChange={e => setFormData({ ...formData, completionBonusPoints: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none bg-[#FFFFFF]"
                    style={{ borderColor: '#E7DADD' }}
                  />
                </div>
              </div>

              {/* Badge Name & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    Achievement Badge Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Iron Beast, Streak Champion"
                    value={formData.badgeName}
                    onChange={e => setFormData({ ...formData, badgeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#E7DADD' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#FFFFFF' }}>
                    Badge Icon
                  </label>
                  <select
                    value={formData.badgeIcon}
                    onChange={e => setFormData({ ...formData, badgeIcon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                    style={{ borderColor: '#E7DADD' }}
                  >
                    <option value="Award">Award (Standard)</option>
                    <option value="Trophy">Trophy (Prestige)</option>
                    <option value="Flame">Flame (Streak / Cardio)</option>
                    <option value="Zap">Zap (Intensity / Power)</option>
                    <option value="Shield">Shield (Endurance)</option>
                    <option value="Star">Star (Star Performer)</option>
                  </select>
                </div>
              </div>

              {/* Optional Linked Reward */}
              <div className="p-4 rounded-xl border" style={{ borderColor: '#E7DADD' }}>
                <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#B76E79' }}>
                  <Gift className="w-4 h-4" /> Optional Completion Reward
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium mb-1" style={{ color: '#57534E' }}>
                      Reward Definition
                    </label>
                    <select
                      value={formData.rewardId}
                      onChange={e => setFormData({ ...formData, rewardId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                      style={{ borderColor: '#E7DADD' }}
                    >
                      <option value="">No reward attached</option>
                      {rewards.map(r => (
                        <option key={r._id} value={r._id}>
                          {r.title} ({r.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#57534E' }}>
                      Reward Quantity Limit
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0 = unlimited"
                      value={formData.rewardQuantity}
                      onChange={e => setFormData({ ...formData, rewardQuantity: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                      style={{ borderColor: '#E7DADD' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#57534E' }}>
                      Reward Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.rewardExpiryDate}
                      onChange={e => setFormData({ ...formData, rewardExpiryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none"
                      style={{ borderColor: '#E7DADD' }}
                    />
                  </div>
                </div>
              </div>

              {/* Eligible Packages */}
              {packages.length > 0 && (
                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: '#FFFFFF' }}>
                    Eligible Customer Packages (Leave unselected for all packages)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-xl" style={{ borderColor: '#E7DADD' }}>
                    {packages.map(pkg => {
                      const isSelected = formData.eligiblePackageIds.includes(pkg._id);
                      return (
                        <button
                          type="button"
                          key={pkg._id}
                          onClick={() => {
                            if (isSelected) {
                              setFormData({
                                ...formData,
                                eligiblePackageIds: formData.eligiblePackageIds.filter(id => id !== pkg._id)
                              });
                            } else {
                              setFormData({
                                ...formData,
                                eligiblePackageIds: [...formData.eligiblePackageIds, pkg._id]
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition ${
                            isSelected
                              ? 'bg-[#F3E8E8] border-[#B76E79] text-[#B76E79]'
                              : 'bg-[#FFFFFF] border-[#E7DADD] text-[#292524] hover:border-[#E7DADD]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          {pkg.name || pkg.planName || 'Package'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Toggles & Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t" style={{ borderColor: '#E7DADD' }}>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isLeaderboardEnabled}
                      onChange={e => setFormData({ ...formData, isLeaderboardEnabled: e.target.checked })}
                      className="rounded text-[#B76E79] focus:ring-[#B76E79]"
                    />
                    <span className="text-xs font-medium" style={{ color: '#FFFFFF' }}>Enable Public Leaderboard</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireApproval}
                      onChange={e => setFormData({ ...formData, requireApproval: e.target.checked })}
                      className="rounded text-[#B76E79] focus:ring-[#B76E79]"
                    />
                    <span className="text-xs font-medium" style={{ color: '#FFFFFF' }}>Require Claim Approval</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: '#FFFFFF' }}>Status:</span>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none"
                    style={{ borderColor: '#E7DADD' }}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: '#E7DADD' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-[#F3E8E8]"
                  style={{ borderColor: '#E7DADD', color: '#57534E' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl text-white text-sm font-semibold shadow hover:opacity-90"
                  style={{ backgroundColor: '#B76E79' }}
                >
                  {isEditMode ? 'Save Changes' : 'Publish Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PARTICIPANTS MODAL */}
      {participantsModalOpen && viewingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border" style={{ borderColor: '#E7DADD' }}>
            <div className="sticky top-0 bg-[#FFFFFF] px-6 py-4 border-b flex justify-between items-center z-10" style={{ borderColor: '#E7DADD' }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                  Enrolled Participants — {viewingChallenge.title}
                </h3>
                <p className="text-xs" style={{ color: '#57534E' }}>
                  Target: {viewingChallenge.targetValue} {viewingChallenge.targetUnit} • Type: {viewingChallenge.challengeType}
                </p>
              </div>
              <button
                onClick={() => setParticipantsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F3E8E8] text-[#57534E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {loadingParticipants ? (
                <div className="py-12 text-center text-sm" style={{ color: '#57534E' }}>Loading participants...</div>
              ) : participants.length === 0 ? (
                <div className="py-12 text-center text-sm" style={{ color: '#57534E' }}>
                  No members have joined this challenge yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase" style={{ borderColor: '#E7DADD', color: '#57534E' }}>
                        <th className="py-3 px-3">Member</th>
                        <th className="py-3 px-3">Progress</th>
                        <th className="py-3 px-3">Streak</th>
                        <th className="py-3 px-3">Points Earned</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Reward Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#E7DADD' }}>
                      {participants.map(p => {
                        const progressPct = Math.min(100, Math.round((p.currentProgress / p.targetValue) * 100));
                        return (
                          <tr key={p._id} className="hover:bg-[#F3E8E8]/50">
                            <td className="py-3 px-3">
                              <div className="font-semibold" style={{ color: '#FFFFFF' }}>
                                {p.customerId?.firstName || 'Customer'} {p.customerId?.lastName || ''}
                              </div>
                              <div className="text-xs text-[#57534E]">{p.customerId?.email}</div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs" style={{ color: '#FFFFFF' }}>
                                  {p.currentProgress} / {p.targetValue}
                                </span>
                                <div className="w-20 h-2 bg-[#F3E8E8] rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full"
                                    style={{ width: `${progressPct}%`, backgroundColor: '#B76E79' }}
                                  />
                                </div>
                                <span className="text-[11px] text-[#57534E]">{progressPct}%</span>
                              </div>
                            </td>

                            <td className="py-3 px-3 font-semibold text-xs" style={{ color: '#B45309' }}>
                              🔥 {p.streakDays || 0} days
                            </td>

                            <td className="py-3 px-3 font-bold text-xs" style={{ color: '#B76E79' }}>
                              +{p.pointsEarned} pts
                            </td>

                            <td className="py-3 px-3">
                              {p.completed ? (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F3E8E8] text-[#B76E79]">
                                  Completed
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F3E8E8] text-[#B76E79]">
                                  In Progress
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-xs">
                              <span
                                className={`px-2 py-0.5 rounded-full font-medium ${
                                  p.rewardClaimStatus === 'Claimed' || p.rewardClaimStatus === 'Approved'
                                    ? 'bg-[#F3E8E8] text-[#B76E79]'
                                    : p.rewardClaimStatus === 'Pending Approval'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-[#F3E8E8] text-[#292524]'
                                }`}
                              >
                                {p.rewardClaimStatus}
                              </span>
                              {p.claimCode && <span className="block font-mono text-[11px] text-[#57534E] mt-0.5">Code: {p.claimCode}</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEADERBOARD MODAL */}
      {leaderboardModalOpen && viewingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border" style={{ borderColor: '#E7DADD' }}>
            <div className="sticky top-0 bg-[#FFFFFF] px-6 py-4 border-b flex justify-between items-center z-10" style={{ borderColor: '#E7DADD' }}>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" style={{ color: '#B76E79' }} />
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                    Challenge Leaderboard
                  </h3>
                  <p className="text-xs" style={{ color: '#57534E' }}>{viewingChallenge.title}</p>
                </div>
              </div>
              <button
                onClick={() => setLeaderboardModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F3E8E8] text-[#57534E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {loadingLeaderboard ? (
                <div className="py-12 text-center text-sm" style={{ color: '#57534E' }}>Loading rankings...</div>
              ) : leaderboardData.length === 0 ? (
                <div className="py-12 text-center text-sm" style={{ color: '#57534E' }}>No participants ranked yet.</div>
              ) : (
                <div className="space-y-3">
                  {leaderboardData.map((item, idx) => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;

                    return (
                      <div
                        key={item.participantId}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                          isTop1
                            ? 'bg-amber-50/60 border-amber-200'
                            : isTop2
                            ? 'bg-[#F3E8E8] border-[#E7DADD]'
                            : isTop3
                            ? 'bg-[#F3E8E8]/50 border-[#E7DADD]'
                            : 'bg-[#FFFFFF] border-[#E7DADD]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                              isTop1
                                ? 'bg-amber-400 text-white'
                                : isTop2
                                ? 'bg-slate-400 text-white'
                                : isTop3
                                ? 'bg-[#B76E79] text-white'
                                : 'bg-[#F3E8E8] text-[#292524]'
                            }`}
                          >
                            {item.rank}
                          </span>

                          <div>
                            <div className="font-bold text-sm" style={{ color: '#FFFFFF' }}>
                              {item.displayName}
                            </div>
                            <div className="text-xs" style={{ color: '#57534E' }}>
                              {item.currentProgress} / {item.targetValue} {viewingChallenge.targetUnit}
                              {item.streakDays > 0 && ` • 🔥 ${item.streakDays}d streak`}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm" style={{ color: '#B76E79' }}>
                            +{item.pointsEarned} pts
                          </span>
                          {item.completed && (
                            <span className="block text-[11px] font-semibold text-[#B76E79]">
                              🏆 Finished
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
