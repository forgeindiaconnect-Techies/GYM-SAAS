import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertCircle, MessageSquare, Info, CheckCircle2, XCircle, CheckCheck, ArrowRight } from 'lucide-react';
import api from '../../utils/api';

const getIcon = (type: string) => {
  switch (type) {
    case 'alert': return <AlertCircle size={20} className="text-[#FED7AA]" />;
    case 'success': return <CheckCircle2 size={20} className="text-green-500" />;
    case 'message': return <MessageSquare size={20} className="text-blue-500" />;
    case 'info': return <Info size={20} className="text-purple-500" />;
    default: return <Bell size={20} className="text-gray-500" />;
  }
};

const getBg = (type: string) => {
  switch (type) {
    case 'alert': return 'bg-[#FED7AA]/10 border-[#FED7AA]/20';
    case 'success': return 'bg-green-500/10 border-green-500/20';
    case 'message': return 'bg-blue-500/10 border-[#FED7AA]/20';
    case 'info': return 'bg-purple-500/10 border-purple-500/20';
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
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Notifications</h1>
          <p className="text-[#78716C] mt-1">System alerts, messages, and gym activity updates.</p>
        </div>
        <div className="flex space-x-3 items-center">
          <span className="text-xs text-[#78716C]">{unreadCount} unread</span>
          <button onClick={markAllAsRead} disabled={unreadCount === 0} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] text-sm font-bold rounded-xl hover:bg-[#FFFDF8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <CheckCheck size={15} />
            Mark all as read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white border border-[#FED7AA] rounded-2xl">
          <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden">
          <div className="divide-y divide-[#E7E5E4]">
            {notifications.map((notif) => (
              <button
                key={notif._id}
                onClick={() => openNotification(notif)}
                className={`w-full text-left p-6 flex items-start space-x-4 transition-colors hover:bg-[#FFFDF8] ${selected?._id === notif._id ? 'bg-[#FFFDF8] ring-1 ring-[#F97316]/40' : !notif.isRead ? 'bg-[#FFFFFF]/50' : ''}`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${getBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className={`text-base truncate ${!notif.isRead ? 'font-bold text-[#292524]' : 'font-semibold text-[#78716C]'}`}>{notif.title}</h3>
                    <span className="text-xs text-[#78716C] whitespace-nowrap">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm line-clamp-2 ${!notif.isRead ? 'text-[#292524]' : 'text-[#78716C]'}`}>{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shrink-0 self-center mt-1" />
                )}
              </button>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Bell size={48} className="text-[#FED7AA] mb-4" />
              <h3 className="text-lg font-bold text-[#292524]">All caught up!</h3>
              <p className="text-[#78716C] text-sm mt-1">You have no new notifications.</p>
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#E7E5E4]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#E7E5E4] bg-[#FFFDF8]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${getBg(selected.type)}`}>
                  {getIcon(selected.type)}
                </div>
                <div>
                  <h3 className="font-bold text-[#292524] text-base">Notification Details</h3>
                  <p className="text-xs text-[#78716C]">Viewing details on this page</p>
                </div>
              </div>
              <button 
                onClick={() => setSelected(null)} 
                className="text-[#78716C] hover:text-[#292524] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-[#78716C] uppercase tracking-wider font-semibold mb-1">Subject</p>
                <p className="font-bold text-lg text-[#292524]">{selected.title}</p>
              </div>

              <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl p-4">
                <p className="text-xs text-[#78716C] uppercase tracking-wider font-semibold mb-2">Message</p>
                <p className="text-sm text-[#292524] leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-[#78716C] uppercase tracking-wider font-semibold mb-1">Type</p>
                  <p className="text-sm font-semibold text-[#292524] capitalize">{selected.type || 'info'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#78716C] uppercase tracking-wider font-semibold mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 size={12} />
                    Read
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#78716C] uppercase tracking-wider font-semibold mb-1">Received At</p>
                  <p className="text-sm font-medium text-[#292524]">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 border-t border-[#E7E5E4]">
              <div>
                {getNotificationLink(selected) && (
                  <button
                    onClick={() => {
                      const link = getNotificationLink(selected);
                      setSelected(null);
                      if (link) navigate(link);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#F97316] hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    <span>Go to related page</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-[#292524] text-white text-sm font-bold rounded-xl hover:bg-black transition-colors"
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