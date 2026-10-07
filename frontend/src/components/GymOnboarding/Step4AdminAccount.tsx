import { ShieldCheck } from 'lucide-react';

export const Step4AdminAccount = ({ data, updateData, errors }: any) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#E7E5E4]">
        <ShieldCheck className="text-[#F97316]" size={24} />
        <div>
          <h2 className="text-xl font-bold">Gym Admin Account</h2>
          <p className="text-sm text-[#78716C] mt-1">This account will be used to log in to the Gym Admin Portal.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[#78716C] mb-2">Admin Name *</label>
          <input
            type="text"
            value={data.adminName}
            onChange={(e) => updateData({ adminName: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminName ? 'border-[#FED7AA]' : 'border-[#E7E5E4]'} rounded-xl px-4 py-3 text-sm text-[#292524] outline-none focus:border-[#F97316]`}
            placeholder="Admin User"
          />
          {errors.adminName && <p className="text-[#FED7AA] text-xs mt-1">{errors.adminName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#78716C] mb-2">Admin Email *</label>
          <input
            type="email"
            value={data.adminEmail}
            onChange={(e) => updateData({ adminEmail: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminEmail ? 'border-[#FED7AA]' : 'border-[#E7E5E4]'} rounded-xl px-4 py-3 text-sm text-[#292524] outline-none focus:border-[#F97316]`}
            placeholder="admin@gym.com"
          />
          {errors.adminEmail && <p className="text-[#FED7AA] text-xs mt-1">{errors.adminEmail}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#78716C] mb-2">Password *</label>
          <input
            type="password"
            value={data.adminPassword}
            onChange={(e) => updateData({ adminPassword: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminPassword ? 'border-[#FED7AA]' : 'border-[#E7E5E4]'} rounded-xl px-4 py-3 text-sm text-[#292524] outline-none focus:border-[#F97316]`}
            placeholder="••••••••"
          />
          {errors.adminPassword && <p className="text-[#FED7AA] text-xs mt-1">{errors.adminPassword}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#78716C] mb-2">Confirm Password *</label>
          <input
            type="password"
            value={data.adminConfirmPassword}
            onChange={(e) => updateData({ adminConfirmPassword: e.target.value })}
            className={`w-full bg-[#FFFFFF] border ${errors.adminConfirmPassword ? 'border-[#FED7AA]' : 'border-[#E7E5E4]'} rounded-xl px-4 py-3 text-sm text-[#292524] outline-none focus:border-[#F97316]`}
            placeholder="••••••••"
          />
          {errors.adminConfirmPassword && <p className="text-[#FED7AA] text-xs mt-1">{errors.adminConfirmPassword}</p>}
        </div>
      </div>
    </div>
  );
};
