import { useState } from 'react';
import { Search, Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';

const mockBookings = [
  { id: 'B001', member: 'John Doe', trainer: 'Arnold S.', date: 'Today', time: '10:00 AM', type: 'Weightlifting Focus', status: 'Confirmed' },
  { id: 'B002', member: 'Emily Davis', trainer: 'Sarah C.', date: 'Today', time: '02:00 PM', type: 'HIIT Session', status: 'Pending' },
  { id: 'B003', member: 'Mike Johnson', trainer: 'Mike T.', date: 'Tomorrow', time: '09:00 AM', type: 'General Fitness', status: 'Confirmed' },
  { id: 'B004', member: 'Jane Smith', trainer: 'Sarah C.', date: 'Sep 16, 2026', time: '11:00 AM', type: 'Yoga/Mobility', status: 'Cancelled' },
  { id: 'B005', member: 'Robert Chen', trainer: 'Arnold S.', date: 'Sep 17, 2026', time: '04:00 PM', type: 'Strength Training', status: 'Confirmed' },
];

const GymAdminSessionBookings = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Session Bookings</h1>
          <p className="text-[#4A514D] mt-1">Manage personal training appointments and class reservations.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search by member or trainer name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl pl-10 pr-4 py-3 text-[#202522] outline-none focus:border-[#34483F]"
          />
          <Search className="absolute left-3 top-3.5 text-[#4A514D]" size={18} />
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-3 bg-[#FFFFFF] border border-[#DCD9CD] text-[#202522] rounded-xl hover:bg-[#FFFFFF] transition-colors font-medium">
            All Status
          </button>
          <button className="px-4 py-3 bg-[#FFFFFF] border border-[#DCD9CD] text-[#202522] rounded-xl hover:bg-[#FFFFFF] transition-colors font-medium">
            Date Range
          </button>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#4A514D] whitespace-nowrap">
            <thead className="bg-[#FFFFFF] border-b border-[#DCD9CD] text-[#202522]">
              <tr>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Assigned Trainer</th>
                <th className="px-6 py-4 font-semibold">Schedule</th>
                <th className="px-6 py-4 font-semibold">Session Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD9CD]">
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#F5F3EE] transition-colors">
                  <td className="px-6 py-4 font-mono text-[#EF4444] font-bold">{booking.id}</td>
                  <td className="px-6 py-4 font-semibold text-[#202522]">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-[#E8E5DA] flex items-center justify-center text-xs">{booking.member.charAt(0)}</div>
                      <span>{booking.member}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center"><User size={14} className="mr-2 text-[#4A514D]"/> {booking.trainer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-xs">
                      <p className="flex items-center text-[#202522]"><CalendarIcon size={12} className="mr-1.5 text-[#34483F]"/> {booking.date}</p>
                      <p className="flex items-center"><Clock size={12} className="mr-1.5"/> {booking.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{booking.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center w-max
                      ${booking.status === 'Confirmed' ? 'bg-green-500/10 text-green-500' : 
                        booking.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-[#8FA89B]/10 text-[#8FA89B]'}`}>
                      {booking.status === 'Confirmed' && <CheckCircle2 size={12} className="mr-1" />}
                      {booking.status === 'Cancelled' && <XCircle size={12} className="mr-1" />}
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-[#4A514D] hover:text-[#202522] hover:bg-[#FFFFFF] rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GymAdminSessionBookings;
