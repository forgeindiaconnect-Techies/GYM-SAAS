import { PlusSquare } from 'lucide-react';

const SuperAdminAddGym = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#2A3A3A] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PlusSquare className="text-[#2DD4BF]" size={32} />
            Add New Gym
          </h1>
          <p className="text-[#9AAEAE] mt-2 font-mono text-sm">Onboard a new organization to the platform.</p>
        </div>
        <button className="px-6 py-2 bg-[#1B2728]/10 text-[#5EEAD4] border border-[#1B2728]/30 rounded-xl font-bold hover:bg-[#1B2728] hover:text-[#2DD4BF] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#2A3A3A] rounded-2xl p-6 max-w-2xl">
        <div className="space-y-4">
          <input type="text" placeholder="Organization Name" className="w-full bg-[#FFFFFF] border border-[#2A3A3A] rounded-xl px-4 py-3 text-[#F5FAFA] outline-none focus:border-[#1B2728]" />
          <input type="text" placeholder="Owner Email" className="w-full bg-[#FFFFFF] border border-[#2A3A3A] rounded-xl px-4 py-3 text-[#F5FAFA] outline-none focus:border-[#1B2728]" />
          <button className="w-full py-4 bg-[#1B2728] text-white rounded-xl font-bold hover:bg-[#5EEAD4]">Provision Organization</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAddGym;