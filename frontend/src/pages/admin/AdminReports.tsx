import { BarChart } from 'lucide-react';

const AdminReports = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart className="text-[#164A4A]" size={32} />
            Reports & Analytics
          </h1>
          <p className="text-[#455250] mt-2">Generate custom CSV exports for accounting and BI.</p>
        </div>
        <button className="px-6 py-2 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
          Manage Reports & Analytics
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-3 gap-6">
        {['Financial End-of-Month', 'User Growth & Retention', 'Trainer Payout Ledger', 'AI Token Usage', 'Gym Check-ins Report'].map((report, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-[#E8E5DA] rounded-lg mb-4 flex items-center justify-center text-[#455250]">
                <BarChart size={20} />
              </div>
              <h3 className="font-bold mb-2">{report}</h3>
              <p className="text-sm text-[#455250] mb-6">Standard CSV export for BI tools.</p>
            </div>
            <button className="w-full py-2 bg-[#E8E5DA] hover:bg-[#333] rounded-lg text-sm">Generate .CSV</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminReports;