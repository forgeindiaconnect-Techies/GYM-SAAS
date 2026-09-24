import { Video, Users, Play, Link as LinkIcon } from 'lucide-react';

const TrainerOnlineSessions = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Online Sessions</h1>
          <p className="text-[#455250]">Manage live streaming and virtual 1-on-1s</p>
        </div>
        <button className="px-4 py-2 bg-[#164A4A] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#C6A77D]">
          <Video size={18} fill="currentColor" /> Go Live
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#164A4A]/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#164A4A]/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-[#6fa3a0] rounded-full animate-pulse"></span>
            <span className="text-[#6fa3a0] font-bold text-sm uppercase">Starting Soon</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Virtual HIIT Masterclass</h2>
          <p className="text-[#455250] mb-4">Scheduled for Today at 5:00 PM</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm bg-[#FFFFFF] px-3 py-1.5 rounded-lg border border-[#D3DFDA]">
              <Users size={16} className="text-[#164A4A]" /> 24 Registered
            </span>
            <button className="flex items-center gap-2 text-sm hover:text-[#164A4A] transition transition-colors">
              <LinkIcon size={16} /> Copy Invite Link
            </button>
          </div>
        </div>
        <div className="relative z-10 shrink-0 w-full md:w-auto text-center">
          <p className="text-3xl font-mono font-bold mb-2 text-[#202828]">00:45:12</p>
          <p className="text-xs text-[#455250] mb-4">Until stream opens</p>
          <button className="w-full md:w-auto px-8 py-3 bg-[#E8E5DA] text-white rounded-xl font-bold hover:bg-[#333] transition-colors">
             Enter Studio
          </button>
        </div>
      </div>
      
      <h3 className="text-xl font-bold pt-4">Past Sessions</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl overflow-hidden">
             <div className="aspect-video bg-[#FFFFFF] relative flex items-center justify-center border-b border-[#D3DFDA]">
               <Play size={32} className="text-[#555]" />
               <span className="absolute bottom-2 right-2 text-xs bg-black/80 px-2 py-1 rounded">45:00</span>
             </div>
             <div className="p-4">
               <h4 className="font-bold mb-1">Morning Yoga Flow</h4>
               <p className="text-xs text-[#455250]">Oct 10, 2026 • 15 Attendees</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerOnlineSessions;