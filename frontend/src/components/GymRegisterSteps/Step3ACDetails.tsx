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
        <h2 className="text-lg font-bold text-[#F5FAFA] border-b border-[#2A3A3A] pb-2 flex items-center gap-2">
          <Wind className="text-[#2DD4BF]" size={20} />
          <span>Air Conditioning Details</span>
        </h2>
        
        <div>
          <label className="block text-sm font-semibold text-[#C1D0D0] mb-3">Gym AC Type *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AC_TYPES.map(t => (
              <button 
                key={t} 
                type="button" 
                onClick={() => handleTypeChange(t)} 
                className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  currentType === t 
                    ? 'bg-[#2DD4BF] text-[#06201D] border-[#2DD4BF] shadow-xs' 
                    : 'bg-[#101819] border-[#2A3A3A] text-[#C1D0D0] hover:border-[#2DD4BF] hover:text-[#F5FAFA]'
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
        <div className="space-y-4 bg-[#0E1415] p-6 rounded-xl border border-[#2A3A3A]">
          <div>
            <label className="block text-sm font-semibold text-[#C1D0D0] mb-3">Specify Areas with AC *</label>
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
