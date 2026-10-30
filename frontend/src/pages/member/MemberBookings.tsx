import { useState, useEffect } from 'react';
import { Clock, MapPin, Plus, Video, RefreshCw, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const MemberBookings = () => {
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

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Pending':
        return { label: 'Waiting for Trainer Approval', className: 'text-amber-800 bg-amber-50 border border-amber-300' };
      case 'Confirmed':
      case 'Upcoming':
      case 'In Progress':
        return { label: 'Trainer Approved', className: 'text-[#B76E79] bg-[#F3E8E8] border border-[#E7DADD]' };
      case 'Rejected':
        return { label: 'Trainer Rejected', className: 'text-rose-800 bg-rose-50 border border-rose-300' };
      case 'Completed':
        return { label: 'Session Completed', className: 'text-[#B76E79] bg-[#F3E8E8] border border-[#E7DADD]' };
      case 'Cancelled':
        return { label: 'Booking Cancelled', className: 'text-[#292524] bg-[#F3E8E8] border border-[#E7DADD]' };
      case 'Awaiting Payment':
        return { label: 'Awaiting Payment', className: 'text-[#B76E79] bg-[#F3E8E8] border border-[#E7DADD]' };
      default:
        return { label: status, className: 'text-[#292524] bg-[#F3E8E8] border border-[#E7DADD]' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#292524]">My Bookings</h1>
          <p className="text-[#57534E]">Manage your upcoming and past training sessions.</p>
        </div>
        <button 
          onClick={() => navigate('/member/find-trainers')}
          className="bg-[#B76E79] text-white font-bold px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#9F5965] transition-colors"
        >
          <Plus size={18} /> Book New Session
        </button>
      </div>

      <div className="flex gap-4 border-b border-[#E7DADD] pb-px">
        <button 
          onClick={() => setActiveTab('Upcoming')}
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'Upcoming' ? 'border-[#B76E79] text-[#B76E79]' : 'border-transparent text-[#57534E] hover:text-[#B76E79]'}`}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab('History')}
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'History' ? 'border-[#B76E79] text-[#B76E79]' : 'border-transparent text-[#57534E] hover:text-[#B76E79]'}`}
        >
          History
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-[#57534E]">Loading bookings...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-10 text-[#57534E]">No {activeTab.toLowerCase()} bookings found.</div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session._id} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[#F3E8E8] border border-[#E7DADD] rounded-xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs text-[#57534E] uppercase">{new Date(session.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-xl font-bold text-[#B76E79]">{new Date(session.date).getDate()}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-[#292524]">{session.trainerId?.name || 'Trainer'}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      session.mode === 'Online'
                        ? 'bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]'
                        : 'bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]'
                    }`}>
                      {session.mode || 'Online'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-[#57534E]">
                    <span className="flex items-center gap-1"><Clock size={14} /> {session.startTime} - {session.endTime}</span>
                    {session.mode === 'Online' ? (
                      <span className="flex items-center gap-1 text-[#B76E79] font-semibold"><Video size={14} /> Online Meeting</span>
                    ) : (
                      <span className="flex items-center gap-1"><MapPin size={14} /> In-Gym Session</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusDisplay(session.status).className}`}>
                  {getStatusDisplay(session.status).label}
                </span>
                
                {session.status === 'Awaiting Payment' && (
                  <button 
                    onClick={() => navigate(`/member/checkout/${session._id}?type=session`)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Pay Now
                  </button>
                )}

                {upcomingStatuses.includes(session.status) && session.status !== 'Pending' && (
                  <button className="p-2 border border-[#E7DADD] hover:bg-[#F3E8E8] text-[#57534E] rounded-lg transition-colors" title="Reschedule">
                    <RefreshCw size={18} />
                  </button>
                )}

                {upcomingStatuses.includes(session.status) && (
                  <button 
                    onClick={() => handleCancel(session._id)}
                    className="p-2 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    title="Cancel Booking"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberBookings;