import { useState, useEffect } from 'react';
import { getDb, addItem, updateItem, deleteItem } from '../../utils/mockDb';
import { Search, UserPlus, Send, Eye, Trash2, Building2, User, Mail, Phone, MapPin, Sparkles, CheckCircle2, Copy } from 'lucide-react';

const SuperAdminLeads = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [inviteForm, setInviteForm] = useState({ message: 'Join AI GYM to revolutionize your management.', expiry: '7 Days' });
  const [newLeadForm, setNewLeadForm] = useState({ gymName: '', owner: '', email: '', phone: '', location: '' });
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    setLeads(getDb('gymLeads'));
  }, []);

  const handleSendInvite = (e: any) => {
    e.preventDefault();
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const link = `https://aigym.com/register/gym?token=${token}`;

    addItem('gymInvitations', {
      gymName: selectedLead.gymName,
      owner: selectedLead.owner,
      email: selectedLead.email,
      date: new Date().toISOString().split('T')[0],
      status: 'Sent',
      expiry: inviteForm.expiry,
      link: link
    });
    const updated = updateItem('gymLeads', selectedLead.id, { status: 'Contacted' });
    setLeads(leads.map(l => l.id === selectedLead.id ? updated : l));
    
    setGeneratedLink(link);
    setInviteSuccess(true);
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setTimeout(() => {
      setInviteSuccess(false);
      setGeneratedLink('');
    }, 300);
  };

  const handleAddLead = (e: any) => {
    e.preventDefault();
    const newLead = addItem('gymLeads', {
      ...newLeadForm,
      status: 'New'
    });
    setLeads([...leads, newLead]);
    setShowAddModal(false);
    setNewLeadForm({ gymName: '', owner: '', email: '', phone: '', location: '' });
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = updateItem('gymLeads', id, { status: newStatus });
    setLeads(leads.map(l => l.id === id ? updated : l));

    // Also update the invitation status to reflect this change
    const lead = leads.find(l => l.id === id) || updated;
    if (lead) {
      const invites = getDb('gymInvitations');
      const relatedInvite = invites.find((i: any) => i.email === lead.email);
      if (relatedInvite) {
        let inviteStatus = newStatus;
        if (newStatus === 'Active') inviteStatus = 'Accepted'; // Or keep it as 'Active' depending on wording
        else if (newStatus === 'Contacted') inviteStatus = 'Sent';
        
        updateItem('gymInvitations', relatedInvite.id, { status: inviteStatus });
      }
    }
  };

  const filtered = leads.filter(l => l.gymName.toLowerCase().includes(search.toLowerCase()) || l.owner.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Gym Leads</h1>
          <p className="text-[#455250] mt-1">Manage prospective gym partners and send invitations.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-[#6fa3a0] text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors">
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
            className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl pl-10 pr-4 py-2 text-[#202828] focus:border-[#6fa3a0] transition-all outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-[#455250]" size={18} />
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#455250]">
          <thead className="bg-[#FFFFFF] border-b border-[#D3DFDA] text-[#202828]">
            <tr>
              <th className="px-6 py-4 font-medium">Gym Name</th>
              <th className="px-6 py-4 font-medium">Owner & Contact</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D3DFDA]">
            {filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-[#F1F5F3] transition-colors">
                <td className="px-6 py-4 font-semibold text-[#202828]">{lead.gymName}</td>
                <td className="px-6 py-4">
                  <div className="text-[#202828]">{lead.owner}</div>
                  <div className="text-xs">{lead.email} | {lead.phone}</div>
                </td>
                <td className="px-6 py-4">{lead.location}</td>
                <td className="px-6 py-4">
                  <select 
                    value={lead.status} 
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className={`px-2 py-1 rounded-xl text-xs font-semibold outline-none cursor-pointer border border-[#D3DFDA] ${
                      lead.status === 'New' ? 'bg-blue-500/10 text-blue-500' : 
                      lead.status === 'Active' ? 'bg-green-500/10 text-green-500' : 
                      lead.status === 'Inactive' ? 'bg-[#6fa3a0]/10 text-[#6fa3a0]' :
                      'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    <option value="New" className="bg-[#FFFFFF] text-blue-500">New</option>
                    <option value="Contacted" className="bg-[#FFFFFF] text-yellow-500">Contacted</option>
                    <option value="Active" className="bg-[#FFFFFF] text-green-500">Active</option>
                    <option value="Inactive" className="bg-[#FFFFFF] text-[#6fa3a0]">Inactive</option>
                  </select>
                </td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => { setSelectedLead(lead); setShowViewModal(true); }} className="text-[#455250] hover:text-[#202828]" title="View"><Eye size={18} /></button>
                  <button onClick={() => { setSelectedLead(lead); setInviteSuccess(false); setShowInviteModal(true); }} className="text-[#6fa3a0] hover:text-teal-400" title="Send Invite"><Send size={18} /></button>
                  <button onClick={() => { deleteItem('gymLeads', lead.id); setLeads(leads.filter(l => l.id !== lead.id)); }} className="text-[#455250] hover:text-[#6fa3a0]" title="Delete"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8">No leads found.</td></tr>}
          </tbody>
        </table>
      </div>

      {showInviteModal && selectedLead && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-teal-500/20 to-transparent p-6 border-b border-[#D3DFDA] flex items-center space-x-3">
              <Send className="text-[#6fa3a0]" size={24} />
              <h2 className="text-xl font-bold text-[#202828]">Send Invitation</h2>
            </div>
            {!inviteSuccess ? (
              <form onSubmit={handleSendInvite} className="p-6 space-y-5">
                <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#D3DFDA] mb-2">
                  <p className="text-sm text-[#455250]">Sending to:</p>
                  <p className="text-[#202828] font-semibold text-lg">{selectedLead.gymName}</p>
                  <p className="text-sm text-[#6fa3a0]">{selectedLead.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#455250] mb-2">Personal Message</label>
                  <textarea rows={3} value={inviteForm.message} onChange={e => setInviteForm({...inviteForm, message: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-4 text-[#202828] outline-none focus:border-[#6fa3a0] transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#455250] mb-2">Link Expiry</label>
                  <select value={inviteForm.expiry} onChange={e => setInviteForm({...inviteForm, expiry: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-4 text-[#202828] outline-none focus:border-[#6fa3a0] transition-colors cursor-pointer appearance-none">
                    <option>3 Days</option>
                    <option>7 Days</option>
                    <option>14 Days</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 mt-8 border-t border-[#D3DFDA] pt-6">
                  <button type="button" onClick={closeInviteModal} className="px-6 py-2 text-[#455250] hover:text-[#164A4A] transition-colors font-medium">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-[#6fa3a0] text-white rounded-xl font-bold hover:bg-teal-600 transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20">
                    <span>Send Invitation</span>
                    <Send size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="text-green-500" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#202828]">Invitation Sent!</h3>
                <p className="text-[#455250]">An email with the registration link has been automatically dispatched to <span className="text-[#202828] font-medium">{selectedLead.email}</span>.</p>
                
                <div className="w-full mt-6 text-left">
                  <label className="block text-sm font-medium text-[#455250] mb-2">Manual Invite Link (Optional)</label>
                  <div className="flex space-x-2">
                    <input readOnly value={generatedLink} className="flex-1 bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-3 text-[#202828] text-sm outline-none" />
                    <button onClick={() => navigator.clipboard.writeText(generatedLink)} className="px-4 py-2 bg-[#E8E5DA] hover:bg-[#333] text-white rounded-xl transition-colors flex items-center space-x-2">
                      <Copy size={16} />
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#455250] mt-2">You can copy this link and send it manually via WhatsApp or SMS if needed.</p>
                </div>

                <div className="w-full mt-6 pt-6 border-t border-[#D3DFDA]">
                  <button onClick={closeInviteModal} className="w-full py-3 bg-[#6fa3a0] hover:bg-teal-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20">Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-teal-500/20 to-transparent p-6 border-b border-[#D3DFDA] flex items-center space-x-3">
              <Sparkles className="text-[#6fa3a0]" size={24} />
              <h2 className="text-xl font-bold text-[#202828]">Add New Gym Lead</h2>
            </div>
            <form onSubmit={handleAddLead} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#455250] mb-1">Gym Name *</label>
                <input required type="text" value={newLeadForm.gymName} onChange={e => setNewLeadForm({...newLeadForm, gymName: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-3 text-[#202828] outline-none focus:border-[#6fa3a0]" />
              </div>
              <div>
                <label className="block text-sm text-[#455250] mb-1">Owner Name *</label>
                <input required type="text" value={newLeadForm.owner} onChange={e => setNewLeadForm({...newLeadForm, owner: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-3 text-[#202828] outline-none focus:border-[#6fa3a0]" />
              </div>
              <div>
                <label className="block text-sm text-[#455250] mb-1">Email *</label>
                <input required type="email" value={newLeadForm.email} onChange={e => setNewLeadForm({...newLeadForm, email: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-3 text-[#202828] outline-none focus:border-[#6fa3a0]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#455250] mb-1">Phone</label>
                  <input type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={newLeadForm.phone} onChange={e => setNewLeadForm({...newLeadForm, phone: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-3 text-[#202828] outline-none focus:border-[#6fa3a0]" />
                </div>
                <div>
                  <label className="block text-sm text-[#455250] mb-1">Location</label>
                  <input type="text" value={newLeadForm.location} onChange={e => setNewLeadForm({...newLeadForm, location: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-3 text-[#202828] outline-none focus:border-[#6fa3a0]" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-[#455250] hover:text-[#202828]">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#6fa3a0] text-white rounded-xl font-bold hover:bg-teal-600">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedLead && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-teal-500/20 to-transparent p-6 border-b border-[#D3DFDA]">
              <h2 className="text-xl font-bold text-[#202828] flex items-center space-x-2">
                <Sparkles className="text-[#6fa3a0]" size={20} />
                <span>Lead Details</span>
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-[#6fa3a0]/10 rounded-xl text-[#6fa3a0] mt-1">
                  <Building2 size={20} />
                </div>
                <div>
                  <label className="text-xs text-[#455250] uppercase tracking-wider font-semibold">Gym Name</label>
                  <p className="text-[#202828] font-bold text-lg leading-tight">{selectedLead.gymName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 mt-1">
                  <User size={20} />
                </div>
                <div>
                  <label className="text-xs text-[#455250] uppercase tracking-wider font-semibold">Owner Name</label>
                  <p className="text-[#202828] font-medium">{selectedLead.owner}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-500 mt-1">
                  <Mail size={20} />
                </div>
                <div>
                  <label className="text-xs text-[#455250] uppercase tracking-wider font-semibold">Email</label>
                  <p className="text-[#202828] font-medium">{selectedLead.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
                    <Phone size={18} />
                  </div>
                  <div>
                    <label className="text-xs text-[#455250] uppercase tracking-wider font-semibold block">Phone</label>
                    <span className="text-[#202828] text-sm">{selectedLead.phone || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <label className="text-xs text-[#455250] uppercase tracking-wider font-semibold block">Location</label>
                    <span className="text-[#202828] text-sm">{selectedLead.location || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[#D3DFDA] flex justify-end bg-[#FFFFFF]">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminLeads;
