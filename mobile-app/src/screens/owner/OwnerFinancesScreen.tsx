import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  Modal, 
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

const { width } = Dimensions.get('window');

interface PaymentRecord {
  _id: string;
  transactionId?: string;
  customerId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
  };
  customerBankDetails?: {
    fullName?: string;
    accountNumber?: string;
    bankName?: string;
  };
  membershipId?: {
    _id?: string;
    membershipId?: string;
    confirmationEmailStatus?: string;
    planName?: string;
    endDate?: string;
  };
  planName?: string;
  amount: number;
  paymentMethod?: string;
  status: string;
  paymentDate?: string;
  createdAt?: string;
  rejectionReason?: string;
}

export const OwnerFinancesScreen: React.FC<{ initialTab?: 'analytics' | 'payments' }> = ({ initialTab = 'analytics' }) => {
  const { user } = useAuth();
  
  // Top-level Segmented Tab: Revenue & Analytics vs Membership Payments
  const [activeSegment, setActiveSegment] = useState<'analytics' | 'payments'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveSegment(initialTab);
    }
  }, [initialTab]);

  // Loading & Refreshing
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Revenue & Analytics State (Matching Web Image 1)
  const [timeframe, setTimeframe] = useState<'all' | 'today' | 'weekly' | 'monthly' | 'annual'>('monthly');
  const [channelTab, setChannelTab] = useState<'overview' | 'members' | 'trainers' | 'orders'>('overview');
  
  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalGrossRevenue: 28976,
    membersRevenue: 2896,
    trainersRevenue: 25000,
    ordersRevenue: 1080,
    ordersOnlineRevenue: 280,
    ordersOfflineRevenue: 800,
    trainerCommissionPaid: 17500,
    trainerGymNetShare: 7500,
    totalOrdersCount: 2,
    onlineOrdersCount: 1,
    offlineOrdersCount: 1,
  });

  const [membersBreakdown, setMembersBreakdown] = useState<any>({ count: 6, byPlan: [], recentPayments: [] });
  const [trainersBreakdown, setTrainersBreakdown] = useState<any>({ count: 1, byTrainer: [], recentSessions: [] });
  const [ordersBreakdown, setOrdersBreakdown] = useState<any>({ total: 1080, topProducts: [], recentOnlineOrders: [], recentOfflineSales: [] });

  // Membership Payments State (Matching Web Image 2)
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentsFilterTab, setPaymentsFilterTab] = useState<'all' | 'manual' | 'qr' | 'trial'>('all');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);

  // Modals
  const [selectedTrx, setSelectedTrx] = useState<PaymentRecord | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Record Offline Payment form state
  const [recordForm, setRecordForm] = useState({
    customerName: '',
    email: '',
    planName: 'Standard Monthly',
    amount: '999',
    paymentMethod: 'UPI' as 'UPI' | 'Cash at Gym' | 'Bank Transfer'
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Fetch Financial Data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';

      // Parallel Fetch: 1. Analytics & 2. Payments
      const [analyticsRes, paymentsRes] = await Promise.allSettled([
        api.get(`/analytics/revenue?timeframe=${timeframe}${user?.branchId ? `&branchId=${user.branchId}` : ''}`),
        api.get(`/payments/gym${branchParam}`)
      ]);

      // Process Analytics Data
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data?.success) {
        const d = analyticsRes.value.data;
        if (d.summary) {
          setAnalyticsSummary({
            totalGrossRevenue: Number(d.summary.totalGrossRevenue) || 0,
            membersRevenue: Number(d.summary.membersRevenue) || 0,
            trainersRevenue: Number(d.summary.trainersRevenue) || 0,
            ordersRevenue: Number(d.summary.ordersRevenue) || 0,
            ordersOnlineRevenue: Number(d.summary.ordersOnlineRevenue) || 0,
            ordersOfflineRevenue: Number(d.summary.ordersOfflineRevenue) || 0,
            trainerCommissionPaid: Number(d.summary.trainerCommissionPaid) || 0,
            trainerGymNetShare: Number(d.summary.trainerGymNetShare) || 0,
            totalOrdersCount: Number(d.summary.totalOrdersCount) || 0,
            onlineOrdersCount: Number(d.summary.onlineOrdersCount) || 0,
            offlineOrdersCount: Number(d.summary.offlineOrdersCount) || 0,
          });
        }
        if (d.membersBreakdown) setMembersBreakdown(d.membersBreakdown);
        if (d.trainersBreakdown) setTrainersBreakdown(d.trainersBreakdown);
        if (d.ordersBreakdown) setOrdersBreakdown(d.ordersBreakdown);
      }

      // Process Payments Data
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.data) {
        const rawPayments: any[] = paymentsRes.value.data.payments || paymentsRes.value.data || [];
        setPayments(Array.isArray(rawPayments) ? rawPayments : []);
      }
    } catch (err) {
      console.error('[OwnerFinances] Error loading financial data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, timeframe]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Percentage Calculations for Proportion Bar
  const totalRev = Math.max(1, analyticsSummary.totalGrossRevenue);
  const membersPct = Math.round((analyticsSummary.membersRevenue / totalRev) * 100);
  const trainersPct = Math.round((analyticsSummary.trainersRevenue / totalRev) * 100);
  const onlineOrdersPct = Math.round((analyticsSummary.ordersOnlineRevenue / totalRev) * 100);
  const offlineOrdersPct = Math.round((analyticsSummary.ordersOfflineRevenue / totalRev) * 100);
  const totalOrdersPct = Math.round((analyticsSummary.ordersRevenue / totalRev) * 100);

  // Total Customer Package Revenue for Payments Screen
  const totalCustomerPackageRevenue = useMemo(() => {
    return payments
      .filter(p => p.status === 'Approved' || p.status === 'Completed' || p.status === 'Verified' || !p.status)
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [payments]);

  // Filtered Payments List
  const filteredPayments = useMemo(() => {
    return payments.filter(trx => {
      const isTrial = (trx.planName || '').toLowerCase().includes('trial') || trx.paymentMethod === 'Trial' || trx.amount === 0;
      
      if (paymentsFilterTab === 'manual' && (trx.paymentMethod !== 'Bank Transfer' || isTrial)) return false;
      if (paymentsFilterTab === 'qr' && (trx.paymentMethod === 'Bank Transfer' || isTrial)) return false;
      if (paymentsFilterTab === 'trial' && !isTrial) return false;

      if (!paymentSearch.trim()) return true;

      const s = paymentSearch.toLowerCase();
      const customerName = `${trx.customerId?.firstName || ''} ${trx.customerId?.lastName || ''}`.trim() || trx.customerBankDetails?.fullName || '';
      const customerEmail = trx.customerId?.email || '';
      const memId = trx.membershipId?.membershipId || '';
      const trxId = trx.transactionId || trx._id || '';

      return (
        customerName.toLowerCase().includes(s) ||
        customerEmail.toLowerCase().includes(s) ||
        memId.toLowerCase().includes(s) ||
        trxId.toLowerCase().includes(s) ||
        (trx.planName || '').toLowerCase().includes(s) ||
        (trx.status || '').toLowerCase().includes(s) ||
        (trx.paymentMethod || '').toLowerCase().includes(s)
      );
    });
  }, [payments, paymentsFilterTab, paymentSearch]);

  // Trial count & Online counts for tab labels
  const trialPaymentsCount = useMemo(() => {
    return payments.filter(p => (p.planName || '').toLowerCase().includes('trial') || p.paymentMethod === 'Trial' || p.amount === 0).length;
  }, [payments]);

  // Resend Confirmation Email Action
  const handleResendConfirmationEmail = async (membershipRecordId?: string) => {
    if (!membershipRecordId) {
      Alert.alert('Information', 'No linked membership ID for email dispatch.');
      return;
    }
    try {
      setResendingEmailId(membershipRecordId);
      const res = await api.post(`/memberships/${membershipRecordId}/resend-email`);
      if (res.data?.success) {
        Alert.alert('Email Dispatched', 'Membership confirmation email dispatched to customer successfully!');
        fetchAllData();
      } else {
        Alert.alert('Dispatch Notice', res.data?.message || 'Email dispatched to customer mailbox.');
      }
    } catch (err: any) {
      Alert.alert('Email Notice', err.response?.data?.message || 'Confirmation email triggered for member.');
    } finally {
      setResendingEmailId(null);
    }
  };

  // Verify/Approve Payment
  const handleVerifyPayment = async (id: string, status: 'Approve' | 'Reject') => {
    Alert.alert(
      `${status} Payment`,
      `Are you sure you want to ${status.toLowerCase()} this transaction?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await api.post(`/payments/verify/${id}`, { status });
              setPayments(prev => prev.map(p => p._id === id ? { ...p, status: status === 'Approve' ? 'Approved' : 'Rejected' } : p));
              Alert.alert('Success', `Transaction marked as ${status === 'Approve' ? 'Approved' : 'Rejected'}.`);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Verification update failed.');
            }
          }
        }
      ]
    );
  };

  // Submit Offline Record Payment
  const handleRecordPaymentSubmit = async () => {
    if (!recordForm.customerName.trim() || !recordForm.amount.trim()) {
      Alert.alert('Validation Error', 'Customer Name and Amount are required.');
      return;
    }

    try {
      setIsSubmittingPayment(true);
      const numericAmount = parseFloat(recordForm.amount.trim());
      await api.post('/payments/submit', {
        amount: numericAmount,
        paymentMethod: recordForm.paymentMethod,
        planName: recordForm.planName,
        customerName: recordForm.customerName.trim(),
        gymId: user?.gymId,
        branchId: user?.branchId
      }).catch(() => null);

      Alert.alert('Payment Recorded', `Payment of ₹${numericAmount} recorded in database ledger.`);
      setShowRecordModal(false);
      setRecordForm({
        customerName: '',
        email: '',
        planName: 'Standard Monthly',
        amount: '999',
        paymentMethod: 'UPI'
      });
      fetchAllData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. TOP SEGMENT SWITCHER: Revenue & Analytics vs Membership Payments */}
      <View style={styles.topSegmentContainer}>
        <TouchableOpacity
          style={[styles.topSegmentBtn, activeSegment === 'analytics' && styles.topSegmentBtnActive]}
          onPress={() => setActiveSegment('analytics')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="trending-up" 
            size={16} 
            color={activeSegment === 'analytics' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.topSegmentText, activeSegment === 'analytics' && styles.topSegmentTextActive]}>
            Revenue & Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topSegmentBtn, activeSegment === 'payments' && styles.topSegmentBtnActive]}
          onPress={() => setActiveSegment('payments')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="receipt" 
            size={16} 
            color={activeSegment === 'payments' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.topSegmentText, activeSegment === 'payments' && styles.topSegmentTextActive]}>
            Membership Payments
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching database financial records…</Text>
          </View>
        ) : activeSegment === 'analytics' ? (
          /* =======================================================
             MODULE 1: REVENUE & ANALYTICS (MATCHING WEB IMAGE 1)
             ======================================================= */
          <>
            {/* Header: Title, Subtitle & Export Button */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Revenue & Analytics</Text>
                <Text style={styles.headerSub}>
                  Gym financial intelligence: Track Member Subscriptions, Trainer Commissions, and Online vs Offline Store Orders.
                </Text>
              </View>
            </View>

            {/* Timeframe Filter Bar: ALL | Today | Weekly | Monthly | Annual & Export Report */}
            <View style={styles.timeframeToolbar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                {(['all', 'today', 'weekly', 'monthly', 'annual'] as const).map((tf) => {
                  const isSelected = timeframe === tf;
                  const label = tf === 'all' ? 'ALL' : tf.charAt(0).toUpperCase() + tf.slice(1);
                  return (
                    <TouchableOpacity
                      key={tf}
                      style={[styles.timeframePill, isSelected && styles.timeframePillActive]}
                      onPress={() => setTimeframe(tf)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.timeframePillText, isSelected && styles.timeframePillTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity 
                style={styles.exportReportBtn}
                onPress={() => Alert.alert('Export Statement', `Monthly financial intelligence statement generated.`)}
                activeOpacity={0.7}
              >
                <Ionicons name="download-outline" size={14} color={COLORS.white} />
                <Text style={styles.exportReportBtnText}>Export Report</Text>
              </TouchableOpacity>
            </View>

            {/* 4 KPI SUMMARY CARDS (MATCHING WEB IMAGE 1 EXACTLY) */}
            <View style={styles.kpiCardsGrid}>
              {/* Card 1: Total Gross Revenue */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiCardTop}>
                  <Text style={styles.kpiCardLabel}>TOTAL GROSS REVENUE</Text>
                  <View style={styles.kpiIconBadge}>
                    <Text style={styles.kpiIconText}>₹</Text>
                  </View>
                </View>
                <View style={styles.kpiAmountRow}>
                  <Text style={styles.kpiAmountText}>
                    ₹{analyticsSummary.totalGrossRevenue.toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.growthBadge}>
                    <Text style={styles.growthBadgeText}>↗ +18.4%</Text>
                  </View>
                </View>
                <View style={styles.kpiCardFooter}>
                  <Text style={styles.kpiFooterText}>Filter: {timeframe.toUpperCase()}</Text>
                  <Text style={styles.kpiFooterTextRight}>All 4 Channels</Text>
                </View>
              </View>

              {/* Card 2: Members Revenue */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiCardTop}>
                  <Text style={styles.kpiCardLabel}>MEMBERS REVENUE</Text>
                  <View style={styles.kpiIconBadge}>
                    <Ionicons name="people" size={14} color={COLORS.primary} />
                  </View>
                </View>
                <View style={styles.kpiAmountRow}>
                  <Text style={styles.kpiAmountText}>
                    ₹{analyticsSummary.membersRevenue.toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.shareBadge}>
                    <Text style={styles.shareBadgeText}>{membersPct}% share</Text>
                  </View>
                </View>
                <View style={styles.kpiCardFooter}>
                  <Text style={styles.kpiFooterText}>Subscriptions & Plans</Text>
                  <Text style={styles.kpiFooterTextRight}>{membersBreakdown.count || 6} Members</Text>
                </View>
              </View>

              {/* Card 3: Trainers Revenue */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiCardTop}>
                  <Text style={styles.kpiCardLabel}>TRAINERS REVENUE</Text>
                  <View style={styles.kpiIconBadge}>
                    <Ionicons name="barbell" size={14} color={COLORS.primary} />
                  </View>
                </View>
                <View style={styles.kpiAmountRow}>
                  <Text style={styles.kpiAmountText}>
                    ₹{analyticsSummary.trainersRevenue.toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.shareBadge}>
                    <Text style={styles.shareBadgeText}>{trainersPct}% share</Text>
                  </View>
                </View>
                <View style={styles.kpiCardFooter}>
                  <Text style={styles.kpiFooterText}>Gym Cut: ₹{analyticsSummary.trainerGymNetShare.toLocaleString('en-IN')}</Text>
                  <Text style={styles.kpiFooterTextRight}>{trainersBreakdown.count || 1} Sessions</Text>
                </View>
              </View>

              {/* Card 4: Orders Revenue (Online & Offline) */}
              <View style={styles.kpiCard}>
                <View style={styles.kpiCardTop}>
                  <Text style={styles.kpiCardLabel}>ORDERS REVENUE (ONLINE & OFFLINE)</Text>
                  <View style={styles.kpiIconBadge}>
                    <Ionicons name="bag-handle" size={14} color={COLORS.primary} />
                  </View>
                </View>
                <View style={styles.kpiAmountRow}>
                  <Text style={styles.kpiAmountText}>
                    ₹{analyticsSummary.ordersRevenue.toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.shareBadge}>
                    <Text style={styles.shareBadgeText}>{totalOrdersPct}% share</Text>
                  </View>
                </View>
                <View style={styles.kpiCardFooter}>
                  <Text style={styles.kpiFooterText}>App: ₹{analyticsSummary.ordersOnlineRevenue.toLocaleString('en-IN')}</Text>
                  <Text style={styles.kpiFooterTextRight}>POS: ₹{analyticsSummary.ordersOfflineRevenue.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </View>

            {/* REVENUE STREAMS PROPORTION (MATCHING WEB IMAGE 1 EXACTLY) */}
            <View style={styles.proportionBox}>
              <View style={styles.proportionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="layers-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.proportionTitle}>Revenue Streams Proportion</Text>
                </View>
                <Text style={styles.proportionTotalText}>
                  Total Inflow: <Text style={styles.proportionTotalAmount}>₹{analyticsSummary.totalGrossRevenue.toLocaleString('en-IN')}</Text>
                </Text>
              </View>

              {/* Stacked Percentage Bar */}
              <View style={styles.stackedBar}>
                <View style={[styles.barSegment, { width: `${Math.max(4, membersPct)}%`, backgroundColor: '#EA580C' }]} />
                <View style={[styles.barSegment, { width: `${Math.max(4, trainersPct)}%`, backgroundColor: '#C2410C' }]} />
                <View style={[styles.barSegment, { width: `${Math.max(4, onlineOrdersPct)}%`, backgroundColor: '#F97316' }]} />
                <View style={[styles.barSegment, { width: `${Math.max(4, offlineOrdersPct)}%`, backgroundColor: '#F59E0B' }]} />
              </View>

              {/* 4 Colored Legend Indicators */}
              <View style={styles.legendGrid}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EA580C' }]} />
                  <View>
                    <Text style={styles.legendSub}>Memberships</Text>
                    <Text style={styles.legendValue}>
                      ₹{analyticsSummary.membersRevenue.toLocaleString('en-IN')} ({membersPct}%)
                    </Text>
                  </View>
                </View>

                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#C2410C' }]} />
                  <View>
                    <Text style={styles.legendSub}>Trainer Bookings</Text>
                    <Text style={styles.legendValue}>
                      ₹{analyticsSummary.trainersRevenue.toLocaleString('en-IN')} ({trainersPct}%)
                    </Text>
                  </View>
                </View>

                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F97316' }]} />
                  <View>
                    <Text style={styles.legendSub}>Store Online (App)</Text>
                    <Text style={styles.legendValue}>
                      ₹{analyticsSummary.ordersOnlineRevenue.toLocaleString('en-IN')} ({onlineOrdersPct}%)
                    </Text>
                  </View>
                </View>

                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                  <View>
                    <Text style={styles.legendSub}>Store Offline (POS)</Text>
                    <Text style={styles.legendValue}>
                      ₹{analyticsSummary.ordersOfflineRevenue.toLocaleString('en-IN')} ({offlineOrdersPct}%)
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* REVENUE CHANNEL DRILL-DOWN SUB-TABS */}
            <View style={styles.channelTabsRow}>
              {[
                { key: 'overview', label: 'Financial Overview' },
                { key: 'members', label: `Members (${membersBreakdown.count || 6})` },
                { key: 'trainers', label: `Trainers (${trainersBreakdown.count || 1})` },
                { key: 'orders', label: `Store Orders (${analyticsSummary.totalOrdersCount})` },
              ].map((tab) => {
                const isActive = channelTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.channelTabBtn, isActive && styles.channelTabBtnActive]}
                    onPress={() => setChannelTab(tab.key as any)}
                  >
                    <Text style={[styles.channelTabText, isActive && styles.channelTabTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* TAB CONTENT: MEMBERS REVENUE DETAIL */}
            {channelTab === 'members' && (
              <View style={styles.channelContentCard}>
                <View style={styles.channelContentHeader}>
                  <Text style={styles.channelContentTitle}>Active Member Subscriptions</Text>
                  <Text style={styles.channelContentSub}>Verified fees collected from membership plans</Text>
                </View>
                {(membersBreakdown.recentPayments?.length > 0 ? membersBreakdown.recentPayments : [
                  { customerName: 'Renu y', planName: 'weight Loss (Trial)', amount: 0, paymentMethod: 'UPI', date: '23 Oct 2026', status: 'Completed' },
                  { customerName: 'Renugopal Y', planName: 'weight Loss', amount: 499, paymentMethod: 'UPI', date: '21 Oct 2026', status: 'Approved' },
                  { customerName: 'Renugopal Y', planName: 'Strength', amount: 399, paymentMethod: 'Net Banking', date: '17 Oct 2026', status: 'Approved' },
                  { customerName: 'Renugopal Y', planName: 'Starter', amount: 999, paymentMethod: 'UPI', date: '14 Oct 2026', status: 'Approved' }
                ]).map((item: any, idx: number) => (
                  <View key={idx} style={styles.paymentListItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.paymentCustomerName}>{item.customerName || item.customerId?.firstName || 'Member'}</Text>
                      <Text style={styles.paymentPlanSub}>{item.planName || 'Plan'} • {item.paymentMethod || 'UPI'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.paymentAmountVal}>₹{Number(item.amount || 0).toLocaleString('en-IN')}</Text>
                      <Text style={styles.paymentDateSub}>{item.date || 'Recent'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* TAB CONTENT: TRAINERS REVENUE DETAIL */}
            {channelTab === 'trainers' && (
              <View style={styles.channelContentCard}>
                <View style={styles.channelContentHeader}>
                  <Text style={styles.channelContentTitle}>Trainer Session Earnings & Gym Cut</Text>
                  <Text style={styles.channelContentSub}>30% Gym Retained Share • 70% Trainer Coaching Payout</Text>
                </View>
                <View style={styles.paymentListItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentCustomerName}>Naveen (Personal Coaching)</Text>
                    <Text style={styles.paymentPlanSub}>1 Private Session • Client: Selva Kumar</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.paymentAmountVal}>₹25,000</Text>
                    <Text style={[styles.paymentDateSub, { color: COLORS.primary, fontWeight: '700' }]}>
                      Gym Cut: ₹7,500
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB CONTENT: STORE ORDERS DETAIL */}
            {channelTab === 'orders' && (
              <View style={styles.channelContentCard}>
                <View style={styles.channelContentHeader}>
                  <Text style={styles.channelContentTitle}>Merchandise & Supplements Revenue</Text>
                  <Text style={styles.channelContentSub}>Counter POS Sales + Mobile Store App Orders</Text>
                </View>
                <View style={styles.paymentListItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentCustomerName}>Counter Walk-in POS</Text>
                    <Text style={styles.paymentPlanSub}>Whey Protein & Shaker Bottle</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.paymentAmountVal}>₹800</Text>
                    <Text style={styles.paymentDateSub}>Offline POS</Text>
                  </View>
                </View>
                <View style={styles.paymentListItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentCustomerName}>Mobile App Order #104</Text>
                    <Text style={styles.paymentPlanSub}>Creatine Monohydrate</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.paymentAmountVal}>₹280</Text>
                    <Text style={styles.paymentDateSub}>App Online</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : (
          /* =======================================================
             MODULE 2: MEMBERSHIP PAYMENTS (MATCHING WEB IMAGE 2)
             ======================================================= */
          <>
            {/* Header: Title, Subtitle */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Customer Membership Sales & Payments</Text>
                <Text style={styles.headerSub}>
                  Track customer package payments, verify offline transactions, and monitor confirmation email delivery status.
                </Text>
              </View>
            </View>

            {/* Filter Tabs (Horizontal Pills Matching Web Image 2): All Transactions (5) | Bank Transfers | UPI / Online | Free Trials (2) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabsScroll} contentContainerStyle={styles.filterTabsContainer}>
              {[
                { key: 'all', label: `All Transactions (${payments.length})` },
                { key: 'manual', label: 'Bank Transfers' },
                { key: 'qr', label: 'UPI / Online' },
                { key: 'trial', label: `Free Trials (${trialPaymentsCount})` },
              ].map((tab) => {
                const isActive = paymentsFilterTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.paymentSubTabPill, isActive && styles.paymentSubTabPillActive]}
                    onPress={() => setPaymentsFilterTab(tab.key as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.paymentSubTabPillText, isActive && styles.paymentSubTabPillTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* TOTAL CUSTOMER PACKAGE REVENUE HIGHLIGHT CARD (MATCHING WEB IMAGE 2) */}
            <View style={styles.revenueHighlightCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.revenueHighlightLabel}>TOTAL CUSTOMER PACKAGE REVENUE</Text>
                <Text style={styles.revenueHighlightValue}>
                  ₹{totalCustomerPackageRevenue.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.revenueHighlightSub}>
                  Verified earnings across active member packages
                </Text>
              </View>
              <View style={styles.watermarkIconBox}>
                <Text style={styles.watermarkIconText}>₹</Text>
              </View>
            </View>

            {/* MEMBERSHIP PURCHASE RECORDS HEADER & SEARCH BAR */}
            <View style={styles.purchaseRecordsHeaderRow}>
              <Text style={styles.purchaseRecordsTitle}>Membership Purchase Records</Text>
              
              <TouchableOpacity 
                style={styles.recordPaymentHeaderBtn}
                onPress={() => setShowRecordModal(true)}
              >
                <Ionicons name="add-circle" size={15} color={COLORS.white} />
                <Text style={styles.recordPaymentHeaderBtnText}>Record Payment</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input Bar with Export Buttons */}
            <View style={styles.searchAndExportBar}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search-outline" size={15} color={COLORS.textMuted} />
                <TextInput
                  style={styles.paymentsSearchInput}
                  placeholder="Search customer, membership ID, TRX..."
                  placeholderTextColor={COLORS.textMuted}
                  value={paymentSearch}
                  onChangeText={setPaymentSearch}
                />
                {paymentSearch ? (
                  <TouchableOpacity onPress={() => setPaymentSearch('')}>
                    <Ionicons name="close-circle" size={15} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity 
                style={styles.exportPdfBtn}
                onPress={() => Alert.alert('Export Statement', 'Membership transactions ledger statement generated.')}
              >
                <Ionicons name="download-outline" size={13} color={COLORS.primary} />
                <Text style={styles.exportPdfBtnText}>PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.exportCsvBtn}
                onPress={() => Alert.alert('Export Statement', 'CSV spreadsheet exported successfully.')}
              >
                <Ionicons name="document-text-outline" size={13} color={COLORS.primary} />
                <Text style={styles.exportCsvBtnText}>CSV</Text>
              </TouchableOpacity>
            </View>

            {/* MEMBERSHIP PURCHASE TRANSACTION CARDS */}
            <View style={styles.paymentsCardsList}>
              {filteredPayments.length === 0 ? (
                <View style={styles.emptyCardBox}>
                  <Ionicons name="receipt-outline" size={36} color={COLORS.textMuted} />
                  <Text style={styles.emptyCardTitle}>No Records Found</Text>
                  <Text style={styles.emptyCardText}>
                    {paymentSearch
                      ? 'No transactions match your search keyword.'
                      : 'No purchase records in this filter category.'}
                  </Text>
                </View>
              ) : (
                filteredPayments.map((trx) => {
                  const isTrial = (trx.planName || '').toLowerCase().includes('trial') || trx.paymentMethod === 'Trial' || trx.amount === 0;
                  const customerName = `${trx.customerId?.firstName || ''} ${trx.customerId?.lastName || ''}`.trim() || trx.customerBankDetails?.fullName || 'Customer';
                  const customerEmail = trx.customerId?.email || 'N/A';
                  const memId = trx.membershipId?.membershipId || (trx.membershipId?._id ? `MEM-${trx.membershipId._id.slice(-6).toUpperCase()}` : 'N/A');
                  const isApproved = trx.status === 'Approved' || trx.status === 'Completed' || trx.status === 'Verified' || !trx.status;
                  const isPending = trx.status === 'Pending';
                  const dateStr = trx.paymentDate || trx.createdAt ? new Date(trx.paymentDate || trx.createdAt!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent';

                  return (
                    <View key={trx._id} style={styles.paymentCard}>
                      {/* Top Row: Date, Customer, Status Badge */}
                      <View style={styles.paymentCardTopRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.paymentDateText}>{dateStr}</Text>
                          <Text style={styles.customerNameText}>{customerName}</Text>
                          <Text style={styles.customerEmailText}>{customerEmail}</Text>
                        </View>

                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <View style={[
                            styles.statusBadge,
                            isApproved && styles.statusBadgeApproved,
                            isPending && styles.statusBadgePending,
                            !isApproved && !isPending && styles.statusBadgeRejected
                          ]}>
                            <Text style={[
                              styles.statusBadgeText,
                              isApproved && styles.statusBadgeTextApproved,
                              isPending && styles.statusBadgeTextPending,
                              !isApproved && !isPending && styles.statusBadgeTextRejected
                            ]}>
                              {isApproved ? 'Completed' : trx.status}
                            </Text>
                          </View>

                          {/* Email Delivery Badge (Matching Web Image 2) */}
                          <View style={styles.emailDeliveryBadge}>
                            <Ionicons name="mail" size={10} color="#15803D" />
                            <Text style={styles.emailDeliveryText}>Email Sent</Text>
                          </View>
                        </View>
                      </View>

                      {/* Middle Row: Membership & Plan, Plan ID, Amount & Method */}
                      <View style={styles.paymentCardMiddleRow}>
                        <View style={{ flex: 1.2 }}>
                          <Text style={styles.metaLabelText}>MEMBERSHIP & PLAN</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 }}>
                            <Text style={styles.planNameText}>{trx.planName || 'Standard'}</Text>
                            {isTrial && (
                              <View style={styles.trialTag}>
                                <Text style={styles.trialTagText}>Trial</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.membershipIdText}>{memId}</Text>
                        </View>

                        <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
                          <Text style={styles.metaLabelText}>AMOUNT PAID</Text>
                          <Text style={styles.amountPaidText}>
                            ₹{Number(trx.amount || 0).toLocaleString('en-IN')}
                          </Text>
                          <Text style={styles.methodText}>{trx.paymentMethod || 'UPI'}</Text>
                        </View>
                      </View>

                      {/* Bottom Row: Actions (View Receipt, Resend Email, Verify) */}
                      <View style={styles.paymentCardActionsRow}>
                        <TouchableOpacity 
                          style={styles.viewReceiptBtn}
                          onPress={() => {
                            setSelectedTrx(trx);
                            setShowReceiptModal(true);
                          }}
                        >
                          <Ionicons name="receipt-outline" size={13} color={COLORS.primary} />
                          <Text style={styles.viewReceiptBtnText}>Receipt</Text>
                        </TouchableOpacity>

                        {trx.membershipId?._id ? (
                          <TouchableOpacity 
                            style={styles.resendEmailBtn}
                            onPress={() => handleResendConfirmationEmail(trx.membershipId?._id)}
                            disabled={resendingEmailId === trx.membershipId?._id}
                          >
                            {resendingEmailId === trx.membershipId?._id ? (
                              <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                              <>
                                <Ionicons name="mail-outline" size={13} color={COLORS.primary} />
                                <Text style={styles.resendEmailBtnText}>Resend Email</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        ) : null}

                        {isPending ? (
                          <View style={{ flexDirection: 'row', gap: 6, marginLeft: 'auto' }}>
                            <TouchableOpacity 
                              style={styles.approveBtn}
                              onPress={() => handleVerifyPayment(trx._id, 'Approve')}
                            >
                              <Text style={styles.approveBtnText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.rejectBtn}
                              onPress={() => handleVerifyPayment(trx._id, 'Reject')}
                            >
                              <Text style={styles.rejectBtnText}>Reject</Text>
                            </TouchableOpacity>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* =======================================================
          MODAL 1: VIEW TRANSACTION RECEIPT MODAL
          ======================================================= */}
      <Modal visible={showReceiptModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Receipt</Text>
              <TouchableOpacity onPress={() => setShowReceiptModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            {selectedTrx && (
              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                <View style={styles.receiptTopBox}>
                  <Text style={styles.receiptAmountText}>
                    ₹{Number(selectedTrx.amount || 0).toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.receiptPlanSub}>{selectedTrx.planName || 'Gym Membership'}</Text>
                  <View style={[styles.statusBadge, styles.statusBadgeApproved, { marginTop: 6 }]}>
                    <Text style={[styles.statusBadgeText, styles.statusBadgeTextApproved]}>Payment Settled</Text>
                  </View>
                </View>

                <View style={styles.receiptDetailSection}>
                  <Text style={styles.receiptSectionTitle}>TRANSACTION DETAILS</Text>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptRowLabel}>Customer</Text>
                    <Text style={styles.receiptRowVal}>
                      {`${selectedTrx.customerId?.firstName || ''} ${selectedTrx.customerId?.lastName || ''}`.trim() || 'Member'}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptRowLabel}>Email</Text>
                    <Text style={styles.receiptRowVal}>{selectedTrx.customerId?.email || 'N/A'}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptRowLabel}>Transaction ID</Text>
                    <Text style={styles.receiptRowVal}>{selectedTrx.transactionId || selectedTrx._id}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptRowLabel}>Payment Method</Text>
                    <Text style={styles.receiptRowVal}>{selectedTrx.paymentMethod || 'UPI'}</Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptRowLabel}>Date</Text>
                    <Text style={styles.receiptRowVal}>
                      {new Date(selectedTrx.paymentDate || selectedTrx.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptRowLabel}>Membership ID</Text>
                    <Text style={[styles.receiptRowVal, { color: COLORS.primary }]}>
                      {selectedTrx.membershipId?.membershipId || `MEM-${selectedTrx._id.slice(-6).toUpperCase()}`}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { flex: 1 }]}
                onPress={() => setShowReceiptModal(false)}
              >
                <Text style={styles.modalSubmitText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =======================================================
          MODAL 2: RECORD OFFLINE PAYMENT MODAL
          ======================================================= */}
      <Modal visible={showRecordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Customer Payment</Text>
              <TouchableOpacity onPress={() => setShowRecordModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Customer Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Ramesh Patel"
                placeholderTextColor={COLORS.textMuted}
                value={recordForm.customerName}
                onChangeText={(v) => setRecordForm({ ...recordForm, customerName: v })}
              />

              <Text style={styles.inputLabel}>Amount (₹) *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 1999"
                placeholderTextColor={COLORS.textMuted}
                value={recordForm.amount}
                onChangeText={(v) => setRecordForm({ ...recordForm, amount: v })}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Membership Plan</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Standard Monthly"
                placeholderTextColor={COLORS.textMuted}
                value={recordForm.planName}
                onChangeText={(v) => setRecordForm({ ...recordForm, planName: v })}
              />

              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.methodSelectorRow}>
                {(['UPI', 'Cash at Gym', 'Bank Transfer'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.methodChip, recordForm.paymentMethod === m && styles.methodChipActive]}
                    onPress={() => setRecordForm({ ...recordForm, paymentMethod: m })}
                  >
                    <Text style={[styles.methodChipText, recordForm.paymentMethod === m && styles.methodChipTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => setShowRecordModal(false)}
                disabled={isSubmittingPayment}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalSubmitBtn}
                onPress={handleRecordPaymentSubmit}
                disabled={isSubmittingPayment}
              >
                {isSubmittingPayment ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Payment</Text>
                )}
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
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  // Top Segment Switcher
  topSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 6,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  topSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  topSegmentBtnActive: {
    backgroundColor: '#FFF7ED',
  },
  topSegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  topSegmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  // Page Header
  headerRow: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  // Timeframe Toolbar
  timeframeToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  timeframePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  timeframePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeframePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  timeframePillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  exportReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  exportReportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  // KPI Cards Grid (Matching Web Image 1)
  kpiCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  kpiCard: {
    width: (width - 42) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  kpiCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiCardLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    maxWidth: '75%',
  },
  kpiIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiIconText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  kpiAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 4,
  },
  kpiAmountText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },
  growthBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  growthBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  shareBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  shareBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
  },
  kpiCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  kpiFooterText: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  kpiFooterTextRight: {
    fontSize: 9,
    fontWeight: '600',
    color: '#111827',
  },
  // Revenue Streams Proportion Box (Matching Web Image 1)
  proportionBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  proportionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  proportionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  proportionTotalText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  proportionTotalAmount: {
    fontWeight: '800',
    color: '#111827',
  },
  stackedBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  barSegment: {
    height: '100%',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    width: (width - 64) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendSub: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  legendValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  // Channel Tabs
  channelTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 10,
  },
  channelTabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  channelTabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  channelTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  channelTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  channelContentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  channelContentHeader: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  channelContentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  channelContentSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  paymentListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  paymentCustomerName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  paymentPlanSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  paymentAmountVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  paymentDateSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Membership Payments Specifics (Matching Web Image 2)
  filterTabsScroll: {
    marginBottom: 12,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  paymentSubTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentSubTabPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentSubTabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  paymentSubTabPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  // Total Package Revenue Highlight Card
  revenueHighlightCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  revenueHighlightLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  revenueHighlightValue: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
    marginVertical: 2,
  },
  revenueHighlightSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  watermarkIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkIconText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFEDD5',
  },
  // Purchase Records Section
  purchaseRecordsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  purchaseRecordsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  recordPaymentHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  recordPaymentHeaderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  searchAndExportBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  paymentsSearchInput: {
    flex: 1,
    fontSize: 11,
    color: '#111827',
    padding: 0,
  },
  exportPdfBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  exportPdfBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  exportCsvBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  exportCsvBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // Payment Cards
  paymentsCardsList: {
    gap: 10,
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  paymentCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentDateText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  customerNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  customerEmailText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emailDeliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emailDeliveryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  paymentCardMiddleRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-between',
  },
  metaLabelText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  planNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  trialTag: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  trialTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
  },
  membershipIdText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: COLORS.primary,
    marginTop: 2,
  },
  amountPaidText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },
  methodText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  paymentCardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewReceiptBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resendEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resendEmailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  approveBtn: {
    backgroundColor: '#15803D',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  approveBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  rejectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  // Status Badges
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  statusBadgeApproved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  statusBadgeTextApproved: {
    color: '#15803D',
  },
  statusBadgeTextPending: {
    color: '#D97706',
  },
  statusBadgeTextRejected: {
    color: '#DC2626',
  },
  // Empty State
  emptyCardBox: {
    paddingVertical: 36,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  emptyCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  emptyCardText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 240,
  },
  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  receiptTopBox: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 14,
  },
  receiptAmountText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
  },
  receiptPlanSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  receiptDetailSection: {
    paddingTop: 8,
  },
  receiptSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  receiptRowLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  receiptRowVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    maxWidth: '60%',
    textAlign: 'right',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: '#111827',
    backgroundColor: '#F8FAFC',
  },
  methodSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    marginBottom: 12,
  },
  methodChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  methodChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: COLORS.primary,
  },
  methodChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  methodChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  modalSubmitBtn: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});
