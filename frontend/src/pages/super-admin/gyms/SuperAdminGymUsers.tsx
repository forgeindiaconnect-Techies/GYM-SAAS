import { Users } from 'lucide-react';

const SuperAdminGymUsers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-[#EA580C]" size={32} />
            Gym Users
          </h1>
          <p className="text-[#64748B] mt-2 font-mono text-sm">End-users mapped to specific organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#FFF7ED] text-[#9A3412] border border-[#F8FAFC]/30 rounded-xl font-bold hover:bg-[#FFF7ED] hover:text-[#EA580C] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden p-6">
        <h2 className="text-lg font-bold mb-4 font-mono text-[#9A3412]">User Distribution Map</h2>
        <div className="h-64 bg-[#FFFFFF] rounded-xl flex items-center justify-center border border-[#E2E8F0]">
           <p className="text-[#64748B] font-mono">Heatmap Component Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminGymUsers;