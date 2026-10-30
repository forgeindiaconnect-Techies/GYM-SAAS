import { useState } from 'react';
import { Target, Plus, X } from 'lucide-react';

const PREDEFINED_SPECIALTIES = [
  'Weight Training', 'Bodybuilding', 'Cardio Training', 'CrossFit',
  'Functional Training', 'Strength Training', 'Personal Training',
  'Weight Loss', 'Muscle Building', 'Yoga', 'Zumba', 'Pilates',
  'HIIT Training', 'Boxing', 'MMA', "Women's Fitness",
  'Senior Fitness', 'Rehabilitation Fitness'
];

export const Step6Specialties = ({ data, updateData }: any) => {
  const [customName, setCustomName] = useState('');

  const toggleSpecialty = (name: string) => {
    const current = [...data.specialties];
    if (current.includes(name)) {
      updateData({ specialties: current.filter(s => s !== name) });
    } else {
      current.push(name);
      updateData({ specialties: current });
    }
  };

  const addCustom = () => {
    if (customName.trim() && !data.specialties.includes(customName.trim())) {
      updateData({ specialties: [...data.specialties, customName.trim()] });
      setCustomName('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#E2E8F0]">
        <Target className="text-[#EA580C]" size={24} />
        <h2 className="text-xl font-bold">Gym Specialties</h2>
      </div>

      <p className="text-sm text-[#64748B] mb-6">Select the primary fitness areas and specialties your gym focuses on.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {PREDEFINED_SPECIALTIES.map(spec => (
          <div
            key={spec}
            onClick={() => toggleSpecialty(spec)}
            className={`p-4 rounded-xl border cursor-pointer text-center transition-all duration-200 ${
              data.specialties.includes(spec)
                ? 'bg-gradient-to-br from-[#EA580C] to-[#B91C1C] border-transparent text-white shadow-lg shadow-orange-500/15'
                : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#64748B] hover:bg-[#FFF7ED] hover:text-[#FFFFFF] hover:border-[#E2E8F0]'
            }`}
          >
            <span className="font-semibold text-sm">{spec}</span>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-[#E2E8F0]">
        <h3 className="text-sm font-bold text-[#111827] mb-4">Add Custom Specialty</h3>
        <div className="flex space-x-3 max-w-md">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            className="flex-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#FDBA74]"
            placeholder="E.g. Calisthenics"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-xl font-semibold transition-colors flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {data.specialties.filter((s: string) => !PREDEFINED_SPECIALTIES.includes(s)).length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {data.specialties.filter((s: string) => !PREDEFINED_SPECIALTIES.includes(s)).map((custom: string) => (
            <div key={custom} className="flex items-center space-x-2 bg-[#FFF7ED] text-[#EA580C] px-4 py-2 rounded-full text-sm font-semibold border border-[#FFEDD5]">
              <span>{custom}</span>
              <button onClick={() => toggleSpecialty(custom)} className="hover:text-[#EA580C] transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
