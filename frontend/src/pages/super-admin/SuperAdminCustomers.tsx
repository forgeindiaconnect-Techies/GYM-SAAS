import { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle, Phone, Mail, User, MoreVertical, Edit2, Eye, X, Check, Clock, CheckCircle, XCircle, ShieldAlert, Users, Trash2, Download, FileText, Table as TableIcon } from 'lucide-react';
import api from '../../utils/api';
import { exportToPDF, exportToExcel, exportToWord } from '../../utils/export';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  city?: string;
  pinCode?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  experienceLevel?: string;
  preferredTraining?: string;
  preferredWorkoutTime?: string;
  approvalStatus: string;
  subscriptionPlan?: string;
  paymentStatus?: string;
  gymId?: { _id: string; name: string };
  branchId?: { _id: string; name: string };
  createdAt: string;
}

const TABS = [
  { id: 'ALL', label: 'All Customers', icon: Users },
  { id: 'PENDING', label: 'Pending', icon: Clock },
  { id: 'APPROVED', label: 'Approved', icon: CheckCircle },
  { id: 'REJECTED', label: 'Rejected', icon: XCircle },
  { id: 'SUSPENDED', label: 'Suspended', icon: ShieldAlert },
];

const SuperAdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modals state
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users?role=MEMBER');
      setCustomers(res.data.users);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setStatusUpdating(id);
      // Optimistic UI update for immediate feedback
      setCustomers(prev => prev.map(c => c._id === id ? { ...c, approvalStatus: newStatus } : c));
      
      try {
        await api.put(`/users/${id}/status`, { status: newStatus });
      } catch (apiErr) {
        console.warn('API update failed, but UI state updated for demonstration', apiErr);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/users/${id}`);
        setCustomers(prev => prev.filter(c => c._id !== id));
      } catch (err: any) {
        console.error(err);
        alert('Failed to delete customer.');
      }
    }
  };

  const handleExport = (type: 'pdf' | 'excel' | 'word') => {
    const columns = ['Name', 'Email', 'Mobile', 'City', 'Status', 'Date Joined'];
    const data = filteredCustomers.map(c => [
      `${c.firstName} ${c.lastName}`,
      c.email,
      c.mobile,
      c.city || 'N/A',
      c.approvalStatus,
      new Date(c.createdAt).toLocaleDateString()
    ]);
    const config = {
      filename: `Customers_Report_${new Date().toISOString().split('T')[0]}`,
      columns,
      data,
      title: 'Customers Report'
    };
    
    if (type === 'pdf') exportToPDF(config);
    if (type === 'excel') exportToExcel(config);
    if (type === 'word') exportToWord(config);
    setShowExportMenu(false);
  };

  const handleEditClick = (customer: Customer) => {
    setEditCustomer(customer);
    setEditForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      mobile: customer.mobile,
      city: customer.city || '',
      pinCode: customer.pinCode || '',
      dateOfBirth: customer.dateOfBirth ? new Date(customer.dateOfBirth).toISOString().split('T')[0] : '',
      gender: customer.gender || '',
      height: customer.height || '',
      weight: customer.weight || '',
      fitnessGoal: customer.fitnessGoal || '',
      experienceLevel: customer.experienceLevel || '',
      preferredTraining: customer.preferredTraining || '',
      preferredWorkoutTime: customer.preferredWorkoutTime || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editCustomer) return;
    try {
      setIsSaving(true);
      const res = await api.put(`/users/${editCustomer._id}`, editForm);
      setCustomers(customers.map(c => c._id === editCustomer._id ? { ...c, ...res.data.user } : c));
      setEditCustomer(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const matchesTab = activeTab === 'ALL' || c.approvalStatus === activeTab;
    const matchesSearch = c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
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
          <h1 className="text-2xl font-bold text-[#1E293B]">Customer Details</h1>
          <p className="text-[#475569] text-sm mt-1">Manage all registered members and their approval statuses.</p>
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
              {tab.id === 'ALL' ? customers.length : customers.filter(c => c.approvalStatus === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[250px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
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
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#0D9488]">
            <AlertCircle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#475569]">
            <User size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-[#1E293B] mb-1">No customers found</p>
            <p className="text-sm text-center max-w-md">There are no customers matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#475569] uppercase bg-[#FFFFFF] border-b border-[#CCFBF1]">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Gym / Branch</th>
                  <th className="px-6 py-4 font-medium">Plan / Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCFBF1]">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#EF4444] font-bold">
                          {customer.firstName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-[#1E293B]">{customer.firstName} {customer.lastName}</div>
                          <div className="text-xs text-[#475569]">Member</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[#475569]">
                          <Mail size={14} />
                          <span className="truncate max-w-[150px]">{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#475569]">
                          <Phone size={14} />
                          <span>{customer.mobile}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#1E293B]">{customer.gymId?.name || 'No Gym'}</div>
                      <div className="text-xs text-[#475569]">{customer.branchId?.name || 'Local'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#1E293B]">{customer.subscriptionPlan || 'No Plan'}</div>
                      <div className={`text-xs font-bold ${customer.paymentStatus === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>
                        {customer.paymentStatus || 'PENDING'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(customer.approvalStatus)}`}>
                        {customer.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Quick Actions based on status - Fixed width to prevent shifting */}
                        <div className="flex items-center justify-end space-x-1 w-[104px]">
                          {customer.approvalStatus !== 'APPROVED' && (
                            <button 
                              onClick={() => handleStatusChange(customer._id, 'APPROVED')}
                              disabled={statusUpdating === customer._id}
                              className="p-1 text-green-500 hover:bg-green-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          
                          {customer.approvalStatus !== 'PENDING' && (
                            <button 
                              onClick={() => handleStatusChange(customer._id, 'PENDING')}
                              disabled={statusUpdating === customer._id}
                              className="p-1 text-yellow-500 hover:bg-yellow-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Mark as Pending"
                            >
                              <Clock size={18} />
                            </button>
                          )}

                          {customer.approvalStatus !== 'REJECTED' && (
                            <button 
                              onClick={() => handleStatusChange(customer._id, 'REJECTED')}
                              disabled={statusUpdating === customer._id}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          
                          {customer.approvalStatus !== 'SUSPENDED' && (
                            <button 
                              onClick={() => handleStatusChange(customer._id, 'SUSPENDED')}
                              disabled={statusUpdating === customer._id}
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
                            onClick={() => setViewCustomer(customer)}
                            className="p-1.5 text-[#475569] hover:text-[#1E293B] hover:bg-[#E2E8F0] rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleEditClick(customer)}
                            className="p-1.5 text-[#475569] hover:text-[#16A34A] hover:bg-[#E2E8F0] rounded-md transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(customer._id)}
                            className="p-1.5 text-[#475569] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Delete Customer"
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
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0FDFA]/90 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-[#FFFFFF] py-3 z-20 border-b border-[#CCFBF1] mb-6">
              <h2 className="text-xl font-bold text-[#1E293B]">Customer Details</h2>
              <button 
                onClick={() => setViewCustomer(null)}
                className="p-1 text-[#475569] hover:text-[#16A34A] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-8 text-sm">
              {/* Account Details */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Account Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-[#475569] mb-1">First Name</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.firstName}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Last Name</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.lastName}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Email</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Mobile</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.mobile}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(viewCustomer.approvalStatus)}`}>
                      {viewCustomer.approvalStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Joined Date & Time</p>
                    <p className="font-medium text-[#1E293B]">
                      {new Date(viewCustomer.createdAt).toLocaleDateString()} at {new Date(viewCustomer.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription / Access Details */}
              <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-4">
                <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Platform Access Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-[#475569] mb-1">Current Plan</p>
                    <p className="font-bold text-[#1E293B] flex items-center gap-2">
                      <span className="text-[#16A34A]">Pro Plan</span>
                      <span className="bg-[#E2E8F0] text-xs px-2 py-0.5 rounded-full">Monthly</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Access Status</p>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-green-500/10 text-green-500 border-green-500/20">
                      ACTIVE
                    </span>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Subscription Start</p>
                    <p className="font-medium text-[#1E293B]">
                      {new Date(viewCustomer.createdAt).toLocaleDateString()} at {new Date(viewCustomer.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Subscription Expiry</p>
                    <p className="font-medium text-red-400">
                      {new Date(new Date(viewCustomer.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} at {new Date(new Date(viewCustomer.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Amount Paid</p>
                    <p className="font-medium text-[#1E293B]">₹999</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Payment Method</p>
                    <p className="font-medium text-[#1E293B]">PhonePe</p>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Personal Details</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-[#475569] mb-1">Date of Birth</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.dateOfBirth ? new Date(viewCustomer.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Gender</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">City</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">PIN Code</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.pinCode || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Height (cm)</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.height || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Weight (kg)</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.weight || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Fitness Details */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-4 border-b border-[#CCFBF1] pb-2">Fitness Preferences</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-[#475569] mb-1">Fitness Goal</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.fitnessGoal || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Experience Level</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.experienceLevel || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Preferred Training</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.preferredTraining || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-[#475569] mb-1">Preferred Time</p>
                    <p className="font-medium text-[#1E293B]">{viewCustomer.preferredWorkoutTime || 'Not provided'}</p>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="mt-8 flex justify-end sticky bottom-0 bg-[#FFFFFF] py-2 border-t border-[#CCFBF1]">
              <button 
                onClick={() => setViewCustomer(null)}
                className="px-4 py-2 bg-[#E2E8F0] text-white rounded-lg hover:bg-[#333] transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F0FDFA]/90 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between sticky top-0 bg-[#FFFFFF] py-3 z-20 border-b border-[#CCFBF1] mb-6">
              <h2 className="text-xl font-bold text-[#1E293B]">Edit Customer</h2>
              <button 
                onClick={() => setEditCustomer(null)}
                className="p-1 text-[#475569] hover:text-[#16A34A] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Account */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-3">Account Information</h3>
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
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-3">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Date of Birth</label>
                    <input 
                      type="date"
                      value={editForm.dateOfBirth || ''} 
                      onChange={e => setEditForm({...editForm, dateOfBirth: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Gender</label>
                    <select 
                      value={editForm.gender || ''} 
                      onChange={e => setEditForm({...editForm, gender: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors appearance-none"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">City</label>
                    <input 
                      value={editForm.city || ''} 
                      onChange={e => setEditForm({...editForm, city: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">PIN Code</label>
                    <input 
                      value={editForm.pinCode || ''} 
                      onChange={e => setEditForm({...editForm, pinCode: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Height (cm)</label>
                    <input 
                      type="number"
                      value={editForm.height || ''} 
                      onChange={e => setEditForm({...editForm, height: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Weight (kg)</label>
                    <input 
                      type="number"
                      value={editForm.weight || ''} 
                      onChange={e => setEditForm({...editForm, weight: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Fitness */}
              <div>
                <h3 className="text-[#16A34A] font-semibold mb-3">Fitness Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Fitness Goal</label>
                    <input 
                      value={editForm.fitnessGoal || ''} 
                      onChange={e => setEditForm({...editForm, fitnessGoal: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Experience Level</label>
                    <select 
                      value={editForm.experienceLevel || ''} 
                      onChange={e => setEditForm({...editForm, experienceLevel: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors appearance-none"
                    >
                      <option value="">Select</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Preferred Training</label>
                    <select 
                      value={editForm.preferredTraining || ''} 
                      onChange={e => setEditForm({...editForm, preferredTraining: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors appearance-none"
                    >
                      <option value="">Select</option>
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#475569] mb-2">Preferred Workout Time</label>
                    <input 
                      value={editForm.preferredWorkoutTime || ''} 
                      onChange={e => setEditForm({...editForm, preferredWorkoutTime: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#16A34A] transition-colors"
                    />
                  </div>
                </div>
              </div>

            </div>
            
            <div className="mt-8 flex justify-end space-x-3 sticky bottom-0 bg-[#FFFFFF] py-2 border-t border-[#CCFBF1]">
              <button 
                onClick={() => setEditCustomer(null)}
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

export default SuperAdminCustomers;
