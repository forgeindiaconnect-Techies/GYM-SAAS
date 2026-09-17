import { CreditCard, Landmark, AlertCircle } from 'lucide-react';

const TrainerWithdrawals = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Withdrawals & Payouts</h1>
        <p className="text-[#475569]">Manage your linked accounts and payout settings</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Payout Method</h2>
        
        <div className="flex items-center justify-between p-4 bg-[#FFFFFF] border border-[#16A34A] rounded-xl mb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 bg-[#16A34A] text-white text-[10px] font-bold uppercase rounded-bl-lg">Primary</div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Landmark size={24} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-[#1E293B]">Chase Bank</h4>
              <p className="text-sm text-[#475569]">Checking •••• 9876</p>
            </div>
          </div>
          <button className="px-4 py-2 text-sm font-medium hover:bg-[#E2E8F0] rounded-lg transition-colors">Edit</button>
        </div>

        <button className="flex items-center gap-2 text-[#16A34A] hover:underline text-sm font-medium mt-2">
          + Add another payout method
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Payout History</h2>
        <div className="space-y-3">
          {[
            { date: 'Oct 01, 2026', amt: '₹1,000.00', status: 'Completed', ref: 'TRX-98234' },
            { date: 'Sep 01, 2026', amt: '₹1,200.00', status: 'Completed', ref: 'TRX-88211' },
            { date: 'Aug 01, 2026', amt: '₹950.00', status: 'Completed', ref: 'TRX-78199' },
          ].map((tx, i) => (
            <div key={i} className="flex justify-between items-center p-4 border border-[#CCFBF1] bg-[#FFFFFF] rounded-xl">
              <div>
                <p className="font-bold">{tx.amt}</p>
                <p className="text-xs text-[#475569]">{tx.date} • Ref: {tx.ref}</p>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold">
                {tx.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 text-blue-400 text-sm">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <p>Payouts are processed automatically on the 1st of every month. Manual withdrawals take 2-3 business days to reflect in your bank account.</p>
      </div>
    </div>
  );
};

export default TrainerWithdrawals;