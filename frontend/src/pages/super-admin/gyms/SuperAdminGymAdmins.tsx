import { UserCircle } from 'lucide-react';

const SuperAdminGymAdmins = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#292940] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCircle className="text-[#6366F1]" size={32} />
            Gym Admins
          </h1>
          <p className="text-[#A1A1AA] mt-2 font-mono text-sm">Local administrative staff assigned to gyms.</p>
        </div>
        <button className="px-6 py-2 bg-[#17172A]/10 text-[#4F46E5] border border-[#17172A]/30 rounded-xl font-bold hover:bg-[#17172A] hover:text-[#6366F1] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#FFFFFF] border border-[#292940] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold text-[#11111F]">Local Manager ${i}</p>
               <p className="text-xs text-[#A1A1AA] font-mono mt-1">Assigned to ORG_00${i}</p>
             </div>
             <button className="px-4 py-2 border border-[#292940] hover:bg-[#17172A] rounded-lg text-sm text-[#11111F]">Revoke</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymAdmins;