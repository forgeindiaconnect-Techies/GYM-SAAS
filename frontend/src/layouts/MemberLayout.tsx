import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, User, CreditCard, Dumbbell,
  Utensils, Bot, UserCheck, Calendar, CalendarCheck,
  TrendingUp, DollarSign, Bell, MessageSquare,
  Settings, Activity, Building2, Menu, LogOut, Clock,
  ShoppingBag, ShoppingCart
} from 'lucide-react';

const MemberLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [gym, setGym] = useState<any>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [storeEnabled, setStoreEnabled] = useState(false);

  useEffect(() => {
    import('../utils/api').then(({ default: api }) => {
      api.get('/store/customer/status')
        .then(res => setStoreEnabled(!!res.data?.enabled))
        .catch(() => setStoreEnabled(false));
    });
  }, [user]);

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
      api.get('/memberships/my').then(res => {
        const mems = res.data.memberships || [];
        const active = mems.find((m: any) => (m.status === 'Active' || m.status === 'Free Trial') && (!m.endDate || new Date(m.endDate) >= new Date()));
        const pending = mems.find((m: any) => m.status === 'Payment Verification Pending');
        const expired = mems.find((m: any) => m.status === 'Expired' || ((m.status === 'Active' || m.status === 'Free Trial') && m.endDate && new Date(m.endDate) < new Date()));
        
        const isSubExpired = user?.subscriptionStatus === 'Expired' || user?.subscriptionStatus === 'EXPIRED';
        const isSubPending = user?.subscriptionStatus === 'Payment Verification Pending';
        const isSubRejected = user?.subscriptionStatus === 'Rejected' || user?.subscriptionStatus === 'REJECTED';
        const isSubNone = user?.subscriptionStatus === 'None';

        if (!active && (expired || pending || isSubExpired || isSubPending || isSubRejected || isSubNone)) {
          setIsExpired(true);
        } else {
          setIsExpired(false);
        }
      }).catch(err => console.error('Failed to fetch memberships', err));
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
        { label: 'Find Trainers', path: '/member/find-trainers', icon: UserCheck },
        { label: 'My Trainer', path: '/member/trainer', icon: UserCheck },
        { label: 'My Bookings', path: '/member/bookings', icon: CalendarCheck },
      ]
    },
    {
      title: 'Fitness',
      items: [
        { label: 'Workout Plan', path: '/member/workout', icon: Dumbbell },
        { label: 'Diet Plan', path: '/member/diet', icon: Utensils },
        { label: 'AI Fitness', path: '/member/ai-assistant', icon: Bot },
        { label: 'Progress', path: '/member/progress', icon: TrendingUp },
      ]
    },
    ...(storeEnabled ? [{
      title: 'Gym Store',
      items: [
        { label: 'Store', path: '/member/store', icon: ShoppingBag },
        { label: 'My Cart', path: '/member/store/cart', icon: ShoppingCart },
        { label: 'My Orders', path: '/member/store/orders', icon: ShoppingBag },
      ]
    }] : []),
    {
      title: 'Account',
      items: [
        { label: 'Profile', path: '/member/profile', icon: User },
        { label: 'Membership', path: '/member/subscription', icon: CreditCard },
        { label: 'Messages', path: '/member/chat', icon: MessageSquare },
        { label: 'Notifications', path: '/member/notifications', icon: Bell },
        { label: 'Settings', path: '/member/settings', icon: Settings },
      ]
    }
  ];

  const displayNavGroups = isExpired ? [
    {
      title: 'Action Required',
      items: [
        { label: 'Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
        { label: 'Membership Plans', path: '/member/upgrade', icon: CreditCard },
      ]
    }
  ] : navGroups;

  const currentNav = navGroups.flatMap(g => g.items).find(item => item.path === location.pathname);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[#DCD9CD]">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-gradient-to-br from-[#34483F] to-[#8FA89B] rounded-xl flex items-center justify-center shadow-lg shadow-green-200 shrink-0">
            <Activity className="text-[#202522]" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#34483F] truncate max-w-[160px]" title={gym?.name || 'AI GYM'}>
            {gym?.name || 'AI GYM'}
          </span>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#06B6D4] to-[#8FA89B] rounded-full flex items-center justify-center text-[#202522] font-bold text-base shadow">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#202522] truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-[#06B6D4] font-medium truncate capitalize">{user?.subscriptionPlan || 'Member'} Plan</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {displayNavGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h4 className="px-3 mb-2 text-[10px] font-bold text-[#A8ADA9] uppercase tracking-widest">{group.title}</h4>
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
                      'flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-150 text-sm font-medium group',
                      isActive
                        ? 'bg-[#34483F]/10 text-[#34483F] font-semibold'
                        : 'text-[#4A514D] hover:bg-[#F5F3EE] hover:text-[#34483F]'
                    )}
                  >
                    <Icon
                      size={17}
                      className={clsx(
                        'shrink-0 transition-colors',
                        isActive ? 'text-[#34483F]' : 'text-[#A8ADA9] group-hover:text-[#34483F]'
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
      <div className="p-3 border-t border-[#DCD9CD]">
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors font-semibold text-sm"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F5F3EE] text-[#202522] overflow-hidden">

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
              <Clock className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#202522] mb-2">Plan Expiring Soon!</h2>
            <p className="text-[#4A514D] mb-6">
              Your <span className="font-bold text-[#202522]">{user?.subscriptionPlan}</span> will expire in less than 1 hour. 
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
          'fixed lg:static top-0 left-0 h-full w-64 bg-white border-r border-[#DCD9CD] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(6,182,212,0.04)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#DCD9CD] flex items-center px-4 md:px-8 justify-between bg-white/90 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#4A514D] hover:text-[#34483F] transition-colors p-1 rounded-lg hover:bg-[#F5F3EE]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#34483F] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#202522]">
              {currentNav?.label || 'Customer Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5">
            <Link to="/member/notifications" className="relative text-[#4A514D] hover:text-[#34483F] transition-colors p-1">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#06B6D4] rounded-full shadow shadow-cyan-300" />
            </Link>
            <Link to="/member/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#202522] leading-none mb-0.5">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-[#4A514D] leading-none capitalize">{user?.subscriptionPlan || 'Member'} Plan</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#06B6D4] to-[#8FA89B] rounded-full flex items-center justify-center text-[#202522] font-bold text-sm shadow">
                {user?.firstName?.[0] || 'U'}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MemberLayout;
