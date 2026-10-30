import React from 'react';
import { Check } from 'lucide-react';

interface StepProps {
  form: any;
  set: (field: string, value: any) => void;
  errors: Record<string, string>;
}

const FACILITIES_LIST = [
  'Locker Facility', 'Changing Room', 'Shower', 'Drinking Water', 'Parking', 
  'Wi-Fi', 'Steam / Sauna', 'Personal Training', 'Group Classes', 'Zumba', 
  'Yoga', 'CrossFit / Functional Training', 'Cardio Zone', 'Strength Training Zone', 
  'Ladies-only Section', 'Rest Area', 'First Aid', 'CCTV', 'Music System', 
  'Cleaning / Sanitization', 'Washroom', 'Reception', 'Other Facility'
];

const Step4Facilities: React.FC<StepProps> = ({ form, set, errors }) => {
  const toggleFacility = (facility: string) => {
    const current = form.facilities || [];
    const updated = current.includes(facility)
      ? current.filter((f: string) => f !== facility)
      : [...current, facility];
    set('facilities', updated);
  };

  const selected = form.facilities || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E7DADD] pb-2">
        <h2 className="text-lg font-bold text-[#292524]">Gym Facilities</h2>
        <p className="text-sm text-[#57534E]">Select all the amenities available at your gym.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FACILITIES_LIST.map(facility => {
          const isSelected = selected.includes(facility);
          return (
            <button
              key={facility}
              type="button"
              onClick={() => toggleFacility(facility)}
              className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-[#B76E79]/15 border-[#B76E79] text-[#292524] shadow-xs' 
                  : 'bg-[#FFFFFF] border-[#E7DADD] text-[#292524] hover:border-[#B76E79]/60 hover:text-[#292524]'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-[#B76E79] border-[#B76E79]' : 'border-[#E7DADD] bg-[#FFFFFF]'}`}>
                {isSelected && <Check size={14} className="text-[#FFFFFF]" />}
              </div>
              <span className="text-xs font-semibold leading-tight">{facility}</span>
            </button>
          );
        })}
      </div>
      {errors.facilities && <p className="text-red-400 text-xs mt-2">{errors.facilities}</p>}
    </div>
  );
};

export default Step4Facilities;
