import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const CustomerAttendanceScreen: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  // Sessions attendance history matching Web Page 13
  const attendanceHistory = [
    {
      id: 'att-1',
      coach: 'Naveen',
      sessionInfo: '2026-10-15 • 10:00 AM - 11:00 AM (Online)',
      inTime: '03:58 PM',
      outTime: '03:59 PM',
      status: 'Present',
    },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* ======================================================== */}
      {/* 1. TOP ATTENDANCE RECORD BANNER (Matching Web Page 13) */}
      {/* ======================================================== */}
      <View style={styles.topBannerCard}>
        <View style={styles.tagBadge}>
          <Ionicons name="finger-print" size={12} color="#FFFFFF" />
          <Text style={styles.tagBadgeText}>Session Attendance & Consistency</Text>
        </View>

        <View style={styles.bannerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Attendance Record</Text>
            <Text style={styles.bannerSub}>
              Track your live online session check-ins, punctuality, and self-learning workout completions over time.
            </Text>
          </View>

          {/* Overall Attendance Box */}
          <View style={styles.overallBox}>
            <Text style={styles.overallLabel}>OVERALL ATTENDANCE</Text>
            <Text style={styles.overallPercent}>100%</Text>
            <Text style={styles.overallSub}>1 of 1 completed</Text>
          </View>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 2. 4 KPIS GRID (Matching Web Page 13) */}
      {/* ======================================================== */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TOTAL BOOKED</Text>
          <Text style={styles.kpiNumber}>1</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>ATTENDED LIVE</Text>
          <Text style={[styles.kpiNumber, { color: '#16A34A' }]}>1</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>SELF-LEARNING</Text>
          <Text style={styles.kpiNumber}>0</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>MISSED / ABSENT</Text>
          <Text style={[styles.kpiNumber, { color: '#DC2626' }]}>0</Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 3. SESSION ATTENDANCE HISTORY (Matching Web Page 13) */}
      {/* ======================================================== */}
      <View style={styles.historySectionCard}>
        <View style={styles.historyHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="calendar-outline" size={16} color="#EA580C" />
            <View>
              <Text style={styles.historyTitle}>Session Attendance History</Text>
              <Text style={styles.historySub}>Showing all session check-ins</Text>
            </View>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPillsRow}>
            <TouchableOpacity 
              style={[styles.filterPill, dateFilter === 'today' && styles.filterPillActive]}
              onPress={() => setDateFilter('today')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, dateFilter === 'today' && styles.filterPillTextActive]}>
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.filterPill, dateFilter === 'all' && styles.filterPillActive]}
              onPress={() => setDateFilter('all')}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar" size={11} color={dateFilter === 'all' ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.filterPillText, dateFilter === 'all' && styles.filterPillTextActive]}>
                mm/dd/yyyy
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Attendance Records */}
        <View style={{ gap: 10, marginTop: 12 }}>
          {attendanceHistory.map((item) => (
            <View key={item.id} style={styles.attendanceItemCard}>
              <View style={styles.attLeftCol}>
                <View style={styles.avatarMini}>
                  <Text style={styles.avatarMiniText}>{item.coach.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.coachName}>{item.coach}</Text>
                  <Text style={styles.sessionMeta}>{item.sessionInfo}</Text>
                </View>
              </View>

              <View style={styles.attRightCol}>
                <View style={styles.presentBadgeGreen}>
                  <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                  <Text style={styles.presentBadgeGreenText}>{item.status}</Text>
                </View>
                <Text style={styles.checkInOutTime}>
                  In: {item.inTime} • Out: {item.outTime}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 14, paddingBottom: 100 },

  // Top Banner Card Matching Web Page 13
  topBannerCard: {
    backgroundColor: '#EA580C',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  tagBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    marginTop: 4,
  },
  overallBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  overallPercent: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  overallSub: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },

  // 4 KPIs Grid
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  kpiNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
  },

  // Session Attendance History
  historySectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  historySub: {
    fontSize: 10,
    color: '#64748B',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },

  // Attendance Items
  attendanceItemCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attLeftCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EA580C',
  },
  coachName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  sessionMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  attRightCol: {
    alignItems: 'flex-end',
  },
  presentBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  presentBadgeGreenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  checkInOutTime: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
});
