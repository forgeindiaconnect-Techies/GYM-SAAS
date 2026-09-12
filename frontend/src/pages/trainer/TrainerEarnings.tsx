import { DollarSign, TrendingUp, Download } from 'lucide-react';

const TrainerEarnings = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-[#475569]">Track your income and commissions</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-8 flex flex-col justify-center">
          <p className="text-[#475569] font-medium mb-2">Available Balance</p>
          <div className="flex items-end gap-4 mb-6">
            <h2 className="text-5xl font-bold text-[#16A34A]">$1,250.00</h2>
            <span className="flex items-center gap-1 text-green-500 text-sm font-medium bg-green-500/10 px-2 py-1 rounded mb-2">
              <TrendingUp size={14} /> +12% this month
            </span>
          </div>
          <button className="w-max px-6 py-3 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors">
            Request Withdrawal
          </button>
        </div>
        
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 flex flex-col justify-between">
           <div>
             <p className="text-[#475569] text-sm mb-1">Total Earned (YTD)</p>
             <p className="text-2xl font-bold">$14,500.00</p>
           </div>
           <div className="mt-4 pt-4 border-t border-[#CCFBF1]">
             <p className="text-[#475569] text-sm mb-1">Completed Sessions</p>
             <p className="text-2xl font-bold">142</p>
           </div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center">
          <h3 className="font-bold text-lg">Recent Transactions</h3>
          <button className="text-sm text-[#475569] hover:text-[#16A34A] flex items-center gap-2"><Download size={16}/> Export</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FFFFFF] text-[#475569] text-sm border-b border-[#CCFBF1]">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Description</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CCFBF1] text-sm">
            {[
              { date: 'Oct 12, 2026', desc: '1-on-1 Session (Sarah C.)', type: 'Session Fee', amt: '+$50.00' },
              { date: 'Oct 11, 2026', desc: 'Group Class (HIIT)', type: 'Class Bonus', amt: '+$100.00' },
              { date: 'Oct 10, 2026', desc: 'Diet Plan Commission', type: 'Commission', amt: '+$25.00' },
              { date: 'Oct 01, 2026', desc: 'Bank Withdrawal', type: 'Payout', amt: '-$1,000.00' },
            ].map((tx, i) => (
              <tr key={i} className="hover:bg-[#FFFFFF]">
                <td className="p-4">{tx.date}</td>
                <td className="p-4 font-medium">{tx.desc}</td>
                <td className="p-4"><span className="px-2 py-1 bg-[#E2E8F0] rounded text-xs">{tx.type}</span></td>
                <td className={`p-4 text-right font-bold ${tx.amt.startsWith('+') ? 'text-green-500' : 'text-[#1E293B]'}`}>{tx.amt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrainerEarnings;