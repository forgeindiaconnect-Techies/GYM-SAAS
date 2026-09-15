
import { useState } from 'react';
import { IndianRupee, ArrowUpRight, ArrowDownRight, Download, Search } from 'lucide-react';

const mockTransactions = [
  { id: 'TRX-9012', member: 'John Doe', amount: 29.99, type: 'Subscription', date: '2026-09-08', status: 'Completed' },
  { id: 'TRX-9013', member: 'Emily Davis', amount: 89.99, type: 'Subscription', date: '2026-09-08', status: 'Completed' },
  { id: 'TRX-9014', member: 'Mike Johnson', amount: 45.00, type: 'PT Session', date: '2026-09-07', status: 'Failed' },
  { id: 'TRX-9015', member: 'Jane Smith', amount: 49.99, type: 'Subscription', date: '2026-09-07', status: 'Completed' },
  { id: 'TRX-9016', member: 'Walk-in Guest', amount: 15.00, type: 'Day Pass', date: '2026-09-07', status: 'Completed' },
];

const exportToCSV = () => {
  const headers = ['Transaction ID', 'Member', 'Type', 'Date', 'Amount (₹)', 'Status'];
  const rows = mockTransactions.map(trx => [
    trx.id,
    trx.member,
    trx.type,
    trx.date,
    trx.amount.toFixed(2),
    trx.status,
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const GymAdminPayments = () => {
  const [search, setSearch] = useState('');

  const filtered = mockTransactions.filter(trx =>
    trx.id.toLowerCase().includes(search.toLowerCase()) ||
    trx.member.toLowerCase().includes(search.toLowerCase()) ||
    trx.type.toLowerCase().includes(search.toLowerCase()) ||
    trx.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Payments & Revenue</h1>
          <p className="text-[#475569] mt-1">Track gym revenue, subscriptions, and financial health.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] font-bold rounded-xl hover:bg-[#F0FDFA] hover:border-[#16A34A] transition-colors flex items-center gap-2"
        >
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
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by ID, member, type or status..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none"
            />
            <Search className="absolute left-2.5 top-2.5 text-[#475569]" size={16} />
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#475569]">No transactions match your search.</td>
                </tr>
              ) : filtered.map((trx) => (
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
