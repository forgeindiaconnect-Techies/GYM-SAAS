import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

type ProgressTab = 'workout' | 'diet';

export const CustomerProgressTrackingScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProgressTab>('workout');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDayInspect, setSelectedDayInspect] = useState<any | null>(null);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Workout Days Progress Matching Web Page 9
  const workoutDays = [
    { day: 'Monday', percent: 20, routine: 'Chest, Shoulders & Triceps Strength', done: '1 / 5 Exercises' },
    { day: 'Tuesday', percent: 20, routine: 'Back & Bicep Hypertrophy', done: '1 / 5 Exercises' },
    { day: 'Wednesday', percent: 0, routine: 'Active Recovery & Functional Mobility', done: '0 / 4 Exercises' },
    { day: 'Thursday', percent: 0, routine: 'Legs, Posterior Chain & Glutes', done: '0 / 5 Exercises' },
    { day: 'Friday', percent: 0, routine: 'Hypertrophy & Arm Sculpting', done: '0 / 4 Exercises' },
    { day: 'Saturday', percent: 100, routine: 'Conditioning, HIIT & Core Burn', done: '4 / 4 Exercises' },
    { day: 'Sunday', percent: 0, routine: 'Rest, Regeneration & Mobility Flow', done: '0 / 3 Exercises' },
  ];

  // Completed Exercise Logs Matching Web Page 10
  const exerciseLogs = [
    { id: '1', name: 'Russian Twists', details: 'Saturday • 3 Sets completed • 2s elapsed', status: 'COMPLETED', date: 'Oct 17, 12:03 PM' },
    { id: '2', name: 'Mountain Climbers & Plank Hold', details: 'Saturday • 3 Sets completed • 60s elapsed', status: 'COMPLETED', date: 'Oct 17, 12:03 PM' },
    { id: '3', name: 'Bodyweight Jump Squats', details: 'Saturday • 3 Sets completed • 8s elapsed', status: 'COMPLETED', date: 'Oct 17, 12:03 PM' },
    { id: '4', name: 'Kettlebell Swings / Deadlifts', details: 'Saturday • 4 Sets completed • 3s elapsed', status: 'COMPLETED', date: 'Oct 17, 12:02 PM' },
  ];

  // Diet Days Progress Matching Web Page 11
  const dietDays = [
    { day: 'Monday', percent: 0, focus: 'Lean Muscle & Metabolic Activation', done: '0 / 6 Meals' },
    { day: 'Tuesday', percent: 0, focus: 'Strength Fuel & High-Fiber Endurance', done: '0 / 6 Meals' },
    { day: 'Wednesday', percent: 0, focus: 'Cellular Repair & Anti-Inflammatory Nut...', done: '0 / 6 Meals' },
    { day: 'Thursday', percent: 0, focus: 'Lean Carb Cycling & Sustained Energy', done: '0 / 6 Meals' },
    { day: 'Friday', percent: 0, focus: 'Peak Performance & Glycogen Replenis...', done: '0 / 6 Meals' },
    { day: 'Saturday', percent: 100, focus: 'Weekend Vitality & Clean Refuel', done: '6 / 6 Meals' },
    { day: 'Sunday', percent: 0, focus: 'Gut Reset & Active Recovery Nutrition', done: '0 / 6 Meals' },
  ];

  // Completed Meal Logs Matching Web Page 11 Bottom
  const mealLogs = [
    { id: 'm-1', name: 'Saturday • Recovery Dinner', details: '530 kcal • 45g Protein • Grilled lemon-garlic jumbo shrimp with sweet potato', status: 'COMPLETED', date: 'Oct 22, 04:33 PM' },
    { id: 'm-2', name: 'Saturday • Evening / Pre-Workout Snack', details: '220 kcal • 15g Protein • Antioxidant green smoothie: baby spinach, green apple', status: 'COMPLETED', date: 'Oct 22, 04:33 PM' },
    { id: 'm-3', name: 'Saturday • High-Protein Lunch', details: '650 kcal • 50g Protein • Mediterranean grilled turkey patties wrapped in whole wheat pita', status: 'COMPLETED', date: 'Oct 22, 04:33 PM' },
    { id: 'm-4', name: 'Saturday • Mid-Morning Snack', details: '160 kcal • 10g Protein • 1 fresh orange + small handful of raw pumpkin seeds', status: 'COMPLETED', date: 'Oct 17, 12:40 PM' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* ======================================================== */}
      {/* 1. TOP SUB-TABS (Workout Plan | Diet Work Plan) */}
      {/* ======================================================== */}
      <View style={styles.topTabsBar}>
        <TouchableOpacity
          style={[styles.topTabBtn, activeTab === 'workout' && styles.topTabBtnActive]}
          onPress={() => setActiveTab('workout')}
          activeOpacity={0.7}
        >
          <Ionicons name="barbell-outline" size={14} color={activeTab === 'workout' ? '#EA580C' : '#64748B'} />
          <Text style={[styles.topTabBtnText, activeTab === 'workout' && styles.topTabBtnTextActive]}>
            Workout Plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topTabBtn, activeTab === 'diet' && styles.topTabBtnActive]}
          onPress={() => setActiveTab('diet')}
          activeOpacity={0.7}
        >
          <Ionicons name="nutrition-outline" size={14} color={activeTab === 'diet' ? '#EA580C' : '#64748B'} />
          <Text style={[styles.topTabBtnText, activeTab === 'diet' && styles.topTabBtnTextActive]}>
            Diet Work Plan
          </Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* TAB 1: WORKOUT PROGRESS (Matching Web Page 9 & 10) */}
      {/* ======================================================== */}
      {activeTab === 'workout' && (
        <View>
          {/* Header Card */}
          <View style={styles.headerBannerCard}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>PERSONAL WORKOUT PROGRESS • Live Training Tracker</Text>
            </View>
            <Text style={styles.headerTitle}>Workout Progress</Text>
            <Text style={styles.headerSubtitle}>
              Track your workout streak, completed animated exercises, sets, and training adherence.
            </Text>
          </View>

          {/* 4 KPIs Grid Matching Web Page 9 */}
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <Text style={styles.kpiLabel}>TOTAL WORKOUTS</Text>
                <Ionicons name="barbell" size={15} color="#EA580C" />
              </View>
              <Text style={styles.kpiVal}>3 sessions</Text>
              <Text style={styles.kpiSub}>0 workouts this week</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <Text style={styles.kpiLabel}>EXERCISES DONE</Text>
                <Ionicons name="checkmark-done" size={15} color="#16A34A" />
              </View>
              <Text style={styles.kpiVal}>30 completed</Text>
              <Text style={styles.kpiSub}>Across all plan routines</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <Text style={styles.kpiLabel}>WORKOUT STREAK</Text>
                <Ionicons name="flame" size={15} color="#F59E0B" />
              </View>
              <Text style={styles.kpiVal}>0 days streak</Text>
              <Text style={styles.kpiSub}>Keep consistency alive!</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <Text style={styles.kpiLabel}>TOTAL TIME</Text>
                <Ionicons name="time" size={15} color="#2563EB" />
              </View>
              <Text style={styles.kpiVal}>6 minutes</Text>
              <Text style={styles.kpiSub}>Logged training time</Text>
            </View>
          </View>

          {/* Plan Completion Banner */}
          <View style={styles.completionBanner}>
            <Text style={styles.completionTitle}>PLAN COMPLETION RATE</Text>
            <Text style={styles.completionVal}>21% of Assigned Plan Completed</Text>
            <View style={styles.completionBarBg}>
              <View style={[styles.completionBarFill, { width: '21%' }]} />
            </View>
          </View>

          {/* Day-Wise Breakdown Grid Matching Web Page 9 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Day-Wise Plan Completed Details</Text>
          </View>

          <View style={{ gap: 10 }}>
            {workoutDays.map((item, idx) => (
              <View key={idx} style={styles.dayProgressCard}>
                <View style={styles.dayProgressTop}>
                  <Text style={styles.dayProgressName}>{item.day}</Text>
                  <View style={[styles.dayPercentBadge, item.percent === 100 ? styles.percent100 : styles.percentPartial]}>
                    <Text style={[styles.dayPercentText, item.percent === 100 ? styles.percentText100 : styles.percentTextPartial]}>
                      {item.percent}% DONE
                    </Text>
                  </View>
                </View>

                <Text style={styles.dayRoutineName}>{item.routine}</Text>

                <View style={styles.dayProgressBottom}>
                  <Text style={styles.dayDoneCount}>{item.done}</Text>
                  <TouchableOpacity
                    style={styles.inspectBtn}
                    onPress={() => setSelectedDayInspect(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.inspectBtnText}>Inspect →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Completed Exercise Logs Matching Web Page 10 */}
          <View style={[styles.sectionHeader, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>Completed Exercise Logs</Text>
            <Text style={styles.sectionSub}>Chronological history of completed exercise animations and sets</Text>
          </View>

          <View style={{ gap: 10 }}>
            {exerciseLogs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logLeft}>
                  <Ionicons name="checkmark-circle" size={18} color="#EA580C" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.logName}>{log.name}</Text>
                    <Text style={styles.logDetails}>{log.details}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={styles.completedBadgeGreen}>
                    <Text style={styles.completedBadgeGreenText}>{log.status}</Text>
                  </View>
                  <Text style={styles.logDate}>{log.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DIET WORK PLAN PROGRESS (Matching Web Page 10 & 11) */}
      {/* ======================================================== */}
      {activeTab === 'diet' && (
        <View>
          {/* Header Card */}
          <View style={styles.headerBannerCard}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>NUTRITION & DIET PROGRESS • Live Meal Adherence</Text>
            </View>
            <Text style={styles.headerTitle}>Diet Work Plan Progress</Text>
            <Text style={styles.headerSubtitle}>
              Track your daily nutrition goals, completed meals, calorie intake, and macronutrient balance.
            </Text>
          </View>

          {/* 4 KPIs Grid Matching Web Page 10 */}
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <Text style={styles.kpiLabel}>MEALS COMPLETED</Text>
                <Ionicons name="restaurant" size={15} color="#EA580C" />
              </View>
              <Text style={styles.kpiVal}>6 / 42</Text>
              <Text style={styles.kpiSub}>14% adherence</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <Text style={styles.kpiLabel}>PENDING MEALS</Text>
                <Ionicons name="time" size={15} color="#F59E0B" />
              </View>
              <Text style={styles.kpiVal}>36 meals</Text>
              <Text style={styles.kpiSub}>Across 7-day nutrition cycle</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <Text style={styles.kpiLabel}>CALORIES LOGGED</Text>
                <Ionicons name="flame" size={15} color="#2563EB" />
              </View>
              <Text style={styles.kpiVal}>2,210 kcal</Text>
              <Text style={styles.kpiSub}>Total energy logged</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiTopRow}>
                <Text style={styles.kpiLabel}>PROTEIN INTAKE</Text>
                <Ionicons name="barbell" size={15} color="#16A34A" />
              </View>
              <Text style={styles.kpiVal}>155 grams</Text>
              <Text style={styles.kpiSub}>Muscle recovery macros</Text>
            </View>
          </View>

          {/* Completion Banner */}
          <View style={[styles.completionBanner, { backgroundColor: '#064E3B' }]}>
            <Text style={styles.completionTitle}>7-DAY NUTRITION & MACRO DIET PLAN</Text>
            <Text style={styles.completionVal}>14% of Assigned Diet Plan Completed</Text>
            <View style={styles.completionBarBg}>
              <View style={[styles.completionBarFill, { width: '14%', backgroundColor: '#10B981' }]} />
            </View>
          </View>

          {/* Day-Wise Breakdown Grid Matching Web Page 11 */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Day-Wise Diet Plan Completed Details</Text>
          </View>

          <View style={{ gap: 10 }}>
            {dietDays.map((item, idx) => (
              <View key={idx} style={styles.dayProgressCard}>
                <View style={styles.dayProgressTop}>
                  <Text style={styles.dayProgressName}>{item.day}</Text>
                  <View style={[styles.dayPercentBadge, item.percent === 100 ? styles.percent100 : styles.percentPartial]}>
                    <Text style={[styles.dayPercentText, item.percent === 100 ? styles.percentText100 : styles.percentTextPartial]}>
                      {item.percent}% DONE
                    </Text>
                  </View>
                </View>

                <Text style={styles.dayRoutineName}>{item.focus}</Text>

                <View style={styles.dayProgressBottom}>
                  <Text style={styles.dayDoneCount}>{item.done}</Text>
                  <TouchableOpacity
                    style={styles.inspectBtn}
                    onPress={() => setSelectedDayInspect(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.inspectBtnText}>Inspect →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Completed Meal Logs Matching Web Page 11 Bottom */}
          <View style={[styles.sectionHeader, { marginTop: 18 }]}>
            <Text style={styles.sectionTitle}>Completed Meal Logs</Text>
            <Text style={styles.sectionSub}>Chronological history of completed nutrition and meal intakes</Text>
          </View>

          <View style={{ gap: 10 }}>
            {mealLogs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logLeft}>
                  <Ionicons name="nutrition" size={18} color="#16A34A" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.logName}>{log.name}</Text>
                    <Text style={styles.logDetails}>{log.details}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={styles.completedBadgeGreen}>
                    <Text style={styles.completedBadgeGreenText}>{log.status}</Text>
                  </View>
                  <Text style={styles.logDate}>{log.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* INSPECT MODAL */}
      <Modal visible={!!selectedDayInspect} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedDayInspect?.day} Inspection</Text>
              <TouchableOpacity onPress={() => setSelectedDayInspect(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedDayInspect && (
              <View style={{ padding: 18 }}>
                <Text style={styles.inspectRoutineTitle}>{selectedDayInspect.routine || selectedDayInspect.focus}</Text>
                <Text style={styles.inspectStatus}>Completion: {selectedDayInspect.percent}% • {selectedDayInspect.done}</Text>

                <View style={styles.inspectDetailBox}>
                  <Text style={styles.inspectDetailLabel}>TRAINER VERIFICATION</Text>
                  <Text style={styles.inspectDetailText}>
                    Coach Naveen verified this day's routine for your Weight Loss program.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.inspectCloseBtn}
                  onPress={() => setSelectedDayInspect(null)}
                >
                  <Text style={styles.inspectCloseBtnText}>Close Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 14, paddingBottom: 100 },

  // Top Tabs Bar
  topTabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
    gap: 6,
  },
  topTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  topTabBtnActive: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  topTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  topTabBtnTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },

  // Header Card
  headerBannerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  tagBadge: {
    backgroundColor: '#FFF7ED',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  tagBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
  },

  // 4 KPIs Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  kpiVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginTop: 6,
  },
  kpiSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  // Completion Banner
  completionBanner: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  completionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  completionVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 10,
  },
  completionBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  completionBarFill: {
    height: '100%',
    backgroundColor: '#EA580C',
  },

  // Section Header
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  sectionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // Day Progress Cards
  dayProgressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  dayProgressTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayProgressName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  dayPercentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  percent100: {
    backgroundColor: '#DCFCE7',
  },
  percentPartial: {
    backgroundColor: '#F1F5F9',
  },
  dayPercentText: {
    fontSize: 10,
    fontWeight: '800',
  },
  percentText100: { color: '#15803D' },
  percentTextPartial: { color: '#64748B' },
  dayRoutineName: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 16,
  },
  dayProgressBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  dayDoneCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  inspectBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inspectBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },

  // Log Cards
  logCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  logDetails: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  completedBadgeGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedBadgeGreenText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  logDate: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  inspectRoutineTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  inspectStatus: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '700',
    marginTop: 4,
  },
  inspectDetailBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
  },
  inspectDetailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9A3412',
    marginBottom: 4,
  },
  inspectDetailText: {
    fontSize: 12,
    color: '#431407',
    lineHeight: 17,
  },
  inspectCloseBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  inspectCloseBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
