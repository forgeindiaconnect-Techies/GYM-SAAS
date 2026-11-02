import React, { useState } from 'react';
import { 
  Calendar, Users, IndianRupee, TrendingUp, 
  Clock, CheckCircle, Plus, Phone, MessageSquare, 
  Flame, Award, ChevronRight, Dumbbell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileStatCard } from '../../../shared/components/MobileStatCard';
import { useMobileAuth } from '../../../shared/auth/AuthContext';

export const TrainerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useMobileAuth();

  const [todaySessions, setTodaySessions] = useState([
    { id: '1', client: 'Naveen Kumar', goal: 'Muscle Gain', time: '09:00 AM - 10:00 AM', status: 'Completed', phone: '+91 98765 43210' },
    { id: '2', client: 'Priya Sharma', goal: 'Weight Loss', time: '11:30 AM - 12:30 PM', status: 'Next Up', phone: '+91 98451 11223' },
    { id: '3', client: 'Rahul Varma', goal: 'Strength & Core', time: '04:00 PM - 05:00 PM', status: 'Upcoming', phone: '+91 99001 23456' },
    { id: '4', client: 'Vikram Singh', goal: 'Mobility & Rehab', time: '06:30 PM - 07:30 PM', status: 'Upcoming', phone: '+91 97777 55544' }
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* Trainer Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-orange-100 bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Certified Master Trainer
            </span>
            <h1 className="text-xl font-bold">Hey {user?.firstName || 'Coach'}!</h1>
            <p className="text-xs text-orange-100 mt-0.5">You have 4 training sessions today</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/30 shadow-inner">
            {user?.firstName?.charAt(0) || 'T'}
          </div>
        </div>

        {/* Next session quick highlight */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">Next: <strong>Priya Sharma</strong> at 11:30 AM</span>
          </div>
          <a href="tel:+919845111223" className="px-2.5 py-1 bg-white text-orange-600 font-bold rounded-lg text-[10px] shadow-xs active:scale-95">
            Contact
          </a>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3">
        <MobileStatCard 
          title="Active Clients"
          value="18"
          change="+3 new this month"
          isPositive={true}
          icon={<Users className="w-4 h-4" />}
          color="blue"
        />
        <MobileStatCard 
          title="Commission Payout"
          value="₹64,200"
          change="+24% vs last mo"
          isPositive={true}
          icon={<IndianRupee className="w-4 h-4" />}
          color="orange"
        />
        <MobileStatCard 
          title="Client Adherence"
          value="94%"
          change="Top tier coach"
          isPositive={true}
          icon={<Award className="w-4 h-4" />}
          color="emerald"
        />
        <MobileStatCard 
          title="Completed Hours"
          value="48 hrs"
          change="On track for target"
          isPositive={true}
          icon={<Clock className="w-4 h-4" />}
          color="purple"
        />
      </div>

      {/* Today's Schedule */}
      <MobileCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Today's Schedule</h3>
          </div>
          <span className="text-[11px] font-semibold text-orange-600">4 Slots</span>
        </div>

        <div className="space-y-2.5">
          {todaySessions.map(s => (
            <div 
              key={s.id} 
              className={`p-3 rounded-xl border transition-all ${
                s.status === 'Next Up' 
                  ? 'border-orange-500 bg-orange-50/50 shadow-xs' 
                  : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    s.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    s.status === 'Next Up' ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {s.client.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{s.client}</h4>
                    <p className="text-[10px] text-slate-500">{s.goal}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  s.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  s.status === 'Next Up' ? 'bg-orange-600 text-white font-bold' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {s.status}
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {s.time}
                </span>
                <div className="flex items-center gap-2">
                  <a href={`tel:${s.phone}`} className="p-1 text-slate-600 hover:text-orange-600">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <button 
                    onClick={() => navigate('/trainer/workouts')}
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Assign Split
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MobileCard>
    </div>
  );
};
export default TrainerDashboardScreen;

