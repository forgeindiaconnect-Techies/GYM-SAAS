import { useState, useEffect } from 'react';
import {
  Search, MessageSquare, RefreshCw, Brain, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Dumbbell, Salad, User, X, Filter, Send
} from 'lucide-react';
import api from '../../utils/api';

const statusConfig: Record<string, { label: string; cls: string }> = {
  'AI Generated':       { label: 'AI Generated',       cls: 'bg-blue-100 text-blue-700' },
  'Trainer Approved':   { label: 'Trainer Approved',   cls: 'bg-green-100 text-green-700' },
  'Sent':               { label: 'Sent to Client',     cls: 'bg-teal-100 text-teal-700' },
  'Revision Requested': { label: 'Revision Requested', cls: 'bg-yellow-100 text-yellow-700' },
  'Pending':            { label: 'Pending',            cls: 'bg-gray-100 text-gray-600' },
};

const TrainerAIFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);

  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replySending, setReplySending] = useState<Record<string, boolean>>({});

  const handleSendReply = async (recId: string) => {
    const text = replyTexts[recId]?.trim();
    if (!text) return;
    try {
      setReplySending(prev => ({ ...prev, [recId]: true }));
      const res = await api.post('/ai/trainer/reply', { recommendationId: recId, message: text });
      setReplyTexts(prev => ({ ...prev, [recId]: '' }));
      const updated = res.data.recommendation;
      if (updated) {
        setFeedbacks(prev => prev.map(item => item._id === recId ? updated : item));
        if (detail?._id === recId) setDetail(updated);
      } else {
        fetchFeedbacks();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setReplySending(prev => ({ ...prev, [recId]: false }));
    }
  };

  const renderChatSection = (item: any) => {
    if (!item) return null;
    const recId = item._id;
    const isSending = !!replySending[recId];
    const textValue = replyTexts[recId] || '';

    return (
      <div className="space-y-3 pt-3 border-t border-[#E7E5E4]">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#F97316]" />
          <h4 className="text-xs font-bold text-[#F97316] uppercase tracking-wider">Chat &amp; Feedback Discussion</h4>
        </div>

        {/* Messages */}
        {item.chatMessages && item.chatMessages.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {item.chatMessages.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border ${
                  msg.senderRole === 'TRAINER'
                    ? 'bg-blue-50/90 border-blue-200 ml-4'
                    : 'bg-[#F0F7F6] border-[#FED7AA]/50 mr-4'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className={msg.senderRole === 'TRAINER' ? 'text-blue-900' : 'text-[#F97316]'}>
                    {msg.senderRole === 'TRAINER' ? `💬 Trainer (${msg.senderName || 'You'})` : `👤 Member (${msg.senderName || 'Client'})`}
                  </span>
                  <span className="text-[#78716C] font-normal">{msg.date ? new Date(msg.date).toLocaleString() : ''}</span>
                </div>
                <p className="text-sm text-[#334155] whitespace-pre-wrap">{msg.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <>
            {item.memberReply?.message && (
              <div className="bg-[#F0F7F6] border border-[#FED7AA] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-[#F97316]" />
                  <p className="text-xs font-bold text-[#F97316] uppercase tracking-wider">Member's Reply</p>
                  <span className="text-xs text-[#78716C] ml-auto">{new Date(item.memberReply.date).toLocaleString()}</span>
                </div>
                <p className="text-sm text-[#78716C] whitespace-pre-wrap">{item.memberReply.message}</p>
              </div>
            )}
            {item.trainerReply?.message && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-blue-700" />
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Your Reply</p>
                  <span className="text-xs text-[#78716C] ml-auto">{new Date(item.trainerReply.date).toLocaleString()}</span>
                </div>
                <p className="text-sm text-[#334155] whitespace-pre-wrap">{item.trainerReply.message}</p>
              </div>
            )}
          </>
        )}

        {/* Reply Input Box */}
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-3 space-y-2 shadow-sm">
          <textarea
            rows={2}
            value={textValue}
            onChange={e => setReplyTexts(prev => ({ ...prev, [recId]: e.target.value }))}
            placeholder="Write a reply or message to the customer..."
            className="w-full px-3 py-2 text-sm border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#F97316] resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleSendReply(recId)}
              disabled={isSending || !textValue.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
            >
              {isSending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              {isSending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/trainer/recommendations');
      setFeedbacks(res.data.recommendations || []);
    } catch (err) {
      console.error('Failed to fetch AI feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const clientName = (f: any) => {
    if (!f || !f.customerId) return 'Member';
    if (typeof f.customerId === 'object') {
      const full = `${f.customerId.firstName || ''} ${f.customerId.lastName || ''}`.trim();
      return full || f.customerId.email || 'Member';
    }
    return 'Member';
  };

  const filtered = feedbacks.filter(f => {
    const nameMatch = clientName(f).toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'All' || f.status === statusFilter;
    return nameMatch && statusMatch;
  });

  const statuses = ['All', ...Array.from(new Set(feedbacks.map(f => f.status))).filter(Boolean)];

  const toggleExpand = (id: string) => setExpanded(prev => (prev === id ? null : id));

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center shadow-lg shadow-orange-200">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#292524]">Feedback</h1>
            <p className="text-[#78716C] text-sm">AI-generated plans & feedback for your clients.</p>
          </div>
        </div>
        <button
          onClick={fetchFeedbacks}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E7E5E4] text-[#78716C] font-semibold rounded-xl hover:bg-[#FFFDF8] transition-colors text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-[#F97316]' : ''} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {!loading && feedbacks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', count: feedbacks.length, color: 'bg-[#FFFDF8] text-[#F97316]' },
            { label: 'AI Generated', count: feedbacks.filter(f => f.status === 'AI Generated').length, color: 'bg-blue-50 text-blue-700' },
            { label: 'Approved', count: feedbacks.filter(f => f.status === 'Trainer Approved' || f.status === 'Sent').length, color: 'bg-green-50 text-green-700' },
            { label: 'Revisions', count: feedbacks.filter(f => f.status === 'Revision Requested').length, color: 'bg-yellow-50 text-yellow-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 border border-white`}>
              <p className="text-3xl font-black">{s.count}</p>
              <p className="text-sm font-semibold mt-0.5 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter */}
      <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E7E5E4] bg-[#F8FAFA] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" size={18} />
            <input
              type="text"
              placeholder="Search by client name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7E5E4] bg-white focus:outline-none focus:border-[#F97316] text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#78716C]" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-[#E7E5E4] bg-white text-sm font-semibold text-[#78716C] focus:outline-none focus:border-[#F97316]"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Statuses' : (statusConfig[s]?.label || s)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-[#F1F5F9]">
          {loading ? (
            <div className="p-16 text-center">
              <RefreshCw size={44} className="mx-auto mb-4 text-[#F97316]/30 animate-spin" />
              <p className="text-[#78716C] font-medium">Loading AI feedback...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <MessageSquare size={44} className="mx-auto mb-4 text-[#F97316]/20" />
              <p className="text-[#78716C] font-medium text-lg">No feedback records found.</p>
              <p className="text-sm text-gray-400 mt-1">AI-generated plans for your clients will appear here.</p>
            </div>
          ) : (
            filtered.map((f: any) => {
              const id = f._id;
              const isOpen = expanded === id;
              const sc = statusConfig[f.status] || { label: f.status, cls: 'bg-gray-100 text-gray-600' };
              const goal = f.fitnessProfile?.goal || f.fitnessProfile?.primaryGoal || '—';
              const summary = f.aiAnalysis?.profileSummary || f.aiAnalysis?.assessment || '';
              const workoutDays = f.workoutRecommendation?.weeklySchedule?.length || f.routine?.length || 0;
              const dietMeals = f.dietRecommendation?.mealPlan?.length || 0;

              return (
                <div key={id} className="transition-all">
                  {/* Row */}
                  <div
                    className="p-5 hover:bg-[#F8FAFA] transition-colors cursor-pointer"
                    onClick={() => toggleExpand(id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F97316]/10 to-[#FED7AA]/20 flex items-center justify-center shrink-0">
                          <User size={22} className="text-[#F97316]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-[#292524] text-base">{clientName(f)}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${sc.cls}`}>{sc.label}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-[#78716C]">
                            {goal !== '—' && (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#78716C]">
                                <Dumbbell size={12} className="text-[#FED7AA]" /> Goal: {goal}
                              </span>
                            )}
                            {workoutDays > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Dumbbell size={11} /> {workoutDays} workout day{workoutDays > 1 ? 's' : ''}
                              </span>
                            )}
                            {dietMeals > 0 && (
                              <span className="inline-flex items-center gap-1">
                                <Salad size={11} /> {dietMeals} meal{dietMeals > 1 ? 's' : ''}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Clock size={11} /> {new Date(f.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {summary && (
                            <p className="text-xs text-[#78716C] mt-1.5 line-clamp-2 max-w-xl">{summary}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setDetail(f); }}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Full View
                        </button>
                        {isOpen ? <ChevronUp size={18} className="text-[#78716C]" /> : <ChevronDown size={18} className="text-[#78716C]" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Preview */}
                  {isOpen && (
                    <div className="bg-[#F8FAFA] border-t border-[#E7E5E4] px-5 pb-5 pt-4 space-y-4">
                      {/* AI Assessment */}
                      {f.aiAnalysis?.assessment && (
                        <div className="bg-white rounded-xl border border-[#E7E5E4] p-4">
                          <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">AI Assessment</p>
                          <p className="text-sm text-[#78716C] leading-relaxed">{f.aiAnalysis.assessment}</p>
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Workout Plan Preview */}
                        {f.workoutRecommendation?.weeklySchedule?.length > 0 && (
                          <div className="bg-white rounded-xl border border-[#E7E5E4] p-4">
                            <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Dumbbell size={13} className="text-[#FED7AA]" /> Workout Plan
                            </p>
                            <div className="space-y-2">
                              {f.workoutRecommendation.weeklySchedule.slice(0, 4).map((day: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span className="font-semibold text-[#292524]">{day.day}</span>
                                  <span className="text-[#78716C] text-xs truncate max-w-[140px]">
                                    {day.isRest ? 'Rest Day' : (day.focus || (day.exercises?.length ? `${day.exercises.length} exercises` : '—'))}
                                  </span>
                                </div>
                              ))}
                              {f.workoutRecommendation.weeklySchedule.length > 4 && (
                                <p className="text-xs text-[#FED7AA] font-semibold">+{f.workoutRecommendation.weeklySchedule.length - 4} more days</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Diet Plan Preview */}
                        {f.dietRecommendation?.mealPlan?.length > 0 && (
                          <div className="bg-white rounded-xl border border-[#E7E5E4] p-4">
                            <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Salad size={13} className="text-[#FED7AA]" /> Diet Plan
                            </p>
                            <div className="space-y-2">
                              {f.dietRecommendation.mealPlan.slice(0, 4).map((meal: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <span className="font-semibold text-[#292524]">{meal.meal || meal.mealType}</span>
                                  <span className="text-[#78716C] text-xs">{meal.calories ? `${meal.calories} kcal` : meal.time || ''}</span>
                                </div>
                              ))}
                              {f.dietRecommendation.mealPlan.length > 4 && (
                                <p className="text-xs text-[#FED7AA] font-semibold">+{f.dietRecommendation.mealPlan.length - 4} more meals</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Revision Notes */}
                      {f.revisionDetails?.reason && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider mb-1">Revision Requested</p>
                          <p className="text-sm text-yellow-900">{f.revisionDetails.reason}</p>
                        </div>
                      )}
                      {f.trainerNotes && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Trainer Notes</p>
                          <p className="text-sm text-green-900">{f.trainerNotes}</p>
                        </div>
                      )}

                      {/* Chat / Discussion Section */}
                      {renderChatSection(f)}

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Full Detail Modal ──────────────────────────────────── */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full mx-auto mt-12 mb-12 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C] p-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={20} className="text-white/80" />
                  <span className="text-white/80 text-sm font-semibold">AI Feedback Report</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{clientName(detail)}</h2>
                <p className="text-white/70 text-sm mt-0.5">
                  {detail.fitnessProfile?.goal || detail.fitnessProfile?.primaryGoal || ''} ·{' '}
                  {new Date(detail.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[detail.status]?.cls || 'bg-white/20 text-white'}`}>
                  {statusConfig[detail.status]?.label || detail.status}
                </span>
                <button onClick={() => setDetail(null)} className="text-white/70 hover:text-white transition-colors"><X size={22} /></button>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Profile Summary */}
              {detail.aiAnalysis?.profileSummary && (
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">Profile Summary</p>
                  <p className="text-sm text-[#78716C] bg-[#F8FAFA] rounded-xl p-4 leading-relaxed border border-[#E7E5E4]">{detail.aiAnalysis.profileSummary}</p>
                </div>
              )}
              {detail.aiAnalysis?.assessment && (
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">AI Assessment</p>
                  <p className="text-sm text-[#78716C] bg-[#F8FAFA] rounded-xl p-4 leading-relaxed border border-[#E7E5E4]">{detail.aiAnalysis.assessment}</p>
                </div>
              )}

              {/* Workout Schedule */}
              {detail.workoutRecommendation?.weeklySchedule?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Dumbbell size={13} className="text-[#FED7AA]" /> Weekly Workout Schedule</p>
                  <div className="space-y-2">
                    {detail.workoutRecommendation.weeklySchedule.map((day: any, i: number) => (
                      <div key={i} className={`flex items-start justify-between p-3 rounded-xl border ${day.isRest ? 'bg-gray-50 border-gray-100' : 'bg-white border-[#E7E5E4]'}`}>
                        <div>
                          <p className="font-bold text-[#292524] text-sm">{day.day}</p>
                          {!day.isRest && day.focus && <p className="text-xs text-[#FED7AA] font-semibold mt-0.5">{day.focus}</p>}
                          {day.isRest && <p className="text-xs text-gray-400 mt-0.5">Rest &amp; Recovery</p>}
                        </div>
                        {!day.isRest && day.exercises?.length > 0 && (
                          <span className="text-xs text-[#78716C] bg-[#FFFDF8] px-2 py-0.5 rounded-full font-semibold">{day.exercises.length} exercises</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet Plan */}
              {detail.dietRecommendation?.mealPlan?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Salad size={13} className="text-[#FED7AA]" /> Diet / Meal Plan</p>
                  <div className="space-y-2">
                    {detail.dietRecommendation.mealPlan.map((meal: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E7E5E4]">
                        <div>
                          <p className="font-bold text-[#292524] text-sm">{meal.meal || meal.mealType}</p>
                          {meal.foods?.length > 0 && <p className="text-xs text-[#78716C] mt-0.5">{meal.foods.slice(0, 3).join(', ')}{meal.foods.length > 3 ? '...' : ''}</p>}
                        </div>
                        <div className="text-right text-xs text-[#78716C]">
                          {meal.time && <p className="font-semibold">{meal.time}</p>}
                          {meal.calories && <p>{meal.calories} kcal</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revision / Notes */}
              {detail.revisionDetails?.reason && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-yellow-800 uppercase mb-1">Revision Reason</p>
                  <p className="text-sm text-yellow-900">{detail.revisionDetails.reason}</p>
                </div>
              )}
              {detail.trainerNotes && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-green-800 uppercase mb-1">Your Trainer Notes</p>
                  <p className="text-sm text-green-900">{detail.trainerNotes}</p>
                </div>
              )}

              {/* AI Re-analysis Comparison Card if applicable */}
              {detail.isReanalysis && detail.reanalysisComparison && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                    <Brain className="text-purple-600" size={18} />
                    <span>AI Re-analysis Progress Comparison</span>
                  </div>
                  <p className="text-xs text-purple-800 leading-relaxed">
                    {detail.reanalysisComparison.progressSummary}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                      <span className="text-gray-500 block">Initial Weight</span>
                      <span className="font-bold text-[#292524]">{detail.reanalysisComparison.initialMetrics?.weight ? `${detail.reanalysisComparison.initialMetrics.weight} kg` : 'N/A'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                      <span className="text-gray-500 block">Current Weight</span>
                      <span className="font-bold text-emerald-600">{detail.reanalysisComparison.currentMetrics?.weight ? `${detail.reanalysisComparison.currentMetrics.weight} kg` : 'N/A'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                      <span className="text-gray-500 block">Attendance Rate</span>
                      <span className="font-bold text-blue-600">{detail.reanalysisComparison.attendanceRate}%</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-purple-100">
                      <span className="text-gray-500 block">Video Completion</span>
                      <span className="font-bold text-indigo-600">{detail.reanalysisComparison.videoCompletionRate}%</span>
                    </div>
                  </div>

                  {detail.reanalysisComparison.areasNeedingAttention?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-900">
                      <span className="font-bold block mb-1">Areas Needing Trainer Attention:</span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {detail.reanalysisComparison.areasNeedingAttention.map((area: string, idx: number) => (
                          <li key={idx}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Chat & Discussion */}
              {renderChatSection(detail)}

              {/* Action Buttons for Trainer Review */}
              {detail.status !== 'Trainer Approved' && detail.status !== 'Sent' && (
                <div className="pt-4 border-t border-[#E7E5E4] flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={async () => {
                      try {
                        const note = prompt('Add optional trainer customization note prior to approval:');
                        await api.post('/ai/trainer/approve', { recommendationId: detail._id, trainerNotes: note });
                        alert('Plan Approved & Finalized!');
                        setDetail(null);
                        fetchFeedbacks();
                      } catch (err: any) {
                        alert(err.response?.data?.message || 'Approval failed');
                      }
                    }}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 size={16} /> Approve &amp; Proceed
                  </button>
                  <button
                    onClick={async () => {
                      const suggestions = prompt('Provide personalized trainer suggestions/changes for the customer plan:\n\nExample: "Replace rice with quinoa; add 1 extra rest day on Wednesday."');
                      if (!suggestions) return;
                      try {
                        await api.post('/ai/trainer/suggest-changes', { recommendationId: detail._id, trainerSuggestions: suggestions });
                        alert('Suggestions sent to customer successfully!');
                        setDetail(null);
                        fetchFeedbacks();
                      } catch (err: any) {
                        alert(err.response?.data?.message || 'Failed to submit suggestions');
                      }
                    }}
                    className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageSquare size={16} /> Suggest Changes
                  </button>
                </div>
              )}

              {/* Approved badge */}
              {(detail.status === 'Trainer Approved' || detail.status === 'Sent') && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                  <CheckCircle2 size={22} className="text-green-600 shrink-0" />
                  <div>
                    <p className="font-bold text-green-800 text-sm">Final Personalized Plan Confirmed</p>
                    <p className="text-xs text-green-700">This plan has been reviewed, approved, and confirmed by you for the customer.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerAIFeedback;
