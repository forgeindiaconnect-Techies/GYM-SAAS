import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, CheckCircle2, AlertCircle, Loader2, Calendar, History,
  Sparkles, Clock, Check, Zap, Eye, X, Receipt, ShieldCheck, Mail,
  Printer, Send, RefreshCw, Download
} from 'lucide-react';
import api from '../../utils/api';

const MemberSubscription = () => {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [gym, setGym] = useState<any>(null);
  const [gymPackages, setGymPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(false);
  const [resendingEmail, setResendingEmail] = useState<boolean>(false);
  const [resendMessage, setResendMessage] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [memRes, userRes] = await Promise.all([
        api.get('/memberships/my').catch(() => ({ data: { memberships: [] } })),
        api.get('/auth/me').catch(() => ({ data: { user: null } }))
      ]);

      const memList = memRes.data?.memberships || [];
      const userData = userRes.data?.user || null;
      setMemberships(memList);
      setUser(userData);

      const targetGymId = userData?.gymId?._id || userData?.gymId || memList[0]?.gymId?._id || memList[0]?.gymId;
      if (targetGymId) {
        const [gymRes, pkgRes] = await Promise.allSettled([
          api.get(`/gyms/${targetGymId}`),
          api.get('/gym-packages/public', { params: { gymId: targetGymId } })
        ]);
        if (gymRes.status === 'fulfilled') setGym(gymRes.value.data?.gym || null);
        if (pkgRes.status === 'fulfilled' && Array.isArray(pkgRes.value.data?.packages) && pkgRes.value.data.packages.length > 0) {
          setGymPackages(pkgRes.value.data.packages);
        }
      }
    } catch (err) {
      console.error('Error fetching subscription data', err);
    } finally {
      setLoading(false);
    }
  };

  const activeMembership = memberships.find(m => (m.status === 'Active' || m.status === 'Free Trial') && (!m.endDate || new Date(m.endDate) >= new Date()));
  const pendingMembership = memberships.find(m => m.status === 'Payment Verification Pending');
  const currentMembership = activeMembership || pendingMembership || memberships[0];

  const now = new Date();
  const isCurrentExpired = Boolean(
    currentMembership && (
      currentMembership.status === 'Expired' ||
      user?.subscriptionStatus === 'Expired' ||
      user?.subscriptionStatus === 'EXPIRED' ||
      (currentMembership.endDate && new Date(currentMembership.endDate) < now)
    )
  );

  const isActive = Boolean(
    currentMembership &&
    !isCurrentExpired &&
    (currentMembership.status === 'Active' || currentMembership.status === 'Free Trial')
  );

  const isTrial = Boolean(
    currentMembership && (
      currentMembership.status === 'Free Trial' ||
      currentMembership.planName?.toLowerCase().includes('trial') ||
      currentMembership.paymentMethod === 'Trial' ||
      Number(currentMembership.price || 0) === 0
    )
  );

  const isTrialCompleted = isTrial && (isCurrentExpired || memberships.some(m => m.status === 'Active' && (!m.endDate || new Date(m.endDate) >= now)));

  // Synthesize history list including Free Trial if not explicitly in CustomerMembership collection
  const allHistory = [...memberships];
  const hasTrialRecord = allHistory.some(m => m.status === 'Free Trial' || m.paymentMethod === 'Trial' || m.price === 0);

  if (!hasTrialRecord && (user?.subscriptionStatus === 'Free Trial' || user?.createdAt)) {
    const trialStartDate = user?.createdAt ? new Date(user.createdAt) : new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 1);

    allHistory.push({
      _id: 'derived-free-trial',
      planName: user?.subscriptionPlan || 'Free Trial',
      duration: '1 Day',
      price: 0,
      finalAmount: 0,
      paymentMethod: 'Trial',
      status: 'Free Trial',
      startDate: trialStartDate,
      endDate: trialEndDate,
      isSynthesizedTrial: true,
      gymId: currentMembership?.gymId
    });
  }

  // Available Package Plans from Gym (Strength, Muscle Gain, Weight Loss, etc.)
  let rawPlans: any[] = [];
  if (gymPackages && gymPackages.length > 0) {
    rawPlans = gymPackages.map((pkg: any) => ({
      _id: pkg._id,
      name: pkg.name,
      price: pkg.monthlyPrice ?? pkg.price ?? 0,
      duration: pkg.duration || '1 Month',
      features: pkg.features,
      fitnessGoal: pkg.fitnessGoal,
      trainingType: pkg.trainingType,
      description: pkg.description,
      isPopular: pkg.isPopular
    }));
  } else {
    rawPlans = [
      {
        _id: 'default-pkg-strength',
        name: 'Strength',
        price: 399,
        duration: '1 Month',
        trainingType: 'Offline',
        fitnessGoal: 'Strength',
        features: ['Strength-focused workout programs', 'Progressive resistance training', 'Strength performance tracking']
      },
      {
        _id: 'default-pkg-muscle',
        name: 'Muscle Gain',
        price: 599,
        duration: '1 Month',
        trainingType: 'Online',
        fitnessGoal: 'Muscle Gain',
        features: ['Muscle-building workout programs', 'Strength training', 'Progressive overload training', 'Muscle development progress tracking']
      },
      {
        _id: 'default-pkg-weightloss',
        name: 'weight Loss',
        price: 499,
        duration: '1 Month',
        trainingType: 'Hybrid',
        fitnessGoal: 'Weight Loss',
        features: ['Fat-loss workout programs', 'Cardio training', 'Strength training', 'Weight and progress tracking']
      }
    ];
  }

  // Ensure Free Trial is included as the first plan option
  const hasTrialInRaw = rawPlans.some((p: any) => p.name?.toLowerCase().includes('trial') || Number(p.price) === 0);
  if (!hasTrialInRaw) {
    rawPlans = [
      {
        name: 'Free Trial',
        price: 0,
        duration: '1 Day',
        features: ['1 Day Gym Access', 'AI Fitness Assistant', 'Locker Room Access', 'Diet Plan Generator']
      },
      ...rawPlans
    ];
  }

  const availablePlans = rawPlans;

  const handleSelectPlan = (plan: any) => {
    const gymId = gym?._id || user?.gymId?._id || user?.gymId;
    navigate(`/gyms/${gymId}/checkout`, {
      state: {
        plan,
        gym: gym || { _id: gymId, name: 'Gym' }
      }
    });
  };

  const handleResendEmail = async (membershipId: string) => {
    if (!membershipId) return;
    try {
      setResendingEmail(true);
      setResendMessage('');
      const res = await api.post(`/memberships/${membershipId}/resend-email`);
      if (res.data?.success) {
        setResendMessage('Confirmation email successfully dispatched to your registered address!');
        fetchData();
      } else {
        setResendMessage(res.data?.message || 'Failed to dispatch confirmation email');
      }
    } catch (err: any) {
      setResendMessage(err.response?.data?.message || 'Error triggering email dispatch');
    } finally {
      setResendingEmail(false);
      setTimeout(() => setResendMessage(''), 6000);
    }
  };

  const handlePrintReceipt = (mem: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const gymName = gym?.name || mem.gymId?.name || 'Gymora Fitness Club';
    const customerName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Valued Member';
    const memId = mem.membershipId || `MEM-${(mem._id || '').toString().slice(-6).toUpperCase()}`;
    const recId = mem.receiptNumber || mem.orderId || `REC-${(mem._id || '').toString().slice(-6).toUpperCase()}`;
    const planName = mem.planName || 'Standard Package';
    const startDate = mem.startDate ? new Date(mem.startDate).toLocaleDateString('en-IN') : '-';
    const endDate = mem.endDate ? new Date(mem.endDate).toLocaleDateString('en-IN') : '-';
    const amount = Number(mem.finalAmount || 0);
    const price = Number(mem.price || amount);
    const tax = Number(mem.tax || 0);
    const discount = Number(mem.discount || 0);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${recId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; max-width: 720px; margin: 0 auto; }
            .header { border-bottom: 2px solid #2DD4BF; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 24px; font-weight: 800; color: #111; margin: 0; }
            .status-badge { display: inline-block; padding: 4px 12px; background: #DCFCE7; color: #15803D; font-weight: bold; font-size: 11px; border-radius: 9999px; text-transform: uppercase; }
            .grid { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
            th { text-align: left; padding: 12px; background: #F5FAFA; border-bottom: 1px solid #CBD5E1; color: #475569; text-transform: uppercase; font-size: 11px; }
            td { padding: 12px; border-bottom: 1px solid #E2E8F0; }
            .total-row td { font-size: 16px; font-weight: 800; color: #2DD4BF; border-top: 2px solid #CBD5E1; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${gymName}</h1>
              <p style="margin: 4px 0 0 0; color: #64748B; font-size: 12px;">Official Customer Membership Payment Receipt</p>
            </div>
            <div style="text-align: right;">
              <span class="status-badge">${mem.status || 'Active'}</span>
              <p style="margin: 6px 0 0 0; font-size: 12px; font-family: monospace; font-weight: bold;">Receipt #: ${recId}</p>
            </div>
          </div>

          <div class="grid">
            <div>
              <p style="margin: 0; font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: bold;">Customer Details</p>
              <p style="margin: 4px 0 0 0; font-weight: bold;">${customerName}</p>
              <p style="margin: 2px 0 0 0; color: #475569;">Email: ${user?.email || '-'}</p>
              <p style="margin: 2px 0 0 0; color: #475569;">Member ID: ${memId}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 11px; color: #64748B; text-transform: uppercase; font-weight: bold;">Validity & Plan</p>
              <p style="margin: 4px 0 0 0; font-weight: bold;">${planName}</p>
              <p style="margin: 2px 0 0 0; color: #475569;">Valid: ${startDate} to ${endDate}</p>
              <p style="margin: 2px 0 0 0; color: #475569;">Method: ${mem.paymentMethod || 'Online'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Duration</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${planName} Membership Package</strong></td>
                <td>${mem.duration || '1 Month'}</td>
                <td style="text-align: right;">₹${price.toLocaleString('en-IN')}</td>
              </tr>
              ${discount > 0 ? `
              <tr>
                <td style="color: #16A34A;">Promotional Referral Discount</td>
                <td>-</td>
                <td style="text-align: right; color: #16A34A;">-₹${discount.toLocaleString('en-IN')}</td>
              </tr>` : ''}
              ${tax > 0 ? `
              <tr>
                <td style="color: #64748B;">GST / Tax (18%)</td>
                <td>-</td>
                <td style="text-align: right;">+₹${tax.toLocaleString('en-IN')}</td>
              </tr>` : ''}
              <tr class="total-row">
                <td colspan="2">Total Paid</td>
                <td style="text-align: right;">₹${amount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            Thank you for being a valued member at ${gymName}.<br/>
            This is an electronically verified payment receipt generated by Gymora AI Gym Platform.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#2DD4BF]" size={40} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 text-[#F5FAFA]">
      {/* ── Expired / Free Trial Completed Banner ─────────────────── */}
      {(isTrialCompleted || isCurrentExpired) && (
        <div className="bg-[#141D1E] border-2 border-[#2DD4BF]/50 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/15 flex items-center justify-center text-[#2DD4BF] shrink-0 mt-0.5 border border-[#2DD4BF]/30">
              <AlertCircle size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5FAFA]">
                {isTrialCompleted ? 'Free Trial Completed' : 'Subscription Expired'}
              </h2>
              <p className="text-[#9AAEAE] text-sm mt-1">
                {isTrialCompleted 
                  ? 'Your 1-Day Free Trial has ended. Please choose a subscription plan below to unlock full gym access and member benefits.'
                  : 'Your membership plan has expired. Please select a plan below to renew your access.'}
              </p>
            </div>
          </div>
          <a
            href="#plans-section"
            className="px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold font-bold rounded-xl transition-colors text-sm shrink-0 cursor-pointer shadow-md shadow-[#2DD4BF]/25"
          >
            Choose a Plan
          </a>
        </div>
      )}

      {/* ── Active / Current Subscription Card ──────────────────── */}
      {currentMembership ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#141D1E] to-[#0E1415] border border-[#2A3A3A] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl text-[#F5FAFA]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#2DD4BF]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            {resendMessage && (
              <div className="mb-4 p-3.5 bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 text-[#F5FAFA] rounded-2xl text-xs font-semibold flex items-center justify-between animate-fade-in">
                <span>{resendMessage}</span>
                <button onClick={() => setResendMessage('')} className="text-[#9AAEAE] hover:text-white cursor-pointer"><X size={14} /></button>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-[#2DD4BF]" size={24} />
                  <h1 className="text-2xl font-bold text-[#F5FAFA]">Current Membership</h1>
                </div>
                <p className="text-xs sm:text-sm text-[#9AAEAE]">
                  Registered at <strong className="text-[#2DD4BF]">{gym?.name || currentMembership.gymId?.name || 'Your Gym'}</strong>
                </p>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {currentMembership.endDate && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#0E1415] border border-[#2A3A3A] text-[#2DD4BF] flex items-center gap-1.5 shadow-xs">
                    <Clock size={13} />
                    {(() => {
                      const daysLeft = Math.max(0, Math.ceil((new Date(currentMembership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                      return daysLeft === 0 ? 'Expiring Today' : `${daysLeft} Day${daysLeft === 1 ? '' : 's'} Remaining`;
                    })()}
                  </span>
                )}

                <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${
                  isTrialCompleted ? 'bg-[#0E1415] text-[#9AAEAE] border-[#2A3A3A]' :
                  isCurrentExpired ? 'bg-red-950/40 text-red-400 border-red-500/40' :
                  isTrial ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30' :
                  isActive ? 'bg-[#2DD4BF]/20 text-white border-[#2DD4BF]/40' : 'bg-amber-950/30 text-amber-300 border-amber-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#34D399] animate-pulse' : isCurrentExpired ? 'bg-[#F87171]' : 'bg-[#FBBF24]'}`}></span> 
                  {isTrialCompleted ? 'Free Trial Completed' :
                   isCurrentExpired ? 'Plan Expired' :
                   isTrial ? 'Free Trial Active' :
                   isActive ? 'Active' : 'Pending Verification'}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-6 bg-[#0E1415] border border-[#2A3A3A] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9AAEAE]">Plan Package</span>
                <h2 className="text-3xl font-black text-[#F5FAFA] capitalize">
                  {currentMembership.planName}
                  {isTrialCompleted && <span className="text-xs font-semibold text-[#9AAEAE] ml-2">(Ended)</span>}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[#9AAEAE] flex-wrap mt-1">
                  <span>Duration: <strong className="text-white">{currentMembership.duration || '1 Month'}</strong></span>
                  <span>•</span>
                  <span>Member ID: <strong className="font-mono text-[#2DD4BF]">{currentMembership.membershipId || ('MEM-' + currentMembership._id.slice(-6).toUpperCase())}</strong></span>
                  {currentMembership.receiptNumber && (
                    <>
                      <span>•</span>
                      <span>Receipt: <strong className="font-mono text-white">{currentMembership.receiptNumber}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#9AAEAE] block">Total Amount Paid</span>
                <div className="text-3xl font-black text-[#2DD4BF]">
                  {Number(currentMembership.finalAmount || 0) === 0 ? '₹0 (Free Trial)' : `₹${Number(currentMembership.finalAmount).toFixed(2).replace(/\.00$/, '')}`}
                </div>
                {currentMembership.tax > 0 && (
                  <span className="text-[10px] text-[#9AAEAE] block">Incl. ₹{currentMembership.tax} GST</span>
                )}
              </div>
            </div>

            {/* Quick Action Bar for Member */}
            <div className="mt-6 pt-6 border-t border-[#2A3A3A] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9AAEAE] font-semibold">Confirmation Email:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  currentMembership.confirmationEmailStatus === 'Sent'
                    ? 'bg-[#0E1415]/40 text-emerald-400 border-[#2A3A3A]/30'
                    : currentMembership.confirmationEmailStatus === 'Failed'
                    ? 'bg-red-950/40 text-red-400 border-red-500/30'
                    : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                }`}>
                  <Mail size={12} />
                  {currentMembership.confirmationEmailStatus === 'Sent' ? 'Email Sent' : currentMembership.confirmationEmailStatus === 'Failed' ? 'Email Failed' : 'Delivery Pending'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(true)}
                  className="px-3.5 py-2 bg-[#0E1415] hover:bg-[#1B2728] text-white border border-[#2A3A3A] hover:border-[#2DD4BF] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Mail size={14} className="text-[#2DD4BF]" />
                  <span>View Confirmation Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintReceipt(currentMembership)}
                  className="px-3.5 py-2 bg-[#0E1415] hover:bg-[#1B2728] text-white border border-[#2A3A3A] hover:border-[#2DD4BF] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer size={14} className="text-[#2DD4BF]" />
                  <span>Download / Print Receipt</span>
                </button>

                <button
                  type="button"
                  disabled={resendingEmail}
                  onClick={() => handleResendEmail(currentMembership._id)}
                  className="px-3.5 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#2DD4BF]/20 disabled:opacity-50"
                >
                  {resendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Resend Email</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 shadow-sm text-[#F5FAFA]">
              <h3 className="text-xl font-bold text-[#F5FAFA] mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#2DD4BF]" /> Included Package Features
              </h3>
              <ul className="space-y-3">
                {((currentMembership.features && currentMembership.features.length > 0)
                  ? currentMembership.features
                  : ['Full Gym Facility Access', 'AI Fitness Assistant', 'Locker Room Access', 'Group Classes', 'Diet Plan Generator']
                ).map((benefit: string, i: number) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#34D399] shrink-0" />
                    <span className="text-[#F5FAFA] text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 flex flex-col justify-between shadow-sm text-[#F5FAFA]">
              <div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-4">Membership Validity &amp; Payment</h3>
                <div className="flex items-center gap-4 p-4 border border-[#2A3A3A] bg-[#0E1415] rounded-xl mb-4">
                  <div className="w-12 h-10 bg-[#141D1E] border border-[#2A3A3A] rounded-lg flex items-center justify-center text-xs font-bold text-[#2DD4BF]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-[#9AAEAE] text-xs">Start Date &amp; Time</p>
                    <p className="text-[#F5FAFA] font-bold text-xs sm:text-sm">
                      {currentMembership.startDate ? new Date(currentMembership.startDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Pending'}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-medium text-[#9AAEAE] text-xs">Expiry Date</p>
                    <p className="text-[#2DD4BF] font-bold text-xs sm:text-sm">
                      {currentMembership.endDate ? new Date(currentMembership.endDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Pending'}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border border-[#2A3A3A] bg-[#0E1415] rounded-xl mb-4 text-xs sm:text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#9AAEAE]">Payment Method:</span>
                    <span className="text-[#F5FAFA] font-bold">{currentMembership.paymentMethod || 'Trial'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9AAEAE]">Payment Status:</span>
                    <span className="text-[#34D399] font-bold">{isActive ? 'Verified & Successful' : currentMembership.status}</span>
                  </div>
                  {currentMembership.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-[#9AAEAE]">Transaction Reference:</span>
                      <span className="font-mono text-[#F5FAFA]">{currentMembership.paymentReference}</span>
                    </div>
                  )}
                </div>
                
                {!isActive && !isCurrentExpired && (
                  <p className="text-xs text-amber-300 flex items-start gap-2 mt-4 bg-amber-950/30 p-3 rounded-xl border border-amber-500/30">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
                    Your manual payment is currently being verified by the gym owner.
                  </p>
                )}
                {(isCurrentExpired || isTrialCompleted) && (
                  <div className="mt-4 p-3 bg-[#0E1415] border border-[#2DD4BF]/40 rounded-xl flex items-center justify-between gap-3">
                    <span className="text-xs text-[#2DD4BF]">Renew now to ensure uninterrupted gym access.</span>
                    <a
                      href="#plans-section"
                      className="px-3.5 py-1.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs font-bold rounded-lg shadow-sm"
                    >
                      Renew
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto text-center py-12 bg-[#141D1E] rounded-2xl border border-[#2A3A3A] shadow-sm text-[#F5FAFA]">
          <CreditCard size={48} className="mx-auto text-[#9AAEAE] mb-4" />
          <h2 className="text-2xl font-bold text-[#F5FAFA] mb-2">No Active Subscription</h2>
          <p className="text-[#9AAEAE]">You don't have an active membership plan right now.</p>
        </div>
      )}

      {/* ── Choose Subscription Plan Section ────────────────────── */}
      <div id="plans-section" className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm text-[#F5FAFA]">
        <div className="border-b border-[#2A3A3A] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF]">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5FAFA]">
                {isTrialCompleted || isCurrentExpired ? 'Choose a Membership Plan' : 'Upgrade Membership Plan'}
              </h2>
              <p className="text-xs text-[#9AAEAE]">
                Select the plan that fits your workout routine and goals at {gym?.name || 'your gym'}.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          {availablePlans.map((p: any, idx: number) => {
            const isTrialPlan = p.name?.toLowerCase().includes('trial') || Number(p.price) === 0;
            const isPopular = !isTrialPlan && (p.name?.toLowerCase().includes('pro') || idx === 2);
            const featuresList = (typeof p.features === 'string')
              ? p.features.split(/[\n,]/).map((f: string) => f.trim()).filter(Boolean)
              : (Array.isArray(p.features) ? p.features : ['Full Gym Access', 'Trainer Guidance', 'AI Workout Planner']);

            return (
              <div 
                key={p._id || idx}
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-2xl border-2 ${
                  isTrialPlan
                    ? (isTrialCompleted ? 'bg-[#0E1415] border-[#2A3A3A]' : 'bg-[#141D1E] border-[#2A3A3A] hover:border-[#2DD4BF]')
                    : (isPopular ? 'bg-[#1B2728] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/10' : 'bg-[#0E1415] border-[#2A3A3A] hover:border-[#2DD4BF]/50')
                }`}
              >
                {isTrialPlan && (
                  <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wide ${
                    isTrialCompleted ? 'bg-[#141D1E] text-[#9AAEAE] border border-[#2A3A3A]' : 'bg-[#2DD4BF] text-white'
                  }`}>
                    {isTrialCompleted ? 'Trial Completed' : (isTrial ? 'Active Trial' : '1 Day Free')}
                  </span>
                )}

                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2DD4BF] text-[#0E1415] text-[10px] font-black px-3.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                    Recommended Plan
                  </span>
                )}

                <div>
                  <h3 className={`text-xl font-bold capitalize mb-1 ${isPopular ? 'text-[#2DD4BF]' : 'text-[#F5FAFA]'}`}>{p.name}</h3>
                  <p className="text-xs text-[#9AAEAE] mb-4">Duration: <strong className="text-[#F5FAFA]">{p.duration || '1 Day'}</strong></p>

                  <div className="mb-6">
                    {isTrialPlan ? (
                      <div>
                        <span className="text-3xl font-black text-[#2DD4BF]">₹0</span>
                        <span className="text-xs text-[#9AAEAE] font-semibold ml-1.5">(Free Trial)</span>
                      </div>
                    ) : (
                      <div>
                        <span className={`text-3xl font-black ${isPopular ? 'text-[#2DD4BF]' : 'text-[#F5FAFA]'}`}>₹{Number(p.price).toLocaleString('en-IN')}</span>
                        <span className="text-xs text-[#9AAEAE] font-semibold ml-1">/{p.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-6 text-sm text-[#9AAEAE]">
                    {featuresList.slice(0, 6).map((feat: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <Check size={16} className={`${isPopular ? 'text-[#2DD4BF]' : 'text-[#34D399]'} shrink-0 mt-0.5`} />
                        <span className="text-xs leading-relaxed text-[#F5FAFA]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isTrialPlan ? (
                  isTrialCompleted ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl font-bold text-xs bg-[#141D1E] border border-[#2A3A3A] text-[#9AAEAE] cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Check size={16} />
                      <span>Free Trial Completed</span>
                    </button>
                  ) : isTrial ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl font-bold text-xs bg-[#141D1E] border border-[#2DD4BF]/40 text-[#2DD4BF] cursor-default flex items-center justify-center gap-1.5"
                    >
                      <Check size={16} />
                      <span>Active Free Trial</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(p)}
                      className="w-full py-3 rounded-xl font-bold text-xs bg-[#141D1E] border border-[#2A3A3A] text-[#F5FAFA] hover:border-[#2DD4BF] hover:text-[#2DD4BF] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Zap size={16} />
                      <span>Start Free Trial</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleSelectPlan(p)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer ${
                      isPopular
                        ? 'bg-[#2DD4BF] text-white hover:bg-[#5EEAD4] shadow-md shadow-[#2DD4BF]/25'
                        : 'bg-[#0E1415] border border-[#2A3A3A] text-[#F5FAFA] hover:border-[#2DD4BF] hover:text-[#2DD4BF]'
                    }`}
                  >
                    <Sparkles size={16} />
                    <span>Select &amp; Subscribe</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Free Trial & Subscription History Section ───────────────── */}
      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm text-[#F5FAFA]">
        <div className="flex items-center justify-between border-b border-[#2A3A3A] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF]">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#F5FAFA]">Free Trial &amp; Subscription History</h2>
              <p className="text-xs text-[#9AAEAE]">Complete record of your trial periods, past memberships, and payments.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#2DD4BF] bg-[#0E1415] border border-[#2A3A3A] px-3 py-1 rounded-full">
            {allHistory.length} Record{allHistory.length === 1 ? '' : 's'}
          </span>
        </div>

        {allHistory.length === 0 ? (
          <div className="text-center py-8 text-[#9AAEAE] text-sm">
            No trial or subscription history records found.
          </div>
        ) : (
          <div className="space-y-4">
            {allHistory.map((item, idx) => {
              const itemIsTrial = item.status === 'Free Trial' || item.paymentMethod === 'Trial' || item.price === 0 || item.isSynthesizedTrial;
              const itemIsExpiredOrCompleted = item.endDate ? new Date(item.endDate) < now : false;
              const hasActivePaidPlan = memberships.some(m => m.status === 'Active');
              const itemTrialCompleted = itemIsTrial && (itemIsExpiredOrCompleted || hasActivePaidPlan || isCurrentExpired);

              let statusText = item.status;
              let statusClass = 'bg-[#141D1E] text-[#9AAEAE] border-[#2A3A3A]';

              if (itemIsTrial) {
                if (itemTrialCompleted) {
                  statusText = 'Free Trial Completed';
                  statusClass = 'bg-[#141D1E] text-[#9AAEAE] border-[#2A3A3A]';
                } else {
                  statusText = 'Free Trial Active';
                  statusClass = 'bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30';
                }
              } else if (item.status === 'Active') {
                if (itemIsExpiredOrCompleted) {
                  statusText = 'Expired';
                  statusClass = 'bg-red-950/40 text-red-400 border-red-500/30';
                } else {
                  statusText = 'Active';
                  statusClass = 'bg-[#0E1415]/40 text-emerald-400 border-[#2A3A3A]/30';
                }
              } else if (item.status === 'Payment Verification Pending') {
                statusText = 'Pending Verification';
                statusClass = 'bg-amber-950/40 text-amber-300 border-amber-500/30';
              } else if (item.status === 'Expired') {
                statusText = 'Expired';
                statusClass = 'bg-red-950/40 text-red-400 border-red-500/30';
              }

              return (
                <div key={item._id || idx} className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-5 hover:border-[#2DD4BF]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-[#F5FAFA] text-base capitalize">{item.planName}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusClass}`}>
                        {statusText}
                      </span>
                      {itemIsTrial && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2DD4BF] bg-[#2DD4BF]/15 px-2 py-0.5 rounded-md border border-[#2DD4BF]/30">
                          <Sparkles size={12} /> 1 Day Free Trial
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#9AAEAE] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> Duration: {item.duration || '1 Day'}
                      </span>
                      <span>•</span>
                      <span>Payment: <strong className="text-[#F5FAFA]">{item.paymentMethod || 'Trial'}</strong></span>
                      {item.paymentReference && <span>• Ref: {item.paymentReference}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#2A3A3A]">
                    <div className="text-left md:text-right text-xs">
                      <span className="text-[#9AAEAE] block">Period</span>
                      <span className="font-bold text-[#F5FAFA]">
                        {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#9AAEAE] block">Amount</span>
                      <span className="text-lg font-bold text-[#2DD4BF]">
                        {Number(item.finalAmount || 0) === 0 ? '₹0 (Free Trial)' : `₹${Number(item.finalAmount).toFixed(2).replace(/\.00$/, '')}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedHistoryItem({
                        ...item,
                        statusText,
                        statusClass,
                        itemIsTrial,
                        itemTrialCompleted
                      })}
                      className="px-3.5 py-2 bg-[#141D1E] hover:bg-[#1B2728] text-[#F5FAFA] border border-[#2A3A3A] hover:border-[#2DD4BF] font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Subscription View Details Modal ───────────────────────────── */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#141D1E] rounded-3xl w-full max-w-lg shadow-2xl border border-[#2A3A3A] overflow-hidden flex flex-col max-h-[90vh] text-[#F5FAFA]">
            {/* Modal Header */}
            <div className="bg-[#0E1415] p-6 border-b border-[#2A3A3A] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2DD4BF] text-[#06201D] font-bold flex items-center justify-center font-bold shadow-md shadow-[#2DD4BF]/30">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#F5FAFA]">Subscription Details</h3>
                  <p className="text-xs text-[#9AAEAE]">Full breakdown of membership record &amp; payment status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryItem(null)}
                className="p-2 text-[#9AAEAE] hover:text-[#F5FAFA] hover:bg-[#1B2728] rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Plan Header Card */}
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#9AAEAE] block">Plan Name</span>
                  <h4 className="text-xl font-black text-[#F5FAFA] capitalize mt-0.5">
                    {selectedHistoryItem.planName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${selectedHistoryItem.statusClass}`}>
                      {selectedHistoryItem.statusText}
                    </span>
                    {selectedHistoryItem.itemIsTrial && (
                      <span className="text-[11px] font-semibold text-[#2DD4BF] bg-[#2DD4BF]/15 px-2 py-0.5 rounded-md border border-[#2DD4BF]/30 flex items-center gap-1">
                        <Sparkles size={11} /> 1 Day Free Trial
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#9AAEAE] block">Total Amount</span>
                  <span className="text-2xl font-black text-[#2DD4BF]">
                    {Number(selectedHistoryItem.finalAmount || 0) === 0
                      ? '₹0'
                      : `₹${Number(selectedHistoryItem.finalAmount).toFixed(2).replace(/\.00$/, '')}`}
                  </span>
                </div>
              </div>

              {/* Detailed Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0E1415] p-3.5 rounded-xl border border-[#2A3A3A]">
                  <span className="text-[#9AAEAE] font-semibold block mb-1">Billing Duration</span>
                  <span className="font-bold text-[#F5FAFA] text-sm">{selectedHistoryItem.duration || '1 Month'}</span>
                </div>

                <div className="bg-[#0E1415] p-3.5 rounded-xl border border-[#2A3A3A]">
                  <span className="text-[#9AAEAE] font-semibold block mb-1">Payment Method</span>
                  <span className="font-bold text-[#F5FAFA] text-sm">{selectedHistoryItem.paymentMethod || 'Trial'}</span>
                </div>

                <div className="bg-[#0E1415] p-3.5 rounded-xl border border-[#2A3A3A]">
                  <span className="text-[#9AAEAE] font-semibold block mb-1">Start Date</span>
                  <span className="font-bold text-[#F5FAFA]">
                    {selectedHistoryItem.startDate ? new Date(selectedHistoryItem.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>

                <div className="bg-[#0E1415] p-3.5 rounded-xl border border-[#2A3A3A]">
                  <span className="text-[#9AAEAE] font-semibold block mb-1">Expiry / End Date</span>
                  <span className="font-bold text-[#F5FAFA]">
                    {selectedHistoryItem.endDate ? new Date(selectedHistoryItem.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Transaction Reference & Metadata */}
              <div className="bg-[#0E1415] p-3.5 rounded-xl border border-[#2A3A3A] space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#2A3A3A]">
                  <span className="text-[#9AAEAE]">Transaction / Reference ID</span>
                  <span className="font-mono font-bold text-[#F5FAFA]">
                    {selectedHistoryItem.paymentReference || selectedHistoryItem._id || 'TRIAL-INV-001'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#2A3A3A]">
                  <span className="text-[#9AAEAE]">Base Plan Price</span>
                  <span className="font-bold text-[#F5FAFA]">
                    ₹{Number(selectedHistoryItem.price || selectedHistoryItem.finalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedHistoryItem.discount && Number(selectedHistoryItem.discount) > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-[#2A3A3A] text-emerald-400">
                    <span>Applied Discount</span>
                    <span className="font-bold">-₹{Number(selectedHistoryItem.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 text-sm font-black text-[#F5FAFA]">
                  <span>Net Paid Amount</span>
                  <span className="text-[#2DD4BF]">
                    {Number(selectedHistoryItem.finalAmount || 0) === 0 ? '₹0 (Free Trial)' : `₹${Number(selectedHistoryItem.finalAmount).toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              {/* Plan Inclusions / Features */}
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-4">
                <h5 className="text-xs font-extrabold uppercase text-[#9AAEAE] tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#2DD4BF]" /> Included In This Membership
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#F5FAFA]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#2DD4BF]" /> 24/7 Gym &amp; Floor Access
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#2DD4BF]" /> AI Fitness Assistant
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#2DD4BF]" /> Workout Tracking
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#2DD4BF]" /> Diet Plan Generator
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0E1415] border-t border-[#2A3A3A] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHistoryItem(null)}
                className="px-6 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Email Preview Modal ───────────────────────── */}
      {showEmailPreviewModal && currentMembership && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0E1415] rounded-3xl w-full max-w-2xl shadow-2xl border border-[#2A3A3A] overflow-hidden flex flex-col max-h-[92vh] text-[#F5FAFA]">
            {/* Modal Header */}
            <div className="bg-[#141D1E] p-5 border-b border-[#2A3A3A] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF]">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#F5FAFA]">Membership Purchase Confirmation Email</h3>
                  <p className="text-xs text-[#9AAEAE]">Electronic copy dispatched to {user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="p-2 text-[#9AAEAE] hover:text-[#F5FAFA] hover:bg-[#2A3A3A] rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Email Container Layout */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              <div className="text-center p-5 bg-[#141D1E] border border-[#2A3A3A] rounded-2xl">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0E1415]/60 text-emerald-400 border border-[#2A3A3A]/30">
                  Payment Verified &amp; Active
                </span>
                <h2 className="text-2xl font-black text-white mt-2">{gym?.name || currentMembership.gymId?.name || 'Our Fitness Center'}</h2>
                <p className="text-xs text-[#9AAEAE]">Official Membership Purchase Confirmation &amp; Receipt</p>
              </div>

              <div className="space-y-2 text-[#9AAEAE] leading-relaxed">
                <p className="text-sm text-white font-bold">Dear {user?.firstName} {user?.lastName},</p>
                <p>
                  Thank you for purchasing a membership at <strong className="text-white">{gym?.name || 'our gym'}</strong>. 
                  Your payment has been successfully verified, and your membership is now <strong className="text-emerald-400">Active</strong>.
                </p>
              </div>

              {/* Customer Details Box */}
              <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-4">
                <span className="text-[10px] font-black text-[#2DD4BF] uppercase tracking-wider block mb-2">Customer &amp; Gym Details</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#9AAEAE] block">Customer Name</span>
                    <strong className="text-white">{user?.firstName} {user?.lastName}</strong>
                  </div>
                  <div>
                    <span className="text-[#9AAEAE] block">Customer ID</span>
                    <strong className="text-[#2DD4BF] font-mono">CUST-{(user?._id || '').slice(-6).toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-[#9AAEAE] block">Registered Email</span>
                    <span className="text-white">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-[#9AAEAE] block">Gym Contact</span>
                    <span className="text-white">{gym?.phone || gym?.email || 'Reception Available'}</span>
                  </div>
                </div>
              </div>

              {/* Membership Details Box */}
              <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-[#2A3A3A] pb-2">
                  <span className="text-[10px] font-black text-[#2DD4BF] uppercase tracking-wider">Membership Details</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#9AAEAE] block">Membership ID</span>
                    <strong className="text-[#2DD4BF] font-mono">{currentMembership.membershipId || ('MEM-' + currentMembership._id.slice(-6).toUpperCase())}</strong>
                  </div>
                  <div>
                    <span className="text-[#9AAEAE] block">Package Name</span>
                    <strong className="text-white">{currentMembership.planName}</strong>
                  </div>
                  <div>
                    <span className="text-[#9AAEAE] block">Duration</span>
                    <span className="text-white">{currentMembership.duration || '1 Month'}</span>
                  </div>
                  <div>
                    <span className="text-[#9AAEAE] block">Expiry Date</span>
                    <strong className="text-[#2DD4BF]">{currentMembership.endDate ? new Date(currentMembership.endDate).toLocaleDateString() : 'N/A'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#2A3A3A]">
                  <span className="text-[11px] font-bold text-[#9AAEAE] uppercase block mb-1.5">Included Benefits:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-white">
                    {((currentMembership.features && currentMembership.features.length > 0)
                      ? currentMembership.features
                      : ['Full Gym Facility Access', 'AI Fitness Assistant', 'Locker Room Access', 'Workout Tracking']
                    ).map((f: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Check size={13} className="text-[#2DD4BF]" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Details Box */}
              <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-4 space-y-2 text-xs">
                <span className="text-[10px] font-black text-[#2DD4BF] uppercase tracking-wider block mb-1">Payment Receipt</span>
                <div className="flex justify-between py-1 border-b border-[#2A3A3A]">
                  <span className="text-[#9AAEAE]">Order / Receipt #</span>
                  <span className="font-mono text-white font-bold">{currentMembership.receiptNumber || currentMembership.orderId || 'REC-CURRENT'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2A3A3A]">
                  <span className="text-[#9AAEAE]">Transaction Reference</span>
                  <span className="font-mono text-white">{currentMembership.paymentReference || 'TXN-ONLINE'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2A3A3A]">
                  <span className="text-[#9AAEAE]">Payment Mode</span>
                  <span className="text-white">{currentMembership.paymentMethod || 'Online'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2A3A3A]">
                  <span className="text-[#9AAEAE]">Base Package Price</span>
                  <span className="text-white">₹{Number(currentMembership.price || currentMembership.finalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                {currentMembership.discount > 0 && (
                  <div className="flex justify-between py-1 border-b border-[#2A3A3A] text-emerald-400">
                    <span>Discount Applied</span>
                    <span>-₹{Number(currentMembership.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {currentMembership.tax > 0 && (
                  <div className="flex justify-between py-1 border-b border-[#2A3A3A] text-[#9AAEAE]">
                    <span>Taxes &amp; GST (18%)</span>
                    <span>+₹{Number(currentMembership.tax).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-sm font-black text-white">
                  <span>Final Amount Paid</span>
                  <span className="text-[#2DD4BF]">₹{Number(currentMembership.finalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Guidelines Box */}
              <div className="p-4 bg-[#141D1E] border-l-4 border-[#2DD4BF] rounded-r-2xl text-xs text-[#9AAEAE] space-y-1">
                <p className="font-bold text-white">Important Membership Information:</p>
                <p>• Show your Membership ID at the gym front desk upon arrival.</p>
                <p>• Automated reminders will notify you 7 days, 3 days, and on the day of expiry.</p>
                <p>• Renewals can be completed directly from this dashboard.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#141D1E] border-t border-[#2A3A3A] flex justify-between items-center">
              <button
                type="button"
                onClick={() => handlePrintReceipt(currentMembership)}
                className="px-4 py-2 bg-[#0E1415] hover:bg-[#222] text-white border border-[#2A3A3A] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} className="text-[#2DD4BF]" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-6 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberSubscription;