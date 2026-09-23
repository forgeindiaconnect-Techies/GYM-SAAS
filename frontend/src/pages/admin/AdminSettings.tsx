import { Settings } from 'lucide-react';

const AdminSettings = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="text-[#34483F]" size={32} />
            Platform Settings
          </h1>
          <p className="text-[#4A514D] mt-2">Global application variables and integrations.</p>
        </div>
        <button className="px-6 py-2 bg-[#34483F] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
          Manage Platform Settings
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 max-w-2xl">
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#DCD9CD]">
            <div>
              <p className="font-bold">Maintenance Mode</p>
              <p className="text-sm text-[#4A514D]">Take platform offline for updates</p>
            </div>
            <div className="w-12 h-6 bg-[#E8E5DA] rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-[#727975] rounded-full"></div></div>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-[#DCD9CD]">
            <div>
              <p className="font-bold">Stripe Webhooks</p>
              <p className="text-sm text-green-500">Connected</p>
            </div>
            <button className="text-sm text-[#4A514D] hover:text-[#202522]">Refresh Keys</button>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-[#DCD9CD]">
            <div>
              <p className="font-bold">OpenAI Integration</p>
              <p className="text-sm text-green-500">Connected (GPT-4 Active)</p>
            </div>
            <button className="text-sm text-[#4A514D] hover:text-[#202522]">Configure</button>
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default AdminSettings;