import { Wallet } from 'lucide-react';

const AdminSubscriptions = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="text-[#16A34A]" size={32} />
            Active Subscriptions
          </h1>
          <p className="text-[#475569] mt-2">Monitor user billing cycles and active passes.</p>
        </div>
        <button className="px-6 py-2 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors">
          Manage Active Subscriptions
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 mb-6 flex justify-between items-center">
         <div>
           <p className="text-[#475569] text-sm">Monthly Recurring Revenue</p>
           <h2 className="text-3xl font-bold text-[#16A34A]">$24,500</h2>
         </div>
         <div className="text-right">
           <p className="text-[#475569] text-sm">Active Subscribers</p>
           <h2 className="text-3xl font-bold">842</h2>
         </div>
      </div>
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FFFFFF] text-[#475569] text-sm border-b border-[#CCFBF1]">
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Plan</th>
              <th className="p-4 font-medium">Billing Cycle</th>
              <th className="p-4 font-medium">Next Charge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CCFBF1] text-sm">
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row} className="hover:bg-[#FFFFFF]">
                <td className="p-4 font-bold">User {row}</td>
                <td className="p-4 text-[#16A34A]">Pro Tier</td>
                <td className="p-4">Monthly</td>
                <td className="p-4">Oct {20 + row}, 2026</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
    </div>
  );
};

export default AdminSubscriptions;