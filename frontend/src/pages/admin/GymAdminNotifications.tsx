import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertCircle, MessageSquare, Info, CheckCircle2, XCircle, CheckCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getIcon = (type: string) => {
  switch (type) {
    case 'alert': return <AlertCircle size={20} className="text-rose-600" />;
    case 'success': return <CheckCircle2 size={20} className="text-green-500" />;
    case 'message': return <MessageSquare size={20} className="text-[#167D78]" />;
    case 'info': return <Info size={20} className="text-[#167D78]" />;
    default: return <Bell size={20} className="text-gray-500" />;
  }
};

const getBg = (type: string) => {
  switch (type) {
    case 'alert': return 'bg-[#D8EAE7]/10 border-[#D8EAE7]/20';
    case 'success': return 'bg-green-500/10 border-green-500/20';
    case 'message': return 'bg-blue-500/10 border-[#D8EAE7]/20';
    case 'info': return 'bg-[#167D78]/10 border-[#167D78]/20';
    default: return 'bg-gray-500/10 border-gray-500/20';
  }
};

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
  return null;
};

const GymAdminNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';
      const res = await api.get(`/notifications${branchParam}`);
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.branchId]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const openNotification = (notif: any) => {
    if (!notif.isRead) markAsRead(notif._id);
    setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
    setSelected(notif);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#344B4A] tracking-tight">Notifications</h1>
          <p className="text-[#697778] mt-1">System alerts, messages, and gym activity updates.</p>
        </div>
        <div className="flex space-x-3 items-center">
          <span className="text-xs text-[#697778]">{unreadCount} unread</span>
          <button onClick={markAllAsRead} disabled={unreadCount === 0} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] border border-[#D9E2E3] text-[#344B4A] text-sm font-bold rounded-xl hover:bg-[#E8EFF0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <CheckCheck size={15} />
            Mark all as read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white border border-[#D8EAE7] rounded-2xl">
          <div className="w-8 h-8 border-4 border-[#167D78] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-2xl overflow-hidden">
          <div className="divide-y divide-[#D9E2E3]">
            {notifications.map((notif) => (
              <button
                key={notif._id}
                onClick={() => openNotification(notif)}
                className={`w-full text-left p-6 flex items-start space-x-4 transition-colors hover:bg-[#E8EFF0] ${selected?._id === notif._id ? 'bg-[#E8EFF0] ring-1 ring-[#167D78]/40' : !notif.isRead ? 'bg-[#FFFFFF]/50' : ''}`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${getBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className={`text-base truncate ${!notif.isRead ? 'font-bold text-[#344B4A]' : 'font-semibold text-[#697778]'}`}>{notif.title}</h3>
                    <span className="text-xs text-[#697778] whitespace-nowrap">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm line-clamp-2 ${!notif.isRead ? 'text-[#344B4A]' : 'text-[#697778]'}`}>{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#167D78] shrink-0 self-center mt-1" />
                )}
              </button>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Bell size={48} className="text-[#116660] mb-4" />
              <h3 className="text-lg font-bold text-[#344B4A]">All caught up!</h3>
              <p className="text-[#697778] text-sm mt-1">You have no new notifications.</p>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#D9E2E3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#D9E2E3] bg-[#E8EFF0]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${getBg(selected.type)}`}>
                  {getIcon(selected.type)}
                </div>
                <div>
                  <h3 className="font-bold text-[#344B4A] text-base">Notification Details</h3>
                  <p className="text-xs text-[#697778]">Viewing details on this page</p>
                </div>
              </div>
              <button 
                onClick={() => setSelected(null)} 
                className="text-[#697778] hover:text-[#344B4A] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-[#697778] uppercase tracking-wider font-semibold mb-1">Subject</p>
                <p className="font-bold text-lg text-[#344B4A]">{selected.title}</p>
              </div>

              <div className="bg-[#E8EFF0] border border-[#D9E2E3] rounded-xl p-4">
                <p className="text-xs text-[#697778] uppercase tracking-wider font-semibold mb-2">Message</p>
                <p className="text-sm text-[#344B4A] leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-[#697778] uppercase tracking-wider font-semibold mb-1">Type</p>
                  <p className="text-sm font-semibold text-[#344B4A] capitalize">{selected.type || 'info'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#697778] uppercase tracking-wider font-semibold mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 size={12} />
                    Read
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#697778] uppercase tracking-wider font-semibold mb-1">Received At</p>
                  <p className="text-sm font-medium text-[#344B4A]">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 border-t border-[#D9E2E3]">
              <div>
                {getNotificationLink(selected) && (
                  <button
                    onClick={() => {
                      const link = getNotificationLink(selected);
                      setSelected(null);
                      if (link) navigate(link);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#167D78] hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    <span>Go to related page</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-[#344B4A] text-white text-sm font-bold rounded-xl hover:bg-black transition-colors"
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

export default GymAdminNotifications;