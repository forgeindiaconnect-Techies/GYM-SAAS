import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  Alert, 
  RefreshControl, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export const TrainerScheduleScreen: React.FC<{ onNavigateTab?: (tab: string, sub?: string) => void }> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow' | 'upcoming'>('today');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await api.get('/trainer-sessions/trainer');
      const list = res.data?.sessions || (Array.isArray(res.data) ? res.data : []);
      setSessions(list);
    } catch (err) {
      console.log('[TrainerSchedule] Schedule fetch note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedule();
  };

  // Date calculation strings
  const todayObj = new Date();
  const tomorrowObj = new Date();
  tomorrowObj.setDate(todayObj.getDate() + 1);

  const todayStr = todayObj.toISOString().split('T')[0];
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const todayLabelDate = todayObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  const tomorrowLabelDate = tomorrowObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

  // Filter sessions
  const sessionsToday = sessions.filter((s: any) => {
    const sDate = s.date ? new Date(s.date).toISOString().split('T')[0] : '';
    return sDate === todayStr || (!sDate && s.status !== 'Completed');
  });

  const sessionsTomorrow = sessions.filter((s: any) => {
    const sDate = s.date ? new Date(s.date).toISOString().split('T')[0] : '';
    return sDate === tomorrowStr;
  });

  const sessionsUpcoming = sessions.filter((s: any) => {
    const sDate = s.date ? new Date(s.date).toISOString().split('T')[0] : '';
    return sDate > tomorrowStr;
  });

  const days = [
    { key: 'today', label: `Today (${sessionsToday.length} Session${sessionsToday.length === 1 ? '' : 's'})`, date: todayLabelDate },
    { key: 'tomorrow', label: `Tomorrow (${sessionsTomorrow.length} Session${sessionsTomorrow.length === 1 ? '' : 's'})`, date: tomorrowLabelDate },
    { key: 'upcoming', label: `This Week (${sessionsUpcoming.length} Session${sessionsUpcoming.length === 1 ? '' : 's'})`, date: 'Upcoming' },
  ];

  const displayedSessions = 
    selectedDay === 'today' ? sessionsToday :
    selectedDay === 'tomorrow' ? sessionsTomorrow :
    sessionsUpcoming;

  const handleCallClient = (name: string, phone: string) => {
    if (!phone) {
      Alert.alert('Contact Client', `No phone registered for ${name}.`);
      return;
    }
    Alert.alert(
      `Contact ${name}`,
      `Call ${phone} for workout session confirmation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Client', onPress: () => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`) },
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={COLORS.primary} 
          colors={[COLORS.primary]} 
        />
      }
    >
      {/* Schedule Header Card */}
      <View style={styles.scheduleHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.scheduleTitle}>Session Calendar</Text>
          <Text style={styles.scheduleSub}>
            {user?.gymName || 'Gymora Floor'} • Floor Slots
          </Text>
        </View>
        <View style={styles.capacityBadge}>
          <Ionicons name="time" size={14} color={COLORS.primaryDark} />
          <Text style={styles.capacityBadgeText}>Floor Active</Text>
        </View>
      </View>

      {/* Day Selector Pills */}
      <View style={styles.daySelectorRow}>
        {days.map((d) => {
          const isSelected = selectedDay === d.key;
          return (
            <TouchableOpacity
              key={d.key}
              style={[styles.dayTab, isSelected && styles.dayTabActive]}
              onPress={() => setSelectedDay(d.key as any)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayTabText, isSelected && styles.dayTabTextActive]}>
                {d.label.split(' ')[0]}
              </Text>
              <Text style={[styles.dayTabSub, isSelected && styles.dayTabSubActive]}>
                {d.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Session Slots List */}
      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionTitle}>
          {selectedDay === 'today' ? "Today's Coaching Appointments" :
           selectedDay === 'tomorrow' ? "Tomorrow's Schedule" : "Upcoming Sessions This Week"}
        </Text>
        <Text style={styles.sessionCountText}>{displayedSessions.length} Bookings</Text>
      </View>

      {loading && !refreshing ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading schedule from server...</Text>
        </View>
      ) : displayedSessions.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={36} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Sessions Scheduled</Text>
          <Text style={styles.emptySub}>
            {selectedDay === 'today' 
              ? 'You have no coaching appointments scheduled for today.' 
              : selectedDay === 'tomorrow' 
              ? 'No appointments booked for tomorrow yet.' 
              : 'No upcoming appointments for later this week.'}
          </Text>
        </View>
      ) : (
        <View style={styles.sessionsList}>
          {displayedSessions.map((s, idx) => {
            const clientName = s.customerId?.name || s.clientName || 'Client';
            const goal = s.goal || s.sessionType || s.packageTitle || 'Fitness Training';
            const time = s.timeSlot || s.time || (s.date ? new Date(s.date).toLocaleDateString() : 'Floor Slot');
            const phone = s.customerId?.phone || s.phone || '';
            const isCompleted = s.status === 'Completed';
            const isConfirmed = s.status === 'Confirmed' || s.status === 'Next Up';

            return (
              <View 
                key={s._id || s.id || idx} 
                style={[
                  styles.sessionCard, 
                  isConfirmed && styles.sessionCardActive
                ]}
              >
                <View style={styles.sessionMain}>
                  <View style={styles.sessionHeaderRow}>
                    <View style={styles.clientMeta}>
                      <View style={[styles.avatar, isConfirmed && { backgroundColor: COLORS.primary }]}>
                        <Text style={[styles.avatarText, isConfirmed && { color: COLORS.white }]}>
                          {clientName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.clientName}>{clientName}</Text>
                        <Text style={styles.clientGoal}>{goal}</Text>
                      </View>
                    </View>
                    <View style={[
                      styles.statusPill, 
                      isCompleted ? styles.bgDone : isConfirmed ? styles.bgActive : styles.bgUpcoming
                    ]}>
                      <Text style={[
                        styles.statusText, 
                        isCompleted ? styles.textDone : isConfirmed ? styles.textActive : styles.textUpcoming
                      ]}>
                        {s.status || 'Scheduled'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.timeAndActionsRow}>
                    <View style={styles.timeTag}>
                      <Ionicons name="time-outline" size={13} color={COLORS.textMedium} />
                      <Text style={styles.timeTagText}>{time}</Text>
                    </View>

                    <View style={styles.actionsRight}>
                      {phone ? (
                        <TouchableOpacity
                          style={styles.callBtn}
                          onPress={() => handleCallClient(clientName, phone)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="call" size={13} color={COLORS.primary} />
                          <Text style={styles.callBtnText}>Call</Text>
                        </TouchableOpacity>
                      ) : null}

                      <TouchableOpacity
                        style={styles.routineBtn}
                        onPress={() => {
                          if (onNavigateTab) {
                            onNavigateTab('programs', 'workout-plans');
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.routineBtnText}>Assign Split</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
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
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  headerLeft: { flex: 1 },
  scheduleTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  scheduleSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  capacityBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  daySelectorRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  dayTab: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  dayTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayTabText: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  dayTabTextActive: { color: COLORS.white },
  dayTabSub: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
  dayTabSubActive: { color: 'rgba(255,255,255,0.85)' },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark },
  sessionCountText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  sessionsList: { gap: 8 },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sessionCardActive: { borderColor: COLORS.primary, backgroundColor: '#FFFAF5' },
  sessionMain: { gap: 10 },
  sessionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  clientName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  clientGoal: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  bgDone: { backgroundColor: COLORS.emeraldLight },
  textDone: { color: COLORS.emerald },
  bgActive: { backgroundColor: COLORS.primaryLight },
  textActive: { color: COLORS.primaryDark },
  bgUpcoming: { backgroundColor: COLORS.background },
  textUpcoming: { color: COLORS.textMuted },
  timeAndActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeTagText: { fontSize: 11, color: COLORS.textMedium },
  actionsRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },
  callBtnText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  routineBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  routineBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginTop: 10 },
  emptySub: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 16 },
});
