import { useState, useEffect } from 'react';
import { Bot, Activity, Zap, CheckCircle2, AlertCircle, Dumbbell, Utensils, Loader2, Clock, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MemberAIFitness = () => {
  const [step, setStep] = useState(1); // 1 = Form, 2 = Generating, 3 = View Plan
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    fitnessGoal: 'Weight Loss',
    experienceLevel: 'Beginner',
    activityLevel: 'Sedentary',
    workoutPreference: 'Full Gym',
    availableWorkoutDays: '3 Days',
    preferredWorkoutDuration: '45 mins',
    foodPreferences: 'Omnivore',
    dietaryPreferences: 'None'
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await api.get('/memberships/my');
        const active = res.data.memberships?.some((m: any) => m.status === 'ACTIVE');
        // Also check if the user is tied to a gym (e.g., Free Trial or Public Signup)
        const userGymStr = localStorage.getItem('aigym_user');
        let userHasGym = false;
        if (userGymStr) {
          try {
            const u = JSON.parse(userGymStr);
            userHasGym = !!u.gymId;
          } catch(e) {}
        }
        
        const accessGranted = active || userHasGym;
        setHasAccess(accessGranted);

        if (accessGranted) {
          fetchLatestRecommendation();
        }
      } catch (err) {
        setHasAccess(false);
      }
    };
    checkAccess();
  }, []);

  const fetchLatestRecommendation = async () => {
    try {
      const res = await api.get('/ai/member/latest');
      if (res.data.recommendation) {
        setRecommendation(res.data.recommendation);
        setStep(3); // If they already have a plan, show it directly
      } else {
        setStep(1);
      }
    } catch (err) {
      console.error('Failed to fetch recommendation', err);
    }
  };

  const handleGenerate = async () => {
    setStep(2);
    try {
      const res = await api.post('/ai/member/generate', { fitnessProfile: formData });
      if (res.data.recommendation) {
        setRecommendation(res.data.recommendation);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setStep(3);
    }
  };

  if (hasAccess === null) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>;
  }

  if (!hasAccess) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-12 text-center relative overflow-hidden shadow-sm">
          <div className="w-20 h-20 bg-[#F1F5F9] border border-[#E8E5DA] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
            <Lock size={32} className="text-[#A8ADA9]" />
          </div>
          <h2 className="text-3xl font-bold text-[#202828] mb-4">AI Fitness Coach Locked</h2>
          <p className="text-[#455250] text-lg mb-8 max-w-lg mx-auto">
            You need an active gym membership to access personalized AI workout plans, dietary guidance, and progress tracking.
          </p>
          <Link to="/gyms" className="inline-flex items-center px-8 py-4 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-all hover:scale-105 shadow-[0_0_15px_rgba(22,163,74,0.3)]">
            <Activity className="mr-2" size={20} /> Find a Gym to Unlock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(22,163,74,0.3)]">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#202828] tracking-tight">AI Fitness Coach</h1>
            <p className="text-[#455250] mt-1">Personalized intelligence for your fitness journey.</p>
          </div>
        </div>
        
        {step === 3 && recommendation && (
          <button onClick={() => setStep(1)} className="px-4 py-2 bg-white border border-[#E8E5DA] text-[#202828] rounded-lg font-medium hover:bg-[#F2EFE8] transition-colors text-sm">
            Request New Plan
          </button>
        )}
      </div>

      {step === 1 && (
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 md:p-8 space-y-8 animate-in fade-in duration-300 shadow-sm">
          <h2 className="text-xl font-bold text-[#202828] border-b border-[#D3DFDA] pb-4 flex items-center gap-2">
            <Activity className="text-[#164A4A]" size={20} /> Complete Your Fitness Profile
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#455250]">Age</label>
              <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="e.g. 28" className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl px-4 py-3 text-[#202828] focus:border-[#164A4A] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#455250]">Gender</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl px-4 py-3 text-[#202828] focus:border-[#164A4A] outline-none">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#455250]">Height (cm)</label>
              <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="e.g. 175" className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl px-4 py-3 text-[#202828] focus:border-[#164A4A] outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#455250]">Weight (kg)</label>
              <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="e.g. 70" className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl px-4 py-3 text-[#202828] focus:border-[#164A4A] outline-none" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#455250]">Fitness Goal</label>
              <select value={formData.fitnessGoal} onChange={e => setFormData({...formData, fitnessGoal: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl px-4 py-3 text-[#202828] focus:border-[#164A4A] outline-none">
                <option>Weight Loss</option>
                <option>Muscle Building</option>
                <option>Strength & Conditioning</option>
                <option>Endurance</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#455250]">Experience Level</label>
              <select value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl px-4 py-3 text-[#202828] focus:border-[#164A4A] outline-none">
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#455250]">Available Days / Week</label>
              <select value={formData.availableWorkoutDays} onChange={e => setFormData({...formData, availableWorkoutDays: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl px-4 py-3 text-[#202828] focus:border-[#164A4A] outline-none">
                <option>2 Days</option><option>3 Days</option><option>4 Days</option><option>5+ Days</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#455250]">Workout Preference</label>
              <select value={formData.workoutPreference} onChange={e => setFormData({...formData, workoutPreference: e.target.value})} className="w-full bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl px-4 py-3 text-[#202828] focus:border-[#164A4A] outline-none">
                <option>Full Gym</option><option>Dumbbells Only</option><option>Bodyweight (Home)</option>
              </select>
            </div>
          </div>
          
          <button onClick={handleGenerate} disabled={!formData.age || !formData.weight || !formData.height} className="w-full md:w-auto px-8 py-3 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 ml-auto shadow-[0_0_15px_rgba(22,163,74,0.3)]">
            <Zap size={18} />
            <span>Analyze My Fitness</span>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-6 shadow-sm min-h-[400px]">
          <div className="w-16 h-16 border-4 border-[#164A4A]/30 border-t-[#164A4A] rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-bold text-[#202828] animate-pulse">AI is Generating Your Plan</h2>
          <p className="text-[#455250] max-w-md">Our intelligence engine is currently crunching your data and building a custom tailored routine optimizing for {formData.fitnessGoal}.</p>
        </div>
      )}

      {step === 3 && recommendation && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl flex items-center gap-3 border ${
            recommendation.status === 'Trainer Approved' ? 'bg-[#F1F5F3] border-[#D3DFDA] text-[#0F766E]' 
            : recommendation.status === 'AI Generated' ? 'bg-[#F2EFE8] border-[#E8E5DA] text-[#455250]'
            : 'bg-[#FFFBEB] border-[#FEF3C7] text-[#B45309]'
          }`}>
            {recommendation.status === 'Trainer Approved' ? <CheckCircle2 size={24} className="text-[#164A4A]" /> : <AlertCircle size={24} />}
            <div>
              <p className="font-bold">{recommendation.status}</p>
              <p className="text-sm opacity-90">
                {recommendation.status === 'AI Generated' && 'This is an automated plan. It will be sent to your assigned trainer for final review.'}
                {recommendation.status === 'Under Trainer Review' && 'Your assigned trainer is currently reviewing this plan.'}
                {recommendation.status === 'Trainer Approved' && 'Your trainer has reviewed, optimized, and approved this final plan for you.'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#202828] mb-4">Fitness Analysis</h2>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-1">Profile Summary</h4>
                <p className="text-[#202828]">{recommendation.aiAnalysis?.profileSummary}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-1">Goal Recommendations</h4>
                <p className="text-[#202828]">{recommendation.aiAnalysis?.goalRecommendations}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center"><Dumbbell className="mr-2 text-[#164A4A]" size={20}/> Workout Plan</h3>
              <p className="text-sm text-[#687B78] mb-4">{recommendation.workoutRecommendation?.weeklySchedule}</p>
              
              <div className="space-y-3">
                {recommendation.workoutRecommendation?.exercises.map((ex: any, i: number) => (
                  <div key={i} className="p-3 bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl">
                    <h4 className="font-bold text-[#202828]">{ex.name}</h4>
                    <p className="text-[#455250] text-sm mt-1">{ex.sets} Sets × {ex.reps} Reps</p>
                    <div className="flex gap-4 mt-2 text-xs text-[#A8ADA9] font-medium">
                      <span className="flex items-center gap-1"><Clock size={12}/> Rest: {ex.rest}</span>
                      <span className="flex items-center gap-1"><Zap size={12}/> Level: {ex.difficulty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center"><Utensils className="mr-2 text-[#164A4A]" size={20}/> Diet Plan</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-1">Structure</h4>
                    <p className="text-[#202828]">{recommendation.dietRecommendation?.generalStructure}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-1">Meal Timing</h4>
                    <p className="text-[#202828]">{recommendation.dietRecommendation?.mealTiming}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-1">Food Options</h4>
                    <p className="text-[#202828]">{recommendation.dietRecommendation?.foodOptions}</p>
                  </div>
                </div>
              </div>

              {recommendation.trainerNotes && (
                <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-[#B45309] mb-2 flex items-center"><AlertCircle className="mr-2" size={18}/> Trainer Notes</h3>
                  <p className="text-[#92400E] whitespace-pre-wrap">{recommendation.trainerNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberAIFitness;
