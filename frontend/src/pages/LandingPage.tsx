import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, User, MapPin, Activity, ArrowRight, PlayCircle, Star, CheckCircle, XCircle, TrendingUp, Dumbbell, Quote, X, Loader2 } from 'lucide-react';
import { FaInstagram, FaTwitter, FaYoutube, FaFacebook } from 'react-icons/fa';
import api from '../utils/api';
import { FeaturePreview } from '../components/Landing/FeaturePreview';
import { TourSlide } from '../components/Landing/TourSlide';

const LandingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const [featuredGyms, setFeaturedGyms] = useState<any[]>([]);
  const [gymsLoading, setGymsLoading] = useState(true);

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

  const navigate = useNavigate();

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
    api.get('/gyms/public')
      .then(res => setFeaturedGyms((res.data.gyms || []).slice(0, 3)))
      .catch(() => setFeaturedGyms([]))
      .finally(() => setGymsLoading(false));

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

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] selection:bg-[#6366F1] selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-[#292940] bg-[#0B0B12]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo — scrolls to top */}
          <button onClick={scrollToTop} className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-9 h-9 bg-[#6366F1] rounded-xl flex items-center justify-center shadow-md shadow-[#6366F1]/25">
              <Activity className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#FFFFFF]">Gymora</span>
          </button>

          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#A1A1AA]">
            <button onClick={() => setIsFeaturesOpen(true)} className="hover:text-[#FFFFFF] transition-colors cursor-pointer">Features</button>
            <button onClick={() => { setTourJourney('select'); setTourStep(1); setIsTourOpen(true); }} className="hover:text-[#FFFFFF] transition-colors cursor-pointer">Video Tour</button>
            <a href="#gyms" className="hover:text-[#FFFFFF] transition-colors">Gyms</a>
            <a href="#pricing" className="hover:text-[#FFFFFF] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/login" id="nav-login" className="px-4 py-2 bg-[#11111F] border border-[#292940] text-[#FFFFFF] text-sm font-bold rounded-xl hover:border-[#6366F1] transition-all shadow-sm flex items-center justify-center">
              Log In
            </Link>

            <Link to="/gyms" className="px-4 py-2 bg-[#6366F1] text-white text-sm font-bold rounded-xl hover:bg-[#4F46E5] transition-all flex items-center space-x-2 shadow-md shadow-[#6366F1]/25">
              <User size={14} />
              <span>Find a Gym</span>
            </Link>

            <Link to="/gym-owner-introduction" className="hidden sm:flex px-4 py-2 bg-[#11111F] border border-[#292940] text-white text-sm font-bold rounded-xl hover:border-[#6366F1] transition-all items-center space-x-2 shadow-sm">
              <Activity size={14} className="text-[#6366F1]" />
              <span>Manage Your Gym</span>
            </Link>

            <Link to="/gyms" state={{ openEnquiry: true }} className="px-4 py-2 bg-[#818CF8]/15 text-[#818CF8] border border-[#818CF8]/30 text-sm font-bold rounded-xl hover:bg-[#818CF8]/25 transition-all shadow-sm flex items-center space-x-2">
              <span>Enquire Now</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#6366F1]/15 via-[#050505]/0 to-[#050505]/0 pointer-events-none"></div>

          <span className="px-4 py-1.5 rounded-full bg-[#818CF8]/15 border border-[#818CF8]/30 text-[#818CF8] text-sm font-bold inline-block mb-6 shadow-xs">
            ✨ The Future of Fitness is Here
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-tight text-[#FFFFFF]">
            Your Personal <span className="text-[#6366F1]">AI Fitness Coach</span> <br className="hidden md:block" /> + Human Trainer
          </h1>
          <p className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-10">
            Get personalized AI-generated workout and diet plans. Connect with professional trainers and discover the best gyms near you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <Link to="/gyms" className="w-full sm:w-auto px-8 py-4 bg-[#6366F1] text-white font-bold rounded-xl hover:bg-[#4F46E5] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#6366F1]/25">
              <span>Find a Gym</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/gym-owner-introduction" className="w-full sm:w-auto px-8 py-4 bg-[#11111F] border border-[#292940] text-white font-bold rounded-xl hover:border-[#6366F1] transition-all flex items-center justify-center space-x-2 shadow-md">
              <span>Manage Your Gym</span>
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-[#292940] shadow-2xl shadow-black relative bg-[#11111F]">
            <img
              src="/images/hero.png"
              alt="Athlete working out"
              className="w-full h-auto max-h-[580px] object-cover object-center aspect-[16/10] sm:aspect-[16/9] block"
            />
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="border-t border-[#292940] bg-[#0B0B12] py-24" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#FFFFFF]">Everything You Need to Succeed</h2>
              <p className="text-[#A1A1AA]">A complete ecosystem designed for members, trainers, and gym owners.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[#11111F] p-8 rounded-2xl border border-[#292940] hover:border-[#6366F1]/50 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-[#6366F1]/15 rounded-xl flex items-center justify-center mb-6 text-[#6366F1]">
                  <Bot size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#FFFFFF]">AI Coach</h3>
                <p className="text-[#A1A1AA] leading-relaxed">
                  Advanced AI analyzes your profile to generate highly optimized, dynamic workout and diet plans tailored just for you.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#11111F] p-8 rounded-2xl border border-[#292940] hover:border-[#818CF8]/50 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-[#818CF8]/15 rounded-xl flex items-center justify-center mb-6 text-[#818CF8]">
                  <User size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#FFFFFF]">Human Trainers</h3>
                <p className="text-[#A1A1AA] leading-relaxed">
                  Need a push? Book certified online or offline personal trainers to guide your fitness journey and perfect your form.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#11111F] p-8 rounded-2xl border border-[#292940] hover:border-[#6366F1]/50 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-[#6366F1]/15 rounded-xl flex items-center justify-center mb-6 text-[#6366F1]">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#FFFFFF]">Gym Discovery</h3>
                <p className="text-[#A1A1AA] leading-relaxed">
                  Search, filter, and join premium gyms near you. Manage your memberships, track daily attendance and never miss a beat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Video Tour Section */}
        <section className="py-24 relative overflow-hidden bg-[#050505]" id="video-tour">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-[#FFFFFF]">See the <span className="text-[#6366F1]">Platform</span> in Action</h2>
                <p className="text-lg text-[#A1A1AA] mb-8">
                  Watch our quick tour to see how Gymora seamlessly integrates AI planning, human coaching, and gym access all in one sleek app.
                </p>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2 text-[#818CF8]">
                    <Star fill="currentColor" size={20} />
                    <span className="font-bold text-[#FFFFFF]">4.9/5</span>
                  </div>
                  <span className="text-[#A1A1AA]">from 10k+ verified gym users</span>
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
                  <div className="absolute inset-0 bg-[#6366F1] rounded-2xl transform translate-x-2 translate-y-2 opacity-20 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform"></div>
                  <div className="relative rounded-2xl overflow-hidden border border-[#292940] aspect-video bg-[#11111F] flex items-center justify-center">
                    <img src="/images/app-mockup.png" alt="App Tour" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                    <div className="w-20 h-20 bg-[#6366F1] rounded-full flex items-center justify-center text-white z-10 hover:scale-110 transition-transform shadow-[0_0_30px_rgba(99, 102, 241,0.45)]">
                      <PlayCircle size={40} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>

                {/* Related Videos */}
                <div>
                  <h3 className="text-[#FFFFFF] font-bold mb-3 flex items-center space-x-2">
                    <PlayCircle size={16} className="text-[#6366F1]" />
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
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-[#292940] mb-2 bg-[#11111F]">
                          <img src={video.img} alt={video.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle size={28} className="text-[#6366F1] drop-shadow-md" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                            {video.time}
                          </div>
                        </div>
                        <p className="text-xs text-[#A1A1AA] group-hover:text-[#6366F1] transition-colors line-clamp-1 font-semibold">{video.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-t border-[#292940] bg-[#0B0B12] py-24" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#FFFFFF]">How It Works</h2>
              <p className="text-[#A1A1AA]">Your journey to peak fitness in 4 simple steps.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { step: '1', title: 'Create Profile', desc: 'Input your stats, goals, and experience level.', icon: User },
                { step: '2', title: 'AI Assessment', desc: 'Get a custom workout and diet plan instantly.', icon: Bot },
                { step: '3', title: 'Connect', desc: 'Find human trainers for extra motivation and form checks.', icon: Dumbbell },
                { step: '4', title: 'Track Progress', desc: 'Monitor your gains and stay on top of your daily routines.', icon: TrendingUp }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#11111F] border border-[#292940] rounded-full flex items-center justify-center text-[#6366F1] font-bold text-xl z-10 mb-6 shadow-md shadow-[#6366F1]/10">
                    {item.step}
                  </div>
                  <item.icon size={32} className="text-[#A1A1AA] mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-[#FFFFFF]">{item.title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Gyms */}
        <section className="py-24 relative overflow-hidden bg-[#050505]" id="gyms">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#FFFFFF]">Discover Premium <span className="text-[#6366F1]">Gyms</span></h2>
                <p className="text-[#A1A1AA] max-w-xl">Find and join the best fitness centers in your area. Use your Gymora membership to access state-of-the-art facilities.</p>
              </div>
              <Link
                to="/gyms"
                className="hidden md:flex items-center space-x-2 text-[#6366F1] hover:text-[#4F46E5] transition-colors font-semibold mt-4 md:mt-0"
              >
                <span>View All Gyms</span>
                <ArrowRight size={20} />
              </Link>
            </div>

            {gymsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-[#6366F1]" size={40} />
              </div>
            ) : featuredGyms.length === 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { name: 'Iron Forge Barbell', location: 'Downtown Metro', rating: 4.9, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', tags: ['24/7 Access', 'Free Weights'] },
                  { name: 'Apex Athletics', location: 'Westside District', rating: 4.8, image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop', tags: ['CrossFit', 'Sauna'] },
                  { name: 'Velocity Fitness Studio', location: 'North Hills', rating: 4.7, image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1375&auto=format&fit=crop', tags: ['Cardio', 'Pool'] }
                ].map((gym, idx) => (
                  <div key={idx} className="bg-[#11111F] border border-[#292940] rounded-2xl overflow-hidden group cursor-pointer hover:border-[#6366F1]/50 transition-colors">
                    <div className="h-48 overflow-hidden relative">
                      <img src={gym.image} alt={gym.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-1 border border-[#292940]">
                        <Star size={14} className="text-[#818CF8]" fill="currentColor" />
                        <span className="text-xs font-bold text-white">{gym.rating}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1 text-[#FFFFFF]">{gym.name}</h3>
                      <div className="flex items-center space-x-1 text-[#A1A1AA] text-sm mb-4">
                        <MapPin size={14} className="text-[#6366F1]" />
                        <span>{gym.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gym.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-xs font-medium px-2 py-1 bg-[#17172A] rounded-md text-[#A1A1AA] border border-[#292940]">{tag}</span>
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
                    className="bg-[#11111F] border border-[#292940] rounded-2xl overflow-hidden group hover:border-[#6366F1]/60 hover:shadow-[0_0_25px_rgba(99, 102, 241,0.2)] transition-all duration-300 block"
                  >
                    <div className="h-48 overflow-hidden relative">
                      {gym.logo ? (
                        <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#0B0B12] to-[#17172A] flex items-center justify-center">
                          <Activity size={48} className="text-[#6366F1]" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-[#292940]">
                        <Star size={14} className="text-[#818CF8]" fill="currentColor" />
                        <span className="text-white text-xs font-bold">{gym.rating || 4.5}</span>
                      </div>
                      {gym.gymType && (
                        <div className="absolute top-4 left-4 bg-[#6366F1] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                          {gym.gymType}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1 text-[#FFFFFF] group-hover:text-[#6366F1] transition-colors">{gym.name}</h3>
                      <div className="flex items-start space-x-1.5 text-[#A1A1AA] text-sm mb-4">
                        <MapPin size={15} className="text-[#6366F1] shrink-0 mt-0.5" />
                        <div className="line-clamp-2 text-xs font-medium text-[#A1A1AA]">
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
                          <span key={tIdx} className="text-xs font-medium px-2.5 py-1 bg-[#17172A] rounded-md text-[#A1A1AA] border border-[#292940]">{tag}</span>
                        ))}
                        {gym.facilities?.length > 2 && (
                          <span className="text-xs font-medium px-2.5 py-1 bg-[#6366F1]/15 text-[#6366F1] rounded-md border border-[#6366F1]/30">
                            +{gym.facilities.length - 2}
                          </span>
                        )}
                      </div>
                      <div className="pt-4 border-t border-[#292940] flex items-center justify-end">
                        <div className="px-5 py-2 bg-[#6366F1] text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-[#6366F1]/20 hover:bg-[#4F46E5]">
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
              <Link to="/gyms" className="inline-flex items-center gap-2 text-[#6366F1] hover:text-[#4F46E5] font-semibold">
                View All Gyms <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Platform Stats */}
        <section className="border-t border-[#292940] bg-[#0B0B12] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[#292940]">
              {[
                { label: 'Active Members', value: '50K+' },
                { label: 'Partner Gyms', value: '1,200+' },
                { label: 'Certified Trainers', value: '800+' },
                { label: 'Workouts Logged', value: '2M+' }
              ].map((stat, idx) => (
                <div key={idx} className={`text-center ${idx % 2 === 0 ? 'pr-8' : 'pl-8 md:pl-0'} ${idx > 0 && idx % 2 === 0 ? 'pl-8 border-l-0 md:border-l' : ''}`}>
                  <div className="text-4xl md:text-5xl font-extrabold text-[#6366F1] mb-2 tracking-tight">{stat.value}</div>
                  <div className="text-[#A1A1AA] font-medium text-sm md:text-base uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-[#050505]" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-[#6366F1]/15 border border-[#6366F1]/30 rounded-full px-4 py-1.5 text-[#6366F1] text-xs font-bold uppercase tracking-widest mb-5">
                <span>SaaS Platform Pricing for Gyms</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#FFFFFF]">Power Your Gym. Choose Your Plan.</h2>
              <p className="text-[#A1A1AA] mb-8 max-w-xl mx-auto">All plans give your gym access to the Gymora platform. Scale as your gym grows.</p>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#FFFFFF]' : 'text-[#A1A1AA]'}`}>Monthly</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  aria-pressed={isAnnual}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2 ${isAnnual ? 'bg-[#6366F1]' : 'bg-[#292940]'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#FFFFFF]' : 'text-[#A1A1AA]'}`}>Annual</span>
                  {isAnnual ? (
                    <span className="inline-flex items-center gap-1 bg-[#818CF8]/15 text-[#818CF8] border border-[#818CF8]/30 text-xs px-3 py-1 rounded-full font-bold">🎁 2 months FREE — Save up to 25%</span>
                  ) : (
                    <span className="text-xs bg-[#11111F] text-[#818CF8] border border-[#292940] px-3 py-1 rounded-full">Switch to annual & save up to 25%</span>
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
                  defaultBorder: 'border-[#292940] border-dashed',
                  selBorder: 'border-[#6366F1]',
                  selBar: 'bg-[#6366F1]',
                  priceColor: 'text-[#FFFFFF]',
                  checkColor: 'text-[#6366F1]',
                  btnDefault: 'bg-[#11111F] border border-[#292940] text-white hover:border-[#6366F1] shadow-sm',
                  btnSelected: 'bg-[#6366F1] text-white',
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
                  defaultBorder: 'border-[#292940]',
                  selBorder: 'border-[#6366F1]',
                  selBar: 'bg-[#6366F1]',
                  priceColor: 'text-[#FFFFFF]',
                  checkColor: 'text-[#6366F1]',
                  btnDefault: 'bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-md shadow-[#6366F1]/20',
                  btnSelected: 'bg-[#4F46E5] text-white',
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
                  defaultBorder: 'border-[#818CF8]/50 border-2',
                  selBorder: 'border-[#818CF8]',
                  selBar: 'bg-[#818CF8]',
                  priceColor: 'text-[#FFFFFF]',
                  checkColor: 'text-[#818CF8]',
                  btnDefault: 'bg-[#818CF8] text-[#0B0B12] font-bold hover:bg-[#D4AF37] shadow-md shadow-[#818CF8]/20',
                  btnSelected: 'bg-[#D4AF37] text-[#0B0B12]',
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
                  defaultBorder: 'border-[#292940]',
                  selBorder: 'border-[#6366F1]',
                  selBar: 'bg-[#6366F1]',
                  priceColor: 'text-[#FFFFFF]',
                  checkColor: 'text-[#6366F1]',
                  btnDefault: 'bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-md shadow-[#6366F1]/20',
                  btnSelected: 'bg-[#4F46E5] text-white',
                }
              ].map((plan, idx) => {
                const isSelected = selectedPlan === plan.key;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPlan(isSelected ? null : plan.key)}
                    className={`relative flex flex-col bg-[#11111F] rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden border-2 text-[#FFFFFF]
                      ${isSelected
                        ? `${(plan as any).selBorder} shadow-2xl -translate-y-2 ring-1 ring-[#6366F1]/50`
                        : `${(plan as any).defaultBorder} hover:-translate-y-1 hover:border-[#6366F1]/50 hover:shadow-xl`
                      }`}
                  >
                    {/* Accent bar when selected */}
                    {isSelected && (
                      <div className={`h-1.5 w-full ${(plan as any).selBar}`} />
                    )}

                    {plan.popular && (
                      <div className="bg-[#818CF8] text-[#0B0B12] text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest">
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
                        <h3 className="text-base font-bold text-[#FFFFFF]">{plan.name}</h3>
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-extrabold uppercase tracking-wider ${plan.popular
                            ? 'bg-[#818CF8]/20 text-[#818CF8] border border-[#818CF8]/30 shadow-xs'
                            : 'bg-[#17172A] text-[#A1A1AA] border border-[#292940]'
                          }`}>
                          {plan.badge}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-black ${(plan as any).priceColor}`}>{plan.price}</span>
                          <span className="text-[#A1A1AA] text-sm">{plan.period}</span>
                        </div>
                        {(plan as any).annualTotal && <p className="text-[#A1A1AA] text-xs mt-0.5">{(plan as any).annualTotal}</p>}
                        {plan.savings && <p className="text-[#818CF8] text-xs mt-1 font-semibold">{plan.savings}</p>}
                        {!isAnnual && !plan.trial && (
                          <p className="text-[#A1A1AA] text-xs mt-0.5">or save 25% with annual</p>
                        )}
                      </div>

                      <div className="bg-[#0B0B12] rounded-xl px-3 py-2 mb-4 border border-[#292940]">
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5 text-[#A1A1AA]">Platform Limits</p>
                        <p className="text-xs text-[#FFFFFF] font-medium">{plan.limits}</p>
                      </div>

                      <ul className="space-y-1.5 mb-4 flex-1">
                        {plan.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-[#FFFFFF]">
                            <CheckCircle size={13} className={`shrink-0 mt-0.5 ${(plan as any).checkColor}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.locked.map((feature, fIdx) => (
                          <li key={`locked-${fIdx}`} className="flex items-start gap-2 text-xs text-[#A1A1AA]/60">
                            <XCircle size={13} className="shrink-0 mt-0.5 text-[#A1A1AA]/40" />
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
        <section className="border-t border-[#292940] bg-[#0B0B12] py-24" id="testimonials">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-[#6366F1] text-xs font-bold uppercase tracking-widest mb-2 block">Real Community Feedback</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#FFFFFF]">Don't Just Take Our Word For It</h2>
              <p className="text-[#A1A1AA] max-w-2xl mx-auto">See what our real gym owners, certified trainers, and active members are saying about Gymora.</p>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              <button
                onClick={() => setCommunityFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${communityFilter === 'all'
                    ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/25'
                    : 'bg-[#11111F] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#292940]'
                  }`}
              >
                All Showcase ({communityCounts.total || 3})
              </button>
              <button
                onClick={() => setCommunityFilter('member')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${communityFilter === 'member'
                    ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/25'
                    : 'bg-[#11111F] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#292940]'
                  }`}
              >
                Members ({communityCounts.members || 0})
              </button>
              <button
                onClick={() => setCommunityFilter('trainer')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${communityFilter === 'trainer'
                    ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/25'
                    : 'bg-[#11111F] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#292940]'
                  }`}
              >
                Trainers ({communityCounts.trainers || 0})
              </button>
              <button
                onClick={() => setCommunityFilter('owner')}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${communityFilter === 'owner'
                    ? 'bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/25'
                    : 'bg-[#11111F] text-[#A1A1AA] hover:text-[#FFFFFF] border border-[#292940]'
                  }`}
              >
                Gym Owners ({communityCounts.owners || 0})
              </button>
            </div>

            {/* Testimonial Cards */}
            {communityLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-[#6366F1]" size={36} />
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
                  <div className="text-center py-12 bg-[#11111F] rounded-2xl border border-dashed border-[#292940] max-w-md mx-auto">
                    <p className="text-[#A1A1AA] text-sm">No reviews found in this category yet.</p>
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
                    <div key={review.id || idx} className="bg-[#11111F] border border-[#292940] p-8 rounded-2xl relative flex flex-col justify-between hover:border-[#6366F1]/50 hover:shadow-xl transition-all">
                      <div>
                        <Quote className="absolute top-8 right-8 text-[#292940]" size={48} />
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex items-center space-x-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={17}
                                className={
                                  s <= Math.round(review.rating || 5)
                                    ? 'text-[#818CF8] fill-[#818CF8]'
                                    : 'text-[#292940] fill-transparent'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-[#818CF8] bg-[#818CF8]/15 px-2 py-0.5 rounded-md border border-[#818CF8]/30">
                            {(Number(review.rating) || 5).toFixed(1)}
                          </span>
                        </div>
                        <p className="text-[#A1A1AA] italic mb-6 relative z-10 leading-relaxed">"{review.text}"</p>
                      </div>
                      <div className="pt-4 border-t border-[#292940]">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-[#FFFFFF] text-base">{review.name}</h4>
                            <span className="text-xs text-[#6366F1] uppercase tracking-wider font-semibold block mt-0.5">
                              {review.role}
                            </span>
                          </div>
                          {review.type === 'member' && (
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30">
                              Verified Member
                            </span>
                          )}
                        </div>

                        {review.reviewedGym ? (
                          <span className="text-xs text-[#A1A1AA] font-medium block mt-2.5 flex items-center gap-1.5 bg-[#0B0B12] p-2 rounded-lg border border-[#292940]">
                            <CheckCircle size={14} className="text-[#6366F1] shrink-0" />
                            <span>Gym Review: <strong className="text-[#FFFFFF]">{review.reviewedGym}</strong>{review.gymLocation ? ` • ${review.gymLocation}` : ''}</span>
                          </span>
                        ) : review.reviewedBy ? (
                          <span className="text-xs text-[#A1A1AA] font-medium block mt-2.5 flex items-center gap-1.5 bg-[#0B0B12] p-2 rounded-lg border border-[#292940]">
                            <CheckCircle size={14} className="text-[#6366F1] shrink-0" />
                            <span>Client Review • <strong className="text-[#FFFFFF]">{review.reviewedBy}</strong></span>
                          </span>
                        ) : review.subtitle ? (
                          <span className="text-xs text-[#A1A1AA] block mt-2">
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

      {/* Detailed Footer */}
      <footer className="border-t border-[#292940] bg-[#0B0B12] pt-16 pb-8 text-[#A1A1AA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              {/* Footer logo — scrolls to top */}
              <button onClick={scrollToTop} className="flex items-center space-x-2 mb-4 group cursor-pointer">
                <div className="w-8 h-8 bg-[#6366F1] rounded-lg flex items-center justify-center shadow-md shadow-[#6366F1]/25">
                  <Activity className="text-white" size={18} />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#FFFFFF]">Gymora</span>
              </button>
              <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">
                The ultimate fitness ecosystem combining AI intelligence with human expertise for unmatched results.
              </p>
              <div className="flex space-x-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#6366F1] transition-colors"><FaInstagram size={20} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#6366F1] transition-colors"><FaTwitter size={20} /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#6366F1] transition-colors"><FaFacebook size={20} /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#A1A1AA] hover:text-[#6366F1] transition-colors"><FaYoutube size={20} /></a>
              </div>
            </div>

            <div>
              <h4 className="text-[#FFFFFF] font-semibold mb-4">Navigate</h4>
              <ul className="space-y-2 text-sm text-[#A1A1AA]">
                <li><button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsFeaturesOpen(true); }} className="hover:text-[#6366F1] transition-colors cursor-pointer">Features</button></li>
                <li><button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTourJourney('select'); setTourStep(1); setIsTourOpen(true); }} className="hover:text-[#6366F1] transition-colors cursor-pointer">Video Tour</button></li>
                <li><a href="#gyms" className="hover:text-[#6366F1] transition-colors">Gyms</a></li>
                <li><a href="#pricing" className="hover:text-[#6366F1] transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#FFFFFF] font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#A1A1AA]">
                <li><Link to="/about" className="hover:text-[#6366F1] transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-[#6366F1] transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-[#6366F1] transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#FFFFFF] font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-[#A1A1AA]">
                <li><Link to="/login" className="hover:text-[#6366F1] transition-colors">Log In</Link></li>
                <li><Link to="/register/customer" className="hover:text-[#6366F1] transition-colors">Sign In (Register)</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-[#6366F1] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-[#6366F1] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#292940] pt-8 text-center text-sm text-[#A1A1AA]">
            <p>&copy; {new Date().getFullYear()} Gymora Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 md:p-14 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setActiveVideo(null)}>
          <div
            className="relative w-full max-w-4xl max-h-[85vh] my-auto bg-[#1C1917] rounded-3xl overflow-hidden border border-[#292940]/20 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <PlayCircle size={22} className="text-[#6366F1]" />
                <h3 className="text-white font-bold text-sm sm:text-base truncate">{activeVideo.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={activeVideo.url.startsWith('http') ? activeVideo.url : `https://www.youtube.com/watch?v=${activeVideo.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#17172A] hover:text-[#11111F] bg-white/10 hover:bg-[#6366F1] px-3 py-1.5 rounded-full transition-colors font-medium"
                >
                  <span>Watch on YouTube</span>
                  <ArrowRight size={13} />
                </a>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="w-9 h-9 bg-white/10 hover:bg-[#6366F1] text-white hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer"
                  title="Close Video"
                >
                  <X size={20} />
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#11111F]/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsFeaturesOpen(false)}>
          <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#292940]">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#11111F]">Everything You Need for a Smarter Fitness Journey</h2>
              <button onClick={() => setIsFeaturesOpen(false)} className="p-2 text-[#A1A1AA] hover:bg-[#0B0B12] rounded-full transition-colors">
                <X size={24} />
              </button>
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
                  <div key={tab.id} onClick={() => setActiveFeatureTab(tab.id as any)} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${activeFeatureTab === tab.id ? 'border-[#6366F1] bg-[#0B0B12] shadow-lg shadow-[#6366F1]/10' : 'border-transparent bg-[#0B0B12] hover:border-[#292940]'}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-xl ${activeFeatureTab === tab.id ? 'bg-[#6366F1] text-white' : 'bg-[#17172A] text-[#A1A1AA]'}`}>
                        <tab.icon size={24} />
                      </div>
                      <h3 className={`text-lg font-bold ${activeFeatureTab === tab.id ? 'text-[#6366F1]' : 'text-[#11111F]'}`}>{tab.title}</h3>
                    </div>
                    {activeFeatureTab === tab.id && (
                      <ul className="space-y-2 mt-4 animate-in slide-in-from-top-2 duration-300">
                        {tab.items.map((item, idx) => (
                          <li key={idx} className={`flex items-start space-x-2 text-sm transition-colors duration-300 ${featureSlideIndex === idx ? 'text-[#6366F1] font-bold' : 'text-[#A1A1AA]'}`}>
                            <CheckCircle size={16} className={`${featureSlideIndex === idx ? 'text-[#6366F1]' : 'text-[#A1A1AA]'} shrink-0 mt-0.5 transition-colors`} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Preview Area */}
              <div className="w-full lg:w-2/3 bg-[#0B0B12] rounded-2xl border border-[#292940] flex items-center justify-center p-8 relative overflow-hidden">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#11111F]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsTourOpen(false)}>
          <div className="relative w-full max-w-6xl bg-[#11111F] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(22,125,120,0.15)] flex flex-col h-[85vh] border border-[#11111F]" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#11111F] bg-[#11111F] shrink-0">
              <div className="flex items-center space-x-3">
                <PlayCircle className="text-[#6366F1]" size={20} />
                <span className="font-bold text-white text-sm tracking-wide uppercase">
                  {tourJourney === 'select' ? 'Choose Your Journey' : tourJourney === 'customer' ? 'Customer Journey' : 'Gym Owner Journey'}
                </span>
              </div>
              <button onClick={() => setIsTourOpen(false)} className="text-[#A1A1AA] hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Slide Area */}
            <div className="flex-1 relative overflow-y-auto flex items-center justify-center p-8 bg-gradient-to-br from-[#11111F] to-[#11111F]">
              <TourSlide
                journey={tourJourney}
                step={tourStep}
                setJourney={(j) => { setTourJourney(j); setTourStep(1); }}
              />
            </div>


          </div>
        </div>
      )}

    </div>
  );
};

export default LandingPage;
