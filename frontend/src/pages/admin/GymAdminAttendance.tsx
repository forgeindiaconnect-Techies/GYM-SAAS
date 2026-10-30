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
  LogOut,
  Eye,
  X,
  ChevronDown
} from 'lucide-react';
import { exportToPDF } from '../../utils/export';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

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

type Timeframe = 'perday' | 'weekly' | 'monthly' | 'annual';

const TIMEFRAME_OPTIONS: { id: Timeframe; label: string }[] = [
  { id: 'perday', label: 'Per Day' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'annual', label: 'Annual' },
];

const DEFAULT_CUSTOMER_LOGS: CustomerCheckin[] = [
  { id: 'cust-1', name: 'Renugopal Y', email: 'renugopal@example.com', type: 'Session Member', date: '2026-10-26', checkInTime: '03:58 PM', checkOutTime: 'In Gym' },
  { id: 'cust-2', name: 'Vikram Patel', email: 'vikram.p@example.com', type: 'VIP Member', date: '2026-10-26', checkInTime: '02:30 PM', checkOutTime: '04:15 PM' },
  { id: 'cust-3', name: 'Sneha Reddy', email: 'sneha.r@example.com', type: 'Monthly Member', date: '2026-10-26', checkInTime: '01:15 PM', checkOutTime: '02:45 PM' },
  { id: 'cust-4', name: 'Priya Sharma', email: 'priya.s@example.com', type: 'Session Member', date: '2026-10-26', checkInTime: '11:30 AM', checkOutTime: '12:45 PM' },
  { id: 'cust-5', name: 'Amit Kumar', email: 'amit.k@example.com', type: 'Regular Member', date: '2026-10-25', checkInTime: '06:10 PM', checkOutTime: '07:30 PM' },
  { id: 'cust-6', name: 'Ananya Iyer', email: 'ananya.i@example.com', type: 'VIP Member', date: '2026-10-24', checkInTime: '07:00 AM', checkOutTime: '08:30 AM' },
  { id: 'cust-7', name: 'Rahul Verma', email: 'rahul.v@example.com', type: 'Monthly Member', date: '2026-10-23', checkInTime: '05:45 PM', checkOutTime: '07:15 PM' },
  { id: 'cust-8', name: 'Rohit Joshi', email: 'rohit.j@example.com', type: 'Guest Pass', date: '2026-10-22', checkInTime: '04:00 PM', checkOutTime: '05:30 PM' },
  { id: 'cust-9', name: 'Meera Nambiar', email: 'meera.n@example.com', type: 'Session Member', date: '2026-10-15', checkInTime: '09:15 AM', checkOutTime: '10:30 AM' },
  { id: 'cust-10', name: 'Karthik Sundaram', email: 'karthik.s@example.com', type: 'VIP Member', date: '2026-10-08', checkInTime: '06:30 AM', checkOutTime: '08:00 AM' },
  { id: 'cust-11', name: 'Deepa Nair', email: 'deepa.n@example.com', type: 'Monthly Member', date: '2026-09-28', checkInTime: '05:00 PM', checkOutTime: '06:30 PM' },
  { id: 'cust-12', name: 'Sanjay Rao', email: 'sanjay.r@example.com', type: 'Session Member', date: '2026-08-14', checkInTime: '07:30 PM', checkOutTime: '09:00 PM' },
];

const DEFAULT_TRAINER_RECORDS: TrainerAttendanceRecord[] = [
  { id: 'tr-1', trainerName: 'Rajesh Khanna', specialization: 'Strength & Conditioning', dutyType: 'Personal Training (In-Gym)', assignedCustomer: 'Renugopal Y', date: '2026-10-26', scheduledTime: '03:00 PM - 04:00 PM', checkInTime: '02:55 PM', checkOutTime: 'In Progress', punctuality: 'On Time' },
  { id: 'tr-2', trainerName: 'Kavita Menon', specialization: 'Yoga & Flexibility', dutyType: 'Floor Shift (Morning)', assignedCustomer: 'Main Floor', date: '2026-10-26', scheduledTime: '06:00 AM - 12:00 PM', checkInTime: '05:50 AM', checkOutTime: '12:05 PM', punctuality: 'On Time' },
  { id: 'tr-3', trainerName: 'Arjun Nair', specialization: 'CrossFit & HIIT', dutyType: 'Online Session (Virtual)', assignedCustomer: 'Priya Sharma', date: '2026-10-26', scheduledTime: '11:00 AM - 12:00 PM', checkInTime: '10:58 AM', checkOutTime: '12:02 PM', punctuality: 'On Time' },
  { id: 'tr-4', trainerName: 'Sunita Rao', specialization: 'Nutrition & PT', dutyType: 'Personal Training (In-Gym)', assignedCustomer: 'Vikram Patel', date: '2026-10-25', scheduledTime: '02:00 PM - 03:00 PM', checkInTime: '01:55 PM', checkOutTime: '03:05 PM', punctuality: 'On Time' },
  { id: 'tr-5', trainerName: 'Devendra Singh', specialization: 'Bodybuilding & Hypertrophy', dutyType: 'Floor Shift (Evening)', assignedCustomer: 'Main Floor', date: '2026-10-24', scheduledTime: '04:00 PM - 10:00 PM', checkInTime: '04:05 PM', checkOutTime: '10:00 PM', punctuality: 'Late' },
  { id: 'tr-6', trainerName: 'Pooja Hegde', specialization: 'Pilates & Core', dutyType: 'Personal Training (In-Gym)', assignedCustomer: 'Sneha Reddy', date: '2026-10-22', scheduledTime: '10:00 AM - 11:00 AM', checkInTime: '09:55 AM', checkOutTime: '11:00 AM', punctuality: 'On Time' },
  { id: 'tr-7', trainerName: 'Manpreet Gill', specialization: 'Strength & Conditioning', dutyType: 'Group Class (HIIT)', assignedCustomer: 'Studio A', date: '2026-10-14', scheduledTime: '07:00 AM - 08:30 AM', checkInTime: '06:50 AM', checkOutTime: '08:35 AM', punctuality: 'On Time' },
  { id: 'tr-8', trainerName: 'Farhan Akhtar', specialization: 'Calisthenics & Cardio', dutyType: 'Personal Training (In-Gym)', assignedCustomer: 'Rahul Verma', date: '2026-09-20', scheduledTime: '05:00 PM - 06:00 PM', checkInTime: '04:55 PM', checkOutTime: '06:00 PM', punctuality: 'On Time' },
];

const GymAdminAttendance = () => {
  const { user } = useAuth();
  // Main Tab View: 'CUSTOMERS' vs 'TRAINERS'
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'TRAINERS'>('CUSTOMERS');

  // Timeframe state: 'perday' | 'weekly' | 'monthly' | 'annual'
  const [timeframe, setTimeframe] = useState<Timeframe>('perday');

  const [customerCheckins, setCustomerCheckins] = useState<CustomerCheckin[]>(DEFAULT_CUSTOMER_LOGS);
  const [trainerRecords, setTrainerRecords] = useState<TrainerAttendanceRecord[]>(DEFAULT_TRAINER_RECORDS);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

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
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';
      const userBranchParam = user?.branchId ? `&branchId=${user.branchId}` : '';

      const [sessionsRes] = await Promise.all([
        api.get(`/trainer-sessions/gym${branchParam}`).catch(() => ({ data: { sessions: [] } })),
        api.get(`/trainers${branchParam}`).catch(() => ({ data: { trainers: [] } })),
        api.get(`/users?role=MEMBER${userBranchParam}`).catch(() => ({ data: { users: [] } })),
      ]);

      const dbSessions = sessionsRes.data?.sessions || [];

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
            date: s.date || '2026-10-26',
            scheduledTime: `${s.startTime || '10:00 AM'} - ${s.endTime || '11:00 AM'}`,
            checkInTime: checkInStr !== '--:--' ? checkInStr : (s.startTime || '09:00 AM'),
            checkOutTime: checkOutStr !== '--:--' ? checkOutStr : (s.status === 'In Progress' ? 'In Progress' : s.endTime || '10:00 AM'),
            punctuality: s.attendanceStatus === 'Late' ? 'Late' : 'On Time',
          };
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
              date: s.date || '2026-10-26',
              checkInTime: checkInStr,
              checkOutTime: checkOutStr,
            };
          });

        setTrainerRecords([
          ...sessionTrainerRecords,
          ...DEFAULT_TRAINER_RECORDS.filter(d => !sessionTrainerRecords.some(st => st.id === d.id))
        ]);
        setCustomerCheckins([
          ...sessionCustomerLogs,
          ...DEFAULT_CUSTOMER_LOGS.filter(d => !sessionCustomerLogs.some(sc => sc.id === d.id))
        ]);
      }
    } catch (err) {
      console.error('Error loading attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceData();
  }, [user?.branchId]);

  // Dynamic Customer Metrics based on Timeframe
  const customerMetrics = useMemo(() => {
    switch (timeframe) {
      case 'weekly':
        return {
          card1Title: 'Avg Daily in Gym',
          card1Value: '148',
          card1Sub: 'Across last 7 days',
          card2Title: 'Total Check-ins (This Week)',
          card2Value: '1,092',
          card2Sub: '+8.4% vs last week',
          card3Title: 'Peak Day This Week',
          card3Value: 'Wednesday',
          card3Sub: '198 check-ins recorded',
          card4Title: 'Failed Entries',
          card4Value: '14',
          card4Sub: 'Average 2 / day',
          chartTitle: 'Weekly Traffic',
          chartSubtitle: 'Daily member attendance volume',
          chartBadge: 'Daily Member Volume',
          chartData: [
            { label: 'Mon', heightPct: 78, count: '165 check-ins' },
            { label: 'Tue', heightPct: 85, count: '182 check-ins' },
            { label: 'Wed', heightPct: 98, count: '198 check-ins' },
            { label: 'Thu', heightPct: 80, count: '174 check-ins' },
            { label: 'Fri', heightPct: 88, count: '188 check-ins' },
            { label: 'Sat', heightPct: 54, count: '110 check-ins' },
            { label: 'Sun', heightPct: 40, count: '75 check-ins' },
          ],
          chartMarkers: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        };
      case 'monthly':
        return {
          card1Title: 'Avg Daily in Gym',
          card1Value: '152',
          card1Sub: '30-day facility average',
          card2Title: 'Total Check-ins (This Month)',
          card2Value: '4,680',
          card2Sub: '+14.2% vs last month',
          card3Title: 'Peak Week This Month',
          card3Value: 'Week 2',
          card3Sub: '1,240 visits logged',
          card4Title: 'Failed Entries',
          card4Value: '48',
          card4Sub: 'Resolved at front desk',
          chartTitle: 'Monthly Traffic',
          chartSubtitle: 'Weekly aggregated member volume',
          chartBadge: 'Weekly Breakdown',
          chartData: [
            { label: 'Week 1', heightPct: 75, count: '1,120 visits' },
            { label: 'Week 2', heightPct: 96, count: '1,240 visits' },
            { label: 'Week 3', heightPct: 84, count: '1,180 visits' },
            { label: 'Week 4', heightPct: 80, count: '1,140 visits' },
          ],
          chartMarkers: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        };
      case 'annual':
        return {
          card1Title: 'Annual Active Members',
          card1Value: '1,280',
          card1Sub: 'Unique visitors this year',
          card2Title: 'Total Check-ins (Annual)',
          card2Value: '56,420',
          card2Sub: '+22% year-over-year',
          card3Title: 'Peak Month This Year',
          card3Value: 'January',
          card3Sub: '5,840 check-ins',
          card4Title: 'Failed Entries',
          card4Value: '412',
          card4Sub: '0.7% rejection rate',
          chartTitle: 'Annual Traffic',
          chartSubtitle: '12-Month attendance volume trend',
          chartBadge: '12-Month Check-in Trend',
          chartData: [
            { label: 'Jan', heightPct: 96, count: '5,840 visits' },
            { label: 'Feb', heightPct: 82, count: '4,950 visits' },
            { label: 'Mar', heightPct: 78, count: '4,720 visits' },
            { label: 'Apr', heightPct: 72, count: '4,350 visits' },
            { label: 'May', heightPct: 68, count: '4,100 visits' },
            { label: 'Jun', heightPct: 70, count: '4,250 visits' },
            { label: 'Jul', heightPct: 76, count: '4,600 visits' },
            { label: 'Aug', heightPct: 80, count: '4,850 visits' },
            { label: 'Sep', heightPct: 86, count: '5,200 visits' },
            { label: 'Oct', heightPct: 90, count: '5,460 visits' },
            { label: 'Nov', heightPct: 84, count: '5,080 visits' },
            { label: 'Dec', heightPct: 74, count: '4,480 visits' },
          ],
          chartMarkers: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
        };
      case 'perday':
      default:
        return {
          card1Title: 'Currently in Gym',
          card1Value: '42',
          card1Sub: 'Active on floor now',
          card2Title: 'Total Check-ins Today',
          card2Value: '156',
          card2Sub: '+12% vs yesterday',
          card3Title: 'Peak Hour Today',
          card3Value: '18:00',
          card3Sub: '64 members inside',
          card4Title: 'Failed Entries',
          card4Value: '3',
          card4Sub: 'Pass expired / RFID issue',
          chartTitle: "Today's Traffic",
          chartSubtitle: 'Hourly member check-in distribution',
          chartBadge: 'Hourly Member Volume',
          chartData: [
            { label: '06:00', heightPct: 20, count: '12 members' },
            { label: '07:00', heightPct: 15, count: '9 members' },
            { label: '08:00', heightPct: 10, count: '6 members' },
            { label: '09:00', heightPct: 5, count: '3 members' },
            { label: '10:00', heightPct: 10, count: '7 members' },
            { label: '11:00', heightPct: 30, count: '18 members' },
            { label: '12:00', heightPct: 45, count: '28 members' },
            { label: '13:00', heightPct: 60, count: '38 members' },
            { label: '14:00', heightPct: 80, count: '52 members' },
            { label: '15:00', heightPct: 50, count: '32 members' },
            { label: '16:00', heightPct: 40, count: '26 members' },
            { label: '17:00', heightPct: 70, count: '45 members' },
            { label: '18:00', heightPct: 90, count: '64 members' },
            { label: '19:00', heightPct: 85, count: '58 members' },
            { label: '20:00', heightPct: 60, count: '40 members' },
            { label: '21:00', heightPct: 40, count: '25 members' },
          ],
          chartMarkers: ['06:00', '12:00', '18:00', '22:00'],
        };
    }
  }, [timeframe]);

  // Trainer metrics calculations
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

  // Dynamic Trainer Metrics based on Timeframe
  const trainerMetrics = useMemo(() => {
    switch (timeframe) {
      case 'weekly':
        return {
          card1Title: 'Avg Trainers / Day',
          card1Value: '6',
          card1Sub: 'Full floor coverage',
          card2Title: 'Total Check-ins (This Week)',
          card2Value: '54',
          card2Sub: '100% shifts logged',
          card3Title: 'Completed Sessions (Weekly)',
          card3Value: '78',
          card3Sub: 'PT & class bookings',
          card4Title: 'Weekly Attendance Rate',
          card4Value: '96%',
          card4Sub: 'High coach punctuality',
          chartTitle: 'Weekly Trainer Shift Coverage',
          chartSubtitle: 'Total coaching hours per day this week',
          chartBadge: 'Daily Floor & PT Hours',
          chartData: [
            { label: 'Mon', heightPct: 80, count: '48 hrs (6 coaches)' },
            { label: 'Tue', heightPct: 88, count: '52 hrs (7 coaches)' },
            { label: 'Wed', heightPct: 95, count: '56 hrs (7 coaches)' },
            { label: 'Thu', heightPct: 84, count: '50 hrs (6 coaches)' },
            { label: 'Fri', heightPct: 90, count: '54 hrs (7 coaches)' },
            { label: 'Sat', heightPct: 60, count: '36 hrs (5 coaches)' },
            { label: 'Sun', heightPct: 42, count: '25 hrs (4 coaches)' },
          ],
          chartMarkers: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        };
      case 'monthly':
        return {
          card1Title: 'Active Floor Trainers',
          card1Value: '8',
          card1Sub: 'Certified staff',
          card2Title: 'Total Check-ins (This Month)',
          card2Value: '228',
          card2Sub: 'Monthly total shifts',
          card3Title: 'Completed Sessions (Monthly)',
          card3Value: '315',
          card3Sub: 'Personal & group training',
          card4Title: 'Monthly Attendance Rate',
          card4Value: '97%',
          card4Sub: '4 late arrivals noted',
          chartTitle: 'Monthly Trainer Shift Hours',
          chartSubtitle: 'Weekly aggregated trainer hours',
          chartBadge: 'Weekly Coaching Volume',
          chartData: [
            { label: 'Week 1', heightPct: 78, count: '280 hrs coaching' },
            { label: 'Week 2', heightPct: 90, count: '320 hrs coaching' },
            { label: 'Week 3', heightPct: 85, count: '305 hrs coaching' },
            { label: 'Week 4', heightPct: 82, count: '295 hrs coaching' },
          ],
          chartMarkers: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        };
      case 'annual':
        return {
          card1Title: 'Total Roster Trainers',
          card1Value: '10',
          card1Sub: 'Staff on payroll',
          card2Title: 'Total Check-ins (Annual)',
          card2Value: '2,740',
          card2Sub: 'Shifts logged in 2026',
          card3Title: 'Completed Sessions (Annual)',
          card3Value: '3,820',
          card3Sub: 'Sessions conducted',
          card4Title: 'Annual Attendance Rate',
          card4Value: '98%',
          card4Sub: 'Facility performance 4.9/5',
          chartTitle: 'Annual Trainer Session Coverage',
          chartSubtitle: 'Monthly completed coaching sessions',
          chartBadge: 'Monthly Session Totals',
          chartData: [
            { label: 'Jan', heightPct: 95, count: '345 sessions' },
            { label: 'Feb', heightPct: 84, count: '305 sessions' },
            { label: 'Mar', heightPct: 80, count: '290 sessions' },
            { label: 'Apr', heightPct: 74, count: '270 sessions' },
            { label: 'May', heightPct: 70, count: '255 sessions' },
            { label: 'Jun', heightPct: 72, count: '260 sessions' },
            { label: 'Jul', heightPct: 78, count: '285 sessions' },
            { label: 'Aug', heightPct: 82, count: '300 sessions' },
            { label: 'Sep', heightPct: 88, count: '320 sessions' },
            { label: 'Oct', heightPct: 92, count: '335 sessions' },
            { label: 'Nov', heightPct: 85, count: '310 sessions' },
            { label: 'Dec', heightPct: 76, count: '278 sessions' },
          ],
          chartMarkers: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
        };
      case 'perday':
      default:
        return {
          card1Title: 'Trainers On Duty',
          card1Value: String(trainerStats.onDutyCount || 6),
          card1Sub: 'Live on floor now',
          card2Title: 'Total Trainer Check-ins',
          card2Value: String(trainerStats.totalToday || 8),
          card2Sub: 'Morning & evening shifts',
          card3Title: 'Completed Sessions / Shifts',
          card3Value: String(trainerStats.completedCount || 12),
          card3Sub: '1-on-1 PT & floor duty',
          card4Title: 'Attendance Rate',
          card4Value: `${trainerStats.attendancePct}%`,
          card4Sub: 'All staff on time',
          chartTitle: 'Trainer Shift & Session Coverage',
          chartSubtitle: 'Active coach distribution across facility hours',
          chartBadge: 'Floor & PT Availability',
          chartData: [
            { label: '06:00', heightPct: 50, count: '4 Active Coaches' },
            { label: '07:00', heightPct: 70, count: '6 Active Coaches' },
            { label: '08:00', heightPct: 85, count: '7 Active Coaches' },
            { label: '09:00', heightPct: 90, count: '7 Active Coaches' },
            { label: '10:00', heightPct: 80, count: '6 Active Coaches' },
            { label: '11:00', heightPct: 60, count: '5 Active Coaches' },
            { label: '12:00', heightPct: 50, count: '4 Active Coaches' },
            { label: '13:00', heightPct: 75, count: '6 Active Coaches' },
            { label: '14:00', heightPct: 95, count: '8 Active Coaches' },
            { label: '15:00', heightPct: 100, count: '8 Active Coaches' },
            { label: '16:00', heightPct: 85, count: '7 Active Coaches' },
            { label: '17:00', heightPct: 70, count: '6 Active Coaches' },
            { label: '18:00', heightPct: 60, count: '5 Active Coaches' },
            { label: '19:00', heightPct: 40, count: '3 Active Coaches' },
          ],
          chartMarkers: ['06:00 (Early Floor)', '12:00 (Midday Peak)', '17:00 (Evening PT)', '21:00 (Closing)'],
        };
    }
  }, [timeframe, trainerStats]);

  // Filtered customer records by timeframe & search query
  const filteredCustomerCheckins = useMemo(() => {
    let list = customerCheckins;
    if (timeframe === 'perday') {
      list = list.filter((c) => c.date === '2026-10-26' || c.date.startsWith('2026-10-26'));
      if (list.length === 0) list = customerCheckins.slice(0, 5);
    } else if (timeframe === 'weekly') {
      list = list.filter((c) => c.date >= '2026-10-20');
      if (list.length === 0) list = customerCheckins.slice(0, 8);
    } else if (timeframe === 'monthly') {
      list = list.filter((c) => c.date >= '2026-10-01');
      if (list.length === 0) list = customerCheckins.slice(0, 10);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => {
        return (
          c.name.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          c.date.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [customerCheckins, searchQuery, timeframe]);

  // Filtered trainer records by timeframe & search query
  const filteredTrainerRecords = useMemo(() => {
    let list = trainerRecords;
    if (timeframe === 'perday') {
      list = list.filter((t) => t.date === '2026-10-26' || t.date.startsWith('2026-10-26'));
      if (list.length === 0) list = trainerRecords.slice(0, 4);
    } else if (timeframe === 'weekly') {
      list = list.filter((t) => t.date >= '2026-10-20');
      if (list.length === 0) list = trainerRecords.slice(0, 6);
    } else if (timeframe === 'monthly') {
      list = list.filter((t) => t.date >= '2026-10-01');
      if (list.length === 0) list = trainerRecords.slice(0, 8);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => {
        return (
          t.trainerName.toLowerCase().includes(q) ||
          t.specialization.toLowerCase().includes(q) ||
          t.date.toLowerCase().includes(q) ||
          t.dutyType.toLowerCase().includes(q) ||
          (t.assignedCustomer && t.assignedCustomer.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [trainerRecords, searchQuery, timeframe]);

  const timeframeLabel = useMemo(() => {
    return TIMEFRAME_OPTIONS.find((o) => o.id === timeframe)?.label || 'Per Day';
  }, [timeframe]);

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
        filename: `Customer_Attendance_Report_${timeframeLabel}_${dateStr}`,
        columns,
        data,
        title: `Customer & Member Attendance Report (${timeframeLabel})`,
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
        filename: `Trainer_Attendance_Report_${timeframeLabel}_${dateStr}`,
        columns,
        data,
        title: `Trainer & Staff Attendance Report (${timeframeLabel})`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight flex items-center gap-3">
            <UserCheck className="text-[#EA580C]" size={28} />
            <span>Attendance</span>
          </h1>
          <p className="text-[#64748B] mt-1">
            {activeTab === 'CUSTOMERS'
              ? 'Live check-ins, peak hours, and member activity.'
              : 'Real-time staff check-ins, duty shifts, session attendance, and punctuality.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Timeframe Dropdown Option: Per Day, Weekly, Monthly, Annual */}
          <div className="relative inline-flex items-center">
            <Calendar size={15} className="absolute left-3 text-[#EA580C] pointer-events-none" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as Timeframe)}
              className="appearance-none bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FDBA74] text-[#111827] font-bold text-xs rounded-xl pl-9 pr-8 py-2.5 outline-none cursor-pointer shadow-xs transition-colors"
              title="Attendance Timeframe Filter"
            >
              {TIMEFRAME_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#FFFFFF] text-[#111827]">
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 text-[#64748B] pointer-events-none" />
          </div>

          {/* Quick Segmented Pill Controls */}
          <div className="hidden sm:flex items-center bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0]">
            {TIMEFRAME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimeframe(opt.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === opt.id
                    ? 'bg-[#C2410C] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#C2410C]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Live tracking badge */}
          <div className="flex items-center space-x-2 text-xs font-bold bg-[#FFFFFF] border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl text-[#111827] shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>
              {activeTab === 'CUSTOMERS' ? 'Live Tracking Active' : `${trainerStats.onDutyCount} Trainers On Duty`}
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={loadAttendanceData}
            title="Refresh attendance"
            className="p-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl hover:bg-[#FFF7ED] hover:border-[#FDBA74] text-[#111827] transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#EA580C]' : ''} />
          </button>

          {/* Download PDF button */}
          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#C2410C] text-white font-bold rounded-xl hover:bg-[#9A3412] transition-colors shadow-sm cursor-pointer text-xs"
          >
            <Download size={15} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* TABS SWITCHER: Customers Attendance vs Trainers Attendance */}
      <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-2">
        <button
          onClick={() => {
            setActiveTab('CUSTOMERS');
            setSearchQuery('');
          }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'CUSTOMERS'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 scale-[1.02]'
              : 'bg-[#FFFFFF] text-[#64748B] border border-[#E2E8F0] hover:bg-[#FFF7ED] hover:text-[#FFFFFF]'
          }`}
        >
          <Users size={16} />
          <span>Customers Attendance</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'CUSTOMERS' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#F8FAFC] text-[#64748B]'
            }`}
          >
            {filteredCustomerCheckins.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('TRAINERS');
            setSearchQuery('');
          }}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'TRAINERS'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 scale-[1.02]'
              : 'bg-[#FFFFFF] text-[#64748B] border border-[#E2E8F0] hover:bg-[#FFF7ED] hover:text-[#FFFFFF]'
          }`}
        >
          <Dumbbell size={16} />
          <span>Trainers Attendance</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'TRAINERS' ? 'bg-[#FFFFFF]/20 text-[#FFFFFF]' : 'bg-[#F8FAFC] text-[#64748B]'
            }`}
          >
            {filteredTrainerRecords.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: CUSTOMERS ATTENDANCE */}
      {activeTab === 'CUSTOMERS' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Customer Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#FFF7ED] text-[#EA580C] rounded-xl flex items-center justify-center">
                  <Users size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  {timeframeLabel}
                </span>
              </div>
              <p className="text-[#64748B] text-sm font-medium">{customerMetrics.card1Title}</p>
              <h3 className="text-3xl font-bold text-[#111827] mt-1">{customerMetrics.card1Value}</h3>
              <p className="text-xs text-[#EA580C] mt-1.5">{customerMetrics.card1Sub}</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-emerald-500/10 text-[#15803D] rounded-xl flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  {timeframeLabel}
                </span>
              </div>
              <p className="text-[#64748B] text-sm font-medium">{customerMetrics.card2Title}</p>
              <h3 className="text-3xl font-bold text-[#111827] mt-1">{customerMetrics.card2Value}</h3>
              <p className="text-xs text-[#EA580C] mt-1.5">{customerMetrics.card2Sub}</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#FFF7ED] text-[#EA580C] rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  {timeframeLabel}
                </span>
              </div>
              <p className="text-[#64748B] text-sm font-medium">{customerMetrics.card3Title}</p>
              <h3 className="text-3xl font-bold text-[#111827] mt-1">{customerMetrics.card3Value}</h3>
              <p className="text-xs text-[#EA580C] mt-1.5">{customerMetrics.card3Sub}</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-rose-500/10 text-[#B91C1C] rounded-xl flex items-center justify-center">
                  <UserX size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  {timeframeLabel}
                </span>
              </div>
              <p className="text-[#64748B] text-sm font-medium">{customerMetrics.card4Title}</p>
              <h3 className="text-3xl font-bold text-[#111827] mt-1">{customerMetrics.card4Value}</h3>
              <p className="text-xs text-[#64748B] mt-1.5">{customerMetrics.card4Sub}</p>
            </div>
          </div>

          {/* Traffic Chart & Recent Check-ins */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">{customerMetrics.chartTitle}</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">{customerMetrics.chartSubtitle}</p>
                </div>
                <span className="text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] px-2.5 py-1 rounded-lg">
                  {customerMetrics.chartBadge}
                </span>
              </div>
              <div className="h-48 flex items-end justify-between gap-1.5 pt-4 border-t border-[#E2E8F0]">
                {customerMetrics.chartData.map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${bar.heightPct}%`,
                        background: `linear-gradient(to top, #FFFFFF, #F97316)`,
                      }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0] font-bold text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none shadow-md transition-opacity">
                        {bar.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#64748B]">
                {customerMetrics.chartMarkers.map((marker, idx) => (
                  <span key={idx}>{marker}</span>
                ))}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-[#E2E8F0] pb-2">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Recent Check-ins</h3>
                  <span className="text-[11px] text-[#EA580C] font-semibold">{timeframeLabel} View</span>
                </div>
                <span className="text-xs text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-lg border border-[#E2E8F0]">
                  {filteredCustomerCheckins.length} Logs
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 max-h-[220px]">
                {filteredCustomerCheckins.slice(0, 6).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          log.type === 'VIP Member'
                            ? 'bg-[#C2410C] text-white'
                            : log.type === 'Guest Pass'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-[#F8FAFC] text-[#EA580C]'
                        }`}
                      >
                        {log.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{log.name}</p>
                        <p className="text-xs text-[#64748B]">
                          {log.type} • {formatDateDisplay(log.date)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#EA580C]">{log.checkInTime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Attendance Table */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">Customer Access Logs</h3>
                <p className="text-xs text-[#64748B]">
                  Complete history of facility entries ({timeframeLabel})
                </p>
              </div>

              <div className="flex items-center">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search member name or date..."
                    className="pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium outline-none focus:border-[#FDBA74] text-[#111827] w-64 md:w-80"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F8FAFC]">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Check-in Time</th>
                    <th className="py-3 px-4">Checkout Time</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredCustomerCheckins.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FFF7ED]/70 transition-colors">
                      {/* 1. Member Name */}
                      <td className="py-3.5 px-4 font-semibold text-[#111827]">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-bold text-xs">
                            {item.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold">{item.name}</p>
                            {item.email && <p className="text-[11px] text-[#64748B] font-normal">{item.email}</p>}
                          </div>
                        </div>
                      </td>

                      {/* 2. Type */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#64748B]">
                        <span className="px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
                          {item.type}
                        </span>
                      </td>

                      {/* 3. Date */}
                      <td className="py-3.5 px-4 text-xs font-medium text-[#111827]">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#EA580C]" />
                          {formatDateDisplay(item.date)}
                        </span>
                      </td>

                      {/* 4. Check-in Time */}
                      <td className="py-3.5 px-4 text-xs font-bold text-[#EA580C]">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={13} className="text-[#EA580C]" />
                          {item.checkInTime}
                        </span>
                      </td>

                      {/* 5. Checkout Time */}
                      <td className="py-3.5 px-4 text-xs font-bold">
                        <span
                          className={
                            item.checkOutTime === 'In Gym'
                              ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#F8FAFC] text-[#EA580C] animate-pulse'
                              : 'text-[#111827]'
                          }
                        >
                          {item.checkOutTime}
                        </span>
                      </td>

                      {/* 6. Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedRecord({ ...item, recordType: 'customer' })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] hover:border-[#FDBA74] text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomerCheckins.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#64748B] text-xs font-medium">
                        No customer attendance records found for this timeframe.
                      </td>
                    </tr>
                  )}
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
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#FFF7ED] text-[#EA580C] rounded-xl flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  {timeframeLabel}
                </span>
              </div>
              <p className="text-[#64748B] text-sm font-medium">{trainerMetrics.card1Title}</p>
              <h3 className="text-3xl font-bold text-[#111827] mt-1">{trainerMetrics.card1Value}</h3>
              <p className="text-xs text-[#EA580C] mt-1.5">{trainerMetrics.card1Sub}</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#FFF7ED] text-[#EA580C] rounded-xl flex items-center justify-center">
                  <Dumbbell size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  {timeframeLabel}
                </span>
              </div>
              <p className="text-[#64748B] text-sm font-medium">{trainerMetrics.card2Title}</p>
              <h3 className="text-3xl font-bold text-[#111827] mt-1">{trainerMetrics.card2Value}</h3>
              <p className="text-xs text-[#EA580C] mt-1.5">{trainerMetrics.card2Sub}</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#FFF7ED] text-[#EA580C] rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  {timeframeLabel}
                </span>
              </div>
              <p className="text-[#64748B] text-sm font-medium">{trainerMetrics.card3Title}</p>
              <h3 className="text-3xl font-bold text-[#111827] mt-1">{trainerMetrics.card3Value}</h3>
              <p className="text-xs text-[#EA580C] mt-1.5">{trainerMetrics.card3Sub}</p>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-[#9A3412]/20 text-[#EA580C] rounded-xl flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
                  {timeframeLabel}
                </span>
              </div>
              <p className="text-[#64748B] text-sm font-medium">{trainerMetrics.card4Title}</p>
              <h3 className="text-3xl font-bold text-[#111827] mt-1">{trainerMetrics.card4Value}</h3>
              <p className="text-xs text-[#EA580C] mt-1.5">{trainerMetrics.card4Sub}</p>
            </div>
          </div>

          {/* Trainer Shift Coverage & Live Trainer Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">{trainerMetrics.chartTitle}</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">{trainerMetrics.chartSubtitle}</p>
                </div>
                <span className="text-xs font-semibold text-[#EA580C] bg-[#FFF7ED] px-2.5 py-1 rounded-lg">
                  {trainerMetrics.chartBadge}
                </span>
              </div>

              {/* Coach Availability Bar */}
              <div className="h-48 flex items-end justify-between gap-1.5 pt-4 border-t border-[#E2E8F0]">
                {trainerMetrics.chartData.map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                    <div
                      className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${bar.heightPct}%`,
                        background: `linear-gradient(to top, #F97316, #9A3412)`,
                      }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0] font-bold text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none shadow-md transition-opacity">
                        {bar.count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-[#64748B]">
                {trainerMetrics.chartMarkers.map((marker, idx) => (
                  <span key={idx}>{marker}</span>
                ))}
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-[#E2E8F0] pb-2">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">Trainer Shift Status</h3>
                  <span className="text-[11px] text-[#EA580C] font-semibold">{timeframeLabel} View</span>
                </div>
                <span className="text-xs text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-lg border border-[#E2E8F0]">
                  {filteredTrainerRecords.length} Shifts
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 max-h-[220px]">
                {filteredTrainerRecords.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] hover:border-[#FFEDD5] transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center text-xs font-bold">
                        {item.trainerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{item.trainerName}</p>
                        <p className="text-xs text-[#64748B] truncate max-w-[150px]">{item.dutyType}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.checkOutTime === 'In Progress'
                          ? 'bg-[#F8FAFC] text-[#EA580C]'
                          : 'bg-emerald-500/20 text-[#15803D]'
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
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">Trainers Attendance & Shift Logs</h3>
                <p className="text-xs text-[#64748B]">
                  Detailed records of trainer check-ins, sessions, and duty times ({timeframeLabel})
                </p>
              </div>

              <div className="flex items-center">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search trainer, duty, client or date..."
                    className="pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium outline-none focus:border-[#FDBA74] text-[#111827] w-64 md:w-80"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F8FAFC]">
                    <th className="py-3 px-4">Trainer</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Assigned Duty / Mode</th>
                    <th className="py-3 px-4">Client / Area</th>
                    <th className="py-3 px-4">Scheduled Slot</th>
                    <th className="py-3 px-4">Check-In</th>
                    <th className="py-3 px-4">Check-Out</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredTrainerRecords.map((t) => (
                    <tr key={t.id} className="hover:bg-[#FFF7ED]/70 transition-colors">
                      {/* 1. Trainer */}
                      <td className="py-3.5 px-4 font-semibold text-[#111827]">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                            {t.trainerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold">{t.trainerName}</p>
                            <p className="text-[11px] text-[#64748B] font-normal">{t.specialization}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Date */}
                      <td className="py-3.5 px-4 text-xs font-medium text-[#111827]">
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <Calendar size={13} className="text-[#EA580C]" />
                          {formatDateDisplay(t.date)}
                        </span>
                      </td>

                      {/* 3. Assigned Duty / Mode */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#111827]">
                        <span className="px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
                          {t.dutyType}
                        </span>
                      </td>

                      {/* 4. Client / Area */}
                      <td className="py-3.5 px-4 text-xs font-bold text-[#EA580C]">
                        {t.assignedCustomer ? `Client: ${t.assignedCustomer}` : 'Main Floor'}
                      </td>

                      {/* 5. Scheduled Slot */}
                      <td className="py-3.5 px-4 text-xs font-medium text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-[#EA580C]" /> {t.scheduledTime}
                        </span>
                      </td>

                      {/* 6. Check-In */}
                      <td className="py-3.5 px-4 text-xs font-bold text-[#111827]">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-[#EA580C]" />
                          <span>{t.checkInTime}</span>
                        </div>
                        {t.punctuality && (
                          <span className="text-[10px] text-[#64748B] font-normal block">{t.punctuality}</span>
                        )}
                      </td>

                      {/* 7. Check-Out */}
                      <td className="py-3.5 px-4 text-xs font-bold">
                        <span
                          className={
                            t.checkOutTime === 'In Progress'
                              ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#F8FAFC] text-[#EA580C] animate-pulse'
                              : 'text-[#111827]'
                          }
                        >
                          {t.checkOutTime}
                        </span>
                      </td>

                      {/* 8. Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedRecord({ ...t, recordType: 'trainer' })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] hover:border-[#FDBA74] text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTrainerRecords.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#64748B] text-xs font-medium">
                        No trainer attendance records found for this timeframe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance & Shift Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#EA580C] flex items-center justify-center font-bold">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111827]">
                    {selectedRecord.recordType === 'trainer' ? 'Trainer Shift & Session Details' : 'Member Check-In Details'}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {formatDateDisplay(selectedRecord.date)} • {selectedRecord.recordType === 'trainer' ? selectedRecord.dutyType : selectedRecord.type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-2 text-[#64748B] hover:text-[#111827] hover:bg-[#FFF7ED] rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {selectedRecord.recordType === 'trainer' ? (
                <>
                  {/* Trainer Info Card */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center text-base shadow-sm">
                        {selectedRecord.trainerName?.charAt(0) || 'T'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#111827] text-sm">{selectedRecord.trainerName}</h4>
                        <p className="text-xs text-[#64748B]">{selectedRecord.specialization}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]">
                      {selectedRecord.punctuality || 'On Time'}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-medium block mb-1">Assigned Client / Area</span>
                      <span className="font-bold text-[#111827] text-sm">
                        {selectedRecord.assignedCustomer || 'General Floor'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-medium block mb-1">Session Mode / Duty</span>
                      <span className="font-bold text-[#111827] text-sm">
                        {selectedRecord.dutyType}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-medium block mb-1">Scheduled Slot</span>
                      <span className="font-bold text-[#111827] text-sm flex items-center gap-1">
                        <Clock size={13} className="text-[#EA580C]" /> {selectedRecord.scheduledTime}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-medium block mb-1">Date</span>
                      <span className="font-bold text-[#111827] text-sm flex items-center gap-1">
                        <Calendar size={13} className="text-[#EA580C]" /> {formatDateDisplay(selectedRecord.date)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#EA580C] font-medium block mb-1">Check-In Time</span>
                      <span className="font-bold text-[#EA580C] text-sm flex items-center gap-1">
                        <Clock size={13} /> {selectedRecord.checkInTime}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#EA580C] font-medium block mb-1">Check-Out Time</span>
                      <span className="font-bold text-[#EA580C] text-sm flex items-center gap-1">
                        <LogOut size={13} /> {selectedRecord.checkOutTime}
                      </span>
                    </div>
                  </div>

                  {selectedRecord.sessionId && (
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">Session Reference ID</span>
                      <span className="font-mono text-[#111827] font-bold">{selectedRecord.sessionId}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Member Info Card */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-bold text-base shadow-sm">
                        {selectedRecord.name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#111827] text-sm">{selectedRecord.name}</h4>
                        {selectedRecord.email && <p className="text-xs text-[#64748B]">{selectedRecord.email}</p>}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F8FAFC] text-[#111827] border border-[#E2E8F0]">
                      {selectedRecord.type}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-medium block mb-1">Date</span>
                      <span className="font-bold text-[#111827] text-sm flex items-center gap-1">
                        <Calendar size={13} className="text-[#EA580C]" /> {formatDateDisplay(selectedRecord.date)}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-medium block mb-1">Membership / Pass</span>
                      <span className="font-bold text-[#111827] text-sm">
                        {selectedRecord.type}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#EA580C] font-medium block mb-1">Check-In Time</span>
                      <span className="font-bold text-[#EA580C] text-sm flex items-center gap-1">
                        <Clock size={13} /> {selectedRecord.checkInTime}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <span className="text-[#64748B] font-medium block mb-1">Check-Out Time</span>
                      <span className="font-bold text-[#111827] text-sm flex items-center gap-1">
                        <LogOut size={13} /> {selectedRecord.checkOutTime}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FFF7ED] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminAttendance;
