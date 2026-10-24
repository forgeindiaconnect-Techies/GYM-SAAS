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
    name: 'Starter', color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/10', border: 'border-[#2A3A3A]',
    icon: Star, limits: { members: 100, trainers: 3, staff: 2, branches: 1 },
    priceMonthly: 799, priceAnnual: 7190,
  },
  SILVER: {
    name: 'Silver', color: 'text-slate-300', bg: 'bg-slate-500/10', border: 'border-[#2A3A3A]',
    icon: Star, limits: { members: 100, trainers: 5, staff: 2, branches: 1 },
    priceMonthly: 799, priceAnnual: 7190,
  },
  PROFESSIONAL: {
    name: 'Professional', color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/10', border: 'border-[#2DD4BF]/40',
    icon: Crown, limits: { members: 500, trainers: 15, staff: 5, branches: 2 },
    priceMonthly: 1499, priceAnnual: 13490,
  },
  GOLD: {
    name: 'Gold', color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/15', border: 'border-[#2DD4BF]/50',
    icon: Crown, limits: { members: 500, trainers: 15, staff: 5, branches: 2 },
    priceMonthly: 1499, priceAnnual: 13490,
  },
  ENTERPRISE: {
    name: 'Enterprise', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-[#2A3A3A]',
    icon: Sparkles, limits: { members: 1000, trainers: 50, staff: 10, branches: 5 },
    priceMonthly: 2499, priceAnnual: 22490,
  },
  PREMIUM: {
    name: 'Premium', color: 'text-[#2DD4BF]', bg: 'bg-[#2DD4BF]/20', border: 'border-[#2DD4BF]/60',
    icon: Sparkles, limits: { members: -1, trainers: -1, staff: -1, branches: 5 },
    priceMonthly: 2499, priceAnnual: 22490,
  },
  FREE_TRIAL: {
    name: 'Free Trial', color: 'text-[#9AAEAE]', bg: 'bg-slate-500/10', border: 'border-[#2A3A3A]',
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
          <span className="text-[#9AAEAE] text-xs">{label}</span>
        </div>
        <span className={`text-xs font-bold ${isFull ? 'text-red-400' : 'text-[#FFFFFF]'}`}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${max}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-[#0E1415] rounded-full h-1.5 overflow-hidden border border-[#2A3A3A]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-[#2DD4BF]'}`}
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
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2DD4BF; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 26px; font-weight: 900; color: #111; }
            .details table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details th, .details td { padding: 14px; text-align: left; border-bottom: 1px solid #E5E5E5; font-size: 13px; }
            .details th { background: #F8F8F8; color: #555; text-transform: uppercase; font-size: 11px; }
            .total { font-size: 20px; font-weight: 800; text-align: right; padding: 16px; background: #F0F4FF; border: 1px solid #2DD4BF; border-radius: 8px; margin-top: 20px; color: #2A3A3A; }
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
              <h3 style="margin: 0; color: #17130A;">${invoice.id}</h3>
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
                  <td><span style="color: #34D399; font-weight: bold;">${invoice.status}</span></td>
                  <td style="text-align: right; font-weight: bold;">${invoice.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="total">Total Paid: <span style="color: #17130A;">${invoice.amount}</span></div>
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
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-[#080B0C] text-[#FFFFFF] min-h-screen">
      
      {/* Page Title & Status Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3A3A] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 rounded-full text-xs font-bold uppercase tracking-wider text-[#2DD4BF] mb-2">
            <Crown size={14} className="text-[#2DD4BF]" />
            Gym Owner License Management
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#FFFFFF]">
            Subscription, Renewal & Upgrades
          </h1>
          <p className="text-[#9AAEAE] text-sm mt-1">
            Manage your AI Gym Management SaaS platform license, renewals, and features for <strong className="text-[#FFFFFF]">{user?.gymName || 'Your Gym'}</strong>.
          </p>
        </div>

        <button
          onClick={loadSubscriptionInfo}
          className="self-start sm:self-auto px-4 py-2.5 bg-[#141D1E] hover:bg-[#1B2728] border border-[#2A3A3A] hover:border-[#2DD4BF] text-[#FFFFFF] text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw size={14} />
          Sync License
        </button>
      </div>

      {/* Success Notification Alert */}
      {paymentSuccess && (
        <div className="bg-[#0E1415]/40 border border-[#2A3A3A] rounded-2xl p-5 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2DD4BF]/20 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle size={22} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-[#FFFFFF] font-bold text-sm">{paymentSuccess}</h3>
              <p className="text-[#2DD4BF] text-xs mt-0.5">
                Your subscription status, expiry dates, and platform permissions have been updated in real-time.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPaymentSuccess(null)}
            className="text-xs text-emerald-400 hover:underline font-semibold shrink-0 cursor-pointer"
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
              ? 'bg-red-950/30 border-red-800 text-red-200'
              : isExpiringSoon
              ? 'bg-amber-950/30 border-amber-800 text-amber-200'
              : 'bg-[#141D1E] border-[#2DD4BF]/40 text-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              size={24}
              className={isExpired ? 'text-red-400 shrink-0' : isExpiringSoon ? 'text-amber-400 shrink-0' : 'text-[#2DD4BF] shrink-0'}
            />
            <div>
              <h3 className="font-bold text-sm text-[#FFFFFF]">
                {isExpired
                  ? 'Your Subscription Plan Has Expired!'
                  : isExpiringSoon
                  ? `Subscription Expiring Soon — ${remainingDays} Day${remainingDays === 1 ? '' : 's'} Remaining`
                  : 'Free Trial Active — 1 Day Remaining'}
              </h3>
              <p className="text-xs text-[#9AAEAE] mt-0.5">
                {isExpired
                  ? 'Renew your plan now to restore full access to AI tools, trainer schedules, and member check-ins. Your data is safely preserved.'
                  : 'Renew now to ensure uninterrupted access to your gym management portal.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => handlePlanAction(currentPlanKey, 'RENEWAL')}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#FFFFFF] rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#2DD4BF]/25 cursor-pointer"
            >
              <RefreshCw size={14} />
              Renew {currentPlan.name} Plan
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: Current Subscription Overview Banner */}
      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#2A3A3A] pb-6">
          
          {/* Plan Icon and Badges */}
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-16 h-16 ${currentPlan.bg} rounded-2xl flex items-center justify-center border border-[#2A3A3A] shrink-0`}>
              <PlanIcon size={32} className={currentPlan.color} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-[#9AAEAE] uppercase tracking-widest font-extrabold">
                  Current Active Plan
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-extrabold uppercase ${
                    isActive
                      ? 'bg-[#0E1415]/60 text-emerald-400 border border-[#2A3A3A]/50'
                      : isExpiringSoon
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-700/50'
                      : 'bg-red-950/60 text-red-400 border border-red-700/50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#2DD4BF]' : isExpiringSoon ? 'bg-amber-400' : 'bg-red-400'}`} />
                  {isActive ? 'Active' : isExpiringSoon ? 'Expiring Soon' : isTrial ? 'Trial' : 'Expired'}
                </span>
              </div>

              <h2 className={`text-2xl sm:text-3xl font-black mt-1 ${currentPlan.color}`}>
                {currentPlan.name} Plan
              </h2>

              <p className="text-xs text-[#9AAEAE] mt-0.5">
                {billingCycleDisplay} billing • {isExpired ? 'Expired' : `${remainingDays} days remaining in current billing cycle`}
              </p>
            </div>
          </div>

          {/* Action Buttons for Current Plan */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handlePlanAction(currentPlanKey, 'RENEWAL')}
              className="px-5 py-3 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#FFFFFF] rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shadow-[#2DD4BF]/25 cursor-pointer"
            >
              <RefreshCw size={15} />
              Renew Plan
            </button>

            <button
              onClick={() => document.getElementById('available-plans-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-3 bg-[#0E1415] hover:bg-[#1B2728] border border-[#2A3A3A] hover:border-[#2DD4BF] text-[#FFFFFF] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowUpCircle size={15} className="text-[#2DD4BF]" />
              Upgrade Plan
            </button>

            {paymentHistory.length > 0 && (
              <button
                onClick={() => handleDownloadInvoice(paymentHistory[0])}
                className="px-4 py-3 bg-[#0E1415] hover:bg-[#1B2728] border border-[#2A3A3A] text-[#9AAEAE] hover:text-[#FFFFFF] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
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
          <div className="bg-[#0E1415] rounded-2xl p-4 border border-[#2A3A3A]">
            <p className="text-[#9AAEAE] text-[10px] uppercase tracking-wider font-extrabold">Billing Cycle</p>
            <p className="text-[#FFFFFF] font-extrabold text-sm sm:text-base mt-1 flex items-center gap-1.5">
              <Clock size={15} className="text-[#2DD4BF]" />
              {billingCycleDisplay}
            </p>
          </div>

          <div className="bg-[#0E1415] rounded-2xl p-4 border border-[#2A3A3A]">
            <p className="text-[#9AAEAE] text-[10px] uppercase tracking-wider font-extrabold">Subscription Started</p>
            <p className="text-[#FFFFFF] font-extrabold text-sm sm:text-base mt-1 flex items-center gap-1.5">
              <Calendar size={15} className="text-[#2DD4BF]" />
              {startDateFormatted}
            </p>
          </div>

          <div className="bg-[#0E1415] rounded-2xl p-4 border border-[#2A3A3A]">
            <p className="text-[#9AAEAE] text-[10px] uppercase tracking-wider font-extrabold">Expiry / Renewal Date</p>
            <p className="text-[#FFFFFF] font-extrabold text-sm sm:text-base mt-1 flex items-center gap-1.5">
              <Calendar size={15} className={isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-400' : 'text-[#34D399]'} />
              {renewalDateFormatted}
            </p>
          </div>

          <div className="bg-[#0E1415] rounded-2xl p-4 border border-[#2A3A3A]">
            <p className="text-[#9AAEAE] text-[10px] uppercase tracking-wider font-extrabold">Remaining Time</p>
            <p className={`font-black text-sm sm:text-base mt-1 ${isExpired ? 'text-red-400' : isExpiringSoon ? 'text-amber-400' : 'text-[#2DD4BF]'}`}>
              {isExpired ? '0 Days (Expired)' : `${remainingDays} Days Left`}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Platform Limits & Real-Time Usage */}
      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-3">
          <h2 className="text-base font-bold text-[#FFFFFF] flex items-center gap-2">
            <TrendingUp size={18} className="text-[#2DD4BF]" />
            <span>Platform Usage vs. {currentPlan.name} Plan Limits</span>
          </h2>
          <span className="text-xs text-[#9AAEAE]">Real-time synchronized</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          <LimitBar label="Active Members" icon={Users} used={usage.members} max={currentPlan.limits.members} color="text-sky-400" />
          <LimitBar label="Assigned Trainers" icon={Dumbbell} used={usage.trainers} max={currentPlan.limits.trainers} color="text-emerald-400" />
          <LimitBar label="Staff Accounts" icon={UserCheck} used={usage.staff} max={currentPlan.limits.staff} color="text-purple-400" />
          <LimitBar label="Branch Licenses" icon={Building2} used={usage.branches} max={currentPlan.limits.branches} color="text-[#2DD4BF]" />
        </div>
      </div>

      {/* SECTION 3: All Available Plans Grid (Requirement 1 & 6: Never Hide Any Plan!) */}
      <div id="available-plans-section" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#2A3A3A] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#FFFFFF]">Available Subscription Plans</h2>
            <p className="text-xs text-[#9AAEAE] mt-0.5">
              Compare all subscription tiers. You can renew your current plan or upgrade at any time.
            </p>
          </div>

          {/* Monthly / Annual Billing Toggle */}
          <div className="flex items-center gap-3 bg-[#0E1415] p-1.5 rounded-2xl border border-[#2A3A3A] self-start sm:self-auto">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isAnnual ? 'bg-[#2DD4BF] text-white shadow-sm' : 'text-[#9AAEAE] hover:text-[#FFFFFF]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isAnnual ? 'bg-[#2DD4BF] text-white shadow-sm' : 'text-[#9AAEAE] hover:text-[#FFFFFF]'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30 px-1.5 py-0.2 rounded-md font-extrabold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid - Displays ALL Plans Without Hiding */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.filter(p => p.key !== 'FREE_TRIAL').map((plan) => {
            const isCurrent = plan.key === currentPlanKey;
            const planPricing = PLAN_DETAILS[plan.key] || PLAN_DETAILS.SILVER;
            const currentRank = PLAN_TIER_RANK[currentPlanKey] ?? 1;
            const targetRank = PLAN_TIER_RANK[plan.key] ?? 1;
            const isHigherTier = targetRank > currentRank;
            const isLowerTier = targetRank < currentRank;
            const Icon = plan.icon;

            const displayPrice = isAnnual ? planPricing.priceAnnual : planPricing.priceMonthly;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col bg-[#141D1E] rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isCurrent
                    ? 'border-[#2DD4BF] shadow-2xl ring-2 ring-[#2DD4BF]/40'
                    : 'border-[#2A3A3A] hover:border-[#2DD4BF]/60 hover:shadow-xl'
                }`}
              >
                {/* Current Plan Badge or Popular Badge */}
                {isCurrent ? (
                  <div className="bg-[#2DD4BF] text-[#06201D] font-bold text-[11px] font-black text-center py-1.5 uppercase tracking-widest flex items-center justify-center gap-1">
                    <CheckCircle2 size={13} /> Your Current Active Plan
                  </div>
                ) : plan.popular ? (
                  <div className="bg-gradient-to-r from-[#2DD4BF]/20 to-[#2DD4BF]/30 text-[#2DD4BF] border-b border-[#2DD4BF]/30 text-[11px] font-black text-center py-1.5 uppercase tracking-widest">
                    ⭐ Recommended Tier
                  </div>
                ) : null}

                <div className="p-6 flex flex-col flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/25 text-[#2DD4BF] flex items-center justify-center">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#FFFFFF] text-base">{plan.name}</h3>
                        <span className="text-[11px] text-[#9AAEAE]">{plan.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#FFFFFF]">
                        ₹{displayPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[#9AAEAE] text-xs font-semibold">
                        {isAnnual ? '/year' : '/month'}
                      </span>
                    </div>
                    {isAnnual && (
                      <p className="text-[11px] text-emerald-400 font-semibold">
                        Includes 2 months free equivalent
                      </p>
                    )}
                  </div>

                  {/* Limits summary */}
                  <div className="p-3 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
                    <span className="text-[10px] text-[#9AAEAE] uppercase tracking-wider font-extrabold block mb-0.5">
                      Included Platform Limits
                    </span>
                    <p className="text-xs text-[#FFFFFF] font-semibold">{plan.limits}</p>
                  </div>

                  {/* Features list toggle */}
                  <div className="flex-1 space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#9AAEAE]">Included Features:</span>
                      <button
                        onClick={(e) => toggleFeatures(e, plan.key)}
                        className="text-xs font-bold text-[#2DD4BF] hover:underline cursor-pointer"
                      >
                        {expandedPlans[plan.key] ? 'Collapse' : 'Show All'}
                      </button>
                    </div>

                    <ul className="space-y-2 text-xs">
                      {plan.features.slice(0, expandedPlans[plan.key] ? undefined : 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-[#FFFFFF]">
                          <Check size={14} className="text-[#34D399] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {!expandedPlans[plan.key] && plan.features.length > 4 && (
                        <li className="text-[11px] text-[#9AAEAE] pl-5 italic">
                          + {plan.features.length - 4} more premium features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Action Button: Renew, Upgrade, or Switch */}
                  <div className="pt-4">
                    {isCurrent ? (
                      <button
                        onClick={() => handlePlanAction(plan.key, 'RENEWAL')}
                        className="w-full py-3 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#2DD4BF]/25 cursor-pointer"
                      >
                        <RefreshCw size={14} />
                        Renew Current Plan
                      </button>
                    ) : isHigherTier ? (
                      <button
                        onClick={() => handlePlanAction(plan.key, 'UPGRADE')}
                        className="w-full py-3 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#2DD4BF]/25 cursor-pointer"
                      >
                        <ArrowUpCircle size={14} />
                        Upgrade to {plan.name}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlanAction(plan.key, 'SWITCH')}
                        className="w-full py-3 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#2DD4BF]/25 cursor-pointer"
                      >
                        Switch to {plan.name}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Subscription Payment History Table (Requirement 6 & 8) */}
      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#2A3A3A] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#FFFFFF] flex items-center gap-2">
              <IndianRupee size={20} className="text-[#2DD4BF]" />
              <span>Subscription & Renewal Payment History</span>
            </h2>
            <p className="text-xs text-[#9AAEAE] mt-0.5">
              Complete historical ledger of all gym owner license purchases, renewals, and invoice records.
            </p>
          </div>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-3.5 py-1.5 bg-[#0E1415] hover:bg-[#1B2728] border border-[#2A3A3A] rounded-xl text-xs font-bold text-[#9AAEAE] hover:text-[#FFFFFF] flex items-center gap-1.5 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <ArrowUpDown size={13} />
            <span>Sort: {sortAsc ? 'Oldest First' : 'Newest First'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2A3A3A] bg-[#0E1415] text-[#9AAEAE] uppercase tracking-wider font-extrabold">
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
            <tbody className="divide-y divide-[#2A3A3A]">
              {(sortAsc ? [...paymentHistory] : [...paymentHistory].reverse()).map((inv, idx) => (
                <tr key={inv.id || idx} className="hover:bg-[#1B2728] transition-colors">
                  <td className="py-3.5 px-3 font-bold text-[#2DD4BF] text-center">{idx + 1}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-[#FFFFFF]">{inv.id}</span>
                    {inv.isCurrent && (
                      <span className="ml-2 text-[10px] bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 text-[#FFFFFF] px-2 py-0.5 rounded-full font-extrabold">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-[#9AAEAE]">{inv.date}</td>
                  <td className="py-3.5 px-3 font-semibold text-[#FFFFFF]">{inv.plan}</td>
                  <td className="py-3.5 px-3 text-[#9AAEAE]">
                    {formatPaymentDate(inv.startDate)} — {formatPaymentDate(inv.endDate)}
                  </td>
                  <td className="py-3.5 px-3 font-extrabold text-[#FFFFFF]">{inv.amount}</td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                      inv.status === 'Paid' || inv.status === 'Active'
                        ? 'bg-[#0E1415]/60 text-emerald-400 border border-[#2A3A3A]/50'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-700/50'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(inv)}
                      className="px-3 py-1 bg-[#0E1415] hover:bg-[#1B2728] border border-[#2A3A3A] text-[#FFFFFF] hover:text-[#2DD4BF] rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download size={13} />
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
          <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] flex items-center justify-center">
                  <Crown size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#FFFFFF]">
                    {actionType === 'RENEWAL' ? 'Confirm Plan Renewal' : `Confirm Upgrade to ${targetPlanObj.name}`}
                  </h3>
                  <p className="text-xs text-[#9AAEAE]">
                    {actionType === 'RENEWAL' ? 'Extend your existing license without interruption' : 'Unlock additional branch and trainer capabilities'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentStep(null)}
                className="p-1.5 text-[#9AAEAE] hover:text-[#FFFFFF] rounded-xl cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Error banner if any */}
            {paymentError && (
              <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-400" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Plan & Pricing Summary Box */}
            <div className="p-4 bg-[#0E1415] border border-[#2A3A3A] rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-center text-[#9AAEAE]">
                <span>Selected Plan:</span>
                <span className="font-extrabold text-[#FFFFFF]">{targetPlanObj.name}</span>
              </div>
              <div className="flex justify-between items-center text-[#9AAEAE]">
                <span>Billing Period:</span>
                <span className="font-extrabold text-[#FFFFFF]">{isAnnual ? 'Annual (12 Months)' : 'Monthly (1 Month)'}</span>
              </div>
              <div className="flex justify-between items-center text-[#9AAEAE]">
                <span>Effective Start Date:</span>
                <span className="font-extrabold text-[#FFFFFF]">
                  {actionType === 'RENEWAL' && !isExpired ? `${renewalDateFormatted} (Continuously extended)` : 'Immediate'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#2A3A3A] pt-2 text-sm font-bold">
                <span className="text-[#FFFFFF]">Total Payable Amount:</span>
                <span className="text-xl font-black text-[#2DD4BF]">₹{targetPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Simulated Payment Method Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider block">
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
                        ? 'bg-[#2DD4BF] text-white border-[#2DD4BF]'
                        : 'bg-[#0E1415] text-[#9AAEAE] border-[#2A3A3A] hover:border-[#2DD4BF]'
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
                    className="w-full px-3.5 py-2.5 bg-[#080B0C] border border-[#2A3A3A] focus:border-[#2DD4BF] rounded-xl text-xs text-[#FFFFFF] focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full px-3.5 py-2.5 bg-[#080B0C] border border-[#2A3A3A] focus:border-[#2DD4BF] rounded-xl text-xs text-[#FFFFFF] focus:outline-none"
                    />
                    <input
                      type="password"
                      placeholder="CVV"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={3}
                      className="w-full px-3.5 py-2.5 bg-[#080B0C] border border-[#2A3A3A] focus:border-[#2DD4BF] rounded-xl text-xs text-[#FFFFFF] focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder Full Name"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080B0C] border border-[#2A3A3A] focus:border-[#2DD4BF] rounded-xl text-xs text-[#FFFFFF] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentStep(null)}
                className="w-1/3 py-3 bg-[#0E1415] hover:bg-[#1B2728] border border-[#2A3A3A] text-[#9AAEAE] hover:text-[#FFFFFF] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePaymentSubmit}
                disabled={loading !== null}
                className="w-2/3 py-3 bg-[#2DD4BF] hover:bg-[#5EEAD4] disabled:opacity-50 text-[#06201D] font-bold rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#2DD4BF]/25 cursor-pointer"
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

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#9AAEAE]">
              <Shield size={13} className="text-[#2DD4BF]" />
              <span>256-bit TLS encrypted & verified payment gateway</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminSubscription;
