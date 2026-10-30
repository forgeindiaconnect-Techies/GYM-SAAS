import { Building2 } from 'lucide-react';

const SuperAdminAllGyms = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7DADD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#B76E79]" size={32} />
            All Gyms
          </h1>
          <p className="text-[#57534E] mt-2 font-mono text-sm">Master directory of all registered organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#F3E8E8]/10 text-[#9F5965] border border-[#F3E8E8]/30 rounded-xl font-bold hover:bg-[#F3E8E8] hover:text-[#B76E79] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead><tr className="bg-[#F3E8E8] text-[#292524] border-b border-[#E7DADD]"><th className="p-4">GYM ID</th><th className="p-4">NAME</th><th className="p-4">STATUS</th><th className="p-4 text-right">ACTION</th></tr></thead>
          <tbody className="divide-y divide-[#E7DADD]">
            {[1, 2, 3].map(row => (
              <tr key={row} className="hover:bg-[#FFFFFF]">
                <td className="p-4 text-[#57534E]">ORG_00${row}</td>
                <td className="p-4 font-bold text-[#292524]">Gymora Branch ${row}</td>
                <td className="p-4"><span className="text-green-500">Active</span></td>
                <td className="p-4 text-right"><button className="text-[#B76E79]">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminAllGyms;