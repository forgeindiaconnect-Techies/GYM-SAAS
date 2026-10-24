import { Shield, Bell, Clock, Lock } from 'lucide-react';

const TrainerSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#9AAEAE]">Manage your trainer portal preferences</p>
      </div>

      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl overflow-hidden divide-y divide-[#2A3A3A]">
        <div className="p-6 flex items-center justify-between hover:bg-[#1B2728] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1B2728] rounded-lg flex items-center justify-center text-[#9AAEAE]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#F5FAFA]">Public Profile Setup</h3>
              <p className="text-sm text-[#9AAEAE]">Manage how you appear to new members</p>
            </div>
          </div>
          <span className="text-[#9AAEAE]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#1B2728] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1B2728] rounded-lg flex items-center justify-center text-[#9AAEAE]"><Clock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#F5FAFA]">Booking Preferences</h3>
              <p className="text-sm text-[#9AAEAE]">Set your working hours and session gaps</p>
            </div>
          </div>
          <span className="text-[#9AAEAE]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#1B2728] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1B2728] rounded-lg flex items-center justify-center text-[#9AAEAE]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#F5FAFA]">Notification Alerts</h3>
              <p className="text-sm text-[#9AAEAE]">Configure email and push notifications</p>
            </div>
          </div>
          <span className="text-[#9AAEAE]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#1B2728] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#1B2728] rounded-lg flex items-center justify-center text-[#9AAEAE]"><Lock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#F5FAFA]">Security</h3>
              <p className="text-sm text-[#9AAEAE]">Change password and 2FA</p>
            </div>
          </div>
          <span className="text-[#9AAEAE]">→</span>
        </div>
      </div>
    </div>
  );
};

export default TrainerSettings;