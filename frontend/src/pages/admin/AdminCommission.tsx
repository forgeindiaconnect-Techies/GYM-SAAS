import { PieChart } from 'lucide-react';

const AdminCommission = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PieChart className="text-[#6366F1]" size={32} />
            Commission Management
          </h1>
          <p className="text-[#A1A1AA] mt-2">Adjust global platform cuts for trainer sessions.</p>
        </div>
        <button className="px-6 py-2 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#4F46E5] transition-colors">
          Manage Commission Management
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-6 max-w-xl">
        <h3 className="font-bold text-xl mb-6">Global Split Config</h3>
        <div className="space-y-6">
          <div>
            <label className="text-sm text-[#A1A1AA] mb-2 block">Standard Trainer Split (%)</label>
            <input type="number" defaultValue="80" className="w-full bg-[#FFFFFF] border border-[#292940] rounded-xl px-4 py-3 text-[#11111F] text-lg outline-none focus:border-[#6366F1]" />
          </div>
          <div>
            <label className="text-sm text-[#A1A1AA] mb-2 block">Premium Trainer Split (%)</label>
            <input type="number" defaultValue="90" className="w-full bg-[#FFFFFF] border border-[#292940] rounded-xl px-4 py-3 text-[#11111F] text-lg outline-none focus:border-[#6366F1]" />
          </div>
          <div>
            <label className="text-sm text-[#A1A1AA] mb-2 block">Platform Fee Fixed ($)</label>
            <input type="number" defaultValue="1.50" className="w-full bg-[#FFFFFF] border border-[#292940] rounded-xl px-4 py-3 text-[#11111F] text-lg outline-none focus:border-[#6366F1]" />
          </div>
          <button className="w-full py-4 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#4F46E5]">Save Configuration</button>
        </div>
      </div>
    
    </div>
  );
};

export default AdminCommission;