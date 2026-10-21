import { AlertTriangle } from 'lucide-react';

const SuperAdminSuspendedGyms = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#E5DDEB] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="text-[#967CC5]" size={32} />
            Suspended Gyms
          </h1>
          <p className="text-[#6B5E78] mt-2 font-mono text-sm">Organizations with revoked or frozen access.</p>
        </div>
        <button className="px-6 py-2 bg-[#E9DFF4]/10 text-[#967CC5] border border-[#E9DFF4]/30 rounded-xl font-bold hover:bg-[#E9DFF4] hover:text-[#A991D4] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl p-5 border-l-4 border-l-amber-500 flex justify-between items-center">
             <div>
               <h3 className="font-bold text-lg text-[#292431]">Rogue Iron Gym ${i}</h3>
               <p className="text-[#6B5E78] text-sm mt-1">Reason: Billing Default</p>
             </div>
             <button className="px-4 py-2 border border-[#E5DDEB] hover:bg-[#E9DFF4] rounded-lg text-sm transition-colors">Reactivate</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminSuspendedGyms;