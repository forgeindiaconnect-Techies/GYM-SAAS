import { Users } from 'lucide-react';

const SuperAdminGymUsers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7DADD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-[#B76E79]" size={32} />
            Gym Users
          </h1>
          <p className="text-[#57534E] mt-2 font-mono text-sm">End-users mapped to specific organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#F3E8E8]/10 text-[#9F5965] border border-[#F3E8E8]/30 rounded-xl font-bold hover:bg-[#F3E8E8] hover:text-[#B76E79] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl overflow-hidden p-6">
        <h2 className="text-lg font-bold mb-4 font-mono text-[#9F5965]">User Distribution Map</h2>
        <div className="h-64 bg-[#FFFFFF] rounded-xl flex items-center justify-center border border-[#E7DADD]">
           <p className="text-[#57534E] font-mono">Heatmap Component Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminGymUsers;