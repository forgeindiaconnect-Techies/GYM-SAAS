import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const TrainerDashboardScreen: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { user } = useAuth();

  const sessions = [
    { id: '1', client: 'Naveen Kumar', goal: 'Muscle Gain', time: '09:00 AM - 10:00 AM', status: 'Completed' },
    { id: '2', client: 'Priya Sharma', goal: 'Weight Loss', time: '11:30 AM - 12:30 PM', status: 'Next Up' },
    { id: '3', client: 'Rahul Varma', goal: 'Strength & Core', time: '04:00 PM - 05:00 PM', status: 'Upcoming' },
    { id: '4', client: 'Vikram Singh', goal: 'Shoulder Rehab', time: '06:30 PM - 07:30 PM', status: 'Upcoming' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Trainer Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Master Coach</Text>
            </View>
            <Text style={styles.title}>Welcome, Coach {user.name.split(' ')[0]} 🏋️</Text>
            <Text style={styles.sub}>4 Sessions Scheduled Today</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.avatarLetter}</Text>
          </View>
        </View>

        <View style={styles.nextBox}>
          <View style={styles.nextLeft}>
            <View style={styles.dot} />
            <Text style={styles.nextLabel}>Next Up: <Text style={styles.nextName}>Priya Sharma</Text> at 11:30 AM</Text>
          </View>
          <TouchableOpacity style={styles.quickCall}>
            <Ionicons name="call" size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Cards */}
      <Text style={styles.sectionTitle}>Coaching Overview</Text>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Active Clients</Text>
          <Text style={styles.kpiValue}>18</Text>
          <Text style={styles.kpiSub}>+3 new this month</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>This Month Payout</Text>
          <Text style={styles.kpiValue}>₹64,200</Text>
          <Text style={styles.kpiSub}>+24% vs last mo</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Adherence Rate</Text>
          <Text style={styles.kpiValue}>94%</Text>
          <Text style={styles.kpiSub}>Top tier rating</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Training Hours</Text>
          <Text style={styles.kpiValue}>48 hrs</Text>
          <Text style={styles.kpiSub}>On track for bonus</Text>
        </View>
      </View>

      {/* Today's Schedule Timeline */}
      <View style={styles.timelineHeader}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <TouchableOpacity onPress={() => onNavigateTab('workouts')}>
          <Text style={styles.viewRoutinesText}>Routines →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionsList}>
        {sessions.map((s) => {
          const isNext = s.status === 'Next Up';
          return (
            <View key={s.id} style={[styles.sessionCard, isNext && styles.sessionCardNext]}>
              <View style={styles.sessionTop}>
                <View style={styles.sessionLeft}>
                  <View style={[styles.sessionAvatar, isNext && { backgroundColor: COLORS.primary }]}>
                    <Text style={[styles.sessionAvatarText, isNext && { color: COLORS.white }]}>
                      {s.client.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.clientName}>{s.client}</Text>
                    <Text style={styles.clientGoal}>{s.goal}</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusPill, 
                  s.status === 'Completed' ? styles.bgDone : isNext ? styles.bgNext : styles.bgUpcoming
                ]}>
                  <Text style={[
                    styles.statusText,
                    s.status === 'Completed' ? styles.textDone : isNext ? styles.textNext : styles.textUpcoming
                  ]}>
                    {s.status}
                  </Text>
                </View>
              </View>

              <View style={styles.sessionFooter}>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.timeText}>{s.time}</Text>
                </View>
                <TouchableOpacity onPress={() => onNavigateTab('workouts')}>
                  <Text style={styles.assignText}>Assign Split</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
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
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  title: { color: COLORS.white, fontSize: 19, fontWeight: '800' },
  sub: { color: '#FED7AA', fontSize: 11, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
  nextBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 10,
    borderRadius: 12,
    marginTop: 14,
  },
  nextLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  nextLabel: { color: COLORS.white, fontSize: 11 },
  nextName: { fontWeight: '700' },
  quickCall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginBottom: 12 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  kpiCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  kpiLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  kpiValue: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginTop: 4 },
  kpiSub: { fontSize: 10, color: COLORS.emerald, fontWeight: '700', marginTop: 2 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewRoutinesText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  sessionsList: { gap: 10 },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sessionCardNext: { borderColor: COLORS.primary, backgroundColor: '#FFFBF7' },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sessionAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionAvatarText: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  clientName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  clientGoal: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 9, fontWeight: '700' },
  bgDone: { backgroundColor: COLORS.emeraldLight },
  textDone: { color: COLORS.emerald },
  bgNext: { backgroundColor: COLORS.primary },
  textNext: { color: COLORS.white },
  bgUpcoming: { backgroundColor: COLORS.background },
  textUpcoming: { color: COLORS.textMedium },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 11, color: COLORS.textMedium },
  assignText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
});

