import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const OwnerFinancesScreen: React.FC = () => {
  const transactions = [
    { id: 'TX-1092', user: 'Naveen Kumar', type: 'Annual Subscription', amount: '+₹18,000', positive: true, date: 'Today, 2:15 PM' },
    { id: 'TX-1091', user: 'Vikram Malhotra', type: 'Trainer Commission', amount: '-₹24,500', positive: false, date: 'Yesterday' },
    { id: 'TX-1090', user: 'Priya Sharma', type: 'Quarterly Renewal', amount: '+₹6,500', positive: true, date: '28 Oct' },
    { id: 'TX-1089', user: 'Rahul Varma', type: 'Platinum Pass', amount: '+₹24,000', positive: true, date: '27 Oct' },
    { id: 'TX-1088', user: 'Gymora Cloud', type: 'SaaS Platform Fee', amount: '-₹4,999', positive: false, date: '25 Oct' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Revenue Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Net Revenue</Text>
        <Text style={styles.summaryValue}>₹4,82,000</Text>
        <Text style={styles.summarySub}>October 2026 Accounting Period</Text>

        <View style={styles.splitRow}>
          <View style={styles.splitCol}>
            <Text style={styles.splitLabel}>Total Inflow</Text>
            <Text style={[styles.splitVal, { color: COLORS.emerald }]}>₹5,42,000</Text>
          </View>
          <View style={styles.splitCol}>
            <Text style={styles.splitLabel}>Total Outflow</Text>
            <Text style={[styles.splitVal, { color: COLORS.rose }]}>₹60,000</Text>
          </View>
        </View>
      </View>

      <View style={styles.transHeader}>
        <Text style={styles.transTitle}>Recent Transactions</Text>
        <TouchableOpacity>
          <Text style={styles.downloadText}>Download PDF</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {transactions.map((t) => (
          <View key={t.id} style={styles.txRow}>
            <View style={styles.txLeft}>
              <View style={[styles.txIconBox, { backgroundColor: t.positive ? COLORS.emeraldLight : COLORS.roseLight }]}>
                <Ionicons 
                  name={t.positive ? 'arrow-down-outline' : 'arrow-up-outline'} 
                  size={16} 
                  color={t.positive ? COLORS.emerald : COLORS.rose} 
                />
              </View>
              <View>
                <Text style={styles.txUser}>{t.user}</Text>
                <Text style={styles.txType}>{t.type}</Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={[styles.txAmount, { color: t.positive ? COLORS.emerald : COLORS.textDark }]}>
                {t.amount}
              </Text>
              <Text style={styles.txDate}>{t.date}</Text>
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
  summaryCard: {
    backgroundColor: COLORS.darkBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  summaryLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  summaryValue: { color: COLORS.white, fontSize: 28, fontWeight: '800', marginVertical: 4 },
  summarySub: { color: COLORS.textMuted, fontSize: 11 },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBorder,
  },
  splitCol: { flex: 1 },
  splitLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  splitVal: { fontSize: 16, fontWeight: '800', marginTop: 3 },
  transHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  downloadText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  list: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  txIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txUser: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  txType: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 13, fontWeight: '800' },
  txDate: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
});

