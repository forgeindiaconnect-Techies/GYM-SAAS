import { MapPin, Clock } from 'lucide-react';

const TrainerOfflineSessions = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Offline Sessions</h1>
        <p className="text-[#9AAEAE]">In-person physical training and classes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: 'Personal Training - John', time: '02:00 PM', location: 'Weight Floor', type: '1-on-1' },
          { title: 'CrossFit Group', time: '04:00 PM', location: 'Studio A', type: 'Group Class' },
          { title: 'Personal Training - Mike', time: '06:00 PM', location: 'Cardio Zone', type: '1-on-1' },
          { title: 'Evening Stretch', time: '07:30 PM', location: 'Studio B', type: 'Group Class' },
        ].map((session, i) => (
          <div key={i} className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 flex flex-col justify-between shadow-lg">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.type === '1-on-1' ? 'bg-[#2DD4BF]/10 text-[#2DD4BF]' : 'bg-[#2DD4BF]/10 text-[#2DD4BF]'}`}>
                  {session.type}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">{session.title}</h3>
              <div className="space-y-2 text-sm text-[#9AAEAE]">
                <p className="flex items-center gap-2"><Clock size={16} className="text-[#2DD4BF]"/> {session.time}</p>
                <p className="flex items-center gap-2"><MapPin size={16} className="text-green-500"/> {session.location}</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2A3A3A] flex gap-3">
              <button className="flex-1 py-2 bg-[#2DD4BF]/10 hover:bg-[#2DD4BF]/20 text-[#2DD4BF] font-medium rounded-xl transition-colors">
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