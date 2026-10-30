import React from 'react';
import { Wind } from 'lucide-react';

interface StepProps {
  form: any;
  set: (field: string, value: any) => void;
  errors: Record<string, string>;
  selBtnCls: (active: boolean) => string;
}

const AC_TYPES = ['Fully AC', 'Partially AC', 'Non-AC', 'AC + Non-AC Sections'];
const AC_AREAS = ['Workout Floor', 'Cardio Area', 'Studio', 'Changing Room', 'Reception'];

const Step3ACDetails: React.FC<StepProps> = ({ form, set, errors, selBtnCls }) => {
  
  const handleTypeChange = (type: string) => {
    set('acDetails', { ...(form.acDetails || { areas: [] }), type });
  };

  const handleAreaToggle = (area: string) => {
    const currentAreas = form.acDetails?.areas || [];
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter((a: string) => a !== area)
      : [...currentAreas, area];
    set('acDetails', { ...(form.acDetails || {}), areas: newAreas });
  };

  const currentType = form.acDetails?.type || '';
  const currentAreas = form.acDetails?.areas || [];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#292524] border-b border-[#E7DADD] pb-2 flex items-center gap-2">
          <Wind className="text-[#B76E79]" size={20} />
          <span>Air Conditioning Details</span>
        </h2>
        
        <div>
          <label className="block text-sm font-semibold text-[#292524] mb-3">Gym AC Type *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AC_TYPES.map(t => (
              <button 
                key={t} 
                type="button" 
                onClick={() => handleTypeChange(t)} 
                className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  currentType === t 
                    ? 'bg-[#B76E79] text-white border-[#B76E79] shadow-xs' 
                    : 'bg-[#FFFFFF] border-[#E7DADD] text-[#292524] hover:border-[#B76E79] hover:text-[#292524]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {errors['acDetails.type'] && <p className="text-red-400 text-xs mt-2">{errors['acDetails.type']}</p>}
        </div>
      </div>

      {currentType && currentType !== 'Non-AC' && currentType !== 'Fully AC' && (
        <div className="space-y-4 bg-[#F3E8E8] p-6 rounded-xl border border-[#E7DADD]">
          <div>
            <label className="block text-sm font-semibold text-[#292524] mb-3">Specify Areas with AC *</label>
            <div className="flex flex-wrap gap-2">
              {AC_AREAS.map(area => (
                <button 
                  key={area} 
                  type="button" 
                  onClick={() => handleAreaToggle(area)} 
                  className={selBtnCls(currentAreas.includes(area))}
                >
                  {area}
                </button>
              ))}
            </div>
            {errors['acDetails.areas'] && <p className="text-red-400 text-xs mt-2">{errors['acDetails.areas']}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3ACDetails;
