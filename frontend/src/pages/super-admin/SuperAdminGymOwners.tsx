import { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle, Phone, Mail, Building2, Eye, Edit2, X, Check, Users, Clock, CheckCircle, XCircle, ShieldAlert, Trash2, Download, FileText, Table as TableIcon } from 'lucide-react';
import api from '../../utils/api';
import { exportToPDF, exportToExcel, exportToWord } from '../../utils/export';

interface GymOwner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  city?: string;
  approvalStatus: string;
  createdAt: string;
  subscriptionPlan?: string;
  subscriptionExpiry?: string;
  billingCycle?: string;
  paymentStatus?: string;
  subscriptionStatus?: string;
  subscriptionStart?: string;
  transactionId?: string;
  gymId?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    gymType?: string;
    description?: string;
    logo?: string;
    rating?: number;
    reviewCount?: number;
    memberCapacity?: number;
    trainerCapacity?: number;
    facilities?: string[];
    equipment?: any[];
    images?: string[];
    acDetails?: { type: string; areas: string[] };
    subscriptionPlans?: any[];
    location: {
      address: string;
      city: string;
      state: string;
      pinCode: string;
    };
    status?: string;
    createdAt?: string;
  };
}

const SAAS_PLANS: Record<string, { name: string, price: string, features: string[] }> = {
  FREE_TRIAL: {
    name: 'Free Trial',
    price: '₹0',
    features: ['Gym Setup', 'Member Management (Up to 10)', 'Trainer Management (1 Trainer)', 'Membership Plans (1 Plan)', 'Exercise Plans', 'Basic Diet Plans', 'Limited AI Suggestions']
  },
  BASIC: {
    name: 'Basic',
    price: '₹399 / 1 Month',
    features: ['Gym Setup', 'Member Management (Up to 100)', 'Trainer Management (Up to 5)', 'Membership Plans (5 Plans)', 'Exercise & Diet Plans', 'AI Suggestions', 'Reports & Analytics']
  },
  PREMIUM: {
    name: 'Premium',
    price: '₹799 / 3 Months',
    features: [
      'Gym Setup', 'Unlimited Member Management', 'Unlimited Trainer Management',
      'Unlimited Membership Plans', 'Exercise Plans', 'Diet Plans',
      'Advanced AI Suggestions', 'Advanced Member Progress Tracking',
      'Attendance Management', 'Payment Tracking', 'Advanced Reports & Analytics',
      'Unlimited AI Workout Generation', 'Unlimited AI Diet Generation',
      'Gym Store — Sell Supplements & Merch', 'Gym Store — Online Orders & Payments',
      'Gym Store — Inventory & Offline Sales', 'Notifications',
      'Multiple Branches', 'Priority Support'
    ]
  }
};

const TABS = [
  { id: 'ALL', label: 'All Owners', icon: Users },
  { id: 'PENDING', label: 'Pending', icon: Clock },
  { id: 'APPROVED', label: 'Approved', icon: CheckCircle },
  { id: 'REJECTED', label: 'Rejected', icon: XCircle },
  { id: 'SUSPENDED', label: 'Suspended', icon: ShieldAlert },
];

const SuperAdminGymOwners = () => {
  const [owners, setOwners] = useState<GymOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modals state
  const [viewOwner, setViewOwner] = useState<GymOwner | null>(null);
  const [editOwner, setEditOwner] = useState<GymOwner | null>(null);
  const [viewSubscription, setViewSubscription] = useState<GymOwner | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const [res, subsRes] = await Promise.all([
        api.get('/users?role=GYM_OWNER'),
        api.get('/subscriptions/all').catch(() => ({ data: { subscriptions: [] } }))
      ]);
      
      const users = res.data.users;
      const subscriptions = subsRes.data.subscriptions || [];
      
      const mergedUsers = users.map((u: any) => {
        const sub = subscriptions.find((s: any) => s.userId === u._id);
        return {
          ...u,
          billingCycle: sub?.billing,
          paymentStatus: sub ? 'Paid' : 'N/A', // If we have an active subscription
          subscriptionStatus: sub?.status || 'N/A',
          subscriptionStart: sub?.start,
          transactionId: sub?.transactionId
        };
      });
      
      setOwners(mergedUsers);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch gym owners');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setStatusUpdating(id);
      // Optimistic UI update for immediate feedback
      setOwners(prev => prev.map(o => o._id === id ? { ...o, approvalStatus: newStatus } : o));
      await api.put(`/users/${id}/status`, { status: newStatus });
      // Re-fetch to get the latest data (including updated gym status)
      await fetchOwners();
    } catch (err: any) {
      console.error('Status update failed:', err);
      alert(err.response?.data?.message || 'Failed to update status. Please try again.');
      // Revert optimistic update on error
      await fetchOwners();
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this gym owner?')) {
      try {
        await api.delete(`/users/${id}`);
        setOwners(prev => prev.filter(o => o._id !== id));
      } catch (err: any) {
        console.error(err);
        alert('Failed to delete gym owner.');
      }
    }
  };

  const handleExport = (type: 'pdf' | 'excel' | 'word') => {
    const columns = ['Name', 'Email', 'Mobile', 'Gym Name', 'City', 'Status', 'Date Joined'];
    const data = filteredOwners.map(o => [
      `${o.firstName} ${o.lastName}`,
      o.email,
      o.mobile,
      o.gymId?.name || 'N/A',
      o.city || 'N/A',
      o.approvalStatus,
      new Date(o.createdAt).toLocaleDateString()
    ]);
    const config = {
      filename: `GymOwners_Report_${new Date().toISOString().split('T')[0]}`,
      columns,
      data,
      title: 'Gym Owners Report'
    };
    
    if (type === 'pdf') exportToPDF(config);
    if (type === 'excel') exportToExcel(config);
    if (type === 'word') exportToWord(config);
    setShowExportMenu(false);
  };

  const handleEditClick = (owner: GymOwner) => {
    setEditOwner(owner);
    setEditForm({
      firstName: owner.firstName,
      lastName: owner.lastName,
      email: owner.email,
      mobile: owner.mobile,
      city: owner.city || '',
      subscriptionPlan: owner.subscriptionPlan || '',
      subscriptionExpiry: owner.subscriptionExpiry ? new Date(owner.subscriptionExpiry).toISOString().split('T')[0] : '',
      gymData: owner.gymId ? {
        name: owner.gymId.name,
        gymType: owner.gymId.gymType || '',
        email: owner.gymId.email || '',
        phone: owner.gymId.phone || '',
        memberCapacity: owner.gymId.memberCapacity || '',
        trainerCapacity: owner.gymId.trainerCapacity || '',
        location: {
          address: owner.gymId.location?.address || '',
          city: owner.gymId.location?.city || '',
          state: owner.gymId.location?.state || '',
          pinCode: owner.gymId.location?.pinCode || '',
        }
      } : {}
    });
  };

  const handleSaveEdit = async () => {
    if (!editOwner) return;
    try {
      setIsSaving(true);
      const res = await api.put(`/users/${editOwner._id}`, editForm);
      setOwners(owners.map(o => o._id === editOwner._id ? { ...o, ...res.data.user } : o));
      setEditOwner(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update gym owner');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredOwners = owners.filter(o => {
    const matchesTab = activeTab === 'ALL' || o.approvalStatus === activeTab;
    const matchesSearch = o.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.gymId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'REJECTED': return 'bg-[#6fa3a0]/10 text-[#6fa3a0] border-[#6fa3a0]/20';
      case 'SUSPENDED': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#202828]">Gym Owner Details</h1>
          <p className="text-[#455250] text-sm mt-1">Manage all registered gym owners and their approval statuses.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-[#D3DFDA] pb-2 overflow-x-auto custom-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#164A4A] text-[#164A4A] bg-[#164A4A]/10'
                : 'border-transparent text-[#455250] hover:text-[#202828] hover:bg-[#FFFFFF]'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            <span className="bg-[#E8E5DA] text-xs px-2 py-0.5 rounded-full ml-2 text-[#202828]">
              {tab.id === 'ALL' ? owners.length : owners.filter(o => o.approvalStatus === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[250px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#455250]" />
          <input 
            type="text" 
            placeholder="Search by name, gym or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg hover:bg-[#E8E5DA] transition-colors text-sm font-medium"
          >
            <Download size={16} className="text-[#164A4A]" />
            <span>Download Report</span>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] border border-[#D3DFDA] rounded-lg shadow-xl z-10 py-1 overflow-hidden">
              <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-[#202828] hover:bg-[#E8E5DA] flex items-center space-x-2">
                <FileText size={14} className="text-red-400" /><span>PDF Document</span>
              </button>
              <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 text-sm text-[#202828] hover:bg-[#E8E5DA] flex items-center space-x-2">
                <TableIcon size={14} className="text-green-400" /><span>Excel Spreadsheet</span>
              </button>
              <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-2 text-sm text-[#202828] hover:bg-[#E8E5DA] flex items-center space-x-2">
                <FileText size={14} className="text-blue-400" /><span>Word Document</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#455250]">
            <Loader2 size={32} className="animate-spin mb-4 text-[#164A4A]" />
            <p>Loading gym owners...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6fa3a0]">
            <AlertCircle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#455250]">
            <Building2 size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-[#202828] mb-1">No gym owners found</p>
            <p className="text-sm text-center max-w-md">There are no gym owners matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#455250] uppercase bg-[#FFFFFF] border-b border-[#D3DFDA]">
                <tr>
                  <th className="px-6 py-4 font-medium">Gym & Owner</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Plan & Billing</th>
                  <th className="px-6 py-4 font-medium">Sub & Payment</th>
                  <th className="px-6 py-4 font-medium">Start & Expiry</th>
                  <th className="px-6 py-4 font-medium">Approval</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3DFDA]">
                {filteredOwners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-[#F2EFE8] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#E8E5DA] flex items-center justify-center text-blue-500 font-bold">
                          {owner.firstName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-[#202828]">{owner.firstName} {owner.lastName}</div>
                          <div className="text-xs text-[#455250]">{owner.gymId?.name || 'No Gym'}</div>
                          {owner.gymId?.location?.city && <div className="text-[10px] text-[#A8ADA9]">{owner.gymId.location.city}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[#455250]">
                          <Mail size={14} />
                          <span className="truncate max-w-[150px]">{owner.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#455250]">
                          <Phone size={14} />
                          <span>{owner.mobile}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {owner.subscriptionPlan && SAAS_PLANS[owner.subscriptionPlan] ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F1F5F9] text-[#455250] border border-[#E8E5DA]">
                            {SAAS_PLANS[owner.subscriptionPlan].name}
                          </span>
                        ) : (
                          <span className="text-[#A8ADA9] text-xs">No Plan</span>
                        )}
                        <div className="text-xs text-[#455250]">{owner.billingCycle ? owner.billingCycle.charAt(0).toUpperCase() + owner.billingCycle.slice(1) : 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-[#687B78]">Status:</span>{' '}
                          <span className={`font-medium ${owner.subscriptionStatus === 'Active' ? 'text-[#164A4A]' : 'text-[#EF4444]'}`}>
                            {owner.subscriptionStatus || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#687B78]">Payment:</span>{' '}
                          <span className="font-medium text-[#202828]">{owner.paymentStatus || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#455250] text-xs whitespace-nowrap">
                      <div><span className="text-[#A8ADA9]">Start:</span> {owner.subscriptionStart ? new Date(owner.subscriptionStart).toLocaleDateString() : 'N/A'}</div>
                      <div><span className="text-[#A8ADA9]">Expiry:</span> {owner.subscriptionExpiry ? new Date(owner.subscriptionExpiry).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(owner.approvalStatus)}`}>
                        {owner.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Quick Actions based on status - Fixed width to prevent shifting */}
                        <div className="flex items-center justify-end space-x-1 w-[104px]">
                          {owner.approvalStatus !== 'APPROVED' && (
                            <button 
                              onClick={() => handleStatusChange(owner._id, 'APPROVED')}
                              disabled={statusUpdating === owner._id}
                              className="p-1 text-green-500 hover:bg-green-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          
                          {owner.approvalStatus !== 'PENDING' && (
                            <button 
                              onClick={() => handleStatusChange(owner._id, 'PENDING')}
                              disabled={statusUpdating === owner._id}
                              className="p-1 text-yellow-500 hover:bg-yellow-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Mark as Pending"
                            >
                              <Clock size={18} />
                            </button>
                          )}

                          {owner.approvalStatus !== 'REJECTED' && (
                            <button 
                              onClick={() => handleStatusChange(owner._id, 'REJECTED')}
                              disabled={statusUpdating === owner._id}
                              className="p-1 text-[#6fa3a0] hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          
                          {owner.approvalStatus !== 'SUSPENDED' && (
                            <button 
                              onClick={() => handleStatusChange(owner._id, 'SUSPENDED')}
                              disabled={statusUpdating === owner._id}
                              className="p-1 text-orange-500 hover:bg-orange-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Suspend"
                            >
                              <ShieldAlert size={18} />
                            </button>
                          )}
                        </div>

                        <div className="w-px h-5 bg-[#E8E5DA] mx-1"></div>

                        {/* View, Edit, Delete buttons */}
                        <div className="flex items-center justify-end space-x-1">
                          <button 
                            onClick={() => setViewOwner(owner)}
                            className="p-1.5 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Owner Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleEditClick(owner)}
                            className="p-1.5 text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                            title="Edit Owner Details"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(owner._id)}
                            className="p-1.5 text-[#455250] hover:text-[#6fa3a0] hover:bg-red-500/10 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {viewOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F1F5F3]/90 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-[#FFFFFF] py-3 z-20 border-b border-[#D3DFDA] mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#202828]">Gym Owner Details</h2>
                {viewOwner.subscriptionPlan && SAAS_PLANS[viewOwner.subscriptionPlan] && (
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 shadow-sm flex items-center gap-1">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    {SAAS_PLANS[viewOwner.subscriptionPlan].name} SaaS Plan
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {viewOwner.gymId && (
                  <a 
                    href={`/gyms/${viewOwner.gymId._id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#164A4A] hover:underline flex items-center"
                  >
                    <Eye size={16} className="mr-1" /> View Public Page
                  </a>
                )}
                <button 
                  onClick={() => setViewOwner(null)}
                  className="p-1 text-[#455250] hover:text-[#164A4A] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="space-y-8 text-sm">
              {/* Owner Details */}
              <div>
                <h3 className="text-[#164A4A] font-semibold mb-4 border-b border-[#D3DFDA] pb-2">Owner Information</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-[#455250] mb-1">First Name</p>
                    <p className="font-medium text-[#202828]">{viewOwner.firstName}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Last Name</p>
                    <p className="font-medium text-[#202828]">{viewOwner.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Email</p>
                    <p className="font-medium text-[#202828]">{viewOwner.email}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Mobile</p>
                    <p className="font-medium text-[#202828]">{viewOwner.mobile}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewOwner.approvalStatus)}`}>
                      {viewOwner.approvalStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Joined Date</p>
                    <p className="font-medium text-[#202828]">{new Date(viewOwner.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Platform Subscription Plan</p>
                    <p className="font-medium text-[#202828]">
                      {viewOwner.subscriptionPlan && SAAS_PLANS[viewOwner.subscriptionPlan] 
                        ? SAAS_PLANS[viewOwner.subscriptionPlan].name 
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Plan Expiry Date</p>
                    <p className="font-medium text-[#202828]">
                      {viewOwner.subscriptionExpiry 
                        ? new Date(viewOwner.subscriptionExpiry).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Member Subscription Plans */}
              <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-4">
                <h3 className="text-[#164A4A] font-semibold mb-4 border-b border-[#D3DFDA] pb-2">Member Subscription Plans</h3>
                {viewOwner.gymId?.subscriptionPlans && viewOwner.gymId.subscriptionPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewOwner.gymId.subscriptionPlans.map((plan: any, idx: number) => (
                      <div key={idx} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-[#202828]">{plan.name}</h4>
                            <span className="text-[#EF4444] font-bold">₹{plan.price}</span>
                          </div>
                          <p className="text-sm text-[#455250] mb-2">{plan.duration}</p>
                        </div>
                        <p className="text-xs text-[#777] break-words line-clamp-3">{plan.features}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#455250]">No subscription plans defined for this gym.</p>
                )}
              </div>

              {/* Gym Images */}
              {viewOwner.gymId?.images && viewOwner.gymId.images.length > 0 && (
                <div>
                  <h3 className="text-[#164A4A] font-semibold mb-4 border-b border-[#D3DFDA] pb-2">Gym Images</h3>
                  <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {viewOwner.gymId.images.map((url: string, i: number) => (
                        <img key={i} src={url} alt={`Gym Image ${i+1}`} className="w-full h-24 object-cover rounded-lg border border-[#D3DFDA]" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Gym Details */}
              <div>
                <h3 className="text-[#164A4A] font-semibold mb-4 border-b border-[#D3DFDA] pb-2">Gym Information</h3>
                {viewOwner.gymId?.logo && (
                  <div className="mb-4">
                    <img src={viewOwner.gymId.logo} alt={viewOwner.gymId.name} className="w-full h-40 object-cover rounded-xl border border-[#D3DFDA]" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-[#455250] mb-1">Gym Name</p>
                    <p className="font-medium text-[#202828]">{viewOwner.gymId?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Gym Type</p>
                    <p className="font-medium text-[#202828]">{viewOwner.gymId?.gymType || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Gym Status</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                      viewOwner.gymId?.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                      viewOwner.gymId?.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                      viewOwner.gymId?.status === 'SUSPENDED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                      'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>{viewOwner.gymId?.status || 'PENDING'}</span>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Rating</p>
                    <p className="font-medium text-[#202828]">⭐ {viewOwner.gymId?.rating || 'N/A'} {viewOwner.gymId?.reviewCount ? `(${viewOwner.gymId.reviewCount} reviews)` : ''}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Gym Email</p>
                    <p className="font-medium text-[#202828]">{viewOwner.gymId?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Gym Phone</p>
                    <p className="font-medium text-[#202828]">{viewOwner.gymId?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Location & Operations */}
              <div>
                <h3 className="text-[#164A4A] font-semibold mb-4 border-b border-[#D3DFDA] pb-2">Location & Operations</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div className="col-span-2">
                    <p className="text-[#455250] mb-1">Address</p>
                    <p className="font-medium text-[#202828]">{viewOwner.gymId?.location?.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">City</p>
                    <p className="font-medium text-[#202828]">{viewOwner.gymId?.location?.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">State</p>
                    <p className="font-medium text-[#202828]">{viewOwner.gymId?.location?.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">PIN Code</p>
                    <p className="font-medium text-[#202828]">{viewOwner.gymId?.location?.pinCode || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Approx. Members</p>
                    <p className="font-medium text-[#202828]">{viewOwner.gymId?.memberCapacity || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#455250] mb-1">Num Trainers</p>
                    <p className="font-medium text-[#202828]">{viewOwner.gymId?.trainerCapacity || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h3 className="text-[#164A4A] font-semibold mb-4 border-b border-[#D3DFDA] pb-2">Equipment</h3>
                {viewOwner.gymId?.equipment && viewOwner.gymId.equipment.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewOwner.gymId.equipment.map((eq: any, i: number) => (
                      <div key={i} className="bg-[#FFFFFF] p-3 rounded-lg border border-[#D3DFDA]">
                        <p className="text-sm font-medium text-[#202828]">{eq.name} <span className="text-[#455250] text-xs">x{eq.quantity}</span></p>
                        <p className="text-xs text-[#455250] mt-1">{eq.category} • {eq.condition} • {eq.availability}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#455250]">No equipment listed.</p>
                )}
              </div>

              {/* AC Details & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[#164A4A] font-semibold mb-4 border-b border-[#D3DFDA] pb-2">AC Details</h3>
                  <div className="text-sm">
                    <p className="mb-1"><span className="text-[#455250]">Type:</span> <span className="text-[#202828] font-medium">{viewOwner.gymId?.acDetails?.type || 'Not Specified'}</span></p>
                    {viewOwner.gymId?.acDetails?.areas && viewOwner.gymId.acDetails.areas.length > 0 && (
                      <p><span className="text-[#455250]">Areas:</span> <span className="text-[#202828] font-medium">{viewOwner.gymId.acDetails.areas.join(', ')}</span></p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-[#164A4A] font-semibold mb-4 border-b border-[#D3DFDA] pb-2">Facilities</h3>
                  {viewOwner.gymId?.facilities && viewOwner.gymId.facilities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {viewOwner.gymId.facilities.map((f: string, i: number) => (
                        <span key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] text-xs px-2.5 py-1 rounded-md">{f}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#455250]">No facilities selected.</p>
                  )}
                </div>
              </div>





            </div>
            
            <div className="mt-8 flex justify-end sticky bottom-0 bg-[#FFFFFF] py-2 border-t border-[#D3DFDA]">
              <button 
                onClick={() => setViewOwner(null)}
                className="px-4 py-2 bg-[#E8E5DA] text-[#202828] rounded-lg hover:bg-[#CBD5E1] transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Owner Modal */}
      {editOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F1F5F3]/90 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-[#FFFFFF] py-3 z-20 border-b border-[#D3DFDA] mb-6">
              <h2 className="text-xl font-bold text-[#202828]">Edit Gym Owner</h2>
              <button 
                onClick={() => setEditOwner(null)}
                className="p-1 text-[#455250] hover:text-[#164A4A] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Account Information */}
              <div>
                <h3 className="text-[#164A4A] font-semibold mb-3">Owner Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">First Name</label>
                    <input 
                      value={editForm.firstName || ''} 
                      onChange={e => setEditForm({...editForm, firstName: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">Last Name</label>
                    <input 
                      value={editForm.lastName || ''} 
                      onChange={e => setEditForm({...editForm, lastName: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">Email</label>
                    <input 
                      value={editForm.email || ''} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">Mobile</label>
                    <input 
                      value={editForm.mobile || ''} 
                      onChange={e => setEditForm({...editForm, mobile: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm text-[#455250] mb-2">City</label>
                    <input 
                      value={editForm.city || ''} 
                      onChange={e => setEditForm({...editForm, city: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm text-[#455250] mb-2">Platform Subscription Plan</label>
                    <div className="w-full bg-[#F2EFE8] border border-[#E8E5DA] text-[#455250] rounded-lg px-3 py-2 text-sm cursor-not-allowed">
                      {editForm.subscriptionPlan ? (SAAS_PLANS[editForm.subscriptionPlan]?.name || editForm.subscriptionPlan) : 'N/A'}
                    </div>
                    {editForm.subscriptionPlan && SAAS_PLANS[editForm.subscriptionPlan] && (
                      <div className="bg-[#F2EFE8] border border-[#D3DFDA] rounded-lg p-3 mt-2">
                        <div className="flex justify-between items-center mb-1.5">
                           <p className="text-xs font-semibold text-[#164A4A]">Included Features:</p>
                           <span className="text-xs font-bold text-[#202828] bg-white px-2 py-0.5 rounded border border-[#E8E5DA] shadow-sm">{SAAS_PLANS[editForm.subscriptionPlan].price}</span>
                        </div>
                        <ul className="space-y-1">
                          {SAAS_PLANS[editForm.subscriptionPlan].features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-[#455250] flex items-start gap-1.5">
                              <CheckCircle size={12} className="text-[#164A4A] shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm text-[#455250] mb-2">Plan Expiry Date</label>
                    <div className="w-full bg-[#F2EFE8] border border-[#E8E5DA] text-[#455250] rounded-lg px-3 py-2 text-sm cursor-not-allowed">
                      {editForm.subscriptionExpiry || 'N/A'}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#A8ADA9] mt-2 italic flex items-center gap-1"><AlertCircle size={12}/> Note: Platform subscription and payment details are read-only and cannot be manually modified by administrators.</p>
              </div>

              {/* Gym Details */}
              <div>
                <h3 className="text-[#164A4A] font-semibold mb-3">Gym Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">Gym Name</label>
                    <input 
                      value={editForm.gymData?.name || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, name: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">Gym Type</label>
                    <input 
                      value={editForm.gymData?.gymType || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, gymType: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">Gym Email</label>
                    <input 
                      value={editForm.gymData?.email || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, email: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">Gym Phone</label>
                    <input 
                      value={editForm.gymData?.phone || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, phone: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Operations */}
              <div>
                <h3 className="text-[#164A4A] font-semibold mb-3">Location & Operations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-[#455250] mb-2">Address</label>
                    <input 
                      value={editForm.gymData?.location?.address || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, address: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">City</label>
                    <input 
                      value={editForm.gymData?.location?.city || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, city: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">State</label>
                    <input 
                      value={editForm.gymData?.location?.state || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, state: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">PIN Code</label>
                    <input 
                      value={editForm.gymData?.location?.pinCode || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, pinCode: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">Approx. Members</label>
                    <input 
                      type="number"
                      value={editForm.gymData?.memberCapacity || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, memberCapacity: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#455250] mb-2">Number of Trainers</label>
                    <input 
                      type="number"
                      value={editForm.gymData?.trainerCapacity || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, trainerCapacity: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#164A4A] transition-colors"
                    />
                  </div>
                </div>
              </div>

            </div>
            
            <div className="mt-8 flex justify-end space-x-3 sticky bottom-0 bg-[#FFFFFF] py-2 border-t border-[#D3DFDA]">
              <button 
                onClick={() => setEditOwner(null)}
                className="px-4 py-2 border border-[#D3DFDA] text-[#455250] rounded-lg hover:bg-[#F2EFE8] transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-[#164A4A] text-white rounded-lg hover:bg-[#C6A77D] transition-colors text-sm font-semibold flex items-center space-x-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Platform Subscription Modal */}
      {viewSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#D3DFDA] flex justify-between items-center bg-gradient-to-r from-[#F1F5F3] to-[#FFFFFF]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#202828]">Platform Subscription</h2>
                  <p className="text-[#455250] text-xs">Payment & Plan details for {viewSubscription.firstName} {viewSubscription.lastName}</p>
                </div>
              </div>
              <button onClick={() => setViewSubscription(null)} className="p-2 text-[#455250] hover:text-[#202828] bg-white rounded-full border border-[#E8E5DA] shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              
              {/* Active Plan Card */}
              <div className="bg-gradient-to-br from-[#F2EFE8] to-[#F1F5F9] rounded-xl p-5 border border-[#E8E5DA] shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#687B78] mb-1 block">Current Plan</span>
                    <h3 className="text-xl font-bold text-[#202828] flex items-center gap-2">
                      {viewSubscription.subscriptionPlan && SAAS_PLANS[viewSubscription.subscriptionPlan] 
                        ? SAAS_PLANS[viewSubscription.subscriptionPlan].name 
                        : 'No Active Plan'}
                      {viewSubscription.subscriptionStatus === 'Active' && (
                        <span className="bg-[#D2B48C]/10 text-[#164A4A] text-[10px] px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-wide">Active</span>
                      )}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#0F172A]">
                      {viewSubscription.subscriptionPlan && SAAS_PLANS[viewSubscription.subscriptionPlan] 
                        ? SAAS_PLANS[viewSubscription.subscriptionPlan].price.split('/')[0] 
                        : '₹0'}
                    </div>
                    <div className="text-xs text-[#687B78]">{viewSubscription.billingCycle || 'N/A'} billing</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-[#E8E5DA] pt-4">
                  <div>
                    <p className="text-[10px] text-[#687B78] uppercase font-semibold">Start Date</p>
                    <p className="text-sm font-medium text-[#202828] mt-1">{viewSubscription.subscriptionStart ? new Date(viewSubscription.subscriptionStart).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#687B78] uppercase font-semibold">Renewal Date</p>
                    <p className="text-sm font-medium text-[#202828] mt-1">{viewSubscription.subscriptionExpiry ? new Date(viewSubscription.subscriptionExpiry).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#687B78] uppercase font-semibold">Payment Status</p>
                    <p className="text-sm font-medium text-[#202828] mt-1">{viewSubscription.paymentStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#687B78] uppercase font-semibold">Transaction ID</p>
                    <p className="text-sm font-medium text-[#202828] mt-1 truncate" title={viewSubscription.transactionId || ''}>{viewSubscription.transactionId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* History Section (Simulated) */}
              <div>
                <h3 className="text-sm font-bold text-[#202828] mb-3">Subscription History</h3>
                {viewSubscription.transactionId ? (
                  <div className="border border-[#E8E5DA] rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-[#687B78] uppercase bg-[#F2EFE8] border-b border-[#E8E5DA]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold">Plan</th>
                          <th className="px-4 py-3 font-semibold">Amount</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8E5DA]">
                        <tr className="bg-white">
                          <td className="px-4 py-3 text-[#202828]">{viewSubscription.subscriptionStart ? new Date(viewSubscription.subscriptionStart).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-4 py-3 text-[#202828]">{viewSubscription.subscriptionPlan || 'N/A'}</td>
                          <td className="px-4 py-3 text-[#202828]">{viewSubscription.subscriptionPlan ? SAAS_PLANS[viewSubscription.subscriptionPlan]?.price.split('/')[0] : '₹0'}</td>
                          <td className="px-4 py-3"><span className="text-[#164A4A] bg-green-50 px-2 py-0.5 rounded text-xs border border-green-200">Paid</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#687B78] border border-dashed border-[#CBD5E1] rounded-lg bg-[#F2EFE8]">
                    No previous subscription history found.
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminGymOwners;
