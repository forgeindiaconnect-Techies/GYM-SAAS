import { Building2 } from 'lucide-react';

const SuperAdminAllGyms = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#2A3A3A] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#2DD4BF]" size={32} />
            All Gyms
          </h1>
          <p className="text-[#9AAEAE] mt-2 font-mono text-sm">Master directory of all registered organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#1B2728]/10 text-[#5EEAD4] border border-[#1B2728]/30 rounded-xl font-bold hover:bg-[#1B2728] hover:text-[#2DD4BF] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#2A3A3A] rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead><tr className="bg-[#0E1415] text-[#F5FAFA] border-b border-[#2A3A3A]"><th className="p-4">GYM ID</th><th className="p-4">NAME</th><th className="p-4">STATUS</th><th className="p-4 text-right">ACTION</th></tr></thead>
          <tbody className="divide-y divide-[#2A3A3A]">
            {[1, 2, 3].map(row => (
              <tr key={row} className="hover:bg-[#FFFFFF]">
                <td className="p-4 text-[#9AAEAE]">ORG_00${row}</td>
                <td className="p-4 font-bold text-[#F5FAFA]">Gymora Branch ${row}</td>
                <td className="p-4"><span className="text-green-500">Active</span></td>
                <td className="p-4 text-right"><button className="text-[#2DD4BF]">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminAllGyms;