import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { ExpiryPopup } from '../components/ExpiryPopup';
import GymSmartAssistant from '../components/GymSmartAssistant';
import {
  LayoutDashboard, Users, Dumbbell, CreditCard,
  Calendar, CalendarCheck, IndianRupee, UserPlus,
  Bell, BarChart, Activity, Building2, Menu, LogOut, Trash2, MapPin, MessageSquare,
  Video, Trophy, Gift, Award,
  Store, Package, Boxes, ShoppingCart, Bot, TrendingUp, Star,
  Briefcase, UserCheck, Search, X
} from 'lucide-react';

const getNotificationLink = (notif: any) => {
  if (notif.link) return notif.link;
  const title = (notif.title || '').toLowerCase();
  const msg = (notif.message || '').toLowerCase();
  if (title.includes('enquiry') || msg.includes('enquiry') || title.includes('lead')) return '/admin/enquiries';
  if (title.includes('member') || msg.includes('member') || title.includes('registration') || title.includes('trial')) return '/admin/members';
  if (title.includes('payment') || msg.includes('payment') || title.includes('due') || title.includes('fee')) return '/admin/payments';
  if (title.includes('order') || msg.includes('order') || title.includes('store') || title.includes('sale')) return '/admin/store/orders';
  if (title.includes('booking') || msg.includes('booking') || title.includes('session')) return '/admin/session-bookings';
  if (title.includes('equipment') || msg.includes('equipment') || title.includes('maintenance')) return '/admin/equipment';
  if (title.includes('trainer') || msg.includes('trainer')) return '/admin/trainers';
  return '/admin/notifications';
};

const GymAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trainerFeesOpen, setTrainerFeesOpen] = useState(() => location.pathname.startsWith('/admin/trainer-fees'));

  useEffect(() => {
    if (location.pathname.startsWith('/admin/trainer-fees') && !trainerFeesOpen) {
      setTrainerFeesOpen(true);
    }
  }, [location.pathname]);
  const [gym, setGym] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const api = (await import('../utils/api')).default;
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      const api = (await import('../utils/api')).default;
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isBranchUser = Boolean(user?.branchId || branches.some(b => b.managerId === user?.id || b.email?.toLowerCase() === user?.email?.toLowerCase()));

  useEffect(() => {
    if (user?.branchId) {
      setSelectedBranch(String(user.branchId));
    }
  }, [user?.branchId]);

  useEffect(() => {
    if (user?.gymId) {
      import('../utils/api').then(({ default: api }) => {
        api.get(`/gyms/${user.gymId}`)
          .then(res => setGym(res.data.gym))
          .catch(err => console.error('Failed to fetch gym', err));

        api.get(`/branches`)
          .then(res => {
            const bList = res.data.branches || [];
            setBranches(bList);
            if (user?.branchId) {
              setSelectedBranch(String(user.branchId));
            } else {
              const matchingBranch = bList.find((b: any) => 
                b.managerId === user?.id || 
                b.email?.toLowerCase() === user?.email?.toLowerCase()
              );
              if (matchingBranch) {
                setSelectedBranch(String(matchingBranch._id));
              }
            }
          })
          .catch(err => console.error('Failed to fetch branches', err));
      });
    }
  }, [user]);

  const getNavGroups = () => {
    const groups = [
      {
        title: 'Main',
        items: [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Revenue & Analytics', path: '/admin/revenue-analytics', icon: TrendingUp }
        ]
      },
      {
        title: 'Trainers',
        items: [
          { label: 'Trainers', path: '/admin/trainers', icon: Dumbbell }
        ]
      },
      {
        title: 'Trainer Hiring',
        items: [
          { label: 'Post a Job', path: '/admin/hiring/jobs/new', icon: UserPlus },
          { label: 'Manage Jobs', path: '/admin/hiring/jobs', icon: Briefcase },
          { label: 'Job Applications', path: '/admin/hiring/applications', icon: Users },
          { label: 'Hired Trainers', path: '/admin/hiring/hired', icon: UserCheck }
        ]
      },
      {
        title: 'Members & Enquiries',
        items: [
          { label: 'Members', path: '/admin/members', icon: Users },
          { label: 'Customer Enquiries', path: '/admin/enquiries', icon: MessageSquare }
        ]
      },
      {
        title: 'Gym & Operations',
        items: [
          { label: 'Exercise Library', path: '/admin/exercises', icon: Dumbbell },
          { label: 'Gym Exercise Videos', path: '/admin/exercise-videos', icon: Video },
          { label: 'Equipment', path: '/admin/equipment', icon: Activity },
          { label: 'Package Plans', path: '/admin/membership-plans', icon: CreditCard },
          { label: 'Membership Payments', path: '/admin/payments', icon: IndianRupee }
        ]
      },
      {
        title: 'Gym Store',
        items: [
          { label: 'Store Overview', path: '/admin/store', icon: Store },
          { label: 'Products', path: '/admin/store/products', icon: Package },
          { label: 'Inventory', path: '/admin/store/inventory', icon: Boxes },
          { label: 'Orders', path: '/admin/store/orders', icon: ShoppingCart },
          { label: 'Offline Sales', path: '/admin/store/offline-sales', icon: IndianRupee },
          { label: 'Sales History', path: '/admin/store/sales', icon: BarChart }
        ]
      },
      {
        title: 'Scheduling',
        items: [] as any[]
      },
      {
        title: 'Rewards & Performance',
        items: [
          { label: 'Rewards & Performance', path: '/admin/rewards-performance', icon: Award },
          { label: 'Referrals', path: '/admin/referrals', icon: Gift }
        ]
      },
      {
        title: 'Admin & Settings',
        items: isBranchUser
          ? [
              { label: 'Reports', path: '/admin/reports', icon: BarChart },
              { label: 'Review & Rating', path: '/admin/reviews', icon: Star },
              { label: 'Notifications', path: '/admin/notifications', icon: Bell },
              { label: 'Deleted Details', path: '/admin/deleted-details', icon: Trash2 }
            ]
          : [
              { label: 'Gym Profile', path: '/admin/gym-profile', icon: Building2 },
              { label: 'Branches', path: '/admin/branches', icon: MapPin },
              { label: 'Subscription', path: '/admin/subscription', icon: CreditCard },
              { label: 'Reports', path: '/admin/reports', icon: BarChart },
              { label: 'Review & Rating', path: '/admin/reviews', icon: Star },
              { label: 'Notifications', path: '/admin/notifications', icon: Bell },
              { label: 'Deleted Details', path: '/admin/deleted-details', icon: Trash2 }
            ]
      }
    ];

    const schedulingGroup = groups.find(g => g.title === 'Scheduling');
    if (schedulingGroup) {
      if (gym?.trainingMode === 'online') {
        schedulingGroup.items.push(
          { label: 'Online Sessions', path: '/admin/online-sessions', icon: CalendarCheck },
          { label: 'Video Bookings', path: '/admin/video-bookings', icon: Calendar }
        );
      } else if (gym?.trainingMode === 'offline') {
        schedulingGroup.items.push(
          { label: 'In-Person Bookings', path: '/admin/session-bookings', icon: CalendarCheck },
          { label: 'Trainer Schedule', path: '/admin/trainer-schedule', icon: Calendar },
          { label: 'Attendance', path: '/admin/attendance', icon: UserPlus }
        );
      } else if (gym?.trainingMode === 'both') {
        schedulingGroup.items.push(
          { label: 'In-Person Bookings', path: '/admin/session-bookings', icon: CalendarCheck },
          { label: 'Online Sessions', path: '/admin/online-sessions', icon: CalendarCheck },
          { label: 'Trainer Schedule', path: '/admin/trainer-schedule', icon: Calendar },
          { label: 'Video Bookings', path: '/admin/video-bookings', icon: Calendar },
          { label: 'Attendance', path: '/admin/attendance', icon: UserPlus }
        );
      } else {
        // Default fallback
        schedulingGroup.items.push(
          { label: 'Session Bookings', path: '/admin/session-bookings', icon: CalendarCheck },
          { label: 'Trainer Schedule', path: '/admin/trainer-schedule', icon: Calendar },
          { label: 'Attendance', path: '/admin/attendance', icon: UserPlus }
        );
      }
    }

    return groups;
  };

  const navGroups = getNavGroups();
  const currentNav = navGroups.flatMap(g => g.items).find(item => item.path === location.pathname);

  const getOwnerDisplayName = () => {
    if (!user) return 'Gym Owner';
    if (user.firstName?.toLowerCase() === 'ananth') return 'Ananth';
    const first = user.firstName || '';
    const last = user.lastName && user.lastName.toLowerCase() !== 'admin' ? user.lastName : '';
    return `${first} ${last}`.trim() || first || 'Gym Owner';
  };


  const activeBranch = branches.find(b => 
    String(b._id) === String(selectedBranch) || 
    (user?.branchId && String(b._id) === String(user.branchId)) ||
    b.managerId === user?.id ||
    b.email?.toLowerCase() === user?.email?.toLowerCase()
  );
  const currentBranchName = activeBranch?.branchName || user?.branchName;
  const sidebarBrandTitle = isBranchUser ? (currentBranchName || 'Branch Dashboard') : (gym?.name || 'Gymora');
  const roleSubtitle = isBranchUser ? 'Branch Admin' : 'Gym Owner';

  return (
    <div className="flex h-screen bg-[#FFFFFF] text-[#1F2937] overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <aside
        className={clsx(
          'fixed lg:static top-0 left-0 h-full w-64 bg-[#FFFFFF] text-[#1F2937] border-r border-[#E2E8F0] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2.5" onClick={() => setSidebarOpen(false)}>
              <div className="w-9 h-9 bg-[#C2410C] text-white font-bold rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
                <Activity className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#111827] truncate max-w-[150px]" title={sidebarBrandTitle}>
                {sidebarBrandTitle}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-8 h-8 flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#EA580C] rounded-lg hover:bg-[#FFF7ED] active:bg-[#FFEDD5] transition-colors shrink-0 cursor-pointer"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FFF7ED] border border-[#FFEDD5] rounded-full flex items-center justify-center text-[#C2410C] font-bold text-base shadow-xs shrink-0">
              {getOwnerDisplayName()?.[0] || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm text-[#111827] truncate">{getOwnerDisplayName()}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-[#64748B] font-medium truncate">{roleSubtitle}</span>
                <span className="px-1.5 py-0.5 bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] rounded text-[9px] font-bold uppercase tracking-wider">PRO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expiry Popup */}
        <ExpiryPopup />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">{group.title}</h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.path === '/admin/trainers'
                    ? location.pathname.startsWith('/admin/trainer')
                    : location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        'flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-150 text-sm font-medium group',
                        isActive
                          ? 'bg-[#FFF7ED] text-[#C2410C] font-semibold border-l-4 border-[#F97316] shadow-xs'
                          : 'text-[#475569] hover:bg-[#FFEDD5] hover:text-[#C2410C]'
                      )}
                    >
                      <Icon
                        size={18}
                        className={clsx(
                          'shrink-0 transition-colors',
                          isActive ? 'text-[#EA580C]' : 'text-[#64748B] group-hover:text-[#EA580C]'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#E2E8F0]">
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-center text-[#B91C1C] hover:bg-red-50 hover:text-[#B91C1C] rounded-xl transition-colors font-semibold text-sm cursor-pointer border border-transparent hover:border-red-200"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-[#FFFFFF]">
        {/* Header */}
        <header className="h-16 pt-safe border-b border-[#E2E8F0] flex items-center px-3 sm:px-6 md:px-8 justify-between bg-[#FFFFFF] z-10 sticky top-0 shrink-0 text-[#111827]">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center text-[#64748B] hover:text-[#EA580C] transition-colors rounded-xl hover:bg-[#FFF7ED] cursor-pointer shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#EA580C] hidden sm:block" />}
            <h2 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[#111827] truncate max-w-[180px] sm:max-w-none">
              {currentNav?.label || 'Gym Owner Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-5">
            {branches.length > 0 && (
              <select
                value={selectedBranch}
                disabled={isBranchUser && Boolean(user?.branchId)}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedBranch(val);
                  if (val === 'main') {
                    navigate('/admin/dashboard');
                  } else {
                    navigate(`/admin/branches/${val}`);
                  }
                }}
                className="bg-[#FFFFFF] border border-[#E2E8F0] text-[#111827] text-xs sm:text-sm rounded-xl focus:ring-[#F97316] focus:border-[#F97316] block p-2 outline-none font-semibold max-w-[120px] sm:max-w-none truncate"
              >
                {!isBranchUser && <option value="main">Main Branch</option>}
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>{branch.branchName}</option>
                ))}
              </select>
            )}
            
            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(prev => !prev)}
                className="relative text-[#64748B] hover:text-[#EA580C] transition-colors p-2 rounded-xl hover:bg-[#FFF7ED] block cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C2410C] text-white font-bold rounded-full text-[10px] font-bold flex items-center justify-center shadow shadow-orange-500/30">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xl z-50 overflow-hidden text-[#1F2937]">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#111827] text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const api = (await import('../utils/api')).default;
                              await api.put('/notifications/mark-all-read');
                              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="text-[11px] font-semibold text-[#EA580C] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotifOpen(false)}
                        className="w-7 h-7 rounded-full bg-[#FFFFFF] border border-[#E2E8F0] text-[#64748B] hover:text-[#EA580C] hover:bg-[#FFF7ED] active:bg-[#FFEDD5] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                        title="Close notifications"
                        aria-label="Close notifications"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Notification list */}
                  <div className="divide-y divide-[#E2E8F0] max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-[#64748B]">No notifications</div>
                    ) : (
                      notifications.slice(0, 5).map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            if (!notif.isRead) markAsRead(notif._id);
                            setNotifOpen(false);
                            const targetLink = getNotificationLink(notif);
                            if (targetLink) navigate(targetLink);
                          }}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-[#FFF7ED] transition-colors cursor-pointer ${!notif.isRead ? 'bg-[#FFF7ED]/50' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'alert' ? 'bg-amber-100 text-amber-700' :
                            notif.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                            notif.type === 'message' ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {notif.type === 'alert' ? '⚠️' :
                             notif.type === 'success' ? '✅' :
                             notif.type === 'message' ? '💬' : 'ℹ️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold text-[#111827] ${!notif.isRead ? 'font-bold' : ''}`}>{notif.title}</p>
                            <p className="text-xs text-[#64748B] mt-0.5 leading-snug">{notif.message}</p>
                            <p className="text-[10px] text-[#94A3B8] mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                          </div>
                          {!notif.isRead && <div className="w-2 h-2 bg-[#F97316] rounded-full mt-2 shrink-0" />}
                        </div>
                      ))
                    )}
                  </div>

                  {/* View All button */}
                  <div className="p-2.5 border-t border-[#E2E8F0] bg-[#F8FAFC] text-center">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/admin/notifications');
                      }}
                      className="text-xs font-semibold text-[#C2410C] hover:underline cursor-pointer"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link to={isBranchUser && user?.branchId ? `/admin/branches/${user.branchId}` : "/admin/gym-profile"} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#111827] leading-none mb-0.5">{getOwnerDisplayName()}</p>
                <p className="text-xs text-[#64748B] leading-none">{roleSubtitle}</p>
              </div>
              <div className="w-9 h-9 bg-[#C2410C] rounded-full flex items-center justify-center text-white font-bold text-sm shadow shadow-orange-500/20">
                {getOwnerDisplayName()?.[0] || 'A'}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 lg:p-8 pb-24 sm:pb-20">
          <Outlet context={{ selectedBranch }} />
        </div>
      </main>
      <GymSmartAssistant />
    </div>
  );
};

export default GymAdminLayout;
