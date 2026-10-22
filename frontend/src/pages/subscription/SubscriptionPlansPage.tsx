import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, CheckCircle, XCircle, Loader2, LogOut, Zap, Crown, Star, Sparkles,
  Lock, Gift, AlertCircle, QrCode, Landmark, CreditCard, Copy, Check,
  ShieldCheck, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const SAAS_PLANS = [
  {
    key: 'FREE_TRIAL',
    name: 'Free Trial',
    tagline: 'Try Gymora risk-free',
    badge: '1 DAY',
    icon: Zap,
    iconColor: 'text-[#D8EAE7]',
    iconBg: 'bg-[#E8EFF0]',
    borderColor: 'border-[#D9E2E3]',
    priceMonthly: 0,
    priceAnnual: 0,
    priceAnnualPerMonth: 0,
    savingsAnnual: 0,
    platformLimits: '10 members • 1 trainer • 1 branch',
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
    ctaStyle: 'bg-[#167D78] text-white hover:bg-[#116660] shadow-sm',
    trial: true,
    popular: false,
  },
  {
    key: 'SILVER',
    name: 'Silver',
    tagline: 'Beginner package for growing gyms',
    badge: 'BEGINNER',
    icon: Star,
    iconColor: 'text-[#344B4A]',
    iconBg: 'bg-[#D8EAE7]',
    borderColor: 'border-[#D9E2E3]',
    priceMonthly: 799,
    priceAnnual: 7190,
    priceAnnualPerMonth: 599,
    savingsAnnual: 1598,
    platformLimits: '100 members • 5 trainers • 1 branch',
    limits: { members: 100, trainers: 5, staff: 2, branches: 1 },
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
    annualBonuses: ['Save 25% with annual billing'],
    ctaText: 'Choose Silver',
    ctaStyle: 'bg-[#167D78] text-white hover:bg-[#116660] shadow-sm',
    trial: false,
    popular: false,
  },
  {
    key: 'GOLD',
    name: 'Gold',
    tagline: 'Most popular all-in-one powerhouse',
    badge: 'MOST POPULAR',
    icon: Crown,
    iconColor: 'text-[#344B4A]',
    iconBg: 'bg-[#D8EAE7]',
    borderColor: 'border-[#167D78]',
    priceMonthly: 1499,
    priceAnnual: 13490,
    priceAnnualPerMonth: 1124,
    savingsAnnual: 4498,
    platformLimits: '500 members • 15 trainers • 2 branches',
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
    annualBonuses: ['Save ₹4,498 with annual billing'],
    ctaText: 'Choose Gold',
    ctaStyle: 'bg-[#167D78] text-white hover:bg-[#116660] shadow-sm',
    trial: false,
    popular: true,
  },
  {
    key: 'PREMIUM',
    name: 'Premium',
    tagline: 'Enterprise-grade multi-branch scale',
    badge: 'ADVANCED',
    icon: Sparkles,
    iconColor: 'text-[#344B4A]',
    iconBg: 'bg-[#D8EAE7]',
    borderColor: 'border-[#D9E2E3]',
    priceMonthly: 2499,
    priceAnnual: 22490,
    priceAnnualPerMonth: 1874,
    savingsAnnual: 7498,
    platformLimits: 'Unlimited members & trainers • 5 branches',
    limits: { members: -1, trainers: -1, staff: -1, branches: 5 },
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
    annualBonuses: ['Save ₹7,498 with annual billing'],
    ctaText: 'Choose Premium',
    ctaStyle: 'bg-[#167D78] text-white hover:bg-[#116660] shadow-sm',
    trial: false,
    popular: false,
  },
];

const SubscriptionPlansPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUser } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState<string | null>(null);

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'gpay' | 'phonepe' | 'paytm' | 'manual' | 'card'>('qr');
  const [utrNumber, setUtrNumber] = useState('');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getBillingBreakdown = (plan: typeof SAAS_PLANS[0]) => {
    if (plan.trial) {
      return {
        base: 0,
        gst: 0,
        total: 0,
        period: '/ 1 day',
        baseFormatted: '₹0',
        gstFormatted: '₹0',
        totalFormatted: '₹0',
      };
    }
    const base = isAnnual ? (plan.priceAnnual || 0) : (plan.priceMonthly || 0);
    const gst = Math.round(base * 0.18); // 18% GST
    const total = base + gst;
    const period = isAnnual ? '/year' : '/month';

    return {
      base,
      gst,
      total,
      period,
      baseFormatted: `₹${base.toLocaleString('en-IN')}`,
      gstFormatted: `₹${gst.toLocaleString('en-IN')}`,
      totalFormatted: `₹${total.toLocaleString('en-IN')}`,
    };
  };

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

  const selectedPlan = SAAS_PLANS.find(p => p.key === paymentStep);

  const handlePayment = async () => {
    if (!paymentStep || !selectedPlan) return;
    setLoading(paymentStep);
    const breakdown = getBillingBreakdown(selectedPlan);

    const methodLabels: Record<string, string> = {
      qr: 'QR Code Scanner (UPI)',
      gpay: 'Google Pay',
      phonepe: 'PhonePe',
      paytm: 'Paytm UPI',
      manual: 'Manual Bank Transfer',
      card: 'Credit / Debit Card',
    };
    const paymentMethodLabel = methodLabels[paymentMethod] || 'Online Payment';

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const res = await api.post('/subscriptions/select', {
        plan: paymentStep,
        billingCycle: isAnnual ? 'annual' : 'monthly',
      });
      const subscription = res.data?.subscription;
      if (subscription?.id) {
        await api.post('/subscriptions/process-payment', {
          subscriptionId: subscription.id,
          paymentMethod: paymentMethodLabel,
          transactionId: utrNumber || (upiIdInput ? `upi_${upiIdInput}` : undefined),
        });
      }
      updateUser({ subscriptionStatus: 'ACTIVE', subscriptionPlan: paymentStep, approvalStatus: 'APPROVED' });
      alert(`Payment of ${breakdown.totalFormatted} via ${paymentMethodLabel} successful! Welcome to your Gym Dashboard.`);
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

  return (
    <div className="min-h-screen bg-[#E8EFF0] text-[#344B4A] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#167D78] to-[#116660] rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/10">
              <Activity className="text-white" size={22} />
            </div>
            <span className="text-2xl font-bold text-[#167D78]">Gymora</span>
          </div>

          {(user?.subscriptionStatus?.toUpperCase() === 'EXPIRED' || (user?.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) || (location.state as any)?.message) && (
            <div className="mb-8 p-5 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between text-red-900 shadow-md max-w-3xl mx-auto text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                  <AlertCircle className="text-red-600" size={26} />
                </div>
                <div>
                  <p className="font-bold text-lg text-red-950">Your subscription plan is completed</p>
                  <p className="text-sm text-red-700 font-medium">Please upgrade your plan below to continue accessing Gymora platform services.</p>
                </div>
              </div>
            </div>
          )}

          <div className="inline-flex items-center space-x-2 bg-[#167D78]/10 border border-[#167D78]/30 rounded-full px-4 py-1.5 text-[#167D78] text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={12} />
            <span>SaaS Platform Subscriptions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-[#344B4A]">
            Power Your Gym with <span className="text-[#167D78]">Gymora</span>
          </h1>
          <p className="text-[#697778] text-lg mb-3 max-w-2xl mx-auto">
            Choose a plan that fits your gym's size and ambitions. All plans include our core AI management platform.
          </p>
          <p className="text-xs text-[#697778] mb-10">These are SaaS subscriptions for gym owners, not individual member plans.</p>

          {error && (
            <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2 text-sm mb-6">
              <span>{error}</span>
            </div>
          )}

          {/* ─── Billing Toggle ─── */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#344B4A]' : 'text-[#697778]'}`}>
              Monthly
            </span>

            {/* Toggle pill */}
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              aria-pressed={isAnnual}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#167D78] focus:ring-offset-2 ${isAnnual ? 'bg-[#167D78]' : 'bg-[#D9E2E3]'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>

            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#344B4A]' : 'text-[#697778]'}`}>
                Annual
              </span>
              {isAnnual ? (
                <span className="inline-flex items-center gap-1 bg-[#D8EAE7]/10 text-[#167D78] border border-green-200 text-xs px-3 py-1 rounded-full font-bold">
                  <Gift size={11} /> Save up to 25% — 2 months FREE!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-[#E8EFF0] text-[#D8EAE7] border border-[#D9E2E3] text-xs px-3 py-1 rounded-full font-medium">
                  Switch to annual & save up to 25%
                </span>
              )}
            </div>
          </div>

          {/* Annual savings reminder bar */}
          {isAnnual && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-6 py-3 text-sm text-green-700 font-medium">
              <CheckCircle size={16} className="text-[#167D78] shrink-0" />
              Annual billing: pay once, save big. Prices shown are per month, billed yearly.
            </div>
          )}
        </div>

        {/* ─── Payment Modal ─── */}
        {paymentStep && selectedPlan && (() => {
          const breakdown = getBillingBreakdown(selectedPlan);

          return (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 overflow-y-auto"
              onClick={(e) => {
                if (e.target === e.currentTarget) setPaymentStep(null);
              }}
            >
              <div
                className="relative bg-white border border-[#D9E2E3] rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="px-5 sm:px-6 py-4 border-b border-[#D9E2E3] flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${selectedPlan.iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
                      <selectedPlan.icon size={20} className={selectedPlan.iconColor} />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-[#344B4A] leading-tight">Complete Your Purchase</h2>
                      <p className="text-xs text-[#697778]">
                        Subscribing to <span className="font-semibold text-[#344B4A]">{selectedPlan.name} Plan</span> ({isAnnual ? 'Annual' : 'Monthly'})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentStep(null)}
                    className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
                    aria-label="Close payment modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="overflow-y-auto px-5 sm:px-6 py-4 space-y-4 flex-1">
                  {/* Order & GST Breakdown */}
                  <div className="bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl p-4 space-y-2 text-sm shadow-sm">
                    <div className="flex justify-between items-center text-xs text-[#697778]">
                      <span>Selected Plan</span>
                      <span className="text-[#344B4A] font-semibold">{selectedPlan.name} ({isAnnual ? 'Annual' : 'Monthly'})</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-[#697778]">
                      <span>Base Plan Price</span>
                      <span className="text-[#344B4A] font-semibold">{breakdown.baseFormatted}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-[#697778]">
                      <span className="flex items-center gap-1.5">
                        GST (18%)
                        <span className="text-[10px] bg-orange-100 text-[#167D78] font-bold px-1.5 py-0.2 rounded">Tax</span>
                      </span>
                      <span className="text-[#344B4A] font-semibold">+{breakdown.gstFormatted}</span>
                    </div>
                    {isAnnual && (
                      <div className="flex justify-between items-center text-xs text-[#697778]">
                        <span>Effective Monthly</span>
                        <span className="text-[#344B4A] font-medium">₹{selectedPlan.priceAnnualPerMonth?.toLocaleString('en-IN')}/mo</span>
                      </div>
                    )}
                    <div className="border-t border-[#D9E2E3] pt-2 flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-[#344B4A] text-sm">Total Due Today</span>
                        <span className="block text-[10px] text-[#697778]">(Base + 18% GST included)</span>
                      </div>
                      <span className="text-xl font-black text-[#167D78]">
                        {breakdown.totalFormatted}
                        <span className="text-xs font-medium text-[#697778] ml-1">{breakdown.period}</span>
                      </span>
                    </div>
                    {isAnnual && selectedPlan.savingsAnnual && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center text-[11px] font-bold text-green-700">
                        🎉 You save ₹{selectedPlan.savingsAnnual.toLocaleString('en-IN')} with annual billing!
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#344B4A] uppercase tracking-wider mb-2">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {/* QR Scanner */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('qr')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                          paymentMethod === 'qr'
                            ? 'border-[#167D78] bg-orange-50 text-[#116660] shadow-sm ring-2 ring-orange-200'
                            : 'border-[#D9E2E3] bg-white text-[#344B4A] hover:border-orange-200 hover:bg-stone-50'
                        }`}
                      >
                        <QrCode size={18} className={paymentMethod === 'qr' ? 'text-[#167D78]' : 'text-stone-500'} />
                        <span className="text-[11px]">QR Scanner</span>
                      </button>

                      {/* Google Pay */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('gpay')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                          paymentMethod === 'gpay'
                            ? 'border-[#167D78] bg-orange-50 text-[#116660] shadow-sm ring-2 ring-orange-200'
                            : 'border-[#D9E2E3] bg-white text-[#344B4A] hover:border-orange-200 hover:bg-stone-50'
                        }`}
                      >
                        <span className="w-5 h-5 flex items-center justify-center font-black text-xs text-[#167D78] bg-blue-50 rounded-full border border-blue-200">G</span>
                        <span className="text-[11px]">Google Pay</span>
                      </button>

                      {/* PhonePe */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('phonepe')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                          paymentMethod === 'phonepe'
                            ? 'border-[#167D78] bg-orange-50 text-[#116660] shadow-sm ring-2 ring-orange-200'
                            : 'border-[#D9E2E3] bg-white text-[#344B4A] hover:border-orange-200 hover:bg-stone-50'
                        }`}
                      >
                        <span className="w-5 h-5 flex items-center justify-center font-black text-xs text-[#167D78] bg-[#E8EFF0] rounded-full border border-[#D9E2E3]">पे</span>
                        <span className="text-[11px]">PhonePe</span>
                      </button>

                      {/* Paytm */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paytm')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                          paymentMethod === 'paytm'
                            ? 'border-[#167D78] bg-orange-50 text-[#116660] shadow-sm ring-2 ring-orange-200'
                            : 'border-[#D9E2E3] bg-white text-[#344B4A] hover:border-orange-200 hover:bg-stone-50'
                        }`}
                      >
                        <span className="w-5 h-5 flex items-center justify-center font-black text-[10px] text-sky-600 bg-sky-50 rounded border border-sky-200">tm</span>
                        <span className="text-[11px]">Paytm</span>
                      </button>

                      {/* Manual Bank */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('manual')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                          paymentMethod === 'manual'
                            ? 'border-[#167D78] bg-orange-50 text-[#116660] shadow-sm ring-2 ring-orange-200'
                            : 'border-[#D9E2E3] bg-white text-[#344B4A] hover:border-orange-200 hover:bg-stone-50'
                        }`}
                      >
                        <Landmark size={18} className={paymentMethod === 'manual' ? 'text-[#167D78]' : 'text-stone-500'} />
                        <span className="text-[11px]">Manual Bank</span>
                      </button>

                      {/* Debit / Credit Card */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all text-xs font-semibold ${
                          paymentMethod === 'card'
                            ? 'border-[#167D78] bg-orange-50 text-[#116660] shadow-sm ring-2 ring-orange-200'
                            : 'border-[#D9E2E3] bg-white text-[#344B4A] hover:border-orange-200 hover:bg-stone-50'
                        }`}
                      >
                        <CreditCard size={18} className={paymentMethod === 'card' ? 'text-[#167D78]' : 'text-stone-500'} />
                        <span className="text-[11px]">Card / Debit</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Method Content */}
                  {paymentMethod === 'qr' && (
                    <div className="bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
                      <div className="bg-white p-3 rounded-2xl border-2 border-orange-500 shadow-md">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                            `upi://pay?pa=aigym@icici&pn=AI%20GYM%20Technologies&am=${breakdown.total}&cu=INR&tn=AI%20GYM%20${selectedPlan.name}%20Subscription`
                          )}`}
                          alt="UPI Payment QR Code"
                          className="w-32 h-32 sm:w-36 sm:h-36 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#344B4A]">Scan with GPay, PhonePe, Paytm, or BHIM</p>
                        <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 px-3 py-1 rounded-lg text-xs font-mono text-stone-700">
                          <span>UPI: <strong>aigym@icici</strong></span>
                          <button
                            type="button"
                            onClick={() => handleCopy('aigym@icici', 'upi')}
                            className="text-[#167D78] hover:text-[#167D78] flex items-center gap-1 font-sans font-bold ml-1"
                          >
                            {copiedText === 'upi' ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                            <span>{copiedText === 'upi' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                      <div className="w-full text-left pt-2 border-t border-[#D9E2E3]">
                        <label className="block text-xs font-medium text-[#697778] mb-1">
                          UPI Reference / UTR Number (Optional verification)
                        </label>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                          placeholder="e.g. 428710982341"
                          className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-[#167D78]"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'gpay' && (
                    <div className="bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#344B4A]">
                        <span className="w-6 h-6 rounded-full bg-blue-50 text-[#167D78] flex items-center justify-center font-black text-xs border border-blue-200">G</span>
                        <span>Google Pay Instant Checkout</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#697778] mb-1">Google Pay UPI ID or Mobile Number</label>
                        <input
                          type="text"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          placeholder="e.g. mobile@okhdfcbank or 9876543210"
                          className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#167D78]"
                        />
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-[11px] text-blue-800 leading-relaxed">
                        📲 Payment authorization request for <strong>{breakdown.totalFormatted}</strong> will be sent to your Google Pay app.
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'phonepe' && (
                    <div className="bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#344B4A]">
                        <span className="w-6 h-6 rounded-full bg-[#E8EFF0] text-[#167D78] flex items-center justify-center font-black text-xs border border-[#D9E2E3]">पे</span>
                        <span>PhonePe Instant Checkout</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#697778] mb-1">PhonePe UPI ID or Registered Number</label>
                        <input
                          type="text"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          placeholder="e.g. mobile@ybl or 9876543210"
                          className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#167D78]"
                        />
                      </div>
                      <div className="bg-[#E8EFF0] border border-[#D9E2E3] rounded-xl p-2.5 text-[11px] text-[#116660] leading-relaxed">
                        📲 Open PhonePe to verify and pay <strong>{breakdown.totalFormatted}</strong> via your UPI PIN.
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'paytm' && (
                    <div className="bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#344B4A]">
                        <span className="w-6 h-6 rounded bg-sky-50 text-sky-600 flex items-center justify-center font-black text-xs border border-sky-200">tm</span>
                        <span>Paytm UPI & Wallet</span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#697778] mb-1">Paytm UPI ID or Mobile Number</label>
                        <input
                          type="text"
                          value={upiIdInput}
                          onChange={(e) => setUpiIdInput(e.target.value)}
                          placeholder="e.g. mobile@paytm or 9876543210"
                          className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-[#167D78]"
                        />
                      </div>
                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 text-[11px] text-sky-800 leading-relaxed">
                        📲 Complete payment in your Paytm App or using linked bank account.
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'manual' && (
                    <div className="bg-[#E8EFF0] border border-[#D9E2E3] rounded-2xl p-4 space-y-3.5 text-xs">
                      <div className="flex items-center justify-between border-b border-[#D9E2E3] pb-2">
                        <div className="flex items-center gap-2 font-bold text-[#344B4A]">
                          <Landmark size={16} className="text-[#167D78]" />
                          <span>Manual Bank Transfer Details</span>
                        </div>
                        <span className="text-[10px] bg-orange-100 text-[#167D78] font-bold px-2 py-0.5 rounded-full">
                          Fill Manually
                        </span>
                      </div>

                      {/* Bank Name */}
                      <div>
                        <label className="block text-xs font-medium text-[#697778] mb-1">Bank Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="e.g. State Bank of India, HDFC Bank"
                            className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2 pl-9 text-xs outline-none focus:border-[#167D78] transition-colors"
                          />
                          <Landmark className="absolute left-3 top-2.5 text-stone-400" size={14} />
                        </div>
                      </div>

                      {/* Account Number */}
                      <div>
                        <label className="block text-xs font-medium text-[#697778] mb-1">Account Number</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 18))}
                          placeholder="Enter 9–18 digit account number"
                          maxLength={18}
                          className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2 text-xs font-mono tracking-wider outline-none focus:border-[#167D78] transition-colors"
                        />
                      </div>

                      {/* IFSC Code and Branch Name */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#697778] mb-1">IFSC Code</label>
                          <input
                            type="text"
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 11))}
                            placeholder="e.g. SBIN0001234"
                            maxLength={11}
                            className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2 text-xs uppercase font-mono tracking-wider outline-none focus:border-[#167D78] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#697778] mb-1">Branch Name</label>
                          <input
                            type="text"
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                            placeholder="e.g. MG Road Branch"
                            className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#167D78] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Transaction Ref / UTR / Cheque Number */}
                      <div>
                        <label className="block text-xs font-medium text-[#697778] mb-1">Transaction Ref / UTR / Cheque Number</label>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="e.g. IMPS/NEFT UTR reference number"
                          className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-[#167D78] transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-[#697778] mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                          placeholder="4532 •••• •••• 8921"
                          className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-[#167D78]"
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-[#697778] mb-1">Expiry Date</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                            placeholder="MM / YY"
                            className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-[#167D78]"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#697778] mb-1">CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-[#167D78]"
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#697778] mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name as printed on card"
                          className="w-full bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#167D78]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer (Sticky Bottom) */}
                <div className="px-5 sm:px-6 py-3.5 border-t border-[#D9E2E3] bg-[#E8EFF0] shrink-0 space-y-2">
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setPaymentStep(null)}
                      className="flex-1 py-2.5 bg-white border border-[#D9E2E3] text-[#344B4A] rounded-xl font-bold hover:bg-stone-50 transition-colors text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={loading !== null}
                      className="flex-1 py-2.5 bg-gradient-to-r from-[#167D78] to-[#116660] text-white rounded-xl font-bold hover:from-[#116660] hover:to-[#116660] transition-all disabled:opacity-60 text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-teal-900/10"
                    >
                      {loading ? (
                        <><Loader2 size={16} className="animate-spin" /><span>Processing...</span></>
                      ) : (
                        <span>Pay {breakdown.totalFormatted}</span>
                      )}
                    </button>
                  </div>
                  <p className="text-center text-[10px] text-[#697778] flex items-center justify-center gap-1">
                    <ShieldCheck size={12} className="text-green-600" /> Secured by 256-bit SSL encryption
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ─── Pricing Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {SAAS_PLANS.map((plan) => {
            const Icon = plan.icon;
            const priceDisplay = getDisplayPrice(plan);
            const isPopular = plan.popular;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden
                  ${isPopular ? `bg-white ${plan.borderColor} shadow-xl shadow-teal-900/10` : `bg-white ${plan.borderColor}`}
                  ${plan.trial ? 'opacity-90' : ''}
                `}
              >
                {/* Popular ribbon */}
                {isPopular && (
                  <div className="bg-[#344B4A] text-white text-[10px] font-extrabold text-center py-2 uppercase tracking-widest">
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
                          <h3 className="font-bold text-[#344B4A] text-base">{plan.name}</h3>
                          <p className="text-[#697778] text-xs">{plan.tagline}</p>
                        </div>
                      </div>
                      {plan.badge && (
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider ${isPopular ? 'bg-[#344B4A] text-white border-transparent shadow-xs' : 'bg-[#D8EAE7] text-[#344B4A] border-[#D9E2E3]'}`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Price block */}
                    <div className="mt-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black tracking-tight text-[#344B4A]">
                          {priceDisplay.main}
                        </span>
                        <span className="text-[#697778] text-sm font-medium">
                          {plan.trial ? '/ 1 day' : (isAnnual ? '/year' : '/mo')}
                        </span>
                      </div>

                      {/* Annual total / monthly original */}
                      {!plan.trial && (
                        <div className="mt-1 min-h-[1.5rem]">
                          {isAnnual ? (
                            <div className="space-y-0.5">
                              <p className="text-[#697778] text-xs">{priceDisplay.sub}</p>
                              <p className="text-[#167D78] text-xs font-bold">
                                💰 Save ₹{plan.savingsAnnual?.toLocaleString('en-IN')} vs monthly
                              </p>
                            </div>
                          ) : (
                            <p className="text-[#697778] text-xs">
                              or save 25% with annual
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="bg-[#E8EFF0] rounded-xl p-3 mb-5 border border-[#D9E2E3]">
                    <p className="text-[10px] uppercase tracking-widest text-[#697778] font-bold mb-1">PLATFORM LIMITS</p>
                    <p className="text-xs font-semibold text-[#344B4A]">{plan.platformLimits}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`flex items-start space-x-2 text-xs ${f.included ? 'text-[#344B4A]' : 'text-[#697778]'}`}>
                        {f.included ? (
                          <CheckCircle size={14} className={`shrink-0 mt-0.5 ${plan.key === 'PREMIUM' ? 'text-[#167D78]' : 'text-[#167D78]'}`} />
                        ) : (
                          <XCircle size={14} className="shrink-0 mt-0.5 text-[#D6D3D1]" />
                        )}
                        <span className={!f.included ? 'line-through text-[#697778]' : ''}>{f.text}</span>
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
        <div className="bg-white border border-[#D9E2E3] rounded-2xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Lock size={18} className="text-[#167D78]" />
            <h3 className="text-[#344B4A] font-bold">How Access Control Works</h3>
          </div>
          <p className="text-[#697778] text-sm max-w-2xl mx-auto">
            Your subscription plan controls what features your gym can access on the Gymora platform.
            Adding members beyond your plan's limit, accessing Advanced Analytics on Silver, or using 1-on-1 Coaching
            on Gold will show an upgrade prompt. After payment, features unlock instantly.
          </p>
        </div>

        <div className="text-center">
          <button onClick={logout} className="text-sm text-[#697778] hover:text-[#167D78] transition-colors flex items-center space-x-2 mx-auto">
            <LogOut size={16} /><span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;
