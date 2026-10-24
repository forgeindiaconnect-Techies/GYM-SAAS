import { PieChart } from 'lucide-react';

const AdminCommission = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PieChart className="text-[#2DD4BF]" size={32} />
            Commission Management
          </h1>
          <p className="text-[#9AAEAE] mt-2">Adjust global platform cuts for trainer sessions.</p>
        </div>
        <button className="px-6 py-2 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl font-bold hover:bg-[#5EEAD4] transition-colors">
          Manage Commission Management
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#2A3A3A] rounded-2xl p-6 max-w-xl">
        <h3 className="font-bold text-xl mb-6">Global Split Config</h3>
        <div className="space-y-6">
          <div>
            <label className="text-sm text-[#9AAEAE] mb-2 block">Standard Trainer Split (%)</label>
            <input type="number" defaultValue="80" className="w-full bg-[#FFFFFF] border border-[#2A3A3A] rounded-xl px-4 py-3 text-[#F5FAFA] text-lg outline-none focus:border-[#2DD4BF]" />
          </div>
          <div>
            <label className="text-sm text-[#9AAEAE] mb-2 block">Premium Trainer Split (%)</label>
            <input type="number" defaultValue="90" className="w-full bg-[#FFFFFF] border border-[#2A3A3A] rounded-xl px-4 py-3 text-[#F5FAFA] text-lg outline-none focus:border-[#2DD4BF]" />
          </div>
          <div>
            <label className="text-sm text-[#9AAEAE] mb-2 block">Platform Fee Fixed ($)</label>
            <input type="number" defaultValue="1.50" className="w-full bg-[#FFFFFF] border border-[#2A3A3A] rounded-xl px-4 py-3 text-[#F5FAFA] text-lg outline-none focus:border-[#2DD4BF]" />
          </div>
          <button className="w-full py-4 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl font-bold hover:bg-[#5EEAD4]">Save Configuration</button>
        </div>
      </div>
    
    </div>
  );
};

export default AdminCommission;