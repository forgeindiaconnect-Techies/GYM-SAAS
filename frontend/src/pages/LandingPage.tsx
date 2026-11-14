import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, User, Search, Utensils, MapPin, Activity, ArrowRight, ArrowLeft, PlayCircle, Star, CheckCircle, XCircle, TrendingUp, Dumbbell, Quote, X, Loader2, Building2, ShieldCheck, ChevronDown, Sparkles, UserCheck, Briefcase, Mail, Users, Headphones, Zap, Store } from 'lucide-react';
import { FaInstagram, FaTwitter, FaYoutube, FaFacebook } from 'react-icons/fa';
import api from '../utils/api';
import { FeaturePreview } from '../components/Landing/FeaturePreview';
import { TourSlide } from '../components/Landing/TourSlide';
import { TrainerRecruitmentSection } from '../components/Landing/TrainerRecruitmentSection';
import { AthleteSilhouette } from '../components/common/AthleteSilhouette';
import builderImg1 from '../assets/builder image 1.jpg';
import builderImg2 from '../assets/builder image 2.jpg';
import builderImg3 from '../assets/builder image 3.jpg';
import builderImg4 from '../assets/builder image 4.jpg';
import builderImg5 from '../assets/builder image 5.jpg';
import builderImg6 from '../assets/builder image 6.jpg';
import builderImg7 from '../assets/builder image 7.jpg';
import builderImg8 from '../assets/builder image 8.jpg';
import builderImg9 from '../assets/builder image 9.jpg';
import builderImg10 from '../assets/builder image 10.jpg';

const BUILDER_IMAGES = [
  { src: builderImg1, alt: 'Athlete Physique 1' },
  { src: builderImg2, alt: 'Athlete Physique 2' },
  { src: builderImg3, alt: 'Athlete Physique 3' },
  { src: builderImg4, alt: 'Athlete Physique 4' },
  { src: builderImg5, alt: 'Athlete Physique 5' },
  { src: builderImg6, alt: 'Athlete Physique 6' },
  { src: builderImg7, alt: 'Athlete Physique 7' },
  { src: builderImg8, alt: 'Athlete Physique 8' },
  { src: builderImg9, alt: 'Athlete Physique 9' },
  { src: builderImg10, alt: 'Athlete Physique 10' },
];
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const [featuredGyms, setFeaturedGyms] = useState<any[]>([]);
  const [gymsLoading, setGymsLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState<{
    activeMembers?: number;
    partnerGyms?: number;
    certifiedTrainers?: number;
    workoutsLogged?: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [communityReviews, setCommunityReviews] = useState<any[]>([]);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityFilter, setCommunityFilter] = useState<'all' | 'member' | 'trainer' | 'owner'>('all');
  const [communityCounts, setCommunityCounts] = useState<{ members: number; trainers: number; owners: number; total: number }>({ members: 0, trainers: 0, owners: 0, total: 0 });
  const [communityGrouped, setCommunityGrouped] = useState<{ members: any[]; trainers: any[]; owners: any[] }>({ members: [], trainers: [], owners: [] });

  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<'ai' | 'gym' | 'trainer'>('ai');
  const [featureSlideIndex, setFeatureSlideIndex] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourJourney, setTourJourney] = useState<'select' | 'customer' | 'owner'>('select');
  const [tourStep, setTourStep] = useState(1);

  const GYM_QUOTES = [
    "“The body achieves what the mind believes.”",
    "“Push harder than yesterday if you want a different tomorrow.”",
    "“Success starts with self-discipline and daily consistency.”",
    "“No shortcuts. Just work, sweat, and results.”",
  ];
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % GYM_QUOTES.length);
    }, 4500);
    return () => clearInterval(quoteTimer);
  }, []);

  const navigate = useNavigate();

  const handleBackToHome = () => {
    setActiveVideo(null);
    setIsTourOpen(false);
    setIsFeaturesOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFeaturesOpen(false);
        setIsTourOpen(false);
        setActiveVideo(null);
      }
    };

    if (isFeaturesOpen || isTourOpen || activeVideo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFeaturesOpen, isTourOpen, activeVideo]);

  useEffect(() => {
    window.scrollTo(0, 0);
    sessionStorage.removeItem('last_portal');

    api.get('/gyms/public')
      .then(res => setFeaturedGyms((res.data.gyms || []).slice(0, 3)))
      .catch(() => setFeaturedGyms([]))
      .finally(() => setGymsLoading(false));

    api.get('/gyms/platform-stats')
      .then(res => {
        if (res.data && res.data.success && res.data.stats) {
          setPlatformStats(res.data.stats);
        }
      })
      .catch(() => { })
      .finally(() => setStatsLoading(false));

    api.get('/gyms/community-testimonials')
      .then(res => {
        if (res.data && res.data.success) {
          setCommunityReviews(res.data.featured || []);
          setCommunityCounts(res.data.counts || { members: 0, trainers: 0, owners: 0, total: 0 });
          setCommunityGrouped({
            members: res.data.members || [],
            trainers: res.data.trainers || [],
            owners: res.data.owners || []
          });
        }
      })
      .catch(() => { })
      .finally(() => setCommunityLoading(false));
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTourOpen && tourJourney !== 'select') {
      interval = setInterval(() => {
        setTourStep(s => {
          const max = tourJourney === 'customer' ? 13 : 7;
          if (s < max) {
            return s + 1;
          } else {
            setIsTourOpen(false);
            return 1;
          }
        });
      }, 3500); // 3.5 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isTourOpen, tourJourney]);

  useEffect(() => {
    setFeatureSlideIndex(0);
  }, [activeFeatureTab]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isFeaturesOpen) {
      interval = setInterval(() => {
        let max = 0;
        if (activeFeatureTab === 'ai') max = 5;
        if (activeFeatureTab === 'gym') max = 7;
        if (activeFeatureTab === 'trainer') max = 7;

        if (featureSlideIndex < max - 1) {
          setFeatureSlideIndex(featureSlideIndex + 1);
        } else {
          if (activeFeatureTab === 'ai') setActiveFeatureTab('gym');
          else if (activeFeatureTab === 'gym') setActiveFeatureTab('trainer');
          else {
            setIsFeaturesOpen(false);
            setActiveFeatureTab('ai');
          }
        }
      }, 3500); // 3.5 seconds per sub-feature
    }
    return () => clearInterval(interval);
  }, [isFeaturesOpen, activeFeatureTab, featureSlideIndex]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/', { replace: true });
  };

  const formatStat = (num?: number) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M+`;
    if (num >= 10000) return `${(num / 1000).toFixed(0)}K+`;
    if (num >= 1000) return `${num.toLocaleString('en-IN')}+`;
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1F2937] selection:bg-[#C2410C] selection:text-[#FFFFFF] font-bold">
      {/* Sticky Navigation Bar (Appears smoothly when scrolled past hero section) */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-[#E2E8F0] bg-[#FFFFFF]/95 backdrop-blur-md shadow-sm ${
          isScrolled ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Left Brand */}
          <button onClick={scrollToTop} className="flex items-center space-x-2.5 group cursor-pointer shrink-0 select-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15">
              <Activity className="text-[#FFFFFF]" size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#111827] group-hover:text-[#EA580C] transition-colors">
              Gymora
            </span>
          </button>

          {/* Quick Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-[#4B5563]">
            <Link to="/portal/gym-owner" className="flex items-center gap-1.5 hover:text-[#EA580C] transition-colors">
              <Building2 size={16} className="text-[#EA580C]" />
              <span>Gym Owners</span>
            </Link>
            <Link to="/trainers" className="flex items-center gap-1.5 hover:text-[#EA580C] transition-colors">
              <Users size={16} className="text-[#EA580C]" />
              <span>Trainers</span>
            </Link>
            <Link to="/portal/customer" className="flex items-center gap-1.5 hover:text-[#EA580C] transition-colors">
              <User size={16} className="text-[#EA580C]" />
              <span>Customers</span>
            </Link>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              to="/login"
              id="nav-login"
              className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#111827] bg-white hover:bg-orange-50 border border-[#E5E7EB] transition-all shadow-sm flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95"
            >
              <User size={15} className="text-[#EA580C] shrink-0" />
              <span>Log In</span>
            </Link>

            <Link
              to="/gyms"
              state={{ openEnquiry: true }}
              className="px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5 shrink-0 whitespace-nowrap active:scale-95"
            >
              <span>Enquire Now</span>
              <ArrowRight size={15} className="text-white shrink-0" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Exact Reference Hero Section — Single, unified design with female athlete, male athlete, glass cards, and action buttons */}
      <main>
        <section className="relative w-full bg-[#FFFFFF] overflow-hidden">
          <div className="w-full relative select-none">
            {/* Ultra-HD 2048x1054 Razor-Sharp Artwork matching Reference Exactly */}
            <img
              src="/hero-reference-one-hd.png"
              alt="Gymora - Your Personal AI Fitness Coach + Human Trainer"
              className="w-full h-auto block object-cover"
              loading="eager"
            />

            {/* Clickable Overlay Hotspots aligned with 100% laser precision to image buttons */}

            {/* 1. Brand Logo (Top-Left) — Crisp Vector Logo */}
            <Link
              to="/"
              onClick={scrollToTop}
              title="Gymora Home"
              aria-label="Gymora Home"
              style={{ left: '4.69%', top: '3.60%', height: '6.50%' }}
              className="absolute flex items-center gap-[0.7vw] outline-none select-none z-10 hover:opacity-95 transition-opacity"
            >
              <div className="h-full aspect-square bg-gradient-to-br from-[#EA580C] to-[#F97316] rounded-[22%] flex items-center justify-center shadow-md shadow-orange-600/30">
                <Activity className="w-[60%] h-[60%] text-white stroke-[2.8]" />
              </div>
              <span className="font-extrabold text-[clamp(18px,2vw,32px)] tracking-tight text-[#0F172A]">
                Gymora
              </span>
            </Link>

            {/* 2-3. Top-Right: Log In and Enquire Now Buttons — Razor-Sharp Crisp Buttons */}
            <div
              style={{ top: '3.60%', right: '4.69%', height: '6.20%' }}
              className="absolute flex items-center gap-[0.85vw] z-10"
            >
              <Link
                to="/login"
                title="Log In"
                aria-label="Log In"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                className="h-full px-[1.6vw] rounded-full bg-white text-[#EA580C] font-bold text-[clamp(11px,1.15vw,16px)] flex items-center justify-center shadow-sm hover:bg-orange-50 active:scale-95 transition-all outline-none focus:outline-none focus:ring-0 select-none leading-none"
              >
                Log In
              </Link>

              <Link
                to="/gyms"
                state={{ openEnquiry: true }}
                title="Enquire Now"
                aria-label="Enquire Now"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                className="h-full px-[1.8vw] rounded-full bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white font-bold text-[clamp(11px,1.15vw,16px)] flex items-center justify-center gap-[0.5vw] shadow-md shadow-orange-950/20 hover:brightness-105 active:scale-95 transition-all outline-none focus:outline-none focus:ring-0 select-none leading-none"
              >
                <span>Enquire Now</span>
                <ArrowRight className="w-[1.1vw] h-[1.1vw] min-w-[13px] min-h-[13px] stroke-[2.5]" />
              </Link>
            </div>

            {/* Left Hero Content — 100% Vector Sharp, Beautifully Arranged 3-Line Typography */}
            <div
              style={{
                left: '4.69%',
                top: '16.50%',
                maxWidth: '38%',
              }}
              className="absolute hidden sm:flex flex-col select-none z-10"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-[1vw] py-[0.42vw] rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] font-bold text-[clamp(10px,0.95vw,15px)] w-fit mb-[1.2vw] shadow-xs">
                <Sparkles className="w-[1vw] h-[1vw] min-w-[13px] min-h-[13px]" />
                <span className="whitespace-nowrap">The Future of Fitness is Here</span>
              </div>

              {/* Main Headline — Exact 3-Line Structure without awkward breaks */}
              <h1 className="font-extrabold text-[clamp(24px,3.35vw,54px)] text-[#0F172A] tracking-tight leading-[1.08] mb-[1.2vw]">
                <span className="block whitespace-nowrap">Your Personal AI</span>
                <span className="block whitespace-nowrap text-[#EA580C]">Fitness Coach</span>
                <span className="block whitespace-nowrap">+ Human Trainer</span>
              </h1>

              {/* Subheadline — Perfectly constrained to never overlap athlete or shaker */}
              <p className="text-[#475569] font-medium text-[clamp(12px,1.15vw,18px)] leading-[1.48] max-w-[36vw]">
                Get personalized AI-generated workout and diet plans. Connect with professional trainers and discover the best gyms near you.
              </p>

              {/* Bold Gym Motivation Quote Callout */}
              <div className="mt-[1.3vw] flex items-center gap-[0.7vw] max-w-[36vw] px-[1.1vw] py-[0.55vw] rounded-2xl bg-gradient-to-r from-[#FFF7ED] via-[#FFEDD5]/60 to-[#FFF7ED] border border-[#FED7AA] shadow-xs">
                <div className="w-[1.9vw] h-[1.9vw] min-w-[24px] min-h-[24px] rounded-xl bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Quote className="w-[0.95vw] h-[0.95vw] min-w-[12px] min-h-[12px] fill-current" />
                </div>
                <p className="font-extrabold text-[clamp(11px,1.08vw,16px)] text-[#0F172A] tracking-tight leading-snug">
                  {GYM_QUOTES[currentQuoteIndex]}
                </p>
              </div>
            </div>

            {/* 4-6. Hero Role Buttons Row — Unified Flexbox with Perfect Alignment, Identical Heights & Equal Gaps */}
            <div
              style={{
                left: '4.69%',
                top: '76.20%',
                height: '7.60%',
              }}
              className="absolute hidden sm:flex items-center gap-[0.85vw]"
            >
              {/* Gym Owners */}
              <Link
                to="/portal/gym-owner"
                title="Gym Owners Portal"
                aria-label="Gym Owners Portal"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                className="h-full px-[1.5vw] rounded-full bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white flex items-center justify-center gap-[0.55vw] shadow-md shadow-orange-950/20 hover:brightness-105 active:scale-95 transition-all outline-none focus:outline-none focus:ring-0 select-none font-bold text-[clamp(11px,1.15vw,16px)] tracking-tight leading-none"
              >
                <Store className="w-[1.2vw] h-[1.2vw] min-w-[15px] min-h-[15px] max-w-[19px] max-h-[19px] shrink-0 stroke-[2.2]" />
                <span className="whitespace-nowrap">Gym Owners</span>
              </Link>

              {/* Trainers */}
              <Link
                to="/trainers"
                title="Trainers Portal"
                aria-label="Trainers Portal"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                className="h-full px-[1.5vw] rounded-full bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white flex items-center justify-center gap-[0.55vw] shadow-md shadow-orange-950/20 hover:brightness-105 active:scale-95 transition-all outline-none focus:outline-none focus:ring-0 select-none font-bold text-[clamp(11px,1.15vw,16px)] tracking-tight leading-none"
              >
                <Dumbbell className="w-[1.2vw] h-[1.2vw] min-w-[15px] min-h-[15px] max-w-[19px] max-h-[19px] shrink-0 stroke-[2.2]" />
                <span className="whitespace-nowrap">Trainers</span>
              </Link>

              {/* Customers */}
              <Link
                to="/portal/customer"
                title="Customers Portal"
                aria-label="Customers Portal"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                className="h-full px-[1.5vw] rounded-full bg-gradient-to-r from-[#EA580C] to-[#F97316] text-white flex items-center justify-center gap-[0.55vw] shadow-md shadow-orange-950/20 hover:brightness-105 active:scale-95 transition-all outline-none focus:outline-none focus:ring-0 select-none font-bold text-[clamp(11px,1.15vw,16px)] tracking-tight leading-none"
              >
                <Users className="w-[1.2vw] h-[1.2vw] min-w-[15px] min-h-[15px] max-w-[19px] max-h-[19px] shrink-0 stroke-[2.2]" />
                <span className="whitespace-nowrap">Customers</span>
              </Link>
            </div>
          </div>

          {/* Mobile Quick Action Touch Bar (ensures effortless tap access on smaller mobile devices) */}
          <div className="block sm:hidden px-4 py-3 bg-[#FFF7ED]/80 border-y border-[#FFEDD5]">
            <div className="grid grid-cols-3 gap-2">
              <Link
                to="/portal/gym-owner"
                className="flex flex-col items-center justify-center p-2.5 bg-[#EA580C] text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95"
              >
                <Store size={16} className="mb-1" />
                <span>Gym Owners</span>
              </Link>

              <Link
                to="/trainers"
                className="flex flex-col items-center justify-center p-2.5 bg-[#EA580C] text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95"
              >
                <Dumbbell size={16} className="text-white mb-1" />
                <span>Trainers</span>
              </Link>

              <Link
                to="/portal/customer"
                className="flex flex-col items-center justify-center p-2.5 bg-[#EA580C] text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95"
              >
                <Users size={16} className="text-white mb-1" />
                <span>Customers</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Choose Your Dedicated Portal Section */}
        <section className="border-t border-[#E2E8F0] bg-[#FFFFFF] pt-8 pb-16 sm:pt-10 sm:pb-20" id="portals">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] text-xs font-semibold inline-flex items-center gap-1.5 mb-4">
                <Sparkles size={13} />
                <span>Tailored Ecosystems</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mb-3">
                Choose Your Dedicated Portal
              </h2>
              <p className="text-sm sm:text-base text-[#64748B]">
                Access the specialized public environment built for your role—with dedicated tools, workflows, and instant sign-in.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Side: Related Platform Ecosystem Image */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-xl bg-[#FFFFFF] group h-full min-h-[340px] sm:min-h-[420px]">
                  <img 
                    src="/dedicated-portals.jpg" 
                    alt="Gymora Dedicated Portals Ecosystem" 
                    className="w-full h-full object-cover object-center block group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Right Side: 3 Dedicated Portal Cards */}
              <div className="lg:col-span-7 flex flex-col gap-4 justify-between">
                {/* Customer Portal Card */}
                <Link
                  to="/portal/customer"
                  className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FDBA74] rounded-2xl p-6 transition-colors group shadow-sm block flex-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors mb-1">Customer</h3>
                      <p className="text-sm text-[#64748B] leading-relaxed font-normal">
                        Your personalized digital fitness companion. Enjoy AI workout and diet generation, book 1-on-1 certified trainers, track progress milestones, and discover top gyms.
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Trainer Portal Card */}
                <Link
                  to="/trainers"
                  className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FDBA74] rounded-2xl p-6 transition-colors group shadow-sm block flex-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors mb-1">Trainer</h3>
                      <p className="text-sm text-[#64748B] leading-relaxed font-normal">
                        The dedicated career and coaching hub for fitness professionals. Showcase your certified expertise, explore gym opportunities, and guide clients towards their goals.
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Gym Owner Portal Card */}
                <Link
                  to="/portal/gym-owner"
                  className="bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FDBA74] rounded-2xl p-6 transition-colors group shadow-sm block flex-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors mb-1">Gym Owner</h3>
                      <p className="text-sm text-[#64748B] leading-relaxed font-normal">
                        The complete operational engine for fitness clubs. Manage members, trainer rosters, biometric/QR check-ins, offline POS sales, and automated financial reports.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trainer Recruitment & Careers Hub Section */}
        <TrainerRecruitmentSection />

        {/* 10 Builder Images Infinite Scrolling Section (Left to Right Automatically) */}
        <section className="py-20 border-t border-[#E2E8F0] bg-[#FFFFFF] overflow-hidden" id="athletes-showcase">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
            <span className="px-3.5 py-1.5 rounded-full bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] text-xs font-semibold inline-flex items-center gap-1.5 mb-3 shadow-xs">
              <Sparkles size={13} />
              <span>Real Athletes &amp; Peak Performance</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mb-3">
              Built for Every Fitness Ambition
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto">
              From elite physique conditioning to functional strength—join athletes, certified trainers, and premier gyms powered by Gymora.
            </p>
          </div>

          {/* Marquee Carousel Container with Gradient Edge Fades */}
          <div className="relative w-full overflow-hidden py-4">
            {/* Left Edge Gradient Fade */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#FFFFFF] to-transparent z-10" />
            {/* Right Edge Gradient Fade */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#FFFFFF] to-transparent z-10" />

            {/* Scrolling Track (duplicated for seamless infinite loop) */}
            <div className="animate-scroll-ltr flex items-center gap-5 sm:gap-6">
              {[...BUILDER_IMAGES, ...BUILDER_IMAGES].map((img, idx) => (
                <div
                  key={idx}
                  className="relative shrink-0 w-56 sm:w-64 h-72 sm:h-80 rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-md hover:shadow-xl transition-all duration-300 group select-none bg-[#F8FAFC]"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-bold px-2.5 py-1 rounded-md bg-[#C2410C]/90 shadow-sm">
                      Gymora Athlete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* Video Tour Section */}
        <section className="py-24 relative overflow-hidden bg-[#FFFFFF]" id="video-tour">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#111827]">See the <span className="text-[#EA580C]">Platform</span> in Action</h2>
                <p className="text-lg text-[#64748B] mb-8">
                  Watch our quick tour to see how Gymora seamlessly integrates AI planning, human coaching, and gym access all in one sleek app.
                </p>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2 text-[#EA580C]">
                    <Star fill="currentColor" size={20} />
                    <span className="font-bold text-[#111827]">4.9/5</span>
                  </div>
                  <span className="text-[#64748B]">from 10k+ verified gym users</span>
                </div>
              </div>
              <div className="lg:w-1/2 w-full flex flex-col space-y-6">
                <div
                  className="relative group cursor-pointer"
                  onClick={() => setActiveVideo({
                    url: 'vc1E5CfRfos',
                    title: 'Platform Overview & Tour'
                  })}
                >
                  <div className="absolute inset-0 bg-[#C2410C] rounded-2xl transform translate-x-2 translate-y-2 opacity-20 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform"></div>
                  <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] aspect-video bg-[#FFFFFF] flex items-center justify-center">
                    <img src="/images/app-mockup.png" alt="App Tour" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                    <div className="w-20 h-20 bg-[#C2410C] rounded-full flex items-center justify-center text-[#FFFFFF] font-bold z-10 hover:scale-110 transition-transform shadow-[0_0_30px_rgba(183,110,121,0.45)]">
                      <PlayCircle size={40} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>

                {/* Related Videos */}
                <div>
                  <h3 className="text-[#111827] font-bold mb-3 flex items-center space-x-2">
                    <PlayCircle size={16} className="text-[#EA580C]" />
                    <span>Related Videos</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        title: 'AI Diet Generation',
                        img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
                        time: '2:15',
                        url: 'cbKkB3POqaY'
                      },
                      {
                        title: 'Gym Owner Dashboard',
                        img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
                        time: '3:30',
                        url: 'vc1E5CfRfos'
                      }
                    ].map((video, idx) => (
                      <div
                        key={idx}
                        className="group cursor-pointer"
                        onClick={() => setActiveVideo({ url: video.url, title: video.title })}
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-[#E2E8F0] mb-2 bg-[#FFFFFF]">
                          <img src={video.img} alt={video.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle size={28} className="text-[#EA580C] drop-shadow-md" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            {video.time}
                          </div>
                        </div>
                        <p className="text-xs text-[#64748B] group-hover:text-[#EA580C] transition-colors line-clamp-1 font-semibold">{video.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-24" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#111827]">How It Works</h2>
              <p className="text-[#64748B]">Your journey to peak fitness in 4 simple steps.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { step: '1', title: 'Create Profile', desc: 'Input your stats, goals, and experience level.', icon: User },
                { step: '2', title: 'AI Assessment', desc: 'Get a custom workout and diet plan instantly.', icon: Bot },
                { step: '3', title: 'Connect', desc: 'Find human trainers for extra motivation and form checks.', icon: Dumbbell },
                { step: '4', title: 'Track Progress', desc: 'Monitor your gains and stay on top of your daily routines.', icon: TrendingUp }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#FFFFFF] border border-[#E2E8F0] rounded-full flex items-center justify-center text-[#EA580C] font-bold text-xl z-10 mb-6 shadow-md shadow-orange-500/15">
                    {item.step}
                  </div>
                  <item.icon size={32} className="text-[#64748B] mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-[#111827]">{item.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Gyms */}
        <section className="py-24 relative overflow-hidden bg-[#FFFFFF]" id="gyms">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#111827]">Discover Premium <span className="text-[#EA580C]">Gyms</span></h2>
                <p className="text-[#64748B] max-w-xl">Find and join the best fitness centers in your area. Use your Gymora membership to access state-of-the-art facilities.</p>
              </div>
              <Link
                to="/gyms"
                className="hidden md:flex items-center space-x-2 text-[#EA580C] hover:text-[#9A3412] transition-colors font-semibold mt-4 md:mt-0"
              >
                <span>View All Gyms</span>
                <ArrowRight size={20} />
              </Link>
            </div>

            {gymsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-[#EA580C]" size={40} />
              </div>
            ) : featuredGyms.length === 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { name: 'Iron Forge Barbell', location: 'Downtown Metro', rating: 4.9, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', tags: ['24/7 Access', 'Free Weights'] },
                  { name: 'Apex Athletics', location: 'Westside District', rating: 4.8, image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop', tags: ['CrossFit', 'Sauna'] },
                  { name: 'Velocity Fitness Studio', location: 'North Hills', rating: 4.7, image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1375&auto=format&fit=crop', tags: ['Cardio', 'Pool'] }
                ].map((gym, idx) => (
                  <div key={idx} className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden group cursor-pointer hover:border-[#FFEDD5] transition-colors">
                    <div className="h-48 overflow-hidden relative">
                      <img src={gym.image} alt={gym.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-1 border border-[#E2E8F0]">
                        <Star size={14} className="text-[#EA580C]" fill="currentColor" />
                        <span className="text-xs font-bold text-white">{gym.rating}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1 text-[#111827]">{gym.name}</h3>
                      <div className="flex items-center space-x-1 text-[#64748B] text-sm mb-4">
                        <MapPin size={14} className="text-[#EA580C]" />
                        <span>{gym.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gym.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-xs font-medium px-2 py-1 bg-[#F8FAFC] rounded-md text-[#64748B] border border-[#E2E8F0]">{tag}</span>
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
                    className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden group hover:border-[#FFEDD5] hover:shadow-[0_0_25px_rgba(183,110,121,0.2)] transition-all duration-300 block"
                  >
                    <div className="h-48 overflow-hidden relative">
                      {gym.logo ? (
                        <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#F8FAFC] to-[#F8FAFC] flex items-center justify-center">
                          <Activity size={48} className="text-[#EA580C]" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-[#E2E8F0]">
                        <Star size={14} className="text-[#EA580C]" fill="currentColor" />
                        <span className="text-white text-xs font-bold">{gym.rating || 4.5}</span>
                      </div>
                      {gym.gymType && (
                        <div className="absolute top-4 left-4 bg-[#C2410C] text-white font-bold text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                          {gym.gymType}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1 text-[#111827] group-hover:text-[#EA580C] transition-colors">{gym.name}</h3>
                      <div className="flex items-start space-x-1.5 text-[#64748B] text-sm mb-4">
                        <MapPin size={15} className="text-[#EA580C] shrink-0 mt-0.5" />
                        <div className="line-clamp-2 text-xs font-medium text-[#64748B]">
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
                          <span key={tIdx} className="text-xs font-medium px-2.5 py-1 bg-[#F8FAFC] rounded-md text-[#64748B] border border-[#E2E8F0]">{tag}</span>
                        ))}
                        {gym.facilities?.length > 2 && (
                          <span className="text-xs font-medium px-2.5 py-1 bg-[#FFF7ED] text-[#EA580C] rounded-md border border-[#FFEDD5]">
                            +{gym.facilities.length - 2}
                          </span>
                        )}
                      </div>
                      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end">
                        <div className="px-5 py-2 bg-[#C2410C] text-white font-bold rounded-xl text-sm font-bold transition-colors shadow-md shadow-orange-500/15 hover:bg-[#9A3412]">
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
              <Link to="/gyms" className="inline-flex items-center gap-2 text-[#EA580C] hover:text-[#9A3412] font-semibold">
                View All Gyms <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Platform Stats */}
        <section className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[#E2E8F0]">
              {[
                { label: 'Active Members', value: formatStat(platformStats?.activeMembers) },
                { label: 'Partner Gyms', value: formatStat(platformStats?.partnerGyms) },
                { label: 'Certified Trainers', value: formatStat(platformStats?.certifiedTrainers) },
                { label: 'Workouts Logged', value: formatStat(platformStats?.workoutsLogged) }
              ].map((stat, idx) => (
                <div key={idx} className={`text-center ${idx % 2 === 0 ? 'pr-8' : 'pl-8 md:pl-0'} ${idx > 0 && idx % 2 === 0 ? 'pl-8 border-l-0 md:border-l' : ''}`}>
                  <div className="text-4xl md:text-5xl font-extrabold text-[#EA580C] mb-2 tracking-tight">
                    {statsLoading ? (
                      <span className="inline-block animate-pulse text-[#CBD5E1]">...</span>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-[#64748B] font-medium text-sm md:text-base uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-[#FFFFFF]" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-[#FFF7ED] border border-[#FFEDD5] rounded-full px-4 py-1.5 text-[#EA580C] text-xs font-bold uppercase tracking-widest mb-5">
                <span>SaaS Platform Pricing for Gyms</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#111827]">Power Your Gym. Choose Your Plan.</h2>
              <p className="text-[#64748B] mb-8 max-w-xl mx-auto">All plans give your gym access to the Gymora platform. Scale as your gym grows.</p>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#111827]' : 'text-[#64748B]'}`}>Monthly</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  aria-pressed={isAnnual}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:ring-offset-2 ${isAnnual ? 'bg-[#C2410C]' : 'bg-[#E2E8F0]'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-[#FFFFFF] shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#111827]' : 'text-[#64748B]'}`}>Annual</span>
                  {isAnnual ? (
                    <span className="inline-flex items-center gap-1 bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] text-xs px-3 py-1 rounded-full font-bold">🎁 2 months FREE — Save up to 25%</span>
                  ) : (
                    <span className="text-xs bg-[#FFFFFF] text-[#EA580C] border border-[#E2E8F0] px-3 py-1 rounded-full">Switch to annual & save up to 25%</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
              {[
                {
                  key: 'FREE_TRIAL',
                  name: 'Free Trial', badge: '1 Day',
                  price: '₹0', period: '/ 1 day',
                  annualTotal: null,
                  limits: '10 members • 1 trainer • 1 branch',
                  features: ['Basic Gym Profile', 'Basic Member Management', 'Basic Attendance', 'Basic AI Fitness Assessment', '1 AI Workout Plan', 'Basic Diet Recommendation', 'Limited AI Chat', 'Basic Progress Tracking'],
                  locked: ['Advanced Analytics', 'Trainer Booking', '1-on-1 Coaching'],
                  savings: null, buttonText: 'Start Free Trial', popular: false, trial: true,
                  defaultBorder: 'border-[#E2E8F0] border-dashed',
                  selBorder: 'border-[#FDBA74]',
                  selBar: 'bg-[#C2410C]',
                  priceColor: 'text-[#111827]',
                  checkColor: 'text-[#EA580C]',
                  btnDefault: 'bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15',
                  btnSelected: 'bg-[#9A3412] text-white',
                },
                {
                  key: 'SILVER',
                  name: 'Silver', badge: 'Beginner',
                  price: isAnnual ? '₹7,190' : '₹799', period: isAnnual ? '/year' : '/mo',
                  annualTotal: isAnnual ? 'Equivalent to ₹599/mo' : null,
                  limits: '100 members • 5 trainers • 1 branch',
                  features: ['Gym Profile Management', 'Member Management', 'Trainer & Staff Management', 'AI Fitness Assessment', 'Basic AI Workout & Diet Plans', 'AI Chat Assistant', 'Basic Reports (3 types)', 'Membership Tracking'],
                  locked: ['Advanced Analytics', 'Trainer Booking', '1-on-1 Coaching'],
                  savings: isAnnual ? '💰 Save ₹1,598 vs monthly billing' : null, buttonText: 'Choose Silver', popular: false, trial: false,
                  defaultBorder: 'border-[#E2E8F0]',
                  selBorder: 'border-[#FDBA74]',
                  selBar: 'bg-[#C2410C]',
                  priceColor: 'text-[#111827]',
                  checkColor: 'text-[#EA580C]',
                  btnDefault: 'bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15',
                  btnSelected: 'bg-[#9A3412] text-white',
                },
                {
                  key: 'GOLD',
                  name: 'Gold', badge: 'Most Popular',
                  price: isAnnual ? '₹13,490' : '₹1,499', period: isAnnual ? '/year' : '/mo',
                  annualTotal: isAnnual ? 'Equivalent to ₹1,124/mo' : null,
                  limits: '500 members • 15 trainers • 2 branches',
                  features: ['Everything in Silver', 'Advanced AI Workout & Diet Plans', 'AI Fitness Assistant', 'Goal-Based Workout Recs', 'Trainer Discovery & Booking', 'Trainer Scheduling', 'Detailed Progress Analytics', 'Revenue & Membership Analytics'],
                  locked: ['1-on-1 Coaching', 'Live Trainer Sessions'],
                  savings: isAnnual ? '💰 Save ₹4,498 vs monthly billing' : null, buttonText: 'Choose Gold', popular: true, trial: false,
                  defaultBorder: 'border-[#FFEDD5] border-2',
                  selBorder: 'border-[#FDBA74]',
                  selBar: 'bg-[#C2410C]',
                  priceColor: 'text-[#111827]',
                  checkColor: 'text-[#EA580C]',
                  btnDefault: 'bg-[#C2410C] text-white font-bold hover:bg-[#9A3412] shadow-md shadow-orange-500/15',
                  btnSelected: 'bg-[#9A3412] text-white font-bold',
                },
                {
                  key: 'PREMIUM',
                  name: 'Premium', badge: 'Advanced',
                  price: isAnnual ? '₹22,490' : '₹2,499', period: isAnnual ? '/year' : '/mo',
                  annualTotal: isAnnual ? 'Equivalent to ₹1,874/mo' : null,
                  limits: 'Unlimited members & trainers • 5 branches',
                  features: ['Everything in Gold', '1-on-1 Online Coaching', 'Live Trainer Sessions', 'Priority Trainer Booking', 'AI + Trainer Hybrid Recs', 'Branch-wise Analytics', 'Member Retention Analytics', 'Priority Support & Monthly Review'],
                  locked: [],
                  savings: isAnnual ? '💰 Save ₹7,498 vs monthly billing' : null, buttonText: 'Choose Premium', popular: false, trial: false,
                  defaultBorder: 'border-[#E2E8F0]',
                  selBorder: 'border-[#FDBA74]',
                  selBar: 'bg-[#C2410C]',
                  priceColor: 'text-[#111827]',
                  checkColor: 'text-[#EA580C]',
                  btnDefault: 'bg-[#C2410C] text-white hover:bg-[#9A3412] shadow-md shadow-orange-500/15',
                  btnSelected: 'bg-[#9A3412] text-white',
                }
              ].map((plan, idx) => {
                const isSelected = selectedPlan === plan.key;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPlan(isSelected ? null : plan.key)}
                    className={`relative flex flex-col bg-[#FFFFFF] rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden border-2 text-[#1F2937]
                      ${isSelected
                        ? `${(plan as any).selBorder} shadow-2xl -translate-y-2 ring-1 ring-[#F97316]/50`
                        : `${(plan as any).defaultBorder} hover:-translate-y-1 hover:border-[#FFEDD5] hover:shadow-xl`
                      }`}
                  >
                    {/* Accent bar when selected */}
                    {isSelected && (
                      <div className={`h-1.5 w-full ${(plan as any).selBar}`} />
                    )}

                    {plan.popular && (
                      <div className="bg-[#C2410C] text-[#F8FAFC] text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest">
                        ⭐ Most Popular
                      </div>
                    )}

                    {isSelected && (
                      <div className={`absolute top-3 right-3 flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${(plan as any).selBar}`}>
                        <CheckCircle size={10} /> Selected
                      </div>
                    )}

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-[#111827]">{plan.name}</h3>
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-extrabold uppercase tracking-wider ${plan.popular
                            ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5] shadow-xs'
                            : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
                          }`}>
                          {plan.badge}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-black ${(plan as any).priceColor}`}>{plan.price}</span>
                          <span className="text-[#64748B] text-sm">{plan.period}</span>
                        </div>
                        {(plan as any).annualTotal && <p className="text-[#64748B] text-xs mt-0.5">{(plan as any).annualTotal}</p>}
                        {plan.savings && <p className="text-[#EA580C] text-xs mt-1 font-semibold">{plan.savings}</p>}
                        {!isAnnual && !plan.trial && (
                          <p className="text-[#64748B] text-xs mt-0.5">or save 25% with annual</p>
                        )}
                      </div>

                      <div className="bg-[#F8FAFC] rounded-xl px-3 py-2 mb-4 border border-[#E2E8F0]">
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5 text-[#64748B]">Platform Limits</p>
                        <p className="text-xs text-[#1F2937] font-medium">{plan.limits}</p>
                      </div>

                      <ul className="space-y-1.5 mb-4 flex-1">
                        {plan.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-[#1F2937]">
                            <CheckCircle size={13} className={`shrink-0 mt-0.5 ${(plan as any).checkColor}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.locked.map((feature, fIdx) => (
                          <li key={`locked-${fIdx}`} className="flex items-start gap-2 text-xs text-[#64748B]/60">
                            <XCircle size={13} className="shrink-0 mt-0.5 text-[#64748B]/40" />
                            <span className="line-through">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        to="/register/gym-owner"
                        onClick={e => e.stopPropagation()}
                        className={`w-full py-3 rounded-xl text-center font-bold transition-all text-sm block ${isSelected
                            ? (plan as any).btnSelected
                            : (plan as any).btnDefault
                          }`}
                      >
                        {plan.buttonText}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-24" id="testimonials">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-[#EA580C] text-xs font-bold uppercase tracking-widest mb-2 block">Real Community Feedback</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#111827]">Don't Just Take Our Word For It</h2>
              <p className="text-[#64748B] max-w-2xl mx-auto">See what our real gym owners, certified trainers, and active members are saying about Gymora.</p>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              <button
                onClick={() => setCommunityFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${communityFilter === 'all'
                    ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15'
                    : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
                  }`}
              >
                All Showcase ({communityCounts.total || 3})
              </button>
              <button
                onClick={() => setCommunityFilter('member')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${communityFilter === 'member'
                    ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15'
                    : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
                  }`}
              >
                Members ({communityCounts.members || 0})
              </button>
              <button
                onClick={() => setCommunityFilter('trainer')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${communityFilter === 'trainer'
                    ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15'
                    : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
                  }`}
              >
                Trainers ({communityCounts.trainers || 0})
              </button>
              <button
                onClick={() => setCommunityFilter('owner')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${communityFilter === 'owner'
                    ? 'bg-[#C2410C] text-white shadow-md shadow-orange-500/15'
                    : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] border border-[#E2E8F0]'
                  }`}
              >
                Gym Owners ({communityCounts.owners || 0})
              </button>
            </div>

            {/* Testimonial Cards */}
            {communityLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-[#EA580C]" size={36} />
              </div>
            ) : (() => {
              const currentReviews = (
                communityFilter === 'all'
                  ? (communityReviews.length > 0 ? communityReviews : [
                    { name: 'Alex Johnson', role: 'Premium Member', text: 'The AI workout plans adjusted exactly to my home equipment. I lost 15lbs in two months without feeling overworked.' },
                    { name: 'Sarah Miller', role: 'Certified Trainer', text: 'As a trainer, this platform helps me manage all my clients efficiently. The AI handles the basics while I focus on form and motivation.' },
                    { name: 'Arun FIC', role: 'GYM OWNER • PERFECT FITNESS STUDIO', text: 'Since listing Perfect Fitness Studio on Gymora, our member acquisition has tripled. The management dashboard and branch analytics are incredibly intuitive.' }
                  ])
                  : communityFilter === 'member'
                    ? communityGrouped.members
                    : communityFilter === 'trainer'
                      ? communityGrouped.trainers
                      : communityGrouped.owners
              );

              if (currentReviews.length === 0) {
                return (
                  <div className="text-center py-12 bg-[#FFFFFF] rounded-2xl border border-dashed border-[#E2E8F0] max-w-md mx-auto">
                    <p className="text-[#64748B] text-sm">No reviews found in this category yet.</p>
                  </div>
                );
              }

              return (
                <div className={`grid gap-8 ${
                  currentReviews.length === 1
                    ? 'max-w-md mx-auto grid-cols-1'
                    : currentReviews.length === 2
                      ? 'max-w-4xl mx-auto md:grid-cols-2'
                      : 'grid-cols-1 md:grid-cols-3'
                }`}>
                  {currentReviews.map((review: any, idx: number) => (
                    <div key={review.id || idx} className="bg-[#FFFFFF] border border-[#E2E8F0] p-8 rounded-2xl relative flex flex-col justify-between hover:border-[#FFEDD5] hover:shadow-xl transition-all">
                      <div>
                        <Quote className="absolute top-8 right-8 text-[#E2E8F0]" size={48} />
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={17}
                                className={
                                  s <= Math.round(review.rating || 5)
                                    ? 'text-[#EA580C] fill-[#F97316]'
                                    : 'text-[#E2E8F0] fill-transparent'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded-md border border-[#FFEDD5]">
                            {(Number(review.rating) || 5).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-[#64748B] italic mb-6 relative z-10 leading-relaxed">"{review.text}"</p>
                      </div>
                      <div className="pt-4 border-t border-[#E2E8F0]">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-[#111827] text-base">{review.name}</h4>
                            <span className="text-xs text-[#EA580C] uppercase tracking-wider font-semibold block mt-0.5">
                              {review.role}
                            </span>
                          </div>
                          {review.type === 'member' && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                              Verified Member
                            </span>
                          )}
                        </div>

                        {review.reviewedGym ? (
                          <span className="text-xs text-[#64748B] font-medium block mt-2.5 flex items-center gap-1.5 bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                            <CheckCircle size={14} className="text-[#EA580C] shrink-0" />
                            <span>Gym Review: <strong className="text-[#111827]">{review.reviewedGym}</strong>{review.gymLocation ? ` • ${review.gymLocation}` : ''}</span>
                          </span>
                        ) : review.reviewedBy ? (
                          <span className="text-xs text-[#64748B] font-medium block mt-2.5 flex items-center gap-1.5 bg-[#F8FAFC] p-2 rounded-lg border border-[#E2E8F0]">
                            <CheckCircle size={14} className="text-[#EA580C] shrink-0" />
                            <span>Client Review • <strong className="text-[#111827]">{review.reviewedBy}</strong></span>
                          </span>
                        ) : review.subtitle ? (
                          <span className="text-xs text-[#64748B] block mt-2">
                            {review.subtitle}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>
      </main>

      {/* Detailed Footer Replicated from Reference Design */}
      <footer className="relative overflow-hidden bg-[#FFFFFF] border-t border-[#E2E8F0] pt-14 pb-0 text-[#475569]">
        {/* Top-Left Ambient Warm Swoosh */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-[#EA580C]/15 via-orange-300/10 to-transparent rounded-full blur-3xl" />
        
        {/* Top-Right Warm Glow */}
        <div className="pointer-events-none absolute top-0 right-0 w-[520px] h-[420px] bg-gradient-to-bl from-orange-400/15 via-amber-300/10 to-transparent rounded-full blur-3xl" />
        
        {/* Right Athlete Silhouette Watermark */}
        <div className="pointer-events-none absolute right-0 bottom-10 w-72 sm:w-80 md:w-[380px] h-auto opacity-[0.14] select-none text-[#EA580C] overflow-hidden">
          <AthleteSilhouette className="w-full h-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10 mb-12 md:divide-x md:divide-[#E2E8F0]/70">
            {/* Column 1: Brand */}
            <div className="col-span-1 md:col-span-1 md:pr-8">
              {/* Footer logo — scrolls to top */}
              <button onClick={scrollToTop} className="flex items-center space-x-2.5 mb-4 group cursor-pointer text-left">
                <div className="w-9 h-9 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  <Activity className="text-white" size={20} strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-black tracking-tight text-[#111827]">Gymora</span>
              </button>
              <p className="text-[#475569] text-sm leading-relaxed mb-6 font-normal">
                The ultimate fitness ecosystem combining AI intelligence with human expertise for unmatched results.
              </p>
              {/* Circular dark social icons */}
              <div className="flex items-center space-x-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-[#EA580C] transition-all shadow-sm hover:scale-110" aria-label="Instagram">
                  <FaInstagram size={14} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-[#EA580C] transition-all shadow-sm hover:scale-110" aria-label="Twitter">
                  <FaTwitter size={14} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-[#EA580C] transition-all shadow-sm hover:scale-110" aria-label="Facebook">
                  <FaFacebook size={14} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-[#EA580C] transition-all shadow-sm hover:scale-110" aria-label="YouTube">
                  <FaYoutube size={14} />
                </a>
              </div>
            </div>

            {/* Column 2: Navigate */}
            <div className="md:px-8">
              <h4 className="text-[#111827] font-bold text-base mb-4 tracking-tight">Navigate</h4>
              <ul className="space-y-2.5 text-sm text-[#475569]">
                <li>
                  <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsFeaturesOpen(true); }} className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors cursor-pointer">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Features</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTourJourney('select'); setTourStep(1); setIsTourOpen(true); }} className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors cursor-pointer">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Video Tour</span>
                  </button>
                </li>
                <li>
                  <a href="#gyms" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Gyms</span>
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Pricing</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div className="md:px-8">
              <h4 className="text-[#111827] font-bold text-base mb-4 tracking-tight">Company</h4>
              <ul className="space-y-2.5 text-sm text-[#475569]">
                <li>
                  <Link to="/about" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Blog</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Contact</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Account */}
            <div className="md:pl-8">
              <h4 className="text-[#111827] font-bold text-base mb-4 tracking-tight">Account</h4>
              <ul className="space-y-2.5 text-sm text-[#475569]">
                <li>
                  <Link to="/login" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Log In</span>
                  </Link>
                </li>
                <li>
                  <Link to="/register/customer" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Sign In (Register)</span>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Privacy Policy</span>
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Terms of Service</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Arched Dark Bottom Copyright Bar */}
        <div className="relative w-full bg-[#0B132B] text-slate-300 pt-7 pb-6 mt-6">
          {/* Arched Top Orange Accent Curve */}
          <div className="absolute -top-3.5 left-0 right-0 h-4 overflow-hidden pointer-events-none">
            <svg viewBox="0 0 1200 30" preserveAspectRatio="none" className="w-full h-full fill-[#0B132B]">
              <path d="M0,30 Q600,0 1200,30 L1200,30 L0,30 Z" />
            </svg>
            <svg viewBox="0 0 1200 30" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full fill-none stroke-[#EA580C] stroke-[2.5]">
              <path d="M0,30 Q600,0 1200,30" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-4 text-xs font-medium">
            <div className="hidden sm:block flex-1 h-px bg-slate-700/60 max-w-xs" />
            <p className="text-center text-slate-300">
              &copy; {new Date().getFullYear()} <span className="text-[#FB923C] font-semibold">Gymora Technologies Inc.</span> All rights reserved.
            </p>
            <div className="hidden sm:block flex-1 h-px bg-slate-700/60 max-w-xs" />
          </div>
        </div>
      </footer>
      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 md:p-12 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={handleBackToHome}>
          {/* Fixed Back to Home Button on overlay */}
          <button
            onClick={handleBackToHome}
            className="fixed top-5 left-5 z-[110] flex items-center gap-2 px-4 py-2.5 bg-[#FFFFFF]/95 hover:bg-[#C2410C] text-[#111827] hover:text-[#FFFFFF] font-bold text-sm rounded-full border border-[#E2E8F0] hover:border-[#FDBA74] transition-all shadow-2xl backdrop-blur-md cursor-pointer group"
            title="Back to Home"
          >
            <ArrowLeft size={18} className="text-[#EA580C] group-hover:text-[#FFFFFF] group-hover:-translate-x-0.5 transition-all" />
            <span>Back to Home</span>
          </button>

          <div
            className="relative w-full max-w-4xl max-h-[85vh] my-auto bg-[#FFFFFF] rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-[#FFFFFF]/95 backdrop-blur-md gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <PlayCircle size={22} className="text-[#EA580C] shrink-0" />
                <h3 className="text-[#111827] font-bold text-sm sm:text-base truncate">{activeVideo.title}</h3>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md hover:shadow-teal-500/25 cursor-pointer"
                  title="Back to Home"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Home</span>
                </button>
                <a
                  href={activeVideo.url.startsWith('http') ? activeVideo.url : `https://www.youtube.com/watch?v=${activeVideo.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#111827] hover:text-[#C2410C] bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] px-3.5 py-1.5 rounded-full transition-colors font-medium"
                >
                  <span>Watch on YouTube</span>
                  <ArrowRight size={13} />
                </a>
                <button
                  onClick={handleBackToHome}
                  className="w-8 h-8 sm:w-9 sm:h-9 bg-[#FFFFFF] hover:bg-red-500/20 text-[#64748B] hover:text-[#B91C1C] border border-[#E2E8F0] hover:border-red-500/30 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  title="Close Video"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Video Player Box */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {activeVideo.url.endsWith('.mp4') ? (
                <video
                  src={activeVideo.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.url.replace('https://www.youtube.com/embed/', '').replace('https://youtu.be/', '')}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Features Modal */}
      {isFeaturesOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#FFFFFF]/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleBackToHome}>
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#E2E8F0] gap-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111827]">Everything You Need for a Smarter Fitness Journey</h2>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs sm:text-sm rounded-full transition-all shadow-md cursor-pointer"
                  title="Back to Home"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Home</span>
                </button>
                <button onClick={() => setIsFeaturesOpen(false)} className="p-2 text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] rounded-full transition-colors cursor-pointer">
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col lg:flex-row p-6 gap-8 h-full">
              {/* Sidebar Tabs */}
              <div className="w-full lg:w-1/3 flex flex-col space-y-4">
                {[
                  { id: 'ai', title: 'AI Coach', icon: Bot, items: ['AI Fitness Analysis', 'Personalized Workout Recommendations', 'AI Diet Recommendations', 'Daily Fitness Routine', 'Progress-Based Recommendations'] },
                  { id: 'gym', title: 'Gym Discovery', icon: MapPin, items: ['Discover available gyms', 'View gym facilities', 'Equipment information', 'AC / Non-AC information', 'Offers', 'Ratings & Reviews', 'Compare and choose suitable gyms'] },
                  { id: 'trainer', title: 'Human Trainers', icon: User, items: ['Online Trainers', 'Offline Trainers', 'Trainer Expertise', 'Trainer Availability', 'Personalized Workout Guidance', 'Diet Guidance', 'Trainer-based Progress Tracking'] }
                ].map((tab) => (
                  <div key={tab.id} onClick={() => setActiveFeatureTab(tab.id as any)} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${activeFeatureTab === tab.id ? 'border-[#FDBA74] bg-[#F8FAFC] shadow-lg shadow-orange-500/15' : 'border-transparent bg-[#F8FAFC] hover:border-[#E2E8F0]'}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-xl ${activeFeatureTab === tab.id ? 'bg-[#C2410C] text-white' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
                        <tab.icon size={24} />
                      </div>
                      <h3 className={`text-lg font-bold ${activeFeatureTab === tab.id ? 'text-[#EA580C]' : 'text-[#111827]'}`}>{tab.title}</h3>
                    </div>
                    {activeFeatureTab === tab.id && (
                      <ul className="space-y-2 mt-4 animate-in slide-in-from-top-2 duration-300">
                        {tab.items.map((item, idx) => (
                          <li key={idx} className={`flex items-start space-x-2 text-sm transition-colors duration-300 ${featureSlideIndex === idx ? 'text-[#EA580C] font-bold' : 'text-[#64748B]'}`}>
                            <CheckCircle size={16} className={`${featureSlideIndex === idx ? 'text-[#EA580C]' : 'text-[#64748B]'} shrink-0 mt-0.5 transition-colors`} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Preview Area */}
              <div className="w-full lg:w-2/3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] flex items-center justify-center p-8 relative overflow-hidden">
                <FeaturePreview
                  tabId={activeFeatureTab}
                  slideIndex={featureSlideIndex}
                  items={
                    activeFeatureTab === 'ai' ? ['AI Fitness Analysis', 'Personalized Workout Recommendations', 'AI Diet Recommendations', 'Daily Fitness Routine', 'Progress-Based Recommendations'] :
                      activeFeatureTab === 'gym' ? ['Discover available gyms', 'View gym facilities', 'Equipment information', 'AC / Non-AC information', 'Offers', 'Ratings & Reviews', 'Compare and choose suitable gyms'] :
                        ['Online Trainers', 'Offline Trainers', 'Trainer Expertise', 'Trainer Availability', 'Personalized Workout Guidance', 'Diet Guidance', 'Trainer-based Progress Tracking']
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Tour Modal */}
      {isTourOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#FFFFFF]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={handleBackToHome}>
          <div className="relative w-full max-w-6xl bg-[#FFFFFF] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(183,110,121,0.15)] flex flex-col h-[85vh] border border-[#E2E8F0]" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#E2E8F0] bg-[#FFFFFF] shrink-0">
              <div className="flex items-center space-x-3">
                <PlayCircle className="text-[#EA580C]" size={22} />
                <span className="font-bold text-[#111827] text-sm sm:text-base tracking-wide uppercase">
                  {tourJourney === 'select' ? 'Choose Your Journey' : tourJourney === 'customer' ? 'Customer Journey' : 'Gym Owner Journey'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer"
                  title="Back to Home"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Home</span>
                </button>
                <button onClick={() => setIsTourOpen(false)} className="text-[#64748B] hover:text-[#C2410C] transition-colors cursor-pointer p-1.5 hover:bg-[#FFF7ED] rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Slide Area */}
            <div className="flex-1 relative overflow-y-auto flex items-center justify-center p-8 bg-gradient-to-br from-[#FFFFFF] to-[#FFFFFF]">
              <TourSlide
                journey={tourJourney}
                step={tourStep}
                setJourney={(j) => { setTourJourney(j); setTourStep(1); }}
                onNavigate={(path) => {
                  setIsTourOpen(false);
                  navigate(path, { state: { openTour: true } });
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Verified unified hero banner matching reference target
export default LandingPage;
