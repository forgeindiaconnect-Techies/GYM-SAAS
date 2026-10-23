import { Calendar } from 'lucide-react';

const AdminTrainingSessions = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="text-[#6366F1]" size={32} />
            Training Sessions
          </h1>
          <p className="text-[#A1A1AA] mt-2">Platform-wide schedule of upcoming PT and group sessions.</p>
        </div>
        <button className="px-6 py-2 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#4F46E5] transition-colors">
          Manage Training Sessions
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#6366F1]/10 rounded-xl flex flex-col items-center justify-center text-[#6366F1]">
                 <span className="text-xs font-bold uppercase">Oct</span>
                 <span className="text-lg font-bold leading-none">{15 + i}</span>
              </div>
              <div>
                <h3 className="font-bold">HIIT Masterclass</h3>
                <p className="text-sm text-[#A1A1AA]">Trainer: Alex W. • 12 Attendees</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#17172A] rounded-lg text-sm hover:bg-[#333]">View Roster</button>
          </div>
        ))}
      </div>
    
    </div>
  );
};

export default AdminTrainingSessions;