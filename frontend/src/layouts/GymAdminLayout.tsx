import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, Dumbbell, CreditCard,
  Calendar, CalendarCheck, DollarSign, UserPlus,
  Bell, BarChart, Settings, Activity, Building2, Menu, X, LogOut
} from 'lucide-react';

const GymAdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [gym, setGym] = useState<any>(null);

  useEffect(() => {
    if (user?.gymId) {
      import('../utils/api').then(({ default: api }) => {
        api.get(`/gyms/${user.gymId}`)
          .then(res => setGym(res.data.gym))
          .catch(err => console.error('Failed to fetch gym', err));
      });
    }
  }, [user]);

  const baseNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Gym Profile', path: '/admin/gym-profile', icon: Building2 },
    { label: 'Trainers', path: '/admin/trainers', icon: Dumbbell },
    { label: 'Members', path: '/admin/members', icon: Users },
    { label: 'Equipment', path: '/admin/equipment', icon: Activity },
    { label: 'Membership Plans', path: '/admin/membership-plans', icon: CreditCard },
  ];

  const onlineSessionsNav = [
    { label: 'Online Sessions', path: '/admin/online-sessions', icon: CalendarCheck },
    { label: 'Video Bookings', path: '/admin/video-bookings', icon: Calendar },
  ];

  const offlineSessionsNav = [
    { label: 'In-Person Bookings', path: '/admin/session-bookings', icon: CalendarCheck },
    { label: 'Trainer Schedule', path: '/admin/trainer-schedule', icon: Calendar },
    { label: 'Attendance', path: '/admin/attendance', icon: UserPlus },
  ];

  const commonBottomNav = [
    { label: 'Payments', path: '/admin/payments', icon: DollarSign },
    { label: 'Reports', path: '/admin/reports', icon: BarChart },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Subscription', path: '/admin/subscription', icon: CreditCard },
    { label: 'Profile', path: '/admin/profile', icon: Users },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  let navItems = [...baseNavItems];
  
  if (gym?.trainingMode === 'online') {
    navItems = [...navItems, ...onlineSessionsNav];
  } else if (gym?.trainingMode === 'offline') {
    navItems = [...navItems, ...offlineSessionsNav];
  } else if (gym?.trainingMode === 'both') {
    navItems = [...navItems, ...onlineSessionsNav, ...offlineSessionsNav];
  } else {
    // Default fallback
    navItems = [...navItems, { label: 'Session Bookings', path: '/admin/session-bookings', icon: CalendarCheck }, { label: 'Trainer Schedule', path: '/admin/trainer-schedule', icon: Calendar }, { label: 'Attendance', path: '/admin/attendance', icon: UserPlus }];
  }

  navItems = [...navItems, ...commonBottomNav];

  const currentNav = navItems.find(item => item.path === location.pathname);

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

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
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
                  ? 'bg-[#16A34A]/10 text-[#16A34A] font-semibold border-l-4 border-[#16A34A]'
                  : 'text-[#475569] hover:bg-[#F0FDFA] hover:text-[#16A34A] border-l-4 border-transparent'
              )}
            >
              <Icon
                size={18}
                className={clsx(
                  'shrink-0 transition-colors',
                  isActive ? 'text-[#16A34A]' : 'text-[#94A3B8] group-hover:text-[#16A34A]'
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
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
              {currentNav?.label || 'Gym Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5">
            <button className="relative text-[#475569] hover:text-[#16A34A] transition-colors p-1">
              <Bell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#16A34A] rounded-full shadow shadow-green-300" />
            </button>
            <Link to="/admin/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default GymAdminLayout;
