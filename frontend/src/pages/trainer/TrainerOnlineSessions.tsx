import { useState, useEffect, useCallback } from 'react';
import {
  Video, Play, Clock, Calendar, CheckCircle2, Loader2,
  FileText, RefreshCw, Wifi, Timer, Users
} from 'lucide-react';
import api from '../../utils/api';

type TabType = 'upcoming' | 'live' | 'completed';

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Date TBD';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
};

const formatShortDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getCountdown = (dateStr: string, startTime: string): string => {
  try {
    const [hourRaw, rest] = startTime.split(':');
    const [minRaw, meridiem] = rest ? rest.split(' ') : ['00', 'AM'];
    let hour = parseInt(hourRaw);
    const min = parseInt(minRaw || '0');
    if (meridiem?.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (meridiem?.toUpperCase() === 'AM' && hour === 12) hour = 0;

    const sessionDate = new Date(dateStr.split('T')[0]);
    sessionDate.setHours(hour, min, 0, 0);

    const now = new Date();
    const diff = sessionDate.getTime() - now.getTime();
    if (diff <= 0) return 'Starting now';

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);

    if (days > 0) return `${days}d ${hours}h away`;
    if (hours > 0) return `${hours}h ${mins}m away`;
    return `${mins} min away`;
  } catch {
    return '';
  }
};

const isSessionLive = (dateStr: string, startTime: string, endTime: string): boolean => {
  try {
    const parseTime = (t: string) => {
      const match = t?.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const mer = match[3].toUpperCase();
      if (mer === 'PM' && h !== 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    const now = new Date();
    const today = new Date(dateStr.split('T')[0]);
    today.setHours(0, 0, 0, 0);
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);
    if (today.getTime() !== todayCheck.getTime()) return false;

    const nowMins = now.getHours() * 60 + now.getMinutes();
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    return nowMins >= start && nowMins <= end;
  } catch {
    return false;
  }
};

const TrainerOnlineSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [notesModal, setNotesModal] = useState<any | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesForm, setNotesForm] = useState({
    exercisesCompleted: '',
    customerPerformance: 'Good',
    problemsNoticed: '',
    dietRecommendations: '',
    nextSessionFocus: '',
  });

  const fetchSessions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await api.get('/trainer-sessions/trainer');
      if (res.data.success) {
        // Only approved/confirmed online sessions
        const approvedOnline = (res.data.sessions || []).filter(
          (s: any) => s.mode === 'Online' && ['Confirmed', 'Approved', 'In Progress', 'Upcoming', 'Completed'].includes(s.status)
        );
        setSessions(approvedOnline);
      }
    } catch (err) {
      console.error('Failed to load online sessions', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleComplete = async (id: string) => {
    if (!window.confirm('Mark this session as Completed?')) return;
    try {
      setCompletingId(id);
      await api.patch(`/trainer-sessions/${id}`, { status: 'Completed', attendanceStatus: 'Present' });
      await fetchSessions(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete session');
    } finally {
      setCompletingId(null);
    }
  };

  const openNotes = (session: any) => {
    setNotesModal(session);
    setNotesForm({
      exercisesCompleted: session.sessionNotes?.exercisesCompleted || '',
      customerPerformance: session.sessionNotes?.customerPerformance || 'Good',
      problemsNoticed: session.sessionNotes?.problemsNoticed || '',
      dietRecommendations: session.sessionNotes?.dietRecommendations || '',
      nextSessionFocus: session.sessionNotes?.nextSessionFocus || '',
    });
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;
    try {
      setSavingNotes(true);
      await api.post(`/trainer-sessions/${notesModal._id}/notes`, notesForm);
      setNotesModal(null);
      await fetchSessions(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // Categorize sessions
  const upcoming = sessions.filter(s => {
    if (s.status === 'Completed') return false;
    return !isSessionLive(s.date, s.startTime, s.endTime);
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const live = sessions.filter(s =>
    s.status !== 'Completed' && isSessionLive(s.date, s.startTime, s.endTime)
  );

  const completed = sessions.filter(s => s.status === 'Completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tabSessions: Record<TabType, any[]> = { upcoming, live, completed };
  const displaySessions = tabSessions[activeTab];

  const tabs: { id: TabType; label: string; count: number; color: string }[] = [
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length, color: 'text-emerald-700 bg-emerald-100' },
    { id: 'live', label: 'Live Now', count: live.length, color: 'text-red-700 bg-red-100' },
    { id: 'completed', label: 'Completed', count: completed.length, color: 'text-blue-700 bg-blue-100' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Online Sessions</h1>
          <p className="text-[#78716C] mt-1 text-sm">
            Conduct your approved online training sessions via Jitsi Meet.
          </p>
        </div>
        <button onClick={() => fetchSessions(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#F97316] border border-[#E7E5E4] rounded-xl hover:bg-[#FFFDF8] transition-colors disabled:opacity-50 self-start sm:self-auto">
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Workflow Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-xl shrink-0">
          <Video size={16} className="text-blue-700" />
        </div>
        <div className="text-sm text-blue-800">
          <span className="font-bold">Only approved online bookings appear here.</span>{' '}
          To approve a new customer booking, go to <span className="font-bold">Session Bookings</span>.
          Once approved, the session will automatically appear in this list.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border ${
              activeTab === tab.id ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm' : 'bg-white text-[#78716C] border-[#E7E5E4] hover:bg-[#FFFDF8]'}`}>
            {tab.id === 'live' && tab.count > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                activeTab === tab.id ? 'bg-white/25 text-white' : tab.color}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-[#F97316]" size={40} />
          <p className="text-[#78716C] text-sm">Loading sessions...</p>
        </div>
      ) : displaySessions.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-16 text-center flex flex-col items-center gap-3 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#FFFDF8] flex items-center justify-center">
            {activeTab === 'live' ? <Wifi size={32} className="text-[#78716C]" /> : <Video size={32} className="text-[#78716C]" />}
          </div>
          <h3 className="text-xl font-bold text-[#292524]">
            {activeTab === 'live' ? 'No Live Sessions Right Now' : activeTab === 'upcoming' ? 'No Upcoming Sessions' : 'No Completed Sessions'}
          </h3>
          <p className="text-[#78716C] text-sm max-w-xs">
            {activeTab === 'upcoming'
              ? 'Approved online bookings will appear here. Go to Session Bookings to approve pending requests.'
              : activeTab === 'live'
              ? 'Sessions that are scheduled for right now will appear here.'
              : 'Your completed sessions will appear here for review.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displaySessions.map(session => {
            const clientName = session.customerId
              ? `${session.customerId.firstName} ${session.customerId.lastName}`.trim()
              : 'Customer';
            const isLive = isSessionLive(session.date, session.startTime, session.endTime);
            const countdown = activeTab === 'upcoming' ? getCountdown(session.date, session.startTime) : '';
            const jitsiLink = session.meetingLink || `https://meet.jit.si/aigym-${session.bookingId || session._id?.slice(-8)}`;

            return (
              <div key={session._id}
                className={`bg-white border rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-md ${
                  isLive ? 'border-red-300 shadow-red-100 shadow-md' : 'border-[#E7E5E4] hover:border-[#F97316]/30'}`}>
                {/* Top accent */}
                <div className={`h-1 w-full ${isLive ? 'bg-red-500' : session.status === 'Completed' ? 'bg-blue-400' : 'bg-emerald-500'}`} />

                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* Live Indicator */}
                  {isLive && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                      <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Session is Live Now</span>
                    </div>
                  )}

                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#F97316]/10 border border-[#E7E5E4] flex items-center justify-center shrink-0 overflow-hidden">
                      {session.customerId?.profilePhoto
                        ? <img src={session.customerId.profilePhoto} alt="" className="w-full h-full object-cover" />
                        : <span className="font-bold text-[#F97316] text-base">{session.customerId?.firstName?.charAt(0) || 'C'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#292524] truncate">{clientName}</h3>
                      <p className="text-xs text-[#78716C] truncate">{session.customerId?.email || ''}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      isLive ? 'bg-red-100 text-red-800 border-red-200' :
                      session.status === 'Completed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                      {isLive ? 'Live' : session.status === 'Completed' ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>

                  {/* Booking ID */}
                  {session.bookingId && (
                    <p className="text-[10px] font-mono text-[#78716C] bg-[#F8FAFC] border border-[#E8EAED] rounded-lg px-2 py-1 w-fit">
                      Booking #{session.bookingId}
                    </p>
                  )}

                  {/* Date & Time */}
                  <div className="bg-[#F8FAFC] border border-[#E8EAED] rounded-xl p-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#F97316] shrink-0" />
                      <span className="font-semibold text-[#292524]">{formatDate(session.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#78716C]">
                      <Clock size={14} className="text-[#F97316] shrink-0" />
                      <span className="font-medium">{session.startTime}  {session.endTime}</span>
                    </div>
                    {session.duration && (
                      <div className="flex items-center gap-2 text-[#78716C]">
                        <Users size={14} className="text-[#F97316] shrink-0" />
                        <span className="font-medium">{session.duration} min</span>
                      </div>
                    )}
                  </div>

                  {/* Countdown */}
                  {countdown && countdown !== 'Starting now' && !isLive && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                      <Timer size={13} />
                      {countdown}
                    </div>
                  )}

                  {/* Jitsi Link */}
                  {session.status !== 'Completed' && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-700">
                      <Video size={12} />
                      <span className="truncate font-mono">{jitsiLink.replace('https://', '')}</span>
                    </div>
                  )}

                  {/* Rating & Review (completed) */}
                  {session.customerRating && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
                      <span className="font-bold">Rating: </span>
                      {'?'.repeat(session.customerRating)}{'?'.repeat(5 - session.customerRating)} {session.customerRating}/5
                      {session.customerReview && <p className="mt-1 italic">"{session.customerReview}"</p>}
                    </div>
                  )}

                  {/* Session notes snippet */}
                  {session.sessionNotes?.exercisesCompleted && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#78716C]">
                      <span className="font-bold text-[#292524]">Summary: </span>
                      <span className="line-clamp-2">{session.sessionNotes.exercisesCompleted}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-auto pt-3 border-t border-[#E7E5E4] space-y-2">
                    {session.status !== 'Completed' && (
                      <>
                        <a href={jitsiLink} target="_blank" rel="noreferrer"
                          className="w-full py-2.5 bg-[#F97316] hover:bg-[#0d3535] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow">
                          <Play size={14} />
                          {isLive ? 'Join Live Session' : 'Start / Join Session'}
                        </a>
                        <div className="flex gap-2">
                          <button onClick={() => handleComplete(session._id)} disabled={completingId === session._id}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50">
                            {completingId === session._id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            Mark Completed
                          </button>
                          <button onClick={() => openNotes(session)}
                            className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FED7AA] transition-colors flex items-center gap-1">
                            <FileText size={13} />
                            Notes
                          </button>
                        </div>
                      </>
                    )}
                    {session.status === 'Completed' && (
                      <div className="flex gap-2">
                        <div className="flex-1 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={13} /> Completed on {formatShortDate(session.date)}
                        </div>
                        <button onClick={() => openNotes(session)}
                          className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FED7AA] transition-colors flex items-center gap-1">
                          <FileText size={13} /> Notes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notes Modal */}
      {notesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E7E5E4]">
            <div className="sticky top-0 bg-white border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-bold text-[#292524]">Post-Session Notes</h3>
                <p className="text-xs text-[#78716C]">
                  {notesModal.customerId?.firstName} {notesModal.customerId?.lastName} · {formatDate(notesModal.date)}
                </p>
              </div>
              <button onClick={() => setNotesModal(null)} className="text-gray-400 hover:text-gray-600 p-1">?</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Exercises Completed', key: 'exercisesCompleted', type: 'textarea', placeholder: 'e.g. Dumbbell bench press 4x10, Incline pushups 3x12' },
                { label: 'Problems / Form Issues', key: 'problemsNoticed', placeholder: 'e.g. Knee valgus on heavy squats' },
                { label: 'Diet Recommendations', key: 'dietRecommendations', placeholder: 'e.g. Increase post-workout protein to 35g' },
                { label: 'Next Session Focus', key: 'nextSessionFocus', placeholder: 'e.g. Core stabilization and progressive overload' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-[#78716C] mb-1.5">{f.label}</label>
                  {f.type === 'textarea'
                    ? <textarea rows={2} value={(notesForm as any)[f.key]} onChange={e => setNotesForm({ ...notesForm, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#F97316] focus:outline-none resize-none" />
                    : <input type="text" value={(notesForm as any)[f.key]} onChange={e => setNotesForm({ ...notesForm, [f.key]: e.target.value })} placeholder={f.placeholder} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#F97316] focus:outline-none" />}
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-[#78716C] mb-1.5">Customer Performance</label>
                <select value={notesForm.customerPerformance} onChange={e => setNotesForm({ ...notesForm, customerPerformance: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#F97316] focus:outline-none">
                  {['Excellent', 'Good', 'Average', 'Needs Improvement'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setNotesModal(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveNotes} disabled={savingNotes}
                  className="px-5 py-2.5 bg-[#F97316] text-white rounded-xl text-sm font-bold hover:bg-[#EA580C] transition-colors flex items-center gap-2 disabled:opacity-50">
                  {savingNotes && <Loader2 size={13} className="animate-spin" />}
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerOnlineSessions;
