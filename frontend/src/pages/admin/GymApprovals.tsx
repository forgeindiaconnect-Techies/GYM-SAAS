import { Check, X, Search } from 'lucide-react';

const GymApprovals = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Pending Gym Approvals</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" size={20} />
          <input 
            type="text" 
            placeholder="Search gyms..." 
            className="pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#FDBA74] text-[#111827]"
          />
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
              <th className="px-6 py-4 font-medium text-[#64748B]">Gym Name</th>
              <th className="px-6 py-4 font-medium text-[#64748B]">Owner</th>
              <th className="px-6 py-4 font-medium text-[#64748B]">Location</th>
              <th className="px-6 py-4 font-medium text-[#64748B]">Date Submitted</th>
              <th className="px-6 py-4 font-medium text-[#64748B]">Status</th>
              <th className="px-6 py-4 font-medium text-[#64748B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-[#E2E8F0] hover:bg-[#FFFFFF] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-[#111827]">FitLife Center {i}</div>
                  <div className="text-sm text-[#64748B]">2 branches</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[#111827]">John Doe {i}</div>
                  <div className="text-sm text-[#64748B]">john{i}@example.com</div>
                </td>
                <td className="px-6 py-4 text-[#64748B]">New York, NY</td>
                <td className="px-6 py-4 text-[#64748B]">Sep 1, 2026</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-yellow-500/10 text-[#EA580C] border border-yellow-500/20 rounded-full text-sm">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors border border-green-500/20" title="Approve">
                      <Check size={18} />
                    </button>
                    <button className="p-2 bg-[#FFF7ED] text-[#9A3412] hover:bg-[#FFF7ED]/20 rounded-lg transition-colors border border-[#F8FAFC]/20" title="Reject">
                      <X size={18} />
                    </button>
                    <button className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#C2410C] rounded-lg transition-colors text-sm font-medium">
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
