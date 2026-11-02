import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const CustomerTrainersScreen: React.FC = () => {
  const [bookedId, setBookedId] = useState<string | null>(null);

  const trainers = [
    { id: '1', name: 'Vikram Malhotra', specialty: 'Strength & Body Transformation', rating: '★ 4.9', reviews: 128, rate: '₹800/session', slot: 'Today, 06:00 PM' },
    { id: '2', name: 'Ananya Deshmukh', specialty: 'Yoga, Posture & Core', rating: '★ 4.8', reviews: 94, rate: '₹750/session', slot: 'Tomorrow, 07:30 AM' },
    { id: '3', name: 'Karan Mehra', specialty: 'HIIT & Athletic Conditioning', rating: '★ 4.7', reviews: 110, rate: '₹700/session', slot: 'Today, 04:30 PM' },
    { id: '4', name: 'Rohit Verma', specialty: 'Bodybuilding & Powerlifting', rating: '★ 4.9', reviews: 156, rate: '₹900/session', slot: 'Wednesday, 05:00 PM' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>1-on-1 Elite Trainers</Text>
        <Text style={styles.bannerSub}>Book certified coaches for personalized workout guidance</Text>
      </View>

      <View style={styles.list}>
        {trainers.map((t) => {
          const isBooked = bookedId === t.id;
          return (
            <View key={t.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{t.name.charAt(0)}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.trainerName}>{t.name}</Text>
                  <Text style={styles.specialty}>{t.specialty}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.rating}>{t.rating}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.reviewsText}>{t.reviews} reviews</Text>
                  </View>
                </View>
              </View>

              <View style={styles.slotRow}>
                <Ionicons name="calendar-outline" size={13} color={COLORS.primary} />
                <Text style={styles.slotText}>Next Slot: <Text style={styles.bold}>{t.slot}</Text></Text>
              </View>

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.rateLabel}>Session Fee</Text>
                  <Text style={styles.rateVal}>{t.rate}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.bookBtn, isBooked && styles.bookBtnDone]}
                  onPress={() => setBookedId(t.id)}
                  disabled={isBooked}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  bannerSub: { fontSize: 11, color: '#FED7AA', marginTop: 2 },
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  info: { flex: 1 },
  trainerName: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  specialty: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  rating: { fontSize: 11, fontWeight: '700', color: COLORS.amber },
  dot: { color: COLORS.textMuted, fontSize: 10 },
  reviewsText: { fontSize: 11, color: COLORS.textMuted },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  slotText: { fontSize: 10, color: COLORS.textMedium },
  bold: { fontWeight: '700', color: COLORS.textDark },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  rateLabel: { fontSize: 9, color: COLORS.textMuted },
  rateVal: { fontSize: 12, fontWeight: '800', color: COLORS.textDark, marginTop: 1 },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bookBtnDone: { backgroundColor: COLORS.emeraldLight },
  bookBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  bookBtnTextDone: { color: COLORS.emerald },
});

