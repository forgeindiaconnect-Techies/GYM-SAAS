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
  Dumbbell, Star, Video, CheckCircle2, Wrench, Gift, Award,
  Search, Briefcase, Mail, X
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
      title: 'Rewards & Performance',
      items: [
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
      title: 'Job Opportunities',
      items: [
        { label: 'Find Jobs', path: '/trainer/jobs', icon: Search },
        { label: 'My Applications', path: '/trainer/applications', icon: Briefcase },
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
      <div className="p-5 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 bg-[#C2410C] text-white font-bold rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <Activity className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827] truncate max-w-[150px]" title={gym?.name || 'Gymora'}>
              {gym?.name || 'Gymora'}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#EA580C] rounded-lg hover:bg-[#FFF7ED] active:bg-[#FFEDD5] transition-colors shrink-0 cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FFF7ED] border border-[#FFEDD5] rounded-full flex items-center justify-center text-[#C2410C] font-bold text-base shadow-xs shrink-0">
            {user?.firstName?.[0] || 'T'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#111827] truncate">{user?.firstName} {user?.lastName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-[#64748B] font-medium truncate">Elite Trainer</span>
              <span className="px-1.5 py-0.5 bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] rounded text-[9px] font-bold uppercase tracking-wider">COACH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">{group.title}</h3>
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
                      'flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-150 text-sm font-medium group',
                      isActive
                        ? 'bg-[#FFF7ED] text-[#C2410C] font-semibold border-l-4 border-[#F97316] shadow-xs'
                        : 'text-[#475569] hover:bg-[#FFEDD5] hover:text-[#C2410C]'
                    )}
                  >
                    <Icon
                      size={18}
                      className={clsx(
                        'shrink-0 transition-colors',
                        isActive ? 'text-[#EA580C]' : 'text-[#64748B] group-hover:text-[#EA580C]'
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
      <div className="p-3 border-t border-[#E2E8F0]">
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-[#B91C1C] hover:bg-red-50 hover:text-[#B91C1C] rounded-xl transition-colors font-semibold text-sm cursor-pointer border border-transparent hover:border-red-200"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#FFFFFF] text-[#1F2937] overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static top-0 left-0 h-full w-64 bg-[#FFFFFF] text-[#1F2937] border-r border-[#E2E8F0] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-[#FFFFFF]">
        {/* Header */}
        <header className="h-16 pt-safe border-b border-[#E2E8F0] flex items-center px-3.5 sm:px-4 md:px-8 justify-between bg-[#FFFFFF] z-10 sticky top-0 shrink-0 text-[#111827]">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <button
              className="lg:hidden text-[#64748B] hover:text-[#EA580C] transition-colors w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#EA580C] hidden sm:block shrink-0" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#111827] truncate">
              {currentNav?.label || 'Trainer Portal'}
            </h2>
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-3 md:space-x-5 shrink-0">
            <Link to="/trainer/notifications" className="relative text-[#64748B] hover:text-[#EA580C] transition-colors w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC]">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute 1 top-1 right-1 w-4 h-4 bg-[#C2410C] text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow shadow-orange-500/30">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link to="/trainer/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#111827] leading-none mb-0.5">{user?.firstName || 'Trainer'} {user?.lastName || ''}</p>
                <p className="text-xs text-[#64748B] leading-none">Fitness Coach</p>
              </div>
              <div className="w-9 h-9 bg-[#C2410C] text-white rounded-full flex items-center justify-center font-bold text-sm shadow shadow-orange-500/20">
                {user?.firstName?.[0] || 'T'}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 lg:p-8 pb-24 sm:pb-20">
          <Outlet />
        </div>
      </main>
      <GymSmartAssistant />
    </div>
  );
};

export default TrainerLayout;
