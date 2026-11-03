import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const TrainerDashboardScreen: React.FC<{ onNavigateTab: (tab: string, sub?: string) => void }> = ({ onNavigateTab }) => {
  const { user } = useAuth();

  const sessions = [
    { id: '1', client: 'Naveen Kumar', goal: 'Muscle Gain', time: '09:00 AM - 10:00 AM', status: 'Completed', phone: '+91 98765 43210' },
    { id: '2', client: 'Priya Sharma', goal: 'Weight Loss', time: '11:30 AM - 12:30 PM', status: 'Next Up', phone: '+91 98451 23456' },
    { id: '3', client: 'Rahul Varma', goal: 'Strength & Core', time: '04:00 PM - 05:00 PM', status: 'Upcoming', phone: '+91 97112 34567' },
    { id: '4', client: 'Vikram Singh', goal: 'Shoulder Rehab', time: '06:30 PM - 07:30 PM', status: 'Upcoming', phone: '+91 99223 45678' },
  ];

  const handleCallPriya = () => {
    Alert.alert(
      'Contact Priya Sharma',
      'Call client (+91 98451 23456) for upcoming 11:30 AM workout session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Client', onPress: () => Linking.openURL('tel:+919845123456') },
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={true}
      showsHorizontalScrollIndicator={false}
    >
      {/* Trainer Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Master Coach</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>
              Welcome, Coach {user?.firstName || user?.name?.split(' ')[0] || 'Trainer'} 🏋️
            </Text>
            <Text style={styles.sub}>4 Sessions Scheduled Today</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.avatarLetter || 'T'}</Text>
          </View>
        </View>

        <View style={styles.nextBox}>
          <View style={styles.nextLeft}>
            <View style={styles.dot} />
            <Text style={styles.nextLabel}>Next Up: <Text style={styles.nextName}>Priya Sharma</Text> at 11:30 AM</Text>
          </View>
          <TouchableOpacity 
            style={styles.quickCall} 
            onPress={handleCallPriya}
            activeOpacity={0.7}
            accessibilityLabel="Call Next Client"
          >
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
        <TouchableOpacity onPress={() => onNavigateTab('programs')}>
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
                  <View style={{ flex: 1 }}>
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
                <TouchableOpacity onPress={() => onNavigateTab('programs')}>
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
  content: { padding: 14, paddingBottom: 110 },
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  sub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  nextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    marginTop: 12,
  },
  nextLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  nextLabel: { color: COLORS.white, fontSize: 11, flexShrink: 1 },
  nextName: { fontWeight: '700' },
  quickCall: {
    backgroundColor: COLORS.white,
    padding: 7,
    borderRadius: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  kpiLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  kpiValue: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginVertical: 3 },
  kpiSub: { fontSize: 9, color: COLORS.emerald, fontWeight: '700' },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewRoutinesText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  sessionsList: { gap: 8 },
  sessionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  sessionCardNext: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFAF5',
  },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  sessionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionAvatarText: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  clientName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  clientGoal: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bgDone: { backgroundColor: COLORS.emeraldLight },
  textDone: { color: COLORS.emerald, fontSize: 10, fontWeight: '700' },
  bgNext: { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primaryBorder },
  textNext: { color: COLORS.primaryDark, fontSize: 10, fontWeight: '800' },
  bgUpcoming: { backgroundColor: COLORS.background },
  textUpcoming: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  statusText: { fontSize: 10 },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeText: { fontSize: 11, color: COLORS.textMedium },
  assignText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
});
