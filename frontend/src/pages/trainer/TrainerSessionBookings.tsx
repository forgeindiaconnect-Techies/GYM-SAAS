import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Calendar as CalendarIcon, Video, MapPin, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const TrainerSessionBookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-sessions/trainer');
      if (res.data.success) {
        setBookings(res.data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, action: 'accept' | 'reject' | 'complete') => {
    try {
      setActionLoading(id);
      if (action === 'reject') {
        const reason = prompt('Reason for rejection (optional):') || 'Trainer rejected';
        await api.post(`/trainer-sessions/${id}/reject`, { reason });
      } else {
        await api.post(`/trainer-sessions/${id}/${action}`);
      }
      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert(`Failed to ${action} session.`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusCategory = (status: string) => {
    if (['Pending', 'Reschedule Requested'].includes(status)) return 'Pending';
    if (['Confirmed', 'Awaiting Payment', 'Upcoming'].includes(status)) return 'Confirmed';
    if (status === 'Completed') return 'Completed';
    if (['Cancelled', 'Rejected', 'Refunded', 'Refund Pending'].includes(status)) return 'Cancelled';
    return 'Other';
  };

  const filtered = filter === 'All' 
    ? bookings 
    : bookings.filter(b => getStatusCategory(b.status) === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Session Bookings</h1>
          <p className="text-[#455250] mt-1">Manage your upcoming training sessions with members.</p>
        </div>
        <div className="flex space-x-2 bg-[#F8FAFC] p-1 rounded-xl border border-[#D3DFDA] overflow-x-auto w-fit max-w-full">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${filter === f ? 'bg-[#164A4A] text-white shadow-sm' : 'bg-transparent text-[#455250] hover:bg-[#E8E5DA]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(booking => (
              <div key={booking._id} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col h-full relative overflow-hidden">
                {actionLoading === booking._id && (
                   <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                     <Loader2 className="animate-spin text-[#164A4A]" size={32} />
                   </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#F1F5F9] border border-[#D3DFDA] flex items-center justify-center overflow-hidden shrink-0">
                      {booking.customerId?.profilePhoto ? (
                        <img src={booking.customerId.profilePhoto} alt={booking.customerId.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-bold text-[#164A4A]">{booking.customerId?.firstName?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#202828] leading-tight">
                        {booking.customerId ? `${booking.customerId.firstName} ${booking.customerId.lastName}` : 'Unknown User'}
                      </h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${getStatusCategory(booking.status) === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                          getStatusCategory(booking.status) === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                          getStatusCategory(booking.status) === 'Completed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-[#F8FAFC] rounded-full flex items-center justify-center text-[#164A4A] shrink-0" title={`${booking.mode} Session`}>
                    {booking.mode === 'Online' ? <Video size={14} /> : <MapPin size={14} />}
                  </div>
                </div>

                <div className="space-y-3 text-sm text-[#455250] border-t border-[#D3DFDA] pt-4 mb-2">
                  <div className="flex items-center space-x-3">
                    <CalendarIcon size={16} className="text-[#164A4A]" />
                    <span className="font-medium text-[#202828]">{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock size={16} className="text-[#164A4A]" />
                    <span className="font-medium text-[#202828]">{booking.startTime} - {booking.endTime}</span>
                  </div>
                  {booking.mode === 'Online' && booking.meetingLink && (
                    <div className="flex items-center space-x-3 mt-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <Video size={16} className="text-blue-600" />
                      <a href={booking.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4">
                  {booking.status === 'Pending' && (
                    <div className="flex space-x-3">
                      <button onClick={() => handleUpdateStatus(booking._id, 'reject')} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold transition-colors">
                        Reject
                      </button>
                      <button onClick={() => handleUpdateStatus(booking._id, 'accept')} className="flex-1 py-2 bg-[#164A4A] text-white rounded-xl font-semibold hover:bg-[#C6A77D] transition-colors">
                        Accept
                      </button>
                    </div>
                  )}
                  
                  {booking.status === 'Confirmed' && (
                    <button onClick={() => handleUpdateStatus(booking._id, 'complete')} className="w-full py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
                      Mark as Completed
                    </button>
                  )}

                  {booking.status === 'Awaiting Payment' && (
                    <button disabled className="w-full py-2 bg-gray-100 text-gray-400 rounded-xl font-semibold cursor-not-allowed">
                      Waiting for Customer Payment
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-16 text-center flex flex-col items-center shadow-sm">
              <CalendarIcon size={48} className="text-[#A8ADA9] mb-4" />
              <h3 className="text-xl font-bold text-[#202828] mb-1">No {filter.toLowerCase()} bookings</h3>
              <p className="text-[#455250]">You don't have any sessions matching this filter right now.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrainerSessionBookings;
