export const Step4AdminAccount = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-[#CCFBF1] pb-4 mb-6">
        <h2 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
          4. Gym Admin Account
        </h2>
        <p className="text-[#475569] text-sm mt-1">This account will be used to log into the Gym Admin portal.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">Admin Name *</label>
          <input
            type="text"
            value={data.adminName}
            onChange={(e) => updateData({ adminName: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminName ? 'border-[#0D9488]' : 'border-[#CCFBF1]'} rounded-xl px-4 py-3 text-sm text-[#1E293B] outline-none focus:border-[#16A34A]`}
            placeholder="Admin Full Name"
          />
          {errors.adminName && <p className="text-[#0D9488] text-xs mt-1">{errors.adminName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">Admin Email *</label>
          <input
            type="email"
            value={data.adminEmail}
            onChange={(e) => updateData({ adminEmail: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminEmail ? 'border-[#0D9488]' : 'border-[#CCFBF1]'} rounded-xl px-4 py-3 text-sm text-[#1E293B] outline-none focus:border-[#16A34A]`}
            placeholder="admin@gym.com"
          />
          {errors.adminEmail && <p className="text-[#0D9488] text-xs mt-1">{errors.adminEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">Password *</label>
          <input
            type="password"
            value={data.adminPassword}
            onChange={(e) => updateData({ adminPassword: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminPassword ? 'border-[#0D9488]' : 'border-[#CCFBF1]'} rounded-xl px-4 py-3 text-sm text-[#1E293B] outline-none focus:border-[#16A34A]`}
            placeholder="••••••••"
          />
          {errors.adminPassword && <p className="text-[#0D9488] text-xs mt-1">{errors.adminPassword}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#475569] mb-2">Confirm Password *</label>
          <input
            type="password"
            value={data.adminConfirmPassword}
            onChange={(e) => updateData({ adminConfirmPassword: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminConfirmPassword ? 'border-[#0D9488]' : 'border-[#CCFBF1]'} rounded-xl px-4 py-3 text-sm text-[#1E293B] outline-none focus:border-[#16A34A]`}
            placeholder="••••••••"
          />
          {errors.adminConfirmPassword && <p className="text-[#0D9488] text-xs mt-1">{errors.adminConfirmPassword}</p>}
        </div>
      </div>
    </div>
  );
};