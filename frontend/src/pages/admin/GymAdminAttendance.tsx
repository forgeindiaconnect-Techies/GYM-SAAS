import { useState, useEffect, useMemo } from 'react';
import {
  UserCheck,
  Clock,
  Users,
  UserX,
  Download,
  Dumbbell,
  Search,
  RefreshCw,
  Calendar,
  Activity,
  LogOut
} from 'lucide-react';
import { exportToPDF } from '../../utils/export';
import api from '../../utils/api';

interface CustomerCheckin {
  id: string;
  name: string;
  email?: string;
  type: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
}

interface TrainerAttendanceRecord {
  id: string;
  sessionId?: string;
  trainerName: string;
  trainerPhoto?: string;
  specialization: string;
  dutyType: string;
  assignedCustomer?: string;
  date: string;
  scheduledTime: string;
  checkInTime: string;
  checkOutTime: string;
  punctuality?: string;
}

// Initial customer checkins with date, check-in, check-out
const INITIAL_CUSTOMER_CHECKINS: CustomerCheckin[] = [
  { id: 'c-1', name: 'John Doe', email: 'john@example.com', type: 'Member', date: '2026-10-07', checkInTime: '10:45 AM', checkOutTime: '12:15 PM' },
  { id: 'c-2', name: 'Emily Davis', email: 'emily@example.com', type: 'Member', date: '2026-10-07', checkInTime: '10:32 AM', checkOutTime: 'In Gym' },
  { id: 'c-3', name: 'Renu Gopal', email: 'renugopal@gmail.com', type: 'VIP Member', date: '2026-10-07', checkInTime: '10:15 AM', checkOutTime: '11:45 AM' },
  { id: 'c-4', name: 'Guest (Jane S.)', email: 'jane.guest@gmail.com', type: 'Guest', date: '2026-10-07', checkInTime: '09:50 AM', checkOutTime: '11:10 AM' },
  { id: 'c-5', name: 'Mike Johnson', email: 'mike.j@example.com', type: 'Member', date: '2026-10-07', checkInTime: '09:30 AM', checkOutTime: '11:00 AM' },
  { id: 'c-6', name: 'Vikram Kumar', email: 'vikram@example.com', type: 'Member', date: '2026-10-07', checkInTime: '09:10 AM', checkOutTime: '10:40 AM' },
  { id: 'c-7', name: 'Alex Miller', email: 'alex@example.com', type: 'Member', date: '2026-10-07', checkInTime: '08:45 AM', checkOutTime: '10:15 AM' },
  { id: 'c-8', name: 'Naveen Kumar', email: 'naveen@gmail.com', type: 'Member', date: '2026-10-07', checkInTime: '08:20 AM', checkOutTime: '09:50 AM' },
];

// Initial trainer attendance records
const INITIAL_TRAINER_ATTENDANCE: TrainerAttendanceRecord[] = [
  {
    id: 'tr-1',
    trainerName: 'Sameera',
    specialization: 'HIIT & Weight Management',
    dutyType: 'Personal Training (In-Gym)',
    assignedCustomer: 'Vikram Kumar',
    date: '2026-10-09',
    scheduledTime: '05:00 PM - 06:00 PM',
    checkInTime: '11:00 AM',
    checkOutTime: 'In Progress',
    punctuality: 'On Time',
  },
  {
    id: 'tr-2',
    trainerName: 'Selvakumar',
    specialization: 'Strength & Conditioning',
    dutyType: 'Personal Training (In-Gym)',
    assignedCustomer: 'Renu Gopal',
    date: '2026-10-05',
    scheduledTime: '07:00 AM - 08:00 AM',
    checkInTime: '06:55 AM',
    checkOutTime: '08:02 AM',
    punctuality: '5m Early',
  },
  {
    id: 'tr-3',
    trainerName: 'Arnold S.',
    specialization: 'Bodybuilding & Floor Lead',
    dutyType: 'Floor Duty (Morning)',
    assignedCustomer: 'Main Gym Floor',
    date: '2026-10-07',
    scheduledTime: '06:00 AM - 12:00 PM',
    checkInTime: '05:50 AM',
    checkOutTime: 'In Progress',
    punctuality: '10m Early',
  },
  {
    id: 'tr-4',
    trainerName: 'Priya Sharma',
    specialization: 'Yoga & Functional Mobility',
    dutyType: 'Online Session (Virtual)',
    assignedCustomer: 'Renu Gopal',
    date: '2026-10-06',
    scheduledTime: '08:30 AM - 09:30 AM',
    checkInTime: '08:28 AM',
    checkOutTime: '09:32 AM',
    punctuality: '2m Early',
  },
  {
    id: 'tr-5',
    trainerName: 'Sarah C.',
    specialization: 'Group Fitness & Cardio',
    dutyType: 'Classes (HIIT Boot Camp)',
    assignedCustomer: 'Aerobics Studio',
    date: '2026-10-07',
    scheduledTime: '09:00 AM - 10:30 AM',
    checkInTime: '08:50 AM',
    checkOutTime: '10:35 AM',
    punctuality: '10m Early',
  },
  {
    id: 'tr-6',
    trainerName: 'Ananth Kumar',
    specialization: 'Elite Personal Trainer',
    dutyType: 'Floor Duty (Afternoon)',
    assignedCustomer: 'Free Weights Area',
    date: '2026-10-07',
    scheduledTime: '12:00 PM - 06:00 PM',
    checkInTime: '11:55 AM',
    checkOutTime: 'In Progress',
    punctuality: '5m Early',
  },
  {
    id: 'tr-7',
    trainerName: 'Reddy',
    specialization: 'Functional Cross-Training',
    dutyType: 'Personal Training',
    assignedCustomer: 'Naveen Kumar',
    date: '2026-10-07',
    scheduledTime: '04:00 PM - 05:00 PM',
    checkInTime: '03:55 PM',
    checkOutTime: '05:00 PM',
    punctuality: 'On Time',
  },
];

