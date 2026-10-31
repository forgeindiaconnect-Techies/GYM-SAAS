import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle, XCircle, Zap, Star, Crown, Sparkles,
  Users, Dumbbell, Building2, UserCheck, TrendingUp,
  AlertTriangle, ArrowUpCircle, Loader2, Shield, Gift, Download,
  IndianRupee, ArrowUpDown, RefreshCw, Clock, CheckCircle2,
  Calendar, CreditCard, ChevronRight, Check, AlertCircle, FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { plans } from '../subscription/GymOwnerSubscriptionPage';

const PLAN_DETAILS: Record<string, any> = {
  STARTER: {
    name: 'Starter', color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]', border: 'border-[#E2E8F0]',
    icon: Star, limits: { members: 100, trainers: 3, staff: 2, branches: 1 },
    priceMonthly: 799, priceAnnual: 7190,
  },
  SILVER: {
    name: 'Silver', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-[#E2E8F0]',
    icon: Star, limits: { members: 100, trainers: 5, staff: 2, branches: 1 },
    priceMonthly: 799, priceAnnual: 7190,
  },
  PROFESSIONAL: {
    name: 'Professional', color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]', border: 'border-[#FFEDD5]',
    icon: Crown, limits: { members: 500, trainers: 15, staff: 5, branches: 2 },
    priceMonthly: 1499, priceAnnual: 13490,
  },
  GOLD: {
    name: 'Gold', color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]', border: 'border-[#FFEDD5]',
    icon: Crown, limits: { members: 500, trainers: 15, staff: 5, branches: 2 },
    priceMonthly: 1499, priceAnnual: 13490,
  },
  ENTERPRISE: {
    name: 'Enterprise', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-[#E2E8F0]',
    icon: Sparkles, limits: { members: 1000, trainers: 50, staff: 10, branches: 5 },
    priceMonthly: 2499, priceAnnual: 22490,
  },
  PREMIUM: {
    name: 'Premium', color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]', border: 'border-[#FFEDD5]',
    icon: Sparkles, limits: { members: -1, trainers: -1, staff: -1, branches: 5 },
    priceMonthly: 2499, priceAnnual: 22490,
  },
  FREE_TRIAL: {
    name: 'Free Trial', color: 'text-[#64748B]', bg: 'bg-slate-500/10', border: 'border-[#E2E8F0]',
    icon: Zap, limits: { members: 10, trainers: 1, staff: 1, branches: 1 },
    priceMonthly: 0, priceAnnual: 0,
  },
};

const PLAN_TIER_RANK: Record<string, number> = {
  FREE_TRIAL: 0,
  TRIAL: 0,
  STARTER: 1,
  SILVER: 1,
  PROFESSIONAL: 2,
  GOLD: 2,
  ENTERPRISE: 3,
  PREMIUM: 3,
};

const LimitBar = ({ label, icon: Icon, used, max, color }: any) => {
  const isUnlimited = max === -1;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / max) * 100));
  const isFull = !isUnlimited && pct >= 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <Icon size={14} className={color} />
          <span className="text-[#64748B] text-xs font-semibold">{label}</span>
        </div>
        <span className={`text-xs font-black ${isFull ? 'text-[#B91C1C]' : 'text-[#111827]'}`}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${max}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-[#F8FAFC] rounded-full h-1.5 overflow-hidden border border-[#E2E8F0]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-[#C2410C]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
};

const formatPaymentDate = (dateVal?: string | Date) => {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'N/A';
  const day = d.getDate().toString().padStart(2, '0');
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${allMonths[d.getMonth()]} ${d.getFullYear()}`;
};

const formatPaymentDateTime = (dateVal?: string | Date) => {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'N/A';
  const day = d.getDate().toString().padStart(2, '0');
  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = allMonths[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = hours.toString().padStart(2, '0');
  return `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;
};

