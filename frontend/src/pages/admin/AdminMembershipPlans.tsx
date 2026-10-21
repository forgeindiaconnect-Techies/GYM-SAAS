import { CreditCard } from 'lucide-react';

const AdminMembershipPlans = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CreditCard className="text-[#A991D4]" size={32} />
            Membership Plans
          </h1>
          <p className="text-[#6B5E78] mt-2">Configure pricing and features for platform subscriptions.</p>
        </div>
        <button className="px-6 py-2 bg-[#A991D4] text-[#292431] rounded-xl font-bold hover:bg-[#967CC5] transition-colors">
          Manage Membership Plans
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-3 gap-6">
        {['Basic', 'Pro', 'Elite'].map((plan, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-2xl mb-2">{plan}</h3>
            <p className="text-4xl font-bold text-[#A991D4] mb-6">${(i+1)*29}<span className="text-lg text-[#6B5E78]">/mo</span></p>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-center gap-2 text-[#6B5E78]"><span className="text-[#A991D4]">✓</span> Platform Access</li>
              <li className="flex items-center gap-2 text-[#6B5E78]"><span className="text-[#A991D4]">✓</span> {(i+1)*2} AI Programs</li>
              <li className="flex items-center gap-2 text-[#6B5E78]"><span className="text-[#A991D4]">✓</span> Analytics Dashboard</li>
            </ul>
            <button className="w-full py-3 border border-[#E5DDEB] rounded-xl hover:bg-[#E9DFF4] transition-colors">Edit Plan</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminMembershipPlans;