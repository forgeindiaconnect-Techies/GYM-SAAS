export const Step1GymInfo = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-[#DCD9CD] pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[#202522] flex items-center gap-2">
          1. Gym Information
        </h2>
        <p className="text-[#4A514D] text-sm mt-1">Basic details about the gym.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Gym Name *</label>
          <input
            type="text"
            value={data.gymName}
            onChange={(e) => updateData({ gymName: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.gymName ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F] transition-colors`}
            placeholder="e.g. FitLife Arena"
          />
          {errors.gymName && <p className="text-[#8FA89B] text-xs mt-1">{errors.gymName}</p>}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Gym Type *</label>
          <select
            value={data.type}
            onChange={(e) => updateData({ type: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.type ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F] transition-colors appearance-none cursor-pointer`}
          >
            <option value="Commercial Gym">Commercial Gym</option>
            <option value="Boutique Studio">Boutique Studio</option>
            <option value="CrossFit Box">CrossFit Box</option>
            <option value="Yoga Studio">Yoga Studio</option>
            <option value="Martial Arts">Martial Arts</option>
          </select>
          <div className="absolute right-4 top-[38px] pointer-events-none text-[#4A514D]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          {errors.type && <p className="text-[#8FA89B] text-xs mt-1">{errors.type}</p>}
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Registration Number</label>
          <input
            type="text"
            value={data.regNum}
            onChange={(e) => updateData({ regNum: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F] transition-colors"
            placeholder="e.g. REG-12345"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Description</label>
          <textarea
            value={data.desc}
            onChange={(e) => updateData({ desc: e.target.value })}
            rows={4}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F] transition-colors resize-none"
            placeholder="Brief description of the gym..."
          />
        </div>
      </div>
    </div>
  );
};