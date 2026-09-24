import { Server } from 'lucide-react';

const SuperAdminGymEquipment = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#D3DFDA] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="text-[#6fa3a0]" size={32} />
            Equipment Directory
          </h1>
          <p className="text-[#455250] mt-2 font-mono text-sm">Global equipment and asset tracking per gym.</p>
        </div>
        <button className="px-6 py-2 bg-[#6fa3a0]/10 text-[#6fa3a0] border border-[#6fa3a0]/30 rounded-xl font-bold hover:bg-[#6fa3a0] hover:text-[#164A4A] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead><tr className="bg-[#0a0a0a] text-[#555] border-b border-[#D3DFDA]"><th className="p-4">ASSET ID</th><th className="p-4">TYPE</th><th className="p-4">CONDITION</th><th className="p-4">GYM</th></tr></thead>
          <tbody className="divide-y divide-[#D3DFDA]">
            {[1, 2, 3, 4].map(row => (
              <tr key={row} className="hover:bg-[#FFFFFF]">
                <td className="p-4 text-[#455250]">EQ_TREAD_${row}</td>
                <td className="p-4 text-[#202828]">Smart Treadmill</td>
                <td className="p-4 text-green-500">Optimal</td>
                <td className="p-4 text-[#455250]">ORG_001</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminGymEquipment;