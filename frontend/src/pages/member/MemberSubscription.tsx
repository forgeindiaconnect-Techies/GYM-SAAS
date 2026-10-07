import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Loader2, Calendar, History, Sparkles, Clock } from 'lucide-react';
import api from '../../utils/api';

const MemberSubscription = () => {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      setMemberships(memRes.data?.memberships || []);
      setUser(userRes.data?.user || null);
    } catch (err) {
      console.error('Error fetching subscription data', err);
    } finally {
      setLoading(false);
    }
  };

  const activeMembership = memberships.find(m => (m.status === 'Active' || m.status === 'Free Trial') && (!m.endDate || new Date(m.endDate) >= new Date()));
  const pendingMembership = memberships.find(m => m.status === 'Payment Verification Pending');
  const currentMembership = activeMembership || pendingMembership || memberships[0];

  const isActive = currentMembership && (currentMembership.status === 'Active' || currentMembership.status === 'Free Trial');

  // Synthesize history list including Free Trial if not explicitly in CustomerMembership collection
  const allHistory = [...memberships];
  const hasTrialRecord = allHistory.some(m => m.status === 'Free Trial' || m.paymentMethod === 'Trial' || m.price === 0);

  if (!hasTrialRecord && (user?.subscriptionStatus === 'Free Trial' || user?.createdAt)) {
    const trialStartDate = user?.createdAt ? new Date(user.createdAt) : new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 1);

    allHistory.push({
      _id: 'derived-free-trial',
      planName: user?.subscriptionPlan || 'Gold Plan (Free Trial)',
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

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#F97316]" size={40} /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* ── Active / Current Subscription Card ──────────────────── */}
      {currentMembership ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFA] border border-[#E7E5E4] rounded-2xl p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F97316]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-[#F97316]" size={24} />
                  <h1 className="text-2xl font-bold text-[#292524]">Current Subscription</h1>
                </div>
                <p className="text-[#78716C]">Manage your membership and billing details for <strong className="text-[#292524]">{currentMembership.gymId?.name || 'Gym'}</strong></p>
              </div>
              
              <div className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border ${
                currentMembership.status === 'Free Trial' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                isActive ? 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20' : 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#F97316] animate-pulse' : 'bg-yellow-500'}`}></span> 
                {currentMembership.status === 'Free Trial' ? 'Free Trial Active' : isActive ? 'Active' : 'Pending Verification'}
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
              <div>
                <h2 className="text-3xl font-bold text-[#292524] mb-1 capitalize">{currentMembership.planName}</h2>
                <p className="text-[#78716C]">Duration: {currentMembership.duration}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#F97316]">₹{Number(currentMembership.finalAmount || 0).toFixed(2).replace(/\.00$/, '')}</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#292524] mb-4">Plan Benefits</h3>
              <ul className="space-y-3">
                {['24/7 Gym Access', 'AI Fitness Assistant', 'Locker Room Access', 'Group Classes', 'Diet Plan Generator'].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-[#F97316]" />
                    <span className="text-[#78716C]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-xl font-bold text-[#292524] mb-4">Membership Details</h3>
                <div className="flex items-center gap-4 p-4 border border-[#E7E5E4] bg-[#F8FAFA] rounded-xl mb-4">
                  <div className="w-12 h-10 bg-[#FED7AA] rounded-lg flex items-center justify-center text-xs font-bold text-[#292524]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-[#78716C] text-xs">Start Date</p>
                    <p className="text-[#292524] font-bold">{currentMembership.startDate ? new Date(currentMembership.startDate).toLocaleDateString() : 'Pending'}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="font-medium text-[#78716C] text-xs">End Date</p>
                    <p className="text-[#292524] font-bold">{currentMembership.endDate ? new Date(currentMembership.endDate).toLocaleDateString() : 'Pending'}</p>
                  </div>
                </div>
                
                <div className="p-4 border border-[#E7E5E4] bg-[#F8FAFA] rounded-xl mb-4 text-sm">
                  <p className="text-[#78716C] mb-1">Payment Method: <span className="text-[#F97316] font-bold">{currentMembership.paymentMethod || 'Manual'}</span></p>
                  {currentMembership.paymentMethod === 'Bank Transfer' && currentMembership.paymentReference && (
                    <p className="text-[#78716C]">Reference ID: <span className="text-[#292524] font-semibold">{currentMembership.paymentReference}</span></p>
                  )}
                </div>
                
                {!isActive && (
                  <p className="text-sm text-yellow-600 flex items-start gap-2 mt-4 bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    Your manual payment is currently being verified by the gym owner.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto text-center py-12 bg-[#FFFFFF] rounded-2xl border border-[#E7E5E4] shadow-sm">
          <CreditCard size={48} className="mx-auto text-[#555] mb-4" />
          <h2 className="text-2xl font-bold text-[#292524] mb-2">No Active Subscription</h2>
          <p className="text-[#78716C]">You don't have an active membership plan right now.</p>
        </div>
      )}

      {/* ── Free Trial & Subscription History Section ───────────────── */}
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#292524]">Free Trial &amp; Subscription History</h2>
              <p className="text-xs text-[#78716C]">Complete record of your trial periods, past memberships, and payments.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-[#FFFDF8] px-3 py-1 rounded-full">
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
              const isTrial = item.status === 'Free Trial' || item.paymentMethod === 'Trial' || item.price === 0 || item.isSynthesizedTrial;
              const isExpiredOrCompleted = item.endDate ? new Date(item.endDate) < new Date() : false;
              const hasActivePaidPlan = memberships.some(m => m.status === 'Active');
              const isTrialCompleted = isTrial && (isExpiredOrCompleted || hasActivePaidPlan);

              let statusText = item.status;
              let statusClass = 'bg-gray-100 text-gray-700 border-gray-200';

              if (isTrial) {
                if (isTrialCompleted) {
                  statusText = 'Free Trial Completed';
                  statusClass = 'bg-slate-100 text-slate-700 border-slate-300';
                } else {
                  statusText = 'Free Trial Active';
                  statusClass = 'bg-purple-100 text-purple-800 border-purple-200';
                }
              } else if (item.status === 'Active') {
                statusText = 'Active';
                statusClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
              } else if (item.status === 'Payment Verification Pending') {
                statusText = 'Pending Verification';
                statusClass = 'bg-amber-100 text-amber-800 border-amber-200';
              } else if (item.status === 'Expired') {
                statusText = 'Expired';
                statusClass = 'bg-rose-100 text-rose-800 border-rose-200';
              }

              return (
                <div key={item._id || idx} className="bg-[#F8FAFA] border border-[#E7E5E4] rounded-2xl p-5 hover:border-[#F97316]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-[#292524] text-base capitalize">{item.planName}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusClass}`}>
                        {statusText}
                      </span>
                      {isTrial && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                          <Sparkles size={12} /> 1 Day Free Trial
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#78716C] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> Duration: {item.duration || '1 Day'}
                      </span>
                      <span>•</span>
                      <span>Payment: <strong className="text-[#292524]">{item.paymentMethod || 'Trial'}</strong></span>
                      {item.paymentReference && <span>• Ref: {item.paymentReference}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-200">
                    <div className="text-left md:text-right text-xs">
                      <span className="text-[#78716C] block">Period</span>
                      <span className="font-bold text-[#292524]">
                        {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#78716C] block">Amount</span>
                      <span className="text-lg font-bold text-[#F97316]">
                        {Number(item.finalAmount || 0) === 0 ? '₹0 (Free Trial)' : `₹${Number(item.finalAmount).toFixed(2).replace(/\.00$/, '')}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberSubscription;