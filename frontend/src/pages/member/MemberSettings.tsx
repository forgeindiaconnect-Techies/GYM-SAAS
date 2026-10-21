import { Shield, Bell, Moon } from 'lucide-react';

const MemberSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#6B5E78]">Manage your account preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl overflow-hidden divide-y divide-[#E5DDEB]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E9DFF4] rounded-lg flex items-center justify-center text-[#6B5E78]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292431]">Password & Security</h3>
              <p className="text-sm text-[#6B5E78]">Change your password and secure your account</p>
            </div>
          </div>
          <span className="text-[#6B5E78]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E9DFF4] rounded-lg flex items-center justify-center text-[#6B5E78]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292431]">Notification Preferences</h3>
              <p className="text-sm text-[#6B5E78]">Control what alerts you receive</p>
            </div>
          </div>
          <span className="text-[#6B5E78]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E9DFF4] rounded-lg flex items-center justify-center text-[#6B5E78]"><Moon size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292431]">Appearance</h3>
              <p className="text-sm text-[#6B5E78]">Dark mode is currently enabled by default</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button className="text-[#967CC5] font-medium hover:underline text-sm">Delete Account</button>
      </div>
    </div>
  );
};

export default MemberSettings;