import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  Shield,
  Star,
  CheckCircle2,
  Clock,
  Calendar,
  Gift,
  Coins,
  Ticket,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Copy,
  Check,
  X,
  Lock,
  Sparkles,
  Info,
  Utensils,
  Activity,
  CalendarCheck
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
  rewardId?: any;
  rewardQuantity?: number;
  isPackageEligible?: boolean;
  isExpired?: boolean;
  participantData?: {
    _id: string;
    currentProgress: number;
    targetValue: number;
    completed: boolean;
    completedAt?: string;
    pointsEarned: number;
    streakDays: number;
    rewardClaimStatus: string;
    claimCode?: string;
    trainerFeedback?: string;
    trainerFeedbackAt?: string;
  };
}

interface Wallet {
  currentBalance: number;
  totalEarned: number;
  totalRedeemed: number;
  badges: Array<{
    badgeName: string;
    badgeIcon: string;
    challengeTitle?: string;
    earnedAt: string;
  }>;
}

interface Reward {
  _id: string;
  title: string;
  description: string;
  category: string;
  requiredPoints: number;
  requiredChallengeId?: any;
  bonusAmount?: number;
  totalQuantity: number;
  claimedCount: number;
  termsAndConditions?: string;
  expiryDate?: string;
  requireApproval: boolean;
}

interface Claim {
  _id: string;
  rewardId: Reward;
  claimCode: string;
  pointsDeducted: number;
  claimStatus: 'Pending' | 'Approved' | 'Rejected' | 'Redeemed' | 'Expired';
  rejectionReason?: string;
  createdAt: string;
}

const BADGE_ICONS: { [key: string]: any } = {
  Award,
  Trophy,
  Flame,
  Zap,
  Shield,
  Star
};

