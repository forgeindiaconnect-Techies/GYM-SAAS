import { Dumbbell } from 'lucide-react';

const SuperAdminTrainers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7DADD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Dumbbell className="text-[#B76E79]" size={32} />
            Trainer Management
          </h1>
          <p className="text-[#57534E] mt-2 font-mono text-sm">Manage all trainer accounts and KYC.</p>
        </div>
        <button className="px-6 py-2 bg-[#F3E8E8]/10 text-[#9F5965] border border-[#F3E8E8]/30 rounded-xl font-bold hover:bg-[#F3E8E8] hover:text-[#B76E79] transition-colors">
          Execute Protocol
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Nodes', val: '1,492' },
          { label: 'Active Streams', val: '384' },
          { label: 'Error Rate', val: '0.04%' },
          { label: 'System Load', val: '42%' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-xl p-5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-[#F3E8E8]/5 rounded-full blur-xl group-hover:bg-[#F3E8E8]/10 transition-colors"></div>
             <p className="text-[#57534E] text-xs font-mono uppercase mb-1">{stat.label}</p>
             <p className="text-2xl font-bold text-[#292524] relative z-10">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#E7DADD] bg-[#FFFFFF]">
          <h2 className="text-sm font-bold font-mono text-[#9F5965] uppercase tracking-widest">Global Registry Table</h2>
        </div>
        <table className="w-full text-left font-mono text-sm">
          <thead>
            <tr className="bg-[#F3E8E8] text-[#292524] border-b border-[#E7DADD]">
              <th className="p-4 font-normal">SYS_ID</th>
              <th className="p-4 font-normal">STATUS</th>
              <th className="p-4 font-normal">TIMESTAMP</th>
              <th className="p-4 font-normal text-right">OVERRIDE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7DADD]">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <tr key={row} className="hover:bg-[#FFFFFF] transition-colors">
                <td className="p-4 text-[#57534E]">0x00A${row}F${9-row}</td>
                <td className="p-4">
                   <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-[10px] uppercase border border-green-500/20">Operational</span>
                </td>
                <td className="p-4 text-[#57534E]">2026-10-12T14:43:0${row}Z</td>
                <td className="p-4 text-right">
                  <button className="text-[#57534E] hover:text-[#B76E79] transition-colors">Modify</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminTrainers;
