import CustomerAIChatbot from '../components/CustomerAIChatbot';
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, User, CreditCard, Dumbbell,
  Utensils, Bot, CalendarCheck,
  TrendingUp, Bell, MessageSquare,
  Activity, Building2, Menu, LogOut, Clock,
  ShoppingBag, FileText, Star, Lock, Sparkles, Trophy, Award, Gift
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
        { label: 'Rewards & Performance', path: '/member/challenges', icon: Award },
        { label: 'Refer & Earn', path: '/member/referrals', icon: Gift },
        { label: 'Attendance', path: '/member/attendance', icon: CalendarCheck },
        { label: 'Trainer Feedback', path: '/member/trainer-review', icon: MessageSquare },
        { label: 'Reviews & Ratings', path: '/member/session-review', icon: Star },
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
      <div className="p-5 border-b border-[#D9E2E3]">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-[#167D78] rounded-xl flex items-center justify-center shadow-md shadow-teal-900/10 shrink-0">
            <Activity className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#344B4A] truncate max-w-[160px]" title={gym?.name || 'Gymora'}>
            {gym?.name || 'Gymora'}
          </span>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#D8EAE7] rounded-full flex items-center justify-center text-[#167D78] font-bold text-base shadow-xs">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#344B4A] truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-[#697778] font-medium truncate capitalize">
              {isExpired ? 'Free Trial Completed' : `${user?.subscriptionPlan || 'Member'} Plan`}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {displayNavGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h4 className="px-3 mb-2 text-[10px] font-bold text-[#697778] uppercase tracking-widest">{group.title}</h4>
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
                        ? 'bg-[#D8EAE7] text-[#167D78] font-semibold shadow-xs'
                        : 'text-[#697778] hover:bg-[#E8EFF0] hover:text-[#167D78]'
                    )}
                  >
                    <Icon
                      size={17}
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

      {/* Locked Menus Notice when Free Trial is completed / expired */}
      {isExpired && (
        <div className="mx-3 my-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
          <div className="w-8 h-8 mx-auto mb-1.5 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-600">
            <Lock size={15} />
          </div>
          <p className="text-xs font-bold text-amber-800 mb-0.5">Side Menus Locked</p>
          <p className="text-[11px] text-amber-700/80 leading-tight">
            Complete your subscription payment below to unlock remaining side menus.
          </p>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-[#D9E2E3]">
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-[#C43D35] hover:bg-red-50 hover:text-[#C43D35] rounded-xl transition-colors font-semibold text-sm cursor-pointer"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#E8EFF0] text-[#344B4A] overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Expiry Warning Popup */}
      {showExpiryWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 border-2 border-red-500 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-[#167D78]" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#344B4A] mb-2">Plan Expiring Soon!</h2>
            <p className="text-[#697778] mb-6">
              Your <span className="font-bold text-[#344B4A]">{user?.subscriptionPlan}</span> will expire in less than 1 hour. 
              Please renew to continue accessing the gym seamlessly.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowExpiryWarning(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Dismiss
              </button>
              <Link 
                to="/member/subscription"
                onClick={() => setShowExpiryWarning(false)}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center"
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
          'fixed lg:static top-0 left-0 h-full w-64 bg-white text-[#344B4A] border-r border-[#D9E2E3] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(22,125,120,0.04)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#D9E2E3] flex items-center px-4 md:px-8 justify-between bg-white/90 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#697778] hover:text-[#167D78] transition-colors p-1 rounded-lg hover:bg-[#E8EFF0]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#167D78] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#344B4A]">
              {currentNav?.label || 'Customer Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5">
            {!isExpired && (
              <Link to="/member/notifications" className="relative text-[#697778] hover:text-[#167D78] transition-colors p-1">
                <Bell size={20} />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#167D78] rounded-full shadow shadow-teal-900/10" />
              </Link>
            )}
            {!isExpired ? (
              <Link to="/member/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-[#344B4A] leading-none mb-0.5">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-[#697778] leading-none capitalize">{user?.subscriptionPlan || 'Member'} Plan</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-[#167D78] to-[#116660] rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                  {user?.firstName?.[0] || 'U'}
                </div>
              </Link>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-[#344B4A] leading-none mb-0.5">{user?.firstName} {user?.lastName}</p>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Free Trial Completed</span>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-[#167D78] to-[#116660] rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                  {user?.firstName?.[0] || 'U'}
                </div>
              </div>
            )}
          </div>
        </header>

        {isExpired && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 flex items-center justify-between text-amber-800 text-sm">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-amber-600 shrink-0" />
              <span><strong>Free Trial / Membership Ended:</strong> Your plan has completed. Please subscribe to an active membership plan to access workouts, diet plans, and trainers.</span>
            </div>
            <Link to="/member/subscription" className="px-3 py-1 bg-[#167D78] hover:bg-[#116660] text-white font-bold rounded-lg text-xs shrink-0 transition-colors">
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
