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
      <div className="p-5 border-b border-[#E7DADD]">
        <Link to="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-[#B76E79] text-white font-bold rounded-xl flex items-center justify-center shadow-md shadow-[#B76E79]/20">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-[#FFFFFF]">SUPER</span>
            <span className="text-sm font-bold tracking-tight text-[#B76E79]">ADMIN</span>
          </div>
        </Link>
        <div className="mt-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#FFFFFF] border border-[#E7DADD] rounded-full flex items-center justify-center text-[#B76E79] font-bold text-base shadow-xs">
            {user?.firstName?.[0] || 'S'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-sm text-[#FFFFFF] truncate">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-[#57534E] font-medium truncate">Root Access</span>
              <span className="px-1.5 py-0.2 bg-[#B76E79]/15 text-[#B76E79] border border-[#B76E79]/30 rounded text-[9px] font-bold uppercase tracking-wider">SUPER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={group.title || gIdx}>
            <h3 className="px-3 text-[10px] font-bold text-[#57534E] uppercase tracking-wider mb-1">
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
                        ? 'bg-[#B76E79]/15 text-[#FFFFFF] font-semibold border-l-4 border-[#B76E79] shadow-sm'
                        : 'text-[#57534E] hover:bg-[#FFFFFF] hover:text-[#FFFFFF]'
                    )}
                  >
                    <Icon
                      size={18}
                      className={clsx(
                        'shrink-0 transition-colors',
                        isActive ? 'text-[#B76E79]' : 'text-[#57534E] group-hover:text-[#B76E79]'
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
      <div className="p-3 border-t border-[#E7DADD]">
        <button
          onClick={logout}
          className="flex items-center justify-center space-x-2 px-3 py-2.5 w-full text-[#B91C1C] hover:bg-red-950/25 hover:text-red-400 rounded-xl transition-colors font-semibold text-sm cursor-pointer border border-transparent hover:border-[#B91C1C]/30"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#FFFFFF] text-[#FFFFFF] overflow-hidden">

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
          'fixed lg:static top-0 left-0 h-full w-64 bg-[#FFFFFF] text-[#292524] border-r border-[#E7DADD] flex flex-col z-40 shrink-0 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 bg-[#FFFFFF]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(183,110,121,0.06)_0%,_transparent_60%)] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-[#E7DADD] flex items-center px-4 md:px-8 justify-between bg-[#F3E8E8]/95 backdrop-blur-md z-10 sticky top-0 shrink-0 shadow-sm text-[#FFFFFF]">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-[#57534E] hover:text-[#B76E79] transition-colors p-1 rounded-lg hover:bg-[#FFFFFF]"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            {currentNav && <currentNav.icon size={20} className="text-[#B76E79] hidden sm:block" />}
            <h2 className="text-base md:text-lg font-bold tracking-tight text-[#FFFFFF]">
              {currentNav?.label || 'Super Admin Portal'}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/super-admin/notifications"
              className="text-[#57534E] hover:text-[#B76E79] p-2 rounded-xl hover:bg-[#FFFFFF] transition-colors relative"
              title="Notifications"
            >
              <Bell size={20} />
            </Link>
            <Link to="/super-admin/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-[#FFFFFF] leading-none mb-0.5">{user?.firstName || 'Super'} {user?.lastName || 'Admin'}</p>
                <p className="text-xs text-[#57534E] font-medium leading-none">Root Access</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-[#B76E79] to-[#9F5965] text-[#FFFFFF] font-bold rounded-full flex items-center justify-center font-bold text-sm shadow">
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
