import { LifeBuoy } from 'lucide-react';

const AdminSupport = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LifeBuoy className="text-[#6366F1]" size={32} />
            Support Tickets
          </h1>
          <p className="text-[#A1A1AA] mt-2">Handle user inquiries and technical issues.</p>
        </div>
        <button className="px-6 py-2 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#4F46E5] transition-colors">
          Manage Support Tickets
        </button>
      </div>
      
      
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#292940] p-5 rounded-2xl flex justify-between items-start">
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <span className="px-2 py-0.5 bg-[#17172A]/10 text-[#4F46E5] rounded text-xs uppercase font-bold">High Priority</span>
                 <span className="text-[#A1A1AA] text-sm">Ticket #{1000 + i}</span>
               </div>
               <h3 className="font-bold text-lg">App crashing on workout start</h3>
               <p className="text-sm text-[#A1A1AA] mt-1">Reported by Sarah J. • 2 hours ago</p>
             </div>
             <button className="px-4 py-2 bg-[#17172A] hover:bg-[#333] rounded-lg text-sm">Respond</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminSupport;