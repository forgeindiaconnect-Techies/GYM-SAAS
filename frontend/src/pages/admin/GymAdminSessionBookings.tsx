import { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, MoreVertical, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const GymAdminSessionBookings = () => {
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-sessions/gym');
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

  const handleRefund = async (id: string) => {
    if (!window.confirm('Are you sure you want to process a full refund for this session? This action cannot be undone.')) return;
    try {
      setActionLoading(id);
      await api.post(`/trainer-sessions/${id}/refund`);
      await fetchBookings();
      alert('Refund processed successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const term = search.toLowerCase();
    const trainerName = b.trainerId?.name?.toLowerCase() || '';
    const customerName = `${b.customerId?.firstName || ''} ${b.customerId?.lastName || ''}`.toLowerCase();
    const id = b.bookingId?.toLowerCase() || '';
    return trainerName.includes(term) || customerName.includes(term) || id.includes(term);
  });

  const getStatusColor = (status: string) => {
    if (['Pending', 'Awaiting Payment', 'Reschedule Requested'].includes(status)) return 'bg-yellow-100 text-yellow-700';
    if (['Confirmed', 'Upcoming'].includes(status)) return 'bg-blue-100 text-blue-700';
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Session Bookings</h1>
          <p className="text-[#455250] mt-1">Manage personal training appointments across your gym.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by member, trainer, or booking ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl pl-10 pr-4 py-3 text-[#202828] outline-none focus:border-[#164A4A]"
          />
          <Search className="absolute left-3 top-3.5 text-[#455250]" size={18} />
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#455250] whitespace-nowrap">
            <thead className="bg-[#F8FAFC] border-b border-[#D3DFDA] text-[#202828]">
              <tr>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Assigned Trainer</th>
                <th className="px-6 py-4 font-semibold">Schedule</th>
                <th className="px-6 py-4 font-semibold">Session Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Fee</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3DFDA]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-[#164A4A] mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#455250]">
                    No session bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-[#F8FAFC] transition-colors relative">
                    {actionLoading === booking._id && (
                       <td colSpan={8} className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                         <Loader2 className="animate-spin text-[#164A4A]" size={24} />
                       </td>
                    )}
                    <td className="px-6 py-4 font-mono text-[#164A4A] font-bold">{booking.bookingId || booking._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 font-semibold text-[#202828]">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#E8E5DA] flex items-center justify-center text-xs overflow-hidden shrink-0 border border-[#D3DFDA]">
                          {booking.customerId?.profilePhoto ? (
                            <img src={booking.customerId.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                          ) : (
                            booking.customerId?.firstName?.charAt(0) || 'U'
                          )}
                        </div>
                        <span>{booking.customerId ? `${booking.customerId.firstName} ${booking.customerId.lastName}` : 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center"><User size={14} className="mr-2 text-[#455250]"/> {booking.trainerId?.name || 'Trainer'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <p className="flex items-center text-[#202828]"><CalendarIcon size={12} className="mr-1.5 text-[#164A4A]"/> {new Date(booking.date).toLocaleDateString()}</p>
                        <p className="flex items-center"><Clock size={12} className="mr-1.5 text-[#455250]"/> {booking.startTime}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#202828] capitalize">{booking.mode}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider w-max block text-center ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      {booking.paymentStatus === 'Paid' && (
                        <span className="text-[10px] font-bold text-green-600 block text-center mt-1">PAID</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#164A4A]">
                      ₹{booking.fee}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.paymentStatus === 'Paid' && !['Refunded', 'Refund Pending'].includes(booking.status) ? (
                        <button 
                          onClick={() => handleRefund(booking._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg text-xs transition-colors"
                        >
                          Refund
                        </button>
                      ) : booking.status === 'Refunded' ? (
                        <span className="text-xs font-bold text-gray-400">Refunded</span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GymAdminSessionBookings;
