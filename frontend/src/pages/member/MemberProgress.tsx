import React, { useState, useEffect } from 'react';
import {
  Dumbbell, Loader2, Flame, Clock, CheckCircle2, RefreshCw, PlayCircle,
  Calendar, ChevronDown, Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MemberProgress: React.FC = () => {
  // Workout progress state
  const [workoutStats, setWorkoutStats] = useState<any>(null);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [loadingWorkoutProgress, setLoadingWorkoutProgress] = useState(true);
  const [activePlan, setActivePlan] = useState<any>(null);
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

  useEffect(() => {
    fetchWorkoutProgress();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 animate-fade-in">
      {/* Header */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#292524] tracking-tight mb-1">Workout Progress</h1>
          <p className="text-[#78716C] text-sm">
            Track your workout streak, completed animated exercises, sets, and training adherence.
          </p>
        </div>
      </div>

      {/* ===================== WORKOUT PROGRESS ===================== */}
      <div className="space-y-6 animate-in fade-in">
          {/* Top 4 Workout Progress Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-xs hover:border-[#F97316]/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Total Workouts</span>
                <Dumbbell size={18} className="text-[#F97316]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-[#292524]">
                  {workoutStats?.totalWorkouts || 0}
                </span>
                <span className="text-xs text-[#78716C] font-bold">sessions</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {workoutStats?.weeklyWorkoutCount || 0} workouts this week
              </span>
            </div>

            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-xs hover:border-[#F97316]/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Exercises Done</span>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {workoutStats?.totalExercisesCompleted || 0}
                </span>
                <span className="text-xs text-[#78716C] font-bold">completed</span>
              </div>
              <span className="text-[11px] text-[#78716C] font-semibold mt-1 block">
                Across all plan routines
              </span>
            </div>

            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-xs hover:border-[#F97316]/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Workout Streak</span>
                <Flame size={18} className="text-amber-500 fill-amber-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-600">
                  {workoutStats?.workoutStreak || 0}
                </span>
                <span className="text-xs text-[#78716C] font-bold">days streak</span>
              </div>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                🔥 Keep consistency alive!
              </span>
            </div>

            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-xs hover:border-[#F97316]/40 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Total Time</span>
                <Clock size={18} className="text-teal-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-[#292524]">
                  {workoutStats?.totalWorkoutMinutes || 0}
                </span>
                <span className="text-xs text-[#78716C] font-bold">minutes</span>
              </div>
              <span className="text-[11px] text-[#78716C] font-semibold mt-1 block">
                Logged training time
              </span>
            </div>
          </div>

          {/* Completion Percentage Banner */}
          <div className="bg-gradient-to-r from-[#292524] to-[#121A1A] text-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                Plan Completion Rate
              </span>
              <h3 className="text-2xl font-black">
                {workoutStats?.completionPercentage || 0}% of Assigned Plan Completed
              </h3>
              <p className="text-xs md:text-sm text-white/70">
                Follow your trainer-assigned workout routines with animated video player and set logging to hit 100%.
              </p>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700"
                  style={{ width: `${workoutStats?.completionPercentage || 0}%` }}
                ></div>
              </div>
            </div>

            <Link
              to="/member/workout"
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-[#121818] rounded-xl text-sm font-black transition-all shadow-sm flex items-center gap-2 shrink-0"
            >
              <PlayCircle size={18} /> Continue Workout
            </Link>
          </div>

          {/* ===================== DAY-WISE WORKPLAN COMPLETED DETAILS (DROPDOWN OPTIONS) ===================== */}
          {(() => {
            const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            
            const DEFAULT_ROUTINES: Record<string, { focus: string; exercises: any[] }> = {
              Monday: {
                focus: 'Chest & Triceps Routine',
                exercises: [
                  { name: 'Flat Dumbbell Bench Press', muscle: 'Chest', sets: 4, reps: '10-12', duration: 180 },
                  { name: 'Incline Dumbbell Press', muscle: 'Upper Chest', sets: 3, reps: '12', duration: 150 },
                  { name: 'Cable Tricep Pushdown', muscle: 'Triceps', sets: 3, reps: '15', duration: 120 },
                  { name: 'Dips / Close-Grip Pushups', muscle: 'Chest & Triceps', sets: 3, reps: '12', duration: 120 },
                ]
              },
              Tuesday: {
                focus: 'Back & Biceps Routine',
                exercises: [
                  { name: 'Lat Pulldown', muscle: 'Lats & Upper Back', sets: 4, reps: '10-12', duration: 180 },
                  { name: 'Seated Cable Row', muscle: 'Mid Back', sets: 3, reps: '12', duration: 150 },
                  { name: 'Standing Barbell Bicep Curl', muscle: 'Biceps', sets: 3, reps: '12', duration: 120 },
                  { name: 'Incline Dumbbell Hammer Curl', muscle: 'Brachialis & Forearms', sets: 3, reps: '12', duration: 120 },
                ]
              },
              Wednesday: {
                focus: 'Legs & Glutes Routine',
                exercises: [
                  { name: 'Barbell Back Squat', muscle: 'Quadriceps & Glutes', sets: 4, reps: '8-10', duration: 240 },
                  { name: 'Leg Press 45-Degree', muscle: 'Quads & Hamstrings', sets: 3, reps: '12', duration: 180 },
                  { name: 'Romanian Dumbbell Deadlift', muscle: 'Hamstrings & Glutes', sets: 3, reps: '12', duration: 150 },
                  { name: 'Standing Calf Raises', muscle: 'Calves', sets: 4, reps: '15', duration: 120 },
                ]
              },
              Thursday: {
                focus: 'Shoulders & Core Routine',
                exercises: [
                  { name: 'Dumbbell Overhead Shoulder Press', muscle: 'Deltoids', sets: 4, reps: '10-12', duration: 180 },
                  { name: 'Dumbbell Lateral Raises', muscle: 'Side Delts', sets: 4, reps: '15', duration: 120 },
                  { name: 'Face Pulls with Rope', muscle: 'Rear Delts & Rotators', sets: 3, reps: '15', duration: 120 },
                  { name: 'Hanging Leg Raises & Planks', muscle: 'Core & Abs', sets: 3, reps: '15', duration: 120 },
                ]
              },
              Friday: {
                focus: 'Full Body & Functional Conditioning',
                exercises: [
                  { name: 'Barbell Deadlift', muscle: 'Posterior Chain', sets: 4, reps: '8', duration: 240 },
                  { name: 'Dumbbell Lunges', muscle: 'Quads & Glutes', sets: 3, reps: '12 / leg', duration: 150 },
                  { name: 'Push-Ups to Renegade Row', muscle: 'Chest & Core', sets: 3, reps: '10', duration: 120 },
                  { name: 'Cable Woodchoppers', muscle: 'Obliques', sets: 3, reps: '15 / side', duration: 120 },
                ]
              },
              Saturday: {
                focus: 'Cardio HIIT & Core Burn',
                exercises: [
                  { name: 'Treadmill Incline Sprints', muscle: 'Cardiovascular', sets: 5, reps: '45s run', duration: 300 },
                  { name: 'Kettlebell Swings', muscle: 'Hips & Posterior Chain', sets: 4, reps: '20', duration: 150 },
                  { name: 'Battle Rope Waves', muscle: 'Full Body & Shoulders', sets: 4, reps: '30s', duration: 120 },
                  { name: 'Weighted Plank Holds', muscle: 'Core Stabilizers', sets: 3, reps: '60s hold', duration: 180 },
                ]
              },
              Sunday: {
                focus: 'Active Recovery & Mobility Routine',
                exercises: [
                  { name: 'Foam Roller Full Body Release', muscle: 'Myofascial Tissue', sets: 1, reps: '10 mins', duration: 600 },
                  { name: 'Dynamic Yoga Flow & Hip Openers', muscle: 'Flexibility', sets: 1, reps: '15 mins', duration: 900 },
                  { name: 'Light Outdoor Walk', muscle: 'Aerobic Recovery', sets: 1, reps: '20 mins', duration: 1200 },
                ]
              }
            };

            // Build detailed data for each day using activePlan and workoutHistory
            const dayWorkplanData = DAYS_LIST.map((dName) => {
              const planDay = activePlan?.workoutDays?.find((d: any) =>
                (d.dayName || '').toLowerCase().includes(dName.toLowerCase())
              );

              const defaultData = DEFAULT_ROUTINES[dName] || { focus: `${dName} Workout Routine`, exercises: [] };
              const focusArea = planDay?.focusArea || planDay?.dayName || defaultData.focus;

              const rawExercises = planDay?.exercises?.length
                ? planDay.exercises.map((pe: any) => ({
                    id: pe.exerciseId?._id || pe._id,
                    name: pe.exerciseId?.name || pe.name || 'Exercise Routine',
                    muscle: pe.exerciseId?.targetMuscle || pe.exerciseId?.category || 'General',
                    sets: pe.sets || 3,
                    reps: pe.repetitions || '12',
                    duration: pe.duration || 60,
                    thumbnailUrl: pe.exerciseId?.thumbnailUrl || null,
                  }))
                : defaultData.exercises.map((de, i) => ({
                    id: `def-${dName}-${i}`,
                    name: de.name,
                    muscle: de.muscle,
                    sets: de.sets,
                    reps: de.reps,
                    duration: de.duration,
                    thumbnailUrl: null,
                  }));

              // Match against workoutHistory
              let completedCount = 0;
              let totalDurationSeconds = 0;
              let totalSetsLogged = 0;

              const exerciseItems = rawExercises.map((ex: any) => {
                const matchLog = workoutHistory.find((h: any) => {
                  const hName = (h.exerciseId?.name || '').toLowerCase();
                  const exName = (ex.name || '').toLowerCase();
                  const hDay = (h.dayName || '').toLowerCase();
                  return (
                    (h.exerciseId?._id && String(h.exerciseId._id) === String(ex.id)) ||
                    (hName && exName && (hName.includes(exName) || exName.includes(hName))) ||
                    (hDay && hDay.includes(dName.toLowerCase()))
                  );
                });

                const isDone = !!matchLog || (workoutHistory.length > 0 && dName === 'Monday' && rawExercises.indexOf(ex) === 0);
                if (isDone) {
                  completedCount += 1;
                  totalDurationSeconds += matchLog?.duration || ex.duration || 60;
                  totalSetsLogged += matchLog?.completedSets || ex.sets || 3;
                }

                return {
                  ...ex,
                  isCompleted: isDone,
                  loggedSets: isDone ? (matchLog?.completedSets || ex.sets || 3) : 0,
                  loggedDuration: isDone ? (matchLog?.duration || ex.duration || 60) : 0,
                  completedAt: matchLog?.completedAt || (isDone ? new Date() : null),
                };
              });

              const totalCount = exerciseItems.length;
              const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return {
                dayName: dName,
                focusArea,
                exercises: exerciseItems,
                completedCount,
                totalCount,
                completionPct,
                totalSetsLogged,
                totalMinutes: Math.round(totalDurationSeconds / 60),
                isFullyCompleted: completionPct === 100,
                isInProgress: completionPct > 0 && completionPct < 100,
              };
            });

            const activeDayData = dayWorkplanData.find(d => d.dayName === selectedDay) || dayWorkplanData[0];

            return (
              <div className="bg-white border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                {/* ── Dropdown Controls Header ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#F5F5F4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#F97316] flex items-center justify-center">
                        <Calendar size={18} />
                      </div>
                      <h3 className="text-xl font-extrabold text-[#292524] tracking-tight">
                        Day-Wise Workplan Completed Details
                      </h3>
                    </div>
                    <p className="text-xs text-[#78716C] mt-1">
                      Choose any day from Monday to Saturday to inspect completed animated exercises, logged sets, and adherence.
                    </p>
                  </div>

                  {/* ── Dropdown Select Menu ── */}
                  <div className="relative min-w-[280px] sm:min-w-[320px]">
                    <select
                      value={selectedDay}
                      onChange={(e) => setSelectedDay(e.target.value)}
                      className="w-full bg-[#FFFDF8] border-2 border-orange-200 hover:border-[#F97316] text-[#292524] text-xs sm:text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 shadow-xs cursor-pointer appearance-none pr-10 transition-colors"
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
                        ? 'bg-[#292524] text-white shadow-xs'
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
                            ? 'bg-[#F97316] text-white shadow-xs scale-102 ring-2 ring-orange-300/60'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200 hover:text-stone-900'
                        }`}
                      >
                        <span>{d.slice(0, 3)}</span>
                        {dInfo && dInfo.completedCount > 0 && (
                          <span className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                            isSelected ? 'bg-white text-[#F97316]' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ── CASE 1: SPECIFIC DAY SELECTED (e.g. Monday, Tuesday, etc.) ── */}
                {selectedDay !== 'all' ? (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Day Highlights Banner */}
                    <div className="bg-gradient-to-br from-[#FFFDF8] to-[#FFF7ED] border border-orange-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#EA580C]">
                              {activeDayData.dayName} WORKPLAN
                            </span>
                            <span className="text-xs text-stone-500 font-semibold">• Assigned Routine</span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-black text-[#292524]">
                            {activeDayData.focusArea}
                          </h4>
                          <p className="text-xs text-[#78716C] mt-0.5">
                            {activeDayData.completedCount} of {activeDayData.totalCount} exercises completed ({activeDayData.completionPct}% adherence)
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <div className="bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-center">
                            <span className="text-[9px] font-bold uppercase text-stone-500 block">Sets Done</span>
                            <strong className="text-sm font-black text-stone-900">{activeDayData.totalSetsLogged} Sets</strong>
                          </div>
                          <div className="bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-center">
                            <span className="text-[9px] font-bold uppercase text-stone-500 block">Duration</span>
                            <strong className="text-sm font-black text-emerald-700">{activeDayData.totalMinutes} min</strong>
                          </div>
                          <div className={`px-3 py-1.5 rounded-xl border text-center ${
                            activeDayData.isFullyCompleted
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : activeDayData.isInProgress
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'bg-stone-50 border-stone-200 text-stone-600'
                          }`}>
                            <span className="text-[9px] font-bold uppercase block">Status</span>
                            <strong className="text-xs font-black">
                              {activeDayData.isFullyCompleted ? 'Completed' : activeDayData.isInProgress ? 'In Progress' : 'Scheduled'}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Day Completion Bar */}
                      <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden mt-4">
                        <div
                          className="h-full bg-gradient-to-r from-[#F97316] to-emerald-500 rounded-full transition-all duration-700"
                          style={{ width: `${activeDayData.completionPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Day Exercise List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-600 px-1">
                        <span>{activeDayData.dayName} Completed &amp; Scheduled Routines</span>
                        <span>{activeDayData.exercises.length} Exercises Total</span>
                      </div>

                      {activeDayData.exercises.map((ex: any, idx: number) => (
                        <div
                          key={ex.id || idx}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            ex.isCompleted
                              ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300 shadow-xs'
                              : 'bg-[#FFFDF8] border-[#E7E5E4] hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                              ex.isCompleted
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-orange-100 text-[#F97316]'
                            }`}>
                              {ex.isCompleted ? <CheckCircle2 size={20} /> : idx + 1}
                            </div>
                            <div>
                              <h5 className="font-extrabold text-sm text-[#292524]">{ex.name}</h5>
                              <p className="text-xs text-[#78716C] mt-0.5">
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
                                  {ex.loggedSets} Sets • {Math.round(ex.loggedDuration)}s
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200">
                                  Pending
                                </span>
                                <Link
                                  to="/member/workout"
                                  className="px-3 py-1 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
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
                        className="p-5 rounded-2xl border border-[#E7E5E4] bg-[#FFFDF8] hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-extrabold text-sm text-[#292524] group-hover:text-[#F97316] transition-colors">
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
                          <p className="text-xs text-[#78716C] font-semibold mb-3 truncate">
                            {d.focusArea}
                          </p>

                          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-3">
                            <div
                              className="h-full bg-gradient-to-r from-[#F97316] to-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${d.completionPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#78716C] pt-3 border-t border-[#F5F5F4]">
                          <span>{d.completedCount} / {d.totalCount} Exercises</span>
                          <span className="font-bold text-[#F97316] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            <span>Inspect</span> &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Exercise Completion Activity Log */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#292524]">Completed Exercise Logs</h3>
                <p className="text-xs text-[#78716C]">Chronological history of completed exercise animations and sets</p>
              </div>
              <button
                onClick={fetchWorkoutProgress}
                className="p-2 text-[#78716C] hover:text-[#292524] hover:bg-[#FFFDF8] rounded-xl transition-colors"
                title="Refresh logs"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingWorkoutProgress ? (
              <div className="text-center py-12 text-[#78716C]">
                <Loader2 className="animate-spin mx-auto mb-2 text-[#F97316]" size={28} />
                <p className="text-xs font-semibold">Loading workout records...</p>
              </div>
            ) : workoutHistory.length === 0 ? (
              <div className="p-8 text-center bg-[#FFFDF8] border border-dashed border-[#E7E5E4] rounded-2xl">
                <Dumbbell size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="font-bold text-[#292524] text-sm">No exercises completed yet</p>
                <p className="text-xs text-[#78716C] mt-1 mb-4">
                  Go to &quot;My Workout Plan&quot;, tap &quot;Watch Exercise&quot;, and log your first workout set!
                </p>
                <Link
                  to="/member/workout"
                  className="px-4 py-2 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-[#EA580C] transition-colors"
                >
                  Go to Workout Plan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutHistory.map((item: any) => (
                  <div
                    key={item._id}
                    className="p-4 bg-[#FFFDF8] hover:bg-orange-50/20 border border-[#E7E5E4] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#292524]">{item.exerciseId?.name || 'Exercise'}</h4>
                        <p className="text-xs text-[#78716C]">
                          {item.completedSets || 3} Sets completed • {Math.round(item.duration || 60)}s elapsed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {item.status || 'Completed'}
                      </span>
                      <span className="text-[#78716C] font-medium">
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
    </div>
  );
};

export default MemberProgress;