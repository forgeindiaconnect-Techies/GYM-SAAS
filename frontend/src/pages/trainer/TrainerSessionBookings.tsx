import { useState, useEffect, useCallback } from 'react';
import {
  Clock, Calendar as CalendarIcon, Video, Loader2, CheckCircle2,
  X, AlertTriangle, Users, RefreshCw, Filter, FileText
} from 'lucide-react';
import api from '../../utils/api';

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected'];

const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Completed: 'bg-blue-100 text-blue-800 border-blue-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
  Rejected: 'bg-rose-100 text-rose-700 border-rose-200',
};

const MODE_BADGE: Record<string, string> = {
  Online: 'bg-blue-50 text-blue-700 border-blue-200',
  Offline: 'bg-orange-50 text-orange-700 border-orange-200',
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Date TBD';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

const normalizeStatus = (status: string) => {
  if (['Confirmed', 'Upcoming', 'Approved'].includes(status)) return 'Approved';
  if (['Cancelled', 'Refunded', 'Refund Pending'].includes(status)) return 'Cancelled';
  return status;
};

const TrainerSessionBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [notesModal, setNotesModal] = useState<any | null>(null);
  const [notesForm, setNotesForm] = useState({
    exercisesCompleted: '',
    customerPerformance: 'Good',
    problemsNoticed: '',
    dietRecommendations: '',
    nextSessionFocus: '',
  });

  const fetchBookings = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await api.get('/trainer-sessions/trainer');
      if (res.data.success) {
        const sorted = (res.data.sessions || []).sort((a: any, b: any) =>
          new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
        );
        setBookings(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id + '-approve');
      await api.post(`/trainer-sessions/${id}/accept`);
      await fetchBookings(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      setActionLoading(rejectModal._id + '-reject');
      await api.post(`/trainer-sessions/${rejectModal._id}/reject`, {
        reason: rejectReason.trim() || 'Trainer unavailable at this time',
      });
      setRejectModal(null);
      setRejectReason('');
      await fetchBookings(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;
    try {
      setActionLoading(notesModal._id + '-notes');
      await api.post(`/trainer-sessions/${notesModal._id}/notes`, notesForm);
      setNotesModal(null);
      await fetchBookings(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save notes');
    } finally {
      setActionLoading(null);
    }
  };

  const openNotesModal = (booking: any) => {
    setNotesModal(booking);
    setNotesForm({
      exercisesCompleted: booking.sessionNotes?.exercisesCompleted || '',
      customerPerformance: booking.sessionNotes?.customerPerformance || 'Good',
      problemsNoticed: booking.sessionNotes?.problemsNoticed || '',
      dietRecommendations: booking.sessionNotes?.dietRecommendations || '',
      nextSessionFocus: booking.sessionNotes?.nextSessionFocus || '',
    });
  };

  const filtered = bookings.filter(b =>
    filter === 'All' ? true : normalizeStatus(b.status) === filter
  );

  const counts: Record<string, number> = { All: bookings.length };
  STATUS_FILTERS.slice(1).forEach(f => {
    counts[f] = bookings.filter(b => normalizeStatus(b.status) === f).length;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Session Bookings</h1>
          <p className="text-[#455250] mt-1 text-sm">Manage customer booking requests  -  approve or reject incoming sessions.</p>
        </div>
        <button onClick={() => fetchBookings(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#164A4A] border border-[#D3DFDA] rounded-xl hover:bg-[#F1F5F3] transition-colors disabled:opacity-50 self-start sm:self-auto">
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-[#F0F7F4] border border-[#B8D8CE] rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 bg-[#164A4A]/10 rounded-xl shrink-0">
          <Filter size={16} className="text-[#164A4A]" />
        </div>
        <div className="text-sm text-[#455250]">
          <span className="font-bold text-[#202828]">Workflow: </span>
          Customer books ? <span className="font-bold text-amber-700">Pending</span> ? You{' '}
          <span className="font-bold text-emerald-700">Approve</span> or <span className="font-bold text-rose-700">Reject</span> ?
          Approved online bookings appear automatically in <span className="font-bold text-blue-700">Online Sessions</span>.
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border ${
              filter === f ? 'bg-[#164A4A] text-white border-[#164A4A] shadow-sm' : 'bg-white text-[#455250] border-[#D3DFDA] hover:bg-[#F1F5F3]'}`}>
            {f}
            {(counts[f] || 0) > 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                filter === f ? 'bg-white/25 text-white' : 'bg-[#F1F5F3] text-[#455250]'}`}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-[#164A4A]" size={40} />
          <p className="text-[#455250] text-sm font-medium">Loading bookings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-16 text-center flex flex-col items-center gap-3 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F5F3] flex items-center justify-center">
            <CalendarIcon size={32} className="text-[#A8ADA9]" />
          </div>
          <h3 className="text-xl font-bold text-[#202828]">No {filter === 'All' ? '' : filter.toLowerCase()} bookings</h3>
          <p className="text-[#455250] text-sm">
            {filter === 'Pending' ? 'No new booking requests waiting for your approval.' : 'No sessions match this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(booking => {
            const normStatus = normalizeStatus(booking.status);
            const clientName = booking.customerId
              ? `${booking.customerId.firstName} ${booking.customerId.lastName}`.trim()
              : 'Unknown Customer';
            const isApprovingThis = actionLoading === booking._id + '-approve';
            const isRejectingThis = actionLoading === booking._id + '-reject';
            const isDoingAction = isApprovingThis || isRejectingThis;

            return (
              <div key={booking._id}
                className="bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#164A4A]/30 transition-all flex flex-col relative">
                <div className={`h-1 w-full ${
                  normStatus === 'Pending' ? 'bg-amber-400' :
                  normStatus === 'Approved' ? 'bg-emerald-500' :
                  normStatus === 'Completed' ? 'bg-blue-500' :
                  normStatus === 'Rejected' ? 'bg-rose-500' : 'bg-red-500'}`} />
                {isDoingAction && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
                    <Loader2 className="animate-spin text-[#164A4A]" size={32} />
                  </div>
                )}
                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#164A4A]/10 border border-[#D3DFDA] flex items-center justify-center shrink-0 overflow-hidden">
                      {booking.customerId?.profilePhoto
                        ? <img src={booking.customerId.profilePhoto} alt="" className="w-full h-full object-cover" />
                        : <span className="font-bold text-[#164A4A] text-base">{booking.customerId?.firstName?.charAt(0) || 'U'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#202828] truncate">{clientName}</h3>
                      <p className="text-xs text-[#455250] truncate">{booking.customerId?.email || ''}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_BADGE[normStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {normStatus}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${MODE_BADGE[booking.mode] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {booking.mode === 'Online' ? '?? Online' : '??? In-Gym'}
                    </span>
                    {booking.bookingId && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#F1F5F3] text-[#455250] border border-[#D3DFDA]">
                        #{booking.bookingId}
                      </span>
                    )}
                  </div>

                  <div className="bg-[#F8FAFC] border border-[#E8EAED] rounded-xl p-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={14} className="text-[#164A4A] shrink-0" />
                      <span className="font-semibold text-[#202828]">{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#455250]">
                      <Clock size={14} className="text-[#164A4A] shrink-0" />
                      <span className="font-medium">{booking.startTime}   {booking.endTime}</span>
                    </div>
                    {booking.duration && (
                      <div className="flex items-center gap-2 text-[#455250]">
                        <Users size={14} className="text-[#164A4A] shrink-0" />
                        <span className="font-medium">{booking.duration} min session</span>
                      </div>
                    )}
                  </div>

                  {normStatus === 'Approved' && booking.mode === 'Online' && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs font-semibold text-blue-700">
                      <Video size={13} />
                      <span className="truncate">{booking.meetingLink || `meet.jit.si/aigym-${booking._id?.slice(-6)}`}</span>
                    </div>
                  )}

                  {normStatus === 'Rejected' && booking.rejectionReason && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-xs text-rose-700">
                      <span className="font-bold">Reason: </span>{booking.rejectionReason}
                    </div>
                  )}

                  {booking.sessionNotes?.exercisesCompleted && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#455250]">
                      <span className="font-bold text-[#202828]">Notes: </span>
                      <span className="line-clamp-2">{booking.sessionNotes.exercisesCompleted}</span>
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-t border-[#D3DFDA] space-y-2">
                    {booking.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(booking._id)} disabled={isDoingAction}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50">
                          {isApprovingThis ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Approve
                        </button>
                        <button onClick={() => { setRejectModal(booking); setRejectReason(''); }} disabled={isDoingAction}
                          className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50">
                          <X size={14} />
                          Reject
                        </button>
                      </div>
                    )}
                    {normStatus === 'Approved' && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={13} /> Booking Approved
                        </div>
                        <button onClick={() => openNotesModal(booking)}
                          className="px-3 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-xs font-semibold text-[#455250] hover:bg-[#E8E5DA] transition-colors flex items-center gap-1">
                          <FileText size={13} /> Notes
                        </button>
                      </div>
                    )}
                    {normStatus === 'Completed' && (
                      <div className="flex gap-2">
                        <div className="flex-1 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={13} /> Completed
                        </div>
                        <button onClick={() => openNotesModal(booking)}
                          className="px-3 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-xs font-semibold text-[#455250] hover:bg-[#E8E5DA] transition-colors flex items-center gap-1">
                          <FileText size={13} /> Notes
                        </button>
                      </div>
                    )}
                    {(normStatus === 'Cancelled' || normStatus === 'Rejected') && (
                      <div className="py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 text-center">
                        Session {normStatus}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#D3DFDA] overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-rose-600" />
                </div>
                <h3 className="text-base font-bold text-rose-800">Decline Booking Request</h3>
              </div>
              <button onClick={() => setRejectModal(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#455250]">
                Declining the booking from <span className="font-bold text-[#202828]">{rejectModal.customerId?.firstName} {rejectModal.customerId?.lastName}</span> scheduled on <span className="font-semibold">{formatDate(rejectModal.date)}</span> at <span className="font-semibold">{rejectModal.startTime}</span>.
              </p>
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1.5">Reason <span className="font-normal text-gray-400">(optional)</span></label>
                <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. Scheduling conflict, fully booked at this time..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-rose-400 focus:outline-none resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setRejectModal(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleReject} disabled={actionLoading === rejectModal._id + '-reject'}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                  {actionLoading === rejectModal._id + '-reject' && <Loader2 size={13} className="animate-spin" />}
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D3DFDA]">
            <div className="sticky top-0 bg-white border-b border-[#D3DFDA] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-bold text-[#202828]">Session Notes</h3>
                <p className="text-xs text-[#455250]">{notesModal.customerId?.firstName} {notesModal.customerId?.lastName}   {formatDate(notesModal.date)}</p>
              </div>
              <button onClick={() => setNotesModal(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Exercises Completed', key: 'exercisesCompleted', type: 'textarea', placeholder: 'e.g. Dumbbell bench press 4x10, Incline pushups 3x12' },
                { label: 'Problems / Form Issues', key: 'problemsNoticed', placeholder: 'e.g. Knee valgus on heavy squats' },
                { label: 'Diet Recommendations', key: 'dietRecommendations', placeholder: 'e.g. Increase post-workout protein to 35g' },
                { label: 'Next Session Focus', key: 'nextSessionFocus', placeholder: 'e.g. Core stabilization' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-[#455250] mb-1.5">{field.label}</label>
                  {field.type === 'textarea'
                    ? <textarea rows={2} value={(notesForm as any)[field.key]} onChange={e => setNotesForm({ ...notesForm, [field.key]: e.target.value })} placeholder={field.placeholder} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#164A4A] focus:outline-none resize-none" />
                    : <input type="text" value={(notesForm as any)[field.key]} onChange={e => setNotesForm({ ...notesForm, [field.key]: e.target.value })} placeholder={field.placeholder} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#164A4A] focus:outline-none" />}
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1.5">Customer Performance</label>
                <select value={notesForm.customerPerformance} onChange={e => setNotesForm({ ...notesForm, customerPerformance: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#164A4A] focus:outline-none">
                  {['Excellent', 'Good', 'Average', 'Needs Improvement'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button onClick={() => setNotesModal(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveNotes} disabled={actionLoading === notesModal._id + '-notes'}
                  className="px-5 py-2.5 bg-[#164A4A] text-white rounded-xl text-sm font-bold hover:bg-[#C6A77D] transition-colors flex items-center gap-2 disabled:opacity-50">
                  {actionLoading === notesModal._id + '-notes' && <Loader2 size={13} className="animate-spin" />}
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

export default TrainerSessionBookings;
