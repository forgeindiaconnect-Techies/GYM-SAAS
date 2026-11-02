import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Dumbbell, User, Sparkles, ChevronRight, Activity, ShieldCheck } from 'lucide-react';
import { useMobileAuth, UserRole } from '../../../shared/auth/AuthContext';
import MobileButton from '../../../shared/components/MobileButton';

export const RoleSelectorScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setRoleOverride, loginAsDemo } = useMobileAuth();

  const handleSelectRole = (role: UserRole) => {
    setRoleOverride(role);
    navigate(`/login?role=${role.toLowerCase()}`);
  };

  const handleQuickDemo = (role: UserRole) => {
    loginAsDemo(role);
    if (role === 'GYM_OWNER') navigate('/owner/dashboard');
    else if (role === 'TRAINER') navigate('/trainer/dashboard');
    else navigate('/customer/dashboard');
  };

  return (
    <div className="min-h-full px-5 py-6 flex flex-col justify-between">
      {/* Brand Header */}
      <div className="text-center pt-2 pb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg shadow-orange-500/25 mb-3">
          <Activity size={28} strokeWidth={2.6} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome to Gymora
        </h1>
        <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto mt-1">
          Complete fitness ecosystem tailored for gym facility owners, certified coaches, and members.
        </p>
      </div>

      {/* 3 Role Selection Cards */}
      <div className="space-y-3.5 my-auto">
        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block px-1">
          Select Your Application Role
        </span>

        {/* 1. Gym Owner Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Building2 size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-base text-slate-900">Gym Owner App</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  Business
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Live attendance, trainer payouts, membership billing, and multi-branch control.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSelectRole('GYM_OWNER')}
              className="py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold active:scale-97 transition-all flex items-center justify-center gap-1"
            >
              <span>Login / Register</span>
              <ChevronRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('GYM_OWNER')}
              className="py-2.5 px-3 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-bold active:scale-97 transition-all flex items-center justify-center gap-1 border border-orange-200"
            >
              <Sparkles size={13} />
              <span>Explore Demo</span>
            </button>
          </div>
        </div>

        {/* 2. Trainer Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm hover:border-blue-300 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Dumbbell size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-base text-slate-900">Trainer App</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Coach
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Client workouts, diet plans, personal training slots, and withdrawal requests.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSelectRole('TRAINER')}
              className="py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold active:scale-97 transition-all flex items-center justify-center gap-1"
            >
              <span>Login / Register</span>
              <ChevronRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('TRAINER')}
              className="py-2.5 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold active:scale-97 transition-all flex items-center justify-center gap-1 border border-blue-200"
            >
              <Sparkles size={13} />
              <span>Explore Demo</span>
            </button>
          </div>
        </div>

        {/* 3. Customer / Member Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <User size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-base text-slate-900">Customer Fitness</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Member
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Smart AI workouts, nutrition macros, digital gym QR pass, and PT bookings.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSelectRole('CUSTOMER')}
              className="py-2.5 px-3 rounded-xl bg-slate-900 text-white text-xs font-bold active:scale-97 transition-all flex items-center justify-center gap-1"
            >
              <span>Login / Register</span>
              <ChevronRight size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('CUSTOMER')}
              className="py-2.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold active:scale-97 transition-all flex items-center justify-center gap-1 border border-emerald-200"
            >
              <Sparkles size={13} />
              <span>Explore Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="pt-4 text-center">
        <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Synced with MongoDB Backend APIs</span>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectorScreen;

