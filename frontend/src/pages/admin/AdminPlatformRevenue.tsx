import { BarChart3 } from 'lucide-react';

const AdminPlatformRevenue = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="text-[#EA580C]" size={32} />
            Platform Revenue
          </h1>
          <p className="text-[#64748B] mt-2">Net revenue after trainer splits and gateway fees.</p>
        </div>
        <button className="px-6 py-2 bg-[#C2410C] text-white font-bold rounded-xl font-bold hover:bg-[#9A3412] transition-colors">
          Manage Platform Revenue
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 text-center mb-6">
        <h2 className="text-[#64748B] uppercase tracking-widest text-sm mb-4">Net Platform Revenue (YTD)</h2>
        <p className="text-6xl font-bold text-[#111827] mb-2">$142,890</p>
        <p className="text-green-500">+14% vs last year</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6">
           <h3 className="font-bold mb-4">Revenue by Source</h3>
           <div className="space-y-4">
             <div>
               <div className="flex justify-between text-sm mb-1"><span>Subscriptions</span><span>$80,000</span></div>
               <div className="w-full bg-[#F8FAFC] h-1.5 rounded-full"><div className="bg-[#C2410C] h-1.5 rounded-full" style={{width:'60%'}}></div></div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1"><span>Trainer Commissions</span><span>$50,000</span></div>
               <div className="w-full bg-[#F8FAFC] h-1.5 rounded-full"><div className="bg-[#C2410C] h-1.5 rounded-full" style={{width:'35%'}}></div></div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1"><span>Merch/Other</span><span>$12,890</span></div>
               <div className="w-full bg-[#F8FAFC] h-1.5 rounded-full"><div className="bg-[#C2410C] h-1.5 rounded-full" style={{width:'15%'}}></div></div>
             </div>
           </div>
         </div>
      </div>
    
    </div>
  );
};

export default AdminPlatformRevenue;