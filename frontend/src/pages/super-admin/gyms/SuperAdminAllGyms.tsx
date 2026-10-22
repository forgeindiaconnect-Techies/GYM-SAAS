import { Building2 } from 'lucide-react';

const SuperAdminAllGyms = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#D9E2E3] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#167D78]" size={32} />
            All Gyms
          </h1>
          <p className="text-[#697778] mt-2 font-mono text-sm">Master directory of all registered organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#D8EAE7]/10 text-[#116660] border border-[#D8EAE7]/30 rounded-xl font-bold hover:bg-[#D8EAE7] hover:text-[#167D78] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-2xl overflow-hidden">
        <table className="w-full text-left font-mono text-sm">
          <thead><tr className="bg-[#E8EFF0] text-[#344B4A] border-b border-[#D9E2E3]"><th className="p-4">GYM ID</th><th className="p-4">NAME</th><th className="p-4">STATUS</th><th className="p-4 text-right">ACTION</th></tr></thead>
          <tbody className="divide-y divide-[#D9E2E3]">
            {[1, 2, 3].map(row => (
              <tr key={row} className="hover:bg-[#FFFFFF]">
                <td className="p-4 text-[#697778]">ORG_00${row}</td>
                <td className="p-4 font-bold text-[#344B4A]">Gymora Branch ${row}</td>
                <td className="p-4"><span className="text-green-500">Active</span></td>
                <td className="p-4 text-right"><button className="text-[#167D78]">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminAllGyms;