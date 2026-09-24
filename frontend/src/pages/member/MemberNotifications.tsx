import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Info, AlertCircle, CheckCircle, MessageSquare, XCircle, CheckCheck } from 'lucide-react';
import api from '../../utils/api';

const TYPE_STYLES: Record<string, { icon: any; color: string; bg: string }> = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  alert: { icon: AlertCircle, color: 'text-[#6fa3a0]', bg: 'bg-red-500/10' },
  message: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

const MemberNotifications = () => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end border-b border-[#D3DFDA] pb-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-[#455250]">Stay updated with alerts and messages</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#455250]">
            {notifications.filter(n => !n.isRead).length} unread
          </span>
          <button
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.isRead)}
            className="inline-flex items-center gap-1.5 text-sm text-[#164A4A] hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-[#D3DFDA] rounded-2xl py-16 text-center">
          <Bell size={40} className="mx-auto text-[#CBD5E1] mb-3" />
          <p className="text-[#687B78] font-semibold">No notifications yet</p>
          <p className="text-[#A8ADA9] text-sm mt-1">Alerts and messages will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => {
            const s = TYPE_STYLES[notif.type] || TYPE_STYLES.info;
            const Icon = s.icon;
            return (
              <button
                key={notif._id}
                onClick={() => openNotification(notif)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${!notif.isRead ? 'bg-[#FFFFFF] border-[#D3DFDA]' : 'bg-transparent border-transparent'} flex gap-4 hover:border-[#164A4A]/40`}
              >
                <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center shrink-0 ${s.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-3">
                    <h4 className={`font-bold truncate ${!notif.isRead ? 'text-[#202828]' : 'text-[#455250]'}`}>{notif.title}</h4>
                    <span className="text-xs text-[#455250] whitespace-nowrap">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-[#455250] line-clamp-2">{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#164A4A] shrink-0 self-center" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E8E5DA] bg-[#F2EFE8]">
              <div className="flex items-center gap-2">
                {(() => { const s = TYPE_STYLES[selected.type] || TYPE_STYLES.info; const I = s.icon; return <I size={18} className={s.color} />; })()}
                <h3 className="font-bold text-[#202828]">Notification Details</h3>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#687B78] hover:text-[#202828]">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-[#A8ADA9] uppercase tracking-wide font-semibold mb-1">Title</p>
                <p className="font-bold text-[#202828]">{selected.title}</p>
              </div>
              <div>
                <p className="text-xs text-[#A8ADA9] uppercase tracking-wide font-semibold mb-1">Message</p>
                <p className="text-sm text-[#455250] leading-relaxed">{selected.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-[#A8ADA9] uppercase tracking-wide font-semibold mb-1">Type</p>
                  <p className="text-sm font-semibold text-[#202828] capitalize">{selected.type || 'info'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A8ADA9] uppercase tracking-wide font-semibold mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${selected.isRead ? 'bg-gray-100 text-gray-600' : 'bg-[#D2B48C]/10 text-[#164A4A]'}`}>
                    <CheckCircle size={12} />
                    {selected.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#A8ADA9] uppercase tracking-wide font-semibold mb-1">Received At</p>
                  <p className="text-sm font-semibold text-[#202828]">
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

export default MemberNotifications;