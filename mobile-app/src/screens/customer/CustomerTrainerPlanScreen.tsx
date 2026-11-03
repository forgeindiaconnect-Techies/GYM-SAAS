import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const CustomerTrainerPlanScreen: React.FC = () => {
  const weeklyPlan = [
    { day: 'Day 1 • Monday', split: 'Push Power (Chest, Delts, Triceps)', exercises: '6 exercises • 75 min', status: 'Completed', done: true },
    { day: 'Day 2 • Tuesday', split: 'Pull Strength (Lats, Traps, Biceps)', exercises: '6 exercises • 70 min', status: 'Completed', done: true },
    { day: 'Day 3 • Wednesday', split: 'Legs & Core (Squats, RDLs, Abs)', exercises: '7 exercises • 80 min', status: 'Today', active: true },
    { day: 'Day 4 • Thursday', split: 'Active Recovery & Mobility', exercises: 'Steam + 30m Stretch', status: 'Scheduled' },
    { day: 'Day 5 • Friday', split: 'Upper Hypertrophy & Weak Points', exercises: '6 exercises • 65 min', status: 'Scheduled' },
    { day: 'Day 6 • Saturday', split: 'Leg Volume & HIIT Conditioning', exercises: '6 exercises • 60 min', status: 'Scheduled' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Coach Header Card */}
      <View style={styles.coachCard}>
        <View style={styles.coachRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>V</Text>
          </View>
          <View style={styles.coachInfo}>
            <View style={styles.pillRow}>
              <Text style={styles.coachTag}>1-on-1 Assigned Coach</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Week 3 of 8</Text>
              </View>
            </View>
            <Text style={styles.coachName}>Coach Vikram Malhotra</Text>
            <Text style={styles.planTitle}>Hypertrophy & Strength Cycle</Text>
          </View>
        </View>

        <View style={styles.noteBox}>
          <View style={styles.noteHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={COLORS.primary} />
            <Text style={styles.noteTitle}>Coach's Guidance & Focus</Text>
          </View>
          <Text style={styles.noteText}>
            "Great progress on bench press last session, Naveen! Today on legs, prioritize 3-second eccentric tempo on Barbell Squats. Hit 160g protein and keep hydration above 3.5L."
          </Text>
        </View>
      </View>

      {/* Routine Split */}
      <Text style={styles.sectionTitle}>Weekly Training Split</Text>
      <View style={styles.splitList}>
        {weeklyPlan.map((p, idx) => (
          <View 
            key={idx} 
            style={[
              styles.planCard, 
              p.active && styles.planCardActive,
              p.done && styles.planCardDone
            ]}
          >
            <View style={styles.planCardLeft}>
              <View style={[
                styles.dayIconBox, 
                p.done && { backgroundColor: COLORS.emeraldLight },
                p.active && { backgroundColor: COLORS.primaryLight }
              ]}>
                <Ionicons 
                  name={p.done ? "checkmark-circle" : p.active ? "flame" : "calendar-outline"} 
                  size={18} 
                  color={p.done ? COLORS.emerald : p.active ? COLORS.primary : COLORS.textMuted} 
                />
              </View>
              <View>
                <Text style={styles.dayText}>{p.day}</Text>
                <Text style={styles.splitText}>{p.split}</Text>
                <Text style={styles.metaText}>{p.exercises}</Text>
              </View>
            </View>
            <View style={[
              styles.statusTag,
              p.done && styles.statusTagDone,
              p.active && styles.statusTagActive
            ]}>
              <Text style={[
                styles.statusTagText,
                p.done && styles.statusTagDoneText,
                p.active && styles.statusTagActiveText
              ]}>
                {p.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 14, paddingBottom: 36 },
  coachCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  coachRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  coachInfo: { flex: 1 },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  coachTag: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase' },
  activeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  activeBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.primaryDark },
  coachName: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  planTitle: { fontSize: 11, color: COLORS.textMuted },
  noteBox: {
    marginTop: 14,
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  noteTitle: { fontSize: 11, fontWeight: '800', color: COLORS.primaryDark },
  noteText: { fontSize: 11, color: COLORS.textDark, lineHeight: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  splitList: { gap: 10 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  planCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFAF5',
  },
  planCardDone: {
    borderColor: COLORS.cardBorder,
  },
  planCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dayIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  splitText: { fontSize: 12, fontWeight: '700', color: COLORS.textDark, marginTop: 1 },
  metaText: { fontSize: 10, color: COLORS.textMedium, marginTop: 2 },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  statusTagText: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted },
  statusTagDone: { backgroundColor: COLORS.emeraldLight },
  statusTagDoneText: { color: COLORS.emerald, fontWeight: '700' },
  statusTagActive: { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primaryBorder },
  statusTagActiveText: { color: COLORS.primaryDark, fontWeight: '800' },
});

