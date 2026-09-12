import { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle, Phone, Mail, Building2, Eye, CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import api from '../../utils/api';

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
    memberCapacity?: number;
    trainerCapacity?: number;
    location: {
      address: string;
      city: string;
      state: string;
      pinCode: string;
    };
  };
}

const TABS = [
  { id: 'PENDING', label: 'Pending', icon: Clock },
  { id: 'APPROVED', label: 'Approved', icon: CheckCircle },
  { id: 'REJECTED', label: 'Rejected', icon: XCircle },
  { id: 'SUSPENDED', label: 'Suspended', icon: ShieldAlert },
];

const SuperAdminGymApprovals = () => {
  const [owners, setOwners] = useState<GymOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('PENDING');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Modals state
  const [viewOwner, setViewOwner] = useState<GymOwner | null>(null);
  const [actionModal, setActionModal] = useState<{ id: string, status: string } | null>(null);
  const [actionReason, setActionReason] = useState('');

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
      setError(err.response?.data?.message || 'Failed to fetch gym applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string, reason?: string) => {
    try {
      setStatusUpdating(id);
      await api.put(`/users/${id}/status`, { status: newStatus, reason });
      setOwners(owners.map(o => o._id === id ? { ...o, approvalStatus: newStatus } : o));
      setActionModal(null);
      setActionReason('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const filteredOwners = owners.filter(o => 
    o.approvalStatus === activeTab &&
    (
      o.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.gymId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Gym Approvals</h1>
          <p className="text-[#475569] text-sm mt-1">Manage gym statuses and review applications.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-[#CCFBF1] pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 ${
              activeTab === tab.id
                ? 'border-[#16A34A] text-[#16A34A] bg-[#16A34A]/10'
                : 'border-transparent text-[#475569] hover:text-[#1E293B] hover:bg-[#FFFFFF]'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            <span className="bg-[#E2E8F0] text-xs px-2 py-0.5 rounded-full ml-2 text-[#1E293B]">
              {owners.filter(o => o.approvalStatus === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[250px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input 
            type="text" 
            placeholder="Search by gym name, owner name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
          />
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#475569]">
            <Loader2 size={32} className="animate-spin mb-4 text-[#16A34A]" />
            <p>Loading gyms...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#0D9488]">
            <AlertCircle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#475569]">
            <Building2 size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-[#1E293B] mb-1">No gyms found</p>
            <p className="text-sm text-center max-w-md">There are no gyms in the {activeTab} status matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#475569] uppercase bg-[#FFFFFF] border-b border-[#CCFBF1]">
                <tr>
                  <th className="px-6 py-4 font-medium">Gym Name</th>
                  <th className="px-6 py-4 font-medium">Owner & Contact</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCFBF1]">
                {filteredOwners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#1E293B]">{owner.gymId?.name || 'Not provided'}</div>
                      <div className="text-xs text-[#475569] mt-1">{owner.gymId?.gymType || 'Unspecified Type'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-[#1E293B] font-medium mb-1">
                        <div className="w-6 h-6 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#16A34A] text-xs">
                          {owner.firstName[0]}
                        </div>
                        <span>{owner.firstName} {owner.lastName}</span>
                      </div>
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center space-x-2 text-[#475569] text-xs">
                          <Mail size={12} />
                          <span className="truncate max-w-[150px]">{owner.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#475569] text-xs">
                          <Phone size={12} />
                          <span>{owner.mobile}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#475569]">
                      {owner.gymId?.location?.city ? (
                        <div className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{owner.gymId.location.city}{owner.gymId.location.state ? `, ${owner.gymId.location.state}` : ''}</span>
                        </div>
                      ) : (
                        <span className="text-[#555]">Not provided</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#475569]">
                      {new Date(owner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => setViewOwner(owner)}
                          className="p-1.5 text-[#475569] hover:text-[#1E293B] hover:bg-[#E2E8F0] rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {/* Quick Action Buttons depending on current tab */}
                        {activeTab === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(owner._id, 'APPROVED')}
                              disabled={statusUpdating === owner._id}
                              className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => setActionModal({ id: owner._id, status: 'REJECTED' })}
                              disabled={statusUpdating === owner._id}
                              className="p-1.5 text-[#0D9488] hover:bg-[#0D9488]/10 rounded-md transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        
                        {(activeTab === 'APPROVED' || activeTab === 'REJECTED') && (
                          <button 
                            onClick={() => setActionModal({ id: owner._id, status: 'SUSPENDED' })}
                            disabled={statusUpdating === owner._id}
                            className="p-1.5 text-orange-500 hover:bg-orange-500/10 rounded-md transition-colors disabled:opacity-50"
                            title="Suspend"
                          >
                            <ShieldAlert size={18} />
                          </button>
                        )}
                        
                        {activeTab === 'SUSPENDED' && (
                          <button 
                            onClick={() => handleStatusChange(owner._id, 'APPROVED')}
                            disabled={statusUpdating === owner._id}
                            className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-md transition-colors disabled:opacity-50"
                            title="Restore (Approve)"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-[#FFFFFF] py-2 z-10 border-b border-[#CCFBF1] mb-6">
              <h2 className="text-xl font-bold text-[#1E293B]">Gym Details</h2>
              <button 
                onClick={() => setViewOwner(null)}
                className="text-[#475569] hover:text-[#1E293B]"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="space-y-8 text-sm">
              {/* Gym Details */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Gym Information</h3>
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

      {/* Action Reason Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-xl max-w-md w-full border border-[#CCFBF1] overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1E293B] mb-2">
                {actionModal.status === 'REJECTED' ? 'Reject Application' : 'Suspend Account'}
              </h3>
              <p className="text-[#475569] text-sm mb-4">
                Please provide a reason. This will be visible to the gym owner.
              </p>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-lg px-4 py-3 text-[#1E293B] focus:outline-none focus:border-[#16A34A] min-h-[100px]"
                placeholder={`Reason for ${actionModal.status.toLowerCase()}...`}
              />
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => { setActionModal(null); setActionReason(''); }}
                  className="px-4 py-2 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] hover:bg-[#333] transition-colors rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusChange(actionModal.id, actionModal.status, actionReason)}
                  disabled={!actionReason.trim() || statusUpdating === actionModal.id}
                  className="px-4 py-2 bg-[#16A34A] text-white hover:bg-[#15803D] transition-colors rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  {statusUpdating === actionModal.id ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminGymApprovals;
