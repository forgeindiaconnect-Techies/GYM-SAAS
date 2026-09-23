import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setFieldError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setFieldError('Enter a valid email');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setSuccess(false);

    if (!validate()) return;

    setIsLoading(true);
    try {
      // Stub API call - this would be implemented in the backend
      // await api.post('/auth/forgot-password', { email });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EE] flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,255,0,0.05)_0%,_transparent_60%)] pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 mb-10 group relative z-10">
        <div className="w-9 h-9 bg-[#34483F] rounded-md flex items-center justify-center">
          <Activity className="text-black" size={22} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#34483F]">AI GYM</span>
      </Link>

      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-8 shadow-2xl relative z-10">
        <h1 className="text-2xl font-bold text-[#202522] mb-2">Reset Password</h1>
        <p className="text-[#4A514D] text-sm mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="flex items-center space-x-3 bg-[#8FA89B]/10 border border-[#8FA89B]/30 text-teal-400 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#34483F]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#34483F]" />
            </div>
            <h3 className="text-xl font-bold text-[#202522] mb-2">Check your email</h3>
            <p className="text-[#4A514D] text-sm mb-6">
              We've sent password reset instructions to <br />
              <span className="text-[#202522] font-medium">{email}</span>
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center justify-center w-full py-3.5 bg-[#E8E5DA] text-[#202522] font-semibold rounded-xl hover:bg-[#333] transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#4A514D] mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError(''); }}
                placeholder="you@example.com"
                className={`w-full bg-[#FFFFFF] border ${fieldError ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} text-[#202522] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#34483F] transition-colors placeholder-[#555]`}
              />
              {fieldError && <p className="text-teal-400 text-xs mt-1">{fieldError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#34483F] text-[#202522] font-bold rounded-xl hover:bg-[#C6A77D] transition-colors disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" /><span>Sending...</span></>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        {!success && (
          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-[#4A514D] hover:text-[#34483F] transition-colors">
              &larr; Back to Login
            </Link>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-[#555] relative z-10">&copy; {new Date().getFullYear()} AI GYM Technologies. All rights reserved.</p>
    </div>
  );
};

export default ForgotPassword;
