import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bot, Dumbbell, TrendingUp, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MemberDashboard = () => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/memberships/my');
      setMemberships(res.data.memberships || []);
    } catch (err) {
      console.error('Error fetching memberships', err);
    } finally {
      setLoading(false);
    }
  };

  const activeMembership = memberships.find(m => m.status === 'ACTIVE');
  const pendingMembership = memberships.find(m => m.status === 'PENDING_VERIFICATION');

  const hasActive = !!activeMembership;

  const quickLinks = [
    { icon: Bot, label: 'AI Assistant', desc: 'Chat with your AI coach', path: '/member/ai-assistant', color: 'text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]' },
    { icon: Dumbbell, label: 'Log Workout', desc: 'Track today\'s session', path: '/member/workout', color: 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]' },
    { icon: TrendingUp, label: 'My Progress', desc: 'View body analytics', path: '/member/progress', color: 'text-[#aa3bff] bg-[#aa3bff]/10 border-[#aa3bff]' },
    { icon: Calendar, label: 'Book Class', desc: 'Reserve your spot', path: '/member/bookings', color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]' },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#16A34A]" size={40} /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, <span className="text-[#16A34A]">{user?.firstName}!</span></h1>
          <p className="text-[#475569]">Here's your fitness overview for today.</p>
        </div>
        
        {hasActive ? (
          <div className="mt-4 md:mt-0 bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-5 py-3 flex items-center space-x-3">
            <span className="w-3 h-3 rounded-full bg-[#16A34A] shadow-[0_0_8px_#16A34A] animate-pulse"></span>
            <div>
              <p className="text-xs text-[#475569]">Current Gym</p>
              <p className="text-sm font-bold text-[#1E293B]">{activeMembership.gymId?.name}</p>
            </div>
          </div>
        ) : pendingMembership ? (
           <div className="mt-4 md:mt-0 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-5 py-3 flex items-center space-x-3 text-yellow-500">
             <AlertCircle size={20} />
             <p className="text-sm font-medium">Payment Pending Verification</p>
           </div>
        ) : user?.subscriptionStatus === 'EXPIRED' ? (
           <div className="mt-4 md:mt-0 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 flex items-center space-x-3 text-red-500">
             <AlertCircle size={20} />
             <p className="text-sm font-medium">Subscription Expired</p>
           </div>
        ) : (
          <div className="mt-4 md:mt-0">
             <Link to="/gyms" className="px-6 py-2.5 bg-[#16A34A] text-[#1E293B] font-bold rounded-lg hover:bg-[#15803D] transition-colors shadow-lg">
               Find a Gym
             </Link>
          </div>
        )}
      </div>

      {!hasActive && !pendingMembership && user?.subscriptionStatus === 'EXPIRED' && (
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-10 text-center mb-10 shadow-xl">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Your subscription has expired</h2>
          <p className="text-[#475569] mb-6 max-w-md mx-auto">Please renew your membership to continue accessing your AI GYM dashboard and features.</p>
          <Link to="/subscription-plans" className="inline-block px-8 py-3 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] transition-all hover:scale-105">
            Renew Membership
          </Link>
        </div>
      )}

      {!hasActive && !pendingMembership && user?.subscriptionStatus !== 'EXPIRED' && (
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-10 text-center mb-10 shadow-xl">
          <MapPin size={48} className="mx-auto text-[#555] mb-4" />
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">You haven't joined a gym yet</h2>
          <p className="text-[#475569] mb-6 max-w-md mx-auto">Discover premium gyms near you, select a membership plan, and unlock all features of the AI GYM platform.</p>
          <Link to="/gyms" className="inline-block px-8 py-3 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-all hover:scale-105">
            Browse Gyms
          </Link>
        </div>
      )}

      {pendingMembership && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 mb-10 text-center">
          <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">Verification in Progress</h2>
          <p className="text-yellow-200/70 max-w-lg mx-auto">
            You have submitted a manual payment for <span className="font-bold text-[#1E293B]">{pendingMembership.gymId?.name}</span>. 
            The gym administration is currently verifying your payment. Once approved, your dashboard will automatically unlock.
          </p>
        </div>
      )}

      {hasActive && (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-10">
            {quickLinks.map((item, i) => (
              <Link key={i} to={item.path} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-5 hover:-translate-y-1 transition-transform group cursor-pointer block">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.color}`}><item.icon size={20} /></div>
                <h3 className="font-semibold text-[#1E293B] group-hover:text-[#16A34A] transition transition-colors">{item.label}</h3>
                <p className="text-xs text-[#475569]">{item.desc}</p>
              </Link>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Today's AI Workout</h3>
                <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-6 flex flex-col items-center justify-center text-center h-48 border-dashed">
                  <Dumbbell size={32} className="text-[#555] mb-3" />
                  <p className="text-[#475569]">Generate your personalized workout plan for today.</p>
                  <Link to="/member/ai-assistant" className="mt-4 text-[#16A34A] text-sm font-semibold hover:underline">Start Generator</Link>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Upcoming Schedule</h3>
                <div className="space-y-4">
                  <div className="flex space-x-3 items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-[#16A34A]"></div>
                    <div>
                      <p className="font-medium text-sm">1-on-1 Training</p>
                      <p className="text-xs text-[#475569]">Today at 5:00 PM</p>
                    </div>
                  </div>
                  <div className="flex space-x-3 items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-[#555]"></div>
                    <div>
                      <p className="font-medium text-sm text-[#475569]">No other bookings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MemberDashboard;
