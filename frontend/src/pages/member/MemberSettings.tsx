import { Shield, Bell, Moon } from 'lucide-react';

const MemberSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#9AAEAE]">Manage your account preferences</p>
      </div>

      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl overflow-hidden divide-y divide-[#2A3A3A]">
        <div className="p-6 flex items-center justify-between hover:bg-[#1B2728] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1B2728] rounded-lg flex items-center justify-center text-[#9AAEAE]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#F5FAFA]">Password & Security</h3>
              <p className="text-sm text-[#9AAEAE]">Change your password and secure your account</p>
            </div>
          </div>
          <span className="text-[#9AAEAE]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#1B2728] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1B2728] rounded-lg flex items-center justify-center text-[#9AAEAE]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#F5FAFA]">Notification Preferences</h3>
              <p className="text-sm text-[#9AAEAE]">Control what alerts you receive</p>
            </div>
          </div>
          <span className="text-[#9AAEAE]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#1B2728] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1B2728] rounded-lg flex items-center justify-center text-[#9AAEAE]"><Moon size={20} /></div>
            <div>
              <h3 className="font-bold text-[#F5FAFA]">Appearance</h3>
              <p className="text-sm text-[#9AAEAE]">Dark mode is currently enabled by default</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button className="text-[#5EEAD4] font-medium hover:underline text-sm">Delete Account</button>
      </div>
    </div>
  );
};

export default MemberSettings;