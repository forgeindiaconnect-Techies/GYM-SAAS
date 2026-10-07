import React, { useState, useEffect } from 'react';
import {
  Activity, Plus, History, ChevronRight, Scale, Dumbbell, X, Brain,
  Loader2, Sparkles, Flame, Clock, CheckCircle2, RefreshCw, PlayCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const MemberProgress: React.FC = () => {
  const [mainView, setMainView] = useState<'workout' | 'metrics'>('workout');
  const [activeTab, setActiveTab] = useState<'weight' | 'strength'>('weight');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Body metrics state
  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [logSubmitting, setLogSubmitting] = useState(false);

  // Workout progress state
  const [workoutStats, setWorkoutStats] = useState<any>(null);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [loadingWorkoutProgress, setLoadingWorkoutProgress] = useState(true);

  // Form State
  const [form, setForm] = useState({
    weight: '',
    bodyFat: '',
    benchMax: '',
    squatMax: '',
    deadliftMax: '',
    notes: ''
  });

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress/logs');
      if (res.data.success) {
        setLogs(res.data.logs || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutProgress = async () => {
    try {
      setLoadingWorkoutProgress(true);
      const res = await api.get('/workout-progress/my-progress');
      if (res.data.success) {
        setWorkoutStats(res.data.stats || null);
        setWorkoutHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Failed to load workout progress:', err);
    } finally {
      setLoadingWorkoutProgress(false);
    }
  };

  useEffect(() => {
    fetchProgress();
    fetchWorkoutProgress();
  }, []);

  const handleSaveMetrics = async () => {
    try {
      setLogSubmitting(true);
      await api.post('/progress/log', {
        weight: form.weight ? parseFloat(form.weight) : undefined,
        bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
        benchMax: form.benchMax ? parseFloat(form.benchMax) : undefined,
        squatMax: form.squatMax ? parseFloat(form.squatMax) : undefined,
        deadliftMax: form.deadliftMax ? parseFloat(form.deadliftMax) : undefined,
        notes: form.notes
      });
      alert('Metrics logged successfully!');
      setShowLogModal(false);
      setForm({ weight: '', bodyFat: '', benchMax: '', squatMax: '', deadliftMax: '', notes: '' });
      await fetchProgress();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log metrics');
    } finally {
      setLogSubmitting(false);
    }
  };

  const handleTriggerAIReanalysis = async () => {
    try {
      setReanalyzing(true);
      const res = await api.post('/progress/reanalyze');
      if (res.data.success) {
        alert('AI Re-analysis completed! Your trainer has been notified to review the updated recommendations.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to run AI Re-analysis');
    } finally {
      setReanalyzing(false);
    }
  };

  const latestLog = logs[0] || {};

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#292524] tracking-tight mb-1">Workout & Body Progress</h1>
          <p className="text-[#78716C]">
            Track your workout streak, completed animated exercises, sets, and body composition.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTriggerAIReanalysis}
            disabled={reanalyzing}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/10 active:scale-95 disabled:opacity-50"
          >
            {reanalyzing ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} />}
            {reanalyzing ? 'AI Analyzing...' : 'Request AI Re-analysis'}
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/10 active:scale-95"
          >
            <Plus size={18} /> Log New Metrics
          </button>
        </div>
      </div>

      {/* Main Switcher: Workout Progress vs Body Metrics */}
      <div className="flex bg-[#FFFDF8] p-1.5 rounded-2xl max-w-md border border-[#E7E5E4]">
        <button
          onClick={() => setMainView('workout')}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            mainView === 'workout'
              ? 'bg-[#F97316] text-white shadow-md'
              : 'text-[#78716C] hover:text-[#292524]'
          }`}
        >
          <Dumbbell size={16} /> Workout Progress
        </button>
        <button
          onClick={() => setMainView('metrics')}
          className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            mainView === 'metrics'
              ? 'bg-[#F97316] text-white shadow-md'
              : 'text-[#78716C] hover:text-[#292524]'
          }`}
        >
          <Scale size={16} /> Body Metrics & Strength
        </button>
      </div>

      {/* ===================== WORKOUT PROGRESS TAB ===================== */}
      {mainView === 'workout' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top 4 Workout Progress Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#FED7AA] rounded-2xl p-5 shadow-sm hover:border-[#F97316]/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Total Workouts</span>
                <Dumbbell size={18} className="text-[#F97316]" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#292524]">
                  {workoutStats?.totalWorkouts || 0}
                </span>
                <span className="text-xs text-[#78716C] font-bold">sessions</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {workoutStats?.weeklyWorkoutCount || 0} workouts this week
              </span>
            </div>

            <div className="bg-white border border-[#FED7AA] rounded-2xl p-5 shadow-sm hover:border-[#F97316]/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Exercises Done</span>
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-700">
                  {workoutStats?.totalExercisesCompleted || 0}
                </span>
                <span className="text-xs text-[#78716C] font-bold">completed</span>
              </div>
              <span className="text-[11px] text-[#78716C] font-semibold mt-1 block">
                Across all plan routines
              </span>
            </div>

            <div className="bg-white border border-[#FED7AA] rounded-2xl p-5 shadow-sm hover:border-[#F97316]/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Workout Streak</span>
                <Flame size={18} className="text-amber-500 fill-amber-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-amber-600">
                  {workoutStats?.workoutStreak || 0}
                </span>
                <span className="text-xs text-[#78716C] font-bold">days streak</span>
              </div>
              <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
                🔥 Keep consistency alive!
              </span>
            </div>

            <div className="bg-white border border-[#FED7AA] rounded-2xl p-5 shadow-sm hover:border-[#F97316]/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Total Time</span>
                <Clock size={18} className="text-teal-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#292524]">
                  {workoutStats?.totalWorkoutMinutes || 0}
                </span>
                <span className="text-xs text-[#78716C] font-bold">minutes</span>
              </div>
              <span className="text-[11px] text-[#78716C] font-semibold mt-1 block">
                Logged training time
              </span>
            </div>
          </div>

          {/* Completion Percentage Banner */}
          <div className="bg-gradient-to-r from-[#292524] to-[#121A1A] text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                Plan Completion Rate
              </span>
              <h3 className="text-2xl font-black">
                {workoutStats?.completionPercentage || 0}% of Assigned Plan Completed
              </h3>
              <p className="text-xs md:text-sm text-white/70">
                Follow your trainer-assigned workout routines with animated video player and set logging to hit 100%.
              </p>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700"
                  style={{ width: `${workoutStats?.completionPercentage || 0}%` }}
                ></div>
              </div>
            </div>

            <Link
              to="/member/workout"
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-[#121818] rounded-xl text-sm font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0"
            >
              <PlayCircle size={18} /> Continue Workout
            </Link>
          </div>

          {/* Exercise Completion Activity Log */}
          <div className="bg-white border border-[#FED7AA] rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-[#292524]">Completed Exercise Logs</h3>
                <p className="text-xs text-[#78716C]">Chronological history of completed exercise animations and sets</p>
              </div>
              <button
                onClick={fetchWorkoutProgress}
                className="p-2 text-[#78716C] hover:text-[#292524] hover:bg-[#FFFDF8] rounded-xl transition-colors"
                title="Refresh logs"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            {loadingWorkoutProgress ? (
              <div className="text-center py-12 text-[#78716C]">
                <Loader2 className="animate-spin mx-auto mb-2 text-[#F97316]" size={28} />
                <p className="text-xs font-semibold">Loading workout records...</p>
              </div>
            ) : workoutHistory.length === 0 ? (
              <div className="p-8 text-center bg-[#F9F8F6] border border-dashed border-[#E7E5E4] rounded-2xl">
                <Dumbbell size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="font-bold text-[#292524] text-sm">No exercises completed yet</p>
                <p className="text-xs text-[#78716C] mt-1 mb-4">
                  Go to &quot;My Workout Plan&quot;, tap &quot;Watch Exercise&quot;, and log your first workout set!
                </p>
                <Link
                  to="/member/workout"
                  className="px-4 py-2 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-[#EA580C]"
                >
                  Go to Workout Plan
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {workoutHistory.map((item: any) => (
                  <div
                    key={item._id}
                    className="p-4 bg-[#F9F8F6] hover:bg-[#FFFDF8] border border-[#E7E5E4] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#292524]">{item.exerciseId?.name || 'Exercise'}</h4>
                        <p className="text-xs text-[#78716C]">
                          {item.completedSets || 3} Sets completed • {Math.round(item.duration || 60)}s elapsed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                        {item.status || 'Completed'}
                      </span>
                      <span className="text-[#78716C] font-medium">
                        {new Date(item.completedAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== BODY METRICS TAB ===================== */}
      {mainView === 'metrics' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Current Weight', value: latestLog.weight ? `${latestLog.weight}` : '74.5', unit: 'kg', icon: Scale },
              { label: 'Body Fat', value: latestLog.bodyFat ? `${latestLog.bodyFat}` : '14.2', unit: '%', icon: Activity },
              { label: 'Bench Press Max', value: latestLog.benchMax ? `${latestLog.benchMax}` : '65', unit: 'kg', icon: Dumbbell },
              { label: 'Attendance Rate', value: summary?.attendanceRate !== undefined ? `${summary.attendanceRate}` : '95', unit: '%', icon: Sparkles },
            ].map((metric, i) => (
              <div key={i} className="bg-white border border-[#FED7AA] rounded-2xl p-5 shadow-sm hover:border-[#F97316]/30 transition-colors group relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#FFFDF8] rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
                <div className="relative z-10 flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-[#78716C] uppercase tracking-wider">{metric.label}</span>
                  <metric.icon size={18} className="text-[#FED7AA]" />
                </div>
                <div className="relative z-10 flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-[#292524]">{metric.value}</span>
                  <span className="text-[#78716C] font-medium">{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Chart Section */}
            <div className="lg:col-span-2 bg-white border border-[#FED7AA] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-[#292524]">Performance Logged History</h2>
                <div className="flex bg-[#FFFDF8] p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab('weight')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'weight' ? 'bg-white text-[#F97316] shadow-sm' : 'text-[#78716C] hover:text-[#292524]'}`}
                  >
                    Weight
                  </button>
                  <button
                    onClick={() => setActiveTab('strength')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'strength' ? 'bg-white text-[#F97316] shadow-sm' : 'text-[#78716C] hover:text-[#292524]'}`}
                  >
                    Bench Max
                  </button>
                </div>
              </div>

              {/* Logged Metric History List */}
              <div className="space-y-3">
                {loading ? (
                  <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#F97316]" size={32} /></div>
                ) : logs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No progress logs recorded yet. Click &quot;Log New Metrics&quot; to get started!</p>
                ) : (
                  logs.slice(0, 5).map((log: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-[#F8FAFC] border border-[#FED7AA] rounded-2xl">
                      <div>
                        <span className="font-bold text-[#292524] text-sm">{new Date(log.date || log.createdAt).toLocaleDateString()}</span>
                        {log.notes && <p className="text-xs text-gray-500 italic mt-0.5">&quot;{log.notes}&quot;</p>}
                      </div>
                      <div className="text-right font-bold text-[#F97316]">
                        {activeTab === 'weight' ? `${log.weight || '—'} kg` : `${log.benchMax || '—'} kg`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* History Log */}
            <div className="bg-white border border-[#FED7AA] rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <History className="text-[#F97316]" size={20} />
                <h2 className="text-xl font-bold text-[#292524]">Recent Check-ins</h2>
              </div>

              <div className="space-y-4">
                {logs.slice(0, 4).map((log: any, i: number) => (
                  <div key={i} className="bg-[#FFFDF8] rounded-2xl p-4 hover:bg-[#FED7AA] transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-[#292524]">{new Date(log.date || log.createdAt).toLocaleDateString()}</span>
                      <ChevronRight size={16} className="text-[#78716C] group-hover:text-[#F97316] transition-colors" />
                    </div>
                    <div className="flex gap-4 text-sm mb-2">
                      <div><span className="text-[#78716C]">Weight:</span> <span className="font-semibold text-[#F97316]">{log.weight ? `${log.weight} kg` : 'N/A'}</span></div>
                      <div><span className="text-[#78716C]">BF:</span> <span className="font-semibold text-[#F97316]">{log.bodyFat ? `${log.bodyFat}%` : 'N/A'}</span></div>
                    </div>
                    {log.notes && <p className="text-xs text-[#78716C] italic">&quot;{log.notes}&quot;</p>}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowHistoryModal(true)}
                className="w-full mt-6 py-3 border-2 border-[#FED7AA] text-[#78716C] font-bold rounded-xl hover:bg-[#FFFDF8] transition-colors text-sm"
              >
                View Full History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Metrics Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#292524]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-[#F97316] to-[#292524] p-6 text-white relative">
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Log Metrics</h3>
                  <p className="text-white/80 text-sm">Update your body stats for today.</p>
                </div>
                <button onClick={() => setShowLogModal(false)} className="text-white/60 hover:text-white p-2 bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="w-full bg-[#FFFDF8] border-none rounded-xl p-3 text-[#292524] font-bold outline-none focus:ring-2 focus:ring-[#F97316]/20" placeholder="e.g. 74.5" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Body Fat (%)</label>
                  <input type="number" step="0.1" value={form.bodyFat} onChange={e => setForm({...form, bodyFat: e.target.value})} className="w-full bg-[#FFFDF8] border-none rounded-xl p-3 text-[#292524] font-bold outline-none focus:ring-2 focus:ring-[#F97316]/20" placeholder="e.g. 14.2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#78716C] mb-1">Bench Max (kg)</label>
                  <input type="number" value={form.benchMax} onChange={e => setForm({...form, benchMax: e.target.value})} className="w-full bg-[#FFFDF8] border-none rounded-xl p-2.5 text-[#292524] font-bold outline-none text-xs" placeholder="65" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#78716C] mb-1">Squat Max (kg)</label>
                  <input type="number" value={form.squatMax} onChange={e => setForm({...form, squatMax: e.target.value})} className="w-full bg-[#FFFDF8] border-none rounded-xl p-2.5 text-[#292524] font-bold outline-none text-xs" placeholder="90" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#78716C] mb-1">Deadlift (kg)</label>
                  <input type="number" value={form.deadliftMax} onChange={e => setForm({...form, deadliftMax: e.target.value})} className="w-full bg-[#FFFDF8] border-none rounded-xl p-2.5 text-[#292524] font-bold outline-none text-xs" placeholder="110" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#78716C] mb-1">Notes / How do you feel?</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full bg-[#FFFDF8] border-none rounded-xl p-3 text-[#292524] outline-none focus:ring-2 focus:ring-[#F97316]/20 min-h-[80px]"
                  placeholder="Feeling stronger, hit a new PR..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4 mt-2">
                <button
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3 font-bold text-[#78716C] hover:bg-[#FFFDF8] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMetrics}
                  disabled={logSubmitting}
                  className="flex-1 py-3 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors shadow-lg shadow-[#F97316]/20 flex items-center justify-center gap-2"
                >
                  {logSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Metrics'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#292524]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-[#FED7AA] flex justify-between items-center bg-[#F9F8F6]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <History className="text-[#F97316]" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[#292524]">Full Progress History</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-[#78716C] hover:text-[#EF4444] p-2 bg-white rounded-full shadow-sm transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {logs.map((log: any, i: number) => (
                  <div key={i} className="bg-white border border-[#FED7AA] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#F97316]/30 transition-colors">
                    <div>
                      <span className="font-bold text-[#292524] text-lg block mb-1">{new Date(log.date || log.createdAt).toLocaleDateString()}</span>
                      {log.notes && <p className="text-sm text-[#78716C] italic">&quot;{log.notes}&quot;</p>}
                    </div>
                    <div className="flex gap-4 text-sm bg-[#FFFDF8] px-4 py-2 rounded-xl">
                      <div><span className="text-[#78716C] block text-xs uppercase tracking-wider mb-0.5">Weight</span> <span className="font-bold text-[#F97316] text-base">{log.weight ? `${log.weight} kg` : 'N/A'}</span></div>
                      <div className="w-px bg-[#E7E5E4]"></div>
                      <div><span className="text-[#78716C] block text-xs uppercase tracking-wider mb-0.5">Body Fat</span> <span className="font-bold text-[#F97316] text-base">{log.bodyFat ? `${log.bodyFat}%` : 'N/A'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-[#FED7AA] bg-white">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full py-3 bg-[#FFFDF8] text-[#292524] font-bold rounded-xl hover:bg-[#FED7AA] transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProgress;