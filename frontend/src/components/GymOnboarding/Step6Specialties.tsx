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
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#E7DADD]">
        <Target className="text-[#B76E79]" size={24} />
        <h2 className="text-xl font-bold">Gym Specialties</h2>
      </div>

      <p className="text-sm text-[#57534E] mb-6">Select the primary fitness areas and specialties your gym focuses on.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {PREDEFINED_SPECIALTIES.map(spec => (
          <div
            key={spec}
            onClick={() => toggleSpecialty(spec)}
            className={`p-4 rounded-xl border cursor-pointer text-center transition-all duration-200 ${
              data.specialties.includes(spec)
                ? 'bg-gradient-to-br from-[#B76E79] to-[#B91C1C] border-transparent text-white shadow-lg shadow-[#B76E79]/20'
                : 'bg-[#FFFFFF] border-[#E7DADD] text-[#57534E] hover:bg-[#F3E8E8] hover:text-[#FFFFFF] hover:border-[#57534E]'
            }`}
          >
            <span className="font-semibold text-sm">{spec}</span>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-[#E7DADD]">
        <h3 className="text-sm font-bold text-[#292524] mb-4">Add Custom Specialty</h3>
        <div className="flex space-x-3 max-w-md">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            className="flex-1 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl px-4 py-3 text-sm text-[#292524] outline-none focus:border-[#B76E79]"
            placeholder="E.g. Calisthenics"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-6 py-3 bg-[#F3E8E8] hover:bg-[#333] text-white rounded-xl font-semibold transition-colors flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {data.specialties.filter((s: string) => !PREDEFINED_SPECIALTIES.includes(s)).length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {data.specialties.filter((s: string) => !PREDEFINED_SPECIALTIES.includes(s)).map((custom: string) => (
            <div key={custom} className="flex items-center space-x-2 bg-[#B76E79]/10 text-[#B76E79] px-4 py-2 rounded-full text-sm font-semibold border border-[#B76E79]/30">
              <span>{custom}</span>
              <button onClick={() => toggleSpecialty(custom)} className="hover:text-[#B76E79] transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
