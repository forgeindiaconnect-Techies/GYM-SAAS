import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import MemberTrainingTabs from '../../components/Member/MemberTrainingTabs';
import {
  Video, Clock, Calendar, AlertTriangle,
  Play, LogIn, LogOut, RefreshCw, BookOpen, ChevronRight,
  User, Star, Loader2, Wifi, Info
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  Pending:        { label: 'Pending',       color: 'text-yellow-700', bg: 'bg-yellow-50',  border: 'border-yellow-200' },
  'Awaiting Payment': { label: 'Awaiting Payment', color: 'text-[#2DD4BF]', bg: 'bg-[#1B2728]', border: 'border-[#2A3A3A]' },
  Confirmed:      { label: 'Confirmed',     color: 'text-[#2DD4BF]',   bg: 'bg-[#1B2728]',    border: 'border-[#2A3A3A]' },
  Upcoming:       { label: 'Upcoming',      color: 'text-indigo-700', bg: 'bg-indigo-50',  border: 'border-indigo-200' },
  'In Progress':  { label: 'Live Now',      color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200' },
  Completed:      { label: 'Completed',     color: 'text-[#C1D0D0]',   bg: 'bg-[#1B2728]',   border: 'border-[#2A3A3A]' },
  Cancelled:      { label: 'Cancelled',     color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200' },
  'Reschedule Requested': { label: 'Reschedule Req.', color: 'text-[#2DD4BF]', bg: 'bg-[#0E1415]', border: 'border-[#2A3A3A]' },
  Rescheduled:    { label: 'Rescheduled',   color: 'text-[#2DD4BF]',   bg: 'bg-[#1B2728]',    border: 'border-[#2A3A3A]' },
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
      <Loader2 className="animate-spin text-[#2DD4BF]" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <MemberTrainingTabs />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-xl flex items-center justify-center shadow-lg">
            <Video size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#F5FAFA]">Online Sessions</h1>
            <p className="text-sm text-[#9AAEAE]">Join, check-in and manage your online training sessions</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/member/find-trainers')}
          className="flex items-center space-x-2 px-4 py-2 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl font-semibold text-sm hover:bg-[#5EEAD4] transition-colors shadow"
        >
          <span>Book Session</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Live Session Banner */}
      {liveSessions.length > 0 && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-2xl p-5 text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#141D1E]/20 rounded-xl flex items-center justify-center animate-pulse">
              <Wifi size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-lg">Session is LIVE!</p>
              <p className="text-green-100 text-sm">{liveSessions[0]?.trainerId?.name || 'Your trainer'} is waiting for you</p>
            </div>
          </div>
          <button
            onClick={() => handleJoinMeeting(liveSessions[0])}
            className="bg-[#141D1E] text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow flex items-center space-x-2"
          >
            <Play size={18} />
            <span>Join Now</span>
          </button>
        </div>
      )}

      {/* Sessions List */}
      {allSessions.length === 0 ? (
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-[#0E1415] rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={28} className="text-[#9AAEAE]" />
          </div>
          <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">No Online Sessions</h3>
          <p className="text-[#9AAEAE] text-sm mb-5">
            Book an online trainer to get started with live video training sessions.
          </p>
          <button
            onClick={() => navigate('/member/find-trainers')}
            className="px-6 py-2.5 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl font-semibold text-sm hover:bg-[#5EEAD4] transition-colors"
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
              <div key={session._id} className={`bg-[#141D1E] border rounded-2xl p-5 shadow-sm ${isLive ? 'border-green-400 shadow-teal-900/10' : 'border-[#2A3A3A]'}`}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  {/* Trainer info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-full flex items-center justify-center text-[#06201D] font-bold font-bold text-sm shadow">
                      {trainer?.name?.[0] || <User size={18} />}
                    </div>
                    <div>
                      <p className="font-semibold text-[#F5FAFA]">{trainer?.name || 'Trainer'}</p>
                      <p className="text-xs text-[#9AAEAE]">{trainer?.specialization || 'Fitness Trainer'}</p>
                    </div>
                  </div>
                  {/* Status badge */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${sc.color} ${sc.bg} ${sc.border} ${isLive ? 'animate-pulse' : ''}`}>
                    {isLive && '● '}{sc.label}
                  </span>
                </div>

                {/* Session Details */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2 text-sm text-[#9AAEAE]">
                    <Calendar size={14} className="text-[#2DD4BF]" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[#9AAEAE]">
                    <Clock size={14} className="text-[#2DD4BF]" />
                    <span>{session.startTime} – {session.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[#9AAEAE]">
                    <Video size={14} className="text-[#2DD4BF]" />
                    <span>{session.duration} min</span>
                  </div>
                  {session.attendanceStatus && (
                    <div className={`flex items-center space-x-2 text-xs font-semibold px-2 py-1 rounded-lg ${
                      session.attendanceStatus === 'Present' ? 'bg-green-50 text-green-700' :
                      session.attendanceStatus === 'Absent' ? 'bg-red-50 text-red-700' :
                      session.attendanceStatus === 'Late' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-[#1B2728] text-[#2DD4BF]'
                    }`}>
                      <span>{session.attendanceStatus}</span>
                    </div>
                  )}
                </div>

                {/* Check-in / Checkout timeline for attended sessions */}
                {(checkedIn || checkedOut) && (
                  <div className="mt-4 flex items-center space-x-4 text-xs text-[#9AAEAE] bg-[#0E1415] rounded-xl p-3">
                    <div className="flex items-center space-x-1.5">
                      <LogIn size={13} className="text-green-600" />
                      <span>Check-in: <strong className="text-[#F5FAFA]">{session.checkInTime ? new Date(session.checkInTime).toLocaleTimeString() : '—'}</strong></span>
                    </div>
                    {checkedOut && (
                      <div className="flex items-center space-x-1.5">
                        <LogOut size={13} className="text-[#2DD4BF]" />
                        <span>Check-out: <strong className="text-[#F5FAFA]">{new Date(session.checkOutTime).toLocaleTimeString()}</strong></span>
                      </div>
                    )}
                    {session.actualDuration && (
                      <div className="flex items-center space-x-1.5">
                        <Clock size={13} className="text-[#2DD4BF]" />
                        <span>Duration: <strong className="text-[#F5FAFA]">{session.actualDuration} min</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Session Notes (if trainer submitted) */}
                {session.sessionNotes?.exercisesCompleted && (
                  <div className="mt-3 bg-[#1B2728] border border-[#2A3A3A] rounded-xl p-3 text-sm">
                    <p className="font-semibold text-[#2DD4BF] mb-1 flex items-center space-x-1.5">
                      <Info size={14} /><span>Trainer Notes</span>
                    </p>
                    <p className="text-[#2DD4BF]">{session.sessionNotes.exercisesCompleted}</p>
                    {session.sessionNotes.nextSessionFocus && (
                      <p className="text-[#2DD4BF] mt-1 text-xs">Next focus: {session.sessionNotes.nextSessionFocus}</p>
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
                        className="flex items-center space-x-2 px-4 py-2 bg-[#141D1E] border border-[#2A3A3A] text-[#9AAEAE] rounded-xl font-semibold text-sm hover:bg-[#0E1415] transition-colors disabled:opacity-50"
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
                      className="flex items-center space-x-2 px-4 py-2 bg-[#1B2728] border border-[#2A3A3A] text-[#2DD4BF] rounded-xl font-semibold text-sm hover:bg-[#1B2728] transition-colors"
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
                      className="flex items-center space-x-2 px-4 py-2 bg-[#141D1E] border border-[#2A3A3A] text-[#9AAEAE] rounded-xl font-semibold text-sm hover:bg-[#0E1415] transition-colors"
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
          <div className="bg-[#141D1E] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-[#1B2728] rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-[#2DD4BF]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F5FAFA]">Missed Session</h3>
                <p className="text-sm text-[#9AAEAE]">What would you like to do?</p>
              </div>
            </div>
            <p className="text-sm text-[#9AAEAE] mb-5 bg-[#1B2728] border border-[#2A3A3A] rounded-xl p-3">
              Your session on <strong>{missedModal.date}</strong> at <strong>{missedModal.startTime}</strong> was missed. Choose an option below.
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { navigate('/member/bookings'); setMissedModal(null); }}
                className="flex items-center space-x-3 p-4 border-2 border-[#2A3A3A] bg-[#1B2728] rounded-xl hover:border-[#2DD4BF] transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#2DD4BF] rounded-xl flex items-center justify-center shrink-0">
                  <RefreshCw size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#2DD4BF]">Reschedule Session</p>
                  <p className="text-xs text-[#2DD4BF]">Pick another available slot with your trainer</p>
                </div>
              </button>
              <button
                onClick={() => { navigate('/member/workout-videos'); setMissedModal(null); }}
                className="flex items-center space-x-3 p-4 border-2 border-[#2A3A3A] bg-[#1B2728] rounded-xl hover:border-[#2DD4BF] transition-colors text-left"
              >
                <div className="w-10 h-10 bg-[#2DD4BF] rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#2DD4BF]">Self-Learning Videos</p>
                  <p className="text-xs text-[#2DD4BF]">Watch trainer-assigned workout videos</p>
                </div>
              </button>
            </div>
            <button onClick={() => setMissedModal(null)} className="mt-4 w-full py-2.5 text-sm text-[#9AAEAE] hover:text-[#FFFFFF] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141D1E] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-[#F5FAFA] mb-1">Rate Your Session</h3>
            <p className="text-sm text-[#9AAEAE] mb-5">How was your session with <strong>{ratingModal.trainerId?.name || 'your trainer'}</strong>?</p>
            {/* Star rating */}
            <div className="flex items-center justify-center space-x-2 mb-5">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setRating(n)} className="transition-transform hover:scale-110">
                  <Star size={36} className={n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-[#9AAEAE]'} />
                </button>
              ))}
            </div>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Write a review (optional)..."
              rows={3}
              className="w-full border border-[#2A3A3A] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]/30 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRatingModal(null)} className="flex-1 py-2.5 border border-[#2A3A3A] rounded-xl text-[#9AAEAE] font-semibold text-sm hover:bg-[#0E1415] transition-colors">
                Skip
              </button>
              <button
                onClick={handleRateSession}
                disabled={ratingSubmitting}
                className="flex-1 py-2.5 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl font-semibold text-sm hover:bg-[#5EEAD4] transition-colors disabled:opacity-50 flex items-center justify-center"
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
