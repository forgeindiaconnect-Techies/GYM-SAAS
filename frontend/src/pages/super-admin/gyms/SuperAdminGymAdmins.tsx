import { UserCircle } from 'lucide-react';

const SuperAdminGymAdmins = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#D9E2E3] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCircle className="text-[#167D78]" size={32} />
            Gym Admins
          </h1>
          <p className="text-[#697778] mt-2 font-mono text-sm">Local administrative staff assigned to gyms.</p>
        </div>
        <button className="px-6 py-2 bg-[#D8EAE7]/10 text-[#116660] border border-[#D8EAE7]/30 rounded-xl font-bold hover:bg-[#D8EAE7] hover:text-[#167D78] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D9E2E3] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold text-[#344B4A]">Local Manager ${i}</p>
               <p className="text-xs text-[#697778] font-mono mt-1">Assigned to ORG_00${i}</p>
             </div>
             <button className="px-4 py-2 border border-[#D9E2E3] hover:bg-[#D8EAE7] rounded-lg text-sm text-[#344B4A]">Revoke</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymAdmins;