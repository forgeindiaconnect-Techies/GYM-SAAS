import { Users } from 'lucide-react';

const SuperAdminGymUsers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#DCD9CD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-[#8FA89B]" size={32} />
            Gym Users
          </h1>
          <p className="text-[#4A514D] mt-2 font-mono text-sm">End-users mapped to specific organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#8FA89B]/10 text-[#8FA89B] border border-[#8FA89B]/30 rounded-xl font-bold hover:bg-[#8FA89B] hover:text-[#34483F] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden p-6">
        <h2 className="text-lg font-bold mb-4 font-mono text-[#8FA89B]">User Distribution Map</h2>
        <div className="h-64 bg-[#FFFFFF] rounded-xl flex items-center justify-center border border-[#DCD9CD]">
           <p className="text-[#4A514D] font-mono">Heatmap Component Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminGymUsers;