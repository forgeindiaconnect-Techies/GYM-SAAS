import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import GymSmartAssistant from '../components/GymSmartAssistant';
import {
  LayoutDashboard, Building2, Send, User, LogOut,
  CreditCard, ShieldCheck, Menu, PlusCircle, TrendingUp, Bell
} from 'lucide-react';

const SuperAdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Gym Management',
      items: [
        { label: 'Gym Owner Details', path: '/super-admin/gym-owners', icon: Building2 },
        { label: 'Add Gym Manually', path: '/super-admin/gyms/add', icon: PlusCircle },
        { label: 'Gym Invitations', path: '/super-admin/invitations', icon: Send },
      ],
    },
    {
      title: 'Finance & Store',
      items: [
        { label: 'Revenue & Analytics', path: '/super-admin/revenue-analytics', icon: TrendingUp },
        { label: 'Subscription Plans', path: '/super-admin/subscriptions', icon: CreditCard },
      ],
    },
    {
      title: 'System & Settings',
      items: [
        { label: 'Notifications', path: '/super-admin/notifications', icon: Bell },
        { label: 'Profile', path: '/super-admin/profile', icon: User },
      ],
    },
  ];

  const allNavItems = navGroups.flatMap(g => g.items);
  const currentNav = allNavItems.find(item => item.path === location.pathname);

  const renderSidebar = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[#2A3A3A]">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl flex items-center justify-center shadow-md shadow-[#2DD4BF]/25">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-[#FFFFFF]">SUPER</span>
            <span className="text-sm font-bold tracking-tight text-[#2DD4BF]">ADMIN</span>
          </div>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#141D1E] border border-[#2A3A3A] rounded-full flex items-center justify-center text-[#2DD4BF] font-bold text-base shadow-xs">
            {user?.firstName?.[0] || 'S'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#FFFFFF] truncate">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-[#9AAEAE] font-medium truncate">Root Access</span>
              <span className="px-1.5 py-0.2 bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded text-[9px] font-bold uppercase tracking-wider">SUPER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={group.title || gIdx}>
            <h3 className="px-3 text-[10px] font-bold text-[#9AAEAE] uppercase tracking-wider mb-1">
              {group.title}
            </h3>
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
                        ? 'bg-[#2DD4BF]/15 text-[#FFFFFF] font-semibold border-l-4 border-[#2DD4BF] shadow-sm'
                        : 'text-[#9AAEAE] hover:bg-[#141D1E] hover:text-[#FFFFFF]'
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
          className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-[#F87171] hover:bg-red-950/25 hover:text-red-400 rounded-xl transition-colors font-semibold text-sm cursor-pointer border border-transparent hover:border-[#F87171]/30"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#080B0C] text-[#FFFFFF] overflow-hidden">

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
        <header className="h-16 border-b border-[#2A3A3A] flex items-center px-4 md:px-8 justify-between bg-[#0E1415]/95 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm text-[#FFFFFF]">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors p-1 rounded-lg hover:bg-[#141D1E]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#2DD4BF] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#FFFFFF]">
              {currentNav?.label || 'Super Admin Portal'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/super-admin/notifications"
              className="text-[#9AAEAE] hover:text-[#2DD4BF] p-2 rounded-xl hover:bg-[#141D1E] transition-colors relative"
              title="Notifications"
            >
              <Bell size={20} />
            </Link>
            <Link to="/super-admin/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#FFFFFF] leading-none mb-0.5">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
                <p className="text-xs text-[#9AAEAE] font-medium leading-none">Root Access</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold rounded-full flex items-center justify-center font-bold text-sm shadow">
                {user?.firstName?.[0] || 'S'}
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

export default SuperAdminLayout;
