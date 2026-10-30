import { Dumbbell } from 'lucide-react';

const SuperAdminGymTrainers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7DADD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Dumbbell className="text-[#B76E79]" size={32} />
            Gym Trainers
          </h1>
          <p className="text-[#57534E] mt-2 font-mono text-sm">Fitness professionals mapped to specific organizations.</p>
        </div>
        <button className="px-6 py-2 bg-[#F3E8E8]/10 text-[#9F5965] border border-[#F3E8E8]/30 rounded-xl font-bold hover:bg-[#F3E8E8] hover:text-[#B76E79] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="grid md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-xl p-4 flex items-center gap-3">
             <div className="w-10 h-10 bg-[#F3E8E8] rounded-full"></div>
             <div>
               <p className="font-bold text-sm">Trainer ${i}</p>
               <p className="text-xs text-[#57534E]">ORG_001</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymTrainers;