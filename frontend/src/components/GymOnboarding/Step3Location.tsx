import { MapPin } from 'lucide-react';

export const Step3Location = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#DCD9CD]">
        <MapPin className="text-[#34483F]" size={24} />
        <h2 className="text-xl font-bold">Location & Capacity</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Gym Address</label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]"
            placeholder="123 Fitness St"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">City *</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.city ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]`}
            placeholder="New York"
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
            placeholder="NY"
          />
          {errors.state && <p className="text-[#8FA89B] text-xs mt-1">{errors.state}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Country</label>
          <input
            type="text"
            value={data.country}
            onChange={(e) => updateData({ country: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]"
            placeholder="USA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Pincode</label>
          <input
            type="text"
            value={data.pincode}
            onChange={(e) => updateData({ pincode: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]"
            placeholder="10001"
          />
        </div>

        <div className="pt-4 border-t border-[#DCD9CD] md:col-span-2"></div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Max Member Capacity</label>
          <input
            type="number"
            value={data.maxCapacity}
            onChange={(e) => updateData({ maxCapacity: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]"
            placeholder="500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Total Gym Area (Sq Ft)</label>
          <input
            type="number"
            value={data.totalArea}
            onChange={(e) => updateData({ totalArea: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]"
            placeholder="5000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Number of Floors</label>
          <input
            type="number"
            value={data.floors}
            onChange={(e) => updateData({ floors: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]"
            placeholder="1"
          />
        </div>
      </div>
    </div>
  );
};
