import { UserCircle } from 'lucide-react';

const SuperAdminGymAdmins = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E5DDEB] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCircle className="text-[#967CC5]" size={32} />
            Gym Admins
          </h1>
          <p className="text-[#6B5E78] mt-2 font-mono text-sm">Local administrative staff assigned to gyms.</p>
        </div>
        <button className="px-6 py-2 bg-[#E9DFF4]/10 text-[#967CC5] border border-[#E9DFF4]/30 rounded-xl font-bold hover:bg-[#E9DFF4] hover:text-[#A991D4] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E5DDEB] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold text-[#292431]">Local Manager ${i}</p>
               <p className="text-xs text-[#6B5E78] font-mono mt-1">Assigned to ORG_00${i}</p>
             </div>
             <button className="px-4 py-2 border border-[#E5DDEB] hover:bg-[#E9DFF4] rounded-lg text-sm text-[#292431]">Revoke</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymAdmins;