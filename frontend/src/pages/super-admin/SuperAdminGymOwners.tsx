import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Phone, Mail, Building2, Eye, Edit2, X, Check, Users, Clock, CheckCircle, XCircle, ShieldAlert, Trash2, Download, FileText, Table as TableIcon, Star, Plus, MapPin, CreditCard } from 'lucide-react';
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
  branches?: any[];
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
    operatingHours?: string;
    trainingMode?: string;
    services?: string[];
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
  STARTER: {
    name: 'Starter',
    price: '₹999 / 1 Month',
    features: ['1 gym location', 'Up to 100 members', 'Up to 3 trainers', 'Member registration', 'Attendance tracking', 'Membership & fee management', 'Basic reports', 'Basic AI workout plan']
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: '₹2,499 / 1 Month',
    features: ['1 gym location', 'Up to 500 members', 'Up to 15 trainers', 'Everything in Starter', 'Advanced AI workout & diet plans', 'Trainer allocation', 'Online session booking', 'AI chatbot', 'Revenue analytics']
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: '₹5,999 / 1 Month',
    features: ['Multiple branches Up to 2', '1000 members', 'Up to 50 trainers', 'Branch-wise reports', 'Advanced AI features', 'Staff permissions', 'Workout video library', 'Priority support']
  },
  FREE_TRIAL: {
    name: 'Free Trial',
    price: '₹0 / 1 Day',
    features: ['Gym Setup', 'Member Management (Up to 10)', 'Trainer Management (1 Trainer)', 'Membership Plans (1 Plan)', 'Exercise Plans', 'Basic Diet Plans', 'Limited AI Suggestions']
  },
  SILVER: {
    name: 'Silver',
    price: '₹799 / 1 Month',
    features: ['Gym Setup', 'Member Management (Up to 100)', 'Trainer Management (Up to 5)', 'Membership Plans (5 Plans)', 'Exercise & Diet Plans', 'AI Suggestions', 'Reports & Analytics']
  },
  GOLD: {
    name: 'Gold',
    price: '₹1,499 / 1 Month',
    features: ['Everything in Silver', 'Advanced AI Workout & Diet Plans', 'AI Fitness Assistant', 'Goal-Based Workout Recs', 'Trainer Discovery & Booking', 'Trainer Scheduling', 'Detailed Progress Analytics', 'Revenue & Membership Analytics']
  },
  PREMIUM: {
    name: 'Premium',
    price: '₹2,499 / 1 Month',
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
  },
  BASIC: {
    name: 'Basic',
    price: '₹399 / 1 Month',
    features: ['Gym Setup', 'Member Management (Up to 100)', 'Trainer Management (Up to 5)', 'Membership Plans (5 Plans)', 'Exercise & Diet Plans', 'AI Suggestions', 'Reports & Analytics']
  }
};

const defaultBranchPlans = [
  { 
    name: 'Starter Free', 
    price: '0', 
    annualPrice: '0',
    duration: 'Monthly', 
    features: '1 branch • 50 members • 3 trainers • 5 AI analyses • 3 AI workout generations • Basic chatbot • Basic attendance • Basic reports' 
  },
  { 
    name: 'Growth Plan', 
    price: '2999', 
    annualPrice: '29990',
    duration: 'Monthly', 
    features: 'Up to 3 branches • Up to 1,000 members • 15 trainers • Complete billing • Session booking • Online sessions • AI workout recs' 
  },
  { 
    name: 'Pro Plan', 
    price: '5999', 
    annualPrice: '59990',
    duration: 'Monthly', 
    features: 'Unlimited branches • Unlimited members • Unlimited trainers • All-branch analytics • Advanced AI chatbot • Business insights' 
  }
];

const TABS = [
  { id: 'ALL', label: 'All Owners', icon: Users },
  { id: 'PENDING', label: 'Pending', icon: Clock },
  { id: 'APPROVED', label: 'Approved', icon: CheckCircle },
  { id: 'REJECTED', label: 'Rejected', icon: XCircle },
  { id: 'SUSPENDED', label: 'Suspended', icon: ShieldAlert },
];

const GYM_TYPES = ['Commercial', 'Boutique', 'CrossFit', 'Yoga Studio', 'Martial Arts', 'Other'];
const ALL_SERVICES = [
  'Gym Membership', 'Strength Training', 'Cardio', 'CrossFit & HIIT',
  'Yoga & Pilates', 'Zumba / Aerobics', 'Personal Training', 'Steam & Sauna',
  'Nutrition Consultation', 'Physiotherapy', 'Locker Room', 'Group Classes',
  'Live Online Classes', '1-on-1 Virtual Training', 'On-Demand Workouts'
];
const AC_TYPES = ['Fully AC', 'Partially AC', 'Non-AC', 'AC + Non-AC Sections'];
const COMMON_FACILITIES = [
  'Drinking Water', 'Wi-Fi', 'Parking', 'CCTV', 'First Aid',
  'Locker Rooms', 'Showers', 'Changing Rooms', 'Cafeteria', 'Music System'
];
const COMMON_AC_AREAS = [
  'Cardio Section', 'Weight Training Area', 'Locker Rooms',
  'CrossFit Zone', 'Yoga Studio', 'Reception', 'All Areas'
];

const formatDate = (dateInput?: string | Date | null): string => {
  if (!dateInput || dateInput === 'N/A') return 'N/A';
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, monthNum, day] = dateInput.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[parseInt(monthNum, 10) - 1] || monthNum;
    return `${day} ${month} ${year}`;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'N/A';
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

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
  const [viewBranch, setViewBranch] = useState<any | null>(null);
  const [editOwner, setEditOwner] = useState<GymOwner | null>(null);
  const [viewSubscription, setViewSubscription] = useState<GymOwner | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Edit form auxiliary inputs
  const [newServiceInput, setNewServiceInput] = useState('');
  const [newFacilityInput, setNewFacilityInput] = useState('');
  const [newImageInput, setNewImageInput] = useState('');

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const [res, subsRes, branchesRes] = await Promise.all([
        api.get('/users?role=GYM_OWNER'),
        api.get('/subscriptions/all').catch(() => ({ data: { subscriptions: [] } })),
        api.get('/branches').catch(() => ({ data: { branches: [] } }))
      ]);
      
      const users = res.data.users || [];
      const subscriptions = subsRes.data.subscriptions || [];
      const allBranches = branchesRes.data.branches || [];
      
      const mergedUsers = users.map((u: any) => {
        const sub = subscriptions.find((s: any) => s.userId === u._id);
        const userGymId = u.gymId?._id?.toString() || u.gymId?.toString();
        const ownerBranches = (u.branches && u.branches.length > 0) 
          ? u.branches 
          : allBranches.filter((b: any) => {
              const bGymId = b.gymId?._id?.toString() || b.gymId?.toString();
              return bGymId === userGymId;
            });

        const hasActiveSub = sub?.status?.toUpperCase() === 'ACTIVE';
        const hasPendingSub = sub?.status?.toUpperCase() === 'PENDING';
        const subPlanKey = (sub?.plan || u.subscriptionPlan || '').toUpperCase();

        return {
          ...u,
          branches: ownerBranches,
          subscriptionPlan: subPlanKey || u.subscriptionPlan,
          billingCycle: sub?.billing || u.billingCycle,
          paymentStatus: hasActiveSub ? 'Paid' : hasPendingSub ? 'Pending' : (u.paymentStatus || 'Pending'),
          subscriptionStatus: hasActiveSub ? 'Active' : (u.subscriptionStatus === 'Active' && !hasActiveSub ? 'Pending' : (u.subscriptionStatus || 'Pending')),
          subscriptionStart: sub?.start || u.subscriptionStartDate,
          subscriptionExpiry: sub?.renewal || u.subscriptionExpiry,
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
      // Revert optimistic update on error
      await fetchOwners();
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleBranchStatusChange = async (branchId: string, newStatus: string) => {
    try {
      setOwners(prev => prev.map(o => {
        if (!o.branches) return o;
        const hasBranch = o.branches.some((b: any) => b._id === branchId);
        if (!hasBranch) return o;
        return {
          ...o,
          branches: o.branches.map((b: any) => b._id === branchId ? { ...b, status: newStatus } : b)
        };
      }));

      if (viewBranch && viewBranch._id === branchId) {
        setViewBranch((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }

      if (viewOwner && viewOwner.branches) {
        setViewOwner((prev: any) => prev ? {
          ...prev,
          branches: prev.branches?.map((b: any) => b._id === branchId ? { ...b, status: newStatus } : b)
        } : null);
      }

      await api.put(`/branches/${branchId}/status`, { status: newStatus });
      alert(`Branch approval status updated to ${newStatus}!`);
      await fetchOwners();
    } catch (err: any) {
      console.error('Failed to update branch status:', err);
      alert(err.response?.data?.message || 'Failed to update branch status.');
      await fetchOwners();
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
    const columns = ['Name', 'Email', 'Mobile', 'Gym Name', 'Branches', 'City', 'Status', 'Date Joined'];
    const data = filteredOwners.map(o => [
      `${o.firstName} ${o.lastName}`,
      o.email,
      o.mobile,
      o.gymId?.name || 'N/A',
      o.branches && o.branches.length > 0 ? o.branches.map((b: any) => b.branchName).join(', ') : 'Main Gym Only',
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

  const toggleService = (service: string) => {
    const current = editForm.gymData?.services || [];
    const updated = current.includes(service)
      ? current.filter((s: string) => s !== service)
      : [...current, service];
    setEditForm({ ...editForm, gymData: { ...editForm.gymData, services: updated } });
  };

  const addCustomService = () => {
    if (!newServiceInput.trim()) return;
    const current = editForm.gymData?.services || [];
    if (!current.includes(newServiceInput.trim())) {
      setEditForm({
        ...editForm,
        gymData: { ...editForm.gymData, services: [...current, newServiceInput.trim()] }
      });
    }
    setNewServiceInput('');
  };

  const toggleFacility = (facility: string) => {
    const current = editForm.gymData?.facilities || [];
    const updated = current.includes(facility)
      ? current.filter((f: string) => f !== facility)
      : [...current, facility];
    setEditForm({ ...editForm, gymData: { ...editForm.gymData, facilities: updated } });
  };

  const addCustomFacility = () => {
    if (!newFacilityInput.trim()) return;
    const current = editForm.gymData?.facilities || [];
    if (!current.includes(newFacilityInput.trim())) {
      setEditForm({
        ...editForm,
        gymData: { ...editForm.gymData, facilities: [...current, newFacilityInput.trim()] }
      });
    }
    setNewFacilityInput('');
  };

  const toggleAcArea = (area: string) => {
    const current = editForm.gymData?.acDetails?.areas || [];
    const updated = current.includes(area)
      ? current.filter((a: string) => a !== area)
      : [...current, area];
    setEditForm({
      ...editForm,
      gymData: {
        ...editForm.gymData,
        acDetails: { ...(editForm.gymData?.acDetails || { type: 'Non-AC' }), areas: updated }
      }
    });
  };

  const handleAddPlan = () => {
    const current = editForm.gymData?.subscriptionPlans || [];
    setEditForm({
      ...editForm,
      gymData: {
        ...editForm.gymData,
        subscriptionPlans: [
          ...current,
          { name: 'Standard Plan', price: 999, duration: '1 Month', features: '' }
        ]
      }
    });
  };

  const handlePlanChange = (index: number, field: string, value: any) => {
    const current = [...(editForm.gymData?.subscriptionPlans || [])];
    current[index] = { ...current[index], [field]: value };
    setEditForm({
      ...editForm,
      gymData: { ...editForm.gymData, subscriptionPlans: current }
    });
  };

  const handleDeletePlan = (index: number) => {
    const current = (editForm.gymData?.subscriptionPlans || []).filter((_: any, i: number) => i !== index);
    setEditForm({
      ...editForm,
      gymData: { ...editForm.gymData, subscriptionPlans: current }
    });
  };

  const handleAddImage = () => {
    if (!newImageInput.trim()) return;
    const current = editForm.gymData?.images || [];
    setEditForm({
      ...editForm,
      gymData: { ...editForm.gymData, images: [...current, newImageInput.trim()] }
    });
    setNewImageInput('');
  };

  const handleDeleteImage = (index: number) => {
    const current = (editForm.gymData?.images || []).filter((_: string, i: number) => i !== index);
    setEditForm({
      ...editForm,
      gymData: { ...editForm.gymData, images: current }
    });
  };

  const handleEditClick = (owner: GymOwner) => {
    setEditOwner(owner);
    setNewServiceInput('');
    setNewFacilityInput('');
    setNewImageInput('');
    setEditForm({
      firstName: owner.firstName || '',
      lastName: owner.lastName || '',
      email: owner.email || '',
      mobile: owner.mobile || '',
      city: owner.city || owner.gymId?.location?.city || '',
      subscriptionPlan: owner.subscriptionPlan || '',
      subscriptionExpiry: owner.subscriptionExpiry ? new Date(owner.subscriptionExpiry).toISOString().split('T')[0] : '',
      gymData: owner.gymId ? {
        name: owner.gymId.name || '',
        gymType: owner.gymId.gymType || 'Commercial',
        email: owner.gymId.email || owner.email || '',
        phone: owner.gymId.phone || owner.mobile || '',
        memberCapacity: owner.gymId.memberCapacity ?? '',
        trainerCapacity: owner.gymId.trainerCapacity ?? '',
        operatingHours: owner.gymId.operatingHours || '6 AM - 10 PM',
        trainingMode: owner.gymId.trainingMode || 'offline',
        rating: owner.gymId.rating ?? 5,
        logo: owner.gymId.logo || '',
        services: owner.gymId.services ? [...owner.gymId.services] : [],
        facilities: owner.gymId.facilities ? [...owner.gymId.facilities] : [],
        acDetails: owner.gymId.acDetails ? {
          type: owner.gymId.acDetails.type || 'Non-AC',
          areas: owner.gymId.acDetails.areas ? [...owner.gymId.acDetails.areas] : []
        } : { type: 'Non-AC', areas: [] },
        subscriptionPlans: owner.gymId.subscriptionPlans && owner.gymId.subscriptionPlans.length > 0 
          ? owner.gymId.subscriptionPlans.map((p: any) => ({
              name: p.name || '',
              price: p.price ?? '',
              duration: p.duration || '',
              features: p.features || ''
            }))
          : [],
        images: owner.gymId.images ? [...owner.gymId.images] : [],
        location: {
          address: owner.gymId.location?.address || '',
          city: owner.gymId.location?.city || owner.city || '',
          state: owner.gymId.location?.state || '',
          pinCode: owner.gymId.location?.pinCode || '',
        }
      } : {
        name: '',
        gymType: 'Commercial',
        email: owner.email || '',
        phone: owner.mobile || '',
        memberCapacity: '',
        trainerCapacity: '',
        operatingHours: '6 AM - 10 PM',
        trainingMode: 'offline',
        rating: 5,
        logo: '',
        services: [],
        facilities: [],
        acDetails: { type: 'Non-AC', areas: [] },
        subscriptionPlans: [],
        images: [],
        location: { address: '', city: owner.city || '', state: '', pinCode: '' }
      }
    });
  };

  const handleSaveEdit = async () => {
    if (!editOwner) return;
    try {
      setIsSaving(true);
      const res = await api.put(`/users/${editOwner._id}`, editForm);
      setOwners(owners.map(o => o._id === editOwner._id ? { ...o, ...res.data.user } : o));
      setEditOwner(null);
      await fetchOwners();
      alert('Gym owner details updated successfully!');
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
      case 'REJECTED': return 'bg-[#FED7AA]/10 text-[#FED7AA] border-[#FED7AA]/20';
      case 'SUSPENDED': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#292524]">Gym Owner Details</h1>
          <p className="text-[#78716C] text-sm mt-1">Manage all registered gym owners and their approval statuses.</p>
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
              {tab.id === 'ALL' ? owners.length : owners.filter(o => o.approvalStatus === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[250px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input 
            type="text" 
            placeholder="Search by name, gym or email..." 
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
            <p>Loading gym owners...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#FED7AA]">
            <AlertCircle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#78716C]">
            <Building2 size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-[#292524] mb-1">No gym owners found</p>
            <p className="text-sm text-center max-w-md">There are no gym owners matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#78716C] uppercase bg-[#F8FAF9] border-b-2 border-[#E7E5E4] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-medium">Gym & Owner</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Contact</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Branches</th>
                  <th className="px-6 py-4 font-medium">Plan & Billing</th>
                  <th className="px-6 py-4 font-medium">Sub & Payment</th>
                  <th className="px-6 py-4 font-medium">Start & Expiry</th>
                  <th className="px-5 py-3.5 font-semibold whitespace-nowrap">Approval</th>
                  <th className="px-5 py-3.5 font-semibold text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {filteredOwners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-[#FFFDF8] transition-colors align-middle">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#F97316]/20 to-[#F97316]/10 flex items-center justify-center text-[#F97316] font-bold text-sm border border-[#F97316]/20">
                          {owner.firstName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-[#292524]">{owner.firstName} {owner.lastName}</div>
                          <div className="text-xs font-semibold text-[#F97316]">{owner.gymId?.name || 'No Gym'}</div>
                          {owner.gymId?.location?.city && <div className="text-[10px] text-[#78716C]">{owner.gymId.location.city}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[#78716C]">
                          <Mail size={14} />
                          <span className="truncate max-w-[150px]">{owner.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#78716C]">
                          <Phone size={14} />
                          <span>{owner.mobile}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => setViewOwner(owner)}
                          className="flex items-center gap-1.5 font-bold text-xs text-[#292524] hover:text-[#F97316] transition-colors cursor-pointer group text-left"
                          title="Click to view owner profile & all branches"
                        >
                          <Building2 size={14} className="text-[#F97316] group-hover:scale-110 transition-transform" />
                          <span className="underline underline-offset-2 decoration-[#F97316]/40 group-hover:decoration-[#F97316]">
                            {owner.branches?.length || 0} {owner.branches?.length === 1 ? 'Branch' : 'Branches'}
                          </span>
                        </button>
                        {owner.branches && owner.branches.length > 0 ? (
                          <div className="flex flex-col gap-1 max-w-[170px]">
                            {owner.branches.map((b: any, bIdx: number) => (
                              <button
                                key={b._id || bIdx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewBranch({
                                    ...b,
                                    ownerName: `${owner.firstName} ${owner.lastName}`,
                                    gymName: owner.gymId?.name
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#FFFDF8] border border-[#FED7AA] text-[#F97316] px-2.5 py-1 rounded-lg hover:bg-[#F97316] hover:text-white transition-all cursor-pointer shadow-2xs group text-left w-fit active:scale-95"
                                title={`Click to view full details for branch ${b.branchName}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] group-hover:bg-white shrink-0"></span>
                                <span className="truncate max-w-[120px]">{b.branchName}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-[#78716C] italic">1 Main Location</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        {owner.subscriptionPlan && SAAS_PLANS[owner.subscriptionPlan] ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F1F5F9] text-[#78716C] border border-[#FED7AA]">
                            {SAAS_PLANS[owner.subscriptionPlan].name}
                          </span>
                        ) : (
                          <span className="text-[#78716C] text-xs">No Plan</span>
                        )}
                        <div className="text-xs text-[#78716C]">{owner.billingCycle ? owner.billingCycle.charAt(0).toUpperCase() + owner.billingCycle.slice(1) : 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-[#78716C]">Status:</span>{' '}
                          <span className={`font-medium ${owner.subscriptionStatus === 'Active' ? 'text-[#F97316]' : 'text-[#EF4444]'}`}>
                            {owner.subscriptionStatus || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#78716C]">Payment:</span>{' '}
                          <span className="font-medium text-[#292524]">{owner.paymentStatus || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[#78716C] font-medium text-[11px] w-11">Start:</span>
                          <span className="font-semibold text-[#292524]">{formatDate(owner.subscriptionStart)}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[#78716C] font-medium text-[11px] w-11">Expiry:</span>
                          <span className="font-semibold text-[#F97316]">{formatDate(owner.subscriptionExpiry)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(owner.approvalStatus)}`}>
                        {owner.approvalStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col items-center gap-2">
                        {/* Quick Actions based on status - Fixed width to prevent shifting */}
                        <div className="flex items-center gap-1 border-t border-[#FED7AA] pt-1.5">
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
                              className="p-1 text-[#FED7AA] hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
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

                        {/* View, Edit, Delete buttons */}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setViewOwner(owner)}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="View Details"
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
                            className="p-1.5 text-[#78716C] hover:text-[#FED7AA] hover:bg-red-500/10 rounded-md transition-colors"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-[#FFFFFF] shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#292524]">Gym Owner Details</h2>
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
                    className="text-sm font-semibold text-[#F97316] hover:underline flex items-center"
                  >
                    <Eye size={16} className="mr-1" /> View Public Page
                  </a>
                )}
                <button 
                  onClick={() => setViewOwner(null)}
                  className="p-1.5 text-[#78716C] hover:text-[#F97316] hover:bg-[#FFFDF8] rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
              {/* Owner Details */}
              <div>
                <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider mb-3">Owner Information</h3>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">First Name</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.firstName || '—'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Last Name</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.lastName || '—'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Email</span>
                      <span className="font-semibold text-sm text-[#292524] break-all">{viewOwner.email || '—'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Mobile</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.mobile || '—'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Account Status</span>
                      <span className="inline-flex items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(viewOwner.approvalStatus)}`}>
                          {viewOwner.approvalStatus}
                        </span>
                      </span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Joined Date</span>
                      <span className="font-semibold text-sm text-[#292524]">{formatDate(viewOwner.createdAt)}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">SaaS Plan</span>
                      <span className="font-bold text-sm text-[#F97316]">
                        {viewOwner.subscriptionPlan && SAAS_PLANS[viewOwner.subscriptionPlan] 
                          ? SAAS_PLANS[viewOwner.subscriptionPlan].name 
                          : 'Standard Plan'}
                      </span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Plan Expiry Date</span>
                      <span className="font-semibold text-sm text-[#292524]">{formatDate(viewOwner.subscriptionExpiry)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gym Details */}
              <div>
                <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider mb-3">Gym Information</h3>
                {viewOwner.gymId?.logo && (
                  <div className="mb-4">
                    <img src={viewOwner.gymId.logo} alt={viewOwner.gymId.name} className="w-full max-h-48 object-cover rounded-xl border border-[#E7E5E4]" />
                  </div>
                )}
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Gym Name</span>
                      <span className="font-bold text-sm text-[#292524]">{viewOwner.gymId?.name || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Gym Type</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.gymId?.gymType || 'Standard'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Gym Status</span>
                      <span className="inline-flex items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          viewOwner.gymId?.status === 'ACTIVE' ? 'bg-green-500/10 text-green-700 border-green-500/30' :
                          viewOwner.gymId?.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' :
                          viewOwner.gymId?.status === 'SUSPENDED' ? 'bg-orange-500/10 text-orange-700 border-orange-500/30' :
                          'bg-red-500/10 text-red-700 border-red-500/30'
                        }`}>{viewOwner.gymId?.status || 'PENDING'}</span>
                      </span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Rating</span>
                      <span className="font-semibold text-sm text-[#292524]">⭐ {viewOwner.gymId?.rating || 'N/A'} {viewOwner.gymId?.reviewCount ? `(${viewOwner.gymId.reviewCount})` : ''}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Gym Email</span>
                      <span className="font-semibold text-sm text-[#292524] break-all">{viewOwner.gymId?.email || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Gym Phone</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.gymId?.phone || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Operating Hours</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.gymId?.operatingHours || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Training Mode</span>
                      <span className="font-semibold text-sm text-[#292524] capitalize">{viewOwner.gymId?.trainingMode || 'All Modes'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              {viewOwner.gymId?.services && viewOwner.gymId.services.length > 0 && (
                <div>
                  <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider mb-3">Services Offered</h3>
                  <div className="flex flex-wrap gap-2 p-3.5 bg-white border border-[#E7E5E4] rounded-xl shadow-sm">
                    {viewOwner.gymId.services.map((service: string, i: number) => (
                      <span key={i} className="bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 text-xs px-3 py-1 rounded-lg font-bold">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location & Operations */}
              <div>
                <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider mb-3">Location & Operations</h3>
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center sm:col-span-2">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Address</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.gymId?.location?.address || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">City</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.gymId?.location?.city || viewOwner.city || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">State</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.gymId?.location?.state || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">PIN Code</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.gymId?.location?.pinCode || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Member Capacity</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.gymId?.memberCapacity ?? 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Trainer Capacity</span>
                      <span className="font-semibold text-sm text-[#292524]">{viewOwner.gymId?.trainerCapacity ?? 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Verification</span>
                      <span className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block w-fit">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered Branch Locations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={16} /> Registered Branch Locations ({viewOwner.branches?.length || 0})
                  </h3>
                  {viewOwner.branches && viewOwner.branches.length > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F97316] text-white">
                      {viewOwner.branches.length} {viewOwner.branches.length === 1 ? 'Branch' : 'Branches'}
                    </span>
                  )}
                </div>

                {viewOwner.branches && viewOwner.branches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {viewOwner.branches.map((branch: any, idx: number) => (
                      <div 
                        key={branch._id || idx} 
                        onClick={() => setViewBranch({ ...branch, ownerName: `${viewOwner.firstName} ${viewOwner.lastName}`, gymName: viewOwner.gymId?.name })}
                        className="bg-[#FFFDF8] border border-[#FED7AA] rounded-xl p-4 shadow-xs hover:border-[#F97316] hover:shadow-md transition-all space-y-2.5 cursor-pointer active:scale-98 group"
                        title="Click to view full branch details"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-[#E7E5E4] pb-2">
                          <div>
                            <h4 className="font-bold text-[#292524] text-base group-hover:text-[#F97316] transition-colors">{branch.branchName}</h4>
                            <p className="text-xs text-[#78716C] font-semibold uppercase tracking-wider">Branch Code: {branch.branchCode || 'N/A'}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            branch.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {branch.status || 'ACTIVE'}
                          </span>
                        </div>
                        
                        <div className="text-xs space-y-1 text-[#78716C]">
                          <p className="flex items-start gap-1.5">
                            <MapPin size={14} className="text-[#F97316] shrink-0 mt-0.5" />
                            <span className="font-medium text-[#292524]">
                              {branch.location?.address ? `${branch.location.address}, ` : ''}
                              {branch.location?.area ? `${branch.location.area}, ` : ''}
                              {branch.location?.city || viewOwner.city || ''} {branch.location?.pinCode ? `- ${branch.location.pinCode}` : ''}
                            </span>
                          </p>
                          {branch.phone && (
                            <p className="flex items-center gap-1.5">
                              <Phone size={13} className="text-[#F97316] shrink-0" />
                              <span className="font-medium">{branch.phone}</span>
                            </p>
                          )}
                          {branch.email && (
                            <p className="flex items-center gap-1.5">
                              <Mail size={13} className="text-[#F97316] shrink-0" />
                              <span className="font-medium">{branch.email}</span>
                            </p>
                          )}
                          {branch.operatingHours && (
                            <p className="flex items-center gap-1.5 text-[11px]">
                              <Clock size={13} className="text-[#78716C] shrink-0" />
                              <span>
                                Hours: {typeof branch.operatingHours === 'string' 
                                  ? branch.operatingHours 
                                  : `${branch.operatingHours.openingTime || ''} - ${branch.operatingHours.closingTime || ''}`}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="pt-2 border-t border-[#FED7AA]/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-[#78716C] font-semibold">Branch Approval:</span>
                          <div className="flex items-center gap-1">
                            {branch.status !== 'ACTIVE' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBranchStatusChange(branch._id, 'ACTIVE');
                                }}
                                className="px-2 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white font-bold text-[10px] rounded transition-all flex items-center gap-1 cursor-pointer"
                                title="Approve branch"
                              >
                                <CheckCircle size={12} /> Approve
                              </button>
                            )}
                            {branch.status !== 'PENDING' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBranchStatusChange(branch._id, 'PENDING');
                                }}
                                className="px-2 py-1 bg-amber-100 text-amber-800 hover:bg-amber-600 hover:text-white font-bold text-[10px] rounded transition-all flex items-center gap-1 cursor-pointer"
                                title="Mark branch pending"
                              >
                                <Clock size={12} /> Pending
                              </button>
                            )}
                            {branch.status !== 'SUSPENDED' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBranchStatusChange(branch._id, 'SUSPENDED');
                                }}
                                className="px-2 py-1 bg-orange-100 text-orange-800 hover:bg-orange-600 hover:text-white font-bold text-[10px] rounded transition-all flex items-center gap-1 cursor-pointer"
                                title="Suspend branch"
                              >
                                <ShieldAlert size={12} /> Suspend
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#78716C] italic bg-white p-3.5 border border-[#E7E5E4] rounded-xl">No additional branches registered for this gym owner.</p>
                )}
              </div>

              {/* Member Subscription Plans */}
              <div className="bg-[#F8FAF9] border border-[#E7E5E4] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 border-b border-[#E7E5E4] pb-2">
                  <h3 className="text-[#F97316] font-semibold">Member Subscription Plans</h3>
                  {viewOwner.gymId?.subscriptionPlans && viewOwner.gymId.subscriptionPlans.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316]">
                      {viewOwner.gymId.subscriptionPlans.length} {viewOwner.gymId.subscriptionPlans.length === 1 ? 'Plan' : 'Plans'}
                    </span>
                  )}
                </div>
                {viewOwner.gymId?.subscriptionPlans && viewOwner.gymId.subscriptionPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {viewOwner.gymId.subscriptionPlans.map((plan: any, idx: number) => (
                      <div key={idx} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-[#F97316]/40 transition-colors">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-[#292524] text-base">{plan.name}</h4>
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md font-bold text-sm">
                              {Number(plan.price) === 0 ? 'FREE' : `₹${plan.price}`}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#F97316] bg-[#F97316]/5 px-2 py-1 rounded inline-block mb-3">
                            ⏱ {plan.duration}
                          </p>
                        </div>
                        {plan.features && (
                          <div className="mt-2 pt-2 border-t border-[#FED7AA]">
                            <p className="text-xs text-[#78716C] leading-relaxed whitespace-pre-wrap">{plan.features}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#78716C]">No subscription plans defined for this gym.</p>
                )}
              </div>

              {/* AC Details & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[#F97316] font-semibold mb-4 border-b border-[#E7E5E4] pb-2">AC Details</h3>
                  <div className="text-sm space-y-2">
                    <p><span className="text-[#78716C]">Type:</span> <span className="text-[#292524] font-medium">{viewOwner.gymId?.acDetails?.type || 'Not Specified'}</span></p>
                    {viewOwner.gymId?.acDetails?.areas && viewOwner.gymId.acDetails.areas.length > 0 && (
                      <p><span className="text-[#78716C]">Areas:</span> <span className="text-[#292524] font-medium">{viewOwner.gymId.acDetails.areas.join(', ')}</span></p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-[#F97316] font-semibold mb-4 border-b border-[#E7E5E4] pb-2">Facilities</h3>
                  {viewOwner.gymId?.facilities && viewOwner.gymId.facilities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {viewOwner.gymId.facilities.map((f: string, i: number) => (
                        <span key={i} className="bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] text-xs px-2.5 py-1 rounded-md font-medium">{f}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#78716C]">No facilities selected.</p>
                  )}
                </div>
              </div>

              {/* Equipment (if present) */}
              {viewOwner.gymId?.equipment && viewOwner.gymId.equipment.length > 0 && (
                <div>
                  <h3 className="text-[#F97316] font-semibold mb-4 border-b border-[#E7E5E4] pb-2">Equipment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewOwner.gymId.equipment.map((eq: any, i: number) => (
                      <div key={i} className="bg-[#FFFFFF] p-3 rounded-lg border border-[#E7E5E4]">
                        <p className="text-sm font-medium text-[#292524]">{eq.name} <span className="text-[#78716C] text-xs">x{eq.quantity}</span></p>
                        <p className="text-xs text-[#78716C] mt-1">{eq.category} • {eq.condition} • {eq.availability}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gym Images */}
              {viewOwner.gymId?.images && viewOwner.gymId.images.length > 0 && (
                <div>
                  <h3 className="text-[#F97316] font-semibold mb-4 border-b border-[#E7E5E4] pb-2">Gym Images</h3>
                  <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {viewOwner.gymId.images.map((url: string, i: number) => (
                        <img key={i} src={url} alt={`Gym Image ${i+1}`} className="w-full h-24 object-cover rounded-lg border border-[#E7E5E4]" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-3.5 bg-[#F8FAF9] border-t border-[#E7E5E4] flex items-center justify-end shrink-0">
              <button 
                onClick={() => setViewOwner(null)}
                className="px-5 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors text-sm font-semibold shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Branch Details Modal */}
      {viewBranch && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-[#FFFDF8] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#292524]">{viewBranch.branchName}</h2>
                  <p className="text-xs text-[#78716C] font-semibold">
                    Gym: <span className="text-[#F97316]">{viewBranch.gymName || 'N/A'}</span> • Owner: <span className="text-[#292524]">{viewBranch.ownerName || 'N/A'}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewBranch(null)}
                className="p-1.5 text-[#78716C] hover:text-[#F97316] hover:bg-white rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
              {/* Approval Actions Panel for Super Admin */}
              <div className="bg-[#FFFDF8] border border-[#FED7AA] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <h4 className="font-bold text-[#292524] text-xs uppercase tracking-wider">Branch Approval & Status</h4>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Current Status: <strong className={viewBranch.status === 'ACTIVE' ? 'text-emerald-600' : 'text-[#F97316]'}>{viewBranch.status || 'ACTIVE'}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {viewBranch.status !== 'ACTIVE' && (
                    <button
                      type="button"
                      onClick={() => handleBranchStatusChange(viewBranch._id, 'ACTIVE')}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    >
                      <CheckCircle size={14} /> Approve Branch
                    </button>
                  )}
                  {viewBranch.status !== 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleBranchStatusChange(viewBranch._id, 'PENDING')}
                      className="px-3 py-1.5 bg-amber-500 text-white font-bold text-xs rounded-lg hover:bg-amber-600 transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    >
                      <Clock size={14} /> Mark Pending
                    </button>
                  )}
                  {viewBranch.status !== 'SUSPENDED' && (
                    <button
                      type="button"
                      onClick={() => handleBranchStatusChange(viewBranch._id, 'SUSPENDED')}
                      className="px-3 py-1.5 bg-orange-500 text-white font-bold text-xs rounded-lg hover:bg-orange-600 transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    >
                      <ShieldAlert size={14} /> Suspend
                    </button>
                  )}
                  {viewBranch.status !== 'INACTIVE' && (
                    <button
                      type="button"
                      onClick={() => handleBranchStatusChange(viewBranch._id, 'INACTIVE')}
                      className="px-3 py-1.5 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-600 transition-all flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                    >
                      <XCircle size={14} /> Reject / Inactive
                    </button>
                  )}
                </div>
              </div>

              {/* Branch Quick Header Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#F8FAF9] border border-[#E7E5E4] rounded-xl">
                <div>
                  <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block">Branch Code</span>
                  <span className="font-bold text-sm text-[#292524]">{viewBranch.branchCode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${
                    viewBranch.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {viewBranch.status || 'ACTIVE'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block">Training Mode</span>
                  <span className="font-semibold text-sm text-[#292524] capitalize">{viewBranch.trainingMode || 'offline'}</span>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={15} /> Location Details
                </h3>
                <div className="p-4 bg-white border border-[#E7E5E4] rounded-xl space-y-1.5 text-[#292524]">
                  <p className="font-semibold">{viewBranch.location?.address || 'Address not specified'}</p>
                  <p className="text-xs text-[#78716C]">
                    {[viewBranch.location?.area, viewBranch.location?.city, viewBranch.location?.state, viewBranch.location?.pinCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>

              {/* Contact & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#E7E5E4] rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Contact Info</h4>
                  {viewBranch.phone && (
                    <p className="flex items-center gap-2 text-xs text-[#292524] font-semibold">
                      <Phone size={14} className="text-[#F97316]" /> {viewBranch.phone}
                    </p>
                  )}
                  {viewBranch.email && (
                    <p className="flex items-center gap-2 text-xs text-[#292524] font-semibold">
                      <Mail size={14} className="text-[#F97316]" /> {viewBranch.email}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-white border border-[#E7E5E4] rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Capacity & Hours</h4>
                  <p className="text-xs text-[#292524] flex items-center gap-2 font-semibold">
                    <Clock size={14} className="text-[#F97316]" />
                    {typeof viewBranch.operatingHours === 'string' 
                      ? viewBranch.operatingHours 
                      : `${viewBranch.operatingHours?.openingTime || '06:00 AM'} - ${viewBranch.operatingHours?.closingTime || '10:00 PM'}`}
                  </p>
                  <p className="text-xs text-[#78716C]">
                    Capacity: <strong className="text-[#292524]">{viewBranch.memberCapacity || 'N/A'} Members</strong> • <strong className="text-[#292524]">{viewBranch.trainerCapacity || 'N/A'} Trainers</strong>
                  </p>
                </div>
              </div>

              {/* Branch Package Plans */}
              <div className="bg-[#F8FAF9] border border-[#E7E5E4] rounded-xl p-4 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E5E4] pb-2.5">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-[#F97316]" />
                    <h3 className="text-[#F97316] font-bold text-xs uppercase tracking-wider">
                      Branch Package Plans
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F97316]/10 text-[#F97316] w-fit">
                    {((viewBranch.subscriptionPlans && viewBranch.subscriptionPlans.length > 0) ? viewBranch.subscriptionPlans : defaultBranchPlans).length} Active Plans
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {((viewBranch.subscriptionPlans && viewBranch.subscriptionPlans.length > 0) ? viewBranch.subscriptionPlans : defaultBranchPlans).map((plan: any, idx: number) => {
                    const formatPlanName = (name: string) => {
                      if (!name) return 'Package Plan';
                      const lower = name.trim().toLowerCase();
                      if (lower === 'free trial' || lower === 'trial') return 'Starter Free';
                      if (lower === 'gold') return 'Growth Plan';
                      if (lower === 'premium') return 'Pro Plan';
                      return name;
                    };

                    const rawPrice = Number(String(plan.price || 0).replace(/[^0-9]/g, ''));
                    const annualPrice = plan.annualPrice 
                      ? Number(String(plan.annualPrice).replace(/[^0-9]/g, '')) 
                      : Math.round(rawPrice * 10);

                    return (
                      <div key={idx} className="bg-white border border-[#E7E5E4] rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:border-[#F97316]/40 transition-all space-y-2">
                        <div>
                          <div className="flex justify-between items-start mb-1.5 border-b border-[#E7E5E4] pb-1.5">
                            <h4 className="font-bold text-[#292524] text-sm">{formatPlanName(plan.name)}</h4>
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold text-xs">
                              {rawPrice === 0 ? 'FREE' : `₹${rawPrice.toLocaleString('en-IN')}`}
                            </span>
                          </div>
                          
                          <div className="space-y-0.5 mb-2">
                            <p className="text-[11px] font-bold text-[#F97316]">
                              Monthly: {rawPrice === 0 ? '₹0' : `₹${rawPrice.toLocaleString('en-IN')}/mo`}
                            </p>
                            {rawPrice > 0 && (
                              <p className="text-[10px] text-[#78716C]">
                                Annual: <strong className="text-[#292524]">₹{annualPrice.toLocaleString('en-IN')}/yr</strong> <span className="text-emerald-600 font-semibold">(2 mos free)</span>
                              </p>
                            )}
                          </div>

                          {plan.features && (
                            <p className="text-[11px] text-[#78716C] leading-relaxed whitespace-pre-line border-t border-[#E7E5E4]/60 pt-1.5">
                              {plan.features}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Services & Facilities */}
              {((viewBranch.services && viewBranch.services.length > 0) || (viewBranch.facilities && viewBranch.facilities.length > 0)) && (
                <div className="space-y-3">
                  {viewBranch.services && viewBranch.services.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">Services</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {viewBranch.services.map((s: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-[#F97316]/10 text-[#F97316] text-xs font-bold rounded-lg border border-[#F97316]/20">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewBranch.facilities && viewBranch.facilities.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">Facilities</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {viewBranch.facilities.map((f: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-[#FFFDF8] border border-[#E7E5E4] text-[#292524] text-xs font-medium rounded-lg">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-6 py-3.5 bg-[#F8FAF9] border-t border-[#E7E5E4] flex items-center justify-end shrink-0">
              <button 
                onClick={() => setViewBranch(null)}
                className="px-5 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors text-sm font-semibold shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Owner Modal */}
      {editOwner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-[#FFFFFF] shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#292524]">Edit Gym Owner & Gym Details</h2>
                <p className="text-xs text-[#78716C] mt-0.5">Modify owner personal information and full gym registration profile.</p>
              </div>
              <button 
                onClick={() => setEditOwner(null)}
                className="p-1.5 text-[#78716C] hover:text-[#F97316] hover:bg-[#FFFDF8] rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8 text-sm">
              {/* Account / Owner Information */}
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-5 shadow-sm">
                <h3 className="text-[#F97316] font-semibold mb-4 border-b border-[#E7E5E4] pb-2 text-base">Owner Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">First Name</label>
                    <input 
                      value={editForm.firstName || ''} 
                      onChange={e => setEditForm({...editForm, firstName: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Last Name</label>
                    <input 
                      value={editForm.lastName || ''} 
                      onChange={e => setEditForm({...editForm, lastName: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Email</label>
                    <input 
                      value={editForm.email || ''} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Mobile</label>
                    <input 
                      value={editForm.mobile || ''} 
                      onChange={e => setEditForm({...editForm, mobile: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">City</label>
                    <input 
                      value={editForm.city || ''} 
                      onChange={e => setEditForm({...editForm, city: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Platform Subscription Plan</label>
                    <div className="w-full bg-[#FFFDF8] border border-[#FED7AA] text-[#78716C] rounded-lg px-3 py-2 text-sm cursor-not-allowed">
                      {editForm.subscriptionPlan ? (SAAS_PLANS[editForm.subscriptionPlan]?.name || editForm.subscriptionPlan) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Plan Expiry Date</label>
                    <div className="w-full bg-[#FFFDF8] border border-[#FED7AA] text-[#78716C] rounded-lg px-3 py-2 text-sm cursor-not-allowed">
                      {editForm.subscriptionExpiry || 'N/A'}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#78716C] mt-3 italic flex items-center gap-1">
                  <AlertCircle size={13}/> Note: Platform subscription and payment details are managed via the Subscriptions section.
                </p>
              </div>

              {/* Gym Details */}
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-5 shadow-sm">
                <h3 className="text-[#F97316] font-semibold mb-4 border-b border-[#E7E5E4] pb-2 text-base">Gym Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Gym Name</label>
                    <input 
                      value={editForm.gymData?.name || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, name: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Gym Type</label>
                    <select 
                      value={editForm.gymData?.gymType || 'Commercial'} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, gymType: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    >
                      {GYM_TYPES.map(gt => <option key={gt} value={gt}>{gt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Rating (1 - 5)</label>
                    <input 
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={editForm.gymData?.rating ?? 5} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, rating: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Gym Email</label>
                    <input 
                      value={editForm.gymData?.email || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, email: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Gym Contact Phone</label>
                    <input 
                      value={editForm.gymData?.phone || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, phone: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Operating Hours</label>
                    <input 
                      value={editForm.gymData?.operatingHours || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, operatingHours: e.target.value}})} 
                      placeholder="e.g. 6 AM - 10 PM or 24/7"
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Training Mode</label>
                    <div className="flex gap-2">
                      {['offline', 'online', 'both'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setEditForm({...editForm, gymData: {...editForm.gymData, trainingMode: mode}})}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors capitalize ${
                            editForm.gymData?.trainingMode === mode 
                              ? 'bg-[#F97316] text-white border-[#F97316]' 
                              : 'bg-white text-[#78716C] border-[#E7E5E4] hover:border-[#F97316]/50'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2 md:col-span-4">
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Gym Logo URL</label>
                    <div className="flex items-center gap-3">
                      <input 
                        value={editForm.gymData?.logo || ''} 
                        onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, logo: e.target.value}})} 
                        placeholder="https://example.com/logo.png"
                        className="flex-1 bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                      />
                      {editForm.gymData?.logo && (
                        <img 
                          src={editForm.gymData.logo} 
                          alt="Logo Preview" 
                          className="w-10 h-10 object-cover rounded-lg border border-[#E7E5E4]"
                          onError={(e) => { (e.target as any).style.display = 'none'; }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-5 shadow-sm">
                <h3 className="text-[#F97316] font-semibold mb-2 border-b border-[#E7E5E4] pb-2 text-base">Services Offered</h3>
                <p className="text-xs text-[#78716C] mb-3">Click to toggle services offered at this gym:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.from(new Set([...ALL_SERVICES, ...(editForm.gymData?.services || [])])).map((service: string) => {
                    const isSelected = (editForm.gymData?.services || []).includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => toggleService(service)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#F97316] text-white border-[#F97316]'
                            : 'bg-white text-[#78716C] border-[#E7E5E4] hover:border-[#F97316]/50'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{service}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 max-w-md">
                  <input
                    value={newServiceInput}
                    onChange={e => setNewServiceInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomService(); } }}
                    placeholder="Add custom service..."
                    className="flex-1 bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#F97316]"
                  />
                  <button
                    type="button"
                    onClick={addCustomService}
                    className="px-3 py-1.5 bg-[#F97316]/10 text-[#F97316] rounded-lg hover:bg-[#F97316]/20 text-xs font-semibold border border-[#F97316]/30 flex items-center gap-1"
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
              </div>

              {/* Location & Operations */}
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-5 shadow-sm">
                <h3 className="text-[#F97316] font-semibold mb-4 border-b border-[#E7E5E4] pb-2 text-base">Location & Operations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Street Address</label>
                    <input 
                      value={editForm.gymData?.location?.address || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, address: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">City</label>
                    <input 
                      value={editForm.gymData?.location?.city || ''} 
                      onChange={e => {
                        const val = e.target.value;
                        setEditForm({
                          ...editForm,
                          city: val,
                          gymData: {...editForm.gymData, location: {...editForm.gymData?.location, city: val}}
                        });
                      }} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">State</label>
                    <input 
                      value={editForm.gymData?.location?.state || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, state: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">PIN Code</label>
                    <input 
                      value={editForm.gymData?.location?.pinCode || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, pinCode: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Approx. Members Capacity</label>
                    <input 
                      type="number"
                      value={editForm.gymData?.memberCapacity ?? ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, memberCapacity: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Number of Trainers</label>
                    <input 
                      type="number"
                      value={editForm.gymData?.trainerCapacity ?? ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, trainerCapacity: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* AC Details & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-5 shadow-sm">
                  <h3 className="text-[#F97316] font-semibold mb-3 border-b border-[#E7E5E4] pb-2 text-base">AC Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#78716C] mb-1.5">AC Type</label>
                      <select
                        value={editForm.gymData?.acDetails?.type || 'Non-AC'}
                        onChange={e => setEditForm({
                          ...editForm,
                          gymData: {
                            ...editForm.gymData,
                            acDetails: { ...editForm.gymData?.acDetails, type: e.target.value }
                          }
                        })}
                        className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#F97316]"
                      >
                        {AC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    {editForm.gymData?.acDetails?.type !== 'Non-AC' && (
                      <div>
                        <label className="block text-xs font-semibold text-[#78716C] mb-1.5">AC Areas</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {Array.from(new Set([...COMMON_AC_AREAS, ...(editForm.gymData?.acDetails?.areas || [])])).map((area: string) => {
                            const isSelected = (editForm.gymData?.acDetails?.areas || []).includes(area);
                            return (
                              <button
                                key={area}
                                type="button"
                                onClick={() => toggleAcArea(area)}
                                className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                                  isSelected
                                    ? 'bg-[#F97316] text-white border-[#F97316]'
                                    : 'bg-white text-[#78716C] border-[#E7E5E4] hover:border-[#F97316]/50'
                                }`}
                              >
                                {area}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-5 shadow-sm">
                  <h3 className="text-[#F97316] font-semibold mb-3 border-b border-[#E7E5E4] pb-2 text-base">Facilities</h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Array.from(new Set([...COMMON_FACILITIES, ...(editForm.gymData?.facilities || [])])).map((f: string) => {
                      const isSelected = (editForm.gymData?.facilities || []).includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => toggleFacility(f)}
                          className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                            isSelected
                              ? 'bg-[#F97316] text-white border-[#F97316]'
                              : 'bg-white text-[#78716C] border-[#E7E5E4] hover:border-[#F97316]/50'
                          }`}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={newFacilityInput}
                      onChange={e => setNewFacilityInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomFacility(); } }}
                      placeholder="Add custom facility..."
                      className="flex-1 bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#F97316]"
                    />
                    <button
                      type="button"
                      onClick={addCustomFacility}
                      className="px-3 py-1.5 bg-[#F97316]/10 text-[#F97316] rounded-lg hover:bg-[#F97316]/20 text-xs font-semibold border border-[#F97316]/30 flex items-center gap-1"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Member Subscription Plans */}
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-[#E7E5E4] pb-2">
                  <div>
                    <h3 className="text-[#F97316] font-semibold text-base">Member Subscription Plans</h3>
                    <p className="text-xs text-[#78716C]">Configure plans offered to gym members.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPlan}
                    className="px-3 py-1.5 bg-[#F97316] text-white rounded-lg hover:bg-[#F97316]/90 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={14} /> Add Plan
                  </button>
                </div>

                {editForm.gymData?.subscriptionPlans && editForm.gymData.subscriptionPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {editForm.gymData.subscriptionPlans.map((plan: any, idx: number) => (
                      <div key={idx} className="bg-[#F8FAF9] border border-[#E7E5E4] rounded-xl p-4 relative flex flex-col justify-between">
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(idx)}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Delete Plan"
                        >
                          <Trash2 size={15} />
                        </button>
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded">
                            Plan #{idx + 1}
                          </span>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#78716C] mb-1">Plan Name</label>
                            <input
                              value={plan.name || ''}
                              onChange={e => handlePlanChange(idx, 'name', e.target.value)}
                              placeholder="e.g. Gold"
                              className="w-full bg-white border border-[#E7E5E4] text-[#292524] rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#F97316]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#78716C] mb-1">Price (₹)</label>
                              <input
                                value={plan.price ?? ''}
                                onChange={e => handlePlanChange(idx, 'price', e.target.value)}
                                placeholder="e.g. 999"
                                className="w-full bg-white border border-[#E7E5E4] text-[#292524] rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#F97316]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#78716C] mb-1">Duration</label>
                              <input
                                value={plan.duration || ''}
                                onChange={e => handlePlanChange(idx, 'duration', e.target.value)}
                                placeholder="e.g. 1 Month"
                                className="w-full bg-white border border-[#E7E5E4] text-[#292524] rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#F97316]"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#78716C] mb-1">Features Description</label>
                            <textarea
                              rows={3}
                              value={plan.features || ''}
                              onChange={e => handlePlanChange(idx, 'features', e.target.value)}
                              placeholder="Enter plan features..."
                              className="w-full bg-white border border-[#E7E5E4] text-[#292524] rounded-md px-2.5 py-1.5 text-xs outline-none focus:border-[#F97316] resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-[#E7E5E4] rounded-lg bg-[#F8FAF9]">
                    <p className="text-xs text-[#78716C] mb-2">No subscription plans configured yet.</p>
                    <button
                      type="button"
                      onClick={handleAddPlan}
                      className="px-3 py-1.5 bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20 text-xs font-semibold rounded-md border border-[#F97316]/30 inline-flex items-center gap-1"
                    >
                      <Plus size={13} /> Add First Plan
                    </button>
                  </div>
                )}
              </div>

              {/* Gym Images */}
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-5 shadow-sm">
                <h3 className="text-[#F97316] font-semibold mb-2 border-b border-[#E7E5E4] pb-2 text-base">Gym Images</h3>
                <p className="text-xs text-[#78716C] mb-4">Add or remove photo gallery URLs for this gym.</p>
                {editForm.gymData?.images && editForm.gymData.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {editForm.gymData.images.map((url: string, i: number) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-[#E7E5E4] bg-slate-50">
                        <img src={url} alt={`Gym ${i + 1}`} className="w-full h-24 object-cover" />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(i)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md opacity-90 hover:opacity-100 transition-opacity"
                          title="Delete photo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#78716C] mb-3 italic">No images currently added.</p>
                )}
                <div className="flex items-center gap-2 max-w-lg">
                  <input
                    value={newImageInput}
                    onChange={e => setNewImageInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage(); } }}
                    placeholder="Enter image URL..."
                    className="flex-1 bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#F97316]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-1.5 bg-[#F97316]/10 text-[#F97316] rounded-lg hover:bg-[#F97316]/20 text-xs font-semibold border border-[#F97316]/30 flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Photo
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3.5 bg-[#F8FAF9] border-t border-[#E7E5E4] flex items-center justify-end space-x-3 shrink-0">
              <button 
                type="button"
                onClick={() => setEditOwner(null)}
                className="px-4 py-2 border border-[#E7E5E4] text-[#78716C] bg-white rounded-lg hover:bg-[#FFFDF8] transition-colors text-sm font-medium shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-5 py-2 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors text-sm font-semibold flex items-center space-x-2 shadow-sm disabled:opacity-50"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] my-auto">
            <div className="px-6 py-4 border-b border-[#E7E5E4] flex justify-between items-center bg-gradient-to-r from-[#FFFDF8] to-[#FFFFFF]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#292524]">Platform Subscription</h2>
                  <p className="text-[#78716C] text-xs">Payment & Plan details for {viewSubscription.firstName} {viewSubscription.lastName}</p>
                </div>
              </div>
              <button onClick={() => setViewSubscription(null)} className="p-2 text-[#78716C] hover:text-[#292524] bg-white rounded-full border border-[#FED7AA] shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              
              {/* Active Plan Card */}
              <div className="bg-gradient-to-br from-[#FFFDF8] to-[#F1F5F9] rounded-xl p-5 border border-[#FED7AA] shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1 block">Current Plan</span>
                    <h3 className="text-xl font-bold text-[#292524] flex items-center gap-2">
                      {viewSubscription.subscriptionPlan && SAAS_PLANS[viewSubscription.subscriptionPlan] 
                        ? SAAS_PLANS[viewSubscription.subscriptionPlan].name 
                        : 'No Active Plan'}
                      {viewSubscription.subscriptionStatus === 'Active' && (
                        <span className="bg-[#FED7AA]/10 text-[#F97316] text-[10px] px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-wide">Active</span>
                      )}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#0F172A]">
                      {viewSubscription.subscriptionPlan && SAAS_PLANS[viewSubscription.subscriptionPlan] 
                        ? SAAS_PLANS[viewSubscription.subscriptionPlan].price.split('/')[0] 
                        : '₹0'}
                    </div>
                    <div className="text-xs text-[#78716C]">{viewSubscription.billingCycle || 'N/A'} billing</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-[#FED7AA] pt-4">
                  <div>
                    <p className="text-[10px] text-[#78716C] uppercase font-semibold">Start Date</p>
                    <p className="text-sm font-medium text-[#292524] mt-1">{formatDate(viewSubscription.subscriptionStart)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#78716C] uppercase font-semibold">Renewal Date</p>
                    <p className="text-sm font-medium text-[#292524] mt-1">{formatDate(viewSubscription.subscriptionExpiry)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#78716C] uppercase font-semibold">Payment Status</p>
                    <p className="text-sm font-medium text-[#292524] mt-1">{viewSubscription.paymentStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#78716C] uppercase font-semibold">Transaction ID</p>
                    <p className="text-sm font-medium text-[#292524] mt-1 truncate" title={viewSubscription.transactionId || ''}>{viewSubscription.transactionId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* History Section (Simulated) */}
              <div>
                <h3 className="text-sm font-bold text-[#292524] mb-3">Subscription History</h3>
                {viewSubscription.transactionId ? (
                  <div className="border border-[#FED7AA] rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-[#78716C] uppercase bg-[#FFFDF8] border-b border-[#FED7AA]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold">Plan</th>
                          <th className="px-4 py-3 font-semibold">Amount</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#FED7AA]">
                        <tr className="bg-white">
                          <td className="px-4 py-3 text-[#292524]">{formatDate(viewSubscription.subscriptionStart)}</td>
                          <td className="px-4 py-3 text-[#292524]">{viewSubscription.subscriptionPlan || 'N/A'}</td>
                          <td className="px-4 py-3 text-[#292524]">{viewSubscription.subscriptionPlan ? SAAS_PLANS[viewSubscription.subscriptionPlan]?.price.split('/')[0] : '₹0'}</td>
                          <td className="px-4 py-3"><span className="text-[#F97316] bg-green-50 px-2 py-0.5 rounded text-xs border border-green-200">Paid</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#78716C] border border-dashed border-[#CBD5E1] rounded-lg bg-[#FFFDF8]">
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
