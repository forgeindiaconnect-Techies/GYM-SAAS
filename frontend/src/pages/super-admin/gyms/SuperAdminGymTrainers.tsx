import { Dumbbell } from 'lucide-react';

const SuperAdminGymTrainers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#292940] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Dumbbell className="text-[#6366F1]" size={32} />
            Gym Trainers
          </h1>
          <p className="text-[#A1A1AA] mt-2 font-mono text-sm">Fitness professionals mapped to specific organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#17172A]/10 text-[#4F46E5] border border-[#17172A]/30 rounded-xl font-bold hover:bg-[#17172A] hover:text-[#6366F1] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="grid md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#292940] rounded-xl p-4 flex items-center gap-3">
             <div className="w-10 h-10 bg-[#17172A] rounded-full"></div>
             <div>
               <p className="font-bold text-sm">Trainer ${i}</p>
               <p className="text-xs text-[#A1A1AA]">ORG_001</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymTrainers;