import React, { useState } from 'react';
import { Dumbbell, Plus, Flame, Clock, Check, ChevronRight } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileButton } from '../../../shared/components/MobileButton';
import { MobileModal } from '../../../shared/components/MobileModal';
import { MobileInput } from '../../../shared/components/MobileInput';

interface WorkoutRoutine {
  id: string;
  title: string;
  targetMuscle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exercisesCount: number;
  duration: string;
  calories: number;
}

export const TrainerWorkoutsScreen: React.FC = () => {
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([
    { id: '1', title: 'Chest & Triceps Hypertrophy', targetMuscle: 'Chest, Arms', difficulty: 'Advanced', exercisesCount: 6, duration: '60 mins', calories: 480 },
    { id: '2', title: 'Full Body HIIT Conditioning', targetMuscle: 'Cardio, Core', difficulty: 'Intermediate', exercisesCount: 8, duration: '45 mins', calories: 520 },
    { id: '3', title: 'Legs & Glutes Power Split', targetMuscle: 'Quads, Hamstrings', difficulty: 'Advanced', exercisesCount: 5, duration: '55 mins', calories: 550 },
    { id: '4', title: 'Back & Biceps Thickness', targetMuscle: 'Lats, Traps, Biceps', difficulty: 'Intermediate', exercisesCount: 6, duration: '50 mins', calories: 420 },
    { id: '5', title: 'Core & Mobility Warmup', targetMuscle: 'Abs, Spine', difficulty: 'Beginner', exercisesCount: 4, duration: '20 mins', calories: 150 }
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newRoutine, setNewRoutine] = useState({ title: '', targetMuscle: '', difficulty: 'Intermediate' as const, duration: '45 mins', calories: 400 });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutine.title) return;
    const added: WorkoutRoutine = {
      id: Date.now().toString(),
      title: newRoutine.title,
      targetMuscle: newRoutine.targetMuscle || 'Full Body',
      difficulty: newRoutine.difficulty,
      exercisesCount: 5,
      duration: newRoutine.duration,
      calories: Number(newRoutine.calories) || 350
    };
    setRoutines([added, ...routines]);
    setIsCreateOpen(false);
    setNewRoutine({ title: '', targetMuscle: '', difficulty: 'Intermediate', duration: '45 mins', calories: 400 });
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Training Routine Library</h2>
          <p className="text-xs text-slate-500">Assign pre-built splits to your clients</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="h-10 px-3 bg-orange-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create Routine
        </button>
      </div>

      <div className="space-y-3">
        {routines.map(r => (
          <MobileCard key={r.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                  r.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  r.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {r.difficulty}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{r.targetMuscle}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Dumbbell className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-slate-400" /> {r.exercisesCount} Moves
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> {r.duration}
              </span>
              <span className="flex items-center gap-1 text-orange-600 font-semibold">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" /> {r.calories} kcal
              </span>
            </div>

            <div className="mt-3 pt-2.5 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400">Assigned to 8 clients</span>
              <button 
                onClick={() => alert(`Assign routine "${r.title}" to client`)}
                className="text-xs font-bold text-orange-600 flex items-center gap-1 hover:underline"
              >
                Assign to Client <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </MobileCard>
        ))}
      </div>

      {/* Create Modal */}
      <MobileModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Workout Routine">
        <form onSubmit={handleCreate} className="space-y-3.5">
          <MobileInput 
            label="Routine Name"
            placeholder="e.g. Upper Body Blast"
            value={newRoutine.title}
            onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
            required
          />
          <MobileInput 
            label="Target Muscle Group"
            placeholder="e.g. Chest, Shoulders, Core"
            value={newRoutine.targetMuscle}
            onChange={(e) => setNewRoutine({ ...newRoutine, targetMuscle: e.target.value })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Difficulty Level</label>
            <select 
              value={newRoutine.difficulty}
              onChange={(e) => setNewRoutine({ ...newRoutine, difficulty: e.target.value as any })}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <MobileInput 
              label="Duration"
              value={newRoutine.duration}
              onChange={(e) => setNewRoutine({ ...newRoutine, duration: e.target.value })}
            />
            <MobileInput 
              label="Estimated Calories"
              type="number"
              value={newRoutine.calories}
              onChange={(e) => setNewRoutine({ ...newRoutine, calories: Number(e.target.value) })}
            />
          </div>
          <div className="pt-2 flex gap-2">
            <MobileButton variant="secondary" onClick={() => setIsCreateOpen(false)} type="button">Cancel</MobileButton>
            <MobileButton variant="primary" type="submit">Save Routine</MobileButton>
          </div>
        </form>
      </MobileModal>
    </div>
  );
};
export default TrainerWorkoutsScreen;