export default function MemberChallenges() {
  const [activeTab, setActiveTab] = useState<'performance' | 'available' | 'active' | 'completed' | 'wallet' | 'leaderboard' | 'rewards' | 'claims'>('performance');
  const [myPerformance, setMyPerformance] = useState<any>(null);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [wallet, setWallet] = useState<Wallet>({ currentBalance: 0, totalEarned: 0, totalRedeemed: 0, badges: [] });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  // Selected Challenge Details Modal
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Leaderboard Modal / Tab
  const [leaderboardChallengeId, setLeaderboardChallengeId] = useState<string>('');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Copy code helper
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Feedback Notification
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const [chRes, rwdRes, perfRes] = await Promise.all([
        api.get('/challenges/member'),
        api.get('/rewards/member').catch(() => ({ data: { rewards: [], claims: [], transactions: [] } })),
        api.get('/performance/my-performance').catch(() => ({ data: { performance: null } }))
      ]);

      if (chRes.data?.success) {
        setAvailableChallenges(chRes.data.available || []);
        setActiveChallenges(chRes.data.active || []);
        setCompletedChallenges(chRes.data.completed || []);
        setWallet(chRes.data.wallet || { currentBalance: 0, totalEarned: 0, totalRedeemed: 0, badges: [] });

        // Set default leaderboard challenge
        const all = [...(chRes.data.active || []), ...(chRes.data.completed || []), ...(chRes.data.available || [])];
        if (all.length > 0 && !leaderboardChallengeId) {
          setLeaderboardChallengeId(all[0]._id);
        }
      }

      if (rwdRes.data?.success) {
        setRewards(rwdRes.data.rewards || []);
        setClaims(rwdRes.data.claims || []);
        setTransactions(rwdRes.data.transactions || []);
      }

      if (perfRes.data?.success && perfRes.data.performance) {
        setMyPerformance(perfRes.data.performance);
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load challenges data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberData();
  }, []);

  // Fetch leaderboard when challenge selection changes
  useEffect(() => {
    if (!leaderboardChallengeId) return;
    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const res = await api.get(`/challenges/${leaderboardChallengeId}/leaderboard`);
        if (res.data?.success) {
          setLeaderboardData(res.data.leaderboard || []);
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
        setLeaderboardData([]);
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
  }, [leaderboardChallengeId]);

  const handleJoinChallenge = async (id: string) => {
    try {
      setJoiningId(id);
      const res = await api.post(`/challenges/${id}/join`);
      setMessage({ type: 'success', text: 'You have joined the challenge! Let\'s crush it!' });
      setSelectedChallenge(null);
      await fetchMemberData();
      setActiveTab('active');
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to join challenge' });
    } finally {
      setJoiningId(null);
    }
  };

  const handleSyncProgress = async (challengeId: string) => {
    try {
      setSyncing(challengeId);
      const res = await api.post('/challenges/sync-progress', { challengeId });
      setMessage({ type: 'success', text: 'Progress synchronized with verified records!' });
      await fetchMemberData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to sync progress' });
    } finally {
      setSyncing(null);
    }
  };

  const handleClaimReward = async (rewardId: string, challengeId?: string) => {
    try {
      const res = await api.post('/rewards/claim', { rewardId, challengeId });
      setMessage({ type: 'success', text: res.data?.message || 'Reward claimed successfully!' });
      await fetchMemberData();
      setActiveTab('claims');
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to claim reward' });
    }
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const allChallengesList = [...activeChallenges, ...completedChallenges, ...availableChallenges];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6" style={{ backgroundColor: '#E8EFF0', minHeight: '100vh' }}>
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ borderColor: '#D9E2E3' }}>
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl" style={{ backgroundColor: '#D8EAE7' }}>
            <Trophy className="w-8 h-8" style={{ color: '#167D78' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#344B4A' }}>
              Fitness Challenges & Rewards
            </h1>
            <p className="text-sm" style={{ color: '#697778' }}>
              Level up your workouts, maintain attendance streaks, and earn points and badges.
            </p>
          </div>
        </div>

        {/* Points & Badge Pills */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none p-3 px-4 rounded-xl border flex items-center gap-3 bg-white shadow-sm" style={{ borderColor: '#D9E2E3' }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#D8EAE7', color: '#167D78' }}>
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold block" style={{ color: '#697778' }}>MY POINTS BALANCE</span>
              <span className="text-xl font-black" style={{ color: '#167D78' }}>
                {wallet.currentBalance} pts
              </span>
            </div>
          </div>

          <div className="flex-1 md:flex-none p-3 px-4 rounded-xl border flex items-center gap-3 bg-white shadow-sm" style={{ borderColor: '#D9E2E3' }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: '#D99A27' }}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold block" style={{ color: '#697778' }}>EARNED BADGES</span>
              <span className="text-xl font-black" style={{ color: '#344B4A' }}>
                {wallet.badges?.length || 0}
              </span>
            </div>
          </div>
        </div>
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

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b gap-2 sm:gap-6" style={{ borderColor: '#D9E2E3' }}>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'performance'
              ? 'border-[#167D78] text-[#167D78]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          My Performance
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'active'
              ? 'border-[#167D78] text-[#167D78]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Flame className="w-4 h-4" />
          Active Challenges ({activeChallenges.length})
        </button>

        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'available'
              ? 'border-[#167D78] text-[#167D78]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Available Challenges ({availableChallenges.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'completed'
              ? 'border-[#167D78] text-[#167D78]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed ({completedChallenges.length})
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'wallet'
              ? 'border-[#167D78] text-[#167D78]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Coins className="w-4 h-4" />
          Points & Badges
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'leaderboard'
              ? 'border-[#167D78] text-[#167D78]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Leaderboard
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'rewards'
              ? 'border-[#167D78] text-[#167D78]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Gift className="w-4 h-4" />
          Rewards Store ({rewards.length})
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'claims'
              ? 'border-[#167D78] text-[#167D78]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Ticket className="w-4 h-4" />
          My Vouchers ({claims.length})
        </button>
      </div>

      {/* TAB 0: MY PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Top 4 Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Verified Attendance</span>
                <span className="p-2 rounded-lg bg-amber-50 text-amber-600"><Flame className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-gray-800">
                {myPerformance?.attendance?.totalVerifiedVisits || 0} <span className="text-sm font-normal text-gray-500">visits</span>
              </div>
              <p className="text-xs text-amber-600 font-semibold mt-1">
                🔥 {myPerformance?.attendance?.streakDays || 0} day streak
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Workout Completion</span>
                <span className="p-2 rounded-lg bg-[#D8EAE7] text-[#167D78]"><TrendingUp className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#167D78]">
                {myPerformance?.workouts?.completionPercentage !== null && myPerformance?.workouts?.completionPercentage !== undefined
                  ? `${myPerformance.workouts.completionPercentage}%`
                  : 'Not Recorded'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {myPerformance?.workouts?.completedCount || 0} workouts completed
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Diet Adherence</span>
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><Utensils className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-emerald-700">
                {myPerformance?.diet?.adherencePercentage !== null && myPerformance?.diet?.adherencePercentage !== undefined
                  ? `${myPerformance.diet.adherencePercentage}%`
                  : 'No Logs'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {myPerformance?.diet?.totalMealsRecorded || 0} meal check-ins recorded
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                <span>Reward Points</span>
                <span className="p-2 rounded-lg bg-[#D8EAE7] text-[#167D78]"><Coins className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#167D78]">
                {wallet.currentBalance} <span className="text-sm font-normal text-gray-500">pts</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {wallet.badges?.length || 0} unlocked badges
              </p>
            </div>
          </div>

          {/* Body Measurements & Physical Progress */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-[#167D78]" /> Physical Fitness Measurements & Progress
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Real body composition metrics and strength progress logged at the gym.
            </p>

            {myPerformance?.measurements ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border">
                  <span className="text-gray-400 block font-medium">CURRENT WEIGHT</span>
                  <span className="text-xl font-black text-gray-800 mt-1 block">
                    {myPerformance.measurements.currentWeight} kg
                  </span>
                  {myPerformance.measurements.weightChange !== 0 && (
                    <span className={`text-[11px] font-bold ${myPerformance.measurements.weightChange < 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {myPerformance.measurements.weightChange > 0 ? `+${myPerformance.measurements.weightChange}` : myPerformance.measurements.weightChange} kg from start
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border">
                  <span className="text-gray-400 block font-medium">BODY FAT %</span>
                  <span className="text-xl font-black text-gray-800 mt-1 block">
                    {myPerformance.measurements.bodyFatPercentage ? `${myPerformance.measurements.bodyFatPercentage}%` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-gray-400">Bio-impedance / caliper</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border">
                  <span className="text-gray-400 block font-medium">BENCH PRESS MAX</span>
                  <span className="text-xl font-black text-gray-800 mt-1 block">
                    {myPerformance.measurements.benchPressMax ? `${myPerformance.measurements.benchPressMax} kg` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-gray-400">Personal record</span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border">
                  <span className="text-gray-400 block font-medium">SQUAT MAX</span>
                  <span className="text-xl font-black text-gray-800 mt-1 block">
                    {myPerformance.measurements.squatMax ? `${myPerformance.measurements.squatMax} kg` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-gray-400">Personal record</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border">
                No physical measurements recorded yet. Ask your trainer to log your weight and fitness stats!
              </div>
            )}
          </div>

          {/* Verified Gym Attendance History */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: '#D9E2E3' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-[#167D78]" /> Verified Gym Attendance History
                </h3>
                <p className="text-xs text-gray-500">
                  Real check-ins and session attendance records verified on the gym floor.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#D8EAE7] text-[#167D78] text-xs">
                  {myPerformance?.attendance?.totalVerifiedVisits || 0} Visits Total
                </span>
                {myPerformance?.attendance?.streakDays > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 text-xs">
                    🔥 {myPerformance.attendance.streakDays}d Streak
                  </span>
                )}
              </div>
            </div>

            {(!myPerformance?.attendance?.attendanceLogs || myPerformance.attendance.attendanceLogs.length === 0) ? (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border">
                No attendance visits recorded yet. Check-in during your next gym visit to build your streak!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8EFF0' }}>
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-50 text-gray-500 border-b text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Check-in / Check-out</th>
                      <th className="py-2.5 px-3">Session Mode</th>
                      <th className="py-2.5 px-3">Trainer / Floor</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-gray-700" style={{ borderColor: '#E8EFF0' }}>
                    {myPerformance.attendance.attendanceLogs.map((log: any, idx: number) => (
                      <tr key={log._id || idx} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-semibold text-gray-800">
                          {log.date ? new Date(log.date).toLocaleDateString() : 'Visit'}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {log.checkInTime || '—'} {log.checkOutTime && log.checkOutTime !== '—' ? ` - ${log.checkOutTime}` : ''}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded font-medium bg-gray-100 text-gray-700 text-[11px]">
                            {log.mode || 'In-Person Gym Visit'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {log.trainerName || 'Gym Floor'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
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

          {/* Active Challenges & Rewards Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ borderColor: '#D9E2E3' }}>
              <div>
                <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-amber-500" /> My Active Challenges
                </h4>
                <p className="text-xs text-gray-500">
                  You are currently competing in {activeChallenges.length} challenges. Keep up the attendance streak to unlock bonus points!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('active')}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#167D78] self-start"
              >
                View Active Challenges
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col justify-between" style={{ borderColor: '#D9E2E3' }}>
              <div>
                <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-emerald-600" /> Available Rewards
                </h4>
                <p className="text-xs text-gray-500">
                  You have {wallet.currentBalance} points available to redeem discount coupons, merchandise vouchers, and free personal sessions.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('rewards')}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#167D78] self-start"
              >
                Browse Rewards Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: ACTIVE CHALLENGES */}
      {activeTab === 'active' && (
        <div>
          {loading ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#167D78', borderTopColor: 'transparent' }} />
              <p className="mt-2 text-xs text-gray-500">Checking active challenges...</p>
            </div>
          ) : activeChallenges.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <Flame className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold" style={{ color: '#344B4A' }}>No Active Challenges</h3>
              <p className="text-sm max-w-sm mx-auto mt-1" style={{ color: '#697778' }}>
                You have not joined any challenges yet. Browse the Available Challenges tab and join one to start tracking your progress!
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-semibold"
                style={{ backgroundColor: '#167D78' }}
              >
                Browse Challenges
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChallenges.map(challenge => {
                const p = challenge.participantData!;
                const IconComponent = BADGE_ICONS[challenge.badgeIcon] || Award;
                const progressPct = Math.min(100, Math.round((p.currentProgress / challenge.targetValue) * 100));
                const remaining = Math.max(0, challenge.targetValue - p.currentProgress);

                return (
                  <div
                    key={challenge._id}
                    className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                    style={{ borderColor: '#D9E2E3' }}
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{ backgroundColor: '#D8EAE7', color: '#167D78' }}
                        >
                          {challenge.challengeType}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#D99A27' }}>
                          <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>{p.streakDays} Day Streak</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="flex items-start gap-3">
                        <span className="p-2 rounded-xl shrink-0" style={{ backgroundColor: '#D8EAE7', color: '#167D78' }}>
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <div>
                          <h3 className="font-bold text-base leading-tight" style={{ color: '#344B4A' }}>
                            {challenge.title}
                          </h3>
                          <p className="text-xs line-clamp-2 text-gray-500 mt-1">
                            {challenge.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress Metrics */}
                      <div className="p-3.5 rounded-xl bg-gray-50/80 border space-y-2" style={{ borderColor: '#E8EFF0' }}>
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="text-gray-500 font-medium">Completed Progress:</span>
                          <span className="font-bold text-sm" style={{ color: '#344B4A' }}>
                            {p.currentProgress} / {challenge.targetValue} {challenge.targetUnit}
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%`, backgroundColor: '#167D78' }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <span className="text-gray-500">{remaining} {challenge.targetUnit} remaining</span>
                          <span className="font-bold text-[#167D78]">+{p.pointsEarned} pts earned</span>
                        </div>
                      </div>

                      {/* Trainer Feedback if provided */}
                      {p.trainerFeedback && (
                        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900">
                          <span className="font-bold block">💬 Trainer Feedback:</span>
                          <span className="italic">{p.trainerFeedback}</span>
                        </div>
                      )}

                      {/* End Date */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Ends {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-emerald-700">
                          +{challenge.pointsPerActivity} pts per {challenge.targetUnit.slice(0, -1) || 'activity'}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Button */}
                    <div className="pt-4 mt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: '#D9E2E3' }}>
                      <button
                        onClick={() => {
                          setLeaderboardChallengeId(challenge._id);
                          setActiveTab('leaderboard');
                        }}
                        className="text-xs font-semibold hover:underline flex items-center gap-1"
                        style={{ color: '#167D78' }}
                      >
                        <Trophy className="w-3.5 h-3.5" /> View Rank
                      </button>

                      <button
                        onClick={() => handleSyncProgress(challenge._id)}
                        disabled={syncing === challenge._id}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition hover:bg-gray-50"
                        style={{ borderColor: '#D9E2E3', color: '#344B4A' }}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${syncing === challenge._id ? 'animate-spin' : ''}`} />
                        Sync Progress
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AVAILABLE CHALLENGES */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {availableChallenges.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold" style={{ color: '#344B4A' }}>No New Challenges Available</h3>
              <p className="text-sm max-w-sm mx-auto mt-1" style={{ color: '#697778' }}>
                You have already enrolled in all open challenges for your gym. Check back soon for new fitness challenges!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableChallenges.map(challenge => {
                const IconComponent = BADGE_ICONS[challenge.badgeIcon] || Award;
                const canJoin = challenge.isPackageEligible !== false && !challenge.isExpired;

                return (
                  <div
                    key={challenge._id}
                    className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                    style={{ borderColor: '#D9E2E3' }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs px-2.5 py-1 rounded-full font-semibold"
                          style={{ backgroundColor: '#D8EAE7', color: '#167D78' }}
                        >
                          {challenge.challengeType}
                        </span>

                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Ends {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: '#D8EAE7', color: '#167D78' }}>
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <div>
                          <h3 className="font-bold text-base leading-tight" style={{ color: '#344B4A' }}>
                            {challenge.title}
                          </h3>
                          <p className="text-xs line-clamp-2 text-gray-500 mt-1">
                            {challenge.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 text-xs space-y-1.5 border" style={{ borderColor: '#E8EFF0' }}>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Target Goal:</span>
                          <span className="font-bold" style={{ color: '#344B4A' }}>
                            {challenge.targetValue} {challenge.targetUnit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Activity Reward:</span>
                          <span className="font-bold text-[#167D78]">
                            +{challenge.pointsPerActivity} pts per verified record
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Bonus for Completing:</span>
                          <span className="font-bold text-[#27845A]">
                            +{challenge.completionBonusPoints} pts + "{challenge.badgeName}"
                          </span>
                        </div>
                      </div>

                      {challenge.isPackageEligible === false && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                          <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>Requires specific gym membership package.</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t flex justify-end gap-2" style={{ borderColor: '#D9E2E3' }}>
                      <button
                        onClick={() => setSelectedChallenge(challenge)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border text-gray-600 hover:bg-gray-50"
                        style={{ borderColor: '#D9E2E3' }}
                      >
                        Details
                      </button>

                      <button
                        onClick={() => handleJoinChallenge(challenge._id)}
                        disabled={!canJoin || joiningId === challenge._id}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow transition ${
                          canJoin ? 'bg-[#167D78] hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {joiningId === challenge._id ? 'Enrolling...' : 'Join Challenge'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED CHALLENGES */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedChallenges.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <Award className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold" style={{ color: '#344B4A' }}>No Completed Challenges Yet</h3>
              <p className="text-sm max-w-sm mx-auto mt-1" style={{ color: '#697778' }}>
                Keep logging your workouts and attendance! When you hit your target goal, your trophies and completion rewards will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedChallenges.map(challenge => {
                const p = challenge.participantData!;
                const IconComponent = BADGE_ICONS[challenge.badgeIcon] || Award;
                const canClaim = p.rewardClaimStatus === 'Eligible' && challenge.rewardId;

                return (
                  <div
                    key={challenge._id}
                    className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between"
                    style={{ borderColor: '#D9E2E3' }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed!
                        </span>

                        <span className="text-xs text-gray-500 font-medium">
                          {p.completedAt ? new Date(p.completedAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="p-2.5 rounded-xl shrink-0 bg-amber-50 text-amber-600 border border-amber-200">
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <div>
                          <h3 className="font-bold text-base leading-tight" style={{ color: '#344B4A' }}>
                            {challenge.title}
                          </h3>
                          <span className="text-xs font-semibold text-[#167D78] block mt-0.5">
                            Badge Earned: {challenge.badgeName}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-gray-50 text-xs space-y-1 border" style={{ borderColor: '#E8EFF0' }}>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Achieved Goal:</span>
                          <span className="font-bold">{p.currentProgress} {challenge.targetUnit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Points Earned:</span>
                          <span className="font-bold text-[#167D78]">+{p.pointsEarned} pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Final Streak:</span>
                          <span className="font-bold text-amber-600">🔥 {p.streakDays} days</span>
                        </div>
                      </div>

                      {/* Reward Claim status */}
                      {challenge.rewardId && (
                        <div className="p-3 rounded-xl border border-dashed text-xs bg-emerald-50/50 border-emerald-300">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-emerald-800 flex items-center gap-1">
                              <Gift className="w-3.5 h-3.5" /> Reward: {(challenge.rewardId as any).title || 'Coupon'}
                            </span>
                            <span className="font-semibold text-emerald-700 text-[11px]">
                              {p.rewardClaimStatus}
                            </span>
                          </div>

                          {p.claimCode && (
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-200">
                              <span className="font-mono font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border">
                                {p.claimCode}
                              </span>
                              <button
                                onClick={() => copyVoucherCode(p.claimCode!)}
                                className="text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1"
                              >
                                {copiedCode === p.claimCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copiedCode === p.claimCode ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t flex justify-end" style={{ borderColor: '#D9E2E3' }}>
                      {canClaim ? (
                        <button
                          onClick={() => handleClaimReward(challenge.rewardId?._id || challenge.rewardId, challenge._id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow bg-[#167D78] hover:opacity-90 flex items-center gap-1.5"
                        >
                          <Gift className="w-4 h-4" /> Claim Reward
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">
                          {p.rewardClaimStatus === 'Claimed' ? 'Reward Claimed' : 'Achievement Unlocked'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: POINTS & BADGES */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Badges Grid */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: '#344B4A' }}>
              My Achievement Badges
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Badges unlocked by completing fitness and attendance challenges.
            </p>

            {wallet.badges?.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                No badges earned yet. Complete challenges to unlock achievement badges!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {wallet.badges.map((badge, idx) => {
                  const IconComp = BADGE_ICONS[badge.badgeIcon] || Award;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border text-center flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 hover:shadow-md transition"
                      style={{ borderColor: '#D9E2E3' }}
                    >
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 shadow-inner" style={{ backgroundColor: '#D8EAE7', color: '#167D78' }}>
                        <IconComp className="w-7 h-7" />
                      </div>
                      <div className="font-bold text-xs" style={{ color: '#344B4A' }}>
                        {badge.badgeName}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1">
                        {badge.challengeTitle || 'Challenge'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Points Transaction Ledger */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: '#344B4A' }}>
              Points History & Ledger
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Detailed audit trail of all earned, redeemed, and bonus points.
            </p>

            {transactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                No points transactions recorded yet.
              </div>
            ) : (
              <div className="divide-y text-sm" style={{ borderColor: '#D9E2E3' }}>
                {transactions.map((tx: any) => (
                  <div key={tx._id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-xs" style={{ color: '#344B4A' }}>
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleString()} • Type: {tx.type}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-[#167D78]' : 'text-red-600'}`}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                      </span>
                      <span className="text-[11px] text-gray-400 block">
                        Bal: {tx.balanceAfter} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: '#D9E2E3' }}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#344B4A' }}>
                Challenge Leaderboard
              </h2>
              <p className="text-xs text-gray-500">
                Privacy-protected rankings. Your name is highlighted as "(You)".
              </p>
            </div>

            {/* Challenge Dropdown */}
            {allChallengesList.length > 0 && (
              <select
                value={leaderboardChallengeId}
                onChange={e => setLeaderboardChallengeId(e.target.value)}
                className="px-3 py-2 rounded-xl border text-sm font-semibold max-w-xs focus:outline-none"
                style={{ borderColor: '#D9E2E3' }}
              >
                {allChallengesList.map(ch => (
                  <option key={ch._id} value={ch._id}>
                    {ch.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {loadingLeaderboard ? (
            <div className="py-12 text-center text-sm text-gray-500">Loading rankings...</div>
          ) : leaderboardData.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No participants ranked for this challenge yet. Join now and make the top spot!
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {leaderboardData.map((item, idx) => {
                const isTop1 = item.rank === 1;
                const isTop2 = item.rank === 2;
                const isTop3 = item.rank === 3;
                const isMe = item.isCurrentUser;

                return (
                  <div
                    key={item.participantId}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                      isMe
                        ? 'bg-[#D8EAE7]/50 border-[#167D78] ring-1 ring-[#167D78]'
                        : isTop1
                        ? 'bg-amber-50/70 border-amber-200'
                        : isTop2
                        ? 'bg-slate-50 border-slate-200'
                        : isTop3
                        ? 'bg-orange-50/50 border-orange-200'
                        : 'bg-white border-gray-100'
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
                            ? 'bg-orange-400 text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {item.rank}
                      </span>

                      <div>
                        <div className={`font-bold text-sm ${isMe ? 'text-[#167D78]' : 'text-[#344B4A]'}`}>
                          {item.displayName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.currentProgress} / {item.targetValue}
                          {item.streakDays > 0 && ` • 🔥 ${item.streakDays}d streak`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-[#167D78]">
                        +{item.pointsEarned} pts
                      </span>
                      {item.completed && (
                        <span className="block text-[11px] font-semibold text-emerald-600">
                          🏆 Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: REWARDS STORE */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border shadow-sm flex justify-between items-center" style={{ borderColor: '#D9E2E3' }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#344B4A' }}>
                Rewards Store
              </h2>
              <p className="text-xs text-gray-500">
                Redeem your earned fitness points for exclusive coupons, merchandise, and sessions.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-500 block">Available Points</span>
              <span className="text-xl font-black text-[#167D78]">{wallet.currentBalance} pts</span>
            </div>
          </div>

          {rewards.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold" style={{ color: '#344B4A' }}>No Rewards In Store Right Now</h3>
              <p className="text-sm max-w-sm mx-auto mt-1" style={{ color: '#697778' }}>
                Your gym owner will publish rewards and discounts soon. Keep earning points!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map(reward => {
                const canAfford = wallet.currentBalance >= (reward.requiredPoints || 0);

                return (
                  <div
                    key={reward._id}
                    className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                    style={{ borderColor: '#D9E2E3' }}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-800">
                          {reward.category}
                        </span>

                        <span className="text-xs font-bold text-[#167D78]">
                          {reward.requiredPoints > 0 ? `${reward.requiredPoints} points` : 'Free'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-base leading-tight" style={{ color: '#344B4A' }}>
                          {reward.title}
                        </h3>
                        <p className="text-xs line-clamp-2 text-gray-500 mt-1">
                          {reward.description}
                        </p>
                      </div>

                      {reward.termsAndConditions && (
                        <p className="text-[11px] text-gray-400 italic">
                          Terms: {reward.termsAndConditions}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t flex justify-between items-center" style={{ borderColor: '#D9E2E3' }}>
                      <span className="text-xs text-gray-500">
                        {reward.requireApproval ? 'Requires Owner Approval' : 'Instant Voucher'}
                      </span>

                      <button
                        onClick={() => handleClaimReward(reward._id)}
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow ${
                          canAfford ? 'bg-[#167D78] hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Redeem Reward' : 'Need More Points'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: MY VOUCHERS / CLAIM HISTORY */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
            <h2 className="text-lg font-bold" style={{ color: '#344B4A' }}>
              My Claimed Vouchers
            </h2>
            <p className="text-xs text-gray-500">
              Present your voucher codes at the gym desk to redeem your rewards and benefits.
            </p>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold" style={{ color: '#344B4A' }}>No Claimed Rewards Yet</h3>
              <p className="text-sm max-w-sm mx-auto mt-1" style={{ color: '#697778' }}>
                When you claim rewards or vouchers, your codes and approval status will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claims.map(claim => (
                <div
                  key={claim._id}
                  className="bg-white rounded-2xl border shadow-sm p-5 space-y-3"
                  style={{ borderColor: '#D9E2E3' }}
                >
                  <div className="flex justify-between items-center">
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

                    <span className="text-xs text-gray-400">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base" style={{ color: '#344B4A' }}>
                      {claim.rewardId?.title || 'Reward'}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {claim.rewardId?.category}
                    </span>
                  </div>

                  {/* Voucher Code Card */}
                  <div className="p-3.5 rounded-xl border border-dashed bg-gray-50 flex items-center justify-between" style={{ borderColor: '#167D78' }}>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">VOUCHER CODE</span>
                      <span className="font-mono font-bold text-base text-[#167D78]">
                        {claim.claimCode}
                      </span>
                    </div>

                    <button
                      onClick={() => copyVoucherCode(claim.claimCode)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-white flex items-center gap-1 text-gray-700 hover:bg-gray-100"
                    >
                      {copiedCode === claim.claimCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode === claim.claimCode ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {claim.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-red-50 text-xs text-red-700">
                      Reason: {claim.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CHALLENGE DETAILS MODAL */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border" style={{ borderColor: '#D9E2E3' }}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#D8EAE7', color: '#167D78' }}>
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#344B4A' }}>
                    {selectedChallenge.title}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800">
                    {selectedChallenge.challengeType}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              {selectedChallenge.description}
            </p>

            <div className="p-4 rounded-xl bg-gray-50 text-xs space-y-2 border mb-5" style={{ borderColor: '#E8EFF0' }}>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium text-gray-800">
                  {new Date(selectedChallenge.startDate).toLocaleDateString()} to {new Date(selectedChallenge.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Target Goal:</span>
                <span className="font-bold text-gray-800">
                  {selectedChallenge.targetValue} {selectedChallenge.targetUnit}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Points Awarded:</span>
                <span className="font-bold text-[#167D78]">
                  +{selectedChallenge.pointsPerActivity} pts per verified visit/workout
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Completion Bonus:</span>
                <span className="font-bold text-[#27845A]">
                  +{selectedChallenge.completionBonusPoints} bonus points
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Achievement Badge:</span>
                <span className="font-semibold text-gray-800">
                  {selectedChallenge.badgeName}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border text-gray-600 hover:bg-gray-50"
                style={{ borderColor: '#D9E2E3' }}
              >
                Close
              </button>

              <button
                onClick={() => handleJoinChallenge(selectedChallenge._id)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow bg-[#167D78] hover:opacity-90"
              >
                Join Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
