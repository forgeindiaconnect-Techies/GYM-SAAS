import { useState, useEffect } from 'react';
import {
  Search, MessageSquare, RefreshCw, Brain, CheckCircle2, Clock,
  ChevronDown, ChevronUp, Dumbbell, Salad, User, X, Filter, Send,
  Calendar
} from 'lucide-react';
import api from '../../utils/api';

const statusConfig: Record<string, { label: string; cls: string }> = {
  'AI Generated':       { label: 'AI Generated',       cls: 'bg-[#F3E8E8] text-[#B76E79]' },
  'Trainer Approved':   { label: 'Trainer Approved',   cls: 'bg-green-100 text-green-700' },
  'Sent':               { label: 'Sent to Client',     cls: 'bg-[#F3E8E8] text-[#B76E79]' },
  'Revision Requested': { label: 'Revision Requested', cls: 'bg-yellow-100 text-yellow-700' },
  'Pending':            { label: 'Pending',            cls: 'bg-[#F3E8E8] text-[#292524]' },
};

// ── Date & Timing formatting helpers ─────────────────────────────────────────
const formatDateTime = (dateStr?: string | Date) => {
  if (!dateStr) return { date: '—', time: '—', full: '—' };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { date: '—', time: '—', full: '—' };

  const date = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return {
    date,
    time,
    full: `${date} at ${time}`,
  };
};

