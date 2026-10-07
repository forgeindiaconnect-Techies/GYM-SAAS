import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  Video, Clock, Calendar, AlertTriangle,
  Play, LogIn, LogOut, RefreshCw, BookOpen, ChevronRight,
  User, Star, Loader2, Wifi, Info
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Pending:        { label: 'Pending',       color: 'text-yellow-700', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
  'Awaiting Payment': { label: 'Awaiting Payment', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  Confirmed:      { label: 'Confirmed',     color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200' },
  Upcoming:       { label: 'Upcoming',      color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  'In Progress':  { label: 'Live Now',      color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200' },
  Completed:      { label: 'Completed',     color: 'text-gray-700',   bg: 'bg-gray-100',   border: 'border-gray-200' },
  Cancelled:      { label: 'Cancelled',     color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200' },
  'Reschedule Requested': { label: 'Reschedule Req.', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  Rescheduled:    { label: 'Rescheduled',   color: 'text-teal-700',   bg: 'bg-teal-50',    border: 'border-teal-200' },
};

const MemberOnlineSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [missedModal, setMissedModal] = useState<any>(null);
  const [ratingModal, setRatingModal] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-sessions/member');
      const onlineSessions = (res.data.sessions || []).filter((s: any) => s.mode === 'Online');
      setSessions(onlineSessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (sessionId: string) => {
    setActionLoading(sessionId + '-checkin');
    try {
      await api.post(`/trainer-sessions/${sessionId}/check-in`);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (sessionId: string) => {
    setActionLoading(sessionId + '-checkout');
    try {
      await api.post(`/trainer-sessions/${sessionId}/check-out`);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleJoinMeeting = (session: any) => {
    if (session.meetingLink) window.open(session.meetingLink, '_blank');
    else alert('Meeting link not available yet. Please wait for trainer to start.');
  };

  const handleRateSession = async () => {
    if (!ratingModal) return;
    setRatingSubmitting(true);
    try {
      await api.post(`/trainer-sessions/${ratingModal._id}/rate`, { rating, review });
      setRatingModal(null);
      setRating(5); setReview('');
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rating failed');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const now = new Date();
  const liveSessions = sessions.filter(s => s.status === 'In Progress');
  const allSessions = [...sessions].sort((a, b) => {
    if (a.status === 'In Progress') return -1;
    if (b.status === 'In Progress') return 1;
    return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime();
  });

  const isSessionMissable = (s: any) => {
    try {
      const sessionEnd = new Date(`${s.date}T${s.endTime}`);
      return now > sessionEnd && s.status === 'Confirmed' && !s.checkInTime;
    } catch { return false; }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="animate-spin text-[#F97316]" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center shadow-lg">
            <Video size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#292524]">Online Sessions</h1>
            <p className="text-sm text-[#78716C]">Join, check-in and manage your online training sessions</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/member/find-trainers')}
          className="flex items-center space-x-2 px-4 py-2 bg-[#F97316] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3535] transition-colors shadow"
        >
          <span>Book Session</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Live Session Banner */}
      {liveSessions.length > 0 && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-5 text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
              <Wifi size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">Session is LIVE!</p>
              <p className="text-green-100 text-sm">{liveSessions[0]?.trainerId?.name || 'Your trainer'} is waiting for you</p>
            </div>
          </div>
          <button
            onClick={() => handleJoinMeeting(liveSessions[0])}
            className="bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow flex items-center space-x-2"
          >
            <Play size={18} />
            <span>Join Now</span>
          </button>
        </div>
      )}

      {/* Sessions List */}
      {allSessions.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-[#FFFDF8] rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-[#78716C]" />
          </div>
          <h3 className="text-lg font-bold text-[#292524] mb-2">No Online Sessions</h3>
          <p className="text-[#78716C] text-sm mb-5">
            Book an online trainer to get started with live video training sessions.
          </p>
          <button
            onClick={() => navigate('/member/find-trainers')}
            className="px-6 py-2.5 bg-[#F97316] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3535] transition-colors"
          >
            Find Trainers
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {allSessions.map(session => {
            const sc = statusConfig[session.status] || statusConfig.Pending;
            const trainer = session.trainerId;
            const isLive = session.status === 'In Progress';
            const checkedIn = !!session.checkInTime;
            const checkedOut = !!session.checkOutTime;
            const missed = isSessionMissable(session);
            const alreadyRated = !!session.customerRating;

            return (
              <div key={session._id} className={`bg-white border rounded-2xl p-5 shadow-sm ${isLive ? 'border-green-400 shadow-orange-100' : 'border-[#E7E5E4]'}`}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  {/* Trainer info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                      {trainer?.name?.[0] || <User size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold text-[#292524]">{trainer?.name || 'Trainer'}</p>
                      <p className="text-xs text-[#78716C]">{trainer?.specialization || 'Fitness Trainer'}</p>
                    </div>
                  </div>
                  {/* Status badge */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${sc.color} ${sc.bg} ${sc.border} ${isLive ? 'animate-pulse' : ''}`}>
                    {isLive && '● '}{sc.label}
                  </span>
                </div>

                {/* Session Details */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2 text-sm text-[#78716C]">
                    <Calendar size={14} className="text-[#F97316]" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[#78716C]">
                    <Clock size={14} className="text-[#F97316]" />
                    <span>{session.startTime} – {session.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[#78716C]">
                    <Video size={14} className="text-[#F97316]" />
                    <span>{session.duration} min</span>
                  </div>
                  {session.attendanceStatus && (
                    <div className={`flex items-center space-x-2 text-xs font-semibold px-2 py-1 rounded-lg ${
                      session.attendanceStatus === 'Present' ? 'bg-green-50 text-green-700' :
                      session.attendanceStatus === 'Absent' ? 'bg-red-50 text-red-700' :
                      session.attendanceStatus === 'Late' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      <span>{session.attendanceStatus}</span>
                    </div>
                  )}
                </div>

                {/* Check-in / Checkout timeline for attended sessions */}
                {(checkedIn || checkedOut) && (
                  <div className="mt-4 flex items-center space-x-4 text-xs text-[#78716C] bg-[#F7FAF8] rounded-xl p-3">
                    <div className="flex items-center space-x-1.5">
                      <LogIn size={13} className="text-green-600" />
                      <span>Check-in: <strong className="text-[#292524]">{session.checkInTime ? new Date(session.checkInTime).toLocaleTimeString() : '—'}</strong></span>
                    </div>
                    {checkedOut && (
                      <div className="flex items-center space-x-1.5">
                        <LogOut size={13} className="text-blue-600" />
                        <span>Check-out: <strong className="text-[#292524]">{new Date(session.checkOutTime).toLocaleTimeString()}</strong></span>
                      </div>
                    )}
                    {session.actualDuration && (
                      <div className="flex items-center space-x-1.5">
                        <Clock size={13} className="text-purple-600" />
                        <span>Duration: <strong className="text-[#292524]">{session.actualDuration} min</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Session Notes (if trainer submitted) */}
                {session.sessionNotes?.exercisesCompleted && (
                  <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
                    <p className="font-semibold text-blue-800 mb-1 flex items-center space-x-1.5">
                      <Info size={14} /><span>Trainer Notes</span>
                    </p>
                    <p className="text-blue-700">{session.sessionNotes.exercisesCompleted}</p>
                    {session.sessionNotes.nextSessionFocus && (
                      <p className="text-blue-600 mt-1 text-xs">Next focus: {session.sessionNotes.nextSessionFocus}</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {/* JOIN MEETING (live session) */}
                  {isLive && !checkedIn && (
                    <button
                      onClick={() => handleCheckIn(session._id)}
                      disabled={actionLoading === session._id + '-checkin'}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === session._id + '-checkin' ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                      <span>Check In & Join</span>
                    </button>
                  )}
                  {isLive && checkedIn && !checkedOut && (
                    <>
                      <button
                        onClick={() => handleJoinMeeting(session)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
                      >
                        <Play size={14} />
                        <span>Rejoin Session</span>
                      </button>
                      <button
                        onClick={() => handleCheckOut(session._id)}
                        disabled={actionLoading === session._id + '-checkout'}
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#E7E5E4] text-[#78716C] rounded-xl font-semibold text-sm hover:bg-[#FFFDF8] transition-colors disabled:opacity-50"
                      >
                        {actionLoading === session._id + '-checkout' ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                        <span>Check Out</span>
                      </button>
                    </>
                  )}

                  {/* MISSED SESSION OPTIONS */}
                  {missed && (
                    <button
                      onClick={() => setMissedModal(session)}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-xl font-semibold text-sm hover:bg-orange-100 transition-colors"
                    >
                      <AlertTriangle size={14} />
                      <span>Missed Session — Options</span>
                    </button>
                  )}

                  {/* RATE SESSION */}
                  {session.status === 'Completed' && !alreadyRated && (
                    <button
                      onClick={() => { setRatingModal(session); setRating(5); setReview(''); }}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl font-semibold text-sm hover:bg-yellow-100 transition-colors"
                    >
                      <Star size={14} />
                      <span>Rate Session</span>
                    </button>
                  )}
                  {alreadyRated && (
                    <div className="flex items-center space-x-1.5 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span>You rated: {session.customerRating}/5</span>
                    </div>
                  )}

                  {/* VIEW AI PLAN */}
                  {(session.status === 'Confirmed' || session.status === 'Upcoming') && (
                    <button
                      onClick={() => navigate('/member/trainer-review')}
                      className="flex items-center space-x-2 px-4 py-2 bg-white border border-[#E7E5E4] text-[#78716C] rounded-xl font-semibold text-sm hover:bg-[#FFFDF8] transition-colors"
                    >
                      <BookOpen size={14} />
                      <span>View Plan</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Missed Session Modal */}
      {missedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#292524]">Missed Session</h3>
                <p className="text-sm text-[#78716C]">What would you like to do?</p>
              </div>
            </div>
            <p className="text-sm text-[#78716C] mb-5 bg-orange-50 border border-orange-100 rounded-xl p-3">
              Your session on <strong>{missedModal.date}</strong> at <strong>{missedModal.startTime}</strong> was missed. Choose an option below.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { navigate('/member/bookings'); setMissedModal(null); }}
                className="flex items-center space-x-3 p-4 border-2 border-blue-200 bg-blue-50 rounded-xl hover:border-blue-400 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <RefreshCw size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-blue-800">Reschedule Session</p>
                  <p className="text-xs text-blue-600">Pick another available slot with your trainer</p>
                </div>
              </button>
              <button
                onClick={() => { navigate('/member/workout-videos'); setMissedModal(null); }}
                className="flex items-center space-x-3 p-4 border-2 border-emerald-200 bg-emerald-50 rounded-xl hover:border-emerald-400 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-emerald-800">Self-Learning Videos</p>
                  <p className="text-xs text-emerald-600">Watch trainer-assigned workout videos</p>
                </div>
              </button>
            </div>
            <button onClick={() => setMissedModal(null)} className="mt-4 w-full py-2.5 text-sm text-[#78716C] hover:text-[#292524] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#292524] mb-1">Rate Your Session</h3>
            <p className="text-sm text-[#78716C] mb-5">How was your session with <strong>{ratingModal.trainerId?.name || 'your trainer'}</strong>?</p>
            {/* Star rating */}
            <div className="flex items-center justify-center space-x-2 mb-5">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} className="transition-transform hover:scale-110">
                  <Star size={36} className={n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Write a review (optional)..."
              rows={3}
              className="w-full border border-[#E7E5E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRatingModal(null)} className="flex-1 py-2.5 border border-[#E7E5E4] rounded-xl text-[#78716C] font-semibold text-sm hover:bg-[#FFFDF8] transition-colors">
                Skip
              </button>
              <button
                onClick={handleRateSession}
                disabled={ratingSubmitting}
                className="flex-1 py-2.5 bg-[#F97316] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3535] transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {ratingSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberOnlineSessions;
