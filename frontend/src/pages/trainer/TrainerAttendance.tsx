import { useState, useEffect } from 'react';
import {
  CalendarCheck, CheckCircle, XCircle, Clock,
  Calendar, Search, Loader2, Dumbbell
} from 'lucide-react';
import api from '../../utils/api';

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
}

const TrainerAttendance = () => {
  const [sessions, setSessions] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

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

  const handleUpdateStatus = async (sessionId: string, newStatus: 'Present' | 'Absent' | 'Late' | 'Self-Learning') => {
    try {
      setSavingId(sessionId);
      const res = await api.post(`/trainer-sessions/${sessionId}/attendance`, {
        attendanceStatus: newStatus
      });
      if (res.data.success) {
        setSessions(prev =>
          prev.map(s => (s._id === sessionId ? { ...s, attendanceStatus: newStatus } : s))
        );
      }
    } catch (err: any) {
      // If endpoint doesn't have dedicated subpath, fallback to updating session
      try {
        await api.patch(`/trainer-sessions/${sessionId}`, { attendanceStatus: newStatus });
        setSessions(prev =>
          prev.map(s => (s._id === sessionId ? { ...s, attendanceStatus: newStatus } : s))
        );
      } catch (fallbackErr: any) {
        alert(fallbackErr.response?.data?.message || 'Failed to update attendance');
      }
    } finally {
      setSavingId(null);
    }
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      !searchTerm ||
      (s.customerId &&
        `${s.customerId.firstName} ${s.customerId.lastName} ${s.customerId.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (s.bookingId && s.bookingId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = !selectedDate || s.date === selectedDate;
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#202828] flex items-center gap-2">
            <CalendarCheck className="text-[#164A4A]" size={28} />
            Client Session Attendance
          </h1>
          <p className="text-sm text-[#455250]">
            Track member attendance, check-in timestamps, and self-learning excuses across online & offline sessions.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-[#455250] font-medium uppercase tracking-wider">Scheduled</p>
          <p className="text-2xl font-bold text-[#202828] mt-0.5">{totalCount}</p>
        </div>
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-green-700 font-medium uppercase tracking-wider">Present</p>
          <p className="text-2xl font-bold text-green-700 mt-0.5">{presentCount}</p>
        </div>
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-blue-700 font-medium uppercase tracking-wider">Self-Learning</p>
          <p className="text-2xl font-bold text-blue-700 mt-0.5">{selfLearningCount}</p>
        </div>
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-rose-700 font-medium uppercase tracking-wider">Absent</p>
          <p className="text-2xl font-bold text-rose-700 mt-0.5">{absentCount}</p>
        </div>
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-[#164A4A] font-medium uppercase tracking-wider">Attendance %</p>
          <p className="text-2xl font-bold text-[#164A4A] mt-0.5">{attendanceRate}%</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F1F5F3] rounded-xl text-xs outline-none focus:bg-white focus:border-[#164A4A] border border-transparent"
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-[#F1F5F3] px-3 py-1.5 rounded-xl border border-transparent focus-within:border-[#164A4A]">
            <Calendar size={16} className="text-[#455250]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#202828] outline-none"
            />
          </div>

          <button
            onClick={() => setSelectedDate('')}
            className={`text-xs px-2.5 py-1.5 rounded-xl transition ${
              !selectedDate ? 'bg-[#164A4A] text-white' : 'bg-gray-100 text-[#455250] hover:bg-gray-200'
            }`}
          >
            All Dates
          </button>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Present', 'Absent', 'Late', 'Self-Learning'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === status
                  ? 'bg-[#164A4A] text-white shadow-sm'
                  : 'bg-[#F1F5F3] text-[#455250] hover:text-[#202828]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#D3DFDA] flex justify-between items-center bg-[#F8FAFB]">
          <h2 className="text-sm font-bold text-[#202828]">
            Roster {selectedDate ? `for ${selectedDate}` : '(All History)'} ({filteredSessions.length} sessions)
          </h2>
          <button
            onClick={fetchAttendance}
            className="text-xs text-[#164A4A] font-bold hover:underline"
          >
            Refresh Roster
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#164A4A]" size={32} />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-[#455250] space-y-2">
            <CalendarCheck size={36} className="mx-auto text-gray-300" />
            <p className="font-semibold text-sm">No scheduled sessions match the current filter.</p>
            <p className="text-xs text-gray-400">Select another date or switch status filter to view history.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#D3DFDA]">
            {filteredSessions.map((session) => {
              const currentStatus = session.attendanceStatus || (session.status === 'Completed' ? 'Present' : 'Pending');
              return (
                <div
                  key={session._id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Member Profile & Session Time */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#164A4A] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {session.customerId?.firstName?.[0] || 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#202828] truncate">
                          {session.customerId
                            ? `${session.customerId.firstName} ${session.customerId.lastName}`
                            : 'Client'}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            session.mode === 'Online'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {session.mode}
                        </span>
                      </div>
                      <p className="text-xs text-[#455250] flex items-center gap-2 mt-0.5">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span>{session.startTime} - {session.endTime}</span>
                        {session.checkInTime && (
                          <span className="text-green-700 font-medium">
                            • Check-in: {new Date(session.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(session._id, 'Present')}
                      disabled={savingId === session._id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        currentStatus === 'Present'
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      <CheckCircle size={14} />
                      <span>Present</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(session._id, 'Late')}
                      disabled={savingId === session._id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        currentStatus === 'Late'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-700'
                      }`}
                    >
                      <Clock size={14} />
                      <span>Late</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(session._id, 'Self-Learning')}
                      disabled={savingId === session._id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        currentStatus === 'Self-Learning'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                      }`}
                    >
                      <Dumbbell size={14} />
                      <span>Self-Learning</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(session._id, 'Absent')}
                      disabled={savingId === session._id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        currentStatus === 'Absent'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-700'
                      }`}
                    >
                      <XCircle size={14} />
                      <span>Absent</span>
                    </button>
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