import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, Loader2, ChevronRight, ChevronLeft, Check, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';

const STEPS = ['Account', 'Personal', 'Fitness', 'Emergency', 'Terms'];

const FITNESS_GOALS = ['Weight Loss', 'Muscle Gain', 'Strength', 'General Fitness', 'Bodybuilding', 'Yoga', 'CrossFit', 'Personal Training', 'Online Coaching'];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TRAINING_TYPES = ['Offline', 'Online', 'Hybrid'];
const WORKOUT_TIMES = ['Early Morning (5-7am)', 'Morning (7-9am)', 'Mid Morning (9-11am)', 'Afternoon (12-3pm)', 'Evening (5-8pm)', 'Night (8-11pm)', 'Flexible'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const RELATIONSHIPS = ['Parent', 'Sibling', 'Spouse', 'Friend', 'Relative', 'Other'];

const initialForm = {
  // Account
  firstName: '', lastName: '', email: '', mobile: '', password: '', confirmPassword: '',
  // Personal
  dateOfBirth: '', gender: '', city: '', pinCode: '',
  // Fitness
  fitnessGoal: '', experienceLevel: '', preferredTraining: '', preferredWorkoutTime: '', height: '', weight: '',
  // Emergency
  emergencyName: '', emergencyRelationship: '', emergencyMobile: '',
  // Terms
  acceptTerms: false, acceptPrivacy: false,
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleSendOtp = () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setErrors(e => ({ ...e, email: 'Enter a valid email first' }));
      return;
    }
    setOtpSent(true);
    alert('Demo OTP: 123456');
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      setOtpVerified(true);
      setErrors(e => { const n = { ...e }; delete n['email']; return n; });
      alert('OTP Verified Successfully!');
    } else {
      alert('Invalid OTP');
    }
  };

  const set = (field: string, value: string | boolean) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
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
    }
    if (step === 2) {
      if (!form.fitnessGoal) e.fitnessGoal = 'Please select a fitness goal';
      if (!form.experienceLevel) e.experienceLevel = 'Please select your experience level';
    }
    if (step === 3) {
      if (!form.emergencyName.trim()) e.emergencyName = 'Emergency contact name is required';
      if (!form.emergencyRelationship) e.emergencyRelationship = 'Relationship is required';
      if (!form.emergencyMobile.trim()) e.emergencyMobile = 'Emergency mobile is required';
      else if (!/^\d{10}$/.test(form.emergencyMobile)) e.emergencyMobile = 'Enter a valid 10-digit number';
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
      await api.post('/auth/register', {
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
          name: form.emergencyName,
          relationship: form.emergencyRelationship,
          mobile: form.emergencyMobile,
        },
      });
      navigate('/pending');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full bg-[#FFFFFF] border ${errors[field] ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} text-[#202522] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#34483F] transition-colors placeholder-[#555]`;

  const selBtnCls = (active: boolean) =>
    `px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer ${active ? 'bg-[#34483F] text-white border-[#34483F] font-semibold' : 'bg-[#FFFFFF] border-[#DCD9CD] text-[#4A514D] hover:border-[#34483F]/50'}`;

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      {/* Back to Home Arrow */}
      <Link to="/" className="absolute top-8 left-8 text-[#4A514D] hover:text-[#34483F] flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} />
        <span className="font-medium text-sm">Back to Home</span>
      </Link>

      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 mb-8 group">
        <div className="w-9 h-9 bg-[#34483F] rounded-md flex items-center justify-center">
          <Activity className="text-black" size={22} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#34483F]">AI GYM</span>
      </Link>

      <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress Header */}
        <div className="bg-[#FFFFFF] border-b border-[#DCD9CD] px-8 py-5">
          <h1 className="text-xl font-bold text-[#202522] mb-4">Create Your Account</h1>
          <div className="flex items-center space-x-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-[#34483F] text-white' : i === step ? 'bg-[#34483F] text-white ring-2 ring-[#EF4444]/30 ring-offset-1 ring-offset-[#FFFFFF]' : 'bg-[#E8E5DA] text-[#555]'}`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-[#202522] font-medium' : 'text-[#555]'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px w-6 sm:w-8 ${i < step ? 'bg-[#34483F]' : 'bg-[#E8E5DA]'}`} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {apiError && (
            <div className="flex items-center space-x-3 bg-[#8FA89B]/10 border border-[#8FA89B]/30 text-teal-400 rounded-xl px-4 py-3 mb-6 text-sm">
              <AlertCircle size={18} className="shrink-0" /><span>{apiError}</span>
            </div>
          )}

          {/* STEP 0 — Account */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#202522] mb-1">Account Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#4A514D] mb-2">First Name *</label>
                  <input id="reg-firstName" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" className={inputCls('firstName')} />
                  {errors.firstName && <p className="text-teal-400 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[#4A514D] mb-2">Last Name *</label>
                  <input id="reg-lastName" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" className={inputCls('lastName')} />
                  {errors.lastName && <p className="text-teal-400 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-2">Email Address *</label>
                <div className="flex gap-2">
                  <input id="reg-email" type="email" value={form.email} onChange={e => { set('email', e.target.value); setOtpVerified(false); setOtpSent(false); }} disabled={otpVerified} placeholder="you@example.com" className={inputCls('email') + ' flex-1'} />
                  {!otpVerified && (
                    <button type="button" onClick={handleSendOtp} className="px-4 py-2 bg-[#34483F] text-white rounded-xl text-sm font-bold hover:bg-[#C6A77D] transition-colors whitespace-nowrap">
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                  {otpVerified && (
                    <button type="button" onClick={() => { setOtpVerified(false); setOtpSent(false); setOtp(''); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors whitespace-nowrap">
                      Change
                    </button>
                  )}
                </div>
                {errors.email && <p className="text-[#8FA89B] text-xs mt-1">{errors.email}</p>}
                {otpSent && !otpVerified && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <label className="block text-xs font-semibold text-[#34483F] mb-2">Enter OTP sent to your email</label>
                    <div className="flex gap-2">
                      <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" className="w-full bg-[#FFFFFF] border border-green-200 text-[#202522] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#34483F] transition-colors flex-1" maxLength={6} />
                      <button type="button" onClick={handleVerifyOtp} className="px-4 py-2 bg-[#202522] text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors whitespace-nowrap">
                        Verify
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-2">Mobile Number *</label>
                <input id="reg-mobile" type="tel" maxLength={10} value={form.mobile} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if(v.length <= 10) set('mobile', v); }} placeholder="10-digit number" className={inputCls('mobile')} />
                {errors.mobile && <p className="text-teal-400 text-xs mt-1">{errors.mobile}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-2">Password *</label>
                <div className="relative">
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Minimum 8 characters" className={inputCls('password') + ' pr-12'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A514D] hover:text-[#202522]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-teal-400 text-xs mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-2">Confirm Password *</label>
                <div className="relative">
                  <input id="reg-confirmPassword" type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat your password" className={inputCls('confirmPassword') + ' pr-12'} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A514D] hover:text-[#202522]">
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
              <h2 className="text-lg font-semibold text-[#202522] mb-1">Personal Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#4A514D] mb-2">Date of Birth</label>
                  <input id="reg-dob" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} className={inputCls('dateOfBirth') + ' [color-scheme:dark]'} />
                </div>
                <div>
                  <label className="block text-sm text-[#4A514D] mb-2">City *</label>
                  <input id="reg-city" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Your city" className={inputCls('city')} />
                  {errors.city && <p className="text-teal-400 text-xs mt-1">{errors.city}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-3">Gender *</label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map(g => (
                    <button key={g} type="button" onClick={() => set('gender', g)} className={selBtnCls(form.gender === g)}>{g}</button>
                  ))}
                </div>
                {errors.gender && <p className="text-teal-400 text-xs mt-2">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-2">PIN Code</label>
                <input id="reg-pinCode" value={form.pinCode} onChange={e => set('pinCode', e.target.value)} placeholder="6-digit PIN code" className={inputCls('pinCode')} />
              </div>
            </div>
          )}

          {/* STEP 2 — Fitness */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#202522] mb-1">Fitness Details</h2>
              <div>
                <label className="block text-sm text-[#4A514D] mb-3">Fitness Goal *</label>
                <div className="flex flex-wrap gap-2">
                  {FITNESS_GOALS.map(g => (
                    <button key={g} type="button" onClick={() => set('fitnessGoal', g)} className={selBtnCls(form.fitnessGoal === g)}>{g}</button>
                  ))}
                </div>
                {errors.fitnessGoal && <p className="text-teal-400 text-xs mt-2">{errors.fitnessGoal}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-3">Experience Level *</label>
                <div className="flex gap-2">
                  {EXPERIENCE_LEVELS.map(l => (
                    <button key={l} type="button" onClick={() => set('experienceLevel', l)} className={selBtnCls(form.experienceLevel === l)}>{l}</button>
                  ))}
                </div>
                {errors.experienceLevel && <p className="text-teal-400 text-xs mt-2">{errors.experienceLevel}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-3">Preferred Training</label>
                <div className="flex gap-2">
                  {TRAINING_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => set('preferredTraining', t)} className={selBtnCls(form.preferredTraining === t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-3">Preferred Workout Time</label>
                <div className="flex flex-wrap gap-2">
                  {WORKOUT_TIMES.map(t => (
                    <button key={t} type="button" onClick={() => set('preferredWorkoutTime', t)} className={selBtnCls(form.preferredWorkoutTime === t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#4A514D] mb-2">Height (cm)</label>
                  <input id="reg-height" type="number" value={form.height} onChange={e => set('height', e.target.value)} placeholder="e.g. 175" className={inputCls('height')} />
                </div>
                <div>
                  <label className="block text-sm text-[#4A514D] mb-2">Weight (kg)</label>
                  <input id="reg-weight" type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="e.g. 70" className={inputCls('weight')} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Emergency Contact */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-[#202522] mb-1">Emergency Contact</h2>
              <p className="text-[#4A514D] text-sm">In case of an emergency, we'll reach out to this person.</p>
              <div>
                <label className="block text-sm text-[#4A514D] mb-2">Full Name *</label>
                <input id="reg-emergencyName" value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} placeholder="Emergency contact's name" className={inputCls('emergencyName')} />
                {errors.emergencyName && <p className="text-teal-400 text-xs mt-1">{errors.emergencyName}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-3">Relationship *</label>
                <div className="flex flex-wrap gap-2">
                  {RELATIONSHIPS.map(r => (
                    <button key={r} type="button" onClick={() => set('emergencyRelationship', r)} className={selBtnCls(form.emergencyRelationship === r)}>{r}</button>
                  ))}
                </div>
                {errors.emergencyRelationship && <p className="text-teal-400 text-xs mt-2">{errors.emergencyRelationship}</p>}
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] mb-2">Mobile Number *</label>
                <input id="reg-emergencyMobile" type="tel" maxLength={10} value={form.emergencyMobile} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if(v.length <= 10) set('emergencyMobile', v); }} placeholder="10-digit number" className={inputCls('emergencyMobile')} />
                {errors.emergencyMobile && <p className="text-teal-400 text-xs mt-1">{errors.emergencyMobile}</p>}
              </div>
            </div>
          )}

          {/* STEP 4 — Terms */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-[#202522] mb-1">Terms & Conditions</h2>
              <p className="text-[#4A514D] text-sm">Please read and accept the following before creating your account.</p>
              <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl p-4 text-sm text-[#4A514D] max-h-40 overflow-y-auto leading-relaxed">
                <strong className="text-[#202522] block mb-2">Terms & Conditions</strong>
                By creating an account on AI GYM, you agree to use the platform in compliance with all applicable laws. Your personal data will be used to provide fitness coaching and gym management services. AI-generated plans are for guidance only and not a substitute for professional medical advice. Subscriptions are billed according to your chosen plan. You may cancel at any time.
              </div>
              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <button type="button" onClick={() => set('acceptTerms', !form.acceptTerms)} className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${form.acceptTerms ? 'bg-[#34483F] border-[#34483F]' : 'border-[#555]'}`}>
                    {form.acceptTerms && <Check size={12} className="text-black" />}
                  </button>
                  <span className="text-sm text-[#4A514D]">I accept the <span className="text-[#34483F]">Terms & Conditions</span></span>
                </label>
                {errors.acceptTerms && <p className="text-teal-400 text-xs ml-8">{errors.acceptTerms}</p>}
                <label className="flex items-start space-x-3 cursor-pointer">
                  <button type="button" onClick={() => set('acceptPrivacy', !form.acceptPrivacy)} className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${form.acceptPrivacy ? 'bg-[#34483F] border-[#34483F]' : 'border-[#555]'}`}>
                    {form.acceptPrivacy && <Check size={12} className="text-black" />}
                  </button>
                  <span className="text-sm text-[#4A514D]">I accept the <span className="text-[#34483F]">Privacy Policy</span></span>
                </label>
                {errors.acceptPrivacy && <p className="text-teal-400 text-xs ml-8">{errors.acceptPrivacy}</p>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#DCD9CD]">
            {step > 0 ? (
              <button type="button" onClick={prev} className="flex items-center space-x-2 px-5 py-2.5 bg-[#FFFFFF] border border-[#DCD9CD] text-[#202522] rounded-xl hover:bg-[#202020] transition-colors text-sm">
                <ChevronLeft size={18} /><span>Back</span>
              </button>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 px-5 py-2.5 bg-[#FFFFFF] border border-[#DCD9CD] text-[#202522] rounded-xl hover:bg-[#202020] transition-colors text-sm">
                <span>Back to Login</span>
              </Link>
            )}

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="flex items-center space-x-2 px-6 py-2.5 bg-[#34483F] text-[#202522] font-bold rounded-xl hover:bg-[#C6A77D] transition-colors text-sm">
                <span>Next</span><ChevronRight size={18} />
              </button>
            ) : (
              <button id="reg-submit" type="submit" disabled={isLoading} className="flex items-center space-x-2 px-6 py-2.5 bg-[#34483F] text-[#202522] font-bold rounded-xl hover:bg-[#C6A77D] disabled:opacity-60 transition-colors text-sm">
                {isLoading ? <><Loader2 size={18} className="animate-spin" /><span>Creating Account...</span></> : <><span>Create Account</span><Check size={18} /></>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
