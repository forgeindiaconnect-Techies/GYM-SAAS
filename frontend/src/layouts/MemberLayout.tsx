import CustomerAIChatbot from '../components/CustomerAIChatbot';
import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, User, CreditCard, Dumbbell,
  Utensils, Bot, CalendarCheck,
  TrendingUp, Bell, MessageSquare,
  Activity, Building2, Menu, LogOut, Clock,
  ShoppingBag, FileText, Star, Lock, Sparkles, Trophy, Award, Gift,
  CheckCircle, AlertCircle, Coins
} from 'lucide-react';

const MemberLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [gym, setGym] = useState<any>(null);
  const [isExpired, setIsExpired] = useState<boolean>(() => {
    return user?.subscriptionStatus === 'Expired' || user?.subscriptionStatus === 'EXPIRED';
  });

  // Notifications State & Handlers
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const api = (await import('../utils/api')).default;
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount ?? res.data.notifications?.filter((n: any) => !n.isRead).length ?? 0);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const api = (await import('../utils/api')).default;
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const api = (await import('../utils/api')).default;
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  useEffect(() => {
    if (isExpired && location.pathname !== '/member/subscription') {
      navigate('/member/subscription', { replace: true });
    }
  }, [isExpired, location.pathname, navigate]);

  useEffect(() => {
    if (user?.subscriptionExpiry) {
      const checkExpiry = () => {
        const expiry = new Date(user.subscriptionExpiry!).getTime();
        const now = new Date().getTime();
        const diff = expiry - now;
        // If within 1 hour (3600000 ms) and not already expired
        if (diff > 0 && diff <= 3600000) {
          setShowExpiryWarning(true);
        } else {
          setShowExpiryWarning(false);
        }
      };
      
      checkExpiry();
      const interval = setInterval(checkExpiry, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.subscriptionExpiry]);

  useEffect(() => {
    if (user?.gymId) {
      import('../utils/api').then(({ default: api }) => {
        api.get(`/gyms/${user.gymId}`)
          .then(res => setGym(res.data.gym))
          .catch(err => console.error('Failed to fetch gym', err));
      });
    }

    import('../utils/api').then(({ default: api }) => {
      Promise.all([
        api.get('/memberships/my').catch(() => ({ data: { memberships: [] } })),
        api.get('/payments/my-history').catch(() => ({ data: { payments: [] } }))
      ]).then(([memRes]) => {
        const mems = memRes.data?.memberships || [];
        const now = new Date();

        // 1. Check for active PAID membership (status === 'Active' and positive price/finalAmount and not expired)
        const activePaid = mems.find((m: any) => 
          (m.status === 'Active' || m.status === 'APPROVED') &&
          Number(m.finalAmount || m.price || 0) > 0 &&
          (!m.endDate || new Date(m.endDate) >= now)
        );

        // 2. Check for active FREE TRIAL (status === 'Active' or 'Free Trial', amount === 0, endDate in future)
        const activeTrial = mems.find((m: any) =>
          (m.status === 'Free Trial' || (m.status === 'Active' && (Number(m.finalAmount || 0) === 0 || m.planName?.toLowerCase().includes('trial')))) &&
          m.endDate && new Date(m.endDate) >= now
        );

        const isUserExpired = user?.subscriptionStatus === 'Expired' || user?.subscriptionStatus === 'EXPIRED';

        if (activePaid) {
          setIsExpired(false);
        } else if (activeTrial && !isUserExpired) {
          setIsExpired(false);
        } else {
          // Free trial completed, expired, or unpaid membership
          setIsExpired(true);
        }
      }).catch(err => {
        console.error('Failed to fetch memberships', err);
        if (user?.subscriptionStatus === 'Expired' || user?.subscriptionStatus === 'EXPIRED') {
          setIsExpired(true);
        }
      });
    });
  }, [user]);

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
        { label: 'My Gym', path: '/member/my-gym', icon: Building2 },
      ]
    },
    {
      title: 'Training',
      items: [
        { label: 'Training', path: '/member/find-trainers', icon: Dumbbell },
        { label: "Trainer's Plan", path: '/member/trainer-plan', icon: FileText },
      ]
    },
    {
      title: 'Fitness',
      items: [
        { label: 'AI Fitness Assistant', path: '/member/ai-assistant', icon: Bot },
        { label: 'My Workout Plan', path: '/member/workout', icon: Dumbbell },
        { label: 'My Diet Plan', path: '/member/diet', icon: Utensils },
        { label: 'Progress Tracking', path: '/member/progress', icon: TrendingUp },
        { label: 'Attendance', path: '/member/attendance', icon: CalendarCheck },
        { label: 'Trainer Feedback', path: '/member/trainer-review', icon: MessageSquare },
        { label: 'Reviews & Ratings', path: '/member/session-review', icon: Star },
      ]
    },
    {
      title: 'Rewards & Referrals',
      items: [
        { label: 'My Rewards & Points', path: '/member/rewards', icon: Coins },
        { label: 'Refer & Earn', path: '/member/referrals', icon: Gift },
      ]
    },
    {
      title: 'Gym Store',
      items: [
        { label: 'Gym Store', path: '/member/store', icon: ShoppingBag },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Messages', path: '/member/chat', icon: MessageSquare },
        { label: 'Profile', path: '/member/profile', icon: User },
        { label: 'Membership', path: '/member/subscription', icon: CreditCard },
        { label: 'Notifications', path: '/member/notifications', icon: Bell },
      ]
    }
  ];

  const displayNavGroups = isExpired ? [
    {
      title: 'Membership Required',
      items: [
        { label: 'Membership Plan', path: '/member/subscription', icon: CreditCard },
      ]
    }
  ] : navGroups;

  const isTrainingRoute = (location.pathname !== '/member/trainer-plan' && location.pathname !== '/member/trainers-plan') &&
    ['/member/find-trainers', '/member/training', '/member/trainer', '/member/bookings', '/member/online-sessions', '/member/book-session'].some(p => location.pathname === p || location.pathname.startsWith(p + '/'));
  const isStoreRoute = ['/member/store'].some(p => location.pathname.startsWith(p));
  const currentNav = isExpired
    ? { label: 'Membership Plan', path: '/member/subscription', icon: CreditCard }
    : (navGroups.flatMap(g => g.items).find(item => item.path === location.pathname) 
      || (location.pathname === '/member/workout-videos' ? { label: 'My Workout Plan', path: '/member/workout', icon: Dumbbell } : null)
      || (isTrainingRoute ? { label: 'Training', path: '/member/find-trainers', icon: Dumbbell } : null)
      || (isStoreRoute ? { label: 'Gym Store', path: '/member/store', icon: ShoppingBag } : null));

  const renderSidebar = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[#2A3A3A]">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold rounded-xl flex items-center justify-center shadow-md shadow-[#2DD4BF]/25 shrink-0">
            <Activity className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#F5FAFA] truncate max-w-[160px]" title={gym?.name || 'Gymora'}>
            {gym?.name || 'Gymora'}
          </span>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#141D1E] border border-[#2A3A3A] rounded-full flex items-center justify-center text-[#2DD4BF] font-bold text-base shadow-xs">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#F5FAFA] truncate">{user?.firstName} {user?.lastName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-[#9AAEAE] font-medium truncate capitalize">
                {isExpired ? 'Free Trial Completed' : `${user?.subscriptionPlan || 'Member'} Plan`}
              </span>
              <span className="px-1.5 py-0.2 bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded text-[9px] font-bold uppercase tracking-wider">MEMBER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {displayNavGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h4 className="px-3 mb-2 text-[10px] font-bold text-[#9AAEAE] uppercase tracking-widest">{group.title}</h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isTrainingItem = item.path === '/member/find-trainers';
                const isStoreItem = item.path === '/member/store';
                const isWorkoutItem = item.path === '/member/workout';
                const isActive = location.pathname === item.path 
                  || (isWorkoutItem && location.pathname === '/member/workout-videos')
                  || (isTrainingItem && isTrainingRoute)
                  || (isStoreItem && isStoreRoute);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      'flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-150 text-sm font-medium group',
                      isActive
                        ? 'bg-[#2DD4BF]/15 text-[#F5FAFA] font-semibold border-l-4 border-[#2DD4BF] shadow-sm'
                        : 'text-[#9AAEAE] hover:bg-[#141D1E] hover:text-[#F5FAFA]'
                    )}
                  >
                    <Icon
                      size={17}
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

      {/* Locked Menus Notice when Free Trial is completed / expired */}
      {isExpired && (
        <div className="mx-3 my-2 p-3 bg-[#141D1E] border border-[#FBBF24]/30 rounded-xl text-center">
          <div className="w-8 h-8 mx-auto mb-1.5 bg-[#FBBF24]/15 rounded-full flex items-center justify-center text-[#FBBF24]">
            <Lock size={15} />
          </div>
          <p className="text-xs font-bold text-[#FBBF24] mb-0.5">Side Menus Locked</p>
          <p className="text-[11px] text-[#9AAEAE] leading-tight">
            Complete your subscription payment below to unlock remaining side menus.
          </p>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-[#2A3A3A]">
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-[#F87171] hover:bg-red-950/25 hover:text-red-400 rounded-xl transition-colors font-semibold text-sm cursor-pointer border border-transparent hover:border-[#F87171]/30"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#080B0C] text-[#F5FAFA] overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Expiry Warning Popup */}
      {showExpiryWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#141D1E] rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 border border-[#F87171] text-center text-[#F5FAFA]">
            <div className="w-16 h-16 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-[#FBBF24]" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#F5FAFA] mb-2">Plan Expiring Soon!</h2>
            <p className="text-[#9AAEAE] mb-6">
              Your <span className="font-bold text-[#F5FAFA]">{user?.subscriptionPlan}</span> will expire in less than 1 hour. 
              Please renew to continue accessing the gym seamlessly.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowExpiryWarning(false)}
                className="flex-1 py-3 bg-[#0E1415] border border-[#2A3A3A] text-[#F5FAFA] font-bold rounded-xl hover:bg-[#1B2728] transition-colors"
              >
                Dismiss
              </button>
              <Link 
                to="/member/subscription"
                onClick={() => setShowExpiryWarning(false)}
                className="flex-1 py-3 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] hover:from-[#5EEAD4] hover:to-[#2DD4BF] text-[#06201D] font-bold font-bold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-[#2DD4BF]/25"
              >
                Renew Now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static top-0 left-0 h-full w-64 bg-[#0B1112] text-[#F5FAFA] border-r border-[#2A3A3A] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-[#080B0C]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(45, 212, 191,0.06)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#2A3A3A] flex items-center px-4 md:px-8 justify-between bg-[#0E1415]/95 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm text-[#F5FAFA]">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors p-1 rounded-lg hover:bg-[#141D1E]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#2DD4BF] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#F5FAFA]">
              {currentNav?.label || 'Customer Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5">
            {!isExpired && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors p-1.5 rounded-xl hover:bg-[#141D1E] cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#2DD4BF] text-[#06201D] font-bold text-[10px] font-bold rounded-full flex items-center justify-center shadow shadow-blue-900/40 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#141D1E] border border-[#2A3A3A] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
                    <div className="p-3.5 border-b border-[#2A3A3A] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#F5FAFA] text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-[#2DD4BF] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-[#2A3A3A] max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#9AAEAE]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map(notif => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif._id);
                              setNotifOpen(false);
                              if (notif.link) navigate(notif.link);
                              else navigate('/member/notifications');
                            }}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-[#1B2728] transition-colors cursor-pointer ${
                              !notif.isRead ? 'bg-[#2DD4BF]/5' : ''
                            }`}
                          >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#0E1415] border border-[#2A3A3A]">
                              {notif.type === 'alert' ? <AlertCircle size={15} className="text-[#F87171]" /> :
                               notif.type === 'success' ? <CheckCircle size={15} className="text-[#34D399]" /> :
                               notif.type === 'message' ? <MessageSquare size={15} className="text-[#2DD4BF]" /> :
                               <Bell size={15} className="text-[#2DD4BF]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold text-[#F5FAFA] truncate ${!notif.isRead ? 'font-bold' : ''}`}>
                                {notif.title}
                              </p>
                              <p className="text-[11px] text-[#9AAEAE] mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                              <p className="text-[9px] text-[#9AAEAE]/70 mt-1">
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <div className="w-2 h-2 bg-[#2DD4BF] rounded-full mt-1.5 shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-[#2A3A3A]">
                      <button
                        onClick={() => { setNotifOpen(false); navigate('/member/notifications'); }}
                        className="w-full py-2.5 text-xs font-bold text-[#2DD4BF] hover:bg-[#1B2728] transition-colors text-center block cursor-pointer"
                      >
                        View All Notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {!isExpired ? (
              <Link to="/member/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-[#F5FAFA] leading-none mb-0.5">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[#9AAEAE] leading-none capitalize">{user?.subscriptionPlan || 'Member'} Plan</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold rounded-full flex items-center justify-center font-bold text-sm shadow">
                  {user?.firstName?.[0] || 'U'}
                </div>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-[#F5FAFA] leading-none mb-0.5">{user?.firstName} {user?.lastName}</p>
                  <span className="text-[11px] font-bold text-[#FBBF24] bg-[#FBBF24]/15 border border-[#FBBF24]/30 px-2 py-0.5 rounded-full">Free Trial Completed</span>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold rounded-full flex items-center justify-center font-bold text-sm shadow">
                  {user?.firstName?.[0] || 'U'}
                </div>
              </div>
            )}
          </div>
        </header>

        {isExpired && (
          <div className="bg-[#141D1E] border-b border-[#FBBF24]/30 px-4 py-3 flex items-center justify-between text-[#FBBF24] text-sm">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#FBBF24] shrink-0" />
              <span><strong>Free Trial / Membership Ended:</strong> Your plan has completed. Please subscribe to an active membership plan to access workouts, diet plans, and trainers.</span>
            </div>
            <Link to="/member/subscription" className="px-3 py-1 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold font-bold rounded-xl text-xs shrink-0 transition-colors shadow-sm">
              View Plans
            </Link>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>

        {/* Floating Context-Aware AI Chatbot */}
        <CustomerAIChatbot />
      </main>
    </div>
  );
};

export default MemberLayout;
