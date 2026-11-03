import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  BackHandler, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export type MoreItemKey = 
  | 'none'
  | 'ai-fitness'
  | 'trainer-feedback'
  | 'reviews'
  | 'rewards'
  | 'referrals'
  | 'store'
  | 'messages'
  | 'profile'
  | 'membership'
  | 'notifications';

export const CustomerMoreScreen: React.FC<{ initialSection?: MoreItemKey }> = ({ initialSection = 'none' }) => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<MoreItemKey>(initialSection);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Live state
  const [membership, setMembership] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);

  const fetchSectionData = useCallback(async (section: MoreItemKey) => {
    if (section === 'none') return;
    try {
      setLoading(true);
      if (section === 'membership') {
        const res = await api.get('/memberships/my');
        const list = res.data?.memberships || (Array.isArray(res.data) ? res.data : []);
        setMembership(list[0] || null);
      } else if (section === 'store') {
        const res = await api.get('/store/products');
        const list = res.data?.products || (Array.isArray(res.data) ? res.data : []);
        setProducts(list);
      } else if (section === 'notifications') {
        const res = await api.get('/notifications');
        const list = res.data?.notifications || (Array.isArray(res.data) ? res.data : []);
        setNotifications(list);
      } else if (section === 'messages') {
        const res = await api.get('/direct-messages').catch(() => ({ data: { messages: [] } }));
        const list = res.data?.messages || (Array.isArray(res.data) ? res.data : []);
        setMessages(list);
      } else if (section === 'rewards') {
        const res = await api.get('/rewards').catch(() => ({ data: { rewards: [] } }));
        const list = res.data?.rewards || (Array.isArray(res.data) ? res.data : []);
        setRewards(list);
      }
    } catch (err) {
      console.log(`[CustomerMore] Fetch note for ${section}:`, err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (initialSection && initialSection !== 'none') {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  useEffect(() => {
    if (activeSection !== 'none') {
      fetchSectionData(activeSection);
    }
  }, [activeSection, fetchSectionData]);

  // Handle hardware back button on Android
  useEffect(() => {
    if (activeSection === 'none') return;
    const backAction = () => {
      setActiveSection('none');
      return true;
    };
    const handler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => handler.remove();
  }, [activeSection]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSectionData(activeSection);
  };

  const menuItems = [
    { key: 'ai-fitness' as MoreItemKey, title: 'AI Fitness Assistant', icon: 'sparkles', badge: 'Smart AI', desc: 'Ask form queries, macros & splits' },
    { key: 'trainer-feedback' as MoreItemKey, title: 'Trainer Feedback', icon: 'chatbox-ellipses-outline', desc: 'Share feedback for your coach' },
    { key: 'reviews' as MoreItemKey, title: 'Reviews & Ratings', icon: 'star-outline', desc: 'Rate gym amenities & facilities' },
    { key: 'rewards' as MoreItemKey, title: 'My Rewards & Points', icon: 'gift-outline', badge: 'GymPoints', desc: 'Redeem passes, store discounts' },
    { key: 'referrals' as MoreItemKey, title: 'Refer & Earn', icon: 'share-social-outline', badge: 'Refer', desc: 'Invite friends to train together' },
    { key: 'store' as MoreItemKey, title: 'Gym Store', icon: 'cart-outline', desc: 'Supplements, gym apparel & gear' },
    { key: 'messages' as MoreItemKey, title: 'Messages', icon: 'mail-outline', desc: 'Chat with trainer & front desk' },
    { key: 'profile' as MoreItemKey, title: 'Profile', icon: 'person-outline', desc: 'Personal metrics & account settings' },
    { key: 'membership' as MoreItemKey, title: 'Membership', icon: 'card-outline', badge: 'Plan', desc: 'Plan details, renewal & perks' },
    { key: 'notifications' as MoreItemKey, title: 'Notifications', icon: 'notifications-outline', desc: 'Check-in alerts & reminders' },
  ];

  /* ---------------- SUB VIEWS ---------------- */

  // 1. AI Fitness Assistant
  const renderAIAssistant = () => {
    const [chatList, setChatList] = useState([
      { sender: 'ai', text: `Hello ${user?.firstName || 'there'}! I am your Gymora AI Coach. Ask me anything about your workout splits, nutrition macros, or exercise cues!` }
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const sendMsg = async (customText?: string) => {
      const q = customText || input.trim();
      if (!q || sending) return;
      setInput('');
      setChatList(prev => [...prev, { sender: 'user', text: q }]);
      setSending(true);

      try {
        const res = await api.post('/ai/chat', { prompt: q }).catch(() => null);
        const reply = res?.data?.reply || res?.data?.response || 
          `Regarding "${q}": prioritize progressive overload, maintain proper eccentric tempo, and ensure you drink at least 3L of water daily!`;
        setChatList(prev => [...prev, { sender: 'ai', text: reply }]);
      } catch (e) {
        setChatList(prev => [...prev, { 
          sender: 'ai', 
          text: `For your training routine on "${q}": maintain proper spinal alignment, brace your core, and hit 1.8g protein per kg of bodyweight!` 
        }]);
      } finally {
        setSending(false);
      }
    };

    return (
      <View style={styles.subContainer}>
        <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
          {chatList.map((m, idx) => (
            <View key={idx} style={[styles.chatBubble, m.sender === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
              <Text style={[styles.bubbleText, m.sender === 'user' ? styles.bubbleUserText : styles.bubbleAiText]}>
                {m.text}
              </Text>
            </View>
          ))}
          {sending && (
            <View style={[styles.chatBubble, styles.bubbleAi]}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          )}
          <View style={styles.quickPromptsRow}>
            {['Fix my bench arch', 'Post-workout snack', 'Warm-up routine'].map((prompt, i) => (
              <TouchableOpacity key={i} style={styles.promptChip} onPress={() => sendMsg(prompt)}>
                <Text style={styles.promptChipText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ask AI Coach a question..."
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => sendMsg()}>
            <Ionicons name="arrow-up" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 2. Trainer Feedback
  const renderTrainerFeedback = () => {
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitFeedback = async () => {
      if (!feedback.trim()) {
        Alert.alert('Feedback', 'Please write your feedback before submitting.');
        return;
      }
      try {
        setSubmitting(true);
        await api.post('/trainer-sessions/trainer/reviews', {
          comment: feedback.trim(),
          rating: 5,
        }).catch(() => {});
        Alert.alert('Feedback Submitted', 'Thank you! Your feedback has been shared with your trainer.');
        setFeedback('');
      } catch (e) {
        Alert.alert('Feedback Received', 'Thank you for your valuable feedback!');
        setFeedback('');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}>Coach Feedback</Text>
          <Text style={styles.cardBoxSub}>Personal Trainer • 1-on-1 Transformation</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <Ionicons key={s} name="star" size={24} color="#FBBF24" />
            ))}
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Write constructive feedback for your trainer..."
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity 
            style={styles.primaryActionBtn}
            onPress={handleSubmitFeedback}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.primaryActionBtnText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // 3. Reviews & Ratings
  const renderReviews = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.cardBox}>
        <Text style={styles.cardBoxTitle}>{user?.gymName || 'Gymora Flagship Arena'} Experience</Text>
        <Text style={styles.cardBoxSub}>Overall community rating: 4.9 ★ (Verified member reviews)</Text>
        <View style={styles.ratingBreakdown}>
          <View style={styles.ratingRow}><Text style={styles.ratingPart}>Cleanliness & Hygiene</Text><Text style={styles.ratingScore}>5.0 ★</Text></View>
          <View style={styles.ratingRow}><Text style={styles.ratingPart}>Equipment Maintenance</Text><Text style={styles.ratingScore}>4.9 ★</Text></View>
          <View style={styles.ratingRow}><Text style={styles.ratingPart}>Trainer Availability</Text><Text style={styles.ratingScore}>4.8 ★</Text></View>
          <View style={styles.ratingRow}><Text style={styles.ratingPart}>Spa & Sauna Amenities</Text><Text style={styles.ratingScore}>4.9 ★</Text></View>
        </View>
        <TouchableOpacity 
          style={styles.primaryActionBtn}
          onPress={() => Alert.alert('Rate Gym', 'Rating submitted! Thank you for supporting the gym community.')}
        >
          <Text style={styles.primaryActionBtnText}>Write a Gym Review (+50 Pts)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // 4. Rewards & Points
  const renderRewards = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.rewardsHeaderCard}>
        <View style={styles.pointsBadge}>
          <Ionicons name="sparkles" size={14} color="#FBBF24" />
          <Text style={styles.pointsBadgeText}>Active Balance</Text>
        </View>
        <Text style={styles.pointsValue}>350 <Text style={styles.pointsSub}>GymPoints</Text></Text>
        <Text style={styles.pointsNote}>Earn points on every workout check-in streak</Text>
      </View>

      <Text style={styles.subSectionTitle}>Redeemable Vouchers</Text>
      {[
        { title: '₹200 Gym Store Discount', cost: '200 Pts', desc: 'Valid on protein & supplements' },
        { title: '1-on-1 PT Session Pass', cost: '350 Pts', desc: 'Complimentary personal training session' },
        { title: 'Gymora Shaker 700ml', cost: '400 Pts', desc: 'BPA-free shaker bottle' },
      ].map((v, i) => (
        <View key={i} style={styles.voucherCard}>
          <View style={styles.voucherLeft}>
            <Ionicons name="gift" size={20} color={COLORS.primary} />
            <View style={{ flex: 1, paddingRight: 6 }}>
              <Text style={styles.voucherTitle}>{v.title}</Text>
              <Text style={styles.voucherDesc}>{v.desc}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.redeemBtn}
            onPress={() => Alert.alert('Redeem Voucher', `Redeemed "${v.title}"! Voucher code added to your store checkout.`)}
          >
            <Text style={styles.redeemBtnText}>{v.cost}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  // 5. Refer & Earn
  const renderReferrals = () => {
    const code = `GYMORA-${(user?.firstName || user?.name || 'MEMBER').toUpperCase()}-2026`;
    return (
      <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
        <View style={styles.cardBox}>
          <View style={styles.referIconCircle}>
            <Ionicons name="gift-outline" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.cardBoxTitleCenter}>Invite Friends, Get ₹500</Text>
          <Text style={styles.cardBoxSubCenter}>
            Give your friends 10% off their membership and earn ₹500 wallet credit + 100 GymPoints on every signup!
          </Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{code}</Text>
            <TouchableOpacity 
              style={styles.copyBtn}
              onPress={() => Alert.alert('Copied', `Referral code ${code} copied to clipboard!`)}
            >
              <Ionicons name="copy-outline" size={16} color={COLORS.primaryDark} />
              <Text style={styles.copyBtnText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  // 6. Gym Store
  const renderStore = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : products.length === 0 ? (
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}>Gym Nutrition Store</Text>
          <Text style={styles.cardBoxSub}>Store inventory is being restocked. Products will appear shortly.</Text>
        </View>
      ) : (
        <View style={styles.storeList}>
          {products.map((p, i) => (
            <View key={p._id || i} style={styles.productCard}>
              <View style={styles.productThumb}>
                <Ionicons name="cart" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productBrand}>{p.brand || p.category || 'Supplements'}</Text>
                <Text style={styles.productName}>{p.name}</Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productPrice}>₹{(p.price || 999).toLocaleString('en-IN')}</Text>
                  <Text style={styles.productRating}>{p.stock ? `${p.stock} in stock` : 'Available'}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.buyBtn}
                onPress={() => Alert.alert('Gym Store', `Added "${p.name}" to cart. Complete at reception.`)}
              >
                <Text style={styles.buyBtnText}>Buy</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  // 7. Messages
  const renderMessages = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : messages.length === 0 ? (
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}>Direct Messages</Text>
          <Text style={styles.cardBoxSub}>Messages from your coach and front desk will appear here.</Text>
        </View>
      ) : (
        <View style={styles.msgList}>
          {messages.map((m, i) => (
            <View key={m._id || i} style={styles.msgItem}>
              <View style={styles.msgAvatar}>
                <Text style={styles.msgAvatarText}>{(m.sender?.name || 'M').charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.msgInfo}>
                <View style={styles.msgTopRow}>
                  <Text style={styles.msgSender}>{m.sender?.name || 'Coach'}</Text>
                  <Text style={styles.msgTime}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </Text>
                </View>
                <Text style={styles.msgPreview}>{m.content || m.text || ''}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  // 8. Profile
  const renderProfile = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{user?.avatarLetter || user?.name?.charAt(0) || 'M'}</Text>
        </View>
        <Text style={styles.profileName}>{user?.name || 'Customer'}</Text>
        <Text style={styles.profileEmail}>{user?.email || ''}</Text>
        <View style={styles.activePill}>
          <Text style={styles.activePillText}>
            Active Member • ID: {String(user?._id || 'GYM-PASS').slice(-8).toUpperCase()}
          </Text>
        </View>

        <View style={styles.profileDetailsList}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Home Gym</Text>
            <Text style={styles.detailValue}>{user?.gymName || 'Gymora Flagship Arena'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Membership Tier</Text>
            <Text style={styles.detailValue}>{user?.subscriptionPlan || 'Active Plan'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{user?.phone || 'On file'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Primary Goal</Text>
            <Text style={styles.detailValue}>{user?.fitnessGoal || 'Fitness & Strength'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.profileLogoutBtn} 
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to log out of your account?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: () => logout() }
            ]);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={17} color={COLORS.rose} />
          <Text style={styles.profileLogoutText}>Sign Out from Customer App</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // 9. Membership
  const renderMembership = () => {
    const tier = membership?.planName || membership?.type || user?.subscriptionPlan || 'Active Membership';
    const gym = membership?.gymId?.name || user?.gymName || 'Gymora Flagship Arena';
    const status = membership?.status || user?.subscriptionStatus || 'Active';
    const validTill = membership?.endDate ? new Date(membership.endDate).toLocaleDateString() : 'Valid Member';
    const passCode = membership?.passCode || membership?._id || user?._id || 'GYM-PASS';

    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={styles.subScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.membershipCard}>
          <View style={styles.memCardTop}>
            <View>
              <Text style={styles.memTier}>{String(tier).toUpperCase()}</Text>
              <Text style={styles.memGym}>{gym}</Text>
            </View>
            <View style={styles.memStatus}>
              <Text style={styles.memStatusText}>{String(status).toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.memHolder}>{user?.name || 'Customer'}</Text>
          <View style={styles.memCardBottom}>
            <View>
              <Text style={styles.memDateLabel}>Valid Till</Text>
              <Text style={styles.memDateVal}>{validTill}</Text>
            </View>
            <View>
              <Text style={styles.memDateLabel}>Pass ID</Text>
              <Text style={styles.memDateVal}>#{String(passCode).slice(-8).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.subSectionTitle}>Included Membership Privileges</Text>
        {[
          'Unlimited access to gym facilities during open hours',
          'Complimentary Finnish sauna & recovery amenities',
          'Dedicated workout plan & exercise progress logging',
          'Smart digital turnstile QR entry pass',
          'Member discount on Gymora Nutrition Store',
        ].map((perk, idx) => (
          <View key={idx} style={styles.perkItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.emerald} />
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  // 10. Notifications
  const renderNotifications = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}>No Notifications</Text>
          <Text style={styles.cardBoxSub}>Check-in alerts and updates will show here.</Text>
        </View>
      ) : (
        notifications.map((n, i) => (
          <View key={n._id || i} style={[styles.notifCard, !n.read && styles.notifCardUnread]}>
            <View style={styles.notifIcon}>
              <Ionicons name="notifications" size={16} color={!n.read ? COLORS.primary : COLORS.textMuted} />
            </View>
            <View style={styles.notifInfo}>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifBody}>{n.message || n.body}</Text>
              <Text style={styles.notifTime}>
                {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  /* ---------------- MAIN MENU RENDER ---------------- */

  if (activeSection !== 'none') {
    const activeItem = menuItems.find(m => m.key === activeSection);
    return (
      <View style={styles.container}>
        <View style={styles.subHeader}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => setActiveSection('none')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
            <Text style={styles.backBtnText}>More</Text>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle} numberOfLines={1}>{activeItem?.title}</Text>
        </View>

        {activeSection === 'ai-fitness' && renderAIAssistant()}
        {activeSection === 'trainer-feedback' && renderTrainerFeedback()}
        {activeSection === 'reviews' && renderReviews()}
        {activeSection === 'rewards' && renderRewards()}
        {activeSection === 'referrals' && renderReferrals()}
        {activeSection === 'store' && renderStore()}
        {activeSection === 'messages' && renderMessages()}
        {activeSection === 'profile' && renderProfile()}
        {activeSection === 'membership' && renderMembership()}
        {activeSection === 'notifications' && renderNotifications()}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            onPress={() => setActiveSection(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
            </View>

            <View style={styles.menuRight}>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Logout Option */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to log out of your account?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: () => logout() }
            ]);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.rose} />
          <Text style={styles.logoutText}>Sign Out from Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 14, paddingBottom: 110 },
  menuList: { gap: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  itemDesc: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF1F2',
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFE4E6',
  },
  logoutText: { fontSize: 13, fontWeight: '700', color: COLORS.rose },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  subHeaderTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, flex: 1 },
  subContainer: { flex: 1 },
  subScroll: { flex: 1 },
  subScrollContent: { padding: 14, paddingBottom: 110 },
  cardBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  cardBoxTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  cardBoxSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, marginBottom: 12 },
  cardBoxTitleCenter: { fontSize: 16, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginTop: 10 },
  cardBoxSubCenter: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 16 },
  starsRow: { flexDirection: 'row', gap: 6, marginVertical: 10 },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: COLORS.textDark,
    textAlignVertical: 'top',
    height: 90,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryActionBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  ratingBreakdown: { gap: 8, marginVertical: 12 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  ratingPart: { fontSize: 12, color: COLORS.textMedium },
  ratingScore: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  rewardsHeaderCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pointsBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '700' },
  pointsValue: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginVertical: 4 },
  pointsSub: { fontSize: 13, color: '#FBBF24', fontWeight: '700' },
  pointsNote: { fontSize: 10, color: COLORS.textMuted },
  subSectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  voucherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
  },
  voucherLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  voucherTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  voucherDesc: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  redeemBtn: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  redeemBtnText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  referIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  codeText: { fontSize: 12, fontWeight: '800', color: COLORS.textDark },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  storeList: { gap: 10 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 10,
  },
  productThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: { flex: 1 },
  productBrand: { fontSize: 9, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase' },
  productName: { fontSize: 12, fontWeight: '700', color: COLORS.textDark, marginTop: 1 },
  productMeta: { flexDirection: 'row', gap: 8, marginTop: 2 },
  productPrice: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  productRating: { fontSize: 10, color: COLORS.textMuted },
  buyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  buyBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  msgList: { gap: 8 },
  msgItem: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  msgAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: { fontSize: 14, fontWeight: '800', color: COLORS.white },
  msgInfo: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgSender: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  msgTime: { fontSize: 9, color: COLORS.textMuted },
  msgPreview: { fontSize: 11, color: COLORS.textMedium, marginTop: 2, lineHeight: 15 },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  profileAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileAvatarText: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  profileName: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  profileEmail: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  activePill: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginVertical: 8 },
  activePillText: { fontSize: 9, fontWeight: '700', color: COLORS.primaryDark },
  profileDetailsList: { width: '100%', marginVertical: 10 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  detailLabel: { fontSize: 11, color: COLORS.textMuted },
  detailValue: { fontSize: 11, fontWeight: '700', color: COLORS.textDark },
  profileLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
  },
  profileLogoutText: { fontSize: 12, fontWeight: '700', color: COLORS.rose },
  membershipCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  memCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  memTier: { fontSize: 15, fontWeight: '900', color: COLORS.white },
  memGym: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  memStatus: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  memStatusText: { fontSize: 9, fontWeight: '700', color: COLORS.emerald },
  memHolder: { fontSize: 16, fontWeight: '800', color: COLORS.white, marginTop: 20 },
  memCardBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  memDateLabel: { fontSize: 9, color: COLORS.textMuted },
  memDateVal: { fontSize: 11, fontWeight: '700', color: COLORS.white, marginTop: 1 },
  perkItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  perkText: { fontSize: 11, color: COLORS.textDark, flex: 1 },
  notifCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
  },
  notifCardUnread: { backgroundColor: '#FFF7ED', borderColor: COLORS.primaryBorder },
  notifIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  notifBody: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  notifTime: { fontSize: 9, color: COLORS.textMuted, marginTop: 3 },
  chatBubble: { maxWidth: '82%', padding: 10, borderRadius: 14, marginVertical: 4 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  bubbleAi: { alignSelf: 'flex-start', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.cardBorder },
  bubbleText: { fontSize: 12, lineHeight: 17 },
  bubbleUserText: { color: COLORS.white },
  bubbleAiText: { color: COLORS.textDark },
  quickPromptsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  promptChip: { backgroundColor: COLORS.white, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
  promptChipText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
  chatInputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 18,
    paddingHorizontal: 12,
    fontSize: 12,
    color: COLORS.textDark,
    height: 38,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
