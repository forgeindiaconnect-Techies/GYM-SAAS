import { Shield, Bell, Clock, Lock } from 'lucide-react';

const TrainerSettings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[#57534E]">Manage your trainer portal preferences</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl overflow-hidden divide-y divide-[#E7DADD]">
        <div className="p-6 flex items-center justify-between hover:bg-[#F3E8E8] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F3E8E8] rounded-lg flex items-center justify-center text-[#57534E]"><Shield size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Public Profile Setup</h3>
              <p className="text-sm text-[#57534E]">Manage how you appear to new members</p>
            </div>
          </div>
          <span className="text-[#57534E]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#F3E8E8] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F3E8E8] rounded-lg flex items-center justify-center text-[#57534E]"><Clock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Booking Preferences</h3>
              <p className="text-sm text-[#57534E]">Set your working hours and session gaps</p>
            </div>
          </div>
          <span className="text-[#57534E]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#F3E8E8] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F3E8E8] rounded-lg flex items-center justify-center text-[#57534E]"><Bell size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Notification Alerts</h3>
              <p className="text-sm text-[#57534E]">Configure email and push notifications</p>
            </div>
          </div>
          <span className="text-[#57534E]">→</span>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-[#F3E8E8] cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#F3E8E8] rounded-lg flex items-center justify-center text-[#57534E]"><Lock size={20} /></div>
            <div>
              <h3 className="font-bold text-[#292524]">Security</h3>
              <p className="text-sm text-[#57534E]">Change password and 2FA</p>
            </div>
          </div>
          <span className="text-[#57534E]">→</span>
        </div>
      </div>
    </div>
  );
};

export default TrainerSettings;