import React, { useState, useEffect } from 'react';
import {
  Dumbbell, Loader2, Flame, Clock, CheckCircle2, RefreshCw, PlayCircle,
  Calendar, ChevronDown, Check, Utensils, Apple, Coffee, Moon, Sun, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MemberProgress: React.FC = () => {
  // Plan type toggle: 'workout' or 'diet'
  const [activePlanType, setActivePlanType] = useState<'workout' | 'diet'>('workout');

  // Workout progress state
  const [workoutStats, setWorkoutStats] = useState<any>(null);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [workoutDayBreakdown, setWorkoutDayBreakdown] = useState<Record<string, any>>({});
  const [loadingWorkoutProgress, setLoadingWorkoutProgress] = useState(true);
  const [activePlan, setActivePlan] = useState<any>(null);

  // Diet progress state
  const [dietOverview, setDietOverview] = useState<any>(null);
  const [dietHistory, setDietHistory] = useState<any[]>([]);
  const [loadingDietProgress, setLoadingDietProgress] = useState(true);

  // Day filter
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const fetchWorkoutProgress = async () => {
    try {
      setLoadingWorkoutProgress(true);
      const [progressRes, planRes] = await Promise.allSettled([
        api.get('/workout-progress/my-progress'),
        api.get('/workout-plans/my-plan')
      ]);

      if (progressRes.status === 'fulfilled' && progressRes.value.data?.success) {
        setWorkoutStats(progressRes.value.data.stats || null);
        setWorkoutHistory(progressRes.value.data.history || []);
        if (progressRes.value.data.dayBreakdown) {
          setWorkoutDayBreakdown(progressRes.value.data.dayBreakdown);
        }
      }

      if (planRes.status === 'fulfilled' && planRes.value.data?.success && planRes.value.data.plan) {
        setActivePlan(planRes.value.data.plan);
      }
    } catch (err) {
      console.error('Failed to load workout progress:', err);
    } finally {
      setLoadingWorkoutProgress(false);
    }
  };

  const fetchDietProgress = async () => {
    try {
      setLoadingDietProgress(true);
      const res = await api.get('/diet-progress/my-progress');
      if (res.data?.success) {
        setDietOverview(res.data.overview || null);
        setDietHistory(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load diet progress:', err);
    } finally {
      setLoadingDietProgress(false);
    }
  };

  useEffect(() => {
    fetchWorkoutProgress();
    fetchDietProgress();
  }, []);

  const getMealIcon = (type: string) => {
    const lower = (type || '').toLowerCase();
    if (lower.includes('morning') || lower.includes('hydration')) return <Sun size={15} className="text-amber-500" />;
    if (lower.includes('breakfast')) return <Coffee size={15} className="text-orange-500" />;
    if (lower.includes('lunch')) return <Utensils size={15} className="text-emerald-500" />;
    if (lower.includes('dinner')) return <Moon size={15} className="text-indigo-500" />;
    return <Apple size={15} className="text-rose-500" />;
  };

  // Workout day data preparation
  const dayWorkplanData = DAYS_LIST.map((dName) => {
    const serverDay = workoutDayBreakdown[dName];
    if (serverDay && serverDay.exercises && serverDay.exercises.length > 0) {
      return {
        dayName: dName,
        focusArea: serverDay.focus || `${dName} Workout Routine`,
        exercises: serverDay.exercises.map((ex: any) => ({
          id: ex.exerciseId,
          name: ex.name,
          muscle: ex.targetMuscle || ex.category || 'General',
          sets: ex.sets || 3,
          reps: ex.reps || '12',
          duration: ex.targetDuration || 60,
          isCompleted: !!ex.isCompleted,
          loggedSets: ex.completedSets || (ex.isCompleted ? ex.sets : 0),
          loggedDuration: ex.duration || 60,
          completedAt: ex.completedAt
        })),
        completedCount: serverDay.completedExercises || 0,
        totalCount: serverDay.totalExercises || serverDay.exercises.length,
        completionPct: serverDay.completionPercentage || 0,
        totalSetsLogged: serverDay.completedSets || 0,
        totalMinutes: serverDay.totalDurationMinutes || 0,
        isFullyCompleted: serverDay.completionPercentage === 100,
        isInProgress: serverDay.completionPercentage > 0 && serverDay.completionPercentage < 100
      };
    }

    const planDay = activePlan?.workoutDays?.find((d: any) =>
      (d.dayName || '').toLowerCase().includes(dName.toLowerCase())
    );

    return {
      dayName: dName,
      focusArea: planDay?.focusArea || planDay?.dayName || `${dName} Routine`,
      exercises: [],
      completedCount: 0,
      totalCount: 0,
      completionPct: 0,
      totalSetsLogged: 0,
      totalMinutes: 0,
      isFullyCompleted: false,
      isInProgress: false
    };
  });

  const activeDayWorkout = dayWorkplanData.find(d => d.dayName === selectedDay) || dayWorkplanData[0];

  // Diet day data preparation
  const dietDayBreakdown = dietOverview?.dayBreakdown || {};
  const activeDayDiet = dietDayBreakdown[selectedDay] ||
    (Object.values(dietDayBreakdown) as any[]).find((d: any) => (d?.day || '').toLowerCase() === selectedDay.toLowerCase()) ||
    dietDayBreakdown['Monday'] || null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 animate-fade-in">
      {/* ── Top Header Banner with Mode Switcher (Workout Plan vs Diet Plan) ── */}
      <div className="bg-white border border-[#292940] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              activePlanType === 'workout' ? 'bg-orange-100 text-[#4F46E5]' : 'bg-emerald-100 text-emerald-800'
            }`}>
              <CheckCircle2 size={13} />
              <span>{activePlanType === 'workout' ? 'Personal Workout Progress' : 'Nutrition & Diet Progress'}</span>
            </span>
            <span className="text-xs text-[#A1A1AA] font-semibold">
              • {activePlanType === 'workout' ? 'Live Training Tracker' : 'Live Meal Adherence'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#11111F] tracking-tight mb-1">
            {activePlanType === 'workout' ? 'Workout Progress' : 'Diet Work Plan Progress'}
          </h1>
          <p className="text-[#A1A1AA] text-xs sm:text-sm max-w-2xl">
            {activePlanType === 'workout'
              ? 'Track your workout streak, completed animated exercises, sets, and training adherence.'
              : 'Track your daily nutrition goals, completed meals, calorie intake, and macronutrient balance.'}
          </p>
        </div>

        {/* ── Option Switcher Buttons: Workout Plan vs Diet Plan ── */}
        <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shrink-0 shadow-inner">
          <button
            onClick={() => {
              setActivePlanType('workout');
              setSelectedDay('all');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activePlanType === 'workout'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Dumbbell size={16} />
            <span>Workout Plan</span>
          </button>
          <button
            onClick={() => {
              setActivePlanType('diet');
              setSelectedDay('all');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activePlanType === 'diet'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Utensils size={16} />
            <span>Diet Work Plan</span>
          </button>
        </div>
      </div>

      {/* ===================== WORKOUT PROGRESS ===================== */}
      {activePlanType === 'workout' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top 4 Workout Progress Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#292940] rounded-2xl p-5 shadow-xs hover:border-[#6366F1]/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Total Workouts</span>
                <Dumbbell size={18} className="text-[#6366F1]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-[#11111F]">
                  {workoutStats?.totalWorkouts || 0}
                </span>
                <span className="text-xs text-[#A1A1AA] font-bold">sessions</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {workoutStats?.weeklyWorkoutCount || 0} workouts this week
              </span>
            </div>

            <div className="bg-white border border-[#292940] rounded-2xl p-5 shadow-xs hover:border-[#6366F1]/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Exercises Done</span>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {workoutStats?.totalExercisesCompleted || 0}
                </span>
                <span className="text-xs text-[#A1A1AA] font-bold">completed</span>
              </div>
              <span className="text-[11px] text-[#A1A1AA] font-semibold mt-1 block">
                Across all plan routines
              </span>
            </div>

            <div className="bg-white border border-[#292940] rounded-2xl p-5 shadow-xs hover:border-[#6366F1]/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Workout Streak</span>
                <Flame size={18} className="text-amber-500 fill-amber-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                  {workoutStats?.workoutStreak || 0}
                </span>
                <span className="text-xs text-[#A1A1AA] font-bold">days streak</span>
              </div>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                🔥 Keep consistency alive!
              </span>
            </div>

            <div className="bg-white border border-[#292940] rounded-2xl p-5 shadow-xs hover:border-[#6366F1]/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Total Time</span>
                <Clock size={18} className="text-teal-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-[#11111F]">
                  {workoutStats?.totalWorkoutMinutes || 0}
                </span>
                <span className="text-xs text-[#A1A1AA] font-bold">minutes</span>
              </div>
              <span className="text-[11px] text-[#A1A1AA] font-semibold mt-1 block">
                Logged training time
              </span>
            </div>
          </div>

          {/* Completion Percentage Banner */}
          <div className="bg-gradient-to-r from-[#11111F] to-[#121A1A] text-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  Plan Completion Rate
                </span>
                {workoutStats?.completedCount !== undefined && (
                  <span className="text-xs text-white/70 font-semibold">
                    • {workoutStats.completedCount} of {workoutStats.totalPlanExercises || 28} Exercises Done
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black">
                {workoutStats?.completionPercentage || 0}% of Assigned Plan Completed
              </h3>
              <p className="text-xs md:text-sm text-white/70">
                Follow your trainer-assigned workout routines with animated video player and set logging to hit 100%.
              </p>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-[#6366F1] to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${workoutStats?.completionPercentage || 0}%` }}
                ></div>
              </div>
            </div>

            <Link
              to="/member/workout"
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-[#11111F] rounded-xl text-sm font-black transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <PlayCircle size={18} /> Continue Workout
            </Link>
          </div>

          {/* ===================== DAY-WISE WORKPLAN COMPLETED DETAILS ===================== */}
          <div className="bg-white border border-[#292940] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            {/* ── Dropdown Controls Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#292940]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#6366F1] flex items-center justify-center">
                    <Calendar size={18} />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#11111F] tracking-tight">
                    Day-Wise Workplan Completed Details
                  </h3>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Choose any day from Monday to Sunday to inspect completed animated exercises, logged sets, and adherence.
                </p>
              </div>

              {/* ── Dropdown Select Menu ── */}
              <div className="relative min-w-[280px] sm:min-w-[320px]">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full bg-[#0B0B12] border-2 border-orange-200 hover:border-[#6366F1] text-[#11111F] text-xs sm:text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 shadow-xs cursor-pointer appearance-none pr-10 transition-colors"
                >
                  <option value="all">📅 All Days - Weekly Workplan Overview</option>
                  <option value="Monday">💪 Monday Workplan Completed Details</option>
                  <option value="Tuesday">🏋️ Tuesday Workplan Completed Details</option>
                  <option value="Wednesday">🦵 Wednesday Workplan Completed Details</option>
                  <option value="Thursday">⚡ Thursday Workplan Completed Details</option>
                  <option value="Friday">🔥 Friday Workplan Completed Details</option>
                  <option value="Saturday">🏃 Saturday Workplan Completed Details</option>
                  <option value="Sunday">🧘 Sunday Workplan Completed Details</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* ── Quick Day Pill Selector Buttons ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <button
                onClick={() => setSelectedDay('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedDay === 'all'
                    ? 'bg-[#11111F] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Days
              </button>
              {DAYS_LIST.map((d) => {
                const isSelected = selectedDay === d;
                const dInfo = dayWorkplanData.find(item => item.dayName === d);
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#6366F1] text-white shadow-xs scale-102 ring-2 ring-orange-300/60'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                    }`}
                  >
                    <span>{d.slice(0, 3)}</span>
                    {dInfo && dInfo.completedCount > 0 && (
                      <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                        isSelected ? 'bg-white text-[#6366F1]' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── CASE 1: SPECIFIC DAY SELECTED (e.g. Saturday) ── */}
            {selectedDay !== 'all' ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Day Highlights Banner */}
                <div className="bg-gradient-to-br from-[#0B0B12] to-[#0B0B12] border border-orange-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#4F46E5]">
                          {activeDayWorkout.dayName} WORKPLAN
                        </span>
                        <span className="text-xs text-stone-500 font-semibold">• Assigned Routine</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-[#11111F]">
                        {activeDayWorkout.focusArea}
                      </h4>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">
                        {activeDayWorkout.completedCount} of {activeDayWorkout.totalCount} exercises completed ({activeDayWorkout.completionPct}% adherence)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-center">
                        <span className="text-[9px] font-bold uppercase text-stone-500 block">Sets Done</span>
                        <strong className="text-sm font-black text-stone-900">{activeDayWorkout.totalSetsLogged} Sets</strong>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-center">
                        <span className="text-[9px] font-bold uppercase text-stone-500 block">Duration</span>
                        <strong className="text-sm font-black text-emerald-700">{activeDayWorkout.totalMinutes} min</strong>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl border text-center ${
                        activeDayWorkout.isFullyCompleted
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : activeDayWorkout.isInProgress
                          ? 'bg-amber-50 border-amber-300 text-amber-800'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}>
                        <span className="text-[9px] font-bold uppercase block">Status</span>
                        <strong className="text-xs font-black">
                          {activeDayWorkout.isFullyCompleted ? 'Completed' : activeDayWorkout.isInProgress ? 'In Progress' : 'Scheduled'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Day Completion Bar */}
                  <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-gradient-to-r from-[#6366F1] to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${activeDayWorkout.completionPct}%` }}
                    />
                  </div>
                </div>

                {/* Day Exercise List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-600 px-1">
                    <span>{activeDayWorkout.dayName} Completed &amp; Scheduled Routines</span>
                    <span>{activeDayWorkout.exercises.length} Exercises Total</span>
                  </div>

                  {activeDayWorkout.exercises.map((ex: any, idx: number) => (
                    <div
                      key={ex.id || idx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        ex.isCompleted
                          ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300 shadow-xs'
                          : 'bg-[#0B0B12] border-[#292940] hover:border-orange-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                          ex.isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-[#6366F1]'
                        }`}>
                          {ex.isCompleted ? <CheckCircle2 size={20} /> : idx + 1}
                        </div>
                        <div>
                          <h5 className="font-extrabold text-sm text-[#11111F]">{ex.name}</h5>
                          <p className="text-xs text-[#A1A1AA] mt-0.5">
                            Target Muscle: <strong className="text-stone-700">{ex.muscle}</strong> • Target: {ex.sets} Sets × {ex.reps} Reps
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto text-xs">
                        {ex.isCompleted ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <Check size={11} /> Completed
                            </span>
                            <span className="text-[11px] text-stone-500 font-medium">
                              {ex.loggedSets} Sets Done • {Math.round(ex.loggedDuration)}s
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200">
                              Pending
                            </span>
                            <Link
                              to="/member/workout"
                              className="px-3 py-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Start</span>
                              <PlayCircle size={12} />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ── CASE 2: ALL DAYS OVERVIEW GRID ── */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
                {dayWorkplanData.map((d) => (
                  <div
                    key={d.dayName}
                    onClick={() => setSelectedDay(d.dayName)}
                    className="p-5 rounded-2xl border border-[#292940] bg-[#0B0B12] hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-[#11111F] group-hover:text-[#6366F1] transition-colors">
                          {d.dayName}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          d.isFullyCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.isInProgress
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {d.completionPct}% Done
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA] font-semibold mb-3 truncate">
                        {d.focusArea}
                      </p>

                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-[#6366F1] to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${d.completionPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#A1A1AA] pt-3 border-t border-[#292940]">
                      <span>{d.completedCount} / {d.totalCount} Exercises</span>
                      <span className="font-bold text-[#6366F1] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Inspect</span> &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exercise Completion Activity Log */}
          <div className="bg-white border border-[#292940] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#11111F]">Completed Exercise Logs</h3>
                <p className="text-xs text-[#A1A1AA]">Chronological history of completed exercise animations and sets</p>
              </div>
              <button
                onClick={fetchWorkoutProgress}
                className="p-2 text-[#A1A1AA] hover:text-[#11111F] hover:bg-[#0B0B12] rounded-xl transition-colors cursor-pointer"
                title="Refresh logs"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingWorkoutProgress ? (
              <div className="text-center py-12 text-[#A1A1AA]">
                <Loader2 className="animate-spin mx-auto mb-2 text-[#6366F1]" size={28} />
                <p className="text-xs font-semibold">Loading workout records...</p>
              </div>
            ) : workoutHistory.length === 0 ? (
              <div className="p-8 text-center bg-[#0B0B12] border border-dashed border-[#292940] rounded-2xl">
                <Dumbbell size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="font-bold text-[#11111F] text-sm">No exercises completed yet</p>
                <p className="text-xs text-[#A1A1AA] mt-1 mb-4">
                  Go to &quot;My Workout Plan&quot;, tap &quot;Start Workout&quot;, and log your first completed exercise!
                </p>
                <Link
                  to="/member/workout"
                  className="px-4 py-2 bg-[#6366F1] text-white rounded-xl text-xs font-bold hover:bg-[#4F46E5] transition-colors cursor-pointer"
                >
                  Go to Workout Plan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutHistory.map((item: any) => (
                  <div
                    key={item._id}
                    className="p-4 bg-[#0B0B12] hover:bg-orange-50/20 border border-[#292940] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#11111F]">{item.exerciseId?.name || item.exerciseName || 'Exercise'}</h4>
                        <p className="text-xs text-[#A1A1AA]">
                          {item.dayName || 'Workout'} • {item.completedSets || 3} Sets completed • {Math.round(item.duration || 60)}s elapsed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {item.status || 'Completed'}
                      </span>
                      <span className="text-[#A1A1AA] font-medium">
                        {new Date(item.completedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== DIET WORK PLAN PROGRESS ===================== */}
      {activePlanType === 'diet' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top 4 Diet Progress Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#292940] rounded-2xl p-5 shadow-xs hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Meals Completed</span>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-800">
                  {dietOverview?.stats?.totalMealsCompleted || 0}
                </span>
                <span className="text-xs text-[#A1A1AA] font-bold">/ {dietOverview?.stats?.totalMealsPlanned || 42}</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {dietOverview?.stats?.completionPercentage || 0}% adherence
              </span>
            </div>

            <div className="bg-white border border-[#292940] rounded-2xl p-5 shadow-xs hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Pending Meals</span>
                <Clock size={18} className="text-amber-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-700">
                  {dietOverview?.stats?.pendingMeals !== undefined ? dietOverview.stats.pendingMeals : 42}
                </span>
                <span className="text-xs text-[#A1A1AA] font-bold">meals</span>
              </div>
              <span className="text-[11px] text-[#A1A1AA] font-semibold mt-1 block">
                Across 7-day nutrition cycle
              </span>
            </div>

            <div className="bg-white border border-[#292940] rounded-2xl p-5 shadow-xs hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Calories Logged</span>
                <Flame size={18} className="text-orange-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-orange-700">
                  {(dietOverview?.stats?.totalCaloriesLogged || 0).toLocaleString()}
                </span>
                <span className="text-xs text-[#A1A1AA] font-bold">kcal</span>
              </div>
              <span className="text-[11px] text-orange-600 font-semibold mt-1 block">
                Total energy logged
              </span>
            </div>

            <div className="bg-white border border-[#292940] rounded-2xl p-5 shadow-xs hover:border-emerald-500/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Protein Intake</span>
                <Apple size={18} className="text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-indigo-700">
                  {dietOverview?.stats?.totalProteinLogged || 0}
                </span>
                <span className="text-xs text-[#A1A1AA] font-bold">grams</span>
              </div>
              <span className="text-[11px] text-[#A1A1AA] font-semibold mt-1 block">
                Muscle recovery macros
              </span>
            </div>
          </div>

          {/* Diet Completion Percentage Banner */}
          <div className="bg-gradient-to-r from-[#064E3B] to-[#042F2E] text-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                  Diet Plan Completion Rate
                </span>
                <span className="text-xs text-white/70 font-semibold">
                  • {dietOverview?.plan?.name || '7-Day Nutrition & Macro Diet Plan'}
                </span>
              </div>
              <h3 className="text-2xl font-black">
                {dietOverview?.stats?.completionPercentage || 0}% of Assigned Diet Plan Completed
              </h3>
              <p className="text-xs md:text-sm text-white/70">
                Log and complete your daily breakfasts, lunches, dinners, and hydration to achieve optimal body composition.
              </p>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700"
                  style={{ width: `${dietOverview?.stats?.completionPercentage || 0}%` }}
                ></div>
              </div>
            </div>

            <Link
              to="/member/diet"
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:opacity-95 text-[#042F2E] rounded-xl text-sm font-black transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Utensils size={18} /> View &amp; Log Diet Plan
            </Link>
          </div>

          {/* ===================== DAY-WISE DIET PLAN COMPLETED DETAILS ===================== */}
          <div className="bg-white border border-[#292940] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            {/* ── Dropdown Controls Header ── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#292940]">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Utensils size={18} />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#11111F] tracking-tight">
                    Day-Wise Diet Plan Completed Details
                  </h3>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Choose any day to inspect completed meals, consumed calories, target macros, and nutritional adherence.
                </p>
              </div>

              {/* ── Dropdown Select Menu ── */}
              <div className="relative min-w-[280px] sm:min-w-[320px]">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full bg-[#0B0B12] border-2 border-emerald-200 hover:border-emerald-600 text-[#11111F] text-xs sm:text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-xs cursor-pointer appearance-none pr-10 transition-colors"
                >
                  <option value="all">🥗 All Days - Weekly Diet Overview</option>
                  <option value="Monday">🥑 Monday Diet Completed Details</option>
                  <option value="Tuesday">🍳 Tuesday Diet Completed Details</option>
                  <option value="Wednesday">🍲 Wednesday Diet Completed Details</option>
                  <option value="Thursday">🍗 Thursday Diet Completed Details</option>
                  <option value="Friday">🥩 Friday Diet Completed Details</option>
                  <option value="Saturday">🥗 Saturday Diet Completed Details</option>
                  <option value="Sunday">🍵 Sunday Diet Completed Details</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* ── Quick Day Pill Selector Buttons ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <button
                onClick={() => setSelectedDay('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedDay === 'all'
                    ? 'bg-[#11111F] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Days
              </button>
              {DAYS_LIST.map((d) => {
                const isSelected = selectedDay === d;
                const dData = dietDayBreakdown[d];
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-300/60'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                    }`}
                  >
                    <span>{d.slice(0, 3)}</span>
                    {dData && dData.completedMeals > 0 && (
                      <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                        isSelected ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── CASE 1: SPECIFIC DAY SELECTED IN DIET ── */}
            {selectedDay !== 'all' && activeDayDiet ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Day Highlights Banner */}
                <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {selectedDay} NUTRITION
                        </span>
                        <span className="text-xs text-stone-500 font-semibold">• Macro Plan</span>
                      </div>
                      <h4 className="text-lg sm:text-xl font-black text-[#11111F]">
                        {activeDayDiet.focus}
                      </h4>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">
                        {activeDayDiet.completedMeals} of {activeDayDiet.totalMeals} meals completed ({activeDayDiet.completionPercentage}% adherence)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-center">
                        <span className="text-[9px] font-bold uppercase text-stone-500 block">Consumed</span>
                        <strong className="text-sm font-black text-emerald-700">{activeDayDiet.consumedCalories} kcal</strong>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-center">
                        <span className="text-[9px] font-bold uppercase text-stone-500 block">Target</span>
                        <strong className="text-sm font-black text-stone-900">{activeDayDiet.targetCalories} kcal</strong>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-center">
                        <span className="text-[9px] font-bold uppercase text-stone-500 block">Protein</span>
                        <strong className="text-sm font-black text-indigo-700">{activeDayDiet.consumedProtein}g / {activeDayDiet.targetProtein}g</strong>
                      </div>
                    </div>
                  </div>

                  {/* Day Completion Bar */}
                  <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden mt-4">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full transition-all duration-700"
                      style={{ width: `${activeDayDiet.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Day Meals List */}
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {(activeDayDiet.meals || []).map((m: any) => (
                    <div
                      key={m.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        m.completed ? 'bg-emerald-50/20' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          m.completed ? 'bg-emerald-600 text-white' : 'border-2 border-stone-300 text-transparent'
                        }`}>
                          <CheckCircle2 size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {getMealIcon(m.type)}
                            <span className="text-xs font-bold text-stone-500 uppercase">{m.time}</span>
                            <span className="font-extrabold text-sm text-stone-900">{m.type}</span>
                          </div>
                          <ul className="mt-1.5 space-y-0.5">
                            {(m.items || []).map((item: string, i: number) => (
                              <li key={i} className="text-xs text-stone-600 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="text-right shrink-0 self-end sm:self-auto">
                        <span className="text-xs font-black text-stone-900 block">{m.calories} kcal</span>
                        <span className="text-[10px] text-stone-500 block">P: {m.protein}g • C: {m.carbs}g • F: {m.fats}g</span>
                        {m.completed ? (
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ Completed
                          </span>
                        ) : (
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* ── CASE 2: ALL DAYS OVERVIEW GRID IN DIET ── */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
                {DAYS_LIST.map((d) => {
                  const dData = dietDayBreakdown[d];
                  if (!dData) return null;
                  return (
                    <div
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className="p-5 rounded-2xl border border-[#292940] bg-[#0B0B12] hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-sm text-[#11111F] group-hover:text-emerald-700 transition-colors">
                            {d}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            dData.completionPercentage === 100
                              ? 'bg-emerald-100 text-emerald-800'
                              : dData.completionPercentage > 0
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {dData.completionPercentage}% Done
                          </span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] font-semibold mb-3 truncate">
                          {dData.focus}
                        </p>

                        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full transition-all duration-500"
                            style={{ width: `${dData.completionPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#A1A1AA] pt-3 border-t border-[#292940]">
                        <span>{dData.completedMeals} / {dData.totalMeals} Meals</span>
                        <span className="font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          <span>Inspect</span> &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Meal Completion Activity Log */}
          <div className="bg-white border border-[#292940] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#11111F]">
                  {selectedDay !== 'all' ? `${selectedDay} Completed Meal Logs` : 'Completed Meal Logs'}
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  {selectedDay !== 'all' ? `Logged nutrition entries for ${selectedDay}` : 'Chronological history of completed nutrition and meal intakes'}
                </p>
              </div>
              <button
                onClick={fetchDietProgress}
                className="p-2 text-[#A1A1AA] hover:text-[#11111F] hover:bg-[#0B0B12] rounded-xl transition-colors cursor-pointer"
                title="Refresh logs"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingDietProgress ? (
              <div className="text-center py-12 text-[#A1A1AA]">
                <Loader2 className="animate-spin mx-auto mb-2 text-emerald-600" size={28} />
                <p className="text-xs font-semibold">Loading meal records...</p>
              </div>
            ) : dietHistory.length === 0 ? (
              <div className="p-8 text-center bg-[#0B0B12] border border-dashed border-[#292940] rounded-2xl">
                <Utensils size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="font-bold text-[#11111F] text-sm">No meals logged yet</p>
                <p className="text-xs text-[#A1A1AA] mt-1 mb-4">
                  Go to &quot;My Diet Plan&quot;, check off your completed meals, and track your nutrition streak!
                </p>
                <Link
                  to="/member/diet"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  Go to Diet Plan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(selectedDay !== 'all' && dietHistory.some((l: any) => (l.dayName || '').toLowerCase() === selectedDay.toLowerCase())
                  ? dietHistory.filter((l: any) => (l.dayName || '').toLowerCase() === selectedDay.toLowerCase())
                  : dietHistory
                ).map((item: any) => (
                  <div
                    key={item._id}
                    className="p-4 bg-[#0B0B12] hover:bg-emerald-50/20 border border-[#292940] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        {getMealIcon(item.mealType)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#11111F]">
                          {item.dayName} • {item.mealType}
                        </h4>
                        <p className="text-xs text-[#A1A1AA]">
                          {item.calories} kcal • {item.protein}g Protein • {Array.isArray(item.items) ? item.items.join(', ') : item.items}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                      <span className="text-[#A1A1AA] font-medium">
                        {item.completedAt
                          ? new Date(item.completedAt).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Logged'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProgress;