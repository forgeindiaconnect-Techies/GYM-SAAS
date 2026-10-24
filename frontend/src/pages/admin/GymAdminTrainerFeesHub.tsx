import { Link } from 'react-router-dom';
import { Settings, Clock, History, TrendingUp, ChevronRight } from 'lucide-react';

const cards = [
  {
    title: 'Trainer Fee Settings',
    description: 'Configure and manage fees for each trainer in your gym.',
    icon: Settings,
    path: '/admin/trainer-fees/settings',
    color: 'from-[#2DD4BF] to-[#5EEAD4]',
    bg: 'bg-green-50',
    iconColor: 'text-[#2DD4BF]',
  },
  {
    title: 'Pending Trainer Payments',
    description: 'View and process outstanding trainer payments.',
    icon: Clock,
    path: '/admin/trainer-fees/pending',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Trainer Payment History',
    description: 'View complete history of all trainer payments.',
    icon: History,
    path: '/admin/trainer-fees/history',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-[#1B2728]',
    iconColor: 'text-[#2DD4BF]',
  },
  {
    title: 'Trainer Earnings',
    description: 'Overview of trainer earnings and financial commitments.',
    icon: TrendingUp,
    path: '/admin/trainer-fees/earnings',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-[#0E1415]',
    iconColor: 'text-[#2DD4BF]',
  },
];

const GymAdminTrainerFeesHub = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5FAFA]">Trainer Fees & Payments</h1>
        <p className="text-[#9AAEAE] text-sm mt-1">Manage all trainer fee configurations and payment records</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <Link
              key={card.path}
              to={card.path}
              className="bg-[#141D1E] border border-[#1B2728] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#2A3A3A] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <Icon size={22} className={card.iconColor} />
                </div>
                <ChevronRight size={18} className="text-[#2A3A3A] group-hover:text-[#2DD4BF] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-bold text-[#F5FAFA] mb-1">{card.title}</h3>
              <p className="text-sm text-[#9AAEAE]">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default GymAdminTrainerFeesHub;
