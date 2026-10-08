import { useState, useEffect, useCallback } from 'react';
import {
  Clock, Calendar as CalendarIcon, Video, Loader2, CheckCircle2,
  X, AlertTriangle, Users, RefreshCw, Filter, FileText, LogOut, Eye, Star
} from 'lucide-react';
import api from '../../utils/api';
import TrainerSchedulingTabs from '../../components/Trainer/TrainerSchedulingTabs';

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected'];

const STATUS_BADGE: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
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
  const [detailModal, setDetailModal] = useState<any | null>(null);
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

  const handleCheckOut = async (id: string) => {
    try {
      setActionLoading(id + '-checkout');
      await api.post(`/trainer-sessions/${id}/check-out`);
      alert('Session checked out successfully!');
      await fetchBookings(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to check out session');
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
      <TrainerSchedulingTabs />
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Session Bookings</h1>
          <p className="text-[#78716C] mt-1 text-sm">Manage customer booking requests  -  approve or reject incoming sessions.</p>
        </div>
        <button onClick={() => fetchBookings(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#F97316] border border-[#E7E5E4] rounded-xl hover:bg-[#FFFDF8] transition-colors disabled:opacity-50 self-start sm:self-auto">
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-[#F0F7F4] border border-[#B8D8CE] rounded-2xl p-4 flex items-start gap-3">
        <div className="p-2 bg-[#F97316]/10 rounded-xl shrink-0">
          <Filter size={16} className="text-[#F97316]" />
        </div>
        <div className="text-sm text-[#78716C]">
          <span className="font-bold text-[#292524]">Workflow: </span>
          Customer books ? <span className="font-bold text-amber-700">Pending</span> ? You{' '}
          <span className="font-bold text-emerald-700">Approve</span> or <span className="font-bold text-rose-700">Reject</span> ?
          Approved online bookings appear automatically in <span className="font-bold text-blue-700">Online Sessions</span>.
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border ${
              filter === f ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm' : 'bg-white text-[#78716C] border-[#E7E5E4] hover:bg-[#FFFDF8]'}`}>
            {f}
            {(counts[f] || 0) > 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                filter === f ? 'bg-white/25 text-white' : 'bg-[#FFFDF8] text-[#78716C]'}`}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-[#F97316]" size={40} />
          <p className="text-[#78716C] text-sm font-medium">Loading bookings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-16 text-center flex flex-col items-center gap-3 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#FFFDF8] flex items-center justify-center">
            <CalendarIcon size={32} className="text-[#78716C]" />
          </div>
          <h3 className="text-xl font-bold text-[#292524]">No {filter === 'All' ? '' : filter.toLowerCase()} bookings</h3>
          <p className="text-[#78716C] text-sm">
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
                className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#F97316]/30 transition-all flex flex-col relative">
                <div className={`h-1 w-full ${
                  normStatus === 'Pending' ? 'bg-amber-400' :
                  normStatus === 'Approved' ? 'bg-emerald-500' :
                  normStatus === 'Completed' ? 'bg-blue-500' :
                  normStatus === 'Rejected' ? 'bg-rose-500' : 'bg-red-500'}`} />
                {isDoingAction && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
                    <Loader2 className="animate-spin text-[#F97316]" size={32} />
                  </div>
                )}
                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#F97316]/10 border border-[#E7E5E4] flex items-center justify-center shrink-0 overflow-hidden">
                      {booking.customerId?.profilePhoto
                        ? <img src={booking.customerId.profilePhoto} alt="" className="w-full h-full object-cover" />
                        : <span className="font-bold text-[#F97316] text-base">{booking.customerId?.firstName?.charAt(0) || 'U'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#292524] truncate">{clientName}</h3>
                      <p className="text-xs text-[#78716C] truncate">{booking.customerId?.email || ''}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${STATUS_BADGE[normStatus] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {normStatus}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${MODE_BADGE[booking.mode] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {booking.mode === 'Online' ? 'Online' : 'In-Gym'}
                    </span>
                    {booking.bookingId && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#FFFDF8] text-[#78716C] border border-[#E7E5E4]">
                        #{booking.bookingId}
                      </span>
                    )}
                  </div>

                  <div className="bg-[#F8FAFC] border border-[#E8EAED] rounded-xl p-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={14} className="text-[#F97316] shrink-0" />
                      <span className="font-semibold text-[#292524]">{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#78716C]">
                      <Clock size={14} className="text-[#F97316] shrink-0" />
                      <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
                    </div>
                    {booking.duration && (
                      <div className="flex items-center gap-2 text-[#78716C]">
                        <Users size={14} className="text-[#F97316] shrink-0" />
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
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#78716C]">
                      <span className="font-bold text-[#292524]">Notes: </span>
                      <span className="line-clamp-2">{booking.sessionNotes.exercisesCompleted}</span>
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-t border-[#E7E5E4] space-y-2">
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
                        <button onClick={() => setDetailModal(booking)}
                          className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#292524] hover:bg-[#FED7AA] transition-colors flex items-center gap-1"
                          title="View Details">
                          <Eye size={13} />
                        </button>
                      </div>
                    )}

                    {!booking.checkOutTime && (normStatus === 'In Progress' || booking.status === 'In Progress' || normStatus === 'Approved') && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCheckOut(booking._id)}
                          disabled={actionLoading === booking._id + '-checkout'}
                          className="flex-1 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                        >
                          {actionLoading === booking._id + '-checkout' ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <LogOut size={13} />
                          )}
                          Checkout
                        </button>
                        <button onClick={() => setDetailModal(booking)}
                          className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#292524] hover:bg-[#FED7AA] transition-colors flex items-center gap-1">
                          <Eye size={13} /> Details
                        </button>
                        <button
                          onClick={() => openNotesModal(booking)}
                          className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FED7AA] transition-colors flex items-center gap-1"
                        >
                          <FileText size={13} /> Notes
                        </button>
                      </div>
                    )}

                    {booking.checkOutTime && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                          <span className="font-semibold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 size={13} className="text-emerald-600" /> Checked Out
                          </span>
                          <span className="text-emerald-700 font-mono text-[11px]">
                            {new Date(booking.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setDetailModal(booking)}
                            className="flex-1 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#292524] hover:bg-[#FED7AA] transition-colors flex items-center justify-center gap-1">
                            <Eye size={13} /> View Details
                          </button>
                          <button onClick={() => openNotesModal(booking)}
                            className="flex-1 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FED7AA] transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                            <FileText size={13} /> {booking.sessionNotes?.exercisesCompleted ? 'Edit Notes' : 'Add Notes'}
                          </button>
                        </div>
                      </div>
                    )}
                    {normStatus === 'Completed' && !booking.checkOutTime && (
                      <div className="flex gap-2">
                        <div className="flex-1 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={13} /> Completed
                        </div>
                        <button onClick={() => setDetailModal(booking)}
                          className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#292524] hover:bg-[#FED7AA] transition-colors flex items-center gap-1">
                          <Eye size={13} /> View Details
                        </button>
                        <button onClick={() => openNotesModal(booking)}
                          className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#78716C] hover:bg-[#FED7AA] transition-colors flex items-center gap-1 cursor-pointer">
                          <FileText size={13} /> Notes
                        </button>
                      </div>
                    )}
                    {(normStatus === 'Cancelled' || normStatus === 'Rejected') && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 py-2 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 text-center">
                          Session {normStatus}
                        </div>
                        <button onClick={() => setDetailModal(booking)}
                          className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#292524] hover:bg-[#FED7AA] transition-colors flex items-center gap-1">
                          <Eye size={13} /> View Details
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

      {/* Details Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E7E5E4]">
            <div className="sticky top-0 bg-white border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F97316]/10 border border-[#E7E5E4] flex items-center justify-center shrink-0">
                  <span className="font-bold text-[#F97316] text-sm">{detailModal.customerId?.firstName?.charAt(0) || 'C'}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#292524]">
                    {detailModal.customerId?.firstName} {detailModal.customerId?.lastName}
                  </h3>
                  <p className="text-xs text-[#78716C]">{detailModal.customerId?.email || 'No email'}</p>
                </div>
              </div>
              <button onClick={() => setDetailModal(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-[#E8EAED]">
                <div>
                  <span className="text-xs text-[#78716C] block">Booking Identifier</span>
                  <span className="font-mono font-bold text-sm text-[#292524]">#{detailModal.bookingId || detailModal._id?.slice(-8)}</span>
                </div>
                <div className="flex gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_BADGE[normalizeStatus(detailModal.status)] || 'bg-gray-100 text-gray-700'}`}>
                    {normalizeStatus(detailModal.status)}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${MODE_BADGE[detailModal.mode] || 'bg-gray-100 text-gray-700'}`}>
                    {detailModal.mode === 'Online' ? 'Online' : 'In-Gym'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Session Schedule & Fee</h4>
                <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl p-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#78716C] flex items-center gap-1.5"><CalendarIcon size={14} className="text-[#F97316]" /> Date</span>
                    <span className="font-semibold text-[#292524]">{formatDate(detailModal.date)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#78716C] flex items-center gap-1.5"><Clock size={14} className="text-[#F97316]" /> Time</span>
                    <span className="font-semibold text-[#292524]">{detailModal.startTime} – {detailModal.endTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#78716C] flex items-center gap-1.5"><Users size={14} className="text-[#F97316]" /> Duration</span>
                    <span className="font-semibold text-[#292524]">{detailModal.duration || '60'} min</span>
                  </div>
                  {detailModal.fee > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="text-[#78716C]">Session Fee</span>
                      <span className="font-bold text-[#F97316]">₹{detailModal.fee}</span>
                    </div>
                  )}
                </div>
              </div>

              {(detailModal.checkInTime || detailModal.checkOutTime) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Attendance Records</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {detailModal.checkInTime && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs">
                        <span className="text-emerald-700 block font-medium">Check-In</span>
                        <span className="font-mono font-bold text-emerald-900">
                          {new Date(detailModal.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {detailModal.checkOutTime && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-xs">
                        <span className="text-blue-700 block font-medium">Check-Out</span>
                        <span className="font-mono font-bold text-blue-900">
                          {new Date(detailModal.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailModal.rejectionReason && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Rejection Reason</h4>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700">
                    {detailModal.rejectionReason}
                  </div>
                </div>
              )}

              {detailModal.customerRating && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Customer Rating</h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-amber-700">
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                      <span>{detailModal.customerRating} / 5</span>
                    </div>
                    {detailModal.customerReview && (
                      <p className="italic font-medium text-amber-900">"{detailModal.customerReview}"</p>
                    )}
                  </div>
                </div>
              )}

              {detailModal.sessionNotes?.exercisesCompleted && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Session Notes</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-800 space-y-1.5">
                    <p><span className="font-bold text-[#78716C]">Exercises:</span> {detailModal.sessionNotes.exercisesCompleted}</p>
                    {detailModal.sessionNotes.customerPerformance && (
                      <p><span className="font-bold text-[#78716C]">Performance:</span> {detailModal.sessionNotes.customerPerformance}</p>
                    )}
                    {detailModal.sessionNotes.dietRecommendations && (
                      <p><span className="font-bold text-[#78716C]">Diet:</span> {detailModal.sessionNotes.dietRecommendations}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[#E7E5E4] px-6 py-3 flex justify-end">
              <button onClick={() => setDetailModal(null)} className="px-5 py-2 bg-[#F97316] text-white rounded-xl text-sm font-bold hover:bg-[#EA580C]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E7E5E4] overflow-hidden">
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
              <p className="text-sm text-[#78716C]">
                Declining the booking from <span className="font-bold text-[#292524]">{rejectModal.customerId?.firstName} {rejectModal.customerId?.lastName}</span> scheduled on <span className="font-semibold">{formatDate(rejectModal.date)}</span> at <span className="font-semibold">{rejectModal.startTime}</span>.
              </p>
              <div>
                <label className="block text-xs font-bold text-[#78716C] mb-1.5">Reason <span className="font-normal text-gray-400">(optional)</span></label>
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
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E7E5E4]">
            <div className="sticky top-0 bg-white border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-bold text-[#292524]">Session Notes</h3>
                <p className="text-xs text-[#78716C]">{notesModal.customerId?.firstName} {notesModal.customerId?.lastName}   {formatDate(notesModal.date)}</p>
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
                  <label className="block text-xs font-bold text-[#78716C] mb-1.5">{field.label}</label>
                  {field.type === 'textarea'
                    ? <textarea rows={2} value={(notesForm as any)[field.key]} onChange={e => setNotesForm({ ...notesForm, [field.key]: e.target.value })} placeholder={field.placeholder} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#F97316] focus:outline-none resize-none" />
                    : <input type="text" value={(notesForm as any)[field.key]} onChange={e => setNotesForm({ ...notesForm, [field.key]: e.target.value })} placeholder={field.placeholder} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#F97316] focus:outline-none" />}
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
                <button onClick={handleSaveNotes} disabled={actionLoading === notesModal._id + '-notes'}
                  className="px-5 py-2.5 bg-[#F97316] text-white rounded-xl text-sm font-bold hover:bg-[#EA580C] transition-colors flex items-center gap-2 disabled:opacity-50">
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
