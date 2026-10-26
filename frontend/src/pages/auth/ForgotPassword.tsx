import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertCircle, CheckCircle, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setFieldError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setFieldError('Enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        setOtpSent(true);
      } else {
        setError(res.data.message || 'Failed to send password reset email.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please check your email and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });

      if (res.data.success) {
        setSuccess(true);
      } else {
        setError(res.data.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B0C] flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(45,212,191,0.07)_0%,_transparent_65%)] pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2.5 mb-8 group z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/10">
          <Activity className="text-[#06201D]" size={22} strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#F5FAFA] group-hover:text-[#2DD4BF] transition-colors">Gymora</span>
      </Link>

      <div className="w-full max-w-md bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-8 sm:p-9 shadow-2xl relative z-10 backdrop-blur-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5FAFA] mb-2 tracking-tight">Reset Password</h1>
        <p className="text-[#9AAEAE] text-sm mb-6">
          {!otpSent 
            ? "Enter your email address and we'll send you an OTP code to reset your password."
            : "Enter the 6-digit OTP code sent to your email and your new password."}
        </p>

        {error && (
          <div className="flex items-start space-x-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#1B2728] rounded-full flex items-center justify-center mx-auto mb-4 text-[#2DD4BF] border border-[#2A3A3A]">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">Password Reset Successful!</h3>
            <p className="text-[#9AAEAE] text-sm mb-6">
              Your password has been updated. You can now log in with your new password.
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold rounded-xl hover:from-[#5EEAD4] hover:to-[#5EEAD4] transition-all shadow-lg shadow-teal-500/20"
            >
              Return to Login
            </Link>
          </div>
        ) : !otpSent ? (
          <form onSubmit={handleSendOtp} noValidate className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#C1D0D0] mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldError(''); setError(''); }}
                placeholder="you@example.com"
                className={`w-full bg-[#101819] border ${fieldError ? 'border-red-400/80' : 'border-[#2A3A3A]'} text-[#F5FAFA] placeholder-[#6A7F7F] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] transition-all`}
              />
              {fieldError && <p className="text-red-400 text-xs mt-1.5">{fieldError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold rounded-xl hover:from-[#5EEAD4] hover:to-[#5EEAD4] transition-all disabled:opacity-60 flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" /><span>Sending OTP...</span></>
              ) : (
                <span>Send Reset OTP</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#9AAEAE] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-[#101819] border border-[#2A3A3A] text-[#9AAEAE] rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2DD4BF] mb-1">6-Digit OTP Code *</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-[#101819] border border-[#2A3A3A] text-[#F5FAFA] placeholder-[#6A7F7F] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C1D0D0] mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#101819] border border-[#2A3A3A] text-[#F5FAFA] placeholder-[#6A7F7F] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF] pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C1D0D0] mb-1">Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-[#101819] border border-[#2A3A3A] text-[#F5FAFA] placeholder-[#6A7F7F] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold rounded-xl hover:from-[#5EEAD4] hover:to-[#5EEAD4] transition-all disabled:opacity-60 flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 cursor-pointer"
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /><span>Resetting Password...</span></>
                ) : (
                  <><KeyRound size={18} /><span>Reset Password</span></>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setOtpSent(false); setError(''); }}
                className="text-xs text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors cursor-pointer"
              >
                Change Email / Resend Code
              </button>
            </div>
          </form>
        )}

        {!success && (
          <div className="mt-6 text-center text-sm border-t border-[#2A3A3A] pt-4">
            <Link to="/login" className="text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors">
              &larr; Back to Login
            </Link>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-[#9AAEAE] relative z-10">&copy; {new Date().getFullYear()} Gymora Technologies. All rights reserved.</p>
    </div>
  );
};

export default ForgotPassword;
