import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, AlertCircle, Loader2, Calendar, History, Sparkles, Clock, Check, Zap, Eye, X, Receipt, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';

const MemberSubscription = () => {
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [gym, setGym] = useState<any>(null);
  const [gymPackages, setGymPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);

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

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#A991D4]" size={40} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* ── Expired / Free Trial Completed Banner ─────────────────── */}
      {(isTrialCompleted || isCurrentExpired) && (
        <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/10 border-2 border-[#A991D4] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#A991D4]/10 flex items-center justify-center text-[#A991D4] shrink-0 mt-0.5">
              <AlertCircle size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#292431]">
                {isTrialCompleted ? 'Free Trial Completed' : 'Subscription Expired'}
              </h2>
              <p className="text-[#6B5E78] text-sm mt-1">
                {isTrialCompleted 
                  ? 'Your 1-Day Free Trial has ended. Please choose a subscription plan below to unlock full gym access and member benefits.'
                  : 'Your membership plan has expired. Please select a plan below to renew your access.'}
              </p>
            </div>
          </div>
          <a
            href="#plans-section"
            className="px-5 py-2.5 bg-[#A991D4] text-[#292431] font-bold rounded-xl hover:bg-[#967CC5] transition-colors text-sm shrink-0 cursor-pointer shadow-sm"
          >
            Choose a Plan
          </a>
        </div>
      )}

      {/* ── Active / Current Subscription Card ──────────────────── */}
      {currentMembership ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFA] border border-[#E5DDEB] rounded-2xl p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A991D4]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-[#A991D4]" size={24} />
                  <h1 className="text-2xl font-bold text-[#292431]">Membership Plan</h1>
                </div>
                <p className="text-[#6B5E78]">Manage your membership and billing details for <strong className="text-[#292431]">{gym?.name || currentMembership.gymId?.name || 'Your Gym'}</strong></p>
              </div>
              
              <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border ${
                isTrialCompleted ? 'bg-slate-100 text-slate-700 border-slate-300' :
                isCurrentExpired ? 'bg-rose-100 text-rose-700 border-rose-200' :
                isTrial ? 'bg-purple-100 text-purple-700 border-purple-200' :
                isActive ? 'bg-[#A991D4]/10 text-[#A991D4] border-[#A991D4]/20' : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#A991D4] animate-pulse' : isCurrentExpired ? 'bg-rose-500' : 'bg-yellow-500'}`}></span> 
                {isTrialCompleted ? 'Free Trial Completed' :
                 isCurrentExpired ? 'Plan Expired' :
                 isTrial ? 'Free Trial Active' :
                 isActive ? 'Active' : 'Pending Verification'}
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
              <div>
                <h2 className="text-3xl font-bold text-[#292431] mb-1 capitalize">
                  {currentMembership.planName}
                  {isTrialCompleted && <span className="text-sm font-semibold text-slate-500 ml-2">(Ended)</span>}
                </h2>
                <p className="text-[#6B5E78]">Duration: {currentMembership.duration || '1 Day'}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#A991D4]">
                  {Number(currentMembership.finalAmount || 0) === 0 ? '₹0 (Free Trial)' : `₹${Number(currentMembership.finalAmount).toFixed(2).replace(/\.00$/, '')}`}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#292431] mb-4">Plan Benefits</h3>
              <ul className="space-y-3">
                {['24/7 Gym Access', 'AI Fitness Assistant', 'Locker Room Access', 'Group Classes', 'Diet Plan Generator'].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#A991D4]" />
                    <span className="text-[#6B5E78]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-[#292431] mb-4">Membership Details</h3>
                <div className="flex items-center gap-4 p-4 border border-[#E5DDEB] bg-[#F8FAFA] rounded-xl mb-4">
                  <div className="w-12 h-10 bg-[#E9DFF4] rounded-lg flex items-center justify-center text-xs font-bold text-[#292431]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-[#6B5E78] text-xs">Start Date</p>
                    <p className="text-[#292431] font-bold">{currentMembership.startDate ? new Date(currentMembership.startDate).toLocaleDateString() : 'Pending'}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-medium text-[#6B5E78] text-xs">End Date</p>
                    <p className="text-[#292431] font-bold">{currentMembership.endDate ? new Date(currentMembership.endDate).toLocaleDateString() : 'Pending'}</p>
                  </div>
                </div>
                
                <div className="p-4 border border-[#E5DDEB] bg-[#F8FAFA] rounded-xl mb-4 text-sm">
                  <p className="text-[#6B5E78] mb-1">Payment Method: <span className="text-[#A991D4] font-bold">{currentMembership.paymentMethod || 'Trial'}</span></p>
                  {currentMembership.paymentReference && (
                    <p className="text-[#6B5E78]">Reference ID: <span className="text-[#292431] font-semibold">{currentMembership.paymentReference}</span></p>
                  )}
                </div>
                
                {!isActive && !isCurrentExpired && (
                  <p className="text-sm text-yellow-600 flex items-start gap-2 mt-4 bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    Your manual payment is currently being verified by the gym owner.
                  </p>
                )}
                {isCurrentExpired && (
                  <p className="text-sm text-rose-600 flex items-start gap-2 mt-4 bg-rose-50 p-3 rounded-xl border border-rose-200">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    Your membership period is completed. Please choose a plan below to renew.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto text-center py-12 bg-[#FFFFFF] rounded-2xl border border-[#E5DDEB] shadow-sm">
          <CreditCard size={48} className="mx-auto text-[#555] mb-4" />
          <h2 className="text-2xl font-bold text-[#292431] mb-2">No Active Subscription</h2>
          <p className="text-[#6B5E78]">You don't have an active membership plan right now.</p>
        </div>
      )}

      {/* ── Choose Subscription Plan Section ────────────────────── */}
      <div id="plans-section" className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-[#E5DDEB] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#A991D4]">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#292431]">
                {isTrialCompleted || isCurrentExpired ? 'Choose a Membership Plan' : 'Upgrade Membership Plan'}
              </h2>
              <p className="text-xs text-[#6B5E78]">
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
                className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-lg border-2 ${
                  isTrialPlan
                    ? (isTrialCompleted ? 'bg-[#FAFAFA] border-slate-300' : 'bg-[#FAF5FF] border-purple-300 hover:border-purple-400')
                    : (isPopular ? 'bg-[#F7F4FA] border-[#A991D4] shadow-md shadow-purple-900/10' : 'bg-[#F7F4FA] border-[#E5DDEB] hover:border-[#A991D4]/50')
                }`}
              >
                {isTrialPlan && (
                  <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wide ${
                    isTrialCompleted ? 'bg-slate-500' : 'bg-purple-600'
                  }`}>
                    {isTrialCompleted ? 'Trial Completed' : (isTrial ? 'Active Trial' : '1 Day Free')}
                  </span>
                )}

                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#A991D4] text-[#292431] text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-[#292431] capitalize mb-1">{p.name}</h3>
                  <p className="text-xs text-[#6B5E78] mb-4">Duration: <strong className="text-[#292431]">{p.duration || '1 Day'}</strong></p>

                  <div className="mb-6">
                    {isTrialPlan ? (
                      <div>
                        <span className="text-3xl font-black text-purple-700">₹0</span>
                        <span className="text-xs text-[#6B5E78] font-semibold ml-1.5">(Free Trial)</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-3xl font-black text-[#292431]">₹{Number(p.price).toLocaleString('en-IN')}</span>
                        <span className="text-xs text-[#6B5E78] font-semibold ml-1">/{p.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-6 text-sm text-[#6B5E78]">
                    {featuresList.slice(0, 6).map((feat: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <Check size={16} className={`${isTrialPlan ? 'text-purple-600' : 'text-[#A991D4]'} shrink-0 mt-0.5`} />
                        <span className="text-xs leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {isTrialPlan ? (
                  isTrialCompleted ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl font-bold text-xs bg-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Check size={16} />
                      <span>Free Trial Completed</span>
                    </button>
                  ) : isTrial ? (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl font-bold text-xs bg-purple-100 border border-purple-300 text-purple-700 cursor-default flex items-center justify-center gap-1.5"
                    >
                      <Check size={16} />
                      <span>Active Free Trial</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(p)}
                      className="w-full py-3 rounded-xl font-bold text-xs bg-purple-600 text-white hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
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
                        ? 'bg-[#A991D4] text-[#292431] hover:bg-[#967CC5] shadow-md shadow-purple-900/15'
                        : 'bg-white border-2 border-[#A991D4] text-[#A991D4] hover:bg-[#A991D4] hover:text-[#292431]'
                    }`}
                  >
                    <Sparkles size={16} />
                    <span>Subscribe Now</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Free Trial & Subscription History Section ───────────────── */}
      <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E5DDEB] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#292431]">Free Trial &amp; Subscription History</h2>
              <p className="text-xs text-[#6B5E78]">Complete record of your trial periods, past memberships, and payments.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-[#F7F4FA] px-3 py-1 rounded-full">
            {allHistory.length} Record{allHistory.length === 1 ? '' : 's'}
          </span>
        </div>

        {allHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
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
              let statusClass = 'bg-gray-100 text-gray-700 border-gray-200';

              if (itemIsTrial) {
                if (itemTrialCompleted) {
                  statusText = 'Free Trial Completed';
                  statusClass = 'bg-slate-100 text-slate-700 border-slate-300';
                } else {
                  statusText = 'Free Trial Active';
                  statusClass = 'bg-purple-100 text-purple-800 border-purple-200';
                }
              } else if (item.status === 'Active') {
                if (itemIsExpiredOrCompleted) {
                  statusText = 'Expired';
                  statusClass = 'bg-rose-100 text-rose-800 border-rose-200';
                } else {
                  statusText = 'Active';
                  statusClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                }
              } else if (item.status === 'Payment Verification Pending') {
                statusText = 'Pending Verification';
                statusClass = 'bg-amber-100 text-amber-800 border-amber-200';
              } else if (item.status === 'Expired') {
                statusText = 'Expired';
                statusClass = 'bg-rose-100 text-rose-800 border-rose-200';
              }

              return (
                <div key={item._id || idx} className="bg-[#F8FAFA] border border-[#E5DDEB] rounded-2xl p-5 hover:border-[#A991D4]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-[#292431] text-base capitalize">{item.planName}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusClass}`}>
                        {statusText}
                      </span>
                      {itemIsTrial && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          <Sparkles size={12} /> 1 Day Free Trial
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6B5E78] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> Duration: {item.duration || '1 Day'}
                      </span>
                      <span>•</span>
                      <span>Payment: <strong className="text-[#292431]">{item.paymentMethod || 'Trial'}</strong></span>
                      {item.paymentReference && <span>• Ref: {item.paymentReference}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-200">
                    <div className="text-left md:text-right text-xs">
                      <span className="text-[#6B5E78] block">Period</span>
                      <span className="font-bold text-[#292431]">
                        {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#6B5E78] block">Amount</span>
                      <span className="text-lg font-bold text-[#A991D4]">
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
                      className="px-3.5 py-2 bg-[#F7F4FA] hover:bg-[#E9DFF4]/40 text-[#A991D4] hover:text-[#967CC5] border border-[#E9DFF4] font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#E5DDEB] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-[#E9DFF4] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#A991D4] text-[#292431] flex items-center justify-center font-bold shadow-md shadow-orange-900/10">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#292431]">Subscription Details</h3>
                  <p className="text-xs text-[#6B5E78]">Full breakdown of membership record &amp; payment status</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryItem(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Plan Header Card */}
              <div className="bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6B5E78] block">Plan Name</span>
                  <h4 className="text-xl font-black text-[#292431] capitalize mt-0.5">
                    {selectedHistoryItem.planName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${selectedHistoryItem.statusClass}`}>
                      {selectedHistoryItem.statusText}
                    </span>
                    {selectedHistoryItem.itemIsTrial && (
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 flex items-center gap-1">
                        <Sparkles size={11} /> 1 Day Free Trial
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#6B5E78] block">Total Amount</span>
                  <span className="text-2xl font-black text-[#A991D4]">
                    {Number(selectedHistoryItem.finalAmount || 0) === 0
                      ? '₹0'
                      : `₹${Number(selectedHistoryItem.finalAmount).toFixed(2).replace(/\.00$/, '')}`}
                  </span>
                </div>
              </div>

              {/* Detailed Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#F8FAFA] p-3.5 rounded-xl border border-[#E5DDEB]">
                  <span className="text-[#6B5E78] font-semibold block mb-1">Billing Duration</span>
                  <span className="font-bold text-[#292431] text-sm">{selectedHistoryItem.duration || '1 Month'}</span>
                </div>

                <div className="bg-[#F8FAFA] p-3.5 rounded-xl border border-[#E5DDEB]">
                  <span className="text-[#6B5E78] font-semibold block mb-1">Payment Method</span>
                  <span className="font-bold text-[#292431] text-sm">{selectedHistoryItem.paymentMethod || 'Trial'}</span>
                </div>

                <div className="bg-[#F8FAFA] p-3.5 rounded-xl border border-[#E5DDEB]">
                  <span className="text-[#6B5E78] font-semibold block mb-1">Start Date</span>
                  <span className="font-bold text-[#292431]">
                    {selectedHistoryItem.startDate ? new Date(selectedHistoryItem.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>

                <div className="bg-[#F8FAFA] p-3.5 rounded-xl border border-[#E5DDEB]">
                  <span className="text-[#6B5E78] font-semibold block mb-1">Expiry / End Date</span>
                  <span className="font-bold text-[#292431]">
                    {selectedHistoryItem.endDate ? new Date(selectedHistoryItem.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Transaction Reference & Metadata */}
              <div className="bg-[#F8FAFA] p-3.5 rounded-xl border border-[#E5DDEB] space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-[#6B5E78]">Transaction / Reference ID</span>
                  <span className="font-mono font-bold text-[#292431]">
                    {selectedHistoryItem.paymentReference || selectedHistoryItem._id || 'TRIAL-INV-001'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-[#6B5E78]">Base Plan Price</span>
                  <span className="font-bold text-[#292431]">
                    ₹{Number(selectedHistoryItem.price || selectedHistoryItem.finalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedHistoryItem.discount && Number(selectedHistoryItem.discount) > 0 && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 text-emerald-700">
                    <span>Applied Discount</span>
                    <span className="font-bold">-₹{Number(selectedHistoryItem.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-1 text-sm font-black text-[#292431]">
                  <span>Net Paid Amount</span>
                  <span className="text-[#A991D4]">
                    {Number(selectedHistoryItem.finalAmount || 0) === 0 ? '₹0 (Free Trial)' : `₹${Number(selectedHistoryItem.finalAmount).toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              {/* Plan Inclusions / Features */}
              <div className="bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl p-4">
                <h5 className="text-xs font-extrabold uppercase text-[#6B5E78] tracking-wider mb-2.5 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#A991D4]" /> Included In This Membership
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#292431]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#A991D4]" /> 24/7 Gym &amp; Floor Access
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#A991D4]" /> AI Fitness Assistant
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#A991D4]" /> Workout Tracking
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#A991D4]" /> Diet Plan Generator
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-[#E5DDEB] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHistoryItem(null)}
                className="px-6 py-2.5 bg-[#292431] hover:bg-black text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
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