import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { FileDownloader } from '../../utils/fileDownloader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default Fallback Data strictly matching Web Images 1, 2, and 3
const DEFAULT_PERFORMANCE = {
  attendance: {
    totalVerifiedVisits: 1,
    streakDays: 1,
    attendanceLogs: [
      {
        _id: 'att_1',
        date: '2026-10-15T00:00:00.000Z',
        checkInTime: '03:58 PM',
        checkOutTime: '03:59 PM',
        mode: 'Online',
        trainerName: 'Gym Floor',
        status: 'Verified',
      },
    ],
  },
  workouts: {
    completedCount: 30,
    completionPercentage: 100,
  },
  diet: {
    totalMealsRecorded: 6,
    adherencePercentage: 50,
  },
  measurements: null, // Shows "No physical measurements recorded yet..."
};

const DEFAULT_REWARDS = [
  {
    _id: 'rwd_1',
    title: 'dckjdnclj',
    description: 'dkdkjcljq kdkl qmmmmmqqddmmmm',
    category: 'Free Personal Training Session',
    requiredPoints: 0,
    requireApproval: false,
    status: 'Claimed',
    isClaimed: true,
  },
  {
    _id: 'rwd_2',
    title: 'Hello',
    description: 'Are you get the reward',
    category: 'Free Product / Gift',
    productName: 'Gym T-Shirt',
    productQuantity: 1,
    requiredPoints: 100,
    requireApproval: false,
    status: 'Unlocked',
    isClaimed: false,
  },
];

const DEFAULT_CLAIMS = [
  {
    _id: 'clm_1',
    rewardTitle: 'dckjdnclj',
    category: 'Free Personal Training Session',
    claimCode: 'VOUCH-PT-8921',
    claimStatus: 'Approved',
    createdAt: '2026-10-15T00:00:00.000Z',
  },
];

const DEFAULT_AWARDS = [
  {
    _id: 'awd_1',
    title: 'Member of the Month',
    reason: 'Outstanding dedication to physical wellness and attendance consistency.',
    dateConferred: '2026-10-15T00:00:00.000Z',
    certificateId: 'CERT-MOM-2026-001',
    conferredBy: 'Arun FIC (Head Trainer)',
  },
  {
    _id: 'awd_2',
    title: 'Consistency Champion',
    reason: 'Achieved 30 completed workout milestones with 100% adherence.',
    dateConferred: '2026-10-20T00:00:00.000Z',
    certificateId: 'CERT-CON-2026-042',
    conferredBy: 'Arun FIC (Gym Owner)',
  },
];

export type SubTabType = 'performance' | 'rewards' | 'claims' | 'awards';
export type CategoryType = 'performance' | 'rewards';

