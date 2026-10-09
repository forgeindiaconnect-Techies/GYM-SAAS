import { useState, useEffect } from 'react';
import {
  CreditCard, Zap, Star, Crown, Sparkles, CheckCircle, XCircle,
  Users, Dumbbell, Building2, UserCheck, Edit3, Eye, ToggleLeft,
  ToggleRight, Plus, Search, Calendar, IndianRupee, Clock, AlertCircle
} from 'lucide-react';

import api from '../../utils/api';

// ─── SaaS Plan Definitions ────────────────────────────────────────────────────
const SAAS_PLANS = [
  {
    key: 'FREE_TRIAL',
    name: 'Free Trial',
    tagline: 'Try AI GYM risk-free',
    badge: '1 DAY',
    icon: Zap,
    iconColor: 'text-[#FED7AA]',
    iconBg: 'bg-[#FFFDF8]',
    priceMonthly: 0,
    priceAnnual: 0,
    savingsAnnual: 0,
    priceDisplay: '₹0',
    pricePeriod: '/ 1 day',
    platformLimits: '10 members • 1 trainer • 1 branch',
    limits: { members: 10, trainers: 1, staff: 1, branches: 1 },
    status: 'Active',
    subscribedGyms: 12,
    features: [
      { text: 'Basic Gym Profile', included: true },
      { text: 'Basic Member Management', included: true },
      { text: 'Basic Attendance', included: true },
      { text: 'Basic AI Fitness Assessment', included: true },
      { text: '1 AI Workout Plan', included: true },
      { text: 'Basic Diet Recommendation', included: true },
      { text: 'Limited AI Chat', included: true },
      { text: 'Basic Progress Tracking', included: true },
      { text: 'Advanced Analytics', included: false },
      { text: 'Trainer Booking', included: false },
      { text: '1-on-1 Coaching', included: false },
    ],
  },
  {
    key: 'SILVER',
    name: 'Silver',
    tagline: 'Beginner package for growing gyms',
    badge: 'BEGINNER',
    icon: Star,
    iconColor: 'text-[#FED7AA]',
    iconBg: 'bg-slate-100',
    priceMonthly: 799,
    priceAnnual: 7190,
    savingsAnnual: 1598,
    priceDisplay: '₹799',
    pricePeriod: '/mo',
    platformLimits: '100 members • 5 trainers • 1 branch',
    limits: { members: 100, trainers: 5, staff: 2, branches: 1 },
    status: 'Active',
    subscribedGyms: 38,
    features: [
      { text: 'Gym Profile Management', included: true },
      { text: 'Member Management', included: true },
      { text: 'Trainer & Staff Management', included: true },
      { text: 'AI Fitness Assessment', included: true },
      { text: 'Basic AI Workout & Diet Plans', included: true },
      { text: 'AI Chat Assistant', included: true },
      { text: 'Basic Reports (3 types)', included: true },
      { text: 'Membership Tracking', included: true },
      { text: 'Advanced Analytics', included: false },
      { text: 'Trainer Booking', included: false },
      { text: '1-on-1 Coaching', included: false },
    ],
  },
  {
    key: 'GOLD',
    name: 'Gold',
    tagline: 'Most popular all-in-one powerhouse',
    badge: 'MOST POPULAR',
    popular: true,
    icon: Crown,
    iconColor: 'text-[#F97316]',
    iconBg: 'bg-[#F97316]/10',
    priceMonthly: 1499,
    priceAnnual: 13490,
    savingsAnnual: 4498,
    priceDisplay: '₹1,499',
    pricePeriod: '/mo',
    platformLimits: '500 members • 15 trainers • 2 branches',
    limits: { members: 500, trainers: 15, staff: 5, branches: 2 },
    status: 'Active',
    subscribedGyms: 45,
    features: [
      { text: 'Everything in Silver', included: true },
      { text: 'Advanced AI Workout & Diet Plans', included: true },
      { text: 'AI Fitness Assistant', included: true },
      { text: 'Goal-Based Workout Recs', included: true },
      { text: 'Trainer Discovery & Booking', included: true },
      { text: 'Trainer Scheduling', included: true },
      { text: 'Detailed Progress Analytics', included: true },
      { text: 'Revenue & Membership Analytics', included: true },
      { text: '1-on-1 Coaching', included: false },
      { text: 'Live Trainer Sessions', included: false },
    ],
  },
  {
    key: 'PREMIUM',
    name: 'Premium',
    tagline: 'Enterprise-grade multi-branch scale',
    badge: 'ADVANCED',
    icon: Sparkles,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    priceMonthly: 2499,
    priceAnnual: 22490,
    savingsAnnual: 7498,
    priceDisplay: '₹2,499',
    pricePeriod: '/mo',
    platformLimits: 'Unlimited members & trainers • 5 branches',
    limits: { members: -1, trainers: -1, staff: -1, branches: 5 },
    status: 'Active',
    subscribedGyms: 27,
    features: [
      { text: 'Everything in Gold', included: true },
      { text: '1-on-1 Online Coaching', included: true },
      { text: 'Live Trainer Sessions', included: true },
      { text: 'Priority Trainer Booking', included: true },
      { text: 'AI + Trainer Hybrid Recs', included: true },
      { text: 'Branch-wise Analytics', included: true },
      { text: 'Member Retention Analytics', included: true },
      { text: 'Priority Support & Monthly Review', included: true },
    ],
  },
];

// (real data fetched from API, see component state)

const PLAN_COLORS: Record<string, string> = {
  FREE_TRIAL: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
  SILVER: 'bg-[#FED7AA]/10 text-[#FED7AA] border-[#FED7AA]/30',
  GOLD: 'bg-emerald-500/10 text-[#F97316] border-[#F97316]/30',
  PREMIUM: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  BASIC: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
};

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-green-500/10 text-green-400 border-green-500/20',
  Expired: 'bg-[#FED7AA]/10 text-teal-400 border-[#FED7AA]/20',
  Pending: 'bg-blue-500/10 text-blue-400 border-[#FED7AA]/20',
  Inactive: 'bg-[#333] text-[#78716C] border-[#444]',
  Rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
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
  if (isNaN(d.getTime())) return 'N/A';
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

// ─── Edit Plan Modal ───────────────────────────────────────────────────────────
const EditPlanModal = ({ plan, onClose, onSave }: { plan: any; onClose: () => void; onSave?: (updated: any) => void }) => {
  const [form, setForm] = useState({
    priceMonthly: plan.priceMonthly,
    priceAnnual: plan.priceAnnual,
    members: plan.limits.members,
    trainers: plan.limits.trainers,
    staff: plan.limits.staff,
    branches: plan.limits.branches,
  });
  const Icon = plan.icon;

  const handleSave = () => {
    if (onSave) {
      const savingsAnnual = form.priceMonthly * 12 - form.priceAnnual;
      onSave({
        ...plan,
        priceMonthly: form.priceMonthly,
        priceAnnual: form.priceAnnual,
        savingsAnnual: savingsAnnual > 0 ? savingsAnnual : 0,
        priceDisplay: `₹${form.priceMonthly.toLocaleString('en-IN')}`,
        limits: {
          members: form.members,
          trainers: form.trainers,
          staff: form.staff,
          branches: form.branches,
        },
        platformLimits: `${form.members === -1 ? 'Unlimited' : form.members} members • ${form.trainers === -1 ? 'Unlimited' : form.trainers} trainers • ${form.branches} branch${form.branches > 1 ? 'es' : ''}`,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`w-12 h-12 ${plan.iconBg} rounded-xl flex items-center justify-center`}>
            <Icon size={22} className={plan.iconColor} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#292524]">Edit {plan.name} Plan</h2>
            <p className="text-[#78716C] text-sm">{plan.tagline}</p>
          </div>
        </div>

        <div className="space-y-5">
          <h3 className="text-[#292524] font-semibold text-sm uppercase tracking-wider border-b border-[#E7E5E4] pb-2">Pricing</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#78716C] mb-2">Monthly Price (₹)</label>
              <input type="number" value={form.priceMonthly}
                onChange={e => setForm(f => ({ ...f, priceMonthly: +e.target.value }))}
                className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#78716C] mb-2">Annual Price (₹)</label>
              <input type="number" value={form.priceAnnual}
                onChange={e => setForm(f => ({ ...f, priceAnnual: +e.target.value }))}
                className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]"
              />
            </div>
          </div>

          <h3 className="text-[#292524] font-semibold text-sm uppercase tracking-wider border-b border-[#E7E5E4] pb-2 mt-4">Platform Limits</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'members', label: 'Max Members (-1 = Unlimited)' },
              { key: 'trainers', label: 'Max Trainers (-1 = Unlimited)' },
              { key: 'staff', label: 'Max Staff (-1 = Unlimited)' },
              { key: 'branches', label: 'Max Branches' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-[#78716C] mb-2">{label}</label>
                <input type="number" value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: +e.target.value }))}
                  className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 bg-[#FFFFFF] text-[#292524] rounded-xl font-bold hover:bg-[#333] transition-colors text-sm">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-3 bg-[#FED7AA] text-black rounded-xl font-bold hover:bg-teal-600 transition-colors text-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

// ─── View Plan Modal ───────────────────────────────────────────────────────────
const ViewPlanModal = ({ plan, onClose }: { plan: any; onClose: () => void }) => {
  const Icon = plan.icon;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto custom-scrollbar my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 ${plan.iconBg} rounded-xl flex items-center justify-center`}>
              <Icon size={22} className={plan.iconColor} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#292524]">{plan.name} Plan</h2>
              <p className="text-[#78716C] text-sm">{plan.tagline}</p>
            </div>
          </div>
          <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs px-2.5 py-1 rounded-full font-bold">{plan.status}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-4">
            <p className="text-[#555] text-xs uppercase tracking-widest font-bold mb-1">Monthly Price</p>
            <p className="text-[#292524] font-bold text-xl">₹{plan.priceMonthly.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-4">
            <p className="text-[#555] text-xs uppercase tracking-widest font-bold mb-1">Annual Price</p>
            <p className="text-[#292524] font-bold text-xl">₹{plan.priceAnnual.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-4 mb-6">
          <p className="text-[#555] text-xs uppercase tracking-widest font-bold mb-3">Platform Limits</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Members', value: plan.limits.members, icon: Users },
              { label: 'Trainers', value: plan.limits.trainers, icon: Dumbbell },
              { label: 'Staff', value: plan.limits.staff, icon: UserCheck },
              { label: 'Branches', value: plan.limits.branches, icon: Building2 },
            ].map(({ label, value, icon: LimitIcon }) => (
              <div key={label} className="flex items-center space-x-2">
                <LimitIcon size={14} className="text-teal-400" />
                <span className="text-[#78716C]">{label}:</span>
                <span className="text-[#292524] font-bold">{value === -1 ? '∞' : value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-[#555] text-xs uppercase tracking-widest font-bold mb-3">Features</p>
          <ul className="space-y-2">
            {plan.features.map((f: any, i: number) => (
              <li key={i} className={`flex items-center space-x-2 text-sm ${f.included ? 'text-[#C0C0C0]' : 'text-[#444]'}`}>
                {f.included ? <CheckCircle size={14} className="text-green-400 shrink-0" /> : <XCircle size={14} className="text-[#444] shrink-0" />}
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between bg-[#FED7AA]/10 border border-[#FED7AA]/20 rounded-xl p-4 mb-6">
          <span className="text-[#78716C] text-sm">Active Subscribers</span>
          <span className="text-teal-400 font-bold text-xl">{plan.subscribedGyms} Gyms</span>
        </div>

        <button onClick={onClose} className="w-full py-3 bg-[#FFFFFF] text-[#292524] rounded-xl font-bold hover:bg-[#333] transition-colors text-sm">Close</button>
      </div>
    </div>
  );
};

// ─── View Payment Modal ────────────────────────────────────────────────────────
const ViewPaymentModal = ({ payment, onClose }: { payment: any; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E7E5E4]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
              <IndianRupee size={22} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#292524]">Payment Details</h2>
              <p className="text-[#78716C] text-xs font-medium mt-0.5">{payment.gymName || payment.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <XCircle size={22} />
          </button>
        </div>

        {/* Contiguous Detail Table touching one by one */}
        <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm mb-6">
          <div className="flex justify-between items-center p-3.5 bg-white">
            <span className="text-[#78716C] text-xs font-semibold">Plan</span>
            <span className="text-[#292524] font-bold text-sm">
              {payment.plan} <span className="text-slate-400 font-normal">({payment.billing})</span>
            </span>
          </div>

          <div className="flex justify-between items-center p-3.5 bg-white">
            <span className="text-[#78716C] text-xs font-semibold">Amount Paid</span>
            <span className="text-[#F97316] font-extrabold text-base">{payment.amount}</span>
          </div>

          <div className="flex justify-between items-center p-3.5 bg-white">
            <span className="text-[#78716C] text-xs font-semibold">Payment Method</span>
            <span className="text-[#292524] font-bold text-sm capitalize">{payment.paymentMethod}</span>
          </div>

          <div className="flex justify-between items-center p-3.5 bg-white">
            <span className="text-[#78716C] text-xs font-semibold">Date</span>
            <span className="text-[#292524] font-bold text-sm">{formatDate(payment.start)}</span>
          </div>

          <div className="flex justify-between items-center p-3.5 bg-white">
            <span className="text-[#78716C] text-xs font-semibold">Status</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-500'}`}>
              {payment.status}
            </span>
          </div>
        </div>

        {(payment.paymentMethod?.toLowerCase().includes('manual') || payment.paymentMethod?.toLowerCase().includes('qr') || payment.paymentMethod?.toLowerCase().includes('paytm') || payment.paymentMethod?.toLowerCase().includes('phonepe') || payment.paymentMethod?.toLowerCase().includes('google')) && (
          <div className="bg-[#FED7AA]/10 border border-[#FED7AA]/30 rounded-xl p-4 mb-6">
            <h3 className="text-teal-700 font-bold text-xs mb-1.5 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-teal-600" />
              <span>Manual / QR Payment Verification</span>
            </h3>
            <p className="text-[#78716C] text-xs leading-relaxed">
              This payment was completed via {payment.paymentMethod}. The transaction ID and screenshot have been verified by the billing team.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#F97316]/90 transition-colors text-sm shadow-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// ─── Create Plan Modal ────────────────────────────────────────────────────────
const FEATURE_OPTIONS = [
  'Gym Profile Management', 'Basic Gym Profile', 'Member Management', 'Basic Member Management',
  'Trainer Management', 'Staff Management', 'Member Attendance', 'Basic Attendance',
  'Membership Tracking', 'AI Fitness Assessment', 'Basic AI Fitness Assessment',
  'AI Workout Plans', 'Basic AI Workout Plans', 'Advanced AI Workout Plans', 'Personalized AI Workout Plans',
  'AI Diet Plans', 'Basic AI Diet Plans', 'Advanced AI Diet & Nutrition', 'Personalized Advanced Nutrition Plans',
  'AI Chat Assistant', 'Limited AI Chat', 'Advanced AI Fitness Assistant',
  'Progress Tracking', 'Basic Progress Tracking', 'Detailed Progress Analytics',
  'Trainer Discovery & Booking', 'Trainer Scheduling', 'Priority Trainer Booking',
  '1-on-1 Online Coaching', 'Live Trainer Sessions', 'AI + Trainer Hybrid Recs',
  'Revenue & Membership Analytics', 'Branch-wise Analytics', 'Member Retention Analytics',
  'Advanced Revenue Analytics', 'Trainer Performance Analytics', 'Priority Support',
  'Monthly Fitness Review', 'Custom Workout Modifications',
];

const ICON_OPTIONS = [
  { label: 'Zap (Trial)', icon: Zap, color: 'text-slate-400', bg: 'bg-slate-400/10' },
  { label: 'Star (Silver)', icon: Star, color: 'text-slate-300', bg: 'bg-slate-300/10' },
  { label: 'Crown (Gold)', icon: Crown, color: 'text-teal-400', bg: 'bg-teal-400/10' },
  { label: 'Sparkles (Premium)', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Credit Card', icon: CreditCard, color: 'text-blue-400', bg: 'bg-blue-400/10' },
];

const CreatePlanModal = ({ onClose, onSave }: { onClose: () => void; onSave: (plan: any) => void }) => {
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    priceMonthly: 0,
    priceAnnual: 0,
    members: 100,
    trainers: 5,
    staff: 2,
    branches: 1,
    selectedIconIdx: 0,
  });
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [lockedFeatures, setLockedFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const toggleFeature = (feat: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
    setLockedFeatures(prev => prev.filter(f => f !== feat));
  };

  const toggleLocked = (feat: string) => {
    setLockedFeatures(prev =>
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
    setSelectedFeatures(prev => prev.filter(f => f !== feat));
  };

  const addCustomFeature = () => {
    if (newFeatureText.trim() && !selectedFeatures.includes(newFeatureText.trim())) {
      setSelectedFeatures(prev => [...prev, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Plan name is required';
    if (!form.tagline.trim()) e.tagline = 'Tagline is required';
    if (form.priceMonthly < 0) e.priceMonthly = 'Must be 0 or more';
    if (form.priceAnnual < 0) e.priceAnnual = 'Must be 0 or more';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const iconOpt = ICON_OPTIONS[form.selectedIconIdx];
    const savingsAnnual = form.priceMonthly * 12 - form.priceAnnual;
    const newPlan = {
      key: form.name.toUpperCase().replace(/\s+/g, '_') + '_' + Date.now(),
      name: form.name,
      tagline: form.tagline,
      icon: iconOpt.icon,
      iconColor: iconOpt.color,
      iconBg: iconOpt.bg,
      priceMonthly: form.priceMonthly,
      priceAnnual: form.priceAnnual,
      savingsAnnual: savingsAnnual > 0 ? savingsAnnual : 0,
      limits: {
        members: form.members,
        trainers: form.trainers,
        staff: form.staff,
        branches: form.branches,
      },
      status: 'Active',
      subscribedGyms: 0,
      features: [
        ...selectedFeatures.map(t => ({ text: t, included: true })),
        ...lockedFeatures.map(t => ({ text: t, included: false })),
      ],
    };
    onSave(newPlan);
    setSaved(true);
    setTimeout(() => onClose(), 1200);
  };

  if (saved) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-[#FFFFFF] border border-green-500/40 rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-[#292524] mb-2">Plan Saved!</h2>
          <p className="text-[#78716C] text-sm">Your new plan has been added successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[85vh] my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E7E5E4] shrink-0 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#FED7AA]/10 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#292524]">Create New Plan</h2>
              <p className="text-[#78716C] text-sm">Fill in the details to add a new subscription plan</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#78716C] hover:text-[#292524]">
            <XCircle size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden bg-white">
          <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-6">

            {/* Basic Info */}
            <div>
              <h3 className="text-[#292524] font-bold text-sm uppercase tracking-wider mb-4 pb-2 border-b border-[#E7E5E4]">Basic Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#78716C] mb-2">Plan Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
                      placeholder="e.g. Enterprise"
                      className={`w-full bg-[#FFFFFF] border ${errors.name ? 'border-[#FED7AA]' : 'border-[#E7E5E4]'} text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA] transition-colors`}
                    />
                    {errors.name && <p className="text-teal-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#78716C] mb-2">Icon Style</label>
                    <select
                      value={form.selectedIconIdx}
                      onChange={e => setForm(f => ({ ...f, selectedIconIdx: +e.target.value }))}
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]"
                    >
                      {ICON_OPTIONS.map((opt, i) => (
                        <option key={i} value={i}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#78716C] mb-2">Tagline *</label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={e => { setForm(f => ({ ...f, tagline: e.target.value })); setErrors(er => ({ ...er, tagline: '' })); }}
                    placeholder="e.g. For large-scale gym chains"
                    className={`w-full bg-[#FFFFFF] border ${errors.tagline ? 'border-[#FED7AA]' : 'border-[#E7E5E4]'} text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]`}
                  />
                  {errors.tagline && <p className="text-teal-400 text-xs mt-1">{errors.tagline}</p>}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-[#292524] font-bold text-sm uppercase tracking-wider mb-4 pb-2 border-b border-[#E7E5E4]">Pricing (₹)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#78716C] mb-2">Monthly Price</label>
                  <input
                    type="number" min={0}
                    value={form.priceMonthly}
                    onChange={e => setForm(f => ({ ...f, priceMonthly: +e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#78716C] mb-2">Annual Price</label>
                  <input
                    type="number" min={0}
                    value={form.priceAnnual}
                    onChange={e => setForm(f => ({ ...f, priceAnnual: +e.target.value }))}
                    className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]"
                  />
                </div>
              </div>
              {form.priceMonthly > 0 && form.priceAnnual > 0 && form.priceMonthly * 12 > form.priceAnnual && (
                <p className="text-green-400 text-xs mt-2 font-semibold">
                  ✓ Annual savings: ₹{(form.priceMonthly * 12 - form.priceAnnual).toLocaleString('en-IN')}/year
                </p>
              )}
            </div>

            {/* Limits */}
            <div>
              <h3 className="text-[#292524] font-bold text-sm uppercase tracking-wider mb-4 pb-2 border-b border-[#E7E5E4]">Platform Limits <span className="text-[#555] font-normal normal-case text-xs ml-2">(use -1 for Unlimited)</span></h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'members', label: 'Max Members', icon: Users },
                  { key: 'trainers', label: 'Max Trainers', icon: Dumbbell },
                  { key: 'staff', label: 'Max Staff', icon: UserCheck },
                  { key: 'branches', label: 'Max Branches', icon: Building2 },
                ].map(({ key, label, icon: LimitIcon }) => (
                  <div key={key}>
                    <label className="flex items-center space-x-1.5 text-xs font-medium text-[#78716C] mb-2">
                      <LimitIcon size={12} className="text-teal-400" />
                      <span>{label}</span>
                    </label>
                    <input
                      type="number"
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: +e.target.value }))}
                      className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-[#292524] font-bold text-sm uppercase tracking-wider mb-1 pb-2 border-b border-[#E7E5E4]">Features</h3>
              <p className="text-[#555] text-xs mb-4">✅ Check = Included &nbsp;|&nbsp; 🚫 Lock = Not available (shown as locked)</p>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {FEATURE_OPTIONS.map(feat => {
                  const isIncluded = selectedFeatures.includes(feat);
                  const isLocked = lockedFeatures.includes(feat);
                  return (
                    <div key={feat} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-colors ${isIncluded ? 'bg-green-500/5 border-green-500/20' : isLocked ? 'bg-[#FED7AA]/5 border-[#FED7AA]/20' : 'bg-[#FFFFFF] border-[#E7E5E4]'}`}>
                      <span className={isIncluded ? 'text-[#292524]' : isLocked ? 'text-[#78716C] line-through' : 'text-[#78716C]'}>{feat}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleFeature(feat)}
                          title="Include feature"
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isIncluded ? 'bg-green-500 text-[#292524]' : 'bg-[#333] text-[#555] hover:bg-green-500/20 hover:text-green-400'}`}
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          onClick={() => toggleLocked(feat)}
                          title="Mark as locked/unavailable"
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isLocked ? 'bg-[#FED7AA]/80 text-black' : 'bg-[#333] text-[#555] hover:bg-[#FED7AA]/20 hover:text-teal-400'}`}
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Feature Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFeatureText}
                  onChange={e => setNewFeatureText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomFeature()}
                  placeholder="Add a custom feature..."
                  className="flex-1 bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]"
                />
                <button
                  onClick={addCustomFeature}
                  className="px-4 py-2.5 bg-[#FED7AA]/10 border border-[#FED7AA]/30 text-teal-400 rounded-xl text-sm font-bold hover:bg-[#FED7AA]/20 transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Preview */}
            {(form.name || selectedFeatures.length > 0) && (
              <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl p-4">
                <p className="text-[#555] text-xs uppercase tracking-wider font-bold mb-3">Preview</p>
                <p className="text-[#292524] font-bold text-base">{form.name || 'Plan Name'}</p>
                <p className="text-[#78716C] text-xs mb-2">{form.tagline || 'Tagline'}</p>
                <p className="text-teal-400 font-bold">₹{form.priceMonthly.toLocaleString('en-IN')}/mo · ₹{form.priceAnnual.toLocaleString('en-IN')}/yr</p>
                <div className="mt-2 text-xs text-[#78716C]">
                  {selectedFeatures.length} included · {lockedFeatures.length} locked
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-[#E7E5E4] shrink-0 bg-white">
          <button onClick={onClose} className="flex-1 py-3 bg-[#FFFFFF] text-[#292524] rounded-xl font-bold border border-[#E7E5E4] hover:bg-slate-50 transition-colors text-sm">Cancel</button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-[#FED7AA] text-white rounded-xl font-bold hover:bg-teal-600 transition-colors text-sm flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/30"
          >
            <CheckCircle size={16} />
            <span>Save Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const SuperAdminSubscriptions = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'subscribers'>('plans');
  const [plans, setPlans] = useState<any[]>(SAAS_PLANS);
  const [planStatuses, setPlanStatuses] = useState<Record<string, boolean>>(
    Object.fromEntries(SAAS_PLANS.map(p => [p.key, true]))
  );
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState<any>(null);
  const [viewPlan, setViewPlan] = useState<any>(null);
  const [viewPayment, setViewPayment] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Live data from backend
  const [subscribedGyms, setSubscribedGyms] = useState<any[]>([]);
  const [loadingGyms, setLoadingGyms] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await api.get('/subscriptions/all');
        const data = res.data;
        if (data.success) {
          setSubscribedGyms(data.subscriptions.map((s: any) => ({
            id: s.id,
            gymName: s.gymName,
            owner: s.owner,
            plan: s.plan,
            billing: s.billing,
            status: s.status === 'ACTIVE' ? 'Active' : s.status === 'PENDING' ? 'Pending' : s.status === 'EXPIRED' ? 'Expired' : s.status,
            start: s.start || 'N/A',
            renewal: s.renewal || 'N/A',
            amount: s.amount,
            paymentMethod: s.paymentMethod || 'Manual',
          })));
        }
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
      } finally {
        setLoadingGyms(false);
      }
    };
    fetchSubscriptions();
  }, []);

  // Per-plan accent colors for selected state & styling
  const PLAN_ACCENTS: Record<string, {
    border: string; glow: string; bg: string; badge: string;
    headerBg: string; pricingBg: string; limitsBg: string;
    priceColor: string; labelColor: string; checkColor: string;
  }> = {
    FREE_TRIAL: {
      border: 'border-slate-300',
      glow: 'shadow-[0_0_25px_rgba(148,163,184,0.25)]',
      bg: 'bg-white',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      headerBg: 'bg-slate-50',
      pricingBg: 'bg-slate-50 border border-slate-100',
      limitsBg: 'bg-[#F4F6F4] border border-[#E5EAE7]',
      priceColor: 'text-slate-800',
      labelColor: 'text-slate-700',
      checkColor: 'text-[#FED7AA]',
    },
    SILVER: {
      border: 'border-[#FED7AA]',
      glow: 'shadow-[0_0_25px_rgba(111,163,160,0.25)]',
      bg: 'bg-white',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      headerBg: 'bg-teal-50/50',
      pricingBg: 'bg-teal-50/30 border border-teal-100',
      limitsBg: 'bg-[#F4F6F4] border border-[#E5EAE7]',
      priceColor: 'text-[#FED7AA]',
      labelColor: 'text-[#FED7AA]',
      checkColor: 'text-[#FED7AA]',
    },
    GOLD: {
      border: 'border-[#F97316]',
      glow: 'shadow-[0_0_35px_rgba(22,74,74,0.35)]',
      bg: 'bg-white',
      badge: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/25',
      headerBg: 'bg-[#F97316]/10',
      pricingBg: 'bg-[#F97316]/5 border border-[#F97316]/20',
      limitsBg: 'bg-[#F4F6F4] border border-[#E5EAE7]',
      priceColor: 'text-[#F97316]',
      labelColor: 'text-[#F97316]',
      checkColor: 'text-[#F97316]',
    },
    PREMIUM: {
      border: 'border-purple-300',
      glow: 'shadow-[0_0_35px_rgba(168,85,247,0.25)]',
      bg: 'bg-white',
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
      headerBg: 'bg-purple-50',
      pricingBg: 'bg-purple-50/50 border border-purple-100',
      limitsBg: 'bg-[#F4F6F4] border border-[#E5EAE7]',
      priceColor: 'text-purple-600',
      labelColor: 'text-purple-600',
      checkColor: 'text-purple-500',
    },
  };

  const getAccent = (key: string) => PLAN_ACCENTS[key] || PLAN_ACCENTS['SILVER'];

  const handleSavePlan = (newPlan: any) => {
    setPlans(prev => [...prev, newPlan]);
    setPlanStatuses(prev => ({ ...prev, [newPlan.key]: true }));
  };

  const filteredGyms = subscribedGyms.filter(g => {
    const matchSearch = g.gymName.toLowerCase().includes(searchQuery.toLowerCase()) || g.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPlan = filterPlan === 'ALL' || g.plan === filterPlan;
    
    // Hide 'Pending' subscriptions by default (so we only see completed payments)
    const matchStatus = filterStatus === 'ALL' ? g.status !== 'Pending' : g.status === filterStatus;
    
    return matchSearch && matchPlan && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Modals */}
      {editPlan && (
        <EditPlanModal
          plan={editPlan}
          onClose={() => setEditPlan(null)}
          onSave={(updated: any) => setPlans(prev => prev.map(p => p.key === updated.key ? updated : p))}
        />
      )}
      {viewPlan && <ViewPlanModal plan={viewPlan} onClose={() => setViewPlan(null)} />}
      {viewPayment && <ViewPaymentModal payment={viewPayment} onClose={() => setViewPayment(null)} />}
      {showCreateModal && <CreatePlanModal onClose={() => setShowCreateModal(false)} onSave={handleSavePlan} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight flex items-center space-x-3">
            <CreditCard className="text-[#FED7AA]" size={30} />
            <span>Subscription Plans</span>
          </h1>
          <p className="text-[#78716C] mt-1">Manage SaaS plans for gym owners on the platform.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#FED7AA] text-black rounded-xl font-bold hover:bg-teal-600 transition-colors text-sm shadow-lg shadow-amber-500/20"
        >
          <Plus size={16} />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { 
            label: 'Active Gyms', 
            value: subscribedGyms.filter(g => g.status === 'Active').length, 
            icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' 
          },
          { 
            label: 'Inactive Gyms', 
            value: subscribedGyms.filter(g => g.status === 'Inactive').length, 
            icon: ToggleLeft, color: 'text-slate-500', bg: 'bg-slate-500/10' 
          },
          { 
            label: 'Pending Gyms', 
            value: subscribedGyms.filter(g => g.status === 'Pending').length, 
            icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' 
          },
          { 
            label: 'Rejected Gyms', 
            value: subscribedGyms.filter(g => g.status === 'Rejected').length, 
            icon: AlertCircle, color: 'text-[#FED7AA]', bg: 'bg-red-500/10' 
          },
          { 
            label: 'Expired Gyms', 
            value: subscribedGyms.filter(g => g.status === 'Expired').length, 
            icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex items-center space-x-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-[#78716C] text-xs font-medium">{stat.label}</p>
              <p className="text-[#292524] font-bold text-xl">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-[#FFFFFF] p-1.5 rounded-xl border border-[#E7E5E4] w-fit">
        {[
          { key: 'plans', label: 'Plan Management', icon: CreditCard },
          { key: 'subscribers', label: 'Subscribed Gyms', icon: Building2 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-[#FED7AA] text-black shadow' : 'text-[#78716C] hover:text-[#292524]'}`}
          >
            <tab.icon size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Plan Management ── */}
      {activeTab === 'plans' && (
        <>
          {/* Selected Plan Detail Banner */}
          {selectedPlan && (() => {
            const sp = plans.find(p => p.key === selectedPlan);
            const acc = getAccent(selectedPlan);
            const SpIcon = sp?.icon;
            if (!sp) return null;
            return (
              <div className={`rounded-2xl p-5 border-2 ${acc.border} ${acc.bg} ${acc.glow} flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${acc.headerBg} rounded-xl flex items-center justify-center`}>
                    {SpIcon && <SpIcon size={24} className={acc.labelColor} />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-[#292524] font-bold text-lg">{sp.name} Plan</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${acc.badge}`}>Selected</span>
                    </div>
                    <p className="text-[#78716C] text-sm mt-0.5">{sp.tagline}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="text-center">
                    <p className="text-[#555] text-[10px] uppercase tracking-wider font-bold">Monthly</p>
                    <p className={`font-black text-lg ${acc.priceColor}`}>₹{sp.priceMonthly.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#555] text-[10px] uppercase tracking-wider font-bold">Annual</p>
                    <p className={`font-black text-lg ${acc.priceColor}`}>₹{sp.priceAnnual.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#555] text-[10px] uppercase tracking-wider font-bold">Members</p>
                    <p className={`font-black text-lg ${acc.priceColor}`}>{sp.limits.members === -1 ? '∞' : sp.limits.members}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#555] text-[10px] uppercase tracking-wider font-bold">Subscribers</p>
                    <p className={`font-black text-lg ${acc.priceColor}`}>{sp.subscribedGyms}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setViewPlan(sp)} className={`px-4 py-2 rounded-xl text-sm font-bold border ${acc.badge} transition-colors`}>View Details</button>
                  <button onClick={() => setEditPlan(sp)} className={`px-4 py-2 rounded-xl text-sm font-bold ${acc.border.replace('border-', 'bg-').replace('400', '500')} text-black transition-colors`}>Edit Plan</button>
                  <button onClick={() => setSelectedPlan(null)} className="px-3 py-2 rounded-xl text-xs text-[#555] hover:text-[#F97316] transition-colors">✕</button>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {plans.map(plan => {
            const isPlanActive = planStatuses[plan.key] ?? true;
            const isSelected = selectedPlan === plan.key;
            const acc = getAccent(plan.key);
            const activeGymCount = subscribedGyms.filter(g => g.plan === plan.key && g.status === 'Active').length || plan.subscribedGyms;

            return (
              <div
                key={plan.key}
                onClick={() => setSelectedPlan(isSelected ? null : plan.key)}
                className={`relative flex flex-col rounded-2xl bg-white cursor-pointer transition-all duration-300 overflow-hidden shadow-sm
                  ${
                    isSelected
                      ? `border-2 ${acc.border} ${acc.glow} -translate-y-1 scale-[1.01]`
                      : plan.key === 'GOLD'
                      ? 'border-2 border-[#F97316] shadow-md hover:-translate-y-1 hover:shadow-xl'
                      : plan.key === 'PREMIUM'
                      ? 'border-2 border-purple-200 hover:border-purple-400 hover:-translate-y-1 hover:shadow-lg'
                      : plan.key === 'FREE_TRIAL'
                      ? 'border-2 border-dashed border-slate-300 hover:border-slate-400 hover:-translate-y-1 hover:shadow-lg'
                      : 'border-2 border-slate-200 hover:border-[#FED7AA] hover:-translate-y-1 hover:shadow-lg'
                  }
                  ${!isPlanActive ? 'opacity-60 grayscale' : ''}
                `}
              >
                {/* Gold Most Popular Ribbon */}
                {plan.key === 'GOLD' && (
                  <div className="bg-[#F97316] text-white text-[11px] font-extrabold py-2 px-4 flex items-center justify-center gap-1.5 uppercase tracking-widest shrink-0">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span>MOST POPULAR</span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Card Header: Name + Badge + Toggle */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-[#292524]">{plan.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md border ${acc.badge}`}>
                        {plan.badge}
                      </span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setPlanStatuses(s => ({ ...s, [plan.key]: !(s[plan.key] ?? true) }));
                        }}
                        className="p-0.5 rounded transition-transform active:scale-95"
                        title={isPlanActive ? 'Deactivate plan' : 'Activate plan'}
                      >
                        {isPlanActive ? (
                          <ToggleRight size={26} className="text-emerald-500 hover:text-emerald-600 transition-colors" />
                        ) : (
                          <ToggleLeft size={26} className="text-slate-300 hover:text-slate-400 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Pricing Section */}
                  <div className="mb-3">
                    <div className="flex items-baseline space-x-1">
                      <span className={`text-3xl font-extrabold tracking-tight ${plan.key === 'PREMIUM' ? 'text-purple-600' : plan.key === 'GOLD' ? 'text-[#F97316]' : plan.key === 'SILVER' ? 'text-[#FED7AA]' : 'text-slate-900'}`}>
                        {plan.priceDisplay || `₹${plan.priceMonthly.toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">
                        {plan.pricePeriod || '/mo'}
                      </span>
                    </div>
                    {plan.savingsAnnual > 0 ? (
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        or save 25% with annual
                      </p>
                    ) : (
                      <p className="text-xs text-transparent font-medium mt-0.5 select-none">
                        &nbsp;
                      </p>
                    )}
                  </div>

                  {/* Platform Limits Box */}
                  <div className="bg-[#F4F6F4] border border-[#E5EAE7] rounded-xl p-3 mb-5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      PLATFORM LIMITS
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      {plan.platformLimits}
                    </p>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feat: any, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs leading-snug">
                        {feat.included ? (
                          <CheckCircle size={15} className={`shrink-0 mt-0.5 ${acc.checkColor}`} />
                        ) : (
                          <XCircle size={15} className="shrink-0 mt-0.5 text-slate-300" />
                        )}
                        <span className={feat.included ? 'text-slate-700 font-medium' : 'text-slate-400 line-through opacity-70'}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Active Gyms Count */}
                  <div className="pt-3 border-t border-[#E5EAE7] flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-xs font-medium">Active Gyms</span>
                    <span className="font-extrabold text-sm text-[#F97316] bg-[#F97316]/10 px-2.5 py-0.5 rounded-full">
                      {activeGymCount}
                    </span>
                  </div>

                  {/* Actions: View and Edit */}
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button
                      onClick={e => { e.stopPropagation(); setViewPlan(plan); }}
                      className="flex items-center justify-center space-x-1.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setEditPlan(plan); }}
                      className="flex items-center justify-center space-x-1.5 py-2.5 border border-[#F97316]/20 rounded-xl text-xs font-semibold text-[#F97316] bg-[#F97316]/10 hover:bg-[#F97316]/15 transition-colors shadow-sm"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </>
      )}

      {/* ── Tab: Subscribed Gyms ── */}
      {activeTab === 'subscribers' && (
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden">
          {/* Filters */}
          <div className="p-5 border-b border-[#E7E5E4] flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <input
                type="text"
                placeholder="Search gym or owner..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]"
              />
            </div>
            <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]">
              <option value="ALL">All Plans</option>
              <option value="FREE_TRIAL">Free Trial</option>
              <option value="SILVER">Silver</option>
              <option value="GOLD">Gold</option>
              <option value="PREMIUM">Premium</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FED7AA]">
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E7E5E4] bg-[#FFFFFF]">
                  {['Gym Name', 'Owner', 'Plan', 'Billing', 'Amount', 'Payment Method', 'Start Date', 'Renewal Date', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-[#78716C] uppercase tracking-wider px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {loadingGyms ? (
                  <tr><td colSpan={10} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-[#78716C]">
                      <div className="w-8 h-8 border-2 border-[#FED7AA] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Loading subscription data...</span>
                    </div>
                  </td></tr>
                ) : filteredGyms.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-[#78716C]">
                      <CreditCard size={40} className="opacity-30" />
                      <p>No subscriptions found.</p>
                    </div>
                  </td></tr>
                ) : filteredGyms.map(gym => (
                  <tr key={gym.id} className="hover:bg-[#FFFFFF] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#FED7AA]/10 rounded-lg flex items-center justify-center">
                          <Building2 size={14} className="text-teal-400" />
                        </div>
                        <span className="text-[#292524] font-semibold text-sm">{gym.gymName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#78716C] text-sm">{gym.owner}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${PLAN_COLORS[gym.plan]}`}>
                        {SAAS_PLANS.find(p => p.key === gym.plan)?.name || gym.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#78716C] text-sm">{gym.billing}</td>
                    <td className="px-5 py-4 text-[#292524] font-bold text-sm">{gym.amount}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 bg-[#FFFFFF] border border-[#E7E5E4] rounded-md text-xs text-[#78716C]">
                        {gym.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#78716C] text-sm whitespace-nowrap">{formatDate(gym.start)}</td>
                    <td className="px-5 py-4 text-[#78716C] text-sm whitespace-nowrap">{formatDate(gym.renewal)}</td>
                    <td className="px-5 py-4">
                      <select 
                        value={gym.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          try {
                            const res = await api.put(`/subscriptions/${gym.id}/status`, { status: newStatus });
                            if (res.data.success) {
                              setSubscribedGyms(prev => prev.map(g => g.id === gym.id ? { ...g, status: newStatus } : g));
                            }
                          } catch (err) {
                            console.error('Failed to update status', err);
                            // Revert on error or show toast (optional)
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`outline-none cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border appearance-none ${STATUS_COLORS[gym.status] || 'bg-gray-100 text-gray-500'}`}
                      >
                        <option value="Active" className="bg-[#FFFFFF] text-green-500">Active</option>
                        <option value="Inactive" className="bg-[#FFFFFF] text-[#78716C]">Inactive</option>
                        <option value="Pending" className="bg-[#FFFFFF] text-blue-500">Pending</option>
                        <option value="Rejected" className="bg-[#FFFFFF] text-[#FED7AA]">Rejected</option>
                        <option value="Expired" className="bg-[#FFFFFF] text-teal-400">Expired</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setViewPayment(gym)}
                        className="p-1.5 bg-[#FED7AA]/10 text-teal-500 rounded-lg hover:bg-[#FED7AA]/20 transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSubscriptions;
