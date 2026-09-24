import { MapPin, Users, Clock } from 'lucide-react';

const TrainerOfflineSessions = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Offline Sessions</h1>
        <p className="text-[#455250]">In-person physical training and classes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: 'Personal Training - John', time: '02:00 PM', location: 'Weight Floor', type: '1-on-1' },
          { title: 'CrossFit Group', time: '04:00 PM', location: 'Studio A', type: 'Group Class' },
          { title: 'Personal Training - Mike', time: '06:00 PM', location: 'Cardio Zone', type: '1-on-1' },
          { title: 'Evening Stretch', time: '07:30 PM', location: 'Studio B', type: 'Group Class' },
        ].map((session, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.type === '1-on-1' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                  {session.type}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">{session.title}</h3>
              <div className="space-y-2 text-sm text-[#455250]">
                <p className="flex items-center gap-2"><Clock size={16} className="text-[#164A4A]"/> {session.time}</p>
                <p className="flex items-center gap-2"><MapPin size={16} className="text-green-500"/> {session.location}</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[#D3DFDA] flex gap-3">
              <button className="flex-1 py-2 bg-[#164A4A]/10 hover:bg-[#164A4A]/20 text-[#164A4A] font-medium rounded-xl transition-colors">
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