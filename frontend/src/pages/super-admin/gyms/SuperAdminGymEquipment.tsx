import { Server } from 'lucide-react';

const SuperAdminGymEquipment = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Server className="text-[#EA580C]" size={32} />
            Equipment Directory
          </h1>
          <p className="text-[#64748B] mt-2 font-mono text-sm">Global equipment and asset tracking per gym.</p>
        </div>
        <button className="px-6 py-2 bg-[#FFF7ED] text-[#9A3412] border border-[#F8FAFC]/30 rounded-xl font-bold hover:bg-[#FFF7ED] hover:text-[#EA580C] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead><tr className="bg-[#F8FAFC] text-[#111827] border-b border-[#E2E8F0]"><th className="p-4">ASSET ID</th><th className="p-4">TYPE</th><th className="p-4">CONDITION</th><th className="p-4">GYM</th></tr></thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {[1, 2, 3, 4].map(row => (
              <tr key={row} className="hover:bg-[#FFFFFF]">
                <td className="p-4 text-[#64748B]">EQ_TREAD_${row}</td>
                <td className="p-4 text-[#111827]">Smart Treadmill</td>
                <td className="p-4 text-green-500">Optimal</td>
                <td className="p-4 text-[#64748B]">ORG_001</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminGymEquipment;