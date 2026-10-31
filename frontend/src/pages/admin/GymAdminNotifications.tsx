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
  info: { icon: Info, color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]', border: 'border-[#FFEDD5]' },
  success: { icon: CheckCircle2, color: 'text-[#15803D]', bg: 'bg-[#FFF7ED]', border: 'border-[#E2E8F0]/30' },
  alert: { icon: AlertCircle, color: 'text-[#B91C1C]', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  message: { icon: MessageSquare, color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]', border: 'border-[#FFEDD5]' },
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#F8FAFC] border border-[#E2E8F0] p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shadow-md shadow-orange-500/15 shrink-0">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              System Notifications
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Real-time activity alerts, member actions, payment verifications, and store updates.
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F8FAFC] text-xs font-bold text-[#111827] border-2 border-[#CBD5E1] hover:border-[#EA580C] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            <CheckCheck size={14} className="text-[#EA580C]" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
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

        <button
          onClick={() => setFilter('members')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            filter === 'members'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 border border-[#FDBA74]'
              : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
          )}
        >
          <Users size={13} className="text-[#EA580C]" />
          Members & Enquiries
        </button>

        <button
          onClick={() => setFilter('billing')}
          className={clsx(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
            filter === 'billing'
              ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 border border-[#FDBA74]'
              : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
          )}
        >
          <CreditCard size={13} className="text-[#15803D]" />
          Billing & Store
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
                    ? 'bg-[#FFFFFF] border-l-4 border-l-[#F97316] border-[#E2E8F0] hover:border-[#FFEDD5]'
                    : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#E2E8F0] opacity-85'
                )}
              >
                <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border mt-0.5", config.bg, config.border, config.color)}>
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-3">
                    <h4 className={clsx("text-sm sm:text-base truncate", isUnread ? 'font-bold text-[#111827]' : 'font-semibold text-[#475569]')}>
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-[#64748B] whitespace-nowrap shrink-0">
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#64748B] line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-center">
                  {isUnread && (
                    <button
                      onClick={(e) => markAsRead(notif._id, e)}
                      title="Mark as read"
                      className="p-1.5 rounded-lg hover:bg-[#FFF7ED] text-[#EA580C] hover:text-[#9A3412] transition cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
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
                  <h3 className="font-bold text-[#111827] text-base">Notification Details</h3>
                  <p className="text-xs text-[#64748B]">Admin Activity Log</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#EA580C] hover:bg-[#FFF7ED] active:bg-[#FFEDD5] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                aria-label="Close"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">Subject</p>
                <p className="font-bold text-[#111827] text-lg">{selected.title}</p>
              </div>

              <div>
                <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">Message</p>
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                  <p className="text-sm text-[#1F2937] leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0] text-xs">
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">Type</p>
                  <span className="capitalize font-semibold text-[#111827] px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0]">
                    {selected.type || 'info'}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/30 font-semibold">
                    <CheckCircle2 size={12} />
                    Read
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">Timestamp</p>
                  <span className="text-[#64748B]">
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
                    className="flex-1 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs transition shadow-md shadow-orange-500/15 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Go to Related Page</span>
                    <ExternalLink size={13} />
                  </button>
                ) : (
                  <div />
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#111827] text-xs font-bold rounded-xl border border-[#E2E8F0] transition cursor-pointer"
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