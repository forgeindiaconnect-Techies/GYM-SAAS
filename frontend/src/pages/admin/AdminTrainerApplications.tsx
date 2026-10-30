import { UserPlus } from 'lucide-react';

const AdminTrainerApplications = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserPlus className="text-[#EA580C]" size={32} />
            Trainer Applications
          </h1>
          <p className="text-[#64748B] mt-2">Review incoming requests to join as a trainer.</p>
        </div>
        <button className="px-6 py-2 bg-[#C2410C] text-white font-bold rounded-xl font-bold hover:bg-[#9A3412] transition-colors">
          Manage Trainer Applications
        </button>
      </div>
      
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-[#F8FAFC] rounded-full"></div>
              <div>
                <h3 className="font-bold text-lg">Applicant Name {i}</h3>
                <p className="text-[#64748B] text-sm">Applied on Oct 14, 2026 • 5 Yrs Experience</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-[#F8FAFC]/50 text-[#9A3412] rounded-lg hover:bg-[#FFF7ED]/10">Reject</button>
              <button className="px-4 py-2 bg-[#C2410C] text-white font-bold rounded-lg hover:bg-[#9A3412]">Approve Trainer</button>
            </div>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminTrainerApplications;