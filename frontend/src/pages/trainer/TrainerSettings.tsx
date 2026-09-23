import { Settings, Shield, Bell, Clock, Lock } from 'lucide-react';

const TrainerSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#4A514D]">Manage your trainer portal preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden divide-y divide-[#DCD9CD]">
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E8E5DA] rounded-lg flex items-center justify-center text-[#4A514D]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#202522]">Public Profile Setup</h3>
              <p className="text-sm text-[#4A514D]">Manage how you appear to new members</p>
            </div>
          </div>
          <span className="text-[#4A514D]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E8E5DA] rounded-lg flex items-center justify-center text-[#4A514D]"><Clock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#202522]">Booking Preferences</h3>
              <p className="text-sm text-[#4A514D]">Set your working hours and session gaps</p>
            </div>
          </div>
          <span className="text-[#4A514D]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E8E5DA] rounded-lg flex items-center justify-center text-[#4A514D]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#202522]">Notification Alerts</h3>
              <p className="text-sm text-[#4A514D]">Configure email and push notifications</p>
            </div>
          </div>
          <span className="text-[#4A514D]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#FFFFFF] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E8E5DA] rounded-lg flex items-center justify-center text-[#4A514D]"><Lock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#202522]">Security</h3>
              <p className="text-sm text-[#4A514D]">Change password and 2FA</p>
            </div>
          </div>
          <span className="text-[#4A514D]">→</span>
        </div>
      </div>
    </div>
  );
};

export default TrainerSettings;