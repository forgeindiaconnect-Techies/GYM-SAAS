import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  CreditCard, 
  Menu,
  CalendarCheck2,
  Activity,
  Wallet,
  User,
  Home,
  Apple,
  Compass
} from 'lucide-react';
import { useMobileAuth, UserRole } from '../auth/AuthContext';

interface TabItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

export const MobileBottomNav: React.FC = () => {
  const { activeRole } = useMobileAuth();

  const getTabsForRole = (role: UserRole): TabItem[] => {
    switch (role) {
      case 'GYM_OWNER':
        return [
          { to: '/owner/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/owner/members', label: 'Members', icon: Users },
          { to: '/owner/trainers', label: 'Trainers', icon: Dumbbell },
          { to: '/owner/finances', label: 'Finance', icon: CreditCard },
          { to: '/owner/settings', label: 'More', icon: Menu },
        ];
      case 'TRAINER':
        return [
          { to: '/trainer/dashboard', label: 'Today', icon: CalendarCheck2 },
          { to: '/trainer/clients', label: 'Clients', icon: Users },
          { to: '/trainer/workouts', label: 'Workouts', icon: Activity },
          { to: '/trainer/earnings', label: 'Earnings', icon: Wallet },
          { to: '/trainer/profile', label: 'Profile', icon: User },
        ];
      case 'CUSTOMER':
        return [
          { to: '/customer/dashboard', label: 'Home', icon: Home },
          { to: '/customer/workouts', label: 'Workouts', icon: Dumbbell },
          { to: '/customer/diet', label: 'Diet', icon: Apple },
          { to: '/customer/trainers', label: 'Trainers', icon: Compass },
          { to: '/customer/profile', label: 'Profile', icon: User },
        ];
    }
  };

  const tabs = getTabsForRole(activeRole);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg shadow-slate-900/5 max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 select-none active:scale-95 ${
                  isActive
                    ? 'text-orange-600 font-bold'
                    : 'text-slate-500 hover:text-slate-700 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative p-1 rounded-xl transition-all ${
                      isActive ? 'bg-orange-50 text-orange-600' : ''
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;

