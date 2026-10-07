import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Edit2, 
  Users, 
  X, 
  Zap, 
  TrendingUp, 
  Crown, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Star,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

export interface PlanItem {
  id: string;
  name: string;
  badge: 'starter' | 'growth' | 'pro' | 'custom';
  isPopular: boolean;
  monthlyPrice: number;
  annualPrice: number;
  subscribers: number;
  features: string[];
}

const DEFAULT_PLANS: PlanItem[] = [
  {
    id: 'starter',
    name: 'Starter',
    badge: 'starter',
    isPopular: false,
    monthlyPrice: 999,
    annualPrice: 9990,
    subscribers: 145,
    features: [
      'Limited Customers',
      'Limited Trainers',
      'Limited AI Suggestions',
      'Basic Gym Management',
      'Gym Setup & Profile',
      'Member Management',
      'Trainer Management',
      'Membership Plans',
      'Basic Exercise Plans',
      'Basic Diet Plans',
      'Attendance Tracking',
      'Basic Reports',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    badge: 'growth',
    isPopular: true,
    monthlyPrice: 2499,
    annualPrice: 24990,
    subscribers: 312,
    features: [
      'More Customers',
      'More Trainers',
      'AI Analysis',
      'Personal Trainer Booking',
      'Personal Training Packages',
      'Online Sessions',
      'Chat',
      'Workout Videos',
      'Advanced Member Management',
      'Advanced Trainer Management',
      'Payment Tracking',
      'Invoice Generation',
      'Advanced Reports & Analytics',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'pro',
    isPopular: false,
    monthlyPrice: 4999,
    annualPrice: 49990,
    subscribers: 84,
    features: [
      'Unlimited Customers',
      'Unlimited Trainers',
      'Advanced AI',
      'Personal Training',
      'Multiple Branches',
      'Advanced Reports',
      'AI Chatbot',
      'Analytics Dashboard',
      'Full Management Suite',
      'Priority Support',
      'Custom Branding',
      'API Access',
      'Dedicated Account Manager',
    ],
  },
];

const BADGE_CONFIG: Record<string, { icon: any; accent: string; bg: string; label: string }> = {
  starter: { icon: Zap,        accent: '#6366F1', bg: 'rgba(99,102,241,0.1)',  label: 'Starter' },
  growth:  { icon: TrendingUp, accent: '#F97316', bg: 'rgba(249,115,22,0.1)',  label: 'Growth'  },
  pro:     { icon: Crown,      accent: '#EA580C', bg: 'rgba(234,88,12,0.12)',  label: 'Pro'     },
  custom:  { icon: Sparkles,   accent: '#22C55E', bg: 'rgba(34,197,94,0.12)',  label: 'Custom'  },
};

type FormData = {
  id?: string;
  name: string;
  badge: 'starter' | 'growth' | 'pro' | 'custom';
  monthlyPrice: string;
  annualPrice: string;
  subscribers: string;
  isPopular: boolean;
  features: string;
};

const STORAGE_KEY = 'gym_membership_plans_v2';

const GymAdminMembershipPlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load plans from localStorage or defaults
  const [plans, setPlans] = useState<PlanItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load plans from storage', e);
    }
    return DEFAULT_PLANS;
  });

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    badge: 'growth',
    monthlyPrice: '',
    annualPrice: '',
    subscribers: '',
    isPopular: false,
    features: '',
  });

  // Try to load any synced plans from Gym database if available
  useEffect(() => {
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`)
        .then(res => {
          const gymPlans = res.data?.gym?.subscriptionPlans;
          if (Array.isArray(gymPlans) && gymPlans.length > 0) {
            // merge if needed or preserve user state
          }
        })
        .catch(() => {});
    }
  }, [user?.gymId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const savePlansToStorage = (updatedPlans: PlanItem[]) => {
    setPlans(updatedPlans);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    // Sync to Gym DB if backend available
    if (user?.gymId) {
      api.put(`/gyms/${user.gymId}`, {
        subscriptionPlans: updatedPlans.map(p => ({
          name: p.name,
          price: p.monthlyPrice,
          duration: 'monthly',
          features: p.features.join(', ')
        }))
      }).catch(() => {});
    }
  };

  // Open modal for editing
  const handleOpenEditModal = (plan: PlanItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsCreatingNew(false);
    setFormData({
      id: plan.id,
      name: plan.name,
      badge: plan.badge,
      monthlyPrice: String(plan.monthlyPrice),
      annualPrice: String(plan.annualPrice),
      subscribers: String(plan.subscribers),
      isPopular: plan.isPopular,
      features: plan.features.join('\n'),
    });
    setShowEditModal(true);
  };

  // Open modal for new plan creation
  const handleOpenCreateModal = () => {
    setIsCreatingNew(true);
    setFormData({
      name: '',
      badge: 'custom',
      monthlyPrice: '1499',
      annualPrice: '14990',
      subscribers: '0',
      isPopular: false,
      features: 'Full Gym Access\nLocker Room Access\nStandard Equipment\nMobile App Access',
    });
    setShowEditModal(true);
  };

  // Click card handler: selects plan and opens comprehensive details
  const handleCardClick = (plan: PlanItem) => {
    setSelectedPlan(plan);
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const monthly = Math.max(0, parseInt(formData.monthlyPrice) || 0);
    const annual = Math.max(0, parseInt(formData.annualPrice) || monthly * 10);
    const subscribers = Math.max(0, parseInt(formData.subscribers) || 0);
    const featureList = formData.features
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    if (isCreatingNew) {
      const newPlan: PlanItem = {
        id: `plan_${Date.now()}`,
        name: formData.name.trim() || 'New Package',
        badge: formData.badge,
        isPopular: formData.isPopular,
        monthlyPrice: monthly,
        annualPrice: annual,
        subscribers,
        features: featureList.length > 0 ? featureList : ['Standard Gym Access'],
      };

      const updated = formData.isPopular
        ? plans.map(p => ({ ...p, isPopular: false })).concat(newPlan)
        : [...plans, newPlan];

      savePlansToStorage(updated);
      showToast(`Package "${newPlan.name}" created successfully!`);
    } else {
      const updated = plans.map(p => {
        if (p.id === formData.id) {
          return {
            ...p,
            name: formData.name.trim() || p.name,
            badge: formData.badge,
            isPopular: formData.isPopular,
            monthlyPrice: monthly,
            annualPrice: annual,
            subscribers,
            features: featureList.length > 0 ? featureList : p.features,
          };
        }
        if (formData.isPopular && p.id !== formData.id) {
          return { ...p, isPopular: false };
        }
        return p;
      });

      savePlansToStorage(updated);
      showToast(`Package "${formData.name}" updated successfully!`);
      if (selectedPlan && selectedPlan.id === formData.id) {
        const refreshed = updated.find(p => p.id === formData.id);
        if (refreshed) setSelectedPlan(refreshed);
      }
    }

    setShowEditModal(false);
  };

  // Delete plan
  const handleDeletePlan = (planId: string) => {
    if (plans.length <= 1) {
      alert('You must have at least one subscription package.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      const updated = plans.filter(p => p.id !== planId);
      savePlansToStorage(updated);
      setSelectedPlan(null);
      showToast('Plan deleted successfully.');
    }
  };

  // Toggle most popular
  const handleSetMostPopular = (planId: string) => {
    const updated = plans.map(p => ({
      ...p,
      isPopular: p.id === planId,
    }));
    savePlansToStorage(updated);
    const selected = updated.find(p => p.id === planId);
    if (selected) setSelectedPlan(selected);
    showToast('Updated most popular plan!');
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[110] bg-[#292524] text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} className="text-[#22C55E]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#292524] tracking-tight">Package Plans</h1>
          <p className="text-sm text-[#78716C] mt-1">Configure your gym's subscription packages, member tiers, and pricing.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-[#F97316]/20 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} /> Add Package Plan
          </button>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-2xl border border-[#E7E5E4] inline-flex shadow-xs">
          <button 
            onClick={() => setBillingCycle('monthly')} 
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly' 
                ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/20' 
                : 'text-[#78716C] hover:text-[#292524] hover:bg-stone-50'
            }`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setBillingCycle('annually')} 
            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              billingCycle === 'annually' 
                ? 'bg-[#F97316] text-white shadow-md shadow-[#F97316]/20' 
                : 'text-[#78716C] hover:text-[#292524] hover:bg-stone-50'
            }`}
          >
            Annually 
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Save 2 months
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid — Fully Interactive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const badge = BADGE_CONFIG[plan.badge] || BADGE_CONFIG.starter;
          const IconComp = badge.icon;
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          const durationLabel = billingCycle === 'monthly' ? '1 month' : '1 year';
          const isSelected = selectedPlan?.id === plan.id;

          return (
            <div 
              key={plan.id}
              onClick={() => handleCardClick(plan)}
              className={`rounded-3xl p-7 sm:p-8 relative flex flex-col justify-between transition-all duration-200 bg-white cursor-pointer group ${
                isSelected
                  ? 'ring-4 ring-[#F97316]/30 border-2 border-[#F97316] shadow-xl -translate-y-1'
                  : plan.isPopular
                  ? 'border-2 border-[#F97316] shadow-xl md:-translate-y-2 hover:-translate-y-3'
                  : 'border border-[#E7E5E4] hover:border-[#F97316]/50 hover:shadow-lg hover:-translate-y-1'
              }`}
            >
              {/* Most Popular Ribbon */}
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-[#F97316] text-white text-xs font-black uppercase tracking-wider py-1.5 px-5 rounded-full shadow-md flex items-center gap-1.5">
                    <Star size={12} className="fill-white" /> Most Popular
                  </span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-5 pt-1">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" 
                      style={{ backgroundColor: badge.bg }}
                    >
                      <IconComp size={22} style={{ color: badge.accent }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#292524] leading-tight group-hover:text-[#F97316] transition-colors">
                        {plan.name}
                      </h3>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: badge.accent }}>
                        {badge.label} Plan
                      </span>
                    </div>
                  </div>

                  {/* Edit Pencil Button */}
                  <button 
                    onClick={(e) => handleOpenEditModal(plan, e)}
                    className="p-2 text-[#78716C] hover:text-[#F97316] hover:bg-[#F97316]/10 rounded-xl transition-colors cursor-pointer"
                    title="Edit Plan Pricing & Details"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>

                {/* Price Display */}
                <div className="mb-6 flex items-baseline">
                  <span className="text-4xl font-black text-[#292524]">
                    &#8377;{price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[#78716C] ml-2 font-medium text-sm">
                    / {durationLabel}
                  </span>
                </div>

                {/* Subscribers Box */}
                <div className="flex items-center space-x-2 mb-6 bg-stone-50 p-3 rounded-2xl border border-[#E7E5E4]">
                  <Users size={18} className="text-[#F97316]" />
                  <span className="text-sm font-bold text-[#292524]">{plan.subscribers}</span>
                  <span className="text-sm text-[#78716C]">Active Subscribers</span>
                </div>

                {/* Features List */}
                <div className="mb-6">
                  <p className="text-xs font-bold text-[#292524] mb-3.5 uppercase tracking-wider">
                    Features Included:
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span 
                          className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center" 
                          style={{ backgroundColor: badge.bg }}
                        >
                          <Check size={12} style={{ color: badge.accent }} strokeWidth={3} />
                        </span>
                        <span className="text-xs sm:text-sm text-[#78716C] leading-snug">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-5 border-t border-[#E7E5E4] flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(plan);
                  }}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all border border-[#E7E5E4] hover:border-[#F97316] hover:bg-stone-50 text-[#292524]"
                >
                  View Details
                </button>
                <button 
                  onClick={(e) => handleOpenEditModal(plan, e)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all text-white shadow-md hover:opacity-90 active:scale-95" 
                  style={{ backgroundColor: badge.accent }}
                >
                  Edit Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================== VIEW PLAN DETAILS MODAL ===================== */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E7E5E4] my-auto flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-[#E7E5E4] pb-4 mb-5 shrink-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: BADGE_CONFIG[selectedPlan.badge]?.bg }}
                >
                  {(() => {
                    const Icon = BADGE_CONFIG[selectedPlan.badge]?.icon || Zap;
                    return <Icon size={24} style={{ color: BADGE_CONFIG[selectedPlan.badge]?.accent }} />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-[#292524]">{selectedPlan.name}</h2>
                    {selectedPlan.isPopular && (
                      <span className="bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#78716C] uppercase tracking-wider font-semibold">
                    {BADGE_CONFIG[selectedPlan.badge]?.label} Package Tier
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlan(null)} 
                className="p-1.5 text-[#78716C] hover:text-[#292524] rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 space-y-5 pr-1">
              {/* Pricing Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-orange-50/60 border border-orange-200 rounded-2xl text-center">
                  <span className="text-xs text-orange-800 font-semibold block">Monthly Price</span>
                  <span className="text-2xl font-black text-[#F97316]">
                    ₹{selectedPlan.monthlyPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-orange-700 block">per month</span>
                </div>
                <div className="p-4 bg-stone-50 border border-[#E7E5E4] rounded-2xl text-center">
                  <span className="text-xs text-[#78716C] font-semibold block">Annual Price</span>
                  <span className="text-2xl font-black text-[#292524]">
                    ₹{selectedPlan.annualPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block">Save ~2 months</span>
                </div>
              </div>

              {/* Subscriber Overview */}
              <div className="p-4 bg-white border border-[#E7E5E4] rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#F97316]">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#292524]">Active Subscribers</h4>
                    <p className="text-xs text-[#78716C]">Current gym members enrolled</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#F97316]">{selectedPlan.subscribers}</span>
                  <button 
                    onClick={() => {
                      setSelectedPlan(null);
                      navigate('/admin/members');
                    }}
                    className="text-[11px] text-[#F97316] hover:underline font-semibold flex items-center gap-1 justify-end mt-0.5"
                  >
                    View Members <ExternalLink size={10} />
                  </button>
                </div>
              </div>

              {/* Features List */}
              <div>
                <h4 className="text-xs font-bold text-[#292524] uppercase tracking-wider mb-3">
                  Included Features ({selectedPlan.features.length})
                </h4>
                <div className="space-y-2 bg-stone-50/70 p-4 rounded-2xl border border-[#E7E5E4]">
                  {selectedPlan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-[#292524]">
                      <CheckCircle2 size={15} className="text-[#22C55E] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 mt-4 border-t border-[#E7E5E4] flex flex-wrap gap-2 justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                {!selectedPlan.isPopular && (
                  <button
                    onClick={() => handleSetMostPopular(selectedPlan.id)}
                    className="px-3 py-2 text-xs font-bold text-[#F97316] hover:bg-orange-50 border border-orange-200 rounded-xl transition-colors"
                  >
                    Set as Most Popular
                  </button>
                )}
                <button
                  onClick={() => handleDeletePlan(selectedPlan.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Delete Plan"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="px-4 py-2 text-xs font-bold text-[#78716C] hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const planToEdit = selectedPlan;
                    setSelectedPlan(null);
                    handleOpenEditModal(planToEdit);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-[#F97316] text-white hover:bg-[#EA580C] rounded-xl transition-colors shadow-sm"
                >
                  Edit This Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== EDIT / CREATE PLAN MODAL ===================== */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E7E5E4] my-auto">
            <div className="flex justify-between items-center mb-6 border-b border-[#E7E5E4] pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[#292524]">
                  {isCreatingNew ? 'Create New Package Plan' : 'Edit Package Plan'}
                </h2>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Set prices, subscriber capacity, and features for this package tier.
                </p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="p-1.5 text-[#78716C] hover:text-[#292524] rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Plan Name */}
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1.5">
                  Plan Name *
                </label>
                <input 
                  required
                  type="text"
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Starter, Growth, Elite, Pro"
                  className="w-full border border-[#E7E5E4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] font-semibold text-[#292524]" 
                />
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1.5">
                    Monthly Price (₹) *
                  </label>
                  <input 
                    required 
                    type="number" 
                    value={formData.monthlyPrice} 
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })} 
                    className="w-full border border-[#E7E5E4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] font-semibold text-[#292524]" 
                    placeholder="999" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1.5">
                    Annual Price (₹) *
                  </label>
                  <input 
                    required 
                    type="number" 
                    value={formData.annualPrice} 
                    onChange={(e) => setFormData({ ...formData, annualPrice: e.target.value })} 
                    className="w-full border border-[#E7E5E4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] font-semibold text-[#292524]" 
                    placeholder="9990" 
                  />
                </div>
              </div>

              {/* Subscribers count & Badge */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1.5">
                    Active Subscribers
                  </label>
                  <input 
                    type="number" 
                    value={formData.subscribers} 
                    onChange={(e) => setFormData({ ...formData, subscribers: e.target.value })} 
                    className="w-full border border-[#E7E5E4] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] font-semibold text-[#292524]" 
                    placeholder="100" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1.5">
                    Plan Badge Style
                  </label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value as any })}
                    className="w-full border border-[#E7E5E4] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#F97316] font-semibold text-[#292524]"
                  >
                    <option value="starter">Starter (Indigo)</option>
                    <option value="growth">Growth (Orange)</option>
                    <option value="pro">Pro (Deep Orange)</option>
                    <option value="custom">Custom (Green)</option>
                  </select>
                </div>
              </div>

              {/* Checkbox: Most Popular */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-4 h-4 text-[#F97316] rounded border-[#E7E5E4] focus:ring-[#F97316]"
                />
                <label htmlFor="isPopular" className="text-xs font-bold text-[#292524] cursor-pointer">
                  Mark as "Most Popular" Plan
                </label>
              </div>

              {/* Features List (one per line) */}
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1.5 flex justify-between">
                  <span>Features Included (one per line) *</span>
                  <span className="text-[11px] normal-case text-[#78716C]">Press Enter for new feature</span>
                </label>
                <textarea 
                  required 
                  rows={6} 
                  value={formData.features} 
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })} 
                  className="w-full border border-[#E7E5E4] rounded-xl p-3 text-xs sm:text-sm outline-none focus:border-[#F97316] text-[#292524] leading-relaxed" 
                  placeholder="Unlimited Customers&#10;Unlimited Trainers&#10;AI Workout Suggestions&#10;Personal Training"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-[#E7E5E4] flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)} 
                  className="px-5 py-2.5 text-[#78716C] hover:bg-stone-100 rounded-xl font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95"
                >
                  Save Package Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminMembershipPlans;
