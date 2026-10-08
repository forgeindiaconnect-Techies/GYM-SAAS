import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock, Users, Plus, X, Calendar as CalendarIcon, Video,
  Loader2, Search, Filter, RefreshCw, ChevronRight,
  Eye, Mail, Phone, CheckCircle2, AlertTriangle
} from 'lucide-react';
import api from '../../utils/api';
import TrainerSchedulingTabs from '../../components/Trainer/TrainerSchedulingTabs';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const fmtDateFull = (d: string) => {
  if (!d) return '';
  const dt = new Date(d.split('T')[0]);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

const fmtDay = (d: string) => {
  if (!d) return { day: '', mon: '' };
  const dt = new Date(d.split('T')[0]);
  return { day: dt.getDate().toString().padStart(2, '0'), mon: MONTHS_SHORT[dt.getMonth()].toUpperCase() };
};

const isToday = (d: string) => {
  if (!d) return false;
  const today = new Date();
  const dt = new Date(d.split('T')[0]);
  return dt.getDate() === today.getDate() && dt.getMonth() === today.getMonth() && dt.getFullYear() === today.getFullYear();
};

const isPast = (d: string) => {
  if (!d) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  return new Date(d.split('T')[0]) < today;
};

const normalizeStatus = (s: string) => {
  if (['Confirmed','Upcoming','Approved'].includes(s)) return 'Confirmed';
  if (['Cancelled','Refunded','Refund Pending'].includes(s)) return 'Cancelled';
  return s;
};

const SESSION_TYPES = [
  '1-on-1 Personal Training', 'Group Training', '1-on-1 Online',
  'Consultation', 'Nutrition Session', 'Assessment',
];

const INPUT_CLS = 'w-full px-3.5 py-2.5 text-sm border border-[#E7E5E4] rounded-xl focus:border-[#F97316] focus:outline-none bg-white';
const LABEL_CLS = 'block text-xs font-bold text-[#78716C] mb-1.5 uppercase tracking-wide';

interface SE {
  id: string; bookingId?: string; date: string; startTime: string; endTime?: string;
  type: string; client: string; clientEmail?: string; clientPhone?: string;
  clientPhoto?: string; clientId?: string; duration: string; mode: string;
  status: string; meetingLink?: string; notes?: string; sessionNotes?: any;
  rawSession?: any; isCustom?: boolean;
}

const TrainerSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<SE[]>([]);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('All');
  const [filterDate, setFilterDate] = useState('All');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [detailModal, setDetailModal] = useState<SE | null>(null);
  const [addModal, setAddModal] = useState(false);

  const [addForm, setAddForm] = useState({
    type: '1-on-1 Personal Training', client: '', date: '',
    startTime: '09:00', endTime: '10:00', mode: 'Online', notes: '',
  });

  const fetchSessions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const res = await api.get('/trainer-sessions/trainer');
      if (res.data.success) {
        const mapped: SE[] = (res.data.sessions || []).map((s: any) => ({
          id: s._id,
          bookingId: s.bookingId || s._id.slice(-6).toUpperCase(),
          date: s.date,
          startTime: s.startTime || '',
          endTime: s.endTime || '',
          type: s.mode === 'Online' ? '1-on-1 Online' : '1-on-1 Personal Training',
          client: s.customerId
            ? (s.customerId.firstName || '') + ' ' + (s.customerId.lastName || '')
            : 'Member',
          clientEmail: s.customerId?.email,
          clientPhone: s.customerId?.mobile,
          clientPhoto: s.customerId?.profilePhoto,
          clientId: s.customerId?._id,
          duration: s.duration ? (s.duration + ' min') : '60 min',
          mode: s.mode || 'Offline',
          status: normalizeStatus(s.status || 'Pending'),
          meetingLink: s.meetingLink,
          sessionNotes: s.sessionNotes,
          rawSession: s,
        }));
        mapped.sort((a, b) => {
          const da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
          if (da !== db) return da - db;
          return a.startTime.localeCompare(b.startTime);
        });
        setSessions(mapped);
      }
    } catch (err) { console.error('Schedule fetch error', err); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const todayCount = useMemo(() => sessions.filter(s => isToday(s.date) && s.status !== 'Cancelled' && s.status !== 'Rejected').length, [sessions]);
  const upcomingCount = useMemo(() => sessions.filter(s => !isPast(s.date) && !isToday(s.date) && s.status !== 'Completed' && s.status !== 'Cancelled' && s.status !== 'Rejected').length, [sessions]);
  const pendingCount = useMemo(() => sessions.filter(s => s.status === 'Pending').length, [sessions]);
  const completedCount = useMemo(() => sessions.filter(s => s.status === 'Completed').length, [sessions]);

  const filtered = useMemo(() => sessions.filter(s => {
    if (search) {
      const q = search.toLowerCase();
      if (!s.client.toLowerCase().includes(q) && !s.type.toLowerCase().includes(q) && !(s.bookingId || '').toLowerCase().includes(q)) return false;
    }
    if (filterMode !== 'All' && s.mode !== filterMode) return false;
    if (filterDate === 'Today' && !isToday(s.date)) return false;
    if (filterDate === 'This Week') {
      const now = new Date(); const day = now.getDay();
      const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); mon.setHours(0,0,0,0);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
      const dt = new Date(s.date); if (dt < mon || dt > sun) return false;
    }
    if (filterDate === 'This Month') {
      const now = new Date(); const dt = new Date(s.date);
      if (dt.getMonth() !== now.getMonth() || dt.getFullYear() !== now.getFullYear()) return false;
    }
    if (filterDate === 'Custom' && customFrom && customTo) {
      const dt = new Date(s.date.split('T')[0]);
      if (dt < new Date(customFrom) || dt > new Date(customTo)) return false;
    }
    return true;
  }), [sessions, search, filterMode, filterDate, customFrom, customTo]);

  const handleAddCustomBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.client.trim() || !addForm.date) { alert('Client name and date are required.'); return; }
    if (addForm.endTime <= addForm.startTime) { alert('End time must be after start time.'); return; }
    const newEvt: SE = {
      id: 'custom-' + Date.now(),
      date: addForm.date, startTime: addForm.startTime, endTime: addForm.endTime,
      type: addForm.type, client: addForm.client, duration: '60 min',
      mode: addForm.mode, status: 'Confirmed', notes: addForm.notes, isCustom: true,
    };
    setSessions(prev => [...prev, newEvt].sort((a, b) => {
      const da = new Date(a.date).getTime(), db = new Date(b.date).getTime();
      if (da !== db) return da - db;
      return a.startTime.localeCompare(b.startTime);
    }));
    setAddModal(false);
    setAddForm({ type: '1-on-1 Personal Training', client: '', date: '', startTime: '09:00', endTime: '10:00', mode: 'Online', notes: '' });
  };

  const summaryCards = [
    { label: "Today's Sessions", value: todayCount, icon: CalendarIcon, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Upcoming', value: upcomingCount, icon: ChevronRight, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Pending Requests', value: pendingCount, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-slate-600 bg-slate-50 border-slate-200' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">
      <TrainerSchedulingTabs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Schedule</h1>
          <p className="text-[#78716C] mt-0.5 text-sm">Manage your upcoming sessions, member appointments, and availability.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => fetchSessions(true)} disabled={refreshing}
            className="w-10 h-10 border border-[#E7E5E4] rounded-2xl bg-white text-[#78716C] hover:bg-[#FFFDF8] flex items-center justify-center transition-colors disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setAddModal(true)}
            className="px-5 py-2.5 bg-[#F97316] text-white rounded-full font-bold flex items-center gap-2 hover:bg-[#0d3535] transition-colors shadow-sm text-sm">
            <Plus size={16} /> Schedule Online Session
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex items-center gap-3">
            <div className={'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ' + card.color}>
              <card.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#292524] leading-none">{card.value}</p>
              <p className="text-xs text-[#78716C] font-medium mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search member, session type, booking ID..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E7E5E4] rounded-xl focus:border-[#F97316] focus:outline-none" />
          </div>
          <select value={filterMode} onChange={e => setFilterMode(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-[#E7E5E4] rounded-xl focus:border-[#F97316] focus:outline-none bg-white text-[#78716C]">
            <option value="All">All Modes</option>
            <option value="Online">Online</option>
            <option value="Offline">In-Person</option>
          </select>
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-[#E7E5E4] rounded-xl focus:border-[#F97316] focus:outline-none bg-white text-[#78716C]">
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Custom">Custom Range</option>
          </select>
          <span className="flex items-center gap-1 text-xs text-[#78716C] font-medium whitespace-nowrap">
            <Filter size={12} />
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        {filterDate === 'Custom' && (
          <div className="flex gap-3 items-center pt-2">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-[#E7E5E4] rounded-xl focus:border-[#F97316] focus:outline-none" />
            <span className="text-[#78716C] text-sm">to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="px-3 py-2 text-sm border border-[#E7E5E4] rounded-xl focus:border-[#F97316] focus:outline-none" />
          </div>
        )}
      </div>

      {/* Session List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-[#F97316]" size={40} />
          <p className="text-[#78716C] text-sm">Loading your schedule...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-16 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFFDF8] flex items-center justify-center">
            <CalendarIcon size={32} className="text-[#78716C]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#292524]">No scheduled sessions found</h3>
            <p className="text-[#78716C] text-sm mt-1">No sessions match your search or date filter.</p>
          </div>
          <button onClick={() => setAddModal(true)}
            className="px-5 py-2.5 bg-[#F97316] text-white rounded-xl font-bold text-sm hover:bg-[#EA580C] flex items-center gap-2">
            <Plus size={15} /> Add Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const { day, mon } = fmtDay(s.date);
            const todayBadge = isToday(s.date);
            const accentColor = s.status === 'Pending' ? 'bg-amber-400'
              : s.status === 'Confirmed' ? 'bg-emerald-500'
              : s.status === 'In Progress' ? 'bg-blue-500'
              : s.status === 'Completed' ? 'bg-slate-400'
              : s.status === 'Awaiting Payment' ? 'bg-orange-400'
              : s.status === 'Rejected' ? 'bg-rose-500'
              : 'bg-red-400';

            return (
              <div key={s.id}
                className={'bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-all ' + (todayBadge ? 'border-[#F97316]/50 ring-1 ring-[#F97316]/20' : 'border-[#E7E5E4]')}>
                <div className={'h-1 w-full ' + accentColor} />
                <div className="flex items-stretch">
                  <div className={'flex flex-col items-center justify-center px-4 py-4 min-w-[76px] shrink-0 border-r border-[#FFFDF8] ' + (todayBadge ? 'bg-[#F97316]' : 'bg-[#F8FAFC]')}>
                    <span className={'text-2xl font-black leading-none ' + (todayBadge ? 'text-white' : 'text-[#292524]')}>{day}</span>
                    <span className={'text-[10px] font-bold tracking-widest mt-0.5 ' + (todayBadge ? 'text-[#EA580C]' : 'text-[#F97316]')}>{mon}</span>
                    {todayBadge && <span className="text-[9px] text-white/80 font-bold mt-1 tracking-wider">TODAY</span>}
                  </div>
                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#292524] text-sm">{s.type}</h3>
                        {s.bookingId && !s.isCustom && (
                          <span className="text-[10px] font-mono text-[#78716C] bg-[#FFFDF8] border border-[#E7E5E4] px-2 py-0.5 rounded-full">
                            {'#' + s.bookingId}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#78716C]">
                        <span className="flex items-center gap-1.5 font-semibold text-[#F97316]">
                          <Clock size={13} />
                          {s.startTime}{s.endTime ? ' – ' + s.endTime : ''} &middot; {s.duration}
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-[#292524]">
                          <Users size={13} />{s.client}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setDetailModal(s)}
                        title="View Details"
                        className="p-2.5 border border-[#E7E5E4] rounded-xl text-[#78716C] hover:bg-[#FFFDF8] hover:text-[#F97316] transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E7E5E4] overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className={'h-1.5 w-full ' + (detailModal.status === 'Pending' ? 'bg-amber-400' : detailModal.status === 'Confirmed' ? 'bg-emerald-500' : detailModal.status === 'In Progress' ? 'bg-blue-500' : detailModal.status === 'Completed' ? 'bg-slate-400' : 'bg-red-400')} />
            <div className="px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <h3 className="text-base font-bold text-[#292524]">{detailModal.type}</h3>
                {detailModal.bookingId && (
                  <p className="text-[10px] font-mono text-[#F97316] mt-0.5">{'Booking #' + detailModal.bookingId}</p>
                )}
              </div>
              <button onClick={() => setDetailModal(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#F8FAFC] border border-[#E8EAED] rounded-xl p-4">
                <p className="text-xs font-bold text-[#F97316] uppercase tracking-wider mb-2">Session Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-xs text-[#78716C] block">Date</span><span className="font-semibold text-[#292524] text-xs">{fmtDateFull(detailModal.date)}</span></div>
                  <div><span className="text-xs text-[#78716C] block">Time</span><span className="font-semibold text-[#292524] text-xs">{detailModal.startTime}{detailModal.endTime ? ' – ' + detailModal.endTime : ''}</span></div>
                  <div><span className="text-xs text-[#78716C] block">Duration</span><span className="font-semibold text-[#292524] text-xs">{detailModal.duration}</span></div>
                  <div><span className="text-xs text-[#78716C] block">Type</span><span className="font-semibold text-[#292524] text-xs">{detailModal.type}</span></div>
                </div>
              </div>
              <div className="bg-[#F8FAFC] border border-[#E8EAED] rounded-xl p-4">
                <p className="text-xs font-bold text-[#F97316] uppercase tracking-wider mb-2">Member Information</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F97316]/10 border border-[#E7E5E4] flex items-center justify-center shrink-0 overflow-hidden">
                    {detailModal.clientPhoto
                      ? <img src={detailModal.clientPhoto} alt="" className="w-full h-full object-cover" />
                      : <span className="font-bold text-[#F97316]">{detailModal.client.charAt(0)}</span>}
                  </div>
                  <div>
                    <p className="font-bold text-[#292524] text-sm">{detailModal.client}</p>
                    {detailModal.clientEmail && <p className="text-xs text-[#78716C] flex items-center gap-1"><Mail size={10} />{detailModal.clientEmail}</p>}
                    {detailModal.clientPhone && <p className="text-xs text-[#78716C] flex items-center gap-1"><Phone size={10} />{detailModal.clientPhone}</p>}
                  </div>
                </div>
              </div>
              {detailModal.mode === 'Online' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-blue-800 mb-1.5">Jitsi Meeting Room</p>
                  <a href={detailModal.meetingLink || ('https://meet.jit.si/aigym-' + detailModal.bookingId)}
                    target="_blank" rel="noreferrer"
                    className="text-blue-600 font-semibold hover:underline text-xs flex items-center gap-1.5 break-all">
                    <Video size={13} />
                    {detailModal.meetingLink || ('meet.jit.si/aigym-' + detailModal.bookingId)}
                  </a>
                </div>
              )}
              {detailModal.sessionNotes?.exercisesCompleted && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#78716C]">
                  <p className="font-bold text-[#292524] mb-1">Session Notes</p>
                  <p>{detailModal.sessionNotes.exercisesCompleted}</p>
                </div>
              )}
              <div className="pt-3 border-t border-[#E7E5E4] flex justify-end">
                <button onClick={() => setDetailModal(null)} className="px-5 py-2.5 bg-[#F97316] text-white rounded-xl text-xs font-bold hover:bg-[#EA580C]">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E7E5E4] overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#F8FAFC]">
              <h3 className="font-bold text-[#292524]">Add Schedule Block</h3>
              <button onClick={() => setAddModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddCustomBlock} className="p-6 space-y-4">
              <div>
                <label className={LABEL_CLS}>Member / Client Name</label>
                <input type="text" required value={addForm.client} onChange={e => setAddForm({...addForm, client: e.target.value})}
                  placeholder="e.g. John Doe" className={INPUT_CLS} />
              </div>
              <div>
                <label className={LABEL_CLS}>Session Type</label>
                <select value={addForm.type} onChange={e => setAddForm({...addForm, type: e.target.value})} className={INPUT_CLS}>
                  {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLS}>Date</label>
                  <input type="date" required value={addForm.date} onChange={e => setAddForm({...addForm, date: e.target.value})} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>Mode</label>
                  <select value={addForm.mode} onChange={e => setAddForm({...addForm, mode: e.target.value})} className={INPUT_CLS}>
                    <option value="Online">Online</option>
                    <option value="Offline">In-Person</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLS}>Start Time</label>
                  <input type="time" required value={addForm.startTime} onChange={e => setAddForm({...addForm, startTime: e.target.value})} className={INPUT_CLS} />
                </div>
                <div>
                  <label className={LABEL_CLS}>End Time</label>
                  <input type="time" required value={addForm.endTime} onChange={e => setAddForm({...addForm, endTime: e.target.value})} className={INPUT_CLS} />
                </div>
              </div>
              <div>
                <label className={LABEL_CLS}>Notes (Optional)</label>
                <textarea rows={2} value={addForm.notes} onChange={e => setAddForm({...addForm, notes: e.target.value})}
                  placeholder="Special instructions or notes..." className={INPUT_CLS} />
              </div>
              <div className="pt-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setAddModal(false)} className="px-4 py-2.5 border border-[#E7E5E4] rounded-xl text-sm font-semibold text-[#78716C] hover:bg-[#FFFDF8]">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#F97316] text-white rounded-xl text-sm font-bold hover:bg-[#EA580C]">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrainerSchedule;
