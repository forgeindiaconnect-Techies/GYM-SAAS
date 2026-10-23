import { PlusSquare } from 'lucide-react';

const SuperAdminAddGym = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#292940] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PlusSquare className="text-[#6366F1]" size={32} />
            Add New Gym
          </h1>
          <p className="text-[#A1A1AA] mt-2 font-mono text-sm">Onboard a new organization to the platform.</p>
        </div>
        <button className="px-6 py-2 bg-[#17172A]/10 text-[#4F46E5] border border-[#17172A]/30 rounded-xl font-bold hover:bg-[#17172A] hover:text-[#6366F1] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-6 max-w-2xl">
        <div className="space-y-4">
          <input type="text" placeholder="Organization Name" className="w-full bg-[#FFFFFF] border border-[#292940] rounded-xl px-4 py-3 text-[#11111F] outline-none focus:border-[#17172A]" />
          <input type="text" placeholder="Owner Email" className="w-full bg-[#FFFFFF] border border-[#292940] rounded-xl px-4 py-3 text-[#11111F] outline-none focus:border-[#17172A]" />
          <button className="w-full py-4 bg-[#17172A] text-white rounded-xl font-bold hover:bg-teal-600">Provision Organization</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAddGym;