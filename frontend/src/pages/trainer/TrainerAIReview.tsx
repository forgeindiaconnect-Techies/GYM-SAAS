import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, FileEdit, Trash2, Plus, 
  AlertCircle, Clock, Dumbbell, Utensils, 
  HeartPulse, User, ShieldAlert, Sparkles, RefreshCw, 
  Check, ChevronDown, ChevronUp, Send, Flame, 
  Calendar, Coffee, Sun, Apple, Moon, Droplets
} from 'lucide-react';
import api from '../../utils/api';
import { 
  getUnifiedWeeklyWorkouts, 
  getUnifiedWeeklyDiet,
  type DayWorkout,
  type DayDiet
} from '../../utils/aiFitnessPlans';

const TrainerAIReview = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOriginalDraft, setShowOriginalDraft] = useState(false);

  // Active Selected Day for Workout & Diet
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string>('Monday');
  const [selectedDietDay, setSelectedDietDay] = useState<string>('Monday');

  // Full 7-Day Workout & Diet states (Monday – Sunday)
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<Record<string, DayWorkout>>({});
  const [weeklyDiet, setWeeklyDiet] = useState<Record<string, DayDiet>>({});

  // Recovery Plan Structure
  const [recoveryStructure, setRecoveryStructure] = useState<any>({
    sleep: '7.5 – 8.5 hours uninterrupted sleep per night.',
    activeRecovery: '15–20 minutes walking or light mobility on rest days.',
    stretchingMobility: '10 mins dynamic warm-up and post-workout static stretches.',
    hydration: '3.5 - 4.0 Litres of pure water daily.'
  });

  // Trainer Specific additions
  const [trainerRecommendations, setTrainerRecommendations] = useState('');
  const [trainerNotes, setTrainerNotes] = useState('');

  // Exercise Replacement Quick Modal state
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Live modifications counter
  const [modificationCount, setModificationCount] = useState(0);

  useEffect(() => {
    fetchRecommendation();
  }, [customerId]);

  const fetchRecommendation = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/trainer/customer/${customerId}`);
      const data = res.data?.recommendation;
      setRecommendation(data);

      if (data) {
        // Automatically populate unified 7-day Monday to Sunday workout plan from AI output
        const unifiedWorkouts = getUnifiedWeeklyWorkouts(data);
        setWeeklyWorkouts(unifiedWorkouts);

        // Automatically populate unified 7-day Monday to Sunday diet plan from AI output
        const unifiedDiet = getUnifiedWeeklyDiet(data);
        setWeeklyDiet(unifiedDiet);

        // Pre-fill recovery recommendations
        const recovery = data.finalApprovedPlan?.recoveryPlan || data.recoveryRecommendations;
        if (recovery) {
          setRecoveryStructure({
            sleep: recovery.sleep || '7.5 – 8.5 hours uninterrupted sleep per night.',
            activeRecovery: recovery.activeRecovery || '15–20 minutes walking or light mobility on rest days.',
            stretchingMobility: recovery.stretchingMobility || '10 mins dynamic warm-up and post-workout static stretches.',
            hydration: recovery.hydration || '3.5 - 4.0 Litres of pure water daily.'
          });
        }

        setTrainerRecommendations(data.finalApprovedPlan?.trainerRecommendations || data.trainerRecommendations || '');
        setTrainerNotes(data.finalApprovedPlan?.trainerNotes || data.trainerNotes || '');
      }
    } catch (err) {
      console.error('Failed to fetch recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Workout Day Exercise Manipulation
  const updateExercise = (exerciseIdx: number, field: string, value: any) => {
    setWeeklyWorkouts(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedWorkoutDay] };
      const exList = [...currentDay.exercises];
      exList[exerciseIdx] = { ...exList[exerciseIdx], [field]: value };
      currentDay.exercises = exList;
      updated[selectedWorkoutDay] = currentDay;
      return updated;
    });
    setModificationCount(c => c + 1);
  };

  const removeExercise = (exerciseIdx: number) => {
    setWeeklyWorkouts(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedWorkoutDay] };
      const exList = [...currentDay.exercises];
      exList.splice(exerciseIdx, 1);
      currentDay.exercises = exList;
      updated[selectedWorkoutDay] = currentDay;
      return updated;
    });
    setModificationCount(c => c + 1);
  };

  const addExercise = () => {
    setWeeklyWorkouts(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedWorkoutDay] };
      currentDay.exercises = [
        ...currentDay.exercises,
        {
          name: 'Custom Exercise',
          sets: 3,
          reps: '10 - 12',
          duration: '10 mins',
          rest: '60s',
          difficulty: 'Beginner',
          targetMuscleGroup: currentDay.targetMuscle || 'Full Body',
          instructions: 'Perform exercise with controlled form and full range of motion.'
        }
      ];
      updated[selectedWorkoutDay] = currentDay;
      return updated;
    });
    setModificationCount(c => c + 1);
  };

  const replaceExerciseWith = (exerciseIdx: number, newName: string, targetMuscle: string) => {
    setWeeklyWorkouts(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedWorkoutDay] };
      const exList = [...currentDay.exercises];
      exList[exerciseIdx] = {
        ...exList[exerciseIdx],
        name: newName,
        targetMuscleGroup: targetMuscle
      };
      currentDay.exercises = exList;
      updated[selectedWorkoutDay] = currentDay;
      return updated;
    });
    setReplacingIndex(null);
    setModificationCount(c => c + 1);
  };

  // Diet Day Manipulation
  const updateDietField = (field: string, value: any) => {
    setWeeklyDiet(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedDietDay] };
      (currentDay as any)[field] = value;
      updated[selectedDietDay] = currentDay;
      return updated;
    });
    setModificationCount(c => c + 1);
  };

  const updateDietMacro = (macroField: 'protein' | 'carbs' | 'fats', value: string) => {
    setWeeklyDiet(prev => {
      const updated = { ...prev };
      const currentDay = { ...updated[selectedDietDay] };
      currentDay.macros = {
        ...currentDay.macros,
        [macroField]: value
      };
      updated[selectedDietDay] = currentDay;
      return updated;
    });
    setModificationCount(c => c + 1);
  };

  // Build Payload helper for submitting to backend
  const buildPayload = (actionType: 'APPROVE_AND_PUBLISH' | 'EDIT_AND_APPROVE') => {
    const weeklySchedule = Object.values(weeklyWorkouts).map(w => ({
      day: w.day,
      focus: w.focus,
      duration: w.duration,
      targetMuscle: w.targetMuscle,
      exercises: w.exercises
    }));

    // Flatten all exercises for backend indexing & compatibility
    const allExercises = Object.values(weeklyWorkouts).flatMap(w => w.exercises);

    const dailyMealPlans = Object.values(weeklyDiet).map(d => ({
      day: d.day,
      focus: d.focus,
      calories: d.calories,
      macros: d.macros,
      morning: d.morning,
      breakfast: d.breakfast,
      midMorning: d.midMorning,
      lunch: d.lunch,
      evening: d.evening,
      dinner: d.dinner
    }));

    return {
      action: actionType,
      hasModifications: actionType === 'EDIT_AND_APPROVE',
      workoutRecommendation: {
        weeklySchedule,
        exercises: allExercises
      },
      dietRecommendation: {
        dailyMealPlans,
        morning: weeklyDiet.Monday?.morning || '',
        breakfast: weeklyDiet.Monday?.breakfast || '',
        lunch: weeklyDiet.Monday?.lunch || '',
        dinner: weeklyDiet.Monday?.dinner || '',
        hydration: recoveryStructure.hydration || '3.5 - 4.0 Litres of pure water daily'
      },
      recoveryRecommendations: recoveryStructure,
      routine: recommendation.routine,
      progressSuggestions: recommendation.progressSuggestions,
      trainerRecommendations: trainerRecommendations || '',
      trainerNotes: trainerNotes || '',
      status: 'Trainer Approved'
    };
  };

  // ACTION 1: Approve & Publish (Approve AI output directly)
  const handleApproveWithoutChanges = async () => {
    const confirmApprove = window.confirm(
      'Approve and publish the AI-generated 7-day fitness & diet plan directly to the customer dashboard?'
    );
    if (!confirmApprove) return;

    setSaving(true);
    try {
      const payload = buildPayload('APPROVE_AND_PUBLISH');
      await api.put(`/ai/trainer/recommendation/${recommendation._id}/review`, payload);
      alert('Plan successfully approved as AI draft and published to customer!');
      navigate('/trainer/ai-assistant');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to approve plan.');
    } finally {
      setSaving(false);
    }
  };

  // ACTION 2: Edit & Approve (Save modifications separately & approve)
  const handleEditAndApprove = async () => {
    setSaving(true);
    try {
      const payload = buildPayload('EDIT_AND_APPROVE');
      await api.put(`/ai/trainer/recommendation/${recommendation._id}/review`, payload);
      alert('Trainer calibrations saved! Approved 7-day plan published to customer dashboard.');
      navigate('/trainer/ai-assistant');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save calibrations.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-[#64748B]">
        <div className="w-10 h-10 border-4 border-[#FDBA74] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="font-semibold text-sm">Loading client assessment and AI output...</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#111827]">AI Plan Not Found</h2>
        <p className="text-sm text-[#64748B] mt-1">This customer has not submitted a fitness assessment yet.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2.5 bg-[#C2410C] text-white font-bold rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const profile = recommendation.fitnessProfile || {};
  const measurements = profile.bodyMeasurements || {};
  const isApproved = recommendation.status === 'Trainer Approved' || recommendation.status === 'Published to Customer';

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const activeWorkoutDayData = weeklyWorkouts[selectedWorkoutDay] || weeklyWorkouts.Monday || {
    day: selectedWorkoutDay,
    focus: 'General Conditioning',
    duration: '45 mins',
    targetMuscle: 'Full Body',
    exercises: []
  };

  const activeDietDayData = weeklyDiet[selectedDietDay] || weeklyDiet.Monday || {
    day: selectedDietDay,
    focus: 'Balanced Nutrition',
    calories: 2150,
    macros: { protein: '150g', carbs: '200g', fats: '60g' },
    morning: '',
    breakfast: '',
    midMorning: '',
    lunch: '',
    evening: '',
    dinner: ''
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F8FAFC] pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-xs font-bold text-[#64748B] hover:text-[#C2410C] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Client List
        </button>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isApproved 
              ? 'bg-[#F8FAFC] text-[#EA580C] border-[#E2E8F0]' 
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            {isApproved ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            Status: {recommendation.status} (v{recommendation.version || 1})
          </span>

          {modificationCount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#F8FAFC] text-[#9A3412] border border-[#E2E8F0]">
              ✏️ {modificationCount} Trainer Edit(s)
            </span>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-2xl flex items-center justify-center text-[#FFFFFF] font-bold font-black text-xl shadow-md">
            {profile.fullName?.[0] || 'R'}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Review &amp; Calibrate: {profile.fullName || 'Renugopal Y'}
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Review AI analysis draft, calibrate exercise sets/reps, adjust nutrition, and approve official customer plan.
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleApproveWithoutChanges}
            disabled={saving}
            className="px-5 py-2.5 bg-[#FFFFFF] border-2 border-[#E2E8F0] text-[#EA580C] hover:bg-[#FFF7ED] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Approve the original AI-generated output as the official plan without modifications"
          >
            <Check size={16} /> Approve &amp; Publish (No Changes)
          </button>

          <button
            onClick={handleEditAndApprove}
            disabled={saving}
            className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-900/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Save your exercise and nutrition modifications separately and approve as official plan"
          >
            <Send size={16} /> Edit &amp; Approve
          </button>
        </div>
      </div>

      {/* CARD 1: Customer Information & Assessment Details */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#F8FAFC] pb-3">
          <div className="flex items-center gap-2">
            <User size={20} className="text-[#EA580C]" />
            <h2 className="text-lg font-bold text-[#111827]">Customer Information &amp; Assessment</h2>
          </div>
          <span className="text-xs font-semibold text-[#64748B]">
            Goal: <strong className="text-[#EA580C]">{profile.fitnessGoal || 'Weight Loss'}</strong>
          </span>
        </div>

        {/* Grid of Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 bg-[#F8FAFC] border border-[#F8FAFC] rounded-xl">
            <span className="text-[#64748B] uppercase font-bold block text-[10px]">Age</span>
            <strong className="text-[#111827] text-sm">{profile.age || '28'} yrs</strong>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#F8FAFC] rounded-xl">
            <span className="text-[#64748B] uppercase font-bold block text-[10px]">Gender</span>
            <strong className="text-[#111827] text-sm">{profile.gender || 'Male'}</strong>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#F8FAFC] rounded-xl">
            <span className="text-[#64748B] uppercase font-bold block text-[10px]">Height / Weight</span>
            <strong className="text-[#111827] text-sm">{profile.height || '180'} cm / {profile.weight || '85'} kg</strong>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#F8FAFC] rounded-xl">
            <span className="text-[#64748B] uppercase font-bold block text-[10px]">Level</span>
            <strong className="text-[#111827] text-sm">{profile.currentFitnessLevel || profile.experienceLevel || 'Beginner'}</strong>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#F8FAFC] rounded-xl">
            <span className="text-[#64748B] uppercase font-bold block text-[10px]">Target Days</span>
            <strong className="text-[#111827] text-sm">{profile.availableWorkoutDays || '4 Days'}</strong>
          </div>
          <div className="p-3 bg-[#F8FAFC] border border-[#F8FAFC] rounded-xl">
            <span className="text-[#64748B] uppercase font-bold block text-[10px]">Equipment</span>
            <strong className="text-[#111827] text-sm truncate">{profile.equipmentAvailability || 'Full Commercial Gym'}</strong>
          </div>
        </div>

        {/* Body Measurements Snapshot */}
        {measurements && Object.keys(measurements).length > 0 && (
          <div className="p-3 bg-[#F8FAFC] rounded-xl text-xs flex flex-wrap items-center gap-3 border border-[#F8FAFC]/60">
            <span className="font-bold text-[#64748B] uppercase text-[11px]">Logged Body Measurements:</span>
            {Object.entries(measurements).map(([k, v]: any) => (
              <span key={k} className="bg-[#FFFFFF] px-2.5 py-1 rounded-lg border border-[#F8FAFC] text-[#111827]">
                {k}: <strong>{v}</strong>
              </span>
            ))}
          </div>
        )}

        {/* Health considerations alert */}
        {profile.injuries && profile.injuries !== 'None' && (
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#EA580C] flex items-center gap-2">
            <ShieldAlert size={16} className="text-[#EA580C] shrink-0" />
            <span>
              <strong>Reported Injury / Medical Note:</strong> {profile.injuries}. Screen exercises below to avoid joint irritation.
            </span>
          </div>
        )}
      </div>

      {/* CARD 2: AI Generated Analysis & Calorie Targets */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#F8FAFC] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#EA580C]" />
            <h2 className="text-lg font-bold text-[#111827]">AI Generated Assessment &amp; Health Analysis</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F8FAFC] text-[#EA580C]">
              AI Output Reference
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowOriginalDraft(!showOriginalDraft)}
            className="text-xs font-bold text-[#EA580C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            {showOriginalDraft ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showOriginalDraft ? 'Hide Deep AI Insights' : 'View Full AI Insights'}
          </button>
        </div>

        <div className="p-4 bg-gradient-to-r from-[#F8FAFC] to-[#F8FAFC] border border-[#F8FAFC] rounded-2xl text-xs text-[#111827] leading-relaxed">
          <strong className="text-[#EA580C] uppercase tracking-wide block mb-1">AI Clinical Assessment:</strong>
          {recommendation.aiAnalysis?.assessment || 
           `Client presents with primary goal of ${profile.fitnessGoal || 'Weight Loss'} at ${profile.currentFitnessLevel || 'Beginner'} experience level. A calibrated 7-day routine focusing on progressive overload, moderate volume, and balanced nutrition is recommended.`}
        </div>

        {showOriginalDraft && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            <div className="p-4 bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl space-y-2 text-xs">
              <strong className="text-[#EA580C] block uppercase tracking-wider text-[11px]">AI Goal &amp; Kinetic Analysis</strong>
              <p className="text-[#64748B] leading-relaxed">
                {recommendation.aiAnalysis?.goalAnalysis || 
                 'Structured caloric deficit with resistance training to maximize lean mass retention while accelerating metabolic expenditure.'}
              </p>
            </div>
            <div className="p-4 bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl space-y-2 text-xs">
              <strong className="text-[#EA580C] block uppercase tracking-wider text-[11px]">Recommended Training Approach</strong>
              <p className="text-[#64748B] leading-relaxed">
                {recommendation.aiAnalysis?.recommendedApproach || 
                 'Periodized 7-day schedule with dedicated hypertrophy, lower-body core stability, active recovery, and mobility restoration sessions.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CARD 3: AI-Generated 7-Day Workout Routine (Monday – Sunday) */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F8FAFC] pb-4">
          <div className="flex items-center gap-2">
            <Dumbbell size={22} className="text-[#EA580C]" />
            <div>
              <h2 className="text-xl font-bold text-[#111827]">
                AI Workout Plan (Monday – Sunday)
              </h2>
              <p className="text-xs text-[#64748B]">
                Calibrate sets, reps, and exercise selection for each day from Monday to Sunday.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addExercise}
            className="px-4 py-2 bg-[#C2410C] hover:bg-[#FFF7ED] text-[#FFFFFF] font-bold rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus size={14} /> Add Exercise to {selectedWorkoutDay}
          </button>
        </div>

        {/* Day Selector Tabs (Monday to Sunday) */}
        <div className="bg-[#F8FAFC] border border-[#F8FAFC] rounded-2xl p-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {daysOfWeek.map((day) => {
              const isActive = selectedWorkoutDay === day;
              const dayData = weeklyWorkouts[day];
              const exCount = dayData?.exercises?.length || 0;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedWorkoutDay(day)}
                  className={`flex flex-col items-center justify-center min-w-[105px] sm:min-w-[125px] px-3.5 py-2 rounded-xl transition-all shrink-0 text-center cursor-pointer ${
                    isActive
                      ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 font-bold scale-[1.02]'
                      : 'bg-[#FFFFFF] text-[#64748B] hover:bg-[#FFF7ED] hover:text-[#EA580C] border border-[#F8FAFC]/60 font-semibold'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-extrabold">{day}</span>
                  <span className={`text-[10px] mt-0.5 ${isActive ? 'text-white/90' : 'text-[#64748B]'}`}>
                    {exCount} Exercises
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Focus & Info Card */}
        <div className="p-4 bg-[#F8FAFC] border border-[#F8FAFC] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-[#111827]">{selectedWorkoutDay} Split:</span>
              <span className="font-extrabold text-[#EA580C]">{activeWorkoutDayData.focus}</span>
            </div>
            <p className="text-[#64748B] mt-0.5">
              <strong>Target Muscle Focus:</strong> {activeWorkoutDayData.targetMuscle} • <strong>Duration:</strong> {activeWorkoutDayData.duration}
            </p>
          </div>

          <span className="px-3 py-1 bg-[#FFFFFF] border border-[#F8FAFC] text-[#111827] font-bold rounded-xl text-[11px] shrink-0 self-start md:self-auto">
            {activeWorkoutDayData.exercises.length} Exercises Calibrated
          </span>
        </div>

        {/* Exercises List for Selected Day */}
        <div className="space-y-3">
          {activeWorkoutDayData.exercises.length === 0 ? (
            <div className="p-8 text-center bg-[#F8FAFC] border border-dashed border-[#E2E8F0] rounded-2xl">
              <p className="text-xs font-semibold text-[#64748B]">No exercises configured for {selectedWorkoutDay}.</p>
              <button
                type="button"
                onClick={addExercise}
                className="mt-2 text-xs font-bold text-[#EA580C] hover:underline"
              >
                + Add an exercise
              </button>
            </div>
          ) : (
            activeWorkoutDayData.exercises.map((ex, idx) => (
              <div
                key={idx}
                className="border border-[#F8FAFC] bg-[#FFFFFF] rounded-2xl p-4 transition-all hover:shadow-xs space-y-3"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  {/* Exercise Index & Title */}
                  <div className="flex-1 w-full md:w-auto">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-lg bg-[#C2410C] text-white font-bold flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={ex.name}
                        onChange={e => updateExercise(idx, 'name', e.target.value)}
                        className="font-bold text-sm text-[#111827] bg-[#FFFFFF] border border-[#E2E8F0] px-3 py-1.5 rounded-lg w-full md:w-64 focus:border-[#FDBA74] outline-none"
                        placeholder="Exercise Name"
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#64748B] font-bold">Target Muscle:</span>
                      <input
                        type="text"
                        value={ex.targetMuscleGroup || ''}
                        onChange={e => updateExercise(idx, 'targetMuscleGroup', e.target.value)}
                        className="text-xs text-[#EA580C] bg-[#FFFFFF] border border-[#F8FAFC] px-2 py-0.5 rounded w-44"
                        placeholder="Muscle group"
                      />
                    </div>
                  </div>

                  {/* Sets, Reps, Rest, Difficulty Inputs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#64748B] block">Sets</label>
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={e => updateExercise(idx, 'sets', Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg font-bold text-[#111827] text-center"
                        min={1}
                        max={10}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#64748B] block">Reps</label>
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={e => updateExercise(idx, 'reps', e.target.value)}
                        className="w-20 px-2 py-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg font-bold text-[#111827] text-center"
                        placeholder="10 - 12"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#64748B] block">Rest</label>
                      <input
                        type="text"
                        value={ex.rest || '60s'}
                        onChange={e => updateExercise(idx, 'rest', e.target.value)}
                        className="w-16 px-2 py-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-[#111827] text-center font-medium"
                        placeholder="60s"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[#64748B] block">Difficulty</label>
                      <select
                        value={ex.difficulty || 'Beginner'}
                        onChange={e => updateExercise(idx, 'difficulty', e.target.value)}
                        className="px-2 py-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg text-xs"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions: Quick Replace & Remove */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setReplacingIndex(replacingIndex === idx ? null : idx)}
                      className="px-2.5 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] text-[#EA580C] rounded-lg text-xs font-semibold hover:bg-[#FFF7ED] cursor-pointer"
                      title="Replace unsuitable exercise with alternative"
                    >
                      <RefreshCw size={13} className="inline mr-1" /> Replace
                    </button>

                    <button
                      type="button"
                      onClick={() => removeExercise(idx)}
                      className="p-1.5 bg-[#FFFFFF] border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove exercise"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Preset Exercise Replacement Dropdown */}
                {replacingIndex === idx && (
                  <div className="pt-3 border-t border-[#F8FAFC] bg-[#F8FAFC] p-3 rounded-xl">
                    <p className="text-xs font-bold text-[#111827] mb-2">
                      Replace &quot;{ex.name}&quot; with approved gym alternative:
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {[
                        { name: 'Goblet Squats', muscle: 'Quads & Glutes' },
                        { name: 'Leg Press (Machine)', muscle: 'Quadriceps' },
                        { name: 'Dumbbell Bench Press', muscle: 'Pectorals & Triceps' },
                        { name: 'Incline Dumbbell Press', muscle: 'Upper Chest' },
                        { name: 'Seated Cable Row', muscle: 'Back & Lats' },
                        { name: 'Lat Pulldowns', muscle: 'Lats & Biceps' },
                        { name: 'Romanian Deadlifts', muscle: 'Hamstrings & Glutes' },
                        { name: 'Dumbbell Lateral Raises', muscle: 'Lateral Deltoids' },
                        { name: 'Cable Tricep Pushdown', muscle: 'Triceps' },
                        { name: 'Incline Dumbbell Curls', muscle: 'Biceps' }
                      ].map((sub, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => replaceExerciseWith(idx, sub.name, sub.muscle)}
                          className="px-2.5 py-1 bg-[#FFFFFF] border border-[#F8FAFC] rounded-lg hover:bg-[#C2410C] hover:text-[#FFFFFF] font-bold transition-colors cursor-pointer"
                        >
                          + {sub.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* CARD 4: AI-Generated 7-Day Diet & Nutrition Plan (Monday – Sunday) */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F8FAFC] pb-4">
          <div className="flex items-center gap-2">
            <Utensils size={22} className="text-[#EA580C]" />
            <div>
              <h2 className="text-xl font-bold text-[#111827]">
                AI Diet Plan (Monday – Sunday)
              </h2>
              <p className="text-xs text-[#64748B]">
                Review calorie targets, macro splits, and daily scheduled meal nutrition.
              </p>
            </div>
          </div>
        </div>

        {/* Diet Day Selector Tabs (Monday to Sunday) */}
        <div className="bg-[#F8FAFC] border border-[#F8FAFC] rounded-2xl p-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {daysOfWeek.map((day) => {
              const isActive = selectedDietDay === day;
              const dietData = weeklyDiet[day];
              const calories = dietData?.calories || 2150;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDietDay(day)}
                  className={`flex flex-col items-center justify-center min-w-[105px] sm:min-w-[125px] px-3.5 py-2 rounded-xl transition-all shrink-0 text-center cursor-pointer ${
                    isActive
                      ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15 font-bold scale-[1.02]'
                      : 'bg-[#FFFFFF] text-[#64748B] hover:bg-[#FFF7ED] hover:text-[#EA580C] border border-[#F8FAFC]/60 font-semibold'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-extrabold">{day}</span>
                  <span className={`text-[10px] mt-0.5 ${isActive ? 'text-white/90' : 'text-[#64748B]'}`}>
                    ~{calories} kcal
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Calorie & Macro Target Row */}
        <div className="p-4 bg-[#F8FAFC] border border-[#F8FAFC] rounded-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-sm text-[#111827]">
                {selectedDietDay} Nutrition Focus: <span className="text-[#EA580C]">{activeDietDayData.focus}</span>
              </h4>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-[#64748B]">Daily Calorie Target:</span>
              <input
                type="number"
                value={activeDietDayData.calories}
                onChange={e => updateDietField('calories', Number(e.target.value))}
                className="w-20 px-2 py-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg font-extrabold text-[#EA580C] text-center"
              />
              <span className="text-xs font-bold text-[#64748B]">kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-2.5 bg-[#FFFFFF] border border-[#F8FAFC] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[#64748B] text-[11px] uppercase">Protein</span>
              <input
                type="text"
                value={activeDietDayData.macros?.protein || '155g'}
                onChange={e => updateDietMacro('protein', e.target.value)}
                className="w-16 px-1.5 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-bold text-center text-[#111827]"
              />
            </div>

            <div className="p-2.5 bg-[#FFFFFF] border border-[#F8FAFC] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[#64748B] text-[11px] uppercase">Carbs</span>
              <input
                type="text"
                value={activeDietDayData.macros?.carbs || '210g'}
                onChange={e => updateDietMacro('carbs', e.target.value)}
                className="w-16 px-1.5 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-bold text-center text-[#111827]"
              />
            </div>

            <div className="p-2.5 bg-[#FFFFFF] border border-[#F8FAFC] rounded-xl flex items-center justify-between">
              <span className="font-bold text-[#64748B] text-[11px] uppercase">Fats</span>
              <input
                type="text"
                value={activeDietDayData.macros?.fats || '58g'}
                onChange={e => updateDietMacro('fats', e.target.value)}
                className="w-16 px-1.5 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded font-bold text-center text-[#111827]"
              />
            </div>
          </div>
        </div>

        {/* 6 Structured Meals for Selected Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Morning */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#F8FAFC] rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#EA580C]">
              <Sun size={15} />
              <span>Morning Hydration</span>
            </div>
            <textarea
              value={activeDietDayData.morning || ''}
              onChange={e => updateDietField('morning', e.target.value)}
              className="w-full p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#FDBA74] min-h-[65px] text-xs text-[#111827]"
              placeholder="e.g. Warm lemon water + soaked almonds"
            />
          </div>

          {/* Breakfast */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#F8FAFC] rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-700">
              <Coffee size={15} />
              <span>Breakfast</span>
            </div>
            <textarea
              value={activeDietDayData.breakfast || ''}
              onChange={e => updateDietField('breakfast', e.target.value)}
              className="w-full p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#FDBA74] min-h-[65px] text-xs text-[#111827]"
              placeholder="e.g. Oatmeal with whey protein & berries"
            />
          </div>

          {/* Mid-Morning */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#F8FAFC] rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#EA580C]">
              <Apple size={15} />
              <span>Mid-Morning Snack</span>
            </div>
            <textarea
              value={activeDietDayData.midMorning || ''}
              onChange={e => updateDietField('midMorning', e.target.value)}
              className="w-full p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#FDBA74] min-h-[65px] text-xs text-[#111827]"
              placeholder="e.g. Fresh seasonal fruit + green tea"
            />
          </div>

          {/* Lunch */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#F8FAFC] rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#EA580C]">
              <Utensils size={15} />
              <span>Lunch</span>
            </div>
            <textarea
              value={activeDietDayData.lunch || ''}
              onChange={e => updateDietField('lunch', e.target.value)}
              className="w-full p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#FDBA74] min-h-[65px] text-xs text-[#111827]"
              placeholder="e.g. Grilled chicken / paneer bowl with quinoa & salad"
            />
          </div>

          {/* Evening */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#F8FAFC] rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#EA580C]">
              <Flame size={15} />
              <span>Evening Snack</span>
            </div>
            <textarea
              value={activeDietDayData.evening || ''}
              onChange={e => updateDietField('evening', e.target.value)}
              className="w-full p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#FDBA74] min-h-[65px] text-xs text-[#111827]"
              placeholder="e.g. Sprouted salad or boiled eggs"
            />
          </div>

          {/* Dinner */}
          <div className="p-3.5 bg-[#F8FAFC] border border-[#F8FAFC] rounded-2xl space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-indigo-700">
              <Moon size={15} />
              <span>Dinner</span>
            </div>
            <textarea
              value={activeDietDayData.dinner || ''}
              onChange={e => updateDietField('dinner', e.target.value)}
              className="w-full p-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#FDBA74] min-h-[65px] text-xs text-[#111827]"
              placeholder="e.g. Steamed fish / grilled tofu with stir-fried greens"
            />
          </div>
        </div>
      </div>

      {/* CARD 5: Recovery, Sleep & Hydration Protocol */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F8FAFC] pb-3">
          <HeartPulse size={20} className="text-[#EA580C]" />
          <h2 className="text-lg font-bold text-[#111827]">AI Recovery &amp; Lifestyle Protocol</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#64748B] uppercase text-[10px] block mb-1">Nightly Sleep Target</label>
            <input
              type="text"
              value={recoveryStructure.sleep || ''}
              onChange={e => setRecoveryStructure({ ...recoveryStructure, sleep: e.target.value })}
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#FDBA74]"
            />
          </div>

          <div>
            <label className="font-bold text-[#64748B] uppercase text-[10px] block mb-1">Daily Hydration Target</label>
            <input
              type="text"
              value={recoveryStructure.hydration || ''}
              onChange={e => setRecoveryStructure({ ...recoveryStructure, hydration: e.target.value })}
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#FDBA74]"
            />
          </div>

          <div>
            <label className="font-bold text-[#64748B] uppercase text-[10px] block mb-1">Active Recovery Guidelines</label>
            <input
              type="text"
              value={recoveryStructure.activeRecovery || ''}
              onChange={e => setRecoveryStructure({ ...recoveryStructure, activeRecovery: e.target.value })}
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#FDBA74]"
            />
          </div>

          <div>
            <label className="font-bold text-[#64748B] uppercase text-[10px] block mb-1">Stretching &amp; Mobility Flow</label>
            <input
              type="text"
              value={recoveryStructure.stretchingMobility || ''}
              onChange={e => setRecoveryStructure({ ...recoveryStructure, stretchingMobility: e.target.value })}
              className="w-full p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl outline-none focus:border-[#FDBA74]"
            />
          </div>
        </div>
      </div>

      {/* CARD 6: Trainer-Specific Recommendations & Personal Customer Notes */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F8FAFC] pb-3">
          <FileEdit size={20} className="text-[#EA580C]" />
          <h2 className="text-lg font-bold text-[#111827]">Trainer Recommendations &amp; Direct Customer Notes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="font-bold text-xs text-[#111827] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#EA580C]" /> Trainer Specific Directives
            </label>
            <textarea
              value={trainerRecommendations}
              onChange={e => setTrainerRecommendations(e.target.value)}
              placeholder="e.g. Focus on progressive overload. Rest strictly 60s. Deload planned for Week 4."
              className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-xs text-[#111827] outline-none focus:border-[#FDBA74] min-h-[85px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-xs text-[#111827] flex items-center gap-1.5">
              <User size={14} className="text-[#EA580C]" /> Personal Encouragement Note for Member
            </label>
            <textarea
              value={trainerNotes}
              onChange={e => setTrainerNotes(e.target.value)}
              placeholder="e.g. Great baseline! I calibrated your squat reps to 3x10 to protect your lower back. Track your sets daily and message me with any questions!"
              className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-xs text-[#111827] outline-none focus:border-[#FDBA74] min-h-[85px]"
            />
          </div>
        </div>
      </div>

      {/* Bottom Approval & Save Bar */}
      <div className="bg-[#FFFFFF] border border-[#F8FAFC] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-[#64748B]">
          {modificationCount > 0 ? (
            <span>
              You have made <strong className="text-[#EA580C]">{modificationCount} calibration change(s)</strong>.
              Click <strong>Edit &amp; Approve</strong> to publish this customized plan to the customer dashboard.
            </span>
          ) : (
            <span>
              All 7-day workout routines and nutrition guidelines are configured from the AI draft baseline.
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleApproveWithoutChanges}
            disabled={saving}
            className="flex-1 sm:flex-initial px-5 py-3 bg-[#FFFFFF] border-2 border-[#E2E8F0] text-[#EA580C] hover:bg-[#FFF7ED] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check size={16} /> Approve &amp; Publish (No Changes)
          </button>

          <button
            onClick={handleEditAndApprove}
            disabled={saving}
            className="flex-1 sm:flex-initial px-7 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-900/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send size={16} /> Edit &amp; Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerAIReview;
