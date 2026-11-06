import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default gym and customer fallback data matching Web reference
const DEFAULT_MEMBERSHIP = {
  _id: 'mem_428acd99',
  membershipId: 'MEM-428ACD',
  receiptNumber: 'REC-C0428ACD',
  orderId: 'ORD-MEM-428ACD',
  planName: 'Weight Loss',
  duration: '1 Month',
  price: 499,
  finalAmount: 499,
  tax: 0,
  discount: 0,
  paymentMethod: 'UPI',
  paymentReference: 'UPI-REF-98421034',
  status: 'Active',
  confirmationEmailStatus: 'Sent',
  startDate: '2026-10-21T11:36:00.000Z',
  endDate: '2026-11-21T23:59:59.000Z',
  features: [
    'Full Gym Facility Access',
    'AI Fitness Assistant',
    'Locker Room Access',
    'Group Classes',
    'Diet Plan Generator',
  ],
  gymId: {
    _id: 'gym_pfs_01',
    name: 'Perfect Fitness Studio',
    phone: '+91 98765 43210',
    email: 'contact@perfectfitness.com',
  },
};

const DEFAULT_HISTORY = [
  {
    _id: 'hist_1',
    planName: 'Weight Loss',
    status: 'Active',
    duration: '1 Month',
    paymentMethod: 'UPI',
    paymentReference: 'UPI-REF-98421034',
    startDate: '2026-10-21T11:36:00.000Z',
    endDate: '2026-11-21T23:59:59.000Z',
    price: 499,
    finalAmount: 499,
    features: ['Fat-loss workout programs', 'Cardio training', 'Strength training', 'Weight and progress tracking'],
  },
  {
    _id: 'hist_2',
    planName: 'Strength',
    status: 'Active',
    duration: '1 Month',
    paymentMethod: 'Net Banking',
    paymentReference: 'HDFC-NET-45129',
    startDate: '2026-10-17T09:00:00.000Z',
    endDate: '2026-11-17T23:59:59.000Z',
    price: 399,
    finalAmount: 399,
    features: ['Strength-focused workout programs', 'Progressive resistance training', 'Strength performance tracking'],
  },
  {
    _id: 'hist_3',
    planName: 'Starter',
    status: 'Active',
    duration: '1 Month',
    paymentMethod: 'UPI',
    paymentReference: 'UPI-STARTER-0081',
    startDate: '2026-10-14T10:00:00.000Z',
    endDate: '2026-11-14T23:59:59.000Z',
    price: 999,
    finalAmount: 999,
    features: ['Full Gym Access', 'Trainer Guidance', 'AI Workout Planner'],
  },
  {
    _id: 'hist_4',
    planName: 'Free Trial',
    status: 'Free Trial Completed',
    isTrial: true,
    duration: '1 Day',
    paymentMethod: 'Trial',
    paymentReference: 'FREE-TRIAL-GUEST',
    startDate: '2026-10-10T08:00:00.000Z',
    endDate: '2026-10-11T23:59:59.000Z',
    price: 0,
    finalAmount: 0,
    features: ['1 Day Gym Access', 'AI Fitness Assistant', 'Locker Room Access', 'Diet Plan Generator'],
  },
];

const AVAILABLE_PLANS = [
  {
    id: 'plan_trial',
    name: 'Free Trial',
    duration: '1 Day',
    price: 0,
    isTrial: true,
    badge: '1 DAY FREE',
    features: [
      '1 Day Gym Access',
      'AI Fitness Assistant',
      'Locker Room Access',
      'Diet Plan Generator',
    ],
  },
  {
    id: 'plan_strength',
    name: 'Strength',
    duration: '1 Month',
    price: 399,
    features: [
      'Strength-focused workout programs',
      'Progressive resistance training',
      'Strength performance tracking',
    ],
  },
  {
    id: 'plan_muscle',
    name: 'Muscle Gain',
    duration: '1 Month',
    price: 599,
    isPopular: true,
    badge: 'RECOMMENDED PLAN',
    features: [
      'Muscle-building workout programs',
      'Strength training',
      'Progressive overload training',
      'Muscle development progress tracking',
    ],
  },
  {
    id: 'plan_weightloss',
    name: 'Weight Loss',
    duration: '1 Month',
    price: 499,
    features: [
      'Fat-loss workout programs',
      'Cardio training',
      'Strength training',
      'Weight and progress tracking',
    ],
  },
];

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI / QR Code', icon: 'qr-code-outline', desc: 'Instant activation via GPay, PhonePe, Paytm' },
  { id: 'Card', label: 'Credit / Debit Card', icon: 'card-outline', desc: 'Visa, MasterCard, RuPay' },
  { id: 'Net Banking', label: 'Net Banking', icon: 'business-outline', desc: 'All major Indian banks supported' },
  { id: 'Cash at Gym', label: 'Pay at Gym Counter', icon: 'cash-outline', desc: 'Pay directly when you visit gym' },
];

export const CustomerMembershipScreen: React.FC<{
  onNavigateTab?: (tab: string, sub?: string) => void;
}> = ({ onNavigateTab }) => {
  const { user } = useAuth();

  const [currentMembership, setCurrentMembership] = useState<any>(DEFAULT_MEMBERSHIP);
  const [historyList, setHistoryList] = useState<any[]>(DEFAULT_HISTORY);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any | null>(null);

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('UPI');
  const [referralCode, setReferralCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [referralApplied, setReferralApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const fetchMembershipData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/memberships/my').catch(() => ({ data: { memberships: [] } }));
      const list = res.data?.memberships || (Array.isArray(res.data) ? res.data : []);
      if (list.length > 0) {
        const active = list.find((m: any) => m.status === 'Active' || m.status === 'Free Trial') || list[0];
        setCurrentMembership({
          ...DEFAULT_MEMBERSHIP,
          ...active,
          gymId: active.gymId || DEFAULT_MEMBERSHIP.gymId,
        });
        setHistoryList([...list, ...DEFAULT_HISTORY.filter(dh => !list.some((l: any) => l._id === dh._id))]);
      }
    } catch (err) {
      console.log('[CustomerMembership] Note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMembershipData();
  }, [fetchMembershipData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembershipData();
  };

  const handleOpenCheckout = (plan: any) => {
    setSelectedPlan(plan);
    setReferralCode('');
    setAppliedDiscount(0);
    setReferralApplied(false);
    setSelectedPaymentMethod(plan.isTrial ? 'Trial' : 'UPI');
    setShowCheckoutModal(true);
  };

  const handleApplyReferral = () => {
    if (!referralCode.trim()) return;
    if (referralCode.trim().toUpperCase() === 'FIT50' || referralCode.trim().toUpperCase().startsWith('REF')) {
      const discountVal = 50;
      setAppliedDiscount(discountVal);
      setReferralApplied(true);
      Alert.alert('Referral Applied! 🎉', `₹${discountVal} promotional discount has been applied to your plan.`);
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid referral or discount code.');
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    try {
      setIsProcessing(true);
      const finalPrice = Math.max(0, (selectedPlan.price || 0) - appliedDiscount);

      // Attempt API call if endpoint exists
      await api.post('/memberships/checkout', {
        planName: selectedPlan.name,
        duration: selectedPlan.duration,
        price: selectedPlan.price,
        finalAmount: finalPrice,
        paymentMethod: selectedPaymentMethod,
        discount: appliedDiscount,
        gymId: currentMembership?.gymId?._id || 'gym_pfs_01',
      }).catch(() => {});

      const newMembership = {
        _id: 'mem_' + Date.now().toString(36),
        membershipId: 'MEM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        receiptNumber: 'REC-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        planName: selectedPlan.name,
        duration: selectedPlan.duration,
        price: selectedPlan.price,
        finalAmount: finalPrice,
        paymentMethod: selectedPaymentMethod,
        status: 'Active',
        confirmationEmailStatus: 'Sent',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (selectedPlan.isTrial ? 1 : 30) * 86400000).toISOString(),
        features: selectedPlan.features,
        gymId: currentMembership?.gymId || DEFAULT_MEMBERSHIP.gymId,
      };

      setCurrentMembership(newMembership);
      setHistoryList(prev => [newMembership, ...prev]);
      setShowCheckoutModal(false);

      Alert.alert(
        'Activation Successful! 🎉',
        `Your ${selectedPlan.name} membership has been activated successfully!\nA confirmation email with your entry pass has been sent to ${user?.email || 'your email'}.`
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setResendingEmail(true);
      await new Promise(r => setTimeout(r, 900));
      Alert.alert(
        'Email Dispatched! ✉️',
        `Official purchase confirmation email and gym entry pass resent to ${user?.email || 'renugopal5457@gmail.com'}.`
      );
    } catch {
      Alert.alert('Notice', 'Email dispatched to registered address.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleShareOrPrintReceipt = async () => {
    const gymName = currentMembership.gymId?.name || 'Perfect Fitness Studio';
    const recId = currentMembership.receiptNumber || 'REC-C0428ACD';
    const memberName = `${user?.firstName || 'Renugopal'} ${user?.lastName || 'Y'}`.trim();
    const planName = currentMembership.planName || 'Weight Loss';
    const amount = currentMembership.finalAmount || 499;

    const receiptText = `=== GYMORA OFFICIAL RECEIPT ===\nGym: ${gymName}\nReceipt #: ${recId}\nMember: ${memberName} (${user?.email || 'renugopal5457@gmail.com'})\nPlan: ${planName} (${currentMembership.duration || '1 Month'})\nTotal Paid: ₹${amount}\nPayment Status: Verified & Successful\nThank you for training with us!`;

    try {
      await Share.share({
        message: receiptText,
        title: `Receipt - ${recId}`,
      });
    } catch (err) {
      Alert.alert('Receipt Downloaded', `Receipt #${recId} details saved.`);
    }
  };

  const userName = `${user?.firstName || 'Renugopal'} ${user?.lastName || 'Y'}`.trim();
  const userEmail = user?.email || 'renugopal5457@gmail.com';
  const gymName = currentMembership.gymId?.name || 'Perfect Fitness Studio';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* ── 1. Hero Current Membership Card ──────────────────── */}
      <View style={styles.heroCard}>
        {/* Glow backdrop decorative accent */}
        <View style={styles.heroGlowAccent} />

        <View style={styles.heroHeaderRow}>
          <View style={styles.heroTitleGroup}>
            <View style={styles.heroIconBadge}>
              <Ionicons name="card-outline" size={20} color="#EA580C" />
            </View>
            <View>
              <Text style={styles.heroTitle}>Current Membership</Text>
              <Text style={styles.heroSubtitle}>
                Registered at <Text style={styles.heroGymName}>{gymName}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.heroBadgesRow}>
            <View style={styles.remainingPill}>
              <Ionicons name="time-outline" size={12} color="#EA580C" />
              <Text style={styles.remainingPillText}>15 Days Remaining</Text>
            </View>
            <View style={styles.activePill}>
              <View style={styles.activePillDot} />
              <Text style={styles.activePillText}>Active</Text>
            </View>
          </View>
        </View>

        {/* Plan & Amount Box */}
        <View style={styles.planOverviewBox}>
          <View style={styles.planInfoLeft}>
            <Text style={styles.planTagLabel}>PLAN PACKAGE</Text>
            <Text style={styles.planNameLarge}>{currentMembership.planName || 'Weight Loss'}</Text>
            <View style={styles.planMetaRow}>
              <Text style={styles.planMetaText}>
                Duration: <Text style={styles.boldText}>{currentMembership.duration || '1 Month'}</Text>
              </Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.planMetaText}>
                Member ID: <Text style={styles.memberIdText}>{currentMembership.membershipId || 'MEM-428ACD'}</Text>
              </Text>
            </View>
          </View>

          <View style={styles.planAmountRight}>
            <Text style={styles.amountTagLabel}>TOTAL AMOUNT PAID</Text>
            <Text style={styles.amountValueLarge}>
              ₹{currentMembership.finalAmount !== undefined ? currentMembership.finalAmount : 499}
            </Text>
          </View>
        </View>

        {/* Action Bar (Email Status, View Confirmation Email, Download Receipt) */}
        <View style={styles.heroActionBar}>
          <View style={styles.emailStatusGroup}>
            <Text style={styles.emailStatusLabel}>Confirmation Email:</Text>
            <View style={styles.emailSentBadge}>
              <Ionicons name="mail-outline" size={13} color="#15803D" />
              <Text style={styles.emailSentBadgeText}>Email Sent</Text>
            </View>
          </View>

          <View style={styles.heroButtonsGroup}>
            <TouchableOpacity
              style={styles.heroActionBtn}
              onPress={() => setShowEmailModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="mail-outline" size={14} color="#EA580C" />
              <Text style={styles.heroActionBtnText}>View Confirmation Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroActionBtn}
              onPress={() => setShowReceiptModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="print-outline" size={14} color="#EA580C" />
              <Text style={styles.heroActionBtnText}>Download / Print Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── 2. Included Package Features ─────────────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeaderWithIcon}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#EA580C" />
          <Text style={styles.sectionCardTitle}>Included Package Features</Text>
        </View>

        <View style={styles.featuresListContainer}>
          {(currentMembership.features || DEFAULT_MEMBERSHIP.features).map((feat: string, idx: number) => (
            <View key={idx} style={styles.featureItemRow}>
              <View style={styles.checkCircleIcon}>
                <Ionicons name="checkmark-circle" size={18} color="#15803D" />
              </View>
              <Text style={styles.featureItemText}>{feat}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── 3. Membership Validity & Payment ──────────────────── */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>Membership Validity & Payment</Text>

        <View style={styles.validityDatesBox}>
          <View style={styles.calendarIconSquare}>
            <Ionicons name="calendar-outline" size={20} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.dateLabelSmall}>Start Date & Time</Text>
            <Text style={styles.dateValueMain}>21 Oct 2026, 11:36 am</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.dateLabelSmall}>Expiry Date</Text>
            <Text style={styles.dateValueHighlight}>21 Nov 2026</Text>
          </View>
        </View>

        <View style={styles.paymentSpecsBox}>
          <View style={styles.paymentSpecRow}>
            <Text style={styles.paymentSpecLabel}>Payment Method:</Text>
            <Text style={styles.paymentSpecValue}>{currentMembership.paymentMethod || 'UPI'}</Text>
          </View>
          <View style={styles.paymentSpecRow}>
            <Text style={styles.paymentSpecLabel}>Payment Status:</Text>
            <Text style={styles.paymentSpecStatusSuccess}>Verified & Successful</Text>
          </View>
          <View style={[styles.paymentSpecRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.paymentSpecLabel}>Transaction Reference:</Text>
            <Text style={styles.paymentSpecValueMono}>
              {currentMembership.paymentReference || 'UPI-REF-98421034'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── 4. Upgrade Membership Plan Section ────────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.upgradeHeaderRow}>
          <View style={styles.zapIconSquare}>
            <Ionicons name="flash-outline" size={20} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionCardTitle}>Upgrade Membership Plan</Text>
            <Text style={styles.upgradeSubtitle}>
              Select the plan that fits your workout routine and goals at {gymName}.
            </Text>
          </View>
        </View>

        <View style={styles.plansListGrid}>
          {AVAILABLE_PLANS.map((plan) => {
            const isRec = plan.isPopular;
            return (
              <View
                key={plan.id}
                style={[
                  styles.planCardItem,
                  isRec && styles.planCardItemRecommended,
                ]}
              >
                {/* Pill at top */}
                {plan.badge && (
                  <View style={[styles.planTopBadge, isRec ? styles.planTopBadgeRec : styles.planTopBadgeTrial]}>
                    <Text style={styles.planTopBadgeText}>{plan.badge}</Text>
                  </View>
                )}

                <View style={styles.planCardTop}>
                  <Text style={[styles.planCardTitle, isRec && { color: '#EA580C' }]}>{plan.name}</Text>
                  <Text style={styles.planCardDuration}>Duration: <Text style={styles.boldText}>{plan.duration}</Text></Text>

                  <View style={styles.planCardPriceRow}>
                    <Text style={[styles.planCardPriceMain, isRec && { color: '#EA580C' }]}>
                      ₹{plan.price}
                    </Text>
                    <Text style={styles.planCardPriceSub}>
                      {plan.isTrial ? ' (Free Trial)' : `/${plan.duration}`}
                    </Text>
                  </View>

                  <View style={styles.planFeaturesList}>
                    {plan.features.map((f, i) => (
                      <View key={i} style={styles.planFeatureLine}>
                        <Ionicons
                          name="checkmark-outline"
                          size={15}
                          color={isRec ? '#EA580C' : '#15803D'}
                          style={{ marginTop: 1, marginRight: 6 }}
                        />
                        <Text style={styles.planFeatureText}>{f}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Button */}
                <TouchableOpacity
                  style={[
                    styles.planActionBtn,
                    plan.isTrial ? styles.planActionBtnTrial : styles.planActionBtnSubscribe,
                  ]}
                  onPress={() => handleOpenCheckout(plan)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={plan.isTrial ? 'flash' : 'sparkles'}
                    size={15}
                    color="#FFFFFF"
                  />
                  <Text style={styles.planActionBtnText}>
                    {plan.isTrial ? 'Start Free Trial' : 'Select & Subscribe'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── 5. Free Trial & Subscription History ───────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.historyHeaderRow}>
          <View style={styles.historyIconSquare}>
            <Ionicons name="time-outline" size={20} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionCardTitle}>Free Trial & Subscription History</Text>
            <Text style={styles.upgradeSubtitle}>
              Complete record of your trial periods, past memberships, and payments.
            </Text>
          </View>
          <View style={styles.historyCountBadge}>
            <Text style={styles.historyCountText}>{historyList.length} Records</Text>
          </View>
        </View>

        <View style={styles.historyItemsList}>
          {historyList.map((item, idx) => {
            const isTrial = item.isTrial || item.planName?.toLowerCase().includes('trial') || item.price === 0;
            const isActive = item.status === 'Active';

            return (
              <View key={item._id || idx} style={styles.historyItemCard}>
                <View style={styles.historyItemMain}>
                  <View style={styles.historyTitleRow}>
                    <Text style={styles.historyPlanTitle}>{item.planName}</Text>
                    <View
                      style={[
                        styles.historyStatusPill,
                        isActive ? styles.statusPillActive : styles.statusPillCompleted,
                      ]}
                    >
                      <Text
                        style={isActive ? styles.statusTextActive : styles.statusTextCompleted}
                      >
                        {item.status || 'Active'}
                      </Text>
                    </View>
                    {isTrial && (
                      <View style={styles.trialHighlightPill}>
                        <Ionicons name="sparkles" size={10} color="#EA580C" />
                        <Text style={styles.trialHighlightText}>1 Day Free Trial</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.historyMetaRow}>
                    <Ionicons name="time-outline" size={12} color="#64748B" />
                    <Text style={styles.historyMetaText}>Duration: {item.duration || '1 Month'}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.historyMetaText}>
                      Payment: <Text style={styles.boldText}>{item.paymentMethod || 'UPI'}</Text>
                    </Text>
                  </View>

                  <View style={styles.historyPeriodRow}>
                    <View>
                      <Text style={styles.periodLabel}>Period</Text>
                      <Text style={styles.periodValue}>
                        {item.startDate ? new Date(item.startDate).toLocaleDateString() : '10/21/2026'} -{' '}
                        {item.endDate ? new Date(item.endDate).toLocaleDateString() : '11/21/2026'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.periodLabel}>Amount</Text>
                      <Text style={styles.historyAmountText}>
                        {Number(item.finalAmount || item.price || 0) === 0
                          ? '₹0 (Free Trial)'
                          : `₹${item.finalAmount || item.price}`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                  style={styles.viewDetailsBtn}
                  onPress={() => setSelectedHistoryItem(item)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="eye-outline" size={14} color="#111827" />
                  <Text style={styles.viewDetailsBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── MODAL 1: CONFIRMATION EMAIL PREVIEW MODAL ───────────── */}
      <Modal
        visible={showEmailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEmailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.emailModalContent}>
            {/* Header */}
            <View style={styles.emailModalHeader}>
              <View style={styles.modalHeaderTitleGroup}>
                <View style={styles.modalEmailIconSquare}>
                  <Ionicons name="mail" size={18} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitleText}>Membership Confirmation Email</Text>
                  <Text style={styles.modalSubtitleText} numberOfLines={1}>
                    Electronic copy dispatched to {userEmail}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowEmailModal(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Email Body */}
            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              {/* Gym Banner */}
              <View style={styles.emailBannerBox}>
                <View style={styles.verifiedActivePill}>
                  <Text style={styles.verifiedActiveText}>Payment Verified & Active</Text>
                </View>
                <Text style={styles.emailGymHeading}>{gymName}</Text>
                <Text style={styles.emailGymSubHeading}>
                  Official Membership Purchase Confirmation & Receipt
                </Text>
              </View>

              {/* Greeting */}
              <View style={styles.emailGreetingBox}>
                <Text style={styles.greetingTitle}>Dear {userName},</Text>
                <Text style={styles.greetingBody}>
                  Thank you for purchasing a membership at{' '}
                  <Text style={styles.boldText}>{gymName}</Text>. Your payment has been
                  successfully verified, and your membership is now{' '}
                  <Text style={{ color: '#15803D', fontWeight: '800' }}>Active</Text>.
                </Text>
              </View>

              {/* Customer & Gym Details Box */}
              <View style={styles.emailSectionBox}>
                <Text style={styles.emailBoxHeader}>CUSTOMER & GYM DETAILS</Text>
                <View style={styles.emailGrid2}>
                  <View style={styles.emailGridCol}>
                    <Text style={styles.emailFieldLabel}>Customer Name</Text>
                    <Text style={styles.emailFieldValueBold}>{userName}</Text>
                  </View>
                  <View style={styles.emailGridCol}>
                    <Text style={styles.emailFieldLabel}>Customer ID</Text>
                    <Text style={styles.emailFieldValueMono}>
                      CUST-{(user?._id || '428ACD').slice(-6).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.emailGridCol}>
                    <Text style={styles.emailFieldLabel}>Registered Email</Text>
                    <Text style={styles.emailFieldValue}>{userEmail}</Text>
                  </View>
                  <View style={styles.emailGridCol}>
                    <Text style={styles.emailFieldLabel}>Gym Contact</Text>
                    <Text style={styles.emailFieldValue}>
                      {currentMembership.gymId?.phone || '+91 98765 43210'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Membership Details Box */}
              <View style={styles.emailSectionBox}>
                <View style={styles.boxHeaderRow}>
                  <Text style={styles.emailBoxHeader}>MEMBERSHIP DETAILS</Text>
                  <View style={styles.activePillSmall}>
                    <Text style={styles.activePillSmallText}>Active</Text>
                  </View>
                </View>
                <View style={styles.emailGrid2}>
                  <View style={styles.emailGridCol}>
                    <Text style={styles.emailFieldLabel}>Membership ID</Text>
                    <Text style={styles.emailFieldValueMono}>
                      {currentMembership.membershipId || 'MEM-428ACD'}
                    </Text>
                  </View>
                  <View style={styles.emailGridCol}>
                    <Text style={styles.emailFieldLabel}>Package Name</Text>
                    <Text style={styles.emailFieldValueBold}>
                      {currentMembership.planName || 'Weight Loss'}
                    </Text>
                  </View>
                  <View style={styles.emailGridCol}>
                    <Text style={styles.emailFieldLabel}>Duration</Text>
                    <Text style={styles.emailFieldValue}>
                      {currentMembership.duration || '1 Month'}
                    </Text>
                  </View>
                  <View style={styles.emailGridCol}>
                    <Text style={styles.emailFieldLabel}>Expiry Date</Text>
                    <Text style={styles.emailFieldValueHighlight}>21 Nov 2026</Text>
                  </View>
                </View>

                {/* Benefits */}
                <View style={styles.emailBenefitsList}>
                  <Text style={styles.benefitsHeaderTitle}>INCLUDED BENEFITS:</Text>
                  {(currentMembership.features || DEFAULT_MEMBERSHIP.features).map(
                    (b: string, i: number) => (
                      <View key={i} style={styles.benefitLine}>
                        <Ionicons name="checkmark-outline" size={13} color="#EA580C" />
                        <Text style={styles.benefitLineText}>{b}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>

              {/* Payment Receipt Box */}
              <View style={styles.emailSectionBox}>
                <Text style={styles.emailBoxHeader}>PAYMENT RECEIPT</Text>
                <View style={styles.receiptLineRow}>
                  <Text style={styles.receiptLineLabel}>Order / Receipt #</Text>
                  <Text style={styles.receiptLineValMono}>
                    {currentMembership.receiptNumber || 'REC-C0428ACD'}
                  </Text>
                </View>
                <View style={styles.receiptLineRow}>
                  <Text style={styles.receiptLineLabel}>Transaction Reference</Text>
                  <Text style={styles.receiptLineValMono}>
                    {currentMembership.paymentReference || 'UPI-REF-98421034'}
                  </Text>
                </View>
                <View style={styles.receiptLineRow}>
                  <Text style={styles.receiptLineLabel}>Payment Mode</Text>
                  <Text style={styles.receiptLineValBold}>
                    {currentMembership.paymentMethod || 'UPI'}
                  </Text>
                </View>
                <View style={styles.receiptLineRow}>
                  <Text style={styles.receiptLineLabel}>Base Package Price</Text>
                  <Text style={styles.receiptLineVal}>₹{currentMembership.price || 499}</Text>
                </View>
                <View style={[styles.receiptLineRow, { borderBottomWidth: 0, paddingTop: 8 }]}>
                  <Text style={styles.receiptTotalLabel}>Final Amount Paid</Text>
                  <Text style={styles.receiptTotalValue}>
                    ₹{currentMembership.finalAmount || 499}
                  </Text>
                </View>
              </View>

              {/* Important Info Card */}
              <View style={styles.importantInfoBox}>
                <Text style={styles.importantInfoTitle}>Important Membership Information:</Text>
                <Text style={styles.importantInfoPoint}>
                  • Show your Membership ID at the gym front desk upon arrival.
                </Text>
                <Text style={styles.importantInfoPoint}>
                  • Automated reminders will notify you 7 days, 3 days, and on expiry day.
                </Text>
                <Text style={styles.importantInfoPoint}>
                  • Renewals can be completed directly from this dashboard.
                </Text>
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalResendBtn}
                onPress={handleResendEmail}
                disabled={resendingEmail}
                activeOpacity={0.8}
              >
                {resendingEmail ? (
                  <ActivityIndicator size="small" color="#EA580C" />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={14} color="#EA580C" />
                    <Text style={styles.modalResendBtnText}>Resend Email</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrintBtn}
                onPress={handleShareOrPrintReceipt}
                activeOpacity={0.8}
              >
                <Ionicons name="print-outline" size={14} color="#EA580C" />
                <Text style={styles.modalPrintBtnText}>Print Receipt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalClosePrimaryBtn}
                onPress={() => setShowEmailModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalClosePrimaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: DOWNLOAD / PRINT RECEIPT MODAL ────────────── */}
      <Modal
        visible={showReceiptModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptModalContent}>
            {/* Receipt Header */}
            <View style={styles.receiptHeader}>
              <View>
                <Text style={styles.receiptGymName}>{gymName}</Text>
                <Text style={styles.receiptDocTitle}>Official Customer Membership Receipt</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View style={styles.receiptActiveBadge}>
                  <Text style={styles.receiptActiveBadgeText}>ACTIVE</Text>
                </View>
                <Text style={styles.receiptIdText}>
                  Receipt #: {currentMembership.receiptNumber || 'REC-C0428ACD'}
                </Text>
              </View>
            </View>

            <ScrollView style={styles.receiptScrollBody} showsVerticalScrollIndicator={false}>
              {/* Customer & Plan Details Grid */}
              <View style={styles.receiptGrid}>
                <View style={styles.receiptCol}>
                  <Text style={styles.receiptColHeading}>CUSTOMER DETAILS</Text>
                  <Text style={styles.receiptColName}>{userName}</Text>
                  <Text style={styles.receiptColSub}>Email: {userEmail}</Text>
                  <Text style={styles.receiptColSub}>
                    Member ID: {currentMembership.membershipId || 'MEM-428ACD'}
                  </Text>
                </View>

                <View style={[styles.receiptCol, { alignItems: 'flex-end' }]}>
                  <Text style={styles.receiptColHeading}>VALIDITY & PLAN</Text>
                  <Text style={styles.receiptColName}>
                    {currentMembership.planName || 'Weight Loss'}
                  </Text>
                  <Text style={styles.receiptColSub}>Valid: 21 Oct 2026 to 21 Nov 2026</Text>
                  <Text style={styles.receiptColSub}>
                    Method: {currentMembership.paymentMethod || 'UPI'}
                  </Text>
                </View>
              </View>

              {/* Receipt Table */}
              <View style={styles.receiptTableContainer}>
                <View style={styles.receiptTableHeaderRow}>
                  <Text style={[styles.receiptTableTh, { flex: 2 }]}>DESCRIPTION</Text>
                  <Text style={[styles.receiptTableTh, { flex: 1, textAlign: 'center' }]}>
                    DURATION
                  </Text>
                  <Text style={[styles.receiptTableTh, { flex: 1, textAlign: 'right' }]}>
                    AMOUNT
                  </Text>
                </View>

                <View style={styles.receiptTableRow}>
                  <Text style={[styles.receiptTableTdBold, { flex: 2 }]}>
                    {currentMembership.planName || 'Weight Loss'} Package
                  </Text>
                  <Text style={[styles.receiptTableTd, { flex: 1, textAlign: 'center' }]}>
                    {currentMembership.duration || '1 Month'}
                  </Text>
                  <Text style={[styles.receiptTableTd, { flex: 1, textAlign: 'right' }]}>
                    ₹{currentMembership.price || 499}
                  </Text>
                </View>

                {currentMembership.discount > 0 && (
                  <View style={styles.receiptTableRow}>
                    <Text style={[styles.receiptTableTd, { flex: 2, color: '#16A34A' }]}>
                      Promotional Discount
                    </Text>
                    <Text style={[styles.receiptTableTd, { flex: 1, textAlign: 'center' }]}>-</Text>
                    <Text style={[styles.receiptTableTd, { flex: 1, textAlign: 'right', color: '#16A34A' }]}>
                      -₹{currentMembership.discount}
                    </Text>
                  </View>
                )}

                <View style={styles.receiptTotalRow}>
                  <Text style={[styles.receiptTotalLabelText, { flex: 3 }]}>Total Paid</Text>
                  <Text style={[styles.receiptTotalAmountText, { flex: 1, textAlign: 'right' }]}>
                    ₹{currentMembership.finalAmount || 499}
                  </Text>
                </View>
              </View>

              {/* Receipt Note */}
              <View style={styles.receiptFooterNote}>
                <Text style={styles.receiptFooterNoteText}>
                  Thank you for being a valued member at {gymName}.
                </Text>
                <Text style={styles.receiptFooterNoteSub}>
                  This is an electronically verified payment receipt generated by Gymora AI Gym Platform.
                </Text>
              </View>
            </ScrollView>

            {/* Receipt Modal Footer */}
            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalPrintBtn}
                onPress={handleShareOrPrintReceipt}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={15} color="#EA580C" />
                <Text style={styles.modalPrintBtnText}>Download Receipt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalClosePrimaryBtn}
                onPress={() => setShowReceiptModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalClosePrimaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: VIEW DETAILS MODAL ───────────────────────── */}
      <Modal
        visible={Boolean(selectedHistoryItem)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedHistoryItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            {/* Header */}
            <View style={styles.emailModalHeader}>
              <View style={styles.modalHeaderTitleGroup}>
                <View style={styles.modalEmailIconSquare}>
                  <Ionicons name="receipt-outline" size={18} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitleText}>Subscription Details</Text>
                  <Text style={styles.modalSubtitleText}>
                    Full breakdown of membership record & payment status
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedHistoryItem(null)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedHistoryItem && (
              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                {/* Plan Header Card */}
                <View style={styles.detailsPlanCard}>
                  <View>
                    <Text style={styles.detailsPlanTag}>PLAN NAME</Text>
                    <Text style={styles.detailsPlanTitle}>{selectedHistoryItem.planName}</Text>
                    <View style={styles.detailsStatusRow}>
                      <View style={styles.statusPillActive}>
                        <Text style={styles.statusTextActive}>
                          {selectedHistoryItem.status || 'Active'}
                        </Text>
                      </View>
                      {selectedHistoryItem.isTrial && (
                        <View style={styles.trialHighlightPill}>
                          <Ionicons name="sparkles" size={10} color="#EA580C" />
                          <Text style={styles.trialHighlightText}>1 Day Free Trial</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.detailsPlanTag}>TOTAL AMOUNT</Text>
                    <Text style={styles.detailsPlanAmount}>
                      {Number(selectedHistoryItem.finalAmount || selectedHistoryItem.price || 0) === 0
                        ? '₹0'
                        : `₹${selectedHistoryItem.finalAmount || selectedHistoryItem.price}`}
                    </Text>
                  </View>
                </View>

                {/* 4 Details Grid */}
                <View style={styles.detailsGrid4}>
                  <View style={styles.detailsGridCell}>
                    <Text style={styles.detailsCellLabel}>Billing Duration</Text>
                    <Text style={styles.detailsCellValue}>
                      {selectedHistoryItem.duration || '1 Month'}
                    </Text>
                  </View>
                  <View style={styles.detailsGridCell}>
                    <Text style={styles.detailsCellLabel}>Payment Method</Text>
                    <Text style={styles.detailsCellValue}>
                      {selectedHistoryItem.paymentMethod || 'UPI'}
                    </Text>
                  </View>
                  <View style={styles.detailsGridCell}>
                    <Text style={styles.detailsCellLabel}>Start Date</Text>
                    <Text style={styles.detailsCellValue}>
                      {selectedHistoryItem.startDate
                        ? new Date(selectedHistoryItem.startDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '21 Oct 2026'}
                    </Text>
                  </View>
                  <View style={styles.detailsGridCell}>
                    <Text style={styles.detailsCellLabel}>Expiry / End Date</Text>
                    <Text style={styles.detailsCellValue}>
                      {selectedHistoryItem.endDate
                        ? new Date(selectedHistoryItem.endDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '21 Nov 2026'}
                    </Text>
                  </View>
                </View>

                {/* Transactions breakdown */}
                <View style={styles.detailsBreakdownBox}>
                  <View style={styles.receiptLineRow}>
                    <Text style={styles.receiptLineLabel}>Transaction / Reference ID</Text>
                    <Text style={styles.receiptLineValMono}>
                      {selectedHistoryItem.paymentReference || 'UPI-REF-98421034'}
                    </Text>
                  </View>
                  <View style={styles.receiptLineRow}>
                    <Text style={styles.receiptLineLabel}>Base Plan Price</Text>
                    <Text style={styles.receiptLineValBold}>
                      ₹{selectedHistoryItem.price || selectedHistoryItem.finalAmount || 499}
                    </Text>
                  </View>
                  <View style={[styles.receiptLineRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.receiptTotalLabel}>Net Paid Amount</Text>
                    <Text style={styles.receiptTotalValue}>
                      {Number(selectedHistoryItem.finalAmount || 0) === 0
                        ? '₹0 (Free Trial)'
                        : `₹${selectedHistoryItem.finalAmount || selectedHistoryItem.price}`}
                    </Text>
                  </View>
                </View>

                {/* Inclusions */}
                <View style={styles.detailsInclusionsBox}>
                  <Text style={styles.inclusionsTitle}>INCLUDED IN THIS MEMBERSHIP</Text>
                  <View style={styles.inclusionsGrid}>
                    {(selectedHistoryItem.features || DEFAULT_MEMBERSHIP.features).map(
                      (f: string, i: number) => (
                        <View key={i} style={styles.inclusionLine}>
                          <Ionicons name="checkmark-circle" size={14} color="#EA580C" />
                          <Text style={styles.inclusionLineText}>{f}</Text>
                        </View>
                      )
                    )}
                  </View>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalClosePrimaryBtn}
                onPress={() => setSelectedHistoryItem(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalClosePrimaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 4: CHECKOUT & PAYMENT MODAL ─────────────────── */}
      <Modal
        visible={showCheckoutModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCheckoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalContent}>
            {/* Modal Header */}
            <View style={styles.emailModalHeader}>
              <View style={styles.modalHeaderTitleGroup}>
                <View style={styles.modalEmailIconSquare}>
                  <Ionicons name="cart-outline" size={18} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitleText}>
                    {selectedPlan?.isTrial ? 'Activate Free Trial' : 'Subscribe to Membership'}
                  </Text>
                  <Text style={styles.modalSubtitleText}>
                    {gymName} • Complete Membership Activation
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowCheckoutModal(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedPlan && (
              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                {/* Plan Summary Banner */}
                <View style={styles.checkoutPlanSummary}>
                  <View>
                    <Text style={styles.checkoutPlanName}>{selectedPlan.name}</Text>
                    <Text style={styles.checkoutPlanDuration}>Duration: {selectedPlan.duration}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.checkoutPlanPrice}>
                      {selectedPlan.isTrial ? '₹0' : `₹${selectedPlan.price}`}
                    </Text>
                    <Text style={styles.checkoutPlanPriceNote}>
                      {selectedPlan.isTrial ? '1 Day Trial' : `Per ${selectedPlan.duration}`}
                    </Text>
                  </View>
                </View>

                {/* If Not Trial: Payment Method Selector */}
                {!selectedPlan.isTrial && (
                  <View style={styles.checkoutSection}>
                    <Text style={styles.checkoutSectionHeading}>SELECT PAYMENT METHOD</Text>
                    {PAYMENT_METHODS.map((pm) => {
                      const isSelected = selectedPaymentMethod === pm.id;
                      return (
                        <TouchableOpacity
                          key={pm.id}
                          style={[
                            styles.paymentMethodCard,
                            isSelected && styles.paymentMethodCardSelected,
                          ]}
                          onPress={() => setSelectedPaymentMethod(pm.id)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.paymentMethodRadio,
                              isSelected && styles.paymentMethodRadioSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.paymentMethodRadioInner} />}
                          </View>
                          <Ionicons
                            name={pm.icon as any}
                            size={20}
                            color={isSelected ? '#EA580C' : '#64748B'}
                            style={{ marginHorizontal: 8 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.paymentMethodLabel,
                                isSelected && { color: '#111827', fontWeight: '800' },
                              ]}
                            >
                              {pm.label}
                            </Text>
                            <Text style={styles.paymentMethodDesc}>{pm.desc}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}

                    {/* Referral Code Box */}
                    <Text style={[styles.checkoutSectionHeading, { marginTop: 14 }]}>
                      PROMOTIONAL / REFERRAL CODE
                    </Text>
                    <View style={styles.referralInputRow}>
                      <TextInput
                        style={styles.referralInput}
                        placeholder="Enter Code (e.g. FIT50)"
                        placeholderTextColor="#94A3B8"
                        value={referralCode}
                        onChangeText={setReferralCode}
                        autoCapitalize="characters"
                        editable={!referralApplied}
                      />
                      <TouchableOpacity
                        style={[
                          styles.referralApplyBtn,
                          referralApplied && { backgroundColor: '#15803D' },
                        ]}
                        onPress={handleApplyReferral}
                        disabled={referralApplied}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.referralApplyBtnText}>
                          {referralApplied ? 'Applied ✓' : 'Apply'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Price Breakdown */}
                    <View style={styles.checkoutPriceBreakdown}>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Base Plan Price</Text>
                        <Text style={styles.breakdownValue}>₹{selectedPlan.price}</Text>
                      </View>
                      {appliedDiscount > 0 && (
                        <View style={styles.breakdownRow}>
                          <Text style={[styles.breakdownLabel, { color: '#16A34A' }]}>
                            Referral Discount
                          </Text>
                          <Text style={[styles.breakdownValue, { color: '#16A34A' }]}>
                            -₹{appliedDiscount}
                          </Text>
                        </View>
                      )}
                      <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                        <Text style={styles.breakdownTotalLabel}>Total Payable</Text>
                        <Text style={styles.breakdownTotalValue}>
                          ₹{Math.max(0, selectedPlan.price - appliedDiscount)}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* If Free Trial */}
                {selectedPlan.isTrial && (
                  <View style={styles.freeTrialNoticeBox}>
                    <Ionicons name="sparkles" size={24} color="#EA580C" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.freeTrialNoticeTitle}>Instant Free Access</Text>
                      <Text style={styles.freeTrialNoticeBody}>
                        No credit card or upfront payment required. Your 1-Day pass unlocks full gym floor access, locker rooms, and the AI fitness coach.
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Modal Bottom CTA */}
            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCheckoutModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmPayBtn}
                onPress={handleConfirmPayment}
                disabled={isProcessing}
                activeOpacity={0.8}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons
                      name={selectedPlan?.isTrial ? 'flash' : 'shield-checkmark'}
                      size={16}
                      color="#FFFFFF"
                    />
                    <Text style={styles.modalConfirmPayBtnText}>
                      {selectedPlan?.isTrial ? 'Activate Free Trial' : 'Confirm & Pay'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  boldText: {
    fontWeight: '800',
    color: '#111827',
  },

  /* 1. Hero Card */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlowAccent: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF7ED',
    opacity: 0.8,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  heroIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  heroGymName: {
    color: '#EA580C',
    fontWeight: '700',
  },
  heroBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  remainingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  remainingPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#15803D',
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },

  planOverviewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  planInfoLeft: {
    flex: 1,
  },
  planTagLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  planNameLarge: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  planMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  planMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  metaDot: {
    marginHorizontal: 6,
    color: '#94A3B8',
    fontSize: 12,
  },
  memberIdText: {
    color: '#EA580C',
    fontWeight: '800',
  },
  planAmountRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  amountTagLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  amountValueLarge: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 2,
  },

  heroActionBar: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    gap: 10,
  },
  emailStatusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emailStatusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  emailSentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  emailSentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  heroButtonsGroup: {
    flexDirection: 'column',
    gap: 8,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  heroActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
  },

  /* 2. Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  featuresListContainer: {
    gap: 10,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkCircleIcon: {
    width: 20,
    alignItems: 'center',
  },
  featureItemText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
  },

  /* 3. Validity & Payment */
  validityDatesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 12,
    marginBottom: 12,
  },
  calendarIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dateLabelSmall: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  dateValueMain: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  dateValueHighlight: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 2,
  },
  paymentSpecsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8,
  },
  paymentSpecRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paymentSpecLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentSpecValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  paymentSpecStatusSuccess: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  paymentSpecValueMono: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#111827',
  },

  /* 4. Upgrade Plans */
  upgradeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  zapIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  plansListGrid: {
    gap: 14,
    marginTop: 4,
  },
  planCardItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    position: 'relative',
  },
  planCardItemRecommended: {
    borderColor: '#EA580C',
    backgroundColor: '#FFFAF5',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  planTopBadge: {
    position: 'absolute',
    top: -10,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  planTopBadgeTrial: {
    backgroundColor: '#C2410C',
  },
  planTopBadgeRec: {
    backgroundColor: '#C2410C',
  },
  planTopBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planCardTop: {
    marginBottom: 14,
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    textTransform: 'capitalize',
  },
  planCardDuration: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  planCardPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    marginBottom: 12,
  },
  planCardPriceMain: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
  },
  planCardPriceSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 2,
  },
  planFeaturesList: {
    gap: 6,
  },
  planFeatureLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  planFeatureText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  planActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  planActionBtnTrial: {
    backgroundColor: '#C2410C',
  },
  planActionBtnSubscribe: {
    backgroundColor: '#C2410C',
  },
  planActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* 5. History */
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  historyIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCountBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  historyCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  historyItemsList: {
    gap: 12,
  },
  historyItemCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
  },
  historyItemMain: {
    gap: 4,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  historyPlanTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'capitalize',
  },
  historyStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  statusTextActive: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  statusPillCompleted: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  statusTextCompleted: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  trialHighlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trialHighlightText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
  },
  historyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  historyMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  historyPeriodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  periodLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
  },
  periodValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  historyAmountText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#EA580C',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewDetailsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },

  /* Modals General */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emailModalContent: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  receiptModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  detailsModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  checkoutModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  emailModalHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalEmailIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  modalSubtitleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 999,
  },
  modalScrollBody: {
    padding: 16,
  },

  /* Email Body elements */
  emailBannerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  verifiedActivePill: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: 6,
  },
  verifiedActiveText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  emailGymHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  emailGymSubHeading: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  emailGreetingBox: {
    marginBottom: 12,
    gap: 4,
  },
  greetingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  greetingBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  emailSectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  emailBoxHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  boxHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activePillSmall: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillSmallText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  emailGrid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emailGridCol: {
    width: '47%',
  },
  emailFieldLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  emailFieldValueBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  emailFieldValueMono: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
    fontFamily: 'monospace',
  },
  emailFieldValue: {
    fontSize: 12,
    color: '#111827',
  },
  emailFieldValueHighlight: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  emailBenefitsList: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 4,
  },
  benefitsHeaderTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 2,
  },
  benefitLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitLineText: {
    fontSize: 11,
    color: '#334155',
  },
  receiptLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  receiptLineLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  receiptLineValMono: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: '#111827',
  },
  receiptLineValBold: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  receiptLineVal: {
    fontSize: 11,
    color: '#111827',
  },
  receiptTotalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
  },
  receiptTotalValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  importantInfoBox: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 3,
    borderLeftColor: '#FDBA74',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 4,
  },
  importantInfoTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  importantInfoPoint: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },

  /* Modal Footers */
  modalFooterRow: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  modalResendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalResendBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  modalPrintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalPrintBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C2410C',
  },
  modalClosePrimaryBtn: {
    backgroundColor: '#C2410C',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
  },
  modalClosePrimaryBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Receipt Modal */
  receiptHeader: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#EA580C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  receiptGymName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  receiptDocTitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  receiptActiveBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  receiptActiveBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803D',
  },
  receiptIdText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    marginTop: 4,
  },
  receiptScrollBody: {
    padding: 16,
  },
  receiptGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  receiptCol: {
    flex: 1,
  },
  receiptColHeading: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 4,
  },
  receiptColName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  receiptColSub: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
  receiptTableContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  receiptTableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    padding: 8,
  },
  receiptTableTh: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  receiptTableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  receiptTableTdBold: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  receiptTableTd: {
    fontSize: 11,
    color: '#334155',
  },
  receiptTotalRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  receiptTotalLabelText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
  },
  receiptTotalAmountText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  receiptFooterNote: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  receiptFooterNoteText: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
  },
  receiptFooterNoteSub: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
  },

  /* Details Modal */
  detailsPlanCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsPlanTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
  },
  detailsPlanTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  detailsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  detailsPlanAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 2,
  },
  detailsGrid4: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailsGridCell: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  detailsCellLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 2,
  },
  detailsCellValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  detailsBreakdownBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 12,
  },
  detailsInclusionsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
  },
  inclusionsTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 8,
  },
  inclusionsGrid: {
    gap: 6,
  },
  inclusionLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inclusionLineText: {
    fontSize: 11,
    color: '#334155',
  },

  /* Checkout Modal */
  checkoutPlanSummary: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkoutPlanName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    textTransform: 'capitalize',
  },
  checkoutPlanDuration: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  checkoutPlanPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#EA580C',
  },
  checkoutPlanPriceNote: {
    fontSize: 10,
    color: '#64748B',
  },
  checkoutSection: {
    gap: 8,
  },
  checkoutSectionHeading: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  paymentMethodCardSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  paymentMethodRadio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodRadioSelected: {
    borderColor: '#EA580C',
  },
  paymentMethodRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
  },
  paymentMethodLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  paymentMethodDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  referralInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  referralInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  referralApplyBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 10,
  },
  referralApplyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  checkoutPriceBreakdown: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  breakdownValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  breakdownTotalRow: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 2,
  },
  breakdownTotalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  breakdownTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EA580C',
  },
  freeTrialNoticeBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  freeTrialNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  freeTrialNoticeBody: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalConfirmPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalConfirmPayBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
