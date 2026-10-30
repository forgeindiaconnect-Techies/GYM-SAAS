import { UserCircle } from 'lucide-react';

const SuperAdminGymAdmins = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCircle className="text-[#EA580C]" size={32} />
            Gym Admins
          </h1>
          <p className="text-[#64748B] mt-2 font-mono text-sm">Local administrative staff assigned to gyms.</p>
        </div>
        <button className="px-6 py-2 bg-[#FFF7ED] text-[#9A3412] border border-[#F8FAFC]/30 rounded-xl font-bold hover:bg-[#FFF7ED] hover:text-[#EA580C] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold text-[#111827]">Local Manager ${i}</p>
               <p className="text-xs text-[#64748B] font-mono mt-1">Assigned to ORG_00${i}</p>
             </div>
             <button className="px-4 py-2 border border-[#E2E8F0] hover:bg-[#FFF7ED] rounded-lg text-sm text-[#111827]">Revoke</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymAdmins;