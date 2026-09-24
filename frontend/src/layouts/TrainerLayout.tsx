import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, User, Users, FileText,
  Utensils, Calendar, CalendarCheck, TrendingUp,
  MessageSquare, IndianRupee, Bell,
  Activity, Menu, LogOut, Bot, Settings,
  Clock, FileQuestion
} from 'lucide-react';

const TrainerLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const [gym, setGym] = useState<any>(null);

  useEffect(() => {
    if (user?.gymId) {
      import('../utils/api').then(({ default: api }) => {
        api.get(`/gyms/${user.gymId}`)
          .then(res => setGym(res.data.gym))
          .catch(err => console.error('Failed to fetch gym', err));
        
        api.get('/notifications')
          .then(res => {
            if (res.data.success) {
              setUnreadCount(res.data.unreadCount || 0);
            }
          })
          .catch(err => console.error('Failed to fetch notifications', err));
      });
    }
  }, [user]);

  const navGroups = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', path: '/trainer/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/trainer/profile', icon: User },
      ]
    },
    {
      title: 'AI Tools',
      items: [
        { label: 'AI Trainer Assistant', path: '/trainer/ai-assistant', icon: Bot },
      ]
    },
    {
      title: 'Clients',
      items: [
        { label: 'My Members', path: '/trainer/members', icon: Users },
        { label: 'Member Progress', path: '/trainer/member-progress', icon: TrendingUp },
        { label: 'Attendance', path: '/trainer/attendance', icon: CalendarCheck },
      ]
    },
    {
      title: 'Scheduling',
      items: [
        { label: 'Schedule', path: '/trainer/schedule', icon: Calendar },
        { label: 'Session Bookings', path: '/trainer/session-bookings', icon: CalendarCheck },
      ]
    },
    {
      title: 'Programs',
      items: [
        { label: 'Workout Plans', path: '/trainer/workout-plans', icon: FileText },
        { label: 'Diet Plans', path: '/trainer/diet-plans', icon: Utensils },
      ]
    },
    {
      title: 'Financials',
      items: [
        { label: 'My Assigned Fee', path: '/trainer/my-fee', icon: IndianRupee },
        { label: 'Payments Received', path: '/trainer/payments-received', icon: Clock },
        { label: 'Earnings & Balance', path: '/trainer/earnings', icon: TrendingUp },
      ]
    },
    {
      title: 'Communication',
      items: [
        { label: 'Messages', path: '/trainer/messages', icon: MessageSquare },
        { label: 'Notifications', path: '/trainer/notifications', icon: Bell },
      ]
    }
  ];

  const currentNav = navGroups.flatMap(g => g.items).find(item => item.path === location.pathname);

  const renderSidebar = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[#D3DFDA]">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] rounded-xl flex items-center justify-center shadow-lg shadow-green-200 shrink-0">
            <Activity className="text-[#202828]" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#164A4A] truncate max-w-[160px]" title={gym?.name || 'AI GYM'}>
            {gym?.name || 'AI GYM'}
          </span>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] rounded-full flex items-center justify-center text-[#202828] font-bold text-base shadow">
            {user?.firstName?.[0] || 'T'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#202828] truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-[#164A4A] font-medium truncate">Elite Trainer</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[11px] font-bold text-[#A8ADA9] uppercase tracking-wider mb-2">{group.title}</h3>
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
                        ? 'bg-[#164A4A]/10 text-[#164A4A] font-semibold'
                        : 'text-[#455250] hover:bg-[#F1F5F3] hover:text-[#164A4A]'
                    )}
                  >
                    <Icon
                      size={18}
                      className={clsx(
                        'shrink-0 transition-colors',
                        isActive ? 'text-[#164A4A]' : 'text-[#A8ADA9] group-hover:text-[#164A4A]'
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
      <div className="p-3 border-t border-[#D3DFDA]">
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
    <div className="flex h-screen bg-[#F1F5F3] text-[#202828] overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static top-0 left-0 h-full w-64 bg-white border-r border-[#D3DFDA] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(22,163,74,0.04)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#D3DFDA] flex items-center px-4 md:px-8 justify-between bg-white/90 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#455250] hover:text-[#164A4A] transition-colors p-1 rounded-lg hover:bg-[#F1F5F3]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#164A4A] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#202828]">
              {currentNav?.label || 'Trainer Portal'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5">
            <Link to="/trainer/notifications" className="relative text-[#455250] hover:text-[#164A4A] transition-colors p-1 block">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link to="/trainer/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#202828] leading-none mb-0.5">{user?.firstName || 'Trainer'} {user?.lastName || ''}</p>
                <p className="text-xs text-[#455250] leading-none">Fitness Coach</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] rounded-full flex items-center justify-center text-[#202828] font-bold text-sm shadow">
                {user?.firstName?.[0] || 'T'}
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

export default TrainerLayout;
