import React, { useState, useEffect } from 'react';
import { Calendar, PlayCircle, Clock, Flame, Dumbbell, ChevronRight, CheckCircle2, X, Timer, Activity } from 'lucide-react';

const MemberWorkoutPlan = () => {
  const [activeDay, setActiveDay] = useState('Today');
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutTime, setWorkoutTime] = useState(0);

  const days = ['Mon', 'Tue', 'Wed', 'Today', 'Fri', 'Sat', 'Sun'];
  
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
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Your Workout Plan</h1>
          <p className="text-[#475569] mt-1">Stay consistent and crush your goals this week.</p>
        </div>
        <button onClick={() => setIsWorkoutActive(true)} className="flex items-center space-x-2 px-6 py-3 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-all shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95">
          <PlayCircle size={20} />
          <span>Start Workout</span>
        </button>
      </div>

      {/* Week Calendar */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                activeDay === day 
                  ? 'bg-[#16A34A] text-white shadow-md scale-110' 
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wider mb-1">{day}</span>
              <span className={`text-xl font-bold ${activeDay === day ? 'text-white' : 'text-[#1E293B]'}`}>
                {day === 'Today' ? '19' : Math.floor(Math.random() * 30) + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Workout Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overview Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
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
          <div className="bg-white rounded-3xl shadow-sm border border-[#E2E8F0] p-6 md:p-8">
            <h3 className="text-xl font-bold text-[#1E293B] mb-6">Exercises (5)</h3>
            <div className="space-y-4">
              {workoutData.exercises.map((exercise, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    exercise.completed 
                      ? 'bg-green-50/50 border-green-200' 
                      : 'bg-white border-[#E2E8F0] hover:border-[#16A34A] hover:shadow-md cursor-pointer'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      exercise.completed ? 'bg-green-100 text-green-600' : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}>
                      {exercise.completed ? <CheckCircle2 size={20} /> : <span className="font-bold text-sm">{index + 1}</span>}
                    </div>
                    <div>
                      <h4 className={`font-bold ${exercise.completed ? 'text-green-700 line-through opacity-70' : 'text-[#1E293B]'}`}>
                        {exercise.name}
                      </h4>
                      <p className="text-sm text-[#64748B] mt-0.5">
                        {exercise.sets} sets × {exercise.reps} reps
                      </p>
                    </div>
                  </div>
                  <button className={`p-2 rounded-full ${exercise.completed ? 'text-green-500' : 'text-[#CBD5E1] hover:text-[#16A34A]'}`}>
                    <ChevronRight size={24} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Active Workout Modal Overlay */}
      {isWorkoutActive && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="bg-[#1E293B] text-white p-6 md:p-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#16A34A] rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
              
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-semibold mb-4 text-[#CCFBF1]">
                    <Activity size={16} /> ACTIVE WORKOUT
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">{workoutData.title}</h2>
                  <p className="text-[#94A3B8]">{workoutData.exercises.length} Exercises • {workoutData.level}</p>
                </div>
                <button onClick={() => { setIsWorkoutActive(false); setWorkoutTime(0); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 relative z-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-[#94A3B8] text-sm font-medium mb-1 flex items-center gap-2"><Timer size={16}/> Elapsed Time</div>
                  <div className="text-2xl font-bold font-mono tracking-wider text-[#16A34A]">{formatTime(workoutTime)}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <div className="text-[#94A3B8] text-sm font-medium mb-1 flex items-center gap-2"><Flame size={16}/> Est. Calories</div>
                  <div className="text-2xl font-bold">{Math.floor((workoutTime / 60) * 8)} <span className="text-base text-[#64748B] font-normal">kcal</span></div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 mt-4">
              <h3 className="text-xl font-bold text-[#1E293B] mb-6">Current Progress</h3>
              
              <div className="space-y-4">
                {workoutData.exercises.map((exercise, index) => (
                  <div key={index} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center font-bold text-lg border border-[#CCFBF1]">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-[#1E293B]">{exercise.name}</h4>
                          <p className="text-sm text-[#64748B]">Target: {exercise.sets} Sets × {exercise.reps} Reps</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      {Array.from({ length: exercise.sets }).map((_, setIdx) => (
                        <div key={setIdx} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#16A34A]/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-[#64748B] w-12">Set {setIdx + 1}</span>
                            <div className="flex items-center gap-2 text-sm">
                              <input type="number" placeholder={exercise.reps.split('-')[0]} className="w-16 p-1.5 border border-[#CBD5E1] rounded-lg text-center focus:border-[#16A34A] focus:outline-none" />
                              <span className="text-[#94A3B8]">reps</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm hidden sm:flex">
                              <input type="number" placeholder="--" className="w-16 p-1.5 border border-[#CBD5E1] rounded-lg text-center focus:border-[#16A34A] focus:outline-none" />
                              <span className="text-[#94A3B8]">kg</span>
                            </div>
                          </div>
                          <button className="w-8 h-8 rounded-full border-2 border-[#CBD5E1] hover:border-[#16A34A] hover:bg-[#F0FDFA] flex items-center justify-center transition-colors text-transparent hover:text-[#16A34A]">
                            <CheckCircle2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t border-[#E2E8F0] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            <div className="max-w-4xl mx-auto flex gap-4">
              <button onClick={() => { setIsWorkoutActive(false); setWorkoutTime(0); }} className="px-6 py-4 rounded-xl font-bold text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors">
                Cancel
              </button>
              <button onClick={() => { setIsWorkoutActive(false); setWorkoutTime(0); alert("Workout Completed! Great job!"); }} className="flex-1 bg-[#16A34A] text-white rounded-xl font-bold text-lg hover:bg-[#15803D] transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
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
