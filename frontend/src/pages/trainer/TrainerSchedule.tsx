import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';

const initialEvents = [
  { time: '10:00 AM', type: '1-on-1 Online', client: 'Sarah Connor', duration: '60 min', color: 'bg-blue-500' },
  { time: '02:00 PM', type: 'Personal Training', client: 'John Doe', duration: '45 min', color: 'bg-[#164A4A]' },
  { time: '05:00 PM', type: 'Group HIIT Class', client: '12 Attendees', duration: '90 min', color: 'bg-purple-500' },
];

const TrainerSchedule = () => {
  const [events, setEvents] = useState(initialEvents);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    time: '09:00 AM',
    type: 'Personal Training',
    client: '',
    duration: '60 min',
    color: 'bg-[#164A4A]'
  });

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    setEvents([...events, form]);
    setIsAddModalOpen(false);
    setForm({ time: '09:00 AM', type: 'Personal Training', client: '', duration: '60 min', color: 'bg-[#164A4A]' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-[#455250]">Your calendar and appointments</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-[#164A4A] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#C6A77D] transition-colors"
        >
          <Plus size={18} /> Add Block
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#D3DFDA] flex justify-between items-center bg-[#FFFFFF]">
          <h2 className="text-lg font-bold">October 2026</h2>
          <div className="flex gap-2">
            <button className="p-2 border border-[#D3DFDA] rounded-lg hover:bg-[#E8E5DA] transition-colors"><ChevronLeft size={16} /></button>
            <button className="p-2 border border-[#D3DFDA] rounded-lg hover:bg-[#E8E5DA] transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="relative border-l-2 border-[#D3DFDA] ml-4 space-y-8 pb-4">
            {events.map((event, i) => (
              <div key={i} className="relative pl-6">
                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-[#FFFFFF] ${event.color}`}></div>
                <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl p-4 flex justify-between items-center hover:border-[#164A4A]/30 transition-colors cursor-pointer">
                  <div>
                    <h4 className="font-bold text-lg mb-1">{event.type}</h4>
                    <div className="flex items-center gap-4 text-sm text-[#455250]">
                      <span className="flex items-center gap-1"><Clock size={14} /> {event.time} ({event.duration})</span>
                      <span className="flex items-center gap-1"><Users size={14} /> {event.client}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-[#D3DFDA] rounded-lg text-sm hover:bg-[#E8E5DA] transition-colors">Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#D3DFDA] overflow-hidden">
            <div className="p-6 border-b border-[#D3DFDA] flex justify-between items-center bg-[#F2EFE8]">
              <h2 className="text-xl font-bold text-[#202828]">Add Schedule Block</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="p-2 text-[#455250] hover:text-[#202828] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            
            <form onSubmit={handleAddBlock} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#455250] mb-2">Event Type *</label>
                <select 
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A]"
                  required
                >
                  <option value="Personal Training">Personal Training</option>
                  <option value="1-on-1 Online">1-on-1 Online</option>
                  <option value="Group HIIT Class">Group HIIT Class</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#455250] mb-2">Client / Group Name *</label>
                <input 
                  type="text"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="e.g. John Doe or 10 Attendees"
                  className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#455250] mb-2">Time *</label>
                  <input 
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#455250] mb-2">Duration *</label>
                  <select 
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#164A4A]"
                    required
                  >
                    <option value="30 min">30 min</option>
                    <option value="45 min">45 min</option>
                    <option value="60 min">60 min</option>
                    <option value="90 min">90 min</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#455250] mb-2">Color Label</label>
                <div className="flex gap-3">
                  {[
                    { value: 'bg-[#164A4A]', label: 'Green' },
                    { value: 'bg-blue-500', label: 'Blue' },
                    { value: 'bg-purple-500', label: 'Purple' },
                    { value: 'bg-orange-500', label: 'Orange' },
                    { value: 'bg-red-500', label: 'Red' },
                  ].map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setForm({ ...form, color: color.value })}
                      className={`w-8 h-8 rounded-full ${color.value} ${form.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#D3DFDA]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-[#455250] hover:bg-[#E8E5DA] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#164A4A] text-white hover:bg-[#C6A77D] transition-colors text-sm"
                >
                  Save Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerSchedule;