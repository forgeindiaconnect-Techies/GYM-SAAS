import React from 'react';
import { Building2, MapPin, Clock, Shield, Bell, Phone, LogOut, ChevronRight, Check } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileButton } from '../../../shared/components/MobileButton';
import { useMobileAuth } from '../../../shared/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export const GymOwnerSettingsScreen: React.FC = () => {
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
          {user?.firstName?.charAt(0) || 'O'}
        </div>
        <h2 className="text-base font-bold text-slate-900 mt-2.5">
          {user?.firstName} {user?.lastName || ''}
        </h2>
        <p className="text-xs text-orange-600 font-medium">Owner & Administrator</p>
        <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-full">
          {user?.gymName || 'Gymora Elite Fitness'}
        </span>
      </MobileCard>

      {/* Gym Branch Details */}
      <MobileCard className="p-0 overflow-hidden divide-y divide-slate-100">
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Current Active Branch</p>
              <p className="text-[11px] text-slate-500">Downtown Flagship Center</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> Active
          </span>
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Operating Hours</p>
              <p className="text-[11px] text-slate-500">Mon - Sun: 5:00 AM - 11:00 PM</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Location & Geo-Fence</p>
              <p className="text-[11px] text-slate-500">12th Main Road, Indiranagar</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
      </MobileCard>

      {/* App & Subscription Settings */}
      <MobileCard className="p-0 overflow-hidden divide-y divide-slate-100">
        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">SaaS Plan</p>
              <p className="text-[11px] text-slate-500">Gymora Pro Enterprise (Active)</p>
            </div>
          </div>
          <span className="text-[11px] text-orange-600 font-semibold">Manage</span>
        </div>

        <div className="p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Push Notifications</p>
              <p className="text-[11px] text-slate-500">Member renewals & attendance</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600">Enabled</span>
        </div>
      </MobileCard>

      {/* Logout Action */}
      <button 
        onClick={handleLogout}
        className="w-full p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-98 transition-all"
      >
        <LogOut className="w-4 h-4" /> Log Out from Mobile App
      </button>
    </div>
  );
};
export default GymOwnerSettingsScreen;

