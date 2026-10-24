import { UserCheck, Star, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';

const MemberTrainer = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Trainer</h1>
        <p className="text-[#9AAEAE]">Your assigned personal trainer</p>
      </div>

      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#2DD4BF] to-teal-500 p-1 shrink-0">
          <div className="w-full h-full bg-[#0E1415] rounded-full flex items-center justify-center overflow-hidden">
            <UserCheck size={40} className="text-[#9AAEAE]" />
            {/* Image placeholder */}
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <h2 className="text-3xl font-bold">Alex Johnson</h2>
            <span className="px-3 py-1 bg-[#2DD4BF]/10 text-[#2DD4BF] text-xs font-bold rounded-full border border-[#2DD4BF]/20 inline-block w-max mx-auto md:mx-0">Elite Trainer</span>
          </div>
          <p className="text-[#9AAEAE] mb-4">Specializes in Strength Training, HIIT, and Nutrition Planning.</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm mb-6">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500" size={16} fill="currentColor" />
              <span className="font-bold text-[#F5FAFA]">4.9</span>
              <span className="text-[#9AAEAE]">(124 reviews)</span>
            </div>
            <div className="text-[#9AAEAE]"><span className="text-[#F5FAFA] font-bold">5+</span> Years Exp.</div>
            <div className="text-[#9AAEAE]"><span className="text-[#F5FAFA] font-bold">40+</span> Active Clients</div>
          </div>
          
          <div className="flex gap-3 justify-center md:justify-start">
            <button className="px-6 py-2.5 bg-[#2DD4BF] text-[#06201D] font-bold font-bold rounded-xl flex items-center gap-2 hover:bg-[#5EEAD4] transition-colors">
              <CalendarIcon size={18} /> Book Session
            </button>
            <button className="px-6 py-2.5 bg-[#1B2728] text-[#F5FAFA] font-bold rounded-xl flex items-center gap-2 hover:bg-[#333] transition-colors">
              <MessageSquare size={18} /> Message
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Upcoming Sessions</h3>
        <div className="p-4 border border-[#2A3A3A] bg-[#0E1415] rounded-xl flex justify-between items-center">
          <div>
            <h4 className="font-bold text-[#2DD4BF]">1-on-1 Strength Training</h4>
            <p className="text-sm text-[#9AAEAE] mt-1">Tomorrow, 05:00 PM - 06:00 PM</p>
          </div>
          <button className="px-4 py-2 border border-[#2A3A3A] hover:bg-[#1B2728] rounded-xl text-sm transition-colors">Reschedule</button>
        </div>
      </div>
    </div>
  );
};

export default MemberTrainer;