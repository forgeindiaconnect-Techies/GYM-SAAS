import { Building2 } from 'lucide-react';

const SuperAdminGymsFacilities = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7DADD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#B76E79]" size={32} />
            Gym Facilities
          </h1>
          <p className="text-[#57534E] mt-2 font-mono text-sm">Track amenities like saunas, pools, and courts across gyms.</p>
        </div>
      </div>
      
      
      <div className="grid md:grid-cols-4 gap-4">
        {['Sauna', 'Steam Room', 'Olympic Pool', 'Basketball Court'].map((fac, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7DADD] p-5 rounded-xl text-center">
            <h3 className="font-bold text-[#292524] mb-2">{fac}</h3>
            <p className="text-xs text-[#57534E]">Available in 12 Gyms</p>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default SuperAdminGymsFacilities;
