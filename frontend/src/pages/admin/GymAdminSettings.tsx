import { useState } from 'react';
import { Bell, CreditCard, Shield, Globe, Smartphone, Mail, Database, Save, PenTool } from 'lucide-react';
import DigitalSignatureSection from '../../components/admin/DigitalSignatureSection';

type SettingsTab = 'notifications' | 'signature' | 'billing' | 'security' | 'integrations' | 'backup';

const GymAdminSettings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('signature');
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

  const menuClass = (tab: SettingsTab) =>
    activeTab === tab
      ? 'w-full flex items-center space-x-3 px-4 py-3 bg-[#FFF7ED] text-[#EA580C] font-bold rounded-xl border border-[#FFEDD5] transition-colors text-left border-l-4 border-l-[#F97316] cursor-pointer'
      : 'w-full flex items-center space-x-3 px-4 py-3 bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED]/50 font-semibold rounded-xl border border-transparent transition-colors text-left cursor-pointer';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#111827] tracking-tight">System Settings</h1>
        <p className="text-[#64748B] mt-1">Configure your gym's digital signature, system preferences, billing, and integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Settings Menu */}
        <div className="lg:col-span-1 space-y-2">
          <button onClick={() => setActiveTab('signature')} className={menuClass('signature')}>
            <PenTool size={18} /> <span>Digital Signature</span>
          </button>
          <button onClick={() => setActiveTab('notifications')} className={menuClass('notifications')}>
            <Bell size={18} /> <span>Notifications</span>
          </button>
          <button onClick={() => setActiveTab('billing')} className={menuClass('billing')}>
            <CreditCard size={18} /> <span>Billing & Subscription</span>
          </button>
          <button onClick={() => setActiveTab('security')} className={menuClass('security')}>
            <Shield size={18} /> <span>Security & Privacy</span>
          </button>
          <button onClick={() => setActiveTab('integrations')} className={menuClass('integrations')}>
            <Globe size={18} /> <span>Integrations & API</span>
          </button>
          <button onClick={() => setActiveTab('backup')} className={menuClass('backup')}>
            <Database size={18} /> <span>Data Backup</span>
          </button>
        </div>

        {/* Right Col - Settings Content */}
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 md:p-8">
          {activeTab === 'signature' ? (
            <DigitalSignatureSection />
          ) : activeTab === 'notifications' ? (
            <>
              <h2 className="text-xl font-bold text-[#111827] mb-6 border-b border-[#E2E8F0] pb-4">Notification Preferences</h2>
          
          <div className="space-y-6">
            
            {/* Toggle Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shrink-0 mt-0.5">
                  <Mail size={20} className="text-[#EA580C]" />
                </div>
                <div>
                  <h4 className="text-[#111827] font-semibold">Email Notifications</h4>
                  <p className="text-[#64748B] text-sm mt-1">Receive daily summaries and critical alerts via email.</p>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('emailNotifs')}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.emailNotifs ? 'bg-[#C2410C]' : 'bg-[#F8FAFC]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-[#FFFFFF] absolute top-1 transition-transform ${settings.emailNotifs ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>

            {/* Toggle Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shrink-0 mt-0.5">
                  <Smartphone size={20} className="text-[#EA580C]" />
                </div>
                <div>
                  <h4 className="text-[#111827] font-semibold">SMS Alerts</h4>
                  <p className="text-[#64748B] text-sm mt-1">Get instant SMS text messages for booking cancellations.</p>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('smsNotifs')}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.smsNotifs ? 'bg-[#C2410C]' : 'bg-[#F8FAFC]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-[#FFFFFF] absolute top-1 transition-transform ${settings.smsNotifs ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>

            {/* Toggle Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg shrink-0 mt-0.5">
                  <Globe size={20} className="text-[#EA580C]" />
                </div>
                <div>
                  <h4 className="text-[#111827] font-semibold">Marketing Emails</h4>
                  <p className="text-[#64748B] text-sm mt-1">Receive Gymora platform updates, tips, and promotional offers.</p>
                </div>
              </div>
              <button 
                onClick={() => toggleSetting('marketingEmails')}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.marketingEmails ? 'bg-[#C2410C]' : 'bg-[#F8FAFC]'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-[#FFFFFF] absolute top-1 transition-transform ${settings.marketingEmails ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex justify-end">
            <button className="px-6 py-3 bg-[#C2410C] text-white font-bold rounded-xl hover:bg-[#9A3412] transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/15">
              <Save size={18} /> Save Preferences
            </button>
          </div>
            </>
          ) : (
            <div className="py-12 text-center space-y-2">
              <p className="text-base font-bold text-[#111827] capitalize">{activeTab} Settings</p>
              <p className="text-sm text-[#64748B]">Manage your {activeTab} preferences from your gym dashboard modules.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymAdminSettings;
