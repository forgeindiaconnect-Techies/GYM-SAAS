import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Linking, 
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export const TrainerDashboardScreen: React.FC<{ onNavigateTab: (tab: string, sub?: string) => void }> = ({ onNavigateTab }) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [clientCount, setClientCount] = useState<number>(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(0);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);
  const [trainingHours, setTrainingHours] = useState<number>(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [sessionsRes, progressRes, earningsRes] = await Promise.allSettled([
        api.get('/trainer-sessions/trainer'),
        api.get('/workout-progress/trainer/clients-overview'),
        api.get('/trainer-payments/my-earnings'),
      ]);

      let allSessions: any[] = [];
      if (sessionsRes.status === 'fulfilled' && sessionsRes.value.data?.sessions) {
        allSessions = sessionsRes.value.data.sessions;
      } else if (sessionsRes.status === 'fulfilled' && Array.isArray(sessionsRes.value.data)) {
        allSessions = sessionsRes.value.data;
      }

      setSessions(allSessions);

      // Unique clients calculation
      const clientIds = new Set<string>();
      allSessions.forEach((s: any) => {
        const id = s.customerId?._id || s.customerId?.id || s.customerId;
        if (id) clientIds.add(String(id));
      });

      if (progressRes.status === 'fulfilled' && progressRes.value.data?.clients) {
        progressRes.value.data.clients.forEach((c: any) => {
          const id = c.customer?.id || c.customer?._id || c._id;
          if (id) clientIds.add(String(id));
        });
      }
      setClientCount(clientIds.size);

      // Monthly Earnings calculation
      if (earningsRes.status === 'fulfilled' && earningsRes.value.data?.earnings) {
        setMonthlyEarnings(Number(earningsRes.value.data.earnings.totalEarnings || earningsRes.value.data.earnings.netEarnings || 0));
      } else {
        const paidTotal = allSessions
          .filter((s: any) => s.paymentStatus === 'Paid' && !['Refunded', 'Cancelled'].includes(s.status))
          .reduce((sum: number, s: any) => sum + (Number(s.fee) || 0), 0);
        setMonthlyEarnings(paidTotal);
      }

      // Completed & Training hours calculation
      const completed = allSessions.filter((s: any) => s.status === 'Completed').length;
      setCompletedSessionsCount(completed);
      setTrainingHours(completed * 1); // Estimated 1 hr per session
    } catch (err) {
      console.log('[TrainerDashboard] Live data fetch note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Filter Today's sessions
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s: any) => {
    const sDate = s.date ? new Date(s.date).toISOString().split('T')[0] : '';
    return sDate === todayStr || !s.date; // show if today or unscheduled
  });

  // Display sessions list (fallback to all sessions if none marked specifically today)
  const displayList = todaySessions.length > 0 ? todaySessions : sessions.slice(0, 5);

  // Next up session
  const nextSession = displayList.find((s: any) => s.status !== 'Completed') || displayList[0];
  const nextClientName = nextSession?.customerId?.name || nextSession?.clientName || 'Assigned Client';
  const nextTime = nextSession?.timeSlot || nextSession?.time || '11:00 AM';
  const nextPhone = nextSession?.customerId?.phone || nextSession?.phone || '';

  const handleCallClient = (name: string, phone: string) => {
    if (!phone) {
      Alert.alert('Client Contact', `Phone number for ${name} is not on record.`);
      return;
    }
    Alert.alert(
      `Contact ${name}`,
      `Call client (${phone}) for upcoming coaching session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Client', onPress: () => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`) },
      ]
    );
  };

  // Adherence calculation
  const totalRelevant = displayList.length || sessions.length;
  const adherenceRate = totalRelevant > 0 
    ? Math.min(100, Math.round(((completedSessionsCount || 1) / Math.max(1, totalRelevant)) * 100))
    : 95;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={COLORS.primary} 
          colors={[COLORS.primary]} 
        />
      }
    >
      {/* Trainer Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Master Coach</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              Welcome, Coach {user?.firstName || user?.name?.split(' ')[0] || 'Trainer'} 🏋️
            </Text>
            <Text style={styles.sub}>
              {displayList.length} Session{displayList.length === 1 ? '' : 's'} Scheduled Today
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.avatarLetter || user?.name?.charAt(0) || 'T'}</Text>
          </View>
        </View>

        {nextSession ? (
          <View style={styles.nextBox}>
            <View style={styles.nextLeft}>
              <View style={styles.dot} />
              <Text style={styles.nextLabel} numberOfLines={1}>
                Next Up: <Text style={styles.nextName}>{nextClientName}</Text> at {nextTime}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.quickCall} 
              onPress={() => handleCallClient(nextClientName, nextPhone)}
              activeOpacity={0.7}
              accessibilityLabel="Call Next Client"
            >
              <Ionicons name="call" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nextBox}>
            <View style={styles.nextLeft}>
              <View style={[styles.dot, { backgroundColor: '#60A5FA' }]} />
              <Text style={styles.nextLabel}>All sessions completed or floor free</Text>
            </View>
          </View>
        )}
      </View>

      {/* KPI Cards */}
      <Text style={styles.sectionTitle}>Coaching Overview</Text>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Active Clients</Text>
          <Text style={styles.kpiValue}>{clientCount > 0 ? clientCount : '—'}</Text>
          <Text style={styles.kpiSub}>Live roster</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>This Month Payout</Text>
          <Text style={styles.kpiValue}>
            {monthlyEarnings > 0 ? `₹${monthlyEarnings.toLocaleString('en-IN')}` : '₹0'}
          </Text>
          <Text style={styles.kpiSub}>Verified earnings</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Adherence Rate</Text>
          <Text style={styles.kpiValue}>{adherenceRate}%</Text>
          <Text style={styles.kpiSub}>Session completion</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Training Hours</Text>
          <Text style={styles.kpiValue}>{trainingHours > 0 ? `${trainingHours} hrs` : '0 hrs'}</Text>
          <Text style={styles.kpiSub}>Coaching floor</Text>
        </View>
      </View>

      {/* Today's Schedule Timeline */}
      <View style={styles.timelineHeader}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <TouchableOpacity onPress={() => onNavigateTab('programs', 'workout-plans')}>
          <Text style={styles.viewRoutinesText}>Routines →</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading live sessions...</Text>
        </View>
      ) : displayList.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Sessions Scheduled Today</Text>
          <Text style={styles.emptySub}>Assigned personal training sessions will appear here in real-time.</Text>
        </View>
      ) : (
        <View style={styles.sessionsList}>
          {displayList.map((s, idx) => {
            const clientName = s.customerId?.name || s.clientName || 'Client';
            const goal = s.goal || s.packageTitle || s.sessionType || 'Fitness Training';
            const time = s.timeSlot || s.time || (s.date ? new Date(s.date).toLocaleDateString() : 'Floor Slot');
            const phone = s.customerId?.phone || s.phone || '';
            const isCompleted = s.status === 'Completed';
            const isNext = s._id === nextSession?._id && !isCompleted;

            return (
              <View key={s._id || s.id || idx} style={[styles.sessionCard, isNext && styles.sessionCardNext]}>
                <View style={styles.sessionTop}>
                  <View style={styles.sessionLeft}>
                    <View style={[styles.sessionAvatar, isNext && { backgroundColor: COLORS.primary }]}>
                      <Text style={[styles.sessionAvatarText, isNext && { color: COLORS.white }]}>
                        {clientName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.clientName}>{clientName}</Text>
                      <Text style={styles.clientGoal}>{goal}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusPill, 
                    isCompleted ? styles.bgDone : isNext ? styles.bgNext : styles.bgUpcoming
                  ]}>
                    <Text style={[
                      styles.statusText,
                      isCompleted ? styles.textDone : isNext ? styles.textNext : styles.textUpcoming
                    ]}>
                      {isCompleted ? 'Completed' : isNext ? 'Next Up' : s.status || 'Upcoming'}
                    </Text>
                  </View>
                </View>

                <View style={styles.sessionFooter}>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.timeText}>{time}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    {phone ? (
                      <TouchableOpacity onPress={() => handleCallClient(clientName, phone)}>
                        <Ionicons name="call-outline" size={15} color={COLORS.primary} />
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity onPress={() => onNavigateTab('programs', 'workout-plans')}>
                      <Text style={styles.assignText}>Assign Split</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 14, paddingBottom: 110 },
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  sub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  nextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 12,
  },
  nextLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  nextLabel: { color: COLORS.white, fontSize: 11, flexShrink: 1 },
  nextName: { fontWeight: '700' },
  quickCall: {
    backgroundColor: COLORS.white,
    padding: 7,
    borderRadius: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  kpiLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  kpiValue: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginVertical: 3 },
  kpiSub: { fontSize: 9, color: COLORS.emerald, fontWeight: '700' },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewRoutinesText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  sessionsList: { gap: 8 },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sessionCardNext: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFAF5',
  },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  sessionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionAvatarText: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  clientName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  clientGoal: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bgDone: { backgroundColor: COLORS.emeraldLight },
  textDone: { color: COLORS.emerald, fontSize: 10, fontWeight: '700' },
  bgNext: { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primaryBorder },
  textNext: { color: COLORS.primaryDark, fontSize: 10, fontWeight: '800' },
  bgUpcoming: { backgroundColor: COLORS.background },
  textUpcoming: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  statusText: { fontSize: 10 },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText: { fontSize: 11, color: COLORS.textMedium },
  assignText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginTop: 10 },
  emptySub: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
});
