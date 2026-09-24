import { UserCircle } from 'lucide-react';

const SuperAdminGymAdmins = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#D3DFDA] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCircle className="text-[#6fa3a0]" size={32} />
            Gym Admins
          </h1>
          <p className="text-[#455250] mt-2 font-mono text-sm">Local administrative staff assigned to gyms.</p>
        </div>
        <button className="px-6 py-2 bg-[#6fa3a0]/10 text-[#6fa3a0] border border-[#6fa3a0]/30 rounded-xl font-bold hover:bg-[#6fa3a0] hover:text-[#164A4A] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold text-[#202828]">Local Manager ${i}</p>
               <p className="text-xs text-[#455250] font-mono mt-1">Assigned to ORG_00${i}</p>
             </div>
             <button className="px-4 py-2 border border-[#D3DFDA] hover:bg-[#E8E5DA] rounded-lg text-sm text-[#6fa3a0]">Revoke</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymAdmins;