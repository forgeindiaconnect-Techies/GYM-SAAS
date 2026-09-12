import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';

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
  const DEMO_OTP = '123456';

  const handleSendOtp = () => {
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      setOtpError('Please enter a valid email first');
      return;
    }
    setOtpSent(true);
    setOtpError('');
    // Demo OTP shown in alert
    alert(`Demo OTP generated: ${DEMO_OTP}`);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === DEMO_OTP) {
      set('emailOtpVerified', true);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Owner Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#1E293B] border-b border-[#CCFBF1] pb-2">Owner Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#475569] mb-2">First Name *</label>
            <input value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" className={inputCls('firstName')} />
            {errors.firstName && <p className="text-teal-400 text-xs mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm text-[#475569] mb-2">Last Name *</label>
            <input value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" className={inputCls('lastName')} />
            {errors.lastName && <p className="text-teal-400 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm text-[#475569] mb-2">Email Address *</label>
          <div className="flex gap-2">
            <input type="email" value={form.email} onChange={e => {
              set('email', e.target.value);
              if (form.emailOtpVerified) set('emailOtpVerified', false);
            }} placeholder="owner@gym.com" className={inputCls('email') + ' flex-1'} disabled={form.emailOtpVerified} />
            
            {!form.emailOtpVerified && (
              <button type="button" onClick={handleSendOtp} className="px-4 py-2 bg-[#F1F5F9] text-[#475569] text-sm font-medium rounded-xl border border-[#CBD5E1] hover:bg-[#E2E8F0] transition-colors whitespace-nowrap">
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            )}
            {form.emailOtpVerified && (
              <span className="px-4 py-2 bg-green-50 text-green-600 text-sm font-medium rounded-xl border border-green-200 flex items-center gap-1 whitespace-nowrap">
                <Check size={16} /> Verified
              </span>
            )}
          </div>
          {errors.email && <p className="text-teal-400 text-xs mt-1">{errors.email}</p>}
          {errors.emailOtp && <p className="text-teal-400 text-xs mt-1">{errors.emailOtp}</p>}
          
          {otpSent && !form.emailOtpVerified && (
            <div className="mt-3 flex gap-2">
              <input 
                type="text" 
                maxLength={6} 
                value={enteredOtp} 
                onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP" 
                className="w-full px-4 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A] flex-1"
              />
              <button type="button" onClick={handleVerifyOtp} className="px-4 py-2 bg-[#16A34A] text-white text-sm font-medium rounded-xl hover:bg-[#15803D] transition-colors whitespace-nowrap">
                Verify
              </button>
            </div>
          )}
          {otpError && <p className="text-teal-400 text-xs mt-1">{otpError}</p>}
        </div>
        <div>
          <label className="block text-sm text-[#475569] mb-2">Mobile Number *</label>
          <input maxLength={10} value={form.mobile} onChange={e => set('mobile', e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" className={inputCls('mobile')} />
          {errors.mobile && <p className="text-teal-400 text-xs mt-1">{errors.mobile}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#475569] mb-2">Password *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 chars" className={inputCls('password') + ' pr-10'} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-teal-400 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm text-[#475569] mb-2">Confirm Password *</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" className={inputCls('confirmPassword') + ' pr-10'} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569]">
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-teal-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>
      </div>

      {/* Gym Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#1E293B] border-b border-[#CCFBF1] pb-2">Gym Information</h2>
        <div>
          <label className="block text-sm text-[#475569] mb-2">Gym Name *</label>
          <input value={form.gymName} onChange={e => set('gymName', e.target.value)} placeholder="AI Fitness Center" className={inputCls('gymName')} />
          {errors.gymName && <p className="text-teal-400 text-xs mt-1">{errors.gymName}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#475569] mb-2">Gym Email</label>
            <input type="email" value={form.gymEmail} onChange={e => set('gymEmail', e.target.value)} placeholder="Optional" className={inputCls('gymEmail')} />
          </div>
          <div>
            <label className="block text-sm text-[#475569] mb-2">Gym Contact Number *</label>
            <input maxLength={10} value={form.gymContactNumber} onChange={e => set('gymContactNumber', e.target.value.replace(/\D/g, ''))} placeholder="10-digit number" className={inputCls('gymContactNumber')} />
            {errors.gymContactNumber && <p className="text-teal-400 text-xs mt-1">{errors.gymContactNumber}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm text-[#475569] mb-2">Address *</label>
          <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street address" className={inputCls('address')} />
          {errors.address && <p className="text-teal-400 text-xs mt-1">{errors.address}</p>}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-[#475569] mb-2">City *</label>
            <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" className={inputCls('city')} />
            {errors.city && <p className="text-teal-400 text-xs mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm text-[#475569] mb-2">State *</label>
            <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="State" className={inputCls('state')} />
            {errors.state && <p className="text-teal-400 text-xs mt-1">{errors.state}</p>}
          </div>
          <div>
            <label className="block text-sm text-[#475569] mb-2">PIN Code</label>
            <input maxLength={6} inputMode="numeric" value={form.pinCode} onChange={e => set('pinCode', e.target.value.replace(/\D/g, ''))} placeholder="PIN" className={inputCls('pinCode')} />
          </div>
        </div>
      </div>

      {/* Operational Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#1E293B] border-b border-[#CCFBF1] pb-2">Operational Details</h2>
        <div>
          <label className="block text-sm text-[#475569] mb-2">Gym Type *</label>
          <div className="flex flex-wrap gap-2">
            {GYM_TYPES.map(t => (
              <button key={t} type="button" onClick={() => set('gymType', t)} className={selBtnCls(form.gymType === t)}>{t}</button>
            ))}
          </div>
          {errors.gymType && <p className="text-teal-400 text-xs mt-1">{errors.gymType}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#475569] mb-2">Approx. Members *</label>
            <input type="number" value={form.approxMembers} onChange={e => set('approxMembers', e.target.value)} placeholder="e.g. 100" className={inputCls('approxMembers')} />
            {errors.approxMembers && <p className="text-teal-400 text-xs mt-1">{errors.approxMembers}</p>}
          </div>
          <div>
            <label className="block text-sm text-[#475569] mb-2">Number of Trainers *</label>
            <input type="number" value={form.numTrainers} onChange={e => set('numTrainers', e.target.value)} placeholder="e.g. 5" className={inputCls('numTrainers')} />
            {errors.numTrainers && <p className="text-teal-400 text-xs mt-1">{errors.numTrainers}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm text-[#475569] mb-2">Operating Hours *</label>
          <div className="flex flex-wrap gap-2">
            {OPERATING_HOURS.map(h => (
              <button key={h} type="button" onClick={() => set('operatingHours', h)} className={selBtnCls(form.operatingHours === h)}>{h}</button>
            ))}
          </div>
          {errors.operatingHours && <p className="text-teal-400 text-xs mt-1">{errors.operatingHours}</p>}
        </div>

        {/* Training Mode */}
        <div>
          <label className="block text-sm text-[#475569] mb-1">Training Mode *</label>
          <p className="text-xs text-[#94A3B8] mb-2">Select how your gym provides trainer-led fitness services.</p>
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
          {errors.trainingMode && <p className="text-teal-400 text-xs mt-1">{errors.trainingMode}</p>}
        </div>

        {/* Services Offered */}
        <div>
          <label className="block text-sm text-[#475569] mb-2">Services Offered *</label>
          <div className="grid grid-cols-2 gap-3 p-4 border border-[#CCFBF1] rounded-xl bg-[#F8FAFC]">
            {(form.trainingMode === 'online' 
              ? [
                  'AI Fitness Coaching', '1-on-1 Virtual Training', 'Live Online Classes', 
                  'On-Demand Workouts', 'Diet & Nutrition Guidance', 'Online Fitness Challenges', 
                  'Virtual Yoga & Meditation', 'Progress Analytics'
                ]
              : form.trainingMode === 'offline'
              ? [
                  'Gym Membership', 'Personal Training', 'Group Classes', 
                  'Diet Guidance', 'CrossFit & HIIT', 'Yoga & Pilates', 
                  'Physiotherapy', 'Strength & Conditioning'
                ]
              : [
                  'Gym Membership', '1-on-1 Virtual Training', 'Personal Training', 
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
                  className="rounded text-[#16A34A] focus:ring-[#16A34A] border-[#CBD5E1]"
                />
                <span className="text-sm text-[#1E293B]">{service}</span>
              </label>
            ))}
          </div>
          {errors.services && <p className="text-teal-400 text-xs mt-1">{errors.services}</p>}
        </div>
        <div>
          <label className="block text-sm text-[#475569] mb-2">Rating *</label>
          <input type="text" inputMode="decimal" value={form.rating || ''} onChange={e => {
            const v = e.target.value.replace(/[^0-9.]/g, '');
            const parts = v.split('.');
            let cleaned = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
            if (parseFloat(cleaned) > 5) cleaned = '5';
            set('rating', cleaned);
          }} placeholder="e.g. 4.8 (Max 5.0)" className={inputCls('rating')} maxLength={4} />
          {errors.rating && <p className="text-teal-400 text-xs mt-1">{errors.rating}</p>}
        </div>
        <div>
          <label className="block text-sm text-[#475569] mb-2">Gym Photo/Logo (Optional)</label>
          <div className="flex items-center gap-4">
            {form.logo && (
              <img src={form.logo} alt="Gym Logo" className="w-16 h-16 rounded-xl object-cover border border-[#CCFBF1]" />
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
              className="text-sm text-[#475569] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#16A34A] file:text-black hover:file:bg-[#DC2626] transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
