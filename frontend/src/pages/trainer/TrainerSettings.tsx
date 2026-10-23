import { Shield, Bell, Clock, Lock } from 'lucide-react';

const TrainerSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#A1A1AA]">Manage your trainer portal preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl overflow-hidden divide-y divide-[#292940]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#17172A] rounded-lg flex items-center justify-center text-[#A1A1AA]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#11111F]">Public Profile Setup</h3>
              <p className="text-sm text-[#A1A1AA]">Manage how you appear to new members</p>
            </div>
          </div>
          <span className="text-[#A1A1AA]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#17172A] rounded-lg flex items-center justify-center text-[#A1A1AA]"><Clock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#11111F]">Booking Preferences</h3>
              <p className="text-sm text-[#A1A1AA]">Set your working hours and session gaps</p>
            </div>
          </div>
          <span className="text-[#A1A1AA]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#17172A] rounded-lg flex items-center justify-center text-[#A1A1AA]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#11111F]">Notification Alerts</h3>
              <p className="text-sm text-[#A1A1AA]">Configure email and push notifications</p>
            </div>
          </div>
          <span className="text-[#A1A1AA]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#17172A] rounded-lg flex items-center justify-center text-[#A1A1AA]"><Lock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#11111F]">Security</h3>
              <p className="text-sm text-[#A1A1AA]">Change password and 2FA</p>
            </div>
          </div>
          <span className="text-[#A1A1AA]">→</span>
        </div>
      </div>
    </div>
  );
};

export default TrainerSettings;