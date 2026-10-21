import { Building2 } from 'lucide-react';

const SuperAdminAllGyms = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E5DDEB] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#967CC5]" size={32} />
            All Gyms
          </h1>
          <p className="text-[#6B5E78] mt-2 font-mono text-sm">Master directory of all registered organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#E9DFF4]/10 text-[#967CC5] border border-[#E9DFF4]/30 rounded-xl font-bold hover:bg-[#E9DFF4] hover:text-[#A991D4] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead><tr className="bg-[#0a0a0a] text-[#555] border-b border-[#E5DDEB]"><th className="p-4">GYM ID</th><th className="p-4">NAME</th><th className="p-4">STATUS</th><th className="p-4 text-right">ACTION</th></tr></thead>
          <tbody className="divide-y divide-[#E5DDEB]">
            {[1, 2, 3].map(row => (
              <tr key={row} className="hover:bg-[#FFFFFF]">
                <td className="p-4 text-[#6B5E78]">ORG_00${row}</td>
                <td className="p-4 font-bold text-[#292431]">Gymora Branch ${row}</td>
                <td className="p-4"><span className="text-green-500">Active</span></td>
                <td className="p-4 text-right"><button className="text-[#967CC5]">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminAllGyms;