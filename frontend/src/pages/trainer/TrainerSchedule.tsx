import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const TrainerSchedule = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-[#475569]">Your calendar and appointments</p>
        </div>
        <button className="px-4 py-2 bg-[#16A34A] text-white rounded-xl font-bold flex items-center gap-2">
          <Plus size={18} /> Add Block
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#CCFBF1] flex justify-between items-center bg-[#FFFFFF]">
          <h2 className="text-lg font-bold">October 2026</h2>
          <div className="flex gap-2">
            <button className="p-2 border border-[#CCFBF1] rounded-lg hover:bg-[#E2E8F0]"><ChevronLeft size={16} /></button>
            <button className="p-2 border border-[#CCFBF1] rounded-lg hover:bg-[#E2E8F0]"><ChevronRight size={16} /></button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="relative border-l-2 border-[#CCFBF1] ml-4 space-y-8 pb-4">
            {[
              { time: '10:00 AM', type: '1-on-1 Online', client: 'Sarah Connor', duration: '60 min', color: 'bg-blue-500' },
              { time: '02:00 PM', type: 'Personal Training', client: 'John Doe', duration: '45 min', color: 'bg-[#16A34A]' },
              { time: '05:00 PM', type: 'Group HIIT Class', client: '12 Attendees', duration: '90 min', color: 'bg-purple-500' },
            ].map((event, i) => (
              <div key={i} className="relative pl-6">
                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-[#FFFFFF] ${event.color}`}></div>
                <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl p-4 flex justify-between items-center hover:border-[#16A34A]/30 transition-colors cursor-pointer">
                  <div>
                    <h4 className="font-bold text-lg mb-1">{event.type}</h4>
                    <div className="flex items-center gap-4 text-sm text-[#475569]">
                      <span className="flex items-center gap-1"><Clock size={14} /> {event.time} ({event.duration})</span>
                      <span className="flex items-center gap-1"><Users size={14} /> {event.client}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-[#CCFBF1] rounded-lg text-sm hover:bg-[#E2E8F0]">Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerSchedule;