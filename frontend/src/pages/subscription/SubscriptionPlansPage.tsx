import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, CheckCircle, XCircle, Loader2, LogOut, Zap, Crown, Star, Sparkles,
  Users, Dumbbell, Building2, UserCheck, Lock, TrendingUp, Gift
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const SAAS_PLANS = [
  {
    key: 'FREE_TRIAL',
    name: 'Free Trial',
    tagline: 'Try AI GYM risk-free',
    badge: '1 Day',
    icon: Zap,
    iconColor: 'text-slate-500',
    iconBg: 'bg-slate-100',
    borderColor: 'border-[#DCD9CD]',
    priceMonthly: 0,
    priceAnnual: 0,
    priceAnnualPerMonth: 0,
    period: '/ 1 day',
    limits: { members: 10, trainers: 1, staff: 1, branches: 1 },
    features: [
      { text: 'Gym Setup', included: true },
      { text: 'Member Management (Up to 10)', included: true },
      { text: 'Trainer Management (1 Trainer)', included: true },
      { text: 'Membership Plans (1 Plan)', included: true },
      { text: 'Exercise Plans', included: true },
      { text: 'Basic Diet Plans', included: true },
      { text: 'Limited AI Suggestions', included: true },
      { text: 'Basic Member Progress Tracking', included: true },
      { text: 'Basic Reports & Analytics', included: true },
      { text: 'Limited AI Workout Generation', included: true },
      { text: 'Limited AI Diet Generation', included: true },
      { text: 'Attendance Management', included: false },
      { text: 'Payment Tracking', included: false },
      { text: 'Notifications', included: false },
      { text: 'Multiple Branches', included: false },
      { text: 'Priority Support', included: false },
    ],
    ctaText: 'Start Free Trial',
    ctaStyle: 'bg-white border-2 border-[#DCD9CD] text-[#202522] hover:border-[#34483F] hover:bg-[#F5F3EE]',
    trial: true,
    popular: false,
  },
  {
    key: 'BASIC',
    name: 'Basic',
    tagline: 'Perfect for starting gyms',
    badge: 'Popular',
    icon: Star,
    iconColor: 'text-[#34483F]',
    iconBg: 'bg-[#34483F]/10',
    borderColor: 'border-[#34483F]',
    priceMonthly: 399,
    priceAnnual: 3990,         
    priceAnnualPerMonth: 332,  
    savingsAnnual: 798,
    limits: { members: 100, trainers: 5, staff: 2, branches: 1 },
    features: [
      { text: 'Gym Setup', included: true },
      { text: 'Member Management (Up to 100)', included: true },
      { text: 'Trainer Management (Up to 5)', included: true },
      { text: 'Membership Plans (5 Plans)', included: true },
      { text: 'Exercise Plans', included: true },
      { text: 'Diet Plans', included: true },
      { text: 'AI Suggestions', included: true },
      { text: 'Member Progress Tracking', included: true },
      { text: 'Attendance Management', included: true },
      { text: 'Payment Tracking', included: true },
      { text: 'Standard Reports & Analytics', included: true },
      { text: 'AI Workout Generation', included: true },
      { text: 'AI Diet Generation', included: true },
      { text: 'Notifications', included: true },
      { text: 'Multiple Branches', included: false },
      { text: 'Priority Support', included: false },
    ],
    annualBonuses: [
      '2 months FREE',
      'Priority email support',
    ],
    ctaText: 'Choose Basic',
    ctaStyle: 'bg-[#34483F] text-white hover:bg-[#C6A77D] shadow-lg shadow-green-200',
    trial: false,
    popular: true,
  },
  {
    key: 'PREMIUM',
    name: 'Premium',
    tagline: 'Enterprise-grade power',
    badge: 'Advanced',
    icon: Sparkles,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-100',
    borderColor: 'border-purple-300',
    priceMonthly: 799,
    priceAnnual: 7990,        
    priceAnnualPerMonth: 665, 
    savingsAnnual: 1598,
    limits: { members: -1, trainers: -1, staff: -1, branches: 5 },
    features: [
      { text: 'Gym Setup', included: true },
      { text: 'Unlimited Member Management', included: true },
      { text: 'Unlimited Trainer Management', included: true },
      { text: 'Unlimited Membership Plans', included: true },
      { text: 'Exercise Plans', included: true },
      { text: 'Diet Plans', included: true },
      { text: 'Advanced AI Suggestions', included: true },
      { text: 'Advanced Member Progress Tracking', included: true },
      { text: 'Attendance Management', included: true },
      { text: 'Payment Tracking', included: true },
      { text: 'Advanced Reports & Analytics', included: true },
      { text: 'Unlimited AI Workout Generation', included: true },
      { text: 'Unlimited AI Diet Generation', included: true },
      { text: 'Gym Store — Sell Supplements & Merch', included: true },
      { text: 'Gym Store — Online Orders & Payments', included: true },
      { text: 'Gym Store — Inventory & Offline Sales', included: true },
      { text: 'Notifications', included: true },
      { text: 'Multiple Branches', included: true },
      { text: 'Priority Support', included: true },
    ],
    annualBonuses: [
      '2 months FREE',
      'Dedicated account manager',

      'White-label options',
      'Custom integrations support',
      'SLA guarantee',
    ],
    ctaText: 'Choose Premium',
    ctaStyle: 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200',
    trial: false,
    popular: false,
  },
];

const LimitBadge = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between text-xs py-1">
    <span className="text-[#4A514D]">{label}</span>
    <span className="font-bold text-[#202522]">{value === -1 ? '∞ Unlimited' : `Up to ${value}`}</span>
  </div>
);

const SubscriptionPlansPage = () => {
  const navigate = useNavigate();
  const { logout, updateUser } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState<string | null>(null);

  const handleSelect = async (planKey: string) => {
    if (planKey === 'FREE_TRIAL') {
      setError('');
      setLoading(planKey);
      try {
        await api.post('/subscriptions/select', {
          plan: planKey,
          billingCycle: 'trial',
        });
        updateUser({ subscriptionStatus: 'TRIAL', subscriptionPlan: planKey });
        navigate('/admin/dashboard', { replace: true });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to activate trial. Try again.');
      } finally {
        setLoading(null);
      }
      return;
    }
    setPaymentStep(planKey);
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
      updateUser({ subscriptionStatus: 'ACTIVE', subscriptionPlan: paymentStep });
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed. Try again.');
      setPaymentStep(null);
    } finally {
      setLoading(null);
    }
  };

  const getDisplayPrice = (plan: typeof SAAS_PLANS[0]) => {
    if (plan.trial) return { main: '₹0', sub: null };
    if (isAnnual) {
      return {
        main: `₹${plan.priceAnnual?.toLocaleString('en-IN')}`,
        sub: `Equivalent to ₹${plan.priceAnnualPerMonth?.toLocaleString('en-IN')}/mo`,
      };
    }
    return { main: `₹${plan.priceMonthly?.toLocaleString('en-IN')}`, sub: null };
  };

  const getPaymentTotal = (plan: typeof SAAS_PLANS[0]) => {
    if (plan.trial) return { amount: '₹0', period: '/ 1 day' };
    if (isAnnual) {
      return { amount: `₹${plan.priceAnnual?.toLocaleString('en-IN')}`, period: '/year' };
    }
    return { amount: `₹${plan.priceMonthly?.toLocaleString('en-IN')}`, period: '/month' };
  };

  const selectedPlan = SAAS_PLANS.find(p => p.key === paymentStep);

  return (
    <div className="min-h-screen bg-[#F5F3EE] text-[#202522] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#34483F] to-[#8FA89B] rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
              <Activity className="text-white" size={22} />
            </div>
            <span className="text-2xl font-bold text-[#34483F]">AI GYM</span>
          </div>
          <div className="inline-flex items-center space-x-2 bg-[#34483F]/10 border border-[#34483F]/30 rounded-full px-4 py-1.5 text-[#34483F] text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={12} />
            <span>SaaS Platform Subscriptions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-[#202522]">
            Power Your Gym with <span className="text-[#34483F]">AI GYM</span>
          </h1>
          <p className="text-[#4A514D] text-lg mb-3 max-w-2xl mx-auto">
            Choose a plan that fits your gym's size and ambitions. All plans include our core AI management platform.
          </p>
          <p className="text-xs text-[#4A514D] mb-10">These are SaaS subscriptions for gym owners, not individual member plans.</p>

          {error && (
            <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2 text-sm mb-6">
              <span>{error}</span>
            </div>
          )}

          {/* ─── Billing Toggle ─── */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#202522]' : 'text-[#A8ADA9]'}`}>
              Monthly
            </span>

            {/* Toggle pill */}
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              aria-pressed={isAnnual}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#34483F] focus:ring-offset-2 ${isAnnual ? 'bg-[#34483F]' : 'bg-[#CBD5E1]'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#202522]' : 'text-[#A8ADA9]'}`}>
                Annual
              </span>
              {isAnnual ? (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full font-bold">
                  <Gift size={11} /> Save up to 25% — 2 months FREE!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-[#F5F3EE] text-[#8FA89B] border border-[#DCD9CD] text-xs px-3 py-1 rounded-full font-medium">
                  Switch to annual & save up to 25%
                </span>
              )}
            </div>
          </div>

          {/* Annual savings reminder bar */}
          {isAnnual && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-6 py-3 text-sm text-green-700 font-medium">
              <CheckCircle size={16} className="text-green-600 shrink-0" />
              Annual billing: pay once, save big. Prices shown are per month, billed yearly.
            </div>
          )}
        </div>

        {/* ─── Payment Modal ─── */}
        {paymentStep && selectedPlan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[#DCD9CD] rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className={`w-14 h-14 ${selectedPlan.iconBg} rounded-xl flex items-center justify-center mb-6`}>
                <selectedPlan.icon size={28} className={selectedPlan.iconColor} />
              </div>
              <h2 className="text-2xl font-bold text-[#202522] mb-1">Complete Your Purchase</h2>
              <p className="text-[#4A514D] text-sm mb-6">
                You're subscribing to the <span className="text-[#202522] font-bold">{selectedPlan.name} Plan</span>
                {' '}on <span className="font-bold text-[#34483F]">{isAnnual ? 'Annual' : 'Monthly'}</span> billing
              </p>

              <div className="bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A514D]">Plan</span>
                  <span className="text-[#202522] font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A514D]">Billing Cycle</span>
                  <span className={`font-bold ${isAnnual ? 'text-[#34483F]' : 'text-[#202522]'}`}>
                    {isAnnual ? 'Annual (2 months free!)' : 'Monthly'}
                  </span>
                </div>
                {isAnnual && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#4A514D]">Per Month</span>
                    <span className="text-[#202522] font-semibold">₹{selectedPlan.priceAnnualPerMonth?.toLocaleString('en-IN')}/mo</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-[#DCD9CD] pt-3">
                  <span className="text-[#4A514D] font-bold">Total Due Today</span>
                  <span className="text-[#34483F] font-black text-lg">
                    {getPaymentTotal(selectedPlan).amount}
                    <span className="text-sm font-medium text-[#4A514D] ml-1">{getPaymentTotal(selectedPlan).period}</span>
                  </span>
                </div>
                {isAnnual && selectedPlan.savingsAnnual && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
                    <span className="text-green-700 text-xs font-bold">
                      🎉 You save ₹{selectedPlan.savingsAnnual.toLocaleString('en-IN')} compared to monthly billing!
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <input type="text" placeholder="Card Number" className="w-full bg-white border border-[#DCD9CD] text-[#202522] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#34483F]" maxLength={19} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM / YY" className="bg-white border border-[#DCD9CD] text-[#202522] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#34483F]" maxLength={7} />
                  <input type="text" placeholder="CVV" className="bg-white border border-[#DCD9CD] text-[#202522] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#34483F]" maxLength={3} />
                </div>
                <input type="text" placeholder="Cardholder Name" className="w-full bg-white border border-[#DCD9CD] text-[#202522] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#34483F]" />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setPaymentStep(null)}
                  className="flex-1 py-3 bg-white border border-[#DCD9CD] text-[#202522] rounded-xl font-bold hover:bg-[#F5F3EE] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading !== null}
                  className="flex-1 py-3 bg-gradient-to-r from-[#34483F] to-[#8FA89B] text-white rounded-xl font-bold hover:from-[#C6A77D] hover:to-[#0F766E] transition-all disabled:opacity-60 text-sm flex items-center justify-center space-x-2 shadow-lg shadow-green-200"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /><span>Processing...</span></>
                  ) : (
                    <span>Pay {getPaymentTotal(selectedPlan).amount}</span>
                  )}
                </button>
              </div>
              <p className="text-center text-xs text-[#4A514D] mt-4">🔒 Secured by 256-bit SSL encryption</p>
            </div>
          </div>
        )}

        {/* ─── Pricing Cards ─── */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-12">
          {SAAS_PLANS.map((plan) => {
            const Icon = plan.icon;
            const priceDisplay = getDisplayPrice(plan);
            const isPopular = plan.popular;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden
                  ${isPopular ? `bg-white ${plan.borderColor} shadow-xl shadow-green-100` : `bg-white ${plan.borderColor}`}
                  ${plan.trial ? 'opacity-90' : ''}
                `}
              >
                {/* Popular ribbon */}
                {isPopular && (
                  <div className="bg-[#34483F] text-white text-[10px] font-extrabold text-center py-2 uppercase tracking-widest">
                    ⭐ Most Popular
                  </div>
                )}

                {/* Annual badge on card */}
                {isAnnual && !plan.trial && (
                  <div className="bg-green-50 border-b border-green-100 text-green-700 text-[10px] font-bold text-center py-1.5 uppercase tracking-widest">
                    🎁 Annual Plan — 2 Months FREE
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.iconBg}`}>
                          <Icon size={20} className={plan.iconColor} />
                        </div>
                        <div>
                          <h3 className="font-bold text-[#202522] text-base">{plan.name}</h3>
                          <p className="text-[#4A514D] text-xs">{plan.tagline}</p>
                        </div>
                      </div>
                      {plan.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F3EE] border border-[#DCD9CD] text-[#8FA89B]">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Price block */}
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black tracking-tight ${isPopular ? 'text-[#34483F]' : plan.key === 'PREMIUM' ? 'text-purple-600' : 'text-[#202522]'}`}>
                          {priceDisplay.main}
                        </span>
                        <span className="text-[#4A514D] text-sm font-medium">
                          {plan.trial ? '/ 1 day' : (isAnnual ? '/year' : '/mo')}
                        </span>
                      </div>

                      {/* Annual total / monthly original */}
                      {!plan.trial && (
                        <div className="mt-1 min-h-[1.5rem]">
                          {isAnnual ? (
                            <div className="space-y-0.5">
                              <p className="text-[#4A514D] text-xs">{priceDisplay.sub}</p>
                              <p className="text-green-600 text-xs font-bold">
                                💰 Save ₹{plan.savingsAnnual?.toLocaleString('en-IN')} vs monthly
                              </p>
                            </div>
                          ) : (
                            <p className="text-[#A8ADA9] text-xs">
                              or ₹{plan.priceAnnualPerMonth?.toLocaleString('en-IN')}/mo billed annually
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="bg-[#F2EFE8] rounded-xl p-3 mb-5 border border-[#DCD9CD]">
                    <p className="text-[10px] uppercase tracking-widest text-[#4A514D] font-bold mb-2">Platform Limits</p>
                    <LimitBadge label="👥 Members" value={plan.limits.members} />
                    <LimitBadge label="🏋️ Trainers" value={plan.limits.trainers} />
                    <LimitBadge label="🏢 Branches" value={plan.limits.branches} />
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`flex items-start space-x-2 text-xs ${f.included ? 'text-[#202522]' : 'text-[#CBD5E1]'}`}>
                        {f.included ? (
                          <CheckCircle size={14} className={`shrink-0 mt-0.5 ${isPopular ? 'text-[#34483F]' : plan.key === 'PREMIUM' ? 'text-purple-500' : 'text-[#8FA89B]'}`} />
                        ) : (
                          <XCircle size={14} className="shrink-0 mt-0.5 text-[#E8E5DA]" />
                        )}
                        <span className={!f.included ? 'line-through' : ''}>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Annual Bonuses */}
                  {isAnnual && !plan.trial && plan.annualBonuses && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-widest text-green-700 font-bold mb-2 flex items-center gap-1">
                        <Gift size={10} /> Annual Bonuses
                      </p>
                      <ul className="space-y-1">
                        {plan.annualBonuses.map((bonus, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-green-700">
                            <CheckCircle size={11} className="text-green-500 shrink-0" />
                            {bonus}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    id={`plan-${plan.key}`}
                    onClick={() => handleSelect(plan.key)}
                    disabled={loading !== null}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-60 ${plan.ctaStyle}`}
                  >
                    {loading === plan.key ? (
                      <><Loader2 size={16} className="animate-spin" /><span>Activating...</span></>
                    ) : (
                      <span>{plan.ctaText}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="bg-white border border-[#DCD9CD] rounded-2xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Lock size={18} className="text-[#34483F]" />
            <h3 className="text-[#202522] font-bold">How Access Control Works</h3>
          </div>
          <p className="text-[#4A514D] text-sm max-w-2xl mx-auto">
            Your subscription plan controls what features your gym can access on the AI GYM platform.
            Adding members beyond your plan's limit, accessing Advanced Analytics on Silver, or using 1-on-1 Coaching
            on Gold will show an upgrade prompt. After payment, features unlock instantly.
          </p>
        </div>

        <div className="text-center">
          <button onClick={logout} className="text-sm text-[#4A514D] hover:text-[#34483F] transition-colors flex items-center space-x-2 mx-auto">
            <LogOut size={16} /><span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
