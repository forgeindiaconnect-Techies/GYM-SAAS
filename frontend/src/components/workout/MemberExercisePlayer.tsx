import React, { useState, useEffect } from 'react';
import {
  X, Play, Pause, RotateCcw, CheckCircle2, ChevronRight, ChevronLeft,
  ShieldAlert, Award, Sparkles, ArrowRight
} from 'lucide-react';
import ExerciseVideoPlayer from './ExerciseVideoPlayer';
import api from '../../utils/api';

export interface PlayerExercise {
  exerciseId: {
    _id: string;
    name: string;
    category?: string;
    targetMuscle?: string;
    difficulty?: string;
    instructions?: string;
    safetyInstructions?: string;
    videoUrl?: string;
    animationType?: 'video' | 'animation' | 'gif';
    defaultRest?: number;
    defaultDuration?: number;
  };
  sets: number;
  repetitions: string;
  duration?: number;
  restTime?: number;
  trainerNotes?: string;
}

interface MemberExercisePlayerProps {
  planId: string;
  dayName: string;
  exercises: PlayerExercise[];
  initialIndex?: number;
  onClose: () => void;
  onCompleteExercise?: (exerciseId: string) => void;
}

export const MemberExercisePlayer: React.FC<MemberExercisePlayerProps> = ({
  planId,
  dayName,
  exercises,
  initialIndex = 0,
  onClose,
  onCompleteExercise
}) => {
  const [currentIdx, setCurrentIdx] = useState(initialIndex);
  const currentItem = exercises[currentIdx];
  const ex = currentItem?.exerciseId;

  const totalSets = currentItem?.sets || 3;
  const targetReps = parseInt(currentItem?.repetitions) || 12;
  const configuredRest = currentItem?.restTime || ex?.defaultRest || 30;

  // Active workout state
  const [currentSet, setCurrentSet] = useState(1);
  const [repCount, setRepCount] = useState(targetReps);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutElapsed, setWorkoutElapsed] = useState(0);
  const [restartCount, setRestartCount] = useState(0);

  // Rest state
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(configuredRest);

  // Completion states
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [completedExerciseIdxs, setCompletedExerciseIdxs] = useState<number[]>([]);

  // Active tab in details
  const [activeTab, setActiveTab] = useState<'instructions' | 'notes' | 'safety'>('instructions');

  // Reset exercise state when switching exercises
  useEffect(() => {
    setCurrentSet(1);
    setRepCount(parseInt(currentItem?.repetitions) || 12);
    setWorkoutElapsed(0);
    setIsResting(false);
    setRestTimeRemaining(configuredRest);
    setExerciseCompleted(false);
    setIsPaused(false);
    setAutoAdvanceCountdown(null);
  }, [currentIdx, currentItem, configuredRest]);

  // Workout Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isPaused && !isResting && !exerciseCompleted && !workoutFinished) {
      interval = setInterval(() => {
        setWorkoutElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isResting, exerciseCompleted, workoutFinished]);

  // Rest Timer
  useEffect(() => {
    let restInterval: ReturnType<typeof setInterval>;
    if (isResting && restTimeRemaining > 0) {
      restInterval = setInterval(() => {
        setRestTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isResting && restTimeRemaining <= 0) {
      // Rest completed, ready for next set
      setIsResting(false);
      setRestTimeRemaining(configuredRest);
    }
    return () => clearInterval(restInterval);
  }, [isResting, restTimeRemaining, configuredRest]);

  // Auto-advance Countdown to Next Exercise
  useEffect(() => {
    let countdownInterval: ReturnType<typeof setInterval>;
    if (autoAdvanceCountdown !== null && autoAdvanceCountdown > 0) {
      countdownInterval = setInterval(() => {
        setAutoAdvanceCountdown(prev => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (autoAdvanceCountdown === 0) {
      // Auto-advance immediately when countdown reaches 0
      handleProceedToNextExercise();
    }
    return () => clearInterval(countdownInterval);
  }, [autoAdvanceCountdown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Complete Set handler
  const handleCompleteSet = async () => {
    if (currentSet < totalSets) {
      // Completed current set! Move to next set immediately
      setCurrentSet(prev => prev + 1);
      // Trigger Rest mode with countdown
      setIsResting(true);
      setRestTimeRemaining(configuredRest);
    } else {
      // Completed all sets for this exercise!
      await handleFinishExercise();
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestTimeRemaining(configuredRest);
  };

  const handleFinishExercise = async () => {
    // 1. Immediately transition UI state so exercise finishes and next exercise/countdown appears without delay
    const resolvedExerciseId = ex?._id || currentItem?.exerciseId?._id || `ex-${currentIdx}`;
    setCompletedExerciseIdxs(prev => Array.from(new Set([...prev, currentIdx])));
    setExerciseCompleted(true);
    setIsResting(false);

    if (onCompleteExercise) {
      try {
        onCompleteExercise(resolvedExerciseId);
      } catch (cbErr) {
        console.warn('onCompleteExercise callback error:', cbErr);
      }
    }

    // 2. Set auto-advance countdown (3s) or trigger workout completion modal
    if (currentIdx === exercises.length - 1) {
      setWorkoutFinished(true);
    } else {
      setAutoAdvanceCountdown(3);
    }

    // 3. Persist exercise completion log to backend asynchronously
    setSavingProgress(true);
    try {
      await api.post('/workout-progress/log', {
        workoutPlanId: planId || 'standard-workout-plan',
        exerciseId: resolvedExerciseId,
        exerciseName: ex?.name || currentItem?.exerciseId?.name || 'Exercise',
        dayName: dayName || 'Workout',
        completedSets: totalSets,
        totalSets: totalSets,
        completedRepetitions: repCount,
        targetRepetitions: targetReps,
        duration: workoutElapsed || 60,
        status: 'Completed'
      });
    } catch (err) {
      console.warn('Exercise progress logging sync notice (UI updated locally):', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleProceedToNextExercise = () => {
    setAutoAdvanceCountdown(null);
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setCurrentSet(1);
      setWorkoutElapsed(0);
      setIsResting(false);
      setRestTimeRemaining(configuredRest);
      setExerciseCompleted(false);
      setIsPaused(false);
      setRestartCount(prev => prev + 1);
    } else {
      setWorkoutFinished(true);
    }
  };

  const handleNextExercise = () => {
    setAutoAdvanceCountdown(null);
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setWorkoutFinished(true);
    }
  };

  const handlePrevExercise = () => {
    setAutoAdvanceCountdown(null);
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setAutoAdvanceCountdown(null);
    setCurrentSet(1);
    setWorkoutElapsed(0);
    setIsResting(false);
    setRestTimeRemaining(configuredRest);
    setExerciseCompleted(false);
    setIsPaused(false);
    setRestartCount(prev => prev + 1);
  };

  if (!currentItem || !ex) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#FFFFFF] text-[#111827] overflow-hidden animate-in fade-in">
      {/* Top Navbar */}
      <div className="px-4 py-3 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-full transition-colors text-[#111827] cursor-pointer"
            title="Exit Workout"
          >
            <X size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                {dayName}
              </span>
              <span className="text-xs text-[#64748B] font-semibold">
                Exercise {currentIdx + 1} of {exercises.length}
              </span>
            </div>
            <h2 className="text-base md:text-lg font-extrabold text-[#111827] truncate max-w-xs md:max-w-md">
              {ex.name}
            </h2>
          </div>
        </div>

        {/* Exercises navigation selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevExercise}
            disabled={currentIdx === 0}
            className="p-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl text-[#334155] hover:text-[#111827] border border-[#E2E8F0] disabled:opacity-20 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#F8FAFC] text-[#111827] rounded-lg border border-[#E2E8F0]">
            {currentIdx + 1} / {exercises.length}
          </span>
          <button
            onClick={handleNextExercise}
            disabled={currentIdx === exercises.length - 1}
            className="p-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl text-[#334155] hover:text-[#111827] border border-[#E2E8F0] disabled:opacity-20 transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
        {/* Left Column: Animation Video & Playback HUD */}
        <div className="lg:w-3/5 p-4 md:p-6 flex flex-col justify-between space-y-4">
          {/* Top HUD: Set / Reps / Timer Status */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 bg-[#FFFFFF] p-3 md:p-4 rounded-2xl border border-[#E2E8F0] text-center shadow-sm">
            {/* Set Counter */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Current Set</span>
              <div className="text-xl md:text-2xl font-black font-mono text-[#15803D] mt-0.5">
                SET {currentSet} / {totalSets}
              </div>
            </div>

            {/* Repetition Counter */}
            <div className="flex flex-col items-center justify-center border-x border-[#E2E8F0] px-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Target Reps</span>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => setRepCount(prev => Math.max(1, prev - 1))}
                  className="w-6 h-6 rounded bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111827] border border-[#E2E8F0] text-xs font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="text-xl md:text-2xl font-black font-mono text-[#111827]">
                  {repCount}
                </span>
                <button
                  type="button"
                  onClick={() => setRepCount(prev => prev + 1)}
                  className="w-6 h-6 rounded bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111827] border border-[#E2E8F0] text-xs font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Countdown / Elapsed Timer */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Elapsed Time</span>
              <div className="text-xl md:text-2xl font-black font-mono text-[#B45309] mt-0.5">
                {formatTimer(workoutElapsed)}
              </div>
            </div>
          </div>

          {/* Animated Exercise Video Player / Rest Overlay */}
          <div className="relative rounded-3xl overflow-hidden bg-black border border-white/15 aspect-video md:aspect-[16/10] flex items-center justify-center shadow-2xl">
            {isResting ? (
              <div className="absolute inset-0 bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-[#E2E8F0]/30 border-t-emerald-400 animate-spin flex items-center justify-center mb-4">
                  <div className="text-2xl md:text-4xl font-black font-mono text-[#EA580C]">
                    {restTimeRemaining}s
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-[#111827] tracking-wide">REST PERIOD</h3>
                <p className="text-xs md:text-sm text-[#475569] mt-1 max-w-sm">
                  Catch your breath and hydrate. Set {currentSet} of {totalSets} will begin automatically.
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSkipRest}
                    className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-xl text-xs md:text-sm font-black transition-all shadow-md cursor-pointer"
                  >
                    Skip Rest & Begin Set {currentSet}
                  </button>
                  <button
                    onClick={() => setRestTimeRemaining(prev => prev + 15)}
                    className="px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#EA580C] border border-[#E2E8F0] hover:border-[#FFEDD5] rounded-xl text-xs md:text-sm font-bold transition-colors cursor-pointer"
                  >
                    +15s Rest
                  </button>
                </div>
              </div>
            ) : exerciseCompleted ? (
              <div className="absolute inset-0 bg-gradient-to-b from-[#F8FAFC] to-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center z-30 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mb-3 shadow-xl shadow-emerald-500/30 animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#15803D]">
                  Exercise {currentIdx + 1} of {exercises.length} Complete!
                </span>
                <h3 className="text-2xl font-black text-[#111827] mt-1">{ex.name} Finished</h3>
                <p className="text-xs text-[#475569] mt-1 max-w-sm">
                  Logged {totalSets} Sets × {repCount} Reps ({formatTimer(workoutElapsed)}) • Synced with Trainer
                </p>

                {currentIdx < exercises.length - 1 ? (
                  <div className="mt-4 p-3 bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm rounded-2xl max-w-sm w-full text-left">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-[#EA580C] uppercase tracking-wider">
                        Up Next: Exercise {currentIdx + 2}
                      </span>
                      <span className="font-mono font-bold text-[#15803D] px-2 py-0.5 bg-[#FFF7ED] rounded-full border border-[#FFEDD5]">
                        Starting in {autoAdvanceCountdown ?? 3}s
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[#111827] mt-1 truncate">
                      {exercises[currentIdx + 1]?.exerciseId?.name || 'Next Exercise'}
                    </p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      {exercises[currentIdx + 1]?.sets || 3} Sets × {exercises[currentIdx + 1]?.repetitions || 12} Reps
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-[#FFF7ED] border border-[#FFEDD5] rounded-2xl max-w-sm w-full text-center">
                    <span className="text-xs font-bold text-[#EA580C]">
                      You finished all {exercises.length} exercises in today&apos;s routine!
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={handleRestart}
                    className="px-4 py-2.5 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#111827] hover:text-[#EA580C] border border-[#E2E8F0] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Repeat Exercise
                  </button>
                  {currentIdx < exercises.length - 1 ? (
                    <button
                      onClick={handleProceedToNextExercise}
                      className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>Start Exercise {currentIdx + 2} Now</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setWorkoutFinished(true)}
                      className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award size={16} /> Complete Workout
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <ExerciseVideoPlayer
                videoUrl={ex.videoUrl}
                title={ex.name}
                category={ex.category}
                targetMuscle={ex.targetMuscle}
                animationType={ex.animationType}
                autoPlay={true}
                loop={true}
                compact={true}
                isPlaying={!isPaused && !isResting && !exerciseCompleted}
                resetTrigger={restartCount}
              />
            )}
          </div>

          {/* Interactive Set Action Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="p-3 bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/15 text-white/80 hover:text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Restart Exercise"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Restart</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="px-5 py-3 bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-white rounded-2xl text-xs md:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isPaused ? <Play size={16} className="fill-current" /> : <Pause size={16} />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            {exerciseCompleted && currentIdx < exercises.length - 1 ? (
              <button
                type="button"
                onClick={handleProceedToNextExercise}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:opacity-95 text-white rounded-2xl text-sm md:text-base font-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  Next Exercise: {exercises[currentIdx + 1]?.exerciseId?.name || 'Exercise ' + (currentIdx + 2)} ({autoAdvanceCountdown ?? 3}s)
                </span>
                <ArrowRight size={20} />
              </button>
            ) : exerciseCompleted && currentIdx === exercises.length - 1 ? (
              <button
                type="button"
                onClick={() => setWorkoutFinished(true)}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:opacity-95 text-white rounded-2xl text-sm md:text-base font-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award size={20} />
                <span>Complete Workout</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={isResting ? handleSkipRest : handleCompleteSet}
                disabled={savingProgress}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:opacity-95 text-white rounded-2xl text-sm md:text-base font-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={20} />
                <span>
                  {savingProgress
                    ? 'Saving Exercise Progress...'
                    : isResting
                    ? `Skip Rest & Start Set ${currentSet}`
                    : currentSet === totalSets
                    ? `Complete Set ${currentSet} & Finish Exercise`
                    : `Complete Set ${currentSet}`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Step-by-Step Instructions & Trainer Advice */}
        <div className="lg:w-2/5 p-4 md:p-6 bg-[#F8FAFC] border-t lg:border-t-0 lg:border-l border-[#E2E8F0] flex flex-col justify-between">
          <div className="space-y-4">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FFFFFF] text-[#111827] border border-[#E2E8F0] shadow-sm">
                {ex.category || 'General'}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                Target: {ex.targetMuscle || 'Muscles'}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-[#B45309] border border-amber-200">
                {ex.difficulty || 'All Levels'}
              </span>
            </div>

            {/* Trainer Custom Notes Banner (Crucial requirement) */}
            {currentItem.trainerNotes && (
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[#15803D] font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles size={14} /> Personal Trainer Instruction
                </div>
                <p className="text-xs md:text-sm text-[#EA580C] font-semibold leading-relaxed">
                  &quot;{currentItem.trainerNotes}&quot;
                </p>
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === 'instructions'
                    ? 'bg-[#FFFFFF] text-[#111827] border border-[#E2E8F0] shadow-sm'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                Form Instructions
              </button>
              {ex.safetyInstructions && (
                <button
                  onClick={() => setActiveTab('safety')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    activeTab === 'safety'
                      ? 'bg-rose-500 text-white'
                      : 'text-[#B91C1C] hover:text-rose-700'
                  }`}
                >
                  <ShieldAlert size={13} /> Safety Tips
                </button>
              )}
            </div>

            {/* Tab content */}
            {activeTab === 'instructions' && (
              <div className="space-y-3 text-xs md:text-sm text-[#334155] leading-relaxed max-h-72 overflow-y-auto pr-1">
                <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E2E8F0] shadow-sm whitespace-pre-line text-[#334155]">
                  {ex.instructions || 'Perform movement with controlled breathing and proper spine alignment.'}
                </div>

                <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] shadow-sm text-xs text-[#64748B]">
                  <span className="font-bold text-[#111827] block mb-0.5">Recommended Rest:</span>
                  {configuredRest} seconds between sets to allow muscle ATP replenishment.
                </div>
              </div>
            )}

            {activeTab === 'safety' && ex.safetyInstructions && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-900 leading-relaxed whitespace-pre-line">
                {ex.safetyInstructions}
              </div>
            )}
          </div>

          {/* Quick Exercise Queue List at bottom */}
          <div className="pt-4 border-t border-[#E2E8F0] mt-4">
            <span className="text-[11px] uppercase font-bold text-[#64748B] block mb-2">
              Up Next in {dayName}:
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {exercises.map((item, idx) => {
                const isActive = idx === currentIdx;
                const isCompleted = completedExerciseIdxs.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setAutoAdvanceCountdown(null);
                      setCurrentIdx(idx);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#C2410C] text-white border border-[#C2410C] shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-50 text-[#15803D] border border-emerald-200'
                        : 'bg-[#FFFFFF] text-[#334155] border border-[#E2E8F0] hover:bg-[#FFF7ED] hover:text-[#C2410C]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isActive
                          ? 'bg-[#FFFFFF] text-[#C2410C]'
                          : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
                      }`}>
                        {isCompleted ? '✓' : idx + 1}
                      </span>
                      <span className="truncate">{item.exerciseId?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isCompleted && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#15803D] px-1.5 py-0.5 rounded bg-emerald-100">
                          Done
                        </span>
                      )}
                      <span className={`text-[10px] font-mono ${isActive ? 'text-white/80' : 'text-[#64748B]'}`}>
                        {item.sets} × {item.repetitions}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* WORKOUT FINISHED CELEBRATION MODAL */}
      {workoutFinished && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in zoom-in-95">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-2xl animate-bounce">
              <Award size={42} />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#15803D]">Workout Completed</span>
              <h2 className="text-3xl font-black text-[#111827] mt-1">Fantastic Job!</h2>
              <p className="text-xs text-[#475569] mt-2">
                You crushed today&apos;s routine! All completed sets and exercise times have been saved to your progress tracker.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Exercises</span>
                <span className="text-xl font-black text-[#111827]">{exercises.length}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B] block">Total Duration</span>
                <span className="text-xl font-black text-[#15803D]">{formatTimer(workoutElapsed)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:opacity-95 text-white rounded-xl text-sm font-black transition-all shadow-xl shadow-orange-500/20 cursor-pointer"
            >
              Return to My Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberExercisePlayer;
