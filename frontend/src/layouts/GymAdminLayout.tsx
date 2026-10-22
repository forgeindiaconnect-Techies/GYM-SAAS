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
  Store, Package, Boxes, ShoppingCart, Bot, TrendingUp, Star
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
    if (user?.id) fetchNotifications();
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
          { label: 'Referrals', path: '/admin/referrals', icon: Gift },
          { label: 'Fitness Challenges', path: '/admin/challenges', icon: Trophy }
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
    <div className="flex h-screen bg-[#E8EFF0] text-[#344B4A] overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <aside
        className={clsx(
          'fixed lg:static top-0 left-0 h-full w-64 bg-white text-[#344B4A] border-r border-[#D9E2E3] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[#D9E2E3]">
          <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 bg-[#167D78] rounded-xl flex items-center justify-center shadow-md shadow-teal-900/10 shrink-0">
              <Activity className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#344B4A] truncate max-w-[160px]" title={sidebarBrandTitle}>
              {sidebarBrandTitle}
            </span>
          </Link>
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#D8EAE7] rounded-full flex items-center justify-center text-[#167D78] font-bold text-base shadow-xs">
              {getOwnerDisplayName()?.[0] || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm text-[#344B4A] truncate">{getOwnerDisplayName()}</p>
              <p className="text-xs text-[#697778] font-medium truncate">{roleSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Expiry Popup */}
        <ExpiryPopup />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-[11px] font-bold text-[#697778] uppercase tracking-wider mb-2">{group.title}</h3>
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
                        'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group',
                        isActive
                          ? 'bg-[#D8EAE7] text-[#167D78] font-semibold shadow-xs'
                          : 'text-[#697778] hover:bg-[#E8EFF0] hover:text-[#167D78]'
                      )}
                    >
                      <Icon
                        size={18}
                        className={clsx(
                          'shrink-0 transition-colors',
                          isActive ? 'text-[#167D78]' : 'text-[#697778] group-hover:text-[#167D78]'
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
        <div className="p-3 border-t border-[#D9E2E3]">
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-center text-[#C43D35] hover:bg-red-50 hover:text-[#C43D35] rounded-xl transition-colors font-semibold text-sm cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Subtle top gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(22,125,120,0.04)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#D9E2E3] flex items-center px-4 md:px-8 justify-between bg-white/90 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden text-[#697778] hover:text-[#167D78] transition-colors p-1 rounded-lg hover:bg-[#E8EFF0]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#167D78] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#344B4A]">
              {currentNav?.label || 'Gym Owner Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5">
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
                className="bg-[#E8EFF0] border border-[#D9E2E3] text-[#344B4A] text-sm rounded-lg focus:ring-[#167D78] focus:border-[#167D78] block p-2 outline-none font-semibold"
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
                className="relative text-[#697778] hover:text-[#167D78] transition-colors p-1 block"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#167D78] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow shadow-teal-900/10">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-[#D9E2E3] rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8EFF0]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#344B4A] text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="bg-[#167D78]/10 text-[#167D78] text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
                      )}
                    </div>
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
                        className="text-[11px] font-semibold text-[#167D78] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="divide-y divide-[#E8EFF0] max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-[#697778]">No notifications</div>
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
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-[#E8EFF0] transition-colors cursor-pointer ${!notif.isRead ? 'bg-[#E8EFF0]' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'alert' ? 'bg-orange-100 text-orange-500' :
                            notif.type === 'success' ? 'bg-green-100 text-green-500' :
                            notif.type === 'message' ? 'bg-blue-100 text-[#167D78]' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {notif.type === 'alert' ? '⚠️' :
                             notif.type === 'success' ? '✅' :
                             notif.type === 'message' ? '💬' : 'ℹ️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold text-[#344B4A] ${!notif.isRead ? 'font-bold' : ''}`}>{notif.title}</p>
                            <p className="text-xs text-[#697778] mt-0.5 leading-snug">{notif.message}</p>
                            <p className="text-xs text-[#697778] mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                          </div>
                          {!notif.isRead && <div className="w-2 h-2 bg-[#167D78] rounded-full mt-2 shrink-0" />}
                        </div>
                      ))
                    )}
                  </div>

                  {/* View All button */}
                  <div className="border-t border-[#E8EFF0]">
                    <button
                      onClick={() => { setNotifOpen(false); navigate('/admin/notifications'); }}
                      className="w-full py-3 text-sm font-bold text-[#167D78] hover:bg-[#E8EFF0] transition-colors"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link to={isBranchUser && user?.branchId ? `/admin/branches/${user.branchId}` : "/admin/gym-profile"} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#344B4A] leading-none mb-0.5">{getOwnerDisplayName()}</p>
                <p className="text-xs text-[#697778] leading-none">{roleSubtitle}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#167D78] to-[#116660] rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                {getOwnerDisplayName()?.[0] || 'A'}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet context={{ selectedBranch }} />
        </div>
      </main>
      <GymSmartAssistant />
    </div>
  );
};

export default GymAdminLayout;
