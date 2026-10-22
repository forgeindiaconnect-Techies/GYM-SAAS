import { PlusSquare } from 'lucide-react';

const SuperAdminAddGym = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#D9E2E3] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PlusSquare className="text-[#167D78]" size={32} />
            Add New Gym
          </h1>
          <p className="text-[#697778] mt-2 font-mono text-sm">Onboard a new organization to the platform.</p>
        </div>
        <button className="px-6 py-2 bg-[#D8EAE7]/10 text-[#116660] border border-[#D8EAE7]/30 rounded-xl font-bold hover:bg-[#D8EAE7] hover:text-[#167D78] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-2xl p-6 max-w-2xl">
        <div className="space-y-4">
          <input type="text" placeholder="Organization Name" className="w-full bg-[#FFFFFF] border border-[#D9E2E3] rounded-xl px-4 py-3 text-[#344B4A] outline-none focus:border-[#D8EAE7]" />
          <input type="text" placeholder="Owner Email" className="w-full bg-[#FFFFFF] border border-[#D9E2E3] rounded-xl px-4 py-3 text-[#344B4A] outline-none focus:border-[#D8EAE7]" />
          <button className="w-full py-4 bg-[#D8EAE7] text-white rounded-xl font-bold hover:bg-teal-600">Provision Organization</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAddGym;