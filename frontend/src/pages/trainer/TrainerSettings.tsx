import { Shield, Bell, Clock, Lock } from 'lucide-react';

const TrainerSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#78716C]">Manage your trainer portal preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden divide-y divide-[#E7E5E4]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FED7AA] rounded-lg flex items-center justify-center text-[#78716C]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Public Profile Setup</h3>
              <p className="text-sm text-[#78716C]">Manage how you appear to new members</p>
            </div>
          </div>
          <span className="text-[#78716C]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FED7AA] rounded-lg flex items-center justify-center text-[#78716C]"><Clock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Booking Preferences</h3>
              <p className="text-sm text-[#78716C]">Set your working hours and session gaps</p>
            </div>
          </div>
          <span className="text-[#78716C]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FED7AA] rounded-lg flex items-center justify-center text-[#78716C]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Notification Alerts</h3>
              <p className="text-sm text-[#78716C]">Configure email and push notifications</p>
            </div>
          </div>
          <span className="text-[#78716C]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FED7AA] rounded-lg flex items-center justify-center text-[#78716C]"><Lock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Security</h3>
              <p className="text-sm text-[#78716C]">Change password and 2FA</p>
            </div>
          </div>
          <span className="text-[#78716C]">→</span>
        </div>
      </div>
    </div>
  );
};

export default TrainerSettings;