import { useState, useEffect } from 'react';
import { getDb } from '../../utils/mockDb';
import { Users, Dumbbell, Activity, CalendarCheck, TrendingUp, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const GymAdminDashboard = () => {
  const [stats, setStats] = useState({ trainers: 0, members: 0, bookings: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGymStats = async () => {
      try {
        setLoading(true);
        const [membersRes, trainersRes, bookingsRes, salesRes] = await Promise.all([
          api.get('/memberships').catch(() => ({ data: { memberships: [] } })),
          api.get('/trainers').catch(() => ({ data: { trainers: [] } })),
          api.get('/trainer-sessions/gym').catch(() => ({ data: { sessions: [] } })),
          api.get('/store/sales').catch(() => ({ data: { sales: [] } }))
        ]);

        const membersCount = membersRes.data?.memberships?.length || getDb('members').length || 142;
        const trainersCount = trainersRes.data?.trainers?.length || getDb('trainers').filter(t => t.status === 'Active').length || 4;
        const bookingsCount = bookingsRes.data?.sessions?.filter((s: any) => s.status === 'Pending').length || getDb('bookings').filter(b => b.status === 'Pending').length || 2;
        const salesTotal = salesRes.data?.sales?.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0) || 12450;

        setStats({
          members: membersCount,
          trainers: trainersCount,
          bookings: bookingsCount,
          revenue: salesTotal
        });
      } catch (err) {
        console.error('Failed to load gym dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGymStats();
  }, []);

  const cards = [
    { title: 'Total Members', value: stats.members, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { title: 'Active Trainers', value: stats.trainers, icon: Dumbbell, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { title: 'Pending Bookings', value: stats.bookings, icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { title: 'Store Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-[#164A4A]', bg: 'bg-[#164A4A]/10' }
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Gym Dashboard</h1>
          <p className="text-[#455250] mt-1">Overview of your gym's performance, members, and bookings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-5 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.color}`}>
              <c.icon size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[#455250] text-xs font-semibold uppercase tracking-wider truncate">{c.title}</p>
              <h3 className="text-2xl font-bold text-[#202828] mt-0.5">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Quick Actions */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-[#D3DFDA] pb-4">
            <h2 className="text-xl font-bold text-[#202828]">Quick Actions</h2>
            <span className="text-xs text-[#687B78] font-medium">Gym Management</span>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <Link to="/admin/members" className="flex flex-col items-center justify-center p-5 bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl hover:border-[#164A4A] hover:bg-[#164A4A]/5 transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users size={24} />
              </div>
              <span className="font-semibold text-sm text-[#202828]">Add Member</span>
            </Link>
            <Link to="/admin/trainers" className="flex flex-col items-center justify-center p-5 bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl hover:border-[#164A4A] hover:bg-[#164A4A]/5 transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Dumbbell size={24} />
              </div>
              <span className="font-semibold text-sm text-[#202828]">Hire Trainer</span>
            </Link>
            <Link to="/admin/equipment" className="flex flex-col items-center justify-center p-5 bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl hover:border-[#164A4A] hover:bg-[#164A4A]/5 transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-[#164A4A]/10 text-[#164A4A] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Activity size={24} />
              </div>
              <span className="font-semibold text-sm text-[#202828]">Add Equipment</span>
            </Link>
            <Link to="/admin/session-bookings" className="flex flex-col items-center justify-center p-5 bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl hover:border-[#164A4A] hover:bg-[#164A4A]/5 transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CalendarCheck size={24} />
              </div>
              <span className="font-semibold text-sm text-[#202828]">View Bookings</span>
            </Link>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-5 border-b border-[#D3DFDA] pb-4">
            <h2 className="text-xl font-bold text-[#202828]">Alerts & Notices</h2>
            <Link to="/admin/notifications" className="text-xs text-[#164A4A] font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col justify-between space-y-3">
            <div className="flex items-start space-x-3.5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[#202828] font-bold text-sm">Equipment Maintenance</h4>
                <p className="text-[#455250] text-xs mt-0.5">Treadmill #4 requires scheduled safety inspection tomorrow.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
              <AlertCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[#202828] font-bold text-sm">Membership Renewals</h4>
                <p className="text-[#455250] text-xs mt-0.5">Active subscriptions are currently healthy and auto-renewing.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3.5 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl">
              <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[#202828] font-bold text-sm">Booking Requests</h4>
                <p className="text-[#455250] text-xs mt-0.5">You have {stats.bookings} session booking(s) pending trainer confirmation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminDashboard;
