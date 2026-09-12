import { Settings, Shield, Bell, Clock, Lock } from 'lucide-react';

const TrainerSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#475569]">Manage your trainer portal preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden divide-y divide-[#CCFBF1]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E2E8F0] rounded-lg flex items-center justify-center text-[#475569]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#1E293B]">Public Profile Setup</h3>
              <p className="text-sm text-[#475569]">Manage how you appear to new members</p>
            </div>
          </div>
          <span className="text-[#475569]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E2E8F0] rounded-lg flex items-center justify-center text-[#475569]"><Clock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#1E293B]">Booking Preferences</h3>
              <p className="text-sm text-[#475569]">Set your working hours and session gaps</p>
            </div>
          </div>
          <span className="text-[#475569]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E2E8F0] rounded-lg flex items-center justify-center text-[#475569]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#1E293B]">Notification Alerts</h3>
              <p className="text-sm text-[#475569]">Configure email and push notifications</p>
            </div>
          </div>
          <span className="text-[#475569]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E2E8F0] rounded-lg flex items-center justify-center text-[#475569]"><Lock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#1E293B]">Security</h3>
              <p className="text-sm text-[#475569]">Change password and 2FA</p>
            </div>
          </div>
          <span className="text-[#475569]">→</span>
        </div>
      </div>
    </div>
  );
};

export default TrainerSettings;