import { UserCircle } from 'lucide-react';

const SuperAdminGymAdmins = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#DCD9CD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserCircle className="text-[#8FA89B]" size={32} />
            Gym Admins
          </h1>
          <p className="text-[#4A514D] mt-2 font-mono text-sm">Local administrative staff assigned to gyms.</p>
        </div>
        <button className="px-6 py-2 bg-[#8FA89B]/10 text-[#8FA89B] border border-[#8FA89B]/30 rounded-xl font-bold hover:bg-[#8FA89B] hover:text-[#34483F] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold text-[#202522]">Local Manager ${i}</p>
               <p className="text-xs text-[#4A514D] font-mono mt-1">Assigned to ORG_00${i}</p>
             </div>
             <button className="px-4 py-2 border border-[#DCD9CD] hover:bg-[#E8E5DA] rounded-lg text-sm text-[#8FA89B]">Revoke</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymAdmins;