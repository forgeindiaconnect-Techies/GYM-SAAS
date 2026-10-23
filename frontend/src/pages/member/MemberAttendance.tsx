import { useState, useEffect } from 'react';
import {
  CalendarCheck, Dumbbell, Video, Loader2, LogIn, LogOut, Activity, CheckCircle2
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
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  const handleCheckIn = async (sessionId: string) => {
    setActionLoading(sessionId + '-checkin');
    setFeedbackMsg(null);
    try {
      const res = await api.post(`/trainer-sessions/${sessionId}/check-in`);
      if (res.data.success) {
        setFeedbackMsg({ text: 'Checked in successfully! Attendance marked Present.', type: 'success' });
        await fetchAttendance();
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.response?.data?.message || 'Check-in failed. Please try again.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (sessionId: string) => {
    setActionLoading(sessionId + '-checkout');
    setFeedbackMsg(null);
    try {
      const res = await api.post(`/trainer-sessions/${sessionId}/check-out`);
      if (res.data.success) {
        setFeedbackMsg({ text: 'Checked out successfully! Session duration logged.', type: 'success' });
        await fetchAttendance();
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.response?.data?.message || 'Check-out failed. Please try again.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

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

  const ongoingSession = sessions.find((s) => s.checkInTime && !s.checkOutTime);
  const nextEligibleSession = sessions.find(
    (s) => !s.checkInTime && s.status !== 'Cancelled' && s.status !== 'Rejected'
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#6366F1] via-[#6366F1] to-[#6366F1] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
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

      {/* Feedback Toast Notification */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className={feedbackMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'} />
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-bold underline hover:opacity-75 cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#292940] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-[#A1A1AA] font-medium uppercase tracking-wider">Total Booked</p>
          <p className="text-2xl font-bold text-[#11111F] mt-1">{totalSessions}</p>
        </div>
        <div className="bg-white border border-[#292940] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-green-700 font-medium uppercase tracking-wider">Attended Live</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{attendedCount}</p>
        </div>
        <div className="bg-white border border-[#292940] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Self-Learning</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{selfLearningCount}</p>
        </div>
        <div className="bg-white border border-[#292940] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-rose-700 font-medium uppercase tracking-wider">Missed / Absent</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{missedCount}</p>
        </div>
      </div>

      {/* Quick Active Check-In & Check-Out Action Bar */}
      {ongoingSession && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-900/10 shrink-0">
              <Activity size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                  Live Active Session Check-In
                </span>
              </div>
              <h3 className="font-extrabold text-[#11111F] text-base mt-0.5">
                {ongoingSession.trainerId?.name || 'Personal Training Session'} ({ongoingSession.mode})
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Checked in at{' '}
                <strong>
                  {new Date(ongoingSession.checkInTime!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </strong>{' '}
                &bull; Ready to complete workout?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCheckOut(ongoingSession._id)}
            disabled={actionLoading === ongoingSession._id + '-checkout'}
            className="px-5 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {actionLoading === ongoingSession._id + '-checkout' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <LogOut size={15} />
            )}
            <span>Check Out Now</span>
          </button>
        </div>
      )}

      {!ongoingSession && nextEligibleSession && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-[#17172A] rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white flex items-center justify-center font-bold shadow-md shadow-teal-900/10 shrink-0">
              <LogIn size={22} />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase text-[#6366F1] tracking-wider block">
                Scheduled Training Session
              </span>
              <h3 className="font-extrabold text-[#11111F] text-base mt-0.5">
                {nextEligibleSession.trainerId?.name || 'Assigned Trainer'} ({nextEligibleSession.mode})
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                {nextEligibleSession.date} &bull; {nextEligibleSession.startTime} - {nextEligibleSession.endTime}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCheckIn(nextEligibleSession._id)}
            disabled={actionLoading === nextEligibleSession._id + '-checkin'}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {actionLoading === nextEligibleSession._id + '-checkin' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <LogIn size={15} />
            )}
            <span>Check In Now</span>
          </button>
        </div>
      )}

      {/* Attendance Log Table */}
      <div className="bg-white border border-[#292940] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#292940] flex justify-between items-center bg-[#0B0B12]">
          <h2 className="text-sm font-bold text-[#11111F]">Session Attendance History</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#6366F1]" size={32} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-[#A1A1AA] space-y-3">
            <CalendarCheck size={36} className="mx-auto text-stone-600" />
            <p className="font-semibold text-sm">No session attendance records found yet.</p>
            <p className="text-xs text-gray-400">Book and attend your first online trainer session to view check-in history.</p>
            <Link
              to="/member/find-trainers"
              className="inline-block mt-2 px-4 py-2 bg-[#6366F1] text-white rounded-xl text-xs font-bold hover:bg-[#4F46E5] transition"
            >
              Book Trainer Session
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#292940]">
            {sessions.map((session) => {
              const status = session.attendanceStatus || (session.status === 'Completed' ? 'Present' : session.status);
              const checkedIn = Boolean(session.checkInTime);
              const checkedOut = Boolean(session.checkOutTime);
              const isCheckingIn = actionLoading === session._id + '-checkin';
              const isCheckingOut = actionLoading === session._id + '-checkout';

              return (
                <div
                  key={session._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center font-bold text-sm shrink-0">
                      {session.mode === 'Online' ? <Video size={18} /> : <Dumbbell size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#11111F]">
                        {session.trainerId?.name || 'Assigned Trainer'}
                      </p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">
                        {session.date} &bull; {session.startTime} - {session.endTime} ({session.mode})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {session.checkInTime && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <LogIn size={12} className="text-emerald-700" />
                        <span>In: {new Date(session.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    )}

                    {session.checkOutTime && (
                      <span className="text-xs font-bold text-blue-800 bg-blue-100/70 border border-blue-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <LogOut size={12} className="text-blue-700" />
                        <span>Out: {new Date(session.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    )}

                    {/* Check In Action Button */}
                    {!checkedIn && (
                      <button
                        type="button"
                        onClick={() => handleCheckIn(session._id)}
                        disabled={isCheckingIn}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isCheckingIn ? <Loader2 size={13} className="animate-spin" /> : <LogIn size={13} />}
                        <span>Check In</span>
                      </button>
                    )}

                    {/* Check Out Action Button */}
                    {checkedIn && !checkedOut && (
                      <button
                        type="button"
                        onClick={() => handleCheckOut(session._id)}
                        disabled={isCheckingOut}
                        className="px-3 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isCheckingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                        <span>Check Out</span>
                      </button>
                    )}

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        status === 'Present' || status === 'Completed'
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : status === 'Self-Learning'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : status === 'Late'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : status === 'Absent'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300'
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