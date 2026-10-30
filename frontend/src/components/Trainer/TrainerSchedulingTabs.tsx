import { Link, useLocation } from 'react-router-dom';
import { Calendar, CalendarCheck, Clock } from 'lucide-react';

export const TrainerSchedulingTabs = () => {
  const location = useLocation();

  const tabs = [
    {
      label: 'Schedule',
      path: '/trainer/schedule',
      icon: Calendar,
      isActive: location.pathname === '/trainer/schedule',
    },
    {
      label: 'Session Bookings',
      path: '/trainer/session-bookings',
      icon: CalendarCheck,
      isActive: location.pathname === '/trainer/session-bookings',
    },
    {
      label: 'Online Sessions',
      path: '/trainer/online-sessions',
      icon: Clock,
      isActive: location.pathname === '/trainer/online-sessions',
    },
  ];

  return (
    <div className="w-full pb-2">
      <div className="flex items-center gap-2 p-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full sm:w-fit overflow-x-auto shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
                tab.isActive
                  ? 'bg-[#C2410C] text-white font-bold shadow-sm'
                  : 'text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] font-medium'
              }`}
            >
              <Icon size={16} className={tab.isActive ? 'text-white' : 'text-[#64748B]'} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TrainerSchedulingTabs;
