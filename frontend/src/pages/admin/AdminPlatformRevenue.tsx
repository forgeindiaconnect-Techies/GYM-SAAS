import { BarChart3 } from 'lucide-react';

const AdminPlatformRevenue = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="text-[#34483F]" size={32} />
            Platform Revenue
          </h1>
          <p className="text-[#4A514D] mt-2">Net revenue after trainer splits and gateway fees.</p>
        </div>
        <button className="px-6 py-2 bg-[#34483F] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
          Manage Platform Revenue
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-8 text-center mb-6">
        <h2 className="text-[#4A514D] uppercase tracking-widest text-sm mb-4">Net Platform Revenue (YTD)</h2>
        <p className="text-6xl font-bold text-[#202522] mb-2">$142,890</p>
        <p className="text-green-500">+14% vs last year</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
           <h3 className="font-bold mb-4">Revenue by Source</h3>
           <div className="space-y-4">
             <div>
               <div className="flex justify-between text-sm mb-1"><span>Subscriptions</span><span>$80,000</span></div>
               <div className="w-full bg-[#E8E5DA] h-1.5 rounded-full"><div className="bg-[#34483F] h-1.5 rounded-full" style={{width:'60%'}}></div></div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1"><span>Trainer Commissions</span><span>$50,000</span></div>
               <div className="w-full bg-[#E8E5DA] h-1.5 rounded-full"><div className="bg-[#34483F] h-1.5 rounded-full" style={{width:'35%'}}></div></div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1"><span>Merch/Other</span><span>$12,890</span></div>
               <div className="w-full bg-[#E8E5DA] h-1.5 rounded-full"><div className="bg-[#34483F] h-1.5 rounded-full" style={{width:'15%'}}></div></div>
             </div>
           </div>
         </div>
      </div>
    
    </div>
  );
};

export default AdminPlatformRevenue;