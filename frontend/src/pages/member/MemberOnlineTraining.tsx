import { Video, PlayCircle } from 'lucide-react';

const MemberOnlineTraining = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Online Training</h1>
        <p className="text-[#455250]">Access live streams and recorded sessions</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl overflow-hidden relative group cursor-pointer">
        <div className="aspect-video w-full bg-[#FFFFFF] relative flex items-center justify-center border-b border-[#D3DFDA]">
          {/* Mock Video Thumbnail */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
          <div className="w-16 h-16 bg-[#164A4A] rounded-full flex items-center justify-center z-20 group-hover:scale-110 transition-transform">
            <PlayCircle size={32} className="text-black ml-1" fill="currentColor" />
          </div>
          <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-[#6fa3a0] text-white text-xs font-bold rounded flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> LIVE
          </span>
        </div>
        <div className="p-6 relative z-20">
          <h2 className="text-2xl font-bold mb-2">High Intensity Interval Training (HIIT) - Live Class</h2>
          <p className="text-[#455250] mb-4">Join Coach Sarah for a 45-minute intense full body workout. No equipment needed.</p>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-[#164A4A]">342 watching now</span>
            <span className="text-[#455250]">Started 10 mins ago</span>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mt-8 mb-4">Library</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'Core Crusher 101', dur: '30m', cat: 'Abs' },
          { title: 'Yoga for Beginners', dur: '45m', cat: 'Yoga' },
          { title: 'Dumbbell Only Full Body', dur: '60m', cat: 'Strength' },
        ].map((vid, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl overflow-hidden group cursor-pointer">
            <div className="aspect-video bg-[#E8E5DA] relative flex items-center justify-center">
              <Video size={32} className="text-[#555] group-hover:text-[#164A4A] transition transition-colors" />
              <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-[#202828] text-xs rounded">{vid.dur}</span>
            </div>
            <div className="p-4">
              <span className="text-xs text-[#164A4A] mb-1 block">{vid.cat}</span>
              <h4 className="font-bold line-clamp-1">{vid.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberOnlineTraining;