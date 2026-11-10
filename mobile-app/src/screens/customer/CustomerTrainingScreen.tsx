import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { CustomerMessagesScreen } from './CustomerMessagesScreen';

type TabType = 'find_trainers' | 'my_trainer' | 'my_bookings' | 'online_sessions' | 'messages';

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
  duration?: number | string;
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
    duration: 60,
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
    specialization: 'Nutrition Coaching',
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
    fee: 0,
    hourlyRate: 0,
    duration: 60,
    paymentType: 'Per Session',
    availableDays: 'Monday - Friday',
    availableStartTime: '08:00 AM',
    availableEndTime: '07:00 PM',
    availableSlot: '60 Mins',
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
    if (tab === 'bookings' || tab === 'my_bookings') return 'my_bookings';
    if (tab === 'online-sessions' || tab === 'online_sessions') return 'online_sessions';
    if (tab === 'chat' || tab === 'messages') return 'messages';
    return 'find_trainers';
  };

  const [activeTab, setActiveTab] = useState<TabType>(resolveTab(initialSubTab));

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(resolveTab(initialSubTab));
    }
  }, [initialSubTab]);
  const [trainers, setTrainers] = useState<Trainer[]>(DEFAULT_TRAINERS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected trainer for profile modal
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);

  // Booking Modal State Matching Web MemberBookSession (Image 2 & 3)
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingTrainer, setBookingTrainer] = useState<Trainer | null>(null);
  const [bookingMode, setBookingMode] = useState<'In-Gym' | 'Online'>('Online');
  const [selectedDateDisplay, setSelectedDateDisplay] = useState(''); // e.g. "mm/dd/yyyy" placeholder or "11/10/2026"
  const [selectedDateValue, setSelectedDateValue] = useState(''); // e.g. "2026-11-10"
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(''); // e.g. "Choose a slot" placeholder or "09:00 AM"
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Calendar State & Handlers (Exact Parity with Image 3)
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date(2026, 10, 10));
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Manual Time Input States (User Request)
  const [timeSlots, setTimeSlots] = useState<string[]>([
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
  ]);
  const [showManualTimeSection, setShowManualTimeSection] = useState(false);
  const [manualHour, setManualHour] = useState('10');
  const [manualMinute, setManualMinute] = useState('00');
  const [manualPeriod, setManualPeriod] = useState<'AM' | 'PM'>('AM');
  const [manualCustomInput, setManualCustomInput] = useState('');

  const getCalendarDays = (currentDate: Date) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      day: number;
      isCurrentMonth: boolean;
      dateString: string;
      isoString: string;
      dateObj: Date;
    }> = [];

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = month === 0 ? 11 : month - 1;
      const prevY = month === 0 ? year - 1 : year;
      const dateObj = new Date(prevY, prevM, d);
      const mm = String(prevM + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      days.push({
        day: d,
        isCurrentMonth: false,
        dateString: `${mm}/${dd}/${prevY}`,
        isoString: `${prevY}-${mm}-${dd}`,
        dateObj,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateObj = new Date(year, month, d);
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      days.push({
        day: d,
        isCurrentMonth: true,
        dateString: `${mm}/${dd}/${year}`,
        isoString: `${year}-${mm}-${dd}`,
        dateObj,
      });
    }

    // Next month leading days to complete full grid of 35 or 42
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month === 11 ? 0 : month + 1;
      const nextY = month === 11 ? year + 1 : year;
      const dateObj = new Date(nextY, nextM, d);
      const mm = String(nextM + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      days.push({
        day: d,
        isCurrentMonth: false,
        dateString: `${mm}/${dd}/${nextY}`,
        isoString: `${nextY}-${mm}-${dd}`,
        dateObj,
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDay = (dayItem: { dateString: string; isoString: string; dateObj: Date }) => {
    setSelectedDateDisplay(dayItem.dateString);
    setSelectedDateValue(dayItem.isoString);
    setCalendarDate(dayItem.dateObj);
    setShowDatePickerModal(false);
  };

  const handleClearDate = () => {
    setSelectedDateDisplay('');
    setSelectedDateValue('');
    setShowDatePickerModal(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    setSelectedDateDisplay(`${mm}/${dd}/${yyyy}`);
    setSelectedDateValue(`${yyyy}-${mm}-${dd}`);
    setCalendarDate(today);
    setShowDatePickerModal(false);
  };

  const handleApplyManualTime = () => {
    let finalTime = '';
    if (manualCustomInput.trim()) {
      let val = manualCustomInput.trim();
      if (!val.toUpperCase().includes('AM') && !val.toUpperCase().includes('PM')) {
        val = `${val} ${manualPeriod}`;
      }
      finalTime = val.toUpperCase();
    } else {
      finalTime = `${manualHour.padStart(2, '0')}:${manualMinute.padStart(2, '0')} ${manualPeriod}`;
    }

    if (!timeSlots.includes(finalTime)) {
      setTimeSlots(prev => [...prev, finalTime]);
    }
    setSelectedTimeSlot(finalTime);
    setShowManualTimeSection(false);
    setShowTimeSlotModal(false);
  };

  // Bookings state
  const [bookingSubTab, setBookingSubTab] = useState<'booked' | 'history'>('booked');
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<any | null>(null);
  const [sessions, setSessions] = useState<any[]>([
    {
      _id: 'session-demo-2',
      bookingId: 'BK-90215',
      trainerName: 'selva kumar',
      trainerSpecialization: 'Nutrition Coaching',
      mode: 'In-Gym',
      status: 'Confirmed',
      date: '2026-11-12',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      timeSlot: '09:00 AM - 10:00 AM',
      duration: '60 min',
      fee: 0,
      attendance: 'Scheduled',
      checkInTime: null,
      checkOutTime: null,
      meetingLink: null,
      customerRating: null,
      customerReview: null,
      sessionNotes: null,
    },
    {
      _id: 'session-demo-1',
      bookingId: 'BK-89421',
      trainerName: 'Naveen',
      trainerSpecialization: 'Personal Trainer & Strength Coach',
      mode: 'Online',
      status: 'Completed',
      date: '2026-10-15',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      timeSlot: '10:00 AM - 11:00 AM',
      duration: '60 min',
      fee: 750,
      attendance: 'Present',
      checkInTime: '10:02 AM',
      checkOutTime: '10:58 AM',
      rating: 5,
      customerRating: 5,
      customerReview: 'Great coach Naveen, very disciplined workout guidance and form correction.',
      reviewText: 'Great coach Naveen, very disciplined workout guidance and form correction.',
      meetingLink: 'https://meet.jit.si/aigym-session-89421',
      sessionNotes: {
        exercisesCompleted: 'Barbell Squats 4x10, Incline Dumbbell Press 4x12, Cable Rows 3x15, Plank 3x60s',
        customerPerformance: 'Excellent form on squats with progressive overload. Good endurance maintained.',
        dietRecommendations: 'Increase protein intake to 140g/day. Hydrate with 3.5L water.',
        nextSessionFocus: 'Deadlifts form analysis and hamstring mobility drills.',
      },
    },
  ]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Pending':
        return { label: 'Waiting for Trainer Approval', color: '#92400E', bg: '#FEF3C7', border: '#FDE68A' };
      case 'Confirmed':
      case 'Approved':
      case 'Upcoming':
        return { label: 'Trainer Approved', color: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5' };
      case 'In Progress':
        return { label: 'In Progress', color: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5' };
      case 'Rejected':
        return { label: 'Trainer Rejected', color: '#9F1239', bg: '#FFE4E6', border: '#FECDD3' };
      case 'Completed':
        return { label: 'Session Completed', color: '#166534', bg: '#DCFCE7', border: '#BBF7D0' };
      case 'Cancelled':
        return { label: 'Booking Cancelled', color: '#475569', bg: '#F1F5F9', border: '#E2E8F0' };
      case 'Awaiting Payment':
        return { label: 'Awaiting Payment', color: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5' };
      default:
        return { label: status, color: '#111827', bg: '#F8FAFC', border: '#E2E8F0' };
    }
  };

  const formatSessionDate = (dateVal: any) => {
    if (!dateVal) return 'N/A';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(dateVal);
    }
  };

  const safeParseDateStr = (dateVal: any, fallback = '2026-10-15'): string => {
    if (!dateVal) return fallback;
    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
      return String(dateVal);
    } catch {
      return String(dateVal);
    }
  };

  const safeParseTimeStr = (timeVal: any): string | null => {
    if (!timeVal) return null;
    if (typeof timeVal === 'string' && !timeVal.includes('T')) return timeVal;
    try {
      const d = new Date(timeVal);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      return String(timeVal);
    } catch {
      return String(timeVal);
    }
  };

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
            specialization: t.specialization || (isNaveen ? 'Personal Trainer & Strength Coach' : (isSelva ? 'Nutrition Coaching' : 'General Fitness')),
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
            fee: t.fee !== undefined ? t.fee : (isSelva ? 0 : 750),
            hourlyRate: t.hourlyRate !== undefined ? t.hourlyRate : (isSelva ? 0 : 750),
            duration: t.duration || 60,
            paymentType: t.paymentType || 'Per Session',
            availableDays: t.availableDays || (isSelva ? 'Monday - Friday' : 'Monday - Saturday'),
            availableStartTime: t.availableStartTime || (isSelva ? '08:00 AM' : '06:00 AM'),
            availableEndTime: t.availableEndTime || (isSelva ? '07:00 PM' : '09:00 PM'),
            availableSlot: t.availableSlot ? (typeof t.availableSlot === 'number' ? `${t.availableSlot} Mins` : t.availableSlot) : (isSelva ? '60 Mins' : '60 Mins'),
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
          bookingId: s.bookingId || `#${(s._id || s.id || '').slice(-8)}`,
          trainerId: s.trainerId,
          trainerName: s.trainerId?.name || s.trainerName || 'Naveen',
          trainerSpecialization: s.trainerId?.specialization || 'Personal Trainer',
          mode: s.mode || (s.trainingMode === 'Offline' ? 'In-Gym' : 'Online'),
          status: s.status || 'Confirmed',
          date: safeParseDateStr(s.date, '2026-10-15'),
          startTime: s.startTime || '10:00 AM',
          endTime: s.endTime || '11:00 AM',
          timeSlot: s.timeSlot || `${s.startTime || '10:00 AM'} - ${s.endTime || '11:00 AM'}`,
          duration: s.duration ? `${s.duration} min` : '60 min',
          fee: s.fee !== undefined ? s.fee : (s.hourlyRate || 0),
          attendance: s.attendance || s.attendanceStatus || (s.checkInTime ? 'Present' : 'Scheduled'),
          attendanceStatus: s.attendanceStatus,
          checkInTime: safeParseTimeStr(s.checkInTime),
          checkOutTime: safeParseTimeStr(s.checkOutTime),
          customerRating: s.customerRating || s.rating,
          customerReview: s.customerReview || s.reviewText,
          rating: s.customerRating || s.rating,
          reviewText: s.customerReview || s.reviewText,
          meetingLink: s.meetingLink || (s.mode === 'Online' ? `https://meet.jit.si/aigym-session-${(s._id || '').slice(-6)}` : null),
          sessionNotes: s.sessionNotes,
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

  // Open booking modal matching Web MemberBookSession (Image 2)
  const handleOpenBooking = (trainer: Trainer) => {
    setBookingTrainer(trainer);
    setBookingMode('Online'); // Default to Online matching Image 2
    setSelectedDateDisplay(''); // Shows mm/dd/yyyy placeholder matching Image 2
    setSelectedDateValue('');
    setSelectedTimeSlot(''); // Shows Choose a slot placeholder matching Image 2
    setCalendarDate(new Date(2026, 10, 10));
    setShowManualTimeSection(false);
    setManualCustomInput('');
    setBookingModalVisible(true);
  };

  // Submit booking matching Web MemberBookSession
  const handleConfirmBooking = async () => {
    if (!bookingTrainer) return;

    if (!selectedDateDisplay) {
      Alert.alert('Select Date', 'Please select a session date.');
      return;
    }

    if (!selectedTimeSlot) {
      Alert.alert('Select Time', 'Please choose a session time slot.');
      return;
    }

    try {
      setSubmittingBooking(true);
      const startParts = selectedTimeSlot.split(':');
      let hour = parseInt(startParts[0]);
      const minAMPM = (startParts[1] || '00 AM').split(' ');
      const min = parseInt(minAMPM[0] || '0');
      const ampm = minAMPM[1] || 'AM';
      
      let endHour = hour + 1;
      let endAmpm = ampm;
      if (endHour === 12) {
        endAmpm = ampm === 'AM' ? 'PM' : 'AM';
      } else if (endHour > 12) {
        endHour -= 12;
      }
      
      const computedEndTime = `${endHour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} ${endAmpm}`;
      const bookingDate = selectedDateValue || new Date().toISOString().split('T')[0];
      const mode = bookingMode === 'In-Gym' ? 'Offline' : 'Online';

      const payload = {
        trainerId: bookingTrainer._id,
        mode,
        date: bookingDate,
        startTime: selectedTimeSlot,
        endTime: computedEndTime,
        duration: 60,
      };

      // Submit to backend session request API matching Web MemberBookSession
      await api.post('/trainer-sessions/request', payload).catch(() => api.post('/trainer-sessions', payload));

      const newBooking = {
        _id: 'bkg-' + Date.now(),
        bookingId: 'BK-' + Math.floor(10000 + Math.random() * 90000),
        trainerId: bookingTrainer._id,
        trainerName: bookingTrainer.name,
        trainerSpecialization: bookingTrainer.specialization,
        mode: bookingMode === 'In-Gym' ? 'In-Gym' : 'Online',
        status: 'Pending',
        date: bookingDate,
        startTime: selectedTimeSlot,
        endTime: computedEndTime,
        timeSlot: `${selectedTimeSlot} – ${computedEndTime}`,
        duration: '60 min',
        fee: bookingTrainer.fee || 0,
        attendance: 'Scheduled',
        checkInTime: null,
        checkOutTime: null,
        meetingLink: bookingMode === 'Online' ? `https://meet.jit.si/aigym-session-${Math.floor(100000 + Math.random() * 900000)}` : null,
        customerRating: null,
        customerReview: null,
        sessionNotes: null,
      };

      setSessions(prev => [newBooking, ...prev.filter(s => s._id !== newBooking._id)]);

      // Refresh real sessions from database
      await fetchSessions();

      setBookingModalVisible(false);
      Alert.alert('Booking Confirmed! 🎉', `Your ${mode} session request with ${bookingTrainer.name} on ${selectedDateDisplay} at ${selectedTimeSlot} has been sent.`);
      setActiveTab('my_bookings');
    } catch (err) {
      console.warn('Booking session notice:', err);
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

  // Active trainer for "My Trainer" view (dynamically resolves to booked trainer)
  const bookedTrainerName = sessions.find(s => ['Pending', 'Confirmed', 'Approved', 'Upcoming'].includes(s.status))?.trainerName;
  const myTrainer = (bookedTrainerName && trainers.find(t => t.name.toLowerCase() === bookedTrainerName.toLowerCase()))
    || trainers.find(t => t.name.toLowerCase().includes('selva'))
    || trainers.find(t => t.name.toLowerCase().includes('naveen'))
    || trainers[0]
    || DEFAULT_TRAINERS[1];

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
              {(myTrainer?.name || 'Selva Kumar').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </Text>
            <View style={styles.awardBadge}>
              <Ionicons name="trophy" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.myTrainerNameLarge}>{myTrainer?.name || 'selva kumar'}</Text>
          <Text style={styles.myTrainerSpecLarge}>{myTrainer?.specialization || 'Nutrition Coaching'}</Text>
          <View style={styles.myTrainerRatingRow}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.myTrainerRatingVal}>{myTrainer?.rating || 5.0}</Text>
            <Text style={styles.myTrainerRatingReviews}>({myTrainer?.reviewsCount || 12} Reviews)</Text>
          </View>
        </View>
      </View>

      {/* About Section Matching Web Image 2 */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeading}>About {(myTrainer?.name || 'Coach').split(' ')[0]}</Text>
        <Text style={styles.sectionBodyText}>
          {myTrainer?.bio || 'Dedicated nutrition and functional fitness coach.'}
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
    const bookedStatuses = ['Pending', 'Awaiting Payment', 'Confirmed', 'Approved', 'Upcoming', 'In Progress', 'Reschedule Requested', 'Rescheduled'];
    const bookedSessions = sessions.filter(s => bookedStatuses.includes(s.status));
    const historySessions = sessions.filter(s => !bookedStatuses.includes(s.status));
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
            onPress={() => {
              const trainerToBook = trainers.find(t => t.name.toLowerCase().includes('selva')) || myTrainer || trainers[0];
              if (trainerToBook) {
                handleOpenBooking(trainerToBook);
              }
            }}
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
            <Text style={styles.delEmptyTitle}>
              {bookingSubTab === 'booked' ? 'No booked sessions found' : 'No session history found'}
            </Text>
            <Text style={styles.delEmptySub}>
              {bookingSubTab === 'booked'
                ? 'You don’t have any active booked coaching sessions scheduled.'
                : 'You have not completed any coaching sessions yet.'}
            </Text>
            {bookingSubTab === 'booked' && (
              <TouchableOpacity 
                style={[styles.bookSessionBtn, { marginTop: 16 }]}
                onPress={() => {
                  const trainerToBook = trainers.find(t => t.name.toLowerCase().includes('selva')) || myTrainer || trainers[0];
                  if (trainerToBook) {
                    handleOpenBooking(trainerToBook);
                  }
                }}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.bookSessionText}>Book New Session</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          displayed.map(s => {
            const statusConfig = getStatusDisplay(s.status);
            return (
              <View key={s._id} style={styles.bookingCard}>
                <View style={styles.bookingTopRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                    <View style={styles.bookingMiniAvatar}>
                      <Text style={styles.bookingMiniAvatarText}>
                        {(s.trainerName || 'T').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bookingTrainerName}>{s.trainerName}</Text>
                      <Text style={styles.bookingTrainerSpec}>{s.trainerSpecialization} • {s.mode}</Text>
                    </View>
                  </View>
                  <View style={[
                    styles.statusPill, 
                    { backgroundColor: statusConfig.bg, borderColor: statusConfig.border, borderWidth: 1 }
                  ]}>
                    <Text style={[styles.statusPillText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {s.bookingId && (
                  <View style={{ marginBottom: 8, flexDirection: 'row' }}>
                    <Text style={styles.bookingCardIdBadge}>{s.bookingId}</Text>
                  </View>
                )}

                <View style={styles.bookingScheduleRow}>
                  <View style={styles.scheduleItem}>
                    <Ionicons name="calendar-outline" size={14} color="#EA580C" />
                    <Text style={styles.scheduleText}>{formatSessionDate(s.date)}</Text>
                  </View>
                  <View style={styles.scheduleItem}>
                    <Ionicons name="time-outline" size={14} color="#EA580C" />
                    <Text style={styles.scheduleText}>{s.timeSlot || `${s.startTime || ''} – ${s.endTime || ''}`}</Text>
                  </View>
                </View>

                {/* Rating badge if rated */}
                {(s.customerRating || s.rating) && (
                  <View style={styles.bookingRatingPill}>
                    <Ionicons name="star" size={13} color="#B45309" />
                    <Text style={styles.bookingRatingPillText}>★ {s.customerRating || s.rating}/5 Rated</Text>
                  </View>
                )}

                {/* Review note if available */}
                {(s.customerReview || s.reviewText) ? (
                  <View style={styles.bookingReviewBox}>
                    <Text style={styles.bookingReviewNote}>"{s.customerReview || s.reviewText}"</Text>
                  </View>
                ) : null}

                {/* Action Buttons Row with View Details Button */}
                <View style={styles.bookingActionsRow}>
                  <TouchableOpacity
                    style={styles.viewDetailsBtn}
                    onPress={() => setSelectedSessionForDetails(s)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="eye-outline" size={14} color="#111827" />
                    <Text style={styles.viewDetailsBtnText}>View Details</Text>
                  </TouchableOpacity>

                  {s.mode === 'Online' && ['Confirmed', 'Approved', 'Upcoming', 'In Progress'].includes(s.status) && (
                    <TouchableOpacity
                      style={styles.joinOnlineBtn}
                      onPress={() => {
                        const link = s.meetingLink || `https://meet.jit.si/aigym-session-${(s._id || '').slice(-6)}`;
                        Linking.openURL(link).catch(() => Alert.alert('Error', 'Could not open meeting link.'));
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="videocam" size={13} color="#FFFFFF" />
                      <Text style={styles.joinOnlineBtnText}>Join Session</Text>
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
          onPress={() => {
            const trainerToBook = trainers.find(t => t.name.toLowerCase().includes('selva')) || myTrainer || trainers[0];
            if (trainerToBook) {
              handleOpenBooking(trainerToBook);
            } else {
              setActiveTab('find_trainers');
            }
          }}
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

          {/* Action Row with View Details Button */}
          <View style={[styles.bookingActionsRow, { marginTop: 10 }]}>
            <TouchableOpacity
              style={styles.viewDetailsBtn}
              onPress={() => setSelectedSessionForDetails(s)}
              activeOpacity={0.7}
            >
              <Ionicons name="eye-outline" size={14} color="#111827" />
              <Text style={styles.viewDetailsBtnText}>View Details</Text>
            </TouchableOpacity>
          </View>
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
        {activeTab === 'my_bookings' && renderMyBookingsView()}
        {activeTab === 'online_sessions' && renderOnlineSessionsView()}
        {activeTab === 'messages' && <CustomerMessagesScreen />}
      </View>

      {/* VIEW PROFILE MODAL - FULL PARITY WITH WEB APPLICATION (MemberFindTrainers.tsx) */}
      {!!selectedTrainer && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 1000 }]}>
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
      </View>
      )}

      {/* BOOK SESSION SCREEN - FULL PARITY WITH WEB REFERENCE (IMAGE 2) */}
      {bookingModalVisible && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? 25 : 44, zIndex: 1050 }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Header Matching Image 2 */}
              <View style={styles.webBookHeader}>
                <TouchableOpacity 
                  onPress={() => setBookingModalVisible(false)}
                  style={styles.webBookBackBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={22} color="#111827" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={styles.webBookTitle}>Book a Session</Text>
                  <Text style={styles.webBookSubtitle}>Schedule your next training session with an expert.</Text>
                </View>
              </View>

              {bookingTrainer && (
                <View style={styles.webBookCard}>
                  {/* Selected Trainer */}
                  <Text style={styles.webBookFieldLabel}>Selected Trainer</Text>
                  <View style={styles.webBookTrainerCard}>
                    <View style={styles.webBookTrainerLeft}>
                      <View style={styles.webBookAvatar}>
                        <Text style={styles.webBookAvatarText}>
                          {bookingTrainer.name ? bookingTrainer.name.trim().charAt(0).toLowerCase() : 's'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.webBookTrainerName} numberOfLines={1}>
                          {bookingTrainer.name}
                        </Text>
                        <Text style={styles.webBookTrainerSpec} numberOfLines={1}>
                          {bookingTrainer.specialization || 'Nutrition Coaching'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.webBookTrainerRight}>
                      <Text style={styles.webBookFee}>
                        ₹{bookingTrainer.fee !== undefined && bookingTrainer.fee !== null ? bookingTrainer.fee : 0}
                      </Text>
                      <Text style={styles.webBookDuration}>
                        {bookingTrainer.duration || 60} mins/session
                      </Text>
                    </View>
                  </View>

                  {/* Session Type */}
                  <Text style={styles.webBookFieldLabel}>Session Type</Text>
                  <View style={styles.webBookTypeRow}>
                    <TouchableOpacity
                      style={[
                        styles.webBookTypeCard,
                        bookingMode === 'In-Gym' && styles.webBookTypeCardActive
                      ]}
                      onPress={() => setBookingMode('In-Gym')}
                      activeOpacity={0.8}
                    >
                      <Ionicons 
                        name="location-outline" 
                        size={24} 
                        color={bookingMode === 'In-Gym' ? '#EA580C' : '#64748B'} 
                        style={{ marginBottom: 6 }}
                      />
                      <Text style={[
                        styles.webBookTypeText,
                        bookingMode === 'In-Gym' && styles.webBookTypeTextActive
                      ]}>
                        In-Gym
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.webBookTypeCard,
                        bookingMode === 'Online' && styles.webBookTypeCardActive
                      ]}
                      onPress={() => setBookingMode('Online')}
                      activeOpacity={0.8}
                    >
                      <Ionicons 
                        name="videocam-outline" 
                        size={24} 
                        color={bookingMode === 'Online' ? '#EA580C' : '#64748B'} 
                        style={{ marginBottom: 6 }}
                      />
                      <Text style={[
                        styles.webBookTypeText,
                        bookingMode === 'Online' && styles.webBookTypeTextActive
                      ]}>
                        Online
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Select Date */}
                  <View style={styles.webBookInputHeaderRow}>
                    <Ionicons name="calendar-outline" size={16} color="#64748B" />
                    <Text style={styles.webBookInputLabel}>Select Date</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.webBookInputBox}
                    onPress={() => setShowDatePickerModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.webBookInputVal,
                      !selectedDateDisplay && styles.webBookInputPlaceholder
                    ]}>
                      {selectedDateDisplay || 'mm/dd/yyyy'}
                    </Text>
                    <Ionicons name="calendar-outline" size={18} color="#64748B" />
                  </TouchableOpacity>

                  {/* Select Time */}
                  <View style={styles.webBookInputHeaderRow}>
                    <Ionicons name="time-outline" size={16} color="#64748B" />
                    <Text style={styles.webBookInputLabel}>Select Time</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.webBookInputBox}
                    onPress={() => setShowTimeSlotModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.webBookInputVal,
                      !selectedTimeSlot && styles.webBookInputPlaceholder
                    ]}>
                      {selectedTimeSlot || 'Choose a slot'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#64748B" />
                  </TouchableOpacity>

                  {/* Send Booking Request Button */}
                  <TouchableOpacity
                    style={styles.webBookSubmitBtn}
                    onPress={handleConfirmBooking}
                    disabled={submittingBooking}
                    activeOpacity={0.85}
                  >
                    {submittingBooking ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.webBookSubmitBtnText}>Sending Request...</Text>
                      </View>
                    ) : (
                      <Text style={styles.webBookSubmitBtnText}>
                        Send Booking Request
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}

      {/* DATE PICKER OVERLAY - EXACT PARITY WITH IMAGE 3 */}
      {showDatePickerModal && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 1100 }]}>
          <TouchableOpacity 
            style={styles.pickerModalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowDatePickerModal(false)}
          >
          <View style={styles.calendarCard}>
            {/* Calendar Header matching Image 3: Month Year + Up/Down arrows */}
            <View style={styles.calendarHeaderRow}>
              <View style={styles.calendarMonthTitleBtn}>
                <Text style={styles.calendarMonthTitle}>
                  {MONTH_NAMES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                </Text>
                <Ionicons name="caret-down" size={13} color="#111827" style={{ marginLeft: 4 }} />
              </View>

              <View style={styles.calendarArrowsRow}>
                <TouchableOpacity 
                  style={styles.calendarArrowBtn} 
                  onPress={handlePrevMonth}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-up" size={18} color="#475569" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.calendarArrowBtn} 
                  onPress={handleNextMonth}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-down" size={18} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Days of Week Header matching Image 3: Su Mo Tu We Th Fr Sa */}
            <View style={styles.calendarWeekdaysRow}>
              {WEEKDAYS.map(w => (
                <Text key={w} style={styles.calendarWeekdayText}>{w}</Text>
              ))}
            </View>

            {/* Calendar Days Grid matching Image 3 */}
            <View style={styles.calendarGrid}>
              {getCalendarDays(calendarDate).map((dayItem, idx) => {
                const isSelected = selectedDateValue === dayItem.isoString;
                return (
                  <TouchableOpacity
                    key={`${dayItem.isoString}-${idx}`}
                    style={styles.calendarDayCell}
                    onPress={() => handleSelectDay(dayItem)}
                    activeOpacity={0.7}
                  >
                    {isSelected ? (
                      <View style={styles.calendarSelectedDayBox}>
                        <Text style={styles.calendarSelectedDayText}>{dayItem.day}</Text>
                      </View>
                    ) : (
                      <Text style={[
                        styles.calendarDayText,
                        !dayItem.isCurrentMonth && styles.calendarDayTextMuted,
                      ]}>
                        {dayItem.day}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bottom Row matching Image 3: Clear on left, Today on right */}
            <View style={styles.calendarBottomRow}>
              <TouchableOpacity onPress={handleClearDate} activeOpacity={0.7} style={{ padding: 6 }}>
                <Text style={styles.calendarActionText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSelectToday} activeOpacity={0.7} style={{ padding: 6 }}>
                <Text style={styles.calendarActionText}>Today</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      )}

      {/* TIME SLOT DROPDOWN OVERLAY WITH MANUALLY ADD TIME BUTTON */}
      {showTimeSlotModal && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 1100 }]}>
          <TouchableOpacity 
            style={styles.pickerModalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowTimeSlotModal(false)}
          >
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="time" size={18} color="#EA580C" />
                <Text style={styles.pickerTitle}>Select Time Slot</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTimeSlotModal(false)}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {timeSlots.map(slot => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    onPress={() => {
                      setSelectedTimeSlot(slot);
                      setShowTimeSlotModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                      {slot}
                    </Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={18} color="#EA580C" />}
                  </TouchableOpacity>
                );
              })}

              {/* + Manually Add Time Button */}
              <TouchableOpacity
                style={styles.manualTimeToggleBtn}
                onPress={() => setShowManualTimeSection(prev => !prev)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={showManualTimeSection ? "remove-circle-outline" : "add-circle-outline"} 
                  size={18} 
                  color="#EA580C" 
                />
                <Text style={styles.manualTimeToggleText}>
                  {showManualTimeSection ? 'Hide Manual Time' : '+ Manually Add Time'}
                </Text>
              </TouchableOpacity>

              {/* Manually Add Time Form */}
              {showManualTimeSection && (
                <View style={styles.manualTimeFormCard}>
                  <Text style={styles.manualTimeFormTitle}>Enter Custom Session Time</Text>
                  
                  {/* Hour Selector */}
                  <View>
                    <Text style={styles.manualFieldLabel}>Select Hour</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 4 }}>
                      {['05', '06', '07', '08', '09', '10', '11', '12', '01', '02', '03', '04'].map((h, idx) => (
                        <TouchableOpacity
                          key={`hour-${h}-${idx}`}
                          style={[styles.timeChip, manualHour === h && styles.timeChipActive]}
                          onPress={() => {
                            setManualHour(h);
                            setManualCustomInput('');
                          }}
                        >
                          <Text style={[styles.timeChipText, manualHour === h && styles.timeChipTextActive]}>{h}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Minute & AM/PM Selector */}
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.manualFieldLabel}>Minute</Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {['00', '15', '30', '45'].map((m, idx) => (
                          <TouchableOpacity
                            key={`min-${m}-${idx}`}
                            style={[styles.timeChip, manualMinute === m && styles.timeChipActive, { flex: 1, alignItems: 'center' }]}
                            onPress={() => {
                              setManualMinute(m);
                              setManualCustomInput('');
                            }}
                          >
                            <Text style={[styles.timeChipText, manualMinute === m && styles.timeChipTextActive]}>:{m}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={{ width: 105 }}>
                      <Text style={styles.manualFieldLabel}>Period</Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {(['AM', 'PM'] as const).map((p, idx) => (
                          <TouchableOpacity
                            key={`period-${p}-${idx}`}
                            style={[styles.timeChip, manualPeriod === p && styles.timeChipActive, { flex: 1, alignItems: 'center' }]}
                            onPress={() => {
                              setManualPeriod(p);
                              setManualCustomInput('');
                            }}
                          >
                            <Text style={[styles.timeChipText, manualPeriod === p && styles.timeChipTextActive]}>{p}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* Type Custom Time Directly */}
                  <View style={{ marginTop: 6 }}>
                    <Text style={styles.manualFieldLabel}>Or Type Exact Time</Text>
                    <TextInput
                      style={styles.manualTextInput}
                      placeholder="e.g. 07:30 AM or 05:45 PM"
                      placeholderTextColor="#94A3B8"
                      value={manualCustomInput}
                      onChangeText={setManualCustomInput}
                    />
                  </View>

                  {/* Preview & Submit */}
                  <View style={styles.manualPreviewRow}>
                    <Text style={styles.manualPreviewLabel}>Selected Slot:</Text>
                    <Text style={styles.manualPreviewTime}>
                      {manualCustomInput.trim() || `${manualHour}:${manualMinute} ${manualPeriod}`}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.applyManualTimeBtn}
                    onPress={handleApplyManualTime}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.applyManualTimeBtnText}>Confirm Custom Time</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </View>
      )}

      {/* SESSION DETAILS OVERLAY - EXACT PARITY WITH WEB (MemberMyBookings.tsx lines 356-495) */}
      {!!selectedSessionForDetails && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 1000 }]}>
          <TouchableOpacity 
            style={styles.sessionDetailsOverlay}
            activeOpacity={1}
            onPress={() => setSelectedSessionForDetails(null)}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              style={styles.sessionDetailsModalCard}
              onPress={(e) => e.stopPropagation?.()}
            >
            {/* Header: Trainer Avatar, Name, Specialization, Close Button */}
            <View style={styles.sessionDetailsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                <View style={styles.sessionTrainerAvatar}>
                  <Text style={styles.sessionTrainerAvatarText}>
                    {(selectedSessionForDetails?.trainerName || 'T').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionTrainerName} numberOfLines={1}>
                    {selectedSessionForDetails?.trainerName || 'Assigned Trainer'}
                  </Text>
                  <Text style={styles.sessionTrainerSpec} numberOfLines={1}>
                    {selectedSessionForDetails?.trainerSpecialization || 'Personal Trainer'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedSessionForDetails(null)}
                style={styles.modalCloseIconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Body */}
            <ScrollView 
              style={styles.sessionDetailsBody} 
              contentContainerStyle={{ padding: 16, gap: 14 }}
              showsVerticalScrollIndicator={false}
            >
              {/* 1. Booking Identifier & Status */}
              <View style={styles.bookingIdRow}>
                <View>
                  <Text style={styles.bookingIdLabel}>Booking Identifier</Text>
                  <Text style={styles.bookingIdValue}>
                    {selectedSessionForDetails?.bookingId || `#${(selectedSessionForDetails?._id || '').slice(-8)}`}
                  </Text>
                </View>
                {selectedSessionForDetails && (
                  <View style={[
                    styles.detailsStatusBadge,
                    { 
                      backgroundColor: getStatusDisplay(selectedSessionForDetails.status).bg,
                      borderColor: getStatusDisplay(selectedSessionForDetails.status).border,
                    }
                  ]}>
                    <Text style={[
                      styles.detailsStatusText,
                      { color: getStatusDisplay(selectedSessionForDetails.status).color }
                    ]}>
                      {getStatusDisplay(selectedSessionForDetails.status).label}
                    </Text>
                  </View>
                )}
              </View>

              {/* 2. Session Schedule & Details */}
              <View style={{ gap: 6 }}>
                <Text style={styles.sectionHeaderTitle}>Session Schedule & Details</Text>
                <View style={styles.detailsSectionCard}>
                  {/* Date */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailRowLabel}>
                      <Ionicons name="calendar-outline" size={15} color="#EA580C" />
                      <Text style={styles.detailLabelText}>Date</Text>
                    </View>
                    <Text style={styles.detailValueText}>
                      {formatSessionDate(selectedSessionForDetails?.date)}
                    </Text>
                  </View>

                  {/* Time Slot */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailRowLabel}>
                      <Ionicons name="time-outline" size={15} color="#EA580C" />
                      <Text style={styles.detailLabelText}>Time Slot</Text>
                    </View>
                    <Text style={styles.detailValueText}>
                      {selectedSessionForDetails?.timeSlot || `${selectedSessionForDetails?.startTime || ''} – ${selectedSessionForDetails?.endTime || ''}`}
                    </Text>
                  </View>

                  {/* Training Mode */}
                  <View style={styles.detailRow}>
                    <View style={styles.detailRowLabel}>
                      <Ionicons name="videocam-outline" size={15} color="#EA580C" />
                      <Text style={styles.detailLabelText}>Training Mode</Text>
                    </View>
                    <Text style={[styles.detailValueText, { color: '#EA580C', fontWeight: '700' }]}>
                      {selectedSessionForDetails?.mode === 'Online' || selectedSessionForDetails?.mode?.includes('Online') ? 'Online Virtual Session' : 'In-Gym Session'}
                    </Text>
                  </View>

                  {/* Session Fee if > 0 */}
                  {selectedSessionForDetails?.fee !== undefined && selectedSessionForDetails.fee > 0 && (
                    <View style={[styles.detailRow, { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
                      <Text style={styles.detailLabelText}>Session Fee</Text>
                      <Text style={[styles.detailValueText, { color: '#EA580C', fontWeight: '800' }]}>
                        ₹{selectedSessionForDetails.fee}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* 3. Attendance Activity (if checkInTime or checkOutTime) */}
              {(selectedSessionForDetails?.checkInTime || selectedSessionForDetails?.checkOutTime) && (
                <View style={{ gap: 6 }}>
                  <Text style={styles.sectionHeaderTitle}>Attendance Activity</Text>
                  <View style={styles.attendanceGrid}>
                    {selectedSessionForDetails?.checkInTime && (
                      <View style={styles.attendanceCol}>
                        <Text style={styles.attendanceColLabel}>Checked In</Text>
                        <Text style={styles.attendanceColTime}>
                          {selectedSessionForDetails.checkInTime}
                        </Text>
                      </View>
                    )}
                    {selectedSessionForDetails?.checkOutTime && (
                      <View style={styles.attendanceCol}>
                        <Text style={styles.attendanceColLabel}>Checked Out</Text>
                        <Text style={styles.attendanceColTime}>
                          {selectedSessionForDetails.checkOutTime}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* 4. Virtual Meeting Room (if Online) */}
              {(selectedSessionForDetails?.mode === 'Online' || selectedSessionForDetails?.mode?.includes('Online')) && (
                <View style={{ gap: 6 }}>
                  <Text style={styles.sectionHeaderTitle}>Virtual Meeting Room</Text>
                  <View style={styles.meetingRoomCard}>
                    <Text style={styles.meetingRoomLink} numberOfLines={1}>
                      {selectedSessionForDetails?.meetingLink || `meet.jit.si/aigym-session-${(selectedSessionForDetails?._id || '').slice(-6)}`}
                    </Text>
                    <TouchableOpacity
                      style={styles.joinNowBtn}
                      onPress={() => {
                        const url = selectedSessionForDetails?.meetingLink || `https://meet.jit.si/aigym-session-${(selectedSessionForDetails?._id || '').slice(-6)}`;
                        Linking.openURL(url).catch(() => Alert.alert('Error', 'Unable to open meeting URL.'));
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.joinNowBtnText}>Join Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 5. Your Rating & Review (if rated) */}
              {(selectedSessionForDetails?.customerRating || selectedSessionForDetails?.rating) && (
                <View style={{ gap: 6 }}>
                  <Text style={styles.sectionHeaderTitle}>Your Rating & Review</Text>
                  <View style={styles.ratingBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Ionicons name="star" size={16} color="#B45309" />
                      <Text style={styles.ratingNumber}>
                        {selectedSessionForDetails.customerRating || selectedSessionForDetails.rating} / 5
                      </Text>
                    </View>
                    {(selectedSessionForDetails?.customerReview || selectedSessionForDetails?.reviewText) && (
                      <Text style={styles.reviewQuote}>
                        "{selectedSessionForDetails.customerReview || selectedSessionForDetails.reviewText}"
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* 6. Trainer Notes (if sessionNotes exists) */}
              {selectedSessionForDetails?.sessionNotes && (
                <View style={{ gap: 6 }}>
                  <Text style={styles.sectionHeaderTitle}>Trainer Notes</Text>
                  <View style={styles.notesCard}>
                    {selectedSessionForDetails.sessionNotes.exercisesCompleted && (
                      <Text style={styles.noteLine}>
                        <Text style={styles.noteBold}>Exercises: </Text>
                        {selectedSessionForDetails.sessionNotes.exercisesCompleted}
                      </Text>
                    )}
                    {selectedSessionForDetails.sessionNotes.customerPerformance && (
                      <Text style={styles.noteLine}>
                        <Text style={styles.noteBold}>Performance: </Text>
                        {selectedSessionForDetails.sessionNotes.customerPerformance}
                      </Text>
                    )}
                    {selectedSessionForDetails.sessionNotes.dietRecommendations && (
                      <Text style={styles.noteLine}>
                        <Text style={styles.noteBold}>Diet: </Text>
                        {selectedSessionForDetails.sessionNotes.dietRecommendations}
                      </Text>
                    )}
                    {selectedSessionForDetails.sessionNotes.nextSessionFocus && (
                      <Text style={styles.noteLine}>
                        <Text style={styles.noteBold}>Next Focus: </Text>
                        {selectedSessionForDetails.sessionNotes.nextSessionFocus}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Sticky Bottom Close Button */}
            <View style={styles.sessionDetailsFooter}>
              <TouchableOpacity
                style={styles.closeFooterBtn}
                onPress={() => setSelectedSessionForDetails(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeFooterBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
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
  bookingMiniAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingMiniAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
  },
  bookingCardIdBadge: {
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  bookingRatingPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  bookingActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  viewDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  joinOnlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  joinOnlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Session Details Modal Styles (Exact Parity with Web MemberMyBookings.tsx)
  sessionDetailsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sessionDetailsModalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '84%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  sessionDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  sessionTrainerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTrainerAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EA580C',
  },
  sessionTrainerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  sessionTrainerSpec: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  sessionDetailsBody: {
    flexShrink: 1,
  },
  bookingIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EAED',
  },
  bookingIdLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  bookingIdValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  detailsStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailsStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsSectionCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailRowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabelText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  attendanceGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  attendanceCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  attendanceColLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EA580C',
  },
  attendanceColTime: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 3,
  },
  meetingRoomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  meetingRoomLink: {
    flex: 1,
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '600',
  },
  joinNowBtn: {
    backgroundColor: '#C2410C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinNowBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  ratingBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  reviewQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#92400E',
    fontWeight: '500',
    lineHeight: 17,
  },
  notesCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  noteLine: {
    fontSize: 12,
    color: '#111827',
    lineHeight: 18,
  },
  noteBold: {
    fontWeight: '800',
    color: '#64748B',
  },
  sessionDetailsFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  closeFooterBtn: {
    backgroundColor: '#C2410C',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 12,
  },
  closeFooterBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
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

  // Web Parity Book a Session Styles Matching Image 2
  webBookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 14,
  },
  webBookBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webBookTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  webBookSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  webBookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  webBookFieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
    marginTop: 6,
  },
  webBookTrainerCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  webBookTrainerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  webBookAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  webBookAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EA580C',
  },
  webBookTrainerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  webBookTrainerSpec: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  webBookTrainerRight: {
    alignItems: 'flex-end',
  },
  webBookFee: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EA580C',
  },
  webBookDuration: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  webBookTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  webBookTypeCard: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webBookTypeCardActive: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  webBookTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  webBookTypeTextActive: {
    color: '#EA580C',
  },
  webBookInputHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  webBookInputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  webBookInputBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  webBookInputVal: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  webBookInputPlaceholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  webBookSubmitBtn: {
    marginTop: 8,
    backgroundColor: '#D98A6C', // Warm terracotta matching Image 2
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  webBookSubmitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 2,
  },
  pickerItemActive: {
    backgroundColor: '#FFF7ED',
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  pickerItemTextActive: {
    fontWeight: '700',
    color: '#EA580C',
  },
  pickerItemSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  pickerItemSubActive: {
    color: '#F97316',
  },

  // Full Month Calendar Styles (Exact Parity with Image 3)
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    width: '90%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarMonthTitleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  calendarArrowsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarArrowBtn: {
    padding: 4,
    borderRadius: 6,
  },
  calendarWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calendarWeekdayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDayCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  },
  calendarDayTextMuted: {
    color: '#CBD5E1',
    fontWeight: '400',
  },
  calendarSelectedDayBox: {
    width: 32,
    height: 32,
    backgroundColor: '#334155',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarSelectedDayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  calendarBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  calendarActionText: {
    color: '#0284C7',
    fontSize: 15,
    fontWeight: '600',
  },

  // Manual Time Input Styles (User Request)
  manualTimeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  manualTimeToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EA580C',
  },
  manualTimeFormCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    gap: 8,
  },
  manualTimeFormTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  manualFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  timeChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timeChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  timeChipTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  manualTextInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  manualPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  manualPreviewLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  manualPreviewTime: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
  },
  applyManualTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 4,
  },
  applyManualTimeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
