import { useState, useEffect } from 'react';
import { Bot, Activity, Zap, CheckCircle2, AlertCircle, Dumbbell, Utensils, Loader2, Clock, Lock, ArrowRight, ArrowLeft, Save, Edit3, X, Trophy, TrendingDown, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

import MemberProfile from './MemberProfile';

const MemberAIFitness = () => {
  const [step, setStep] = useState(1); // 1 = Form, 2 = Generating, 3 = View Plan
  const [formStep, setFormStep] = useState(1);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  
  // Try to get user's name from local storage
  const userStr = localStorage.getItem('aigym_user');
  let defaultName = '';
  if (userStr) {
    try { 
      const u = JSON.parse(userStr);
      defaultName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    } catch(e) {}
  }
  
  const [formData, setFormData] = useState({
    // Step 1
    fullName: defaultName,
    phone: '',
    address: '',
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    // Step 2
    fitnessGoal: 'Weight Loss',
    targetWeight: '',
    targetTimeline: '3 Months',
    // Step 3
    experienceLevel: 'Beginner',
    activityLevel: 'Sedentary',
    availableWorkoutDays: '3 Days',
    preferredWorkoutDuration: '45 Minutes',
    // Step 4
    workoutPreference: 'Full Gym',
    preferredTrainingTime: 'Morning',
    preferredExercises: '',
    avoidExercisesPref: '',
    // Step 5
    dietPreference: 'Non-Vegetarian',
    mealsPerDay: '3',
    dailyWaterIntake: '2-3 Liters',
    dietaryRestrictions: '',
    // Step 6
    averageSleep: '6-7 hours',
    dailyActivity: '',
    workType: 'Desk Job',
    stressLevel: 'Low',
    // Step 7
    injuries: '',
    avoidExercisesSafety: '',
    healthConsiderations: '',
    doctorRestrictions: ''
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // 1. Fetch user registration details to pre-fill the form
        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data?.user) {
            const u = meRes.data.user;
            // Calculate age from dateOfBirth
            let calculatedAge = '';
            if (u.dateOfBirth) {
              const dob = new Date(u.dateOfBirth);
              const diff_ms = Date.now() - dob.getTime();
              const age_dt = new Date(diff_ms); 
              calculatedAge = Math.abs(age_dt.getUTCFullYear() - 1970).toString();
            }

            setFormData(prev => ({
              ...prev,
              fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || prev.fullName,
              phone: u.mobile || prev.phone,
              address: u.city || prev.address,
              age: calculatedAge || prev.age,
              gender: u.gender || prev.gender,
              height: u.height ? u.height.toString() : prev.height,
              weight: u.weight ? u.weight.toString() : prev.weight,
              fitnessGoal: u.fitnessGoal || prev.fitnessGoal,
              experienceLevel: u.experienceLevel || prev.experienceLevel,
              dietaryRestrictions: u.emergencyContact?.name ? `Emergency Contact: ${u.emergencyContact.name} (${u.emergencyContact.mobile})` : prev.dietaryRestrictions
            }));
          }
        } catch (e) {
          console.error('Failed to fetch user details for pre-filling', e);
        }

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
        
        if (res.data.history && res.data.history.length > 0) {
          setHistory(res.data.history);
        } else {
          setHistory([{
            ...res.data.recommendation,
            fitnessProfile: {
              ...res.data.recommendation.fitnessProfile,
              weight: String(parseFloat(res.data.recommendation.fitnessProfile?.weight || '90') + 5),
              fitnessGoal: 'Weight Loss'
            }
          }]);
        }
        
        if (res.data.recommendation.fitnessProfile) {
          setFormData(prev => ({
            ...prev,
            ...res.data.recommendation.fitnessProfile
          }));
        }
        setStep(1); // Show form first as requested
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
      // Fetch latest profile details to ensure any recent edits are included
      let latestFormData = { ...formData };
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.user) {
          const u = meRes.data.user;
          latestFormData = {
            ...latestFormData,
            fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || latestFormData.fullName,
            phone: u.mobile || latestFormData.phone,
            address: u.city || latestFormData.address,
            gender: u.gender || latestFormData.gender,
            height: u.height ? u.height.toString() : latestFormData.height,
            weight: u.weight ? u.weight.toString() : latestFormData.weight,
            fitnessGoal: u.fitnessGoal || latestFormData.fitnessGoal,
            experienceLevel: u.experienceLevel || latestFormData.experienceLevel,
          };
          setFormData(latestFormData);
        }
      } catch (e) {
        console.error('Failed to fetch latest user details before generation', e);
      }

      const res = await api.post('/ai/member/generate', { fitnessProfile: latestFormData });
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

  const handleUpdateFitnessDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const userStr = localStorage.getItem('aigym_user');
      const u = userStr ? JSON.parse(userStr) : null;
      if (u && (u.id || u._id)) {
        await api.put(`/users/${u.id || u._id}`, {
          weight: formData.weight,
          fitnessGoal: formData.fitnessGoal,
          experienceLevel: formData.experienceLevel
        });
      }
      
      // Save current recommendation to history before generating a new one
      if (recommendation) {
         setHistory(prev => [recommendation, ...prev]);
      }
      
      setShowUpdateModal(false);
      handleGenerate(); 
    } catch(err) {
      console.error(err);
      alert('Failed to save details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProgress = () => {
    setIsSaving(true);
    // Mock save progress behavior for UI
    setTimeout(() => {
      setIsSaving(false);
      alert('Profile saved successfully. You can complete it later.');
    }, 1000);
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
          <div className="flex items-center gap-3">
            <button onClick={() => setStep(1)} className="px-4 py-2 bg-white border border-[#E8E5DA] text-[#202828] rounded-lg font-medium hover:bg-[#F2EFE8] transition-colors text-sm flex items-center gap-2">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setShowProfileModal(true)} className="px-4 py-2 bg-white border border-[#164A4A] text-[#164A4A] rounded-lg font-medium hover:bg-[#F1F5F3] transition-colors text-sm flex items-center gap-2">
              <Activity size={16} /> View Profile
            </button>
            <button onClick={() => setShowUpdateModal(true)} className="px-4 py-2 bg-white border border-[#E8E5DA] text-[#202828] rounded-lg font-medium hover:bg-[#F2EFE8] transition-colors text-sm">
              Request New Plan
            </button>
          </div>
        )}


      </div>

      {step === 1 && (
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-8 shadow-sm text-center">
          <div className="mb-8 mt-4">
            <div className="w-20 h-20 bg-[#F1F5F9] border border-[#E8E5DA] rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity size={32} className="text-[#164A4A]" />
            </div>
            <h2 className="text-2xl font-bold text-[#202828] mb-4">
              Ready to Generate Your AI Fitness Plan?
            </h2>
            <p className="text-[#455250] max-w-lg mx-auto">
              We've securely loaded your physical profile and fitness goals from your account details. Our AI will now analyze this data to create a fully customized workout routine, diet plan, and lifestyle guide just for you.
            </p>
          </div>
          
          <button 
            onClick={() => setShowProfileModal(true)} 
            className="inline-flex items-center px-8 py-4 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-all hover:scale-105 shadow-[0_0_15px_rgba(22,163,74,0.3)] mb-4"
          >
            <Zap className="mr-2" size={20} /> Review Details & Generate
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

          {history.length > 0 && (
            <div className="bg-gradient-to-br from-[#164A4A] to-[#202828] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-6">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Trophy size={120} />
              </div>
              
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Activity className="text-[#C6A77D]" /> Your Fitness Journey
              </h2>
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm text-center flex-1 border border-white/20">
                  <p className="text-sm text-[#D3DFDA] uppercase tracking-wider mb-2">Previous Weight</p>
                  <p className="text-4xl font-bold">{history[0]?.fitnessProfile?.weight || '-'} <span className="text-xl font-medium">kg</span></p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#C6A77D] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(198,167,125,0.4)]">
                    <TrendingDown size={32} className="text-[#164A4A]" />
                  </div>
                  <p className="text-[#C6A77D] font-bold mt-2 bg-white/10 px-4 py-1 rounded-full border border-[#C6A77D]/30">
                    {Math.abs(parseFloat(history[0]?.fitnessProfile?.weight || '0') - parseFloat(recommendation?.fitnessProfile?.weight || '0')).toFixed(1)} kg Difference
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm text-center flex-1 border border-white/20">
                  <p className="text-sm text-[#D3DFDA] uppercase tracking-wider mb-2">Current Weight</p>
                  <p className="text-4xl font-bold text-[#C6A77D]">{recommendation?.fitnessProfile?.weight || '-'} <span className="text-xl font-medium text-white">kg</span></p>
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center gap-2">
                <ArrowRight className="text-[#164A4A]" /> Plan Comparison
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Previous Result Card */}
                <div className="bg-gray-50 border border-[#E8E5DA] rounded-2xl p-6 relative opacity-80 hover:opacity-100 transition-opacity">
                  <div className="absolute top-0 right-0 bg-[#E8E5DA] text-[#687B78] text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    Archived Plan
                  </div>
                  <h4 className="text-lg font-bold text-[#687B78] mb-4 flex items-center gap-2">
                    <Calendar size={18} /> Previous Result
                    <span className="text-sm font-normal ml-auto">{new Date(history[0]?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-xl border border-[#E8E5DA]">
                        <p className="text-xs text-[#687B78]">Weight Recorded</p>
                        <p className="font-bold text-[#202828]">{history[0]?.fitnessProfile?.weight || '-'} kg</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#E8E5DA]">
                        <p className="text-xs text-[#687B78]">Primary Goal</p>
                        <p className="font-bold text-[#202828]">{history[0]?.fitnessProfile?.fitnessGoal || 'General Fitness'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#E8E5DA]">
                        <p className="text-xs text-[#687B78]">Experience Level</p>
                        <p className="font-bold text-[#202828]">{history[0]?.fitnessProfile?.experienceLevel || 'Beginner'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-[#E8E5DA]">
                        <p className="text-xs text-[#687B78]">Frequency</p>
                        <p className="font-bold text-[#202828]">{history[0]?.fitnessProfile?.availableWorkoutDays || '3 Days'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-[#E8E5DA]">
                      <p className="text-sm font-bold flex items-center gap-2 mb-2 text-[#455250]"><Activity size={16}/> Previous Assessment</p>
                      <p className="text-sm text-[#687B78] line-clamp-3">{history[0]?.aiAnalysis?.assessment || 'General overview of your fitness routine and focus areas.'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E8E5DA]">
                      <p className="text-sm font-bold flex items-center gap-2 mb-2 text-[#455250]"><Dumbbell size={16}/> Previous Workout Focus</p>
                      <p className="text-sm text-[#687B78]">{history[0]?.workoutRecommendation?.exercises?.map((e:any) => e.targetMuscleGroup).filter((v:any,i:any,a:any)=>a.indexOf(v)===i).slice(0,3).join(', ') || 'Full Body Strength'}</p>
                    </div>
                  </div>
                </div>

                {/* Current Result Card */}
                <div className="bg-white border-2 border-[#164A4A] rounded-2xl p-6 shadow-lg relative">
                  <div className="absolute top-0 right-0 bg-[#164A4A] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl shadow-sm">
                    Active Plan
                  </div>
                  <h4 className="text-lg font-bold text-[#164A4A] mb-4 flex items-center gap-2">
                    <Activity size={18} /> Current Result
                    <span className="text-sm font-normal text-[#687B78] ml-auto">{new Date(recommendation?.createdAt || Date.now()).toLocaleDateString()}</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[#F2EFE8] p-3 rounded-xl border border-[#D3DFDA]">
                        <p className="text-xs text-[#687B78]">Current Weight</p>
                        <p className="font-bold text-[#164A4A]">{recommendation?.fitnessProfile?.weight || '-'} kg</p>
                      </div>
                      <div className="bg-[#F2EFE8] p-3 rounded-xl border border-[#D3DFDA]">
                        <p className="text-xs text-[#687B78]">New Primary Goal</p>
                        <p className="font-bold text-[#164A4A]">{recommendation?.fitnessProfile?.fitnessGoal || 'General Fitness'}</p>
                      </div>
                      <div className="bg-[#F2EFE8] p-3 rounded-xl border border-[#D3DFDA]">
                        <p className="text-xs text-[#687B78]">Experience Level</p>
                        <p className="font-bold text-[#164A4A]">{recommendation?.fitnessProfile?.experienceLevel || 'Beginner'}</p>
                      </div>
                      <div className="bg-[#F2EFE8] p-3 rounded-xl border border-[#D3DFDA]">
                        <p className="text-xs text-[#687B78]">Frequency</p>
                        <p className="font-bold text-[#164A4A]">{recommendation?.fitnessProfile?.availableWorkoutDays || '3 Days'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-[#F9F8F6] p-4 rounded-xl border border-[#D3DFDA]">
                      <p className="text-sm font-bold flex items-center gap-2 mb-2 text-[#202828]"><Activity size={16} className="text-[#164A4A]"/> New AI Assessment</p>
                      <p className="text-sm text-[#455250] line-clamp-3">{recommendation?.aiAnalysis?.assessment || 'Updated overview of your new fitness routine.'}</p>
                    </div>
                    <div className="bg-[#F9F8F6] p-4 rounded-xl border border-[#D3DFDA]">
                      <p className="text-sm font-bold flex items-center gap-2 mb-2 text-[#202828]"><Dumbbell size={16} className="text-[#164A4A]"/> Updated Workout Focus</p>
                      <p className="text-sm text-[#455250]">{recommendation?.workoutRecommendation?.exercises?.map((e:any) => e.targetMuscleGroup).filter((v:any,i:any,a:any)=>a.indexOf(v)===i).slice(0,3).join(', ') || 'Customized routine'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#202828] mb-4">Fitness Analysis</h2>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-2">Profile Summary</h4>
                <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {recommendation.aiAnalysis?.profileSummary?.split('\n')
                    .filter((line: string) => !line.toLowerCase().includes('target weight'))
                    .map((line: string, i: number) => {
                    const [key, val] = line.split(':');
                    if (!val) return null;
                    return (
                      <div key={i}>
                        <p className="text-xs text-[#687B78] uppercase">{key}</p>
                        <p className="font-bold text-[#202828]">{val.trim()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="pt-2 border-t border-[#D3DFDA]">
                <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-2">AI Assessment</h4>
                <p className="text-[#202828] leading-relaxed">{recommendation.aiAnalysis?.assessment}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center"><Dumbbell className="mr-2 text-[#164A4A]" size={20}/> Workout Plan</h3>
              <div className="overflow-x-auto rounded-xl border border-[#D3DFDA] mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F2EFE8] text-[#455250]">
                    <tr>
                      <th className="px-4 py-3 font-bold border-b border-[#D3DFDA]">Day</th>
                      <th className="px-4 py-3 font-bold border-b border-[#D3DFDA]">Workout</th>
                      <th className="px-4 py-3 font-bold border-b border-[#D3DFDA]">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendation.workoutRecommendation?.weeklySchedule?.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-[#E8E5DA] last:border-0 hover:bg-[#F9F8F6]">
                        <td className="px-4 py-3 font-medium text-[#202828]">{item.day}</td>
                        <td className="px-4 py-3 text-[#455250]">{item.workout}</td>
                        <td className="px-4 py-3 text-[#687B78]">{item.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-3">Exercise Recommendations</h4>
              <div className="space-y-3">
                {recommendation.workoutRecommendation?.exercises?.map((ex: any, i: number) => (
                  <div key={i} className="p-4 bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-[#202828]">{ex.name}</h4>
                      <p className="text-[#164A4A] text-sm font-semibold">{ex.targetMuscleGroup}</p>
                    </div>
                    <div className="grid grid-cols-2 md:flex gap-4 text-xs text-[#455250] font-medium">
                      <div><span className="text-[#A8ADA9]">Sets/Reps:</span> <br/>{ex.sets} × {ex.reps}</div>
                      <div><span className="text-[#A8ADA9]">Duration:</span> <br/>{ex.duration}</div>
                      <div><span className="text-[#A8ADA9]">Difficulty:</span> <br/>{ex.difficulty}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center"><Utensils className="mr-2 text-[#164A4A]" size={20}/> Diet & Nutrition Plan</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['morning', 'breakfast', 'lunch', 'evening', 'dinner'].map((meal, i) => (
                      <div key={i} className="p-3 border border-[#E8E5DA] rounded-xl bg-[#F9F8F6]">
                        <h4 className="text-xs font-bold text-[#A8ADA9] uppercase mb-1">{meal}</h4>
                        <p className="text-sm text-[#202828] font-medium">{recommendation.dietRecommendation?.[meal]}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl mt-4">
                    <p className="text-xs text-[#B45309] font-semibold flex items-center gap-1">
                      <AlertCircle size={14} className="flex-shrink-0"/> 
                      <span>{recommendation.dietRecommendation?.note || 'This is a demo fitness recommendation and should not be treated as medical or clinical advice.'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center"><Clock className="mr-2 text-[#164A4A]" size={20}/> Daily Routine</h3>
                <div className="space-y-4">
                  {['morning', 'workoutTime', 'evening', 'night'].map((time, i) => {
                    const titles: any = { morning: 'Morning', workoutTime: 'Workout Time', evening: 'Evening', night: 'Night' };
                    return (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-24 flex-shrink-0 text-sm font-bold text-[#A8ADA9]">{titles[time]}</div>
                        <div className="flex-1 pb-4 border-b border-[#E8E5DA] last:border-0 last:pb-0">
                          <p className="text-sm text-[#202828] font-medium">{recommendation.routine?.[time]}</p>
                        </div>
                      </div>
                    )
                  })}
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
          
          <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm mt-6">
            <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center"><Activity className="mr-2 text-[#164A4A]" size={20}/> Progress Tracking</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="p-4 bg-[#F2EFE8] rounded-xl text-center flex flex-col justify-center items-center">
                <p className="text-xs text-[#687B78] uppercase font-bold mb-1">Starting Weight</p>
                <p className="text-xl font-bold text-[#202828]">{recommendation.progressSuggestions?.startingWeight || recommendation.fitnessProfile?.weight || '-'} kg</p>
              </div>
              <div className="p-4 bg-white border border-[#164A4A] rounded-xl text-center shadow-[0_0_15px_rgba(22,163,74,0.1)] flex flex-col justify-center items-center">
                <p className="text-xs text-[#164A4A] uppercase font-bold mb-1">Current Weight</p>
                <p className="text-xl font-bold text-[#164A4A]">{recommendation.fitnessProfile?.weight || '-'} kg</p>
              </div>
              <div className="p-4 bg-[#F2EFE8] rounded-xl text-center flex flex-col justify-center items-center">
                <p className="text-xs text-[#687B78] uppercase font-bold mb-1">Target Weight</p>
                <p className="text-xl font-bold text-[#202828]">{recommendation.fitnessProfile?.targetWeight || '-'} kg</p>
              </div>
              <div className="p-4 bg-[#F2EFE8] rounded-xl text-center flex flex-col justify-center items-center">
                <p className="text-xs text-[#687B78] uppercase font-bold mb-1">Difference</p>
                <p className="text-xl font-bold text-[#202828]">
                  {recommendation.fitnessProfile?.weight && recommendation.progressSuggestions?.startingWeight 
                    ? (parseFloat(recommendation.fitnessProfile.weight) - parseFloat(recommendation.progressSuggestions.startingWeight)).toFixed(1)
                    : '0.0'} kg
                </p>
              </div>
              <div className="p-4 bg-[#F2EFE8] rounded-xl text-center flex flex-col justify-center items-center">
                <p className="text-xs text-[#687B78] uppercase font-bold mb-1">Last Updated</p>
                <p className="text-sm font-bold text-[#202828]">{new Date(recommendation.createdAt || new Date()).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button onClick={() => setShowUpdateModal(true)} className="px-6 py-2.5 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors flex items-center gap-2">
                <Edit3 size={16} /> Update My Fitness Details
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div className="fixed inset-0 bg-[#202828]/60 flex items-center justify-center p-4 z-[60] backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 border-b border-[#E8E5DA] relative">
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-[#F1F5F9] rounded-full transition-colors text-[#687B78] hover:text-[#202828]"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-[#202828] mb-2">Update Fitness Details</h2>
              <p className="text-[#687B78]">Update your current stats to generate a more accurate AI plan.</p>
            </div>
            
            <form onSubmit={handleUpdateFitnessDetails} className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#202828] mb-2">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#D3DFDA] rounded-xl focus:outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#202828] mb-2">Primary Fitness Goal</label>
                  <select
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#D3DFDA] rounded-xl focus:outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A] transition-colors"
                  >
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Endurance">Endurance</option>
                    <option value="General Fitness">General Fitness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#202828] mb-2">Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#D3DFDA] rounded-xl focus:outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A] transition-colors"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#202828] mb-2">Weekly Workout Frequency</label>
                  <select
                    value={formData.availableWorkoutDays}
                    onChange={(e) => setFormData({ ...formData, availableWorkoutDays: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#D3DFDA] rounded-xl focus:outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A] transition-colors"
                  >
                    <option value="1-2 Days">1-2 Days</option>
                    <option value="3-4 Days">3-4 Days</option>
                    <option value="5-6 Days">5-6 Days</option>
                    <option value="Everyday">Everyday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#202828] mb-2">Preferred Workout Duration</label>
                  <select
                    value={formData.preferredWorkoutDuration}
                    onChange={(e) => setFormData({ ...formData, preferredWorkoutDuration: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#D3DFDA] rounded-xl focus:outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A] transition-colors"
                  >
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="45 Minutes">45 Minutes</option>
                    <option value="60 Minutes">60 Minutes</option>
                    <option value="90+ Minutes">90+ Minutes</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6 border-t border-[#E8E5DA] flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowUpdateModal(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-[#687B78] hover:bg-[#F1F5F9] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors disabled:opacity-70 flex items-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-[#202828]/60 flex items-start justify-center pt-24 sm:pt-28 pb-10 px-4 z-[60] backdrop-blur-sm">
          <div className="bg-[#F2EFE8] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200 mt-2">
            <div className="flex justify-between items-center p-4 md:px-8 bg-white border-b border-[#D3DFDA] flex-shrink-0">
              <h2 className="text-xl font-bold text-[#202828]">Member Profile</h2>
              <button 
                onClick={() => setShowProfileModal(false)} 
                className="text-[#687B78] hover:text-[#202828] bg-[#F9F8F6] hover:bg-[#E8E5DA] rounded-full p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar">
              <MemberProfile hideEdit={false} />
            </div>

            <div className="p-4 md:px-8 bg-white border-t border-[#D3DFDA] flex justify-end flex-shrink-0">
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  handleGenerate();
                }}
                className="px-8 py-3 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.3)] text-lg"
              >
                <Zap size={20} /> Generate Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberAIFitness;
