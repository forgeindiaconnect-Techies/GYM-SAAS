import { useState, useEffect } from 'react';
import { Users, Dumbbell, Activity, CalendarCheck, TrendingUp, AlertCircle, ArrowRight, Loader2, CheckCircle2, MessageSquare, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const getNotificationLink = (notif: any) => {
  if (notif.link) return notif.link;
  const title = (notif.title || '').toLowerCase();
  const msg = (notif.message || '').toLowerCase();
  if (title.includes('enquiry') || msg.includes('enquiry') || title.includes('lead')) return '/admin/enquiries';
  if (title.includes('member') || msg.includes('member') || title.includes('registration') || title.includes('trial')) return '/admin/members';
  if (title.includes('payment') || msg.includes('payment') || title.includes('due') || title.includes('fee')) return '/admin/payments';
  if (title.includes('order') || msg.includes('order') || title.includes('store') || title.includes('sale')) return '/admin/store/sales';
  if (title.includes('booking') || msg.includes('booking') || title.includes('session')) return '/admin/session-bookings';
  if (title.includes('equipment') || msg.includes('equipment') || title.includes('maintenance')) return '/admin/equipment';
  if (title.includes('trainer') || msg.includes('trainer')) return '/admin/trainers';
  return '/admin/notifications';
};

const GymAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ trainers: 0, members: 0, bookings: 0, revenue: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGymStats = async () => {
    try {
      setLoading(true);
      const [membersRes, usersRes, trainersRes, bookingsRes, salesRes, notifsRes] = await Promise.all([
        api.get('/memberships/gym').catch(() => ({ data: { memberships: [] } })),
        api.get('/users?role=MEMBER').catch(() => ({ data: { users: [] } })),
        api.get('/trainers').catch(() => ({ data: { trainers: [] } })),
        api.get('/trainer-sessions/gym').catch(() => ({ data: { sessions: [] } })),
        api.get('/store/sales').catch(() => ({ data: { sales: [] } })),
        api.get('/notifications').catch(() => ({ data: { notifications: [] } }))
      ]);

      const directMembers = usersRes.data?.users?.length || 0;
      const membershipMembers = membersRes.data?.memberships?.length || 0;
      const membersCount = Math.max(directMembers, membershipMembers);

      const trainersCount = trainersRes.data?.trainers?.filter((t: any) => t.status === 'Active' || !t.status)?.length ?? (trainersRes.data?.trainers?.length || 0);
      const bookingsCount = bookingsRes.data?.sessions?.filter((s: any) => s.status === 'Pending').length || 0;
      const salesTotal = salesRes.data?.sales?.reduce((acc: number, curr: any) => acc + (curr.totalAmount || curr.total || 0), 0) || 0;

      setStats({
        members: membersCount,
        trainers: trainersCount,
        bookings: bookingsCount,
        revenue: salesTotal
      });

      setNotifications(notifsRes.data?.notifications || []);
    } catch (err) {
      console.error('Failed to load gym dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGymStats();
  }, []);

  const handleNotificationClick = async (notif: any) => {
    try {
      if (!notif.isRead) {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
    const targetLink = getNotificationLink(notif);
    navigate(targetLink);
  };

  const cards = [
    { title: 'Total Members', value: stats.members, icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    { title: 'Active Trainers', value: stats.trainers, icon: Dumbbell, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    { title: 'Pending Bookings', value: stats.bookings, icon: CalendarCheck, color: 'text-amber-600', bg: 'bg-amber-500/10' },
    { title: 'Store Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-[#164A4A]', bg: 'bg-[#164A4A]/10' }
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>;
  }

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

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

        {/* Alerts & Notifications with proper workflow */}
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-5 border-b border-[#D3DFDA] pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#202828]">Alerts & Notices</h2>
              {unreadNotifsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#164A4A] text-white">
                  {unreadNotifsCount} new
                </span>
              )}
            </div>
            <Link to="/admin/notifications" className="text-xs text-[#164A4A] font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col justify-start space-y-3">
            {notifications.length > 0 ? (
              notifications.slice(0, 3).map((notif) => {
                const isAlert = notif.type === 'alert';
                const isSuccess = notif.type === 'success';
                const isMessage = notif.type === 'message';
                const bgClass = isAlert ? 'bg-amber-50/80 border-amber-200/90 hover:bg-amber-100/70' :
                                isSuccess ? 'bg-emerald-50/80 border-emerald-200/90 hover:bg-emerald-100/70' :
                                isMessage ? 'bg-blue-50/80 border-blue-200/90 hover:bg-blue-100/70' :
                                'bg-purple-50/80 border-purple-200/90 hover:bg-purple-100/70';
                const iconColor = isAlert ? 'text-amber-600' :
                                  isSuccess ? 'text-emerald-600' :
                                  isMessage ? 'text-blue-600' : 'text-purple-600';

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start space-x-3.5 p-3.5 border rounded-xl cursor-pointer transition-all ${bgClass} ${!notif.isRead ? 'ring-1 ring-[#164A4A]/20 shadow-xs' : 'opacity-90'}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isAlert ? <AlertCircle size={20} className={iconColor} /> :
                       isSuccess ? <CheckCircle2 size={20} className={iconColor} /> :
                       isMessage ? <MessageSquare size={20} className={iconColor} /> :
                       <Bell size={20} className={iconColor} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[#202828] font-bold text-sm truncate">{notif.title}</h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#164A4A] shrink-0" />
                        )}
                      </div>
                      <p className="text-[#455250] text-xs mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-[#687B78]">
                        <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                        <span className="text-[#164A4A] font-semibold flex items-center gap-0.5 hover:underline">
                          Open <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                {/* Fallback to live system alerts when no custom notifications exist */}
                <div 
                  onClick={() => navigate('/admin/session-bookings')}
                  className="flex items-start space-x-3.5 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl cursor-pointer hover:bg-blue-100/50 transition-colors"
                >
                  <CalendarCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-[#202828] font-bold text-sm">Session Bookings</h4>
                    <p className="text-[#455250] text-xs mt-0.5">You have {stats.bookings} session booking(s) pending trainer confirmation.</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/admin/members')}
                  className="flex items-start space-x-3.5 p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl cursor-pointer hover:bg-emerald-100/50 transition-colors"
                >
                  <Users size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-[#202828] font-bold text-sm">Active Memberships</h4>
                    <p className="text-[#455250] text-xs mt-0.5">{stats.members} registered member(s) enrolled in your gym.</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/admin/store/sales')}
                  className="flex items-start space-x-3.5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl cursor-pointer hover:bg-amber-100/50 transition-colors"
                >
                  <TrendingUp size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-[#202828] font-bold text-sm">Store & Revenue</h4>
                    <p className="text-[#455250] text-xs mt-0.5">₹{stats.revenue.toLocaleString('en-IN')} total revenue recorded from gym store sales.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminDashboard;
