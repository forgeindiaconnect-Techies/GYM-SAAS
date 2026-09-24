import { CalendarCheck } from 'lucide-react';

const AdminAttendance = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarCheck className="text-[#164A4A]" size={32} />
            Attendance Logs
          </h1>
          <p className="text-[#455250] mt-2">Global check-in and session attendance records.</p>
        </div>
        <button className="px-6 py-2 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
          Manage Attendance Logs
        </button>
      </div>
      
      
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-4">Today's Check-ins</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center p-3 border border-[#D3DFDA] rounded-xl bg-[#FFFFFF]">
              <div className="flex gap-3 items-center">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="font-medium">User #{8429 + i}</span>
              </div>
              <span className="text-sm text-[#455250]">Checked in at {8 + i}:15 AM</span>
            </div>
          ))}
        </div>
      </div>
    
    </div>
  );
};

export default AdminAttendance;