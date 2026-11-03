import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

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

  const menuItems = [
    { key: 'ai-fitness' as MoreItemKey, title: 'AI Fitness Assistant', icon: 'sparkles', badge: 'Smart AI', desc: 'Ask form queries, macros & splits' },
    { key: 'trainer-feedback' as MoreItemKey, title: 'Trainer Feedback', icon: 'chatbox-ellipses-outline', desc: 'Share feedback for Coach Vikram' },
    { key: 'reviews' as MoreItemKey, title: 'Reviews & Ratings', icon: 'star-outline', desc: 'Rate gym amenities & facilities' },
    { key: 'rewards' as MoreItemKey, title: 'My Rewards & Points', icon: 'gift-outline', badge: '450 Pts', desc: 'Redeem passes, store discounts' },
    { key: 'referrals' as MoreItemKey, title: 'Refer & Earn', icon: 'share-social-outline', badge: 'Earn ₹500', desc: 'Invite friends to train together' },
    { key: 'store' as MoreItemKey, title: 'Gym Store', icon: 'cart-outline', desc: 'Supplements, gym apparel & gear' },
    { key: 'messages' as MoreItemKey, title: 'Messages', icon: 'mail-outline', badge: '1 New', desc: 'Chat with trainer & front desk' },
    { key: 'profile' as MoreItemKey, title: 'Profile', icon: 'person-outline', desc: 'Personal metrics & account settings' },
    { key: 'membership' as MoreItemKey, title: 'Membership', icon: 'card-outline', badge: 'Gold Pass', desc: 'Plan details, renewal & perks' },
    { key: 'notifications' as MoreItemKey, title: 'Notifications', icon: 'notifications-outline', badge: '2', desc: 'Check-in alerts & reminders' },
  ];

  /* ---------------- SUB VIEWS ---------------- */

  // 1. AI Fitness Assistant
  const renderAIAssistant = () => {
    const [messages, setMessages] = useState([
      { sender: 'ai', text: 'Hello Naveen! I am your Gymora AI Coach. What fitness, diet, or exercise questions can I assist you with today?' }
    ]);
    const [input, setInput] = useState('');

    const sendMsg = (customText?: string) => {
      const q = customText || input.trim();
      if (!q) return;
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: q },
        { sender: 'ai', text: `Great question regarding "${q}". For your Gold Member Push routine, ensure full range of motion, maintain a 3-second negative eccentric, and ingest 30g protein within 90 minutes post-workout!` }
      ]);
      setInput('');
    };

    return (
      <View style={styles.subContainer}>
        <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
          {messages.map((m, idx) => (
            <View key={idx} style={[styles.chatBubble, m.sender === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
              <Text style={[styles.bubbleText, m.sender === 'user' ? styles.bubbleUserText : styles.bubbleAiText]}>
                {m.text}
              </Text>
            </View>
          ))}
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
    const [submitted, setSubmitted] = useState(false);

    return (
      <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
        <View style={styles.cardBox}>
          <Text style={styles.cardBoxTitle}>Coach Vikram Malhotra</Text>
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
            style={[styles.primaryActionBtn, submitted && { backgroundColor: COLORS.emerald }]}
            onPress={() => setSubmitted(true)}
          >
            <Text style={styles.primaryActionBtnText}>{submitted ? 'Feedback Sent ✓' : 'Submit Feedback'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // 3. Reviews & Ratings
  const renderReviews = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.cardBox}>
        <Text style={styles.cardBoxTitle}>Gymora Flagship Arena Experience</Text>
        <Text style={styles.cardBoxSub}>Overall community rating: 4.9 ★ (320+ verified member reviews)</Text>
        <View style={styles.ratingBreakdown}>
          <View style={styles.ratingRow}><Text style={styles.ratingPart}>Cleanliness & Hygiene</Text><Text style={styles.ratingScore}>5.0 ★</Text></View>
          <View style={styles.ratingRow}><Text style={styles.ratingPart}>Equipment Maintenance</Text><Text style={styles.ratingScore}>4.9 ★</Text></View>
          <View style={styles.ratingRow}><Text style={styles.ratingPart}>Trainer Availability</Text><Text style={styles.ratingScore}>4.8 ★</Text></View>
          <View style={styles.ratingRow}><Text style={styles.ratingPart}>Spa & Sauna Amenities</Text><Text style={styles.ratingScore}>4.9 ★</Text></View>
        </View>
        <TouchableOpacity style={styles.primaryActionBtn}>
          <Text style={styles.primaryActionBtnText}>Write a Google Review (+50 Pts)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // 4. Rewards & Points
  const renderRewards = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.rewardsHeaderCard}>
        <View style={styles.pointsBadge}>
          <Ionicons name="sparkles" size={14} color="#FBBF24" />
          <Text style={styles.pointsBadgeText}>Active Balance</Text>
        </View>
        <Text style={styles.pointsValue}>450 <Text style={styles.pointsSub}>GymPoints</Text></Text>
        <Text style={styles.pointsNote}>Earn 25 points on every gym check-in streak</Text>
      </View>

      <Text style={styles.subSectionTitle}>Redeemable Vouchers</Text>
      {[
        { title: '₹200 Gym Store Discount', cost: '200 Pts', desc: 'Valid on protein & supplements' },
        { title: '1-on-1 PT Session Pass', cost: '350 Pts', desc: 'Complimentary personal training session' },
        { title: 'Gymora Matte Shaker 700ml', cost: '400 Pts', desc: 'BPA-free stainless steel bottle' },
      ].map((v, i) => (
        <View key={i} style={styles.voucherCard}>
          <View style={styles.voucherLeft}>
            <Ionicons name="gift" size={20} color={COLORS.primary} />
            <View>
              <Text style={styles.voucherTitle}>{v.title}</Text>
              <Text style={styles.voucherDesc}>{v.desc}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.redeemBtn}>
            <Text style={styles.redeemBtnText}>{v.cost}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  // 5. Refer & Earn
  const renderReferrals = () => (
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
          <Text style={styles.codeText}>GYMORA-NAVEEN-2026</Text>
          <TouchableOpacity style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={16} color={COLORS.primaryDark} />
            <Text style={styles.copyBtnText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  // 6. Gym Store
  const renderStore = () => {
    const products = [
      { name: '100% Whey Isolate 2kg', brand: 'Optimum Nutrition', price: '₹6,499', rating: '4.9 ★' },
      { name: 'Creapure Micronized Creatine 300g', brand: 'MuscleBlaze', price: '₹1,199', rating: '4.8 ★' },
      { name: 'Heavy Duty Lifting Straps', brand: 'Gymora Pro Gear', price: '₹599', rating: '4.9 ★' },
      { name: 'Electrolyte Energy BCAA 30 Servings', brand: 'Scivation', price: '₹1,899', rating: '4.7 ★' },
    ];

    return (
      <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
        <View style={styles.storeList}>
          {products.map((p, i) => (
            <View key={i} style={styles.productCard}>
              <View style={styles.productThumb}>
                <Ionicons name="cart" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productBrand}>{p.brand}</Text>
                <Text style={styles.productName}>{p.name}</Text>
                <View style={styles.productMeta}>
                  <Text style={styles.productPrice}>{p.price}</Text>
                  <Text style={styles.productRating}>{p.rating}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.buyBtn}>
                <Text style={styles.buyBtnText}>Buy</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // 7. Messages
  const renderMessages = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.msgList}>
        <View style={styles.msgItem}>
          <View style={styles.msgAvatar}>
            <Text style={styles.msgAvatarText}>V</Text>
          </View>
          <View style={styles.msgInfo}>
            <View style={styles.msgTopRow}>
              <Text style={styles.msgSender}>Coach Vikram Malhotra</Text>
              <Text style={styles.msgTime}>05:14 PM</Text>
            </View>
            <Text style={styles.msgPreview}>Naveen, make sure to drink at least 750ml water before the leg session today!</Text>
          </View>
        </View>

        <View style={styles.msgItem}>
          <View style={[styles.msgAvatar, { backgroundColor: COLORS.darkCard }]}>
            <Text style={styles.msgAvatarText}>FD</Text>
          </View>
          <View style={styles.msgInfo}>
            <View style={styles.msgTopRow}>
              <Text style={styles.msgSender}>Front Desk Reception</Text>
              <Text style={styles.msgTime}>Yesterday</Text>
            </View>
            <Text style={styles.msgPreview}>Your locker token 42 has been cleared for today's workout.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // 8. Profile
  const renderProfile = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{user?.avatarLetter || 'M'}</Text>
        </View>
        <Text style={styles.profileName}>{user?.name || 'Customer'}</Text>
        <Text style={styles.profileEmail}>{user?.email || ''}</Text>
        <View style={styles.activePill}>
          <Text style={styles.activePillText}>Active Member • ID: GYM-9921</Text>
        </View>

        <View style={styles.profileDetailsList}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Home Gym</Text>
            <Text style={styles.detailValue}>{user?.gymName || 'Gymora Flagship Arena'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Membership Tier</Text>
            <Text style={styles.detailValue}>Gold Annual Plan</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Personal Coach</Text>
            <Text style={styles.detailValue}>Vikram Malhotra</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Primary Goal</Text>
            <Text style={styles.detailValue}>Hypertrophy & Strength</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.profileLogoutBtn} 
          onPress={() => logout()}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={17} color={COLORS.rose} />
          <Text style={styles.profileLogoutText}>Sign Out from Customer App</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // 9. Membership
  const renderMembership = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.membershipCard}>
        <View style={styles.memCardTop}>
          <View>
            <Text style={styles.memTier}>{user?.subscriptionPlan?.toUpperCase() || 'GOLD ANNUAL PASS'}</Text>
            <Text style={styles.memGym}>{user?.gymName || 'Gymora Flagship Arena'}</Text>
          </View>
          <View style={styles.memStatus}>
            <Text style={styles.memStatusText}>{user?.subscriptionStatus?.toUpperCase() || 'ACTIVE'}</Text>
          </View>
        </View>
        <Text style={styles.memHolder}>{user?.name || 'Customer'}</Text>
        <View style={styles.memCardBottom}>
          <View>
            <Text style={styles.memDateLabel}>Valid Till</Text>
            <Text style={styles.memDateVal}>31 Dec 2026</Text>
          </View>
          <View>
            <Text style={styles.memDateLabel}>Pass ID</Text>
            <Text style={styles.memDateVal}>#GYM-2026-9921</Text>
          </View>
        </View>
      </View>

      <Text style={styles.subSectionTitle}>Included Membership Privileges</Text>
      {[
        'Unlimited access to all Gymora branches nationwide',
        'Complimentary Finnish sauna & steam recovery lounge',
        'Dedicated 1-on-1 certified trainer workout programming',
        'Free smart locker access and towel service',
        '10% member discount on Gymora Nutrition Store',
      ].map((perk, idx) => (
        <View key={idx} style={styles.perkItem}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.emerald} />
          <Text style={styles.perkText}>{perk}</Text>
        </View>
      ))}
    </ScrollView>
  );

  // 10. Notifications
  const renderNotifications = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      {[
        { title: 'Workout Session Today', body: 'Push Day scheduled with Coach Vikram at 06:00 PM', time: '1 hour ago', unread: true },
        { title: 'Hydration Reminder', body: 'You are 1.2L away from your 3.5L daily target', time: '3 hours ago', unread: true },
        { title: 'Gymora Pro Shakers Arrived', body: 'New matte black shaker bottles are now in stock at front desk', time: 'Yesterday', unread: false },
      ].map((n, i) => (
        <View key={i} style={[styles.notifCard, n.unread && styles.notifCardUnread]}>
          <View style={styles.notifIcon}>
            <Ionicons name="notifications" size={16} color={n.unread ? COLORS.primary : COLORS.textMuted} />
          </View>
          <View style={styles.notifInfo}>
            <Text style={styles.notifTitle}>{n.title}</Text>
            <Text style={styles.notifBody}>{n.body}</Text>
            <Text style={styles.notifTime}>{n.time}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  /* ---------------- MAIN MENU RENDER ---------------- */

  if (activeSection !== 'none') {
    const activeItem = menuItems.find(m => m.key === activeSection);
    return (
      <View style={styles.container}>
        {/* Sub Header with Back Button */}
        <View style={styles.subHeader}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => setActiveSection('none')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
            <Text style={styles.backBtnText}>More Menu</Text>
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
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.menuContent}
      showsVerticalScrollIndicator={true}
    >
      {/* Customer Account Summary Header */}
      <View style={styles.customerHeaderCard}>
        <View style={styles.customerAvatar}>
          <Text style={styles.customerAvatarText}>{user?.avatarLetter || 'M'}</Text>
        </View>
        <View style={styles.customerMeta}>
          <Text style={styles.customerName}>{user?.name || 'Customer'}</Text>
          <Text style={styles.customerGym}>{user?.gymName || 'Gymora Flagship Arena'}</Text>
          <View style={styles.membershipBadge}>
            <Ionicons name="shield-checkmark" size={11} color={COLORS.primaryDark} />
            <Text style={styles.membershipBadgeText}>{user?.subscriptionPlan || 'Gold Member'}</Text>
          </View>
        </View>
      </View>

      {/* 10 Requested Items List */}
      <Text style={styles.sectionHeader}>Gymora Member Services</Text>
      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            onPress={() => setActiveSection(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBox}>
                <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDesc}>{item.desc}</Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              {item.badge && (
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  menuContent: { padding: 14, paddingBottom: 36 },
  customerHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  customerMeta: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  customerGym: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  membershipBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.primaryDark },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: COLORS.textDark, marginBottom: 8, marginTop: 4 },
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
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  menuItemDesc: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgePill: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgePillText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },

  /* Sub Header */
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 10,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },
  subHeaderTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, flex: 1, textAlign: 'right' },
  subContainer: { flex: 1 },
  subScroll: { flex: 1 },
  subScrollContent: { padding: 14, paddingBottom: 36 },

  /* Chat styles */
  chatBubble: { padding: 12, borderRadius: 14, marginBottom: 10, maxWidth: '85%' },
  bubbleUser: { backgroundColor: COLORS.primary, alignSelf: 'flex-end' },
  bubbleAi: { backgroundColor: COLORS.white, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.cardBorder },
  bubbleText: { fontSize: 12, lineHeight: 18 },
  bubbleUserText: { color: COLORS.white, fontWeight: '600' },
  bubbleAiText: { color: COLORS.textDark },
  quickPromptsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  promptChip: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  promptChipText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
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
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.textDark,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Card boxes */
  cardBox: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardBoxTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  cardBoxSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, marginBottom: 12 },
  cardBoxTitleCenter: { fontSize: 16, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginTop: 8 },
  cardBoxSubCenter: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 14, lineHeight: 16 },
  starsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  textArea: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: COLORS.textDark,
    textAlignVertical: 'top',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
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
  ratingPart: { fontSize: 12, color: COLORS.textDark, fontWeight: '600' },
  ratingScore: { fontSize: 12, fontWeight: '800', color: COLORS.primaryDark },
  subSectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark, marginVertical: 10 },

  /* Rewards */
  rewardsHeaderCard: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  pointsBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  pointsValue: { fontSize: 28, fontWeight: '900', color: COLORS.white, marginVertical: 6 },
  pointsSub: { fontSize: 14, fontWeight: '600' },
  pointsNote: { fontSize: 11, color: COLORS.primaryLight },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
  },
  voucherLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  voucherTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  voucherDesc: { fontSize: 10, color: COLORS.textMuted },
  redeemBtn: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  redeemBtnText: { fontSize: 11, fontWeight: '800', color: COLORS.primaryDark },

  /* Referrals */
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  codeText: { fontSize: 13, fontWeight: '800', color: COLORS.primaryDark, letterSpacing: 0.5 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },

  /* Store */
  storeList: { gap: 8 },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
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
  productBrand: { fontSize: 9, color: COLORS.textMuted, textTransform: 'uppercase', fontWeight: '700' },
  productName: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  productMeta: { flexDirection: 'row', gap: 8, marginTop: 2 },
  productPrice: { fontSize: 11, fontWeight: '800', color: COLORS.primaryDark },
  productRating: { fontSize: 10, color: COLORS.textMedium },
  buyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  buyBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },

  /* Messages */
  msgList: { gap: 8 },
  msgItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  msgAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  msgInfo: { flex: 1 },
  msgTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgSender: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  msgTime: { fontSize: 9, color: COLORS.textMuted },
  msgPreview: { fontSize: 11, color: COLORS.textMedium, marginTop: 2, lineHeight: 15 },

  /* Profile */
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileAvatarText: { color: COLORS.white, fontSize: 24, fontWeight: '800' },
  profileName: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  profileEmail: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  activePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginVertical: 10,
  },
  activePillText: { fontSize: 10, fontWeight: '700', color: COLORS.emerald },
  profileDetailsList: { width: '100%', borderTopWidth: 1, borderTopColor: COLORS.cardBorder, paddingTop: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  detailLabel: { fontSize: 11, color: COLORS.textMuted },
  detailValue: { fontSize: 11, fontWeight: '700', color: COLORS.textDark },

  /* Membership */
  membershipCard: {
    backgroundColor: COLORS.darkBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  memCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memTier: { fontSize: 14, fontWeight: '800', color: '#FBBF24', letterSpacing: 0.5 },
  memGym: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  memStatus: { backgroundColor: COLORS.emerald, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  memStatusText: { fontSize: 9, fontWeight: '800', color: COLORS.white },
  memHolder: { fontSize: 16, fontWeight: '800', color: COLORS.white, marginVertical: 14 },
  memCardBottom: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.darkCard, paddingTop: 8 },
  memDateLabel: { fontSize: 9, color: COLORS.textMuted },
  memDateVal: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  perkItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  perkText: { fontSize: 11, color: COLORS.textDark, flex: 1 },

  /* Notifications */
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
  notifCardUnread: {
    borderColor: COLORS.primaryBorder,
    backgroundColor: '#FFFAF5',
  },
  notifIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  notifBody: { fontSize: 11, color: COLORS.textMedium, marginTop: 2, lineHeight: 15 },
  notifTime: { fontSize: 9, color: COLORS.textMuted, marginTop: 4 },
  profileLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.roseLight,
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    marginTop: 18,
  },
  profileLogoutText: { fontSize: 12, fontWeight: '800', color: COLORS.rose },
});

