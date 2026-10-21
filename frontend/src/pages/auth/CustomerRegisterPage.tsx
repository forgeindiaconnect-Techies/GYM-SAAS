import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, AlertCircle, Loader2, ChevronRight, ChevronLeft, Check,
  Eye, EyeOff, ArrowLeft, Lock, Star, Dumbbell, Target, Zap, TrendingUp,
  Crown, Leaf, Users, Cpu, Package
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const STEPS = ['Account', 'Personal', 'Fitness', 'Package', 'Terms'];

const FITNESS_GOALS = [
  'Weight Loss', 'Muscle Gain', 'Strength', 'General Fitness',
  'Bodybuilding', 'Yoga', 'CrossFit', 'Personal Training', 'Online Coaching'
];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TRAINING_TYPES = ['Offline', 'Online', 'Hybrid'];
const WORKOUT_TIMES = ['Early Morning (5-7am)', 'Morning (7-9am)', 'Mid Morning (9-11am)', 'Afternoon (12-3pm)', 'Evening (5-8pm)', 'Night (8-11pm)', 'Flexible'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const WORKOUT_DAYS = ['1-2 days', '3-4 days', '5-6 days', 'Everyday'];

const GOAL_ICONS: Record<string, any> = {
  'Weight Loss': Target, 'Muscle Gain': Dumbbell, 'Strength': Zap,
  'General Fitness': Activity, 'Bodybuilding': Crown, 'Yoga': Leaf,
  'CrossFit': TrendingUp, 'Personal Training': Users, 'Online Coaching': Cpu,
};
const GOAL_COLORS: Record<string, string> = {
  'Weight Loss': '#C43D4D', 'Muscle Gain': '#A991D4', 'Strength': '#6366F1',
  'General Fitness': '#27845A', 'Bodybuilding': '#967CC5', 'Yoga': '#27845A',
  'CrossFit': '#B77916', 'Personal Training': '#8B5CF6', 'Online Coaching': '#0EA5E9',
};

const initialForm = {
  firstName: '', lastName: '', email: '', mobile: '', password: '', confirmPassword: '',
  dateOfBirth: '', gender: '', city: '', pinCode: '', height: '', weight: '',
  fitnessGoal: '', experienceLevel: '', preferredTraining: '', preferredWorkoutTime: '', preferredWorkoutDays: '',
  emergencyContactName: '', emergencyContactMobile: '', emergencyContactRelation: '',
  acceptTerms: false, acceptPrivacy: false,
  // Package selection
  selectedPackageId: '',
  selectedBillingPlan: '' as 'monthly' | 'annual' | '',
};

interface GymPackage {
  _id: string;
  name: string;
  fitnessGoal: string;
  description?: string;
  features: string[];
  benefits: string[];
  trainingType: string;
  duration: string;
  monthlyPrice: number;
  annualPrice: number;
  availablePlans: string;
  isPopular: boolean;
}

const CustomerRegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem('customer_reg_step');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem('customer_reg_form');
    return saved ? JSON.parse(saved) : initialForm;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [intentData, setIntentData] = useState<any>(null);

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(() => {
    return sessionStorage.getItem('customer_reg_otp') === 'true';
  });

  // Package state
  const [packages, setPackages] = useState<GymPackage[]>([]);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [pkgError, setPkgError] = useState('');

  useEffect(() => { sessionStorage.setItem('customer_reg_step', step.toString()); }, [step]);
  useEffect(() => { sessionStorage.setItem('customer_reg_form', JSON.stringify(form)); }, [form]);
  useEffect(() => { sessionStorage.setItem('customer_reg_otp', otpVerified.toString()); }, [otpVerified]);

  useEffect(() => {
    const intentStr = sessionStorage.getItem('checkout_intent');
    if (intentStr) {
      try { setIntentData(JSON.parse(intentStr)); } catch (e) { /* noop */ }
    }
  }, []);

  // Fetch packages when entering step 3 (Package) and a fitness goal is selected
  const fetchPackages = useCallback(async (goal: string, gymId?: string) => {
    if (!goal) { setPackages([]); return; }
    setPkgLoading(true);
    setPkgError('');
    try {
      const params: any = { fitnessGoal: goal };
      // If registration came from a gym page, filter by that gym
      const resolvedGymId = gymId || intentData?.gymId;
      if (resolvedGymId) params.gymId = resolvedGymId;

      const res = await api.get('/gym-packages/public', { params });
      setPackages(res.data.packages || []);
    } catch (e: any) {
      setPkgError('Could not load packages. Please try again.');
      setPackages([]);
    } finally {
      setPkgLoading(false);
    }
  }, [intentData?.gymId]);

  // When step becomes 3 (Package step), fetch packages for selected goal
  useEffect(() => {
    if (step === 3 && form.fitnessGoal) {
      fetchPackages(form.fitnessGoal, intentData?.gymId);
    }
  }, [step, form.fitnessGoal, fetchPackages, intentData?.gymId]);

  const handleSendOtp = async () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setErrors(e => ({ ...e, email: 'Enter a valid email first' }));
      return;
    }
    try {
      const res = await api.post('/auth/send-otp', { email: form.email });
      if (res.data.success) {
        setOtpSent(true);
        alert(`Verification code (OTP) sent to ${form.email}. Please check your inbox or spam folder!`);
      } else {
        alert(res.data.message || 'Failed to send OTP email.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send OTP email.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { alert('Please enter the 6-digit OTP code'); return; }
    try {
      const res = await api.post('/auth/verify-otp', { email: form.email, otp });
      if (res.data.success) {
        setOtpVerified(true);
        setErrors(e => { const n = { ...e }; delete n['email']; return n; });
        alert('OTP Verified Successfully! You can now enter your mobile number.');
      } else {
        alert(res.data.message || 'Invalid OTP');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Invalid or expired OTP');
    }
  };

  const handleMobileClick = (e?: React.MouseEvent | React.FocusEvent) => {
    if (!otpVerified) {
      if (e) e.preventDefault();
      alert('Please enter and verify your email ID first!');
      const el = document.getElementById('reg-email');
      if (el) el.focus();
    }
  };

  const set = (field: string, value: string | boolean) => {
    setForm((f: any) => ({ ...f, [field]: value }));
    setErrors((e: any) => { const n = { ...e }; delete n[field]; return n; });
  };

  // When fitness goal changes on step 2, reset package selection
  const setFitnessGoal = (goal: string) => {
    setForm((f: any) => ({ ...f, fitnessGoal: goal, selectedPackageId: '', selectedBillingPlan: '' }));
    setErrors((e: any) => { const n = { ...e }; delete n['fitnessGoal']; return n; });
    setPackages([]);
  };

  // When package changes, reset billing plan
  const selectPackage = (pkgId: string) => {
    setForm((f: any) => ({ ...f, selectedPackageId: pkgId, selectedBillingPlan: '' }));
    setErrors((e: any) => { const n = { ...e }; delete n['selectedPackageId']; delete n['selectedBillingPlan']; return n; });
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.firstName.trim()) e.firstName = 'First name is required';
      if (!form.lastName.trim()) e.lastName = 'Last name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
      else if (!otpVerified) e.email = 'Please verify your email with OTP';
      if (!form.mobile.trim()) e.mobile = 'Mobile is required';
      else if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (step === 1) {
      if (!form.gender) e.gender = 'Gender is required';
      if (!form.city.trim()) e.city = 'City is required';
      if (!form.height) e.height = 'Height is required';
      if (!form.weight) e.weight = 'Weight is required';
      if (!form.emergencyContactName.trim()) e.emergencyContactName = 'Emergency contact name is required';
      if (!form.emergencyContactMobile.trim()) e.emergencyContactMobile = 'Emergency contact mobile is required';
      if (!form.emergencyContactRelation.trim()) e.emergencyContactRelation = 'Emergency contact relationship is required';
    }
    if (step === 2) {
      if (!form.fitnessGoal) e.fitnessGoal = 'Please select a fitness goal';
      if (!form.experienceLevel) e.experienceLevel = 'Please select your experience level';
      if (!form.preferredTraining) e.preferredTraining = 'Please select your preferred workout type';
      if (!form.preferredWorkoutDays) e.preferredWorkoutDays = 'Please select your preferred workout days';
      if (!form.preferredWorkoutTime) e.preferredWorkoutTime = 'Please select your preferred workout time';
    }
    if (step === 3) {
      // Package selection is optional – skip validation if no packages available
      if (packages.length > 0) {
        if (!form.selectedPackageId) e.selectedPackageId = 'Please select a package';
        else {
          const pkg = packages.find(p => p._id === form.selectedPackageId);
          if (pkg) {
            if (!form.selectedBillingPlan) e.selectedBillingPlan = 'Please choose Monthly or Annual plan';
          }
        }
      }
    }
    if (step === 4) {
      if (!form.acceptTerms) e.acceptTerms = 'You must accept the Terms & Conditions';
      if (!form.acceptPrivacy) e.acceptPrivacy = 'You must accept the Privacy Policy';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setApiError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        city: form.city || undefined,
        pinCode: form.pinCode || undefined,
        fitnessGoal: form.fitnessGoal || undefined,
        experienceLevel: form.experienceLevel || undefined,
        preferredTraining: form.preferredTraining || undefined,
        preferredWorkoutTime: form.preferredWorkoutTime || undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        emergencyContact: {
          name: form.emergencyContactName,
          mobile: form.emergencyContactMobile,
          relationship: form.emergencyContactRelation
        },
        gymId: intentData?.gymId,
        branchId: intentData?.branchId,
      });

      if (res.data.token && res.data.user) {
        sessionStorage.removeItem('customer_reg_step');
        sessionStorage.removeItem('customer_reg_form');
        sessionStorage.removeItem('customer_reg_otp');
        await login(res.data.user, res.data.token, false);

        // If a package was selected, join the gym with the package
        if (form.selectedPackageId && form.selectedBillingPlan && intentData?.gymId) {
          try {
            await api.post('/memberships/join', {
              gymId: intentData.gymId,
              branchId: intentData.branchId,
              packageId: form.selectedPackageId,
              billingPlan: form.selectedBillingPlan,
              fitnessGoal: form.fitnessGoal,
              planName: packages.find(p => p._id === form.selectedPackageId)?.name || 'Standard',
              paymentMethod: 'UPI',
            });
          } catch (joinErr) {
            console.error('Failed to auto-join gym after registration:', joinErr);
          }
        }

        const intentStr = sessionStorage.getItem('checkout_intent');
        if (intentStr) {
          try {
            const intent = JSON.parse(intentStr);
            sessionStorage.removeItem('checkout_intent');
            const isTrial = intent.plan?.name?.toLowerCase().includes('trial') || Number(intent.plan?.price || 0) === 0;
            if (!isTrial) {
              navigate(`/gyms/${intent.gymId}/checkout`, { state: { plan: intent.plan, gym: intent.gym || { _id: intent.gymId } }, replace: true });
              return;
            }
          } catch (e) {
            sessionStorage.removeItem('checkout_intent');
          }
        }

        navigate('/status?type=pending');
      } else {
        sessionStorage.removeItem('customer_reg_step');
        sessionStorage.removeItem('customer_reg_form');
        sessionStorage.removeItem('customer_reg_otp');
        alert('Registration successful!');
        navigate('/pending');
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full bg-[#FFFFFF] border ${errors[field] ? 'border-[#E9DFF4]' : 'border-[#E5DDEB]'} text-[#292431] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#A991D4] transition-colors placeholder-[#555]`;

  const selBtnCls = (active: boolean) =>
    `px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer ${active ? 'bg-[#A991D4] text-[#292431] border-[#A991D4] font-semibold' : 'bg-[#FFFFFF] border-[#E5DDEB] text-[#6B5E78] hover:border-[#A991D4]/50'}`;

  // Helper: get selected package
  const selectedPkg = packages.find(p => p._id === form.selectedPackageId);

  return (
    <div className="min-h-screen bg-[#F7F4FA] flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      {/* Back to Home Arrow */}
      <Link to="/" className="absolute top-8 left-8 text-[#6B5E78] hover:text-[#A991D4] flex items-center gap-2 transition-colors z-10">
        <ArrowLeft size={20} />
        <span className="font-medium text-sm">Back to Home</span>
      </Link>

      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 mb-8 group z-10">
        <div className="w-9 h-9 bg-[#A991D4] rounded-md flex items-center justify-center">
          <Activity className="text-black" size={22} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#A991D4]">Gymora</span>
      </Link>

      <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Progress Header */}
        <div className="bg-[#FFFFFF] border-b border-[#E5DDEB] px-8 py-5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#292431]">Customer Registration</h1>
          <div className="flex items-center space-x-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center space-x-2" title={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-[#A991D4] text-[#292431]' : i === step ? 'bg-[#A991D4] text-[#292431] ring-2 ring-[#C43D4D]/30 ring-offset-1 ring-offset-[#FFFFFF]' : 'bg-[#E9DFF4] text-[#555]'}`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-[#292431] font-medium' : 'text-[#555]'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px w-4 sm:w-6 ${i < step ? 'bg-[#A991D4]' : 'bg-[#E9DFF4]'}`} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {apiError && (
            <div className="flex items-center space-x-3 bg-[#E9DFF4]/10 border border-[#E9DFF4]/30 text-teal-400 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={18} className="shrink-0" /><span>{apiError}</span>
            </div>
          )}

          {/* STEP 0 — Account */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#292431] mb-1">Account Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#6B5E78] mb-2">First Name *</label>
                  <input id="reg-firstName" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" className={inputCls('firstName')} />
                  {errors.firstName && <p className="text-teal-400 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[#6B5E78] mb-2">Last Name *</label>
                  <input id="reg-lastName" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" className={inputCls('lastName')} />
                  {errors.lastName && <p className="text-teal-400 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#6B5E78] mb-2">Email Address *</label>
                <div className="flex gap-2">
                  <input id="reg-email" type="email" value={form.email} onChange={e => { set('email', e.target.value); setOtpVerified(false); setOtpSent(false); }} disabled={otpVerified} placeholder="you@example.com" className={inputCls('email') + ' flex-1'} />
                  {!otpVerified && (
                    <button type="button" onClick={handleSendOtp} className="px-4 py-2 bg-[#A991D4] text-[#292431] rounded-xl text-sm font-bold hover:bg-[#967CC5] transition-colors whitespace-nowrap">
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                  {otpVerified && (
                    <button type="button" onClick={() => { setOtpVerified(false); setOtpSent(false); setOtp(''); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors whitespace-nowrap">
                      Change
                    </button>
                  )}
                </div>
                {errors.email && <p className="text-[#E9DFF4] text-xs mt-1">{errors.email}</p>}
                {otpSent && !otpVerified && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <label className="block text-xs font-semibold text-[#A991D4] mb-2">Enter OTP sent to your email</label>
                    <div className="flex gap-2">
                      <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" className="w-full bg-[#FFFFFF] border border-green-200 text-[#292431] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A991D4] transition-colors flex-1" maxLength={6} />
                      <button type="button" onClick={handleVerifyOtp} className="px-4 py-2 bg-[#292431] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors whitespace-nowrap">Verify</button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-[#6B5E78]">Mobile Number *</label>
                  {!otpVerified ? (
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><Lock size={12} /> Verify email first</span>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Check size={12} /> Email verified</span>
                  )}
                </div>
                <div onClick={() => { if (!otpVerified) handleMobileClick(); }} className={!otpVerified ? 'cursor-not-allowed' : ''}>
                  <input id="reg-mobile" type="tel" maxLength={10} value={form.mobile}
                    onChange={e => { if (!otpVerified) { handleMobileClick(); return; } const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) set('mobile', v); }}
                    onClick={e => { if (!otpVerified) { e.stopPropagation(); handleMobileClick(e); } }}
                    onFocus={e => { if (!otpVerified) { e.target.blur(); handleMobileClick(e); } }}
                    readOnly={!otpVerified}
                    placeholder={otpVerified ? '10-digit number' : 'Please verify email first'}
                    className={inputCls('mobile') + (!otpVerified ? ' bg-[#F7F4FA]/70 cursor-not-allowed select-none' : '')} />
                </div>
                {errors.mobile && <p className="text-teal-400 text-xs mt-1">{errors.mobile}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#6B5E78] mb-2">Password *</label>
                <div className="relative">
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Minimum 8 characters" className={inputCls('password') + ' pr-12'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B5E78] hover:text-[#292431]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-teal-400 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#6B5E78] mb-2">Confirm Password *</label>
                <div className="relative">
                  <input id="reg-confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat your password" className={inputCls('confirmPassword') + ' pr-12'} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B5E78] hover:text-[#292431]">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-teal-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {/* STEP 1 — Personal */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#292431] mb-1">Personal Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#6B5E78] mb-2">City *</label>
                  <input id="reg-city" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Your city" className={inputCls('city')} />
                  {errors.city && <p className="text-teal-400 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[#6B5E78] mb-2">PIN Code</label>
                  <input id="reg-pinCode" value={form.pinCode} onChange={e => set('pinCode', e.target.value)} placeholder="6-digit PIN code" className={inputCls('pinCode')} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#6B5E78] mb-3">Gender *</label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map(g => (
                    <button key={g} type="button" onClick={() => set('gender', g)} className={selBtnCls(form.gender === g)}>{g}</button>
                  ))}
                </div>
                {errors.gender && <p className="text-teal-400 text-xs mt-2">{errors.gender}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#6B5E78] mb-2">Height (cm) *</label>
                  <input id="reg-height" type="number" value={form.height} onChange={e => set('height', e.target.value)} placeholder="e.g. 175" className={inputCls('height')} />
                  {errors.height && <p className="text-teal-400 text-xs mt-1">{errors.height}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[#6B5E78] mb-2">Weight (kg) *</label>
                  <input id="reg-weight" type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="e.g. 70" className={inputCls('weight')} />
                  {errors.weight && <p className="text-teal-400 text-xs mt-1">{errors.weight}</p>}
                </div>
              </div>
              <div className="pt-4 border-t border-[#E5DDEB]">
                <h3 className="text-[#292431] font-bold mb-4">Emergency Contact</h3>
                <div className="space-y-4">
                  <div>
                    <input type="text" placeholder="Contact Name" value={form.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)} className={inputCls('emergencyContactName')} />
                    {errors.emergencyContactName && <p className="text-[#E9DFF4] text-xs mt-1">{errors.emergencyContactName}</p>}
                  </div>
                  <div>
                    <input type="tel" maxLength={10} placeholder="Contact Number" value={form.emergencyContactMobile} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 10) set('emergencyContactMobile', v); }} className={inputCls('emergencyContactMobile')} />
                    {errors.emergencyContactMobile && <p className="text-[#E9DFF4] text-xs mt-1">{errors.emergencyContactMobile}</p>}
                  </div>
                  <div>
                    <input type="text" placeholder="Relationship (e.g., Parent, Spouse)" value={form.emergencyContactRelation} onChange={e => set('emergencyContactRelation', e.target.value)} className={inputCls('emergencyContactRelation')} />
                    {errors.emergencyContactRelation && <p className="text-[#E9DFF4] text-xs mt-1">{errors.emergencyContactRelation}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Fitness Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#292431] mb-1">Fitness Preferences</h2>
              <div>
                <label className="block text-sm text-[#6B5E78] mb-3">Fitness Goal *</label>
                <div className="flex flex-wrap gap-2">
                  {FITNESS_GOALS.map(g => {
                    const Icon = GOAL_ICONS[g] || Activity;
                    const color = GOAL_COLORS[g] || '#A991D4';
                    const isActive = form.fitnessGoal === g;
                    return (
                      <button key={g} type="button" onClick={() => setFitnessGoal(g)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer flex items-center gap-1.5 ${isActive ? 'text-white border-transparent font-semibold' : 'bg-[#FFFFFF] border-[#E5DDEB] text-[#6B5E78] hover:border-[#A991D4]/50'}`}
                        style={isActive ? { backgroundColor: color, borderColor: color } : {}}>
                        <Icon size={14} />
                        {g}
                      </button>
                    );
                  })}
                </div>
                {errors.fitnessGoal && <p className="text-teal-400 text-xs mt-2">{errors.fitnessGoal}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#6B5E78] mb-3">Experience Level *</label>
                <div className="flex gap-2">
                  {EXPERIENCE_LEVELS.map(l => (
                    <button key={l} type="button" onClick={() => set('experienceLevel', l)} className={selBtnCls(form.experienceLevel === l)}>{l}</button>
                  ))}
                </div>
                {errors.experienceLevel && <p className="text-teal-400 text-xs mt-2">{errors.experienceLevel}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#6B5E78] mb-3">Preferred Workout Type *</label>
                <div className="flex gap-2">
                  {TRAINING_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => set('preferredTraining', t)} className={selBtnCls(form.preferredTraining === t)}>{t}</button>
                  ))}
                </div>
                {errors.preferredTraining && <p className="text-teal-400 text-xs mt-2">{errors.preferredTraining}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#6B5E78] mb-3">Preferred Workout Days *</label>
                <div className="flex gap-2">
                  {WORKOUT_DAYS.map(d => (
                    <button key={d} type="button" onClick={() => set('preferredWorkoutDays', d)} className={selBtnCls(form.preferredWorkoutDays === d)}>{d}</button>
                  ))}
                </div>
                {errors.preferredWorkoutDays && <p className="text-teal-400 text-xs mt-2">{errors.preferredWorkoutDays}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#6B5E78] mb-3">Preferred Workout Time *</label>
                <div className="flex flex-wrap gap-2">
                  {WORKOUT_TIMES.map(t => (
                    <button key={t} type="button" onClick={() => set('preferredWorkoutTime', t)} className={selBtnCls(form.preferredWorkoutTime === t)}>{t}</button>
                  ))}
                </div>
                {errors.preferredWorkoutTime && <p className="text-teal-400 text-xs mt-2">{errors.preferredWorkoutTime}</p>}
              </div>
            </div>
          )}

          {/* STEP 3 — Package Selection */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[#292431] mb-1">Select Your Package</h2>
                <p className="text-sm text-[#6B5E78]">
                  Showing packages for: <span className="font-semibold text-[#A991D4]">{form.fitnessGoal}</span>
                </p>
              </div>

              {pkgLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#A991D4] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : pkgError ? (
                <div className="text-center py-8 text-red-500 text-sm">{pkgError}</div>
              ) : packages.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-stone-50 rounded-2xl border border-[#E5DDEB]">
                  <div className="w-14 h-14 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center">
                    <Package size={28} className="text-[#A991D4]" />
                  </div>
                  <p className="font-semibold text-[#292431]">No packages available</p>
                  <p className="text-xs text-[#6B5E78]">No packages exist yet for <span className="font-medium">{form.fitnessGoal}</span>.</p>
                  <p className="text-xs text-[#6B5E78]">You can continue your registration and join a package later.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                  {packages.map(pkg => {
                    const Icon = GOAL_ICONS[pkg.fitnessGoal] || Activity;
                    const color = GOAL_COLORS[pkg.fitnessGoal] || '#A991D4';
                    const isSelected = form.selectedPackageId === pkg._id;

                    return (
                      <div key={pkg._id}
                        onClick={() => selectPackage(pkg._id)}
                        className={`rounded-2xl p-5 border-2 cursor-pointer transition-all ${isSelected ? 'border-[#A991D4] shadow-md' : 'border-[#E5DDEB] hover:border-[#A991D4]/50'}`}>
                        {/* Package header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}15` }}>
                              <Icon size={20} style={{ color }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-[#292431] text-sm">{pkg.name}</h3>
                                {pkg.isPopular && (
                                  <span className="text-[10px] bg-[#A991D4] text-[#292431] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Star size={8} className="fill-white" /> Popular
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2 mt-0.5">
                                <span className="text-xs text-[#6B5E78]">{pkg.trainingType}</span>
                                <span className="text-[#E5DDEB]">·</span>
                                <span className="text-xs text-[#6B5E78]">{pkg.duration}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${isSelected ? 'border-[#A991D4] bg-[#A991D4]' : 'border-[#E5DDEB]'}`}>
                            {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>
                        </div>

                        {pkg.description && (
                          <p className="text-xs text-[#6B5E78] mb-3 leading-relaxed">{pkg.description}</p>
                        )}

                        {/* Features */}
                        {pkg.features.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-bold text-[#292431] mb-2 uppercase tracking-wider">Features:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {pkg.features.slice(0, 6).map((f, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-[#6B5E78]">
                                  <Check size={10} style={{ color }} strokeWidth={3} className="shrink-0" />
                                  {f}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Billing plan selection */}
                        {isSelected && (
                          <div className="border-t border-[#E5DDEB] pt-3 mt-1 space-y-2">
                            <p className="text-xs font-bold text-[#292431] mb-2">Choose your billing plan:</p>
                            <div className="grid grid-cols-2 gap-3">
                              {(pkg.availablePlans === 'monthly' || pkg.availablePlans === 'both') && (
                                <button type="button"
                                  onClick={e => { e.stopPropagation(); setForm((f: any) => ({ ...f, selectedBillingPlan: 'monthly' })); setErrors((e: any) => { const n = { ...e }; delete n['selectedBillingPlan']; return n; }); }}
                                  className={`p-3 rounded-xl border-2 text-center transition-all ${form.selectedBillingPlan === 'monthly' ? 'border-[#A991D4] bg-orange-50' : 'border-[#E5DDEB] hover:border-[#A991D4]/50'}`}>
                                  <span className="block text-xs font-semibold text-[#6B5E78]">Monthly</span>
                                  <span className="block text-lg font-black text-[#A991D4]">₹{pkg.monthlyPrice.toLocaleString('en-IN')}</span>
                                  <span className="block text-[10px] text-[#6B5E78]">per month</span>
                                </button>
                              )}
                              {(pkg.availablePlans === 'annual' || pkg.availablePlans === 'both') && (
                                <button type="button"
                                  onClick={e => { e.stopPropagation(); setForm((f: any) => ({ ...f, selectedBillingPlan: 'annual' })); setErrors((e: any) => { const n = { ...e }; delete n['selectedBillingPlan']; return n; }); }}
                                  className={`p-3 rounded-xl border-2 text-center transition-all ${form.selectedBillingPlan === 'annual' ? 'border-[#27845A] bg-emerald-50' : 'border-[#E5DDEB] hover:border-emerald-300'}`}>
                                  <span className="block text-xs font-semibold text-[#6B5E78]">Annual</span>
                                  <span className="block text-lg font-black text-[#27845A]">₹{pkg.annualPrice.toLocaleString('en-IN')}</span>
                                  <span className="block text-[10px] text-emerald-700 font-semibold">per year · Save more</span>
                                </button>
                              )}
                            </div>
                            {errors.selectedBillingPlan && (
                              <p className="text-teal-400 text-xs mt-1">{errors.selectedBillingPlan}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {errors.selectedPackageId && (
                <p className="text-teal-400 text-xs">{errors.selectedPackageId}</p>
              )}

              {/* Summary of selected */}
              {selectedPkg && form.selectedBillingPlan && (
                <div className="p-4 bg-[#F7F4FA] border border-[#A991D4]/30 rounded-xl">
                  <p className="text-xs font-bold text-[#292431] mb-2">Selected Plan Summary</p>
                  <div className="space-y-1 text-xs text-[#6B5E78]">
                    <div className="flex justify-between"><span>Package:</span><span className="font-semibold text-[#292431]">{selectedPkg.name}</span></div>
                    <div className="flex justify-between"><span>Goal:</span><span className="font-semibold text-[#292431]">{selectedPkg.fitnessGoal}</span></div>
                    <div className="flex justify-between"><span>Plan:</span><span className="font-semibold text-[#292431] capitalize">{form.selectedBillingPlan}</span></div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-bold text-[#A991D4]">
                        ₹{(form.selectedBillingPlan === 'annual' ? selectedPkg.annualPrice : selectedPkg.monthlyPrice).toLocaleString('en-IN')}
                        {form.selectedBillingPlan === 'monthly' ? '/month' : '/year'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Terms */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-lg font-semibold text-[#292431] mb-1">Terms &amp; Conditions</h2>
              <p className="text-[#6B5E78] text-sm">Please read and accept the following before creating your account.</p>

              {/* Selected plan summary */}
              {selectedPkg && form.selectedBillingPlan && (
                <div className="p-4 bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl mb-4">
                  <h3 className="font-bold text-[#292431] mb-3">Selected Membership Package</h3>
                  <div className="space-y-2 text-sm text-[#6B5E78]">
                    <div className="flex justify-between"><span>Package:</span><span className="font-semibold text-[#292431]">{selectedPkg.name}</span></div>
                    <div className="flex justify-between"><span>Fitness Goal:</span><span className="font-semibold text-[#292431]">{selectedPkg.fitnessGoal}</span></div>
                    <div className="flex justify-between"><span>Billing Plan:</span><span className="font-semibold text-[#292431] capitalize">{form.selectedBillingPlan}</span></div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-semibold text-[#A991D4]">
                        ₹{(form.selectedBillingPlan === 'annual' ? selectedPkg.annualPrice : selectedPkg.monthlyPrice).toLocaleString('en-IN')}
                        {form.selectedBillingPlan === 'monthly' ? ' / month' : ' / year'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {intentData?.plan && !selectedPkg && (
                <div className="p-4 bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl mb-6">
                  <h3 className="font-bold text-[#292431] mb-3">Selected Membership Plan</h3>
                  <div className="space-y-2 text-sm text-[#6B5E78]">
                    <div className="flex justify-between"><span>Plan:</span><span className="font-semibold text-[#292431]">{intentData.plan.name}</span></div>
                    <div className="flex justify-between"><span>Duration:</span><span className="font-semibold text-[#292431]">{intentData.plan.duration}</span></div>
                    <div className="flex justify-between"><span>Price:</span><span className="font-semibold text-[#A991D4]">₹{intentData.plan.price}</span></div>
                  </div>
                </div>
              )}

              <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-xl p-4 text-sm text-[#6B5E78] max-h-40 overflow-y-auto leading-relaxed">
                <strong className="text-[#292431] block mb-2">Terms &amp; Conditions</strong>
                By creating an account on Gymora, you agree to use the platform in compliance with all applicable laws. Your personal data will be used to provide fitness coaching and gym management services. AI-generated plans are for guidance only and not a substitute for professional medical advice. Subscriptions are billed according to your chosen plan. You may cancel at any time.
              </div>
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <button type="button" onClick={() => set('acceptTerms', !form.acceptTerms)} className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${form.acceptTerms ? 'bg-[#A991D4] border-[#A991D4]' : 'border-[#555]'}`}>
                    {form.acceptTerms && <Check size={12} className="text-black" />}
                  </button>
                  <span className="text-sm text-[#6B5E78]">I accept the <Link to="/terms-of-service" className="text-[#A991D4] hover:underline">Terms &amp; Conditions</Link></span>
                </label>
                {errors.acceptTerms && <p className="text-teal-400 text-xs ml-8">{errors.acceptTerms}</p>}
                <label className="flex items-start space-x-3 cursor-pointer">
                  <button type="button" onClick={() => set('acceptPrivacy', !form.acceptPrivacy)} className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${form.acceptPrivacy ? 'bg-[#A991D4] border-[#A991D4]' : 'border-[#555]'}`}>
                    {form.acceptPrivacy && <Check size={12} className="text-black" />}
                  </button>
                  <span className="text-sm text-[#6B5E78]">I accept the <Link to="/privacy-policy" className="text-[#A991D4] hover:underline">Privacy Policy</Link></span>
                </label>
                {errors.acceptPrivacy && <p className="text-teal-400 text-xs ml-8">{errors.acceptPrivacy}</p>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5DDEB]">
            {step > 0 ? (
              <button type="button" onClick={prev} className="flex items-center space-x-2 px-5 py-2.5 bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-xl hover:bg-[#202020] transition-colors text-sm">
                <ChevronLeft size={18} /><span>Back</span>
              </button>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 px-5 py-2.5 bg-[#FFFFFF] border border-[#E5DDEB] text-[#292431] rounded-xl hover:bg-[#202020] transition-colors text-sm">
                <span>Back to Login</span>
              </Link>
            )}

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="flex items-center space-x-2 px-6 py-2.5 bg-[#A991D4] text-[#292431] font-bold rounded-xl hover:bg-[#967CC5] transition-colors text-sm">
                <span>Next</span><ChevronRight size={18} />
              </button>
            ) : (
              <button id="reg-submit" type="submit" disabled={isLoading} className="flex items-center space-x-2 px-6 py-2.5 bg-[#A991D4] text-[#292431] font-bold rounded-xl hover:bg-[#967CC5] disabled:opacity-60 transition-colors text-sm">
                {isLoading ? <><Loader2 size={18} className="animate-spin" /><span>Creating Profile...</span></> : <><span>Create Profile</span><Check size={18} /></>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerRegisterPage;
