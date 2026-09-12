import { useState, useEffect } from 'react';
import { Save, Bell, Shield, Settings as SettingsIcon } from 'lucide-react';

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState({
    emailNotif: true,
    newAppAlerts: true,
    autoApproveLeads: false,
    twoFactor: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('superAdminSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing settings", e);
      }
    }
  }, []);

  const toggle = (field: string) => setSettings({ ...settings, [field]: !settings[field as keyof typeof settings] });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    localStorage.setItem('superAdminSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const ToggleBtn = ({ label, desc, active, onClick }) => (
    <div className="flex items-center justify-between p-4 bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl">
      <div>
        <p className="text-[#1E293B] font-semibold">{label}</p>
        <p className="text-[#475569] text-sm">{desc}</p>
      </div>
      <button 
        type="button" 
        onClick={onClick} 
        className={`w-12 h-6 rounded-full p-1 transition-colors ${active ? 'bg-[#0D9488]' : 'bg-[#E2E8F0]'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">System Settings</h1>
        <p className="text-[#475569] mt-1">Configure global preferences and notifications.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Notifications */}
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-[#1E293B] mb-6 border-b border-[#CCFBF1] pb-2">
            <Bell size={20} className="text-[#0D9488]"/>
            <h2 className="text-xl font-bold">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            <ToggleBtn label="Email Notifications" desc="Receive daily summary emails" active={settings.emailNotif} onClick={() => toggle('emailNotif')} />
            <ToggleBtn label="New Application Alerts" desc="Instant alert when a gym applies" active={settings.newAppAlerts} onClick={() => toggle('newAppAlerts')} />
          </div>
        </div>

        {/* Security & Workflow */}
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-[#1E293B] mb-6 border-b border-[#CCFBF1] pb-2">
            <Shield size={20} className="text-[#0D9488]"/>
            <h2 className="text-xl font-bold">Security & Onboarding Workflow</h2>
          </div>
          <div className="space-y-4">
            <ToggleBtn label="Two-Factor Authentication (2FA)" desc="Require 2FA for root access" active={settings.twoFactor} onClick={() => toggle('twoFactor')} />
            <ToggleBtn label="Auto-Approve Internal Leads" desc="Skip approval queue for converted internal leads" active={settings.autoApproveLeads} onClick={() => toggle('autoApproveLeads')} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-8 py-3 bg-[#0D9488] text-[#1E293B] font-bold rounded-xl hover:bg-teal-600 flex items-center gap-2 shadow-lg shadow-amber-500/20">
            <Save size={18} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminSettings;
