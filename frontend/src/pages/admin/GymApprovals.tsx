import { Check, X, Search } from 'lucide-react';

const GymApprovals = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Pending Gym Approvals</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A1A1AA]" size={20} />
          <input 
            type="text" 
            placeholder="Search gyms..." 
            className="pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#292940] rounded-lg focus:outline-none focus:border-[#6366F1] text-[#11111F]"
          />
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#292940] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFFFFF] border-b border-[#292940]">
              <th className="px-6 py-4 font-medium text-[#A1A1AA]">Gym Name</th>
              <th className="px-6 py-4 font-medium text-[#A1A1AA]">Owner</th>
              <th className="px-6 py-4 font-medium text-[#A1A1AA]">Location</th>
              <th className="px-6 py-4 font-medium text-[#A1A1AA]">Date Submitted</th>
              <th className="px-6 py-4 font-medium text-[#A1A1AA]">Status</th>
              <th className="px-6 py-4 font-medium text-[#A1A1AA]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-[#292940] hover:bg-[#FFFFFF] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-[#11111F]">FitLife Center {i}</div>
                  <div className="text-sm text-[#A1A1AA]">2 branches</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[#11111F]">John Doe {i}</div>
                  <div className="text-sm text-[#A1A1AA]">john{i}@example.com</div>
                </td>
                <td className="px-6 py-4 text-[#A1A1AA]">New York, NY</td>
                <td className="px-6 py-4 text-[#A1A1AA]">Sep 1, 2026</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-yellow-500/10 text-[#D99A27] border border-yellow-500/20 rounded-full text-sm">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20" title="Approve">
                      <Check size={18} />
                    </button>
                    <button className="p-2 bg-[#17172A]/10 text-[#4F46E5] hover:bg-[#17172A]/20 rounded-lg transition-colors border border-[#17172A]/20" title="Reject">
                      <X size={18} />
                    </button>
                    <button className="px-4 py-2 bg-[#17172A] hover:bg-[#17172A] text-white rounded-lg transition-colors text-sm font-medium">
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
