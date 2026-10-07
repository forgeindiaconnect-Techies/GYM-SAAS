import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, CheckCircle, XCircle, Loader2, LogOut, Zap, Crown, Star, Sparkles,
  Lock, Gift, AlertCircle
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
    iconColor: 'text-[#FED7AA]',
    iconBg: 'bg-[#FFFDF8]',
    borderColor: 'border-[#E7E5E4]',
    priceMonthly: 0,
    priceAnnual: 0,
    priceAnnualPerMonth: 0,
    period: '/ 1 day',
    limits: { members: 10, trainers: 1, staff: 1, branches: 1 },
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
    ctaText: 'Start Free Trial',
    ctaStyle: 'bg-white border-2 border-[#E7E5E4] text-[#292524] hover:border-[#F97316] hover:bg-[#FFFDF8]',
    trial: true,
    popular: false,
  },
  {
    key: 'SILVER',
    name: 'Silver',
    tagline: 'Beginner package for growing gyms',
    badge: 'Beginner',
    icon: Star,
    iconColor: 'text-[#FED7AA]',
    iconBg: 'bg-slate-100',
    borderColor: 'border-[#E7E5E4]',
    priceMonthly: 799,
    priceAnnual: 7190,
    priceAnnualPerMonth: 599,
    savingsAnnual: 1598,
    limits: { members: 100, trainers: 5, staff: 2, branches: 1 },
    features: [
      { text: 'Gym Profile Management', included: true },
      { text: 'Member Management (up to 100)', included: true },
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
    annualBonuses: [
      '2 months FREE with annual',
      'Priority email support',
    ],
    ctaText: 'Choose Silver',
    ctaStyle: 'bg-[#FED7AA] text-black hover:bg-[#5b8c8a] shadow-lg shadow-teal-100',
    trial: false,
    popular: false,
  },
  {
    key: 'GOLD',
    name: 'Gold',
    tagline: 'Most popular all-in-one powerhouse',
    badge: 'Most Popular',
    icon: Crown,
    iconColor: 'text-[#F97316]',
    iconBg: 'bg-[#F97316]/10',
    borderColor: 'border-[#F97316]',
    priceMonthly: 1499,
    priceAnnual: 13490,
    priceAnnualPerMonth: 1124,
    savingsAnnual: 4498,
    limits: { members: 500, trainers: 15, staff: 5, branches: 2 },
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
    annualBonuses: [
      'Save ₹4,498 with annual',
      'Priority support access',
    ],
    ctaText: 'Choose Gold',
    ctaStyle: 'bg-[#F97316] text-white hover:bg-[#123636] shadow-lg shadow-teal-200',
    trial: false,
    popular: true,
  },
  {
    key: 'PREMIUM',
    name: 'Premium',
    tagline: 'Enterprise-grade multi-branch scale',
    badge: 'Advanced',
    icon: Sparkles,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    borderColor: 'border-purple-300',
    priceMonthly: 2499,
    priceAnnual: 22490,
    priceAnnualPerMonth: 1874,
    savingsAnnual: 7498,
    limits: { members: -1, trainers: -1, staff: -1, branches: 5 },
    features: [
      { text: 'Everything in Gold', included: true },
      { text: '1-on-1 Online Coaching', included: true },
      { text: 'Live Trainer Sessions', included: true },
      { text: 'Priority Trainer Booking', included: true },
      { text: 'AI + Trainer Hybrid Recs', included: true },
      { text: 'Branch-wise Analytics', included: true },
      { text: 'Member Retention Analytics', included: true },
      { text: 'Gym Store — Sell Supplements & Merch', included: true },
      { text: 'Gym Store — Online Orders & Payments', included: true },
      { text: 'Gym Store — Inventory & Offline Sales', included: true },
      { text: 'Priority Support & Monthly Review', included: true },
    ],
    annualBonuses: [
      'Save ₹7,498 with annual',
      'Dedicated account manager',
      'Custom integrations support',
    ],
    ctaText: 'Choose Premium',
    ctaStyle: 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-200',
    trial: false,
    popular: false,
  },
];

const LimitBadge = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center justify-between text-xs py-1">
    <span className="text-[#78716C]">{label}</span>
    <span className="font-bold text-[#292524]">{value === -1 ? '∞ Unlimited' : `Up to ${value}`}</span>
  </div>
);

const SubscriptionPlansPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUser } = useAuth();
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
    <div className="min-h-screen bg-[#FFFDF8] text-[#292524] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Activity className="text-white" size={22} />
            </div>
            <span className="text-2xl font-bold text-[#F97316]">AI GYM</span>
          </div>

          {(user?.subscriptionStatus?.toUpperCase() === 'EXPIRED' || (user?.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) || (location.state as any)?.message) && (
            <div className="mb-8 p-5 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between text-red-900 shadow-md max-w-3xl mx-auto text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="text-red-600" size={26} />
                </div>
                <div>
                  <p className="font-bold text-lg text-red-950">Your subscription plan is completed</p>
                  <p className="text-sm text-red-700 font-medium">Please upgrade your plan below to continue accessing AI GYM platform services.</p>
                </div>
              </div>
            </div>
          )}

          <div className="inline-flex items-center space-x-2 bg-[#F97316]/10 border border-[#F97316]/30 rounded-full px-4 py-1.5 text-[#F97316] text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={12} />
            <span>SaaS Platform Subscriptions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-[#292524]">
            Power Your Gym with <span className="text-[#F97316]">AI GYM</span>
          </h1>
          <p className="text-[#78716C] text-lg mb-3 max-w-2xl mx-auto">
            Choose a plan that fits your gym's size and ambitions. All plans include our core AI management platform.
          </p>
          <p className="text-xs text-[#78716C] mb-10">These are SaaS subscriptions for gym owners, not individual member plans.</p>

          {error && (
            <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2 text-sm mb-6">
              <span>{error}</span>
            </div>
          )}

          {/* ─── Billing Toggle ─── */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#292524]' : 'text-[#78716C]'}`}>
              Monthly
            </span>

            {/* Toggle pill */}
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              aria-pressed={isAnnual}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 ${isAnnual ? 'bg-[#F97316]' : 'bg-[#CBD5E1]'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#292524]' : 'text-[#78716C]'}`}>
                Annual
              </span>
              {isAnnual ? (
                <span className="inline-flex items-center gap-1 bg-[#FED7AA]/10 text-[#F97316] border border-green-200 text-xs px-3 py-1 rounded-full font-bold">
                  <Gift size={11} /> Save up to 25% — 2 months FREE!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-[#FFFDF8] text-[#FED7AA] border border-[#E7E5E4] text-xs px-3 py-1 rounded-full font-medium">
                  Switch to annual & save up to 25%
                </span>
              )}
            </div>
          </div>

          {/* Annual savings reminder bar */}
          {isAnnual && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-6 py-3 text-sm text-green-700 font-medium">
              <CheckCircle size={16} className="text-[#F97316] shrink-0" />
              Annual billing: pay once, save big. Prices shown are per month, billed yearly.
            </div>
          )}
        </div>

        {/* ─── Payment Modal ─── */}
        {paymentStep && selectedPlan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className={`w-14 h-14 ${selectedPlan.iconBg} rounded-xl flex items-center justify-center mb-6`}>
                <selectedPlan.icon size={28} className={selectedPlan.iconColor} />
              </div>
              <h2 className="text-2xl font-bold text-[#292524] mb-1">Complete Your Purchase</h2>
              <p className="text-[#78716C] text-sm mb-6">
                You're subscribing to the <span className="text-[#292524] font-bold">{selectedPlan.name} Plan</span>
                {' '}on <span className="font-bold text-[#F97316]">{isAnnual ? 'Annual' : 'Monthly'}</span> billing
              </p>

              <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#78716C]">Plan</span>
                  <span className="text-[#292524] font-semibold">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#78716C]">Billing Cycle</span>
                  <span className={`font-bold ${isAnnual ? 'text-[#F97316]' : 'text-[#292524]'}`}>
                    {isAnnual ? 'Annual (2 months free!)' : 'Monthly'}
                  </span>
                </div>
                {isAnnual && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#78716C]">Per Month</span>
                    <span className="text-[#292524] font-semibold">₹{selectedPlan.priceAnnualPerMonth?.toLocaleString('en-IN')}/mo</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-[#E7E5E4] pt-3">
                  <span className="text-[#78716C] font-bold">Total Due Today</span>
                  <span className="text-[#F97316] font-black text-lg">
                    {getPaymentTotal(selectedPlan).amount}
                    <span className="text-sm font-medium text-[#78716C] ml-1">{getPaymentTotal(selectedPlan).period}</span>
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
                <input type="text" placeholder="Card Number" className="w-full bg-white border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F97316]" maxLength={19} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM / YY" className="bg-white border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F97316]" maxLength={7} />
                  <input type="text" placeholder="CVV" className="bg-white border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F97316]" maxLength={3} />
                </div>
                <input type="text" placeholder="Cardholder Name" className="w-full bg-white border border-[#E7E5E4] text-[#292524] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F97316]" />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setPaymentStep(null)}
                  className="flex-1 py-3 bg-white border border-[#E7E5E4] text-[#292524] rounded-xl font-bold hover:bg-[#FFFDF8] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading !== null}
                  className="flex-1 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-xl font-bold hover:from-[#EA580C] hover:to-[#EA580C] transition-all disabled:opacity-60 text-sm flex items-center justify-center space-x-2 shadow-lg shadow-orange-200"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /><span>Processing...</span></>
                  ) : (
                    <span>Pay {getPaymentTotal(selectedPlan).amount}</span>
                  )}
                </button>
              </div>
              <p className="text-center text-xs text-[#78716C] mt-4">🔒 Secured by 256-bit SSL encryption</p>
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
                  ${isPopular ? `bg-white ${plan.borderColor} shadow-xl shadow-orange-100` : `bg-white ${plan.borderColor}`}
                  ${plan.trial ? 'opacity-90' : ''}
                `}
              >
                {/* Popular ribbon */}
                {isPopular && (
                  <div className="bg-[#F97316] text-white text-[10px] font-extrabold text-center py-2 uppercase tracking-widest">
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
                          <h3 className="font-bold text-[#292524] text-base">{plan.name}</h3>
                          <p className="text-[#78716C] text-xs">{plan.tagline}</p>
                        </div>
                      </div>
                      {plan.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFDF8] border border-[#E7E5E4] text-[#FED7AA]">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Price block */}
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black tracking-tight ${isPopular ? 'text-[#F97316]' : plan.key === 'PREMIUM' ? 'text-purple-600' : 'text-[#292524]'}`}>
                          {priceDisplay.main}
                        </span>
                        <span className="text-[#78716C] text-sm font-medium">
                          {plan.trial ? '/ 1 day' : (isAnnual ? '/year' : '/mo')}
                        </span>
                      </div>

                      {/* Annual total / monthly original */}
                      {!plan.trial && (
                        <div className="mt-1 min-h-[1.5rem]">
                          {isAnnual ? (
                            <div className="space-y-0.5">
                              <p className="text-[#78716C] text-xs">{priceDisplay.sub}</p>
                              <p className="text-[#F97316] text-xs font-bold">
                                💰 Save ₹{plan.savingsAnnual?.toLocaleString('en-IN')} vs monthly
                              </p>
                            </div>
                          ) : (
                            <p className="text-[#78716C] text-xs">
                              or ₹{plan.priceAnnualPerMonth?.toLocaleString('en-IN')}/mo billed annually
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="bg-[#FFFDF8] rounded-xl p-3 mb-5 border border-[#E7E5E4]">
                    <p className="text-[10px] uppercase tracking-widest text-[#78716C] font-bold mb-2">Platform Limits</p>
                    <LimitBadge label="👥 Members" value={plan.limits.members} />
                    <LimitBadge label="🏋️ Trainers" value={plan.limits.trainers} />
                    <LimitBadge label="🏢 Branches" value={plan.limits.branches} />
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`flex items-start space-x-2 text-xs ${f.included ? 'text-[#292524]' : 'text-[#CBD5E1]'}`}>
                        {f.included ? (
                          <CheckCircle size={14} className={`shrink-0 mt-0.5 ${isPopular ? 'text-[#F97316]' : plan.key === 'PREMIUM' ? 'text-purple-500' : 'text-[#FED7AA]'}`} />
                        ) : (
                          <XCircle size={14} className="shrink-0 mt-0.5 text-[#FED7AA]" />
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
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Lock size={18} className="text-[#F97316]" />
            <h3 className="text-[#292524] font-bold">How Access Control Works</h3>
          </div>
          <p className="text-[#78716C] text-sm max-w-2xl mx-auto">
            Your subscription plan controls what features your gym can access on the AI GYM platform.
            Adding members beyond your plan's limit, accessing Advanced Analytics on Silver, or using 1-on-1 Coaching
            on Gold will show an upgrade prompt. After payment, features unlock instantly.
          </p>
        </div>

        <div className="text-center">
          <button onClick={logout} className="text-sm text-[#78716C] hover:text-[#F97316] transition-colors flex items-center space-x-2 mx-auto">
            <LogOut size={16} /><span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
