import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const CustomerWorkoutsScreen: React.FC = () => {
  const [activeDay, setActiveDay] = useState('Mon');

  const days = [
    { day: 'Mon', label: 'Push' },
    { day: 'Tue', label: 'Pull' },
    { day: 'Wed', label: 'Legs' },
    { day: 'Thu', label: 'Rest' },
    { day: 'Fri', label: 'Arms' },
    { day: 'Sat', label: 'HIIT' },
    { day: 'Sun', label: 'Rest' },
  ];

  const exercises = [
    { id: '1', name: 'Barbell Flat Bench Press', sets: '4 sets × 10 reps', target: 'Chest', weight: '70 kg', done: true },
    { id: '2', name: 'Incline Dumbbell Press', sets: '3 sets × 12 reps', target: 'Upper Chest', weight: '24 kg', done: false },
    { id: '3', name: 'Cable Tricep Pushdown', sets: '4 sets × 15 reps', target: 'Triceps', weight: '32 kg', done: false },
    { id: '4', name: 'Overhead Dumbbell Extension', sets: '3 sets × 12 reps', target: 'Triceps Long Head', weight: '18 kg', done: false },
    { id: '5', name: 'Bodyweight Dips', sets: '3 sets to failure', target: 'Lower Chest', weight: 'BW', done: false },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
        <View style={styles.dayRow}>
          {days.map((d) => {
            const isSelected = activeDay === d.day;
            return (
              <TouchableOpacity
                key={d.day}
                style={[styles.dayCard, isSelected && styles.dayCardActive]}
                onPress={() => setActiveDay(d.day)}
              >
                <Text style={[styles.dayName, isSelected && styles.dayNameActive]}>{d.day}</Text>
                <Text style={[styles.dayLabel, isSelected && styles.dayLabelActive]}>{d.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Routine Header */}
      <View style={styles.routineHeader}>
        <View>
          <Text style={styles.routineTag}>Monday Workout Program</Text>
          <Text style={styles.routineTitle}>Chest & Triceps Hypertrophy</Text>
          <Text style={styles.routineMeta}>5 Exercises • 55 mins • 480 kcal</Text>
        </View>
        <TouchableOpacity style={styles.playBtn}>
          <Ionicons name="play" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Exercise Checklist */}
      <Text style={styles.sectionTitle}>Exercises Routine</Text>
      <View style={styles.list}>
        {exercises.map((ex, idx) => (
          <View key={ex.id} style={styles.card}>
            <View style={styles.exLeft}>
              <View style={[styles.numBox, ex.done && styles.numBoxDone]}>
                {ex.done ? (
                  <Ionicons name="checkmark" size={12} color={COLORS.emerald} />
                ) : (
                  <Text style={styles.numText}>{idx + 1}</Text>
                )}
              </View>
              <View>
                <Text style={[styles.exName, ex.done && styles.strike]}>{ex.name}</Text>
                <Text style={styles.exMeta}>{ex.sets} • <Text style={styles.bold}>{ex.weight}</Text></Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.logBtn, ex.done && styles.logBtnDone]}>
              <Text style={[styles.logBtnText, ex.done && styles.logBtnTextDone]}>
                {ex.done ? 'Done' : 'Log Set'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  dayScroll: { marginBottom: 16 },
  dayRow: { flexDirection: 'row', gap: 8 },
  dayCard: {
    width: 48,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  dayCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayName: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  dayNameActive: { color: COLORS.white },
  dayLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textDark, marginTop: 2 },
  dayLabelActive: { color: COLORS.white },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.darkBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  routineTag: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  routineTitle: { fontSize: 15, fontWeight: '800', color: COLORS.white, marginTop: 2 },
  routineMeta: { fontSize: 11, color: COLORS.textMuted, marginTop: 3 },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  exLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  numBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBoxDone: { backgroundColor: COLORS.emeraldLight },
  numText: { fontSize: 11, fontWeight: '800', color: COLORS.textMedium },
  exName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  strike: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  exMeta: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  bold: { color: COLORS.primary, fontWeight: '700' },
  logBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logBtnDone: { backgroundColor: COLORS.emeraldLight },
  logBtnText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  logBtnTextDone: { color: COLORS.emerald },
});

