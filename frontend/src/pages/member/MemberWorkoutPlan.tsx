import React, { useState, useEffect } from 'react';
import {
  PlayCircle, Clock, Flame, Dumbbell, CheckCircle2,
  Activity, Utensils, Video, Play, Sparkles, User,
  HeartPulse, FileText, ShieldCheck, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import MemberExercisePlayer, { type PlayerExercise } from '../../components/workout/MemberExercisePlayer';

const MemberWorkoutPlan: React.FC = () => {
  const [activePlan, setActivePlan] = useState<any>(null);
  const [aiRec, setAiRec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<'workout' | 'nutrition' | 'recovery' | 'coach-notes' | 'summary'>('workout');

  // Completed exercise IDs in recent/current session
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Active Exercise Player state
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playerInitialIndex, setPlayerInitialIndex] = useState(0);

  useEffect(() => {
    fetchPlanData();
    fetchProgressLogs();
  }, []);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      const [planRes, aiRes] = await Promise.allSettled([
        api.get('/workout-plans/my-plan'),
        api.get('/ai/member/latest')
      ]);

      if (planRes.status === 'fulfilled' && planRes.value.data?.success && planRes.value.data.plan) {
        setActivePlan(planRes.value.data.plan);
      }

      if (aiRes.status === 'fulfilled' && aiRes.value.data?.recommendation) {
        setAiRec(aiRes.value.data.recommendation);
      }
    } catch (err) {
      console.error('Failed to fetch plan data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressLogs = async () => {
    try {
      const res = await api.get('/workout-progress/my-progress');
      if (res.data.success) {
        setStats(res.data.stats);
        if (res.data.history) {
          const completedIds = res.data.history
            .filter((h: any) => h.status === 'Completed')
            .map((h: any) => (h.exerciseId?._id || h.exerciseId)?.toString());
          setCompletedExerciseIds(completedIds);
        }
      }
    } catch (err) {
      console.error('Failed to load progress logs:', err);
    }
  };

  const handleLaunchPlayer = (index: number = 0) => {
    setPlayerInitialIndex(index);
    setIsPlayerOpen(true);
  };

  const handleExerciseCompletedInPlayer = (exerciseId: string) => {
    setCompletedExerciseIds(prev => [...prev, exerciseId]);
    fetchProgressLogs();
  };

  const currentWorkoutDays = activePlan?.workoutDays || [];
  const currentDay = currentWorkoutDays[activeDayIndex];
  const dayExercises: any[] = currentDay?.exercises || [];

  // Convert day exercises to Player format
  const playerExercises: PlayerExercise[] = dayExercises.map((item: any) => ({
    exerciseId: item.exerciseId || {},
    sets: item.sets || 3,
    repetitions: String(item.repetitions || '12'),
    duration: item.duration || 60,
    restTime: item.restTime || 30,
    trainerNotes: item.trainerNotes || ''
  }));

  const isTrainerApproved = 
    aiRec?.status === 'Trainer Approved' || 
    aiRec?.status === 'Published to Customer' ||
    activePlan?.status === 'Published';

  const isUnderReview = 
    aiRec && (
      aiRec.status === 'Pending Trainer Review' || 
      aiRec.status === 'Under Trainer Review' ||
      aiRec.status === 'AI Generated'
    ) && !isTrainerApproved;

  const finalPlan = aiRec?.finalApprovedPlan || null;
  const dietData = finalPlan?.dietPlan || aiRec?.dietRecommendation;
  const recoveryData = finalPlan?.recoveryPlan || aiRec?.recoveryRecommendations;
  const trainerNotes = finalPlan?.trainerNotes || aiRec?.trainerNotes;
  const trainerRecommendations = finalPlan?.trainerRecommendations || aiRec?.trainerRecommendations;
  const trainerName = finalPlan?.approvedByTrainerName || aiRec?.trainerId?.name || (activePlan?.trainerId?.firstName ? `${activePlan.trainerId.firstName} ${activePlan.trainerId.lastName || ''}` : 'Assigned Trainer');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative pb-16">
      {/* Navigation & Section Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FED7AA] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSection('workout')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
              activeSection === 'workout'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'bg-white text-[#78716C] hover:text-[#F97316] border border-[#FED7AA]'
            }`}
          >
            <Dumbbell size={15} /> Workout Plan
          </button>
          <button
            onClick={() => setActiveSection('nutrition')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
              activeSection === 'nutrition'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'bg-white text-[#78716C] hover:text-[#F97316] border border-[#FED7AA]'
            }`}
          >
            <Utensils size={15} /> Nutrition & Diet
          </button>
          <button
            onClick={() => setActiveSection('recovery')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
              activeSection === 'recovery'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'bg-white text-[#78716C] hover:text-[#F97316] border border-[#FED7AA]'
            }`}
          >
            <HeartPulse size={15} /> Recovery Plan
          </button>
          <button
            onClick={() => setActiveSection('coach-notes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
              activeSection === 'coach-notes'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'bg-white text-[#78716C] hover:text-[#F97316] border border-[#FED7AA]'
            }`}
          >
            <FileText size={15} /> Trainer Notes
          </button>
          <button
            onClick={() => setActiveSection('summary')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
              activeSection === 'summary'
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'bg-white text-[#78716C] hover:text-[#F97316] border border-[#FED7AA]'
            }`}
          >
            <Activity size={15} /> Analysis Summary
          </button>
        </div>

        <Link
          to="/member/progress"
          className="text-xs text-[#F97316] font-bold hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          Track Body Metrics →
        </Link>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20 text-[#78716C]">
          <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-semibold text-sm">Loading your official fitness plan...</p>
        </div>
      ) : isUnderReview ? (
        /* Status 1: Pending / Under Trainer Review State (Requirement 6: Do NOT show internal AI draft as final plan) */
        <div className="bg-white border border-[#E7E5E4] rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto shadow-sm space-y-6">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Clock size={38} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
              <Clock size={12} /> Pending Trainer Review
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#292524]">
              Your Plan is Under Trainer Review
            </h2>
            <p className="text-sm text-[#78716C] max-w-lg mx-auto leading-relaxed">
              Your assessment has been analyzed by AI and sent to your certified trainer. 
              To ensure safety and optimal progression, your final customer plan will become active only after your trainer approves it.
            </p>
          </div>

          {aiRec?.trainerId && (
            <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl max-w-md mx-auto text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-sm shrink-0">
                {aiRec.trainerId.name?.[0] || 'T'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#78716C] font-bold uppercase">Reviewing Coach</p>
                <p className="text-sm font-extrabold text-[#292524] truncate">{aiRec.trainerId.name}</p>
                <p className="text-[11px] text-[#F97316] font-semibold">{aiRec.trainerId.specialization || 'Certified Personal Trainer'}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/member/ai-assistant"
              className="px-6 py-3 bg-[#F97316] text-white font-bold rounded-xl text-xs hover:bg-[#EA580C] transition-colors shadow-sm"
            >
              View Assessment & Draft Status
            </Link>
            <Link
              to="/member/trainer-review"
              className="px-6 py-3 bg-white border border-[#E7E5E4] text-[#292524] font-bold rounded-xl text-xs hover:bg-[#F9F8F6] transition-colors"
            >
              Message Your Trainer
            </Link>
          </div>
        </div>
      ) : !activePlan && !isTrainerApproved ? (
        /* Status 2: No plan at all */
        <div className="bg-white border border-[#E7E5E4] rounded-3xl p-12 text-center shadow-sm max-w-xl mx-auto space-y-4">
          <Dumbbell size={52} className="mx-auto text-[#78716C]" />
          <h2 className="text-2xl font-bold text-[#292524]">No Fitness Plan Found</h2>
          <p className="text-sm text-[#78716C]">
            Complete your quick AI Fitness Assessment so our intelligence engine and certified trainers can build your personalized workout and diet routine.
          </p>
          <div className="pt-2">
            <Link
              to="/member/ai-assistant"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#EA580C] transition-colors shadow-md"
            >
              <Sparkles size={16} /> Complete Fitness Assessment
            </Link>
          </div>
        </div>
      ) : (
        /* Status 3: Official Trainer Approved Plan (Requirement 6) */
        <div className="space-y-6">
          {/* Main Plan Banner */}
          <div className="bg-gradient-to-br from-[#F97316] via-[#103838] to-[#292524] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-400 text-teal-950 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck size={14} /> Trainer Approved Plan
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                    Plan Status: {aiRec?.status || 'Trainer Approved'}
                  </span>
                  <span className="text-xs text-teal-200">
                    Last Updated: {new Date(aiRec?.updatedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                  My Fitness Plan
                </h1>

                <p className="text-sm text-teal-100/90 max-w-2xl leading-relaxed">
                  Personalized regime verified and approved by coach <strong>{trainerName}</strong>. 
                  Follow your calibrated exercises, repetition ranges, recovery guidelines, and nutrition targets.
                </p>
              </div>

              {dayExercises.length > 0 && (
                <button
                  onClick={() => handleLaunchPlayer(0)}
                  className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-teal-950 rounded-2xl font-black hover:opacity-95 transition-all shadow-lg shadow-black/20 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                >
                  <PlayCircle size={22} className="fill-current" />
                  <span>Start Today&apos;s Workout</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Workout Plan */}
          {activeSection === 'workout' && (
            <div className="space-y-6">
              {/* Day Tabs */}
              {currentWorkoutDays.length > 0 && (
                <div className="bg-white border border-[#FED7AA] rounded-2xl p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2">
                      {currentWorkoutDays.map((day: any, idx: number) => {
                        const isActive = activeDayIndex === idx;
                        const exCount = day.exercises?.length || 0;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveDayIndex(idx)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 text-xs font-bold ${
                              isActive
                                ? 'bg-[#F97316] text-white shadow-md'
                                : 'bg-[#FFFDF8] text-[#78716C] hover:bg-[#FED7AA]'
                            }`}
                          >
                            <span>{day.dayName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              isActive ? 'bg-white/20 text-white' : 'bg-black/10 text-[#78716C]'
                            }`}>
                              {exCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {stats && (
                      <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-[#78716C] pr-2">
                        <span>Streak: <strong className="text-emerald-700">🔥 {stats.workoutStreak || 0} Days</strong></span>
                        <span>Completed: <strong className="text-[#F97316]">{stats.completionPercentage || 0}%</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Main Workout Day Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Target Focus Card */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-gradient-to-br from-[#292524] to-[#121A1A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold mb-4 text-emerald-300">
                      <Activity size={14} /> TARGET FOCUS
                    </div>

                    <h3 className="text-2xl font-black mb-1">{currentDay?.dayName || 'Day Workout'}</h3>
                    <p className="text-xs text-white/70 mb-6">
                      {dayExercises.length} Exercises approved by {trainerName} for target muscular development.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
                        <Clock className="text-teal-400" size={20} />
                        <div>
                          <p className="text-[11px] text-white/50 font-bold uppercase">Estimated Duration</p>
                          <p className="font-extrabold text-sm text-white">
                            {dayExercises.reduce((acc, curr) => acc + (curr.duration || 60), 0) / 60 > 1
                              ? `${Math.round(dayExercises.reduce((acc, curr) => acc + (curr.duration || 60), 0) / 60)} Minutes`
                              : '45 Minutes'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
                        <Flame className="text-amber-400" size={20} />
                        <div>
                          <p className="text-[11px] text-white/50 font-bold uppercase">Estimated Burn</p>
                          <p className="font-extrabold text-sm text-white">
                            ~{dayExercises.length * 55} kcal
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
                        <Award className="text-purple-400" size={20} />
                        <div>
                          <p className="text-[11px] text-white/50 font-bold uppercase">Approval Level</p>
                          <p className="font-extrabold text-sm text-white">
                            Trainer Verified & Optimized
                          </p>
                        </div>
                      </div>
                    </div>

                    {dayExercises.length > 0 && (
                      <button
                        onClick={() => handleLaunchPlayer(0)}
                        className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-[#121818] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                      >
                        <Play size={15} className="fill-current" />
                        <span>Start Interactive Session</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Exercises List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-lg font-extrabold text-[#292524]">
                      Exercises in {currentDay?.dayName || 'Routine'} ({dayExercises.length})
                    </h3>
                    <span className="text-xs text-[#78716C]">
                      Click <strong>Watch Exercise</strong> for interactive form & timer
                    </span>
                  </div>

                  {dayExercises.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-dashed border-[#E7E5E4] rounded-3xl">
                      <p className="text-sm font-semibold text-[#78716C]">No exercises assigned for this session.</p>
                    </div>
                  ) : (
                    dayExercises.map((item: any, idx: number) => {
                      const ex = item.exerciseId || {};
                      const isCompleted = completedExerciseIds.includes(ex._id?.toString());
                      const hasVideo = !!ex.videoUrl;

                      return (
                        <div
                          key={idx}
                          className={`bg-white border rounded-3xl p-5 shadow-sm transition-all hover:shadow-md ${
                            isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-[#FED7AA]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-[#F97316] text-white'
                                }`}
                              >
                                {isCompleted ? <CheckCircle2 size={24} /> : idx + 1}
                              </div>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-extrabold text-base text-[#292524]">
                                    {ex.name || 'Exercise'}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFFDF8] text-[#78716C]">
                                    {ex.category || 'Resistance'}
                                  </span>
                                  {hasVideo && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                                      <Video size={10} /> Animated Guide
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-[#78716C] font-semibold pt-0.5">
                                  <span className="text-[#F97316] font-extrabold">
                                    {item.sets || 3} Sets × {item.repetitions || 12} Reps
                                  </span>
                                  <span>•</span>
                                  <span>{item.duration || 60}s Duration</span>
                                  <span>•</span>
                                  <span>{item.restTime || ex.defaultRest || 30}s Rest</span>
                                  {ex.targetMuscle && (
                                    <>
                                      <span>•</span>
                                      <span className="text-[#78716C]">{ex.targetMuscle}</span>
                                    </>
                                  )}
                                </div>

                                {item.trainerNotes && (
                                  <p className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-100 px-3 py-1 rounded-xl mt-1.5 font-medium">
                                    <strong>Coach Tip:</strong> {item.trainerNotes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleLaunchPlayer(idx)}
                              className="px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0 sm:self-center"
                            >
                              <Play size={14} className="fill-current" />
                              <span>Watch Exercise</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Diet & Nutrition Recommendations */}
          {activeSection === 'nutrition' && (
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-[#FED7AA] pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Utensils size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#292524]">Diet & Nutrition Recommendations</h3>
                  <p className="text-xs text-[#78716C]">Calibrated by {trainerName} for your fitness targets.</p>
                </div>
              </div>

              {dietData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">Pre-Breakfast / Morning</span>
                    <p className="text-sm font-semibold text-[#292524] mt-1">{dietData.morning || 'Hydration & light snack'}</p>
                  </div>
                  <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">Breakfast</span>
                    <p className="text-sm font-semibold text-[#292524] mt-1">{dietData.breakfast || 'Protein & complex carbs'}</p>
                  </div>
                  <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">Lunch</span>
                    <p className="text-sm font-semibold text-[#292524] mt-1">{dietData.lunch || 'Balanced macro meal'}</p>
                  </div>
                  <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">Evening Snack</span>
                    <p className="text-sm font-semibold text-[#292524] mt-1">{dietData.evening || 'Healthy nuts & recovery drink'}</p>
                  </div>
                  <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">Dinner</span>
                    <p className="text-sm font-semibold text-[#292524] mt-1">{dietData.dinner || 'Lean protein & green vegetables'}</p>
                  </div>
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Hydration Target</span>
                    <p className="text-sm font-extrabold text-teal-950 mt-1">💧 {dietData.hydration || '3.0 - 3.5 Liters daily'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#78716C]">Nutrition data has not been logged yet.</p>
              )}

              {dietData?.note && (
                <div className="p-4 bg-[#FFFDF8] border border-[#FED7AA] rounded-2xl text-xs text-[#78716C]">
                  <strong>Nutrition Guidance Note:</strong> {dietData.note}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Recovery Recommendations */}
          {activeSection === 'recovery' && (
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-[#FED7AA] pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#292524]">Recovery & Regeneration Protocol</h3>
                  <p className="text-xs text-[#78716C]">Approved muscle repair and fatigue management guidelines.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-2">
                  <span className="text-xs font-bold uppercase text-[#F97316] tracking-wider block">Sleep Target</span>
                  <p className="text-sm text-[#292524] leading-relaxed">
                    {recoveryData?.sleep || '7.5 – 8.5 hours of uninterrupted deep sleep.'}
                  </p>
                </div>

                <div className="p-5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-2">
                  <span className="text-xs font-bold uppercase text-[#F97316] tracking-wider block">Active Recovery</span>
                  <p className="text-sm text-[#292524] leading-relaxed">
                    {recoveryData?.activeRecovery || '15–20 min light walking or swimming on off-days.'}
                  </p>
                </div>

                <div className="p-5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-2">
                  <span className="text-xs font-bold uppercase text-[#F97316] tracking-wider block">Stretching & Mobility</span>
                  <p className="text-sm text-[#292524] leading-relaxed">
                    {recoveryData?.stretchingMobility || 'Daily dynamic stretching warm-up and post-workout static holds.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Trainer Recommendations & Coach Notes */}
          {activeSection === 'coach-notes' && (
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-[#FED7AA] pb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-[#F97316] flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#292524]">Trainer Recommendations & Notes</h3>
                  <p className="text-xs text-[#78716C]">Direct guidance from your coach {trainerName}.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 mb-1">
                    Coach Specific Recommendations
                  </h4>
                  <p className="text-sm text-emerald-950 leading-relaxed">
                    {trainerRecommendations || 'Maintain progressive overload while keeping rest intervals consistent. Record your training weights in the workout player.'}
                  </p>
                </div>

                {trainerNotes && (
                  <div className="p-5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#292524] mb-1">
                      Personal Notes for Customer
                    </h4>
                    <p className="text-sm text-[#78716C] leading-relaxed whitespace-pre-wrap">
                      {trainerNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Fitness Analysis Summary */}
          {activeSection === 'summary' && (
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-[#FED7AA] pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#292524]">Fitness Analysis Summary</h3>
                  <p className="text-xs text-[#78716C]">Analytical breakdown of your assessment metrics.</p>
                </div>
              </div>

              <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl text-sm text-[#292524] leading-relaxed">
                {aiRec?.aiAnalysis?.fitnessSummary || 'Biometric analysis generated for personal transformation.'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#FED7AA] rounded-2xl">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase mb-1">Goal Analysis</h4>
                  <p className="text-xs text-[#292524] leading-relaxed">
                    {aiRec?.aiAnalysis?.goalAnalysis || 'Analysis verified by personal trainer.'}
                  </p>
                </div>
                <div className="p-4 bg-white border border-[#FED7AA] rounded-2xl">
                  <h4 className="text-xs font-bold text-[#78716C] uppercase mb-1">Recommended Approach</h4>
                  <p className="text-xs text-[#292524] leading-relaxed">
                    {aiRec?.aiAnalysis?.recommendedApproach || 'Standard resistance split.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Exercise Player Modal */}
      {isPlayerOpen && (
        <MemberExercisePlayer
          planId={activePlan?._id || ''}
          dayName={currentDay?.dayName || 'Workout'}
          exercises={playerExercises}
          initialIndex={playerInitialIndex}
          onClose={() => setIsPlayerOpen(false)}
          onCompleteExercise={handleExerciseCompletedInPlayer}
        />
      )}
    </div>
  );
};

export default MemberWorkoutPlan;
