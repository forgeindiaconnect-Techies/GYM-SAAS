import { UserCheck, Star, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

const MemberTrainer = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Trainer</h1>
        <p className="text-[#4A514D]">Your assigned personal trainer</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#EF4444] to-green-500 p-1 shrink-0">
          <div className="w-full h-full bg-[#FFFFFF] rounded-full flex items-center justify-center overflow-hidden">
            <UserCheck size={40} className="text-[#4A514D]" />
            {/* Image placeholder */}
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <h2 className="text-3xl font-bold">Alex Johnson</h2>
            <span className="px-3 py-1 bg-[#34483F]/10 text-[#34483F] text-xs font-bold rounded-full border border-[#34483F]/20 inline-block w-max mx-auto md:mx-0">Elite Trainer</span>
          </div>
          <p className="text-[#4A514D] mb-4">Specializes in Strength Training, HIIT, and Nutrition Planning.</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm mb-6">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500" size={16} fill="currentColor" />
              <span className="font-bold text-[#202522]">4.9</span>
              <span className="text-[#4A514D]">(124 reviews)</span>
            </div>
            <div className="text-[#4A514D]"><span className="text-[#202522] font-bold">5+</span> Years Exp.</div>
            <div className="text-[#4A514D]"><span className="text-[#202522] font-bold">40+</span> Active Clients</div>
          </div>
          
          <div className="flex gap-3 justify-center md:justify-start">
            <button className="px-6 py-2.5 bg-[#34483F] text-[#202522] font-bold rounded-xl flex items-center gap-2 hover:bg-[#C6A77D] transition-colors">
              <CalendarIcon size={18} /> Book Session
            </button>
            <button className="px-6 py-2.5 bg-[#E8E5DA] text-[#202522] font-bold rounded-xl flex items-center gap-2 hover:bg-[#333] transition-colors">
              <MessageSquare size={18} /> Message
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Upcoming Sessions</h3>
        <div className="p-4 border border-[#DCD9CD] bg-[#FFFFFF] rounded-xl flex justify-between items-center">
          <div>
            <h4 className="font-bold text-[#34483F]">1-on-1 Strength Training</h4>
            <p className="text-sm text-[#4A514D] mt-1">Tomorrow, 05:00 PM - 06:00 PM</p>
          </div>
          <button className="px-4 py-2 border border-[#DCD9CD] hover:bg-[#E8E5DA] rounded-xl text-sm transition-colors">Reschedule</button>
        </div>
      </div>
    </div>
  );
};

export default MemberTrainer;