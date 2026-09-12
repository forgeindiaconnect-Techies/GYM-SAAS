import { Settings, Shield, Bell, Moon } from 'lucide-react';

const MemberSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#475569]">Manage your account preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden divide-y divide-[#CCFBF1]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E2E8F0] rounded-lg flex items-center justify-center text-[#475569]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#1E293B]">Password & Security</h3>
              <p className="text-sm text-[#475569]">Change your password and secure your account</p>
            </div>
          </div>
          <span className="text-[#475569]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E2E8F0] rounded-lg flex items-center justify-center text-[#475569]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#1E293B]">Notification Preferences</h3>
              <p className="text-sm text-[#475569]">Control what alerts you receive</p>
            </div>
          </div>
          <span className="text-[#475569]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E2E8F0] rounded-lg flex items-center justify-center text-[#475569]"><Moon size={20} /></div>
            <div>
              <h3 className="font-bold text-[#1E293B]">Appearance</h3>
              <p className="text-sm text-[#475569]">Dark mode is currently enabled by default</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button className="text-[#0D9488] font-medium hover:underline text-sm">Delete Account</button>
      </div>
    </div>
  );
};

export default MemberSettings;