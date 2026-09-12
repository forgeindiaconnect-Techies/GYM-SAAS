import { useState } from 'react';
import { Plus, Check, Edit2, Users } from 'lucide-react';

const mockPlans = [
  { id: '1', name: 'Basic Tier', price: '29.99', duration: 'Monthly', subscribers: 145, isPopular: false, features: ['Access to gym equipment', 'Locker room access', '1 free personal training session'] },
  { id: '2', name: 'Pro Tier', price: '49.99', duration: 'Monthly', subscribers: 312, isPopular: true, features: ['All Basic features', 'Group fitness classes', 'Access to sauna/pool', 'Guest passes (2/month)'] },
  { id: '3', name: 'Elite Tier', price: '89.99', duration: 'Monthly', subscribers: 84, isPopular: false, features: ['All Pro features', 'Unlimited guest passes', '1 PT session per week', 'Free nutrition consultation'] },
  { id: '4', name: 'Annual Basic', price: '299.99', duration: 'Yearly', subscribers: 210, isPopular: false, features: ['Access to gym equipment', 'Locker room access', 'Save $60 compared to monthly'] },
];

const GymAdminMembershipPlans = () => {

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Membership Plans</h1>
          <p className="text-[#475569] mt-1">Configure pricing tiers and subscription options for your gym.</p>
        </div>
        <button className="px-4 py-2 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20 self-start md:self-auto">
          <Plus size={20} /> Create New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {mockPlans.map((plan) => (
          <div key={plan.id} className={`bg-[#FFFFFF] rounded-2xl p-8 relative flex flex-col transition-all ${plan.isPopular ? 'border-2 border-[#16A34A] shadow-[0_0_30px_rgba(255,51,102,0.1)] transform md:-translate-y-2' : 'border border-[#CCFBF1] hover:border-[#16A34A]/50'}`}>
            
            {plan.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-[#16A34A] text-white text-xs font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-lg">
                  Most Popular
                </span>
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-[#1E293B]">{plan.name}</h3>
              <button className="p-2 text-[#475569] hover:text-[#16A34A] hover:bg-[#16A34A]/10 rounded-lg transition-colors">
                <Edit2 size={18} />
              </button>
            </div>
            
            <div className="mb-6 flex items-baseline">
              <span className="text-4xl font-black text-[#1E293B]">${plan.price}</span>
              <span className="text-[#475569] ml-2 font-medium">/ {plan.duration.toLowerCase()}</span>
            </div>

            <div className="flex items-center space-x-2 mb-8 bg-[#FFFFFF] p-3 rounded-xl border border-[#CCFBF1]">
              <Users size={18} className="text-[#16A34A]" />
              <span className="text-sm font-semibold text-[#1E293B]">{plan.subscribers}</span>
              <span className="text-sm text-[#475569]">Active Subscribers</span>
            </div>

            <div className="flex-1">
              <p className="text-sm font-bold text-[#1E293B] mb-4 uppercase tracking-wider">Features included:</p>
              <ul className="space-y-4">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check size={18} className="text-green-500 mr-3 shrink-0 mt-0.5" />
                    <span className="text-sm text-[#475569] leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#CCFBF1]">
              <button className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.isPopular ? 'bg-[#16A34A] text-white hover:bg-[#15803D]' : 'bg-[#FFFFFF] text-[#1E293B] hover:bg-[#E2E8F0]'}`}>
                Manage Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GymAdminMembershipPlans;
