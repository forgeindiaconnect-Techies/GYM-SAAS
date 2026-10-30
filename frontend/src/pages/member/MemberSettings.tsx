import { Shield, Bell, Moon } from 'lucide-react';

const MemberSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#57534E]">Manage your account preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl overflow-hidden divide-y divide-[#E7DADD]">
        <div className="p-6 flex items-center justify-between hover:bg-[#F3E8E8] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F3E8E8] rounded-lg flex items-center justify-center text-[#57534E]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Password & Security</h3>
              <p className="text-sm text-[#57534E]">Change your password and secure your account</p>
            </div>
          </div>
          <span className="text-[#57534E]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#F3E8E8] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F3E8E8] rounded-lg flex items-center justify-center text-[#57534E]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Notification Preferences</h3>
              <p className="text-sm text-[#57534E]">Control what alerts you receive</p>
            </div>
          </div>
          <span className="text-[#57534E]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#F3E8E8] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F3E8E8] rounded-lg flex items-center justify-center text-[#57534E]"><Moon size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Appearance</h3>
              <p className="text-sm text-[#57534E]">Dark mode is currently enabled by default</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button className="text-[#9F5965] font-medium hover:underline text-sm">Delete Account</button>
      </div>
    </div>
  );
};

export default MemberSettings;