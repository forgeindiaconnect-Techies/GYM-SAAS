import { DollarSign, Download } from 'lucide-react';

const MemberPayments = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments & Invoices</h1>
        <p className="text-[#475569]">View your billing history</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#CCFBF1] bg-[#FFFFFF]">
                <th className="p-4 font-medium text-[#475569]">Date</th>
                <th className="p-4 font-medium text-[#475569]">Description</th>
                <th className="p-4 font-medium text-[#475569]">Amount</th>
                <th className="p-4 font-medium text-[#475569]">Status</th>
                <th className="p-4 font-medium text-[#475569]">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CCFBF1]">
              {[
                { date: 'Sep 01, 2026', desc: 'Pro Plan Monthly', amt: '$49.99', status: 'Paid' },
                { date: 'Aug 01, 2026', desc: 'Pro Plan Monthly', amt: '$49.99', status: 'Paid' },
                { date: 'Jul 15, 2026', desc: 'Personal Training (1 Session)', amt: '$30.00', status: 'Paid' },
                { date: 'Jul 01, 2026', desc: 'Pro Plan Monthly', amt: '$49.99', status: 'Paid' },
              ].map((tx, i) => (
                <tr key={i} className="hover:bg-[#FFFFFF] transition-colors">
                  <td className="p-4">{tx.date}</td>
                  <td className="p-4 font-medium">{tx.desc}</td>
                  <td className="p-4">{tx.amt}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500 rounded-full">
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-[#475569] hover:text-[#16A34A] transition transition-colors">
                      <Download size={18} />
                    </button>
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

export default MemberPayments;