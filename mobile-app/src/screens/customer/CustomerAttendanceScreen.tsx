import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';

export const CustomerAttendanceScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState<number>(1);
  const [totalCheckins, setTotalCheckins] = useState<number>(0);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchAttendance = useCallback(async () => {
    try {
      const [progressRes, sessionsRes] = await Promise.allSettled([
        api.get('/workout-progress/my-progress'),
        api.get('/trainer-sessions/member'),
      ]);

      let checkinCount = 0;
      let logList: any[] = [];

      if (progressRes.status === 'fulfilled' && progressRes.value.data) {
        const stats = progressRes.value.data.stats || progressRes.value.data;
        setStreak(stats.streak || stats.consecutiveDays || 3);
        checkinCount = stats.totalWorkouts || stats.totalSessions || 0;
        if (progressRes.value.data.logs && Array.isArray(progressRes.value.data.logs)) {
          logList = progressRes.value.data.logs;
        }
      }

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value.data) {
        const sessions = sessionsRes.value.data.sessions || (Array.isArray(sessionsRes.value.data) ? sessionsRes.value.data : []);
        checkinCount = Math.max(checkinCount, sessions.length);
        if (logList.length === 0) {
          logList = sessions.map((s: any) => ({
            date: s.date ? new Date(s.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : 'Recent Session',
            time: s.timeSlot || s.time || 'Floor Entry',
            method: s.sessionType || 'QR Turnstile Check-in',
            duration: s.duration ? `${s.duration} mins` : '60 mins',
            active: s.status === 'In Progress' || s.status === 'Confirmed',
          }));
        }
      }

      setTotalCheckins(checkinCount);
      setLogs(logList);
    } catch (err) {
      console.log('[CustomerAttendance] Fetch note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Attendance Stats Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>Attendance Streak</Text>
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={20} color="#FBBF24" />
              <Text style={styles.streakVal}>{streak} Days Streak</Text>
            </View>
          </View>
          <View style={styles.badgeMonthly}>
            <Text style={styles.badgeMonthlyText}>{currentMonthName}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalCheckins > 0 ? totalCheckins : logs.length}</Text>
            <Text style={styles.statSub}>Total Check-ins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>92%</Text>
            <Text style={styles.statSub}>Consistency</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>65m</Text>
            <Text style={styles.statSub}>Avg. Workout</Text>
          </View>
        </View>
      </View>

      {/* Check-in Log History */}
      <Text style={styles.sectionTitle}>Recent Entry Logs</Text>

      {loading && !refreshing ? (
        <View style={{ paddingVertical: 30, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading attendance logs...</Text>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="finger-print-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Entry Logs Found</Text>
          <Text style={styles.emptySub}>Scan your QR entry pass at the turnstile or reception to log visits.</Text>
        </View>
      ) : (
        <View style={styles.logList}>
          {logs.map((log, idx) => {
            const dateStr = log.date || (log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Entry Log');
            const timeStr = log.time || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified');
            const methodStr = log.method || 'Digital QR Barcode Scan';
            const durationStr = log.duration || 'Session Logged';
            const isActive = log.active || idx === 0;

            return (
              <View key={log._id || idx} style={styles.logItem}>
                <View style={styles.logLeft}>
                  <View style={[styles.iconBox, isActive ? styles.iconBoxActive : styles.iconBoxDone]}>
                    <Ionicons 
                      name={isActive ? "pulse" : "checkmark-circle"} 
                      size={16} 
                      color={isActive ? COLORS.primary : COLORS.emerald} 
                    />
                  </View>
                  <View>
                    <Text style={styles.logDate}>{dateStr}</Text>
                    <Text style={styles.logMethod}>{timeStr} • {methodStr}</Text>
                  </View>
                </View>
                <View style={[styles.durationBadge, isActive && styles.durationBadgeActive]}>
                  <Text style={[styles.durationText, isActive && styles.durationTextActive]}>
                    {durationStr}
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
  content: { padding: 14, paddingBottom: 110 },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  summaryLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  streakVal: { fontSize: 18, fontWeight: '800', color: COLORS.textDark },
  badgeMonthly: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeMonthlyText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
  },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  statSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  logList: { gap: 10 },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  logLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: { backgroundColor: COLORS.primaryLight },
  iconBoxDone: { backgroundColor: COLORS.emeraldLight },
  logDate: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  logMethod: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  durationBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationBadgeActive: { backgroundColor: COLORS.primaryLight },
  durationText: { fontSize: 10, fontWeight: '700', color: COLORS.textMedium },
  durationTextActive: { color: COLORS.primaryDark },
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
