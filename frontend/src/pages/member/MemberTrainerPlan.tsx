import React, { useState, useEffect } from 'react';
import {
  Dumbbell, Utensils, Video, BookOpen, Plus, Send,
  CheckCircle2, Clock, AlertCircle, Play, Eye, Sparkles,
  User, ChevronRight, X, Loader2, Award, Calendar,
  MessageSquare, Flame, Droplets, Target, ShieldCheck, Wrench,
  Globe, Search, Filter, ShieldAlert, Layers, Activity, Compass, Info
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import ExerciseVideoPlayer from '../../components/workout/ExerciseVideoPlayer';
import { EXERCISE_VIDEOS, type ExerciseVideo, extractYouTubeId } from '../common/GymExerciseVideos';

interface TrainerItem {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  specialization?: string;
  experienceYears?: number;
  profilePhoto?: string;
}

interface PlanRequest {
  _id: string;
  customerId: any;
  trainerId: any;
  planType: 'Workout Plan' | 'Diet Plan' | 'Exercise Videos' | 'Exercise Library';
  title: string;
  goal?: string;
  customerMessage: string;
  trainerFeedback?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  workoutDetails?: {
    days: {
      dayName: string;
      focus?: string;
      exercises: {
        name: string;
        sets: number;
        reps: string;
        duration?: number;
        rest?: string;
        notes?: string;
      }[];
    }[];
  };
  dietDetails?: {
    dailyCalories?: string | number;
    protein?: string;
    carbs?: string;
    fats?: string;
    hydration?: string;
    meals: {
      mealName: string;
      time: string;
      items: string;
      calories?: string;
      protein?: string;
    }[];
    guidelines?: string[];
  };
  videoDetails?: {
    videoTitle: string;
    exerciseName: string;
    videoUrl?: string;
    instructions?: string;
  }[];
  approvedAt?: string;
  createdAt: string;
}

const MemberTrainerPlan: React.FC = () => {
  const { user } = useAuth();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'workout' | 'diet' | 'videos' | 'library' | 'equipments'>('workout');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<PlanRequest[]>([]);
  const [publishedWorkoutPlans, setPublishedWorkoutPlans] = useState<any[]>([]);
  const [assignedVideos, setAssignedVideos] = useState<any[]>([]);
  const [libraryExercises, setLibraryExercises] = useState<any[]>([]);
  const [availableTrainers, setAvailableTrainers] = useState<TrainerItem[]>([]);
  const [gymEquipments, setGymEquipments] = useState<any[]>([]);

  // Equipments Filter
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentCategory, setEquipmentCategory] = useState('All');

  // Manual Plan Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlanType, setModalPlanType] = useState<'Workout Plan' | 'Diet Plan' | 'Exercise Videos' | 'Exercise Library'>('Workout Plan');
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planGoal, setPlanGoal] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState('');
  const [submissionError, setSubmissionError] = useState('');

  // Workout Builder in Modal
  const [workoutDays, setWorkoutDays] = useState([
    {
      dayName: 'Day 1 - Push & Chest',
      focus: 'Chest, Shoulders & Triceps',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '8-10', duration: 60, rest: '90s', notes: 'Control eccentric descent' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', duration: 60, rest: '60s', notes: 'Squeeze at peak contraction' }
      ]
    }
  ]);

  // Diet Builder in Modal
  const [dailyCalories, setDailyCalories] = useState('2400 kcal');
  const [proteinTarget, setProteinTarget] = useState('160g');
  const [carbsTarget, setCarbsTarget] = useState('240g');
  const [fatsTarget, setFatsTarget] = useState('65g');
  const [hydrationTarget, setHydrationTarget] = useState('3.5 Liters');
  const [dietMeals, setDietMeals] = useState([
    { mealName: 'Breakfast', time: '08:00 AM', items: '4 Egg Whites + 2 Whole Eggs, 80g Oats with Berries', calories: '550 kcal', protein: '38g' },
    { mealName: 'Lunch', time: '01:00 PM', items: '200g Grilled Chicken/Paneer, 150g Brown Rice & Veggies', calories: '650 kcal', protein: '48g' },
    { mealName: 'Pre-Workout Fuel', time: '04:30 PM', items: '1 Banana, 2 Slices Whole Grain Toast, Black Coffee', calories: '250 kcal', protein: '8g' },
    { mealName: 'Dinner', time: '08:30 PM', items: 'Grilled Fish or Cottage Cheese with Quinoa & Salad', calories: '580 kcal', protein: '42g' }
  ]);

  // YouTube Exercise Videos State
  const [youtubeLanguage, setYoutubeLanguage] = useState<'All' | 'Tamil' | 'English'>('All');
  const [youtubeCategory, setYoutubeCategory] = useState<string>('All');
  const [youtubeSearch, setYoutubeSearch] = useState<string>('');
  const [activeYoutubeVideo, setActiveYoutubeVideo] = useState<ExerciseVideo | null>(null);

  // Animated Exercise Library State
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('All');
  const [activeAnimatedExercise, setActiveAnimatedExercise] = useState<any | null>(null);

  useEffect(() => {
    fetchTrainerPlanData();
    fetchTrainers();
  }, []);

  const fetchTrainerPlanData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-plans/customer');
      if (res.data.success) {
        setRequests(res.data.requests || []);
        setPublishedWorkoutPlans(res.data.publishedWorkoutPlans || []);
        setAssignedVideos(res.data.workoutVideos || []);
        let libEx = res.data.exercises || [];
        if (libEx.length === 0) {
          try {
            const exRes = await api.get('/exercises');
            if (exRes.data?.success && exRes.data.exercises?.length) {
              libEx = exRes.data.exercises;
            }
          } catch (_) {}
        }
        setLibraryExercises(libEx);
        const eqList = res.data.equipments || res.data.approvedEquipments || [];
        setGymEquipments(eqList);
        if (eqList.length === 0) {
          try {
            const eqRes = await api.get('/trainer-plans/equipments/customer');
            if (eqRes.data?.equipment) {
              setGymEquipments(eqRes.data.equipment);
            }
          } catch (_) {}
        }
      }
    } catch (err) {
      console.error('Failed to load trainer plans data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/trainer-plans/trainers');
      if (res.data.success && res.data.trainers?.length) {
        setAvailableTrainers(res.data.trainers);
        if (!selectedTrainerId) {
          setSelectedTrainerId(res.data.trainers[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load trainers', err);
    }
  };

  // Submit Manual Plan Request to Trainer
  const handleManualPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainerId) {
      setSubmissionError('Please select a trainer to send your plan and message to.');
      return;
    }
    if (!planTitle.trim()) {
      setSubmissionError('Please provide a title for your plan.');
      return;
    }
    if (!customerMessage.trim()) {
      setSubmissionError('Please enter a message explaining your plan to the trainer.');
      return;
    }

    try {
      setSubmittingManual(true);
      setSubmissionError('');

      const payload: any = {
        trainerId: selectedTrainerId,
        planType: modalPlanType,
        title: planTitle.trim(),
        goal: planGoal.trim() || 'General Fitness',
        customerMessage: customerMessage.trim()
      };

      if (modalPlanType === 'Workout Plan') {
        payload.workoutDetails = { days: workoutDays };
      } else if (modalPlanType === 'Diet Plan') {
        payload.dietDetails = {
          dailyCalories,
          protein: proteinTarget,
          carbs: carbsTarget,
          fats: fatsTarget,
          hydration: hydrationTarget,
          meals: dietMeals
        };
      }

      const res = await api.post('/trainer-plans/manual-request', payload);
      if (res.data.success) {
        setSubmissionSuccess('Plan submitted! Message sent to trainer. It will show directly once approved.');
        if (res.data.request) {
          setRequests(prev => [res.data.request, ...prev]);
        }
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmissionSuccess('');
          setPlanTitle('');
          setPlanGoal('');
          setCustomerMessage('');
        }, 1800);
      }
    } catch (err: any) {
      setSubmissionError(err.response?.data?.message || 'Failed to submit plan to trainer.');
    } finally {
      setSubmittingManual(false);
    }
  };

  // Helper getters for filtered requests
  const approvedWorkoutRequests = requests.filter(r => r.planType === 'Workout Plan' && r.status === 'Approved');
  const pendingWorkoutRequests = requests.filter(r => r.planType === 'Workout Plan' && r.status === 'Pending');

  const approvedDietRequests = requests.filter(r => r.planType === 'Diet Plan' && r.status === 'Approved');
  const pendingDietRequests = requests.filter(r => r.planType === 'Diet Plan' && r.status === 'Pending');

  const approvedLibraryRequests = requests.filter(r => r.planType === 'Exercise Library' && r.status === 'Approved');
  const pendingLibraryRequests = requests.filter(r => r.planType === 'Exercise Library' && r.status === 'Pending');

  // Standard Exercise Library Default (10 items)
  const defaultStandardExercises = [
    { name: 'Barbell Back Squats', category: 'Legs', targetMuscle: 'Quadriceps, Glutes', difficulty: 'Beginner', equipment: 'Barbell, Squat Rack', defaultSets: 3, defaultRepetitions: 15, defaultRest: 60, description: 'The king of lower body exercises. Builds full lower body strength, core stability, and functional power.', instructions: 'Position bar across upper traps. Hinge hips back and descend until thighs are parallel to ground. Drive through mid-foot to return upright.' },
    { name: 'Push-ups', category: 'Chest', targetMuscle: 'Pectoralis Major, Triceps', difficulty: 'Beginner', equipment: 'Bodyweight', defaultSets: 3, defaultRepetitions: 12, defaultRest: 45, description: 'Fundamental horizontal pressing movement building chest and core endurance.', instructions: 'Plank position with hands shoulder-width. Lower until chest is 2 inches off floor. Press up firmly into floor.' },
    { name: 'Barbell Bench Press', category: 'Chest', targetMuscle: 'Pectoralis Major, Triceps', difficulty: 'Intermediate', equipment: 'Barbell & Flat Bench', defaultSets: 4, defaultRepetitions: 10, defaultRest: 60, description: 'Compound upper-body power movement maximizing chest hypertrophy and pushing strength.', instructions: 'Lie flat on bench, eyes under bar. Grip bar shoulder-width, lower to mid-chest with control, press upward smoothly.' },
    { name: 'Pull-ups', category: 'Back', targetMuscle: 'Latissimus Dorsi, Biceps', difficulty: 'Intermediate', equipment: 'Pull-up Bar', defaultSets: 3, defaultRepetitions: 8, defaultRest: 60, description: 'Upper body pulling exercise for wide V-taper lats and grip strength.', instructions: 'Overhand grip wider than shoulders. Pull chest towards bar while driving elbows down. Lower with control to dead hang.' },
    { name: 'Deadlift', category: 'Back', targetMuscle: 'Hamstrings, Glutes, Lower Back', difficulty: 'Advanced', equipment: 'Barbell & Plates', defaultSets: 3, defaultRepetitions: 8, defaultRest: 90, description: 'Ultimate posterior chain strength builder and full-body athletic power.', instructions: 'Bar over mid-foot. Hinge hips, grip bar firmly, brace core, and push floor away to stand upright.' },
    { name: 'Dumbbell Bicep Curls', category: 'Arms', targetMuscle: 'Biceps Brachii', difficulty: 'Beginner', equipment: 'Dumbbells', defaultSets: 3, defaultRepetitions: 12, defaultRest: 45, description: 'Targeted arm builder focusing on bicep peak contraction and forearm control.', instructions: 'Pin elbows to sides, curl dumbbells upward while supinating wrists, squeeze peak, and lower slowly.' },
    { name: 'Plank Hold', category: 'Core', targetMuscle: 'Rectus Abdominis, Core', difficulty: 'Beginner', equipment: 'Bodyweight / Mat', defaultSets: 3, defaultRepetitions: 1, defaultDuration: 60, defaultRest: 45, description: 'Isometric core strength and spinal stabilization.', instructions: 'Hold straight forearm plank line from heels to head. Brace abs and glutes firmly.' },
    { name: 'Overhead Shoulder Press', category: 'Shoulders', targetMuscle: 'Deltoids, Triceps', difficulty: 'Intermediate', equipment: 'Dumbbells / Barbell', defaultSets: 3, defaultRepetitions: 10, defaultRest: 60, description: 'Overhead vertical press for 3D shoulder boulder mass.', instructions: 'Press dumbbells vertically overhead until locked out. Lower under control to chin level.' },
    { name: 'Dumbbell Walking Lunges', category: 'Legs', targetMuscle: 'Quadriceps, Glutes', difficulty: 'Beginner', equipment: 'Dumbbells', defaultSets: 3, defaultRepetitions: 12, defaultRest: 60, description: 'Unilateral leg strength, balance, and athletic conditioning.', instructions: 'Step forward into 90-degree knee bend. Push through front heel to step through to next leg.' },
    { name: 'Russian Twists', category: 'Core', targetMuscle: 'Obliques, Abdominals', difficulty: 'Beginner', equipment: 'Bodyweight / Plate', defaultSets: 3, defaultRepetitions: 20, defaultRest: 45, description: 'Rotational core power and oblique definition.', instructions: 'Sit on floor, lean back 45 degrees with feet elevated. Rotate torso side to side touching hands to floor.' }
  ];

  const fullLibraryList = libraryExercises.length > 0 ? libraryExercises : defaultStandardExercises;

  // Filtered Library
  const categories = ['All', 'Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body'];
  const filteredExercises = fullLibraryList.filter(ex => {
    const matchesCat = libraryCategory === 'All' || ex.category?.toLowerCase() === libraryCategory.toLowerCase();
    const matchesSearch = !librarySearch ||
      ex.name?.toLowerCase().includes(librarySearch.toLowerCase()) ||
      ex.targetMuscle?.toLowerCase().includes(librarySearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // YouTube Categories & Filtered List
  const youtubeCategories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps & Triceps', 'Core & Cardio'];
  const filteredYoutubeVideos = EXERCISE_VIDEOS.filter(video => {
    const matchesLang = youtubeLanguage === 'All' || video.language === youtubeLanguage;
    const matchesCat = youtubeCategory === 'All' || video.category.toLowerCase() === youtubeCategory.toLowerCase();
    const q = youtubeSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      video.title.toLowerCase().includes(q) ||
      (video.titleTamil && video.titleTamil.toLowerCase().includes(q)) ||
      video.targetMuscle.toLowerCase().includes(q) ||
      video.equipment.toLowerCase().includes(q);
    return matchesLang && matchesCat && matchesSearch;
  });

  // Approved & Filtered Equipments
  const approvedEquipments = gymEquipments.filter(e => e.isApproved === true);
  const equipmentCategories = ['All', ...Array.from(new Set(gymEquipments.map((e: any) => e.category).filter(Boolean)))];
  const filteredEquipments = approvedEquipments.filter((eq: any) => {
    const matchesCat = equipmentCategory === 'All' || eq.category?.toLowerCase() === equipmentCategory.toLowerCase();
    const matchesSearch = !equipmentSearch ||
      eq.name?.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
      eq.brand?.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
      eq.category?.toLowerCase().includes(equipmentSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-white via-orange-50/30 to-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#F97316] flex items-center justify-center text-white shadow-md shadow-orange-300/50">
              <Dumbbell size={20} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#292524] tracking-tight">
              Trainer&apos;s Plan
            </h1>
            <span className="px-2.5 py-1 bg-orange-100 text-[#EA580C] text-xs font-bold rounded-full">
              Coach Verified
            </span>
          </div>
          <p className="text-sm text-[#78716C] max-w-2xl">
            Access your trainer-assigned and approved workout routines, meal plans, video demonstrations, gym exercise library, and approved equipment.
          </p>
        </div>

        {/* Enter Manually Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-2xl flex items-center space-x-2 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
        >
          <Plus size={18} />
          <span>Enter Manually</span>
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#E7E5E4] overflow-x-auto gap-2 scrollbar-none">
        {[
          { key: 'workout', label: 'Workout Plan', icon: Dumbbell, count: approvedWorkoutRequests.length + publishedWorkoutPlans.length },
          { key: 'diet', label: 'Diet Plan', icon: Utensils, count: approvedDietRequests.length },
          { key: 'videos', label: 'Exercise Videos', icon: Video, count: assignedVideos.length },
          { key: 'library', label: 'Exercise Library', icon: BookOpen, count: approvedLibraryRequests.length },
          { key: 'equipments', label: 'Gym Equipments', icon: Wrench, count: approvedEquipments.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 py-3 px-5 border-b-2 font-semibold text-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#F97316] text-[#F97316]'
                  : 'border-transparent text-[#78716C] hover:text-[#292524] hover:border-gray-300'
              }`}
            >
              <Icon size={17} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-[#F97316] text-white' : 'bg-gray-100 text-[#78716C]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-[#F97316]" size={36} />
          <p className="text-sm font-medium text-[#78716C]">Loading your trainer plans...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: WORKOUT PLAN */}
          {activeTab === 'workout' && (
            <div className="space-y-6">
              {/* Pending Requests Alert */}
              {pendingWorkoutRequests.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <Clock size={16} />
                    <span>Pending Trainer Approval ({pendingWorkoutRequests.length})</span>
                  </div>
                  {pendingWorkoutRequests.map(req => (
                    <div key={req._id} className="bg-white p-4 rounded-xl border border-amber-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#292524] text-base">{req.title}</h4>
                          <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                            Awaiting Trainer Approval
                          </span>
                        </div>
                        <p className="text-xs text-[#78716C] mt-1">
                          Sent to Coach <strong>{req.trainerId?.name || req.trainerId?.firstName || 'Trainer'}</strong>: &ldquo;{req.customerMessage}&rdquo;
                        </p>
                      </div>
                      <span className="text-xs text-amber-700 bg-amber-100/50 px-3 py-1.5 rounded-lg font-medium shrink-0">
                        Approval in progress
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Display Approved Custom Plans */}
              {approvedWorkoutRequests.map(plan => (
                <div key={plan._id} className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#F5F5F4]">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={13} /> Approved by Coach {plan.trainerId?.name || plan.trainerId?.firstName || 'Trainer'}
                        </span>
                        <span className="text-xs text-[#78716C]">
                          {plan.approvedAt ? new Date(plan.approvedAt).toLocaleDateString() : 'Active'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-[#292524] mt-2">{plan.title}</h3>
                      {plan.goal && <p className="text-sm font-semibold text-[#F97316]">Goal: {plan.goal}</p>}
                    </div>

                    {plan.trainerFeedback && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 max-w-md">
                        <p className="text-xs text-emerald-900 font-medium">
                          <strong>Coach Note:</strong> &ldquo;{plan.trainerFeedback}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Workout Days */}
                  {plan.workoutDetails?.days?.map((day, dIdx) => (
                    <div key={dIdx} className="bg-stone-50 border border-stone-200/80 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#292524] text-lg">{day.dayName}</h4>
                        {day.focus && <span className="text-xs bg-orange-100 text-[#EA580C] px-2.5 py-1 rounded-lg font-bold">{day.focus}</span>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {day.exercises.map((ex, eIdx) => (
                          <div key={eIdx} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#F97316]">#{eIdx + 1}</span>
                                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">Rest {ex.rest || '60s'}</span>
                              </div>
                              <h5 className="font-bold text-[#292524] text-sm mt-1">{ex.name}</h5>
                              <p className="text-xs text-stone-500 mt-1 font-medium">{ex.sets} sets &bull; {ex.reps} reps</p>
                            </div>
                            {ex.notes && (
                              <p className="text-[11px] text-stone-600 italic bg-stone-50 p-1.5 rounded mt-2 border border-stone-100">
                                {ex.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Published Workout Plans directly assigned by trainer */}
              {publishedWorkoutPlans.map(plan => (
                <div key={plan._id} className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#F5F5F4]">
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
                        <ShieldCheck size={13} /> Official Trainer Workout Plan
                      </span>
                      <h3 className="text-2xl font-black text-[#292524] mt-2">{plan.planName}</h3>
                      <p className="text-xs text-[#78716C] mt-0.5">
                        Assigned by Coach {plan.trainerId?.firstName || 'Trainer'} &bull; {plan.workoutDays?.length || 0} Workout Days
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {plan.workoutDays?.map((day: any, dIdx: number) => (
                      <div key={dIdx} className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-[#292524]">{day.dayName}</h4>
                          <span className="text-xs bg-orange-100 text-[#EA580C] px-2.5 py-1 rounded-lg font-bold">{day.focus || 'Strength'}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {day.exercises?.map((item: any, eIdx: number) => {
                            const ex = item.exerciseId || {};
                            return (
                              <div key={eIdx} className="bg-white p-3.5 rounded-xl border border-stone-200">
                                <h5 className="font-bold text-sm text-[#292524]">{ex.name || 'Exercise'}</h5>
                                <p className="text-xs text-[#F97316] font-semibold mt-1">
                                  {item.sets} sets &bull; {item.repetitions} reps
                                </p>
                                {item.trainerNotes && (
                                  <p className="text-[11px] text-[#78716C] italic mt-1">&ldquo;{item.trainerNotes}&rdquo;</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {approvedWorkoutRequests.length === 0 && publishedWorkoutPlans.length === 0 && pendingWorkoutRequests.length === 0 && (
                <div className="text-center py-16 bg-white border border-dashed border-[#E7E5E4] rounded-3xl p-8 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316] mx-auto">
                    <Dumbbell size={28} />
                  </div>
                  <h3 className="font-bold text-xl text-[#292524]">No Workout Plans Active Yet</h3>
                  <p className="text-sm text-[#78716C]">
                    You can click &ldquo;Enter Manually&rdquo; above to create a workout routine and send it directly to your trainer for approval.
                  </p>
                  <button
                    onClick={() => {
                      setModalPlanType('Workout Plan');
                      setIsModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-[#F97316] text-white font-bold rounded-xl text-sm hover:bg-[#EA580C] transition-colors"
                  >
                    Enter Workout Plan Manually
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIET PLAN */}
          {activeTab === 'diet' && (
            <div className="space-y-6">
              {/* Pending Diet Requests */}
              {pendingDietRequests.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <Clock size={16} />
                    <span>Pending Diet Plan Approvals ({pendingDietRequests.length})</span>
                  </div>
                  {pendingDietRequests.map(req => (
                    <div key={req._id} className="bg-white p-4 rounded-xl border border-amber-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <h4 className="font-bold text-[#292524] text-base">{req.title}</h4>
                        <p className="text-xs text-[#78716C] mt-1">
                          Sent to Coach <strong>{req.trainerId?.name || req.trainerId?.firstName || 'Trainer'}</strong>: &ldquo;{req.customerMessage}&rdquo;
                        </p>
                      </div>
                      <span className="text-xs text-amber-700 bg-amber-100/60 px-3 py-1.5 rounded-lg font-medium">
                        Pending Approval
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Display Approved Diet Plans */}
              {approvedDietRequests.map(diet => (
                <div key={diet._id} className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#F5F5F4]">
                    <div>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
                        <CheckCircle2 size={13} /> Approved by Coach {diet.trainerId?.name || diet.trainerId?.firstName || 'Trainer'}
                      </span>
                      <h3 className="text-2xl font-black text-[#292524] mt-2">{diet.title}</h3>
                      {diet.goal && <p className="text-sm font-semibold text-[#F97316]">Goal: {diet.goal}</p>}
                    </div>

                    {diet.trainerFeedback && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 max-w-md">
                        <p className="text-xs text-emerald-900 font-medium">
                          <strong>Coach Advice:</strong> &ldquo;{diet.trainerFeedback}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Macro Target Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4 text-center">
                      <Flame size={20} className="text-[#F97316] mx-auto mb-1" />
                      <span className="text-xs text-[#78716C] font-semibold">Calories</span>
                      <p className="text-xl font-black text-[#292524]">{diet.dietDetails?.dailyCalories || '2400 kcal'}</p>
                    </div>
                    <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 text-center">
                      <Target size={20} className="text-blue-600 mx-auto mb-1" />
                      <span className="text-xs text-[#78716C] font-semibold">Protein</span>
                      <p className="text-xl font-black text-[#292524]">{diet.dietDetails?.protein || '160g'}</p>
                    </div>
                    <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 text-center">
                      <Utensils size={20} className="text-amber-600 mx-auto mb-1" />
                      <span className="text-xs text-[#78716C] font-semibold">Carbs</span>
                      <p className="text-xl font-black text-[#292524]">{diet.dietDetails?.carbs || '240g'}</p>
                    </div>
                    <div className="bg-cyan-50/70 border border-cyan-100 rounded-2xl p-4 text-center">
                      <Droplets size={20} className="text-cyan-600 mx-auto mb-1" />
                      <span className="text-xs text-[#78716C] font-semibold">Hydration</span>
                      <p className="text-xl font-black text-[#292524]">{diet.dietDetails?.hydration || '3.5L'}</p>
                    </div>
                  </div>

                  {/* Meal Schedule */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-lg text-[#292524]">Approved Meal Schedule</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {diet.dietDetails?.meals?.map((meal, mIdx) => (
                        <div key={mIdx} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <h5 className="font-bold text-[#292524] text-base">{meal.mealName}</h5>
                              <span className="text-xs bg-white text-[#78716C] px-2 py-0.5 rounded border border-stone-200 font-medium">
                                {meal.time}
                              </span>
                            </div>
                            <p className="text-xs text-[#57534E] leading-relaxed font-medium">{meal.items}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-stone-200/60 text-xs font-semibold text-[#F97316]">
                            <span>{meal.calories}</span>
                            <span>&bull;</span>
                            <span>{meal.protein} protein</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {approvedDietRequests.length === 0 && pendingDietRequests.length === 0 && (
                <div className="text-center py-16 bg-white border border-dashed border-[#E7E5E4] rounded-3xl p-8 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316] mx-auto">
                    <Utensils size={28} />
                  </div>
                  <h3 className="font-bold text-xl text-[#292524]">No Diet Plan Approved Yet</h3>
                  <p className="text-sm text-[#78716C]">
                    Click &ldquo;Enter Manually&rdquo; to input your preferred diet schedule and message your coach for immediate review.
                  </p>
                  <button
                    onClick={() => {
                      setModalPlanType('Diet Plan');
                      setIsModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-[#F97316] text-white font-bold rounded-xl text-sm hover:bg-[#EA580C] transition-colors"
                  >
                    Enter Diet Plan Manually
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXERCISE VIDEOS (YOUTUBE VIDEOS) */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 via-orange-50 to-white border border-red-200/70 rounded-3xl p-6 md:p-7 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
                        <Video size={18} />
                      </span>
                      <h3 className="text-xl md:text-2xl font-black text-[#292524]">Gym Exercise Videos (YouTube)</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        YouTube Tutorials
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#78716C] max-w-2xl leading-relaxed">
                      Watch instructional workout videos with step-by-step technique tips in both <strong className="text-emerald-700">Tamil (தமிழ்)</strong> and <strong className="text-blue-700">English</strong>.
                    </p>
                  </div>

                  {/* Language Selector */}
                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-stone-200 shadow-xs shrink-0">
                    <Globe size={15} className="text-[#F97316] ml-2 shrink-0" />
                    {(['All', 'Tamil', 'English'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setYoutubeLanguage(lang)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          youtubeLanguage === lang
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-[#78716C] hover:text-[#292524] hover:bg-stone-100'
                        }`}
                      >
                        {lang === 'Tamil' ? 'தமிழ் (Tamil)' : lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories & Search */}
                <div className="mt-5 pt-4 border-t border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                    <Filter size={14} className="text-[#78716C] shrink-0" />
                    <span className="text-xs font-bold text-[#78716C] uppercase mr-1 shrink-0">Muscle:</span>
                    {youtubeCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setYoutubeCategory(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          youtubeCategory === cat
                            ? 'bg-[#292524] text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-[#78716C] hover:border-[#F97316] hover:text-[#F97316]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search box */}
                  <div className="relative w-full md:w-64 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                    <input
                      type="text"
                      placeholder="Search YouTube videos..."
                      value={youtubeSearch}
                      onChange={e => setYoutubeSearch(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#292524] focus:outline-none focus:border-red-500"
                    />
                    {youtubeSearch && (
                      <button onClick={() => setYoutubeSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Coach Assigned Videos Banner if any */}
              {assignedVideos.length > 0 && (
                <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#EA580C] font-bold text-sm">
                      <Sparkles size={16} />
                      <span>Assigned by Coach ({assignedVideos.length})</span>
                    </div>
                    <span className="text-xs text-[#78716C]">Personalized routines assigned directly to you</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assignedVideos.map((v: any) => {
                      const ytId = extractYouTubeId(v.videoUrl || '');
                      return (
                        <div key={v._id} className="bg-white border border-orange-200 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between">
                          <div
                            className="relative aspect-video bg-black overflow-hidden cursor-pointer group"
                            onClick={() => {
                              if (ytId) {
                                setActiveYoutubeVideo({
                                  id: v._id,
                                  title: v.title || v.exerciseName,
                                  language: 'English',
                                  category: 'Chest',
                                  youtubeId: ytId,
                                  duration: v.duration || '10:00',
                                  targetMuscle: v.exerciseName || 'Target Muscle',
                                  equipment: 'Gym Equipment',
                                  level: (v.difficultyLevel as any) || 'Intermediate',
                                  description: v.instructions || 'Coach assigned video demonstration.',
                                  tips: ['Follow coach recommendations carefully.', 'Maintain steady breathing tempo.', 'Focus on form control.']
                                });
                              } else {
                                setActiveYoutubeVideo({
                                  id: v._id,
                                  title: v.title || v.exerciseName,
                                  language: 'English',
                                  category: 'Chest',
                                  youtubeId: 'rT7DgCr-3pg', // Fallback high-quality bench guide
                                  duration: v.duration || '10:00',
                                  targetMuscle: v.exerciseName || 'Form Tutorial',
                                  equipment: 'Gym Equipment',
                                  level: (v.difficultyLevel as any) || 'Intermediate',
                                  description: v.instructions || 'Coach assigned exercise video tutorial.',
                                  tips: ['Warm up thoroughly before loading weights.', 'Control the eccentric cadence.', 'Lock out smoothly.']
                                });
                              }
                            }}
                          >
                            <img
                              src={ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'}
                              alt={v.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play size={20} className="ml-1 fill-white" />
                              </div>
                            </div>
                            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              {v.duration || 'Video'}
                            </span>
                          </div>
                          <div className="p-3.5 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-[#EA580C] bg-orange-100 px-2 py-0.5 rounded-full">
                              Coach Assigned
                            </span>
                            <h4 className="font-bold text-sm text-[#292524] line-clamp-1">{v.title || v.exerciseName}</h4>
                            <p className="text-xs text-[#78716C] line-clamp-2">{v.instructions || 'Watch and follow coach technique guide.'}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Grid of YouTube Workout Videos */}
              {filteredYoutubeVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredYoutubeVideos.map(video => (
                    <div
                      key={video.id}
                      className="bg-white border border-[#E7E5E4] rounded-3xl overflow-hidden hover:border-red-400/60 hover:shadow-lg transition-all flex flex-col justify-between group shadow-xs"
                    >
                      {/* Video Thumbnail */}
                      <div
                        className="relative aspect-video bg-black overflow-hidden cursor-pointer"
                        onClick={() => setActiveYoutubeVideo(video)}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                          onError={e => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play size={22} className="ml-1 fill-white" />
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute bottom-2.5 right-2.5 bg-black/85 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock size={11} /> {video.duration}
                        </div>

                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-xs ${
                            video.language === 'Tamil' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                          }`}>
                            {video.language === 'Tamil' ? 'தமிழ் (Tamil)' : 'English'}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-xs">
                            {video.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-[#78716C] border border-stone-200">
                              {video.category}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              {video.level}
                            </span>
                          </div>

                          <h4
                            onClick={() => setActiveYoutubeVideo(video)}
                            className="font-bold text-base text-[#292524] line-clamp-2 group-hover:text-red-600 transition-colors cursor-pointer"
                          >
                            {video.title}
                          </h4>
                          {video.titleTamil && (
                            <p className="text-xs font-semibold text-[#F97316] mt-0.5 line-clamp-1">{video.titleTamil}</p>
                          )}
                          <p className="text-xs text-[#78716C] line-clamp-2 mt-2 leading-relaxed">
                            {video.language === 'Tamil' && video.descriptionTamil ? video.descriptionTamil : video.description}
                          </p>
                        </div>

                        {/* Footer Specs & Action */}
                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-xs text-[#78716C] truncate max-w-[150px] font-medium" title={video.targetMuscle}>
                            {video.targetMuscle.split(',')[0]}
                          </span>
                          <button
                            onClick={() => setActiveYoutubeVideo(video)}
                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play size={12} className="fill-current" />
                            <span>Watch YouTube Video</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-dashed border-[#E7E5E4] rounded-3xl p-8 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mx-auto">
                    <Video size={28} />
                  </div>
                  <h3 className="font-bold text-xl text-[#292524]">No YouTube Videos Found</h3>
                  <p className="text-sm text-[#78716C]">Try clearing search or changing your muscle/language filters.</p>
                  <button
                    onClick={() => {
                      setYoutubeSearch('');
                      setYoutubeLanguage('All');
                      setYoutubeCategory('All');
                    }}
                    className="px-5 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXERCISE LIBRARY (ANIMATED VIDEOS) */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-white border border-orange-200/80 rounded-3xl p-6 md:p-7 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-8 h-8 rounded-xl bg-[#F97316] text-white flex items-center justify-center shadow-md">
                        <BookOpen size={18} />
                      </span>
                      <h3 className="text-xl md:text-2xl font-black text-[#292524]">Animated Exercise Library</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#EA580C]">
                        Biomechanical 3D/2D Animations
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#78716C] max-w-2xl leading-relaxed">
                      Interactive procedural animated workout demonstrations showing proper posture, execution angles, and exact muscle contractions.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setModalPlanType('Exercise Library');
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2.5 bg-white border border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white font-bold rounded-2xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                  >
                    <Plus size={15} />
                    <span>Request Exercise from Coach</span>
                  </button>
                </div>

                {/* Categories & Search */}
                <div className="mt-5 pt-4 border-t border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                    <Filter size={14} className="text-[#78716C] shrink-0" />
                    <span className="text-xs font-bold text-[#78716C] uppercase mr-1 shrink-0">Muscle:</span>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setLibraryCategory(cat)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          libraryCategory === cat
                            ? 'bg-[#F97316] text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-[#78716C] hover:border-[#F97316] hover:text-[#F97316]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search box */}
                  <div className="relative w-full md:w-64 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                    <input
                      type="text"
                      placeholder="Search animated exercises..."
                      value={librarySearch}
                      onChange={e => setLibrarySearch(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#292524] focus:outline-none focus:border-[#F97316]"
                    />
                    {librarySearch && (
                      <button onClick={() => setLibrarySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Pending Requests Alert */}
              {pendingLibraryRequests.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <Clock size={16} />
                    <span>Pending Trainer Approval ({pendingLibraryRequests.length})</span>
                  </div>
                  {pendingLibraryRequests.map(req => (
                    <div key={req._id} className="bg-white p-4 rounded-xl border border-amber-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#292524] text-base">{req.title}</h4>
                          <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                            Awaiting Trainer Approval
                          </span>
                        </div>
                        <p className="text-xs text-[#78716C] mt-1">
                          Sent to Coach <strong>{req.trainerId?.name || req.trainerId?.firstName || 'Trainer'}</strong>: &ldquo;{req.customerMessage}&rdquo;
                        </p>
                      </div>
                      <span className="text-xs text-amber-700 bg-amber-100/50 px-3 py-1.5 rounded-lg font-medium shrink-0">
                        Approval in progress
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Grid of Animated Exercise Cards */}
              {filteredExercises.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExercises.map((ex: any, idx: number) => {
                    const isApprovedReq = approvedLibraryRequests.find(
                      (r: any) => r.title?.toLowerCase().trim() === ex.name?.toLowerCase().trim()
                    );
                    return (
                      <div
                        key={ex._id || ex.id || idx}
                        className="bg-white border border-[#E7E5E4] rounded-3xl overflow-hidden hover:border-[#F97316]/60 hover:shadow-lg transition-all flex flex-col justify-between group shadow-xs"
                      >
                        {/* Animated Video Preview Screen */}
                        <div
                          className="relative aspect-video bg-stone-900 overflow-hidden cursor-pointer group"
                          onClick={() => setActiveAnimatedExercise(ex)}
                          title="Click to watch full animated exercise video"
                        >
                          <ExerciseVideoPlayer
                            exerciseName={ex.name}
                            category={ex.category}
                            targetMuscle={ex.targetMuscle}
                            animationType="animation"
                            compact={true}
                            autoPlay={true}
                            className="w-full h-full pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                          {/* Overlay Badges */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-xs">
                              {ex.category}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md text-white backdrop-blur-xs ${
                              ex.difficulty === 'Beginner' ? 'bg-emerald-600/90' : ex.difficulty === 'Intermediate' ? 'bg-amber-600/90' : 'bg-rose-600/90'
                            }`}>
                              {ex.difficulty || 'All Levels'}
                            </span>
                          </div>

                          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
                            {isApprovedReq && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                                <CheckCircle2 size={11} /> Approved
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F97316] text-white flex items-center gap-1 shadow-xs">
                              <Sparkles size={11} /> Animated
                            </span>
                          </div>

                          <div className="absolute bottom-2.5 right-2.5 z-10">
                            <div className="w-9 h-9 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                              <Play size={16} className="ml-0.5 fill-white" />
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-[#F97316] font-bold uppercase tracking-wider">{ex.category}</span>
                              <span className="text-xs text-[#78716C] font-semibold">{ex.targetMuscle}</span>
                            </div>

                            <h4
                              onClick={() => setActiveAnimatedExercise(ex)}
                              className="font-extrabold text-lg text-[#292524] group-hover:text-[#F97316] transition-colors cursor-pointer"
                            >
                              {ex.name}
                            </h4>

                            <p className="text-xs text-[#78716C] line-clamp-2 mt-1.5 leading-relaxed">
                              {ex.description || ex.instructions}
                            </p>

                            {/* Sets & Reps specs */}
                            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-[#F9F8F6] rounded-xl border border-[#E7E5E4] text-center mt-3">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-[#78716C] block">Sets</span>
                                <span className="text-xs font-black text-[#292524]">{ex.defaultSets || 3} sets</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-[#78716C] block">Reps</span>
                                <span className="text-xs font-black text-[#292524]">{ex.defaultRepetitions || 12} reps</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-[#78716C] block">Rest</span>
                                <span className="text-xs font-black text-[#292524]">{ex.defaultRest || 45}s</span>
                              </div>
                            </div>

                            {/* Coach Feedback if approved */}
                            {isApprovedReq?.trainerFeedback && (
                              <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-xs text-emerald-900 mt-2.5 italic">
                                <strong>Coach Note:</strong> &ldquo;{isApprovedReq.trainerFeedback}&rdquo;
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                            <span className="text-xs text-[#78716C] font-medium truncate max-w-[150px]">{ex.equipment || 'Gym Equipment'}</span>
                            <button
                              onClick={() => setActiveAnimatedExercise(ex)}
                              className="px-4 py-1.5 bg-orange-50 hover:bg-[#F97316] text-[#EA580C] hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Play size={12} className="fill-current" />
                              <span>Watch Animated Guide</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-dashed border-[#E7E5E4] rounded-3xl p-8 space-y-4 max-w-lg mx-auto">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-[#F97316] mx-auto">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="font-bold text-xl text-[#292524]">No Animated Exercises Found</h3>
                  <p className="text-sm text-[#78716C]">Try resetting your search query or category filters.</p>
                  <button
                    onClick={() => {
                      setLibrarySearch('');
                      setLibraryCategory('All');
                    }}
                    className="px-5 py-2 bg-[#F97316] text-white font-bold rounded-xl text-xs hover:bg-[#EA580C] transition cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GYM EQUIPMENTS */}
          {activeTab === 'equipments' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border-2 border-emerald-300 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                    <ShieldCheck size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-emerald-700" /> Trainer Verified & Approved
                      </span>
                      <span className="text-xs text-[#78716C]">
                        {approvedEquipments.length} Approved Available Machines & Weights
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-[#292524] mt-1">
                      Gym Equipments & Machines
                    </h2>
                    <p className="text-xs text-[#78716C] mt-1">
                      These equipments have been checked and approved by your certified gym trainers for safe and effective member workouts.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-emerald-900 bg-white/80 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs">
                    Ready for Workout
                  </span>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-[#E7E5E4] shadow-xs">
                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                  {equipmentCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setEquipmentCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                        equipmentCategory === cat
                          ? 'bg-[#F97316] text-white'
                          : 'bg-stone-100 text-[#78716C] hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search equipment or brand..."
                    value={equipmentSearch}
                    onChange={e => setEquipmentSearch(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              {/* Equipments Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEquipments.map((eq: any, idx: number) => {
                  const isApproved = Boolean(eq.isApproved);
                  return (
                    <div
                      key={eq._id || eq.id || idx}
                      className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                        isApproved ? 'border-emerald-200 ring-1 ring-emerald-500/15' : 'border-[#E7E5E4]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-[#EA580C]">
                            {eq.category || 'Gym Equipment'}
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-700" /> Trainer Approved
                          </span>
                        </div>

                        <h4 className="font-extrabold text-lg text-[#292524] mb-1">
                          {eq.name}
                        </h4>
                        {eq.brand && (
                          <p className="text-xs font-semibold text-[#78716C] mb-3">
                            Brand: <span className="text-[#292524]">{eq.brand}</span>
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 bg-[#F9F8F6] p-3 rounded-2xl border border-[#E7E5E4] text-xs mb-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#78716C] block">Units</span>
                            <strong className="text-[#292524]">{eq.quantity || 1} Available</strong>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#78716C] block">Condition</span>
                            <span className="font-semibold text-emerald-700">{eq.condition || 'Good'}</span>
                          </div>
                        </div>

                        <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[11px]">
                            <ShieldCheck size={14} className="text-emerald-600" />
                            <span>Verified by Coach {eq.approvedByName || 'Trainer'}</span>
                          </div>
                          <p className="text-[11px] text-emerald-800/80">
                            Safe for all fitness levels. Please wipe down after workout and re-rack weights properly.
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-stone-500 font-semibold">Status: <strong className="text-emerald-700 font-bold">Active in Gym</strong></span>
                        <span className="text-[11px] text-stone-400">
                          {eq.approvedAt ? new Date(eq.approvedAt).toLocaleDateString() : 'Active'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredEquipments.length === 0 && (
                <div className="bg-white border border-[#E7E5E4] rounded-3xl p-12 text-center">
                  <Wrench size={44} className="mx-auto text-stone-400 mb-3" />
                  <h4 className="font-bold text-base text-stone-800">
                    {approvedEquipments.length === 0 ? 'Equipment Verification in Progress' : 'No matching equipment'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    {approvedEquipments.length === 0
                      ? 'Your certified gym trainers are currently verifying gym machinery and equipment. Once approved, they will automatically show here.'
                      : 'Try selecting a different category or clearing your search term.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* ENTER MANUALLY MODAL                                         */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E7E5E4] shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F5F5F4] pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <h3 className="font-black text-xl text-[#292524]">Enter Plan Manually</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {submissionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{submissionSuccess}</span>
              </div>
            )}

            {submissionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{submissionError}</span>
              </div>
            )}

            <form onSubmit={handleManualPlanSubmit} className="space-y-5">
              {/* Plan Type Selector */}
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase mb-2">Select Plan Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Workout Plan', 'Diet Plan'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setModalPlanType(type)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        modalPlanType === type
                          ? 'bg-[#F97316] border-[#F97316] text-white shadow-xs'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Trainer */}
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase mb-1.5">Select Trainer</label>
                <select
                  value={selectedTrainerId}
                  onChange={e => setSelectedTrainerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-[#292524] focus:outline-none focus:border-[#F97316]"
                  required
                >
                  <option value="">-- Choose Coach for Approval --</option>
                  {availableTrainers.map(tr => (
                    <option key={tr._id} value={tr._id}>
                      {tr.firstName ? `${tr.firstName} ${tr.lastName || ''}`.trim() : tr.name || 'Certified Trainer'} {tr.specialization ? `(${tr.specialization})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase mb-1">Plan Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4-Day Hypertrophy Split"
                    value={planTitle}
                    onChange={e => setPlanTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase mb-1">Primary Goal</label>
                  <input
                    type="text"
                    placeholder="e.g. Muscle Gain / Fat Loss"
                    value={planGoal}
                    onChange={e => setPlanGoal(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              {/* Workout Details Preview/Input if Workout Plan */}
              {modalPlanType === 'Workout Plan' && (
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292524] uppercase">Workout Days & Exercises</span>
                    <button
                      type="button"
                      onClick={() => setWorkoutDays(prev => [
                        ...prev,
                        { dayName: `Day ${prev.length + 1} - Routine`, focus: 'Full Body', exercises: [{ name: 'Squats', sets: 3, reps: '12', duration: 60, rest: '60s', notes: '' }] }
                      ])}
                      className="text-xs font-bold text-[#F97316] hover:underline"
                    >
                      + Add Day
                    </button>
                  </div>

                  {workoutDays.map((d, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={d.dayName}
                          onChange={e => {
                            const val = e.target.value;
                            setWorkoutDays(prev => prev.map((x, i) => i === idx ? { ...x, dayName: val } : x));
                          }}
                          className="font-bold text-xs px-2 py-1 bg-stone-50 border border-stone-200 rounded flex-1"
                        />
                        <input
                          type="text"
                          value={d.focus}
                          onChange={e => {
                            const val = e.target.value;
                            setWorkoutDays(prev => prev.map((x, i) => i === idx ? { ...x, focus: val } : x));
                          }}
                          placeholder="Focus (e.g. Chest)"
                          className="text-xs px-2 py-1 bg-stone-50 border border-stone-200 rounded w-1/3"
                        />
                      </div>

                      {/* Exercises in day */}
                      <div className="space-y-1.5 pl-2">
                        {d.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="grid grid-cols-4 gap-1 text-[11px]">
                            <input
                              type="text"
                              value={ex.name}
                              onChange={e => {
                                const val = e.target.value;
                                setWorkoutDays(prev => prev.map((x, i) => i === idx ? {
                                  ...x,
                                  exercises: x.exercises.map((y, yi) => yi === exIdx ? { ...y, name: val } : y)
                                } : x));
                              }}
                              className="col-span-2 px-1.5 py-0.5 bg-stone-50 border rounded"
                              placeholder="Exercise Name"
                            />
                            <input
                              type="number"
                              value={ex.sets}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setWorkoutDays(prev => prev.map((x, i) => i === idx ? {
                                  ...x,
                                  exercises: x.exercises.map((y, yi) => yi === exIdx ? { ...y, sets: val } : y)
                                } : x));
                              }}
                              className="px-1.5 py-0.5 bg-stone-50 border rounded"
                              placeholder="Sets"
                            />
                            <input
                              type="text"
                              value={ex.reps}
                              onChange={e => {
                                const val = e.target.value;
                                setWorkoutDays(prev => prev.map((x, i) => i === idx ? {
                                  ...x,
                                  exercises: x.exercises.map((y, yi) => yi === exIdx ? { ...y, reps: val } : y)
                                } : x));
                              }}
                              className="px-1.5 py-0.5 bg-stone-50 border rounded"
                              placeholder="Reps"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Diet Details Preview/Input if Diet Plan */}
              {modalPlanType === 'Diet Plan' && (
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase">Calories</label>
                      <input
                        type="text"
                        value={dailyCalories}
                        onChange={e => setDailyCalories(e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase">Protein</label>
                      <input
                        type="text"
                        value={proteinTarget}
                        onChange={e => setProteinTarget(e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase">Carbs</label>
                      <input
                        type="text"
                        value={carbsTarget}
                        onChange={e => setCarbsTarget(e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 uppercase">Hydration</label>
                      <input
                        type="text"
                        value={hydrationTarget}
                        onChange={e => setHydrationTarget(e.target.value)}
                        className="w-full text-xs px-2 py-1 bg-white border border-stone-200 rounded-lg font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    <span className="text-[11px] font-bold text-stone-700">Meals Schedule:</span>
                    {dietMeals.map((m, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-stone-200 flex flex-col gap-1 text-xs">
                        <div className="flex justify-between font-bold text-[#292524]">
                          <span>{m.mealName} ({m.time})</span>
                          <span className="text-[#F97316]">{m.calories}</span>
                        </div>
                        <input
                          type="text"
                          value={m.items}
                          onChange={e => {
                            const val = e.target.value;
                            setDietMeals(prev => prev.map((x, i) => i === idx ? { ...x, items: val } : x));
                          }}
                          className="px-2 py-1 bg-stone-50 border rounded text-[11px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message to Trainer */}
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase mb-1">
                  Message to Trainer <span className="text-[#F97316]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Hi Coach, please review this custom plan I prepared for my fitness journey and approve it for my dashboard..."
                  value={customerMessage}
                  onChange={e => setCustomerMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#F97316]"
                />
                <p className="text-[11px] text-[#78716C] mt-1">
                  This message will appear directly on your trainer&apos;s dashboard. Once they give approval, it will immediately become active on your dashboard.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5F5F4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-[#78716C] hover:bg-stone-50 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingManual ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Send to Trainer for Approval</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YouTube Video Player Modal */}
      {activeYoutubeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E7E5E4] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-[#E7E5E4] flex items-center justify-between bg-stone-50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-[#EA580C]">
                    {activeYoutubeVideo.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    activeYoutubeVideo.language === 'Tamil' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {activeYoutubeVideo.language === 'Tamil' ? 'தமிழ் (Tamil)' : 'English'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                    {activeYoutubeVideo.duration}
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#292524]">{activeYoutubeVideo.title}</h3>
                {activeYoutubeVideo.titleTamil && (
                  <p className="text-xs text-[#F97316] font-semibold">{activeYoutubeVideo.titleTamil}</p>
                )}
              </div>
              <button
                onClick={() => setActiveYoutubeVideo(null)}
                className="w-9 h-9 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition cursor-pointer shrink-0 ml-3"
              >
                <X size={18} />
              </button>
            </div>

            {/* YouTube Player Iframe */}
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeYoutubeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeYoutubeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video coaching details & tips */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#FFFDF8] p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[#78716C] block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-bold text-[#292524]">{activeYoutubeVideo.category}</span>
                </div>
                <div className="bg-[#FFFDF8] p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[#78716C] block text-[10px] uppercase font-bold">Difficulty</span>
                  <span className="font-bold text-[#292524]">{activeYoutubeVideo.level}</span>
                </div>
                <div className="bg-[#FFFDF8] p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[#78716C] block text-[10px] uppercase font-bold">Equipment</span>
                  <span className="font-bold text-[#292524] truncate block" title={activeYoutubeVideo.equipment}>{activeYoutubeVideo.equipment}</span>
                </div>
                <div className="bg-[#FFFDF8] p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[#78716C] block text-[10px] uppercase font-bold">Target Muscle</span>
                  <span className="font-bold text-[#292524] truncate block" title={activeYoutubeVideo.targetMuscle}>{activeYoutubeVideo.targetMuscle}</span>
                </div>
              </div>

              {activeYoutubeVideo.tips && activeYoutubeVideo.tips.length > 0 && (
                <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200 space-y-2">
                  <h4 className="font-bold text-xs text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} /> Certified Coaching Form Checklist
                  </h4>
                  <ul className="space-y-1.5 text-stone-700">
                    {activeYoutubeVideo.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-[#EA580C] mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveYoutubeVideo(null)}
                  className="px-5 py-2 bg-stone-800 hover:bg-black text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Close Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated Exercise Player Modal */}
      {activeAnimatedExercise && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E7E5E4] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-5 border-b border-[#E7E5E4] flex items-center justify-between bg-stone-50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-100 text-[#EA580C]">
                    {activeAnimatedExercise.category}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {activeAnimatedExercise.difficulty || 'All Levels'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <Sparkles size={11} /> Biomechanical Animation
                  </span>
                </div>
                <h3 className="font-black text-lg sm:text-xl text-[#292524]">{activeAnimatedExercise.name}</h3>
              </div>
              <button
                onClick={() => setActiveAnimatedExercise(null)}
                className="w-9 h-9 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition cursor-pointer shrink-0 ml-3"
              >
                <X size={18} />
              </button>
            </div>

            {/* Interactive Animated Video Player */}
            <div className="w-full bg-stone-900 border-b border-stone-200">
              <ExerciseVideoPlayer
                exerciseName={activeAnimatedExercise.name}
                category={activeAnimatedExercise.category}
                targetMuscle={activeAnimatedExercise.targetMuscle}
                animationType="animation"
                compact={false}
                autoPlay={true}
                duration={activeAnimatedExercise.defaultDuration || 60}
                className="w-full aspect-video rounded-none"
              />
            </div>

            {/* Details & Execution Instructions */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#FFFDF8] p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[#78716C] block text-[10px] uppercase font-bold">Target Muscle</span>
                  <span className="font-bold text-[#292524]">{activeAnimatedExercise.targetMuscle}</span>
                </div>
                <div className="bg-[#FFFDF8] p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[#78716C] block text-[10px] uppercase font-bold">Equipment</span>
                  <span className="font-bold text-[#292524]">{activeAnimatedExercise.equipment || 'Gym Equipment'}</span>
                </div>
                <div className="bg-[#FFFDF8] p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[#78716C] block text-[10px] uppercase font-bold">Recommended Sets</span>
                  <span className="font-bold text-[#292524]">{activeAnimatedExercise.defaultSets || 3} sets</span>
                </div>
                <div className="bg-[#FFFDF8] p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[#78716C] block text-[10px] uppercase font-bold">Reps & Rest</span>
                  <span className="font-bold text-[#292524]">{activeAnimatedExercise.defaultRepetitions || 12} reps • {activeAnimatedExercise.defaultRest || 45}s</span>
                </div>
              </div>

              {activeAnimatedExercise.description && (
                <div>
                  <h4 className="font-bold text-[#292524] uppercase tracking-wider text-[11px] mb-1">Exercise Overview</h4>
                  <p className="text-stone-600 leading-relaxed bg-[#FFFDF8] p-3 rounded-xl border border-stone-200">
                    {activeAnimatedExercise.description}
                  </p>
                </div>
              )}

              {activeAnimatedExercise.instructions && (
                <div>
                  <h4 className="font-bold text-[#292524] uppercase tracking-wider text-[11px] mb-1">Proper Form & Execution</h4>
                  <div className="text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200 whitespace-pre-line font-mono text-[11px]">
                    {activeAnimatedExercise.instructions}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveAnimatedExercise(null)}
                  className="px-5 py-2 bg-[#F97316] text-white font-bold rounded-xl text-xs hover:bg-[#EA580C] transition cursor-pointer"
                >
                  Close Animation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTrainerPlan;
