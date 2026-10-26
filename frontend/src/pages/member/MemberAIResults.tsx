import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
  Activity, Trophy, TrendingDown, TrendingUp, ArrowRight, Calendar, Dumbbell, 
  Utensils, Clock, Loader2, Sparkles, Lock, CheckCircle2, 
  User, ShieldAlert, HeartPulse, Award, Zap, ChevronDown, ChevronUp, RefreshCw, Moon,
  Plus, Edit3, Scale, Ruler, Target, Flame, X, Check, Brain, FileText, CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberAIResults = () => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'output' | 'progress'>('output');
  const [showAiDraftBaseline, setShowAiDraftBaseline] = useState(true);
  const [selectedDietDay, setSelectedDietDay] = useState<string>('Monday');

  // Modal & AI generation state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generationSuccessMsg, setGenerationSuccessMsg] = useState('');

  // Comprehensive progress update form state matching all intake form fields
  const [progressForm, setProgressForm] = useState({
    weight: '',
    targetWeight: '',
    targetTimeline: '3 Months',
    height: '',
    currentFitnessLevel: 'Beginner',
    workoutExperience: '1-3 years',
    activityLevel: 'Moderately Active',
    fitnessGoal: 'Weight Loss',
    preferredTraining: 'Offline',
    preferredWorkoutTime: 'Morning (7-9am)',
    preferredWorkoutDays: '4 Days',
    preferredWorkoutDuration: '45 Minutes',
    preferredWorkoutType: 'Gym Weights / Resistance',
    equipmentAvailability: 'Full Commercial Gym',
    dietaryPreferences: 'Non-Vegetarian',
    mealsPerDay: '3',
    dailyWaterIntake: '2-3 Liters',
    averageSleep: '7-8 hours',
    stressLevel: 'Moderate',
    injuries: 'None',
    healthConsiderations: 'None',
    chest: '38 in',
    waist: '33 in',
    hips: '39 in',
    arms: '13.5 in',
    thighs: '22 in',
    notes: ''
  });

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/ai/member/latest');
        if (res.data.recommendation) {
          setRecommendation(res.data.recommendation);
          if (res.data.history && res.data.history.length > 0) {
            setHistory(res.data.history);
          } else {
            // History fallback for comparison view
            setHistory([{
              ...res.data.recommendation,
              fitnessProfile: {
                ...res.data.recommendation.fitnessProfile,
                weight: String(parseFloat(res.data.recommendation.fitnessProfile?.weight || '90') + 5),
                fitnessGoal: 'Weight Loss',
                bodyMeasurements: {
                  chest: '40 in',
                  waist: '35 in',
                  hips: '41 in',
                  arms: '13 in',
                  thighs: '23 in',
                  ...(res.data.recommendation.fitnessProfile?.bodyMeasurements || {})
                }
              },
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  // Sync progressForm whenever recommendation updates
  useEffect(() => {
    if (recommendation?.fitnessProfile) {
      const fp = recommendation.fitnessProfile;
      setProgressForm(prev => ({
        ...prev,
        weight: fp.weight || prev.weight,
        targetWeight: fp.targetWeight || prev.targetWeight || '68',
        targetTimeline: fp.targetTimeline || prev.targetTimeline || '3 Months',
        height: fp.height || prev.height || '175',
        fitnessGoal: fp.fitnessGoal || prev.fitnessGoal || 'Weight Loss',
        currentFitnessLevel: fp.currentFitnessLevel || fp.experienceLevel || prev.currentFitnessLevel || 'Beginner',
        workoutExperience: fp.workoutExperience || prev.workoutExperience || '1-3 years',
        activityLevel: fp.activityLevel || prev.activityLevel || 'Moderately Active',
        preferredTraining: fp.preferredTraining || prev.preferredTraining || 'Offline',
        preferredWorkoutTime: fp.preferredWorkoutTime || prev.preferredWorkoutTime || 'Morning (7-9am)',
        preferredWorkoutDays: fp.availableWorkoutDays || prev.preferredWorkoutDays || '4 Days',
        preferredWorkoutDuration: fp.preferredWorkoutDuration || prev.preferredWorkoutDuration || '45 Minutes',
        preferredWorkoutType: fp.preferredWorkoutType || prev.preferredWorkoutType || 'Gym Weights / Resistance',
        equipmentAvailability: fp.equipmentAvailability || prev.equipmentAvailability || 'Full Commercial Gym',
        dietaryPreferences: fp.dietaryPreferences || prev.dietaryPreferences || 'Non-Vegetarian',
        mealsPerDay: fp.mealsPerDay || prev.mealsPerDay || '3',
        dailyWaterIntake: fp.dailyWaterIntake || prev.dailyWaterIntake || '2-3 Liters',
        averageSleep: fp.averageSleep || prev.averageSleep || '7-8 hours',
        stressLevel: fp.stressLevel || prev.stressLevel || 'Moderate',
        injuries: fp.injuries || prev.injuries || 'None',
        healthConsiderations: fp.healthConsiderations || prev.healthConsiderations || 'None',
        chest: fp.bodyMeasurements?.chest || prev.chest || '38 in',
        waist: fp.bodyMeasurements?.waist || prev.waist || '33 in',
        hips: fp.bodyMeasurements?.hips || prev.hips || '39 in',
        arms: fp.bodyMeasurements?.arms || prev.arms || '13.5 in',
        thighs: fp.bodyMeasurements?.thighs || prev.thighs || '22 in',
        notes: fp.notes || prev.notes || ''
      }));
    }
  }, [recommendation]);

  const handleGenerateWithAI = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGeneratingAi(true);
    setGenerationSuccessMsg('');
    try {
      const currentFp = recommendation?.fitnessProfile || {};
      const updatedProfile = {
        ...currentFp,
        weight: progressForm.weight || currentFp.weight || '75',
        targetWeight: progressForm.targetWeight || currentFp.targetWeight || '68',
        targetTimeline: progressForm.targetTimeline || currentFp.targetTimeline || '3 Months',
        height: progressForm.height || currentFp.height || '175',
        fitnessGoal: progressForm.fitnessGoal || currentFp.fitnessGoal || 'Weight Loss',
        currentFitnessLevel: progressForm.currentFitnessLevel || currentFp.currentFitnessLevel || 'Beginner',
        workoutExperience: progressForm.workoutExperience || currentFp.workoutExperience || '1-3 years',
        activityLevel: progressForm.activityLevel || currentFp.activityLevel || 'Moderately Active',
        preferredTraining: progressForm.preferredTraining || currentFp.preferredTraining || 'Offline',
        preferredWorkoutTime: progressForm.preferredWorkoutTime || currentFp.preferredWorkoutTime || 'Morning (7-9am)',
        availableWorkoutDays: progressForm.preferredWorkoutDays || currentFp.availableWorkoutDays || '4 Days',
        preferredWorkoutDuration: progressForm.preferredWorkoutDuration || currentFp.preferredWorkoutDuration || '45 Minutes',
        preferredWorkoutType: progressForm.preferredWorkoutType || currentFp.preferredWorkoutType || 'Gym Weights / Resistance',
        equipmentAvailability: progressForm.equipmentAvailability || currentFp.equipmentAvailability || 'Full Commercial Gym',
        dietaryPreferences: progressForm.dietaryPreferences || currentFp.dietaryPreferences || 'Non-Vegetarian',
        mealsPerDay: progressForm.mealsPerDay || currentFp.mealsPerDay || '3',
        dailyWaterIntake: progressForm.dailyWaterIntake || currentFp.dailyWaterIntake || '2-3 Liters',
        averageSleep: progressForm.averageSleep || currentFp.averageSleep || '7-8 hours',
        stressLevel: progressForm.stressLevel || currentFp.stressLevel || 'Moderate',
        injuries: progressForm.injuries || currentFp.injuries || 'None',
        healthConsiderations: progressForm.healthConsiderations || currentFp.healthConsiderations || 'None',
        notes: progressForm.notes || currentFp.notes || '',
        bodyMeasurements: {
          chest: progressForm.chest || currentFp.bodyMeasurements?.chest || '38 in',
          waist: progressForm.waist || currentFp.bodyMeasurements?.waist || '33 in',
          hips: progressForm.hips || currentFp.bodyMeasurements?.hips || '39 in',
          arms: progressForm.arms || currentFp.bodyMeasurements?.arms || '13.5 in',
          thighs: progressForm.thighs || currentFp.bodyMeasurements?.thighs || '22 in'
        }
      };

      // 1. Log to Progress API
      try {
        await api.post('/progress/log', {
          weight: parseFloat(updatedProfile.weight),
          chestMeasurement: parseFloat(String(updatedProfile.bodyMeasurements.chest).replace(/[^0-9.]/g, '')) || undefined,
          waistMeasurement: parseFloat(String(updatedProfile.bodyMeasurements.waist).replace(/[^0-9.]/g, '')) || undefined,
          armsMeasurement: parseFloat(String(updatedProfile.bodyMeasurements.arms).replace(/[^0-9.]/g, '')) || undefined,
          notes: updatedProfile.notes
        });
      } catch (logErr) {
        console.warn('Progress log error notice:', logErr);
      }

      // 2. Call AI generate
      const res = await api.post('/ai/member/generate', { fitnessProfile: updatedProfile });
      if (res.data?.recommendation) {
        if (recommendation) {
          setHistory(prev => [recommendation, ...prev]);
        }
        setRecommendation(res.data.recommendation);
        setShowProgressModal(false);
        setActiveTab('progress');
        setGenerationSuccessMsg('New AI result successfully generated! Your progress comparison and plan have been updated.');
        setTimeout(() => setGenerationSuccessMsg(''), 7000);
      }
    } catch (err: any) {
      console.error('Failed to generate AI plan:', err);
      alert(err.response?.data?.message || 'Failed to generate updated plan with AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-[#2DD4BF]" size={40} />
      </div>
    );
  }
  
  if (!recommendation) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-[#0E1415] border border-[#1B2728] rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={32} className="text-[#9AAEAE]" />
          </div>
          <h2 className="text-3xl font-bold text-[#F5FAFA] mb-4">No AI Results Found</h2>
          <p className="text-[#9AAEAE] text-lg mb-8 max-w-lg mx-auto">
            You haven&apos;t generated an AI fitness assessment yet. Please go to the AI Fitness assessment page to submit your health profile.
          </p>
          <Link
            to="/member/ai-assistant"
            className="inline-flex items-center px-6 py-3 bg-[#2DD4BF] text-[#06201D] font-bold font-bold rounded-xl hover:bg-[#5EEAD4] transition-colors"
          >
            Start Assessment →
          </Link>
        </div>
      </div>
    );
  }

  const isApproved = recommendation.status === 'Trainer Approved' || 
                     recommendation.status === 'Published to Customer' || 
                     recommendation.status === 'Published';
  const isPending = !isApproved;

  // Extract trainer modifications diff if available
  const workoutMods = recommendation.trainerModifications?.workoutModifications || [];
  const trainerName = recommendation.trainerModifications?.modifiedByTrainerName || 
                      recommendation.finalApprovedPlan?.approvedByTrainerName || 
                      recommendation.trainerId?.name || 
                      'Certified Trainer';
  const trainerNotes = recommendation.trainerNotes || 
                       recommendation.finalApprovedPlan?.trainerNotes || 
                       recommendation.trainerModifications?.trainerNotes;
  const trainerRecs = recommendation.trainerRecommendations || 
                      recommendation.finalApprovedPlan?.trainerRecommendations || 
                      recommendation.trainerModifications?.trainerSpecificRecommendations;

  // Active exercises source
  const approvedExercises = recommendation.finalApprovedPlan?.workoutPlan?.exercises?.length > 0
    ? recommendation.finalApprovedPlan.workoutPlan.exercises
    : (recommendation.workoutRecommendation?.exercises || recommendation.workoutPlan || []);

  const weeklySchedule = recommendation.finalApprovedPlan?.workoutPlan?.weeklySchedule?.length > 0
    ? recommendation.finalApprovedPlan.workoutPlan.weeklySchedule
    : (recommendation.workoutRecommendation?.weeklySchedule || []);

  const dietPlan = recommendation.finalApprovedPlan?.dietPlan || recommendation.dietRecommendation;
  const activeDailyMeal = (dietPlan?.dailyMealPlans && Array.isArray(dietPlan.dailyMealPlans))
    ? (dietPlan.dailyMealPlans.find((m: any) => m.day === selectedDietDay) || dietPlan.dailyMealPlans[0])
    : null;
  const recoveryPlan = recommendation.finalApprovedPlan?.recoveryPlan || recommendation.recoveryRecommendations;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/20 text-[#06201D] font-bold">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#F5FAFA] tracking-tight">AI Fitness Results</h1>
            <p className="text-[#9AAEAE] mt-1 text-sm">
              {isApproved 
                ? 'Your certified trainer-reviewed and approved fitness regimen.'
                : 'Customer health intake summary & live trainer review status.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowProgressModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] hover:opacity-95 text-[#06201D] font-bold font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-teal-900/10 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Generate with AI</span>
          </button>
          {isApproved ? (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-[#1B2728] text-[#2DD4BF] border border-[#2A3A3A] flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={14} className="text-[#2DD4BF]" /> Trainer Approved Plan
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-sm">
              <Clock size={14} className="text-amber-600 animate-pulse" /> Pending Trainer Review
            </span>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {generationSuccessMsg && (
        <div className="p-4 bg-[#1B2728] border border-[#2A3A3A] rounded-2xl flex items-center justify-between text-[#2DD4BF] font-semibold text-sm shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={20} className="text-[#2DD4BF] shrink-0" />
            <span>{generationSuccessMsg}</span>
          </div>
          <button onClick={() => setGenerationSuccessMsg('')} className="text-[#2DD4BF] hover:text-[#2DD4BF] p-1">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#2A3A3A] mb-6">
        <button 
          onClick={() => setActiveTab('output')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'output' 
              ? 'border-[#2DD4BF] text-[#2DD4BF]' 
              : 'border-transparent text-[#9AAEAE] hover:text-[#FFFFFF]'
          }`}
        >
          {isApproved ? 'Approved Plan & AI Insights' : 'Customer Profile & Review Status'}
        </button>
        <button 
          onClick={() => setActiveTab('progress')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'progress' 
              ? 'border-[#2DD4BF] text-[#2DD4BF]' 
              : 'border-transparent text-[#9AAEAE] hover:text-[#FFFFFF]'
          }`}
        >
          Progress Comparison
        </button>
      </div>

      {activeTab === 'output' ? (
        <>
          {/* CUSTOMER ASSESSMENT DETAILS CARD (Always visible to the customer) */}
          <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#1B2728] pb-3">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-[#2DD4BF]" />
                <h2 className="text-lg font-bold text-[#F5FAFA]">Customer Profile & Biometrics</h2>
              </div>
              <span className="text-xs font-semibold text-[#9AAEAE]">
                Assessed: {new Date(recommendation.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Profile Grid */}
            <div className="bg-[#0E1415] border border-[#1B2728] rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-[#9AAEAE] uppercase font-bold">Current Weight</p>
                <p className="font-extrabold text-xl text-[#F5FAFA] mt-0.5">
                  {recommendation.fitnessProfile?.weight || '-'} <span className="text-sm font-medium">kg</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9AAEAE] uppercase font-bold">Height</p>
                <p className="font-extrabold text-xl text-[#F5FAFA] mt-0.5">
                  {recommendation.fitnessProfile?.height || '-'} <span className="text-sm font-medium">cm</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9AAEAE] uppercase font-bold">Calculated BMI</p>
                <p className="font-extrabold text-xl text-[#2DD4BF] mt-0.5">
                  {recommendation.fitnessProfile?.height && recommendation.fitnessProfile?.weight
                    ? (
                        Number(recommendation.fitnessProfile.weight) /
                        Math.pow(Number(recommendation.fitnessProfile.height) / 100, 2)
                      ).toFixed(1)
                    : '22.0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9AAEAE] uppercase font-bold">Fitness Goal</p>
                <p className="font-bold text-base text-[#F5FAFA] mt-0.5 truncate">
                  {recommendation.fitnessProfile?.fitnessGoal || recommendation.fitnessProfile?.goal || 'General Fitness'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9AAEAE] uppercase font-bold">Experience Level</p>
                <p className="font-bold text-sm text-[#F5FAFA] mt-0.5">
                  {recommendation.fitnessProfile?.currentFitnessLevel || recommendation.fitnessProfile?.experienceLevel || 'Beginner'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9AAEAE] uppercase font-bold">Activity Level</p>
                <p className="font-bold text-sm text-[#F5FAFA] mt-0.5">
                  {recommendation.fitnessProfile?.activityLevel || 'Moderately Active'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9AAEAE] uppercase font-bold">Available Training</p>
                <p className="font-bold text-sm text-[#F5FAFA] mt-0.5">
                  {recommendation.fitnessProfile?.availableWorkoutDays || '3-4 days/week'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#9AAEAE] uppercase font-bold">Equipment Access</p>
                <p className="font-bold text-sm text-[#F5FAFA] mt-0.5 truncate">
                  {recommendation.fitnessProfile?.equipmentAvailability || 'Full Commercial Gym'}
                </p>
              </div>
            </div>

            {/* Body Measurements Logged */}
            {recommendation.fitnessProfile?.bodyMeasurements && (
              <div className="pt-3 border-t border-[#1B2728]">
                <p className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider mb-2">
                  Body Measurements
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.entries(recommendation.fitnessProfile.bodyMeasurements).map(([k, v]: any) => (
                    <div key={k} className="p-2.5 bg-[#0E1415] border border-[#1B2728] rounded-xl text-center">
                      <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">{k}</span>
                      <span className="text-xs font-extrabold text-[#F5FAFA]">{v ? `${v} cm` : '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STATE 1: PENDING TRAINER REVIEW (DO NOT SHOW AI OUTPUT / WORKOUT / DIET TO CUSTOMER FIRST) */}
          {isPending ? (
            <div className="space-y-6">
              {/* Primary Workflow Status Card */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={30} className="animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                          Pending Trainer Review
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1B2728] text-[#2DD4BF]">
                          Sent to Coach Dashboard
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[#F5FAFA]">
                        AI Draft Generated & Sent to Your Trainer
                      </h3>
                      <p className="text-sm text-[#9AAEAE] mt-1.5 max-w-2xl leading-relaxed">
                        Your fitness assessment has been analyzed by AI and automatically forwarded to your coach&apos;s dashboard. 
                        <strong> The AI output is not shown yet</strong> until your certified coach reviews the workout split, adjusts exercises, sets, reps, and validates dietary recommendations.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/member/trainer-review"
                    className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
                  >
                    Track Review Status →
                  </Link>
                </div>

                {/* Assigned Trainer Card */}
                <div className="bg-[#141D1E] border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                      {recommendation.trainerId?.profilePhoto ? (
                        <img src={recommendation.trainerId.profilePhoto} alt="trainer" className="w-full h-full object-cover" />
                      ) : (
                        <User size={22} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#F5FAFA]">
                          {recommendation.trainerId?.name || 'Assigned Certified Trainer'}
                        </h4>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1B2728] text-[#2DD4BF]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" /> Online
                        </span>
                      </div>
                      <p className="text-xs text-[#9AAEAE] mt-0.5">
                        {recommendation.trainerId?.specialization || 'Strength & Conditioning Specialist'}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-[#9AAEAE] sm:text-right">
                    <p className="font-bold text-amber-800">Review In Progress</p>
                    <p className="text-[11px] text-[#9AAEAE] mt-0.5">Calibrating your sets, reps & nutrition</p>
                  </div>
                </div>

                {/* 3-Step Visual Progression */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#141D1E]/80 border border-[#2A3A3A] rounded-xl p-3 flex items-center gap-2.5">
                    <CheckCircle2 size={18} className="text-[#2DD4BF] shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-[#2DD4BF] uppercase">Step 1: Completed</p>
                      <p className="text-xs font-semibold text-[#F5FAFA]">Profile Assessed & Drafted</p>
                    </div>
                  </div>

                  <div className="bg-[#141D1E] border-2 border-amber-400 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
                    <Clock size={18} className="text-amber-600 animate-pulse shrink-0" />
                    <div>
                      <p className="text-[11px] font-extrabold text-amber-800 uppercase">Step 2: In Progress</p>
                      <p className="text-xs font-bold text-[#F5FAFA]">Trainer Reviewing on Dashboard</p>
                    </div>
                  </div>

                  <div className="bg-[#141D1E]/50 border border-[#2A3A3A] rounded-xl p-3 flex items-center gap-2.5 opacity-70">
                    <Lock size={18} className="text-[#9AAEAE] shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-[#9AAEAE] uppercase">Step 3: Locked</p>
                      <p className="text-xs font-semibold text-[#C1D0D0]">Customer Plan Output</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Fitness Analysis */}
              <div className="bg-[#141D1E] border border-[#1B2728] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#1B2728] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold flex items-center justify-center font-black shadow-md shadow-teal-900/10">
                      1
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles size={18} className="text-[#2DD4BF]" />
                        <h3 className="text-xl font-black text-[#F5FAFA] tracking-tight">Fitness Analysis</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          AI Draft (Reference)
                        </span>
                      </div>
                      <p className="text-xs text-[#9AAEAE] mt-0.5">
                        Clinical biometric assessment and baseline fitness testing metrics
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAiDraftBaseline(!showAiDraftBaseline)}
                    className="text-xs font-bold text-[#2DD4BF] hover:text-[#2DD4BF] flex items-center gap-1 transition-colors"
                  >
                    {showAiDraftBaseline ? 'Hide Baseline' : 'View Full AI Draft Baseline'}
                    {showAiDraftBaseline ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* AI Assessment Summary Box */}
                <div className="p-4 bg-[#0E1415] border border-[#1B2728] rounded-2xl">
                  <p className="text-xs leading-relaxed text-[#F5FAFA]">
                    <strong className="text-[#F5FAFA] font-extrabold">AI Assessment Summary: </strong>
                    {recommendation.aiAnalysis?.assessment || 
                      'Baseline assessment should include: Bodyweight (weekly), Body Measurements (waist, hips, chest, arms – monthly), basic strength tests (e.g., max reps push-ups, planks for time, bodyweight squats), and a 1-mile walk/run test to establish cardiovascular fitness. Monitor perceived exertion (RPE) for all exercises to guide progression.'}
                  </p>
                </div>

                {showAiDraftBaseline && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-[#0E1415] border border-[#1B2728] rounded-2xl">
                      <span className="text-[11px] font-extrabold text-[#9AAEAE] uppercase tracking-wider block mb-1">
                        Primary Goal Analysis
                      </span>
                      <p className="text-xs text-[#F5FAFA] leading-relaxed">
                        {recommendation.aiAnalysis?.goalAnalysis || 'Biometric analysis calculated from baseline fitness indicators.'}
                      </p>
                    </div>

                    <div className="p-4 bg-[#0E1415] border border-[#1B2728] rounded-2xl">
                      <span className="text-[11px] font-extrabold text-[#9AAEAE] uppercase tracking-wider block mb-1">
                        Recommended Training Approach
                      </span>
                      <p className="text-xs text-[#F5FAFA] leading-relaxed">
                        {recommendation.aiAnalysis?.recommendedApproach || 'Structured resistance and cardiovascular periodization.'}
                      </p>
                    </div>

                    {recommendation.aiAnalysis?.limitations && (
                      <div className="p-4 bg-[#1B2728]/80 border border-[#2A3A3A] rounded-2xl md:col-span-2 text-xs text-[#2DD4BF] flex items-start gap-2.5">
                        <ShieldAlert size={16} className="text-[#2DD4BF] shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-extrabold block text-[#2DD4BF] mb-0.5">Limitations &amp; Health Considerations:</strong>
                          <span>{recommendation.aiAnalysis.limitations}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: Personalized Workout Plan */}
              <div className="bg-[#141D1E] border border-[#1B2728] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1B2728] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold flex items-center justify-center font-black shadow-md shadow-teal-900/10">
                      2
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Dumbbell size={18} className="text-[#2DD4BF]" />
                        <h3 className="text-xl font-black text-[#F5FAFA] tracking-tight">Personalized Workout Plan</h3>
                      </div>
                      <p className="text-xs text-[#9AAEAE] mt-0.5">
                        Calibrate exercise routine with exact target muscles, sets, reps, and rest periods
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#9AAEAE] bg-[#0E1415] px-3 py-1.5 rounded-full border border-[#1B2728] self-start sm:self-auto">
                    {approvedExercises.length} Exercises Calibrated
                  </span>
                </div>

                {/* Weekly Split Table */}
                {weeklySchedule.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#9AAEAE] mb-2.5 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#2DD4BF]" /> Weekly Training Schedule
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border border-[#1B2728]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0E1415] text-[#9AAEAE] border-b border-[#1B2728]">
                          <tr>
                            <th className="px-4 py-2.5 font-extrabold">Day</th>
                            <th className="px-4 py-2.5 font-extrabold">Workout Focus</th>
                            <th className="px-4 py-2.5 font-extrabold">Target Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1B2728]/60">
                          {weeklySchedule.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-[#0E1415] transition-colors">
                              <td className="px-4 py-2.5 font-black text-[#2DD4BF]">{item.day}</td>
                              <td className="px-4 py-2.5 font-semibold text-[#F5FAFA]">{item.workout}</td>
                              <td className="px-4 py-2.5 text-[#9AAEAE] font-medium">{item.duration}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Calibrate Exercise Routine List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#9AAEAE] flex items-center gap-1.5">
                      <Zap size={14} className="text-[#2DD4BF]" /> Calibrate Exercise Routine ({approvedExercises.length} Exercises)
                    </h4>
                    <span className="text-[11px] text-[#9AAEAE] italic hidden sm:inline">
                      E.g., AI suggests 4&times;15 reps &rarr; Trainer modifies to 3&times;10 reps
                    </span>
                  </div>

                  <div className="space-y-3">
                    {approvedExercises.map((ex: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="bg-[#0E1415] border border-[#1B2728] rounded-2xl p-4 sm:p-5 hover:border-[#2DD4BF]/50 transition-all shadow-xs"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#2DD4BF] text-[#06201D] font-bold flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                              {idx + 1}
                            </div>
                            <div>
                              <h5 className="font-extrabold text-[#F5FAFA] text-base">{ex.name}</h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-[#9AAEAE] font-semibold">Target Muscle:</span>
                                <span className="px-2 py-0.5 bg-[#141D1E] border border-[#1B2728] rounded-md text-[11px] font-bold text-[#2DD4BF]">
                                  {ex.targetMuscleGroup}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <div className="bg-[#141D1E] border border-[#1B2728] px-3 py-1.5 rounded-xl text-center min-w-[65px]">
                              <span className="text-[9px] uppercase font-bold text-[#9AAEAE] block">Sets</span>
                              <span className="text-xs font-black text-[#F5FAFA]">{ex.sets}</span>
                            </div>

                            <div className="bg-[#141D1E] border border-[#1B2728] px-3 py-1.5 rounded-xl text-center min-w-[75px]">
                              <span className="text-[9px] uppercase font-bold text-[#9AAEAE] block">Reps</span>
                              <span className="text-xs font-black text-[#F5FAFA]">{ex.reps}</span>
                            </div>

                            <div className="bg-[#141D1E] border border-[#1B2728] px-3 py-1.5 rounded-xl text-center min-w-[65px]">
                              <span className="text-[9px] uppercase font-bold text-[#9AAEAE] block">Rest</span>
                              <span className="text-xs font-black text-[#F5FAFA]">{ex.rest || '60-75s'}</span>
                            </div>

                            <div className="bg-[#141D1E] border border-[#1B2728] px-3 py-1.5 rounded-xl text-center min-w-[80px]">
                              <span className="text-[9px] uppercase font-bold text-[#9AAEAE] block">Difficulty</span>
                              <span className="text-xs font-black text-[#F5FAFA]">{ex.difficulty || 'Beginner'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Diet and Nutrition Suggestions */}
              <div className="bg-[#141D1E] border border-[#1B2728] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1B2728] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold flex items-center justify-center font-black shadow-md shadow-teal-900/10">
                      3
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Utensils size={18} className="text-[#2DD4BF]" />
                        <h3 className="text-xl font-black text-[#F5FAFA] tracking-tight">Diet and Nutrition Suggestions</h3>
                      </div>
                      <p className="text-xs text-[#9AAEAE] mt-0.5">
                        Daily varied culinary plan from Monday to Sunday with zero meal repetition
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1B2728] text-[#2DD4BF] border border-[#2A3A3A]">
                      7 Days Varied
                    </span>
                    {activeDailyMeal?.calories && (
                      <span className="text-xs font-extrabold text-[#F5FAFA] bg-[#0E1415] px-3 py-1 rounded-xl border border-[#1B2728]">
                        {activeDailyMeal.calories} kcal
                      </span>
                    )}
                  </div>
                </div>

                {/* 7-Day Monday to Sunday Selector Tabs */}
                {dietPlan?.dailyMealPlans && dietPlan.dailyMealPlans.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider">
                        Select Day of the Week:
                      </span>
                      {activeDailyMeal?.macros && (
                        <span className="text-xs font-bold text-[#2DD4BF] bg-[#1B2728] px-2.5 py-1 rounded-lg border border-[#2A3A3A]">
                          Protein: {activeDailyMeal.macros.protein || '150g'} • Carbs: {activeDailyMeal.macros.carbs || '210g'} • Fats: {activeDailyMeal.macros.fats || '58g'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedDietDay(day)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            selectedDietDay === day
                              ? 'bg-[#2DD4BF] text-white shadow-sm scale-102'
                              : 'bg-[#0E1415] text-[#9AAEAE] hover:text-[#FFFFFF] border border-[#1B2728]'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Morning Hydration */}
                  <div className="bg-[#0E1415] border border-[#1B2728] rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#9AAEAE] block">
                      Morning Hydration &amp; Pre-Workout
                    </span>
                    <p className="text-xs text-[#F5FAFA] leading-relaxed">
                      {activeDailyMeal?.morning || dietPlan?.morning || 'Warm water with lemon and a pinch of pink Himalayan salt. Pre-workout (5:30 AM): 1 small banana or 2 rice cakes with a spoonful of peanut butter.'}
                    </p>
                  </div>

                  {/* Breakfast */}
                  <div className="bg-[#0E1415] border border-[#1B2728] rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#9AAEAE] block">
                      Breakfast
                    </span>
                    <p className="text-xs text-[#F5FAFA] leading-relaxed">
                      {activeDailyMeal?.breakfast || dietPlan?.breakfast || 'Post-workout (7:30 AM): 3-4 whole eggs scrambled with spinach and mushrooms, 2 slices of whole-wheat toast, and a glass of water.'}
                    </p>
                  </div>

                  {/* Mid-Morning Snack */}
                  <div className="bg-[#0E1415] border border-[#1B2728] rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#9AAEAE] block">
                      Mid-Morning Snack
                    </span>
                    <p className="text-xs text-[#F5FAFA] leading-relaxed">
                      {activeDailyMeal?.midMorning || '1 small crisp apple or fresh seasonal fruit with a cup of Greek yogurt.'}
                    </p>
                  </div>

                  {/* Lunch */}
                  <div className="bg-[#0E1415] border border-[#1B2728] rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#9AAEAE] block">
                      Lunch
                    </span>
                    <p className="text-xs text-[#F5FAFA] leading-relaxed">
                      {activeDailyMeal?.lunch || dietPlan?.lunch || '150-180g grilled protein with a large serving of mixed green salad with olive oil and 1 cup brown rice/quinoa.'}
                    </p>
                  </div>

                  {/* Evening Snack */}
                  <div className="bg-[#0E1415] border border-[#1B2728] rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#9AAEAE] block">
                      Evening Snack
                    </span>
                    <p className="text-xs text-[#F5FAFA] leading-relaxed">
                      {activeDailyMeal?.evening || dietPlan?.evening || 'Late Afternoon Snack (4:00 PM): 1 cup Greek yogurt with berries or a handful (30g) of almonds/walnuts. Pre-dinner (6:30 PM): Green tea.'}
                    </p>
                  </div>

                  {/* Dinner */}
                  <div className="bg-[#0E1415] border border-[#1B2728] rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#9AAEAE] block">
                      Dinner
                    </span>
                    <p className="text-xs text-[#F5FAFA] leading-relaxed">
                      {activeDailyMeal?.dinner || dietPlan?.dinner || 'Lean protein with steamed vegetables and clear vegetable broth.'}
                    </p>
                  </div>

                  {/* Daily Hydration Target */}
                  <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-[#2A3A3A] rounded-2xl p-4 space-y-2 lg:col-span-3">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#2DD4BF] block">
                      Daily Hydration Target
                    </span>
                    <p className="text-xs text-[#2DD4BF] font-medium leading-relaxed">
                      {dietPlan?.hydration || 'Target 3.5-4 liters of water daily, spread throughout the day. Consider adding electrolyte tablets to water during/after workout.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Fitness Progress Plan */}
              <div className="bg-[#141D1E] border border-[#1B2728] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-[#1B2728] pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold flex items-center justify-center font-black shadow-md shadow-teal-900/10">
                    4
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <HeartPulse size={18} className="text-[#2DD4BF]" />
                      <h3 className="text-xl font-black text-[#F5FAFA] tracking-tight">Fitness Progress Plan</h3>
                    </div>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">
                      Recovery protocols, sleep targets, active mobility, and baseline benchmark testing
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Sleep Target */}
                  <div className="p-4 bg-[#0E1415] border border-[#1B2728] rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2DD4BF] uppercase tracking-wider">
                      <Moon size={14} /> Sleep Target
                    </div>
                    <p className="text-xs text-[#F5FAFA] leading-relaxed">
                      {recoveryPlan?.sleep || 'Aim for 7-9 hours of consistent, high-quality sleep per night to support tissue repair and hormonal balance.'}
                    </p>
                  </div>

                  {/* Active Recovery */}
                  <div className="p-4 bg-[#0E1415] border border-[#1B2728] rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2DD4BF] uppercase tracking-wider">
                      <Activity size={14} /> Active Recovery
                    </div>
                    <p className="text-xs text-[#F5FAFA] leading-relaxed">
                      {recoveryPlan?.activeRecovery || 'On designated active recovery days (Tuesday, Thursday, Sunday), incorporate 30-45 minutes of low-intensity walking, swimming, or cycling.'}
                    </p>
                  </div>

                  {/* Stretching & Mobility */}
                  <div className="p-4 bg-[#0E1415] border border-[#1B2728] rounded-2xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2DD4BF] uppercase tracking-wider">
                      <RefreshCw size={14} /> Stretching &amp; Mobility
                    </div>
                    <p className="text-xs text-[#F5FAFA] leading-relaxed">
                      {recoveryPlan?.stretchingMobility || 'Dynamic stretching (arm circles, leg swings, torso twists) for 5-10 mins pre-workout; static stretching (holding for 30s) post-workout.'}
                    </p>
                  </div>
                </div>

                {/* Progress Tracking Benchmarks */}
                <div className="p-4 bg-[#0E1415] border border-[#1B2728] rounded-2xl space-y-2">
                  <span className="text-[11px] font-extrabold text-[#9AAEAE] uppercase tracking-wider block">
                    Baseline Testing &amp; Progressive Overload Protocols
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-[#141D1E] p-3 rounded-xl border border-[#1B2728]/80">
                      <strong className="block text-[#2DD4BF] font-bold mb-0.5">Strength Tests:</strong>
                      <span className="text-[#F5FAFA]">Max reps push-ups, planks for time, bodyweight squats recorded every 2 weeks.</span>
                    </div>
                    <div className="bg-[#141D1E] p-3 rounded-xl border border-[#1B2728]/80">
                      <strong className="block text-[#2DD4BF] font-bold mb-0.5">Cardio Metric:</strong>
                      <span className="text-[#F5FAFA]">1-mile walk/run timed test monthly to evaluate aerobic engine.</span>
                    </div>
                    <div className="bg-[#141D1E] p-3 rounded-xl border border-[#1B2728]/80">
                      <strong className="block text-[#2DD4BF] font-bold mb-0.5">Body Metrics:</strong>
                      <span className="text-[#F5FAFA]">Bodyweight tracked weekly on Monday morning; circumferences measured monthly.</span>
                    </div>
                  </div>
                </div>

                {/* Trainer Action bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-[#9AAEAE]">
                    <span className="font-bold text-[#F5FAFA]">Live Trainer Sync:</span> Assigned coach{' '}
                    <span className="text-[#2DD4BF] font-bold">{trainerName}</span> can calibrate any of these 9 exercises and diet portions in the Review Studio.
                  </div>
                  <Link
                    to="/member/trainer-review"
                    className="px-6 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold font-bold rounded-xl text-xs transition-colors shadow-sm shrink-0"
                  >
                    View Trainer Feedback Channel &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* STATE 2: ONCE TRAINERS REVIEW DONE -> SHOW BOTH AI OUTPUT AND TRAINER OUTPUT */
            <div className="space-y-8">
              {/* Official Approval Banner */}
              <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-0.5">
                      <Award size={30} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#1B2728] text-[#2DD4BF] border border-[#2A3A3A] flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-[#2DD4BF]" /> Trainer Approved Plan
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#1B2728] text-[#2DD4BF]">
                          Published to Dashboard
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#F5FAFA]">
                        Official Fitness Regimen • Approved by {trainerName}
                      </h3>
                      <p className="text-sm text-[#9AAEAE] mt-1 max-w-2xl">
                        Your personalized fitness plan has been reviewed, calibrated, and officially authorized by your certified personal trainer. 
                        Below you can inspect both your coach&apos;s tailored recommendations and the underlying AI intelligence analysis.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/member/workout"
                    className="px-6 py-3 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold font-bold rounded-xl text-xs transition-colors shadow-md shadow-teal-900/10 shrink-0 flex items-center gap-1.5"
                  >
                    <Dumbbell size={15} /> Open Workout Player
                  </Link>
                </div>
              </div>

              {/* SECTION A: CERTIFIED TRAINER OUTPUT (THE TRAINER'S CALIBRATIONS) */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#2A3A3A] pb-3">
                  <div className="w-8 h-8 rounded-xl bg-[#1B2728] text-[#2DD4BF] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#F5FAFA]">
                      Certified Trainer Output & Calibrations
                    </h3>
                    <p className="text-xs text-[#9AAEAE]">
                      Personalized modifications, exercise sets/reps calibration, and coach notes from {trainerName}.
                    </p>
                  </div>
                </div>

                {/* Trainer Notes & Guidance Card */}
                {trainerNotes && (
                  <div className="bg-[#141D1E] border-2 border-[#2DD4BF]/20 rounded-3xl p-6 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-xs font-extrabold text-[#2DD4BF] uppercase tracking-wider">
                      <User size={15} /> Coach Notes from {trainerName}
                    </div>
                    <p className="text-sm text-[#F5FAFA] font-medium leading-relaxed italic bg-[#0E1415] p-4 rounded-2xl border border-[#1B2728]">
                      &ldquo;{trainerNotes}&rdquo;
                    </p>
                    {trainerRecs && (
                      <div className="pt-2 text-xs text-[#9AAEAE]">
                        <strong className="text-[#F5FAFA]">Trainer Recommendations:</strong>{' '}
                        {Array.isArray(trainerRecs) ? trainerRecs.join(' • ') : trainerRecs}
                      </div>
                    )}
                  </div>
                )}

                {/* Trainer Calibrated Workout Plan */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Workout Schedule & Exercises */}
                  <div className="bg-[#141D1E] border border-[#1B2728] rounded-3xl p-6 shadow-sm space-y-6">
                    <div>
                      <h4 className="text-lg font-bold text-[#F5FAFA] flex items-center gap-2 mb-3">
                        <Dumbbell className="text-[#2DD4BF]" size={20} /> Trainer-Approved Workout Plan
                      </h4>
                      {workoutMods.length > 0 && (
                        <div className="mb-4 p-3 bg-[#1B2728] border border-[#2A3A3A] rounded-xl text-xs text-[#2DD4BF] flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-[#2DD4BF] shrink-0" />
                          <span>
                            <strong>Trainer Active Calibrations:</strong> Coach adjusted {workoutMods.length} exercise parameter(s) for optimal progression.
                          </span>
                        </div>
                      )}

                      {/* Weekly Schedule Table */}
                      {weeklySchedule.length > 0 && (
                        <div className="overflow-x-auto rounded-xl border border-[#2A3A3A] mb-6">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-[#0E1415] text-[#9AAEAE]">
                              <tr>
                                <th className="px-4 py-2.5 font-bold border-b border-[#2A3A3A]">Day</th>
                                <th className="px-4 py-2.5 font-bold border-b border-[#2A3A3A]">Workout Split</th>
                                <th className="px-4 py-2.5 font-bold border-b border-[#2A3A3A]">Duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {weeklySchedule.map((item: any, i: number) => (
                                <tr key={i} className="border-b border-[#1B2728] last:border-0 hover:bg-[#0E1415]">
                                  <td className="px-4 py-2.5 font-extrabold text-[#2DD4BF]">{item.day}</td>
                                  <td className="px-4 py-2.5 font-medium text-[#F5FAFA]">{item.workout}</td>
                                  <td className="px-4 py-2.5 text-[#9AAEAE] text-xs font-semibold">{item.duration}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Exercise Cards */}
                    <div>
                      <h5 className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider mb-3">
                        Calibrated Exercises & Repetitions
                      </h5>
                      <div className="space-y-3">
                        {approvedExercises.map((ex: any, i: number) => {
                          const hasMod = workoutMods.find(
                            (m: any) => m.exerciseName?.toLowerCase() === ex.name?.toLowerCase()
                          );

                          return (
                            <div 
                              key={i} 
                              className={`p-4 rounded-2xl border transition-all ${
                                hasMod 
                                  ? 'bg-[#1B2728] border-[#2A3A3A]' 
                                  : 'bg-[#0E1415] border-[#1B2728]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <h6 className="font-bold text-[#F5FAFA] text-sm">{ex.name}</h6>
                                  <p className="text-xs font-semibold text-[#2DD4BF]">{ex.targetMuscleGroup}</p>
                                </div>
                                {hasMod && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1B2728] text-[#2DD4BF] border border-[#2A3A3A]">
                                    Trainer Calibrated
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-4 gap-2 text-xs text-[#9AAEAE] font-medium bg-[#141D1E] p-2.5 rounded-xl border border-[#1B2728]">
                                <div>
                                  <span className="text-[10px] text-[#9AAEAE] uppercase block font-bold">Sets</span>
                                  <strong className="text-sm text-[#F5FAFA]">{ex.sets}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#9AAEAE] uppercase block font-bold">Reps</span>
                                  <strong className="text-sm text-[#F5FAFA]">{ex.reps}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#9AAEAE] uppercase block font-bold">Rest</span>
                                  <strong className="text-sm text-[#F5FAFA]">{ex.rest || '60s'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#9AAEAE] uppercase block font-bold">Difficulty</span>
                                  <strong className="text-sm text-[#F5FAFA]">{ex.difficulty || 'Medium'}</strong>
                                </div>
                              </div>

                              {hasMod?.details && (
                                <p className="text-[11px] text-[#2DD4BF] font-semibold mt-2">
                                  ✓ {hasMod.details}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Diet & Recovery Plans */}
                  <div className="space-y-6">
                    {/* Nutrition Card */}
                    <div className="bg-[#141D1E] border border-[#1B2728] rounded-3xl p-6 shadow-sm space-y-4">
                      <h4 className="text-lg font-bold text-[#F5FAFA] flex items-center gap-2">
                        <Utensils className="text-[#2DD4BF]" size={20} /> Trainer-Approved Nutrition Plan
                      </h4>

                      <div className="space-y-2.5">
                        {dietPlan && typeof dietPlan === 'object' ? (
                          <>
                            {['morning', 'breakfast', 'lunch', 'evening', 'dinner'].map((meal) => (
                              dietPlan[meal] ? (
                                <div key={meal} className="p-3 border border-[#1B2728] rounded-xl bg-[#0E1415]">
                                  <h5 className="text-[11px] font-bold text-[#2DD4BF] uppercase">{meal}</h5>
                                  <p className="text-xs text-[#F5FAFA] font-medium mt-0.5">{dietPlan[meal]}</p>
                                </div>
                              ) : null
                            ))}
                            {dietPlan.hydration && (
                              <div className="p-3 bg-[#1B2728] border border-[#2A3A3A] rounded-xl text-xs text-[#2DD4BF] font-semibold">
                                💧 <strong>Hydration Target:</strong> {dietPlan.hydration}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-3 bg-[#0E1415] rounded-xl text-xs text-[#F5FAFA]">
                            {String(dietPlan || 'Balanced high-protein whole foods diet.')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recovery Card */}
                    <div className="bg-[#141D1E] border border-[#1B2728] rounded-3xl p-6 shadow-sm space-y-4">
                      <h4 className="text-lg font-bold text-[#F5FAFA] flex items-center gap-2">
                        <HeartPulse className="text-[#2DD4BF]" size={20} /> Recovery & Sleep Protocols
                      </h4>

                      <div className="space-y-2.5 text-xs text-[#F5FAFA]">
                        <div className="p-3 border border-[#1B2728] rounded-xl bg-[#0E1415]">
                          <strong className="block text-[#2DD4BF] mb-0.5">Sleep Target:</strong>
                          <span>{recoveryPlan?.sleep || '7.5 – 8.5 hours of uninterrupted sleep per night.'}</span>
                        </div>
                        <div className="p-3 border border-[#1B2728] rounded-xl bg-[#0E1415]">
                          <strong className="block text-[#2DD4BF] mb-0.5">Active Recovery:</strong>
                          <span>{recoveryPlan?.activeRecovery || 'Light 20-min walking or mobility work on rest days.'}</span>
                        </div>
                        <div className="p-3 border border-[#1B2728] rounded-xl bg-[#0E1415]">
                          <strong className="block text-[#2DD4BF] mb-0.5">Stretching & Mobility:</strong>
                          <span>{recoveryPlan?.stretchingMobility || 'Targeted dynamic warm-up and post-workout static stretches.'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: AI INTELLIGENCE ANALYSIS (THE AI OUTPUT) */}
              <div className="space-y-6 pt-4 border-t border-[#2A3A3A]">
                <div className="flex items-center gap-3 pb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#1B2728] text-[#2DD4BF] flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#F5FAFA]">
                      AI Biometric Intelligence Analysis
                    </h3>
                    <p className="text-xs text-[#9AAEAE]">
                      Algorithmic physiological assessment and metabolic projections derived from your health profile.
                    </p>
                  </div>
                </div>

                <div className="bg-[#141D1E] border border-[#1B2728] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                  {/* Goal Analysis & Recommended Approach */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0E1415] border border-[#1B2728] rounded-2xl">
                      <h5 className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider mb-1">
                        AI Goal Analysis
                      </h5>
                      <p className="text-xs text-[#F5FAFA] leading-relaxed">
                        {recommendation.aiAnalysis?.goalAnalysis || 'Biometric analysis calculated from baseline fitness indicators.'}
                      </p>
                    </div>

                    <div className="p-4 bg-[#0E1415] border border-[#1B2728] rounded-2xl">
                      <h5 className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider mb-1">
                        Recommended Training Approach
                      </h5>
                      <p className="text-xs text-[#F5FAFA] leading-relaxed">
                        {recommendation.aiAnalysis?.recommendedApproach || 'Structured resistance and cardiovascular periodization.'}
                      </p>
                    </div>
                  </div>

                  {/* AI Physiological Assessment */}
                  {recommendation.aiAnalysis?.assessment && (
                    <div className="p-4 bg-[#0E1415] border border-[#1B2728] rounded-2xl">
                      <h5 className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider mb-1">
                        Physiological Assessment
                      </h5>
                      <p className="text-xs text-[#F5FAFA] leading-relaxed">
                        {recommendation.aiAnalysis.assessment}
                      </p>
                    </div>
                  )}

                  {/* Limitations or Health Considerations */}
                  {recommendation.aiAnalysis?.limitations && (
                    <div className="p-4 bg-[#1B2728] border border-[#2A3A3A] rounded-2xl text-xs text-[#2DD4BF] flex items-start gap-2.5">
                      <ShieldAlert size={16} className="text-[#2DD4BF] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold mb-0.5">Safety & Contraindication Screenings:</strong>
                        <span>{recommendation.aiAnalysis.limitations}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Progress Comparison Tab */
        <>
          {history.length > 0 ? (
            (() => {
              const prevRec = history[0] || {};
              const prevFp = prevRec.fitnessProfile || {};
              const currRec = recommendation || {};
              const currFp = currRec.fitnessProfile || {};

              const prevW = parseFloat(prevFp.weight || '0');
              const currW = parseFloat(currFp.weight || '0');
              const diffW = (currW - prevW).toFixed(1);
              const numDiff = parseFloat(diffW);

              const getDiffBadge = (currStr?: string, prevStr?: string, unit: string = '') => {
                if (!currStr || !prevStr) return null;
                const c = parseFloat(String(currStr).replace(/[^0-9.-]/g, ''));
                const p = parseFloat(String(prevStr).replace(/[^0-9.-]/g, ''));
                if (isNaN(c) || isNaN(p)) return null;
                const d = c - p;
                if (d === 0) return <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1B2728] text-[#C1D0D0] font-bold">Maintained</span>;
                const isDown = d < 0;
                return (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isDown ? 'bg-[#1B2728] text-[#2DD4BF]' : 'bg-[#1B2728] text-[#2DD4BF]'}`}>
                    {d > 0 ? `+${d.toFixed(1)}` : `${d.toFixed(1)}`} {unit}
                  </span>
                );
              };

              const calcBmi = (w?: string | number, h?: string | number) => {
                const weightNum = parseFloat(String(w || '0'));
                const heightNum = parseFloat(String(h || '0'));
                if (!weightNum || !heightNum) return '-';
                return (weightNum / Math.pow(heightNum / 100, 2)).toFixed(1);
              };

              return (
                <>
                  {/* Journey Overview Banner */}
                  <div className="bg-gradient-to-br from-[#2DD4BF] to-[#141D1E] rounded-3xl p-6 sm:p-8 text-[#06201D] font-bold shadow-xl relative overflow-hidden mb-6">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Trophy size={140} />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
                      <h2 className="text-2xl font-black flex items-center gap-2">
                        <Activity className="text-[#2DD4BF]" /> Your Fitness Journey &amp; Progress
                      </h2>
                      <button
                        onClick={() => setShowProgressModal(true)}
                        className="px-4 py-2 bg-[#141D1E]/20 hover:bg-[#141D1E]/30 backdrop-blur-md border border-white/30 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all w-fit cursor-pointer"
                      >
                        <Sparkles size={16} className="text-[#2DD4BF]" />
                        <span>Generate with AI</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 sm:gap-6 relative z-10">
                      <div className="bg-[#141D1E]/10 rounded-2xl p-5 backdrop-blur-sm text-center border border-white/20">
                        <p className="text-xs text-[#2DD4BF] uppercase tracking-wider font-bold mb-1">Previous Weight</p>
                        <p className="text-3xl sm:text-4xl font-extrabold">{prevFp.weight || '-'} <span className="text-lg font-medium">kg</span></p>
                        <p className="text-[11px] text-white/70 mt-1">{new Date(prevRec.createdAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 bg-gradient-to-tr from-[#5EEAD4] to-[#2DD4BF] rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                          {numDiff <= 0 ? (
                            <TrendingDown size={28} className="text-white" />
                          ) : (
                            <TrendingUp size={28} className="text-white" />
                          )}
                        </div>
                        <p className="text-white font-black mt-2 bg-black/30 px-3.5 py-1 rounded-full border border-white/20 text-xs sm:text-sm">
                          {Math.abs(numDiff).toFixed(1)} kg {numDiff < 0 ? 'Lost' : numDiff > 0 ? 'Gained' : 'Difference'}
                        </p>
                      </div>
                      
                      <div className="bg-[#141D1E]/10 rounded-2xl p-5 backdrop-blur-sm text-center border border-white/20">
                        <p className="text-xs text-[#2DD4BF] uppercase tracking-wider font-bold mb-1">Current Weight</p>
                        <p className="text-3xl sm:text-4xl font-extrabold text-[#2DD4BF]">{currFp.weight || '-'} <span className="text-lg font-medium text-white">kg</span></p>
                        <p className="text-[11px] text-white/70 mt-1">{new Date(currRec.createdAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Quick Highlights Bar */}
                    <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs relative z-10">
                      <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                        <span className="text-white/70 block text-[11px]">Target Weight</span>
                        <span className="font-bold text-white text-sm">{currFp.targetWeight || '68'} kg in {currFp.targetTimeline || '3 Months'}</span>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                        <span className="text-white/70 block text-[11px]">Goal &amp; Level</span>
                        <span className="font-bold text-[#2DD4BF] text-sm">{currFp.fitnessGoal || 'Weight Loss'} • {currFp.currentFitnessLevel || 'Beginner'}</span>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                        <span className="text-white/70 block text-[11px]">Chest Measurement</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-white text-sm">{currFp.bodyMeasurements?.chest || '38 in'}</span>
                          {getDiffBadge(currFp.bodyMeasurements?.chest, prevFp.bodyMeasurements?.chest)}
                        </div>
                      </div>
                      <div className="bg-black/20 p-2.5 rounded-xl border border-white/10">
                        <span className="text-white/70 block text-[11px]">Waist Measurement</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-white text-sm">{currFp.bodyMeasurements?.waist || '33 in'}</span>
                          {getDiffBadge(currFp.bodyMeasurements?.waist, prevFp.bodyMeasurements?.waist)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Title & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#F5FAFA] flex items-center gap-2">
                        <ArrowRight className="text-[#2DD4BF]" /> Complete Form Progress Comparison
                      </h3>
                      <p className="text-xs sm:text-sm text-[#9AAEAE] mt-0.5">
                        Detailed side-by-side comparison of every item from your completed health &amp; fitness assessment intake form.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={() => setShowProgressModal(true)}
                        className="px-4 py-2.5 bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF] text-[#F5FAFA] font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer hover:bg-[#0E1415]"
                      >
                        <Plus size={16} className="text-[#2DD4BF]" />
                        <span>Update Progress Form</span>
                      </button>
                      <button
                        onClick={() => setShowProgressModal(true)}
                        className="px-4 py-2.5 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] hover:opacity-95 text-[#06201D] font-bold font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <Sparkles size={16} />
                        <span>Generate with AI</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Detailed Side-by-Side Comparison Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Previous Result Card (Full Form Items) */}
                    <div className="bg-[#0E1415] border border-[#1B2728] rounded-3xl p-6 relative opacity-95 hover:opacity-100 transition-opacity space-y-6">
                      <div className="absolute top-0 right-0 bg-[#1B2728] text-[#9AAEAE] text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl">
                        Archived Assessment
                      </div>
                      
                      <div className="flex items-center gap-2 border-b border-[#1B2728] pb-3">
                        <Calendar size={18} className="text-[#9AAEAE]" />
                        <h4 className="text-lg font-black text-[#9AAEAE]">Previous Result</h4>
                        <span className="text-xs text-[#9AAEAE] ml-auto font-semibold">
                          {new Date(prevRec.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      {/* 1. Biometrics & Target Goals */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider flex items-center gap-1.5">
                          <Scale size={14} className="text-[#2DD4BF]" /> 1. Biometrics &amp; Target Goals
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Recorded Weight</p>
                            <p className="font-extrabold text-[#F5FAFA] text-base">{prevFp.weight || '-'} kg</p>
                          </div>
                          <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Target Weight</p>
                            <p className="font-extrabold text-[#F5FAFA] text-base">{prevFp.targetWeight || '68'} kg ({prevFp.targetTimeline || '3 Months'})</p>
                          </div>
                          <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Height &amp; BMI</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">
                              {prevFp.height || '175'} cm • BMI {calcBmi(prevFp.weight, prevFp.height)}
                            </p>
                          </div>
                          <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Age &amp; Gender</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">{prevFp.age || '28'} yrs • {prevFp.gender || 'Male'}</p>
                          </div>
                        </div>
                      </div>

                      {/* 2. Body Circumference Measurements */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider flex items-center gap-1.5">
                          <Ruler size={14} className="text-[#2DD4BF]" /> 2. Body Measurements
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          <div className="bg-[#141D1E] p-2.5 rounded-xl border border-[#2A3A3A] text-center">
                            <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">Chest</span>
                            <span className="font-bold text-xs text-[#F5FAFA]">{prevFp.bodyMeasurements?.chest || '38 in'}</span>
                          </div>
                          <div className="bg-[#141D1E] p-2.5 rounded-xl border border-[#2A3A3A] text-center">
                            <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">Waist</span>
                            <span className="font-bold text-xs text-[#F5FAFA]">{prevFp.bodyMeasurements?.waist || '33 in'}</span>
                          </div>
                          <div className="bg-[#141D1E] p-2.5 rounded-xl border border-[#2A3A3A] text-center">
                            <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">Hips</span>
                            <span className="font-bold text-xs text-[#F5FAFA]">{prevFp.bodyMeasurements?.hips || '39 in'}</span>
                          </div>
                          <div className="bg-[#141D1E] p-2.5 rounded-xl border border-[#2A3A3A] text-center">
                            <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">Arms</span>
                            <span className="font-bold text-xs text-[#F5FAFA]">{prevFp.bodyMeasurements?.arms || '13.5 in'}</span>
                          </div>
                          <div className="bg-[#141D1E] p-2.5 rounded-xl border border-[#2A3A3A] text-center">
                            <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">Thighs</span>
                            <span className="font-bold text-xs text-[#F5FAFA]">{prevFp.bodyMeasurements?.thighs || '22 in'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Fitness Goals & Activity Profile */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider flex items-center gap-1.5">
                          <Target size={14} className="text-[#2DD4BF]" /> 3. Fitness Goals &amp; Activity
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Primary Goal</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">{prevFp.fitnessGoal || 'General Fitness'}</p>
                          </div>
                          <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Fitness Level</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">{prevFp.currentFitnessLevel || prevFp.experienceLevel || 'Beginner'}</p>
                          </div>
                          <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Experience</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">{prevFp.workoutExperience || '1-3 years'}</p>
                          </div>
                          <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Daily Activity</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">{prevFp.activityLevel || 'Moderately Active'}</p>
                          </div>
                        </div>
                      </div>

                      {/* 4. Workout Schedule & Preferences */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider flex items-center gap-1.5">
                          <Dumbbell size={14} className="text-[#2DD4BF]" /> 4. Workout Schedule &amp; Preferences
                        </p>
                        <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] space-y-1 text-xs">
                          <div className="flex justify-between py-1 border-b border-[#2A3A3A]">
                            <span className="text-[#9AAEAE]">Training Mode:</span>
                            <span className="font-bold text-[#F5FAFA]">{prevFp.preferredTraining || 'Offline'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#2A3A3A]">
                            <span className="text-[#9AAEAE]">Workout Days:</span>
                            <span className="font-bold text-[#F5FAFA]">{prevFp.availableWorkoutDays || '4 Days'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#2A3A3A]">
                            <span className="text-[#9AAEAE]">Preferred Time &amp; Duration:</span>
                            <span className="font-bold text-[#F5FAFA]">{prevFp.preferredWorkoutTime || 'Morning'} ({prevFp.preferredWorkoutDuration || '45 Mins'})</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-[#9AAEAE]">Equipment Access:</span>
                            <span className="font-bold text-[#F5FAFA]">{prevFp.equipmentAvailability || 'Full Commercial Gym'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 5. Nutrition & Lifestyle */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider flex items-center gap-1.5">
                          <Utensils size={14} className="text-[#2DD4BF]" /> 5. Nutrition &amp; Lifestyle
                        </p>
                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          <div className="bg-[#141D1E] p-2.5 rounded-xl border border-[#2A3A3A]">
                            <span className="text-[#9AAEAE] block text-[10px] font-bold">Diet Preference</span>
                            <span className="font-bold text-[#F5FAFA]">{prevFp.dietaryPreferences || 'Non-Vegetarian'}</span>
                          </div>
                          <div className="bg-[#141D1E] p-2.5 rounded-xl border border-[#2A3A3A]">
                            <span className="text-[#9AAEAE] block text-[10px] font-bold">Meals / Water</span>
                            <span className="font-bold text-[#F5FAFA]">{prevFp.mealsPerDay || '3'} meals • {prevFp.dailyWaterIntake || '2-3 L'}</span>
                          </div>
                          <div className="bg-[#141D1E] p-2.5 rounded-xl border border-[#2A3A3A]">
                            <span className="text-[#9AAEAE] block text-[10px] font-bold">Sleep Quality</span>
                            <span className="font-bold text-[#F5FAFA]">{prevFp.averageSleep || '7-8 hours'}</span>
                          </div>
                          <div className="bg-[#141D1E] p-2.5 rounded-xl border border-[#2A3A3A]">
                            <span className="text-[#9AAEAE] block text-[10px] font-bold">Stress Level</span>
                            <span className="font-bold text-[#F5FAFA]">{prevFp.stressLevel || 'Moderate'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 6. Health & Safety Screening */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert size={14} className="text-[#2DD4BF]" /> 6. Health &amp; Limitations
                        </p>
                        <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] text-xs space-y-1">
                          <p><span className="text-[#9AAEAE] font-semibold">Injuries:</span> <span className="font-bold text-[#F5FAFA]">{prevFp.injuries || 'None'}</span></p>
                          <p><span className="text-[#9AAEAE] font-semibold">Restrictions:</span> <span className="font-bold text-[#F5FAFA]">{prevFp.doctorRestrictions || prevFp.healthConsiderations || 'None'}</span></p>
                          {prevFp.notes && <p className="italic text-[#9AAEAE]">&quot;{prevFp.notes}&quot;</p>}
                        </div>
                      </div>
                    </div>

                    {/* Current Result Card (Full Form Items + Active Enhancements) */}
                    <div className="bg-[#141D1E] border-2 border-[#2DD4BF] rounded-3xl p-6 shadow-lg relative space-y-6">
                      <div className="absolute top-0 right-0 bg-[#2DD4BF] text-[#06201D] font-bold text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl shadow-sm">
                        {isApproved ? 'Approved Regimen' : 'Live Assessment Draft'}
                      </div>
                      
                      <div className="flex items-center gap-2 border-b border-[#1B2728] pb-3">
                        <Activity size={18} className="text-[#2DD4BF]" />
                        <h4 className="text-lg font-black text-[#2DD4BF]">Current Result</h4>
                        <span className="text-xs text-[#9AAEAE] ml-auto font-semibold">
                          {new Date(currRec.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>

                      {/* 1. Biometrics & Target Goals */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center gap-1.5">
                          <Scale size={14} className="text-[#2DD4BF]" /> 1. Biometrics &amp; Target Goals
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-[#0E1415] p-3 rounded-xl border border-[#2A3A3A]">
                            <div className="flex justify-between items-center">
                              <p className="text-[11px] text-[#9AAEAE] font-semibold">Current Weight</p>
                              {diffW !== '0.0' && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-extrabold ${numDiff < 0 ? 'bg-[#1B2728] text-[#2DD4BF]' : 'bg-[#1B2728] text-[#2DD4BF]'}`}>
                                  {numDiff > 0 ? `+${diffW}` : diffW} kg
                                </span>
                              )}
                            </div>
                            <p className="font-extrabold text-[#2DD4BF] text-base mt-0.5">{currFp.weight || '-'} kg</p>
                          </div>
                          <div className="bg-[#0E1415] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Target Goal</p>
                            <p className="font-extrabold text-[#F5FAFA] text-base">{currFp.targetWeight || '68'} kg ({currFp.targetTimeline || '3 Months'})</p>
                          </div>
                          <div className="bg-[#0E1415] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Height &amp; BMI</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">
                              {currFp.height || '175'} cm • BMI {calcBmi(currFp.weight, currFp.height)}
                            </p>
                          </div>
                          <div className="bg-[#0E1415] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Age &amp; Gender</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">{currFp.age || '28'} yrs • {currFp.gender || 'Male'}</p>
                          </div>
                        </div>
                      </div>

                      {/* 2. Body Circumference Measurements */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center gap-1.5">
                          <Ruler size={14} className="text-[#2DD4BF]" /> 2. Body Measurements
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          <div className="bg-[#0E1415] p-2.5 rounded-xl border border-[#2A3A3A] text-center">
                            <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">Chest</span>
                            <span className="font-bold text-xs text-[#F5FAFA]">{currFp.bodyMeasurements?.chest || '38 in'}</span>
                            <div className="mt-1">{getDiffBadge(currFp.bodyMeasurements?.chest, prevFp.bodyMeasurements?.chest)}</div>
                          </div>
                          <div className="bg-[#0E1415] p-2.5 rounded-xl border border-[#2A3A3A] text-center">
                            <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">Waist</span>
                            <span className="font-bold text-xs text-[#F5FAFA]">{currFp.bodyMeasurements?.waist || '33 in'}</span>
                            <div className="mt-1">{getDiffBadge(currFp.bodyMeasurements?.waist, prevFp.bodyMeasurements?.waist)}</div>
                          </div>
                          <div className="bg-[#0E1415] p-2.5 rounded-xl border border-[#2A3A3A] text-center">
                            <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">Hips</span>
                            <span className="font-bold text-xs text-[#F5FAFA]">{currFp.bodyMeasurements?.hips || '39 in'}</span>
                            <div className="mt-1">{getDiffBadge(currFp.bodyMeasurements?.hips, prevFp.bodyMeasurements?.hips)}</div>
                          </div>
                          <div className="bg-[#0E1415] p-2.5 rounded-xl border border-[#2A3A3A] text-center">
                            <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">Arms</span>
                            <span className="font-bold text-xs text-[#F5FAFA]">{currFp.bodyMeasurements?.arms || '13.5 in'}</span>
                            <div className="mt-1">{getDiffBadge(currFp.bodyMeasurements?.arms, prevFp.bodyMeasurements?.arms)}</div>
                          </div>
                          <div className="bg-[#0E1415] p-2.5 rounded-xl border border-[#2A3A3A] text-center">
                            <span className="text-[10px] text-[#9AAEAE] uppercase font-bold block">Thighs</span>
                            <span className="font-bold text-xs text-[#F5FAFA]">{currFp.bodyMeasurements?.thighs || '22 in'}</span>
                            <div className="mt-1">{getDiffBadge(currFp.bodyMeasurements?.thighs, prevFp.bodyMeasurements?.thighs)}</div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Fitness Goals & Activity Profile */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center gap-1.5">
                          <Target size={14} className="text-[#2DD4BF]" /> 3. Fitness Goals &amp; Activity
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-[#0E1415] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Primary Goal</p>
                            <p className="font-bold text-[#2DD4BF] text-sm">{currFp.fitnessGoal || 'General Fitness'}</p>
                          </div>
                          <div className="bg-[#0E1415] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Fitness Level</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">{currFp.currentFitnessLevel || currFp.experienceLevel || 'Beginner'}</p>
                          </div>
                          <div className="bg-[#0E1415] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Experience</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">{currFp.workoutExperience || '1-3 years'}</p>
                          </div>
                          <div className="bg-[#0E1415] p-3 rounded-xl border border-[#2A3A3A]">
                            <p className="text-[11px] text-[#9AAEAE] font-semibold">Daily Activity</p>
                            <p className="font-bold text-[#F5FAFA] text-sm">{currFp.activityLevel || 'Moderately Active'}</p>
                          </div>
                        </div>
                      </div>

                      {/* 4. Workout Schedule & Preferences */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center gap-1.5">
                          <Dumbbell size={14} className="text-[#2DD4BF]" /> 4. Workout Schedule &amp; Preferences
                        </p>
                        <div className="bg-[#0E1415] p-3 rounded-xl border border-[#2A3A3A] space-y-1 text-xs">
                          <div className="flex justify-between py-1 border-b border-[#2A3A3A]">
                            <span className="text-[#9AAEAE]">Training Mode:</span>
                            <span className="font-bold text-[#F5FAFA]">{currFp.preferredTraining || 'Offline'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#2A3A3A]">
                            <span className="text-[#9AAEAE]">Workout Days:</span>
                            <span className="font-bold text-[#2DD4BF]">{currFp.availableWorkoutDays || '4 Days'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#2A3A3A]">
                            <span className="text-[#9AAEAE]">Preferred Time &amp; Duration:</span>
                            <span className="font-bold text-[#F5FAFA]">{currFp.preferredWorkoutTime || 'Morning'} ({currFp.preferredWorkoutDuration || '45 Mins'})</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-[#9AAEAE]">Equipment Access:</span>
                            <span className="font-bold text-[#F5FAFA]">{currFp.equipmentAvailability || 'Full Commercial Gym'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 5. Nutrition & Lifestyle */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center gap-1.5">
                          <Utensils size={14} className="text-[#2DD4BF]" /> 5. Nutrition &amp; Lifestyle
                        </p>
                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          <div className="bg-[#0E1415] p-2.5 rounded-xl border border-[#2A3A3A]">
                            <span className="text-[#9AAEAE] block text-[10px] font-bold">Diet Preference</span>
                            <span className="font-bold text-[#F5FAFA]">{currFp.dietaryPreferences || 'Non-Vegetarian'}</span>
                          </div>
                          <div className="bg-[#0E1415] p-2.5 rounded-xl border border-[#2A3A3A]">
                            <span className="text-[#9AAEAE] block text-[10px] font-bold">Meals / Water</span>
                            <span className="font-bold text-[#F5FAFA]">{currFp.mealsPerDay || '3'} meals • {currFp.dailyWaterIntake || '2-3 L'}</span>
                          </div>
                          <div className="bg-[#0E1415] p-2.5 rounded-xl border border-[#2A3A3A]">
                            <span className="text-[#9AAEAE] block text-[10px] font-bold">Sleep Quality</span>
                            <span className="font-bold text-[#F5FAFA]">{currFp.averageSleep || '7-8 hours'}</span>
                          </div>
                          <div className="bg-[#0E1415] p-2.5 rounded-xl border border-[#2A3A3A]">
                            <span className="text-[#9AAEAE] block text-[10px] font-bold">Stress Level</span>
                            <span className="font-bold text-[#F5FAFA]">{currFp.stressLevel || 'Moderate'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 6. Health & Safety Screening */}
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert size={14} className="text-[#2DD4BF]" /> 6. Health &amp; Limitations
                        </p>
                        <div className="bg-[#0E1415] p-3 rounded-xl border border-[#2A3A3A] text-xs space-y-1">
                          <p><span className="text-[#9AAEAE] font-semibold">Injuries:</span> <span className="font-bold text-[#F5FAFA]">{currFp.injuries || 'None'}</span></p>
                          <p><span className="text-[#9AAEAE] font-semibold">Restrictions:</span> <span className="font-bold text-[#F5FAFA]">{currFp.doctorRestrictions || currFp.healthConsiderations || 'None'}</span></p>
                          {currFp.notes && <p className="italic text-[#9AAEAE]">&quot;{currFp.notes}&quot;</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Card */}
                  <div className="mt-8 bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Sparkles size={20} className="text-[#2DD4BF]" />
                        <h4 className="text-lg font-black text-[#F5FAFA]">Ready to re-assess or log new milestone progress?</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-[#9AAEAE] max-w-xl">
                        Update your weight, circumference measurements, and workout availability to generate an updated progressive plan with AI.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowProgressModal(true)}
                      className="px-6 py-3.5 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] hover:opacity-95 text-[#06201D] font-bold font-extrabold rounded-xl text-sm shadow-lg shadow-teal-900/10/30 flex items-center gap-2 transition-all cursor-pointer shrink-0 active:scale-95"
                    >
                      <Sparkles size={18} />
                      <span>Generate with AI</span>
                    </button>
                  </div>
                </>
              );
            })()
          ) : (
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-12 text-center shadow-sm">
              <h2 className="text-xl font-bold text-[#F5FAFA] mb-2">No History Found</h2>
              <p className="text-[#9AAEAE]">When you request a new plan, your progress comparison will appear here.</p>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* PROGRESS COMPARISON UPDATE FORM MODAL & GENERATE WITH AI                  */}
      {/* ========================================================================= */}
      {showProgressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141D1E]/60 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-[#141D1E] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2DD4BF] via-[#5EEAD4] to-[#141D1E] p-6 text-[#06201D] font-bold relative shrink-0">
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={20} className="text-[#2DD4BF]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF]">AI Progress Engine</span>
                  </div>
                  <h3 className="text-2xl font-black">Complete Progress Form &amp; Generate with AI</h3>
                  <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                    Update your current weight, body circumference measurements &amp; workout preferences.
                  </p>
                </div>
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="text-white/70 hover:text-white p-2 bg-[#141D1E]/10 hover:bg-[#141D1E]/20 rounded-full transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleGenerateWithAI} className="p-6 overflow-y-auto space-y-5 text-[#F5FAFA]">
              {/* 1. Biometrics */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider flex items-center gap-2">
                  <Scale size={15} className="text-[#2DD4BF]" /> 1. Current Weight &amp; Target Goal
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#9AAEAE] mb-1">Current Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={progressForm.weight}
                      onChange={e => setProgressForm({ ...progressForm, weight: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-sm font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                      placeholder="e.g. 74"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#9AAEAE] mb-1">Target Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={progressForm.targetWeight}
                      onChange={e => setProgressForm({ ...progressForm, targetWeight: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-sm font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                      placeholder="e.g. 68"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#9AAEAE] mb-1">Target Timeline</label>
                    <select
                      value={progressForm.targetTimeline}
                      onChange={e => setProgressForm({ ...progressForm, targetTimeline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-sm font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                    >
                      <option value="1 Month">1 Month</option>
                      <option value="2 Months">2 Months</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Body Circumference Measurements */}
              <div className="space-y-3 pt-2 border-t border-[#2A3A3A]">
                <h4 className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider flex items-center gap-2">
                  <Ruler size={15} className="text-[#2DD4BF]" /> 2. Body Circumference Measurements
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#9AAEAE] mb-1">Chest</label>
                    <input
                      type="text"
                      value={progressForm.chest}
                      onChange={e => setProgressForm({ ...progressForm, chest: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                      placeholder="e.g. 38 in"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#9AAEAE] mb-1">Waist</label>
                    <input
                      type="text"
                      value={progressForm.waist}
                      onChange={e => setProgressForm({ ...progressForm, waist: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                      placeholder="e.g. 33 in"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#9AAEAE] mb-1">Hips</label>
                    <input
                      type="text"
                      value={progressForm.hips}
                      onChange={e => setProgressForm({ ...progressForm, hips: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                      placeholder="e.g. 39 in"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#9AAEAE] mb-1">Arms</label>
                    <input
                      type="text"
                      value={progressForm.arms}
                      onChange={e => setProgressForm({ ...progressForm, arms: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                      placeholder="e.g. 13.5 in"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#9AAEAE] mb-1">Thighs</label>
                    <input
                      type="text"
                      value={progressForm.thighs}
                      onChange={e => setProgressForm({ ...progressForm, thighs: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                      placeholder="e.g. 22 in"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Training Preferences & Availability */}
              <div className="space-y-3 pt-2 border-t border-[#2A3A3A]">
                <h4 className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider flex items-center gap-2">
                  <Dumbbell size={15} className="text-[#2DD4BF]" /> 3. Training &amp; Routine Updates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#9AAEAE] mb-1">Fitness Level</label>
                    <select
                      value={progressForm.currentFitnessLevel}
                      onChange={e => setProgressForm({ ...progressForm, currentFitnessLevel: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#9AAEAE] mb-1">Available Days / Week</label>
                    <select
                      value={progressForm.preferredWorkoutDays}
                      onChange={e => setProgressForm({ ...progressForm, preferredWorkoutDays: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                    >
                      <option value="3 Days">3 Days</option>
                      <option value="4 Days">4 Days</option>
                      <option value="5 Days">5 Days</option>
                      <option value="6 Days">6 Days</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#9AAEAE] mb-1">Session Duration</label>
                    <select
                      value={progressForm.preferredWorkoutDuration}
                      onChange={e => setProgressForm({ ...progressForm, preferredWorkoutDuration: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs font-bold text-[#F5FAFA] outline-none focus:border-[#2DD4BF]"
                    >
                      <option value="30 Minutes">30 Minutes</option>
                      <option value="45 Minutes">45 Minutes</option>
                      <option value="60 Minutes">60 Minutes</option>
                      <option value="75 Minutes">75 Minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Notes & Recovery */}
              <div className="space-y-3 pt-2 border-t border-[#2A3A3A]">
                <h4 className="text-xs font-bold text-[#9AAEAE] uppercase tracking-wider flex items-center gap-2">
                  <FileText size={15} className="text-[#2DD4BF]" /> 4. Notes &amp; Physical Feeling
                </h4>
                <textarea
                  value={progressForm.notes}
                  onChange={e => setProgressForm({ ...progressForm, notes: e.target.value })}
                  placeholder="How are your energy levels? Hit a new personal record or feeling soreness? (Optional)"
                  className="w-full px-3.5 py-2.5 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-xs font-medium text-[#F5FAFA] outline-none focus:border-[#2DD4BF] min-h-[64px]"
                ></textarea>
              </div>

              {/* Submit / Cancel Actions */}
              <div className="pt-4 border-t border-[#2A3A3A] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-[#9AAEAE] hover:bg-[#1B2728] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingAi}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] hover:opacity-95 text-[#06201D] font-bold font-black rounded-xl text-sm shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Generate with AI</span>
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

export default MemberAIResults;
