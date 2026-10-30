import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Activity, CheckCircle, XCircle, ChevronRight, Crown, Star,
  Sparkles, Zap, LogOut, Gift, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

export const plans = [
  {
    key: 'FREE_TRIAL',
    name: 'Free Trial',
    badge: '1 DAY',
    icon: Zap,
    iconBg: 'bg-[#F3E8E8]',
    iconColor: 'text-[#B76E79]',
    borderDefault: 'border-[#E7DADD] border-dashed',
    borderSelected: 'border-[#B76E79]',
    accentBar: 'bg-[#B76E79]',
    priceColor: 'text-[#FFFFFF]',
    checkColor: 'text-[#B76E79]',
    trial: true,
    priceMonthly: 0,
    priceAnnual: 0,
    priceAnnualPerMonth: 0,
    limits: '10 members • 1 trainer • 1 branch',
    features: [
      'Basic Gym Profile',
      'Basic Member Management',
      'Basic Attendance',
      'Basic AI Fitness Assessment',
      '1 AI Workout Plan',
      'Basic Diet Recommendation',
      'Limited AI Chat',
      'Basic Progress Tracking',
    ],
    locked: ['Advanced Analytics', 'Trainer Booking', '1-on-1 Coaching'],
    ctaText: 'Start Free Trial',
  },
  {
    key: 'SILVER',
    name: 'Silver',
    badge: 'BEGINNER',
    icon: Star,
    iconBg: 'bg-[#F3E8E8]',
    iconColor: 'text-[#57534E]',
    borderDefault: 'border-[#E7DADD]',
    borderSelected: 'border-[#B76E79]',
    accentBar: 'bg-[#B76E79]',
    priceColor: 'text-[#FFFFFF]',
    checkColor: 'text-[#B76E79]',
    trial: false,
    priceMonthly: 799,
    priceAnnual: 7190,
    priceAnnualPerMonth: 599,
    savingsAnnual: 1598,
    limits: '100 members • 5 trainers • 1 branch',
    features: [
      'Gym Profile Management',
      'Member Management',
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
    badge: 'MOST POPULAR',
    icon: Crown,
    iconBg: 'bg-[#F3E8E8]',
    iconColor: 'text-[#B76E79]',
    borderDefault: 'border-[#B76E79]/50 border-2',
    borderSelected: 'border-[#B76E79]',
    accentBar: 'bg-[#B76E79]',
    priceColor: 'text-[#FFFFFF]',
    checkColor: 'text-[#B76E79]',
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
    badge: 'ADVANCED',
    icon: Sparkles,
    iconBg: 'bg-[#F3E8E8]',
    iconColor: 'text-[#B76E79]',
    borderDefault: 'border-[#E7DADD]',
    borderSelected: 'border-[#B76E79]',
    accentBar: 'bg-[#B76E79]',
    priceColor: 'text-[#FFFFFF]',
    checkColor: 'text-[#B76E79]',
    popular: false,
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
      'Priority Support & Monthly Review',
    ],
    locked: [],
    ctaText: 'Choose Premium',
  },
];

const GymOwnerSubscriptionPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
      const billingCycle = isAnnual ? 'annual' : 'monthly';
      const response = await api.post('/subscriptions/select', { plan: selectedPlan, billingCycle });
      const { subscription } = response.data;
      navigate('/gym-owner/payment', { state: { subscription } });
    } catch (error: any) {
      console.error('Error selecting plan:', error);
      alert(error.response?.data?.message || 'Failed to select plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3E8E8] flex flex-col px-4 py-12">
      {/* Subtle top gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(183,110,121,0.07)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-12">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-[#B76E79] to-[#9F5965] rounded-xl flex items-center justify-center shadow-lg shadow-[#B76E79]/15">
              <Activity className="text-white" size={22} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#B76E79]">Gymora</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-[#57534E] text-sm">Welcome, <strong className="text-[#292524]">{user?.firstName}</strong></span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-[#57534E] hover:text-[#B76E79] transition-colors text-sm bg-[#FFFFFF] px-4 py-2 rounded-lg border border-[#E7DADD] hover:border-[#B76E79]"
            >
              <LogOut size={16} /><span>Sign out</span>
            </button>
          </div>
        </div>

        {/* ── Subscription Completed Alert Banner ── */}
        {(user?.subscriptionStatus?.toUpperCase() === 'EXPIRED' || (user?.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) || (location.state as any)?.message) && (
          <div className="mb-8 p-5 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between text-red-900 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle className="text-red-600" size={26} />
              </div>
              <div>
                <p className="font-bold text-lg text-red-950">Your subscription plan is completed</p>
                <p className="text-sm text-red-700 font-medium">Please upgrade your plan below to continue accessing your Gym Dashboard and services.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Title ── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#B76E79]/10 border border-[#B76E79]/20 rounded-full px-4 py-1.5 text-[#B76E79] text-xs font-bold uppercase tracking-widest mb-5">
            <Sparkles size={12} /> Choose Your Plan
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-[#292524] mb-4 tracking-tight">
            Power Your Gym with <span className="text-[#B76E79]">Gymora</span>
          </h1>
          <p className="text-[#57534E] max-w-2xl mx-auto text-lg mb-8">
            Your gym registration is approved! Select a subscription plan to access the Gym Dashboard and start managing your gym with AI.
          </p>

          {/* ── Billing Toggle ── */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#292524]' : 'text-[#57534E]'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              aria-pressed={isAnnual}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#B76E79] focus:ring-offset-2 ${isAnnual ? 'bg-[#B76E79]' : 'bg-[#E7DADD]'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-[#FFFFFF] shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#292524]' : 'text-[#57534E]'}`}>Annual</span>
              {isAnnual ? (
                <span className="inline-flex items-center gap-1 bg-[#F3E8E8]/10 text-[#B76E79] border border-green-200 text-xs px-3 py-1 rounded-full font-bold">
                  <Gift size={11} /> 2 months FREE — Save up to 25%
                </span>
              ) : (
                <span className="text-xs bg-[#FFFFFF] text-[#F3E8E8] border border-[#E7DADD] px-3 py-1 rounded-full">
                  Switch to annual & save 25%
                </span>
              )}
            </div>
          </div>

          {isAnnual && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-5 py-2.5 text-sm text-green-700 font-medium">
              <CheckCircle size={15} className="text-[#B76E79] shrink-0" />
              Annual billing: prices shown per month, total charged once a year.
            </div>
          )}
        </div>

        {/* ── Plan Cards ── */}
        <div className="grid lg:grid-cols-3 md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.key;
            const price = getPrice(plan);
            const Icon = plan.icon;

            return (
              <div
                key={plan.key}
                onClick={() => setSelectedPlan(isSelected ? null : plan.key)}
                className={`relative flex flex-col bg-[#FFFFFF] rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden
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
                  <div className="bg-[#FFFFFF] text-white text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest">
                    ⭐ Most Popular
                  </div>
                )}
                {plan.popular && isSelected && (
                  <div className="bg-[#FFFFFF] text-white text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest">
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
                        <h3 className="font-bold text-[#292524] text-sm">{plan.name}</h3>
                        <span className="text-[10px] text-[#57534E] font-medium">{plan.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black tracking-tight ${plan.priceColor}`}>{price.main}</span>
                      <span className="text-[#57534E] text-sm font-medium">{price.period}</span>
                    </div>
                    {price.sub && (
                      <p className="text-[#57534E] text-xs mt-0.5">{price.sub}</p>
                    )}
                    {isAnnual && !plan.trial && plan.savingsAnnual && (
                      <p className="text-[#B76E79] text-xs mt-1 font-bold">
                        💰 Save ₹{plan.savingsAnnual.toLocaleString('en-IN')} vs monthly
                      </p>
                    )}
                    {!isAnnual && !plan.trial && (
                      <p className="text-[#57534E] text-xs mt-1">
                        or ₹{plan.priceAnnualPerMonth?.toLocaleString('en-IN')}/mo billed annually
                      </p>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="bg-[#F3E8E8] rounded-xl px-3 py-2 mb-4 border border-[#E7DADD]">
                    <p className="text-[10px] text-[#57534E] font-bold uppercase tracking-widest mb-0.5">Platform Limits</p>
                    <p className="text-xs text-[#292524] font-medium">{plan.limits}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#292524]">
                        <CheckCircle size={13} className={`shrink-0 mt-0.5 ${plan.checkColor}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.locked.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#E7DADD]">
                        <XCircle size={13} className="shrink-0 mt-0.5 text-[#F3E8E8]" />
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
                      : `bg-[#FFFFFF] border-[#E7DADD] text-[#57534E] hover:border-[#B76E79] hover:text-[#B76E79]`
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
                ? 'bg-[#F3E8E8] text-[#57534E] cursor-not-allowed'
                : 'bg-gradient-to-r from-[#B76E79] to-[#9F5965] text-white hover:from-[#9F5965] hover:to-[#9F5965] hover:-translate-y-0.5 shadow-[#B76E79]/15'
            }`}
          >
            {isLoading ? (
              <>
                <Activity className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : selectedPlan === 'FREE_TRIAL' ? (
              <>
                <span>Start 1-Day Free Trial</span>
                <ChevronRight size={20} />
              </>
            ) : (
              <>
                <span>Continue to Payment</span>
                <ChevronRight size={20} />
              </>
            )}
          </button>
          {!selectedPlan && (
            <p className="text-[#57534E] text-sm">Select a plan above to continue</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default GymOwnerSubscriptionPage;
