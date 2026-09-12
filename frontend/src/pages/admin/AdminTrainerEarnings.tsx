import { TrendingUp } from 'lucide-react';

const AdminTrainerEarnings = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-[#16A34A]" size={32} />
            Trainer Earnings
          </h1>
          <p className="text-[#475569] mt-2">Monitor trainer revenues and outstanding balances.</p>
        </div>
        <button className="px-6 py-2 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors">
          Manage Trainer Earnings
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold">Trainer #{i}</div>
              <div className="text-xs bg-[#E2E8F0] px-2 py-1 rounded text-[#475569]">85% Split</div>
            </div>
            <p className="text-sm text-[#475569]">Pending Payout</p>
            <p className="text-2xl font-bold text-[#16A34A] mb-4">${(i * 450).toFixed(2)}</p>
            <button className="w-full py-2 bg-[#E2E8F0] hover:bg-[#333] rounded-lg text-sm transition-colors">Process Payout</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminTrainerEarnings;