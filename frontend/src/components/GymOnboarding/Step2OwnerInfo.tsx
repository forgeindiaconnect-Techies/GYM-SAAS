import { User } from 'lucide-react';

export const Step2OwnerInfo = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#DCD9CD]">
        <User className="text-[#34483F]" size={24} />
        <h2 className="text-xl font-bold">Owner Information</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Owner Full Name *</label>
          <input
            type="text"
            value={data.ownerName}
            onChange={(e) => updateData({ ownerName: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.ownerName ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]`}
            placeholder="John Doe"
          />
          {errors.ownerName && <p className="text-[#8FA89B] text-xs mt-1">{errors.ownerName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Email *</label>
          <input
            type="email"
            value={data.ownerEmail}
            onChange={(e) => updateData({ ownerEmail: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.ownerEmail ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]`}
            placeholder="john@example.com"
          />
          {errors.ownerEmail && <p className="text-[#8FA89B] text-xs mt-1">{errors.ownerEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Phone Number *</label>
          <input
            type="text"
            maxLength={10}
            value={data.ownerPhone}
            onChange={(e) => updateData({ ownerPhone: e.target.value.replace(/\D/g, '') })}
            className={`w-full bg-[#FFFFFF] border ${errors.ownerPhone ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]`}
            placeholder="10 digit number"
          />
          {errors.ownerPhone && <p className="text-[#8FA89B] text-xs mt-1">{errors.ownerPhone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Alternate Phone Number</label>
          <input
            type="text"
            maxLength={10}
            value={data.ownerAltPhone}
            onChange={(e) => updateData({ ownerAltPhone: e.target.value.replace(/\D/g, '') })}
            className={`w-full bg-[#FFFFFF] border ${errors.ownerAltPhone ? 'border-[#8FA89B]' : 'border-[#DCD9CD]'} rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F]`}
            placeholder="10 digit number"
          />
          {errors.ownerAltPhone && <p className="text-[#8FA89B] text-xs mt-1">{errors.ownerAltPhone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Date of Birth</label>
          <input
            type="date"
            value={data.ownerDob}
            onChange={(e) => updateData({ ownerDob: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F] [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Gender</label>
          <select
            value={data.ownerGender}
            onChange={(e) => updateData({ ownerGender: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F] appearance-none"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#4A514D] mb-2">Residential Address</label>
          <textarea
            value={data.ownerAddress}
            onChange={(e) => updateData({ ownerAddress: e.target.value })}
            rows={2}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm text-[#202522] outline-none focus:border-[#34483F] resize-none"
            placeholder="123 Owner Street, City..."
          />
        </div>
      </div>
    </div>
  );
};
