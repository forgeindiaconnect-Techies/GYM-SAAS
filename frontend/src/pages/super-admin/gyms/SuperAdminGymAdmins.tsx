import { UserCircle } from 'lucide-react';

const SuperAdminGymAdmins = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7DADD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCircle className="text-[#B76E79]" size={32} />
            Gym Admins
          </h1>
          <p className="text-[#57534E] mt-2 font-mono text-sm">Local administrative staff assigned to gyms.</p>
        </div>
        <button className="px-6 py-2 bg-[#F3E8E8]/10 text-[#9F5965] border border-[#F3E8E8]/30 rounded-xl font-bold hover:bg-[#F3E8E8] hover:text-[#B76E79] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7DADD] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold text-[#292524]">Local Manager ${i}</p>
               <p className="text-xs text-[#57534E] font-mono mt-1">Assigned to ORG_00${i}</p>
             </div>
             <button className="px-4 py-2 border border-[#E7DADD] hover:bg-[#F3E8E8] rounded-lg text-sm text-[#292524]">Revoke</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymAdmins;