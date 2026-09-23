import { CheckCircle } from 'lucide-react';

const SuperAdminActiveGyms = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8 border-b border-[#DCD9CD] pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CheckCircle className="text-[#8FA89B]" size={32} />
            Active Gyms
          </h1>
          <p className="text-[#4A514D] mt-2 font-mono text-sm">Organizations currently in good standing.</p>
        </div>
        <button className="px-6 py-2 bg-[#8FA89B]/10 text-[#8FA89B] border border-[#8FA89B]/30 rounded-xl font-bold hover:bg-[#8FA89B] hover:text-[#34483F] transition-colors">
          Manage
        </button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-5 border-t-4 border-t-green-500">
             <h3 className="font-bold text-lg mb-2">Metro Fitness ${i}</h3>
             <p className="text-[#4A514D] text-sm mb-4">Last active: 2 mins ago</p>
             <button className="w-full py-2 bg-[#E8E5DA] rounded-lg text-sm hover:bg-[#333]">View Dashboard</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminActiveGyms;