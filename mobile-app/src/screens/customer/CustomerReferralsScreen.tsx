import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Share,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { ScannableQRCode } from '../../components/ScannableQRCode';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default fallback data matching Web Image 7 & 8
const DEFAULT_REFERRAL_CODE = 'RENUG7557';
const DEFAULT_STATS = {
  totalInvited: 4,
  pendingPaymentCount: 0,
  successfulCount: 1,
  totalEarned: 150,
  totalRedeemed: 0,
  availableBalance: 150,
};

const DEFAULT_INVITES = [
  {
    _id: 'ref_1',
    refereeName: 'Renu y.',
    inviteChannel: 'Email',
    registrationDate: '2026-10-23T00:00:00.000Z',
    status: 'Payment Verified',
    rewardAmount: 500,
  },
  {
    _id: 'ref_2',
    refereeName: 'Karthik Raja',
    inviteChannel: 'WhatsApp',
    registrationDate: '2026-10-20T00:00:00.000Z',
    status: 'Membership Pending',
    rewardAmount: 500,
  },
  {
    _id: 'ref_3',
    refereeName: 'Priya Sundar',
    inviteChannel: 'Link',
    registrationDate: '2026-10-18T00:00:00.000Z',
    status: 'Registered',
    rewardAmount: 500,
  },
  {
    _id: 'ref_4',
    refereeName: 'Suresh Kumar',
    inviteChannel: 'Email',
    registrationDate: '2026-10-15T00:00:00.000Z',
    status: 'Invited',
    rewardAmount: 500,
  },
];

const DEFAULT_TRANSACTIONS = [
  {
    _id: 'tx_1',
    transactionType: 'EARN_REFERRAL',
    points: 150,
    balanceAfter: 150,
    reason: 'Referral reward confirmed - Renu y. payment verified',
    status: 'COMPLETED',
    createdAt: '2026-10-23T10:30:00.000Z',
  },
];

const DEFAULT_MEMBERSHIP_PLANS = [
  { _id: 'plan_1', name: '1 Month Standard Plan', price: 1500, duration: '1 month' },
  { _id: 'plan_2', name: '3 Months Pro Plan', price: 3800, duration: '3 months' },
  { _id: 'plan_3', name: '6 Months Elite Plan', price: 7000, duration: '6 months' },
  { _id: 'plan_4', name: '12 Months Annual VIP', price: 12000, duration: '12 months' },
];

const DEFAULT_CUSTOM_REWARDS = [
  {
    _id: 'cr_1',
    title: 'Free Personal Training Session',
    description: '1-on-1 private coaching session with a certified senior trainer.',
    pointsRequired: 100,
    category: 'Training',
  },
  {
    _id: 'cr_2',
    title: 'Gym T-Shirt & Shaker Bottle',
    description: 'Official Perfect Fitness Studio dry-fit workout apparel.',
    pointsRequired: 150,
    category: 'Merchandise',
  },
  {
    _id: 'cr_3',
    title: '1 Week Guest Pass for Friend',
    description: 'Complimentary pass for a companion to work out with you.',
    pointsRequired: 50,
    category: 'Access',
  },
];

export const CustomerReferralsScreen: React.FC<{
  onNavigateTab?: (tab: string, sub?: string) => void;
}> = ({ onNavigateTab }) => {
  const { user } = useAuth();

  // Active sub-tab: 'invite' (Refer & Earn Friends) or 'redemption' (Points & Redemption)
  const [activeSubTab, setActiveSubTab] = useState<'invite' | 'redemption'>('invite');

  // Loading & refreshing
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Referral states
  const [referralCode, setReferralCode] = useState<string>(DEFAULT_REFERRAL_CODE);
  const [shareLink, setShareLink] = useState<string>('http://localhost:5173/register/customer?ref=RENUG7557');
  const [gymName, setGymName] = useState<string>('Perfect Fitness Studio');
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [referrals, setReferrals] = useState<any[]>(DEFAULT_INVITES);
  const [pointsHistory, setPointsHistory] = useState<any[]>(DEFAULT_TRANSACTIONS);
  const [wallet, setWallet] = useState({
    currentBalance: 150,
    totalEarned: 150,
    totalRedeemed: 0,
  });

  // Settings
  const [rewardSettings, setRewardSettings] = useState({
    pointsPerConversionUnit: 100,
    currencyValuePerUnit: 50,
    minPointsForRedemption: 100,
    maxDiscountPerTransaction: 1000,
    enableMembershipDiscount: true,
    enableStorePurchase: true,
    enableCustomRewards: true,
  });

  // Email form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState(
    'Hey! Come workout with me at our gym. Use my referral link to get an exclusive discount on your membership!'
  );
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Copy feedback
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemModalTab, setRedeemModalTab] = useState<'membership' | 'store' | 'custom'>('membership');

  // Redemption calculator state
  const [selectedPlan, setSelectedPlan] = useState<any>(DEFAULT_MEMBERSHIP_PLANS[0]);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(100);
  const [claimedVoucher, setClaimedVoucher] = useState<{ title: string; code: string } | null>(null);

  // Conversion rate: 100 pts = ₹50 -> ₹0.50 per point
  const pointRate = useMemo(() => {
    const pts = rewardSettings.pointsPerConversionUnit || 100;
    const val = rewardSettings.currencyValuePerUnit || 50;
    return val / pts;
  }, [rewardSettings]);

  const equivalentRupeeValue = useMemo(() => {
    return Math.floor(wallet.currentBalance * pointRate);
  }, [wallet.currentBalance, pointRate]);

  const discountAmount = useMemo(() => {
    return Math.min(Math.floor(pointsToRedeem * pointRate), selectedPlan?.price || 0, rewardSettings.maxDiscountPerTransaction);
  }, [pointsToRedeem, pointRate, selectedPlan, rewardSettings]);

  const finalPlanPrice = useMemo(() => {
    if (!selectedPlan) return 0;
    return Math.max(0, selectedPlan.price - discountAmount);
  }, [selectedPlan, discountAmount]);

  const fetchReferralData = useCallback(async () => {
    try {
      const [codeRes, statsRes, histRes, detailedRes, settingsRes] = await Promise.allSettled([
        api.get('/referrals/my-code'),
        api.get('/referrals/my-stats'),
        api.get('/referrals/my-history'),
        api.get('/referrals/my-detailed-history'),
        api.get('/referrals/settings'),
      ]);

      if (codeRes.status === 'fulfilled' && codeRes.value?.data?.success) {
        if (codeRes.value.data.referralCode) setReferralCode(codeRes.value.data.referralCode);
        if (codeRes.value.data.shareLink) setShareLink(codeRes.value.data.shareLink);
        if (codeRes.value.data.gymName) setGymName(codeRes.value.data.gymName);
      } else {
        const genCode = `${(user?.firstName || user?.name || 'RENUG').slice(0, 5).toUpperCase()}7557`;
        setReferralCode(genCode);
        setShareLink(`http://localhost:5173/register/customer?ref=${genCode}`);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.success) {
        const s = statsRes.value.data.stats || {};
        setStats({
          totalInvited: s.totalInvited ?? 4,
          pendingPaymentCount: s.pendingPaymentCount ?? 0,
          successfulCount: s.successfulCount ?? 1,
          totalEarned: s.totalEarned ?? 150,
          totalRedeemed: s.totalRedeemed ?? 0,
          availableBalance: s.availableBalance ?? 150,
        });
      }

      if (histRes.status === 'fulfilled' && histRes.value?.data?.success) {
        const list = histRes.value.data.history || histRes.value.data.referrals || [];
        if (list.length > 0) setReferrals(list);
      }

      if (detailedRes.status === 'fulfilled' && detailedRes.value?.data?.success) {
        if (detailedRes.value.data.wallet) {
          setWallet({
            currentBalance: detailedRes.value.data.wallet.currentBalance ?? 150,
            totalEarned: detailedRes.value.data.wallet.totalEarned ?? 150,
            totalRedeemed: detailedRes.value.data.wallet.totalRedeemed ?? 0,
          });
        }
        if (detailedRes.value.data.transactions && detailedRes.value.data.transactions.length > 0) {
          setPointsHistory(detailedRes.value.data.transactions);
        }
      }

      if (settingsRes.status === 'fulfilled' && settingsRes.value?.data?.settings) {
        setRewardSettings(settingsRes.value.data.settings);
      }
    } catch (err) {
      console.log('[Referrals] Note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReferralData();
  };

  const handleCopyCode = () => {
    setCopiedCode(true);
    Alert.alert('Copied!', `Referral code "${referralCode}" copied.`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    Alert.alert('Copied!', 'Direct referral registration link copied.');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareText = `Hey! I workout at ${gymName}. Use my referral code ${referralCode} to get ₹200 off on your membership! Register here: ${shareLink}`;

  const handleWhatsAppShare = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`);
        }
      })
      .catch(() => {
        Alert.alert('Share via WhatsApp', shareText);
      });
  };

  const handleMailAppShare = () => {
    const subject = encodeURIComponent(`Invitation to workout together at ${gymName}!`);
    const body = encodeURIComponent(
      `Hi there,\n\n${inviteMessage}\n\nPromo Code: ${referralCode}\nDiscount: ₹200 off\nJoin here: ${shareLink}\n\nCheers,\n${user?.firstName || user?.name || 'Your friend'}`
    );
    Linking.openURL(`mailto:${inviteEmail || ''}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Mail App', 'Unable to open mail client automatically.');
    });
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: shareText,
        url: shareLink,
        title: `Join ${gymName} with my referral!`,
      });
    } catch (err) {
      handleCopyLink();
    }
  };

  const handleSendEmailInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    try {
      setSendingInvite(true);
      setInviteFeedback(null);
      const res = await api.post('/referrals/invite', {
        inviteeName: inviteName.trim(),
        inviteeEmail: inviteEmail.trim(),
        friendName: inviteName.trim(),
        friendEmail: inviteEmail.trim(),
        personalMessage: inviteMessage,
      });

      if (res.data?.success) {
        setInviteFeedback({
          type: 'success',
          message: `Referral invite successfully sent to ${inviteEmail}!`,
        });
        // Add to local list immediately
        const newInvite = {
          _id: `ref_new_${Date.now()}`,
          refereeName: inviteName || inviteEmail,
          inviteChannel: 'Email',
          registrationDate: new Date().toISOString(),
          status: 'Invited',
          rewardAmount: 500,
        };
        setReferrals((prev) => [newInvite, ...prev]);
        setStats((prev) => ({ ...prev, totalInvited: prev.totalInvited + 1 }));
        setInviteName('');
        setInviteEmail('');
      } else {
        setInviteFeedback({
          type: 'error',
          message: res.data?.message || 'Failed to dispatch email invite.',
        });
      }
    } catch (err: any) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      setInviteFeedback({
        type: 'error',
        message: serverMsg
          ? `Email delivery failed: ${serverMsg}`
          : 'Unable to send email right now. Please share your referral link directly via WhatsApp or SMS.',
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleClaimReward = (reward: any) => {
    if (wallet.currentBalance < reward.pointsRequired) {
      Alert.alert(
        'Insufficient Points',
        `You need ${reward.pointsRequired} points to redeem this reward. Available: ${wallet.currentBalance} Pts.`
      );
      return;
    }
    const code = `VOUCH-${reward.category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setClaimedVoucher({ title: reward.title, code });
    setWallet((prev) => ({
      ...prev,
      currentBalance: prev.currentBalance - reward.pointsRequired,
      totalRedeemed: prev.totalRedeemed + reward.pointsRequired,
    }));
    Alert.alert(
      'Reward Claimed Successfully! 🎉',
      `Your voucher code is: ${code}\n\nPresent this code at reception or front desk to redeem "${reward.title}".`
    );
  };

  return (
    <View style={styles.container}>
      {/* ========================================================================= */}
      {/* SUB-TAB BAR: FULL-WIDTH SEGMENTED CONTROL                                  */}
      {/* ========================================================================= */}
      <View style={styles.subTabBar}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeSubTab === 'invite' && styles.segmentBtnActive]}
            onPress={() => setActiveSubTab('invite')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={activeSubTab === 'invite' ? 'gift' : 'gift-outline'}
              size={14}
              color={activeSubTab === 'invite' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.85}
              style={[styles.segmentText, activeSubTab === 'invite' && styles.segmentTextActive]}
            >
              Refer & Earn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, activeSubTab === 'redemption' && styles.segmentBtnActive]}
            onPress={() => setActiveSubTab('redemption')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={activeSubTab === 'redemption' ? 'cash' : 'cash-outline'}
              size={14}
              color={activeSubTab === 'redemption' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.85}
              style={[styles.segmentText, activeSubTab === 'redemption' && styles.segmentTextActive]}
            >
              Points ({wallet.currentBalance} Pts)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />}
      >
        {activeSubTab === 'invite' ? (
          /* ========================================================================= */
          /* SUB-TAB 1: REFER & EARN FRIENDS                                           */
          /* ========================================================================= */
          <View style={styles.tabContent}>
            {/* 1. Hero Banner */}
            <View style={styles.heroCard}>
              <View style={styles.heroTag}>
                <Ionicons name="gift" size={12} color="#EA580C" />
                <Text style={styles.heroTagText}>REFER & EARN REWARDS</Text>
              </View>
              <Text style={styles.heroTitle}>
                Invite Friends & Family, <Text style={{ color: '#EA580C' }}>Get Rewarded Together!</Text>
              </Text>
              <Text style={styles.heroSub}>
                Give your friends an exclusive gym membership discount at <Text style={{ fontWeight: '700', color: '#111827' }}>{gymName}</Text>, 
                and earn referral points for every friend who joins and activates a membership!
              </Text>

              {/* Quick Balance & Redeem Strip */}
              <View style={styles.inviteQuickStrip}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="sparkles" size={14} color="#EA580C" />
                  <Text style={styles.inviteQuickStripText}>
                    Wallet: <Text style={{ fontWeight: '800', color: '#111827' }}>{wallet.currentBalance} Pts</Text>
                    <Text style={{ color: '#64748B' }}> (₹{(wallet.currentBalance * 0.5).toFixed(0)})</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.inviteQuickRedeemBtn}
                  onPress={() => {
                    setShowRedeemModal(true);
                    setRedeemModalTab('membership');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.inviteQuickRedeemBtnText}>Redeem Points &rarr;</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Your Unique Referral Invite */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="share-social-outline" size={18} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Your Unique Referral Invite</Text>
                  <Text style={styles.cardSubtitle}>Share with friends via link, mail, QR, or chat apps.</Text>
                </View>
              </View>

              {/* Referral Code Box */}
              <View style={styles.codeContainer}>
                <View style={styles.codeTopRow}>
                  <View>
                    <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
                    <Text style={styles.codeValue}>{referralCode}</Text>
                  </View>
                  <View style={styles.codeActionsRow}>
                    <TouchableOpacity
                      style={styles.copyCodeBtn}
                      onPress={handleCopyCode}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={copiedCode ? 'checkmark' : 'copy-outline'}
                        size={14}
                        color="#FFFFFF"
                      />
                      <Text style={styles.copyCodeBtnText}>
                        {copiedCode ? 'Copied Code!' : 'Copy Code'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.qrBtn}
                      onPress={() => setShowQrModal(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="qr-code-outline" size={15} color="#EA580C" />
                      <Text style={styles.qrBtnText}>QR</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Direct Link */}
                <View style={styles.linkRow}>
                  <Text style={styles.linkLabel}>Direct Referral Registration Link</Text>
                  <View style={styles.linkInputRow}>
                    <TextInput
                      style={styles.linkInput}
                      value={shareLink}
                      editable={false}
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={styles.copyLinkBtn}
                      onPress={handleCopyLink}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.copyLinkBtnText}>
                        {copiedLink ? 'Copied Link!' : 'Copy Link'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Instant Sharing Channels */}
              <View style={styles.shareChannelsSec}>
                <Text style={styles.shareChannelsLabel}>INSTANT SHARING CHANNELS</Text>
                <View style={styles.shareChannelsRow}>
                  <TouchableOpacity
                    style={[styles.shareBtn, styles.waBtn]}
                    onPress={handleWhatsAppShare}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                    <Text style={[styles.shareBtnText, { color: '#25D366' }]}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.shareBtn, styles.mailBtn]}
                    onPress={handleMailAppShare}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="mail" size={16} color="#8B5CF6" />
                    <Text style={[styles.shareBtnText, { color: '#8B5CF6' }]}>Mail App</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.shareBtn, styles.moreBtn]}
                    onPress={handleNativeShare}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="share-social" size={16} color="#EA580C" />
                    <Text style={[styles.shareBtnText, { color: '#EA580C' }]}>More Apps</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 3. Dual Reward Benefit Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="ribbon-outline" size={18} color="#9333EA" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Dual Reward Benefit</Text>
                  <Text style={styles.cardSubtitle}>Both you & your friend benefit!</Text>
                </View>
              </View>

              <View style={styles.dualBenefitCol}>
                <View style={styles.benefitBox}>
                  <View style={styles.benefitBoxTop}>
                    <Text style={[styles.benefitBoxLabel, { color: '#EA580C' }]}>FOR YOUR FRIEND</Text>
                    <Ionicons name="pricetag-outline" size={14} color="#EA580C" />
                  </View>
                  <Text style={styles.benefitVal}>₹200 off</Text>
                  <Text style={styles.benefitDesc}>
                    Instant discount applied during checkout when they register with your code.
                  </Text>
                </View>

                <View style={styles.benefitBox}>
                  <View style={styles.benefitBoxTop}>
                    <Text style={[styles.benefitBoxLabel, { color: '#15803D' }]}>FOR YOU (REFERRER)</Text>
                    <Ionicons name="cash-outline" size={14} color="#15803D" />
                  </View>
                  <Text style={styles.benefitVal}>500 Points</Text>
                  <Text style={styles.benefitDesc}>
                    Credited directly into your points balance upon confirmed payment.
                  </Text>
                </View>
              </View>
            </View>

            {/* 4. How It Works */}
            <View style={styles.card}>
              <Text style={styles.secTitle}>How It Works</Text>
              <View style={styles.stepsCol}>
                <View style={styles.stepItem}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>1</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepHead}>Share Your Code</Text>
                    <Text style={styles.stepBody}>Send your code or link to friends.</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>2</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepHead}>Friend Joins & Pays</Text>
                    <Text style={styles.stepBody}>They receive an instant promo discount on signup.</Text>
                  </View>
                </View>

                <View style={styles.stepItem}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>3</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stepHead}>Earn Your Points</Text>
                    <Text style={styles.stepBody}>Your points balance is automatically credited.</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 5. Send Personalized Email Invitation */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: '#C2410C' }]}>
                  <Ionicons name="mail" size={18} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Send Personalized Email Invitation</Text>
                  <Text style={styles.cardSubtitle}>
                    We'll dispatch an official email invitation to your friend with your promo code attached.
                  </Text>
                </View>
              </View>

              {inviteFeedback && (
                <View
                  style={[
                    styles.feedbackBanner,
                    inviteFeedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError,
                  ]}
                >
                  <Ionicons
                    name={inviteFeedback.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                    size={16}
                    color={inviteFeedback.type === 'success' ? '#15803D' : '#B91C1C'}
                  />
                  <Text
                    style={[
                      styles.feedbackText,
                      { color: inviteFeedback.type === 'success' ? '#15803D' : '#B91C1C' },
                    ]}
                  >
                    {inviteFeedback.message}
                  </Text>
                </View>
              )}

              <View style={styles.formCol}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Friend's Name</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="e.g. Alex Sharma"
                    placeholderTextColor="#94A3B8"
                    value={inviteName}
                    onChangeText={setInviteName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Friend's Email Address <Text style={{ color: '#EA580C' }}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="friend@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Personal Note (Optional)</Text>
                  <TextInput
                    style={[styles.inputField, { height: 60, textAlignVertical: 'top' }]}
                    multiline
                    value={inviteMessage}
                    onChangeText={setInviteMessage}
                  />
                </View>

                <TouchableOpacity
                  style={styles.sendInviteBtn}
                  onPress={handleSendEmailInvite}
                  disabled={sendingInvite}
                  activeOpacity={0.8}
                >
                  {sendingInvite ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="send" size={14} color="#FFFFFF" />
                      <Text style={styles.sendInviteBtnText}>Send Referral Invitation</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 6. 4 KPI Metrics */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>TOTAL INVITED</Text>
                <Text style={styles.kpiVal}>{stats.totalInvited}</Text>
                <Text style={styles.kpiSub}>Friends signed up or invited</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>PENDING PAYMENTS</Text>
                <Text style={[styles.kpiVal, { color: '#B45309' }]}>{stats.pendingPaymentCount}</Text>
                <Text style={styles.kpiSub}>Awaiting plan purchase</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>SUCCESSFUL REFERRALS</Text>
                <Text style={[styles.kpiVal, { color: '#15803D' }]}>{stats.successfulCount}</Text>
                <Text style={[styles.kpiSub, { color: '#15803D' }]}>Paid members confirmed</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>REWARDS ISSUED</Text>
                <Text style={[styles.kpiVal, { color: '#EA580C' }]}>{wallet.totalEarned} Pts</Text>
                <Text style={[styles.kpiSub, { color: '#EA580C' }]}>Total earned</Text>
              </View>
            </View>

            {/* 7. Referral History & Progress Tracker */}
            <View style={styles.card}>
              <View style={styles.cardHeaderBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>My Referral History & Progress Tracker</Text>
                  <Text style={styles.cardSubtitle}>
                    Track your invitations step-by-step from invitation to verified member reward.
                  </Text>
                </View>
                <View style={styles.badgeOrange}>
                  <Text style={styles.badgeOrangeText}>{referrals.length} Total Invites</Text>
                </View>
              </View>

              {referrals.map((item, idx) => {
                const displayName = item.refereeName || item.referredName || item.inviteeEmail || 'Invited Friend';
                const displayDate = item.registrationDate
                  ? new Date(item.registrationDate).toLocaleDateString()
                  : '10/23/2026';

                return (
                  <View key={item._id || idx} style={styles.inviteItemCard}>
                    <View style={styles.inviteTopRow}>
                      <View style={styles.inviteUserCol}>
                        <View style={styles.avatarCircle}>
                          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.inviteName}>{displayName}</Text>
                            {item.inviteChannel && (
                              <View style={styles.channelPill}>
                                <Text style={styles.channelPillText}>via {item.inviteChannel}</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.inviteDate}>Date: {displayDate}</Text>
                        </View>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.inviteRewardVal}>Reward: +{item.rewardAmount || 500} Points</Text>
                        <Text style={styles.inviteStatusLabel}>
                          Status:{' '}
                          <Text
                            style={{
                              fontWeight: '700',
                              color:
                                item.status === 'Payment Verified'
                                  ? '#15803D'
                                  : item.status === 'Reward Issued'
                                  ? '#EA580C'
                                  : '#B45309',
                            }}
                          >
                            {item.status}
                          </Text>
                        </Text>
                      </View>
                    </View>

                    {/* Stepper with 5 stages */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepperScroll}>
                      <View style={styles.stepperRow}>
                        {['Invited', 'Registered', 'Membership Pending', 'Payment Verified', 'Reward Issued'].map(
                          (stage, sIdx) => {
                            const isComplete =
                              stage === 'Invited' ||
                              (stage === 'Registered' && item.status !== 'Invited') ||
                              (stage === 'Membership Pending' &&
                                ['Membership Pending', 'Payment Verified', 'Reward Pending', 'Reward Issued'].includes(
                                  item.status
                                )) ||
                              (stage === 'Payment Verified' &&
                                ['Payment Verified', 'Reward Pending', 'Reward Issued'].includes(item.status)) ||
                              (stage === 'Reward Issued' && item.status === 'Reward Issued');

                            return (
                              <View key={stage} style={styles.stepperStage}>
                                <View
                                  style={[
                                    styles.stepperCircle,
                                    isComplete ? styles.stepperCircleActive : styles.stepperCircleInactive,
                                  ]}
                                >
                                  {isComplete ? (
                                    <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                                  ) : (
                                    <Text style={styles.stepperNumber}>{sIdx + 1}</Text>
                                  )}
                                </View>
                                <Text
                                  style={[
                                    styles.stepperText,
                                    isComplete && styles.stepperTextActive,
                                  ]}
                                >
                                  {stage}
                                </Text>
                              </View>
                            );
                          }
                        )}
                      </View>
                    </ScrollView>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          /* ========================================================================= */
          /* SUB-TAB 2: POINTS & REDEMPTION                                            */
          /* ========================================================================= */
          <View style={styles.tabContent}>
            {/* 1. Points Hero Banner */}
            <View style={styles.heroCard}>
              <View style={styles.heroTag}>
                <Ionicons name="cash" size={12} color="#EA580C" />
                <Text style={styles.heroTagText}>REFERRAL POINTS BALANCE</Text>
              </View>
              <Text style={styles.heroTitle}>My Referral Points & Redemption</Text>
              <Text style={styles.heroSub}>
                Earned from your referred friends at <Text style={{ fontWeight: '700', color: '#111827' }}>{gymName}</Text>. 
                Redeem directly towards membership renewals, gym store gear, or special training sessions.
              </Text>

              <TouchableOpacity
                style={styles.heroActionBtn}
                onPress={() => {
                  setShowRedeemModal(true);
                  setRedeemModalTab('membership');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="cash-outline" size={16} color="#FFFFFF" />
                <Text style={styles.heroActionBtnText}>Redeem Points Now</Text>
              </TouchableOpacity>
            </View>

            {/* 2. 4 Balance KPI Cards */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <View style={styles.kpiTopIconRow}>
                  <Text style={styles.kpiLabel}>AVAILABLE POINTS</Text>
                  <Ionicons name="cash-outline" size={16} color="#EA580C" />
                </View>
                <Text style={styles.kpiVal}>{wallet.currentBalance.toLocaleString()}</Text>
                <Text style={[styles.kpiSub, { color: '#EA580C', fontWeight: '600' }]}>
                  Supports 5,000+ balances
                </Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={styles.kpiTopIconRow}>
                  <Text style={styles.kpiLabel}>EQUIVALENT VALUE</Text>
                  <Ionicons name="pricetag-outline" size={16} color="#15803D" />
                </View>
                <Text style={[styles.kpiVal, { color: '#15803D' }]}>
                  ₹{equivalentRupeeValue.toLocaleString()}
                </Text>
                <Text style={styles.kpiSub}>
                  Rate: {rewardSettings.pointsPerConversionUnit} pts = ₹{rewardSettings.currencyValuePerUnit}
                </Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={styles.kpiTopIconRow}>
                  <Text style={styles.kpiLabel}>TOTAL EARNED</Text>
                  <Ionicons name="trending-up-outline" size={16} color="#9333EA" />
                </View>
                <Text style={[styles.kpiVal, { color: '#9333EA' }]}>
                  {wallet.totalEarned.toLocaleString()}
                </Text>
                <Text style={styles.kpiSub}>From successful referrals & bonuses</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={styles.kpiTopIconRow}>
                  <Text style={styles.kpiLabel}>TOTAL REDEEMED</Text>
                  <Ionicons name="arrow-down-outline" size={16} color="#B45309" />
                </View>
                <Text style={[styles.kpiVal, { color: '#B45309' }]}>
                  {wallet.totalRedeemed.toLocaleString()}
                </Text>
                <Text style={styles.kpiSub}>Redeemed on plans & gym store</Text>
              </View>
            </View>

            {/* 3. Available Redemption Channels */}
            <View style={styles.card}>
              <View style={styles.cardHeaderBetween}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.cardTitle}>Available Redemption Channels</Text>
                  <Text style={styles.cardSubtitle}>Choose how to use your referral points today.</Text>
                </View>
                <View style={styles.badgeOrange}>
                  <Text style={styles.badgeOrangeText}>Min. 100 pts required</Text>
                </View>
              </View>

              <View style={styles.channelCardsCol}>
                {/* Channel 1 */}
                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={() => {
                    setShowRedeemModal(true);
                    setRedeemModalTab('membership');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.channelTop}>
                    <View style={[styles.channelIconBox, { backgroundColor: '#FFF7ED' }]}>
                      <Ionicons name="card-outline" size={18} color="#EA580C" />
                    </View>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  </View>
                  <Text style={styles.channelTitle}>1. Membership Plan Discount</Text>
                  <Text style={styles.channelDesc}>
                    Apply your points directly during membership renewal or upgrade checkout for instant rupee discounts.
                  </Text>
                  <View style={styles.channelLinkRow}>
                    <Text style={styles.channelLinkText}>Calculate discount</Text>
                    <Ionicons name="chevron-forward" size={14} color="#EA580C" />
                  </View>
                </TouchableOpacity>

                {/* Channel 2 */}
                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={() => {
                    if (onNavigateTab) {
                      onNavigateTab('store');
                    } else {
                      setShowRedeemModal(true);
                      setRedeemModalTab('store');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.channelTop}>
                    <View style={[styles.channelIconBox, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name="bag-handle-outline" size={18} color="#9333EA" />
                    </View>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  </View>
                  <Text style={styles.channelTitle}>2. Gym Store Purchases</Text>
                  <Text style={styles.channelDesc}>
                    Redeem points against protein supplements, gym apparel, and accessories in the official Gym Store.
                  </Text>
                  <View style={styles.channelLinkRow}>
                    <Text style={styles.channelLinkText}>Explore store products</Text>
                    <Ionicons name="chevron-forward" size={14} color="#EA580C" />
                  </View>
                </TouchableOpacity>

                {/* Channel 3 */}
                <TouchableOpacity
                  style={styles.channelCard}
                  onPress={() => {
                    setShowRedeemModal(true);
                    setRedeemModalTab('custom');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.channelTop}>
                    <View style={[styles.channelIconBox, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="trophy-outline" size={18} color="#D97706" />
                    </View>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>3 Available</Text>
                    </View>
                  </View>
                  <Text style={styles.channelTitle}>3. Other Custom Rewards</Text>
                  <Text style={styles.channelDesc}>
                    Claim Personal Training Sessions, workout vouchers, and exclusive gym perks crafted by your gym owner.
                  </Text>
                  <View style={styles.channelLinkRow}>
                    <Text style={styles.channelLinkText}>Browse vouchers</Text>
                    <Ionicons name="chevron-forward" size={14} color="#EA580C" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. How to Use Your Referral Points (7 Steps) */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="help-circle-outline" size={20} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>How to Use Your Referral Points</Text>
                  <Text style={styles.cardSubtitle}>
                    Simple step-by-step instructions and important policy terms for your referral points.
                  </Text>
                </View>
              </View>

              <View style={styles.stepsCol}>
                {[
                  { n: 1, text: 'Earn points when your referred friend completes an eligible membership payment.' },
                  { n: 2, text: 'Open Points & Redemption to check your available points balance and equivalent rupee value.' },
                  { n: 3, text: 'Click Redeem Points and select Membership Plan Discount, Gym Store Purchase, or another available reward.' },
                  { n: 4, text: 'Review the required points, discount value, and eligibility rules before confirming your redemption.' },
                  { n: 5, text: 'Apply your points during eligible checkout or submit your custom reward voucher request.' },
                  { n: 6, text: 'For purchases, points are deducted only after successful payment. For custom rewards, follow confirmation status.' },
                  { n: 7, text: 'Check your Points History and Redemption History below to track every transaction.' },
                ].map((s) => (
                  <View key={s.n} style={styles.policyStep}>
                    <View style={styles.policyNum}>
                      <Text style={styles.policyNumText}>{s.n}</Text>
                    </View>
                    <Text style={styles.policyText}>{s.text}</Text>
                  </View>
                ))}
              </View>

              {/* Gym Notes */}
              <View style={styles.notesBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="alert-circle-outline" size={15} color="#B45309" />
                  <Text style={styles.notesTitle}>IMPORTANT NOTES (CONFIGURED BY {gymName.toUpperCase()})</Text>
                </View>
                <Text style={styles.noteItem}>• The conversion rate is dynamically set: 100 points = ₹50 (₹0.50 per point).</Text>
                <Text style={styles.noteItem}>• Minimum points required for redemption: 100 points.</Text>
                <Text style={styles.noteItem}>• Maximum discount allowed per transaction: ₹1,000.</Text>
                <Text style={styles.noteItem}>• Unused points remain available: No expiry date.</Text>
                <Text style={styles.noteItem}>• Points cannot be transferred to another customer or withdrawn as cash.</Text>
                <Text style={styles.noteItem}>• Failed payments will never permanently deduct points; balance is safely refunded.</Text>
              </View>
            </View>

            {/* 5. Points Transaction History */}
            <View style={styles.card}>
              <View style={styles.cardHeaderBetween}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.cardTitle}>Points Transaction History</Text>
                  <Text style={styles.cardSubtitle}>Complete ledger of earned, redeemed, and adjusted points.</Text>
                </View>
                <View style={styles.badgeGray}>
                  <Text style={styles.badgeGrayText}>{pointsHistory.length} Recorded</Text>
                </View>
              </View>

              {pointsHistory.map((tx, idx) => (
                <View key={tx._id || idx} style={styles.txCard}>
                  <View style={styles.txTop}>
                    <View style={styles.txIconBox}>
                      <Ionicons
                        name={tx.transactionType.includes('EARN') ? 'arrow-up' : 'arrow-down'}
                        size={14}
                        color={tx.transactionType.includes('EARN') ? '#15803D' : '#B45309'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.txReason}>{tx.reason || 'Referral Point Bonus'}</Text>
                      <Text style={styles.txDate}>
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '10/23/2026'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={[
                          styles.txPoints,
                          { color: tx.transactionType.includes('EARN') ? '#15803D' : '#B45309' },
                        ]}
                      >
                        {tx.transactionType.includes('EARN') ? '+' : '-'}
                        {tx.points} Pts
                      </Text>
                      <Text style={styles.txBalance}>Bal: {tx.balanceAfter || 150} Pts</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* MODAL 1: QR CODE DISPLAY MODAL                                            */}
      {/* ========================================================================= */}
      <Modal visible={showQrModal} transparent animationType="fade" onRequestClose={() => setShowQrModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowQrModal(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="qr-code" size={18} color="#EA580C" />
                <Text style={styles.modalTitle}>Referral QR Invite</Text>
              </View>
              <TouchableOpacity onPress={() => setShowQrModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', paddingVertical: 14 }}>
              <ScannableQRCode
                value={shareLink || `http://localhost:5173/register/customer?ref=${referralCode}`}
                size={190}
                showScannerCorners={true}
                showScanBeam={true}
                centerBadgeIcon="gift"
                badgeLabel="READY TO SCAN"
              />

              <View style={styles.qrCodeBadgeContainer}>
                <Text style={styles.qrCodeValue}>{referralCode}</Text>
                <TouchableOpacity onPress={handleCopyCode} style={styles.qrMiniCopyBtn} activeOpacity={0.7}>
                  <Ionicons name={copiedCode ? 'checkmark-circle' : 'copy-outline'} size={14} color="#EA580C" />
                  <Text style={styles.qrMiniCopyText}>{copiedCode ? 'Copied' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.qrDiscountPill}>
                <Ionicons name="sparkles" size={13} color="#16A34A" />
                <Text style={styles.qrDiscountPillText}>Instant ₹200 Referral Discount Applied</Text>
              </View>

              <Text style={styles.qrSubText}>
                Point any phone camera, Google Lens, or QR scanner at this code to automatically open registration and claim the ₹200 reward.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }]}
                onPress={handleCopyCode}
              >
                <Text style={[styles.modalBtnText, { color: '#111827' }]}>Copy Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#C2410C' }]}
                onPress={handleNativeShare}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>Share Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: INTERACTIVE POINTS REDEMPTION CALCULATOR                         */}
      {/* ========================================================================= */}
      <Modal visible={showRedeemModal} transparent animationType="slide" onRequestClose={() => setShowRedeemModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRedeemModal(false)}
        >
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="sparkles" size={18} color="#EA580C" />
                <Text style={styles.modalTitle}>Redeem Referral Points</Text>
              </View>
              <TouchableOpacity onPress={() => setShowRedeemModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Modal Internal Tabs */}
            <View style={styles.modalTabsRow}>
              <TouchableOpacity
                style={[styles.modalTabBtn, redeemModalTab === 'membership' && styles.modalTabBtnActive]}
                onPress={() => setRedeemModalTab('membership')}
              >
                <Text style={[styles.modalTabText, redeemModalTab === 'membership' && styles.modalTabTextActive]}>
                  Plan Discount
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalTabBtn, redeemModalTab === 'store' && styles.modalTabBtnActive]}
                onPress={() => setRedeemModalTab('store')}
              >
                <Text style={[styles.modalTabText, redeemModalTab === 'store' && styles.modalTabTextActive]}>
                  Gym Store
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalTabBtn, redeemModalTab === 'custom' && styles.modalTabBtnActive]}
                onPress={() => setRedeemModalTab('custom')}
              >
                <Text style={[styles.modalTabText, redeemModalTab === 'custom' && styles.modalTabTextActive]}>
                  Custom Perks
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {redeemModalTab === 'membership' && (
                <View style={{ gap: 14, paddingTop: 10 }}>
                  <View style={styles.redeemBalanceBox}>
                    <Text style={styles.redeemBalLabel}>Available Balance</Text>
                    <Text style={styles.redeemBalVal}>{wallet.currentBalance} Pts (₹{equivalentRupeeValue})</Text>
                  </View>

                  <Text style={styles.subLabel}>1. Select Target Membership Plan</Text>
                  <View style={{ gap: 8 }}>
                    {DEFAULT_MEMBERSHIP_PLANS.map((p) => {
                      const isSel = selectedPlan?._id === p._id;
                      return (
                        <TouchableOpacity
                          key={p._id}
                          style={[styles.planSelectCard, isSel && styles.planSelectCardActive]}
                          onPress={() => setSelectedPlan(p)}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.planSelectName, isSel && { color: '#C2410C' }]}>{p.name}</Text>
                            <Text style={styles.planSelectDuration}>{p.duration}</Text>
                          </View>
                          <Text style={styles.planSelectPrice}>₹{p.price.toLocaleString()}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.subLabel}>2. Points to Redeem</Text>
                  <View style={styles.pointsInputRow}>
                    <TextInput
                      style={styles.pointsInputField}
                      keyboardType="numeric"
                      value={String(pointsToRedeem)}
                      onChangeText={(val) => {
                        const n = parseInt(val, 10) || 0;
                        setPointsToRedeem(Math.min(n, wallet.currentBalance));
                      }}
                    />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>Points</Text>
                  </View>

                  {/* Quick Chips */}
                  <View style={styles.chipRow}>
                    {[50, 100, 150].map((pts) => (
                      <TouchableOpacity
                        key={pts}
                        style={[styles.chip, pointsToRedeem === pts && styles.chipActive]}
                        onPress={() => setPointsToRedeem(Math.min(pts, wallet.currentBalance))}
                      >
                        <Text style={[styles.chipText, pointsToRedeem === pts && styles.chipTextActive]}>
                          {pts} Pts
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[styles.chip, pointsToRedeem === wallet.currentBalance && styles.chipActive]}
                      onPress={() => setPointsToRedeem(wallet.currentBalance)}
                    >
                      <Text style={[styles.chipText, pointsToRedeem === wallet.currentBalance && styles.chipTextActive]}>
                        Max
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Live Calculation Card */}
                  <View style={styles.calcCard}>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>Original Plan Price</Text>
                      <Text style={styles.calcVal}>₹{(selectedPlan?.price || 0).toLocaleString()}</Text>
                    </View>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>Points Discount ({pointsToRedeem} Pts)</Text>
                      <Text style={[styles.calcVal, { color: '#15803D' }]}>-₹{discountAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.calcDivider} />
                    <View style={styles.calcRow}>
                      <Text style={[styles.calcLabel, { fontWeight: '800', color: '#111827' }]}>
                        Final Payable Amount
                      </Text>
                      <Text style={[styles.calcVal, { fontWeight: '900', color: '#C2410C', fontSize: 16 }]}>
                        ₹{finalPlanPrice.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.applyCheckoutBtn}
                    onPress={() => {
                      if (wallet.currentBalance < 100) {
                        Alert.alert('Notice', 'Minimum 100 points required to apply membership discount.');
                        return;
                      }
                      Alert.alert(
                        'Discount Applied! 🎉',
                        `₹${discountAmount} discount applied using ${pointsToRedeem} points. Proceeding to checkout.`,
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              setShowRedeemModal(false);
                              if (onNavigateTab) onNavigateTab('membership');
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={styles.applyCheckoutBtnText}>Apply Discount & Proceed to Checkout</Text>
                  </TouchableOpacity>
                </View>
              )}

              {redeemModalTab === 'store' && (
                <View style={{ gap: 14, paddingTop: 14 }}>
                  <View style={styles.redeemBalanceBox}>
                    <Text style={styles.redeemBalLabel}>Available Balance</Text>
                    <Text style={styles.redeemBalVal}>{wallet.currentBalance} Pts (₹{equivalentRupeeValue})</Text>
                  </View>

                  <View style={styles.storePerkCard}>
                    <Ionicons name="cart" size={32} color="#9333EA" />
                    <Text style={styles.storePerkTitle}>Redeem in Official Gym Store</Text>
                    <Text style={styles.storePerkDesc}>
                      Your referral points can be applied directly at the gym reception or store checkout for whey protein, creatine, workout apparel, and gym accessories.
                    </Text>
                    <Text style={styles.storePerkRate}>Conversion: 100 Points = ₹50 instant deduction</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.applyCheckoutBtn, { backgroundColor: '#9333EA' }]}
                    onPress={() => {
                      setShowRedeemModal(false);
                      if (onNavigateTab) onNavigateTab('store');
                    }}
                  >
                    <Text style={styles.applyCheckoutBtnText}>Open Gym Store Catalog</Text>
                  </TouchableOpacity>
                </View>
              )}

              {redeemModalTab === 'custom' && (
                <View style={{ gap: 12, paddingTop: 14 }}>
                  <View style={styles.redeemBalanceBox}>
                    <Text style={styles.redeemBalLabel}>Available Balance</Text>
                    <Text style={styles.redeemBalVal}>{wallet.currentBalance} Pts</Text>
                  </View>

                  {DEFAULT_CUSTOM_REWARDS.map((cr) => (
                    <View key={cr._id} style={styles.customRewardItemCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.customRewardTitle}>{cr.title}</Text>
                        <Text style={styles.customRewardDesc}>{cr.description}</Text>
                        <View style={styles.customRewardPointsPill}>
                          <Ionicons name="cash-outline" size={12} color="#C2410C" />
                          <Text style={styles.customRewardPointsText}>{cr.pointsRequired} Points Required</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.claimBtn}
                        onPress={() => handleClaimReward(cr)}
                      >
                        <Text style={styles.claimBtnText}>Claim</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  subTabBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: '#C2410C',
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  inviteQuickStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
  },
  inviteQuickStripText: {
    fontSize: 12,
    color: '#64748B',
  },
  inviteQuickRedeemBtn: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  inviteQuickRedeemBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 110,
  },
  tabContent: {
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  heroTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 26,
  },
  heroSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 6,
  },
  heroActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    gap: 10,
  },
  cardHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  codeContainer: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  codeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#EA580C',
    marginTop: 2,
  },
  codeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C2410C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  copyCodeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  qrBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  linkRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    gap: 6,
  },
  linkLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  linkInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  copyLinkBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  copyLinkBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  shareChannelsSec: {
    gap: 8,
  },
  shareChannelsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  shareChannelsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  waBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  mailBtn: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  moreBtn: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dualBenefitCol: {
    gap: 10,
  },
  benefitBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  benefitBoxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  benefitBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  benefitVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  benefitDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  secTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  stepsCol: {
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  stepHead: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  stepBody: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  feedbackSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  feedbackText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  formCol: {
    gap: 10,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  inputField: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#111827',
  },
  sendInviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 4,
  },
  sendInviteBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: (SCREEN_WIDTH - 28 - 10) / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  kpiTopIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  kpiVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  kpiSub: {
    fontSize: 10,
    color: '#64748B',
  },
  badgeOrange: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  badgeOrangeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  inviteItemCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  inviteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  inviteUserCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
  },
  inviteName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  channelPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  channelPillText: {
    fontSize: 9,
    color: '#64748B',
  },
  inviteDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  inviteRewardVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  inviteStatusLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  stepperScroll: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepperStage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stepperCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircleActive: {
    backgroundColor: '#C2410C',
  },
  stepperCircleInactive: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperNumber: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  stepperText: {
    fontSize: 10,
    color: '#64748B',
  },
  stepperTextActive: {
    fontWeight: '800',
    color: '#111827',
  },
  channelCardsCol: {
    gap: 10,
  },
  channelCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  channelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  channelTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  channelDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  channelLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  channelLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  policyStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  policyNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  policyNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  policyText: {
    flex: 1,
    fontSize: 11,
    color: '#111827',
    lineHeight: 16,
  },
  notesBox: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 6,
    marginTop: 6,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  noteItem: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 15,
  },
  badgeGray: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  badgeGrayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  txCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  txTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txReason: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  txDate: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  txPoints: {
    fontSize: 12,
    fontWeight: '800',
  },
  txBalance: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  qrBox: {
    padding: 16,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrCodeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  qrMiniCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  qrMiniCopyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  qrDiscountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  qrDiscountPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  qrCodeValue: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: '#EA580C',
    letterSpacing: 1.5,
  },
  qrSubText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
    paddingHorizontal: 14,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  modalTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  modalTabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  modalTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  modalTabTextActive: {
    color: '#C2410C',
  },
  redeemBalanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 10,
    borderRadius: 12,
  },
  redeemBalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  redeemBalVal: {
    fontSize: 12,
    fontWeight: '900',
    color: '#EA580C',
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  planSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  planSelectCardActive: {
    borderColor: '#C2410C',
    backgroundColor: '#FFF7ED',
  },
  planSelectName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  planSelectDuration: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  planSelectPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  pointsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsInputField: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  chipActive: {
    backgroundColor: '#C2410C',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  calcCard: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calcLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  calcDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  applyCheckoutBtn: {
    backgroundColor: '#C2410C',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  applyCheckoutBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  storePerkCard: {
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 16,
    gap: 8,
  },
  storePerkTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9333EA',
  },
  storePerkDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  storePerkRate: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 4,
  },
  customRewardItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  customRewardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  customRewardDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  customRewardPointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  customRewardPointsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  claimBtn: {
    backgroundColor: '#C2410C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  claimBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

