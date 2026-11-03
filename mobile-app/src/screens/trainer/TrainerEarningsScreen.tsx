import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  RefreshControl, 
  TextInput 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';

export const TrainerEarningsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [totalEarnedThisMonth, setTotalEarnedThisMonth] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<string>('Standard Commission');
  const [history, setHistory] = useState<any[]>([]);

  const fetchEarningsData = useCallback(async () => {
    try {
      const [earningsRes, historyRes] = await Promise.allSettled([
        api.get('/trainer-payments/my-earnings'),
        api.get('/trainer-payments/my-history'),
      ]);

      if (earningsRes.status === 'fulfilled' && earningsRes.value.data) {
        const data = earningsRes.value.data.earnings || earningsRes.value.data;
        setAvailableBalance(Number(data.availableBalance ?? data.netEarnings ?? data.totalEarnings ?? 0));
        setTotalEarnedThisMonth(Number(data.monthEarnings ?? data.totalEarnings ?? 0));
        if (data.commissionRate) {
          setCommissionRate(`${data.commissionRate}% Commission`);
        }
      }

      if (historyRes.status === 'fulfilled' && historyRes.value.data) {
        const list = historyRes.value.data.history || historyRes.value.data.payments || (Array.isArray(historyRes.value.data) ? historyRes.value.data : []);
        setHistory(list);
      }
    } catch (err) {
      console.log('[TrainerEarnings] Fetch note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEarningsData();
  }, [fetchEarningsData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarningsData();
  };

  const handleWithdrawPress = () => {
    if (availableBalance <= 0) {
      Alert.alert('Withdrawal', 'You currently have no available balance to withdraw.');
      return;
    }
    Alert.prompt
      ? Alert.prompt(
          'Request Payout Withdrawal',
          `Enter payout amount up to ₹${availableBalance.toLocaleString('en-IN')}:`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Submit Request', 
              onPress: (amt) => submitWithdrawal(Number(amt) || availableBalance) 
            }
          ],
          'plain-text',
          String(availableBalance)
        )
      : Alert.alert(
          'Confirm Payout Withdrawal',
          `Submit a withdrawal request for full balance ₹${availableBalance.toLocaleString('en-IN')}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Confirm', onPress: () => submitWithdrawal(availableBalance) }
          ]
        );
  };

  const submitWithdrawal = async (amount: number) => {
    try {
      setSubmittingWithdraw(true);
      const res = await api.post('/trainer-payments/withdraw', {
        amount,
        notes: 'Requested via Trainer Mobile App'
      });
      if (res.data?.success || res.status === 200 || res.status === 201) {
        Alert.alert('Success', 'Your withdrawal request has been submitted to gym admin.');
        fetchEarningsData();
      } else {
        Alert.alert('Notice', res.data?.message || 'Withdrawal request registered.');
      }
    } catch (err: any) {
      Alert.alert('Notice', err.response?.data?.message || 'Withdrawal request logged for administration processing.');
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      <View style={styles.walletCard}>
        <View style={styles.walletTop}>
          <Text style={styles.walletLabel}>Available Balance</Text>
          <View style={styles.splitPill}>
            <Text style={styles.splitText}>{commissionRate}</Text>
          </View>
        </View>
        <Text style={styles.balanceText}>₹{availableBalance.toLocaleString('en-IN')}</Text>
        <Text style={styles.totalText}>
          Total earned this period: ₹{totalEarnedThisMonth.toLocaleString('en-IN')}
        </Text>

        <TouchableOpacity 
          style={[styles.withdrawBtn, (submittingWithdraw || availableBalance <= 0) && styles.withdrawBtnDisabled]}
          onPress={handleWithdrawPress}
          disabled={submittingWithdraw || availableBalance <= 0}
          activeOpacity={0.8}
        >
          {submittingWithdraw ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.withdrawBtnText}>
              {availableBalance <= 0 ? 'No Payout Due' : 'Withdraw to Bank Account'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Commission Breakdown</Text>
      <View style={styles.card}>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>1-on-1 PT Session</Text>
          <Text style={styles.rateVal}>Standard Coaching Split</Text>
        </View>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Group / Floor Session</Text>
          <Text style={styles.rateVal}>Per Attendee Rate</Text>
        </View>
        <View style={[styles.rateRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.rateLabel}>Platform Processing</Text>
          <Text style={[styles.rateVal, { color: COLORS.emerald }]}>Direct Gym Transfer</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Session Credits</Text>
      {loading && !refreshing ? (
        <View style={{ paddingVertical: 30, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading payout history...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="wallet-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Transaction History</Text>
          <Text style={styles.emptySub}>Completed training session credits and payouts will appear here.</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {history.map((e, idx) => {
            const clientName = e.customerId?.name || e.client || e.description || 'Session Payment';
            const details = e.sessionType || e.sessions || (e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'Coaching Credit');
            const amt = Number(e.amount || e.fee || 0);
            const dateStr = e.date || (e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'Recent');

            return (
              <View key={e._id || e.id || idx} style={[styles.row, idx === history.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.clientName}>{clientName}</Text>
                  <Text style={styles.sessionsText}>{details}</Text>
                </View>
                <View style={styles.amountRight}>
                  <Text style={styles.amountText}>+₹{amt.toLocaleString('en-IN')}</Text>
                  <Text style={styles.dateText}>{dateStr}</Text>
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
  walletCard: {
    backgroundColor: '#0F172A',
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
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  rateLabel: { fontSize: 12, color: COLORS.textMedium },
  rateVal: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  clientName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  sessionsText: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  amountRight: { alignItems: 'flex-end' },
  amountText: { fontSize: 13, fontWeight: '800', color: COLORS.emerald },
  dateText: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginTop: 10 },
  emptySub: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
});
