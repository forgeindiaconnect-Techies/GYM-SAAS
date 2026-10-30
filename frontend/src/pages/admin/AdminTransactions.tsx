import { Receipt } from 'lucide-react';

const AdminTransactions = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Receipt className="text-[#EA580C]" size={32} />
            Transaction Logs
          </h1>
          <p className="text-[#64748B] mt-2">Detailed ledger of all financial movements.</p>
        </div>
        <button className="px-6 py-2 bg-[#C2410C] text-white font-bold rounded-xl font-bold hover:bg-[#9A3412] transition-colors">
          Manage Transaction Logs
        </button>
      </div>
      
      
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold">Subscription Renewal - Pro</p>
               <p className="text-xs text-[#64748B]">Oct {i}, 2026 • Stripe • TXN_00{i}</p>
             </div>
             <div className="text-right">
               <p className="font-bold text-green-500">+$29.00</p>
             </div>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminTransactions;