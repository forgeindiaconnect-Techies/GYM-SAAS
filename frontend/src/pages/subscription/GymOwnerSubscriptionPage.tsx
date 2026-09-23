import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity, CheckCircle, XCircle, ChevronRight, Crown, Star,
  Sparkles, Zap, LogOut, Gift
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

export const plans = [
  {
    key: 'FREE_TRIAL',
    name: 'Free Trial',
    badge: '1 Day',
    icon: Zap,
    iconBg: 'bg-[#F5F3EE]',
    iconColor: 'text-[#8FA89B]',
    borderDefault: 'border-[#DCD9CD]',
    borderSelected: 'border-[#34483F]',
    accentBar: 'bg-[#8FA89B]',
    priceColor: 'text-[#202522]',
    checkColor: 'text-[#8FA89B]',
    trial: true,
    priceMonthly: 0,
    priceAnnual: 0,
    priceAnnualPerMonth: 0,
    limits: '10 members • 1 trainer • 1 branch',
    features: [
      'Basic Gym Profile',
      'Basic Member Management',
      'Basic Attendance Tracking',
      'Basic AI Fitness Assessment',
      '1 AI-generated Workout Plan',
      'Basic Diet Recommendation',
      'Limited AI Chat',
    ],
    locked: ['Advanced Analytics', 'Trainer Booking', '1-on-1 Coaching'],
    ctaText: 'Start Free Trial',
  },
  {
    key: 'SILVER',
    name: 'Silver',
    badge: 'Beginner',
    icon: Star,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
    borderDefault: 'border-[#DCD9CD]',
    borderSelected: 'border-[#8FA89B]',
    accentBar: 'bg-[#8FA89B]',
    priceColor: 'text-[#8FA89B]',
    checkColor: 'text-[#8FA89B]',
    trial: false,
    priceMonthly: 799,
    priceAnnual: 7190,
    priceAnnualPerMonth: 599,
    savingsAnnual: 1598,
    limits: '100 members • 5 trainers • 1 branch',
    features: [
      'Gym Profile Management',
      'Member Management (up to 100)',
      'Trainer & Staff Management',
      'AI Fitness Assessment',
      'Basic AI Workout & Diet Plans',
      'AI Chat Assistant',
      'Basic Reports (3 types)',
      'Membership Tracking',
    ],
    locked: ['Advanced Analytics', 'Trainer Booking', '1-on-1 Coaching'],
    ctaText: 'Choose Silver',
  },
  {
    key: 'GOLD',
    name: 'Gold',
    badge: 'Most Popular',
    icon: Crown,
    iconBg: 'bg-[#34483F]/10',
    iconColor: 'text-[#34483F]',
    borderDefault: 'border-[#34483F]',
    borderSelected: 'border-[#34483F]',
    accentBar: 'bg-[#34483F]',
    priceColor: 'text-[#34483F]',
    checkColor: 'text-[#34483F]',
    popular: true,
    trial: false,
    priceMonthly: 1499,
    priceAnnual: 13490,
    priceAnnualPerMonth: 1124,
    savingsAnnual: 4498,
    limits: '500 members • 15 trainers • 2 branches',
    features: [
      'Everything in Silver',
      'Advanced AI Workout & Diet Plans',
      'AI Fitness Assistant',
      'Goal-Based Workout Recs',
      'Trainer Discovery & Booking',
      'Trainer Scheduling',
      'Detailed Progress Analytics',
      'Revenue & Membership Analytics',
    ],
    locked: ['1-on-1 Coaching', 'Live Trainer Sessions'],
    ctaText: 'Choose Gold',
  },
  {
    key: 'PREMIUM',
    name: 'Premium',
    badge: 'Advanced',
    icon: Sparkles,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderDefault: 'border-purple-200',
    borderSelected: 'border-purple-500',
    accentBar: 'bg-purple-500',
    priceColor: 'text-purple-600',
    checkColor: 'text-purple-500',
    trial: false,
    priceMonthly: 2499,
    priceAnnual: 22490,
    priceAnnualPerMonth: 1874,
    savingsAnnual: 7498,
    limits: 'Unlimited members & trainers • 5 branches',
    features: [
      'Everything in Gold',
      '1-on-1 Online Coaching',
      'Live Trainer Sessions',
      'Priority Trainer Booking',
      'AI + Trainer Hybrid Recs',
      'Branch-wise Analytics',
      'Member Retention Analytics',
      'Gym Store — Sell Supplements & Merch',
      'Gym Store — Online Orders & Payments',
      'Gym Store — Inventory & Offline Sales',
      'Priority Support & Monthly Review',
    ],
    locked: [],
    ctaText: 'Choose Premium',
  },
];

const GymOwnerSubscriptionPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.trial) return { main: '₹0', period: '/ 1 day', sub: null };
    if (isAnnual) {
      return {
        main: `₹${plan.priceAnnual?.toLocaleString('en-IN')}`,
        period: '/year',
        sub: `Equivalent to ₹${plan.priceAnnualPerMonth?.toLocaleString('en-IN')}/mo`,
      };
    }
    return { main: `₹${plan.priceMonthly.toLocaleString('en-IN')}`, period: '/mo', sub: null };
  };

  const handleSelectPlan = async () => {
    if (!selectedPlan) return;
    setIsLoading(true);
    try {
      const billingCycle = selectedPlan === 'FREE_TRIAL' ? 'trial' : (isAnnual ? 'annual' : 'monthly');
      const response = await api.post('/subscriptions/select', { plan: selectedPlan, billingCycle });
      const { subscription } = response.data;
      if (selectedPlan === 'FREE_TRIAL') {
        navigate('/admin/dashboard');
      } else {
        navigate('/gym-owner/payment', { state: { subscription } });
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Failed to select plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex flex-col px-4 py-12">
      {/* Subtle top gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(22,163,74,0.07)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-12">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-[#34483F] to-[#8FA89B] rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
              <Activity className="text-white" size={22} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#34483F]">AI GYM</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-[#4A514D] text-sm">Welcome, <strong className="text-[#202522]">{user?.firstName}</strong></span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-[#4A514D] hover:text-[#34483F] transition-colors text-sm bg-white px-4 py-2 rounded-lg border border-[#DCD9CD] hover:border-[#34483F]"
            >
              <LogOut size={16} /><span>Sign out</span>
            </button>
          </div>
        </div>

        {/* ── Title ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#34483F]/10 border border-[#34483F]/20 rounded-full px-4 py-1.5 text-[#34483F] text-xs font-bold uppercase tracking-widest mb-5">
            <Sparkles size={12} /> Choose Your Plan
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#202522] mb-4 tracking-tight">
            Power Your Gym with <span className="text-[#34483F]">AI GYM</span>
          </h1>
          <p className="text-[#4A514D] max-w-2xl mx-auto text-lg mb-8">
            Your gym registration is approved! Select a subscription plan to access the Gym Dashboard and start managing your gym with AI.
          </p>

          {/* ── Billing Toggle ── */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#202522]' : 'text-[#A8ADA9]'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              aria-pressed={isAnnual}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#34483F] focus:ring-offset-2 ${isAnnual ? 'bg-[#34483F]' : 'bg-[#CBD5E1]'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#202522]' : 'text-[#A8ADA9]'}`}>Annual</span>
              {isAnnual ? (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full font-bold">
                  <Gift size={11} /> 2 months FREE — Save up to 25%
                </span>
              ) : (
                <span className="text-xs bg-white text-[#8FA89B] border border-[#DCD9CD] px-3 py-1 rounded-full">
                  Switch to annual & save 25%
                </span>
              )}
            </div>
          </div>

          {isAnnual && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-5 py-2.5 text-sm text-green-700 font-medium">
              <CheckCircle size={15} className="text-green-600 shrink-0" />
              Annual billing: prices shown per month, total charged once a year.
            </div>
          )}
        </div>

        {/* ── Plan Cards ── */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-10">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.key;
            const price = getPrice(plan);
            const Icon = plan.icon;

            return (
              <div
                key={plan.key}
                onClick={() => setSelectedPlan(isSelected ? null : plan.key)}
                className={`relative flex flex-col bg-white rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden
                  ${isSelected
                    ? `${plan.borderSelected} shadow-xl -translate-y-2`
                    : `${plan.borderDefault} hover:-translate-y-1 hover:shadow-lg`
                  }`}
              >
                {/* Top accent bar when selected */}
                {isSelected && (
                  <div className={`h-1.5 w-full ${plan.accentBar}`} />
                )}

                {/* Popular badge */}
                {plan.popular && !isSelected && (
                  <div className="bg-[#34483F] text-white text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest">
                    ⭐ Most Popular
                  </div>
                )}
                {plan.popular && isSelected && (
                  <div className="bg-[#34483F] text-white text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest">
                    ⭐ Most Popular
                  </div>
                )}

                {/* Selected check badge */}
                {isSelected && (
                  <div className={`absolute top-3 right-3 flex items-center gap-1 ${plan.accentBar} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                    <CheckCircle size={10} /> Selected
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Plan header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${plan.iconBg} rounded-xl flex items-center justify-center`}>
                        <Icon size={20} className={plan.iconColor} />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#202522] text-sm">{plan.name}</h3>
                        <span className="text-[10px] text-[#4A514D] font-medium">{plan.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black tracking-tight ${plan.priceColor}`}>{price.main}</span>
                      <span className="text-[#4A514D] text-sm font-medium">{price.period}</span>
                    </div>
                    {price.sub && (
                      <p className="text-[#4A514D] text-xs mt-0.5">{price.sub}</p>
                    )}
                    {isAnnual && !plan.trial && plan.savingsAnnual && (
                      <p className="text-green-600 text-xs mt-1 font-bold">
                        💰 Save ₹{plan.savingsAnnual.toLocaleString('en-IN')} vs monthly
                      </p>
                    )}
                    {!isAnnual && !plan.trial && (
                      <p className="text-[#A8ADA9] text-xs mt-1">
                        or ₹{plan.priceAnnualPerMonth?.toLocaleString('en-IN')}/mo billed annually
                      </p>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="bg-[#F2EFE8] rounded-xl px-3 py-2 mb-4 border border-[#DCD9CD]">
                    <p className="text-[10px] text-[#4A514D] font-bold uppercase tracking-widest mb-0.5">Platform Limits</p>
                    <p className="text-xs text-[#202522] font-medium">{plan.limits}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#202522]">
                        <CheckCircle size={13} className={`shrink-0 mt-0.5 ${plan.checkColor}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.locked.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#CBD5E1]">
                        <XCircle size={13} className="shrink-0 mt-0.5 text-[#E8E5DA]" />
                        <span className="line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Annual bonus for annual mode */}
                  {isAnnual && !plan.trial && (
                    <div className="mb-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Gift size={9} /> Annual Bonus
                      </p>
                      <p className="text-xs text-green-700">2 months FREE included</p>
                    </div>
                  )}

                  {/* Select indicator */}
                  <div className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all border-2 ${
                    isSelected
                      ? `${plan.accentBar} text-white border-transparent`
                      : `bg-white border-[#DCD9CD] text-[#4A514D] hover:border-[#34483F] hover:text-[#34483F]`
                  }`}>
                    {isSelected ? `✓ ${plan.ctaText} Selected` : plan.ctaText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Continue Button ── */}
        <div className="flex flex-col items-center gap-3">
          <button
            disabled={!selectedPlan || isLoading}
            onClick={handleSelectPlan}
            className={`px-14 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 transition-all duration-200 shadow-lg ${
              !selectedPlan || isLoading
                ? 'bg-[#E8E5DA] text-[#A8ADA9] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#34483F] to-[#8FA89B] text-white hover:from-[#C6A77D] hover:to-[#0F766E] hover:-translate-y-0.5 shadow-green-200'
            }`}
          >
            {isLoading ? (
              <>
                <Activity className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue to Payment</span>
                <ChevronRight size={20} />
              </>
            )}
          </button>
          {!selectedPlan && (
            <p className="text-[#A8ADA9] text-sm">Select a plan above to continue</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default GymOwnerSubscriptionPage;
