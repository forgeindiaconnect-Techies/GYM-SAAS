import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import GymSmartAssistant from '../components/GymSmartAssistant';
import {
  LayoutDashboard, Building2, Send, User, LogOut,
  CreditCard, ShieldCheck, Menu, PlusCircle, TrendingUp
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
        { label: 'Profile', path: '/super-admin/profile', icon: User },
      ],
    },
  ];

  const allNavItems = navGroups.flatMap(g => g.items);
  const currentNav = allNavItems.find(item => item.path === location.pathname);

  const renderSidebar = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-gradient-to-br from-[#A991D4] to-[#E9DFF4] rounded-xl flex items-center justify-center shadow-lg shadow-purple-950/40">
            <ShieldCheck className="text-[#292431]" size={20} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-[#E9DFF4]">SYSTEM</span>
            <span className="text-sm font-bold tracking-tight text-[#A991D4]">ADMIN</span>
          </div>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#A991D4] to-[#E9DFF4] rounded-full flex items-center justify-center text-[#292431] font-bold text-base shadow">
            {user?.firstName?.[0] || 'S'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-white truncate">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
            <p className="text-xs text-[#E9DFF4]/80 font-medium truncate">Root Access</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={group.title || gIdx}>
            <h3 className="px-3 text-[10px] font-bold text-[#E9DFF4]/70 uppercase tracking-wider mb-1">
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(13,148,136,0.04)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#E5DDEB] flex items-center px-4 md:px-8 justify-between bg-white/90 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#6B5E78] hover:text-[#967CC5] transition-colors p-1 rounded-lg hover:bg-[#F7F4FA]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#967CC5] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#292431]">
              {currentNav?.label || 'Super Admin Portal'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/super-admin/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#292431] leading-none mb-0.5">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
                <p className="text-xs text-[#292431] font-medium font-medium leading-none">Root Access</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#E9DFF4] to-[#E9DFF4] rounded-full flex items-center justify-center text-[#292431] font-bold text-sm shadow">
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
