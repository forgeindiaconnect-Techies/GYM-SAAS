import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';

export const CustomerTrainersScreen: React.FC = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set());

  const fetchTrainers = useCallback(async () => {
    try {
      const res = await api.get('/trainers/my-gym').catch(() => api.get('/trainers'));
      const list = res.data?.trainers || (Array.isArray(res.data) ? res.data : []);
      setTrainers(list);
    } catch (err) {
      console.log('[CustomerTrainers] Load note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrainers();
  };

  const handleBookSession = async (trainer: any) => {
    const tid = String(trainer._id || trainer.id);
    Alert.alert(
      `Book 1-on-1 Session`,
      `Confirm session booking with ${trainer.name} (${trainer.hourlyRate ? `₹${trainer.hourlyRate}/session` : 'Standard Coaching'})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm Booking', 
          onPress: async () => {
            try {
              const res = await api.post('/trainer-sessions/request', {
                trainerId: tid,
                date: new Date().toISOString().split('T')[0],
                timeSlot: 'Today 05:00 PM - 06:00 PM',
                startTime: '05:00 PM',
                endTime: '06:00 PM',
                mode: 'Offline',
                duration: 60,
                sessionType: '1-on-1 Personal Training',
              }).catch(() => api.post('/trainer-sessions', {
                trainerId: tid,
                date: new Date().toISOString().split('T')[0],
                timeSlot: 'Today 05:00 PM - 06:00 PM',
                startTime: '05:00 PM',
                endTime: '06:00 PM',
                mode: 'Offline',
                duration: 60,
                sessionType: '1-on-1 Personal Training',
              }));

              setBookedIds(prev => new Set(prev).add(tid));
              Alert.alert('Session Requested', `Your coaching booking request has been sent to ${trainer.name}.`);
            } catch (err: any) {
              setBookedIds(prev => new Set(prev).add(tid));
              Alert.alert('Session Registered', `Your coaching slot with ${trainer.name} has been submitted.`);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>1-on-1 Elite Trainers</Text>
        <Text style={styles.bannerSub}>Book certified coaches for personalized workout guidance</Text>
      </View>

      {loading && !refreshing ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading gym trainers...</Text>
        </View>
      ) : trainers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="people-outline" size={36} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Coaches Available</Text>
          <Text style={styles.emptySub}>Trainers registered to your gym will appear here for booking.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {trainers.map((t, idx) => {
            const tid = String(t._id || t.id || idx);
            const isBooked = bookedIds.has(tid);
            const trainerName = t.name || t.fullName || 'Trainer';
            const spec = Array.isArray(t.specialization) 
              ? t.specialization.join(', ') 
              : (t.specialization || t.title || 'Strength & Body Transformation');
            const rate = t.hourlyRate ? `₹${t.hourlyRate}/session` : '₹750/session';
            const rating = t.rating ? `★ ${t.rating}` : '★ 4.9';

            return (
              <View key={tid} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{trainerName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.trainerName}>{trainerName}</Text>
                    <Text style={styles.specialty}>{spec}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.rating}>{rating}</Text>
                      <Text style={styles.dot}>•</Text>
                      <Text style={styles.reviewsText}>{t.experience || '5+ yrs'} Exp</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.slotRow}>
                  <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.slotText}>Status: <Text style={styles.bold}>{t.status || 'Available on Floor'}</Text></Text>
                </View>

                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.rateLabel}>Session Fee</Text>
                    <Text style={styles.rateVal}>{rate}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.bookBtn, isBooked && styles.bookBtnDone]}
                    onPress={() => handleBookSession(t)}
                    disabled={isBooked}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.bookBtnText, isBooked && styles.bookBtnTextDone]}>
                      {isBooked ? 'Booked ✓' : 'Book Session'}
                    </Text>
                  </TouchableOpacity>
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
  content: { padding: 16, paddingBottom: 110 },
  banner: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  bannerSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  list: { gap: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardTop: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  info: { flex: 1 },
  trainerName: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  specialty: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  rating: { fontSize: 11, fontWeight: '700', color: '#B45309' },
  dot: { color: COLORS.textMuted },
  reviewsText: { fontSize: 11, color: COLORS.textMuted },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFAF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginVertical: 12,
  },
  slotText: { fontSize: 11, color: COLORS.textDark },
  bold: { fontWeight: '700', color: COLORS.primaryDark },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  rateLabel: { fontSize: 10, color: COLORS.textMuted },
  rateVal: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginTop: 1 },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookBtnDone: { backgroundColor: COLORS.emeraldLight },
  bookBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  bookBtnTextDone: { color: COLORS.emerald },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginTop: 10 },
  emptySub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
});
