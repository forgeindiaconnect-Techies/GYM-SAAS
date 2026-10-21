import { Shield, Bell, Clock, Lock } from 'lucide-react';

const TrainerSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#6B5E78]">Manage your trainer portal preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl overflow-hidden divide-y divide-[#E5DDEB]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E9DFF4] rounded-lg flex items-center justify-center text-[#6B5E78]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292431]">Public Profile Setup</h3>
              <p className="text-sm text-[#6B5E78]">Manage how you appear to new members</p>
            </div>
          </div>
          <span className="text-[#6B5E78]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E9DFF4] rounded-lg flex items-center justify-center text-[#6B5E78]"><Clock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292431]">Booking Preferences</h3>
              <p className="text-sm text-[#6B5E78]">Set your working hours and session gaps</p>
            </div>
          </div>
          <span className="text-[#6B5E78]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E9DFF4] rounded-lg flex items-center justify-center text-[#6B5E78]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292431]">Notification Alerts</h3>
              <p className="text-sm text-[#6B5E78]">Configure email and push notifications</p>
            </div>
          </div>
          <span className="text-[#6B5E78]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E9DFF4] rounded-lg flex items-center justify-center text-[#6B5E78]"><Lock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292431]">Security</h3>
              <p className="text-sm text-[#6B5E78]">Change password and 2FA</p>
            </div>
          </div>
          <span className="text-[#6B5E78]">→</span>
        </div>
      </div>
    </div>
  );
};

export default TrainerSettings;