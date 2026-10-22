import { ShieldCheck } from 'lucide-react';

export const Step4AdminAccount = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#D9E2E3]">
        <ShieldCheck className="text-[#167D78]" size={24} />
        <div>
          <h2 className="text-xl font-bold">Gym Admin Account</h2>
          <p className="text-sm text-[#697778] mt-1">This account will be used to log in to the Gym Admin Portal.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#697778] mb-2">Admin Name *</label>
          <input
            type="text"
            value={data.adminName}
            onChange={(e) => updateData({ adminName: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminName ? 'border-[#D8EAE7]' : 'border-[#D9E2E3]'} rounded-xl px-4 py-3 text-sm text-[#344B4A] outline-none focus:border-[#167D78]`}
            placeholder="Admin User"
          />
          {errors.adminName && <p className="text-[#D8EAE7] text-xs mt-1">{errors.adminName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#697778] mb-2">Admin Email *</label>
          <input
            type="email"
            value={data.adminEmail}
            onChange={(e) => updateData({ adminEmail: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminEmail ? 'border-[#D8EAE7]' : 'border-[#D9E2E3]'} rounded-xl px-4 py-3 text-sm text-[#344B4A] outline-none focus:border-[#167D78]`}
            placeholder="admin@gym.com"
          />
          {errors.adminEmail && <p className="text-[#D8EAE7] text-xs mt-1">{errors.adminEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#697778] mb-2">Password *</label>
          <input
            type="password"
            value={data.adminPassword}
            onChange={(e) => updateData({ adminPassword: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminPassword ? 'border-[#D8EAE7]' : 'border-[#D9E2E3]'} rounded-xl px-4 py-3 text-sm text-[#344B4A] outline-none focus:border-[#167D78]`}
            placeholder="••••••••"
          />
          {errors.adminPassword && <p className="text-[#D8EAE7] text-xs mt-1">{errors.adminPassword}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#697778] mb-2">Confirm Password *</label>
          <input
            type="password"
            value={data.adminConfirmPassword}
            onChange={(e) => updateData({ adminConfirmPassword: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminConfirmPassword ? 'border-[#D8EAE7]' : 'border-[#D9E2E3]'} rounded-xl px-4 py-3 text-sm text-[#344B4A] outline-none focus:border-[#167D78]`}
            placeholder="••••••••"
          />
          {errors.adminConfirmPassword && <p className="text-[#D8EAE7] text-xs mt-1">{errors.adminConfirmPassword}</p>}
        </div>
      </div>
    </div>
  );
};
