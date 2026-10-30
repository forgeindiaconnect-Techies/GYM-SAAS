import { useState, useEffect, useMemo, useRef } from 'react';
import {
  CalendarCheck, Dumbbell, Video, Loader2, LogIn, LogOut, Activity, CheckCircle2,
  Calendar, CalendarX
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

  // Calendar Date Filter State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const dateInputRef = useRef<HTMLInputElement>(null);

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

  // Filter sessions according to selectedDate:
  // User Requirement: "when i clicking anydate it will be showing to the attendance. for example today i am present means it will be showing to the attendance, incase i am absent means dont show anything"
  const displayedSessions = useMemo(() => {
    if (!selectedDate) return sessions;

    return sessions.filter((s) => {
      const isSameDate = s.date === selectedDate || s.date?.startsWith(selectedDate);
      const isPresent = s.attendanceStatus === 'Present' || s.status === 'Completed' || Boolean(s.checkInTime);
      return isSameDate && isPresent;
    });
  }, [sessions, selectedDate]);

  // Overall or filtered stats
  const totalSessions = selectedDate ? displayedSessions.length : sessions.length;
  const attendedCount = selectedDate
    ? displayedSessions.filter((s) => s.attendanceStatus === 'Present' || s.status === 'Completed' || Boolean(s.checkInTime)).length
    : sessions.filter((s) => s.attendanceStatus === 'Present' || s.status === 'Completed').length;
  const selfLearningCount = selectedDate
    ? displayedSessions.filter((s) => s.attendanceStatus === 'Self-Learning').length
    : sessions.filter((s) => s.attendanceStatus === 'Self-Learning').length;
  const lateCount = selectedDate
    ? displayedSessions.filter((s) => s.attendanceStatus === 'Late').length
    : sessions.filter((s) => s.attendanceStatus === 'Late').length;
  const missedCount = selectedDate
    ? (displayedSessions.length === 0 ? 1 : 0)
    : sessions.filter((s) => s.attendanceStatus === 'Absent').length;

  const attendanceScore =
    totalSessions > 0
      ? Math.round(((attendedCount + selfLearningCount + lateCount) / totalSessions) * 100)
      : selectedDate ? 0 : 100;

  const ongoingSession = sessions.find((s) => s.checkInTime && !s.checkOutTime);
  const nextEligibleSession = sessions.find(
    (s) => !s.checkInTime && s.status !== 'Cancelled' && s.status !== 'Rejected'
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#EA580C] via-[#F97316] to-[#EA580C] rounded-3xl p-6 md:p-8 text-[#FFFFFF] font-bold shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFFFF]/15 backdrop-blur-md rounded-full text-xs font-semibold text-[#FFFFFF]">
              <CalendarCheck size={13} />
              Session Attendance & Consistency
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-[#FFFFFF]">Attendance Record</h1>
            <p className="text-[#FFFFFF]/80 text-sm max-w-lg">
              Track your live online session check-ins, punctuality, and self-learning workout completions over time.
            </p>
          </div>

          <div className="bg-[#FFFFFF]/10 backdrop-blur-md border border-black/10 rounded-2xl p-5 text-center shrink-0 min-w-[200px]">
            <p className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">Overall Attendance</p>
            <p className="text-3xl font-black mt-1 text-[#FFFFFF]">{attendanceScore}%</p>
            <p className="text-xs text-[#FFFFFF]/70 mt-1">
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
              ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#EA580C]'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className={feedbackMsg.type === 'success' ? 'text-[#EA580C]' : 'text-rose-600'} />
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
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-[#64748B] font-medium uppercase tracking-wider">
            {selectedDate ? 'Booked on Date' : 'Total Booked'}
          </p>
          <p className="text-2xl font-bold text-[#111827] mt-1">{totalSessions}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-[#15803D] font-medium uppercase tracking-wider">Attended Live</p>
          <p className="text-2xl font-bold text-[#15803D] mt-1">{attendedCount}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-[#EA580C] font-medium uppercase tracking-wider">Self-Learning</p>
          <p className="text-2xl font-bold text-[#EA580C] mt-1">{selfLearningCount}</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm text-center">
          <p className="text-xs text-[#B91C1C] font-medium uppercase tracking-wider">Missed / Absent</p>
          <p className="text-2xl font-bold text-[#B91C1C] mt-1">{missedCount}</p>
        </div>
      </div>

      {/* Quick Active Check-In & Check-Out Action Bar */}
      {ongoingSession && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#C2410C] text-white font-bold flex items-center justify-center font-bold shadow-md shadow-emerald-900/10 shrink-0">
              <Activity size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C2410C] animate-ping" />
                <span className="text-xs font-black uppercase text-[#EA580C] tracking-wider">
                  Live Active Session Check-In
                </span>
              </div>
              <h3 className="font-extrabold text-[#111827] text-base mt-0.5">
                {ongoingSession.trainerId?.name || 'Personal Training Session'} ({ongoingSession.mode})
              </h3>
              <p className="text-xs text-[#EA580C] mt-0.5">
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
            className="px-5 py-2.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:opacity-95 text-[#FFFFFF] font-bold font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
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
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#C2410C] text-[#FFFFFF] font-bold flex items-center justify-center font-bold shadow-md shadow-orange-500/15 shrink-0">
              <LogIn size={22} />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase text-[#EA580C] tracking-wider block">
                Scheduled Training Session
              </span>
              <h3 className="font-extrabold text-[#111827] text-base mt-0.5">
                {nextEligibleSession.trainerId?.name || 'Assigned Trainer'} ({nextEligibleSession.mode})
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {nextEligibleSession.date} &bull; {nextEligibleSession.startTime} - {nextEligibleSession.endTime}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCheckIn(nextEligibleSession._id)}
            disabled={actionLoading === nextEligibleSession._id + '-checkin'}
            className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
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
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header & Calendar Date Picker */}
        <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFC]">
          <div>
            <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              <CalendarCheck size={16} className="text-[#EA580C]" />
              <span>Session Attendance History</span>
            </h2>
            {selectedDate ? (
              <p className="text-[11px] text-[#EA580C] mt-0.5 font-medium">
                Viewing date: {formatDateDisplay(selectedDate)}
              </p>
            ) : (
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Showing all session check-ins
              </p>
            )}
          </div>

          {/* Calendar Picker Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Today Button */}
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setSelectedDate(today);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                selectedDate === new Date().toISOString().split('T')[0]
                  ? 'bg-[#C2410C] text-white border-[#FDBA74] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0] hover:text-[#C2410C] hover:border-[#FDBA74]'
              }`}
            >
              Today
            </button>

            {/* Calendar Date Input */}
            <div className="relative inline-flex items-center">
              <Calendar size={14} className="absolute left-3 text-[#EA580C] pointer-events-none" />
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FDBA74] focus:border-[#FDBA74] text-[#111827] font-bold text-xs rounded-xl pl-9 pr-3 py-1.5 outline-none cursor-pointer shadow-xs transition-colors [color-scheme:dark]"
                title="Select any date to check attendance"
              />
            </div>

            {/* Clear / Show All Button */}
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#EA580C] bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FDBA74] rounded-xl transition cursor-pointer"
                title="Show all attendance history"
              >
                Show All
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#EA580C]" size={32} />
          </div>
        ) : displayedSessions.length === 0 ? (
          <div className="p-12 text-center text-[#64748B] space-y-3">
            {selectedDate ? (
              <>
                <CalendarX size={38} className="mx-auto text-[#64748B]/50" />
                <p className="font-semibold text-sm text-[#111827]">
                  No attendance record found for {formatDateDisplay(selectedDate)}
                </p>
                <p className="text-xs text-[#64748B]">
                  Status: Absent (no attendance or check-in recorded on this date).
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="inline-block mt-2 px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#FDBA74] text-[#EA580C] font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Show All Attendance History
                </button>
              </>
            ) : (
              <>
                <CalendarCheck size={36} className="mx-auto text-[#64748B]" />
                <p className="font-semibold text-sm">No session attendance records found yet.</p>
                <p className="text-xs text-[#64748B]">Book and attend your first online trainer session to view check-in history.</p>
                <Link
                  to="/member/find-trainers"
                  className="inline-block mt-2 px-4 py-2 bg-[#C2410C] text-white font-bold rounded-xl text-xs font-bold hover:bg-[#9A3412] transition"
                >
                  Book Trainer Session
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {displayedSessions.map((session) => {
              const status = session.attendanceStatus || (session.status === 'Completed' ? 'Present' : session.status);
              const checkedIn = Boolean(session.checkInTime);
              const checkedOut = Boolean(session.checkOutTime);
              const isCheckingIn = actionLoading === session._id + '-checkin';
              const isCheckingOut = actionLoading === session._id + '-checkout';

              return (
                <div
                  key={session._id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFF7ED] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-bold text-sm shrink-0">
                      {session.mode === 'Online' ? <Video size={18} /> : <Dumbbell size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#111827]">
                        {session.trainerId?.name || 'Assigned Trainer'}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {session.date} &bull; {session.startTime} - {session.endTime} ({session.mode})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {session.checkInTime && (
                      <span className="text-xs font-bold text-[#EA580C] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <LogIn size={12} className="text-[#EA580C]" />
                        <span>In: {new Date(session.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    )}

                    {session.checkOutTime && (
                      <span className="text-xs font-bold text-[#EA580C] bg-[#F8FAFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <LogOut size={12} className="text-[#EA580C]" />
                        <span>Out: {new Date(session.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    )}

                    {/* Check In Action Button */}
                    {!checkedIn && (
                      <button
                        type="button"
                        onClick={() => handleCheckIn(session._id)}
                        disabled={isCheckingIn}
                        className="px-3 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
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
                        className="px-3 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isCheckingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                        <span>Check Out</span>
                      </button>
                    )}

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        status === 'Present' || status === 'Completed'
                          ? 'bg-[#F8FAFC] text-[#EA580C] border-[#E2E8F0]'
                          : status === 'Self-Learning'
                          ? 'bg-[#F8FAFC] text-[#EA580C] border-[#E2E8F0]'
                          : status === 'Late'
                          ? 'bg-amber-50 text-[#B45309] border-amber-800/40'
                          : status === 'Absent'
                          ? 'bg-red-50 text-[#B91C1C] border-rose-800/40'
                          : 'bg-[#F8FAFC] text-[#111827] border-[#E2E8F0]'
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