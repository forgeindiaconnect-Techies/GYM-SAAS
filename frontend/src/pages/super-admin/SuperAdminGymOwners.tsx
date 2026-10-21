import { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Phone, Mail, Building2, Eye, Edit2, X, Check, Users, Clock, CheckCircle, XCircle, ShieldAlert, Trash2, Download, FileText, Table as TableIcon, Star, Plus, MapPin, CreditCard, Dumbbell, Zap, Crown, Leaf, TrendingUp, Cpu, Activity, Target } from 'lucide-react';
import api from '../../utils/api';
import { exportToPDF, exportToExcel, exportToWord } from '../../utils/export';

const BADGE_CONFIG: Record<string, { icon: any; accent: string; bg: string }> = {
  'Weight Loss':       { icon: Target,    accent: '#C43D4D', bg: 'rgba(239,68,68,0.1)'   },
  'Muscle Gain':       { icon: Dumbbell,  accent: '#A991D4', bg: 'rgba(249,115,22,0.1)'  },
  'Strength':          { icon: Zap,       accent: '#6366F1', bg: 'rgba(99,102,241,0.1)'  },
  'General Fitness':   { icon: Activity,  accent: '#27845A', bg: 'rgba(34,197,94,0.1)'   },
  'Bodybuilding':      { icon: Crown,     accent: '#967CC5', bg: 'rgba(234,88,12,0.12)'  },
  'Yoga':              { icon: Leaf,      accent: '#27845A', bg: 'rgba(16,185,129,0.1)'  },
  'CrossFit':          { icon: TrendingUp,accent: '#B77916', bg: 'rgba(245,158,11,0.1)'  },
  'Personal Training': { icon: Users,     accent: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  'Online Coaching':   { icon: Cpu,       accent: '#0EA5E9', bg: 'rgba(14,165,233,0.1)'  },
};

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
  'Strength Training', 'Cardio', 'CrossFit & HIIT',
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

  // Gym Package Plans state (replacing subscription plans in gym edit modal)
  const [ownerPackages, setOwnerPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [packageForm, setPackageForm] = useState<any>({
    name: '',
    fitnessGoal: 'Strength',
    description: '',
    features: [''],
    trainingType: 'Offline',
    duration: '1 Month',
    monthlyPrice: '',
    annualPrice: '',
    availablePlans: 'both',
    isPopular: false,
    status: 'Active'
  });

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

  const fetchOwnerPackages = async (gymId: string) => {
    try {
      setLoadingPackages(true);
      const res = await api.get('/gym-packages', { params: { gymId } });
      if (res.data?.success && Array.isArray(res.data.packages)) {
        setOwnerPackages(res.data.packages);
      } else {
        const pubRes = await api.get('/gym-packages/public', { params: { gymId } });
        if (pubRes.data?.success && Array.isArray(pubRes.data.packages)) {
          setOwnerPackages(pubRes.data.packages);
        } else {
          setOwnerPackages([]);
        }
      }
    } catch (err) {
      try {
        const pubRes = await api.get('/gym-packages/public', { params: { gymId } });
        if (pubRes.data?.success && Array.isArray(pubRes.data.packages)) {
          setOwnerPackages(pubRes.data.packages);
        } else {
          setOwnerPackages([]);
        }
      } catch (e) {
        setOwnerPackages([]);
      }
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setPackageForm({
      name: '',
      fitnessGoal: 'Strength',
      description: '',
      features: [''],
      trainingType: 'Offline',
      duration: '1 Month',
      monthlyPrice: '',
      annualPrice: '',
      availablePlans: 'both',
      isPopular: false,
      status: 'Active'
    });
    setPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: any) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name || '',
      fitnessGoal: pkg.fitnessGoal || 'Strength',
      description: pkg.description || '',
      features: (pkg.features && pkg.features.length > 0) ? [...pkg.features] : [''],
      trainingType: pkg.trainingType || 'Offline',
      duration: pkg.duration || '1 Month',
      monthlyPrice: pkg.monthlyPrice ?? '',
      annualPrice: pkg.annualPrice ?? '',
      availablePlans: pkg.availablePlans || 'both',
      isPopular: !!pkg.isPopular,
      status: pkg.status || 'Active'
    });
    setPackageModalOpen(true);
  };

  const handleSavePackage = async () => {
    const gymId = editOwner?.gymId?._id || editOwner?.gymId;
    if (!gymId) {
      alert('This gym owner does not have an associated gym profile yet.');
      return;
    }

    if (!packageForm.name.trim()) {
      alert('Package name is required.');
      return;
    }
    if (packageForm.monthlyPrice === '' || isNaN(Number(packageForm.monthlyPrice))) {
      alert('Valid monthly price is required.');
      return;
    }

    try {
      const payload = {
        gymId: String(gymId),
        name: packageForm.name.trim(),
        fitnessGoal: packageForm.fitnessGoal,
        description: packageForm.description.trim(),
        features: packageForm.features.filter((f: string) => f.trim()),
        trainingType: packageForm.trainingType,
        duration: packageForm.duration,
        monthlyPrice: Number(packageForm.monthlyPrice),
        annualPrice: Number(packageForm.annualPrice) || 0,
        availablePlans: packageForm.availablePlans,
        isPopular: packageForm.isPopular,
        status: packageForm.status
      };

      if (editingPackage?._id) {
        await api.put(`/gym-packages/${editingPackage._id}`, payload);
      } else {
        await api.post('/gym-packages', payload);
      }

      setPackageModalOpen(false);
      await fetchOwnerPackages(String(gymId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save package plan');
    }
  };

  const handleTogglePackageStatus = async (pkg: any) => {
    try {
      const newStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
      await api.patch(`/gym-packages/${pkg._id}/status`, { status: newStatus });
      const gymId = editOwner?.gymId?._id || editOwner?.gymId;
      if (gymId) await fetchOwnerPackages(String(gymId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update package status');
    }
  };

  const handleDeletePackage = async (pkg: any) => {
    if (!window.confirm(`Delete package "${pkg.name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/gym-packages/${pkg._id}`);
      const gymId = editOwner?.gymId?._id || editOwner?.gymId;
      if (gymId) await fetchOwnerPackages(String(gymId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete package plan');
    }
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

    const gymId = owner.gymId?._id || owner.gymId;
    if (gymId) {
      fetchOwnerPackages(String(gymId));
    } else {
      setOwnerPackages([]);
    }
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
      case 'REJECTED': return 'bg-[#E9DFF4]/10 text-[#967CC5] border-[#E9DFF4]/20';
      case 'SUSPENDED': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#292431]">Gym Owner Details</h1>
          <p className="text-[#6B5E78] text-sm mt-1">Manage all registered gym owners and their approval statuses.</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-[#E5DDEB] pb-2 overflow-x-auto custom-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[#A991D4] text-[#A991D4] bg-[#A991D4]/10'
                : 'border-transparent text-[#6B5E78] hover:text-[#292431] hover:bg-[#FFFFFF]'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            <span className="bg-[#E9DFF4] text-xs px-2 py-0.5 rounded-full ml-2 text-[#292431]">
              {tab.id === 'ALL' ? owners.length : owners.filter(o => o.approvalStatus === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[250px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B5E78]" />
          <input 
            type="text" 
            placeholder="Search by name, gym or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg hover:bg-[#E9DFF4] transition-colors text-sm font-medium"
          >
            <Download size={16} className="text-[#A991D4]" />
            <span>Download Report</span>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#FFFFFF] border border-[#E5DDEB] rounded-lg shadow-xl z-10 py-1 overflow-hidden">
              <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-[#292431] hover:bg-[#E9DFF4] flex items-center space-x-2">
                <FileText size={14} className="text-red-400" /><span>PDF Document</span>
              </button>
              <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2 text-sm text-[#292431] hover:bg-[#E9DFF4] flex items-center space-x-2">
                <TableIcon size={14} className="text-green-400" /><span>Excel Spreadsheet</span>
              </button>
              <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-2 text-sm text-[#292431] hover:bg-[#E9DFF4] flex items-center space-x-2">
                <FileText size={14} className="text-blue-400" /><span>Word Document</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6B5E78]">
            <Loader2 size={32} className="animate-spin mb-4 text-[#A991D4]" />
            <p>Loading gym owners...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#967CC5]">
            <AlertCircle size={32} className="mb-2" />
            <p>{error}</p>
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[#6B5E78]">
            <Building2 size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-[#292431] mb-1">No gym owners found</p>
            <p className="text-sm text-center max-w-md">There are no gym owners matching your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#6B5E78] uppercase bg-[#F8FAF9] border-b-2 border-[#E5DDEB] sticky top-0 z-10">
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
              <tbody className="divide-y divide-[#E5DDEB]">
                {filteredOwners.map((owner) => (
                  <tr key={owner._id} className="hover:bg-[#F7F4FA] transition-colors align-middle">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-[#A991D4]/20 to-[#A991D4]/10 flex items-center justify-center text-[#A991D4] font-bold text-sm border border-[#A991D4]/20">
                          {owner.firstName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-[#292431]">{owner.firstName} {owner.lastName}</div>
                          <div className="text-xs font-semibold text-[#A991D4]">{owner.gymId?.name || 'No Gym'}</div>
                          {owner.gymId?.location?.city && <div className="text-[10px] text-[#6B5E78]">{owner.gymId.location.city}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-[#6B5E78]">
                          <Mail size={14} />
                          <span className="truncate max-w-[150px]">{owner.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#6B5E78]">
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
                          className="flex items-center gap-1.5 font-bold text-xs text-[#292431] hover:text-[#A991D4] transition-colors cursor-pointer group text-left"
                          title="Click to view owner profile & all branches"
                        >
                          <Building2 size={14} className="text-[#A991D4] group-hover:scale-110 transition-transform" />
                          <span className="underline underline-offset-2 decoration-[#A991D4]/40 group-hover:decoration-[#A991D4]">
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
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#F7F4FA] border border-[#E9DFF4] text-[#A991D4] px-2.5 py-1 rounded-lg hover:bg-[#A991D4] hover:text-[#292431] transition-all cursor-pointer shadow-2xs group text-left w-fit active:scale-95"
                                title={`Click to view full details for branch ${b.branchName}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#A991D4] group-hover:bg-white shrink-0"></span>
                                <span className="truncate max-w-[120px]">{b.branchName}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-[#6B5E78] italic">1 Main Location</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        {owner.subscriptionPlan && SAAS_PLANS[owner.subscriptionPlan] ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#F7F4FA] text-[#6B5E78] border border-[#E9DFF4]">
                            {SAAS_PLANS[owner.subscriptionPlan].name}
                          </span>
                        ) : (
                          <span className="text-[#6B5E78] text-xs">No Plan</span>
                        )}
                        <div className="text-xs text-[#6B5E78]">{owner.billingCycle ? owner.billingCycle.charAt(0).toUpperCase() + owner.billingCycle.slice(1) : 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="text-[#6B5E78]">Status:</span>{' '}
                          <span className={`font-medium ${owner.subscriptionStatus === 'Active' ? 'text-[#A991D4]' : 'text-[#C43D4D]'}`}>
                            {owner.subscriptionStatus || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6B5E78]">Payment:</span>{' '}
                          <span className="font-medium text-[#292431]">{owner.paymentStatus || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[#6B5E78] font-medium text-[11px] w-11">Start:</span>
                          <span className="font-semibold text-[#292431]">{formatDate(owner.subscriptionStart)}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[#6B5E78] font-medium text-[11px] w-11">Expiry:</span>
                          <span className="font-semibold text-[#A991D4]">{formatDate(owner.subscriptionExpiry)}</span>
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
                        <div className="flex items-center gap-1 border-t border-[#E9DFF4] pt-1.5">
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
                              className="p-1 text-[#967CC5] hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
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
                            onClick={() => {
                              setViewOwner(owner);
                              const gymId = owner.gymId?._id || owner.gymId;
                              if (gymId) fetchOwnerPackages(String(gymId));
                              else setOwnerPackages([]);
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer" title="View Details"
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
                            className="p-1.5 text-[#6B5E78] hover:text-rose-600 hover:bg-red-50 rounded-md transition-colors"
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
          <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DDEB] bg-[#FFFFFF] shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#292431]">Gym Owner Details</h2>
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
                    className="text-sm font-semibold text-[#A991D4] hover:underline flex items-center"
                  >
                    <Eye size={16} className="mr-1" /> View Public Page
                  </a>
                )}
                <button 
                  onClick={() => setViewOwner(null)}
                  className="p-1.5 text-[#6B5E78] hover:text-[#A991D4] hover:bg-[#F7F4FA] rounded-lg transition-colors"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
              {/* Owner Details */}
              <div>
                <h3 className="text-[#A991D4] font-bold text-xs uppercase tracking-wider mb-3">Owner Information</h3>
                <div className="border border-[#E5DDEB] rounded-xl overflow-hidden divide-y divide-[#E5DDEB] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DDEB]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">First Name</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.firstName || '—'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Last Name</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.lastName || '—'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Email</span>
                      <span className="font-semibold text-sm text-[#292431] break-all">{viewOwner.email || '—'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Mobile</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.mobile || '—'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DDEB]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Account Status</span>
                      <span className="inline-flex items-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(viewOwner.approvalStatus)}`}>
                          {viewOwner.approvalStatus}
                        </span>
                      </span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Joined Date</span>
                      <span className="font-semibold text-sm text-[#292431]">{formatDate(viewOwner.createdAt)}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">SaaS Plan</span>
                      <span className="font-bold text-sm text-[#A991D4]">
                        {viewOwner.subscriptionPlan && SAAS_PLANS[viewOwner.subscriptionPlan] 
                          ? SAAS_PLANS[viewOwner.subscriptionPlan].name 
                          : 'Standard Plan'}
                      </span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Plan Expiry Date</span>
                      <span className="font-semibold text-sm text-[#292431]">{formatDate(viewOwner.subscriptionExpiry)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gym Details */}
              <div>
                <h3 className="text-[#A991D4] font-bold text-xs uppercase tracking-wider mb-3">Gym Information</h3>
                {viewOwner.gymId?.logo && (
                  <div className="mb-4">
                    <img src={viewOwner.gymId.logo} alt={viewOwner.gymId.name} className="w-full max-h-48 object-cover rounded-xl border border-[#E5DDEB]" />
                  </div>
                )}
                <div className="border border-[#E5DDEB] rounded-xl overflow-hidden divide-y divide-[#E5DDEB] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DDEB]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Gym Name</span>
                      <span className="font-bold text-sm text-[#292431]">{viewOwner.gymId?.name || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Gym Type</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.gymId?.gymType || 'Standard'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Gym Status</span>
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
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Rating</span>
                      <span className="font-semibold text-sm text-[#292431]">⭐ {viewOwner.gymId?.rating || 'N/A'} {viewOwner.gymId?.reviewCount ? `(${viewOwner.gymId.reviewCount})` : ''}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DDEB]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Gym Email</span>
                      <span className="font-semibold text-sm text-[#292431] break-all">{viewOwner.gymId?.email || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Gym Phone</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.gymId?.phone || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Operating Hours</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.gymId?.operatingHours || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Training Mode</span>
                      <span className="font-semibold text-sm text-[#292431] capitalize">{viewOwner.gymId?.trainingMode || 'All Modes'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              {viewOwner.gymId?.services && viewOwner.gymId.services.length > 0 && (
                <div>
                  <h3 className="text-[#A991D4] font-bold text-xs uppercase tracking-wider mb-3">Services Offered</h3>
                  <div className="flex flex-wrap gap-2 p-3.5 bg-white border border-[#E5DDEB] rounded-xl shadow-sm">
                    {viewOwner.gymId.services.map((service: string, i: number) => (
                      <span key={i} className="bg-[#A991D4]/10 text-[#A991D4] border border-[#A991D4]/20 text-xs px-3 py-1 rounded-lg font-bold">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location & Operations */}
              <div>
                <h3 className="text-[#A991D4] font-bold text-xs uppercase tracking-wider mb-3">Location & Operations</h3>
                <div className="border border-[#E5DDEB] rounded-xl overflow-hidden divide-y divide-[#E5DDEB] bg-white shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DDEB]">
                    <div className="p-3.5 bg-white flex flex-col justify-center sm:col-span-2">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Address</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.gymId?.location?.address || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">City</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.gymId?.location?.city || viewOwner.city || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">State</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.gymId?.location?.state || 'Not provided'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DDEB]">
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">PIN Code</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.gymId?.location?.pinCode || 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Member Capacity</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.gymId?.memberCapacity ?? 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Trainer Capacity</span>
                      <span className="font-semibold text-sm text-[#292431]">{viewOwner.gymId?.trainerCapacity ?? 'Not provided'}</span>
                    </div>
                    <div className="p-3.5 bg-white flex flex-col justify-center">
                      <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider mb-1">Verification</span>
                      <span className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block w-fit">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registered Branch Locations */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[#A991D4] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={16} /> Registered Branch Locations ({viewOwner.branches?.length || 0})
                  </h3>
                  {viewOwner.branches && viewOwner.branches.length > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#A991D4] text-[#292431]">
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
                        className="bg-[#F7F4FA] border border-[#E9DFF4] rounded-xl p-4 shadow-xs hover:border-[#A991D4] hover:shadow-md transition-all space-y-2.5 cursor-pointer active:scale-98 group"
                        title="Click to view full branch details"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-[#E5DDEB] pb-2">
                          <div>
                            <h4 className="font-bold text-[#292431] text-base group-hover:text-[#A991D4] transition-colors">{branch.branchName}</h4>
                            <p className="text-xs text-[#6B5E78] font-semibold uppercase tracking-wider">Branch Code: {branch.branchCode || 'N/A'}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            branch.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {branch.status || 'ACTIVE'}
                          </span>
                        </div>
                        
                        <div className="text-xs space-y-1 text-[#6B5E78]">
                          <p className="flex items-start gap-1.5">
                            <MapPin size={14} className="text-[#A991D4] shrink-0 mt-0.5" />
                            <span className="font-medium text-[#292431]">
                              {branch.location?.address ? `${branch.location.address}, ` : ''}
                              {branch.location?.area ? `${branch.location.area}, ` : ''}
                              {branch.location?.city || viewOwner.city || ''} {branch.location?.pinCode ? `- ${branch.location.pinCode}` : ''}
                            </span>
                          </p>
                          {branch.phone && (
                            <p className="flex items-center gap-1.5">
                              <Phone size={13} className="text-[#A991D4] shrink-0" />
                              <span className="font-medium">{branch.phone}</span>
                            </p>
                          )}
                          {branch.email && (
                            <p className="flex items-center gap-1.5">
                              <Mail size={13} className="text-[#A991D4] shrink-0" />
                              <span className="font-medium">{branch.email}</span>
                            </p>
                          )}
                          {branch.operatingHours && (
                            <p className="flex items-center gap-1.5 text-[11px]">
                              <Clock size={13} className="text-[#6B5E78] shrink-0" />
                              <span>
                                Hours: {typeof branch.operatingHours === 'string' 
                                  ? branch.operatingHours 
                                  : `${branch.operatingHours.openingTime || ''} - ${branch.operatingHours.closingTime || ''}`}
                              </span>
                            </p>
                          )}
                        </div>
                        <div className="pt-2 border-t border-[#E9DFF4]/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-[#6B5E78] font-semibold">Branch Approval:</span>
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
                  <p className="text-sm text-[#6B5E78] italic bg-white p-3.5 border border-[#E5DDEB] rounded-xl">No additional branches registered for this gym owner.</p>
                )}
              </div>

              {/* Package Plans */}
              <div className="bg-[#F8FAF9] border border-[#E5DDEB] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4 border-b border-[#E5DDEB] pb-2">
                  <h3 className="text-[#A991D4] font-semibold flex items-center gap-2">
                    <CreditCard size={18} />
                    <span>Package Plans</span>
                  </h3>
                  {ownerPackages && ownerPackages.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#A991D4]/10 text-[#A991D4]">
                      {ownerPackages.length} {ownerPackages.length === 1 ? 'Plan' : 'Plans'}
                    </span>
                  )}
                </div>
                {ownerPackages && ownerPackages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ownerPackages.map((pkg: any) => {
                      const badge = BADGE_CONFIG[pkg.fitnessGoal] || BADGE_CONFIG['General Fitness'] || { icon: Dumbbell, accent: '#A991D4', bg: 'rgba(249,115,22,0.1)' };
                      const Icon = badge.icon;
                      return (
                        <div key={pkg._id} className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-4 flex flex-col justify-between shadow-xs">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: badge.bg }}>
                                  <Icon size={16} style={{ color: badge.accent }} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: badge.accent, backgroundColor: badge.bg }}>
                                  {pkg.fitnessGoal || 'General Fitness'}
                                </span>
                              </div>
                              {pkg.isPopular && (
                                <span className="text-[9px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase">
                                  Popular
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-[#292431] text-sm mb-1">{pkg.name}</h4>
                            <div className="flex items-baseline mb-2">
                              <span className="text-xl font-extrabold text-[#292431]">₹{pkg.monthlyPrice}</span>
                              <span className="text-xs text-[#6B5E78] ml-1">/ month</span>
                            </div>
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold">
                                {pkg.trainingType || 'Offline'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold">
                                {pkg.duration || '1 Month'}
                              </span>
                            </div>
                            {pkg.features && pkg.features.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-[#E5DDEB]">
                                <ul className="space-y-1">
                                  {pkg.features.slice(0, 3).map((f: string, i: number) => (
                                    <li key={i} className="text-[11px] text-[#6B5E78] flex items-center gap-1.5">
                                      <Check size={11} className="text-emerald-500 shrink-0" strokeWidth={3} />
                                      <span className="line-clamp-1">{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[#6B5E78]">No package plans configured for this gym.</p>
                )}
              </div>

              {/* AC Details & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[#A991D4] font-semibold mb-4 border-b border-[#E5DDEB] pb-2">AC Details</h3>
                  <div className="text-sm space-y-2">
                    <p><span className="text-[#6B5E78]">Type:</span> <span className="text-[#292431] font-medium">{viewOwner.gymId?.acDetails?.type || 'Not Specified'}</span></p>
                    {viewOwner.gymId?.acDetails?.areas && viewOwner.gymId.acDetails.areas.length > 0 && (
                      <p><span className="text-[#6B5E78]">Areas:</span> <span className="text-[#292431] font-medium">{viewOwner.gymId.acDetails.areas.join(', ')}</span></p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-[#A991D4] font-semibold mb-4 border-b border-[#E5DDEB] pb-2">Facilities</h3>
                  {viewOwner.gymId?.facilities && viewOwner.gymId.facilities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {viewOwner.gymId.facilities.map((f: string, i: number) => (
                        <span key={i} className="bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] text-xs px-2.5 py-1 rounded-md font-medium">{f}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#6B5E78]">No facilities selected.</p>
                  )}
                </div>
              </div>

              {/* Equipment (if present) */}
              {viewOwner.gymId?.equipment && viewOwner.gymId.equipment.length > 0 && (
                <div>
                  <h3 className="text-[#A991D4] font-semibold mb-4 border-b border-[#E5DDEB] pb-2">Equipment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewOwner.gymId.equipment.map((eq: any, i: number) => (
                      <div key={i} className="bg-[#FFFFFF] p-3 rounded-lg border border-[#E5DDEB]">
                        <p className="text-sm font-medium text-[#292431]">{eq.name} <span className="text-[#6B5E78] text-xs">x{eq.quantity}</span></p>
                        <p className="text-xs text-[#6B5E78] mt-1">{eq.category} • {eq.condition} • {eq.availability}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gym Images */}
              {viewOwner.gymId?.images && viewOwner.gymId.images.length > 0 && (
                <div>
                  <h3 className="text-[#A991D4] font-semibold mb-4 border-b border-[#E5DDEB] pb-2">Gym Images</h3>
                  <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {viewOwner.gymId.images.map((url: string, i: number) => (
                        <img key={i} src={url} alt={`Gym Image ${i+1}`} className="w-full h-24 object-cover rounded-lg border border-[#E5DDEB]" />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-3.5 bg-[#F8FAF9] border-t border-[#E5DDEB] flex items-center justify-end shrink-0">
              <button 
                onClick={() => setViewOwner(null)}
                className="px-5 py-2 bg-[#A991D4] text-[#292431] rounded-lg hover:bg-[#967CC5] transition-colors text-sm font-semibold shadow-sm"
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
          <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DDEB] bg-[#F7F4FA] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#A991D4]/10 text-[#A991D4] flex items-center justify-center font-bold">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#292431]">{viewBranch.branchName}</h2>
                  <p className="text-xs text-[#6B5E78] font-semibold">
                    Gym: <span className="text-[#A991D4]">{viewBranch.gymName || 'N/A'}</span> • Owner: <span className="text-[#292431]">{viewBranch.ownerName || 'N/A'}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewBranch(null)}
                className="p-1.5 text-[#6B5E78] hover:text-[#A991D4] hover:bg-white rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
              {/* Approval Actions Panel for Super Admin */}
              <div className="bg-[#F7F4FA] border border-[#E9DFF4] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div>
                  <h4 className="font-bold text-[#292431] text-xs uppercase tracking-wider">Branch Approval & Status</h4>
                  <p className="text-xs text-[#6B5E78] mt-0.5">
                    Current Status: <strong className={viewBranch.status === 'ACTIVE' ? 'text-emerald-600' : 'text-[#A991D4]'}>{viewBranch.status || 'ACTIVE'}</strong>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#F8FAF9] border border-[#E5DDEB] rounded-xl">
                <div>
                  <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider block">Branch Code</span>
                  <span className="font-bold text-sm text-[#292431]">{viewBranch.branchCode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider block">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${
                    viewBranch.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    {viewBranch.status || 'ACTIVE'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#6B5E78] uppercase tracking-wider block">Training Mode</span>
                  <span className="font-semibold text-sm text-[#292431] capitalize">{viewBranch.trainingMode || 'offline'}</span>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-[#A991D4] font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={15} /> Location Details
                </h3>
                <div className="p-4 bg-white border border-[#E5DDEB] rounded-xl space-y-1.5 text-[#292431]">
                  <p className="font-semibold">{viewBranch.location?.address || 'Address not specified'}</p>
                  <p className="text-xs text-[#6B5E78]">
                    {[viewBranch.location?.area, viewBranch.location?.city, viewBranch.location?.state, viewBranch.location?.pinCode].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>

              {/* Contact & Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#E5DDEB] rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-[#6B5E78] uppercase tracking-wider">Contact Info</h4>
                  {viewBranch.phone && (
                    <p className="flex items-center gap-2 text-xs text-[#292431] font-semibold">
                      <Phone size={14} className="text-[#A991D4]" /> {viewBranch.phone}
                    </p>
                  )}
                  {viewBranch.email && (
                    <p className="flex items-center gap-2 text-xs text-[#292431] font-semibold">
                      <Mail size={14} className="text-[#A991D4]" /> {viewBranch.email}
                    </p>
                  )}
                </div>
                <div className="p-4 bg-white border border-[#E5DDEB] rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-[#6B5E78] uppercase tracking-wider">Capacity & Hours</h4>
                  <p className="text-xs text-[#292431] flex items-center gap-2 font-semibold">
                    <Clock size={14} className="text-[#A991D4]" />
                    {typeof viewBranch.operatingHours === 'string' 
                      ? viewBranch.operatingHours 
                      : `${viewBranch.operatingHours?.openingTime || '06:00 AM'} - ${viewBranch.operatingHours?.closingTime || '10:00 PM'}`}
                  </p>
                  <p className="text-xs text-[#6B5E78]">
                    Capacity: <strong className="text-[#292431]">{viewBranch.memberCapacity || 'N/A'} Members</strong> • <strong className="text-[#292431]">{viewBranch.trainerCapacity || 'N/A'} Trainers</strong>
                  </p>
                </div>
              </div>

              {/* Branch Package Plans */}
              <div className="bg-[#F8FAF9] border border-[#E5DDEB] rounded-xl p-4 space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DDEB] pb-2.5">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-[#A991D4]" />
                    <h3 className="text-[#A991D4] font-bold text-xs uppercase tracking-wider">
                      Branch Package Plans
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#A991D4]/10 text-[#A991D4] w-fit">
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
                      <div key={idx} className="bg-white border border-[#E5DDEB] rounded-xl p-3.5 flex flex-col justify-between shadow-2xs hover:border-[#A991D4]/40 transition-all space-y-2">
                        <div>
                          <div className="flex justify-between items-start mb-1.5 border-b border-[#E5DDEB] pb-1.5">
                            <h4 className="font-bold text-[#292431] text-sm">{formatPlanName(plan.name)}</h4>
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold text-xs">
                              {rawPrice === 0 ? 'FREE' : `₹${rawPrice.toLocaleString('en-IN')}`}
                            </span>
                          </div>
                          
                          <div className="space-y-0.5 mb-2">
                            <p className="text-[11px] font-bold text-[#A991D4]">
                              Monthly: {rawPrice === 0 ? '₹0' : `₹${rawPrice.toLocaleString('en-IN')}/mo`}
                            </p>
                            {rawPrice > 0 && (
                              <p className="text-[10px] text-[#6B5E78]">
                                Annual: <strong className="text-[#292431]">₹{annualPrice.toLocaleString('en-IN')}/yr</strong> <span className="text-emerald-600 font-semibold">(2 mos free)</span>
                              </p>
                            )}
                          </div>

                          {plan.features && (
                            <p className="text-[11px] text-[#6B5E78] leading-relaxed whitespace-pre-line border-t border-[#E5DDEB]/60 pt-1.5">
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
                      <h4 className="text-xs font-bold text-[#6B5E78] uppercase tracking-wider mb-2">Services</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {viewBranch.services.map((s: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-[#A991D4]/10 text-[#A991D4] text-xs font-bold rounded-lg border border-[#A991D4]/20">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {viewBranch.facilities && viewBranch.facilities.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-[#6B5E78] uppercase tracking-wider mb-2">Facilities</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {viewBranch.facilities.map((f: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-[#F7F4FA] border border-[#E5DDEB] text-[#292431] text-xs font-medium rounded-lg">{f}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="px-6 py-3.5 bg-[#F8FAF9] border-t border-[#E5DDEB] flex items-center justify-end shrink-0">
              <button 
                onClick={() => setViewBranch(null)}
                className="px-5 py-2 bg-[#A991D4] text-[#292431] rounded-lg hover:bg-[#967CC5] transition-colors text-sm font-semibold shadow-sm"
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
          <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5DDEB] bg-[#FFFFFF] shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#292431]">Edit Gym Owner & Gym Details</h2>
                <p className="text-xs text-[#6B5E78] mt-0.5">Modify owner personal information and full gym registration profile.</p>
              </div>
              <button 
                onClick={() => setEditOwner(null)}
                className="p-1.5 text-[#6B5E78] hover:text-[#A991D4] hover:bg-[#F7F4FA] rounded-lg transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8 text-sm">
              {/* Account / Owner Information */}
              <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-5 shadow-sm">
                <h3 className="text-[#A991D4] font-semibold mb-4 border-b border-[#E5DDEB] pb-2 text-base">Owner Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">First Name</label>
                    <input 
                      value={editForm.firstName || ''} 
                      onChange={e => setEditForm({...editForm, firstName: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Last Name</label>
                    <input 
                      value={editForm.lastName || ''} 
                      onChange={e => setEditForm({...editForm, lastName: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Email</label>
                    <input 
                      value={editForm.email || ''} 
                      onChange={e => setEditForm({...editForm, email: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Mobile</label>
                    <input 
                      type="tel"
                      value={editForm.mobile || ''} 
                      onChange={e => setEditForm({...editForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10)})} 
                      maxLength={10}
                      placeholder="10-digit number"
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">City</label>
                    <input 
                      value={editForm.city || ''} 
                      onChange={e => setEditForm({...editForm, city: e.target.value})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Platform Subscription Plan</label>
                    <div className="w-full bg-[#F7F4FA] border border-[#E9DFF4] text-[#6B5E78] rounded-lg px-3 py-2 text-sm cursor-not-allowed">
                      {editForm.subscriptionPlan ? (SAAS_PLANS[editForm.subscriptionPlan]?.name || editForm.subscriptionPlan) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Plan Expiry Date</label>
                    <div className="w-full bg-[#F7F4FA] border border-[#E9DFF4] text-[#6B5E78] rounded-lg px-3 py-2 text-sm cursor-not-allowed">
                      {editForm.subscriptionExpiry || 'N/A'}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#6B5E78] mt-3 italic flex items-center gap-1">
                  <AlertCircle size={13}/> Note: Platform subscription and payment details are managed via the Subscriptions section.
                </p>
              </div>

              {/* Gym Details */}
              <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-5 shadow-sm">
                <h3 className="text-[#A991D4] font-semibold mb-4 border-b border-[#E5DDEB] pb-2 text-base">Gym Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Gym Name</label>
                    <input 
                      value={editForm.gymData?.name || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, name: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Gym Type</label>
                    <select 
                      value={editForm.gymData?.gymType || 'Commercial'} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, gymType: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    >
                      {GYM_TYPES.map(gt => <option key={gt} value={gt}>{gt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Rating (1 - 5)</label>
                    <input 
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={editForm.gymData?.rating ?? 5} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, rating: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Gym Email</label>
                    <input 
                      value={editForm.gymData?.email || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, email: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Gym Contact Phone</label>
                    <input 
                      type="tel"
                      value={editForm.gymData?.phone || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)}})} 
                      maxLength={10}
                      placeholder="10-digit number"
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Operating Hours</label>
                    <input 
                      value={editForm.gymData?.operatingHours || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, operatingHours: e.target.value}})} 
                      placeholder="e.g. 6 AM - 10 PM or 24/7"
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Training Mode</label>
                    <div className="flex gap-2">
                      {['offline', 'online', 'both'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setEditForm({...editForm, gymData: {...editForm.gymData, trainingMode: mode}})}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors capitalize ${
                            editForm.gymData?.trainingMode === mode 
                              ? 'bg-[#A991D4] text-[#292431] border-[#A991D4]' 
                              : 'bg-white text-[#6B5E78] border-[#E5DDEB] hover:border-[#A991D4]/50'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2 md:col-span-4">
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Gym Logo URL</label>
                    <div className="flex items-center gap-3">
                      <input 
                        value={editForm.gymData?.logo || ''} 
                        onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, logo: e.target.value}})} 
                        placeholder="https://example.com/logo.png"
                        className="flex-1 bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                      />
                      {editForm.gymData?.logo && (
                        <img 
                          src={editForm.gymData.logo} 
                          alt="Logo Preview" 
                          className="w-10 h-10 object-cover rounded-lg border border-[#E5DDEB]"
                          onError={(e) => { (e.target as any).style.display = 'none'; }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-5 shadow-sm">
                <h3 className="text-[#A991D4] font-semibold mb-2 border-b border-[#E5DDEB] pb-2 text-base">Services Offered</h3>
                <p className="text-xs text-[#6B5E78] mb-3">Click to toggle services offered at this gym:</p>
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
                            ? 'bg-[#A991D4] text-[#292431] border-[#A991D4]'
                            : 'bg-white text-[#6B5E78] border-[#E5DDEB] hover:border-[#A991D4]/50'
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
                    className="flex-1 bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#A991D4]"
                  />
                  <button
                    type="button"
                    onClick={addCustomService}
                    className="px-3 py-1.5 bg-[#A991D4]/10 text-[#A991D4] rounded-lg hover:bg-[#A991D4]/20 text-xs font-semibold border border-[#A991D4]/30 flex items-center gap-1"
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
              </div>

              {/* Location & Operations */}
              <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-5 shadow-sm">
                <h3 className="text-[#A991D4] font-semibold mb-4 border-b border-[#E5DDEB] pb-2 text-base">Location & Operations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Street Address</label>
                    <input 
                      value={editForm.gymData?.location?.address || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, address: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">City</label>
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
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">State</label>
                    <input 
                      value={editForm.gymData?.location?.state || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, state: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">PIN Code</label>
                    <input 
                      value={editForm.gymData?.location?.pinCode || ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, location: {...editForm.gymData?.location, pinCode: e.target.value}}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Approx. Members Capacity</label>
                    <input 
                      type="number"
                      value={editForm.gymData?.memberCapacity ?? ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, memberCapacity: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">Number of Trainers</label>
                    <input 
                      type="number"
                      value={editForm.gymData?.trainerCapacity ?? ''} 
                      onChange={e => setEditForm({...editForm, gymData: {...editForm.gymData, trainerCapacity: e.target.value}})} 
                      className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* AC Details & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-5 shadow-sm">
                  <h3 className="text-[#A991D4] font-semibold mb-3 border-b border-[#E5DDEB] pb-2 text-base">AC Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">AC Type</label>
                      <select
                        value={editForm.gymData?.acDetails?.type || 'Non-AC'}
                        onChange={e => setEditForm({
                          ...editForm,
                          gymData: {
                            ...editForm.gymData,
                            acDetails: { ...editForm.gymData?.acDetails, type: e.target.value }
                          }
                        })}
                        className="w-full bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4]"
                      >
                        {AC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    {editForm.gymData?.acDetails?.type !== 'Non-AC' && (
                      <div>
                        <label className="block text-xs font-semibold text-[#6B5E78] mb-1.5">AC Areas</label>
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
                                    ? 'bg-[#A991D4] text-[#292431] border-[#A991D4]'
                                    : 'bg-white text-[#6B5E78] border-[#E5DDEB] hover:border-[#A991D4]/50'
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

                <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-5 shadow-sm">
                  <h3 className="text-[#A991D4] font-semibold mb-3 border-b border-[#E5DDEB] pb-2 text-base">Facilities</h3>
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
                              ? 'bg-[#A991D4] text-[#292431] border-[#A991D4]'
                              : 'bg-white text-[#6B5E78] border-[#E5DDEB] hover:border-[#A991D4]/50'
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
                      className="flex-1 bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#A991D4]"
                    />
                    <button
                      type="button"
                      onClick={addCustomFacility}
                      className="px-3 py-1.5 bg-[#A991D4]/10 text-[#A991D4] rounded-lg hover:bg-[#A991D4]/20 text-xs font-semibold border border-[#A991D4]/30 flex items-center gap-1"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Package Plans */}
              <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-[#E5DDEB] pb-2">
                  <div>
                    <h3 className="text-[#A991D4] font-semibold text-base flex items-center gap-2">
                      <CreditCard size={18} />
                      <span>Package Plans</span>
                      <span className="text-xs bg-orange-100 text-[#967CC5] px-2 py-0.5 rounded-full font-bold">
                        {ownerPackages.length} Plans
                      </span>
                    </h3>
                    <p className="text-xs text-[#6B5E78]">Membership package plans offered to gym members for enrollment.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddPackage}
                    className="px-3.5 py-1.5 bg-[#A991D4] text-[#292431] rounded-lg hover:bg-[#967CC5] text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={14} /> Add Package Plan
                  </button>
                </div>

                {loadingPackages ? (
                  <div className="py-8 text-center text-stone-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-[#A991D4] mb-2" />
                    <p className="text-xs">Loading gym package plans...</p>
                  </div>
                ) : ownerPackages.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-[#E5DDEB] rounded-xl bg-[#F8FAF9]">
                    <Dumbbell className="mx-auto text-stone-400 mb-2" size={32} />
                    <p className="text-xs font-bold text-stone-700">No package plans configured yet</p>
                    <p className="text-[11px] text-stone-500 mb-3">Add member enrollment package plans for this gym.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddPackage}
                      className="px-3 py-1.5 bg-[#A991D4]/10 text-[#A991D4] hover:bg-[#A991D4]/20 text-xs font-semibold rounded-lg border border-[#A991D4]/30 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} /> Add First Package Plan
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                    {ownerPackages.map((pkg) => {
                      const badge = BADGE_CONFIG[pkg.fitnessGoal] || BADGE_CONFIG['General Fitness'] || { icon: Dumbbell, accent: '#A991D4', bg: 'rgba(249,115,22,0.1)' };
                      const Icon = badge.icon;
                      return (
                        <div
                          key={pkg._id}
                          className="h-full bg-white border border-[#E5DDEB] hover:border-orange-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                        >
                          <div className="flex-1 flex flex-col">
                            {/* Card Header with category badge & popular tag */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: badge.bg }}>
                                  <Icon size={16} style={{ color: badge.accent }} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: badge.accent, backgroundColor: badge.bg }}>
                                  {pkg.fitnessGoal || 'General Fitness'}
                                </span>
                              </div>
                              {pkg.isPopular && (
                                <span className="text-[9px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase">
                                  Popular
                                </span>
                              )}
                            </div>

                            <h4 className="font-extrabold text-sm text-stone-900 mb-1 leading-snug">{pkg.name}</h4>
                            {pkg.description ? (
                              <p className="text-[11px] text-stone-500 line-clamp-2 mb-2 leading-relaxed">{pkg.description}</p>
                            ) : (
                              <div className="mb-2" />
                            )}

                            <div className="flex items-baseline mb-2">
                              <span className="text-2xl font-black text-stone-900">₹{pkg.monthlyPrice}</span>
                              <span className="text-[11px] text-stone-500 ml-1">/ month</span>
                            </div>

                            <div className="flex items-center gap-1.5 mb-3">
                              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold">
                                {pkg.trainingType || 'Offline'}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold">
                                {pkg.duration || '1 Month'}
                              </span>
                            </div>

                            {/* Features List */}
                            <div className="border-t border-stone-100 pt-2.5 mb-3 flex-1 flex flex-col">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                                FEATURES INCLUDED:
                              </span>
                              <ul className="space-y-1 flex-1">
                                {(pkg.features || []).slice(0, 3).map((f: string, i: number) => (
                                  <li key={i} className="text-[11px] text-stone-600 flex items-start gap-1.5 leading-snug">
                                    <Check size={11} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />
                                    <span className="line-clamp-1">{f}</span>
                                  </li>
                                ))}
                                {(pkg.features || []).length > 3 && (
                                  <li className="text-[10px] text-orange-600 font-bold">
                                    +{pkg.features.length - 3} more features
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>

                          {/* Actions footer */}
                          <div className="pt-3 mt-auto border-t border-stone-100 flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleTogglePackageStatus(pkg)}
                              className={`flex-1 h-9 px-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                                pkg.status === 'Active'
                                  ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                  : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                              }`}
                            >
                              {pkg.status === 'Active' ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditPackage(pkg)}
                              className="flex-1 h-9 px-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 cursor-pointer whitespace-nowrap"
                              style={{ backgroundColor: badge.accent }}
                            >
                              Edit Plan
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePackage(pkg)}
                              className="h-9 px-2.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer shrink-0"
                              title="Delete Plan"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Gym Images */}
              <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-5 shadow-sm">
                <h3 className="text-[#A991D4] font-semibold mb-2 border-b border-[#E5DDEB] pb-2 text-base">Gym Images</h3>
                <p className="text-xs text-[#6B5E78] mb-4">Add or remove photo gallery URLs for this gym.</p>
                {editForm.gymData?.images && editForm.gymData.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {editForm.gymData.images.map((url: string, i: number) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-[#E5DDEB] bg-slate-50">
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
                  <p className="text-xs text-[#6B5E78] mb-3 italic">No images currently added.</p>
                )}
                <div className="flex items-center gap-2 max-w-lg">
                  <input
                    value={newImageInput}
                    onChange={e => setNewImageInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage(); } }}
                    placeholder="Enter image URL..."
                    className="flex-1 bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#A991D4]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-3 py-1.5 bg-[#A991D4]/10 text-[#A991D4] rounded-lg hover:bg-[#A991D4]/20 text-xs font-semibold border border-[#A991D4]/30 flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Photo
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-3.5 bg-[#F8FAF9] border-t border-[#E5DDEB] flex items-center justify-end space-x-3 shrink-0">
              <button 
                type="button"
                onClick={() => setEditOwner(null)}
                className="px-4 py-2 border border-[#E5DDEB] text-[#6B5E78] bg-white rounded-lg hover:bg-[#F7F4FA] transition-colors text-sm font-medium shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-5 py-2 bg-[#A991D4] text-[#292431] rounded-lg hover:bg-[#967CC5] transition-colors text-sm font-semibold flex items-center space-x-2 shadow-sm disabled:opacity-50"
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
            <div className="px-6 py-4 border-b border-[#E5DDEB] flex justify-between items-center bg-gradient-to-r from-[#F7F4FA] to-[#FFFFFF]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#292431]">Platform Subscription</h2>
                  <p className="text-[#6B5E78] text-xs">Payment & Plan details for {viewSubscription.firstName} {viewSubscription.lastName}</p>
                </div>
              </div>
              <button onClick={() => setViewSubscription(null)} className="p-2 text-[#6B5E78] hover:text-[#292431] bg-white rounded-full border border-[#E9DFF4] shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              
              {/* Active Plan Card */}
              <div className="bg-gradient-to-br from-[#F7F4FA] to-[#F7F4FA] rounded-xl p-5 border border-[#E9DFF4] shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E78] mb-1 block">Current Plan</span>
                    <h3 className="text-xl font-bold text-[#292431] flex items-center gap-2">
                      {viewSubscription.subscriptionPlan && SAAS_PLANS[viewSubscription.subscriptionPlan] 
                        ? SAAS_PLANS[viewSubscription.subscriptionPlan].name 
                        : 'No Active Plan'}
                      {viewSubscription.subscriptionStatus === 'Active' && (
                        <span className="bg-[#E9DFF4]/10 text-[#A991D4] text-[10px] px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-wide">Active</span>
                      )}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#292431]">
                      {viewSubscription.subscriptionPlan && SAAS_PLANS[viewSubscription.subscriptionPlan] 
                        ? SAAS_PLANS[viewSubscription.subscriptionPlan].price.split('/')[0] 
                        : '₹0'}
                    </div>
                    <div className="text-xs text-[#6B5E78]">{viewSubscription.billingCycle || 'N/A'} billing</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-[#E9DFF4] pt-4">
                  <div>
                    <p className="text-[10px] text-[#6B5E78] uppercase font-semibold">Start Date</p>
                    <p className="text-sm font-medium text-[#292431] mt-1">{formatDate(viewSubscription.subscriptionStart)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B5E78] uppercase font-semibold">Renewal Date</p>
                    <p className="text-sm font-medium text-[#292431] mt-1">{formatDate(viewSubscription.subscriptionExpiry)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B5E78] uppercase font-semibold">Payment Status</p>
                    <p className="text-sm font-medium text-[#292431] mt-1">{viewSubscription.paymentStatus || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#6B5E78] uppercase font-semibold">Transaction ID</p>
                    <p className="text-sm font-medium text-[#292431] mt-1 truncate" title={viewSubscription.transactionId || ''}>{viewSubscription.transactionId || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* History Section (Simulated) */}
              <div>
                <h3 className="text-sm font-bold text-[#292431] mb-3">Subscription History</h3>
                {viewSubscription.transactionId ? (
                  <div className="border border-[#E9DFF4] rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-[#6B5E78] uppercase bg-[#F7F4FA] border-b border-[#E9DFF4]">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 font-semibold">Plan</th>
                          <th className="px-4 py-3 font-semibold">Amount</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E9DFF4]">
                        <tr className="bg-white">
                          <td className="px-4 py-3 text-[#292431]">{formatDate(viewSubscription.subscriptionStart)}</td>
                          <td className="px-4 py-3 text-[#292431]">{viewSubscription.subscriptionPlan || 'N/A'}</td>
                          <td className="px-4 py-3 text-[#292431]">{viewSubscription.subscriptionPlan ? SAAS_PLANS[viewSubscription.subscriptionPlan]?.price.split('/')[0] : '₹0'}</td>
                          <td className="px-4 py-3"><span className="text-[#A991D4] bg-green-50 px-2 py-0.5 rounded text-xs border border-green-200">Paid</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#6B5E78] border border-dashed border-[#E5DDEB] rounded-lg bg-[#F7F4FA]">
                    No previous subscription history found.
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Package Plan Modal */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E5DDEB] my-auto">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E5DDEB]">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  {editingPackage ? 'Edit Package Plan' : 'Add New Package Plan'}
                </h3>
                <p className="text-xs text-stone-500">
                  Configure gym membership package plan for {editOwner?.gymId?.name || 'this gym'}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPackageModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Fitness Goal / Category *</label>
                <select
                  value={packageForm.fitnessGoal}
                  onChange={e => setPackageForm({ ...packageForm, fitnessGoal: e.target.value })}
                  className="w-full bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 outline-none focus:border-[#A991D4]"
                >
                  {Object.keys(BADGE_CONFIG).map(goal => (
                    <option key={goal} value={goal}>{goal}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Package Name *</label>
                <input
                  value={packageForm.name}
                  onChange={e => setPackageForm({ ...packageForm, name: e.target.value })}
                  placeholder="e.g. Strength Pro, Muscle Builder, Weight Loss Basic"
                  className="w-full bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 outline-none focus:border-[#A991D4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Training Type</label>
                  <select
                    value={packageForm.trainingType}
                    onChange={e => setPackageForm({ ...packageForm, trainingType: e.target.value })}
                    className="w-full bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 outline-none focus:border-[#A991D4]"
                  >
                    <option value="Offline">Offline</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Duration</label>
                  <select
                    value={packageForm.duration}
                    onChange={e => setPackageForm({ ...packageForm, duration: e.target.value })}
                    className="w-full bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 outline-none focus:border-[#A991D4]"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="1 Year">1 Year</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Monthly Price (₹) *</label>
                  <input
                    type="number"
                    value={packageForm.monthlyPrice}
                    onChange={e => setPackageForm({ ...packageForm, monthlyPrice: e.target.value })}
                    placeholder="e.g. 599"
                    className="w-full bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 outline-none focus:border-[#A991D4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Annual Price (₹)</label>
                  <input
                    type="number"
                    value={packageForm.annualPrice}
                    onChange={e => setPackageForm({ ...packageForm, annualPrice: e.target.value })}
                    placeholder="e.g. 5999"
                    className="w-full bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 outline-none focus:border-[#A991D4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={packageForm.description}
                  onChange={e => setPackageForm({ ...packageForm, description: e.target.value })}
                  placeholder="Short description of this package..."
                  className="w-full bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 outline-none focus:border-[#A991D4] resize-none"
                />
              </div>

              {/* Features list */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700">Features Included</label>
                  <button
                    type="button"
                    onClick={() => setPackageForm({ ...packageForm, features: [...packageForm.features, ''] })}
                    className="text-xs font-bold text-[#A991D4] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Add Feature
                  </button>
                </div>
                <div className="space-y-2">
                  {packageForm.features.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={feat}
                        onChange={e => {
                          const updated = [...packageForm.features];
                          updated[idx] = e.target.value;
                          setPackageForm({ ...packageForm, features: updated });
                        }}
                        placeholder={`Feature #${idx + 1}...`}
                        className="flex-1 bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl px-3 py-1.5 text-xs font-medium text-stone-800 outline-none focus:border-[#A991D4]"
                      />
                      {packageForm.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = packageForm.features.filter((_: any, i: number) => i !== idx);
                            setPackageForm({ ...packageForm, features: updated });
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={packageForm.isPopular}
                    onChange={e => setPackageForm({ ...packageForm, isPopular: e.target.checked })}
                    className="rounded text-[#A991D4] focus:ring-[#A991D4]"
                  />
                  <span>Mark as Popular Package</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500">Status:</span>
                  <button
                    type="button"
                    onClick={() => setPackageForm({
                      ...packageForm,
                      status: packageForm.status === 'Active' ? 'Inactive' : 'Active'
                    })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      packageForm.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {packageForm.status}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-stone-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPackageModalOpen(false)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePackage}
                className="px-5 py-2 bg-[#A991D4] hover:bg-[#967CC5] text-[#292431] rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {editingPackage ? 'Update Package' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminGymOwners;
