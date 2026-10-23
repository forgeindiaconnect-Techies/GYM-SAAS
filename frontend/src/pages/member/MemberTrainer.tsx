import { UserCheck, Star, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

const MemberTrainer = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Trainer</h1>
        <p className="text-[#A1A1AA]">Your assigned personal trainer</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#C43D35] to-green-500 p-1 shrink-0">
          <div className="w-full h-full bg-[#FFFFFF] rounded-full flex items-center justify-center overflow-hidden">
            <UserCheck size={40} className="text-[#A1A1AA]" />
            {/* Image placeholder */}
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <h2 className="text-3xl font-bold">Alex Johnson</h2>
            <span className="px-3 py-1 bg-[#6366F1]/10 text-[#6366F1] text-xs font-bold rounded-full border border-[#6366F1]/20 inline-block w-max mx-auto md:mx-0">Elite Trainer</span>
          </div>
          <p className="text-[#A1A1AA] mb-4">Specializes in Strength Training, HIIT, and Nutrition Planning.</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm mb-6">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500" size={16} fill="currentColor" />
              <span className="font-bold text-[#11111F]">4.9</span>
              <span className="text-[#A1A1AA]">(124 reviews)</span>
            </div>
            <div className="text-[#A1A1AA]"><span className="text-[#11111F] font-bold">5+</span> Years Exp.</div>
            <div className="text-[#A1A1AA]"><span className="text-[#11111F] font-bold">40+</span> Active Clients</div>
          </div>
          
          <div className="flex gap-3 justify-center md:justify-start">
            <button className="px-6 py-2.5 bg-[#6366F1] text-white font-bold rounded-xl flex items-center gap-2 hover:bg-[#4F46E5] transition-colors">
              <CalendarIcon size={18} /> Book Session
            </button>
            <button className="px-6 py-2.5 bg-[#17172A] text-[#11111F] font-bold rounded-xl flex items-center gap-2 hover:bg-[#333] transition-colors">
              <MessageSquare size={18} /> Message
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Upcoming Sessions</h3>
        <div className="p-4 border border-[#292940] bg-[#FFFFFF] rounded-xl flex justify-between items-center">
          <div>
            <h4 className="font-bold text-[#6366F1]">1-on-1 Strength Training</h4>
            <p className="text-sm text-[#A1A1AA] mt-1">Tomorrow, 05:00 PM - 06:00 PM</p>
          </div>
          <button className="px-4 py-2 border border-[#292940] hover:bg-[#17172A] rounded-xl text-sm transition-colors">Reschedule</button>
        </div>
      </div>
    </div>
  );
};

export default MemberTrainer;