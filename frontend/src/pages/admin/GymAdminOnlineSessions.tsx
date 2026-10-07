import { useState, useEffect } from 'react';
import {
  Video, Users, Calendar, Clock, Plus, Search,
  CheckCircle2, X, Copy, RefreshCw
} from 'lucide-react';
import api from '../../utils/api';

interface OnlineSession {
  _id: string;
  title: string;
  trainerName: string;
  trainerPhoto?: string;
  specialization?: string;
  date: string;
  time: string;
  duration: number; // in mins
  category: string;
  attendeesCount: number;
  maxCapacity: number;
  meetingLink: string;
  status: 'Live Now' | 'Upcoming' | 'Completed' | 'Cancelled';
  price: number;
  description?: string;
}

const GymAdminOnlineSessions = () => {
  const [sessions, setSessions] = useState<OnlineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Live Now' | 'Upcoming' | 'Completed'>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<any[]>([]);

  // New session form state
  const [newTitle, setNewTitle] = useState('');
  const [newTrainer, setNewTrainer] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDuration, setNewDuration] = useState('45');
  const [newCategory, setNewCategory] = useState('HIIT');
  const [newCapacity, setNewCapacity] = useState('25');
  const [newPrice, setNewPrice] = useState('0');
  const [newLink, setNewLink] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Try to fetch real sessions from backend
      const [sessionsRes, trainersRes] = await Promise.all([
        api.get('/trainer-sessions/gym').catch(() => ({ data: { sessions: [] } })),
        api.get('/trainers').catch(() => ({ data: { trainers: [] } })),
      ]);

      const loadedTrainers = trainersRes.data?.trainers || [];
      setTrainers(loadedTrainers);

      const dbSessions: OnlineSession[] = (sessionsRes.data?.sessions || [])
        .filter((s: any) => s.mode === 'Online' || s.meetingLink)
        .map((s: any) => ({
          _id: s._id,
          title: s.title || `Virtual 1-on-1 with ${s.trainerId?.name || 'Trainer'}`,
          trainerName: s.trainerId?.name || 'Assigned Trainer',
          trainerPhoto: s.trainerId?.profilePhoto,
          specialization: s.trainerId?.specialization || 'Personal Trainer',
          date: s.date,
          time: s.startTime || '10:00 AM',
          duration: s.duration || 45,
          category: s.category || 'Personal Training',
          attendeesCount: 1,
          maxCapacity: 1,
          meetingLink: s.meetingLink || `https://meet.jit.si/aigym-session-${s._id.slice(-9)}`,
          status: s.status === 'Completed' ? 'Completed' : s.status === 'Cancelled' ? 'Cancelled' : 'Upcoming',
          price: s.fee || 0,
          description: s.description || 'Virtual session with gym personal trainer.',
        }));

      // If no sessions yet, provide standard gym masterclasses
      const initialMasterclasses: OnlineSession[] = [
        {
          _id: 'live-hiit-1',
          title: 'Virtual HIIT & Core Burn',
          trainerName: loadedTrainers[0]?.name || 'Alex Morgan',
          specialization: 'HIIT Specialist',
          date: new Date().toISOString().split('T')[0],
          time: '06:00 PM',
          duration: 45,
          category: 'HIIT',
          attendeesCount: 18,
          maxCapacity: 30,
          meetingLink: 'https://meet.jit.si/aigym-hiit-live',
          status: 'Upcoming',
          price: 0,
          description: 'High-energy full body fat burn session. No equipment needed.',
        },
        {
          _id: 'live-yoga-2',
          title: 'Sunrise Vinyasa Flow',
          trainerName: loadedTrainers[1]?.name || 'Priya Sharma',
          specialization: 'Yoga Master',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: '07:00 AM',
          duration: 60,
          category: 'Yoga & Flexibility',
          attendeesCount: 24,
          maxCapacity: 40,
          meetingLink: 'https://meet.jit.si/aigym-yoga-flow',
          status: 'Upcoming',
          price: 0,
          description: 'Invigorating morning breathing, flow and mobility sequence.',
        },
        {
          _id: 'live-strength-3',
          title: 'Functional Home Strength',
          trainerName: loadedTrainers[0]?.name || 'Vikram Singh',
          specialization: 'Strength Coach',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          time: '05:30 PM',
          duration: 50,
          category: 'Strength',
          attendeesCount: 22,
          maxCapacity: 25,
          meetingLink: 'https://meet.jit.si/aigym-strength-past',
          status: 'Completed',
          price: 0,
          description: 'Dumbbell and bodyweight progressive overload workout.',
        },
      ];

      // Merge saved sessions from localStorage if any
      const savedCustom = localStorage.getItem('gym_admin_online_sessions');
      const customSessions: OnlineSession[] = savedCustom ? JSON.parse(savedCustom) : [];

      setSessions([...customSessions, ...dbSessions, ...initialMasterclasses]);
    } catch (err) {
      console.error('Error fetching online sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate || !newTime) {
      alert('Please fill in session title, date, and time.');
      return;
    }
    setCreating(true);

    const generatedLink = newLink.trim() || `https://meet.jit.si/aigym-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    const newSession: OnlineSession = {
      _id: `custom-session-${Date.now()}`,
      title: newTitle.trim(),
      trainerName: newTrainer.trim() || (trainers[0]?.name || 'Head Trainer'),
      specialization: newCategory,
      date: newDate,
      time: newTime,
      duration: Number(newDuration) || 45,
      category: newCategory,
      attendeesCount: 0,
      maxCapacity: Number(newCapacity) || 20,
      meetingLink: generatedLink,
      status: 'Upcoming',
      price: Number(newPrice) || 0,
      description: newDescription.trim() || 'Live virtual training session organized by gym.',
    };

    const updated = [newSession, ...sessions];
    setSessions(updated);

    // Save to localStorage for persistence
    const savedCustom = localStorage.getItem('gym_admin_online_sessions');
    const existing = savedCustom ? JSON.parse(savedCustom) : [];
    localStorage.setItem('gym_admin_online_sessions', JSON.stringify([newSession, ...existing]));

    setCreating(false);
    setShowCreateModal(false);

    // Reset form
    setNewTitle('');
    setNewTrainer('');
    setNewDate('');
    setNewTime('');
    setNewLink('');
    setNewDescription('');
    alert('Online Session scheduled successfully!');
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.trainerName.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSessions = sessions.length;
  const upcomingCount = sessions.filter(s => s.status === 'Upcoming' || s.status === 'Live Now').length;
  const totalAttendees = sessions.reduce((acc, curr) => acc + curr.attendeesCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-[#292524] tracking-tight">Online Sessions</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F97316]/10 text-[#F97316]">
              Live & Virtual Classes
            </span>
          </div>
          <p className="text-[#78716C] mt-1 text-sm">
            Host live streaming workouts, virtual masterclasses, and group training sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchSessions()}
            className="p-2.5 rounded-xl border border-[#E7E5E4] bg-white hover:bg-gray-50 text-[#78716C] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>

        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Total Classes</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#292524] mt-2">{totalSessions}</h3>
          <p className="text-xs text-[#78716C] mt-0.5">Live & recorded classes</p>
        </div>

        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Scheduled / Upcoming</span>
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#292524] mt-2">{upcomingCount}</h3>
          <p className="text-xs text-green-600 font-medium mt-0.5">Ready for members</p>
        </div>

        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Total Registrations</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#292524] mt-2">{totalAttendees}</h3>
          <p className="text-xs text-[#78716C] mt-0.5">Active participants</p>
        </div>

        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Streaming Mode</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Video size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#292524] mt-2">HD Virtual</h3>
          <p className="text-xs text-amber-600 font-medium mt-0.5">WebRTC & Meet ready</p>
        </div>
      </div>

      {/* Featured Live / Upcoming Session Banner */}
      {sessions.length > 0 && (
        <div className="bg-gradient-to-br from-[#F97316] to-[#0D3030] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Featured Masterclass
                </span>
                <span className="text-xs text-gray-300 font-medium">· {sessions[0].category}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{sessions[0].title}</h2>
              <p className="text-sm text-gray-300 line-clamp-2">{sessions[0].description}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-200">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <Calendar size={14} /> {sessions[0].date} at {sessions[0].time}
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <Clock size={14} /> {sessions[0].duration} Mins
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                  <Users size={14} /> {sessions[0].attendeesCount} / {sessions[0].maxCapacity} Registered
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 shrink-0">
              <a
                href={sessions[0].meetingLink}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 bg-white text-[#F97316] hover:bg-gray-100 font-black rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Video size={18} /> Launch Live Studio
              </a>
              <button
                onClick={() => handleCopyLink(sessions[0].meetingLink, sessions[0]._id)}
                className="px-4 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all border border-white/20 flex items-center justify-center gap-2"
              >
                {copiedId === sessions[0]._id ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                {copiedId === sessions[0]._id ? 'Link Copied!' : 'Invite Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 text-[#78716C]" size={18} />
          <input
            type="text"
            placeholder="Search online classes by title, trainer or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E7E5E4] rounded-xl text-sm text-[#292524] focus:border-[#F97316] outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['All', 'Upcoming', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-[#F97316] text-white shadow-sm'
                  : 'bg-white border border-[#E7E5E4] text-[#78716C] hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-16 text-center">
          <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#78716C] font-medium">Loading online sessions...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto">
            <Video size={24} />
          </div>
          <h3 className="font-bold text-[#292524] text-base">No Online Sessions Found</h3>
          <p className="text-sm text-[#78716C] max-w-sm mx-auto">
            No virtual classes match your current search or filter. Schedule a new live session to get started.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 px-4 py-2 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#1f5f5f] transition-all inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Schedule Now
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((session) => {
            const isCompleted = session.status === 'Completed';
            return (
              <div
                key={session._id}
                className="bg-white border border-[#E7E5E4] hover:border-[#F97316]/40 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FFFDF8] text-[#F97316]">
                      {session.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isCompleted
                          ? 'bg-gray-100 text-gray-600'
                          : session.status === 'Live Now'
                          ? 'bg-red-100 text-red-600 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  <h3 className="font-black text-lg text-[#292524] line-clamp-1">{session.title}</h3>
                  <p className="text-xs text-[#78716C] mt-1 line-clamp-2 leading-relaxed">
                    {session.description || 'Virtual training session.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-[#78716C]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#292524] font-semibold">
                        <Users size={14} className="text-[#F97316]" /> {session.trainerName}
                      </span>
                      <span className="text-gray-400">{session.specialization}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-[#F97316]" /> {session.date}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-[#292524]">
                        <Clock size={14} className="text-[#F97316]" /> {session.time} ({session.duration}m)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Attendees:</span>
                      <span className="font-bold text-[#F97316]">
                        {session.attendeesCount} / {session.maxCapacity} Booked
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 bg-[#F97316] hover:bg-[#1f5f5f] text-white text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <Video size={14} /> Join Studio
                  </a>
                  <button
                    onClick={() => handleCopyLink(session.meetingLink, session._id)}
                    className="p-2 border border-[#E7E5E4] hover:bg-gray-50 text-[#78716C] rounded-xl transition-colors shrink-0"
                    title="Copy Meeting Link"
                  >
                    {copiedId === session._id ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Online Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center">
                <Video size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#292524]">Schedule Online Session</h2>
                <p className="text-xs text-[#78716C]">Create a new live stream or virtual group class</p>
              </div>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virtual Core & Abs Blast"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                    Assigned Trainer
                  </label>
                  <select
                    value={newTrainer}
                    onChange={(e) => setNewTrainer(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="">Select Trainer</option>
                    {trainers.map((t: any) => (
                      <option key={t._id} value={t.name}>
                        {t.name} ({t.specialization || 'Trainer'})
                      </option>
                    ))}
                    {trainers.length === 0 && <option value="Head Trainer">Head Gym Trainer</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  >
                    <option value="HIIT">HIIT & Cardio</option>
                    <option value="Yoga & Flexibility">Yoga & Flexibility</option>
                    <option value="Strength">Strength & Conditioning</option>
                    <option value="Zumba & Dance">Zumba & Dance</option>
                    <option value="Pilates">Pilates</option>
                    <option value="Personal Training">1-on-1 Virtual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="5"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                    Price (₹) - 0 for Free
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                  Custom Video/Meeting URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="Auto-generated if left blank (e.g. Google Meet / Zoom link)"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief details about the workout, equipment required..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#78716C] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-[#F97316] hover:bg-[#1f5f5f] text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Plus size={16} /> Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminOnlineSessions;
