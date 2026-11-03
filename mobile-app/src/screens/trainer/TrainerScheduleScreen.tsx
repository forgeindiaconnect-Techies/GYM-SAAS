import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const TrainerScheduleScreen: React.FC<{ onNavigateTab?: (tab: string, sub?: string) => void }> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow' | 'upcoming'>('today');

  const days = [
    { key: 'today', label: 'Today (4 Sessions)', date: '03 Nov' },
    { key: 'tomorrow', label: 'Tomorrow (3 Sessions)', date: '04 Nov' },
    { key: 'upcoming', label: 'This Week (18 Sessions)', date: '05-09 Nov' },
  ];

  const sessionsToday = [
    { id: '1', client: 'Naveen Kumar', goal: 'Push Day (Hypertrophy)', time: '09:00 AM - 10:00 AM', status: 'Completed', phone: '+91 98765 43210' },
    { id: '2', client: 'Priya Sharma', goal: 'Weight Loss & Core', time: '11:30 AM - 12:30 PM', status: 'Next Up', phone: '+91 98451 23456', active: true },
    { id: '3', client: 'Rahul Varma', goal: 'Strength & Deadlifts', time: '04:00 PM - 05:00 PM', status: 'Upcoming', phone: '+91 97112 34567' },
    { id: '4', client: 'Vikram Singh', goal: 'Shoulder Rehab & Mobility', time: '06:30 PM - 07:30 PM', status: 'Upcoming', phone: '+91 99223 45678' },
  ];

  const sessionsTomorrow = [
    { id: '5', client: 'Sneha Patel', goal: 'Full Body HIIT Conditioning', time: '07:00 AM - 08:00 AM', status: 'Scheduled', phone: '+91 98112 34567' },
    { id: '6', client: 'Arjun Menon', goal: 'Upper Body Power Split', time: '10:00 AM - 11:00 AM', status: 'Scheduled', phone: '+91 98223 45678' },
    { id: '7', client: 'Ananya Roy', goal: 'Kettlebell & Functional Flow', time: '05:30 PM - 06:30 PM', status: 'Scheduled', phone: '+91 98334 56789' },
  ];

  const sessionsUpcoming = [
    { id: '8', client: 'Naveen Kumar', goal: 'Legs & Core Overload', time: 'Wednesday, 09:00 AM', status: 'Confirmed', phone: '+91 98765 43210' },
    { id: '9', client: 'Priya Sharma', goal: 'HIIT & Metabolic Conditioning', time: 'Thursday, 11:30 AM', status: 'Confirmed', phone: '+91 98451 23456' },
    { id: '10', client: 'Karan Mehra', goal: 'Athletic Conditioning & Agility', time: 'Friday, 04:00 PM', status: 'Confirmed', phone: '+91 98445 67890' },
  ];

  const displayedSessions = 
    selectedDay === 'today' ? sessionsToday :
    selectedDay === 'tomorrow' ? sessionsTomorrow :
    sessionsUpcoming;

  const handleCallClient = (name: string, phone: string) => {
    Alert.alert(
      `Contact ${name}`,
      `Call ${phone} for workout session confirmation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Client', onPress: () => Linking.openURL(`tel:${phone}`) },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Schedule Header Card */}
      <View style={styles.scheduleHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.scheduleTitle}>Session Calendar</Text>
          <Text style={styles.scheduleSub}>
            {user?.gymName || 'Gymora Flagship Arena'} • Floor Slots
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

      <View style={styles.sessionsList}>
        {displayedSessions.map((s) => {
          const isNext = (s as any).active || s.status === 'Next Up';
          const isDone = s.status === 'Completed';

          return (
            <View key={s.id} style={[styles.card, isNext && styles.cardActive]}>
              <View style={styles.cardTop}>
                <View style={styles.clientInfoRow}>
                  <View style={[styles.avatar, isNext && { backgroundColor: COLORS.primary }]}>
                    <Text style={[styles.avatarText, isNext && { color: COLORS.white }]}>
                      {s.client.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{s.client}</Text>
                    <Text style={styles.goalText}>{s.goal}</Text>
                  </View>
                </View>

                <View style={[
                  styles.statusTag,
                  isDone ? styles.statusDone : isNext ? styles.statusNext : styles.statusUpcoming
                ]}>
                  <Text style={[
                    styles.statusTagText,
                    isDone ? styles.statusDoneText : isNext ? styles.statusNextText : styles.statusUpcomingText
                  ]}>
                    {s.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textMedium} />
                  <Text style={styles.timeText}>{s.time}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCallClient(s.client, s.phone)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call-outline" size={14} color={COLORS.primaryDark} />
                    <Text style={styles.callBtnText}>Call</Text>
                  </TouchableOpacity>

                  {onNavigateTab && (
                    <TouchableOpacity
                      style={styles.assignBtn}
                      onPress={() => onNavigateTab('programs')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="barbell-outline" size={14} color={COLORS.white} />
                      <Text style={styles.assignBtnText}>Assign Plan</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
  content: { padding: 14, paddingBottom: 100 },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 18,
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
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  capacityBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  daySelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  dayTab: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  dayTabActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryBorder,
  },
  dayTabText: { fontSize: 12, fontWeight: '700', color: COLORS.textMedium },
  dayTabTextActive: { color: COLORS.primaryDark, fontWeight: '800' },
  dayTabSub: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
  dayTabSubActive: { color: COLORS.primaryDark, fontWeight: '600' },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark },
  sessionCountText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  sessionsList: { gap: 10 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFAF5',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  clientName: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  goalText: { fontSize: 11, color: COLORS.textMedium, marginTop: 1 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDone: { backgroundColor: COLORS.emeraldLight },
  statusDoneText: { color: COLORS.emerald, fontSize: 10, fontWeight: '700' },
  statusNext: { backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.primaryDark },
  statusNextText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  statusUpcoming: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.cardBorder },
  statusUpcomingText: { color: COLORS.textMedium, fontSize: 10, fontWeight: '600' },
  statusTagText: { fontSize: 10 },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: 10,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 11, color: COLORS.textDark, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 6 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  callBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  assignBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
});

