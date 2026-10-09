import { useState } from 'react';
import { Video, Search, Play, Globe, Dumbbell, Sparkles, Filter, CheckCircle2, Clock, X } from 'lucide-react';

interface ExerciseVideo {
  id: string;
  title: string;
  titleTamil?: string;
  language: 'Tamil' | 'English';
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps & Triceps' | 'Core & Cardio';
  youtubeId: string;
  duration: string;
  targetMuscle: string;
  equipment: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  descriptionTamil?: string;
  tips: string[];
}

const EXERCISE_VIDEOS: ExerciseVideo[] = [
  {
    id: 'v1',
    title: 'Bench Press Form & Technique Guide',
    titleTamil: 'பெஞ்ச் பிரஸ் பயிற்சி மற்றும் சரியான நுட்பங்கள்',
    language: 'Tamil',
    category: 'Chest',
    youtubeId: 'rT7DgCr-3pg',
    duration: '8:45',
    targetMuscle: 'Pectoralis Major, Anterior Deltoid, Triceps',
    equipment: 'Barbell & Bench',
    level: 'Intermediate',
    description: 'Learn step-by-step proper bench press execution in Tamil, including arching, leg drive, and bar path.',
    descriptionTamil: 'மார்பு தசை வளர்ச்சிக்கான சரியான பெஞ்ச் பிரஸ் பயிற்சி முறை மற்றும் காயங்கள் தவிர்க்கும் வழிகள்.',
    tips: [
      'Retract shoulder blades and pin them into the bench.',
      'Maintain a slight natural arch in your lower back.',
      'Lower bar with control to lower sternum.',
      'Drive feet into the ground during the upward press.'
    ]
  },
  {
    id: 'v2',
    title: 'Dumbbell Incline Press Upper Chest Tutorial',
    titleTamil: 'அப்பர் செஸ்ட் டம்பள் பிரஸ் உடற்பயிற்சி',
    language: 'English',
    category: 'Chest',
    youtubeId: '8iPEnn-ltC8',
    duration: '6:30',
    targetMuscle: 'Upper Pectoralis, Front Shoulders',
    equipment: 'Incline Bench & Dumbbells',
    level: 'Beginner',
    description: 'Target your clavicular head (upper chest) effectively using dumbbells with maximum range of motion.',
    descriptionTamil: 'மேல் மார்பு பகுதி தசையை மேம்படுத்தும் சிறந்த டம்பள் பிரஸ் பயிற்சி.',
    tips: [
      'Set bench to 30-45 degree incline angle.',
      'Keep wrists stacked directly over elbows.',
      'Pause for 1 second at full stretch at the bottom.',
      'Squeeze chest at the peak of movement without clacking dumbbells.'
    ]
  },
  {
    id: 'v3',
    title: 'Barbell Back Squat Technique & Depth',
    titleTamil: 'ஸ்காட்ஸ் சரியான முறை - தொடைகள் மற்றும் இடுப்பு பயிற்சி',
    language: 'Tamil',
    category: 'Legs',
    youtubeId: 'aclHkVaku9U',
    duration: '10:15',
    targetMuscle: 'Quadriceps, Glutes, Hamstrings, Core',
    equipment: 'Barbell & Squat Rack',
    level: 'Intermediate',
    description: 'Master the king of leg exercises with complete explanation in Tamil regarding stance width and breathing.',
    descriptionTamil: 'தொடை தசைகள் வலுவடைய சரியான முறையில் ஸ்காட்ஸ் செய்வது எவ்வாறு என்ற விரிவான வீடியோ.',
    tips: [
      'Stance slightly wider than shoulder width, feet turned out 15 degrees.',
      'Brace core tight with deep belly breath before descending.',
      'Break at hips and knees simultaneously.',
      'Keep knees inline with your second toe throughout.'
    ]
  },
  {
    id: 'v4',
    title: 'Conventional Deadlift Execution & Cue Guide',
    titleTamil: 'டெட்லிஃப்ட் உடற்பயிற்சி - முதுகெலும்பு பாதுகாப்பு முறைகள்',
    language: 'English',
    category: 'Back',
    youtubeId: 'op9kVnSso6Q',
    duration: '11:20',
    targetMuscle: 'Erector Spinae, Glutes, Hamstrings, Lats',
    equipment: 'Barbell & Bumper Plates',
    level: 'Advanced',
    description: 'Comprehensive guide covering setup, pulling wedge, leg drive, and avoiding lower back strain.',
    tips: [
      'Barbell over mid-foot before initiating setup.',
      'Pull slack out of the bar before pushing the floor away.',
      'Keep bar close to shins and thighs throughout lift.',
      'Lock out with hips, not overextending lower back.'
    ]
  },
  {
    id: 'v5',
    title: 'Lat Pulldown for V-Taper Back Muscle Growth',
    titleTamil: 'V-Shape முதுகு தசை பயிற்சி - லேட் புல்டவுன்',
    language: 'Tamil',
    category: 'Back',
    youtubeId: 'CAwf7n6Luuc',
    duration: '7:40',
    targetMuscle: 'Latissimus Dorsi, Rhomboids, Rear Deltoids',
    equipment: 'Cable Lat Pulldown Machine',
    level: 'Beginner',
    description: 'Learn how to engage lats properly without over-using biceps during Lat Pulldowns in Tamil.',
    descriptionTamil: 'முதுகு அகலமாகவும் V-Shape வடிவம் பெறவும் உதவும் லேட் புல்டவுன் சரியான பயிற்சி முறை.',
    tips: [
      'Grip slightly wider than shoulder width.',
      'Lean back 10-15 degrees and pull bar down to collarbone.',
      'Focus on driving elbows down into side pockets.',
      'Control the eccentric phase back to top.'
    ]
  },
  {
    id: 'v6',
    title: 'Overhead Shoulder Press & Military Press Form',
    titleTamil: 'தோள்பட்டை தசை வளர்ச்சி பயிற்சி தமிழ்',
    language: 'Tamil',
    category: 'Shoulders',
    youtubeId: 'qEwKCR5JCog',
    duration: '8:10',
    targetMuscle: 'Anterior & Lateral Deltoids, Triceps',
    equipment: 'Barbell or Dumbbells',
    level: 'Intermediate',
    description: 'Build 3D shoulders safely with proper elbow tucking and overhead lockout technique in Tamil.',
    descriptionTamil: 'தோள்பட்டை தசைகளை பெருக்க உதவும் ஓவர்ஹெட் பிரஸ் பயிற்சி முறைகள்.',
    tips: [
      'Glutes and abs braced tight to lock pelvis.',
      'Press straight up, clearing forehead, then locking overhead.',
      'Avoid excessive backward lean.',
      'Lower bar under control to chin height.'
    ]
  },
  {
    id: 'v7',
    title: 'Bicep Curl Variations & Peak Growth Breakdown',
    titleTamil: 'பைசெப்ஸ் தசை வளர்ச்சி பயிற்சிகள்',
    language: 'Tamil',
    category: 'Biceps & Triceps',
    youtubeId: 'ykJmrZ5v0Oo',
    duration: '7:15',
    targetMuscle: 'Biceps Brachii, Brachialis',
    equipment: 'Barbell / Dumbbells',
    level: 'Beginner',
    description: 'Understand short head vs long head bicep targeting for bigger arm peaks with Tamil guidance.',
    descriptionTamil: 'பெரிய பைசெப்ஸ் தசை பெற உதவும் சிறந்த உடற்பயிற்சி முறைகள்.',
    tips: [
      'Pin elbows to sides; avoid swinging torso.',
      'Supinate wrists (turn palms up) as you curl.',
      'Squeeze hard at top peak contraction.',
      '2-second negative stretch on the way down.'
    ]
  },
  {
    id: 'v8',
    title: 'Triceps Rope Pushdowns & Overhead Extension',
    titleTamil: 'ட்ரைசெப்ஸ் தசை இறுக்கம் மற்றும் வடிவம்',
    language: 'English',
    category: 'Biceps & Triceps',
    youtubeId: 'vB5OHsJ3EME',
    duration: '9:00',
    targetMuscle: 'Triceps Lateral, Long & Medial Heads',
    equipment: 'Cable Machine & Rope Attachment',
    level: 'Beginner',
    description: 'Maximal tricep isolation tutorial focusing on full extension and lockout without shoulder assistance.',
    tips: [
      'Stand upright with slight forward chest tilt.',
      'Spread rope attachment at bottom of movement.',
      'Keep elbows motionless at side of ribcage.',
      'Control return back to 90 degrees.'
    ]
  },
  {
    id: 'v9',
    title: '15-Minute Core Abs Workout & Fat Loss Routine',
    titleTamil: 'வயிற்று கொழுப்பு குறைக்க மற்றும் ஆப்ஸ் பெற 15 நிமிட பயிற்சி',
    language: 'Tamil',
    category: 'Core & Cardio',
    youtubeId: 'dJlFmxiL11s',
    duration: '15:00',
    targetMuscle: 'Rectus Abdominis, Obliques, Transverse Abdominis',
    equipment: 'Bodyweight / Yoga Mat',
    level: 'Beginner',
    description: 'High intensity core training routine with Tamil explanation for flattening belly and building abs.',
    descriptionTamil: 'வயிற்று பகுதியை கட்டுக்கோப்பாக வைக்க உதவும் தினசரி 15 நிமிட உடற்பயிற்சி வீடியோ.',
    tips: [
      'Perform 45 seconds of work followed by 15 seconds rest.',
      'Focus on contracting abs rather than flexing neck.',
      'Exhale sharply on crunch effort.',
      'Keep lower back pressed flat into mat during leg raises.'
    ]
  }
];

export const GymExerciseVideos = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'All' | 'Tamil' | 'English'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<ExerciseVideo | null>(null);

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps & Triceps', 'Core & Cardio'];

  const filteredVideos = EXERCISE_VIDEOS.filter(video => {
    const matchLang = selectedLanguage === 'All' || video.language === selectedLanguage;
    const matchCat = selectedCategory === 'All' || video.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || 
      video.title.toLowerCase().includes(searchLower) ||
      (video.titleTamil && video.titleTamil.toLowerCase().includes(searchLower)) ||
      video.targetMuscle.toLowerCase().includes(searchLower) ||
      video.equipment.toLowerCase().includes(searchLower);

    return matchLang && matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#292524] via-[#332e2b] to-[#1c1917] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#F97316]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/20 text-[#F97316] text-xs font-bold mb-3 border border-[#F97316]/30">
            <Sparkles size={14} /> Tamil & English Fitness Training Videos
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Gym Exercise Videos</h1>
          <p className="text-stone-300 text-sm md:text-base mt-2 leading-relaxed">
            Watch instructional gym workout videos with step-by-step technique tips in both <span className="text-[#F97316] font-bold">Tamil (தமிழ்)</span> and <span className="text-teal-400 font-bold">English</span>.
          </p>
        </div>
      </div>

      {/* Language Filter & Search Bar Header */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Language Selector Tabs */}
          <div className="flex items-center gap-2 bg-[#FFFDF8] p-1.5 rounded-xl border border-[#E7E5E4]">
            <Globe size={16} className="text-[#F97316] ml-2 shrink-0" />
            {(['All', 'Tamil', 'English'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedLanguage === lang
                    ? 'bg-[#F97316] text-white shadow-sm'
                    : 'text-[#78716C] hover:text-[#292524] hover:bg-stone-100'
                }`}
              >
                {lang === 'Tamil' ? 'Tamil (தமிழ்)' : lang}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" size={16} />
            <input
              type="text"
              placeholder="Search by workout, muscle, Tamil or English name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#292524] outline-none focus:border-[#F97316] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#292524]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-2 border-t border-[#E7E5E4]/60">
          <Filter size={14} className="text-[#78716C] shrink-0" />
          <span className="text-xs font-bold text-[#78716C] uppercase mr-1 shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#292524] text-white shadow-xs'
                  : 'bg-[#FFFDF8] border border-[#E7E5E4] text-[#78716C] hover:border-[#F97316]/40 hover:text-[#F97316]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#78716C]">
          <Video size={40} className="mx-auto text-amber-400 mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-[#292524]">No videos found</h3>
          <p className="text-xs mt-1">Try adjusting your language, category, or search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#F97316]/40 transition-all flex flex-col group"
            >
              {/* Thumbnail Container */}
              <div className="relative bg-stone-900 aspect-video overflow-hidden group cursor-pointer" onClick={() => setActiveVideo(video)}>
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#F97316] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={24} className="ml-1 fill-white" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock size={11} /> {video.duration}
                </div>

                {/* Language Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md border ${
                    video.language === 'Tamil'
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-blue-600 text-white border-blue-400'
                  }`}>
                    {video.language === 'Tamil' ? 'தமிழ் (Tamil)' : 'English'}
                  </span>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-[#78716C] border border-stone-200">
                      {video.category}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                      {video.level}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#292524] text-base leading-snug group-hover:text-[#F97316] transition-colors">
                    {video.title}
                  </h3>
                  {video.titleTamil && (
                    <p className="text-xs font-semibold text-[#F97316] mt-1 font-sans">
                      {video.titleTamil}
                    </p>
                  )}

                  <p className="text-xs text-[#78716C] mt-2 line-clamp-2 leading-relaxed">
                    {video.language === 'Tamil' && video.descriptionTamil ? video.descriptionTamil : video.description}
                  </p>
                </div>

                {/* Footer specs */}
                <div className="pt-3 border-t border-[#E7E5E4]/60 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#78716C]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Dumbbell size={13} className="text-[#F97316]" /> {video.equipment}
                    </span>
                    <span className="font-bold text-[#292524] truncate max-w-[120px]" title={video.targetMuscle}>
                      {video.targetMuscle.split(',')[0]}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveVideo(video)}
                    className="w-full mt-2 py-2 bg-[#FFFDF8] border border-[#E7E5E4] text-[#F97316] font-bold rounded-xl hover:bg-[#F97316] hover:text-white transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-2xs"
                  >
                    <Play size={14} className="fill-current" /> Watch Video Tutorial
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-[#FFFDF8]">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${activeVideo.language === 'Tamil' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                  {activeVideo.language === 'Tamil' ? 'தமிழ்' : 'English'}
                </span>
                <div>
                  <h2 className="font-bold text-[#292524] text-base md:text-lg leading-tight">
                    {activeVideo.title}
                  </h2>
                  {activeVideo.titleTamil && (
                    <p className="text-xs text-[#F97316] font-semibold">{activeVideo.titleTamil}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-[#78716C] hover:text-[#292524] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Iframe Container */}
            <div className="bg-black aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Modal Content / Form Tips */}
            <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-[#FFFDF8] rounded-xl border border-[#E7E5E4] text-xs">
                <div>
                  <span className="text-[#78716C] block font-medium">Category</span>
                  <span className="font-bold text-[#292524]">{activeVideo.category}</span>
                </div>
                <div>
                  <span className="text-[#78716C] block font-medium">Target Muscle</span>
                  <span className="font-bold text-[#292524]">{activeVideo.targetMuscle}</span>
                </div>
                <div>
                  <span className="text-[#78716C] block font-medium">Equipment</span>
                  <span className="font-bold text-[#292524]">{activeVideo.equipment}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#292524] text-sm mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-[#F97316]" /> Technique & Execution Tips
                </h4>
                <ul className="space-y-1.5 text-xs text-[#78716C]">
                  {activeVideo.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                      <span className="w-4 h-4 rounded-full bg-[#F97316]/10 text-[#F97316] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymExerciseVideos;