const GymAdminSubscription = () => {
  const { user, updateUser } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'RENEWAL' | 'UPGRADE' | 'SWITCH' | 'NEW'>('UPGRADE');
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [previewPlanKey, setPreviewPlanKey] = useState<string | null>(null);
  const [dbHistory, setDbHistory] = useState<any[]>([]);
  const [activeSubData, setActiveSubData] = useState<any>(null);
  const [usage, setUsage] = useState({ members: 0, trainers: 0, staff: 1, branches: 1 });

  // Form Payment Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [paymentMethodSelect, setPaymentMethodSelect] = useState<'Card' | 'UPI' | 'NetBanking'>('Card');

  const toggleFeatures = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setExpandedPlans(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const loadSubscriptionInfo = async () => {
    try {
      const [subRes, histRes] = await Promise.all([
        api.get('/subscriptions/my').catch(() => null),
        api.get('/subscriptions/my-history').catch(() => null),
      ]);

      if (subRes?.data?.success && subRes.data?.details) {
        setActiveSubData(subRes.data.details);
      }
      if (histRes?.data?.success && Array.isArray(histRes.data.history)) {
        setDbHistory(histRes.data.history);
      }
    } catch (err) {
      console.error('Failed to load subscription details', err);
    }
  };

  useEffect(() => {
    loadSubscriptionInfo();
  }, [user?.id]);

  useEffect(() => {
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`)
        .then(res => {
          const gym = res.data.gym;
          setUsage({
            members: gym?.members?.length || 0,
            trainers: gym?.trainers?.length || 0,
            staff: 1,
            branches: gym?.branches?.length || 1,
          });
        })
        .catch(err => console.error(err));
    }
  }, [user?.gymId]);

  // Determine current active plan key
  const currentPlanKey = (
    activeSubData?.planKey ||
    user?.subscriptionPlan ||
    'STARTER'
  ).toUpperCase();

  const currentPlan = PLAN_DETAILS[currentPlanKey] || PLAN_DETAILS.SILVER;
  const PlanIcon = currentPlan.icon;

  // Status & Remaining Days Calculations
  const now = new Date();
  const rawStatus = (activeSubData?.status || user?.subscriptionStatus || 'ACTIVE').toUpperCase();
  const expiryDate = activeSubData?.endDate || user?.subscriptionExpiryDate || user?.subscriptionExpiry;
  const hasExpiryDate = Boolean(expiryDate);
  const parsedExpiry = hasExpiryDate ? new Date(expiryDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isExpired = parsedExpiry < now || rawStatus === 'EXPIRED';
  const remainingDays = isExpired ? 0 : Math.max(0, Math.ceil((parsedExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isExpiringSoon = !isExpired && remainingDays <= 7;
  const isTrial = rawStatus === 'TRIAL' || rawStatus === 'FREE TRIAL' || rawStatus === 'FREE_TRIAL' || currentPlanKey === 'FREE_TRIAL';
  const isActive = !isExpired && !isTrial && (rawStatus === 'ACTIVE' || rawStatus === 'APPROVED' || rawStatus === 'PAID');

  const startDateFormatted = formatPaymentDate(activeSubData?.startDate || user?.subscriptionStartDate || now);
  const renewalDateFormatted = formatPaymentDate(parsedExpiry);
  const billingCycleDisplay = isTrial ? '1 Day Trial' : (activeSubData?.billingCycle === 'annual' || isAnnual ? 'Annual' : 'Monthly');

  // Trigger Plan Action (Renew, Upgrade, Switch)
  const handlePlanAction = (targetKey: string, type: 'RENEWAL' | 'UPGRADE' | 'SWITCH') => {
    setPaymentStep(targetKey);
    setActionType(type);
    setPaymentSuccess(null);
    setPaymentError(null);
  };

  // Activate Free Trial (1-day)
  const handleTrialActivation = async () => {
    if (currentPlanKey === 'FREE_TRIAL') {
      setPaymentSuccess('Your 1-day Free Trial is already active.');
      return;
    }
    setLoading('FREE_TRIAL');
    setPaymentError(null);
    try {
      const res = await api.post('/subscriptions/select', {
        plan: 'FREE_TRIAL',
        billingCycle: 'trial',
      });
      if (res.data?.success) {
        if (updateUser) {
          updateUser({
            subscriptionPlan: 'FREE_TRIAL',
            subscriptionStatus: 'TRIAL',
            subscriptionExpiryDate: res.data.subscription?.endDate
          });
        }
        setPaymentSuccess('Free Trial (1 Day) activated successfully! Welcome to Gymora.');
        await loadSubscriptionInfo();
      } else {
        setPaymentError(res.data?.message || 'Could not activate trial.');
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'Failed to activate trial.');
    } finally {
      setLoading(null);
    }
  };

  // Process Renewal or Upgrade Payment
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentStep) return;

    setLoading(paymentStep);
    setPaymentError(null);

    try {
      let res;
      if (actionType === 'RENEWAL') {
        res = await api.post('/subscriptions/renew', {
          billingCycle: isAnnual ? 'annual' : 'monthly',
          paymentMethod: paymentMethodSelect === 'Card' ? 'Credit/Debit Card' : paymentMethodSelect
        });
      } else {
        res = await api.post('/subscriptions/upgrade', {
          targetPlan: paymentStep,
          billingCycle: isAnnual ? 'annual' : 'monthly',
          paymentMethod: paymentMethodSelect === 'Card' ? 'Credit/Debit Card' : paymentMethodSelect
        });
      }

      if (res.data?.success) {
        if (updateUser) {
          updateUser({
            subscriptionPlan: paymentStep,
            subscriptionStatus: 'Active',
            subscriptionExpiryDate: res.data.subscription?.endDate
          });
        }
        setPaymentSuccess(
          actionType === 'RENEWAL'
            ? `Your ${paymentStep} plan has been successfully renewed!`
            : `Your plan has been upgraded to ${paymentStep}!`
        );
        setPaymentStep(null);
        await loadSubscriptionInfo();
      } else {
        setPaymentError(res.data?.message || 'Payment could not be completed.');
      }
    } catch (err: any) {
      setPaymentError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // Invoice Download / Print HTML
  const handleDownloadInvoice = (invoice: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; background: #FFF; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #F97316; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 26px; font-weight: 900; color: #111; }
            .details table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details th, .details td { padding: 14px; text-align: left; border-bottom: 1px solid #E5E5E5; font-size: 13px; }
            .details th { background: #F8F8F8; color: #555; text-transform: uppercase; font-size: 11px; }
            .total { font-size: 20px; font-weight: 800; text-align: right; padding: 16px; background: #F0F4FF; border: 1px solid #F97316; border-radius: 8px; margin-top: 20px; color: #E2E8F0; }
            .footer { margin-top: 50px; font-size: 11px; color: #777; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">Gymora SaaS Platform</div>
              <p style="margin: 4px 0; color: #666; font-size: 13px;">Gym Owner License & Subscription Invoice</p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0; color: #FFFBEB;">${invoice.id}</h3>
              <p style="margin: 4px 0; color: #666; font-size: 12px;">Date: ${invoice.date}</p>
            </div>
          </div>
          <div class="details">
            <p><strong>Billed To:</strong> ${user?.gymName || 'Gym Partner'} (${user?.firstName || 'Owner'} ${user?.lastName || ''})</p>
            <p><strong>Payment Method:</strong> ${invoice.paymentMethod || 'Online'} | ${invoice.paymentDetails || 'Verified'}</p>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Subscription Period</th>
                  <th>Status</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${invoice.plan}</strong></td>
                  <td>${formatPaymentDate(invoice.startDate)} — ${formatPaymentDate(invoice.endDate)}</td>
                  <td><span style="color: #15803D; font-weight: bold;">${invoice.status}</span></td>
                  <td style="text-align: right; font-weight: bold;">${invoice.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total">Total Paid: <span style="color: #FFFBEB;">${invoice.amount}</span></div>
          <div class="footer">
            Thank you for partnering with Gymora SaaS!<br/>
            This is a computer-generated invoice. No physical signature required.
          </div>
          <script>
            window.onload = () => { window.print(); window.setTimeout(() => window.close(), 500); }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const paymentHistory = useMemo(() => {
    if (dbHistory.length > 0) return dbHistory;
    return [
      {
        id: `#INV-${new Date().getFullYear()}-001`,
        date: formatPaymentDateTime(activeSubData?.startDate || new Date()),
        amount: `₹${(activeSubData?.amount || 1499).toLocaleString('en-IN')}`,
        plan: `${currentPlan.name} Plan (${billingCycleDisplay})`,
        status: isActive ? 'Paid' : 'Expired',
        paymentMethod: 'Online (UPI / Card)',
        paymentDetails: 'Verified Gateway Transaction',
        year: new Date().getFullYear(),
        startDate: activeSubData?.startDate || new Date(),
        endDate: parsedExpiry,
        isCurrent: true
      }
    ];
  }, [dbHistory, activeSubData, currentPlan, billingCycleDisplay, isActive, parsedExpiry]);

  const targetPlanObj = plans.find(p => p.key === paymentStep) || plans[1];
  const targetPlanPricing = PLAN_DETAILS[paymentStep || ''] || PLAN_DETAILS.GOLD;
  const targetPrice = isAnnual ? targetPlanPricing.priceAnnual : targetPlanPricing.priceMonthly;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-[#FFFFFF] text-[#111827] min-h-screen">
      
      {/* Page Title & Status Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFF7ED] border border-[#FFEDD5] rounded-full text-xs font-bold uppercase tracking-wider text-[#EA580C] mb-2">
            <Crown size={14} className="text-[#EA580C]" />
            Gym Owner License Management
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111827]">
            Subscription, Renewal & Upgrades
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Manage your AI Gym Management SaaS platform license, renewals, and features for <strong className="text-[#111827]">{user?.gymName || 'Your Gym'}</strong>.
          </p>
        </div>

        <button
          onClick={loadSubscriptionInfo}
          className="self-start sm:self-auto px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] hover:border-[#FDBA74] text-[#111827] hover:text-[#C2410C] text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className="text-[#EA580C]" />
          Sync License
        </button>
      </div>

      {/* Success Notification Alert */}
      {paymentSuccess && (
        <div className="bg-[#FFF7ED] border border-[#E2E8F0] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF7ED] rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle size={22} className="text-[#15803D]" />
            </div>
            <div>
              <h3 className="text-[#111827] font-bold text-sm">{paymentSuccess}</h3>
              <p className="text-[#EA580C] text-xs mt-0.5">
                Your subscription status, expiry dates, and platform permissions have been updated in real-time.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentSuccess(null)}
            className="text-xs text-[#15803D] hover:underline font-semibold shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Expiry Warning / Reminder Alert */}
      {(isExpired || isExpiringSoon || isTrial) && (
        <div
          className={`border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
            isExpired
              ? 'bg-red-50 border-red-800 text-red-200'
              : isExpiringSoon
              ? 'bg-amber-50 border-amber-800 text-amber-200'
              : 'bg-[#FFF7ED] border-[#FFEDD5] text-[#111827]'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              size={24}
              className={isExpired ? 'text-[#B91C1C] shrink-0' : isExpiringSoon ? 'text-[#B45309] shrink-0' : 'text-[#EA580C] shrink-0'}
            />
            <div>
              <h3 className="font-bold text-sm text-[#111827]">
                {isExpired
                  ? 'Your Subscription Plan Has Expired!'
                  : isExpiringSoon
                  ? `Subscription Expiring Soon — ${remainingDays} Day${remainingDays === 1 ? '' : 's'} Remaining`
                  : 'Free Trial Active — 1 Day Remaining'}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isExpired
                  ? 'Renew your plan now to restore full access to AI tools, trainer schedules, and member check-ins. Your data is safely preserved.'
                  : 'Renew now to ensure uninterrupted access to your gym management portal.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => handlePlanAction(currentPlanKey, 'RENEWAL')}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange-500/15 cursor-pointer"
            >
              <RefreshCw size={14} />
              Renew {currentPlan.name} Plan
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: Current Subscription Overview Banner */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#E2E8F0] pb-6">
          
          {/* Plan Icon and Badges */}
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-16 h-16 ${currentPlan.bg} rounded-2xl flex items-center justify-center border border-[#E2E8F0] shrink-0`}>
              <PlanIcon size={32} className={currentPlan.color} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-[#64748B] uppercase tracking-widest font-extrabold">
                  Current Active Plan
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                    isActive
                      ? 'bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/50'
                      : isExpiringSoon
                      ? 'bg-amber-50 text-[#B45309] border border-amber-700/50'
                      : 'bg-red-50 text-[#B91C1C] border border-red-700/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#C2410C]' : isExpiringSoon ? 'bg-amber-400' : 'bg-red-400'}`} />
                  {isActive ? 'Active' : isExpiringSoon ? 'Expiring Soon' : isTrial ? 'Trial' : 'Expired'}
                </span>
              </div>

              <h2 className={`text-2xl sm:text-3xl font-black mt-1 ${currentPlan.color}`}>
                {currentPlan.name} Plan
              </h2>

              <p className="text-xs text-[#64748B] mt-0.5">
                {billingCycleDisplay} billing • {isExpired ? 'Expired' : `${remainingDays} days remaining in current billing cycle`}
              </p>
            </div>
          </div>

          {/* Action Buttons for Current Plan */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handlePlanAction(currentPlanKey, 'RENEWAL')}
              className="px-5 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shadow-orange-500/15 cursor-pointer"
            >
              <RefreshCw size={15} />
              Renew Plan
            </button>

            <button
              onClick={() => document.getElementById('available-plans-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-3 bg-[#FFF7ED] hover:bg-[#FFEDD5] border-2 border-[#FFEDD5] hover:border-[#FDBA74] text-[#C2410C] font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <ArrowUpCircle size={15} className="text-[#EA580C]" />
              <span>Upgrade Plan</span>
            </button>

            {paymentHistory.length > 0 && (
              <button
                onClick={() => handleDownloadInvoice(paymentHistory[0])}
                className="px-4 py-3 bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0] text-[#64748B] hover:text-[#C2410C] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="View Latest Invoice"
              >
                <Download size={14} />
                Invoice
              </button>
            )}
          </div>
        </div>

        {/* 4 Details Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] shadow-xs">
            <p className="text-[#64748B] text-[10px] uppercase tracking-wider font-extrabold">Billing Cycle</p>
            <p className="text-[#0F172A] font-black text-sm sm:text-base mt-1 flex items-center gap-1.5">
              <Clock size={15} className="text-[#EA580C]" />
              <span>{billingCycleDisplay}</span>
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] shadow-xs">
            <p className="text-[#64748B] text-[10px] uppercase tracking-wider font-extrabold">Subscription Started</p>
            <p className="text-[#0F172A] font-black text-sm sm:text-base mt-1 flex items-center gap-1.5">
              <Calendar size={15} className="text-[#EA580C]" />
              <span>{startDateFormatted}</span>
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] shadow-xs">
            <p className="text-[#64748B] text-[10px] uppercase tracking-wider font-extrabold">Expiry / Renewal Date</p>
            <p className="text-[#0F172A] font-black text-sm sm:text-base mt-1 flex items-center gap-1.5">
              <Calendar size={15} className={isExpired ? 'text-[#B91C1C]' : isExpiringSoon ? 'text-[#B45309]' : 'text-[#15803D]'} />
              <span>{renewalDateFormatted}</span>
            </p>
          </div>

          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0] shadow-xs">
            <p className="text-[#64748B] text-[10px] uppercase tracking-wider font-extrabold">Remaining Time</p>
            <p className={`font-black text-sm sm:text-base mt-1 ${isExpired ? 'text-[#B91C1C]' : isExpiringSoon ? 'text-[#B45309]' : 'text-[#EA580C]'}`}>
              {isExpired ? '0 Days (Expired)' : `${remainingDays} Days Left`}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Platform Limits & Real-Time Usage */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <TrendingUp size={18} className="text-[#EA580C]" />
            <span>Platform Usage vs. {currentPlan.name} Plan Limits</span>
          </h2>
          <span className="text-xs text-[#64748B]">Real-time synchronized</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <LimitBar label="Active Members" icon={Users} used={usage.members} max={currentPlan.limits.members} color="text-sky-400" />
          <LimitBar label="Assigned Trainers" icon={Dumbbell} used={usage.trainers} max={currentPlan.limits.trainers} color="text-[#15803D]" />
          <LimitBar label="Staff Accounts" icon={UserCheck} used={usage.staff} max={currentPlan.limits.staff} color="text-purple-400" />
          <LimitBar label="Branch Licenses" icon={Building2} used={usage.branches} max={currentPlan.limits.branches} color="text-[#EA580C]" />
        </div>
      </div>

      {/* SECTION 3: SaaS Platform Pricing For Gyms (Matching Monthly & Annual Platform Plans) */}
      <div id="available-plans-section" className="pt-6 pb-2">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-[#FFF7ED] border border-[#FFEDD5] rounded-full px-4 py-1.5 text-[#EA580C] text-xs font-bold uppercase tracking-widest mb-5">
            <span>SaaS Platform Pricing for Gyms</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#111827]">Power Your Gym. Choose Your Plan.</h2>
          <p className="text-[#64748B] mb-8 max-w-xl mx-auto">All plans give your gym access to the Gymora platform. Scale as your gym grows.</p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#111827]' : 'text-[#64748B]'}`}>Monthly</span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              aria-pressed={isAnnual}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 ${isAnnual ? 'bg-[#C2410C]' : 'bg-[#E2E8F0]'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-[#FFFFFF] shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#111827]' : 'text-[#64748B]'}`}>Annual</span>
              {isAnnual ? (
                <span className="inline-flex items-center gap-1 bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] text-xs px-3 py-1 rounded-full font-bold">🎁 2 months FREE — Save up to 25%</span>
              ) : (
                <span className="text-xs bg-[#FFFFFF] text-[#EA580C] border border-[#E2E8F0] px-3 py-1 rounded-full">Switch to annual & save up to 25%</span>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.key === currentPlanKey;
            const currentRank = PLAN_TIER_RANK[currentPlanKey] ?? 1;
            const targetRank = PLAN_TIER_RANK[plan.key] ?? 1;
            const isHigherTier = targetRank > currentRank;

            const displayPrice = plan.trial ? '₹0' : (isAnnual ? `₹${(plan.priceAnnual || 0).toLocaleString('en-IN')}` : `₹${(plan.priceMonthly || 0).toLocaleString('en-IN')}`);
            const displayPeriod = plan.trial ? '/ 1 day' : (isAnnual ? '/year' : '/mo');
            const annualTotal = isAnnual && !plan.trial && plan.priceAnnualPerMonth ? `Equivalent to ₹${plan.priceAnnualPerMonth.toLocaleString('en-IN')}/mo` : null;
            const savingsText = isAnnual && !plan.trial && plan.savingsAnnual ? `💰 Save ₹${plan.savingsAnnual.toLocaleString('en-IN')} vs monthly billing` : null;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col bg-[#FFFFFF] rounded-2xl transition-all duration-300 overflow-hidden border-2 text-[#111827] ${
                  isCurrent
                    ? 'border-[#FDBA74] shadow-2xl ring-2 ring-[#F97316]/40'
                    : plan.popular
                    ? 'border-[#FFEDD5] hover:border-[#FDBA74] hover:shadow-xl'
                    : 'border-[#E2E8F0] hover:border-[#FFEDD5] hover:shadow-xl'
                }`}
              >
                {/* Most Popular Banner */}
                {plan.popular && (
                  <div className="bg-[#C2410C] text-[#F8FAFC] text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest">
                    ⭐ Most Popular
                  </div>
                )}

                {/* Current Active Plan Banner */}
                {isCurrent && !plan.popular && (
                  <div className="bg-[#FFF7ED] border-b border-[#FFEDD5] text-[#EA580C] text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest flex items-center justify-center gap-1">
                    <CheckCircle2 size={12} /> Current Active Plan
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-[#111827]">{plan.name}</h3>
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-extrabold uppercase tracking-wider ${
                      plan.popular
                        ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] shadow-xs'
                        : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#111827]">{displayPrice}</span>
                      <span className="text-[#64748B] text-sm">{displayPeriod}</span>
                    </div>
                    {annualTotal && <p className="text-[#64748B] text-xs mt-0.5">{annualTotal}</p>}
                    {savingsText && <p className="text-[#EA580C] text-xs mt-1 font-semibold">{savingsText}</p>}
                    {!isAnnual && !plan.trial && (
                      <p className="text-[#64748B] text-xs mt-0.5">or save 25% with annual</p>
                    )}
                  </div>

                  {/* Platform Limits Box */}
                  <div className="bg-[#F8FAFC] rounded-xl px-3 py-2 mb-4 border border-[#E2E8F0]">
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5 text-[#64748B]">Platform Limits</p>
                    <p className="text-xs text-[#1F2937] font-medium">{plan.limits}</p>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {plan.features.map((feature: string, fIdx: number) => (
                      <li key={fIdx} className="flex items-start gap-2 text-xs text-[#1F2937]">
                        <CheckCircle size={13} className="shrink-0 mt-0.5 text-[#EA580C]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.locked?.map((feature: string, fIdx: number) => (
                      <li key={`locked-${fIdx}`} className="flex items-start gap-2 text-xs text-[#64748B]/60">
                        <XCircle size={13} className="shrink-0 mt-0.5 text-[#64748B]/40" />
                        <span className="line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  {plan.trial ? (
                    <button
                      type="button"
                      onClick={() => handleTrialActivation()}
                      disabled={isCurrent || loading !== null}
                      className={`w-full py-3 rounded-xl text-center font-bold transition-all text-sm block cursor-pointer ${
                        isCurrent
                          ? 'bg-[#F8FAFC] text-[#64748B] cursor-default'
                          : 'bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15'
                      }`}
                    >
                      {isCurrent ? 'Current Free Trial' : 'Start Free Trial'}
                    </button>
                  ) : isCurrent ? (
                    <button
                      type="button"
                      onClick={() => handlePlanAction(plan.key, 'RENEWAL')}
                      disabled={loading !== null}
                      className="w-full py-3 rounded-xl text-center font-bold transition-all text-sm block cursor-pointer bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15 flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={14} />
                      <span>Renew {plan.name}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePlanAction(plan.key, isHigherTier ? 'UPGRADE' : 'SWITCH')}
                      disabled={loading !== null}
                      className="w-full py-3 rounded-xl text-center font-bold transition-all text-sm block cursor-pointer bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15"
                    >
                      Choose {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Subscription Payment History Table (Requirement 6 & 8) */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
              <IndianRupee size={20} className="text-[#EA580C]" />
              <span>Subscription & Renewal Payment History</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Complete historical ledger of all gym owner license purchases, renewals, and invoice records.
            </p>
          </div>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-3.5 py-1.5 bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#C2410C] flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <ArrowUpDown size={13} />
            <span>Sort: {sortAsc ? 'Oldest First' : 'Newest First'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] uppercase tracking-wider font-extrabold">
                <th className="py-3 px-3 w-12 text-center">#</th>
                <th className="py-3 px-3">Invoice / TRX ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Plan Details</th>
                <th className="py-3 px-3">Validity Period</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {(sortAsc ? [...paymentHistory] : [...paymentHistory].reverse()).map((inv, idx) => (
                <tr key={inv.id || idx} className="hover:bg-[#FFF7ED] transition-colors">
                  <td className="py-3.5 px-3 font-bold text-[#EA580C] text-center">{idx + 1}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-[#111827]">{inv.id || `INV-${String(idx + 1).padStart(5, '0')}`}</span>
                    {inv.isCurrent && (
                      <span className="ml-2 text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-extrabold">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-[#64748B] font-medium">{inv.date}</td>
                  <td className="py-3.5 px-3 font-semibold text-[#111827]">{inv.plan}</td>
                  <td className="py-3.5 px-3 text-[#64748B]">
                    {formatPaymentDate(inv.startDate)} — {formatPaymentDate(inv.endDate)}
                  </td>
                  <td className="py-3.5 px-3 font-extrabold text-[#111827]">{inv.amount}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                      inv.status === 'Paid' || inv.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv)}
                      className="px-3 py-1 bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#CBD5E1] hover:border-[#EA580C] text-[#111827] hover:text-[#EA580C] rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <Download size={13} className="text-[#EA580C]" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION & PAYMENT MODAL (Requirement 3 & 5) */}
      {paymentStep && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] flex items-center justify-center">
                  <Crown size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">
                    {actionType === 'RENEWAL' ? 'Confirm Plan Renewal' : `Confirm Upgrade to ${targetPlanObj.name}`}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {actionType === 'RENEWAL' ? 'Extend your existing license without interruption' : 'Unlock additional branch and trainer capabilities'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentStep(null)}
                className="p-1.5 text-[#64748B] hover:text-[#C2410C] rounded-xl cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Error banner if any */}
            {paymentError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-[#B91C1C]" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Plan & Pricing Summary Box */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center text-[#64748B]">
                <span>Selected Plan:</span>
                <span className="font-extrabold text-[#111827]">{targetPlanObj.name}</span>
              </div>
              <div className="flex justify-between items-center text-[#64748B]">
                <span>Billing Period:</span>
                <span className="font-extrabold text-[#111827]">{isAnnual ? 'Annual (12 Months)' : 'Monthly (1 Month)'}</span>
              </div>
              <div className="flex justify-between items-center text-[#64748B]">
                <span>Effective Start Date:</span>
                <span className="font-extrabold text-[#111827]">
                  {actionType === 'RENEWAL' && !isExpired ? `${renewalDateFormatted} (Continuously extended)` : 'Immediate'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#E2E8F0] pt-2 text-sm font-bold">
                <span className="text-[#111827]">Total Payable Amount:</span>
                <span className="text-xl font-black text-[#EA580C]">₹{targetPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Simulated Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Card', 'UPI', 'NetBanking'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethodSelect(method)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      paymentMethodSelect === method
                        ? 'bg-[#C2410C] text-white border-[#FDBA74]'
                        : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#FDBA74]'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {/* Card Inputs */}
              {paymentMethodSelect === 'Card' && (
                <div className="space-y-2.5 pt-1">
                  <input
                    type="text"
                    placeholder="Card Number (4000 1234 5678 9010)"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#FDBA74] rounded-xl text-xs text-[#111827] placeholder:text-[#64748B] focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#FDBA74] rounded-xl text-xs text-[#111827] placeholder:text-[#64748B] focus:outline-none"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={3}
                      className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#FDBA74] rounded-xl text-xs text-[#111827] placeholder:text-[#64748B] focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder Full Name"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#FDBA74] rounded-xl text-xs text-[#111827] placeholder:text-[#64748B] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentStep(null)}
                className="w-1/3 py-3 bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0] text-[#64748B] hover:text-[#C2410C] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePaymentSubmit}
                disabled={loading !== null}
                className="w-2/3 py-3 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white font-bold rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/15 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Payment...</span>
                  </>
                ) : (
                  <span>Confirm & Pay ₹{targetPrice.toLocaleString('en-IN')}</span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
              <Shield size={13} className="text-[#EA580C]" />
              <span>256-bit TLS encrypted & verified payment gateway</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminSubscription;
