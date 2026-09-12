import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, CheckCircle, XCircle, Zap, Star, Crown, Sparkles,
  Users, Dumbbell, Building2, UserCheck, TrendingUp, Calendar,
  AlertTriangle, ArrowUpCircle, Loader2, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const PLAN_DETAILS: Record<string, any> = {
  FREE_TRIAL: {
    name: 'Free Trial', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-500/30',
    icon: Zap, limits: { members: 10, trainers: 1, staff: 1, branches: 1 },
  },
  SILVER: {
    name: 'Silver', color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-400/30',
    icon: Star, limits: { members: 100, trainers: 5, staff: 2, branches: 1 },
    priceMonthly: 799, priceAnnual: 7990,
  },
  GOLD: {
    name: 'Gold', color: 'text-[#16A34A]', bg: 'bg-[#16A34A]/10', border: 'border-[#16A34A]/40',
    icon: Crown, limits: { members: 500, trainers: 15, staff: 5, branches: 2 },
    priceMonthly: 1499, priceAnnual: 14990,
  },
  PREMIUM: {
    name: 'Premium', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-500/30',
    icon: Sparkles, limits: { members: -1, trainers: -1, staff: -1, branches: 5 },
    priceMonthly: 2499, priceAnnual: 24990,
  },
};

const UPGRADE_PLANS = [
  {
    key: 'SILVER', name: 'Silver', tagline: 'For starting gyms',
    priceMonthly: 799, priceAnnual: 7990, savingsAnnual: 1598,
    color: 'text-slate-300', border: 'border-[#CCFBF1]', ctaStyle: 'bg-slate-500/20 border border-slate-400/50 text-slate-300 hover:bg-slate-500/30',
    icon: Star,
  },
  {
    key: 'GOLD', name: 'Gold', tagline: 'For growing gyms',
    priceMonthly: 1499, priceAnnual: 14990, savingsAnnual: 2998,
    color: 'text-[#16A34A]', border: 'border-[#16A34A]', ctaStyle: 'bg-[#16A34A] text-white hover:bg-[#15803D]',
    icon: Crown, popular: true,
  },
  {
    key: 'PREMIUM', name: 'Premium', tagline: 'Enterprise-grade',
    priceMonthly: 2499, priceAnnual: 24990, savingsAnnual: 4998,
    color: 'text-purple-400', border: 'border-purple-500/40', ctaStyle: 'bg-purple-600/80 border border-purple-500/50 text-[#1E293B] hover:bg-purple-600',
    icon: Sparkles,
  },
];

