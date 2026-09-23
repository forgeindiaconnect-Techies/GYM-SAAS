import { UserCheck, Clock, Users, UserX } from 'lucide-react';

const mockCheckins = [
  { id: 1, name: 'John Doe', time: '10:45 AM', type: 'Member', method: 'RFID Card' },
  { id: 2, name: 'Emily Davis', time: '10:32 AM', type: 'Member', method: 'Mobile App' },
  { id: 3, name: 'Arnold S.', time: '10:15 AM', type: 'Staff', method: 'Biometric' },
  { id: 4, name: 'Guest (Jane S.)', time: '09:50 AM', type: 'Guest', method: 'Manual Entry' },
  { id: 5, name: 'Mike Johnson', time: '09:30 AM', type: 'Member', method: 'RFID Card' },
  { id: 6, name: 'Sarah C.', time: '09:15 AM', type: 'Staff', method: 'Biometric' },
];

const GymAdminAttendance = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Facility Attendance</h1>
          <p className="text-[#4A514D] mt-1">Live check-ins, peak hours, and member activity.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm font-bold bg-[#FFFFFF] border border-[#DCD9CD] px-4 py-2 rounded-xl text-[#202522]">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Live Tracking Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <p className="text-[#4A514D] text-sm font-medium">Currently in Gym</p>
          <h3 className="text-3xl font-bold text-[#202522] mt-1">42</h3>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center">
              <UserCheck size={20} />
            </div>
          </div>
          <p className="text-[#4A514D] text-sm font-medium">Total Check-ins Today</p>
          <h3 className="text-3xl font-bold text-[#202522] mt-1">156</h3>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#34483F]/10 text-[#34483F] rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-[#4A514D] text-sm font-medium">Peak Hour Today</p>
          <h3 className="text-3xl font-bold text-[#202522] mt-1">18:00</h3>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-[#8FA89B]/10 text-[#8FA89B] rounded-xl flex items-center justify-center">
              <UserX size={20} />
            </div>
          </div>
          <p className="text-[#4A514D] text-sm font-medium">Failed Entries</p>
          <h3 className="text-3xl font-bold text-[#202522] mt-1">3</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#202522] mb-6">Today's Traffic</h3>
          <div className="h-48 flex items-end justify-between gap-1 pt-4 border-t border-[#DCD9CD]">
            {[20, 15, 10, 5, 10, 30, 45, 60, 80, 50, 40, 70, 90, 85, 60, 40].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                <div
                  className="w-full rounded-t-lg transition-all duration-200 group-hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${val}%`,
                    background: `linear-gradient(to top, #C6A77D, #22C55E)`,
                  }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#202522] text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                    {val}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#4A514D]">
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>22:00</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-[#202522] mb-4 border-b border-[#DCD9CD] pb-2">Recent Check-ins</h3>
          <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            {mockCheckins.map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-[#FFFFFF] rounded-xl border border-[#DCD9CD]">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${log.type === 'Staff' ? 'bg-blue-500/20 text-blue-500' : log.type === 'Guest' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-[#E8E5DA] text-[#202522]'}`}>
                    {log.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#202522]">{log.name}</p>
                    <p className="text-xs text-[#4A514D]">{log.type} • {log.method}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#34483F]">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminAttendance;
