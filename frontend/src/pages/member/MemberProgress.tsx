import { useState, useEffect } from 'react';
import { Activity, Plus, History, ChevronRight, Scale, Dumbbell, X, Brain, Loader2, Sparkles } from 'lucide-react';
import api from '../../utils/api';

const MemberProgress = () => {
  const [activeTab, setActiveTab] = useState<'weight' | 'strength'>('weight');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [logs, setLogs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [logSubmitting, setLogSubmitting] = useState(false);

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

  useEffect(() => {
    fetchProgress();
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
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight mb-1">Progress Tracking</h1>
          <p className="text-[#455250]">Monitor your body metrics, strength achievements, attendance, and request AI Re-analysis.</p>
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
            className="bg-[#164A4A] hover:bg-[#C6A77D] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/10 active:scale-95"
          >
            <Plus size={18} /> Log New Metrics
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Weight', value: latestLog.weight ? `${latestLog.weight}` : '74.5', unit: 'kg', icon: Scale },
          { label: 'Body Fat', value: latestLog.bodyFat ? `${latestLog.bodyFat}` : '14.2', unit: '%', icon: Activity },
          { label: 'Bench Press Max', value: latestLog.benchMax ? `${latestLog.benchMax}` : '65', unit: 'kg', icon: Dumbbell },
          { label: 'Attendance Rate', value: summary?.attendanceRate !== undefined ? `${summary.attendanceRate}` : '95', unit: '%', icon: Sparkles },
        ].map((metric, i) => (
          <div key={i} className="bg-white border border-[#E8E5DA] rounded-2xl p-5 shadow-sm hover:border-[#164A4A]/30 transition-colors group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#F2EFE8] rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-[#687B78] uppercase tracking-wider">{metric.label}</span>
              <metric.icon size={18} className="text-[#D2B48C]" />
            </div>
            <div className="relative z-10 flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-[#202828]">{metric.value}</span>
              <span className="text-[#687B78] font-medium">{metric.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white border border-[#E8E5DA] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-[#202828]">Performance Logged History</h2>
            <div className="flex bg-[#F2EFE8] p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('weight')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'weight' ? 'bg-white text-[#164A4A] shadow-sm' : 'text-[#687B78] hover:text-[#202828]'}`}
              >
                Weight
              </button>
              <button 
                onClick={() => setActiveTab('strength')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'strength' ? 'bg-white text-[#164A4A] shadow-sm' : 'text-[#687B78] hover:text-[#202828]'}`}
              >
                Bench Max
              </button>
            </div>
          </div>

          {/* Logged Metric History List */}
          <div className="space-y-3">
            {loading ? (
              <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#164A4A]" size={32} /></div>
            ) : logs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No progress logs recorded yet. Click "Log New Metrics" to get started!</p>
            ) : (
              logs.slice(0, 5).map((log: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 bg-[#F8FAFC] border border-[#E8E5DA] rounded-2xl">
                  <div>
                    <span className="font-bold text-[#202828] text-sm">{new Date(log.date || log.createdAt).toLocaleDateString()}</span>
                    {log.notes && <p className="text-xs text-gray-500 italic mt-0.5">"{log.notes}"</p>}
                  </div>
                  <div className="text-right font-bold text-[#164A4A]">
                    {activeTab === 'weight' ? `${log.weight || '—'} kg` : `${log.benchMax || '—'} kg`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* History Log */}
        <div className="bg-white border border-[#E8E5DA] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <History className="text-[#164A4A]" size={20} />
            <h2 className="text-xl font-bold text-[#202828]">Recent Check-ins</h2>
          </div>
          
          <div className="space-y-4">
            {logs.slice(0, 4).map((log: any, i: number) => (
              <div key={i} className="bg-[#F2EFE8] rounded-2xl p-4 hover:bg-[#E8E5DA] transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-[#202828]">{new Date(log.date || log.createdAt).toLocaleDateString()}</span>
                  <ChevronRight size={16} className="text-[#A8ADA9] group-hover:text-[#164A4A] transition-colors" />
                </div>
                <div className="flex gap-4 text-sm mb-2">
                  <div><span className="text-[#687B78]">Weight:</span> <span className="font-semibold text-[#164A4A]">{log.weight ? `${log.weight} kg` : 'N/A'}</span></div>
                  <div><span className="text-[#687B78]">BF:</span> <span className="font-semibold text-[#164A4A]">{log.bodyFat ? `${log.bodyFat}%` : 'N/A'}</span></div>
                </div>
                {log.notes && <p className="text-xs text-[#687B78] italic">"{log.notes}"</p>}
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="w-full mt-6 py-3 border-2 border-[#E8E5DA] text-[#687B78] font-bold rounded-xl hover:bg-[#F2EFE8] transition-colors text-sm"
          >
            View Full History
          </button>
        </div>
      </div>

      {/* Log Metrics Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#202828]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-[#164A4A] to-[#202828] p-6 text-white relative">
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
                  <label className="block text-sm font-bold text-[#687B78] mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} className="w-full bg-[#F2EFE8] border-none rounded-xl p-3 text-[#202828] font-bold outline-none focus:ring-2 focus:ring-[#164A4A]/20" placeholder="e.g. 74.5" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#687B78] mb-1">Body Fat (%)</label>
                  <input type="number" step="0.1" value={form.bodyFat} onChange={e => setForm({...form, bodyFat: e.target.value})} className="w-full bg-[#F2EFE8] border-none rounded-xl p-3 text-[#202828] font-bold outline-none focus:ring-2 focus:ring-[#164A4A]/20" placeholder="e.g. 14.2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#687B78] mb-1">Bench Max (kg)</label>
                  <input type="number" value={form.benchMax} onChange={e => setForm({...form, benchMax: e.target.value})} className="w-full bg-[#F2EFE8] border-none rounded-xl p-2.5 text-[#202828] font-bold outline-none text-xs" placeholder="65" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#687B78] mb-1">Squat Max (kg)</label>
                  <input type="number" value={form.squatMax} onChange={e => setForm({...form, squatMax: e.target.value})} className="w-full bg-[#F2EFE8] border-none rounded-xl p-2.5 text-[#202828] font-bold outline-none text-xs" placeholder="90" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#687B78] mb-1">Deadlift (kg)</label>
                  <input type="number" value={form.deadliftMax} onChange={e => setForm({...form, deadliftMax: e.target.value})} className="w-full bg-[#F2EFE8] border-none rounded-xl p-2.5 text-[#202828] font-bold outline-none text-xs" placeholder="110" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#687B78] mb-1">Notes / How do you feel?</label>
                <textarea 
                  value={form.notes}
                  onChange={e => setForm({...form, notes: e.target.value})}
                  className="w-full bg-[#F2EFE8] border-none rounded-xl p-3 text-[#202828] outline-none focus:ring-2 focus:ring-[#164A4A]/20 min-h-[80px]" 
                  placeholder="Feeling stronger, hit a new PR..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4 mt-2">
                <button 
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3 font-bold text-[#687B78] hover:bg-[#F2EFE8] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveMetrics}
                  disabled={logSubmitting}
                  className="flex-1 py-3 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors shadow-lg shadow-[#164A4A]/20 flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#202828]/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-[#E8E5DA] flex justify-between items-center bg-[#F9F8F6]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <History className="text-[#164A4A]" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-[#202828]">Full Progress History</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-[#A8ADA9] hover:text-[#EF4444] p-2 bg-white rounded-full shadow-sm transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {logs.map((log: any, i: number) => (
                  <div key={i} className="bg-white border border-[#E8E5DA] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#164A4A]/30 transition-colors">
                    <div>
                      <span className="font-bold text-[#202828] text-lg block mb-1">{new Date(log.date || log.createdAt).toLocaleDateString()}</span>
                      {log.notes && <p className="text-sm text-[#687B78] italic">"{log.notes}"</p>}
                    </div>
                    <div className="flex gap-4 text-sm bg-[#F2EFE8] px-4 py-2 rounded-xl">
                      <div><span className="text-[#687B78] block text-xs uppercase tracking-wider mb-0.5">Weight</span> <span className="font-bold text-[#164A4A] text-base">{log.weight ? `${log.weight} kg` : 'N/A'}</span></div>
                      <div className="w-px bg-[#D3DFDA]"></div>
                      <div><span className="text-[#687B78] block text-xs uppercase tracking-wider mb-0.5">Body Fat</span> <span className="font-bold text-[#164A4A] text-base">{log.bodyFat ? `${log.bodyFat}%` : 'N/A'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-[#E8E5DA] bg-white">
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="w-full py-3 bg-[#F2EFE8] text-[#202828] font-bold rounded-xl hover:bg-[#E8E5DA] transition-colors"
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