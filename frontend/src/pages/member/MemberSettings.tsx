import { Shield, Bell, Moon } from 'lucide-react';

const MemberSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#78716C]">Manage your account preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden divide-y divide-[#E7E5E4]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FED7AA] rounded-lg flex items-center justify-center text-[#78716C]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Password & Security</h3>
              <p className="text-sm text-[#78716C]">Change your password and secure your account</p>
            </div>
          </div>
          <span className="text-[#78716C]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FED7AA] rounded-lg flex items-center justify-center text-[#78716C]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Notification Preferences</h3>
              <p className="text-sm text-[#78716C]">Control what alerts you receive</p>
            </div>
          </div>
          <span className="text-[#78716C]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FED7AA] rounded-lg flex items-center justify-center text-[#78716C]"><Moon size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Appearance</h3>
              <p className="text-sm text-[#78716C]">Dark mode is currently enabled by default</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button className="text-[#FED7AA] font-medium hover:underline text-sm">Delete Account</button>
      </div>
    </div>
  );
};

export default MemberSettings;