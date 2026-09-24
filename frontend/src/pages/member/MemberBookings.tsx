import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

const MemberBookings = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-[#455250]">Manage your classes and trainer sessions</p>
        </div>
        <button className="bg-[#164A4A] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#C6A77D] transition-colors">
          <Plus size={18} /> Book New
        </button>
      </div>

      <div className="flex gap-4 border-b border-[#D3DFDA] pb-px">
        <button className="px-4 py-2 border-b-2 border-[#164A4A] text-[#164A4A] font-medium">Upcoming</button>
        <button className="px-4 py-2 border-b-2 border-transparent text-[#455250] hover:text-[#164A4A] font-medium">Past History</button>
      </div>

      <div className="space-y-4">
        {[
          { title: 'Yoga Flow', type: 'Group Class', date: 'Oct 12, 2026', time: '07:00 AM - 08:00 AM', location: 'Studio 1', status: 'Confirmed' },
          { title: 'Personal Training', type: '1-on-1', date: 'Oct 14, 2026', time: '05:00 PM - 06:00 PM', location: 'Main Floor', status: 'Confirmed' },
          { title: 'CrossFit', type: 'Group Class', date: 'Oct 16, 2026', time: '06:30 PM - 07:30 PM', location: 'CrossFit Area', status: 'Waitlist' }
        ].map((booking, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl flex flex-col items-center justify-center shrink-0">
                <span className="text-xs text-[#455250] uppercase">{booking.date.split(' ')[0]}</span>
                <span className="text-xl font-bold text-[#164A4A]">{booking.date.split(' ')[1].replace(',', '')}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{booking.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${booking.type === '1-on-1' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                    {booking.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-[#455250]">
                  <span className="flex items-center gap-1"><Clock size={14} /> {booking.time}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {booking.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${booking.status === 'Confirmed' ? 'text-green-500' : 'text-yellow-500'}`}>
                {booking.status}
              </span>
              <button className="px-4 py-2 border border-[#D3DFDA] hover:bg-[#E8E5DA] text-white rounded-lg text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberBookings;