import { Settings } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="text-[#EA580C]" size={32} />
            Platform Settings
          </h1>
          <p className="text-[#64748B] mt-2">Global application variables and integrations.</p>
        </div>
        <button className="px-6 py-2 bg-[#C2410C] text-white font-bold rounded-xl font-bold hover:bg-[#9A3412] transition-colors">
          Manage Platform Settings
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 max-w-2xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
            <div>
              <p className="font-bold">Maintenance Mode</p>
              <p className="text-sm text-[#64748B]">Take platform offline for updates</p>
            </div>
            <div className="w-12 h-6 bg-[#F8FAFC] rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-[#64748B] rounded-full"></div></div>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
            <div>
              <p className="font-bold">Stripe Webhooks</p>
              <p className="text-sm text-green-500">Connected</p>
            </div>
            <button className="text-sm text-[#64748B] hover:text-[#C2410C]">Refresh Keys</button>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-[#E2E8F0]">
            <div>
              <p className="font-bold">OpenAI Integration</p>
              <p className="text-sm text-green-500">Connected (GPT-4 Active)</p>
            </div>
            <button className="text-sm text-[#64748B] hover:text-[#C2410C]">Configure</button>
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default AdminSettings;