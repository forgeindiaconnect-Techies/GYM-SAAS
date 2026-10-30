import { PlusSquare } from 'lucide-react';

const SuperAdminAddGym = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E2E8F0] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PlusSquare className="text-[#EA580C]" size={32} />
            Add New Gym
          </h1>
          <p className="text-[#64748B] mt-2 font-mono text-sm">Onboard a new organization to the platform.</p>
        </div>
        <button className="px-6 py-2 bg-[#FFF7ED] text-[#9A3412] border border-[#F8FAFC]/30 rounded-xl font-bold hover:bg-[#FFF7ED] hover:text-[#EA580C] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 max-w-2xl">
        <div className="space-y-4">
          <input type="text" placeholder="Organization Name" className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#111827] outline-none focus:border-[#F8FAFC]" />
          <input type="text" placeholder="Owner Email" className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#111827] outline-none focus:border-[#F8FAFC]" />
          <button className="w-full py-4 bg-[#F8FAFC] text-white rounded-xl font-bold hover:bg-[#9A3412]">Provision Organization</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAddGym;