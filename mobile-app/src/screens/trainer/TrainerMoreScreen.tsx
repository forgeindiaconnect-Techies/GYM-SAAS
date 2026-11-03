import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { TrainerEarningsScreen } from './TrainerEarningsScreen';

export type TrainerMoreKey = 
  | 'none'
  | 'profile'
  | 'ai-assistant'
  | 'feedback'
  | 'rewards'
  | 'financials'
  | 'jobs'
  | 'applications'
  | 'messages'
  | 'notifications'
  | 'reviews';

export const TrainerMoreScreen: React.FC<{ initialSection?: TrainerMoreKey }> = ({ initialSection = 'none' }) => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<TrainerMoreKey>(initialSection);

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

  const moreItems = [
    { key: 'profile' as TrainerMoreKey, title: 'My Profile', icon: 'person-outline', desc: 'Coach credentials, bio & certifications' },
    { key: 'ai-assistant' as TrainerMoreKey, title: 'AI Recommendations', icon: 'sparkles', badge: 'AI Coach', desc: 'Workout split optimization & recovery diagnostics' },
    { key: 'feedback' as TrainerMoreKey, title: 'Feedback', icon: 'chatbubble-ellipses-outline', desc: 'Client feedback notes & training adherence logs' },
    { key: 'rewards' as TrainerMoreKey, title: 'Rewards & Performance', icon: 'trophy-outline', badge: 'Tier 1', desc: 'Coaching retention bonus & performance badges' },
    { key: 'financials' as TrainerMoreKey, title: 'Financials', icon: 'wallet-outline', badge: '₹64,200', desc: 'Monthly session payout, commission split & history' },
    { key: 'jobs' as TrainerMoreKey, title: 'Find Jobs', icon: 'briefcase-outline', badge: 'New', desc: 'Explore Gymora network trainer opportunities' },
    { key: 'applications' as TrainerMoreKey, title: 'My Applications', icon: 'document-text-outline', desc: 'Track coaching submissions & interview status' },
    { key: 'messages' as TrainerMoreKey, title: 'Messages', icon: 'mail-outline', badge: '2', desc: 'Chat with assigned clients & gym desk' },
    { key: 'notifications' as TrainerMoreKey, title: 'Notifications', icon: 'notifications-outline', badge: '3', desc: 'Session confirmations & payment alerts' },
    { key: 'reviews' as TrainerMoreKey, title: 'Reviews & Ratings', icon: 'star-outline', badge: '★ 4.9', desc: '128 verified client session ratings' },
  ];

  /* ----------------- SUB-VIEWS ----------------- */

  // 1. My Profile
  const renderProfile = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.avatarLetter || 'T'}</Text>
        </View>
        <Text style={styles.profileName}>{user?.name || 'Master Coach'}</Text>
        <Text style={styles.profileRole}>Master Fitness Coach & Dietitian</Text>
        <View style={styles.gymPill}>
          <Text style={styles.gymPillText}>{user?.gymName || 'Gymora Flagship Arena'}</Text>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ 4.9 (128 Reviews)</Text>
          </View>
          <View style={styles.expBadge}>
            <Text style={styles.expText}>6+ Years Exp</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Accreditations & Certificates</Text>
      <View style={styles.card}>
        <View style={styles.certRow}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.emerald} />
          <View style={{ flex: 1 }}>
            <Text style={styles.certTitle}>ACSM Certified Personal Trainer</Text>
            <Text style={styles.certSub}>American College of Sports Medicine</Text>
          </View>
        </View>
        <View style={styles.certRow}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.certTitle}>Precision Nutrition Level 1 (Pn1)</Text>
            <Text style={styles.certSub}>Exercise Nutrition Specialist</Text>
          </View>
        </View>
        <View style={[styles.certRow, { borderBottomWidth: 0 }]}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.blue} />
          <View style={{ flex: 1 }}>
            <Text style={styles.certTitle}>CrossFit Level 2 Coach</Text>
            <Text style={styles.certSub}>Olympic Lifting & Functional Fitness</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // 2. AI Recommendations
  const renderAI = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.aiBanner}>
        <Ionicons name="sparkles" size={24} color={COLORS.primary} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.aiBannerTitle}>Smart Coach Assistant</Text>
          <Text style={styles.aiBannerSub}>AI-powered periodization & plateaus</Text>
        </View>
      </View>

      {[
        { client: 'Naveen Kumar', advice: 'Bench press progression hit 70kg x 10 reps. Suggest advancing to 72.5kg for 4 sets x 8 reps next week.' },
        { client: 'Priya Sharma', advice: 'Hydration adherence is at 82%. Add a 500ml electrolyte cue prior to HIIT session 4.' },
        { client: 'Rahul Varma', advice: 'Reported slight hamstring stiffness. Recommend 10 min dynamic mobility & foam rolling prior to RDLs.' },
      ].map((tip, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.tipClient}>{tip.client}</Text>
          <Text style={styles.tipAdvice}>{tip.advice}</Text>
        </View>
      ))}
    </ScrollView>
  );

  // 3. Feedback
  const renderFeedback = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      {[
        { client: 'Naveen Kumar', rating: '5 ★', comment: 'Coach Vikram’s cues on the bench press completely eliminated my shoulder pain!' },
        { client: 'Priya Sharma', rating: '5 ★', comment: 'Down 4kg in 6 weeks! Nutrition split is easy to stick to.' },
        { client: 'Rahul Varma', rating: '5 ★', comment: 'Best coach on the floor. Strict form focus and intense sessions.' },
      ].map((fb, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.subCardHeader}>
            <Text style={styles.subCardTitle}>{fb.client}</Text>
            <Text style={styles.boldPrimary}>{fb.rating}</Text>
          </View>
          <Text style={styles.subCardSub}>"{fb.comment}"</Text>
        </View>
      ))}
    </ScrollView>
  );

  // 4. Rewards & Performance
  const renderRewards = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.kpiRow}>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiNumber}>94%</Text>
          <Text style={styles.kpiLabel}>Client Retention</Text>
        </View>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiNumber}>48 hrs</Text>
          <Text style={styles.kpiLabel}>Coaching Done</Text>
        </View>
        <View style={styles.kpiBox}>
          <Text style={[styles.kpiNumber, { color: COLORS.emerald }]}>₹8,000</Text>
          <Text style={styles.kpiLabel}>Bonus Earned</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Earned Badges</Text>
      <View style={styles.card}>
        <Text style={styles.badgeLine}>🏆 Master Hypertrophy Specialist - 2026</Text>
        <Text style={styles.badgeLine}>🔥 90+ Consecutive Days Floor Presence</Text>
        <Text style={styles.badgeLine}>⭐ 100+ Five Star Member Reviews</Text>
      </View>
    </ScrollView>
  );

  // 5. Financials
  const renderFinancials = () => (
    <TrainerEarningsScreen />
  );

  // 6. Find Jobs
  const renderJobs = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      {[
        { title: 'Senior Strength & Conditioning Coach', gym: 'Gymora Elite Arena • Whitefield', fee: '₹75,000 - ₹90,000 / mo', type: 'Full-Time' },
        { title: 'Freelance Functional Fitness Trainer', gym: 'Gymora Studio • Koramangala', fee: '₹1,000 / hr session', type: 'Part-Time' },
      ].map((job, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.subCardTitle}>{job.title}</Text>
          <Text style={styles.subCardSub}>{job.gym}</Text>
          <Text style={styles.boldPrimary}>{job.fee} • {job.type}</Text>
          <TouchableOpacity style={styles.applyBtn}>
            <Text style={styles.applyBtnText}>Apply Now →</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  // 7. My Applications
  const renderApplications = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.card}>
        <View style={styles.subCardHeader}>
          <Text style={styles.subCardTitle}>Master Trainer • Flagship Arena</Text>
          <View style={styles.statusDoneBadge}>
            <Text style={styles.statusDoneText}>Active Appointment</Text>
          </View>
        </View>
        <Text style={styles.subCardSub}>Gymora Platinum Arena • Indiranagar</Text>
        <Text style={styles.subCardMeta}>Appointment confirmed on 15 Jan 2026</Text>
      </View>
    </ScrollView>
  );

  // 8. Messages
  const renderMessages = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      {[
        { sender: 'Naveen Kumar', time: '10:15 AM', text: 'Hey Coach, should I take 5g creatine before or after today’s leg session?' },
        { sender: 'Priya Sharma', time: 'Yesterday', text: 'Can we shift tomorrow’s appointment to 11:30 AM?' },
        { sender: 'Front Desk Reception', time: '01 Nov', text: 'New member trial pass assigned to your 4:00 PM slot.' },
      ].map((m, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.subCardHeader}>
            <Text style={styles.subCardTitle}>{m.sender}</Text>
            <Text style={styles.subCardMeta}>{m.time}</Text>
          </View>
          <Text style={styles.subCardSub}>"{m.text}"</Text>
        </View>
      ))}
    </ScrollView>
  );

  // 9. Notifications
  const renderNotifications = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      {[
        { title: 'Session Scheduled: Priya Sharma', time: 'Today at 11:30 AM', unread: true },
        { title: 'Payout Deposit Credited: ₹64,200', time: 'Yesterday to HDFC Bank A/c', unread: false },
        { title: 'New Review Received (5 ★)', time: '02 Nov from Naveen Kumar', unread: false },
      ].map((n, i) => (
        <View key={i} style={[styles.card, n.unread && styles.cardUnread]}>
          <Text style={styles.subCardTitle}>{n.title}</Text>
          <Text style={styles.subCardMeta}>{n.time}</Text>
        </View>
      ))}
    </ScrollView>
  );

  // 10. Reviews & Ratings
  const renderReviews = () => (
    <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
      <View style={styles.profileCard}>
        <Text style={styles.ratingHero}>★ 4.9</Text>
        <Text style={styles.profileName}>Overall Coaching Rating</Text>
        <Text style={styles.profileRole}>Based on 128 verified member sessions</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.subCardSub}>• Technique & Form Coaching: 5.0 ★</Text>
        <Text style={styles.subCardSub}>• Punctuality & Communication: 4.9 ★</Text>
        <Text style={styles.subCardSub}>• Motivation & Program Variety: 4.9 ★</Text>
      </View>
    </ScrollView>
  );

  /* ----------------- MAIN MORE MENU ----------------- */

  if (activeSection !== 'none') {
    const activeItem = moreItems.find(m => m.key === activeSection);
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

        {activeSection === 'profile' && renderProfile()}
        {activeSection === 'ai-assistant' && renderAI()}
        {activeSection === 'feedback' && renderFeedback()}
        {activeSection === 'rewards' && renderRewards()}
        {activeSection === 'financials' && renderFinancials()}
        {activeSection === 'jobs' && renderJobs()}
        {activeSection === 'applications' && renderApplications()}
        {activeSection === 'messages' && renderMessages()}
        {activeSection === 'notifications' && renderNotifications()}
        {activeSection === 'reviews' && renderReviews()}
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.menuContent}
      showsVerticalScrollIndicator={true}
    >
      {/* Coach Account Card */}
      <View style={styles.accountCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.avatarLetter || 'T'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.coachName}>{user?.name || 'Master Coach'}</Text>
          <Text style={styles.coachGym}>{user?.gymName || 'Gymora Flagship Arena'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={11} color={COLORS.primaryDark} />
            <Text style={styles.roleBadgeText}>Master Coach • Certified</Text>
          </View>
        </View>
      </View>

      {/* 10 Items List */}
      <Text style={styles.sectionHeader}>Trainer Portal Services</Text>
      <View style={styles.menuList}>
        {moreItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            onPress={() => setActiveSection(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconBox}>
                <Ionicons name={item.icon as any} size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
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

      {/* Working Logout Button */}
      <TouchableOpacity 
        style={styles.logoutBtn}
        onPress={() => {
          Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out of your Trainer account?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: () => logout() }
            ]
          );
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={18} color={COLORS.rose} />
        <Text style={styles.logoutBtnText}>Sign Out from Trainer App</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  menuContent: { padding: 14, paddingBottom: 110 },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  coachName: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  coachGym: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  roleBadge: {
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
  roleBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.primaryDark },
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
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  itemDesc: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.roseLight,
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  logoutBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.rose },

  /* Sub Header */
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 10,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },
  subHeaderTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, flex: 1, textAlign: 'right' },
  subScroll: { flex: 1 },
  subScrollContent: { padding: 14, paddingBottom: 100 },

  /* Cards */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
  },
  cardUnread: {
    backgroundColor: '#FFFAF5',
    borderColor: COLORS.primaryBorder,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
  },
  profileName: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginTop: 8 },
  profileRole: { fontSize: 12, color: COLORS.textMedium, marginTop: 2 },
  gymPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  gymPillText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  ratingBadge: { backgroundColor: COLORS.amberLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 10, fontWeight: '700', color: COLORS.amber },
  expBadge: { backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  expText: { fontSize: 10, fontWeight: '600', color: COLORS.textMedium },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  certTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  certSub: { fontSize: 10, color: COLORS.textMuted },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  aiBannerTitle: { fontSize: 13, fontWeight: '800', color: COLORS.primaryDark },
  aiBannerSub: { fontSize: 10, color: COLORS.textMedium },
  tipClient: { fontSize: 13, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 },
  tipAdvice: { fontSize: 11, color: COLORS.textMedium, lineHeight: 16 },
  subCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subCardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark },
  subCardSub: { fontSize: 11, color: COLORS.textMedium, marginTop: 2 },
  subCardMeta: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  boldPrimary: { fontSize: 11, fontWeight: '800', color: COLORS.primaryDark, marginTop: 4 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpiBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  kpiNumber: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  kpiLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  badgeLine: { fontSize: 12, fontWeight: '600', color: COLORS.textDark, paddingVertical: 4 },
  applyBtn: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  applyBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  statusDoneBadge: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusDoneText: { fontSize: 9, fontWeight: '700', color: COLORS.emerald },
  ratingHero: { fontSize: 32, fontWeight: '900', color: COLORS.amber, marginBottom: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark, marginVertical: 8 },
});

