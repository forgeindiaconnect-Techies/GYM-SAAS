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
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#292940] rounded-2xl w-full sm:w-fit overflow-x-auto shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 ${
                tab.isActive
                  ? 'bg-[#6366F1] text-white font-bold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#11111F] hover:bg-[#0B0B12] font-medium'
              }`}
            >
              <Icon size={16} className={tab.isActive ? 'text-white' : 'text-[#A1A1AA]'} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TrainerFinancialsTabs;
