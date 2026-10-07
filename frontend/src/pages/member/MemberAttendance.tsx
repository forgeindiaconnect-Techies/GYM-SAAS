import { useState, useEffect } from 'react';
import {
  CalendarCheck, Dumbbell, Video, Loader2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

interface SessionAttendance {
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
  trainerId?: {
    _id: string;
    name: string;
    profilePhoto?: string;
    specialization?: string;
  };
}

const MemberAttendance = () => {
  const [sessions, setSessions] = useState<SessionAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-sessions/member');
      if (res.data.success) {
        setSessions(res.data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load member attendance history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const totalSessions = sessions.length;
  const attendedCount = sessions.filter(
    (s) => s.attendanceStatus === 'Present' || s.status === 'Completed'
  ).length;
  const selfLearningCount = sessions.filter((s) => s.attendanceStatus === 'Self-Learning').length;
  const lateCount = sessions.filter((s) => s.attendanceStatus === 'Late').length;
  const missedCount = sessions.filter((s) => s.attendanceStatus === 'Absent').length;

  const attendanceScore =
    totalSessions > 0
      ? Math.round(((attendedCount + selfLearningCount + lateCount) / totalSessions) * 100)
      : 100;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#F97316] via-[#1b5353] to-[#256a6a] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200">
              <CalendarCheck size={13} />
              Session Attendance & Consistency
            </span>
            <h1 className="text-2xl md:text-3xl font-bold">Attendance Record</h1>
            <p className="text-white/80 text-sm max-w-lg">
              Track your live online session check-ins, punctuality, and self-learning workout completions over time.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center shrink-0 min-w-[200px]">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Overall Attendance</p>
            <p className="text-3xl font-black mt-1">{attendanceScore}%</p>
            <p className="text-xs text-white/70 mt-1">
              {attendedCount + selfLearningCount} of {totalSessions} completed
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-[#78716C] font-medium uppercase tracking-wider">Total Booked</p>
          <p className="text-2xl font-bold text-[#292524] mt-1">{totalSessions}</p>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-green-700 font-medium uppercase tracking-wider">Attended Live</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{attendedCount}</p>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Self-Learning</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{selfLearningCount}</p>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-rose-700 font-medium uppercase tracking-wider">Missed / Absent</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{missedCount}</p>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#E7E5E4] flex justify-between items-center bg-[#F8FAFB]">
          <h2 className="text-sm font-bold text-[#292524]">Session Attendance History</h2>
          <Link to="/member/online-sessions" className="text-xs text-[#F97316] font-bold hover:underline flex items-center gap-1">
            <span>Online Sessions</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#F97316]" size={32} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-[#78716C] space-y-3">
            <CalendarCheck size={36} className="mx-auto text-gray-300" />
            <p className="font-semibold text-sm">No session attendance records found yet.</p>
            <p className="text-xs text-gray-400">Book and attend your first online trainer session to view check-in history.</p>
            <Link
              to="/member/find-trainers"
              className="inline-block mt-2 px-4 py-2 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-[#0d3535] transition"
            >
              Book Trainer Session
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E7E5E4]">
            {sessions.map((session) => {
              const status = session.attendanceStatus || (session.status === 'Completed' ? 'Present' : session.status);
              return (
                <div
                  key={session._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-sm shrink-0">
                      {session.mode === 'Online' ? <Video size={18} /> : <Dumbbell size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#292524]">
                        {session.trainerId?.name || 'Assigned Trainer'}
                      </p>
                      <p className="text-xs text-[#78716C] mt-0.5">
                        {session.date} • {session.startTime} - {session.endTime} ({session.mode})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {session.checkInTime && (
                      <span className="text-xs text-gray-500 hidden sm:inline">
                        In: {new Date(session.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}

                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        status === 'Present' || status === 'Completed'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : status === 'Self-Learning'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : status === 'Late'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : status === 'Absent'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {status}
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

export default MemberAttendance;