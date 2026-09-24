import { LifeBuoy } from 'lucide-react';

const AdminSupport = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LifeBuoy className="text-[#164A4A]" size={32} />
            Support Tickets
          </h1>
          <p className="text-[#455250] mt-2">Handle user inquiries and technical issues.</p>
        </div>
        <button className="px-6 py-2 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
          Manage Support Tickets
        </button>
      </div>
      
      
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] p-5 rounded-2xl flex justify-between items-start">
             <div>
               <div className="flex items-center gap-3 mb-2">
                 <span className="px-2 py-0.5 bg-[#6fa3a0]/10 text-[#6fa3a0] rounded text-xs uppercase font-bold">High Priority</span>
                 <span className="text-[#455250] text-sm">Ticket #{1000 + i}</span>
               </div>
               <h3 className="font-bold text-lg">App crashing on workout start</h3>
               <p className="text-sm text-[#455250] mt-1">Reported by Sarah J. • 2 hours ago</p>
             </div>
             <button className="px-4 py-2 bg-[#E8E5DA] hover:bg-[#333] rounded-lg text-sm">Respond</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminSupport;