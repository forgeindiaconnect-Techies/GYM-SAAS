import { TrendingUp } from 'lucide-react';

const AdminTrainerEarnings = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="text-[#6366F1]" size={32} />
            Trainer Earnings
          </h1>
          <p className="text-[#A1A1AA] mt-2">Monitor trainer revenues and outstanding balances.</p>
        </div>
        <button className="px-6 py-2 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#4F46E5] transition-colors">
          Manage Trainer Earnings
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="font-bold">Trainer #{i}</div>
              <div className="text-xs bg-[#17172A] px-2 py-1 rounded text-[#A1A1AA]">85% Split</div>
            </div>
            <p className="text-sm text-[#A1A1AA]">Pending Payout</p>
            <p className="text-2xl font-bold text-[#6366F1] mb-4">${(i * 450).toFixed(2)}</p>
            <button className="w-full py-2 bg-[#17172A] hover:bg-[#333] rounded-lg text-sm transition-colors">Process Payout</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminTrainerEarnings;