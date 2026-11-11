import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';

type SchedulingTab = 'schedule' | 'bookings' | 'online';
type ScheduleModeFilter = 'All' | 'Online' | 'Offline';
type ScheduleDateFilter = 'All' | 'Today' | 'This Week' | 'This Month' | 'Custom';
type OnlineSubTab = 'upcoming' | 'live' | 'completed';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const BOOKING_STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected'] as const;
const SESSION_TYPES = [
  '1-on-1 Personal Training',
  'Group Training',
  '1-on-1 Online',
  'Consultation',
  'Nutrition Session',
  'Assessment',
];
const PERFORMANCE_OPTIONS = ['Excellent', 'Good', 'Average', 'Needs Improvement'] as const;

const parseDateSafe = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const isoPart = dateStr.split('T')[0];
  const m = isoPart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const dt = new Date(dateStr);
  return isNaN(dt.getTime()) ? null : dt;
};

const isTodayDate = (dateStr?: string): boolean => {
  const dt = parseDateSafe(dateStr);
  if (!dt) return false;
  const now = new Date();
  return dt.getDate() === now.getDate() && dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
};

const isPastDate = (dateStr?: string): boolean => {
  const dt = parseDateSafe(dateStr);
  if (!dt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dt.setHours(0, 0, 0, 0);
  return dt < today;
};

const fmtDayMonth = (dateStr?: string): { day: string; mon: string } => {
  const dt = parseDateSafe(dateStr);
  if (!dt) return { day: '--', mon: '' };
  return {
    day: dt.getDate().toString().padStart(2, '0'),
    mon: MONTHS_SHORT[dt.getMonth()].toUpperCase(),
  };
};

const formatBookingDate = (dateStr?: string): string => {
  const dt = parseDateSafe(dateStr);
  if (!dt) return dateStr || 'Date TBD';
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const formatFullDate = (dateStr?: string): string => {
  const dt = parseDateSafe(dateStr);
  if (!dt) return dateStr || 'Date TBD';
  return dt.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
};

const formatShortDate = (dateStr?: string): string => {
  const dt = parseDateSafe(dateStr);
  if (!dt) return dateStr || '';
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatClockTime = (rawTime?: string): string => {
  if (!rawTime) return '';
  const dt = new Date(rawTime);
  if (!isNaN(dt.getTime())) {
    return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return rawTime;
};

const normalizeBookingStatus = (status: string): string => {
  if (['Confirmed', 'Upcoming', 'Approved'].includes(status)) return 'Approved';
  if (['Cancelled', 'Refunded', 'Refund Pending'].includes(status)) return 'Cancelled';
  return status;
};

const normalizeScheduleStatus = (status: string): string => {
  if (['Confirmed', 'Upcoming', 'Approved'].includes(status)) return 'Confirmed';
  if (['Cancelled', 'Refunded', 'Refund Pending'].includes(status)) return 'Cancelled';
  return status;
};

const parseTimeMinutes = (timeStr?: string): number | null => {
  if (!timeStr) return null;
  const m12 = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (m12) {
    let h = parseInt(m12[1], 10);
    const min = parseInt(m12[2], 10);
    const mer = m12[3].toUpperCase();
    if (mer === 'PM' && h !== 12) h += 12;
    if (mer === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  }
  const m24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    return parseInt(m24[1], 10) * 60 + parseInt(m24[2], 10);
  }
  return null;
};

const isSessionLiveNow = (dateStr?: string, startTime?: string, endTime?: string): boolean => {
  if (!isTodayDate(dateStr)) return false;
  const start = parseTimeMinutes(startTime);
  const end = parseTimeMinutes(endTime);
  if (start === null || end === null) return false;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= start && nowMins <= end;
};

const getCountdownText = (dateStr?: string, startTime?: string): string => {
  const sessionDate = parseDateSafe(dateStr);
  const minsFromMidnight = parseTimeMinutes(startTime);
  if (!sessionDate || minsFromMidnight === null) return '';
  sessionDate.setHours(Math.floor(minsFromMidnight / 60), minsFromMidnight % 60, 0, 0);
  const diff = sessionDate.getTime() - Date.now();
  if (diff <= 0) return 'Starting now';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h away`;
  if (hours > 0) return `${hours}h ${mins}m away`;
  return `${mins} min away`;
};

const getStatusAccentColor = (status: string): string => {
  switch (status) {
    case 'Pending':
      return '#FBBF24';
    case 'Approved':
    case 'Confirmed':
    case 'In Progress':
    case 'Awaiting Payment':
      return '#C2410C';
    case 'Completed':
      return '#94A3B8';
    case 'Rejected':
      return '#F43F5E';
    default:
      return '#F87171';
  }
};

const getStatusBadgeStyle = (status: string) => {
  if (status === 'Pending') {
    return { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' };
  }
  if (status === 'Cancelled') {
    return { bg: '#FEE2E2', border: '#FECACA', text: '#B91C1C' };
  }
  if (status === 'Rejected') {
    return { bg: '#FFE4E6', border: '#FECDD3', text: '#BE123C' };
  }
  return { bg: '#F8FAFC', border: '#E2E8F0', text: '#EA580C' };
};

interface SessionItem {
  _id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerPhoto?: string;
  type: string;
  mode: 'Online' | 'Offline';
  date: string;
  rawDate: string;
  createdAt?: string;
  startTime: string;
  endTime: string;
  duration: string;
  fee: number;
  status: string;
  checkInTimeRaw?: string;
  checkOutTimeRaw?: string;
  rejectionReason?: string;
  customerRating?: number;
  customerReview?: string;
  meetingLink: string;
  sessionNotes?: {
    exercisesCompleted?: string;
    customerPerformance?: string;
    problemsNoticed?: string;
    dietRecommendations?: string;
    nextSessionFocus?: string;
  };
  isCustom?: boolean;
}

export const TrainerScheduleScreen: React.FC<{ onNavigateTab?: (tab: string, sub?: string) => void }> = ({
  onNavigateTab,
}) => {
  const insets = useSafeAreaInsets();
  const modalOverlayInsets = {
    paddingTop: Math.max(insets.top + 12, 24),
    paddingBottom: Math.max(insets.bottom + 12, 24),
  };
  const [activeTab, setActiveTab] = useState<SchedulingTab>('schedule');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [sessions, setSessions] = useState<SessionItem[]>([]);

  // Tab 1: Schedule State
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleModeFilter, setScheduleModeFilter] = useState<ScheduleModeFilter>('All');
  const [scheduleDateFilter, setScheduleDateFilter] = useState<ScheduleDateFilter>('All');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [activeFilterPicker, setActiveFilterPicker] = useState<'mode' | 'date' | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newScheduleForm, setNewScheduleForm] = useState({
    type: '1-on-1 Personal Training',
    client: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    mode: 'Online' as 'Online' | 'Offline',
    notes: '',
  });

  // Tab 2: Session Bookings State
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('All');
  const [rejectModalTarget, setRejectModalTarget] = useState<SessionItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Tab 3: Online Sessions State
  const [onlineTabFilter, setOnlineTabFilter] = useState<OnlineSubTab>('upcoming');

  // Shared Detail & Notes Modals
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<SessionItem | null>(null);
  const [notesModalTarget, setNotesModalTarget] = useState<SessionItem | null>(null);
  const [notesForm, setNotesForm] = useState({
    exercisesCompleted: '',
    customerPerformance: 'Good',
    problemsNoticed: '',
    dietRecommendations: '',
    nextSessionFocus: '',
  });

  const fetchSchedule = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await api.get('/trainer-sessions/trainer');
      if (res.data?.success) {
        const mapped: SessionItem[] = (res.data.sessions || []).map((s: any) => {
          const rawDate = s.date ? s.date.split('T')[0] : '';
          const bookingCode = s.bookingId || s._id.slice(-6).toUpperCase();
          const modeVal: 'Online' | 'Offline' = s.mode === 'Online' || s.sessionType === 'Online' ? 'Online' : 'Offline';
          const customerName = s.customerId
            ? `${s.customerId.firstName || ''} ${s.customerId.lastName || ''}`.trim() ||
              s.customerId.name ||
              s.customerId.email ||
              'Member'
            : s.customerName || 'Member';
          return {
            _id: s._id,
            bookingId: bookingCode,
            customerName,
            customerEmail: s.customerId?.email || '',
            customerPhone: s.customerId?.mobile || s.customerId?.phone || '',
            customerPhoto: s.customerId?.profilePhoto,
            type: s.sessionType || (modeVal === 'Online' ? '1-on-1 Online' : '1-on-1 Personal Training'),
            mode: modeVal,
            date: s.date || rawDate,
            rawDate,
            createdAt: s.createdAt,
            startTime: s.startTime || '',
            endTime: s.endTime || '',
            duration: s.duration ? `${s.duration} min` : '60 min',
            fee: s.fee || 0,
            status: s.status || 'Pending',
            checkInTimeRaw: s.checkInTime,
            checkOutTimeRaw: s.checkOutTime,
            rejectionReason: s.rejectionReason,
            customerRating: s.customerRating,
            customerReview: s.customerReview,
            meetingLink: s.meetingLink || `https://meet.jit.si/aigym-${bookingCode}`,
            sessionNotes: s.sessionNotes,
          };
        });
        setSessions(mapped);
      }
    } catch (e) {
      console.log('Error loading trainer sessions:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const onRefresh = () => {
    fetchSchedule(true);
  };

  // Tab 1 Summary Metrics (matching web TrainerSchedule.tsx)
  const todaySessionsCount = useMemo(
    () => sessions.filter(s => isTodayDate(s.date) && s.status !== 'Cancelled' && s.status !== 'Rejected').length,
    [sessions]
  );
  const upcomingCount = useMemo(
    () =>
      sessions.filter(
        s =>
          !isPastDate(s.date) &&
          !isTodayDate(s.date) &&
          s.status !== 'Completed' &&
          s.status !== 'Cancelled' &&
          s.status !== 'Rejected'
      ).length,
    [sessions]
  );
  const pendingRequestsCount = useMemo(
    () => sessions.filter(s => normalizeScheduleStatus(s.status) === 'Pending').length,
    [sessions]
  );
  const completedCount = useMemo(() => sessions.filter(s => s.status === 'Completed').length, [sessions]);

  // Tab 1 Filtered & Chronologically Sorted Schedule
  const filteredSchedule = useMemo(() => {
    const q = scheduleSearch.toLowerCase().trim();
    return sessions
      .filter(s => {
        if (q) {
          const hit =
            s.customerName.toLowerCase().includes(q) ||
            s.type.toLowerCase().includes(q) ||
            s.bookingId.toLowerCase().includes(q);
          if (!hit) return false;
        }
        if (scheduleModeFilter !== 'All' && s.mode !== scheduleModeFilter) return false;
        if (scheduleDateFilter === 'Today' && !isTodayDate(s.date)) return false;
        if (scheduleDateFilter === 'This Week') {
          const dt = parseDateSafe(s.date);
          if (!dt) return false;
          const now = new Date();
          const day = now.getDay();
          const mon = new Date(now);
          mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
          mon.setHours(0, 0, 0, 0);
          const sun = new Date(mon);
          sun.setDate(mon.getDate() + 6);
          sun.setHours(23, 59, 59, 999);
          if (dt < mon || dt > sun) return false;
        }
        if (scheduleDateFilter === 'This Month') {
          const dt = parseDateSafe(s.date);
          const now = new Date();
          if (!dt || dt.getMonth() !== now.getMonth() || dt.getFullYear() !== now.getFullYear()) return false;
        }
        if (scheduleDateFilter === 'Custom' && customFrom && customTo) {
          const dt = parseDateSafe(s.date);
          const from = parseDateSafe(customFrom);
          const to = parseDateSafe(customTo);
          if (dt && from && to) {
            from.setHours(0, 0, 0, 0);
            to.setHours(23, 59, 59, 999);
            if (dt < from || dt > to) return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const da = parseDateSafe(a.date)?.getTime() || 0;
        const db = parseDateSafe(b.date)?.getTime() || 0;
        if (da !== db) return da - db;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [sessions, scheduleSearch, scheduleModeFilter, scheduleDateFilter, customFrom, customTo]);

  // Tab 2 Filtered Bookings (Newest Created First, matching web TrainerSessionBookings.tsx)
  const bookingsSorted = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        const da = new Date(a.createdAt || a.date).getTime() || 0;
        const db = new Date(b.createdAt || b.date).getTime() || 0;
        return db - da;
      }),
    [sessions]
  );

  const filteredBookings = useMemo(() => {
    if (bookingStatusFilter === 'All') return bookingsSorted;
    return bookingsSorted.filter(b => normalizeBookingStatus(b.status) === bookingStatusFilter);
  }, [bookingsSorted, bookingStatusFilter]);

  const bookingCounts = useMemo(() => {
    const map: Record<string, number> = { All: bookingsSorted.length };
    BOOKING_STATUS_FILTERS.slice(1).forEach(st => {
      map[st] = bookingsSorted.filter(b => normalizeBookingStatus(b.status) === st).length;
    });
    return map;
  }, [bookingsSorted]);

  // Tab 3 Categorized Online Sessions (matching web TrainerOnlineSessions.tsx)
  const onlineEligible = useMemo(
    () =>
      sessions.filter(
        s =>
          ['Confirmed', 'Approved', 'In Progress', 'Upcoming', 'Completed'].includes(s.status) &&
          (s.mode === 'Online' || s.status === 'Completed')
      ),
    [sessions]
  );

  const onlineUpcoming = useMemo(
    () =>
      onlineEligible
        .filter(s => s.status !== 'Completed' && !isSessionLiveNow(s.date, s.startTime, s.endTime))
        .sort((a, b) => (parseDateSafe(a.date)?.getTime() || 0) - (parseDateSafe(b.date)?.getTime() || 0)),
    [onlineEligible]
  );

  const onlineLive = useMemo(
    () => onlineEligible.filter(s => s.status !== 'Completed' && isSessionLiveNow(s.date, s.startTime, s.endTime)),
    [onlineEligible]
  );

  const onlineCompleted = useMemo(
    () =>
      onlineEligible
        .filter(s => s.status === 'Completed')
        .sort((a, b) => (parseDateSafe(b.date)?.getTime() || 0) - (parseDateSafe(a.date)?.getTime() || 0)),
    [onlineEligible]
  );

  const displayedOnline =
    onlineTabFilter === 'live' ? onlineLive : onlineTabFilter === 'completed' ? onlineCompleted : onlineUpcoming;

  // Handlers
  const handleScheduleOnlineSubmit = () => {
    if (!newScheduleForm.client.trim() || !newScheduleForm.date.trim()) {
      Alert.alert('Required Fields', 'Client name and date (YYYY-MM-DD) are required.');
      return;
    }
    if (newScheduleForm.endTime <= newScheduleForm.startTime) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }
    const bookingCode = 'BKG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const newSession: SessionItem = {
      _id: 'custom-' + Date.now(),
      bookingId: bookingCode,
      customerName: newScheduleForm.client.trim(),
      customerEmail: '',
      customerPhone: '',
      type: newScheduleForm.type,
      mode: newScheduleForm.mode,
      date: newScheduleForm.date.trim(),
      rawDate: newScheduleForm.date.trim(),
      createdAt: new Date().toISOString(),
      startTime: newScheduleForm.startTime.trim(),
      endTime: newScheduleForm.endTime.trim(),
      duration: '60 min',
      fee: 0,
      status: 'Confirmed',
      meetingLink: `https://meet.jit.si/aigym-${bookingCode}`,
      sessionNotes: newScheduleForm.notes.trim()
        ? { exercisesCompleted: newScheduleForm.notes.trim() }
        : undefined,
      isCustom: true,
    };

    setSessions(prev => [newSession, ...prev]);
    setShowScheduleModal(false);
    setNewScheduleForm({
      type: '1-on-1 Personal Training',
      client: '',
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      mode: 'Online',
      notes: '',
    });
    Alert.alert('Schedule Added', 'Session block has been added to your schedule.');
  };

  const handleApproveBooking = async (id: string) => {
    try {
      setActionLoading(`${id}-approve`);
      await api.post(`/trainer-sessions/${id}/accept`);
      Alert.alert('Booking Approved', 'Approved online bookings appear automatically in Online Sessions.');
      await fetchSchedule(true);
    } catch (err: any) {
      Alert.alert('Approval Failed', err?.response?.data?.message || 'Failed to approve booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalTarget) return;
    try {
      setActionLoading(`${rejectModalTarget._id}-reject`);
      await api.post(`/trainer-sessions/${rejectModalTarget._id}/reject`, {
        reason: rejectReason.trim() || 'Trainer unavailable at this time',
      });
      setRejectModalTarget(null);
      setRejectReason('');
      await fetchSchedule(true);
    } catch (err: any) {
      Alert.alert('Rejection Failed', err?.response?.data?.message || 'Failed to reject booking.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      setActionLoading(`${id}-checkout`);
      await api.post(`/trainer-sessions/${id}/check-out`);
      Alert.alert('Checked Out', 'Session checked out successfully!');
      await fetchSchedule(true);
    } catch (err: any) {
      Alert.alert('Checkout Failed', err?.response?.data?.message || 'Failed to check out session.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteOnline = (id: string) => {
    Alert.alert('Complete Session', 'Mark this session as Completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Completed',
        onPress: async () => {
          try {
            setActionLoading(`${id}-complete`);
            await api.patch(`/trainer-sessions/${id}`, { status: 'Completed', attendanceStatus: 'Present' });
            await fetchSchedule(true);
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed to complete session.');
          } finally {
            setActionLoading(null);
          }
        },
      },
    ]);
  };

  const openNotesModal = (session: SessionItem) => {
    setNotesModalTarget(session);
    setNotesForm({
      exercisesCompleted: session.sessionNotes?.exercisesCompleted || '',
      customerPerformance: session.sessionNotes?.customerPerformance || 'Good',
      problemsNoticed: session.sessionNotes?.problemsNoticed || '',
      dietRecommendations: session.sessionNotes?.dietRecommendations || '',
      nextSessionFocus: session.sessionNotes?.nextSessionFocus || '',
    });
  };

  const handleSaveNotes = async () => {
    if (!notesModalTarget) return;
    try {
      setActionLoading(`${notesModalTarget._id}-notes`);
      await api.post(`/trainer-sessions/${notesModalTarget._id}/notes`, notesForm);
      setNotesModalTarget(null);
      Alert.alert('Notes Saved', 'Session notes saved successfully.');
      await fetchSchedule(true);
    } catch (err: any) {
      Alert.alert('Save Failed', err?.response?.data?.message || 'Failed to save notes.');
    } finally {
      setActionLoading(null);
    }
  };

  const openJitsiLink = (session: SessionItem) => {
    const link = session.meetingLink || `https://meet.jit.si/aigym-${session.bookingId}`;
    Linking.openURL(link).catch(() => Alert.alert('Unable to Open', link));
  };

  const modeFilterLabel =
    scheduleModeFilter === 'All' ? 'All Modes' : scheduleModeFilter === 'Offline' ? 'In-Person' : 'Online';
  const dateFilterLabel =
    scheduleDateFilter === 'All'
      ? 'All Dates'
      : scheduleDateFilter === 'Custom'
      ? 'Custom Range'
      : scheduleDateFilter;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
      }
    >
      {/* PRIMARY TABS BAR (Matching Web TrainerSchedulingTabs) */}
      <View style={styles.topTabsCard}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'schedule' && styles.tabBtnActive]}
          onPress={() => setActiveTab('schedule')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar" size={14} color={activeTab === 'schedule' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'schedule' && styles.tabBtnTextActive]} numberOfLines={1}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'bookings' && styles.tabBtnActive]}
          onPress={() => setActiveTab('bookings')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={14} color={activeTab === 'bookings' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'bookings' && styles.tabBtnTextActive]} numberOfLines={1}>
            Session Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'online' && styles.tabBtnActive]}
          onPress={() => setActiveTab('online')}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={14} color={activeTab === 'online' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'online' && styles.tabBtnTextActive]} numberOfLines={1}>
            Online Sessions
          </Text>
        </TouchableOpacity>
      </View>

      {/* =====================================================================
          TAB 1: SCHEDULE (Matches TrainerSchedule.tsx)
          ===================================================================== */}
      {activeTab === 'schedule' && (
        <View style={{ gap: 14 }}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1, paddingRight: 6 }}>
              <Text style={styles.pageTitle}>Schedule</Text>
              <Text style={styles.pageSubtitle}>
                Manage your upcoming sessions, member appointments, and availability.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.scheduleActionBtn}
              onPress={() => setShowScheduleModal(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={15} color="#FFFFFF" />
              <Text style={styles.scheduleActionBtnText}>Schedule Online Session</Text>
            </TouchableOpacity>
          </View>

          {/* 4 Interactive KPI Summary Cards */}
          <View style={styles.kpiRow}>
            <TouchableOpacity
              style={[styles.kpiCard, scheduleDateFilter === 'Today' && styles.kpiCardActive]}
              onPress={() => setScheduleDateFilter(prev => (prev === 'Today' ? 'All' : 'Today'))}
              activeOpacity={0.8}
            >
              <View style={styles.kpiIconSquircle}>
                <Ionicons name="calendar-outline" size={16} color="#EA580C" />
              </View>
              <Text style={styles.kpiVal}>{todaySessionsCount}</Text>
              <Text style={styles.kpiLabel}>Today's Sessions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => {
                setActiveTab('online');
                setOnlineTabFilter('upcoming');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.kpiIconSquircle}>
                <Ionicons name="chevron-forward" size={16} color="#EA580C" />
              </View>
              <Text style={styles.kpiVal}>{upcomingCount}</Text>
              <Text style={styles.kpiLabel}>Upcoming</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => {
                setActiveTab('bookings');
                setBookingStatusFilter('Pending');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.kpiIconSquircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="alert-circle-outline" size={16} color="#D97706" />
              </View>
              <Text style={styles.kpiVal}>{pendingRequestsCount}</Text>
              <Text style={styles.kpiLabel}>Pending Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.kpiCard}
              onPress={() => {
                setActiveTab('bookings');
                setBookingStatusFilter('Completed');
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.kpiIconSquircle, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }]}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#111827" />
              </View>
              <Text style={styles.kpiVal}>{completedCount}</Text>
              <Text style={styles.kpiLabel}>Completed</Text>
            </TouchableOpacity>
          </View>

          {/* Search & Mode + Date Dropdown Filter Bar */}
          <View style={styles.searchFilterCard}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                value={scheduleSearch}
                onChangeText={setScheduleSearch}
                placeholder="Search member, session type, booking ID..."
                placeholderTextColor="#94A3B8"
              />
              {scheduleSearch.length > 0 && (
                <TouchableOpacity onPress={() => setScheduleSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterDropdownRow}>
              <TouchableOpacity
                style={[styles.selectDropdownBtn, scheduleModeFilter !== 'All' && styles.selectDropdownBtnActive]}
                onPress={() => setActiveFilterPicker('mode')}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.selectDropdownText, scheduleModeFilter !== 'All' && styles.selectDropdownTextActive]}
                  numberOfLines={1}
                >
                  {modeFilterLabel}
                </Text>
                <Ionicons name="chevron-down" size={13} color={scheduleModeFilter !== 'All' ? '#EA580C' : '#64748B'} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.selectDropdownBtn, scheduleDateFilter !== 'All' && styles.selectDropdownBtnActive]}
                onPress={() => setActiveFilterPicker('date')}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.selectDropdownText, scheduleDateFilter !== 'All' && styles.selectDropdownTextActive]}
                  numberOfLines={1}
                >
                  {dateFilterLabel}
                </Text>
                <Ionicons name="chevron-down" size={13} color={scheduleDateFilter !== 'All' ? '#EA580C' : '#64748B'} />
              </TouchableOpacity>

              <View style={styles.sessionCountRow}>
                <Ionicons name="funnel-outline" size={12} color="#64748B" />
                <Text style={styles.sessionCountTag}>
                  {filteredSchedule.length} session{filteredSchedule.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {scheduleDateFilter === 'Custom' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  style={[styles.modalTextInput, { flex: 1, paddingVertical: 6 }]}
                  value={customFrom}
                  onChangeText={setCustomFrom}
                  placeholder="From YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
                <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>to</Text>
                <TextInput
                  style={[styles.modalTextInput, { flex: 1, paddingVertical: 6 }]}
                  value={customTo}
                  onChangeText={setCustomTo}
                  placeholder="To YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            )}
          </View>

          {/* Session List */}
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#EA580C" />
              <Text style={styles.loadingText}>Loading your schedule...</Text>
            </View>
          ) : filteredSchedule.length === 0 ? (
            <View style={styles.emptyOnlineCard}>
              <View style={styles.emptyOnlineIconBox}>
                <Ionicons name="calendar-outline" size={28} color="#64748B" />
              </View>
              <Text style={styles.emptyOnlineTitle}>No scheduled sessions found</Text>
              <Text style={styles.emptyOnlineSub}>No sessions match your search or date filter.</Text>
              <TouchableOpacity
                style={[styles.scheduleActionBtn, { marginTop: 6, paddingHorizontal: 16, paddingVertical: 9 }]}
                onPress={() => setShowScheduleModal(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={15} color="#FFFFFF" />
                <Text style={styles.scheduleActionBtnText}>Add Schedule</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {filteredSchedule.map(sess => {
                const { day, mon } = fmtDayMonth(sess.date);
                const todayBadge = isTodayDate(sess.date);
                const normStatus = normalizeScheduleStatus(sess.status);
                const accent = getStatusAccentColor(normStatus);

                return (
                  <TouchableOpacity
                    key={sess._id}
                    style={[styles.scheduleTimelineCardWrap, todayBadge && styles.scheduleCardToday]}
                    onPress={() => setSelectedSessionDetail(sess)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.topAccentStripe, { backgroundColor: accent }]} />
                    <View style={styles.scheduleTimelineInner}>
                      {/* Date Column */}
                      <View style={[styles.dateCol, todayBadge && styles.dateColToday]}>
                        <Text style={[styles.dateColDay, todayBadge && { color: '#FFFFFF' }]}>{day}</Text>
                        <Text style={[styles.dateColMon, todayBadge && { color: '#FED7AA' }]}>{mon}</Text>
                        {todayBadge && <Text style={styles.dateColTodayTag}>TODAY</Text>}
                      </View>

                      {/* Session Info */}
                      <View style={{ flex: 1, gap: 4 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={styles.scheduleType}>{sess.type}</Text>
                          {!sess.isCustom && (
                            <View style={styles.bookingIdBadge}>
                              <Text style={styles.bookingIdBadgeText}>#{sess.bookingId}</Text>
                            </View>
                          )}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="time-outline" size={12} color="#EA580C" />
                          <Text style={styles.scheduleTime}>
                            {sess.startTime}
                            {sess.endTime ? ` – ${sess.endTime}` : ''} · {sess.duration}
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="people-outline" size={12} color="#111827" />
                          <Text style={styles.scheduleClientName}>{sess.customerName}</Text>
                        </View>
                      </View>

                      {/* View Details Button */}
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setSelectedSessionDetail(sess)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="eye-outline" size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* =====================================================================
          TAB 2: SESSION BOOKINGS (Matches TrainerSessionBookings.tsx)
          ===================================================================== */}
      {activeTab === 'bookings' && (
        <View style={{ gap: 14 }}>
          <View>
            <Text style={styles.pageTitle}>Session Bookings</Text>
            <Text style={styles.pageSubtitle}>
              Manage customer booking requests - approve or reject incoming sessions.
            </Text>
          </View>

          {/* Workflow Notice Banner */}
          <View style={styles.workflowNoticeBanner}>
            <View style={styles.workflowIconSquircle}>
              <Ionicons name="funnel-outline" size={16} color="#EA580C" />
            </View>
            <Text style={styles.workflowNoticeText}>
              <Text style={{ fontWeight: '800', color: '#111827' }}>Workflow: </Text>
              Customer books →{' '}
              <Text
                style={{ color: '#B45309', fontWeight: '800' }}
                onPress={() => setBookingStatusFilter('Pending')}
              >
                Pending
              </Text>{' '}
              → You <Text style={{ fontWeight: '800', color: '#EA580C' }}>Approve</Text> or{' '}
              <Text style={{ fontWeight: '800', color: '#BE123C' }}>Reject</Text> → Approved online bookings appear
              automatically in{' '}
              <Text
                style={{ color: '#EA580C', fontWeight: '800', textDecorationLine: 'underline' }}
                onPress={() => setActiveTab('online')}
              >
                Online Sessions
              </Text>
              .
            </Text>
          </View>

          {/* Status Filter Pills with Count Badges */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {BOOKING_STATUS_FILTERS.map(st => {
              const count = bookingCounts[st] || 0;
              const isActive = bookingStatusFilter === st;
              return (
                <TouchableOpacity
                  key={st}
                  style={[styles.bookingFilterPill, isActive && styles.bookingFilterPillActive]}
                  onPress={() => setBookingStatusFilter(st)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.bookingFilterPillText, isActive && styles.bookingFilterPillTextActive]}>
                    {st}
                  </Text>
                  {count > 0 && (
                    <View style={[styles.filterCountBadge, isActive && styles.filterCountBadgeActive]}>
                      <Text style={[styles.filterCountBadgeText, isActive && { color: '#FFFFFF' }]}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bookings List */}
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#EA580C" />
              <Text style={styles.loadingText}>Loading bookings...</Text>
            </View>
          ) : filteredBookings.length === 0 ? (
            <View style={styles.emptyOnlineCard}>
              <View style={styles.emptyOnlineIconBox}>
                <Ionicons name="calendar-outline" size={28} color="#64748B" />
              </View>
              <Text style={styles.emptyOnlineTitle}>
                No {bookingStatusFilter === 'All' ? '' : `${bookingStatusFilter.toLowerCase()} `}bookings
              </Text>
              <Text style={styles.emptyOnlineSub}>
                {bookingStatusFilter === 'Pending'
                  ? 'No new booking requests waiting for your approval.'
                  : 'No sessions match this filter.'}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredBookings.map(bkg => {
                const normStatus = normalizeBookingStatus(bkg.status);
                const accent = getStatusAccentColor(normStatus);
                const badgePalette = getStatusBadgeStyle(normStatus);
                const isApprovingThis = actionLoading === `${bkg._id}-approve`;
                const isRejectingThis = actionLoading === `${bkg._id}-reject`;
                const isCheckoutThis = actionLoading === `${bkg._id}-checkout`;
                const isPending = bkg.status === 'Pending';

                return (
                  <View key={bkg._id} style={styles.bookingCardWrap}>
                    <View style={[styles.topAccentStripe, { backgroundColor: accent }]} />

                    <View style={styles.bookingCardBody}>
                      {/* Customer Info */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.bookingAvatar}>
                          {bkg.customerPhoto ? (
                            <Image source={{ uri: bkg.customerPhoto }} style={styles.bookingAvatarImg} />
                          ) : (
                            <Text style={styles.bookingAvatarText}>
                              {bkg.customerName.charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.bookingCustName}>{bkg.customerName}</Text>
                          {!!bkg.customerEmail && (
                            <Text style={styles.bookingCustEmail} numberOfLines={1}>
                              {bkg.customerEmail}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Status, Mode & Booking ID Badges */}
                      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                        <View
                          style={[
                            styles.bookingStatusTag,
                            { backgroundColor: badgePalette.bg, borderColor: badgePalette.border },
                          ]}
                        >
                          <Text style={[styles.bookingStatusTagText, { color: badgePalette.text }]}>{normStatus}</Text>
                        </View>
                        <View style={styles.bookingModeTag}>
                          <Text style={styles.bookingModeTagText}>
                            {bkg.mode === 'Online' ? 'Online' : 'In-Gym'}
                          </Text>
                        </View>
                        <View style={styles.bookingIdTag}>
                          <Text style={styles.bookingIdTagText}>#{bkg.bookingId}</Text>
                        </View>
                      </View>

                      {/* Schedule Box (Dynamic Date!) */}
                      <View style={styles.bookingScheduleBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="calendar-outline" size={14} color="#EA580C" />
                          <Text style={styles.bookingScheduleDate}>{formatBookingDate(bkg.date)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="time-outline" size={14} color="#EA580C" />
                          <Text style={styles.bookingScheduleTime}>
                            {bkg.startTime} - {bkg.endTime}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="people-outline" size={14} color="#EA580C" />
                          <Text style={styles.bookingScheduleDuration}>{bkg.duration} session</Text>
                        </View>
                      </View>

                      {/* Approved Online Meeting Link Strip */}
                      {normStatus === 'Approved' && bkg.mode === 'Online' && (
                        <TouchableOpacity
                          style={styles.meetingLinkStrip}
                          onPress={() => openJitsiLink(bkg)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="videocam-outline" size={13} color="#EA580C" />
                          <Text style={styles.meetingLinkStripText} numberOfLines={1}>
                            {bkg.meetingLink.replace('https://', '')}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Rejection Reason Strip */}
                      {normStatus === 'Rejected' && !!bkg.rejectionReason && (
                        <View style={styles.rejectionReasonBox}>
                          <Text style={styles.rejectionReasonText}>
                            <Text style={{ fontWeight: '800' }}>Reason: </Text>
                            {bkg.rejectionReason}
                          </Text>
                        </View>
                      )}

                      {/* Notes Snippet */}
                      {!!bkg.sessionNotes?.exercisesCompleted && (
                        <View style={styles.notesSnippetBox}>
                          <Text style={styles.notesSnippetText} numberOfLines={2}>
                            <Text style={{ fontWeight: '800', color: '#111827' }}>Notes: </Text>
                            {bkg.sessionNotes.exercisesCompleted}
                          </Text>
                        </View>
                      )}

                      {/* Footer Actions (Exact Conditional Web Parity) */}
                      <View style={styles.cardFooterBorder}>
                        {isPending && (
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity
                              style={[styles.primaryActionPill, { flex: 1 }]}
                              onPress={() => handleApproveBooking(bkg._id)}
                              disabled={isApprovingThis || isRejectingThis}
                              activeOpacity={0.85}
                            >
                              {isApprovingThis ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                              ) : (
                                <Ionicons name="checkmark-circle-outline" size={15} color="#FFFFFF" />
                              )}
                              <Text style={styles.primaryActionPillText}>Approve</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.rejectActionPill, { flex: 1 }]}
                              onPress={() => {
                                setRejectModalTarget(bkg);
                                setRejectReason('');
                              }}
                              disabled={isApprovingThis || isRejectingThis}
                              activeOpacity={0.85}
                            >
                              <Ionicons name="close" size={15} color="#BE123C" />
                              <Text style={styles.rejectActionPillText}>Reject</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.bookingIconOnlyBtn}
                              onPress={() => setSelectedSessionDetail(bkg)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="eye-outline" size={16} color="#111827" />
                            </TouchableOpacity>
                          </View>
                        )}

                        {!isPending &&
                          !bkg.checkOutTimeRaw &&
                          (normStatus === 'In Progress' || bkg.status === 'In Progress' || normStatus === 'Approved') && (
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <TouchableOpacity
                                style={[styles.primaryActionPill, { flex: 1 }]}
                                onPress={() => handleCheckOut(bkg._id)}
                                disabled={isCheckoutThis}
                                activeOpacity={0.85}
                              >
                                {isCheckoutThis ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <Ionicons name="log-out-outline" size={14} color="#FFFFFF" />
                                )}
                                <Text style={styles.primaryActionPillText}>Checkout</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.bookingActionBtn}
                                onPress={() => setSelectedSessionDetail(bkg)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="eye-outline" size={14} color="#111827" />
                                <Text style={styles.bookingActionBtnText}>Details</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.bookingActionBtn}
                                onPress={() => openNotesModal(bkg)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="document-text-outline" size={14} color="#64748B" />
                                <Text style={[styles.bookingActionBtnText, { color: '#64748B' }]}>Notes</Text>
                              </TouchableOpacity>
                            </View>
                          )}

                        {!isPending && !!bkg.checkOutTimeRaw && (
                          <View style={{ gap: 8 }}>
                            <View style={styles.checkedOutBanner}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Ionicons name="checkmark-circle-outline" size={14} color="#EA580C" />
                                <Text style={styles.checkedOutBannerLabel}>Checked Out</Text>
                              </View>
                              <Text style={styles.checkedOutBannerTime}>{formatClockTime(bkg.checkOutTimeRaw)}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <TouchableOpacity
                                style={[styles.bookingActionBtn, { flex: 1, justifyContent: 'center' }]}
                                onPress={() => setSelectedSessionDetail(bkg)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="eye-outline" size={14} color="#111827" />
                                <Text style={styles.bookingActionBtnText}>View Details</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.bookingActionBtn, { flex: 1, justifyContent: 'center' }]}
                                onPress={() => openNotesModal(bkg)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="document-text-outline" size={14} color="#64748B" />
                                <Text style={[styles.bookingActionBtnText, { color: '#64748B' }]}>
                                  {bkg.sessionNotes?.exercisesCompleted ? 'Edit Notes' : 'Add Notes'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}

                        {!isPending && normStatus === 'Completed' && !bkg.checkOutTimeRaw && (
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={styles.completedBadgePill}>
                              <Ionicons name="checkmark-circle-outline" size={14} color="#EA580C" />
                              <Text style={styles.completedBadgePillText}>Completed</Text>
                            </View>
                            <TouchableOpacity
                              style={styles.bookingActionBtn}
                              onPress={() => setSelectedSessionDetail(bkg)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="eye-outline" size={14} color="#111827" />
                              <Text style={styles.bookingActionBtnText}>View Details</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.bookingActionBtn}
                              onPress={() => openNotesModal(bkg)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="document-text-outline" size={14} color="#64748B" />
                              <Text style={[styles.bookingActionBtnText, { color: '#64748B' }]}>Notes</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {(normStatus === 'Cancelled' || normStatus === 'Rejected') && (
                          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                            <View style={styles.cancelledBanner}>
                              <Text style={styles.cancelledBannerText}>Session {normStatus}</Text>
                            </View>
                            <TouchableOpacity
                              style={styles.bookingActionBtn}
                              onPress={() => setSelectedSessionDetail(bkg)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="eye-outline" size={14} color="#111827" />
                              <Text style={styles.bookingActionBtnText}>View Details</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* =====================================================================
          TAB 3: ONLINE SESSIONS (Matches TrainerOnlineSessions.tsx)
          ===================================================================== */}
      {activeTab === 'online' && (
        <View style={{ gap: 14 }}>
          <View>
            <Text style={styles.pageTitle}>Online Sessions</Text>
            <Text style={styles.pageSubtitle}>
              Conduct your approved online training sessions via Jitsi Meet.
            </Text>
          </View>

          {/* Notice Banner with Clickable Session Bookings Link */}
          <View style={styles.workflowNoticeBanner}>
            <View style={styles.workflowIconSquircle}>
              <Ionicons name="videocam-outline" size={16} color="#EA580C" />
            </View>
            <Text style={[styles.workflowNoticeText, { color: '#EA580C' }]}>
              <Text style={{ fontWeight: '800' }}>Only approved online bookings appear here. </Text>
              To approve a new customer booking, go to{' '}
              <Text
                style={{ fontWeight: '900', color: '#C2410C', textDecorationLine: 'underline' }}
                onPress={() => setActiveTab('bookings')}
              >
                Session Bookings
              </Text>
              . Once approved, the session will automatically appear in this list.
            </Text>
          </View>

          {/* Filter Sub-Tabs */}
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {(
              [
                { id: 'upcoming', label: 'Upcoming', count: onlineUpcoming.length },
                { id: 'live', label: 'Live Now', count: onlineLive.length },
                { id: 'completed', label: 'Completed', count: onlineCompleted.length },
              ] as const
            ).map(t => {
              const isActive = onlineTabFilter === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.bookingFilterPill, isActive && styles.bookingFilterPillActive]}
                  onPress={() => setOnlineTabFilter(t.id)}
                  activeOpacity={0.8}
                >
                  {t.id === 'live' && t.count > 0 && <View style={styles.liveDot} />}
                  <Text style={[styles.bookingFilterPillText, isActive && styles.bookingFilterPillTextActive]}>
                    {t.label}
                  </Text>
                  {t.count > 0 && (
                    <View
                      style={[
                        styles.filterCountBadge,
                        t.id === 'live' && !isActive && { backgroundColor: '#FEE2E2' },
                        isActive && styles.filterCountBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterCountBadgeText,
                          t.id === 'live' && !isActive && { color: '#B91C1C' },
                          isActive && { color: '#FFFFFF' },
                        ]}
                      >
                        {t.count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Content Area */}
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#EA580C" />
              <Text style={styles.loadingText}>Loading sessions...</Text>
            </View>
          ) : displayedOnline.length === 0 ? (
            <View style={styles.emptyOnlineCard}>
              <View style={styles.emptyOnlineIconBox}>
                <Ionicons
                  name={onlineTabFilter === 'live' ? 'wifi-outline' : 'videocam-outline'}
                  size={30}
                  color="#64748B"
                />
              </View>
              <Text style={styles.emptyOnlineTitle}>
                {onlineTabFilter === 'live'
                  ? 'No Live Sessions Right Now'
                  : onlineTabFilter === 'upcoming'
                  ? 'No Upcoming Sessions'
                  : 'No Completed Sessions'}
              </Text>
              <Text style={styles.emptyOnlineSub}>
                {onlineTabFilter === 'upcoming'
                  ? 'Approved online bookings will appear here. Go to Session Bookings to approve pending requests.'
                  : onlineTabFilter === 'live'
                  ? 'Sessions that are scheduled for right now will appear here.'
                  : 'Your completed sessions will appear here for review.'}
              </Text>
              {onlineTabFilter === 'upcoming' && (
                <TouchableOpacity
                  style={[styles.bookingActionBtn, { marginTop: 6 }]}
                  onPress={() => {
                    setActiveTab('bookings');
                    setBookingStatusFilter('Pending');
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="calendar-outline" size={14} color="#EA580C" />
                  <Text style={[styles.bookingActionBtnText, { color: '#EA580C' }]}>Go to Session Bookings</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {displayedOnline.map(sess => {
                const isLive = isSessionLiveNow(sess.date, sess.startTime, sess.endTime);
                const countdown = onlineTabFilter === 'upcoming' ? getCountdownText(sess.date, sess.startTime) : '';
                const isCompleting = actionLoading === `${sess._id}-complete`;

                return (
                  <View
                    key={sess._id}
                    style={[styles.bookingCardWrap, isLive && { borderColor: '#FCA5A5' }]}
                  >
                    <View
                      style={[styles.topAccentStripe, { backgroundColor: isLive ? '#EF4444' : '#C2410C' }]}
                    />

                    <View style={styles.bookingCardBody}>
                      {isLive && (
                        <View style={styles.liveNowBanner}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveNowBannerText}>SESSION IS LIVE NOW</Text>
                        </View>
                      )}

                      {/* Customer Header */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.bookingAvatar}>
                          {sess.customerPhoto ? (
                            <Image source={{ uri: sess.customerPhoto }} style={styles.bookingAvatarImg} />
                          ) : (
                            <Text style={styles.bookingAvatarText}>
                              {sess.customerName.charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.bookingCustName}>{sess.customerName}</Text>
                          {!!sess.customerEmail && (
                            <Text style={styles.bookingCustEmail} numberOfLines={1}>
                              {sess.customerEmail}
                            </Text>
                          )}
                        </View>
                        <View
                          style={[
                            styles.bookingStatusTag,
                            isLive && { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
                          ]}
                        >
                          <Text style={[styles.bookingStatusTagText, isLive && { color: '#991B1B' }]}>
                            {isLive ? 'Live' : sess.status === 'Completed' ? 'Completed' : 'Upcoming'}
                          </Text>
                        </View>
                      </View>

                      <View style={[styles.bookingIdTag, { alignSelf: 'flex-start' }]}>
                        <Text style={styles.bookingIdTagText}>Booking #{sess.bookingId}</Text>
                      </View>

                      {/* Schedule Box */}
                      <View style={styles.bookingScheduleBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="calendar-outline" size={14} color="#EA580C" />
                          <Text style={styles.bookingScheduleDate}>{formatFullDate(sess.date)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="time-outline" size={14} color="#EA580C" />
                          <Text style={styles.bookingScheduleTime}>
                            {sess.startTime} – {sess.endTime}
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Ionicons name="people-outline" size={14} color="#EA580C" />
                          <Text style={styles.bookingScheduleDuration}>{sess.duration}</Text>
                        </View>
                      </View>

                      {!!countdown && countdown !== 'Starting now' && !isLive && (
                        <View style={styles.countdownStrip}>
                          <Ionicons name="timer-outline" size={13} color="#EA580C" />
                          <Text style={styles.countdownStripText}>{countdown}</Text>
                        </View>
                      )}

                      {sess.status !== 'Completed' && (
                        <TouchableOpacity
                          style={styles.meetingLinkStrip}
                          onPress={() => openJitsiLink(sess)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="videocam-outline" size={13} color="#EA580C" />
                          <Text style={styles.meetingLinkStripText} numberOfLines={1}>
                            {sess.meetingLink.replace('https://', '')}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {!!sess.customerRating && (
                        <View style={styles.ratingStripBox}>
                          <Text style={styles.ratingStripTitle}>
                            Rating: {'★'.repeat(sess.customerRating)}
                            {'☆'.repeat(5 - sess.customerRating)} {sess.customerRating}/5
                          </Text>
                          {!!sess.customerReview && (
                            <Text style={styles.ratingStripReview}>"{sess.customerReview}"</Text>
                          )}
                        </View>
                      )}

                      {!!sess.sessionNotes?.exercisesCompleted && (
                        <View style={styles.notesSnippetBox}>
                          <Text style={styles.notesSnippetText} numberOfLines={2}>
                            <Text style={{ fontWeight: '800', color: '#111827' }}>Summary: </Text>
                            {sess.sessionNotes.exercisesCompleted}
                          </Text>
                        </View>
                      )}

                      {/* Footer Action Buttons */}
                      <View style={styles.cardFooterBorder}>
                        {sess.status !== 'Completed' ? (
                          <View style={{ gap: 8 }}>
                            <TouchableOpacity
                              style={styles.primaryActionPill}
                              onPress={() => openJitsiLink(sess)}
                              activeOpacity={0.85}
                            >
                              <Ionicons name="play" size={14} color="#FFFFFF" />
                              <Text style={styles.primaryActionPillText}>
                                {isLive ? 'Join Live Session' : 'Start / Join Session'}
                              </Text>
                            </TouchableOpacity>

                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <TouchableOpacity
                                style={[styles.primaryActionPill, { flex: 1, paddingVertical: 8 }]}
                                onPress={() => handleCompleteOnline(sess._id)}
                                disabled={isCompleting}
                                activeOpacity={0.85}
                              >
                                {isCompleting ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <Ionicons name="checkmark-circle-outline" size={13} color="#FFFFFF" />
                                )}
                                <Text style={styles.primaryActionPillText}>Mark Completed</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.bookingActionBtn}
                                onPress={() => setSelectedSessionDetail(sess)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="eye-outline" size={14} color="#111827" />
                                <Text style={styles.bookingActionBtnText}>Details</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={styles.bookingActionBtn}
                                onPress={() => openNotesModal(sess)}
                                activeOpacity={0.8}
                              >
                                <Ionicons name="document-text-outline" size={14} color="#64748B" />
                                <Text style={[styles.bookingActionBtnText, { color: '#64748B' }]}>Notes</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <View style={{ flexDirection: 'row', gap: 8 }}>
                            <View style={styles.completedBadgePill}>
                              <Ionicons name="checkmark-circle-outline" size={13} color="#EA580C" />
                              <Text style={styles.completedBadgePillText} numberOfLines={1}>
                                Completed on {formatShortDate(sess.date)}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={styles.bookingActionBtn}
                              onPress={() => setSelectedSessionDetail(sess)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="eye-outline" size={14} color="#111827" />
                              <Text style={styles.bookingActionBtnText}>View Details</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.bookingActionBtn}
                              onPress={() => openNotesModal(sess)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="document-text-outline" size={14} color="#64748B" />
                              <Text style={[styles.bookingActionBtnText, { color: '#64748B' }]}>Notes</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* =====================================================================
          FILTER PICKER MODAL (All Modes / All Dates Dropdowns)
          ===================================================================== */}
      {activeFilterPicker && (
        <Modal
          visible={Boolean(activeFilterPicker)}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveFilterPicker(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActiveFilterPicker(null)}
          >
            <View style={[styles.modalContent, { maxWidth: 340 }]} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {activeFilterPicker === 'mode' ? 'Select Session Mode' : 'Select Date Range'}
                </Text>
                <TouchableOpacity onPress={() => setActiveFilterPicker(null)}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <View style={{ padding: 12, gap: 6 }}>
                {activeFilterPicker === 'mode'
                  ? (
                      [
                        { value: 'All', label: 'All Modes' },
                        { value: 'Online', label: 'Online' },
                        { value: 'Offline', label: 'In-Person' },
                      ] as const
                    ).map(opt => {
                      const active = scheduleModeFilter === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.pickerOptionRow, active && styles.pickerOptionRowActive]}
                          onPress={() => {
                            setScheduleModeFilter(opt.value);
                            setActiveFilterPicker(null);
                          }}
                        >
                          <Text style={[styles.pickerOptionText, active && styles.pickerOptionTextActive]}>
                            {opt.label}
                          </Text>
                          {active && <Ionicons name="checkmark" size={16} color="#EA580C" />}
                        </TouchableOpacity>
                      );
                    })
                  : (
                      [
                        { value: 'All', label: 'All Dates' },
                        { value: 'Today', label: 'Today' },
                        { value: 'This Week', label: 'This Week' },
                        { value: 'This Month', label: 'This Month' },
                        { value: 'Custom', label: 'Custom Range' },
                      ] as const
                    ).map(opt => {
                      const active = scheduleDateFilter === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[styles.pickerOptionRow, active && styles.pickerOptionRowActive]}
                          onPress={() => {
                            setScheduleDateFilter(opt.value);
                            setActiveFilterPicker(null);
                          }}
                        >
                          <Text style={[styles.pickerOptionText, active && styles.pickerOptionTextActive]}>
                            {opt.label}
                          </Text>
                          {active && <Ionicons name="checkmark" size={16} color="#EA580C" />}
                        </TouchableOpacity>
                      );
                    })}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* =====================================================================
          ADD SCHEDULE / SCHEDULE ONLINE SESSION MODAL
          ===================================================================== */}
      {showScheduleModal && (
        <Modal
          visible={showScheduleModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowScheduleModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalOverlay, modalOverlayInsets]}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalTitle}>Add Schedule Block</Text>
                  <Text style={styles.modalSubtitle}>Create a session appointment</Text>
                </View>
                <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ flexShrink: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View>
                  <Text style={styles.modalInputLabel}>MEMBER / CLIENT NAME *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={newScheduleForm.client}
                    onChangeText={txt => setNewScheduleForm({ ...newScheduleForm, client: txt })}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>SESSION TYPE</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {SESSION_TYPES.map(t => {
                      const active = newScheduleForm.type === t;
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[styles.smallFilterPill, active && styles.smallFilterPillActive]}
                          onPress={() => setNewScheduleForm({ ...newScheduleForm, type: t })}
                        >
                          <Text style={[styles.smallFilterPillText, active && styles.smallFilterPillTextActive]}>
                            {t}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>DATE *</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={newScheduleForm.date}
                      onChangeText={txt => setNewScheduleForm({ ...newScheduleForm, date: txt })}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>MODE</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {(['Online', 'Offline'] as const).map(m => {
                        const active = newScheduleForm.mode === m;
                        return (
                          <TouchableOpacity
                            key={m}
                            style={[styles.modeToggleBtn, active && styles.modeToggleBtnActive]}
                            onPress={() => setNewScheduleForm({ ...newScheduleForm, mode: m })}
                          >
                            <Text style={[styles.modeToggleText, active && styles.modeToggleTextActive]}>
                              {m === 'Offline' ? 'In-Person' : 'Online'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>START TIME *</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={newScheduleForm.startTime}
                      onChangeText={txt => setNewScheduleForm({ ...newScheduleForm, startTime: txt })}
                      placeholder="09:00"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>END TIME *</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={newScheduleForm.endTime}
                      onChangeText={txt => setNewScheduleForm({ ...newScheduleForm, endTime: txt })}
                      placeholder="10:00"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>NOTES (OPTIONAL)</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 64, textAlignVertical: 'top' }]}
                    value={newScheduleForm.notes}
                    onChangeText={txt => setNewScheduleForm({ ...newScheduleForm, notes: txt })}
                    multiline
                    placeholder="Special instructions or notes..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={[styles.modalCancelBtn, { flex: 1 }]} onPress={() => setShowScheduleModal(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalSubmitBtn, { flex: 1.4 }]} onPress={handleScheduleOnlineSubmit}>
                  <Text style={styles.modalSubmitBtnText}>Save Schedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* =====================================================================
          SESSION DETAILS MODAL (Full Web Parity)
          ===================================================================== */}
      {selectedSessionDetail && (
        <Modal
          visible={Boolean(selectedSessionDetail)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedSessionDetail(null)}
        >
          <View style={[styles.modalOverlay, modalOverlayInsets]}>
            <View style={styles.modalContent}>
              <View
                style={[
                  styles.topAccentStripe,
                  { backgroundColor: getStatusAccentColor(normalizeScheduleStatus(selectedSessionDetail.status)) },
                ]}
              />
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalTitle}>{selectedSessionDetail.type}</Text>
                  <Text style={[styles.modalSubtitle, { color: '#EA580C', fontFamily: 'monospace' }]}>
                    Booking #{selectedSessionDetail.bookingId}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedSessionDetail(null)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ flexShrink: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 14 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Identifier + Status Badges */}
                <View style={styles.detailHeaderCard}>
                  <View>
                    <Text style={styles.detailMicroLabel}>Booking Identifier</Text>
                    <Text style={styles.detailMonoCode}>#{selectedSessionDetail.bookingId}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <View style={styles.bookingStatusTag}>
                      <Text style={styles.bookingStatusTagText}>
                        {normalizeBookingStatus(selectedSessionDetail.status)}
                      </Text>
                    </View>
                    <View style={styles.bookingModeTag}>
                      <Text style={styles.bookingModeTagText}>
                        {selectedSessionDetail.mode === 'Online' ? 'Online' : 'In-Gym'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Session Details */}
                <View style={styles.detailSectionCard}>
                  <Text style={styles.detailSectionTitle}>SESSION DETAILS</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.modalInfoLabel}>Date</Text>
                    <Text style={styles.modalInfoVal}>{formatFullDate(selectedSessionDetail.date)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.modalInfoLabel}>Time</Text>
                    <Text style={styles.modalInfoVal}>
                      {selectedSessionDetail.startTime}
                      {selectedSessionDetail.endTime ? ` – ${selectedSessionDetail.endTime}` : ''}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.modalInfoLabel}>Duration</Text>
                    <Text style={styles.modalInfoVal}>{selectedSessionDetail.duration}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.modalInfoLabel}>Mode</Text>
                    <Text style={[styles.modalInfoVal, { color: '#EA580C' }]}>
                      {selectedSessionDetail.mode === 'Online' ? 'Online Virtual Session' : 'In-Gym'}
                    </Text>
                  </View>
                  {selectedSessionDetail.fee > 0 && (
                    <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.modalInfoLabel}>Session Fee</Text>
                      <Text style={[styles.modalInfoVal, { color: '#EA580C' }]}>₹{selectedSessionDetail.fee}</Text>
                    </View>
                  )}
                </View>

                {/* Member Information */}
                <View style={styles.detailSectionCard}>
                  <Text style={styles.detailSectionTitle}>MEMBER INFORMATION</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={styles.bookingAvatar}>
                      {selectedSessionDetail.customerPhoto ? (
                        <Image source={{ uri: selectedSessionDetail.customerPhoto }} style={styles.bookingAvatarImg} />
                      ) : (
                        <Text style={styles.bookingAvatarText}>
                          {selectedSessionDetail.customerName.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.bookingCustName}>{selectedSessionDetail.customerName}</Text>
                      {!!selectedSessionDetail.customerEmail && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(`mailto:${selectedSessionDetail.customerEmail}`)}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                          <Ionicons name="mail-outline" size={12} color="#64748B" />
                          <Text style={styles.bookingCustEmail}>{selectedSessionDetail.customerEmail}</Text>
                        </TouchableOpacity>
                      )}
                      {!!selectedSessionDetail.customerPhone && (
                        <TouchableOpacity
                          onPress={() => Linking.openURL(`tel:${selectedSessionDetail.customerPhone}`)}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                          <Ionicons name="call-outline" size={12} color="#64748B" />
                          <Text style={styles.bookingCustEmail}>{selectedSessionDetail.customerPhone}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                {/* Attendance Records */}
                {(selectedSessionDetail.checkInTimeRaw || selectedSessionDetail.checkOutTimeRaw) && (
                  <View style={styles.detailSectionCard}>
                    <Text style={styles.detailSectionTitle}>ATTENDANCE RECORDS</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {selectedSessionDetail.checkInTimeRaw && (
                        <View style={styles.attendanceMiniBox}>
                          <Text style={styles.attendanceMiniLabel}>Check-In</Text>
                          <Text style={styles.attendanceMiniVal}>
                            {formatClockTime(selectedSessionDetail.checkInTimeRaw)}
                          </Text>
                        </View>
                      )}
                      {selectedSessionDetail.checkOutTimeRaw && (
                        <View style={styles.attendanceMiniBox}>
                          <Text style={styles.attendanceMiniLabel}>Check-Out</Text>
                          <Text style={styles.attendanceMiniVal}>
                            {formatClockTime(selectedSessionDetail.checkOutTimeRaw)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Rejection Reason */}
                {!!selectedSessionDetail.rejectionReason && (
                  <View style={styles.rejectionReasonBox}>
                    <Text style={styles.rejectionReasonText}>
                      <Text style={{ fontWeight: '800' }}>Rejection Reason: </Text>
                      {selectedSessionDetail.rejectionReason}
                    </Text>
                  </View>
                )}

                {/* Customer Rating */}
                {!!selectedSessionDetail.customerRating && (
                  <View style={styles.ratingStripBox}>
                    <Text style={styles.ratingStripTitle}>
                      Customer Rating: {selectedSessionDetail.customerRating} / 5
                    </Text>
                    {!!selectedSessionDetail.customerReview && (
                      <Text style={styles.ratingStripReview}>"{selectedSessionDetail.customerReview}"</Text>
                    )}
                  </View>
                )}

                {/* Jitsi Room */}
                {selectedSessionDetail.mode === 'Online' && selectedSessionDetail.status !== 'Completed' && (
                  <View style={styles.detailSectionCard}>
                    <Text style={styles.detailSectionTitle}>JITSI MEETING ROOM</Text>
                    <Text style={styles.meetingLinkStripText}>{selectedSessionDetail.meetingLink}</Text>
                    <TouchableOpacity
                      style={styles.modalActionBtn}
                      onPress={() => openJitsiLink(selectedSessionDetail)}
                    >
                      <Ionicons name="videocam" size={16} color="#FFFFFF" />
                      <Text style={styles.modalActionBtnText}>Open Video Call Studio</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Session Workout & Notes */}
                <View style={styles.detailSectionCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.detailSectionTitle}>SESSION WORKOUT & NOTES</Text>
                    {!selectedSessionDetail.isCustom && (
                      <TouchableOpacity
                        onPress={() => {
                          const target = selectedSessionDetail;
                          setSelectedSessionDetail(null);
                          openNotesModal(target);
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#EA580C' }}>Edit Notes</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.notesSnippetText}>
                    <Text style={{ fontWeight: '800', color: '#111827' }}>Exercises Completed: </Text>
                    {selectedSessionDetail.sessionNotes?.exercisesCompleted || 'None recorded'}
                  </Text>
                  {!!selectedSessionDetail.sessionNotes?.customerPerformance && (
                    <Text style={styles.notesSnippetText}>
                      <Text style={{ fontWeight: '800', color: '#111827' }}>Performance: </Text>
                      {selectedSessionDetail.sessionNotes.customerPerformance}
                    </Text>
                  )}
                  {!!selectedSessionDetail.sessionNotes?.dietRecommendations && (
                    <Text style={styles.notesSnippetText}>
                      <Text style={{ fontWeight: '800', color: '#111827' }}>Diet: </Text>
                      {selectedSessionDetail.sessionNotes.dietRecommendations}
                    </Text>
                  )}
                  {!!selectedSessionDetail.sessionNotes?.nextSessionFocus && (
                    <Text style={styles.notesSnippetText}>
                      <Text style={{ fontWeight: '800', color: '#111827' }}>Next Focus: </Text>
                      {selectedSessionDetail.sessionNotes.nextSessionFocus}
                    </Text>
                  )}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={[styles.modalSubmitBtn, { flex: 1 }]} onPress={() => setSelectedSessionDetail(null)}>
                  <Text style={styles.modalSubmitBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* =====================================================================
          DECLINE / REJECT BOOKING MODAL
          ===================================================================== */}
      {rejectModalTarget && (
        <Modal
          visible={Boolean(rejectModalTarget)}
          transparent
          animationType="fade"
          onRequestClose={() => setRejectModalTarget(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalOverlay, modalOverlayInsets]}
          >
            <View style={styles.modalContent}>
              <View style={[styles.modalHeader, { backgroundColor: '#FFF1F2', borderBottomColor: '#FECDD3' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Ionicons name="alert-circle" size={18} color="#BE123C" />
                  <Text style={[styles.modalTitle, { color: '#9F1239' }]}>Decline Booking Request</Text>
                </View>
                <TouchableOpacity onPress={() => setRejectModalTarget(null)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={{ padding: 16, gap: 12 }}>
                <Text style={{ fontSize: 12, color: '#64748B', lineHeight: 18 }}>
                  Declining the booking from{' '}
                  <Text style={{ fontWeight: '800', color: '#111827' }}>{rejectModalTarget.customerName}</Text> scheduled
                  on <Text style={{ fontWeight: '700' }}>{formatBookingDate(rejectModalTarget.date)}</Text> at{' '}
                  <Text style={{ fontWeight: '700' }}>{rejectModalTarget.startTime}</Text>.
                </Text>

                <View>
                  <Text style={styles.modalInputLabel}>REASON (OPTIONAL)</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 74, textAlignVertical: 'top' }]}
                    value={rejectReason}
                    onChangeText={setRejectReason}
                    multiline
                    placeholder="e.g. Scheduling conflict, fully booked at this time..."
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={[styles.modalCancelBtn, { flex: 1 }]} onPress={() => setRejectModalTarget(null)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { flex: 1.4, backgroundColor: '#E11D48' }]}
                  onPress={handleConfirmReject}
                  disabled={actionLoading === `${rejectModalTarget._id}-reject`}
                >
                  <Text style={styles.modalSubmitBtnText}>
                    {actionLoading === `${rejectModalTarget._id}-reject` ? 'Rejecting...' : 'Confirm Reject'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* =====================================================================
          ADD / EDIT SESSION NOTES MODAL (5 Web Fields)
          ===================================================================== */}
      {notesModalTarget && (
        <Modal
          visible={Boolean(notesModalTarget)}
          transparent
          animationType="fade"
          onRequestClose={() => setNotesModalTarget(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={[styles.modalOverlay, modalOverlayInsets]}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalTitle}>Session Notes</Text>
                  <Text style={styles.modalSubtitle}>
                    {notesModalTarget.customerName} · {formatBookingDate(notesModalTarget.date)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setNotesModalTarget(null)} style={{ padding: 4 }}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ flexShrink: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View>
                  <Text style={styles.modalInputLabel}>EXERCISES COMPLETED</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 60, textAlignVertical: 'top' }]}
                    value={notesForm.exercisesCompleted}
                    onChangeText={txt => setNotesForm({ ...notesForm, exercisesCompleted: txt })}
                    multiline
                    placeholder="e.g. Dumbbell bench press 4x10, Incline pushups 3x12"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>PROBLEMS / FORM ISSUES</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={notesForm.problemsNoticed}
                    onChangeText={txt => setNotesForm({ ...notesForm, problemsNoticed: txt })}
                    placeholder="e.g. Knee valgus on heavy squats"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>DIET RECOMMENDATIONS</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={notesForm.dietRecommendations}
                    onChangeText={txt => setNotesForm({ ...notesForm, dietRecommendations: txt })}
                    placeholder="e.g. Increase post-workout protein to 35g"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>NEXT SESSION FOCUS</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={notesForm.nextSessionFocus}
                    onChangeText={txt => setNotesForm({ ...notesForm, nextSessionFocus: txt })}
                    placeholder="e.g. Core stabilization and progressive overload"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>CUSTOMER PERFORMANCE</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {PERFORMANCE_OPTIONS.map(opt => {
                      const active = notesForm.customerPerformance === opt;
                      return (
                        <TouchableOpacity
                          key={opt}
                          style={[styles.smallFilterPill, active && styles.smallFilterPillActive]}
                          onPress={() => setNotesForm({ ...notesForm, customerPerformance: opt })}
                        >
                          <Text style={[styles.smallFilterPillText, active && styles.smallFilterPillTextActive]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={[styles.modalCancelBtn, { flex: 1 }]} onPress={() => setNotesModalTarget(null)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { flex: 1.4 }]}
                  onPress={handleSaveNotes}
                  disabled={actionLoading === `${notesModalTarget._id}-notes`}
                >
                  <Text style={styles.modalSubmitBtnText}>
                    {actionLoading === `${notesModalTarget._id}-notes` ? 'Saving...' : 'Save Notes'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 110, gap: 14 },

  // Tabs Bar
  topTabsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#C2410C',
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  scheduleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C2410C',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    flexShrink: 0,
  },
  scheduleActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // 4 KPI Cards
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  kpiCardActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  kpiIconSquircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  kpiLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },

  // Search Filter Card
  searchFilterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 38,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11.5,
    color: '#111827',
  },
  filterDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectDropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
  },
  selectDropdownBtnActive: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFF7ED',
  },
  selectDropdownText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    flexShrink: 1,
  },
  selectDropdownTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  sessionCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 2,
  },
  sessionCountTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  // Schedule Timeline Card
  scheduleTimelineCardWrap: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  scheduleCardToday: {
    borderColor: '#FDBA74',
  },
  topAccentStripe: {
    height: 3.5,
    width: '100%',
  },
  scheduleTimelineInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  dateCol: {
    width: 52,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateColToday: {
    backgroundColor: '#C2410C',
  },
  dateColDay: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    lineHeight: 21,
  },
  dateColMon: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
    textTransform: 'uppercase',
  },
  dateColTodayTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  scheduleType: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  bookingIdBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingIdBadgeText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: '#64748B',
    fontWeight: '700',
  },
  scheduleTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  scheduleClientName: {
    fontSize: 11.5,
    color: '#111827',
    fontWeight: '700',
  },
  eyeBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Workflow Notice Banner
  workflowNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
  },
  workflowIconSquircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workflowNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },

  // Booking Filter Pills
  bookingFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingFilterPillActive: {
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
  },
  bookingFilterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  bookingFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  filterCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  filterCountBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterCountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },

  // Booking Cards
  bookingCardWrap: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookingCardBody: {
    padding: 14,
    gap: 10,
  },
  bookingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bookingAvatarImg: {
    width: '100%',
    height: '100%',
  },
  bookingAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EA580C',
  },
  bookingCustName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  bookingCustEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  bookingStatusTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bookingStatusTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  bookingModeTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bookingModeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  bookingIdTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bookingIdTagText: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: '#64748B',
  },
  bookingScheduleBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 12,
    padding: 10,
    gap: 5,
  },
  bookingScheduleDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  bookingScheduleTime: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  bookingScheduleDuration: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  meetingLinkStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  meetingLinkStripText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EA580C',
    flex: 1,
  },
  rejectionReasonBox: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 10,
    padding: 9,
  },
  rejectionReasonText: {
    fontSize: 11,
    color: '#BE123C',
  },
  notesSnippetBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 9,
  },
  notesSnippetText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  cardFooterBorder: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  checkedOutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  checkedOutBannerLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#EA580C',
  },
  checkedOutBannerTime: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#EA580C',
    fontWeight: '700',
  },
  completedBadgePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  completedBadgePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  cancelledBanner: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  cancelledBannerText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  primaryActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  primaryActionPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rejectActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  rejectActionPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#BE123C',
  },
  bookingIconOnlyBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookingActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },

  // Online Sessions specifics
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveNowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveNowBannerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B91C1C',
  },
  countdownStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  countdownStripText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  ratingStripBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 9,
    gap: 3,
  },
  ratingStripTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#92400E',
  },
  ratingStripReview: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#78350F',
  },

  // Loading & Empty
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyOnlineCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyOnlineIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyOnlineTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  emptyOnlineSub: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },

  // Filter pills inside modals
  smallFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  smallFilterPillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  smallFilterPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  smallFilterPillTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  modeToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  modeToggleBtnActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  modeToggleTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  pickerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
  },
  pickerOptionRowActive: {
    backgroundColor: '#FFF7ED',
  },
  pickerOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  pickerOptionTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#111827',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    backgroundColor: '#C2410C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  detailHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E8EAED',
    borderRadius: 12,
    padding: 12,
  },
  detailMicroLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  detailMonoCode: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#111827',
  },
  detailSectionCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  detailSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  attendanceMiniBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
  },
  attendanceMiniLabel: {
    fontSize: 10,
    color: '#EA580C',
    fontWeight: '700',
  },
  attendanceMiniVal: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#EA580C',
    marginTop: 2,
  },
  modalInfoLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  modalInfoVal: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#111827',
    flexShrink: 1,
    textAlign: 'right',
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  modalActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
