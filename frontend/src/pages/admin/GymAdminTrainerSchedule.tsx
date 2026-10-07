import { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  Video,
  MapPin,
  Filter,
  RefreshCw,
  Dumbbell
} from 'lucide-react';
import api from '../../utils/api';

const HOURS = [
  '06:00', '07:00', '08:00', '09:00', '10:00',
  '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00'
];

interface ScheduleItem {
  id: string;
  title: string;
  trainerName: string;
  trainerPhoto?: string;
  customerName?: string;
  customerPhoto?: string;
  customerEmail?: string;
  day: string; // 'Monday', 'Tuesday', ...
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  endTime?: string;
  duration: number; // in minutes
  durationHours: number;
  type: string; // 'Personal Training', 'Online Session'
  mode: 'Online' | 'Offline';
  status: string;
  color: string;
  fee?: number;
  meetingLink?: string;
  bookingId?: string;
}

const GymAdminTrainerSchedule = () => {
  // Active week anchor (defaulting to current app date: Oct 07, 2026)
  const [currentDate, setCurrentDate] = useState(() => new Date('2026-10-07T10:00:00'));
  const [dbSessions, setDbSessions] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter by Trainer
  const [selectedTrainerFilter, setSelectedTrainerFilter] = useState('ALL');

  // Detail Modal
  const [selectedDetail, setSelectedDetail] = useState<ScheduleItem | null>(null);

  // Calculate Monday to Sunday of the active week
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(d);
    monday.setDate(d.getDate() + distanceToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      const isoDate = current.toISOString().split('T')[0];
      const dayName = current.toLocaleDateString('en-US', { weekday: 'long' });
      const displayDate = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({
        dayName,
        displayDate,
        isoDate,
        isToday: isoDate === new Date().toISOString().split('T')[0] || isoDate === '2026-10-07'
      });
    }
    return days;
  }, [currentDate]);

  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return '';
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.displayDate} - ${end.displayDate}, 2026`;
  }, [weekDays]);

  // Fetch real customer sessions and trainers from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, trainersRes] = await Promise.all([
        api.get('/trainer-sessions/gym').catch(() => ({ data: { sessions: [] } })),
        api.get('/trainers').catch(() => ({ data: { trainers: [] } })),
      ]);

      if (sessionsRes.data?.sessions) {
        setDbSessions(sessionsRes.data.sessions);
      }
      if (trainersRes.data?.trainers) {
        setTrainers(trainersRes.data.trainers);
      }
    } catch (err) {
      console.error('Failed to load schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Standardize time string into "HH:00" slot
  const mapTimeToHourSlot = (timeStr: string): string => {
    if (!timeStr) return '08:00';
    let s = timeStr.trim().toUpperCase();
    const isPM = s.includes('PM');
    const isAM = s.includes('AM');
    s = s.replace(/AM|PM/g, '').trim();
    const [hStr] = s.split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return '08:00';
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    const hourFormatted = `${h.toString().padStart(2, '0')}:00`;
    return HOURS.includes(hourFormatted) ? hourFormatted : '08:00';
  };

  // Customer session bookings with trainers (staff shifts removed completely)
  const allScheduleItems = useMemo(() => {
    const list: ScheduleItem[] = [];

    dbSessions.forEach((s: any) => {
      const trainerName = s.trainerId?.name || 'Assigned Trainer';
      const custFirst = s.customerId?.firstName || '';
      const custLast = s.customerId?.lastName || '';
      const customerName = (custFirst + ' ' + custLast).trim() || 'Client';

      let typeLabel = 'Personal Training';
      let colorClass = 'bg-purple-500/15 border-purple-500/40 text-purple-700';

      if (s.mode === 'Online' || s.meetingLink) {
        typeLabel = 'Online Session';
        colorClass = 'bg-teal-500/15 border-teal-500/40 text-teal-700';
      }

      let dayName = '';
      if (s.date) {
        const dObj = new Date(s.date + 'T12:00:00');
        dayName = dObj.toLocaleDateString('en-US', { weekday: 'long' });
      }

      const durationHours = Math.max(1, Math.round((s.duration || 60) / 60));
      const slotHour = mapTimeToHourSlot(s.startTime);

      list.push({
        id: s._id || s.sessionId || `session-${Math.random()}`,
        title: s.title || (s.mode === 'Online' ? 'Virtual 1-on-1' : 'Personal Training'),
        trainerName,
        trainerPhoto: s.trainerId?.profilePhoto,
        customerName,
        customerPhoto: s.customerId?.profilePhoto,
        customerEmail: s.customerId?.email,
        day: dayName,
        date: s.date,
        time: slotHour,
        endTime: s.endTime,
        duration: s.duration || 60,
        durationHours,
        type: typeLabel,
        mode: s.mode === 'Online' ? 'Online' : 'Offline',
        status: s.status || 'Confirmed',
        color: colorClass,
        fee: s.fee,
        meetingLink: s.meetingLink,
        bookingId: s.bookingId || s.sessionId,
      });
    });

    return list;
  }, [dbSessions]);

  // Filter items by trainer
  const filteredScheduleItems = useMemo(() => {
    return allScheduleItems.filter((item) => {
      if (selectedTrainerFilter !== 'ALL' && item.trainerName.toLowerCase() !== selectedTrainerFilter.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [allScheduleItems, selectedTrainerFilter]);

  // Navigate Weeks
  const handlePrevWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 7);
    setCurrentDate(next);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleThisWeek = () => {
    setCurrentDate(new Date('2026-10-07T10:00:00'));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Trainer Schedule</h1>
          <p className="text-[#78716C] mt-1">
            Live schedule showing customer bookings and trainer assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh schedule"
            className="p-2.5 bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl hover:bg-[#FFFDF8] text-[#292524] transition-colors shadow-sm"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-[#F97316]' : ''} />
          </button>
        </div>
      </div>

      {/* Main Grid Card */}
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
        {/* Navigation & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Week Navigation */}
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1 bg-[#FFFDF8] p-1 rounded-xl border border-[#E7E5E4]">
              <button
                onClick={handlePrevWeek}
                title="Previous Week"
                className="p-1.5 hover:bg-[#FFFFFF] rounded-lg transition-colors text-[#292524]"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleThisWeek}
                className="px-2.5 py-1 text-xs font-bold hover:bg-[#FFFFFF] rounded-lg transition-colors text-[#F97316]"
              >
                This Week
              </button>
              <button
                onClick={handleNextWeek}
                title="Next Week"
                className="p-1.5 hover:bg-[#FFFFFF] rounded-lg transition-colors text-[#292524]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <h2 className="text-lg font-bold text-[#292524] flex items-center">
              <CalendarIcon size={18} className="mr-2 text-[#F97316]" />
              {weekRangeLabel}
            </h2>
          </div>

          {/* Trainer Filter & Legend */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Trainer Filter Dropdown */}
            <div className="flex items-center space-x-2 bg-[#FFFDF8] px-3 py-1.5 rounded-xl border border-[#E7E5E4]">
              <Filter size={14} className="text-[#78716C]" />
              <select
                value={selectedTrainerFilter}
                onChange={(e) => setSelectedTrainerFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#292524] outline-none cursor-pointer"
              >
                <option value="ALL">All Trainers ({trainers.length})</option>
                {trainers.map((t) => (
                  <option key={t._id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Legend badges */}
            <div className="hidden md:flex items-center space-x-3 text-xs font-semibold pl-2">
              <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5"></div> Personal Training (In-Gym)</span>
              <span className="flex items-center"><div className="w-2.5 h-2.5 rounded-full bg-teal-500 mr-1.5"></div> Online Session</span>
            </div>
          </div>
        </div>

        {/* Schedule Grid Table */}
        <div className="overflow-x-auto custom-scrollbar border border-[#E7E5E4] rounded-xl bg-[#FFFFFF]">
          <div className="min-w-[1000px]">
            {/* Header Columns */}
            <div className="grid grid-cols-8 border-b border-[#E7E5E4] bg-[#FFFDF8]">
              <div className="p-3.5 border-r border-[#E7E5E4] flex items-center justify-center text-[#78716C] font-bold text-xs uppercase tracking-wider">
                Time
              </div>
              {weekDays.map((col) => (
                <div
                  key={col.dayName}
                  className={`p-3 border-r border-[#E7E5E4] text-center last:border-0 ${
                    col.isToday ? 'bg-[#F97316]/10 font-bold' : ''
                  }`}
                >
                  <p className="font-bold text-sm text-[#292524]">{col.dayName}</p>
                  <p className="text-xs text-[#78716C] font-medium">{col.displayDate}</p>
                </div>
              ))}
            </div>

            {/* Hourly Grid Rows */}
            <div className="relative divide-y divide-[#E7E5E4]">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 min-h-[92px]">
                  {/* Time label */}
                  <div className="p-3 border-r border-[#E7E5E4] text-center text-xs text-[#78716C] font-semibold bg-[#FAFAFA] flex items-start justify-center pt-3">
                    {hour}
                  </div>

                  {/* Day slots */}
                  {weekDays.map((col) => {
                    const matchingItems = filteredScheduleItems.filter((item) => {
                      const matchesDay =
                        (item.date && item.date === col.isoDate) ||
                        (!item.date && item.day === col.dayName);
                      const matchesHour = item.time === hour;
                      return matchesDay && matchesHour;
                    });

                    return (
                      <div
                        key={`${col.dayName}-${hour}`}
                        className={`p-1.5 border-r border-[#E7E5E4] last:border-0 relative hover:bg-slate-50/50 transition-colors ${
                          col.isToday ? 'bg-[#F97316]/[0.02]' : ''
                        }`}
                      >
                        {matchingItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedDetail(item)}
                            className={`p-2.5 rounded-xl border shadow-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer mb-1.5 ${item.color}`}
                          >
                            {/* Type tag */}
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/70">
                                {item.type}
                              </span>
                              <span className="text-[10px] font-semibold opacity-75">
                                {item.durationHours}h
                              </span>
                            </div>

                            {/* Trainer Name */}
                            <div className="text-xs font-bold text-[#292524] flex items-center truncate">
                              <User size={12} className="mr-1 text-[#F97316] shrink-0" />
                              <span className="truncate">{item.trainerName}</span>
                            </div>

                            {/* Customer Name */}
                            {item.customerName && (
                              <div className="text-[11px] font-semibold text-[#F97316] mt-0.5 flex items-center truncate bg-white/50 px-1 py-0.5 rounded">
                                <span className="font-bold mr-1">Client:</span>
                                <span className="truncate">{item.customerName}</span>
                              </div>
                            )}

                            {/* Mode badge */}
                            <div className="mt-1 flex items-center gap-1 text-[10px]">
                              {item.mode === 'Online' ? (
                                <span className="inline-flex items-center text-teal-700 font-bold">
                                  <Video size={10} className="mr-0.5" /> Online
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-slate-700 font-medium">
                                  <MapPin size={10} className="mr-0.5" /> In-Gym
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full shadow-2xl border border-[#E7E5E4] overflow-hidden">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#292524]">{selectedDetail.type}</h2>
                  <p className="text-xs text-[#78716C]">
                    {selectedDetail.bookingId ? `Booking #${selectedDetail.bookingId}` : 'Customer Session'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-2 text-[#78716C] hover:text-[#292524] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              {/* Trainer Info */}
              <div className="p-3.5 bg-[#FFFDF8] rounded-xl border border-[#E7E5E4] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase">Assigned Trainer</p>
                  <p className="text-base font-bold text-[#292524] mt-0.5 flex items-center">
                    <User size={16} className="mr-1.5 text-[#F97316]" />
                    {selectedDetail.trainerName}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-[#E7E5E4] text-[#F97316]">
                  Trainer Staff
                </span>
              </div>

              {/* Customer Info */}
              {selectedDetail.customerName && (
                <div className="p-3.5 bg-[#F97316]/5 rounded-xl border border-[#F97316]/20">
                  <p className="text-xs font-bold text-[#F97316] uppercase">Booked Customer / Member</p>
                  <p className="text-base font-bold text-[#292524] mt-0.5 flex items-center">
                    <User size={16} className="mr-1.5 text-[#F97316]" />
                    {selectedDetail.customerName}
                  </p>
                  {selectedDetail.customerEmail && (
                    <p className="text-xs text-[#78716C] mt-1">{selectedDetail.customerEmail}</p>
                  )}
                </div>
              )}

              {/* Date, Time & Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-[#E7E5E4]">
                  <p className="text-xs font-bold text-[#78716C] uppercase">Date & Day</p>
                  <p className="font-semibold text-[#292524] mt-1">
                    {selectedDetail.date || selectedDetail.day}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-[#E7E5E4]">
                  <p className="text-xs font-bold text-[#78716C] uppercase">Time & Duration</p>
                  <p className="font-semibold text-[#292524] mt-1">
                    {selectedDetail.time} ({selectedDetail.durationHours} Hrs)
                  </p>
                </div>
              </div>

              {/* Mode & Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-[#E7E5E4]">
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase">Session Mode</p>
                  <p className="font-semibold text-[#292524] mt-0.5 flex items-center gap-1.5">
                    {selectedDetail.mode === 'Online' ? (
                      <>
                        <Video size={14} className="text-teal-600" /> Virtual Video Coaching
                      </>
                    ) : (
                      <>
                        <MapPin size={14} className="text-[#F97316]" /> In-Person Gym Floor
                      </>
                    )}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-800">
                  {selectedDetail.status}
                </span>
              </div>

              {/* Online Meeting Link */}
              {selectedDetail.meetingLink && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                  <div className="truncate mr-2">
                    <p className="text-xs font-bold text-teal-800">Online Meeting Link</p>
                    <p className="text-xs text-teal-600 truncate">{selectedDetail.meetingLink}</p>
                  </div>
                  <a
                    href={selectedDetail.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap"
                  >
                    Join Room
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#FFFDF8] border-t border-[#E7E5E4] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-6 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors"
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

export default GymAdminTrainerSchedule;
