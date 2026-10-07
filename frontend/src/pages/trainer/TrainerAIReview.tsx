import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, FileEdit, Trash2, Plus, 
  AlertCircle, Clock, Dumbbell, Utensils, 
  HeartPulse, User, ShieldAlert, Sparkles, RefreshCw, 
  Check, ChevronDown, ChevronUp, Send
} from 'lucide-react';
import api from '../../utils/api';

const TrainerAIReview = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOriginalDraft, setShowOriginalDraft] = useState(false);

  // Editable Workout Schedule & Exercises
  const [weeklySchedule, setWeeklySchedule] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);

  // Editable Diet & Recovery
  const [dietStructure, setDietStructure] = useState<any>({
    morning: '',
    breakfast: '',
    lunch: '',
    evening: '',
    dinner: '',
    hydration: '',
    note: ''
  });

  const [recoveryStructure, setRecoveryStructure] = useState<any>({
    sleep: '',
    activeRecovery: '',
    stretchingMobility: '',
    notes: ''
  });

  // Trainer Specific additions
  const [trainerRecommendations, setTrainerRecommendations] = useState('');
  const [trainerNotes, setTrainerNotes] = useState('');

  // Exercise Replacement Quick Modal
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

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
        setWeeklySchedule(data.workoutRecommendation?.weeklySchedule || []);
        setExercises(data.workoutRecommendation?.exercises ? JSON.parse(JSON.stringify(data.workoutRecommendation.exercises)) : []);
        setDietStructure(data.dietRecommendation || {});
        setRecoveryStructure(data.recoveryRecommendations || {
          sleep: '7.5 – 8.5 hours uninterrupted sleep per night.',
          activeRecovery: '15–20 minutes walking or light swimming on rest days.',
          stretchingMobility: '10 mins dynamic warm-up and post-workout static stretches.'
        });
        setTrainerRecommendations(data.trainerRecommendations || '');
        setTrainerNotes(data.trainerNotes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Exercise manipulation functions
  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    const updated = [...exercises];
    updated.splice(index, 1);
    setExercises(updated);
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: 'New Custom Exercise',
        sets: 3,
        reps: '12',
        duration: '8 min',
        rest: '60s',
        difficulty: recommendation?.fitnessProfile?.currentFitnessLevel || 'Beginner',
        targetMuscleGroup: 'Full Body'
      }
    ]);
  };

  const replaceExerciseWith = (presetName: string, targetMuscle: string) => {
    if (replacingIndex === null) return;
    const updated = [...exercises];
    updated[replacingIndex] = {
      ...updated[replacingIndex],
      name: presetName,
      targetMuscleGroup: targetMuscle
    };
    setExercises(updated);
    setReplacingIndex(null);
  };

  // Calculate live modifications count against original draft
  const getModificationsCount = () => {
    if (!recommendation?.originalAiDraft) return 0;
    const origEx = recommendation.originalAiDraft?.workoutRecommendation?.exercises || [];
    let count = 0;

    exercises.forEach(curr => {
      const orig = origEx.find((o: any) => o.name?.toLowerCase() === curr.name?.toLowerCase());
      if (!orig) {
        count++; // Added new
      } else if (
        String(orig.sets) !== String(curr.sets) ||
        String(orig.reps) !== String(curr.reps) ||
        String(orig.duration) !== String(curr.duration) ||
        String(orig.rest) !== String(curr.rest)
      ) {
        count++; // Modified
      }
    });

    if (exercises.length < origEx.length) {
      count += (origEx.length - exercises.length); // Removed
    }

    if (trainerNotes?.trim()) count++;
    if (trainerRecommendations?.trim()) count++;

    return count;
  };

  // ACTION 1: Approve & Publish (Approve AI output without changes)
  const handleApproveWithoutChanges = async () => {
    const confirmApprove = window.confirm(
      'Are you sure you want to approve and publish the AI draft directly to the customer without modifications?'
    );
    if (!confirmApprove) return;

    setSaving(true);
    try {
      const payload = {
        action: 'APPROVE_AND_PUBLISH',
        workoutRecommendation: recommendation.originalAiDraft?.workoutRecommendation || recommendation.workoutRecommendation,
        dietRecommendation: recommendation.originalAiDraft?.dietRecommendation || recommendation.dietRecommendation,
        recoveryRecommendations: recommendation.originalAiDraft?.recoveryRecommendations || recoveryStructure,
        routine: recommendation.routine,
        progressSuggestions: recommendation.progressSuggestions,
        trainerRecommendations: trainerRecommendations || '',
        trainerNotes: trainerNotes || '',
        status: 'Trainer Approved'
      };

      await api.put(`/ai/trainer/recommendation/${recommendation._id}/review`, payload);
      alert('Plan successfully approved as original AI draft and published to customer!');
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
      const payload = {
        action: 'EDIT_AND_APPROVE',
        hasModifications: true,
        workoutRecommendation: {
          weeklySchedule,
          exercises
        },
        dietRecommendation: dietStructure,
        recoveryRecommendations: recoveryStructure,
        routine: recommendation.routine,
        progressSuggestions: recommendation.progressSuggestions,
        trainerRecommendations,
        trainerNotes,
        status: 'Trainer Approved'
      };

      await api.put(`/ai/trainer/recommendation/${recommendation._id}/review`, payload);
      alert('Trainer modifications saved! Plan approved and published to customer dashboard.');
      navigate('/trainer/ai-assistant');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save edits and approve.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-[#78716C]">
        <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="font-semibold text-sm">Loading client assessment and AI draft...</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#292524]">AI Plan Not Found</h2>
        <p className="text-sm text-[#78716C] mt-1">This customer has not submitted a fitness assessment yet.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2.5 bg-[#F97316] text-white rounded-xl text-xs font-bold">
          Go Back
        </button>
      </div>
    );
  }

  const profile = recommendation.fitnessProfile || {};
  const measurements = profile.bodyMeasurements || {};
  const isApproved = recommendation.status === 'Trainer Approved' || recommendation.status === 'Published to Customer';
  const modificationsCount = getModificationsCount();

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FED7AA] pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-xs font-bold text-[#78716C] hover:text-[#292524] transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Client List
        </button>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            isApproved 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
              : 'bg-amber-100 text-amber-800 border-amber-300'
          }`}>
            {isApproved ? <CheckCircle2 size={14} /> : <Clock size={14} />}
            Status: {recommendation.status} (v{recommendation.version || 1})
          </span>

          {modificationsCount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
              ✏️ {modificationsCount} Trainer Edit(s)
            </span>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#E7E5E4] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#F97316] to-teal-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md">
            {profile.fullName?.[0] || 'C'}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#292524] tracking-tight">
              Review & Calibrate: {profile.fullName || 'Customer Plan'}
            </h1>
            <p className="text-xs text-[#78716C] mt-1">
              Review AI analysis draft, calibrate exercise sets/reps, adjust nutrition, and approve official customer plan.
            </p>
          </div>
        </div>

        {/* Primary Decision Action Buttons (Requirement 5) */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleApproveWithoutChanges}
            disabled={saving}
            className="px-5 py-2.5 bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Approve the original AI-generated output as the official plan without modifications"
          >
            <Check size={16} /> Approve &amp; Publish (No Changes)
          </button>

          <button
            onClick={handleEditAndApprove}
            disabled={saving}
            className="px-6 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-900/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Save your exercise and nutrition modifications separately and approve as official plan"
          >
            <Send size={16} /> Edit &amp; Approve
          </button>
        </div>
      </div>

      {/* CARD 1: Customer Information & Assessment Details (Requirement 3 & 10) */}
      <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
          <div className="flex items-center gap-2">
            <User size={20} className="text-[#F97316]" />
            <h2 className="text-lg font-bold text-[#292524]">Customer Information &amp; Assessment</h2>
          </div>
          <span className="text-xs font-semibold text-[#78716C]">
            Goal: <strong className="text-[#F97316]">{profile.fitnessGoal}</strong>
          </span>
        </div>

        {/* Grid of Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
            <span className="text-[#78716C] uppercase font-bold block text-[10px]">Age</span>
            <strong className="text-[#292524] text-sm">{profile.age || '-'} yrs</strong>
          </div>
          <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
            <span className="text-[#78716C] uppercase font-bold block text-[10px]">Gender</span>
            <strong className="text-[#292524] text-sm">{profile.gender || '-'}</strong>
          </div>
          <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
            <span className="text-[#78716C] uppercase font-bold block text-[10px]">Height / Weight</span>
            <strong className="text-[#292524] text-sm">{profile.height || '-'} cm / {profile.weight || '-'} kg</strong>
          </div>
          <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
            <span className="text-[#78716C] uppercase font-bold block text-[10px]">Level</span>
            <strong className="text-[#292524] text-sm">{profile.currentFitnessLevel || profile.experienceLevel || 'Beginner'}</strong>
          </div>
          <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
            <span className="text-[#78716C] uppercase font-bold block text-[10px]">Target Days</span>
            <strong className="text-[#292524] text-sm">{profile.availableWorkoutDays || '4 Days'}</strong>
          </div>
          <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
            <span className="text-[#78716C] uppercase font-bold block text-[10px]">Equipment</span>
            <strong className="text-[#292524] text-sm truncate">{profile.equipmentAvailability || 'Full Gym'}</strong>
          </div>
        </div>

        {/* Body Measurements Snapshot */}
        {measurements && Object.keys(measurements).length > 0 && (
          <div className="p-3 bg-[#FFFDF8] rounded-xl text-xs flex flex-wrap items-center gap-4">
            <span className="font-bold text-[#78716C] uppercase text-[11px]">Logged Body Measurements:</span>
            {Object.entries(measurements).map(([k, v]: any) => (
              <span key={k} className="bg-white px-2 py-0.5 rounded border border-[#FED7AA]">
                {k}: <strong>{v}</strong>
              </span>
            ))}
          </div>
        )}

        {/* Health considerations alert */}
        {profile.injuries && profile.injuries !== 'None' && (
          <div className="p-3.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-900 flex items-center gap-2">
            <ShieldAlert size={16} className="text-orange-600 shrink-0" />
            <span>
              <strong>Reported Injury / Medical Note:</strong> {profile.injuries}. Screen exercises below to avoid joint irritation.
            </span>
          </div>
        )}
      </div>

      {/* CARD 2: AI Generated Analysis (Draft Preview & Comparison Toggle) */}
      <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#F97316]" />
            <h2 className="text-lg font-bold text-[#292524]">AI Generated Draft Analysis</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
              AI Draft (Reference)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowOriginalDraft(!showOriginalDraft)}
            className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1"
          >
            {showOriginalDraft ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showOriginalDraft ? 'Hide AI Draft Details' : 'View Full AI Draft Baseline'}
          </button>
        </div>

        <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl text-xs text-[#292524] leading-relaxed">
          <strong>AI Assessment Summary:</strong> {recommendation.aiAnalysis?.assessment || 'Initial AI draft generated.'}
        </div>

        {showOriginalDraft && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
            <div className="p-4 bg-white border border-[#FED7AA] rounded-2xl space-y-2 text-xs">
              <strong className="text-[#F97316] block uppercase tracking-wider text-[11px]">Original AI Goal Analysis</strong>
              <p className="text-[#78716C]">{recommendation.aiAnalysis?.goalAnalysis}</p>
            </div>
            <div className="p-4 bg-white border border-[#FED7AA] rounded-2xl space-y-2 text-xs">
              <strong className="text-[#F97316] block uppercase tracking-wider text-[11px]">Original Recommended Approach</strong>
              <p className="text-[#78716C]">{recommendation.aiAnalysis?.recommendedApproach}</p>
            </div>
          </div>
        )}
      </div>

      {/* CARD 3: Trainer Review & Editing Studio (Requirement 4: Professional Editing Controls) */}
      <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FED7AA] pb-4">
          <div className="flex items-center gap-2">
            <FileEdit size={22} className="text-[#F97316]" />
            <div>
              <h2 className="text-xl font-bold text-[#292524]">Trainer Review &amp; Editing Studio</h2>
              <p className="text-xs text-[#78716C]">
                Adjust exercises, modify sets & reps, replace unsuitable movements, and add coach notes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={addExercise}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus size={14} /> Add New Exercise
            </button>
          </div>
        </div>

        {/* 1. Exercise Routine Editor (Requirement 4) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[#292524] uppercase tracking-wider flex items-center gap-2">
              <Dumbbell size={16} className="text-[#F97316]" /> Calibrate Exercise Routine ({exercises.length} Exercises)
            </h3>
            <span className="text-[11px] text-[#78716C]">
              E.g., AI suggests 4×15 reps → Trainer modifies to 3×10 reps
            </span>
          </div>

          <div className="space-y-3">
            {exercises.map((ex, idx) => {
              // Compare with original draft exercise for visual indication
              const origEx = recommendation?.originalAiDraft?.workoutRecommendation?.exercises?.[idx];
              const isModified = origEx && (
                String(origEx.sets) !== String(ex.sets) ||
                String(origEx.reps) !== String(ex.reps) ||
                origEx.name !== ex.name
              );

              return (
                <div
                  key={idx}
                  className={`border rounded-2xl p-4 transition-all ${
                    isModified
                      ? 'border-purple-300 bg-purple-50/20'
                      : 'border-[#FED7AA] bg-[#F9F8F6]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    {/* Exercise Name & Muscle */}
                    <div className="flex-1 w-full md:w-auto">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ex.name}
                          onChange={e => updateExercise(idx, 'name', e.target.value)}
                          className="font-bold text-sm text-[#292524] bg-white border border-[#E7E5E4] px-3 py-1.5 rounded-lg w-full md:w-64 focus:border-[#F97316] outline-none"
                          placeholder="Exercise Name"
                        />
                        {isModified && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 shrink-0">
                            Modified by Trainer
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-[#78716C] font-bold">Target Muscle:</span>
                        <input
                          type="text"
                          value={ex.targetMuscleGroup || ''}
                          onChange={e => updateExercise(idx, 'targetMuscleGroup', e.target.value)}
                          className="text-xs text-[#F97316] bg-white border border-[#FED7AA] px-2 py-0.5 rounded w-36"
                          placeholder="Muscle group"
                        />
                      </div>
                    </div>

                    {/* Numeric Controls: Sets, Reps, Duration, Rest */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto text-xs">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#78716C] block">Sets</label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={e => updateExercise(idx, 'sets', Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white border border-[#E7E5E4] rounded-lg font-bold text-[#292524] text-center"
                          min={1}
                          max={10}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#78716C] block">Reps</label>
                        <input
                          type="text"
                          value={ex.reps}
                          onChange={e => updateExercise(idx, 'reps', e.target.value)}
                          className="w-20 px-2 py-1 bg-white border border-[#E7E5E4] rounded-lg font-bold text-[#292524] text-center"
                          placeholder="e.g. 10"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#78716C] block">Rest</label>
                        <input
                          type="text"
                          value={ex.rest || '60s'}
                          onChange={e => updateExercise(idx, 'rest', e.target.value)}
                          className="w-16 px-2 py-1 bg-white border border-[#E7E5E4] rounded-lg text-[#292524] text-center font-medium"
                          placeholder="60s"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase font-bold text-[#78716C] block">Difficulty</label>
                        <select
                          value={ex.difficulty || 'Beginner'}
                          onChange={e => updateExercise(idx, 'difficulty', e.target.value)}
                          className="px-2 py-1 bg-white border border-[#E7E5E4] rounded-lg text-xs"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>

                    {/* Quick Replace & Delete Actions */}
                    <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setReplacingIndex(replacingIndex === idx ? null : idx)}
                        className="px-2.5 py-1.5 bg-white border border-[#E7E5E4] text-[#F97316] rounded-lg text-xs font-semibold hover:bg-[#FFFDF8]"
                        title="Replace unsuitable exercise"
                      >
                        <RefreshCw size={13} className="inline mr-1" /> Replace
                      </button>

                      <button
                        type="button"
                        onClick={() => removeExercise(idx)}
                        className="p-1.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove exercise"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Replacement Menu */}
                  {replacingIndex === idx && (
                    <div className="mt-3 pt-3 border-t border-[#FED7AA] bg-white p-3 rounded-xl">
                      <p className="text-xs font-bold text-[#292524] mb-2">
                        Quick Replace &apos;{ex.name}&apos; with suitable alternative:
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {[
                          { name: 'Goblet Squats', muscle: 'Quads & Glutes' },
                          { name: 'Leg Press (Machine)', muscle: 'Quads' },
                          { name: 'Dumbbell Floor Press', muscle: 'Chest & Triceps' },
                          { name: 'Seated Cable Row', muscle: 'Back & Lats' },
                          { name: 'Lat Pulldown', muscle: 'Lats & Biceps' },
                          { name: 'Glute Bridges', muscle: 'Glutes' },
                          { name: 'Knee Push-ups', muscle: 'Chest' },
                          { name: 'Romanian Deadlift', muscle: 'Hamstrings' },
                        ].map((sub, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => replaceExerciseWith(sub.name, sub.muscle)}
                            className="px-2.5 py-1 bg-[#F9F8F6] border border-[#E7E5E4] rounded-lg hover:bg-[#F97316] hover:text-white transition-colors"
                          >
                            + {sub.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Diet & Nutrition Modifications (Requirement 4) */}
        <div className="space-y-4 pt-4 border-t border-[#FED7AA]">
          <h3 className="text-sm font-extrabold text-[#292524] uppercase tracking-wider flex items-center gap-2">
            <Utensils size={16} className="text-[#F97316]" /> Modify Diet &amp; Nutrition Recommendations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#78716C] uppercase text-[10px] block mb-1">Morning Hydration</label>
              <textarea
                value={dietStructure.morning || ''}
                onChange={e => setDietStructure({ ...dietStructure, morning: e.target.value })}
                className="w-full p-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#F97316] min-h-[60px]"
              />
            </div>
            <div>
              <label className="font-bold text-[#78716C] uppercase text-[10px] block mb-1">Breakfast</label>
              <textarea
                value={dietStructure.breakfast || ''}
                onChange={e => setDietStructure({ ...dietStructure, breakfast: e.target.value })}
                className="w-full p-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#F97316] min-h-[60px]"
              />
            </div>
            <div>
              <label className="font-bold text-[#78716C] uppercase text-[10px] block mb-1">Lunch</label>
              <textarea
                value={dietStructure.lunch || ''}
                onChange={e => setDietStructure({ ...dietStructure, lunch: e.target.value })}
                className="w-full p-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#F97316] min-h-[60px]"
              />
            </div>
            <div>
              <label className="font-bold text-[#78716C] uppercase text-[10px] block mb-1">Evening Snack</label>
              <textarea
                value={dietStructure.evening || ''}
                onChange={e => setDietStructure({ ...dietStructure, evening: e.target.value })}
                className="w-full p-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#F97316] min-h-[60px]"
              />
            </div>
            <div>
              <label className="font-bold text-[#78716C] uppercase text-[10px] block mb-1">Dinner</label>
              <textarea
                value={dietStructure.dinner || ''}
                onChange={e => setDietStructure({ ...dietStructure, dinner: e.target.value })}
                className="w-full p-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#F97316] min-h-[60px]"
              />
            </div>
            <div>
              <label className="font-bold text-[#78716C] uppercase text-[10px] block mb-1">Daily Hydration Target</label>
              <textarea
                value={dietStructure.hydration || ''}
                onChange={e => setDietStructure({ ...dietStructure, hydration: e.target.value })}
                className="w-full p-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#F97316] min-h-[60px]"
              />
            </div>
          </div>
        </div>

        {/* 3. Recovery Recommendations (Requirement 4) */}
        <div className="space-y-4 pt-4 border-t border-[#FED7AA]">
          <h3 className="text-sm font-extrabold text-[#292524] uppercase tracking-wider flex items-center gap-2">
            <HeartPulse size={16} className="text-[#F97316]" /> Modify Recovery Recommendations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-[#78716C] uppercase text-[10px] block mb-1">Sleep Target</label>
              <input
                type="text"
                value={recoveryStructure.sleep || ''}
                onChange={e => setRecoveryStructure({ ...recoveryStructure, sleep: e.target.value })}
                className="w-full p-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="font-bold text-[#78716C] uppercase text-[10px] block mb-1">Active Recovery</label>
              <input
                type="text"
                value={recoveryStructure.activeRecovery || ''}
                onChange={e => setRecoveryStructure({ ...recoveryStructure, activeRecovery: e.target.value })}
                className="w-full p-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="font-bold text-[#78716C] uppercase text-[10px] block mb-1">Stretching &amp; Mobility</label>
              <input
                type="text"
                value={recoveryStructure.stretchingMobility || ''}
                onChange={e => setRecoveryStructure({ ...recoveryStructure, stretchingMobility: e.target.value })}
                className="w-full p-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl outline-none focus:border-[#F97316]"
              />
            </div>
          </div>
        </div>

        {/* 4. Trainer Recommendations & Personal Customer Notes (Requirement 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#FED7AA]">
          <div className="space-y-1.5">
            <label className="font-bold text-xs text-[#292524] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#F97316]" /> Trainer-Specific Recommendations
            </label>
            <textarea
              value={trainerRecommendations}
              onChange={e => setTrainerRecommendations(e.target.value)}
              placeholder="e.g. Focus on progressive overload. Keep rest intervals strictly under 60 seconds. Deload planned for Week 5."
              className="w-full p-3 bg-[#F9F8F6] border border-[#E7E5E4] rounded-2xl text-xs text-[#292524] outline-none focus:border-[#F97316] min-h-[90px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-xs text-[#292524] flex items-center gap-1.5">
              <User size={14} className="text-[#F97316]" /> Personal Notes for the Customer
            </label>
            <textarea
              value={trainerNotes}
              onChange={e => setTrainerNotes(e.target.value)}
              placeholder="e.g. Great baseline assessment! I tweaked squats to 3x10 to protect your lower back. Let me know how Week 1 feels in chat!"
              className="w-full p-3 bg-[#F9F8F6] border border-[#E7E5E4] rounded-2xl text-xs text-[#292524] outline-none focus:border-[#F97316] min-h-[90px]"
            />
          </div>
        </div>

        {/* Bottom Decision Bar */}
        <div className="pt-6 border-t border-[#FED7AA] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#78716C]">
            {modificationsCount > 0 ? (
              <span>
                You have made <strong className="text-purple-700">{modificationsCount} change(s)</strong>. 
                Click <strong>Edit &amp; Approve</strong> to save modifications separately and publish.
              </span>
            ) : (
              <span>
                No modifications made yet. You can approve the AI draft directly or make edits above.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleApproveWithoutChanges}
              disabled={saving}
              className="flex-1 sm:flex-initial px-5 py-3 bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check size={16} /> Approve &amp; Publish
            </button>

            <button
              onClick={handleEditAndApprove}
              disabled={saving}
              className="flex-1 sm:flex-initial px-7 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-900/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send size={16} /> Edit &amp; Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerAIReview;
