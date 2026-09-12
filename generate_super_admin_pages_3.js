const fs = require('fs');
const path = require('path');

const writePage = (page, content) => {
  const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'super-admin', `${page}.tsx`);
  fs.writeFileSync(filePath, content);
  console.log(`Created: ${filePath}`);
};

const invitationsContent = `import { useState, useEffect } from 'react';
import { getDb, updateItem, deleteItem } from '../../../utils/mockDb';
import { Search, Send, Trash2 } from 'lucide-react';

const SuperAdminInvitations = () => {
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    setInvites(getDb('gymInvitations'));
  }, []);

  const handleResend = (invite) => {
    alert(\`Invitation resent to \${invite.email}!\`);
    // update status to Pending to refresh the timer logically
    const updated = updateItem('gymInvitations', invite.id, { status: 'Pending', date: new Date().toISOString().split('T')[0] });
    setInvites(invites.map(i => i.id === invite.id ? updated : i));
  };

  const handleCancel = (invite) => {
    deleteItem('gymInvitations', invite.id);
    setInvites(invites.filter(i => i.id !== invite.id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gym Invitations</h1>
        <p className="text-[#A1A1AA] mt-1">Track and manage invitations sent to potential gym partners.</p>
      </div>

      <div className="bg-[#101010] border border-[#272727] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#A1A1AA]">
          <thead className="bg-[#151515] border-b border-[#272727] text-white">
            <tr>
              <th className="px-6 py-4 font-medium">Gym Name</th>
              <th className="px-6 py-4 font-medium">Recipient</th>
              <th className="px-6 py-4 font-medium">Invite Date</th>
              <th className="px-6 py-4 font-medium">Expiry</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272727]">
            {invites.map(invite => (
              <tr key={invite.id} className="hover:bg-[#151515]/50">
                <td className="px-6 py-4 font-semibold text-white">{invite.gymName}</td>
                <td className="px-6 py-4">
                  <div className="text-white">{invite.owner}</div>
                  <div className="text-xs">{invite.email}</div>
                </td>
                <td className="px-6 py-4">{invite.date}</td>
                <td className="px-6 py-4">{invite.expiry}</td>
                <td className="px-6 py-4">
                  <span className={\`px-2 py-1 rounded-full text-xs font-semibold \${invite.status === 'Accepted' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}\`}>{invite.status}</span>
                </td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => handleResend(invite)} className="text-blue-500 hover:text-blue-400 flex items-center gap-1" title="Resend"><Send size={16}/></button>
                  <button onClick={() => handleCancel(invite)} className="text-red-500 hover:text-red-400 flex items-center gap-1" title="Cancel"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {invites.length === 0 && <tr><td colSpan={6} className="text-center py-8">No invitations sent yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminInvitations;`;

const profileContent = `import { useState } from 'react';
import { Save, User } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const SuperAdminProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.mobile || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  const inputCls = "w-full bg-[#151515] border border-[#272727] rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition-colors";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Super Admin Profile</h1>
        <p className="text-[#A1A1AA] mt-1">Manage your administrative account details.</p>
      </div>

      <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6 md:p-8 flex items-center space-x-6">
        <div className="w-24 h-24 bg-[#151515] border-2 border-red-500 rounded-full flex items-center justify-center text-red-500 text-3xl font-bold relative overflow-hidden group">
          <span>{form.firstName?.[0] || 'S'}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{form.firstName} {form.lastName}</h2>
          <p className="text-red-500 font-semibold">{user?.role || 'SUPER ADMIN'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#101010] border border-[#272727] rounded-2xl p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-bold text-white mb-4 border-b border-[#272727] pb-2">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">First Name</label>
            <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Last Name</label>
            <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Email Address</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Phone Number</label>
            <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputCls} />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 flex items-center gap-2">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminProfile;`;

const settingsContent = `import { useState } from 'react';
import { Save, Bell, Shield, Settings as SettingsIcon } from 'lucide-react';

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState({
    emailNotif: true,
    newAppAlerts: true,
    autoApproveLeads: false,
    twoFactor: true
  });

  const toggle = (field) => setSettings({ ...settings, [field]: !settings[field] });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  const ToggleBtn = ({ label, desc, active, onClick }) => (
    <div className="flex items-center justify-between p-4 bg-[#151515] border border-[#272727] rounded-xl">
      <div>
        <p className="text-white font-semibold">{label}</p>
        <p className="text-[#A1A1AA] text-sm">{desc}</p>
      </div>
      <button 
        type="button" 
        onClick={onClick} 
        className={\`w-12 h-6 rounded-full p-1 transition-colors \${active ? 'bg-red-500' : 'bg-[#272727]'}\`}
      >
        <div className={\`w-4 h-4 bg-white rounded-full transition-transform \${active ? 'translate-x-6' : 'translate-x-0'}\`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-[#A1A1AA] mt-1">Configure global preferences and notifications.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Notifications */}
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-white mb-6 border-b border-[#272727] pb-2">
            <Bell size={20} className="text-red-500"/>
            <h2 className="text-xl font-bold">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            <ToggleBtn label="Email Notifications" desc="Receive daily summary emails" active={settings.emailNotif} onClick={() => toggle('emailNotif')} />
            <ToggleBtn label="New Application Alerts" desc="Instant alert when a gym applies" active={settings.newAppAlerts} onClick={() => toggle('newAppAlerts')} />
          </div>
        </div>

        {/* Security & Workflow */}
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 text-white mb-6 border-b border-[#272727] pb-2">
            <Shield size={20} className="text-red-500"/>
            <h2 className="text-xl font-bold">Security & Onboarding Workflow</h2>
          </div>
          <div className="space-y-4">
            <ToggleBtn label="Two-Factor Authentication (2FA)" desc="Require 2FA for root access" active={settings.twoFactor} onClick={() => toggle('twoFactor')} />
            <ToggleBtn label="Auto-Approve Internal Leads" desc="Skip approval queue for converted internal leads" active={settings.autoApproveLeads} onClick={() => toggle('autoApproveLeads')} />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-8 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 flex items-center gap-2 shadow-lg shadow-red-500/20">
            <Save size={18} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminSettings;`;

writePage('SuperAdminInvitations', invitationsContent);
writePage('SuperAdminProfile', profileContent);
writePage('SuperAdminSettings', settingsContent);
console.log('Script 3 complete.');
