import { useState, useEffect, useRef } from 'react';
import {
  CalendarCheck, CheckCircle, XCircle, Clock,
  Calendar, Search, Loader2, Dumbbell, Download, X
} from 'lucide-react';
import clsx from 'clsx';
import api from '../../utils/api';
import TrainerClientsTabs from '../../components/Trainer/TrainerClientsTabs';
import { exportToExcel, exportToPDF } from '../../utils/export';

interface AttendanceRecord {
  _id: string;
  bookingId?: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: 'Online' | 'Offline';
  status: string;
  attendanceStatus?: 'Present' | 'Absent' | 'Late' | 'Self-Learning';
  checkInTime?: string;
  checkOutTime?: string;
  customerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
  customerName?: string;
}

const TrainerAttendance = () => {
  const [sessions, setSessions] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    try {
      if (dateInputRef.current) {
        if ('showPicker' in HTMLInputElement.prototype) {
          dateInputRef.current.showPicker();
        } else {
          dateInputRef.current.focus();
        }
      }
    } catch {
      dateInputRef.current?.focus();
    }
  };

  const handleMarkAttendance = async (sessionId: string, newStatus: 'Present' | 'Absent') => {
    try {
      setMarkingId(sessionId);
      const res = await api.patch(`/trainer-sessions/${sessionId}/attendance`, {
        attendanceStatus: newStatus,
        checkInTime: newStatus === 'Present' ? new Date().toISOString() : undefined
      });
      if (res.data?.success) {
        setSessions(prev => prev.map(s => s._id === sessionId ? {
          ...s,
          attendanceStatus: newStatus,
          status: newStatus === 'Present' ? 'Completed' : s.status,
          checkInTime: newStatus === 'Present' ? (s.checkInTime || new Date().toISOString()) : s.checkInTime
        } : s));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update attendance');
    } finally {
      setMarkingId(null);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-sessions/trainer');
      if (res.data.success) {
        setSessions(res.data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load trainer session attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      !searchTerm ||
      (s.customerId &&
        `${s.customerId.firstName} ${s.customerId.lastName} ${s.customerId.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (s.bookingId && s.bookingId.toLowerCase().includes(searchTerm.toLowerCase()));

    const sessionDate = s.date;
    const checkInDate = s.checkInTime ? new Date(s.checkInTime).toISOString().split('T')[0] : null;
    const matchesDate = !selectedDate || sessionDate === selectedDate || checkInDate === selectedDate;

    const currentAtt = s.attendanceStatus || (s.status === 'Completed' ? 'Present' : 'Pending');
    const matchesStatus = statusFilter === 'All' || currentAtt === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Calculate Metrics
  const totalCount = sessions.length;
  const presentCount = sessions.filter(s => s.attendanceStatus === 'Present' || s.status === 'Completed').length;
  const absentCount = sessions.filter(s => s.attendanceStatus === 'Absent').length;
  const selfLearningCount = sessions.filter(s => s.attendanceStatus === 'Self-Learning').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + selfLearningCount) / totalCount) * 100) : 0;

  const handleDownloadAttendanceReport = (format: 'pdf' | 'excel' = 'excel') => {
    const columns = ['Member Name', 'Booking ID', 'Mode', 'Date', 'Scheduled Time', 'Status', 'Check-In', 'Check-Out'];
    const data = filteredSessions.map(s => [
      s.customerName || (s.customerId ? `${s.customerId.firstName || ''} ${s.customerId.lastName || ''}`.trim() : 'Member'),
      s.bookingId || 'N/A',
      s.mode || 'Offline',
      s.date,
      `${s.startTime} - ${s.endTime}`,
      s.attendanceStatus || s.status || 'Scheduled',
      s.checkInTime ? new Date(s.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
      s.checkOutTime ? new Date(s.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
    ]);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Attendance_Report_${dateStr}`;
    const title = `Client Session Attendance Report (${new Date().toLocaleDateString()})`;

    if (format === 'pdf') {
      exportToPDF({ filename, columns, data, title });
    } else {
      exportToExcel({ filename, columns, data, title });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <TrainerClientsTabs />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827] flex items-center gap-2">
            <CalendarCheck className="text-[#EA580C]" size={28} />
            Client Session Attendance
          </h1>
          <p className="text-sm text-[#64748B]">
            Track member attendance, check-in timestamps, and self-learning excuses across online & offline sessions.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleDownloadAttendanceReport('excel')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#C2410C] hover:text-[#FFFFFF] font-bold hover:border-[#FDBA74] text-[#111827] font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs shrink-0"
            title="Download Excel Attendance Report"
          >
            <Download size={16} />
            <span>Excel</span>
          </button>
          <button
            onClick={() => handleDownloadAttendanceReport('pdf')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs shrink-0"
            title="Download PDF Attendance Report"
          >
            <Download size={16} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-[#64748B] font-medium uppercase tracking-wider">Scheduled</p>
          <p className="text-2xl font-bold text-[#111827] mt-0.5">{totalCount}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-green-700 font-medium uppercase tracking-wider">Present</p>
          <p className="text-2xl font-bold text-green-700 mt-0.5">{presentCount}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-[#EA580C] font-medium uppercase tracking-wider">Self-Learning</p>
          <p className="text-2xl font-bold text-[#EA580C] mt-0.5">{selfLearningCount}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-rose-700 font-medium uppercase tracking-wider">Absent</p>
          <p className="text-2xl font-bold text-rose-700 mt-0.5">{absentCount}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-[#EA580C] font-medium uppercase tracking-wider">Attendance %</p>
          <p className="text-2xl font-bold text-[#EA580C] mt-0.5">{attendanceRate}%</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-3">
        {/* Top Controls Row: Search + Date Selector */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#F8FAFC] rounded-xl text-xs sm:text-sm outline-none focus:bg-[#FFFFFF] focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10 border border-[#E2E8F0] text-[#111827] placeholder:text-[#94A3B8] transition-all"
            />
          </div>

          {/* Quick Date Filters + Date Picker Group */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="inline-flex p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className={clsx(
                  "text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                  !selectedDate
                    ? "bg-[#C2410C] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFFFFF]"
                )}
              >
                All Dates
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate(todayStr)}
                className={clsx(
                  "text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                  selectedDate === todayStr
                    ? "bg-[#C2410C] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFFFFF]"
                )}
              >
                Today
              </button>
            </div>

            {/* Date Picker */}
            <div
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button[data-clear]')) return;
                openDatePicker();
              }}
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all bg-[#F8FAFC] cursor-pointer hover:border-[#EA580C]",
                selectedDate && selectedDate !== todayStr
                  ? "border-[#EA580C] bg-[#FFF7ED] text-[#EA580C] shadow-sm"
                  : "border-[#E2E8F0] text-[#64748B]"
              )}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDatePicker();
                }}
                className="text-inherit hover:opacity-80 transition cursor-pointer flex items-center justify-center p-0.5"
                title="Open calendar"
              >
                <Calendar size={14} className={selectedDate && selectedDate !== todayStr ? "text-[#EA580C]" : "text-[#64748B]"} />
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker?.();
                  } catch {}
                }}
                className="bg-transparent text-xs font-semibold text-[#111827] outline-none cursor-pointer no-calendar-indicator [&::-webkit-calendar-picker-indicator]:hidden"
              />
              {selectedDate && (
                <button
                  type="button"
                  data-clear
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate('');
                  }}
                  title="Clear date"
                  className="p-0.5 text-[#94A3B8] hover:text-[#EA580C] transition cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#F1F5F9]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mr-1 hidden sm:inline">
              Status:
            </span>
            {['All', 'Present', 'Absent', 'Late', 'Self-Learning'].map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-[#C2410C] text-white shadow-md shadow-orange-500/20 border border-[#FDBA74]"
                      : "bg-[#F8FAFC] text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] border border-[#E2E8F0]"
                  )}
                >
                  {status}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-semibold text-[#64748B] sm:text-right shrink-0">
            Showing <span className="font-bold text-[#111827]">{filteredSessions.length}</span> record{filteredSessions.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
          <h2 className="text-sm font-bold text-[#111827]">
            Roster {selectedDate ? `for ${selectedDate}` : '(All Dates)'} ({filteredSessions.length} session{filteredSessions.length === 1 ? '' : 's'})
          </h2>
          <button
            onClick={fetchAttendance}
            className="text-xs text-[#EA580C] font-bold hover:underline"
          >
            Refresh Roster
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#EA580C]" size={32} />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] space-y-3">
            <CalendarCheck size={36} className="mx-auto text-[#64748B]" />
            <p className="font-semibold text-sm">
              {selectedDate
                ? `No scheduled sessions found for ${selectedDate}.`
                : 'No scheduled sessions match the current filter.'}
            </p>
            {sessions.length > 0 && selectedDate && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-[#64748B]">
                  You have {sessions.length} session{sessions.length === 1 ? '' : 's'} recorded across all dates.
                </p>
                <button
                  onClick={() => setSelectedDate('')}
                  className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-[#111827] rounded-xl text-xs font-bold transition shadow-sm"
                >
                  View All Sessions ({sessions.length})
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {filteredSessions.map((session) => {
              const currentStatus = session.attendanceStatus || (session.status === 'Completed' ? 'Present' : 'Pending');
              return (
                <div
                  key={session._id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FFF7ED] transition-colors"
                >
                  {/* Member Profile & Session Time */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#C2410C] text-white font-bold flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                      {session.customerId?.profilePhoto ? (
                        <img src={session.customerId.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        session.customerId?.firstName?.[0] || 'C'
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#111827] truncate">
                          {session.customerId
                            ? `${session.customerId.firstName} ${session.customerId.lastName}`
                            : 'Client'}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            session.mode === 'Online'
                              ? 'bg-[#F8FAFC] text-[#EA580C]'
                              : 'bg-[#F8FAFC] text-[#EA580C]'
                          }`}
                        >
                          {session.mode}
                        </span>
                        {session.bookingId && (
                          <span className="text-[10px] font-mono font-bold text-[#64748B] bg-[#F8FAFC] px-1.5 py-0.5 rounded">
                            {session.bookingId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748B] flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="font-semibold text-[#111827]">{session.date}</span>
                        <span>•</span>
                        <span>{session.startTime} - {session.endTime}</span>
                        {session.checkInTime && (
                          <span className="text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-md">
                            Check-in: {new Date(session.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {session.checkOutTime && (
                          <span className="text-[#EA580C] font-semibold bg-[#F8FAFC] px-2 py-0.5 rounded-md">
                            Check-out: {new Date(session.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Action Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        currentStatus === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : currentStatus === 'Late'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : currentStatus === 'Self-Learning'
                          ? 'bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]'
                          : currentStatus === 'Absent'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-[#F8FAFC] text-[#111827] border border-[#E2E8F0]'
                      }`}
                    >
                      {currentStatus === 'Present' && <CheckCircle size={14} className="text-emerald-600" />}
                      {currentStatus === 'Late' && <Clock size={14} className="text-amber-700" />}
                      {currentStatus === 'Self-Learning' && <Dumbbell size={14} className="text-[#EA580C]" />}
                      {currentStatus === 'Absent' && <XCircle size={14} className="text-rose-700" />}
                      <span>{currentStatus}</span>
                    </span>

                    {/* Quick Action Controls: Never repeat the current status */}
                    <div className="flex items-center gap-1.5">
                      {currentStatus !== 'Present' && (
                        <button
                          type="button"
                          disabled={markingId === session._id}
                          onClick={() => handleMarkAttendance(session._id, 'Present')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-300 cursor-pointer shadow-2xs"
                          title="Mark Client as Present"
                        >
                          <CheckCircle size={13} />
                          <span>Mark Present</span>
                        </button>
                      )}
                      {currentStatus !== 'Absent' && (
                        <button
                          type="button"
                          disabled={markingId === session._id}
                          onClick={() => handleMarkAttendance(session._id, 'Absent')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-300 cursor-pointer shadow-2xs"
                          title="Mark Client as Absent"
                        >
                          <XCircle size={13} />
                          <span>Mark Absent</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerAttendance;