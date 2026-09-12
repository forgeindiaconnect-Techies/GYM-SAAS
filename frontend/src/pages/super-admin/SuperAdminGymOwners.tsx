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
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users?role=GYM_OWNER');
      setOwners(res.data.users);
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
      case 'REJECTED': return 'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20';
      case 'SUSPENDED': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Gym Owner Details</h1>
          <p className="text-[#475569] text-sm mt-1">Manage all registered gym owners and their approval statuses.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-[#CCFBF1] pb-2 overflow-x-auto custom-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#16A34A] text-[#16A34A] bg-[#16A34A]/10'
                : 'border-transparent text-[#475569] hover:text-[#1E293B] hover:bg-[#FFFFFF]'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            <span className="bg-[#E2E8F0] text-xs px-2 py-0.5 rounded-full ml-2 text-[#1E293B]">
              {tab.id === 'ALL' ? owners.length : owners.filter(o => o.approvalStatus === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[250px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input 
            type="text" 
            placeholder="Search by name, gym or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg hover:bg-[#E2E8F0] transition-colors text-sm font-medium"
          >
            <Download size={16} className="text-[#16A34A]" />
            <span>Download Report</span>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] border border-[#CCFBF1] rounded-lg shadow-xl z-10 py-1 overflow-hidden">
              <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-[#1E293B] hover:bg-[#E2E8F0] flex items-center space-x-2">
                <FileText size={14} className="text-red-400" /><span>PDF Document</span>
              </button>
              <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 text-sm text-[#1E293B] hover:bg-[#E2E8F0] flex items-center space-x-2">
                <TableIcon size={14} className="text-green-400" /><span>Excel Spreadsheet</span>
              </button>
              <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-2 text-sm text-[#1E293B] hover:bg-[#E2E8F0] flex items-center space-x-2">
                <FileText size={14} className="text-blue-400" /><span>Word Document</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#475569]">
            <Loader2 size={32} className="animate-spin mb-4 text-[#16A34A]" />
            <p>Loading gym owners...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#0D9488]">
            <AlertCircle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#475569]">
            <Building2 size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-[#1E293B] mb-1">No gym owners found</p>
            <p className="text-sm text-center max-w-md">There are no gym owners matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#475569] uppercase bg-[#FFFFFF] border-b border-[#CCFBF1]">
                <tr>
                  <th className="px-6 py-4 font-medium">Gym Owner</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Login Date</th>
                  <th className="px-6 py-4 font-medium">Expiry Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCFBF1]">
                {filteredOwners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-blue-500 font-bold">
                          {owner.firstName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-[#1E293B]">{owner.firstName} {owner.lastName}</div>
                          <div className="text-xs text-[#475569]">Gym Owner</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[#475569]">
                          <Mail size={14} />
                          <span className="truncate max-w-[150px]">{owner.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#475569]">
                          <Phone size={14} />
                          <span>{owner.mobile}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#475569]">
                      {(owner.city || owner.gymId?.location?.city) ? (
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{owner.city || owner.gymId?.location?.city}</span>
                        </div>
                      ) : (
                        <span className="text-[#555]">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#475569] whitespace-nowrap">
                      {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-[#475569] whitespace-nowrap">
                      {owner.subscriptionExpiry ? new Date(owner.subscriptionExpiry).toLocaleDateString() : 'N/A'}
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
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
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

                        <div className="w-px h-5 bg-[#E2E8F0] mx-1"></div>

                        {/* View, Edit, Delete buttons */}
                        <div className="flex items-center justify-end space-x-1 w-[96px]">
                          <button 
                            onClick={() => setViewOwner(owner)}
                            className="p-1.5 text-[#475569] hover:text-[#1E293B] hover:bg-[#E2E8F0] rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleEditClick(owner)}
                            className="p-1.5 text-[#475569] hover:text-[#16A34A] hover:bg-[#E2E8F0] rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(owner._id)}
                            className="p-1.5 text-[#475569] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0FDFA]/90 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-[#FFFFFF] py-3 z-20 border-b border-[#CCFBF1] mb-6">
              <h2 className="text-xl font-bold text-[#1E293B]">Gym Owner Details</h2>
              <div className="flex items-center gap-4">
                {viewOwner.gymId && (
                  <a 
                    href={`/gyms/${viewOwner.gymId._id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#16A34A] hover:underline flex items-center"
                  >
                    <Eye size={16} className="mr-1" /> View Public Page
                  </a>
                )}
                <button 
                  onClick={() => setViewOwner(null)}
                  className="p-1 text-[#475569] hover:text-[#16A34A] transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="space-y-8 text-sm">
              {/* Owner Details */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Owner Information</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-[#475569] mb-1">First Name</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.firstName}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Last Name</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Email</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.email}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Mobile</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.mobile}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewOwner.approvalStatus)}`}>
                      {viewOwner.approvalStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Joined Date</p>
                    <p className="font-medium text-[#1E293B]">{new Date(viewOwner.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Member Subscription Plans */}
              <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-4">
                <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Member Subscription Plans</h3>
                {viewOwner.gymId?.subscriptionPlans && viewOwner.gymId.subscriptionPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewOwner.gymId.subscriptionPlans.map((plan: any, idx: number) => (
                      <div key={idx} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-[#1E293B]">{plan.name}</h4>
                            <span className="text-[#EF4444] font-bold">₹{plan.price}</span>
                          </div>
                          <p className="text-sm text-[#475569] mb-2">{plan.duration}</p>
                        </div>
                        <p className="text-xs text-[#777] break-words line-clamp-3">{plan.features}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#475569]">No subscription plans defined for this gym.</p>
                )}
              </div>

              {/* Gym Images */}
              {viewOwner.gymId?.images && viewOwner.gymId.images.length > 0 && (
                <div>
                  <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Gym Images</h3>
                  <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {viewOwner.gymId.images.map((url: string, i: number) => (
                        <img key={i} src={url} alt={`Gym Image ${i+1}`} className="w-full h-24 object-cover rounded-lg border border-[#CCFBF1]" />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Gym Details */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Gym Information</h3>
                {viewOwner.gymId?.logo && (
                  <div className="mb-4">
                    <img src={viewOwner.gymId.logo} alt={viewOwner.gymId.name} className="w-full h-40 object-cover rounded-xl border border-[#CCFBF1]" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-[#475569] mb-1">Gym Name</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.gymId?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Gym Type</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.gymId?.gymType || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Gym Status</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                      viewOwner.gymId?.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                      viewOwner.gymId?.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                      viewOwner.gymId?.status === 'SUSPENDED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                      'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>{viewOwner.gymId?.status || 'PENDING'}</span>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Rating</p>
                    <p className="font-medium text-[#1E293B]">⭐ {viewOwner.gymId?.rating || 'N/A'} {viewOwner.gymId?.reviewCount ? `(${viewOwner.gymId.reviewCount} reviews)` : ''}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Gym Email</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.gymId?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Gym Phone</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.gymId?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Location & Operations */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Location & Operations</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div className="col-span-2">
                    <p className="text-[#475569] mb-1">Address</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.gymId?.location?.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">City</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.gymId?.location?.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">State</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.gymId?.location?.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">PIN Code</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.gymId?.location?.pinCode || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Approx. Members</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.gymId?.memberCapacity || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Num Trainers</p>
                    <p className="font-medium text-[#1E293B]">{viewOwner.gymId?.trainerCapacity || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Equipment</h3>
                {viewOwner.gymId?.equipment && viewOwner.gymId.equipment.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewOwner.gymId.equipment.map((eq: any, i: number) => (
                      <div key={i} className="bg-[#FFFFFF] p-3 rounded-lg border border-[#CCFBF1]">
                        <p className="text-sm font-medium text-[#1E293B]">{eq.name} <span className="text-[#475569] text-xs">x{eq.quantity}</span></p>
                        <p className="text-xs text-[#475569] mt-1">{eq.category} • {eq.condition} • {eq.availability}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#475569]">No equipment listed.</p>
                )}
              </div>

              {/* AC Details & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">AC Details</h3>
                  <div className="text-sm">
                    <p className="mb-1"><span className="text-[#475569]">Type:</span> <span className="text-[#1E293B] font-medium">{viewOwner.gymId?.acDetails?.type || 'Not Specified'}</span></p>
                    {viewOwner.gymId?.acDetails?.areas && viewOwner.gymId.acDetails.areas.length > 0 && (
                      <p><span className="text-[#475569]">Areas:</span> <span className="text-[#1E293B] font-medium">{viewOwner.gymId.acDetails.areas.join(', ')}</span></p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Facilities</h3>
                  {viewOwner.gymId?.facilities && viewOwner.gymId.facilities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {viewOwner.gymId.facilities.map((f: string, i: number) => (
                        <span key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] text-xs px-2.5 py-1 rounded-md">{f}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#475569]">No facilities selected.</p>
                  )}
                </div>
              </div>





            </div>
            
            <div className="mt-8 flex justify-end sticky bottom-0 bg-[#FFFFFF] py-2 border-t border-[#CCFBF1]">
              <button 
                onClick={() => setViewOwner(null)}
                className="px-4 py-2 bg-[#E2E8F0] text-white rounded-lg hover:bg-[#333] transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Owner Modal */}
      {editOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0FDFA]/90 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-[#FFFFFF] py-3 z-20 border-b border-[#CCFBF1] mb-6">
              <h2 className="text-xl font-bold text-[#1E293B]">Edit Gym Owner</h2>
              <button 
                onClick={() => setEditOwner(null)}
                className="p-1 text-[#475569] hover:text-[#16A34A] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Account Information */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-3">Owner Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">First Name</label>
                    <input 
                      value={editForm.firstName || ''} 
                      onChange={e => setEditForm({...editForm, firstName: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Last Name</label>
                    <input 
                      value={editForm.lastName || ''} 
                      onChange={e => setEditForm({...editForm, lastName: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Email</label>
                    <input 
                      value={editForm.email || ''} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Mobile</label>
                    <input 
                      value={editForm.mobile || ''} 
                      onChange={e => setEditForm({...editForm, mobile: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-[#475569] mb-2">City</label>
                    <input 
                      value={editForm.city || ''} 
                      onChange={e => setEditForm({...editForm, city: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Gym Details */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-3">Gym Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Gym Name</label>
                    <input 
                      value={editForm.gymData?.name || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, name: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Gym Type</label>
                    <input 
                      value={editForm.gymData?.gymType || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, gymType: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Gym Email</label>
                    <input 
                      value={editForm.gymData?.email || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, email: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Gym Phone</label>
                    <input 
                      value={editForm.gymData?.phone || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, phone: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Operations */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-3">Location & Operations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-[#475569] mb-2">Address</label>
                    <input 
                      value={editForm.gymData?.location?.address || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, address: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">City</label>
                    <input 
                      value={editForm.gymData?.location?.city || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, city: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">State</label>
                    <input 
                      value={editForm.gymData?.location?.state || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, state: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">PIN Code</label>
                    <input 
                      value={editForm.gymData?.location?.pinCode || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, pinCode: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Approx. Members</label>
                    <input 
                      type="number"
                      value={editForm.gymData?.memberCapacity || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, memberCapacity: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Number of Trainers</label>
                    <input 
                      type="number"
                      value={editForm.gymData?.trainerCapacity || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, trainerCapacity: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                </div>
              </div>

            </div>
            
            <div className="mt-8 flex justify-end space-x-3 sticky bottom-0 bg-[#FFFFFF] py-2 border-t border-[#CCFBF1]">
              <button 
                onClick={() => setEditOwner(null)}
                className="px-4 py-2 border border-[#CCFBF1] text-white rounded-lg hover:bg-[#202020] transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-4 py-2 bg-[#16A34A] text-white rounded-lg hover:bg-[#15803D] transition-colors text-sm font-semibold flex items-center space-x-2"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminGymOwners;
