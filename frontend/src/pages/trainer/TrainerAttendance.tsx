import { CalendarCheck, CheckCircle, XCircle } from 'lucide-react';

const TrainerAttendance = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-[#4A514D]">Track client participation for your sessions</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#DCD9CD] flex justify-between items-center bg-[#FFFFFF]">
          <div>
            <h2 className="text-lg font-bold">CrossFit Group Class</h2>
            <p className="text-sm text-[#4A514D]">Today, 04:00 PM</p>
          </div>
          <button className="px-4 py-2 bg-[#34483F] text-[#202522] font-bold rounded-lg text-sm">Save Roster</button>
        </div>
        
        <div className="divide-y divide-[#DCD9CD]">
          {[
            { name: 'Sarah Connor', status: 'present' },
            { name: 'John Doe', status: 'absent' },
            { name: 'Mike Tyson', status: 'present' },
            { name: 'Jane Smith', status: 'pending' },
          ].map((client, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-[#FFFFFF]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E8E5DA] rounded-full flex items-center justify-center font-bold text-sm">
                  {client.name[0]}
                </div>
                <h4 className="font-medium">{client.name}</h4>
              </div>
              
              <div className="flex gap-2">
                <button className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-colors ${client.status === 'present' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'hover:bg-[#E8E5DA]'}`}>
                  <CheckCircle size={16} /> Present
                </button>
                <button className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-colors ${client.status === 'absent' ? 'bg-[#8FA89B]/20 text-[#8FA89B] border border-[#8FA89B]/30' : 'hover:bg-[#E8E5DA]'}`}>
                  <XCircle size={16} /> Absent
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainerAttendance;