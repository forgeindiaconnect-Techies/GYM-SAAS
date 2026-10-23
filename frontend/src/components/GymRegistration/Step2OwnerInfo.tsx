export const Step2OwnerInfo = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-[#292940] pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[#11111F] flex items-center gap-2">
          2. Owner Information
        </h2>
        <p className="text-[#A1A1AA] text-sm mt-1">Contact details of the gym owner.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Owner Name *</label>
          <input
            type="text"
            value={data.ownerName}
            onChange={(e) => updateData({ ownerName: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.ownerName ? 'border-[#17172A]' : 'border-[#292940]'} rounded-xl px-4 py-3 text-sm text-[#11111F] outline-none focus:border-[#6366F1]`}
            placeholder="Full Name"
          />
          {errors.ownerName && <p className="text-[#17172A] text-xs mt-1">{errors.ownerName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Email Address *</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.email ? 'border-[#17172A]' : 'border-[#292940]'} rounded-xl px-4 py-3 text-sm text-[#11111F] outline-none focus:border-[#6366F1]`}
            placeholder="owner@example.com"
          />
          {errors.email && <p className="text-[#17172A] text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Phone Number *</label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            className={`w-full bg-[#FFFFFF] border ${errors.phone ? 'border-[#17172A]' : 'border-[#292940]'} rounded-xl px-4 py-3 text-sm text-[#11111F] outline-none focus:border-[#6366F1]`}
            placeholder="10 digit number"
          />
          {errors.phone && <p className="text-[#17172A] text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>
    </div>
  );
};