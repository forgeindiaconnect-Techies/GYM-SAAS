import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Search, Calendar, ChevronRight, X, Clock,
  Dumbbell, Filter, Flame, UserCheck, Activity, ChevronDown,
  Utensils, Apple, Coffee, Moon, Sun, ShieldCheck, Sparkles, Droplets
} from 'lucide-react';
import api from '../../utils/api';

interface ClientWorkplanItem {
  customer: {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    fitnessGoal?: string;
  };
  plan?: {
    id: string;
    name: string;
    status: string;
    totalExercises?: number;
    totalMeals?: number;
  };
  dayBreakdown?: Record<string, {
    day: string;
    focus?: string;
    totalExercises?: number;
    completedExercises?: number;
    completedSets?: number;
    totalMinutes?: number;
    totalMeals?: number;
    completedMeals?: number;
    targetCalories?: number;
    consumedCalories?: number;
    targetProtein?: number;
    consumedProtein?: number;
    completionPercentage: number;
    meals?: any[];
  }>;
  stats: {
    totalWorkouts?: number;
    weeklyWorkoutCount?: number;
    totalExercisesCompleted?: number;
    completedSets?: number;
    totalMinutes?: number;
    totalMealsPlanned?: number;
    totalMealsCompleted?: number;
    totalCaloriesLogged?: number;
    totalProteinLogged?: number;
    completionPercentage: number;
    pendingExercises?: number;
    pendingMeals?: number;
  };
  lastActive?: string;
}

const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TrainerCustomerWorkplansCompleted: React.FC = () => {
  // Plan type toggle: 'workout' or 'diet'
  const [activePlanType, setActivePlanType] = useState<'workout' | 'diet'>('workout');

  // Workout state
  const [workoutClients, setWorkoutClients] = useState<ClientWorkplanItem[]>([]);
  const [workoutActivity, setWorkoutActivity] = useState<any[]>([]);

  // Diet state
  const [dietClients, setDietClients] = useState<ClientWorkplanItem[]>([]);
  const [dietActivity, setDietActivity] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  // Customer Detail Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [modalSelectedDay, setModalSelectedDay] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [activePlanType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activePlanType === 'workout') {
        const res = await api.get('/workout-progress/trainer/clients-overview');
        if (res.data.success) {
          setWorkoutClients(res.data.clients || []);
          setWorkoutActivity(res.data.recentActivity || []);
        }
      } else {
        const res = await api.get('/diet-progress/trainer/clients-overview');
        if (res.data.success) {
          setDietClients(res.data.clients || []);
          setDietActivity(res.data.recentActivity || []);
        }
      }
    } catch (err) {
      console.error('Failed to load progress overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (customerId: string, defaultDay?: string) => {
    setSelectedCustomerId(customerId);
    const initialDay = defaultDay || (selectedDay !== 'all' ? selectedDay : 'Monday');
    setModalSelectedDay(initialDay);
    setLoadingDetail(true);
    try {
      if (activePlanType === 'workout') {
        const res = await api.get(`/workout-progress/customer/${customerId}`);
        if (res.data.success) {
          setCustomerDetail(res.data);
        }
      } else {
        const res = await api.get(`/diet-progress/customer/${customerId}`);
        if (res.data.success) {
          setCustomerDetail(res.data);
        }
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const rawClients = activePlanType === 'workout' ? workoutClients : dietClients;
  const currentClients = rawClients.filter(c => {
    const name = (c.customer?.name || '').toLowerCase().trim();
    if (name.includes('arun') || name.includes('naveen')) return false;
    return true;
  });

  // Filter clients
  const filteredClients = currentClients.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.customer.name.toLowerCase().includes(q) ||
      c.customer.email.toLowerCase().includes(q) ||
      (c.plan?.name || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'completed') return c.stats.completionPercentage === 100;
    if (statusFilter === 'in_progress') return c.stats.completionPercentage > 0 && c.stats.completionPercentage < 100;

    return true;
  });

  // Aggregated Stats
  const totalAssignedClients = currentClients.length;
  const avgCompletionRate = totalAssignedClients > 0
    ? Math.round(currentClients.reduce((acc, c) => acc + c.stats.completionPercentage, 0) / totalAssignedClients)
    : 0;

  // Workout specific stats
  const totalCompletedExercises = workoutClients.reduce((acc, c) => acc + (c.stats.totalExercisesCompleted || 0), 0);
  const totalHoursLogged = Math.round(workoutClients.reduce((acc, c) => acc + (c.stats.totalMinutes || 0), 0) / 60);

  // Diet specific stats
  const totalCompletedMeals = dietClients.reduce((acc, c) => acc + (c.stats.totalMealsCompleted || 0), 0);
  const totalCaloriesLogged = dietClients.reduce((acc, c) => acc + (c.stats.totalCaloriesLogged || 0), 0);

  const getMealIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('morning') || lower.includes('hydration')) return <Sun size={15} className="text-amber-500" />;
    if (lower.includes('breakfast')) return <Coffee size={15} className="text-orange-500" />;
    if (lower.includes('lunch')) return <Utensils size={15} className="text-emerald-500" />;
    if (lower.includes('dinner')) return <Moon size={15} className="text-indigo-500" />;
    return <Apple size={15} className="text-rose-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* ── Top Header Banner with Mode Switcher ── */}
      <div className="bg-white border border-[#D9E2E3] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              activePlanType === 'workout' ? 'bg-orange-100 text-[#116660]' : 'bg-emerald-100 text-emerald-700'
            }`}>
              <CheckCircle2 size={13} />
              <span>{activePlanType === 'workout' ? 'Customer Workplan Monitoring' : 'Customer Diet Monitoring'}</span>
            </span>
            <span className="text-xs text-[#697778] font-semibold">
              • {activePlanType === 'workout' ? 'Live Workout Progress' : 'Live Nutrition & Diet Progress'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#344B4A] tracking-tight">
            {activePlanType === 'workout' ? 'Customer Workplan Completed' : 'Customer Diet Work Plan Completed'}
          </h1>
          <p className="text-xs md:text-sm text-[#697778] mt-1 max-w-2xl">
            {activePlanType === 'workout'
              ? 'Track day-wise workout plan completed details for all your assigned clients. Inspect completed animated sets, repetition adherence, and training streak.'
              : 'Track day-wise diet plan completed details and nutrition adherence for all your assigned clients. Inspect completed meals, calories consumed, and macro goals.'}
          </p>
        </div>

        {/* ── Option Switcher: Workout Plan vs Diet Work Plan ── */}
        <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shrink-0 shadow-inner">
          <button
            onClick={() => {
              setActivePlanType('workout');
              setSelectedDay('all');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activePlanType === 'workout'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Dumbbell size={16} />
            <span>Workout Plan</span>
          </button>
          <button
            onClick={() => {
              setActivePlanType('diet');
              setSelectedDay('all');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              activePlanType === 'diet'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Utensils size={16} />
            <span>Diet Work Plan</span>
          </button>
        </div>
      </div>

      {/* ── 4 Key Overview Metrics Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D9E2E3] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-[#697778] uppercase tracking-wider">Clients Monitored</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              activePlanType === 'workout' ? 'bg-orange-50 text-[#167D78]' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <UserCheck size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#344B4A]">{totalAssignedClients}</span>
          <span className="text-[11px] text-[#697778] font-semibold block mt-1">Assigned Members</span>
        </div>

        <div className="bg-white border border-[#D9E2E3] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-[#697778] uppercase tracking-wider">
              {activePlanType === 'workout' ? 'Avg Plan Adherence' : 'Avg Diet Adherence'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700">{avgCompletionRate}%</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Average Completion</span>
        </div>

        <div className="bg-white border border-[#D9E2E3] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-[#697778] uppercase tracking-wider">
              {activePlanType === 'workout' ? 'Exercises Done' : 'Meals Completed'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#167D78] flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-blue-700">
            {activePlanType === 'workout' ? totalCompletedExercises : totalCompletedMeals}
          </span>
          <span className="text-[11px] text-[#697778] font-semibold block mt-1">
            {activePlanType === 'workout' ? 'Across All Workplans' : 'Across All Diet Plans'}
          </span>
        </div>

        <div className="bg-white border border-[#D9E2E3] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-[#697778] uppercase tracking-wider">
              {activePlanType === 'workout' ? 'Total Training Hours' : 'Calories Logged'}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              activePlanType === 'workout' ? 'bg-amber-50 text-amber-600' : 'bg-orange-50 text-orange-600'
            }`}>
              {activePlanType === 'workout' ? <Clock size={16} /> : <Flame size={16} />}
            </div>
          </div>
          <span className={`text-2xl sm:text-3xl font-black ${
            activePlanType === 'workout' ? 'text-amber-700' : 'text-orange-700'
          }`}>
            {activePlanType === 'workout' ? `${totalHoursLogged} hrs` : `${totalCaloriesLogged.toLocaleString()} kcal`}
          </span>
          <span className="text-[11px] text-[#697778] font-semibold block mt-1">
            {activePlanType === 'workout' ? 'Logged In Gym & App' : 'Nutritional Intake'}
          </span>
        </div>
      </div>

      {/* ── Filters and Day Selector Bar ── */}
      <div className="bg-white border border-[#D9E2E3] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder={activePlanType === 'workout' ? "Search by client name, email or workout..." : "Search by client name, email or diet plan..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#E8EFF0] border border-[#D9E2E3] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#167D78]/30 focus:border-[#167D78]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'completed' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                100% Completed
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'in_progress' ? 'bg-white text-orange-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                In Progress
              </button>
            </div>

            {/* Dropdown Options for Day-Wise Completed Details */}
            <div className="relative min-w-[240px]">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className={`w-full bg-[#E8EFF0] border text-[#344B4A] text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 shadow-xs cursor-pointer appearance-none pr-9 transition-colors ${
                  activePlanType === 'workout'
                    ? 'border-orange-200 hover:border-[#167D78] focus:ring-[#167D78]/30'
                    : 'border-emerald-200 hover:border-emerald-500 focus:ring-emerald-500/30'
                }`}
              >
                <option value="all">
                  📅 {activePlanType === 'workout' ? 'All Days Completed Overview' : 'All Days Diet Overview'}
                </option>
                {DAYS_LIST.map((d) => (
                  <option key={d} value={d}>
                    {activePlanType === 'workout' ? `💪 ${d} Workplan Details` : `🥗 ${d} Diet Plan Details`}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                <ChevronDown size={15} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Day Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#D9E2E3] custom-scrollbar">
          <span className="text-[10px] uppercase font-bold text-stone-400 mr-1 shrink-0">Day Filter:</span>
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              selectedDay === 'all'
                ? 'bg-[#344B4A] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Days
          </button>
          {DAYS_LIST.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                selectedDay === d
                  ? activePlanType === 'workout' ? 'bg-[#167D78] text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* ── Client Cards Grid ── */}
      {loading ? (
        <div className="bg-white border border-[#D9E2E3] rounded-2xl p-12 text-center text-[#697778]">
          <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-2 ${
            activePlanType === 'workout' ? 'border-[#167D78]' : 'border-emerald-600'
          }`} />
          <p className="text-xs font-semibold">
            Loading customer {activePlanType === 'workout' ? 'workplan' : 'diet plan'} records...
          </p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white border border-dashed border-[#D9E2E3] rounded-2xl p-12 text-center text-[#697778]">
          {activePlanType === 'workout' ? (
            <Dumbbell size={36} className="mx-auto text-stone-600 mb-2" />
          ) : (
            <Utensils size={36} className="mx-auto text-stone-600 mb-2" />
          )}
          <h4 className="font-bold text-stone-800 text-base">
            No Customer {activePlanType === 'workout' ? 'Workplan' : 'Diet Plan'} Records Found
          </h4>
          <p className="text-xs text-stone-500 mt-1">Try adjusting your search query or day filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const hasPlan = !!client.plan?.name;
            const isDayFilter = selectedDay !== 'all';
            const dayStats = isDayFilter && client.dayBreakdown ? client.dayBreakdown[selectedDay] : null;

            const completionPct = dayStats
              ? dayStats.completionPercentage
              : (client.stats.completionPercentage || 0);

            // Workout numbers
            const exercisesDone = dayStats
              ? `${dayStats.completedExercises || 0} / ${dayStats.totalExercises || 0}`
              : `${client.stats.totalExercisesCompleted || 0} / ${client.plan?.totalExercises || 0}`;

            const pendingWorkoutCount = dayStats
              ? Math.max(0, (dayStats.totalExercises || 0) - (dayStats.completedExercises || 0))
              : (client.stats.pendingExercises || 0);

            const completedSets = dayStats
              ? dayStats.completedSets || 0
              : client.stats.completedSets || 0;

            const timeLogged = dayStats
              ? dayStats.totalMinutes || 0
              : client.stats.totalMinutes || 0;

            // Diet numbers
            const mealsDone = dayStats
              ? `${dayStats.completedMeals || 0} / ${dayStats.totalMeals || 6}`
              : `${client.stats.totalMealsCompleted || 0} / ${client.stats.totalMealsPlanned || 42}`;

            const pendingMealCount = dayStats
              ? Math.max(0, (dayStats.totalMeals || 6) - (dayStats.completedMeals || 0))
              : (client.stats.pendingMeals || 0);

            const caloriesLogged = dayStats
              ? dayStats.consumedCalories || 0
              : client.stats.totalCaloriesLogged || 0;

            const proteinLogged = dayStats
              ? dayStats.consumedProtein || 0
              : client.stats.totalProteinLogged || 0;

            return (
              <div
                key={client.customer.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group ${
                  activePlanType === 'workout'
                    ? 'border-[#D9E2E3] hover:border-orange-300'
                    : 'border-[#D9E2E3] hover:border-emerald-300'
                }`}
              >
                <div>
                  {/* Customer Card Header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl text-white font-black flex items-center justify-center text-sm overflow-hidden shrink-0 shadow-xs ${
                        activePlanType === 'workout' ? 'bg-[#167D78]' : 'bg-emerald-600'
                      }`}>
                        {client.customer.profilePhoto ? (
                          <img src={client.customer.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          client.customer.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className={`font-extrabold text-base text-[#344B4A] truncate transition-colors ${
                          activePlanType === 'workout' ? 'group-hover:text-[#167D78]' : 'group-hover:text-emerald-600'
                        }`}>
                          {client.customer.name}
                        </h3>
                        <p className="text-xs text-[#697778] truncate">{client.customer.fitnessGoal || client.customer.email}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      completionPct === 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : completionPct > 0
                        ? activePlanType === 'workout' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-700'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {isDayFilter ? `${selectedDay}: ` : ''}{completionPct}% Done
                    </span>
                  </div>

                  {/* Assigned Plan Banner */}
                  <div className="bg-[#E8EFF0] p-3 rounded-xl border border-[#D9E2E3] mb-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] uppercase font-bold text-[#697778]">
                        {isDayFilter ? `${selectedDay} ${activePlanType === 'workout' ? 'Routine' : 'Diet'}` : (activePlanType === 'workout' ? 'Assigned Workplan' : 'Assigned Diet Plan')}
                      </span>
                      {isDayFilter && dayStats?.focus && (
                        <span className={`text-[10px] font-bold truncate max-w-[160px] ${
                          activePlanType === 'workout' ? 'text-[#167D78]' : 'text-emerald-600'
                        }`}>
                          {dayStats.focus}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-extrabold text-[#344B4A] truncate">
                      {hasPlan ? client.plan?.name : (activePlanType === 'workout' ? 'No active workout plan assigned' : '7-Day Nutrition & Macro Diet Plan')}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#697778]">
                        {isDayFilter ? `${selectedDay} Completion Rate` : 'Plan Completion Rate'}
                      </span>
                      <span className={activePlanType === 'workout' ? 'text-[#167D78]' : 'text-emerald-600'}>
                        {completionPct}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          activePlanType === 'workout'
                            ? 'bg-gradient-to-r from-[#167D78] to-emerald-500'
                            : 'bg-gradient-to-r from-emerald-400 to-teal-600'
                        }`}
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* 4 Stats Grid */}
                  {activePlanType === 'workout' ? (
                    <div className="grid grid-cols-2 gap-2 text-center mb-4 text-xs">
                      <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">
                          {isDayFilter ? `${selectedDay} Done` : 'Exercises Done'}
                        </span>
                        <strong className="text-sm font-black text-stone-900">
                          {exercisesDone}
                        </strong>
                      </div>

                      <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Pending</span>
                        <strong className="text-sm font-black text-amber-700">
                          {pendingWorkoutCount} Routines
                        </strong>
                      </div>

                      <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Sets Completed</span>
                        <strong className="text-sm font-black text-stone-900">
                          {completedSets} Sets
                        </strong>
                      </div>

                      <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Time Logged</span>
                        <strong className="text-sm font-black text-emerald-700">
                          {timeLogged} mins
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 text-center mb-4 text-xs">
                      <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">
                          {isDayFilter ? `${selectedDay} Meals` : 'Meals Done'}
                        </span>
                        <strong className="text-sm font-black text-emerald-800">
                          {mealsDone}
                        </strong>
                      </div>

                      <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Pending</span>
                        <strong className="text-sm font-black text-amber-700">
                          {pendingMealCount} Meals
                        </strong>
                      </div>

                      <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Calories Logged</span>
                        <strong className="text-sm font-black text-orange-700">
                          {caloriesLogged} kcal
                        </strong>
                      </div>

                      <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block">Protein Intake</span>
                        <strong className="text-sm font-black text-indigo-700">
                          {proteinLogged}g
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Last Active Timestamp */}
                  <div className="text-[11px] text-stone-500 flex items-center justify-between mb-3">
                    <span>
                      {activePlanType === 'workout'
                        ? `Weekly: ${client.stats.weeklyWorkoutCount || 0} workouts/wk`
                        : `Plan: 7-Day Nutrition`}
                    </span>
                    <span>{client.lastActive ? `Active ${new Date(client.lastActive).toLocaleDateString()}` : 'Not started yet'}</span>
                  </div>
                </div>

                {/* Inspect Action Button */}
                <div className="pt-3 border-t border-[#D9E2E3]">
                  <button
                    onClick={() => handleOpenDetail(client.customer.id, selectedDay)}
                    className={`w-full py-2.5 bg-[#E8EFF0] text-[#344B4A] text-xs font-bold rounded-xl border border-[#D9E2E3] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activePlanType === 'workout'
                        ? 'hover:bg-[#D8EAE7]/40 group-hover:border-[#167D78]'
                        : 'hover:bg-emerald-50 group-hover:border-emerald-500'
                    }`}
                  >
                    <span>
                      {activePlanType === 'workout'
                        ? `Inspect ${isDayFilter ? `${selectedDay} Workplan` : 'Completed Workplan'}`
                        : `Inspect ${isDayFilter ? `${selectedDay} Diet Plan` : 'Completed Diet Plan'}`}
                    </span>
                    <ChevronRight size={14} className={activePlanType === 'workout' ? 'text-[#167D78]' : 'text-emerald-600'} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Inspection Modal: Workplan or Diet Plan Completed Details ── */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#D9E2E3] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#D9E2E3] flex justify-between items-center bg-[#E8EFF0]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    activePlanType === 'workout' ? 'bg-orange-100 text-[#116660]' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {activePlanType === 'workout' ? 'Customer Workplan Completed Log' : 'Customer Diet Plan Completed Log'}
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">
                    • {modalSelectedDay === 'all' ? 'All Days' : `${modalSelectedDay} Routine`}
                  </span>
                </div>
                <h3 className="text-xl font-black text-stone-900">
                  {customerDetail?.customer?.name || 'Customer Progress'}
                </h3>
                <p className="text-xs text-stone-500">
                  {customerDetail?.customer?.email} • {customerDetail?.customer?.fitnessGoal || 'General Fitness'}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingDetail || !customerDetail ? (
                <div className="py-12 text-center text-stone-500">
                  <div className={`w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-2 ${
                    activePlanType === 'workout' ? 'border-[#167D78]' : 'border-emerald-600'
                  }`} />
                  <p className="text-xs font-semibold">Loading detailed records...</p>
                </div>
              ) : activePlanType === 'diet' ? (
                /* ── DIET INSPECTION DETAILS ── */
                <>
                  {/* Modal Day Filter Pills */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                      Select Day to View Completed Meals:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <button
                        onClick={() => setModalSelectedDay('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          modalSelectedDay === 'all'
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        All Days Overview
                      </button>
                      {DAYS_LIST.map((d) => (
                        <button
                          key={d}
                          onClick={() => setModalSelectedDay(d)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            modalSelectedDay === d
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day-Wise Meals Details */}
                  {(() => {
                    const daysToDisplay = modalSelectedDay === 'all' ? DAYS_LIST : [modalSelectedDay];

                    return (
                      <div className="space-y-6">
                        {daysToDisplay.map((dayName) => {
                          const dayData = customerDetail.dayBreakdown?.[dayName];
                          if (!dayData) return null;

                          return (
                            <div key={dayName} className="border border-stone-200 rounded-2xl overflow-hidden">
                              <div className="p-4 bg-emerald-50/70 border-b border-stone-200 flex flex-wrap justify-between items-center gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-stone-900">{dayName}</span>
                                    <span className="text-xs text-emerald-800 font-semibold">• {dayData.focus}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-600">
                                    <span>Target: <strong>{dayData.targetCalories} kcal</strong></span>
                                    <span>Consumed: <strong className="text-emerald-700">{dayData.consumedCalories} kcal</strong></span>
                                    <span>Protein: <strong className="text-indigo-700">{dayData.consumedProtein}g / {dayData.targetProtein}g</strong></span>
                                  </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                                  dayData.completionPercentage === 100
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : 'bg-stone-200 text-stone-800'
                                }`}>
                                  {dayData.completedMeals} / {dayData.totalMeals} Meals ({dayData.completionPercentage}%)
                                </span>
                              </div>

                              <div className="divide-y divide-stone-100">
                                {(dayData.meals || []).map((m: any) => (
                                  <div
                                    key={m.id}
                                    className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                                      m.completed ? 'bg-emerald-50/20' : 'bg-white'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                        m.completed ? 'bg-emerald-600 text-white' : 'border-2 border-stone-300 text-transparent'
                                      }`}>
                                        <CheckCircle2 size={16} />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          {getMealIcon(m.type)}
                                          <span className="text-xs font-bold text-stone-500 uppercase">{m.time}</span>
                                          <span className="font-extrabold text-sm text-stone-900">{m.type}</span>
                                        </div>
                                        <ul className="mt-1.5 space-y-0.5">
                                          {(m.items || []).map((item: string, i: number) => (
                                            <li key={i} className="text-xs text-stone-600 flex items-center gap-1.5">
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                              <span>{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="text-xs font-black text-stone-900 block">{m.calories} kcal</span>
                                      <span className="text-[10px] text-stone-500 block">P: {m.protein}g • C: {m.carbs}g • F: {m.fats}g</span>
                                      {m.completed && (
                                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                          ✓ Completed
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </>
              ) : (
                /* ── WORKOUT INSPECTION DETAILS ── */
                <>
                  {/* Modal Day Filter Pills */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                      Select Day to View Completed Workplan:
                    </span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <button
                        onClick={() => setModalSelectedDay('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                          modalSelectedDay === 'all'
                            ? 'bg-stone-900 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        All Days Overview
                      </button>
                      {DAYS_LIST.map((d) => (
                        <button
                          key={d}
                          onClick={() => setModalSelectedDay(d)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            modalSelectedDay === d
                              ? 'bg-[#167D78] text-white shadow-xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day-Wise Workout Breakdown Cards */}
                  {(() => {
                    const daysToDisplay = modalSelectedDay === 'all' ? DAYS_LIST : [modalSelectedDay];

                    return (
                      <div className="space-y-6">
                        {daysToDisplay.map((dayName) => {
                          const dayData = customerDetail.dayBreakdown?.[dayName];
                          if (!dayData) return null;

                          return (
                            <div key={dayName} className="border border-stone-200 rounded-2xl overflow-hidden">
                              <div className="p-4 bg-orange-50/70 border-b border-stone-200 flex flex-wrap justify-between items-center gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sm text-stone-900">{dayName}</span>
                                    <span className="text-xs text-[#116660] font-semibold">• {dayData.focus || 'Workout Routine'}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-600">
                                    <span>Completed Exercises: <strong className="text-emerald-700">{dayData.completedExercises}</strong> / {dayData.totalExercises}</span>
                                    <span>Sets: <strong className="text-stone-900">{dayData.completedSets}</strong></span>
                                  </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                                  dayData.completionPercentage === 100
                                    ? 'bg-emerald-200 text-emerald-900'
                                    : 'bg-stone-200 text-stone-800'
                                }`}>
                                  {dayData.completionPercentage}% Done
                                </span>
                              </div>

                              <div className="divide-y divide-stone-100">
                                {(dayData.exercises || []).map((ex: any) => (
                                  <div
                                    key={ex.exerciseId}
                                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                                      ex.isCompleted ? 'bg-emerald-50/20' : 'bg-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                        ex.isCompleted ? 'bg-emerald-600 text-white' : 'border-2 border-stone-300 text-transparent'
                                      }`}>
                                        <CheckCircle2 size={16} />
                                      </div>
                                      <div>
                                        <span className="font-extrabold text-sm text-stone-900 block">{ex.name}</span>
                                        <span className="text-xs text-stone-500">
                                          {ex.sets} sets • {ex.reps} reps • {ex.targetMuscle}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <span className="text-xs font-black text-stone-900 block">
                                        {ex.isCompleted ? `${ex.completedSets || ex.sets} Sets Done` : 'Pending'}
                                      </span>
                                      {ex.completedAt && (
                                        <span className="text-[10px] text-stone-500 block">
                                          {new Date(ex.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerCustomerWorkplansCompleted;
