const fs = require('fs');
const path = require('path');

const writePage = (role, page, content) => {
  const filePath = path.join(__dirname, 'frontend', 'src', 'pages', role, `${page}.tsx`);
  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
};

const trainerSessionBookingsContent = `import React, { useState, useEffect } from 'react';
import { getDb, updateItem } from '../../../utils/mockDb';
import { CheckCircle, XCircle, Clock, Calendar as CalendarIcon, Video, MapPin, Search } from 'lucide-react';

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
          <h1 className="text-3xl font-bold text-white tracking-tight">Session Bookings</h1>
          <p className="text-[#A1A1AA] mt-1">Manage your upcoming training sessions with members.</p>
        </div>
        <div className="flex space-x-2">
          {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)}
              className={\`px-4 py-2 rounded-xl font-medium text-sm transition-colors \${filter === f ? 'bg-[#FF3366] text-white' : 'bg-[#151515] text-[#A1A1AA] hover:bg-[#272727]'}\`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(booking => (
          <div key={booking.id} className="bg-[#101010] border border-[#272727] rounded-2xl p-6 hover:border-[#FF3366]/30 transition-colors flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Member ID: {booking.memberId}</h3>
                <span className={\`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold 
                  \${booking.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                    booking.status === 'Confirmed' ? 'bg-blue-500/10 text-blue-500' :
                    booking.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                    'bg-red-500/10 text-red-500'}\`}>
                  {booking.status}
                </span>
              </div>
              <div className="w-10 h-10 bg-[#151515] border border-[#272727] rounded-full flex items-center justify-center text-[#FF3366]">
                {booking.type === 'Online' ? <Video size={18} /> : <MapPin size={18} />}
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#A1A1AA] flex-1 border-t border-[#272727] pt-4">
              <div className="flex items-center space-x-3">
                <CalendarIcon size={16} className="text-[#FF3366]" />
                <span className="text-white">{booking.date}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock size={16} className="text-[#FF3366]" />
                <span className="text-white">{booking.time}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-4 flex justify-center text-[#FF3366] text-xs font-bold">TYPE</span>
                <span className="text-white">{booking.type}</span>
              </div>
            </div>

            {booking.status === 'Pending' && (
              <div className="mt-6 flex space-x-3 border-t border-[#272727] pt-4">
                <button onClick={() => handleUpdateStatus(booking.id, 'Cancelled')} className="flex-1 flex justify-center items-center space-x-2 py-2 bg-[#151515] text-[#A1A1AA] rounded-xl font-medium hover:text-white transition-colors">
                  <XCircle size={16} /> <span>Reject</span>
                </button>
                <button onClick={() => handleUpdateStatus(booking.id, 'Confirmed')} className="flex-1 flex justify-center items-center space-x-2 py-2 bg-[#FF3366] text-white rounded-xl font-medium hover:bg-[#E62E5C] transition-colors">
                  <CheckCircle size={16} /> <span>Accept</span>
                </button>
              </div>
            )}
            
            {booking.status === 'Confirmed' && (
              <div className="mt-6 border-t border-[#272727] pt-4">
                <button onClick={() => handleUpdateStatus(booking.id, 'Completed')} className="w-full flex justify-center items-center space-x-2 py-2 border border-[#272727] text-white rounded-xl font-medium hover:bg-[#151515] transition-colors">
                  <CheckCircle size={16} className="text-green-500" /> <span>Mark Completed</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-12 text-center flex flex-col items-center">
          <CalendarIcon size={48} className="text-[#A1A1AA] mb-4 opacity-50" />
          <p className="text-[#A1A1AA] text-lg">No {filter.toLowerCase()} bookings found.</p>
        </div>
      )}
    </div>
  );
};

export default TrainerSessionBookings;
`;

