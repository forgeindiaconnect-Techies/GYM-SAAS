
import { IndianRupee, ArrowUpRight, ArrowDownRight, Download, Search, Filter } from 'lucide-react';

const mockTransactions = [
  { id: 'TRX-9012', member: 'John Doe', amount: 29.99, type: 'Subscription', date: '2026-09-08', status: 'Completed' },
  { id: 'TRX-9013', member: 'Emily Davis', amount: 89.99, type: 'Subscription', date: '2026-09-08', status: 'Completed' },
  { id: 'TRX-9014', member: 'Mike Johnson', amount: 45.00, type: 'PT Session', date: '2026-09-07', status: 'Failed' },
  { id: 'TRX-9015', member: 'Jane Smith', amount: 49.99, type: 'Subscription', date: '2026-09-07', status: 'Completed' },
  { id: 'TRX-9016', member: 'Walk-in Guest', amount: 15.00, type: 'Day Pass', date: '2026-09-07', status: 'Completed' },
];

const GymAdminPayments = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Payments & Revenue</h1>
          <p className="text-[#475569] mt-1">Track gym revenue, subscriptions, and financial health.</p>
        </div>
        <button className="px-4 py-2 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] font-bold rounded-xl hover:bg-[#FFFFFF] transition-colors flex items-center gap-2">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><IndianRupee size={80} /></div>
          <p className="text-[#475569] text-sm font-semibold mb-1">Total Revenue (This Month)</p>
          <h3 className="text-3xl font-black text-[#1E293B]">₹14,250.00</h3>
          <p className="text-green-500 text-sm font-bold mt-2 flex items-center">
            <ArrowUpRight size={16} className="mr-1" /> +12.5% from last month
          </p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><IndianRupee size={80} /></div>
          <p className="text-[#475569] text-sm font-semibold mb-1">Active Subscriptions</p>
          <h3 className="text-3xl font-black text-[#1E293B]">₹11,800.00</h3>
          <p className="text-[#475569] text-sm font-medium mt-2">MRR (Monthly Recurring)</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><IndianRupee size={80} /></div>
          <p className="text-[#475569] text-sm font-semibold mb-1">Failed Payments</p>
          <h3 className="text-3xl font-black text-[#0D9488]">₹340.00</h3>
          <p className="text-[#0D9488] text-sm font-bold mt-2 flex items-center">
            <ArrowDownRight size={16} className="mr-1" /> Requires action
          </p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#CCFBF1] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-[#1E293B]">Recent Transactions</h3>
          <div className="flex gap-3">
            <div className="relative">
              <input type="text" placeholder="Search..." className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-lg pl-9 pr-3 py-1.5 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none" />
              <Search className="absolute left-2.5 top-2 text-[#475569]" size={14} />
            </div>
            <button className="p-2 bg-[#FFFFFF] border border-[#CCFBF1] rounded-lg text-[#475569] hover:text-[#16A34A] transition-colors">
              <Filter size={16} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#475569] whitespace-nowrap">
            <thead className="bg-[#FFFFFF] border-b border-[#CCFBF1] text-[#1E293B]">
              <tr>
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CCFBF1]">
              {mockTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-[#F0FDFA] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{trx.id}</td>
                  <td className="px-6 py-4 font-semibold text-[#1E293B]">{trx.member}</td>
                  <td className="px-6 py-4">{trx.type}</td>
                  <td className="px-6 py-4">{trx.date}</td>
                  <td className="px-6 py-4 font-bold text-[#1E293B]">₹{trx.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${trx.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-[#0D9488]/10 text-[#0D9488]'}`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GymAdminPayments;
