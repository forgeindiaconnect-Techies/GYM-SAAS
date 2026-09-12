import React, { useState, useEffect } from 'react';
import { Bot, Activity, Target, Zap, ArrowRight, Save, Lock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MemberAIFitness = () => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await api.get('/memberships/my');
        const active = res.data.memberships?.some((m: any) => m.status === 'ACTIVE');
        setHasAccess(!!active);
      } catch (err) {
        setHasAccess(false);
      }
    };
    checkAccess();
  }, []);

  const [data, setData] = useState({
    goal: 'Weight Loss',
    level: 'Beginner',
    days: '3 days',
    equipment: 'Full Gym'
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setResult({
        summary: "Based on your goal of Weight Loss and Beginner level, here is a customized 3-day routine.",
        routine: [
          { day: "Day 1 (Full Body)", exercises: ["Squats: 3x10", "Pushups (Knee): 3x8", "Plank: 3x30s", "Treadmill: 15 mins"] },
          { day: "Day 2 (Active Recovery)", exercises: ["Light Walking: 20 mins", "Yoga Stretching: 15 mins"] },
          { day: "Day 3 (Cardio & Core)", exercises: ["Rowing: 10 mins", "Crunches: 3x15", "Cycling: 15 mins", "Dumbbell Rows: 3x10"] }
        ],
        dietTip: "Focus on a caloric deficit of 300-500 calories per day. Ensure you consume at least 1g of protein per kg of body weight."
      });
      setStep(3);
    }, 2500);
  };

  if (hasAccess === null) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#16A34A]" size={40} /></div>;
  }

  if (!hasAccess) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#16A34A]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="w-20 h-20 bg-[#FFFFFF] border border-[#CCFBF1] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
            <Lock size={32} className="text-[#475569]" />
          </div>
          
          <h2 className="text-3xl font-bold text-[#1E293B] mb-4 relative z-10">AI Fitness Assistant Locked</h2>
          <p className="text-[#475569] text-lg mb-8 max-w-lg mx-auto relative z-10">
            You need an active gym membership to access personalized AI workout plans, dietary guidance, and progress tracking.
          </p>
          
          <Link to="/gyms" className="inline-flex items-center px-8 py-4 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.2)] relative z-10">
            <Activity className="mr-2" size={20} />
            Find a Gym to Unlock
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#EF4444] to-[#991F3D] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,51,102,0.3)]">
          <Bot size={24} className="text-[#1E293B]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">AI Fitness Engine</h1>
          <p className="text-[#475569] mt-1">Get personalized workout and diet recommendations instantly.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-8 space-y-8 animate-in fade-in zoom-in duration-300">
          <h2 className="text-xl font-semibold text-[#1E293B] border-b border-[#CCFBF1] pb-4">Tell us about your goals</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#475569] flex items-center gap-2"><Target size={16}/> Primary Goal</label>
              <select value={data.goal} onChange={e => setData({...data, goal: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] focus:border-[#16A34A] transition-all outline-none">
                <option>Weight Loss</option>
                <option>Muscle Building</option>
                <option>Strength & Conditioning</option>
                <option>Endurance</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#475569] flex items-center gap-2"><Activity size={16}/> Fitness Level</label>
              <select value={data.level} onChange={e => setData({...data, level: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] focus:border-[#16A34A] transition-all outline-none">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#475569] flex items-center gap-2"><Zap size={16}/> Days per week</label>
              <select value={data.days} onChange={e => setData({...data, days: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] focus:border-[#16A34A] transition-all outline-none">
                <option>2 days</option>
                <option>3 days</option>
                <option>4 days</option>
                <option>5+ days</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#475569]">Available Equipment</label>
              <select value={data.equipment} onChange={e => setData({...data, equipment: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl px-4 py-3 text-[#1E293B] focus:border-[#16A34A] transition-all outline-none">
                <option>Full Gym</option>
                <option>Dumbbells Only</option>
                <option>Bodyweight (Home)</option>
              </select>
            </div>
          </div>
          
          <button onClick={() => setStep(2)} className="w-full md:w-auto px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-[#64748B] transition-colors flex items-center justify-center space-x-2 ml-auto">
            <span>Next Step</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-6">
          {!isGenerating ? (
            <>
              <Bot size={64} className="text-[#16A34A] mb-2" />
              <h2 className="text-2xl font-bold text-[#1E293B]">Ready to Generate</h2>
              <p className="text-[#475569] max-w-md">Our AI engine will analyze your profile and create a personalized plan optimized for {data.goal}.</p>
              <div className="flex gap-4 mt-4">
                <button onClick={() => setStep(1)} className="px-6 py-3 border border-[#CCFBF1] text-white rounded-xl font-semibold hover:bg-[#FFFFFF] transition-colors">Back</button>
                <button onClick={handleGenerate} className="px-8 py-3 bg-gradient-to-r from-[#EF4444] to-[#991F3D] text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center space-x-2 shadow-[0_4px_14px_rgba(255,51,102,0.4)]">
                  <Zap size={18} />
                  <span>Generate AI Plan</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-6 py-8">
              <div className="w-16 h-16 border-4 border-[#16A34A]/30 border-t-[#EF4444] rounded-full animate-spin"></div>
              <p className="text-xl font-medium text-[#1E293B] animate-pulse">Analyzing neural fitness models...</p>
              <p className="text-[#475569]">Optimizing for {data.goal}...</p>
            </div>
          )}
        </div>
      )}

      {step === 3 && result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-r from-[#FFFFFF] to-[#1a1013] border border-[#CCFBF1] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#16A34A] mb-2">Your AI Plan is Ready</h2>
            <p className="text-[#1E293B] font-medium">{result.summary}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
              <h3 className="text-xl font-bold text-[#1E293B] mb-4 flex items-center"><Dumbbell className="mr-2 text-[#16A34A]" size={20}/> Workout Routine</h3>
              <div className="space-y-4">
                {result.routine.map((day, idx) => (
                  <div key={idx} className="bg-[#FFFFFF] rounded-xl p-4 border border-[#CCFBF1]">
                    <h4 className="font-bold text-[#1E293B] mb-2">{day.day}</h4>
                    <ul className="space-y-1">
                      {day.exercises.map((ex, i) => (
                        <li key={i} className="text-[#475569] text-sm flex items-start"><ArrowRight size={14} className="mr-2 mt-0.5 text-[#16A34A] shrink-0" /> {ex}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
                <h3 className="text-xl font-bold text-[#1E293B] mb-4 flex items-center"><Utensils className="mr-2 text-[#16A34A]" size={20}/> Nutrition Guidance</h3>
                <p className="text-[#475569]">{result.dietTip}</p>
              </div>
              
              <button onClick={() => setStep(1)} className="w-full py-4 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors flex justify-center items-center gap-2">
                <Save size={20} /> Save to My Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
// Add missing icons that were used inside the component
import { Utensils, Dumbbell } from 'lucide-react';
export default MemberAIFitness;
