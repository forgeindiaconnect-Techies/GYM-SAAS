import { useState, useEffect } from 'react';
import {
  Search, Loader2, AlertCircle, User, Building2, Trash2, Mail,
  Eye, X, Phone, Calendar, Clock, MapPin, Copy, Check, ShieldAlert
} from 'lucide-react';
import api from '../../utils/api';

interface DeletedRecord {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  mobile?: string;
  phone?: string;
  city?: string;
  createdAt?: string;
  deletedAt?: string;
  updatedAt?: string;
  approvalStatus?: string;
  subscriptionPlan?: string;
  gymName?: string;
  type?: string;
  owner?: string;
  status?: string;
  expiry?: string;
  date?: string;
  link?: string;
  gymId?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    gymType?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
      pinCode?: string;
    };
  };
}

const SuperAdminDeletedDetails = () => {
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'GYM_OWNERS' | 'GYM_INVITATIONS'>('CUSTOMERS');
  const [records, setRecords] = useState<DeletedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<DeletedRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchDeletedRecords();
  }, [activeTab]);

  const fetchDeletedRecords = async () => {
    try {
      setLoading(true);
      if (activeTab === 'GYM_INVITATIONS') {
        const { getDb, addItem } = await import('../../utils/mockDb');
        let invs = getDb('deletedGymInvitations') || [];
        if (invs.length === 0) {
          addItem('deletedGymInvitations', {
            gymName: 'Titan Fitness Arena',
            type: 'Strength & Conditioning',
            owner: 'Karthik Raja',
            email: 'karthik.raja@titanfitness.com',
            phone: '9840129999',
            date: '2026-09-15',
            status: 'Expired',
            expiry: '7 Days',
            deletedAt: '2026-09-22T14:30:00.000Z'
          });
          invs = getDb('deletedGymInvitations') || [];
        }
        setRecords(invs);
        setError('');
        setLoading(false);
        return;
      }

      const role = activeTab === 'CUSTOMERS' ? 'MEMBER' : 'GYM_OWNER';
      const res = await api.get(`/users?role=${role}&status=DELETED`);
      setRecords(res.data.users || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch deleted records');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredRecords = records.filter(r => {
    const term = searchQuery.toLowerCase();
    const name = (r.firstName ? `${r.firstName} ${r.lastName}` : (r.gymName || r.owner)) || '';
    return name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term);
  });

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden relative">
      <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight flex items-center space-x-3">
            <Trash2 className="text-[#B76E79]" size={32} />
            <span>Deleted Details</span>
          </h1>
          <p className="text-[#57534E] text-sm mt-1">View all deleted customers, gym owners, and gym invitations.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[#E7DADD] pb-2 overflow-x-auto custom-scrollbar shrink-0">
        <button
          onClick={() => { setActiveTab('CUSTOMERS'); setSelectedRecord(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'CUSTOMERS'
              ? 'border-[#B76E79] text-[#B76E79] bg-[#B76E79]/10 font-bold'
              : 'border-transparent text-[#57534E] hover:text-[#FFFFFF] hover:bg-[#FFFFFF]'
          }`}
        >
          <User size={16} />
          <span>Deleted Customers</span>
        </button>
        <button
          onClick={() => { setActiveTab('GYM_OWNERS'); setSelectedRecord(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'GYM_OWNERS'
              ? 'border-[#B76E79] text-[#B76E79] bg-[#B76E79]/10 font-bold'
              : 'border-transparent text-[#57534E] hover:text-[#FFFFFF] hover:bg-[#FFFFFF]'
          }`}
        >
          <Building2 size={16} />
          <span>Deleted Gym Owners</span>
        </button>
        <button
          onClick={() => { setActiveTab('GYM_INVITATIONS'); setSelectedRecord(null); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 whitespace-nowrap ${
            activeTab === 'GYM_INVITATIONS'
              ? 'border-[#B76E79] text-[#B76E79] bg-[#B76E79]/10 font-bold'
              : 'border-transparent text-[#57534E] hover:text-[#FFFFFF] hover:bg-[#FFFFFF]'
          }`}
        >
          <Mail size={16} />
          <span>Deleted Gym Invitations</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-xl p-4 flex flex-wrap gap-4 mt-4 shrink-0">
        <div className="flex-1 min-w-[250px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57534E]" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E7DADD] text-[#292524] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#B76E79] transition-colors"
          />
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-xl overflow-hidden relative min-h-[400px] mt-4 flex-1">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#57534E]">
            <Loader2 size={32} className="animate-spin mb-4 text-[#B76E79]" />
            <p>Loading deleted records...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#9F5965]">
            <AlertCircle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#57534E]">
            <Trash2 size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-[#292524] mb-1">No deleted records found</p>
            <p className="text-sm text-center max-w-md">
              There are no deleted {activeTab === 'CUSTOMERS' ? 'customers' : activeTab === 'GYM_OWNERS' ? 'gym owners' : 'gym invitations'} matching your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#57534E] uppercase bg-[#F3E8E8] border-b border-[#E7DADD]">
                <tr>
                  {activeTab === 'GYM_INVITATIONS' ? (
                    <>
                      <th className="px-6 py-4 font-bold">Gym Name</th>
                      <th className="px-6 py-4 font-bold">Owner</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Original Status</th>
                      <th className="px-6 py-4 font-bold">Deleted Date</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </>
                  ) : activeTab === 'GYM_OWNERS' ? (
                    <>
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Role</th>
                      <th className="px-6 py-4 font-bold">Deleted Date</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Role</th>
                      <th className="px-6 py-4 font-bold">Deleted Date</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7DADD]">
                {filteredRecords.map((record) => (
                  <tr key={record._id || record.id} className="hover:bg-[#F3E8E8] transition-colors">
                    {activeTab === 'GYM_INVITATIONS' ? (
                      <>
                        <td className="px-6 py-4 font-bold text-[#292524] flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-[#F3E8E8]/15 flex items-center justify-center text-[#B76E79] shrink-0">
                            <Building2 size={14} />
                          </div>
                          <span>{record.gymName}</span>
                        </td>
                        <td className="px-6 py-4 text-[#57534E] font-medium">{record.owner}</td>
                        <td className="px-6 py-4 text-[#57534E]">{record.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            record.status === 'Accepted'
                              ? 'bg-[#F3E8E8] text-[#B76E79] border-[#E7DADD]'
                              : record.status === 'Sent'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : record.status === 'Expired'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {record.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#57534E] font-medium">
                          {formatDate(record.deletedAt || record.date)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#B76E79]/10 text-[#B76E79] hover:bg-[#B76E79]/20 font-semibold text-xs transition-colors shadow-sm"
                            title="View Details"
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 font-bold text-[#292524]">
                          {record.firstName} {record.lastName}
                        </td>
                        <td className="px-6 py-4 text-[#57534E]">
                          {record.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700">
                            {record.role?.replace('_', ' ') || 'GYM OWNER'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#57534E] font-medium">
                          {formatDate(record.deletedAt || record.updatedAt || record.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#B76E79]/10 text-[#B76E79] hover:bg-[#B76E79]/20 font-semibold text-xs transition-colors shadow-sm"
                            title="View Details"
                          >
                            <Eye size={14} />
                            <span>View Details</span>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── View Details Modal ─── */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E7DADD] bg-[#F3E8E8] shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-[#B76E79]/10 text-[#B76E79] rounded-xl flex items-center justify-center">
                  {activeTab === 'GYM_INVITATIONS' ? (
                    <Mail size={22} />
                  ) : activeTab === 'GYM_OWNERS' ? (
                    <Building2 size={22} />
                  ) : (
                    <User size={22} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#292524]">
                    {activeTab === 'GYM_INVITATIONS'
                      ? selectedRecord.gymName
                      : `${selectedRecord.firstName || ''} ${selectedRecord.lastName || ''}`.trim() || selectedRecord.owner || 'Deleted Record'}
                  </h2>
                  <p className="text-xs text-[#57534E]">
                    {activeTab === 'GYM_INVITATIONS'
                      ? 'Deleted Gym Invitation Details'
                      : activeTab === 'GYM_OWNERS'
                      ? 'Deleted Gym Owner Details'
                      : 'Deleted Customer Details'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 flex items-center gap-1">
                  <ShieldAlert size={12} />
                  <span>DELETED</span>
                </span>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 rounded-lg text-[#57534E] hover:text-[#292524] hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="border border-[#E7DADD] rounded-xl overflow-hidden divide-y divide-[#E7DADD] bg-[#FFFFFF] shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7DADD]">
                  {/* Person / Owner Name */}
                  <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <User size={12} /> {activeTab === 'GYM_INVITATIONS' ? 'Recipient Name' : 'Full Name'}
                    </span>
                    <span className="font-bold text-[#292524] text-sm">
                      {activeTab === 'GYM_INVITATIONS'
                        ? selectedRecord.owner || 'N/A'
                        : `${selectedRecord.firstName || ''} ${selectedRecord.lastName || ''}`.trim() || 'N/A'}
                    </span>
                  </div>

                  {/* Email Address */}
                  <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Mail size={12} /> Email Address
                    </span>
                    <span className="font-semibold text-[#292524] text-sm break-all" title={selectedRecord.email}>
                      {selectedRecord.email || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7DADD]">
                  {/* Phone / Mobile */}
                  <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Phone size={12} /> Phone / Mobile
                    </span>
                    <span className="font-semibold text-[#292524] text-sm">
                      {selectedRecord.mobile || selectedRecord.phone || 'N/A'}
                    </span>
                  </div>

                  {/* Role or Gym Name */}
                  {activeTab === 'GYM_INVITATIONS' ? (
                    <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Building2 size={12} /> Gym Type
                      </span>
                      <span className="font-bold text-[#292524] text-sm">{selectedRecord.type || 'Standard Gym'}</span>
                    </div>
                  ) : activeTab === 'GYM_OWNERS' ? (
                    <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Building2 size={12} /> Associated Gym
                      </span>
                      <span className="font-bold text-[#292524] text-sm">
                        {selectedRecord.gymId?.name || selectedRecord.gymName || 'Commercial Fitness Hub'}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <User size={12} /> Account Role
                      </span>
                      <span className="font-bold text-[#292524] text-sm">{selectedRecord.role?.replace('_', ' ') || 'Customer'}</span>
                    </div>
                  )}
                </div>

                {activeTab === 'GYM_OWNERS' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7DADD]">
                    {/* Location / City */}
                    <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MapPin size={12} /> Location
                      </span>
                      <span className="font-semibold text-[#292524] text-sm">
                        {selectedRecord.city || selectedRecord.gymId?.location?.city || selectedRecord.gymId?.location?.address || 'Chennai, TN'}
                      </span>
                    </div>

                    {/* Plan for Gym Owners */}
                    <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock size={12} /> Subscription Plan
                      </span>
                      <span className="font-bold text-[#B76E79] text-sm">
                        {selectedRecord.subscriptionPlan || 'Free Trial'}
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === 'GYM_INVITATIONS' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7DADD]">
                    {/* Original Status for Gym Invitations */}
                    <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock size={12} /> Prior Status
                      </span>
                      <span className="font-bold text-[#292524] text-sm">
                        {selectedRecord.status || 'Pending'}
                      </span>
                    </div>

                    {/* Expiry for Gym Invitations */}
                    <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Clock size={12} /> Link Validity
                      </span>
                      <span className="font-semibold text-[#292524] text-sm">
                        {selectedRecord.expiry || '7 Days'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7DADD]">
                  {/* Created / Invite Date */}
                  <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar size={12} /> {activeTab === 'GYM_INVITATIONS' ? 'Invite Sent Date' : 'Registration Date'}
                    </span>
                    <span className="font-semibold text-[#292524] text-sm">
                      {formatDate(selectedRecord.date || selectedRecord.createdAt)}
                    </span>
                  </div>

                  {/* Deleted Date */}
                  <div className="p-3.5 bg-[#FFFFFF] flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Trash2 size={12} /> Deleted Date
                    </span>
                    <span className="font-bold text-rose-600 text-sm">
                      {formatDate(selectedRecord.deletedAt || selectedRecord.updatedAt || selectedRecord.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Registration Link Box for Invitations */}
              {activeTab === 'GYM_INVITATIONS' && (
                <div className="p-4 bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292524]">Invitation Link</span>
                    {copiedLink && (
                      <span className="text-xs font-bold text-[#B76E79] flex items-center gap-1">
                        <Check size={13} /> Copied!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedRecord.link || `${window.location.origin}/register/gym-owner?invite=${selectedRecord.id || 'id'}&email=${encodeURIComponent(selectedRecord.email)}`}
                      className="flex-1 bg-[#FFFFFF] border border-[#E7DADD] text-[#292524] rounded-lg px-3 py-1.5 text-xs outline-none select-all"
                    />
                    <button
                      onClick={() => handleCopyLink(selectedRecord.link || `${window.location.origin}/register/gym-owner?invite=${selectedRecord.id || 'id'}&email=${encodeURIComponent(selectedRecord.email)}`)}
                      className="px-3 py-1.5 bg-[#B76E79] text-white font-bold hover:bg-[#B76E79]/90 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Copy size={13} />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end p-5 border-t border-[#E7DADD] bg-[#FFFFFF]">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-[#F3E8E8] hover:bg-slate-200 text-[#292524] rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDeletedDetails;
