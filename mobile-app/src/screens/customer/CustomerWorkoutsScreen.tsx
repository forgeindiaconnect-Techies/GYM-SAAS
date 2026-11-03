import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';

export const CustomerWorkoutsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const fetchWorkoutPlan = useCallback(async () => {
    try {
      const res = await api.get('/workout-plans/my-plan');
      if (res.data?.plan || res.data) {
        setPlan(res.data.plan || res.data);
      }
    } catch (err) {
      console.log('[CustomerWorkouts] Plan load note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkoutPlan();
  }, [fetchWorkoutPlan]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkoutPlan();
  };

  const handleToggleLogSet = async (ex: any, idx: number) => {
    const exId = String(ex._id || idx);
    const isAlreadyDone = completedIds.has(exId);

    if (isAlreadyDone) {
      setCompletedIds(prev => {
        const next = new Set(prev);
        next.delete(exId);
        return next;
      });
      return;
    }

    try {
      await api.post('/workout-progress/log', {
        exerciseName: ex.name || ex.title || 'Exercise',
        sets: Number(ex.sets) || 3,
        reps: Number(ex.reps) || 10,
        weight: Number(ex.weight) || 0,
        completed: true,
      }).catch(() => {});

      setCompletedIds(prev => new Set(prev).add(exId));
      Alert.alert('Exercise Logged', `Logged set for ${ex.name || 'Exercise'}! Keep up the momentum.`);
    } catch (e) {
      setCompletedIds(prev => new Set(prev).add(exId));
    }
  };

  // Plan days
  const planDays: any[] = plan?.days && Array.isArray(plan.days) && plan.days.length > 0
    ? plan.days
    : [
        { day: 'Day 1', name: 'Push Focus', exercises: plan?.exercises || [] },
        { day: 'Day 2', name: 'Pull Focus', exercises: [] },
        { day: 'Day 3', name: 'Legs & Core', exercises: [] },
        { day: 'Day 4', name: 'Active Rest', exercises: [] },
        { day: 'Day 5', name: 'Upper Body', exercises: [] },
      ];

  const currentDay = planDays[selectedDayIndex] || planDays[0];
  const exercises: any[] = currentDay?.exercises || [];
  const routineTitle = currentDay?.name || currentDay?.day || plan?.name || 'Workout Session';

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
        <View style={styles.dayRow}>
          {planDays.map((d: any, idx: number) => {
            const isSelected = selectedDayIndex === idx;
            const dayLabel = d.day ? String(d.day).slice(0, 5) : `D${idx + 1}`;
            const subLabel = d.name ? String(d.name).split(' ')[0] : 'Split';

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.dayCard, isSelected && styles.dayCardActive]}
                onPress={() => setSelectedDayIndex(idx)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{dayLabel}</Text>
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{subLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Routine Header */}
      <View style={styles.routineHeader}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.routineTag}>
            {plan?.name ? `${plan.name} • ${currentDay?.day || 'Today'}` : 'Workout Program'}
          </Text>
          <Text style={styles.routineTitle}>{routineTitle}</Text>
          <Text style={styles.routineMeta}>
            {exercises.length} Exercises • {plan?.duration || '50 mins'} • Planned Split
          </Text>
        </View>
        <View style={styles.playBtn}>
          <Ionicons name="barbell" size={18} color={COLORS.white} />
        </View>
      </View>

      {/* Exercise Checklist */}
      <Text style={styles.sectionTitle}>Exercises Routine</Text>

      {loading && !refreshing ? (
        <View style={{ paddingVertical: 30, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading exercises...</Text>
        </View>
      ) : exercises.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="fitness-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Rest Day or Unassigned Split</Text>
          <Text style={styles.emptySub}>No exercises scheduled for this specific day split. Rest, hydrate & recover!</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {exercises.map((ex: any, idx: number) => {
            const exId = String(ex._id || idx);
            const isDone = completedIds.has(exId);
            const exName = ex.name || ex.title || 'Exercise Movement';
            const setsReps = ex.sets ? `${ex.sets} sets × ${ex.reps || 10} reps` : (ex.reps ? `${ex.reps} reps` : 'Target set');
            const targetWeight = ex.weight ? `${ex.weight} kg` : (ex.muscleGroup || ex.target || 'Bodyweight');

            return (
              <View key={exId} style={styles.card}>
                <View style={styles.exLeft}>
                  <View style={[styles.numBox, isDone && styles.numBoxDone]}>
                    {isDone ? (
                      <Ionicons name="checkmark" size={12} color={COLORS.emerald} />
                    ) : (
                      <Text style={styles.numText}>{idx + 1}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, paddingRight: 6 }}>
                    <Text style={[styles.exName, isDone && styles.strike]}>{exName}</Text>
                    <Text style={styles.exMeta}>
                      {setsReps} • <Text style={styles.bold}>{targetWeight}</Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.logBtn, isDone && styles.logBtnDone]}
                  onPress={() => handleToggleLogSet(ex, idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.logBtnText, isDone && styles.logBtnTextDone]}>
                    {isDone ? 'Done ✓' : 'Log Set'}
                  </Text>
                </TouchableOpacity>
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
  dayScroll: { marginBottom: 16 },
  dayRow: { flexDirection: 'row', gap: 8 },
  dayCard: {
    width: 60,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  dayCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayName: { fontSize: 11, fontWeight: '700', color: COLORS.textDark },
  dayNameActive: { color: COLORS.white },
  dayLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  dayLabelActive: { color: 'rgba(255,255,255,0.85)' },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  routineTag: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  routineTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginVertical: 3 },
  routineMeta: { fontSize: 11, color: COLORS.textMuted },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  exLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  numBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBoxDone: { backgroundColor: COLORS.emeraldLight },
  numText: { fontSize: 11, fontWeight: '700', color: COLORS.textDark },
  exName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  strike: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  exMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  bold: { fontWeight: '700', color: COLORS.textDark },
  logBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logBtnDone: { backgroundColor: COLORS.emeraldLight },
  logBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  logBtnTextDone: { color: COLORS.emerald },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginTop: 8 },
  emptySub: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
});
