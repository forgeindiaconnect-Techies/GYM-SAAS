import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle2, XCircle } from 'lucide-react';

const MemberMyBookings = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');

  const bookings = [
    {
      id: 1,
      trainer: 'Alex Johnson',
      type: 'Personal Training',
      date: 'Today, Oct 24',
      time: '05:00 PM - 06:00 PM',
      status: 'Upcoming',
      image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 2,
      trainer: 'Sarah Williams',
      type: 'Yoga Session',
      date: 'Tomorrow, Oct 25',
      time: '07:00 AM - 08:00 AM',
      status: 'Upcoming',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 3,
      trainer: 'Alex Johnson',
      type: 'Personal Training',
      date: 'Mon, Oct 21',
      time: '05:00 PM - 06:00 PM',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 4,
      trainer: 'Mike Davis',
      type: 'HIIT Class',
      date: 'Fri, Oct 18',
      time: '06:00 PM - 07:00 PM',
      status: 'Cancelled',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80'
    }
  ];

  const filteredBookings = bookings.filter(b => 
    activeTab === 'Upcoming' ? b.status === 'Upcoming' : (b.status === 'Completed' || b.status === 'Cancelled')
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">My Bookings</h1>
          <p className="text-[#4A514D] mt-1">Manage your upcoming and past training sessions.</p>
        </div>
        <button className="px-6 py-2.5 bg-[#34483F] text-white rounded-xl font-semibold hover:bg-[#C6A77D] transition-colors shadow-md shadow-green-500/20">
          Book New Session
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E8E5DA]">
        {['Upcoming', 'History'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-[#34483F] text-[#34483F]' 
                : 'border-transparent text-[#727975] hover:text-[#202522] hover:border-[#CBD5E1]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl border border-[#E8E5DA] shadow-sm hover:shadow-md transition-all overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <img src={booking.image} alt={booking.trainer} className="w-14 h-14 rounded-full object-cover border-2 border-[#F1F5F9]" />
                    <div>
                      <h3 className="font-bold text-[#202522]">{booking.trainer}</h3>
                      <p className="text-xs text-[#34483F] font-medium bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                        {booking.type}
                      </p>
                    </div>
                  </div>
                  {booking.status === 'Completed' && <CheckCircle2 className="text-green-500" size={24} />}
                  {booking.status === 'Cancelled' && <XCircle className="text-red-500" size={24} />}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-[#4A514D] text-sm">
                    <CalendarIcon size={16} className="mr-3 text-[#A8ADA9]" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center text-[#4A514D] text-sm">
                    <Clock size={16} className="mr-3 text-[#A8ADA9]" />
                    <span>{booking.time}</span>
                  </div>
                </div>
              </div>
              
              {activeTab === 'Upcoming' && (
                <div className="bg-[#F2EFE8] p-4 border-t border-[#E8E5DA] flex gap-3">
                  <button className="flex-1 py-2 text-sm font-semibold text-[#727975] bg-white border border-[#E8E5DA] rounded-lg hover:bg-gray-50 transition-colors">
                    Reschedule
                  </button>
                  <button className="flex-1 py-2 text-sm font-semibold text-red-600 bg-white border border-[#E8E5DA] rounded-lg hover:bg-red-50 transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-[#CBD5E1]">
            <CalendarIcon size={48} className="mx-auto text-[#CBD5E1] mb-4" />
            <h3 className="text-lg font-bold text-[#202522]">No {activeTab.toLowerCase()} bookings found</h3>
            <p className="text-[#727975] mt-2 max-w-sm mx-auto">You don't have any {activeTab.toLowerCase()} training sessions at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberMyBookings;
