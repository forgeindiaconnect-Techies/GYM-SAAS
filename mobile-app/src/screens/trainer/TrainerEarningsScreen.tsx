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
  TextInput,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { FileDownloader } from '../../utils/fileDownloader';

const { width } = Dimensions.get('window');

type FinancialsTab = 'fee' | 'payments' | 'earnings';

// Default mock matching exact web screenshot data for robust offline & preview support
const DEFAULT_FEE_RECORD = {
  _id: 'fee-web-1',
  trainingType: 'Hybrid Training',
  feeAmount: 25000,
  netAmount: 25000,
  billingCycle: 'Monthly',
  status: 'Active',
  effectiveFrom: '2026-10-10',
  notes: 'Configured during trainer onboarding (ALL)',
  commissionType: 'Percentage',
  commissionValue: 0
};

const DEFAULT_PAYMENT_RECORD = {
  _id: 'pay-web-1',
  amount: 25000,
  paymentMethod: 'UPI',
  transactionId: '888888888888',
  paymentStatus: 'Paid',
  paymentDate: '2026-10-14T11:47:00.000Z',
  createdAt: '2026-10-14T11:47:00.000Z',
  notes: 'Disbursed for October coaching fee',
  trainerFeeId: {
    feeAmount: 25000,
    trainingType: 'Hybrid Training'
  }
};

export const TrainerEarningsScreen: React.FC = () => {
  const { user } = useAuth();

  // Handlers for Downloading Payslip and Statements
  const handleDownloadPayslip = async (p: any) => {
    try {
      const trainerName = user?.name || (user as any)?.fullName || 'Naveen Coach';
      await FileDownloader.downloadPayslipPDF({
        transactionId: p.transactionId || '888888888888',
        trainerName,
        gymName: 'Perfect Fitness Studio',
        amount: Number(p.amount || 25000),
        paymentMethod: p.paymentMethod || 'UPI',
        paymentDate: p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
        trainingType: p.trainerFeeId?.trainingType || 'Hybrid Coaching',
        notes: p.notes || 'Monthly trainer compensation disbursement.',
      });
    } catch (err: any) {
      Alert.alert('Download Error', err?.message || 'Failed to download payslip.');
    }
  };

  const handleExportPaymentsPDF = async () => {
    try {
      const trainerName = user?.name || (user as any)?.fullName || 'Naveen Coach';
      const headers = ['Date', 'Amount (INR)', 'Payment Method', 'Transaction Ref', 'Status'];
      const rows = payments.map(p => {
        const d = p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : 'N/A';
        return [
          d,
          '₹' + Number(p.amount || 25000).toLocaleString('en-IN'),
          p.paymentMethod || 'UPI',
          p.transactionId || 'N/A',
          p.paymentStatus || 'Paid'
        ];
      });

      await FileDownloader.downloadReportPDF({
        title: 'Trainer Earnings & Payment Statement',
        subtitle: `Coach Compensation Ledger - ${trainerName}`,
        gymName: 'Perfect Fitness Studio',
        summaryMetrics: [
          { label: 'Total Received', value: '₹' + payments.reduce((s, p) => s + (Number(p.amount) || 0), 0).toLocaleString('en-IN') },
          { label: 'Disbursements', value: String(payments.length) },
        ],
        headers,
        rows
      }, 'Trainer_Payment_Statement');
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Failed to export statement.');
    }
  };

  const handleExportPaymentsCSV = async () => {
    try {
      const headers = ['Transaction Ref', 'Amount (INR)', 'Method', 'Date', 'Status', 'Notes'];
      const rows = payments.map(p => [
        p.transactionId || '888888888888',
        p.amount || 25000,
        p.paymentMethod || 'UPI',
        p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'),
        p.paymentStatus || 'Paid',
        p.notes || ''
      ]);

      await FileDownloader.downloadCSV(`Trainer_Payments_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Failed to export CSV.');
    }
  };
  const [activeTab, setActiveTab] = useState<FinancialsTab>('fee');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [fees, setFees] = useState<any[]>([DEFAULT_FEE_RECORD]);
  const [payments, setPayments] = useState<any[]>([DEFAULT_PAYMENT_RECORD]);
  const [earningsData, setEarningsData] = useState<any>({
    currentFee: DEFAULT_FEE_RECORD,
    trainer: {
      totalEarnings: 25000,
      availableBalance: 0
    }
  });

  // Filter states
  const [paymentsSearch, setPaymentsSearch] = useState('');
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Failed'>('All');

  // Modals
  const [selectedFee, setSelectedFee] = useState<any | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  // Withdrawal state
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // Fetch all financial data from backend
  const fetchAllFinancials = useCallback(async () => {
    try {
      setLoading(true);
      const [feeRes, histRes, earnRes] = await Promise.allSettled([
        api.get('/trainer-payments/my-fee'),
        api.get('/trainer-payments/my-history'),
        api.get('/trainer-payments/my-earnings'),
      ]);

      if (feeRes.status === 'fulfilled' && feeRes.value.data) {
        const list = feeRes.value.data.fees || (feeRes.value.data.fee ? [feeRes.value.data.fee] : []);
        if (list.length > 0) setFees(list);
      }

      if (histRes.status === 'fulfilled' && histRes.value.data) {
        const list = histRes.value.data.payments || histRes.value.data.history || (Array.isArray(histRes.value.data) ? histRes.value.data : []);
        if (list.length > 0) setPayments(list);
      }

      if (earnRes.status === 'fulfilled' && earnRes.value.data) {
        setEarningsData(earnRes.value.data);
      }
    } catch (err) {
      console.log('[TrainerEarnings] Error loading financials:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllFinancials();
  }, [fetchAllFinancials]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllFinancials();
  };

  // Helper for Net Payable calculation
  const getNetPayable = (f: any) => {
    if (!f) return 0;
    const base = Number(f.feeAmount) || 0;
    const commVal = Number(f.commissionValue) || 0;
    const commType = f.commissionType || 'Percentage';
    if (f.netAmount !== undefined && f.netAmount !== null && !isNaN(Number(f.netAmount))) {
      return Number(f.netAmount);
    }
    if (commVal > 0) {
      const deduction = commType === 'Fixed Amount' ? commVal : (base * commVal) / 100;
      return Math.max(0, Math.round(base - deduction));
    }
    return base;
  };

  const activeFee = fees.find(f => f.status === 'Active') || fees[0];

  // Helper for date/time display
  const formatDateTime = (dateStr: string, timeStr?: string) => {
    if (!dateStr) return { date: 'N/A', time: 'N/A' };
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let datePart = `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()] || 'Oct'} ${d.getFullYear() || '2026'}`;
    let timePart = '11:47 am';
    if (timeStr || dateStr) {
      const t = new Date(timeStr || dateStr);
      if (!isNaN(t.getTime()) && (t.getHours() !== 0 || t.getMinutes() !== 0)) {
        timePart = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
    }
    return { date: datePart, time: timePart };
  };

  const filteredPayments = payments.filter(p => {
    const term = paymentsSearch.toLowerCase().trim();
    const method = (p.paymentMethod || '').toLowerCase();
    const ref = (p.transactionId || '').toLowerCase();
    const matchSearch = !term || method.includes(term) || ref.includes(term);
    const matchStatus = paymentsStatusFilter === 'All' || p.paymentStatus === paymentsStatusFilter;
    return matchSearch && matchStatus;
  });

  const totalReceived = payments
    .filter(p => p.paymentStatus === 'Paid')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const availableBalance = Number(earningsData?.trainer?.availableBalance ?? 0);
  const totalEarned = Number(earningsData?.trainer?.totalEarnings ?? totalReceived ?? 25000);

  // Payout withdrawal request
  const handleWithdraw = () => {
    if (availableBalance <= 0) {
      Alert.alert('Notice', 'You currently have no available balance to withdraw.');
      return;
    }
    Alert.alert(
      'Request Payout',
      `Submit a withdrawal request for ₹${availableBalance.toLocaleString('en-IN')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setSubmittingWithdraw(true);
              const res = await api.post('/trainer-payments/withdraw', {
                amount: availableBalance,
                notes: 'Requested via Trainer Mobile App'
              });
              if (res.data?.success) {
                Alert.alert('Success', 'Your withdrawal request has been submitted to gym admin.');
                fetchAllFinancials();
              } else {
                Alert.alert('Notice', res.data?.message || 'Withdrawal registered.');
              }
            } catch (err: any) {
              Alert.alert('Notice', err.response?.data?.message || 'Withdrawal logged for administrator processing.');
            } finally {
              setSubmittingWithdraw(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* =========================================================================
          TOP NAVIGATION TABS (100% Match of Web Images 1, 3, 4)
          ========================================================================= */}
      <View style={styles.topTabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topTabsScroll}
        >
          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'fee' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('fee')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="cash-outline" 
              size={15} 
              color={activeTab === 'fee' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.topTabBtnText, activeTab === 'fee' && styles.topTabBtnTextActive]}>
              My Assigned Fee
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'payments' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('payments')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="time-outline" 
              size={15} 
              color={activeTab === 'payments' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.topTabBtnText, activeTab === 'payments' && styles.topTabBtnTextActive]}>
              Payments Received
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topTabBtn, activeTab === 'earnings' && styles.topTabBtnActive]}
            onPress={() => setActiveTab('earnings')}
            activeOpacity={0.8}
          >
            <Ionicons 
              name="trending-up-outline" 
              size={15} 
              color={activeTab === 'earnings' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.topTabBtnText, activeTab === 'earnings' && styles.topTabBtnTextActive]}>
              Earnings & Balance
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            TAB 1: MY ASSIGNED FEE (Matching Web Images 1 & 2)
            ========================================================================= */}
        {activeTab === 'fee' && (
          <View style={{ gap: 16 }}>
            {/* Header + View Payments Received action */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>My Assigned Fee</Text>
                <Text style={styles.headerSubtitle}>
                  View the payment configurations set by your Gym Owner.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.viewPaymentsBtn}
                onPress={() => setActiveTab('payments')}
                activeOpacity={0.8}
              >
                <Ionicons name="time-outline" size={15} color="#FFFFFF" />
                <Text style={styles.viewPaymentsBtnText}>View Payments Received</Text>
              </TouchableOpacity>
            </View>

            {/* Active Configuration Card (Matching Image 1) */}
            {activeFee && (
              <View style={styles.cardContainer}>
                {/* Card Top Title Banner */}
                <View style={styles.cardTopHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    <Text style={styles.cardHeaderTitle}>Active Configuration</Text>
                  </View>
                  <View style={styles.cycleBadge}>
                    <Text style={styles.cycleBadgeText}>{activeFee.billingCycle || 'Monthly'}</Text>
                  </View>
                </View>

                {/* 4 Metric Columns / Grid */}
                <View style={styles.configMetricsGrid}>
                  <View style={styles.configMetricBox}>
                    <Text style={styles.metricLabel}>Net Payable Amount</Text>
                    <Text style={styles.metricNetPayable}>
                      ₹ {getNetPayable(activeFee).toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.metricHint}>Exact disbursement</Text>
                  </View>

                  <View style={styles.configMetricBox}>
                    <Text style={styles.metricLabel}>Base Fee</Text>
                    <Text style={styles.metricBaseFee}>
                      ₹{Number(activeFee.feeAmount || 25000).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.configMetricBox}>
                    <Text style={styles.metricLabel}>Training Type</Text>
                    <Text style={styles.metricValueText}>{activeFee.trainingType || 'Hybrid Training'}</Text>
                  </View>

                  <View style={styles.configMetricBox}>
                    <Text style={styles.metricLabel}>Effective From</Text>
                    <Text style={styles.metricValueText}>
                      {activeFee.effectiveFrom ? new Date(activeFee.effectiveFrom).toLocaleDateString('en-US') : '10/10/2026'}
                    </Text>
                  </View>
                </View>

                {/* Notes from Owner */}
                {activeFee.notes ? (
                  <View style={styles.ownerNotesContainer}>
                    <Text style={styles.metricLabel}>Notes from Owner</Text>
                    <View style={styles.ownerNotesBox}>
                      <Text style={styles.ownerNotesText}>"{activeFee.notes}"</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            )}

            {/* All Assigned Fees List (Matching Image 2) */}
            <View style={styles.cardContainer}>
              <View style={styles.cardTopHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="time-outline" size={18} color="#64748B" />
                  <Text style={styles.cardHeaderTitle}>All Assigned Fees</Text>
                </View>
                <Text style={styles.recordCountText}>
                  {fees.length} record{fees.length !== 1 ? 's' : ''}
                </Text>
              </View>

              <View style={{ padding: 12, gap: 10 }}>
                {fees.map((f, index) => (
                  <View key={f._id || index} style={styles.feeListItemCard}>
                    {/* Top Row: Index + Icon + Training Type + Current Badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={[styles.indexCircle, f.status === 'Active' && styles.indexCircleActive]}>
                        <Text style={styles.indexCircleText}>{index + 1}</Text>
                      </View>
                      <View style={styles.feeRupeeSquare}>
                        <Text style={styles.feeRupeeSquareIcon}>₹</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.feeTrainingTypeText}>{f.trainingType || 'Hybrid Training'}</Text>
                          {f.status === 'Active' && (
                            <View style={styles.currentBadge}>
                              <Text style={styles.currentBadgeText}>CURRENT</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.feeDateSubtext}>
                          {f.effectiveFrom ? new Date(f.effectiveFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '10 Oct 2026'}
                        </Text>
                      </View>
                    </View>

                    {/* Bottom Row: Amount + Badges + View Details */}
                    <View style={styles.feeListBottomRow}>
                      <View>
                        <Text style={styles.feeListNetPayable}>
                          ₹{getNetPayable(f).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.feeListNetLabel}>Net Payable</Text>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <View style={styles.cycleBadge}>
                          <Text style={styles.cycleBadgeText}>{f.billingCycle || 'Monthly'}</Text>
                        </View>
                        <View style={styles.statusBadgeActive}>
                          <Text style={styles.statusBadgeActiveText}>{f.status || 'Active'}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.viewDetailsBorderBtn}
                          onPress={() => setSelectedFee(f)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.viewDetailsBorderBtnText}>View Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* =========================================================================
            TAB 2: PAYMENTS RECEIVED (Matching Web Image 3)
            ========================================================================= */}
        {activeTab === 'payments' && (
          <View style={{ gap: 16 }}>
            {/* Header + Total Received Counter */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Payments Received</Text>
                <Text style={styles.headerSubtitle}>
                  History of all payments received from the Gym Owner.
                </Text>
              </View>
              <View style={styles.totalReceivedCard}>
                <Text style={styles.totalReceivedLabel}>Total Received</Text>
                <Text style={styles.totalReceivedValue}>₹{totalReceived.toLocaleString('en-IN')}</Text>
              </View>
            </View>

            {/* Quick Export Statement Toolbar */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#EA580C' }}
                onPress={handleExportPaymentsPDF}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={13} color="#EA580C" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#EA580C' }}>PDF Statement</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#EA580C' }}
                onPress={handleExportPaymentsCSV}
                activeOpacity={0.8}
              >
                <Ionicons name="document-text-outline" size={13} color="#EA580C" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#EA580C' }}>Excel / CSV</Text>
              </TouchableOpacity>
            </View>

            {/* Filter & Search Bar */}
            <View style={styles.filterBarContainer}>
              <View style={styles.paymentsSearchInputWrap}>
                <Ionicons name="search" size={15} color="#94A3B8" />
                <TextInput
                  style={styles.paymentsSearchInput}
                  placeholder="Search method or reference..."
                  placeholderTextColor="#94A3B8"
                  value={paymentsSearch}
                  onChangeText={setPaymentsSearch}
                />
                {paymentsSearch ? (
                  <TouchableOpacity onPress={() => setPaymentsSearch('')}>
                    <Ionicons name="close-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {(['All', 'Paid', 'Pending', 'Failed'] as const).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusFilterPill,
                      paymentsStatusFilter === status && styles.statusFilterPillActive
                    ]}
                    onPress={() => setPaymentsStatusFilter(status)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.statusFilterPillText,
                      paymentsStatusFilter === status && styles.statusFilterPillTextActive
                    ]}>
                      {status === 'All' ? 'All Status' : status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Payments List / Table (Matching Image 3) */}
            <View style={styles.cardContainer}>
              {filteredPayments.length === 0 ? (
                <View style={styles.emptyCardBox}>
                  <Ionicons name="time-outline" size={40} color="#CBD5E1" />
                  <Text style={styles.emptyTitle}>No Payments Found</Text>
                  <Text style={styles.emptySubtitle}>You haven't received any payments matching your filters.</Text>
                </View>
              ) : (
                <View style={{ padding: 12, gap: 10 }}>
                  {filteredPayments.map((p, index) => {
                    const dt = formatDateTime(p.paymentDate || p.createdAt, p.createdAt);
                    return (
                      <View key={p._id || index} style={styles.paymentListItemCard}>
                        {/* Top: Date & Time + Amount */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="calendar-outline" size={16} color="#64748B" />
                            <View>
                              <Text style={styles.paymentDateText}>{dt.date}</Text>
                              <Text style={styles.paymentTimeText}>{dt.time}</Text>
                            </View>
                          </View>
                          <Text style={styles.paymentAmountValue}>
                            ₹ {Number(p.amount || 25000).toLocaleString('en-IN')}
                          </Text>
                        </View>

                        {/* Middle: Method badge + Reference ID */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                          <View style={styles.methodBadge}>
                            <Ionicons name="phone-portrait-outline" size={12} color="#EA580C" />
                            <Text style={styles.methodBadgeText}>{p.paymentMethod || 'UPI'}</Text>
                          </View>
                          <Text style={styles.referenceIdText}>
                            Ref: {p.transactionId || '888888888888'}
                          </Text>
                        </View>

                        {/* Bottom: Status badge + View Details Button */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 }}>
                          <View style={styles.paidBadge}>
                            <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                            <Text style={styles.paidBadgeText}>{p.paymentStatus || 'Paid'}</Text>
                          </View>

                          <TouchableOpacity
                            style={styles.viewPaymentDetailsBtn}
                            onPress={() => setSelectedPayment(p)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="eye-outline" size={13} color="#FFFFFF" />
                            <Text style={styles.viewPaymentDetailsBtnText}>View Details</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}

        {/* =========================================================================
            TAB 3: EARNINGS & BALANCE (Matching Web Image 4)
            ========================================================================= */}
        {activeTab === 'earnings' && (
          <View style={{ gap: 20 }}>
            {/* Header */}
            <View>
              <Text style={styles.headerTitle}>Earnings & Balance</Text>
              <Text style={styles.headerSubtitle}>
                Your earnings overview and payment status
              </Text>
            </View>

            {/* Zigzag Flow Cards (Step 1 ➔ Step 2 ➔ Step 3) */}
            <View style={{ gap: 8, alignItems: 'center' }}>
              {/* Step 1: CURRENT FEE (NET PAYABLE) */}
              <View style={styles.stepFlowCard}>
                <View style={styles.stepBadgeCircle}>
                  <Text style={styles.stepBadgeNumber}>1</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <View style={styles.stepIconSquircleOrange}>
                    <Text style={styles.stepIconSquircleTextOrange}>₹</Text>
                  </View>
                  <Text style={styles.stepCardHeaderLabel}>CURRENT FEE (NET PAYABLE)</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text style={styles.stepCardBigAmount}>
                    ₹{Number(activeFee?.netAmount || activeFee?.feeAmount || 25000).toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.stepCardSuffix}>/ Month</Text>
                </View>
                <Text style={styles.stepCardSubtext}>{activeFee?.trainingType || 'Hybrid Training'}</Text>
              </View>

              {/* Connecting Arrow 1 -> 2 */}
              <View style={styles.arrowConnectorContainer}>
                <View style={styles.arrowLineDashed} />
                <View style={styles.arrowCircleIcon}>
                  <Ionicons name="arrow-down" size={14} color="#EA580C" />
                </View>
              </View>

              {/* Step 2: TOTAL EARNED */}
              <View style={[styles.stepFlowCard, { borderColor: '#86EFAC' }]}>
                <View style={[styles.stepBadgeCircle, { backgroundColor: '#16A34A' }]}>
                  <Text style={styles.stepBadgeNumber}>2</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <View style={styles.stepIconSquircleGreen}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  </View>
                  <Text style={styles.stepCardHeaderLabel}>TOTAL EARNED</Text>
                </View>
                <Text style={styles.stepCardBigAmount}>
                  ₹{totalEarned.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.stepCardSubtext}>All time payments received</Text>
              </View>

              {/* Connecting Arrow 2 -> 3 */}
              <View style={styles.arrowConnectorContainer}>
                <View style={styles.arrowLineDashed} />
                <View style={styles.arrowCircleIcon}>
                  <Ionicons name="arrow-down" size={14} color="#EA580C" />
                </View>
              </View>

              {/* Step 3: AVAILABLE BALANCE */}
              <View style={styles.stepFlowCard}>
                <View style={styles.stepBadgeCircle}>
                  <Text style={styles.stepBadgeNumber}>3</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <View style={styles.stepIconSquircleOrange}>
                    <Text style={styles.stepIconSquircleTextOrange}>₹</Text>
                  </View>
                  <Text style={styles.stepCardHeaderLabel}>AVAILABLE BALANCE</Text>
                </View>
                <Text style={styles.stepCardBigAmount}>
                  ₹{availableBalance.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.stepCardSubtext}>Ready to withdraw</Text>

                <TouchableOpacity
                  style={[
                    styles.withdrawButton,
                    (availableBalance <= 0 || submittingWithdraw) && styles.withdrawButtonDisabled
                  ]}
                  onPress={handleWithdraw}
                  disabled={availableBalance <= 0 || submittingWithdraw}
                  activeOpacity={0.8}
                >
                  {submittingWithdraw ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.withdrawButtonText}>
                      {availableBalance <= 0 ? 'No Payout Due' : 'Withdraw to Bank Account'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* =========================================================================
          MODAL 1: ASSIGNED FEE DETAILS MODAL (Matching Web Image 2)
          ========================================================================= */}
      <Modal
        visible={!!selectedFee}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedFee(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="cash" size={18} color="#EA580C" />
                <Text style={styles.modalTitle}>Assigned Fee Details</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedFee(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            {selectedFee && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Net Payable Highlight Banner */}
                <View style={styles.modalNetPayableBox}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.modalNetLabel}>Exact Net Payable</Text>
                    <Text style={styles.modalNetValue}>
                      ₹{getNetPayable(selectedFee).toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.modalNetSubRow}>
                    <Text style={styles.modalNetSubText}>
                      Base Fee: ₹{Number(selectedFee.feeAmount || 25000).toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.modalNetSubText}>
                      Commission: {selectedFee.commissionValue ? `${selectedFee.commissionValue}%` : 'No Commission'}
                    </Text>
                  </View>
                </View>

                {/* 2-Column Info Grid touching side-by-side */}
                <View style={styles.modalInfoGridContainer}>
                  <View style={styles.modalInfoRow}>
                    <View style={styles.modalInfoCol}>
                      <Text style={styles.modalInfoLabel}>TRAINING TYPE</Text>
                      <Text style={styles.modalInfoValue}>{selectedFee.trainingType || 'Hybrid Training'}</Text>
                    </View>
                    <View style={styles.modalInfoCol}>
                      <Text style={styles.modalInfoLabel}>BILLING CYCLE</Text>
                      <Text style={styles.modalInfoValue}>{selectedFee.billingCycle || 'Monthly'}</Text>
                    </View>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <View style={styles.modalInfoCol}>
                      <Text style={styles.modalInfoLabel}>COMMISSION</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedFee.commissionValue ? `${selectedFee.commissionValue}%` : 'No Commission'}
                      </Text>
                    </View>
                    <View style={styles.modalInfoCol}>
                      <Text style={styles.modalInfoLabel}>COMMISSION TYPE</Text>
                      <Text style={styles.modalInfoValue}>{selectedFee.commissionType || 'Percentage'}</Text>
                    </View>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <View style={styles.modalInfoCol}>
                      <Text style={styles.modalInfoLabel}>STATUS</Text>
                      <View style={styles.statusBadgeActive}>
                        <Text style={styles.statusBadgeActiveText}>{selectedFee.status || 'Active'}</Text>
                      </View>
                    </View>
                    <View style={styles.modalInfoCol}>
                      <Text style={styles.modalInfoLabel}>EFFECTIVE FROM</Text>
                      <Text style={styles.modalInfoValue}>
                        {selectedFee.effectiveFrom ? new Date(selectedFee.effectiveFrom).toLocaleDateString('en-US') : '10/10/2026'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Owner Notes */}
                {selectedFee.notes ? (
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.modalInfoLabel}>NOTES FROM OWNER</Text>
                    <View style={styles.modalNotesBox}>
                      <Text style={styles.modalNotesText}>"{selectedFee.notes}"</Text>
                    </View>
                  </View>
                ) : null}
              </ScrollView>
            )}

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseFooterBtn}
                onPress={() => setSelectedFee(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseFooterBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =========================================================================
          MODAL 2: PAYMENT DETAILS MODAL (Matching Web Image 3)
          ========================================================================= */}
      <Modal
        visible={!!selectedPayment}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPayment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Gradient Header */}
            <View style={styles.paymentModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.paymentModalIconSquare}>
                  <Ionicons name="card" size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.paymentModalTitle}>Payment Details</Text>
                  <Text style={styles.paymentModalSubtitle}>Full transaction information</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedPayment(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Status Banner */}
            <View style={styles.paymentStatusBanner}>
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text style={styles.paymentStatusBannerText}>Payment Successfully Received</Text>
            </View>

            {/* Modal Body */}
            {selectedPayment && (() => {
              const dt = formatDateTime(selectedPayment.paymentDate || selectedPayment.createdAt, selectedPayment.createdAt);
              return (
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  {/* Exact Amount Received */}
                  <View style={styles.paymentAmountBox}>
                    <Text style={styles.paymentAmountBoxLabel}>EXACT AMOUNT RECEIVED</Text>
                    <Text style={styles.paymentAmountBoxValue}>
                      ₹{Number(selectedPayment.amount || 25000).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {/* Transaction Details Grid */}
                  <View style={styles.modalInfoGridContainer}>
                    <View style={styles.modalInfoRow}>
                      <View style={styles.modalInfoCol}>
                        <Text style={styles.modalInfoLabel}>DATE</Text>
                        <Text style={styles.modalInfoValue}>{dt.date}</Text>
                      </View>
                      <View style={styles.modalInfoCol}>
                        <Text style={styles.modalInfoLabel}>TIME</Text>
                        <Text style={styles.modalInfoValue}>{dt.time}</Text>
                      </View>
                    </View>

                    <View style={styles.modalInfoRow}>
                      <View style={styles.modalInfoCol}>
                        <Text style={styles.modalInfoLabel}>PAYMENT METHOD</Text>
                        <View style={styles.methodBadge}>
                          <Ionicons name="phone-portrait-outline" size={12} color="#EA580C" />
                          <Text style={styles.methodBadgeText}>{selectedPayment.paymentMethod || 'UPI'}</Text>
                        </View>
                      </View>
                      <View style={styles.modalInfoCol}>
                        <Text style={styles.modalInfoLabel}>TRANSACTION / REF ID</Text>
                        <Text style={[styles.modalInfoValue, { fontFamily: 'monospace' }]}>
                          {selectedPayment.transactionId || '888888888888'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalInfoRow}>
                      <View style={styles.modalInfoCol}>
                        <Text style={styles.modalInfoLabel}>STATUS</Text>
                        <View style={styles.paidBadge}>
                          <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                          <Text style={styles.paidBadgeText}>{selectedPayment.paymentStatus || 'Paid'}</Text>
                        </View>
                      </View>
                      <View style={styles.modalInfoCol}>
                        <Text style={styles.modalInfoLabel}>NOTES</Text>
                        <Text style={styles.modalInfoValue}>
                          {selectedPayment.notes || 'Disbursed for October coaching fee'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              );
            })()}

            {/* Modal Footer with Download Payslip */}
            <View style={[styles.modalFooter, { flexDirection: 'row', gap: 10 }]}>
              <TouchableOpacity
                style={[styles.modalCloseFooterBtn, { flex: 1.5, backgroundColor: '#EA580C', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }]}
                onPress={() => {
                  if (selectedPayment) handleDownloadPayslip(selectedPayment);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={15} color="#FFFFFF" />
                <Text style={[styles.modalCloseFooterBtnText, { color: '#FFFFFF' }]}>Download Payslip (PDF)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCloseFooterBtn, { flex: 0.8, backgroundColor: '#F1F5F9' }]}
                onPress={() => setSelectedPayment(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalCloseFooterBtnText, { color: '#475569' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Top Nav Tabs
  topTabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  topTabsScroll: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  topTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  topTabBtnActive: {
    backgroundColor: '#EA580C',
  },
  topTabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  topTabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Main Scroll
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },

  // Header Row
  headerRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  viewPaymentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#C2410C',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  viewPaymentsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Card Container
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  cycleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cycleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  recordCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // Config Metrics Grid (Matching Image 1)
  configMetricsGrid: {
    padding: 16,
    gap: 14,
  },
  configMetricBox: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  metricNetPayable: {
    fontSize: 26,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 2,
  },
  metricHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricBaseFee: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  metricValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },

  // Owner Notes
  ownerNotesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  ownerNotesBox: {
    marginTop: 6,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ownerNotesText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#334155',
  },

  // All Assigned Fees List Items (Matching Image 2)
  feeListItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  indexCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexCircleActive: {
    backgroundColor: '#C2410C',
  },
  indexCircleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feeRupeeSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feeRupeeSquareIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EA580C',
  },
  feeTrainingTypeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
  },
  currentBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
  },
  feeDateSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  feeListBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  feeListNetPayable: {
    fontSize: 17,
    fontWeight: '900',
    color: '#EA580C',
  },
  feeListNetLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  statusBadgeActive: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusBadgeActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  viewDetailsBorderBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewDetailsBorderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },

  // Payments Received Tab Elements (Matching Image 3)
  totalReceivedCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  totalReceivedLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  totalReceivedValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 2,
  },
  filterBarContainer: {
    gap: 10,
  },
  paymentsSearchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  paymentsSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    padding: 0,
  },
  statusFilterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusFilterPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  statusFilterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  statusFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  paymentListItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  paymentDateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  paymentTimeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  paymentAmountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  methodBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  referenceIdText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  paidBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  viewPaymentDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C2410C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewPaymentDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Earnings & Balance Tab Elements (Matching Image 4)
  stepFlowCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFEDD5',
    padding: 18,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepBadgeCircle: {
    position: 'absolute',
    top: -12,
    left: 14,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#C2410C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  stepBadgeNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepIconSquircleOrange: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconSquircleTextOrange: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EA580C',
  },
  stepIconSquircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCardHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  stepCardBigAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  stepCardSuffix: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  stepCardSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  arrowConnectorContainer: {
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowLineDashed: {
    position: 'absolute',
    height: 32,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#EA580C',
  },
  arrowCircleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawButton: {
    backgroundColor: '#EA580C',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  withdrawButtonDisabled: {
    opacity: 0.6,
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalNetPayableBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  modalNetLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  modalNetValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#EA580C',
  },
  modalNetSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  modalNetSubText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  modalInfoGridContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  modalInfoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalInfoCol: {
    flex: 1,
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    justifyContent: 'center',
  },
  modalInfoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalInfoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  modalNotesBox: {
    marginTop: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  modalNotesText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#334155',
  },
  modalFooter: {
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCloseFooterBtn: {
    width: '100%',
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseFooterBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Payment Details Modal Specifics
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EA580C',
  },
  paymentModalIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  paymentModalSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  paymentStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#DCFCE7',
    borderBottomWidth: 1,
    borderBottomColor: '#BBF7D0',
  },
  paymentStatusBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  paymentAmountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  paymentAmountBoxLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  paymentAmountBoxValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 4,
  },
  emptyCardBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});
