import { PlusSquare } from 'lucide-react';

const SuperAdminAddGym = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E5DDEB] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PlusSquare className="text-[#967CC5]" size={32} />
            Add New Gym
          </h1>
          <p className="text-[#6B5E78] mt-2 font-mono text-sm">Onboard a new organization to the platform.</p>
        </div>
        <button className="px-6 py-2 bg-[#E9DFF4]/10 text-[#967CC5] border border-[#E9DFF4]/30 rounded-xl font-bold hover:bg-[#E9DFF4] hover:text-[#A991D4] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl p-6 max-w-2xl">
        <div className="space-y-4">
          <input type="text" placeholder="Organization Name" className="w-full bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl px-4 py-3 text-[#292431] outline-none focus:border-[#E9DFF4]" />
          <input type="text" placeholder="Owner Email" className="w-full bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl px-4 py-3 text-[#292431] outline-none focus:border-[#E9DFF4]" />
          <button className="w-full py-4 bg-[#E9DFF4] text-white rounded-xl font-bold hover:bg-teal-600">Provision Organization</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAddGym;