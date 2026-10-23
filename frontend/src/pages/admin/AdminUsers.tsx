import { Users } from 'lucide-react';

const AdminUsers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="text-[#6366F1]" size={32} />
            User Management
          </h1>
          <p className="text-[#A1A1AA] mt-2">View and manage all registered members on the platform.</p>
        </div>
        <button className="px-6 py-2 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#4F46E5] transition-colors">
          Manage User Management
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[#292940] flex gap-4">
          <input type="text" placeholder="Search by name or email..." className="flex-1 bg-[#FFFFFF] border border-[#292940] rounded-xl px-4 py-2 outline-none focus:border-[#6366F1]" />
          <select className="bg-[#FFFFFF] border border-[#292940] rounded-xl px-4 py-2 outline-none text-[#A1A1AA]">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#FFFFFF] text-[#A1A1AA] text-sm border-b border-[#292940]">
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Plan</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#292940] text-sm">
            {['John Doe', 'Sarah Smith', 'Mike Johnson', 'Emily Davis', 'Alex Wilson'].map((name, i) => (
              <tr key={i} className="hover:bg-[#FFFFFF]">
                <td className="p-4">
                  <div className="font-bold text-[#11111F]">{name}</div>
                  <div className="text-xs text-[#A1A1AA]">{name.toLowerCase().replace(' ', '.')}@example.com</div>
                </td>
                <td className="p-4">{i % 2 === 0 ? 'Gold Plan' : 'Basic Plan'}</td>
                <td className="p-4">Oct {10 + i}, 2026</td>
                <td className="p-4"><span className="px-2 py-1 bg-[#6366F1]/10 text-[#6366F1] rounded text-xs">Active</span></td>
                <td className="p-4 text-right"><button className="text-[#A1A1AA] hover:text-[#11111F]">View Profile</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
    </div>
  );
};

export default AdminUsers;