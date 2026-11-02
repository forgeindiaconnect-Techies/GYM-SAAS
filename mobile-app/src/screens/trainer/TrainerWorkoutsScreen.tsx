import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const TrainerWorkoutsScreen: React.FC = () => {
  const routines = [
    { id: '1', title: 'Chest & Triceps Hypertrophy', target: 'Chest, Arms', moves: 6, duration: '60 mins', calories: '480 kcal', level: 'Advanced' },
    { id: '2', title: 'Full Body HIIT Conditioning', target: 'Cardio, Core', moves: 8, duration: '45 mins', calories: '520 kcal', level: 'Intermediate' },
    { id: '3', title: 'Legs & Glutes Power Split', target: 'Quads, Hamstrings', moves: 5, duration: '55 mins', calories: '550 kcal', level: 'Advanced' },
    { id: '4', title: 'Back & Biceps Thickness', target: 'Lats, Traps, Biceps', moves: 6, duration: '50 mins', calories: '420 kcal', level: 'Intermediate' },
    { id: '5', title: 'Core & Mobility Warmup', target: 'Abs, Spine', moves: 4, duration: '20 mins', calories: '150 kcal', level: 'Beginner' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.topTitle}>Workout Library</Text>
          <Text style={styles.topSub}>Assign pre-built splits to your clients</Text>
        </View>
        <TouchableOpacity style={styles.createBtn}>
          <Text style={styles.createBtnText}>+ New Split</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {routines.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <View style={[
                  styles.levelBadge, 
                  r.level === 'Beginner' ? styles.bgBeginner : r.level === 'Intermediate' ? styles.bgInter : styles.bgAdv
                ]}>
                  <Text style={[
                    styles.levelText,
                    r.level === 'Beginner' ? styles.textBeginner : r.level === 'Intermediate' ? styles.textInter : styles.textAdv
                  ]}>
                    {r.level}
                  </Text>
                </View>
                <Text style={styles.routineTitle}>{r.title}</Text>
                <Text style={styles.targetMuscles}>{r.target}</Text>
              </View>
              <View style={styles.iconBox}>
                <Ionicons name="barbell" size={20} color={COLORS.primary} />
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Ionicons name="fitness-outline" size={13} color={COLORS.textMuted} />
                <Text style={styles.metricText}>{r.moves} Exercises</Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                <Text style={styles.metricText}>{r.duration}</Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="flame" size={13} color={COLORS.primary} />
                <Text style={[styles.metricText, { color: COLORS.primary, fontWeight: '700' }]}>{r.calories}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.assignBtn}>
              <Text style={styles.assignBtnText}>Assign Routine to Client →</Text>
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  topTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  topSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  createBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  createBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  list: { gap: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 6 },
  levelText: { fontSize: 9, fontWeight: '700' },
  bgBeginner: { backgroundColor: COLORS.emeraldLight },
  textBeginner: { color: COLORS.emerald },
  bgInter: { backgroundColor: COLORS.amberLight },
  textInter: { color: COLORS.amber },
  bgAdv: { backgroundColor: COLORS.roseLight },
  textAdv: { color: COLORS.rose },
  routineTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  targetMuscles: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricText: { fontSize: 11, color: COLORS.textMedium },
  assignBtn: { marginTop: 10, alignItems: 'center' },
  assignBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
});

