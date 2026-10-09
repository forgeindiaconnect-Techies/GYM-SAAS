import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Dumbbell, Filter, Video, Edit2, Trash2, CheckCircle2,
  XCircle, Eye, Upload, RefreshCw, Sparkles, X, ShieldAlert
} from 'lucide-react';
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
  animationType: 'video' | 'animation' | 'gif';
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const CATEGORIES = ['All', 'Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body', 'Flexibility'];
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const GymAdminExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<ExerciseItem | null>(null);
  const [previewExercise, setPreviewExercise] = useState<ExerciseItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialForm = {
    name: '',
    category: 'Chest',
    targetMuscle: '',
    secondaryMuscle: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    equipment: 'No Equipment',
    description: '',
    instructions: '',
    safetyInstructions: '',
    defaultDuration: 60,
    defaultSets: 3,
    defaultRepetitions: 12,
    defaultRest: 30,
    videoUrl: '',
    thumbnailUrl: '',
    animationType: 'video' as 'video' | 'animation' | 'gif',
    status: 'Active' as 'Active' | 'Inactive'
  };

  const [form, setForm] = useState(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exercises');
      if (res.data.success) {
        setExercises(res.data.exercises || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch exercises:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleOpenAdd = () => {
    setEditingExercise(null);
    setForm(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (ex: ExerciseItem) => {
    setEditingExercise(ex);
    setForm({
      name: ex.name,
      category: ex.category,
      targetMuscle: ex.targetMuscle,
      secondaryMuscle: ex.secondaryMuscle || '',
      difficulty: ex.difficulty,
      equipment: ex.equipment || 'No Equipment',
      description: ex.description || '',
      instructions: ex.instructions || '',
      safetyInstructions: ex.safetyInstructions || '',
      defaultDuration: ex.defaultDuration || 60,
      defaultSets: ex.defaultSets || 3,
      defaultRepetitions: ex.defaultRepetitions || 12,
      defaultRest: ex.defaultRest || 30,
      videoUrl: ex.videoUrl || '',
      thumbnailUrl: ex.thumbnailUrl || '',
      animationType: ex.animationType || 'video',
      status: ex.status || 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingMedia(true);
    try {
      const res = await api.post('/exercises/upload-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        if (res.data.isVideo) {
          setForm(prev => ({ ...prev, videoUrl: res.data.fileUrl }));
        } else {
          setForm(prev => ({ ...prev, thumbnailUrl: res.data.fileUrl }));
        }
        showToast('Media uploaded successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload media file');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category || !form.targetMuscle.trim()) {
      alert('Please fill in Exercise Name, Category, and Target Muscle.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingExercise) {
        await api.put(`/exercises/${editingExercise._id}`, form);
        showToast('Exercise updated successfully!');
      } else {
        await api.post('/exercises', form);
        showToast('Exercise created and added to library!');
      }
      setIsAddModalOpen(false);
      fetchExercises();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save exercise');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (ex: ExerciseItem) => {
    try {
      const res = await api.patch(`/exercises/${ex._id}/status`);
      if (res.data.success) {
        setExercises(prev => prev.map(item => item._id === ex._id ? res.data.exercise : item));
        showToast(`Status updated to ${res.data.exercise.status}`);
      }
    } catch (err: any) {
      alert('Failed to update exercise status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(`/exercises/${id}`);
      if (res.data.success) {
        setExercises(prev => prev.filter(item => item._id !== id));
        setDeleteConfirmId(null);
        showToast('Exercise removed from library');
      }
    } catch (err: any) {
      alert('Failed to delete exercise');
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Do you want to load standard exercises (Squats, Bench Press, Pull-ups, Lunges, Plank, etc.) into your library?')) {
      return;
    }
    setSeedingLoading(true);
    try {
      const res = await api.post('/exercises/seed-defaults');
      if (res.data.success) {
        showToast(res.data.message);
        fetchExercises();
      }
    } catch (err: any) {
      alert('Failed to load standard exercises');
    } finally {
      setSeedingLoading(false);
    }
  };

  // Filter exercises
  const filtered = exercises.filter(ex => {
    const matchesSearch = !search ||
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.category.toLowerCase().includes(search.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(search.toLowerCase()) ||
      (ex.equipment && ex.equipment.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || ex.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesDifficulty = difficultyFilter === 'All' || ex.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'All' || ex.status === statusFilter;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  });

  const activeCount = exercises.filter(e => e.status === 'Active').length;
  const videoCount = exercises.filter(e => Boolean(e.videoUrl)).length;
  const categoriesCount = new Set(exercises.map(e => e.category)).size;

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#F97316] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight flex items-center gap-3">
            <Dumbbell className="text-[#F97316]" size={32} />
            Exercise Library
          </h1>
          <p className="text-[#78716C] mt-1">
            Manage your master workout exercises and upload demonstration videos/animations for trainers and members.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSeedDefaults}
            disabled={seedingLoading}
            className="px-4 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold rounded-xl transition-colors flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={16} className={seedingLoading ? 'animate-spin' : ''} />
            {seedingLoading ? 'Loading Standard Exercises...' : 'Load Standard Exercises'}
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors flex items-center gap-2 shadow-lg shadow-[#F97316]/20 text-sm cursor-pointer"
          >
            <Plus size={18} />
            Add Exercise
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-sm">
          <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Total Exercises</p>
          <p className="text-2xl font-black text-[#292524] mt-1">{exercises.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-sm">
          <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Active in Gym</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-sm">
          <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Videos & Animations</p>
          <p className="text-2xl font-black text-[#F97316] mt-1">{videoCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-sm">
          <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Muscle Categories</p>
          <p className="text-2xl font-black text-[#78716C] mt-1">{categoriesCount}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E5E4] shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search exercises by name, category, muscle, equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#78716C] font-bold">
            <Filter size={14} /> Filter:
          </div>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#292524] outline-none cursor-pointer"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#292524] outline-none cursor-pointer"
          >
            {DIFFICULTIES.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Difficulties' : d}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs font-semibold text-[#292524] outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          {(search || categoryFilter !== 'All' || difficultyFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('All');
                setDifficultyFilter('All');
                setStatusFilter('All');
              }}
              className="text-xs text-red-600 hover:underline font-semibold ml-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#78716C]">
          <RefreshCw size={32} className="animate-spin mx-auto text-[#F97316] mb-3" />
          <p className="font-semibold">Loading exercise library...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-3xl p-12 text-center shadow-sm">
          <Dumbbell size={52} className="mx-auto text-[#E7E5E4] mb-4" />
          <h3 className="text-xl font-bold text-[#292524]">No exercises found</h3>
          <p className="text-sm text-[#78716C] mt-1 max-w-md mx-auto">
            {search || categoryFilter !== 'All'
              ? 'Try adjusting your search criteria or filters.'
              : 'Your library is empty. Click "Add Exercise" to create your own.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors text-sm"
            >
              Add New Exercise
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(ex => {
            const isInactive = ex.status === 'Inactive';
            return (
              <div
                key={ex._id}
                className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md flex flex-col overflow-hidden ${
                  isInactive ? 'opacity-75 border-gray-300' : 'border-[#E7E5E4] hover:border-[#F97316]/50'
                }`}
              >
                {/* Video / Animated Preview Player Area */}
                <div
                  className="relative h-48 bg-slate-900 overflow-hidden cursor-pointer group/cardvid"
                  onClick={() => setPreviewExercise(ex)}
                  title="Click to view details and form animation"
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
                    className="w-full h-full rounded-none pointer-events-none"
                    autoPlay={true}
                  />

                  {/* Status Tag */}
                  <div className="absolute top-3 left-3 z-20">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${
                        ex.status === 'Active'
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-gray-700 text-gray-200 border-gray-600'
                      }`}
                    >
                      {ex.status}
                    </span>
                  </div>

                  {/* Difficulty Tag */}
                  <div className="absolute top-3 right-3 z-20">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${
                        ex.difficulty === 'Beginner'
                          ? 'bg-blue-600/90 text-white border-blue-500'
                          : ex.difficulty === 'Intermediate'
                          ? 'bg-amber-600/90 text-white border-amber-500'
                          : 'bg-rose-600/90 text-white border-rose-500'
                      }`}
                    >
                      {ex.difficulty}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg text-[#292524] tracking-tight">{ex.name}</h3>
                      <span className="text-xs font-semibold text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded shrink-0">
                        {ex.category}
                      </span>
                    </div>

                    <div className="mt-2 text-xs space-y-1 text-[#78716C]">
                      <p>
                        <span className="font-semibold text-[#292524]">Target:</span> {ex.targetMuscle}
                      </p>
                      {ex.secondaryMuscle && (
                        <p>
                          <span className="font-semibold text-[#292524]">Secondary:</span> {ex.secondaryMuscle}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold text-[#292524]">Equipment:</span> {ex.equipment || 'No Equipment'}
                      </p>
                    </div>

                    {ex.description && (
                      <p className="mt-2 text-xs text-[#78716C] line-clamp-2 leading-relaxed">
                        {ex.description}
                      </p>
                    )}
                  </div>

                  {/* Default Configuration Chips */}
                  <div className="pt-3 border-t border-[#FED7AA] flex items-center justify-between text-[11px] text-[#78716C] bg-[#FFFDF8]/50 p-2.5 rounded-xl">
                    <span>
                      <strong className="text-[#292524]">{ex.defaultSets}</strong> Sets
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-[#292524]">{ex.defaultRepetitions}</strong> Reps
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-[#292524]">{ex.defaultDuration}s</strong> Work
                    </span>
                    <span>•</span>
                    <span>
                      <strong className="text-[#292524]">{ex.defaultRest}s</strong> Rest
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewExercise(ex)}
                      className="px-3 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                      title="Preview animated video demonstration and instructions"
                    >
                      <Eye size={14} /> View Details
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(ex)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          ex.status === 'Active'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                            : 'text-gray-600 bg-gray-100 border-gray-300 hover:bg-gray-200'
                        }`}
                        title={ex.status === 'Active' ? 'Deactivate Exercise' : 'Activate Exercise'}
                      >
                        {ex.status === 'Active' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(ex)}
                        className="p-1.5 text-[#F97316] bg-[#F97316]/10 hover:bg-[#F97316]/20 rounded-lg transition-colors"
                        title="Edit Exercise"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(ex._id)}
                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Exercise"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exercise Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl border border-[#E7E5E4] animate-in fade-in zoom-in-95 duration-150 flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E7E5E4] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F97316]/10 text-[#F97316] rounded-xl flex items-center justify-center">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#292524]">
                    {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
                  </h2>
                  <p className="text-xs text-[#78716C]">
                    {editingExercise ? 'Update form, instructions, or demo video' : 'Add an exercise to your gym library for trainers and members'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#78716C] hover:text-[#292524] p-2 hover:bg-[#FFFDF8] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 md:p-8 space-y-6">
              {/* Row 1: Name & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider mb-1.5">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Barbell Squats, Push-ups"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none bg-white cursor-pointer"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Target Muscle & Secondary Muscle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider mb-1.5">
                    Target Muscle *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quadriceps, Glutes, Pectorals"
                    value={form.targetMuscle}
                    onChange={e => setForm({ ...form, targetMuscle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider mb-1.5">
                    Secondary Muscle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hamstrings, Core, Triceps"
                    value={form.secondaryMuscle}
                    onChange={e => setForm({ ...form, secondaryMuscle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Difficulty, Equipment & Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={e => setForm({ ...form, difficulty: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none bg-white cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider mb-1.5">
                    Equipment Required
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Barbell, Dumbbells, Bodyweight"
                    value={form.equipment}
                    onChange={e => setForm({ ...form, equipment: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none bg-white cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Default Sets, Reps, Duration, Rest Time */}
              <div className="bg-[#FFFDF8]/70 p-4 rounded-2xl border border-[#E7E5E4] space-y-3">
                <p className="text-xs font-bold text-[#F97316] uppercase tracking-wider">
                  Default Workout Metrics
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1">Sets</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={form.defaultSets}
                      onChange={e => setForm({ ...form, defaultSets: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E7E5E4] text-sm bg-white text-[#292524]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1">Reps</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.defaultRepetitions}
                      onChange={e => setForm({ ...form, defaultRepetitions: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E7E5E4] text-sm bg-white text-[#292524]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1">Duration (sec)</label>
                    <input
                      type="number"
                      min={5}
                      max={600}
                      value={form.defaultDuration}
                      onChange={e => setForm({ ...form, defaultDuration: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E7E5E4] text-sm bg-white text-[#292524]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#78716C] mb-1">Rest Time (sec)</label>
                    <input
                      type="number"
                      min={0}
                      max={300}
                      value={form.defaultRest}
                      onChange={e => setForm({ ...form, defaultRest: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E7E5E4] text-sm bg-white text-[#292524]"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions & Description */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider mb-1.5">
                    Exercise Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the exercise and primary benefits..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider mb-1.5">
                    Proper Form Instructions (Step-by-Step)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="1. Starting position...&#10;2. Knee and foot alignment...&#10;3. Lowering and breathing...&#10;4. Return to start..."
                    value={form.instructions}
                    onChange={e => setForm({ ...form, instructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase tracking-wider mb-1.5">
                    Safety Instructions & Common Mistakes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Do not round lower back; avoid letting knees cave inwards; keep core tight..."
                    value={form.safetyInstructions}
                    onChange={e => setForm({ ...form, safetyInstructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] text-sm text-[#292524] focus:border-[#F97316] outline-none resize-none"
                  />
                </div>
              </div>

              {/* Video / Animation Upload Section */}
              <div className="bg-[#FFFDF8] p-5 rounded-2xl border border-[#E7E5E4] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#292524] flex items-center gap-2">
                      <Video size={18} className="text-[#F97316]" />
                      Exercise Animation / Video Demonstration
                    </h4>
                    <p className="text-xs text-[#78716C]">
                      Upload once. Reusable by trainers and customers in workout plans. Supports MP4, WebM, GIF.
                    </p>
                  </div>
                  {form.videoUrl && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Video Attached
                    </span>
                  )}
                </div>

                {/* Upload or URL options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Button */}
                  <div className="border-2 border-dashed border-[#E7E5E4] rounded-xl p-4 text-center hover:border-[#F97316] transition-colors bg-white">
                    <input
                      type="file"
                      id="videoUpload"
                      accept="video/*,image/gif"
                      onChange={handleMediaUpload}
                      disabled={uploadingMedia}
                      className="hidden"
                    />
                    <label htmlFor="videoUpload" className="cursor-pointer block">
                      <Upload size={24} className="mx-auto text-[#F97316] mb-1.5" />
                      <span className="text-xs font-bold text-[#F97316] block">
                        {uploadingMedia ? 'Uploading video...' : 'Upload Video / Animation File'}
                      </span>
                      <span className="text-[10px] text-[#78716C]">MP4, WebM, or GIF (max 100MB)</span>
                    </label>
                  </div>

                  {/* Direct Video URL input */}
                  <div className="flex flex-col justify-center">
                    <label className="text-xs font-semibold text-[#78716C] mb-1">
                      Or Paste Video / Animation URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/squat-animation.mp4"
                      value={form.videoUrl}
                      onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                      className="px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs bg-white text-[#292524] outline-none"
                    />
                  </div>
                </div>

                {/* Live Preview in Modal */}
                {form.videoUrl && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-[#292524] mb-1">Player Preview:</p>
                    <div className="max-w-md mx-auto">
                      <ExerciseVideoPlayer
                        videoUrl={form.videoUrl}
                        thumbnailUrl={form.thumbnailUrl}
                        exerciseName={form.name || 'Preview'}
                        category={form.category}
                        targetMuscle={form.targetMuscle}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E7E5E4] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl border border-[#E7E5E4] text-sm font-bold text-[#78716C] hover:bg-[#FFFDF8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || uploadingMedia}
                  className="px-8 py-2.5 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors shadow-lg shadow-[#F97316]/20 text-sm disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingExercise ? 'Update Exercise' : 'Save Exercise'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Video & Details Preview Modal */}
      {previewExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-[#E7E5E4] animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E7E5E4] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-20">
              <div>
                <h3 className="font-bold text-lg text-[#292524]">{previewExercise.name}</h3>
                <span className="text-xs text-[#F97316] font-semibold">
                  {previewExercise.category} • {previewExercise.difficulty}
                </span>
              </div>
              <button
                onClick={() => setPreviewExercise(null)}
                className="text-[#78716C] hover:text-[#292524] p-2 hover:bg-[#FFFDF8] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Video Player */}
              <ExerciseVideoPlayer
                videoUrl={previewExercise.videoUrl}
                thumbnailUrl={previewExercise.thumbnailUrl}
                exerciseName={previewExercise.name}
                category={previewExercise.category}
                targetMuscle={previewExercise.targetMuscle}
                animationType={previewExercise.animationType}
                duration={previewExercise.defaultDuration || 60}
                compact={false}
                autoPlay={true}
              />

              {/* Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#FFFDF8] p-4 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[#78716C] block">Default Sets</span>
                  <strong className="text-sm text-[#292524]">{previewExercise.defaultSets}</strong>
                </div>
                <div>
                  <span className="text-[#78716C] block">Default Reps</span>
                  <strong className="text-sm text-[#292524]">{previewExercise.defaultRepetitions}</strong>
                </div>
                <div>
                  <span className="text-[#78716C] block">Duration</span>
                  <strong className="text-sm text-[#292524]">{previewExercise.defaultDuration}s</strong>
                </div>
                <div>
                  <span className="text-[#78716C] block">Rest Time</span>
                  <strong className="text-sm text-[#292524]">{previewExercise.defaultRest}s</strong>
                </div>
              </div>

              {previewExercise.description && (
                <div>
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-[#292524] leading-relaxed">{previewExercise.description}</p>
                </div>
              )}

              {previewExercise.instructions && (
                <div>
                  <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                    Proper Form Instructions
                  </h4>
                  <div className="text-sm text-[#292524] whitespace-pre-line bg-[#FFFDF8] p-4 rounded-xl border border-[#E7E5E4] leading-relaxed">
                    {previewExercise.instructions}
                  </div>
                </div>
              )}

              {previewExercise.safetyInstructions && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldAlert size={14} /> Safety Tips & Form Cautions
                  </h4>
                  <p className="text-xs text-amber-900">{previewExercise.safetyInstructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E7E5E4] text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#292524]">Delete this Exercise?</h3>
            <p className="text-xs text-[#78716C]">
              Are you sure you want to remove this exercise from your gym library? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 rounded-xl border border-[#E7E5E4] text-xs font-bold text-[#78716C] hover:bg-[#FFFDF8]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminExerciseLibrary;
