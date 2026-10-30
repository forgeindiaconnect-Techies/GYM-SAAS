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
      <div className="p-5 border-b border-[#E2E8F0]">
        <Link to="/" className="flex items-center space-x-2.5" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-[#C2410C] text-white font-bold rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-[#111827]">SUPER</span>
            <span className="text-sm font-bold tracking-tight text-[#EA580C]">ADMIN</span>
          </div>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FFF7ED] border border-[#FFEDD5] rounded-full flex items-center justify-center text-[#C2410C] font-bold text-base shadow-xs">
            {user?.firstName?.[0] || 'S'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#111827] truncate">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-[#64748B] font-medium truncate">Root Access</span>
              <span className="px-1.5 py-0.5 bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] rounded text-[9px] font-bold uppercase tracking-wider">SUPER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={group.title || gIdx}>
            <h3 className="px-3 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
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
        <header className="h-16 border-b border-[#E2E8F0] flex items-center px-4 md:px-8 justify-between bg-[#FFFFFF] z-10 sticky top-0 shrink-0 text-[#111827]">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#64748B] hover:text-[#EA580C] transition-colors p-1 rounded-lg hover:bg-[#F8FAFC]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#EA580C] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#111827]">
              {currentNav?.label || 'Super Admin Portal'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/super-admin/notifications"
              className="text-[#64748B] hover:text-[#EA580C] p-2 rounded-xl hover:bg-[#FFF7ED] transition-colors relative"
              title="Notifications"
            >
              <Bell size={20} />
            </Link>
            <Link to="/super-admin/profile" className="flex items-center space-x-2.5 hover:opacity-90 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#111827] leading-none mb-0.5">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
                <p className="text-xs text-[#64748B] font-medium leading-none">Root Access</p>
              </div>
              <div className="w-9 h-9 bg-[#C2410C] text-[#FFFFFF] font-bold rounded-full flex items-center justify-center text-sm shadow-xs">
                {user?.firstName?.[0] || 'S'}
              </div>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F8FAFC]">
          <Outlet />
        </div>
      </main>
      <GymSmartAssistant />
    </div>
  );
};

export default SuperAdminLayout;
