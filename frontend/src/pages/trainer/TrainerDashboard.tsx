import { useState, useEffect } from 'react';
import { 
  Users, IndianRupee, Calendar, 
  Loader2, Bot, CheckCircle2, Eye,
  Activity, Dumbbell, TrendingUp,
  MessageSquare, Check, X, Clock, FileText,
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [aiCustomers, setAiCustomers] = useState<any[]>([]);
  const [clientProgress, setClientProgress] = useState<any[]>([]);
  const [recentCompletedExercises, setRecentCompletedExercises] = useState<any[]>([]);
  const [planRequests, setPlanRequests] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, aiRes, progressRes, planRequestsRes] = await Promise.allSettled([
        api.get('/trainer-sessions/trainer'),
        api.get('/ai/trainer/customers'),
        api.get('/workout-progress/trainer/clients-overview'),
        api.get('/trainer-plans/trainer-requests')
      ]);

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value.data?.success) {
        setSessions(sessionsRes.value.data.sessions || []);
      }

      if (aiRes.status === 'fulfilled' && aiRes.value.data?.success) {
        setAiCustomers(aiRes.value.data.customers || []);
      }

      if (progressRes.status === 'fulfilled' && progressRes.value.data?.success) {
        setClientProgress(progressRes.value.data.clients || []);
        setRecentCompletedExercises(progressRes.value.data.recentActivity || []);
      }

      if (planRequestsRes.status === 'fulfilled' && planRequestsRes.value.data?.success) {
        setPlanRequests(planRequestsRes.value.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load trainer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePlan = async (requestId: string) => {
    try {
      setApprovingId(requestId);
      const feedback = approvalFeedback[requestId] || 'Approved by your trainer! Great customized routine.';
      const res = await api.patch(`/trainer-plans/requests/${requestId}/approve`, {
        trainerFeedback: feedback
      });
      if (res.data.success) {
        setPlanRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: 'Approved', trainerFeedback: feedback } : r));
      }
    } catch (err) {
      console.error('Failed to approve plan:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectPlan = async (requestId: string) => {
    try {
      setApprovingId(requestId);
      const feedback = approvalFeedback[requestId] || 'Modifications needed. Please contact trainer.';
      const res = await api.patch(`/trainer-plans/requests/${requestId}/reject`, {
        trainerFeedback: feedback
      });
      if (res.data.success) {
        setPlanRequests(prev => prev.map(r => r._id === requestId ? { ...r, status: 'Rejected', trainerFeedback: feedback } : r));
      }
    } catch (err) {
      console.error('Failed to decline plan:', err);
    } finally {
      setApprovingId(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const uniqueClients = new Set([
    ...sessions.map(s => s.customerId?._id).filter(Boolean),
    ...clientProgress.map(c => c.customer?.id).filter(Boolean)
  ]).size;
  const todaySessions = sessions.filter(s => (s.status === 'Confirmed' || s.status === 'Upcoming' || s.status === 'Completed') && s.date === todayStr).length;
  const thisMonthEarnings = sessions
    .filter(s => s.paymentStatus === 'Paid' && !['Refunded', 'Refund Pending'].includes(s.status))
    .reduce((acc, curr) => acc + (curr.fee || 0), 0);

  const totalExercisesDone = clientProgress.reduce((acc, curr) => acc + (curr.stats?.totalExercisesCompleted || 0), 0) || recentCompletedExercises.length;

  const upcomingSessions = sessions
    .filter(s => ['Pending', 'Awaiting Payment', 'Confirmed', 'Upcoming'].includes(s.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Filter customers for AI Analysis Review
  const pendingAiReviews = aiCustomers.filter(c => 
    c.aiStatus === 'Pending Trainer Review' || 
    c.aiStatus === 'Under Trainer Review' ||
    c.aiStatus === 'AI Generated'
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827] tracking-tight">
            Welcome back, <span className="text-[#EA580C]">{user?.firstName || 'Trainer'}!</span>
          </h1>
          <p className="text-[#64748B] mt-1 text-sm">
            Here is your coaching overview, client completed workouts, AI drafts, and today&apos;s schedule.
          </p>
        </div>
        <Link
          to="/trainer/rewards"
          className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-2 hover:bg-amber-100 transition shadow-sm shrink-0"
        >
          <Award className="w-4 h-4 text-amber-600" />
          My Rewards &amp; Awards
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#EA580C]" size={40} />
        </div>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3.5 sm:gap-4">
            {[
              { label: 'Active Clients', value: uniqueClients.toString(), icon: Users, color: 'text-[#111827]', bg: 'bg-[#F8FAFC]' },
              { label: 'Completed Exercises', value: totalExercisesDone.toString(), icon: Dumbbell, color: 'text-[#15803D]', bg: 'bg-[#15803D]/10' },
              { label: 'Pending AI Reviews', value: pendingAiReviews.length.toString(), icon: Bot, color: 'text-[#EA580C]', bg: 'bg-[#FFF7ED]' },
              { label: "Today's Sessions", value: todaySessions.toString(), icon: Calendar, color: 'text-[#111827]', bg: 'bg-[#F8FAFC]' },
              { label: 'Total Earnings', value: `₹${thisMonthEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-[#111827]', bg: 'bg-[#F8FAFC]' },
              { label: 'Rewards & Honors', value: 'Perks', icon: Award, color: 'text-amber-700', bg: 'bg-amber-50', link: '/trainer/rewards' },
            ].map((stat, i) => (
              <Link
                key={i}
                to={stat.link || '#'}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 sm:p-4.5 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all group min-w-0"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color} group-hover:scale-105 transition-transform`}>
                  <stat.icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[#64748B] text-[10px] sm:text-[11px] font-bold uppercase tracking-wide leading-tight line-clamp-2">
                    {stat.label}
                  </p>
                  <h3 className="text-lg sm:text-xl font-black text-[#111827] mt-1 whitespace-nowrap">
                    {stat.value}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* DEDICATED SECTION: Member Plan Requests & Messages (User Request) */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F8FAFC] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-bold">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                    Member Plan Requests &amp; Messages
                    {planRequests.filter(r => r.status === 'Pending').length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                        {planRequests.filter(r => r.status === 'Pending').length} Awaiting Approval
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Members can manually submit their workout and diet plans with messages. Review and give approval to directly publish to their dashboard.
                  </p>
                </div>
              </div>
            </div>

            {planRequests.length === 0 ? (
              <div className="text-center py-10 text-[#64748B] bg-[#F8FAFC] border border-dashed border-[#F8FAFC] rounded-2xl p-6">
                <CheckCircle2 size={32} className="text-[#EA580C] mx-auto mb-2" />
                <h4 className="font-bold text-sm text-[#111827]">No Member Plan Requests</h4>
                <p className="text-xs text-[#64748B] mt-1">
                  When members create manual workout or diet plans and message you for review, their submissions will appear here for approval.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {planRequests.map((req) => {
                  const custName = req.customerId
                    ? `${req.customerId.firstName || ''} ${req.customerId.lastName || ''}`.trim() || 'Member'
                    : 'Member';
                  const isPending = req.status === 'Pending';
                  const isApproved = req.status === 'Approved';

                  return (
                    <div
                      key={req._id}
                      className={`border rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                        isApproved
                          ? 'border-[#E2E8F0] bg-[#FFF7ED]'
                          : isPending
                            ? 'border-amber-300 bg-amber-50/10 hover:border-[#FDBA74]'
                            : 'border-[#E2E8F0] bg-[#F8FAFC]'
                      }`}
                    >
                      <div>
                        {/* Customer Header */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-black text-sm shrink-0 border border-[#F8FAFC]">
                              {req.customerId?.profilePhoto ? (
                                <img src={req.customerId.profilePhoto} alt="profile" className="w-full h-full object-cover rounded-full" />
                              ) : (
                                custName[0] || 'M'
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-sm text-[#111827] truncate">
                                {custName}
                              </h4>
                              <p className="text-xs text-[#64748B] truncate">{req.customerId?.email}</p>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 mt-0.5 ${
                              isApproved
                                ? 'bg-[#F8FAFC] text-[#EA580C] border-[#E2E8F0]'
                                : isPending
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-[#F8FAFC] text-[#111827] border-[#E2E8F0]'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        {/* Plan Details Card */}
                        <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E2E8F0]/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#EA580C] bg-[#F8FAFC] px-2 py-0.5 rounded">
                              {req.planType}
                            </span>
                            <span className="text-[11px] text-[#64748B] font-medium">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#111827]">{req.title}</h4>
                          {req.goal && (
                            <p className="text-xs text-[#64748B]">
                              <strong className="text-[#111827]">Goal:</strong> {req.goal}
                            </p>
                          )}

                          {/* Customer Message */}
                          <div className="bg-[#FFF7ED] border border-[#E2E8F0]/70 p-2.5 rounded-lg mt-2">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-[#9A3412] uppercase tracking-wider mb-0.5">
                              <MessageSquare size={11} />
                              <span>Customer Message:</span>
                            </div>
                            <p className="text-xs text-[#111827] italic">
                              &ldquo;{req.customerMessage}&rdquo;
                            </p>
                          </div>

                          {/* Preview Details */}
                          {req.planType === 'Workout Plan' && req.workoutDetails?.days && (
                            <div className="text-[11px] text-[#64748B] bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]">
                              <strong>Routine:</strong> {req.workoutDetails.days.map((d: any) => `${d.dayName} (${d.exercises?.length || 0} exercises)`).join(', ')}
                            </div>
                          )}

                          {req.planType === 'Diet Plan' && req.dietDetails && (
                            <div className="text-[11px] text-[#64748B] bg-[#F8FAFC] p-2 rounded border border-[#E2E8F0]">
                              <strong>Target:</strong> {req.dietDetails.dailyCalories} &bull; {req.dietDetails.protein} Protein &bull; {req.dietDetails.meals?.length || 0} Meals
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Area */}
                      {isPending ? (
                        <div className="pt-2 border-t border-[#E2E8F0] space-y-2">
                          <input
                            type="text"
                            placeholder="Add coach advice / note (optional)..."
                            value={approvalFeedback[req._id] || ''}
                            onChange={e => setApprovalFeedback({ ...approvalFeedback, [req._id]: e.target.value })}
                            className="w-full text-xs px-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#FDBA74]"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprovePlan(req._id)}
                              disabled={approvingId === req._id}
                              className="flex-1 py-2 bg-gradient-to-r from-[#EA580C] to-emerald-500 hover:from-[#EA580C] hover:to-[#C2410C] text-[#FFFFFF] font-bold rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {approvingId === req._id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Check size={14} />
                              )}
                              <span>Approve &amp; Publish to Member</span>
                            </button>
                            <button
                              onClick={() => handleRejectPlan(req._id)}
                              disabled={approvingId === req._id}
                              className="px-3 py-2 bg-[#F8FAFC] hover:bg-[#FFF7ED] text-[#64748B] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                          <span className="font-bold text-[#EA580C] flex items-center gap-1">
                            <CheckCircle2 size={13} /> Active on Customer Dashboard
                          </span>
                          {req.trainerFeedback && (
                            <span className="text-[11px] text-[#64748B] italic truncate max-w-[200px]">
                              &ldquo;{req.trainerFeedback}&rdquo;
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* DEDICATED SECTION: AI Analysis Review (Requirement 3) */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F8FAFC] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-bold">
                  <Bot size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                    AI Analysis Review
                    {pendingAiReviews.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                        {pendingAiReviews.length} Pending
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Review and calibrate AI-generated drafts before publishing official plans to customers.
                  </p>
                </div>
              </div>

              <Link
                to="/trainer/ai-assistant"
                className="text-xs text-[#EA580C] font-bold hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                View All Client AI Plans →
              </Link>
            </div>

            {pendingAiReviews.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] bg-[#F8FAFC] border border-dashed border-[#F8FAFC] rounded-2xl p-6">
                <CheckCircle2 size={36} className="text-[#EA580C] mx-auto mb-2" />
                <h4 className="font-bold text-sm text-[#111827]">All AI Drafts Reviewed</h4>
                <p className="text-xs text-[#64748B] mt-1">
                  You have no customer AI assessments pending review. New client submissions will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {pendingAiReviews.map((customer) => (
                  <div
                    key={customer._id}
                    className="border border-[#F8FAFC] rounded-2xl p-5 bg-[#F8FAFC] hover:bg-[#FFFFFF] hover:border-[#FDBA74] transition-all hover:shadow-md flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div>
                      {/* Customer Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-black text-sm shrink-0 border border-[#F8FAFC]">
                            {customer.profilePhoto ? (
                              <img src={customer.profilePhoto} alt="profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              customer.firstName?.[0] || 'C'
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm text-[#111827] truncate">
                              {customer.firstName} {customer.lastName}
                            </h4>
                            <p className="text-xs text-[#64748B] truncate">{customer.email}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shrink-0 mt-0.5">
                          Pending Review
                        </span>
                      </div>

                      {/* Assessment Highlights - Clean 2x2 Grid for perfect alignment */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#FFFFFF] p-3.5 rounded-xl border border-[#F8FAFC]/80">
                        <div>
                          <span className="text-[10px] font-bold text-[#64748B] uppercase block">Goal</span>
                          <span className="font-extrabold text-[#EA580C] truncate block">{customer.goal || 'General Fitness'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#64748B] uppercase block">Level</span>
                          <span className="font-extrabold text-[#111827] truncate block">{customer.level || 'Beginner'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#64748B] uppercase block">Equipment</span>
                          <span className="font-semibold text-[#111827] truncate block">{customer.assessmentData?.equipmentAvailability || 'Full Commercial Gym'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#64748B] uppercase block">Frequency</span>
                          <span className="font-semibold text-[#111827] truncate block">{customer.assessmentData?.availableWorkoutDays || '4 Days'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#F8FAFC]">
                      <Link
                        to={`/trainer/ai-review/${customer._id}`}
                        className="w-full py-2.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:opacity-95 text-[#FFFFFF] font-bold rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Eye size={14} />
                        <span>Review &amp; Approve</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DEDICATED SECTION: Client Workout Activity & Completed Exercises */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F8FAFC] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-bold">
                  <Activity size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                    Client Workout Activity & Completed Exercises
                    {recentCompletedExercises.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]">
                        {recentCompletedExercises.length} Logged
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Live tracking of exercises, sets, and repetitions finished by your assigned members.
                  </p>
                </div>
              </div>

              <Link
                to="/trainer/customer-progress"
                className="text-xs text-[#EA580C] font-bold hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                View Full Progress Analytics →
              </Link>
            </div>

            {recentCompletedExercises.length === 0 ? (
              <div className="text-center py-12 text-[#64748B] bg-[#F8FAFC] border border-dashed border-[#F8FAFC] rounded-2xl p-6">
                <Dumbbell size={36} className="text-[#64748B] mx-auto mb-2 opacity-60" />
                <h4 className="font-bold text-sm text-[#111827]">No Completed Exercises Logged Yet</h4>
                <p className="text-xs text-[#64748B] mt-1">
                  When your clients complete exercises in their interactive workout routines, their completed sets and form logs will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Completed Exercise Feed (2 Columns) */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-[#EA580C]" />
                    Latest Completed Exercises
                  </h3>
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {recentCompletedExercises.slice(0, 8).map((log: any) => {
                      const clientName = log.customerName || (log.customerId 
                        ? `${log.customerId.firstName || ''} ${log.customerId.lastName || ''}`.trim() || 'Client'
                        : 'Client');
                      const exTitle = log.exerciseName || log.exerciseId?.name || 'Exercise';
                      return (
                        <div
                          key={log._id}
                          className="p-4 bg-[#F8FAFC] hover:bg-[#FFFFFF] border border-[#F8FAFC] hover:border-[#E2E8F0]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                              {log.profilePhoto || log.customerId?.profilePhoto ? (
                                <img src={log.profilePhoto || log.customerId?.profilePhoto} alt="client" className="w-full h-full object-cover" />
                              ) : (
                                clientName[0] || 'C'
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-[#111827]">
                                  {clientName}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0] flex items-center gap-0.5">
                                  <CheckCircle2 size={10} /> Completed
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-[#EA580C] mt-0.5">
                                {exTitle}
                              </h4>
                              <p className="text-[11px] text-[#64748B] mt-0.5">
                                {log.dayName && log.dayName !== 'General' ? `${log.dayName} • ` : ''}
                                <span className="font-semibold text-[#111827]">{log.completedSets} Sets × {log.completedRepetitions || 12} Reps</span>
                                {log.duration ? ` • ${Math.round(log.duration)}s` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="text-right sm:self-center shrink-0">
                            <span className="text-[11px] font-medium text-[#64748B] block">
                              {new Date(log.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-[#64748B]/70 block">
                              {new Date(log.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Client Compliance Overview (1 Column) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#EA580C]" />
                    Routine Adherence Summary
                  </h3>
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {clientProgress.map((cp: any) => (
                      <div
                        key={cp.customer.id}
                        className="p-4 bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {cp.customer.profilePhoto ? (
                                <img src={cp.customer.profilePhoto} alt="client" className="w-full h-full object-cover" />
                              ) : (
                                cp.customer.name[0] || 'C'
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#111827] truncate max-w-[120px]">
                                {cp.customer.name}
                              </h4>
                              <p className="text-[10px] text-[#64748B] truncate max-w-[120px]">
                                {cp.plan?.name || 'Assigned Plan'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-[#EA580C]">
                            {cp.stats?.completionPercentage || 0}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="w-full bg-[#F8FAFC] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#EA580C] to-[#C2410C] h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, cp.stats?.completionPercentage || 0)}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-[#64748B] mt-1 font-medium">
                            <span>{cp.stats?.totalExercisesCompleted || 0} finished</span>
                            <span>{cp.stats?.pendingExercises || 0} remaining</span>
                          </div>
                        </div>

                        <Link
                          to="/trainer/customer-progress"
                          className="w-full py-1.5 bg-[#F8FAFC] hover:bg-[#FFF7ED] text-[#111827] rounded-xl text-[11px] font-bold text-center block transition-colors"
                        >
                          View Member Breakdown →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sessions & Recent Progress Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Upcoming Sessions */}
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col h-full shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b border-[#E2E8F0] pb-4">
                <h2 className="text-xl font-bold text-[#111827]">Upcoming Training Sessions</h2>
                <Link to="/trainer/session-bookings" className="text-xs text-[#EA580C] hover:underline font-semibold flex items-center gap-1">
                  View All Sessions →
                </Link>
              </div>
              <div className="space-y-3 flex-1">
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-12 text-[#64748B] flex flex-col items-center justify-center">
                    <Calendar className="text-[#E2E8F0] mb-2" size={36} />
                    <p className="text-sm font-medium">No upcoming sessions scheduled.</p>
                  </div>
                ) : (
                  upcomingSessions.map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-3.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl hover:border-[#FFEDD5] transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
                          {session.customerId?.profilePhoto ? (
                            <img src={session.customerId.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                          ) : (
                            session.customerId?.firstName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#111827]">{session.customerId ? `${session.customerId.firstName} ${session.customerId.lastName}` : 'Client'}</h4>
                          <p className="text-xs text-[#64748B]">{session.mode} Session</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-[#EA580C]">{new Date(session.date).toLocaleDateString()}</div>
                        <div className="text-xs text-[#64748B]">{session.startTime} ({session.duration || 60}m)</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick AI Coaching Tips */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col h-full shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b border-[#E2E8F0] pb-4">
                <h2 className="text-xl font-bold text-[#111827]">Trainer Review Standards</h2>
                <span className="text-xs text-[#64748B] font-medium">Protocol</span>
              </div>
              <div className="space-y-3.5 flex-1 text-xs text-[#64748B] leading-relaxed">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]/60">
                  <strong className="text-[#111827] block font-bold mb-1">1. Calibrate Sets & Reps</strong>
                  Verify the AI recommendation matches client experience. For beginners, taper high intensity to 3 sets × 10 reps.
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]/60">
                  <strong className="text-[#111827] block font-bold mb-1">2. Screen Contraindicated Movements</strong>
                  Check for reported knee, spine, or shoulder injuries and replace unsuitable exercises.
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]/60">
                  <strong className="text-[#111827] block font-bold mb-1">3. Personalize Coach Notes</strong>
                  Provide welcoming motivation and hydration advice before finalizing the plan.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrainerDashboard;