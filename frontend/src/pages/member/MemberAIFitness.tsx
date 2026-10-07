import { useState, useEffect } from 'react';
import { 
  Bot, Activity, Zap, CheckCircle2, AlertCircle, Dumbbell, 
  Utensils, Loader2, Clock, Lock, ArrowRight, 
  User, HeartPulse, ShieldAlert, Sparkles,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MemberAIFitness = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    // 1. Personal & Physical
    fullName: '',
    age: '28',
    gender: 'Male',
    height: '175',
    weight: '74',
    // 2. Goal & Experience
    fitnessGoal: 'Weight Loss',
    currentFitnessLevel: 'Beginner',
    workoutExperience: '1-3 years',
    targetWeight: '68',
    targetTimeline: '3 Months',
    // 3. Body Measurements
    bodyMeasurements: {
      chest: '38 in',
      waist: '33 in',
      hips: '39 in',
      arms: '13.5 in',
      thighs: '22 in',
    },
    // 4. Activity & Schedule
    activityLevel: 'Moderately Active',
    availableWorkoutDays: '4 Days',
    preferredWorkoutDuration: '45 Minutes',
    preferredWorkoutTime: 'Morning',
    // 5. Workout & Equipment
    preferredWorkoutType: 'Gym Weights / Resistance',
    equipmentAvailability: 'Full Commercial Gym',
    // 6. Nutrition & Diet
    dietaryPreferences: 'Non-Vegetarian',
    mealsPerDay: '3',
    dailyWaterIntake: '2-3 Liters',
    dietaryRestrictions: 'None',
    // 7. Health & Limitations
    injuries: 'None',
    healthConsiderations: 'None',
    doctorRestrictions: 'None',
    averageSleep: '7-8 hours',
    stressLevel: 'Moderate',
    notes: ''
  });

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      setLoading(true);
      // Pre-fill from authenticated user profile
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.user) {
          const u = meRes.data.user;
          let calculatedAge = '28';
          if (u.dateOfBirth) {
            const dob = new Date(u.dateOfBirth);
            const diff_ms = Date.now() - dob.getTime();
            const age_dt = new Date(diff_ms);
            calculatedAge = Math.abs(age_dt.getUTCFullYear() - 1970).toString();
          }

          setFormData(prev => ({
            ...prev,
            fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || prev.fullName,
            age: calculatedAge,
            gender: u.gender || prev.gender,
            height: u.height ? u.height.toString() : prev.height,
            weight: u.weight ? u.weight.toString() : prev.weight,
            fitnessGoal: u.fitnessGoal || prev.fitnessGoal,
            currentFitnessLevel: u.experienceLevel || prev.currentFitnessLevel
          }));
        }
      } catch (e) {
        console.error('Failed to prefill user details', e);
      }

      // Check membership access
      const memRes = await api.get('/memberships/my');
      const active = memRes.data.memberships?.some((m: any) => m.status === 'ACTIVE' || m.status === 'Active' || m.status === 'Free Trial');
      const userStr = localStorage.getItem('aigym_user');
      let userHasGym = false;
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          userHasGym = !!u.gymId;
        } catch (e) {}
      }
      const accessGranted = active || userHasGym;
      setHasAccess(accessGranted);

      if (accessGranted) {
        await fetchLatestRecommendation();
      }
    } catch (err) {
      console.error(err);
      setHasAccess(true); // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestRecommendation = async () => {
    try {
      const res = await api.get('/ai/member/latest');
      if (res.data?.recommendation) {
        setRecommendation(res.data.recommendation);
        if (res.data.recommendation.fitnessProfile) {
          setFormData(prev => ({
            ...prev,
            ...res.data.recommendation.fitnessProfile
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load recommendation', err);
    }
  };

  const handleMeasurementChange = (field: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      bodyMeasurements: {
        ...prev.bodyMeasurements,
        [field]: val
      }
    }));
  };

  const handleSubmitAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/ai/member/generate', { fitnessProfile: formData });
      if (res.data?.recommendation) {
        setRecommendation(res.data.recommendation);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit assessment. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-[#F97316]" size={40} />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-[#F1F5F9] border border-[#FED7AA] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-[#78716C]" />
          </div>
          <h2 className="text-3xl font-bold text-[#292524] mb-4">AI Fitness Assessment Locked</h2>
          <p className="text-[#78716C] text-lg mb-8 max-w-lg mx-auto">
            You need an active gym membership to access personalized AI fitness analysis and certified trainer review.
          </p>
          <Link 
            to="/gyms" 
            className="inline-flex items-center px-8 py-4 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-all hover:scale-105 shadow-lg shadow-teal-900/20"
          >
            <Activity className="mr-2" size={20} /> Find a Gym to Unlock
          </Link>
        </div>
      </div>
    );
  }

  const isPendingReview = recommendation && (
    recommendation.status === 'Pending Trainer Review' ||
    recommendation.status === 'Under Trainer Review' ||
    recommendation.status === 'AI Generated'
  );

  const isApproved = recommendation && (
    recommendation.status === 'Trainer Approved' ||
    recommendation.status === 'Published to Customer'
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-[#0D9488] rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/20 text-white">
            <Bot size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-[#292524] tracking-tight">AI Fitness Assessment</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F97316]/10 text-[#F97316]">
                Step 1 of 3: AI Analysis → Trainer Review → Final Output
              </span>
            </div>
            <p className="text-[#78716C] mt-1 text-sm">
              Complete your comprehensive health profile to generate a Draft AI Analysis for your certified trainer.
            </p>
          </div>
        </div>

        {recommendation && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRecommendation(null);
                setActiveStep(1);
              }}
              className="px-4 py-2 bg-white border border-[#E7E5E4] text-[#292524] rounded-xl font-semibold text-xs hover:bg-[#F9F8F6] transition-colors"
            >
              Re-take Assessment
            </button>
            {isApproved && (
              <Link
                to="/member/workout"
                className="px-4 py-2 bg-[#F97316] text-white rounded-xl font-bold text-xs hover:bg-[#EA580C] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 size={14} /> View Approved Plan
              </Link>
            )}
          </div>
        )}
      </div>

      {/* When Recommendation exists: Show Workflow Status Banner & AI Draft Preview */}
      {recommendation ? (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          {isPendingReview ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Pending Trainer Review
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                        AI Generated Draft
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#292524]">
                      Assessment Submitted • AI Draft Generated & Awaiting Trainer Approval
                    </h3>
                    <p className="text-sm text-[#78716C] mt-1 max-w-2xl">
                      The AI has formulated an initial fitness and nutrition draft based on your assessment. 
                      <strong> This is a draft, not your final plan.</strong> Your assigned certified trainer is reviewing exercises, sets, reps, and diet before publishing your official plan.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                  <Link
                    to="/member/trainer-review"
                    className="px-5 py-2.5 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 transition-colors shadow-sm"
                  >
                    Track Trainer Review →
                  </Link>
                </div>
              </div>

              {recommendation.trainerId && (
                <div className="mt-4 pt-4 border-t border-amber-200/60 flex items-center gap-3 text-xs text-amber-900 font-medium">
                  <User size={16} className="text-amber-700" />
                  <span>
                    Assigned Trainer: <strong>{recommendation.trainerId.name || 'Certified Trainer'}</strong> ({recommendation.trainerId.specialization || 'Elite Coach'}) • Status: Currently marked Online/Available.
                  </span>
                </div>
              )}
            </div>
          ) : isApproved ? (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Trainer Approved Plan
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800">
                        Published to Customer
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#292524]">
                      Your Customized Plan Has Been Approved by Your Trainer!
                    </h3>
                    <p className="text-sm text-[#78716C] mt-1 max-w-2xl">
                      Your coach has finalized all workout splits, sets, repetitions, recovery protocols, and diet plans. Your official plan is now active in your dashboard.
                    </p>
                  </div>
                </div>

                <Link
                  to="/member/workout"
                  className="px-6 py-3 bg-[#F97316] text-white font-bold rounded-xl text-sm hover:bg-[#EA580C] transition-colors shadow-md shadow-teal-900/10 shrink-0"
                >
                  Open My Fitness Plan →
                </Link>
              </div>
            </div>
          ) : null}

          {/* Customer Assessment Details Card */}
          <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[#FED7AA] pb-3">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-[#F97316]" />
                <h3 className="text-lg font-bold text-[#292524]">Your Submitted Fitness Profile</h3>
              </div>
              <span className="text-xs text-[#78716C]">
                Last Updated: {new Date(recommendation.updatedAt || recommendation.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
                <p className="text-[11px] text-[#78716C] uppercase font-bold">Age / Gender</p>
                <p className="text-sm font-bold text-[#292524] mt-0.5">
                  {recommendation.fitnessProfile?.age || formData.age} yrs • {recommendation.fitnessProfile?.gender || formData.gender}
                </p>
              </div>
              <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
                <p className="text-[11px] text-[#78716C] uppercase font-bold">Height / Weight</p>
                <p className="text-sm font-bold text-[#292524] mt-0.5">
                  {recommendation.fitnessProfile?.height || formData.height} cm • {recommendation.fitnessProfile?.weight || formData.weight} kg
                </p>
              </div>
              <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
                <p className="text-[11px] text-[#78716C] uppercase font-bold">Primary Goal</p>
                <p className="text-sm font-bold text-[#F97316] mt-0.5 truncate">
                  {recommendation.fitnessProfile?.fitnessGoal || formData.fitnessGoal}
                </p>
              </div>
              <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
                <p className="text-[11px] text-[#78716C] uppercase font-bold">Fitness Level</p>
                <p className="text-sm font-bold text-[#292524] mt-0.5">
                  {recommendation.fitnessProfile?.currentFitnessLevel || formData.currentFitnessLevel}
                </p>
              </div>
              <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
                <p className="text-[11px] text-[#78716C] uppercase font-bold">Workout Days</p>
                <p className="text-sm font-bold text-[#292524] mt-0.5">
                  {recommendation.fitnessProfile?.availableWorkoutDays || formData.availableWorkoutDays}
                </p>
              </div>
              <div className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl">
                <p className="text-[11px] text-[#78716C] uppercase font-bold">Equipment</p>
                <p className="text-sm font-bold text-[#292524] mt-0.5 truncate">
                  {recommendation.fitnessProfile?.equipmentAvailability || formData.equipmentAvailability}
                </p>
              </div>
            </div>

            {/* Body Measurements Snapshot */}
            {recommendation.fitnessProfile?.bodyMeasurements && (
              <div className="mt-4 pt-4 border-t border-[#FED7AA]/80">
                <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">
                  Body Measurements Logged
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {Object.entries(recommendation.fitnessProfile.bodyMeasurements).map(([k, v]: any) => (
                    <div key={k} className="p-2 bg-[#FFFDF8] rounded-lg text-center">
                      <span className="text-[10px] text-[#78716C] uppercase font-bold block">{k}</span>
                      <span className="text-xs font-extrabold text-[#292524]">{v || '-'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CONDITIONAL RENDERING: PENDING TRAINER REVIEW vs APPROVED PLAN */}
          {isPendingReview ? (
            /* LOCKED DRAFT CARD WHILE PENDING TRAINER REVIEW */
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-8 md:p-10 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto">
                <Lock size={30} />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-600 animate-pulse" /> Sent to Trainer Dashboard • Awaiting Review
                </span>
                <h3 className="text-2xl font-bold text-[#292524] mt-2">
                  AI Draft Dispatched to Your Coach
                </h3>
                <p className="text-sm text-[#78716C] leading-relaxed">
                  The initial AI analysis has been generated and automatically sent to your assigned trainer&apos;s dashboard. 
                  <strong> To ensure your safety, unreviewed AI exercises and diets are not shown on your dashboard yet.</strong> Your coach is calibrating sets, reps, and nutrition. Once your trainer approves the plan, it will be unlocked here immediately.
                </p>
              </div>

              {/* 3-Step Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
                <div className="bg-[#F9F8F6] border border-emerald-300 rounded-2xl p-3.5 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase">Step 1</p>
                    <p className="text-xs font-bold text-[#292524]">Assessment Submitted</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-amber-400 rounded-2xl p-3.5 flex items-center gap-3 shadow-sm">
                  <Clock size={20} className="text-amber-600 animate-pulse shrink-0" />
                  <div>
                    <p className="text-[10px] font-extrabold text-amber-800 uppercase">Step 2: In Progress</p>
                    <p className="text-xs font-bold text-[#292524]">Trainer Reviewing on Dashboard</p>
                  </div>
                </div>

                <div className="bg-[#F9F8F6] border border-gray-200 rounded-2xl p-3.5 flex items-center gap-3 opacity-60">
                  <Lock size={20} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Step 3</p>
                    <p className="text-xs font-semibold text-gray-600">Customer Plan Published</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/member/trainer-review"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  <Activity size={15} /> Track Coach Review Status
                </Link>
              </div>
            </div>
          ) : isApproved ? (
            /* APPROVED PLAN: DISPLAY BOTH TRAINER OUTPUT AND AI OUTPUT */
            <div className="space-y-6">
              {/* SECTION 1: CERTIFIED TRAINER OUTPUT */}
              <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#FED7AA] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#292524]">
                        Certified Trainer Output & Calibrations
                      </h3>
                      <p className="text-xs text-[#78716C]">
                        Approved and customized by Coach {recommendation.trainerModifications?.modifiedByTrainerName || recommendation.finalApprovedPlan?.approvedByTrainerName || recommendation.trainerId?.name || 'Your Trainer'}.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/member/workout"
                    className="px-5 py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Dumbbell size={14} /> Open Workout Player →
                  </Link>
                </div>

                {/* Trainer Notes */}
                {(recommendation.trainerNotes || recommendation.finalApprovedPlan?.trainerNotes || recommendation.trainerModifications?.trainerNotes) && (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1">
                    <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={14} /> Coach Notes
                    </p>
                    <p className="text-sm text-[#292524] italic font-medium">
                      &ldquo;{recommendation.trainerNotes || recommendation.finalApprovedPlan?.trainerNotes || recommendation.trainerModifications?.trainerNotes}&rdquo;
                    </p>
                  </div>
                )}

                {/* Trainer Calibrated Weekly Schedule */}
                <div>
                  <h4 className="text-sm font-bold text-[#292524] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calendar size={16} className="text-[#F97316]" /> Approved Weekly Workout Schedule
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {(recommendation.finalApprovedPlan?.workoutPlan?.weeklySchedule || recommendation.workoutRecommendation?.weeklySchedule || []).map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-xs font-extrabold text-[#F97316]">{item.day}</p>
                          <p className="text-xs font-semibold text-[#292524] truncate max-w-[150px]">{item.workout}</p>
                        </div>
                        <span className="text-[11px] font-bold text-[#78716C] bg-white px-2 py-0.5 rounded-md border border-[#FED7AA]">
                          {item.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calibrated Exercises */}
                <div>
                  <h4 className="text-sm font-bold text-[#292524] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Dumbbell size={16} className="text-[#F97316]" /> Calibrated Exercises & Repetitions
                  </h4>
                  <div className="space-y-2.5">
                    {(recommendation.finalApprovedPlan?.workoutPlan?.exercises || recommendation.workoutRecommendation?.exercises || []).map((ex: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[#292524]">{ex.name}</p>
                          <p className="text-xs text-[#F97316] font-medium">{ex.targetMuscleGroup}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-semibold text-[#78716C]">
                          <span>Sets: <strong className="text-[#292524]">{ex.sets}</strong></span>
                          <span>Reps: <strong className="text-[#292524]">{ex.reps}</strong></span>
                          <span>Rest: <strong className="text-[#292524]">{ex.rest || '60s'}</strong></span>
                          <span className="px-2 py-0.5 rounded bg-white border border-[#FED7AA] text-[10px] text-[#78716C]">
                            {ex.difficulty || 'Medium'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diet & Recovery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                    <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Utensils size={14} className="text-[#F97316]" /> Trainer-Approved Diet
                    </h4>
                    <div className="space-y-1.5 text-xs text-[#292524]">
                      {recommendation.finalApprovedPlan?.dietPlan && typeof recommendation.finalApprovedPlan.dietPlan === 'object' ? (
                        <>
                          <p><strong>Breakfast:</strong> {recommendation.finalApprovedPlan.dietPlan.breakfast || recommendation.dietRecommendation?.breakfast}</p>
                          <p><strong>Lunch:</strong> {recommendation.finalApprovedPlan.dietPlan.lunch || recommendation.dietRecommendation?.lunch}</p>
                          <p><strong>Dinner:</strong> {recommendation.finalApprovedPlan.dietPlan.dinner || recommendation.dietRecommendation?.dinner}</p>
                        </>
                      ) : (
                        <p>{String(recommendation.finalApprovedPlan?.dietPlan || recommendation.dietRecommendation?.breakfast || 'Nutritious balanced plan.')}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                    <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <HeartPulse size={14} className="text-[#F97316]" /> Recovery Protocol
                    </h4>
                    <div className="space-y-1.5 text-xs text-[#292524]">
                      <p><strong>Sleep:</strong> {recommendation.finalApprovedPlan?.recoveryPlan?.sleep || recommendation.recoveryRecommendations?.sleep || '7.5 - 8.5 hours'}</p>
                      <p><strong>Active Recovery:</strong> {recommendation.finalApprovedPlan?.recoveryPlan?.activeRecovery || recommendation.recoveryRecommendations?.activeRecovery || 'Light walking & stretching'}</p>
                      <p><strong>Mobility:</strong> {recommendation.finalApprovedPlan?.recoveryPlan?.stretchingMobility || recommendation.recoveryRecommendations?.stretchingMobility || 'Daily dynamic stretch'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: AI BIOMETRIC INTELLIGENCE ANALYSIS */}
              <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={20} className="text-[#F97316]" />
                  <h3 className="text-xl font-bold text-[#292524]">
                    AI Biometric Intelligence Analysis
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                    <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Goal Analysis</h4>
                    <p className="text-xs text-[#292524] leading-relaxed">
                      {recommendation.aiAnalysis?.goalAnalysis || 'Analysis tailored to your fitness targets.'}
                    </p>
                  </div>

                  <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl">
                    <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">Recommended Approach</h4>
                    <p className="text-xs text-[#292524] leading-relaxed">
                      {recommendation.aiAnalysis?.recommendedApproach || 'Structured resistance & recovery strategy.'}
                    </p>
                  </div>
                </div>

                {recommendation.aiAnalysis?.limitations && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-900 flex items-start gap-2.5">
                    <ShieldAlert size={16} className="text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold mb-0.5">Limitations & Health Considerations:</strong>
                      <span>{recommendation.aiAnalysis.limitations}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* Assessment Form Wizard */
        <form onSubmit={handleSubmitAssessment} className="space-y-6">
          {/* Form Step Navigation Bar */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-3 flex items-center justify-between overflow-x-auto gap-2 shadow-sm">
            {[
              { num: 1, label: 'Physical Profile' },
              { num: 2, label: 'Fitness Goals' },
              { num: 3, label: 'Body Measurements' },
              { num: 4, label: 'Schedule & Equipment' },
              { num: 5, label: 'Diet & Recovery' },
            ].map(s => (
              <button
                type="button"
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeStep === s.num
                    ? 'bg-[#F97316] text-white shadow-sm'
                    : 'bg-transparent text-[#78716C] hover:bg-[#F9F8F6]'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  activeStep === s.num ? 'bg-white text-[#F97316]' : 'bg-[#FED7AA] text-[#78716C]'
                }`}>
                  {s.num}
                </span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Step 1: Personal & Physical */}
          {activeStep === 1 && (
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#292524]">1. Personal & Physical Biometrics</h3>
                <p className="text-sm text-[#78716C] mt-0.5">Basic information used to estimate caloric expenditure and metabolic rates.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Daily Activity Level</label>
                  <select
                    value={formData.activityLevel}
                    onChange={e => setFormData({ ...formData, activityLevel: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="Sedentary">Sedentary (Desk Job, little movement)</option>
                    <option value="Lightly Active">Lightly Active (1-3 days light movement)</option>
                    <option value="Moderately Active">Moderately Active (Regular exercise)</option>
                    <option value="Very Active">Very Active (Heavy training / active work)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 bg-[#F97316] text-white rounded-xl font-bold text-sm hover:bg-[#EA580C] transition-colors flex items-center gap-1.5"
                >
                  Continue to Goals <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Fitness Goal & Experience */}
          {activeStep === 2 && (
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#292524]">2. Fitness Goals & Experience</h3>
                <p className="text-sm text-[#78716C] mt-0.5">Define your targets and prior resistance training familiarity.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Primary Fitness Goal</label>
                  <select
                    value={formData.fitnessGoal}
                    onChange={e => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="Weight Loss">Weight Loss & Fat Reduction</option>
                    <option value="Muscle Building / Hypertrophy">Muscle Building & Hypertrophy</option>
                    <option value="Strength Training">Pure Strength & Power</option>
                    <option value="Endurance & Stamina">Cardiovascular Endurance & Stamina</option>
                    <option value="Functional Fitness">Functional Movement & Mobility</option>
                    <option value="General Health">General Longevity & Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Current Fitness Level</label>
                  <select
                    value={formData.currentFitnessLevel}
                    onChange={e => setFormData({ ...formData, currentFitnessLevel: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="Beginner">Beginner (0-6 months experience)</option>
                    <option value="Intermediate">Intermediate (6-24 months regular lifting)</option>
                    <option value="Advanced">Advanced (2+ years dedicated training)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Target Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.targetWeight}
                    onChange={e => setFormData({ ...formData, targetWeight: e.target.value })}
                    placeholder="e.g. 68"
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Target Timeline</label>
                  <select
                    value={formData.targetTimeline}
                    onChange={e => setFormData({ ...formData, targetTimeline: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="1 Month">1 Month (Sprint)</option>
                    <option value="3 Months">3 Months (Standard Phase)</option>
                    <option value="6 Months">6 Months (Transformation)</option>
                    <option value="12 Months">12 Months (Long-term Mastery)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-6 py-2.5 bg-white border border-[#E7E5E4] text-[#292524] rounded-xl font-bold text-sm hover:bg-[#F9F8F6] transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 bg-[#F97316] text-white rounded-xl font-bold text-sm hover:bg-[#EA580C] transition-colors flex items-center gap-1.5"
                >
                  Continue to Measurements <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Body Measurements */}
          {activeStep === 3 && (
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#292524]">3. Body Measurements</h3>
                <p className="text-sm text-[#78716C] mt-0.5">Used by AI and your coach to track structural body recomposition beyond the scale.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Chest</label>
                  <input
                    type="text"
                    value={formData.bodyMeasurements.chest}
                    onChange={e => handleMeasurementChange('chest', e.target.value)}
                    placeholder="e.g. 38 in / 96 cm"
                    className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Waist</label>
                  <input
                    type="text"
                    value={formData.bodyMeasurements.waist}
                    onChange={e => handleMeasurementChange('waist', e.target.value)}
                    placeholder="e.g. 32 in / 81 cm"
                    className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Hips</label>
                  <input
                    type="text"
                    value={formData.bodyMeasurements.hips}
                    onChange={e => handleMeasurementChange('hips', e.target.value)}
                    placeholder="e.g. 39 in / 99 cm"
                    className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Arms / Biceps</label>
                  <input
                    type="text"
                    value={formData.bodyMeasurements.arms}
                    onChange={e => handleMeasurementChange('arms', e.target.value)}
                    placeholder="e.g. 13.5 in"
                    className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Thighs</label>
                  <input
                    type="text"
                    value={formData.bodyMeasurements.thighs}
                    onChange={e => handleMeasurementChange('thighs', e.target.value)}
                    placeholder="e.g. 22 in"
                    className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-6 py-2.5 bg-white border border-[#E7E5E4] text-[#292524] rounded-xl font-bold text-sm hover:bg-[#F9F8F6] transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="px-6 py-2.5 bg-[#F97316] text-white rounded-xl font-bold text-sm hover:bg-[#EA580C] transition-colors flex items-center gap-1.5"
                >
                  Continue to Schedule <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Schedule, Equipment & Preferences */}
          {activeStep === 4 && (
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#292524]">4. Availability & Equipment Preferences</h3>
                <p className="text-sm text-[#78716C] mt-0.5">Let AI know what gear you have and how often you can train.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Available Workout Days</label>
                  <select
                    value={formData.availableWorkoutDays}
                    onChange={e => setFormData({ ...formData, availableWorkoutDays: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="2 Days">2 Days / Week</option>
                    <option value="3 Days">3 Days / Week</option>
                    <option value="4 Days">4 Days / Week (Recommended)</option>
                    <option value="5 Days">5 Days / Week</option>
                    <option value="6 Days">6 Days / Week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Equipment Availability</label>
                  <select
                    value={formData.equipmentAvailability}
                    onChange={e => setFormData({ ...formData, equipmentAvailability: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="Full Commercial Gym">Full Commercial Gym (Barbells, Cables, Machines)</option>
                    <option value="Dumbbells Only">Dumbbells & Bench Only</option>
                    <option value="Home Gym">Home Gym (Bands, Kettlebells)</option>
                    <option value="No Equipment / Bodyweight">No Equipment (Bodyweight / Calisthenics)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Preferred Workout Type</label>
                  <select
                    value={formData.preferredWorkoutType}
                    onChange={e => setFormData({ ...formData, preferredWorkoutType: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="Gym Weights / Resistance">Gym Weights & Resistance</option>
                    <option value="Bodyweight / Calisthenics">Bodyweight & Calisthenics</option>
                    <option value="HIIT / Functional Circuit">HIIT & Functional Circuit</option>
                    <option value="Powerlifting / Heavy Barbell">Powerlifting & Strength</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Preferred Workout Duration</label>
                  <select
                    value={formData.preferredWorkoutDuration}
                    onChange={e => setFormData({ ...formData, preferredWorkoutDuration: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="30 Minutes">30 Minutes</option>
                    <option value="45 Minutes">45 Minutes (Optimal)</option>
                    <option value="60 Minutes">60 Minutes</option>
                    <option value="75 Minutes">75 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Preferred Training Time</label>
                  <select
                    value={formData.preferredWorkoutTime}
                    onChange={e => setFormData({ ...formData, preferredWorkoutTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="Morning">Morning (06:00 AM - 10:00 AM)</option>
                    <option value="Afternoon">Afternoon (12:00 PM - 04:00 PM)</option>
                    <option value="Evening">Evening (05:00 PM - 09:00 PM)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2.5 bg-white border border-[#E7E5E4] text-[#292524] rounded-xl font-bold text-sm hover:bg-[#F9F8F6] transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(5)}
                  className="px-6 py-2.5 bg-[#F97316] text-white rounded-xl font-bold text-sm hover:bg-[#EA580C] transition-colors flex items-center gap-1.5"
                >
                  Continue to Nutrition & Health <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Nutrition, Safety & Submit */}
          {activeStep === 5 && (
            <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[#292524]">5. Nutrition, Safety & Health Considerations</h3>
                <p className="text-sm text-[#78716C] mt-0.5">Report dietary preferences and any joint injuries so your coach can screen unsuitable exercises.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Dietary Preference</label>
                  <select
                    value={formData.dietaryPreferences}
                    onChange={e => setFormData({ ...formData, dietaryPreferences: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="Non-Vegetarian">Non-Vegetarian (Chicken, Fish, Eggs)</option>
                    <option value="Vegetarian">Vegetarian (Dairy, Lentils, Paneer)</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Vegan">Vegan (Plant-Based Only)</option>
                    <option value="Keto">Keto / Low-Carb</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Daily Water Intake</label>
                  <select
                    value={formData.dailyWaterIntake}
                    onChange={e => setFormData({ ...formData, dailyWaterIntake: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="1-2 Liters">1-2 Liters</option>
                    <option value="2-3 Liters">2-3 Liters</option>
                    <option value="3-4 Liters">3-4 Liters</option>
                    <option value="4+ Liters">4+ Liters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Average Sleep</label>
                  <select
                    value={formData.averageSleep}
                    onChange={e => setFormData({ ...formData, averageSleep: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="Under 6 hours">Under 6 hours</option>
                    <option value="6-7 hours">6-7 hours</option>
                    <option value="7-8 hours">7-8 hours (Optimal)</option>
                    <option value="8+ hours">8+ hours</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">
                    Injuries or Joint Limitations
                  </label>
                  <input
                    type="text"
                    value={formData.injuries}
                    onChange={e => setFormData({ ...formData, injuries: e.target.value })}
                    placeholder="e.g. Lower back pain, left knee discomfort, shoulder impingement, or None"
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">
                    Dietary Restrictions / Allergies
                  </label>
                  <input
                    type="text"
                    value={formData.dietaryRestrictions}
                    onChange={e => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                    placeholder="e.g. Lactose intolerant, nut allergy, or None"
                    className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>
              </div>

              {/* Notice regarding AI Draft vs Trainer Final Approval */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3 text-xs text-teal-900">
                <AlertCircle size={18} className="text-[#F97316] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">How this workflow works:</strong>
                  <span>
                    When you submit, our AI instantly analyzes your biometrics and generates an initial 
                    <strong> Draft Plan</strong>. Your certified trainer will then review the draft, calibrate sets, reps, and nutrition, and approve it. 
                    Only after your trainer approves will the plan become active in your <strong>My Fitness Plan</strong> dashboard.
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="px-6 py-2.5 bg-white border border-[#E7E5E4] text-[#292524] rounded-xl font-bold text-sm hover:bg-[#F9F8F6] transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-[#F97316] to-teal-700 text-white rounded-xl font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-teal-900/20 flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing Biometrics & Generating AI Draft...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Submit Assessment & Trigger AI Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default MemberAIFitness;
