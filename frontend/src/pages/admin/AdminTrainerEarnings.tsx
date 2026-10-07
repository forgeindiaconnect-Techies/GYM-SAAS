import { TrendingUp } from 'lucide-react';

const AdminTrainerEarnings = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-[#F97316]" size={32} />
            Trainer Earnings
          </h1>
          <p className="text-[#78716C] mt-2">Monitor trainer revenues and outstanding balances.</p>
        </div>
        <button className="px-6 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors">
          Manage Trainer Earnings
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold">Trainer #{i}</div>
              <div className="text-xs bg-[#FED7AA] px-2 py-1 rounded text-[#78716C]">85% Split</div>
            </div>
            <p className="text-sm text-[#78716C]">Pending Payout</p>
            <p className="text-2xl font-bold text-[#F97316] mb-4">${(i * 450).toFixed(2)}</p>
            <button className="w-full py-2 bg-[#FED7AA] hover:bg-[#333] rounded-lg text-sm transition-colors">Process Payout</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminTrainerEarnings;