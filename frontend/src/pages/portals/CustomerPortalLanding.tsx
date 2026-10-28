import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CustomerPortalFooter from '../../components/customer/CustomerPortalFooter';
import { TourSlide } from '../../components/Landing/TourSlide';
import { 
  Bot, 
  ArrowLeft, 
  ArrowRight,
  Flame, 
  Apple, 
  Dumbbell, 
  LineChart, 
  Award, 
  MapPin, 
  Activity, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Compass, 
  Trophy, 
  HeartPulse, 
  Scale, 
  Zap, 
  Timer, 
  Salad,
  Star,
  Loader2,
  X,
  GitBranch,
  Check,
  ChevronLeft,
  Target,
  Utensils,
  Droplets,
  Clock,
  ShieldAlert,
  Play,
  PlayCircle,
  CheckCircle,
  User
} from 'lucide-react';
import api from '../../utils/api';
import { FeaturePreview } from '../../components/Landing/FeaturePreview';

const CustomerPortalLanding = () => {
  const location = useLocation();
  const [featuredGyms, setFeaturedGyms] = useState<any[]>([]);
  const [gymsLoading, setGymsLoading] = useState(true);
  const [showAiWorkoutModal, setShowAiWorkoutModal] = useState(false);
  const [activeWorkoutStep, setActiveWorkoutStep] = useState(1);
  const [showDietFlowchartModal, setShowDietFlowchartModal] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(1);
  const [activeFeatureTab, setActiveFeatureTab] = useState<'ai' | 'gym' | 'trainer'>('ai');
  const [featureSlideIndex, setFeatureSlideIndex] = useState(0);

  useEffect(() => {
    if (location.state && (location.state as any).openTour) {
      setIsTourOpen(true);
      setTourStep(1);
    }
  }, [location.state]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTourOpen) {
      interval = setInterval(() => {
        setTourStep(s => (s < 13 ? s + 1 : 1));
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isTourOpen]);

  useEffect(() => {
    setFeatureSlideIndex(0);
  }, [activeFeatureTab]);

  useEffect(() => {
    if (!isFeaturesOpen) return;
    const interval = setInterval(() => {
      let max = 5;
      if (activeFeatureTab === 'ai') max = 5;
      if (activeFeatureTab === 'gym') max = 7;
      if (activeFeatureTab === 'trainer') max = 7;
      if (featureSlideIndex < max - 1) {
        setFeatureSlideIndex(featureSlideIndex + 1);
      } else {
        setFeatureSlideIndex(0);
        if (activeFeatureTab === 'ai') setActiveFeatureTab('gym');
        else if (activeFeatureTab === 'gym') setActiveFeatureTab('trainer');
        else setActiveFeatureTab('ai');
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isFeaturesOpen, activeFeatureTab, featureSlideIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFeaturesOpen(false);
        setIsTourOpen(false);
        setShowAiWorkoutModal(false);
        setShowDietFlowchartModal(false);
      }
    };
    if (isFeaturesOpen || isTourOpen || showAiWorkoutModal || showDietFlowchartModal) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFeaturesOpen, isTourOpen, showAiWorkoutModal, showDietFlowchartModal]);

  useEffect(() => {
    if (window.location.hash === '#gyms') {
      const el = document.getElementById('gyms');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }

    sessionStorage.setItem('last_portal', 'customer');

    api.get('/gyms/public')
      .then(res => setFeaturedGyms((res.data.gyms || []).slice(0, 3)))
      .catch(() => setFeaturedGyms([]))
      .finally(() => setGymsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#080B0C] text-[#F5FAFA] selection:bg-[#2DD4BF] selection:text-[#06201D] font-sans">
      {/* Top Navigation */}
      <nav className="border-b border-[#2A3A3A] bg-[#0E1415]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Activity className="text-[#06201D]" size={22} strokeWidth={2.5} />
              </div>
              <span className="text-2xl font-black tracking-tight text-[#F5FAFA] group-hover:text-[#2DD4BF] transition-colors">
                Gymora
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
              Customer Fitness Portal
            </span>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsFeaturesOpen(true)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="text-[#06201D]" />
              <span>Features</span>
            </button>
            <button
              type="button"
              onClick={() => { setTourStep(1); setIsTourOpen(true); }}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <PlayCircle size={14} className="text-[#06201D]" />
              <span>Customer Journey</span>
            </button>
            <Link
              to="/gyms"
              state={{ from: '/portal/customer', fromLabel: 'Back to Customer Portal' }}
              className="hidden md:inline-flex px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <Compass size={14} className="text-[#06201D]" />
              <span>Find Gyms</span>
            </Link>
            <Link
              to="/login?portal=customer"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
            >
              <User size={14} className="text-[#06201D]" />
              <span>Customer Login</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2DD4BF]/12 via-[#080B0C]/0 to-[#080B0C]/0 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-medium text-[#2DD4BF] mb-6">
              <Sparkles size={14} />
              <span>Your Personalized Digital Fitness & Transformation Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight text-[#F5FAFA]">
              Elevate Your Body &amp; Mind With <br className="hidden sm:block" />
              <span className="text-[#2DD4BF]">AI Workouts &amp; Elite Trainers</span>
            </h1>

            <p className="text-base sm:text-lg text-[#9AAEAE] max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Access customized AI training and nutrition plans, book 1-on-1 certified coaches, track daily weight and calorie goals, and participate in challenges that reward your dedication.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
              <Link
                to="/register/customer"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30"
              >
                <Flame size={18} className="text-[#06201D]" />
                <span>Join Now / Create Account</span>
              </Link>
              <button
                type="button"
                onClick={() => { setTourStep(1); setIsTourOpen(true); }}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#141D1E] hover:bg-[#1B2728] text-white border border-[#2A3A3A] hover:border-[#2DD4BF] font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg cursor-pointer"
              >
                <PlayCircle size={18} className="text-[#2DD4BF]" />
                <span>Watch Customer Journey</span>
              </button>
            </div>

            {/* Member Success Pulse Bar */}
            <div className="w-full bg-[#141D1E]/90 border border-[#2A3A3A] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">AI Routines</div>
                  <div className="text-xs sm:text-sm font-bold text-[#F5FAFA]">250,000+</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Flame size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Daily Burn</div>
                  <div className="text-xs sm:text-sm font-bold text-[#F5FAFA]">540 kcal / Day</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center shrink-0">
                  <Dumbbell size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Elite Coaches</div>
                  <div className="text-xs sm:text-sm font-bold text-[#F5FAFA]">1,200+ Active</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Trophy size={18} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#9AAEAE]">Streak Rate</div>
                  <div className="text-xs sm:text-sm font-bold text-[#F5FAFA]">84% Weekly</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Video Container: Customer Fitness AI Video */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] shadow-2xl shadow-black bg-[#141D1E] group">
              <video
                src="/videos/customer-ai-gym.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-[360px] sm:h-[460px] object-cover object-center block"
              />
              <div className="absolute top-4 right-4 bg-[#0E1415]/90 border border-[#2A3A3A] backdrop-blur-md rounded-xl px-3 py-1.5 shadow-xl pointer-events-none">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2DD4BF]">
                  <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse"></span>
                  <span>Customer Fitness AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Visual Showcase Section 1: AI Workout Engine & Real-Time Tracking */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#0E1415]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Copy Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-4">
                <Bot size={14} />
                <span>Next-Gen Generative Training</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight mb-4 leading-snug">
                Intelligent Workouts Adapted to Your Exact Goals & Equipment
              </h2>
              <p className="text-[#9AAEAE] text-base leading-relaxed mb-6">
                Never wonder what exercise to do next. Gymora’s AI trainer calculates your optimal muscle split, recommended weights, and rep ranges based on your current physical stats, gym machines, and energy levels.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Dynamic Rep & Set Adjustments</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">As you get stronger, the AI automatically increases progressive overload parameters to guarantee continuous muscle hypertrophy.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Interactive Rep Player & Rest Timers</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Follow built-in countdown timers, audio cues between sets, and high-definition video form demos to prevent workout injuries.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Injury-Aware Exercise Substitutions</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Have lower back pain or shoulder stiffness? The AI instantly swaps risky compound movements for safe, biomechanically isolated alternatives.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveWorkoutStep(1);
                  setShowAiWorkoutModal(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2DD4BF] text-[#06201D] font-bold text-sm hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 cursor-pointer"
              >
                <span>Launch AI Workout Assistant</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Visual Card Right */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] bg-[#141D1E] shadow-2xl shadow-black">
                <img 
                  src="/customer-landing-image-1.jpg" 
                  alt="Intelligent Workout Training" 
                  loading="eager"
                  decoding="sync"
                  className="w-full h-[400px] sm:h-[460px] object-cover object-center block select-none pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase Section 2: Macro Nutrition & Diet Planner */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#080B0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Card Left */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden border border-[#2A3A3A] bg-[#141D1E] shadow-2xl shadow-black">
                <img 
                  src="/customer-landing-image-3.jpg" 
                  alt="Nutrition & Diet Meal Plan" 
                  loading="eager"
                  decoding="sync"
                  className="w-full h-[400px] sm:h-[460px] object-cover object-center block select-none pointer-events-none"
                />
              </div>
            </div>

            {/* Copy Right */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-4">
                <Salad size={14} />
                <span>Precision Fuel & Meal Planning</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight mb-4 leading-snug">
                Nutrition Engineered Around Your Metabolism
              </h2>
              <p className="text-[#9AAEAE] text-base leading-relaxed mb-6">
                Exercise is only half the battle. Our nutritional engine generates meal schedules that match your caloric deficit or surplus targets, complete with regional grocery recipes and dietary preferences.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Flexible Dietary Preferences (Veg, Non-Veg, Keto)</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Easily switch between high-protein vegetarian, plant-based vegan, low-carb, and standard macro-balanced eating styles.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Pre & Post-Workout Nutrient Timing</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Get timely alerts telling you what fast-acting carbs to eat 45 minutes before training and optimal whey protein recovery meals.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-lg bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F5FAFA] text-sm">Hydration & Water Intake Reminders</h4>
                    <p className="text-xs text-[#9AAEAE] mt-0.5">Stay optimally hydrated throughout the day with one-tap water logging and electrolyte balance guidance.</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDietFlowchartModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2DD4BF] text-[#06201D] font-bold text-sm hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 cursor-pointer"
              >
                <span>View Diet & Meal Plans</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Showcase Section 3: Trainer Coaching, Gym Marketplace & Streaks */}
      <section className="py-20 border-t border-[#2A3A3A] bg-[#0E1415]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141D1E] border border-[#2A3A3A] text-xs font-semibold text-[#2DD4BF] mb-3">
              <Trophy size={14} />
              <span>Coaching, Community & Milestones</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F5FAFA] tracking-tight">
              Work With Elite Coaches & Stay Accountable
            </h2>
            <p className="text-sm text-[#9AAEAE] mt-2">
              Transform alone or connect with certified mentors who push your boundaries and celebrate your wins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gallery Card 1 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80" 
                  alt="1-on-1 Personal Trainer Coaching" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <Dumbbell size={13} />
                  <span>1-on-1 Mentorship</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Book Certified Trainers</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Browse trainer specializations, read real reviews, and schedule in-gym personal training or online form correction sessions.
                </p>
              </div>
            </div>

            {/* Gallery Card 2 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=700&q=80" 
                  alt="Multi-Gym Verified Network" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <MapPin size={13} />
                  <span>Gym Finder</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Verified Gym Marketplace</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Discover partner gyms, compare amenities (steam bath, Olympic barbells, pools), and purchase flexible passes with instant QR check-in.
                </p>
              </div>
            </div>

            {/* Gallery Card 3 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF]/40 rounded-3xl overflow-hidden transition-all shadow-lg group">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=700&q=80" 
                  alt="Fitness Streaks & Achievements" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141D1E] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 bg-[#080B0C]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2A3A3A] text-[11px] font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <Trophy size={13} />
                  <span>Streaks & Badges</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Streaks & Reward Badges</h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed">
                  Earn points for consecutive workout days, unlock discount coupons on gym store supplements, and claim your place on the leaderboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections Grid */}
      <section className="py-16 border-t border-[#2A3A3A] bg-[#080B0C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5FAFA] tracking-tight">
              Everything Designed for Your Transformation
            </h2>
            <p className="text-sm text-[#9AAEAE] mt-2">
              From day 1 check-in to your milestone PRs, enjoy intelligent tools that keep you consistent, safe, and motivated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <Bot size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    AI Generator
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Smart AI Workout Engine
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Generate tailored weekly exercise programs based on your body type, fitness level, goals, available gym equipment, and past injuries.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Custom Splits</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Video Demos</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Rest Timers</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Launch AI Workout</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <Apple size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Macro Balanced
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Customized Diet &amp; Nutrition
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Macro-balanced daily meal plans with vegetarian, vegan, and protein-rich preferences crafted to fuel your workouts and fat loss.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Calorie Budgets</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Veg / Non-Veg</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Hydration Log</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>View Diet Plans</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <Dumbbell size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    Certified Mentors
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Certified Personal Coaches
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Discover elite trainers at your gym, book online or in-person 1-on-1 training slots, and receive professional form corrections.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">1-on-1 Slots</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Form Reviews</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Direct Chat</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Find a Coach</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <LineChart size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Analytics
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Progress &amp; Milestone Tracking
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Log body weight, BMI changes, workout completion streaks, and attendance records with interactive visual progression graphs.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Weight Charts</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">BMI Tracker</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Session History</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Track My Progress</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <Award size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                    Badges &amp; Rewards
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Fitness Challenges &amp; Rewards
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Join gym-wide endurance challenges, earn badges, unlock membership fee discounts, and redeem store vouchers for protein and merchandise.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Weekly Quests</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Store Discounts</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Leaderboards</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Join Challenges</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Nearby Gyms
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#F5FAFA] mb-2">
                  Gym Marketplace &amp; Memberships
                </h3>
                <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                  Explore nearby verified fitness clubs, compare day-passes and annual plans, and pay securely via integrated digital payment gateways.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Verified Clubs</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Day Passes</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#080B0C] text-[#9AAEAE] border border-[#2A3A3A]">Instant QR Entry</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs font-semibold text-[#2DD4BF]">
                <span>Find Nearby Gyms</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Premium Gyms (Matches Image 2 & Image 3) */}
      <section className="py-24 relative overflow-hidden bg-[#080B0C] border-t border-[#2A3A3A]" id="gyms">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#FFFFFF]">
                Discover Premium <span className="text-[#2DD4BF]">Gyms</span>
              </h2>
              <p className="text-[#9AAEAE] max-w-xl">
                Find and join the best fitness centers in your area. Use your Gymora membership to access state-of-the-art facilities.
              </p>
            </div>
            <Link
              to="/gyms"
              state={{ from: '/portal/customer', fromLabel: 'Back to Customer Portal' }}
              className="hidden md:flex items-center space-x-2 text-[#2DD4BF] hover:text-[#5EEAD4] transition-colors font-semibold mt-4 md:mt-0"
            >
              <span>View All Gyms</span>
              <ArrowRight size={20} />
            </Link>
          </div>

          {gymsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-[#2DD4BF]" size={40} />
            </div>
          ) : featuredGyms.length === 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Iron Forge Barbell', location: 'Downtown Metro', rating: 4.9, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', tags: ['24/7 Access', 'Free Weights'] },
                { name: 'Apex Athletics', location: 'Westside District', rating: 4.8, image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop', tags: ['CrossFit', 'Sauna'] },
                { name: 'Velocity Fitness Studio', location: 'North Hills', rating: 4.7, image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1375&auto=format&fit=crop', tags: ['Cardio', 'Pool'] }
              ].map((gym, idx) => (
                <div key={idx} className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl overflow-hidden group cursor-pointer hover:border-[#2DD4BF]/50 transition-colors">
                  <div className="h-48 overflow-hidden relative">
                    <img src={gym.image} alt={gym.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-1 border border-[#2A3A3A]">
                      <Star size={14} className="text-[#2DD4BF]" fill="currentColor" />
                      <span className="text-xs font-bold text-white">{gym.rating}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1 text-[#FFFFFF]">{gym.name}</h3>
                    <div className="flex items-center space-x-1 text-[#9AAEAE] text-sm mb-4">
                      <MapPin size={14} className="text-[#2DD4BF]" />
                      <span>{gym.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {gym.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-xs font-medium px-2 py-1 bg-[#1B2728] rounded-md text-[#9AAEAE] border border-[#2A3A3A]">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredGyms.map((gym) => (
                <Link
                  key={gym._id}
                  to={`/gyms/${gym._id}`}
                  className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl overflow-hidden group hover:border-[#2DD4BF]/60 hover:shadow-[0_0_25px_rgba(45,212,191,0.2)] transition-all duration-300 block"
                >
                  <div className="h-48 overflow-hidden relative">
                    {gym.logo ? (
                      <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#0E1415] to-[#1B2728] flex items-center justify-center">
                        <Activity size={48} className="text-[#2DD4BF]" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-[#2A3A3A]">
                      <Star size={14} className="text-[#2DD4BF]" fill="currentColor" />
                      <span className="text-white text-xs font-bold">{gym.rating || 5}</span>
                    </div>
                    {gym.gymType && (
                      <div className="absolute top-4 left-4 bg-[#2DD4BF] text-[#06201D] font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                        {gym.gymType}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1 text-[#FFFFFF] group-hover:text-[#2DD4BF] transition-colors">{gym.name}</h3>
                    <div className="flex items-start space-x-1.5 text-[#9AAEAE] text-sm mb-4">
                      <MapPin size={15} className="text-[#2DD4BF] shrink-0 mt-0.5" />
                      <div className="line-clamp-2 text-xs font-medium text-[#9AAEAE]">
                        {[
                          gym.location?.address,
                          gym.location?.area,
                          gym.location?.city,
                          gym.location?.pinCode
                        ].filter(Boolean).join(', ') || 'Address not specified'}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(gym.facilities || []).slice(0, 2).map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="text-xs font-medium px-2.5 py-1 bg-[#1B2728] rounded-md text-[#9AAEAE] border border-[#2A3A3A]">{tag}</span>
                      ))}
                      {gym.facilities?.length > 2 && (
                        <span className="text-xs font-medium px-2.5 py-1 bg-[#2DD4BF]/15 text-[#2DD4BF] rounded-md border border-[#2DD4BF]/30">
                          +{gym.facilities.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="pt-4 border-t border-[#2A3A3A] flex items-center justify-end">
                      <div className="px-5 py-2 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl text-sm font-bold transition-colors shadow-md shadow-[#2DD4BF]/20 group-hover:bg-[#5EEAD4]">
                        View Details
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile View All link */}
          <div className="mt-8 text-center md:hidden">
            <Link
              to="/gyms"
              state={{ from: '/portal/customer', fromLabel: 'Back to Customer Portal' }}
              className="inline-flex items-center gap-2 text-[#2DD4BF] hover:text-[#5EEAD4] font-semibold"
            >
              View All Gyms <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Member CTA Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#141D1E] to-[#0E1415] border border-[#2A3A3A] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="w-14 h-14 bg-[#2DD4BF]/10 text-[#2DD4BF] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#2DD4BF]/20">
            <Flame size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5FAFA] mb-3">
            Start Your Fitness Journey Today
          </h2>
          <p className="text-sm sm:text-base text-[#9AAEAE] max-w-xl mx-auto mb-8">
            Create an account in minutes or log in to view today’s workout, check your diet macro targets, and book your next trainer session.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#9AAEAE] mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Free AI Fitness Assessment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Certified Trainer Network</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2DD4BF]" />
              <span>Instant QR Check-ins</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/gyms"
              state={{ from: '/portal/customer', fromLabel: 'Back to Customer Portal' }}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20"
            >
              <span>Explore All Gyms</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <CustomerPortalFooter />

      {/* ── Modal 1: Step-by-Step AI Workout Plan Modal ── */}
      {showAiWorkoutModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAiWorkoutModal(false)}
        >
          <div 
            className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative text-[#F5FAFA] scrollbar-thin scrollbar-thumb-[#2A3A3A]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAiWorkoutModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#141D1E] hover:bg-[#1B2728] border border-[#2A3A3A] flex items-center justify-center text-[#9AAEAE] hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF]">
                <Bot size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF]">AI Fitness Engine</span>
                <h3 className="text-xl font-bold text-white">AI Workout Plan Generation &amp; Execution</h3>
              </div>
            </div>
            <p className="text-sm text-[#9AAEAE] mb-6">
              A 6-step guided walkthrough of how Gymora AI designs, adapts, and executes your personalized training program.
            </p>

            {/* Step Navigation Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
              {[
                { step: 1, label: '1. Goal & Level' },
                { step: 2, label: '2. Biometrics' },
                { step: 3, label: '3. Equipment' },
                { step: 4, label: '4. AI Volume' },
                { step: 5, label: '5. Rep Player' },
                { step: 6, label: '6. Auto-Adapt' },
              ].map((item) => (
                <button
                  key={item.step}
                  onClick={() => setActiveWorkoutStep(item.step)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                    activeWorkoutStep === item.step
                      ? 'bg-[#2DD4BF] text-[#06201D] border-[#2DD4BF] shadow-md shadow-teal-500/20'
                      : 'bg-[#141D1E] text-[#9AAEAE] border-[#2A3A3A] hover:border-[#2DD4BF]/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Step Content Container */}
            <div className="p-5 rounded-2xl bg-[#141D1E] border border-[#2A3A3A] mb-6 min-h-[290px] flex flex-col justify-between">
              
              {/* Step 1 */}
              {activeWorkoutStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#2DD4BF]/20 text-[#2DD4BF] font-black text-xs flex items-center justify-center">1</span>
                    <h4 className="font-bold text-white text-base">Goal Calibration &amp; Training Experience</h4>
                  </div>
                  <p className="text-xs text-[#9AAEAE] leading-relaxed">
                    The engine begins by establishing your primary fitness aspiration and evaluating your neuromuscular baseline.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                      <div className="text-xs font-bold text-white mb-1">Target Objectives</div>
                      <p className="text-[11px] text-[#9AAEAE]">Hypertrophy (Muscle Gain), Fat Loss &amp; Definition, Maximal Strength, or Athletic Conditioning.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                      <div className="text-xs font-bold text-white mb-1">Experience Baseline</div>
                      <p className="text-[11px] text-[#9AAEAE]">Beginner (&lt;6 mos), Intermediate (1-3 yrs), or Advanced lifter (3+ yrs) to calibrate volume thresholds.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-xs text-[#CBD5E1]">
                    <strong className="text-[#2DD4BF]">AI Algorithmic Rule:</strong> Beginners receive 10-12 weekly sets per muscle group for neural adaptation; advanced lifters scale to 16-22 sets for continued hypertrophy.
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {activeWorkoutStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#2DD4BF]/20 text-[#2DD4BF] font-black text-xs flex items-center justify-center">2</span>
                    <h4 className="font-bold text-white text-base">Biometric Profile &amp; Injury Screening</h4>
                  </div>
                  <p className="text-xs text-[#9AAEAE] leading-relaxed">
                    Gymora cross-checks your anatomical height, body weight, past orthopedic history, and joint limitations before generating movements.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                      <div className="text-xs font-bold text-white mb-1">Orthopedic Limitation Tagging</div>
                      <p className="text-[11px] text-[#9AAEAE]">Screening for lower-back pain, rotator cuff impingement, patellar tracking, or wrist stiffness.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                      <div className="text-xs font-bold text-white mb-1">Real-time Biomechanical Swaps</div>
                      <p className="text-[11px] text-[#9AAEAE]">Replaces heavy axial loading with chest-supported rows, dumbbell presses, and belt squats.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                    <strong>Zero-Injury Guarantee:</strong> Every exercise selected maintains optimal joint alignment without aggravating documented chronic strains.
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {activeWorkoutStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#2DD4BF]/20 text-[#2DD4BF] font-black text-xs flex items-center justify-center">3</span>
                    <h4 className="font-bold text-white text-base">Equipment Availability &amp; Split Selection</h4>
                  </div>
                  <p className="text-xs text-[#9AAEAE] leading-relaxed">
                    Customizes the program to your real gym environment and weekly time commitments.
                  </p>

                  <div className="grid sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-3 rounded-xl bg-[#0E1415] border border-[#2A3A3A] text-center">
                      <Dumbbell size={20} className="text-[#2DD4BF] mx-auto mb-1" />
                      <div className="text-xs font-bold text-white">Full Gym</div>
                      <p className="text-[10px] text-[#9AAEAE] mt-0.5">Barbells, Cables &amp; Machines</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0E1415] border border-[#2A3A3A] text-center">
                      <Target size={20} className="text-[#2DD4BF] mx-auto mb-1" />
                      <div className="text-xs font-bold text-white">Home Setup</div>
                      <p className="text-[10px] text-[#9AAEAE] mt-0.5">Dumbbells &amp; Bands</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#0E1415] border border-[#2A3A3A] text-center">
                      <Activity size={20} className="text-[#2DD4BF] mx-auto mb-1" />
                      <div className="text-xs font-bold text-white">Bodyweight</div>
                      <p className="text-[10px] text-[#9AAEAE] mt-0.5">Calisthenics &amp; Mobility</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#CBD5E1]">
                    Splits generated: <span className="text-[#2DD4BF] font-semibold">3-Day Full Body</span>, <span className="text-[#2DD4BF] font-semibold">4-Day Upper/Lower</span>, or <span className="text-[#2DD4BF] font-semibold">5-Day Push/Pull/Legs</span>.
                  </p>
                </div>
              )}

              {/* Step 4 */}
              {activeWorkoutStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#2DD4BF]/20 text-[#2DD4BF] font-black text-xs flex items-center justify-center">4</span>
                    <h4 className="font-bold text-white text-base">AI Volume Synthesis &amp; Progressive Overload</h4>
                  </div>
                  <p className="text-xs text-[#9AAEAE] leading-relaxed">
                    Gymora calculates exact working sets, rep schemes, rest durations, and RPE (Rate of Perceived Exertion) targets.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                      <div className="text-xs font-bold text-white mb-1">Rep-in-Reserve (RIR 1-2)</div>
                      <p className="text-[11px] text-[#9AAEAE]">Ensures sets are taken close to muscular failure for maximum stimulus without systemic nervous fatigue.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                      <div className="text-xs font-bold text-white mb-1">Ramping Warm-Up Protocol</div>
                      <p className="text-[11px] text-[#9AAEAE]">Generates dynamic joint warm-ups followed by 3 specific ramping sets before working loads.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-xs text-[#CBD5E1]">
                    <strong className="text-[#2DD4BF]">Dynamic Overload:</strong> When target reps are achieved with good form, the engine schedules a 2.5% weight increment for the next session.
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {activeWorkoutStep === 5 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#2DD4BF]/20 text-[#2DD4BF] font-black text-xs flex items-center justify-center">5</span>
                    <h4 className="font-bold text-white text-base">Interactive Rep Player &amp; Rest Timers</h4>
                  </div>
                  <p className="text-xs text-[#9AAEAE] leading-relaxed">
                    During the workout, the app guides you rep-by-rep with built-in timers, cues, and live weight logging.
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2DD4BF] flex items-center gap-1.5"><Timer size={14} /> Built-in Rest Intervals</span>
                      <span className="text-[#9AAEAE]">90s countdown with audio chime</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5"><Play size={14} className="text-[#2DD4BF]" /> 4K Form Coaching Videos</span>
                      <span className="text-[#9AAEAE]">Cues: "Shoulders pinned, elbows tucked"</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> 1-Tap Metric Logging</span>
                      <span className="text-[#9AAEAE]">Logs completed weight and reps seamlessly</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6 */}
              {activeWorkoutStep === 6 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#2DD4BF]/20 text-[#2DD4BF] font-black text-xs flex items-center justify-center">6</span>
                    <h4 className="font-bold text-white text-base">Fatigue Rating &amp; Dynamic Adaptation</h4>
                  </div>
                  <p className="text-xs text-[#9AAEAE] leading-relaxed">
                    After completing the session, you rate muscle soreness and overall exertion to train smarter, not just harder.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                      <div className="text-xs font-bold text-white mb-1">Auto-Regulated Recovery</div>
                      <p className="text-[11px] text-[#9AAEAE]">If post-workout fatigue exceeds recovery thresholds, volume is reduced by 15% to avoid overtraining.</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A]">
                      <div className="text-xs font-bold text-white mb-1">Deload Week Scheduling</div>
                      <p className="text-[11px] text-[#9AAEAE]">Every 5th or 6th week is structured with active recovery sets to reset joint readiness and central nervous fatigue.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                    <strong>Complete Program Lifecycle:</strong> You're always progressing on an intelligent, self-correcting fitness trajectory.
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A] mt-4">
                <button
                  type="button"
                  disabled={activeWorkoutStep === 1}
                  onClick={() => setActiveWorkoutStep(prev => Math.max(1, prev - 1))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    activeWorkoutStep === 1 
                      ? 'opacity-40 cursor-not-allowed text-[#9AAEAE] bg-[#0E1415]' 
                      : 'bg-[#1B2728] text-white hover:bg-[#2A3A3A] cursor-pointer'
                  }`}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <span className="text-xs text-[#9AAEAE] font-medium">
                  Step {activeWorkoutStep} of 6
                </span>

                {activeWorkoutStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => setActiveWorkoutStep(prev => Math.min(6, prev + 1))}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2DD4BF] text-[#06201D] hover:bg-[#5EEAD4] flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20 cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAiWorkoutModal(false)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#2DD4BF] text-[#06201D] hover:bg-[#5EEAD4] transition-all cursor-pointer"
                  >
                    Close Walkthrough
                  </button>
                )}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#2A3A3A]">
              <span className="text-xs text-[#9AAEAE]">Ready to experience the interactive workout player?</span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/register/customer"
                  onClick={() => setShowAiWorkoutModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs transition-all text-center"
                >
                  Create Account &amp; Start
                </Link>
                <button
                  onClick={() => setShowAiWorkoutModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#141D1E] hover:bg-[#1B2728] text-[#9AAEAE] hover:text-white text-xs border border-[#2A3A3A] transition-all text-center"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Modal 2: Diet & Meal Plan Flowchart Modal ── */}
      {showDietFlowchartModal && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-2 py-6 animate-in fade-in duration-200"
          onClick={() => setShowDietFlowchartModal(false)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0E1415] border border-[#2A3A3A] rounded-2xl shadow-2xl shadow-black/70 scrollbar-thin scrollbar-thumb-[#2A3A3A]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0E1415]/95 backdrop-blur-md border-b border-[#2A3A3A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 rounded-xl flex items-center justify-center text-[#2DD4BF]">
                  <GitBranch size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF] bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 px-2 py-0.5 rounded-full">Nutrition Engine</span>
                    <span className="text-[10px] text-[#9AAEAE]">7-Stage Flowchart</span>
                  </div>
                  <h2 className="text-lg font-bold text-[#F5FAFA]">AI Diet &amp; Meal Planning Architecture</h2>
                </div>
              </div>
              <button 
                onClick={() => setShowDietFlowchartModal(false)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1B2728] hover:bg-[#2A3A3A] text-[#9AAEAE] hover:text-[#F5FAFA] transition-all"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Introduction Banner */}
            <div className="px-6 pt-5 pb-2">
              <p className="text-xs text-[#9AAEAE] leading-relaxed">
                This flowchart visualizes the science-based nutritional pipeline: from BMR &amp; metabolic calculation and caloric target sizing to macronutrient optimization, 5-meal daily distribution, hydration reminders, and weekly auto-recalibration.
              </p>
            </div>

            {/* SVG Flowchart Container */}
            <div className="p-4 sm:p-6 overflow-x-auto flex justify-center bg-[#0A0E0F]">
              <svg 
                viewBox="0 0 760 980" 
                xmlns="http://www.w3.org/2000/svg" 
                style={{ width: '100%', maxWidth: '760px', minWidth: '640px', display: 'block' }}
              >
                <defs>
                  <marker id="dt-arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                    <polygon points="0 0, 9 3.5, 0 7" fill="#2DD4BF" />
                  </marker>
                  <marker id="dt-arrG" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                    <polygon points="0 0, 9 3.5, 0 7" fill="#4ade80" />
                  </marker>
                  <marker id="dt-arrR" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
                    <polygon points="0 0, 9 3.5, 0 7" fill="#f87171" />
                  </marker>
                </defs>

                {/* ── START ── */}
                <ellipse cx="380" cy="30" rx="100" ry="20" fill="#0a2820" stroke="#2DD4BF" strokeWidth="2" />
                <text x="380" y="35" textAnchor="middle" fill="#2DD4BF" fontSize="12" fontWeight="800" fontFamily="ui-sans-serif,sans-serif">START: NUTRITION &amp; MEAL PLAN</text>

                {/* Arrow down to Stage 1 */}
                <line x1="380" y1="50" x2="380" y2="70" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />

                {/* ── Stage 1: BMR & TDEE ── */}
                <rect x="200" y="70" width="360" height="48" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="380" y="89" textAnchor="middle" fill="#F5FAFA" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">1. BMR &amp; Total Daily Energy Expenditure (TDEE)</text>
                <text x="380" y="105" textAnchor="middle" fill="#9AAEAE" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Calculated using Mifflin-St Jeor formula &amp; activity multiplier</text>

                {/* Arrow down to Stage 2 */}
                <line x1="380" y1="118" x2="380" y2="138" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />

                {/* ── Stage 2: Caloric Goal Target ── */}
                <rect x="200" y="138" width="360" height="48" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="380" y="157" textAnchor="middle" fill="#F5FAFA" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">2. Caloric Goal Target Formulation</text>
                <text x="380" y="173" textAnchor="middle" fill="#9AAEAE" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Deficit (-500 kcal for cutting) or Surplus (+300 kcal for lean bulk)</text>

                {/* Arrow down to Stage 3 */}
                <line x1="380" y1="186" x2="380" y2="206" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />

                {/* ── Stage 3: Macronutrient Split ── */}
                <rect x="200" y="206" width="360" height="48" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="380" y="225" textAnchor="middle" fill="#F5FAFA" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">3. Precision Macronutrient Split Ratio</text>
                <text x="380" y="241" textAnchor="middle" fill="#9AAEAE" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Protein: 2.0g/kg • Carbohydrates: 45-55% • Essential Healthy Fats: 25%</text>

                {/* Arrow down to Stage 4 */}
                <line x1="380" y1="254" x2="380" y2="274" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />

                {/* ── Stage 4: Dietary Preferences & Allergies ── */}
                <rect x="200" y="274" width="360" height="48" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="380" y="293" textAnchor="middle" fill="#F5FAFA" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">4. Dietary Preference &amp; Allergy Filtering</text>
                <text x="380" y="309" textAnchor="middle" fill="#9AAEAE" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Vegetarian, Vegan, High-Protein Non-Veg, Keto, Gluten/Dairy-Free, Jain</text>

                {/* Arrow down to Decision */}
                <line x1="380" y1="322" x2="380" y2="342" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />

                {/* ── Decision Diamond: Balanced & Feasible? ── */}
                <polygon points="380,342 510,388 380,434 250,388" fill="#1B2728" stroke="#2DD4BF" strokeWidth="2" />
                <text x="380" y="383" textAnchor="middle" fill="#2DD4BF" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Macros &amp; Fiber</text>
                <text x="380" y="399" textAnchor="middle" fill="#2DD4BF" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Balanced?</text>

                {/* NO — right branch */}
                <line x1="510" y1="388" x2="580" y2="388" stroke="#f87171" strokeWidth="1.5" markerEnd="url(#dt-arrR)" />
                <text x="535" y="380" fill="#f87171" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">NO</text>
                <rect x="580" y="368" width="140" height="42" rx="8" fill="#1a0a0a" stroke="#f87171" strokeWidth="1.5" />
                <text x="650" y="386" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Re-balance Calories</text>
                <text x="650" y="400" textAnchor="middle" fill="#f87171" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Auto-adjust macro splits</text>

                {/* YES — down branch */}
                <line x1="380" y1="434" x2="380" y2="464" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#dt-arrG)" />
                <text x="390" y="453" fill="#4ade80" fontSize="10" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">YES</text>

                {/* ── Milestone: 5-Meal Daily Nutrition Architecture ── */}
                <rect x="160" y="464" width="440" height="52" rx="10" fill="#0a2820" stroke="#2DD4BF" strokeWidth="2.5" />
                <text x="380" y="487" textAnchor="middle" fill="#2DD4BF" fontSize="13" fontWeight="800" fontFamily="ui-sans-serif,sans-serif">5-Meal Daily Nutrition Architecture</text>
                <text x="380" y="505" textAnchor="middle" fill="#9AAEAE" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Synchronized with your training schedule for optimal nutrient timing</text>

                {/* ── Branching to 3 Parallel Meal Distribution Tracks ── */}
                <line x1="380" y1="516" x2="380" y2="540" stroke="#2DD4BF" strokeWidth="1.5" />
                {/* Horizontal Bus Line */}
                <line x1="130" y1="540" x2="630" y2="540" stroke="#2DD4BF" strokeWidth="1.5" />
                {/* 3 verticals */}
                <line x1="130" y1="540" x2="130" y2="564" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />
                <line x1="380" y1="540" x2="380" y2="564" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />
                <line x1="630" y1="540" x2="630" y2="564" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />

                {/* ── Track A: Pre-Workout & Breakfast ── */}
                <rect x="25" y="564" width="210" height="48" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="130" y="583" textAnchor="middle" fill="#F5FAFA" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">A. Breakfast &amp; Pre-Workout</text>
                <text x="130" y="599" textAnchor="middle" fill="#9AAEAE" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Complex carbs (oats) + eggs/whey</text>

                {/* Sub-step A2 */}
                <line x1="130" y1="612" x2="130" y2="632" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />
                <rect x="25" y="632" width="210" height="46" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="130" y="651" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="ui-sans-serif,sans-serif">Pre-Workout Glycogen Top-up</text>
                <text x="130" y="665" textAnchor="middle" fill="#9AAEAE" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Fast banana/dates 45m before</text>

                {/* ── Track B: Post-Workout & Lunch ── */}
                <rect x="275" y="564" width="210" height="48" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="380" y="583" textAnchor="middle" fill="#F5FAFA" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">B. Post-Workout &amp; Lunch</text>
                <text x="380" y="599" textAnchor="middle" fill="#9AAEAE" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Rapid whey recovery + electrolytes</text>

                {/* Sub-step B2 */}
                <line x1="380" y1="612" x2="380" y2="632" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />
                <rect x="275" y="632" width="210" height="46" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="380" y="651" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="ui-sans-serif,sans-serif">High-Protein Clean Lunch</text>
                <text x="380" y="665" textAnchor="middle" fill="#9AAEAE" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Chicken/Paneer + Jasmine rice</text>

                {/* ── Track C: Snacks & Dinner ── */}
                <rect x="525" y="564" width="210" height="48" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="630" y="583" textAnchor="middle" fill="#F5FAFA" fontSize="11" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">C. Dinner &amp; Overnight Recovery</text>
                <text x="630" y="599" textAnchor="middle" fill="#9AAEAE" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Lean protein + leafy vegetables</text>

                {/* Sub-step C2 */}
                <line x1="630" y1="612" x2="630" y2="632" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />
                <rect x="525" y="632" width="210" height="46" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="630" y="651" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontWeight="600" fontFamily="ui-sans-serif,sans-serif">Slow Casein &amp; Healthy Fats</text>
                <text x="630" y="665" textAnchor="middle" fill="#9AAEAE" fontSize="9" fontFamily="ui-sans-serif,sans-serif">Almonds/Greek yogurt before sleep</text>

                {/* ── Convergence Lines from All 3 Tracks ── */}
                <line x1="130" y1="678" x2="130" y2="710" stroke="#2DD4BF" strokeWidth="1.5" />
                <line x1="380" y1="678" x2="380" y2="710" stroke="#2DD4BF" strokeWidth="1.5" />
                <line x1="630" y1="678" x2="630" y2="710" stroke="#2DD4BF" strokeWidth="1.5" />
                <line x1="130" y1="710" x2="630" y2="710" stroke="#2DD4BF" strokeWidth="1.5" />
                <line x1="380" y1="710" x2="380" y2="736" stroke="#2DD4BF" strokeWidth="1.5" markerEnd="url(#dt-arr)" />

                {/* ── Operational Execution: Real-time Hydration & Water Logging ── */}
                <rect x="180" y="736" width="400" height="50" rx="8" fill="#141D1E" stroke="#3A5050" strokeWidth="1.5" />
                <text x="380" y="755" textAnchor="middle" fill="#F5FAFA" fontSize="12" fontWeight="700" fontFamily="ui-sans-serif,sans-serif">Real-Time Hydration &amp; Water Intake Logging</text>
                <text x="380" y="771" textAnchor="middle" fill="#9AAEAE" fontSize="10" fontFamily="ui-sans-serif,sans-serif">3.5L target • Hourly notifications • Electrolyte balance monitoring</text>

                {/* Arrow down to Weekly Adaptation */}
                <line x1="380" y1="786" x2="380" y2="812" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#dt-arrG)" />

                {/* ── Weekly Weigh-in & Metabolic Auto-Adjustment ── */}
                <rect x="150" y="812" width="460" height="52" rx="10" fill="#0a2820" stroke="#4ade80" strokeWidth="2" />
                <text x="380" y="834" textAnchor="middle" fill="#4ade80" fontSize="12" fontWeight="800" fontFamily="ui-sans-serif,sans-serif">Weekly Weigh-in &amp; Metabolic Auto-Adjustment</text>
                <text x="380" y="852" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontFamily="ui-sans-serif,sans-serif">Weekly scale trend analysis • Automatic +100/-100 kcal recalibration</text>

                {/* Arrow down to Terminal */}
                <line x1="380" y1="864" x2="380" y2="890" stroke="#4ade80" strokeWidth="1.5" markerEnd="url(#dt-arrG)" />

                {/* ── TERMINAL: OPTIMAL NUTRITION ── */}
                <ellipse cx="380" cy="912" rx="130" ry="22" fill="#042018" stroke="#4ade80" strokeWidth="2.5" />
                <text x="380" y="917" textAnchor="middle" fill="#4ade80" fontSize="12" fontWeight="900" fontFamily="ui-sans-serif,sans-serif">OPTIMAL NUTRITIONAL PROGRESSION</text>
              </svg>
            </div>

            {/* Detailed 4-Stage Breakdown Cards */}
            <div className="p-6 border-t border-[#2A3A3A] space-y-4 bg-[#0E1415]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2DD4BF] mb-2">Detailed Nutritional Phases:</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#141D1E] border border-[#2A3A3A]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-md bg-[#2DD4BF]/20 text-[#2DD4BF] text-xs font-bold flex items-center justify-center">1</span>
                    <h4 className="font-bold text-white text-sm">Metabolic Profiling &amp; TDEE</h4>
                  </div>
                  <p className="text-xs text-[#9AAEAE] leading-relaxed">
                    Uses verified scientific formulas (Mifflin-St Jeor) incorporating age, sex, weight, height, and activity level to calculate exact Basal Metabolic Rate and Total Daily Energy Expenditure.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141D1E] border border-[#2A3A3A]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-md bg-[#2DD4BF]/20 text-[#2DD4BF] text-xs font-bold flex items-center justify-center">2</span>
                    <h4 className="font-bold text-white text-sm">Macronutrient Precision</h4>
                  </div>
                  <p className="text-xs text-[#9AAEAE] leading-relaxed">
                    Proteins are dialed in at 1.8-2.2g per kg of body weight to prevent catabolism. Clean complex carbohydrates fuel workouts, and healthy fats regulate hormone and testosterone production.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141D1E] border border-[#2A3A3A]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-md bg-[#2DD4BF]/20 text-[#2DD4BF] text-xs font-bold flex items-center justify-center">3</span>
                    <h4 className="font-bold text-white text-sm">Nutrient Timing &amp; 5 Meals</h4>
                  </div>
                  <p className="text-xs text-[#9AAEAE] leading-relaxed">
                    Food intake is distributed across breakfast, pre-workout, post-workout, lunch, and dinner to maximize muscle protein synthesis and maintain stable blood sugar levels without afternoon crashes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141D1E] border border-[#2A3A3A]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-6 h-6 rounded-md bg-[#2DD4BF]/20 text-[#2DD4BF] text-xs font-bold flex items-center justify-center">4</span>
                    <h4 className="font-bold text-white text-sm">Weekly Auto-Recalibration</h4>
                  </div>
                  <p className="text-xs text-[#9AAEAE] leading-relaxed">
                    Plateaus are broken automatically. If weight loss slows below target rates for two consecutive weigh-ins, the AI dynamically trims 100-150 daily calories or boosts step count guidance.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 bg-[#141D1E] border-t border-[#2A3A3A]">
              <div className="text-xs text-[#9AAEAE]">
                Ready to track your daily macros and calories?
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/register/customer"
                  onClick={() => setShowDietFlowchartModal(false)}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs transition-all text-center"
                >
                  Create Account &amp; Start Diet
                </Link>
                <button
                  onClick={() => setShowDietFlowchartModal(false)}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#1B2728] hover:bg-[#2A3A3A] text-white font-bold text-xs transition-all text-center border border-[#2A3A3A]"
                >
                  Close Flowchart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Modal */}
      {isFeaturesOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#141D1E]/80 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsFeaturesOpen(false)}
        >
          <div
            className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#2A3A3A] gap-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F5FAFA]">
                Everything You Need for a Smarter Fitness Journey
              </h2>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setIsFeaturesOpen(false)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer"
                  title="Back to Customer Portal"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Customer Portal</span>
                </button>
                <button
                  onClick={() => setIsFeaturesOpen(false)}
                  className="p-2 text-[#9AAEAE] hover:text-white hover:bg-[#0E1415] rounded-full transition-colors cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col lg:flex-row p-6 gap-8 h-full">
              {/* Sidebar Tabs */}
              <div className="w-full lg:w-1/3 flex flex-col space-y-4">
                {[
                  {
                    id: 'ai',
                    title: 'AI Coach',
                    icon: Bot,
                    items: [
                      'AI Fitness Analysis',
                      'Personalized Workout Recommendations',
                      'AI Diet Recommendations',
                      'Daily Fitness Routine',
                      'Progress-Based Recommendations'
                    ]
                  },
                  {
                    id: 'gym',
                    title: 'Gym Discovery',
                    icon: MapPin,
                    items: [
                      'Discover available gyms',
                      'View gym facilities',
                      'Equipment information',
                      'AC / Non-AC information',
                      'Offers',
                      'Ratings & Reviews',
                      'Compare and choose suitable gyms'
                    ]
                  },
                  {
                    id: 'trainer',
                    title: 'Human Trainers',
                    icon: User,
                    items: [
                      'Online Trainers',
                      'Offline Trainers',
                      'Trainer Expertise',
                      'Trainer Availability',
                      'Personalized Workout Guidance',
                      'Diet Guidance',
                      'Trainer-based Progress Tracking'
                    ]
                  }
                ].map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => setActiveFeatureTab(tab.id as any)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                      activeFeatureTab === tab.id
                        ? 'border-[#2DD4BF] bg-[#0E1415] shadow-lg shadow-[#2DD4BF]/10'
                        : 'border-transparent bg-[#0E1415] hover:border-[#2A3A3A]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-xl ${activeFeatureTab === tab.id ? 'bg-[#2DD4BF] text-white' : 'bg-[#1B2728] text-[#9AAEAE]'}`}>
                        <tab.icon size={24} />
                      </div>
                      <h3 className={`text-lg font-bold ${activeFeatureTab === tab.id ? 'text-[#2DD4BF]' : 'text-[#F5FAFA]'}`}>
                        {tab.title}
                      </h3>
                    </div>
                    {activeFeatureTab === tab.id && (
                      <ul className="space-y-2 mt-4 animate-in slide-in-from-top-2 duration-300">
                        {tab.items.map((item, idx) => (
                          <li
                            key={idx}
                            className={`flex items-start space-x-2 text-sm transition-colors duration-300 ${
                              featureSlideIndex === idx ? 'text-[#2DD4BF] font-bold' : 'text-[#9AAEAE]'
                            }`}
                          >
                            <CheckCircle
                              size={16}
                              className={`${featureSlideIndex === idx ? 'text-[#2DD4BF]' : 'text-[#9AAEAE]'} shrink-0 mt-0.5 transition-colors`}
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Preview Area */}
              <div className="w-full lg:w-2/3 bg-[#0E1415] rounded-2xl border border-[#2A3A3A] flex items-center justify-center p-8 relative overflow-hidden">
                <FeaturePreview
                  tabId={activeFeatureTab}
                  slideIndex={featureSlideIndex}
                  items={
                    activeFeatureTab === 'ai'
                      ? ['AI Fitness Analysis', 'Personalized Workout Recommendations', 'AI Diet Recommendations', 'Daily Fitness Routine', 'Progress-Based Recommendations']
                      : activeFeatureTab === 'gym'
                      ? ['Discover available gyms', 'View gym facilities', 'Equipment information', 'AC / Non-AC information', 'Offers', 'Ratings & Reviews', 'Compare and choose suitable gyms']
                      : ['Online Trainers', 'Offline Trainers', 'Trainer Expertise', 'Trainer Availability', 'Personalized Workout Guidance', 'Diet Guidance', 'Trainer-based Progress Tracking']
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Customer Journey Interactive Tour Modal */}
      {isTourOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#080B0C]/90 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsTourOpen(false)}
        >
          <div
            className="relative w-full max-w-6xl bg-[#0E1415] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(45,212,191,0.18)] flex flex-col h-[85vh] border border-[#2A3A3A]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#2A3A3A] bg-[#141D1E] shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/15 flex items-center justify-center text-[#2DD4BF]">
                  <PlayCircle size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm sm:text-base tracking-wide uppercase">
                      Customer Fitness Journey
                    </span>
                    <span className="inline-block text-[11px] font-bold text-[#2DD4BF] bg-[#2DD4BF]/10 px-2.5 py-0.5 rounded-full border border-[#2DD4BF]/20">
                      Step {tourStep} of 13
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9AAEAE] hidden sm:block">
                    Interactive walkthrough of workouts, AI nutrition, trainer bookings, and progress tracking
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsTourOpen(false)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer"
                  title="Back to Customer Portal"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Customer Portal</span>
                </button>
                <button
                  onClick={() => setIsTourOpen(false)}
                  className="text-[#9AAEAE] hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-[#1B2728] rounded-full"
                  aria-label="Close Tour"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Slide Area */}
            <div className="flex-1 relative overflow-y-auto flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-[#0E1415] to-[#141D1E]">
              <TourSlide
                journey="customer"
                step={tourStep}
                setJourney={() => setTourStep(1)}
              />
            </div>

            {/* Step Controls Footer */}
            <div className="p-4 border-t border-[#2A3A3A] bg-[#141D1E] flex items-center justify-between shrink-0">
              <button
                onClick={() => setTourStep(s => (s > 1 ? s - 1 : 13))}
                className="px-4 py-2 rounded-xl bg-[#080B0C] border border-[#2A3A3A] text-[#9AAEAE] hover:text-white hover:border-[#2DD4BF] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Previous Step</span>
              </button>

              {/* Progress Dots */}
              <div className="hidden sm:flex items-center gap-1.5">
                {Array.from({ length: 13 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTourStep(i + 1)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      tourStep === i + 1 ? 'w-6 bg-[#2DD4BF]' : 'w-2 bg-[#2A3A3A] hover:bg-[#9AAEAE]'
                    }`}
                    title={`Step ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setTourStep(s => (s < 13 ? s + 1 : 1))}
                className="px-4 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>{tourStep === 13 ? 'Restart Journey' : 'Next Step'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortalLanding;
