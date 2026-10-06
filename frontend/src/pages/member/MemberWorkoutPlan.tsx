import React, { useState, useEffect } from 'react';
import {
  PlayCircle, Clock, Flame, Dumbbell, CheckCircle2,
  X, Activity, Utensils, Video, Play, Sparkles, User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import MemberExercisePlayer, { type PlayerExercise } from '../../components/workout/MemberExercisePlayer';

const MemberWorkoutPlan: React.FC = () => {
  const [activePlan, setActivePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Completed exercise IDs in recent/current session
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Active Exercise Player state
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playerInitialIndex, setPlayerInitialIndex] = useState(0);

  useEffect(() => {
    fetchMyPlan();
    fetchProgressLogs();
  }, []);

  const fetchMyPlan = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workout-plans/my-plan');
      if (res.data.success && res.data.plan) {
        setActivePlan(res.data.plan);
      }
    } catch (err) {
      console.error('Failed to fetch published workout plan:', err);
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative pb-16">
      {/* Plan Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-[#E8E5DA] pb-3">
        <Link
          to="/member/workout"
          className="flex items-center gap-2 px-4 py-2 bg-[#164A4A] text-white rounded-xl font-bold text-sm shadow-sm"
        >
          <Dumbbell size={16} /> Workout Plan
        </Link>
        <Link
          to="/member/diet"
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#455250] hover:text-[#164A4A] hover:bg-[#F2EFE8] rounded-xl font-bold text-sm border border-[#E8E5DA] transition-colors"
        >
          <Utensils size={16} /> Diet Plan
        </Link>
        <Link
          to="/member/progress"
          className="flex items-center gap-2 px-4 py-2 bg-white text-[#455250] hover:text-[#164A4A] hover:bg-[#F2EFE8] rounded-xl font-bold text-sm border border-[#E8E5DA] transition-colors"
        >
          <Activity size={16} /> My Progress
        </Link>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Sparkles size={12} /> Active Workout Plan
            </span>
            {activePlan?.trainerId && (
              <span className="text-xs text-[#687B78] flex items-center gap-1">
                <User size={12} /> Assigned by Trainer {activePlan.trainerId.firstName} {activePlan.trainerId.lastName}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#202828] tracking-tight">
            {activePlan?.planName || 'My Workout Plan'}
          </h1>
          <p className="text-sm text-[#455250] mt-1 max-w-2xl">
            {activePlan?.description || 'Follow your personalized exercise routine with animated video guides and automated set/rest tracking.'}
          </p>
        </div>

        {dayExercises.length > 0 && (
          <button
            onClick={() => handleLaunchPlayer(0)}
            className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-[#164A4A] to-teal-700 text-white rounded-xl font-extrabold hover:opacity-95 transition-all shadow-lg shadow-teal-900/20 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <PlayCircle size={22} />
            <span>Start Today&apos;s Workout</span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20 text-[#687B78]">
          <div className="w-10 h-10 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-semibold text-sm">Loading your personalized workout plan...</p>
        </div>
      ) : !activePlan ? (
        <div className="bg-white border border-[#D3DFDA] rounded-3xl p-12 text-center shadow-sm">
          <Dumbbell size={52} className="mx-auto text-[#A8ADA9] mb-4" />
          <h2 className="text-xl font-bold text-[#202828]">No Workout Plan Published Yet</h2>
          <p className="text-sm text-[#687B78] mt-2 max-w-md mx-auto">
            Your trainer is currently reviewing your profile and designing your personalized workout plan with exercise animations.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/member/ai-assistant"
              className="px-5 py-2.5 bg-[#164A4A] text-white text-xs font-bold rounded-xl hover:bg-[#C6A77D] transition-colors"
            >
              Check AI Fitness Assessment
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Day Tabs */}
          <div className="bg-white border border-[#E8E5DA] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2">
                {currentWorkoutDays.map((day: any, idx: number) => {
                  const isActive = activeDayIndex === idx;
                  const exCount = day.exercises?.length || 0;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveDayIndex(idx)}
                      className={`flex flex-col sm:flex-row items-center gap-1.5 px-5 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#164A4A] text-white shadow-md scale-102 font-bold'
                          : 'bg-[#F2EFE8] text-[#455250] hover:bg-[#E8E5DA] font-semibold'
                      }`}
                    >
                      <span className="text-xs sm:text-sm">{day.dayName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-black/10 text-[#455250]'
                      }`}>
                        {exCount} {exCount === 1 ? 'exercise' : 'exercises'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {stats && (
                <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-[#455250] pr-2">
                  <span>Streak: <strong className="text-emerald-700">🔥 {stats.workoutStreak || 0} Days</strong></span>
                  <span>Completed: <strong className="text-[#164A4A]">{stats.completionPercentage || 0}%</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Today's Workout Routine Overview Card & Exercise Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Overview / Target Focus Card */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gradient-to-br from-[#202828] to-[#121A1A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold mb-4 text-emerald-300">
                  <Activity size={14} /> TODAY&apos;S TARGET
                </div>

                <h3 className="text-2xl font-black mb-1">{currentDay?.dayName}</h3>
                <p className="text-xs text-white/70 mb-6">
                  {dayExercises.length} Exercises designed to optimize strength and muscle development.
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
                      <p className="text-[11px] text-white/50 font-bold uppercase">Estimated Caloric Burn</p>
                      <p className="font-extrabold text-sm text-white">
                        ~{dayExercises.length * 55} kcal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 bg-white/5 rounded-2xl p-3.5 border border-white/10">
                    <Dumbbell className="text-purple-400" size={20} />
                    <div>
                      <p className="text-[11px] text-white/50 font-bold uppercase">Workout Type</p>
                      <p className="font-extrabold text-sm text-white">
                        Animated Video Demonstration
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchPlayer(0)}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-[#121818] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Play size={15} className="fill-current" />
                  <span>Start Full Workout Screen</span>
                </button>
              </div>
            </div>

            {/* Exercises List for the Day */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-extrabold text-[#202828]">
                  Exercises in {currentDay?.dayName} ({dayExercises.length})
                </h3>
                <span className="text-xs text-[#687B78]">
                  Click <strong>Watch Exercise</strong> to play video guide
                </span>
              </div>

              {dayExercises.length === 0 ? (
                <div className="p-8 text-center bg-white border border-dashed border-[#D3DFDA] rounded-3xl">
                  <p className="text-sm font-semibold text-[#455250]">No exercises assigned for this day.</p>
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
                        isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-[#E8E5DA]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left Details */}
                        <div className="flex items-start gap-4">
                          {/* Number / Status Circle */}
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 transition-colors shadow-sm ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : 'bg-[#164A4A] text-white'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 size={24} /> : idx + 1}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-base md:text-lg text-[#202828]">
                                {ex.name || 'Exercise'}
                              </h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F2EFE8] text-[#455250]">
                                {ex.category || 'Fitness'}
                              </span>
                              {hasVideo && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                                  <Video size={10} /> Video Available
                                </span>
                              )}
                            </div>

                            {/* Sets x Reps + Rest Time */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#455250] font-semibold pt-0.5">
                              <span className="text-[#164A4A] font-bold">
                                {item.sets || 3} Sets × {item.repetitions || 12} Reps
                              </span>
                              <span>•</span>
                              <span>{item.restTime || ex.defaultRest || 30}s Rest</span>
                              {ex.targetMuscle && (
                                <>
                                  <span>•</span>
                                  <span className="text-[#687B78]">{ex.targetMuscle}</span>
                                </>
                              )}
                            </div>

                            {/* Trainer Custom Notes */}
                            {item.trainerNotes && (
                              <p className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-100 px-3 py-1 rounded-xl mt-1.5 font-medium">
                                <strong>Trainer Note:</strong> {item.trainerNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right CTA Button */}
                        <div className="flex items-center gap-2 sm:self-center shrink-0">
                          <button
                            onClick={() => handleLaunchPlayer(idx)}
                            className="px-5 py-2.5 bg-[#164A4A] hover:bg-[#C6A77D] text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                          >
                            <Play size={14} className="fill-current" />
                            <span>Watch Exercise</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Trainer Assigned Self-Learning Videos Section (Retained) */}
      <div className="bg-white rounded-3xl shadow-sm border border-[#E8E5DA] p-6 md:p-8 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[#202828] flex items-center gap-2">
            <PlayCircle className="text-[#164A4A]" size={22} /> Trainer-Assigned Self-Learning Videos
          </h3>
          <p className="text-sm text-[#455250]">Watch assigned exercise videos when you cannot attend live sessions or for extra guidance.</p>
        </div>

        <AssignedVideosSection />
      </div>

      {/* DEDICATED EXERCISE PLAYER SCREEN */}
      {isPlayerOpen && (
        <MemberExercisePlayer
          planId={activePlan?._id || ''}
          dayName={currentDay?.dayName || 'Workout Routine'}
          exercises={playerExercises}
          initialIndex={playerInitialIndex}
          onClose={() => setIsPlayerOpen(false)}
          onCompleteExercise={handleExerciseCompletedInPlayer}
        />
      )}
    </div>
  );
};

// Sub-component for Trainer assigned videos
const AssignedVideosSection = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workout-videos/customer');
      if (res.data.success) {
        setVideos(res.data.videos || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleMarkCompleted = async (videoId: string) => {
    try {
      await api.patch(`/workout-videos/${videoId}/status`, { status: 'Completed' });
      alert('Video marked as completed! Great progress!');
      setActiveVideo(null);
      await fetchVideos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update video status');
    }
  };

  if (loading) {
    return <p className="text-gray-500 text-sm py-4">Loading assigned videos...</p>;
  }

  if (videos.length === 0) {
    return (
      <div className="p-8 text-center bg-[#F8FAFC] border border-dashed border-[#D3DFDA] rounded-2xl">
        <PlayCircle size={36} className="mx-auto text-gray-400 mb-2" />
        <p className="font-bold text-[#202828] text-sm">No extra self-learning videos assigned</p>
        <p className="text-xs text-[#687B78]">Follow your active workout plan above with animated exercise player.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((vid) => (
          <div key={vid._id} className="bg-[#F8FAFC] border border-[#E8E5DA] rounded-2xl p-4 flex flex-col h-full hover:border-[#164A4A] transition-colors">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${vid.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                {vid.status}
              </span>
              <span className="text-xs font-semibold text-gray-500">{vid.difficulty}</span>
            </div>
            <h4 className="font-bold text-[#202828] text-base mb-1">{vid.title}</h4>
            <p className="text-xs text-[#687B78] mb-3 line-clamp-2">{vid.instructions || vid.trainerNotes || 'Follow instructions in video.'}</p>

            <div className="mt-auto pt-3 border-t border-[#E8E5DA] flex justify-between items-center text-xs">
              <span className="text-gray-600 font-semibold">{vid.durationMinutes} mins • {vid.sets} sets × {vid.reps} reps</span>
              <button onClick={() => setActiveVideo(vid)} className="px-3 py-1.5 bg-[#164A4A] text-white font-bold rounded-lg hover:bg-[#C6A77D] transition-colors flex items-center gap-1">
                <PlayCircle size={14} /> Watch
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeVideo && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-[#202828]">{activeVideo.title}</h3>
                <p className="text-xs text-gray-500">{activeVideo.exerciseName} • {activeVideo.sets} Sets × {activeVideo.reps} Reps</p>
              </div>
              <button onClick={() => setActiveVideo(null)} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
            </div>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <iframe
                src={activeVideo.videoUrl.replace('watch?v=', 'embed/')}
                title={activeVideo.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>

            {activeVideo.instructions && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-xs text-blue-900">
                <span className="font-bold block mb-1">Trainer Instructions:</span>
                <p>{activeVideo.instructions}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setActiveVideo(null)} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600">Close</button>
              {activeVideo.status !== 'Completed' && (
                <button onClick={() => handleMarkCompleted(activeVideo._id)} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MemberWorkoutPlan;
