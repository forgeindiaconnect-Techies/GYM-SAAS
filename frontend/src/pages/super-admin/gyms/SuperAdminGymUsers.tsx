import { Users } from 'lucide-react';

const SuperAdminGymUsers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#292940] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-[#6366F1]" size={32} />
            Gym Users
          </h1>
          <p className="text-[#A1A1AA] mt-2 font-mono text-sm">End-users mapped to specific organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#17172A]/10 text-[#4F46E5] border border-[#17172A]/30 rounded-xl font-bold hover:bg-[#17172A] hover:text-[#6366F1] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl overflow-hidden p-6">
        <h2 className="text-lg font-bold mb-4 font-mono text-[#4F46E5]">User Distribution Map</h2>
        <div className="h-64 bg-[#FFFFFF] rounded-xl flex items-center justify-center border border-[#292940]">
           <p className="text-[#A1A1AA] font-mono">Heatmap Component Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminGymUsers;