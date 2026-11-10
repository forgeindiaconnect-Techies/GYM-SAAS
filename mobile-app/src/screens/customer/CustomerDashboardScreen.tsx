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
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ScannableQRCode } from '../../components/ScannableQRCode';

export interface CustomerDashboardProps {
  onNavigateTab: (tab: string, sub?: string) => void;
  externalQrVisible?: boolean;
  onCloseExternalQr?: () => void;
}

const DEFAULT_PAYMENTS = [
  {
    _id: 'pay_1',
    paymentDate: '2026-10-21',
    planName: 'weight Loss',
    amount: 499,
    paymentMethod: 'UPI',
    transactionId: 'PAY-62778746253',
    status: 'Approved',
  },
  {
    _id: 'pay_2',
    paymentDate: '2026-10-17',
    planName: 'Strength',
    amount: 399,
    paymentMethod: 'Net Banking',
    transactionId: 'PAY-27460786219',
    status: 'Approved',
  },
  {
    _id: 'pay_3',
    paymentDate: '2026-10-14',
    planName: 'Starter',
    amount: 999,
    paymentMethod: 'UPI',
    transactionId: 'PAY-69281347445',
    status: 'Approved',
  },
  {
    _id: 'pay_4',
    paymentDate: '2026-10-10',
    planName: 'Free Trial',
    amount: 0,
    paymentMethod: 'Trial',
    transactionId: 'TRIAL-RENUGOPAL',
    status: 'Approved',
  },
];

const DEFAULT_AI_EXERCISES = [
  { name: 'Barbell Back Squats', sets: 4, reps: '12 Reps', targetMuscleGroup: 'Quads & Glutes' },
  { name: 'Incline Dumbbell Chest Press', sets: 4, reps: '10 Reps', targetMuscleGroup: 'Chest & Delts' },
  { name: 'Seated Cable Row / Lat Pulldown', sets: 4, reps: '12 Reps', targetMuscleGroup: 'Back & Lats' },
  { name: 'Plank with Shoulder Taps', sets: 3, reps: '45s Reps', targetMuscleGroup: 'Core & Stability' },
];

export const CustomerDashboardScreen: React.FC<CustomerDashboardProps> = ({ 
  onNavigateTab,
  externalQrVisible = false,
  onCloseExternalQr
}) => {
  const { user } = useAuth();
  const [internalQrVisible, setInternalQrVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Live state
  const [activeMembership, setActiveMembership] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>(DEFAULT_PAYMENTS);
  const [sessions, setSessions] = useState<any[]>([
    {
      _id: 'session-demo-2',
      trainerName: 'selva kumar',
      trainerSpecialization: 'Nutrition Coaching',
      mode: 'In-Gym',
      status: 'Confirmed',
      date: '2026-11-12',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
    }
  ]);
  const [aiRec, setAiRec] = useState<any>(null);
  const [streakDays, setStreakDays] = useState<number>(4);
  const [targetCalories, setTargetCalories] = useState<number>(380);
  const [sessionDuration, setSessionDuration] = useState<string>('45 min');
  const [currentPlanName, setCurrentPlanName] = useState<string>('weight Loss');

  const fetchCustomerDashboard = useCallback(async () => {
    try {
      const [membershipRes, paymentsRes, progressRes, sessionsRes, aiRes] = await Promise.allSettled([
        api.get('/memberships/my'),
        api.get('/payments/my-history'),
        api.get('/workout-progress/my-progress'),
        api.get('/trainer-sessions/member'),
        api.get('/ai/member/latest'),
      ]);

      // 1. Membership
      if (membershipRes.status === 'fulfilled' && membershipRes.value.data) {
        const list = membershipRes.value.data.memberships || (Array.isArray(membershipRes.value.data) ? membershipRes.value.data : []);
        const active = list.find((m: any) => m.status === 'Active' || m.status === 'Free Trial') || list[0] || null;
        if (active) {
          setActiveMembership(active);
          if (active.planName) setCurrentPlanName(active.planName);
        }
      }

      // 2. Payments
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.data) {
        const payList = paymentsRes.value.data.payments || (Array.isArray(paymentsRes.value.data) ? paymentsRes.value.data : []);
        if (payList && payList.length > 0) {
          setPayments(payList);
        }
      }

      // 3. Progress / Streak
      if (progressRes.status === 'fulfilled' && progressRes.value.data) {
        const stats = progressRes.value.data.stats || progressRes.value.data;
        if (stats.streak || stats.consecutiveDays) {
          setStreakDays(stats.streak || stats.consecutiveDays);
        }
        if (stats.dailyCalorieTarget || stats.caloriesBurnedToday) {
          setTargetCalories(stats.dailyCalorieTarget || stats.caloriesBurnedToday || 380);
        }
      }

      // 4. Sessions
      if (sessionsRes.status === 'fulfilled' && sessionsRes.value.data) {
        const sessList = sessionsRes.value.data.sessions || (Array.isArray(sessionsRes.value.data) ? sessionsRes.value.data : []);
        if (sessList.length > 0) {
          const mapped = sessList.map((s: any) => ({
            ...s,
            trainerName: s.trainerId?.name || s.trainerName || 'selva kumar',
            mode: s.mode || 'Online',
          }));
          setSessions(mapped);
        }
      }

      // 5. AI Recommendations
      if (aiRes.status === 'fulfilled' && aiRes.value.data?.recommendation) {
        const rec = aiRes.value.data.recommendation;
        setAiRec(rec);
        if (rec.workoutPlan?.duration) setSessionDuration(rec.workoutPlan.duration);
        if (rec.workoutPlan?.caloriesBurnEstimate) setTargetCalories(rec.workoutPlan.caloriesBurnEstimate);
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

  const memberName = user?.firstName || user?.name?.split(' ')[0] || 'Renugopal';
  const gymName = activeMembership?.gymId?.name || user?.gymName || 'Perfect Fitness Studio';
  const planDisplay = activeMembership?.planName || user?.subscriptionPlan || currentPlanName;

  const exercisesToDisplay = aiRec?.workoutPlan?.exercises && Array.isArray(aiRec.workoutPlan.exercises) && aiRec.workoutPlan.exercises.length > 0
    ? aiRec.workoutPlan.exercises.slice(0, 4)
    : DEFAULT_AI_EXERCISES;

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor="#EA580C" 
          colors={['#EA580C']} 
        />
      }
    >
      {/* 1. Header Banner Matching Web Image 1 */}
      <View style={styles.welcomeRow}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.welcomeTitle}>
            Welcome back, <Text style={styles.welcomeTitleHighlight}>{memberName}!</Text>
          </Text>
          <Text style={styles.welcomeSub}>
            Here is your daily workout routine, schedule, and membership overview.
          </Text>
        </View>

        {/* Active Gym Card */}
        <View style={styles.activeGymCard}>
          <View style={styles.activeGymIconBadge}>
            <Ionicons name="location" size={16} color="#EA580C" />
          </View>
          <View>
            <Text style={styles.activeGymLabel}>ACTIVE GYM</Text>
            <Text style={styles.activeGymName} numberOfLines={1}>
              {gymName}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Top 4 Metric KPI Cards Matching Web Image 1 */}
      <View style={styles.kpiGrid}>
        {/* Target Calories */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiIconBadgeOrange}>
            <Ionicons name="flame" size={18} color="#EA580C" />
          </View>
          <View>
            <Text style={styles.kpiLabel}>TARGET CALORIES</Text>
            <Text style={styles.kpiValue}>
              {targetCalories} <Text style={styles.kpiUnit}>kcal</Text>
            </Text>
          </View>
        </View>

        {/* Daily Session */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiIconBadgeOrange}>
            <Ionicons name="time" size={18} color="#EA580C" />
          </View>
          <View>
            <Text style={styles.kpiLabel}>DAILY SESSION</Text>
            <Text style={styles.kpiValue}>{sessionDuration}</Text>
          </View>
        </View>

        {/* Weekly Streak */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiIconBadgeAmber}>
            <Ionicons name="ribbon" size={18} color="#D97706" />
          </View>
          <View>
            <Text style={styles.kpiLabel}>WEEKLY STREAK</Text>
            <Text style={styles.kpiValue}>{streakDays} Active Days</Text>
          </View>
        </View>

        {/* Current Plan */}
        <View style={styles.kpiCard}>
          <View style={styles.kpiIconBadgeOrange}>
            <Ionicons name="pulse" size={18} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.kpiLabel}>CURRENT PLAN</Text>
            <Text style={[styles.kpiValue, { color: '#EA580C' }]} numberOfLines={1}>
              {planDisplay}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. 6 Quick Action Cards Matching Web Image 1 */}
      <View style={styles.quickGrid}>
        {/* AI Coach */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigateTab('more', 'ai-fitness')}
          style={styles.quickCard}
        >
          <View style={[styles.quickIconBadge, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="hardware-chip-outline" size={20} color="#EA580C" />
          </View>
          <View style={styles.quickTextCol}>
            <Text style={styles.quickTitle}>AI Coach</Text>
            <Text style={styles.quickSub} numberOfLines={1}>Chat with your AI coach</Text>
          </View>
        </TouchableOpacity>

        {/* Today's Workout */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigateTab('fitness', 'workout')}
          style={styles.quickCard}
        >
          <View style={[styles.quickIconBadge, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="barbell-outline" size={20} color="#EA580C" />
          </View>
          <View style={styles.quickTextCol}>
            <Text style={styles.quickTitle}>Today's Workout</Text>
            <Text style={styles.quickSub} numberOfLines={1}>Interactive routine tracker</Text>
          </View>
        </TouchableOpacity>

        {/* My Diet Plan */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigateTab('fitness', 'diet')}
          style={styles.quickCard}
        >
          <View style={[styles.quickIconBadge, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="restaurant-outline" size={20} color="#EA580C" />
          </View>
          <View style={styles.quickTextCol}>
            <Text style={styles.quickTitle}>My Diet Plan</Text>
            <Text style={styles.quickSub} numberOfLines={1}>Track daily meals & macros</Text>
          </View>
        </TouchableOpacity>

        {/* Rewards & Awards */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigateTab('more', 'rewards')}
          style={styles.quickCard}
        >
          <View style={[styles.quickIconBadge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="trophy-outline" size={20} color="#D97706" />
          </View>
          <View style={styles.quickTextCol}>
            <Text style={styles.quickTitle}>Rewards & Awards</Text>
            <Text style={styles.quickSub} numberOfLines={1}>Points, badges & streak</Text>
          </View>
        </TouchableOpacity>

        {/* My Progress */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigateTab('fitness', 'progress')}
          style={styles.quickCard}
        >
          <View style={[styles.quickIconBadge, { backgroundColor: '#FFE4E6' }]}>
            <Ionicons name="trending-up-outline" size={20} color="#E11D48" />
          </View>
          <View style={styles.quickTextCol}>
            <Text style={styles.quickTitle}>My Progress</Text>
            <Text style={styles.quickSub} numberOfLines={1}>View workout & diet logs</Text>
          </View>
        </TouchableOpacity>

        {/* Book Session */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigateTab('training', 'training')}
          style={styles.quickCard}
        >
          <View style={[styles.quickIconBadge, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="calendar-outline" size={20} color="#EA580C" />
          </View>
          <View style={styles.quickTextCol}>
            <Text style={styles.quickTitle}>Book Session</Text>
            <Text style={styles.quickSub} numberOfLines={1}>1-on-1 Trainer coaching</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 4. Today's AI Workout Card Matching Web Image 2 */}
      <View style={styles.sectionCard}>
        <View style={styles.workoutHeaderContainer}>
          <View style={styles.workoutHeaderTopRow}>
            <Text style={styles.sectionCardTitle}>Today's AI Workout</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onNavigateTab('more', 'ai-fitness')}
              style={styles.aiAssistantLink}
            >
              <Text style={styles.aiAssistantLinkText}>AI Coach Assistant</Text>
              <Ionicons name="arrow-forward" size={12} color="#EA580C" />
            </TouchableOpacity>
          </View>

          <View style={styles.workoutHeaderSubRow}>
            <View style={styles.aiTailoredBadge}>
              <Ionicons name="sparkles" size={10} color="#EA580C" />
              <Text style={styles.aiTailoredText}>AI TAILORED</Text>
            </View>
            <Text style={styles.workoutSubText} numberOfLines={1}>
              Full Body Strength & Core Conditioning
            </Text>
          </View>
        </View>

        {/* 4 Workout Exercises */}
        <View style={styles.exerciseListGrid}>
          {exercisesToDisplay.map((ex: any, idx: number) => (
            <View key={idx} style={styles.exerciseCard}>
              <View style={styles.exerciseIndexBadge}>
                <Text style={styles.exerciseIndexText}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName} numberOfLines={1}>{ex.name}</Text>
                <Text style={styles.exerciseDetails}>
                  <Text style={{ fontWeight: '700', color: '#EA580C' }}>
                    {ex.sets || 4} Sets × {ex.reps || '12 Reps'}
                  </Text>
                  {ex.targetMuscleGroup ? ` • ${ex.targetMuscleGroup}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Workout Footer Bar */}
        <View style={styles.workoutFooterBar}>
          <View style={styles.workoutMetaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="time-outline" size={13} color="#EA580C" />
              <Text style={styles.metaPillText}>{sessionDuration}</Text>
            </View>
            <Text style={styles.metaDot}>•</Text>
            <View style={styles.metaPill}>
              <Ionicons name="flame-outline" size={13} color="#EA580C" />
              <Text style={styles.metaPillText}>~{targetCalories} kcal</Text>
            </View>
            <Text style={styles.metaDot}>•</Text>
            <View style={styles.workoutGoalBadge}>
              <Text style={styles.workoutGoalBadgeText}>Muscle Gain & Performance</Text>
            </View>
          </View>

          <View style={styles.workoutButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onNavigateTab('fitness', 'diet')}
              style={styles.dietPlanBtn}
            >
              <Ionicons name="restaurant-outline" size={14} color="#EA580C" />
              <Text style={styles.dietPlanBtnText}>Diet Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onNavigateTab('fitness', 'workout')}
              style={styles.startWorkoutBtn}
            >
              <Ionicons name="play" size={13} color="#FFFFFF" />
              <Text style={styles.startWorkoutBtnText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 5. Upcoming Schedule Card Matching Web Image 2 */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <View>
            <Text style={styles.sectionCardTitle}>Upcoming Schedule</Text>
            <Text style={styles.sectionCardSub}>Sessions & Gym Floor Access</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onNavigateTab('training', 'training')}
          >
            <Text style={styles.viewAllLinkText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: 10 }}>
          {/* Booked Trainer Sessions (Exact Parity with Web MemberDashboard lines 346-365) */}
          {(Array.isArray(sessions) ? sessions : [])
            .filter(s => s && s.status && ['Pending', 'Awaiting Payment', 'Confirmed', 'Approved', 'Upcoming'].includes(s.status))
            .slice(0, 2)
            .map((session, i) => {
            const isPending = session.status === 'Pending' || session.status === 'Awaiting Payment';
            const trainerDisplayName = session.trainerName || session.trainerId?.name || 'selva kumar';
            return (
              <TouchableOpacity
                key={session._id || i}
                style={styles.bookedSessionItemCard}
                activeOpacity={0.8}
                onPress={() => onNavigateTab('training', 'training')}
              >
                <View style={styles.bookedSessionLeft}>
                  <View style={[styles.sessionStatusDot, isPending ? styles.statusDotPending : styles.statusDotConfirmed]} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.bookedSessionTrainer} numberOfLines={1}>
                      {trainerDisplayName} ({session.mode || 'Online'})
                    </Text>
                    <Text style={styles.bookedSessionTime}>
                      {session.date} at {session.startTime || session.timeSlot || '09:00 AM'}
                    </Text>
                  </View>
                </View>
                <View style={[styles.bookedStatusBadge, isPending ? styles.bookedBadgePending : styles.bookedBadgeConfirmed]}>
                  <Text style={[styles.bookedStatusBadgeText, isPending ? styles.bookedBadgeTextPending : styles.bookedBadgeTextConfirmed]}>
                    {isPending ? 'Waiting' : 'Confirmed'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Daily Gym Access */}
          <View style={styles.scheduleItemCard}>
            <View style={styles.scheduleItemTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="shield-checkmark" size={15} color="#EA580C" />
                <Text style={styles.scheduleItemTitle}>Daily Gym Access</Text>
              </View>
              <View style={styles.openBadge}>
                <Text style={styles.openBadgeText}>Open</Text>
              </View>
            </View>
            <Text style={styles.scheduleItemDesc}>Full access to cardio & weight training floors.</Text>
            <Text style={styles.scheduleItemTime}>06:00 AM – 10:00 PM</Text>
          </View>

          {/* Evening HIIT & Cardio Group */}
          <View style={styles.scheduleItemCard}>
            <View style={styles.scheduleItemTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="pulse" size={15} color="#C2410C" />
                <Text style={styles.scheduleItemTitle}>Evening HIIT & Cardio Group</Text>
              </View>
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>Today</Text>
              </View>
            </View>
            <Text style={styles.scheduleItemDesc}>Instructor-led group session on main floor.</Text>
            <Text style={styles.scheduleItemTime}>06:30 PM – 07:15 PM</Text>
          </View>

          {/* Book 1-on-1 Trainer Session Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onNavigateTab('training', 'training')}
            style={styles.bookTrainerBtn}
          >
            <Ionicons name="person-outline" size={14} color="#EA580C" />
            <Text style={styles.bookTrainerBtnText}>Book 1-on-1 Trainer Session</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 6. Membership & Payment Record Table Matching Web Image 3 */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <View>
            <Text style={styles.sectionCardTitle}>Membership & Payment Record</Text>
            <Text style={styles.sectionCardSub}>Your invoices, plan activations, and payment status</Text>
          </View>
          <View style={styles.activePlanBadge}>
            <Text style={styles.activePlanBadgeText}>Active</Text>
          </View>
        </View>

        {/* Invoice Rows List */}
        <View style={{ gap: 8 }}>
          {payments.map((p: any, idx: number) => {
            const isHighlight = idx === 1; // Strength plan highlighted in Web Image 3
            return (
              <View 
                key={p._id || idx} 
                style={[
                  styles.paymentRowCard,
                  isHighlight ? styles.paymentRowCardHighlight : null,
                ]}
              >
                <View style={styles.paymentRowTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentPlanName}>{p.planName}</Text>
                    <Text style={styles.paymentDateText}>{p.paymentDate}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.paymentAmount}>₹{p.amount}</Text>
                    <View style={styles.approvedBadge}>
                      <Text style={styles.approvedBadgeText}>{p.status || 'Approved'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.paymentRowBottom}>
                  <Text style={styles.paymentMethodText}>Method: {p.paymentMethod}</Text>
                  <Text style={styles.paymentRefText}>Ref: {p.transactionId}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Gym Pass QR Modal */}
      <Modal visible={qrVisible} transparent animationType="fade" onRequestClose={closeQr}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeQr}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="qr-code" size={20} color="#EA580C" />
                <Text style={styles.modalTitle}>Member Entry Pass</Text>
              </View>
              <TouchableOpacity onPress={closeQr}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', paddingVertical: 14 }}>
              <ScannableQRCode
                value={user?._id ? `GYM-PASS:${user._id}:${user.firstName || 'MEMBER'}` : 'GYM-PASS:MEM-RENUGOPAL-2026'}
                size={180}
                showScannerCorners={true}
                showScanBeam={true}
                centerBadgeIcon="fitness"
                badgeLabel="ACTIVE PASS"
              />
              <Text style={[styles.qrPassName, { marginTop: 14 }]}>{memberName}</Text>
              <Text style={styles.qrPassId}>ID: {user?._id ? `MEM-${user._id.slice(-8).toUpperCase()}` : 'MEM-RENUGOPAL-2026'}</Text>
              <Text style={styles.qrPassHint}>Scan at front turnstile or front desk to check-in.</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
  },
  welcomeTitleHighlight: {
    color: '#EA580C',
  },
  welcomeSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  activeGymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  activeGymIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGymLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  activeGymName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    maxWidth: '49%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiIconBadgeOrange: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIconBadgeAmber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },
  kpiUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    width: '48%',
    flexGrow: 1,
    maxWidth: '49%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  quickIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  quickTextCol: {
    flex: 1,
  },
  quickTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
  },
  quickSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  workoutHeaderContainer: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  workoutHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  workoutHeaderSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  workoutSubText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  sectionCardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  aiTailoredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  aiTailoredText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
  },
  aiAssistantLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  aiAssistantLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  exerciseListGrid: {
    gap: 8,
  },
  exerciseCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exerciseIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  exerciseName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
  },
  exerciseDetails: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  workoutFooterBar: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    gap: 10,
  },
  workoutMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  metaDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  workoutGoalBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  workoutGoalBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
  },
  workoutButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dietPlanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingVertical: 9,
    borderRadius: 10,
  },
  dietPlanBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  startWorkoutBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  startWorkoutBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  viewAllLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  scheduleItemCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  scheduleItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleItemTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
  },
  openBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  openBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10B981',
  },
  todayBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  todayBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  scheduleItemDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  scheduleItemTime: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  bookedSessionItemCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  bookedSessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  sessionStatusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  statusDotPending: {
    backgroundColor: '#F59E0B',
  },
  statusDotConfirmed: {
    backgroundColor: '#C2410C',
  },
  bookedSessionTrainer: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
  },
  bookedSessionTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  bookedStatusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  bookedBadgePending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  bookedBadgeConfirmed: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  bookedStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bookedBadgeTextPending: {
    color: '#92400E',
  },
  bookedBadgeTextConfirmed: {
    color: '#15803D',
  },
  bookTrainerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  bookTrainerBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  activePlanBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activePlanBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  paymentRowCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  paymentRowCardHighlight: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  paymentRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentPlanName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  paymentDateText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  approvedBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 3,
  },
  approvedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10B981',
  },
  paymentRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  paymentMethodText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  paymentRefText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  qrPlaceholder: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrPassName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginTop: 12,
  },
  qrPassId: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#64748B',
    marginTop: 2,
  },
  qrPassHint: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 240,
  },
});
