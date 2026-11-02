import React, { useState } from 'react';
import { Dumbbell, Flame, Clock, Play, CheckCircle2, ChevronRight, Plus } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileButton } from '../../../shared/components/MobileButton';

export const CustomerWorkoutsScreen: React.FC = () => {
  const [activeDay, setActiveDay] = useState('Mon');

  const days = [
    { day: 'Mon', label: 'Push', active: true },
    { day: 'Tue', label: 'Pull', active: false },
    { day: 'Wed', label: 'Legs', active: false },
    { day: 'Thu', label: 'Rest', active: false },
    { day: 'Fri', label: 'Arms', active: false },
    { day: 'Sat', label: 'HIIT', active: false },
    { day: 'Sun', label: 'Rest', active: false }
  ];

  const exercises = [
    { id: '1', name: 'Barbell Flat Bench Press', sets: '4 sets × 10 reps', target: 'Chest', weight: '70 kg', completed: true },
    { id: '2', name: 'Incline Dumbbell Press', sets: '3 sets × 12 reps', target: 'Upper Chest', weight: '24 kg', completed: false },
    { id: '3', name: 'Cable Tricep Pushdown', sets: '4 sets × 15 reps', target: 'Triceps', weight: '32 kg', completed: false },
    { id: '4', name: 'Overhead Dumbbell Extension', sets: '3 sets × 12 reps', target: 'Triceps Long Head', weight: '18 kg', completed: false },
    { id: '5', name: 'Dips / Chest Dips', sets: '3 sets to failure', target: 'Lower Chest', weight: 'Bodyweight', completed: false }
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Day Selector Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {days.map(d => (
          <button
            key={d.day}
            onClick={() => setActiveDay(d.day)}
            className={`flex-shrink-0 w-12 py-2 rounded-xl text-center transition-all ${
              activeDay === d.day 
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30' 
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            <span className="block text-[10px] font-medium opacity-80">{d.day}</span>
            <span className="block text-xs font-bold">{d.label}</span>
          </button>
        ))}
      </div>

      {/* Routine Overview Header */}
      <MobileCard className="p-4 bg-slate-900 text-white border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400">
              Monday Routine
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">Chest & Triceps Focus</h3>
            <p className="text-xs text-slate-400 mt-1">5 Exercises • ~55 mins • 480 kcal</p>
          </div>
          <button 
            onClick={() => alert('Starting workout timer!')}
            className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/40 active:scale-95"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </button>
        </div>
      </MobileCard>

      {/* Exercise List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-900">Exercise Progression</h3>
        {exercises.map((ex, idx) => (
          <MobileCard key={ex.id} className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  ex.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {ex.completed ? '✓' : idx + 1}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${ex.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {ex.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {ex.sets} • <strong className="text-orange-600">{ex.weight}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => alert(`Logged set for ${ex.name}`)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                  ex.completed 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-orange-50 text-orange-600 border border-orange-200'
                }`}
              >
                {ex.completed ? 'Completed' : 'Log Set'}
              </button>
            </div>
          </MobileCard>
        ))}
      </div>
    </div>
  );
};
export default CustomerWorkoutsScreen;

