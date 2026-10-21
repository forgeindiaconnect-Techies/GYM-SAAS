import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import GymSmartAssistant from '../components/GymSmartAssistant';
import {
  LayoutDashboard, User, Users, FileText,
  Utensils, Calendar,
  MessageSquare, IndianRupee, Bell,
  Activity, Menu, LogOut, Bot,
  Dumbbell, Star, Video, CheckCircle2, Wrench
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
        { label: 'AI Recommendations', path: '/trainer/ai-assistant', icon: Bot },
        { label: 'Feedback', path: '/trainer/ai-feedback', icon: MessageSquare },
      ]
    },
    {
      title: 'Clients',
      items: [
        { label: 'Clients', path: '/trainer/members', icon: Users },
      ]
    },
    {
      title: 'Scheduling',
      items: [
        { label: 'Scheduling', path: '/trainer/schedule', icon: Calendar },
      ]
    },
    {
      title: 'Programs',
      items: [
        { label: 'Exercise Library', path: '/trainer/exercises', icon: Dumbbell },
        { label: 'Gym Exercise Videos', path: '/trainer/exercise-videos', icon: Video },
        { label: 'Workout Plans', path: '/trainer/workout-plans', icon: FileText },
        { label: 'Diet Plans', path: '/trainer/diet-plans', icon: Utensils },
        { label: 'Gym Equipments', path: '/trainer/equipments', icon: Wrench },
        { label: 'Customer Workplan Completed', path: '/trainer/customer-workplan-completed', icon: CheckCircle2 },
      ]
    },
    {
      title: 'Financials',
      items: [
        { label: 'Financials', path: '/trainer/my-fee', icon: IndianRupee },
      ]
    },
    {
      title: 'Communication',
      items: [
        { label: 'Messages', path: '/trainer/messages', icon: MessageSquare },
        { label: 'Notifications', path: '/trainer/notifications', icon: Bell },
        { label: 'Reviews & Ratings', path: '/trainer/reviews', icon: Star },
      ]
    }
  ];

  const isClientsRoute = ['/trainer/members', '/trainer/customer-progress', '/trainer/member-progress', '/trainer/attendance'].some(p => location.pathname.startsWith(p));
  const isSchedulingRoute = ['/trainer/schedule', '/trainer/session-bookings', '/trainer/online-sessions'].some(p => location.pathname.startsWith(p));
  const isFinancialsRoute = ['/trainer/my-fee', '/trainer/payments-received', '/trainer/payment-history', '/trainer/earnings'].some(p => location.pathname.startsWith(p));

  const currentNav = navGroups.flatMap(g => g.items).find(item => item.path === location.pathname)
    || (isClientsRoute ? { label: 'Clients', path: '/trainer/members', icon: Users } : null)
    || (isSchedulingRoute ? { label: 'Scheduling', path: '/trainer/schedule', icon: Calendar } : null)
    || (isFinancialsRoute ? { label: 'Financials', path: '/trainer/my-fee', icon: IndianRupee } : null);

  const renderSidebar = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-gradient-to-br from-[#A991D4] to-[#E9DFF4] rounded-xl flex items-center justify-center shadow-lg shadow-purple-950/40 shrink-0">
            <Activity className="text-[#292431]" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white truncate max-w-[160px]" title={gym?.name || 'Gymora'}>
            {gym?.name || 'Gymora'}
          </span>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#A991D4] to-[#E9DFF4] rounded-full flex items-center justify-center text-[#292431] font-bold text-base shadow">
            {user?.firstName?.[0] || 'T'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-[#E9DFF4]/80 font-medium truncate">Elite Trainer</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[11px] font-bold text-[#E9DFF4]/70 uppercase tracking-wider mb-2">{group.title}</h3>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isClientsItem = item.path === '/trainer/members';
                const isSchedulingItem = item.path === '/trainer/schedule';
                const isFinancialsItem = item.path === '/trainer/my-fee';
                const isActive = location.pathname === item.path
                  || (isClientsItem && isClientsRoute)
                  || (isSchedulingItem && isSchedulingRoute)
                  || (isFinancialsItem && isFinancialsRoute);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group',
                      isActive
                        ? 'bg-[#A991D4] text-[#292431] font-semibold shadow-md shadow-purple-950/30'
                        : 'text-white/85 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon
                      size={18}
                      className={clsx(
                        'shrink-0 transition-colors',
                        isActive ? 'text-[#292431]' : 'text-white/85 group-hover:text-white'
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
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-red-300 hover:bg-white/10 hover:text-red-200 rounded-xl transition-colors font-semibold text-sm"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F7F4FA] text-[#292431] overflow-hidden">

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
          'fixed lg:static top-0 left-0 h-full w-64 bg-[#4C315E] text-white border-r border-[#4C315E] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(22,163,74,0.04)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#E5DDEB] flex items-center px-4 md:px-8 justify-between bg-white/90 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#6B5E78] hover:text-[#A991D4] transition-colors p-1 rounded-lg hover:bg-[#F7F4FA]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#A991D4] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#292431]">
              {currentNav?.label || 'Trainer Portal'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5">
            <Link to="/trainer/notifications" className="relative text-[#6B5E78] hover:text-[#A991D4] transition-colors p-1 block">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link to="/trainer/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#292431] leading-none mb-0.5">{user?.firstName || 'Trainer'} {user?.lastName || ''}</p>
                <p className="text-xs text-[#6B5E78] leading-none">Fitness Coach</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#A991D4] to-[#967CC5] rounded-full flex items-center justify-center text-[#292431] font-bold text-sm shadow">
                {user?.firstName?.[0] || 'T'}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <GymSmartAssistant />
    </div>
  );
};

export default TrainerLayout;
