import { Building2 } from 'lucide-react';

const SuperAdminGymsAdmins = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#DCD9CD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#8FA89B]" size={32} />
            Gym Admins
          </h1>
          <p className="text-[#4A514D] mt-2 font-mono text-sm">Manage the local owners/managers for each gym.</p>
        </div>
      </div>
      
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] p-4 rounded-xl flex justify-between items-center">
             <div>
               <p className="font-bold text-[#202522]">Owner Name {i}</p>
               <p className="text-xs text-[#4A514D]">owner{i}@aigym.com • Manages: Iron Paradise {i}</p>
             </div>
             <button className="text-[#8FA89B] text-sm hover:underline">Revoke Access</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default SuperAdminGymsAdmins;
