import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft, CheckCircle2, FileEdit, Trash2, Save, Plus, X, AlertCircle, Clock, Calendar } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const TrainerAIReview = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { user } = useAuth();
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  
  // Editable state
  const [assessment, setAssessment] = useState('');
  const [weeklySchedule, setWeeklySchedule] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [dietStructure, setDietStructure] = useState<any>({});
  const [routine, setRoutine] = useState<any>({});
  const [progressSuggestions, setProgressSuggestions] = useState<any>({});
  const [trainerNotes, setTrainerNotes] = useState('');

  useEffect(() => {
    fetchRecommendation();
  }, [customerId]);

  const fetchRecommendation = async () => {
    try {
      const res = await api.get(`/ai/trainer/customer/${customerId}`);
      const data = res.data.recommendation;
      setRecommendation(data);
      if (data) {
        setAssessment(data.aiAnalysis?.assessment || '');
        setWeeklySchedule(data.workoutRecommendation?.weeklySchedule || []);
        setExercises(data.workoutRecommendation?.exercises || []);
        setDietStructure(data.dietRecommendation || {});
        setRoutine(data.routine || {});
        setProgressSuggestions(data.progressSuggestions || {});
        setTrainerNotes(data.trainerNotes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendBack = async () => {
    setSaving(true);
    try {
      const updatedPayload = {
        aiAnalysis: {
          ...recommendation.aiAnalysis,
          assessment
        },
        workoutRecommendation: {
          ...recommendation.workoutRecommendation,
          exercises,
          weeklySchedule
        },
        dietRecommendation: dietStructure,
        routine,
        progressSuggestions,
        trainerNotes,
        revisionDetails: {
          reason: revisionReason,
          trainerName: `${user?.firstName} ${user?.lastName}`,
          date: new Date()
        },
        status: 'Revision Requested'
      };

      await api.put(`/ai/trainer/recommendation/${recommendation._id}/review`, updatedPayload);
      alert('Plan sent back to client for revision.');
      navigate('/trainer/ai-assistant');
    } catch (err) {
      console.error(err);
      alert('Failed to send back plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      const updatedPayload = {
        aiAnalysis: {
          ...recommendation.aiAnalysis,
          assessment
        },
        workoutRecommendation: {
          ...recommendation.workoutRecommendation,
          exercises,
          weeklySchedule
        },
        dietRecommendation: dietStructure,
        routine,
        progressSuggestions,
        trainerNotes,
        status: 'Trainer Approved'
      };

      await api.put(`/ai/trainer/recommendation/${recommendation._id}/review`, updatedPayload);
      alert('Plan successfully approved and assigned to the client!');
      navigate('/trainer/ai-assistant');
    } catch (err) {
      console.error(err);
      alert('Failed to approve plan.');
    } finally {
      setSaving(false);
    }
  };

  const updateExercise = (index: number, field: string, value: string) => {
    const newEx = [...exercises];
    newEx[index][field] = value;
    setExercises(newEx);
  };

  const removeExercise = (index: number) => {
    const newEx = [...exercises];
    newEx.splice(index, 1);
    setExercises(newEx);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: '10', duration: '5 mins', rest: '60s', difficulty: 'Medium' }]);
  };

  if (loading) return <div className="text-center py-20 text-[#687B78]">Loading client plan...</div>;
  if (!recommendation) return <div className="text-center py-20 text-[#EF4444]">Plan not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#687B78] hover:text-[#202828] font-semibold transition-colors">
          <ArrowLeft size={18} className="mr-1" /> Back to Clients
        </button>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${
          recommendation.status === 'Trainer Approved' ? 'bg-[#F1F5F3] border-[#D3DFDA] text-[#0F766E]' 
          : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
        }`}>
          {recommendation.status === 'Trainer Approved' ? <CheckCircle2 size={14} /> : <Bot size={14} />}
          {recommendation.status} (Version {recommendation.version})
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#D2B48C] to-[#0369A1] rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <FileEdit size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Review & Assign Plan</h1>
          <p className="text-[#455250] mt-1">Review the AI-generated recommendations, make adjustments, and assign to client.</p>
        </div>
      </div>

      {/* Client Context Profile snapshot */}
      <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-2xl p-6 flex gap-8 shadow-sm">
        <div className="flex-1">
          <h4 className="text-xs font-bold text-[#A8ADA9] uppercase tracking-wider mb-2">Client Context</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#202828]">
            <div><span className="text-[#687B78] block text-xs">Goal</span> <strong>{recommendation.fitnessProfile.fitnessGoal}</strong></div>
            <div><span className="text-[#687B78] block text-xs">Level</span> <strong>{recommendation.fitnessProfile.experienceLevel}</strong></div>
            <div><span className="text-[#687B78] block text-xs">Available</span> <strong>{recommendation.fitnessProfile.availableWorkoutDays}</strong></div>
            <div><span className="text-[#687B78] block text-xs">Equipment</span> <strong>{recommendation.fitnessProfile.workoutPreference}</strong></div>
          </div>
        </div>
      </div>

      {/* Assessment Editing */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#202828] mb-4">AI Assessment Summary</h2>
        <textarea 
          value={assessment}
          onChange={e => setAssessment(e.target.value)}
          className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4 text-[#202828] focus:border-[#D2B48C] outline-none min-h-[100px]"
          placeholder="Edit AI Assessment..."
        />
      </div>

      {/* Workout Editing */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#202828]">Workout Routine Editor</h2>
          <button onClick={addExercise} className="flex items-center text-sm text-[#D2B48C] font-bold hover:text-[#0891B2]">
            <Plus size={16} className="mr-1" /> Add Exercise
          </button>
        </div>
        
        {/* Weekly Schedule */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-[#687B78] uppercase tracking-wider mb-4">Weekly Schedule</h3>
          <div className="space-y-3">
            {weeklySchedule.map((day, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-[#F2EFE8] border border-[#E8E5DA] p-3 rounded-xl">
                <div className="w-24 font-bold text-[#202828]">{day.day}</div>
                <input type="text" value={day.workout} onChange={e => {
                  const newSchedule = [...weeklySchedule];
                  newSchedule[idx].workout = e.target.value;
                  setWeeklySchedule(newSchedule);
                }} className="flex-1 bg-white border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm focus:border-[#D2B48C] outline-none" placeholder="Workout Type" />
                <input type="text" value={day.duration} onChange={e => {
                  const newSchedule = [...weeklySchedule];
                  newSchedule[idx].duration = e.target.value;
                  setWeeklySchedule(newSchedule);
                }} className="w-24 bg-white border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm focus:border-[#D2B48C] outline-none" placeholder="Duration" />
              </div>
            ))}
          </div>
        </div>

        <h3 className="text-sm font-bold text-[#687B78] uppercase tracking-wider mb-4">Exercises</h3>
        <div className="space-y-4">
          {exercises.map((ex, idx) => (
            <div key={idx} className="flex gap-4 items-center bg-[#F2EFE8] border border-[#E8E5DA] p-4 rounded-xl">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-[#687B78] font-semibold">Exercise Name</label>
                  <input type="text" value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)} className="w-full bg-white border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm focus:border-[#D2B48C] outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#687B78] font-semibold">Sets</label>
                  <input type="text" value={ex.sets} onChange={e => updateExercise(idx, 'sets', e.target.value)} className="w-full bg-white border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm focus:border-[#D2B48C] outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#687B78] font-semibold">Reps</label>
                  <input type="text" value={ex.reps} onChange={e => updateExercise(idx, 'reps', e.target.value)} className="w-full bg-white border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm focus:border-[#D2B48C] outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#687B78] font-semibold">Rest</label>
                  <input type="text" value={ex.rest} onChange={e => updateExercise(idx, 'rest', e.target.value)} className="w-full bg-white border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm focus:border-[#D2B48C] outline-none" />
                </div>
              </div>
              <button onClick={() => removeExercise(idx)} className="text-[#EF4444] hover:bg-red-50 p-2 rounded-lg mt-4 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Diet Editing */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#202828] mb-4">Diet Structure Editor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['morning', 'breakfast', 'lunch', 'evening', 'dinner'].map((meal) => (
             <div key={meal}>
                <label className="text-xs text-[#687B78] font-semibold uppercase">{meal}</label>
                <input 
                  type="text"
                  value={dietStructure[meal] || ''}
                  onChange={e => setDietStructure({...dietStructure, [meal]: e.target.value})}
                  className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm text-[#202828] focus:border-[#D2B48C] outline-none"
                />
             </div>
          ))}
        </div>
      </div>

      {/* Routine Editing */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#202828] mb-4">Daily Routine Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['morning', 'workoutTime', 'evening', 'night'].map((period) => (
             <div key={period}>
                <label className="text-xs text-[#687B78] font-semibold uppercase">{period.replace('Time', ' Time')}</label>
                <input 
                  type="text"
                  value={routine[period] || ''}
                  onChange={e => setRoutine({...routine, [period]: e.target.value})}
                  className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm text-[#202828] focus:border-[#D2B48C] outline-none"
                />
             </div>
          ))}
        </div>
      </div>

      {/* Progress Suggestions Editing */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#202828] mb-4">Progress & Tracking Suggestions</h2>
        <div className="space-y-4">
          {['focusAreas', 'improvementSuggestions', 'progressTracking'].map((field) => (
             <div key={field}>
                <label className="text-xs text-[#687B78] font-semibold uppercase">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                <input 
                  type="text"
                  value={progressSuggestions[field] || ''}
                  onChange={e => setProgressSuggestions({...progressSuggestions, [field]: e.target.value})}
                  className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm text-[#202828] focus:border-[#D2B48C] outline-none"
                />
             </div>
          ))}
        </div>
      </div>

      {/* Trainer Notes */}
      <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#B45309] mb-4 flex items-center"><AlertCircle className="mr-2" size={20} /> Professional Trainer Notes</h2>
        <textarea 
          value={trainerNotes}
          onChange={e => setTrainerNotes(e.target.value)}
          className="w-full bg-white/50 border border-[#FEF3C7] rounded-xl p-4 text-[#92400E] focus:border-[#B45309] outline-none min-h-[100px] placeholder-[#D97706]"
          placeholder="Add any specific instructions, tips, or modifications for the client here..."
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E5DA] p-4 lg:ml-64 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto flex justify-end items-center gap-4">
          <button 
            onClick={() => setShowRevisionModal(true)}
            disabled={saving}
            className="px-6 py-3 bg-white border border-[#EF4444] text-[#EF4444] rounded-xl font-bold hover:bg-red-50 transition-colors"
          >
            Send Back for Revision
          </button>
          <button 
            onClick={handleApprove}
            disabled={saving}
            className="px-8 py-3 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.3)] disabled:opacity-50"
          >
            <CheckCircle2 size={18} /> {saving ? 'Saving...' : 'Approve & Assign to Client'}
          </button>
        </div>
      </div>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#202828]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-[#EF4444] to-[#B91C1C] p-6 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Request Revision</h3>
                  <p className="text-white/80 text-sm">Send this plan back to the client for adjustments.</p>
                </div>
                <button onClick={() => setShowRevisionModal(false)} className="text-white/60 hover:text-white p-2 bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-[#F2EFE8] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-[#455250]">
                  <Calendar size={16} className="text-[#687B78]" />
                  <span className="font-semibold text-[#202828]">Date:</span> {new Date().toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-sm text-[#455250]">
                  <Clock size={16} className="text-[#687B78]" />
                  <span className="font-semibold text-[#202828]">Time:</span> {new Date().toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-3 text-sm text-[#455250]">
                  <Bot size={16} className="text-[#687B78]" />
                  <span className="font-semibold text-[#202828]">Trainer:</span> {user?.firstName} {user?.lastName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#202828] mb-2">Reason for Revision <span className="text-[#EF4444]">*</span></label>
                <textarea 
                  value={revisionReason}
                  onChange={e => setRevisionReason(e.target.value)}
                  className="w-full bg-white border-2 border-[#E8E5DA] rounded-xl p-4 text-[#202828] focus:border-[#EF4444] focus:ring-4 focus:ring-red-500/10 outline-none min-h-[120px] transition-all"
                  placeholder="Explain why the plan is being sent back and what the client needs to update..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowRevisionModal(false)}
                  className="flex-1 py-3 font-bold text-[#687B78] hover:bg-[#F2EFE8] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (!revisionReason.trim()) return alert('Please provide a reason for revision.');
                    handleSendBack();
                  }}
                  disabled={saving || !revisionReason.trim()}
                  className="flex-1 py-3 bg-[#EF4444] text-white font-bold rounded-xl hover:bg-[#B91C1C] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Sending...' : 'Confirm & Send Back'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerAIReview;