const getDateGroupKey = (dateStr?: string | Date) => {
  if (!dateStr) return 'Other Dates';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Other Dates';

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const TrainerAIFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [sortByDate, setSortByDate] = useState<'desc' | 'asc'>('desc');
  const [groupByDate, setGroupByDate] = useState(true);
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
      <div className="space-y-3 pt-3 border-t border-[#E7DADD]">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[#B76E79]" />
          <h4 className="text-xs font-bold text-[#B76E79] uppercase tracking-wider">Chat &amp; Feedback Discussion</h4>
        </div>

        {/* Messages */}
        {item.chatMessages && item.chatMessages.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {item.chatMessages.map((msg: any, idx: number) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border ${
                  msg.senderRole === 'TRAINER'
                    ? 'bg-[#F3E8E8]/90 border-[#E7DADD] ml-4'
                    : 'bg-[#F3E8E8] border-[#F3E8E8]/50 mr-4'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className={msg.senderRole === 'TRAINER' ? 'text-[#B76E79]' : 'text-[#B76E79]'}>
                    {msg.senderRole === 'TRAINER' ? `💬 Trainer (${msg.senderName || 'You'})` : `👤 Member (${msg.senderName || 'Client'})`}
                  </span>
                  <span className="text-[#57534E] font-normal">{msg.date ? new Date(msg.date).toLocaleString() : ''}</span>
                </div>
                <p className="text-sm text-[#292524] whitespace-pre-wrap">{msg.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <>
            {item.memberReply?.message && (
              <div className="bg-[#F3E8E8] border border-[#F3E8E8] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-[#B76E79]" />
                  <p className="text-xs font-bold text-[#B76E79] uppercase tracking-wider">Member's Reply</p>
                  <span className="text-xs text-[#57534E] ml-auto">{new Date(item.memberReply.date).toLocaleString()}</span>
                </div>
                <p className="text-sm text-[#57534E] whitespace-pre-wrap">{item.memberReply.message}</p>
              </div>
            )}
            {item.trainerReply?.message && (
              <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-[#B76E79]" />
                  <p className="text-xs font-bold text-[#B76E79] uppercase tracking-wider">Your Reply</p>
                  <span className="text-xs text-[#57534E] ml-auto">{new Date(item.trainerReply.date).toLocaleString()}</span>
                </div>
                <p className="text-sm text-[#292524] whitespace-pre-wrap">{item.trainerReply.message}</p>
              </div>
            )}
          </>
        )}

        {/* Reply Input Box */}
        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-xl p-3 space-y-2 shadow-sm">
          <textarea
            rows={2}
            value={textValue}
            onChange={e => setReplyTexts(prev => ({ ...prev, [recId]: e.target.value }))}
            placeholder="Write a reply or message to the customer..."
            className="w-full px-3 py-2 text-sm border border-[#E7DADD] rounded-lg focus:outline-none focus:border-[#B76E79] resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleSendReply(recId)}
              disabled={isSending || !textValue.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#B76E79] to-[#9F5965] text-[#FFFFFF] font-bold text-xs font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-sm"
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

  const filtered = feedbacks
    .filter(f => {
      const nameMatch = clientName(f).toLowerCase().includes(search.toLowerCase());
      const statusMatch = statusFilter === 'All' || f.status === statusFilter;
      const dateMatch = !dateFilter || (f.createdAt && new Date(f.createdAt).toISOString().slice(0, 10) === dateFilter);
      return nameMatch && statusMatch && dateMatch;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return sortByDate === 'desc' ? timeB - timeA : timeA - timeB;
    });

  // Group items date-wise
  const dateGroups = filtered.reduce((acc: { key: string; items: any[] }[], f: any) => {
    const key = getDateGroupKey(f.createdAt);
    const existing = acc.find(g => g.key === key);
    if (existing) {
      existing.items.push(f);
    } else {
      acc.push({ key, items: [f] });
    }
    return acc;
  }, []);

  const statuses = ['All', ...Array.from(new Set(feedbacks.map(f => f.status))).filter(Boolean)];

  const toggleExpand = (id: string) => setExpanded(prev => (prev === id ? null : id));

  const renderPlanCard = (f: any) => {
    const id = f._id;
    const isOpen = expanded === id;
    const sc = statusConfig[f.status] || { label: f.status, cls: 'bg-[#F3E8E8] text-[#292524]' };
    const goal = f.fitnessProfile?.goal || f.fitnessProfile?.primaryGoal || '—';
    const summary = f.aiAnalysis?.profileSummary || f.aiAnalysis?.assessment || '';
    const workoutDays = f.workoutRecommendation?.weeklySchedule?.length || f.routine?.length || 0;
    const dietMeals = f.dietRecommendation?.mealPlan?.length || 0;
    const dt = formatDateTime(f.createdAt);

    return (
      <div key={id} className="transition-all">
        {/* Row */}
        <div
          className="p-5 hover:bg-[#F3E8E8] transition-colors cursor-pointer"
          onClick={() => toggleExpand(id)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B76E79]/10 to-[#F3E8E8]/20 flex items-center justify-center shrink-0">
                <User size={22} className="text-[#B76E79]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-[#292524] text-base">{clientName(f)}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${sc.cls}`}>{sc.label}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#57534E]">
                  {goal !== '—' && (
                    <span className="inline-flex items-center gap-1 font-semibold text-[#57534E]">
                      <Dumbbell size={12} className="text-[#B76E79]" /> Goal: {goal}
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

                  {/* Date & Timing Badge */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F3E8E8]/80 border border-[#E7DADD]/60 text-[#292524] font-medium">
                    <Calendar size={12} className="text-[#B76E79]" />
                    <span className="font-semibold text-[#9F5965]">{dt.date}</span>
                    <span className="text-[#57534E]">·</span>
                    <Clock size={12} className="text-[#B76E79]" />
                    <span className="font-bold text-[#292524]">{dt.time}</span>
                  </span>
                </div>
                {summary && (
                  <p className="text-xs text-[#57534E] mt-1.5 line-clamp-2 max-w-xl">{summary}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setDetail(f); }}
                className="px-3 py-1.5 bg-gradient-to-r from-[#B76E79] to-[#9F5965] text-[#FFFFFF] font-bold text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm"
              >
                Full View
              </button>
              {isOpen ? <ChevronUp size={18} className="text-[#57534E]" /> : <ChevronDown size={18} className="text-[#57534E]" />}
            </div>
          </div>
        </div>

        {/* Expanded Preview */}
        {isOpen && (
          <div className="bg-[#F3E8E8] border-t border-[#E7DADD] px-5 pb-5 pt-4 space-y-4">
            {/* AI Assessment */}
            {f.aiAnalysis?.assessment && (
              <div className="bg-[#FFFFFF] rounded-xl border border-[#E7DADD] p-4">
                <p className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-2">AI Assessment</p>
                <p className="text-sm text-[#57534E] leading-relaxed">{f.aiAnalysis.assessment}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Workout Plan Preview */}
              {f.workoutRecommendation?.weeklySchedule?.length > 0 && (
                <div className="bg-[#FFFFFF] rounded-xl border border-[#E7DADD] p-4">
                  <p className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Dumbbell size={13} className="text-[#B76E79]" /> Workout Plan
                  </p>
                  <div className="space-y-2">
                    {f.workoutRecommendation.weeklySchedule.slice(0, 4).map((day: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#292524]">{day.day}</span>
                        <span className="text-xs text-[#57534E]">{day.focus || (day.isRest ? 'Rest Day' : 'Workout')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet Plan Preview */}
              {f.dietRecommendation?.mealPlan?.length > 0 && (
                <div className="bg-[#FFFFFF] rounded-xl border border-[#E7DADD] p-4">
                  <p className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Salad size={13} className="text-[#B76E79]" /> Diet Plan
                  </p>
                  <div className="space-y-2">
                    {f.dietRecommendation.mealPlan.slice(0, 4).map((meal: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#292524]">{meal.meal || meal.mealType}</span>
                        <span className="text-xs text-[#57534E]">{meal.time || `${meal.calories || ''} kcal`}</span>
                      </div>
                    ))}
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
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#B76E79] to-[#9F5965] flex items-center justify-center shadow-lg shadow-[#B76E79]/15">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#292524]">Feedback</h1>
            <p className="text-[#57534E] text-sm">AI-generated plans & feedback for your clients.</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && feedbacks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', count: feedbacks.length, color: 'bg-[#F3E8E8] text-[#B76E79]' },
            { label: 'AI Generated', count: feedbacks.filter(f => f.status === 'AI Generated').length, color: 'bg-[#F3E8E8] text-[#B76E79]' },
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
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E7DADD] bg-[#F3E8E8] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#57534E]" size={18} />
            <input
              type="text"
              placeholder="Search by client name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E7DADD] bg-[#FFFFFF] focus:outline-none focus:border-[#B76E79] text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl px-2.5 py-1.5">
              <Filter size={15} className="text-[#57534E]" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#57534E] focus:outline-none cursor-pointer"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Statuses' : (statusConfig[s]?.label || s)}</option>
                ))}
              </select>
            </div>

            {/* Specific Date Filter */}
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl px-2.5 py-1.5">
              <Calendar size={15} className="text-[#B76E79]" />
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                title="Filter by specific date"
                className="bg-transparent text-xs font-semibold text-[#57534E] focus:outline-none cursor-pointer"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="text-[#57534E] hover:text-[#FFFFFF] p-0.5"
                  title="Clear date filter"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Date Sorting */}
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl px-2.5 py-1.5">
              <Clock size={15} className="text-[#57534E]" />
              <select
                value={sortByDate}
                onChange={e => setSortByDate(e.target.value as 'desc' | 'asc')}
                className="bg-transparent text-xs font-semibold text-[#57534E] focus:outline-none cursor-pointer"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* Group by Date Toggle */}
            <button
              onClick={() => setGroupByDate(g => !g)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                groupByDate
                  ? 'bg-[#B76E79] text-white border-[#B76E79] shadow-sm'
                  : 'bg-[#FFFFFF] text-[#57534E] border-[#E7DADD] hover:bg-[#F3E8E8]'
              }`}
              title="Toggle Date-Wise Grouping"
            >
              <Calendar size={14} />
              <span>{groupByDate ? 'Date-Wise: ON' : 'Date-Wise: OFF'}</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-[#F3E8E8]">
          {loading ? (
            <div className="p-16 text-center">
              <RefreshCw size={44} className="mx-auto mb-4 text-[#B76E79]/30 animate-spin" />
              <p className="text-[#57534E] font-medium">Loading AI feedback...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <MessageSquare size={44} className="mx-auto mb-4 text-[#B76E79]/20" />
              <p className="text-[#57534E] font-medium text-lg">No feedback records found.</p>
              <p className="text-sm text-[#57534E] mt-1">AI-generated plans for your clients will appear here.</p>
            </div>
          ) : groupByDate ? (
            /* ── Date-Wise Grouped View ── */
            dateGroups.map(group => (
              <div key={group.key} className="border-b border-[#E7DADD] last:border-b-0">
                <div className="bg-[#F3E8E8] border-y border-[#F3E8E8]/60 px-5 py-2.5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#B76E79]" />
                    <span className="text-xs font-black text-[#292524] uppercase tracking-wider">{group.key}</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#B76E79] bg-[#F3E8E8]/70 px-2.5 py-0.5 rounded-full border border-[#E7DADD]/50">
                    {group.items.length} {group.items.length === 1 ? 'plan' : 'plans'}
                  </span>
                </div>
                <div className="divide-y divide-[#F3E8E8]">
                  {group.items.map(renderPlanCard)}
                </div>
              </div>
            ))
          ) : (
            /* ── Flat List View ── */
            <div className="divide-y divide-[#F3E8E8]">
              {filtered.map(renderPlanCard)}
            </div>
          )}
        </div>
      </div>

      {/* ── Full Detail Modal ──────────────────────────────────── */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full mx-auto mt-12 mb-12 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#B76E79] to-[#9F5965] p-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={20} className="text-white/80" />
                  <span className="text-white/80 text-sm font-semibold">AI Feedback Report</span>
                </div>
                <h2 className="text-2xl font-bold text-[#292524]">{clientName(detail)}</h2>
                <div className="text-white/80 text-sm mt-1 flex items-center gap-2 flex-wrap">
                  <span>{detail.fitnessProfile?.goal || detail.fitnessProfile?.primaryGoal || 'General Fitness'}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 bg-[#FFFFFF]/20 px-2 py-0.5 rounded-md text-xs font-semibold text-white">
                    <Calendar size={12} /> {formatDateTime(detail.createdAt).date}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#FFFFFF]/20 px-2 py-0.5 rounded-md text-xs font-semibold text-white">
                    <Clock size={12} /> {formatDateTime(detail.createdAt).time}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig[detail.status]?.cls || 'bg-[#FFFFFF]/20 text-white'}`}>
                  {statusConfig[detail.status]?.label || detail.status}
                </span>
                <button onClick={() => setDetail(null)} className="text-white/70 hover:text-white transition-colors"><X size={22} /></button>
              </div>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Profile Summary */}
              {detail.aiAnalysis?.profileSummary && (
                <div>
                  <p className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-2">Profile Summary</p>
                  <p className="text-sm text-[#57534E] bg-[#F3E8E8] rounded-xl p-4 leading-relaxed border border-[#E7DADD]">{detail.aiAnalysis.profileSummary}</p>
                </div>
              )}
              {detail.aiAnalysis?.assessment && (
                <div>
                  <p className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-2">AI Assessment</p>
                  <p className="text-sm text-[#57534E] bg-[#F3E8E8] rounded-xl p-4 leading-relaxed border border-[#E7DADD]">{detail.aiAnalysis.assessment}</p>
                </div>
              )}

              {/* Workout Schedule */}
              {detail.workoutRecommendation?.weeklySchedule?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Dumbbell size={13} className="text-[#B76E79]" /> Weekly Workout Schedule</p>
                  <div className="space-y-2">
                    {detail.workoutRecommendation.weeklySchedule.map((day: any, i: number) => (
                      <div key={i} className={`flex items-start justify-between p-3 rounded-xl border ${day.isRest ? 'bg-[#F3E8E8] border-[#E7DADD]' : 'bg-[#FFFFFF] border-[#E7DADD]'}`}>
                        <div>
                          <p className="font-bold text-[#292524] text-sm">{day.day}</p>
                          {!day.isRest && day.focus && <p className="text-xs text-[#292524] font-medium font-semibold mt-0.5">{day.focus}</p>}
                          {day.isRest && <p className="text-xs text-[#57534E] mt-0.5">Rest &amp; Recovery</p>}
                        </div>
                        {!day.isRest && day.exercises?.length > 0 && (
                          <span className="text-xs text-[#57534E] bg-[#F3E8E8] px-2 py-0.5 rounded-full font-semibold">{day.exercises.length} exercises</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Diet Plan */}
              {detail.dietRecommendation?.mealPlan?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#57534E] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Salad size={13} className="text-[#B76E79]" /> Diet / Meal Plan</p>
                  <div className="space-y-2">
                    {detail.dietRecommendation.mealPlan.map((meal: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#FFFFFF] rounded-xl border border-[#E7DADD]">
                        <div>
                          <p className="font-bold text-[#292524] text-sm">{meal.meal || meal.mealType}</p>
                          {meal.foods?.length > 0 && <p className="text-xs text-[#57534E] mt-0.5">{meal.foods.slice(0, 3).join(', ')}{meal.foods.length > 3 ? '...' : ''}</p>}
                        </div>
                        <div className="text-right text-xs text-[#57534E]">
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
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-[#E7DADD] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[#292524] font-bold text-sm">
                    <Brain className="text-[#B76E79]" size={18} />
                    <span>AI Re-analysis Progress Comparison</span>
                  </div>
                  <p className="text-xs text-[#9F5965] leading-relaxed">
                    {detail.reanalysisComparison.progressSummary}
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#E7DADD]">
                      <span className="text-[#57534E] block">Initial Weight</span>
                      <span className="font-bold text-[#292524]">{detail.reanalysisComparison.initialMetrics?.weight ? `${detail.reanalysisComparison.initialMetrics.weight} kg` : 'N/A'}</span>
                    </div>
                    <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#E7DADD]">
                      <span className="text-[#57534E] block">Current Weight</span>
                      <span className="font-bold text-[#B76E79]">{detail.reanalysisComparison.currentMetrics?.weight ? `${detail.reanalysisComparison.currentMetrics.weight} kg` : 'N/A'}</span>
                    </div>
                    <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#E7DADD]">
                      <span className="text-[#57534E] block">Attendance Rate</span>
                      <span className="font-bold text-[#B76E79]">{detail.reanalysisComparison.attendanceRate}%</span>
                    </div>
                    <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#E7DADD]">
                      <span className="text-[#57534E] block">Video Completion</span>
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
                <div className="pt-4 border-t border-[#E7DADD] flex flex-col sm:flex-row gap-3">
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
