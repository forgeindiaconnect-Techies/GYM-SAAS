import { Shield, Bell, Moon } from 'lucide-react';

const MemberSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#64748B]">Manage your account preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden divide-y divide-[#E2E8F0]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFF7ED] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-[#64748B]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#111827]">Password & Security</h3>
              <p className="text-sm text-[#64748B]">Change your password and secure your account</p>
            </div>
          </div>
          <span className="text-[#64748B]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFF7ED] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-[#64748B]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#111827]">Notification Preferences</h3>
              <p className="text-sm text-[#64748B]">Control what alerts you receive</p>
            </div>
          </div>
          <span className="text-[#64748B]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFF7ED] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-[#64748B]"><Moon size={20} /></div>
            <div>
              <h3 className="font-bold text-[#111827]">Appearance</h3>
              <p className="text-sm text-[#64748B]">Dark mode is currently enabled by default</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-4">
        <button className="text-[#9A3412] font-medium hover:underline text-sm">Delete Account</button>
      </div>
    </div>
  );
};

export default MemberSettings;