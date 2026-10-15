import { useState, useEffect } from 'react';
import { 
  Video, Search, Play, Globe, Dumbbell, Sparkles, Filter, 
  CheckCircle2, Clock, X, Plus, Trash2, Check, AlertCircle, 
  ExternalLink, Layers, Flame, Info
} from 'lucide-react';

export interface ExerciseVideo {
  id: string;
  title: string;
  titleTamil?: string;
  language: 'Tamil' | 'English';
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps & Triceps' | 'Core & Cardio';
  youtubeId: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration: string;
  targetMuscle: string;
  equipment: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  descriptionTamil?: string;
  tips: string[];
  isCustom?: boolean;
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

const LOCAL_STORAGE_KEY = 'gym_manual_exercise_videos';

// Helper to extract YouTube video ID from multiple URL formats
const extractYouTubeId = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  return '';
};

export const GymExerciseVideos = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'All' | 'Tamil' | 'English'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState<ExerciseVideo | null>(null);

  // Manual Videos State loaded from localStorage
  const [customVideos, setCustomVideos] = useState<ExerciseVideo[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal State for "Add Exercise Manually"
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formNameTamil, setFormNameTamil] = useState('');
  const [formLanguage, setFormLanguage] = useState<'Tamil' | 'English'>('Tamil');
  const [formCategory, setFormCategory] = useState<'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Biceps & Triceps' | 'Core & Cardio'>('Chest');
  const [formLevel, setFormLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [formDuration, setFormDuration] = useState('8:00');
  const [formVideoLink, setFormVideoLink] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formTargetMuscle, setFormTargetMuscle] = useState('');
  const [formEquipment, setFormEquipment] = useState('Barbell & Dumbbells');
  const [formDescription, setFormDescription] = useState('');
  const [formDescriptionTamil, setFormDescriptionTamil] = useState('');
  const [formTips, setFormTips] = useState<string[]>([
    'Maintain proper spinal alignment throughout the range of motion.',
    'Breathe in on eccentric lowering and exhale during the press/pull.'
  ]);
  const [newTipInput, setNewTipInput] = useState('');
  const [formError, setFormError] = useState('');

  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps & Triceps', 'Core & Cardio'];

  // Combine custom videos with static defaults
  const allVideos: ExerciseVideo[] = [...customVideos, ...EXERCISE_VIDEOS];

  const filteredVideos = allVideos.filter(video => {
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

  const handleAddTip = () => {
    if (newTipInput.trim()) {
      setFormTips(prev => [...prev, newTipInput.trim()]);
      setNewTipInput('');
    }
  };

  const handleRemoveTip = (indexToRemove: number) => {
    setFormTips(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleOpenModal = () => {
    setFormName('');
    setFormNameTamil('');
    setFormLanguage(selectedLanguage === 'Tamil' ? 'Tamil' : 'English');
    setFormCategory(selectedCategory !== 'All' ? (selectedCategory as any) : 'Chest');
    setFormLevel('Beginner');
    setFormDuration('8:30');
    setFormVideoLink('');
    setFormThumbnail('');
    setFormTargetMuscle('');
    setFormEquipment('Barbell / Dumbbells');
    setFormDescription('');
    setFormDescriptionTamil('');
    setFormTips([
      'Maintain proper spinal alignment throughout the movement.',
      'Control the descent and squeeze the target muscle at peak contraction.'
    ]);
    setFormError('');
    setShowAddModal(true);
  };

  const handleSubmitExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter the Exercise Name.');
      return;
    }
    if (!formVideoLink.trim()) {
      setFormError('Please enter a Video Link (YouTube link, embed, or video URL).');
      return;
    }

    const detectedYtId = extractYouTubeId(formVideoLink);
    const finalThumbnail = formThumbnail.trim() 
      ? formThumbnail.trim()
      : (detectedYtId ? `https://img.youtube.com/vi/${detectedYtId}/hqdefault.jpg` : '');

    const newExercise: ExerciseVideo = {
      id: `custom_${Date.now()}`,
      title: formName.trim(),
      titleTamil: formNameTamil.trim() || undefined,
      language: formLanguage,
      category: formCategory,
      youtubeId: detectedYtId,
      videoUrl: formVideoLink.trim(),
      thumbnailUrl: finalThumbnail,
      duration: formDuration.trim() || '8:00',
      targetMuscle: formTargetMuscle.trim() || `${formCategory} Muscles`,
      equipment: formEquipment.trim() || 'Gym Equipment',
      level: formLevel,
      description: formDescription.trim() || `Step-by-step training tutorial for ${formName.trim()}.`,
      descriptionTamil: formDescriptionTamil.trim() || undefined,
      tips: formTips.length > 0 ? formTips : ['Focus on proper posture and controlled breathing.'],
      isCustom: true
    };

    const updated = [newExercise, ...customVideos];
    setCustomVideos(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }

    setAddSuccessMsg(true);
    setTimeout(() => {
      setAddSuccessMsg(false);
      setShowAddModal(false);
    }, 900);
  };

  const handleDeleteCustomExercise = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this manually added exercise?')) {
      const updated = customVideos.filter(v => v.id !== id);
      setCustomVideos(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      if (activeVideo?.id === id) {
        setActiveVideo(null);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#292524] via-[#332e2b] to-[#1c1917] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#F97316]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/20 text-[#F97316] text-xs font-bold mb-3 border border-[#F97316]/30">
              <Sparkles size={14} /> Tamil & English Fitness Training Videos
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Gym Exercise Videos</h1>
            <p className="text-stone-300 text-sm md:text-base mt-2 leading-relaxed">
              Watch instructional gym workout videos with step-by-step technique tips in both <span className="text-[#F97316] font-bold">Tamil (தமிழ்)</span> and <span className="text-teal-400 font-bold">English</span>.
            </p>
          </div>

          {/* Action Button: Add Exercise Manually */}
          <div className="shrink-0 flex items-center">
            <button
              onClick={handleOpenModal}
              className="px-5 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={18} className="stroke-[2.5]" />
              <span>Add Exercise Manually</span>
            </button>
          </div>
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

          {/* Search Box & Quick Add Button */}
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="relative flex-1">
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

            <button
              onClick={handleOpenModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FFFDF8] border border-[#F97316]/50 text-[#F97316] hover:bg-[#F97316] hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              title="Add exercise manually"
            >
              <Plus size={15} />
              <span>Add Exercise</span>
            </button>
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
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#78716C] space-y-3">
          <Video size={44} className="mx-auto text-amber-500/70" />
          <h3 className="text-lg font-bold text-[#292524]">No videos found</h3>
          <p className="text-xs max-w-sm mx-auto">Try adjusting your language, category, or search filters, or click the button below to add your own exercise manually.</p>
          <button
            onClick={handleOpenModal}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#EA580C] transition-colors"
          >
            <Plus size={15} /> Add Custom Exercise
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const hasYt = !!video.youtubeId;
            const thumbUrl = video.thumbnailUrl 
              ? video.thumbnailUrl 
              : (hasYt ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80');

            return (
              <div
                key={video.id}
                className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#F97316]/40 transition-all flex flex-col group relative"
              >
                {/* Thumbnail Container */}
                <div className="relative bg-stone-900 aspect-video overflow-hidden group cursor-pointer" onClick={() => setActiveVideo(video)}>
                  <img
                    src={thumbUrl}
                    alt={video.title}
                    onError={(e) => {
                      // Fallback image if custom thumbnail fails to load
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80';
                    }}
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

                  {/* Language & Custom Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md border ${
                      video.language === 'Tamil'
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-blue-600 text-white border-blue-400'
                    }`}>
                      {video.language === 'Tamil' ? 'தமிழ் (Tamil)' : 'English'}
                    </span>
                    {video.isCustom && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F97316] text-white shadow-xs border border-orange-300">
                        Manual
                      </span>
                    )}
                  </div>

                  {/* Delete button for custom exercises */}
                  {video.isCustom && (
                    <button
                      onClick={(e) => handleDeleteCustomExercise(video.id, e)}
                      title="Delete custom exercise"
                      className="absolute top-2.5 right-2.5 w-7 h-7 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
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
                      <span className="flex items-center gap-1.5 font-medium truncate max-w-[140px]" title={video.equipment}>
                        <Dumbbell size={13} className="text-[#F97316] shrink-0" /> {video.equipment}
                      </span>
                      <span className="font-bold text-[#292524] truncate max-w-[130px]" title={video.targetMuscle}>
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
            );
          })}
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

            {/* Video Player Container */}
            <div className="bg-black aspect-video w-full flex items-center justify-center">
              {activeVideo.youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : activeVideo.videoUrl && (activeVideo.videoUrl.endsWith('.mp4') || activeVideo.videoUrl.endsWith('.webm')) ? (
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : activeVideo.videoUrl ? (
                <iframe
                  src={activeVideo.videoUrl}
                  title={activeVideo.title}
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="text-white text-center p-8">
                  <Play size={40} className="mx-auto mb-2 text-[#F97316]" />
                  <p className="text-sm font-semibold">Video preview not available</p>
                </div>
              )}
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

      {/* "Add Exercise Manually" Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 my-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E5E4] bg-gradient-to-r from-stone-900 to-stone-800 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F97316] flex items-center justify-center text-white shadow-md">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">Add Exercise Manually</h3>
                  <p className="text-stone-300 text-xs">Add a custom workout video with technique tips</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitExercise} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {addSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Exercise video added successfully!</span>
                </div>
              )}

              {/* Row 1: Exercise Name */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1">
                  Exercise Name <span className="text-[#F97316]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incline Dumbbell Fly"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-xs text-[#292524] outline-none focus:border-[#F97316]"
                />
              </div>

              {/* Row 2: Category, Language, Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Category <span className="text-[#F97316]">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3 py-2.5 text-xs text-[#292524] outline-none focus:border-[#F97316]"
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Legs">Legs</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Biceps & Triceps">Biceps & Triceps</option>
                    <option value="Core & Cardio">Core & Cardio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Language <span className="text-[#F97316]">*</span>
                  </label>
                  <select
                    value={formLanguage}
                    onChange={(e) => setFormLanguage(e.target.value as any)}
                    className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3 py-2.5 text-xs text-[#292524] outline-none focus:border-[#F97316]"
                  >
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as any)}
                    className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3 py-2.5 text-xs text-[#292524] outline-none focus:border-[#F97316]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Duration & Video Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Duration <span className="text-[#F97316]">*</span>
                  </label>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8:30"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#292524] outline-none focus:border-[#F97316]"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Video Link / YouTube URL <span className="text-[#F97316]">*</span>
                  </label>
                  <div className="relative">
                    <Video size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. https://www.youtube.com/watch?v=... or ID"
                      value={formVideoLink}
                      onChange={(e) => setFormVideoLink(e.target.value)}
                      className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#292524] outline-none focus:border-[#F97316]"
                    />
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-1">Supports full YouTube link, share link (youtu.be), embed link, or MP4 URL.</p>
                </div>
              </div>

              {/* Row 4: Target Muscle & Equipment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Target Muscle(s)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pectoralis Major, Front Deltoids"
                    value={formTargetMuscle}
                    onChange={(e) => setFormTargetMuscle(e.target.value)}
                    className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-xs text-[#292524] outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#292524] mb-1">
                    Equipment Required
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dumbbells & Incline Bench"
                    value={formEquipment}
                    onChange={(e) => setFormEquipment(e.target.value)}
                    className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-xs text-[#292524] outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              {/* Row 5: Description */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief overview of the exercise and proper execution form..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl p-3 text-xs text-[#292524] outline-none focus:border-[#F97316] resize-none"
                />
              </div>

              {/* Row 7: Technique Tips */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5 flex items-center justify-between">
                  <span>Step-by-Step Technique Tips</span>
                  <span className="text-[11px] text-[#78716C] font-normal">{formTips.length} tips added</span>
                </label>

                <div className="space-y-1.5 mb-2">
                  {formTips.map((tip, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-lg text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#F97316]/20 text-[#F97316] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-[#292524]">{tip}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTip(idx)}
                        className="text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a technique tip (e.g. Keep chest high, elbows at 45 degrees)..."
                    value={newTipInput}
                    onChange={(e) => setNewTipInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTip();
                      }
                    }}
                    className="flex-1 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3 py-2 text-xs text-[#292524] outline-none focus:border-[#F97316]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTip}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-[#F97316] hover:text-white text-[#292524] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    + Add Tip
                  </button>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-[#E7E5E4] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} /> Save & Add Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymExerciseVideos;
