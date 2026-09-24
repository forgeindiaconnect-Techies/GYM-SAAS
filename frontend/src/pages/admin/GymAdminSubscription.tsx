import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, CheckCircle, XCircle, Zap, Star, Crown, Sparkles,
  Users, Dumbbell, Building2, UserCheck, TrendingUp, Calendar,
  AlertTriangle, ArrowUpCircle, Loader2, Shield, Check, Gift, Receipt, Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { plans } from '../subscription/GymOwnerSubscriptionPage';

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
    name: 'Gold', color: 'text-[#164A4A]', bg: 'bg-[#164A4A]/10', border: 'border-[#164A4A]/40',
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
    color: 'text-slate-300', border: 'border-[#D3DFDA]', ctaStyle: 'bg-slate-500/20 border border-slate-400/50 text-slate-300 hover:bg-slate-500/30',
    icon: Star,
    features: ['Up to 100 Members', 'Up to 5 Trainers', 'Up to 2 Staff members', '1 Branch location', 'Basic reporting']
  },
  {
    key: 'GOLD', name: 'Gold', tagline: 'For growing gyms',
    priceMonthly: 1499, priceAnnual: 14990, savingsAnnual: 2998,
    color: 'text-[#164A4A]', border: 'border-[#164A4A]', ctaStyle: 'bg-[#164A4A] text-white hover:bg-[#C6A77D]',
    icon: Crown, popular: true,
    features: ['Up to 500 Members', 'Up to 15 Trainers', 'Up to 5 Staff members', 'Up to 2 Branch locations', 'Advanced analytics', 'Priority support']
  },
  {
    key: 'PREMIUM', name: 'Premium', tagline: 'Enterprise-grade',
    priceMonthly: 2499, priceAnnual: 24990, savingsAnnual: 4998,
    color: 'text-purple-400', border: 'border-purple-500/40', ctaStyle: 'bg-purple-600/80 border border-purple-500/50 text-[#202828] hover:bg-purple-600',
    icon: Sparkles,
    features: ['Unlimited Members', 'Unlimited Trainers', 'Unlimited Staff members', 'Up to 5 Branch locations', 'Custom branding', 'Dedicated account manager', 'Gym Store — Sell Supplements & Merch', 'Gym Store — Online Orders & Payments', 'Gym Store — Inventory & Offline Sales']
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
          <span className="text-[#455250] text-xs">{label}</span>
        </div>
        <span className={`text-xs font-bold ${isFull ? 'text-teal-400' : 'text-[#202828]'}`}>
          {isUnlimited ? `${used} / ∞` : `${used} / ${max}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-[#FFFFFF] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-teal-400' : pct > 80 ? 'bg-[#6fa3a0]' : 'bg-[#164A4A]'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
};

const MOCK_PAYMENT_HISTORY = [
  { 
    id: '#INV-2026-09-001', 
    date: '17 Sep 2026, 10:30 AM', 
    amount: '₹1,499', 
    plan: 'Gold Plan (Monthly)', 
    status: 'Paid',
    paymentMethod: 'UPI (PhonePe)',
    paymentDetails: 'UPI ID: messyfitness@ybl'
  },
  { 
    id: '#INV-2025-09-001', 
    date: '17 Sep 2025, 11:15 AM', 
    amount: '₹7,990', 
    plan: 'Silver Plan (Annual)', 
    status: 'Paid',
    paymentMethod: 'Manual Transfer',
    paymentDetails: 'Name: Selva Kumar | Acc No: ****7890'
  },
  { 
    id: '#INV-2024-09-001', 
    date: '17 Sep 2024, 09:45 AM', 
    amount: '₹7,990', 
    plan: 'Silver Plan (Annual)', 
    status: 'Paid',
    paymentMethod: 'UPI (Google Pay)',
    paymentDetails: 'UPI ID: selva@okaxis'
  },
];

const GymAdminSubscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
  const [previewPlanKey, setPreviewPlanKey] = useState<string | null>(null);

  const toggleFeatures = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setExpandedPlans(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownloadInvoice = (invoice: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const html = `
      <html>
        <head>
          <title>Invoice ${invoice.id}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #202828; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E8E5DA; padding-bottom: 20px; margin-bottom: 40px; }
            .title { font-size: 28px; font-weight: 900; color: #164A4A; }
            .details { margin-bottom: 30px; }
            .details table { width: 100%; border-collapse: collapse; }
            .details th, .details td { padding: 16px; text-align: left; border-bottom: 1px solid #E8E5DA; }
            .details th { background: #F2EFE8; color: #455250; font-size: 12px; text-transform: uppercase; font-weight: bold; }
            .payment-info { background: #F2EFE8; padding: 16px; border-radius: 8px; border: 1px solid #E8E5DA; margin-bottom: 20px; }
            .payment-info h3 { margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #455250; }
            .payment-info p { margin: 4px 0; font-size: 14px; font-weight: 500; }
            .total { font-size: 24px; font-weight: bold; text-align: right; padding: 16px; background: #F1F5F3; border-radius: 8px; border: 1px solid #D3DFDA; }
            .footer { margin-top: 60px; font-size: 12px; color: #687B78; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">AI GYM SAAS</div>
              <p style="margin: 5px 0 0 0; color: #455250;">Subscription Invoice</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0;">${invoice.id}</h2>
              <p style="margin: 5px 0 0 0; color: #455250;">Date: ${invoice.date}</p>
              <span style="display: inline-block; background: #D1FAE5; color: #047857; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-top: 10px;">
                STATUS: ${invoice.status.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div class="details">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 600;">${invoice.plan}</td>
                  <td style="text-align: right;">${invoice.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="payment-info">
            <h3>Payment Information</h3>
            <p><strong>Method:</strong> ${invoice.paymentMethod}</p>
            <p><strong>Details:</strong> <span style="color: #687B78;">${invoice.paymentDetails}</span></p>
          </div>
          
          <div class="total">Total Paid: <span style="color: #164A4A;">${invoice.amount}</span></div>
          
          <div class="footer">
            Thank you for your business!<br/>
            AI GYM SAAS Platform
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

  const currentPlanKey = user?.subscriptionPlan || 'FREE_TRIAL';
  const displayPlanKey = previewPlanKey || currentPlanKey;
  const currentPlan = PLAN_DETAILS[currentPlanKey] || PLAN_DETAILS.FREE_TRIAL;
  const displayPlan = PLAN_DETAILS[displayPlanKey] || PLAN_DETAILS.FREE_TRIAL;
  const PlanIcon = currentPlan.icon;

  const [usage, setUsage] = useState({ members: 0, trainers: 0, staff: 1, branches: 1 });

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
  }, [user]);

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
      const selectRes = await api.post('/subscriptions/select', {
        plan: paymentStep,
        billingCycle: isAnnual ? 'annual' : 'monthly',
      });
      
      await api.post('/subscriptions/process', {
        subscriptionId: selectRes.data.subscription.id,
        paymentMethod: 'Online'
      });

      if (updateUser) {
        updateUser({ subscriptionPlan: paymentStep, subscriptionStatus: 'ACTIVE' });
      }

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
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Subscription Management</h1>
        <p className="text-[#455250] mt-1">Manage your AI GYM SaaS platform subscription and usage.</p>
      </div>

      {/* Payment Success Banner */}
      {paymentSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle size={24} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-[#202828] font-bold">Payment Successful! Your plan has been upgraded.</h3>
            <p className="text-[#455250] text-sm mt-1">Your new features are now active. Refresh if any dashboard items haven't updated yet.</p>
          </div>
        </div>
      )}

      {/* Expiry Warning */}
      {(isExpired || isTrial) && (
        <div className={`border rounded-2xl p-5 flex items-center justify-between ${isExpired ? 'bg-[#6fa3a0]/10 border-[#6fa3a0]/30' : 'bg-[#FFFFFF] border-[#164A4A]/30'}`}>
          <div className="flex items-center space-x-4">
            <AlertTriangle size={24} className={isExpired ? 'text-teal-400' : 'text-[#164A4A]'} />
            <div>
              <h3 className="text-[#202828] font-bold">{isExpired ? 'Your free trial has expired!' : 'Free Trial Active — 1 Day Remaining'}</h3>
              <p className="text-[#455250] text-sm mt-0.5">{isExpired ? 'Upgrade to a paid plan to restore full access.' : 'Upgrade now to avoid interruption when your trial ends.'}</p>
            </div>
          </div>
          <button
            onClick={() => document.getElementById('upgrade-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="shrink-0 flex items-center space-x-2 px-4 py-2.5 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors text-sm"
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
              <p className="text-[#455250] text-xs uppercase tracking-widest font-bold mb-1">Current Plan</p>
              <h2 className={`text-2xl font-black ${currentPlan.color}`}>{currentPlan.name} Plan</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded-md font-bold ${isActive ? 'bg-green-500/10 text-green-400' : isTrial ? 'bg-[#164A4A]/10 text-[#164A4A]' : 'bg-[#6fa3a0]/10 text-teal-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400' : isTrial ? 'bg-[#164A4A]' : 'bg-teal-400'}`} />
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
              <div key={i} className="bg-[#FFFFFF] rounded-xl p-3 border border-[#D3DFDA]">
                <p className="text-[#555] text-[10px] uppercase tracking-wider font-bold">{item.label}</p>
                <p className="text-[#202828] font-semibold text-sm mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
        <h2 className="text-lg font-bold text-[#202828] mb-5 flex items-center space-x-2">
          <TrendingUp size={20} className="text-[#164A4A]" />
          <span>Platform Usage</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LimitBar label="Members" icon={Users} used={usage.members} max={displayPlan.limits.members} color="text-blue-400" />
          <LimitBar label="Trainers" icon={Dumbbell} used={usage.trainers} max={displayPlan.limits.trainers} color="text-green-400" />
          <LimitBar label="Staff" icon={UserCheck} used={usage.staff} max={displayPlan.limits.staff} color="text-purple-400" />
          <LimitBar label="Branches" icon={Building2} used={usage.branches} max={displayPlan.limits.branches} color="text-[#164A4A]" />
        </div>
        <p className="text-[#555] text-xs mt-4">
          💡 Usage stats update in real-time. When you reach a limit, you'll see an upgrade prompt in the respective section.
        </p>
      </div>

      {/* Upgrade Plans */}
      <div id="upgrade-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl font-bold text-[#202828]">Upgrade Your Plan</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#202828]' : 'text-[#A8ADA9]'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              aria-pressed={isAnnual}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#164A4A] focus:ring-offset-1 ${isAnnual ? 'bg-[#164A4A]' : 'bg-[#CBD5E1]'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#202828]' : 'text-[#A8ADA9]'}`}>Annual</span>
              {isAnnual ? (
                <span className="text-xs bg-[#D2B48C]/10 text-[#164A4A] px-2 py-0.5 rounded-full font-bold border border-green-200">
                  2 months FREE!
                </span>
              ) : (
                <span className="text-xs bg-[#F1F5F3] text-[#6fa3a0] px-2 py-0.5 rounded-full border border-[#D3DFDA]">
                  Save up to 25%
                </span>
              )}
            </div>
          </div>
        </div>
        {isAnnual && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 font-medium">
            <CheckCircle size={15} className="text-[#164A4A] shrink-0" />
            Annual billing: prices shown are per month — total charged once per year.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plans.filter(p => p.key !== currentPlanKey && p.key !== 'FREE_TRIAL').map((plan) => {
            const Icon = plan.icon;
            
            const getPrice = (p: typeof plans[0]) => {
              if (isAnnual) {
                return {
                  main: `₹${p.priceAnnual?.toLocaleString('en-IN')}`,
                  period: '/year',
                  sub: `Equivalent to ₹${p.priceAnnualPerMonth?.toLocaleString('en-IN')}/mo`,
                };
              }
              return { main: `₹${p.priceMonthly.toLocaleString('en-IN')}`, period: '/mo', sub: null };
            };
            const price = getPrice(plan);
            const isSelected = previewPlanKey === plan.key;

            return (
              <div
                key={plan.key}
                onClick={() => setPreviewPlanKey(isSelected ? null : plan.key)}
                className={`relative flex flex-col bg-white rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${isSelected ? 'border-[#164A4A] shadow-2xl -translate-y-2 ring-2 ring-[#164A4A] ring-offset-2' : `${plan.borderDefault} hover:-translate-y-1 hover:shadow-lg`}`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="bg-[#164A4A] text-white text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest">
                    ⭐ Most Popular
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
                        <h3 className="font-bold text-[#202828] text-sm">{plan.name}</h3>
                        <span className="text-[10px] text-[#455250] font-medium">{plan.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black tracking-tight ${plan.priceColor}`}>{price.main}</span>
                      <span className="text-[#455250] text-sm font-medium">{price.period}</span>
                    </div>
                    {price.sub && (
                      <p className="text-[#455250] text-xs mt-0.5">{price.sub}</p>
                    )}
                    {isAnnual && !plan.trial && plan.savingsAnnual && (
                      <p className="text-[#164A4A] text-xs mt-1 font-bold">
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
                  <div className="bg-[#F2EFE8] rounded-xl px-3 py-2 mb-4 border border-[#D3DFDA]">
                    <p className="text-[10px] text-[#455250] font-bold uppercase tracking-widest mb-0.5">Platform Limits</p>
                    <p className="text-xs text-[#202828] font-medium">{plan.limits}</p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-4">
                    <button 
                      onClick={(e) => toggleFeatures(e, plan.key)}
                      className="text-xs font-bold text-[#164A4A] hover:text-[#C6A77D] underline mb-3 transition-colors"
                    >
                      {expandedPlans[plan.key] ? 'Hide Features' : 'View Features'}
                    </button>
                    {expandedPlans[plan.key] && (
                      <ul className="space-y-2">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#202828]">
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
                    )}
                  </div>

                  {/* Annual bonus for annual mode */}
                  {isAnnual && !plan.trial && (
                    <div className="mb-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Gift size={9} /> Annual Bonus
                      </p>
                      <p className="text-xs text-green-700">2 months FREE included</p>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpgrade(plan.key);
                    }}
                    disabled={loading !== null}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all mt-auto ${
                      plan.key === 'GOLD' 
                      ? 'bg-[#164A4A] text-white hover:bg-[#C6A77D]' 
                      : plan.key === 'PREMIUM'
                      ? 'bg-purple-600/80 text-white hover:bg-purple-600'
                      : 'bg-white border-2 border-[#D3DFDA] text-[#455250] hover:border-[#164A4A] hover:text-[#164A4A]'
                    }`}
                  >
                    Upgrade to {plan.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-bold text-[#202828] mb-5 flex items-center space-x-2">
          <Receipt size={20} className="text-[#164A4A]" />
          <span>Gym Owner Subscription Payment Details</span>
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#D3DFDA]">
                <th className="py-3 px-4 text-xs font-bold text-[#455250] uppercase tracking-wider whitespace-nowrap">Invoice ID</th>
                <th className="py-3 px-4 text-xs font-bold text-[#455250] uppercase tracking-wider whitespace-nowrap">Date</th>
                <th className="py-3 px-4 text-xs font-bold text-[#455250] uppercase tracking-wider whitespace-nowrap">Plan</th>
                <th className="py-3 px-4 text-xs font-bold text-[#455250] uppercase tracking-wider whitespace-nowrap">Payment Details</th>
                <th className="py-3 px-4 text-xs font-bold text-[#455250] uppercase tracking-wider whitespace-nowrap">Amount</th>
                <th className="py-3 px-4 text-xs font-bold text-[#455250] uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="py-3 px-4 text-xs font-bold text-[#455250] uppercase tracking-wider text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PAYMENT_HISTORY.map((invoice, idx) => (
                <tr key={idx} className="border-b border-[#F1F5F9] hover:bg-[#F2EFE8] transition-colors last:border-0">
                  <td className="py-4 px-4 text-sm font-semibold text-[#202828] whitespace-nowrap">{invoice.id}</td>
                  <td className="py-4 px-4 text-sm text-[#455250] whitespace-nowrap">{invoice.date}</td>
                  <td className="py-4 px-4 text-sm font-medium text-[#202828] whitespace-nowrap">{invoice.plan}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#202828]">{invoice.paymentMethod}</span>
                      <span className="text-xs text-[#687B78]">{invoice.paymentDetails}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-[#202828] whitespace-nowrap">{invoice.amount}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="inline-flex items-center space-x-1 text-[#164A4A] hover:text-[#C6A77D] font-bold text-xs bg-[#F1F5F3] hover:bg-[#D1FAE5] px-3 py-1.5 rounded-lg transition-colors border border-[#D3DFDA]"
                    >
                      <Download size={14} />
                      <span>Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentStep && upgradeTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 ${upgradeTarget.key === 'GOLD' ? 'bg-[#164A4A]/10' : 'bg-purple-400/10'} rounded-xl flex items-center justify-center`}>
                <upgradeTarget.icon size={24} className={upgradeTarget.color} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#202828]">Upgrade to {upgradeTarget.name}</h2>
                <p className="text-[#455250] text-sm">{upgradeTarget.tagline}</p>
              </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#455250]">Plan</span>
                <span className="text-[#202828] font-semibold">{upgradeTarget.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#455250]">Billing</span>
                <span className="text-[#202828] font-semibold">{isAnnual ? 'Annual' : 'Monthly'}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#D3DFDA] pt-3">
                <span className="text-[#455250] font-bold">Total</span>
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
              <input type="text" placeholder="Card Number" className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A]" maxLength={19} />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="MM / YY" className="bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A]" maxLength={7} />
                <input type="text" placeholder="CVV" className="bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A]" maxLength={3} />
              </div>
              <input type="text" placeholder="Cardholder Name" className="w-full bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A]" />
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setPaymentStep(null)} className="flex-1 py-3 bg-[#FFFFFF] text-[#202828] rounded-xl font-bold hover:bg-[#E8E5DA] transition-colors text-sm">Cancel</button>
              <button
                onClick={handlePayment}
                disabled={loading !== null}
                className="flex-1 py-3 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors disabled:opacity-60 text-sm flex items-center justify-center space-x-2"
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
