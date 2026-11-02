import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const CustomerDashboardScreen: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [waterMl, setWaterMl] = useState(2250);
  const [qrVisible, setQrVisible] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeText}>Gold Member</Text>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={11} color="#FBBF24" />
                <Text style={styles.streakText}>14 Days Streak</Text>
              </View>
            </View>
            <Text style={styles.title}>Train Hard, {user.name.split(' ')[0]} 🔥</Text>
            <Text style={styles.sub}>Today: Push Day (Chest & Triceps)</Text>
          </View>
          <TouchableOpacity 
            style={styles.qrBtn} 
            onPress={() => setQrVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code" size={24} color={COLORS.primary} />
            <Text style={styles.qrBtnText}>PASS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bannerBottom}>
          <Text style={styles.sessionTime}>Scheduled at 06:00 PM</Text>
          <TouchableOpacity 
            style={styles.startWorkoutBtn}
            onPress={() => onNavigateTab('workouts')}
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
          <Text style={styles.metricVal}>620 <Text style={styles.metricSub}>/ 850 kcal</Text></Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '73%', backgroundColor: COLORS.primary }]} />
          </View>
          <Text style={styles.progressNote}>73% of daily goal</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Hydration</Text>
            <Ionicons name="water" size={16} color={COLORS.sky} />
          </View>
          <Text style={styles.metricVal}>{(waterMl / 1000).toFixed(1)} <Text style={styles.metricSub}>/ 3.5 L</Text></Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(waterMl / 3500) * 100}%`, backgroundColor: COLORS.sky }]} />
          </View>
          <TouchableOpacity onPress={() => setWaterMl(prev => Math.min(prev + 250, 4000))}>
            <Text style={[styles.progressNote, { color: COLORS.sky, fontWeight: '700' }]}>+250ml Water</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Workout Routine */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Routine</Text>
        <TouchableOpacity onPress={() => onNavigateTab('workouts')}>
          <Text style={styles.viewAllText}>View Split →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.exerciseItem}>
          <View style={[styles.stepCircle, { backgroundColor: COLORS.emeraldLight }]}>
            <Ionicons name="checkmark" size={12} color={COLORS.emerald} />
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={[styles.exerciseName, styles.textStrike]}>Barbell Flat Bench Press</Text>
            <Text style={styles.exerciseSets}>4 sets × 10 reps (70 kg)</Text>
          </View>
          <Text style={[styles.exerciseStatus, { color: COLORS.emerald }]}>Done</Text>
        </View>

        <View style={[styles.exerciseItem, styles.exerciseItemActive]}>
          <View style={[styles.stepCircle, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.stepNum}>2</Text>
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>Incline Dumbbell Press</Text>
            <Text style={styles.exerciseSets}>3 sets × 12 reps (24 kg each)</Text>
          </View>
          <Text style={[styles.exerciseStatus, { color: COLORS.primary }]}>Next</Text>
        </View>

        <View style={[styles.exerciseItem, { borderBottomWidth: 0 }]}>
          <View style={[styles.stepCircle, { backgroundColor: COLORS.background }]}>
            <Text style={[styles.stepNum, { color: COLORS.textMuted }]}>3</Text>
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>Cable Tricep Pushdown</Text>
            <Text style={styles.exerciseSets}>4 sets × 15 reps</Text>
          </View>
          <Text style={[styles.exerciseStatus, { color: COLORS.textMuted }]}>Queued</Text>
        </View>
      </View>

      {/* Assigned Coach Card */}
      <View style={styles.coachCard}>
        <View style={styles.coachLeft}>
          <View style={styles.coachAvatar}>
            <Text style={styles.coachAvatarText}>V</Text>
          </View>
          <View>
            <Text style={styles.coachTag}>Personal Coach</Text>
            <Text style={styles.coachName}>Vikram Malhotra</Text>
            <Text style={styles.coachTime}>Session at 06:00 PM today</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.chatCoachBtn}
          onPress={() => onNavigateTab('trainers')}
        >
          <Text style={styles.chatCoachText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* QR Code Entry Pass Modal */}
      <Modal
        visible={qrVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrVisible(false)}
      >
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setQrVisible(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>Digital Gym Entry Pass</Text>
            <Text style={styles.modalSub}>Scan this barcode at reception or turnstile</Text>

            <View style={styles.qrFrame}>
              <Ionicons name="qr-code" size={160} color={COLORS.textDark} />
            </View>

            <Text style={styles.passUserName}>{user.name}</Text>
            <Text style={styles.passType}>Gold Annual Pass • Active</Text>
            <Text style={styles.passId}>ID: GYM-2026-9921</Text>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setQrVisible(false)}>
              <Text style={styles.closeModalText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  badgeText: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
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
  streakText: { color: '#FDE68A', fontSize: 10, fontWeight: '700' },
  title: { color: COLORS.white, fontSize: 19, fontWeight: '800' },
  sub: { color: '#FED7AA', fontSize: 11, marginTop: 2 },
  qrBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBtnText: { fontSize: 8, fontWeight: '800', color: COLORS.primary, marginTop: 1 },
  bannerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  sessionTime: { color: '#FED7AA', fontSize: 11, fontWeight: '500' },
  startWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  startWorkoutText: { color: COLORS.primary, fontSize: 11, fontWeight: '800' },
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMedium },
  metricVal: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginTop: 6 },
  metricSub: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressNote: { fontSize: 10, color: COLORS.textMuted },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  viewAllText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  exerciseItemActive: { backgroundColor: '#FFFBF7', borderRadius: 10, paddingHorizontal: 6 },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNum: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  textStrike: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  exerciseSets: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  exerciseStatus: { fontSize: 10, fontWeight: '700' },
  coachCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.darkBg,
    borderRadius: 16,
    padding: 14,
  },
  coachLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachAvatarText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  coachTag: { color: COLORS.primary, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  coachName: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  coachTime: { color: COLORS.textMuted, fontSize: 10 },
  chatCoachBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  chatCoachText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalHeading: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  modalSub: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 16 },
  qrFrame: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  passUserName: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  passType: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
  passId: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, marginBottom: 16 },
  closeModalBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeModalText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
});

