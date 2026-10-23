import { Shield, Bell, Moon } from 'lucide-react';

const MemberSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#A1A1AA]">Manage your account preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl overflow-hidden divide-y divide-[#292940]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#17172A] rounded-lg flex items-center justify-center text-[#A1A1AA]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#11111F]">Password & Security</h3>
              <p className="text-sm text-[#A1A1AA]">Change your password and secure your account</p>
            </div>
          </div>
          <span className="text-[#A1A1AA]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#17172A] rounded-lg flex items-center justify-center text-[#A1A1AA]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#11111F]">Notification Preferences</h3>
              <p className="text-sm text-[#A1A1AA]">Control what alerts you receive</p>
            </div>
          </div>
          <span className="text-[#A1A1AA]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#17172A] rounded-lg flex items-center justify-center text-[#A1A1AA]"><Moon size={20} /></div>
            <div>
              <h3 className="font-bold text-[#11111F]">Appearance</h3>
              <p className="text-sm text-[#A1A1AA]">Dark mode is currently enabled by default</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button className="text-[#4F46E5] font-medium hover:underline text-sm">Delete Account</button>
      </div>
    </div>
  );
};

export default MemberSettings;