import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const CustomerAttendanceScreen: React.FC = () => {
  const recentLogs = [
    { date: 'Today, 03 Nov', time: '06:05 PM', method: 'Turnstile Barcode QR', duration: 'Active Session', active: true },
    { date: 'Yesterday, 02 Nov', time: '06:12 PM', method: 'Turnstile Barcode QR', duration: '74 mins', active: false },
    { date: 'Friday, 31 Oct', time: '05:58 PM', method: 'Turnstile Barcode QR', duration: '82 mins', active: false },
    { date: 'Thursday, 30 Oct', time: '06:20 PM', method: 'Turnstile Barcode QR', duration: '65 mins', active: false },
    { date: 'Wednesday, 29 Oct', time: '06:10 PM', method: 'Turnstile Barcode QR', duration: '90 mins', active: false },
    { date: 'Tuesday, 28 Oct', time: '06:00 PM', method: 'Turnstile Barcode QR', duration: '70 mins', active: false },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Attendance Stats Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>Attendance Streak</Text>
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={20} color="#FBBF24" />
              <Text style={styles.streakVal}>14 Days Streak</Text>
            </View>
          </View>
          <View style={styles.badgeMonthly}>
            <Text style={styles.badgeMonthlyText}>November 2026</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statSub}>Total Check-ins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>88%</Text>
            <Text style={styles.statSub}>Monthly Goal</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>75m</Text>
            <Text style={styles.statSub}>Avg. Workout</Text>
          </View>
        </View>
      </View>

      {/* Check-in Log History */}
      <Text style={styles.sectionTitle}>Recent Entry Logs</Text>
      <View style={styles.logList}>
        {recentLogs.map((log, idx) => (
          <View key={idx} style={styles.logItem}>
            <View style={styles.logLeft}>
              <View style={[styles.iconBox, log.active ? styles.iconBoxActive : styles.iconBoxDone]}>
                <Ionicons 
                  name={log.active ? "pulse" : "checkmark-circle"} 
                  size={16} 
                  color={log.active ? COLORS.primary : COLORS.emerald} 
                />
              </View>
              <View>
                <Text style={styles.logDate}>{log.date}</Text>
                <Text style={styles.logMethod}>{log.time} • {log.method}</Text>
              </View>
            </View>
            <View style={[styles.durationBadge, log.active && styles.durationBadgeActive]}>
              <Text style={[styles.durationText, log.active && styles.durationTextActive]}>
                {log.duration}
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
  summaryCard: {
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
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  streakVal: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark },
  badgeMonthly: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  badgeMonthlyText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  statSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  logList: { gap: 8 },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  logLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDone: { backgroundColor: COLORS.emeraldLight },
  iconBoxActive: { backgroundColor: COLORS.primaryLight },
  logDate: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  logMethod: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  durationBadge: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationBadgeActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  durationText: { fontSize: 10, fontWeight: '700', color: COLORS.emerald },
  durationTextActive: { color: COLORS.primaryDark, fontWeight: '800' },
});

