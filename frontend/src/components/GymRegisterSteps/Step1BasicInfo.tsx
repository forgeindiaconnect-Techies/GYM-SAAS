import React, { useState } from 'react';
import { Eye, EyeOff, Check, AlertCircle, Lock, Loader2 } from 'lucide-react';
import api from '../../utils/api';

interface Step1Props {
  form: any;
  set: (field: string, value: any) => void;
  errors: Record<string, string>;
  inputCls: (field: string) => string;
  selBtnCls: (active: boolean) => string;
}

const GYM_TYPES = ['Commercial', 'Boutique', 'CrossFit', 'Yoga Studio', 'Martial Arts', 'Other'];
const OPERATING_HOURS = ['24/7', '6 AM - 10 PM', '5 AM - 11 PM', 'Custom'];

const Step1BasicInfo: React.FC<Step1Props> = ({ form, set, errors, inputCls, selBtnCls }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [mobileBlockedNotice, setMobileBlockedNotice] = useState(false);

  const handleSendOtp = async () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setOtpError('Please enter a valid email first');
      return;
    }
    setSendingOtp(true);
    setOtpError('');
    try {
      const res = await api.post('/auth/send-otp', { email: form.email });
      if (res.data.success) {
        setOtpSent(true);
        alert(`Verification code (OTP) sent to ${form.email}. Please check your inbox or spam folder!`);
      } else {
        setOtpError(res.data.message || 'Failed to send OTP email.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send OTP email. Please try again.';
      setOtpError(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!enteredOtp || enteredOtp.length !== 6) {
      setOtpError('Please enter the 6-digit OTP code');
      return;
    }
    setVerifyingOtp(true);
    setOtpError('');
    try {
      const res = await api.post('/auth/verify-otp', { email: form.email, otp: enteredOtp });
      if (res.data.success) {
        set('emailOtpVerified', true);
        setOtpError('');
        setMobileBlockedNotice(false);
        alert('Email verified successfully! You can now enter your mobile number.');
      } else {
        setOtpError(res.data.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setOtpError(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleMobileClick = (e?: React.MouseEvent | React.FocusEvent) => {
    if (!form.emailOtpVerified) {
      if (e) {
        e.preventDefault();
      }
      setMobileBlockedNotice(true);
      alert('Please enter and verify your email ID first!');
      if (!otpSent) {
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        if (emailInput) emailInput.focus();
      } else {
        const otpInput = document.querySelector('input[placeholder="Enter 6-digit OTP"]') as HTMLInputElement;
        if (otpInput) otpInput.focus();
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Owner Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#111827] border-b border-[#E2E8F0] pb-2">Owner Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">First Name *</label>
            <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" className={inputCls('firstName')} />
            {errors.firstName && <p className="text-[#B91C1C] text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">Last Name *</label>
            <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" className={inputCls('lastName')} />
            {errors.lastName && <p className="text-[#B91C1C] text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-2">Email Address *</label>
          <div className="flex gap-2">
            <input type="email" value={form.email} onChange={e => {
              set('email', e.target.value);
              if (form.emailOtpVerified) set('emailOtpVerified', false);
            }} placeholder="owner@gym.com" className={inputCls('email') + ' flex-1'} disabled={form.emailOtpVerified} />
            
            {!form.emailOtpVerified && (
              <button 
                type="button" 
                onClick={handleSendOtp} 
                disabled={sendingOtp} 
                className="px-5 py-2.5 bg-[#C2410C] text-white text-sm font-bold rounded-xl hover:bg-[#9A3412] transition-all whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {sendingOtp && <Loader2 size={14} className="animate-spin" />}
                {sendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            )}
            {form.emailOtpVerified && (
              <span className="px-4 py-2 bg-emerald-500/15 text-[#15803D] text-sm font-bold rounded-xl border border-emerald-500/30 flex items-center gap-1 whitespace-nowrap shadow-xs">
                <Check size={16} /> Verified
              </span>
            )}
          </div>
          {errors.email && <p className="text-[#B91C1C] text-xs mt-1">{errors.email}</p>}
          {errors.emailOtp && <p className="text-[#B91C1C] text-xs mt-1">{errors.emailOtp}</p>}
          
          {otpSent && !form.emailOtpVerified && (
            <div className="mt-3 flex gap-2">
              <input 
                type="text" 
                maxLength={6} 
                value={enteredOtp} 
                onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP" 
                className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-sm text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#F97316] flex-1 shadow-xs"
              />
              <button 
                type="button" 
                onClick={handleVerifyOtp} 
                disabled={verifyingOtp} 
                className="px-5 py-2.5 bg-[#C2410C] text-white font-bold text-sm rounded-xl hover:bg-[#9A3412] transition-colors whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {verifyingOtp && <Loader2 size={14} className="animate-spin" />}
                {verifyingOtp ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          )}
          {otpError && <p className="text-[#B91C1C] text-xs mt-1 font-medium">{otpError}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-[#111827]">Mobile Number *</label>
            {!form.emailOtpVerified ? (
              <span className="text-xs text-[#B45309] font-semibold flex items-center gap-1">
                <Lock size={12} /> Verify email first to enter mobile
              </span>
            ) : (
              <span className="text-xs text-[#15803D] font-semibold flex items-center gap-1">
                <Check size={12} /> Email verified
              </span>
            )}
          </div>
          <div 
            onClick={() => {
              if (!form.emailOtpVerified) {
                handleMobileClick();
              }
            }}
            className={!form.emailOtpVerified ? 'cursor-not-allowed' : ''}
          >
            <input 
              maxLength={10} 
              value={form.mobile} 
              onChange={e => {
                if (!form.emailOtpVerified) {
                  handleMobileClick();
                  return;
                }
                set('mobile', e.target.value.replace(/\D/g, ''));
              }} 
              onClick={(e) => {
                if (!form.emailOtpVerified) {
                  e.stopPropagation();
                  handleMobileClick(e);
                }
              }}
              onFocus={(e) => {
                if (!form.emailOtpVerified) {
                  e.target.blur();
                  handleMobileClick(e);
                }
              }}
              readOnly={!form.emailOtpVerified}
              placeholder={form.emailOtpVerified ? "10-digit number" : "Please verify email first to enter mobile"} 
              className={inputCls('mobile') + (!form.emailOtpVerified ? ' !bg-[#F8FAFC] !text-[#64748B] !border-[#E2E8F0] cursor-not-allowed select-none' : '')} 
            />
          </div>
          {mobileBlockedNotice && !form.emailOtpVerified && (
            <p className="text-[#B45309] text-xs mt-1.5 flex items-center gap-1 font-semibold">
              <AlertCircle size={13} /> Please enter and verify your email ID first before entering mobile number.
            </p>
          )}
          {errors.mobile && <p className="text-[#B91C1C] text-xs mt-1">{errors.mobile}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">Password *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 chars" className={inputCls('password') + ' pr-10'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#EA580C] transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-[#B91C1C] text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">Confirm Password *</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" className={inputCls('confirmPassword') + ' pr-10'} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#EA580C] transition-colors">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-[#B91C1C] text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>

      {/* Gym Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#111827] border-b border-[#E2E8F0] pb-2">Gym Information</h2>
        <div>
          <label className="block text-sm font-semibold text-[#334155] mb-2">Gym Name *</label>
          <input value={form.gymName} onChange={e => set('gymName', e.target.value)} placeholder="AI Fitness Center" className={inputCls('gymName')} />
          {errors.gymName && <p className="text-red-500 text-xs mt-1">{errors.gymName}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2">Gym Email</label>
            <input type="email" value={form.gymEmail} onChange={e => set('gymEmail', e.target.value)} placeholder="Optional" className={inputCls('gymEmail')} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2">Gym Contact Number *</label>
            <input maxLength={10} value={form.gymContactNumber} onChange={e => set('gymContactNumber', e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" className={inputCls('gymContactNumber')} />
            {errors.gymContactNumber && <p className="text-red-500 text-xs mt-1">{errors.gymContactNumber}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#334155] mb-2">Address *</label>
          <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" className={inputCls('address')} />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2">City *</label>
            <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" className={inputCls('city')} />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2">State *</label>
            <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="State" className={inputCls('state')} />
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#334155] mb-2">PIN Code</label>
            <input maxLength={6} inputMode="numeric" value={form.pinCode} onChange={e => set('pinCode', e.target.value.replace(/\D/g, ''))} placeholder="PIN" className={inputCls('pinCode')} />
          </div>
        </div>
      </div>

      {/* Operational Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#111827] border-b border-[#E2E8F0] pb-2">Operational Details</h2>
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-2">Gym Type *</label>
          <div className="flex flex-wrap gap-2">
            {GYM_TYPES.map(t => (
              <button key={t} type="button" onClick={() => set('gymType', t)} className={selBtnCls(form.gymType === t)}>{t}</button>
            ))}
          </div>
          {errors.gymType && <p className="text-[#B91C1C] text-xs mt-1">{errors.gymType}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">Approx. Members *</label>
            <input type="number" value={form.approxMembers} onChange={e => set('approxMembers', e.target.value)} placeholder="e.g. 100" className={inputCls('approxMembers')} />
            {errors.approxMembers && <p className="text-[#B91C1C] text-xs mt-1">{errors.approxMembers}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#111827] mb-2">Number of Trainers *</label>
            <input type="number" value={form.numTrainers} onChange={e => set('numTrainers', e.target.value)} placeholder="e.g. 5" className={inputCls('numTrainers')} />
            {errors.numTrainers && <p className="text-[#B91C1C] text-xs mt-1">{errors.numTrainers}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-2">Operating Hours *</label>
          <div className="flex flex-wrap gap-2">
            {OPERATING_HOURS.map(h => (
              <button key={h} type="button" onClick={() => set('operatingHours', h)} className={selBtnCls(form.operatingHours === h)}>{h}</button>
            ))}
          </div>
          {errors.operatingHours && <p className="text-[#B91C1C] text-xs mt-1">{errors.operatingHours}</p>}
        </div>

        {/* Training Mode */}
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-1">Training Mode *</label>
          <p className="text-xs text-[#64748B] mb-2">Select how your gym provides trainer-led fitness services.</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'offline', label: '🏋️ Offline Training' },
              { value: 'online', label: '💻 Online Training' },
              { value: 'both', label: '⚡ Both Online & Offline' },
            ].map(mode => (
              <button
                key={mode.value}
                type="button"
                onClick={() => set('trainingMode', mode.value)}
                className={selBtnCls(form.trainingMode === mode.value)}
              >
                {mode.label}
              </button>
            ))}
          </div>
          {errors.trainingMode && <p className="text-[#B91C1C] text-xs mt-1">{errors.trainingMode}</p>}
        </div>

        {/* Services Offered */}
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-2">Services Offered *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 p-3 sm:p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC]">
            {(form.trainingMode === 'online' 
              ? [
                  'AI Fitness Coaching', '1-on-1 Virtual Training', 'Live Online Classes', 
                  'On-Demand Workouts', 'Diet & Nutrition Guidance', 'Online Fitness Challenges', 
                  'Virtual Yoga & Meditation', 'Progress Analytics'
                ]
              : form.trainingMode === 'offline'
              ? [
                  'Personal Training', 'Group Classes', 
                  'Diet Guidance', 'CrossFit & HIIT', 'Yoga & Pilates', 
                  'Physiotherapy', 'Strength & Conditioning'
                ]
              : [
                  '1-on-1 Virtual Training', 'Personal Training', 
                  'Live Online Classes', 'Group Classes', 'AI Fitness Coaching', 
                  'Diet & Nutrition Guidance', 'On-Demand Workouts', 'CrossFit & HIIT',
                  'Yoga & Pilates', 'Physiotherapy', 'Strength & Conditioning'
                ]
            ).map(service => (
              <label key={service} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(form.services || []).includes(service)}
                  onChange={(e) => {
                    const current = form.services || [];
                    if (e.target.checked) set('services', [...current, service]);
                    else set('services', current.filter((s: string) => s !== service));
                  }}
                  className="rounded text-[#EA580C] focus:ring-[#F97316] border-[#E2E8F0] bg-[#FFFFFF]"
                />
                <span className="text-sm font-medium text-[#111827]">{service}</span>
              </label>
            ))}
          </div>
          {errors.services && <p className="text-[#B91C1C] text-xs mt-1">{errors.services}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-2">Rating *</label>
          <input type="text" inputMode="decimal" value={form.rating || ''} onChange={e => {
            const v = e.target.value.replace(/[^0-9.]/g, '');
            const parts = v.split('.');
            let cleaned = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
            if (parseFloat(cleaned) > 5) cleaned = '5';
            set('rating', cleaned);
          }} placeholder="e.g. 4.8 (Max 5.0)" className={inputCls('rating')} maxLength={4} />
          {errors.rating && <p className="text-[#B91C1C] text-xs mt-1">{errors.rating}</p>}
        </div>

        {/* Gym Description Form */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-[#111827]">Gym Description (Optional)</label>
            {form.description && (
              <button
                type="button"
                onClick={() => set('description', '')}
                className="text-xs text-[#EA580C] hover:underline font-bold"
              >
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-[#64748B] mb-2">
            Click quick template buttons or enter your custom gym description:
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              {
                label: '🏋️ Strength & Bodybuilding',
                text: 'Premier strength and bodybuilding gym equipped with heavy free weights, certified personal trainers, and modern power racks for serious athletes.'
              },
              {
                label: '⚡ CrossFit & Functional',
                text: 'High-energy functional fitness and CrossFit center featuring turf tracks, kettlebells, rowing stations, and dynamic group workout sessions.'
              },
              {
                label: '🧘 Yoga & Wellness',
                text: 'Peaceful fitness and wellness sanctuary offering guided yoga, pilates, mobility work, and holistic lifestyle coaching in a serene environment.'
              },
              {
                label: '🌟 Modern All-Round Gym',
                text: 'State-of-the-art commercial fitness facility providing world-class cardio machines, strength equipment, group fitness classes, and certified trainers.'
              }
            ].map(tpl => (
              <button
                key={tpl.label}
                type="button"
                onClick={() => set('description', tpl.text)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  form.description === tpl.text
                    ? 'bg-[#C2410C] text-white border-[#FDBA74] shadow-xs'
                    : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#111827] hover:border-[#FDBA74] hover:text-[#111827]'
                }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
          <textarea
            rows={3}
            value={form.description || ''}
            onChange={e => set('description', e.target.value)}
            placeholder="Tell prospective members about your gym atmosphere, specialty equipment, trainer expertise, and facilities..."
            className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-sm text-[#111827] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all shadow-xs"
          />
          {errors.description && <p className="text-[#B91C1C] text-xs mt-1">{errors.description}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#111827] mb-2">Gym Photo/Logo (Optional)</label>
          <div className="flex items-center gap-4">
            {form.logo && (
              <img src={form.logo} alt="Gym Logo" className="w-16 h-16 rounded-xl object-cover border border-[#E2E8F0] shadow-xs" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => set('logo', reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="text-sm text-[#64748B] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#C2410C] file:text-[#FFFFFF] hover:file:bg-[#9A3412] transition-colors cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
