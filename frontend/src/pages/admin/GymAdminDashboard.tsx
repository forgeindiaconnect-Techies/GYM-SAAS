import { useState, useEffect } from 'react';
import { getDb } from '../../utils/mockDb';
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
    { title: 'Monthly Revenue', value: '₹12,450', icon: TrendingUp, color: 'text-[#16A34A]', bg: 'bg-[#16A34A]/10' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Gym Dashboard</h1>
        <p className="text-[#475569] mt-1">Overview of your gym's performance and activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${c.bg} ${c.color}`}>
              <c.icon size={28} />
            </div>
            <div>
              <p className="text-[#475569] text-sm font-medium">{c.title}</p>
              <h3 className="text-2xl font-bold text-[#1E293B]">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[#1E293B] mb-6 border-b border-[#CCFBF1] pb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/members" className="flex flex-col items-center justify-center p-6 bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all text-center">
              <Users size={32} className="text-[#16A34A] mb-3" />
              <span className="font-semibold text-[#1E293B]">Add Member</span>
            </Link>
            <Link to="/admin/trainers" className="flex flex-col items-center justify-center p-6 bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all text-center">
              <Dumbbell size={32} className="text-[#16A34A] mb-3" />
              <span className="font-semibold text-[#1E293B]">Hire Trainer</span>
            </Link>
            <Link to="/admin/equipment" className="flex flex-col items-center justify-center p-6 bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all text-center">
              <Activity size={32} className="text-[#16A34A] mb-3" />
              <span className="font-semibold text-[#1E293B]">Add Equipment</span>
            </Link>
            <Link to="/admin/session-bookings" className="flex flex-col items-center justify-center p-6 bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl hover:border-[#16A34A] hover:bg-[#16A34A]/5 transition-all text-center">
              <CalendarCheck size={32} className="text-[#16A34A] mb-3" />
              <span className="font-semibold text-[#1E293B]">View Bookings</span>
            </Link>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-[#CCFBF1] pb-4">
            <h2 className="text-xl font-bold text-[#1E293B]">Alerts</h2>
            <Link to="/admin/notifications" className="text-sm text-[#16A34A] font-medium hover:underline flex items-center">View All <ArrowRight size={14} className="ml-1"/></Link>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <AlertCircle size={20} className="text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[#1E293B] font-semibold text-sm">Equipment Maintenance</h4>
                <p className="text-[#475569] text-xs mt-1">Treadmill #4 requires scheduled maintenance tomorrow.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-[#0D9488]/10 border border-[#0D9488]/20 rounded-xl">
              <AlertCircle size={20} className="text-[#0D9488] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[#1E293B] font-semibold text-sm">Membership Expiring</h4>
                <p className="text-[#475569] text-xs mt-1">12 members have subscriptions expiring in the next 3 days.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[#1E293B] font-semibold text-sm">New Booking Requests</h4>
                <p className="text-[#475569] text-xs mt-1">You have {stats.bookings || 0} unconfirmed sessions awaiting trainer approval.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminDashboard;
