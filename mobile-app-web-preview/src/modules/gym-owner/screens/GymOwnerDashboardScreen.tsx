import React, { useState, useEffect } from 'react';
import { 
  Users, IndianRupee, TrendingUp, UserCheck, 
  Plus, QrCode, AlertCircle, ArrowUpRight, ChevronRight,
  Activity, Calendar, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileStatCard } from '../../../shared/components/MobileStatCard';
import { MobileButton } from '../../../shared/components/MobileButton';
import { useMobileAuth } from '../../../shared/auth/AuthContext';
import api from '../../../shared/api/client';

export const GymOwnerDashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useMobileAuth();
  const [stats, setStats] = useState({
    totalMembers: 1248,
    activeMembers: 1140,
    monthlyRevenue: 482000,
    retentionRate: 92,
    todayCheckins: 84,
    liveOnFloor: 38
  });
  const [recentCheckins, setRecentCheckins] = useState([
    { id: '1', name: 'Naveen Kumar', plan: 'Gold Annual', time: '10 mins ago', status: 'Active' },
    { id: '2', name: 'Priya Sharma', plan: 'Silver Quarterly', time: '22 mins ago', status: 'Active' },
    { id: '3', name: 'Rahul Varma', plan: 'Platinum VIP', time: '45 mins ago', status: 'Active' },
    { id: '4', name: 'Sneha Patel', plan: 'Monthly Pass', time: '1 hr ago', status: 'Expiring Soon' }
  ]);
  const [expiringMembers, setExpiringMembers] = useState([
    { id: '101', name: 'Arjun Menon', daysLeft: 2, phone: '+91 98765 43210', plan: 'Silver Monthly' },
    { id: '102', name: 'Divya Iyer', daysLeft: 3, phone: '+91 98451 23456', plan: 'Gold Annual' }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Attempt fetch from live backend API
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/members/stats');
        if (res.data) {
          setStats(prev => ({
            ...prev,
            totalMembers: res.data.total || prev.totalMembers,
            activeMembers: res.data.active || prev.activeMembers,
            monthlyRevenue: res.data.revenue || prev.monthlyRevenue
          }));
        }
      } catch {
        // Safe fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-4 pb-6">
      {/* Gym Greeting Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg shadow-orange-500/20">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-orange-100 bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
              {user?.gymName || 'Gymora Elite Fitness'}
            </span>
            <h1 className="text-xl font-bold">Welcome back, {user?.firstName || 'Owner'}</h1>
            <p className="text-xs text-orange-100 mt-0.5">Main Branch • Downtown Center</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/30 shadow-inner">
            {user?.firstName?.charAt(0) || 'G'}
          </div>
        </div>

        {/* Live Floor Badge */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">Live on gym floor:</span>
            <span className="font-bold text-white bg-black/20 px-2 py-0.5 rounded-full">{stats.liveOnFloor} people</span>
          </div>
          <div className="text-orange-100 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Today: {stats.todayCheckins}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="grid grid-cols-4 gap-2">
        <button 
          onClick={() => navigate('/owner/members?action=add')}
          className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-orange-500 active:scale-95 transition-all text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Add Member</span>
        </button>

        <button 
          onClick={() => navigate('/owner/checkin')}
          className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-orange-500 active:scale-95 transition-all text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Scan QR</span>
        </button>

        <button 
          onClick={() => navigate('/owner/trainers')}
          className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-orange-500 active:scale-95 transition-all text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Trainers</span>
        </button>

        <button 
          onClick={() => navigate('/owner/finances')}
          className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:border-orange-500 active:scale-95 transition-all text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-1">
            <IndianRupee className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">Payouts</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Gym Performance</h2>
          <span className="text-xs text-orange-600 font-semibold flex items-center gap-0.5">
            Real-time <TrendingUp className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <MobileStatCard 
            title="Monthly Revenue"
            value={`₹${(stats.monthlyRevenue / 100000).toFixed(2)}L`}
            change="+18% vs last mo"
            isPositive={true}
            icon={<IndianRupee className="w-4 h-4" />}
            color="orange"
          />
          <MobileStatCard 
            title="Total Members"
            value={stats.totalMembers.toLocaleString()}
            change="+12% this month"
            isPositive={true}
            icon={<Users className="w-4 h-4" />}
            color="blue"
          />
          <MobileStatCard 
            title="Member Retention"
            value={`${stats.retentionRate}%`}
            change="Top 5% benchmark"
            isPositive={true}
            icon={<TrendingUp className="w-4 h-4" />}
            color="emerald"
          />
          <MobileStatCard 
            title="Active Passes"
            value={stats.activeMembers.toLocaleString()}
            change="94% utilization"
            isPositive={true}
            icon={<UserCheck className="w-4 h-4" />}
            color="purple"
          />
        </div>
      </div>

      {/* Urgent Renewals Card */}
      {expiringMembers.length > 0 && (
        <MobileCard className="border-amber-200 bg-amber-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Renewals Expiring Soon</h3>
                <p className="text-[10px] text-slate-500">2 members require immediate renewal</p>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">Urgent</span>
          </div>
          <div className="space-y-2">
            {expiringMembers.map(item => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-amber-200/60 shadow-xs">
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.name}</p>
                  <p className="text-[11px] text-slate-500">{item.plan} • {item.daysLeft} days remaining</p>
                </div>
                <button 
                  onClick={() => alert(`Sending renewal link to ${item.name} (${item.phone})`)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-orange-600 text-white rounded-lg active:scale-95 transition-all shadow-xs"
                >
                  Remind
                </button>
              </div>
            ))}
          </div>
        </MobileCard>
      )}

      {/* Recent Live Check-ins */}
      <MobileCard>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Recent Check-ins</h3>
          </div>
          <button 
            onClick={() => navigate('/owner/members')}
            className="text-[11px] font-semibold text-orange-600 flex items-center hover:underline"
          >
            View Roster <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {recentCheckins.map(m => (
            <div key={m.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{m.name}</p>
                  <p className="text-[10px] text-slate-500">{m.plan}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 inline-block mb-0.5">
                  {m.status}
                </span>
                <p className="text-[10px] text-slate-400">{m.time}</p>
              </div>
            </div>
          ))}
        </div>
      </MobileCard>
    </div>
  );
};
export default GymOwnerDashboardScreen;

