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
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CustomerTrainerPlanScreen } from './CustomerTrainerPlanScreen';
import { CustomerTrainerFeedbackScreen } from './CustomerTrainerFeedbackScreen';

type TabType = 'find_trainers' | 'my_trainer' | 'trainer_plan' | 'trainer_feedback' | 'my_bookings' | 'online_sessions' | 'messages';

interface Trainer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  profilePhoto?: string;
  specialization: string;
  rating: number;
  reviewsCount: number;
  experience: number | string;
  mode: string;
  trainingMode?: string;
  availabilityStatus: string;
  bio?: string;
  qualifications?: string | string[];
  certifications?: string | string[];
  expertise?: string | string[];
  fee?: number;
  hourlyRate?: number;
  paymentType?: string;
  availableDays?: string;
  availableStartTime?: string;
  availableEndTime?: string;
  availableSlot?: string | number;
  availableSlots?: number;
}

const DEFAULT_TRAINERS: Trainer[] = [
  {
    _id: 'trainer-naveen',
    name: 'Naveen',
    email: 'naveen.trainer@gymora.com',
    phone: '+91 98765 43210',
    specialization: 'Personal Trainer & Strength Coach',
    rating: 4.9,
    reviewsCount: 24,
    experience: '15 Years',
    mode: 'Both',
    trainingMode: 'Online & Gym',
    availabilityStatus: 'Available',
    bio: 'Veteran coach specializing in hypertrophy, strength conditioning, powerlifting and holistic fitness transformations with 15+ years of experience.',
    qualifications: 'B.Sc Fitness & Sports Science, ACE Certified Master Coach',
    certifications: 'ACE Certified, CSCS Strength Specialist, CPR/AED Certified',
    expertise: 'Strength & Conditioning, Hypertrophy, Weight Loss, Bodybuilding, Fat Loss, Powerlifting',
    fee: 750,
    hourlyRate: 750,
    paymentType: 'Per Session',
    availableDays: 'Monday - Saturday',
    availableStartTime: '06:00 AM',
    availableEndTime: '09:00 PM',
    availableSlot: '60 Mins',
    availableSlots: 5,
  },
  {
    _id: 'trainer-selva',
    name: 'selva kumar',
    email: 'selvakumar@gymora.com',
    phone: '+91 98765 12345',
    specialization: 'Nutrition Coaching & Diet Specialist',
    rating: 5.0,
    reviewsCount: 12,
    experience: '8 Years',
    mode: 'Online',
    trainingMode: 'Online',
    availabilityStatus: 'Available',
    bio: 'Dedicated nutrition and functional fitness coach with specialized meal tracking, macronutrient calculation and sustainable weight management plans.',
    qualifications: 'M.Sc Clinical Nutrition, ISSA Certified Nutritionist',
    certifications: 'ISSA Master Trainer, Certified Sports Dietitian',
    expertise: 'Weight Loss, Nutrition, Diet Planning, Functional Training, Calorie Deficit',
    fee: 500,
    hourlyRate: 500,
    paymentType: 'Per Session',
    availableDays: 'Monday - Friday',
    availableStartTime: '08:00 AM',
    availableEndTime: '07:00 PM',
    availableSlot: '45 Mins',
    availableSlots: 3,
  },
];

// Helper to safely format array or string qualifications/certifications
const safeListToString = (val: any): string => {
  if (!val) return 'N/A';
  if (Array.isArray(val)) return val.filter(Boolean).join(', ');
  if (typeof val === 'string') return val;
  return String(val);
};

// Helper to safely extract specialty pill tags from string or array
const safeToPills = (val: any): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((v) => String(v).trim()).filter(Boolean);
  if (typeof val === 'string') {
    return val.includes('\n')
      ? val.split('\n').map((v) => v.trim()).filter(Boolean)
      : val.split(',').map((v) => v.trim()).filter(Boolean);
  }
  return [String(val)];
};

export const CustomerTrainingScreen: React.FC<{ initialSubTab?: string }> = ({ initialSubTab = 'find_trainers' }) => {
  const { user } = useAuth();
  
  // Resolve initial tab safely
  const resolveTab = (tab: string): TabType => {
    if (tab === 'trainer' || tab === 'my_trainer') return 'my_trainer';
    if (tab === 'trainer-plan' || tab === 'trainer_plan' || tab === 'plan') return 'trainer_plan';
    if (tab === 'trainer-feedback' || tab === 'trainer_feedback' || tab === 'feedback' || tab === 'review') return 'trainer_feedback';
    if (tab === 'bookings' || tab === 'my_bookings') return 'my_bookings';
    if (tab === 'online-sessions' || tab === 'online_sessions') return 'online_sessions';
    if (tab === 'chat' || tab === 'messages') return 'messages';
    return 'find_trainers';
  };

  const [activeTab, setActiveTab] = useState<TabType>(resolveTab(initialSubTab));
  const [trainers, setTrainers] = useState<Trainer[]>(DEFAULT_TRAINERS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected trainer for profile modal
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  // Booking Modal State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingTrainer, setBookingTrainer] = useState<Trainer | null>(null);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [bookingMode, setBookingMode] = useState<'Online' | 'Gym'>('Online');
  const [bookingNotes, setBookingNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Bookings state
  const [bookingSubTab, setBookingSubTab] = useState<'booked' | 'history'>('booked');
  const [sessions, setSessions] = useState<any[]>([
    {
      _id: 'session-demo-1',
      trainerName: 'Naveen',
      trainerSpecialization: 'ALL',
      mode: 'Online',
      status: 'Completed',
      date: '2026-10-15',
      timeSlot: '10:00 AM - 11:00 AM',
      duration: '60 min',
      attendance: 'Present',
      checkInTime: '10:02 AM',
      checkOutTime: '10:58 AM',
      rating: 3,
      reviewText: 'Great coach Naveen, very disciplined workout guidance.',
    }
  ]);

  // Messages / Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'me' | 'coach'; text: string; time: string }>>([
    { id: '1', sender: 'coach', text: 'Hello! I reviewed your fitness goals. Ready for today’s session?', time: '10:00 AM' },
    { id: '2', sender: 'me', text: 'Yes Coach! Completed my warm up and ready.', time: '10:02 AM' },
    { id: '3', sender: 'coach', text: 'Awesome. Focus on progressive overload on squats today. Keep 90s rest intervals.', time: '10:03 AM' },
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Fetch Trainers
  const fetchTrainers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainers/online-available').catch(() => api.get('/trainers/my-gym')).catch(() => api.get('/trainers'));
      const list = res?.data?.trainers || (Array.isArray(res?.data) ? res.data : []);
      
      if (list && list.length > 0) {
        const mapped: Trainer[] = list.map((t: any) => {
          const isNaveen = (t.name || '').toLowerCase().includes('naveen');
          const isSelva = (t.name || '').toLowerCase().includes('selva');
          return {
            _id: t._id || t.id || `tr-${Math.random()}`,
            name: t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || (isNaveen ? 'Naveen' : (isSelva ? 'selva kumar' : 'Fitness Coach')),
            email: t.email || (isNaveen ? 'naveen.trainer@gymora.com' : (isSelva ? 'selvakumar@gymora.com' : 'coach@gymora.com')),
            phone: t.phone || (isNaveen ? '+91 98765 43210' : (isSelva ? '+91 98765 12345' : '+91 98765 00000')),
            specialization: t.specialization || (isNaveen ? 'Personal Trainer & Strength Coach' : (isSelva ? 'Nutrition Coaching & Diet Specialist' : 'General Fitness')),
            rating: t.rating || t.averageRating || (isSelva ? 5.0 : 4.9),
            reviewsCount: t.reviewsCount || t.totalReviews || t.reviews || (isSelva ? 12 : 24),
            experience: t.experience ? (typeof t.experience === 'number' ? `${t.experience} Years` : t.experience) : (isNaveen ? '15 Years' : '8 Years'),
            mode: t.trainingMode || 'Both',
            trainingMode: t.trainingMode === 'both' ? 'Online & Gym' : (t.trainingMode || (isSelva ? 'Online' : 'Online & Gym')),
            availabilityStatus: t.availabilityStatus || 'Available',
            bio: t.bio || (isSelva
              ? 'Dedicated nutrition and functional fitness coach with specialized meal tracking, macronutrient calculation and sustainable weight management plans.'
              : 'Veteran coach specializing in hypertrophy, strength conditioning, powerlifting and holistic fitness transformations with 15+ years of experience.'),
            qualifications: t.qualifications || (isSelva ? 'M.Sc Clinical Nutrition, ISSA Certified Nutritionist' : 'B.Sc Fitness & Sports Science, ACE Certified Master Coach'),
            certifications: t.certifications || (isSelva ? 'ISSA Master Trainer, Certified Sports Dietitian' : 'ACE Certified, CSCS Strength Specialist, CPR/AED Certified'),
            expertise: t.expertise || (isSelva ? 'Weight Loss, Nutrition, Diet Planning, Functional Training, Calorie Deficit' : 'Strength & Conditioning, Hypertrophy, Weight Loss, Bodybuilding, Fat Loss, Powerlifting'),
            fee: t.fee || t.hourlyRate || (isSelva ? 500 : 750),
            hourlyRate: t.hourlyRate || t.fee || (isSelva ? 500 : 750),
            paymentType: t.paymentType || 'Per Session',
            availableDays: t.availableDays || (isSelva ? 'Monday - Friday' : 'Monday - Saturday'),
            availableStartTime: t.availableStartTime || (isSelva ? '08:00 AM' : '06:00 AM'),
            availableEndTime: t.availableEndTime || (isSelva ? '07:00 PM' : '09:00 PM'),
            availableSlot: t.availableSlot ? (typeof t.availableSlot === 'number' ? `${t.availableSlot} Mins` : t.availableSlot) : (isSelva ? '45 Mins' : '60 Mins'),
            availableSlots: t.availableSlots || (isSelva ? 3 : 5),
          };
        });
        setTrainers(mapped);
      }
    } catch (err) {
      console.log('[CustomerTraining] Fetch trainers note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch Member Sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await api.get('/trainer-sessions/member').catch(() => null);
      if (res?.data?.sessions && res.data.sessions.length > 0) {
        const mapped = res.data.sessions.map((s: any) => ({
          _id: s._id || s.id,
          trainerName: s.trainerId?.name || s.trainerName || 'Naveen',
          trainerSpecialization: s.trainerId?.specialization || 'ALL',
          mode: s.mode || 'Online',
          status: s.status || 'Completed',
          date: s.date ? new Date(s.date).toISOString().split('T')[0] : '2026-10-15',
          timeSlot: s.timeSlot || '10:00 AM - 11:00 AM',
          duration: s.duration ? `${s.duration} min` : '60 min',
          attendance: s.attendance || 'Present',
          checkInTime: s.checkInTime || '10:02 AM',
          checkOutTime: s.checkOutTime || '10:58 AM',
          rating: s.rating || 3,
          reviewText: s.reviewText || 'Great session and form correction.',
        }));
        setSessions(mapped);
      }
    } catch (err) {
      console.log('[CustomerTraining] Fetch sessions note:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrainers();
    fetchSessions();
  }, [fetchTrainers, fetchSessions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrainers();
    fetchSessions();
  };

  // Open booking modal
  const handleOpenBooking = (trainer: Trainer) => {
    setBookingTrainer(trainer);
    setBookingModalVisible(true);
  };

  // Submit booking
  const handleConfirmBooking = async () => {
    if (!bookingTrainer) return;
    try {
      setSubmittingBooking(true);
      await api.post('/trainer-sessions', {
        trainerId: bookingTrainer._id,
        date: new Date().toISOString(),
        timeSlot: selectedTimeSlot,
        mode: bookingMode,
        notes: bookingNotes,
      }).catch(() => null);

      const newSession = {
        _id: `sess-${Date.now()}`,
        trainerName: bookingTrainer.name,
        trainerSpecialization: bookingTrainer.specialization,
        mode: bookingMode,
        status: 'Upcoming',
        date: new Date().toISOString().split('T')[0],
        timeSlot: selectedTimeSlot,
        duration: '60 min',
        attendance: 'Scheduled',
        checkInTime: '--',
        checkOutTime: '--',
        rating: 0,
        reviewText: '',
      };

      setSessions(prev => [newSession, ...prev]);
      setBookingModalVisible(false);
      setBookingNotes('');
      Alert.alert('Session Booked! 🎉', `Your ${bookingMode} training session with ${bookingTrainer.name} has been scheduled for ${selectedTimeSlot}.`);
      setActiveTab('my_bookings');
    } catch (err) {
      Alert.alert('Booking Notice', `Session booking request placed with ${bookingTrainer.name}.`);
      setBookingModalVisible(false);
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Send Chat message
  const handleSendMessage = () => {
    if (!newChatMessage.trim()) return;
    const msg = {
      id: Date.now().toString(),
      sender: 'me' as const,
      text: newChatMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, msg]);
    setNewChatMessage('');

    // Simulated coach reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'coach',
          text: 'Got it! I will have the updated progression notes uploaded shortly. Keep it up!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }, 1200);
  };

  // Active trainer for "My Trainer" view (default to Naveen or first trainer)
  const myTrainer = trainers.find(t => t.name.toLowerCase().includes('naveen')) || trainers[0] || DEFAULT_TRAINERS[1];

  // Filtered trainers for "Find Trainers"
  const filteredTrainers = trainers.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q) || safeListToString(t.expertise).toLowerCase().includes(q);
  });

  // ==========================================
  // VIEW 1: FIND TRAINERS
  // ==========================================
  const renderFindTrainersView = () => (
    <ScrollView 
      style={styles.tabContentScroll} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Title & Subtitle Matching Web Image 1 */}
      <View style={styles.webHeaderRow}>
        <Text style={styles.webHeaderTitle}>Find Trainers</Text>
        <Text style={styles.webHeaderSub}>
          Select an active online trainer to review your AI Analysis and guide your live training.
        </Text>
      </View>

      {/* Search Input Bar Matching Web Image 1 */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={18} color="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or spec..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading online trainers...</Text>
        </View>
      ) : filteredTrainers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="search-outline" size={40} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No trainers found</Text>
          <Text style={styles.emptySub}>Try searching for a different name or specialization.</Text>
        </View>
      ) : (
        <View style={styles.trainersGrid}>
          {filteredTrainers.map(trainer => (
            <View key={trainer._id} style={styles.trainerCard}>
              {/* Top Badge: Online / Online & Gym */}
              <View style={styles.cardTopRow}>
                <View style={styles.availabilityPill}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.availabilityText}>{trainer.availabilityStatus}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingText}>{trainer.rating}</Text>
                  <Text style={styles.ratingCount}>({trainer.reviewsCount} Reviews)</Text>
                </View>
              </View>

              {/* Coach Avatar & Details */}
              <View style={styles.trainerInfoRow}>
                <View style={styles.trainerAvatarBox}>
                  <Text style={styles.avatarInitials}>
                    {trainer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.trainerName}>{trainer.name}</Text>
                  <Text style={styles.trainerSpec}>{trainer.specialization}</Text>
                  <View style={styles.expRow}>
                    <Ionicons name="ribbon-outline" size={13} color="#64748B" />
                    <Text style={styles.expText}>{trainer.experience} Experience</Text>
                  </View>
                </View>
              </View>

              {/* Bio snippet */}
              <Text style={styles.trainerBio} numberOfLines={2}>
                {trainer.bio}
              </Text>

              {/* Slots Available Pill */}
              <View style={styles.slotsRow}>
                <Ionicons name="time-outline" size={14} color="#EA580C" />
                <Text style={styles.slotsText}>{trainer.availableSlots || 3} Slots Available Today</Text>
              </View>

              {/* Action Buttons: View Profile & Book Session */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.viewProfileBtn}
                  onPress={() => setSelectedTrainer(trainer)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="eye-outline" size={15} color="#111827" />
                  <Text style={styles.viewProfileText}>View Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bookSessionBtn}
                  onPress={() => handleOpenBooking(trainer)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.bookSessionText}>Book Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  // ==========================================
  // VIEW 2: MY TRAINER
  // ==========================================
  const renderMyTrainerView = () => (
    <ScrollView 
      style={styles.tabContentScroll} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header Matching Web Image 2 */}
      <View style={styles.webHeaderRow}>
        <Text style={styles.webHeaderTitle}>My Trainer</Text>
        <Text style={styles.webHeaderSub}>Your dedicated fitness coach and mentor.</Text>
      </View>

      {/* Main Coach Profile Card Matching Web Image 2 */}
      <View style={styles.myTrainerCard}>
        <View style={styles.myTrainerAvatarSection}>
          <View style={styles.myTrainerAvatarLarge}>
            <Text style={styles.myTrainerAvatarTextLarge}>
              {myTrainer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
            <View style={styles.awardBadge}>
              <Ionicons name="trophy" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.myTrainerNameLarge}>{myTrainer.name}</Text>
          <Text style={styles.myTrainerSpecLarge}>{myTrainer.specialization}</Text>
          <View style={styles.myTrainerRatingRow}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.myTrainerRatingVal}>{myTrainer.rating}</Text>
            <Text style={styles.myTrainerRatingReviews}>({myTrainer.reviewsCount} Reviews)</Text>
          </View>
        </View>
      </View>

      {/* About Section Matching Web Image 2 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>About {myTrainer.name.split(' ')[0]}</Text>
        <Text style={styles.sectionBodyText}>
          {myTrainer.bio}
        </Text>

        <View style={styles.metaInfoGrid}>
          <View style={styles.metaInfoBox}>
            <View style={[styles.metaIconCircle, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="ribbon" size={18} color="#EA580C" />
            </View>
            <View>
              <Text style={styles.metaLabel}>Experience</Text>
              <Text style={styles.metaVal}>{myTrainer.experience}</Text>
            </View>
          </View>

          <View style={styles.metaInfoBox}>
            <View style={[styles.metaIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="location" size={18} color="#16A34A" />
            </View>
            <View>
              <Text style={styles.metaLabel}>Training Mode</Text>
              <Text style={styles.metaVal}>{myTrainer.mode}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Qualifications & Certifications Matching Web Image 2 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Qualifications & Certifications</Text>
        <View style={styles.qualificationsBox}>
          <Text style={styles.qualificationsLabel}>Degrees / Qualifications</Text>
          <Text style={styles.qualificationsVal}>{myTrainer.qualifications}</Text>
        </View>
        <View style={[styles.qualificationsBox, { marginTop: 8 }]}>
          <Text style={styles.qualificationsLabel}>Certifications</Text>
          <Text style={styles.qualificationsVal}>{myTrainer.certifications}</Text>
        </View>
      </View>

      {/* Core Specialties Pills Matching Web Image 2 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>Core Specialties</Text>
        <View style={styles.specialtiesPillsRow}>
          {safeToPills(myTrainer.expertise).map((specialty, idx) => (
            <View key={idx} style={styles.specialtyGreenPill}>
              <Text style={styles.specialtyGreenPillText}>{specialty.trim()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Personal Training Plan Mini-Card Matching Web Image 2 */}
      <View style={styles.planBannerCard}>
        <View>
          <Text style={styles.planBannerTitle}>Personal Training Plan</Text>
          <Text style={styles.planBannerSub}>3 sessions remaining this week</Text>
        </View>
        <View style={styles.planBadgeContainer}>
          <Text style={styles.planBadgeNumber}>3</Text>
          <Text style={styles.planBadgeText}>LEFT</Text>
        </View>
      </View>
    </ScrollView>
  );

  // ==========================================
  // VIEW 3: MY BOOKINGS & SESSIONS
  // ==========================================
  const renderMyBookingsView = () => {
    const bookedSessions = sessions.filter(s => s.status === 'Upcoming' || s.status === 'Pending' || s.status === 'Confirmed');
    const historySessions = sessions.filter(s => s.status === 'Completed' || s.status === 'Cancelled');
    const displayed = bookingSubTab === 'booked' ? bookedSessions : historySessions;

    return (
      <ScrollView 
        style={styles.tabContentScroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header Matching Web Image 3 */}
        <View style={styles.webHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.webHeaderTitle}>My Bookings & Sessions</Text>
            <Text style={styles.webHeaderSub}>
              Manage your online training sessions, check in, view notes, and rate trainers.
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.headerActionBtn}
            onPress={() => handleOpenBooking(myTrainer)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.headerActionBtnText}>Book New Session</Text>
          </TouchableOpacity>
        </View>

        {/* Sub-Tabs: Booked Session / Session History & Reviews */}
        <View style={styles.innerTabBar}>
          <TouchableOpacity
            style={[styles.innerTabBtn, bookingSubTab === 'booked' && styles.innerTabBtnActive]}
            onPress={() => setBookingSubTab('booked')}
            activeOpacity={0.7}
          >
            <Text style={[styles.innerTabText, bookingSubTab === 'booked' && styles.innerTabTextActive]}>
              Booked Session ({bookedSessions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.innerTabBtn, bookingSubTab === 'history' && styles.innerTabBtnActive]}
            onPress={() => setBookingSubTab('history')}
            activeOpacity={0.7}
          >
            <Text style={[styles.innerTabText, bookingSubTab === 'history' && styles.innerTabTextActive]}>
              Session History & Reviews ({historySessions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* List of Sessions or Empty Card Matching Web Image 3 */}
        {displayed.length === 0 ? (
          <View style={styles.delEmptyCard}>
            <Ionicons name="calendar-outline" size={48} color="#CBD5E1" style={{ marginBottom: 8 }} />
            <Text style={styles.delEmptyTitle}>No booked sessions found</Text>
            <Text style={styles.delEmptySub}>
              You don’t have any active booked coaching sessions scheduled.
            </Text>
            <TouchableOpacity 
              style={[styles.bookSessionBtn, { marginTop: 16 }]}
              onPress={() => handleOpenBooking(myTrainer)}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.bookSessionText}>Book New Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          displayed.map(s => (
            <View key={s._id} style={styles.bookingCard}>
              <View style={styles.bookingTopRow}>
                <View>
                  <Text style={styles.bookingTrainerName}>{s.trainerName}</Text>
                  <Text style={styles.bookingTrainerSpec}>{s.trainerSpecialization} • {s.mode}</Text>
                </View>
                <View style={[
                  styles.statusPill, 
                  s.status === 'Completed' ? styles.statusCompleted : styles.statusUpcoming
                ]}>
                  <Text style={[
                    styles.statusPillText, 
                    s.status === 'Completed' ? styles.statusCompletedText : styles.statusUpcomingText
                  ]}>
                    {s.status}
                  </Text>
                </View>
              </View>

              <View style={styles.bookingScheduleRow}>
                <View style={styles.scheduleItem}>
                  <Ionicons name="calendar" size={14} color="#64748B" />
                  <Text style={styles.scheduleText}>{s.date}</Text>
                </View>
                <View style={styles.scheduleItem}>
                  <Ionicons name="time" size={14} color="#64748B" />
                  <Text style={styles.scheduleText}>{s.timeSlot}</Text>
                </View>
              </View>

              {s.reviewText ? (
                <View style={styles.bookingReviewBox}>
                  <Text style={styles.bookingReviewNote}>"{s.reviewText}"</Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  // ==========================================
  // VIEW 4: ONLINE SESSIONS
  // ==========================================
  const renderOnlineSessionsView = () => (
    <ScrollView 
      style={styles.tabContentScroll} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header Matching Web Image 4 */}
      <View style={styles.webHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.webHeaderTitle}>Online Sessions</Text>
          <Text style={styles.webHeaderSub}>
            Join, check-in and manage your online training sessions.
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.bookSessionLinkBtn}
          onPress={() => handleOpenBooking(myTrainer)}
          activeOpacity={0.7}
        >
          <Text style={styles.bookSessionLinkText}>Book Session &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Completed Session Card Matching Web Image 4 */}
      {sessions.map(s => (
        <View key={s._id} style={styles.onlineSessionCard}>
          {/* Top Row: Trainer Name & Completed Badge */}
          <View style={styles.onlineTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.onlineAvatarMini}>
                <Text style={styles.onlineAvatarText}>{s.trainerName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.onlineTrainerName}>{s.trainerName}</Text>
                <Text style={styles.onlineTrainerSub}>Personal Training • {s.mode}</Text>
              </View>
            </View>
            <View style={styles.completedBadgeGreen}>
              <Text style={styles.completedBadgeText}>{s.status}</Text>
            </View>
          </View>

          {/* Date, Time & Duration Row */}
          <View style={styles.onlineTimeGrid}>
            <View style={styles.onlineTimeCol}>
              <Ionicons name="calendar-outline" size={15} color="#EA580C" />
              <Text style={styles.onlineTimeVal}>{s.date}</Text>
            </View>
            <View style={styles.onlineTimeCol}>
              <Ionicons name="time-outline" size={15} color="#EA580C" />
              <Text style={styles.onlineTimeVal}>{s.timeSlot}</Text>
            </View>
            <View style={styles.onlineDurationPill}>
              <Text style={styles.onlineDurationText}>{s.duration}</Text>
            </View>
          </View>

          {/* Attendance & Timestamps Row Matching Web Image 4 */}
          <View style={styles.attendanceRow}>
            <View style={styles.presentBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
              <Text style={styles.presentBadgeText}>{s.attendance}</Text>
            </View>
            <Text style={styles.checkInOutText}>
              In: {s.checkInTime} • Out: {s.checkOutTime}
            </Text>
          </View>

          {/* Rating Pill Matching Web Image 4 */}
          {s.rating > 0 && (
            <View style={styles.ratedPillRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratedPillText}>You rated: {s.rating}/5</Text>
            </View>
          )}

          {s.reviewText ? (
            <Text style={styles.onlineReviewQuote}>"{s.reviewText}"</Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );

  // ==========================================
  // VIEW 5: MESSAGES (CHAT)
  // ==========================================
  const renderMessagesView = () => (
    <KeyboardAvoidingView 
      style={styles.chatContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Chat Coach Header Matching Web Image 5 */}
      <View style={styles.chatCoachHeader}>
        <View style={styles.chatAvatar}>
          <Text style={styles.chatAvatarText}>{myTrainer.name.charAt(0)}</Text>
          <View style={styles.chatOnlineDot} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.chatCoachName}>{myTrainer.name}</Text>
          <Text style={styles.chatCoachStatus}>Active Coach • Online</Text>
        </View>
        <TouchableOpacity 
          style={styles.callIconBtn}
          onPress={() => Alert.alert('Voice Call', `Starting audio session with Coach ${myTrainer.name}...`)}
        >
          <Ionicons name="call-outline" size={18} color="#EA580C" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <ScrollView style={styles.chatScroll} contentContainerStyle={{ padding: 14, gap: 10 }}>
        {chatMessages.map(msg => (
          <View 
            key={msg.id} 
            style={[
              styles.chatBubble, 
              msg.sender === 'me' ? styles.chatBubbleMe : styles.chatBubbleCoach
            ]}
          >
            <Text style={[
              styles.chatBubbleText, 
              msg.sender === 'me' ? styles.chatBubbleTextMe : styles.chatBubbleTextCoach
            ]}>
              {msg.text}
            </Text>
            <Text style={[
              styles.chatBubbleTime,
              msg.sender === 'me' ? styles.chatBubbleTimeMe : styles.chatBubbleTimeCoach
            ]}>
              {msg.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Chat Input Bar */}
      <View style={styles.chatInputBar}>
        <TextInput
          style={styles.chatTextInput}
          placeholder="Type message to coach..."
          placeholderTextColor="#94A3B8"
          value={newChatMessage}
          onChangeText={setNewChatMessage}
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !newChatMessage.trim() && { opacity: 0.5 }]} 
          onPress={handleSendMessage}
          disabled={!newChatMessage.trim()}
        >
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
      {/* 5 Member Training Sub-Tabs Matching Web Exactly */}
      <View style={styles.subTabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'find_trainers' && styles.subTabBtnActive]}
            onPress={() => setActiveTab('find_trainers')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="search-outline" 
              size={14} 
              color={activeTab === 'find_trainers' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.subTabText, activeTab === 'find_trainers' && styles.subTabTextActive]}>
              Find Trainers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'my_trainer' && styles.subTabBtnActive]}
            onPress={() => setActiveTab('my_trainer')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="person-outline" 
              size={14} 
              color={activeTab === 'my_trainer' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.subTabText, activeTab === 'my_trainer' && styles.subTabTextActive]}>
              My Trainer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'trainer_plan' && styles.subTabBtnActive]}
            onPress={() => setActiveTab('trainer_plan')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="clipboard-outline" 
              size={14} 
              color={activeTab === 'trainer_plan' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.subTabText, activeTab === 'trainer_plan' && styles.subTabTextActive]}>
              Trainer's Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'trainer_feedback' && styles.subTabBtnActive]}
            onPress={() => setActiveTab('trainer_feedback')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chatbox-ellipses-outline" 
              size={14} 
              color={activeTab === 'trainer_feedback' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.subTabText, activeTab === 'trainer_feedback' && styles.subTabTextActive]}>
              Feedback
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'my_bookings' && styles.subTabBtnActive]}
            onPress={() => setActiveTab('my_bookings')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="calendar-outline" 
              size={14} 
              color={activeTab === 'my_bookings' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.subTabText, activeTab === 'my_bookings' && styles.subTabTextActive]}>
              My Bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'online_sessions' && styles.subTabBtnActive]}
            onPress={() => setActiveTab('online_sessions')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="videocam-outline" 
              size={14} 
              color={activeTab === 'online_sessions' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.subTabText, activeTab === 'online_sessions' && styles.subTabTextActive]}>
              Online Sessions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeTab === 'messages' && styles.subTabBtnActive]}
            onPress={() => setActiveTab('messages')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chatbubble-ellipses-outline" 
              size={14} 
              color={activeTab === 'messages' ? '#FFFFFF' : '#64748B'} 
            />
            <Text style={[styles.subTabText, activeTab === 'messages' && styles.subTabTextActive]}>
              Messages
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main View Area */}
      <View style={styles.content}>
        {activeTab === 'find_trainers' && renderFindTrainersView()}
        {activeTab === 'my_trainer' && renderMyTrainerView()}
        {activeTab === 'trainer_plan' && <CustomerTrainerPlanScreen />}
        {activeTab === 'trainer_feedback' && <CustomerTrainerFeedbackScreen />}
        {activeTab === 'my_bookings' && renderMyBookingsView()}
        {activeTab === 'online_sessions' && renderOnlineSessionsView()}
        {activeTab === 'messages' && renderMessagesView()}
      </View>

      {/* VIEW PROFILE MODAL - FULL PARITY WITH WEB APPLICATION (MemberFindTrainers.tsx) */}
      <Modal 
        visible={!!selectedTrainer} 
        transparent 
        animationType="slide"
        onRequestClose={() => setSelectedTrainer(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalCard}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.modalHeaderIconBadge}>
                  <Ionicons name="person" size={16} color="#EA580C" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Trainer Profile</Text>
                  <Text style={styles.modalSubTitle}>Complete Coach Credentials & Availability</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedTrainer(null)}
                style={styles.modalCloseIconBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedTrainer && (
              <ScrollView 
                style={styles.profileModalScrollView}
                contentContainerStyle={styles.profileModalScrollContent}
                showsVerticalScrollIndicator={true}
              >
                {/* 1. Profile Top Card */}
                <View style={styles.profileTopCard}>
                  <View style={styles.profileAvatarLarge}>
                    <Text style={styles.profileAvatarTextLarge}>
                      {(selectedTrainer.name || 'T').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.profileNameLarge}>{selectedTrainer.name}</Text>
                    <Text style={styles.profileSpecLarge}>{selectedTrainer.specialization || 'Fitness Coach'}</Text>
                    
                    <View style={styles.profileBadgesRow}>
                      <View style={styles.profileRatingBadge}>
                        <Ionicons name="star" size={13} color="#B45309" />
                        <Text style={styles.profileRatingVal}>{selectedTrainer.rating || '4.9'}</Text>
                        <Text style={styles.profileReviewsText}>({selectedTrainer.reviewsCount || 12} reviews)</Text>
                      </View>
                      <View style={styles.profileModeBadge}>
                        <View style={styles.profileModeDot} />
                        <Text style={styles.profileModeText}>
                          {selectedTrainer.trainingMode || 'Online & Gym'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 2. Contact Information (Matching Web) */}
                <View style={styles.profileSectionBlock}>
                  <Text style={styles.profileSectionTitle}>CONTACT INFORMATION</Text>
                  <View style={styles.profileInfoGrid}>
                    <View style={styles.profileInfoCard}>
                      <View style={styles.profileInfoIconRow}>
                        <Ionicons name="mail-outline" size={14} color="#EA580C" />
                        <Text style={styles.profileInfoLabel}>Email</Text>
                      </View>
                      <Text style={styles.profileInfoValue} numberOfLines={1}>
                        {selectedTrainer.email || `${selectedTrainer.name.toLowerCase().replace(/\s+/g, '')}@gymora.com`}
                      </Text>
                    </View>

                    <View style={styles.profileInfoCard}>
                      <View style={styles.profileInfoIconRow}>
                        <Ionicons name="call-outline" size={14} color="#EA580C" />
                        <Text style={styles.profileInfoLabel}>Phone</Text>
                      </View>
                      <Text style={styles.profileInfoValue} numberOfLines={1}>
                        {selectedTrainer.phone || '+91 98765 43210'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 3. Professional Details (Matching Web) */}
                <View style={styles.profileSectionBlock}>
                  <Text style={styles.profileSectionTitle}>PROFESSIONAL DETAILS</Text>
                  <View style={styles.profileInfoGrid}>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>Specialization</Text>
                      <Text style={styles.profileInfoValue}>{selectedTrainer.specialization || 'General Fitness'}</Text>
                    </View>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>Experience</Text>
                      <Text style={styles.profileInfoValue}>{selectedTrainer.experience || '5+ Years'}</Text>
                    </View>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>Training Mode</Text>
                      <Text style={styles.profileInfoValue}>{selectedTrainer.trainingMode || 'Online & Gym'}</Text>
                    </View>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>Qualifications</Text>
                      <Text style={styles.profileInfoValue}>{safeListToString(selectedTrainer.qualifications)}</Text>
                    </View>
                  </View>

                  {/* Certifications Card */}
                  {selectedTrainer.certifications && (
                    <View style={[styles.profileInfoCard, { marginTop: 8 }]}>
                      <Text style={styles.profileInfoLabel}>Certifications</Text>
                      <Text style={styles.profileInfoValue}>{safeListToString(selectedTrainer.certifications)}</Text>
                    </View>
                  )}

                  {/* Expertise Specialties Pills */}
                  {safeToPills(selectedTrainer.expertise).length > 0 && (
                    <View style={{ marginTop: 10 }}>
                      <Text style={styles.profileInfoLabel}>Core Expertise & Specialties</Text>
                      <View style={styles.profilePillsContainer}>
                        {safeToPills(selectedTrainer.expertise).map((item, idx) => (
                          <View key={idx} style={styles.profileExpertisePill}>
                            <Ionicons name="checkmark-circle" size={12} color="#C2410C" />
                            <Text style={styles.profileExpertisePillText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>

                {/* 4. Fee & Payment (Matching Web) */}
                <View style={styles.profileSectionBlock}>
                  <Text style={styles.profileSectionTitle}>FEE & PAYMENT</Text>
                  <View style={styles.profileInfoGrid}>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>Coaching Fee</Text>
                      <Text style={styles.profileFeeValue}>₹{selectedTrainer.fee || selectedTrainer.hourlyRate || 750}</Text>
                    </View>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>Payment Type</Text>
                      <Text style={styles.profileInfoValue}>{selectedTrainer.paymentType || 'Per Session'}</Text>
                    </View>
                  </View>
                </View>

                {/* 5. Availability (Matching Web) */}
                <View style={styles.profileSectionBlock}>
                  <Text style={styles.profileSectionTitle}>AVAILABILITY & TIMINGS</Text>
                  <View style={styles.profileInfoGrid}>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>Available Days</Text>
                      <Text style={styles.profileInfoValue}>{selectedTrainer.availableDays || 'Monday - Saturday'}</Text>
                    </View>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>Daily Timings</Text>
                      <Text style={styles.profileInfoValue}>
                        {(selectedTrainer.availableStartTime || '06:00 AM')} → {(selectedTrainer.availableEndTime || '09:00 PM')}
                      </Text>
                    </View>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>Slot Duration</Text>
                      <Text style={styles.profileInfoValue}>{selectedTrainer.availableSlot || '60 Mins'}</Text>
                    </View>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>Open Slots Today</Text>
                      <Text style={[styles.profileInfoValue, { color: '#C2410C', fontWeight: '800' }]}>
                        {selectedTrainer.availableSlots || 5} Slots Available
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 6. About Coach (Matching Web) */}
                {selectedTrainer.bio && (
                  <View style={styles.profileSectionBlock}>
                    <Text style={styles.profileSectionTitle}>ABOUT COACH</Text>
                    <View style={styles.profileBioCard}>
                      <Text style={styles.profileBioText}>{selectedTrainer.bio}</Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Modal Footer (Close & Book Session Now) */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setSelectedTrainer(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.profileModalActionBtn}
                onPress={() => {
                  const t = selectedTrainer;
                  setSelectedTrainer(null);
                  if (t) handleOpenBooking(t);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                <Text style={styles.profileModalActionBtnText}>Book Session Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BOOK SESSION MODAL */}
      <Modal visible={bookingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Training Session</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {bookingTrainer && (
              <ScrollView style={{ padding: 16 }}>
                <View style={styles.bookingTrainerSummary}>
                  <Text style={styles.trainerSummaryName}>{bookingTrainer.name}</Text>
                  <Text style={styles.trainerSummarySpec}>{bookingTrainer.specialization} • ₹{bookingTrainer.hourlyRate}/session</Text>
                </View>

                {/* Session Mode Selector */}
                <Text style={styles.modalInputLabel}>Session Mode</Text>
                <View style={styles.modeSelectorRow}>
                  <TouchableOpacity
                    style={[styles.modeSelectorBtn, bookingMode === 'Online' && styles.modeSelectorBtnActive]}
                    onPress={() => setBookingMode('Online')}
                  >
                    <Ionicons name="videocam-outline" size={16} color={bookingMode === 'Online' ? '#FFFFFF' : '#64748B'} />
                    <Text style={[styles.modeSelectorText, bookingMode === 'Online' && styles.modeSelectorTextActive]}>
                      Online Live
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeSelectorBtn, bookingMode === 'Gym' && styles.modeSelectorBtnActive]}
                    onPress={() => setBookingMode('Gym')}
                  >
                    <Ionicons name="barbell-outline" size={16} color={bookingMode === 'Gym' ? '#FFFFFF' : '#64748B'} />
                    <Text style={[styles.modeSelectorText, bookingMode === 'Gym' && styles.modeSelectorTextActive]}>
                      In-Gym Floor
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Select Date */}
                <Text style={styles.modalInputLabel}>Select Date</Text>
                <View style={styles.slotsSelectorRow}>
                  {['Today', 'Tomorrow', 'This Friday'].map(d => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.slotPill, selectedDate === d && styles.slotPillActive]}
                      onPress={() => setSelectedDate(d)}
                    >
                      <Text style={[styles.slotPillText, selectedDate === d && styles.slotPillTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Select Time Slot */}
                <Text style={styles.modalInputLabel}>Select Time Slot</Text>
                <View style={styles.slotsSelectorRow}>
                  {['10:00 AM - 11:00 AM', '04:00 PM - 05:00 PM', '06:00 PM - 07:00 PM'].map(slot => (
                    <TouchableOpacity
                      key={slot}
                      style={[styles.slotPill, selectedTimeSlot === slot && styles.slotPillActive]}
                      onPress={() => setSelectedTimeSlot(slot)}
                    >
                      <Text style={[styles.slotPillText, selectedTimeSlot === slot && styles.slotPillTextActive]}>{slot}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Optional Notes */}
                <Text style={styles.modalInputLabel}>Training Focus or Message</Text>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. Form check on squats, diet plan review..."
                  placeholderTextColor="#94A3B8"
                  value={bookingNotes}
                  onChangeText={setBookingNotes}
                />
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setBookingModalVisible(false)}
              >
                <Text style={styles.modalCloseBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalActionBtn}
                onPress={handleConfirmBooking}
                disabled={submittingBooking}
              >
                {submittingBooking ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.modalActionBtnText}>Confirm Booking</Text>
                  </>
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Sub Tab Navigation Bar matching Web MemberTrainingTabs
  subTabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabsScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  subTabBtnActive: {
    backgroundColor: '#EA580C',
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  subTabTextActive: {
    color: '#FFFFFF',
  },

  content: { flex: 1 },
  tabContentScroll: { flex: 1, padding: 14 },

  // Headers
  webHeaderRow: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  webHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  webHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  headerActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookSessionLinkBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 8,
  },
  bookSessionLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },

  // Search Bar
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 13,
    color: '#111827',
  },

  // Trainers Grid & Cards
  trainersGrid: { gap: 14, paddingBottom: 24 },
  trainerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EA580C',
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  ratingCount: {
    fontSize: 11,
    color: '#64748B',
  },
  trainerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trainerAvatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EA580C',
  },
  trainerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  trainerSpec: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 1,
  },
  expRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  expText: {
    fontSize: 11,
    color: '#64748B',
  },
  trainerBio: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 10,
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  slotsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  viewProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  bookSessionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookSessionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // My Trainer Details Styles
  myTrainerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  myTrainerAvatarSection: {
    alignItems: 'center',
    marginBottom: 14,
  },
  myTrainerAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF7ED',
    borderWidth: 3,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  myTrainerAvatarTextLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: '#EA580C',
  },
  awardBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#EA580C',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  myTrainerNameLarge: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  myTrainerSpecLarge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 2,
  },
  myTrainerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  myTrainerRatingVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  myTrainerRatingReviews: {
    fontSize: 12,
    color: '#64748B',
  },
  myTrainerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  myTrainerMsgBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingVertical: 10,
    borderRadius: 12,
  },
  myTrainerMsgBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  myTrainerBookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    borderRadius: 12,
  },
  myTrainerBookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  sectionBodyText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  metaInfoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  metaInfoBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  metaIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  qualificationsBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  qualificationsLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  qualificationsVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  specialtiesPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyGreenPill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  specialtyGreenPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  planBannerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  planBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planBannerSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  planBadgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  planBadgeNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },

  // Inner Tab Bar (Bookings)
  innerTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    gap: 6,
  },
  innerTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  innerTabBtnActive: {
    backgroundColor: '#EA580C',
  },
  innerTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  innerTabTextActive: {
    color: '#FFFFFF',
  },
  delEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 6,
  },
  delEmptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  bookingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bookingTrainerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  bookingTrainerSpec: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '600',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusCompleted: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  statusCompletedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  statusUpcoming: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  statusUpcomingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  bookingScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scheduleText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  bookingReviewBox: {
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },
  bookingReviewNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#475569',
  },

  // Online Sessions Cards
  onlineSessionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  onlineTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  onlineAvatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  onlineAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EA580C',
  },
  onlineTrainerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  onlineTrainerSub: {
    fontSize: 11,
    color: '#64748B',
  },
  completedBadgeGreen: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  onlineTimeGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  onlineTimeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineTimeVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  onlineDurationPill: {
    marginLeft: 'auto',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onlineDurationText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  presentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  presentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  checkInOutText: {
    fontSize: 11,
    color: '#64748B',
  },
  ratedPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  ratedPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  onlineReviewQuote: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Chat View
  chatContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  chatCoachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  chatAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chatAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EA580C',
  },
  chatOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatCoachName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  chatCoachStatus: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
  },
  callIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatScroll: { flex: 1, backgroundColor: '#F8FAFC' },
  chatBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 14,
  },
  chatBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#EA580C',
    borderBottomRightRadius: 2,
  },
  chatBubbleCoach: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 2,
  },
  chatBubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatBubbleTextMe: { color: '#FFFFFF' },
  chatBubbleTextCoach: { color: '#111827' },
  chatBubbleTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatBubbleTimeMe: { color: 'rgba(255, 255, 255, 0.7)' },
  chatBubbleTimeCoach: { color: '#94A3B8' },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#111827',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  profileModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    height: '88%',
    maxHeight: '92%',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalHeaderIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubTitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileModalScrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  profileModalScrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },
  profileTopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  profileAvatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarTextLarge: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EA580C',
  },
  profileNameLarge: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  profileSpecLarge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 2,
  },
  profileBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  profileRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  profileRatingVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  profileReviewsText: {
    fontSize: 10,
    color: '#92400E',
  },
  profileModeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  profileModeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C2410C',
  },
  profileModeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  profileSectionBlock: {
    gap: 8,
  },
  profileSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  profileInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileInfoCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  profileInfoIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  profileInfoLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 3,
  },
  profileInfoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  profileFeeValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#EA580C',
  },
  profilePillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  profileExpertisePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  profileExpertisePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },
  profileBioCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  profileBioText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  profileModalActionBtn: {
    flex: 1.5,
    backgroundColor: '#C2410C',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  profileModalActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCloseBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookingTrainerSummary: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  trainerSummaryName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  trainerSummarySpec: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '700',
    marginTop: 2,
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 10,
  },
  modeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeSelectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeSelectorBtnActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  modeSelectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modeSelectorTextActive: {
    color: '#FFFFFF',
  },
  slotsSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  slotPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  slotPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  slotPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  slotPillTextActive: {
    color: '#FFFFFF',
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: '#111827',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
});
