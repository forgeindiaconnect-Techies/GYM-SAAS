import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft, CheckCircle2, FileEdit, Trash2, Save, Plus, X, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const TrainerAIReview = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Editable state
  const [exercises, setExercises] = useState<any[]>([]);
  const [dietStructure, setDietStructure] = useState('');
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
        setExercises(data.workoutRecommendation?.exercises || []);
        setDietStructure(data.dietRecommendation?.generalStructure || '');
        setTrainerNotes(data.trainerNotes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    try {
      const updatedPayload = {
        workoutRecommendation: {
          ...recommendation.workoutRecommendation,
          exercises
        },
        dietRecommendation: {
          ...recommendation.dietRecommendation,
          generalStructure: dietStructure
        },
        routine: recommendation.routine,
        progressSuggestions: recommendation.progressSuggestions,
        trainerNotes
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

  if (loading) return <div className="text-center py-20 text-[#727975]">Loading client plan...</div>;
  if (!recommendation) return <div className="text-center py-20 text-[#EF4444]">Plan not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#727975] hover:text-[#202522] font-semibold transition-colors">
          <ArrowLeft size={18} className="mr-1" /> Back to Clients
        </button>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${
          recommendation.status === 'Trainer Approved' ? 'bg-[#F5F3EE] border-[#DCD9CD] text-[#0F766E]' 
          : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
        }`}>
          {recommendation.status === 'Trainer Approved' ? <CheckCircle2 size={14} /> : <Bot size={14} />}
          {recommendation.status} (Version {recommendation.version})
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#06B6D4] to-[#0369A1] rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <FileEdit size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Review & Assign Plan</h1>
          <p className="text-[#4A514D] mt-1">Review the AI-generated recommendations, make adjustments, and assign to client.</p>
        </div>
      </div>

      {/* Client Context Profile snapshot */}
      <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-2xl p-6 flex gap-8 shadow-sm">
        <div className="flex-1">
          <h4 className="text-xs font-bold text-[#A8ADA9] uppercase tracking-wider mb-2">Client Context</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#202522]">
            <div><span className="text-[#727975] block text-xs">Goal</span> <strong>{recommendation.fitnessProfile.fitnessGoal}</strong></div>
            <div><span className="text-[#727975] block text-xs">Level</span> <strong>{recommendation.fitnessProfile.experienceLevel}</strong></div>
            <div><span className="text-[#727975] block text-xs">Available</span> <strong>{recommendation.fitnessProfile.availableWorkoutDays}</strong></div>
            <div><span className="text-[#727975] block text-xs">Equipment</span> <strong>{recommendation.fitnessProfile.workoutPreference}</strong></div>
          </div>
        </div>
      </div>

      {/* Workout Editing */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#202522]">Workout Routine Editor</h2>
          <button onClick={addExercise} className="flex items-center text-sm text-[#06B6D4] font-bold hover:text-[#0891B2]">
            <Plus size={16} className="mr-1" /> Add Exercise
          </button>
        </div>
        
        <div className="space-y-4">
          {exercises.map((ex, idx) => (
            <div key={idx} className="flex gap-4 items-center bg-[#F2EFE8] border border-[#E8E5DA] p-4 rounded-xl">
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-[#727975] font-semibold">Exercise Name</label>
                  <input type="text" value={ex.name} onChange={e => updateExercise(idx, 'name', e.target.value)} className="w-full bg-white border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm focus:border-[#06B6D4] outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#727975] font-semibold">Sets</label>
                  <input type="text" value={ex.sets} onChange={e => updateExercise(idx, 'sets', e.target.value)} className="w-full bg-white border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm focus:border-[#06B6D4] outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#727975] font-semibold">Reps</label>
                  <input type="text" value={ex.reps} onChange={e => updateExercise(idx, 'reps', e.target.value)} className="w-full bg-white border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm focus:border-[#06B6D4] outline-none" />
                </div>
                <div>
                  <label className="text-xs text-[#727975] font-semibold">Rest</label>
                  <input type="text" value={ex.rest} onChange={e => updateExercise(idx, 'rest', e.target.value)} className="w-full bg-white border border-[#E8E5DA] rounded-lg px-3 py-2 text-sm focus:border-[#06B6D4] outline-none" />
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
        <h2 className="text-xl font-bold text-[#202522] mb-4">Diet Structure Editor</h2>
        <textarea 
          value={dietStructure}
          onChange={e => setDietStructure(e.target.value)}
          className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4 text-[#202522] focus:border-[#06B6D4] outline-none min-h-[100px]"
          placeholder="Enter diet guidelines..."
        />
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
          <span className="text-sm text-[#727975]">Clicking approve will assign this final version to the client.</span>
          <button 
            onClick={handleApprove}
            disabled={saving}
            className="px-8 py-3 bg-[#06B6D4] text-white rounded-xl font-bold hover:bg-[#0891B2] transition-colors flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <CheckCircle2 size={18} /> {saving ? 'Saving...' : 'Approve & Assign to Client'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerAIReview;
