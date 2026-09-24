import { useState } from 'react';
import { Bell, CreditCard, Shield, Globe, Smartphone, Mail, Database, Save } from 'lucide-react';

const GymAdminSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifs: true,
    smsNotifs: false,
    marketingEmails: true,
    twoFactorAuth: false,
    publicProfile: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">System Settings</h1>
        <p className="text-[#455250] mt-1">Configure your gym's system preferences, billing, and integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Settings Menu */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-[#164A4A]/10 text-[#164A4A] font-bold rounded-xl border border-[#164A4A]/20 transition-colors text-left border-l-4 border-l-[#164A4A]">
            <Bell size={18} /> <span>Notifications</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-[#FFFFFF] text-[#455250] hover:text-[#202828] hover:bg-[#FFFFFF] font-semibold rounded-xl border border-transparent transition-colors text-left">
            <CreditCard size={18} /> <span>Billing & Subscription</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-[#FFFFFF] text-[#455250] hover:text-[#202828] hover:bg-[#FFFFFF] font-semibold rounded-xl border border-transparent transition-colors text-left">
            <Shield size={18} /> <span>Security & Privacy</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-[#FFFFFF] text-[#455250] hover:text-[#202828] hover:bg-[#FFFFFF] font-semibold rounded-xl border border-transparent transition-colors text-left">
            <Globe size={18} /> <span>Integrations & API</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-[#FFFFFF] text-[#455250] hover:text-[#202828] hover:bg-[#FFFFFF] font-semibold rounded-xl border border-transparent transition-colors text-left">
            <Database size={18} /> <span>Data Backup</span>
          </button>
        </div>

        {/* Right Col - Settings Content */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-[#202828] mb-6 border-b border-[#D3DFDA] pb-4">Notification Preferences</h2>
          
          <div className="space-y-6">
            
            {/* Toggle Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[#FFFFFF] border border-[#D3DFDA] rounded-lg shrink-0 mt-0.5">
                  <Mail size={20} className="text-[#164A4A]" />
                </div>
                <div>
                  <h4 className="text-[#202828] font-semibold">Email Notifications</h4>
                  <p className="text-[#455250] text-sm mt-1">Receive daily summaries and critical alerts via email.</p>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('emailNotifs')}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.emailNotifs ? 'bg-[#164A4A]' : 'bg-[#E8E5DA]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.emailNotifs ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>

            {/* Toggle Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[#FFFFFF] border border-[#D3DFDA] rounded-lg shrink-0 mt-0.5">
                  <Smartphone size={20} className="text-[#164A4A]" />
                </div>
                <div>
                  <h4 className="text-[#202828] font-semibold">SMS Alerts</h4>
                  <p className="text-[#455250] text-sm mt-1">Get instant SMS text messages for booking cancellations.</p>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('smsNotifs')}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.smsNotifs ? 'bg-[#164A4A]' : 'bg-[#E8E5DA]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.smsNotifs ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>

            {/* Toggle Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[#FFFFFF] border border-[#D3DFDA] rounded-lg shrink-0 mt-0.5">
                  <Globe size={20} className="text-[#164A4A]" />
                </div>
                <div>
                  <h4 className="text-[#202828] font-semibold">Marketing Emails</h4>
                  <p className="text-[#455250] text-sm mt-1">Receive AI GYM platform updates, tips, and promotional offers.</p>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('marketingEmails')}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.marketingEmails ? 'bg-[#164A4A]' : 'bg-[#E8E5DA]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${settings.marketingEmails ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t border-[#D3DFDA] flex justify-end">
            <button className="px-6 py-3 bg-[#164A4A] text-[#202828] font-bold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center gap-2 shadow-lg shadow-[#164A4A]/20">
              <Save size={18} /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminSettings;
