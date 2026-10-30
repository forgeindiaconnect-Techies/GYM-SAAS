import { useState, useEffect } from 'react';
import { Users, Dumbbell, Activity, CalendarCheck, TrendingUp, AlertCircle, ArrowRight, Loader2, CheckCircle2, MessageSquare, Bell, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();
  const [stats, setStats] = useState({ trainers: 0, members: 0, bookings: 0, revenue: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGymStats = async () => {
    try {
      setLoading(true);
      const effectiveBranchId = user?.branchId;
      const queryParam = effectiveBranchId ? `?branchId=${effectiveBranchId}` : '';
      const userQueryParam = effectiveBranchId ? `&branchId=${effectiveBranchId}` : '';

      const [membersRes, usersRes, trainersRes, bookingsRes, salesRes, notifsRes] = await Promise.all([
        api.get(`/memberships/gym${queryParam}`).catch(() => ({ data: { memberships: [] } })),
        api.get(`/users?role=MEMBER${userQueryParam}`).catch(() => ({ data: { users: [] } })),
        api.get(`/trainers${queryParam}`).catch(() => ({ data: { trainers: [] } })),
        api.get(`/trainer-sessions/gym${queryParam}`).catch(() => ({ data: { sessions: [] } })),
        api.get(`/store/admin/sales${queryParam}`).catch(() => ({ data: { sales: [] } })),
        api.get(`/notifications${queryParam}`).catch(() => ({ data: { notifications: [] } }))
      ]);

      const directMembers = usersRes.data?.users?.length || 0;
      const membershipMembers = membersRes.data?.memberships?.length || 0;
      const membersCount = Math.max(directMembers, membershipMembers);

      const trainersCount = trainersRes.data?.trainers?.filter((t: any) => t.status === 'Active' || !t.status)?.length ?? (trainersRes.data?.trainers?.length || 0);
      const bookingsCount = bookingsRes.data?.sessions?.filter((s: any) => s.status === 'Pending').length || 0;
      const salesTotal = salesRes.data?.totals?.all ?? (salesRes.data?.sales?.reduce((acc: number, curr: any) => acc + (curr.totalAmount || curr.total || 0), 0) || 0);

      setStats({
        members: membersCount,
        trainers: trainersCount,
        bookings: bookingsCount,
        revenue: salesTotal
      });

      setNotifications(notifsRes.data?.notifications || []);
      setRecentSessions(bookingsRes.data?.sessions || []);
    } catch (err) {
      console.error('Failed to load gym dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGymStats();
  }, [user?.branchId]);

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
    { title: 'Total Members', value: stats.members, icon: Users, color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED] border border-[#FFEDD5]' },
    { title: 'Active Trainers', value: stats.trainers, icon: Dumbbell, color: 'text-[#15803D]', bg: 'bg-[#FFF7ED] border border-[#E2E8F0]/30' },
    { title: 'Pending Bookings', value: stats.bookings, icon: CalendarCheck, color: 'text-[#B45309]', bg: 'bg-amber-500/15 border border-amber-500/30' },
    { title: 'Store Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED] border border-[#FFEDD5]' }
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#EA580C]" size={40} /></div>;
  }

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight">
            {user?.branchName || user?.branchId ? `${user?.branchName || 'Branch'} Dashboard` : 'Gym Dashboard'}
          </h1>
          <p className="text-[#64748B] mt-1">
            Overview of {user?.branchName || user?.branchId ? `${user?.branchName || 'branch'}'s` : "your gym's"} performance, members, and bookings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 flex items-center space-x-4 shadow-sm hover:border-[#FFEDD5] transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.color}`}>
              <c.icon size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider truncate">{c.title}</p>
              <h3 className="text-2xl font-bold text-[#111827] mt-0.5">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Quick Actions */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col h-full shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-[#E2E8F0] pb-4">
            <h2 className="text-xl font-bold text-[#111827]">Quick Actions</h2>
            <span className="text-xs text-[#64748B] font-medium">Gym Management</span>
          </div>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <Link to="/admin/members" className="flex flex-col items-center justify-center p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:border-[#FDBA74] hover:bg-[#FFF7ED] transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Users size={24} />
              </div>
              <span className="font-semibold text-sm text-[#111827]">Add Member</span>
            </Link>
            <Link to="/admin/trainers" className="flex flex-col items-center justify-center p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:border-[#FDBA74] hover:bg-[#FFF7ED] transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Dumbbell size={24} />
              </div>
              <span className="font-semibold text-sm text-[#111827]">Hire Trainer</span>
            </Link>
            <Link to="/admin/equipment" className="flex flex-col items-center justify-center p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:border-[#FDBA74] hover:bg-[#FFF7ED] transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Activity size={24} />
              </div>
              <span className="font-semibold text-sm text-[#111827]">Add Equipment</span>
            </Link>
            <Link to="/admin/session-bookings" className="flex flex-col items-center justify-center p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:border-[#FDBA74] hover:bg-[#FFF7ED] transition-all text-center group">
              <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <CalendarCheck size={24} />
              </div>
              <span className="font-semibold text-sm text-[#111827]">View Bookings</span>
            </Link>
          </div>
        </div>

        {/* Alerts & Notifications with proper workflow */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col h-full shadow-sm">
          <div className="flex justify-between items-center mb-5 border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#111827]">Alerts & Notices</h2>
              {unreadNotifsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#C2410C] text-white font-bold">
                  {unreadNotifsCount} new
                </span>
              )}
            </div>
            <Link to="/admin/notifications" className="text-xs text-[#EA580C] font-semibold hover:underline flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col justify-start space-y-3">
            {notifications.length > 0 ? (
              notifications.slice(0, 3).map((notif) => {
                const isAlert = notif.type === 'alert';
                const isSuccess = notif.type === 'success';
                const isMessage = notif.type === 'message';
                const bgClass = isAlert ? 'bg-amber-50 border-amber-800/40 hover:bg-amber-900/30' :
                                isSuccess ? 'bg-[#FFF7ED] border-[#E2E8F0]/40 hover:bg-[#FFF7ED]/30' :
                                isMessage ? 'bg-[#FFF7ED] border-[#FFEDD5] hover:bg-[#FFF7ED]/30' :
                                'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#FFEDD5]';
                const iconColor = isAlert ? 'text-[#B45309]' :
                                  isSuccess ? 'text-[#15803D]' :
                                  isMessage ? 'text-[#EA580C]' : 'text-[#EA580C]';

                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start space-x-3.5 p-3.5 border rounded-xl cursor-pointer transition-all ${bgClass} ${!notif.isRead ? 'ring-1 ring-[#F97316]/30 shadow-xs' : 'opacity-90'}`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isAlert ? <AlertCircle size={20} className={iconColor} /> :
                       isSuccess ? <CheckCircle2 size={20} className={iconColor} /> :
                       isMessage ? <MessageSquare size={20} className={iconColor} /> :
                       <Bell size={20} className={iconColor} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[#111827] font-bold text-sm truncate">{notif.title}</h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#C2410C] shrink-0" />
                        )}
                      </div>
                      <p className="text-[#64748B] text-xs mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-[#64748B]">
                        <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                        <span className="text-[#EA580C] font-semibold flex items-center gap-0.5 hover:underline">
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
                  className="flex items-start space-x-3.5 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#FDBA74] transition-colors"
                >
                  <CalendarCheck size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-[#111827] font-bold text-sm">Session Bookings</h4>
                    <p className="text-[#64748B] text-xs mt-0.5">You have {stats.bookings} session booking(s) pending trainer confirmation.</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/admin/members')}
                  className="flex items-start space-x-3.5 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#FDBA74] transition-colors"
                >
                  <Users size={20} className="text-[#15803D] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-[#111827] font-bold text-sm">Active Memberships</h4>
                    <p className="text-[#64748B] text-xs mt-0.5">{stats.members} registered member(s) enrolled in your gym.</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/admin/store/sales')}
                  className="flex items-start space-x-3.5 p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#FDBA74] transition-colors"
                >
                  <TrendingUp size={20} className="text-[#B45309] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-[#111827] font-bold text-sm">Store & Revenue</h4>
                    <p className="text-[#64748B] text-xs mt-0.5">₹{stats.revenue.toLocaleString('en-IN')} total revenue recorded from gym store sales.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Live Session Attendance & Check-outs Section */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#111827]">Session Attendance &amp; Check-outs</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/30">
                Live Status
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">Real-time attendance, check-in, and check-out tracking for trainer sessions</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/attendance"
              className="text-xs font-bold text-[#EA580C] bg-[#FFF7ED] border border-[#FFEDD5] hover:bg-[#FFF7ED] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              View Full Attendance <ArrowRight size={12} />
            </Link>
            <Link
              to="/admin/session-bookings"
              className="text-xs font-bold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] hover:text-[#111827] hover:border-[#FFEDD5] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              Session Bookings <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#64748B] whitespace-nowrap">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] text-xs">
              <tr>
                <th className="px-4 py-3 font-semibold">Member</th>
                <th className="px-4 py-3 font-semibold">Assigned Trainer</th>
                <th className="px-4 py-3 font-semibold">Date &amp; Schedule</th>
                <th className="px-4 py-3 font-semibold">Check-in Time</th>
                <th className="px-4 py-3 font-semibold">Checkout Time</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {recentSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">
                    No session bookings or checkouts recorded yet.
                  </td>
                </tr>
              ) : (
                recentSessions.slice(0, 6).map((session: any) => {
                  const cName = session.customerId
                    ? `${session.customerId.firstName} ${session.customerId.lastName || ''}`.trim()
                    : 'Member';
                  const tName = session.trainerId?.name || 'Trainer';
                  const isCheckedOut = Boolean(session.checkOutTime);
                  const isCheckedIn = Boolean(session.checkInTime);
                  
                  return (
                    <tr key={session._id} className="hover:bg-[#FFF7ED] transition-colors">
                      <td className="px-4 py-3 font-semibold text-[#111827]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] flex items-center justify-center font-bold text-xs shrink-0">
                            {session.customerId?.firstName?.charAt(0) || 'M'}
                          </div>
                          <div>
                            <p className="font-bold text-[#111827]">{cName}</p>
                            <p className="text-[11px] text-[#64748B]">{session.customerId?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#111827]">{tName}</span>
                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] font-medium">
                          {session.mode || 'In-Gym'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#111827]">{session.date}</p>
                        <p className="text-[11px] text-[#64748B]">{session.startTime} - {session.endTime}</p>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {isCheckedIn ? (
                          <span className="text-[#EA580C] bg-[#FFF7ED] border border-[#FFEDD5] px-2 py-0.5 rounded-md font-semibold">
                            {new Date(session.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-[#64748B]">--:--</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {isCheckedOut ? (
                          <span className="text-[#15803D] bg-[#FFF7ED] border border-[#E2E8F0]/30 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 w-fit">
                            <CheckCircle2 size={11} /> {new Date(session.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : isCheckedIn || session.status === 'In Progress' ? (
                          <span className="text-[#B45309] bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 w-fit">
                            <Clock size={11} /> In Progress
                          </span>
                        ) : (
                          <span className="text-[#64748B]">Not Checked Out</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          isCheckedOut ? 'bg-[#FFF7ED] text-[#15803D] border-[#E2E8F0]/30' :
                          isCheckedIn || session.status === 'In Progress' ? 'bg-amber-500/15 text-[#B45309] border-amber-500/30' :
                          'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]'
                        }`}>
                          {isCheckedOut ? 'Completed' : (session.status || 'Active')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GymAdminDashboard;
