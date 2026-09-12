import { CreditCard } from 'lucide-react';

const AdminMembershipPlans = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="text-[#16A34A]" size={32} />
            Membership Plans
          </h1>
          <p className="text-[#475569] mt-2">Configure pricing and features for platform subscriptions.</p>
        </div>
        <button className="px-6 py-2 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors">
          Manage Membership Plans
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-3 gap-6">
        {['Basic', 'Pro', 'Elite'].map((plan, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-2xl mb-2">{plan}</h3>
            <p className="text-4xl font-bold text-[#16A34A] mb-6">${(i+1)*29}<span className="text-lg text-[#475569]">/mo</span></p>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-[#475569]"><span className="text-[#16A34A]">✓</span> Platform Access</li>
              <li className="flex items-center gap-2 text-[#475569]"><span className="text-[#16A34A]">✓</span> {(i+1)*2} AI Programs</li>
              <li className="flex items-center gap-2 text-[#475569]"><span className="text-[#16A34A]">✓</span> Analytics Dashboard</li>
            </ul>
            <button className="w-full py-3 border border-[#CCFBF1] rounded-xl hover:bg-[#E2E8F0] transition-colors">Edit Plan</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminMembershipPlans;