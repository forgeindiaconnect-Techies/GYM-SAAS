import { Calendar } from 'lucide-react';

const AdminTrainingSessions = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="text-[#34483F]" size={32} />
            Training Sessions
          </h1>
          <p className="text-[#4A514D] mt-2">Platform-wide schedule of upcoming PT and group sessions.</p>
        </div>
        <button className="px-6 py-2 bg-[#34483F] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
          Manage Training Sessions
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#34483F]/10 rounded-xl flex flex-col items-center justify-center text-[#34483F]">
                 <span className="text-xs font-bold uppercase">Oct</span>
                 <span className="text-lg font-bold leading-none">{15 + i}</span>
              </div>
              <div>
                <h3 className="font-bold">HIIT Masterclass</h3>
                <p className="text-sm text-[#4A514D]">Trainer: Alex W. • 12 Attendees</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#E8E5DA] rounded-lg text-sm hover:bg-[#333]">View Roster</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminTrainingSessions;