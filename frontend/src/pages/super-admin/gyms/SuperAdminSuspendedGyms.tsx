import { AlertTriangle } from 'lucide-react';

const SuperAdminSuspendedGyms = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E7DADD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="text-[#B76E79]" size={32} />
            Suspended Gyms
          </h1>
          <p className="text-[#57534E] mt-2 font-mono text-sm">Organizations with revoked or frozen access.</p>
        </div>
        <button className="px-6 py-2 bg-[#F3E8E8]/10 text-[#9F5965] border border-[#F3E8E8]/30 rounded-xl font-bold hover:bg-[#F3E8E8] hover:text-[#B76E79] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-5 border-l-4 border-l-amber-500 flex justify-between items-center">
             <div>
               <h3 className="font-bold text-lg text-[#292524]">Rogue Iron Gym ${i}</h3>
               <p className="text-[#57534E] text-sm mt-1">Reason: Billing Default</p>
             </div>
             <button className="px-4 py-2 border border-[#E7DADD] hover:bg-[#F3E8E8] rounded-lg text-sm transition-colors">Reactivate</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminSuspendedGyms;