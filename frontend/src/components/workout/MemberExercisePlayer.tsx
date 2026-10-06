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

  // Rest state
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(configuredRest);

  // Completion states
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

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
  }, [currentIdx, currentItem]);

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
      // Rest completed, move to next set
      setIsResting(false);
      setCurrentSet(prev => prev + 1);
      setRestTimeRemaining(configuredRest);
    }
    return () => clearInterval(restInterval);
  }, [isResting, restTimeRemaining, configuredRest]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Complete Set handler
  const handleCompleteSet = async () => {
    if (currentSet < totalSets) {
      // Trigger Rest mode
      setIsResting(true);
      setRestTimeRemaining(configuredRest);
    } else {
      // Completed all sets for this exercise!
      await handleFinishExercise();
    }
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setCurrentSet(prev => prev + 1);
    setRestTimeRemaining(configuredRest);
  };

  const handleFinishExercise = async () => {
    setSavingProgress(true);
    try {
      if (planId && ex?._id) {
        await api.post('/workout-progress/log', {
          workoutPlanId: planId,
          exerciseId: ex._id,
          completedSets: totalSets,
          totalSets: totalSets,
          completedRepetitions: repCount,
          duration: workoutElapsed || 60,
          status: 'Completed'
        });
      }

      setExerciseCompleted(true);
      if (onCompleteExercise && ex?._id) {
        onCompleteExercise(ex._id);
      }

      // If last exercise in this day
      if (currentIdx === exercises.length - 1) {
        setWorkoutFinished(true);
      }
    } catch (err) {
      console.error('Failed to log exercise progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNextExercise = () => {
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setWorkoutFinished(true);
    }
  };

  const handlePrevExercise = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentSet(1);
    setWorkoutElapsed(0);
    setIsResting(false);
    setRestTimeRemaining(configuredRest);
    setExerciseCompleted(false);
    setIsPaused(false);
  };

  if (!currentItem || !ex) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#121818] text-white overflow-hidden animate-in fade-in">
      {/* Top Navbar */}
      <div className="px-4 py-3 bg-[#1B2323] border-b border-white/10 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            title="Exit Workout"
          >
            <X size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-[#164A4A] text-emerald-300">
                {dayName}
              </span>
              <span className="text-xs text-white/60 font-semibold">
                Exercise {currentIdx + 1} of {exercises.length}
              </span>
            </div>
            <h2 className="text-base md:text-lg font-extrabold text-white truncate max-w-xs md:max-w-md">
              {ex.name}
            </h2>
          </div>
        </div>

        {/* Exercises navigation selector */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevExercise}
            disabled={currentIdx === 0}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white disabled:opacity-20 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs font-mono font-bold px-2 py-1 bg-white/5 rounded-lg border border-white/10">
            {currentIdx + 1} / {exercises.length}
          </span>
          <button
            onClick={handleNextExercise}
            disabled={currentIdx === exercises.length - 1}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white disabled:opacity-20 transition-colors"
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
          <div className="grid grid-cols-3 gap-2 md:gap-4 bg-[#1B2323] p-3 md:p-4 rounded-2xl border border-white/10 text-center">
            {/* Set Counter */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">Current Set</span>
              <div className="text-xl md:text-2xl font-black font-mono text-emerald-400 mt-0.5">
                SET {currentSet} / {totalSets}
              </div>
            </div>

            {/* Repetition Counter */}
            <div className="flex flex-col items-center justify-center border-x border-white/10 px-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">Target Reps</span>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => setRepCount(prev => Math.max(1, prev - 1))}
                  className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-xl md:text-2xl font-black font-mono text-white">
                  {repCount}
                </span>
                <button
                  type="button"
                  onClick={() => setRepCount(prev => prev + 1)}
                  className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Countdown / Elapsed Timer */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/50">Elapsed Time</span>
              <div className="text-xl md:text-2xl font-black font-mono text-amber-400 mt-0.5">
                {formatTimer(workoutElapsed)}
              </div>
            </div>
          </div>

          {/* Animated Exercise Video Player / Rest Overlay */}
          <div className="relative rounded-3xl overflow-hidden bg-black border border-white/15 aspect-video md:aspect-[16/10] flex items-center justify-center shadow-2xl">
            {isResting ? (
              <div className="absolute inset-0 bg-[#0F1E1E] flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-emerald-400/30 border-t-emerald-400 animate-spin flex items-center justify-center mb-4">
                  <div className="text-2xl md:text-4xl font-black font-mono text-emerald-300">
                    {restTimeRemaining}s
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-white tracking-wide">REST PERIOD</h3>
                <p className="text-xs md:text-sm text-white/60 mt-1 max-w-sm">
                  Catch your breath and hydrate. Set {currentSet + 1} of {totalSets} will begin automatically.
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSkipRest}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#121818] rounded-xl text-xs md:text-sm font-black transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Skip Rest & Begin Set {currentSet + 1}
                  </button>
                  <button
                    onClick={() => setRestTimeRemaining(prev => prev + 15)}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs md:text-sm font-bold transition-colors"
                  >
                    +15s Rest
                  </button>
                </div>
              </div>
            ) : exerciseCompleted ? (
              <div className="absolute inset-0 bg-[#164A4A] flex flex-col items-center justify-center p-6 text-center z-30 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-400 text-[#121818] flex items-center justify-center mb-3 shadow-xl">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-white">Exercise Completed!</h3>
                <p className="text-xs text-white/80 mt-1">
                  Logged {totalSets} Sets × {repCount} Reps ({formatTimer(workoutElapsed)})
                </p>

                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={handleRestart}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Repeat Exercise
                  </button>
                  {currentIdx < exercises.length - 1 ? (
                    <button
                      onClick={handleNextExercise}
                      className="px-6 py-2.5 bg-white text-[#164A4A] hover:bg-white/90 rounded-xl text-xs font-extrabold transition-all shadow-lg flex items-center gap-1.5"
                    >
                      <span>Next Exercise</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setWorkoutFinished(true)}
                      className="px-6 py-2.5 bg-emerald-400 text-[#121818] rounded-xl text-xs font-black transition-all shadow-lg flex items-center gap-1.5"
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
              />
            )}
          </div>

          {/* Interactive Set Action Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="p-3 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Restart Exercise"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Restart</span>
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs md:text-sm font-bold transition-colors flex items-center gap-2"
            >
              {isPaused ? <Play size={16} className="fill-current" /> : <Pause size={16} />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={handleCompleteSet}
              disabled={isResting || exerciseCompleted || savingProgress}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-[#121818] rounded-2xl text-sm md:text-base font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              <span>
                {currentSet === totalSets ? 'Complete Exercise' : `Complete Set ${currentSet}`}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Step-by-Step Instructions & Trainer Advice */}
        <div className="lg:w-2/5 p-4 md:p-6 bg-[#161F1F] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-white/90">
                {ex.category || 'General'}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-emerald-300">
                Target: {ex.targetMuscle || 'Muscles'}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 text-amber-300">
                {ex.difficulty || 'All Levels'}
              </span>
            </div>

            {/* Trainer Custom Notes Banner (Crucial requirement) */}
            {currentItem.trainerNotes && (
              <div className="bg-[#242E28] border border-emerald-500/40 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Sparkles size={14} /> Personal Trainer Instruction
                </div>
                <p className="text-xs md:text-sm text-emerald-100 font-medium leading-relaxed">
                  &quot;{currentItem.trainerNotes}&quot;
                </p>
              </div>
            )}

            {/* Tab navigation */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('instructions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeTab === 'instructions'
                    ? 'bg-white text-[#121818]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Form Instructions
              </button>
              {ex.safetyInstructions && (
                <button
                  onClick={() => setActiveTab('safety')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                    activeTab === 'safety'
                      ? 'bg-rose-500 text-white'
                      : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  <ShieldAlert size={13} /> Safety Tips
                </button>
              )}
            </div>

            {/* Tab content */}
            {activeTab === 'instructions' && (
              <div className="space-y-3 text-xs md:text-sm text-white/80 leading-relaxed max-h-72 overflow-y-auto pr-1">
                <div className="bg-black/20 p-4 rounded-2xl border border-white/10 whitespace-pre-line">
                  {ex.instructions || 'Perform movement with controlled breathing and proper spine alignment.'}
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-white/60">
                  <span className="font-bold text-white block mb-0.5">Recommended Rest:</span>
                  {configuredRest} seconds between sets to allow muscle ATP replenishment.
                </div>
              </div>
            )}

            {activeTab === 'safety' && ex.safetyInstructions && (
              <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl text-xs text-rose-200 leading-relaxed whitespace-pre-line">
                {ex.safetyInstructions}
              </div>
            )}
          </div>

          {/* Quick Exercise Queue List at bottom */}
          <div className="pt-4 border-t border-white/10 mt-4">
            <span className="text-[11px] uppercase font-bold text-white/40 block mb-2">
              Up Next in {dayName}:
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {exercises.map((item, idx) => {
                const isActive = idx === currentIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white border border-white/20'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="truncate">{item.exerciseId?.name}</span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">
                      {item.sets} × {item.repetitions}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* WORKOUT FINISHED CELEBRATION MODAL */}
      {workoutFinished && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95">
          <div className="bg-[#1B2323] border border-white/15 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-400 text-[#121818] flex items-center justify-center mx-auto shadow-2xl animate-bounce">
              <Award size={42} />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Workout Completed</span>
              <h2 className="text-3xl font-black text-white mt-1">Fantastic Job!</h2>
              <p className="text-xs text-white/70 mt-2">
                You crushed today&apos;s routine! All completed sets and exercise times have been saved to your progress tracker.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/50 block">Exercises</span>
                <span className="text-xl font-black text-white">{exercises.length}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-white/50 block">Total Duration</span>
                <span className="text-xl font-black text-emerald-400">{formatTimer(workoutElapsed)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-[#121818] rounded-xl text-sm font-black transition-all shadow-xl shadow-emerald-500/30"
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
