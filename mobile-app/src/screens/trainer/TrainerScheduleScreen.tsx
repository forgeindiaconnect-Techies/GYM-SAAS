import React, { useState, useEffect, useCallback } from 'react';
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
  Share,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';

const { width } = Dimensions.get('window');

type SchedulingTab = 'schedule' | 'bookings' | 'online';

export const TrainerScheduleScreen: React.FC<{ onNavigateTab?: (tab: string, sub?: string) => void }> = ({ onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<SchedulingTab>('schedule');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Raw sessions from API
  const [sessions, setSessions] = useState<any[]>([
    {
      _id: 'sess-1',
      bookingId: 'BKG-9F5KMZ5T9',
      customerName: 'Renugopal Y',
      customerEmail: 'renugopal5457@gmail.com',
      customerPhone: '+91 98765 43210',
      type: '1-on-1 Online',
      mode: 'Online',
      date: '2026-10-15',
      displayDate: '15 OCT',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      duration: '60 min',
      status: 'Completed',
      attendanceStatus: 'Present',
      checkInTime: '03:58 PM',
      checkOutTime: '03:59 PM',
      meetingLink: 'https://meet.jit.si/Gymora-Online-5349AD',
      notes: 'Customer completed all scheduled upper body sets.',
    }
  ]);

  // Tab 1: Schedule State
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleModeFilter, setScheduleModeFilter] = useState<'All' | 'Online' | 'Offline'>('All');
  const [scheduleDateFilter, setScheduleDateFilter] = useState<'All' | 'Today'>('All');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newScheduleForm, setNewScheduleForm] = useState({
    type: '1-on-1 Online',
    client: 'Renugopal Y',
    date: '2026-10-20',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    mode: 'Online',
    notes: '',
  });

  // Tab 2: Session Bookings State
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('All');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedBookingForNotes, setSelectedBookingForNotes] = useState<any | null>(null);
  const [notesForm, setNotesForm] = useState({
    exercisesCompleted: 'Upper Body Sets & Core',
    customerPerformance: 'Good',
    problemsNoticed: 'None',
    dietRecommendations: 'Increase protein intake post-workout',
    nextSessionFocus: 'Lower body and cardio interval',
  });

  // Tab 3: Online Sessions State
  const [onlineTabFilter, setOnlineTabFilter] = useState<'upcoming' | 'live' | 'completed'>('upcoming');

  // Shared Detail Modal
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<any | null>(null);

  // Fetch Schedule Data from API
  const fetchSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-sessions/trainer');
      if (res.data?.success && res.data.sessions?.length > 0) {
        const mapped = res.data.sessions.map((s: any) => {
          const rawDate = s.date ? s.date.split('T')[0] : '2026-10-15';
          const dt = new Date(rawDate);
          const dayNum = isNaN(dt.getDate()) ? '15' : dt.getDate().toString().padStart(2, '0');
          const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
          const mon = isNaN(dt.getMonth()) ? 'OCT' : months[dt.getMonth()];

          return {
            _id: s._id,
            bookingId: s.bookingId || ('BKG-' + s._id.slice(-8).toUpperCase()),
            customerName: s.customerName || (s.customerId ? `${s.customerId.firstName || ''} ${s.customerId.lastName || ''}`.trim() : 'Renugopal Y'),
            customerEmail: s.customerId?.email || 'renugopal5457@gmail.com',
            customerPhone: s.customerId?.phone || '+91 98765 43210',
            type: s.sessionType || (s.mode === 'Online' ? '1-on-1 Online' : '1-on-1 Personal Training'),
            mode: s.sessionType === 'Online' || s.mode === 'Online' ? 'Online' : 'Offline',
            date: rawDate,
            displayDate: `${dayNum} ${mon}`,
            startTime: s.startTime || '10:00 AM',
            endTime: s.endTime || '11:00 AM',
            duration: s.duration ? `${s.duration} min` : '60 min',
            status: s.status || 'Completed',
            attendanceStatus: s.attendanceStatus || (s.status === 'Completed' ? 'Present' : 'Pending'),
            checkInTime: s.checkInTime ? new Date(s.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : (s.startTime || '03:58 PM'),
            checkOutTime: s.checkOutTime ? new Date(s.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '03:59 PM',
            meetingLink: s.meetingLink || 'https://meet.jit.si/Gymora-Online-5349AD',
            notes: s.notes || s.sessionNotes?.notes || 'Client session conducted.',
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
    setRefreshing(true);
    fetchSchedule();
  };

  // Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessionsCount = sessions.filter(s => s.date === todayStr).length;
  const upcomingCount = sessions.filter(s => ['Upcoming', 'Confirmed', 'Approved'].includes(s.status)).length;
  const pendingRequestsCount = sessions.filter(s => s.status === 'Pending').length;
  const completedCount = sessions.filter(s => s.status === 'Completed').length;

  // Filtered Sessions for Tab 1 (Schedule)
  const filteredSchedule = sessions.filter(s => {
    const q = scheduleSearch.toLowerCase().trim();
    const matchSearch = !q || s.customerName.toLowerCase().includes(q) || s.type.toLowerCase().includes(q) || s.bookingId.toLowerCase().includes(q);
    const matchMode = scheduleModeFilter === 'All' ? true : s.mode === scheduleModeFilter;
    const matchDate = scheduleDateFilter === 'All' ? true : s.date === todayStr;
    return matchSearch && matchMode && matchDate;
  });

  // Filtered Sessions for Tab 2 (Bookings)
  const filteredBookings = sessions.filter(s => {
    if (bookingStatusFilter === 'All') return true;
    return s.status.toLowerCase() === bookingStatusFilter.toLowerCase();
  });

  // Filtered Sessions for Tab 3 (Online Sessions)
  const onlineSessionsList = sessions.filter(s => s.mode === 'Online');
  const filteredOnline = onlineSessionsList.filter(s => {
    if (onlineTabFilter === 'completed') return s.status === 'Completed';
    if (onlineTabFilter === 'live') return s.status === 'Live' || s.status === 'In Progress';
    return ['Upcoming', 'Confirmed', 'Approved', 'Pending'].includes(s.status);
  });

  // Handlers
  const handleScheduleOnlineSubmit = async () => {
    if (!newScheduleForm.client.trim()) {
      Alert.alert('Client Name Required', 'Please enter a client name.');
      return;
    }
    const newSession = {
      _id: 'sess-' + Date.now(),
      bookingId: 'BKG-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      customerName: newScheduleForm.client,
      customerEmail: 'member@example.com',
      customerPhone: '+91 98765 43210',
      type: newScheduleForm.type,
      mode: newScheduleForm.mode,
      date: newScheduleForm.date,
      displayDate: '20 OCT',
      startTime: newScheduleForm.startTime,
      endTime: newScheduleForm.endTime,
      duration: '60 min',
      status: 'Confirmed',
      attendanceStatus: 'Pending',
      checkInTime: '—',
      checkOutTime: '—',
      meetingLink: 'https://meet.jit.si/Gymora-Online-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      notes: newScheduleForm.notes || '1-on-1 virtual training session.',
    };

    setSessions(prev => [newSession, ...prev]);
    Alert.alert('Session Scheduled', 'New session has been added to your schedule.');
    setShowScheduleModal(false);
  };

  const handleApproveBooking = (id: string) => {
    setSessions(prev => prev.map(s => s._id === id ? { ...s, status: 'Approved' } : s));
    Alert.alert('Booking Approved', 'The session is now approved and appears in your Online Sessions.');
  };

  const handleRejectBooking = (id: string) => {
    setSessions(prev => prev.map(s => s._id === id ? { ...s, status: 'Rejected' } : s));
    Alert.alert('Booking Rejected', 'The session request has been marked as rejected.');
  };

  const handleSaveNotes = () => {
    if (!selectedBookingForNotes) return;
    setSessions(prev => prev.map(s => s._id === selectedBookingForNotes._id ? {
      ...s,
      notes: `${notesForm.exercisesCompleted} • Performance: ${notesForm.customerPerformance}`,
    } : s));
    Alert.alert('Notes Saved', 'Coaching notes and workout observations updated.');
    setShowNotesModal(false);
  };

  const handleExportSchedule = async (format: 'Excel' | 'PDF') => {
    const dateStr = new Date().toISOString().split('T')[0];
    const title = `Trainer_Schedule_${dateStr}.${format === 'Excel' ? 'csv' : 'txt'}`;
    const content = `TRAINER SCHEDULE REPORT (${format.toUpperCase()})\nCoach: Naveen\nDate: ${new Date().toLocaleDateString()}\n\n` +
      sessions.map((s, idx) => 
        `${idx + 1}. ${s.displayDate} • ${s.type} (${s.bookingId})\n   Client: ${s.customerName}\n   Time: ${s.startTime} - ${s.endTime} (${s.duration})\n   Mode: ${s.mode} | Status: ${s.status}`
      ).join('\n\n');

    try {
      await Share.share({ title, message: content });
      Alert.alert('Export Complete', `${format} report generated successfully!`);
    } catch {
      Alert.alert('Export Complete', `${format} report generated.`);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={COLORS.primary} 
          colors={[COLORS.primary]} 
        />
      }
    >
      {/* =========================================================================
          PRIMARY TABS BAR (Matching Web Images 1, 2, 3, 4)
          ========================================================================= */}
      <View style={styles.topTabsCard}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'schedule' && styles.tabBtnActive]}
          onPress={() => setActiveTab('schedule')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar" size={15} color={activeTab === 'schedule' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'schedule' && styles.tabBtnTextActive]}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'bookings' && styles.tabBtnActive]}
          onPress={() => setActiveTab('bookings')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={15} color={activeTab === 'bookings' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'bookings' && styles.tabBtnTextActive]}>
            Session Bookings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'online' && styles.tabBtnActive]}
          onPress={() => setActiveTab('online')}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={15} color={activeTab === 'online' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'online' && styles.tabBtnTextActive]}>
            Online Sessions
          </Text>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          TAB 1: SCHEDULE (Matching Web Image 1)
          ========================================================================= */}
      {activeTab === 'schedule' && (
        <View style={{ gap: 14 }}>
          {/* Header & Schedule Online Session Action */}
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
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.scheduleActionBtnText}>Schedule Online Session</Text>
            </TouchableOpacity>
          </View>

          {/* 4 Metric KPI Cards (Web Image 1) */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <View style={styles.kpiIconSquircle}>
                <Ionicons name="calendar-outline" size={16} color="#EA580C" />
              </View>
              <Text style={styles.kpiVal}>{todaySessionsCount}</Text>
              <Text style={styles.kpiLabel}>Today's Sessions</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiIconSquircle}>
                <Ionicons name="chevron-forward-outline" size={16} color="#EA580C" />
              </View>
              <Text style={styles.kpiVal}>{upcomingCount}</Text>
              <Text style={styles.kpiLabel}>Upcoming</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconSquircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="alert-circle-outline" size={16} color="#B45309" />
              </View>
              <Text style={styles.kpiVal}>{pendingRequestsCount}</Text>
              <Text style={styles.kpiLabel}>Pending Requests</Text>
            </View>

            <View style={styles.kpiCard}>
              <View style={styles.kpiIconSquircle}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#15803D" />
              </View>
              <Text style={styles.kpiVal}>{completedCount}</Text>
              <Text style={styles.kpiLabel}>Completed</Text>
            </View>
          </View>

          {/* Search & Filter Bar (Web Image 1) */}
          <View style={styles.searchFilterCard}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={15} color="#64748B" />
              <TextInput
                placeholder="Search member, session type, booking ID..."
                placeholderTextColor="#94A3B8"
                value={scheduleSearch}
                onChangeText={setScheduleSearch}
                style={styles.searchInput}
              />
              {Boolean(scheduleSearch) && (
                <TouchableOpacity onPress={() => setScheduleSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {(['All', 'Online', 'Offline'] as const).map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.smallFilterPill, scheduleModeFilter === m && styles.smallFilterPillActive]}
                    onPress={() => setScheduleModeFilter(m)}
                  >
                    <Text style={[styles.smallFilterPillText, scheduleModeFilter === m && styles.smallFilterPillTextActive]}>
                      {m === 'All' ? 'All Modes' : m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sessionCountTag}>{filteredSchedule.length} session</Text>
            </View>
          </View>

          {/* Timeline Roster (Matching Web Image 1 Card) */}
          <View style={{ gap: 10 }}>
            {filteredSchedule.map((sess) => (
              <View key={sess._id} style={styles.scheduleTimelineCard}>
                {/* Date Column */}
                <View style={styles.dateCol}>
                  <Text style={styles.dateColDay}>{sess.displayDate.split(' ')[0]}</Text>
                  <Text style={styles.dateColMon}>{sess.displayDate.split(' ')[1] || 'OCT'}</Text>
                </View>

                {/* Session Details */}
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={styles.scheduleType}>{sess.type}</Text>
                    <View style={styles.bookingIdBadge}>
                      <Text style={styles.bookingIdBadgeText}>#{sess.bookingId}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="time-outline" size={12} color="#EA580C" />
                    <Text style={styles.scheduleTime}>
                      {sess.startTime} – {sess.endTime} · {sess.duration}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="person-outline" size={12} color="#64748B" />
                    <Text style={styles.scheduleClientName}>{sess.customerName}</Text>
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setSelectedSessionDetail(sess)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="eye-outline" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* =========================================================================
          TAB 2: SESSION BOOKINGS (Matching Web Images 2 & 3)
          ========================================================================= */}
      {activeTab === 'bookings' && (
        <View style={{ gap: 14 }}>
          {/* Header */}
          <View>
            <Text style={styles.pageTitle}>Session Bookings</Text>
            <Text style={styles.pageSubtitle}>
              Manage customer booking requests - approve or reject incoming sessions.
            </Text>
          </View>

          {/* Workflow Notice Banner (Web Image 2) */}
          <View style={styles.workflowNoticeBanner}>
            <View style={styles.workflowIconSquircle}>
              <Ionicons name="funnel-outline" size={16} color="#EA580C" />
            </View>
            <Text style={styles.workflowNoticeText}>
              <Text style={{ fontWeight: '800', color: '#111827' }}>Workflow: </Text>
              Customer books → <Text style={{ color: '#EA580C', fontWeight: '700' }}>Pending</Text> → You <Text style={{ fontWeight: '700', color: '#15803D' }}>Approve</Text> or <Text style={{ fontWeight: '700', color: '#B91C1C' }}>Reject</Text> → Approved online bookings appear automatically in <Text style={{ color: '#EA580C', fontWeight: '700' }}>Online Sessions</Text>.
            </Text>
          </View>

          {/* Status Filter Pills (Web Image 2) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {['All', 'Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected'].map((st) => {
              const count = st === 'All' ? sessions.length : sessions.filter(s => s.status.toLowerCase() === st.toLowerCase()).length;
              return (
                <TouchableOpacity
                  key={st}
                  style={[styles.bookingFilterPill, bookingStatusFilter === st && styles.bookingFilterPillActive]}
                  onPress={() => setBookingStatusFilter(st)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.bookingFilterPillText, bookingStatusFilter === st && styles.bookingFilterPillTextActive]}>
                    {st} {count > 0 ? count : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Booking Cards (Web Images 2 & 3) */}
          <View style={{ gap: 12 }}>
            {filteredBookings.map((bkg) => (
              <View key={bkg._id} style={styles.bookingCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <View style={styles.bookingAvatar}>
                      <Text style={styles.bookingAvatarText}>{bkg.customerName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bookingCustName}>{bkg.customerName}</Text>
                      <Text style={styles.bookingCustEmail}>{bkg.customerEmail}</Text>
                    </View>
                  </View>
                </View>

                {/* Status Tags */}
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <View style={styles.bookingStatusTag}>
                    <Text style={styles.bookingStatusTagText}>{bkg.status}</Text>
                  </View>
                  <View style={styles.bookingModeTag}>
                    <Text style={styles.bookingModeTagText}>{bkg.mode}</Text>
                  </View>
                  <View style={styles.bookingIdTag}>
                    <Text style={styles.bookingIdTagText}>#{bkg.bookingId}</Text>
                  </View>
                </View>

                {/* Schedule Box */}
                <View style={styles.bookingScheduleBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="calendar-outline" size={13} color="#64748B" />
                    <Text style={styles.bookingScheduleDate}>Thu, 15 Oct, 2026</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="time-outline" size={13} color="#64748B" />
                    <Text style={styles.bookingScheduleTime}>{bkg.startTime} - {bkg.endTime}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="people-outline" size={13} color="#64748B" />
                    <Text style={styles.bookingScheduleDuration}>{bkg.duration} session</Text>
                  </View>
                </View>

                {/* Checkout Indicator */}
                <View style={styles.checkedOutIndicator}>
                  <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                  <Text style={styles.checkedOutText}>Checked Out {bkg.checkOutTime}</Text>
                </View>

                {/* Bottom Actions */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
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
                    onPress={() => {
                      setSelectedBookingForNotes(bkg);
                      setShowNotesModal(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="document-text-outline" size={14} color="#111827" />
                    <Text style={styles.bookingActionBtnText}>Add Notes</Text>
                  </TouchableOpacity>

                  {bkg.status === 'Pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.bookingActionBtn, { backgroundColor: '#15803D' }]}
                        onPress={() => handleApproveBooking(bkg._id)}
                      >
                        <Text style={[styles.bookingActionBtnText, { color: '#FFFFFF' }]}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.bookingActionBtn, { backgroundColor: '#B91C1C' }]}
                        onPress={() => handleRejectBooking(bkg._id)}
                      >
                        <Text style={[styles.bookingActionBtnText, { color: '#FFFFFF' }]}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* =========================================================================
          TAB 3: ONLINE SESSIONS (Matching Web Image 4)
          ========================================================================= */}
      {activeTab === 'online' && (
        <View style={{ gap: 14 }}>
          {/* Header */}
          <View>
            <Text style={styles.pageTitle}>Online Sessions</Text>
            <Text style={styles.pageSubtitle}>
              Conduct your approved online training sessions via Jitsi Meet.
            </Text>
          </View>

          {/* Notice Banner (Web Image 4) */}
          <View style={styles.workflowNoticeBanner}>
            <View style={styles.workflowIconSquircle}>
              <Ionicons name="videocam-outline" size={16} color="#EA580C" />
            </View>
            <Text style={styles.workflowNoticeText}>
              <Text style={{ fontWeight: '800', color: '#EA580C' }}>Only approved online bookings appear here. </Text>
              To approve a new customer booking, go to <Text style={{ fontWeight: '800', color: '#111827' }}>Session Bookings</Text>. Once approved, the session will automatically appear in this list.
            </Text>
          </View>

          {/* Filter Tabs: Upcoming, Live Now, Completed 1 */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.bookingFilterPill, onlineTabFilter === 'upcoming' && styles.bookingFilterPillActive]}
              onPress={() => setOnlineTabFilter('upcoming')}
            >
              <Text style={[styles.bookingFilterPillText, onlineTabFilter === 'upcoming' && styles.bookingFilterPillTextActive]}>
                Upcoming
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bookingFilterPill, onlineTabFilter === 'live' && styles.bookingFilterPillActive]}
              onPress={() => setOnlineTabFilter('live')}
            >
              <Text style={[styles.bookingFilterPillText, onlineTabFilter === 'live' && styles.bookingFilterPillTextActive]}>
                Live Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bookingFilterPill, onlineTabFilter === 'completed' && styles.bookingFilterPillActive]}
              onPress={() => setOnlineTabFilter('completed')}
            >
              <Text style={[styles.bookingFilterPillText, onlineTabFilter === 'completed' && styles.bookingFilterPillTextActive]}>
                Completed {onlineSessionsList.filter(s => s.status === 'Completed').length}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          {filteredOnline.length === 0 ? (
            /* Empty State Matching Web Image 4 */
            <View style={styles.emptyOnlineCard}>
              <View style={styles.emptyOnlineIconBox}>
                <Ionicons name="videocam-outline" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyOnlineTitle}>No Upcoming Sessions</Text>
              <Text style={styles.emptyOnlineSub}>
                Approved online sessions will appear here when scheduled.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredOnline.map((sess) => (
                <View key={sess._id} style={styles.bookingCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bookingCustName}>{sess.customerName}</Text>
                      <Text style={styles.bookingCustEmail}>{sess.type}</Text>
                    </View>
                    <View style={styles.bookingStatusTag}>
                      <Text style={styles.bookingStatusTagText}>{sess.status}</Text>
                    </View>
                  </View>

                  <View style={styles.bookingScheduleBox}>
                    <Text style={styles.bookingScheduleDate}>{sess.date} · {sess.startTime} - {sess.endTime}</Text>
                    <Text style={{ fontSize: 11, color: '#EA580C', fontFamily: 'monospace', fontWeight: '800', marginTop: 2 }}>
                      ROOM: {sess.bookingId}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <TouchableOpacity
                      style={[styles.bookingActionBtn, { backgroundColor: '#EA580C', borderColor: '#EA580C' }]}
                      onPress={() => {
                        if (sess.meetingLink) {
                          Linking.openURL(sess.meetingLink);
                        } else {
                          Alert.alert('Virtual Studio', 'Virtual room link: https://meet.jit.si/' + sess.bookingId);
                        }
                      }}
                    >
                      <Ionicons name="videocam" size={14} color="#FFFFFF" />
                      <Text style={[styles.bookingActionBtnText, { color: '#FFFFFF' }]}>Join Video Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.bookingActionBtn}
                      onPress={() => setSelectedSessionDetail(sess)}
                    >
                      <Ionicons name="eye-outline" size={14} color="#111827" />
                      <Text style={styles.bookingActionBtnText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* =========================================================================
          SCHEDULE ONLINE SESSION MODAL (Matching Web Action)
          ========================================================================= */}
      {showScheduleModal && (
        <Modal
          visible={showScheduleModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowScheduleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Schedule Online Session</Text>
                  <Text style={styles.modalSubtitle}>Create a 1-on-1 virtual training appointment</Text>
                </View>
                <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 18 }} contentContainerStyle={{ gap: 12 }}>
                <View>
                  <Text style={styles.modalInputLabel}>CLIENT NAME *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={newScheduleForm.client}
                    onChangeText={(txt) => setNewScheduleForm({ ...newScheduleForm, client: txt })}
                    placeholder="e.g. Renugopal Y"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>SESSION TYPE</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={newScheduleForm.type}
                    onChangeText={(txt) => setNewScheduleForm({ ...newScheduleForm, type: txt })}
                    placeholder="1-on-1 Online"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>DATE *</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={newScheduleForm.date}
                      onChangeText={(txt) => setNewScheduleForm({ ...newScheduleForm, date: txt })}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>START TIME *</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={newScheduleForm.startTime}
                      onChangeText={(txt) => setNewScheduleForm({ ...newScheduleForm, startTime: txt })}
                      placeholder="10:00 AM"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>NOTES / AGENDA</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 60, textAlignVertical: 'top' }]}
                    value={newScheduleForm.notes}
                    onChangeText={(txt) => setNewScheduleForm({ ...newScheduleForm, notes: txt })}
                    multiline
                    placeholder="Special instructions or workout goals"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowScheduleModal(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleScheduleOnlineSubmit}
                >
                  <Text style={styles.modalSubmitBtnText}>Schedule Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* =========================================================================
          SESSION DETAILS MODAL
          ========================================================================= */}
      {selectedSessionDetail && (
        <Modal
          visible={Boolean(selectedSessionDetail)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedSessionDetail(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Session Details</Text>
                  <Text style={styles.modalSubtitle}>{selectedSessionDetail.bookingId}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedSessionDetail(null)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 18 }} contentContainerStyle={{ gap: 10 }}>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Client Name:</Text>
                  <Text style={styles.modalInfoVal}>{selectedSessionDetail.customerName}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Session Type:</Text>
                  <Text style={styles.modalInfoVal}>{selectedSessionDetail.type}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Mode:</Text>
                  <Text style={[styles.modalInfoVal, { color: '#EA580C' }]}>{selectedSessionDetail.mode}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Scheduled Time:</Text>
                  <Text style={styles.modalInfoVal}>{selectedSessionDetail.date} · {selectedSessionDetail.startTime} - {selectedSessionDetail.endTime}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Status:</Text>
                  <Text style={[styles.modalInfoVal, { color: '#15803D' }]}>{selectedSessionDetail.status}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Check-in / Check-out:</Text>
                  <Text style={styles.modalInfoVal}>{selectedSessionDetail.checkInTime} / {selectedSessionDetail.checkOutTime}</Text>
                </View>

                {selectedSessionDetail.meetingLink && (
                  <TouchableOpacity
                    style={styles.modalActionBtn}
                    onPress={() => Linking.openURL(selectedSessionDetail.meetingLink)}
                  >
                    <Ionicons name="videocam" size={16} color="#FFFFFF" />
                    <Text style={styles.modalActionBtnText}>Open Video Call Studio</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* =========================================================================
          ADD NOTES MODAL
          ========================================================================= */}
      {showNotesModal && (
        <Modal
          visible={showNotesModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNotesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Session Notes</Text>
                  <Text style={styles.modalSubtitle}>{selectedBookingForNotes?.customerName}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowNotesModal(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 18 }} contentContainerStyle={{ gap: 10 }}>
                <View>
                  <Text style={styles.modalInputLabel}>EXERCISES COMPLETED</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={notesForm.exercisesCompleted}
                    onChangeText={(txt) => setNotesForm({ ...notesForm, exercisesCompleted: txt })}
                  />
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>CLIENT PERFORMANCE</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={notesForm.customerPerformance}
                    onChangeText={(txt) => setNotesForm({ ...notesForm, customerPerformance: txt })}
                  />
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>DIET RECOMMENDATIONS</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={notesForm.dietRecommendations}
                    onChangeText={(txt) => setNotesForm({ ...notesForm, dietRecommendations: txt })}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowNotesModal(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleSaveNotes}
                >
                  <Text style={styles.modalSubmitBtnText}>Save Notes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    gap: 5,
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
    fontSize: 11,
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
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  scheduleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C2410C',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
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
    fontSize: 8,
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
    fontSize: 11,
    color: '#111827',
  },
  smallFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  smallFilterPillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FFEDD5',
  },
  smallFilterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  smallFilterPillTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  sessionCountTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },

  // Schedule Timeline Card
  scheduleTimelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  dateCol: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    paddingRight: 8,
  },
  dateColDay: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  dateColMon: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
    textTransform: 'uppercase',
  },
  scheduleType: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  bookingIdBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingIdBadgeText: {
    fontSize: 9,
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
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Workflow Notice Banner
  workflowNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 14,
    padding: 12,
  },
  workflowIconSquircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workflowNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },

  // Booking Filter Pills
  bookingFilterPill: {
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

  // Booking Cards
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  bookingAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#EA580C',
  },
  bookingCustName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  bookingCustEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  bookingStatusTag: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bookingStatusTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
  },
  bookingModeTag: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bookingModeTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  bookingIdTag: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bookingIdTagText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#94A3B8',
  },
  bookingScheduleBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  bookingScheduleDate: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  bookingScheduleTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  bookingScheduleDuration: {
    fontSize: 10,
    color: '#64748B',
  },
  checkedOutIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  checkedOutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  bookingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bookingActionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },

  // Empty Online Card
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
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyOnlineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  emptyOnlineSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    width: '100%',
    maxHeight: '80%',
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
    marginTop: 1,
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
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    backgroundColor: '#C2410C',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalInfoLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  modalInfoVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  modalActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
