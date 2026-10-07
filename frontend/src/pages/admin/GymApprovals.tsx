import { Check, X, Search } from 'lucide-react';

const GymApprovals = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Pending Gym Approvals</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#78716C]" size={20} />
          <input 
            type="text" 
            placeholder="Search gyms..." 
            className="pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E7E5E4] rounded-lg focus:outline-none focus:border-[#F97316] text-[#292524]"
          />
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFFFFF] border-b border-[#E7E5E4]">
              <th className="px-6 py-4 font-medium text-[#78716C]">Gym Name</th>
              <th className="px-6 py-4 font-medium text-[#78716C]">Owner</th>
              <th className="px-6 py-4 font-medium text-[#78716C]">Location</th>
              <th className="px-6 py-4 font-medium text-[#78716C]">Date Submitted</th>
              <th className="px-6 py-4 font-medium text-[#78716C]">Status</th>
              <th className="px-6 py-4 font-medium text-[#78716C]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-[#E7E5E4] hover:bg-[#FFFFFF] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-[#292524]">FitLife Center {i}</div>
                  <div className="text-sm text-[#78716C]">2 branches</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[#292524]">John Doe {i}</div>
                  <div className="text-sm text-[#78716C]">john{i}@example.com</div>
                </td>
                <td className="px-6 py-4 text-[#78716C]">New York, NY</td>
                <td className="px-6 py-4 text-[#78716C]">Sep 1, 2026</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-yellow-500/10 text-[#F59E0B] border border-yellow-500/20 rounded-full text-sm">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20" title="Approve">
                      <Check size={18} />
                    </button>
                    <button className="p-2 bg-[#FED7AA]/10 text-[#FED7AA] hover:bg-[#FED7AA]/20 rounded-lg transition-colors border border-[#FED7AA]/20" title="Reject">
                      <X size={18} />
                    </button>
                    <button className="px-4 py-2 bg-[#FED7AA] hover:bg-[#FED7AA] text-white rounded-lg transition-colors text-sm font-medium">
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GymApprovals;
