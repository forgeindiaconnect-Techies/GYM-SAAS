const fs = require('fs');
const path = require('path');

const writePage = (page, content) => {
  const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'super-admin', `${page}.tsx`);
  fs.writeFileSync(filePath, content);
  console.log(`Created: ${filePath}`);
};

const dashboardContent = `import { useState, useEffect } from 'react';
import { getDb } from '../../../utils/mockDb';
import { Building2, FileText, UserPlus, Send, XCircle, ArrowRight, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ gyms: 0, pending: 0, leads: 0, invites: 0, rejected: 0 });

  useEffect(() => {
    setStats({
      gyms: getDb('gyms').length,
      pending: getDb('gymApplications').filter(a => a.status === 'Pending').length,
      leads: getDb('gymLeads').length,
      invites: getDb('gymInvitations').length,
      rejected: getDb('gymApplications').filter(a => a.status === 'Rejected').length
    });
  }, []);

  const cards = [
    { title: 'Total / Active Gyms', value: stats.gyms, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Pending Applications', value: stats.pending, icon: FileText, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { title: 'New Gym Leads', value: stats.leads, icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Pending Invitations', value: stats.invites, icon: Send, color: 'text-purple-500', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Super Admin Dashboard</h1>
        <p className="text-[#A1A1AA] mt-1">Platform overview and gym onboarding metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#101010] border border-[#272727] rounded-2xl p-6 flex items-center space-x-4">
            <div className={\`w-14 h-14 rounded-full flex items-center justify-center \${c.bg} \${c.color}\`}>
              <c.icon size={28} />
            </div>
            <div>
              <p className="text-[#A1A1AA] text-sm font-medium">{c.title}</p>
              <h3 className="text-2xl font-bold text-white">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-[#272727] pb-4">Onboarding Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/super-admin/gyms/add" className="flex flex-col items-center justify-center p-6 bg-[#151515] border border-[#272727] rounded-xl hover:border-red-500 hover:bg-red-500/5 transition-all text-center">
              <Building2 size={32} className="text-red-500 mb-3" />
              <span className="font-semibold text-white">Add Gym Manually</span>
            </Link>
            <Link to="/super-admin/leads" className="flex flex-col items-center justify-center p-6 bg-[#151515] border border-[#272727] rounded-xl hover:border-red-500 hover:bg-red-500/5 transition-all text-center">
              <UserPlus size={32} className="text-red-500 mb-3" />
              <span className="font-semibold text-white">Manage Leads</span>
            </Link>
            <Link to="/super-admin/pending" className="flex flex-col items-center justify-center p-6 bg-[#151515] border border-[#272727] rounded-xl hover:border-red-500 hover:bg-red-500/5 transition-all text-center">
              <FileText size={32} className="text-red-500 mb-3" />
              <span className="font-semibold text-white">Review Approvals</span>
            </Link>
            <Link to="/super-admin/invitations" className="flex flex-col items-center justify-center p-6 bg-[#151515] border border-[#272727] rounded-xl hover:border-red-500 hover:bg-red-500/5 transition-all text-center">
              <Send size={32} className="text-red-500 mb-3" />
              <span className="font-semibold text-white">View Invitations</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-[#272727] pb-4">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <Link to="/super-admin/applications" className="text-sm text-red-500 font-medium hover:underline flex items-center">View All <ArrowRight size={14} className="ml-1"/></Link>
          </div>
          <div className="flex-1 space-y-4 text-center flex flex-col items-center justify-center text-[#A1A1AA]">
            <BarChart size={48} className="mb-4 opacity-50" />
            <p>Activity logs will appear here once gyms start onboarding.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;`;

const leadsContent = `import { useState, useEffect } from 'react';
import { getDb, addItem, updateItem, deleteItem } from '../../../utils/mockDb';
import { Search, UserPlus, Send, Eye, Trash2, Edit } from 'lucide-react';

const SuperAdminLeads = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [inviteForm, setInviteForm] = useState({ message: 'Join AI GYM to revolutionize your management.', expiry: '7 Days' });

  useEffect(() => {
    setLeads(getDb('gymLeads'));
  }, []);

  const handleSendInvite = (e) => {
    e.preventDefault();
    addItem('gymInvitations', {
      gymName: selectedLead.gymName,
      owner: selectedLead.owner,
      email: selectedLead.email,
      date: new Date().toISOString().split('T')[0],
      status: 'Sent',
      expiry: inviteForm.expiry
    });
    const updated = updateItem('gymLeads', selectedLead.id, { status: 'Contacted' });
    setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
    setShowInviteModal(false);
  };

  const filtered = leads.filter(l => l.gymName.toLowerCase().includes(search.toLowerCase()) || l.owner.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gym Leads</h1>
          <p className="text-[#A1A1AA] mt-1">Manage prospective gym partners and send invitations.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors">
          <UserPlus size={20} />
          <span>Add Lead</span>
        </button>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#101010] border border-[#272727] rounded-xl pl-10 pr-4 py-2 text-white focus:border-red-500 transition-all outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-[#A1A1AA]" size={18} />
        </div>
      </div>

      <div className="bg-[#101010] border border-[#272727] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#A1A1AA]">
          <thead className="bg-[#151515] border-b border-[#272727] text-white">
            <tr>
              <th className="px-6 py-4 font-medium">Gym Name</th>
              <th className="px-6 py-4 font-medium">Owner & Contact</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272727]">
            {filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-[#151515]/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-white">{lead.gymName}</td>
                <td className="px-6 py-4">
                  <div className="text-white">{lead.owner}</div>
                  <div className="text-xs">{lead.email} | {lead.phone}</div>
                </td>
                <td className="px-6 py-4">{lead.location}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500">{lead.status}</span>
                </td>
                <td className="px-6 py-4 flex space-x-3">
                  <button className="text-[#A1A1AA] hover:text-white" title="View"><Eye size={18} /></button>
                  <button onClick={() => { setSelectedLead(lead); setShowInviteModal(true); }} className="text-red-500 hover:text-red-400" title="Send Invite"><Send size={18} /></button>
                  <button onClick={() => { deleteItem('gymLeads', lead.id); setLeads(leads.filter(l => l.id !== lead.id)); }} className="text-[#A1A1AA] hover:text-red-500" title="Delete"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8">No leads found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showInviteModal && selectedLead && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#101010] border border-[#272727] rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Send Invitation to {selectedLead.gymName}</h2>
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-1">Personal Message</label>
                <textarea rows={3} value={inviteForm.message} onChange={e => setInviteForm({...inviteForm, message: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-xl p-3 text-white outline-none focus:border-red-500" />
              </div>
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-1">Expiry</label>
                <select value={inviteForm.expiry} onChange={e => setInviteForm({...inviteForm, expiry: e.target.value})} className="w-full bg-[#151515] border border-[#272727] rounded-xl p-3 text-white outline-none focus:border-red-500">
                  <option>3 Days</option>
                  <option>7 Days</option>
                  <option>14 Days</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-[#A1A1AA] hover:text-white">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLeads;`;

const addGymContent = `import { useState } from 'react';
import { addItem } from '../../../utils/mockDb';
import { Save, PlusCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperAdminAddGym = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    gymName: '', type: 'Commercial', regNum: '', desc: '',
    ownerName: '', phone: '', email: '',
    address: '', city: '', state: '', pincode: '',
    trainers: '', capacity: '', plan: 'Pro', adminName: '', adminEmail: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addItem('gyms', {
      gymName: form.gymName,
      owner: form.ownerName,
      location: form.city + ', ' + form.state,
      admin: form.adminName,
      trainersCount: form.trainers || 0,
      membersCapacity: form.capacity || 0,
      status: 'Active',
      onboardedDate: new Date().toISOString().split('T')[0]
    });
    alert('Gym Successfully Onboarded!');
    navigate('/super-admin/approved');
  };

  const inputCls = "w-full bg-[#151515] border border-[#272727] rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition-colors";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Add Gym Manually</h1>
        <p className="text-[#A1A1AA] mt-1">Complete the onboarding form to register a new gym on the platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#101010] border border-[#272727] rounded-2xl p-6 md:p-8 space-y-8">
        
        {/* Gym Info */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 border-b border-[#272727] pb-2">1. Gym Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1">Gym Name *</label>
              <input required value={form.gymName} onChange={e => setForm({...form, gymName: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1">Gym Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className={inputCls}>
                <option>Commercial</option><option>Boutique</option><option>CrossFit</option>
              </select>
            </div>
          </div>
        </section>

        {/* Owner Info */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 border-b border-[#272727] pb-2">2. Owner Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1">Owner Name *</label>
              <input required value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1">Phone *</label>
              <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Location & Details */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 border-b border-[#272727] pb-2">3. Location & Capacity</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1">City *</label>
              <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1">State *</label>
              <input required value={form.state} onChange={e => setForm({...form, state: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1">Max Capacity</label>
              <input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Admin Account */}
        <section>
          <h2 className="text-xl font-bold text-white mb-4 border-b border-[#272727] pb-2">4. Gym Admin Account</h2>
          <p className="text-sm text-[#A1A1AA] mb-4">This account will be used to log into the Gym Admin portal.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1">Admin Name *</label>
              <input required value={form.adminName} onChange={e => setForm({...form, adminName: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1">Admin Email *</label>
              <input type="email" required value={form.adminEmail} onChange={e => setForm({...form, adminEmail: e.target.value})} className={inputCls} />
            </div>
          </div>
        </section>

        <div className="flex justify-end space-x-4 pt-6 border-t border-[#272727]">
          <button type="button" onClick={() => navigate('/super-admin/dashboard')} className="px-6 py-3 border border-[#272727] text-white rounded-xl font-bold hover:bg-[#151515] flex items-center gap-2">
            <XCircle size={18} /> Cancel
          </button>
          <button type="submit" className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 flex items-center gap-2">
            <PlusCircle size={18} /> Create & Activate Gym
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperAdminAddGym;`;

writePage('SuperAdminDashboard', dashboardContent);
writePage('SuperAdminLeads', leadsContent);
writePage('SuperAdminAddGym', addGymContent);
console.log('Script 1 complete.');
