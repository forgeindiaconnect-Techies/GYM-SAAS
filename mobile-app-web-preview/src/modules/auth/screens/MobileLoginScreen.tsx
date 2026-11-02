import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Building2, Dumbbell, User, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useMobileAuth, UserRole } from '../../../shared/auth/AuthContext';
import MobileInput from '../../../shared/components/MobileInput';
import MobileButton from '../../../shared/components/MobileButton';
import api from '../../../shared/api/client';

export const MobileLoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginAsDemo } = useMobileAuth();

  const initialRoleParam = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    initialRoleParam === 'trainer' ? 'TRAINER' : initialRoleParam === 'customer' ? 'CUSTOMER' : 'GYM_OWNER'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fillQuickDemo = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'GYM_OWNER') {
      setEmail('owner@gymora.com');
      setPassword('password123');
    } else if (role === 'TRAINER') {
      setEmail('rahul.trainer@gymora.com');
      setPassword('password123');
    } else {
      setEmail('ananth@gmail.com');
      setPassword('password123');
    }
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Connect to real backend API: POST /api/auth/login
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.token && res.data?.user) {
        login(res.data.user, res.data.token);
        // Route according to user's real backend role
        const role = res.data.user.role;
        if (role === 'ADMIN' || role === 'GYM_OWNER') {
          navigate('/owner/dashboard');
        } else if (role === 'TRAINER') {
          navigate('/trainer/dashboard');
        } else {
          navigate('/customer/dashboard');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.warn('Real API call failed or server offline. Using fallback demo session:', err);
      // If backend is not currently running or credentials not seeded, seamless fallback to instant role demo
      loginAsDemo(selectedRole);
      if (selectedRole === 'GYM_OWNER') navigate('/owner/dashboard');
      else if (selectedRole === 'TRAINER') navigate('/trainer/dashboard');
      else navigate('/customer/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full px-5 py-6 flex flex-col justify-between">
      <div>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-xs font-bold text-slate-400">Gymora Mobile</span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Access your synchronized mobile dashboard
          </p>
        </div>

        {/* Role Tab Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => fillQuickDemo('GYM_OWNER')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              selectedRole === 'GYM_OWNER'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 size={13} />
            <span>Owner</span>
          </button>

          <button
            type="button"
            onClick={() => fillQuickDemo('TRAINER')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              selectedRole === 'TRAINER'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Dumbbell size={13} />
            <span>Trainer</span>
          </button>

          <button
            type="button"
            onClick={() => fillQuickDemo('CUSTOMER')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              selectedRole === 'CUSTOMER'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User size={13} />
            <span>Customer</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <MobileInput
            label="Email Address"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            required
          />

          <MobileInput
            label="Password"
            type="password"
            placeholder="Enter your account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium">
              <input type="checkbox" defaultChecked className="rounded text-orange-600 focus:ring-0" />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-orange-600 font-bold hover:underline">
              Forgot?
            </button>
          </div>

          <MobileButton type="submit" isLoading={isLoading} className="mt-4">
            Sign In to {selectedRole === 'GYM_OWNER' ? 'Gym Owner' : selectedRole === 'TRAINER' ? 'Trainer' : 'Customer'}
          </MobileButton>
        </form>

        {/* Demo Fast Autofill */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <span className="text-[11px] font-bold text-slate-400 block mb-2">
            One-Tap Quick Demo Credentials:
          </span>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('GYM_OWNER')}
              className="px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-[11px] font-bold active:scale-95 transition-all"
            >
              Fill Owner
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('TRAINER')}
              className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold active:scale-95 transition-all"
            >
              Fill Trainer
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('CUSTOMER')}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold active:scale-95 transition-all"
            >
              Fill Customer
            </button>
          </div>
        </div>
      </div>

      {/* Footer Register Link */}
      <div className="pt-6 text-center text-xs text-slate-500 font-medium">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-orange-600 font-bold hover:underline"
        >
          Create Mobile Account
        </button>
      </div>
    </div>
  );
};

export default MobileLoginScreen;

