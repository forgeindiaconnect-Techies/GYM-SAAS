import { Shield, Bell, Clock, Lock } from 'lucide-react';

const TrainerSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#64748B]">Manage your trainer portal preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden divide-y divide-[#E2E8F0]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFF7ED] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-[#64748B]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#111827]">Public Profile Setup</h3>
              <p className="text-sm text-[#64748B]">Manage how you appear to new members</p>
            </div>
          </div>
          <span className="text-[#64748B]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFF7ED] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-[#64748B]"><Clock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#111827]">Booking Preferences</h3>
              <p className="text-sm text-[#64748B]">Set your working hours and session gaps</p>
            </div>
          </div>
          <span className="text-[#64748B]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFF7ED] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-[#64748B]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#111827]">Notification Alerts</h3>
              <p className="text-sm text-[#64748B]">Configure email and push notifications</p>
            </div>
          </div>
          <span className="text-[#64748B]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFF7ED] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center text-[#64748B]"><Lock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#111827]">Security</h3>
              <p className="text-sm text-[#64748B]">Change password and 2FA</p>
            </div>
          </div>
          <span className="text-[#64748B]">→</span>
        </div>
      </div>
    </div>
  );
};

export default TrainerSettings;