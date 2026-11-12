import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bot, Dumbbell, TrendingUp, Calendar, AlertCircle,
  Loader2, Sparkles, Clock, Flame, User, ArrowRight,
  ShieldCheck, Activity, Award, Utensils, Building2,
  Bell, Star, HelpCircle, Settings,
  CreditCard, CalendarCheck, RefreshCw, Users, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import GymSelectorModal from '../../components/Member/GymSelectorModal';

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGymSelectorOpen, setIsGymSelectorOpen] = useState(false);
  const [showExpiredPopup, setShowExpiredPopup] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/customer/dashboard-summary');
      if (res.data?.success) {
        setSummary(res.data);
        const mems = res.data.modules?.membership?.memberships || [];
        const activeMem = res.data.modules?.membership?.activeMembership;
        const hasExpiredOnly = !activeMem && mems.length > 0 && mems.some((m: any) => m.status === 'Expired');
        if (hasExpiredOnly) {
          setShowExpiredPopup(true);
        } else {
          setShowExpiredPopup(false);
        }
      }
    } catch (err) {
      console.error('Error fetching customer dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary, user?.gymId]);

  const customerId = summary?.customerId || user?.customerId || '—';
  const selectedGym = summary?.selectedGym || null;
  const availableTrainers: any[] = summary?.availableTrainers || [];
  const modules = summary?.modules || {};

  const aiAnalysis = modules.aiFitnessAnalysis || { status: 'Not Started', started: false, recommendation: null };
  const aiWorkout = modules.aiWorkoutPlan || { hasPlan: false, count: 0, activePlan: null };
  const aiDiet = modules.aiDietPlan || { hasPlan: false, count: 0, activePlan: null, loggedMealsCount: 0 };
  const myRoutine = modules.myRoutine || { hasRoutine: false, count: 0 };
  const sessionsMod = modules.trainingSessions || { total: 0, upcomingCount: 0, completedCount: 0, sessions: [] };
  const attendanceMod = modules.attendance || { count: 0, totalSessions: 0 };
  const progressMod = modules.progressTracking || { count: 0, latestLog: null };
  const membershipMod = modules.membership || { hasActiveMembership: false, activeMembership: null, totalCount: 0, memberships: [] };
  const paymentsMod = modules.payments || { count: 0, totalPaidAmount: 0, payments: [] };
  const notificationsMod = modules.notifications || { total: 0, unread: 0 };
  const reviewsMod = modules.reviews || { count: 0 };

  const activeMembership = membershipMod.activeMembership;
  const aiExercises: any[] = aiAnalysis?.recommendation?.workoutPlan?.exercises || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black text-[#111827] tracking-tight">
              Welcome, {user?.firstName || 'Customer'}!
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] text-xs font-bold">
              Customer ID: {customerId}
            </span>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            {selectedGym
              ? `Connected to ${selectedGym.name} • Real-time training and progress tracker`
              : 'Select a gym below to explore its packages and available trainers.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsGymSelectorOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            {selectedGym ? <RefreshCw size={14} /> : <Building2 size={14} />}
            <span>{selectedGym ? 'Change Gym' : 'Find a Gym / Choose a Gym'}</span>
          </button>
          <Link
            to="/member/ai-assistant"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FFEDD5] font-bold text-xs transition-colors"
          >
            <Bot size={14} /> AI Fitness Analysis
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#64748B]">
          <Loader2 className="animate-spin text-[#EA580C]" size={32} />
          <p className="text-sm font-medium">Loading your live dashboard...</p>
        </div>
      ) : (
        <>
          {/* 1. Find a Gym Prompt (shown only when no gym is selected) */}
          {!selectedGym && (
            <div className="bg-gradient-to-br from-[#FFFBF7] to-white border-2 border-dashed border-[#FDBA74] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0">
                  <Building2 size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#111827]">Choose Your Gym</h2>
                  <p className="text-sm text-[#475569] mt-1 max-w-2xl leading-relaxed">
                    You have not selected a gym yet. Browse active gyms to view real locations, equipment, facilities, membership packages, and trainers belonging to that gym.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGymSelectorOpen(true)}
                className="px-6 py-3 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold text-sm rounded-xl shadow-sm transition-colors cursor-pointer shrink-0 flex items-center gap-2"
              >
                <Building2 size={16} /> Find a Gym / Choose a Gym
              </button>
            </div>
          )}

          {/* 2. KPI Snapshot Cards (Real DB counts only) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                <Bot size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">AI Fitness Analysis</p>
                <p className="text-sm font-black text-[#111827] truncate mt-0.5">{aiAnalysis.status || 'Not Started'}</p>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                <CalendarCheck size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">Attendance</p>
                <p className="text-sm font-black text-[#111827] mt-0.5">{attendanceMod.count || 0}</p>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                <CreditCard size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">Membership</p>
                <p className="text-xs font-bold text-[#111827] truncate mt-0.5">
                  {activeMembership ? activeMembership.planName : 'No active membership'}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                <Bell size={21} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">Notifications</p>
                <p className="text-xs font-bold text-[#111827] mt-0.5">
                  {notificationsMod.total > 0 ? `${notificationsMod.unread} unread (${notificationsMod.total} total)` : 'No notifications'}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Available Trainers from Selected Gym */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 border-b border-[#F1F5F9] pb-4">
              <div>
                <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                  <Users size={18} className="text-[#EA580C]" />
                  Available Trainers {selectedGym ? `at ${selectedGym.name}` : ''}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {selectedGym
                    ? 'Active trainers strictly associated with your selected gym.'
                    : 'Choose a gym first to browse its active trainers.'}
                </p>
              </div>
              {selectedGym && (
                <Link to="/member/find-trainers" className="text-xs font-bold text-[#EA580C] hover:underline flex items-center gap-1">
                  Find a Trainer <ArrowRight size={12} />
                </Link>
              )}
            </div>

            {!selectedGym ? (
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center space-y-2">
                <p className="text-sm font-bold text-[#111827]">No gym selected</p>
                <p className="text-xs text-[#64748B]">Select a gym to see active trainers belonging exclusively to that gym.</p>
              </div>
            ) : availableTrainers.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center space-y-2">
                <Users size={28} className="mx-auto text-[#94A3B8]" />
                <p className="text-sm font-bold text-[#111827]">No active trainers available</p>
                <p className="text-xs text-[#64748B]">This gym has no active trainers listed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTrainers.map((tr: any) => (
                  <div key={tr._id} className="p-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center font-bold text-[#EA580C] overflow-hidden shrink-0">
                        {tr.profilePhoto ? (
                          <img src={tr.profilePhoto} alt={tr.name} className="w-full h-full object-cover" />
                        ) : (
                          tr.name?.[0] || 'T'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-[#111827] truncate">{tr.name}</h4>
                        <p className="text-xs font-semibold text-[#EA580C] truncate">{tr.specialization || 'Certified Trainer'}</p>
                        <p className="text-[11px] text-[#64748B] mt-0.5">
                          {tr.experience ? `${tr.experience} yrs exp` : 'Coach'} • {tr.availabilityStatus || 'Available'}
                        </p>
                      </div>
                    </div>
                    {tr.expertise && (
                      <p className="text-[11px] text-[#475569] truncate">
                        Expertise: {Array.isArray(tr.expertise) ? tr.expertise.join(' • ') : tr.expertise}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]">
                      <Link
                        to={`/member/find-trainers?trainerId=${tr._id}`}
                        className="flex-1 py-2 text-center rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#111827] hover:bg-[#FFF7ED]"
                      >
                        View Profile
                      </Link>
                      <Link
                        to={`/member/book-session?trainerId=${tr._id}`}
                        className="flex-1 py-2 text-center rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-xs font-bold text-white"
                      >
                        Book Session
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Workout, Diet, Routine & Training Sessions (Empty States until actual usage) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Workout Plan & My Routine */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                  <Dumbbell size={18} className="text-[#EA580C]" /> AI Workout Plan &amp; Routine
                </h3>
                <Link to="/member/workout" className="text-xs font-bold text-[#EA580C] hover:underline">
                  Open Workout Plan →
                </Link>
              </div>

              {!aiWorkout.hasPlan && !myRoutine.hasRoutine ? (
                <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center space-y-2">
                  <Sparkles size={24} className="mx-auto text-[#94A3B8]" />
                  <p className="text-sm font-bold text-[#111827]">No workout plan generated.</p>
                  <p className="text-xs text-[#64748B]">My Routine: No routine available. Complete AI Fitness Analysis to generate your plan.</p>
                  <Link
                    to="/member/ai-assistant"
                    className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-[#EA580C] text-white text-xs font-bold"
                  >
                    Start AI Fitness Analysis <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFF7ED] border border-[#FFEDD5] text-xs">
                    <span className="font-bold text-[#C2410C]">Active Plans: {aiWorkout.count}</span>
                    <span className="font-semibold text-[#111827]">
                      {aiAnalysis.recommendation?.workoutPlan?.title || aiWorkout.activePlan?.planName || 'Custom Training Routine'}
                    </span>
                  </div>
                  {aiExercises.slice(0, 4).map((ex: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                      <span className="font-bold text-[#111827]">{ex.name}</span>
                      <span className="font-semibold text-[#EA580C]">{ex.sets} × {ex.reps}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-semibold">AI Diet Plan:</span>
                <Link to="/member/diet" className="font-bold text-[#111827] hover:text-[#EA580C]">
                  {aiDiet.hasPlan ? `${aiDiet.count} Active Diet Plan (${aiDiet.loggedMealsCount} meals logged)` : 'No diet plan generated.'}
                </Link>
              </div>
            </div>

            {/* Training Sessions & Progress */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <h3 className="text-lg font-black text-[#111827] flex items-center gap-2">
                  <Calendar size={18} className="text-[#EA580C]" /> Training Sessions &amp; Progress
                </h3>
                <Link to="/member/bookings" className="text-xs font-bold text-[#EA580C] hover:underline">
                  Manage Bookings →
                </Link>
              </div>

              {sessionsMod.total === 0 ? (
                <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-center space-y-2">
                  <Calendar size={24} className="mx-auto text-[#94A3B8]" />
                  <p className="text-sm font-bold text-[#111827]">No sessions booked.</p>
                  <p className="text-xs text-[#64748B]">Book a training session with an active coach at your selected gym.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="px-2.5 py-1 rounded-lg bg-[#FFF7ED] text-[#C2410C]">Upcoming: {sessionsMod.upcomingCount}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">Completed: {sessionsMod.completedCount}</span>
                  </div>
                  {(sessionsMod.sessions || []).slice(0, 3).map((s: any) => (
                    <div key={s._id} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#111827]">{s.trainerId?.name || 'Trainer Session'}</p>
                        <p className="text-[#64748B]">{s.date} • {s.startTime}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-[#E2E8F0] font-bold text-[#334155]">
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-semibold flex items-center gap-1">
                  <TrendingUp size={13} className="text-[#EA580C]" /> Progress Tracking:
                </span>
                <Link to="/member/progress" className="font-bold text-[#111827] hover:text-[#EA580C]">
                  {progressMod.count > 0
                    ? `${progressMod.count} records${progressMod.latestLog?.weight ? ` (Latest: ${progressMod.latestLog.weight} kg)` : ''}`
                    : 'No progress data.'}
                </Link>
              </div>
            </div>
          </div>

          {/* 5. Membership, Payments, Reviews & Support/Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Membership */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#111827] flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} className="text-[#EA580C]" /> Membership
                </h3>
                {activeMembership ? (
                  <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] space-y-1">
                    <p className="font-black text-[#C2410C] text-base">{activeMembership.planName}</p>
                    <p className="text-xs text-[#475569]">Status: {activeMembership.status}</p>
                    {activeMembership.endDate && (
                      <p className="text-xs text-[#64748B]">Valid until {new Date(activeMembership.endDate).toLocaleDateString()}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-xs text-[#64748B]">
                    <p className="font-bold text-[#111827] mb-1">No active membership until purchased.</p>
                    <p>Explore packages from your selected gym when you are ready to join.</p>
                  </div>
                )}
              </div>
              <Link
                to="/member/subscription"
                className="w-full py-2.5 text-center rounded-xl bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0] text-xs font-bold text-[#111827]"
              >
                View Membership & Packages
              </Link>
            </div>

            {/* Payments */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[#111827] flex items-center gap-2 mb-3">
                  <CreditCard size={18} className="text-[#EA580C]" /> Payments
                </h3>
                {paymentsMod.count === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-xs text-[#64748B]">
                    <p className="font-bold text-[#111827] mb-1">No payment transactions.</p>
                    <p>Your payment receipts and transaction history will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#EA580C]">
                      {paymentsMod.count} Transactions • Total ₹{paymentsMod.totalPaidAmount}
                    </p>
                    {(paymentsMod.payments || []).slice(0, 2).map((p: any) => (
                      <div key={p._id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#111827] truncate">{p.planName || 'Payment'}</span>
                        <span className="font-bold text-[#111827]">₹{p.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link
                to="/member/payments"
                className="w-full py-2.5 text-center rounded-xl bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0] text-xs font-bold text-[#111827]"
              >
                View Payment History
              </Link>
            </div>

            {/* Reviews, Help & Support, Settings */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <h3 className="text-base font-black text-[#111827] flex items-center gap-2">
                  <Star size={18} className="text-[#EA580C]" /> Reviews, Support &amp; Settings
                </h3>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="text-[#64748B] font-semibold">Reviews &amp; Ratings</span>
                  <Link to="/member/session-review" className="font-bold text-[#111827] hover:text-[#EA580C]">
                    {reviewsMod.count > 0 ? `${reviewsMod.count} Submitted` : 'No reviews submitted.'}
                  </Link>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="text-[#64748B] font-semibold flex items-center gap-1.5">
                    <HelpCircle size={13} className="text-[#EA580C]" /> Help &amp; Support
                  </span>
                  <Link to="/member/enquiries" className="font-bold text-[#15803D] hover:underline flex items-center gap-1">
                    <CheckCircle2 size={12} /> Available
                  </Link>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-xs">
                  <span className="text-[#64748B] font-semibold flex items-center gap-1.5">
                    <Settings size={13} className="text-[#EA580C]" /> Settings
                  </span>
                  <Link to="/member/settings" className="font-bold text-[#15803D] hover:underline flex items-center gap-1">
                    <CheckCircle2 size={12} /> Available
                  </Link>
                </div>
              </div>
              <Link
                to="/member/notifications"
                className="w-full py-2.5 text-center rounded-xl bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0] text-xs font-bold text-[#111827]"
              >
                {notificationsMod.total > 0 ? `View Notifications (${notificationsMod.unread} unread)` : 'Notifications: No notifications'}
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Expired Membership Notice (Only when an existing membership actually expired) */}
      {showExpiredPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-black text-[#111827]">Membership Plan Expired</h3>
            <p className="text-sm text-[#64748B]">
              Your previous gym membership has expired. Renew or upgrade a membership plan to regain gym membership benefits.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={logout}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#64748B]"
              >
                Logout
              </button>
              <Link
                to="/member/subscription"
                className="flex-1 py-2.5 text-center rounded-xl bg-[#EA580C] text-white text-xs font-bold"
              >
                Renew Plan
              </Link>
            </div>
          </div>
        </div>
      )}

      <GymSelectorModal
        isOpen={isGymSelectorOpen}
        onClose={() => setIsGymSelectorOpen(false)}
        currentGymId={selectedGym?._id}
        onGymSelected={() => {
          fetchSummary();
        }}
      />
    </div>
  );
};

export default MemberDashboard;
