import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, LayoutDashboard, Users, UserPlus, BrainCircuit, Activity,
  Play, Pause, X, ChevronRight, SkipForward, ArrowRight
} from 'lucide-react';

const steps = [
  {
    icon: Building2,
    title: 'Register Your Gym',
    desc: 'Provide basic owner and gym information and create your account securely.',
    details: ['Gym Name', 'Owner Full Name', 'Email Address', 'Phone Number', 'Secure Password']
  },
  {
    icon: MapPin,
    title: 'Add Your Gym Details',
    desc: 'Provide comprehensive gym information such as equipment, facilities, location, and AC details.',
    details: ['Gym Address & Location', 'Available Facilities', 'Equipment Inventory', 'AC / Non-AC Status', 'Operating Hours']
  },
  {
    icon: LayoutDashboard,
    title: 'Get Your Gym Dashboard',
    desc: 'After super admin approval, gain access to your dedicated and powerful Gym Owner Dashboard.',
    details: ['Revenue Overview', 'Active Memberships', 'Trainer Statistics', 'Recent Bookings', 'Quick Actions']
  },
  {
    icon: UserPlus,
    title: 'Manage Trainers',
    desc: 'Add and hire trainers, manage trainer information, and approve their platform access.',
    details: ['Add New Trainers', 'Assign Specializations', 'Set Working Hours', 'Manage Salary/Revenue', 'View Performance']
  },
  {
    icon: Users,
    title: 'Manage Members',
    desc: 'Seamlessly manage gym members, memberships, and keep track of all member-related information.',
    details: ['Add New Members', 'Assign Membership Plans', 'Track Attendance', 'Manage Renewals', 'View Health Profiles']
  },
  {
    icon: BrainCircuit,
    title: 'Use AI for Fitness Management',
    desc: 'Member information is used by the AI to generate exercise & diet recommendations, helping trainers guide members.',
    details: ['AI Workout Generation', 'AI Diet Planning', 'Body Metrics Tracking', 'Automated Recommendations', 'Progress Analytics']
  },
  {
    icon: Activity,
    title: 'Start Managing Your Gym',
    desc: 'Registration → Review → Approval → Dashboard → Full Management. It’s that simple!',
    details: ['Fully Automated', 'Cloud Based', 'Secure Data', '24/7 Access', 'Grow Your Business']
  },
];

const AIGymVideoPlayer = ({ steps, onClose }: { steps: any[], onClose: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100
  const duration = 120; // 2 minutes (120 seconds)

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setIsPlaying(false);
            return 100;
          }
          // Update progress every 50ms for smooth 120s duration
          return p + (100 / (duration * 20)); 
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const currentStepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 1);
  const currentStep = steps[currentStepIndex];
  const Icon = currentStep.icon;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setProgress(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  };

  const currentSeconds = Math.floor((progress / 100) * duration);
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-[#0F172A] rounded-3xl overflow-hidden flex flex-col font-sans z-50">
      {/* Video Content Area */}
      <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#164A4A]/10 to-[#6fa3a0]/10 animate-pulse duration-3000"></div>
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] bg-[#6fa3a0]/20 blur-[100px] rounded-full"></div>
        <div className="absolute -left-32 -bottom-32 w-[500px] h-[500px] bg-[#164A4A]/20 blur-[100px] rounded-full"></div>

        {/* Slide Content */}
        <div key={currentStepIndex} className="relative z-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-28 h-28 bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] rounded-[2rem] flex items-center justify-center mb-10 shadow-[0_0_60px_rgba(22,163,74,0.4)]">
            <Icon className="text-white" size={56} strokeWidth={1.5} />
          </div>
          <div className="text-[#D3DFDA] font-black text-sm tracking-[0.2em] uppercase mb-4 bg-white/5 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            Step {currentStepIndex + 1} of 7
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
            {currentStep.title}
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed font-light mb-10">
            {currentStep.desc}
          </p>
          
          {currentStep.details && (
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
              {currentStep.details.map((detail, idx) => (
                <div key={`${currentStepIndex}-${idx}`} className="bg-[#202828]/80 border border-[#6fa3a0]/40 px-5 py-3 rounded-xl text-[#D3DFDA] text-sm md:text-base font-medium flex items-center shadow-lg backdrop-blur-md hover:-translate-y-1 transition-transform cursor-default">
                  <div className="w-2 h-2 bg-[#164A4A] rounded-full mr-3 shadow-[0_0_8px_rgba(22,163,74,0.8)]"></div>
                  {detail}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Brand Watermark */}
        <div className="absolute top-6 left-8 flex items-center space-x-2 opacity-50">
          <Activity className="text-[#164A4A]" size={24} />
          <span className="text-xl font-bold tracking-tight text-white">AI GYM <span className="font-light text-slate-400">Workflow</span></span>
        </div>
      </div>

      {/* Video Player Controls */}
      <div className="h-16 bg-[#202828]/90 backdrop-blur-md px-6 flex items-center gap-6 relative z-20 border-t border-white/5">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} 
          className="text-white hover:text-[#164A4A] transition-colors focus:outline-none"
        >
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full cursor-pointer relative group py-2 -my-2" onClick={(e) => { e.stopPropagation(); handleSeek(e); }}>
          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-slate-600 w-full rounded-full"></div>
          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] rounded-full transition-all duration-75" style={{ width: `${progress}%` }}></div>
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${progress}% - 8px)` }}></div>
        </div>

        {/* Time */}
        <div className="text-xs text-slate-400 font-medium font-mono min-w-[70px] text-right">
          {formatTime(currentSeconds)} / {formatTime(duration)}
        </div>

        <div className="w-px h-6 bg-slate-700 mx-2"></div>

        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-slate-400 hover:text-white transition-colors focus:outline-none flex items-center gap-2 text-sm font-semibold">
          <X size={20} /> Close
        </button>
      </div>
    </div>
  );
};

const GymOwnerIntroduction = () => {
  const navigate = useNavigate();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-[#F2EFE8] font-sans selection:bg-[#164A4A] selection:text-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#D3DFDA] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] rounded-lg flex items-center justify-center">
                <Activity className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#202828]">AI GYM</span>
            </Link>
            <Link 
              to="/register/gym-owner"
              className="text-sm font-semibold text-[#6fa3a0] hover:text-[#164A4A] flex items-center gap-1 transition-colors"
            >
              Skip Introduction <SkipForward size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-[#164A4A]/10 border border-[#164A4A]/20 rounded-full px-4 py-1.5 text-[#164A4A] text-xs font-bold uppercase tracking-widest mb-6">
            <Building2 size={14} /> For Gym Owners
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#202828] tracking-tight mb-6 leading-tight">
            Manage Your Gym <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#164A4A] to-[#6fa3a0]">Smarter with AI</span>
          </h1>
          <p className="text-lg md:text-xl text-[#455250] leading-relaxed">
            Learn how our AI-powered gym management platform helps you manage your gym, trainers, members, memberships, and fitness programs.
          </p>
        </div>



        {/* Steps Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#202828]">How It Works</h2>
            <div className="w-20 h-1 bg-[#164A4A] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-[#D3DFDA] transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D3DFDA]/50 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#F1F5F3] text-[#6fa3a0] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#164A4A] group-hover:text-white transition-colors shadow-sm">
                      <Icon size={24} />
                    </div>
                    <div className="text-[#A8ADA9] font-black text-4xl opacity-20 group-hover:text-[#164A4A] transition-colors">
                      0{idx + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#202828] mb-3">{step.title}</h3>
                  <p className="text-[#455250] leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Bottom Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 md:p-14 shadow-xl border border-[#D3DFDA] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(22,163,74,0.05)_0%,_transparent_70%)] pointer-events-none"></div>
          
          <h2 className="text-3xl font-bold text-[#202828] mb-4 relative z-10">Ready to Transform Your Gym?</h2>
          <p className="text-[#455250] mb-10 text-lg relative z-10 max-w-xl mx-auto">Join thousands of modern gym owners who are leveraging AI to automate their business and provide better results for members.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button 
              onClick={() => navigate('/register/gym-owner')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] text-white rounded-xl font-bold text-lg hover:from-[#C6A77D] hover:to-[#0F766E] shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              Start Registration
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            
            <button 
              onClick={() => navigate('/register/gym-owner')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#455250] rounded-xl font-bold text-lg border-2 border-[#D3DFDA] hover:border-[#6fa3a0] hover:text-[#6fa3a0] transition-all flex items-center justify-center gap-2"
            >
              Skip Introduction
            </button>
          </div>
          
          <div className="mt-8 relative z-10">
            <Link 
              to="/register/gym-owner" 
              className="text-sm font-medium text-[#A8ADA9] hover:text-[#164A4A] underline underline-offset-4 decoration-[#D3DFDA] hover:decoration-[#164A4A] transition-all"
            >
              Already know how it works? Skip and register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GymOwnerIntroduction;