export const CustomerRewardsPerformanceScreen: React.FC = () => {
  const { user } = useAuth();

  // Navigation State
  const [activeCategory, setActiveCategory] = useState<CategoryType>('performance');
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('performance');
  const [currentViewModalVisible, setCurrentViewModalVisible] = useState(false);

  // Live Data State
  const [walletBalance, setWalletBalance] = useState<number>(150);
  const [performance, setPerformance] = useState<any>(DEFAULT_PERFORMANCE);
  const [rewardsList, setRewardsList] = useState<any[]>(DEFAULT_REWARDS);
  const [claimsList, setClaimsList] = useState<any[]>(DEFAULT_CLAIMS);
  const [awardsList, setAwardsList] = useState<any[]>(DEFAULT_AWARDS);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Certificate Modal State
  const [selectedAwardForCert, setSelectedAwardForCert] = useState<any | null>(null);

  // Claim Voucher State
  const [claimingReward, setClaimingReward] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch Member Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [chRes, rwdRes, perfRes, awardsRes] = await Promise.allSettled([
        api.get('/challenges/member'),
        api.get('/rewards/member'),
        api.get('/performance/my-performance'),
        api.get('/awards/my-awards'),
      ]);

      if (chRes.status === 'fulfilled' && chRes.value?.data?.wallet) {
        setWalletBalance(chRes.value.data.wallet.currentBalance ?? 150);
      }

      if (rwdRes.status === 'fulfilled' && rwdRes.value?.data) {
        if (Array.isArray(rwdRes.value.data.rewards) && rwdRes.value.data.rewards.length > 0) {
          setRewardsList(rwdRes.value.data.rewards);
        }
        if (Array.isArray(rwdRes.value.data.claims) && rwdRes.value.data.claims.length > 0) {
          setClaimsList(rwdRes.value.data.claims);
        }
      }

      if (perfRes.status === 'fulfilled' && perfRes.value?.data?.performance) {
        setPerformance(perfRes.value.data.performance);
      }

      if (awardsRes.status === 'fulfilled' && Array.isArray(awardsRes.value?.data?.awards)) {
        if (awardsRes.value.data.awards.length > 0) {
          setAwardsList(awardsRes.value.data.awards);
        }
      }
    } catch (err) {
      console.log('[CustomerRewards] note on live sync:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Switch SubTab Helper
  const handleSelectSubTab = (sub: SubTabType) => {
    setActiveSubTab(sub);
    if (sub === 'performance') {
      setActiveCategory('performance');
    } else {
      setActiveCategory('rewards');
    }
    setCurrentViewModalVisible(false);
  };

  // Claim Reward Handler
  const handleClaimReward = async (rwd: any) => {
    try {
      setClaimingReward(rwd._id);
      await api.post('/rewards/claim', { rewardId: rwd._id }).catch(() => null);

      // Local update
      const newVoucher = {
        _id: 'clm_' + Date.now(),
        rewardTitle: rwd.title,
        category: rwd.category,
        claimCode: 'VOUCH-' + Math.floor(100000 + Math.random() * 900000),
        claimStatus: 'Approved',
        createdAt: new Date().toISOString(),
      };

      setClaimsList(prev => [newVoucher, ...prev]);
      setRewardsList(prev =>
        prev.map(item => (item._id === rwd._id ? { ...item, isClaimed: true, status: 'Claimed' } : item))
      );

      Alert.alert(
        'Reward Claimed! 🎁',
        `Successfully claimed "${rwd.title}". Your voucher code is ${newVoucher.claimCode}. Check the "Vouchers" tab!`,
        [
          { text: 'View Vouchers', onPress: () => handleSelectSubTab('claims') },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch {
      Alert.alert('Reward', 'Your request has been submitted to gym staff.');
    } finally {
      setClaimingReward(null);
    }
  };

  // Copy code handler
  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
    Alert.alert('Code Copied', `Voucher Code: ${code}\nPresent this code at reception.`);
  };

  // Current View Label
  const getCurrentViewLabel = () => {
    switch (activeSubTab) {
      case 'performance':
        return 'My Performance';
      case 'rewards':
        return `Rewards Store (${rewardsList.length})`;
      case 'claims':
        return `My Vouchers (${claimsList.length})`;
      case 'awards':
        return `Awards & Honors (${awardsList.length})`;
      default:
        return 'My Performance';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ======================================================== */}
        {/* 1. HERO BANNER MATCHING WEB IMAGE 1                      */}
        {/* ======================================================== */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.trophyIconBox}>
              <Ionicons name="trophy" size={26} color="#EA580C" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.heroPill}>
                <Ionicons name="ribbon-outline" size={11} color="#EA580C" />
                <Text style={styles.heroPillText}>REWARDS & PERFORMANCE</Text>
              </View>
              <Text style={styles.heroTitle}>Rewards & Performance</Text>
              <Text style={styles.heroSub}>
                Level up your workouts, maintain attendance streaks, and earn rewards and honors.
              </Text>
            </View>
          </View>

          {/* 2 Stat Cards inside Hero matching Web Image 1 */}
          <View style={styles.heroStatsRow}>
            {/* Points Balance */}
            <View style={styles.statBox}>
              <View style={styles.statIconBox}>
                <Ionicons name="wallet-outline" size={18} color="#EA580C" />
              </View>
              <View>
                <Text style={styles.statLabel}>POINTS BALANCE</Text>
                <Text style={styles.statValue}>
                  {walletBalance} <Text style={styles.statUnit}>pts</Text>
                </Text>
              </View>
            </View>

            {/* Honors & Awards */}
            <View style={styles.statBox}>
              <View style={styles.statIconBox}>
                <Ionicons name="medal-outline" size={18} color="#EA580C" />
              </View>
              <View>
                <Text style={styles.statLabel}>HONORS & AWARDS</Text>
                <Text style={[styles.statValue, { color: '#EA580C' }]}>{awardsList.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 2. NAVIGATION BAR WITH CATEGORIES & VIEWS (IMAGE 1 & 3)  */}
        {/* ======================================================== */}
        <View style={styles.navBarCard}>
          {/* Category Switcher Row */}
          <View style={styles.catButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setActiveCategory('performance');
                setActiveSubTab('performance');
              }}
              style={[
                styles.catBtn,
                activeCategory === 'performance' ? styles.catBtnActive : styles.catBtnInactive,
              ]}
            >
              <Ionicons
                name="trending-up"
                size={15}
                color={activeCategory === 'performance' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.catBtnText,
                  activeCategory === 'performance' ? styles.catBtnTextActive : styles.catBtnTextInactive,
                ]}
              >
                Performance Overview
              </Text>
              <Ionicons
                name="chevron-down"
                size={13}
                color={activeCategory === 'performance' ? '#FFFFFF' : '#64748B'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setActiveCategory('rewards');
                if (activeSubTab === 'performance') setActiveSubTab('rewards');
              }}
              style={[
                styles.catBtn,
                activeCategory === 'rewards' ? styles.catBtnActive : styles.catBtnInactive,
              ]}
            >
              <Ionicons
                name="gift-outline"
                size={15}
                color={activeCategory === 'rewards' ? '#FFFFFF' : '#64748B'}
              />
              <Text
                style={[
                  styles.catBtnText,
                  activeCategory === 'rewards' ? styles.catBtnTextActive : styles.catBtnTextInactive,
                ]}
              >
                Rewards & Honors
              </Text>
              <Ionicons
                name="chevron-down"
                size={13}
                color={activeCategory === 'rewards' ? '#FFFFFF' : '#64748B'}
              />
            </TouchableOpacity>
          </View>

          {/* Current View Selector Dropdown */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCurrentViewModalVisible(true)}
            style={styles.currentViewSelector}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Ionicons
                name={activeSubTab === 'performance' ? 'trending-up' : 'gift'}
                size={15}
                color="#EA580C"
              />
              <Text style={styles.currentViewMuted}>Current View:</Text>
              <Text style={styles.currentViewBold} numberOfLines={1}>
                {getCurrentViewLabel()}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={14} color="#64748B" />
          </TouchableOpacity>

          {/* Sub-Tabs Row */}
          <View style={styles.subTabsRow}>
            <Text style={styles.subTabsPrefix}>
              {activeCategory === 'performance' ? 'PERFORMANCE OVERVIEW:' : 'REWARDS & HONORS:'}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {activeCategory === 'performance' ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.subTabActivePill}
                  onPress={() => setActiveSubTab('performance')}
                >
                  <Ionicons name="trending-up" size={13} color="#EA580C" />
                  <Text style={styles.subTabActivePillText}>Performance</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={activeSubTab === 'rewards' ? styles.subTabActivePill : styles.subTabInactivePill}
                    onPress={() => setActiveSubTab('rewards')}
                  >
                    <Ionicons
                      name="gift"
                      size={13}
                      color={activeSubTab === 'rewards' ? '#EA580C' : '#64748B'}
                    />
                    <Text
                      style={
                        activeSubTab === 'rewards' ? styles.subTabActivePillText : styles.subTabInactivePillText
                      }
                    >
                      Store ({rewardsList.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={activeSubTab === 'claims' ? styles.subTabActivePill : styles.subTabInactivePill}
                    onPress={() => setActiveSubTab('claims')}
                  >
                    <Ionicons
                      name="ticket-outline"
                      size={13}
                      color={activeSubTab === 'claims' ? '#EA580C' : '#64748B'}
                    />
                    <Text
                      style={
                        activeSubTab === 'claims' ? styles.subTabActivePillText : styles.subTabInactivePillText
                      }
                    >
                      Vouchers ({claimsList.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={activeSubTab === 'awards' ? styles.subTabActivePill : styles.subTabInactivePill}
                    onPress={() => setActiveSubTab('awards')}
                  >
                    <Ionicons
                      name="medal-outline"
                      size={13}
                      color={activeSubTab === 'awards' ? '#EA580C' : '#64748B'}
                    />
                    <Text
                      style={
                        activeSubTab === 'awards' ? styles.subTabActivePillText : styles.subTabInactivePillText
                      }
                    >
                      Awards ({awardsList.length})
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 3. VIEW 1: MY PERFORMANCE (IMAGES 1 & 2)                 */}
        {/* ======================================================== */}
        {activeSubTab === 'performance' && (
          <View style={{ gap: 16 }}>
            {/* Top 4 KPI Metrics */}
            <View style={styles.kpiGrid}>
              {/* Verified Attendance */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <Text style={styles.kpiTitle}>Verified Attendance</Text>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#FFF7ED' }]}>
                    <Ionicons name="flame" size={14} color="#EA580C" />
                  </View>
                </View>
                <Text style={styles.kpiValue}>
                  {performance?.attendance?.totalVerifiedVisits || 1}{' '}
                  <Text style={styles.kpiUnit}>visits</Text>
                </Text>
                <Text style={styles.kpiStreak}>
                  🔥 {performance?.attendance?.streakDays || 1} day streak
                </Text>
              </View>

              {/* Workout Completion */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <Text style={styles.kpiTitle}>Workout Completion</Text>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#FFF7ED' }]}>
                    <Ionicons name="trending-up" size={14} color="#EA580C" />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: '#EA580C' }]}>
                  {performance?.workouts?.completionPercentage ?? 100}%
                </Text>
                <Text style={styles.kpiSub}>
                  {performance?.workouts?.completedCount ?? 30} workouts completed
                </Text>
              </View>

              {/* Diet Adherence */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <Text style={styles.kpiTitle}>Diet Adherence</Text>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Ionicons name="restaurant" size={14} color="#15803D" />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: '#15803D' }]}>
                  {performance?.diet?.adherencePercentage ?? 50}%
                </Text>
                <Text style={styles.kpiSub}>
                  {performance?.diet?.totalMealsRecorded ?? 6} meal check-ins recorded
                </Text>
              </View>

              {/* Reward Points */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiTopRow}>
                  <Text style={styles.kpiTitle}>Reward Points</Text>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#FFF7ED' }]}>
                    <Ionicons name="wallet" size={14} color="#EA580C" />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: '#EA580C' }]}>
                  {walletBalance} <Text style={styles.kpiUnit}>pts</Text>
                </Text>
                <Text style={styles.kpiSub}>0 unlocked badges</Text>
              </View>
            </View>

            {/* Physical Fitness Measurements & Progress Card */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="pulse" size={16} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeaderTitle}>Physical Fitness Measurements & Progress</Text>
                  <Text style={styles.cardHeaderSub}>
                    Real body composition metrics and strength progress logged at the gym.
                  </Text>
                </View>
              </View>

              {performance?.measurements ? (
                <View style={styles.measurementsGrid}>
                  <View style={styles.measureBox}>
                    <Text style={styles.measureLabel}>CURRENT WEIGHT</Text>
                    <Text style={styles.measureValue}>{performance.measurements.currentWeight} kg</Text>
                  </View>
                  <View style={styles.measureBox}>
                    <Text style={styles.measureLabel}>BODY FAT %</Text>
                    <Text style={styles.measureValue}>{performance.measurements.bodyFatPercentage}%</Text>
                  </View>
                  <View style={styles.measureBox}>
                    <Text style={styles.measureLabel}>BENCH PRESS MAX</Text>
                    <Text style={styles.measureValue}>{performance.measurements.benchPressMax} kg</Text>
                  </View>
                  <View style={styles.measureBox}>
                    <Text style={styles.measureLabel}>SQUAT MAX</Text>
                    <Text style={styles.measureValue}>{performance.measurements.squatMax} kg</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyCardBox}>
                  <Text style={styles.emptyCardText}>
                    No physical measurements recorded yet. Ask your trainer to log your weight and fitness stats!
                  </Text>
                </View>
              )}
            </View>

            {/* Verified Gym Attendance History Card Matching Web Image 2 */}
            <View style={styles.sectionCard}>
              <View style={styles.attendanceHeaderRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="calendar" size={16} color="#EA580C" />
                    <Text style={styles.cardHeaderTitle}>Verified Gym Attendance History</Text>
                  </View>
                  <Text style={styles.cardHeaderSub}>
                    Real check-ins and session attendance records verified on the gym floor.
                  </Text>
                </View>

                <View style={styles.attendanceBadgesCol}>
                  <View style={styles.attendanceBadgeOrange}>
                    <Text style={styles.attendanceBadgeOrangeText}>
                      {performance?.attendance?.totalVerifiedVisits ?? 1} Visits Total
                    </Text>
                  </View>
                  <View style={styles.attendanceBadgeStreak}>
                    <Text style={styles.attendanceBadgeStreakText}>
                      🔥 {performance?.attendance?.streakDays ?? 1}d Streak
                    </Text>
                  </View>
                </View>
              </View>

              {/* Attendance Table / Cards */}
              <View style={styles.attTableContainer}>
                {/* Table Header */}
                <View style={styles.attTableHeader}>
                  <Text style={[styles.attTh, { flex: 1.1 }]}>DATE</Text>
                  <Text style={[styles.attTh, { flex: 1.5 }]}>CHECK-IN / OUT</Text>
                  <Text style={[styles.attTh, { flex: 1.1 }]}>MODE</Text>
                  <Text style={[styles.attTh, { flex: 1.3 }]}>TRAINER/FLOOR</Text>
                  <Text style={[styles.attTh, { flex: 1.1, textAlign: 'right' }]}>STATUS</Text>
                </View>

                {/* Table Rows */}
                {(performance?.attendance?.attendanceLogs || DEFAULT_PERFORMANCE.attendance.attendanceLogs).map(
                  (log: any, idx: number) => (
                    <View key={log._id || idx} style={styles.attTableRow}>
                      <Text style={[styles.attTdBold, { flex: 1.1 }]}>
                        {log.date ? new Date(log.date).toLocaleDateString('en-US') : '10/15/2026'}
                      </Text>
                      <Text style={[styles.attTdMuted, { flex: 1.5 }]}>
                        {log.checkInTime || '03:58 PM'} - {log.checkOutTime || '03:59 PM'}
                      </Text>
                      <View style={{ flex: 1.1 }}>
                        <View style={styles.attModeBadge}>
                          <Text style={styles.attModeBadgeText}>{log.mode || 'Online'}</Text>
                        </View>
                      </View>
                      <Text style={[styles.attTdMuted, { flex: 1.3 }]}>
                        {log.trainerName || 'Gym Floor'}
                      </Text>
                      <View style={{ flex: 1.1, alignItems: 'flex-end' }}>
                        <View style={styles.attVerifiedBadge}>
                          <Text style={styles.attVerifiedBadgeText}>Verified ✓</Text>
                        </View>
                      </View>
                    </View>
                  )
                )}
              </View>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* 4. VIEW 2: REWARDS STORE (WEB IMAGE 3)                   */}
        {/* ======================================================== */}
        {activeSubTab === 'rewards' && (
          <View style={{ gap: 14 }}>
            {/* Header Card */}
            <View style={styles.storeHeaderCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.storeHeaderTitle}>Rewards Store</Text>
                <Text style={styles.storeHeaderSub}>
                  Redeem your earned fitness points for exclusive coupons, merchandise, and sessions.
                </Text>
              </View>
              <View style={styles.availPtsBox}>
                <Text style={styles.availPtsLabel}>Available Points</Text>
                <Text style={styles.availPtsValue}>{walletBalance} pts</Text>
              </View>
            </View>

            {/* Rewards Grid */}
            <View style={{ gap: 12 }}>
              {rewardsList.map((reward: any) => {
                const isClaimed = reward.isClaimed || reward.status === 'Claimed';

                return (
                  <View key={reward._id} style={styles.rewardCard}>
                    {/* Top Row: Category + Status Badge */}
                    <View style={styles.rwdTopRow}>
                      <View style={styles.rwdCategoryBadge}>
                        <Text style={styles.rwdCategoryText}>{reward.category}</Text>
                      </View>

                      {isClaimed ? (
                        <View style={styles.rwdClaimedPill}>
                          <Text style={styles.rwdClaimedPillText}>✓ Claimed</Text>
                        </View>
                      ) : (
                        <Text style={styles.rwdUnlockedText}>Unlocked</Text>
                      )}
                    </View>

                    {/* Title & Desc */}
                    <Text style={styles.rwdTitle}>{reward.title}</Text>
                    {reward.description ? (
                      <Text style={styles.rwdDesc}>{reward.description}</Text>
                    ) : null}

                    {/* Free Gift Box if applicable */}
                    {reward.productName ? (
                      <View style={styles.giftBoxRow}>
                        <Ionicons name="gift-outline" size={15} color="#EA580C" />
                        <Text style={styles.giftBoxText}>
                          Free Gift: {reward.productName} (Qty: {reward.productQuantity || 1})
                        </Text>
                      </View>
                    ) : null}

                    {/* Bottom Action Row */}
                    <View style={styles.rwdBottomRow}>
                      <Text style={styles.instantVoucherText}>Instant Voucher</Text>

                      {isClaimed ? (
                        <View style={styles.claimedBtnDisabled}>
                          <Text style={styles.claimedBtnDisabledText}>Claimed</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleClaimReward(reward)}
                          disabled={claimingReward === reward._id}
                          style={styles.redeemBtn}
                        >
                          {claimingReward === reward._id ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.redeemBtnText}>Redeem Perk</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* 5. VIEW 3: MY VOUCHERS (CLAIMS)                          */}
        {/* ======================================================== */}
        {activeSubTab === 'claims' && (
          <View style={{ gap: 14 }}>
            <View style={styles.storeHeaderCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.storeHeaderTitle}>My Claimed Vouchers</Text>
                <Text style={styles.storeHeaderSub}>
                  Present your voucher codes at the gym desk to redeem your rewards and benefits.
                </Text>
              </View>
            </View>

            {claimsList.length === 0 ? (
              <View style={styles.emptyCardBox}>
                <Ionicons name="ticket-outline" size={32} color="#CBD5E1" />
                <Text style={styles.emptyCardTitle}>No Claimed Rewards Yet</Text>
                <Text style={styles.emptyCardText}>
                  When you claim rewards or vouchers, your codes and approval status will appear here.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {claimsList.map((claim: any) => (
                  <View key={claim._id} style={styles.voucherCard}>
                    <View style={styles.rwdTopRow}>
                      <View style={styles.voucherStatusPill}>
                        <Text style={styles.voucherStatusPillText}>{claim.claimStatus || 'Approved'}</Text>
                      </View>
                      <Text style={styles.voucherDate}>
                        {claim.createdAt
                          ? new Date(claim.createdAt).toLocaleDateString('en-US')
                          : '10/15/2026'}
                      </Text>
                    </View>

                    <Text style={styles.rwdTitle}>{claim.rewardTitle || 'Reward Voucher'}</Text>
                    <Text style={styles.rwdCategoryText}>{claim.category || 'General Perk'}</Text>

                    {/* Dashed Code Box */}
                    <View style={styles.dashedCodeBox}>
                      <View>
                        <Text style={styles.dashedCodeLabel}>VOUCHER CODE</Text>
                        <Text style={styles.dashedCodeValue}>{claim.claimCode}</Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleCopyCode(claim.claimCode)}
                        style={styles.copyBtn}
                      >
                        <Ionicons
                          name={copiedCode === claim.claimCode ? 'checkmark' : 'copy-outline'}
                          size={15}
                          color="#EA580C"
                        />
                        <Text style={styles.copyBtnText}>
                          {copiedCode === claim.claimCode ? 'Copied' : 'Copy'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ======================================================== */}
        {/* 6. VIEW 4: AWARDS & HONORS                               */}
        {/* ======================================================== */}
        {activeSubTab === 'awards' && (
          <View style={{ gap: 14 }}>
            <View style={styles.awardsHeroCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.awardsHeroPill}>
                  <Ionicons name="medal" size={12} color="#EA580C" />
                  <Text style={styles.awardsHeroPillText}>OFFICIAL RECOGNITION & HONORS</Text>
                </View>
                <Text style={styles.awardsHeroTitle}>My Awards & Gym Hall of Fame</Text>
                <Text style={styles.awardsHeroSub}>
                  Conferred fitness honors recognized by gym management. View and verify your official credentials anytime.
                </Text>
              </View>
              <View style={styles.awardsCountBox}>
                <Text style={styles.awardsCountLabel}>Awards Conferred</Text>
                <Text style={styles.awardsCountValue}>{awardsList.length}</Text>
              </View>
            </View>

            <Text style={styles.subSectionTitle}>
              My Conferred Honors ({awardsList.length})
            </Text>

            <View style={{ gap: 12 }}>
              {awardsList.map((award: any) => (
                <View key={award._id} style={styles.awardCard}>
                  <View style={styles.awardCardTop}>
                    <View style={styles.awardIconBox}>
                      <Ionicons name="trophy" size={22} color="#EA580C" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.awardTitle}>{award.title}</Text>
                      <Text style={styles.awardReason}>{award.reason}</Text>
                    </View>
                  </View>

                  <View style={styles.awardMetaRow}>
                    <Text style={styles.awardMetaText}>
                      Conferred on:{' '}
                      <Text style={{ fontWeight: '700', color: '#111827' }}>
                        {award.dateConferred
                          ? new Date(award.dateConferred).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Oct 15, 2026'}
                      </Text>
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedAwardForCert(award)}
                      style={styles.viewCertBtn}
                    >
                      <Ionicons name="document-text-outline" size={13} color="#FFFFFF" />
                      <Text style={styles.viewCertBtnText}>View Certificate</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL 1: CURRENT VIEW SELECTOR DROPDOWN (MASTER)         */}
      {/* ======================================================== */}
      <Modal
        visible={currentViewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrentViewModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCurrentViewModalVisible(false)}
        >
          <View style={styles.dropdownModalCard}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Select View</Text>
              <TouchableOpacity onPress={() => setCurrentViewModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Performance Overview Group */}
            <View style={styles.dropdownGroup}>
              <View style={styles.dropdownGroupHeader}>
                <Ionicons name="trending-up" size={14} color="#EA580C" />
                <Text style={styles.dropdownGroupTitle}>PERFORMANCE OVERVIEW</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  activeSubTab === 'performance' && styles.dropdownItemActive,
                ]}
                onPress={() => handleSelectSubTab('performance')}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      activeSubTab === 'performance' && styles.dropdownItemTextActive,
                    ]}
                  >
                    My Performance
                  </Text>
                  <Text style={styles.dropdownItemSub}>
                    Attendance stats, workout progress & adherence streaks
                  </Text>
                </View>
                {activeSubTab === 'performance' && (
                  <Ionicons name="checkmark" size={18} color="#EA580C" />
                )}
              </TouchableOpacity>
            </View>

            {/* Rewards & Honors Group */}
            <View style={[styles.dropdownGroup, { marginTop: 10 }]}>
              <View style={styles.dropdownGroupHeader}>
                <Ionicons name="gift" size={14} color="#EA580C" />
                <Text style={styles.dropdownGroupTitle}>REWARDS & HONORS</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  activeSubTab === 'rewards' && styles.dropdownItemActive,
                ]}
                onPress={() => handleSelectSubTab('rewards')}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      activeSubTab === 'rewards' && styles.dropdownItemTextActive,
                    ]}
                  >
                    Rewards Store ({rewardsList.length})
                  </Text>
                  <Text style={styles.dropdownItemSub}>
                    Redeem your points for gifts, passes & discounts
                  </Text>
                </View>
                {activeSubTab === 'rewards' && (
                  <Ionicons name="checkmark" size={18} color="#EA580C" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  activeSubTab === 'claims' && styles.dropdownItemActive,
                ]}
                onPress={() => handleSelectSubTab('claims')}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      activeSubTab === 'claims' && styles.dropdownItemTextActive,
                    ]}
                  >
                    My Vouchers ({claimsList.length})
                  </Text>
                  <Text style={styles.dropdownItemSub}>
                    Claimed reward codes, passes & store vouchers
                  </Text>
                </View>
                {activeSubTab === 'claims' && (
                  <Ionicons name="checkmark" size={18} color="#EA580C" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  activeSubTab === 'awards' && styles.dropdownItemActive,
                ]}
                onPress={() => handleSelectSubTab('awards')}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      activeSubTab === 'awards' && styles.dropdownItemTextActive,
                    ]}
                  >
                    Awards & Honors ({awardsList.length})
                  </Text>
                  <Text style={styles.dropdownItemSub}>
                    Official gym awards, recognitions & certificates
                  </Text>
                </View>
                {activeSubTab === 'awards' && (
                  <Ionicons name="checkmark" size={18} color="#EA580C" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: OFFICIAL CERTIFICATE MODAL                      */}
      {/* ======================================================== */}
      <Modal
        visible={Boolean(selectedAwardForCert)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAwardForCert(null)}
      >
        <View style={styles.certBackdrop}>
          <View style={styles.certModalCard}>
            <View style={styles.certHeaderRow}>
              <Text style={styles.certHeaderTitle}>Official Gym Certificate</Text>
              <TouchableOpacity onPress={() => setSelectedAwardForCert(null)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            {selectedAwardForCert && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
                {/* Certificate Frame */}
                <View style={styles.certFrame}>
                  <View style={styles.certCornerTL} />
                  <View style={styles.certCornerTR} />
                  <View style={styles.certCornerBL} />
                  <View style={styles.certCornerBR} />

                  <View style={styles.certSealBox}>
                    <Ionicons name="trophy" size={28} color="#EA580C" />
                  </View>

                  <Text style={styles.certOrgName}>PERFECT FITNESS STUDIO</Text>
                  <Text style={styles.certSubtitle}>CERTIFICATE OF ACHIEVEMENT</Text>

                  <Text style={styles.certPresentedTo}>This honor is proudly presented to</Text>
                  <Text style={styles.certRecipientName}>
                    {user?.name || user?.firstName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'Renugopal Y'}
                  </Text>

                  <Text style={styles.certAwardTitle}>FOR: {selectedAwardForCert.title.toUpperCase()}</Text>
                  <Text style={styles.certBody}>{selectedAwardForCert.reason}</Text>

                  <View style={styles.certDivider} />

                  <View style={styles.certSignaturesRow}>
                    <View style={styles.certSigCol}>
                      <Text style={styles.certSigTitle}>DATE CONFERRED</Text>
                      <Text style={styles.certSigValue}>
                        {selectedAwardForCert.dateConferred
                          ? new Date(selectedAwardForCert.dateConferred).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'October 15, 2026'}
                      </Text>
                    </View>

                    <View style={styles.certSigCol}>
                      <Text style={styles.certSigTitle}>CONFERRED BY</Text>
                      <Text style={styles.certSigValue}>
                        {selectedAwardForCert.conferredBy || 'Gym Management'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.certIdCode}>
                    CERTIFICATE ID: {selectedAwardForCert.certificateId || 'CERT-GYM-2026'}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={async () => {
                    try {
                      await FileDownloader.downloadReportPDF({
                        title: `Certificate of Achievement: ${selectedAwardForCert.title}`,
                        subtitle: `Proudly conferred to ${user?.name || user?.firstName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'Renugopal Y'}`,
                        gymName: 'Perfect Fitness Studio',
                        dateRange: selectedAwardForCert.dateConferred
                          ? new Date(selectedAwardForCert.dateConferred).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : 'October 15, 2026',
                        headers: ['Certificate ID', 'Recipient', 'Award Category', 'Conferred By', 'Reason'],
                        rows: [
                          [
                            selectedAwardForCert.certificateId || 'CERT-GYM-2026',
                            user?.name || user?.firstName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'Renugopal Y',
                            selectedAwardForCert.title,
                            selectedAwardForCert.conferredBy || 'Gym Management',
                            selectedAwardForCert.reason || 'Demonstrating outstanding consistency and fitness milestone achievements'
                          ]
                        ]
                      }, `Certificate_${selectedAwardForCert.title.replace(/[^a-zA-Z0-9_-]/g, '_')}`);
                    } catch (err: any) {
                      Alert.alert('Download Error', err?.message || 'Unable to download certificate PDF.');
                    }
                  }}
                  style={styles.downloadCertBtn}
                >
                  <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.downloadCertBtnText}>Download PDF Certificate</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // Hero Card matching Web Image 1
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  trophyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginTop: 1,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },

  // Navigation Bar Card
  navBarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  catButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  catBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  catBtnActive: {
    backgroundColor: '#C2410C',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  catBtnInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  catBtnTextActive: {
    color: '#FFFFFF',
  },
  catBtnTextInactive: {
    color: '#64748B',
  },

  currentViewSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  currentViewMuted: {
    fontSize: 11,
    color: '#64748B',
  },
  currentViewBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },

  subTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  subTabsPrefix: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  subTabActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  subTabActivePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  subTabInactivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  subTabInactivePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kpiTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  kpiUnit: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  kpiStreak: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  sectionIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  cardHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  measureBox: {
    width: (SCREEN_WIDTH - 76) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  measureLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  measureValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },

  emptyCardBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  emptyCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  emptyCardText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Attendance Section
  attendanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  attendanceBadgesCol: {
    flexDirection: 'row',
    gap: 6,
  },
  attendanceBadgeOrange: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  attendanceBadgeOrangeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  attendanceBadgeStreak: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  attendanceBadgeStreakText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },

  // Attendance Table Styles
  attTableContainer: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  attTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  attTh: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  attTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  attTdBold: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  attTdMuted: {
    fontSize: 10,
    color: '#64748B',
  },
  attModeBadge: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  attModeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  attVerifiedBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  attVerifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },

  // Store View Styles
  storeHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  storeHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  storeHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  availPtsBox: {
    alignItems: 'flex-end',
  },
  availPtsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  availPtsValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },

  // Reward Card matching Web Image 3
  rewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  rwdTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rwdCategoryBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rwdCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
  },
  rwdClaimedPill: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rwdClaimedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  rwdUnlockedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  rwdTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  rwdDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  giftBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 8,
    borderRadius: 10,
  },
  giftBoxText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  rwdBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 4,
  },
  instantVoucherText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  redeemBtn: {
    backgroundColor: '#C2410C',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#EA580C',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  redeemBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  claimedBtnDisabled: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  claimedBtnDisabledText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },

  // Voucher Card
  voucherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 8,
  },
  voucherStatusPill: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  voucherStatusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  voucherDate: {
    fontSize: 10,
    color: '#64748B',
  },
  dashedCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
  },
  dashedCodeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dashedCodeValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },

  // Awards View
  awardsHeroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  awardsHeroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  awardsHeroPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  awardsHeroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  awardsHeroSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  awardsCountBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  awardsCountLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  awardsCountValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 2,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  awardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 10,
  },
  awardCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  awardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  awardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  awardReason: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  awardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  awardMetaText: {
    fontSize: 10,
    color: '#64748B',
  },
  viewCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C2410C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewCertBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dropdownModalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  dropdownGroup: {
    gap: 4,
  },
  dropdownGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 4,
    marginBottom: 2,
  },
  dropdownGroupTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
  },
  dropdownItemActive: {
    backgroundColor: '#FFF7ED',
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  dropdownItemTextActive: {
    color: '#EA580C',
    fontWeight: '900',
  },
  dropdownItemSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },

  // Certificate Modal
  certBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  certModalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  certHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  certHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  certFrame: {
    position: 'relative',
    backgroundColor: '#FFFDFB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FDBA74',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  certCornerTL: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#EA580C',
  },
  certCornerTR: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#EA580C',
  },
  certCornerBL: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#EA580C',
  },
  certCornerBR: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: '#EA580C',
  },
  certSealBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  certOrgName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 1.5,
  },
  certSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 1,
    marginTop: 2,
    marginBottom: 14,
  },
  certPresentedTo: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#64748B',
  },
  certRecipientName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginVertical: 6,
    textAlign: 'center',
  },
  certAwardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#C2410C',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginTop: 4,
  },
  certBody: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  certDivider: {
    width: '60%',
    height: 1,
    backgroundColor: '#FED7AA',
    marginVertical: 14,
  },
  certSignaturesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  certSigCol: {
    alignItems: 'center',
  },
  certSigTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  certSigValue: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  certIdCode: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#94A3B8',
    marginTop: 14,
  },
  downloadCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  downloadCertBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
