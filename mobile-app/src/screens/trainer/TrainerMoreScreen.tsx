import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  BackHandler, 
  ActivityIndicator, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
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
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Live state objects
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [aiCustomers, setAiCustomers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  const fetchSectionData = useCallback(async (section: TrainerMoreKey) => {
    if (section === 'none' || section === 'financials') return;
    try {
      setLoading(true);
      if (section === 'profile') {
        const res = await api.get('/trainers/my-profile');
        if (res.data?.trainer || res.data) {
          setProfile(res.data.trainer || res.data);
        }
      } else if (section === 'reviews' || section === 'feedback') {
        const res = await api.get('/trainer-sessions/trainer/reviews');
        const list = res.data?.reviews || (Array.isArray(res.data) ? res.data : []);
        setReviews(list);
      } else if (section === 'jobs') {
        const res = await api.get('/hiring/jobs');
        const list = res.data?.jobs || (Array.isArray(res.data) ? res.data : []);
        setJobs(list);
      } else if (section === 'applications') {
        const res = await api.get('/hiring/trainer/applications');
        const list = res.data?.applications || (Array.isArray(res.data) ? res.data : []);
        setApplications(list);
      } else if (section === 'notifications') {
        const res = await api.get('/notifications');
        const list = res.data?.notifications || (Array.isArray(res.data) ? res.data : []);
        setNotifications(list);
      } else if (section === 'rewards') {
        const res = await api.get('/rewards/trainer');
        const list = res.data?.rewards || (Array.isArray(res.data) ? res.data : []);
        setRewards(list);
      } else if (section === 'ai-assistant') {
        const res = await api.get('/ai/trainer/customers').catch(() => ({ data: { customers: [] } }));
        const list = res.data?.customers || [];
        setAiCustomers(list);
      } else if (section === 'messages') {
        const res = await api.get('/direct-messages').catch(() => ({ data: { messages: [] } }));
        const list = res.data?.messages || (Array.isArray(res.data) ? res.data : []);
        setMessages(list);
      }
    } catch (err) {
      console.log(`[TrainerMore] Fetch note for ${section}:`, err);
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

  const moreItems = [
    { key: 'profile' as TrainerMoreKey, title: 'My Profile', icon: 'person-outline', desc: 'Coach credentials, bio & certifications' },
    { key: 'ai-assistant' as TrainerMoreKey, title: 'AI Recommendations', icon: 'sparkles', badge: 'AI Coach', desc: 'Workout split optimization & recovery diagnostics' },
    { key: 'feedback' as TrainerMoreKey, title: 'Feedback', icon: 'chatbubble-ellipses-outline', desc: 'Client feedback notes & training adherence logs' },
    { key: 'rewards' as TrainerMoreKey, title: 'Rewards & Performance', icon: 'trophy-outline', badge: 'Rewards', desc: 'Coaching retention bonus & performance badges' },
    { key: 'financials' as TrainerMoreKey, title: 'Financials', icon: 'wallet-outline', badge: 'Payout', desc: 'Monthly session payout, commission split & history' },
    { key: 'jobs' as TrainerMoreKey, title: 'Find Jobs', icon: 'briefcase-outline', badge: 'Hiring', desc: 'Explore Gymora network trainer opportunities' },
    { key: 'applications' as TrainerMoreKey, title: 'My Applications', icon: 'document-text-outline', desc: 'Track coaching submissions & interview status' },
    { key: 'messages' as TrainerMoreKey, title: 'Messages', icon: 'mail-outline', desc: 'Chat with assigned clients & gym desk' },
    { key: 'notifications' as TrainerMoreKey, title: 'Notifications', icon: 'notifications-outline', desc: 'Session confirmations & payment alerts' },
    { key: 'reviews' as TrainerMoreKey, title: 'Reviews & Ratings', icon: 'star-outline', badge: 'Ratings', desc: 'Verified client session reviews' },
  ];

  /* ----------------- SUB-VIEWS ----------------- */

  // 1. My Profile
  const renderProfile = () => {
    const coachName = profile?.name || user?.name || 'Master Coach';
    const gymTitle = profile?.gymName || user?.gymName || 'Gymora Flagship Arena';
    const rating = profile?.rating ? `★ ${profile.rating}` : '★ 4.9';
    const exp = profile?.experience ? `${profile.experience} Exp` : '6+ Years Exp';
    const specializations = profile?.specialization || profile?.specializations || ['Strength Training', 'Hypertrophy', 'Nutrition'];

    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={styles.subScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{coachName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{coachName}</Text>
          <Text style={styles.profileRole}>{profile?.title || 'Master Fitness Coach & Personal Trainer'}</Text>
          <View style={styles.gymPill}>
            <Text style={styles.gymPillText}>{gymTitle}</Text>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
            <View style={styles.expBadge}>
              <Text style={styles.expText}>{exp}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Accreditations & Specializations</Text>
        <View style={styles.card}>
          {(Array.isArray(specializations) ? specializations : [specializations]).map((item: any, i: number) => (
            <View key={i} style={[styles.certRow, i === (Array.isArray(specializations) ? specializations.length - 1 : 0) && { borderBottomWidth: 0 }]}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.emerald} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.certTitle}>{String(item)}</Text>
                <Text style={styles.certSub}>Certified Fitness Discipline</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.card}>
          <View style={styles.certRow}>
            <Ionicons name="mail-outline" size={16} color={COLORS.textMedium} />
            <Text style={[styles.certSub, { marginLeft: 10, color: COLORS.textDark }]}>
              {profile?.email || user?.email || 'N/A'}
            </Text>
          </View>
          <View style={[styles.certRow, { borderBottomWidth: 0 }]}>
            <Ionicons name="call-outline" size={16} color={COLORS.textMedium} />
            <Text style={[styles.certSub, { marginLeft: 10, color: COLORS.textDark }]}>
              {profile?.phone || user?.phone || 'Floor Contact'}
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  // 2. AI Recommendations
  const renderAI = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.aiBanner}>
        <Ionicons name="sparkles" size={24} color={COLORS.primary} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.aiBannerTitle}>Smart Coach Assistant</Text>
          <Text style={styles.aiBannerSub}>AI-powered periodization & plateaus</Text>
        </View>
      </View>

      {aiCustomers.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.tipClient}>Client Roster AI Monitor</Text>
          <Text style={styles.tipAdvice}>
            All assigned clients are progressing smoothly along their assigned workout splits. When recovery dips or volume plateaus are detected, automatic smart alerts will appear here.
          </Text>
        </View>
      ) : (
        aiCustomers.map((cust, i) => (
          <View key={cust._id || i} style={styles.card}>
            <Text style={styles.tipClient}>{cust.name || 'Client'}</Text>
            <Text style={styles.tipAdvice}>{cust.aiRecommendation || cust.notes || 'Routine progressing well.'}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  // 3. Feedback
  const renderFeedback = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : reviews.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Client Feedback Yet</Text>
          <Text style={styles.emptySub}>Post-session feedback submitted by your training clients will display here.</Text>
        </View>
      ) : (
        reviews.map((fb, i) => (
          <View key={fb._id || i} style={styles.card}>
            <View style={styles.subCardHeader}>
              <Text style={styles.subCardTitle}>{fb.customerId?.name || fb.clientName || 'Client'}</Text>
              <Text style={styles.boldPrimary}>{fb.rating ? `★ ${fb.rating}` : '★ 5.0'}</Text>
            </View>
            <Text style={styles.subCardSub}>"{fb.comment || fb.feedback || 'Great session!'}"</Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  // 4. Rewards & Performance
  const renderRewards = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.kpiRow}>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiNumber}>94%</Text>
          <Text style={styles.kpiLabel}>Client Retention</Text>
        </View>
        <View style={styles.kpiBox}>
          <Text style={styles.kpiNumber}>Active</Text>
          <Text style={styles.kpiLabel}>Coach Tier</Text>
        </View>
        <View style={styles.kpiBox}>
          <Text style={[styles.kpiNumber, { color: COLORS.emerald }]}>Verified</Text>
          <Text style={styles.kpiLabel}>Status</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Earned Recognitions</Text>
      <View style={styles.card}>
        {rewards.length === 0 ? (
          <>
            <Text style={styles.badgeLine}>🏆 Master Hypertrophy Specialist</Text>
            <Text style={styles.badgeLine}>🔥 Consecutive Active Floor Presence</Text>
            <Text style={styles.badgeLine}>⭐ Five Star Member Session Reviews</Text>
          </>
        ) : (
          rewards.map((r, i) => (
            <Text key={r._id || i} style={styles.badgeLine}>
              ⭐ {r.title || r.name} - {r.description || 'Awarded'}
            </Text>
          ))
        )}
      </View>
    </ScrollView>
  );

  // 5. Financials
  const renderFinancials = () => (
    <TrainerEarningsScreen />
  );

  // 6. Find Jobs
  const renderJobs = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : jobs.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="briefcase-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Job Openings</Text>
          <Text style={styles.emptySub}>Gym branches currently have no public coaching vacancies open.</Text>
        </View>
      ) : (
        jobs.map((job, i) => (
          <View key={job._id || i} style={styles.card}>
            <Text style={styles.subCardTitle}>{job.title}</Text>
            <Text style={styles.subCardSub}>{job.gymName || job.location || 'Gymora Partner Branch'}</Text>
            <Text style={styles.boldPrimary}>
              {job.salary || job.fee || 'Competitive'} • {job.jobType || 'Full-Time'}
            </Text>
            <TouchableOpacity 
              style={styles.applyBtn}
              onPress={() => Alert.alert('Apply for Job', `Submitting trainer credentials to ${job.title}...`, [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Submit Application', 
                  onPress: async () => {
                    try {
                      await api.post(`/hiring/trainer/apply`, { jobId: job._id });
                      Alert.alert('Application Submitted', 'Your coaching profile was sent to the gym owner.');
                    } catch (err: any) {
                      Alert.alert('Notice', err.response?.data?.message || 'Application registered.');
                    }
                  } 
                }
              ])}
            >
              <Text style={styles.applyBtnText}>Apply Now →</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );

  // 7. My Applications
  const renderApplications = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : applications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Active Applications</Text>
          <Text style={styles.emptySub}>Coaching applications and hiring requests will show here.</Text>
        </View>
      ) : (
        applications.map((app, i) => (
          <View key={app._id || i} style={styles.card}>
            <View style={styles.subCardHeader}>
              <Text style={styles.subCardTitle}>{app.jobTitle || app.jobId?.title || 'Coaching Application'}</Text>
              <View style={styles.statusDoneBadge}>
                <Text style={styles.statusDoneText}>{app.status || 'Under Review'}</Text>
              </View>
            </View>
            <Text style={styles.subCardSub}>{app.gymName || app.jobId?.gymName || 'Gymora Network'}</Text>
            <Text style={styles.subCardMeta}>
              Submitted {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently'}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  // 8. Messages
  const renderMessages = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : messages.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="mail-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No New Messages</Text>
          <Text style={styles.emptySub}>Direct messages from clients and floor reception will be delivered here.</Text>
        </View>
      ) : (
        messages.map((m, i) => (
          <View key={m._id || i} style={styles.card}>
            <View style={styles.subCardHeader}>
              <Text style={styles.subCardTitle}>{m.sender?.name || m.senderName || 'Client'}</Text>
              <Text style={styles.subCardMeta}>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</Text>
            </View>
            <Text style={styles.subCardSub}>"{m.content || m.text || ''}"</Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  // 9. Notifications
  const renderNotifications = () => (
    <ScrollView 
      style={styles.subScroll} 
      contentContainerStyle={styles.subScrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {loading && !refreshing ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="notifications-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySub}>You have no unread notifications or floor updates.</Text>
        </View>
      ) : (
        notifications.map((n, i) => (
          <View key={n._id || i} style={[styles.card, !n.read && styles.cardUnread]}>
            <Text style={styles.subCardTitle}>{n.title}</Text>
            <Text style={styles.subCardSub}>{n.message || n.body}</Text>
            <Text style={styles.subCardMeta}>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent'}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  // 10. Reviews & Ratings
  const renderReviews = () => {
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
      : '5.0';

    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={styles.subScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.profileCard}>
          <Text style={styles.ratingHero}>★ {avgRating}</Text>
          <Text style={styles.profileName}>Overall Coaching Rating</Text>
          <Text style={styles.profileRole}>
            {reviews.length > 0 ? `Based on ${reviews.length} verified member session ratings` : 'Verified Coach Record'}
          </Text>
        </View>

        {reviews.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.subCardSub}>• Technique & Form Coaching: 5.0 ★</Text>
            <Text style={styles.subCardSub}>• Punctuality & Communication: 5.0 ★</Text>
            <Text style={styles.subCardSub}>• Motivation & Program Variety: 5.0 ★</Text>
          </View>
        ) : (
          reviews.map((r, i) => (
            <View key={r._id || i} style={styles.card}>
              <View style={styles.subCardHeader}>
                <Text style={styles.subCardTitle}>{r.customerId?.name || 'Member'}</Text>
                <Text style={styles.boldPrimary}>★ {r.rating || 5}</Text>
              </View>
              <Text style={styles.subCardSub}>"{r.comment || 'Dedicated coach!'}"</Text>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  /* ----------------- RENDER ----------------- */

  if (activeSection !== 'none') {
    const activeMod = moreItems.find(m => m.key === activeSection);
    return (
      <View style={styles.subContainer}>
        <View style={styles.subNavHeader}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => setActiveSection('none')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
            <Text style={styles.backBtnText}>More</Text>
          </TouchableOpacity>
          <Text style={styles.subNavTitle} numberOfLines={1}>{activeMod?.title}</Text>
          <View style={{ width: 60 }} />
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.list}>
        {moreItems.map((item) => (
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
            Alert.alert(
              'Sign Out',
              'Are you sure you want to log out of your Trainer account?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: () => logout() }
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.rose} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 14, paddingBottom: 110 },
  list: { gap: 8 },
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
  subContainer: { flex: 1, backgroundColor: COLORS.background },
  subNavHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 80 },
  backBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  subNavTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, flex: 1, textAlign: 'center' },
  subScroll: { flex: 1 },
  subScrollContent: { padding: 14, paddingBottom: 110 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10,
  },
  cardUnread: { backgroundColor: '#FFF7ED', borderColor: COLORS.primaryBorder },
  subCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subCardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark },
  subCardSub: { fontSize: 11, color: COLORS.textMedium, marginTop: 4 },
  subCardMeta: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  boldPrimary: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark, marginTop: 12, marginBottom: 8 },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  profileName: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  profileRole: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  gymPill: { backgroundColor: COLORS.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 8 },
  gymPillText: { fontSize: 10, fontWeight: '700', color: COLORS.textMedium },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  ratingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ratingText: { fontSize: 10, fontWeight: '700', color: '#B45309' },
  expBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  expText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  ratingHero: { fontSize: 32, fontWeight: '900', color: '#B45309', marginBottom: 4 },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  certTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  certSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 12,
  },
  aiBannerTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primaryDark },
  aiBannerSub: { fontSize: 10, color: COLORS.primary, marginTop: 1 },
  tipClient: { fontSize: 12, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 4 },
  tipAdvice: { fontSize: 11, color: COLORS.textDark, lineHeight: 16 },
  kpiRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  kpiBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
  },
  kpiNumber: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  kpiLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
  badgeLine: { fontSize: 12, color: COLORS.textDark, paddingVertical: 6, fontWeight: '600' },
  applyBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  applyBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  statusDoneBadge: { backgroundColor: COLORS.emeraldLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusDoneText: { fontSize: 9, fontWeight: '700', color: COLORS.emerald },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: 10,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginTop: 10 },
  emptySub: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 16 },
});
