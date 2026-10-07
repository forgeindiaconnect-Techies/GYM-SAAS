import { Building2 } from 'lucide-react';

const SuperAdminGymsTrainers = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7E5E4] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#FED7AA]" size={32} />
            Gym Trainers
          </h1>
          <p className="text-[#78716C] mt-2 font-mono text-sm">Directory of trainers mapped to specific gyms.</p>
        </div>
      </div>
      
      
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7E5E4] p-5 rounded-xl flex flex-col items-center">
             <div className="w-16 h-16 bg-[#FED7AA] rounded-full mb-3"></div>
             <h3 className="font-bold text-[#292524]">Trainer {i}</h3>
             <p className="text-xs text-[#78716C] mb-4">Iron Paradise {i}</p>
             <button className="w-full py-2 bg-[#FED7AA] text-white rounded-lg text-sm hover:bg-[#333]">View Schedule</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default SuperAdminGymsTrainers;
