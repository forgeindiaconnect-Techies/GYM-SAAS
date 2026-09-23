import { Building, Settings2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const FACILITIES = [
  { id: 'parking', label: 'Parking Available' },
  { id: 'locker', label: 'Locker Facility' },
  { id: 'shower', label: 'Shower Facility' },
  { id: 'wifi', label: 'WiFi Available' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'water', label: 'Drinking Water' },
  { id: 'cctv', label: 'CCTV Security' },
  { id: 'changingRoom', label: 'Changing Rooms' },
  { id: 'pt', label: 'Personal Training' }
];

export const Step5AdditionalDetails = ({ data, updateData }: any) => {
  const toggleDay = (day: string) => {
    const current = [...data.workingDays];
    if (current.includes(day)) {
      updateData({ workingDays: current.filter(d => d !== day) });
    } else {
      current.push(day);
      updateData({ workingDays: current });
    }
  };

  const toggleFacility = (facilityId: string) => {
    updateData({
      facilities: {
        ...data.facilities,
        [facilityId]: !data.facilities[facilityId]
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#DCD9CD]">
        <Building className="text-[#34483F]" size={24} />
        <h2 className="text-xl font-bold">Gym Details & Facilities</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Gym Description</label>
          <textarea
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            rows={3}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F] resize-none"
            placeholder="Tell us about the gym..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Established Year</label>
          <input
            type="number"
            value={data.establishedYear}
            onChange={(e) => updateData({ establishedYear: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]"
            placeholder="e.g. 2015"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4A514D] mb-2">Opening Time</label>
            <input
              type="time"
              value={data.openingTime}
              onChange={(e) => updateData({ openingTime: e.target.value })}
              className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F] [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4A514D] mb-2">Closing Time</label>
            <input
              type="time"
              value={data.closingTime}
              onChange={(e) => updateData({ closingTime: e.target.value })}
              className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F] [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#4A514D] mb-3">Working Days</label>
          <div className="flex flex-wrap gap-3">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  data.workingDays.includes(day)
                    ? 'bg-[#34483F]/10 text-[#34483F] border-[#34483F]'
                    : 'bg-[#FFFFFF] text-[#4A514D] border-[#DCD9CD] hover:border-[#444]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 mt-4 pt-6 border-t border-[#DCD9CD]">
          <div className="flex items-center space-x-2 mb-6">
            <Settings2 className="text-[#34483F]" size={20} />
            <h3 className="text-lg font-bold">Facilities</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FACILITIES.map(fac => (
              <div
                key={fac.id}
                onClick={() => toggleFacility(fac.id)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  data.facilities[fac.id]
                    ? 'bg-[#34483F]/5 border-[#34483F]/50'
                    : 'bg-[#FFFFFF] border-[#DCD9CD] hover:bg-[#202020]'
                }`}
              >
                <span className={`text-sm font-medium ${data.facilities[fac.id] ? 'text-[#202522]' : 'text-[#4A514D]'}`}>
                  {fac.label}
                </span>
                <div className={`w-10 h-6 rounded-full transition-colors relative ${data.facilities[fac.id] ? 'bg-[#34483F]' : 'bg-[#E8E5DA]'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${data.facilities[fac.id] ? 'left-5' : 'left-1'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
