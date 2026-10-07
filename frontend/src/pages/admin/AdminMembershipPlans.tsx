import { CreditCard } from 'lucide-react';

const AdminMembershipPlans = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="text-[#F97316]" size={32} />
            Membership Plans
          </h1>
          <p className="text-[#78716C] mt-2">Configure pricing and features for platform subscriptions.</p>
        </div>
        <button className="px-6 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors">
          Manage Membership Plans
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-3 gap-6">
        {['Basic', 'Pro', 'Elite'].map((plan, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-2xl mb-2">{plan}</h3>
            <p className="text-4xl font-bold text-[#F97316] mb-6">${(i+1)*29}<span className="text-lg text-[#78716C]">/mo</span></p>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-[#78716C]"><span className="text-[#F97316]">✓</span> Platform Access</li>
              <li className="flex items-center gap-2 text-[#78716C]"><span className="text-[#F97316]">✓</span> {(i+1)*2} AI Programs</li>
              <li className="flex items-center gap-2 text-[#78716C]"><span className="text-[#F97316]">✓</span> Analytics Dashboard</li>
            </ul>
            <button className="w-full py-3 border border-[#E7E5E4] rounded-xl hover:bg-[#FED7AA] transition-colors">Edit Plan</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminMembershipPlans;