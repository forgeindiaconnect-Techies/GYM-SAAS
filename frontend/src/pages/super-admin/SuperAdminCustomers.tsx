import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Phone, Mail, User, UserPlus, Eye, X, Clock, CheckCircle, XCircle, ShieldAlert, Users, Trash2, Download, FileText, Table as TableIcon } from 'lucide-react';
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
  lastLogin?: string;
  subscriptionExpiry?: string;
  createdAt: string;
}

const TABS = [
  { id: 'ALL', label: 'All Customers', icon: Users },
  { id: 'NEW', label: 'New', icon: UserPlus },
  { id: 'APPROVED', label: 'Active', icon: CheckCircle },
  { id: 'SUSPENDED', label: 'Inactive', icon: XCircle },
  { id: 'PENDING', label: 'Pending', icon: Clock },
  { id: 'REJECTED', label: 'Rejected', icon: ShieldAlert },
];

const SuperAdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modals state
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

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

  const filteredCustomers = customers.filter(c => {
    let matchesTab = false;
    if (activeTab === 'ALL') {
      matchesTab = true;
    } else if (activeTab === 'NEW') {
      matchesTab = (new Date().getTime() - new Date(c.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
    } else {
      matchesTab = c.approvalStatus === activeTab;
    }
    
    const matchesSearch = c.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getFormattedStatus = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Active';
      case 'SUSPENDED': return 'Inactive';
      case 'PENDING': return 'Pending';
      case 'REJECTED': return 'Rejected';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20';
      case 'REJECTED': return 'bg-[#FED7AA]/10 text-[#FED7AA] border-[#FED7AA]/20';
      case 'SUSPENDED': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#292524]">Customer Details</h1>
          <p className="text-[#78716C] text-sm mt-1">Manage all registered members and their approval statuses.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-[#E7E5E4] pb-2 overflow-x-auto custom-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#F97316] text-[#F97316] bg-[#F97316]/10'
                : 'border-transparent text-[#78716C] hover:text-[#292524] hover:bg-[#FFFFFF]'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            <span className="bg-[#FED7AA] text-xs px-2 py-0.5 rounded-full ml-2 text-[#292524]">
              {tab.id === 'ALL' ? customers.length : 
               tab.id === 'NEW' ? customers.filter(c => (new Date().getTime() - new Date(c.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000).length :
               customers.filter(c => c.approvalStatus === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[250px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg hover:bg-[#FED7AA] transition-colors text-sm font-medium"
          >
            <Download size={16} className="text-[#F97316]" />
            <span>Download Report</span>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg shadow-xl z-10 py-1 overflow-hidden">
              <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-[#292524] hover:bg-[#FED7AA] flex items-center space-x-2">
                <FileText size={14} className="text-red-400" /><span>PDF Document</span>
              </button>
              <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 text-sm text-[#292524] hover:bg-[#FED7AA] flex items-center space-x-2">
                <TableIcon size={14} className="text-green-400" /><span>Excel Spreadsheet</span>
              </button>
              <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-2 text-sm text-[#292524] hover:bg-[#FED7AA] flex items-center space-x-2">
                <FileText size={14} className="text-blue-400" /><span>Word Document</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#78716C]">
            <Loader2 size={32} className="animate-spin mb-4 text-[#F97316]" />
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#FED7AA]">
            <AlertCircle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#78716C]">
            <User size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-[#292524] mb-1">No customers found</p>
            <p className="text-sm text-center max-w-md">There are no customers matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#78716C] uppercase bg-[#FFFFFF] border-b border-[#E7E5E4]">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Gym / Branch</th>
                  <th className="px-6 py-4 font-medium">Plan / Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-[#FFFDF8] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#FED7AA] flex items-center justify-center text-[#EF4444] font-bold">
                          {customer.firstName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-[#292524]">{customer.firstName} {customer.lastName}</div>
                          <div className="text-xs text-[#78716C]">Member</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[#78716C]">
                          <Mail size={14} />
                          <span className="truncate max-w-[150px]">{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#78716C]">
                          <Phone size={14} />
                          <span>{customer.mobile}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#292524]">{customer.gymId?.name || 'No Gym'}</div>
                      <div className="text-xs text-[#78716C]">{customer.branchId?.name || 'Local'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#292524]">{customer.subscriptionPlan || 'No Plan'}</div>
                      <div className={`text-xs font-bold ${customer.paymentStatus === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>
                        {customer.paymentStatus || 'PENDING'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(customer.approvalStatus)}`}>
                        {getFormattedStatus(customer.approvalStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View, Delete buttons */}
                        <div className="flex items-center justify-end space-x-1">
                          <button 
                            onClick={() => setViewCustomer(customer)}
                            className="p-1.5 text-[#78716C] hover:text-[#292524] hover:bg-[#FED7AA] rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(customer._id)}
                            className="p-1.5 text-[#78716C] hover:text-[#FED7AA] hover:bg-red-500/10 rounded-md transition-colors"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-[#FFFFFF] shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#292524]">Customer Details</h2>
                <p className="text-xs text-[#78716C] mt-0.5">Comprehensive profile and subscription information</p>
              </div>
              <button 
                onClick={() => setViewCustomer(null)}
                className="p-1.5 text-[#78716C] hover:text-[#F97316] hover:bg-[#FFFDF8] rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
              {/* Account Details */}
              <div>
                <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider mb-3">Account Details</h3>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">First Name</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.firstName || '—'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Last Name</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.lastName || '—'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Email</span>
                      <span className="font-semibold text-sm text-[#292524] break-all">{viewCustomer.email || '—'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Mobile</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.mobile || '—'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Account Status</span>
                      <span className="inline-flex items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(viewCustomer.approvalStatus)}`}>
                          {viewCustomer.approvalStatus}
                        </span>
                      </span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Joined Date & Time</span>
                      <span className="font-semibold text-sm text-[#292524]">
                        {new Date(viewCustomer.createdAt).toLocaleDateString()} at {new Date(viewCustomer.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Last Login</span>
                      <span className="font-semibold text-sm text-[#292524]">
                        {viewCustomer.lastLogin ? (
                          <>{new Date(viewCustomer.lastLogin).toLocaleDateString()} at {new Date(viewCustomer.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</>
                        ) : (
                          'Never'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription / Access Details */}
              <div>
                <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider mb-3">Platform Access Details</h3>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Current Plan</span>
                      <span className="font-bold text-sm text-[#F97316] flex items-center gap-1.5">
                        Pro Plan <span className="bg-[#F97316]/10 text-[#F97316] text-[10px] px-1.5 py-0.5 rounded font-bold">Monthly</span>
                      </span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Access Status</span>
                      <span className="inline-flex items-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          ACTIVE
                        </span>
                      </span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Subscription Start</span>
                      <span className="font-semibold text-sm text-[#292524]">
                        {new Date(viewCustomer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Subscription Expiry</span>
                      <span className="font-semibold text-sm text-red-600">
                        {viewCustomer.subscriptionExpiry ? (
                          new Date(viewCustomer.subscriptionExpiry).toLocaleDateString()
                        ) : (
                          'Active / Never Expires'
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Amount Paid</span>
                      <span className="font-bold text-sm text-[#F97316]">₹999</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Payment Method</span>
                      <span className="font-semibold text-sm text-[#292524]">PhonePe / UPI</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Billing Cycle</span>
                      <span className="font-semibold text-sm text-[#292524]">1 Month</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Invoice Status</span>
                      <span className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block w-fit">Paid</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider mb-3">Personal Details</h3>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Date of Birth</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.dateOfBirth ? new Date(viewCustomer.dateOfBirth).toLocaleDateString() : 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Gender</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.gender || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Height (cm)</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.height ? `${viewCustomer.height} cm` : 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Weight (kg)</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.weight ? `${viewCustomer.weight} kg` : 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center sm:col-span-2">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">City</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.city || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">PIN Code</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.pinCode || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Profile Completeness</span>
                      <span className="font-bold text-xs text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded-full inline-block w-fit">95% Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fitness Details */}
              <div>
                <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider mb-3">Fitness Preferences</h3>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Fitness Goal</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.fitnessGoal || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Experience Level</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.experienceLevel || 'Intermediate'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Preferred Training</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.preferredTraining || 'General Fitness'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Preferred Time</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewCustomer.preferredWorkoutTime || 'Morning'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3.5 bg-[#F8FAF9] border-t border-[#E7E5E4] flex items-center justify-end shrink-0">
              <button 
                onClick={() => setViewCustomer(null)}
                className="px-5 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors text-sm font-semibold shadow-sm"
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

export default SuperAdminCustomers;
