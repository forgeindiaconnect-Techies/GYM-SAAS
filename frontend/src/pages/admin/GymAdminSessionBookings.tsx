import { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, Clock, User, Loader2, Eye, X, Video } from 'lucide-react';
import api from '../../utils/api';

const GymAdminSessionBookings = () => {
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

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
      if (selectedBooking && selectedBooking._id === id) {
        setSelectedBooking(null);
      }
      alert('Refund processed successfully.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const monthName = months[parseInt(m) - 1] || m;
      return `${d} ${monthName} ${y}`;
    }
    return dateStr;
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
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Session Bookings</h1>
          <p className="text-[#78716C] mt-1">Manage personal training appointments across your gym.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by member, trainer, or booking ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl pl-10 pr-4 py-3 text-[#292524] outline-none focus:border-[#F97316]"
          />
          <Search className="absolute left-3 top-3.5 text-[#78716C]" size={18} />
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#78716C] whitespace-nowrap">
            <thead className="bg-[#F8FAFC] border-b border-[#E7E5E4] text-[#292524]">
              <tr>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Assigned Trainer</th>
                <th className="px-6 py-4 font-semibold">Schedule</th>
                <th className="px-6 py-4 font-semibold">Session Type</th>
                <th className="px-6 py-4 font-semibold">Fee</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E5E4]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-[#F97316] mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#78716C]">
                    No session bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-[#F8FAFC] transition-colors relative">
                    {actionLoading === booking._id && (
                       <td colSpan={7} className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                         <Loader2 className="animate-spin text-[#F97316]" size={24} />
                       </td>
                    )}
                    <td className="px-6 py-4 font-mono text-[#F97316] font-bold">{booking.bookingId || booking._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 font-semibold text-[#292524]">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-[#FED7AA] flex items-center justify-center text-xs overflow-hidden shrink-0 border border-[#E7E5E4]">
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
                      <span className="flex items-center"><User size={14} className="mr-2 text-[#78716C]"/> {booking.trainerId?.name || 'Trainer'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <p className="flex items-center text-[#292524]"><CalendarIcon size={12} className="mr-1.5 text-[#F97316]"/> {formatDateDisplay(booking.date)}</p>
                        <p className="flex items-center"><Clock size={12} className="mr-1.5 text-[#78716C]"/> {booking.startTime} - {booking.endTime}</p>
                        {booking.checkInTime && (
                          <p className="text-[11px] text-blue-700 font-semibold">
                            In: {new Date(booking.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                        {booking.checkOutTime && (
                          <p className="text-[11px] text-emerald-700 font-semibold">
                            Out: {new Date(booking.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#292524] capitalize">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        booking.mode === 'Online' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {booking.mode || 'Online'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#F97316]">
                      ₹{booking.fee}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-3.5 py-1.5 bg-[#F1F5F9] text-[#292524] border border-[#E7E5E4] hover:bg-[#FED7AA] font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Eye size={14} /> View Details
                        </button>

                        {booking.paymentStatus === 'Paid' && !['Refunded', 'Refund Pending'].includes(booking.status) && (
                          <button 
                            onClick={() => handleRefund(booking._id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg text-xs transition-colors shrink-0"
                          >
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E7E5E4] space-y-6 max-h-[85vh] overflow-y-auto my-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-[#292524]">Session Booking Details</h3>
                <p className="text-xs text-[#F97316] font-mono font-bold mt-0.5">
                  ID: {selectedBooking.bookingId || selectedBooking._id}
                </p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="p-2 text-[#78716C] hover:bg-[#F1F5F9] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-[#334155]">
              {/* Member & Trainer & Session Details - Touching one by one */}
              <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                <div className="p-3.5 bg-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FED7AA] flex items-center justify-center text-sm font-bold overflow-hidden border border-[#E7E5E4] shrink-0">
                    {selectedBooking.customerId?.profilePhoto ? (
                      <img src={selectedBooking.customerId.profilePhoto} alt="member" className="w-full h-full object-cover" />
                    ) : (
                      selectedBooking.customerId?.firstName?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Member Name</p>
                    <p className="font-bold text-[#292524] text-sm">
                      {selectedBooking.customerId ? `${selectedBooking.customerId.firstName} ${selectedBooking.customerId.lastName}` : 'Unknown Member'}
                    </p>
                    {selectedBooking.customerId?.email && <p className="text-xs text-[#78716C]">{selectedBooking.customerId.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                  <div className="p-3.5 bg-white">
                    <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Assigned Trainer</p>
                    <p className="font-bold text-[#292524] text-sm">{selectedBooking.trainerId?.name || 'Trainer'}</p>
                    <p className="text-xs text-[#F97316] mt-0.5">{selectedBooking.trainerId?.specialization || 'Fitness Coach'}</p>
                  </div>
                  <div className="p-3.5 bg-white">
                    <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Session Mode</p>
                    <p className="font-bold text-[#292524] text-sm capitalize">{selectedBooking.mode || 'Online'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                  <div className="p-3.5 bg-white">
                    <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="font-bold text-[#292524] text-sm">{formatDateDisplay(selectedBooking.date)}</p>
                    <p className="text-xs text-[#78716C] mt-0.5">{selectedBooking.startTime} - {selectedBooking.endTime}</p>
                  </div>
                  <div className="p-3.5 bg-white">
                    <p className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Status & Fee</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                      <p className="font-bold text-[#F97316] text-sm">₹{selectedBooking.fee} ({selectedBooking.paymentStatus || 'Pending'})</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting Link for Online Sessions */}
              {selectedBooking.mode === 'Online' && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Online Session Video Room</p>
                  <a
                    href={selectedBooking.meetingLink || `https://meet.jit.si/aigym-session-${selectedBooking._id.substr(-6)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline text-xs flex items-center gap-1.5 break-all"
                  >
                    <Video size={14} /> {selectedBooking.meetingLink || `https://meet.jit.si/aigym-session-${selectedBooking._id.substr(-6)}`}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 border-t flex justify-end gap-3">
              {selectedBooking.paymentStatus === 'Paid' && !['Refunded', 'Refund Pending'].includes(selectedBooking.status) && (
                <button
                  onClick={() => handleRefund(selectedBooking._id)}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-sm transition-colors"
                >
                  Process Refund
                </button>
              )}
              <button 
                onClick={() => setSelectedBooking(null)} 
                className="px-5 py-2 bg-[#F97316] text-white font-bold rounded-xl text-sm hover:bg-[#EA580C] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminSessionBookings;
