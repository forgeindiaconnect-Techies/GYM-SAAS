import React, { useState, useEffect } from 'react';
import { Calendar, PlayCircle, Clock, Flame, Dumbbell, ChevronRight, CheckCircle2, X, Timer, Activity } from 'lucide-react';

const MemberWorkoutPlan = () => {
  const generateWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    
    const week = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + diffToMonday + i);
      const isToday = date.toDateString() === today.toDateString();
      
      week.push({
        id: isToday ? 'Today' : dayNames[date.getDay()],
        label: isToday ? 'Today' : dayNames[date.getDay()],
        date: date.getDate(),
      });
    }
    return week;
  };

  const weekDays = generateWeekDays();
  const [activeDay, setActiveDay] = useState('Today');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  const workoutData = {
    title: 'Upper Body Power',
    duration: '45 mins',
    calories: '320 kcal',
    level: 'Intermediate',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: '8-10', completed: true },
      { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', completed: true },
      { name: 'Cable Crossovers', sets: 3, reps: '15', completed: false },
      { name: 'Overhead Tricep Extension', sets: 3, reps: '12', completed: false },
      { name: 'Lateral Raises', sets: 4, reps: '15', completed: false },
    ]
  };

  const getInitialSets = () => {
    const saved = localStorage.getItem('workout_completed_sets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const initial: Record<number, boolean[]> = {};
    workoutData.exercises.forEach((ex, idx) => {
      initial[idx] = Array(ex.sets).fill(ex.completed);
    });
    return initial;
  };

  const getInitialTimes = () => {
    const saved = localStorage.getItem('workout_exercise_times');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const times: Record<number, { start?: Date, end?: Date }> = {};
        for (const key in parsed) {
          times[key] = {};
          if (parsed[key].start) times[key].start = new Date(parsed[key].start);
          if (parsed[key].end) times[key].end = new Date(parsed[key].end);
        }
        return times;
      } catch (e) {}
    }
    return {};
  };

  const [completedSets, setCompletedSets] = useState<Record<number, boolean[]>>(getInitialSets());
  const [exerciseTimes, setExerciseTimes] = useState<Record<number, { start?: Date, end?: Date }>>(getInitialTimes());
  const [expandedExercises, setExpandedExercises] = useState<Record<number, boolean>>({});

  useEffect(() => {
    localStorage.setItem('workout_completed_sets', JSON.stringify(completedSets));
  }, [completedSets]);

  useEffect(() => {
    localStorage.setItem('workout_exercise_times', JSON.stringify(exerciseTimes));
  }, [exerciseTimes]);

  const toggleExpand = (index: number) => {
    setExpandedExercises(prev => ({...prev, [index]: !prev[index]}));
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    setWorkoutTime(0);
    setStartTime(new Date());
    // Don't reset completedSets, so they can continue from where they left off
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    setCompletedSets(prev => {
      const newSets = { ...prev };
      const exSets = [...(newSets[exIdx] || [])];
      exSets[setIdx] = !exSets[setIdx];
      newSets[exIdx] = exSets;
      
      setExerciseTimes(prevTimes => {
        const times = { ...prevTimes };
        if (!times[exIdx]) times[exIdx] = {};
        
        const anyCompleted = newSets[exIdx].some(s => s === true);
        if (anyCompleted && !times[exIdx].start) {
          times[exIdx].start = new Date();
        }
        
        const allCompleted = newSets[exIdx].length > 0 && newSets[exIdx].every(s => s === true);
        if (allCompleted && !times[exIdx].end) {
          times[exIdx].end = new Date();
        } else if (!allCompleted) {
          delete times[exIdx].end;
        }
        
        return times;
      });

      return newSets;
    });
  };

  const isExerciseCompleted = (exIdx: number) => {
    const sets = completedSets[exIdx];
    if (!sets) return false;
    return sets.length > 0 && sets.every(s => s === true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Your Workout Plan</h1>
          <p className="text-[#455250] mt-1">Stay consistent and crush your goals this week.</p>
        </div>
        <button onClick={startWorkout} className="flex items-center space-x-2 px-6 py-3 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-all shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95">
          <PlayCircle size={20} />
          <span>Start Workout</span>
        </button>
      </div>

      {/* Week Calendar */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {weekDays.map((dayObj) => (
            <button
              key={dayObj.id}
              onClick={() => setActiveDay(dayObj.id)}
              className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                activeDay === dayObj.id 
                  ? 'bg-[#164A4A] text-white shadow-md scale-110' 
                  : 'bg-[#F2EFE8] text-[#687B78] hover:bg-[#E8E5DA]'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider mb-1">{dayObj.label}</span>
              <span className={`text-xl font-bold ${activeDay === dayObj.id ? 'text-white' : 'text-[#202828]'}`}>
                {dayObj.date}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Workout Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overview Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#202828] to-[#0F172A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
            
            <h2 className="text-2xl font-bold mb-6">{workoutData.title}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Clock className="text-blue-400" size={24} />
                <div>
                  <p className="text-sm text-gray-300">Duration</p>
                  <p className="font-bold">{workoutData.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Flame className="text-orange-400" size={24} />
                <div>
                  <p className="text-sm text-gray-300">Est. Calories</p>
                  <p className="font-bold">{workoutData.calories}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <Dumbbell className="text-purple-400" size={24} />
                <div>
                  <p className="text-sm text-gray-300">Level</p>
                  <p className="font-bold">{workoutData.level}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-[#E8E5DA] p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#202828] mb-6">Exercises (5)</h3>
            <div className="space-y-4">
              {workoutData.exercises.map((exercise, index) => {
                const mainCompleted = isExerciseCompleted(index);
                const isExpanded = expandedExercises[index] || false;
                return (
                <div key={index} className="flex flex-col">
                  <div 
                    onClick={() => toggleExpand(index)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                      mainCompleted 
                        ? 'bg-green-50/50 border-green-200' 
                        : 'bg-white border-[#E8E5DA] hover:border-[#164A4A] hover:shadow-md cursor-pointer'
                    } ${isExpanded ? 'rounded-b-none border-b-0' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        mainCompleted ? 'bg-green-100 text-[#164A4A]' : 'bg-[#F1F5F9] text-[#687B78]'
                      }`}>
                        {mainCompleted ? <CheckCircle2 size={20} /> : <span className="font-bold text-sm">{index + 1}</span>}
                      </div>
                      <div>
                        <h4 className={`font-bold ${mainCompleted ? 'text-green-700 line-through opacity-70' : 'text-[#202828]'}`}>
                          {exercise.name}
                        </h4>
                        <p className="text-sm text-[#687B78] mt-0.5">
                          {exercise.sets} sets × {exercise.reps} reps
                        </p>
                      </div>
                    </div>
                    <button className={`p-2 rounded-full transition-transform ${isExpanded ? 'rotate-90' : ''} ${mainCompleted ? 'text-green-500' : 'text-[#CBD5E1] hover:text-[#164A4A]'}`}>
                      <ChevronRight size={24} />
                    </button>
                  </div>
                  
                  {isExpanded && (
                    <div className={`p-5 pt-2 border border-t-0 rounded-b-2xl ${mainCompleted ? 'bg-green-50/50 border-green-200' : 'bg-white border-[#E8E5DA]'}`}>
                      {(exerciseTimes[index]?.start || exerciseTimes[index]?.end) && (
                        <div className="flex gap-3 mb-4 text-xs font-semibold px-2">
                          {exerciseTimes[index]?.start && (
                            <span className="text-blue-700 bg-blue-50/80 px-2 py-1 rounded border border-blue-100 flex items-center gap-1"><Clock size={12}/> Start: {exerciseTimes[index].start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          )}
                          {mainCompleted && exerciseTimes[index]?.end && (
                            <span className="text-green-700 bg-green-50/80 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><CheckCircle2 size={12}/> End: {exerciseTimes[index].end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                          const setCompleted = completedSets[index]?.[setIdx] || false;
                          return (
                            <div key={setIdx} className={`flex items-center justify-between p-3 rounded-xl border ${setCompleted ? 'bg-[#F0FDF4] border-[#DCFCE7]' : 'bg-[#F2EFE8] border-[#E8E5DA]'}`}>
                              <div className="flex items-center gap-4">
                                <span className={`font-bold w-12 ${setCompleted ? 'text-[#166534]' : 'text-[#687B78]'}`}>Set {setIdx + 1}</span>
                                <span className="text-sm font-medium text-[#455250]">{exercise.reps.split('-')[0]} reps</span>
                              </div>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${setCompleted ? 'bg-[#164A4A] text-white' : 'border-2 border-[#CBD5E1] text-transparent'}`}>
                                <CheckCircle2 size={14} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>
      {/* Active Workout Modal Overlay */}
      {isWorkoutActive && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#F9F8F6]">
          <div className="flex-1 overflow-y-auto min-h-0 pb-12">
            <div className="bg-[#202828] text-white p-6 md:p-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#164A4A] rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-semibold mb-4 text-[#D3DFDA]">
                    <Activity size={16} /> ACTIVE WORKOUT
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{workoutData.title}</h2>
                  <p className="text-[#A8ADA9]">{workoutData.exercises.length} Exercises • {workoutData.level}</p>
                </div>
                <button onClick={() => { setIsWorkoutActive(false); setWorkoutTime(0); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-[#A8ADA9] text-sm font-medium mb-1 flex items-center gap-2"><Clock size={16}/> Start Time</div>
                  <div className="text-xl font-bold text-white">{startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-[#A8ADA9] text-sm font-medium mb-1 flex items-center gap-2"><Timer size={16}/> Elapsed Time</div>
                  <div className="text-xl font-bold font-mono tracking-wider text-[#164A4A]">{formatTime(workoutTime)}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-[#A8ADA9] text-sm font-medium mb-1 flex items-center gap-2"><Flame size={16}/> Est. Calories</div>
                  <div className="text-xl font-bold">{Math.floor((workoutTime / 60) * 8)} <span className="text-base text-[#687B78] font-normal">kcal</span></div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 mt-4">
              <h3 className="text-xl font-bold text-[#202828] mb-6">Current Progress</h3>
              
              <div className="space-y-4">
                {workoutData.exercises.map((exercise, index) => {
                  const completed = isExerciseCompleted(index);
                  return (
                  <div key={index} className={`bg-white border ${completed ? 'border-green-200 shadow-green-100' : 'border-[#E8E5DA]'} rounded-2xl p-5 shadow-sm transition-colors`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border transition-colors ${
                          completed ? 'bg-green-100 text-green-600 border-green-200' : 'bg-[#F1F5F3] text-[#6fa3a0] border-[#D3DFDA]'
                        }`}>
                          {completed ? <CheckCircle2 size={24} /> : index + 1}
                        </div>
                        <div>
                          <h4 className={`font-bold text-lg ${completed ? 'text-green-700' : 'text-[#202828]'}`}>{exercise.name}</h4>
                          <p className="text-sm text-[#687B78]">Target: {exercise.sets} Sets × {exercise.reps} Reps</p>
                          {(exerciseTimes[index]?.start || exerciseTimes[index]?.end) && (
                            <div className="flex gap-3 mt-1.5 text-xs font-semibold">
                              {exerciseTimes[index]?.start && (
                                <span className="text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1"><Clock size={12}/> Start: {exerciseTimes[index].start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              )}
                              {completed && exerciseTimes[index]?.end && (
                                <span className="text-green-700 bg-green-50/80 px-2 py-0.5 rounded border border-green-100 flex items-center gap-1"><CheckCircle2 size={12}/> End: {exerciseTimes[index].end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      {Array.from({ length: exercise.sets }).map((_, setIdx) => {
                        const setCompleted = completedSets[index]?.[setIdx] || false;
                        return (
                        <div key={setIdx} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${setCompleted ? 'bg-[#F0FDF4] border-[#DCFCE7]' : 'bg-[#F2EFE8] border-[#E8E5DA] hover:border-[#164A4A]/50'}`}>
                          <div className="flex items-center gap-4">
                            <span className={`font-bold w-12 ${setCompleted ? 'text-[#166534]' : 'text-[#687B78]'}`}>Set {setIdx + 1}</span>
                            <div className="flex items-center gap-2 text-sm">
                              <input type="number" placeholder={exercise.reps.split('-')[0]} className="w-16 p-1.5 border border-[#CBD5E1] rounded-lg text-center focus:border-[#164A4A] focus:outline-none" />
                              <span className="text-[#A8ADA9]">reps</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm hidden sm:flex">
                              <input type="number" placeholder="--" className="w-16 p-1.5 border border-[#CBD5E1] rounded-lg text-center focus:border-[#164A4A] focus:outline-none" />
                              <span className="text-[#A8ADA9]">kg</span>
                            </div>
                          </div>
                          <button onClick={() => toggleSet(index, setIdx)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${setCompleted ? 'bg-[#164A4A] border-[#164A4A] text-white' : 'border-[#CBD5E1] hover:border-[#164A4A] hover:bg-[#F1F5F3] text-transparent hover:text-[#164A4A]'}`}>
                            <CheckCircle2 size={18} className={setCompleted ? 'text-white' : ''} />
                          </button>
                        </div>
                      );
                      })}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-[#E8E5DA] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="max-w-4xl mx-auto flex gap-4">
              <button onClick={() => { setIsWorkoutActive(false); setWorkoutTime(0); }} className="px-6 py-4 rounded-xl font-bold text-[#455250] bg-[#F1F5F9] hover:bg-[#E8E5DA] transition-colors">
                Cancel
              </button>
              <button onClick={() => { setIsWorkoutActive(false); setWorkoutTime(0); alert("Workout Completed! Great job!"); }} className="flex-1 bg-[#164A4A] text-white rounded-xl font-bold text-lg hover:bg-[#C6A77D] transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                <CheckCircle2 size={24} /> Finish Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberWorkoutPlan;
