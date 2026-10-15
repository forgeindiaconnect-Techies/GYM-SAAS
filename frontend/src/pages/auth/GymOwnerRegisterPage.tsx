import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Activity, AlertCircle, Loader2, ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, Mail, AlertTriangle, ShieldAlert } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

import Step1BasicInfo from '../../components/GymRegisterSteps/Step1BasicInfo';
import Step3ACDetails from '../../components/GymRegisterSteps/Step3ACDetails';
import Step4Facilities from '../../components/GymRegisterSteps/Step4Facilities';
import Step5GymImages from '../../components/GymRegisterSteps/Step5GymImages';
import Step5Pricing from '../../components/GymRegisterSteps/Step5Pricing';
import Step7Documents from '../../components/GymRegisterSteps/Step7Documents';
import Step8Review from '../../components/GymRegisterSteps/Step8Review';

const STEPS = ['Basic Info', 'AC Details', 'Facilities', 'Gym Images', 'Pricing', 'Verification', 'Review'];

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
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Link expiration & 1-hour warning state
  const [isLinkExpired, setIsLinkExpired] = useState(false);
  const [expiryWarning, setExpiryWarning] = useState<string | null>(null);
  const [remainingTimeText, setRemainingTimeText] = useState<string>('');
  const [expiryDurationText, setExpiryDurationText] = useState<string>('7 Days');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const nameParam = searchParams.get('name');
    const phoneParam = searchParams.get('phone');
    const expiresAtParam = searchParams.get('expiresAt');
    const expiryParam = searchParams.get('expiry');
    const inviteParam = searchParams.get('invite');

    if (expiryParam) {
      setExpiryDurationText(decodeURIComponent(expiryParam));
    }

    // Check link expiration
    const checkExpiration = async () => {
      let targetTime = 0;
      let durationStr = expiryParam || '7 Days';

      if (expiresAtParam) {
        targetTime = parseInt(expiresAtParam, 10);
      }

      try {
        const { getDb } = await import('../../utils/mockDb');
        const allInvites = getDb('gymInvitations') || [];
        const cleanEmail = (emailParam || '').toLowerCase().trim();
        const inv = (inviteParam ? allInvites.find((i: any) => String(i.id) === String(inviteParam)) : null)
          || (cleanEmail ? allInvites.find((i: any) => (i.email || '').toLowerCase().trim() === cleanEmail) : null);

        if (inv) {
          durationStr = inv.expiry || durationStr;
          setExpiryDurationText(durationStr);

          if ((inv.status || '').toLowerCase() === 'expired') {
            setIsLinkExpired(true);
            return;
          }

          if (inv.expiresAt) {
            targetTime = new Date(inv.expiresAt).getTime();
          } else if (inv.date || inv.createdAt) {
            const match = (inv.expiry || '7 Days').match(/(\d+)/);
            const days = match ? parseInt(match[1], 10) : 7;
            targetTime = new Date(inv.createdAt || inv.date).getTime() + days * 24 * 60 * 60 * 1000;
          }
        }
      } catch (err) {
        console.warn('Could not inspect invitations db:', err);
      }

      if (targetTime && !isNaN(targetTime)) {
        const now = Date.now();
        const diff = targetTime - now;

        if (diff <= 0) {
          setIsLinkExpired(true);
          return;
        }

        // Within 1 hour before expiry
        if (diff <= 60 * 60 * 1000) {
          const mins = Math.max(0, Math.floor(diff / 60000));
          const secs = Math.floor((diff % 60000) / 1000);
          setExpiryWarning(`Your registration link will expire soon! You have less than 1 hour remaining (${mins}m ${secs}s left) to complete your gym registration.`);
          setRemainingTimeText(`${mins}m ${secs}s`);
        }
      }
    };

    checkExpiration();

    if (emailParam || nameParam || phoneParam) {
      setForm(prev => {
        let fName = prev.firstName;
        let lName = prev.lastName;
        if (nameParam) {
          const parts = decodeURIComponent(nameParam).trim().split(' ');
          fName = parts[0] || '';
          lName = parts.slice(1).join(' ') || '';
        }
        return {
          ...prev,
          email: emailParam ? decodeURIComponent(emailParam).trim() : prev.email,
          firstName: fName,
          lastName: lName,
          mobile: phoneParam ? decodeURIComponent(phoneParam).trim() : prev.mobile,
        };
      });
    }
  }, [searchParams]);

  // Live countdown timer for 1-hour warning
  useEffect(() => {
    if (!expiryWarning) return;
    const interval = setInterval(() => {
      const expiresAtParam = searchParams.get('expiresAt');
      if (expiresAtParam) {
        const targetTime = parseInt(expiresAtParam, 10);
        const diff = targetTime - Date.now();
        if (diff <= 0) {
          setIsLinkExpired(true);
          setExpiryWarning(null);
        } else if (diff <= 60 * 60 * 1000) {
          const mins = Math.max(0, Math.floor(diff / 60000));
          const secs = Math.floor((diff % 60000) / 1000);
          setRemainingTimeText(`${mins}m ${secs}s`);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryWarning, searchParams]);

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
      if (!form.acDetails.type) e['acDetails.type'] = 'AC Type is required';
      if (form.acDetails.type && form.acDetails.type !== 'Fully AC' && form.acDetails.type !== 'Non-AC' && form.acDetails.areas.length === 0) {
        e['acDetails.areas'] = 'Please select at least one AC area';
      }
    }
    if (step === 2) {
      if (form.facilities.length === 0) e.facilities = 'Please select at least one facility';
    }
    if (step === 3) {
      // Images are optional
    }
    if (step === 4) {
      if (form.subscriptionPlans.length === 0) e.subscriptionPlans = 'Please add at least one package plan';
    }
    if (step === 5) {
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
      const res = await api.post('/auth/register-gym-owner', {
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

      // Synchronize with mockDb gymInvitations
      try {
        const { getDb, updateItem, addItem } = await import('../../utils/mockDb');
        const invites = getDb('gymInvitations');
        const cleanEmail = form.email.toLowerCase().trim();
        const existing = invites.find((i: any) => (i.email || '').toLowerCase().trim() === cleanEmail);
        const ownerFullName = `${form.firstName} ${form.lastName}`.trim() || 'Gym Owner';
        if (existing) {
          updateItem('gymInvitations', existing.id, {
            gymName: form.gymName,
            type: form.gymType || existing.type || 'Commercial',
            owner: ownerFullName || existing.owner,
            phone: form.mobile || existing.phone,
            status: 'Accepted'
          });
        } else {
          addItem('gymInvitations', {
            gymName: form.gymName,
            type: form.gymType || 'Commercial',
            owner: ownerFullName,
            email: form.email,
            phone: form.mobile,
            date: new Date().toISOString().split('T')[0],
            status: 'Accepted',
            expiry: '30 Days',
            link: `${window.location.origin}/register/gym-owner?email=${encodeURIComponent(form.email)}`
          });
        }
      } catch (mockErr) {
        console.warn('Could not update gymInvitations:', mockErr);
      }

      alert('Registration successful! Please choose a platform subscription plan to get started.');
      if (res.data?.token && res.data?.user) {
        await login(res.data.user, res.data.token, false);
        navigate('/subscription-plans', { replace: true });
      } else {
        navigate('/subscription-plans', { replace: true });
      }
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full bg-[#FFFFFF] border ${errors[field] ? 'border-[#FED7AA]' : 'border-[#E7E5E4]'} text-[#292524] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F97316] transition-colors placeholder-[#555]`;

  const selBtnCls = (active: boolean) =>
    `px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer ${active ? 'bg-[#F97316] text-white border-[#F97316] font-semibold' : 'bg-[#FFFFFF] border-[#E7E5E4] text-[#78716C] hover:border-[#F97316]/50'}`;

  if (isLinkExpired) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.06)_0%,_transparent_60%)] pointer-events-none" />

        <Link to="/" className="absolute top-8 left-8 text-[#78716C] hover:text-[#F97316] flex items-center gap-2 transition-colors z-10">
          <ArrowLeft size={20} />
          <span className="font-medium text-sm">Back to Home</span>
        </Link>

        <div className="w-full max-w-lg bg-white border border-rose-200/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-rose-500/10 text-center relative z-10">
          <div className="w-20 h-20 bg-rose-50 border border-rose-200 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-600 shadow-inner">
            <Clock size={40} className="stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-rose-100/80 text-rose-800 text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-rose-200 mb-3">
            <ShieldAlert size={13} />
            <span>Link Validity Expired</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524] tracking-tight">
            This Invitation Link Has Expired
          </h1>

          <p className="text-sm text-[#78716C] mt-2 mb-6 leading-relaxed">
            The {expiryDurationText} onboarding validity period for this gym registration link has elapsed.
            For platform security and data integrity, expired invitation links can no longer be accessed.
          </p>

          <div className="bg-[#FFFDF8] border border-stone-200 rounded-2xl p-4 text-left mb-6 text-xs text-stone-600 space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <span className="font-semibold text-stone-500">Target Recipient:</span>
              <strong className="text-stone-800 font-mono text-[11px]">{form.email || searchParams.get('email') || 'Gym Partner'}</strong>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <span className="font-semibold text-stone-500">Validity Limit:</span>
              <span className="font-bold text-stone-800">{expiryDurationText}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-stone-500">Status:</span>
              <span className="font-extrabold text-rose-600 uppercase tracking-wide">Expired Link (Access Denied)</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`mailto:support@aigym.com?subject=Renew%20Gym%20Invitation%20Link&body=Hello,%20my%20invitation%20link%20has%20expired%20for%20${encodeURIComponent(form.email || searchParams.get('email') || '')}.%20Please%20resend%20a%20new%20link.`}
              className="w-full py-3.5 px-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <Mail size={16} />
              <span>Request New Invitation from Super Admin</span>
            </a>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors text-center"
              >
                Go to Login
              </Link>
              <Link
                to="/"
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,255,0,0.04)_0%,_transparent_60%)] pointer-events-none" />

      <Link to="/" className="absolute top-8 left-8 text-[#78716C] hover:text-[#F97316] flex items-center gap-2 transition-colors z-10">
        <ArrowLeft size={20} />
        <span className="font-medium text-sm">Back to Home</span>
      </Link>

      <Link to="/" className="flex items-center space-x-2 mb-8 group z-10">
        <div className="w-9 h-9 bg-[#F97316] rounded-md flex items-center justify-center">
          <Activity className="text-black" size={22} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#F97316]">AI GYM</span>
      </Link>

      <div className="w-full max-w-3xl bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* 1-Hour Expiry Warning Alert Banner */}
        {expiryWarning && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-6 py-3.5 shadow-md flex items-center justify-between gap-3 animate-pulse border-b border-amber-300 shrink-0">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-white shrink-0" />
              <div>
                <p className="font-black text-xs uppercase tracking-wide">
                  ⚠️ Alert: Your Invitation Link Will Expire Soon!
                </p>
                <p className="text-[11px] text-amber-100 mt-0.5">
                  Less than 1 hour remaining ({remainingTimeText} left). Please complete and submit your gym registration now.
                </p>
              </div>
            </div>
            <span className="bg-white/20 text-white font-mono font-black text-xs px-2.5 py-1 rounded-lg border border-white/30 shrink-0">
              ⏳ {remainingTimeText}
            </span>
          </div>
        )}

        {/* Header and Progress Indicator */}
        <div className="bg-[#FFFFFF] border-b border-[#E7E5E4] px-8 py-5 flex items-center justify-between shrink-0 overflow-x-auto custom-scrollbar">
          <h1 className="text-xl font-bold text-[#292524] shrink-0 mr-8 whitespace-nowrap">Gym Owner Registration</h1>
          <div className="flex items-center space-x-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center space-x-2 shrink-0" title={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-[#F97316] text-white' : i === step ? 'bg-[#F97316] text-white ring-2 ring-[#EF4444]/30 ring-offset-1 ring-offset-[#FFFFFF]' : 'bg-[#FED7AA] text-[#555]'}`}>
                  {i < step ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block whitespace-nowrap ${i === step ? 'text-[#292524] font-medium' : 'text-[#555]'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px w-6 sm:w-8 ${i < step ? 'bg-[#F97316]' : 'bg-[#FED7AA]'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto p-8 custom-scrollbar">

          {step === 0 && <Step1BasicInfo form={form} set={set} errors={errors} inputCls={inputCls} selBtnCls={selBtnCls} />}
          {step === 1 && <Step3ACDetails form={form} set={set} errors={errors} selBtnCls={selBtnCls} />}
          {step === 2 && <Step4Facilities form={form} set={set} errors={errors} />}
          {step === 3 && <Step5GymImages form={form} set={set} errors={errors} />}
          {step === 4 && <Step5Pricing form={form} set={set} errors={errors} inputCls={inputCls} />}
          {step === 5 && <Step7Documents form={form} set={set} errors={errors} />}
          {step === 6 && <Step8Review form={form} setStep={setStep} />}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#E7E5E4] p-6 bg-[#FFFFFF] shrink-0 flex flex-col">
          {apiError && (
            <div className="flex items-center space-x-3 bg-[#FED7AA]/10 border border-[#FED7AA]/30 text-teal-400 rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle size={18} className="shrink-0" /><span>{apiError}</span>
            </div>
          )}
          <div className="flex justify-between items-center w-full">
            <button type="button" onClick={step === 0 ? () => navigate('/login') : prev} className="px-6 py-3 rounded-xl border border-[#E7E5E4] text-[#78716C] hover:text-[#292524] hover:border-[#555] transition-colors flex items-center space-x-2">
              {step === 0 ? <span>Back to Login</span> : <><ChevronLeft size={18} /><span>Back</span></>}
            </button>
            
            <button 
              type="button" 
              onClick={step === STEPS.length - 1 ? handleSubmit : next}
              disabled={isLoading}
              className="px-8 py-3 bg-[#F97316] text-[#292524] font-semibold rounded-xl hover:bg-[#EA580C] transition-colors flex items-center space-x-2 disabled:opacity-50"
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
