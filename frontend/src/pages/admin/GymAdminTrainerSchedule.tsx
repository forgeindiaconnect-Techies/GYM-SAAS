import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

const mockShifts = [
  { id: 1, trainer: 'Arnold S.', day: 'Monday', time: '06:00', duration: 4, type: 'Floor Duty', color: 'bg-blue-500/20 border-blue-500/50 text-blue-500' },
  { id: 2, trainer: 'Sarah C.', day: 'Monday', time: '16:00', duration: 4, type: 'Classes', color: 'bg-green-500/20 border-green-500/50 text-green-500' },
  { id: 3, trainer: 'Mike T.', day: 'Wednesday', time: '10:00', duration: 4, type: 'Personal Training', color: 'bg-purple-500/20 border-purple-500/50 text-purple-500' },
  { id: 4, trainer: 'Arnold S.', day: 'Friday', time: '08:00', duration: 6, type: 'Floor Duty', color: 'bg-blue-500/20 border-blue-500/50 text-blue-500' },
  { id: 5, trainer: 'Sarah C.', day: 'Saturday', time: '08:00', duration: 4, type: 'Classes', color: 'bg-green-500/20 border-green-500/50 text-green-500' },
];

const GymAdminTrainerSchedule = () => {
  const [currentWeek] = useState('Sept 14 - Sept 20, 2026');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Trainer Schedule</h1>
          <p className="text-[#475569] mt-1">Manage staff shifts, classes, and floor coverage.</p>
        </div>
        <button className="px-4 py-2 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20 self-start md:self-auto">
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
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar border border-[#CCFBF1] rounded-xl bg-[#FFFFFF]">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-[#CCFBF1] bg-[#FFFFFF]">
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
                    const shift = mockShifts.find(s => s.day === day && s.time === hour);
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
    </div>
  );
};

export default GymAdminTrainerSchedule;
