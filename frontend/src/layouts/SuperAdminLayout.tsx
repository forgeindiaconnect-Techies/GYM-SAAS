import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Building2, Send, User, Settings, LogOut,
  Users, CreditCard, Trash2, ShieldCheck, Menu, MessageSquare, Wallet, Bell, Store
} from 'lucide-react';

const SuperAdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Customer Details', path: '/super-admin/customers', icon: Users },
    { label: 'Customer Enquiries', path: '/super-admin/enquiries', icon: MessageSquare },
    { label: 'Gym Owner Details', path: '/super-admin/gym-owners', icon: Building2 },
    { label: 'Add Gym Manually', path: '/super-admin/gyms/add', icon: Building2 },
    { label: 'Gym Invitations', path: '/super-admin/invitations', icon: Send },
    { label: 'Subscription Plans', path: '/super-admin/subscriptions', icon: CreditCard },
    { label: 'Gym Store', path: '/super-admin/store', icon: Store },
    { label: 'Payout Management', path: '/super-admin/payouts', icon: Wallet },
    { label: 'Notifications', path: '/super-admin/notifications', icon: Bell },
    { label: 'Deleted Details', path: '/super-admin/deleted', icon: Trash2 },
    { label: 'Profile', path: '/super-admin/profile', icon: User },
  ];

  const currentNav = navItems.find(item => item.path === location.pathname);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[#DCD9CD]">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-gradient-to-br from-[#8FA89B] to-[#06B6D4] rounded-xl flex items-center justify-center shadow-lg shadow-teal-200">
            <ShieldCheck className="text-[#202522]" size={20} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-[#8FA89B]">SYSTEM</span>
            <span className="text-sm font-bold tracking-tight text-[#34483F]">ADMIN</span>
          </div>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8FA89B] to-[#06B6D4] rounded-full flex items-center justify-center text-[#202522] font-bold text-base shadow">
            {user?.firstName?.[0] || 'S'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#202522] truncate">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
            <p className="text-xs text-[#8FA89B] font-medium truncate">Root Access</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path || idx}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-150 text-sm font-medium group',
                isActive
                  ? 'bg-[#8FA89B]/10 text-[#8FA89B] font-semibold'
                  : 'text-[#4A514D] hover:bg-[#F5F3EE] hover:text-[#8FA89B]'
              )}
            >
              <Icon
                size={18}
                className={clsx(
                  'shrink-0 transition-colors',
                  isActive ? 'text-[#8FA89B]' : 'text-[#A8ADA9] group-hover:text-[#8FA89B]'
                )}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(13,148,136,0.04)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#DCD9CD] flex items-center px-4 md:px-8 justify-between bg-white/90 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#4A514D] hover:text-[#8FA89B] transition-colors p-1 rounded-lg hover:bg-[#F5F3EE]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#8FA89B] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#202522]">
              {currentNav?.label || 'Super Admin Portal'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/super-admin/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#202522] leading-none mb-0.5">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
                <p className="text-xs text-[#8FA89B] font-medium leading-none">Root Access</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#8FA89B] to-[#06B6D4] rounded-full flex items-center justify-center text-[#202522] font-bold text-sm shadow">
                {user?.firstName?.[0] || 'S'}
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

export default SuperAdminLayout;
