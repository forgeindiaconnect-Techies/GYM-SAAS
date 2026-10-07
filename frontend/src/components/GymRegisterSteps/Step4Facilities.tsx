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
      <div className="border-b border-[#E7E5E4] pb-2">
        <h2 className="text-lg font-semibold text-[#292524]">Gym Facilities</h2>
        <p className="text-sm text-[#78716C]">Select all the amenities available at your gym.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FACILITIES_LIST.map(facility => {
          const isSelected = selected.includes(facility);
          return (
            <button
              key={facility}
              type="button"
              onClick={() => toggleFacility(facility)}
              className={`flex items-center space-x-2 p-3 rounded-xl border text-left transition-colors ${
                isSelected 
                  ? 'bg-[#F97316]/10 border-[#F97316] text-[#292524]' 
                  : 'bg-[#FFFFFF] border-[#E7E5E4] text-[#78716C] hover:border-[#F97316]/50'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${isSelected ? 'bg-[#F97316] border-[#F97316]' : 'border-[#555]'}`}>
                {isSelected && <Check size={14} className="text-black" />}
              </div>
              <span className="text-xs font-medium leading-tight">{facility}</span>
            </button>
          );
        })}
      </div>
      {errors.facilities && <p className="text-teal-400 text-xs mt-2">{errors.facilities}</p>}
    </div>
  );
};

export default Step4Facilities;
