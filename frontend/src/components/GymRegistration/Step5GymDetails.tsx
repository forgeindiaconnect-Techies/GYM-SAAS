import { useState } from 'react';
import { Plus, X, Clock, Calendar } from 'lucide-react';

const DEFAULT_SPECIALTIES = [
  'Weight Training', 'Cardio', 'Strength Training', 'CrossFit', 'Functional Training',
  'Yoga', 'Zumba', 'Pilates', 'HIIT', 'Personal Training', 'Group Training',
  'Martial Arts', 'Boxing', 'MMA', 'Aerobics', 'Bodybuilding', 'Powerlifting',
  'Rehabilitation', 'Sports Training', 'Dance Fitness'
];

const DEFAULT_FACILITIES = [
  'Changing Room', 'Locker', 'Shower', 'Parking', 'Drinking Water', 'WiFi',
  'Steam Room', 'Sauna', 'Swimming Pool', 'Canteen', 'CCTV', 'Air Conditioning',
  'Music System', 'First Aid', 'Reception', 'Kids Area'
];

const TimePicker = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
  const [hours, mins] = value ? value.split(':') : ['06', '00'];
  const h = parseInt(hours, 10) || 0;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  
  const handleH = (e: any) => {
    let newH = parseInt(e.target.value, 10);
    let finalH = newH;
    if (ampm === 'PM' && finalH < 12) finalH += 12;
    if (ampm === 'AM' && finalH === 12) finalH = 0;
    onChange(`${finalH.toString().padStart(2, '0')}:${mins}`);
  };

  const handleM = (e: any) => {
    onChange(`${hours}:${e.target.value}`);
  };

  const handleAmpm = (e: any) => {
    const newAmpm = e.target.value;
    let finalH = displayH;
    if (newAmpm === 'PM' && finalH < 12) finalH += 12;
    if (newAmpm === 'AM' && finalH === 12) finalH = 0;
    onChange(`${finalH.toString().padStart(2, '0')}:${mins}`);
  };

  return (
    <div className="flex items-center bg-[#FFFFFF] border border-[#DCD9CD] rounded-lg px-3 py-2 focus-within:border-[#34483F] transition-colors">
      <select value={displayH.toString().padStart(2, '0')} onChange={handleH} className="bg-transparent text-[#202522] text-sm outline-none cursor-pointer">
        {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => <option key={h} className="bg-[#FFFFFF]">{h}</option>)}
      </select>
      <span className="text-[#4A514D] text-sm font-bold mx-1">:</span>
      <select value={mins} onChange={handleM} className="bg-transparent text-[#202522] text-sm outline-none cursor-pointer">
        {['00','15','30','45'].map(m => <option key={m} className="bg-[#FFFFFF]">{m}</option>)}
      </select>
      <select value={ampm} onChange={handleAmpm} className="bg-transparent text-[#EF4444] font-bold text-sm outline-none cursor-pointer ml-2 pl-2 border-l border-[#DCD9CD]">
        <option className="bg-[#FFFFFF]">AM</option>
        <option className="bg-[#FFFFFF]">PM</option>
      </select>
    </div>
  );
};

export const Step5GymDetails = ({ data, updateData, errors }: any) => {
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [customFacility, setCustomFacility] = useState('');

  const [sessionForm, setSessionForm] = useState({ name: '', start: '', end: '', capacity: '' });
  const [showSessionForm, setShowSessionForm] = useState(false);

  // --- SPECIALTIES ---
  const toggleSpecialty = (sp: string) => {
    const current = data.specialties || [];
    if (current.includes(sp)) {
      updateData({ specialties: current.filter((s: string) => s !== sp) });
    } else {
      updateData({ specialties: [...current, sp] });
    }
  };

  const addCustomSpecialty = () => {
    if (customSpecialty.trim() && !(data.specialties || []).includes(customSpecialty.trim())) {
      updateData({ specialties: [...(data.specialties || []), customSpecialty.trim()] });
      setCustomSpecialty('');
    }
  };

  // --- FACILITIES ---
  const toggleFacility = (fac: string) => {
    const current = data.facilities || [];
    if (current.includes(fac)) {
      updateData({ facilities: current.filter((f: string) => f !== fac) });
    } else {
      updateData({ facilities: [...current, fac] });
    }
  };

  const addCustomFacility = () => {
    if (customFacility.trim() && !(data.facilities || []).includes(customFacility.trim())) {
      updateData({ facilities: [...(data.facilities || []), customFacility.trim()] });
      setCustomFacility('');
    }
  };

  // --- OPERATING HOURS ---
  const handleHourChange = (index: number, field: string, value: any) => {
    const newHours = [...data.operatingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    updateData({ operatingHours: newHours });
  };

  const copyMonday = () => {
    const monday = data.operatingHours[0];
    const newHours = data.operatingHours.map((h: any, i: number) => {
      if (i > 0 && i < 5) return { ...h, isOpen: monday.isOpen, openingTime: monday.openingTime, closingTime: monday.closingTime, is24Hours: monday.is24Hours };
      return h;
    });
    updateData({ operatingHours: newHours });
    alert("Monday's timings copied to Tuesday-Friday.");
  };

  // --- SESSIONS ---
  const addSession = () => {
    if (!sessionForm.name || !sessionForm.start || !sessionForm.end) return alert("Fill required session fields.");
    updateData({ sessions: [...(data.sessions || []), { ...sessionForm, id: Date.now().toString() }] });
    setSessionForm({ name: '', start: '', end: '', capacity: '' });
    setShowSessionForm(false);
  };

  const removeSession = (id: string) => {
    updateData({ sessions: data.sessions.filter((s: any) => s.id !== id) });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* SECTION A: COUNTS */}
      <section>
        <h3 className="text-xl font-bold text-[#202522] mb-4 border-b border-[#DCD9CD] pb-2">A. Staff & Member Information</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-[#4A514D] mb-2">Number of Trainers *</label>
            <input type="number" min="0" value={data.trainersCount} onChange={e => updateData({ trainersCount: Math.max(0, parseInt(e.target.value) || 0) })} className={`w-full bg-[#FFFFFF] border ${errors.trainersCount ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-[#202522] outline-none focus:border-[#34483F]`} />
            {errors.trainersCount && <p className="text-[#8FA89B] text-xs mt-1">{errors.trainersCount}</p>}
          </div>
          <div>
            <label className="block text-sm text-[#4A514D] mb-2">Current Members *</label>
            <input type="number" min="0" value={data.membersCount} onChange={e => updateData({ membersCount: Math.max(0, parseInt(e.target.value) || 0) })} className={`w-full bg-[#FFFFFF] border ${errors.membersCount ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-[#202522] outline-none focus:border-[#34483F]`} />
            {errors.membersCount && <p className="text-[#8FA89B] text-xs mt-1">{errors.membersCount}</p>}
          </div>
        </div>
      </section>

      {/* SECTION B: SPECIALTIES */}
      <section>
        <h3 className="text-xl font-bold text-[#202522] mb-4 border-b border-[#DCD9CD] pb-2">B. Gym Specialties</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {DEFAULT_SPECIALTIES.map(sp => (
            <button key={sp} type="button" onClick={() => toggleSpecialty(sp)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${data.specialties?.includes(sp) ? 'bg-[#8FA89B]/20 border-[#8FA89B] text-[#8FA89B]' : 'bg-[#FFFFFF] border-[#DCD9CD] text-[#4A514D] hover:text-[#202522] hover:border-[#444]'}`}>
              {sp}
            </button>
          ))}
          {data.specialties?.filter((s: string) => !DEFAULT_SPECIALTIES.includes(s)).map((sp: string) => (
             <button key={sp} type="button" onClick={() => toggleSpecialty(sp)} className="px-4 py-2 rounded-full text-sm font-medium transition-colors border bg-[#8FA89B]/20 border-[#8FA89B] text-[#8FA89B] flex items-center gap-1">
               {sp} <X size={14} />
             </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={customSpecialty} onChange={e => setCustomSpecialty(e.target.value)} placeholder="Add custom specialty..." className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-2 text-sm text-[#202522] outline-none focus:border-[#34483F]" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSpecialty())} />
          <button type="button" onClick={addCustomSpecialty} className="px-4 py-2 bg-[#E8E5DA] hover:bg-[#333] rounded-xl text-white text-sm font-medium transition-colors">Add</button>
        </div>
      </section>

      {/* SECTION C: FACILITIES */}
      <section>
        <h3 className="text-xl font-bold text-[#202522] mb-4 border-b border-[#DCD9CD] pb-2">C. Available Facilities</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {DEFAULT_FACILITIES.map(fac => (
            <button key={fac} type="button" onClick={() => toggleFacility(fac)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${data.facilities?.includes(fac) ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-[#FFFFFF] border-[#DCD9CD] text-[#4A514D] hover:text-[#202522] hover:border-[#444]'}`}>
              {fac}
            </button>
          ))}
          {data.facilities?.filter((f: string) => !DEFAULT_FACILITIES.includes(f)).map((fac: string) => (
             <button key={fac} type="button" onClick={() => toggleFacility(fac)} className="px-4 py-2 rounded-full text-sm font-medium transition-colors border bg-blue-500/20 border-blue-500 text-blue-400 flex items-center gap-1">
               {fac} <X size={14} />
             </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={customFacility} onChange={e => setCustomFacility(e.target.value)} placeholder="Add custom facility..." className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-2 text-sm text-[#202522] outline-none focus:border-[#34483F]" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomFacility())} />
          <button type="button" onClick={addCustomFacility} className="px-4 py-2 bg-[#E8E5DA] hover:bg-[#333] rounded-xl text-white text-sm font-medium transition-colors">Add</button>
        </div>
      </section>

      {/* SECTION D: OPERATING HOURS */}
      <section>
        <div className="flex justify-between items-end border-b border-[#DCD9CD] pb-2 mb-4">
          <h3 className="text-xl font-bold text-[#202522] flex items-center gap-2"><Clock className="text-[#8FA89B]" size={20} /> D. Operating Hours</h3>
          <button type="button" onClick={copyMonday} className="text-xs font-medium text-[#34483F] hover:underline bg-[#34483F]/10 px-3 py-1 rounded-full">Copy Monday to Weekdays</button>
        </div>
        
        <div className="space-y-3">
          {data.operatingHours.map((hour: any, idx: number) => (
            <div key={hour.dayOfWeek} className="flex flex-col md:flex-row md:items-center gap-4 bg-[#FFFFFF] p-3 rounded-xl border border-[#DCD9CD]">
              <div className="w-32 flex items-center justify-between">
                <span className={`font-semibold ${hour.isOpen ? 'text-[#202522]' : 'text-[#4A514D]'}`}>{hour.dayOfWeek}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={hour.isOpen} onChange={e => handleHourChange(idx, 'isOpen', e.target.checked)} />
                  <div className="w-9 h-5 bg-[#E8E5DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#34483F]"></div>
                </label>
              </div>
              
              {hour.isOpen ? (
                <div className="flex-1 flex flex-wrap items-center gap-3">
                  <label className="flex items-center space-x-2 text-sm text-[#4A514D]">
                    <input type="checkbox" checked={hour.is24Hours} onChange={e => handleHourChange(idx, 'is24Hours', e.target.checked)} className="rounded border-[#DCD9CD] bg-[#FFFFFF] text-[#34483F] focus:ring-0 accent-[#EF4444]" />
                    <span>24 Hours</span>
                  </label>
                  
                  {!hour.is24Hours && (
                    <>
                      <TimePicker value={hour.openingTime} onChange={(v: string) => handleHourChange(idx, 'openingTime', v)} />
                      <span className="text-[#4A514D] text-sm">to</span>
                      <TimePicker value={hour.closingTime} onChange={(v: string) => handleHourChange(idx, 'closingTime', v)} />
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 text-sm text-[#8FA89B] italic font-medium">Closed</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION E: SESSIONS */}
      <section>
        <div className="flex justify-between items-end border-b border-[#DCD9CD] pb-2 mb-4">
          <h3 className="text-xl font-bold text-[#202522] flex items-center gap-2"><Calendar className="text-blue-500" size={20} /> E. Session Planning</h3>
          <button type="button" onClick={() => setShowSessionForm(true)} className="text-xs font-medium text-[#202522] hover:bg-[#333] bg-[#E8E5DA] px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"><Plus size={14}/> Add Session</button>
        </div>

        {showSessionForm && (
          <div className="bg-[#FFFFFF] p-4 rounded-xl border border-blue-500/30 mb-4 grid md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs text-[#4A514D] mb-1">Session Name *</label>
              <input type="text" placeholder="e.g. Morning Cardio" value={sessionForm.name} onChange={e => setSessionForm({...sessionForm, name: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-lg px-3 py-2 text-sm text-[#202522]" />
            </div>
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">Start *</label>
              <TimePicker value={sessionForm.start} onChange={(v: string) => setSessionForm({...sessionForm, start: v})} />
            </div>
            <div>
              <label className="block text-xs text-[#4A514D] mb-1">End *</label>
              <TimePicker value={sessionForm.end} onChange={(v: string) => setSessionForm({...sessionForm, end: v})} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={addSession} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-bold">Save</button>
              <button type="button" onClick={() => setShowSessionForm(false)} className="px-3 bg-[#E8E5DA] hover:bg-[#333] text-white rounded-lg py-2"><X size={16}/></button>
            </div>
          </div>
        )}

        {data.sessions?.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {data.sessions.map((sess: any) => (
              <div key={sess.id} className="bg-[#FFFFFF] border border-[#DCD9CD] p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-[#202522] text-sm">{sess.name}</h4>
                  <p className="text-xs text-[#4A514D] mt-1">{sess.start} - {sess.end}</p>
                </div>
                <button type="button" onClick={() => removeSession(sess.id)} className="text-[#4A514D] hover:text-[#8FA89B] transition-colors p-2"><X size={18} /></button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#4A514D] italic text-center py-4 bg-[#FFFFFF] rounded-xl border border-dashed border-[#DCD9CD]">No sessions added yet. You can add common training periods.</p>
        )}
      </section>

    </div>
  );
};