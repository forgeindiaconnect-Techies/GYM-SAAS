import { Building2 } from 'lucide-react';

export const Step1GymInfo = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#CCFBF1]">
        <Building2 className="text-[#16A34A]" size={24} />
        <h2 className="text-xl font-bold">Gym Information</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">Gym Name *</label>
          <input
            type="text"
            value={data.gymName}
            onChange={(e) => updateData({ gymName: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.gymName ? 'border-[#0D9488]' : 'border-[#CCFBF1]'} rounded-xl px-4 py-3 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none transition-colors`}
            placeholder="e.g. FitZone Elite"
          />
          {errors.gymName && <p className="text-[#0D9488] text-xs mt-1">{errors.gymName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">Gym Type *</label>
          <select
            value={data.gymType}
            onChange={(e) => updateData({ gymType: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.gymType ? 'border-[#0D9488]' : 'border-[#CCFBF1]'} rounded-xl px-4 py-3 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none transition-colors appearance-none cursor-pointer`}
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
          {errors.gymType && <p className="text-[#0D9488] text-xs mt-1">{errors.gymType}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">Training Mode *</label>
          <p className="text-xs text-[#475569] mb-2">Select how your gym provides trainer-led fitness services.</p>
          <select
            value={data.trainingMode || ''}
            onChange={(e) => updateData({ trainingMode: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.trainingMode ? 'border-[#0D9488]' : 'border-[#CCFBF1]'} rounded-xl px-4 py-3 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none transition-colors appearance-none cursor-pointer`}
          >
            <option value="">Select Mode</option>
            <option value="online">Online Training</option>
            <option value="offline">Offline Training</option>
            <option value="both">Both Online & Offline</option>
          </select>
          {errors.trainingMode && <p className="text-[#0D9488] text-xs mt-1">{errors.trainingMode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">Services Offered *</label>
          <div className={`grid grid-cols-2 gap-3 p-4 border rounded-xl ${errors.services ? 'border-[#0D9488] bg-[#F0FDFA]/30' : 'border-[#CCFBF1] bg-[#F8FAFC]'}`}>
            {['Gym Membership', 'Personal Training', 'Group Classes', 'Online Training', 'Offline Training', 'AI Fitness Coaching', 'Diet Guidance'].map(service => (
              <label key={service} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(data.services || []).includes(service)}
                  onChange={(e) => {
                    const current = data.services || [];
                    if (e.target.checked) updateData({ services: [...current, service] });
                    else updateData({ services: current.filter((s: string) => s !== service) });
                  }}
                  className="rounded text-[#16A34A] focus:ring-[#16A34A] border-[#CBD5E1]"
                />
                <span className="text-sm text-[#1E293B]">{service}</span>
              </label>
            ))}
          </div>
          {errors.services && <p className="text-[#0D9488] text-xs mt-1">{errors.services}</p>}
        </div>
      </div>
    </div>
  );
};
