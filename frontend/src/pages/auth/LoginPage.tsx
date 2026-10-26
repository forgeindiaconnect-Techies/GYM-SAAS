import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Activity, AlertCircle, Loader2, ArrowLeft, ShieldCheck, Building2, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardRoute, isSubscriptionActive } from '../../utils/routeHelpers';
import api from '../../utils/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const portal = searchParams.get('portal');
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});



  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email';
    if (!form.password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email: form.email, password: form.password });
      const { token, user } = res.data;
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', form.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      login(user, token, rememberMe);
      
      const intentStr = sessionStorage.getItem('checkout_intent');
      if (intentStr && user.role === 'MEMBER') {
        try {
          const intent = JSON.parse(intentStr);
          const isTrial = intent.plan?.name?.toLowerCase().includes('trial') || Number(intent.plan?.price || 0) === 0;
          const isAlreadyEnrolled = isSubscriptionActive(user.subscriptionStatus) || Boolean(user.gymId);

          sessionStorage.removeItem('checkout_intent');

          // If the user is already enrolled/approved with active plan/trial, or intent was just trial, go to dashboard
          if (!isTrial && !isAlreadyEnrolled) {
            navigate(`/gyms/${intent.gymId}/checkout`, { state: { plan: intent.plan, gym: intent.gym || { _id: intent.gymId } }, replace: true });
            return;
          }
        } catch (e) {
          sessionStorage.removeItem('checkout_intent');
        }
      } else {
        sessionStorage.removeItem('checkout_intent');
      }

      if (user.role === 'MEMBER') {
        const isCompleted = res.data?.isSubscriptionCompleted || user.subscriptionStatus === 'Expired' || user.subscriptionStatus === 'EXPIRED';
        if (isCompleted) {
          navigate('/member/subscription', { replace: true, state: { expiredAlert: true } });
          return;
        }
      }

      if (user.role === 'GYM_OWNER' || user.role === 'ADMIN') {
        if (!isSubscriptionActive(user.subscriptionStatus)) {
          navigate('/subscription-plans', { replace: true });
          return;
        }
      }

      navigate(getDashboardRoute(user), { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.message === 'Network Error' || !err.response ? 'Server connection error. Please make sure the backend is running.' : 'Something went wrong. Please try again.');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B0C] flex flex-col items-center justify-center px-4 py-12 sm:py-16 relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,212,191,0.07)_0%,_transparent_65%)] pointer-events-none" />

      {/* Dynamic Back Arrow */}
      <Link 
        to={
          portal === 'super-admin' ? '/portal/super-admin' : 
          portal === 'gym-owner' ? '/portal/gym-owner' : 
          portal === 'customer' ? '/portal/customer' : '/'
        } 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 text-[#9AAEAE] hover:text-[#2DD4BF] flex items-center gap-2 transition-colors z-20"
      >
        <ArrowLeft size={20} />
        <span className="font-medium text-sm">
          {
            portal === 'super-admin' ? 'Back to Super Admin Portal' : 
            portal === 'gym-owner' ? 'Back to Gym Owner Portal' : 
            portal === 'customer' ? 'Back to Customer Portal' : 'Back to Home'
          }
        </span>
      </Link>

      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2.5 mt-8 sm:mt-4 mb-6 sm:mb-8 group z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/10">
          <Activity className="text-[#06201D]" size={22} strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#F5FAFA] group-hover:text-[#2DD4BF] transition-colors">Gymora</span>
      </Link>

      <div className="w-full max-w-md bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-8 sm:p-9 shadow-2xl relative z-10 backdrop-blur-sm">
        {/* Portal Context Badge */}
        {portal === 'super-admin' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 mb-3">
            <ShieldCheck size={13} />
            <span>Super Admin Portal Login</span>
          </div>
        )}
        {portal === 'gym-owner' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 mb-3">
            <Building2 size={13} />
            <span>Gym Owner Portal Login</span>
          </div>
        )}
        {portal === 'customer' && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 mb-3">
            <User size={13} />
            <span>Customer Fitness Portal Login</span>
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5FAFA] mb-1.5 tracking-tight">Welcome back</h1>
        <p className="text-[#9AAEAE] text-sm mb-7">Log in to your Gymora account</p>

        {error && (
          <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#C1D0D0] mb-2">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors({ ...fieldErrors, email: '' }); }}
              placeholder="you@example.com"
              autoComplete="off"
              className={`w-full bg-[#101819] border ${fieldErrors.email ? 'border-red-400/80' : 'border-[#2A3A3A]'} text-[#F5FAFA] placeholder-[#6A7F7F] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition-all`}
            />
            {fieldErrors.email && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[#C1D0D0]">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#2DD4BF] hover:text-[#5EEAD4] hover:underline font-medium transition-colors">Forgot Password?</Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors({ ...fieldErrors, password: '' }); }}
                placeholder="Enter your password"
                autoComplete="new-password"
                className={`w-full bg-[#101819] border ${fieldErrors.password ? 'border-red-400/80' : 'border-[#2A3A3A]'} text-[#F5FAFA] placeholder-[#6A7F7F] rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-400 text-xs mt-1.5">{fieldErrors.password}</p>}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              id="remember-me"
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                rememberMe ? 'bg-[#2DD4BF] border-[#2DD4BF]' : 'border-[#2A3A3A] bg-[#101819] hover:border-[#2DD4BF]/50'
              }`}
            >
              {rememberMe && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#06201D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <label className="text-sm text-[#C1D0D0] cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>
              Remember me
            </label>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold rounded-xl hover:from-[#5EEAD4] hover:to-[#5EEAD4] transition-all disabled:opacity-60 flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#9AAEAE]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#2DD4BF] font-semibold hover:text-[#5EEAD4] hover:underline transition-colors">
            Sign Up
          </Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-[#9AAEAE] z-10">&copy; {new Date().getFullYear()} Gymora Technologies. All rights reserved.</p>
    </div>
  );
};

export default LoginPage;