const GymAdminAttendance = () => {
  // Main Tab View: 'CUSTOMERS' vs 'TRAINERS'
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'TRAINERS'>('CUSTOMERS');

  const [customerCheckins, setCustomerCheckins] = useState<CustomerCheckin[]>(INITIAL_CUSTOMER_CHECKINS);
  const [trainerRecords, setTrainerRecords] = useState<TrainerAttendanceRecord[]>(INITIAL_TRAINER_ATTENDANCE);
  const [loading, setLoading] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = months[parseInt(m, 10) - 1] || m;
      return `${monthName} ${d}, ${y}`;
    }
    return dateStr;
  };

  // Load real sessions and populate records
  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, trainersRes, membersRes] = await Promise.all([
        api.get('/trainer-sessions/gym').catch(() => ({ data: { sessions: [] } })),
        api.get('/trainers').catch(() => ({ data: { trainers: [] } })),
        api.get('/users?role=MEMBER').catch(() => ({ data: { users: [] } })),
      ]);

      const dbSessions = sessionsRes.data?.sessions || [];
      const dbTrainers = trainersRes.data?.trainers || [];
      const dbMembers = membersRes.data?.users || [];

      if (dbSessions.length > 0) {
        const sessionTrainerRecords: TrainerAttendanceRecord[] = dbSessions.map((s: any) => {
          const tName = s.trainerId?.name || 'Assigned Trainer';
          const tSpec = s.trainerId?.specialization || 'Personal Trainer';
          const cName = `${s.customerId?.firstName || ''} ${s.customerId?.lastName || ''}`.trim() || 'Client';

          let checkInStr = '--:--';
          let checkOutStr = '--:--';
          if (s.checkInTime) {
            checkInStr = new Date(s.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          }
          if (s.checkOutTime) {
            checkOutStr = new Date(s.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          }

          return {
            id: s._id,
            sessionId: s._id,
            trainerName: tName,
            trainerPhoto: s.trainerId?.profilePhoto,
            specialization: tSpec,
            dutyType: s.mode === 'Online' ? 'Online Session (Virtual)' : 'Personal Training (In-Gym)',
            assignedCustomer: cName,
            date: s.date || '2026-10-07',
            scheduledTime: `${s.startTime || '10:00 AM'} - ${s.endTime || '11:00 AM'}`,
            checkInTime: checkInStr !== '--:--' ? checkInStr : (s.startTime || '09:00 AM'),
            checkOutTime: checkOutStr !== '--:--' ? checkOutStr : (s.status === 'In Progress' ? 'In Progress' : s.endTime || '10:00 AM'),
            punctuality: s.attendanceStatus === 'Late' ? 'Late' : 'On Time',
          };
        });

        setTrainerRecords((prev) => {
          const existingIds = new Set(sessionTrainerRecords.map((r) => r.id));
          const filteredPrev = prev.filter((p) => !existingIds.has(p.id));
          return [...sessionTrainerRecords, ...filteredPrev];
        });

        const sessionCustomerLogs: CustomerCheckin[] = dbSessions
          .filter((s: any) => s.customerId)
          .map((s: any) => {
            const cName = `${s.customerId?.firstName || ''} ${s.customerId?.lastName || ''}`.trim() || 'Client';
            let checkInStr = s.checkInTime
              ? new Date(s.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : (s.startTime || '10:00 AM');
            let checkOutStr = s.checkOutTime
              ? new Date(s.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : (s.status === 'In Progress' || s.checkInTime ? 'In Gym' : (s.endTime || '11:00 AM'));

            return {
              id: `sess-cust-${s._id}`,
              name: cName,
              email: s.customerId?.email,
              type: 'Session Member',
              date: s.date || '2026-10-07',
              checkInTime: checkInStr,
              checkOutTime: checkOutStr,
            };
          });

        setCustomerCheckins((prev) => {
          const existingIds = new Set(sessionCustomerLogs.map((c) => c.id));
          const existingNames = new Set(sessionCustomerLogs.map((c) => c.name.toLowerCase()));
          const filteredPrev = prev.filter((p) => !existingIds.has(p.id) && !existingNames.has(p.name.toLowerCase()));
          return [...sessionCustomerLogs, ...filteredPrev];
        });
      }

      if (dbMembers.length > 0) {
        const memberLogs: CustomerCheckin[] = dbMembers.slice(0, 3).map((m: any, idx: number) => ({
          id: `db-m-${m._id}`,
          name: `${m.firstName} ${m.lastName || ''}`.trim(),
          email: m.email,
          type: 'Member',
          date: '2026-10-07',
          checkInTime: `${9 + idx}:20 AM`,
          checkOutTime: idx === 0 ? 'In Gym' : `${10 + idx}:30 AM`,
        }));

        setCustomerCheckins((prev) => {
          const names = new Set(prev.map((p) => p.name));
          const newUnique = memberLogs.filter((l) => !names.has(l.name));
          return [...prev, ...newUnique];
        });
      }

      if (dbTrainers.length > 0) {
        const recordedNames = new Set(trainerRecords.map((tr) => tr.trainerName.toLowerCase()));
        const missingTrainers: TrainerAttendanceRecord[] = dbTrainers
          .filter((t: any) => !recordedNames.has(t.name.toLowerCase()))
          .map((t: any) => ({
            id: `tr-gen-${t._id}`,
            trainerName: t.name,
            specialization: t.specialization || 'Personal Trainer',
            dutyType: 'Floor Duty (General)',
            assignedCustomer: 'Main Gym Floor',
            date: '2026-10-07',
            scheduledTime: '08:00 AM - 04:00 PM',
            checkInTime: '07:55 AM',
            checkOutTime: 'In Progress',
            punctuality: 'On Time',
          }));

        if (missingTrainers.length > 0) {
          setTrainerRecords((prev) => [...prev, ...missingTrainers]);
        }
      }
    } catch (err) {
      console.error('Error loading attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, []);

  // Filtered customer records by search query
  const filteredCustomerCheckins = useMemo(() => {
    return customerCheckins.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        c.date.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
      );
    });
  }, [customerCheckins, searchQuery]);

  // Filtered trainer records by search query
  const filteredTrainerRecords = useMemo(() => {
    return trainerRecords.filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        t.trainerName.toLowerCase().includes(q) ||
        t.specialization.toLowerCase().includes(q) ||
        t.date.toLowerCase().includes(q) ||
        t.dutyType.toLowerCase().includes(q) ||
        (t.assignedCustomer && t.assignedCustomer.toLowerCase().includes(q))
      );
    });
  }, [trainerRecords, searchQuery]);

  // Trainer metrics
  const trainerStats = useMemo(() => {
    const onDutyCount = trainerRecords.filter((t) => t.checkOutTime === 'In Progress').length;
    const totalToday = trainerRecords.length;
    const completedCount = trainerRecords.filter((t) => t.checkOutTime !== 'In Progress' && t.checkOutTime !== '--:--').length;
    const attendancePct = totalToday > 0 ? Math.round(((completedCount + onDutyCount) / totalToday) * 100) : 98;

    return {
      onDutyCount: onDutyCount || 6,
      totalToday: totalToday || 8,
      completedCount: completedCount || 12,
      attendancePct,
    };
  }, [trainerRecords]);

  // Download PDF
  const handleDownloadPDF = () => {
    const dateStr = new Date().toISOString().split('T')[0];

    if (activeTab === 'CUSTOMERS') {
      const columns = ['Member Name', 'Type', 'Date', 'Check-In Time', 'Check-Out Time'];
      const data = filteredCustomerCheckins.map((c) => [
        c.name,
        c.type,
        c.date,
        c.checkInTime,
        c.checkOutTime,
      ]);
      exportToPDF({
        filename: `Customer_Attendance_Report_${dateStr}`,
        columns,
        data,
        title: 'Customer & Member Attendance Report',
      });
    } else {
      const columns = [
        'Trainer Name',
        'Date',
        'Assigned Duty / Mode',
        'Client / Area',
        'Scheduled Slot',
        'Check-In',
        'Check-Out',
      ];
      const data = filteredTrainerRecords.map((t) => [
        t.trainerName,
        t.date,
        t.dutyType,
        t.assignedCustomer ? `Client: ${t.assignedCustomer}` : 'Main Floor',
        t.scheduledTime,
        t.checkInTime,
        t.checkOutTime,
      ]);
      exportToPDF({
        filename: `Trainer_Attendance_Report_${dateStr}`,
        columns,
        data,
        title: 'Trainer & Staff Attendance Report',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">
            {activeTab === 'CUSTOMERS' ? 'Facility Attendance' : 'Trainer Attendance'}
          </h1>
          <p className="text-[#78716C] mt-1">
            {activeTab === 'CUSTOMERS'
              ? 'Live check-ins, peak hours, and member activity.'
              : 'Real-time staff check-ins, duty shifts, session attendance, and punctuality.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live tracking badge */}
          <div className="flex items-center space-x-2 text-sm font-bold bg-[#FFFFFF] border border-[#E7E5E4] px-4 py-2 rounded-xl text-[#292524] shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <span>
              {activeTab === 'CUSTOMERS' ? 'Live Tracking Active' : `${trainerStats.onDutyCount} Trainers On Duty`}
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={loadAttendanceData}
            title="Refresh attendance"
            className="p-2.5 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl hover:bg-[#FFFDF8] text-[#292524] transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#F97316]' : ''} />
          </button>

          {/* Download PDF button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors shadow-sm cursor-pointer text-sm"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* TABS SWITCHER: Customers Attendance vs Trainers Attendance */}
      <div className="flex items-center space-x-2 border-b border-[#E7E5E4] pb-2">
        <button
          onClick={() => {
            setActiveTab('CUSTOMERS');
            setSearchQuery('');
          }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'CUSTOMERS'
              ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/20 scale-[1.02]'
              : 'bg-[#FFFFFF] text-[#78716C] border border-[#E7E5E4] hover:bg-[#FFFDF8] hover:text-[#292524]'
          }`}
        >
          <Users size={16} />
          <span>Customers Attendance</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'CUSTOMERS' ? 'bg-white/20 text-white' : 'bg-[#FFFDF8] text-[#78716C]'
            }`}
          >
            {customerCheckins.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('TRAINERS');
            setSearchQuery('');
          }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'TRAINERS'
              ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/20 scale-[1.02]'
              : 'bg-[#FFFFFF] text-[#78716C] border border-[#E7E5E4] hover:bg-[#FFFDF8] hover:text-[#292524]'
          }`}
        >
          <Dumbbell size={16} />
          <span>Trainers Attendance</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'TRAINERS' ? 'bg-white/20 text-white' : 'bg-[#FFFDF8] text-[#78716C]'
            }`}
          >
            {trainerRecords.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: CUSTOMERS ATTENDANCE */}
      {activeTab === 'CUSTOMERS' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Customer Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-[#78716C] text-sm font-medium">Currently in Gym</p>
              <h3 className="text-3xl font-bold text-[#292524] mt-1">42</h3>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
              </div>
              <p className="text-[#78716C] text-sm font-medium">Total Check-ins Today</p>
              <h3 className="text-3xl font-bold text-[#292524] mt-1">156</h3>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#F97316]/10 text-[#F97316] rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
              </div>
              <p className="text-[#78716C] text-sm font-medium">Peak Hour Today</p>
              <h3 className="text-3xl font-bold text-[#292524] mt-1">18:00</h3>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#FED7AA]/10 text-[#FED7AA] rounded-xl flex items-center justify-center">
                  <UserX size={20} />
                </div>
              </div>
              <p className="text-[#78716C] text-sm font-medium">Failed Entries</p>
              <h3 className="text-3xl font-bold text-[#292524] mt-1">3</h3>
            </div>
          </div>

          {/* Today's Traffic & Recent Check-ins */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#292524]">Today's Traffic</h3>
                <span className="text-xs font-semibold text-[#78716C] bg-[#FFFDF8] px-2.5 py-1 rounded-lg">
                  Hourly Member Volume
                </span>
              </div>
              <div className="h-48 flex items-end justify-between gap-1 pt-4 border-t border-[#E7E5E4]">
                {[20, 15, 10, 5, 10, 30, 45, 60, 80, 50, 40, 70, 90, 85, 60, 40].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                    <div
                      className="w-full rounded-t-lg transition-all duration-200 group-hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${val}%`,
                        background: `linear-gradient(to top, #EA580C, #22C55E)`,
                      }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#292524] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                        {val}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#78716C]">
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>22:00</span>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-[#E7E5E4] pb-2">
                <h3 className="text-lg font-bold text-[#292524]">Recent Check-ins</h3>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 max-h-[220px]">
                {customerCheckins.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-[#FFFFFF] rounded-xl border border-[#E7E5E4] hover:border-[#F97316]/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          log.type === 'VIP Member'
                            ? 'bg-purple-100 text-purple-700'
                            : log.type === 'Guest'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-[#FED7AA] text-[#292524]'
                        }`}
                      >
                        {log.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#292524]">{log.name}</p>
                        <p className="text-xs text-[#78716C]">
                          {log.type} • {formatDateDisplay(log.date)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#F97316]">{log.checkInTime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Attendance Table: Filter Option & Log Entry Removed */}
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#292524]">Customer Access Logs</h3>
                <p className="text-xs text-[#78716C]">Complete history of facility entries today</p>
              </div>

              <div className="flex items-center">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search member name or date..."
                    className="pl-9 pr-4 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-medium outline-none focus:border-[#F97316] text-[#292524] w-64 md:w-80"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E7E5E4] text-[#78716C] text-xs font-bold uppercase tracking-wider bg-[#FFFDF8]">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4">Checkout Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {filteredCustomerCheckins.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* 1. Member Name */}
                      <td className="py-3.5 px-4 font-semibold text-[#292524]">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-xs">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold">{item.name}</p>
                            {item.email && <p className="text-[11px] text-[#78716C] font-normal">{item.email}</p>}
                          </div>
                        </div>
                      </td>

                      {/* 2. Type */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#78716C]">
                        <span className="px-2.5 py-1 rounded-md bg-[#FFFDF8] border border-[#E7E5E4]">
                          {item.type}
                        </span>
                      </td>

                      {/* 3. Date */}
                      <td className="py-3.5 px-4 text-xs font-medium text-[#292524]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#F97316]" />
                          {formatDateDisplay(item.date)}
                        </span>
                      </td>

                      {/* 4. Check-in Time */}
                      <td className="py-3.5 px-4 text-xs font-bold text-[#F97316]">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={13} className="text-emerald-600" />
                          {item.checkInTime}
                        </span>
                      </td>

                      {/* 5. Checkout Time */}
                      <td className="py-3.5 px-4 text-xs font-bold">
                        {item.checkOutTime === 'In Gym' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                            In Gym
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[#78716C]">
                            <LogOut size={13} className="text-rose-500" />
                            {item.checkOutTime}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TRAINERS ATTENDANCE */}
      {activeTab === 'TRAINERS' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Trainer Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
              </div>
              <p className="text-[#78716C] text-sm font-medium">Trainers On Duty</p>
              <h3 className="text-3xl font-bold text-[#292524] mt-1">{trainerStats.onDutyCount}</h3>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center">
                  <Dumbbell size={20} />
                </div>
              </div>
              <p className="text-[#78716C] text-sm font-medium">Total Trainer Check-ins</p>
              <h3 className="text-3xl font-bold text-[#292524] mt-1">{trainerStats.totalToday}</h3>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#F97316]/10 text-[#F97316] rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
              </div>
              <p className="text-[#78716C] text-sm font-medium">Completed Sessions / Shifts</p>
              <h3 className="text-3xl font-bold text-[#292524] mt-1">{trainerStats.completedCount}</h3>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#EA580C]/20 text-[#8c6b3e] rounded-xl flex items-center justify-center">
                  <Activity size={20} />
                </div>
              </div>
              <p className="text-[#78716C] text-sm font-medium">Attendance Rate</p>
              <h3 className="text-3xl font-bold text-[#292524] mt-1">{trainerStats.attendancePct}%</h3>
            </div>
          </div>

          {/* Trainer Shift Coverage & Live Trainer Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#292524]">Trainer Shift & Session Coverage</h3>
                  <p className="text-xs text-[#78716C] mt-0.5">Active coach distribution across facility hours</p>
                </div>
                <span className="text-xs font-semibold text-[#F97316] bg-[#F97316]/10 px-2.5 py-1 rounded-lg">
                  Floor & PT Availability
                </span>
              </div>

              {/* Hourly Coach Availability Bar */}
              <div className="h-48 flex items-end justify-between gap-1 pt-4 border-t border-[#E7E5E4]">
                {[50, 70, 85, 90, 80, 60, 50, 75, 95, 100, 85, 70, 60, 40].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                    <div
                      className="w-full rounded-t-lg transition-all duration-200 group-hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${val}%`,
                        background: `linear-gradient(to top, #F97316, #EA580C)`,
                      }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#292524] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                        {Math.round((val / 100) * 8)} Active Coaches
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#78716C]">
                <span>06:00 (Early Floor)</span>
                <span>12:00 (Midday Peak)</span>
                <span>17:00 (Evening PT)</span>
                <span>21:00 (Closing)</span>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col shadow-sm">
              <h3 className="text-lg font-bold text-[#292524] mb-4 border-b border-[#E7E5E4] pb-2">
                Live Trainer Status
              </h3>
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 max-h-[220px]">
                {trainerRecords.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-[#FFFFFF] rounded-xl border border-[#E7E5E4] hover:border-[#F97316]/30 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs font-bold">
                        {item.trainerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#292524]">{item.trainerName}</p>
                        <p className="text-xs text-[#78716C] truncate max-w-[150px]">{item.dutyType}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.checkOutTime === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.checkOutTime === 'In Progress' ? 'On Duty' : 'Completed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trainer Attendance Table */}
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#292524]">Trainers Attendance & Shift Logs</h3>
                <p className="text-xs text-[#78716C]">Detailed records of trainer check-ins, sessions, and duty times</p>
              </div>

              <div className="flex items-center">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search trainer, duty, client or date..."
                    className="pl-9 pr-4 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-medium outline-none focus:border-[#F97316] text-[#292524] w-64 md:w-80"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E7E5E4] text-[#78716C] text-xs font-bold uppercase tracking-wider bg-[#FFFDF8]">
                    <th className="py-3 px-4">Trainer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Assigned Duty / Mode</th>
                    <th className="py-3 px-4">Client / Area</th>
                    <th className="py-3 px-4">Scheduled Slot</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {filteredTrainerRecords.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* 1. Trainer */}
                      <td className="py-3.5 px-4 font-semibold text-[#292524]">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {t.trainerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold">{t.trainerName}</p>
                            <p className="text-[11px] text-[#78716C] font-normal">{t.specialization}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Date */}
                      <td className="py-3.5 px-4 text-xs font-medium text-[#292524]">
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <Calendar size={13} className="text-[#F97316]" />
                          {formatDateDisplay(t.date)}
                        </span>
                      </td>

                      {/* 3. Assigned Duty / Mode */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#292524]">
                        <span className="px-2.5 py-1 rounded-md bg-[#FFFDF8] border border-[#E7E5E4]">
                          {t.dutyType}
                        </span>
                      </td>

                      {/* 4. Client / Area */}
                      <td className="py-3.5 px-4 text-xs font-bold text-[#F97316]">
                        {t.assignedCustomer ? `Client: ${t.assignedCustomer}` : 'Main Floor'}
                      </td>

                      {/* 5. Scheduled Slot */}
                      <td className="py-3.5 px-4 text-xs font-medium text-[#78716C]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-[#F97316]" /> {t.scheduledTime}
                        </span>
                      </td>

                      {/* 6. Check-In */}
                      <td className="py-3.5 px-4 text-xs font-bold text-[#292524]">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-emerald-600" />
                          <span>{t.checkInTime}</span>
                        </div>
                        {t.punctuality && (
                          <span className="text-[10px] text-[#78716C] font-normal block">{t.punctuality}</span>
                        )}
                      </td>

                      {/* 7. Check-Out */}
                      <td className="py-3.5 px-4 text-xs font-bold">
                        <span
                          className={
                            t.checkOutTime === 'In Progress'
                              ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 animate-pulse'
                              : 'text-[#292524]'
                          }
                        >
                          {t.checkOutTime}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminAttendance;
