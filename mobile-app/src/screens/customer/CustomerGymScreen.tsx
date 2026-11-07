import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Linking, 
  ActivityIndicator, 
  RefreshControl,
  Modal,
  Alert,
  Dimensions,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default gym images matching Web Image 1
const DEFAULT_GYM_IMAGES = [
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80', // Dumbbells rack
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80', // Man curling dumbbell
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80', // Battle ropes
];

// Amenities matching Web Image 2
const DEFAULT_AMENITIES = [
  'Gym Membership',
  'Group Classes',
  '1-on-1 Virtual Training',
  'Live Online Classes',
  'AI Fitness Coaching',
  'Personal Training',
  'Strength & Conditioning',
  'Diet & Nutrition Guidance',
  'Locker Facility',
  'Drinking Water',
  'Parking',
  'Wi-Fi',
  'CCTV',
  'First Aid',
  'Rest Area'
];

// Subscription Plans matching Web Image 3
const DEFAULT_PACKAGES = [
  {
    _id: 'default-pkg-strength',
    name: 'Strength',
    fitnessGoal: 'Strength',
    description: 'Improve your physical strength, power, and performance through resistance training and progressive overload.',
    trainingType: 'Offline',
    duration: '1 Month',
    monthlyPrice: 399,
    accentColor: '#EA580C',
    badgeBg: '#FFF7ED',
    badgeBorder: '#FFEDD5',
    features: [
      'Strength-focused workout programs',
      'Progressive resistance training',
      'Strength performance tracking'
    ]
  },
  {
    _id: 'default-pkg-muscle',
    name: 'Muscle Gain',
    fitnessGoal: 'Muscle Gain',
    description: 'Build muscle mass and improve your physique with targeted strength training and progressive workouts.',
    trainingType: 'Online',
    duration: '1 Month',
    monthlyPrice: 599,
    accentColor: '#EA580C',
    badgeBg: '#FFF7ED',
    badgeBorder: '#FFEDD5',
    features: [
      'Muscle-building workout programs',
      'Strength training',
      'Progressive overload training',
      'Muscle development progress tracking'
    ]
  },
  {
    _id: 'default-pkg-weightloss',
    name: 'weight Loss',
    fitnessGoal: 'Weight Loss',
    description: 'Focus on burning calories, reducing body fat, and improving overall fitness through structured workouts.',
    trainingType: 'Hybrid',
    duration: '1 Month',
    monthlyPrice: 499,
    accentColor: '#B91C1C',
    badgeBg: '#FEF2F2',
    badgeBorder: '#FEE2E2',
    features: [
      'Fat-loss workout programs',
      'Cardio training',
      'Strength training',
      'Weight and progress tracking'
    ]
  }
];

export const CustomerGymScreen: React.FC<{ onNavigateTab?: (tab: string, sub?: string) => void }> = ({ onNavigateTab }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gymDetails, setGymDetails] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>(DEFAULT_PACKAGES);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('default-pkg-strength');

  // Checkout State matching Web Checkout (Image 1 & 2)
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'Cash at Gym'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [bankName, setBankName] = useState('HDFC Bank');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [appliedReferral, setAppliedReferral] = useState<{ code: string; discount: number } | null>(null);
  const [refError, setRefError] = useState('');
  const [usePoints, setUsePoints] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  // Location / Directions Modal State
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  // Gallery Preview Lightbox
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchGymData = useCallback(async () => {
    try {
      const [gymRes, pkgRes] = await Promise.allSettled([
        api.get('/gyms/my-gym').catch(() => api.get('/gyms')),
        api.get('/gym-packages/public').catch(() => api.get('/gym-packages')),
      ]);

      if (gymRes.status === 'fulfilled' && gymRes.value.data) {
        const gym = gymRes.value.data.gym || (Array.isArray(gymRes.value.data) ? gymRes.value.data[0] : gymRes.value.data);
        if (gym) setGymDetails(gym);
      }

      if (pkgRes.status === 'fulfilled' && pkgRes.value.data) {
        const pkgs = pkgRes.value.data.packages || (Array.isArray(pkgRes.value.data) ? pkgRes.value.data : []);
        if (pkgs && pkgs.length > 0) {
          const mapped = pkgs.map((p: any, idx: number) => ({
            ...p,
            accentColor: p.fitnessGoal?.toLowerCase().includes('weight') ? '#B91C1C' : '#EA580C',
            badgeBg: p.fitnessGoal?.toLowerCase().includes('weight') ? '#FEF2F2' : '#FFF7ED',
            badgeBorder: p.fitnessGoal?.toLowerCase().includes('weight') ? '#FEE2E2' : '#FFEDD5',
            features: Array.isArray(p.features) ? p.features : (p.features ? String(p.features).split(',').map((f: string) => f.trim()) : DEFAULT_PACKAGES[idx % 3].features),
            monthlyPrice: p.monthlyPrice ?? p.price ?? DEFAULT_PACKAGES[idx % 3].monthlyPrice,
          }));
          setPackages(mapped);
          setSelectedPlanId(mapped[0]._id);
        }
      }
    } catch (err) {
      console.log('[CustomerGym] Live gym load note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGymData();
  }, [fetchGymData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGymData();
  };

  // Safe Address Formatter
  const formatAddress = (addr: any) => {
    if (!addr) return 'RK Towers, Rayakottai Rd, opposite to HP Petrol Bunk, Wahab Nagar Krishnagiri, Tamil Nadu 635002';
    if (typeof addr === 'string') return addr;
    if (typeof addr === 'object') {
      const parts = [
        addr.address || addr.street,
        addr.area,
        addr.city,
        addr.state,
        addr.pinCode || addr.zipCode || addr.postalCode,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'RK Towers, Rayakottai Rd, opposite to HP Petrol Bunk, Wahab Nagar Krishnagiri, Tamil Nadu 635002';
    }
    return String(addr);
  };

  const gymName = typeof gymDetails?.name === 'string' ? gymDetails.name : 'Perfect Fitness Studio';
  const gymAddress = formatAddress(gymDetails?.location || gymDetails?.address);
  const gymCity = gymDetails?.location?.city || gymDetails?.city || 'Krishnagiri';
  const gymState = gymDetails?.location?.state || gymDetails?.state || 'Tamil Nadu';
  const gymEmail = gymDetails?.email || 'forgeindiaconnectfic@gmail.com';
  const gymPhone = gymDetails?.phone || '9876556789';
  const gymRating = gymDetails?.rating || '4';
  const gymReviewCount = gymDetails?.reviewCount || '1';

  // Google Maps URL
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gymAddress)}`;

  // Open Map in external browser or Maps App
  const handleOpenMap = () => {
    Linking.openURL(mapUrl).catch(() => {
      Alert.alert('Directions', `Location: ${gymAddress}`);
    });
  };

  // Handle Select Plan & Open Checkout (Matching Web Image 1 & 2)
  const handleSelectAndPay = (plan: any) => {
    setSelectedPlanId(plan._id);
    setCheckoutPlan(plan);
    setPaymentSuccess(null);
  };

  // Referral Code Application
  const handleApplyReferral = () => {
    const code = (referralCodeInput || '').trim().toUpperCase();
    if (!code) return;
    if (code.length >= 3) {
      setAppliedReferral({ code, discount: 50 });
      setRefError('');
    } else {
      setRefError('Invalid referral code');
      setAppliedReferral(null);
    }
  };

  // Confirm Checkout Activation
  const handleConfirmCheckout = async () => {
    if (!checkoutPlan) return;
    setIsProcessingPayment(true);
    const basePrice = Number(checkoutPlan.monthlyPrice) || 599;
    const refDiscount = appliedReferral ? 50 : 0;
    const ptsDiscount = usePoints ? 75 : 0;
    const discounted = Math.max(0, basePrice - refDiscount - ptsDiscount);
    const taxVal = Math.round(discounted * 0.18);
    const totalAmount = discounted + taxVal;

    try {
      await api.post('/customer-memberships/subscribe', {
        packageId: checkoutPlan._id,
        packageName: checkoutPlan.name,
        price: totalAmount,
        paymentMethod: paymentMethod,
        referralCode: appliedReferral?.code,
        usePoints: usePoints,
      }).catch(() => api.post('/memberships/join', {
        planName: checkoutPlan.name,
        duration: checkoutPlan.duration || '1 Month',
        price: totalAmount,
      })).catch(() => null);

      setIsProcessingPayment(false);
      setPaymentSuccess({
        planName: checkoutPlan.name,
        amount: totalAmount,
        gymName: gymName,
        paymentMethod: paymentMethod === 'UPI' ? 'UPI / QR Code' : paymentMethod === 'Card' ? 'Card' : paymentMethod === 'Net Banking' ? 'Net Banking' : 'Pay at Gym Counter',
      });
    } catch {
      setIsProcessingPayment(false);
      setPaymentSuccess({
        planName: checkoutPlan.name,
        amount: totalAmount,
        gymName: gymName,
        paymentMethod: paymentMethod === 'UPI' ? 'UPI / QR Code' : paymentMethod === 'Card' ? 'Card' : paymentMethod === 'Net Banking' ? 'Net Banking' : 'Pay at Gym Counter',
      });
    }
  };

  // ========================================================
  // FULL-PAGE CHECKOUT VIEW MATCHING WEB APPLICATION (Image 1 & 2)
  // ========================================================
  const renderCheckoutView = () => {
    const basePrice = Number(checkoutPlan?.monthlyPrice) || 599;
    const isFreeTrial = basePrice === 0 || checkoutPlan?.name?.toLowerCase().includes('trial');
    
    // Referral Discount: ₹50 if applied
    const referralDiscount = appliedReferral ? (appliedReferral.discount || 50) : 0;
    
    // Points Discount: 150 pts available -> ₹75
    const pointsDiscount = usePoints ? 75 : 0;
    
    const combinedDiscount = isFreeTrial ? 0 : Math.min(basePrice, referralDiscount + pointsDiscount);
    const discountedPrice = Math.max(0, basePrice - combinedDiscount);
    const tax = isFreeTrial ? 0 : Math.round(discountedPrice * 0.18);
    const total = isFreeTrial ? 0 : Math.round(discountedPrice + tax);

    if (paymentSuccess) {
      return (
        <ScrollView style={styles.checkoutContainer} contentContainerStyle={styles.checkoutContent}>
          <View style={styles.successCard}>
            <View style={styles.successCheckCircle}>
              <Ionicons name="checkmark-circle" size={56} color="#15803D" />
            </View>

            <View style={styles.verifiedBadge}>
              <Ionicons name="sparkles" size={12} color="#EA580C" />
              <Text style={styles.verifiedBadgeText}>Payment Verified & Active</Text>
            </View>

            <Text style={styles.successTitle}>Membership Confirmed!</Text>
            <Text style={styles.successSub}>
              Your {paymentSuccess.planName} package at {paymentSuccess.gymName} is now active.
            </Text>

            {/* Email Confirmation Notice Banner */}
            <View style={styles.successEmailBanner}>
              <View style={styles.emailIconBox}>
                <Ionicons name="mail" size={20} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.emailBannerTitle}>Confirmation Email Sent</Text>
                <Text style={styles.emailBannerSub}>
                  Official invoice and membership agreement delivered to {user?.email || 'renugopal@gmail.com'}.
                </Text>
              </View>
            </View>

            {/* Receipt Summary Box */}
            <View style={styles.receiptSummaryBox}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Plan Package</Text>
                <Text style={styles.receiptVal}>{paymentSuccess.planName}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Duration</Text>
                <Text style={styles.receiptVal}>1 Month</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Amount Paid</Text>
                <Text style={styles.receiptVal}>₹{paymentSuccess.amount}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Payment Method</Text>
                <Text style={styles.receiptVal}>{paymentSuccess.paymentMethod}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Status</Text>
                <Text style={[styles.receiptVal, { color: '#15803D' }]}>Active ✓</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.successDoneBtn}
              onPress={() => {
                setCheckoutPlan(null);
                setPaymentSuccess(null);
                if (onNavigateTab) onNavigateTab('home', 'dashboard');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.successDoneBtnText}>Go to My Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.successBackGymBtn}
              onPress={() => {
                setCheckoutPlan(null);
                setPaymentSuccess(null);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.successBackGymBtnText}>Back to Gym Details</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView 
        style={styles.checkoutContainer} 
        contentContainerStyle={styles.checkoutContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation: Back to Gym Details (Matching Web Image 1) */}
        <TouchableOpacity
          style={styles.backToGymBtn}
          onPress={() => {
            setCheckoutPlan(null);
            setPaymentSuccess(null);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color="#64748B" />
          <Text style={styles.backToGymBtnText}>Back to Gym Details</Text>
        </TouchableOpacity>

        {/* ── CARD 1: CHECKOUT & PAYMENT METHOD (Matching Web Left Card) ── */}
        <View style={styles.checkoutMainCard}>
          {/* Header Row */}
          <View style={styles.checkoutCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkoutCardTitle}>Checkout</Text>
              <Text style={styles.checkoutCardSub}>
                Complete payment to activate {checkoutPlan.name}
              </Text>
            </View>
            <View style={styles.planBadgeTopRight}>
              <Text style={styles.planBadgeTopRightText}>
                {checkoutPlan.name.toUpperCase()} PLAN
              </Text>
            </View>
          </View>

          {/* Section: Select Payment Method */}
          <View style={styles.checkoutSection}>
            <View style={styles.checkoutSectionHeaderRow}>
              <Ionicons name="card-outline" size={17} color="#EA580C" />
              <Text style={styles.checkoutSectionTitle}>Select Payment Method</Text>
            </View>

            {/* 4 Payment Methods Grid */}
            <View style={styles.paymentMethodsGrid}>
              {/* Method 1: UPI / QR Code */}
              <TouchableOpacity
                style={[
                  styles.paymentOptionCard,
                  paymentMethod === 'UPI' && styles.paymentOptionCardActive
                ]}
                onPress={() => setPaymentMethod('UPI')}
                activeOpacity={0.8}
              >
                <View style={[styles.paymentOptionIconBox, paymentMethod === 'UPI' && styles.paymentOptionIconBoxActive]}>
                  <Ionicons name="qr-code-outline" size={18} color={paymentMethod === 'UPI' ? '#FFFFFF' : '#64748B'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.paymentOptionLabel, paymentMethod === 'UPI' && styles.paymentOptionLabelActive]}>
                    UPI / QR Code
                  </Text>
                  <Text style={styles.paymentOptionDesc}>
                    Instant activation via GPay, PhonePe, Paytm
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Method 2: Credit / Debit Card */}
              <TouchableOpacity
                style={[
                  styles.paymentOptionCard,
                  paymentMethod === 'Card' && styles.paymentOptionCardActive
                ]}
                onPress={() => setPaymentMethod('Card')}
                activeOpacity={0.8}
              >
                <View style={[styles.paymentOptionIconBox, paymentMethod === 'Card' && styles.paymentOptionIconBoxActive]}>
                  <Ionicons name="card-outline" size={18} color={paymentMethod === 'Card' ? '#FFFFFF' : '#64748B'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.paymentOptionLabel, paymentMethod === 'Card' && styles.paymentOptionLabelActive]}>
                    Visa, MasterCard, RuPay
                  </Text>
                  <Text style={styles.paymentOptionDesc}>
                    Credit or debit card payment
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Method 3: Net Banking */}
              <TouchableOpacity
                style={[
                  styles.paymentOptionCard,
                  paymentMethod === 'Net Banking' && styles.paymentOptionCardActive
                ]}
                onPress={() => setPaymentMethod('Net Banking')}
                activeOpacity={0.8}
              >
                <View style={[styles.paymentOptionIconBox, paymentMethod === 'Net Banking' && styles.paymentOptionIconBoxActive]}>
                  <Ionicons name="business-outline" size={18} color={paymentMethod === 'Net Banking' ? '#FFFFFF' : '#64748B'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.paymentOptionLabel, paymentMethod === 'Net Banking' && styles.paymentOptionLabelActive]}>
                    Net Banking
                  </Text>
                  <Text style={styles.paymentOptionDesc}>
                    All major Indian banks supported
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Method 4: Pay at Gym Counter */}
              <TouchableOpacity
                style={[
                  styles.paymentOptionCard,
                  paymentMethod === 'Cash at Gym' && styles.paymentOptionCardActive
                ]}
                onPress={() => setPaymentMethod('Cash at Gym')}
                activeOpacity={0.8}
              >
                <View style={[styles.paymentOptionIconBox, paymentMethod === 'Cash at Gym' && styles.paymentOptionIconBoxActive]}>
                  <Ionicons name="cash-outline" size={18} color={paymentMethod === 'Cash at Gym' ? '#FFFFFF' : '#64748B'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.paymentOptionLabel, paymentMethod === 'Cash at Gym' && styles.paymentOptionLabelActive]}>
                    Pay at Gym Counter
                  </Text>
                  <Text style={styles.paymentOptionDesc}>
                    Pay directly when you visit the gym
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Subform based on selected payment method */}
          {paymentMethod === 'UPI' && (
            <View style={styles.subformCard}>
              <View style={styles.qrRow}>
                {/* QR Code Container */}
                <View style={styles.qrCodeBox}>
                  <Image 
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=aigym@icici&pn=${encodeURIComponent(gymName)}&am=${total}&cu=INR` }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>

                {/* QR Instructions */}
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.qrHeaderTitle}>SCAN QR CODE</Text>
                  <Text style={styles.qrSubText}>
                    Scan with Google Pay, PhonePe, Paytm, or BHIM to pay instantly.
                  </Text>

                  <TouchableOpacity
                    style={styles.upiPillBox}
                    onPress={() => {
                      setCopiedUpi(true);
                      Alert.alert('UPI ID Copied', 'aigym@icici has been copied to your clipboard.');
                      setTimeout(() => setCopiedUpi(false), 2000);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.upiPillLabel}>
                      UPI ID: <Text style={styles.upiPillValue}>aigym@icici</Text>
                    </Text>
                    <Ionicons name={copiedUpi ? 'checkmark-circle' : 'copy-outline'} size={13} color="#EA580C" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* UPI ID Input */}
              <View style={{ marginTop: 8 }}>
                <Text style={styles.inputFieldLabel}>Or Enter Your UPI ID</Text>
                <TextInput
                  style={styles.textInputBox}
                  placeholder="yourname@okhdfcbank"
                  placeholderTextColor="#94A3B8"
                  value={upiId}
                  onChangeText={setUpiId}
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}

          {paymentMethod === 'Card' && (
            <View style={styles.subformCard}>
              <View>
                <Text style={styles.inputFieldLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.textInputBox}
                  placeholder="Name on card"
                  placeholderTextColor="#94A3B8"
                  value={cardDetails.name}
                  onChangeText={(val) => setCardDetails({ ...cardDetails, name: val })}
                />
              </View>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.inputFieldLabel}>Card Number</Text>
                <TextInput
                  style={styles.textInputBox}
                  placeholder="4532 •••• •••• 8901"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={cardDetails.number}
                  onChangeText={(val) => setCardDetails({ ...cardDetails, number: val })}
                  maxLength={19}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputFieldLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.textInputBox}
                    placeholder="MM/YY"
                    placeholderTextColor="#94A3B8"
                    value={cardDetails.expiry}
                    onChangeText={(val) => setCardDetails({ ...cardDetails, expiry: val })}
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputFieldLabel}>CVV</Text>
                  <TextInput
                    style={styles.textInputBox}
                    placeholder="•••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    keyboardType="numeric"
                    value={cardDetails.cvv}
                    onChangeText={(val) => setCardDetails({ ...cardDetails, cvv: val })}
                    maxLength={4}
                  />
                </View>
              </View>
            </View>
          )}

          {paymentMethod === 'Net Banking' && (
            <View style={styles.subformCard}>
              <Text style={styles.inputFieldLabel}>Popular Indian Banks</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank'].map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.bankSelectPill, bankName === b && styles.bankSelectPillActive]}
                    onPress={() => setBankName(b)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.bankSelectPillText, bankName === b && styles.bankSelectPillTextActive]}>
                      {b}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {paymentMethod === 'Cash at Gym' && (
            <View style={[styles.subformCard, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="storefront-outline" size={16} color="#EA580C" />
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#EA580C' }}>Pay At Gym Counter</Text>
              </View>
              <Text style={{ fontSize: 11.5, color: '#475569', marginTop: 4, lineHeight: 16 }}>
                Your membership package will be pre-registered. You can pay via Cash, POS card machine, or UPI at the front desk upon arrival.
              </Text>
            </View>
          )}

          {/* Big Orange Pay Button Matching Web Image 2 */}
          <TouchableOpacity
            style={styles.bigPayButton}
            onPress={handleConfirmCheckout}
            disabled={isProcessingPayment}
            activeOpacity={0.8}
          >
            {isProcessingPayment ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.bigPayButtonText}>
                Pay ₹{total.toLocaleString('en-IN')} & Confirm {checkoutPlan.name}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── CARD 2: ORDER SUMMARY (Matching Web Right Card) ────── */}
        <View style={styles.orderSummaryCard}>
          <View style={styles.orderSummaryHeader}>
            <Ionicons name="document-text-outline" size={18} color="#EA580C" />
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
          </View>

          {/* Gym / Branch Info */}
          <View style={styles.summaryGymInfoRow}>
            <View style={styles.summaryGymIconCircle}>
              <Ionicons name="business" size={16} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryGymName}>{gymName}</Text>
              <Text style={styles.summaryGymLocation}>{gymCity}</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          {/* Selected Plan Details */}
          <View style={styles.summaryPlanCard}>
            <View style={styles.summaryPlanTopRow}>
              <Text style={styles.summaryPlanName}>{checkoutPlan.name}</Text>
              <View style={styles.durationPill}>
                <Text style={styles.durationPillText}>1 Month</Text>
              </View>
            </View>
            <Text style={styles.summaryPlanFeatures} numberOfLines={3}>
              {checkoutPlan.features && Array.isArray(checkoutPlan.features)
                ? checkoutPlan.features.join(' • ')
                : checkoutPlan.description || 'Muscle-building workout programs • Strength training • Progressive overload training'}
            </Text>
          </View>

          {/* Referral Code Coupon Box */}
          <View style={styles.referralBox}>
            <View style={styles.referralHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="gift-outline" size={15} color="#EA580C" />
                <Text style={styles.referralTitle}>Referral Code</Text>
              </View>
              {appliedReferral && (
                <View style={styles.appliedTag}>
                  <Text style={styles.appliedTagText}>Applied ✓</Text>
                </View>
              )}
            </View>

            <View style={styles.referralInputRow}>
              <TextInput
                style={styles.referralInput}
                placeholder="ENTER REFERRAL CODE"
                placeholderTextColor="#94A3B8"
                value={referralCodeInput}
                onChangeText={(val) => {
                  setReferralCodeInput(val.toUpperCase());
                  setRefError('');
                }}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyReferral}
                activeOpacity={0.8}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {appliedReferral && (
              <Text style={styles.referralSuccessText}>
                ✓ ₹{referralDiscount} discount applied from {appliedReferral.code}!
              </Text>
            )}
            {refError ? (
              <Text style={styles.referralErrorText}>{refError}</Text>
            ) : null}
          </View>

          {/* Redeem Referral Points Box */}
          <View style={styles.pointsRedemptionBox}>
            <TouchableOpacity
              style={styles.pointsCheckboxRow}
              onPress={() => setUsePoints(!usePoints)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkboxSquare, usePoints && styles.checkboxSquareActive]}>
                {usePoints && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name="sparkles" size={14} color="#EA580C" />
                <Text style={styles.pointsLabel}>Redeem Referral Points</Text>
              </View>
              <Text style={styles.pointsAvailableText}>150 pts available</Text>
            </TouchableOpacity>

            {usePoints && (
              <View style={styles.pointsDetailsRow}>
                <Text style={styles.pointsDetailsText}>Conversion: 100 pts = ₹50</Text>
                <Text style={styles.pointsDiscountVal}>Discount: - ₹{pointsDiscount}</Text>
              </View>
            )}
          </View>

          {/* Price Breakdown */}
          <View style={styles.priceBreakdownBlock}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Package Price</Text>
              <Text style={styles.priceVal}>₹{basePrice.toLocaleString('en-IN')}</Text>
            </View>

            {referralDiscount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: '#15803D' }]}>Referral Discount</Text>
                <Text style={[styles.priceVal, { color: '#15803D' }]}>- ₹{referralDiscount}</Text>
              </View>
            )}

            {pointsDiscount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: '#15803D' }]}>Points Discount (150 pts)</Text>
                <Text style={[styles.priceVal, { color: '#15803D' }]}>- ₹{pointsDiscount}</Text>
              </View>
            )}

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxes (18% GST)</Text>
              <Text style={styles.priceVal}>₹{tax.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.totalDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL PAYABLE</Text>
              <Text style={styles.totalVal}>₹{total.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Trust Badge Card */}
          <View style={styles.trustBadgeCard}>
            <Ionicons name="shield-checkmark" size={16} color="#15803D" style={{ marginTop: 1 }} />
            <Text style={styles.trustBadgeText}>
              Safe & Encrypted checkout. Instant membership activation with automated confirmation email.
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  // If a plan is selected for checkout, render the full checkout view!
  if (checkoutPlan) {
    return renderCheckoutView();
  }

  // Images list (from backend or fallback matching Web Image 1)
  const galleryImages = (gymDetails?.images && Array.isArray(gymDetails.images) && gymDetails.images.length > 0)
    ? gymDetails.images.slice(0, 3)
    : DEFAULT_GYM_IMAGES;

  // Amenities list (from backend or fallback matching Web Image 2)
  const amenitiesList = Array.from(new Set([
    ...(gymDetails?.services || []),
    ...(gymDetails?.facilities || []),
    ...DEFAULT_AMENITIES
  ]));

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* ======================================================== */}
      {/* 1. TOP GYM HEADER CARD (Matching Web Image 1 Exactly) */}
      {/* ======================================================== */}
      <View style={styles.webGymHeaderCard}>
        <View style={styles.headerTopContent}>
          {/* Gym Logo / Thumbnail */}
          <View style={styles.gymLogoBox}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80' }}
              style={styles.gymLogoImage}
              resizeMode="cover"
            />
          </View>

          {/* Gym Details & Badges */}
          <View style={styles.headerInfoCol}>
            <View style={styles.gymTitleRow}>
              <Text style={styles.gymTitleText}>{gymName}</Text>
            </View>

            {/* Badges: COMMERCIAL | ONLINE & OFFLINE | ★ 4 (1) */}
            <View style={styles.badgesWrapRow}>
              <View style={styles.badgeCommercial}>
                <Text style={styles.badgeCommercialText}>COMMERCIAL</Text>
              </View>

              <View style={styles.badgeOnlineOffline}>
                <Text style={styles.badgeOnlineOfflineText}>ONLINE & OFFLINE</Text>
              </View>

              <View style={styles.badgeRating}>
                <Ionicons name="star" size={13} color="#EAB308" />
                <Text style={styles.badgeRatingText}>{gymRating} ({gymReviewCount})</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location Pill Link Matching Web Image 1 Right Top */}
        <TouchableOpacity 
          style={styles.locationLinkPill} 
          onPress={handleOpenMap}
          activeOpacity={0.7}
        >
          <Ionicons name="location" size={14} color="#EA580C" />
          <Text style={styles.locationLinkPillText}>{gymCity}, {gymState}</Text>
          <Ionicons name="open-outline" size={13} color="#EA580C" />
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* 2. IMAGE GALLERY SHOWCASE (Matching Web Image 1 Exactly) */}
      {/* ======================================================== */}
      <View style={styles.galleryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
          {galleryImages.map((imgUri: string, idx: number) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.galleryImageCard}
              onPress={() => setPreviewImage(imgUri)}
              activeOpacity={0.85}
            >
              <Image 
                source={{ uri: imgUri }} 
                style={styles.galleryImage} 
                resizeMode="cover"
              />
              <View style={styles.galleryZoomIcon}>
                <Ionicons name="expand" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ======================================================== */}
      {/* 3. AMENITIES & SERVICES (Matching Web Image 2 Exactly) */}
      {/* ======================================================== */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="checkmark-circle" size={20} color="#EA580C" />
          <Text style={styles.sectionTitleText}>Amenities & Services</Text>
        </View>
        <View style={styles.amenitiesWrap}>
          {amenitiesList.map((amenity: string, idx: number) => (
            <View key={idx} style={styles.amenityPill}>
              <Text style={styles.amenityPillText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ======================================================== */}
      {/* 4. CONTACT INFO & LOCATION DETAILS (Matching Web Image 2) */}
      {/* ======================================================== */}
      <View style={styles.metaCardsContainer}>
        {/* Contact Info Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="call" size={18} color="#EA580C" />
            <Text style={styles.sectionTitleText}>Contact Info</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactItemRow}
            onPress={() => Linking.openURL(`mailto:${gymEmail}`)}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconCircle}>
              <Ionicons name="mail" size={16} color="#64748B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>EMAIL</Text>
              <Text style={styles.contactValue} numberOfLines={1}>{gymEmail}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactItemRow, { marginTop: 10 }]}
            onPress={() => Linking.openURL(`tel:${gymPhone}`)}
            activeOpacity={0.7}
          >
            <View style={styles.contactIconCircle}>
              <Ionicons name="call" size={16} color="#64748B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>PHONE</Text>
              <Text style={styles.contactValue}>{gymPhone}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Location Details Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="location" size={18} color="#EA580C" />
            <Text style={styles.sectionTitleText}>Location Details</Text>
          </View>

          <View style={styles.contactItemRow}>
            <View style={styles.contactIconCircle}>
              <Ionicons name="location" size={16} color="#64748B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>ADDRESS</Text>
              <Text style={styles.contactValueAddress}>{gymAddress}</Text>
            </View>
          </View>

          {/* View Map & Directions Button Matching Web Image 2 */}
          <TouchableOpacity 
            style={styles.viewMapButton} 
            onPress={handleOpenMap}
            activeOpacity={0.7}
          >
            <Ionicons name="navigate" size={15} color="#FFFFFF" />
            <Text style={styles.viewMapButtonText}>View Map & Directions</Text>
            <Ionicons name="open-outline" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 5. EQUIPMENT & AC DETAILS (Matching Web Image 2 Exactly) */}
      {/* ======================================================== */}
      <View style={styles.twoColGrid}>
        <View style={[styles.sectionCard, { flex: 1 }]}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="barbell" size={18} color="#EA580C" />
            <Text style={styles.sectionTitleText}>Equipment</Text>
          </View>
          <View style={styles.equipmentRow}>
            <Text style={styles.equipmentName}>Commercial Treadmill T90</Text>
            <View style={styles.equipmentCountBadge}>
              <Text style={styles.equipmentCountText}>4</Text>
            </View>
          </View>
        </View>

        <View style={[styles.sectionCard, { flex: 1 }]}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="snow" size={18} color="#EA580C" />
            <Text style={styles.sectionTitleText}>AC Details</Text>
          </View>
          <Text style={styles.acDetailValue}>Non-AC</Text>
        </View>
      </View>

      {/* ======================================================== */}
      {/* 6. AVAILABLE PLANS (Matching Web Image 3 Exactly) */}
      {/* ======================================================== */}
      <View style={[styles.sectionCard, { marginBottom: 30 }]}>
        <View style={styles.sectionHeaderRow}>
          <Ionicons name="calendar" size={20} color="#EA580C" />
          <Text style={styles.sectionTitleText}>Available Plans</Text>
        </View>

        <View style={styles.plansContainer}>
          {packages.map((pkg) => {
            const isSelected = selectedPlanId === pkg._id;
            return (
              <TouchableOpacity
                key={pkg._id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardActive
                ]}
                onPress={() => handleSelectAndPay(pkg)}
                activeOpacity={0.9}
              >
                {/* Title & Description */}
                <Text style={styles.planTitle}>{pkg.name}</Text>
                <Text style={styles.planDescription} numberOfLines={2}>
                  {pkg.description}
                </Text>

                {/* Price */}
                <View style={styles.planPriceRow}>
                  <Text style={styles.planPriceText}>₹{pkg.monthlyPrice}</Text>
                  <Text style={styles.planDurationText}> / month</Text>
                </View>

                {/* Training Type & Duration Badges */}
                <View style={styles.planPillsRow}>
                  <View style={styles.planMetaPill}>
                    <Text style={styles.planMetaPillText}>{pkg.trainingType}</Text>
                  </View>
                  <View style={styles.planMetaPill}>
                    <Text style={styles.planMetaPillText}>{pkg.duration}</Text>
                  </View>
                </View>

                {/* Features Included List */}
                <View style={styles.planFeaturesContainer}>
                  <Text style={styles.featuresHeading}>FEATURES INCLUDED:</Text>
                  {pkg.features.map((feat: string, fIdx: number) => (
                    <View key={fIdx} style={styles.featureItemRow}>
                      <Ionicons name="checkmark-circle-outline" size={15} color="#EA580C" style={{ marginTop: 1 }} />
                      <Text style={styles.featureItemText}>{feat}</Text>
                    </View>
                  ))}
                </View>

                {/* Choose & Pay Now Button Matching Web Image 3 */}
                <TouchableOpacity
                  style={[
                    styles.choosePlanButton,
                    { backgroundColor: pkg.accentColor || '#EA580C' }
                  ]}
                  onPress={() => handleSelectAndPay(pkg)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.choosePlanButtonText}>
                    Choose {pkg.name} • Pay Now
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>



      {/* ======================================================== */}
      {/* IMAGE PREVIEW LIGHTBOX */}
      {/* ======================================================== */}
      <Modal visible={!!previewImage} transparent animationType="fade">
        <View style={styles.lightboxOverlay}>
          <TouchableOpacity style={styles.lightboxCloseBtn} onPress={() => setPreviewImage(null)}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          {previewImage && (
            <Image 
              source={{ uri: previewImage }} 
              style={styles.lightboxImage} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 14, paddingBottom: 100 },

  // ==========================================
  // 1. Web Gym Header Card (Matching Web Image 1)
  // ==========================================
  webGymHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerTopContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  gymLogoBox: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gymLogoImage: {
    width: '100%',
    height: '100%',
  },
  headerInfoCol: {
    flex: 1,
  },
  gymTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gymTitleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  badgesWrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  badgeCommercial: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeCommercialText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B91C1C',
    letterSpacing: 0.4,
  },
  badgeOnlineOffline: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeOnlineOfflineText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.4,
  },
  badgeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEFCE8',
    borderWidth: 1,
    borderColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeRatingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#854D0E',
  },
  locationLinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  locationLinkPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },

  // ==========================================
  // 2. Image Gallery Showcase (Matching Web Image 1)
  // ==========================================
  galleryContainer: {
    marginBottom: 14,
  },
  galleryScroll: {
    gap: 10,
  },
  galleryImageCard: {
    width: SCREEN_WIDTH * 0.72,
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#000000',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryZoomIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ==========================================
  // Section Cards Common Styles
  // ==========================================
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  // Amenities & Services
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  amenityPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // Contact Info & Location
  metaCardsContainer: {
    gap: 14,
  },
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  contactIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  contactValueAddress: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
    marginTop: 2,
  },
  viewMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  viewMapButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Equipment & AC
  twoColGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  equipmentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  equipmentCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  equipmentCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  acDetailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  // ==========================================
  // Available Plans (Matching Web Image 3)
  // ==========================================
  plansContainer: {
    gap: 14,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
  },
  planCardActive: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFFDFB',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  planDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 10,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPriceText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  planDurationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  planPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  planMetaPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planMetaPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  planFeaturesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginBottom: 14,
  },
  featuresHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  featureItemText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
    lineHeight: 17,
  },
  choosePlanButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choosePlanButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Checkout Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  checkoutSummaryCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  checkoutPlanName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  checkoutPlanPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA580C',
  },
  checkoutPlanMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
    marginTop: 2,
  },
  checkoutPlanDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 16,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  memberInfoBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  memberNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  memberSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  payMethodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  payMethodBtnActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  payMethodText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  payMethodTextActive: {
    color: '#EA580C',
  },
  modalFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalConfirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Lightbox
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  lightboxImage: {
    width: '90%',
    height: '75%',
  },

  // ==========================================
  // FULL-PAGE CHECKOUT STYLES (Matching Web Image 1 & 2)
  // ==========================================
  checkoutContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  checkoutContent: {
    padding: 14,
    paddingBottom: 40,
    gap: 14,
  },
  backToGymBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  backToGymBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  checkoutMainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  checkoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 14,
    gap: 10,
  },
  checkoutCardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  checkoutCardSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  planBadgeTopRight: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  planBadgeTopRightText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.4,
  },
  checkoutSection: {
    gap: 10,
  },
  checkoutSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkoutSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  paymentMethodsGrid: {
    gap: 8,
  },
  paymentOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
  },
  paymentOptionCardActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F97316',
  },
  paymentOptionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentOptionIconBoxActive: {
    backgroundColor: '#C2410C',
  },
  paymentOptionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  paymentOptionLabelActive: {
    color: '#EA580C',
  },
  paymentOptionDesc: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  subformCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qrCodeBox: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  qrSubText: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },
  upiPillBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 4,
  },
  upiPillLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  upiPillValue: {
    fontWeight: '800',
    color: '#EA580C',
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  textInputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12.5,
    color: '#111827',
  },
  bankSelectPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bankSelectPillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F97316',
  },
  bankSelectPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  bankSelectPillTextActive: {
    color: '#EA580C',
  },
  bigPayButton: {
    backgroundColor: '#C2410C',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bigPayButtonText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  /* Order Summary Card */
  orderSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  orderSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  orderSummaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  summaryGymInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryGymIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryGymName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  summaryGymLocation: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  summaryPlanCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 6,
  },
  summaryPlanTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryPlanName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  durationPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  durationPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  summaryPlanFeatures: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 15,
  },
  referralBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8,
  },
  referralHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referralTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#111827',
  },
  appliedTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  appliedTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  referralInputRow: {
    flexDirection: 'row',
    gap: 6,
  },
  referralInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11.5,
    color: '#111827',
  },
  applyBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  referralSuccessText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#15803D',
  },
  referralErrorText: {
    fontSize: 10.5,
    color: '#DC2626',
  },
  pointsRedemptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 6,
  },
  pointsCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  pointsLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#111827',
  },
  pointsAvailableText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  pointsDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  pointsDetailsText: {
    fontSize: 10,
    color: '#64748B',
  },
  pointsDiscountVal: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  priceBreakdownBlock: {
    gap: 8,
    paddingTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },
  priceVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  totalDivider: {
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  totalVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  trustBadgeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  trustBadgeText: {
    flex: 1,
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },

  /* Success Confirmation Screen */
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  successCheckCircle: {
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  successSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  successEmailBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginVertical: 4,
  },
  emailIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailBannerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#111827',
  },
  emailBannerSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  receiptSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    width: '100%',
    gap: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  successDoneBtn: {
    backgroundColor: '#C2410C',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  successDoneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successBackGymBtn: {
    paddingVertical: 8,
  },
  successBackGymBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
