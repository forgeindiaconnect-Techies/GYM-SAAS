import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const TrainerEarningsScreen: React.FC = () => {
  const [requested, setRequested] = useState(false);

  const earnings = [
    { id: '1', client: 'Naveen Kumar', sessions: '12 Personal Sessions', amount: '+₹9,600', date: 'Today' },
    { id: '2', client: 'Priya Sharma', sessions: '8 Fat Loss Sessions', amount: '+₹6,400', date: 'Yesterday' },
    { id: '3', client: 'Rahul Varma', sessions: '15 Strength Sessions', amount: '+₹12,000', date: '28 Oct' },
    { id: '4', client: 'Performance Bonus', sessions: 'Top Monthly Coach', amount: '+₹5,000', date: '25 Oct' },
    { id: '5', client: 'Vikram Singh', sessions: '6 Rehab Sessions', amount: '+₹4,800', date: '22 Oct' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.walletCard}>
        <View style={styles.walletTop}>
          <Text style={styles.walletLabel}>Available Balance</Text>
          <View style={styles.splitPill}>
            <Text style={styles.splitText}>30% Commission Split</Text>
          </View>
        </View>
        <Text style={styles.balanceText}>₹37,800</Text>
        <Text style={styles.totalText}>Total earned this month: ₹64,200</Text>

        <TouchableOpacity 
          style={[styles.withdrawBtn, requested && styles.withdrawBtnDisabled]}
          onPress={() => setRequested(true)}
          disabled={requested}
        >
          <Text style={styles.withdrawBtnText}>
            {requested ? 'Withdrawal Pending Approval' : 'Withdraw to Bank Account'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Commission Breakdown</Text>
      <View style={styles.card}>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>1-on-1 PT Session</Text>
          <Text style={styles.rateVal}>₹800 / hr (Trainer: 70%)</Text>
        </View>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Group Class Session</Text>
          <Text style={styles.rateVal}>₹250 / attendee</Text>
        </View>
        <View style={[styles.rateRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.rateLabel}>Milestone (&gt;40 hrs)</Text>
          <Text style={[styles.rateVal, { color: COLORS.emerald }]}>+₹5,000 bonus</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Session Credits</Text>
      <View style={styles.card}>
        {earnings.map((e) => (
          <View key={e.id} style={styles.row}>
            <View>
              <Text style={styles.clientName}>{e.client}</Text>
              <Text style={styles.sessionsText}>{e.sessions}</Text>
            </View>
            <View style={styles.amountRight}>
              <Text style={styles.amountText}>{e.amount}</Text>
              <Text style={styles.dateText}>{e.date}</Text>
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
  walletCard: {
    backgroundColor: COLORS.darkBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  splitPill: { backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  splitText: { color: COLORS.emerald, fontSize: 10, fontWeight: '700' },
  balanceText: { color: COLORS.white, fontSize: 30, fontWeight: '800', marginVertical: 6 },
  totalText: { color: COLORS.textMuted, fontSize: 11, marginBottom: 16 },
  withdrawBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  withdrawBtnDisabled: { opacity: 0.6 },
  withdrawBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  rateLabel: { fontSize: 12, color: COLORS.textMedium },
  rateVal: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  clientName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  sessionsText: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  amountRight: { alignItems: 'flex-end' },
  amountText: { fontSize: 13, fontWeight: '800', color: COLORS.emerald },
  dateText: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
});

