import { Link, useLocation } from 'react-router-dom';
import { Search, UserCheck, CalendarCheck, Video, MessageSquare } from 'lucide-react';

export const MemberTrainingTabs = () => {
  const location = useLocation();

  const tabs = [
    {
      label: 'Find Trainers',
      path: '/member/find-trainers',
      icon: Search,
      isActive: location.pathname === '/member/find-trainers' || location.pathname === '/member/training',
    },
    {
      label: 'My Trainer',
      path: '/member/trainer',
      icon: UserCheck,
      isActive: location.pathname === '/member/trainer',
    },
    {
      label: 'My Bookings',
      path: '/member/bookings',
      icon: CalendarCheck,
      isActive: location.pathname === '/member/bookings' || location.pathname.startsWith('/member/book-session'),
    },
    {
      label: 'Online Sessions',
      path: '/member/online-sessions',
      icon: Video,
      isActive: location.pathname === '/member/online-sessions',
    },
    {
      label: 'Messages',
      path: '/member/chat',
      icon: MessageSquare,
      isActive: location.pathname === '/member/chat' || location.pathname === '/member/messages',
    },
  ];

  return (
    <div className="w-full pb-2">
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#E7E5E4] rounded-2xl w-full sm:w-fit overflow-x-auto shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
                tab.isActive
                  ? 'bg-[#F97316] text-white font-bold shadow-sm'
                  : 'text-[#78716C] hover:text-[#292524] hover:bg-[#FFFDF8] font-medium'
              }`}
            >
              <Icon size={16} className={tab.isActive ? 'text-white' : 'text-[#78716C]'} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MemberTrainingTabs;
