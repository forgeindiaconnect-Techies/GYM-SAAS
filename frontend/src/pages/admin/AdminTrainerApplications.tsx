import { UserPlus } from 'lucide-react';

const AdminTrainerApplications = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserPlus className="text-[#167D78]" size={32} />
            Trainer Applications
          </h1>
          <p className="text-[#697778] mt-2">Review incoming requests to join as a trainer.</p>
        </div>
        <button className="px-6 py-2 bg-[#167D78] text-white rounded-xl font-bold hover:bg-[#116660] transition-colors">
          Manage Trainer Applications
        </button>
      </div>
      
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D9E2E3] rounded-2xl p-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-[#D8EAE7] rounded-full"></div>
              <div>
                <h3 className="font-bold text-lg">Applicant Name {i}</h3>
                <p className="text-[#697778] text-sm">Applied on Oct 14, 2026 • 5 Yrs Experience</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-[#D8EAE7]/50 text-[#116660] rounded-lg hover:bg-[#D8EAE7]/10">Reject</button>
              <button className="px-4 py-2 bg-[#167D78] text-white rounded-lg hover:bg-[#116660]">Approve Trainer</button>
            </div>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminTrainerApplications;