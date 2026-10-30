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
            .header { border-bottom: 2px solid #F97316; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 24px; font-weight: 800; color: #111; margin: 0; }
            .status-badge { display: inline-block; padding: 4px 12px; background: #DCFCE7; color: #15803D; font-weight: bold; font-size: 11px; border-radius: 9999px; text-transform: uppercase; }
            .grid { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
            th { text-align: left; padding: 12px; background: #111827; border-bottom: 1px solid #CBD5E1; color: #475569; text-transform: uppercase; font-size: 11px; }
            td { padding: 12px; border-bottom: 1px solid #E2E8F0; }
            .total-row td { font-size: 16px; font-weight: 800; color: #F97316; border-top: 2px solid #CBD5E1; }
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
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#EA580C]" size={40} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 text-[#111827]">
      {/* ── Expired / Free Trial Completed Banner ─────────────────── */}
      {(isTrialCompleted || isCurrentExpired) && (
        <div className="bg-[#FFFFFF] border-2 border-[#FFEDD5] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] flex items-center justify-center text-[#EA580C] shrink-0 mt-0.5 border border-[#FFEDD5]">
              <AlertCircle size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827]">
                {isTrialCompleted ? 'Free Trial Completed' : 'Subscription Expired'}
              </h2>
              <p className="text-[#64748B] text-sm mt-1">
                {isTrialCompleted 
                  ? 'Your 1-Day Free Trial has ended. Please choose a subscription plan below to unlock full gym access and member benefits.'
                  : 'Your membership plan has expired. Please select a plan below to renew your access.'}
              </p>
            </div>
          </div>
          <a
            href="#plans-section"
            className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold font-bold rounded-xl transition-colors text-sm shrink-0 cursor-pointer shadow-md shadow-orange-500/15"
          >
            Choose a Plan
          </a>
        </div>
      )}

      {/* ── Active / Current Subscription Card ──────────────────── */}
      {currentMembership ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFC] border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl text-[#111827]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFF7ED] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            {resendMessage && (
              <div className="mb-4 p-3.5 bg-[#FFF7ED] border border-[#FFEDD5] text-[#111827] rounded-2xl text-xs font-semibold flex items-center justify-between animate-fade-in">
                <span>{resendMessage}</span>
                <button onClick={() => setResendMessage('')} className="text-[#64748B] hover:text-[#C2410C] cursor-pointer"><X size={14} /></button>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-[#EA580C]" size={24} />
                  <h1 className="text-2xl font-bold text-[#111827]">Current Membership</h1>
                </div>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  Registered at <strong className="text-[#EA580C]">{gym?.name || currentMembership.gymId?.name || 'Your Gym'}</strong>
                </p>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {currentMembership.endDate && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#F8FAFC] border border-[#E2E8F0] text-[#EA580C] flex items-center gap-1.5 shadow-xs">
                    <Clock size={13} />
                    {(() => {
                      const daysLeft = Math.max(0, Math.ceil((new Date(currentMembership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                      return daysLeft === 0 ? 'Expiring Today' : `${daysLeft} Day${daysLeft === 1 ? '' : 's'} Remaining`;
                    })()}
                  </span>
                )}

                <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border ${
                  isTrialCompleted ? 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]' :
                  isCurrentExpired ? 'bg-red-50 text-[#B91C1C] border-red-500/40' :
                  isTrial ? 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]' :
                  isActive ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]' : 'bg-amber-50 text-amber-600 border-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#15803D] animate-pulse' : isCurrentExpired ? 'bg-[#B91C1C]' : 'bg-[#B45309]'}`}></span> 
                  {isTrialCompleted ? 'Free Trial Completed' :
                   isCurrentExpired ? 'Plan Expired' :
                   isTrial ? 'Free Trial Active' :
                   isActive ? 'Active' : 'Pending Verification'}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-6 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Plan Package</span>
                <h2 className="text-3xl font-black text-[#111827] capitalize">
                  {currentMembership.planName}
                  {isTrialCompleted && <span className="text-xs font-semibold text-[#64748B] ml-2">(Ended)</span>}
                </h2>
                <div className="flex items-center gap-3 text-xs text-[#64748B] flex-wrap mt-1">
                  <span>Duration: <strong className="text-[#111827]">{currentMembership.duration || '1 Month'}</strong></span>
                  <span>•</span>
                  <span>Member ID: <strong className="font-mono text-[#EA580C]">{currentMembership.membershipId || ('MEM-' + currentMembership._id.slice(-6).toUpperCase())}</strong></span>
                  {currentMembership.receiptNumber && (
                    <>
                      <span>•</span>
                      <span>Receipt: <strong className="font-mono text-[#111827]">{currentMembership.receiptNumber}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-left md:text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] block">Total Amount Paid</span>
                <div className="text-3xl font-black text-[#EA580C]">
                  {Number(currentMembership.finalAmount || 0) === 0 ? '₹0 (Free Trial)' : `₹${Number(currentMembership.finalAmount).toFixed(2).replace(/\.00$/, '')}`}
                </div>
                {currentMembership.tax > 0 && (
                  <span className="text-[10px] text-[#64748B] block">Incl. ₹{currentMembership.tax} GST</span>
                )}
              </div>
            </div>

            {/* Quick Action Bar for Member */}
            <div className="mt-6 pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748B] font-semibold">Confirmation Email:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  currentMembership.confirmationEmailStatus === 'Sent'
                    ? 'bg-[#FFF7ED] text-[#15803D] border-[#E2E8F0]/30'
                    : currentMembership.confirmationEmailStatus === 'Failed'
                    ? 'bg-red-50 text-[#B91C1C] border-red-500/30'
                    : 'bg-amber-50 text-amber-300 border-amber-500/30'
                }`}>
                  <Mail size={12} />
                  {currentMembership.confirmationEmailStatus === 'Sent' ? 'Email Sent' : currentMembership.confirmationEmailStatus === 'Failed' ? 'Email Failed' : 'Delivery Pending'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(true)}
                  className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#C2410C] border border-[#E2E8F0] hover:border-[#FDBA74] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Mail size={14} className="text-[#EA580C]" />
                  <span>View Confirmation Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintReceipt(currentMembership)}
                  className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#C2410C] border border-[#E2E8F0] hover:border-[#FDBA74] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer size={14} className="text-[#EA580C]" />
                  <span>Download / Print Receipt</span>
                </button>

                <button
                  type="button"
                  disabled={resendingEmail}
                  onClick={() => handleResendEmail(currentMembership._id)}
                  className="px-3.5 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/15 disabled:opacity-50"
                >
                  {resendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Resend Email</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm text-[#111827]">
              <h3 className="text-xl font-bold text-[#111827] mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#EA580C]" /> Included Package Features
              </h3>
              <ul className="space-y-3">
                {((currentMembership.features && currentMembership.features.length > 0)
                  ? currentMembership.features
                  : ['Full Gym Facility Access', 'AI Fitness Assistant', 'Locker Room Access', 'Group Classes', 'Diet Plan Generator']
                ).map((benefit: string, i: number) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#15803D] shrink-0" />
                    <span className="text-[#111827] text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col justify-between shadow-sm text-[#111827]">
              <div>
                <h3 className="text-xl font-bold text-[#111827] mb-4">Membership Validity &amp; Payment</h3>
                <div className="flex items-center gap-4 p-4 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl mb-4">
                  <div className="w-12 h-10 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg flex items-center justify-center text-xs font-bold text-[#EA580C]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-[#64748B] text-xs">Start Date &amp; Time</p>
                    <p className="text-[#111827] font-bold text-xs sm:text-sm">
                      {currentMembership.startDate ? new Date(currentMembership.startDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Pending'}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-medium text-[#64748B] text-xs">Expiry Date</p>
                    <p className="text-[#EA580C] font-bold text-xs sm:text-sm">
                      {currentMembership.endDate ? new Date(currentMembership.endDate).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Pending'}
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl mb-4 text-xs sm:text-sm space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Payment Method:</span>
                    <span className="text-[#111827] font-bold">{currentMembership.paymentMethod || 'Trial'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Payment Status:</span>
                    <span className="text-[#15803D] font-bold">{isActive ? 'Verified & Successful' : currentMembership.status}</span>
                  </div>
                  {currentMembership.paymentReference && (
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Transaction Reference:</span>
                      <span className="font-mono text-[#111827]">{currentMembership.paymentReference}</span>
                    </div>
                  )}
                </div>
                
                {!isActive && !isCurrentExpired && (
                  <p className="text-xs text-amber-300 flex items-start gap-2 mt-4 bg-amber-50 p-3 rounded-xl border border-amber-500/30">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#B45309]" />
                    Your manual payment is currently being verified by the gym owner.
                  </p>
                )}
                {(isCurrentExpired || isTrialCompleted) && (
                  <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#FFEDD5] rounded-xl flex items-center justify-between gap-3">
                    <span className="text-xs text-[#EA580C]">Renew now to ensure uninterrupted gym access.</span>
                    <a
                      href="#plans-section"
                      className="px-3.5 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs font-bold rounded-lg shadow-sm"
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
        <div className="max-w-4xl mx-auto text-center py-12 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-sm text-[#111827]">
          <CreditCard size={48} className="mx-auto text-[#64748B] mb-4" />
          <h2 className="text-2xl font-bold text-[#111827] mb-2">No Active Subscription</h2>
          <p className="text-[#64748B]">You don't have an active membership plan right now.</p>
        </div>
      )}

      {/* ── Choose Subscription Plan Section ────────────────────── */}
      <div id="plans-section" className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm text-[#111827]">
        <div className="border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827]">
                {isTrialCompleted || isCurrentExpired ? 'Choose a Membership Plan' : 'Upgrade Membership Plan'}
              </h2>
              <p className="text-xs text-[#64748B]">
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
                    ? (isTrialCompleted ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#FDBA74]')
                    : (isPopular ? 'bg-[#F8FAFC] border-[#FDBA74] shadow-lg shadow-orange-500/15' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#FFEDD5]')
                }`}
              >
                {isTrialPlan && (
                  <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wide ${
                    isTrialCompleted ? 'bg-[#FFFFFF] text-[#64748B] border border-[#E2E8F0]' : 'bg-[#C2410C] text-white'
                  }`}>
                    {isTrialCompleted ? 'Trial Completed' : (isTrial ? 'Active Trial' : '1 Day Free')}
                  </span>
                )}

                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C2410C] text-[#F8FAFC] text-[10px] font-black px-3.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                    Recommended Plan
                  </span>
                )}

                <div>
                  <h3 className={`text-xl font-bold capitalize mb-1 ${isPopular ? 'text-[#EA580C]' : 'text-[#111827]'}`}>{p.name}</h3>
                  <p className="text-xs text-[#64748B] mb-4">Duration: <strong className="text-[#111827]">{p.duration || '1 Day'}</strong></p>

                  <div className="mb-6">
                    {isTrialPlan ? (
                      <div>
                        <span className="text-3xl font-black text-[#EA580C]">₹0</span>
                        <span className="text-xs text-[#64748B] font-semibold ml-1.5">(Free Trial)</span>
                      </div>
                    ) : (
                      <div>
                        <span className={`text-3xl font-black ${isPopular ? 'text-[#EA580C]' : 'text-[#111827]'}`}>₹{Number(p.price).toLocaleString('en-IN')}</span>
                        <span className="text-xs text-[#64748B] font-semibold ml-1">/{p.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-6 text-sm text-[#64748B]">
                    {featuresList.slice(0, 6).map((feat: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <Check size={16} className={`${isPopular ? 'text-[#EA580C]' : 'text-[#15803D]'} shrink-0 mt-0.5`} />
                        <span className="text-xs leading-relaxed text-[#111827]">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isTrialPlan ? (
                  isTrialCompleted ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl font-bold text-xs bg-[#FFFFFF] border border-[#E2E8F0] text-[#64748B] cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Check size={16} />
                      <span>Free Trial Completed</span>
                    </button>
                  ) : isTrial ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl font-bold text-xs bg-[#FFFFFF] border border-[#FFEDD5] text-[#EA580C] cursor-default flex items-center justify-center gap-1.5"
                    >
                      <Check size={16} />
                      <span>Active Free Trial</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(p)}
                      className="w-full py-3 rounded-xl font-bold text-xs bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Zap size={16} />
                      <span>Start Free Trial</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => handleSelectPlan(p)}
                    className="w-full py-3 rounded-xl font-bold text-xs bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15 transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
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
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm text-[#111827]">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827]">Free Trial &amp; Subscription History</h2>
              <p className="text-xs text-[#64748B]">Complete record of your trial periods, past memberships, and payments.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#EA580C] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1 rounded-full">
            {allHistory.length} Record{allHistory.length === 1 ? '' : 's'}
          </span>
        </div>

        {allHistory.length === 0 ? (
          <div className="text-center py-8 text-[#64748B] text-sm">
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
              let statusClass = 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0]';

              if (itemIsTrial) {
                if (itemTrialCompleted) {
                  statusText = 'Free Trial Completed';
                  statusClass = 'bg-[#FFFFFF] text-[#64748B] border-[#E2E8F0]';
                } else {
                  statusText = 'Free Trial Active';
                  statusClass = 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]';
                }
              } else if (item.status === 'Active') {
                if (itemIsExpiredOrCompleted) {
                  statusText = 'Expired';
                  statusClass = 'bg-red-50 text-[#B91C1C] border-red-500/30';
                } else {
                  statusText = 'Active';
                  statusClass = 'bg-[#FFF7ED] text-[#15803D] border-[#E2E8F0]/30';
                }
              } else if (item.status === 'Payment Verification Pending') {
                statusText = 'Pending Verification';
                statusClass = 'bg-amber-50 text-amber-300 border-amber-500/30';
              } else if (item.status === 'Expired') {
                statusText = 'Expired';
                statusClass = 'bg-red-50 text-[#B91C1C] border-red-500/30';
              }

              return (
                <div key={item._id || idx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#FFEDD5] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-[#111827] text-base capitalize">{item.planName}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusClass}`}>
                        {statusText}
                      </span>
                      {itemIsTrial && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-md border border-[#FFEDD5]">
                          <Sparkles size={12} /> 1 Day Free Trial
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#64748B] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> Duration: {item.duration || '1 Day'}
                      </span>
                      <span>•</span>
                      <span>Payment: <strong className="text-[#111827]">{item.paymentMethod || 'Trial'}</strong></span>
                      {item.paymentReference && <span>• Ref: {item.paymentReference}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#E2E8F0]">
                    <div className="text-left md:text-right text-xs">
                      <span className="text-[#64748B] block">Period</span>
                      <span className="font-bold text-[#111827]">
                        {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#64748B] block">Amount</span>
                      <span className="text-lg font-bold text-[#EA580C]">
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
                      className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#111827] border border-[#E2E8F0] hover:border-[#FDBA74] font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
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
          <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-lg shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh] text-[#111827]">
            {/* Modal Header */}
            <div className="bg-[#F8FAFC] p-6 border-b border-[#E2E8F0] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C2410C] text-white font-bold flex items-center justify-center font-bold shadow-md shadow-orange-500/15">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#111827]">Subscription Details</h3>
                  <p className="text-xs text-[#64748B]">Full breakdown of membership record &amp; payment status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryItem(null)}
                className="p-2 text-[#64748B] hover:text-[#111827] hover:bg-[#FFF7ED] rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Plan Header Card */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">Plan Name</span>
                  <h4 className="text-xl font-black text-[#111827] capitalize mt-0.5">
                    {selectedHistoryItem.planName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${selectedHistoryItem.statusClass}`}>
                      {selectedHistoryItem.statusText}
                    </span>
                    {selectedHistoryItem.itemIsTrial && (
                      <span className="text-[11px] font-semibold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-md border border-[#FFEDD5] flex items-center gap-1">
                        <Sparkles size={11} /> 1 Day Free Trial
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">Total Amount</span>
                  <span className="text-2xl font-black text-[#EA580C]">
                    {Number(selectedHistoryItem.finalAmount || 0) === 0
                      ? '₹0'
                      : `₹${Number(selectedHistoryItem.finalAmount).toFixed(2).replace(/\.00$/, '')}`}
                  </span>
                </div>
              </div>

              {/* Detailed Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B] font-semibold block mb-1">Billing Duration</span>
                  <span className="font-bold text-[#111827] text-sm">{selectedHistoryItem.duration || '1 Month'}</span>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B] font-semibold block mb-1">Payment Method</span>
                  <span className="font-bold text-[#111827] text-sm">{selectedHistoryItem.paymentMethod || 'Trial'}</span>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B] font-semibold block mb-1">Start Date</span>
                  <span className="font-bold text-[#111827]">
                    {selectedHistoryItem.startDate ? new Date(selectedHistoryItem.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[#64748B] font-semibold block mb-1">Expiry / End Date</span>
                  <span className="font-bold text-[#111827]">
                    {selectedHistoryItem.endDate ? new Date(selectedHistoryItem.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Transaction Reference & Metadata */}
              <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Transaction / Reference ID</span>
                  <span className="font-mono font-bold text-[#111827]">
                    {selectedHistoryItem.paymentReference || selectedHistoryItem._id || 'TRIAL-INV-001'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Base Plan Price</span>
                  <span className="font-bold text-[#111827]">
                    ₹{Number(selectedHistoryItem.price || selectedHistoryItem.finalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedHistoryItem.discount && Number(selectedHistoryItem.discount) > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-[#E2E8F0] text-[#15803D]">
                    <span>Applied Discount</span>
                    <span className="font-bold">-₹{Number(selectedHistoryItem.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 text-sm font-black text-[#111827]">
                  <span>Net Paid Amount</span>
                  <span className="text-[#EA580C]">
                    {Number(selectedHistoryItem.finalAmount || 0) === 0 ? '₹0 (Free Trial)' : `₹${Number(selectedHistoryItem.finalAmount).toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              {/* Plan Inclusions / Features */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4">
                <h5 className="text-xs font-extrabold uppercase text-[#64748B] tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#EA580C]" /> Included In This Membership
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#111827]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#EA580C]" /> 24/7 Gym &amp; Floor Access
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#EA580C]" /> AI Fitness Assistant
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#EA580C]" /> Workout Tracking
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#EA580C]" /> Diet Plan Generator
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHistoryItem(null)}
                className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
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
          <div className="bg-[#F8FAFC] rounded-3xl w-full max-w-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[92vh] text-[#111827]">
            {/* Modal Header */}
            <div className="bg-[#FFFFFF] p-5 border-b border-[#E2E8F0] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C]">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111827]">Membership Purchase Confirmation Email</h3>
                  <p className="text-xs text-[#64748B]">Electronic copy dispatched to {user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="p-2 text-[#64748B] hover:text-[#111827] hover:bg-[#E2E8F0] rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Email Container Layout */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              <div className="text-center p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/30">
                  Payment Verified &amp; Active
                </span>
                <h2 className="text-2xl font-black text-[#111827] mt-2">{gym?.name || currentMembership.gymId?.name || 'Our Fitness Center'}</h2>
                <p className="text-xs text-[#64748B]">Official Membership Purchase Confirmation &amp; Receipt</p>
              </div>

              <div className="space-y-2 text-[#64748B] leading-relaxed">
                <p className="text-sm text-[#111827] font-bold">Dear {user?.firstName} {user?.lastName},</p>
                <p>
                  Thank you for purchasing a membership at <strong className="text-[#111827]">{gym?.name || 'our gym'}</strong>. 
                  Your payment has been successfully verified, and your membership is now <strong className="text-[#15803D]">Active</strong>.
                </p>
              </div>

              {/* Customer Details Box */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4">
                <span className="text-[10px] font-black text-[#EA580C] uppercase tracking-wider block mb-2">Customer &amp; Gym Details</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Customer Name</span>
                    <strong className="text-[#111827]">{user?.firstName} {user?.lastName}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Customer ID</span>
                    <strong className="text-[#EA580C] font-mono">CUST-{(user?._id || '').slice(-6).toUpperCase()}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Registered Email</span>
                    <span className="text-[#111827]">{user?.email}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Gym Contact</span>
                    <span className="text-[#111827]">{gym?.phone || gym?.email || 'Reception Available'}</span>
                  </div>
                </div>
              </div>

              {/* Membership Details Box */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-2">
                  <span className="text-[10px] font-black text-[#EA580C] uppercase tracking-wider">Membership Details</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Membership ID</span>
                    <strong className="text-[#EA580C] font-mono">{currentMembership.membershipId || ('MEM-' + currentMembership._id.slice(-6).toUpperCase())}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Package Name</span>
                    <strong className="text-[#111827]">{currentMembership.planName}</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Duration</span>
                    <span className="text-[#111827]">{currentMembership.duration || '1 Month'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Expiry Date</span>
                    <strong className="text-[#EA580C]">{currentMembership.endDate ? new Date(currentMembership.endDate).toLocaleDateString() : 'N/A'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0]">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase block mb-1.5">Included Benefits:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#1F2937]">
                    {((currentMembership.features && currentMembership.features.length > 0)
                      ? currentMembership.features
                      : ['Full Gym Facility Access', 'AI Fitness Assistant', 'Locker Room Access', 'Workout Tracking']
                    ).map((f: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Check size={13} className="text-[#EA580C]" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Details Box */}
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 space-y-2 text-xs">
                <span className="text-[10px] font-black text-[#EA580C] uppercase tracking-wider block mb-1">Payment Receipt</span>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Order / Receipt #</span>
                  <span className="font-mono text-[#111827] font-bold">{currentMembership.receiptNumber || currentMembership.orderId || 'REC-CURRENT'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Transaction Reference</span>
                  <span className="font-mono text-[#111827]">{currentMembership.paymentReference || 'TXN-ONLINE'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Payment Mode</span>
                  <span className="text-[#111827]">{currentMembership.paymentMethod || 'Online'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E2E8F0]">
                  <span className="text-[#64748B]">Base Package Price</span>
                  <span className="text-[#111827]">₹{Number(currentMembership.price || currentMembership.finalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                {currentMembership.discount > 0 && (
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0] text-[#15803D]">
                    <span>Discount Applied</span>
                    <span>-₹{Number(currentMembership.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {currentMembership.tax > 0 && (
                  <div className="flex justify-between py-1 border-b border-[#E2E8F0] text-[#64748B]">
                    <span>Taxes &amp; GST (18%)</span>
                    <span>+₹{Number(currentMembership.tax).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-sm font-black text-[#111827]">
                  <span>Final Amount Paid</span>
                  <span className="text-[#EA580C]">₹{Number(currentMembership.finalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Guidelines Box */}
              <div className="p-4 bg-[#FFFFFF] border-l-4 border-[#FDBA74] rounded-r-2xl text-xs text-[#64748B] space-y-1">
                <p className="font-bold text-[#111827]">Important Membership Information:</p>
                <p>• Show your Membership ID at the gym front desk upon arrival.</p>
                <p>• Automated reminders will notify you 7 days, 3 days, and on the day of expiry.</p>
                <p>• Renewals can be completed directly from this dashboard.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FFFFFF] border-t border-[#E2E8F0] flex justify-between items-center">
              <button
                type="button"
                onClick={() => handlePrintReceipt(currentMembership)}
                className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#111827] border border-[#E2E8F0] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} className="text-[#EA580C]" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="px-6 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
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