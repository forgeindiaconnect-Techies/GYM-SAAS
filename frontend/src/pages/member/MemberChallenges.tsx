import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
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
  CalendarCheck,
  Download,
  Dumbbell
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../utils/api';
import { generateAwardCertificatePDF } from '../../utils/certificateGenerator';

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
  assignmentMethod?: string;
  sessionCount?: number;
  sessionDuration?: string;
  trainerId?: any;
  discountType?: string;
  discountValue?: number;
  applicableService?: string;
  productName?: string;
  productQuantity?: number;
  membershipDuration?: string;
  packageName?: string;
  awardReason?: string;
  memberStatus?: string;
  progressInfo?: {
    required: number;
    current: number;
    label: string;
  };
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
  const [activeTab, setActiveTab] = useState<'performance' | 'rewards' | 'claims' | 'awards'>('performance');
  const [myPerformance, setMyPerformance] = useState<any>(null);
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<Challenge[]>([]);
  const [wallet, setWallet] = useState<Wallet>({ currentBalance: 0, totalEarned: 0, totalRedeemed: 0, badges: [] });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [myAwards, setMyAwards] = useState<any[]>([]);
  const [hallOfFame, setHallOfFame] = useState<any[]>([]);
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

  // Navigation Dropdown State
  const [openDropdown, setOpenDropdown] = useState<'performance' | 'rewards' | 'master' | null>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const [chRes, rwdRes, perfRes, awardsRes, hofRes] = await Promise.all([
        api.get('/challenges/member').catch(() => ({ data: { success: true, available: [], active: [], completed: [], wallet: { currentBalance: 0, totalEarned: 0, totalRedeemed: 0, badges: [] } } })),
        api.get('/rewards/member').catch(() => ({ data: { rewards: [], claims: [], transactions: [] } })),
        api.get('/performance/my-performance').catch(() => ({ data: { performance: null } })),
        api.get('/awards/my-awards').catch(() => ({ data: { awards: [] } })),
        api.get('/awards/hall-of-fame').catch(() => ({ data: { hallOfFame: [] } }))
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

      if (awardsRes.data?.success) {
        setMyAwards(awardsRes.data.awards || []);
      }

      if (hofRes.data?.success) {
        setHallOfFame(hofRes.data.hallOfFame || []);
      }
    } catch (err: any) {
      console.error(err);
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
      setActiveTab('performance');
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

  type TabType = 'performance' | 'rewards' | 'claims' | 'awards';
  type CategoryId = 'performance' | 'rewards';

  interface TabItemDef {
    id: TabType;
    label: string;
    shortLabel: string;
    category: CategoryId;
    icon: any;
    count?: number;
    gold?: boolean;
    description: string;
  }

  const ALL_TAB_ITEMS: TabItemDef[] = [
    // 1. Performance Overview
    {
      id: 'performance',
      label: 'My Performance',
      shortLabel: 'Performance',
      category: 'performance',
      icon: TrendingUp,
      description: 'Attendance stats, workout progress & adherence streaks'
    },
    // 2. Rewards, Store & Honors
    {
      id: 'rewards',
      label: `Rewards Store (${rewards.length})`,
      shortLabel: `Store (${rewards.length})`,
      category: 'rewards',
      icon: Gift,
      count: rewards.length,
      description: 'Redeem your points for gifts, passes & discounts'
    },
    {
      id: 'claims',
      label: `My Vouchers (${claims.length})`,
      shortLabel: `Vouchers (${claims.length})`,
      category: 'rewards',
      icon: Ticket,
      count: claims.length,
      description: 'Claimed reward codes, passes & store vouchers'
    },
    {
      id: 'awards',
      label: `Awards & Honors (${myAwards.length})`,
      shortLabel: `Awards (${myAwards.length})`,
      category: 'rewards',
      icon: Award,
      count: myAwards.length,
      gold: true,
      description: 'Official gym awards, recognitions & certificates'
    }
  ];

  const CATEGORIES: {
    id: CategoryId;
    title: string;
    icon: any;
    subTabs: TabType[];
  }[] = [
    {
      id: 'performance',
      title: 'Performance Overview',
      icon: TrendingUp,
      subTabs: ['performance']
    },
    {
      id: 'rewards',
      title: 'Rewards & Honors',
      icon: Gift,
      subTabs: ['rewards', 'claims', 'awards']
    }
  ];

  const currentCategory = CATEGORIES.find(c => c.subTabs.includes(activeTab)) || CATEGORIES[0];
  const currentTabItem = ALL_TAB_ITEMS.find(t => t.id === activeTab) || ALL_TAB_ITEMS[0];

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto pb-12">
      {/* Header Banner - Modern Light theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#F8FAFC] border border-[#E2E8F0] p-6 sm:p-8 shadow-xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(183,110,121,0.08)_0%,_transparent_70%)] pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shadow-md shadow-orange-500/15 shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 mb-1.5 bg-[#FFF7ED] border border-[#FFEDD5] rounded-full text-[10px] font-bold uppercase tracking-wider text-[#EA580C]">
              <Award size={12} className="text-[#EA580C]" />
              Rewards & Performance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827] truncate">
              Rewards & Performance
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 max-w-xl">
              Level up your workouts, maintain attendance streaks, and earn rewards and honors.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full xl:w-auto shrink-0 relative z-10">
          <div className="flex-1 sm:flex-initial min-w-[170px] p-3.5 px-5 rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#64748B] block whitespace-nowrap">Points Balance</span>
              <span className="text-xl font-black text-[#111827]">
                {wallet.currentBalance} <span className="text-xs font-semibold text-[#EA580C]">pts</span>
              </span>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial min-w-[170px] p-3.5 px-5 rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#64748B] block whitespace-nowrap">Honors & Awards</span>
              <span className="text-xl font-black text-[#EA580C]">
                {myAwards?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={clsx(
            "p-4 rounded-2xl flex items-center justify-between border shadow-lg transition-all",
            message.type === 'success'
              ? 'bg-[#FFF7ED] border-[#E2E8F0]/60 text-[#EA580C]'
              : 'bg-red-50 border-rose-800/60 text-rose-300'
          )}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" /> : <AlertCircle className="w-5 h-5 text-[#B91C1C] shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-[#FFFFFF]/10 rounded-lg text-zinc-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Organized Navigation with Dropdown Options */}
      <div ref={dropdownContainerRef} className="space-y-3 bg-[#FFFFFF]/90 border border-[#E2E8F0] p-3 sm:p-4 rounded-2xl shadow-xl backdrop-blur-sm relative z-30">
        {/* Top Navigation Row: Category Dropdowns + Master View Selector Dropdown */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Category Dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => {
              const isCatActive = cat.subTabs.includes(activeTab);
              const isOpen = openDropdown === cat.id;
              const CatIcon = cat.icon;

              return (
                <div key={cat.id} className="relative">
                  <button
                    onClick={() => {
                      if (!isCatActive) {
                        setActiveTab(cat.subTabs[0]);
                      }
                      setOpenDropdown(isOpen ? null : cat.id);
                    }}
                    className={clsx(
                      "flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap",
                      isCatActive
                        ? "bg-[#C2410C] text-white shadow-lg shadow-orange-500/15 border border-[#FDBA74]"
                        : "bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] border border-[#E2E8F0]"
                    )}
                  >
                    <CatIcon className={clsx("w-4 h-4", isCatActive ? "text-white" : "text-[#64748B]")} />
                    <span>{cat.title}</span>
                    <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
                  </button>

                  {/* Dropdown Menu for Category */}
                  {isOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] border-b border-[#E2E8F0]/60 mb-1">
                        {cat.title} Options
                      </div>
                      {cat.subTabs.map(subId => {
                        const item = ALL_TAB_ITEMS.find(t => t.id === subId)!;
                        const isSubActive = activeTab === subId;
                        const SubIcon = item.icon;
                        return (
                          <button
                            key={subId}
                            onClick={() => {
                              setActiveTab(subId);
                              setOpenDropdown(null);
                            }}
                            className={clsx(
                              "w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group",
                              isSubActive
                                ? "bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C]"
                                : "hover:bg-[#FFF7ED] text-[#334155] hover:text-[#C2410C]"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={clsx(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                isSubActive ? "bg-[#C2410C] text-white" : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] group-hover:text-[#C2410C]"
                              )}>
                                <SubIcon className={clsx("w-4 h-4", item.gold && !isSubActive && "text-[#EA580C]")} />
                              </div>
                              <div className="truncate">
                                <div className={clsx("text-xs font-bold", isSubActive ? "text-[#C2410C]" : "text-[#111827]")}>
                                  {item.label}
                                </div>
                                <div className="text-[10px] text-[#64748B] truncate">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                            {isSubActive && <Check className="w-4 h-4 text-[#EA580C] shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Master View Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === 'master' ? null : 'master')}
              className="w-full md:w-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] text-[#111827] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2">
                <currentTabItem.icon className={clsx("w-4 h-4", currentTabItem.gold ? "text-[#EA580C]" : "text-[#EA580C]")} />
                <span className="text-[#64748B] font-medium hidden sm:inline">Current View:</span>
                <span className="font-bold text-[#111827]">{currentTabItem.label}</span>
              </div>
              <ChevronDown className={clsx("w-3.5 h-3.5 text-[#64748B] transition-transform duration-200", openDropdown === 'master' && "rotate-180")} />
            </button>

            {/* Master Grouped Dropdown Menu */}
            {openDropdown === 'master' && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 p-3 space-y-3 max-h-[75vh] overflow-y-auto">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="space-y-1">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#64748B] flex items-center gap-2 border-b border-[#E2E8F0]/50 pb-1">
                      <cat.icon className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>{cat.title}</span>
                    </div>
                    {cat.subTabs.map(subId => {
                      const item = ALL_TAB_ITEMS.find(t => t.id === subId)!;
                      const isSubActive = activeTab === subId;
                      const SubIcon = item.icon;
                      return (
                        <button
                          key={subId}
                          onClick={() => {
                            setActiveTab(subId);
                            setOpenDropdown(null);
                          }}
                          className={clsx(
                            "w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer group",
                            isSubActive
                              ? "bg-[#C2410C] text-white shadow-md shadow-orange-500/15"
                              : "hover:bg-[#FFF7ED] text-[#334155] hover:text-[#C2410C]"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={clsx(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                              isSubActive ? "bg-[#FFFFFF]/20 text-white" : "bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]"
                            )}>
                              <SubIcon className={clsx("w-3.5 h-3.5", item.gold && !isSubActive && "text-[#EA580C]")} />
                            </div>
                            <div className="truncate">
                              <div className={clsx("text-xs font-bold", isSubActive ? "text-white" : "text-[#111827]")}>
                                {item.label}
                              </div>
                            </div>
                          </div>
                          {isSubActive && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sub-Tabs for Active Category (Spacious & Clean, Eliminates Horizontal Clutter) */}
        <div className="pt-2 border-t border-[#E2E8F0]/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] hidden sm:inline mr-1">
            {currentCategory.title}:
          </span>
          {currentCategory.subTabs.map(subId => {
            const item = ALL_TAB_ITEMS.find(t => t.id === subId)!;
            const isSubActive = activeTab === subId;
            const SubIcon = item.icon;
            return (
              <button
                key={subId}
                onClick={() => setActiveTab(subId)}
                className={clsx(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  isSubActive
                    ? "bg-[#FFF7ED] border border-[#FDBA74] text-[#EA580C] shadow-sm font-extrabold"
                    : "bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]"
                )}
              >
                <SubIcon className={clsx("w-3.5 h-3.5", isSubActive ? "text-[#EA580C]" : item.gold ? "text-[#EA580C]" : "text-[#64748B]")} />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 0: MY PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Top 4 Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-xl">
              <div className="flex justify-between items-center text-xs text-[#64748B] font-medium">
                <span>Verified Attendance</span>
                <span className="p-2 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]"><Flame className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#111827]">
                {myPerformance?.attendance?.totalVerifiedVisits || 0} <span className="text-sm font-normal text-[#64748B]">visits</span>
              </div>
              <p className="text-xs text-[#EA580C] font-semibold mt-1">
                🔥 {myPerformance?.attendance?.streakDays || 0} day streak
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-xl">
              <div className="flex justify-between items-center text-xs text-[#64748B] font-medium">
                <span>Workout Completion</span>
                <span className="p-2 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]"><TrendingUp className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#EA580C]">
                {myPerformance?.workouts?.completionPercentage !== null && myPerformance?.workouts?.completionPercentage !== undefined
                  ? `${myPerformance.workouts.completionPercentage}%`
                  : 'Not Recorded'}
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                {myPerformance?.workouts?.completedCount || 0} workouts completed
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-xl">
              <div className="flex justify-between items-center text-xs text-[#64748B] font-medium">
                <span>Diet Adherence</span>
                <span className="p-2 rounded-xl bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/30"><Utensils className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#15803D]">
                {myPerformance?.diet?.adherencePercentage !== null && myPerformance?.diet?.adherencePercentage !== undefined
                  ? `${myPerformance.diet.adherencePercentage}%`
                  : 'No Logs'}
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                {myPerformance?.diet?.totalMealsRecorded || 0} meal check-ins recorded
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-xl">
              <div className="flex justify-between items-center text-xs text-[#64748B] font-medium">
                <span>Reward Points</span>
                <span className="p-2 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]"><Coins className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#EA580C]">
                {wallet.currentBalance} <span className="text-sm font-normal text-[#64748B]">pts</span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                {wallet.badges?.length || 0} unlocked badges
              </p>
            </div>
          </div>

          {/* Body Measurements & Physical Progress */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-xl">
            <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-[#EA580C]" /> Physical Fitness Measurements & Progress
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Real body composition metrics and strength progress logged at the gym.
            </p>

            {myPerformance?.measurements ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#64748B] block font-medium">CURRENT WEIGHT</span>
                  <span className="text-xl font-black text-[#111827] mt-1 block">
                    {myPerformance.measurements.currentWeight} kg
                  </span>
                  {myPerformance.measurements.weightChange !== 0 && (
                    <span className={clsx("text-[11px] font-bold", myPerformance.measurements.weightChange < 0 ? 'text-[#15803D]' : 'text-[#EA580C]')}>
                      {myPerformance.measurements.weightChange > 0 ? `+${myPerformance.measurements.weightChange}` : myPerformance.measurements.weightChange} kg from start
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#64748B] block font-medium">BODY FAT %</span>
                  <span className="text-xl font-black text-[#111827] mt-1 block">
                    {myPerformance.measurements.bodyFatPercentage ? `${myPerformance.measurements.bodyFatPercentage}%` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-[#64748B]">Bio-impedance / caliper</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#64748B] block font-medium">BENCH PRESS MAX</span>
                  <span className="text-xl font-black text-[#111827] mt-1 block">
                    {myPerformance.measurements.benchPressMax ? `${myPerformance.measurements.benchPressMax} kg` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-[#64748B]">Personal record</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[#64748B] block font-medium">SQUAT MAX</span>
                  <span className="text-xl font-black text-[#111827] mt-1 block">
                    {myPerformance.measurements.squatMax ? `${myPerformance.measurements.squatMax} kg` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-[#64748B]">Personal record</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                No physical measurements recorded yet. Ask your trainer to log your weight and fitness stats!
              </div>
            )}
          </div>

          {/* Verified Gym Attendance History */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-base text-[#111827] flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-[#EA580C]" /> Verified Gym Attendance History
                </h3>
                <p className="text-xs text-[#64748B]">
                  Real check-ins and session attendance records verified on the gym floor.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] text-xs">
                  {myPerformance?.attendance?.totalVerifiedVisits || 0} Visits Total
                </span>
                {myPerformance?.attendance?.streakDays > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] text-xs">
                    🔥 {myPerformance.attendance.streakDays}d Streak
                  </span>
                )}
              </div>
            </div>

            {(!myPerformance?.attendance?.attendanceLogs || myPerformance.attendance.attendanceLogs.length === 0) ? (
              <div className="p-6 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                No attendance visits recorded yet. Check-in during your next gym visit to build your streak!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0] text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Check-in / Check-out</th>
                      <th className="py-2.5 px-3">Session Mode</th>
                      <th className="py-2.5 px-3">Trainer / Floor</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-[#334155]">
                    {myPerformance.attendance.attendanceLogs.map((log: any, idx: number) => (
                      <tr key={log._id || idx} className="hover:bg-[#FFF7ED]/60 transition">
                        <td className="py-2.5 px-3 font-semibold text-[#111827]">
                          {log.date ? new Date(log.date).toLocaleDateString() : 'Visit'}
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B]">
                          {log.checkInTime || '--:--'} - {log.checkOutTime || '--:--'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#475569] text-[10px] font-medium border border-[#E2E8F0]">
                            {log.mode || 'Standard Floor'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B]">
                          {log.trainerName || 'General Floor'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/30 text-[10px]">
                            Verified ✓
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
      )}

      {/* TAB 1: ACTIVE CHALLENGES (DISABLED) */}
      {(false as boolean) && (
        <div>
          {loading ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto border-[#FDBA74]" />
              <p className="mt-2 text-xs text-[#64748B]">Checking active challenges...</p>
            </div>
          ) : activeChallenges.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
              <Flame className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-[#111827]">No Active Challenges</h3>
              <p className="text-sm max-w-sm mx-auto mt-1 text-[#64748B]">
                You have not joined any challenges yet. Browse the Available Challenges tab and join one to start tracking your progress!
              </p>
              <button
                onClick={() => setActiveTab('performance')}
                className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-semibold bg-[#C2410C] hover:bg-[#9A3412] transition cursor-pointer"
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
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-5 flex flex-col justify-between hover:border-[#FFEDD5] transition shadow-xl"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                          {challenge.challengeType}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#EA580C]">
                          <Flame className="w-4 h-4 fill-[#F97316] text-[#EA580C]" />
                          <span>{p.streakDays} Day Streak</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="flex items-start gap-3">
                        <span className="p-2.5 rounded-xl shrink-0 bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <div>
                          <h3 className="font-bold text-base leading-tight text-[#111827]">
                            {challenge.title}
                          </h3>
                          <p className="text-xs line-clamp-2 text-[#64748B] mt-1">
                            {challenge.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress Metrics */}
                      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="text-[#64748B] font-medium">Completed Progress:</span>
                          <span className="font-bold text-sm text-[#111827]">
                            {p.currentProgress} / {challenge.targetValue} {challenge.targetUnit}
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-[#F8FAFC] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#EA580C] to-[#5e77f9]"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <span className="text-[#64748B]">{remaining} {challenge.targetUnit} remaining</span>
                          <span className="font-bold text-[#EA580C]">+{p.pointsEarned} pts earned</span>
                        </div>
                      </div>

                      {/* Trainer Feedback if provided */}
                      {p.trainerFeedback && (
                        <div className="p-2.5 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] text-xs text-[#EA580C]">
                          <span className="font-bold block text-[#C2410C]">💬 Trainer Feedback:</span>
                          <span className="italic">{p.trainerFeedback}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#E2E8F0] flex justify-between items-center">
                      <button
                        onClick={() => setSelectedChallenge(challenge)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E2E8F0] text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] transition"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => handleSyncProgress(challenge._id)}
                        disabled={syncing === challenge._id}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] transition flex items-center gap-1.5 shadow-sm"
                      >
                        <RefreshCw className={clsx("w-3.5 h-3.5", syncing === challenge._id ? "animate-spin" : "")} />
                        {syncing === challenge._id ? 'Syncing...' : 'Sync Activity'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AVAILABLE CHALLENGES (DISABLED) */}
      {(false as boolean) && (
        <div className="space-y-4">
          {availableChallenges.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
              <Trophy className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-[#111827]">No New Challenges Available</h3>
              <p className="text-sm max-w-sm mx-auto mt-1 text-[#64748B]">
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
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-5 flex flex-col justify-between hover:border-[#FFEDD5] transition shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                          {challenge.challengeType}
                        </span>

                        <span className="text-xs text-[#64748B] font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Ends {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="p-2.5 rounded-xl shrink-0 bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <div>
                          <h3 className="font-bold text-base leading-tight text-[#111827]">
                            {challenge.title}
                          </h3>
                          <p className="text-xs line-clamp-2 text-[#64748B] mt-1">
                            {challenge.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAFC] text-xs space-y-1.5 border border-[#E2E8F0]">
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Target Goal:</span>
                          <span className="font-bold text-[#111827]">
                            {challenge.targetValue} {challenge.targetUnit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Activity Reward:</span>
                          <span className="font-bold text-[#EA580C]">
                            +{challenge.pointsPerActivity} pts per verified record
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Bonus for Completing:</span>
                          <span className="font-bold text-[#EA580C]">
                            +{challenge.completionBonusPoints} pts + "{challenge.badgeName}"
                          </span>
                        </div>
                      </div>

                      {challenge.isPackageEligible === false && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-800/40 text-xs text-[#EA580C] flex items-center gap-2">
                          <Lock className="w-4 h-4 shrink-0 text-[#EA580C]" />
                          <span>Requires specific gym membership package.</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#E2E8F0] flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedChallenge(challenge)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E2E8F0] text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] transition"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => handleJoinChallenge(challenge._id)}
                        disabled={!canJoin || joiningId === challenge._id}
                        className={clsx(
                          "px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow transition cursor-pointer",
                          canJoin ? 'bg-[#C2410C] hover:bg-[#9A3412]' : 'bg-[#F8FAFC] text-zinc-500 cursor-not-allowed border border-[#E2E8F0]'
                        )}
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

      {/* TAB 3: COMPLETED CHALLENGES (DISABLED) */}
      {(false as boolean) && (
        <div className="space-y-4">
          {completedChallenges.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
              <Award className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-[#111827]">No Completed Challenges Yet</h3>
              <p className="text-sm max-w-sm mx-auto mt-1 text-[#64748B]">
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
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-5 flex flex-col justify-between shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed!
                        </span>

                        <span className="text-xs text-[#64748B] font-medium">
                          {p.completedAt ? new Date(p.completedAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="p-2.5 rounded-xl shrink-0 bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <div>
                          <h3 className="font-bold text-base leading-tight text-[#111827]">
                            {challenge.title}
                          </h3>
                          <p className="text-xs line-clamp-2 text-[#64748B] mt-1">
                            {challenge.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Final Achievement:</span>
                          <span className="font-bold text-[#111827]">
                            {p.currentProgress} / {challenge.targetValue} {challenge.targetUnit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Points Awarded:</span>
                          <span className="font-bold text-[#EA580C]">
                            +{challenge.completionBonusPoints + p.pointsEarned} pts
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">Badge Unlocked:</span>
                          <span className="font-bold text-[#15803D]">
                            🏆 {challenge.badgeName}
                          </span>
                        </div>
                      </div>

                      {p.claimCode && (
                        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-dashed border-[#FFEDD5] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-[#64748B] block">REWARD CLAIM CODE</span>
                            <span className="font-mono font-bold text-[#EA580C]">{p.claimCode}</span>
                          </div>
                          <button
                            onClick={() => copyVoucherCode(p.claimCode!)}
                            className="p-1 rounded hover:bg-[#FFFFFF]/10 text-[#64748B] hover:text-[#C2410C]"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#E2E8F0] flex justify-end">
                      {canClaim ? (
                        <button
                          onClick={() => handleClaimReward(challenge.rewardId, challenge._id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow bg-[#C2410C] hover:bg-[#9A3412] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          Claim Completion Reward
                        </button>
                      ) : (
                        <span className="text-xs text-[#64748B] italic">
                          Reward {p.rewardClaimStatus || 'Completed'}
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

      {/* TAB 4: POINTS & BADGES (REMOVED) */}
      {(false as boolean) && (
        <div className="space-y-6">
          {/* Badges Grid */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-xl">
            <h2 className="text-lg font-bold mb-1 text-[#111827]">
              My Achievement Badges
            </h2>
            <p className="text-xs text-[#64748B] mb-6">
              Badges unlocked by completing fitness and attendance challenges.
            </p>

            {wallet.badges?.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#64748B]">
                No badges earned yet. Complete challenges to unlock achievement badges!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {wallet.badges.map((badge, idx) => {
                  const IconComp = BADGE_ICONS[badge.badgeIcon] || Award;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-[#E2E8F0] text-center flex flex-col items-center justify-center bg-[#F8FAFC] hover:border-[#FFEDD5] transition"
                    >
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                        <IconComp className="w-7 h-7" />
                      </div>
                      <div className="font-bold text-xs text-[#111827]">
                        {badge.badgeName}
                      </div>
                      <span className="text-[10px] text-[#64748B] mt-1 truncate max-w-full">
                        {badge.challengeTitle || 'Challenge'}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Points Transaction Ledger */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-xl">
            <h2 className="text-lg font-bold mb-1 text-[#111827]">
              Points History & Ledger
            </h2>
            <p className="text-xs text-[#64748B] mb-4">
              Detailed audit trail of all earned, redeemed, and bonus points.
            </p>

            {transactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#64748B]">
                No points transactions recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0] text-sm">
                {transactions.map((tx: any) => (
                  <div key={tx._id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-xs text-[#111827]">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {new Date(tx.createdAt).toLocaleString()} • Type: {tx.type}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={clsx("font-bold text-sm", tx.amount > 0 ? 'text-[#EA580C]' : 'text-[#B91C1C]')}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                      </span>
                      <span className="text-[11px] text-[#64748B] block">
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

      {/* TAB 5: LEADERBOARD (DISABLED) */}
      {(false as boolean) && (
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">
                Challenge Leaderboard
              </h2>
              <p className="text-xs text-[#64748B]">
                Privacy-protected rankings. Your name is highlighted as "(You)".
              </p>
            </div>

            {/* Challenge Dropdown */}
            {allChallengesList.length > 0 && (
              <select
                value={leaderboardChallengeId}
                onChange={e => setLeaderboardChallengeId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#111827] text-sm font-semibold max-w-xs focus:outline-none focus:border-[#FDBA74]"
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
            <div className="py-12 text-center text-sm text-[#64748B]">Loading rankings...</div>
          ) : leaderboardData.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#64748B]">
              No participants ranked for this challenge yet. Join now and make the top spot!
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {leaderboardData.map((item) => {
                const isTop1 = item.rank === 1;
                const isTop2 = item.rank === 2;
                const isTop3 = item.rank === 3;
                const isMe = item.isCurrentUser;

                return (
                  <div
                    key={item.participantId}
                    className={clsx(
                      "flex items-center justify-between p-3.5 rounded-xl border transition",
                      isMe
                        ? 'bg-[#FFF7ED] border-[#FDBA74] ring-1 ring-[#F97316]'
                        : isTop1
                        ? 'bg-[#FFF7ED] border-[#FFEDD5]'
                        : isTop2
                        ? 'bg-zinc-800/40 border-zinc-700/50'
                        : isTop3
                        ? 'bg-amber-50 border-amber-900/30'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs",
                          isTop1
                            ? 'bg-[#C2410C] text-white font-extrabold'
                            : isTop2
                            ? 'bg-zinc-400 text-black'
                            : isTop3
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#F8FAFC] text-[#64748B]'
                        )}
                      >
                        {item.rank}
                      </span>

                      <div>
                        <div className={clsx("font-bold text-sm", isMe ? 'text-[#EA580C]' : 'text-[#111827]')}>
                          {item.displayName}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {item.currentProgress} / {item.targetValue}
                          {item.streakDays > 0 && ` • 🔥 ${item.streakDays}d streak`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-[#EA580C]">
                        +{item.pointsEarned} pts
                      </span>
                      {item.completed && (
                        <span className="block text-[11px] font-semibold text-[#15803D]">
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
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-xl flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">
                Rewards Store
              </h2>
              <p className="text-xs text-[#64748B]">
                Redeem your earned fitness points for exclusive coupons, merchandise, and sessions.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#64748B] block">Available Points</span>
              <span className="text-xl font-black text-[#EA580C]">{wallet.currentBalance} pts</span>
            </div>
          </div>

          {rewards.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
              <Gift className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-[#111827]">No Rewards In Store Right Now</h3>
              <p className="text-sm max-w-sm mx-auto mt-1 text-[#64748B]">
                Your gym owner will publish rewards and discounts soon. Keep earning points!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map(reward => {
                const status = reward.memberStatus || (
                  (reward.requiredPoints || 0) > 0 && wallet.currentBalance < reward.requiredPoints
                    ? 'Locked'
                    : 'Available'
                );
                const isAvailable = status === 'Available';
                const isClaimed = status === 'Claimed';
                const isPending = status === 'Pending Approval';
                const isExpired = status === 'Expired';
                const isLocked = status === 'Locked';

                return (
                  <div
                    key={reward._id}
                    className={clsx(
                      "bg-[#FFFFFF] rounded-3xl border border-[#E2E8F0] p-5 flex flex-col justify-between hover:border-[#FFEDD5] transition relative overflow-hidden shadow-xl",
                      isClaimed ? 'opacity-70' : ''
                    )}
                  >
                    {/* Top Tag & Badges */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                            {reward.category}
                          </span>
                          {reward.assignmentMethod === 'Direct' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center gap-1">
                              ⭐ Awarded to You
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isClaimed && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                              ✓ Claimed
                            </span>
                          )}
                          {isPending && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-[#EA580C] border border-amber-500/30">
                              ⏳ Pending Review
                            </span>
                          )}
                          {isAvailable && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/30">
                              Unlocked
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-[#B91C1C] border border-rose-500/30">
                              Locked
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F8FAFC] text-zinc-500 border border-[#E2E8F0]">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-base leading-tight text-[#111827]">
                          {reward.title}
                        </h3>
                        <p className="text-xs line-clamp-2 text-[#64748B] mt-1">
                          {reward.description}
                        </p>
                      </div>

                      {/* Category Specific Perks Pill */}
                      <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                        {reward.category === 'Personal Training' && (
                          <p className="font-semibold text-[#111827] flex items-center gap-1.5">
                            <Dumbbell className="w-3.5 h-3.5 text-[#EA580C]" />
                            {reward.sessionCount || 1} Free PT Session(s) ({reward.sessionDuration || '45 mins'})
                            {reward.trainerId?.firstName && ` with ${reward.trainerId.firstName}`}
                          </p>
                        )}
                        {reward.category === 'Discount Coupon' && (
                          <p className="font-semibold text-[#111827] flex items-center gap-1.5">
                            <Ticket className="w-3.5 h-3.5 text-[#EA580C]" />
                            {reward.discountValue}{reward.discountType === 'Percentage' ? '%' : '₹'} Off on {reward.applicableService || 'All Services'}
                          </p>
                        )}
                        {reward.category === 'Free Product / Gift' && (
                          <p className="font-semibold text-[#111827] flex items-center gap-1.5">
                            <Gift className="w-3.5 h-3.5 text-[#EA580C]" />
                            Free Gift: {reward.productName || 'Store Product'} (Qty: {reward.productQuantity || 1})
                          </p>
                        )}
                        {reward.category === 'Free Membership / Membership Extension' && (
                          <p className="font-semibold text-[#111827] flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-[#EA580C]" />
                            {reward.membershipDuration || '1 Month'} Membership Access ({reward.packageName || 'Full Access'})
                          </p>
                        )}
                        {reward.category === 'Performance Award' && (
                          <p className="font-semibold text-[#111827] flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-[#EA580C]" />
                            {reward.bonusAmount ? `₹${reward.bonusAmount} Payout • ` : ''}{reward.awardReason || 'Outstanding Gym Achievement'}
                          </p>
                        )}
                        {reward.category === 'Points-Based Reward' && (
                          <p className="font-semibold text-[#111827] flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-[#EA580C]" />
                            Cost: {reward.requiredPoints} pts
                          </p>
                        )}

                        {/* Progress or Requirement info if locked */}
                        {isLocked && reward.progressInfo && reward.progressInfo.label && (
                          <p className="text-[11px] text-[#B91C1C] font-medium pt-0.5">
                            Requires {reward.progressInfo.required} {reward.progressInfo.label} (Current: {reward.progressInfo.current})
                          </p>
                        )}
                      </div>

                      {reward.expiryDate && (
                        <p className="text-[11px] text-[#64748B]">
                          Valid until: {new Date(reward.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#E2E8F0] flex justify-between items-center">
                      <span className="text-[11px] text-[#64748B]">
                        {reward.requireApproval ? 'Owner Approval Required' : 'Instant Voucher'}
                      </span>

                      <button
                        onClick={() => handleClaimReward(reward._id)}
                        disabled={!isAvailable}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm",
                          isAvailable
                            ? 'bg-[#C2410C] hover:bg-[#9A3412] text-white cursor-pointer'
                            : isClaimed
                            ? 'bg-emerald-50 text-[#15803D] border border-emerald-200 cursor-default'
                            : 'bg-[#F8FAFC] text-[#64748B] cursor-not-allowed border border-[#E2E8F0]'
                        )}
                      >
                        {isClaimed
                          ? 'Claimed'
                          : isPending
                          ? 'Under Review'
                          : isAvailable
                          ? (reward.assignmentMethod === 'Direct' ? 'Accept Award' : 'Redeem Perk')
                          : isExpired
                          ? 'Expired'
                          : 'Locked'}
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
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-xl">
            <h2 className="text-lg font-bold text-[#111827]">
              My Claimed Vouchers
            </h2>
            <p className="text-xs text-[#64748B]">
              Present your voucher codes at the gym desk to redeem your rewards and benefits.
            </p>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
              <Ticket className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-[#111827]">No Claimed Rewards Yet</h3>
              <p className="text-sm max-w-sm mx-auto mt-1 text-[#64748B]">
                When you claim rewards or vouchers, your codes and approval status will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claims.map(claim => (
                <div
                  key={claim._id}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-5 space-y-3 shadow-xl"
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={clsx(
                        "text-xs px-2.5 py-1 rounded-full font-semibold",
                        claim.claimStatus === 'Approved'
                          ? 'bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/30'
                          : claim.claimStatus === 'Pending'
                          ? 'bg-amber-500/15 text-[#EA580C] border border-amber-500/30'
                          : claim.claimStatus === 'Redeemed'
                          ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]'
                          : 'bg-rose-500/15 text-[#B91C1C] border border-rose-500/30'
                      )}
                    >
                      {claim.claimStatus}
                    </span>

                    <span className="text-xs text-[#64748B]">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#111827]">
                      {claim.rewardId?.title || 'Reward'}
                    </h3>
                    <span className="text-xs text-[#64748B]">
                      {claim.rewardId?.category}
                    </span>
                  </div>

                  {/* Voucher Code Card */}
                  <div className="p-3.5 rounded-xl border border-dashed border-[#FFEDD5] bg-[#F8FAFC] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#64748B] block font-semibold uppercase tracking-wider">VOUCHER CODE</span>
                      <span className="font-mono font-bold text-base text-[#EA580C]">
                        {claim.claimCode}
                      </span>
                    </div>

                    <button
                      onClick={() => copyVoucherCode(claim.claimCode)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-1 text-[#111827] hover:bg-[#F8FAFC] cursor-pointer"
                    >
                      {copiedCode === claim.claimCode ? <Check className="w-3.5 h-3.5 text-[#15803D]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode === claim.claimCode ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {claim.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-rose-800/40 text-xs text-rose-300">
                      Reason: {claim.rejectionReason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 8: AWARDS & CERTIFICATES */}
      {activeTab === 'awards' && (
        <div className="space-y-8">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#F8FAFC] p-6 rounded-3xl border border-[#E2E8F0] shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#EA580C] font-bold text-xs uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4 text-[#EA580C]" />
                  Official Recognition & Honors
                </div>
                <h2 className="text-xl font-black text-[#111827]">
                  My Awards & Gym Hall of Fame
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Conferred fitness honors recognized by gym management. Download your tamper-verifiable certificates anytime.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-5 py-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-lg text-center">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">Awards Conferred</span>
                  <span className="text-xl font-black text-[#EA580C]">{myAwards.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: My Won Awards */}
          <div>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-[#111827]">
              <Trophy className="w-4 h-4 text-[#EA580C]" />
              My Conferred Honors ({myAwards.length})
            </h3>

            {myAwards.length === 0 ? (
              <div className="text-center py-12 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
                <Award className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
                <h4 className="text-base font-bold text-[#111827]">No Conferred Awards Yet</h4>
                <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1">
                  Stay consistent with your workouts, track verified attendance, and participate in challenges. Gym management awards top performers every month and quarter!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myAwards.map((award: any) => (
                  <div
                    key={award._id}
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-5 relative overflow-hidden flex flex-col justify-between shadow-xl"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#EA580C]/15 to-transparent rounded-bl-full pointer-events-none" />

                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#F97316] text-[#EA580C]" />
                          {award.awardPeriod || 'Official Award'}
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          {new Date(award.publishedAt || award.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-[#111827] mb-1">
                        {award.title}
                      </h4>
                      <p className="text-xs font-semibold text-[#EA580C] mb-2">
                        {award.category}
                      </p>
                      <p className="text-xs text-[#64748B] line-clamp-3 mb-4 leading-relaxed">
                        {award.description}
                      </p>

                      {award.winnerScore && (
                        <div className="text-xs p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] mb-3">
                          <span className="text-[#64748B] text-[10px] block font-semibold">VERIFIED PERFORMANCE RECORD</span>
                          <span className="font-bold text-[#EA580C]">{award.winnerScore}</span>
                        </div>
                      )}

                      {award.bonusAmount > 0 && (
                        <div className="text-xs p-2 rounded-xl bg-[#FFF7ED] border border-[#E2E8F0]/30 text-[#EA580C] mb-3 flex items-center justify-between font-semibold">
                          <span>Award Bonus/Prize:</span>
                          <span className="font-black text-sm">₹{award.bonusAmount}</span>
                        </div>
                      )}

                      <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center mb-4">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block tracking-wider">CERTIFICATE ID</span>
                        <span className="font-mono text-xs font-black text-[#EA580C]">
                          {award.certificateId || 'CERT-VERIFIED'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        generateAwardCertificatePDF({
                          recipientName: award.winnerName || 'Gym Member',
                          recipientRole: 'Customer',
                          awardTitle: award.title,
                          awardCategory: award.category,
                          gymName: award.gymId?.name,
                          awardDate: new Date(award.publishedAt || award.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }),
                          certificateId: award.certificateId || 'CERT-VERIFIED',
                          metricAchieved: award.winnerScore ? `${award.winnerScore}` : undefined
                        })
                      }
                      className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#C2410C] text-white font-bold hover:bg-[#9A3412] shadow-md shadow-orange-500/15 transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download Official PDF Certificate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Gym Hall of Fame */}
          <div>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-[#111827]">
              <Sparkles className="w-4 h-4 text-[#EA580C]" />
              Gym Hall of Fame ({hallOfFame.length})
            </h3>

            {hallOfFame.length === 0 ? (
              <div className="text-center py-10 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
                <p className="text-xs text-[#64748B]">Hall of fame honors will be unveiled as management publishes awards.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {hallOfFame.map((item: any) => (
                  <div
                    key={item._id}
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] p-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">
                          {item.recipientType}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {item.awardPeriod}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-[#111827] line-clamp-1">{item.title}</h5>
                      <p className="text-xs text-[#EA580C] font-semibold mb-2">{item.category}</p>

                      <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] mb-2">
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">Conferred To</span>
                        <span className="font-bold text-xs text-[#EA580C]">{item.winnerName}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#64748B] pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
                      <span className="font-mono text-zinc-400">{item.certificateId}</span>
                      <span>{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHALLENGE DETAILS MODAL (DISABLED) */}
      {(false as boolean) && selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#111827]">
                    {selectedChallenge.title}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                    {selectedChallenge.challengeType}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="p-1 rounded-lg hover:bg-[#FFFFFF]/10 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
              {selectedChallenge.description}
            </p>

            <div className="p-4 rounded-xl bg-[#F8FAFC] text-xs space-y-2 border border-[#E2E8F0] mb-5">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Duration:</span>
                <span className="font-medium text-[#111827]">
                  {new Date(selectedChallenge.startDate).toLocaleDateString()} to {new Date(selectedChallenge.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64748B]">Target Goal:</span>
                <span className="font-bold text-[#111827]">
                  {selectedChallenge.targetValue} {selectedChallenge.targetUnit}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64748B]">Points Awarded:</span>
                <span className="font-bold text-[#EA580C]">
                  +{selectedChallenge.pointsPerActivity} pts per verified visit/workout
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64748B]">Completion Bonus:</span>
                <span className="font-bold text-[#EA580C]">
                  +{selectedChallenge.completionBonusPoints} bonus points
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#64748B]">Achievement Badge:</span>
                <span className="font-semibold text-[#15803D]">
                  {selectedChallenge.badgeName}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E2E8F0] text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] transition cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => handleJoinChallenge(selectedChallenge._id)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-orange-500/15 bg-[#C2410C] hover:bg-[#9A3412] transition cursor-pointer"
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
