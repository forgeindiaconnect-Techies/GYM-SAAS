import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const CustomerGymScreen: React.FC = () => {
  const { user } = useAuth();

  const facilities = [
    { icon: 'barbell-outline', title: 'Strength & Free Weights', desc: 'Hammer Strength & Eleiko Olympic bars' },
    { icon: 'speedometer-outline', title: 'Cardio Deck', desc: 'LifeFitness treadmills, rowers & ellipticals' },
    { icon: 'flame-outline', title: 'CrossFit & HIIT Arena', desc: 'Turf track, battle ropes & kettlebells' },
    { icon: 'water-outline', title: 'Steam & Recovery Spa', desc: 'Infrared sauna, steam bath & ice plunge' },
    { icon: 'nutrition-outline', title: 'Juice & Protein Bar', desc: 'Fresh shakes, pre-workouts & healthy bowls' },
    { icon: 'shield-checkmark-outline', title: 'Smart Lockers & Showers', desc: 'RFID digital lockers, hair dryers & towels' },
  ];

  const trainers = [
    { name: 'Vikram Malhotra', spec: 'Head Coach • Hypertrophy & Powerlifting', exp: '8+ yrs' },
    { name: 'Ananya Deshmukh', spec: 'Mobility & Strength Conditioning', exp: '5+ yrs' },
    { name: 'Rohit Verma', spec: 'Functional Fitness & Fat Loss', exp: '6+ yrs' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Gym Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.statusBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.statusText}>Open Now • 42% Occupancy</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.ratingText}>4.9 (320+ reviews)</Text>
          </View>
        </View>

        <Text style={styles.gymTitle}>{user?.gymName || 'Gymora Flagship Arena'}</Text>
        <Text style={styles.gymAddress}>
          <Ionicons name="location-outline" size={13} color={COLORS.primaryLight} />
          {' '}4th Floor, Platinum Hub, 100ft Road, Indiranagar, Bengaluru
        </Text>

        <View style={styles.timingRow}>
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.primaryLight} />
            <Text style={styles.timeText}>Mon - Sat: 5:30 AM - 10:30 PM</Text>
          </View>
          <View style={styles.timeItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primaryLight} />
            <Text style={styles.timeText}>Sunday: 7:00 AM - 8:00 PM</Text>
          </View>
        </View>
      </View>

      {/* Quick Contact & Directions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="call-outline" size={18} color={COLORS.primary} />
          <Text style={styles.actionBtnText}>Call Front Desk</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="navigate-outline" size={18} color={COLORS.primary} />
          <Text style={styles.actionBtnText}>Get Directions</Text>
        </TouchableOpacity>
      </View>

      {/* Facilities & Amenities */}
      <Text style={styles.sectionTitle}>Amenities & Equipment</Text>
      <View style={styles.facilityGrid}>
        {facilities.map((fac, idx) => (
          <View key={idx} style={styles.facilityCard}>
            <View style={styles.facIconBadge}>
              <Ionicons name={fac.icon as any} size={20} color={COLORS.primary} />
            </View>
            <View style={styles.facInfo}>
              <Text style={styles.facTitle}>{fac.title}</Text>
              <Text style={styles.facDesc}>{fac.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Certified Training Staff */}
      <Text style={styles.sectionTitle}>Certified Coaching Staff</Text>
      <View style={styles.trainersList}>
        {trainers.map((t, idx) => (
          <View key={idx} style={styles.trainerRow}>
            <View style={styles.trainerAvatar}>
              <Text style={styles.trainerAvatarText}>{t.name[0]}</Text>
            </View>
            <View style={styles.trainerInfo}>
              <Text style={styles.trainerName}>{t.name}</Text>
              <Text style={styles.trainerSpec}>{t.spec}</Text>
            </View>
            <View style={styles.expBadge}>
              <Text style={styles.expText}>{t.exp}</Text>
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
  heroCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  statusText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  gymTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
  gymAddress: { fontSize: 11, color: COLORS.primaryLight, marginBottom: 12 },
  timingRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 10,
    gap: 4,
  },
  timeItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 11, color: COLORS.white, fontWeight: '600' },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
    marginTop: 6,
  },
  facilityGrid: {
    gap: 8,
    marginBottom: 16,
  },
  facilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  facIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facInfo: { flex: 1 },
  facTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  facDesc: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  trainersList: { gap: 8 },
  trainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  trainerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trainerAvatarText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  trainerInfo: { flex: 1 },
  trainerName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  trainerSpec: { fontSize: 10, color: COLORS.textMedium, marginTop: 1 },
  expBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  expText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
});

