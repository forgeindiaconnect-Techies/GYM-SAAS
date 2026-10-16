import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Search, Calendar, ChevronRight, X, Clock,
  Dumbbell, Filter, Flame, UserCheck, Activity, ChevronDown
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
    totalExercises: number;
  };
  dayBreakdown?: Record<string, {
    day: string;
    focus?: string;
    totalExercises: number;
    completedExercises: number;
    completedSets: number;
    totalMinutes: number;
    completionPercentage: number;
  }>;
  stats: {
    totalWorkouts: number;
    weeklyWorkoutCount: number;
    totalExercisesCompleted: number;
    completedSets: number;
    totalMinutes: number;
    completionPercentage: number;
    pendingExercises: number;
  };
  lastActive?: string;
}

const DAYS_LIST = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TrainerCustomerWorkplansCompleted: React.FC = () => {
  const [clients, setClients] = useState<ClientWorkplanItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
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
    fetchClientsOverview();
  }, []);

  const fetchClientsOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workout-progress/trainer/clients-overview');
      if (res.data.success) {
        setClients(res.data.clients || []);
        setRecentActivity(res.data.recentActivity || []);
      }
    } catch (err) {
      console.error('Failed to load clients progress overview:', err);
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
      const res = await api.get(`/workout-progress/customer/${customerId}`);
      if (res.data.success) {
        setCustomerDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
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
  const totalAssignedClients = clients.length;
  const avgCompletionRate = totalAssignedClients > 0
    ? Math.round(clients.reduce((acc, c) => acc + c.stats.completionPercentage, 0) / totalAssignedClients)
    : 0;
  const totalCompletedExercises = clients.reduce((acc, c) => acc + c.stats.totalExercisesCompleted, 0);
  const totalHoursLogged = Math.round(clients.reduce((acc, c) => acc + c.stats.totalMinutes, 0) / 60);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* ── Top Header Banner ── */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 text-[#EA580C] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              <span>Customer Workplan Monitoring</span>
            </span>
            <span className="text-xs text-[#78716C] font-semibold">• Live Workout Progress</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#292524] tracking-tight">
            Customer Workplan Completed
          </h1>
          <p className="text-xs md:text-sm text-[#78716C] mt-1 max-w-2xl">
            Track day-wise workout plan completed details for all your assigned clients. Inspect completed animated sets, repetition adherence, and training streak.
          </p>
        </div>
      </div>

      {/* ── 4 Key Overview Metrics Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Clients Monitored</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#F97316] flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#292524]">{totalAssignedClients}</span>
          <span className="text-[11px] text-[#78716C] font-semibold block mt-1">Assigned Members</span>
        </div>

        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Avg Plan Adherence</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700">{avgCompletionRate}%</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Average Completion</span>
        </div>

        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Exercises Done</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-blue-700">{totalCompletedExercises}</span>
          <span className="text-[11px] text-[#78716C] font-semibold block mt-1">Across All Workplans</span>
        </div>

        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">Total Training Hours</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-700">{totalHoursLogged} hrs</span>
          <span className="text-[11px] text-[#78716C] font-semibold block mt-1">Logged In Gym &amp; App</span>
        </div>
      </div>

      {/* ── Filters and Day Selector Bar ── */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Search by client name, email or plan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 focus:border-[#F97316]"
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

            {/* Dropdown Options for Day-Wise Workplan Completed Details */}
            <div className="relative min-w-[240px]">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full bg-[#FFFDF8] border border-orange-200 hover:border-[#F97316] text-[#292524] text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 shadow-xs cursor-pointer appearance-none pr-9 transition-colors"
              >
                <option value="all">📅 All Days Completed Overview</option>
                <option value="Monday">💪 Monday Workplan Details</option>
                <option value="Tuesday">🏋️ Tuesday Workplan Details</option>
                <option value="Wednesday">🦵 Wednesday Workplan Details</option>
                <option value="Thursday">⚡ Thursday Workplan Details</option>
                <option value="Friday">🔥 Friday Workplan Details</option>
                <option value="Saturday">🏃 Saturday Workplan Details</option>
                <option value="Sunday">🧘 Sunday Workplan Details</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                <ChevronDown size={15} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Day Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#F5F5F4] custom-scrollbar">
          <span className="text-[10px] uppercase font-bold text-stone-400 mr-1 shrink-0">Day Filter:</span>
          <button
            onClick={() => setSelectedDay('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              selectedDay === 'all'
                ? 'bg-[#292524] text-white shadow-xs'
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
                  ? 'bg-[#F97316] text-white shadow-xs'
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
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#78716C]">
          <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">Loading customer workplan records...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E7E5E4] rounded-2xl p-12 text-center text-[#78716C]">
          <Dumbbell size={36} className="mx-auto text-stone-600 mb-2" />
          <h4 className="font-bold text-stone-800 text-base">No Customer Workplan Records Found</h4>
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

            const exercisesDone = dayStats
              ? `${dayStats.completedExercises} / ${dayStats.totalExercises}`
              : `${client.stats.totalExercisesCompleted} / ${client.plan?.totalExercises || 0}`;

            const pendingCount = dayStats
              ? Math.max(0, dayStats.totalExercises - dayStats.completedExercises)
              : client.stats.pendingExercises;

            const completedSets = dayStats
              ? dayStats.completedSets
              : client.stats.completedSets;

            const timeLogged = dayStats
              ? dayStats.totalMinutes
              : client.stats.totalMinutes;

            return (
              <div
                key={client.customer.id}
                className="bg-white border border-[#E7E5E4] hover:border-orange-300 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Customer Card Header */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#F97316] text-white font-black flex items-center justify-center text-sm overflow-hidden shrink-0 shadow-xs">
                        {client.customer.profilePhoto ? (
                          <img src={client.customer.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          client.customer.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-base text-[#292524] truncate group-hover:text-[#F97316] transition-colors">
                          {client.customer.name}
                        </h3>
                        <p className="text-xs text-[#78716C] truncate">{client.customer.fitnessGoal || client.customer.email}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${
                      completionPct === 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : completionPct > 0
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {isDayFilter ? `${selectedDay}: ` : ''}{completionPct}% Done
                    </span>
                  </div>

                  {/* Assigned Plan Banner */}
                  <div className="bg-[#FFFDF8] p-3 rounded-xl border border-[#E7E5E4] mb-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] uppercase font-bold text-[#78716C]">
                        {isDayFilter ? `${selectedDay} Routine` : 'Assigned Workplan'}
                      </span>
                      {isDayFilter && dayStats?.focus && (
                        <span className="text-[10px] text-[#F97316] font-bold truncate max-w-[160px]">
                          {dayStats.focus}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-extrabold text-[#292524] truncate">
                      {hasPlan ? client.plan?.name : 'No active workout plan assigned'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#78716C]">
                        {isDayFilter ? `${selectedDay} Completion Rate` : 'Plan Completion Rate'}
                      </span>
                      <span className="text-[#F97316]">{completionPct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#F97316] to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${completionPct}%` }}
                      />
                    </div>
                  </div>

                  {/* 4 Stats Grid */}
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
                        {pendingCount} Routines
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

                  {/* Last Active Timestamp */}
                  <div className="text-[11px] text-stone-500 flex items-center justify-between mb-3">
                    <span>Weekly: <strong>{client.stats.weeklyWorkoutCount} workouts/wk</strong></span>
                    <span>{client.lastActive ? `Active ${new Date(client.lastActive).toLocaleDateString()}` : 'Not started yet'}</span>
                  </div>
                </div>

                {/* Inspect Action Button */}
                <div className="pt-3 border-t border-[#F5F5F4]">
                  <button
                    onClick={() => handleOpenDetail(client.customer.id, selectedDay)}
                    className="w-full py-2.5 bg-[#FFFDF8] hover:bg-[#FED7AA]/40 text-[#292524] text-xs font-bold rounded-xl border border-[#E7E5E4] transition-all flex items-center justify-center gap-1.5 cursor-pointer group-hover:border-[#F97316]"
                  >
                    <span>Inspect {isDayFilter ? `${selectedDay} Workplan` : 'Completed Workplan'}</span>
                    <ChevronRight size={14} className="text-[#F97316]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Inspection Modal: Day-Wise Workplan Completed Details ── */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#E7E5E4] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#EA580C]">
                    Customer Workplan Completed Log
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">
                    • {modalSelectedDay === 'all' ? 'All Days' : `${modalSelectedDay} Routine`}
                  </span>
                </div>
                <h3 className="font-black text-lg sm:text-xl text-[#292524]">
                  {modalSelectedDay === 'all' ? 'All Completed Routines' : `${modalSelectedDay} Workout Completed Details`}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {loadingDetail ? (
                <div className="text-center py-12 text-[#78716C]">
                  <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold">Loading completed routines...</p>
                </div>
              ) : !customerDetail ? (
                <div className="text-center py-10 text-rose-600 text-sm">Failed to load customer details.</div>
              ) : (
                <>
                  {/* Modal Day Selector Quick Pills */}
                  <div className="bg-[#FFFDF8] p-4 rounded-2xl border border-[#E7E5E4] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">Select Workout Day to Inspect:</span>
                      <span className="text-[11px] text-[#F97316] font-bold">
                        {modalSelectedDay === 'all' ? 'Viewing All 7 Days' : `Viewing ${modalSelectedDay}'s Routine`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                      <button
                        onClick={() => setModalSelectedDay('all')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          modalSelectedDay === 'all'
                            ? 'bg-[#292524] text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        All Days Combined
                      </button>
                      {DAYS_LIST.map((d) => (
                        <button
                          key={d}
                          onClick={() => setModalSelectedDay(d)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            modalSelectedDay.toLowerCase() === d.toLowerCase()
                              ? 'bg-[#F97316] text-white shadow-xs'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Bar */}
                  {(() => {
                    const isDay = modalSelectedDay !== 'all';
                    const dayData = isDay && customerDetail.dayBreakdown ? customerDetail.dayBreakdown[modalSelectedDay] : null;

                    const exercisesDone = dayData
                      ? `${dayData.completedExercises} / ${dayData.totalExercises}`
                      : `${customerDetail.stats?.completedCount || 0} / ${customerDetail.stats?.totalPlanExercises || 0}`;

                    const adherenceRate = dayData
                      ? `${dayData.completionPercentage}%`
                      : `${customerDetail.stats?.completionPercentage || 0}%`;

                    const completedSets = dayData
                      ? `${dayData.completedSets} Sets`
                      : `${customerDetail.stats?.totalExercisesCompleted || 0} Exercises`;

                    const timeLogged = dayData
                      ? `${dayData.totalDurationMinutes} min`
                      : `${customerDetail.stats?.totalWorkoutMinutes || 0} min`;

                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">
                            {isDay ? `${modalSelectedDay} Exercises` : 'Total Completed'}
                          </span>
                          <strong className="text-lg font-black text-stone-900">{exercisesDone}</strong>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">
                            {isDay ? `${modalSelectedDay} Adherence` : 'Plan Adherence'}
                          </span>
                          <strong className="text-lg font-black text-emerald-700">{adherenceRate}</strong>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">
                            {isDay ? 'Sets Logged' : 'Workouts Logged'}
                          </span>
                          <strong className="text-lg font-black text-stone-900">{completedSets}</strong>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">
                            Time Spent
                          </span>
                          <strong className="text-lg font-black text-[#F97316]">{timeLogged}</strong>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Plan Exercise List filtered by modalSelectedDay */}
                  {(() => {
                    const filteredExercises = (customerDetail.planExerciseList || []).filter((pe: any) =>
                      modalSelectedDay === 'all' || (pe.day || '').toLowerCase().includes(modalSelectedDay.toLowerCase())
                    );

                    return (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-black uppercase tracking-wider text-stone-600">
                            {modalSelectedDay === 'all' ? 'All Assigned Plan Routines' : `${modalSelectedDay} Assigned Exercises`} ({filteredExercises.length})
                          </h4>
                          <span className="text-xs text-stone-500 font-semibold">
                            {filteredExercises.filter((pe: any) => pe.isCompleted).length} Completed • {filteredExercises.filter((pe: any) => !pe.isCompleted).length} Pending
                          </span>
                        </div>

                        {filteredExercises.length === 0 ? (
                          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center text-xs text-stone-500 font-medium">
                            No exercises scheduled for {modalSelectedDay}.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredExercises.map((pe: any, idx: number) => (
                              <div
                                key={idx}
                                className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border transition-all ${
                                  pe.isCompleted
                                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 shadow-xs'
                                    : 'bg-[#FFFDF8] border-stone-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                    pe.isCompleted ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-200 text-stone-700'
                                  }`}>
                                    {pe.isCompleted ? '✓' : idx + 1}
                                  </span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <strong className="text-sm font-extrabold text-[#292524]">{pe.name}</strong>
                                      {pe.targetMuscle && (
                                        <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-bold">
                                          {pe.targetMuscle}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-stone-500 text-xs font-medium">
                                      Day: <strong>{pe.day}</strong> • Target: {pe.sets} Sets × {pe.reps} Reps
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                  {pe.isCompleted ? (
                                    <div className="text-right">
                                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-xs">
                                        <CheckCircle2 size={12} className="text-emerald-700" /> Completed
                                      </span>
                                      <span className="block text-[11px] text-emerald-700 font-semibold mt-0.5">
                                        {pe.completedSets || pe.sets} sets logged • {Math.round(pe.duration || 60)}s
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-600 border border-stone-200">
                                      Pending
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Chronological History Log */}
                  {(() => {
                    const filteredHistory = (customerDetail.history || []).filter((h: any) => {
                      if (modalSelectedDay === 'all') return true;
                      return (h.dayName || '').toLowerCase().includes(modalSelectedDay.toLowerCase());
                    });

                    const historyToShow = filteredHistory.length > 0 ? filteredHistory : (customerDetail.history || []).slice(0, 8);

                    return (
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-stone-600 mb-2">
                          {modalSelectedDay === 'all' ? 'Recent Completed Exercise Timestamps' : `${modalSelectedDay} Completed Timestamps`}
                        </h4>
                        <div className="space-y-2">
                          {historyToShow.length === 0 ? (
                            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-center text-xs text-stone-500">
                              No completion logs recorded for {modalSelectedDay}.
                            </div>
                          ) : (
                            historyToShow.slice(0, 8).map((h: any) => (
                              <div
                                key={h._id}
                                className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                  <strong className="text-stone-900">{h.exerciseId?.name || 'Exercise'}</strong>
                                  <span className="text-stone-500">
                                    ({h.completedSets || 3} sets • {Math.round(h.duration || 60)}s)
                                  </span>
                                  {h.dayName && (
                                    <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded font-semibold">
                                      {h.dayName}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-stone-500 shrink-0">
                                  {new Date(h.completedAt).toLocaleString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
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
