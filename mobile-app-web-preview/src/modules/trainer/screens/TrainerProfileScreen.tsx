import React from 'react';
import { Star, Award, Shield, BookOpen, Clock, LogOut, ChevronRight, Check } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { useMobileAuth } from '../../../shared/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export const TrainerProfileScreen: React.FC = () => {
  const { user, logout } = useMobileAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Profile Header */}
      <MobileCard className="p-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 border-2 border-white">
          {user?.firstName?.charAt(0) || 'T'}
        </div>
        <h2 className="text-base font-bold text-slate-900 mt-2.5">
          {user?.firstName} {user?.lastName || 'Trainer'}
        </h2>
        <p className="text-xs text-orange-600 font-semibold">Master Fitness Coach & Dietitian</p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> 4.9 (128 Reviews)
          </span>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
            6+ Years Exp
          </span>
        </div>
      </MobileCard>

      {/* Certifications & Badges */}
      <MobileCard className="p-4">
        <h3 className="text-xs font-bold text-slate-900 mb-3">Accreditations & Specializations</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">ACSM Certified Personal Trainer</p>
              <p className="text-[10px] text-slate-500">American College of Sports Medicine</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Precision Nutrition Level 1 (Pn1)</p>
              <p className="text-[10px] text-slate-500">Sports & Exercise Nutrition Specialist</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">CrossFit Level 2 Coach</p>
              <p className="text-[10px] text-slate-500">Functional Fitness & Olympic Lifting</p>
            </div>
          </div>
        </div>
      </MobileCard>

      {/* Settings Options */}
      <MobileCard className="p-0 overflow-hidden divide-y divide-slate-100">
        <div className="p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">Hourly Rate Setting</p>
            <p className="text-[11px] text-slate-500">Currently ₹800 / session</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
        <div className="p-3.5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">Availability Calendar</p>
            <p className="text-[11px] text-slate-500">6:00 AM - 12:00 PM, 4:00 PM - 8:00 PM</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </MobileCard>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-98 transition-all"
      >
        <LogOut className="w-4 h-4" /> Log Out from Trainer App
      </button>
    </div>
  );
};
export default TrainerProfileScreen;

