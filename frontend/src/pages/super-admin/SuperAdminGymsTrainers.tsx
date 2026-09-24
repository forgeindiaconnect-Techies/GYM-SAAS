import { Building2 } from 'lucide-react';

const SuperAdminGymsTrainers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#D3DFDA] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#6fa3a0]" size={32} />
            Gym Trainers
          </h1>
          <p className="text-[#455250] mt-2 font-mono text-sm">Directory of trainers mapped to specific gyms.</p>
        </div>
      </div>
      
      
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] p-5 rounded-xl flex flex-col items-center">
             <div className="w-16 h-16 bg-[#E8E5DA] rounded-full mb-3"></div>
             <h3 className="font-bold text-[#202828]">Trainer {i}</h3>
             <p className="text-xs text-[#455250] mb-4">Iron Paradise {i}</p>
             <button className="w-full py-2 bg-[#E8E5DA] text-white rounded-lg text-sm hover:bg-[#333]">View Schedule</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default SuperAdminGymsTrainers;
