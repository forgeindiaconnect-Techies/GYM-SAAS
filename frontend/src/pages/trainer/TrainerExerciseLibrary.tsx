import React, { useState, useEffect } from 'react';
import {
  Search, Dumbbell, Video, Eye,
  Check, Plus, Info, ShieldAlert,
  CheckCircle2, X, Loader2
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

  // Approval to Customer Dashboard states
  const [clients, setClients] = useState<any[]>([]);
  const [pendingLibraryRequests, setPendingLibraryRequests] = useState<any[]>([]);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null);

  const [approveModalExercise, setApproveModalExercise] = useState<ExerciseItem | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [customSets, setCustomSets] = useState(3);
  const [customReps, setCustomReps] = useState(12);
  const [coachNotes, setCoachNotes] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState('');

  useEffect(() => {
    fetchExercises();
    fetchClients();
    fetchPendingRequests();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/trainer-plans/clients');
      if (res.data?.success && res.data.clients) {
        setClients(res.data.clients);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await api.get('/trainer-plans/trainer-requests');
      if (res.data?.success && res.data.requests) {
        const libReqs = res.data.requests.filter(
          (r: any) => r.planType === 'Exercise Library' && r.status === 'Pending'
        );
        setPendingLibraryRequests(libReqs);
      }
    } catch (err) {
      console.error('Failed to load pending library requests:', err);
    }
  };

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

  // Quick Approval of Pending Customer Request
  const handleQuickApproveRequest = async (reqId: string) => {
    try {
      setApprovingRequestId(reqId);
      const res = await api.patch(`/trainer-plans/requests/${reqId}/approve`, {
        trainerFeedback: 'Approved by your trainer! This exercise has been added to your training program.'
      });
      if (res.data?.success) {
        alert('Exercise plan approved! It is now directly visible on the customer dashboard.');
        fetchPendingRequests();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve exercise request');
    } finally {
      setApprovingRequestId(null);
    }
  };

  const openApprovalModal = (ex: ExerciseItem) => {
    setApproveModalExercise(ex);
    setCustomSets(ex.defaultSets || 3);
    setCustomReps(ex.defaultRepetitions || 12);
    setCoachNotes(ex.instructions || 'Perform with controlled form and full range of motion.');
    setApprovalSuccess('');
  };

  const handleApproveExerciseToClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !approveModalExercise) return;

    try {
      setIsSubmittingApproval(true);
      const res = await api.post('/trainer-plans/trainer/approve-and-assign', {
        customerId: selectedClientId,
        planType: 'Exercise Library',
        title: approveModalExercise.name,
        goal: `Mastery of ${approveModalExercise.targetMuscle} (${approveModalExercise.category})`,
        trainerFeedback: coachNotes || 'Approved by your trainer! Practice this exercise for optimal strength.',
        workoutDetails: {
          days: [
            {
              dayName: `${approveModalExercise.category} Focus`,
              focus: approveModalExercise.targetMuscle,
              exercises: [
                {
                  name: approveModalExercise.name,
                  sets: Number(customSets) || 3,
                  reps: String(customReps || 12),
                  duration: approveModalExercise.defaultDuration || 60,
                  notes: coachNotes
                }
              ]
            }
          ]
        }
      });

      if (res.data?.success) {
        const client = clients.find(c => c._id === selectedClientId);
        const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client';
        setApprovalSuccess(`Exercise "${approveModalExercise.name}" has been Approved and is now LIVE on ${clientName}'s customer dashboard!`);
        setTimeout(() => {
          setApprovalSuccess('');
          setApproveModalExercise(null);
          setCoachNotes('');
        }, 2500);
      }
    } catch (err: any) {
      console.error('Error approving exercise:', err);
      alert(err.response?.data?.message || 'Failed to approve exercise to customer');
    } finally {
      setIsSubmittingApproval(false);
    }
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#EA580C] flex items-center gap-1">
              <Dumbbell size={13} /> Master Exercise Library
            </span>
            <span className="text-xs text-[#64748B]">• Gym Owner Managed</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
            Exercise & Animation Library
          </h1>
          <p className="text-sm text-[#64748B] mt-1 max-w-2xl">
            Browse verified gym exercises, approve exercises for client dashboards, or select exercises to build custom routines.
          </p>
        </div>

        {selectedExerciseIds.length > 0 && (
          <div className="flex items-center gap-3 bg-[#FFF7ED] p-2 rounded-xl border border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#EA580C] pl-2">
              {selectedExerciseIds.length} {selectedExerciseIds.length === 1 ? 'Exercise' : 'Exercises'} Selected
            </span>
            <button
              onClick={handleCreatePlanWithSelected}
              className="px-4 py-2 bg-[#C2410C] text-white font-bold rounded-lg text-xs font-bold hover:bg-[#9A3412] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> Create Workout Plan
            </button>
            <button
              onClick={() => setSelectedExerciseIds([])}
              className="text-xs text-[#64748B] hover:text-[#C2410C] px-2 font-medium"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Pending Customer Exercise Requests Banner */}
      {pendingLibraryRequests.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-[#E2E8F0] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#C2410C] text-white font-bold flex items-center justify-center font-bold text-xs">
                {pendingLibraryRequests.length}
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Pending Customer Exercise Requests</h3>
                <p className="text-xs text-[#64748B]">Members requested approval for custom exercises. Click Approve to publish directly to their dashboard.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
              Needs Approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {pendingLibraryRequests.map((req) => (
              <div key={req._id} className="bg-[#FFFFFF] rounded-xl p-4 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#111827]">
                      {req.customerId?.firstName} {req.customerId?.lastName}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#EA580C] mt-0.5">{req.title}</p>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2 italic">&ldquo;{req.customerMessage}&rdquo;</p>
                </div>

                <button
                  onClick={() => handleQuickApproveRequest(req._id)}
                  disabled={approvingRequestId === req._id}
                  className="w-full py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {approvingRequestId === req._id ? (
                    <>
                      <Loader2 size={13} className="animate-spin" /> Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> Approve & Publish to Customer Dashboard
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 flex items-start gap-3 text-xs text-[#64748B]">
        <Info size={18} className="text-[#EA580C] shrink-0 mt-0.5" />
        <p>
          <strong className="text-[#111827]">Trainer Note:</strong> Exercises in this library are curated by the gym owner with pre-loaded videos and safety guidelines. When adding an exercise to a client&apos;s workout plan, you can customize sets, reps, rest time, duration, and personal notes without altering the master library.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search exercise by name, muscle, equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#FDBA74] text-[#111827]"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#64748B] uppercase">Difficulty:</span>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#111827] outline-none shadow-xs"
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
          <span className="text-xs font-bold text-[#64748B] uppercase mr-1">Category:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-[#C2410C] text-white'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#FFF7ED]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#64748B]">
          <div className="w-10 h-10 border-4 border-[#FDBA74] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-semibold text-sm">Loading exercises from library...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-12 text-center">
          <Dumbbell size={48} className="mx-auto text-[#64748B] mb-3" />
          <h3 className="text-base font-bold text-[#111827]">No exercises match your filters</h3>
          <p className="text-xs text-[#64748B] mt-1">Try clearing search terms or selecting another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(ex => {
            const isSelected = selectedExerciseIds.includes(ex._id);
            return (
              <div
                key={ex._id}
                className={`bg-[#FFFFFF] border rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                  isSelected ? 'border-[#FDBA74] ring-2 ring-[#F97316]/20' : 'border-[#E2E8F0]'
                }`}
              >
                {/* Media Preview Player banner */}
                <div
                  className="relative h-44 bg-[#FFFFFF] cursor-pointer group flex items-center justify-center overflow-hidden"
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
                      ex.difficulty === 'Beginner' ? 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]' :
                      ex.difficulty === 'Intermediate' ? 'bg-amber-600/90 text-white border-amber-500' :
                      'bg-rose-600/90 text-white border-rose-500'
                    }`}>
                      {ex.difficulty}
                    </span>
                  </div>

                  {ex.videoUrl && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF7ED] text-[#111827] flex items-center gap-1 backdrop-blur-sm">
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
                    <p className="text-xs text-[#64748B] line-clamp-2 mb-3">
                      {ex.description || ex.instructions}
                    </p>

                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-center mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">Sets</span>
                        <span className="text-xs font-extrabold text-[#111827]">{ex.defaultSets} sets</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">Reps</span>
                        <span className="text-xs font-extrabold text-[#111827]">{ex.defaultRepetitions} reps</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#64748B] block">Rest</span>
                        <span className="text-xs font-extrabold text-[#111827]">{ex.defaultRest}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]/60">
                    <button
                      onClick={() => setPreviewExercise(ex)}
                      className="flex-1 py-2 px-2.5 bg-[#F8FAFC] hover:bg-[#FFF7ED] text-[#111827] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 border border-[#E2E8F0]"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => openApprovalModal(ex)}
                      className="flex-1 py-2 px-2.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:from-emerald-700 hover:to-[#C2410C] text-[#FFFFFF] font-bold text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95 shadow-emerald-600/20"
                      title="Approve and publish this exercise to customer dashboard"
                    >
                      <CheckCircle2 size={13} /> Approval
                    </button>
                    <button
                      onClick={() => toggleSelect(ex._id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#C2410C] text-white hover:bg-[#9A3412]'
                          : 'border border-[#FDBA74] text-[#EA580C] hover:bg-[#FFF7ED]'
                      }`}
                    >
                      {isSelected ? <Check size={13} /> : <Plus size={13} />}
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
          <div className="bg-[#FFFFFF] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-start sticky top-0 bg-[#FFFFFF]/95 backdrop-blur z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#EA580C]">
                    {previewExercise.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700">
                    {previewExercise.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#111827]">{previewExercise.name}</h2>
              </div>
              <button
                onClick={() => setPreviewExercise(null)}
                className="p-2 text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Animated / Video Demonstration */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                  <Video size={14} className="text-[#EA580C]" /> Animated Workout Video Demonstration
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
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Target Muscle</span>
                  <span className="text-xs font-bold text-[#111827]">{previewExercise.targetMuscle}</span>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Equipment</span>
                  <span className="text-xs font-bold text-[#111827]">{previewExercise.equipment}</span>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Default Sets & Reps</span>
                  <span className="text-xs font-bold text-[#111827]">
                    {previewExercise.defaultSets} sets × {previewExercise.defaultRepetitions} reps
                  </span>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase block">Rest Period</span>
                  <span className="text-xs font-bold text-[#111827]">{previewExercise.defaultRest} Seconds</span>
                </div>
              </div>

              {/* Description */}
              {previewExercise.description && (
                <div>
                  <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Overview</h4>
                  <p className="text-sm text-[#64748B] leading-relaxed">{previewExercise.description}</p>
                </div>
              )}

              {/* Step-by-Step Instructions */}
              <div>
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Proper Form & Execution
                </h4>
                <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] text-sm text-[#111827] whitespace-pre-line leading-relaxed">
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
            <div className="p-6 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center">
              <span className="text-xs text-[#64748B]">
                Gym Owner Exercise • Reusable across client plans
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewExercise(null)}
                  className="px-4 py-2 border border-[#E2E8F0] text-xs font-bold text-[#64748B] rounded-xl hover:bg-[#FFF7ED]"
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
                  className="px-4 py-2 bg-[#C2410C] text-white font-bold text-xs font-bold rounded-xl hover:bg-[#9A3412] transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add to Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== APPROVE EXERCISE FOR CLIENT MODAL ===================== */}
      {approveModalExercise && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[#EA580C]" />
                <h3 className="font-bold text-[#111827] text-base">Approve & Send Exercise</h3>
              </div>
              <button 
                onClick={() => setApproveModalExercise(null)}
                className="p-1.5 text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApproveExerciseToClient} className="p-5 space-y-4">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#EA580C]">
                Approving <strong>{approveModalExercise.name}</strong> ({approveModalExercise.category} • {approveModalExercise.targetMuscle}) to customer dashboard.
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Select Customer / Gym Member *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] outline-none focus:border-[#FDBA74]"
                  required
                >
                  <option value="" className="bg-[#FFFFFF] text-[#64748B]">-- Choose a customer --</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id} className="bg-[#FFFFFF] text-[#111827]">
                      {client.firstName} {client.lastName} ({client.email}) {client.fitnessGoal ? `• Goal: ${client.fitnessGoal}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Target Sets</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={customSets}
                    onChange={(e) => setCustomSets(Number(e.target.value))}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827] outline-none focus:border-[#FDBA74]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1">Target Reps</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={customReps}
                    onChange={(e) => setCustomReps(Number(e.target.value))}
                    className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#111827] outline-none focus:border-[#FDBA74]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                  Coach Guidance & Instructions
                </label>
                <textarea
                  rows={3}
                  value={coachNotes}
                  onChange={(e) => setCoachNotes(e.target.value)}
                  placeholder="e.g. Keep spine neutral, squeeze core at peak, avoid momentum..."
                  className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#111827] placeholder:text-[#64748B] outline-none focus:border-[#FDBA74] resize-none"
                />
              </div>

              {approvalSuccess && (
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[#EA580C] rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} /> {approvalSuccess}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setApproveModalExercise(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#FFF7ED]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedClientId || isSubmittingApproval}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C2410C] text-white font-bold hover:bg-[#9A3412] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shadow-emerald-600/20"
                >
                  {isSubmittingApproval ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={15} /> Approve & Send to Customer Dashboard
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerExerciseLibrary;
