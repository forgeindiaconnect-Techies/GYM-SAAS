import React from 'react';
import { Calendar, Shield, CreditCard, LogOut, ChevronRight, Award, CheckCircle2 } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { useMobileAuth } from '../../../shared/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export const CustomerProfileScreen: React.FC = () => {
  const { user, logout } = useMobileAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const attendanceLog = [
    { date: 'Today, 02 Nov', status: 'Attended (Push Day)', duration: '62 mins' },
    { date: 'Yesterday, 01 Nov', status: 'Attended (Cardio)', duration: '45 mins' },
    { date: '30 Oct 2026', status: 'Attended (Leg Day)', duration: '55 mins' },
    { date: '29 Oct 2026', status: 'Rest Day', duration: '-' },
    { date: '28 Oct 2026', status: 'Attended (Pull Day)', duration: '50 mins' }
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Profile Header */}
      <MobileCard className="p-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 border-2 border-white">
          {user?.firstName?.charAt(0) || 'C'}
        </div>
        <h2 className="text-base font-bold text-slate-900 mt-2.5">
          {user?.firstName} {user?.lastName || ''}
        </h2>
        <p className="text-xs text-orange-600 font-semibold">{user?.email || 'member@gymora.com'}</p>
        <span className="inline-block mt-2 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold rounded-full">
          Gold Annual Member
        </span>
      </MobileCard>

      {/* Membership Pass Details */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Membership Card</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active Pass
          </span>
        </div>
        <h3 className="text-lg font-bold text-white mt-2">Gymora Elite Club Pass</h3>
        <p className="text-xs text-slate-400">Card ID: GYM-2026-9921</p>
        <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 text-[10px] block">Valid From</span>
            <span className="font-semibold text-white">15 Jan 2026</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[10px] block">Renewal Date</span>
            <span className="font-bold text-orange-400">14 Jan 2027 (73 Days Left)</span>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <MobileCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900">Attendance Log</h3>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            22 Visits This Month
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {attendanceLog.map((log, i) => (
            <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{log.date}</p>
                <p className="text-[10px] text-slate-500">{log.status}</p>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">{log.duration}</span>
            </div>
          ))}
        </div>
      </MobileCard>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-98 transition-all"
      >
        <LogOut className="w-4 h-4" /> Log Out from Customer App
      </button>
    </div>
  );
};
export default CustomerProfileScreen;

