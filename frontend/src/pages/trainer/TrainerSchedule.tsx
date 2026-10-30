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

const INPUT_CLS = 'w-full px-3.5 py-2.5 text-sm border border-[#E7DADD] rounded-xl focus:border-[#B76E79] focus:outline-none bg-[#FFFFFF]';
const LABEL_CLS = 'block text-xs font-bold text-[#57534E] mb-1.5 uppercase tracking-wide';

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
    { label: "Today's Sessions", value: todayCount, icon: CalendarIcon, color: 'text-[#B76E79] bg-[#F3E8E8] border-[#E7DADD]' },
    { label: 'Upcoming', value: upcomingCount, icon: ChevronRight, color: 'text-[#B76E79] bg-[#F3E8E8] border-[#E7DADD]' },
    { label: 'Pending Requests', value: pendingCount, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-[#292524] bg-[#F3E8E8] border-[#E7DADD]' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-10">
      <TrainerSchedulingTabs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Schedule</h1>
          <p className="text-[#57534E] mt-0.5 text-sm">Manage your upcoming sessions, member appointments, and availability.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setAddModal(true)}
            className="px-5 py-2.5 bg-[#B76E79] text-white font-bold rounded-full font-bold flex items-center gap-2 hover:bg-[#9F5965] transition-colors shadow-sm text-sm">
            <Plus size={16} /> Schedule Online Session
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-4 flex items-center gap-3">
            <div className={'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ' + card.color}>
              <card.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#292524] leading-none">{card.value}</p>
              <p className="text-xs text-[#57534E] font-medium mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-4 space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#57534E]" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search member, session type, booking ID..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E7DADD] rounded-xl focus:border-[#B76E79] focus:outline-none" />
          </div>
          <select value={filterMode} onChange={e => setFilterMode(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-[#E7DADD] rounded-xl focus:border-[#B76E79] focus:outline-none bg-[#FFFFFF] text-[#57534E]">
            <option value="All">All Modes</option>
            <option value="Online">Online</option>
            <option value="Offline">In-Person</option>
          </select>
          <select value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="px-3.5 py-2.5 text-sm border border-[#E7DADD] rounded-xl focus:border-[#B76E79] focus:outline-none bg-[#FFFFFF] text-[#57534E]">
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Custom">Custom Range</option>
          </select>
          <span className="flex items-center gap-1 text-xs text-[#57534E] font-medium whitespace-nowrap">
            <Filter size={12} />
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        {filterDate === 'Custom' && (
          <div className="flex gap-3 items-center pt-2">
            <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-[#E7DADD] rounded-xl focus:border-[#B76E79] focus:outline-none" />
            <span className="text-[#57534E] text-sm">to</span>
            <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="px-3 py-2 text-sm border border-[#E7DADD] rounded-xl focus:border-[#B76E79] focus:outline-none" />
          </div>
        )}
      </div>

      {/* Session List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="animate-spin text-[#B76E79]" size={40} />
          <p className="text-[#57534E] text-sm">Loading your schedule...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-16 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F3E8E8] flex items-center justify-center">
            <CalendarIcon size={32} className="text-[#57534E]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#292524]">No scheduled sessions found</h3>
            <p className="text-[#57534E] text-sm mt-1">No sessions match your search or date filter.</p>
          </div>
          <button onClick={() => setAddModal(true)}
            className="px-5 py-2.5 bg-[#B76E79] text-white font-bold rounded-xl font-bold text-sm hover:bg-[#9F5965] flex items-center gap-2">
            <Plus size={15} /> Add Schedule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            const { day, mon } = fmtDay(s.date);
            const todayBadge = isToday(s.date);
            const accentColor = s.status === 'Pending' ? 'bg-amber-400'
              : s.status === 'Confirmed' ? 'bg-[#B76E79]'
              : s.status === 'In Progress' ? 'bg-[#B76E79]'
              : s.status === 'Completed' ? 'bg-slate-400'
              : s.status === 'Awaiting Payment' ? 'bg-[#B76E79]'
              : s.status === 'Rejected' ? 'bg-rose-500'
              : 'bg-red-400';

            return (
              <div key={s.id}
                className={'bg-[#FFFFFF] border rounded-2xl overflow-hidden hover:shadow-md transition-all ' + (todayBadge ? 'border-[#B76E79]/50 ring-1 ring-[#B76E79]/20' : 'border-[#E7DADD]')}>
                <div className={'h-1 w-full ' + accentColor} />
                <div className="flex items-stretch">
                  <div className={'flex flex-col items-center justify-center px-4 py-4 min-w-[76px] shrink-0 border-r border-[#F3E8E8] ' + (todayBadge ? 'bg-[#B76E79]' : 'bg-[#F3E8E8]')}>
                    <span className={'text-2xl font-black leading-none ' + (todayBadge ? 'text-white' : 'text-[#292524]')}>{day}</span>
                    <span className={'text-[10px] font-bold tracking-widest mt-0.5 ' + (todayBadge ? 'text-[#B76E79]' : 'text-[#B76E79]')}>{mon}</span>
                    {todayBadge && <span className="text-[9px] text-white/80 font-bold mt-1 tracking-wider">TODAY</span>}
                  </div>
                  <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#292524] text-sm">{s.type}</h3>
                        {s.bookingId && !s.isCustom && (
                          <span className="text-[10px] font-mono text-[#57534E] bg-[#F3E8E8] border border-[#E7DADD] px-2 py-0.5 rounded-full">
                            {'#' + s.bookingId}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#57534E]">
                        <span className="flex items-center gap-1.5 font-semibold text-[#B76E79]">
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
                        className="p-2.5 border border-[#E7DADD] rounded-xl text-[#57534E] hover:bg-[#F3E8E8] hover:text-[#B76E79] transition-colors">
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
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full shadow-2xl border border-[#E7DADD] overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className={'h-1.5 w-full ' + (detailModal.status === 'Pending' ? 'bg-amber-400' : detailModal.status === 'Confirmed' ? 'bg-[#B76E79]' : detailModal.status === 'In Progress' ? 'bg-[#B76E79]' : detailModal.status === 'Completed' ? 'bg-slate-400' : 'bg-red-400')} />
            <div className="px-6 py-4 border-b border-[#E7DADD] flex items-center justify-between bg-[#F3E8E8]">
              <div>
                <h3 className="text-base font-bold text-[#292524]">{detailModal.type}</h3>
                {detailModal.bookingId && (
                  <p className="text-[10px] font-mono text-[#B76E79] mt-0.5">{'Booking #' + detailModal.bookingId}</p>
                )}
              </div>
              <button onClick={() => setDetailModal(null)} className="p-1.5 text-[#57534E] hover:text-[#292524] rounded-lg hover:bg-[#F3E8E8]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#F3E8E8] border border-[#E8EAED] rounded-xl p-4">
                <p className="text-xs font-bold text-[#B76E79] uppercase tracking-wider mb-2">Session Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-xs text-[#57534E] block">Date</span><span className="font-semibold text-[#292524] text-xs">{fmtDateFull(detailModal.date)}</span></div>
                  <div><span className="text-xs text-[#57534E] block">Time</span><span className="font-semibold text-[#292524] text-xs">{detailModal.startTime}{detailModal.endTime ? ' – ' + detailModal.endTime : ''}</span></div>
                  <div><span className="text-xs text-[#57534E] block">Duration</span><span className="font-semibold text-[#292524] text-xs">{detailModal.duration}</span></div>
                  <div><span className="text-xs text-[#57534E] block">Type</span><span className="font-semibold text-[#292524] text-xs">{detailModal.type}</span></div>
                </div>
              </div>
              <div className="bg-[#F3E8E8] border border-[#E8EAED] rounded-xl p-4">
                <p className="text-xs font-bold text-[#B76E79] uppercase tracking-wider mb-2">Member Information</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#B76E79]/10 border border-[#E7DADD] flex items-center justify-center shrink-0 overflow-hidden">
                    {detailModal.clientPhoto
                      ? <img src={detailModal.clientPhoto} alt="" className="w-full h-full object-cover" />
                      : <span className="font-bold text-[#B76E79]">{detailModal.client.charAt(0)}</span>}
                  </div>
                  <div>
                    <p className="font-bold text-[#292524] text-sm">{detailModal.client}</p>
                    {detailModal.clientEmail && <p className="text-xs text-[#57534E] flex items-center gap-1"><Mail size={10} />{detailModal.clientEmail}</p>}
                    {detailModal.clientPhone && <p className="text-xs text-[#57534E] flex items-center gap-1"><Phone size={10} />{detailModal.clientPhone}</p>}
                  </div>
                </div>
              </div>
              {detailModal.mode === 'Online' && (
                <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-xl p-3">
                  <p className="text-xs font-bold text-[#B76E79] mb-1.5">Jitsi Meeting Room</p>
                  <a href={detailModal.meetingLink || ('https://meet.jit.si/aigym-' + detailModal.bookingId)}
                    target="_blank" rel="noreferrer"
                    className="text-[#B76E79] font-semibold hover:underline text-xs flex items-center gap-1.5 break-all">
                    <Video size={13} />
                    {detailModal.meetingLink || ('meet.jit.si/aigym-' + detailModal.bookingId)}
                  </a>
                </div>
              )}
              {detailModal.sessionNotes?.exercisesCompleted && (
                <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-xl p-3 text-xs text-[#57534E]">
                  <p className="font-bold text-[#292524] mb-1">Session Notes</p>
                  <p>{detailModal.sessionNotes.exercisesCompleted}</p>
                </div>
              )}
              <div className="pt-3 border-t border-[#E7DADD] flex justify-end">
                <button onClick={() => setDetailModal(null)} className="px-5 py-2.5 bg-[#B76E79] text-white font-bold rounded-xl text-xs font-bold hover:bg-[#9F5965]">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#E7DADD] overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[#E7DADD] flex items-center justify-between bg-[#F3E8E8]">
              <h3 className="font-bold text-[#292524]">Add Schedule Block</h3>
              <button onClick={() => setAddModal(false)} className="p-1.5 text-[#57534E] hover:text-[#292524] rounded-lg hover:bg-[#F3E8E8]"><X size={18} /></button>
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
                <button type="button" onClick={() => setAddModal(false)} className="px-4 py-2.5 border border-[#E7DADD] rounded-xl text-sm font-semibold text-[#57534E] hover:bg-[#F3E8E8]">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-[#B76E79] text-white font-bold rounded-xl text-sm font-bold hover:bg-[#9F5965]">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrainerSchedule;
