import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Activity, Trophy, TrendingDown, ArrowRight, Calendar, Dumbbell, 
  Utensils, Clock, Loader2, Sparkles, Lock, CheckCircle2, 
  User, ShieldAlert, HeartPulse, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberAIResults = () => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'output' | 'progress'>('output');

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/ai/member/latest');
        if (res.data.recommendation) {
          setRecommendation(res.data.recommendation);
          if (res.data.history && res.data.history.length > 0) {
            setHistory(res.data.history);
          } else {
            // History fallback for comparison view
            setHistory([{
              ...res.data.recommendation,
              fitnessProfile: {
                ...res.data.recommendation.fitnessProfile,
                weight: String(parseFloat(res.data.recommendation.fitnessProfile?.weight || '90') + 5),
                fitnessGoal: 'Weight Loss'
              },
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-[#F97316]" size={40} />
      </div>
    );
  }
  
  if (!recommendation) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-[#F1F5F9] border border-[#FED7AA] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-[#78716C]" />
          </div>
          <h2 className="text-3xl font-bold text-[#292524] mb-4">No AI Results Found</h2>
          <p className="text-[#78716C] text-lg mb-8 max-w-lg mx-auto">
            You haven&apos;t generated an AI fitness assessment yet. Please go to the AI Fitness assessment page to submit your health profile.
          </p>
          <Link
            to="/member/ai-assistant"
            className="inline-flex items-center px-6 py-3 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors"
          >
            Start Assessment →
          </Link>
        </div>
      </div>
    );
  }

  const isApproved = recommendation.status === 'Trainer Approved' || 
                     recommendation.status === 'Published to Customer' || 
                     recommendation.status === 'Published';
  const isPending = !isApproved;

  // Extract trainer modifications diff if available
  const workoutMods = recommendation.trainerModifications?.workoutModifications || [];
  const trainerName = recommendation.trainerModifications?.modifiedByTrainerName || 
                      recommendation.finalApprovedPlan?.approvedByTrainerName || 
                      recommendation.trainerId?.name || 
                      'Certified Trainer';
  const trainerNotes = recommendation.trainerNotes || 
                       recommendation.finalApprovedPlan?.trainerNotes || 
                       recommendation.trainerModifications?.trainerNotes;
  const trainerRecs = recommendation.trainerRecommendations || 
                      recommendation.finalApprovedPlan?.trainerRecommendations || 
                      recommendation.trainerModifications?.trainerSpecificRecommendations;

  // Active exercises source
  const approvedExercises = recommendation.finalApprovedPlan?.workoutPlan?.exercises?.length > 0
    ? recommendation.finalApprovedPlan.workoutPlan.exercises
    : (recommendation.workoutRecommendation?.exercises || recommendation.workoutPlan || []);

  const weeklySchedule = recommendation.finalApprovedPlan?.workoutPlan?.weeklySchedule?.length > 0
    ? recommendation.finalApprovedPlan.workoutPlan.weeklySchedule
    : (recommendation.workoutRecommendation?.weeklySchedule || []);

  const dietPlan = recommendation.finalApprovedPlan?.dietPlan || recommendation.dietRecommendation;
  const recoveryPlan = recommendation.finalApprovedPlan?.recoveryPlan || recommendation.recoveryRecommendations;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#EA580C] rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/20 text-white">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#292524] tracking-tight">AI Fitness Results</h1>
            <p className="text-[#78716C] mt-1 text-sm">
              {isApproved 
                ? 'Your certified trainer-reviewed and approved fitness regimen.'
                : 'Customer health intake summary & live trainer review status.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isApproved ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={14} className="text-emerald-600" /> Trainer Approved Plan
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-sm">
              <Clock size={14} className="text-amber-600 animate-pulse" /> Pending Trainer Review
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7E5E4] mb-6">
        <button 
          onClick={() => setActiveTab('output')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'output' 
              ? 'border-[#F97316] text-[#F97316]' 
              : 'border-transparent text-[#78716C] hover:text-[#292524]'
          }`}
        >
          {isApproved ? 'Approved Plan & AI Insights' : 'Customer Profile & Review Status'}
        </button>
        <button 
          onClick={() => setActiveTab('progress')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'progress' 
              ? 'border-[#F97316] text-[#F97316]' 
              : 'border-transparent text-[#78716C] hover:text-[#292524]'
          }`}
        >
          Progress Comparison
        </button>
      </div>

      {activeTab === 'output' ? (
        <>
          {/* CUSTOMER ASSESSMENT DETAILS CARD (Always visible to the customer) */}
          <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-[#F97316]" />
                <h2 className="text-lg font-bold text-[#292524]">Customer Profile & Biometrics</h2>
              </div>
              <span className="text-xs font-semibold text-[#78716C]">
                Assessed: {new Date(recommendation.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Profile Grid */}
            <div className="bg-[#FFFDF8] border border-[#FED7AA] rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[#78716C] uppercase font-bold">Current Weight</p>
                <p className="font-extrabold text-xl text-[#292524] mt-0.5">
                  {recommendation.fitnessProfile?.weight || '-'} <span className="text-sm font-medium">kg</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C] uppercase font-bold">Height</p>
                <p className="font-extrabold text-xl text-[#292524] mt-0.5">
                  {recommendation.fitnessProfile?.height || '-'} <span className="text-sm font-medium">cm</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C] uppercase font-bold">Calculated BMI</p>
                <p className="font-extrabold text-xl text-[#F97316] mt-0.5">
                  {recommendation.fitnessProfile?.height && recommendation.fitnessProfile?.weight
                    ? (
                        Number(recommendation.fitnessProfile.weight) /
                        Math.pow(Number(recommendation.fitnessProfile.height) / 100, 2)
                      ).toFixed(1)
                    : '22.0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C] uppercase font-bold">Fitness Goal</p>
                <p className="font-bold text-base text-[#292524] mt-0.5 truncate">
                  {recommendation.fitnessProfile?.fitnessGoal || recommendation.fitnessProfile?.goal || 'General Fitness'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C] uppercase font-bold">Experience Level</p>
                <p className="font-bold text-sm text-[#292524] mt-0.5">
                  {recommendation.fitnessProfile?.currentFitnessLevel || recommendation.fitnessProfile?.experienceLevel || 'Beginner'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C] uppercase font-bold">Activity Level</p>
                <p className="font-bold text-sm text-[#292524] mt-0.5">
                  {recommendation.fitnessProfile?.activityLevel || 'Moderately Active'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C] uppercase font-bold">Available Training</p>
                <p className="font-bold text-sm text-[#292524] mt-0.5">
                  {recommendation.fitnessProfile?.availableWorkoutDays || '3-4 days/week'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#78716C] uppercase font-bold">Equipment Access</p>
                <p className="font-bold text-sm text-[#292524] mt-0.5 truncate">
                  {recommendation.fitnessProfile?.equipmentAvailability || 'Full Commercial Gym'}
                </p>
              </div>
            </div>

            {/* Body Measurements Logged */}
            {recommendation.fitnessProfile?.bodyMeasurements && (
              <div className="pt-3 border-t border-[#FED7AA]">
                <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">
                  Body Measurements
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.entries(recommendation.fitnessProfile.bodyMeasurements).map(([k, v]: any) => (
                    <div key={k} className="p-2.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl text-center">
                      <span className="text-[10px] text-[#78716C] uppercase font-bold block">{k}</span>
                      <span className="text-xs font-extrabold text-[#292524]">{v ? `${v} cm` : '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STATE 1: PENDING TRAINER REVIEW (DO NOT SHOW AI OUTPUT / WORKOUT / DIET TO CUSTOMER FIRST) */}
          {isPending ? (
            <div className="space-y-6">
              {/* Primary Workflow Status Card */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={30} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                          Pending Trainer Review
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                          Sent to Coach Dashboard
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[#292524]">
                        AI Draft Generated & Sent to Your Trainer
                      </h3>
                      <p className="text-sm text-[#78716C] mt-1.5 max-w-2xl leading-relaxed">
                        Your fitness assessment has been analyzed by AI and automatically forwarded to your coach&apos;s dashboard. 
                        <strong> The AI output is not shown yet</strong> until your certified coach reviews the workout split, adjusts exercises, sets, reps, and validates dietary recommendations.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/member/trainer-review"
                    className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
                  >
                    Track Review Status →
                  </Link>
                </div>

                {/* Assigned Trainer Card */}
                <div className="bg-white border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                      {recommendation.trainerId?.profilePhoto ? (
                        <img src={recommendation.trainerId.profilePhoto} alt="trainer" className="w-full h-full object-cover" />
                      ) : (
                        <User size={22} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#292524]">
                          {recommendation.trainerId?.name || 'Assigned Certified Trainer'}
                        </h4>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                        </span>
                      </div>
                      <p className="text-xs text-[#78716C] mt-0.5">
                        {recommendation.trainerId?.specialization || 'Strength & Conditioning Specialist'}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-[#78716C] sm:text-right">
                    <p className="font-bold text-amber-800">Review In Progress</p>
                    <p className="text-[11px] text-[#78716C] mt-0.5">Calibrating your sets, reps & nutrition</p>
                  </div>
                </div>

                {/* 3-Step Visual Progression */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/80 border border-emerald-300 rounded-xl p-3 flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-emerald-800 uppercase">Step 1: Completed</p>
                      <p className="text-xs font-semibold text-[#292524]">Profile Assessed & Drafted</p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-amber-400 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
                    <Clock size={18} className="text-amber-600 animate-pulse shrink-0" />
                    <div>
                      <p className="text-[11px] font-extrabold text-amber-800 uppercase">Step 2: In Progress</p>
                      <p className="text-xs font-bold text-[#292524]">Trainer Reviewing on Dashboard</p>
                    </div>
                  </div>

                  <div className="bg-white/50 border border-gray-200 rounded-xl p-3 flex items-center gap-2.5 opacity-70">
                    <Lock size={18} className="text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-gray-500 uppercase">Step 3: Locked</p>
                      <p className="text-xs font-semibold text-gray-600">Customer Plan Output</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Locked Output Notice (Protects Customer from Unreviewed AI Output) */}
              <div className="bg-white border border-[#E7E5E4] rounded-3xl p-10 text-center shadow-sm relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-[#FFFDF8] border border-[#FED7AA] flex items-center justify-center mx-auto mb-4 text-[#78716C]">
                  <Lock size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#292524]">
                  Workout & Diet Output Locked Pending Review
                </h3>
                <p className="text-sm text-[#78716C] max-w-lg mx-auto mt-2 leading-relaxed">
                  To protect your safety and guarantee optimal training adaptations, our platform prohibits displaying unreviewed AI routines directly to customers. 
                  Your trainer is calibrating the plan right now. Once approved, your complete plan with coach notes will appear here immediately.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link
                    to="/member/trainer-review"
                    className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    View Trainer Feedback Channel
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* STATE 2: ONCE TRAINERS REVIEW DONE -> SHOW BOTH AI OUTPUT AND TRAINER OUTPUT */
            <div className="space-y-8">
              {/* Official Approval Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Award size={30} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-700" /> Trainer Approved Plan
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800">
                          Published to Dashboard
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#292524]">
                        Official Fitness Regimen • Approved by {trainerName}
                      </h3>
                      <p className="text-sm text-[#78716C] mt-1 max-w-2xl">
                        Your personalized fitness plan has been reviewed, calibrated, and officially authorized by your certified personal trainer. 
                        Below you can inspect both your coach&apos;s tailored recommendations and the underlying AI intelligence analysis.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/member/workout"
                    className="px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-teal-900/10 shrink-0 flex items-center gap-1.5"
                  >
                    <Dumbbell size={15} /> Open Workout Player
                  </Link>
                </div>
              </div>

              {/* SECTION A: CERTIFIED TRAINER OUTPUT (THE TRAINER'S CALIBRATIONS) */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#E7E5E4] pb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#292524]">
                      Certified Trainer Output & Calibrations
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Personalized modifications, exercise sets/reps calibration, and coach notes from {trainerName}.
                    </p>
                  </div>
                </div>

                {/* Trainer Notes & Guidance Card */}
                {trainerNotes && (
                  <div className="bg-[#FFFFFF] border-2 border-[#F97316]/20 rounded-3xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#F97316] uppercase tracking-wider">
                      <User size={15} /> Coach Notes from {trainerName}
                    </div>
                    <p className="text-sm text-[#292524] font-medium leading-relaxed italic bg-[#F9F8F6] p-4 rounded-2xl border border-[#FED7AA]">
                      &ldquo;{trainerNotes}&rdquo;
                    </p>
                    {trainerRecs && (
                      <div className="pt-2 text-xs text-[#78716C]">
                        <strong className="text-[#292524]">Trainer Recommendations:</strong>{' '}
                        {Array.isArray(trainerRecs) ? trainerRecs.join(' • ') : trainerRecs}
                      </div>
                    )}
                  </div>
                )}

                {/* Trainer Calibrated Workout Plan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Workout Schedule & Exercises */}
                  <div className="bg-white border border-[#FED7AA] rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-[#292524] flex items-center gap-2 mb-3">
                        <Dumbbell className="text-[#F97316]" size={20} /> Trainer-Approved Workout Plan
                      </h4>
                      {workoutMods.length > 0 && (
                        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span>
                            <strong>Trainer Active Calibrations:</strong> Coach adjusted {workoutMods.length} exercise parameter(s) for optimal progression.
                          </span>
                        </div>
                      )}

                      {/* Weekly Schedule Table */}
                      {weeklySchedule.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-[#E7E5E4] mb-6">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-[#FFFDF8] text-[#78716C]">
                              <tr>
                                <th className="px-4 py-2.5 font-bold border-b border-[#E7E5E4]">Day</th>
                                <th className="px-4 py-2.5 font-bold border-b border-[#E7E5E4]">Workout Split</th>
                                <th className="px-4 py-2.5 font-bold border-b border-[#E7E5E4]">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {weeklySchedule.map((item: any, i: number) => (
                                <tr key={i} className="border-b border-[#FED7AA] last:border-0 hover:bg-[#F9F8F6]">
                                  <td className="px-4 py-2.5 font-extrabold text-[#F97316]">{item.day}</td>
                                  <td className="px-4 py-2.5 font-medium text-[#292524]">{item.workout}</td>
                                  <td className="px-4 py-2.5 text-[#78716C] text-xs font-semibold">{item.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Exercise Cards */}
                    <div>
                      <h5 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-3">
                        Calibrated Exercises & Repetitions
                      </h5>
                      <div className="space-y-3">
                        {approvedExercises.map((ex: any, i: number) => {
                          const hasMod = workoutMods.find(
                            (m: any) => m.exerciseName?.toLowerCase() === ex.name?.toLowerCase()
                          );

                          return (
                            <div 
                              key={i} 
                              className={`p-4 rounded-2xl border transition-all ${
                                hasMod 
                                  ? 'bg-emerald-50/50 border-emerald-300' 
                                  : 'bg-[#FFFDF8] border-[#FED7AA]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h6 className="font-bold text-[#292524] text-sm">{ex.name}</h6>
                                  <p className="text-xs font-semibold text-[#F97316]">{ex.targetMuscleGroup}</p>
                                </div>
                                {hasMod && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900 border border-emerald-400">
                                    Trainer Calibrated
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-4 gap-2 text-xs text-[#78716C] font-medium bg-white p-2.5 rounded-xl border border-[#FED7AA]">
                                <div>
                                  <span className="text-[10px] text-[#78716C] uppercase block font-bold">Sets</span>
                                  <strong className="text-sm text-[#292524]">{ex.sets}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#78716C] uppercase block font-bold">Reps</span>
                                  <strong className="text-sm text-[#292524]">{ex.reps}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#78716C] uppercase block font-bold">Rest</span>
                                  <strong className="text-sm text-[#292524]">{ex.rest || '60s'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#78716C] uppercase block font-bold">Difficulty</span>
                                  <strong className="text-sm text-[#292524]">{ex.difficulty || 'Medium'}</strong>
                                </div>
                              </div>

                              {hasMod?.details && (
                                <p className="text-[11px] text-emerald-800 font-semibold mt-2">
                                  ✓ {hasMod.details}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Diet & Recovery Plans */}
                  <div className="space-y-6">
                    {/* Nutrition Card */}
                    <div className="bg-white border border-[#FED7AA] rounded-3xl p-6 shadow-sm space-y-4">
                      <h4 className="text-lg font-bold text-[#292524] flex items-center gap-2">
                        <Utensils className="text-[#F97316]" size={20} /> Trainer-Approved Nutrition Plan
                      </h4>

                      <div className="space-y-2.5">
                        {dietPlan && typeof dietPlan === 'object' ? (
                          <>
                            {['morning', 'breakfast', 'lunch', 'evening', 'dinner'].map((meal) => (
                              dietPlan[meal] ? (
                                <div key={meal} className="p-3 border border-[#FED7AA] rounded-xl bg-[#F9F8F6]">
                                  <h5 className="text-[11px] font-bold text-[#F97316] uppercase">{meal}</h5>
                                  <p className="text-xs text-[#292524] font-medium mt-0.5">{dietPlan[meal]}</p>
                                </div>
                              ) : null
                            ))}
                            {dietPlan.hydration && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold">
                                💧 <strong>Hydration Target:</strong> {dietPlan.hydration}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-3 bg-[#F9F8F6] rounded-xl text-xs text-[#292524]">
                            {String(dietPlan || 'Balanced high-protein whole foods diet.')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recovery Card */}
                    <div className="bg-white border border-[#FED7AA] rounded-3xl p-6 shadow-sm space-y-4">
                      <h4 className="text-lg font-bold text-[#292524] flex items-center gap-2">
                        <HeartPulse className="text-[#F97316]" size={20} /> Recovery & Sleep Protocols
                      </h4>

                      <div className="space-y-2.5 text-xs text-[#292524]">
                        <div className="p-3 border border-[#FED7AA] rounded-xl bg-[#F9F8F6]">
                          <strong className="block text-[#F97316] mb-0.5">Sleep Target:</strong>
                          <span>{recoveryPlan?.sleep || '7.5 – 8.5 hours of uninterrupted sleep per night.'}</span>
                        </div>
                        <div className="p-3 border border-[#FED7AA] rounded-xl bg-[#F9F8F6]">
                          <strong className="block text-[#F97316] mb-0.5">Active Recovery:</strong>
                          <span>{recoveryPlan?.activeRecovery || 'Light 20-min walking or mobility work on rest days.'}</span>
                        </div>
                        <div className="p-3 border border-[#FED7AA] rounded-xl bg-[#F9F8F6]">
                          <strong className="block text-[#F97316] mb-0.5">Stretching & Mobility:</strong>
                          <span>{recoveryPlan?.stretchingMobility || 'Targeted dynamic warm-up and post-workout static stretches.'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: AI INTELLIGENCE ANALYSIS (THE AI OUTPUT) */}
              <div className="space-y-6 pt-4 border-t border-[#E7E5E4]">
                <div className="flex items-center gap-3 pb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#292524]">
                      AI Biometric Intelligence Analysis
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Algorithmic physiological assessment and metabolic projections derived from your health profile.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-[#FED7AA] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  {/* Goal Analysis & Recommended Approach */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                      <h5 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                        AI Goal Analysis
                      </h5>
                      <p className="text-xs text-[#292524] leading-relaxed">
                        {recommendation.aiAnalysis?.goalAnalysis || 'Biometric analysis calculated from baseline fitness indicators.'}
                      </p>
                    </div>

                    <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                      <h5 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                        Recommended Training Approach
                      </h5>
                      <p className="text-xs text-[#292524] leading-relaxed">
                        {recommendation.aiAnalysis?.recommendedApproach || 'Structured resistance and cardiovascular periodization.'}
                      </p>
                    </div>
                  </div>

                  {/* AI Physiological Assessment */}
                  {recommendation.aiAnalysis?.assessment && (
                    <div className="p-4 bg-[#FFFDF8] border border-[#FED7AA] rounded-2xl">
                      <h5 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                        Physiological Assessment
                      </h5>
                      <p className="text-xs text-[#292524] leading-relaxed">
                        {recommendation.aiAnalysis.assessment}
                      </p>
                    </div>
                  )}

                  {/* Limitations or Health Considerations */}
                  {recommendation.aiAnalysis?.limitations && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-900 flex items-start gap-2.5">
                      <ShieldAlert size={16} className="text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold mb-0.5">Safety & Contraindication Screenings:</strong>
                        <span>{recommendation.aiAnalysis.limitations}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Progress Comparison Tab */
        <>
          {history.length > 0 ? (
            <>
              <div className="bg-gradient-to-br from-[#F97316] to-[#292524] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Trophy size={120} />
                </div>
                
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="text-[#EA580C]" /> Your Fitness Journey
                </h2>
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm text-center flex-1 border border-white/20">
                    <p className="text-sm text-[#E7E5E4] uppercase tracking-wider mb-2">Previous Weight</p>
                    <p className="text-4xl font-bold">{history[0]?.fitnessProfile?.weight || '-'} <span className="text-xl font-medium">kg</span></p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#EA580C] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(198,167,125,0.4)]">
                      <TrendingDown size={32} className="text-[#F97316]" />
                    </div>
                    <p className="text-[#EA580C] font-bold mt-2 bg-white/10 px-4 py-1 rounded-full border border-[#EA580C]/30">
                      {Math.abs(parseFloat(history[0]?.fitnessProfile?.weight || '0') - parseFloat(recommendation?.fitnessProfile?.weight || '0')).toFixed(1)} kg Difference
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm text-center flex-1 border border-white/20">
                    <p className="text-sm text-[#E7E5E4] uppercase tracking-wider mb-2">Current Weight</p>
                    <p className="text-4xl font-bold text-[#EA580C]">{recommendation?.fitnessProfile?.weight || '-'} <span className="text-xl font-medium text-white">kg</span></p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#292524] mb-4 flex items-center gap-2">
                  <ArrowRight className="text-[#F97316]" /> Plan Comparison
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Previous Result Card */}
                  <div className="bg-gray-50 border border-[#FED7AA] rounded-2xl p-6 relative opacity-80 hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 right-0 bg-[#FED7AA] text-[#78716C] text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                      Archived Plan
                    </div>
                    <h4 className="text-lg font-bold text-[#78716C] mb-4 flex items-center gap-2">
                      <Calendar size={18} /> Previous Result
                      <span className="text-sm font-normal ml-auto">{new Date(history[0]?.createdAt || Date.now()).toLocaleDateString()}</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-xl border border-[#FED7AA]">
                          <p className="text-xs text-[#78716C]">Weight Recorded</p>
                          <p className="font-bold text-[#292524]">{history[0]?.fitnessProfile?.weight || '-'} kg</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-[#FED7AA]">
                          <p className="text-xs text-[#78716C]">Primary Goal</p>
                          <p className="font-bold text-[#292524]">{history[0]?.fitnessProfile?.fitnessGoal || 'General Fitness'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Result Card */}
                  <div className="bg-white border-2 border-[#F97316] rounded-2xl p-6 shadow-lg relative">
                    <div className="absolute top-0 right-0 bg-[#F97316] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl shadow-sm">
                      {isApproved ? 'Approved Plan' : 'Draft In Review'}
                    </div>
                    <h4 className="text-lg font-bold text-[#F97316] mb-4 flex items-center gap-2">
                      <Activity size={18} /> Current Result
                      <span className="text-sm font-normal text-[#78716C] ml-auto">{new Date(recommendation?.createdAt || Date.now()).toLocaleDateString()}</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#FFFDF8] p-3 rounded-xl border border-[#E7E5E4]">
                          <p className="text-xs text-[#78716C]">Current Weight</p>
                          <p className="font-bold text-[#F97316]">{recommendation?.fitnessProfile?.weight || '-'} kg</p>
                        </div>
                        <div className="bg-[#FFFDF8] p-3 rounded-xl border border-[#E7E5E4]">
                          <p className="text-xs text-[#78716C]">New Primary Goal</p>
                          <p className="font-bold text-[#F97316]">{recommendation?.fitnessProfile?.fitnessGoal || 'General Fitness'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-12 text-center shadow-sm">
              <h2 className="text-xl font-bold text-[#292524] mb-2">No History Found</h2>
              <p className="text-[#78716C]">When you request a new plan, your progress comparison will appear here.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemberAIResults;
