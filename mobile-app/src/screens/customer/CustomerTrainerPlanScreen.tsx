import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';

export const CustomerTrainerPlanScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [planData, setPlanData] = useState<any>(null);

  const fetchTrainerPlan = useCallback(async () => {
    try {
      const res = await api.get('/trainer-plans/customer');
      if (res.data?.plan || res.data?.requests || res.data) {
        setPlanData(res.data.plan || (res.data.requests ? res.data.requests[0] : res.data));
      }
    } catch (err) {
      console.log('[CustomerTrainerPlan] Fetch note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainerPlan();
  }, [fetchTrainerPlan]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrainerPlan();
  };

  const coachName = planData?.trainerId?.name || planData?.trainerName || 'Assigned Coach';
  const planTitle = planData?.title || planData?.fitnessGoal || 'Personalized Coaching Routine';
  const coachNotes = planData?.trainerFeedback || planData?.notes || planData?.guidance || 
    'Focus on form, maintain consistent hydration, and hit your protein target.';

  const splitDays: any[] = planData?.days || planData?.weeklyPlan || [
    { day: 'Day 1 • Monday', split: 'Push Power (Chest, Delts, Triceps)', exercises: '6 exercises • 70 min', status: 'Active' },
    { day: 'Day 2 • Tuesday', split: 'Pull Strength (Lats, Traps, Biceps)', exercises: '6 exercises • 65 min', status: 'Scheduled' },
    { day: 'Day 3 • Wednesday', split: 'Legs & Core Overload', exercises: '7 exercises • 75 min', status: 'Scheduled' },
    { day: 'Day 4 • Thursday', split: 'Active Recovery & Mobility', exercises: 'Stretching & Light Walk', status: 'Scheduled' },
    { day: 'Day 5 • Friday', split: 'Upper Hypertrophy Split', exercises: '6 exercises • 60 min', status: 'Scheduled' },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Coach Header Card */}
      <View style={styles.coachCard}>
        <View style={styles.coachRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{coachName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.coachInfo}>
            <View style={styles.pillRow}>
              <Text style={styles.coachTag}>1-on-1 Assigned Coach</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>
                  {planData?.status ? `Status: ${planData.status}` : 'Active Plan'}
                </Text>
              </View>
            </View>
            <Text style={styles.coachName}>{coachName}</Text>
            <Text style={styles.planTitle}>{planTitle}</Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <View style={styles.noteHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.primary} />
            <Text style={styles.noteTitle}>Coach's Guidance & Focus</Text>
          </View>
          <Text style={styles.noteText}>"{coachNotes}"</Text>
        </View>
      </View>

      {/* Routine Split */}
      <Text style={styles.sectionTitle}>Weekly Training Split</Text>

      {loading && !refreshing ? (
        <View style={{ paddingVertical: 30, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading training schedule...</Text>
        </View>
      ) : (
        <View style={styles.splitList}>
          {splitDays.map((p: any, idx: number) => {
            const isToday = idx === 0;
            const dayTitle = p.day || p.name || `Day ${idx + 1}`;
            const routineDesc = p.split || p.focus || (p.exercises?.length ? `${p.exercises.length} exercises` : 'Scheduled Routine');
            const meta = p.exercises && typeof p.exercises === 'string' ? p.exercises : (p.duration ? `${p.duration} mins` : 'Floor Workout');

            return (
              <View 
                key={idx} 
                style={[
                  styles.planCard, 
                  isToday && styles.planCardActive
                ]}
              >
                <View style={styles.planCardLeft}>
                  <View style={[styles.dayDot, isToday && { backgroundColor: COLORS.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dayText}>{dayTitle}</Text>
                    <Text style={styles.splitText}>{routineDesc}</Text>
                    <Text style={styles.exerciseMeta}>{meta}</Text>
                  </View>
                </View>

                <View style={[styles.statusBadge, isToday && styles.statusBadgeActive]}>
                  <Text style={[styles.statusBadgeText, isToday && styles.statusBadgeTextActive]}>
                    {isToday ? 'Today' : (p.status || 'Scheduled')}
                  </Text>
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
  content: { padding: 16, paddingBottom: 110 },
  coachCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  coachRow: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  coachInfo: { flex: 1 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  coachTag: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  activeBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  activeBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.primaryDark },
  coachName: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  planTitle: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  noteBox: {
    backgroundColor: '#FFFAF5',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  noteTitle: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  noteText: { fontSize: 11, color: COLORS.textDark, lineHeight: 16, fontStyle: 'italic' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 12 },
  splitList: { gap: 10 },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  planCardActive: { borderColor: COLORS.primary, backgroundColor: '#FFFAF5' },
  planCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 8 },
  dayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.cardBorder },
  dayText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  splitText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark, marginTop: 2 },
  exerciseMeta: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusBadgeActive: { backgroundColor: COLORS.primaryLight },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.textMedium },
  statusBadgeTextActive: { color: COLORS.primaryDark },
});
