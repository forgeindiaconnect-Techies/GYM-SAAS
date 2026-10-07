import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,255,0,0.05)_0%,_transparent_60%)] pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 mb-10 group relative z-10">
        <div className="w-9 h-9 bg-[#F97316] rounded-md flex items-center justify-center">
          <Activity className="text-black" size={22} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#F97316]">AI GYM</span>
      </Link>

      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 shadow-2xl relative z-10">
        <h1 className="text-2xl font-bold text-[#292524] mb-2">Reset Password</h1>
        <p className="text-[#78716C] text-sm mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="flex items-center space-x-3 bg-[#FED7AA]/10 border border-[#FED7AA]/30 text-teal-400 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#F97316]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#F97316]" />
            </div>
            <h3 className="text-xl font-bold text-[#292524] mb-2">Check your email</h3>
            <p className="text-[#78716C] text-sm mb-6">
              We've sent password reset instructions to <br />
              <span className="text-[#292524] font-medium">{email}</span>
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center justify-center w-full py-3.5 bg-[#FED7AA] text-[#292524] font-semibold rounded-xl hover:bg-[#333] transition-colors"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#78716C] mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError(''); }}
                placeholder="you@example.com"
                className={`w-full bg-[#FFFFFF] border ${fieldError ? 'border-[#FED7AA]' : 'border-[#E7E5E4]'} text-[#292524] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F97316] transition-colors placeholder-[#555]`}
              />
              {fieldError && <p className="text-teal-400 text-xs mt-1">{fieldError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#F97316] text-[#292524] font-bold rounded-xl hover:bg-[#EA580C] transition-colors disabled:opacity-60 flex items-center justify-center space-x-2"
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
            <Link to="/login" className="text-[#78716C] hover:text-[#F97316] transition-colors">
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
