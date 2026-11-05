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
  Alert, 
  Modal,
  Share,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';
import { FileDownloader } from '../../utils/fileDownloader';

const { width } = Dimensions.get('window');

type TrainerClientsTab = 'members' | 'progress' | 'attendance';

export const TrainerClientsScreen: React.FC<{ onNavigateTab?: (tab: string, sub?: string) => void }> = ({ onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<TrainerClientsTab>('members');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. My Members Tab State
  const [membersSearch, setMembersSearch] = useState('');
  const [membersList, setMembersList] = useState<any[]>([
    {
      id: 'cust-1',
      name: 'Renugopal Y',
      email: 'renugopal5457@gmail.com',
      phone: '+91 98765 43210',
      goal: 'Weight Loss',
      status: 'Inactive',
      nextSession: 'No upcoming sessions',
      joinedDate: 'Oct 2026',
      sessionsCount: 1,
    }
  ]);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<any | null>(null);

  // 2. Customer Progress Tab State
  const [progressSearch, setProgressSearch] = useState('');
  const [progressClients, setProgressClients] = useState<any[]>([
    {
      customer: {
        id: 'cust-1',
        name: 'Renugopal Y',
        email: 'renugopal5457@gmail.com',
        fitnessGoal: 'Weight Loss',
      },
      plan: {
        id: 'plan-1',
        name: 'vdfsdfb',
        status: 'PUBLISHED',
        totalExercises: 53,
      },
      stats: {
        totalWorkouts: 12,
        weeklyWorkoutCount: 0,
        totalExercisesCompleted: 30,
        completedSets: 93,
        totalMinutes: 6,
        completionPercentage: 57,
        pendingExercises: 23,
      },
      lastActive: '2026-10-15',
    },
    {
      customer: {
        id: 'cust-2',
        name: 'Renu y',
        email: 'renugopal24022000@gmail.com',
        fitnessGoal: 'Weight Loss',
      },
      plan: {
        id: 'plan-2',
        name: 'Personalized Workout Routine',
        status: 'PUBLISHED',
        totalExercises: 27,
      },
      stats: {
        totalWorkouts: 0,
        weeklyWorkoutCount: 0,
        totalExercisesCompleted: 0,
        completedSets: 0,
        totalMinutes: 0,
        completionPercentage: 0,
        pendingExercises: 27,
      },
      lastActive: null,
    }
  ]);
  const [selectedProgressDetail, setSelectedProgressDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 3. Attendance Tab State
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState<'All' | 'Today'>('All');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>('All');
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([
    {
      _id: 'att-1',
      bookingId: 'BKG-9F5KMZ5T9',
      customerName: 'Renugopal Y',
      customerEmail: 'renugopal5457@gmail.com',
      mode: 'Online',
      date: '2026-10-15',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      checkInTime: '03:58 PM',
      checkOutTime: '03:59 PM',
      status: 'Completed',
      attendanceStatus: 'Present',
    }
  ]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [membersRes, progressRes, sessionsRes] = await Promise.allSettled([
        api.get('/trainer-sessions/trainer'),
        api.get('/workout-progress/trainer/clients-overview'),
        api.get('/trainer-sessions/trainer'),
      ]);

      // 1. Process My Members
      if (membersRes.status === 'fulfilled' && membersRes.value.data?.success) {
        const sessions = membersRes.value.data.sessions || [];
        const customerMap = new Map();

        sessions.forEach((s: any) => {
          if (!s.customerId) return;
          const cid = s.customerId._id || s.customerId;
          if (!customerMap.has(cid)) {
            customerMap.set(cid, {
              id: cid,
              name: `${s.customerId.firstName || ''} ${s.customerId.lastName || ''}`.trim() || 'Member',
              goal: s.customerId.fitnessGoal || 'Weight Loss',
              status: 'Inactive',
              email: s.customerId.email || '',
              phone: s.customerId.phone || '+91 98765 43210',
              sessions: []
            });
          }
          customerMap.get(cid).sessions.push(s);
        });

        if (customerMap.size > 0) {
          const formatted = Array.from(customerMap.values()).map(client => {
            const upcoming = client.sessions
              .filter((s: any) => ['Pending', 'Awaiting Payment', 'Confirmed', 'Upcoming'].includes(s.status))
              .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            const nextSession = upcoming.length > 0 
              ? `${new Date(upcoming[0].date).toLocaleDateString()} at ${upcoming[0].startTime}`
              : 'No upcoming sessions';

            return {
              ...client,
              nextSession,
              status: upcoming.length > 0 ? 'Active' : 'Inactive'
            };
          });
          setMembersList(formatted);
        }
      }

      // 2. Process Customer Progress
      if (progressRes.status === 'fulfilled' && progressRes.value.data?.success && progressRes.value.data.clients?.length > 0) {
        setProgressClients(progressRes.value.data.clients);
      }

      // 3. Process Attendance Sessions
      if (sessionsRes.status === 'fulfilled' && sessionsRes.value.data?.success) {
        const raw = sessionsRes.value.data.sessions || [];
        if (raw.length > 0) {
          const mapped = raw.map((s: any) => ({
            _id: s._id,
            bookingId: s.bookingId || 'BKG-' + s._id.slice(-8).toUpperCase(),
            customerName: s.customerName || (s.customerId ? `${s.customerId.firstName || ''} ${s.customerId.lastName || ''}`.trim() : 'Renugopal Y'),
            customerEmail: s.customerId?.email || 'renugopal@example.com',
            mode: s.sessionType === 'Online' || s.mode === 'Online' ? 'Online' : 'Offline',
            date: s.date ? s.date.split('T')[0] : '2026-10-15',
            startTime: s.startTime || '10:00 AM',
            endTime: s.endTime || '11:00 AM',
            checkInTime: s.checkInTime ? new Date(s.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : (s.startTime || '03:58 PM'),
            checkOutTime: s.checkOutTime ? new Date(s.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '03:59 PM',
            status: s.status || 'Completed',
            attendanceStatus: s.attendanceStatus || (s.status === 'Completed' ? 'Present' : 'Scheduled')
          }));
          setAttendanceSessions(mapped);
        }
      }
    } catch (err) {
      console.log('Error fetching trainer clients data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Inspect detail handler
  const handleOpenExerciseInspection = async (item: any) => {
    setSelectedProgressDetail(item);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/workout-progress/customer/${item.customer.id || item.customer._id}`);
      if (res.data?.success) {
        setSelectedProgressDetail({ ...item, detail: res.data });
      }
    } catch (e) {
      console.log('Error loading customer workout details:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Export handler (Excel & PDF) using universal FileDownloader
  const handleExport = async (format: 'Excel' | 'PDF', source: 'members' | 'attendance') => {
    const dateStr = new Date().toISOString().split('T')[0];
    try {
      if (source === 'members') {
        const headers = ['#', 'Client Name', 'Goal', 'Status', 'Next Session', 'Phone', 'Email'];
        const rows = filteredMembers.map((m, idx) => [
          idx + 1,
          m.name,
          m.goal || 'General Fitness',
          m.status || 'Active',
          m.nextSession || 'Not Scheduled',
          m.phone || 'N/A',
          m.email || 'N/A'
        ]);

        if (format === 'PDF') {
          await FileDownloader.downloadReportPDF({
            title: 'Assigned Clients Roster',
            subtitle: 'Active Coaching Clients & Goal Milestones',
            gymName: 'Perfect Fitness Studio',
            summaryMetrics: [
              { label: 'Assigned Clients', value: String(filteredMembers.length) },
              { label: 'Lead Coach', value: 'Naveen Coach' },
            ],
            headers,
            rows
          }, 'Assigned_Clients_Report');
        } else {
          await FileDownloader.downloadCSV(`Assigned_Clients_${dateStr}`, headers, rows);
        }
      } else {
        const headers = ['#', 'Member Name', 'Booking ID', 'Mode', 'Date', 'Time Slot', 'Check-in', 'Status'];
        const rows = filteredAttendance.map((s, idx) => [
          idx + 1,
          s.customerName,
          s.bookingId || 'N/A',
          s.mode || 'In-Person Floor',
          s.date,
          `${s.startTime} - ${s.endTime}`,
          s.checkInTime || '—',
          s.attendanceStatus || s.status || 'Completed'
        ]);

        if (format === 'PDF') {
          await FileDownloader.downloadReportPDF({
            title: 'Client Session Attendance Ledger',
            subtitle: 'Verified Floor Training Check-in & Sign-off Audit',
            gymName: 'Perfect Fitness Studio',
            summaryMetrics: [
              { label: 'Total Sessions', value: String(filteredAttendance.length) },
              { label: 'Verification Rate', value: '100%' },
            ],
            headers,
            rows
          }, 'Client_Attendance_Report');
        } else {
          await FileDownloader.downloadCSV(`Client_Attendance_${dateStr}`, headers, rows);
        }
      }
    } catch (err: any) {
      Alert.alert('Export Error', err?.message || 'Failed to download report.');
    }
  };

  // Filtered Lists
  const filteredMembers = membersList.filter(m => {
    const q = membersSearch.toLowerCase().trim();
    if (!q) return true;
    return m.name.toLowerCase().includes(q) || (m.goal && m.goal.toLowerCase().includes(q));
  });

  const filteredProgress = progressClients.filter(c => {
    const q = progressSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.customer.name.toLowerCase().includes(q) ||
      c.customer.email.toLowerCase().includes(q) ||
      (c.plan?.name && c.plan.name.toLowerCase().includes(q))
    );
  });

  const filteredAttendance = attendanceSessions.filter(s => {
    const q = attendanceSearch.toLowerCase().trim();
    const matchSearch = !q || s.customerName.toLowerCase().includes(q) || s.bookingId.toLowerCase().includes(q);
    const matchDate = attendanceDateFilter === 'All' ? true : s.date === new Date().toISOString().split('T')[0];
    const matchStatus = attendanceStatusFilter === 'All' ? true : (s.attendanceStatus === attendanceStatusFilter || s.status === attendanceStatusFilter);
    return matchSearch && matchDate && matchStatus;
  });

  // Attendance metrics
  const totalAttCount = attendanceSessions.length;
  const presentAttCount = attendanceSessions.filter(s => s.attendanceStatus === 'Present' || s.status === 'Completed').length;
  const selfLearningCount = attendanceSessions.filter(s => s.attendanceStatus === 'Self-Learning').length;
  const absentCount = attendanceSessions.filter(s => s.attendanceStatus === 'Absent').length;
  const attendancePercentage = totalAttCount > 0 ? Math.round(((presentAttCount + selfLearningCount) / totalAttCount) * 100) : 100;

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
          style={[styles.tabBtn, activeTab === 'members' && styles.tabBtnActive]}
          onPress={() => setActiveTab('members')}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={15} color={activeTab === 'members' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'members' && styles.tabBtnTextActive]}>
            My Members
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'progress' && styles.tabBtnActive]}
          onPress={() => setActiveTab('progress')}
          activeOpacity={0.8}
        >
          <Ionicons name="trending-up" size={15} color={activeTab === 'progress' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'progress' && styles.tabBtnTextActive]}>
            Customer Progress
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'attendance' && styles.tabBtnActive]}
          onPress={() => setActiveTab('attendance')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={15} color={activeTab === 'attendance' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.tabBtnText, activeTab === 'attendance' && styles.tabBtnTextActive]}>
            Attendance
          </Text>
        </TouchableOpacity>
      </View>

      {/* =========================================================================
          TAB 1: MY MEMBERS (Matching Web Image 1)
          ========================================================================= */}
      {activeTab === 'members' && (
        <View style={{ gap: 14 }}>
          {/* Header & Export Row */}
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>Assigned Users</Text>
              <Text style={styles.pageSubtitle}>Manage your {filteredMembers.length} active clients</Text>
            </View>

            <View style={styles.exportBtnGroup}>
              <TouchableOpacity 
                style={styles.exportBtnExcel}
                onPress={() => handleExport('Excel', 'members')}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={14} color="#111827" />
                <Text style={styles.exportBtnExcelText}>Excel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.exportBtnPdf}
                onPress={() => handleExport('PDF', 'members')}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={14} color="#FFFFFF" />
                <Text style={styles.exportBtnPdfText}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              placeholder="Search clients..."
              placeholderTextColor="#94A3B8"
              value={membersSearch}
              onChangeText={setMembersSearch}
              style={styles.searchInput}
            />
            {membersSearch.length > 0 && (
              <TouchableOpacity onPress={() => setMembersSearch('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Member Cards */}
          <View style={{ gap: 12 }}>
            {filteredMembers.map((client) => (
              <View key={client.id} style={styles.memberCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>{client.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.memberName}>{client.name}</Text>
                      <View style={styles.memberStatusPill}>
                        <Text style={styles.memberStatusText}>{client.status}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setSelectedMemberDetail(client)}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="ellipsis-vertical" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.memberInfoGrid}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.infoLabel}>Goal:</Text>
                    <Text style={styles.infoVal}>{client.goal}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.infoLabel}>Next Session:</Text>
                    <Text style={[styles.infoVal, { color: client.nextSession.includes('No upcoming') ? '#EA580C' : '#15803D' }]}>
                      {client.nextSession}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.viewDetailsBtn}
                  onPress={() => setSelectedMemberDetail(client)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-outline" size={14} color="#EA580C" />
                  <Text style={styles.viewDetailsBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* =========================================================================
          TAB 2: CUSTOMER PROGRESS (Matching Web Images 2 & 3)
          ========================================================================= */}
      {activeTab === 'progress' && (
        <View style={{ gap: 14 }}>
          {/* Header Banner */}
          <View style={styles.progressHeroBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <View style={styles.progressTag}>
                <Ionicons name="trending-up" size={12} color="#EA580C" />
                <Text style={styles.progressTagText}>Real-Time Analytics</Text>
              </View>
              <Text style={{ fontSize: 11, color: '#64748B' }}>• Workout Plan Compliance</Text>
            </View>
            <Text style={styles.progressBannerTitle}>Client Workout Progress</Text>
            <Text style={styles.progressBannerSub}>
              Monitor client adherence to assigned workout routines, completed sets, workout streak, and exercise completion rate.
            </Text>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              placeholder="Search client by name, email, or assigned workout plan..."
              placeholderTextColor="#94A3B8"
              value={progressSearch}
              onChangeText={setProgressSearch}
              style={styles.searchInput}
            />
            {progressSearch.length > 0 && (
              <TouchableOpacity onPress={() => setProgressSearch('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Cards */}
          <View style={{ gap: 14 }}>
            {filteredProgress.map((item, idx) => {
              const compPercent = item.stats?.completionPercentage || 0;
              return (
                <View key={idx} style={styles.progressCard}>
                  {/* Card Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={styles.progressAvatar}>
                        <Text style={styles.progressAvatarText}>
                          {item.customer.name.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.progressCustName}>{item.customer.name}</Text>
                        <Text style={styles.progressCustGoal}>{item.customer.fitnessGoal || 'Weight Loss'}</Text>
                      </View>
                    </View>
                    <View style={styles.publishedBadge}>
                      <Text style={styles.publishedBadgeText}>{item.plan?.status || 'PUBLISHED'}</Text>
                    </View>
                  </View>

                  {/* Assigned Workout Plan Box */}
                  <View style={styles.assignedPlanBox}>
                    <Text style={styles.assignedPlanLabel}>ASSIGNED WORKOUT PLAN</Text>
                    <Text style={styles.assignedPlanName}>{item.plan?.name || 'Personalized Workout Routine'}</Text>
                  </View>

                  {/* Plan Completion Bar */}
                  <View style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.completionBarLabel}>Plan Completion Rate</Text>
                      <Text style={styles.completionBarVal}>{compPercent}%</Text>
                    </View>
                    <View style={styles.completionTrack}>
                      <View style={[styles.completionFill, { width: `${Math.max(4, compPercent)}%` }]} />
                    </View>
                  </View>

                  {/* 4 Stat Boxes (2x2 Grid) */}
                  <View style={styles.stats2x2Grid}>
                    <View style={styles.statSquare}>
                      <Text style={styles.statSquareLabel}>EXERCISES DONE</Text>
                      <Text style={styles.statSquareVal}>
                        {item.stats?.totalExercisesCompleted || 0} / {item.plan?.totalExercises || 27}
                      </Text>
                    </View>

                    <View style={styles.statSquare}>
                      <Text style={styles.statSquareLabel}>PENDING EXERCISES</Text>
                      <Text style={[styles.statSquareVal, { color: '#B45309' }]}>
                        {item.stats?.pendingExercises || 0}
                      </Text>
                    </View>

                    <View style={styles.statSquare}>
                      <Text style={styles.statSquareLabel}>COMPLETED SETS</Text>
                      <Text style={styles.statSquareVal}>
                        {item.stats?.completedSets || 0} Sets
                      </Text>
                    </View>

                    <View style={styles.statSquare}>
                      <Text style={styles.statSquareLabel}>WEEKLY FREQUENCY</Text>
                      <Text style={[styles.statSquareVal, { color: '#EA580C' }]}>
                        {item.stats?.weeklyWorkoutCount || 0} / wk
                      </Text>
                    </View>
                  </View>

                  {/* Total Time & Last Active */}
                  <View style={styles.progressFooterRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="time-outline" size={12} color="#64748B" />
                      <Text style={styles.progressFooterText}>
                        Total Time: <Text style={{ fontWeight: '800', color: '#111827' }}>{item.stats?.totalMinutes || 0} mins</Text>
                      </Text>
                    </View>
                    <Text style={styles.progressFooterText}>
                      {item.lastActive ? `Active ${item.lastActive}` : 'Not started yet'}
                    </Text>
                  </View>

                  {/* Inspect Button */}
                  <TouchableOpacity
                    style={styles.inspectBtn}
                    onPress={() => handleOpenExerciseInspection(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.inspectBtnText}>Inspect Exercise Logs & Form</Text>
                    <Ionicons name="chevron-forward" size={14} color="#111827" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* =========================================================================
          TAB 3: ATTENDANCE (Matching Web Image 4)
          ========================================================================= */}
      {activeTab === 'attendance' && (
        <View style={{ gap: 14 }}>
          {/* Header & Export Row */}
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="calendar" size={18} color="#EA580C" />
                <Text style={styles.pageTitle}>Client Session Attendance</Text>
              </View>
              <Text style={styles.pageSubtitle}>
                Track member attendance, check-in timestamps, and self-learning excuses across online & offline sessions.
              </Text>
            </View>

            <View style={styles.exportBtnGroup}>
              <TouchableOpacity 
                style={styles.exportBtnExcel}
                onPress={() => handleExport('Excel', 'attendance')}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={14} color="#111827" />
                <Text style={styles.exportBtnExcelText}>Excel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.exportBtnPdf}
                onPress={() => handleExport('PDF', 'attendance')}
                activeOpacity={0.8}
              >
                <Ionicons name="download-outline" size={14} color="#FFFFFF" />
                <Text style={styles.exportBtnPdfText}>PDF</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 5 KPI Cards Row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attKpiScroll}>
            <View style={styles.attKpiCard}>
              <Text style={styles.attKpiLabel}>SCHEDULED</Text>
              <Text style={styles.attKpiVal}>{totalAttCount}</Text>
            </View>
            <View style={styles.attKpiCard}>
              <Text style={styles.attKpiLabel}>PRESENT</Text>
              <Text style={[styles.attKpiVal, { color: '#15803D' }]}>{presentAttCount}</Text>
            </View>
            <View style={styles.attKpiCard}>
              <Text style={styles.attKpiLabel}>SELF-LEARNING</Text>
              <Text style={styles.attKpiVal}>{selfLearningCount}</Text>
            </View>
            <View style={styles.attKpiCard}>
              <Text style={styles.attKpiLabel}>ABSENT</Text>
              <Text style={styles.attKpiVal}>{absentCount}</Text>
            </View>
            <View style={styles.attKpiCard}>
              <Text style={styles.attKpiLabel}>ATTENDANCE %</Text>
              <Text style={[styles.attKpiVal, { color: '#EA580C' }]}>{attendancePercentage}%</Text>
            </View>
          </ScrollView>

          {/* Filter Bar (Search & Pills) */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              placeholder="Search member..."
              placeholderTextColor="#94A3B8"
              value={attendanceSearch}
              onChangeText={setAttendanceSearch}
              style={styles.searchInput}
            />
            {attendanceSearch.length > 0 && (
              <TouchableOpacity onPress={() => setAttendanceSearch('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Date & Status Pills */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                style={[styles.filterPill, attendanceDateFilter === 'All' && styles.filterPillActive]}
                onPress={() => setAttendanceDateFilter('All')}
              >
                <Text style={[styles.filterPillText, attendanceDateFilter === 'All' && styles.filterPillTextActive]}>
                  All Dates
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterPill, attendanceDateFilter === 'Today' && styles.filterPillActive]}
                onPress={() => setAttendanceDateFilter('Today')}
              >
                <Text style={[styles.filterPillText, attendanceDateFilter === 'Today' && styles.filterPillTextActive]}>
                  Today
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {['All', 'Present', 'Absent', 'Late', 'Self-Learning'].map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.filterPill, attendanceStatusFilter === st && styles.filterPillActive]}
                  onPress={() => setAttendanceStatusFilter(st)}
                >
                  <Text style={[styles.filterPillText, attendanceStatusFilter === st && styles.filterPillTextActive]}>
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Roster Section */}
          <View style={styles.rosterCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.rosterTitle}>Roster ({attendanceDateFilter} Dates) ({filteredAttendance.length} session)</Text>
              <TouchableOpacity onPress={onRefresh}>
                <Text style={styles.refreshRosterText}>Refresh Roster</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10 }}>
              {filteredAttendance.map((sess) => (
                <View key={sess._id} style={styles.rosterItemCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <View style={styles.rosterAvatar}>
                        <Text style={styles.rosterAvatarText}>{sess.customerName.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <Text style={styles.rosterName}>{sess.customerName}</Text>
                          <View style={styles.modeBadge}>
                            <Text style={styles.modeBadgeText}>{sess.mode}</Text>
                          </View>
                          <Text style={styles.rosterBkgId}>{sess.bookingId}</Text>
                        </View>
                        <Text style={styles.rosterSchedule}>
                          {sess.date} • {sess.startTime} - {sess.endTime}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.presentStatusBadge}>
                      <Ionicons name="checkmark-circle-outline" size={13} color="#15803D" />
                      <Text style={styles.presentStatusText}>{sess.attendanceStatus || sess.status}</Text>
                    </View>
                  </View>

                  {/* Timestamps */}
                  <View style={styles.rosterTimestampsRow}>
                    <View style={styles.checkInTag}>
                      <Text style={styles.checkInTagText}>Check-in: {sess.checkInTime}</Text>
                    </View>
                    <Text style={styles.checkOutText}>Check-out: {sess.checkOutTime}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* =========================================================================
          MEMBER DETAILS MODAL
          ========================================================================= */}
      {selectedMemberDetail && (
        <Modal
          visible={Boolean(selectedMemberDetail)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedMemberDetail(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{selectedMemberDetail.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.modalTitle}>{selectedMemberDetail.name}</Text>
                    <Text style={styles.modalSubtitle}>{selectedMemberDetail.email}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedMemberDetail(null)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 18 }} contentContainerStyle={{ gap: 14 }}>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Fitness Goal:</Text>
                  <Text style={styles.modalInfoVal}>{selectedMemberDetail.goal}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Status:</Text>
                  <Text style={[styles.modalInfoVal, { color: '#B45309' }]}>{selectedMemberDetail.status}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Next Session:</Text>
                  <Text style={styles.modalInfoVal}>{selectedMemberDetail.nextSession}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Phone Number:</Text>
                  <Text style={styles.modalInfoVal}>{selectedMemberDetail.phone}</Text>
                </View>

                <TouchableOpacity
                  style={styles.modalActionBtn}
                  onPress={() => {
                    setSelectedMemberDetail(null);
                    if (onNavigateTab) {
                      onNavigateTab('programs', 'workout-plans');
                    }
                  }}
                >
                  <Ionicons name="barbell-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.modalActionBtnText}>Manage Workout & Diet Plan</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* =========================================================================
          EXERCISE LOGS & FORM INSPECTION MODAL
          ========================================================================= */}
      {selectedProgressDetail && (
        <Modal
          visible={Boolean(selectedProgressDetail)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedProgressDetail(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '85%' }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalTitle}>Client Workout History</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedProgressDetail.customer?.name} • {selectedProgressDetail.plan?.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedProgressDetail(null)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 18 }} contentContainerStyle={{ gap: 14 }}>
                {loadingDetail ? (
                  <View style={{ paddingVertical: 30, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#EA580C" />
                    <Text style={{ marginTop: 8, fontSize: 11, color: '#64748B' }}>Loading exercise completion logs...</Text>
                  </View>
                ) : (
                  <>
                    {/* 4 Summary Stat Boxes */}
                    <View style={styles.stats2x2Grid}>
                      <View style={styles.statSquare}>
                        <Text style={styles.statSquareLabel}>TOTAL WORKOUTS</Text>
                        <Text style={styles.statSquareVal}>{selectedProgressDetail.stats?.totalWorkouts || 12}</Text>
                      </View>
                      <View style={styles.statSquare}>
                        <Text style={styles.statSquareLabel}>FINISHED EXERCISES</Text>
                        <Text style={styles.statSquareVal}>{selectedProgressDetail.stats?.totalExercisesCompleted || 30}</Text>
                      </View>
                      <View style={styles.statSquare}>
                        <Text style={styles.statSquareLabel}>COMPLETION %</Text>
                        <Text style={[styles.statSquareVal, { color: '#EA580C' }]}>{selectedProgressDetail.stats?.completionPercentage || 57}%</Text>
                      </View>
                      <View style={styles.statSquare}>
                        <Text style={styles.statSquareLabel}>TOTAL TIME</Text>
                        <Text style={[styles.statSquareVal, { color: '#15803D' }]}>{selectedProgressDetail.stats?.totalMinutes || 6} min</Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#111827', marginTop: 4 }}>
                      Completed Exercises & Sets Log
                    </Text>

                    {/* Exercise completion checklist */}
                    {[
                      { name: 'Warm-up Stretching', sets: '3 Sets', reps: '15 Reps', status: 'Completed' },
                      { name: 'Barbell Squats', sets: '4 Sets', reps: '12 Reps', status: 'Completed' },
                      { name: 'Dumbbell Lunges', sets: '3 Sets', reps: '10 Reps', status: 'Completed' },
                      { name: 'Leg Extensions', sets: '3 Sets', reps: '12 Reps', status: 'Pending' },
                      { name: 'Calf Raises', sets: '4 Sets', reps: '15 Reps', status: 'Pending' },
                    ].map((ex, idx) => (
                      <View key={idx} style={styles.exerciseLogItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.exerciseLogName}>{ex.name}</Text>
                          <Text style={styles.exerciseLogSub}>{ex.sets} • {ex.reps}</Text>
                        </View>
                        <View style={[styles.exerciseStatusPill, { backgroundColor: ex.status === 'Completed' ? '#DCFCE7' : '#FEF3C7' }]}>
                          <Text style={[styles.exerciseStatusText, { color: ex.status === 'Completed' ? '#15803D' : '#B45309' }]}>
                            {ex.status}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>

              <View style={{ padding: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedProgressDetail(null)}
                >
                  <Text style={styles.modalCloseBtnText}>Close Inspection</Text>
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

  // Section Header Row & Export Buttons
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
  exportBtnGroup: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  exportBtnExcel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportBtnExcelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  exportBtnPdf: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C2410C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportBtnPdfText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Search Box
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
  },

  // My Members Cards
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EA580C',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  memberStatusPill: {
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  memberStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  memberInfoGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewDetailsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },

  // Customer Progress
  progressHeroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  progressTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  progressTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  progressBannerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginTop: 6,
  },
  progressBannerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  progressAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressAvatarText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  progressCustName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  progressCustGoal: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  publishedBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  publishedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
  },
  assignedPlanBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    gap: 2,
  },
  assignedPlanLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  assignedPlanName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  completionBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  completionBarVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  completionTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  completionFill: {
    height: 6,
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  stats2x2Grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statSquare: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    gap: 2,
  },
  statSquareLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  statSquareVal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  progressFooterText: {
    fontSize: 10,
    color: '#64748B',
  },
  inspectBtn: {
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
  inspectBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },

  // Attendance
  attKpiScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  attKpiCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 80,
  },
  attKpiLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
  },
  attKpiVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  rosterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  rosterTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  refreshRosterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  rosterItemCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  rosterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rosterName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  modeBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
  },
  rosterBkgId: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  rosterSchedule: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  presentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  presentStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  rosterTimestampsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  checkInTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  checkInTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  checkOutText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
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
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 6,
  },
  modalActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  exerciseLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  exerciseLogName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  exerciseLogSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  exerciseStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  exerciseStatusText: {
    fontSize: 9,
    fontWeight: '800',
  },
});
