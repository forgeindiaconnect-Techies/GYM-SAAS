import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const OwnerDashboardScreen: React.FC<{ onNavigateTab: (tab: string) => void }> = ({ onNavigateTab }) => {
  const { user } = useAuth();

  const recentCheckins = [
    { id: '1', name: 'Naveen Kumar', plan: 'Gold Annual', time: '10 mins ago', status: 'Active' },
    { id: '2', name: 'Priya Sharma', plan: 'Silver Quarterly', time: '22 mins ago', status: 'Active' },
    { id: '3', name: 'Rahul Varma', plan: 'Platinum VIP', time: '45 mins ago', status: 'Active' },
    { id: '4', name: 'Sneha Patel', plan: 'Monthly Pass', time: '1 hr ago', status: 'Expiring Soon' },
  ];

  const expiringAlerts = [
    { id: '101', name: 'Arjun Menon', days: 2, plan: 'Silver Monthly', phone: '+91 98765 43210' },
    { id: '102', name: 'Divya Iyer', days: 3, plan: 'Gold Annual', phone: '+91 98451 23456' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeText}>{user.gymName || 'Downtown Flagship'}</Text>
            </View>
            <Text style={styles.bannerTitle}>Hello, {user.name} 👋</Text>
            <Text style={styles.bannerSub}>Main Floor • Geo-Fence Active</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user.avatarLetter}</Text>
          </View>
        </View>

        {/* Live Occupancy Row */}
        <View style={styles.liveRow}>
          <View style={styles.liveLeft}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveLabel}>Live on floor:</Text>
            <Text style={styles.liveCount}>38 Members</Text>
          </View>
          <Text style={styles.liveToday}>Today: 84</Text>
        </View>
      </View>

      {/* Quick Actions Bar */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigateTab('members')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="person-add" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Add Member</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigateTab('members')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="qr-code" size={20} color={COLORS.blue} />
          </View>
          <Text style={styles.actionText}>Scan Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigateTab('trainers')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="barbell" size={20} color={COLORS.emerald} />
          </View>
          <Text style={styles.actionText}>Trainers</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigateTab('finances')}>
          <View style={[styles.actionIconBox, { backgroundColor: '#FFFBEB' }]}>
            <Ionicons name="wallet" size={20} color={COLORS.amber} />
          </View>
          <Text style={styles.actionText}>Payouts</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards Grid */}
      <Text style={styles.sectionTitle}>Gym Performance</Text>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>Monthly Revenue</Text>
            <View style={[styles.kpiIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="cash" size={16} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.kpiValue}>₹4,82,000</Text>
          <Text style={styles.kpiTrendPositive}>↑ +18% vs last month</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>Total Members</Text>
            <View style={[styles.kpiIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={16} color={COLORS.blue} />
            </View>
          </View>
          <Text style={styles.kpiValue}>1,248</Text>
          <Text style={styles.kpiTrendPositive}>↑ +12% this month</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>Member Retention</Text>
            <View style={[styles.kpiIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="trending-up" size={16} color={COLORS.emerald} />
            </View>
          </View>
          <Text style={styles.kpiValue}>92%</Text>
          <Text style={styles.kpiTrendPositive}>Top 5% benchmark</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>Active Passes</Text>
            <View style={[styles.kpiIcon, { backgroundColor: '#FDF4FF' }]}>
              <Ionicons name="checkmark-done" size={16} color="#A855F7" />
            </View>
          </View>
          <Text style={styles.kpiValue}>1,140</Text>
          <Text style={styles.kpiTrendPositive}>94% attendance</Text>
        </View>
      </View>

      {/* Urgent Renewals Alert Card */}
      <View style={styles.alertCard}>
        <View style={styles.alertTop}>
          <View style={styles.alertHeader}>
            <Ionicons name="alert-circle" size={18} color="#D97706" />
            <Text style={styles.alertTitle}>Renewals Expiring Soon</Text>
          </View>
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>2 Urgent</Text>
          </View>
        </View>

        {expiringAlerts.map((item) => (
          <View key={item.id} style={styles.alertItem}>
            <View>
              <Text style={styles.alertItemName}>{item.name}</Text>
              <Text style={styles.alertItemSub}>{item.plan} • {item.days} days left</Text>
            </View>
            <TouchableOpacity style={styles.remindBtn}>
              <Text style={styles.remindBtnText}>Remind</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Recent Check-ins */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Live Check-ins</Text>
        <TouchableOpacity onPress={() => onNavigateTab('members')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardList}>
        {recentCheckins.map((m) => (
          <View key={m.id} style={styles.checkinRow}>
            <View style={styles.checkinLeft}>
              <View style={styles.checkinAvatar}>
                <Text style={styles.checkinAvatarText}>{m.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.checkinName}>{m.name}</Text>
                <Text style={styles.checkinPlan}>{m.plan}</Text>
              </View>
            </View>
            <View style={styles.checkinRight}>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{m.status}</Text>
              </View>
              <Text style={styles.checkinTime}>{m.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  bannerSub: {
    color: '#FED7AA',
    fontSize: 12,
    marginTop: 2,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  liveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  liveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  liveLabel: {
    color: '#FED7AA',
    fontSize: 12,
    fontWeight: '500',
  },
  liveCount: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  liveToday: {
    color: '#FED7AA',
    fontSize: 11,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  kpiIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  kpiTrendPositive: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.emerald,
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 18,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  urgentBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgentText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  alertItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  alertItemSub: {
    fontSize: 10,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  remindBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  remindBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  cardList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  checkinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  checkinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkinAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  checkinName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  checkinPlan: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkinRight: {
    alignItems: 'flex-end',
  },
  statusPill: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: COLORS.emerald,
    fontSize: 9,
    fontWeight: '700',
  },
  checkinTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
  },
});

