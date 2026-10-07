import { useState, useEffect } from 'react';
import { 
  Users, IndianRupee, Calendar, 
  Loader2, Bot, CheckCircle2, Eye,
  Activity, Dumbbell, TrendingUp
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, aiRes, progressRes] = await Promise.allSettled([
        api.get('/trainer-sessions/trainer'),
        api.get('/ai/trainer/customers'),
        api.get('/workout-progress/trainer/clients-overview')
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
    } catch (err) {
      console.error('Failed to load trainer dashboard:', err);
    } finally {
      setLoading(false);
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
      <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">
            Welcome back, <span className="text-[#F97316]">{user?.firstName || 'Trainer'}!</span>
          </h1>
          <p className="text-[#78716C] mt-1 text-sm">
            Here is your coaching overview, client completed workouts, AI drafts, and today&apos;s schedule.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#F97316]" size={40} />
        </div>
      ) : (
        <>
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Active Clients', value: uniqueClients.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-500/10' },
              { label: 'Completed Exercises', value: totalExercisesDone.toString(), icon: Dumbbell, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
              { label: 'Pending AI Reviews', value: pendingAiReviews.length.toString(), icon: Bot, color: 'text-amber-600', bg: 'bg-amber-500/10' },
              { label: 'Today\'s Sessions', value: todaySessions.toString(), icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-500/10' },
              { label: 'Total Earnings', value: `₹${thisMonthEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-[#F97316]', bg: 'bg-[#F97316]/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5 flex items-center space-x-3 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[#78716C] text-[11px] font-semibold uppercase tracking-wider truncate">{stat.label}</p>
                  <h3 className="text-xl font-extrabold text-[#292524] mt-0.5">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* DEDICATED SECTION: AI Analysis Review (Requirement 3) */}
          <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FED7AA] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold">
                  <Bot size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#292524] flex items-center gap-2">
                    AI Analysis Review
                    {pendingAiReviews.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                        {pendingAiReviews.length} Pending
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Review and calibrate AI-generated drafts before publishing official plans to customers.
                  </p>
                </div>
              </div>

              <Link
                to="/trainer/ai-assistant"
                className="text-xs text-[#F97316] font-bold hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                View All Client AI Plans →
              </Link>
            </div>

            {pendingAiReviews.length === 0 ? (
              <div className="text-center py-12 text-[#78716C] bg-[#F9F8F6] border border-dashed border-[#FED7AA] rounded-2xl p-6">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-[#292524]">All AI Drafts Reviewed</h4>
                <p className="text-xs text-[#78716C] mt-1">
                  You have no customer AI assessments pending review. New client submissions will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingAiReviews.map((customer) => (
                  <div
                    key={customer._id}
                    className="border border-[#FED7AA] rounded-2xl p-5 bg-[#F9F8F6] hover:bg-white hover:border-[#F97316] transition-all hover:shadow-md flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Customer Header */}
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-sm shrink-0">
                            {customer.profilePhoto ? (
                              <img src={customer.profilePhoto} alt="profile" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              customer.firstName?.[0] || 'C'
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#292524] truncate max-w-[140px]">
                              {customer.firstName} {customer.lastName}
                            </h4>
                            <p className="text-xs text-[#78716C] truncate max-w-[140px]">{customer.email}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 shrink-0">
                          Pending Review
                        </span>
                      </div>

                      {/* Assessment Highlights */}
                      <div className="space-y-1.5 text-xs text-[#78716C] bg-white p-3 rounded-xl border border-[#FED7AA]">
                        <p><strong className="text-[#292524]">Goal:</strong> {customer.goal}</p>
                        <p><strong className="text-[#292524]">Level:</strong> {customer.level}</p>
                        {customer.assessmentData?.equipmentAvailability && (
                          <p><strong className="text-[#292524]">Equipment:</strong> {customer.assessmentData.equipmentAvailability}</p>
                        )}
                        {customer.assessmentData?.availableWorkoutDays && (
                          <p><strong className="text-[#292524]">Frequency:</strong> {customer.assessmentData.availableWorkoutDays}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#FED7AA]">
                      <Link
                        to={`/trainer/ai-review/${customer._id}`}
                        className="flex-1 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Eye size={14} /> Review & Approve
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DEDICATED SECTION: Client Workout Activity & Completed Exercises */}
          <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FED7AA] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
                  <Activity size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#292524] flex items-center gap-2">
                    Client Workout Activity & Completed Exercises
                    {recentCompletedExercises.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {recentCompletedExercises.length} Logged
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Live tracking of exercises, sets, and repetitions finished by your assigned members.
                  </p>
                </div>
              </div>

              <Link
                to="/trainer/customer-progress"
                className="text-xs text-[#F97316] font-bold hover:underline flex items-center gap-1 self-start sm:self-center"
              >
                View Full Progress Analytics →
              </Link>
            </div>

            {recentCompletedExercises.length === 0 ? (
              <div className="text-center py-12 text-[#78716C] bg-[#F9F8F6] border border-dashed border-[#FED7AA] rounded-2xl p-6">
                <Dumbbell size={36} className="text-[#78716C] mx-auto mb-2 opacity-60" />
                <h4 className="font-bold text-sm text-[#292524]">No Completed Exercises Logged Yet</h4>
                <p className="text-xs text-[#78716C] mt-1">
                  When your clients complete exercises in their interactive workout routines, their completed sets and form logs will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Completed Exercise Feed (2 Columns) */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Latest Completed Exercises
                  </h3>
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {recentCompletedExercises.slice(0, 8).map((log: any) => {
                      const clientName = log.customerId 
                        ? `${log.customerId.firstName || ''} ${log.customerId.lastName || ''}`.trim() || 'Client'
                        : 'Client';
                      return (
                        <div
                          key={log._id}
                          className="p-4 bg-[#F9F8F6] hover:bg-white border border-[#FED7AA] hover:border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                              {log.customerId?.profilePhoto ? (
                                <img src={log.customerId.profilePhoto} alt="client" className="w-full h-full object-cover" />
                              ) : (
                                clientName[0] || 'C'
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-[#292524]">
                                  {clientName}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                                  <CheckCircle2 size={10} /> Completed
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-[#F97316] mt-0.5">
                                {log.exerciseId?.name || 'Exercise'}
                              </h4>
                              <p className="text-[11px] text-[#78716C] mt-0.5">
                                {log.dayName && log.dayName !== 'General' ? `${log.dayName} • ` : ''}
                                <span className="font-semibold text-[#292524]">{log.completedSets} Sets × {log.completedRepetitions || 12} Reps</span>
                                {log.duration ? ` • ${Math.round(log.duration)}s` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="text-right sm:self-center shrink-0">
                            <span className="text-[11px] font-medium text-[#78716C] block">
                              {new Date(log.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[10px] text-[#78716C]/70 block">
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#78716C] mb-2 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#F97316]" />
                    Routine Adherence Summary
                  </h3>
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {clientProgress.map((cp: any) => (
                      <div
                        key={cp.customer.id}
                        className="p-4 bg-white border border-[#FED7AA] rounded-2xl space-y-3 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {cp.customer.profilePhoto ? (
                                <img src={cp.customer.profilePhoto} alt="client" className="w-full h-full object-cover" />
                              ) : (
                                cp.customer.name[0] || 'C'
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#292524] truncate max-w-[120px]">
                                {cp.customer.name}
                              </h4>
                              <p className="text-[10px] text-[#78716C] truncate max-w-[120px]">
                                {cp.plan?.name || 'Assigned Plan'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-700">
                            {cp.stats?.completionPercentage || 0}%
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div>
                          <div className="w-full bg-[#FED7AA] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, cp.stats?.completionPercentage || 0)}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-[#78716C] mt-1 font-medium">
                            <span>{cp.stats?.totalExercisesCompleted || 0} finished</span>
                            <span>{cp.stats?.pendingExercises || 0} remaining</span>
                          </div>
                        </div>

                        <Link
                          to="/trainer/customer-progress"
                          className="w-full py-1.5 bg-[#FFFDF8] hover:bg-[#FED7AA] text-[#292524] rounded-xl text-[11px] font-bold text-center block transition-colors"
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
            <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col h-full shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b border-[#E7E5E4] pb-4">
                <h2 className="text-xl font-bold text-[#292524]">Upcoming Training Sessions</h2>
                <Link to="/trainer/session-bookings" className="text-xs text-[#F97316] hover:underline font-semibold flex items-center gap-1">
                  View All Sessions →
                </Link>
              </div>
              <div className="space-y-3 flex-1">
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-12 text-[#78716C] flex flex-col items-center justify-center">
                    <Calendar className="text-[#E7E5E4] mb-2" size={36} />
                    <p className="text-sm font-medium">No upcoming sessions scheduled.</p>
                  </div>
                ) : (
                  upcomingSessions.map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-3.5 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl hover:border-[#F97316]/50 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
                          {session.customerId?.profilePhoto ? (
                            <img src={session.customerId.profilePhoto} alt="profile" className="w-full h-full object-cover" />
                          ) : (
                            session.customerId?.firstName?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#292524]">{session.customerId ? `${session.customerId.firstName} ${session.customerId.lastName}` : 'Client'}</h4>
                          <p className="text-xs text-[#78716C]">{session.mode} Session</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-[#F97316]">{new Date(session.date).toLocaleDateString()}</div>
                        <div className="text-xs text-[#78716C]">{session.startTime} ({session.duration || 60}m)</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick AI Coaching Tips */}
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col h-full shadow-sm">
              <div className="flex justify-between items-center mb-5 border-b border-[#E7E5E4] pb-4">
                <h2 className="text-xl font-bold text-[#292524]">Trainer Review Standards</h2>
                <span className="text-xs text-[#78716C] font-medium">Protocol</span>
              </div>
              <div className="space-y-3.5 flex-1 text-xs text-[#78716C] leading-relaxed">
                <div className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E7E5E4]/60">
                  <strong className="text-[#292524] block font-bold mb-1">1. Calibrate Sets & Reps</strong>
                  Verify the AI recommendation matches client experience. For beginners, taper high intensity to 3 sets × 10 reps.
                </div>
                <div className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E7E5E4]/60">
                  <strong className="text-[#292524] block font-bold mb-1">2. Screen Contraindicated Movements</strong>
                  Check for reported knee, spine, or shoulder injuries and replace unsuitable exercises.
                </div>
                <div className="p-3 bg-[#F8FAF9] rounded-xl border border-[#E7E5E4]/60">
                  <strong className="text-[#292524] block font-bold mb-1">3. Personalize Coach Notes</strong>
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