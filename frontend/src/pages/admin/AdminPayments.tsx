import { DollarSign } from 'lucide-react';

const AdminPayments = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <DollarSign className="text-[#16A34A]" size={32} />
            Payments
          </h1>
          <p className="text-[#475569] mt-2">Monitor incoming payments and gateway status.</p>
        </div>
        <button className="px-6 py-2 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors">
          Manage Payments
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FFFFFF] text-[#475569] text-sm border-b border-[#CCFBF1]">
              <th className="p-4 font-medium">Payment ID</th>
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Amount</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CCFBF1] text-sm">
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row} className="hover:bg-[#FFFFFF]">
                <td className="p-4 font-mono text-xs">PAY_8923{row}XYZ</td>
                <td className="p-4">User {row}</td>
                <td className="p-4 font-bold">${(row * 15).toFixed(2)}</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs">Succeeded</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
    </div>
  );
};

export default AdminPayments;