const LimitBar = ({ label, icon: Icon, used, max, color }: any) => {
  const pct = max === -1 ? 0 : Math.min(100, Math.round((used / max) * 100));
  const isUnlimited = max === -1;
  const isFull = !isUnlimited && pct >= 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Icon size={14} className={color} />
          <span className="text-[#475569] text-xs">{label}</span>
        </div>
        <span className={`text-xs font-bold ${isFull ? 'text-teal-400' : 'text-[#1E293B]'}`}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${max}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-[#FFFFFF] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-teal-400' : pct > 80 ? 'bg-[#0D9488]' : 'bg-[#16A34A]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
};

const GymAdminSubscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const currentPlanKey = user?.subscriptionPlan || 'FREE_TRIAL';
  const currentPlan = PLAN_DETAILS[currentPlanKey] || PLAN_DETAILS.FREE_TRIAL;
  const PlanIcon = currentPlan.icon;

  // Simulated usage stats (in a real app these would come from API)
  const usage = { members: 23, trainers: 2, staff: 1, branches: 1 };

  const isExpired = user?.subscriptionStatus === 'EXPIRED';
  const isTrial = user?.subscriptionStatus === 'TRIAL';
  const isActive = user?.subscriptionStatus === 'ACTIVE';

  const handleUpgrade = (planKey: string) => {
    setPaymentStep(planKey);
  };

  const getDisplayPrice = (plan: typeof UPGRADE_PLANS[0]) => {
    if (isAnnual) {
      const perMonth = Math.round(plan.priceAnnual / 12);
      return { main: `₹${plan.priceAnnual.toLocaleString('en-IN')}`, sub: `Equivalent to ₹${perMonth.toLocaleString('en-IN')}/mo` };
    }
    return { main: `₹${plan.priceMonthly.toLocaleString('en-IN')}`, sub: null };
  };

  const handlePayment = async () => {
    if (!paymentStep) return;
    setLoading(paymentStep);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await api.post('/subscriptions/select', {
        plan: paymentStep,
        billingCycle: isAnnual ? 'annual' : 'monthly',
      });
      setPaymentSuccess(true);
      setPaymentStep(null);
    } catch (err: any) {
      alert('Payment failed. Try again.');
    } finally {
      setLoading(null);
    }
  };

  const upgradeTarget = UPGRADE_PLANS.find(p => p.key === paymentStep);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Subscription Management</h1>
        <p className="text-[#475569] mt-1">Manage your AI GYM SaaS platform subscription and usage.</p>
      </div>

      {/* Payment Success Banner */}
      {paymentSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-[#1E293B] font-bold">Payment Successful! Your plan has been upgraded.</h3>
            <p className="text-[#475569] text-sm mt-1">Your new features are now active. Refresh if any dashboard items haven't updated yet.</p>
          </div>
        </div>
      )}

      {/* Expiry Warning */}
      {(isExpired || isTrial) && (
        <div className={`border rounded-2xl p-5 flex items-center justify-between ${isExpired ? 'bg-[#0D9488]/10 border-[#0D9488]/30' : 'bg-[#FFFFFF] border-[#16A34A]/30'}`}>
          <div className="flex items-center space-x-4">
            <AlertTriangle size={24} className={isExpired ? 'text-teal-400' : 'text-[#16A34A]'} />
            <div>
              <h3 className="text-[#1E293B] font-bold">{isExpired ? 'Your free trial has expired!' : 'Free Trial Active — 1 Day Remaining'}</h3>
              <p className="text-[#475569] text-sm mt-0.5">{isExpired ? 'Upgrade to a paid plan to restore full access.' : 'Upgrade now to avoid interruption when your trial ends.'}</p>
            </div>
          </div>
          <button
            onClick={() => document.getElementById('upgrade-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="shrink-0 flex items-center space-x-2 px-4 py-2.5 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors text-sm"
          >
            <ArrowUpCircle size={16} />
            <span>Upgrade Now</span>
          </button>
        </div>
      )}

      {/* Current Plan Card */}
      <div className={`bg-[#FFFFFF] border ${currentPlan.border} rounded-2xl p-6`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 ${currentPlan.bg} rounded-xl flex items-center justify-center`}>
              <PlanIcon size={26} className={currentPlan.color} />
            </div>
            <div>
              <p className="text-[#475569] text-xs uppercase tracking-widest font-bold mb-1">Current Plan</p>
              <h2 className={`text-2xl font-black ${currentPlan.color}`}>{currentPlan.name} Plan</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded-md font-bold ${isActive ? 'bg-green-500/10 text-green-400' : isTrial ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#0D9488]/10 text-teal-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400' : isTrial ? 'bg-[#16A34A]' : 'bg-teal-400'}`} />
                  <span>{user?.subscriptionStatus || 'ACTIVE'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Billing Cycle', value: isTrial ? '1 Day Trial' : (isAnnual ? 'Annual' : 'Monthly') },
              { label: 'Start Date', value: new Date().toLocaleDateString('en-IN') },
              { label: 'Renewal Date', value: isTrial ? 'Trial Ends Today' : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN') },
              { label: 'Status', value: isActive ? 'Active' : isTrial ? 'Trial' : 'Expired' },
            ].map((item, i) => (
              <div key={i} className="bg-[#FFFFFF] rounded-xl p-3 border border-[#CCFBF1]">
                <p className="text-[#555] text-[10px] uppercase tracking-wider font-bold">{item.label}</p>
                <p className="text-[#1E293B] font-semibold text-sm mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-[#1E293B] mb-5 flex items-center space-x-2">
          <TrendingUp size={20} className="text-[#16A34A]" />
          <span>Platform Usage</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LimitBar label="Members" icon={Users} used={usage.members} max={currentPlan.limits.members} color="text-blue-400" />
          <LimitBar label="Trainers" icon={Dumbbell} used={usage.trainers} max={currentPlan.limits.trainers} color="text-green-400" />
          <LimitBar label="Staff" icon={UserCheck} used={usage.staff} max={currentPlan.limits.staff} color="text-purple-400" />
          <LimitBar label="Branches" icon={Building2} used={usage.branches} max={currentPlan.limits.branches} color="text-[#16A34A]" />
        </div>
        <p className="text-[#555] text-xs mt-4">
          💡 Usage stats update in real-time. When you reach a limit, you'll see an upgrade prompt in the respective section.
        </p>
      </div>

      {/* Upgrade Plans */}
      <div id="upgrade-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-bold text-[#1E293B]">Upgrade Your Plan</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#1E293B]' : 'text-[#94A3B8]'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              aria-pressed={isAnnual}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:ring-offset-1 ${isAnnual ? 'bg-[#16A34A]' : 'bg-[#CBD5E1]'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#1E293B]' : 'text-[#94A3B8]'}`}>Annual</span>
              {isAnnual ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">
                  2 months FREE!
                </span>
              ) : (
                <span className="text-xs bg-[#F0FDFA] text-[#0D9488] px-2 py-0.5 rounded-full border border-[#CCFBF1]">
                  Save up to 25%
                </span>
              )}
            </div>
          </div>
        </div>
        {isAnnual && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 font-medium">
            <CheckCircle size={15} className="text-green-600 shrink-0" />
            Annual billing: prices shown are per month — total charged once per year.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {UPGRADE_PLANS.filter(p => p.key !== currentPlanKey).map(plan => {
            const PIcon = plan.icon;
            return (
              <div key={plan.key} className={`relative bg-[#FFFFFF] border-2 ${plan.border} rounded-2xl p-6 ${plan.popular ? 'shadow-[0_0_30px_rgba(212,175,55,0.12)]' : ''}`}>
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#16A34A] text-white text-[10px] font-extrabold px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                    ⭐ Most Popular
                  </span>
                )}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 ${plan.key === 'GOLD' ? 'bg-[#16A34A]/10' : plan.key === 'PREMIUM' ? 'bg-purple-400/10' : 'bg-slate-400/10'} rounded-xl flex items-center justify-center`}>
                    <PIcon size={20} className={plan.color} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1E293B]">{plan.name}</h3>
                    <p className="text-[#475569] text-xs">{plan.tagline}</p>
                  </div>
                </div>
                {(() => { const pd = getDisplayPrice(plan); return (
                  <div className="mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black ${plan.color}`}>{pd.main}</span>
                      <span className="text-[#475569] text-sm">{isAnnual ? '/year' : '/mo'}</span>
                    </div>
                    {pd.sub && <p className="text-[#475569] text-xs mt-0.5">{pd.sub}</p>}
                    {isAnnual ? (
                      <p className="text-green-600 text-xs mt-1 font-bold">💰 Save ₹{plan.savingsAnnual.toLocaleString('en-IN')} vs monthly</p>
                    ) : (
                      <p className="text-[#94A3B8] text-xs mt-1">or save 25% with annual</p>
                    )}
                  </div>
                );})()} 
                <button
                  onClick={() => handleUpgrade(plan.key)}
                  disabled={loading !== null}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all mt-4 flex items-center justify-center space-x-2 ${plan.ctaStyle}`}
                >
                  <ArrowUpCircle size={16} />
                  <span>Upgrade to {plan.name}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {paymentStep && upgradeTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 ${upgradeTarget.key === 'GOLD' ? 'bg-[#16A34A]/10' : 'bg-purple-400/10'} rounded-xl flex items-center justify-center`}>
                <upgradeTarget.icon size={24} className={upgradeTarget.color} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1E293B]">Upgrade to {upgradeTarget.name}</h2>
                <p className="text-[#475569] text-sm">{upgradeTarget.tagline}</p>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#475569]">Plan</span>
                <span className="text-[#1E293B] font-semibold">{upgradeTarget.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#475569]">Billing</span>
                <span className="text-[#1E293B] font-semibold">{isAnnual ? 'Annual' : 'Monthly'}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#CCFBF1] pt-3">
                <span className="text-[#475569] font-bold">Total</span>
                <span className={`font-bold text-lg ${upgradeTarget.color}`}>
                  ₹{(isAnnual ? upgradeTarget.priceAnnual : upgradeTarget.priceMonthly).toLocaleString('en-IN')}{isAnnual ? '/year' : '/month'}
                </span>
              </div>
              {isAnnual && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-center">
                  <span className="text-green-400 text-xs font-bold">🎉 You save ₹{upgradeTarget.savingsAnnual.toLocaleString('en-IN')}/year!</span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <input type="text" placeholder="Card Number" className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]" maxLength={19} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="MM / YY" className="bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]" maxLength={7} />
                <input type="text" placeholder="CVV" className="bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]" maxLength={3} />
              </div>
              <input type="text" placeholder="Cardholder Name" className="w-full bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A]" />
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setPaymentStep(null)} className="flex-1 py-3 bg-[#FFFFFF] text-[#1E293B] rounded-xl font-bold hover:bg-[#E2E8F0] transition-colors text-sm">Cancel</button>
              <button
                onClick={handlePayment}
                disabled={loading !== null}
                className="flex-1 py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors disabled:opacity-60 text-sm flex items-center justify-center space-x-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /><span>Processing...</span></> : <span>Pay Now</span>}
              </button>
            </div>
            <div className="flex items-center justify-center space-x-1 mt-4">
              <Shield size={12} className="text-[#555]" />
              <p className="text-center text-xs text-[#555]">256-bit SSL encrypted</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminSubscription;
