import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User, X, Save } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

const SHIFT_TYPES = [
  { label: 'Floor Duty', color: 'bg-blue-500/20 border-blue-500/50 text-blue-500' },
  { label: 'Classes', color: 'bg-green-500/20 border-green-500/50 text-green-500' },
  { label: 'Personal Training', color: 'bg-purple-500/20 border-purple-500/50 text-purple-500' },
  { label: 'Cardio Session', color: 'bg-orange-500/20 border-orange-500/50 text-orange-500' },
];

const MOCK_TRAINERS = ['Arnold S.', 'Sarah C.', 'Mike T.', 'Lisa K.', 'John D.'];

const initialShifts = [
  { id: 1, trainer: 'Arnold S.', day: 'Monday', time: '06:00', duration: 4, type: 'Floor Duty', color: 'bg-blue-500/20 border-blue-500/50 text-blue-500' },
  { id: 2, trainer: 'Sarah C.', day: 'Monday', time: '16:00', duration: 4, type: 'Classes', color: 'bg-green-500/20 border-green-500/50 text-green-500' },
  { id: 3, trainer: 'Mike T.', day: 'Wednesday', time: '10:00', duration: 4, type: 'Personal Training', color: 'bg-purple-500/20 border-purple-500/50 text-purple-500' },
  { id: 4, trainer: 'Arnold S.', day: 'Friday', time: '08:00', duration: 6, type: 'Floor Duty', color: 'bg-blue-500/20 border-blue-500/50 text-blue-500' },
  { id: 5, trainer: 'Sarah C.', day: 'Saturday', time: '08:00', duration: 4, type: 'Classes', color: 'bg-green-500/20 border-green-500/50 text-green-500' },
];

const defaultForm = {
  trainer: MOCK_TRAINERS[0],
  day: DAYS[0],
  time: HOURS[0],
  duration: 2,
  type: SHIFT_TYPES[0].label,
};

const GymAdminTrainerSchedule = () => {
  const [currentWeek] = useState('Sept 14 - Sept 20, 2026');
  const [shifts, setShifts] = useState(initialShifts);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });

  const handleAssignShift = (e: React.FormEvent) => {
    e.preventDefault();
    const shiftType = SHIFT_TYPES.find(s => s.label === form.type)!;
    const newShift = {
      id: Date.now(),
      trainer: form.trainer,
      day: form.day,
      time: form.time,
      duration: Number(form.duration),
      type: form.type,
      color: shiftType.color,
    };
    setShifts([...shifts, newShift]);
    setShowModal(false);
    setForm({ ...defaultForm });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Trainer Schedule</h1>
          <p className="text-[#475569] mt-1">Manage staff shifts, classes, and floor coverage.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#16A34A] text-white font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20 self-start md:self-auto"
        >
          <Plus size={20} /> Assign Shift
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <button className="p-2 bg-[#FFFFFF] border border-[#CCFBF1] rounded-lg hover:bg-[#E2E8F0] transition-colors text-[#1E293B]">
                <ChevronLeft size={18} />
              </button>
              <button className="p-2 bg-[#FFFFFF] border border-[#CCFBF1] rounded-lg hover:bg-[#E2E8F0] transition-colors text-[#1E293B]">
                <ChevronRight size={18} />
              </button>
            </div>
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center">
              <CalendarIcon size={18} className="mr-2 text-[#16A34A]" />
              {currentWeek}
            </h2>
          </div>
          <div className="hidden md:flex space-x-3 text-xs font-semibold">
            <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-1.5"></div> Floor Duty</span>
            <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-1.5"></div> Classes</span>
            <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-purple-500 mr-1.5"></div> PT</span>
            <span className="flex items-center"><div className="w-3 h-3 rounded-full bg-orange-500 mr-1.5"></div> Cardio</span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-[#CCFBF1] rounded-xl bg-[#FFFFFF]">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-[#CCFBF1] bg-[#F8FAFC]">
              <div className="p-4 border-r border-[#CCFBF1] flex items-center justify-center text-[#475569] font-semibold text-sm">
                Time
              </div>
              {DAYS.map(day => (
                <div key={day} className="p-4 border-r border-[#CCFBF1] text-center font-semibold text-[#1E293B] last:border-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-[#CCFBF1] last:border-0">
                  <div className="p-4 border-r border-[#CCFBF1] text-center text-sm text-[#475569] font-medium bg-[#FFFFFF]">
                    {hour}
                  </div>
                  {DAYS.map(day => {
                    const shift = shifts.find(s => s.day === day && s.time === hour);
                    return (
                      <div key={`${day}-${hour}`} className="p-2 border-r border-[#CCFBF1] last:border-0 min-h-[100px] relative">
                        {shift && (
                          <div className={`absolute top-2 left-2 right-2 p-2 rounded-lg border shadow-lg z-10 flex flex-col ${shift.color}`} style={{ height: `calc(${shift.duration * 25}px)` }}>
                            <span className="text-xs font-black uppercase tracking-wider">{shift.type}</span>
                            <span className="text-sm font-bold mt-1 flex items-center"><User size={12} className="mr-1"/> {shift.trainer}</span>
                            <span className="text-xs mt-1 flex items-center opacity-80"><Clock size={10} className="mr-1"/> {shift.duration} Hrs</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Shift Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full shadow-2xl border border-[#CCFBF1] overflow-hidden">
            <div className="p-6 border-b border-[#CCFBF1] flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h2 className="text-xl font-bold text-[#1E293B]">Assign Shift</h2>
                <p className="text-sm text-[#475569] mt-0.5">Schedule a new shift for a trainer</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-[#475569] hover:text-[#1E293B] hover:bg-gray-100 rounded-lg transition-colors">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAssignShift}>
              <div className="p-6 space-y-5">

                {/* Trainer */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Trainer *</label>
                  <select
                    required
                    value={form.trainer}
                    onChange={e => setForm({ ...form, trainer: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] text-sm font-medium text-[#1E293B]"
                  >
                    {MOCK_TRAINERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Day */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Day *</label>
                  <select
                    required
                    value={form.day}
                    onChange={e => setForm({ ...form, day: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] text-sm font-medium text-[#1E293B]"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Time & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Start Time *</label>
                    <select
                      required
                      value={form.time}
                      onChange={e => setForm({ ...form, time: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] text-sm font-medium text-[#1E293B]"
                    >
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Duration (hrs) *</label>
                    <select
                      required
                      value={form.duration}
                      onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                      className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-4 py-3 outline-none focus:border-[#16A34A] text-sm font-medium text-[#1E293B]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Hour' : 'Hours'}</option>)}
                    </select>
                  </div>
                </div>

                {/* Shift Type */}
                <div>
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">Shift Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {SHIFT_TYPES.map(st => (
                      <button
                        key={st.label}
                        type="button"
                        onClick={() => setForm({ ...form, type: st.label })}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all text-left ${form.type === st.label ? `${st.color} border-opacity-100 scale-[1.02] shadow-md` : 'border-[#CCFBF1] text-[#475569] hover:border-[#16A34A]/30 bg-[#F8FAFC]'}`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="p-5 bg-[#F8FAFC] border-t border-[#CCFBF1] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-[#E2E8F0] text-[#475569] rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20 flex items-center gap-2"
                >
                  <Save size={16} /> Assign Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminTrainerSchedule;
