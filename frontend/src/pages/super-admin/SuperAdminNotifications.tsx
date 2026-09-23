import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertCircle, MessageSquare, Info, CheckCircle2, XCircle, CheckCheck } from 'lucide-react';
import api from '../../utils/api';

const getIcon = (type: string) => {
  switch (type) {
    case 'alert': return <AlertCircle size={20} className="text-[#8FA89B]" />;
    case 'success': return <CheckCircle2 size={20} className="text-green-500" />;
    case 'message': return <MessageSquare size={20} className="text-blue-500" />;
    case 'info': return <Info size={20} className="text-purple-500" />;
    default: return <Bell size={20} className="text-gray-500" />;
  }
};

const getBg = (type: string) => {
  switch (type) {
    case 'alert': return 'bg-[#8FA89B]/10 border-[#8FA89B]/20';
    case 'success': return 'bg-green-500/10 border-green-500/20';
    case 'message': return 'bg-blue-500/10 border-blue-500/20';
    case 'info': return 'bg-purple-500/10 border-purple-500/20';
    default: return 'bg-gray-500/10 border-gray-500/20';
  }
};

const SuperAdminNotifications = () => {
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
    if (notif.link) {
      navigate(notif.link);
      return;
    }
    setSelected(notif);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">System Notifications</h1>
          <p className="text-[#4A514D] mt-1">Global alerts, system updates, and messages.</p>
        </div>
        <div className="flex space-x-3 items-center">
          <span className="text-xs text-[#4A514D]">{unreadCount} unread</span>
          <button onClick={markAllAsRead} disabled={unreadCount === 0} className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] border border-[#DCD9CD] text-[#202522] text-sm font-bold rounded-xl hover:bg-[#F5F3EE] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <CheckCheck size={15} />
            Mark all as read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white border border-[#E8E5DA] rounded-2xl">
          <div className="w-8 h-8 border-4 border-[#8FA89B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden">
          <div className="divide-y divide-[#DCD9CD]">
            {notifications.map((notif) => (
              <button
                key={notif._id}
                onClick={() => openNotification(notif)}
                className={`w-full text-left p-6 flex items-start space-x-4 transition-colors hover:bg-[#F5F3EE] ${!notif.isRead ? 'bg-[#FFFFFF]/50' : ''}`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${getBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className={`text-base truncate ${!notif.isRead ? 'font-bold text-[#202522]' : 'font-semibold text-[#4A514D]'}`}>{notif.title}</h3>
                    <span className="text-xs text-[#4A514D] whitespace-nowrap">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm line-clamp-2 ${!notif.isRead ? 'text-[#202522]' : 'text-[#4A514D]'}`}>{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8FA89B] shrink-0 self-center mt-1" />
                )}
              </button>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <Bell size={48} className="text-[#E8E5DA] mb-4" />
              <h3 className="text-lg font-bold text-[#202522]">All caught up!</h3>
              <p className="text-[#4A514D] text-sm mt-1">You have no new notifications.</p>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E8E5DA] bg-[#F2EFE8]">
              <div className="flex items-center gap-2">
                {getIcon(selected.type)}
                <h3 className="font-bold text-[#202522]">Notification Details</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#727975] hover:text-[#202522]">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-[#A8ADA9] uppercase tracking-wide font-semibold mb-1">Title</p>
                <p className="font-bold text-[#202522]">{selected.title}</p>
              </div>
              <div>
                <p className="text-xs text-[#A8ADA9] uppercase tracking-wide font-semibold mb-1">Message</p>
                <p className="text-sm text-[#4A514D] leading-relaxed">{selected.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-[#A8ADA9] uppercase tracking-wide font-semibold mb-1">Type</p>
                  <p className="text-sm font-semibold text-[#202522] capitalize">{selected.type || 'info'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A8ADA9] uppercase tracking-wide font-semibold mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${selected.isRead ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                    <CheckCircle2 size={12} />
                    {selected.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#A8ADA9] uppercase tracking-wide font-semibold mb-1">Received At</p>
                  <p className="text-sm font-semibold text-[#202522]">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminNotifications;