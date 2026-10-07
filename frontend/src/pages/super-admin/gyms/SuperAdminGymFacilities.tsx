import { Map } from 'lucide-react';

const SuperAdminGymFacilities = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7E5E4] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Map className="text-[#FED7AA]" size={32} />
            Facilities
          </h1>
          <p className="text-[#78716C] mt-2 font-mono text-sm">Floor plans, rooms, and physical spaces mapping.</p>
        </div>
        <button className="px-6 py-2 bg-[#FED7AA]/10 text-[#FED7AA] border border-[#FED7AA]/30 rounded-xl font-bold hover:bg-[#FED7AA] hover:text-[#F97316] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {['Main Floor', 'Yoga Studio', 'CrossFit Rig', 'Sauna', 'Pool'].map((fac, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-5">
             <h3 className="font-bold text-lg mb-2">{fac}</h3>
             <p className="text-[#78716C] text-sm font-mono">Status: <span className="text-green-500">Open</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminGymFacilities;