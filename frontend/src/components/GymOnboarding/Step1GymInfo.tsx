import { Building2 } from 'lucide-react';

export const Step1GymInfo = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#D9E2E3]">
        <Building2 className="text-[#167D78]" size={24} />
        <h2 className="text-xl font-bold">Gym Information</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#697778] mb-2">Gym Name *</label>
          <input
            type="text"
            value={data.gymName}
            onChange={(e) => updateData({ gymName: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.gymName ? 'border-[#D8EAE7]' : 'border-[#D9E2E3]'} rounded-xl px-4 py-3 text-sm text-[#344B4A] focus:border-[#167D78] outline-none transition-colors`}
            placeholder="e.g. FitZone Elite"
          />
          {errors.gymName && <p className="text-[#D8EAE7] text-xs mt-1">{errors.gymName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#697778] mb-2">Gym Type *</label>
          <select
            value={data.gymType}
            onChange={(e) => updateData({ gymType: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.gymType ? 'border-[#D8EAE7]' : 'border-[#D9E2E3]'} rounded-xl px-4 py-3 text-sm text-[#344B4A] focus:border-[#167D78] outline-none transition-colors appearance-none cursor-pointer`}
          >
            <option value="">Select Type</option>
            <option value="Commercial Gym">Commercial Gym</option>
            <option value="Personal Gym">Personal Gym</option>
            <option value="Fitness Studio">Fitness Studio</option>
            <option value="CrossFit Gym">CrossFit Gym</option>
            <option value="Yoga Studio">Yoga Studio</option>
            <option value="Women's Fitness Center">Women's Fitness Center</option>
            <option value="Multi-Sport Fitness Center">Multi-Sport Fitness Center</option>
          </select>
          {errors.gymType && <p className="text-[#D8EAE7] text-xs mt-1">{errors.gymType}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#697778] mb-2">Training Mode *</label>
          <p className="text-xs text-[#697778] mb-2">Select how your gym provides trainer-led fitness services.</p>
          <select
            value={data.trainingMode || ''}
            onChange={(e) => updateData({ trainingMode: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.trainingMode ? 'border-[#D8EAE7]' : 'border-[#D9E2E3]'} rounded-xl px-4 py-3 text-sm text-[#344B4A] focus:border-[#167D78] outline-none transition-colors appearance-none cursor-pointer`}
          >
            <option value="">Select Mode</option>
            <option value="online">Online Training</option>
            <option value="offline">Offline Training</option>
            <option value="both">Both Online & Offline</option>
          </select>
          {errors.trainingMode && <p className="text-[#D8EAE7] text-xs mt-1">{errors.trainingMode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#697778] mb-2">Services Offered *</label>
          <div className={`grid grid-cols-2 gap-3 p-4 border rounded-xl ${errors.services ? 'border-[#D8EAE7] bg-[#E8EFF0]/30' : 'border-[#D9E2E3] bg-[#E8EFF0]'}`}>
            {['Personal Training', 'Group Classes', 'Online Training', 'Offline Training', 'AI Fitness Coaching', 'Diet Guidance'].map(service => (
              <label key={service} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(data.services || []).includes(service)}
                  onChange={(e) => {
                    const current = data.services || [];
                    if (e.target.checked) updateData({ services: [...current, service] });
                    else updateData({ services: current.filter((s: string) => s !== service) });
                  }}
                  className="rounded text-[#167D78] focus:ring-[#167D78] border-[#D9E2E3]"
                />
                <span className="text-sm text-[#344B4A]">{service}</span>
              </label>
            ))}
          </div>
          {errors.services && <p className="text-[#D8EAE7] text-xs mt-1">{errors.services}</p>}
        </div>
      </div>
    </div>
  );
};
