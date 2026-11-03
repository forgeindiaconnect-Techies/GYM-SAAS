import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export const CustomerGymScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gymDetails, setGymDetails] = useState<any>(null);
  const [trainers, setTrainers] = useState<any[]>([]);

  const fetchGymData = useCallback(async () => {
    try {
      const [gymRes, trainersRes] = await Promise.allSettled([
        api.get('/gyms/my-gym').catch(() => api.get('/gyms')),
        api.get('/trainers/my-gym').catch(() => api.get('/trainers')),
      ]);

      if (gymRes.status === 'fulfilled' && gymRes.value.data) {
        const gym = gymRes.value.data.gym || (Array.isArray(gymRes.value.data) ? gymRes.value.data[0] : gymRes.value.data);
        setGymDetails(gym);
      }

      if (trainersRes.status === 'fulfilled' && trainersRes.value.data) {
        const list = trainersRes.value.data.trainers || (Array.isArray(trainersRes.value.data) ? trainersRes.value.data : []);
        setTrainers(list);
      }
    } catch (err) {
      console.log('[CustomerGym] Live gym load note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGymData();
  }, [fetchGymData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGymData();
  };

  const gymName = gymDetails?.name || user?.gymName || 'Gymora Flagship Arena';
  const gymAddress = gymDetails?.address || gymDetails?.location || 'Indiranagar Main Branch, Bengaluru';
  const gymPhone = gymDetails?.phone || '+91 80 4123 4567';
  const operatingHours = gymDetails?.operatingHours || 'Mon - Sat: 5:30 AM - 10:30 PM | Sun: 7:00 AM - 8:00 PM';

  const facilities = [
    { icon: 'barbell-outline', title: 'Strength & Free Weights', desc: 'Olympic lifting platforms & dumbbells' },
    { icon: 'speedometer-outline', title: 'Cardio Deck', desc: 'Treadmills, rowers & ellipticals' },
    { icon: 'flame-outline', title: 'CrossFit & HIIT Arena', desc: 'Turf track, battle ropes & kettlebells' },
    { icon: 'water-outline', title: 'Steam & Recovery Spa', desc: 'Sauna, steam bath & cold recovery' },
    { icon: 'nutrition-outline', title: 'Juice & Protein Bar', desc: 'Fresh shakes, pre-workouts & protein snacks' },
    { icon: 'shield-checkmark-outline', title: 'Smart Lockers & Showers', desc: 'RFID digital lockers & clean showers' },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Gym Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.statusBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.statusText}>Open Now • Verified Arena</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.ratingText}>★ 4.9 Rating</Text>
          </View>
        </View>

        <Text style={styles.gymTitle}>{gymName}</Text>
        <Text style={styles.gymAddress}>
          <Ionicons name="location-outline" size={13} color={COLORS.primaryLight} />
          {' '}{gymAddress}
        </Text>

        <View style={styles.timingRow}>
          <Ionicons name="time-outline" size={14} color={COLORS.primaryLight} />
          <Text style={styles.timeText}>{operatingHours}</Text>
        </View>
      </View>

      {/* Quick Contact & Directions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => Linking.openURL(`tel:${gymPhone.replace(/\s+/g, '')}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="call-outline" size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>Call Front Desk</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(gymAddress)}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>Directions</Text>
        </TouchableOpacity>
      </View>

      {/* Amenities & Zones */}
      <Text style={styles.sectionTitle}>Facilities & Amenities</Text>
      <View style={styles.facilityGrid}>
        {facilities.map((f, i) => (
          <View key={i} style={styles.facilityCard}>
            <View style={styles.facilityIcon}>
              <Ionicons name={f.icon as any} size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.facilityTitle}>{f.title}</Text>
              <Text style={styles.facilityDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Floor Coaches */}
      <Text style={styles.sectionTitle}>Certified Floor Coaches</Text>
      {loading && !refreshing ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />
      ) : trainers.length === 0 ? (
        <View style={styles.facilityCard}>
          <Text style={styles.facilityDesc}>Our certified strength coaches are on the floor to assist your workout.</Text>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          {trainers.slice(0, 4).map((t, i) => (
            <View key={t._id || i} style={styles.coachRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(t.name || 'T').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.coachName}>{t.name}</Text>
                <Text style={styles.coachSpec}>{t.specialization || 'Strength Coach'}</Text>
              </View>
              <View style={styles.expTag}>
                <Text style={styles.expTagText}>{t.experience || 'Certified'}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 14, paddingBottom: 110 },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  heroBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  statusText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: { fontSize: 10, fontWeight: '700', color: '#FBBF24' },
  gymTitle: { fontSize: 20, fontWeight: '900', color: COLORS.white },
  gymAddress: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, lineHeight: 16 },
  timingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  timeText: { fontSize: 10, color: COLORS.textMuted, flex: 1 },
  quickActions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  actionText: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  facilityGrid: { gap: 8, marginBottom: 16 },
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
  facilityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  facilityDesc: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: COLORS.white },
  coachName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  coachSpec: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  expTag: { backgroundColor: COLORS.background, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  expTagText: { fontSize: 9, fontWeight: '700', color: COLORS.textMedium },
});
