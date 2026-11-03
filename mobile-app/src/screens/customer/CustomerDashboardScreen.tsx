import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  BackHandler, 
  RefreshControl, 
  ActivityIndicator, 
  Alert, 
  Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export interface CustomerDashboardProps {
  onNavigateTab: (tab: string, sub?: string) => void;
  externalQrVisible?: boolean;
  onCloseExternalQr?: () => void;
}

export const CustomerDashboardScreen: React.FC<CustomerDashboardProps> = ({ 
  onNavigateTab,
  externalQrVisible = false,
  onCloseExternalQr
}) => {
  const { user } = useAuth();
  const [internalQrVisible, setInternalQrVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Live data states
  const [activeMembership, setActiveMembership] = useState<any>(null);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [todayRoutine, setTodayRoutine] = useState<any[]>([]);
  const [splitName, setSplitName] = useState<string>('Daily Workout');
  const [coachSession, setCoachSession] = useState<any>(null);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [activeBurn, setActiveBurn] = useState<number>(0);
  const [calorieGoal, setCalorieGoal] = useState<number>(650);
  const [waterMl, setWaterMl] = useState<number>(2000);

  const fetchCustomerDashboard = useCallback(async () => {
    try {
      const [membershipRes, planRes, progressRes, sessionsRes, dietRes] = await Promise.allSettled([
        api.get('/memberships/my'),
        api.get('/workout-plans/my-plan'),
        api.get('/workout-progress/my-progress'),
        api.get('/trainer-sessions/member'),
        api.get('/diet-progress/my-progress'),
      ]);

      // 1. Membership
      if (membershipRes.status === 'fulfilled' && membershipRes.value.data) {
        const list = membershipRes.value.data.memberships || (Array.isArray(membershipRes.value.data) ? membershipRes.value.data : []);
        const active = list.find((m: any) => m.status === 'Active' || m.status === 'Free Trial') || list[0] || null;
        setActiveMembership(active);
      }

      // 2. Workout Plan & Today's Routine
      if (planRes.status === 'fulfilled' && planRes.value.data) {
        const plan = planRes.value.data.plan || planRes.value.data;
        setWorkoutPlan(plan);
        if (plan?.days && Array.isArray(plan.days) && plan.days.length > 0) {
          // Find day matching current day of week (0 = Sun, 1 = Mon...)
          const dayIndex = new Date().getDay();
          const targetDay = plan.days[dayIndex % plan.days.length] || plan.days[0];
          setSplitName(targetDay.name || targetDay.day || 'Today Split');
          setTodayRoutine(targetDay.exercises || []);
        } else if (plan?.exercises && Array.isArray(plan.exercises)) {
          setTodayRoutine(plan.exercises);
        }
      }

      // 3. Progress & Streak
      if (progressRes.status === 'fulfilled' && progressRes.value.data) {
        const stats = progressRes.value.data.stats || progressRes.value.data;
        setStreakDays(stats.streak || stats.consecutiveDays || 3);
        setActiveBurn(stats.caloriesBurnedToday || stats.caloriesBurned || 450);
        if (stats.dailyCalorieTarget) {
          setCalorieGoal(stats.dailyCalorieTarget);
        }
      }

      // 4. Assigned Coach Session
      if (sessionsRes.status === 'fulfilled' && sessionsRes.value.data) {
        const sessions = sessionsRes.value.data.sessions || (Array.isArray(sessionsRes.value.data) ? sessionsRes.value.data : []);
        const next = sessions.find((s: any) => s.status !== 'Completed') || sessions[0] || null;
        setCoachSession(next);
      }

      // 5. Hydration & Diet
      if (dietRes.status === 'fulfilled' && dietRes.value.data) {
        const dietData = dietRes.value.data.progress || dietRes.value.data;
        if (dietData.waterIntakeMl) {
          setWaterMl(dietData.waterIntakeMl);
        }
      }
    } catch (err) {
      console.log('[CustomerDashboard] Live fetch note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomerDashboard();
  }, [fetchCustomerDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomerDashboard();
  };

  const handleAddWater = async () => {
    const newAmount = Math.min(waterMl + 250, 4500);
    setWaterMl(newAmount);
    try {
      await api.post('/diet-progress/log-water', { waterMl: newAmount }).catch(() => {});
    } catch (e) {}
  };

  const qrVisible = externalQrVisible || internalQrVisible;
  const closeQr = () => {
    setInternalQrVisible(false);
    if (onCloseExternalQr) onCloseExternalQr();
  };

  useEffect(() => {
    if (!qrVisible) return;
    const backAction = () => {
      closeQr();
      return true;
    };
    const handler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => handler.remove();
  }, [qrVisible]);

  // Derived labels
  const memberTier = activeMembership?.planName || activeMembership?.type || user?.subscriptionPlan || 'Active Member';
  const memberPassId = activeMembership?.passCode || activeMembership?.membershipNumber || activeMembership?._id || user?._id || 'GYM-2026-PASS';
  const coachName = coachSession?.trainerId?.name || coachSession?.trainerName || 'Floor Coach';
  const coachTime = coachSession?.timeSlot || coachSession?.time || 'Booked Slot';
  const coachPhone = coachSession?.trainerId?.phone || coachSession?.phone || '';

  const handleCallCoach = () => {
    if (!coachPhone) {
      onNavigateTab('training', 'training');
      return;
    }
    Alert.alert(
      `Contact Coach ${coachName}`,
      `Call ${coachPhone} regarding your scheduled session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Coach', onPress: () => Linking.openURL(`tel:${coachPhone.replace(/\s+/g, '')}`) }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={COLORS.primary} 
          colors={[COLORS.primary]} 
        />
      }
    >
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeText}>{memberTier}</Text>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={11} color="#FBBF24" />
                <Text style={styles.streakText}>{streakDays} Days Streak</Text>
              </View>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              Train Hard, {user?.firstName || user?.name?.split(' ')[0] || 'Member'} 🔥
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              Today: {splitName}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.qrBtn} 
            onPress={() => setInternalQrVisible(true)}
            activeOpacity={0.8}
            accessibilityLabel="Open Gym Entry Pass"
          >
            <Ionicons name="qr-code" size={24} color={COLORS.primary} />
            <Text style={styles.qrBtnText}>PASS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bannerBottom}>
          <Text style={styles.sessionTime}>
            {coachSession ? `Coach: ${coachTime}` : 'Floor Hours: Open Today'}
          </Text>
          <TouchableOpacity 
            style={styles.startWorkoutBtn}
            onPress={() => onNavigateTab('training', 'workout_plan')}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={12} color={COLORS.primary} />
            <Text style={styles.startWorkoutText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Active Burn</Text>
            <Ionicons name="flame" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.metricVal}>
            {activeBurn} <Text style={styles.metricSub}>/ {calorieGoal} kcal</Text>
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(100, Math.round((activeBurn / Math.max(1, calorieGoal)) * 100))}%`, backgroundColor: COLORS.primary }
              ]} 
            />
          </View>
          <Text style={styles.progressNote}>
            {Math.min(100, Math.round((activeBurn / Math.max(1, calorieGoal)) * 100))}% of daily goal
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Hydration</Text>
            <Ionicons name="water" size={16} color={COLORS.sky} />
          </View>
          <Text style={styles.metricVal}>
            {(waterMl / 1000).toFixed(1)} <Text style={styles.metricSub}>/ 3.5 L</Text>
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(100, Math.round((waterMl / 3500) * 100))}%`, backgroundColor: COLORS.sky }
              ]} 
            />
          </View>
          <TouchableOpacity onPress={handleAddWater} activeOpacity={0.7}>
            <Text style={[styles.progressNote, { color: COLORS.sky, fontWeight: '700' }]}>+250ml Water</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Workout Routine */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Routine</Text>
        <TouchableOpacity onPress={() => onNavigateTab('training', 'workout_plan')}>
          <Text style={styles.viewAllText}>View Split →</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading routine...</Text>
        </View>
      ) : todayRoutine.length === 0 ? (
        <View style={styles.card}>
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Ionicons name="barbell-outline" size={28} color={COLORS.textMuted} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textDark, marginTop: 6 }}>
              Rest Day or Floor Routine
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 2 }}>
              Tap Start Workout above to choose any exercise split from the library.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          {todayRoutine.slice(0, 4).map((ex, idx) => {
            const exName = ex.name || ex.title || ex.exerciseName || 'Exercise';
            const setsReps = ex.sets 
              ? `${ex.sets} sets × ${ex.reps || 10} reps ${ex.weight ? `(${ex.weight} kg)` : ''}`
              : (ex.reps ? `${ex.reps} reps` : 'Target set');
            const isFirst = idx === 0;

            return (
              <View 
                key={ex._id || idx} 
                style={[
                  styles.exerciseItem, 
                  isFirst && styles.exerciseItemActive,
                  idx === Math.min(todayRoutine.length - 1, 3) && { borderBottomWidth: 0 }
                ]}
              >
                <View style={[styles.stepCircle, { backgroundColor: isFirst ? COLORS.primary : COLORS.background }]}>
                  <Text style={[styles.stepNum, { color: isFirst ? COLORS.white : COLORS.textMuted }]}>
                    {idx + 1}
                  </Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exName}</Text>
                  <Text style={styles.exerciseSets}>{setsReps}</Text>
                </View>
                <Text style={[styles.exerciseStatus, { color: isFirst ? COLORS.primary : COLORS.textMuted }]}>
                  {isFirst ? 'Next' : 'Queued'}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Assigned Coach Card */}
      {coachSession ? (
        <View style={styles.coachCard}>
          <View style={styles.coachLeft}>
            <View style={styles.coachAvatar}>
              <Text style={styles.coachAvatarText}>{coachName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.coachTag}>Personal Coach</Text>
              <Text style={styles.coachName}>{coachName}</Text>
              <Text style={styles.coachTime}>Session: {coachTime}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.chatCoachBtn}
            onPress={handleCallCoach}
            activeOpacity={0.8}
          >
            <Text style={styles.chatCoachText}>{coachPhone ? 'Call' : 'Coach'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.coachCard}>
          <View style={styles.coachLeft}>
            <View style={styles.coachAvatar}>
              <Ionicons name="fitness" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.coachTag}>Personal Coaching</Text>
              <Text style={styles.coachName}>Book a Certified Trainer</Text>
              <Text style={styles.coachTime}>1-on-1 guidance & custom splits</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.chatCoachBtn}
            onPress={() => onNavigateTab('training', 'training')}
            activeOpacity={0.8}
          >
            <Text style={styles.chatCoachText}>Book</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QR Code Entry Pass Modal */}
      {qrVisible && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={closeQr}
        >
          <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={closeQr}>
            <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
              <View style={styles.modalCardHeader}>
                <Text style={styles.modalHeading}>Digital Gym Entry Pass</Text>
                <TouchableOpacity onPress={closeQr} style={styles.modalCloseIconBtn}>
                  <Ionicons name="close" size={20} color={COLORS.textMedium} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSub}>Scan this barcode at reception or turnstile</Text>

              <View style={styles.qrFrame}>
                <Ionicons name="qr-code" size={160} color={COLORS.textDark} />
              </View>

              <Text style={styles.passUserName}>{user?.name || 'Customer'}</Text>
              <Text style={styles.passType}>{memberTier} • Verified</Text>
              <Text style={styles.passId}>ID: {String(memberPassId).slice(-12).toUpperCase()}</Text>

              <TouchableOpacity style={styles.closeModalBtn} onPress={closeQr} activeOpacity={0.8}>
                <Text style={styles.closeModalText}>Close Pass</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 110 },
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  badgeText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakText: { color: '#FBBF24', fontSize: 10, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  sub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  qrBtn: {
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  qrBtnText: { fontSize: 9, fontWeight: '800', color: COLORS.primary, marginTop: 2 },
  bannerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  sessionTime: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  startWorkoutText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  metricVal: { fontSize: 16, fontWeight: '800', color: COLORS.textDark, marginTop: 4 },
  metricSub: { fontSize: 10, color: COLORS.textMuted, fontWeight: '400' },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.background,
    borderRadius: 2,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  progressNote: { fontSize: 10, color: COLORS.textMuted },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  viewAllText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  exerciseItemActive: { backgroundColor: '#FFFAF5', borderRadius: 12 },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNum: { fontSize: 11, fontWeight: '700' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  exerciseSets: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  exerciseStatus: { fontSize: 10, fontWeight: '700' },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  coachLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  coachAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachAvatarText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  coachTag: { fontSize: 9, color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase' },
  coachName: { fontSize: 13, fontWeight: '700', color: COLORS.white, marginTop: 1 },
  coachTime: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  chatCoachBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  chatCoachText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
  },
  modalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  modalHeading: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  modalCloseIconBtn: { padding: 4 },
  modalSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, marginBottom: 16 },
  qrFrame: {
    padding: 14,
    backgroundColor: COLORS.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
  },
  passUserName: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  passType: { fontSize: 12, color: COLORS.primary, fontWeight: '700', marginTop: 2 },
  passId: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, letterSpacing: 1 },
  closeModalBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  closeModalText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
});
