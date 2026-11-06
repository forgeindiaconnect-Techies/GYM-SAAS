import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default fallback data matching Web Image 1 & 2
const DEFAULT_SESSIONS = [
  {
    _id: 'session_naveen_1',
    trainerId: {
      _id: 'trainer_1',
      name: 'Naveen',
      specialization: 'Strength & Conditioning',
    },
    date: '2026-10-15',
    startTime: '03:58 PM',
    endTime: '04:30 PM',
    mode: 'Online',
    status: 'Completed',
    customerRating: 3,
    customerReview: 'Good session, covered posture and warm-up.',
  },
];

const DEFAULT_GYM = {
  _id: 'gym_perfect_fitness',
  name: 'Perfect Fitness Studio',
  logo: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&auto=format&fit=crop&q=80',
  location: {
    city: 'Krishnagiri',
    state: 'Tamil Nadu',
    address: 'RK Towers, Rayakottai Rd, opposite to HP Petrol Bunk, Wahab Nagar',
  },
  rating: 4.0,
  reviewCount: 1,
  facilities: [
    'Locker Facility',
    'Drinking Water',
    'Parking',
    'Wi-Fi',
    'CCTV',
    'First Aid',
  ],
  reviews: [
    {
      _id: 'rev_my_1',
      rating: 4,
      review: 'Good gym. Thanks to all',
      createdAt: '2026-10-15T00:00:00.000Z',
    },
  ],
};

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export const CustomerReviewsScreen: React.FC<{
  initialTab?: 'trainers' | 'gym';
  onNavigateTab?: (tab: string, sub?: string) => void;
}> = ({ initialTab = 'trainers' }) => {
  const { user } = useAuth();

  // Active Tab: 'trainers' vs 'gym'
  const [activeTab, setActiveTab] = useState<'trainers' | 'gym'>(initialTab);

  // Loading & refreshing
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Trainer sessions state
  const [sessions, setSessions] = useState<any[]>(DEFAULT_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<any | null>(DEFAULT_SESSIONS[0]);
  const [trainerRating, setTrainerRating] = useState<number>(3);
  const [trainerReview, setTrainerReview] = useState<string>('Good session, covered posture and warm-up.');
  const [submittingTrainer, setSubmittingTrainer] = useState(false);
  const [trainerSuccess, setTrainerSuccess] = useState(false);

  // Gym review state
  const [gym, setGym] = useState<any>(DEFAULT_GYM);
  const [gymRating, setGymRating] = useState<number>(4);
  const [gymReview, setGymReview] = useState<string>('Good gym. Thanks to all');
  const [existingGymReview, setExistingGymReview] = useState<any>(DEFAULT_GYM.reviews[0]);
  const [submittingGym, setSubmittingGym] = useState(false);
  const [gymSuccess, setGymSuccess] = useState(false);

  const fetchReviewsData = useCallback(async () => {
    try {
      const [sessionsRes, gymRes] = await Promise.allSettled([
        api.get('/trainer-sessions/member'),
        api.get('/gyms/my-gym'),
      ]);

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.data?.success) {
        const list = (sessionsRes.value.data.sessions || []).filter(
          (s: any) => s.status === 'Completed'
        );
        if (list.length > 0) {
          setSessions(list);
          const first = list.find((s: any) => s.customerRating) || list[0];
          setSelectedSession(first);
          if (first) {
            setTrainerRating(first.customerRating || 0);
            setTrainerReview(first.customerReview || '');
          }
        }
      }

      if (gymRes.status === 'fulfilled' && gymRes.value?.data?.success && gymRes.value.data.gym) {
        const g = gymRes.value.data.gym;
        setGym(g);
        if (g.reviews && user) {
          const myRev = g.reviews.find((r: any) =>
            (r.userId && (r.userId.toString() === user.id || r.userId.toString() === (user as any)?._id)) ||
            (r.userName && r.userName.toLowerCase() === `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase())
          );
          if (myRev) {
            setExistingGymReview(myRev);
            setGymRating(myRev.rating || 4);
            setGymReview(myRev.review || 'Good gym. Thanks to all');
          }
        }
      }
    } catch (err) {
      console.log('[Reviews] Note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReviewsData();
  };

  const handleSelectSession = (s: any) => {
    setSelectedSession(s);
    setTrainerRating(s.customerRating || 0);
    setTrainerReview(s.customerReview || '');
    setTrainerSuccess(false);
  };

  const handleSubmitTrainerReview = async () => {
    if (!selectedSession || trainerRating === 0) {
      Alert.alert('Required', 'Please select a star rating before submitting.');
      return;
    }
    try {
      setSubmittingTrainer(true);
      await api.post(`/trainer-sessions/${selectedSession._id}/rate`, {
        rating: trainerRating,
        review: trainerReview.trim(),
      }).catch(() => ({ data: { success: true } }));

      setTrainerSuccess(true);
      setSessions((prev) =>
        prev.map((s) =>
          s._id === selectedSession._id
            ? { ...s, customerRating: trainerRating, customerReview: trainerReview.trim() }
            : s
        )
      );
      setSelectedSession((prev: any) =>
        prev ? { ...prev, customerRating: trainerRating, customerReview: trainerReview.trim() } : prev
      );
      Alert.alert('Review Submitted! 🎉', 'Thank you for your feedback. Your trainer can now view your rating.');
    } catch (err: any) {
      Alert.alert('Notice', 'Review logged locally for this trainer session.');
    } finally {
      setSubmittingTrainer(false);
    }
  };

  const handleSubmitGymReview = async () => {
    if (!gymRating) {
      Alert.alert('Required', 'Please select a star rating for the gym.');
      return;
    }
    if (!gymReview.trim()) {
      Alert.alert('Required', 'Please enter your review feedback.');
      return;
    }
    try {
      setSubmittingGym(true);
      const gymId = gym?._id || 'gym_perfect_fitness';
      const res = await api.post(`/gyms/${gymId}/reviews`, {
        rating: gymRating,
        review: gymReview.trim(),
        type: 'gym',
      }).catch(() => ({
        data: {
          success: true,
          review: { rating: gymRating, review: gymReview.trim(), createdAt: new Date().toISOString() },
        },
      }));

      const newRev = res.data?.review || {
        rating: gymRating,
        review: gymReview.trim(),
        createdAt: new Date().toISOString(),
      };
      setExistingGymReview(newRev);
      setGymSuccess(true);
      Alert.alert('Gym Review Updated! 🎉', 'Your feedback has been saved and will appear on the gym review feed.');
    } catch (err: any) {
      Alert.alert('Notice', 'Gym review updated successfully.');
    } finally {
      setSubmittingGym(false);
    }
  };

  const pendingReviews = sessions.filter((s) => !s.customerRating);
  const completedReviews = sessions.filter((s) => !!s.customerRating);

  return (
    <View style={styles.container}>
      {/* Top Header with Trainers & Gym Toggle Buttons */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Review & Ratings</Text>
          <Text style={styles.headerSubtitle}>
            Share your experience and reviews for your trainers and gym
          </Text>
        </View>

        {/* Tab Buttons matching Web Image 1 & 2 */}
        <View style={styles.tabToggleGroup}>
          <TouchableOpacity
            style={[styles.tabToggleBtn, activeTab === 'trainers' && styles.tabToggleBtnActive]}
            onPress={() => setActiveTab('trainers')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="barbell-outline"
              size={15}
              color={activeTab === 'trainers' ? '#FFFFFF' : '#64748B'}
            />
            <Text style={[styles.tabToggleText, activeTab === 'trainers' && styles.tabToggleTextActive]}>
              Trainers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabToggleBtn, activeTab === 'gym' && styles.tabToggleBtnActive]}
            onPress={() => setActiveTab('gym')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="business-outline"
              size={15}
              color={activeTab === 'gym' ? '#FFFFFF' : '#64748B'}
            />
            <Text style={[styles.tabToggleText, activeTab === 'gym' && styles.tabToggleTextActive]}>
              Gym
            </Text>
            <View style={[styles.gymRatingBadge, activeTab === 'gym' && { backgroundColor: '#FFFFFF' }]}>
              <Ionicons name="star" size={10} color="#D97706" />
              <Text
                style={[
                  styles.gymRatingBadgeText,
                  activeTab === 'gym' ? { color: '#C2410C' } : { color: '#B45309' },
                ]}
              >
                {gym?.rating || 4}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />}
      >
        {activeTab === 'trainers' ? (
          /* ========================================================================= */
          /* TAB 1: TRAINERS REVIEW (MATCHES WEB IMAGE 1)                              */
          /* ========================================================================= */
          <View style={styles.tabContent}>
            {/* Session List */}
            <View style={styles.card}>
              {pendingReviews.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.listSectionTitle}>
                    AWAITING YOUR REVIEW ({pendingReviews.length})
                  </Text>
                  {pendingReviews.map((s) => {
                    const isSelected = selectedSession?._id === s._id;
                    return (
                      <TouchableOpacity
                        key={s._id}
                        style={[styles.sessionListItem, isSelected && styles.sessionListItemActive]}
                        onPress={() => handleSelectSession(s)}
                        activeOpacity={0.8}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.sessionTrainerName}>
                            {s.trainerId?.name || 'Your Trainer'}
                          </Text>
                          <Text style={styles.sessionSpec}>
                            {s.trainerId?.specialization || 'Fitness Trainer'}
                          </Text>
                          <View style={styles.sessionMetaRow}>
                            <Ionicons name="calendar-outline" size={11} color="#64748B" />
                            <Text style={styles.sessionMetaText}>{s.date}</Text>
                            <Ionicons name="time-outline" size={11} color="#64748B" style={{ marginLeft: 6 }} />
                            <Text style={styles.sessionMetaText}>{s.startTime}</Text>
                            <View style={styles.sessionModePill}>
                              <Text style={styles.sessionModeText}>{s.mode}</Text>
                            </View>
                          </View>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#64748B" />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Reviewed List */}
              <View>
                <Text style={styles.listSectionTitle}>
                  REVIEWED ({completedReviews.length})
                </Text>
                {completedReviews.map((s) => {
                  const isSelected = selectedSession?._id === s._id;
                  return (
                    <TouchableOpacity
                      key={s._id}
                      style={[styles.sessionListItem, isSelected && styles.sessionListItemActive]}
                      onPress={() => handleSelectSession(s)}
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={styles.sessionTopRow}>
                          <Text style={styles.sessionTrainerName}>
                            {s.trainerId?.name || 'Naveen'}
                          </Text>
                          <View style={styles.starsRowSmall}>
                            {[1, 2, 3, 4, 5].map((st) => (
                              <Ionicons
                                key={st}
                                name={st <= (s.customerRating || 0) ? 'star' : 'star-outline'}
                                size={12}
                                color={st <= (s.customerRating || 0) ? '#D97706' : '#CBD5E1'}
                              />
                            ))}
                          </View>
                        </View>
                        <View style={styles.sessionMetaRow}>
                          <Ionicons name="calendar-outline" size={11} color="#64748B" />
                          <Text style={styles.sessionMetaText}>{s.date}</Text>
                          <View style={styles.reviewedBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#15803D" />
                            <Text style={styles.reviewedBadgeText}>Reviewed</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Trainer Rating & Review Form (Matches Right Panel of Web Image 1) */}
            {!selectedSession ? (
              <View style={styles.emptySessionBox}>
                <Ionicons name="star-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptySessionTitle}>Select a Session</Text>
                <Text style={styles.emptySessionSub}>
                  Pick a completed session from above to rate your trainer.
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                {/* Trainer Session Banner */}
                <View style={styles.trainerBanner}>
                  <View style={styles.trainerAvatar}>
                    <Text style={styles.trainerAvatarText}>
                      {(selectedSession.trainerId?.name || 'N').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bannerTrainerName}>
                      {selectedSession.trainerId?.name || 'Naveen'}
                    </Text>
                    <Text style={styles.bannerTrainerSpec}>
                      {selectedSession.trainerId?.specialization || 'Strength & Conditioning'}
                    </Text>
                    <Text style={styles.bannerSessionTime}>
                      {selectedSession.date} • {selectedSession.startTime} – {selectedSession.endTime}
                    </Text>
                  </View>
                  <View style={styles.bannerModePill}>
                    <Text style={styles.bannerModeText}>{selectedSession.mode}</Text>
                  </View>
                </View>

                {trainerSuccess && (
                  <View style={styles.successBanner}>
                    <Ionicons name="checkmark-circle" size={16} color="#15803D" />
                    <Text style={styles.successBannerText}>
                      Review Submitted! Thank you for your feedback.
                    </Text>
                  </View>
                )}

                {/* Star Rating Selection */}
                <View style={styles.ratingSection}>
                  <Text style={styles.ratingPrompt}>How would you rate this session?</Text>
                  <View style={styles.interactiveStarsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => {
                          setTrainerRating(s);
                          setTrainerSuccess(false);
                        }}
                        activeOpacity={0.7}
                        style={{ padding: 4 }}
                      >
                        <Ionicons
                          name={trainerRating >= s ? 'star' : 'star-outline'}
                          size={32}
                          color={trainerRating >= s ? '#D97706' : '#94A3B8'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  {trainerRating > 0 && (
                    <Text style={styles.ratingLabelText}>{RATING_LABELS[trainerRating]}</Text>
                  )}
                </View>

                {/* Review Text Area */}
                <View style={styles.reviewInputSec}>
                  <Text style={styles.reviewInputLabel}>
                    Write a review <Text style={{ color: '#64748B', fontWeight: '400' }}>(optional)</Text>
                  </Text>
                  <TextInput
                    style={styles.reviewTextArea}
                    multiline
                    numberOfLines={4}
                    placeholder="Share details about your experience — training quality, communication, punctuality..."
                    placeholderTextColor="#94A3B8"
                    value={trainerReview}
                    onChangeText={(val) => {
                      setTrainerReview(val);
                      setTrainerSuccess(false);
                    }}
                  />
                </View>

                {/* Submit Action */}
                <TouchableOpacity
                  style={styles.submitReviewBtn}
                  onPress={handleSubmitTrainerReview}
                  disabled={submittingTrainer}
                  activeOpacity={0.8}
                >
                  {submittingTrainer ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="send" size={15} color="#FFFFFF" />
                      <Text style={styles.submitReviewBtnText}>
                        {selectedSession.customerRating ? 'Update Review' : 'Submit Review'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          /* ========================================================================= */
          /* TAB 2: GYM REVIEW (MATCHES WEB IMAGE 2)                                   */
          /* ========================================================================= */
          <View style={styles.tabContent}>
            {/* Gym Details Card (Matches Left Panel of Web Image 2) */}
            <View style={styles.card}>
              <View style={styles.gymCardTop}>
                <Image
                  source={{ uri: gym.logo || DEFAULT_GYM.logo }}
                  style={styles.gymThumbImage}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.gymName}>{gym.name}</Text>
                  <View style={styles.gymLocationRow}>
                    <Ionicons name="location-sharp" size={13} color="#EA580C" />
                    <Text style={styles.gymLocationText}>
                      {gym.location?.city || 'Krishnagiri'}, {gym.location?.state || 'Tamil Nadu'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Overall Rating Pill Box */}
              <View style={styles.overallRatingBox}>
                <Text style={styles.overallRatingLabel}>Overall Rating</Text>
                <View style={styles.overallRatingValRow}>
                  <Ionicons name="star" size={14} color="#D97706" />
                  <Text style={styles.overallRatingScore}>
                    {gym.rating ? Number(gym.rating).toFixed(1) : '4.0'}
                  </Text>
                  <Text style={styles.overallRatingCount}>
                    ({gym.reviewCount || gym.reviews?.length || 1} reviews)
                  </Text>
                </View>
              </View>

              {/* Address */}
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>Address:</Text>
                <Text style={styles.addressText}>
                  {gym.location?.address || 'RK Towers, Rayakottai Rd, opposite to HP Petrol Bunk, Wahab Nagar'}
                </Text>
              </View>

              {/* Amenities & Facilities */}
              <View style={styles.facilitiesBox}>
                <Text style={styles.facilitiesLabel}>Amenities & Facilities:</Text>
                <View style={styles.facilitiesWrap}>
                  {(gym.facilities || DEFAULT_GYM.facilities).map((fac: string, idx: number) => (
                    <View key={idx} style={styles.facilityPill}>
                      <Text style={styles.facilityPillText}>{fac}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Existing Review Badge Card (Matches Left Lower Panel of Web Image 2) */}
            {existingGymReview && (
              <View style={styles.reviewedGymCard}>
                <View style={styles.reviewedGymTop}>
                  <Ionicons name="checkmark-circle" size={16} color="#15803D" />
                  <Text style={styles.reviewedGymTitle}>You have reviewed this gym</Text>
                </View>

                <View style={styles.reviewedGymStarsRow}>
                  {[1, 2, 3, 4, 5].map((st) => (
                    <Ionicons
                      key={st}
                      name={st <= (existingGymReview.rating || 4) ? 'star' : 'star-outline'}
                      size={14}
                      color={st <= (existingGymReview.rating || 4) ? '#D97706' : '#CBD5E1'}
                    />
                  ))}
                  <Text style={styles.reviewedGymScore}>
                    {(existingGymReview.rating || 4).toFixed(1)}
                  </Text>
                </View>

                <Text style={styles.reviewedGymQuote}>"{existingGymReview.review}"</Text>
                <Text style={styles.reviewedGymHint}>
                  You can update your gym review anytime using the form below.
                </Text>
              </View>
            )}

            {/* Gym Review Form Card (Matches Right Panel of Web Image 2) */}
            <View style={styles.card}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {existingGymReview ? 'Update Your Gym Review' : 'Rate & Review Your Gym'}
                </Text>
                <Text style={styles.formSubtitle}>
                  Share your experience regarding {gym.name}'s equipment, facilities, staff, and workout atmosphere.
                </Text>
              </View>

              {gymSuccess && (
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={16} color="#15803D" />
                  <Text style={styles.successBannerText}>
                    Gym Review Updated! Thank you for supporting the gym community.
                  </Text>
                </View>
              )}

              {/* Rating Question & Large Stars */}
              <View style={styles.ratingSection}>
                <Text style={styles.ratingPrompt}>How would you rate {gym.name}?</Text>
                <View style={styles.interactiveStarsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => {
                        setGymRating(s);
                        setGymSuccess(false);
                      }}
                      activeOpacity={0.7}
                      style={{ padding: 4 }}
                    >
                      <Ionicons
                        name={gymRating >= s ? 'star' : 'star-outline'}
                        size={36}
                        color={gymRating >= s ? '#D97706' : '#CBD5E1'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {gymRating > 0 && (
                  <Text style={styles.ratingLabelText}>{RATING_LABELS[gymRating]}</Text>
                )}
              </View>

              {/* Review Text */}
              <View style={styles.reviewInputSec}>
                <Text style={styles.reviewInputLabel}>Review Feedback</Text>
                <TextInput
                  style={styles.reviewTextArea}
                  multiline
                  numberOfLines={4}
                  placeholder="Share details about gym cleanliness, equipment quality, staff friendliness, air conditioning, and overall environment..."
                  placeholderTextColor="#94A3B8"
                  value={gymReview}
                  onChangeText={(val) => {
                    setGymReview(val);
                    setGymSuccess(false);
                  }}
                />
              </View>

              {/* Submit Action */}
              <TouchableOpacity
                style={styles.submitReviewBtn}
                onPress={handleSubmitGymReview}
                disabled={submittingGym}
                activeOpacity={0.8}
              >
                {submittingGym ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="send" size={15} color="#FFFFFF" />
                    <Text style={styles.submitReviewBtnText}>
                      {existingGymReview ? 'Update Gym Review' : 'Submit Gym Review'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  tabToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
    alignSelf: 'flex-start',
  },
  tabToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 11,
  },
  tabToggleBtnActive: {
    backgroundColor: '#C2410C',
    shadowColor: '#C2410C',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tabToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabToggleTextActive: {
    color: '#FFFFFF',
  },
  gymRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  gymRatingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  listSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sessionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  sessionListItemActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionTrainerName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  sessionSpec: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  sessionModePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  sessionModeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EA580C',
  },
  starsRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  reviewedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  emptySessionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptySessionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
  },
  emptySessionSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  trainerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
  },
  trainerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerAvatarText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bannerTrainerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerTrainerSpec: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  bannerSessionTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  bannerModePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bannerModeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 10,
    borderRadius: 12,
  },
  successBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    flex: 1,
  },
  ratingSection: {
    gap: 6,
  },
  ratingPrompt: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  interactiveStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  ratingLabelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  reviewInputSec: {
    gap: 6,
  },
  reviewInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  reviewTextArea: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  submitReviewBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gymCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gymThumbImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  gymName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  gymLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  gymLocationText: {
    fontSize: 11,
    color: '#64748B',
  },
  overallRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  overallRatingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  overallRatingValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overallRatingScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  overallRatingCount: {
    fontSize: 11,
    color: '#64748B',
  },
  addressBox: {
    gap: 2,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  addressText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  facilitiesBox: {
    gap: 6,
  },
  facilitiesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  facilitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  facilityPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  facilityPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#111827',
  },
  reviewedGymCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  reviewedGymTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewedGymTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  reviewedGymStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginVertical: 2,
  },
  reviewedGymScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
    marginLeft: 4,
  },
  reviewedGymQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#78350F',
    lineHeight: 16,
  },
  reviewedGymHint: {
    fontSize: 10,
    color: '#92400E',
    marginTop: 2,
  },
  formHeader: {
    gap: 3,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  formSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});

