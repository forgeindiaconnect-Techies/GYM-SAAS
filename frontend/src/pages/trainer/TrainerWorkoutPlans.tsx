import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Dumbbell, X, Edit, Trash2,
  Calendar, ArrowUp, ArrowDown, Send, Save,
  Play, Video, FileText
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import ExerciseVideoPlayer from '../../components/workout/ExerciseVideoPlayer';

interface ExerciseDetail {
  _id: string;
  name: string;
  category: string;
  targetMuscle: string;
  difficulty: string;
  defaultSets: number;
  defaultRepetitions: number;
  defaultRest: number;
  defaultDuration: number;
  videoUrl?: string;
  instructions?: string;
}

interface PlanExerciseItem {
  exerciseId: ExerciseDetail | string;
  order: number;
  sets: number;
  repetitions: string;
  duration?: number;
  restTime: number;
  trainerNotes?: string;
}

interface WorkoutDay {
  dayName: string;
  exercises: PlanExerciseItem[];
}

interface WorkoutPlanItem {
  _id: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
    fitnessGoal?: string;
  };
  trainerId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  planName: string;
  description?: string;
  workoutDays: WorkoutDay[];
  status: 'Draft' | 'Published';
  createdAt: string;
  updatedAt: string;
}

const TrainerWorkoutPlans: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState<WorkoutPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Published'>('All');

  // Clients & Exercise library for the builder
  const [clients, setClients] = useState<any[]>([]);
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseDetail[]>([]);

  // Builder Modal State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([
    { dayName: 'Day 1 – Full Body', exercises: [] }
  ]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Exercise Picker Modal
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');

  // Video preview modal
  const [previewVideoExercise, setPreviewVideoExercise] = useState<ExerciseDetail | null>(null);

  // Submitting
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchClients();
    fetchExerciseLibrary();
  }, []);

  // Check if routed with action=create or preselected exercises
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      const stored = sessionStorage.getItem('preselected_workout_exercises');
      if (stored) {
        try {
          const preselected: ExerciseDetail[] = JSON.parse(stored);
          sessionStorage.removeItem('preselected_workout_exercises');
          openBuilderWithPreselected(preselected);
          return;
        } catch (e) {}
      }
      openCreateModal();
    }
  }, [searchParams, exerciseLibrary]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workout-plans/trainer');
      if (res.data.success) {
        setPlans(res.data.plans || []);
      }
    } catch (err) {
      console.error('Failed to fetch workout plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      // Fetch members from gym sessions or progress list
      const res = await api.get('/workout-progress/trainer/clients-overview');
      if (res.data.success && res.data.clients) {
        const uniqueClients = res.data.clients.map((c: any) => ({
          _id: c.customer.id,
          name: c.customer.name,
          email: c.customer.email,
          fitnessGoal: c.customer.fitnessGoal
        }));
        setClients(uniqueClients);
      }
    } catch (err) {
      // Fallback: try users
      try {
        const res2 = await api.get('/trainer-sessions/trainer');
        if (res2.data.success && res2.data.sessions) {
          const map = new Map();
          res2.data.sessions.forEach((s: any) => {
            if (s.customerId && !map.has(s.customerId._id)) {
              map.set(s.customerId._id, {
                _id: s.customerId._id,
                name: `${s.customerId.firstName || ''} ${s.customerId.lastName || ''}`.trim() || 'Client',
                email: s.customerId.email,
                fitnessGoal: s.customerId.fitnessGoal
              });
            }
          });
          setClients(Array.from(map.values()));
        }
      } catch (err2) {
        console.error('Failed to load clients:', err2);
      }
    }
  };

  const fetchExerciseLibrary = async () => {
    try {
      const res = await api.get('/exercises');
      if (res.data.success) {
        setExerciseLibrary(res.data.exercises || []);
      }
    } catch (err) {
      console.error('Failed to load exercise library:', err);
    }
  };

  const openCreateModal = () => {
    setEditingPlanId(null);
    setSelectedCustomerId(clients[0]?._id || '');
    setPlanName('');
    setPlanDescription('');
    setWorkoutDays([
      { dayName: 'Day 1 – Full Body', exercises: [] }
    ]);
    setActiveDayIndex(0);
    setIsBuilderOpen(true);
  };

  const openBuilderWithPreselected = (preselected: ExerciseDetail[]) => {
    setEditingPlanId(null);
    setSelectedCustomerId(clients[0]?._id || '');
    setPlanName('Custom Workout Plan');
    setPlanDescription('Personalized exercise routine with video demonstrations.');
    setWorkoutDays([
      {
        dayName: 'Day 1 – Full Body',
        exercises: preselected.map((ex, idx) => ({
          exerciseId: ex,
          order: idx + 1,
          sets: ex.defaultSets || 3,
          repetitions: `${ex.defaultRepetitions || 12}`,
          duration: ex.defaultDuration || 60,
          restTime: ex.defaultRest || 30,
          trainerNotes: 'Focus on strict form and controlled tempo.'
        }))
      }
    ]);
    setActiveDayIndex(0);
    setIsBuilderOpen(true);
  };

  const openEditModal = (plan: WorkoutPlanItem) => {
    setEditingPlanId(plan._id);
    setSelectedCustomerId(plan.customerId?._id || '');
    setPlanName(plan.planName);
    setPlanDescription(plan.description || '');
    setWorkoutDays(plan.workoutDays && plan.workoutDays.length > 0 ? plan.workoutDays : [
      { dayName: 'Day 1 – Full Body', exercises: [] }
    ]);
    setActiveDayIndex(0);
    setIsBuilderOpen(true);
  };

  // Day Management
  const addDay = () => {
    const nextNum = workoutDays.length + 1;
    setWorkoutDays([...workoutDays, { dayName: `Day ${nextNum}`, exercises: [] }]);
    setActiveDayIndex(workoutDays.length);
  };

  const removeDay = (index: number) => {
    if (workoutDays.length === 1) {
      alert('A workout plan must contain at least one day.');
      return;
    }
    const updated = workoutDays.filter((_, idx) => idx !== index);
    setWorkoutDays(updated);
    setActiveDayIndex(Math.max(0, index - 1));
  };

  const updateDayName = (index: number, name: string) => {
    const updated = [...workoutDays];
    updated[index].dayName = name;
    setWorkoutDays(updated);
  };

  // Exercise Management in Active Day
  const addExerciseToCurrentDay = (exercise: ExerciseDetail) => {
    const currentDay = workoutDays[activeDayIndex];
    const newExercise: PlanExerciseItem = {
      exerciseId: exercise,
      order: currentDay.exercises.length + 1,
      sets: exercise.defaultSets || 3,
      repetitions: `${exercise.defaultRepetitions || 12}`,
      duration: exercise.defaultDuration || 60,
      restTime: exercise.defaultRest || 30,
      trainerNotes: ''
    };

    const updatedDays = [...workoutDays];
    updatedDays[activeDayIndex].exercises.push(newExercise);
    setWorkoutDays(updatedDays);
    setIsExercisePickerOpen(false);
  };

  const removeExerciseFromCurrentDay = (exIndex: number) => {
    const updatedDays = [...workoutDays];
    updatedDays[activeDayIndex].exercises.splice(exIndex, 1);
    // re-index order
    updatedDays[activeDayIndex].exercises.forEach((item, idx) => {
      item.order = idx + 1;
    });
    setWorkoutDays(updatedDays);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const exercises = [...workoutDays[activeDayIndex].exercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= exercises.length) return;

    const temp = exercises[index];
    exercises[index] = exercises[targetIndex];
    exercises[targetIndex] = temp;

    exercises.forEach((item, idx) => {
      item.order = idx + 1;
    });

    const updatedDays = [...workoutDays];
    updatedDays[activeDayIndex].exercises = exercises;
    setWorkoutDays(updatedDays);
  };

  const updateExerciseParam = (
    exIndex: number,
    field: 'sets' | 'repetitions' | 'duration' | 'restTime' | 'trainerNotes',
    value: any
  ) => {
    const updatedDays = [...workoutDays];
    const item = updatedDays[activeDayIndex].exercises[exIndex];
    (item as any)[field] = value;
    setWorkoutDays(updatedDays);
  };

  // Submit Plan (Draft or Published)
  const handleSubmitPlan = async (publish: boolean) => {
    if (!selectedCustomerId) {
      alert('Please select a client for this workout plan.');
      return;
    }
    if (!planName.trim()) {
      alert('Please enter a name for the workout plan.');
      return;
    }

    const totalExercises = workoutDays.reduce((acc, d) => acc + d.exercises.length, 0);
    if (totalExercises === 0) {
      alert('Please add at least one exercise from the Exercise Library.');
      return;
    }

    // Format payload
    const payload = {
      customerId: selectedCustomerId,
      planName,
      description: planDescription,
      workoutDays: workoutDays.map(day => ({
        dayName: day.dayName,
        exercises: day.exercises.map(ex => ({
          exerciseId: typeof ex.exerciseId === 'string' ? ex.exerciseId : ex.exerciseId._id,
          order: ex.order,
          sets: Number(ex.sets) || 3,
          repetitions: String(ex.repetitions || '12'),
          duration: Number(ex.duration) || 60,
          restTime: Number(ex.restTime) || 30,
          trainerNotes: ex.trainerNotes || ''
        }))
      })),
      status: publish ? 'Published' : 'Draft'
    };

    setSubmitting(true);
    try {
      if (editingPlanId) {
        await api.put(`/workout-plans/${editingPlanId}`, payload);
      } else {
        await api.post('/workout-plans', payload);
      }

      alert(publish ? 'Workout plan published successfully to client!' : 'Workout plan saved as Draft!');
      setIsBuilderOpen(false);
      await fetchPlans();
    } catch (err: any) {
      console.error('Error saving workout plan:', err);
      alert(err.response?.data?.message || 'Failed to save workout plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishExisting = async (planId: string) => {
    try {
      await api.patch(`/workout-plans/${planId}/publish`);
      alert('Workout plan is now Published and live on the client dashboard!');
      await fetchPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this workout plan?')) return;
    try {
      await api.delete(`/workout-plans/${planId}`);
      setPlans(plans.filter(p => p._id !== planId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete plan');
    }
  };

  const filteredPlans = plans.filter(p => {
    const matchesSearch = p.planName.toLowerCase().includes(search.toLowerCase()) ||
      `${p.customerId?.firstName || ''} ${p.customerId?.lastName || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F97316]/10 text-[#F97316] flex items-center gap-1">
              <FileText size={13} /> Client Workout Management
            </span>
            <span className="text-xs text-[#78716C]">• Video Animated Demonstrations</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#292524] tracking-tight">
            Customer Workout Plans
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Build custom daily workout routines for your clients by selecting animated exercises from the gym library.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-[#F97316] text-white rounded-xl text-sm font-bold hover:bg-[#EA580C] transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} /> Create Workout Plan
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full md:w-auto">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search by plan name or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm outline-none focus:border-[#F97316] text-[#292524]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-[#78716C] uppercase">Status:</span>
          {(['All', 'Published', 'Draft'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-[#F97316] text-white'
                  : 'bg-[#FFFDF8] text-[#78716C] hover:bg-[#FED7AA]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="text-center py-20 text-[#78716C]">
          <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-semibold text-sm">Loading customer workout plans...</p>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center">
          <Dumbbell size={48} className="mx-auto text-[#78716C] mb-3" />
          <h3 className="text-base font-bold text-[#292524]">No workout plans found</h3>
          <p className="text-xs text-[#78716C] mt-1 mb-4">
            Create a personalized workout plan for your clients or select exercises from the library.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-[#EA580C]"
          >
            Create New Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => {
            const totalExercises = plan.workoutDays?.reduce((acc, d) => acc + (d.exercises?.length || 0), 0) || 0;
            return (
              <div
                key={plan._id}
                className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                      plan.status === 'Published'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {plan.status}
                    </span>
                    <span className="text-[11px] text-[#78716C]">
                      {new Date(plan.updatedAt || plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-[#292524] mb-1">{plan.planName}</h3>
                  {plan.description && (
                    <p className="text-xs text-[#78716C] line-clamp-2 mb-3">{plan.description}</p>
                  )}

                  {/* Assigned Customer Card */}
                  <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#E7E5E4] flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#F97316] text-white font-bold flex items-center justify-center text-sm overflow-hidden">
                      {plan.customerId?.profilePhoto ? (
                        <img src={plan.customerId.profilePhoto} alt="" className="w-full h-full object-cover" />
                      ) : (
                        `${plan.customerId?.firstName?.[0] || 'C'}${plan.customerId?.lastName?.[0] || ''}`
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#292524] truncate">
                        {plan.customerId ? `${plan.customerId.firstName} ${plan.customerId.lastName}` : 'Unassigned'}
                      </p>
                      <p className="text-[10px] text-[#78716C] truncate">
                        {plan.customerId?.fitnessGoal || plan.customerId?.email}
                      </p>
                    </div>
                  </div>

                  {/* Days & Exercises Preview */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-medium text-[#78716C]">
                      <span>Workout Days: <strong>{plan.workoutDays?.length || 0} Days</strong></span>
                      <span>Total Exercises: <strong>{totalExercises}</strong></span>
                    </div>

                    <div className="space-y-1">
                      {plan.workoutDays?.slice(0, 3).map((day, idx) => (
                        <div key={idx} className="text-xs bg-[#FFFDF8] px-2.5 py-1 rounded-lg flex justify-between text-[#292524]">
                          <span className="font-medium truncate">{day.dayName}</span>
                          <span className="text-[#78716C] text-[11px] shrink-0 font-semibold">{day.exercises?.length || 0} exercises</span>
                        </div>
                      ))}
                      {plan.workoutDays && plan.workoutDays.length > 3 && (
                        <p className="text-[10px] text-[#78716C] text-center">+{plan.workoutDays.length - 3} more days</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#E7E5E4]">
                  {plan.status === 'Draft' && (
                    <button
                      onClick={() => handlePublishExisting(plan._id)}
                      className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Send size={13} /> Publish
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(plan)}
                    className="flex-1 py-2 px-3 bg-[#FFFDF8] hover:bg-[#FED7AA] text-[#292524] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit size={13} /> Edit Plan
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WORKOUT PLAN BUILDER MODAL */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#E7E5E4] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-[#F9F8F6]">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#292524]">
                  {editingPlanId ? 'Edit Workout Plan' : 'Create Customer Workout Plan'}
                </h2>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Select exercises from Gym Owner library, customize sets/reps/rest, and assign to client.
                </p>
              </div>
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="p-2 text-[#78716C] hover:text-[#292524] hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Client & Plan Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                    Assign To Client *
                  </label>
                  {clients.length > 0 ? (
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#292524] outline-none focus:border-[#F97316]"
                    >
                      <option value="">-- Select Client --</option>
                      {clients.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} ({c.email || c.fitnessGoal || 'Client'})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      No clients found in current gym. You can still test with sample client ID.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4-Week Hypertrophy & Fat Loss"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#292524] outline-none focus:border-[#F97316]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#78716C] mb-1.5">
                    Plan Instructions / Goal Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Perform 3-4 days a week with proper warm-up. Drink at least 3L water daily."
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    className="w-full bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl px-3.5 py-2 text-sm text-[#292524] outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              {/* Day Tabs */}
              <div className="border-t border-[#E7E5E4] pt-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#292524] flex items-center gap-2">
                    <Calendar size={16} className="text-[#F97316]" /> Workout Schedule Days
                  </h3>
                  <button
                    onClick={addDay}
                    className="px-3 py-1.5 bg-[#FFFDF8] hover:bg-[#FED7AA] text-[#292524] text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Another Day
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {workoutDays.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveDayIndex(idx)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                        activeDayIndex === idx
                          ? 'bg-[#F97316] text-white shadow-sm'
                          : 'bg-[#FFFDF8] text-[#78716C] hover:bg-[#FED7AA]'
                      }`}
                    >
                      <span>{day.dayName}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeDayIndex === idx ? 'bg-white/20 text-white' : 'bg-black/10 text-[#78716C]'
                      }`}>
                        {day.exercises.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Day Exercises Section */}
              {workoutDays[activeDayIndex] && (
                <div className="bg-[#F9F8F6] border border-[#E7E5E4] rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#E7E5E4]">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-bold text-[#78716C] uppercase">Day Title:</span>
                      <input
                        type="text"
                        value={workoutDays[activeDayIndex].dayName}
                        onChange={(e) => updateDayName(activeDayIndex, e.target.value)}
                        className="bg-white border border-[#E7E5E4] rounded-lg px-3 py-1 text-sm font-bold text-[#292524] outline-none focus:border-[#F97316]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsExercisePickerOpen(true)}
                        className="px-3.5 py-1.5 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-[#EA580C] transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus size={14} /> Add Exercise from Library
                      </button>
                      {workoutDays.length > 1 && (
                        <button
                          onClick={() => removeDay(activeDayIndex)}
                          className="px-3 py-1.5 border border-rose-300 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 transition-colors"
                        >
                          Remove Day
                        </button>
                      )}
                    </div>
                  </div>

                  {workoutDays[activeDayIndex].exercises.length === 0 ? (
                    <div className="text-center py-10 bg-white border border-dashed border-[#E7E5E4] rounded-2xl">
                      <Dumbbell size={36} className="mx-auto text-[#78716C] mb-2" />
                      <p className="text-sm font-bold text-[#292524]">No exercises added to this day yet</p>
                      <p className="text-xs text-[#78716C] mt-1 mb-3">
                        Choose exercises from the gym owner library with animations and videos.
                      </p>
                      <button
                        onClick={() => setIsExercisePickerOpen(true)}
                        className="px-4 py-2 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-[#EA580C] transition-colors"
                      >
                        Browse Exercise Library
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {workoutDays[activeDayIndex].exercises.map((item, exIdx) => {
                        const exObj = typeof item.exerciseId === 'object' ? item.exerciseId : null;
                        const exName = exObj?.name || 'Exercise';
                        const exCategory = exObj?.category || 'General';
                        const hasVideo = !!exObj?.videoUrl;

                        return (
                          <div
                            key={exIdx}
                            className="bg-white border border-[#E7E5E4] rounded-2xl p-4 shadow-sm space-y-3 transition-all hover:border-[#F97316]/40"
                          >
                            {/* Exercise Header Row */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-lg bg-[#F97316] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                                  {exIdx + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm text-[#292524]">{exName}</h4>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFFDF8] text-[#78716C] font-semibold">
                                      {exCategory}
                                    </span>
                                    {hasVideo && (
                                      <button
                                        type="button"
                                        onClick={() => setPreviewVideoExercise(exObj)}
                                        className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100"
                                      >
                                        <Play size={10} className="fill-current" /> Watch Video
                                      </button>
                                    )}
                                  </div>
                                  {exObj?.targetMuscle && (
                                    <p className="text-[11px] text-[#78716C] mt-0.5">
                                      Target: {exObj.targetMuscle} • {exObj.difficulty}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Ordering & Remove */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => moveExercise(exIdx, 'up')}
                                  disabled={exIdx === 0}
                                  className="p-1.5 text-[#78716C] hover:text-[#292524] hover:bg-[#FFFDF8] rounded-lg disabled:opacity-30"
                                  title="Move Up"
                                >
                                  <ArrowUp size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveExercise(exIdx, 'down')}
                                  disabled={exIdx === workoutDays[activeDayIndex].exercises.length - 1}
                                  className="p-1.5 text-[#78716C] hover:text-[#292524] hover:bg-[#FFFDF8] rounded-lg disabled:opacity-30"
                                  title="Move Down"
                                >
                                  <ArrowDown size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeExerciseFromCurrentDay(exIdx)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg ml-1"
                                  title="Remove Exercise"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>

                            {/* Parameter Controls: Sets, Reps, Rest, Duration */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F9F8F6] p-3 rounded-xl border border-[#E7E5E4]">
                              <div>
                                <label className="block text-[10px] font-bold uppercase text-[#78716C] mb-1">
                                  Sets
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={20}
                                  value={item.sets}
                                  onChange={(e) => updateExerciseParam(exIdx, 'sets', parseInt(e.target.value) || 1)}
                                  className="w-full bg-white border border-[#E7E5E4] rounded-lg px-2.5 py-1 text-xs font-bold text-[#292524] outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-[#78716C] mb-1">
                                  Reps / Target
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 15 or 12-15"
                                  value={item.repetitions}
                                  onChange={(e) => updateExerciseParam(exIdx, 'repetitions', e.target.value)}
                                  className="w-full bg-white border border-[#E7E5E4] rounded-lg px-2.5 py-1 text-xs font-bold text-[#292524] outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-[#78716C] mb-1">
                                  Rest (Seconds)
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  step={5}
                                  value={item.restTime}
                                  onChange={(e) => updateExerciseParam(exIdx, 'restTime', parseInt(e.target.value) || 0)}
                                  className="w-full bg-white border border-[#E7E5E4] rounded-lg px-2.5 py-1 text-xs font-bold text-[#292524] outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold uppercase text-[#78716C] mb-1">
                                  Est. Duration (Sec)
                                </label>
                                <input
                                  type="number"
                                  min={10}
                                  step={5}
                                  value={item.duration || 60}
                                  onChange={(e) => updateExerciseParam(exIdx, 'duration', parseInt(e.target.value) || 60)}
                                  className="w-full bg-white border border-[#E7E5E4] rounded-lg px-2.5 py-1 text-xs font-bold text-[#292524] outline-none"
                                />
                              </div>
                            </div>

                            {/* Trainer Custom Notes */}
                            <div>
                              <input
                                type="text"
                                placeholder="Add specific trainer notes (e.g. Keep chest high, 2s negative pause on each rep)"
                                value={item.trainerNotes || ''}
                                onChange={(e) => updateExerciseParam(exIdx, 'trainerNotes', e.target.value)}
                                className="w-full bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl px-3 py-1.5 text-xs text-[#292524] outline-none placeholder:text-[#78716C]"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 md:p-6 border-t border-[#E7E5E4] bg-[#F9F8F6] flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-[#78716C]">
                {workoutDays.reduce((acc, d) => acc + d.exercises.length, 0)} total exercises configured
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 border border-[#E7E5E4] rounded-xl text-xs font-bold text-[#78716C] hover:bg-[#FED7AA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitPlan(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#FFFDF8] hover:bg-[#FED7AA] border border-[#E7E5E4] text-[#292524] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save size={14} /> Save as Draft
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmitPlan(true)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send size={14} /> Publish to Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXERCISE PICKER MODAL */}
      {isExercisePickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E7E5E4] overflow-hidden">
            <div className="p-5 border-b border-[#E7E5E4] flex justify-between items-center bg-[#F9F8F6]">
              <div>
                <h3 className="font-extrabold text-lg text-[#292524]">Select Exercise from Gym Library</h3>
                <p className="text-xs text-[#78716C]">Browse verified gym exercises with form demonstration videos</p>
              </div>
              <button
                onClick={() => setIsExercisePickerOpen(false)}
                className="p-1.5 text-[#78716C] hover:text-[#292524] rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-[#E7E5E4] bg-white space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
                <input
                  type="text"
                  placeholder="Filter exercises by name, muscle, equipment..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-xs outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {['All', 'Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Cardio'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPickerCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap ${
                      pickerCategory === cat
                        ? 'bg-[#F97316] text-white'
                        : 'bg-[#FFFDF8] text-[#78716C] hover:bg-[#FED7AA]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {exerciseLibrary
                .filter(ex => {
                  const matchesSearch = ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                    ex.targetMuscle.toLowerCase().includes(pickerSearch.toLowerCase());
                  const matchesCat = pickerCategory === 'All' || ex.category === pickerCategory;
                  return matchesSearch && matchesCat;
                })
                .map(ex => (
                  <div
                    key={ex._id}
                    className="p-3 bg-[#F9F8F6] hover:bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#292524] text-white flex items-center justify-center shrink-0">
                        {ex.videoUrl ? <Video size={18} className="text-emerald-400" /> : <Dumbbell size={18} />}
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-[#292524]">{ex.name}</h5>
                        <p className="text-[10px] text-[#78716C]">
                          {ex.category} • {ex.targetMuscle} • {ex.difficulty} • {ex.defaultSets} sets × {ex.defaultRepetitions} reps
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ex.videoUrl && (
                        <button
                          type="button"
                          onClick={() => setPreviewVideoExercise(ex)}
                          className="px-2.5 py-1 bg-white border border-[#E7E5E4] text-[#292524] rounded-lg text-[11px] font-bold hover:bg-[#FED7AA]"
                        >
                          Preview
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => addExerciseToCurrentDay(ex)}
                        className="px-3 py-1 bg-[#F97316] text-white rounded-lg text-xs font-bold hover:bg-[#EA580C] transition-colors"
                      >
                        Add to Plan
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIDEO PREVIEW MODAL */}
      {previewVideoExercise && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#E7E5E4] space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-[#F97316]">{previewVideoExercise.category}</span>
                <h3 className="text-xl font-extrabold text-[#292524]">{previewVideoExercise.name}</h3>
              </div>
              <button
                onClick={() => setPreviewVideoExercise(null)}
                className="p-1.5 text-[#78716C] hover:text-[#292524] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <ExerciseVideoPlayer
              videoUrl={previewVideoExercise.videoUrl}
              title={previewVideoExercise.name}
              autoPlay={true}
            />

            {previewVideoExercise.instructions && (
              <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#E7E5E4] text-xs text-[#78716C] max-h-32 overflow-y-auto">
                <span className="font-bold text-[#292524] block mb-1">Form Instructions:</span>
                {previewVideoExercise.instructions}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewVideoExercise(null)}
                className="px-4 py-2 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-[#EA580C]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerWorkoutPlans;