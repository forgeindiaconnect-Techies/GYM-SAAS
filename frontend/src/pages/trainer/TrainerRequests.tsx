import { FileQuestion, Check, X } from 'lucide-react';

const TrainerRequests = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Training Requests</h1>
        <p className="text-[#455250]">5 members want you as their trainer</p>
      </div>

      <div className="space-y-4">
        {[
          { name: 'Peter Parker', goal: 'Agility & Speed', date: 'Oct 15, 2026', msg: 'Hi, I need help building explosiveness and agility for sports.' },
          { name: 'Tony Stark', goal: 'Muscle Gain', date: 'Oct 14, 2026', msg: 'Looking to gain 10lbs of muscle in the next 3 months.' },
          { name: 'Steve Rogers', goal: 'Strength', date: 'Oct 12, 2026', msg: 'I want to focus on classic barbell strength training.' },
        ].map((req, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#D3DFDA] flex items-center justify-center shrink-0">
                <FileQuestion className="text-[#164A4A]" size={20} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">{req.name}</h3>
                  <span className="text-xs text-[#455250]">{req.date}</span>
                </div>
                <p className="text-sm font-medium text-[#164A4A] mb-2">Goal: {req.goal}</p>
                <p className="text-sm text-[#455250] italic">"{req.msg}"</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#164A4A] text-[#202828] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#C6A77D] transition-colors">
                <Check size={18} /> Accept
              </button>
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#E8E5DA] hover:bg-[#6fa3a0]/20 hover:text-[#6fa3a0] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <X size={18} /> Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerRequests;