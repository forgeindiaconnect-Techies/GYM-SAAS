import { Server } from 'lucide-react';

const SuperAdminGymEquipment = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#2A3A3A] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="text-[#2DD4BF]" size={32} />
            Equipment Directory
          </h1>
          <p className="text-[#9AAEAE] mt-2 font-mono text-sm">Global equipment and asset tracking per gym.</p>
        </div>
        <button className="px-6 py-2 bg-[#1B2728]/10 text-[#5EEAD4] border border-[#1B2728]/30 rounded-xl font-bold hover:bg-[#1B2728] hover:text-[#2DD4BF] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#2A3A3A] rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead><tr className="bg-[#0E1415] text-[#F5FAFA] border-b border-[#2A3A3A]"><th className="p-4">ASSET ID</th><th className="p-4">TYPE</th><th className="p-4">CONDITION</th><th className="p-4">GYM</th></tr></thead>
          <tbody className="divide-y divide-[#2A3A3A]">
            {[1, 2, 3, 4].map(row => (
              <tr key={row} className="hover:bg-[#FFFFFF]">
                <td className="p-4 text-[#9AAEAE]">EQ_TREAD_${row}</td>
                <td className="p-4 text-[#F5FAFA]">Smart Treadmill</td>
                <td className="p-4 text-green-500">Optimal</td>
                <td className="p-4 text-[#9AAEAE]">ORG_001</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminGymEquipment;