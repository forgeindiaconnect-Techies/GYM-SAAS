import { PlusSquare } from 'lucide-react';

const SuperAdminAddGym = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7DADD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PlusSquare className="text-[#B76E79]" size={32} />
            Add New Gym
          </h1>
          <p className="text-[#57534E] mt-2 font-mono text-sm">Onboard a new organization to the platform.</p>
        </div>
        <button className="px-6 py-2 bg-[#F3E8E8]/10 text-[#9F5965] border border-[#F3E8E8]/30 rounded-xl font-bold hover:bg-[#F3E8E8] hover:text-[#B76E79] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-6 max-w-2xl">
        <div className="space-y-4">
          <input type="text" placeholder="Organization Name" className="w-full bg-[#FFFFFF] border border-[#E7DADD] rounded-xl px-4 py-3 text-[#292524] outline-none focus:border-[#F3E8E8]" />
          <input type="text" placeholder="Owner Email" className="w-full bg-[#FFFFFF] border border-[#E7DADD] rounded-xl px-4 py-3 text-[#292524] outline-none focus:border-[#F3E8E8]" />
          <button className="w-full py-4 bg-[#F3E8E8] text-white rounded-xl font-bold hover:bg-[#9F5965]">Provision Organization</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAddGym;