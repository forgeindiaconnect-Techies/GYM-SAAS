import { User } from 'lucide-react';

export const Step2OwnerInfo = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#292940]">
        <User className="text-[#6366F1]" size={24} />
        <h2 className="text-xl font-bold">Owner Information</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Owner Full Name *</label>
          <input
            type="text"
            value={data.ownerName}
            onChange={(e) => updateData({ ownerName: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.ownerName ? 'border-[#17172A]' : 'border-[#292940]'} rounded-xl px-4 py-3 text-sm text-[#11111F] outline-none focus:border-[#6366F1]`}
            placeholder="John Doe"
          />
          {errors.ownerName && <p className="text-[#17172A] text-xs mt-1">{errors.ownerName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Email *</label>
          <input
            type="email"
            value={data.ownerEmail}
            onChange={(e) => updateData({ ownerEmail: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.ownerEmail ? 'border-[#17172A]' : 'border-[#292940]'} rounded-xl px-4 py-3 text-sm text-[#11111F] outline-none focus:border-[#6366F1]`}
            placeholder="john@example.com"
          />
          {errors.ownerEmail && <p className="text-[#17172A] text-xs mt-1">{errors.ownerEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Phone Number *</label>
          <input
            type="text"
            maxLength={10}
            value={data.ownerPhone}
            onChange={(e) => updateData({ ownerPhone: e.target.value.replace(/\D/g, '') })}
            className={`w-full bg-[#FFFFFF] border ${errors.ownerPhone ? 'border-[#17172A]' : 'border-[#292940]'} rounded-xl px-4 py-3 text-sm text-[#11111F] outline-none focus:border-[#6366F1]`}
            placeholder="10 digit number"
          />
          {errors.ownerPhone && <p className="text-[#17172A] text-xs mt-1">{errors.ownerPhone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Alternate Phone Number</label>
          <input
            type="text"
            maxLength={10}
            value={data.ownerAltPhone}
            onChange={(e) => updateData({ ownerAltPhone: e.target.value.replace(/\D/g, '') })}
            className={`w-full bg-[#FFFFFF] border ${errors.ownerAltPhone ? 'border-[#17172A]' : 'border-[#292940]'} rounded-xl px-4 py-3 text-sm text-[#11111F] outline-none focus:border-[#6366F1]`}
            placeholder="10 digit number"
          />
          {errors.ownerAltPhone && <p className="text-[#17172A] text-xs mt-1">{errors.ownerAltPhone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Date of Birth</label>
          <input
            type="date"
            value={data.ownerDob}
            onChange={(e) => updateData({ ownerDob: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#292940] rounded-xl px-4 py-3 text-sm text-[#11111F] outline-none focus:border-[#6366F1] [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Gender</label>
          <select
            value={data.ownerGender}
            onChange={(e) => updateData({ ownerGender: e.target.value })}
            className="w-full bg-[#FFFFFF] border border-[#292940] rounded-xl px-4 py-3 text-sm text-[#11111F] outline-none focus:border-[#6366F1] appearance-none"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Residential Address</label>
          <textarea
            value={data.ownerAddress}
            onChange={(e) => updateData({ ownerAddress: e.target.value })}
            rows={2}
            className="w-full bg-[#FFFFFF] border border-[#292940] rounded-xl px-4 py-3 text-sm text-[#11111F] outline-none focus:border-[#6366F1] resize-none"
            placeholder="123 Owner Street, City..."
          />
        </div>
      </div>
    </div>
  );
};
