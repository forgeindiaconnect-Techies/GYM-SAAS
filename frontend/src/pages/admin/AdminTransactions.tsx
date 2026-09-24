import { Receipt } from 'lucide-react';

const AdminTransactions = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Receipt className="text-[#164A4A]" size={32} />
            Transaction Logs
          </h1>
          <p className="text-[#455250] mt-2">Detailed ledger of all financial movements.</p>
        </div>
        <button className="px-6 py-2 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
          Manage Transaction Logs
        </button>
      </div>
      
      
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold">Subscription Renewal - Pro</p>
               <p className="text-xs text-[#455250]">Oct {i}, 2026 • Stripe • TXN_00{i}</p>
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