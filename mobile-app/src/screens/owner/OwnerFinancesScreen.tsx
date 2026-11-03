import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const OwnerFinancesScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'payments'>('analytics');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Completed' | 'Pending' | 'Overdue'>('All');

  // Record payment modal
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPlan, setPaymentPlan] = useState('Gold Annual');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card'>('UPI');

  const [transactions, setTransactions] = useState([
    { id: 'INV-2026-1092', user: 'Naveen Kumar', category: 'Membership Collection', type: 'Annual Subscription', amount: '+₹18,000', method: 'UPI', date: 'Today, 2:15 PM', status: 'Completed' },
    { id: 'INV-2026-1091', user: 'Vikram Malhotra', category: 'Trainer Payout', type: 'Trainer Commission Payout', amount: '-₹24,500', method: 'Bank Transfer', date: 'Yesterday', status: 'Completed' },
    { id: 'INV-2026-1090', user: 'Priya Sharma', category: 'Membership Collection', type: 'Quarterly Renewal', amount: '+₹6,500', method: 'Card', date: '28 Oct', status: 'Completed' },
    { id: 'INV-2026-1089', user: 'Gymora Store #441', category: 'Store Sales', type: 'Supplements & Whey Protein', amount: '+₹8,450', method: 'UPI', date: '28 Oct', status: 'Completed' },
    { id: 'INV-2026-1088', user: 'Rahul Varma', category: 'Membership Collection', type: 'Platinum VIP Membership', amount: '+₹24,000', method: 'UPI', date: '27 Oct', status: 'Completed' },
    { id: 'INV-2026-1087', user: 'Divya Iyer', category: 'Membership Collection', type: 'Gold Annual Renewal Due', amount: '₹18,000', method: 'Pending Invoice', date: 'Due in 3 days', status: 'Pending' },
    { id: 'INV-2026-1086', user: 'Karan Mehra', category: 'Trainer Payout', type: 'PT Session Commission', amount: '-₹14,200', method: 'Bank Transfer', date: '25 Oct', status: 'Completed' },
    { id: 'INV-2026-1085', user: 'Sneha Patel', category: 'Membership Collection', type: 'Monthly Pass Renewal', amount: '₹2,500', method: 'Overdue Notice', date: 'Overdue by 3 days', status: 'Overdue' },
  ]);

  const filteredPayments = transactions.filter((t) => {
    if (paymentFilter === 'All') return true;
    return t.status === paymentFilter;
  });

  const handleDownloadStatement = () => {
    Alert.alert(
      'Download Financial Statement',
      'October 2026 Chartered Statement (PDF) has been generated with transaction hash and sent to your registered owner email.'
    );
  };

  const handleDownloadInvoice = (id: string, user: string) => {
    Alert.alert(
      'Tax Invoice Downloaded',
      `Official GST invoice for ${id} (${user}) saved to your mobile documents folder.`
    );
  };

  const handleSavePayment = () => {
    if (!payerName.trim() || !paymentAmount.trim()) {
      Alert.alert('Required Fields', 'Please enter Member Name and Amount paid.');
      return;
    }

    const newTx = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      user: payerName.trim(),
      category: 'Membership Collection',
      type: `${paymentPlan} - Offline`,
      amount: `+₹${paymentAmount.trim()}`,
      method: paymentMethod,
      date: 'Just now',
      status: 'Completed'
    };

    setTransactions([newTx, ...transactions]);
    setPayerName('');
    setPaymentAmount('');
    setRecordModalVisible(false);

    Alert.alert('Payment Recorded', `Receipt generated for ${newTx.user} for ${newTx.amount} via ${newTx.method}.`);
  };

  return (
    <View style={styles.container}>
      {/* Top Segmented Selector */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'analytics' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('analytics')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="trending-up" 
            size={16} 
            color={activeTab === 'analytics' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.segmentText, activeTab === 'analytics' && styles.segmentTextActive]}>
            Revenue & Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'payments' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="receipt" 
            size={16} 
            color={activeTab === 'payments' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.segmentText, activeTab === 'payments' && styles.segmentTextActive]}>
            Membership Payments
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'analytics' ? (
          <>
            {/* Revenue Overview Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.summaryLabel}>Total Net Revenue</Text>
                  <Text style={styles.summaryValue}>₹4,82,000</Text>
                  <Text style={styles.summarySub}>October 2026 Accounting Period</Text>
                </View>
                <TouchableOpacity 
                  style={styles.pdfDownloadBtn}
                  onPress={handleDownloadStatement}
                  activeOpacity={0.7}
                >
                  <Ionicons name="document-text-outline" size={16} color={COLORS.white} />
                  <Text style={styles.pdfBtnText}>Export PDF</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.splitRow}>
                <View style={styles.splitCol}>
                  <Text style={styles.splitLabel}>Total Inflow</Text>
                  <Text style={[styles.splitVal, { color: COLORS.emerald }]}>₹5,42,000</Text>
                  <Text style={styles.splitSub}>+18% vs Sep</Text>
                </View>
                <View style={styles.splitCol}>
                  <Text style={styles.splitLabel}>Total Outflow</Text>
                  <Text style={[styles.splitVal, { color: COLORS.rose }]}>₹60,000</Text>
                  <Text style={styles.splitSub}>Trainer Payouts & Ops</Text>
                </View>
              </View>
            </View>

            {/* Inflow vs Outflow Categories Breakdown */}
            <Text style={styles.sectionTitle}>Financial Breakdown</Text>
            <View style={styles.categoryCard}>
              {/* Membership Collections */}
              <View style={styles.catRow}>
                <View style={[styles.catIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="people" size={18} color={COLORS.blue} />
                </View>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <View style={styles.catHeader}>
                    <Text style={styles.catTitle}>Membership Collections</Text>
                    <Text style={[styles.catAmount, { color: COLORS.emerald }]}>₹3,80,000</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '70%', backgroundColor: COLORS.blue }]} />
                  </View>
                  <Text style={styles.catSub}>70% of total revenue • 82 renewals</Text>
                </View>
              </View>

              {/* Store Sales */}
              <View style={styles.catRow}>
                <View style={[styles.catIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="cart" size={18} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <View style={styles.catHeader}>
                    <Text style={styles.catTitle}>Store & Supplements Sales</Text>
                    <Text style={[styles.catAmount, { color: COLORS.emerald }]}>₹1,62,000</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '30%', backgroundColor: COLORS.primary }]} />
                  </View>
                  <Text style={styles.catSub}>30% of total revenue • 142 orders</Text>
                </View>
              </View>

              {/* Trainer Payouts */}
              <View style={styles.catRow}>
                <View style={[styles.catIconBox, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="cash" size={18} color={COLORS.amber} />
                </View>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <View style={styles.catHeader}>
                    <Text style={styles.catTitle}>Trainer Commissions & Payouts</Text>
                    <Text style={[styles.catAmount, { color: COLORS.rose }]}>-₹42,000</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '70%', backgroundColor: COLORS.amber }]} />
                  </View>
                  <Text style={styles.catSub}>4 certified coaches compensated</Text>
                </View>
              </View>

              {/* Platform & Maintenance */}
              <View style={[styles.catRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <View style={[styles.catIconBox, { backgroundColor: '#FDF2F8' }]}>
                  <Ionicons name="construct" size={18} color="#DB2777" />
                </View>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <View style={styles.catHeader}>
                    <Text style={styles.catTitle}>Platform & Facility Maintenance</Text>
                    <Text style={[styles.catAmount, { color: COLORS.rose }]}>-₹18,000</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '30%', backgroundColor: '#DB2777' }]} />
                  </View>
                  <Text style={styles.catSub}>SaaS license & gym maintenance</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Membership Payments Controls */}
            <View style={styles.paymentsHeaderRow}>
              <View style={styles.paymentsHeaderLeft}>
                <Text style={styles.sectionTitle}>Collections History</Text>
                <Text style={styles.sectionSub}>All member dues & renewal invoices</Text>
              </View>
              <TouchableOpacity 
                style={styles.recordBtn}
                onPress={() => setRecordModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color={COLORS.white} />
                <Text style={styles.recordBtnText}>Record Payment</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Chips */}
            <View style={styles.filtersRow}>
              {(['All', 'Completed', 'Pending', 'Overdue'] as const).map((tab) => {
                const isActive = paymentFilter === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setPaymentFilter(tab)}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Transactions List */}
            <View style={styles.list}>
              {filteredPayments.map((t) => (
                <View key={t.id} style={styles.txCard}>
                  <View style={styles.txTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txUser}>{t.user}</Text>
                      <Text style={styles.txType}>{t.type}</Text>
                    </View>
                    <View style={styles.txRightCol}>
                      <Text style={[
                        styles.txAmount, 
                        t.amount.startsWith('+') ? { color: COLORS.emerald } : 
                        t.amount.startsWith('-') ? { color: COLORS.rose } : 
                        { color: COLORS.textDark }
                      ]}>
                        {t.amount}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        t.status === 'Completed' ? styles.bgActive :
                        t.status === 'Pending' ? styles.bgPending : styles.bgOverdue
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          t.status === 'Completed' ? styles.textActive :
                          t.status === 'Pending' ? styles.textPending : styles.textOverdue
                        ]}>
                          {t.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.txBottom}>
                    <View>
                      <Text style={styles.txInvoiceId}>{t.id} • {t.method}</Text>
                      <Text style={styles.txDate}>{t.date}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.invoiceBtn}
                      onPress={() => handleDownloadInvoice(t.id, t.user)}
                    >
                      <Ionicons name="receipt-outline" size={13} color={COLORS.primary} />
                      <Text style={styles.invoiceBtnText}>Receipt</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* RECORD PAYMENT MODAL */}
      <Modal visible={recordModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Offline Payment</Text>
              <TouchableOpacity onPress={() => setRecordModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Member Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Naveen Kumar"
              placeholderTextColor={COLORS.textMuted}
              value={payerName}
              onChangeText={setPayerName}
            />

            <Text style={styles.inputLabel}>Amount (₹) *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 18000"
              placeholderTextColor={COLORS.textMuted}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Membership Plan</Text>
            <View style={styles.planSelectorRow}>
              {['Gold Annual', 'Silver Quarterly', 'Monthly Pass'].map((plan) => (
                <TouchableOpacity
                  key={plan}
                  style={[styles.planChip, paymentPlan === plan && styles.planChipActive]}
                  onPress={() => setPaymentPlan(plan)}
                >
                  <Text style={[styles.planChipText, paymentPlan === plan && styles.planChipTextActive]}>
                    {plan}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.planSelectorRow}>
              {(['UPI', 'Cash', 'Card'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.planChip, paymentMethod === m && styles.planChipActive]}
                  onPress={() => setPaymentMethod(m)}
                >
                  <Text style={[styles.planChipText, paymentMethod === m && styles.planChipTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setRecordModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitBtn} 
                onPress={handleSavePayment}
              >
                <Text style={styles.modalSubmitText}>Save & Issue Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primaryLight,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.primary,
  },
  scrollArea: {
    flex: 1,
  },
  content: { 
    padding: 16, 
    paddingBottom: 110 
  },
  summaryCard: {
    backgroundColor: COLORS.darkBg,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: { 
    color: COLORS.textMuted, 
    fontSize: 11, 
    fontWeight: '600' 
  },
  summaryValue: { 
    color: COLORS.white, 
    fontSize: 26, 
    fontWeight: '800', 
    marginVertical: 4 
  },
  summarySub: { 
    color: COLORS.textMuted, 
    fontSize: 11 
  },
  pdfDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pdfBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkBorder,
  },
  splitCol: { 
    flex: 1 
  },
  splitLabel: { 
    color: COLORS.textMuted, 
    fontSize: 10, 
    fontWeight: '600' 
  },
  splitVal: { 
    fontSize: 17, 
    fontWeight: '800', 
    marginTop: 3 
  },
  splitSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  catIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  catSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  paymentsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentsHeaderLeft: {
    flex: 1,
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  recordBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  filtersRow: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary 
  },
  filterText: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: COLORS.textMedium 
  },
  filterTextActive: { 
    color: COLORS.white, 
    fontWeight: '700' 
  },
  list: {
    gap: 10,
  },
  txCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txUser: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  txType: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  txRightCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  bgActive: { backgroundColor: COLORS.emeraldLight },
  textActive: { color: COLORS.emerald },
  bgPending: { backgroundColor: '#FEF3C7' },
  textPending: { color: '#D97706' },
  bgOverdue: { backgroundColor: COLORS.roseLight },
  textOverdue: { color: COLORS.rose },
  txBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  txInvoiceId: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  txDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },
  invoiceBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 12,
    fontWeight: '600',
  },
  planSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  planChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  planChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  planChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  planChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.textMedium,
    fontSize: 13,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
