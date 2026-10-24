import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertCircle,
  MessageSquare,
  Info,
  CheckCircle2,
  X,
  CheckCheck,
  ArrowRight,
  Trash2,
  ExternalLink,
  Users,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import clsx from 'clsx';

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string }> = {
  info: { icon: Info, color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/15', border: 'border-[#2DD4BF]/30' },
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-[#2DD4BF]/15', border: 'border-[#2A3A3A]/30' },
  alert: { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  message: { icon: MessageSquare, color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/15', border: 'border-[#2DD4BF]/30' },
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
  if (title.includes('challenge') || msg.includes('challenge')) return '/admin/rewards';
  if (title.includes('reward') || msg.includes('reward')) return '/admin/rewards';
  if (title.includes('referral') || msg.includes('referral')) return '/admin/referrals';
  return null;
};

const GymAdminNotifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts' | 'members' | 'billing'>('all');
  const [selected, setSelected] = useState<any>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
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
    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    const link = getNotificationLink(notif);
    if (link && !notif.isRead) {
      // If user clicks, we can navigate directly or show modal
    }
    setSelected(notif);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    const text = `${notif.title} ${notif.message}`.toLowerCase();
    if (filter === 'alerts') return notif.type === 'alert' || text.includes('alert') || text.includes('warning');
    if (filter === 'members') return text.includes('member') || text.includes('enquiry') || text.includes('lead') || text.includes('trial');
    if (filter === 'billing') return text.includes('payment') || text.includes('order') || text.includes('store') || text.includes('subscription') || text.includes('invoice');
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 w-full">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#141D1E] via-[#151515] to-[#0E1415] border border-[#2A3A3A] p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF] shadow-md shadow-[#2DD4BF]/10 shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              System Notifications
            </h1>
            <p className="text-xs sm:text-sm text-[#9AAEAE] mt-0.5">
              Real-time activity alerts, member actions, payment verifications, and store updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30">
            {unreadCount} Unread
          </span>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B2728] hover:bg-[#2A3A3A] text-xs font-bold text-white border border-[#2A3A3A] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCheck size={14} className="text-[#2DD4BF]" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#2A3A3A] no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            filter === 'all'
              ? 'bg-[#2DD4BF] text-white shadow-md shadow-[#2DD4BF]/25 border border-[#2DD4BF]'
              : 'bg-[#141D1E] text-[#9AAEAE] hover:text-white border border-[#2A3A3A]'
          )}
        >
          All ({notifications.length})
        </button>

        <button
          onClick={() => setFilter('unread')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            filter === 'unread'
              ? 'bg-[#2DD4BF] text-white shadow-md shadow-[#2DD4BF]/25 border border-[#2DD4BF]'
              : 'bg-[#141D1E] text-[#9AAEAE] hover:text-white border border-[#2A3A3A]'
          )}
        >
          Unread ({unreadCount})
        </button>

        <button
          onClick={() => setFilter('alerts')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            filter === 'alerts'
              ? 'bg-[#2DD4BF] text-white shadow-md shadow-[#2DD4BF]/25 border border-[#2DD4BF]'
              : 'bg-[#141D1E] text-[#9AAEAE] hover:text-white border border-[#2A3A3A]'
          )}
        >
          <AlertCircle size={13} className="text-rose-400" />
          Alerts
        </button>

        <button
          onClick={() => setFilter('members')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            filter === 'members'
              ? 'bg-[#2DD4BF] text-white shadow-md shadow-[#2DD4BF]/25 border border-[#2DD4BF]'
              : 'bg-[#141D1E] text-[#9AAEAE] hover:text-white border border-[#2A3A3A]'
          )}
        >
          <Users size={13} className="text-[#2DD4BF]" />
          Members & Enquiries
        </button>

        <button
          onClick={() => setFilter('billing')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            filter === 'billing'
              ? 'bg-[#2DD4BF] text-white shadow-md shadow-[#2DD4BF]/25 border border-[#2DD4BF]'
              : 'bg-[#141D1E] text-[#9AAEAE] hover:text-white border border-[#2A3A3A]'
          )}
        >
          <CreditCard size={13} className="text-emerald-400" />
          Billing & Store
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 bg-[#141D1E] border border-[#2A3A3A] rounded-3xl">
          <div className="w-8 h-8 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl py-16 text-center shadow-xl">
          <Bell size={40} className="mx-auto text-zinc-600 mb-3" />
          <p className="text-white font-bold text-base">No notifications found</p>
          <p className="text-[#9AAEAE] text-xs mt-1">
            {filter === 'unread' ? "You're all caught up! No unread notifications." : "System alerts and gym events will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
            const Icon = config.icon;
            const isUnread = !notif.isRead;
            const link = getNotificationLink(notif);

            return (
              <div
                key={notif._id}
                onClick={() => openNotification(notif)}
                className={clsx(
                  "w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 shadow-xl group",
                  isUnread
                    ? 'bg-[#141D1E] border-l-4 border-l-[#2DD4BF] border-[#2A3A3A] hover:border-[#2DD4BF]/60'
                    : 'bg-[#141414] border-[#2A3A3A] hover:border-[#383838] opacity-85'
                )}
              >
                <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5", config.bg, config.border, config.color)}>
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

                  <p className="text-xs sm:text-sm text-[#9AAEAE] line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  {link && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!notif.isRead) markAsRead(notif._id);
                        navigate(link);
                      }}
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2DD4BF] hover:text-[#5E7BFF] transition cursor-pointer"
                    >
                      <span>Go to related section</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  {isUnread && (
                    <button
                      onClick={(e) => markAsRead(notif._id, e)}
                      title="Mark as read"
                      className="p-1.5 rounded-lg hover:bg-[#141D1E]/10 text-[#2DD4BF] hover:text-white transition cursor-pointer"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => deleteNotification(notif._id, e)}
                    title="Dismiss"
                    className="p-1.5 rounded-lg hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 transition cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#2A3A3A]">
              <div className="flex items-center gap-3">
                {(() => {
                  const config = TYPE_CONFIG[selected.type] || TYPE_CONFIG.info;
                  const Icon = config.icon;
                  return (
                    <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center border", config.bg, config.border, config.color)}>
                      <Icon size={18} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-bold text-white text-base">Notification Details</h3>
                  <p className="text-xs text-[#9AAEAE]">Admin Activity Log</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-[#141D1E]/10 text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] text-[#9AAEAE] uppercase tracking-wider font-bold mb-1">Subject</p>
                <p className="font-bold text-white text-lg">{selected.title}</p>
              </div>

              <div>
                <p className="text-[10px] text-[#9AAEAE] uppercase tracking-wider font-bold mb-1">Message</p>
                <div className="bg-[#0E1415] p-4 rounded-2xl border border-[#2A3A3A]">
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#2A3A3A] text-xs">
                <div>
                  <p className="text-[10px] text-[#9AAEAE] uppercase tracking-wider font-bold mb-1">Type</p>
                  <span className="capitalize font-semibold text-white px-2 py-0.5 rounded-md bg-[#1B2728] border border-[#2A3A3A]">
                    {selected.type || 'info'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[#9AAEAE] uppercase tracking-wider font-bold mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2DD4BF]/15 text-emerald-400 border border-[#2A3A3A]/30 font-semibold">
                    <CheckCircle2 size={12} />
                    Read
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-[#9AAEAE] uppercase tracking-wider font-bold mb-1">Timestamp</p>
                  <span className="text-zinc-400">
                    {selected.createdAt ? new Date(selected.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                {getNotificationLink(selected) ? (
                  <button
                    onClick={() => {
                      const link = getNotificationLink(selected);
                      setSelected(null);
                      if (link) navigate(link);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs font-bold transition shadow-md shadow-[#2DD4BF]/25 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Go to Related Page</span>
                    <ExternalLink size={13} />
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="px-5 py-2.5 bg-[#1B2728] hover:bg-[#2A3A3A] text-white text-xs font-bold rounded-xl border border-[#2A3A3A] transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminNotifications;