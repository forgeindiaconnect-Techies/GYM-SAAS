import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bot, Dumbbell, TrendingUp, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membershipsRes, paymentsRes] = await Promise.all([
        api.get('/memberships/my'),
        api.get('/payments/my-history').catch(() => ({ data: { payments: [] } }))
      ]);
      setMemberships(membershipsRes.data.memberships || []);
      setPayments(paymentsRes.data.payments || []);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const activeMembership = memberships.find(m => (m.status === 'Active' || m.status === 'Free Trial') && (!m.endDate || new Date(m.endDate) >= new Date()));
  const expiredMembership = memberships.find(m => m.status === 'Expired' || ((m.status === 'Active' || m.status === 'Free Trial') && m.endDate && new Date(m.endDate) < new Date()));
  const hasActive = !!activeMembership;
  
  const pendingMembership = !hasActive ? memberships.find(m => m.status === 'Payment Verification Pending') : null;
  const rejectedMembership = !hasActive ? memberships.find(m => m.status === 'Rejected') : null;
  const rejectedPayment = payments.find(p => p.status === 'Rejected');
  
  // Calculate trial days remaining if it's a free trial
  const isTrial = activeMembership?.status === 'Free Trial';
  let trialDaysRemaining = 0;
  if (isTrial && activeMembership.endDate) {
    const end = new Date(activeMembership.endDate).getTime();
    const now = new Date().getTime();
    trialDaysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  useEffect(() => {
    if (!loading && !activeMembership && (expiredMembership || user?.subscriptionStatus === 'Expired')) {
      setShowExpiredPopup(true);
    }
  }, [loading, activeMembership, expiredMembership, user]);

  const quickLinks = [
    { icon: Bot, label: 'AI Assistant', desc: 'Chat with your AI coach', path: '/member/ai-assistant', color: 'text-[#164A4A] bg-[#164A4A]/10 border-[#164A4A]' },
    { icon: Dumbbell, label: 'Log Workout', desc: 'Track today\'s session', path: '/member/workout', color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]' },
    { icon: TrendingUp, label: 'My Progress', desc: 'View body analytics', path: '/member/progress', color: 'text-[#aa3bff] bg-[#aa3bff]/10 border-[#aa3bff]' },
    { icon: Calendar, label: 'Book Class', desc: 'Reserve your spot', path: '/member/bookings', color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]' },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, <span className="text-[#164A4A]">{user?.firstName}!</span></h1>
          <p className="text-[#455250]">Here's your fitness overview for today.</p>
        </div>
        
        {hasActive ? (
          <div className="flex items-center space-x-4 bg-[#FFFFFF] px-6 py-3.5 rounded-2xl border border-[#D3DFDA] shadow-sm shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#F1F5F3] flex items-center justify-center">
              <MapPin className="text-[#164A4A]" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-[#A8ADA9] font-bold uppercase tracking-widest mb-0.5">Current Gym</p>
              <p className="font-bold text-[#202828] leading-tight">{activeMembership?.gymId?.name || 'N/A'}</p>
            </div>
          </div>
        ) : pendingMembership ? (
           <div className="flex items-center space-x-4 bg-yellow-50 border border-yellow-200 px-6 py-3.5 rounded-2xl shadow-sm shrink-0">
             <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
               <AlertCircle className="text-yellow-600" size={20} />
             </div>
             <div>
               <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest mb-0.5">Subscription Status</p>
               <p className="font-bold text-yellow-800 leading-tight">Payment Verification Pending</p>
               <p className="text-xs text-yellow-700 mt-0.5">Your payment is being verified.</p>
             </div>
           </div>
        ) : (rejectedMembership || user?.subscriptionStatus?.toUpperCase() === 'REJECTED') ? (
           <div className="flex items-center space-x-4 bg-red-50 border border-red-200 px-6 py-3.5 rounded-2xl shadow-sm shrink-0">
             <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
               <AlertCircle className="text-red-600" size={20} />
             </div>
             <div>
               <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-0.5">Subscription Status</p>
               <p className="font-bold text-red-800 leading-tight">Payment Rejected</p>
               <p className="text-xs text-red-700 mt-0.5">Please retry your payment.</p>
             </div>
           </div>
        ) : null}
      </div>

      {/* Free Trial Banner */}
      {isTrial && (
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-green-800 mb-1">Subscription Status: Free Trial</h3>
              <p className="text-green-700">
                Trial Ends: {new Date(activeMembership.endDate).toLocaleDateString()}
              </p>
              <p className="text-[#164A4A] font-semibold mt-1">{trialDaysRemaining} Days Remaining</p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <p className="text-sm text-green-700 mb-2">Current Plan: <strong>{activeMembership.planName}</strong></p>
              <Link to="/member/upgrade" className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg">
                Upgrade Subscription
              </Link>
            </div>
          </div>
        </div>
      )}

      {!hasActive && !pendingMembership && (user?.subscriptionStatus?.toUpperCase() === 'EXPIRED') && (
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-10 text-center mb-10 shadow-xl">
          <AlertCircle size={48} className="mx-auto text-[#6fa3a0] mb-4" />
          <h2 className="text-2xl font-bold text-[#202828] mb-2">Your subscription has expired</h2>
          <p className="text-[#455250] mb-6 max-w-md mx-auto">Please renew your membership to continue accessing your AI GYM dashboard and features.</p>
          <Link to="/member/upgrade" className="inline-block px-8 py-3 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-all hover:scale-105">
            Renew Membership
          </Link>
        </div>
      )}

      {!hasActive && !pendingMembership && (rejectedMembership || user?.subscriptionStatus?.toUpperCase() === 'REJECTED') && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-10 text-center mb-10 shadow-xl">
          <AlertCircle size={48} className="mx-auto text-[#6fa3a0] mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Payment Rejected</h2>
          <p className="text-red-700 mb-4 max-w-md mx-auto">
            Unfortunately, your gym owner has rejected your recent subscription payment.
          </p>
          {rejectedPayment?.rejectionReason && (
            <div className="bg-white p-4 rounded-lg inline-block border border-red-100 text-sm font-semibold text-red-800 mb-6">
              Reason: {rejectedPayment.rejectionReason}
            </div>
          )}
          <br />
          <Link to="/member/upgrade" className="inline-block px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all hover:scale-105 shadow-lg shadow-red-200">
            Retry Payment
          </Link>
        </div>
      )}

      {!hasActive && !pendingMembership && user?.subscriptionStatus?.toUpperCase() !== 'EXPIRED' && !rejectedMembership && user?.subscriptionStatus?.toUpperCase() !== 'REJECTED' && (
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-10 text-center mb-10 shadow-xl">
          <MapPin size={48} className="mx-auto text-[#555] mb-4" />
          <h2 className="text-2xl font-bold text-[#202828] mb-2">You haven't joined a gym yet</h2>
          <p className="text-[#455250] mb-6 max-w-md mx-auto">Discover premium gyms near you, select a membership plan, and unlock all features of the AI GYM platform.</p>
          <Link to="/gyms" className="inline-block px-8 py-3 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-all hover:scale-105">
            Browse Gyms
          </Link>
        </div>
      )}

      {pendingMembership && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-10 text-center mb-10 shadow-xl">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Verification in Progress</h2>
          <p className="text-yellow-700 max-w-lg mx-auto">
            You have submitted a manual payment for <span className="font-bold text-yellow-900">{pendingMembership.gymId?.name}</span>. 
            The gym administration is currently verifying your payment. Once approved, your dashboard will automatically unlock.
          </p>
        </div>
      )}

      {hasActive && (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {quickLinks.map((item, i) => (
              <Link key={i} to={item.path} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-5 hover:-translate-y-1 transition-transform group cursor-pointer block">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.color}`}><item.icon size={20} /></div>
                <h3 className="font-semibold text-[#202828] group-hover:text-[#164A4A] transition transition-colors">{item.label}</h3>
                <p className="text-xs text-[#455250]">{item.desc}</p>
              </Link>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 h-full flex flex-col">
                <h3 className="text-lg font-bold mb-4">Today's AI Workout</h3>
                <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-6 flex flex-col items-center justify-center text-center flex-1 border-dashed min-h-[160px]">
                  <Dumbbell size={32} className="text-[#555] mb-3" />
                  <p className="text-[#455250]">Generate your personalized workout plan for today.</p>
                  <Link to="/member/ai-assistant" className="mt-4 text-[#164A4A] text-sm font-semibold hover:underline">Start Generator</Link>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 h-full">
                <h3 className="text-lg font-bold mb-4">Upcoming Schedule</h3>
                <div className="space-y-4">
                  <div className="flex space-x-3 items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-[#164A4A]"></div>
                    <div>
                      <p className="font-medium text-sm">1-on-1 Training</p>
                      <p className="text-xs text-[#455250]">Today at 5:00 PM</p>
                    </div>
                  </div>
                  <div className="flex space-x-3 items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-[#555]"></div>
                    <div>
                      <p className="font-medium text-sm text-[#455250]">No other bookings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#D3DFDA]">
              <h3 className="text-lg font-bold text-[#202828]">Payment History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#455250]">
                <thead className="bg-[#F2EFE8] border-b border-[#D3DFDA] text-[#202828]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Plan</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Method</th>
                    <th className="px-6 py-4 font-semibold">Transaction ID</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D3DFDA]">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-[#455250]">No payment history found.</td>
                    </tr>
                  ) : payments.map((p, idx) => (
                    <tr key={idx} className="hover:bg-[#F1F5F3] transition-colors">
                      <td className="px-6 py-4">{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium text-[#202828]">{p.planName}</td>
                      <td className="px-6 py-4 font-bold text-[#164A4A]">₹{p.amount}</td>
                      <td className="px-6 py-4 text-[#202828]">{p.paymentMethod}</td>
                      <td className="px-6 py-4 font-mono text-xs">{p.transactionId || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          p.status === 'Approved' ? 'bg-[#D2B48C]/10 text-[#164A4A]' :
                          p.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Membership Expired Popup */}
      {showExpiredPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202828]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in-95 border border-[#D3DFDA]">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-[#6fa3a0]" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#202828] mb-2 text-center">Free Trial / Subscription Expired</h2>
            <p className="text-[#455250] mb-8 text-center">
              Your free trial has ended. Choose a subscription plan to continue accessing premium gym services.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                to="/member/upgrade"
                className="w-full py-4 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors shadow-lg shadow-green-200 text-center"
              >
                Upgrade Subscription
              </Link>
              <button 
                onClick={logout}
                className="w-full py-3 text-[#455250] font-semibold hover:text-[#202828] hover:bg-[#F2EFE8] rounded-xl transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
