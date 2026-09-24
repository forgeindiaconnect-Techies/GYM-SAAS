import { PlusSquare } from 'lucide-react';

const SuperAdminAddGym = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#D3DFDA] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PlusSquare className="text-[#6fa3a0]" size={32} />
            Add New Gym
          </h1>
          <p className="text-[#455250] mt-2 font-mono text-sm">Onboard a new organization to the platform.</p>
        </div>
        <button className="px-6 py-2 bg-[#6fa3a0]/10 text-[#6fa3a0] border border-[#6fa3a0]/30 rounded-xl font-bold hover:bg-[#6fa3a0] hover:text-[#164A4A] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 max-w-2xl">
        <div className="space-y-4">
          <input type="text" placeholder="Organization Name" className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#6fa3a0]" />
          <input type="text" placeholder="Owner Email" className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-3 text-[#202828] outline-none focus:border-[#6fa3a0]" />
          <button className="w-full py-4 bg-[#6fa3a0] text-white rounded-xl font-bold hover:bg-teal-600">Provision Organization</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAddGym;