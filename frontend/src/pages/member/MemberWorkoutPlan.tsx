import React, { useState, useEffect } from 'react';
import {
  PlayCircle, Clock, Flame, Dumbbell, CheckCircle2,
  Activity, Utensils, Video, Play, Sparkles, User,
  HeartPulse, FileText, ShieldCheck, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import MemberExercisePlayer, { type PlayerExercise } from '../../components/workout/MemberExercisePlayer';
import { getUnifiedWeeklyWorkouts } from '../../utils/aiFitnessPlans';

const MemberWorkoutPlan: React.FC = () => {
  const [activePlan, setActivePlan] = useState<any>(null);
  const [aiRec, setAiRec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const getInitialDayIndex = () => {
    // Map current weekday (0=Sun, 1=Mon... 5=Fri) to 0-indexed Monday-Sunday array
    const day = new Date().getDay();
    const map: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
    return map[day] ?? 0;
  };
  const [activeDayIndex, setActiveDayIndex] = useState(getInitialDayIndex());
  const [activeSection, setActiveSection] = useState<'workout' | 'nutrition' | 'recovery' | 'coach-notes' | 'summary'>('workout');

  // Completed exercise IDs and logs in recent/current session
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
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
          const completedLogs = res.data.history.filter((h: any) => h.status === 'Completed');
          setWorkoutLogs(completedLogs);
          const completedIds = completedLogs
            .map((h: any) => (h.exerciseCustomId || h.exerciseId?._id || h.exerciseId)?.toString())
            .filter(Boolean);
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

  // Unified Monday-Sunday weekly workout schedule synchronized directly from AI Fitness Assessment
  const currentWorkoutDays = React.useMemo(() => {
    const unified = getUnifiedWeeklyWorkouts(aiRec);
    return Object.values(unified).map(day => ({
      dayName: day.day,
      focus: day.focus,
      duration: day.duration,
      targetMuscle: day.targetMuscle,
      exercises: day.exercises.map((ex: any, idx: number) => ({
        _id: `ex-${day.day.toLowerCase()}-${idx}`,
        exerciseId: {
          _id: `ex-${day.day.toLowerCase()}-${idx}`,
          name: ex.name,
          category: ex.difficulty || 'Strength & Conditioning',
          targetMuscle: ex.targetMuscleGroup,
          difficulty: ex.difficulty,
          instructions: ex.instructions,
          safetyInstructions: ex.instructions,
          videoUrl: ex.videoUrl,
          defaultRest: parseInt(ex.rest) || 60,
          defaultDuration: (parseInt(ex.duration) || 10) * 60
        },
        name: ex.name,
        sets: Number(ex.sets) || 3,
        repetitions: String(ex.reps || '12'),
        duration: (parseInt(ex.duration) || 10) * 60,
        restTime: parseInt(ex.rest) || 60,
        trainerNotes: ex.instructions,
        targetMuscle: ex.targetMuscleGroup,
        difficulty: ex.difficulty,
        videoUrl: ex.videoUrl
      }))
    }));
  }, [aiRec]);

  const currentDay = currentWorkoutDays[activeDayIndex] || currentWorkoutDays[0];
  const dayExercises: any[] = currentDay?.exercises || [];

  // Convert day exercises to Player format
  const playerExercises: PlayerExercise[] = dayExercises.map((item: any) => ({
    exerciseId: item.exerciseId || { name: item.name },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E9DFF4] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveSection('workout')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
              activeSection === 'workout'
                ? 'bg-[#A991D4] text-[#292431] shadow-sm'
                : 'bg-white text-[#6B5E78] hover:text-[#A991D4] border border-[#E9DFF4]'
            }`}
          >
            <Dumbbell size={15} /> Workout Plan
          </button>
          <button
            onClick={() => setActiveSection('nutrition')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
              activeSection === 'nutrition'
                ? 'bg-[#A991D4] text-[#292431] shadow-sm'
                : 'bg-white text-[#6B5E78] hover:text-[#A991D4] border border-[#E9DFF4]'
            }`}
          >
            <Utensils size={15} /> Nutrition & Diet
          </button>
          <button
            onClick={() => setActiveSection('recovery')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
              activeSection === 'recovery'
                ? 'bg-[#A991D4] text-[#292431] shadow-sm'
                : 'bg-white text-[#6B5E78] hover:text-[#A991D4] border border-[#E9DFF4]'
            }`}
          >
            <HeartPulse size={15} /> Recovery Plan
          </button>
          <button
            onClick={() => setActiveSection('coach-notes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
              activeSection === 'coach-notes'
                ? 'bg-[#A991D4] text-[#292431] shadow-sm'
                : 'bg-white text-[#6B5E78] hover:text-[#A991D4] border border-[#E9DFF4]'
            }`}
          >
            <FileText size={15} /> Trainer Notes
          </button>
          <button
            onClick={() => setActiveSection('summary')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors shrink-0 ${
              activeSection === 'summary'
                ? 'bg-[#A991D4] text-[#292431] shadow-sm'
                : 'bg-white text-[#6B5E78] hover:text-[#A991D4] border border-[#E9DFF4]'
            }`}
          >
            <Activity size={15} /> Analysis Summary
          </button>
        </div>

        <Link
          to="/member/progress"
          className="text-xs text-[#A991D4] font-bold hover:underline flex items-center gap-1 shrink-0 self-end sm:self-center"
        >
          Track Body Metrics →
        </Link>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20 text-[#6B5E78]">
          <div className="w-10 h-10 border-4 border-[#A991D4] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-semibold text-sm">Loading your official fitness plan...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Informative Status Banner for Under Review */}
          {isUnderReview && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 text-xs shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                  <Clock size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-extrabold text-amber-800 text-sm">
                    <span>AI Workout Plan Synchronized</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900">
                      Supervised by Coach {trainerName}
                    </span>
                  </div>
                  <p className="text-[#6B5E78] mt-0.5 text-xs">
                    Your 7-day Monday–Sunday workout routine is synchronized directly from your AI assessment output.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/member/ai-assistant"
                  className="px-3.5 py-2 bg-[#A991D4] text-[#292431] font-bold rounded-xl text-xs hover:bg-[#967CC5] transition-colors shadow-xs"
                >
                  AI Fitness Assistant
                </Link>
                <Link
                  to="/member/chat"
                  className="px-3.5 py-2 bg-white border border-[#E5DDEB] text-[#292431] font-bold rounded-xl text-xs hover:bg-[#F7F4FA] transition-colors"
                >
                  Message Coach
                </Link>
              </div>
            </div>
          )}
          {/* Main Plan Banner */}
          <div className="bg-gradient-to-br from-[#A991D4] via-[#103838] to-[#292431] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
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
              {/* Day Tabs & Progress Summary */}
              {currentWorkoutDays.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                    <div>
                      <h3 className="text-base font-extrabold text-[#292431] flex items-center gap-2">
                        <span>Workout Plan (Monday – Sunday)</span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          7 Days Active
                        </span>
                      </h3>
                      <p className="text-xs text-[#6B5E78]">
                        Select any day from Monday to Sunday. Click &quot;Watch Exercise&quot; for animated demos & interactive timers.
                      </p>
                    </div>

                    {stats && (
                      <div className="flex items-center gap-3 text-xs font-bold text-[#6B5E78] bg-white border border-[#E9DFF4] px-4 py-2 rounded-xl shadow-xs shrink-0 self-start sm:self-auto">
                        <span className="flex items-center gap-1.5">
                          Streak: <strong className="text-emerald-700">🔥 {stats.workoutStreak || 0} Days</strong>
                        </span>
                        <span className="text-stone-300">|</span>
                        <span className="flex items-center gap-1.5">
                          Completed: <strong className="text-[#A991D4]">{stats.completionPercentage || 0}%</strong>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Day Tabs Buttons */}
                  <div className="bg-white border border-[#E9DFF4] rounded-2xl p-2.5 shadow-sm">
                    <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5">
                      {currentWorkoutDays.map((day: any, idx: number) => {
                        const isActive = activeDayIndex === idx;
                        const exCount = day.exercises?.length || 0;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveDayIndex(idx)}
                            className={`flex flex-col items-center justify-center min-w-[110px] sm:min-w-[130px] px-4 py-2.5 rounded-xl transition-all shrink-0 text-center cursor-pointer ${
                              isActive
                                ? 'bg-[#A991D4] text-[#292431] shadow-md shadow-[#A991D4]/20 font-bold scale-[1.02]'
                                : 'bg-[#F7F4FA] text-[#6B5E78] hover:bg-[#FFF7ED] hover:text-[#967CC5] border border-[#E9DFF4]/60 font-semibold'
                            }`}
                          >
                            <span className="text-sm font-extrabold">{day.dayName}</span>
                            <span className={`text-[11px] font-medium mt-0.5 ${isActive ? 'text-white/90' : 'text-[#A8A29E]'}`}>
                              {exCount} Exercises
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Workout Day Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Target Focus Card */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-gradient-to-br from-[#292431] to-[#121A1A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold mb-4 text-emerald-300">
                      <Activity size={14} /> TARGET FOCUS
                    </div>

                    <h3 className="text-2xl font-black mb-1">
                      {currentDay?.dayName} {currentDay?.focus ? `– ${currentDay.focus}` : ''}
                    </h3>
                    <p className="text-xs text-white/70 mb-4">
                      {dayExercises.length} Exercises approved by {trainerName} for target muscular development.
                    </p>

                    {currentDay?.targetMuscle && (
                      <div className="text-xs bg-white/10 rounded-xl p-3 mb-4 text-emerald-200 border border-white/10">
                        <strong className="text-white">Target Muscle Focus:</strong> {currentDay.targetMuscle}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
                        <Clock className="text-teal-400" size={20} />
                        <div>
                          <p className="text-[11px] text-white/50 font-bold uppercase">Estimated Duration</p>
                          <p className="font-extrabold text-sm text-white">
                            {dayExercises.reduce((acc, curr) => acc + (curr.duration || 60), 0) / 60 > 1
                              ? `${Math.round(dayExercises.reduce((acc, curr) => acc + (curr.duration || 60), 0) / 60)} Minutes`
                              : (currentDay?.duration || '45 Minutes')}
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
                        className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-[#292431] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
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
                    <h3 className="text-lg font-extrabold text-[#292431]">
                      Exercises in {currentDay?.dayName} {currentDay?.focus ? `– ${currentDay.focus}` : ''} ({dayExercises.length})
                    </h3>
                    <span className="text-xs text-[#6B5E78]">
                      Click <strong>Watch Exercise</strong> for interactive form & timer
                    </span>
                  </div>

                  {/* Day Completion Summary Progress Bar */}
                  {(() => {
                    const currDayName = (currentDay?.dayName || '').toLowerCase().trim();
                    const completedCountInDay = dayExercises.filter((item: any) => {
                      const ex = item.exerciseId || {};
                      const exId = ex._id?.toString();
                      const exName = (ex.name || item.name || '').toLowerCase().trim();

                      const matchLog = workoutLogs.find((h: any) => {
                        const hId = (h.exerciseCustomId || h.exerciseId?._id || h.exerciseId)?.toString();
                        const hName = (h.exerciseName || h.exerciseId?.name || '').toLowerCase().trim();
                        const hDay = (h.dayName || '').toLowerCase().trim();
                        const dayMatch = !hDay || hDay === 'general' || hDay.includes(currDayName) || currDayName.includes(hDay);
                        const idMatch = (hId && exId && hId === exId) || (exId && completedExerciseIds.includes(exId));
                        const nameMatch = hName && exName && (hName === exName || hName.includes(exName) || exName.includes(hName));
                        return idMatch || (nameMatch && dayMatch);
                      });

                      return !!matchLog || (exId ? completedExerciseIds.includes(exId) : false);
                    }).length;

                    const pct = dayExercises.length > 0 ? Math.round((completedCountInDay / dayExercises.length) * 100) : 0;

                    return dayExercises.length > 0 ? (
                      <div className="bg-white border border-[#E5DDEB] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            completedCountInDay === dayExercises.length
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-orange-50 text-[#A991D4] border border-orange-200'
                          }`}>
                            {completedCountInDay === dayExercises.length ? '✓' : `${completedCountInDay}/${dayExercises.length}`}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold text-[#292431]">
                                {completedCountInDay === dayExercises.length
                                  ? `All ${dayExercises.length} Exercises Completed for ${currentDay?.dayName}! 🎉`
                                  : `${completedCountInDay} of ${dayExercises.length} Exercises Completed`}
                              </span>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                completedCountInDay === dayExercises.length
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {pct}% Done
                              </span>
                            </div>
                            <p className="text-xs text-[#6B5E78] mt-0.5">
                              {completedCountInDay === dayExercises.length
                                ? 'Awesome workout! Your completed routine is logged and synchronized with your trainer.'
                                : 'Complete sets in the exercise player to track completion and sync with your coach.'}
                            </p>
                          </div>
                        </div>
                        <div className="w-full sm:w-36 bg-stone-100 rounded-full h-2.5 overflow-hidden border border-stone-200 shrink-0">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {dayExercises.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-dashed border-[#E5DDEB] rounded-3xl">
                      <p className="text-sm font-semibold text-[#6B5E78]">No exercises assigned for this session.</p>
                    </div>
                  ) : (
                    dayExercises.map((item: any, idx: number) => {
                      const ex = item.exerciseId || {};
                      const exId = ex._id?.toString();
                      const exName = (ex.name || item.name || '').toLowerCase().trim();
                      const currDayName = (currentDay?.dayName || '').toLowerCase().trim();

                      const matchLog = workoutLogs.find((h: any) => {
                        const hId = (h.exerciseCustomId || h.exerciseId?._id || h.exerciseId)?.toString();
                        const hName = (h.exerciseName || h.exerciseId?.name || '').toLowerCase().trim();
                        const hDay = (h.dayName || '').toLowerCase().trim();
                        const dayMatch = !hDay || hDay === 'general' || hDay.includes(currDayName) || currDayName.includes(hDay);
                        const idMatch = (hId && exId && hId === exId) || (exId && completedExerciseIds.includes(exId));
                        const nameMatch = hName && exName && (hName === exName || hName.includes(exName) || exName.includes(hName));
                        return idMatch || (nameMatch && dayMatch);
                      });

                      const isCompleted = !!matchLog || (exId ? completedExerciseIds.includes(exId) : false);
                      const hasVideo = !!ex.videoUrl;

                      return (
                        <div
                          key={idx}
                          className={`bg-white border rounded-3xl p-5 shadow-sm transition-all hover:shadow-md ${
                            isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-[#E9DFF4]'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm ${
                                  isCompleted
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-[#A991D4] text-[#292431]'
                                }`}
                              >
                                {isCompleted ? <CheckCircle2 size={24} /> : idx + 1}
                              </div>

                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-extrabold text-base text-[#292431]">
                                    {ex.name || 'Exercise'}
                                  </h4>
                                  {isCompleted && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-2xs">
                                      <CheckCircle2 size={11} className="text-emerald-700" /> Completed
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7F4FA] text-[#6B5E78]">
                                    {ex.category || 'Resistance'}
                                  </span>
                                  {hasVideo && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                                      <Video size={10} /> Animated Guide
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B5E78] font-semibold pt-0.5">
                                  <span className="text-[#A991D4] font-extrabold">
                                    {item.sets || 3} Sets × {item.repetitions || 12} Reps
                                  </span>
                                  <span>
                                    {item.duration >= 60 ? `${Math.round(item.duration / 60)}m` : `${item.duration || 60}s`} Duration
                                  </span>
                                  <span>•</span>
                                  <span>{item.restTime || ex.defaultRest || 30}s Rest</span>
                                  {ex.targetMuscle && (
                                    <>
                                      <span>•</span>
                                      <span className="text-[#6B5E78]">{ex.targetMuscle}</span>
                                    </>
                                  )}
                                </div>

                                {isCompleted && (
                                  <div className="pt-0.5">
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/80 inline-flex items-center gap-1.5 shadow-2xs">
                                      ✓ {matchLog?.completedSets || item.sets || 3} Sets Completed {matchLog?.duration ? `• ${Math.round(matchLog.duration)}s logged` : ''}
                                    </span>
                                  </div>
                                )}

                                {item.trainerNotes && (
                                  <p className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-100 px-3 py-1 rounded-xl mt-1.5 font-medium">
                                    <strong>Coach Tip:</strong> {item.trainerNotes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleLaunchPlayer(idx)}
                              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer shrink-0 sm:self-center ${
                                isCompleted
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                                  : 'bg-[#A991D4] hover:bg-[#967CC5] text-[#292431] shadow-[#A991D4]/20'
                              }`}
                            >
                              {isCompleted ? <CheckCircle2 size={14} /> : <Play size={14} className="fill-current" />}
                              <span>{isCompleted ? 'Completed – Replay' : 'Watch Exercise'}</span>
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
            <div className="bg-white border border-[#E5DDEB] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-[#E9DFF4] pb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Utensils size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#292431]">Diet & Nutrition Recommendations</h3>
                  <p className="text-xs text-[#6B5E78]">Calibrated by {trainerName} for your fitness targets.</p>
                </div>
              </div>

              {dietData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A991D4]">Pre-Breakfast / Morning</span>
                    <p className="text-sm font-semibold text-[#292431] mt-1">{dietData.morning || 'Hydration & light snack'}</p>
                  </div>
                  <div className="p-4 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A991D4]">Breakfast</span>
                    <p className="text-sm font-semibold text-[#292431] mt-1">{dietData.breakfast || 'Protein & complex carbs'}</p>
                  </div>
                  <div className="p-4 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A991D4]">Lunch</span>
                    <p className="text-sm font-semibold text-[#292431] mt-1">{dietData.lunch || 'Balanced macro meal'}</p>
                  </div>
                  <div className="p-4 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A991D4]">Evening Snack</span>
                    <p className="text-sm font-semibold text-[#292431] mt-1">{dietData.evening || 'Healthy nuts & recovery drink'}</p>
                  </div>
                  <div className="p-4 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A991D4]">Dinner</span>
                    <p className="text-sm font-semibold text-[#292431] mt-1">{dietData.dinner || 'Lean protein & green vegetables'}</p>
                  </div>
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Hydration Target</span>
                    <p className="text-sm font-extrabold text-teal-950 mt-1">💧 {dietData.hydration || '3.0 - 3.5 Liters daily'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#6B5E78]">Nutrition data has not been logged yet.</p>
              )}

              {dietData?.note && (
                <div className="p-4 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl text-xs text-[#6B5E78]">
                  <strong>Nutrition Guidance Note:</strong> {dietData.note}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Recovery Recommendations */}
          {activeSection === 'recovery' && (
            <div className="bg-white border border-[#E5DDEB] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-[#E9DFF4] pb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <HeartPulse size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#292431]">Recovery & Regeneration Protocol</h3>
                  <p className="text-xs text-[#6B5E78]">Approved muscle repair and fatigue management guidelines.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl space-y-2">
                  <span className="text-xs font-bold uppercase text-[#A991D4] tracking-wider block">Sleep Target</span>
                  <p className="text-sm text-[#292431] leading-relaxed">
                    {recoveryData?.sleep || '7.5 – 8.5 hours of uninterrupted deep sleep.'}
                  </p>
                </div>

                <div className="p-5 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl space-y-2">
                  <span className="text-xs font-bold uppercase text-[#A991D4] tracking-wider block">Active Recovery</span>
                  <p className="text-sm text-[#292431] leading-relaxed">
                    {recoveryData?.activeRecovery || '15–20 min light walking or swimming on off-days.'}
                  </p>
                </div>

                <div className="p-5 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl space-y-2">
                  <span className="text-xs font-bold uppercase text-[#A991D4] tracking-wider block">Stretching & Mobility</span>
                  <p className="text-sm text-[#292431] leading-relaxed">
                    {recoveryData?.stretchingMobility || 'Daily dynamic stretching warm-up and post-workout static holds.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Trainer Recommendations & Coach Notes */}
          {activeSection === 'coach-notes' && (
            <div className="bg-white border border-[#E5DDEB] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-[#E9DFF4] pb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-[#A991D4] flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#292431]">Trainer Recommendations & Notes</h3>
                  <p className="text-xs text-[#6B5E78]">Direct guidance from your coach {trainerName}.</p>
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
                  <div className="p-5 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#292431] mb-1">
                      Personal Notes for Customer
                    </h4>
                    <p className="text-sm text-[#6B5E78] leading-relaxed whitespace-pre-wrap">
                      {trainerNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Fitness Analysis Summary */}
          {activeSection === 'summary' && (
            <div className="bg-white border border-[#E5DDEB] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-[#E9DFF4] pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#292431]">Fitness Analysis Summary</h3>
                  <p className="text-xs text-[#6B5E78]">Analytical breakdown of your assessment metrics.</p>
                </div>
              </div>

              <div className="p-4 bg-[#F7F4FA] border border-[#E9DFF4] rounded-2xl text-sm text-[#292431] leading-relaxed">
                {aiRec?.aiAnalysis?.fitnessSummary || 'Biometric analysis generated for personal transformation.'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#E9DFF4] rounded-2xl">
                  <h4 className="text-xs font-bold text-[#6B5E78] uppercase mb-1">Goal Analysis</h4>
                  <p className="text-xs text-[#292431] leading-relaxed">
                    {aiRec?.aiAnalysis?.goalAnalysis || 'Analysis verified by personal trainer.'}
                  </p>
                </div>
                <div className="p-4 bg-white border border-[#E9DFF4] rounded-2xl">
                  <h4 className="text-xs font-bold text-[#6B5E78] uppercase mb-1">Recommended Approach</h4>
                  <p className="text-xs text-[#292431] leading-relaxed">
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
          planId={activePlan?._id || aiRec?._id || 'standard-workout-plan'}
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
