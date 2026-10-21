import { Link, useLocation } from 'react-router-dom';
import { IndianRupee, Clock, TrendingUp } from 'lucide-react';

export const TrainerFinancialsTabs = () => {
  const location = useLocation();

  const tabs = [
    {
      label: 'My Assigned Fee',
      path: '/trainer/my-fee',
      icon: IndianRupee,
      isActive: location.pathname === '/trainer/my-fee',
    },
    {
      label: 'Payments Received',
      path: '/trainer/payments-received',
      icon: Clock,
      isActive: location.pathname === '/trainer/payments-received' || location.pathname === '/trainer/payment-history',
    },
    {
      label: 'Earnings & Balance',
      path: '/trainer/earnings',
      icon: TrendingUp,
      isActive: location.pathname === '/trainer/earnings',
    },
  ];

  return (
    <div className="w-full pb-2">
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#E5DDEB] rounded-2xl w-full sm:w-fit overflow-x-auto shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
                tab.isActive
                  ? 'bg-[#A991D4] text-[#292431] font-bold shadow-sm'
                  : 'text-[#6B5E78] hover:text-[#292431] hover:bg-[#F7F4FA] font-medium'
              }`}
            >
              <Icon size={16} className={tab.isActive ? 'text-white' : 'text-[#6B5E78]'} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TrainerFinancialsTabs;
