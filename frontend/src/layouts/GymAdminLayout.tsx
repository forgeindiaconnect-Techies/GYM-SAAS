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
  Briefcase, UserCheck, Search
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
          { label: 'Browse Trainers', path: '/admin/hiring/trainers', icon: Search },
          { label: 'Post a Job', path: '/admin/hiring/jobs/new', icon: UserPlus },
          { label: 'Manage Jobs', path: '/admin/hiring/jobs', icon: Briefcase },
          { label: 'Job Applications', path: '/admin/hiring/applications', icon: Users },
          { label: 'Hiring Requests', path: '/admin/hiring/requests', icon: MessageSquare },
          { label: 'Interview Schedule', path: '/admin/hiring/interviews', icon: Calendar },
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
    <div className="flex h-screen bg-[#080B0C] text-[#F5FAFA] overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile slide-in */}
      <aside
        className={clsx(
          'fixed lg:static top-0 left-0 h-full w-64 bg-[#0B1112] text-[#F5FAFA] border-r border-[#2A3A3A] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b border-[#2A3A3A]">
          <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl flex items-center justify-center shadow-md shadow-[#2DD4BF]/30 shrink-0">
              <Activity className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#F5FAFA] truncate max-w-[160px]" title={sidebarBrandTitle}>
              {sidebarBrandTitle}
            </span>
          </Link>
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#141D1E] border border-[#2A3A3A] rounded-full flex items-center justify-center text-[#2DD4BF] font-bold text-base shadow-xs">
              {getOwnerDisplayName()?.[0] || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm text-[#F5FAFA] truncate">{getOwnerDisplayName()}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-[#9AAEAE] font-medium truncate">{roleSubtitle}</span>
                <span className="px-1.5 py-0.2 bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded text-[9px] font-bold uppercase tracking-wider">PRO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expiry Popup */}
        <ExpiryPopup />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-[11px] font-bold text-[#9AAEAE] uppercase tracking-wider mb-2">{group.title}</h3>
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
                          ? 'bg-[#2DD4BF]/15 text-[#F5FAFA] font-semibold border-l-4 border-[#2DD4BF] shadow-sm'
                          : 'text-[#9AAEAE] hover:bg-[#141D1E] hover:text-[#F5FAFA]'
                      )}
                    >
                      <Icon
                        size={18}
                        className={clsx(
                          'shrink-0 transition-colors',
                          isActive ? 'text-[#2DD4BF]' : 'text-[#9AAEAE] group-hover:text-[#2DD4BF]'
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
        <div className="p-3 border-t border-[#2A3A3A]">
          <button
            onClick={logout}
            className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-center text-[#F87171] hover:bg-red-950/25 hover:text-red-400 rounded-xl transition-colors font-semibold text-sm cursor-pointer border border-transparent hover:border-[#F87171]/30"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-[#080B0C]">
        {/* Subtle top electric blue accent glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(45, 212, 191,0.08)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#2A3A3A] flex items-center px-4 md:px-8 justify-between bg-[#0E1415]/95 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm text-[#F5FAFA]">
          <div className="flex items-center space-x-3">
            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors p-1 rounded-lg hover:bg-[#141D1E]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#2DD4BF] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#F5FAFA]">
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
                className="bg-[#141D1E] border border-[#2A3A3A] text-[#F5FAFA] text-sm rounded-xl focus:ring-[#2DD4BF] focus:border-[#2DD4BF] block p-2 outline-none font-semibold"
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
                className="relative text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors p-1 block cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2DD4BF] text-[#06201D] font-bold rounded-full text-[10px] font-bold flex items-center justify-center shadow shadow-blue-900/40">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-[#141D1E] border border-[#2A3A3A] rounded-2xl shadow-2xl z-50 overflow-hidden text-[#F5FAFA]">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A3A3A] bg-[#0E1415]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#F5FAFA] text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
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
                        className="text-[11px] font-semibold text-[#2DD4BF] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="divide-y divide-[#2A3A3A] max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-[#9AAEAE]">No notifications</div>
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
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-[#1B2728] transition-colors cursor-pointer ${!notif.isRead ? 'bg-[#1B2728]/60' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'alert' ? 'bg-[#0E1415]/40 text-[#2DD4BF]' :
                            notif.type === 'success' ? 'bg-green-950/40 text-green-400' :
                            notif.type === 'message' ? 'bg-[#0E1415]/40 text-[#2DD4BF]' :
                            'bg-[#0E1415] text-[#2DD4BF]'
                          }`}>
                            {notif.type === 'alert' ? '⚠️' :
                             notif.type === 'success' ? '✅' :
                             notif.type === 'message' ? '💬' : 'ℹ️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold text-[#F5FAFA] ${!notif.isRead ? 'font-bold' : ''}`}>{notif.title}</p>
                            <p className="text-xs text-[#9AAEAE] mt-0.5 leading-snug">{notif.message}</p>
                            <p className="text-[10px] text-[#9AAEAE]/80 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                          </div>
                          {!notif.isRead && <div className="w-2 h-2 bg-[#2DD4BF] rounded-full mt-2 shrink-0" />}
                        </div>
                      ))
                    )}
                  </div>

                  {/* View All button */}
                  <div className="p-2.5 border-t border-[#2A3A3A] bg-[#0E1415] text-center">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/admin/notifications');
                      }}
                      className="text-xs font-semibold text-[#2DD4BF] hover:underline cursor-pointer"
                    >
                      View All Notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>
            <Link to={isBranchUser && user?.branchId ? `/admin/branches/${user.branchId}` : "/admin/gym-profile"} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#FFFFFF] leading-none mb-0.5">{getOwnerDisplayName()}</p>
                <p className="text-xs text-[#9AAEAE] leading-none">{roleSubtitle}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-full flex items-center justify-center text-[#06201D] font-bold font-bold text-sm shadow">
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
