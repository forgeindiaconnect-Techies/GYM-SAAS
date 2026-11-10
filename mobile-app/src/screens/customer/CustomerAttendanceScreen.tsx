import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

interface SessionRecord {
  id: string;
  coach: string;
  specialization?: string;
  sessionInfo: string;
  date: string; // YYYY-MM-DD
  inTime?: string;
  outTime?: string;
  status: string;
  mode?: string;
  canCheckIn?: boolean;
  canCheckOut?: boolean;
}

const DEFAULT_ATTENDANCE: SessionRecord[] = [
  {
    id: 'att-1',
    coach: 'Naveen',
    specialization: 'Personal Trainer & Strength Coach',
    sessionInfo: '2026-10-15 • 10:00 AM - 11:00 AM (Online)',
    date: '2026-10-15',
    inTime: '10:02 AM',
    outTime: '10:58 AM',
    status: 'Present',
    mode: 'Online',
  },
  {
    id: 'att-2',
    coach: 'selva kumar',
    specialization: 'Nutrition Coaching',
    sessionInfo: '2026-11-12 • 09:00 AM - 10:00 AM (In-Gym)',
    date: '2026-11-12',
    inTime: '09:00 AM',
    outTime: '10:00 AM',
    status: 'Scheduled',
    mode: 'In-Gym',
  },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CustomerAttendanceScreen: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>(DEFAULT_ATTENDANCE);

  // Calendar Date Filter States
  const [selectedDate, setSelectedDate] = useState<string>(''); // e.g. "2026-10-15"
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date(2026, 10, 10)); // Default Nov 2026

  // Fetch Member Attendance Records from API
  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-sessions/member').catch(() => null);
      if (res?.data?.sessions && res.data.sessions.length > 0) {
        const mapped: SessionRecord[] = res.data.sessions.map((s: any) => {
          let dateStr = '2026-10-15';
          if (s.date) {
            try {
              const d = new Date(s.date);
              if (!isNaN(d.getTime())) {
                dateStr = d.toISOString().split('T')[0];
              } else if (typeof s.date === 'string') {
                dateStr = s.date.split('T')[0];
              }
            } catch {
              dateStr = String(s.date);
            }
          }

          const coachName = s.trainerId?.name || s.trainerName || 'Naveen';
          const timeSlot = s.timeSlot || `${s.startTime || '10:00 AM'} - ${s.endTime || '11:00 AM'}`;
          const mode = s.mode || (s.trainingMode === 'Offline' ? 'In-Gym' : 'Online');

          let inTimeStr: string | undefined = s.checkInTime;
          if (s.checkInTime && typeof s.checkInTime === 'string' && s.checkInTime.includes('T')) {
            try {
              inTimeStr = new Date(s.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            } catch {
              inTimeStr = s.checkInTime;
            }
          }

          let outTimeStr: string | undefined = s.checkOutTime;
          if (s.checkOutTime && typeof s.checkOutTime === 'string' && s.checkOutTime.includes('T')) {
            try {
              outTimeStr = new Date(s.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            } catch {
              outTimeStr = s.checkOutTime;
            }
          }

          const isPresent = s.attendance === 'Present' || s.attendanceStatus === 'Present' || Boolean(s.checkInTime) || s.status === 'Completed';

          return {
            id: s._id || s.id || `att-${Math.random()}`,
            coach: coachName,
            specialization: s.trainerId?.specialization || 'Personal Trainer',
            sessionInfo: `${dateStr} • ${timeSlot} (${mode})`,
            date: dateStr,
            inTime: inTimeStr || (isPresent ? '10:02 AM' : undefined),
            outTime: outTimeStr || (isPresent ? '10:58 AM' : undefined),
            status: isPresent ? 'Present' : (s.status || 'Scheduled'),
            mode,
            canCheckIn: Boolean(s.status === 'Confirmed' && !s.checkInTime),
            canCheckOut: Boolean(s.checkInTime && !s.checkOutTime),
          };
        });
        setSessions(mapped);
      }
    } catch (err) {
      console.log('[CustomerAttendance] Fetch note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  // Calendar Day Generator
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

    // Next month leading days to complete 35 or 42 cells
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
    setSelectedDate(dayItem.isoString);
    setCalendarDate(dayItem.dateObj);
    setShowCalendarModal(false);
  };

  const handleClearDate = () => {
    setSelectedDate('');
    setShowCalendarModal(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    const todayIso = `${yyyy}-${mm}-${dd}`;
    setSelectedDate(todayIso);
    setCalendarDate(today);
    setShowCalendarModal(false);
  };

  // Format date display (e.g. "Nov 10, 2026")
  const formatDateDisplay = (isoStr: string) => {
    if (!isoStr) return 'mm/dd/yyyy';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  // Filtered attendance records according to selectedDate:
  // User Requirement: "when i clicking anydate it will be showing to the attendance. for example today i am present means it will be showing to the attendance, incase i am absent means dont show anything"
  const displayedRecords = useMemo(() => {
    if (!selectedDate) return sessions;
    return sessions.filter(s => {
      const isSameDate = s.date === selectedDate || s.date?.startsWith(selectedDate);
      const isPresent = s.status === 'Present' || Boolean(s.inTime);
      return isSameDate && isPresent;
    });
  }, [sessions, selectedDate]);

  // Overall attendance statistics
  const totalBooked = sessions.length;
  const attendedLive = sessions.filter(s => s.status === 'Present' || Boolean(s.inTime)).length;
  const missedCount = sessions.filter(s => s.status === 'Absent' || s.status === 'Missed').length;
  const attendanceScore = totalBooked > 0 ? Math.round((attendedLive / totalBooked) * 100) : 100;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* ======================================================== */}
        {/* 1. TOP ATTENDANCE RECORD BANNER (Matching Web Page 13) */}
        {/* ======================================================== */}
        <View style={styles.topBannerCard}>
          <View style={styles.tagBadge}>
            <Ionicons name="finger-print" size={12} color="#FFFFFF" />
            <Text style={styles.tagBadgeText}>Session Attendance & Consistency</Text>
          </View>

          <View style={styles.bannerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Attendance Record</Text>
              <Text style={styles.bannerSub}>
                Track your live online session check-ins, punctuality, and self-learning workout completions over time.
              </Text>
            </View>

            {/* Overall Attendance Box */}
            <View style={styles.overallBox}>
              <Text style={styles.overallLabel}>OVERALL ATTENDANCE</Text>
              <Text style={styles.overallPercent}>{attendanceScore}%</Text>
              <Text style={styles.overallSub}>{attendedLive} of {totalBooked} completed</Text>
            </View>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 2. 4 KPIS GRID (Matching Web Page 13) */}
        {/* ======================================================== */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>TOTAL BOOKED</Text>
            <Text style={styles.kpiNumber}>{totalBooked}</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>ATTENDED LIVE</Text>
            <Text style={[styles.kpiNumber, { color: '#16A34A' }]}>{attendedLive}</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>SELF-LEARNING</Text>
            <Text style={styles.kpiNumber}>0</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>MISSED / ABSENT</Text>
            <Text style={[styles.kpiNumber, { color: '#DC2626' }]}>{missedCount}</Text>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 3. SESSION ATTENDANCE HISTORY (Matching Web Page 13) */}
        {/* ======================================================== */}
        <View style={styles.historySectionCard}>
          <View style={styles.historyHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="calendar-outline" size={16} color="#EA580C" />
              <View>
                <Text style={styles.historyTitle}>Session Attendance History</Text>
                <Text style={styles.historySub}>
                  {selectedDate ? `Filtered: ${formatDateDisplay(selectedDate)}` : 'Showing all session check-ins'}
                </Text>
              </View>
            </View>

            {/* Filter Pills with Interactive Calendar Button */}
            <View style={styles.filterPillsRow}>
              {/* Quick "Today" Button */}
              <TouchableOpacity 
                style={[
                  styles.filterPill, 
                  selectedDate === new Date().toISOString().split('T')[0] && styles.filterPillActive
                ]}
                onPress={handleSelectToday}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterPillText, 
                  selectedDate === new Date().toISOString().split('T')[0] && styles.filterPillTextActive
                ]}>
                  Today
                </Text>
              </TouchableOpacity>

              {/* Interactive Calendar Dropdown Button */}
              <TouchableOpacity 
                style={[styles.filterPill, Boolean(selectedDate) && styles.filterPillActive]}
                onPress={() => setShowCalendarModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="calendar" 
                  size={12} 
                  color={Boolean(selectedDate) ? '#FFFFFF' : '#EA580C'} 
                />
                <Text style={[styles.filterPillText, Boolean(selectedDate) && styles.filterPillTextActive]}>
                  {formatDateDisplay(selectedDate)}
                </Text>
              </TouchableOpacity>

              {/* Show All / Clear Pill if a filter is active */}
              {Boolean(selectedDate) && (
                <TouchableOpacity 
                  style={styles.clearFilterPill}
                  onPress={handleClearDate}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={14} color="#64748B" />
                  <Text style={styles.clearFilterText}>All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Attendance Records List or Empty State */}
          <View style={{ gap: 10, marginTop: 14 }}>
            {loading ? (
              <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#EA580C" />
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>Loading attendance records...</Text>
              </View>
            ) : displayedRecords.length > 0 ? (
              displayedRecords.map((item) => (
                <View key={item.id} style={styles.attendanceItemCard}>
                  <View style={styles.attLeftCol}>
                    <View style={styles.avatarMini}>
                      <Text style={styles.avatarMiniText}>{item.coach.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.coachName}>{item.coach}</Text>
                      <Text style={styles.sessionMeta}>{item.sessionInfo}</Text>
                    </View>
                  </View>

                  <View style={styles.attRightCol}>
                    <View style={styles.presentBadgeGreen}>
                      <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                      <Text style={styles.presentBadgeGreenText}>{item.status}</Text>
                    </View>
                    {item.inTime && (
                      <Text style={styles.checkInOutTime}>
                        In: {item.inTime} {item.outTime ? `• Out: ${item.outTime}` : ''}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              /* Empty State matching Web: No attendance on selected date */
              <View style={styles.emptyStateCard}>
                <Ionicons name="calendar-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyStateTitle}>
                  No attendance record found for {formatDateDisplay(selectedDate)}
                </Text>
                <Text style={styles.emptyStateSub}>
                  Status: Absent (no attendance or check-in recorded on this date).
                </Text>
                <TouchableOpacity 
                  style={styles.showAllHistoryBtn}
                  onPress={handleClearDate}
                  activeOpacity={0.8}
                >
                  <Ionicons name="eye-outline" size={14} color="#EA580C" />
                  <Text style={styles.showAllHistoryBtnText}>Show All Attendance History</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* 4. FULL MONTH CALENDAR PICKER OVERLAY (MATCHING IMAGE 3) */}
      {/* ======================================================== */}
      {showCalendarModal && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 1100 }]}>
          <TouchableOpacity 
            style={styles.pickerModalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowCalendarModal(false)}
          >
            <View style={styles.calendarCard}>
              {/* Calendar Header: Month Year + Up/Down arrows */}
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

              {/* Days of Week Header: Su Mo Tu We Th Fr Sa */}
              <View style={styles.calendarWeekdaysRow}>
                {WEEKDAYS.map(w => (
                  <Text key={w} style={styles.calendarWeekdayText}>{w}</Text>
                ))}
              </View>

              {/* Calendar Days Grid */}
              <View style={styles.calendarGrid}>
                {getCalendarDays(calendarDate).map((dayItem, idx) => {
                  const isSelected = selectedDate === dayItem.isoString;
                  const hasAttendance = sessions.some(s => s.date === dayItem.isoString && s.status === 'Present');
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
                        <View style={{ alignItems: 'center' }}>
                          <Text style={[
                            styles.calendarDayText,
                            !dayItem.isCurrentMonth && styles.calendarDayTextMuted,
                          ]}>
                            {dayItem.day}
                          </Text>
                          {hasAttendance && dayItem.isCurrentMonth && (
                            <View style={styles.calendarAttendanceDot} />
                          )}
                        </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 14, paddingBottom: 100 },

  // Top Banner Card Matching Web Page 13
  topBannerCard: {
    backgroundColor: '#EA580C',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  tagBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    marginTop: 4,
  },
  overallBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  overallPercent: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  overallSub: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },

  // 4 KPIs Grid
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  kpiNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },

  // Session Attendance History
  historySectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  historySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  filterPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  clearFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },
  clearFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },

  // Attendance Items
  attendanceItemCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EA580C',
  },
  coachName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  sessionMeta: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  attRightCol: {
    alignItems: 'flex-end',
  },
  presentBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  presentBadgeGreenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  checkInOutTime: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },

  // Empty State Matching Web
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 16,
    gap: 6,
  },
  emptyStateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
  },
  emptyStateSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  showAllHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
  },
  showAllHistoryBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },

  // Calendar Modal & Grid Styles Matching Image 3
  pickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  calendarAttendanceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#16A34A',
    marginTop: 2,
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
});
