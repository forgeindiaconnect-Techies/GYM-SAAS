import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { ExpiryPopup } from '../components/ExpiryPopup';
import {
  LayoutDashboard, Users, Dumbbell, CreditCard,
  Calendar, CalendarCheck, IndianRupee, UserPlus,
  Bell, BarChart, Activity, Building2, Menu, LogOut, Trash2, MapPin, MessageSquare,
  ChevronDown, Settings, Clock, History, TrendingUp,
  Store, Package, Tag, Boxes, ShoppingCart
} from 'lucide-react';

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

  const markAllAsRead = async () => {
    try {
      const api = (await import('../utils/api')).default;
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
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

  useEffect(() => {
    if (user?.gymId) {
      import('../utils/api').then(({ default: api }) => {
        api.get(`/gyms/${user.gymId}`)
          .then(res => setGym(res.data.gym))
          .catch(err => console.error('Failed to fetch gym', err));

        api.get(`/branches`)
          .then(res => setBranches(res.data.branches || []))
          .catch(err => console.error('Failed to fetch branches', err));
      });
    }
  }, [user]);

  const getNavGroups = () => {
    const groups = [
      {
        title: 'Main',
        items: [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard }
        ]
      },
      {
        title: 'Trainers',
        items: [
          { label: 'Trainers List', path: '/admin/trainers', icon: Dumbbell },
          { label: 'Trainer Fees', path: '/admin/trainer-fees', icon: IndianRupee },
          { label: 'Trainer Payments', path: '/admin/trainer-payments', icon: CreditCard },
          { label: 'Payment History', path: '/admin/trainer-payments-history', icon: History }
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
          { label: 'Equipment', path: '/admin/equipment', icon: Activity },
          { label: 'Membership Plans', path: '/admin/membership-plans', icon: CreditCard },
          { label: 'Membership Payments', path: '/admin/payments', icon: IndianRupee }
        ]
      },
      {
        title: 'Gym Store',
        items: [
          { label: 'Store Overview', path: '/admin/store', icon: Store },
          { label: 'Products', path: '/admin/store/products', icon: Package },
          { label: 'Categories', path: '/admin/store/categories', icon: Tag },
          { label: 'Inventory', path: '/admin/store/inventory', icon: Boxes },
          { label: 'Orders', path: '/admin/store/orders', icon: ShoppingCart },
          { label: 'Offline Sales', path: '/admin/store/offline-sales', icon: IndianRupee },
          { label: 'Sales History', path: '/admin/store/sales', icon: BarChart },
          { label: 'Store Settings', path: '/admin/store/settings', icon: Settings }
        ]
      },
      {
        title: 'Scheduling',
        items: [] as any[]
      },
      {
        title: 'Admin & Settings',
        items: [
          { label: 'Reports', path: '/admin/reports', icon: BarChart },
          { label: 'Branches', path: '/admin/branches', icon: MapPin },
          { label: 'Gym Profile', path: '/admin/gym-profile', icon: Building2 },
          { label: 'Subscription', path: '/admin/subscription', icon: CreditCard },
          { label: 'Deleted Details', path: '/admin/deleted-details', icon: Trash2 },
          { label: 'Notifications', path: '/admin/notifications', icon: Bell }
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

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[#CCFBF1]">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-gradient-to-br from-[#16A34A] to-[#0D9488] rounded-xl flex items-center justify-center shadow-lg shadow-green-200 shrink-0">
            <Activity className="text-[#1E293B]" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#16A34A] truncate max-w-[160px]" title={gym?.name || 'AI GYM'}>
            {gym?.name || 'AI GYM'}
          </span>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#16A34A] to-[#0D9488] rounded-full flex items-center justify-center text-[#1E293B] font-bold text-base shadow">
            {user?.firstName?.[0] || 'G'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#1E293B] truncate">{user?.firstName || 'Gym'} {user?.lastName || 'Admin'}</p>
            <p className="text-xs text-[#0D9488] font-medium truncate">Gym Owner</p>
          </div>
        </div>
      </div>

      {/* Expiry Popup */}
      <ExpiryPopup />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">{group.title}</h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group',
                      isActive
                        ? 'bg-[#16A34A] text-white shadow-md shadow-green-200'
                        : 'text-[#475569] hover:bg-[#F0FDFA] hover:text-[#16A34A]'
                    )}
                  >
                    <Icon
                      size={18}
                      className={clsx(
                        'shrink-0 transition-colors',
                        isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-[#16A34A]'
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
      <div className="p-3 border-t border-[#CCFBF1]">
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-center text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors font-semibold text-sm"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F0FDFA] text-[#1E293B] overflow-hidden">

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
          'fixed lg:static top-0 left-0 h-full w-64 bg-white border-r border-[#CCFBF1] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Subtle top gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(22,163,74,0.04)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#CCFBF1] flex items-center px-4 md:px-8 justify-between bg-white/90 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden text-[#475569] hover:text-[#16A34A] transition-colors p-1 rounded-lg hover:bg-[#F0FDFA]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#16A34A] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#1E293B]">
              {currentNav?.label || 'Gym Owner Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5">
            {branches.length > 0 && (
              <select
                value={selectedBranch}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedBranch(val);
                  if (val === 'main') {
                    navigate('/admin/gym-profile');
                  } else {
                    navigate(`/admin/branches/${val}`);
                  }
                }}
                className="bg-[#F8FAFC] border border-[#CCFBF1] text-[#1E293B] text-sm rounded-lg focus:ring-[#16A34A] focus:border-[#16A34A] block p-2 outline-none font-semibold"
              >
                <option value="main">Main Branch</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>{branch.branchName}</option>
                ))}
              </select>
            )}
            
            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(prev => !prev)}
                className="relative text-[#475569] hover:text-[#16A34A] transition-colors p-1 block"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#16A34A] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow shadow-green-300">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-[#CCFBF1] rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9]">
                    <h3 className="font-bold text-[#1E293B] text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-[#16A34A]/10 text-[#16A34A] text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="divide-y divide-[#F1F5F9] max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-[#64748B]">No notifications</div>
                    ) : (
                      notifications.slice(0, 4).map(notif => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            if (!notif.isRead) markAsRead(notif._id);
                          }}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer ${!notif.isRead ? 'bg-[#F0FDFA]' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'alert' ? 'bg-orange-100 text-orange-500' :
                            notif.type === 'success' ? 'bg-green-100 text-green-500' :
                            notif.type === 'message' ? 'bg-blue-100 text-blue-500' :
                            'bg-purple-100 text-purple-500'
                          }`}>
                            {notif.type === 'alert' ? '⚠️' :
                             notif.type === 'success' ? '✅' :
                             notif.type === 'message' ? '💬' : 'ℹ️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold text-[#1E293B] ${!notif.isRead ? 'font-bold' : ''}`}>{notif.title}</p>
                            <p className="text-xs text-[#475569] mt-0.5 leading-snug">{notif.message}</p>
                            <p className="text-xs text-[#94A3B8] mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                          </div>
                          {!notif.isRead && <div className="w-2 h-2 bg-[#16A34A] rounded-full mt-2 shrink-0" />}
                        </div>
                      ))
                    )}
                  </div>

                  {/* View All button */}
                  <div className="border-t border-[#F1F5F9]">
                    <button
                      onClick={() => { setNotifOpen(false); navigate('/admin/notifications'); }}
                      className="w-full py-3 text-sm font-bold text-[#16A34A] hover:bg-[#F0FDFA] transition-colors"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link to="/admin/gym-profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#1E293B] leading-none mb-0.5">{user?.firstName || 'Gym'} {user?.lastName || 'Admin'}</p>
                <p className="text-xs text-[#475569] leading-none">Gym Owner</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#16A34A] to-[#0D9488] rounded-full flex items-center justify-center text-[#1E293B] font-bold text-sm shadow">
                {user?.firstName?.[0] || 'G'}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-0">
          <Outlet context={{ selectedBranch }} />
        </div>
      </main>
    </div>
  );
};

export default GymAdminLayout;
