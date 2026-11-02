import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const CustomerProfileScreen: React.FC = () => {
  const { user } = useAuth();

  const attendanceLog = [
    { date: 'Today, 02 Nov', type: 'Push Day (Chest/Tri)', duration: '62 mins' },
    { date: 'Yesterday, 01 Nov', type: 'Cardio & Abs', duration: '45 mins' },
    { date: '30 Oct 2026', type: 'Legs Day', duration: '55 mins' },
    { date: '29 Oct 2026', type: 'Rest Day', duration: '-' },
    { date: '28 Oct 2026', type: 'Pull Day (Back/Bi)', duration: '50 mins' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Digital Membership Pass Card */}
      <View style={styles.passCard}>
        <View style={styles.passTop}>
          <Text style={styles.passTitle}>Gymora Elite Club Pass</Text>
          <View style={styles.activePill}>
            <Text style={styles.activeText}>Active Pass</Text>
          </View>
        </View>

        <Text style={styles.memberName}>{user.name}</Text>
        <Text style={styles.cardId}>Member ID: GYM-2026-9921</Text>

        <View style={styles.passBottom}>
          <View>
            <Text style={styles.passSubLabel}>Tier</Text>
            <Text style={styles.passSubVal}>Gold Annual</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.passSubLabel}>Renewal Date</Text>
            <Text style={[styles.passSubVal, { color: '#FDBA74' }]}>14 Jan 2027 (73 Days)</Text>
          </View>
        </View>
      </View>

      {/* Attendance Stats */}
      <Text style={styles.sectionTitle}>Attendance Record</Text>
      <View style={styles.card}>
        <View style={styles.statHeader}>
          <Text style={styles.statHeading}>Monthly Consistency</Text>
          <View style={styles.visitBadge}>
            <Text style={styles.visitText}>22 Visits</Text>
          </View>
        </View>

        {attendanceLog.map((item, idx) => (
          <View key={idx} style={styles.logRow}>
            <View>
              <Text style={styles.logDate}>{item.date}</Text>
              <Text style={styles.logType}>{item.type}</Text>
            </View>
            <Text style={styles.logDuration}>{item.duration}</Text>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.rose} />
        <Text style={styles.logoutText}>Sign Out from Customer App</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  passCard: {
    backgroundColor: COLORS.darkBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  passTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  passTitle: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  activePill: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  activeText: { color: COLORS.emerald, fontSize: 10, fontWeight: '700' },
  memberName: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginTop: 14 },
  cardId: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  passBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBorder,
  },
  passSubLabel: { fontSize: 9, color: COLORS.textMuted },
  passSubVal: { fontSize: 12, fontWeight: '700', color: COLORS.white, marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statHeading: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  visitBadge: { backgroundColor: COLORS.emeraldLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  visitText: { fontSize: 10, fontWeight: '700', color: COLORS.emerald },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  logDate: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  logType: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  logDuration: { fontSize: 11, color: COLORS.textMedium },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.roseLight,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  logoutText: { fontSize: 13, fontWeight: '800', color: COLORS.rose },
});

