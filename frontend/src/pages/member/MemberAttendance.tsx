import { CalendarCheck } from 'lucide-react';

const MemberAttendance = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-[#4A514D]">Track your gym visits</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 text-center">
          <p className="text-[#4A514D] text-sm mb-1">Total Visits</p>
          <p className="text-3xl font-bold text-[#202522]">42</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 text-center">
          <p className="text-[#4A514D] text-sm mb-1">This Month</p>
          <p className="text-3xl font-bold text-[#34483F]">12</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 text-center">
          <p className="text-[#4A514D] text-sm mb-1">Current Streak</p>
          <p className="text-3xl font-bold text-orange-500">4 days <span className="text-lg">🔥</span></p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[40vh]">
        <div className="w-16 h-16 bg-[#34483F]/10 rounded-full flex items-center justify-center mb-4">
          <CalendarCheck size={32} className="text-[#34483F]" />
        </div>
        <h2 className="text-xl font-bold mb-2">Calendar View</h2>
        <p className="text-[#4A514D] max-w-sm">
          A detailed calendar view of your attendance history will be displayed here in a future update. Keep up the good work!
        </p>
      </div>
    </div>
  );
};

export default MemberAttendance;