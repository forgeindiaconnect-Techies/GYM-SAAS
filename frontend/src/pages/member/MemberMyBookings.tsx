import { useState, useEffect } from 'react';
import { Clock, MapPin, Plus, Video, RefreshCw, XCircle, LogOut, CheckCircle2, Eye, Star, Calendar, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import MemberTrainingTabs from '../../components/Member/MemberTrainingTabs';

const MemberMyBookings = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Booked' | 'History'>('Booked');

  const fetchSessions = async () => {
    try {
      const res = await api.get('/trainer-sessions/member');
      if (res.data.success) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    try {
      await api.post(`/trainer-sessions/${id}/cancel`, { reason: 'Cancelled by customer' });
      fetchSessions();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel session');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      await api.post(`/trainer-sessions/${id}/check-out`);
      alert('Checked out successfully!');
      fetchSessions();
    } catch (err) {
      console.error(err);
      alert('Check-out failed');
    }
  };

  const bookedStatuses = ['Pending', 'Awaiting Payment', 'Confirmed', 'Approved', 'Upcoming', 'In Progress', 'Reschedule Requested', 'Rescheduled'];
  
  const filteredSessions = sessions.filter(s => {
    if (activeTab === 'Booked') {
      return bookedStatuses.includes(s.status);
    }
    return !bookedStatuses.includes(s.status); // History (Completed, Cancelled, Rejected, Refunded)
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Pending':
        return { label: 'Waiting for Trainer Approval', className: 'text-amber-800 bg-amber-50 border border-amber-300' };
      case 'Confirmed':
      case 'Approved':
      case 'Upcoming':
        return { label: 'Trainer Approved', className: 'text-emerald-800 bg-emerald-50 border border-emerald-300' };
      case 'In Progress':
        return { label: 'In Progress', className: 'text-blue-800 bg-blue-50 border border-blue-300' };
      case 'Rejected':
        return { label: 'Trainer Rejected', className: 'text-rose-800 bg-rose-50 border border-rose-300' };
      case 'Completed':
        return { label: 'Session Completed', className: 'text-blue-800 bg-blue-50 border border-blue-300' };
      case 'Cancelled':
        return { label: 'Booking Cancelled', className: 'text-gray-700 bg-gray-100 border border-gray-300' };
      case 'Awaiting Payment':
        return { label: 'Awaiting Payment', className: 'text-orange-800 bg-orange-50 border border-orange-300' };
      default:
        return { label: status, className: 'text-gray-700 bg-gray-100 border border-gray-300' };
    }
  };

  const [selectedSessionForNotes, setSelectedSessionForNotes] = useState<any | null>(null);
  const [selectedSessionForRate, setSelectedSessionForRate] = useState<any | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewVal, setReviewVal] = useState('');
  const [submittingRate, setSubmittingRate] = useState(false);

  const handleCheckIn = async (id: string) => {
    try {
      await api.post(`/trainer-sessions/${id}/check-in`);
      alert('Checked in successfully!');
      fetchSessions();
    } catch (err) {
      console.error(err);
      alert('Check-in failed');
    }
  };

  const handleReschedulePrompt = async (id: string) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    const newStartTime = prompt('Enter new start time (HH:MM):');
    if (!newDate || !newStartTime) return;
    try {
      await api.post(`/trainer-sessions/${id}/reschedule`, { date: newDate, startTime: newStartTime, reason: 'Rescheduled by customer' });
      alert('Reschedule request submitted!');
      fetchSessions();
    } catch (err) {
      console.error(err);
      alert('Reschedule failed');
    }
  };

  const submitRating = async () => {
    if (!selectedSessionForRate) return;
    try {
      setSubmittingRate(true);
      await api.post(`/trainer-sessions/${selectedSessionForRate._id}/rate`, { rating: ratingVal, review: reviewVal });
      alert('Rating submitted successfully!');
      setSelectedSessionForRate(null);
      setReviewVal('');
      fetchSessions();
    } catch (err) {
      console.error(err);
      alert('Failed to submit rating.');
    } finally {
      setSubmittingRate(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <MemberTrainingTabs />
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#292524]">My Bookings &amp; Sessions</h1>
          <p className="text-[#78716C]">Manage your online training sessions, check in, view notes, and rate trainers.</p>
        </div>
        <button 
          onClick={() => navigate('/member/find-trainers')}
          className="bg-[#F97316] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#EA580C] transition-colors shadow-sm"
        >
          <Plus size={18} /> Book New Session
        </button>
      </div>

      <div className="flex gap-4 border-b border-[#E7E5E4] pb-px">
        <button 
          onClick={() => setActiveTab('Booked')}
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'Booked' ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-[#78716C] hover:text-[#F97316]'}`}
        >
          Booked Session
        </button>
        <button 
          onClick={() => setActiveTab('History')}
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'History' ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-[#78716C] hover:text-[#F97316]'}`}
        >
          Session History &amp; Reviews
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-[#78716C]">Loading bookings...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E7E5E4] p-8 space-y-3 shadow-sm">
            <p className="text-base text-[#292524] font-semibold">
              {activeTab === 'Booked' ? 'No booked sessions found' : 'No session history found'}
            </p>
            <p className="text-sm text-[#78716C] max-w-md mx-auto">
              {activeTab === 'Booked'
                ? 'When you book a training session with a trainer, all your booking details, schedule, and check-in options will appear here.'
                : 'Completed and past training sessions will be listed here along with attendance and trainer reviews.'}
            </p>
            {activeTab === 'Booked' && (
              <button
                onClick={() => navigate('/member/find-trainers')}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-xl text-sm font-bold hover:bg-[#EA580C] transition-colors shadow-sm"
              >
                <Plus size={16} /> Book New Session
              </button>
            )}
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session._id} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs text-[#78716C] uppercase font-bold">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-bold text-[#F97316]">{new Date(session.date).getDate()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-lg text-[#292524]">{session.trainerId?.name || 'Assigned Trainer'}</h3>
                    {session.trainerId?.specialization && (
                      <span className="text-xs text-[#78716C] font-medium hidden sm:inline">
                        • {session.trainerId.specialization}
                      </span>
                    )}
                    {session.bookingId && (
                      <span className="text-[11px] font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200">
                        {session.bookingId}
                      </span>
                    )}
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      session.mode === 'Online'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-purple-100 text-purple-700 border border-purple-200'
                    }`}>
                      {session.mode || 'Online'}
                    </span>
                    {session.attendanceStatus && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {session.attendanceStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-[#78716C]">
                    <span className="flex items-center gap-1 font-semibold"><Clock size={14} className="text-[#F97316]" /> {session.startTime} - {session.endTime}</span>
                    {session.mode === 'Online' ? (
                      <span className="flex items-center gap-1 text-blue-700 font-semibold"><Video size={14} /> Online Virtual Session</span>
                    ) : (
                      <span className="flex items-center gap-1"><MapPin size={14} /> In-Gym Session</span>
                    )}
                    {session.fee > 0 && (
                      <span className="font-medium text-stone-600">Fee: ₹{session.fee}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusDisplay(session.status).className}`}>
                  {getStatusDisplay(session.status).label}
                </span>

                {/* Checked In Badge */}
                {session.checkInTime && (
                  <span className="text-xs bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg font-bold border border-blue-200 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-blue-600" />
                    Checked In ({new Date(session.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                )}

                {/* Checked Out Badge */}
                {session.checkOutTime && (
                  <span className="text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Checked Out ({new Date(session.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                )}

                {/* Join Online Session Button */}
                {session.mode === 'Online' && ['Confirmed', 'Approved', 'Upcoming', 'In Progress'].includes(session.status) && (
                  <a
                    href={session.meetingLink || `https://meet.jit.si/aigym-session-${session._id.substr(-6)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Video size={14} /> Join Session
                  </a>
                )}

                {/* Check In Option / Button - for active booked sessions before check in */}
                {!session.checkInTime && !['Completed', 'Cancelled', 'Rejected'].includes(session.status) && (
                  <button
                    onClick={() => handleCheckIn(session._id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} /> Check In
                  </button>
                )}

                {/* Checkout Option / Button - when checked in or in-progress, before check out */}
                {!session.checkOutTime && (session.checkInTime || session.status === 'In Progress' || session.attendanceStatus === 'Present') && !['Completed', 'Cancelled', 'Rejected'].includes(session.status) && (
                  <button
                    onClick={() => handleCheckOut(session._id)}
                    className="px-3.5 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <LogOut size={13} /> Checkout
                  </button>
                )}

                {/* View Details Button */}
                <button
                  onClick={() => setSelectedSessionForDetails(session)}
                  className="px-3.5 py-1.5 bg-[#FFFDF8] border border-[#E7E5E4] hover:bg-[#FED7AA] text-[#292524] rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Eye size={14} /> View Details
                </button>

                {/* View Trainer Session Notes */}
                {session.sessionNotes?.exercisesCompleted && (
                  <button
                    onClick={() => setSelectedSessionForNotes(session)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Session Notes
                  </button>
                )}

                {/* Rate Trainer Button */}
                {session.status === 'Completed' && !session.customerRating && (
                  <button
                    onClick={() => setSelectedSessionForRate(session)}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Rate Trainer
                  </button>
                )}

                {session.customerRating && (
                  <span className="text-xs bg-yellow-50 text-yellow-800 border border-yellow-200 px-2.5 py-1 rounded-lg font-bold">
                    ★ {session.customerRating}/5 Rated
                  </span>
                )}

                {session.status === 'Awaiting Payment' && (
                  <button 
                    onClick={() => navigate(`/member/checkout/${session._id}?type=session`)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Pay Now
                  </button>
                )}

                {bookedStatuses.includes(session.status) && session.status !== 'Pending' && (
                  <button 
                    onClick={() => handleReschedulePrompt(session._id)}
                    className="p-2 border border-[#E7E5E4] hover:bg-[#FED7AA] text-[#78716C] rounded-xl transition-colors" 
                    title="Reschedule Session"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}

                {bookedStatuses.includes(session.status) && (
                  <button 
                    onClick={() => handleCancel(session._id)}
                    className="p-2 border border-red-200 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                    title="Cancel Booking"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Details Modal for Member */}
      {selectedSessionForDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E7E5E4]">
            <div className="sticky top-0 bg-white border-b border-[#E7E5E4] px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F97316]/10 border border-[#E7E5E4] flex items-center justify-center shrink-0">
                  <span className="font-bold text-[#F97316] text-sm">{selectedSessionForDetails.trainerId?.name?.charAt(0) || 'T'}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#292524]">
                    {selectedSessionForDetails.trainerId?.name || 'Assigned Trainer'}
                  </h3>
                  <p className="text-xs text-[#78716C]">{selectedSessionForDetails.trainerId?.specialization || 'Personal Trainer'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSessionForDetails(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-[#E8EAED]">
                <div>
                  <span className="text-xs text-[#78716C] block">Booking Identifier</span>
                  <span className="font-mono font-bold text-sm text-[#292524]">{selectedSessionForDetails.bookingId || `#${selectedSessionForDetails._id?.slice(-8)}`}</span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusDisplay(selectedSessionForDetails.status).className}`}>
                  {getStatusDisplay(selectedSessionForDetails.status).label}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Session Schedule & Details</h4>
                <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl p-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#78716C] flex items-center gap-1.5"><Calendar size={14} className="text-[#F97316]" /> Date</span>
                    <span className="font-semibold text-[#292524]">{new Date(selectedSessionForDetails.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#78716C] flex items-center gap-1.5"><Clock size={14} className="text-[#F97316]" /> Time Slot</span>
                    <span className="font-semibold text-[#292524]">{selectedSessionForDetails.startTime} – {selectedSessionForDetails.endTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#78716C] flex items-center gap-1.5"><Video size={14} className="text-[#F97316]" /> Training Mode</span>
                    <span className="font-semibold text-blue-700">{selectedSessionForDetails.mode || 'Online Virtual Session'}</span>
                  </div>
                  {selectedSessionForDetails.fee > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <span className="text-[#78716C]">Session Fee</span>
                      <span className="font-bold text-[#F97316]">₹{selectedSessionForDetails.fee}</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedSessionForDetails.checkInTime || selectedSessionForDetails.checkOutTime) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Attendance Activity</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSessionForDetails.checkInTime && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs">
                        <span className="text-emerald-700 block font-medium">Checked In</span>
                        <span className="font-mono font-bold text-emerald-900">
                          {new Date(selectedSessionForDetails.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                    {selectedSessionForDetails.checkOutTime && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-xs">
                        <span className="text-blue-700 block font-medium">Checked Out</span>
                        <span className="font-mono font-bold text-blue-900">
                          {new Date(selectedSessionForDetails.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedSessionForDetails.mode === 'Online' && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Virtual Meeting Room</h4>
                  <div className="flex items-center justify-between gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <span className="text-xs font-mono text-blue-800 truncate">
                      {selectedSessionForDetails.meetingLink || `meet.jit.si/aigym-session-${selectedSessionForDetails._id.substr(-6)}`}
                    </span>
                    <a
                      href={selectedSessionForDetails.meetingLink || `https://meet.jit.si/aigym-session-${selectedSessionForDetails._id.substr(-6)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0"
                    >
                      Join Now
                    </a>
                  </div>
                </div>
              )}

              {selectedSessionForDetails.customerRating && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Your Rating & Review</h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-amber-700">
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                      <span>{selectedSessionForDetails.customerRating} / 5</span>
                    </div>
                    {selectedSessionForDetails.customerReview && (
                      <p className="italic font-medium">"{selectedSessionForDetails.customerReview}"</p>
                    )}
                  </div>
                </div>
              )}

              {selectedSessionForDetails.sessionNotes?.exercisesCompleted && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Trainer Notes</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-800 space-y-1.5">
                    <p><span className="font-bold text-[#78716C]">Exercises:</span> {selectedSessionForDetails.sessionNotes.exercisesCompleted}</p>
                    {selectedSessionForDetails.sessionNotes.customerPerformance && (
                      <p><span className="font-bold text-[#78716C]">Performance:</span> {selectedSessionForDetails.sessionNotes.customerPerformance}</p>
                    )}
                    {selectedSessionForDetails.sessionNotes.dietRecommendations && (
                      <p><span className="font-bold text-[#78716C]">Diet:</span> {selectedSessionForDetails.sessionNotes.dietRecommendations}</p>
                    )}
                    {selectedSessionForDetails.sessionNotes.nextSessionFocus && (
                      <p><span className="font-bold text-[#78716C]">Next Focus:</span> {selectedSessionForDetails.sessionNotes.nextSessionFocus}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[#E7E5E4] px-6 py-3 flex justify-end">
              <button onClick={() => setSelectedSessionForDetails(null)} className="px-5 py-2 bg-[#F97316] text-white rounded-xl text-sm font-bold hover:bg-[#EA580C]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Notes Modal */}
      {selectedSessionForNotes && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[#292524] border-b pb-3">Trainer Session Notes</h3>
            <div className="space-y-3 text-sm text-[#334155]">
              <p><span className="font-bold text-[#F97316]">Exercises Completed:</span> {selectedSessionForNotes.sessionNotes?.exercisesCompleted || 'N/A'}</p>
              <p><span className="font-bold text-[#F97316]">Performance:</span> {selectedSessionForNotes.sessionNotes?.customerPerformance || 'N/A'}</p>
              <p><span className="font-bold text-[#F97316]">Diet Recommendations:</span> {selectedSessionForNotes.sessionNotes?.dietRecommendations || 'N/A'}</p>
              <p><span className="font-bold text-[#F97316]">Workout Modifications:</span> {selectedSessionForNotes.sessionNotes?.workoutModifications || 'N/A'}</p>
              <p><span className="font-bold text-[#F97316]">Next Session Focus:</span> {selectedSessionForNotes.sessionNotes?.nextSessionFocus || 'N/A'}</p>
            </div>
            <div className="pt-3 border-t flex justify-end">
              <button onClick={() => setSelectedSessionForNotes(null)} className="px-5 py-2 bg-[#F97316] text-white rounded-xl font-bold text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Trainer Modal */}
      {selectedSessionForRate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[#292524]">Rate &amp; Review Trainer</h3>
            <p className="text-xs text-[#78716C]">How was your live session with {selectedSessionForRate.trainerId?.name || 'your trainer'}?</p>
            
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingVal(star)}
                  className={`text-2xl ${star <= ratingVal ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewVal}
              onChange={e => setReviewVal(e.target.value)}
              placeholder="Write your review or feedback..."
              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#F97316]"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedSessionForRate(null)} className="px-4 py-2 border rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={submitRating} disabled={submittingRate} className="px-5 py-2 bg-[#F97316] text-white rounded-xl text-sm font-bold disabled:opacity-50">
                {submittingRate ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberMyBookings;
