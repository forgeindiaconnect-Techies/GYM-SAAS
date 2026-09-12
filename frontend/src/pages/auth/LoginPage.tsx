import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Activity, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardRoute } from '../../utils/routeHelpers';
import api from '../../utils/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

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
          sessionStorage.removeItem('checkout_intent');
          navigate(`/gyms/${intent.gymId}/checkout`, { state: { plan: intent.plan, gym: intent.gym || { _id: intent.gymId } }, replace: true });
          return;
        } catch (e) {
          // ignore parse error
        }
      }
      
      navigate(getDashboardRoute(user), { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FDFA] flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(22,163,74,0.06)_0%,_transparent_60%)] pointer-events-none" />

      {/* Back to Home Arrow */}
      <Link to="/" className="absolute top-8 left-8 text-[#475569] hover:text-[#16A34A] flex items-center gap-2 transition-colors">
        <ArrowLeft size={20} />
        <span className="font-medium text-sm">Back to Home</span>
      </Link>

      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 mb-10 group">
        <div className="w-9 h-9 bg-gradient-to-br from-[#16A34A] to-[#0D9488] rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
          <Activity className="text-[#1E293B]" size={20} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#16A34A]">AI GYM</span>
      </Link>

      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Welcome back</h1>
        <p className="text-[#475569] text-sm mb-8">Log in to your AI GYM account</p>

        {error && (
          <div className="flex items-center space-x-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#475569] mb-2">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors({ ...fieldErrors, email: '' }); }}
              placeholder="you@example.com"
              className={`w-full bg-[#FFFFFF] border ${fieldErrors.email ? 'border-red-400' : 'border-[#CCFBF1]'} text-[#1E293B] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#16A34A] transition-colors`}
            />
            {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[#475569]">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#16A34A] hover:underline">Forgot Password?</Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors({ ...fieldErrors, password: '' }); }}
                placeholder="Enter your password"
                className={`w-full bg-[#FFFFFF] border ${fieldErrors.password ? 'border-red-400' : 'border-[#CCFBF1]'} text-[#1E293B] rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:border-[#16A34A] transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#16A34A] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              id="remember-me"
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${rememberMe ? 'bg-[#16A34A] border-[#16A34A]' : 'border-[#555] bg-transparent'}`}
            >
              {rememberMe && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="2" strokeLinecap="round"/></svg>}
            </button>
            <label className="text-sm text-[#475569] cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>Remember me</label>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-[#1E293B] font-bold rounded-xl hover:from-[#15803D] hover:to-[#0F766E] transition-all disabled:opacity-60 flex items-center justify-center space-x-2 shadow-lg shadow-green-200"
          >
            {isLoading ? <><Loader2 size={18} className="animate-spin" /><span>Logging in...</span></> : <span>Log In</span>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#475569]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#16A34A] font-semibold hover:underline">Sign Up</Link>
        </div>
      </div>

      <p className="mt-8 text-xs text-[#475569]">&copy; {new Date().getFullYear()} AI GYM Technologies. All rights reserved.</p>
    </div>
  );
};

export default LoginPage;
