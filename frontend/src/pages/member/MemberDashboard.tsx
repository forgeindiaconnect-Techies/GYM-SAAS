import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bot, Dumbbell, TrendingUp, Calendar, MapPin, AlertCircle,
  Loader2, Play, Sparkles, Clock, Flame, User,
  ArrowRight, ShieldCheck, Activity, Award
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../utils/api';

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [memberships, setMemberships] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [aiRec, setAiRec] = useState<any>(null);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membershipsRes, paymentsRes, sessionsRes, aiRes, progressRes] = await Promise.allSettled([
        api.get('/memberships/my'),
        api.get('/payments/my-history'),
        api.get('/trainer-sessions/member'),
        api.get('/ai/member/latest'),
        api.get('/workout-progress/my-progress')
      ]);

      if (membershipsRes.status === 'fulfilled') {
        setMemberships(membershipsRes.value.data.memberships || []);
      }
      if (paymentsRes.status === 'fulfilled') {
        setPayments(paymentsRes.value.data.payments || []);
      }
      if (sessionsRes.status === 'fulfilled') {
        setSessions(sessionsRes.value.data.sessions || []);
      }
      if (aiRes.status === 'fulfilled' && aiRes.value.data?.recommendation) {
        setAiRec(aiRes.value.data.recommendation);
      }
      if (progressRes.status === 'fulfilled' && progressRes.value.data?.stats) {
        setProgressStats(progressRes.value.data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const isApproved = user?.approvalStatus?.toUpperCase() === 'APPROVED';

  const activeMembership = memberships.find(m => (m.status === 'Active' || m.status === 'Free Trial' || isApproved) && (!m.endDate || new Date(m.endDate) >= new Date() || isApproved));
  const expiredMembership = !isApproved && memberships.find(m => m.status === 'Expired' || ((m.status === 'Active' || m.status === 'Free Trial') && m.endDate && new Date(m.endDate) < new Date()));
  const hasActive = !!activeMembership || isApproved;
  
  const pendingMembership = !hasActive && !isApproved ? memberships.find(m => m.status === 'Payment Verification Pending') : null;
  const rejectedMembership = !hasActive && !isApproved ? memberships.find(m => m.status === 'Rejected') : null;
  
  // Calculate trial days remaining if it's a free trial
  const isTrial = !isApproved && activeMembership?.status === 'Free Trial';
  let trialDaysRemaining = 0;
  if (isTrial && activeMembership?.endDate) {
    const end = new Date(activeMembership.endDate).getTime();
    const now = new Date().getTime();
    trialDaysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  }

  useEffect(() => {
    if (isApproved) {
      setShowExpiredPopup(false);
      return;
    }

    const isSubExp = 
      user?.subscriptionStatus?.toUpperCase() === 'EXPIRED' || 
      (user?.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) ||
      Boolean((location.state as any)?.showExpiredModal);

    if (!loading && !hasActive && (expiredMembership || isSubExp)) {
      setShowExpiredPopup(true);
    }
  }, [loading, hasActive, expiredMembership, user, location.state, isApproved]);

  const quickLinks = [
    { icon: Bot, label: 'AI Coach', desc: 'Chat with your AI trainer', path: '/member/ai-assistant', color: 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]' },
    { icon: Dumbbell, label: 'Today\'s Workout', desc: 'Interactive exercise tracker', path: '/member/workout', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { icon: TrendingUp, label: 'My Progress', desc: 'View body & lifting metrics', path: '/member/progress', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { icon: Calendar, label: 'Book Session', desc: '1-on-1 Trainer coaching', path: '/member/bookings', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  // Exercises to display in Today's AI Workout
  const exercisesToDisplay = aiRec?.workoutPlan?.exercises && aiRec.workoutPlan.exercises.length > 0
    ? aiRec.workoutPlan.exercises.slice(0, 4)
    : [
        { name: 'Barbell Back Squats', sets: 4, reps: '12', duration: '12 min', targetMuscleGroup: 'Quads & Glutes' },
        { name: 'Incline Dumbbell Chest Press', sets: 4, reps: '10', duration: '10 min', targetMuscleGroup: 'Chest & Delts' },
        { name: 'Seated Cable Row / Lat Pulldown', sets: 4, reps: '12', duration: '10 min', targetMuscleGroup: 'Back & Lats' },
        { name: 'Plank with Shoulder Taps', sets: 3, reps: '45s', duration: '6 min', targetMuscleGroup: 'Core & Stability' }
      ];

  const workoutTitle = aiRec?.workoutPlan?.title || aiRec?.recommendedApproach || 'Full Body Strength & Core Conditioning';
  const workoutGoal = aiRec?.goal || (user as any)?.fitnessGoal || 'Muscle Gain & Performance';
  const workoutDuration = aiRec?.workoutPlan?.duration || '45 min';
  const workoutCalories = aiRec?.workoutPlan?.caloriesBurnEstimate || 380;

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#F97316]" size={40} /></div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#292524] tracking-tight">
            Welcome back, <span className="text-[#F97316]">{user?.firstName || 'Member'}!</span>
          </h1>
          <p className="text-[#78716C] mt-1 text-sm">Here is your daily workout routine, schedule, and membership overview.</p>
        </div>
        
        {hasActive ? (
          <div className="flex items-center space-x-3.5 bg-[#FFFFFF] px-5 py-3 rounded-2xl border border-[#E7E5E4] shadow-sm shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] text-[#78716C] font-bold uppercase tracking-wider mb-0.5">Active Gym</p>
              <p className="font-bold text-sm text-[#292524] leading-tight">
                {activeMembership?.gymId?.name || user?.gymName || 'AI GYM Network'}
              </p>
            </div>
          </div>
        ) : pendingMembership ? (
           <div className="flex items-center space-x-3.5 bg-yellow-50 border border-yellow-200 px-5 py-3 rounded-2xl shadow-sm shrink-0">
             <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center">
               <AlertCircle size={20} />
             </div>
             <div>
               <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-wider mb-0.5">Subscription Status</p>
               <p className="font-bold text-sm text-yellow-800 leading-tight">Payment Verification Pending</p>
             </div>
           </div>
        ) : (rejectedMembership || user?.subscriptionStatus?.toUpperCase() === 'REJECTED') ? (
           <div className="flex items-center space-x-3.5 bg-red-50 border border-red-200 px-5 py-3 rounded-2xl shadow-sm shrink-0">
             <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
               <AlertCircle size={20} />
             </div>
             <div>
               <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider mb-0.5">Subscription Status</p>
               <p className="font-bold text-sm text-red-800 leading-tight">Payment Rejected</p>
             </div>
           </div>
        ) : null}
      </div>

      {/* Free Trial Notification Banner */}
      {isTrial && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-emerald-950">Active Subscription: Free Trial</h3>
                <p className="text-emerald-800 text-xs mt-0.5">
                  Full VIP Gym & AI Coaching Access • {trialDaysRemaining > 0 ? `${trialDaysRemaining} days remaining` : 'Ending soon'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-stretch md:self-auto">
              <Link to="/member/upgrade" className="w-full md:w-auto px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-bold transition-colors shadow-sm text-xs text-center">
                Upgrade to Silver Plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {hasActive && (
        <>
          {/* Quick Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Flame size={22} />
              </div>
              <div>
                <p className="text-[11px] text-[#78716C] font-medium uppercase tracking-wider">Target Calories</p>
                <p className="text-lg font-bold text-[#292524]">{workoutCalories} <span className="text-xs font-normal text-[#78716C]">kcal</span></p>
              </div>
            </div>
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-[11px] text-[#78716C] font-medium uppercase tracking-wider">Daily Session</p>
                <p className="text-lg font-bold text-[#292524]">{workoutDuration}</p>
              </div>
            </div>
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Award size={22} />
              </div>
              <div>
                <p className="text-[11px] text-[#78716C] font-medium uppercase tracking-wider">Weekly Streak</p>
                <p className="text-lg font-bold text-[#292524]">
                  {progressStats?.totalWorkoutsCompleted ? `${progressStats.totalWorkoutsCompleted} Sessions` : '4 Active Days'}
                </p>
              </div>
            </div>
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Activity size={22} />
              </div>
              <div>
                <p className="text-[11px] text-[#78716C] font-medium uppercase tracking-wider">Current Plan</p>
                <p className="text-sm font-bold text-[#F97316] truncate max-w-[130px]">
                  {activeMembership?.planName || user?.subscriptionPlan || 'Free Trial'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((item, i) => (
              <Link key={i} to={item.path} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-4 flex items-center space-x-3.5 shadow-sm hover:shadow-md transition-shadow group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-[#292524] group-hover:text-[#F97316] transition-colors">{item.label}</h3>
                  <p className="text-[11px] text-[#78716C] mt-0.5 truncate">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Main 2-Column Content: Today's AI Workout & Upcoming Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Left Column: Today's AI Workout (Filled & Interactive) */}
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 flex flex-col h-full shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 border-b border-[#E7E5E4] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#292524]">Today's AI Workout</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Sparkles size={10} /> AI Tailored
                    </span>
                  </div>
                  <p className="text-xs text-[#78716C] mt-1">{workoutTitle}</p>
                </div>
                <Link to="/member/ai-assistant" className="text-xs text-[#F97316] font-semibold hover:underline flex items-center gap-1">
                  AI Coach Assistant <ArrowRight size={12} />
                </Link>
              </div>

              {/* Workout Details & Exercise List */}
              <div className="flex-1 space-y-4 flex flex-col justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {exercisesToDisplay.map((ex: any, idx: number) => (
                    <div key={idx} className="bg-[#F9F8F6] border border-[#E7E5E4] rounded-2xl p-3.5 flex items-start gap-3 hover:border-[#F97316]/40 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-[#F97316] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-[#292524] truncate">{ex.name}</p>
                        <p className="text-[11px] text-[#78716C] mt-0.5 flex items-center gap-2">
                          <span className="font-semibold text-emerald-700">{ex.sets} Sets × {ex.reps} Reps</span>
                          {ex.targetMuscleGroup && (
                            <span className="text-[#78716C]">• {ex.targetMuscleGroup}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Action Footer */}
                <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
                  <div className="flex items-center gap-3 text-xs text-[#78716C]">
                    <span className="flex items-center gap-1 font-semibold text-[#292524]">
                      <Clock size={14} className="text-[#F97316]" /> {workoutDuration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-[#292524]">
                      <Flame size={14} className="text-orange-500" /> ~{workoutCalories} kcal
                    </span>
                    <span>•</span>
                    <span className="bg-white px-2 py-0.5 rounded-md border border-[#E7E5E4] text-[11px] font-medium">
                      {workoutGoal}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      to="/member/workout"
                      className="flex-1 sm:flex-none px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Play size={13} fill="currentColor" /> Start Workout
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Upcoming Schedule & Classes */}
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-6 flex flex-col h-full shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b border-[#E7E5E4] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#292524]">Upcoming Schedule</h3>
                  <p className="text-xs text-[#78716C] mt-0.5">Sessions & Gym Floor Access</p>
                </div>
                <Link to="/member/bookings" className="text-xs font-semibold text-[#F97316] hover:underline">View All</Link>
              </div>

              <div className="space-y-3 flex-1 flex flex-col justify-start">
                {/* Booked Sessions if any */}
                {sessions.filter(s => ['Pending', 'Awaiting Payment', 'Confirmed', 'Upcoming'].includes(s.status)).slice(0, 2).map((session, i) => (
                  <div key={i} className="flex space-x-3 items-center justify-between p-3.5 bg-[#F9F8F6] rounded-2xl border border-[#E7E5E4]">
                    <div className="flex space-x-3 items-center min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${session.status === 'Pending' ? 'bg-amber-500' : 'bg-[#F97316]'}`}></div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#292524] capitalize truncate">
                          {session.trainerId?.name ? `${session.trainerId.name} (${session.mode || 'Online'})` : `${session.mode || 'Online'} Session`}
                        </p>
                        <p className="text-[11px] text-[#78716C] mt-0.5">{new Date(session.date).toLocaleDateString()} at {session.startTime}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      session.status === 'Pending' 
                        ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {session.status === 'Pending' ? 'Waiting' : 'Confirmed'}
                    </span>
                  </div>
                ))}

                {/* Default Daily Gym Schedule items so it's always informative */}
                <div className="p-3.5 bg-[#F8FAF9] rounded-2xl border border-[#E7E5E4] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292524] flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-[#F97316]" /> Daily Gym Access
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Open</span>
                  </div>
                  <p className="text-[11px] text-[#78716C]">Full access to cardio & weight training floors.</p>
                  <p className="text-[11px] font-medium text-[#F97316]">06:00 AM – 10:00 PM</p>
                </div>

                <div className="p-3.5 bg-[#F8FAF9] rounded-2xl border border-[#E7E5E4] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292524] flex items-center gap-1.5">
                      <Activity size={14} className="text-amber-600" /> Evening HIIT & Cardio Group
                    </span>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">Today</span>
                  </div>
                  <p className="text-[11px] text-[#78716C]">Instructor-led group session on main floor.</p>
                  <p className="text-[11px] font-medium text-amber-700">06:30 PM – 07:15 PM</p>
                </div>

                <div className="pt-2 mt-auto">
                  <Link
                    to="/member/find-trainers"
                    className="w-full py-2.5 bg-[#FFFDF8] hover:bg-[#FED7AA] text-[#F97316] border border-[#E7E5E4] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <User size={13} /> Book 1-on-1 Trainer Session
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History & Membership Summary Table */}
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#E7E5E4] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#292524]">Membership & Payment Record</h3>
                <p className="text-xs text-[#78716C] mt-0.5">Your invoices, plan activations, and payment status</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {activeMembership?.status || 'Active'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#78716C]">
                <thead className="bg-[#FFFDF8] border-b border-[#E7E5E4] text-[#292524]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Plan</th>
                    <th className="px-6 py-4 font-semibold">Amount</th>
                    <th className="px-6 py-4 font-semibold">Method</th>
                    <th className="px-6 py-4 font-semibold">Reference / ID</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {payments.length > 0 ? (
                    payments.map((p, idx) => (
                      <tr key={idx} className="hover:bg-[#FFFDF8] transition-colors">
                        <td className="px-6 py-4">{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-medium text-[#292524]">{p.planName}</td>
                        <td className="px-6 py-4 font-bold text-[#F97316]">₹{p.amount}</td>
                        <td className="px-6 py-4 text-[#292524]">{p.paymentMethod}</td>
                        <td className="px-6 py-4 font-mono text-xs">{p.transactionId || p.paymentReference || (p._id ? `TXN-${p._id.slice(-8).toUpperCase()}` : 'N/A')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* Show active membership record if no separate payment history item yet */
                    <tr className="hover:bg-[#FFFDF8] transition-colors">
                      <td className="px-6 py-4">
                        {new Date(activeMembership?.startDate || activeMembership?.createdAt || new Date()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#292524]">
                        {activeMembership?.planName || user?.subscriptionPlan || 'Free Trial Plan'}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#F97316]">
                        {activeMembership?.price ? `₹${activeMembership.price}` : '₹0 (Trial)'}
                      </td>
                      <td className="px-6 py-4 text-[#292524]">
                        {activeMembership?.paymentMethod || 'Online'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        MEM-{activeMembership?._id ? activeMembership._id.slice(-8).toUpperCase() : 'ACTIVE'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {activeMembership?.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Membership Expired Popup */}
      {!isApproved && showExpiredPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292524]/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in-95 border-2 border-red-300">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#292524] mb-2 text-center">Plan Completed</h2>
            <p className="text-[#78716C] mb-8 text-center text-sm">
              Your subscription plan is completed. Please upgrade your plan to continue accessing premium gym services.
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                to="/member/upgrade"
                onClick={() => setShowExpiredPopup(false)}
                className="w-full py-4 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors shadow-lg text-center"
              >
                Upgrade Your Plan
              </Link>
              <button 
                onClick={logout}
                className="w-full py-3 text-[#78716C] font-semibold hover:text-[#292524] hover:bg-[#FFFDF8] rounded-xl transition-colors"
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
