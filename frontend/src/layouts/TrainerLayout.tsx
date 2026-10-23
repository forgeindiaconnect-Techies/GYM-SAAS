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
  Dumbbell, Star, Video, CheckCircle2, Wrench, Trophy, Gift, Award
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
      title: 'Challenges & Rewards',
      items: [
        { label: 'Customer Challenge Progress', path: '/trainer/challenges', icon: Trophy },
        { label: 'Rewards & Performance', path: '/trainer/rewards', icon: Award },
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
      <div className="p-5 border-b border-[#292940]">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-[#6366F1] text-white rounded-xl flex items-center justify-center shadow-md shadow-[#6366F1]/25 shrink-0">
            <Activity className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#F8FAFC] truncate max-w-[160px]" title={gym?.name || 'Gymora'}>
            {gym?.name || 'Gymora'}
          </span>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#11111F] border border-[#292940] rounded-full flex items-center justify-center text-[#6366F1] font-bold text-base shadow-xs">
            {user?.firstName?.[0] || 'T'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#F8FAFC] truncate">{user?.firstName} {user?.lastName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-[#A1A1AA] font-medium truncate">Elite Trainer</span>
              <span className="px-1.5 py-0.2 bg-[#818CF8]/15 text-[#818CF8] border border-[#818CF8]/30 rounded text-[9px] font-bold uppercase tracking-wider">COACH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-2">{group.title}</h3>
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
                        ? 'bg-[#6366F1]/15 text-[#F8FAFC] font-semibold border-l-4 border-[#6366F1] shadow-sm'
                        : 'text-[#A1A1AA] hover:bg-[#11111F] hover:text-[#F8FAFC]'
                    )}
                  >
                    <Icon
                      size={18}
                      className={clsx(
                        'shrink-0 transition-colors',
                        isActive ? 'text-[#6366F1]' : 'text-[#A1A1AA] group-hover:text-[#6366F1]'
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
      <div className="p-3 border-t border-[#292940]">
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-[#EF4444] hover:bg-red-950/25 hover:text-red-400 rounded-xl transition-colors font-semibold text-sm cursor-pointer border border-transparent hover:border-[#EF4444]/30"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-[#F8FAFC] overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static top-0 left-0 h-full w-64 bg-[#0B0B12] text-[#F8FAFC] border-r border-[#292940] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99, 102, 241,0.06)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#292940] flex items-center px-4 md:px-8 justify-between bg-[#0B0B12]/95 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm text-[#F8FAFC]">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#A1A1AA] hover:text-[#6366F1] transition-colors p-1 rounded-lg hover:bg-[#11111F]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#6366F1] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#F8FAFC]">
              {currentNav?.label || 'Trainer Portal'}
            </h2>
          </div>

          <div className="flex items-center space-x-3 md:space-x-5">
            <Link to="/trainer/notifications" className="relative text-[#A1A1AA] hover:text-[#6366F1] transition-colors p-1 block">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#6366F1] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow shadow-blue-900/40">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link to="/trainer/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#F8FAFC] leading-none mb-0.5">{user?.firstName || 'Trainer'} {user?.lastName || ''}</p>
                <p className="text-xs text-[#A1A1AA] leading-none">Fitness Coach</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
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
