import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const TrainerProfileScreen: React.FC = () => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.avatarLetter}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>Master Fitness Coach & Dietitian</Text>
        <View style={styles.badgeRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ 4.9 (128 Reviews)</Text>
          </View>
          <View style={styles.expBadge}>
            <Text style={styles.expText}>6+ Years Exp</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Accreditations</Text>
      <View style={styles.card}>
        <View style={styles.certRow}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.emerald} />
          <View>
            <Text style={styles.certTitle}>ACSM Certified Personal Trainer</Text>
            <Text style={styles.certSub}>American College of Sports Medicine</Text>
          </View>
        </View>
        <View style={styles.certRow}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
          <View>
            <Text style={styles.certTitle}>Precision Nutrition Level 1 (Pn1)</Text>
            <Text style={styles.certSub}>Exercise Nutrition Specialist</Text>
          </View>
        </View>
        <View style={[styles.certRow, { borderBottomWidth: 0 }]}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.blue} />
          <View>
            <Text style={styles.certTitle}>CrossFit Level 2 Coach</Text>
            <Text style={styles.certSub}>Olympic Lifting & Functional Fitness</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Trainer Settings</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Hourly Session Rate</Text>
            <Text style={styles.settingSub}>Currently ₹800 / session</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingRow, { borderBottomWidth: 0 }]}>
          <View>
            <Text style={styles.settingTitle}>Weekly Availability</Text>
            <Text style={styles.settingSub}>6:00 AM - 12:00 PM, 4:00 PM - 8:00 PM</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.rose} />
        <Text style={styles.logoutText}>Sign Out from Trainer App</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  name: { fontSize: 17, fontWeight: '800', color: COLORS.textDark },
  role: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  ratingBadge: { backgroundColor: COLORS.amberLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ratingText: { fontSize: 11, fontWeight: '700', color: COLORS.amber },
  expBadge: { backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  expText: { fontSize: 11, fontWeight: '600', color: COLORS.textMedium },
  sectionHeader: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  certTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  certSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  settingTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  settingSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  logoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.roseLight,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  logoutText: { fontSize: 13, fontWeight: '800', color: COLORS.rose },
});

