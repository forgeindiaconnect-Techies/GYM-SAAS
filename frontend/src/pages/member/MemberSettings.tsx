import { Settings, Shield, Bell, Moon } from 'lucide-react';

const MemberSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#4A514D]">Manage your account preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden divide-y divide-[#DCD9CD]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E8E5DA] rounded-lg flex items-center justify-center text-[#4A514D]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#202522]">Password & Security</h3>
              <p className="text-sm text-[#4A514D]">Change your password and secure your account</p>
            </div>
          </div>
          <span className="text-[#4A514D]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E8E5DA] rounded-lg flex items-center justify-center text-[#4A514D]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#202522]">Notification Preferences</h3>
              <p className="text-sm text-[#4A514D]">Control what alerts you receive</p>
            </div>
          </div>
          <span className="text-[#4A514D]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E8E5DA] rounded-lg flex items-center justify-center text-[#4A514D]"><Moon size={20} /></div>
            <div>
              <h3 className="font-bold text-[#202522]">Appearance</h3>
              <p className="text-sm text-[#4A514D]">Dark mode is currently enabled by default</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button className="text-[#8FA89B] font-medium hover:underline text-sm">Delete Account</button>
      </div>
    </div>
  );
};

export default MemberSettings;