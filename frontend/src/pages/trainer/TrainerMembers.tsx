import { Users, Search, MoreVertical, MessageSquare, Activity } from 'lucide-react';

const TrainerMembers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Assigned Users</h1>
          <p className="text-[#475569]">Manage your 24 active clients</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#16A34A] transition-colors"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Sarah Connor', goal: 'Weight Loss', status: 'Active', nextSession: 'Today, 10:00 AM' },
          { name: 'Mike Tyson', goal: 'Muscle Gain', status: 'Active', nextSession: 'Tomorrow, 5:00 PM' },
          { name: 'John Doe', goal: 'Endurance', status: 'Inactive', nextSession: 'Not Scheduled' },
          { name: 'Jane Smith', goal: 'Flexibility', status: 'Active', nextSession: 'Oct 20, 08:00 AM' },
          { name: 'Bruce Wayne', goal: 'Strength', status: 'Active', nextSession: 'Oct 21, 06:00 PM' },
          { name: 'Clark Kent', goal: 'General Fitness', status: 'Active', nextSession: 'Oct 22, 07:00 AM' },
        ].map((client, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-5 hover:border-[#16A34A]/30 transition-colors relative group">
            <button className="absolute top-4 right-4 text-[#475569] hover:text-[#1E293B]"><MoreVertical size={18}/></button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#E2E8F0] rounded-full flex items-center justify-center font-bold text-lg text-[#1E293B]">
                {client.name[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg">{client.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${client.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-[#0D9488]/10 text-[#0D9488]'}`}>
                  {client.status}
                </span>
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[#475569]">Goal:</span>
                <span className="font-medium">{client.goal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#475569]">Next Session:</span>
                <span className="font-medium text-[#16A34A]">{client.nextSession}</span>
              </div>
            </div>
            <div className="flex gap-2">
               <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#16A34A]/10 hover:bg-[#16A34A]/20 text-[#16A34A] rounded-xl text-sm font-bold transition-colors">
                 <Activity size={16} /> Progress
               </button>
               <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#E2E8F0] hover:bg-[#333] text-white rounded-xl text-sm font-bold transition-colors">
                 <MessageSquare size={16} /> Chat
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerMembers;