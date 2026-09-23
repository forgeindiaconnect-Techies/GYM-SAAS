export const Step3Location = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-[#DCD9CD] pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[#202522] flex items-center gap-2">
          3. Location & Capacity
        </h2>
        <p className="text-[#4A514D] text-sm mt-1">Where is the gym located?</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">City *</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.city ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]`}
            placeholder="e.g. Mumbai"
          />
          {errors.city && <p className="text-[#8FA89B] text-xs mt-1">{errors.city}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">State *</label>
          <input
            type="text"
            value={data.state}
            onChange={(e) => updateData({ state: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.state ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]`}
            placeholder="e.g. Maharashtra"
          />
          {errors.state && <p className="text-[#8FA89B] text-xs mt-1">{errors.state}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Full Address *</label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.address ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]`}
            placeholder="123 Main St..."
          />
          {errors.address && <p className="text-[#8FA89B] text-xs mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Pincode *</label>
          <input
            type="text"
            value={data.pincode}
            onChange={(e) => updateData({ pincode: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.pincode ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]`}
            placeholder="e.g. 400001"
          />
          {errors.pincode && <p className="text-[#8FA89B] text-xs mt-1">{errors.pincode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Maximum Capacity *</label>
          <input
            type="number"
            min="1"
            value={data.maxCapacity}
            onChange={(e) => updateData({ maxCapacity: parseInt(e.target.value) || 0 })}
            className={`w-full bg-[#FFFFFF] border ${errors.maxCapacity ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]`}
            placeholder="Number of members"
          />
          {errors.maxCapacity ? (
            <p className="text-[#8FA89B] text-xs mt-1">{errors.maxCapacity}</p>
          ) : (
            <p className="text-xs text-[#4A514D] mt-1">Maximum members the gym can hold.</p>
          )}
        </div>
      </div>
    </div>
  );
};