import { Users } from 'lucide-react';

const SuperAdminGymUsers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#D3DFDA] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-[#6fa3a0]" size={32} />
            Gym Users
          </h1>
          <p className="text-[#455250] mt-2 font-mono text-sm">End-users mapped to specific organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#6fa3a0]/10 text-[#6fa3a0] border border-[#6fa3a0]/30 rounded-xl font-bold hover:bg-[#6fa3a0] hover:text-[#164A4A] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl overflow-hidden p-6">
        <h2 className="text-lg font-bold mb-4 font-mono text-[#6fa3a0]">User Distribution Map</h2>
        <div className="h-64 bg-[#FFFFFF] rounded-xl flex items-center justify-center border border-[#D3DFDA]">
           <p className="text-[#455250] font-mono">Heatmap Component Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminGymUsers;