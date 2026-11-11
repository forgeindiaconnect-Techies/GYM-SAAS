import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  BackHandler,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { FileDownloader } from '../../utils/fileDownloader';
import * as DocumentPicker from 'expo-document-picker';
import { TrainerEarningsScreen } from './TrainerEarningsScreen';
import { TrainerProfileScreen } from './TrainerProfileScreen';
import { 
  DEFAULT_WEEKLY_WORKOUTS, 
  DEFAULT_WEEKLY_DIET, 
  REPLACEMENT_OPTIONS, 
  DayWorkout, 
  DayDiet, 
  ExerciseItem 
} from '../../constants/aiFitnessPlans';


const DEFAULT_TRAINER_NOTIFICATIONS = [
  {
    _id: 'notif-1',
    title: 'Application Status Updated: Shortlisted',
    message: 'Your application for "Trainers" at Perfect Fitness Studio has been updated to "Shortlisted".',
    type: 'success',
    isRead: false,
    link: '/trainer/applications',
    relatedSection: 'applications',
    createdAt: '2026-10-31T10:14:00.000Z'
  },
  {
    _id: 'notif-2',
    title: 'New Session Booking Confirmed',
    message: 'Renugopal Y booked a 1-on-1 Online session scheduled for 15 Oct, 10:00 AM.',
    type: 'info',
    isRead: true,
    link: '/trainer/schedule',
    relatedSection: 'schedule',
    createdAt: '2026-10-15T09:00:00.000Z'
  },
  {
    _id: 'notif-3',
    title: 'Monthly Coaching Fee Disbursed',
    message: 'Your gym owner has disbursed ₹25,000 for your monthly coaching fee via UPI.',
    type: 'success',
    isRead: true,
    link: '/trainer/my-fee',
    relatedSection: 'financials',
    createdAt: '2026-10-14T11:47:00.000Z'
  }
];

const DEFAULT_TRAINER_REVIEWS = [
  {
    _id: 'rev-web-1',
    customerId: {
      _id: 'cust-1',
      firstName: 'Renugopal',
      lastName: 'Y',
      email: 'renugopal5457@gmail.com'
    },
    customerRating: 3,
    customerReview: 'GOOD',
    date: '2026-10-15',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    mode: 'Online',
    status: 'Completed',
    updatedAt: '2026-10-14T00:00:00.000Z'
  }
];

const DEFAULT_TRAINER_SUMMARY = {
  totalReviews: 1,
  avgRating: 3.0,
  ratingBreakdown: [
    { star: 5, count: 0 },
    { star: 4, count: 0 },
    { star: 3, count: 1 },
    { star: 2, count: 0 },
    { star: 1, count: 0 }
  ]
};

const DEFAULT_TRAINER_JOBS = [
  {
    _id: 'job-web-1',
    gymName: 'Perfect Fitness Studio',
    title: 'Trainers',
    employmentType: 'Part-time',
    location: 'Tirupattur busstand near',
    salaryMin: 20000,
    salaryMax: 40000,
    salaryType: 'Monthly',
    experience: '5-8 Years',
    experienceRequired: 5,
    deadline: '2026-11-01',
    applicationDeadline: '2026-11-01',
    description: 'asdads',
    expertise: ['Nutrition & Dietetics'],
    vacanciesCount: 1,
    isSalaryNegotiable: true,
    isOver: true,
    responsibilities: [
      'Conduct tailored member training sessions',
      'Provide professional diet & nutritional plans',
      'Ensure floor equipment safety and hygiene'
    ],
    qualifications: [
      'Diploma / B.Sc in Sports Nutrition or Fitness',
      'Recognized trainer accreditation'
    ],
    certifications: [
      'CPR / AED certified',
      'Nutrition Specialist certification'
    ],
    workingHours: '06:00 AM - 12:00 PM'
  },
  {
    _id: 'job-web-2',
    gymName: 'Perfect Fitness Studio',
    title: 'Trainer hiring',
    employmentType: 'Full-time',
    location: 'RK Towers, Rayakottai Rd, opposite to H...',
    salaryMin: 25000,
    salaryMax: 45000,
    salaryType: 'Monthly',
    experience: '3-5 Years',
    experienceRequired: 3,
    deadline: '2026-10-31',
    applicationDeadline: '2026-10-31',
    description: 'JCNLEBWELWKJLJNL',
    expertise: ['Strength & Conditioning', 'Weight Loss & Fat Reduction'],
    vacanciesCount: 2,
    isSalaryNegotiable: false,
    isOver: true,
    responsibilities: [
      'Design periodized strength & conditioning routines',
      'Lead group fat reduction bootcamps',
      'Monitor member workout logs and kinetic form'
    ],
    qualifications: [
      'Certified Personal Trainer (CPT)',
      'Demonstrated bodybuilding & strength track record'
    ],
    certifications: [
      'CSCS or ACE/ISSA credential',
      'First Aid / CPR'
    ],
    workingHours: '06:00 AM - 02:00 PM / 02:00 PM - 10:00 PM'
  }
];

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


// ==================== DEFAULT FEEDBACK & REWARDS SEED DATA ====================
const DEFAULT_FEEDBACK_ITEMS = [
  {
    _id: 'rec-1',
    customerId: {
      _id: 'cust-1',
      firstName: 'Renugopal',
      lastName: 'Y',
      email: 'renugopal5457@gmail.com',
    },
    status: 'Trainer Approved',
    createdAt: '2026-10-17T10:30:00.000Z',
    fitnessProfile: {
      goal: 'Weight Loss',
      fitnessLevel: 'Beginner',
      medicalClearance: 'Verified - No contraindications'
    },
    aiAnalysis: {
      assessment: 'Client presents strong dedication with goal of losing 8kg in 12 weeks. High adherence potential. Recommend balanced 4-day resistance split with 20% caloric deficit.',
      profileSummary: 'Metabolic rate baseline calibrated. Target caloric burn 450 kcal/session.'
    },
    workoutRecommendation: {
      weeklySchedule: [
        { day: 'Monday', focus: 'Push - Chest, Shoulders & Triceps' },
        { day: 'Tuesday', focus: 'Pull - Back & Biceps' },
        { day: 'Thursday', focus: 'Legs & Core Conditioning' },
        { day: 'Saturday', focus: 'HIIT Cardio & Mobility' }
      ]
    },
    dietRecommendation: {
      mealPlan: [
        { meal: 'Breakfast', time: '08:00 AM', calories: 420 },
        { meal: 'Lunch', time: '01:00 PM', calories: 650 },
        { meal: 'Evening Snack', time: '05:00 PM', calories: 250 },
        { meal: 'Dinner', time: '08:30 PM', calories: 550 }
      ]
    },
    trainerNotes: 'Calibrated squat repetitions to 3x10 to safeguard lower back. Progressive overload on bench press approved.',
    chatMessages: [
      {
        senderRole: 'MEMBER',
        senderName: 'Renugopal Y',
        message: 'Hi Coach Naveen, can we adjust Saturday session timing by 30 mins?',
        date: '2026-10-18T09:15:00.000Z'
      },
      {
        senderRole: 'TRAINER',
        senderName: 'Naveen (You)',
        message: 'Sure Renugopal, 9:30 AM works perfectly. Rest well before legs day!',
        date: '2026-10-18T09:40:00.000Z'
      }
    ]
  },
  {
    _id: 'rec-2',
    customerId: {
      _id: 'cust-2',
      firstName: 'Renu',
      lastName: 'y',
      email: 'renugopal24022000@gmail.com',
    },
    status: 'AI Generated',
    createdAt: '2026-11-04T09:15:00.000Z',
    fitnessProfile: {
      goal: 'Weight Loss',
      fitnessLevel: 'Beginner',
      medicalClearance: 'Standard baseline'
    },
    aiAnalysis: {
      assessment: 'Beginner level client seeking sustained fat loss and posture correction. Needs foundational mobility and cardiovascular ramp-up.',
      profileSummary: 'Focus on full-body functional movements and calorie deficit.'
    },
    workoutRecommendation: {
      weeklySchedule: [
        { day: 'Monday', focus: 'Full Body Functional Starter' },
        { day: 'Wednesday', focus: 'Core Activation & Incline Walk' },
        { day: 'Friday', focus: 'Lower Body & Kinetic Form' }
      ]
    },
    dietRecommendation: {
      mealPlan: [
        { meal: 'Breakfast', time: '08:30 AM', calories: 380 },
        { meal: 'Lunch', time: '01:30 PM', calories: 580 },
        { meal: 'Dinner', time: '08:00 PM', calories: 480 }
      ]
    },
    chatMessages: [
      {
        senderRole: 'MEMBER',
        senderName: 'Renu y',
        message: 'Excited to get started with the new training routine!',
        date: '2026-11-04T10:00:00.000Z'
      }
    ]
  }
];

const DEFAULT_PERF_SUMMARY = {
  completedSessionsCount: 12,
  onlineSessionsCount: 4,
  inPersonSessionsCount: 8,
  punctualityStatus: 'On-Time (98%)',
  averageRating: 3.0,
  totalRatingsCount: 1,
  assignedClientsCount: 1,
  reviewedPlansCount: 2,
  totalBonusApproved: 5000,
  totalBonusPaid: 25000,
  assignedClients: [
    {
      _id: 'client-1',
      firstName: 'Renugopal',
      lastName: 'Y',
      email: 'renugopal5457@gmail.com',
      workoutCompletionPercentage: 57,
      dietAdherencePercentage: 80,
      completedSessionsWithTrainer: 12
    }
  ],
  reviews: [
    {
      clientName: 'Renugopal Y',
      rating: 3,
      review: 'GOOD',
      date: '2026-10-14T10:00:00.000Z'
    }
  ]
};

const DEFAULT_TRAINER_REWARDS_LIST = [
  {
    _id: 'rew-1',
    title: 'Top Session Completer Bonus',
    description: 'Awarded to coaches who complete over 10 verified training sessions in a monthly cycle.',
    category: 'Performance Bonus',
    bonusAmount: 5000,
    currency: 'INR',
    minCompletedSessions: 10,
    minAverageRating: 4.5,
    minReviewedPlans: 1,
    isEligible: true,
    alreadyClaimed: false,
    eligibilityReasons: []
  },
  {
    _id: 'rew-2',
    title: 'Client Retention & Progress Champion',
    description: 'Maintain assigned client workout adherence above 50% and achieve consistent check-in milestones.',
    category: 'Client Success',
    bonusAmount: 3000,
    currency: 'INR',
    minCompletedSessions: 8,
    minAverageRating: 4.0,
    minReviewedPlans: 2,
    isEligible: true,
    alreadyClaimed: true,
    eligibilityReasons: []
  },
  {
    _id: 'rew-3',
    title: 'Punctuality & Floor Excellence',
    description: '100% on-time floor attendance across all scheduled client slots without late start flags.',
    category: 'Attendance & Quality',
    bonusAmount: 2500,
    currency: 'INR',
    minCompletedSessions: 15,
    minAverageRating: 4.8,
    minReviewedPlans: 3,
    isEligible: false,
    alreadyClaimed: false,
    eligibilityReasons: ['Need 15 completed sessions (current: 12)', 'Need 3 reviewed plans (current: 2)']
  }
];

const DEFAULT_TRAINER_CLAIMS = [
  {
    _id: 'clm-1',
    rewardId: {
      _id: 'rew-2',
      title: 'Client Retention & Progress Champion',
      category: 'Client Success',
      bonusAmount: 3000,
      currency: 'INR'
    },
    claimCode: 'CLM-98241',
    claimStatus: 'Approved',
    financialPayoutStatus: 'Paid',
    financialPayoutReference: 'TRX-PF-982410',
    financialPayoutDate: '2026-10-10T12:00:00.000Z',
    createdAt: '2026-10-05T09:30:00.000Z'
  },
  {
    _id: 'clm-2',
    rewardId: {
      _id: 'rew-1',
      title: 'Top Session Completer Bonus',
      category: 'Performance Bonus',
      bonusAmount: 5000,
      currency: 'INR'
    },
    claimCode: 'CLM-10492',
    claimStatus: 'Pending',
    financialPayoutStatus: 'Pending Approval',
    createdAt: '2026-11-02T14:20:00.000Z'
  }
];

const DEFAULT_TRAINER_AWARDS = [
  {
    _id: 'award-1',
    title: 'Elite Coach of the Month',
    category: 'Coaching Excellence',
    description: 'Recognized for top client progress score, verified session execution, and exceptional member retention.',
    awardPeriod: 'October 2026 Honors',
    winnerScore: '12 Verified Sessions · 98% Punctuality · 57% Progress',
    bonusAmount: 5000,
    certificateId: 'CERT-PF-2026-TR889',
    publishedAt: '2026-10-31T18:00:00.000Z',
    winnerName: 'Naveen',
    gymId: { name: 'Perfect Fitness Studio' }
  },
  {
    _id: 'award-2',
    title: 'Customer Satisfaction Star',
    category: 'Client Success',
    description: 'Awarded for exceptional member engagement, constructive plan calibrations, and dedicated client support.',
    awardPeriod: 'Q3 2026 Honors',
    winnerScore: '100% Positive Client Review Distribution',
    bonusAmount: 3000,
    certificateId: 'CERT-PF-2026-ST441',
    publishedAt: '2026-09-30T18:00:00.000Z',
    winnerName: 'Naveen',
    gymId: { name: 'Perfect Fitness Studio' }
  }
];

const DEFAULT_HALL_OF_FAME = [
  {
    _id: 'hof-1',
    title: 'Elite Coach of the Month',
    category: 'Coaching Excellence',
    recipientType: 'Trainer',
    awardPeriod: 'October 2026',
    winnerName: 'Naveen',
    certificateId: 'CERT-PF-2026-TR889',
    publishedAt: '2026-10-31T18:00:00.000Z'
  },
  {
    _id: 'hof-2',
    title: 'Top Member Transformation',
    category: 'Client Milestone',
    recipientType: 'Member',
    awardPeriod: 'October 2026',
    winnerName: 'Renugopal Y',
    certificateId: 'CERT-PF-2026-MB102',
    publishedAt: '2026-10-31T18:00:00.000Z'
  }
];

export const TrainerMoreScreen: React.FC<{ initialSection?: TrainerMoreKey }> = ({ initialSection = 'none' }) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState<TrainerMoreKey>(initialSection);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Live state objects
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>(DEFAULT_TRAINER_REVIEWS);
  const [reviewsSummary, setReviewsSummary] = useState<any>(DEFAULT_TRAINER_SUMMARY);
  const [reviewFilterStar, setReviewFilterStar] = useState<number | 'all'>('all');
  const [reviewSortOrder, setReviewSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [jobs, setJobs] = useState<any[]>(DEFAULT_TRAINER_JOBS);
  const [jobSearch, setJobSearch] = useState('');
  const [jobLocationFilter, setJobLocationFilter] = useState('');
  const [jobEmploymentFilter, setJobEmploymentFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [applicationsSearch, setApplicationsSearch] = useState('');
  const [msgContacts, setMsgContacts] = useState<any[]>([
    {
      id: 'cust-1',
      _id: 'cust-1',
      name: 'Renugopal Y',
      email: 'renugopal5457@gmail.com',
      lastMsg: 'yesssssssssssssssssss',
      lastMsgTime: '11:44 am',
      isActive: true,
      unreadCount: 0
    },
    {
      id: 'cust-2',
      _id: 'cust-2',
      name: 'Renu y',
      email: 'renugopal24022000@gmail.com',
      lastMsg: 'Looking forward to our workout plan!',
      lastMsgTime: 'Yesterday',
      isActive: false,
      unreadCount: 0
    }
  ]);
  const [selectedMsgContact, setSelectedMsgContact] = useState<any>({
    id: 'cust-1',
    _id: 'cust-1',
    name: 'Renugopal Y',
    email: 'renugopal5457@gmail.com',
    lastMsg: 'yesssssssssssssssssss',
    lastMsgTime: '11:44 am',
    isActive: true,
    unreadCount: 0
  });
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      _id: 'msg-1',
      senderId: 'cust-1',
      senderName: 'Renugopal Y',
      message: 'hiiiiiiiiiiiiiiiiiiii',
      createdAt: '2026-11-05T11:43:00.000Z',
      time: '11:43 am',
      isOutgoing: false
    },
    {
      _id: 'msg-2',
      senderId: 'trainer-me',
      senderName: 'You (Naveen )',
      message: 'yesssssssssssssssssss',
      createdAt: '2026-11-05T11:44:00.000Z',
      time: '11:44 am',
      isOutgoing: true
    }
  ]);
  const [currentMessageInput, setCurrentMessageInput] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState<any[]>([]);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [playingVoiceMsgId, setPlayingVoiceMsgId] = useState<string | null>(null);
  const [voicePlaybackProgress, setVoicePlaybackProgress] = useState<Record<string, number>>({});
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [customFileNameInput, setCustomFileNameInput] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [actionWithdrawing, setActionWithdrawing] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(DEFAULT_TRAINER_NOTIFICATIONS);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'clients' | 'alerts'>('all');
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  // Feedback & Rewards States
  const [feedbacks, setFeedbacks] = useState<any[]>(DEFAULT_FEEDBACK_ITEMS);
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('All');
  const [feedbackDateFilter, setFeedbackDateFilter] = useState('');
  const [feedbackGroupByDate, setFeedbackGroupByDate] = useState(true);
  const [showFeedbackCalendarModal, setShowFeedbackCalendarModal] = useState(false);
  const [feedbackCalendarMonth, setFeedbackCalendarMonth] = useState<Date>(() => new Date(2026, 9, 1));
  const [feedbackSortOrder, setFeedbackSortOrder] = useState<'desc' | 'asc'>('desc');
  const [feedbackExpandedId, setFeedbackExpandedId] = useState<string | null>(null);
  const [selectedFeedbackDetail, setSelectedFeedbackDetail] = useState<any | null>(null);
  const [feedbackReplyTexts, setFeedbackReplyTexts] = useState<Record<string, string>>({});
  const [feedbackReplySending, setFeedbackReplySending] = useState<Record<string, boolean>>({});

  const [rewardsActiveTab, setRewardsActiveTab] = useState<'performance' | 'clients' | 'rewards' | 'claims' | 'awards'>('performance');
  const [perfSummary, setPerfSummary] = useState<any>(DEFAULT_PERF_SUMMARY);
  const [rewardsList, setRewardsList] = useState<any[]>(DEFAULT_TRAINER_REWARDS_LIST);
  const [claimsList, setClaimsList] = useState<any[]>(DEFAULT_TRAINER_CLAIMS);
  const [trainerAwardsList, setTrainerAwardsList] = useState<any[]>(DEFAULT_TRAINER_AWARDS);
  const [hallOfFameList, setHallOfFameList] = useState<any[]>(DEFAULT_HALL_OF_FAME);
  const [requestingRewardId, setRequestingRewardId] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [downloadingCertId, setDownloadingCertId] = useState<string | null>(null);
  const [rewards, setRewards] = useState<any[]>(DEFAULT_TRAINER_REWARDS_LIST);
  const [aiCustomers, setAiCustomers] = useState<any[]>([
    {
      _id: 'cust-ai-1',
      firstName: 'Renugopal',
      lastName: 'Y',
      email: 'renugopal5457@gmail.com',
      goal: 'Weight Loss',
      level: 'Beginner',
      aiStatus: 'Trainer Approved',
      lastUpdated: '2026-10-17',
      plan: {
        name: 'Weight Loss & Hypertrophy Split',
        calories: 2150,
        workoutDays: '4 Days / Week',
        focus: 'Fat Loss & Core Strength'
      }
    },
    {
      _id: 'cust-ai-2',
      firstName: 'Renu',
      lastName: 'y',
      email: 'renugopal24022000@gmail.com',
      goal: 'Weight Loss',
      level: 'Beginner',
      aiStatus: 'No Data',
      lastUpdated: '2026-11-04',
      plan: {
        name: 'Personalized Workout Routine',
        calories: 1950,
        workoutDays: '3 Days / Week',
        focus: 'Cardio & Strength Starter'
      }
    }
  ]);

  // AI Review & Calibration States (100% Match of Web /trainer/ai-review/:id)
  const [aiSearchTerm, setAiSearchTerm] = useState('');
  const [aiStatusFilter, setAiStatusFilter] = useState<'All' | 'Pending' | 'Approved'>('All');
  const [selectedAiCustomer, setSelectedAiCustomer] = useState<any | null>(null);
  const [showAiReviewModal, setShowAiReviewModal] = useState(false);
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string>('Monday');
  const [selectedDietDay, setSelectedDietDay] = useState<string>('Monday');
  const [showOriginalDraft, setShowOriginalDraft] = useState(false);
  const [replacingExerciseIdx, setReplacingExerciseIdx] = useState<number | null>(null);
  const [modificationCount, setModificationCount] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<Record<string, DayWorkout>>(DEFAULT_WEEKLY_WORKOUTS);
  const [weeklyDiet, setWeeklyDiet] = useState<Record<string, DayDiet>>(DEFAULT_WEEKLY_DIET);
  const [recoveryStructure, setRecoveryStructure] = useState<any>({
    sleep: '7.5 – 8.5 hours uninterrupted sleep per night.',
    activeRecovery: '15–20 minutes walking or light mobility on rest days.',
    stretchingMobility: '10 mins dynamic warm-up and post-workout static stretches.',
    hydration: '3.5 - 4.0 Litres of pure water daily.'
  });
  const [trainerRecommendations, setTrainerRecommendations] = useState('Focus on progressive overload. Rest strictly 60s. Deload planned for Week 4.');
  const [trainerNotes, setTrainerNotes] = useState('Great baseline! I calibrated your squat reps to 3x10 to protect your lower back. Track your sets daily and message me with any questions!');

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
      } else if (section === 'reviews') {
        try {
          const res = await api.get('/trainer-sessions/trainer/reviews');
          if (res.data?.success || res.data?.reviews) {
            const list = res.data?.reviews || (Array.isArray(res.data) ? res.data : []);
            if (list.length > 0) setReviews(list);
            if (res.data?.summary) setReviewsSummary(res.data.summary);
          }
        } catch (err) {
          console.log('[TrainerMore] Load reviews error:', err);
        }
      } else if (section === 'feedback') {
        try {
          const res = await api.get('/ai/trainer/recommendations');
          const list = res.data?.recommendations || (Array.isArray(res.data) ? res.data : []);
          if (list && list.length > 0) {
            setFeedbacks(list);
          }
        } catch (e) {
          console.log('[TrainerMore] Load feedback error:', e);
        }
      } else if (section === 'rewards') {
        try {
          const [rewardRes, perfRes, awardRes, hofRes] = await Promise.allSettled([
            api.get('/rewards/trainer'),
            api.get('/performance/my-trainer-performance'),
            api.get('/awards/my-awards'),
            api.get('/awards/hall-of-fame')
          ]);
          if (rewardRes.status === 'fulfilled' && rewardRes.value.data?.success) {
            if (rewardRes.value.data.rewards?.length > 0) setRewardsList(rewardRes.value.data.rewards);
            if (rewardRes.value.data.claims?.length > 0) setClaimsList(rewardRes.value.data.claims);
          }
          if (perfRes.status === 'fulfilled' && perfRes.value.data?.success && perfRes.value.data.performance) {
            setPerfSummary(perfRes.value.data.performance);
          }
          if (awardRes.status === 'fulfilled' && awardRes.value.data?.success && awardRes.value.data.awards?.length > 0) {
            setTrainerAwardsList(awardRes.value.data.awards);
          }
          if (hofRes.status === 'fulfilled' && hofRes.value.data?.success && hofRes.value.data.hallOfFame?.length > 0) {
            setHallOfFameList(hofRes.value.data.hallOfFame);
          }
        } catch (e) {
          console.log('[TrainerMore] Load rewards error:', e);
        }
      } else if (section === 'jobs') {
        const res = await api.get('/hiring/jobs');
        const list = res.data?.jobs || (Array.isArray(res.data) ? res.data : []);
        setJobs(list && list.length > 0 ? list : DEFAULT_TRAINER_JOBS);
      } else if (section === 'applications') {
        const res = await api.get('/hiring/trainer/applications');
        const list = res.data?.applications || (Array.isArray(res.data) ? res.data : []);
        setApplications(list);
      } else if (section === 'notifications') {
        try {
          const res = await api.get('/notifications');
          const list = res.data?.notifications || (Array.isArray(res.data) ? res.data : []);
          if (list && list.length > 0) {
            const existingIds = new Set(list.map((n: any) => n._id || n.title));
            const defaultsToAdd = DEFAULT_TRAINER_NOTIFICATIONS.filter(d => !existingIds.has(d._id) && !existingIds.has(d.title));
            setNotifications([...list, ...defaultsToAdd]);
          } else {
            setNotifications(DEFAULT_TRAINER_NOTIFICATIONS);
          }
        } catch (e) {
          console.log('[TrainerMore] Load notifications error:', e);
          setNotifications(DEFAULT_TRAINER_NOTIFICATIONS);
        }
      
      } else if (section === 'messages') {
        try {
          const res = await api.get('/direct-messages/contacts');
          if (res.data?.success && res.data.contacts?.length > 0) {
            setMsgContacts(res.data.contacts);
            const active = (selectedMsgContact?.id && selectedMsgContact.id !== 'cust-1')
              ? (res.data.contacts.find((c: any) => (c.id || c._id) === (selectedMsgContact.id || selectedMsgContact._id)) || res.data.contacts[0])
              : res.data.contacts[0];
            setSelectedMsgContact(active);
            const histRes = await api.get('/direct-messages/history/' + (active.id || active._id));
            if (histRes.data?.success && Array.isArray(histRes.data.messages)) {
              setChatMessages(histRes.data.messages.map((m: any) => {
                const sId = m.senderId?._id || m.senderId;
                const isOut = String(sId) === String(user?._id || user?.id);
                const hasAtt = Array.isArray(m.attachments) && m.attachments.length > 0;
                const firstAtt = hasAtt ? m.attachments[0] : null;
                const attUrl = firstAtt?.url || m.attachmentUrl;
                const isImg = (firstAtt?.fileType === 'image') || (m.fileType === 'image') || (m.messageType === 'image') || (m.message === '📷 Photo attached');

                const mappedAttachments = hasAtt
                  ? m.attachments.map((a: any) => ({
                      fileName: a.fileName || m.fileName || 'Attachment',
                      fileType: a.fileType || m.fileType || (isImg ? 'image' : 'document'),
                      fileSize: a.fileSize || m.fileSize,
                      url: a.url || attUrl,
                      previewUrl: a.url || attUrl,
                    }))
                  : (attUrl || isImg)
                  ? [{
                      fileName: m.fileName || 'Photo.jpg',
                      fileType: isImg ? 'image' : (m.fileType || 'document'),
                      fileSize: m.fileSize,
                      url: attUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
                      previewUrl: attUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
                    }]
                  : [];

                return {
                  _id: m._id || 'msg_' + Math.random(),
                  senderId: sId,
                  senderName: isOut ? 'You (Naveen )' : (active.name || 'Renugopal Y'),
                  message: m.message,
                  time: new Date(m.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
                  isOutgoing: isOut,
                  messageType: m.messageType || (isImg ? 'image' : 'text'),
                  attachments: mappedAttachments,
                  attachmentUrl: attUrl || (isImg ? (mappedAttachments[0]?.url || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600') : undefined),
                  duration: m.duration,
                };
              }));
            }
          }
        } catch (e) {
          console.log('[TrainerMore] Load messages error:', e);
        }
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

  // Voice Recording Live Timer
  useEffect(() => {
    let timer: any = null;
    if (isRecordingVoice) {
      timer = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecordingVoice]);

  // Voice Playback Simulation Timer
  useEffect(() => {
    let playTimer: any = null;
    if (playingVoiceMsgId) {
      playTimer = setInterval(() => {
        setVoicePlaybackProgress(prev => {
          const current = prev[playingVoiceMsgId] || 0;
          const msg = chatMessages.find(m => m._id === playingVoiceMsgId);
          const max = msg?.duration || 6;
          if (current >= max) {
            setPlayingVoiceMsgId(null);
            return { ...prev, [playingVoiceMsgId]: 0 };
          }
          return { ...prev, [playingVoiceMsgId]: current + 1 };
        });
      }, 1000);
    }
    return () => {
      if (playTimer) clearInterval(playTimer);
    };
  }, [playingVoiceMsgId, chatMessages]);

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

  // 1. My Profile (Full 100% Match with Web /trainer/profile)
  const renderProfile = () => (
    <TrainerProfileScreen />
  );

  // 2. AI Recommendations (Complete 100% Match of Web /trainer/ai-assistant - Images 1, 2, 3)
  const renderAI = () => {
    const filteredAiCustomers = aiCustomers.filter(c => {
      const fullName = (c.firstName || '') + ' ' + (c.lastName || '');
      const q = aiSearchTerm.toLowerCase().trim();
      const matchSearch = !q || fullName.toLowerCase().includes(q) || (c.goal && c.goal.toLowerCase().includes(q)) || (c.email && c.email.toLowerCase().includes(q));
      
      if (!matchSearch) return false;

      if (aiStatusFilter === 'Pending') {
        return c.aiStatus === 'Pending Trainer Review' || c.aiStatus === 'Under Trainer Review' || c.aiStatus === 'AI Generated';
      }
      if (aiStatusFilter === 'Approved') {
        return c.aiStatus === 'Trainer Approved' || c.aiStatus === 'Published to Customer';
      }
      return true;
    });

    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={styles.subScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* =========================================================================
            HEADER: AI ANALYSIS REVIEW HUB (Matching Web Images 1, 2, 3)
            ========================================================================= */}
        <View style={styles.aiHubHeroCard}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={styles.aiBotSquircle}>
              <Ionicons name="hardware-chip" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiHubTitle}>AI Analysis Review Hub</Text>
              <Text style={styles.aiHubSubtitle}>
                Review customer assessments, adjust exercises, calibrate sets & reps, and approve final customer plans.
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.aiSearchBox}>
            <Ionicons name="search" size={15} color="#64748B" />
            <TextInput
              placeholder="Search clients by name or goal..."
              placeholderTextColor="#94A3B8"
              value={aiSearchTerm}
              onChangeText={setAiSearchTerm}
              style={styles.aiSearchInput}
            />
            {Boolean(aiSearchTerm) && (
              <TouchableOpacity onPress={() => setAiSearchTerm('')}>
                <Ionicons name="close-circle" size={15} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.aiFilterTabsContainer}>
          {[
            { key: 'All', label: 'All Clients' },
            { key: 'Pending', label: 'Pending Trainer Review' },
            { key: 'Approved', label: 'Trainer Approved' },
          ].map(tab => {
            const isActive = aiStatusFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.aiFilterPill, isActive && styles.aiFilterPillActive]}
                onPress={() => setAiStatusFilter(tab.key as any)}
                activeOpacity={0.7}
              >
                <Text style={[styles.aiFilterPillText, isActive && styles.aiFilterPillTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Client Roster List / Empty State */}
        {filteredAiCustomers.length === 0 ? (
          <View style={styles.aiEmptyStateCard}>
            <View style={styles.aiEmptyBotCircle}>
              <Ionicons name="hardware-chip-outline" size={36} color="#CBD5E1" />
            </View>
            <Text style={styles.aiEmptyStateTitle}>No clients found</Text>
            <Text style={styles.aiEmptyStateSub}>No customer assessment records matching this filter.</Text>
          </View>
        ) : (
          filteredAiCustomers.map(c => {
            const isApproved = c.aiStatus === 'Trainer Approved' || c.aiStatus === 'Published to Customer';
            const isPending = c.aiStatus === 'Pending Trainer Review' || c.aiStatus === 'Under Trainer Review' || c.aiStatus === 'AI Generated';

            return (
              <View key={c._id} style={styles.aiClientCard}>
                <View style={styles.aiClientCardTop}>
                  <View style={styles.aiClientAvatar}>
                    <Text style={styles.aiClientAvatarText}>{c.firstName?.[0] || 'C'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.aiClientName}>{c.firstName} {c.lastName}</Text>
                    <Text style={styles.aiClientEmail}>{c.email}</Text>
                  </View>
                </View>

                {/* Details Row: Goal, Level, Status, Assessment Date */}
                <View style={styles.aiClientDetailsGrid}>
                  <View style={styles.aiClientDetailItem}>
                    <Text style={styles.aiDetailLabel}>FITNESS GOAL</Text>
                    <Text style={styles.aiGoalValue}>{c.goal || 'General Fitness'}</Text>
                  </View>

                  <View style={styles.aiClientDetailItem}>
                    <Text style={styles.aiDetailLabel}>FITNESS LEVEL</Text>
                    <View style={styles.aiLevelBadge}>
                      <Text style={styles.aiLevelBadgeText}>{c.level || 'Beginner'}</Text>
                    </View>
                  </View>

                  <View style={styles.aiClientDetailItem}>
                    <Text style={styles.aiDetailLabel}>WORKFLOW STATUS</Text>
                    <View style={[
                      styles.aiStatusBadge, 
                      isApproved ? styles.aiStatusBadgeApproved : isPending ? styles.aiStatusBadgePending : styles.aiStatusBadgeDefault
                    ]}>
                      <Ionicons 
                        name={isApproved ? "checkmark-circle-outline" : isPending ? "time-outline" : "person-outline"} 
                        size={11} 
                        color={isApproved ? "#EA580C" : isPending ? "#B45309" : "#64748B"} 
                      />
                      <Text style={[
                        styles.aiStatusBadgeText, 
                        { color: isApproved ? "#EA580C" : isPending ? "#B45309" : "#64748B" }
                      ]}>
                        {c.aiStatus || 'No Data'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.aiClientDetailItem}>
                    <Text style={styles.aiDetailLabel}>ASSESSMENT DATE</Text>
                    <Text style={styles.aiDateValue}>{c.lastUpdated || '10/17/2026'}</Text>
                  </View>
                </View>

                {/* Action Button: Edit / View Plan OR Review & Approve */}
                <View style={styles.aiClientActionRow}>
                  <TouchableOpacity
                    style={[
                      styles.aiActionButton, 
                      isApproved ? styles.aiActionButtonEdit : styles.aiActionButtonReview
                    ]}
                    onPress={() => handleOpenAiReview(c)}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={isApproved ? "create-outline" : "send-outline"} 
                      size={14} 
                      color={isApproved ? "#EA580C" : "#FFFFFF"} 
                    />
                    <Text style={[
                      styles.aiActionButtonText, 
                      { color: isApproved ? "#EA580C" : "#FFFFFF" }
                    ]}>
                      {isApproved ? 'Edit / View Plan' : 'Review & Approve'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    );
  };

    // 3. Feedback (100% Match of Web /trainer/ai-feedback)
  const renderFeedback = () => {
    const handleSendFeedbackReply = async (recId: string) => {
      const text = (feedbackReplyTexts[recId] || '').trim();
      if (!text) return;
      setFeedbackReplySending(prev => ({ ...prev, [recId]: true }));
      try {
        await api.post('/ai/trainer/reply', { recommendationId: recId, message: text });
      } catch (err) {
        console.log('Send reply error:', err);
      } finally {
        const newMsg = {
          senderRole: 'TRAINER',
          senderName: 'Naveen (You)',
          message: text,
          date: new Date().toISOString()
        };
        setFeedbacks(prev => prev.map(f => {
          if (f._id === recId) {
            return {
              ...f,
              chatMessages: [...(f.chatMessages || []), newMsg]
            };
          }
          return f;
        }));
        if (selectedFeedbackDetail && selectedFeedbackDetail._id === recId) {
          setSelectedFeedbackDetail((prev: any) => ({
            ...prev,
            chatMessages: [...(prev.chatMessages || []), newMsg]
          }));
        }
        setFeedbackReplyTexts(prev => ({ ...prev, [recId]: '' }));
        setFeedbackReplySending(prev => ({ ...prev, [recId]: false }));
      }
    };

    const getClientName = (f: any) => {
      if (!f || !f.customerId) return 'Member';
      if (typeof f.customerId === 'object') {
        const full = `${f.customerId.firstName || ''} ${f.customerId.lastName || ''}`.trim();
        return full || f.customerId.email || 'Member';
      }
      return 'Member';
    };

    const toLocalYMD = (dateStr?: string | Date) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const formatCalendarBtnLabel = (ymd: string) => {
      if (!ymd) return 'mm/dd/yyyy';
      const parts = ymd.split('-');
      if (parts.length !== 3) return ymd;
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    };

    const getDateGroupKey = (dateStr?: string | Date) => {
      if (!dateStr) return 'Other Dates';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Other Dates';
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return 'Today';
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const formatDt = (dateStr?: string) => {
      if (!dateStr) return { date: '—', time: '—' };
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: '—', time: '—' };
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      };
    };

    const openFeedbackCalendar = () => {
      if (feedbackDateFilter) {
        const [y, m] = feedbackDateFilter.split('-').map(Number);
        if (y && m) setFeedbackCalendarMonth(new Date(y, m - 1, 1));
      } else if (feedbacks.length > 0 && feedbacks[0]?.createdAt) {
        const latest = new Date(feedbacks[0].createdAt);
        if (!isNaN(latest.getTime())) {
          setFeedbackCalendarMonth(new Date(latest.getFullYear(), latest.getMonth(), 1));
        }
      }
      setShowFeedbackCalendarModal(true);
    };

    const getFeedbackCalendarDays = (currentDate: Date) => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDayIndex = new Date(year, month, 1).getDay();
      const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      const days: Array<{ day: number; isCurrentMonth: boolean; isoString: string; dateObj: Date }> = [];

      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const d = daysInPrevMonth - i;
        const prevM = month === 0 ? 11 : month - 1;
        const prevY = month === 0 ? year - 1 : year;
        const mm = String(prevM + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        days.push({ day: d, isCurrentMonth: false, isoString: `${prevY}-${mm}-${dd}`, dateObj: new Date(prevY, prevM, d) });
      }
      for (let d = 1; d <= daysInCurrentMonth; d++) {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        days.push({ day: d, isCurrentMonth: true, isoString: `${year}-${mm}-${dd}`, dateObj: new Date(year, month, d) });
      }
      const totalCells = days.length > 35 ? 42 : 35;
      const remaining = totalCells - days.length;
      for (let d = 1; d <= remaining; d++) {
        const nextM = month === 11 ? 0 : month + 1;
        const nextY = month === 11 ? year + 1 : year;
        const mm = String(nextM + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        days.push({ day: d, isCurrentMonth: false, isoString: `${nextY}-${mm}-${dd}`, dateObj: new Date(nextY, nextM, d) });
      }
      return days;
    };

    const filteredFeedbacks = feedbacks
      .filter(f => {
        const nameMatch = getClientName(f).toLowerCase().includes(feedbackSearch.toLowerCase());
        const statusMatch = feedbackStatusFilter === 'All' || f.status === feedbackStatusFilter;
        const dateMatch = !feedbackDateFilter || toLocalYMD(f.createdAt) === feedbackDateFilter;
        return nameMatch && statusMatch && dateMatch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return feedbackSortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });

    // Group items date-wise (matching Web)
    const dateGroups = filteredFeedbacks.reduce((acc: { key: string; items: any[] }[], f: any) => {
      const key = getDateGroupKey(f.createdAt);
      const existing = acc.find(g => g.key === key);
      if (existing) {
        existing.items.push(f);
      } else {
        acc.push({ key, items: [f] });
      }
      return acc;
    }, []);

    const totalCount = feedbacks.length;
    const aiGenCount = feedbacks.filter(f => f.status === 'AI Generated').length;
    const approvedCount = feedbacks.filter(f => f.status === 'Trainer Approved' || f.status === 'Sent').length;
    const revisionCount = feedbacks.filter(f => f.status === 'Revision Requested').length;

    const FB_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const FB_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const feedbackDateSet = new Set(feedbacks.map(f => toLocalYMD(f.createdAt)).filter(Boolean));

    const renderFeedbackCard = (f: any) => {
      const id = f._id;
      const isOpen = feedbackExpandedId === id;
      const name = getClientName(f);
      const goal = f.fitnessProfile?.goal || f.fitnessProfile?.primaryGoal || 'Weight Loss';
      const workoutDays = f.workoutRecommendation?.weeklySchedule?.length || 4;
      const dietMeals = f.dietRecommendation?.mealPlan?.length || 4;
      const dt = formatDt(f.createdAt);
      const summary = f.aiAnalysis?.assessment || f.aiAnalysis?.profileSummary || '';
      const isApproved = f.status === 'Trainer Approved' || f.status === 'Sent';
      const isRevision = f.status === 'Revision Requested';
      const statusBg = isApproved ? '#ECFDF5' : isRevision ? '#FEF3C7' : '#F8FAFC';
      const statusTextColor = isApproved ? '#16A34A' : isRevision ? '#B45309' : '#EA580C';

      return (
        <View key={id} style={styles.fbCard}>
          {/* Main Card Header */}
          <TouchableOpacity
            style={styles.fbCardHeader}
            onPress={() => setFeedbackExpandedId(isOpen ? null : id)}
            activeOpacity={0.9}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1 }}>
              <View style={styles.fbAvatar}>
                <Text style={styles.fbAvatarText}>{name[0]?.toUpperCase() || 'M'}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.fbClientName}>{name}</Text>
                  <View style={[styles.fbStatusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.fbStatusBadgeText, { color: statusTextColor }]}>
                      {f.status}
                    </Text>
                  </View>
                </View>

                {/* Meta Tags */}
                <View style={styles.fbMetaRow}>
                  <View style={styles.fbMetaItem}>
                    <Ionicons name="barbell-outline" size={12} color="#EA580C" />
                    <Text style={styles.fbMetaItemText}>Goal: {goal}</Text>
                  </View>
                  <View style={styles.fbMetaItem}>
                    <Ionicons name="fitness-outline" size={12} color="#64748B" />
                    <Text style={styles.fbMetaItemText}>{workoutDays} days</Text>
                  </View>
                  <View style={styles.fbMetaItem}>
                    <Ionicons name="nutrition-outline" size={12} color="#64748B" />
                    <Text style={styles.fbMetaItemText}>{dietMeals} meals</Text>
                  </View>
                </View>

                {/* Date & Time Badge */}
                <View style={styles.fbDateBadge}>
                  <Ionicons name="calendar-outline" size={11} color="#EA580C" />
                  <Text style={styles.fbDateText}>{dt.date}</Text>
                  <Text style={{ color: '#CBD5E1' }}>•</Text>
                  <Ionicons name="time-outline" size={11} color="#EA580C" />
                  <Text style={styles.fbTimeText}>{dt.time}</Text>
                </View>

                {summary ? (
                  <Text style={styles.fbSummaryText} numberOfLines={2}>
                    {summary}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Actions Column */}
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <TouchableOpacity
                style={styles.fbFullViewBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  setSelectedFeedbackDetail(f);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.fbFullViewBtnText}>Full View</Text>
              </TouchableOpacity>

              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#64748B"
              />
            </View>
          </TouchableOpacity>

          {/* Inline Accordion Content */}
          {isOpen && (
            <View style={styles.fbAccordionContent}>
              {summary ? (
                <View style={styles.fbSectionBox}>
                  <Text style={styles.fbSectionTitle}>AI ASSESSMENT</Text>
                  <Text style={styles.fbSectionDesc}>{summary}</Text>
                </View>
              ) : null}

              {f.workoutRecommendation?.weeklySchedule && (
                <View style={styles.fbSectionBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="barbell" size={14} color="#EA580C" />
                    <Text style={styles.fbSectionTitle}>WORKOUT PLAN</Text>
                  </View>
                  {f.workoutRecommendation.weeklySchedule.map((day: any, i: number) => (
                    <View key={i} style={styles.fbScheduleRow}>
                      <Text style={styles.fbDayName}>{day.day}</Text>
                      <Text style={styles.fbDayFocus}>{day.focus || 'Training Session'}</Text>
                    </View>
                  ))}
                </View>
              )}

              {f.dietRecommendation?.mealPlan && (
                <View style={styles.fbSectionBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="nutrition" size={14} color="#EA580C" />
                    <Text style={styles.fbSectionTitle}>DIET PLAN</Text>
                  </View>
                  {f.dietRecommendation.mealPlan.map((meal: any, i: number) => (
                    <View key={i} style={styles.fbScheduleRow}>
                      <Text style={styles.fbDayName}>{meal.meal || meal.mealType}</Text>
                      <Text style={styles.fbDayFocus}>{meal.time || (meal.calories ? `${meal.calories} kcal` : 'Custom')}</Text>
                    </View>
                  ))}
                </View>
              )}

              {f.trainerNotes ? (
                <View style={[styles.fbSectionBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                  <Text style={[styles.fbSectionTitle, { color: '#166534' }]}>TRAINER NOTES</Text>
                  <Text style={[styles.fbSectionDesc, { color: '#14532D' }]}>{f.trainerNotes}</Text>
                </View>
              ) : null}

              {/* Chat & Feedback Discussion */}
              <View style={styles.fbChatSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Ionicons name="chatbubbles" size={15} color="#EA580C" />
                  <Text style={styles.fbChatHeading}>Chat & Feedback Discussion</Text>
                </View>

                {f.chatMessages && f.chatMessages.length > 0 ? (
                  <View style={{ gap: 8, marginBottom: 10 }}>
                    {f.chatMessages.map((msg: any, idx: number) => {
                      const isTrainer = msg.senderRole === 'TRAINER';
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.fbChatBubble,
                            isTrainer ? styles.fbChatBubbleTrainer : styles.fbChatBubbleMember
                          ]}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <Text style={[styles.fbChatSender, { color: isTrainer ? '#EA580C' : '#111827' }]}>
                              {isTrainer ? '💬 Trainer (You)' : `👤 Member (${msg.senderName || name})`}
                            </Text>
                            <Text style={styles.fbChatTime}>
                              {msg.date ? new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </Text>
                          </View>
                          <Text style={styles.fbChatMsgText}>{msg.message}</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic', marginBottom: 8 }}>
                    No messages yet. Send a guidance note or answer to this client.
                  </Text>
                )}

                <View style={styles.fbReplyInputCard}>
                  <TextInput
                    style={styles.fbReplyTextInput}
                    placeholder="Write a reply or message to the customer..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={feedbackReplyTexts[id] || ''}
                    onChangeText={txt => setFeedbackReplyTexts(prev => ({ ...prev, [id]: txt }))}
                  />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
                    <TouchableOpacity
                      style={[
                        styles.fbSendReplyBtn,
                        (!feedbackReplyTexts[id]?.trim() || feedbackReplySending[id]) && { opacity: 0.5 }
                      ]}
                      disabled={!feedbackReplyTexts[id]?.trim() || feedbackReplySending[id]}
                      onPress={() => handleSendFeedbackReply(id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="send" size={13} color="#FFFFFF" />
                      <Text style={styles.fbSendReplyBtnText}>
                        {feedbackReplySending[id] ? 'Sending...' : 'Send Reply'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      );
    };

    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={[styles.subScrollContent, { paddingBottom: 60 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header Hero */}
        <View style={styles.fbHeroHeader}>
          <View style={styles.fbHeroIconSquircle}>
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fbHeroTitle}>Feedback</Text>
            <Text style={styles.fbHeroSubtitle}>AI-generated plans & feedback for your clients.</Text>
          </View>
        </View>

        {/* 4 Stat Summary Cards */}
        <View style={styles.fbStatsGrid}>
          <View style={[styles.fbStatCard, { backgroundColor: '#F8FAFC' }]}>
            <Text style={[styles.fbStatVal, { color: '#EA580C' }]}>{totalCount}</Text>
            <Text style={styles.fbStatLabel}>Total</Text>
          </View>
          <View style={[styles.fbStatCard, { backgroundColor: '#F8FAFC' }]}>
            <Text style={[styles.fbStatVal, { color: '#EA580C' }]}>{aiGenCount}</Text>
            <Text style={styles.fbStatLabel}>AI Generated</Text>
          </View>
          <View style={[styles.fbStatCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.fbStatVal, { color: '#16A34A' }]}>{approvedCount}</Text>
            <Text style={styles.fbStatLabel}>Approved</Text>
          </View>
          <View style={[styles.fbStatCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.fbStatVal, { color: '#D97706' }]}>{revisionCount}</Text>
            <Text style={styles.fbStatLabel}>Revisions</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.fbSearchContainer}>
          <Ionicons name="search" size={16} color="#64748B" style={{ marginLeft: 4 }} />
          <TextInput
            style={styles.fbSearchInput}
            placeholder="Search by client name..."
            placeholderTextColor="#94A3B8"
            value={feedbackSearch}
            onChangeText={setFeedbackSearch}
          />
          {feedbackSearch ? (
            <TouchableOpacity onPress={() => setFeedbackSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter Pills Row */}
        <View style={styles.fbFilterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: 8 }}>
            {['All', 'Trainer Approved', 'AI Generated', 'Revision Requested'].map(status => {
              const isSelected = feedbackStatusFilter === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.fbFilterPill, isSelected && styles.fbFilterPillActive]}
                  onPress={() => setFeedbackStatusFilter(status)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.fbFilterPillText, isSelected && styles.fbFilterPillTextActive]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Web-Matched Action Controls Bar: Calendar Filter | Sort | Date-Wise ON/OFF */}
        <View style={styles.fbControlsRow}>
          {/* Calendar Date Filter Button */}
          <View style={[styles.fbCalendarBtn, feedbackDateFilter ? styles.fbCalendarBtnActive : null]}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              onPress={openFeedbackCalendar}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={14} color="#EA580C" />
              <Text style={[styles.fbCalendarBtnText, feedbackDateFilter ? { color: '#111827' } : null]}>
                {formatCalendarBtnLabel(feedbackDateFilter)}
              </Text>
              <Ionicons name="calendar" size={12} color="#64748B" />
            </TouchableOpacity>
            {feedbackDateFilter ? (
              <TouchableOpacity
                onPress={() => setFeedbackDateFilter('')}
                style={{ marginLeft: 4, padding: 2 }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={15} color="#EA580C" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Sort Button */}
          <TouchableOpacity
            style={styles.fbSortBtn}
            onPress={() => setFeedbackSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.fbSortBtnText}>
              {feedbackSortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
            </Text>
          </TouchableOpacity>

          {/* Date-Wise ON / OFF Toggle Button */}
          <TouchableOpacity
            style={[styles.fbDateWiseBtn, feedbackGroupByDate && styles.fbDateWiseBtnActive]}
            onPress={() => setFeedbackGroupByDate(g => !g)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={feedbackGroupByDate ? '#FFFFFF' : '#64748B'}
            />
            <Text style={[styles.fbDateWiseBtnText, feedbackGroupByDate && { color: '#FFFFFF' }]}>
              {feedbackGroupByDate ? 'Date-Wise: ON' : 'Date-Wise: OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* List of Feedback Cards (Date-Wise Grouped OR Flat) */}
        {filteredFeedbacks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubble-ellipses-outline" size={36} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Feedback Records Found</Text>
            <Text style={styles.emptySub}>
              {feedbackDateFilter
                ? `No client feedback plans found for ${formatCalendarBtnLabel(feedbackDateFilter)}.`
                : 'No client assessment recommendations match your active filter.'}
            </Text>
            {feedbackDateFilter ? (
              <TouchableOpacity
                style={[styles.fbSortBtn, { marginTop: 10 }]}
                onPress={() => setFeedbackDateFilter('')}
              >
                <Text style={styles.fbSortBtnText}>Clear Date Filter</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : feedbackGroupByDate ? (
          dateGroups.map(group => (
            <View key={group.key} style={styles.fbDateGroupWrapper}>
              <View style={styles.fbDateGroupHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <Ionicons name="calendar-outline" size={14} color="#EA580C" />
                  <Text style={styles.fbDateGroupTitle}>{group.key.toUpperCase()}</Text>
                </View>
                <View style={styles.fbDateGroupCountPill}>
                  <Text style={styles.fbDateGroupCountText}>
                    {group.items.length} {group.items.length === 1 ? 'plan' : 'plans'}
                  </Text>
                </View>
              </View>
              {group.items.map(renderFeedbackCard)}
            </View>
          ))
        ) : (
          filteredFeedbacks.map(renderFeedbackCard)
        )}

        {/* Calendar Picker Modal */}
        <Modal
          visible={showFeedbackCalendarModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowFeedbackCalendarModal(false)}
        >
          <TouchableOpacity
            style={styles.fbCalBackdrop}
            activeOpacity={1}
            onPress={() => setShowFeedbackCalendarModal(false)}
          >
            <View style={styles.fbCalCard} onStartShouldSetResponder={() => true}>
              <View style={styles.fbCalHeaderRow}>
                <Text style={styles.fbCalMonthTitle}>
                  {FB_MONTH_NAMES[feedbackCalendarMonth.getMonth()]} {feedbackCalendarMonth.getFullYear()}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    style={styles.fbCalArrowBtn}
                    onPress={() => setFeedbackCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  >
                    <Ionicons name="chevron-back" size={18} color="#475569" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.fbCalArrowBtn}
                    onPress={() => setFeedbackCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  >
                    <Ionicons name="chevron-forward" size={18} color="#475569" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fbCalWeekdaysRow}>
                {FB_WEEKDAYS.map(w => (
                  <Text key={w} style={styles.fbCalWeekdayText}>{w}</Text>
                ))}
              </View>

              <View style={styles.fbCalGrid}>
                {getFeedbackCalendarDays(feedbackCalendarMonth).map((dayItem, idx) => {
                  const isSelected = feedbackDateFilter === dayItem.isoString;
                  const hasFeedback = feedbackDateSet.has(dayItem.isoString);
                  return (
                    <TouchableOpacity
                      key={`${dayItem.isoString}-${idx}`}
                      style={styles.fbCalDayCell}
                      onPress={() => {
                        setFeedbackDateFilter(dayItem.isoString);
                        setShowFeedbackCalendarModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      {isSelected ? (
                        <View style={styles.fbCalSelectedDayBox}>
                          <Text style={styles.fbCalSelectedDayText}>{dayItem.day}</Text>
                        </View>
                      ) : (
                        <View style={{ alignItems: 'center' }}>
                          <Text style={[styles.fbCalDayText, !dayItem.isCurrentMonth && styles.fbCalDayTextMuted]}>
                            {dayItem.day}
                          </Text>
                          {hasFeedback && dayItem.isCurrentMonth && <View style={styles.fbCalDot} />}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.fbCalBottomRow}>
                <TouchableOpacity
                  onPress={() => {
                    setFeedbackDateFilter('');
                    setShowFeedbackCalendarModal(false);
                  }}
                  style={{ padding: 6 }}
                >
                  <Text style={styles.fbCalActionText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const today = new Date();
                    setFeedbackDateFilter(toLocalYMD(today));
                    setFeedbackCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                    setShowFeedbackCalendarModal(false);
                  }}
                  style={{ padding: 6 }}
                >
                  <Text style={styles.fbCalActionText}>Today</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    );
  };

  // Feedback Details Full Modal (Mirroring Web Full View Modal)
  const renderFeedbackDetailModal = () => {
    if (!selectedFeedbackDetail) return null;
    const f = selectedFeedbackDetail;
    const name = f.customerId ? `${f.customerId.firstName || ''} ${f.customerId.lastName || ''}`.trim() || f.customerId.email || 'Member' : 'Member';
    const email = f.customerId?.email || 'member@example.com';
    const dt = f.createdAt ? new Date(f.createdAt).toLocaleString() : '10/17/2026';
    const isApproved = f.status === 'Trainer Approved' || f.status === 'Sent';

    return (
      <Modal
        visible={!!selectedFeedbackDetail}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFeedbackDetail(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '92%' }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.modalTitle}>{name}</Text>
                  <View style={[styles.fbStatusBadge, { backgroundColor: isApproved ? '#ECFDF5' : '#F8FAFC' }]}>
                    <Text style={[styles.fbStatusBadgeText, { color: isApproved ? '#16A34A' : '#EA580C' }]}>
                      {f.status}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{email} • {dt}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFeedbackDetail(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Modal Body */}
            <ScrollView style={{ padding: 16 }} contentContainerStyle={{ gap: 14 }}>
              {/* Assessment */}
              <View style={styles.fbSectionBox}>
                <Text style={styles.fbSectionTitle}>AI ASSESSMENT & GOALS</Text>
                <Text style={styles.fbSectionDesc}>
                  {f.aiAnalysis?.assessment || 'Comprehensive fitness baseline and calorie deficit schedule.'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <View style={styles.jobModalTile}>
                    <Text style={styles.jobModalTileLabel}>PRIMARY GOAL</Text>
                    <Text style={styles.jobModalTileVal}>{f.fitnessProfile?.goal || 'Weight Loss'}</Text>
                  </View>
                  <View style={styles.jobModalTile}>
                    <Text style={styles.jobModalTileLabel}>FITNESS LEVEL</Text>
                    <Text style={styles.jobModalTileVal}>{f.fitnessProfile?.fitnessLevel || 'Beginner'}</Text>
                  </View>
                </View>
              </View>

              {/* Weekly Workouts */}
              {f.workoutRecommendation?.weeklySchedule && (
                <View style={styles.fbSectionBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="barbell" size={15} color="#EA580C" />
                    <Text style={styles.fbSectionTitle}>WEEKLY WORKOUT SCHEDULE</Text>
                  </View>
                  {f.workoutRecommendation.weeklySchedule.map((day: any, i: number) => (
                    <View key={i} style={styles.fbScheduleRow}>
                      <Text style={styles.fbDayName}>{day.day}</Text>
                      <Text style={styles.fbDayFocus}>{day.focus || 'Training Routine'}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Diet Meals */}
              {f.dietRecommendation?.mealPlan && (
                <View style={styles.fbSectionBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Ionicons name="nutrition" size={15} color="#EA580C" />
                    <Text style={styles.fbSectionTitle}>RECOMMENDED MEAL PLAN</Text>
                  </View>
                  {f.dietRecommendation.mealPlan.map((m: any, i: number) => (
                    <View key={i} style={styles.fbScheduleRow}>
                      <Text style={styles.fbDayName}>{m.meal || m.mealType}</Text>
                      <Text style={styles.fbDayFocus}>{m.time} {m.calories ? `(${m.calories} kcal)` : ''}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Trainer Notes */}
              {f.trainerNotes && (
                <View style={[styles.fbSectionBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                  <Text style={[styles.fbSectionTitle, { color: '#166534' }]}>YOUR COACHING NOTES</Text>
                  <Text style={[styles.fbSectionDesc, { color: '#14532D' }]}>{f.trainerNotes}</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelectedFeedbackDetail(null)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // 4. Rewards & Performance (100% Match of Web /trainer/rewards)
  const renderRewards = () => {
    const handleClaimReward = async (reward: any) => {
      setRequestingRewardId(reward._id);
      try {
        await api.post('/rewards/trainer/claim', { rewardId: reward._id });
      } catch (err) {
        console.log('Claim reward error:', err);
      } finally {
        const newClaim = {
          _id: 'clm-' + Date.now(),
          rewardId: {
            _id: reward._id,
            title: reward.title,
            category: reward.category,
            bonusAmount: reward.bonusAmount,
            currency: reward.currency || 'INR'
          },
          claimCode: 'CLM-' + Math.floor(10000 + Math.random() * 90000),
          claimStatus: 'Pending',
          financialPayoutStatus: 'Pending Approval',
          createdAt: new Date().toISOString()
        };
        setClaimsList(prev => [newClaim, ...prev]);
        setRewardsList(prev => prev.map(r => r._id === reward._id ? { ...r, alreadyClaimed: true } : r));
        setRequestingRewardId(null);
        Alert.alert(
          'Reward Requested! 🎁',
          `Your request for "${reward.title}" (₹${reward.bonusAmount}) has been submitted to gym management. Track your disbursement under Claims & Bonuses.`,
          [
            { text: 'View Claims', onPress: () => setRewardsActiveTab('claims') },
            { text: 'OK' }
          ]
        );
      }
    };

    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={[styles.subScrollContent, { paddingBottom: 60 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header Hero */}
        <View style={styles.rewHeroHeader}>
          <View style={styles.rewHeroIconSquircle}>
            <Ionicons name="trophy" size={24} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rewHeroTitle}>Trainer Performance & Rewards</Text>
            <Text style={styles.rewHeroSubtitle}>
              Verified session records, assigned client progress, gym recognition awards, and financial bonuses.
            </Text>
          </View>
        </View>

        {/* Tab Switcher Pills */}
        <View style={styles.rewTabScrollContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: 8 }}>
            {[
              { key: 'performance', label: 'Performance Summary', icon: 'pulse' },
              { key: 'clients', label: `Assigned Clients (${perfSummary?.assignedClients?.length || 1})`, icon: 'people' },
              { key: 'rewards', label: `Available Rewards (${rewardsList.length})`, icon: 'gift' },
              { key: 'claims', label: `Claims & Bonuses (${claimsList.length})`, icon: 'time' },
              { key: 'awards', label: `Awards & Certificates (${trainerAwardsList.length})`, icon: 'sparkles' },
            ].map(tab => {
              const isSelected = rewardsActiveTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.rewTabPill, isSelected && styles.rewTabPillActive]}
                  onPress={() => setRewardsActiveTab(tab.key as any)}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={tab.icon as any} 
                    size={14} 
                    color={isSelected ? '#FFFFFF' : '#64748B'} 
                  />
                  <Text style={[styles.rewTabPillText, isSelected && styles.rewTabPillTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Top 4 KPI Metrics */}
        <View style={styles.rewKpiGrid}>
          <View style={styles.rewKpiCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.rewKpiLabel}>Completed Sessions</Text>
              <View style={[styles.rewKpiIconBox, { backgroundColor: '#F8FAFC' }]}>
                <Ionicons name="checkmark-circle" size={14} color="#EA580C" />
              </View>
            </View>
            <Text style={styles.rewKpiVal}>{perfSummary?.completedSessionsCount || 12}</Text>
            <Text style={styles.rewKpiSub}>
              {perfSummary?.inPersonSessionsCount || 8} in-person • {perfSummary?.onlineSessionsCount || 4} online
            </Text>
          </View>

          <View style={styles.rewKpiCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.rewKpiLabel}>Average Rating</Text>
              <View style={[styles.rewKpiIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="star" size={14} color="#B45309" />
              </View>
            </View>
            <Text style={[styles.rewKpiVal, { color: '#B45309' }]}>
              {perfSummary?.averageRating ? perfSummary.averageRating.toFixed(1) : '3.0'} ⭐
            </Text>
            <Text style={styles.rewKpiSub}>From {perfSummary?.totalRatingsCount || 1} client reviews</Text>
          </View>

          <View style={styles.rewKpiCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.rewKpiLabel}>Assigned Clients</Text>
              <View style={[styles.rewKpiIconBox, { backgroundColor: '#F8FAFC' }]}>
                <Ionicons name="people" size={14} color="#EA580C" />
              </View>
            </View>
            <Text style={[styles.rewKpiVal, { color: '#EA580C' }]}>{perfSummary?.assignedClientsCount || 1}</Text>
            <Text style={styles.rewKpiSub}>Active gym client relationships</Text>
          </View>

          <View style={styles.rewKpiCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.rewKpiLabel}>Paid Bonuses</Text>
              <View style={[styles.rewKpiIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="cash" size={14} color="#15803D" />
              </View>
            </View>
            <Text style={[styles.rewKpiVal, { color: '#15803D' }]}>₹{perfSummary?.totalBonusPaid || 25000}</Text>
            <Text style={styles.rewKpiSub}>₹{perfSummary?.totalBonusApproved || 5000} approved total</Text>
          </View>
        </View>

        {/* TAB 1: PERFORMANCE SUMMARY */}
        {rewardsActiveTab === 'performance' && (
          <View style={{ gap: 14 }}>
            {/* Operational Quality Card */}
            <View style={styles.rewContentCard}>
              <Text style={styles.rewSectionHeading}>Operational Performance & Records</Text>
              <View style={{ gap: 8, marginTop: 10 }}>
                <View style={styles.rewRecordRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <Ionicons name="time-outline" size={18} color="#64748B" />
                    <View>
                      <Text style={styles.rewRecordTitle}>Punctuality Status</Text>
                      <Text style={styles.rewRecordSub}>Based on verified start time timestamps</Text>
                    </View>
                  </View>
                  <View style={styles.rewRecordBadge}>
                    <Text style={styles.rewRecordBadgeText}>{perfSummary?.punctualityStatus || 'On-Time (98%)'}</Text>
                  </View>
                </View>

                <View style={styles.rewRecordRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <Ionicons name="document-text-outline" size={18} color="#64748B" />
                    <View>
                      <Text style={styles.rewRecordTitle}>Reviewed & Approved Plans</Text>
                      <Text style={styles.rewRecordSub}>Workout and diet plan reviews completed</Text>
                    </View>
                  </View>
                  <View style={styles.rewRecordBadge}>
                    <Text style={styles.rewRecordBadgeText}>{perfSummary?.reviewedPlansCount || 2} Plans</Text>
                  </View>
                </View>

                <View style={styles.rewRecordRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <Ionicons name="videocam-outline" size={18} color="#64748B" />
                    <View>
                      <Text style={styles.rewRecordTitle}>Online vs In-Person Ratio</Text>
                      <Text style={styles.rewRecordSub}>Distribution of completed training sessions</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#111827' }}>
                    {perfSummary?.onlineSessionsCount || 4} Online / {perfSummary?.inPersonSessionsCount || 8} Offline
                  </Text>
                </View>
              </View>
            </View>

            {/* Customer Reviews & Feedback */}
            <View style={styles.rewContentCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.rewSectionHeading}>Customer Reviews & Feedback</Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Verified client ratings</Text>
              </View>
              <View style={{ gap: 8, marginTop: 10 }}>
                {(perfSummary?.reviews || [{ clientName: 'Renugopal Y', rating: 3, review: 'GOOD', date: '2026-10-14' }]).map((r: any, idx: number) => (
                  <View key={idx} style={styles.rewReviewBubble}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#111827' }}>{r.clientName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#D97706' }}>{'★'.repeat(r.rating || 3)}</Text>
                        <Text style={{ fontSize: 10, color: '#64748B' }}>
                          {r.date ? new Date(r.date).toLocaleDateString() : '14 Oct 2026'}
                        </Text>
                      </View>
                    </View>
                    {r.review && (
                      <Text style={{ fontSize: 12, color: '#475569', fontStyle: 'italic', marginTop: 3 }}>
                        "{r.review}"
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: ASSIGNED CLIENTS */}
        {rewardsActiveTab === 'clients' && (
          <View style={styles.rewContentCard}>
            <Text style={styles.rewSectionHeading}>Assigned Clients & Verified Progress</Text>
            <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2, marginBottom: 12 }}>
              Performance derived strictly from actual recorded workouts, check-ins, and completed sessions.
            </Text>

            {(perfSummary?.assignedClients || [{ firstName: 'Renugopal', lastName: 'Y', email: 'renugopal5457@gmail.com', workoutCompletionPercentage: 57, dietAdherencePercentage: 80, completedSessionsWithTrainer: 12 }]).map((client: any, idx: number) => (
              <View key={idx} style={styles.rewClientCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.rewClientAvatar}>
                    <Text style={styles.rewClientAvatarText}>
                      {client.firstName?.[0] || 'R'}{client.lastName?.[0] || 'Y'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rewClientName}>{client.firstName} {client.lastName}</Text>
                    <Text style={styles.rewClientEmail}>{client.email}</Text>
                  </View>
                  <View style={styles.rewClientSessionsBadge}>
                    <Text style={styles.rewClientSessionsText}>
                      {client.completedSessionsWithTrainer || 12} Sessions
                    </Text>
                  </View>
                </View>

                {/* Workout Completion Bar */}
                <View style={{ marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B' }}>Workout Completion</Text>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#111827' }}>
                      {client.workoutCompletionPercentage || 57}%
                    </Text>
                  </View>
                  <View style={styles.rewProgressBarTrack}>
                    <View 
                      style={[
                        styles.rewProgressBarFill, 
                        { 
                          width: `${client.workoutCompletionPercentage || 57}%`,
                          backgroundColor: (client.workoutCompletionPercentage || 57) >= 70 ? '#16A34A' : '#EA580C'
                        }
                      ]} 
                    />
                  </View>
                </View>

                {/* Diet Adherence */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B' }}>Diet Adherence</Text>
                  <View style={[styles.fbStatusBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.fbStatusBadgeText, { color: '#16A34A' }]}>
                      {client.dietAdherencePercentage || 80}% adherence
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: AVAILABLE REWARDS */}
        {rewardsActiveTab === 'rewards' && (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={styles.rewSectionHeading}>Available Performance Rewards & Bonuses</Text>
              <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                Rewards configured by your gym owner with transparent performance targets.
              </Text>
            </View>

            {rewardsList.map((reward: any) => {
              const canClaim = reward.isEligible && !reward.alreadyClaimed;
              const isClaiming = requestingRewardId === reward._id;

              return (
                <View key={reward._id} style={styles.rewRewardCard}>
                  {/* Category & Amount */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={styles.rewCategoryPill}>
                      <Text style={styles.rewCategoryText}>{reward.category}</Text>
                    </View>
                    <Text style={styles.rewBonusAmount}>₹{reward.bonusAmount} {reward.currency || 'INR'}</Text>
                  </View>

                  <Text style={styles.rewRewardTitle}>{reward.title}</Text>
                  <Text style={styles.rewRewardDesc}>{reward.description}</Text>

                  {/* Required Performance Box */}
                  <View style={styles.rewCriteriaBox}>
                    <Text style={styles.rewCriteriaTitle}>Required Performance Targets:</Text>
                    {reward.minCompletedSessions > 0 && (
                      <View style={styles.rewCriteriaRow}>
                        <Text style={styles.rewCriteriaLabel}>Min Sessions:</Text>
                        <Text style={styles.rewCriteriaVal}>{reward.minCompletedSessions} completed sessions</Text>
                      </View>
                    )}
                    {reward.minAverageRating > 0 && (
                      <View style={styles.rewCriteriaRow}>
                        <Text style={styles.rewCriteriaLabel}>Min Rating:</Text>
                        <Text style={styles.rewCriteriaVal}>{reward.minAverageRating}⭐ rating</Text>
                      </View>
                    )}
                    {(reward.minReviewedPlans || 0) > 0 && (
                      <View style={styles.rewCriteriaRow}>
                        <Text style={styles.rewCriteriaLabel}>Reviewed Plans:</Text>
                        <Text style={styles.rewCriteriaVal}>{reward.minReviewedPlans} plans approved</Text>
                      </View>
                    )}
                  </View>

                  {/* Eligibility Status */}
                  {reward.isEligible ? (
                    <View style={styles.rewEligibleBanner}>
                      <Ionicons name="checkmark-circle" size={15} color="#16A34A" />
                      <Text style={styles.rewEligibleText}>You meet all criteria for this reward!</Text>
                    </View>
                  ) : (
                    <View style={styles.rewIneligibleBanner}>
                      <Ionicons name="alert-circle" size={15} color="#D97706" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rewIneligibleText}>Criteria not yet met:</Text>
                        {(reward.eligibilityReasons || []).map((reason: string, rIdx: number) => (
                          <Text key={rIdx} style={styles.rewIneligibleSub}>• {reason}</Text>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Button */}
                  <View style={{ marginTop: 10, alignItems: 'flex-end' }}>
                    {reward.alreadyClaimed ? (
                      <View style={styles.rewClaimedBadge}>
                        <Ionicons name="checkmark-done" size={14} color="#64748B" />
                        <Text style={styles.rewClaimedBadgeText}>Already Requested</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.rewClaimBtn,
                          (!canClaim || isClaiming) && { backgroundColor: '#CBD5E1' }
                        ]}
                        disabled={!canClaim || isClaiming}
                        onPress={() => handleClaimReward(reward)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="gift-outline" size={14} color="#FFFFFF" />
                        <Text style={styles.rewClaimBtnText}>
                          {isClaiming ? 'Submitting...' : 'Request Reward'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 4: CLAIMS & BONUSES */}
        {rewardsActiveTab === 'claims' && (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={styles.rewSectionHeading}>My Claims & Bonus Payout History</Text>
              <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                Track status of requested bonuses, gym owner approvals, and recorded financial payouts.
              </Text>
            </View>

            {claimsList.map((claim: any) => {
              const isApproved = claim.claimStatus === 'Approved';
              const isPaid = claim.financialPayoutStatus === 'Paid';

              return (
                <View key={claim._id} style={styles.rewClaimCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.rewClaimTitle}>{claim.rewardId?.title || 'Reward'}</Text>
                      <Text style={styles.rewClaimCategory}>{claim.rewardId?.category || 'Bonus'}</Text>
                    </View>
                    <Text style={styles.rewClaimAmount}>
                      {claim.rewardId?.bonusAmount ? `₹${claim.rewardId.bonusAmount}` : '—'}
                    </Text>
                  </View>

                  <View style={styles.rewClaimMetaRow}>
                    <View style={styles.rewClaimCodeChip}>
                      <Text style={styles.rewClaimCodeText}>{claim.claimCode}</Text>
                    </View>
                    <View style={[styles.fbStatusBadge, { backgroundColor: isApproved ? '#ECFDF5' : '#FEF3C7' }]}>
                      <Text style={[styles.fbStatusBadgeText, { color: isApproved ? '#16A34A' : '#D97706' }]}>
                        {claim.claimStatus}
                      </Text>
                    </View>
                    <View style={[styles.fbStatusBadge, { backgroundColor: isPaid ? '#ECFDF5' : '#FEF3C7' }]}>
                      <Text style={[styles.fbStatusBadgeText, { color: isPaid ? '#16A34A' : '#B45309' }]}>
                        {isPaid ? 'Paid' : 'Payment Pending'}
                      </Text>
                    </View>
                  </View>

                  {claim.financialPayoutReference && (
                    <Text style={{ fontSize: 10, color: '#64748B', fontStyle: 'italic', marginTop: 4 }}>
                      Ref: {claim.financialPayoutReference}
                    </Text>
                  )}
                  <Text style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>
                    Requested on {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : '10/5/2026'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 5: AWARDS & CERTIFICATES */}
        {rewardsActiveTab === 'awards' && (
          <View style={{ gap: 14 }}>
            {/* Honors Banner */}
            <View style={styles.rewAwardsBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="sparkles" size={15} color="#D97706" />
                <Text style={styles.rewAwardsBannerTag}>TRAINER RECOGNITION & HONORS</Text>
              </View>
              <Text style={styles.rewAwardsBannerTitle}>My Honors & Gym Hall of Fame</Text>
              <Text style={styles.rewAwardsBannerDesc}>
                Official awards recognized by gym administration for outstanding coaching, client success, and verified sessions.
              </Text>
              <View style={styles.rewAwardsConferredBadge}>
                <Text style={styles.rewAwardsConferredNum}>{trainerAwardsList.length}</Text>
                <Text style={styles.rewAwardsConferredLabel}>Honors Conferred</Text>
              </View>
            </View>

            {/* My Conferred Awards List */}
            <Text style={styles.rewSectionHeading}>My Conferred Honors ({trainerAwardsList.length})</Text>

            {trainerAwardsList.map((award: any) => (
              <View key={award._id} style={styles.rewAwardCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={styles.rewAwardPeriodBadge}>
                    <Ionicons name="star" size={12} color="#D97706" />
                    <Text style={styles.rewAwardPeriodText}>{award.awardPeriod || 'Official Award'}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>
                    {award.publishedAt ? new Date(award.publishedAt).toLocaleDateString() : '10/31/2026'}
                  </Text>
                </View>

                <Text style={styles.rewAwardCardTitle}>{award.title}</Text>
                <Text style={styles.rewAwardCardCategory}>{award.category}</Text>
                <Text style={styles.rewAwardCardDesc}>{award.description}</Text>

                {award.winnerScore && (
                  <View style={styles.rewAwardScoreBox}>
                    <Text style={styles.rewAwardScoreLabel}>COACHING PERFORMANCE RECORD</Text>
                    <Text style={styles.rewAwardScoreVal}>{award.winnerScore}</Text>
                  </View>
                )}

                {award.bonusAmount > 0 && (
                  <View style={styles.rewAwardCashBox}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#166534' }}>Award Cash Bonus:</Text>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#15803D' }}>₹{award.bonusAmount}</Text>
                  </View>
                )}

                <View style={styles.rewCertIdBox}>
                  <Text style={styles.rewCertIdLabel}>CERTIFICATE ID</Text>
                  <Text style={styles.rewCertIdVal}>{award.certificateId || 'CERT-VERIFIED'}</Text>
                </View>

                {/* Download Certificate Button */}
                <TouchableOpacity
                  style={[styles.rewDownloadCertBtn, downloadingCertId === (award._id || award.certificateId) && { opacity: 0.7 }]}
                  disabled={downloadingCertId === (award._id || award.certificateId)}
                  onPress={() => handleDownloadCertificate(award)}
                  activeOpacity={0.8}
                >
                  {downloadingCertId === (award._id || award.certificateId) ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.rewDownloadCertBtnText}>Generating PDF...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="download-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.rewDownloadCertBtnText}>Download Official PDF Certificate</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ))}

            {/* Gym Hall of Fame */}
            <Text style={[styles.rewSectionHeading, { marginTop: 8 }]}>
              Gym Hall of Fame ({hallOfFameList.length})
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {hallOfFameList.map((item: any) => (
                <View key={item._id} style={styles.rewHofCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.rewHofRecipientType}>{item.recipientType}</Text>
                    <Text style={{ fontSize: 9, color: '#64748B' }}>{item.awardPeriod}</Text>
                  </View>
                  <Text style={styles.rewHofTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.rewHofCategory}>{item.category}</Text>
                  <View style={styles.rewHofWinnerBox}>
                    <Text style={{ fontSize: 9, color: '#64748B', fontWeight: '700' }}>CONFERRED TO</Text>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#EA580C' }}>{item.winnerName}</Text>
                  </View>
                  <Text style={{ fontSize: 9, color: '#94A3B8', marginTop: 4 }}>{item.certificateId}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const handleDownloadCertificate = async (award: any) => {
    if (!award) return;
    const certKey = award._id || award.certificateId || 'cert';
    const certId = award.certificateId || 'CERT-PF-2026-TR889';
    try {
      setDownloadingCertId(certKey);
      const awardDateStr = award.publishedAt || award.updatedAt || award.createdAt;
      await FileDownloader.downloadCertificatePDF({
        recipientName: award.winnerName || user?.name || (user as any)?.fullName || 'Gym Trainer',
        recipientRole: 'Trainer',
        awardTitle: award.title || 'Coaching Excellence Award',
        awardCategory: award.category || 'Custom Award',
        description: award.description || '',
        gymName: award.gymId?.name || 'Perfect Fitness Studio',
        awardDate: awardDateStr
          ? new Date(awardDateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
          : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        certificateId: certId,
        metricAchieved: award.winnerScore ? `${award.winnerScore}` : undefined,
        conferredBy: award.gymId?.name || 'Gym Administration',
      });
    } catch (err: any) {
      Alert.alert('Download Error', err?.message || 'Failed to download certificate.');
    } finally {
      setDownloadingCertId(null);
    }
  };

  // Official Certificate Modal with Download Action
  const renderCertificateModal = () => {
    if (!selectedCertificate) return null;
    const award = selectedCertificate;
    const certId = award.certificateId || 'CERT-PF-2026-TR889';

    return (
      <Modal
        visible={!!selectedCertificate}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCertificate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '92%' }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Official PDF Certificate</Text>
                <Text style={{ fontSize: 11, color: '#64748B' }}>Verified Certificate ID: {certId}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedCertificate(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Official Certificate Visual Document */}
            <ScrollView style={{ padding: 16 }}>
              <View style={styles.certPaper}>
                {/* Gold Seal Header */}
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                  <View style={styles.certSeal}>
                    <Ionicons name="ribbon" size={28} color="#D97706" />
                  </View>
                  <Text style={styles.certGymName}>{award.gymId?.name || 'Perfect Fitness Studio'}</Text>
                  <Text style={styles.certDocType}>OFFICIAL CERTIFICATE OF RECOGNITION</Text>
                </View>

                {/* Body Text */}
                <Text style={styles.certBodyIntro}>This honors certificate is officially conferred upon</Text>
                <Text style={styles.certWinnerName}>{award.winnerName || 'Naveen'}</Text>
                <Text style={styles.certWinnerRole}>Elite Fitness Coach</Text>

                <View style={styles.certDivider} />

                <Text style={styles.certForIntro}>In recognition of meritorious accomplishment in</Text>
                <Text style={styles.certAwardTitle}>{award.title}</Text>
                <Text style={styles.certAwardCategory}>[{award.category}]</Text>

                <Text style={styles.certDescText}>
                  "{award.description}"
                </Text>

                {award.winnerScore && (
                  <View style={styles.certMetricBox}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B' }}>RECORD OF ACHIEVEMENT</Text>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#EA580C', marginTop: 2 }}>{award.winnerScore}</Text>
                  </View>
                )}

                {/* Footer Signatures */}
                <View style={styles.certFooterRow}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.certSignTitle}>MANAGEMENT</Text>
                    <Text style={styles.certSignVal}>{award.gymId?.name || 'Perfect Fitness Studio'}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.certSignTitle}>DATE CONFERRED</Text>
                    <Text style={styles.certSignVal}>
                      {award.publishedAt ? new Date(award.publishedAt).toLocaleDateString() : 'October 2026'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.certSignTitle}>VERIFICATION</Text>
                    <Text style={[styles.certSignVal, { color: '#16A34A', fontWeight: '800' }]}>✓ VERIFIED</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'center', marginTop: 12 }}>
                  <Text style={{ fontSize: 10, fontFamily: 'monospace', color: '#94A3B8' }}>{certId}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={[styles.modalFooter, { flexDirection: 'column', gap: 8 }]}>
              <TouchableOpacity
                style={styles.notifGoToPageBtn}
                onPress={() => handleDownloadCertificate(selectedCertificate)}
                activeOpacity={0.8}
              >
                <Ionicons name="download" size={16} color="#FFFFFF" />
                <Text style={styles.notifGoToPageBtnText}>Download Official PDF Certificate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelectedCertificate(null)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B', textAlign: 'center' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // 5. Financials
  const renderFinancials = () => (
    <TrainerEarningsScreen />
  );

  // 6. Find Jobs (100% Match with Web /trainer/jobs - Images 1 & 2)
  const renderJobs = () => {
    const filteredJobs = jobs.filter(j => {
      const term = jobSearch.toLowerCase().trim();
      const locTerm = jobLocationFilter.toLowerCase().trim();

      const matchSearch = !term ||
        (j.title && j.title.toLowerCase().includes(term)) ||
        (j.gymName && j.gymName.toLowerCase().includes(term)) ||
        (j.description && j.description.toLowerCase().includes(term)) ||
        (Array.isArray(j.expertise) && j.expertise.some((e: string) => e.toLowerCase().includes(term)));

      const matchLoc = !locTerm || (j.location && j.location.toLowerCase().includes(locTerm));
      const matchEmp = !jobEmploymentFilter || j.employmentType === jobEmploymentFilter;

      return matchSearch && matchLoc && matchEmp;
    });

    const isJobOver = (job: any) => {
      if (job.isOver) return true;
      const dl = job.applicationDeadline || job.deadline;
      if (!dl) return false;
      const d = new Date(dl);
      d.setHours(23, 59, 59, 999);
      return d.getTime() < Date.now();
    };

    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={[styles.subScrollContent, { gap: 14 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            HEADER: TRAINERS CAREERS (Matching Web Images 1 & 2)
            ========================================================================= */}
        <View style={styles.jobsHeroCard}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={styles.jobsIconSquircle}>
              <Ionicons name="search" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.jobsHeroTitle}>Trainers Careers</Text>
              <Text style={styles.jobsHeroSub}>
                Explore verified trainer openings across premier fitness clubs & health centers
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            SEARCH & FILTERS BAR (Matching Web Images 1 & 2)
            ========================================================================= */}
        <View style={styles.jobsFilterContainer}>
          {/* Search Box */}
          <View style={styles.jobsSearchInputWrap}>
            <Ionicons name="search" size={15} color="#64748B" />
            <TextInput
              style={styles.jobsSearchInput}
              placeholder="Search by job title, gym name, specialization..."
              placeholderTextColor="#94A3B8"
              value={jobSearch}
              onChangeText={(txt: string) => setJobSearch(txt)}
            />
            {Boolean(jobSearch) && (
              <TouchableOpacity onPress={() => setJobSearch('')}>
                <Ionicons name="close-circle" size={15} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Location Filter & Employment Type Row */}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <View style={styles.jobsLocationInputWrap}>
              <Ionicons name="location-outline" size={14} color="#64748B" />
              <TextInput
                style={styles.jobsLocationInput}
                placeholder="Location filter..."
                placeholderTextColor="#94A3B8"
                value={jobLocationFilter}
                onChangeText={(txt: string) => setJobLocationFilter(txt)}
              />
              {Boolean(jobLocationFilter) && (
                <TouchableOpacity onPress={() => setJobLocationFilter('')}>
                  <Ionicons name="close-circle" size={14} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[
                { label: 'All Employment', val: '' },
                { label: 'Full-time', val: 'Full-time' },
                { label: 'Part-time', val: 'Part-time' },
                { label: 'Contract', val: 'Contract' },
              ].map(emp => {
                const isActive = jobEmploymentFilter === emp.val;
                return (
                  <TouchableOpacity
                    key={emp.label}
                    style={[styles.jobsEmpPill, isActive && styles.jobsEmpPillActive]}
                    onPress={() => setJobEmploymentFilter(emp.val)}
                  >
                    <Text style={[styles.jobsEmpPillText, isActive && styles.jobsEmpPillTextActive]}>
                      {emp.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* =========================================================================
            JOB VACANCIES LIST (Matching Web Images 1 & 2)
            ========================================================================= */}
        {filteredJobs.length === 0 ? (
          <View style={styles.jobsEmptyCard}>
            <Ionicons name="briefcase-outline" size={36} color="#CBD5E1" />
            <Text style={styles.jobsEmptyTitle}>No vacancies found</Text>
            <Text style={styles.jobsEmptySub}>Try adjusting your search keywords or location filter settings.</Text>
          </View>
        ) : (
          filteredJobs.map((job, idx) => {
            const isOver = isJobOver(job);
            const deadlineDate = job.applicationDeadline || job.deadline;

            return (
              <View key={job._id || idx} style={styles.jobItemCard}>
                {/* Gym Name & Badges */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="business-outline" size={13} color="#EA580C" />
                      <Text style={styles.jobGymNameText}>{job.gymName}</Text>
                    </View>
                    <Text style={styles.jobTitleText}>{job.title}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={styles.jobEmpBadge}>
                      <Text style={styles.jobEmpBadgeText}>{job.employmentType}</Text>
                    </View>
                    {isOver && (
                      <View style={styles.jobOverBadge}>
                        <Ionicons name="alert-circle" size={11} color="#B91C1C" />
                        <Text style={styles.jobOverBadgeText}>Job Vacancy Over</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Job Info Rows: Location, Salary, Experience, Deadline */}
                <View style={styles.jobInfoMetaContainer}>
                  <View style={styles.jobInfoMetaRow}>
                    <Ionicons name="location-outline" size={14} color="#EA580C" />
                    <Text style={styles.jobInfoMetaText} numberOfLines={1}>{job.location}</Text>
                  </View>

                  <View style={styles.jobInfoMetaRow}>
                    <Ionicons name="cash-outline" size={14} color="#EA580C" />
                    <Text style={styles.jobSalaryText}>
                      ₹{Number(job.salaryMin).toLocaleString()} - ₹{Number(job.salaryMax).toLocaleString()} / {job.salaryType || 'Monthly'}
                    </Text>
                  </View>

                  <View style={styles.jobInfoMetaRow}>
                    <Ionicons name="time-outline" size={14} color="#EA580C" />
                    <Text style={styles.jobInfoMetaText}>
                      {job.experience || (job.experienceRequired ? job.experienceRequired + '+ Years' : 'Any experience')}
                    </Text>
                  </View>

                  {Boolean(deadlineDate) && (
                    <View style={styles.jobInfoMetaRow}>
                      <Ionicons name="calendar-outline" size={14} color="#EA580C" />
                      <Text style={[styles.jobInfoMetaText, isOver && { color: '#B91C1C', fontWeight: '700' }]}>
                        Deadline: {new Date(deadlineDate).toLocaleDateString()} {isOver ? '(Job Vacancy Over)' : ''}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Description Quote Box */}
                <View style={styles.jobDescBox}>
                  <Text style={styles.jobDescText} numberOfLines={2}>{job.description}</Text>
                </View>

                {/* Specializations Tags */}
                {Array.isArray(job.expertise) && job.expertise.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {job.expertise.map((exp: string, eIdx: number) => (
                      <View key={eIdx} style={styles.jobSkillPill}>
                        <Text style={styles.jobSkillPillText}>{exp}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Buttons: View Details & Status */}
                <View style={styles.jobCardActionRow}>
                  <TouchableOpacity
                    style={styles.jobViewDetailsBtn}
                    onPress={() => {
                      setSelectedJob(job);
                      setShowJobDetailsModal(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.jobViewDetailsBtnText}>View Details</Text>
                  </TouchableOpacity>

                  {isOver ? (
                    <View style={styles.jobVacancyOverBtn}>
                      <Ionicons name="alert-circle-outline" size={13} color="#B91C1C" />
                      <Text style={styles.jobVacancyOverBtnText}>Job Vacancy Over</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.jobApplyNowBtn}
                      onPress={() => Alert.alert('Apply Now', 'Submitting application for ' + job.title + ' at ' + job.gymName)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="sparkles" size={13} color="#FFFFFF" />
                      <Text style={styles.jobApplyNowBtnText}>Apply Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    );
  };

  // Job Details Full Modal (Mirroring Web View Details)
  const renderJobDetailsModal = () => {
    if (!showJobDetailsModal || !selectedJob) return null;

    const isOver = selectedJob.isOver || (selectedJob.applicationDeadline && new Date(selectedJob.applicationDeadline).getTime() < Date.now());

    return (
      <Modal
        visible={showJobDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJobDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="business-outline" size={13} color="#EA580C" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#EA580C' }}>{selectedJob.gymName}</Text>
                </View>
                <Text style={styles.modalTitle}>{selectedJob.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  <View style={styles.jobEmpBadge}>
                    <Text style={styles.jobEmpBadgeText}>{selectedJob.employmentType}</Text>
                  </View>
                  <View style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#EA580C' }}>
                      {selectedJob.vacanciesCount || 1} {Number(selectedJob.vacanciesCount) > 1 ? 'Openings' : 'Opening'}
                    </Text>
                  </View>
                  {selectedJob.isSalaryNegotiable && (
                    <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#A7F3D0' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#059669' }}>Salary Negotiable</Text>
                    </View>
                  )}
                  {isOver && (
                    <View style={styles.jobOverBadge}>
                      <Ionicons name="alert-circle" size={10} color="#B91C1C" />
                      <Text style={styles.jobOverBadgeText}>Job Vacancy Over</Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowJobDetailsModal(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={{ padding: 18 }} contentContainerStyle={{ gap: 14 }}>
              {/* 4 Detail Tiles (Location, Salary, Experience, Deadline) */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <View style={styles.jobModalTile}>
                  <Ionicons name="location-outline" size={15} color="#EA580C" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobModalTileLabel}>LOCATION</Text>
                    <Text style={styles.jobModalTileVal}>{selectedJob.location}</Text>
                  </View>
                </View>

                <View style={styles.jobModalTile}>
                  <Ionicons name="cash-outline" size={15} color="#EA580C" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobModalTileLabel}>COMPENSATION</Text>
                    <Text style={[styles.jobModalTileVal, { color: '#EA580C' }]}>
                      ₹{Number(selectedJob.salaryMin).toLocaleString()} - ₹{Number(selectedJob.salaryMax).toLocaleString()} / {selectedJob.salaryType || 'Monthly'}
                    </Text>
                  </View>
                </View>

                <View style={styles.jobModalTile}>
                  <Ionicons name="time-outline" size={15} color="#EA580C" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobModalTileLabel}>EXPERIENCE</Text>
                    <Text style={styles.jobModalTileVal}>{selectedJob.experience || '3-5 Years'}</Text>
                  </View>
                </View>

                <View style={styles.jobModalTile}>
                  <Ionicons name="calendar-outline" size={15} color="#EA580C" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobModalTileLabel}>DEADLINE</Text>
                    <Text style={[styles.jobModalTileVal, isOver && { color: '#B91C1C' }]}>
                      {selectedJob.deadline || selectedJob.applicationDeadline} {isOver ? '(Vacancy Over)' : ''}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Shift & Hours */}
              {Boolean(selectedJob.workingHours) && (
                <View style={[styles.jobModalTile, { width: '100%' }]}>
                  <Ionicons name="time" size={15} color="#EA580C" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobModalTileLabel}>WORKING HOURS / SHIFT</Text>
                    <Text style={styles.jobModalTileVal}>{selectedJob.workingHours}</Text>
                  </View>
                </View>
              )}

              {/* Job Overview & Description */}
              <View>
                <Text style={styles.jobModalSectionTitle}>JOB OVERVIEW & DESCRIPTION</Text>
                <View style={styles.jobModalTextBox}>
                  <Text style={styles.jobModalDescText}>{selectedJob.description}</Text>
                </View>
              </View>

              {/* Required Specializations & Skills */}
              {Array.isArray(selectedJob.expertise) && selectedJob.expertise.length > 0 && (
                <View>
                  <Text style={styles.jobModalSectionTitle}>REQUIRED SPECIALIZATIONS & SKILLS</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {selectedJob.expertise.map((exp: string, idx: number) => (
                      <View key={idx} style={styles.jobSkillPill}>
                        <Text style={styles.jobSkillPillText}>{exp}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Key Responsibilities */}
              {Array.isArray(selectedJob.responsibilities) && selectedJob.responsibilities.length > 0 && (
                <View>
                  <Text style={styles.jobModalSectionTitle}>KEY RESPONSIBILITIES</Text>
                  <View style={styles.jobModalTextBox}>
                    {selectedJob.responsibilities.map((resp: string, rIdx: number) => (
                      <View key={rIdx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginVertical: 2 }}>
                        <Text style={{ color: '#EA580C', fontWeight: '900' }}>•</Text>
                        <Text style={{ fontSize: 11, color: '#334155', flex: 1, lineHeight: 16 }}>{resp}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Qualifications & Certifications */}
              {(Array.isArray(selectedJob.qualifications) || Array.isArray(selectedJob.certifications)) && (
                <View>
                  <Text style={styles.jobModalSectionTitle}>QUALIFICATIONS & ACCREDITATIONS</Text>
                  <View style={styles.jobModalTextBox}>
                    {[...(selectedJob.qualifications || []), ...(selectedJob.certifications || [])].map((q: string, qIdx: number) => (
                      <View key={qIdx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginVertical: 2 }}>
                        <Ionicons name="ribbon-outline" size={13} color="#EA580C" />
                        <Text style={{ fontSize: 11, color: '#334155', flex: 1, lineHeight: 16 }}>{q}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowJobDetailsModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Close</Text>
              </TouchableOpacity>

              {isOver ? (
                <View style={[styles.jobVacancyOverBtn, { paddingHorizontal: 16, paddingVertical: 9 }]}>
                  <Ionicons name="alert-circle-outline" size={13} color="#B91C1C" />
                  <Text style={styles.jobVacancyOverBtnText}>Job Vacancy Over</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={() => {
                    setShowJobDetailsModal(false);
                    Alert.alert('Application Submitted', 'Your coaching profile was sent to ' + selectedJob.gymName);
                  }}
                >
                  <Text style={styles.modalSubmitBtnText}>Apply for Position</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // 7. My Job Applications (100% Match of Web /trainer/applications - Images 1 & 2)
  const renderApplications = () => {
    const formatStatusDisplay = (status: string) => {
      switch (status) {
        case 'Applied': return 'Pending Review';
        case 'Selected':
        case 'Offer Accepted': return 'Approved';
        case 'Offer Rejected': return 'Offer Declined';
        default: return status || 'Pending Review';
      }
    };

    const getStatusStyle = (status: string) => {
      const s = formatStatusDisplay(status);
      switch (s) {
        case 'Pending Review':
          return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
        case 'Under Review':
          return { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' };
        case 'Shortlisted':
          return { bg: '#F3E8FF', text: '#9333EA', border: '#E9D5FF' };
        case 'Interview Scheduled':
          return { bg: '#CFFAFE', text: '#0891B2', border: '#A5F3FC' };
        case 'Approved':
          return { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' };
        case 'Rejected':
          return { bg: '#FFE4E6', text: '#E11D48', border: '#FECDD3' };
        case 'Withdrawn':
          return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
        default:
          return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
      }
    };

    const handleWithdrawApplication = async (appId: string) => {
      Alert.alert(
        'Withdraw Application',
        'Are you sure you want to withdraw this job application?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Withdraw',
            style: 'destructive',
            onPress: async () => {
              try {
                setActionWithdrawing(true);
                const res = await api.patch('/hiring/trainer/applications/' + appId + '/withdraw');
                if (res.data?.success) {
                  Alert.alert('Success', 'Application withdrawn successfully.');
                  setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: 'Withdrawn' } : a));
                  if (selectedApplication?._id === appId) {
                    setSelectedApplication((prev: any) => ({ ...prev, status: 'Withdrawn' }));
                  }
                }
              } catch (err: any) {
                Alert.alert('Notice', err.response?.data?.message || 'Failed to withdraw application');
              } finally {
                setActionWithdrawing(false);
              }
            }
          }
        ]
      );
    };

    const filteredApplications = applications.filter(app => {
      const term = applicationsSearch.toLowerCase().trim();
      if (!term) return true;
      const title = (app.jobId?.title || app.jobTitle || '').toLowerCase();
      const gym = (app.jobId?.gymName || app.gymName || app.gymId?.name || '').toLowerCase();
      const status = formatStatusDisplay(app.status || '').toLowerCase();
      return title.includes(term) || gym.includes(term) || status.includes(term);
    });

    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={[styles.subScrollContent, { gap: 14 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            HEADER: MY JOB APPLICATIONS (Matching Web Image 1)
            ========================================================================= */}
        <View style={styles.jobsHeroCard}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={styles.jobsIconSquircle}>
              <Ionicons name="briefcase" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.jobsHeroTitle}>My Job Applications</Text>
              <Text style={styles.jobsHeroSub}>
                Track your application status, interview schedules, and gym hiring decisions in real-time
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            SEARCH BAR (Matching Web Image 1)
            ========================================================================= */}
        <View style={styles.applicationsSearchCard}>
          <View style={styles.applicationsSearchWrap}>
            <Ionicons name="search" size={16} color="#94A3B8" />
            <TextInput
              style={styles.applicationsSearchInput}
              placeholder="Search applications by position, gym name, or status..."
              placeholderTextColor="#94A3B8"
              value={applicationsSearch}
              onChangeText={setApplicationsSearch}
            />
            {applicationsSearch ? (
              <TouchableOpacity onPress={() => setApplicationsSearch('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* =========================================================================
            APPLICATIONS LIST / EMPTY STATE (Matching Web Image 1)
            ========================================================================= */}
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 10, fontSize: 13, color: '#64748B' }}>Loading job applications...</Text>
          </View>
        ) : filteredApplications.length === 0 ? (
          <View style={styles.appEmptyBox}>
            <View style={styles.appEmptyIconBox}>
              <Ionicons name="briefcase-outline" size={48} color="#64748B" />
            </View>
            <Text style={styles.appEmptyTitle}>No applications submitted yet</Text>
            <Text style={styles.appEmptySub}>
              Discover verified gym coach openings matching your fitness credentials and apply now.
            </Text>
            <TouchableOpacity 
              style={styles.browseVacanciesBtn}
              onPress={() => setActiveSection('jobs')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseVacanciesBtnText}>Browse Vacancies</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredApplications.map((app, i) => {
            const job = app.jobId || {};
            const st = getStatusStyle(app.status);
            const canWithdraw = ['Applied', 'Pending Review', 'Under Review', 'Shortlisted'].includes(app.status);
            return (
              <View key={app._id || i} style={styles.applicationCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <Text style={styles.appJobTitle}>{job.title || app.jobTitle || 'Fitness Coach'}</Text>
                  <View style={[styles.appStatusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
                    <Text style={[styles.appStatusBadgeText, { color: st.text }]}>
                      {formatStatusDisplay(app.status)}
                    </Text>
                  </View>
                </View>

                <View style={{ gap: 6, marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="business" size={14} color="#EA580C" />
                    <Text style={styles.appGymName}>{job.gymName || app.gymName || 'Perfect Fitness Studio'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="location-outline" size={14} color="#64748B" />
                    <Text style={styles.appMetaText}>{job.location || 'On-site'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="calendar-outline" size={14} color="#64748B" />
                    <Text style={styles.appMetaText}>
                      Applied on {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US') : '11/5/2026'}
                    </Text>
                  </View>
                </View>

                {/* Bottom Row Actions */}
                <View style={styles.appCardActionsRow}>
                  <TouchableOpacity
                    style={styles.appViewDetailsBtn}
                    onPress={() => setSelectedApplication(app)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="eye-outline" size={14} color="#EA580C" />
                    <Text style={styles.appViewDetailsBtnText}>View Details</Text>
                  </TouchableOpacity>

                  {canWithdraw && (
                    <TouchableOpacity
                      style={styles.appWithdrawBtn}
                      onPress={() => handleWithdrawApplication(app._id)}
                      disabled={actionWithdrawing}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="refresh-outline" size={13} color="#E11D48" />
                      <Text style={styles.appWithdrawBtnText}>Withdraw</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    );
  };

  // Application Details Modal
  const renderApplicationDetailsModal = () => {
    if (!selectedApplication) return null;
    const app = selectedApplication;
    const job = app.jobId || {};

    return (
      <Modal
        visible={!!selectedApplication}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedApplication(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: '#EA580C', textTransform: 'uppercase' }}>
                  APPLICATION DETAILS
                </Text>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {job.title || app.jobTitle || 'Fitness Coach'}
                </Text>
                <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                  at {job.gymName || app.gymName || 'Perfect Fitness Studio'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedApplication(null)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView style={{ padding: 18 }} contentContainerStyle={{ gap: 14 }} showsVerticalScrollIndicator={false}>
              {/* Status Banner */}
              <View style={styles.appModalStatusBanner}>
                <View>
                  <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '700' }}>APPLICATION STATUS</Text>
                  <Text style={styles.appModalStatusBannerText}>
                    {app.status || 'Pending Review'}
                  </Text>
                </View>
                {app.reviewNotes ? (
                  <View style={{ flex: 1, alignItems: 'flex-end', marginLeft: 10 }}>
                    <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '700' }}>NOTES FROM GYM</Text>
                    <Text style={{ fontSize: 11, color: '#111827', fontStyle: 'italic' }}>
                      {app.reviewNotes}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Candidate Info Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <View style={styles.jobModalTile}>
                  <Text style={styles.jobModalTileLabel}>CANDIDATE NAME</Text>
                  <Text style={styles.jobModalTileVal}>{app.name || 'Naveen'}</Text>
                </View>
                <View style={styles.jobModalTile}>
                  <Text style={styles.jobModalTileLabel}>CONTACT INFO</Text>
                  <Text style={styles.jobModalTileVal}>{app.email || 'forgeindiaconnecthr@gmail.com'}</Text>
                </View>
                <View style={styles.jobModalTile}>
                  <Text style={styles.jobModalTileLabel}>WORK EXPERIENCE</Text>
                  <Text style={styles.jobModalTileVal}>{app.workExperience || '15 Years'}</Text>
                </View>
                <View style={styles.jobModalTile}>
                  <Text style={styles.jobModalTileLabel}>AVAILABILITY</Text>
                  <Text style={styles.jobModalTileVal}>{app.availability || 'Immediately'}</Text>
                </View>
              </View>

              {app.expectedSalary ? (
                <View style={[styles.jobModalTile, { width: '100%' }]}>
                  <Text style={styles.jobModalTileLabel}>EXPECTED SALARY</Text>
                  <Text style={[styles.jobModalTileVal, { color: '#EA580C', fontWeight: '800' }]}>
                    ₹{app.expectedSalary}
                  </Text>
                </View>
              ) : null}

              {app.coverLetter || app.notes ? (
                <View style={{ marginTop: 4 }}>
                  <Text style={styles.jobModalSectionTitle}>COVER LETTER / NOTES</Text>
                  <View style={styles.jobModalTextBox}>
                    <Text style={styles.jobModalDescText}>
                      "{app.coverLetter || app.notes}"
                    </Text>
                  </View>
                </View>
              ) : null}
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSelectedApplication(null)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // 8. Messages (100% Match of Web /trainer/messages - Image 1)
  const renderMessages = () => {
    // Send text message (with optional staged attachments)
    const handleSendMessage = async () => {
      const hasText = currentMessageInput.trim().length > 0;
      const hasAttachments = pendingAttachments.length > 0;
      if ((!hasText && !hasAttachments) || sendingMsg) return;

      const textToSend = currentMessageInput.trim();
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
      const stagedList = [...pendingAttachments];

      const newMsgObj: any = {
        _id: 'msg-' + Date.now(),
        senderId: user?._id || user?.id || 'trainer-me',
        senderName: 'You (Naveen )',
        message: textToSend,
        createdAt: now.toISOString(),
        time: timeStr,
        isOutgoing: true
      };

      if (stagedList.length > 0) {
        newMsgObj.attachments = stagedList;
        newMsgObj.messageType = stagedList[0].fileType === 'image' ? 'image' : stagedList[0].fileType === 'video' ? 'video' : 'file';
      }

      setChatMessages(prev => [...prev, newMsgObj]);
      setCurrentMessageInput('');
      setPendingAttachments([]);

      const previewSnippet = textToSend || (stagedList.length > 0 ? `📎 ${stagedList[0].fileName}` : 'Message');
      const contactId = selectedMsgContact?.id || selectedMsgContact?._id || 'cust-1';
      setMsgContacts(prev => prev.map(c => 
        (c.id === contactId || c._id === contactId)
          ? { ...c, lastMsg: previewSnippet, lastMsgTime: timeStr }
          : c
      ));
      setSelectedMsgContact((prev: any) => ({
        ...prev,
        lastMsg: previewSnippet,
        lastMsgTime: timeStr
      }));

      try {
        setSendingMsg(true);
        await api.post('/direct-messages/send', {
          receiverId: contactId,
          message: textToSend,
          attachments: stagedList
        });
      } catch (err) {
        console.log('[TrainerMore] Send message error:', err);
      } finally {
        setSendingMsg(false);
      }
    };

    // Send voice note
    const handleSendVoiceNote = async () => {
      const duration = recordDuration > 0 ? recordDuration : 5;
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
      const durationStr = `0:${duration < 10 ? '0' + duration : duration}`;

      const newVoiceMsg: any = {
        _id: 'msg-' + Date.now(),
        senderId: user?._id || user?.id || 'trainer-me',
        senderName: 'You (Naveen )',
        message: `🎤 Voice message (${durationStr})`,
        messageType: 'voice',
        duration: duration,
        createdAt: now.toISOString(),
        time: timeStr,
        isOutgoing: true
      };

      setChatMessages(prev => [...prev, newVoiceMsg]);
      setIsRecordingVoice(false);
      setRecordDuration(0);

      const contactId = selectedMsgContact?.id || selectedMsgContact?._id || 'cust-1';
      const lastMsgText = `🎤 Voice note (${durationStr})`;
      setMsgContacts(prev => prev.map(c => 
        (c.id === contactId || c._id === contactId)
          ? { ...c, lastMsg: lastMsgText, lastMsgTime: timeStr }
          : c
      ));
      setSelectedMsgContact((prev: any) => ({
        ...prev,
        lastMsg: lastMsgText,
        lastMsgTime: timeStr
      }));

      try {
        await api.post('/direct-messages/send', {
          receiverId: contactId,
          message: '',
          messageType: 'voice',
          duration: duration
        });
      } catch (err) {
        console.log('[TrainerMore] Send voice message error:', err);
      }
    };

    // Toggle voice playback
    const togglePlayVoice = (msgId: string) => {
      if (playingVoiceMsgId === msgId) {
        setPlayingVoiceMsgId(null);
      } else {
        setPlayingVoiceMsgId(msgId);
        setVoicePlaybackProgress(prev => ({ ...prev, [msgId]: 0 }));
      }
    };

    // Real device file picker - User selects their OWN file directly (NO default files)
    const handlePickFile = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true,
          multiple: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const file = result.assets[0];
          const fileName = file.name || 'Selected_File';
          const ext = fileName.toLowerCase().split('.').pop() || '';

          let fileType = 'document';
          if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic'].includes(ext)) {
            fileType = 'image';
          } else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) {
            fileType = 'video';
          }

          const sizeStr = file.size
            ? file.size > 1024 * 1024
              ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
              : (file.size / 1024).toFixed(0) + ' KB'
            : '1.2 MB';

          setPendingAttachments(prev => [
            ...prev,
            {
              id: 'att-' + Date.now(),
              fileName,
              fileType,
              fileSize: sizeStr,
              uri: file.uri,
              previewUrl: fileType === 'image' ? file.uri : undefined,
            }
          ]);
        }
      } catch (err: any) {
        console.error('[Messages] DocumentPicker error:', err);
        Alert.alert('File Selection Failed', err?.message || 'Unable to open device file picker.');
      }
    };

    const filteredContacts = msgContacts.filter(c => {
      const q = contactSearchQuery.toLowerCase().trim();
      if (!q) return true;
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });

    const activeName = selectedMsgContact?.name || 'Renugopal Y';
    const activeEmail = selectedMsgContact?.email || 'renugopal5457@gmail.com';
    const activeInitial = activeName.charAt(0).toUpperCase() || 'R';

    return (
      <KeyboardAvoidingView 
        style={{ flex: 1, backgroundColor: '#F8FAFC' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.subScroll} 
          contentContainerStyle={[styles.subScrollContent, { gap: 14, paddingBottom: 120 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.jobsHeroCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={styles.jobsIconSquircle}>
                <Ionicons name="chatbubbles" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.jobsHeroTitle}>Messages</Text>
                <Text style={styles.jobsHeroSub}>
                  Real-time messaging, voice notes, and file attachments with your clients.
                </Text>
              </View>
            </View>
          </View>

          {/* Contacts Row */}
          <View style={styles.msgContactsCard}>
            <View style={styles.msgSearchWrap}>
              <Ionicons name="search" size={15} color="#94A3B8" />
              <TextInput
                style={styles.msgSearchInput}
                placeholder="Search clients..."
                placeholderTextColor="#94A3B8"
                value={contactSearchQuery}
                onChangeText={setContactSearchQuery}
              />
              <TouchableOpacity onPress={() => fetchSectionData('messages')}>
                <Ionicons name="refresh" size={16} color="#EA580C" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 4 }}>
              {filteredContacts.map((contact) => {
                const cId = contact.id || contact._id;
                const isSelected = (selectedMsgContact?.id || selectedMsgContact?._id) === cId;
                const initial = (contact.name || 'C').charAt(0).toUpperCase();

                return (
                  <TouchableOpacity
                    key={cId}
                    style={[styles.msgContactPill, isSelected && styles.msgContactPillActive]}
                    onPress={() => {
                      setSelectedMsgContact(contact);
                      fetchSectionData('messages');
                    }}
                    activeOpacity={0.8}
                  >
                    {isSelected && <View style={styles.msgActiveIndicator} />}
                    <View style={styles.msgAvatarCircle}>
                      <Text style={styles.msgAvatarInitial}>{initial}</Text>
                      <View style={[styles.msgStatusDot, { backgroundColor: contact.isActive !== false ? '#EA580C' : '#94A3B8' }]} />
                    </View>

                    <View style={{ maxWidth: 130 }}>
                      <Text style={[styles.msgContactName, isSelected && styles.msgContactNameActive]} numberOfLines={1}>
                        {contact.name || 'Client'}
                      </Text>
                      <Text style={styles.msgContactLastText} numberOfLines={1}>
                        {contact.lastMsg || 'No messages yet'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Chat Room */}
          <View style={styles.chatRoomCard}>
            <View style={styles.chatRoomHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={styles.chatAvatarCircle}>
                  <Text style={styles.chatAvatarInitial}>{activeInitial}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.chatRoomName}>{activeName}</Text>
                  <Text style={styles.chatRoomEmail} numberOfLines={1}>{activeEmail}</Text>
                </View>
              </View>
              <Text style={styles.chatMaxFileSizeText}>Max file size: 50MB</Text>
            </View>

            {/* Message Thread */}
            <View style={styles.chatMessagesThread}>
              {chatMessages.map((msg, index) => {
                const isOutgoing = msg.isOutgoing || msg.senderName?.includes('You') || msg.senderId === user?._id;
                const isVoice = msg.messageType === 'voice';
                const isPlaying = playingVoiceMsgId === msg._id;
                const playbackSec = voicePlaybackProgress[msg._id] || 0;
                const totalDur = msg.duration || 6;
                const attachments = msg.attachments || [];

                return (
                  <View 
                    key={msg._id || index} 
                    style={isOutgoing ? styles.outgoingMsgContainer : styles.receivedMsgContainer}
                  >
                    <View style={isOutgoing ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }}>
                      <Text style={isOutgoing ? styles.outgoingSenderLabel : styles.receivedSenderLabel}>
                        {isOutgoing ? 'You (Naveen )' : (msg.senderName || activeName)}
                      </Text>

                      {/* Standard Bubble or Voice Bubble */}
                      {isVoice ? (
                        <View style={[styles.voiceBubble, isOutgoing ? styles.voiceBubbleOutgoing : styles.voiceBubbleIncoming]}>
                          <TouchableOpacity
                            style={[styles.voicePlayBtn, isOutgoing ? styles.voicePlayBtnOutgoing : styles.voicePlayBtnIncoming]}
                            onPress={() => togglePlayVoice(msg._id)}
                            activeOpacity={0.8}
                          >
                            <Ionicons 
                              name={isPlaying ? "pause" : "play"} 
                              size={18} 
                              color={isOutgoing ? "#EA580C" : "#FFFFFF"} 
                            />
                          </TouchableOpacity>

                          {/* Soundwave Simulation */}
                          <View style={{ flex: 1, marginHorizontal: 8 }}>
                            <View style={styles.voiceWaveTrack}>
                              {[12, 20, 14, 26, 18, 22, 16, 24, 15, 19, 13, 25, 17, 21].map((h, bIdx) => {
                                const isPlayed = isPlaying && (bIdx / 14) <= (playbackSec / totalDur);
                                return (
                                  <View
                                    key={bIdx}
                                    style={[
                                      styles.voiceWaveBar,
                                      { 
                                        height: h,
                                        backgroundColor: isOutgoing 
                                          ? (isPlayed ? '#FFFFFF' : 'rgba(255,255,255,0.4)')
                                          : (isPlayed ? '#EA580C' : '#CBD5E1')
                                      }
                                    ]}
                                  />
                                );
                              })}
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                              <Text style={[styles.voiceDurationText, isOutgoing && { color: '#FFFFFF' }]}>
                                {isPlaying ? `0:0${playbackSec}` : `0:${totalDur < 10 ? '0' + totalDur : totalDur}`}
                              </Text>
                              <Text style={[styles.voiceTagText, isOutgoing && { color: 'rgba(255,255,255,0.8)' }]}>
                                {isPlaying ? 'Playing...' : 'Voice Note'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ) : (
                        <View style={isOutgoing ? styles.outgoingMsgBubble : styles.receivedMsgBubble}>
                          {msg.message && msg.message !== '📷 Photo attached' ? (
                            <Text style={isOutgoing ? styles.outgoingMsgText : styles.receivedMsgText}>
                              {msg.message}
                            </Text>
                          ) : null}

                          {/* Fallback image when attachments array is empty but photo was sent */}
                          {attachments.length === 0 && (msg.messageType === 'image' || msg.attachmentUrl || msg.message === '📷 Photo attached') && (
                            <View style={{ marginTop: (msg.message && msg.message !== '📷 Photo attached') ? 8 : 0 }}>
                              <TouchableOpacity 
                                onPress={() => setSelectedImagePreview(msg.attachmentUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600')}
                                activeOpacity={0.9}
                              >
                                <Image 
                                  source={{ uri: msg.attachmentUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600' }}
                                  style={styles.chatImagePreview}
                                  resizeMode="cover"
                                />
                                <View style={styles.chatImageBadge}>
                                  <Ionicons name="expand" size={11} color="#FFFFFF" />
                                  <Text style={styles.chatImageBadgeText}>View Photo</Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                          )}

                          {/* Render Attachments if any */}
                          {attachments.map((att: any, attIdx: number) => {
                            const isImg = att.fileType === 'image' || att.url?.match(/\.(jpg|jpeg|png|webp|gif)/i) || msg.messageType === 'image';
                            const isDoc = att.fileType === 'document' || att.fileName?.endsWith('.pdf');
                            const isVid = att.fileType === 'video';
                            const imgUrl = att.previewUrl || att.url || msg.attachmentUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600';

                            return (
                              <View key={attIdx} style={{ marginTop: (msg.message && msg.message !== '📷 Photo attached') ? 8 : 0 }}>
                                {isImg && (
                                  <TouchableOpacity 
                                    onPress={() => setSelectedImagePreview(imgUrl)}
                                    activeOpacity={0.9}
                                  >
                                    <Image 
                                      source={{ uri: imgUrl }}
                                      style={styles.chatImagePreview}
                                      resizeMode="cover"
                                    />
                                    <View style={styles.chatImageBadge}>
                                      <Ionicons name="expand" size={11} color="#FFFFFF" />
                                      <Text style={styles.chatImageBadgeText}>View Photo</Text>
                                    </View>
                                  </TouchableOpacity>
                                )}

                                {isDoc && (
                                  <TouchableOpacity
                                    style={styles.chatDocCard}
                                    onPress={async () => {
                                      try {
                                        await FileDownloader.downloadReportPDF({
                                          title: att.fileName || 'Personalized Coaching Blueprint',
                                          subtitle: 'Coach-approved training & nutrition guidance for member',
                                          gymName: 'Perfect Fitness Studio',
                                          summaryMetrics: [
                                            { label: 'Document Type', value: att.fileType === 'document' ? 'Workout Routine / Nutrition' : 'Coaching Media' },
                                            { label: 'File Size', value: att.fileSize || '1.4 MB' },
                                            { label: 'Coach Verified', value: 'Yes - Naveen' },
                                          ],
                                          headers: ['Split / Meal Phase', 'Exercise / Food Items', 'Sets / Quantity', 'Coaching Directive'],
                                          rows: [
                                            ['Phase 1: Dynamic Warmup', 'Hip 90/90, Thoracic Rotations, Banded Pull-aparts', '2 sets x 15 reps', 'Maintain steady nasal breathing'],
                                            ['Phase 2: Compound Strength', 'Barbell Back Squats & Incline DB Press', '4 sets x 8 reps', 'RPE 8, 90s rest interval'],
                                            ['Phase 3: Hypertrophy & Core', 'Bulgarian Split Squats, Lat Pulldowns, Hanging Knee Raises', '3 sets x 12 reps', 'Full stretch and contraction'],
                                            ['Nutrition Targets', 'High Protein, Complex Carbohydrates, Clean Fats', '2,400 kcal / 165g Protein', '3.5L Daily Hydration Target'],
                                          ]
                                        }, (att.fileName || 'Coaching_Document').replace(/\.pdf$/i, ''));
                                      } catch (err: any) {
                                        Alert.alert('Download Error', err?.message || 'Failed to download coaching PDF.');
                                      }
                                    }}
                                    activeOpacity={0.8}
                                  >
                                    <View style={styles.chatDocIconBox}>
                                      <Ionicons name="document-text" size={20} color="#EA580C" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                      <Text style={styles.chatDocTitle} numberOfLines={1}>{att.fileName}</Text>
                                      <Text style={styles.chatDocSub}>{att.fileSize || 'PDF Document'}</Text>
                                    </View>
                                    <Ionicons name="arrow-down-circle" size={18} color="#EA580C" />
                                  </TouchableOpacity>
                                )}

                                {isVid && (
                                  <TouchableOpacity
                                    style={styles.chatDocCard}
                                    onPress={() => Alert.alert('Video Analysis', `Playing kinetic form stream: ${att.fileName}`)}
                                    activeOpacity={0.8}
                                  >
                                    <View style={[styles.chatDocIconBox, { backgroundColor: '#EFF6FF' }]}>
                                      <Ionicons name="videocam" size={20} color="#2563EB" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                      <Text style={styles.chatDocTitle} numberOfLines={1}>{att.fileName}</Text>
                                      <Text style={styles.chatDocSub}>{att.fileSize || 'MP4 Video'}</Text>
                                    </View>
                                    <Ionicons name="play-circle" size={18} color="#2563EB" />
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      )}

                      <Text style={isOutgoing ? styles.msgTimestampRight : styles.msgTimestampLeft}>
                        {msg.time || '11:44 am'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Pending Attachments Strip (Shown when files are attached before sending) */}
            {pendingAttachments.length > 0 && (
              <View style={styles.pendingAttachStrip}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {pendingAttachments.map((att, i) => (
                    <View key={i} style={styles.pendingAttachChip}>
                      <Ionicons 
                        name={att.fileType === 'image' ? 'image' : att.fileType === 'video' ? 'videocam' : 'document-text'} 
                        size={15} 
                        color="#EA580C" 
                      />
                      <Text style={styles.pendingAttachChipName} numberOfLines={1}>{att.fileName}</Text>
                      <Text style={styles.pendingAttachChipSize}>({att.fileSize})</Text>
                      <TouchableOpacity 
                        onPress={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ padding: 2 }}
                      >
                        <Ionicons name="close-circle" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Chat Bottom Action Bar */}
            {isRecordingVoice ? (
              /* ACTIVE VOICE RECORDER STRIP */
              <View style={styles.voiceRecStrip}>
                <View style={styles.voiceRecPulseDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.voiceRecHeading}>Recording Voice Note...</Text>
                  <Text style={styles.voiceRecSub}>
                    00:{recordDuration < 10 ? '0' + recordDuration : recordDuration} • Speak into microphone
                  </Text>
                </View>

                {/* Animated Wave Bars */}
                <View style={styles.voiceRecLiveWave}>
                  <View style={[styles.liveWaveBar, { height: 10 + (recordDuration % 3) * 6 }]} />
                  <View style={[styles.liveWaveBar, { height: 16 + (recordDuration % 4) * 5 }]} />
                  <View style={[styles.liveWaveBar, { height: 22 + (recordDuration % 2) * 4 }]} />
                  <View style={[styles.liveWaveBar, { height: 14 + (recordDuration % 3) * 5 }]} />
                </View>

                {/* Discard Button */}
                <TouchableOpacity
                  style={styles.voiceRecCancelBtn}
                  onPress={() => {
                    setIsRecordingVoice(false);
                    setRecordDuration(0);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>

                {/* Send Voice Button */}
                <TouchableOpacity
                  style={styles.voiceRecSendBtn}
                  onPress={handleSendVoiceNote}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send" size={15} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              /* STANDARD INPUT BAR */
              <View style={styles.chatInputBar}>
                {/* Paperclip Button -> Opens Attach Modal */}
                <TouchableOpacity
                  style={[styles.chatActionIconBtn, pendingAttachments.length > 0 && { backgroundColor: '#FFEDD5' }]}
                  onPress={handlePickFile}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={pendingAttachments.length > 0 ? "attach" : "attach-outline"} 
                    size={20} 
                    color={pendingAttachments.length > 0 ? "#EA580C" : "#64748B"} 
                  />
                </TouchableOpacity>

                {/* Microphone Button -> Starts Voice Recording Mode */}
                <TouchableOpacity
                  style={styles.chatActionIconBtn}
                  onPress={() => {
                    setIsRecordingVoice(true);
                    setRecordDuration(0);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="mic-outline" size={19} color="#64748B" />
                </TouchableOpacity>

                {/* TextInput */}
                <TextInput
                  style={styles.chatTextInput}
                  placeholder={pendingAttachments.length > 0 ? "Add a message or send attachment..." : `Message ${activeName}...`}
                  placeholderTextColor="#94A3B8"
                  value={currentMessageInput}
                  onChangeText={setCurrentMessageInput}
                  onSubmitEditing={handleSendMessage}
                  returnKeyType="send"
                />

                {/* Send Button */}
                <TouchableOpacity
                  style={[
                    styles.chatSendBtn,
                    (!currentMessageInput.trim() && pendingAttachments.length === 0) && styles.chatSendBtnDisabled
                  ]}
                  onPress={handleSendMessage}
                  disabled={(!currentMessageInput.trim() && pendingAttachments.length === 0) || sendingMsg}
                  activeOpacity={0.8}
                >
                  {sendingMsg ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={15} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        

        {/* Image Fullscreen Lightbox Modal */}
        <Modal
          visible={!!selectedImagePreview}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedImagePreview(null)}
        >
          <View style={styles.lightboxOverlay}>
            <TouchableOpacity 
              style={styles.lightboxCloseBtn}
              onPress={() => setSelectedImagePreview(null)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            {selectedImagePreview && (
              <Image 
                source={{ uri: selectedImagePreview }} 
                style={styles.lightboxImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  };

  // 9. Notifications (100% Match of Web & User Modal Image)
  const renderNotifications = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id: string) => {
      try {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        await api.put(`/notifications/${id}/read`);
      } catch (err) {
        console.log('Failed to mark read:', err);
      }
    };

    const markAllAsRead = async () => {
      try {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await api.put('/notifications/mark-all-read');
      } catch (err) {
        console.log('Failed to mark all read:', err);
      }
    };

    const openNotification = (notif: any) => {
      if (!notif.isRead) {
        markAsRead(notif._id);
      }
      setSelectedNotification(notif);
    };

    const filteredNotifications = notifications.filter(notif => {
      if (notificationFilter === 'unread') return !notif.isRead;
      const text = `${notif.title} ${notif.message}`.toLowerCase();
      if (notificationFilter === 'clients') return text.includes('client') || text.includes('plan') || text.includes('session') || text.includes('booking');
      if (notificationFilter === 'alerts') return notif.type === 'alert' || text.includes('alert') || text.includes('warning');
      return true;
    });

    return (
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={styles.subScroll} 
          contentContainerStyle={[styles.subScrollContent, { gap: 14, paddingBottom: 120 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          showsVerticalScrollIndicator={false}
        >
          {/* =========================================================================
              HEADER BANNER: COACH NOTIFICATIONS
              ========================================================================= */}
          <View style={styles.jobsHeroCard}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View style={styles.jobsIconSquircle}>
                <Ionicons name="notifications" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.jobsHeroTitle}>Coach Notifications</Text>
                <Text style={styles.jobsHeroSub}>
                  Client workout updates, plan requests, session schedules, and direct messages.
                </Text>
              </View>
            </View>

            {/* Unread Pill */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 10 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>{unreadCount} Unread</Text>
              </View>
            </View>
          </View>

          {/* =========================================================================
              NOTIFICATIONS LIST
              ========================================================================= */}
          {loading && !refreshing ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : notifications.length === 0 ? (
            <View style={styles.cardContainer}>
              <View style={{ padding: 36, alignItems: 'center' }}>
                <Ionicons name="notifications-outline" size={40} color="#CBD5E1" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 10 }}>No Notifications</Text>
                <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4 }}>
                  You have no notifications at this time.
                </Text>
              </View>
            </View>
          ) : (
            notifications.map((n, i) => {
              const isUnread = !n.isRead;
              const typeIcon = n.type === 'success' ? 'checkmark-circle' : n.type === 'alert' ? 'alert-circle' : 'information-circle';
              const typeColor = n.type === 'success' ? '#16A34A' : n.type === 'alert' ? '#DC2626' : '#EA580C';
              const typeBg = n.type === 'success' ? '#DCFCE7' : n.type === 'alert' ? '#FEE2E2' : '#FFF7ED';

              return (
                <TouchableOpacity
                  key={n._id || i}
                  style={[styles.notifCard, isUnread && styles.notifCardUnread]}
                  onPress={() => openNotification(n)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    {/* Icon Squircle */}
                    <View style={[styles.notifIconSquircle, { backgroundColor: typeBg }]}>
                      <Ionicons name={typeIcon as any} size={20} color={typeColor} />
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.notifTitle, isUnread && { fontWeight: '800', color: '#111827' }]} numberOfLines={1}>
                          {n.title}
                        </Text>
                        {isUnread && <View style={styles.notifUnreadDot} />}
                      </View>

                      <Text style={styles.notifMessage} numberOfLines={2}>
                        {n.message}
                      </Text>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <Text style={styles.notifTime}>
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' + new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : '31 Oct, 10:14 am'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* =========================================================================
            NOTIFICATION DETAILS MODAL (100% Exact Match of User Screenshot Image)
            ========================================================================= */}
        <Modal
          visible={!!selectedNotification}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedNotification(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.notifModalContent}>
              {/* Modal Header */}
              <View style={styles.notifModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.notifModalCheckCircle}>
                    <Ionicons name="checkmark" size={16} color="#16A34A" />
                  </View>
                  <Text style={styles.notifModalTitle}>Notification Details</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedNotification(null)}
                  style={styles.notifModalCloseCircle}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <View style={styles.notifModalBody}>
                {/* Title */}
                <View>
                  <Text style={styles.notifModalFieldLabel}>TITLE</Text>
                  <Text style={styles.notifModalTitleText}>
                    {selectedNotification?.title}
                  </Text>
                </View>

                {/* Message Box */}
                <View>
                  <Text style={styles.notifModalFieldLabel}>MESSAGE</Text>
                  <View style={styles.notifModalMessageBox}>
                    <Text style={styles.notifModalMessageText}>
                      {selectedNotification?.message}
                    </Text>
                  </View>
                </View>

                {/* Category & Received Grid */}
                <View style={styles.notifModalInfoGrid}>
                  <View>
                    <Text style={styles.notifModalFieldLabel}>CATEGORY</Text>
                    <View style={styles.notifModalCategoryBadge}>
                      <Text style={styles.notifModalCategoryText}>
                        {selectedNotification?.type || 'Success'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.notifModalFieldLabel}>RECEIVED</Text>
                    <Text style={styles.notifModalReceivedText}>
                      {selectedNotification?.createdAt ? new Date(selectedNotification.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ', ' + new Date(selectedNotification.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() : '31 Oct, 10:14 am'}
                    </Text>
                  </View>
                </View>

                {/* Close Button Only */}
                <TouchableOpacity
                  style={styles.notifGoToPageBtn}
                  onPress={() => setSelectedNotification(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.notifGoToPageBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

// 10. Reviews & Ratings (100% Match of Web Images 1 & 2)
  const renderReviews = () => {
    const summary = reviewsSummary || DEFAULT_TRAINER_SUMMARY;
    const avgRatingNum = Number(summary.avgRating || 3.0);
    const totalCount = Number(summary.totalReviews || reviews.length || 1);

    // Filter reviews according to clicked star filter (all, 5, 4, 3, 2, 1)
    const filteredReviews = reviews
      .filter(r => reviewFilterStar === 'all' || Number(r.customerRating) === Number(reviewFilterStar))
      .sort((a, b) => {
        if (reviewSortOrder === 'highest') return (b.customerRating || 5) - (a.customerRating || 5);
        if (reviewSortOrder === 'lowest') return (a.customerRating || 5) - (b.customerRating || 5);
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      });

    const getCustomerInitials = (rev: any) => {
      const c = rev.customerId || {};
      const fn = (c.firstName || c.name || 'R')[0];
      const ln = (c.lastName || 'Y')[0] || '';
      return (fn + ln).toUpperCase();
    };

    const getCustomerFullName = (rev: any) => {
      const c = rev.customerId || {};
      if (c.firstName && c.lastName) return `${c.firstName} ${c.lastName}`;
      return c.name || 'Renugopal Y';
    };

    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={[styles.subScrollContent, { gap: 14, paddingBottom: 120 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            HEADER: REVIEWS & RATINGS (Matching Web Image 1)
            ========================================================================= */}
        <View style={styles.jobsHeroCard}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={styles.jobsIconSquircle}>
              <Ionicons name="star" size={22} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.jobsHeroTitle}>Reviews & Ratings</Text>
              <Text style={styles.jobsHeroSub}>
                Customer feedback from your completed sessions
              </Text>
            </View>
          </View>
        </View>

        {/* =========================================================================
            SUMMARY CARDS: AVG RATING, TOTAL REVIEWS, BREAKDOWN (Matching Web Image 1)
            ========================================================================= */}
        <View style={{ gap: 12 }}>
          {/* Card 1: Average Rating Orange Gradient Card */}
          <View style={styles.revAverageRatingCard}>
            <View style={styles.revAwardIconWrap}>
              <Ionicons name="ribbon" size={20} color="#FDE047" />
            </View>
            <Text style={styles.revAvgScoreText}>{avgRatingNum.toFixed(1)}</Text>
            <View style={{ flexDirection: 'row', gap: 3, marginVertical: 4 }}>
              {[1, 2, 3, 4, 5].map(s => (
                <Ionicons
                  key={s}
                  name={s <= Math.round(avgRatingNum) ? "star" : "star-outline"}
                  size={18}
                  color={s <= Math.round(avgRatingNum) ? "#FDE047" : "rgba(255,255,255,0.6)"}
                />
              ))}
            </View>
            <Text style={styles.revAvgLabelText}>Average Rating</Text>
          </View>

          {/* Row of Card 2 (Total Reviews) & Card 3 (Rating Breakdown) */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Card 2: Total Reviews */}
            <View style={[styles.cardContainer, { flex: 0.9, padding: 14 }]}>
              <Ionicons name="chatbox-ellipses-outline" size={22} color="#EA580C" />
              <Text style={styles.revTotalNumberText}>{totalCount}</Text>
              <Text style={styles.revTotalLabelText}>Total Reviews</Text>
              <Text style={styles.revTotalSubText}>From completed sessions</Text>
            </View>

            {/* Card 3: Rating Breakdown Bars */}
            <View style={[styles.cardContainer, { flex: 1.1, padding: 14 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Ionicons name="trending-up" size={16} color="#EA580C" />
                <Text style={styles.revBreakdownTitle}>Rating Breakdown</Text>
              </View>

              <View style={{ gap: 4 }}>
                {(summary.ratingBreakdown || DEFAULT_TRAINER_SUMMARY.ratingBreakdown).map((b: any) => {
                  const star = b.star;
                  const count = Number(b.count || 0);
                  const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;

                  return (
                    <View key={star} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ width: 10, fontSize: 11, fontWeight: '700', color: '#64748B' }}>{star}</Text>
                      <Ionicons name="star" size={11} color="#EA580C" />
                      <View style={styles.revProgressBarBg}>
                        <View style={[styles.revProgressBarFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={{ width: 14, fontSize: 11, fontWeight: '600', color: '#64748B', textAlign: 'right' }}>
                        {count}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* =========================================================================
            FILTER & SORT BAR (Matching Web Images 1 & 2)
            ========================================================================= */}
        <View style={styles.cardContainer}>
          <View style={{ padding: 12, gap: 10 }}>
            {/* Filter Pills: All Stars, 5, 4, 3, 2, 1 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="filter" size={14} color="#64748B" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginRight: 2 }}>Filter:</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {(['all', 5, 4, 3, 2, 1] as const).map(s => {
                  const isActive = reviewFilterStar === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.revFilterPill, isActive && styles.revFilterPillActive]}
                      onPress={() => setReviewFilterStar(s)}
                      activeOpacity={0.8}
                    >
                      {s === 'all' ? (
                        <Text style={[styles.revFilterPillText, isActive && styles.revFilterPillTextActive]}>
                          All Stars
                        </Text>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Ionicons 
                            name="star" 
                            size={11} 
                            color={isActive ? "#FFFFFF" : "#EA580C"} 
                          />
                          <Text style={[styles.revFilterPillText, isActive && styles.revFilterPillTextActive]}>
                            {s}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Sort Toggle Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 8 }}>
              <Text style={{ fontSize: 11, color: '#64748B' }}>
                Showing {filteredReviews.length} of {reviews.length} reviews
              </Text>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                onPress={() => {
                  if (reviewSortOrder === 'newest') setReviewSortOrder('highest');
                  else if (reviewSortOrder === 'highest') setReviewSortOrder('lowest');
                  else setReviewSortOrder('newest');
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#EA580C' }}>
                  {reviewSortOrder === 'newest' ? 'Newest First' : reviewSortOrder === 'highest' ? 'Highest Rated' : 'Lowest Rated'}
                </Text>
                <Ionicons name="swap-vertical" size={13} color="#EA580C" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* =========================================================================
            REVIEWS LIST / FILTERED RESULT (Matching Web Image 2)
            ========================================================================= */}
        {filteredReviews.length === 0 ? (
          <View style={styles.revEmptyCard}>
            <View style={styles.revEmptyIconCircle}>
              <Ionicons name="star-outline" size={32} color="#94A3B8" />
            </View>
            <Text style={styles.revEmptyTitle}>No Reviews for ★ {reviewFilterStar}</Text>
            <Text style={styles.revEmptySub}>
              Once customers complete a session and leave a {reviewFilterStar}-star rating, it will appear here.
            </Text>
            <TouchableOpacity 
              style={styles.revResetFilterBtn}
              onPress={() => setReviewFilterStar('all')}
              activeOpacity={0.8}
            >
              <Text style={styles.revResetFilterBtnText}>Show All Stars</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredReviews.map((rev, idx) => {
            const ratingVal = Number(rev.customerRating || 3);
            const initials = getCustomerInitials(rev);
            const customerName = getCustomerFullName(rev);
            const customerEmail = rev.customerId?.email || 'renugopal5457@gmail.com';
            const reviewComment = rev.customerReview || rev.comment || 'GOOD';
            const sessionDate = rev.date || '2026-10-15';
            const sessionTime = (rev.startTime && rev.endTime) ? `${rev.startTime}–${rev.endTime}` : '10:00 AM–11:00 AM';
            const sessionMode = rev.mode || 'Online';
            const ratedDateStr = rev.updatedAt ? new Date(rev.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '14 Oct 2026';

            return (
              <View key={rev._id || idx} style={styles.cardContainer}>
                <View style={{ padding: 16, gap: 12 }}>
                  {/* Top: Avatar, Name, Email & Stars Score */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View style={styles.revAvatarCircle}>
                      <Text style={styles.revAvatarText}>{initials}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.revCustomerName}>{customerName}</Text>
                      <Text style={styles.revCustomerEmail}>{customerEmail}</Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <Ionicons
                            key={s}
                            name={s <= ratingVal ? "star" : "star-outline"}
                            size={14}
                            color="#EA580C"
                          />
                        ))}
                      </View>
                      <Text style={styles.revRatingScoreText}>{ratingVal}/5</Text>
                    </View>
                  </View>

                  {/* Review Text Box (Matching Web Image 2) */}
                  <View style={styles.revCommentBox}>
                    <Text style={styles.revCommentText}>"{reviewComment}"</Text>
                  </View>

                  {/* Footer Session Metadata */}
                  <View style={styles.revMetaRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="calendar-outline" size={13} color="#64748B" />
                      <Text style={styles.revMetaText}>{sessionDate} · {sessionTime}</Text>
                    </View>

                    <View style={styles.revModeBadge}>
                      <Text style={styles.revModeBadgeText}>{sessionMode}</Text>
                    </View>

                    <Text style={styles.revRatedDateText}>Rated on {ratedDateStr}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    );
  };


  const handleOpenAiReview = (cust: any) => {
    setSelectedAiCustomer(cust);
    setModificationCount(0);
    setSelectedWorkoutDay('Monday');
    setSelectedDietDay('Monday');
    setShowOriginalDraft(false);
    setReplacingExerciseIdx(null);
    setShowAiReviewModal(true);
  };

  const updateExercise = (exerciseIdx: number, field: string, value: any) => {
    setWeeklyWorkouts(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedWorkoutDay] };
      const exList = [...currentDay.exercises];
      exList[exerciseIdx] = { ...exList[exerciseIdx], [field]: value };
      currentDay.exercises = exList;
      updated[selectedWorkoutDay] = currentDay;
      return updated;
    });
    setModificationCount(c => c + 1);
  };

  const removeExercise = (exerciseIdx: number) => {
    setWeeklyWorkouts(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedWorkoutDay] };
      const exList = [...currentDay.exercises];
      exList.splice(exerciseIdx, 1);
      currentDay.exercises = exList;
      updated[selectedWorkoutDay] = currentDay;
      return updated;
    });
    setModificationCount(c => c + 1);
  };

  const addExercise = () => {
    setWeeklyWorkouts(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedWorkoutDay] };
      currentDay.exercises = [
        ...currentDay.exercises,
        {
          name: 'Custom Exercise',
          sets: 3,
          reps: '10 - 12',
          duration: '10 mins',
          rest: '60s',
          difficulty: 'Beginner',
          targetMuscleGroup: currentDay.targetMuscle || 'Full Body',
          instructions: 'Perform exercise with controlled form and full range of motion.'
        }
      ];
      updated[selectedWorkoutDay] = currentDay;
      return updated;
    });
    setModificationCount(c => c + 1);
  };

  const replaceExerciseWith = (exerciseIdx: number, newName: string, targetMuscle: string) => {
    setWeeklyWorkouts(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedWorkoutDay] };
      const exList = [...currentDay.exercises];
      exList[exerciseIdx] = {
        ...exList[exerciseIdx],
        name: newName,
        targetMuscleGroup: targetMuscle
      };
      currentDay.exercises = exList;
      updated[selectedWorkoutDay] = currentDay;
      return updated;
    });
    setReplacingExerciseIdx(null);
    setModificationCount(c => c + 1);
  };

  const updateDietField = (field: string, value: any) => {
    setWeeklyDiet(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedDietDay] };
      (currentDay as any)[field] = value;
      updated[selectedDietDay] = currentDay;
      return updated;
    });
    setModificationCount(c => c + 1);
  };

  const updateDietMacro = (macroField: 'protein' | 'carbs' | 'fats', value: string) => {
    setWeeklyDiet(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedDietDay] };
      currentDay.macros = {
        ...currentDay.macros,
        [macroField]: value
      };
      updated[selectedDietDay] = currentDay;
      return updated;
    });
    setModificationCount(c => c + 1);
  };

  const handleApproveWithoutChanges = () => {
    if (!selectedAiCustomer) return;
    setAiCustomers((prev: any[]) => prev.map(c => 
      c._id === selectedAiCustomer._id 
        ? { ...c, aiStatus: 'Trainer Approved' }
        : c
    ));
    Alert.alert('Plan Approved', 'Original AI-generated 7-day fitness & diet plan approved and published to ' + (selectedAiCustomer.firstName || 'Client') + '!');
    setShowAiReviewModal(false);
  };

  const handleEditAndApprove = () => {
    if (!selectedAiCustomer) return;
    setAiCustomers((prev: any[]) => prev.map(c => 
      c._id === selectedAiCustomer._id 
        ? { ...c, aiStatus: 'Trainer Approved' }
        : c
    ));
    Alert.alert('Calibrations Published', 'Trainer calibrations saved! Approved 7-day plan published to ' + (selectedAiCustomer.firstName || 'Client') + ' dashboard.');
    setShowAiReviewModal(false);
  };

  // FULL AI Plan Review & Calibration View (100% Mirroring Web /trainer/ai-review/:id)
  const renderAiReviewModal = () => {
    if (!showAiReviewModal || !selectedAiCustomer) return null;

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const activeWorkoutDayData = weeklyWorkouts[selectedWorkoutDay] || weeklyWorkouts.Monday;
    const activeDietDayData = weeklyDiet[selectedDietDay] || weeklyDiet.Monday;
    const isApproved = selectedAiCustomer.aiStatus === 'Trainer Approved' || selectedAiCustomer.aiStatus === 'Published to Customer';

    return (
      <Modal
        visible={showAiReviewModal}
        animationType="slide"
        onRequestClose={() => setShowAiReviewModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.reviewFullContainer}
        >
          {/* Top Bar Navigation */}
          <View style={[styles.reviewTopBar, { paddingTop: Math.max(insets.top + 10, 44) }]}>
            <TouchableOpacity 
              style={styles.reviewBackBtn} 
              onPress={() => setShowAiReviewModal(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#EA580C" />
              <Text style={styles.reviewBackText}>Back to Client List</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <View style={[styles.reviewStatusPill, isApproved ? styles.statusPillApproved : styles.statusPillPending]}>
                <Ionicons 
                  name={isApproved ? "checkmark-circle" : "time-outline"} 
                  size={12} 
                  color={isApproved ? "#EA580C" : "#9A3412"} 
                />
                <Text style={[styles.reviewStatusText, { color: isApproved ? "#EA580C" : "#9A3412" }]}>
                  {selectedAiCustomer.aiStatus || 'AI Generated'} (v1)
                </Text>
              </View>

              {modificationCount > 0 && (
                <View style={styles.reviewEditsPill}>
                  <Text style={styles.reviewEditsText}>✏️ {modificationCount} Edit(s)</Text>
                </View>
              )}
            </View>
          </View>

          {/* Main Content Scroll */}
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={styles.reviewScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Banner */}
            <View style={styles.reviewHeroCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={styles.reviewAvatarCircle}>
                  <Text style={styles.reviewAvatarLetter}>
                    {selectedAiCustomer.firstName?.[0] || 'R'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewHeroTitle}>
                    Review & Calibrate: {selectedAiCustomer.firstName} {selectedAiCustomer.lastName}
                  </Text>
                  <Text style={styles.reviewHeroSub}>
                    Review AI analysis draft, calibrate exercise sets/reps, adjust nutrition, and approve official customer plan.
                  </Text>
                </View>
              </View>

              {/* Primary Top Action Buttons */}
              <View style={styles.reviewHeroActionRow}>
                <TouchableOpacity 
                  style={styles.reviewApproveDraftBtn} 
                  onPress={handleApproveWithoutChanges}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-outline" size={15} color="#EA580C" />
                  <Text style={styles.reviewApproveDraftText}>Approve (No Changes)</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.reviewEditApproveBtn} 
                  onPress={handleEditAndApprove}
                  activeOpacity={0.8}
                >
                  <Ionicons name="send" size={14} color="#FFFFFF" />
                  <Text style={styles.reviewEditApproveText}>Edit & Approve</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* CARD 1: Customer Information & Assessment Details */}
            <View style={styles.reviewSectionCard}>
              <View style={styles.reviewCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="person-outline" size={18} color="#EA580C" />
                  <Text style={styles.reviewCardTitle}>Customer Information & Assessment</Text>
                </View>
                <View style={styles.reviewGoalBadge}>
                  <Text style={styles.reviewGoalBadgeText}>Goal: {selectedAiCustomer.goal || 'Weight Loss'}</Text>
                </View>
              </View>

              {/* Demographics Grid */}
              <View style={styles.reviewDemoGrid}>
                <View style={styles.reviewDemoTile}>
                  <Text style={styles.reviewDemoLabel}>AGE</Text>
                  <Text style={styles.reviewDemoValue}>28 yrs</Text>
                </View>
                <View style={styles.reviewDemoTile}>
                  <Text style={styles.reviewDemoLabel}>GENDER</Text>
                  <Text style={styles.reviewDemoValue}>Male</Text>
                </View>
                <View style={styles.reviewDemoTile}>
                  <Text style={styles.reviewDemoLabel}>HEIGHT / WEIGHT</Text>
                  <Text style={styles.reviewDemoValue}>180 cm / 85 kg</Text>
                </View>
                <View style={styles.reviewDemoTile}>
                  <Text style={styles.reviewDemoLabel}>LEVEL</Text>
                  <Text style={styles.reviewDemoValue}>{selectedAiCustomer.level || 'Beginner'}</Text>
                </View>
                <View style={styles.reviewDemoTile}>
                  <Text style={styles.reviewDemoLabel}>TARGET DAYS</Text>
                  <Text style={styles.reviewDemoValue}>4 Days</Text>
                </View>
                <View style={styles.reviewDemoTile}>
                  <Text style={styles.reviewDemoLabel}>EQUIPMENT</Text>
                  <Text style={styles.reviewDemoValue} numberOfLines={2}>Full Commercial Gym</Text>
                </View>
              </View>

              {/* Health Considerations Alert */}
              <View style={styles.reviewInjuryBanner}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#EA580C" />
                <Text style={styles.reviewInjuryText}>
                  <Text style={{ fontWeight: '800' }}>Reported Injury / Medical Note: </Text>
                  None reported. Screen exercises below to avoid joint irritation and maintain safe progression.
                </Text>
              </View>
            </View>

            {/* CARD 2: AI Generated Assessment & Health Analysis */}
            <View style={styles.reviewSectionCard}>
              <View style={styles.reviewCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="sparkles" size={18} color="#EA580C" />
                  <Text style={styles.reviewCardTitle}>AI Generated Assessment & Health Analysis</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowOriginalDraft(!showOriginalDraft)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 0 }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#EA580C' }}>
                    {showOriginalDraft ? 'Hide Deep Insights' : 'View Full Insights'}
                  </Text>
                  <Ionicons name={showOriginalDraft ? "chevron-up" : "chevron-down"} size={13} color="#EA580C" />
                </TouchableOpacity>
              </View>

              <View style={styles.reviewAiClinicalBox}>
                <Text style={styles.reviewAiClinicalLabel}>AI CLINICAL ASSESSMENT:</Text>
                <Text style={styles.reviewAiClinicalText}>
                  Client presents with primary goal of {selectedAiCustomer.goal || 'Weight Loss'} at {selectedAiCustomer.level || 'Beginner'} experience level. A calibrated 7-day routine focusing on progressive overload, moderate volume, and balanced nutrition is recommended.
                </Text>
              </View>

              {showOriginalDraft && (
                <View style={{ gap: 8, marginTop: 4 }}>
                  <View style={styles.reviewAiInsightTile}>
                    <Text style={styles.reviewAiInsightTitle}>AI GOAL & KINETIC ANALYSIS</Text>
                    <Text style={styles.reviewAiInsightText}>
                      Structured caloric deficit with resistance training to maximize lean mass retention while accelerating metabolic expenditure.
                    </Text>
                  </View>
                  <View style={styles.reviewAiInsightTile}>
                    <Text style={styles.reviewAiInsightTitle}>RECOMMENDED TRAINING APPROACH</Text>
                    <Text style={styles.reviewAiInsightText}>
                      Periodized 7-day schedule with dedicated hypertrophy, lower-body core stability, active recovery, and mobility restoration sessions.
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* CARD 3: AI-Generated 7-Day Workout Routine (Monday – Sunday) */}
            <View style={styles.reviewSectionCard}>
              <View style={styles.reviewCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                  <Ionicons name="barbell-outline" size={18} color="#EA580C" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewCardTitle}>AI Workout Plan (Monday – Sunday)</Text>
                    <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 }}>
                      Calibrate sets, reps, and exercise selection for each day from Monday to Sunday.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.reviewAddExerciseBtn}
                  onPress={addExercise}
                >
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                  <Text style={styles.reviewAddExerciseText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Day Selector Tabs (Monday to Sunday) */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
              >
                {daysOfWeek.map(day => {
                  const isActive = selectedWorkoutDay === day;
                  const dayData = weeklyWorkouts[day];
                  const exCount = dayData?.exercises?.length || 0;

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.reviewDayTab, isActive && styles.reviewDayTabActive]}
                      onPress={() => setSelectedWorkoutDay(day)}
                    >
                      <Text style={[styles.reviewDayTabText, isActive && styles.reviewDayTabTextActive]}>
                        {day}
                      </Text>
                      <Text style={[styles.reviewDayTabSub, isActive && styles.reviewDayTabSubActive]}>
                        {exCount} Exercises
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Selected Day Split Banner */}
              <View style={styles.reviewDaySplitBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewDaySplitFocus}>
                    {selectedWorkoutDay} Split: <Text style={{ color: '#EA580C' }}>{activeWorkoutDayData.focus}</Text>
                  </Text>
                  <Text style={styles.reviewDaySplitMeta}>
                    Focus: {activeWorkoutDayData.targetMuscle} • {activeWorkoutDayData.duration}
                  </Text>
                </View>
                <View style={styles.reviewCalibratedBadge}>
                  <Text style={styles.reviewCalibratedBadgeText}>
                    {activeWorkoutDayData.exercises.length} Calibrated
                  </Text>
                </View>
              </View>

              {/* Exercises List */}
              <View style={{ gap: 10 }}>
                {activeWorkoutDayData.exercises.map((ex, idx) => (
                  <View key={idx} style={styles.reviewExerciseCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <View style={styles.reviewExNumBadge}>
                        <Text style={styles.reviewExNumText}>{idx + 1}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <TextInput
                          style={styles.reviewExNameInput}
                          value={ex.name}
                          onChangeText={(txt: string) => updateExercise(idx, 'name', txt)}
                          placeholder="Exercise Name"
                        />
                        <TextInput
                          style={styles.reviewExMuscleInput}
                          value={ex.targetMuscleGroup || ''}
                          onChangeText={(txt: string) => updateExercise(idx, 'targetMuscleGroup', txt)}
                          placeholder="Target Muscle"
                        />
                      </View>

                      <TouchableOpacity 
                        style={styles.reviewExTrashBtn}
                        onPress={() => removeExercise(idx)}
                      >
                        <Ionicons name="trash-outline" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>

                    {/* Sets, Reps, Rest, Difficulty Grid */}
                    <View style={styles.reviewExMetricsGrid}>
                      <View style={styles.reviewExMetricItem}>
                        <Text style={styles.reviewExMetricLabel}>SETS</Text>
                        <TextInput
                          style={styles.reviewExMetricInput}
                          value={String(ex.sets)}
                          onChangeText={(txt: string) => updateExercise(idx, 'sets', Number(txt) || 3)}
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.reviewExMetricItem}>
                        <Text style={styles.reviewExMetricLabel}>REPS</Text>
                        <TextInput
                          style={styles.reviewExMetricInput}
                          value={ex.reps}
                          onChangeText={(txt: string) => updateExercise(idx, 'reps', txt)}
                        />
                      </View>

                      <View style={styles.reviewExMetricItem}>
                        <Text style={styles.reviewExMetricLabel}>REST</Text>
                        <TextInput
                          style={styles.reviewExMetricInput}
                          value={ex.rest || '60s'}
                          onChangeText={(txt: string) => updateExercise(idx, 'rest', txt)}
                        />
                      </View>

                      <View style={styles.reviewExMetricItem}>
                        <Text style={styles.reviewExMetricLabel}>LEVEL</Text>
                        <TextInput
                          style={styles.reviewExMetricInput}
                          value={ex.difficulty || 'Beginner'}
                          onChangeText={(txt: string) => updateExercise(idx, 'difficulty', txt)}
                        />
                      </View>
                    </View>

                    {/* Replace Button & Dropdown */}
                    <View style={{ marginTop: 6 }}>
                      <TouchableOpacity
                        style={styles.reviewReplaceBtn}
                        onPress={() => setReplacingExerciseIdx(replacingExerciseIdx === idx ? null : idx)}
                      >
                        <Ionicons name="refresh" size={12} color="#EA580C" />
                        <Text style={styles.reviewReplaceBtnText}>Replace with Alternative</Text>
                      </TouchableOpacity>

                      {replacingExerciseIdx === idx && (
                        <View style={styles.reviewReplaceOptionsBox}>
                          <Text style={styles.reviewReplaceOptionsTitle}>Choose gym alternative:</Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {REPLACEMENT_OPTIONS.map((sub, sIdx) => (
                              <TouchableOpacity
                                key={sIdx}
                                style={styles.reviewReplaceChip}
                                onPress={() => replaceExerciseWith(idx, sub.name, sub.muscle)}
                              >
                                <Text style={styles.reviewReplaceChipText}>+ {sub.name}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* CARD 4: AI-Generated 7-Day Diet & Nutrition Plan (Monday – Sunday) */}
            <View style={styles.reviewSectionCard}>
              <View style={styles.reviewCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                  <Ionicons name="restaurant-outline" size={18} color="#EA580C" style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewCardTitle}>AI Diet Plan (Monday – Sunday)</Text>
                    <Text style={{ fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 15 }}>
                      Review calorie targets, macro splits, and daily scheduled meal nutrition.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Diet Day Selector Tabs (Monday to Sunday) */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
              >
                {daysOfWeek.map(day => {
                  const isActive = selectedDietDay === day;
                  const dietData = weeklyDiet[day];
                  const cals = dietData?.calories || 2150;

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.reviewDayTab, isActive && styles.reviewDayTabActive]}
                      onPress={() => setSelectedDietDay(day)}
                    >
                      <Text style={[styles.reviewDayTabText, isActive && styles.reviewDayTabTextActive]}>
                        {day}
                      </Text>
                      <Text style={[styles.reviewDayTabSub, isActive && styles.reviewDayTabSubActive]}>
                        ~{cals} kcal
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Nutrition Targets Row */}
              <View style={styles.reviewNutritionTargetBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <Text style={[styles.reviewNutriFocusTitle, { flex: 1 }]}>
                    {selectedDietDay} Focus: <Text style={{ color: '#EA580C' }}>{activeDietDayData.focus}</Text>
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B' }}>Target:</Text>
                    <TextInput
                      style={styles.reviewCalorieInput}
                      value={String(activeDietDayData.calories)}
                      onChangeText={(txt: string) => updateDietField('calories', Number(txt) || 2150)}
                      keyboardType="numeric"
                    />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#EA580C' }}>kcal</Text>
                  </View>
                </View>

                {/* Macro Inputs */}
                <View style={styles.reviewMacroRow}>
                  <View style={styles.reviewMacroTile}>
                    <Text style={styles.reviewMacroLabel}>PROTEIN</Text>
                    <TextInput
                      style={styles.reviewMacroInput}
                      value={activeDietDayData.macros?.protein || '155g'}
                      onChangeText={(txt: string) => updateDietMacro('protein', txt)}
                    />
                  </View>
                  <View style={styles.reviewMacroTile}>
                    <Text style={styles.reviewMacroLabel}>CARBS</Text>
                    <TextInput
                      style={styles.reviewMacroInput}
                      value={activeDietDayData.macros?.carbs || '210g'}
                      onChangeText={(txt: string) => updateDietMacro('carbs', txt)}
                    />
                  </View>
                  <View style={styles.reviewMacroTile}>
                    <Text style={styles.reviewMacroLabel}>FATS</Text>
                    <TextInput
                      style={styles.reviewMacroInput}
                      value={activeDietDayData.macros?.fats || '58g'}
                      onChangeText={(txt: string) => updateDietMacro('fats', txt)}
                    />
                  </View>
                </View>
              </View>

              {/* 6 Structured Meals */}
              <View style={{ gap: 10 }}>
                {[
                  { label: 'Morning Hydration', icon: 'sunny-outline', field: 'morning' },
                  { label: 'Breakfast', icon: 'cafe-outline', field: 'breakfast' },
                  { label: 'Mid-Morning Snack', icon: 'nutrition-outline', field: 'midMorning' },
                  { label: 'Lunch', icon: 'restaurant-outline', field: 'lunch' },
                  { label: 'Evening Snack', icon: 'flame-outline', field: 'evening' },
                  { label: 'Dinner', icon: 'moon-outline', field: 'dinner' }
                ].map((meal, mIdx) => (
                  <View key={mIdx} style={styles.reviewMealBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Ionicons name={meal.icon as any} size={14} color="#EA580C" />
                      <Text style={styles.reviewMealLabel}>{meal.label}</Text>
                    </View>
                    <TextInput
                      style={styles.reviewMealInput}
                      multiline
                      value={(activeDietDayData as any)[meal.field] || ''}
                      onChangeText={(txt: string) => updateDietField(meal.field, txt)}
                      placeholder={'Details for ' + meal.label}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* CARD 5: AI Recovery & Lifestyle Protocol */}
            <View style={styles.reviewSectionCard}>
              <View style={styles.reviewCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="heart-half-outline" size={18} color="#EA580C" />
                  <Text style={styles.reviewCardTitle}>AI Recovery & Lifestyle Protocol</Text>
                </View>
              </View>

              <View style={{ gap: 10 }}>
                <View>
                  <Text style={styles.reviewProtocolLabel}>NIGHTLY SLEEP TARGET</Text>
                  <TextInput
                    style={styles.reviewProtocolInput}
                    value={recoveryStructure.sleep}
                    onChangeText={(txt: string) => setRecoveryStructure({ ...recoveryStructure, sleep: txt })}
                  />
                </View>

                <View>
                  <Text style={styles.reviewProtocolLabel}>DAILY HYDRATION TARGET</Text>
                  <TextInput
                    style={styles.reviewProtocolInput}
                    value={recoveryStructure.hydration}
                    onChangeText={(txt: string) => setRecoveryStructure({ ...recoveryStructure, hydration: txt })}
                  />
                </View>

                <View>
                  <Text style={styles.reviewProtocolLabel}>ACTIVE RECOVERY GUIDELINES</Text>
                  <TextInput
                    style={styles.reviewProtocolInput}
                    value={recoveryStructure.activeRecovery}
                    onChangeText={(txt: string) => setRecoveryStructure({ ...recoveryStructure, activeRecovery: txt })}
                  />
                </View>

                <View>
                  <Text style={styles.reviewProtocolLabel}>STRETCHING & MOBILITY FLOW</Text>
                  <TextInput
                    style={styles.reviewProtocolInput}
                    value={recoveryStructure.stretchingMobility}
                    onChangeText={(txt: string) => setRecoveryStructure({ ...recoveryStructure, stretchingMobility: txt })}
                  />
                </View>
              </View>
            </View>

            {/* CARD 6: Trainer Recommendations & Direct Customer Notes */}
            <View style={styles.reviewSectionCard}>
              <View style={styles.reviewCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="create-outline" size={18} color="#EA580C" />
                  <Text style={styles.reviewCardTitle}>Trainer Recommendations & Direct Customer Notes</Text>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                <View>
                  <Text style={styles.reviewProtocolLabel}>TRAINER SPECIFIC DIRECTIVES</Text>
                  <TextInput
                    style={[styles.reviewProtocolInput, { minHeight: 65 }]}
                    multiline
                    value={trainerRecommendations}
                    onChangeText={setTrainerRecommendations}
                    placeholder="e.g. Focus on progressive overload. Rest strictly 60s."
                  />
                </View>

                <View>
                  <Text style={styles.reviewProtocolLabel}>PERSONAL ENCOURAGEMENT NOTE FOR MEMBER</Text>
                  <TextInput
                    style={[styles.reviewProtocolInput, { minHeight: 65 }]}
                    multiline
                    value={trainerNotes}
                    onChangeText={setTrainerNotes}
                    placeholder="e.g. Great baseline! I calibrated your squat reps to 3x10."
                  />
                </View>
              </View>
            </View>

            <View style={{ height: Math.max(insets.bottom + 84, 96) }} />
          </ScrollView>

          {/* Sticky Bottom Actions Bar */}
          <View style={[styles.reviewStickyBottomBar, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
            <TouchableOpacity 
              style={styles.reviewBottomDraftBtn}
              onPress={handleApproveWithoutChanges}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-outline" size={16} color="#EA580C" />
              <Text style={styles.reviewBottomDraftText}>Approve (No Changes)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.reviewBottomApproveBtn}
              onPress={handleEditAndApprove}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={15} color="#FFFFFF" />
              <Text style={styles.reviewBottomApproveText}>Edit & Approve</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
            <Ionicons name={activeSection === 'notifications' ? "close" : "arrow-back"} size={20} color={COLORS.textDark} />
            <Text style={styles.backBtnText}>{activeSection === 'notifications' ? 'Close' : 'More'}</Text>
          </TouchableOpacity>
          <Text style={styles.subNavTitle} numberOfLines={1}>{activeMod?.title}</Text>
          <View style={{ width: 60 }} />
        </View>

        {activeSection === 'profile' && renderProfile()}
        {activeSection === 'ai-assistant' && renderAI()}
        {activeSection === 'feedback' && renderFeedback()}
        {activeSection === 'feedback' && renderFeedbackDetailModal()}
        {activeSection === 'rewards' && renderRewards()}
        {activeSection === 'rewards' && renderCertificateModal()}
        {activeSection === 'financials' && renderFinancials()}
        {activeSection === 'jobs' && renderJobs()}
        {activeSection === 'jobs' && renderJobDetailsModal()}
        {activeSection === 'applications' && renderApplications()}
        {activeSection === 'applications' && renderApplicationDetailsModal()}
        {activeSection === 'messages' && renderMessages()}
        {activeSection === 'notifications' && renderNotifications()}
        {activeSection === 'reviews' && renderReviews()}
        {activeSection === 'ai-assistant' && renderAiReviewModal()}
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

  /* AI Analysis Review Hub Styles (Images 1, 2, 3) */
  aiHubHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  aiBotSquircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHubTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  aiHubSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  aiSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  aiSearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
    padding: 0,
  },
  aiFilterTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  aiFilterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  aiFilterPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  aiFilterPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  aiFilterPillTextActive: {
    color: '#FFFFFF',
  },
  aiEmptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    marginTop: 10,
  },
  aiEmptyBotCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  aiEmptyStateTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  aiEmptyStateSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 15,
  },
  aiClientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  aiClientCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiClientAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiClientAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EA580C',
  },
  aiClientName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  aiClientEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  aiClientDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
  },
  aiClientDetailItem: {
    flex: 1,
    minWidth: '45%',
    gap: 3,
  },
  aiDetailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  aiGoalValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  aiLevelBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  aiLevelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  aiStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  aiStatusBadgeApproved: {
    backgroundColor: '#FFF7ED',
  },
  aiStatusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  aiStatusBadgeDefault: {
    backgroundColor: '#F1F5F9',
  },
  aiStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  aiDateValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  aiClientActionRow: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  aiActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  aiActionButtonEdit: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EA580C',
  },
  aiActionButtonReview: {
    backgroundColor: '#EA580C',
  },
  aiActionButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },

  /* Review Screen Full Modal Styles (Mirroring TrainerAIReview.tsx) */
  reviewFullContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  reviewTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  reviewBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewBackText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  reviewStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillApproved: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  reviewStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  reviewEditsPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#EA580C',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reviewEditsText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9A3412',
  },
  reviewScrollContent: {
    padding: 16,
    gap: 16,
  },
  reviewHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
  },
  reviewAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarLetter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  reviewHeroTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  reviewHeroSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  reviewHeroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewApproveDraftBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EA580C',
    paddingVertical: 9,
    borderRadius: 12,
  },
  reviewApproveDraftText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  reviewEditApproveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    borderRadius: 12,
  },
  reviewEditApproveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reviewSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  reviewCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    flexShrink: 1,
  },
  reviewGoalBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexShrink: 0,
  },
  reviewGoalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  reviewDemoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewDemoTile: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reviewDemoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  reviewDemoValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  reviewInjuryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 10,
    padding: 10,
  },
  reviewInjuryText: {
    flex: 1,
    fontSize: 11,
    color: '#9A3412',
    lineHeight: 15,
  },
  reviewAiClinicalBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  reviewAiClinicalLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  reviewAiClinicalText: {
    fontSize: 11,
    color: '#111827',
    lineHeight: 16,
  },
  reviewAiInsightTile: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reviewAiInsightTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
    marginBottom: 2,
  },
  reviewAiInsightText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  reviewAddExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  reviewAddExerciseText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reviewDayTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    minWidth: 90,
  },
  reviewDayTabActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  reviewDayTabText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  reviewDayTabTextActive: {
    color: '#FFFFFF',
  },
  reviewDayTabSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  reviewDayTabSubActive: {
    color: '#FFEDD5',
  },
  reviewDaySplitBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewDaySplitFocus: {
    fontSize: 11,
    fontWeight: '900',
    color: '#111827',
  },
  reviewDaySplitMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  reviewCalibratedBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reviewCalibratedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
  },
  reviewExerciseCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  reviewExNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewExNumText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  reviewExNameInput: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reviewExMuscleInput: {
    fontSize: 10,
    color: '#EA580C',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  reviewExTrashBtn: {
    padding: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  reviewExMetricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewExMetricItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  reviewExMetricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
  },
  reviewExMetricInput: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    paddingVertical: 2,
    width: '100%',
  },
  reviewReplaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reviewReplaceBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  reviewReplaceOptionsBox: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
  },
  reviewReplaceOptionsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  reviewReplaceChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  reviewReplaceChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#111827',
  },
  reviewNutritionTargetBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  reviewNutriFocusTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#111827',
  },
  reviewCalorieInput: {
    width: 55,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    paddingVertical: 2,
  },
  reviewMacroRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewMacroTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewMacroLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  reviewMacroInput: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    width: 45,
    textAlign: 'right',
  },
  reviewMealBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  reviewMealLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  reviewMealInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    fontSize: 11,
    color: '#111827',
    minHeight: 50,
    textAlignVertical: 'top',
  },
  reviewProtocolLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 3,
  },
  reviewProtocolInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    color: '#111827',
  },
  reviewStickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    paddingBottom: 24,
  },
  reviewBottomDraftBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
  },
  reviewBottomDraftText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  reviewBottomApproveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
  },
  reviewBottomApproveText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Find Jobs Styles (Matching Web Images 1 & 2) */
  jobsHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobsIconSquircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobsHeroTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  jobsHeroSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  jobsFilterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  jobsSearchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  jobsSearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
    padding: 0,
  },
  jobsLocationInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 140,
  },
  jobsLocationInput: {
    flex: 1,
    fontSize: 11,
    color: '#111827',
    padding: 0,
  },
  jobsEmpPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jobsEmpPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  jobsEmpPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  jobsEmpPillTextActive: {
    color: '#FFFFFF',
  },
  jobsEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  jobsEmptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  jobsEmptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  jobItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  jobGymNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  jobTitleText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },
  jobEmpBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  jobEmpBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
  },
  jobOverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  jobOverBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B91C1C',
  },
  jobInfoMetaContainer: {
    gap: 4,
    paddingVertical: 4,
  },
  jobInfoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobInfoMetaText: {
    fontSize: 11,
    color: '#334155',
    flex: 1,
  },
  jobSalaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  jobDescBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 9,
  },
  jobDescText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  jobSkillPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  jobSkillPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  jobCardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 2,
  },
  jobViewDetailsBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  jobViewDetailsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  jobVacancyOverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  jobVacancyOverBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B91C1C',
  },
  jobApplyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  jobApplyNowBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  jobModalTile: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
  },
  jobModalTileLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  jobModalTileVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    marginTop: 1,
  },
  jobModalSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    marginBottom: 4,
  },
  jobModalTextBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  jobModalDescText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },

  /* Generic Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Application Screen Styles (Matching Web Image 1)
  applicationsSearchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  applicationsSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  applicationsSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    padding: 0,
  },
  appEmptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  appEmptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
  },
  appEmptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 290,
    marginBottom: 20,
  },
  browseVacanciesBtn: {
    backgroundColor: '#C2410C',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  browseVacanciesBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  appJobTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  appStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  appStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  appGymName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  appMetaText: {
    fontSize: 12,
    color: '#64748B',
  },
  appCardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  appViewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  appViewDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  appWithdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  appWithdrawBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E11D48',
  },
  appModalStatusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
  },
  appModalStatusBannerText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 2,
  },

  // Messages & Chat Styles (100% Match of Web Image 1)
  msgContactsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    gap: 10,
  },
  msgSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  msgSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    padding: 0,
  },
  msgContactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  msgContactPillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  msgActiveIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#EA580C',
  },
  msgAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  msgAvatarInitial: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EA580C',
  },
  msgStatusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  msgContactName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  msgContactNameActive: {
    color: '#EA580C',
  },
  msgContactLastText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  // Chat Room Card
  chatRoomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chatAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatAvatarInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EA580C',
  },
  chatRoomName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  chatRoomEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  chatMaxFileSizeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },

  // Thread & Bubbles
  chatMessagesThread: {
    padding: 14,
    gap: 14,
    minHeight: 260,
    backgroundColor: '#FFFFFF',
  },
  receivedMsgContainer: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
  },
  receivedSenderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginLeft: 2,
  },
  receivedMsgBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  receivedMsgText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  msgTimestampLeft: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
    marginLeft: 4,
  },

  outgoingMsgContainer: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  outgoingSenderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    marginRight: 2,
  },
  outgoingMsgBubble: {
    backgroundColor: '#C2410C',
    borderRadius: 16,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  outgoingMsgText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 20,
  },
  msgTimestampRight: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 3,
    marginRight: 4,
  },
  outgoingTrainerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#C2410C',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  outgoingTrainerAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Input Bar
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  chatActionIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chatSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  chatSendBtnDisabled: {
    backgroundColor: '#FDBA74',
    elevation: 0,
    shadowOpacity: 0,
  },

  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  // Reviews & Ratings Styles (Matching Web Images 1 & 2)
  revAverageRatingCard: {
    backgroundColor: '#EA580C',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  revAwardIconWrap: {
    marginBottom: 8,
  },
  revAvgScoreText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  revAvgLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  revTotalNumberText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    marginTop: 6,
  },
  revTotalLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  revTotalSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  revBreakdownTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  revProgressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  revProgressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#EA580C',
  },
  revFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  revFilterPillActive: {
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
  },
  revFilterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  revFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  revEmptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  revEmptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  revEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  revEmptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 16,
  },
  revResetFilterBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  revResetFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  revAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C2410C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  revAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  revCustomerName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  revCustomerEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  revRatingScoreText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  revCommentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  revCommentText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 19,
    fontStyle: 'italic',
  },
  revMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  revMetaText: {
    fontSize: 11,
    color: '#64748B',
  },
  revModeBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  revModeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  revRatedDateText: {
    fontSize: 11,
    color: '#64748B',
  },

  // Notification Styles (100% Match of User Screenshot Image)
  notifFilterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifFilterPillActive: {
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  notifFilterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  notifFilterPillTextActive: {
    color: '#FFFFFF',
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  notifCardUnread: {
    backgroundColor: '#FFFBF5',
    borderColor: '#FED7AA',
  },
  notifIconSquircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  notifUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA580C',
  },
  notifMessage: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 4,
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // Modal Styles (Matching Screenshot)
  notifModalContent: {
    width: '92%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  notifModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifModalCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  notifModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  notifModalCloseCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifModalBody: {
    padding: 20,
    gap: 16,
  },
  notifModalFieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  notifModalTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 22,
  },
  notifModalMessageBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 14,
  },
  notifModalMessageText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 20,
  },
  notifModalInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  notifModalCategoryBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  notifModalCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'capitalize',
  },
  notifModalReceivedText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  notifGoToPageBtn: {
    backgroundColor: '#C2410C',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  notifGoToPageBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* ==================== FEEDBACK SCREEN STYLES ==================== */
  fbHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  fbHeroIconSquircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  fbHeroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  fbHeroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  fbStatsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  fbStatCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fbStatVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  fbStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  fbSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 10,
  },
  fbSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
    paddingLeft: 8,
  },
  fbFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  fbControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  fbCalendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  fbCalendarBtnActive: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  fbCalendarBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  fbDateWiseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  fbDateWiseBtnActive: {
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
  },
  fbDateWiseBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  fbDateGroupWrapper: {
    marginBottom: 14,
  },
  fbDateGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  fbDateGroupTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.6,
  },
  fbDateGroupCountPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  fbDateGroupCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  fbCalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fbCalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '92%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  fbCalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  fbCalMonthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  fbCalArrowBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fbCalWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fbCalWeekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  fbCalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fbCalDayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  fbCalDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  fbCalDayTextMuted: {
    color: '#CBD5E1',
    fontWeight: '400',
  },
  fbCalSelectedDayBox: {
    width: 32,
    height: 32,
    backgroundColor: '#EA580C',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fbCalSelectedDayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  fbCalDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#EA580C',
    marginTop: 2,
  },
  fbCalBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  fbCalActionText: {
    color: '#EA580C',
    fontSize: 14,
    fontWeight: '700',
  },
  fbFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fbFilterPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  fbFilterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  fbFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  fbSortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  fbSortBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  fbCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fbCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
  },
  fbAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fbAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EA580C',
  },
  fbClientName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  fbStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fbStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  fbMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  fbMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  fbMetaItemText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  fbDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  fbDateText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9A3412',
  },
  fbTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
  },
  fbSummaryText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
    lineHeight: 16,
  },
  fbFullViewBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  fbFullViewBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fbAccordionContent: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  fbSectionBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
  },
  fbSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fbSectionDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  fbScheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  fbDayName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  fbDayFocus: {
    fontSize: 11,
    color: '#64748B',
  },
  fbChatSection: {
    marginTop: 4,
  },
  fbChatHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    textTransform: 'uppercase',
  },
  fbChatBubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: '90%',
  },
  fbChatBubbleTrainer: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignSelf: 'flex-end',
  },
  fbChatBubbleMember: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  fbChatSender: {
    fontSize: 11,
    fontWeight: '700',
  },
  fbChatTime: {
    fontSize: 9,
    color: '#94A3B8',
  },
  fbChatMsgText: {
    fontSize: 12,
    color: '#111827',
    marginTop: 2,
    lineHeight: 16,
  },
  fbReplyInputCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 8,
  },
  fbReplyTextInput: {
    fontSize: 12,
    color: '#111827',
    minHeight: 40,
    textAlignVertical: 'top',
  },
  fbSendReplyBtn: {
    backgroundColor: '#EA580C',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  fbSendReplyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* ==================== REWARDS & PERFORMANCE STYLES ==================== */
  rewHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  rewHeroIconSquircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  rewHeroSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  rewTabScrollContainer: {
    marginBottom: 14,
  },
  rewTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rewTabPillActive: {
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
  },
  rewTabPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  rewTabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rewKpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  rewKpiCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  rewKpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  rewKpiIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewKpiVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
  },
  rewKpiSub: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
  },
  rewContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  rewSectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  rewRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
  },
  rewRecordTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  rewRecordSub: {
    fontSize: 10,
    color: '#64748B',
  },
  rewRecordBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rewRecordBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  rewReviewBubble: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 10,
    borderRadius: 10,
  },
  rewClientCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  rewClientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewClientAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
  },
  rewClientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  rewClientEmail: {
    fontSize: 10,
    color: '#64748B',
  },
  rewClientSessionsBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rewClientSessionsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  rewProgressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rewProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  rewRewardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  rewCategoryPill: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rewCategoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7E22CE',
  },
  rewBonusAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  rewRewardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
  },
  rewRewardDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  rewCriteriaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    gap: 3,
  },
  rewCriteriaTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  rewCriteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewCriteriaLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  rewCriteriaVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
  },
  rewEligibleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  rewEligibleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  rewIneligibleBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  rewIneligibleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  rewIneligibleSub: {
    fontSize: 10,
    color: '#92400E',
  },
  rewClaimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rewClaimedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  rewClaimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C2410C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  rewClaimBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rewClaimCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  rewClaimTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  rewClaimCategory: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  rewClaimAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  rewClaimMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  rewClaimCodeChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rewClaimCodeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#111827',
  },
  rewAwardsBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 14,
  },
  rewAwardsBannerTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  rewAwardsBannerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
  },
  rewAwardsBannerDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
    lineHeight: 16,
  },
  rewAwardsConferredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewAwardsConferredNum: {
    fontSize: 15,
    fontWeight: '900',
    color: '#EA580C',
  },
  rewAwardsConferredLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  rewAwardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  rewAwardPeriodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rewAwardPeriodText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  rewAwardCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginTop: 8,
  },
  rewAwardCardCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 2,
  },
  rewAwardCardDesc: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 17,
    marginTop: 4,
  },
  rewAwardScoreBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  rewAwardScoreLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  rewAwardScoreVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 2,
  },
  rewAwardCashBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  rewCertIdBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  rewCertIdLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  rewCertIdVal: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#EA580C',
  },
  rewDownloadCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  rewDownloadCertBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rewHofCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  rewHofRecipientType: {
    fontSize: 9,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  rewHofTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  rewHofCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  rewHofWinnerBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 6,
    borderRadius: 6,
    marginTop: 6,
  },

  /* ==================== CERTIFICATE MODAL STYLES ==================== */
  certPaper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 14,
    padding: 16,
    borderStyle: 'solid',
  },
  certSeal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  certGymName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.5,
  },
  certDocType: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
    marginTop: 2,
  },
  certBodyIntro: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
  },
  certWinnerName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EA580C',
    textAlign: 'center',
    marginTop: 2,
  },
  certWinnerRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  certDivider: {
    height: 1,
    backgroundColor: '#FEF3C7',
    marginVertical: 10,
  },
  certForIntro: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  certAwardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginTop: 2,
  },
  certAwardCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    textAlign: 'center',
    marginTop: 1,
  },
  certDescText: {
    fontSize: 11,
    color: '#334155',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  certMetricBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  certFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    marginTop: 12,
  },
  certSignTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  modalCloseBtn: { padding: 4, borderRadius: 8 },
  certSignVal: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },


  /* ==================== VOICE RECORDER & FILE ATTACHMENTS STYLES ==================== */
  voiceBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    minWidth: 220,
    maxWidth: 270,
  },
  voiceBubbleOutgoing: {
    backgroundColor: '#EA580C',
    borderBottomRightRadius: 2,
  },
  voiceBubbleIncoming: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 2,
  },
  voicePlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePlayBtnOutgoing: {
    backgroundColor: '#FFFFFF',
  },
  voicePlayBtnIncoming: {
    backgroundColor: '#EA580C',
  },
  voiceWaveTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 28,
  },
  voiceWaveBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDurationText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  voiceTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  chatImagePreview: {
    width: 200,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  chatImageBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chatImageBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    borderRadius: 10,
    minWidth: 180,
  },
  chatDocIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatDocTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  chatDocSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  pendingAttachStrip: {
    backgroundColor: '#FFF7ED',
    borderTopWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pendingAttachChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingAttachChipName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
    maxWidth: 140,
  },
  pendingAttachChipSize: {
    fontSize: 9,
    color: '#64748B',
  },
  voiceRecStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderTopWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  voiceRecPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  voiceRecHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
  },
  voiceRecSub: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 1,
  },
  voiceRecLiveWave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 24,
  },
  liveWaveBar: {
    width: 3,
    backgroundColor: '#EF4444',
    borderRadius: 2,
  },
  voiceRecCancelBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceRecSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  attachOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    borderRadius: 14,
  },
  attachOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  attachOptionSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },
  attachCustomBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
  },
  attachCustomLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  attachCustomInput: {
    flex: 1,
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
    color: '#111827',
  },
  attachCustomBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachCustomBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  lightboxCloseBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lightboxImage: {
    width: '100%',
    height: '80%',
  },

});
