import { BarChart3 } from 'lucide-react';

const AdminPlatformRevenue = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="text-[#F97316]" size={32} />
            Platform Revenue
          </h1>
          <p className="text-[#78716C] mt-2">Net revenue after trainer splits and gateway fees.</p>
        </div>
        <button className="px-6 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors">
          Manage Platform Revenue
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 text-center mb-6">
        <h2 className="text-[#78716C] uppercase tracking-widest text-sm mb-4">Net Platform Revenue (YTD)</h2>
        <p className="text-6xl font-bold text-[#292524] mb-2">$142,890</p>
        <p className="text-green-500">+14% vs last year</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6">
           <h3 className="font-bold mb-4">Revenue by Source</h3>
           <div className="space-y-4">
             <div>
               <div className="flex justify-between text-sm mb-1"><span>Subscriptions</span><span>$80,000</span></div>
               <div className="w-full bg-[#FED7AA] h-1.5 rounded-full"><div className="bg-[#F97316] h-1.5 rounded-full" style={{width:'60%'}}></div></div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1"><span>Trainer Commissions</span><span>$50,000</span></div>
               <div className="w-full bg-[#FED7AA] h-1.5 rounded-full"><div className="bg-[#F97316] h-1.5 rounded-full" style={{width:'35%'}}></div></div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1"><span>Merch/Other</span><span>$12,890</span></div>
               <div className="w-full bg-[#FED7AA] h-1.5 rounded-full"><div className="bg-[#F97316] h-1.5 rounded-full" style={{width:'15%'}}></div></div>
             </div>
           </div>
         </div>
      </div>
    
    </div>
  );
};

export default AdminPlatformRevenue;