import { useState, useEffect } from 'react';
import { Clock, MapPin, Plus, Video, RefreshCw, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const MemberMyBookings = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'History'>('Upcoming');

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

  const upcomingStatuses = ['Pending', 'Awaiting Payment', 'Confirmed', 'Upcoming', 'Reschedule Requested', 'Rescheduled'];
  
  const filteredSessions = sessions.filter(s => {
    if (activeTab === 'Upcoming') {
      return upcomingStatuses.includes(s.status);
    }
    return !upcomingStatuses.includes(s.status); // History (Completed, Cancelled, Rejected, Refunded)
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Confirmed': return 'text-green-500 bg-green-500/10';
      case 'Awaiting Payment': return 'text-orange-500 bg-orange-500/10';
      case 'Pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'Cancelled': case 'Rejected': return 'text-red-500 bg-red-500/10';
      case 'Completed': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-[#455250] bg-gray-100';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#202828]">My Bookings</h1>
          <p className="text-[#455250]">Manage your upcoming and past training sessions.</p>
        </div>
        <button 
          onClick={() => navigate('/member/find-trainers')}
          className="bg-[#164A4A] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#C6A77D] transition-colors"
        >
          <Plus size={18} /> Book New Session
        </button>
      </div>

      <div className="flex gap-4 border-b border-[#D3DFDA] pb-px">
        <button 
          onClick={() => setActiveTab('Upcoming')}
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'Upcoming' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#164A4A]'}`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab('History')}
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'History' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#164A4A]'}`}
        >
          History
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-[#455250]">Loading bookings...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-10 text-[#455250]">No {activeTab.toLowerCase()} bookings found.</div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session._id} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs text-[#455250] uppercase">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-bold text-[#164A4A]">{new Date(session.date).getDate()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-[#202828]">{session.trainerId?.name || 'Trainer'}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-[#164A4A]/10 text-[#164A4A]`}>
                      {session.mode}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-[#455250]">
                    <span className="flex items-center gap-1"><Clock size={14} /> {session.startTime} - {session.endTime}</span>
                    {session.mode === 'Online' ? (
                      <span className="flex items-center gap-1"><Video size={14} /> Online Meeting</span>
                    ) : (
                      <span className="flex items-center gap-1"><MapPin size={14} /> In-Gym</span>
                    )}
                  </div>
                </div>
              </div>
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#202828]">My Bookings &amp; Sessions</h1>
          <p className="text-[#455250]">Manage your online training sessions, check in, view notes, and rate trainers.</p>
        </div>
        <button 
          onClick={() => navigate('/member/find-trainers')}
          className="bg-[#164A4A] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#C6A77D] transition-colors shadow-sm"
        >
          <Plus size={18} /> Book New Session
        </button>
      </div>

      <div className="flex gap-4 border-b border-[#D3DFDA] pb-px">
        <button 
          onClick={() => setActiveTab('Upcoming')}
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'Upcoming' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#164A4A]'}`}
        >
          Upcoming / Active
        </button>
        <button 
          onClick={() => setActiveTab('History')}
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'History' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#164A4A]'}`}
        >
          Session History &amp; Reviews
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-[#455250]">Loading bookings...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-10 text-[#455250]">No {activeTab.toLowerCase()} bookings found.</div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session._id} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs text-[#455250] uppercase font-bold">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-bold text-[#164A4A]">{new Date(session.date).getDate()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-[#202828]">{session.trainerId?.name || 'Assigned Trainer'}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full bg-[#164A4A]/10 text-[#164A4A] font-semibold`}>
                      {session.mode || 'Online'}
                    </span>
                    {session.attendanceStatus && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {session.attendanceStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-[#455250]">
                    <span className="flex items-center gap-1 font-semibold"><Clock size={14} className="text-[#164A4A]" /> {session.startTime} - {session.endTime}</span>
                    {session.mode === 'Online' ? (
                      <span className="flex items-center gap-1 text-blue-700 font-semibold"><Video size={14} /> Online Live Session</span>
                    ) : (
                      <span className="flex items-center gap-1"><MapPin size={14} /> In-Gym</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(session.status)}`}>
                  {session.status}
                </span>

                {/* Join Online Session Button */}
                {session.mode === 'Online' && ['Confirmed', 'Upcoming', 'In Progress'].includes(session.status) && (
                  <a
                    href={session.meetingLink || `https://meet.google.com/room-${session._id.substr(-6)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Video size={14} /> Join Session
                  </a>
                )}

                {/* Check In Button */}
                {['Confirmed', 'Upcoming'].includes(session.status) && !session.checkInTime && (
                  <button
                    onClick={() => handleCheckIn(session._id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Check In
                  </button>
                )}

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

                {upcomingStatuses.includes(session.status) && session.status !== 'Pending' && (
                  <button 
                    onClick={() => handleReschedulePrompt(session._id)}
                    className="p-2 border border-[#D3DFDA] hover:bg-[#E8E5DA] text-[#455250] rounded-xl transition-colors" 
                    title="Reschedule Session"
                  >
                    <RefreshCw size={16} />
                  </button>
                )}

                {upcomingStatuses.includes(session.status) && (
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

      {/* Session Notes Modal */}
      {selectedSessionForNotes && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[#202828] border-b pb-3">Trainer Session Notes</h3>
            <div className="space-y-3 text-sm text-[#334155]">
              <p><span className="font-bold text-[#164A4A]">Exercises Completed:</span> {selectedSessionForNotes.sessionNotes?.exercisesCompleted || 'N/A'}</p>
              <p><span className="font-bold text-[#164A4A]">Performance:</span> {selectedSessionForNotes.sessionNotes?.customerPerformance || 'N/A'}</p>
              <p><span className="font-bold text-[#164A4A]">Diet Recommendations:</span> {selectedSessionForNotes.sessionNotes?.dietRecommendations || 'N/A'}</p>
              <p><span className="font-bold text-[#164A4A]">Workout Modifications:</span> {selectedSessionForNotes.sessionNotes?.workoutModifications || 'N/A'}</p>
              <p><span className="font-bold text-[#164A4A]">Next Session Focus:</span> {selectedSessionForNotes.sessionNotes?.nextSessionFocus || 'N/A'}</p>
            </div>
            <div className="pt-3 border-t flex justify-end">
              <button onClick={() => setSelectedSessionForNotes(null)} className="px-5 py-2 bg-[#164A4A] text-white rounded-xl font-bold text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Trainer Modal */}
      {selectedSessionForRate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[#202828]">Rate &amp; Review Trainer</h3>
            <p className="text-xs text-[#687B78]">How was your live session with {selectedSessionForRate.trainerId?.name || 'your trainer'}?</p>
            
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
              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#164A4A]"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedSessionForRate(null)} className="px-4 py-2 border rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={submitRating} disabled={submittingRate} className="px-5 py-2 bg-[#164A4A] text-white rounded-xl text-sm font-bold disabled:opacity-50">
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
