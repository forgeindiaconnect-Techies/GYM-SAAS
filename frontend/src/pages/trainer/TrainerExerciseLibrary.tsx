import React, { useState, useEffect } from 'react';
import {
  Search, Dumbbell, Video, Eye,
  Check, Plus, Info, ShieldAlert
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ExerciseVideoPlayer from '../../components/workout/ExerciseVideoPlayer';

interface ExerciseItem {
  _id: string;
  name: string;
  category: string;
  targetMuscle: string;
  secondaryMuscle?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string;
  description: string;
  instructions: string;
  safetyInstructions?: string;
  defaultDuration: number;
  defaultSets: number;
  defaultRepetitions: number;
  defaultRest: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  animationType?: 'video' | 'animation' | 'gif';
  status: 'Active' | 'Inactive';
}

const CATEGORIES = ['All', 'Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body', 'Flexibility'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const TrainerExerciseLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const [previewExercise, setPreviewExercise] = useState<ExerciseItem | null>(null);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exercises');
      if (res.data.success) {
        setExercises(res.data.exercises || []);
      }
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedExerciseIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreatePlanWithSelected = () => {
    const selectedObjs = exercises.filter(e => selectedExerciseIds.includes(e._id));
    sessionStorage.setItem('preselected_workout_exercises', JSON.stringify(selectedObjs));
    navigate('/trainer/workout-plans?action=create');
  };

  const filtered = exercises.filter(ex => {
    // Only active exercises for trainers
    if (ex.status !== 'Active') return false;
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || ex.category === categoryFilter;
    const matchesDiff = difficultyFilter === 'All' || ex.difficulty === difficultyFilter;
    return matchesSearch && matchesCat && matchesDiff;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-[#D3DFDA] rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#164A4A]/10 text-[#164A4A] flex items-center gap-1">
              <Dumbbell size={13} /> Master Exercise Library
            </span>
            <span className="text-xs text-[#687B78]">• Gym Owner Managed</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#202828] tracking-tight">
            Exercise & Animation Library
          </h1>
          <p className="text-sm text-[#455250] mt-1 max-w-2xl">
            Browse verified gym exercises, watch form demonstration videos, and select exercises to build custom workout plans for your clients.
          </p>
        </div>

        {selectedExerciseIds.length > 0 && (
          <div className="flex items-center gap-3 bg-[#E8E5DA]/50 p-2 rounded-xl border border-[#D3DFDA]">
            <span className="text-xs font-bold text-[#164A4A] pl-2">
              {selectedExerciseIds.length} {selectedExerciseIds.length === 1 ? 'Exercise' : 'Exercises'} Selected
            </span>
            <button
              onClick={handleCreatePlanWithSelected}
              className="px-4 py-2 bg-[#164A4A] text-white rounded-lg text-xs font-bold hover:bg-[#C6A77D] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> Create Workout Plan
            </button>
            <button
              onClick={() => setSelectedExerciseIds([])}
              className="text-xs text-[#687B78] hover:text-[#202828] px-2 font-medium"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl p-4 flex items-start gap-3 text-xs text-[#455250]">
        <Info size={18} className="text-[#164A4A] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#202828]">Trainer Note:</strong> Exercises in this library are curated by the gym owner with pre-loaded videos and safety guidelines. When adding an exercise to a client&apos;s workout plan, you can customize sets, reps, rest time, duration, and personal notes without altering the master library.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#687B78]" />
            <input
              type="text"
              placeholder="Search exercise by name, muscle, equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9F8F6] border border-[#D3DFDA] rounded-xl text-sm outline-none focus:border-[#164A4A] text-[#202828]"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#687B78] uppercase">Difficulty:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-[#F9F8F6] border border-[#D3DFDA] rounded-xl px-3 py-2 text-xs font-medium text-[#202828] outline-none"
              >
                {DIFFICULTIES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          <span className="text-xs font-bold text-[#687B78] uppercase mr-1">Category:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#164A4A] text-white'
                  : 'bg-[#F2EFE8] text-[#455250] hover:bg-[#E8E5DA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#687B78]">
          <div className="w-10 h-10 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-semibold text-sm">Loading exercises from library...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-12 text-center">
          <Dumbbell size={48} className="mx-auto text-[#A8ADA9] mb-3" />
          <h3 className="text-base font-bold text-[#202828]">No exercises match your filters</h3>
          <p className="text-xs text-[#687B78] mt-1">Try clearing search terms or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(ex => {
            const isSelected = selectedExerciseIds.includes(ex._id);
            return (
              <div
                key={ex._id}
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                  isSelected ? 'border-[#164A4A] ring-2 ring-[#164A4A]/20' : 'border-[#D3DFDA]'
                }`}
              >
                {/* Media Preview Player banner */}
                <div
                  className="relative h-44 bg-[#090D16] cursor-pointer group flex items-center justify-center overflow-hidden"
                  onClick={() => setPreviewExercise(ex)}
                  title="Click to view full exercise animation and details"
                >
                  <ExerciseVideoPlayer
                    videoUrl={ex.videoUrl}
                    thumbnailUrl={ex.thumbnailUrl}
                    exerciseName={ex.name}
                    category={ex.category}
                    targetMuscle={ex.targetMuscle}
                    animationType={ex.animationType}
                    duration={ex.defaultDuration || 60}
                    compact={true}
                    autoPlay={true}
                    className="w-full h-full rounded-none pointer-events-none"
                  />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm border border-white/10">
                      {ex.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm border ${
                      ex.difficulty === 'Beginner' ? 'bg-emerald-600/90 text-white border-emerald-500' :
                      ex.difficulty === 'Intermediate' ? 'bg-amber-600/90 text-white border-amber-500' :
                      'bg-rose-600/90 text-white border-rose-500'
                    }`}>
                      {ex.difficulty}
                    </span>
                  </div>

                  {ex.videoUrl && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#164A4A]/90 text-white flex items-center gap-1 backdrop-blur-sm">
                      <Video size={11} /> Video Demonstration
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base line-clamp-1 drop-shadow-sm">{ex.name}</h3>
                    <p className="text-xs text-white/80 line-clamp-1">{ex.targetMuscle} • {ex.equipment}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#455250] line-clamp-2 mb-3">
                      {ex.description || ex.instructions}
                    </p>

                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-[#F9F8F6] rounded-xl border border-[#D3DFDA] text-center mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#687B78] block">Sets</span>
                        <span className="text-xs font-extrabold text-[#202828]">{ex.defaultSets} sets</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#687B78] block">Reps</span>
                        <span className="text-xs font-extrabold text-[#202828]">{ex.defaultRepetitions} reps</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#687B78] block">Rest</span>
                        <span className="text-xs font-extrabold text-[#202828]">{ex.defaultRest}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#D3DFDA]/60">
                    <button
                      onClick={() => setPreviewExercise(ex)}
                      className="flex-1 py-2 px-3 bg-[#F2EFE8] hover:bg-[#E8E5DA] text-[#202828] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye size={13} /> View Form & Video
                    </button>
                    <button
                      onClick={() => toggleSelect(ex._id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#164A4A] text-white hover:bg-[#0f3434]'
                          : 'border border-[#164A4A] text-[#164A4A] hover:bg-[#164A4A]/10'
                      }`}
                    >
                      {isSelected ? <Check size={14} /> : <Plus size={14} />}
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Exercise Preview Modal */}
      {previewExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D3DFDA] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#D3DFDA] flex justify-between items-start sticky top-0 bg-white/95 backdrop-blur z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#164A4A]/10 text-[#164A4A]">
                    {previewExercise.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700">
                    {previewExercise.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#202828]">{previewExercise.name}</h2>
              </div>
              <button
                onClick={() => setPreviewExercise(null)}
                className="p-2 text-[#687B78] hover:text-[#202828] hover:bg-[#F2EFE8] rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Animated / Video Demonstration */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#687B78] uppercase tracking-wider flex items-center gap-1.5">
                  <Video size={14} className="text-[#164A4A]" /> Animated Workout Video Demonstration
                </h4>
                <ExerciseVideoPlayer
                  videoUrl={previewExercise.videoUrl}
                  thumbnailUrl={previewExercise.thumbnailUrl}
                  exerciseName={previewExercise.name}
                  category={previewExercise.category}
                  targetMuscle={previewExercise.targetMuscle}
                  animationType={previewExercise.animationType}
                  duration={previewExercise.defaultDuration || 60}
                  autoPlay={true}
                  compact={false}
                />
              </div>

              {/* Default Parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D3DFDA]">
                  <span className="text-[10px] font-bold text-[#687B78] uppercase block">Target Muscle</span>
                  <span className="text-xs font-bold text-[#202828]">{previewExercise.targetMuscle}</span>
                </div>
                <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D3DFDA]">
                  <span className="text-[10px] font-bold text-[#687B78] uppercase block">Equipment</span>
                  <span className="text-xs font-bold text-[#202828]">{previewExercise.equipment}</span>
                </div>
                <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D3DFDA]">
                  <span className="text-[10px] font-bold text-[#687B78] uppercase block">Default Sets & Reps</span>
                  <span className="text-xs font-bold text-[#202828]">
                    {previewExercise.defaultSets} sets × {previewExercise.defaultRepetitions} reps
                  </span>
                </div>
                <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D3DFDA]">
                  <span className="text-[10px] font-bold text-[#687B78] uppercase block">Rest Period</span>
                  <span className="text-xs font-bold text-[#202828]">{previewExercise.defaultRest} Seconds</span>
                </div>
              </div>

              {/* Description */}
              {previewExercise.description && (
                <div>
                  <h4 className="text-xs font-bold text-[#687B78] uppercase tracking-wider mb-1">Overview</h4>
                  <p className="text-sm text-[#455250] leading-relaxed">{previewExercise.description}</p>
                </div>
              )}

              {/* Step-by-Step Instructions */}
              <div>
                <h4 className="text-xs font-bold text-[#687B78] uppercase tracking-wider mb-2">
                  Proper Form & Execution
                </h4>
                <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D3DFDA] text-sm text-[#202828] whitespace-pre-line leading-relaxed">
                  {previewExercise.instructions}
                </div>
              </div>

              {/* Safety Instructions */}
              {previewExercise.safetyInstructions && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Safety Instructions & Common Mistakes
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-line">
                    {previewExercise.safetyInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[#D3DFDA] bg-[#F9F8F6] flex justify-between items-center">
              <span className="text-xs text-[#687B78]">
                Gym Owner Exercise • Reusable across client plans
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewExercise(null)}
                  className="px-4 py-2 border border-[#D3DFDA] text-xs font-bold text-[#455250] rounded-xl hover:bg-[#E8E5DA]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (!selectedExerciseIds.includes(previewExercise._id)) {
                      setSelectedExerciseIds([...selectedExerciseIds, previewExercise._id]);
                    }
                    setPreviewExercise(null);
                  }}
                  className="px-4 py-2 bg-[#164A4A] text-white text-xs font-bold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add to Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerExerciseLibrary;
