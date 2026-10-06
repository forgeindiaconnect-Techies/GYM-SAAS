import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Search, CheckCircle2, Clock,
  ChevronRight, X, Activity, RefreshCw
} from 'lucide-react';
import api from '../../utils/api';

interface ClientProgress {
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

const TrainerMemberProgress: React.FC = () => {
  const [clients, setClients] = useState<ClientProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Detail Modal
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchClientsOverview();
  }, []);

  const fetchClientsOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workout-progress/trainer/clients-overview');
      if (res.data.success) {
        setClients(res.data.clients || []);
      }
    } catch (err) {
      console.error('Failed to load clients progress overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (customerId: string) => {
    setSelectedCustomerId(customerId);
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

  const filtered = clients.filter(c =>
    c.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    c.customer.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.plan?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#164A4A]/10 text-[#164A4A] flex items-center gap-1">
              <TrendingUp size={13} /> Real-Time Analytics
            </span>
            <span className="text-xs text-[#687B78]">• Workout Plan Compliance</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#202828] tracking-tight">
            Client Workout Progress
          </h1>
          <p className="text-sm text-[#455250] mt-1">
            Monitor client adherence to assigned workout routines, completed sets, workout streak, and exercise completion rate.
          </p>
        </div>

        <button
          onClick={fetchClientsOverview}
          className="px-4 py-2 bg-[#F2EFE8] hover:bg-[#E8E5DA] text-[#202828] rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
        >
          <RefreshCw size={14} /> Refresh Progress
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#687B78]" />
          <input
            type="text"
            placeholder="Search client by name, email, or assigned workout plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F9F8F6] border border-[#D3DFDA] rounded-xl text-sm outline-none focus:border-[#164A4A] text-[#202828]"
          />
        </div>
      </div>

      {/* Grid of Clients */}
      {loading ? (
        <div className="text-center py-20 text-[#687B78]">
          <div className="w-10 h-10 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-semibold text-sm">Loading client workout metrics...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-12 text-center">
          <Activity size={48} className="mx-auto text-[#A8ADA9] mb-3" />
          <h3 className="text-base font-bold text-[#202828]">No client workout activity found</h3>
          <p className="text-xs text-[#687B78] mt-1">
            When you create and publish workout plans for clients, their progress, sets completed, and streaks will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => {
            const hasPlan = !!item.plan?.name;
            const completionPct = item.stats.completionPercentage;

            return (
              <div
                key={item.customer.id}
                className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Customer Info */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#164A4A] text-white font-bold flex items-center justify-center text-sm overflow-hidden shrink-0">
                        {item.customer.profilePhoto ? (
                          <img src={item.customer.profilePhoto} alt="" className="w-full h-full object-cover" />
                        ) : (
                          item.customer.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-[#202828] truncate">{item.customer.name}</h3>
                        <p className="text-xs text-[#687B78] truncate">{item.customer.fitnessGoal || item.customer.email}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      item.plan?.status === 'Published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.plan?.status || 'No Plan'}
                    </span>
                  </div>

                  {/* Assigned Workout Plan Banner */}
                  <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D3DFDA] mb-4">
                    <span className="text-[10px] uppercase font-bold text-[#687B78] block">Assigned Workout Plan</span>
                    <p className="text-xs font-extrabold text-[#202828] truncate mt-0.5">
                      {hasPlan ? item.plan?.name : 'No active workout plan assigned'}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#455250]">Plan Completion Rate</span>
                      <span className="text-[#164A4A]">{completionPct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#E8E5DA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#164A4A] to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${completionPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* 4 Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center mb-4">
                    <div className="bg-[#F2EFE8]/70 p-2.5 rounded-xl border border-[#D3DFDA]">
                      <span className="text-[10px] uppercase font-bold text-[#687B78] block">Exercises Done</span>
                      <span className="text-sm font-extrabold text-[#202828]">
                        {item.stats.totalExercisesCompleted} / {item.plan?.totalExercises || 0}
                      </span>
                    </div>

                    <div className="bg-[#F2EFE8]/70 p-2.5 rounded-xl border border-[#D3DFDA]">
                      <span className="text-[10px] uppercase font-bold text-[#687B78] block">Pending Exercises</span>
                      <span className="text-sm font-extrabold text-amber-700">
                        {item.stats.pendingExercises}
                      </span>
                    </div>

                    <div className="bg-[#F2EFE8]/70 p-2.5 rounded-xl border border-[#D3DFDA]">
                      <span className="text-[10px] uppercase font-bold text-[#687B78] block">Completed Sets</span>
                      <span className="text-sm font-extrabold text-[#202828]">
                        {item.stats.completedSets} Sets
                      </span>
                    </div>

                    <div className="bg-[#F2EFE8]/70 p-2.5 rounded-xl border border-[#D3DFDA]">
                      <span className="text-[10px] uppercase font-bold text-[#687B78] block">Weekly Frequency</span>
                      <span className="text-sm font-extrabold text-emerald-700">
                        {item.stats.weeklyWorkoutCount} / wk
                      </span>
                    </div>
                  </div>

                  {/* Total Workout Time & Last Active */}
                  <div className="flex items-center justify-between text-[11px] text-[#687B78] mb-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> Total Time: <strong>{item.stats.totalMinutes} mins</strong>
                    </span>
                    <span>
                      {item.lastActive ? `Active ${new Date(item.lastActive).toLocaleDateString()}` : 'Not started yet'}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-3 border-t border-[#D3DFDA] mt-2">
                  <button
                    onClick={() => handleOpenDetail(item.customer.id)}
                    className="w-full py-2 bg-[#F2EFE8] hover:bg-[#E8E5DA] text-[#202828] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect Exercise Logs & Form</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#D3DFDA] overflow-hidden">
            <div className="p-5 border-b border-[#D3DFDA] flex justify-between items-center bg-[#F9F8F6]">
              <div>
                <h3 className="font-extrabold text-xl text-[#202828]">Client Workout History</h3>
                <p className="text-xs text-[#687B78]">
                  Detailed log of completed animated exercises, sets, repetitions, and timestamps
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-1.5 text-[#687B78] hover:text-[#202828] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {loadingDetail ? (
                <div className="text-center py-12 text-[#687B78]">
                  <div className="w-8 h-8 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs font-semibold">Loading exercise completion logs...</p>
                </div>
              ) : !customerDetail ? (
                <div className="text-center py-10 text-rose-600 text-sm">Failed to load details.</div>
              ) : (
                <>
                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D3DFDA] text-center">
                      <span className="text-[10px] uppercase font-bold text-[#687B78] block">Total Workouts</span>
                      <span className="text-lg font-extrabold text-[#202828]">
                        {customerDetail.stats?.totalWorkouts || 0}
                      </span>
                    </div>
                    <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D3DFDA] text-center">
                      <span className="text-[10px] uppercase font-bold text-[#687B78] block">Exercises Finished</span>
                      <span className="text-lg font-extrabold text-[#202828]">
                        {customerDetail.stats?.totalExercisesCompleted || 0}
                      </span>
                    </div>
                    <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D3DFDA] text-center">
                      <span className="text-[10px] uppercase font-bold text-[#687B78] block">Completion %</span>
                      <span className="text-lg font-extrabold text-emerald-700">
                        {customerDetail.stats?.completionPercentage || 0}%
                      </span>
                    </div>
                    <div className="bg-[#F9F8F6] p-3 rounded-xl border border-[#D3DFDA] text-center">
                      <span className="text-[10px] uppercase font-bold text-[#687B78] block">Time Spent</span>
                      <span className="text-lg font-extrabold text-[#164A4A]">
                        {customerDetail.stats?.totalWorkoutMinutes || 0} min
                      </span>
                    </div>
                  </div>

                  {/* Active Plan Days */}
                  {customerDetail.activePlan && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#687B78] mb-2">
                        Assigned Plan: {customerDetail.activePlan.planName}
                      </h4>
                      <div className="space-y-2">
                        {customerDetail.planExerciseList?.map((pe: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-[#F9F8F6] border border-[#D3DFDA] p-3 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#164A4A] text-white flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              <span className="font-bold text-[#202828]">{pe.name}</span>
                              <span className="text-[#687B78]">({pe.day})</span>
                            </div>
                            <span className="text-[#455250] font-semibold">
                              Target: {pe.sets} Sets × {pe.reps} Reps
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Activity History Logs */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#687B78] mb-2">
                      Recent Activity Logs
                    </h4>
                    {(!customerDetail.history || customerDetail.history.length === 0) ? (
                      <p className="text-xs text-[#687B78] italic">No exercise completion records logged yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {customerDetail.history.map((log: any) => (
                          <div
                            key={log._id}
                            className="p-3 bg-white border border-[#D3DFDA] rounded-xl flex items-center justify-between text-xs shadow-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <CheckCircle2 size={16} />
                              </div>
                              <div>
                                <p className="font-bold text-[#202828]">{log.exerciseId?.name || 'Exercise'}</p>
                                <p className="text-[10px] text-[#687B78]">
                                  {log.completedSets} Sets completed • {Math.round(log.duration || 0)}s duration
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] text-[#687B78]">
                              {new Date(log.completedAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-[#D3DFDA] bg-[#F9F8F6] flex justify-end">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="px-4 py-2 bg-[#164A4A] text-white text-xs font-bold rounded-xl hover:bg-[#C6A77D]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerMemberProgress;