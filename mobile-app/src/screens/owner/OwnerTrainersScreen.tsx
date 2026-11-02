import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const OwnerTrainersScreen: React.FC = () => {
  const trainers = [
    { id: '1', name: 'Vikram Malhotra', specialty: 'Strength & Conditioning', rating: '★ 4.9', clients: 18, commission: '30%', phone: '+91 98111 22334' },
    { id: '2', name: 'Ananya Deshmukh', specialty: 'Yoga & Pilates', rating: '★ 4.8', clients: 14, commission: '30%', phone: '+91 98222 33445' },
    { id: '3', name: 'Karan Mehra', specialty: 'HIIT & Functional', rating: '★ 4.7', clients: 22, commission: '35%', phone: '+91 98333 44556' },
    { id: '4', name: 'Rohit Verma', specialty: 'Bodybuilding & Diet', rating: '★ 4.9', clients: 16, commission: '30%', phone: '+91 98444 55667' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerBox}>
        <View>
          <Text style={styles.headerTitle}>4 Certified Trainers</Text>
          <Text style={styles.headerSub}>Average Rating: 4.85 / 5.0</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Onboard</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {trainers.map((t) => (
          <View key={t.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{t.name.charAt(0)}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.trainerName}>{t.name}</Text>
                <Text style={styles.specialty}>{t.specialty}</Text>
                <View style={styles.tagsRow}>
                  <Text style={styles.rating}>{t.rating}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.clientsText}>{t.clients} active clients</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.commissionText}>Commission: <Text style={styles.commissionVal}>{t.commission}</Text></Text>
              <TouchableOpacity style={styles.callBtn}>
                <Ionicons name="call" size={13} color={COLORS.primary} />
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  headerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.darkBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  headerSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  list: { gap: 10 },
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
  cardInfo: { flex: 1 },
  trainerName: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  specialty: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 1 },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  rating: { fontSize: 11, fontWeight: '700', color: COLORS.amber },
  dot: { color: COLORS.textMuted, fontSize: 10 },
  clientsText: { fontSize: 11, color: COLORS.textMuted },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  commissionText: { fontSize: 11, color: COLORS.textMedium },
  commissionVal: { fontWeight: '700', color: COLORS.textDark },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  callText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
});