const gymAdminDashboardContent = `import React, { useState, useEffect } from 'react';
import { getDb } from '../../../utils/mockDb';
import { Users, Dumbbell, Activity, CalendarCheck, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const GymAdminDashboard = () => {
  const [stats, setStats] = useState({ trainers: 0, members: 0, bookings: 0 });

  useEffect(() => {
    setStats({
      trainers: getDb('trainers').filter(t => t.status === 'Active').length,
      members: getDb('members').length,
      bookings: getDb('bookings').filter(b => b.status === 'Pending').length
    });
  }, []);

  const cards = [
    { title: 'Total Members', value: stats.members || 142, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Active Trainers', value: stats.trainers || 0, icon: Dumbbell, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Pending Bookings', value: stats.bookings || 0, icon: CalendarCheck, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: 'Monthly Revenue', value: '$12,450', icon: TrendingUp, color: 'text-[#FF3366]', bg: 'bg-[#FF3366]/10' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gym Dashboard</h1>
        <p className="text-[#A1A1AA] mt-1">Overview of your gym's performance and activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#101010] border border-[#272727] rounded-2xl p-6 flex items-center space-x-4">
            <div className={\`w-14 h-14 rounded-full flex items-center justify-center \${c.bg} \${c.color}\`}>
              <c.icon size={28} />
            </div>
            <div>
              <p className="text-[#A1A1AA] text-sm font-medium">{c.title}</p>
              <h3 className="text-2xl font-bold text-white">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-[#272727] pb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/members" className="flex flex-col items-center justify-center p-6 bg-[#151515] border border-[#272727] rounded-xl hover:border-[#FF3366] hover:bg-[#FF3366]/5 transition-all text-center">
              <Users size={32} className="text-[#FF3366] mb-3" />
              <span className="font-semibold text-white">Add Member</span>
            </Link>
            <Link to="/admin/trainers" className="flex flex-col items-center justify-center p-6 bg-[#151515] border border-[#272727] rounded-xl hover:border-[#FF3366] hover:bg-[#FF3366]/5 transition-all text-center">
              <Dumbbell size={32} className="text-[#FF3366] mb-3" />
              <span className="font-semibold text-white">Hire Trainer</span>
            </Link>
            <Link to="/admin/equipment" className="flex flex-col items-center justify-center p-6 bg-[#151515] border border-[#272727] rounded-xl hover:border-[#FF3366] hover:bg-[#FF3366]/5 transition-all text-center">
              <Activity size={32} className="text-[#FF3366] mb-3" />
              <span className="font-semibold text-white">Add Equipment</span>
            </Link>
            <Link to="/admin/session-bookings" className="flex flex-col items-center justify-center p-6 bg-[#151515] border border-[#272727] rounded-xl hover:border-[#FF3366] hover:bg-[#FF3366]/5 transition-all text-center">
              <CalendarCheck size={32} className="text-[#FF3366] mb-3" />
              <span className="font-semibold text-white">View Bookings</span>
            </Link>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-[#272727] pb-4">
            <h2 className="text-xl font-bold text-white">Alerts</h2>
            <Link to="/admin/notifications" className="text-sm text-[#FF3366] font-medium hover:underline flex items-center">View All <ArrowRight size={14} className="ml-1"/></Link>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <AlertCircle size={20} className="text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold text-sm">Equipment Maintenance</h4>
                <p className="text-[#A1A1AA] text-xs mt-1">Treadmill #4 requires scheduled maintenance tomorrow.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold text-sm">Membership Expiring</h4>
                <p className="text-[#A1A1AA] text-xs mt-1">12 members have subscriptions expiring in the next 3 days.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-semibold text-sm">New Booking Requests</h4>
                <p className="text-[#A1A1AA] text-xs mt-1">You have {stats.bookings || 0} unconfirmed sessions awaiting trainer approval.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminDashboard;
`;

writePage('trainer', 'TrainerSessionBookings', trainerSessionBookingsContent);
writePage('admin', 'GymAdminDashboard', gymAdminDashboardContent);
console.log('Finished updating more complex pages.');
