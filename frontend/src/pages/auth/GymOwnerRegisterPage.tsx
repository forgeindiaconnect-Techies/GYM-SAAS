import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, Loader2, ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

import Step1BasicInfo from '../../components/GymRegisterSteps/Step1BasicInfo';
import Step2Equipment from '../../components/GymRegisterSteps/Step2Equipment';
import Step3ACDetails from '../../components/GymRegisterSteps/Step3ACDetails';
import Step4Facilities from '../../components/GymRegisterSteps/Step4Facilities';
import Step5GymImages from '../../components/GymRegisterSteps/Step5GymImages';
import Step5Pricing from '../../components/GymRegisterSteps/Step5Pricing';
import Step7Documents from '../../components/GymRegisterSteps/Step7Documents';
import Step8Review from '../../components/GymRegisterSteps/Step8Review';

const STEPS = ['Basic Info', 'Equipment', 'AC Details', 'Facilities', 'Gym Images', 'Pricing', 'Verification', 'Review'];

const initialForm = {
  firstName: '', lastName: '', email: '', mobile: '', password: '', confirmPassword: '',
  emailOtpVerified: false,
  gymName: '', gymEmail: '', gymContactNumber: '', address: '', city: '', state: '', pinCode: '',
  gymType: '', approxMembers: '', numTrainers: '', operatingHours: '',
  trainingMode: '',
  services: [] as string[],
  equipment: [] as any[],
  acDetails: { type: '', areas: [] },
  facilities: [] as string[],
  images: [] as string[],
  subscriptionPlans: [] as any[],
  offers: [] as any[],
  rating: '', logo: '',
  acceptTerms: false, acceptPrivacy: false,
};

const GymOwnerRegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const set = (field: string, value: any) => {
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
      if (!form.mobile.trim()) e.mobile = 'Mobile is required';
      else if (!/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
      if (!form.emailOtpVerified) e.emailOtp = 'Please verify your email address with the OTP';
      
      if (!form.gymName.trim()) e.gymName = 'Gym name is required';
      if (!form.gymContactNumber.trim()) e.gymContactNumber = 'Gym contact number is required';
      if (!form.address.trim()) e.address = 'Address is required';
      if (!form.city.trim()) e.city = 'City is required';
      if (!form.state.trim()) e.state = 'State is required';

      if (!form.gymType) e.gymType = 'Gym type is required';
      if (!form.approxMembers) e.approxMembers = 'Approximate members is required';
      if (!form.numTrainers) e.numTrainers = 'Number of trainers is required';
      if (!form.operatingHours) e.operatingHours = 'Operating hours is required';
      if (!form.trainingMode) e.trainingMode = 'Training mode is required';
      if (!form.services || form.services.length === 0) e.services = 'Please select at least one service';
      if (!form.rating) e.rating = 'Rating is required';
    }
    if (step === 1) {
      // Equipment is optional, but if they leave it empty we could show a warning. We won't block them.
    }
    if (step === 2) {
      if (!form.acDetails.type) e['acDetails.type'] = 'AC Type is required';
      if (form.acDetails.type && form.acDetails.type !== 'Fully AC' && form.acDetails.type !== 'Non-AC' && form.acDetails.areas.length === 0) {
        e['acDetails.areas'] = 'Please select at least one AC area';
      }
    }
    if (step === 3) {
      if (form.facilities.length === 0) e.facilities = 'Please select at least one facility';
    }
    if (step === 4) {
      // Images are optional
    }
    if (step === 5) {
      if (form.subscriptionPlans.length === 0) e.subscriptionPlans = 'Please add at least one subscription plan';
    }
    if (step === 6) {
      if (!form.acceptTerms) e.acceptTerms = 'You must accept the Terms & Conditions';
      if (!form.acceptPrivacy) e.acceptPrivacy = 'You must accept the Privacy Policy';
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep()) {
      setStep(s => s + 1);
    }
  };
  
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setApiError('');
    setIsLoading(true);
    try {
      await api.post('/auth/register-gym-owner', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        gymName: form.gymName,
        gymEmail: form.gymEmail || form.email,
        gymContactNumber: form.gymContactNumber || form.mobile,
        address: form.address,
        city: form.city,
        state: form.state,
        pinCode: form.pinCode || undefined,
        gymType: form.gymType,
        approxMembers: form.approxMembers ? Number(form.approxMembers) : undefined,
        numTrainers: form.numTrainers ? Number(form.numTrainers) : undefined,
        operatingHours: form.operatingHours || undefined,
        trainingMode: form.trainingMode,
        services: form.services,
        subscriptionPlans: form.subscriptionPlans,
        equipment: form.equipment,
        acDetails: form.acDetails,
        facilities: form.facilities,
        offers: form.offers,
        rating: form.rating ? Number(form.rating) : undefined,
        logo: form.logo || undefined,
        images: form.images,
      });
      alert('Registration successful!');
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

      <Link to="/" className="absolute top-8 left-8 text-[#4A514D] hover:text-[#34483F] flex items-center gap-2 transition-colors z-10">
        <ArrowLeft size={20} />
        <span className="font-medium text-sm">Back to Home</span>
      </Link>

      <Link to="/" className="flex items-center space-x-2 mb-8 group z-10">
        <div className="w-9 h-9 bg-[#34483F] rounded-md flex items-center justify-center">
          <Activity className="text-black" size={22} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#34483F]">AI GYM</span>
      </Link>

      <div className="w-full max-w-3xl bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header and Progress Indicator */}
        <div className="bg-[#FFFFFF] border-b border-[#DCD9CD] px-8 py-5 flex items-center justify-between shrink-0 overflow-x-auto custom-scrollbar">
          <h1 className="text-xl font-bold text-[#202522] shrink-0 mr-8 whitespace-nowrap">Gym Owner Registration</h1>
          <div className="flex items-center space-x-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center space-x-2 shrink-0" title={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-[#34483F] text-white' : i === step ? 'bg-[#34483F] text-white ring-2 ring-[#EF4444]/30 ring-offset-1 ring-offset-[#FFFFFF]' : 'bg-[#E8E5DA] text-[#555]'}`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block whitespace-nowrap ${i === step ? 'text-[#202522] font-medium' : 'text-[#555]'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px w-6 sm:w-8 ${i < step ? 'bg-[#34483F]' : 'bg-[#E8E5DA]'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto p-8 custom-scrollbar">

          {step === 0 && <Step1BasicInfo form={form} set={set} errors={errors} inputCls={inputCls} selBtnCls={selBtnCls} />}
          {step === 1 && <Step2Equipment form={form} set={set} errors={errors} inputCls={inputCls} selBtnCls={selBtnCls} />}
          {step === 2 && <Step3ACDetails form={form} set={set} errors={errors} selBtnCls={selBtnCls} />}
          {step === 3 && <Step4Facilities form={form} set={set} errors={errors} />}
          {step === 4 && <Step5GymImages form={form} set={set} errors={errors} />}
          {step === 5 && <Step5Pricing form={form} set={set} errors={errors} inputCls={inputCls} />}
          {step === 6 && <Step7Documents form={form} set={set} errors={errors} />}
          {step === 7 && <Step8Review form={form} setStep={setStep} />}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#DCD9CD] p-6 bg-[#FFFFFF] shrink-0 flex flex-col">
          {apiError && (
            <div className="flex items-center space-x-3 bg-[#8FA89B]/10 border border-[#8FA89B]/30 text-teal-400 rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle size={18} className="shrink-0" /><span>{apiError}</span>
            </div>
          )}
          <div className="flex justify-between items-center w-full">
            <button type="button" onClick={step === 0 ? () => navigate('/login') : prev} className="px-6 py-3 rounded-xl border border-[#DCD9CD] text-[#4A514D] hover:text-[#202522] hover:border-[#555] transition-colors flex items-center space-x-2">
              {step === 0 ? <span>Back to Login</span> : <><ChevronLeft size={18} /><span>Back</span></>}
            </button>
            
            <button 
              type="button" 
              onClick={step === STEPS.length - 1 ? handleSubmit : next}
              disabled={isLoading}
              className="px-8 py-3 bg-[#34483F] text-[#202522] font-semibold rounded-xl hover:bg-[#C6A77D] transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" /><span>Processing...</span></>
              ) : step === STEPS.length - 1 ? (
                <><Check size={18} /><span>Submit Registration</span></>
              ) : (
                <span>Next</span>
              )}
              {step !== STEPS.length - 1 && !isLoading && <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymOwnerRegisterPage;
