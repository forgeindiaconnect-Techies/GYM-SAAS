import { FileText, Plus, Search, Dumbbell, MoreVertical } from 'lucide-react';

const TrainerWorkoutPlans = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Workout Plans</h1>
          <p className="text-[#475569]">Manage templates and custom routines</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input type="text" placeholder="Search plans..." className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl pl-10 pr-4 py-2 text-sm focus:border-[#16A34A] outline-none" />
          </div>
          <button className="px-4 py-2 bg-[#16A34A] text-white rounded-xl font-bold flex items-center gap-2 shrink-0">
            <Plus size={18} /> Create Plan
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { name: 'Beginner Full Body', category: 'General', duration: '45 Min', level: 'Beginner', users: 12 },
          { name: 'Advanced Push/Pull/Legs', category: 'Hypertrophy', duration: '60 Min', level: 'Advanced', users: 5 },
          { name: 'HIIT Fat Burner', category: 'Cardio', duration: '30 Min', level: 'Intermediate', users: 8 },
          { name: 'Core & Stability', category: 'Strength', duration: '40 Min', level: 'Beginner', users: 3 },
        ].map((plan, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-5 relative group hover:border-[#16A34A]/50 transition-colors cursor-pointer">
            <button className="absolute top-4 right-4 text-[#475569] hover:text-[#1E293B]"><MoreVertical size={18}/></button>
            <div className="w-12 h-12 bg-[#16A34A]/10 rounded-xl flex items-center justify-center mb-4 text-[#16A34A]">
              <Dumbbell size={24} />
            </div>
            <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
            <span className="inline-block px-2 py-1 bg-[#FFFFFF] rounded text-xs text-[#475569] mb-4 border border-[#CCFBF1]">
              {plan.category}
            </span>
            
            <div className="grid grid-cols-2 gap-4 text-sm mt-2 pt-4 border-t border-[#CCFBF1]">
              <div>
                <p className="text-[#475569] text-xs">Level</p>
                <p className="font-medium">{plan.level}</p>
              </div>
              <div>
                <p className="text-[#475569] text-xs">Assigned</p>
                <p className="font-medium text-[#16A34A]">{plan.users} Clients</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerWorkoutPlans;