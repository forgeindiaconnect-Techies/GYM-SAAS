import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Info,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  X,
  CheckCheck,
  Trash2,
  ExternalLink,
  Users
} from 'lucide-react';
import api from '../../utils/api';
import clsx from 'clsx';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  info: { icon: Info, color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]', border: 'border-[#FFEDD5]' },
  success: { icon: CheckCircle2, color: 'text-[#15803D]', bg: 'bg-[#FFF7ED]', border: 'border-[#E2E8F0]/30' },
  alert: { icon: AlertCircle, color: 'text-[#B91C1C]', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  message: { icon: MessageSquare, color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]', border: 'border-[#FFEDD5]' },
};

const TrainerNotifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'clients' | 'alerts'>('all');
  const [selected, setSelected] = useState<any>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const openNotification = (notif: any) => {
    if (!notif.isRead) markAsRead(notif._id);
    if (notif.link) {
      navigate(notif.link);
      return;
    }
    setSelected(notif);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    const text = `${notif.title} ${notif.message}`.toLowerCase();
    if (filter === 'clients') return text.includes('client') || text.includes('plan') || text.includes('session') || text.includes('booking');
    if (filter === 'alerts') return notif.type === 'alert' || text.includes('alert') || text.includes('warning');
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 w-full">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#F8FAFC] border border-[#E2E8F0] p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shadow-md shadow-orange-500/15 shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Coach Notifications
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Client workout updates, plan requests, session schedules, and direct messages.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
            {unreadCount} Unread
          </span>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#E2E8F0] text-xs font-bold text-white border border-[#E2E8F0] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCheck size={14} className="text-[#EA580C]" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2E8F0] no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            filter === 'all'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 border border-[#FDBA74]'
              : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
          )}
        >
          All ({notifications.length})
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            filter === 'unread'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 border border-[#FDBA74]'
              : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
          )}
        >
          Unread ({unreadCount})
        </button>

        <button
          onClick={() => setFilter('clients')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            filter === 'clients'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 border border-[#FDBA74]'
              : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
          )}
        >
          <Users size={13} className="text-[#EA580C]" />
          Client Activity
        </button>

        <button
          onClick={() => setFilter('alerts')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            filter === 'alerts'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 border border-[#FDBA74]'
              : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
          )}
        >
          <AlertCircle size={13} className="text-[#B91C1C]" />
          Alerts
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl">
          <div className="w-8 h-8 border-4 border-[#FDBA74] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl py-16 text-center shadow-xl">
          <Bell size={40} className="mx-auto text-zinc-600 mb-3" />
          <p className="text-white font-bold text-base">No notifications found</p>
          <p className="text-[#64748B] text-xs mt-1">
            {filter === 'unread' ? "You're all caught up! No unread notifications." : "Client workout submissions and updates will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map(notif => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
            const Icon = config.icon;
            const isUnread = !notif.isRead;

            return (
              <div
                key={notif._id}
                onClick={() => openNotification(notif)}
                className={clsx(
                  "w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 shadow-xl",
                  isUnread
                    ? 'bg-[#FFFFFF] border-l-4 border-l-[#F97316] border-[#E2E8F0] hover:border-[#FFEDD5]'
                    : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#E2E8F0] opacity-80'
                )}
              >
                <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border", config.bg, config.border, config.color)}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-3">
                    <h4 className={clsx("text-sm sm:text-base truncate", isUnread ? 'font-bold text-white' : 'font-semibold text-zinc-300')}>
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-zinc-500 whitespace-nowrap shrink-0">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#EA580C] hover:underline">
                      <span>View details</span>
                      <ExternalLink size={11} />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  {isUnread && (
                    <button
                      onClick={(e) => markAsRead(notif._id, e)}
                      title="Mark as read"
                      className="p-1.5 rounded-lg hover:bg-[#FFFFFF]/10 text-[#EA580C] hover:text-white transition cursor-pointer"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => deleteNotification(notif._id, e)}
                    title="Dismiss"
                    className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-500 hover:text-[#B91C1C] transition cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                {(() => {
                  const config = TYPE_CONFIG[selected.type] || TYPE_CONFIG.info;
                  const Icon = config.icon;
                  return (
                    <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center border", config.bg, config.border, config.color)}>
                      <Icon size={16} />
                    </div>
                  );
                })()}
                <h3 className="font-bold text-[#111827] text-base">Notification Details</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-[#FFFFFF]/10 text-zinc-400 hover:text-white transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">Title</p>
                <p className="font-bold text-white text-base">{selected.title}</p>
              </div>

              <div>
                <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">Message</p>
                <p className="text-sm text-zinc-300 leading-relaxed bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0]">
                  {selected.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0] text-xs">
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">Category</p>
                  <span className="capitalize font-semibold text-[#111827] px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
                    {selected.type || 'info'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">Received</p>
                  <span className="text-zinc-400">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                </div>
              </div>

              {selected.link && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const link = selected.link;
                      setSelected(null);
                      navigate(link);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs font-bold transition shadow-md shadow-orange-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Go to Related Page</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerNotifications;