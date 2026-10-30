import { FileQuestion, Check, X } from 'lucide-react';

const TrainerRequests = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Training Requests</h1>
        <p className="text-[#57534E]">5 members want you as their trainer</p>
      </div>

      <div className="space-y-4">
        {[
          { name: 'Peter Parker', goal: 'Agility & Speed', date: 'Oct 15, 2026', msg: 'Hi, I need help building explosiveness and agility for sports.' },
          { name: 'Tony Stark', goal: 'Muscle Gain', date: 'Oct 14, 2026', msg: 'Looking to gain 10lbs of muscle in the next 3 months.' },
          { name: 'Steve Rogers', goal: 'Strength', date: 'Oct 12, 2026', msg: 'I want to focus on classic barbell strength training.' },
        ].map((req, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F3E8E8] border border-[#E7DADD] flex items-center justify-center shrink-0">
                <FileQuestion className="text-[#B76E79]" size={20} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">{req.name}</h3>
                  <span className="text-xs text-[#57534E]">{req.date}</span>
                </div>
                <p className="text-sm font-medium text-[#B76E79] mb-2">Goal: {req.goal}</p>
                <p className="text-sm text-[#57534E] italic">"{req.msg}"</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#B76E79] text-white font-bold font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#9F5965] transition-colors">
                <Check size={18} /> Accept
              </button>
              <button className="flex-1 md:flex-none px-6 py-2.5 bg-[#F3E8E8] hover:bg-[#F3E8E8]/20 hover:text-[#B76E79] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
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