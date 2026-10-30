import { useState, useEffect, useCallback } from 'react';
import {
  Check, Edit2, Users, X, Zap, TrendingUp, Crown, Plus, CheckCircle2, Sparkles, Star,
  Trash2, Target, Dumbbell, Leaf, Activity, Cpu, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

// ── Types ─────────────────────────────────────────────────────────────────────

const FITNESS_GOALS = [
  'Weight Loss', 'Muscle Gain', 'Strength', 'General Fitness',
  'Bodybuilding', 'Yoga', 'CrossFit', 'Personal Training', 'Online Coaching',
] as const;
type FitnessGoal = typeof FITNESS_GOALS[number];

const TRAINING_TYPES = ['Offline', 'Online', 'Hybrid'] as const;
const BILLING_PLANS = ['monthly', 'annual', 'both'] as const;

// Suggested features per goal (editable by owner)
const SUGGESTED_FEATURES: Record<FitnessGoal, string[]> = {
  'Weight Loss': ['Fat-loss workout programs', 'Cardio training', 'Strength training', 'Weight and progress tracking'],
  'Muscle Gain': ['Muscle-building workout programs', 'Strength training', 'Progressive overload training', 'Muscle development progress tracking'],
  'Strength': ['Strength-focused workout programs', 'Progressive resistance training', 'Strength performance tracking'],
  'General Fitness': ['Full-body workout programs', 'Cardio training', 'Basic strength training', 'Flexibility and mobility exercises', 'General fitness progress tracking'],
  'Bodybuilding': ['Bodybuilding workout programs', 'Muscle development training', 'Body composition progress tracking'],
  'Yoga': ['Yoga sessions', 'Flexibility and mobility exercises', 'Breathing techniques'],
  'CrossFit': ['Functional fitness workouts', 'Strength and conditioning', 'Endurance training', 'Workout performance tracking'],
  'Personal Training': ['One-to-one training sessions', 'Personalized workout plans', 'Trainer progress reviews', 'Individual fitness assessments'],
  'Online Coaching': ['Online workout plans', 'Remote coaching sessions', 'Digital progress tracking', 'Online trainer support'],
};

interface GymPackage {
  _id: string;
  name: string;
  fitnessGoal: FitnessGoal;
  description?: string;
  features: string[];
  benefits: string[];
  trainingType: string;
  duration: string;
  monthlyPrice: number;
  annualPrice: number;
  availablePlans: string;
  isPopular: boolean;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const BADGE_CONFIG: Record<string, { icon: any; accent: string; bg: string }> = {
  'Weight Loss':       { icon: Target,    accent: '#B76E79', bg: 'rgba(183,110,121,0.12)'  },
  'Muscle Gain':       { icon: Dumbbell,  accent: '#B76E79', bg: 'rgba(183,110,121,0.15)'  },
  'Strength':          { icon: Zap,       accent: '#9F5965', bg: 'rgba(59,130,246,0.15)' },
  'General Fitness':   { icon: Activity,  accent: '#15803D', bg: 'rgba(52, 211, 153,0.12)'  },
  'Bodybuilding':      { icon: Crown,     accent: '#B76E79', bg: 'rgba(183,110,121,0.12)'  },
  'Yoga':              { icon: Leaf,      accent: '#38BDF8', bg: 'rgba(56,189,248,0.12)' },
  'CrossFit':          { icon: TrendingUp,accent: '#B45309', bg: 'rgba(251, 191, 36,0.12)' },
  'Personal Training': { icon: Users,     accent: '#B76E79', bg: 'rgba(183,110,121,0.15)'  },
  'Online Coaching':   { icon: Cpu,       accent: '#B76E79', bg: 'rgba(183,110,121,0.12)'  },
};

// ── Empty form state ──────────────────────────────────────────────────────────
const emptyForm = () => ({
  name: '',
  fitnessGoal: '' as FitnessGoal | '',
  description: '',
  features: [''],
  benefits: [''],
  trainingType: 'Offline' as string,
  duration: '1 Month',
  monthlyPrice: '',
  annualPrice: '',
  availablePlans: 'both' as string,
  isPopular: false,
  status: 'Active' as 'Active' | 'Inactive',
});

// ── Main Component ─────────────────────────────────────────────────────────────
const GymAdminMembershipPlans = () => {
  const { user } = useAuth();

  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [filterGoal, setFilterGoal] = useState<FitnessGoal | ''>('');
  const [filterStatus, setFilterStatus] = useState<'Active' | 'Inactive' | ''>('');
  const [billingView, setBillingView] = useState<'monthly' | 'annually'>('monthly');

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(emptyForm());
  const [showSuggestBanner, setShowSuggestBanner] = useState(false);

  // ── Fetch packages ─────────────────────────────────────────────────────────
  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (filterGoal) params.fitnessGoal = filterGoal;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/gym-packages', { params });
      setPackages(res.data.packages || []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  }, [filterGoal, filterStatus]);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Open create modal ──────────────────────────────────────────────────────
  const openCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm(emptyForm());
    setShowSuggestBanner(false);
    setShowModal(true);
  };

  // ── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = (pkg: GymPackage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEditing(true);
    setEditingId(pkg._id);
    setForm({
      name: pkg.name,
      fitnessGoal: pkg.fitnessGoal,
      description: pkg.description || '',
      features: pkg.features.length ? pkg.features : [''],
      benefits: pkg.benefits.length ? pkg.benefits : [''],
      trainingType: pkg.trainingType,
      duration: pkg.duration,
      monthlyPrice: String(pkg.monthlyPrice),
      annualPrice: String(pkg.annualPrice),
      availablePlans: pkg.availablePlans,
      isPopular: pkg.isPopular,
      status: pkg.status,
    });
    setShowSuggestBanner(false);
    setShowModal(true);
  };

  // ── Handle package name / goal change → show suggestion banner ───────────
  const handleGoalChange = (goal: FitnessGoal | '') => {
    setForm(f => ({
      ...f,
      fitnessGoal: goal,
      name: goal || '',
    }));
    if (goal && !isEditing) setShowSuggestBanner(true);
  };

  const applySuggestions = () => {
    if (!form.fitnessGoal) return;
    const suggested = SUGGESTED_FEATURES[form.fitnessGoal as FitnessGoal] || [];
    setForm(f => ({ ...f, features: suggested.length ? suggested : [''] }));
    setShowSuggestBanner(false);
  };

  // ── Feature / Benefit list helpers ────────────────────────────────────────
  const updateListItem = (field: 'features' | 'benefits', idx: number, val: string) => {
    setForm(f => {
      const list = [...f[field]];
      list[idx] = val;
      return { ...f, [field]: list };
    });
  };
  const addListItem = (field: 'features' | 'benefits') => {
    setForm(f => ({ ...f, [field]: [...f[field], ''] }));
  };
  const removeListItem = (field: 'features' | 'benefits', idx: number) => {
    setForm(f => {
      const list = f[field].filter((_, i) => i !== idx);
      return { ...f, [field]: list.length ? list : [''] };
    });
  };

  // ── Save (create or update) ────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = form.name.trim() || form.fitnessGoal;
    const finalGoal = form.fitnessGoal || (FITNESS_GOALS.includes(finalName as any) ? finalName : '');
    if (!finalGoal) { showToast('Please select a Package Name', 'error'); return; }
    if (!finalName) { showToast('Package name is required', 'error'); return; }
    const monthly = Number(form.monthlyPrice);
    const annual = Number(form.annualPrice);
    if (isNaN(monthly) || monthly < 0) { showToast('Monthly price must be a non-negative number', 'error'); return; }
    if (isNaN(annual) || annual < 0) { showToast('Annual price must be a non-negative number', 'error'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        name: finalName,
        fitnessGoal: finalGoal,
        features: form.features.filter(f => f.trim()),
        benefits: form.benefits.filter(b => b.trim()),
        monthlyPrice: monthly,
        annualPrice: annual,
      };

      if (isEditing && editingId) {
        await api.put(`/gym-packages/${editingId}`, payload);
        showToast('Package updated successfully!');
      } else {
        await api.post('/gym-packages', payload);
        showToast('Package created successfully!');
      }
      setShowModal(false);
      await fetchPackages();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save package', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle status ──────────────────────────────────────────────────────────
  const handleToggleStatus = async (pkg: GymPackage, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = pkg.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/gym-packages/${pkg._id}/status`, { status: newStatus });
      showToast(`Package ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
      await fetchPackages();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (pkg: GymPackage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete package "${pkg.name}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/gym-packages/${pkg._id}`);
      showToast('Package deleted');
      await fetchPackages();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete package', 'error');
    }
  };

  // ── Filtered display list ─────────────────────────────────────────────────
  const displayed = packages;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[110] px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${toast.type === 'error' ? 'bg-red-900 border-red-700 text-white' : 'bg-[#FFFFFF] text-white border-[#E7DADD]'}`}>
          {toast.type === 'error' ? <X size={18} className="text-red-400" /> : <CheckCircle2 size={18} className="text-[#15803D]" />}
          <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#292524] tracking-tight">Package Plans</h1>
          <p className="text-sm text-[#57534E] mt-1">Create and manage fitness packages for your gym members.</p>
        </div>
        <button onClick={openCreate}
          className="px-4 py-2.5 bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold font-bold rounded-xl flex items-center gap-2 shadow-md shadow-[#B76E79]/30 transition-all active:scale-95 text-sm cursor-pointer">
          <Plus size={18} /> Add Package Plan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Billing toggle */}
        <div className="bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#E7DADD] inline-flex shadow-xs">
          {(['monthly', 'annually'] as const).map(c => (
            <button key={c} onClick={() => setBillingView(c)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${billingView === c ? 'bg-[#B76E79] text-white shadow-md shadow-[#B76E79]/30' : 'text-[#57534E] hover:text-[#292524]'}`}>
              {c === 'monthly' ? 'Monthly' : 'Annually'}
              {c === 'annually' && <span className="ml-2 text-xs bg-[#B76E79]/15 text-emerald-400 border border-[#E7DADD]/30 px-1.5 py-0.5 rounded-full">Save 2 mo</span>}
            </button>
          ))}
        </div>

        {/* Goal filter */}
        <select value={filterGoal} onChange={e => setFilterGoal(e.target.value as any)}
          className="border border-[#E7DADD] rounded-xl px-3 py-2 text-sm text-[#292524] outline-none focus:border-[#B76E79] bg-[#FFFFFF] cursor-pointer">
          <option value="">All Goals</option>
          {FITNESS_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        {/* Status filter */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="border border-[#E7DADD] rounded-xl px-3 py-2 text-sm text-[#292524] outline-none focus:border-[#B76E79] bg-[#FFFFFF] cursor-pointer">
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#B76E79] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 mx-auto bg-[#B76E79]/15 border border-[#B76E79]/30 rounded-3xl flex items-center justify-center">
            <Sparkles size={36} className="text-[#B76E79]" />
          </div>
          <h3 className="text-xl font-bold text-[#292524]">No packages yet</h3>
          <p className="text-[#57534E] text-sm">Create your first fitness package for members to discover.</p>
          <button onClick={openCreate}
            className="px-6 py-3 bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold font-bold rounded-xl shadow-md shadow-[#B76E79]/30 transition-all cursor-pointer">
            <Plus size={16} className="inline mr-2" />Add Package Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {displayed.map(pkg => {
            const badge = BADGE_CONFIG[pkg.fitnessGoal] || BADGE_CONFIG['General Fitness'];
            const IconComp = badge.icon;
            const price = billingView === 'monthly' ? pkg.monthlyPrice : pkg.annualPrice;
            const durLabel = billingView === 'monthly' ? '/ month' : '/ year';

            return (
              <div key={pkg._id}
                className={`h-full rounded-3xl p-7 relative flex flex-col justify-between bg-[#FFFFFF] ${
                  pkg.status === 'Inactive' ? 'opacity-60' : ''
                } ${pkg.isPopular ? 'border-2 border-[#B76E79] shadow-[0_0_25px_rgba(183,110,121,0.2)]' : 'border border-[#E7DADD] shadow-sm hover:border-[#B76E79]/50'} transition-all`}>

                {pkg.isPopular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-[#B76E79] text-white font-bold text-xs font-black uppercase tracking-wider py-1.5 px-5 rounded-full shadow-md shadow-[#B76E79]/30 flex items-center gap-1.5">
                      <Star size={12} className="fill-white" /> Most Popular
                    </span>
                  </div>
                )}

                {pkg.status === 'Inactive' && (
                  <div className="absolute top-3 right-14 bg-slate-800 text-[#57534E] border border-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">Inactive</div>
                )}

                <div className="flex-1 flex flex-col">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/10" style={{ backgroundColor: badge.bg }}>
                        <IconComp size={22} style={{ color: badge.accent }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-[#292524] leading-tight">{pkg.name}</h3>
                        {pkg.name.trim().toLowerCase() !== pkg.fitnessGoal.trim().toLowerCase() && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 border border-white/10" style={{ color: badge.accent, backgroundColor: badge.bg }}>
                            {pkg.fitnessGoal}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={e => openEdit(pkg, e)} className="p-2 text-[#57534E] hover:text-[#B76E79] hover:bg-[#F3E8E8] rounded-xl transition-colors cursor-pointer" title="Edit">
                      <Edit2 size={16} />
                    </button>
                  </div>

                  {pkg.description ? (
                    <p className="text-xs text-[#57534E] mb-4 leading-relaxed line-clamp-3">{pkg.description}</p>
                  ) : (
                    <div className="mb-4" />
                  )}

                  <div className="mb-4 flex items-baseline">
                    <span className="text-3xl font-black text-[#292524]">₹{price.toLocaleString('en-IN')}</span>
                    <span className="text-[#57534E] ml-2 font-medium text-sm">{durLabel}</span>
                  </div>

                  {/* Training type & duration badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs bg-[#F3E8E8] border border-[#E7DADD] text-[#57534E] font-semibold px-2.5 py-1 rounded-full">{pkg.trainingType}</span>
                    <span className="text-xs bg-[#F3E8E8] border border-[#E7DADD] text-[#57534E] font-semibold px-2.5 py-1 rounded-full">{pkg.duration}</span>
                  </div>

                  {/* Features List */}
                  {pkg.features.length > 0 && (
                    <div className="flex-1 flex flex-col mb-4">
                      <p className="text-xs font-bold text-[#292524] mb-2.5 uppercase tracking-wider">Features Included:</p>
                      <ul className="space-y-2 flex-1">
                        {pkg.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: badge.bg }}>
                              <Check size={10} style={{ color: badge.accent }} strokeWidth={3} />
                            </span>
                            <span className="text-xs text-[#292524] leading-snug">{f}</span>
                          </li>
                        ))}
                        {pkg.features.length > 4 && (
                          <li className="text-xs text-[#B76E79] font-semibold">+{pkg.features.length - 4} more features</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer Buttons - pinned to bottom */}
                <div className="pt-5 mt-auto border-t border-[#E7DADD] flex items-center gap-2 shrink-0">
                  <button onClick={e => handleToggleStatus(pkg, e)}
                    className={`flex-1 h-10 px-3 rounded-xl font-bold text-xs transition-colors border flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${pkg.status === 'Active' ? 'border-[#E7DADD]/30 text-emerald-400 bg-[#B76E79]/10 hover:bg-[#B76E79]/20' : 'border-[#E7DADD] text-[#57534E] bg-[#F3E8E8] hover:border-[#B76E79]'}`}>
                    {pkg.status === 'Active' ? <ToggleRight size={14} className="shrink-0" /> : <ToggleLeft size={14} className="shrink-0" />}
                    <span>{pkg.status === 'Active' ? 'Active' : 'Inactive'}</span>
                  </button>
                  <button onClick={e => openEdit(pkg, e)}
                    className="flex-1 h-10 px-3 rounded-xl font-bold text-xs transition-colors text-white shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap bg-[#B76E79] hover:bg-[#9F5965]">
                    <span>Edit Plan</span>
                  </button>
                  <button onClick={e => handleDelete(pkg, e)}
                    className="h-10 px-3.5 rounded-xl font-bold text-xs transition-colors border border-rose-900/40 bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                    title="Delete Plan">
                    <Trash2 size={13} className="shrink-0" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE / EDIT MODAL ── */}
      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E7DADD] my-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b border-[#E7DADD] pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-[#292524]">{isEditing ? 'Edit Package Plan' : 'Create New Package Plan'}</h2>
                <p className="text-xs text-[#57534E] mt-0.5">Configure fitness goal, pricing, features, and availability.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-[#57534E] hover:text-[#292524] rounded-lg hover:bg-[#F3E8E8] transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              {/* Package Name (Goal / Category) Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Package Name *</span>
                  {form.fitnessGoal && (
                    <span className="text-[10px] font-semibold text-[#B76E79]">Selected</span>
                  )}
                </label>
                <div className="relative">
                  <select
                    required
                    value={form.fitnessGoal}
                    onChange={e => handleGoalChange(e.target.value as FitnessGoal)}
                    className="w-full border border-[#E7DADD] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#B76E79] text-[#292524] font-semibold bg-[#F3E8E8] cursor-pointer appearance-none pr-9 transition-colors shadow-sm"
                  >
                    <option value="">-- Select Package Name --</option>
                    {FITNESS_GOALS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#57534E] pointer-events-none" />
                </div>
                {!form.fitnessGoal && (
                  <p className="text-[10px] text-red-400 mt-1">Required – select a package</p>
                )}
              </div>

              {/* Suggestion banner */}
              {showSuggestBanner && form.fitnessGoal && (
                <div className="p-3 bg-[#B76E79]/10 border border-[#B76E79]/30 rounded-xl flex items-start gap-3">
                  <Info size={16} className="text-[#B76E79] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#292524]">Suggested features available for "{form.fitnessGoal}"</p>
                    <p className="text-xs text-[#57534E] mt-0.5">You can apply the suggested features or customize your own.</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={applySuggestions} className="text-xs font-bold text-[#B76E79] hover:underline cursor-pointer">Apply</button>
                    <button type="button" onClick={() => setShowSuggestBanner(false)} className="text-xs text-[#57534E] hover:underline cursor-pointer">Dismiss</button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1.5">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this package..."
                  className="w-full border border-[#E7DADD] bg-[#F3E8E8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B76E79] text-[#292524] placeholder:text-[#57534E] leading-relaxed resize-none" />
              </div>

              {/* Features */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider">Package Features</label>
                  <button type="button" onClick={() => addListItem('features')} className="text-xs text-[#B76E79] font-bold hover:underline flex items-center gap-1 cursor-pointer">
                    <Plus size={12} /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={f} onChange={e => updateListItem('features', i, e.target.value)}
                        placeholder={`Feature ${i + 1}`}
                        className="flex-1 border border-[#E7DADD] bg-[#F3E8E8] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#B76E79] text-[#292524] placeholder:text-[#57534E]" />
                      {form.features.length > 1 && (
                        <button type="button" onClick={() => removeListItem('features', i)} className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/25 transition-colors cursor-pointer">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider">Package Benefits</label>
                  <button type="button" onClick={() => addListItem('benefits')} className="text-xs text-[#B76E79] font-bold hover:underline flex items-center gap-1 cursor-pointer">
                    <Plus size={12} /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {form.benefits.map((b, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={b} onChange={e => updateListItem('benefits', i, e.target.value)}
                        placeholder={`Benefit ${i + 1}`}
                        className="flex-1 border border-[#E7DADD] bg-[#F3E8E8] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#B76E79] text-[#292524] placeholder:text-[#57534E]" />
                      {form.benefits.length > 1 && (
                        <button type="button" onClick={() => removeListItem('benefits', i)} className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/25 transition-colors cursor-pointer">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Type, Duration, Available Plans */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1.5">Training Type</label>
                  <select value={form.trainingType} onChange={e => setForm(f => ({ ...f, trainingType: e.target.value }))}
                    className="w-full border border-[#E7DADD] bg-[#F3E8E8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#B76E79] text-[#292524]">
                    {TRAINING_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1.5">Duration</label>
                  <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full border border-[#E7DADD] bg-[#F3E8E8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#B76E79] text-[#292524]">
                    {['1 Month', '3 Months', '6 Months', '1 Year'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1.5">Available Plans</label>
                  <select value={form.availablePlans} onChange={e => setForm(f => ({ ...f, availablePlans: e.target.value }))}
                    className="w-full border border-[#E7DADD] bg-[#F3E8E8] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#B76E79] text-[#292524]">
                    <option value="both">Monthly &amp; Annual</option>
                    <option value="monthly">Monthly Only</option>
                    <option value="annual">Annual Only</option>
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                {(form.availablePlans === 'monthly' || form.availablePlans === 'both') && (
                  <div>
                    <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1.5">Monthly Price (₹) *</label>
                    <input required type="number" min="0" value={form.monthlyPrice}
                      onChange={e => setForm(f => ({ ...f, monthlyPrice: e.target.value }))}
                      placeholder="e.g. 999" className="w-full border border-[#E7DADD] bg-[#F3E8E8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B76E79] text-[#292524] font-semibold" />
                  </div>
                )}
                {(form.availablePlans === 'annual' || form.availablePlans === 'both') && (
                  <div>
                    <label className="block text-xs font-bold text-[#57534E] uppercase tracking-wider mb-1.5">Annual Price (₹) *</label>
                    <input required type="number" min="0" value={form.annualPrice}
                      onChange={e => setForm(f => ({ ...f, annualPrice: e.target.value }))}
                      placeholder="e.g. 9990" className="w-full border border-[#E7DADD] bg-[#F3E8E8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#B76E79] text-[#292524] font-semibold" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPopular} onChange={e => setForm(f => ({ ...f, isPopular: e.target.checked }))}
                    className="w-4 h-4 text-[#B76E79] rounded border-[#E7DADD] bg-[#F3E8E8] focus:ring-[#B76E79]" />
                  <span className="text-xs font-bold text-[#292524]">Mark as "Most Popular"</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold text-[#57534E]">Status:</span>
                  <button type="button" onClick={() => setForm(f => ({ ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' }))}
                    className={`text-xs font-bold px-3 py-1 rounded-full transition-colors cursor-pointer ${form.status === 'Active' ? 'bg-[#B76E79]/15 text-emerald-400 border border-[#E7DADD]/30' : 'bg-slate-800 text-[#57534E] border border-slate-700'}`}>
                    {form.status}
                  </button>
                </label>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-[#E7DADD] flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-[#57534E] hover:bg-[#F3E8E8] hover:text-[#292524] rounded-xl font-bold text-xs transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold font-bold rounded-xl text-xs transition-all shadow-md shadow-[#B76E79]/30 active:scale-95 disabled:opacity-60 flex items-center gap-2 cursor-pointer">
                  {saving && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {isEditing ? 'Update Package' : 'Create Package'}
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
