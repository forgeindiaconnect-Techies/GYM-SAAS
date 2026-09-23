import { useState, useEffect } from 'react';
import { getDb, updateItem } from '../../utils/mockDb';
import { CheckCircle, XCircle, Clock, Calendar as CalendarIcon, Video, MapPin } from 'lucide-react';

const TrainerSessionBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // In a real app, filter by trainerId === currentUser.id
    setBookings(getDb('bookings'));
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    const updated = updateItem('bookings', id, { status: newStatus });
    setBookings(bookings.map(b => b.id === id ? updated : b));
  };

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Session Bookings</h1>
          <p className="text-[#4A514D] mt-1">Manage your upcoming training sessions with members.</p>
        </div>
        <div className="flex space-x-2">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${filter === f ? 'bg-[#34483F] text-white' : 'bg-[#FFFFFF] text-[#4A514D] hover:bg-[#E8E5DA]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(booking => (
          <div key={booking.id} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 hover:border-[#34483F]/30 transition-colors flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#202522]">Member ID: {booking.memberId}</h3>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold 
                  ${booking.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                    booking.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-500' :
                    booking.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                    'bg-[#8FA89B]/10 text-[#8FA89B]'}`}>
                  {booking.status}
                </span>
              </div>
              <div className="w-10 h-10 bg-[#FFFFFF] border border-[#DCD9CD] rounded-full flex items-center justify-center text-[#34483F]">
                {booking.type === 'Online' ? <Video size={18} /> : <MapPin size={18} />}
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#4A514D] flex-1 border-t border-[#DCD9CD] pt-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon size={16} className="text-[#34483F]" />
                <span className="text-[#202522]">{booking.date}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock size={16} className="text-[#34483F]" />
                <span className="text-[#202522]">{booking.time}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-4 flex justify-center text-[#34483F] text-xs font-bold">TYPE</span>
                <span className="text-[#202522]">{booking.type}</span>
              </div>
            </div>

            {booking.status === 'Pending' && (
              <div className="mt-6 flex space-x-3 border-t border-[#DCD9CD] pt-4">
                <button onClick={() => handleUpdateStatus(booking.id, 'Cancelled')} className="flex-1 flex justify-center items-center space-x-2 py-2 bg-[#FFFFFF] text-[#4A514D] rounded-xl font-medium hover:text-[#34483F] transition-colors">
                  <XCircle size={16} /> <span>Reject</span>
                </button>
                <button onClick={() => handleUpdateStatus(booking.id, 'Confirmed')} className="flex-1 flex justify-center items-center space-x-2 py-2 bg-[#34483F] text-white rounded-xl font-medium hover:bg-[#EA6D10] transition-colors">
                  <CheckCircle size={16} /> <span>Accept</span>
                </button>
              </div>
            )}
            
            {booking.status === 'Confirmed' && (
              <div className="mt-6 border-t border-[#DCD9CD] pt-4">
                <button onClick={() => handleUpdateStatus(booking.id, 'Completed')} className="w-full flex justify-center items-center space-x-2 py-2 border border-[#DCD9CD] text-white rounded-xl font-medium hover:bg-[#FFFFFF] transition-colors">
                  <CheckCircle size={16} className="text-green-500" /> <span>Mark Completed</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-12 text-center flex flex-col items-center">
          <CalendarIcon size={48} className="text-[#4A514D] mb-4 opacity-50" />
          <p className="text-[#4A514D] text-lg">No {filter.toLowerCase()} bookings found.</p>
        </div>
      )}
    </div>
  );
};

export default TrainerSessionBookings;
