import React, { useState } from 'react';
import { TrendingUp, Activity, Plus, History, ChevronRight, Scale, Dumbbell, X } from 'lucide-react';

const MemberProgress = () => {
  const [activeTab, setActiveTab] = useState('weight');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Mock data for the chart
  const weightData = [
    { month: 'Apr', value: 78.5 },
    { month: 'May', value: 77.2 },
    { month: 'Jun', value: 76.8 },
    { month: 'Jul', value: 75.9 },
    { month: 'Aug', value: 75.1 },
    { month: 'Sep', value: 74.5 },
  ];

  const strengthData = [
    { month: 'Apr', value: 45 },
    { month: 'May', value: 50 },
    { month: 'Jun', value: 55 },
    { month: 'Jul', value: 57.5 },
    { month: 'Aug', value: 60 },
    { month: 'Sep', value: 65 },
  ];

  const chartData = activeTab === 'weight' ? weightData : strengthData;
  const minValue = Math.min(...chartData.map(d => d.value)) * 0.9;
  const maxValue = Math.max(...chartData.map(d => d.value)) * 1.1;

  const getBarHeight = (value: number) => {
    return `${((value - minValue) / (maxValue - minValue)) * 100}%`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight mb-1">Progress Tracking</h1>
          <p className="text-[#455250]">Monitor your body metrics and strength achievements over time.</p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="bg-[#164A4A] hover:bg-[#C6A77D] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/10 active:scale-95"
        >
          <Plus size={18} /> Log New Metrics
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Weight', value: '74.5', unit: 'kg', trend: '-1.2', color: 'text-green-600', icon: Scale },
          { label: 'Body Fat', value: '14.2', unit: '%', trend: '-0.5', color: 'text-green-600', icon: Activity },
          { label: 'Bench Press Max', value: '65', unit: 'kg', trend: '+5.0', color: 'text-blue-600', icon: Dumbbell },
          { label: 'BMI', value: '23.4', unit: '', trend: '-0.3', color: 'text-green-600', icon: Activity },
        ].map((metric, i) => (
          <div key={i} className="bg-white border border-[#E8E5DA] rounded-2xl p-5 shadow-sm hover:border-[#164A4A]/30 transition-colors group relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#F2EFE8] rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10 flex justify-between items-start mb-2">
              <span className="text-sm font-semibold text-[#687B78] uppercase tracking-wider">{metric.label}</span>
              <metric.icon size={18} className="text-[#D2B48C]" />
            </div>
            <div className="relative z-10 flex items-baseline gap-1 mb-3">
              <span className="text-3xl font-bold text-[#202828]">{metric.value}</span>
              <span className="text-[#687B78] font-medium">{metric.unit}</span>
            </div>
            <div className="relative z-10 inline-flex items-center">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md bg-[#F2EFE8] ${metric.color}`}>
                {metric.trend}{metric.unit} this month
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 bg-white border border-[#E8E5DA] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-[#202828]">Performance Trends</h2>
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
                Strength
              </button>
            </div>
          </div>

          {/* CSS Bar Chart */}
          <div className="flex-1 min-h-[250px] flex items-end justify-between gap-2 md:gap-6 pt-10">
            {chartData.map((data, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div className="w-full relative h-[200px] flex items-end justify-center">
                  <div 
                    className={`w-full max-w-[3rem] rounded-t-xl transition-all duration-700 ease-in-out relative ${activeTab === 'weight' ? 'bg-[#164A4A]' : 'bg-[#C6A77D]'}`}
                    style={{ height: getBarHeight(data.value) }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#202828] text-white text-xs font-bold py-1 px-2 rounded transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {data.value} {activeTab === 'weight' ? 'kg' : 'kg'}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#202828]"></div>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#687B78] mt-4 uppercase tracking-wider">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* History Log */}
        <div className="bg-white border border-[#E8E5DA] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <History className="text-[#164A4A]" size={20} />
            <h2 className="text-xl font-bold text-[#202828]">Recent Check-ins</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { date: 'Sep 25, 2026', weight: '74.5 kg', bf: '14.2%', note: 'Feeling stronger' },
              { date: 'Sep 11, 2026', weight: '74.8 kg', bf: '14.5%', note: 'Consistent diet' },
              { date: 'Aug 28, 2026', weight: '75.1 kg', bf: '14.7%', note: 'Missed some workouts' },
              { date: 'Aug 14, 2026', weight: '75.5 kg', bf: '15.0%', note: 'Starting new block' },
            ].map((log, i) => (
              <div key={i} className="bg-[#F2EFE8] rounded-2xl p-4 hover:bg-[#E8E5DA] transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-[#202828]">{log.date}</span>
                  <ChevronRight size={16} className="text-[#A8ADA9] group-hover:text-[#164A4A] transition-colors" />
                </div>
                <div className="flex gap-4 text-sm mb-2">
                  <div><span className="text-[#687B78]">Weight:</span> <span className="font-semibold text-[#164A4A]">{log.weight}</span></div>
                  <div><span className="text-[#687B78]">BF:</span> <span className="font-semibold text-[#164A4A]">{log.bf}</span></div>
                </div>
                <p className="text-xs text-[#687B78] italic">"{log.note}"</p>
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
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
                  <input type="number" className="w-full bg-[#F2EFE8] border-none rounded-xl p-3 text-[#202828] font-bold outline-none focus:ring-2 focus:ring-[#164A4A]/20" placeholder="e.g. 74.5" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#687B78] mb-1">Body Fat (%)</label>
                  <input type="number" className="w-full bg-[#F2EFE8] border-none rounded-xl p-3 text-[#202828] font-bold outline-none focus:ring-2 focus:ring-[#164A4A]/20" placeholder="e.g. 14.2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#687B78] mb-1">Notes / How do you feel?</label>
                <textarea 
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
                  onClick={() => {
                    alert('Metrics logged successfully!');
                    setShowLogModal(false);
                  }}
                  className="flex-1 py-3 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors shadow-lg shadow-[#164A4A]/20"
                >
                  Save Metrics
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
                <h3 className="text-2xl font-bold text-[#202828]">Full History</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="text-[#A8ADA9] hover:text-[#EF4444] p-2 bg-white rounded-full shadow-sm transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                {[
                  { date: 'Sep 25, 2026', weight: '74.5 kg', bf: '14.2%', note: 'Feeling stronger' },
                  { date: 'Sep 11, 2026', weight: '74.8 kg', bf: '14.5%', note: 'Consistent diet' },
                  { date: 'Aug 28, 2026', weight: '75.1 kg', bf: '14.7%', note: 'Missed some workouts' },
                  { date: 'Aug 14, 2026', weight: '75.5 kg', bf: '15.0%', note: 'Starting new block' },
                  { date: 'Jul 30, 2026', weight: '75.9 kg', bf: '15.3%', note: 'Vacation week' },
                  { date: 'Jul 15, 2026', weight: '76.2 kg', bf: '15.5%', note: 'Diet slipping a bit' },
                  { date: 'Jun 30, 2026', weight: '76.8 kg', bf: '15.8%', note: 'Feeling good' },
                  { date: 'Jun 15, 2026', weight: '77.0 kg', bf: '16.0%', note: 'Hard week at work' },
                  { date: 'May 31, 2026', weight: '77.2 kg', bf: '16.2%', note: 'New PR on squat!' },
                  { date: 'May 15, 2026', weight: '77.5 kg', bf: '16.5%', note: 'Consistent training' },
                ].map((log, i) => (
                  <div key={i} className="bg-white border border-[#E8E5DA] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#164A4A]/30 transition-colors">
                    <div>
                      <span className="font-bold text-[#202828] text-lg block mb-1">{log.date}</span>
                      <p className="text-sm text-[#687B78] italic">"{log.note}"</p>
                    </div>
                    <div className="flex gap-4 text-sm bg-[#F2EFE8] px-4 py-2 rounded-xl">
                      <div><span className="text-[#687B78] block text-xs uppercase tracking-wider mb-0.5">Weight</span> <span className="font-bold text-[#164A4A] text-base">{log.weight}</span></div>
                      <div className="w-px bg-[#D3DFDA]"></div>
                      <div><span className="text-[#687B78] block text-xs uppercase tracking-wider mb-0.5">Body Fat</span> <span className="font-bold text-[#164A4A] text-base">{log.bf}</span></div>
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