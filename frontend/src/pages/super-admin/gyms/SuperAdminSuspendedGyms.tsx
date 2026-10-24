import { AlertTriangle } from 'lucide-react';

const SuperAdminSuspendedGyms = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#2A3A3A] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertTriangle className="text-[#2DD4BF]" size={32} />
            Suspended Gyms
          </h1>
          <p className="text-[#9AAEAE] mt-2 font-mono text-sm">Organizations with revoked or frozen access.</p>
        </div>
        <button className="px-6 py-2 bg-[#1B2728]/10 text-[#5EEAD4] border border-[#1B2728]/30 rounded-xl font-bold hover:bg-[#1B2728] hover:text-[#2DD4BF] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#2A3A3A] rounded-2xl p-5 border-l-4 border-l-amber-500 flex justify-between items-center">
             <div>
               <h3 className="font-bold text-lg text-[#F5FAFA]">Rogue Iron Gym ${i}</h3>
               <p className="text-[#9AAEAE] text-sm mt-1">Reason: Billing Default</p>
             </div>
             <button className="px-4 py-2 border border-[#2A3A3A] hover:bg-[#1B2728] rounded-lg text-sm transition-colors">Reactivate</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminSuspendedGyms;