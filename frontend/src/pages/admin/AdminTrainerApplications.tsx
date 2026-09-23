import { UserPlus } from 'lucide-react';

const AdminTrainerApplications = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <UserPlus className="text-[#34483F]" size={32} />
            Trainer Applications
          </h1>
          <p className="text-[#4A514D] mt-2">Review incoming requests to join as a trainer.</p>
        </div>
        <button className="px-6 py-2 bg-[#34483F] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
          Manage Trainer Applications
        </button>
      </div>
      
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-[#E8E5DA] rounded-full"></div>
              <div>
                <h3 className="font-bold text-lg">Applicant Name {i}</h3>
                <p className="text-[#4A514D] text-sm">Applied on Oct 14, 2026 • 5 Yrs Experience</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-[#8FA89B]/50 text-[#8FA89B] rounded-lg hover:bg-[#8FA89B]/10">Reject</button>
              <button className="px-4 py-2 bg-[#34483F] text-white rounded-lg hover:bg-[#C6A77D]">Approve Trainer</button>
            </div>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminTrainerApplications;