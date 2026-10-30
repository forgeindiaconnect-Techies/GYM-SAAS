import { MapPin, Clock } from 'lucide-react';

const TrainerOfflineSessions = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Offline Sessions</h1>
        <p className="text-[#57534E]">In-person physical training and classes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: 'Personal Training - John', time: '02:00 PM', location: 'Weight Floor', type: '1-on-1' },
          { title: 'CrossFit Group', time: '04:00 PM', location: 'Studio A', type: 'Group Class' },
          { title: 'Personal Training - Mike', time: '06:00 PM', location: 'Cardio Zone', type: '1-on-1' },
          { title: 'Evening Stretch', time: '07:30 PM', location: 'Studio B', type: 'Group Class' },
        ].map((session, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.type === '1-on-1' ? 'bg-[#B76E79]/10 text-[#B76E79]' : 'bg-[#B76E79]/10 text-[#B76E79]'}`}>
                  {session.type}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">{session.title}</h3>
              <div className="space-y-2 text-sm text-[#57534E]">
                <p className="flex items-center gap-2"><Clock size={16} className="text-[#B76E79]"/> {session.time}</p>
                <p className="flex items-center gap-2"><MapPin size={16} className="text-green-500"/> {session.location}</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E7DADD] flex gap-3">
              <button className="flex-1 py-2 bg-[#B76E79]/10 hover:bg-[#B76E79]/20 text-[#B76E79] font-medium rounded-xl transition-colors">
                Mark Attendance
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerOfflineSessions;