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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#292524] flex items-center gap-2">
            <CalendarCheck className="text-[#F97316]" size={28} />
            Client Session Attendance
          </h1>
          <p className="text-sm text-[#78716C]">
            Track member attendance, check-in timestamps, and self-learning excuses across online & offline sessions.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-[#78716C] font-medium uppercase tracking-wider">Scheduled</p>
          <p className="text-2xl font-bold text-[#292524] mt-0.5">{totalCount}</p>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-green-700 font-medium uppercase tracking-wider">Present</p>
          <p className="text-2xl font-bold text-green-700 mt-0.5">{presentCount}</p>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-blue-700 font-medium uppercase tracking-wider">Self-Learning</p>
          <p className="text-2xl font-bold text-blue-700 mt-0.5">{selfLearningCount}</p>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-rose-700 font-medium uppercase tracking-wider">Absent</p>
          <p className="text-2xl font-bold text-rose-700 mt-0.5">{absentCount}</p>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-3.5 shadow-sm text-center">
          <p className="text-[11px] text-[#F97316] font-medium uppercase tracking-wider">Attendance %</p>
          <p className="text-2xl font-bold text-[#F97316] mt-0.5">{attendanceRate}%</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search member..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FFFDF8] rounded-xl text-xs outline-none focus:bg-white focus:border-[#F97316] border border-transparent"
            />
          </div>

          {/* Quick Date Filters */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedDate('')}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
                !selectedDate ? 'bg-[#F97316] text-white shadow-sm' : 'bg-[#FFFDF8] text-[#78716C] hover:bg-gray-200'
              }`}
            >
              All Dates
            </button>
            <button
              onClick={() => setSelectedDate(todayStr)}
              className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
                selectedDate === todayStr ? 'bg-[#F97316] text-white shadow-sm' : 'bg-[#FFFDF8] text-[#78716C] hover:bg-gray-200'
              }`}
            >
              Today
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-[#FFFDF8] px-3 py-1.5 rounded-xl border border-transparent focus-within:border-[#F97316]">
            <Calendar size={15} className="text-[#78716C]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#292524] outline-none"
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['All', 'Present', 'Absent', 'Late', 'Self-Learning'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === status
                  ? 'bg-[#F97316] text-white shadow-sm'
                  : 'bg-[#FFFDF8] text-[#78716C] hover:text-[#292524]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E7E5E4] flex justify-between items-center bg-[#F8FAFB]">
          <h2 className="text-sm font-bold text-[#292524]">
            Roster {selectedDate ? `for ${selectedDate}` : '(All Dates)'} ({filteredSessions.length} session{filteredSessions.length === 1 ? '' : 's'})
          </h2>
          <button
            onClick={fetchAttendance}
            className="text-xs text-[#F97316] font-bold hover:underline"
          >
            Refresh Roster
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#F97316]" size={32} />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-[#78716C] space-y-3">
            <CalendarCheck size={36} className="mx-auto text-gray-300" />
            <p className="font-semibold text-sm">
              {selectedDate
                ? `No scheduled sessions found for ${selectedDate}.`
                : 'No scheduled sessions match the current filter.'}
            </p>
            {sessions.length > 0 && selectedDate && (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-gray-500">
                  You have {sessions.length} session{sessions.length === 1 ? '' : 's'} recorded across all dates.
                </p>
                <button
                  onClick={() => setSelectedDate('')}
                  className="px-4 py-2 bg-[#F97316] hover:bg-[#123838] text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  View All Sessions ({sessions.length})
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E7E5E4]">
            {filteredSessions.map((session) => {
              const currentStatus = session.attendanceStatus || (session.status === 'Completed' ? 'Present' : 'Pending');
              return (
                <div
                  key={session._id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  {/* Member Profile & Session Time */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                      {session.customerId?.profilePhoto ? (
                        <img src={session.customerId.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        session.customerId?.firstName?.[0] || 'C'
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#292524] truncate">
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
                        {session.bookingId && (
                          <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {session.bookingId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#78716C] flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="font-semibold text-[#292524]">{session.date}</span>
                        <span>•</span>
                        <span>{session.startTime} - {session.endTime}</span>
                        {session.checkInTime && (
                          <span className="text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-md">
                            Check-in: {new Date(session.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {session.checkOutTime && (
                          <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md">
                            Check-out: {new Date(session.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        currentStatus === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : currentStatus === 'Late'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : currentStatus === 'Self-Learning'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : currentStatus === 'Absent'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {currentStatus === 'Present' && <CheckCircle size={14} className="text-emerald-700" />}
                      {currentStatus === 'Late' && <Clock size={14} className="text-amber-700" />}
                      {currentStatus === 'Self-Learning' && <Dumbbell size={14} className="text-blue-700" />}
                      {currentStatus === 'Absent' && <XCircle size={14} className="text-rose-700" />}
                      <span>{currentStatus}</span>
                    </span>
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