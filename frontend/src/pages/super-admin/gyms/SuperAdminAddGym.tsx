import { PlusSquare } from 'lucide-react';

const SuperAdminAddGym = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#DCD9CD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PlusSquare className="text-[#8FA89B]" size={32} />
            Add New Gym
          </h1>
          <p className="text-[#4A514D] mt-2 font-mono text-sm">Onboard a new organization to the platform.</p>
        </div>
        <button className="px-6 py-2 bg-[#8FA89B]/10 text-[#8FA89B] border border-[#8FA89B]/30 rounded-xl font-bold hover:bg-[#8FA89B] hover:text-[#34483F] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 max-w-2xl">
        <div className="space-y-4">
          <input type="text" placeholder="Organization Name" className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-[#202522] outline-none focus:border-[#8FA89B]" />
          <input type="text" placeholder="Owner Email" className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-[#202522] outline-none focus:border-[#8FA89B]" />
          <button className="w-full py-4 bg-[#8FA89B] text-white rounded-xl font-bold hover:bg-teal-600">Provision Organization</button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAddGym;