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
      {/* Header Banner - Dark Charcoal & Sand Gold theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#F3E8E8] border border-[#E7DADD] p-6 sm:p-8 shadow-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(183,110,121,0.12)_0%,_transparent_70%)] pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#B76E79]/15 border border-[#B76E79]/30 flex items-center justify-center text-[#B76E79] shadow-md shadow-[#B76E79]/10 shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 mb-1.5 bg-[#B76E79]/15 border border-[#B76E79]/30 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#B76E79]">
              <Award size={12} className="text-[#B76E79]" />
              Rewards & Performance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#292524]">
              Rewards & Performance
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] mt-0.5 max-w-xl">
              Level up your workouts, maintain attendance streaks, and earn rewards and honors.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
          <div className="flex-1 sm:flex-none p-3.5 px-5 rounded-2xl border border-[#E7DADD] bg-[#FFFFFF]/90 backdrop-blur-sm flex items-center gap-3.5 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#57534E] block">Points Balance</span>
              <span className="text-xl font-black text-white">
                {wallet.currentBalance} <span className="text-xs font-semibold text-[#B76E79]">pts</span>
              </span>
            </div>
          </div>

          <div className="flex-1 sm:flex-none p-3.5 px-5 rounded-2xl border border-[#E7DADD] bg-[#FFFFFF]/90 backdrop-blur-sm flex items-center gap-3.5 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#57534E] block">Honors & Awards</span>
              <span className="text-xl font-black text-[#B76E79]">
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
              ? 'bg-[#F3E8E8]/40 border-[#E7DADD]/60 text-[#B76E79]'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          )}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-[#FFFFFF]/10 rounded-lg text-zinc-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Organized Navigation with Dropdown Options */}
      <div ref={dropdownContainerRef} className="space-y-3 bg-[#FFFFFF]/90 border border-[#E7DADD] p-3 sm:p-4 rounded-2xl shadow-xl backdrop-blur-sm relative z-30">
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
                        ? "bg-[#B76E79] text-white shadow-lg shadow-[#B76E79]/20 border border-[#B76E79]"
                        : "bg-[#FFFFFF] text-[#57534E] hover:text-white hover:bg-[#F3E8E8] border border-[#E7DADD]"
                    )}
                  >
                    <CatIcon className={clsx("w-4 h-4", isCatActive ? "text-white" : "text-[#57534E]")} />
                    <span>{cat.title}</span>
                    <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200", isOpen && "rotate-180")} />
                  </button>

                  {/* Dropdown Menu for Category */}
                  {isOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl shadow-2xl z-50 p-2 space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#57534E] border-b border-[#E7DADD]/60 mb-1">
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
                                ? "bg-[#B76E79]/15 border border-[#B76E79]/40 text-white"
                                : "hover:bg-[#F3E8E8] text-[#57534E] hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={clsx(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                isSubActive ? "bg-[#B76E79] text-white" : "bg-[#F3E8E8] border border-[#E7DADD] text-[#57534E] group-hover:text-white"
                              )}>
                                <SubIcon className={clsx("w-4 h-4", item.gold && !isSubActive && "text-[#B76E79]")} />
                              </div>
                              <div className="truncate">
                                <div className={clsx("text-xs font-bold", isSubActive ? "text-white" : "text-[#E4E4E7]")}>
                                  {item.label}
                                </div>
                                <div className="text-[10px] text-[#57534E] truncate">
                                  {item.description}
                                </div>
                              </div>
                            </div>
                            {isSubActive && <Check className="w-4 h-4 text-[#B76E79] shrink-0 ml-2" />}
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
              className="w-full md:w-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F3E8E8] border border-[#E7DADD] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-2">
                <currentTabItem.icon className={clsx("w-4 h-4", currentTabItem.gold ? "text-[#B76E79]" : "text-[#B76E79]")} />
                <span className="text-[#57534E] font-medium hidden sm:inline">Current View:</span>
                <span className="font-bold text-white">{currentTabItem.label}</span>
              </div>
              <ChevronDown className={clsx("w-3.5 h-3.5 text-[#57534E] transition-transform duration-200", openDropdown === 'master' && "rotate-180")} />
            </button>

            {/* Master Grouped Dropdown Menu */}
            {openDropdown === 'master' && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl shadow-2xl z-50 p-3 space-y-3 max-h-[75vh] overflow-y-auto">
                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="space-y-1">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#57534E] flex items-center gap-2 border-b border-[#E7DADD]/50 pb-1">
                      <cat.icon className="w-3.5 h-3.5 text-[#B76E79]" />
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
                              ? "bg-[#B76E79] text-white shadow-md shadow-[#B76E79]/20"
                              : "hover:bg-[#F3E8E8] text-[#57534E] hover:text-white"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={clsx(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                              isSubActive ? "bg-[#FFFFFF]/20 text-white" : "bg-[#F3E8E8] border border-[#E7DADD] text-[#57534E]"
                            )}>
                              <SubIcon className={clsx("w-3.5 h-3.5", item.gold && !isSubActive && "text-[#B76E79]")} />
                            </div>
                            <div className="truncate">
                              <div className={clsx("text-xs font-bold", isSubActive ? "text-white" : "text-[#E4E4E7]")}>
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
        <div className="pt-2 border-t border-[#E7DADD]/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] hidden sm:inline mr-1">
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
                    ? "bg-[#B76E79]/20 border border-[#B76E79] text-[#B76E79] shadow-sm font-extrabold"
                    : "bg-[#FFFFFF] hover:bg-[#F3E8E8] text-[#57534E] hover:text-white border border-[#E7DADD]"
                )}
              >
                <SubIcon className={clsx("w-3.5 h-3.5", isSubActive ? "text-[#B76E79]" : item.gold ? "text-[#B76E79]" : "text-[#57534E]")} />
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
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-xl">
              <div className="flex justify-between items-center text-xs text-[#57534E] font-medium">
                <span>Verified Attendance</span>
                <span className="p-2 rounded-xl bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30"><Flame className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-white">
                {myPerformance?.attendance?.totalVerifiedVisits || 0} <span className="text-sm font-normal text-[#57534E]">visits</span>
              </div>
              <p className="text-xs text-[#B76E79] font-semibold mt-1">
                🔥 {myPerformance?.attendance?.streakDays || 0} day streak
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-xl">
              <div className="flex justify-between items-center text-xs text-[#57534E] font-medium">
                <span>Workout Completion</span>
                <span className="p-2 rounded-xl bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30"><TrendingUp className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#B76E79]">
                {myPerformance?.workouts?.completionPercentage !== null && myPerformance?.workouts?.completionPercentage !== undefined
                  ? `${myPerformance.workouts.completionPercentage}%`
                  : 'Not Recorded'}
              </div>
              <p className="text-xs text-[#57534E] mt-1">
                {myPerformance?.workouts?.completedCount || 0} workouts completed
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-xl">
              <div className="flex justify-between items-center text-xs text-[#57534E] font-medium">
                <span>Diet Adherence</span>
                <span className="p-2 rounded-xl bg-[#B76E79]/15 text-emerald-400 border border-[#E7DADD]/30"><Utensils className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-emerald-400">
                {myPerformance?.diet?.adherencePercentage !== null && myPerformance?.diet?.adherencePercentage !== undefined
                  ? `${myPerformance.diet.adherencePercentage}%`
                  : 'No Logs'}
              </div>
              <p className="text-xs text-[#57534E] mt-1">
                {myPerformance?.diet?.totalMealsRecorded || 0} meal check-ins recorded
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-xl">
              <div className="flex justify-between items-center text-xs text-[#57534E] font-medium">
                <span>Reward Points</span>
                <span className="p-2 rounded-xl bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30"><Coins className="w-4 h-4" /></span>
              </div>
              <div className="text-3xl font-black mt-2 text-[#B76E79]">
                {wallet.currentBalance} <span className="text-sm font-normal text-[#57534E]">pts</span>
              </div>
              <p className="text-xs text-[#57534E] mt-1">
                {wallet.badges?.length || 0} unlocked badges
              </p>
            </div>
          </div>

          {/* Body Measurements & Physical Progress */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E7DADD] shadow-xl">
            <h3 className="text-base font-bold text-[#292524] flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-[#B76E79]" /> Physical Fitness Measurements & Progress
            </h3>
            <p className="text-xs text-[#57534E] mb-4">
              Real body composition metrics and strength progress logged at the gym.
            </p>

            {myPerformance?.measurements ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F3E8E8] border border-[#E7DADD]">
                  <span className="text-[#57534E] block font-medium">CURRENT WEIGHT</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {myPerformance.measurements.currentWeight} kg
                  </span>
                  {myPerformance.measurements.weightChange !== 0 && (
                    <span className={clsx("text-[11px] font-bold", myPerformance.measurements.weightChange < 0 ? 'text-emerald-400' : 'text-[#B76E79]')}>
                      {myPerformance.measurements.weightChange > 0 ? `+${myPerformance.measurements.weightChange}` : myPerformance.measurements.weightChange} kg from start
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#F3E8E8] border border-[#E7DADD]">
                  <span className="text-[#57534E] block font-medium">BODY FAT %</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {myPerformance.measurements.bodyFatPercentage ? `${myPerformance.measurements.bodyFatPercentage}%` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-[#57534E]">Bio-impedance / caliper</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F3E8E8] border border-[#E7DADD]">
                  <span className="text-[#57534E] block font-medium">BENCH PRESS MAX</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {myPerformance.measurements.benchPressMax ? `${myPerformance.measurements.benchPressMax} kg` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-[#57534E]">Personal record</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F3E8E8] border border-[#E7DADD]">
                  <span className="text-[#57534E] block font-medium">SQUAT MAX</span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {myPerformance.measurements.squatMax ? `${myPerformance.measurements.squatMax} kg` : 'Not recorded'}
                  </span>
                  <span className="text-[11px] text-[#57534E]">Personal record</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#57534E] bg-[#F3E8E8] rounded-xl border border-[#E7DADD]">
                No physical measurements recorded yet. Ask your trainer to log your weight and fitness stats!
              </div>
            )}
          </div>

          {/* Verified Gym Attendance History */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E7DADD] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-base text-[#292524] flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-[#B76E79]" /> Verified Gym Attendance History
                </h3>
                <p className="text-xs text-[#57534E]">
                  Real check-ins and session attendance records verified on the gym floor.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 text-xs">
                  {myPerformance?.attendance?.totalVerifiedVisits || 0} Visits Total
                </span>
                {myPerformance?.attendance?.streakDays > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 text-xs">
                    🔥 {myPerformance.attendance.streakDays}d Streak
                  </span>
                )}
              </div>
            </div>

            {(!myPerformance?.attendance?.attendanceLogs || myPerformance.attendance.attendanceLogs.length === 0) ? (
              <div className="p-6 text-center text-xs text-[#57534E] bg-[#F3E8E8] rounded-xl border border-[#E7DADD]">
                No attendance visits recorded yet. Check-in during your next gym visit to build your streak!
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#E7DADD]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#F3E8E8] text-[#57534E] border-b border-[#E7DADD] text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Check-in / Check-out</th>
                      <th className="py-2.5 px-3">Session Mode</th>
                      <th className="py-2.5 px-3">Trainer / Floor</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7DADD] text-zinc-300">
                    {myPerformance.attendance.attendanceLogs.map((log: any, idx: number) => (
                      <tr key={log._id || idx} className="hover:bg-[#F3E8E8]/60 transition">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          {log.date ? new Date(log.date).toLocaleDateString() : 'Visit'}
                        </td>
                        <td className="py-2.5 px-3 text-[#57534E]">
                          {log.checkInTime || '--:--'} - {log.checkOutTime || '--:--'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-[#F3E8E8] text-zinc-300 text-[10px] font-medium border border-[#E7DADD]">
                            {log.mode || 'Standard Floor'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#57534E]">
                          {log.trainerName || 'General Floor'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-[#B76E79]/15 text-emerald-400 border border-[#E7DADD]/30 text-[10px]">
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
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto border-[#B76E79]" />
              <p className="mt-2 text-xs text-[#57534E]">Checking active challenges...</p>
            </div>
          ) : activeChallenges.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]">
              <Flame className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-[#292524]">No Active Challenges</h3>
              <p className="text-sm max-w-sm mx-auto mt-1 text-[#57534E]">
                You have not joined any challenges yet. Browse the Available Challenges tab and join one to start tracking your progress!
              </p>
              <button
                onClick={() => setActiveTab('performance')}
                className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-semibold bg-[#B76E79] hover:bg-[#9F5965] transition cursor-pointer"
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
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] p-5 flex flex-col justify-between hover:border-[#B76E79]/40 transition shadow-xl"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30">
                          {challenge.challengeType}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B76E79]">
                          <Flame className="w-4 h-4 fill-[#B76E79] text-[#B76E79]" />
                          <span>{p.streakDays} Day Streak</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="flex items-start gap-3">
                        <span className="p-2.5 rounded-xl shrink-0 bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30">
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <div>
                          <h3 className="font-bold text-base leading-tight text-[#292524]">
                            {challenge.title}
                          </h3>
                          <p className="text-xs line-clamp-2 text-[#57534E] mt-1">
                            {challenge.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress Metrics */}
                      <div className="p-3.5 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] space-y-2">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="text-[#57534E] font-medium">Completed Progress:</span>
                          <span className="font-bold text-sm text-white">
                            {p.currentProgress} / {challenge.targetValue} {challenge.targetUnit}
                          </span>
                        </div>

                        <div className="w-full h-2.5 bg-[#F3E8E8] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-[#B76E79] to-[#5e77f9]"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <span className="text-[#57534E]">{remaining} {challenge.targetUnit} remaining</span>
                          <span className="font-bold text-[#B76E79]">+{p.pointsEarned} pts earned</span>
                        </div>
                      </div>

                      {/* Trainer Feedback if provided */}
                      {p.trainerFeedback && (
                        <div className="p-2.5 rounded-xl bg-[#B76E79]/10 border border-[#B76E79]/30 text-xs text-[#B76E79]">
                          <span className="font-bold block text-white">💬 Trainer Feedback:</span>
                          <span className="italic">{p.trainerFeedback}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#E7DADD] flex justify-between items-center">
                      <button
                        onClick={() => setSelectedChallenge(challenge)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E7DADD] text-[#57534E] hover:text-white hover:bg-[#F3E8E8] transition"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => handleSyncProgress(challenge._id)}
                        disabled={syncing === challenge._id}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#B76E79] hover:bg-[#9F5965] transition flex items-center gap-1.5 shadow-sm"
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
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]">
              <Trophy className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-[#292524]">No New Challenges Available</h3>
              <p className="text-sm max-w-sm mx-auto mt-1 text-[#57534E]">
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
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] p-5 flex flex-col justify-between hover:border-[#B76E79]/40 transition shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30">
                          {challenge.challengeType}
                        </span>

                        <span className="text-xs text-[#57534E] font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Ends {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="p-2.5 rounded-xl shrink-0 bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30">
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <div>
                          <h3 className="font-bold text-base leading-tight text-[#292524]">
                            {challenge.title}
                          </h3>
                          <p className="text-xs line-clamp-2 text-[#57534E] mt-1">
                            {challenge.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F3E8E8] text-xs space-y-1.5 border border-[#E7DADD]">
                        <div className="flex justify-between">
                          <span className="text-[#57534E]">Target Goal:</span>
                          <span className="font-bold text-white">
                            {challenge.targetValue} {challenge.targetUnit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#57534E]">Activity Reward:</span>
                          <span className="font-bold text-[#B76E79]">
                            +{challenge.pointsPerActivity} pts per verified record
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#57534E]">Bonus for Completing:</span>
                          <span className="font-bold text-[#B76E79]">
                            +{challenge.completionBonusPoints} pts + "{challenge.badgeName}"
                          </span>
                        </div>
                      </div>

                      {challenge.isPackageEligible === false && (
                        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-[#B76E79] flex items-center gap-2">
                          <Lock className="w-4 h-4 shrink-0 text-[#B76E79]" />
                          <span>Requires specific gym membership package.</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#E7DADD] flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedChallenge(challenge)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E7DADD] text-[#57534E] hover:text-white hover:bg-[#F3E8E8] transition"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => handleJoinChallenge(challenge._id)}
                        disabled={!canJoin || joiningId === challenge._id}
                        className={clsx(
                          "px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow transition cursor-pointer",
                          canJoin ? 'bg-[#B76E79] hover:bg-[#9F5965]' : 'bg-[#F3E8E8] text-zinc-500 cursor-not-allowed border border-[#E7DADD]'
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
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]">
              <Award className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-[#292524]">No Completed Challenges Yet</h3>
              <p className="text-sm max-w-sm mx-auto mt-1 text-[#57534E]">
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
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] p-5 flex flex-col justify-between shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#B76E79]/15 text-emerald-400 border border-[#E7DADD]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed!
                        </span>

                        <span className="text-xs text-[#57534E] font-medium">
                          {p.completedAt ? new Date(p.completedAt).toLocaleDateString() : ''}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="p-2.5 rounded-xl shrink-0 bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30">
                          <IconComponent className="w-6 h-6" />
                        </span>
                        <div>
                          <h3 className="font-bold text-base leading-tight text-[#292524]">
                            {challenge.title}
                          </h3>
                          <p className="text-xs line-clamp-2 text-[#57534E] mt-1">
                            {challenge.description}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#57534E]">Final Achievement:</span>
                          <span className="font-bold text-white">
                            {p.currentProgress} / {challenge.targetValue} {challenge.targetUnit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#57534E]">Points Awarded:</span>
                          <span className="font-bold text-[#B76E79]">
                            +{challenge.completionBonusPoints + p.pointsEarned} pts
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#57534E]">Badge Unlocked:</span>
                          <span className="font-bold text-emerald-400">
                            🏆 {challenge.badgeName}
                          </span>
                        </div>
                      </div>

                      {p.claimCode && (
                        <div className="p-2.5 rounded-xl bg-[#F3E8E8] border border-dashed border-[#B76E79]/50 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-[#57534E] block">REWARD CLAIM CODE</span>
                            <span className="font-mono font-bold text-white">{p.claimCode}</span>
                          </div>
                          <button
                            onClick={() => copyVoucherCode(p.claimCode!)}
                            className="p-1 rounded hover:bg-[#FFFFFF]/10 text-[#57534E] hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-[#E7DADD] flex justify-end">
                      {canClaim ? (
                        <button
                          onClick={() => handleClaimReward(challenge.rewardId, challenge._id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow bg-[#B76E79] hover:bg-[#9F5965] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          Claim Completion Reward
                        </button>
                      ) : (
                        <span className="text-xs text-[#57534E] italic">
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
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E7DADD] shadow-xl">
            <h2 className="text-lg font-bold mb-1 text-[#292524]">
              My Achievement Badges
            </h2>
            <p className="text-xs text-[#57534E] mb-6">
              Badges unlocked by completing fitness and attendance challenges.
            </p>

            {wallet.badges?.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#57534E]">
                No badges earned yet. Complete challenges to unlock achievement badges!
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {wallet.badges.map((badge, idx) => {
                  const IconComp = BADGE_ICONS[badge.badgeIcon] || Award;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-[#E7DADD] text-center flex flex-col items-center justify-center bg-[#F3E8E8] hover:border-[#B76E79]/50 transition"
                    >
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-2 bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30">
                        <IconComp className="w-7 h-7" />
                      </div>
                      <div className="font-bold text-xs text-white">
                        {badge.badgeName}
                      </div>
                      <span className="text-[10px] text-[#57534E] mt-1 truncate max-w-full">
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
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E7DADD] shadow-xl">
            <h2 className="text-lg font-bold mb-1 text-[#292524]">
              Points History & Ledger
            </h2>
            <p className="text-xs text-[#57534E] mb-4">
              Detailed audit trail of all earned, redeemed, and bonus points.
            </p>

            {transactions.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#57534E]">
                No points transactions recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-[#E7DADD] text-sm">
                {transactions.map((tx: any) => (
                  <div key={tx._id} className="py-3 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-xs text-white">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-[#57534E]">
                        {new Date(tx.createdAt).toLocaleString()} • Type: {tx.type}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={clsx("font-bold text-sm", tx.amount > 0 ? 'text-[#B76E79]' : 'text-rose-400')}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} pts
                      </span>
                      <span className="text-[11px] text-[#57534E] block">
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
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E7DADD] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#292524]">
                Challenge Leaderboard
              </h2>
              <p className="text-xs text-[#57534E]">
                Privacy-protected rankings. Your name is highlighted as "(You)".
              </p>
            </div>

            {/* Challenge Dropdown */}
            {allChallengesList.length > 0 && (
              <select
                value={leaderboardChallengeId}
                onChange={e => setLeaderboardChallengeId(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-[#E7DADD] bg-[#F3E8E8] text-white text-sm font-semibold max-w-xs focus:outline-none focus:border-[#B76E79]"
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
            <div className="py-12 text-center text-sm text-[#57534E]">Loading rankings...</div>
          ) : leaderboardData.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#57534E]">
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
                        ? 'bg-[#B76E79]/15 border-[#B76E79] ring-1 ring-[#B76E79]'
                        : isTop1
                        ? 'bg-[#B76E79]/10 border-[#B76E79]/30'
                        : isTop2
                        ? 'bg-zinc-800/40 border-zinc-700/50'
                        : isTop3
                        ? 'bg-amber-950/20 border-amber-900/30'
                        : 'bg-[#F3E8E8] border-[#E7DADD]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs",
                          isTop1
                            ? 'bg-[#B76E79] text-white font-extrabold'
                            : isTop2
                            ? 'bg-zinc-400 text-black'
                            : isTop3
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#F3E8E8] text-[#57534E]'
                        )}
                      >
                        {item.rank}
                      </span>

                      <div>
                        <div className={clsx("font-bold text-sm", isMe ? 'text-[#B76E79]' : 'text-white')}>
                          {item.displayName}
                        </div>
                        <div className="text-xs text-[#57534E]">
                          {item.currentProgress} / {item.targetValue}
                          {item.streakDays > 0 && ` • 🔥 ${item.streakDays}d streak`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-sm text-[#B76E79]">
                        +{item.pointsEarned} pts
                      </span>
                      {item.completed && (
                        <span className="block text-[11px] font-semibold text-emerald-400">
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
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-xl flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#292524]">
                Rewards Store
              </h2>
              <p className="text-xs text-[#57534E]">
                Redeem your earned fitness points for exclusive coupons, merchandise, and sessions.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#57534E] block">Available Points</span>
              <span className="text-xl font-black text-[#B76E79]">{wallet.currentBalance} pts</span>
            </div>
          </div>

          {rewards.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]">
              <Gift className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-[#292524]">No Rewards In Store Right Now</h3>
              <p className="text-sm max-w-sm mx-auto mt-1 text-[#57534E]">
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
                      "bg-[#FFFFFF] rounded-3xl border border-[#E7DADD] p-5 flex flex-col justify-between hover:border-[#B76E79]/40 transition relative overflow-hidden shadow-xl",
                      isClaimed ? 'opacity-70' : ''
                    )}
                  >
                    {/* Top Tag & Badges */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30">
                            {reward.category}
                          </span>
                          {reward.assignmentMethod === 'Direct' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 flex items-center gap-1">
                              ⭐ Awarded to You
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isClaimed && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3E8E8] text-[#57534E] border border-[#E7DADD]">
                              ✓ Claimed
                            </span>
                          )}
                          {isPending && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-[#B76E79] border border-amber-500/30">
                              ⏳ Pending Review
                            </span>
                          )}
                          {isAvailable && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B76E79]/15 text-emerald-400 border border-[#E7DADD]/30">
                              Unlocked
                            </span>
                          )}
                          {isLocked && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              Locked
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F3E8E8] text-zinc-500 border border-[#E7DADD]">
                              Expired
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-base leading-tight text-[#292524]">
                          {reward.title}
                        </h3>
                        <p className="text-xs line-clamp-2 text-[#57534E] mt-1">
                          {reward.description}
                        </p>
                      </div>

                      {/* Category Specific Perks Pill */}
                      <div className="p-2.5 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] text-xs space-y-1">
                        {reward.category === 'Personal Training' && (
                          <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Dumbbell className="w-3.5 h-3.5 text-[#B76E79]" />
                            {reward.sessionCount || 1} Free PT Session(s) ({reward.sessionDuration || '45 mins'})
                            {reward.trainerId?.firstName && ` with ${reward.trainerId.firstName}`}
                          </p>
                        )}
                        {reward.category === 'Discount Coupon' && (
                          <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Ticket className="w-3.5 h-3.5 text-[#B76E79]" />
                            {reward.discountValue}{reward.discountType === 'Percentage' ? '%' : '₹'} Off on {reward.applicableService || 'All Services'}
                          </p>
                        )}
                        {reward.category === 'Free Product / Gift' && (
                          <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Gift className="w-3.5 h-3.5 text-[#B76E79]" />
                            Free Gift: {reward.productName || 'Store Product'} (Qty: {reward.productQuantity || 1})
                          </p>
                        )}
                        {reward.category === 'Free Membership / Membership Extension' && (
                          <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-[#B76E79]" />
                            {reward.membershipDuration || '1 Month'} Membership Access ({reward.packageName || 'Full Access'})
                          </p>
                        )}
                        {reward.category === 'Performance Award' && (
                          <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-[#B76E79]" />
                            {reward.bonusAmount ? `₹${reward.bonusAmount} Payout • ` : ''}{reward.awardReason || 'Outstanding Gym Achievement'}
                          </p>
                        )}
                        {reward.category === 'Points-Based Reward' && (
                          <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-[#B76E79]" />
                            Cost: {reward.requiredPoints} pts
                          </p>
                        )}

                        {/* Progress or Requirement info if locked */}
                        {isLocked && reward.progressInfo && reward.progressInfo.label && (
                          <p className="text-[11px] text-rose-400 font-medium pt-0.5">
                            Requires {reward.progressInfo.required} {reward.progressInfo.label} (Current: {reward.progressInfo.current})
                          </p>
                        )}
                      </div>

                      {reward.expiryDate && (
                        <p className="text-[11px] text-[#57534E]">
                          Valid until: {new Date(reward.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#E7DADD] flex justify-between items-center">
                      <span className="text-[11px] text-[#57534E]">
                        {reward.requireApproval ? 'Owner Approval Required' : 'Instant Voucher'}
                      </span>

                      <button
                        onClick={() => handleClaimReward(reward._id)}
                        disabled={!isAvailable}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm",
                          isAvailable
                            ? 'bg-[#B76E79] hover:bg-[#9F5965] text-white cursor-pointer'
                            : 'bg-[#F3E8E8] text-zinc-500 cursor-not-allowed border border-[#E7DADD]'
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
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-xl">
            <h2 className="text-lg font-bold text-[#292524]">
              My Claimed Vouchers
            </h2>
            <p className="text-xs text-[#57534E]">
              Present your voucher codes at the gym desk to redeem your rewards and benefits.
            </p>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]">
              <Ticket className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-[#292524]">No Claimed Rewards Yet</h3>
              <p className="text-sm max-w-sm mx-auto mt-1 text-[#57534E]">
                When you claim rewards or vouchers, your codes and approval status will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {claims.map(claim => (
                <div
                  key={claim._id}
                  className="bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] p-5 space-y-3 shadow-xl"
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={clsx(
                        "text-xs px-2.5 py-1 rounded-full font-semibold",
                        claim.claimStatus === 'Approved'
                          ? 'bg-[#B76E79]/15 text-emerald-400 border border-[#E7DADD]/30'
                          : claim.claimStatus === 'Pending'
                          ? 'bg-amber-500/15 text-[#B76E79] border border-amber-500/30'
                          : claim.claimStatus === 'Redeemed'
                          ? 'bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      )}
                    >
                      {claim.claimStatus}
                    </span>

                    <span className="text-xs text-[#57534E]">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#292524]">
                      {claim.rewardId?.title || 'Reward'}
                    </h3>
                    <span className="text-xs text-[#57534E]">
                      {claim.rewardId?.category}
                    </span>
                  </div>

                  {/* Voucher Code Card */}
                  <div className="p-3.5 rounded-xl border border-dashed border-[#B76E79]/50 bg-[#F3E8E8] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#57534E] block font-semibold uppercase tracking-wider">VOUCHER CODE</span>
                      <span className="font-mono font-bold text-base text-[#B76E79]">
                        {claim.claimCode}
                      </span>
                    </div>

                    <button
                      onClick={() => copyVoucherCode(claim.claimCode)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-[#E7DADD] bg-[#F3E8E8] flex items-center gap-1 text-white hover:bg-[#E7DADD] cursor-pointer"
                    >
                      {copiedCode === claim.claimCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode === claim.claimCode ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {claim.rejectionReason && (
                    <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300">
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
          <div className="relative overflow-hidden bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#F3E8E8] p-6 rounded-3xl border border-[#E7DADD] shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#B76E79] font-bold text-xs uppercase tracking-wider mb-1">
                  <Award className="w-4 h-4 text-[#B76E79]" />
                  Official Recognition & Honors
                </div>
                <h2 className="text-xl font-black text-[#292524]">
                  My Awards & Gym Hall of Fame
                </h2>
                <p className="text-xs text-[#57534E] mt-1">
                  Conferred fitness honors recognized by gym management. Download your tamper-verifiable certificates anytime.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-5 py-2.5 rounded-2xl bg-[#F3E8E8] border border-[#E7DADD] shadow-lg text-center">
                  <span className="text-[10px] uppercase font-bold text-[#57534E] block">Awards Conferred</span>
                  <span className="text-xl font-black text-[#B76E79]">{myAwards.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: My Won Awards */}
          <div>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-[#292524]">
              <Trophy className="w-4 h-4 text-[#B76E79]" />
              My Conferred Honors ({myAwards.length})
            </h3>

            {myAwards.length === 0 ? (
              <div className="text-center py-12 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]">
                <Award className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
                <h4 className="text-base font-bold text-[#292524]">No Conferred Awards Yet</h4>
                <p className="text-xs text-[#57534E] max-w-md mx-auto mt-1">
                  Stay consistent with your workouts, track verified attendance, and participate in challenges. Gym management awards top performers every month and quarter!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myAwards.map((award: any) => (
                  <div
                    key={award._id}
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] p-5 relative overflow-hidden flex flex-col justify-between shadow-xl"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#B76E79]/15 to-transparent rounded-bl-full pointer-events-none" />

                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-[#B76E79] text-[#B76E79]" />
                          {award.awardPeriod || 'Official Award'}
                        </span>
                        <span className="text-[11px] text-[#57534E]">
                          {new Date(award.publishedAt || award.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-[#292524] mb-1">
                        {award.title}
                      </h4>
                      <p className="text-xs font-semibold text-[#B76E79] mb-2">
                        {award.category}
                      </p>
                      <p className="text-xs text-[#57534E] line-clamp-3 mb-4 leading-relaxed">
                        {award.description}
                      </p>

                      {award.winnerScore && (
                        <div className="text-xs p-2 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] text-zinc-300 mb-3">
                          <span className="text-[#57534E] text-[10px] block font-semibold">VERIFIED PERFORMANCE RECORD</span>
                          <span className="font-bold text-[#B76E79]">{award.winnerScore}</span>
                        </div>
                      )}

                      {award.bonusAmount > 0 && (
                        <div className="text-xs p-2 rounded-xl bg-[#B76E79]/15 border border-[#E7DADD]/30 text-[#B76E79] mb-3 flex items-center justify-between font-semibold">
                          <span>Award Bonus/Prize:</span>
                          <span className="font-black text-sm">₹{award.bonusAmount}</span>
                        </div>
                      )}

                      <div className="p-2.5 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] text-center mb-4">
                        <span className="text-[10px] uppercase font-bold text-[#57534E] block tracking-wider">CERTIFICATE ID</span>
                        <span className="font-mono text-xs font-black text-[#B76E79]">
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
                      className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#B76E79] text-white font-bold hover:bg-[#9F5965] shadow-md shadow-[#B76E79]/20 transition cursor-pointer"
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
            <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-[#292524]">
              <Sparkles className="w-4 h-4 text-[#B76E79]" />
              Gym Hall of Fame ({hallOfFame.length})
            </h3>

            {hallOfFame.length === 0 ? (
              <div className="text-center py-10 bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]">
                <p className="text-xs text-[#57534E]">Hall of fame honors will be unveiled as management publishes awards.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {hallOfFame.map((item: any) => (
                  <div
                    key={item._id}
                    className="bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] p-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#F3E8E8] text-[#57534E] border border-[#E7DADD]">
                          {item.recipientType}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {item.awardPeriod}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-[#292524] line-clamp-1">{item.title}</h5>
                      <p className="text-xs text-[#B76E79] font-semibold mb-2">{item.category}</p>

                      <div className="p-2.5 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] mb-2">
                        <span className="text-[10px] uppercase font-bold text-[#57534E] block">Conferred To</span>
                        <span className="font-bold text-xs text-[#B76E79]">{item.winnerName}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-[#57534E] pt-2 border-t border-[#E7DADD] flex justify-between items-center">
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
          <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-[#E7DADD]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#292524]">
                    {selectedChallenge.title}
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30">
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

            <p className="text-xs text-[#57534E] mb-4 leading-relaxed">
              {selectedChallenge.description}
            </p>

            <div className="p-4 rounded-xl bg-[#F3E8E8] text-xs space-y-2 border border-[#E7DADD] mb-5">
              <div className="flex justify-between">
                <span className="text-[#57534E]">Duration:</span>
                <span className="font-medium text-white">
                  {new Date(selectedChallenge.startDate).toLocaleDateString()} to {new Date(selectedChallenge.endDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#57534E]">Target Goal:</span>
                <span className="font-bold text-white">
                  {selectedChallenge.targetValue} {selectedChallenge.targetUnit}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#57534E]">Points Awarded:</span>
                <span className="font-bold text-[#B76E79]">
                  +{selectedChallenge.pointsPerActivity} pts per verified visit/workout
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#57534E]">Completion Bonus:</span>
                <span className="font-bold text-[#B76E79]">
                  +{selectedChallenge.completionBonusPoints} bonus points
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#57534E]">Achievement Badge:</span>
                <span className="font-semibold text-emerald-400">
                  {selectedChallenge.badgeName}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#E7DADD] text-[#57534E] hover:text-white hover:bg-[#F3E8E8] transition cursor-pointer"
              >
                Close
              </button>

              <button
                onClick={() => handleJoinChallenge(selectedChallenge._id)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-[#B76E79]/20 bg-[#B76E79] hover:bg-[#9F5965] transition cursor-pointer"
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
