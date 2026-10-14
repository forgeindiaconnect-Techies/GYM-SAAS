import { useState, useEffect } from 'react';
import { 
  Bot, Activity, CheckCircle2, Dumbbell, 
  Loader2, Clock, Lock, 
  User, HeartPulse, ShieldAlert, Sparkles,
  Calendar, Mail, Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MemberAIFitness = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State: Complete Registered Details & Fitness Profile
  const [formData, setFormData] = useState({
    // 1. Personal & Contact Details (Registered in Form)
    fullName: '',
    email: '',
    mobile: '',
    city: '',
    pinCode: '',
    dateOfBirth: '',
    age: '28',
    gender: 'Male',

    // 2. Physical Biometrics (Registered in Form)
    height: '175',
    weight: '74',

    // 3. Fitness Goals & Training Preferences (Registered in Form)
    fitnessGoal: 'Weight Loss',
    currentFitnessLevel: 'Beginner',
    preferredTraining: 'Offline',
    preferredWorkoutTime: 'Morning (7-9am)',
    availableWorkoutDays: '4 Days',
    equipmentAvailability: 'Full Commercial Gym',
    dietaryPreferences: 'Non-Vegetarian',

    // 4. Emergency Contact Details (Registered in Form)
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactMobile: '',

    // 5. Health & Limitations
    injuries: 'None',
    healthConsiderations: 'None',
    doctorRestrictions: 'None',
    averageSleep: '7-8 hours',
    stressLevel: 'Moderate',
    notes: '',

    // Additional secondary metrics
    workoutExperience: '1-3 years',
    targetWeight: '68',
    targetTimeline: '3 Months',
    bodyMeasurements: {
      chest: '38 in',
      waist: '33 in',
      hips: '39 in',
      arms: '13.5 in',
      thighs: '22 in',
    },
    activityLevel: 'Moderately Active',
    preferredWorkoutDuration: '45 Minutes',
    preferredWorkoutType: 'Gym Weights / Resistance',
    mealsPerDay: '3',
    dailyWaterIntake: '2-3 Liters',
    dietaryRestrictions: 'None'
  });

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      setLoading(true);
      // Pre-fill all registered customer details from authenticated user profile
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.user) {
          const u = meRes.data.user;
          let calculatedAge = '28';
          let formattedDob = '';
          if (u.dateOfBirth) {
            const dob = new Date(u.dateOfBirth);
            const diff_ms = Date.now() - dob.getTime();
            const age_dt = new Date(diff_ms);
            calculatedAge = Math.abs(age_dt.getUTCFullYear() - 1970).toString();
            formattedDob = dob.toISOString().split('T')[0];
          }

          setFormData(prev => ({
            ...prev,
            fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || prev.fullName,
            email: u.email || prev.email,
            mobile: u.mobile || u.phone || prev.mobile,
            city: u.city || prev.city,
            pinCode: u.pinCode || prev.pinCode,
            dateOfBirth: formattedDob || prev.dateOfBirth,
            age: u.age ? u.age.toString() : calculatedAge,
            gender: u.gender || prev.gender,
            height: u.height ? u.height.toString() : prev.height,
            weight: u.weight ? u.weight.toString() : prev.weight,
            fitnessGoal: u.fitnessGoal || prev.fitnessGoal,
            currentFitnessLevel: u.experienceLevel || prev.currentFitnessLevel,
            preferredTraining: u.preferredTraining || prev.preferredTraining,
            preferredWorkoutTime: u.preferredWorkoutTime || prev.preferredWorkoutTime,
            availableWorkoutDays: u.preferredWorkoutDays || prev.availableWorkoutDays,
            emergencyContactName: u.emergencyContact?.name || prev.emergencyContactName,
            emergencyContactRelation: u.emergencyContact?.relationship || prev.emergencyContactRelation,
            emergencyContactMobile: u.emergencyContact?.mobile || prev.emergencyContactMobile,
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

  const exercisesList = (recommendation?.finalApprovedPlan?.workoutPlan?.exercises?.length > 0)
    ? recommendation.finalApprovedPlan.workoutPlan.exercises
    : (recommendation?.workoutRecommendation?.exercises || recommendation?.workoutPlan || []);

  const weeklySchedule = (recommendation?.finalApprovedPlan?.workoutPlan?.weeklySchedule?.length > 0)
    ? recommendation.finalApprovedPlan.workoutPlan.weeklySchedule
    : (recommendation?.workoutRecommendation?.weeklySchedule || []);

  const dietPlan = (recommendation?.finalApprovedPlan?.dietPlan && typeof recommendation.finalApprovedPlan.dietPlan === 'object')
    ? recommendation.finalApprovedPlan.dietPlan
    : (recommendation?.dietRecommendation || {});

  const recoveryPlan = (recommendation?.finalApprovedPlan?.recoveryPlan && typeof recommendation.finalApprovedPlan.recoveryPlan === 'object')
    ? recommendation.finalApprovedPlan.recoveryPlan
    : (recommendation?.recoveryRecommendations || {});

  const progressPlan = recommendation?.progressSuggestions || {};


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

          {/* Workflow Status Banner */}
          {isPendingReview && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock size={16} className="animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-[#292524]">
                    AI Draft Generated &bull; Submitted for Certified Trainer Review
                  </p>
                  <p className="text-[#78716C]">
                    Your coach {recommendation.trainerId?.name ? `(${recommendation.trainerId.name})` : ''} is reviewing these recommendations to tailor your official regimen.
                  </p>
                </div>
              </div>
              <Link
                to="/member/trainer-review"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shrink-0 text-center transition-colors shadow-xs"
              >
                Track Trainer Review &rarr;
              </Link>
            </div>
          )}

          {isApproved && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="font-bold text-emerald-900">
                    Official Plan Approved &amp; Published by Coach {recommendation.trainerModifications?.modifiedByTrainerName || recommendation.finalApprovedPlan?.approvedByTrainerName || recommendation.trainerId?.name || 'Your Trainer'}
                  </p>
                  <p className="text-emerald-700">
                    All exercises, sets, reps, and nutrition protocols are calibrated and active.
                  </p>
                </div>
              </div>
              <Link
                to="/member/workout"
                className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-bold shrink-0 text-center transition-colors shadow-xs"
              >
                Open Workout Player &rarr;
              </Link>
            </div>
          )}

          {/* 1. FITNESS ANALYSIS (Image 1 Style) */}
          <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#292524]">Fitness Analysis</h3>
                  <p className="text-xs text-[#78716C]">AI-driven biometric assessment &amp; physiological breakdown</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {isApproved ? 'Trainer Approved' : 'AI Draft (Reference)'}
              </span>
            </div>

            {/* AI Assessment Summary Box (Image 1 match) */}
            <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl text-xs text-[#292524] leading-relaxed">
              <strong className="text-[#292524]">AI Assessment Summary:</strong>{' '}
              <span className="text-[#44403C]">
                {recommendation.aiAnalysis?.assessment ||
                  'Baseline assessment should include: Bodyweight (weekly), Body Measurements (waist, hips, chest, arms – monthly), basic strength tests (e.g., max reps push-ups, planks for time, bodyweight squats), and a 1-mile walk/run test to establish cardiovascular fitness. Monitor perceived exertion (RPE) for all exercises to guide progression.'}
              </span>
            </div>

            {/* Goal Analysis & Recommended Approach */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <h4 className="text-xs font-bold text-[#F97316] uppercase tracking-wider">Goal Analysis</h4>
                <p className="text-xs text-[#292524] leading-relaxed">
                  {recommendation.aiAnalysis?.goalAnalysis || 'Analysis tailored to your fitness targets.'}
                </p>
              </div>

              <div className="p-4 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <h4 className="text-xs font-bold text-[#F97316] uppercase tracking-wider">Recommended Approach</h4>
                <p className="text-xs text-[#292524] leading-relaxed">
                  {recommendation.aiAnalysis?.recommendedApproach || 'High-density resistance training combined with structured recovery.'}
                </p>
              </div>
            </div>

            {recommendation.aiAnalysis?.limitations && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl text-xs text-orange-900 flex items-start gap-2.5">
                <ShieldAlert size={16} className="text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Safety &amp; Health Considerations:</strong>
                  <span>{recommendation.aiAnalysis.limitations}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. PERSONALIZED WORKOUT PLAN (Image 2 Style) */}
          <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#FED7AA] pb-3 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#292524]">Personalized Workout Plan</h3>
                  <p className="text-xs text-[#78716C]">
                    Calibrated Exercise Routine ({exercisesList.length} Exercises)
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#78716C] font-medium">
                Target Days: <strong>{recommendation.fitnessProfile?.availableWorkoutDays || formData.availableWorkoutDays || 4} Days/Week</strong>
              </span>
            </div>

            {/* Weekly Training Schedule */}
            {weeklySchedule.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#F97316]" /> Weekly Training Schedule
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {weeklySchedule.map((item: any, idx: number) => (
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
            )}

            {/* Calibrated Exercises List (exact match to Image 2) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell size={14} className="text-[#F97316]" /> Calibrated Exercises &amp; Sets/Reps
              </h4>

              <div className="space-y-2.5">
                {exercisesList.map((ex: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-[#F97316] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#292524]">{ex.name}</p>
                        <span className="text-xs text-[#78716C] font-medium">
                          Target Muscle: <strong className="text-[#292524]">{ex.targetMuscleGroup || 'General'}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold self-end md:self-center">
                      <span className="bg-white border border-[#E7E5E4] px-2.5 py-1 rounded-lg">
                        SETS: <strong className="text-[#F97316] ml-1">{ex.sets}</strong>
                      </span>
                      <span className="bg-white border border-[#E7E5E4] px-2.5 py-1 rounded-lg">
                        REPS: <strong className="text-[#292524] ml-1">{ex.reps}</strong>
                      </span>
                      <span className="bg-white border border-[#E7E5E4] px-2.5 py-1 rounded-lg">
                        REST: <strong className="text-[#78716C] ml-1">{ex.rest || '60s'}</strong>
                      </span>
                      <span className="bg-white border border-[#E7E5E4] px-2.5 py-1 rounded-lg text-[11px] text-[#78716C]">
                        {ex.difficulty || 'Beginner'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. DIET AND NUTRITION SUGGESTIONS (Image 3 Style) */}
          <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#292524]">Diet and Nutrition Suggestions</h3>
                  <p className="text-xs text-[#78716C]">Precision macro &amp; meal schedule tailored to your goal</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {recommendation.fitnessProfile?.dietaryPreferences || formData.dietaryPreferences || 'Balanced Nutrition'}
              </span>
            </div>

            {/* 6 Meal Cards Grid (Image 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#78716C] uppercase text-[10px] block">Morning Hydration</span>
                <p className="text-[#292524] leading-relaxed">
                  {dietPlan.morning || 'Warm water with pinch of pink Himalayan salt. Pre-workout (5:30 AM): 1 small banana or 2 rice cakes with peanut butter.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#78716C] uppercase text-[10px] block">Breakfast</span>
                <p className="text-[#292524] leading-relaxed">
                  {dietPlan.breakfast || 'Post-workout (7:30 AM): 3-4 whole eggs scrambled with spinach and mushrooms, 2 slices of whole-wheat toast, and fresh fruit / shake.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#78716C] uppercase text-[10px] block">Lunch</span>
                <p className="text-[#292524] leading-relaxed">
                  {dietPlan.lunch || '150-180g grilled chicken breast or fish/paneer with a large serving (1.5 cups) of mixed green salad with olive oil and brown rice/quinoa.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#78716C] uppercase text-[10px] block">Evening Snack</span>
                <p className="text-[#292524] leading-relaxed">
                  {dietPlan.evening || 'Late Afternoon Snack (4:00 PM): 1 cup Greek yogurt with berries or a handful (30g) of almonds/walnuts. Pre-dinner (6:30 PM): Green tea.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#78716C] uppercase text-[10px] block">Dinner</span>
                <p className="text-[#292524] leading-relaxed">
                  {dietPlan.dinner || 'Grilled fish / chicken tikka (or paneer/tofu), minimal complex carbs (e.g., small sweet potato or lentils), large bowl of mixed vegetable soup.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#78716C] uppercase text-[10px] block">Daily Hydration Target</span>
                <p className="text-[#292524] leading-relaxed">
                  {dietPlan.hydration || 'Target 3.5-4 liters of water daily, spread throughout the day. Consider adding electrolyte tablets to water during/after workouts.'}
                </p>
              </div>
            </div>

            {dietPlan.note && (
              <p className="text-[11px] text-[#78716C] italic bg-[#FFFDF8] p-2.5 rounded-xl border border-[#E7E5E4]">
                Note: {dietPlan.note}
              </p>
            )}
          </div>

          {/* 4. FITNESS PROGRESS PLAN (Image 3 Style) */}
          <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#FED7AA] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#292524]">Fitness Progress Plan &amp; Recovery</h3>
                  <p className="text-xs text-[#78716C]">Progressive overload tracking, recovery regimen, and milestones</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#F97316]">
                Starting Weight: {progressPlan.startingWeight || recommendation.fitnessProfile?.weight || formData.weight} kg
              </span>
            </div>

            {/* 3 Recovery Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#78716C] uppercase text-[10px] block">Sleep Target</span>
                <p className="text-[#292524] leading-relaxed">
                  {recoveryPlan.sleep || 'Aim for 7-9 hours of consistent, high-quality sleep per night for optimal nervous system recovery and myofibrillar repair.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#78716C] uppercase text-[10px] block">Active Recovery</span>
                <p className="text-[#292524] leading-relaxed">
                  {recoveryPlan.activeRecovery || 'On designated active recovery days (Tuesday, Thursday, or Sunday), perform 20-30 mins of low-intensity Zone 2 walking, mobility flow, or light swimming.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#F9F8F6] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#78716C] uppercase text-[10px] block">Stretching &amp; Mobility</span>
                <p className="text-[#292524] leading-relaxed">
                  {recoveryPlan.stretchingMobility || 'Dynamic stretching (arm circles, leg swings, torso twists) 8-10 mins pre-workout; static stretching (hamstrings, hip flexors, lats) 8-10 mins post-workout.'}
                </p>
              </div>
            </div>

            {/* Progress Tracking & Overload Guidance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 bg-[#FFFDF8] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#F97316] uppercase text-[10px] block">Baseline Strength &amp; Cardio Tests</span>
                <p className="text-[#292524] leading-relaxed">
                  {progressPlan.progressTracking || 'Baseline assessment: Push-ups test, bodyweight squats max reps, 60s plank, 1-mile walk/run. Monitor perceived exertion (RPE) to calibrate weight load.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#FFFDF8] border border-[#FED7AA] rounded-2xl space-y-1">
                <span className="font-extrabold text-[#F97316] uppercase text-[10px] block">Progressive Overload &amp; Focus Areas</span>
                <p className="text-[#292524] leading-relaxed">
                  {progressPlan.improvementSuggestions || 'Gradually increase load by 2.5kg or reps by 1-2 every 7–10 days while maintaining strict biomechanical form.'}
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Step 1: Customer Details & Fitness Profile */
        <form onSubmit={handleSubmitAssessment} className="space-y-6">
          <div className="bg-white border border-[#E7E5E4] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E4] gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F97316] text-white">
                    Step 1
                  </span>
                  <h3 className="text-xl font-bold text-[#292524]">Customer Details &amp; Fitness Profile</h3>
                </div>
                <p className="text-sm text-[#78716C] mt-1">
                  Your registered profile details are displayed below. AI uses these details to generate an initial draft for your certified trainer.
                </p>
              </div>
              <span className="text-xs font-bold text-[#F97316] bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                Verified Customer Details
              </span>
            </div>

            {/* 1. Personal & Contact Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-2">
                <User size={15} className="text-[#F97316]" /> Personal &amp; Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5 flex items-center gap-1">
                    <Mail size={12} className="text-[#F97316]" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5 flex items-center gap-1">
                    <Phone size={12} className="text-[#F97316]" /> Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Mobile number"
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Physical Biometrics */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-2">
                <HeartPulse size={15} className="text-[#F97316]" /> Physical Biometrics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={e => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Estimated BMI</label>
                  <div className="w-full px-4 py-2.5 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl text-sm font-bold text-[#F97316] flex items-center justify-between">
                    <span>
                      {Number(formData.height) > 0 ? (Number(formData.weight) / ((Number(formData.height)/100) * (Number(formData.height)/100))).toFixed(1) : '22.0'}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border">
                      Calculated
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Fitness Goals & Training Preferences */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-2">
                <Dumbbell size={15} className="text-[#F97316]" /> Fitness Goals &amp; Training Preferences
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Primary Fitness Goal</label>
                  <select
                    value={formData.fitnessGoal}
                    onChange={e => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                  >
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Muscle Building">Muscle Building</option>
                    <option value="Strength Training">Strength Training</option>
                    <option value="General Fitness">General Fitness</option>
                    <option value="Bodybuilding">Bodybuilding</option>
                    <option value="Yoga">Yoga</option>
                    <option value="CrossFit">CrossFit</option>
                    <option value="Flexibility & Mobility">Flexibility &amp; Mobility</option>
                    <option value="Endurance">Endurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Current Fitness Level</label>
                  <select
                    value={formData.currentFitnessLevel}
                    onChange={e => setFormData({ ...formData, currentFitnessLevel: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                  >
                    <option value="Beginner">Beginner (New to training)</option>
                    <option value="Intermediate">Intermediate (1-2 yrs experience)</option>
                    <option value="Advanced">Advanced (3+ yrs consistent training)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Training Mode</label>
                  <select
                    value={formData.preferredTraining}
                    onChange={e => setFormData({ ...formData, preferredTraining: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                  >
                    <option value="Offline">Offline (In-Gym Training)</option>
                    <option value="Online">Online (Virtual Training)</option>
                    <option value="Hybrid">Hybrid (In-Gym + Online)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Preferred Workout Days</label>
                  <select
                    value={formData.availableWorkoutDays}
                    onChange={e => setFormData({ ...formData, availableWorkoutDays: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                  >
                    <option value="1-2 days">1-2 Days / Week</option>
                    <option value="3-4 days">3-4 Days / Week (Recommended)</option>
                    <option value="4 Days">4 Days / Week</option>
                    <option value="5-6 days">5-6 Days / Week</option>
                    <option value="Everyday">Everyday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Preferred Workout Time</label>
                  <select
                    value={formData.preferredWorkoutTime}
                    onChange={e => setFormData({ ...formData, preferredWorkoutTime: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                  >
                    <option value="Early Morning (5-7am)">Early Morning (05:00 AM - 07:00 AM)</option>
                    <option value="Morning (7-9am)">Morning (07:00 AM - 09:00 AM)</option>
                    <option value="Mid Morning (9-11am)">Mid Morning (09:00 AM - 11:00 AM)</option>
                    <option value="Afternoon (12-3pm)">Afternoon (12:00 PM - 03:00 PM)</option>
                    <option value="Evening (5-8pm)">Evening (05:00 PM - 08:00 PM)</option>
                    <option value="Night (8-11pm)">Night (08:00 PM - 11:00 PM)</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Equipment Access</label>
                  <select
                    value={formData.equipmentAvailability}
                    onChange={e => setFormData({ ...formData, equipmentAvailability: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                  >
                    <option value="Full Commercial Gym">Full Commercial Gym (Barbells, Cables, Machines)</option>
                    <option value="Home Gym / Dumbbells">Home Gym (Dumbbells, Bench)</option>
                    <option value="Bodyweight / Calisthenics">Bodyweight Only / Calisthenics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292524] uppercase mb-1.5">Dietary Preference</label>
                  <select
                    value={formData.dietaryPreferences}
                    onChange={e => setFormData({ ...formData, dietaryPreferences: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none font-semibold text-[#292524]"
                  >
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Health & Medical Notes */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#78716C] uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert size={15} className="text-[#F97316]" /> Health Considerations &amp; Medical Notes
              </h4>
              <div>
                <input
                  type="text"
                  value={formData.injuries === 'None reported' ? '' : formData.injuries}
                  onChange={e => setFormData({ ...formData, injuries: e.target.value || 'None' })}
                  placeholder="Any injuries, past surgeries, or physical limitations? (e.g., lower back stiffness, knee pain, or 'None')"
                  className="w-full px-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none text-[#292524]"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#78716C]">
                Clicking generate will trigger the AI engine and automatically dispatch the draft to your certified trainer.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white rounded-xl font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating AI Draft for Trainer...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate AI Plan for Trainer Review
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default MemberAIFitness;
