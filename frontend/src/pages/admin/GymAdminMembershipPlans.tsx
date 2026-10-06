import { useState } from 'react';
import { Check, Edit2, Users, X, Zap, TrendingUp, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Features are IDENTICAL for monthly & annual — only the price changes.
const PLANS = [
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
  starter: { icon: Zap,        accent: '#6366F1', bg: 'rgba(99,102,241,0.08)',  label: 'Starter' },
  growth:  { icon: TrendingUp, accent: '#164A4A', bg: 'rgba(22,74,74,0.08)',    label: 'Growth'  },
  pro:     { icon: Crown,      accent: '#C6A77D', bg: 'rgba(198,167,125,0.12)', label: 'Pro'     },
};

type FormData = { name: string; monthlyPrice: string; annualPrice: string; features: string };

const GymAdminMembershipPlans = () => {
  useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({ name: '', monthlyPrice: '', annualPrice: '', features: '' });

  const handleOpenModal = (plan: typeof PLANS[number]) => {
    setFormData({ name: plan.name, monthlyPrice: String(plan.monthlyPrice), annualPrice: String(plan.annualPrice), features: plan.features.join(', ') });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => { e.preventDefault(); setShowModal(false); };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Package Plans</h1>
        <p className="text-[#455250] mt-1">Configure your gym's subscription packages and pricing tiers.</p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-xl border border-[#D3DFDA] inline-flex shadow-sm">
          <button onClick={() => setBillingCycle('monthly')} className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-[#164A4A] text-white shadow-md' : 'text-[#455250] hover:bg-gray-50'}`}>Monthly</button>
          <button onClick={() => setBillingCycle('annually')} className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all ${billingCycle === 'annually' ? 'bg-[#164A4A] text-white shadow-md' : 'text-[#455250] hover:bg-gray-50'}`}>
            Annually <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Save 2 months</span>
          </button>
        </div>
      </div>

      {/* Plans — always 3, price only changes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {PLANS.map((plan) => {
          const badge = BADGE_CONFIG[plan.badge];
          const IconComp = badge.icon;
          const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
          const durationLabel = billingCycle === 'monthly' ? '1 month' : '1 year';
          return (
            <div key={plan.id} className={`rounded-2xl p-8 relative flex flex-col transition-all bg-white ${plan.isPopular ? 'border-2 shadow-2xl md:-translate-y-3' : 'border hover:shadow-lg'}`} style={{ borderColor: plan.isPopular ? badge.accent : '#D3DFDA', boxShadow: plan.isPopular ? `0 20px 60px ${badge.accent}22` : undefined }}>
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="text-white text-xs font-black uppercase tracking-wider py-1 px-5 rounded-full shadow-lg" style={{ backgroundColor: badge.accent }}>Most Popular</span>
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: badge.bg }}>
                    <IconComp size={20} style={{ color: badge.accent }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#202828] leading-tight">{plan.name}</h3>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: badge.accent }}>{badge.label} Plan</span>
                  </div>
                </div>
                <button onClick={() => handleOpenModal(plan)} className="p-2 text-[#455250] hover:text-[#164A4A] hover:bg-[#164A4A]/10 rounded-lg transition-colors"><Edit2 size={18} /></button>
              </div>
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-black text-[#202828]">&#8377;{price.toLocaleString('en-IN')}</span>
                <span className="text-[#455250] ml-2 font-medium">/ {durationLabel}</span>
              </div>
              <div className="flex items-center space-x-2 mb-8 bg-gray-50 p-3 rounded-xl border border-[#D3DFDA]">
                <Users size={18} className="text-[#164A4A]" />
                <span className="text-sm font-semibold text-[#202828]">{plan.subscribers}</span>
                <span className="text-sm text-[#455250]">Active Subscribers</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#202828] mb-4 uppercase tracking-widest">Features Included:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: badge.bg }}>
                        <Check size={12} style={{ color: badge.accent }} strokeWidth={3} />
                      </span>
                      <span className="text-sm text-[#455250] leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-[#D3DFDA]">
                <button onClick={() => handleOpenModal(plan)} className="w-full py-3 rounded-xl font-bold transition-all text-white shadow-lg hover:opacity-90 active:scale-95" style={{ backgroundColor: badge.accent }}>Edit Plan</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#D3DFDA] pb-4">
              <h2 className="text-2xl font-bold text-[#202828]">Edit Plan</h2>
              <button onClick={() => setShowModal(false)} className="text-[#455250] hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#455250] mb-1">Plan Name</label>
                <input value={formData.name} readOnly className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 bg-gray-50 text-[#455250] cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#455250] mb-1">Monthly Price (&#8377;)</label>
                  <input required type="number" value={formData.monthlyPrice} onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="999" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#455250] mb-1">Annual Price (&#8377;)</label>
                  <input required type="number" value={formData.annualPrice} onChange={(e) => setFormData({ ...formData, annualPrice: e.target.value })} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="9990" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#455250] mb-1">Features (comma separated)</label>
                <textarea required rows={5} value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-[#455250] hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#164A4A] text-white font-bold rounded-lg hover:bg-[#C6A77D] transition-colors">Save Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminMembershipPlans;
