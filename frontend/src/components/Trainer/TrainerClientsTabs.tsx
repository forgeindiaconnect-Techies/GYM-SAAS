import { Link, useLocation } from 'react-router-dom';
import { Users, TrendingUp, CalendarCheck } from 'lucide-react';

export const TrainerClientsTabs = () => {
  const location = useLocation();

  const tabs = [
    {
      label: 'My Members',
      path: '/trainer/members',
      icon: Users,
      isActive: location.pathname === '/trainer/members',
    },
    {
      label: 'Customer Progress',
      path: '/trainer/customer-progress',
      icon: TrendingUp,
      isActive: location.pathname === '/trainer/customer-progress' || location.pathname === '/trainer/member-progress',
    },
    {
      label: 'Attendance',
      path: '/trainer/attendance',
      icon: CalendarCheck,
      isActive: location.pathname === '/trainer/attendance',
    },
  ];

  return (
    <div className="w-full pb-2">
      <div className="flex items-center gap-2 p-1.5 bg-[#141D1E] border border-[#2A3A3A] rounded-2xl w-full sm:w-fit overflow-x-auto shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
                tab.isActive
                  ? 'bg-[#2DD4BF] text-white font-bold shadow-sm'
                  : 'text-[#9AAEAE] hover:text-[#FFFFFF] hover:bg-[#0E1415] font-medium'
              }`}
            >
              <Icon size={16} className={tab.isActive ? 'text-white' : 'text-[#9AAEAE]'} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TrainerClientsTabs;
