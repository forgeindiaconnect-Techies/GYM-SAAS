import React, { useState } from 'react';
import { 
  Flame, QrCode, Droplets, Dumbbell, Award, 
  ChevronRight, Play, Calendar, User, CheckCircle2, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileModal } from '../../../shared/components/MobileModal';
import { useMobileAuth } from '../../../shared/auth/AuthContext';

export const CustomerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useMobileAuth();
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [waterMl, setWaterMl] = useState(2250);

  const addWater = () => {
    setWaterMl(prev => Math.min(prev + 250, 4000));
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-orange-100 bg-white/20 px-2 py-0.5 rounded-full">
                Gold Member
              </span>
              <span className="text-[10px] font-bold text-amber-200 bg-black/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" /> 14 Day Streak
              </span>
            </div>
            <h1 className="text-xl font-bold">Train Hard, {user?.firstName || 'Member'}!</h1>
            <p className="text-xs text-orange-100 mt-0.5">Today is Push Day: Chest & Triceps</p>
          </div>
          <button 
            onClick={() => setIsQrOpen(true)}
            className="w-12 h-12 rounded-2xl bg-white text-orange-600 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <QrCode className="w-6 h-6" />
            <span className="text-[8px] font-bold mt-0.5">PASS</span>
          </button>
        </div>

        {/* Quick Workout Trigger */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">Scheduled at 06:00 PM</span>
          </div>
          <button 
            onClick={() => navigate('/customer/workouts')}
            className="px-3 py-1 bg-white text-orange-600 font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs active:scale-95"
          >
            <Play className="w-3 h-3 fill-orange-600 text-orange-600" /> Start Workout
          </button>
        </div>
      </div>

      {/* Daily Progress Overview */}
      <div className="grid grid-cols-2 gap-3">
        {/* Calories Card */}
        <MobileCard className="p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Active Burn</span>
            <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            620 <span className="text-xs font-semibold text-slate-400">/ 850 kcal</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full" style={{ width: '73%' }}></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-medium">73% of daily target</p>
        </MobileCard>

        {/* Hydration Card */}
        <MobileCard className="p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500">Hydration</span>
            <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {(waterMl / 1000).toFixed(1)} <span className="text-xs font-semibold text-slate-400">/ 3.5 L</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${(waterMl / 3500) * 100}%` }}></div>
          </div>
          <button 
            onClick={addWater}
            className="text-[10px] text-sky-600 font-bold mt-1.5 hover:underline flex items-center gap-0.5"
          >
            +250ml Water
          </button>
        </MobileCard>
      </div>

      {/* Today's Workout Split */}
      <MobileCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Today's Workout Program</h3>
              <p className="text-[10px] text-slate-500">Chest & Triceps Hypertrophy (5 Exercises)</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/customer/workouts')}
            className="text-xs font-bold text-orange-600 flex items-center gap-0.5 hover:underline"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 line-through text-slate-400">Barbell Bench Press</p>
                <p className="text-[10px] text-slate-400">4 sets × 10 reps (70 kg)</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600">Done</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-orange-50/50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Incline Dumbbell Press</p>
                <p className="text-[10px] text-slate-500">3 sets × 12 reps (24 kg each)</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-orange-600">Next</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Cable Tricep Pushdown</p>
                <p className="text-[10px] text-slate-500">4 sets × 15 reps</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Queued</span>
          </div>
        </div>
      </MobileCard>

      {/* Trainer Coaching Card */}
      <MobileCard className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center">
              V
            </div>
            <div>
              <p className="text-[10px] text-orange-400 uppercase tracking-wider font-bold">Assigned Trainer</p>
              <h4 className="text-xs font-bold">Coach Vikram Malhotra</h4>
              <p className="text-[10px] text-slate-400">Session booked today at 6:00 PM</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/customer/trainers')}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold active:scale-95"
          >
            Chat
          </button>
        </div>
      </MobileCard>

      {/* Digital QR Modal */}
      <MobileModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} title="Digital Gym Entry Pass">
        <div className="text-center py-4">
          <div className="w-48 h-48 mx-auto p-3 bg-white border-2 border-orange-500 rounded-2xl shadow-md flex items-center justify-center mb-3">
            {/* Stylized QR representation */}
            <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-900 rounded-lg">
              {Array.from({ length: 36 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`rounded-xs ${
                    i % 2 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-orange-500'
                  }`}
                />
              ))}
            </div>
          </div>
          <h3 className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName || ''}</h3>
          <p className="text-xs text-orange-600 font-semibold">Gold Annual Member • Active</p>
          <p className="text-[11px] text-slate-400 mt-1">Scan at front desk turnstile or reception</p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Ready to scan
          </div>
        </div>
      </MobileModal>
    </div>
  );
};
export default CustomerDashboardScreen;

