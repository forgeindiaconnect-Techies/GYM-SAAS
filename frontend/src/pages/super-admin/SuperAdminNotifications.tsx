import { Bell } from 'lucide-react';

const SuperAdminNotifications = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#CCFBF1] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="text-[#0D9488]" size={32} />
            System Notifications
          </h1>
          <p className="text-[#475569] mt-2 font-mono text-sm">Global broadcast messaging.</p>
        </div>
        <button className="px-6 py-2 bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/30 rounded-xl font-bold hover:bg-[#0D9488] hover:text-[#16A34A] transition-colors">
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
          <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-16 h-16 bg-[#0D9488]/5 rounded-full blur-xl group-hover:bg-[#0D9488]/10 transition-colors"></div>
             <p className="text-[#475569] text-xs font-mono uppercase mb-1">{stat.label}</p>
             <p className="text-2xl font-bold text-[#1E293B] relative z-10">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#CCFBF1] bg-[#FFFFFF]">
          <h2 className="text-sm font-bold font-mono text-[#0D9488] uppercase tracking-widest">Global Registry Table</h2>
        </div>
        <table className="w-full text-left font-mono text-sm">
          <thead>
            <tr className="bg-[#0a0a0a] text-[#555] border-b border-[#CCFBF1]">
              <th className="p-4 font-normal">SYS_ID</th>
              <th className="p-4 font-normal">STATUS</th>
              <th className="p-4 font-normal">TIMESTAMP</th>
              <th className="p-4 font-normal text-right">OVERRIDE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CCFBF1]">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <tr key={row} className="hover:bg-[#FFFFFF] transition-colors">
                <td className="p-4 text-[#475569]">0x00A${row}F${9-row}</td>
                <td className="p-4">
                   <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-[10px] uppercase border border-green-500/20">Operational</span>
                </td>
                <td className="p-4 text-[#475569]">2026-10-12T14:43:0${row}Z</td>
                <td className="p-4 text-right">
                  <button className="text-[#555] hover:text-[#0D9488] transition-colors">Modify</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminNotifications;
