export const Step2OwnerInfo = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-[#D3DFDA] pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[#202828] flex items-center gap-2">
          2. Owner Information
        </h2>
        <p className="text-[#455250] text-sm mt-1">Contact details of the gym owner.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#455250] mb-2">Owner Name *</label>
          <input
            type="text"
            value={data.ownerName}
            onChange={(e) => updateData({ ownerName: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.ownerName ? 'border-[#6fa3a0]' : 'border-[#D3DFDA]'} rounded-xl px-4 py-3 text-sm text-[#202828] outline-none focus:border-[#164A4A]`}
            placeholder="Full Name"
          />
          {errors.ownerName && <p className="text-[#6fa3a0] text-xs mt-1">{errors.ownerName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#455250] mb-2">Email Address *</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.email ? 'border-[#6fa3a0]' : 'border-[#D3DFDA]'} rounded-xl px-4 py-3 text-sm text-[#202828] outline-none focus:border-[#164A4A]`}
            placeholder="owner@example.com"
          />
          {errors.email && <p className="text-[#6fa3a0] text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#455250] mb-2">Phone Number *</label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            className={`w-full bg-[#FFFFFF] border ${errors.phone ? 'border-[#6fa3a0]' : 'border-[#D3DFDA]'} rounded-xl px-4 py-3 text-sm text-[#202828] outline-none focus:border-[#164A4A]`}
            placeholder="10 digit number"
          />
          {errors.phone && <p className="text-[#6fa3a0] text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>
    </div>
  );
};