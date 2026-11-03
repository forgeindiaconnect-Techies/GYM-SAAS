import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const OwnerSettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.avatarLetter || 'O'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Gym Owner'}</Text>
        <Text style={styles.role}>Gym Owner & Administrator</Text>
        <View style={styles.gymPill}>
          <Text style={styles.gymPillText}>{user?.gymName || 'Gymora Arena'}</Text>
        </View>
      </View>

      {/* Settings Sections */}
      <Text style={styles.sectionHeader}>Gym Management</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="business-outline" size={20} color={COLORS.primary} />
            <View>
              <Text style={styles.rowTitle}>Branch Details</Text>
              <Text style={styles.rowSub}>Downtown Flagship Center</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <View>
              <Text style={styles.rowTitle}>Operating Hours</Text>
              <Text style={styles.rowSub}>Mon - Sun: 5:00 AM - 11:00 PM</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <View>
              <Text style={styles.rowTitle}>Geo-Fence Attendance</Text>
              <Text style={styles.rowSub}>50m proximity radius active</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Application</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.textMedium} />
            <Text style={styles.rowTitle}>Push Notifications</Text>
          </View>
          <Text style={styles.enabledText}>Enabled</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textMedium} />
            <Text style={styles.rowTitle}>SaaS Plan</Text>
          </View>
          <Text style={styles.planText}>Enterprise</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={18} color={COLORS.rose} />
        <Text style={styles.logoutText}>Sign Out from Owner App</Text>
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
  gymPill: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  gymPillText: { fontSize: 11, color: COLORS.textMedium, fontWeight: '600' },
  sectionHeader: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  rowSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  enabledText: { fontSize: 12, fontWeight: '700', color: COLORS.emerald },
  planText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
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

