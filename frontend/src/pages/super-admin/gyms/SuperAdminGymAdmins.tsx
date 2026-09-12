import { UserCircle } from 'lucide-react';

const SuperAdminGymAdmins = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#CCFBF1] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCircle className="text-[#0D9488]" size={32} />
            Gym Admins
          </h1>
          <p className="text-[#475569] mt-2 font-mono text-sm">Local administrative staff assigned to gyms.</p>
        </div>
        <button className="px-6 py-2 bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/30 rounded-xl font-bold hover:bg-[#0D9488] hover:text-[#16A34A] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold text-[#1E293B]">Local Manager ${i}</p>
               <p className="text-xs text-[#475569] font-mono mt-1">Assigned to ORG_00${i}</p>
             </div>
             <button className="px-4 py-2 border border-[#CCFBF1] hover:bg-[#E2E8F0] rounded-lg text-sm text-[#0D9488]">Revoke</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymAdmins;