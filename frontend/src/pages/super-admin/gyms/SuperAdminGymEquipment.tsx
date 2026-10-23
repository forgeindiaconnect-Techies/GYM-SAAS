import { Server } from 'lucide-react';

const SuperAdminGymEquipment = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#292940] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="text-[#6366F1]" size={32} />
            Equipment Directory
          </h1>
          <p className="text-[#A1A1AA] mt-2 font-mono text-sm">Global equipment and asset tracking per gym.</p>
        </div>
        <button className="px-6 py-2 bg-[#17172A]/10 text-[#4F46E5] border border-[#17172A]/30 rounded-xl font-bold hover:bg-[#17172A] hover:text-[#6366F1] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead><tr className="bg-[#0B0B12] text-[#11111F] border-b border-[#292940]"><th className="p-4">ASSET ID</th><th className="p-4">TYPE</th><th className="p-4">CONDITION</th><th className="p-4">GYM</th></tr></thead>
          <tbody className="divide-y divide-[#292940]">
            {[1, 2, 3, 4].map(row => (
              <tr key={row} className="hover:bg-[#FFFFFF]">
                <td className="p-4 text-[#A1A1AA]">EQ_TREAD_${row}</td>
                <td className="p-4 text-[#11111F]">Smart Treadmill</td>
                <td className="p-4 text-green-500">Optimal</td>
                <td className="p-4 text-[#A1A1AA]">ORG_001</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminGymEquipment;