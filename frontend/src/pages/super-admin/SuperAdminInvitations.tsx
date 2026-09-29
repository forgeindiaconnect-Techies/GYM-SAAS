import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDb, updateItem, deleteItem, addItem } from '../../utils/mockDb';
import {
  Search, Send, Trash2, Eye, Building2, User, Mail, Phone,
  Calendar, Clock, Copy, Check, ExternalLink, X, PlusCircle,
  ChevronDown, CheckCircle2, AlertCircle, Clock4
} from 'lucide-react';

const SuperAdminInvitations = () => {
  const navigate = useNavigate();
  const [invites, setInvites] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewInvite, setViewInvite] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let current = getDb('gymInvitations');
    const existingStatuses = new Set(current.map((i: any) => i.status));
    let hasAdded = false;

    if (!existingStatuses.has('Sent')) {
      addItem('gymInvitations', {
        gymName: 'IronPulse Fitness Club',
        type: 'Strength & Conditioning',
        owner: 'Rohan Sharma',
        email: 'rohan.sharma@ironpulse.com',
        phone: '9840123456',
        date: '2026-09-27',
        status: 'Sent',
        expiry: '3 Days'
      });
      hasAdded = true;
    }
    if (!existingStatuses.has('Accepted')) {
      addItem('gymInvitations', {
        gymName: 'FitZone Elite Arena',
        type: 'CrossFit & Functional',
        owner: 'Priya Patel',
        email: 'priya.patel@fitzone.com',
        phone: '9820556789',
        date: '2026-09-25',
        status: 'Accepted',
        expiry: '7 Days'
      });
      hasAdded = true;
    }
    if (!existingStatuses.has('Expired')) {
      addItem('gymInvitations', {
        gymName: 'Metro Gym & Wellness',
        type: 'Cardio & Strength',
        owner: 'Vikram Singh',
        email: 'vikram.singh@metrogym.com',
        phone: '9811223344',
        date: '2026-09-20',
        status: 'Expired',
        expiry: 'Expired'
      });
      hasAdded = true;
    }

    if (hasAdded) {
      current = getDb('gymInvitations');
    }
    setInvites(current);
  }, []);

  const formatDate = (dateInput?: string | Date | null): string => {
    if (!dateInput || dateInput === 'N/A') return 'N/A';
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, monthNum, day] = dateInput.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[parseInt(monthNum, 10) - 1] || monthNum;
      return `${day} ${month} ${year}`;
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getStatusBadgeClass = (status?: string) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'sent':
        return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100';
      case 'expired':
        return 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
    }
  };

  const handleStatusChange = (inviteId: string, newStatus: string) => {
    const updated = updateItem('gymInvitations', inviteId, { status: newStatus });
    setInvites(prev => prev.map(i => i.id === inviteId ? updated : i));
    if (viewInvite?.id === inviteId) {
      setViewInvite(updated);
    }
  };

  const handleResend = (invite: any) => {
    const updated = updateItem('gymInvitations', invite.id, {
      status: 'Sent',
      date: new Date().toISOString().split('T')[0]
    });
    setInvites(invites.map(i => i.id === invite.id ? updated : i));
    if (viewInvite?.id === invite.id) {
      setViewInvite(updated);
    }
    alert(`Invitation resent to ${invite.email}! Status updated to "Sent".`);
  };

  const handleCancel = (invite: any) => {
    if (confirm(`Are you sure you want to cancel the invitation for ${invite.gymName}?`)) {
      import('../../utils/mockDb').then(({ addItem }) => {
        addItem('deletedGymInvitations', { ...invite, deletedAt: new Date().toISOString() });
      });
      deleteItem('gymInvitations', invite.id);
      setInvites(invites.filter(i => i.id !== invite.id));
      if (viewInvite?.id === invite.id) {
        setViewInvite(null);
      }
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredInvites = invites.filter(invite => {
    const query = searchQuery.toLowerCase();
    const matchQuery =
      (invite.gymName || '').toLowerCase().includes(query) ||
      (invite.owner || '').toLowerCase().includes(query) ||
      (invite.email || '').toLowerCase().includes(query);
    const matchStatus =
      statusFilter === 'ALL' ||
      (invite.status || 'Pending').toLowerCase() === statusFilter.toLowerCase();
    return matchQuery && matchStatus;
  });

  const pendingCount = invites.filter(i => (i.status || 'Pending').toLowerCase() === 'pending').length;
  const sentCount = invites.filter(i => (i.status || '').toLowerCase() === 'sent').length;
  const acceptedCount = invites.filter(i => (i.status || '').toLowerCase() === 'accepted').length;
  const expiredCount = invites.filter(i => (i.status || '').toLowerCase() === 'expired').length;

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Gym Invitations</h1>
          <p className="text-[#455250] mt-1">Track and manage invitations sent to potential gym partners.</p>
        </div>
        <button
          onClick={() => navigate('/super-admin/gyms/add')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#164A4A] text-white rounded-xl font-bold text-sm hover:bg-[#164A4A]/90 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>Send New Invitation</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'ALL'
                ? 'bg-[#164A4A] text-white border-[#164A4A] shadow-sm'
                : 'bg-white text-[#455250] border-[#D3DFDA] hover:bg-slate-50'
            }`}
          >
            All Statuses ({invites.length})
          </button>
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              statusFilter === 'Pending'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50/60 text-amber-700 border-amber-200/80 hover:bg-amber-100/60'
            }`}
          >
            <Clock4 size={12} />
            <span>Pending ({pendingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Sent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              statusFilter === 'Sent'
                ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                : 'bg-sky-50/60 text-sky-700 border-sky-200/80 hover:bg-sky-100/60'
            }`}
          >
            <Send size={12} />
            <span>Sent ({sentCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Accepted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              statusFilter === 'Accepted'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-emerald-50/60 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/60'
            }`}
          >
            <CheckCircle2 size={12} />
            <span>Accepted ({acceptedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Expired')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              statusFilter === 'Expired'
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                : 'bg-rose-50/60 text-rose-700 border-rose-200/80 hover:bg-rose-100/60'
            }`}
          >
            <AlertCircle size={12} />
            <span>Expired ({expiredCount})</span>
          </button>
        </div>

        {/* Search and Dropdown Bar */}
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by gym name, owner, or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#F1F5F3] border border-[#D3DFDA] text-[#202828] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-[#6fa3a0] focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-[#F1F5F3] border border-[#D3DFDA] text-[#202828] font-semibold rounded-xl pl-3.5 pr-8 py-2 text-sm outline-none focus:border-[#6fa3a0] cursor-pointer"
              >
                <option value="ALL">All Statuses ({invites.length})</option>
                <option value="Pending">Pending ({pendingCount})</option>
                <option value="Sent">Sent ({sentCount})</option>
                <option value="Accepted">Accepted ({acceptedCount})</option>
                <option value="Expired">Expired ({expiredCount})</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#455250]">
            <thead className="bg-[#F8F9F8] border-b border-[#D3DFDA] text-[#202828]">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Gym Name</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Recipient</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Invite Date</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3DFDA]">
              {filteredInvites.map(invite => (
                <tr key={invite.id} className="hover:bg-[#F8F9F8] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#202828] flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-[#6fa3a0]/15 flex items-center justify-center text-[#164A4A] shrink-0">
                        <Building2 size={14} />
                      </div>
                      <span>{invite.gymName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[#202828] font-semibold">{invite.owner || 'N/A'}</div>
                    <div className="text-xs text-[#6fa3a0]">{invite.email}</div>
                  </td>
                  <td className="px-6 py-4 text-[#202828] font-medium">{formatDate(invite.date)}</td>
                  <td className="px-6 py-4 text-[#455250]">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} className="text-slate-400" />
                      <span>{invite.expiry || '7 Days'}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {/* Interactive Status Selector in Table Row */}
                    <div className="relative inline-block" title="Click to change status">
                      <select
                        value={invite.status || 'Pending'}
                        onChange={(e) => handleStatusChange(invite.id, e.target.value)}
                        className={`appearance-none cursor-pointer pl-3 pr-7 py-1 rounded-full text-xs font-bold border transition-colors outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#164A4A] ${getStatusBadgeClass(invite.status)}`}
                      >
                        <option value="Pending" className="text-slate-800 bg-white">Pending</option>
                        <option value="Sent" className="text-slate-800 bg-white">Sent</option>
                        <option value="Accepted" className="text-slate-800 bg-white">Accepted</option>
                        <option value="Expired" className="text-slate-800 bg-white">Expired</option>
                      </select>
                      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => setViewInvite(invite)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#6fa3a0]/15 text-[#164A4A] hover:bg-[#6fa3a0]/25 font-semibold text-xs transition-colors shadow-sm"
                        title="View Details"
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>

                      {/* Resend Invitation Button */}
                      <button
                        onClick={() => handleResend(invite)}
                        className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Resend Invitation (updates status to Sent)"
                      >
                        <Send size={15} />
                      </button>

                      {/* Cancel / Delete Button */}
                      <button
                        onClick={() => handleCancel(invite)}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancel Invitation"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvites.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#455250]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Send size={32} className="text-slate-300" />
                      <p className="font-semibold text-slate-600">No invitations found</p>
                      <p className="text-xs text-slate-400">
                        {statusFilter !== 'ALL'
                          ? `No invitations found with "${statusFilter}" status.`
                          : 'Try changing your search query or send a new invitation.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── View Details Modal ─── */}
      {viewInvite && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#D3DFDA] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#D3DFDA] bg-[#F8F9F8]">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-[#164A4A]/10 text-[#164A4A] rounded-xl flex items-center justify-center">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#202828]">{viewInvite.gymName}</h2>
                  <p className="text-xs text-[#455250]">Invitation Details</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative inline-block">
                  <select
                    value={viewInvite.status || 'Pending'}
                    onChange={(e) => handleStatusChange(viewInvite.id, e.target.value)}
                    className={`appearance-none cursor-pointer pl-3 pr-7 py-1 rounded-full text-xs font-bold border transition-colors outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#164A4A] ${getStatusBadgeClass(viewInvite.status)}`}
                  >
                    <option value="Pending" className="text-slate-800 bg-white">Pending</option>
                    <option value="Sent" className="text-slate-800 bg-white">Sent</option>
                    <option value="Accepted" className="text-slate-800 bg-white">Accepted</option>
                    <option value="Expired" className="text-slate-800 bg-white">Expired</option>
                  </select>
                  <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                </div>
                <button
                  onClick={() => setViewInvite(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Gym & Recipient Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F8F9F8] rounded-xl border border-[#E5EAE7]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <User size={11} /> Recipient Name
                  </p>
                  <p className="font-bold text-[#202828] text-sm">{viewInvite.owner || 'N/A'}</p>
                </div>

                <div className="p-3 bg-[#F8F9F8] rounded-xl border border-[#E5EAE7]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Building2 size={11} /> Gym Type
                  </p>
                  <p className="font-bold text-[#202828] text-sm">{viewInvite.type || 'Standard Gym'}</p>
                </div>

                <div className="p-3 bg-[#F8F9F8] rounded-xl border border-[#E5EAE7]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Mail size={11} /> Email Address
                  </p>
                  <p className="font-bold text-[#202828] text-sm truncate" title={viewInvite.email}>
                    {viewInvite.email}
                  </p>
                </div>

                <div className="p-3 bg-[#F8F9F8] rounded-xl border border-[#E5EAE7]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Phone size={11} /> Phone Number
                  </p>
                  <p className="font-bold text-[#202828] text-sm">{viewInvite.phone || 'N/A'}</p>
                </div>

                <div className="p-3 bg-[#F8F9F8] rounded-xl border border-[#E5EAE7]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar size={11} /> Sent Date
                  </p>
                  <p className="font-bold text-[#202828] text-sm">{formatDate(viewInvite.date)}</p>
                </div>

                <div className="p-3 bg-[#F8F9F8] rounded-xl border border-[#E5EAE7]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Clock size={11} /> Link Expiry
                  </p>
                  <p className="font-bold text-[#202828] text-sm">{viewInvite.expiry || '7 Days'}</p>
                </div>
              </div>

              {/* Registration Link */}
              <div className="p-4 bg-[#F8F9F8] border border-[#E5EAE7] rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Invitation Registration Link</span>
                  {copiedLink && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check size={13} /> Copied to clipboard!
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={viewInvite.link || `${window.location.origin}/register/gym-owner?invite=${viewInvite.id}&email=${encodeURIComponent(viewInvite.email)}`}
                    className="flex-1 bg-white border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-1.5 text-xs outline-none select-all"
                  />
                  <button
                    onClick={() => handleCopyLink(viewInvite.link || `${window.location.origin}/register/gym-owner?invite=${viewInvite.id}&email=${encodeURIComponent(viewInvite.email)}`)}
                    className="px-3 py-1.5 bg-[#164A4A] text-white hover:bg-[#164A4A]/90 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Copy size={13} />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 border-t border-[#D3DFDA] bg-white">
              <button
                onClick={() => {
                  setViewInvite(null);
                  navigate('/super-admin/gym-owners');
                }}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 border border-[#164A4A]/30 text-[#164A4A] hover:bg-[#164A4A]/10 rounded-xl text-xs font-bold transition-colors"
              >
                <ExternalLink size={13} />
                <span>Go to Gym Owner Details</span>
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => handleResend(viewInvite)}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors"
                >
                  <Send size={13} />
                  <span>Resend</span>
                </button>
                <button
                  onClick={() => setViewInvite(null)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminInvitations;
