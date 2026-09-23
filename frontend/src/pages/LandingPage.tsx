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
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [featuredGyms, setFeaturedGyms] = useState<any[]>([]);
  const [gymsLoading, setGymsLoading] = useState(true);
  
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
    <div className="min-h-screen bg-[#F5F3EE] text-[#202522] selection:bg-[#34483F] selection:text-black">
      {/* Navigation */}
      <nav className="border-b border-[#DCD9CD] bg-[#FFFFFF]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo — scrolls to top */}
          <button onClick={scrollToTop} className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-[#34483F] rounded-sm flex items-center justify-center">
              <Activity className="text-black" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#34483F]">AI GYM</span>
          </button>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#4A514D]">
            <button onClick={() => setIsFeaturesOpen(true)} className="hover:text-[#34483F] transition-colors">Features</button>
            <button onClick={() => { setTourJourney('select'); setTourStep(1); setIsTourOpen(true); }} className="hover:text-[#34483F] transition-colors">Video Tour</button>
            <a href="#gyms" className="hover:text-[#34483F] transition-colors">Gyms</a>
            <a href="#pricing" className="hover:text-[#34483F] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/login" id="nav-login" className="px-4 py-2 bg-[#34483F] text-white text-sm font-semibold rounded-lg hover:bg-[#C6A77D] transition-colors">
              Log In
            </Link>

            <Link to="/gyms" className="px-4 py-2 bg-[#34483F] text-white text-sm font-semibold rounded-lg hover:bg-[#C6A77D] transition-colors flex items-center space-x-2">
              <User size={14} />
              <span>Find a Gym</span>
            </Link>

            <Link to="/gym-owner-introduction" className="px-4 py-2 bg-[#34483F] text-white text-sm font-semibold rounded-lg hover:bg-[#C6A77D] transition-colors flex items-center space-x-2">
              <Activity size={14} />
              <span>Manage Your Gym</span>
            </Link>

            <Link to="/gyms" state={{ openEnquiry: true }} className="px-4 py-2 bg-gradient-to-r from-[#F59E0B] to-[#EF4444] text-white text-sm font-bold rounded-lg hover:from-[#D97706] hover:to-[#DC2626] transition-all shadow-md shadow-orange-300/40 flex items-center space-x-2">
              <span>Enquire Now</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#34483F]/10 via-[#F2EFE8]/0 to-[#F2EFE8]/0"></div>
          
          <span className="px-4 py-1.5 rounded-full bg-[#FFFFFF] border border-[#DCD9CD] text-[#34483F] text-sm font-medium inline-block mb-6">
            The Future of Fitness is Here
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
            Your Personal <span className="text-[#34483F]">AI Fitness Coach</span> <br className="hidden md:block"/> + Human Trainer
          </h1>
          <p className="text-lg md:text-xl text-[#4A514D] max-w-2xl mx-auto mb-10">
            Get personalized AI-generated workout and diet plans. Connect with professional trainers and discover the best gyms near you.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <Link to="/gyms" className="w-full sm:w-auto px-8 py-4 bg-[#34483F] text-[#202522] font-semibold rounded-xl hover:bg-[#C6A77D] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#34483F]/20">
              <span>Find a Gym</span>
              <ArrowRight size={20} />
            </Link>
            <Link to="/gym-owner-introduction" className="w-full sm:w-auto px-8 py-4 bg-[#34483F] text-[#202522] font-semibold rounded-xl hover:bg-[#C6A77D] transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#34483F]/20">
              <span>Manage Your Gym</span>
              <ArrowRight size={20} />
            </Link>
          </div>

          <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-[#DCD9CD] shadow-[0_0_50px_rgba(212,255,0,0.1)] relative">
            <img src="/images/hero.png" alt="Athlete working out" className="w-full h-auto object-cover aspect-[21/9]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F2EFE8] to-transparent"></div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="border-t border-[#DCD9CD] bg-[#FFFFFF] py-24" id="features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
              <p className="text-[#4A514D]">A complete ecosystem designed for members, trainers, and gym owners.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DCD9CD] hover:border-[#34483F]/50 transition-colors">
                <div className="w-12 h-12 bg-[#34483F]/10 rounded-xl flex items-center justify-center mb-6 text-[#34483F]">
                  <Bot size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Coach</h3>
                <p className="text-[#4A514D] leading-relaxed">
                  Advanced AI analyzes your profile to generate highly optimized, dynamic workout and diet plans tailored just for you.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DCD9CD] hover:border-[#22C55E]/50 transition-colors">
                <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center mb-6 text-[#22C55E]">
                  <User size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Human Trainers</h3>
                <p className="text-[#4A514D] leading-relaxed">
                  Need a push? Book certified online or offline personal trainers to guide your fitness journey and perfect your form.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#DCD9CD] hover:border-[#aa3bff]/50 transition-colors">
                <div className="w-12 h-12 bg-[#aa3bff]/10 rounded-xl flex items-center justify-center mb-6 text-[#aa3bff]">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Gym Discovery</h3>
                <p className="text-[#4A514D] leading-relaxed">
                  Search, filter, and join premium gyms near you. Manage your memberships, track daily attendance and never miss a beat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Video Tour Section */}
        <section className="py-24 relative overflow-hidden" id="video-tour">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">See the <span className="text-[#34483F]">Platform</span> in Action</h2>
                <p className="text-lg text-[#4A514D] mb-8">
                  Watch our quick tour to see how AI GYM seamlessly integrates AI planning, human coaching, and gym access all in one sleek app.
                </p>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2 text-[#34483F]">
                    <Star fill="currentColor" size={20} />
                    <span className="font-bold">4.9/5</span>
                  </div>
                  <span className="text-[#4A514D]">from 10k+ users</span>
                </div>
              </div>
              <div className="lg:w-1/2 w-full flex flex-col space-y-6">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => setActiveVideo('8Xg5g6yty3U')} // Placeholder main video
                >
                  <div className="absolute inset-0 bg-[#34483F] rounded-2xl transform translate-x-2 translate-y-2 opacity-20 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform"></div>
                  <div className="relative rounded-2xl overflow-hidden border border-[#DCD9CD] aspect-video bg-[#FFFFFF] flex items-center justify-center">
                    {/* Pseudo video placeholder using an image and play button */}
                    <img src="/images/app-mockup.png" alt="App Tour" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                    <div className="w-20 h-20 bg-[#34483F] rounded-full flex items-center justify-center text-black z-10 hover:scale-110 transition-transform shadow-[0_0_30px_rgba(212,175,55,0.5)]">
                      <PlayCircle size={40} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>

                {/* Related Videos */}
                <div>
                  <h3 className="text-[#202522] font-bold mb-3 flex items-center space-x-2">
                    <PlayCircle size={16} className="text-[#34483F]" />
                    <span>Related Videos</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { title: 'AI Diet Generation', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80', time: '2:15', videoId: 'UItWltVZZmE' },
                      { title: 'Booking a Trainer', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80', time: '1:45', videoId: 'CB3GgqjwGgg' },
                      { title: 'Gym Owner Dashboard', img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80', time: '3:30', videoId: 'X_s18h02Ewg' }
                    ].map((video, idx) => (
                      <div 
                        key={idx} 
                        className="group cursor-pointer"
                        onClick={() => setActiveVideo(video.videoId)}
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-[#DCD9CD] mb-2 bg-[#FFFFFF]">
                          <img src={video.img} alt={video.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircle size={24} className="text-[#34483F]" />
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-[#202522] text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {video.time}
                          </div>
                        </div>
                        <p className="text-xs text-[#4A514D] group-hover:text-[#34483F] transition-colors line-clamp-1 font-medium">{video.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* How It Works Section */}
        <section className="border-t border-[#DCD9CD] bg-[#FFFFFF] py-24" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-[#4A514D]">Your journey to peak fitness in 4 simple steps.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { step: '1', title: 'Create Profile', desc: 'Input your stats, goals, and experience level.', icon: User },
                { step: '2', title: 'AI Assessment', desc: 'Get a custom workout and diet plan instantly.', icon: Bot },
                { step: '3', title: 'Connect', desc: 'Find human trainers for extra motivation and form checks.', icon: Dumbbell },
                { step: '4', title: 'Track Progress', desc: 'Monitor your gains and stay on top of your daily routines.', icon: TrendingUp }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#FFFFFF] border border-[#DCD9CD] rounded-full flex items-center justify-center text-[#34483F] font-bold text-xl z-10 mb-6">
                    {item.step}
                  </div>
                  <item.icon size={32} className="text-[#4A514D] mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-[#4A514D] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Gyms */}
        <section className="py-24 relative overflow-hidden" id="gyms">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Discover Premium <span className="text-[#34483F]">Gyms</span></h2>
                <p className="text-[#4A514D] max-w-xl">Find and join the best fitness centers in your area. Use your AI GYM membership to access state-of-the-art facilities.</p>
              </div>
              <Link
                to="/gyms"
                className="hidden md:flex items-center space-x-2 text-[#34483F] hover:text-[#C6A77D] transition-colors font-semibold mt-4 md:mt-0"
              >
                <span>View All Gyms</span>
                <ArrowRight size={20} />
              </Link>
            </div>

            {gymsLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-[#34483F]" size={40} />
              </div>
            ) : featuredGyms.length === 0 ? (
              // Fallback placeholder cards if no gyms yet
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { name: 'Iron Forge Barbell', location: 'Downtown Metro', rating: 4.9, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop', tags: ['24/7 Access', 'Free Weights'] },
                  { name: 'Apex Athletics', location: 'Westside District', rating: 4.8, image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop', tags: ['CrossFit', 'Sauna'] },
                  { name: 'Velocity Fitness Studio', location: 'North Hills', rating: 4.7, image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1375&auto=format&fit=crop', tags: ['Cardio', 'Pool'] }
                ].map((gym, idx) => (
                  <div key={idx} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden group cursor-pointer hover:border-[#34483F]/50 transition-colors">
                    <div className="h-48 overflow-hidden relative">
                      <img src={gym.image} alt={gym.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-1 border border-[#DCD9CD]">
                        <Star size={14} className="text-[#34483F]" fill="currentColor" />
                        <span className="text-xs font-bold">{gym.rating}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1">{gym.name}</h3>
                      <div className="flex items-center space-x-1 text-[#4A514D] text-sm mb-4">
                        <MapPin size={14} />
                        <span>{gym.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gym.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-xs font-medium px-2 py-1 bg-[#E8E5DA] rounded-md text-[#4A514D]">{tag}</span>
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
                    className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden group hover:border-[#34483F]/60 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] transition-all duration-300 block"
                  >
                    <div className="h-48 overflow-hidden relative">
                      {gym.logo ? (
                        <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
                          <Activity size={48} className="text-[#E8E5DA]" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center space-x-1 border border-[#DCD9CD]">
                        <Star size={14} className="text-[#34483F]" fill="currentColor" />
                        <span className="text-white text-xs font-bold">{gym.rating || 4.5}</span>
                      </div>
                      {gym.gymType && (
                        <div className="absolute top-4 left-4 bg-[#34483F] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          {gym.gymType}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-[#34483F] transition-colors">{gym.name}</h3>
                      <div className="flex items-center space-x-1 text-[#4A514D] text-sm mb-4">
                        <MapPin size={14} className="text-[#34483F]" />
                        <span className="truncate">{gym.location?.address}, {gym.location?.city}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {(gym.facilities || []).slice(0, 2).map((tag: string, tIdx: number) => (
                          <span key={tIdx} className="text-xs font-medium px-2.5 py-1 bg-[#E8E5DA] rounded-md text-[#4A514D]">{tag}</span>
                        ))}
                        {gym.facilities?.length > 2 && (
                          <span className="text-xs font-medium px-2.5 py-1 bg-[#34483F]/10 text-[#34483F] rounded-md border border-[#34483F]/30">
                            +{gym.facilities.length - 2}
                          </span>
                        )}
                      </div>
                      <div className="pt-4 border-t border-[#DCD9CD] flex items-center justify-end">
                        <div className="px-5 py-2 bg-[#34483F]/10 text-[#34483F] group-hover:bg-[#34483F] group-hover:text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
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
              <Link to="/gyms" className="inline-flex items-center gap-2 text-[#34483F] hover:text-[#C6A77D] font-semibold">
                View All Gyms <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Platform Stats */}
        <section className="border-t border-[#DCD9CD] bg-gradient-to-br from-[#FFFFFF] to-[#F2EFE8] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[#E8E5DA]/50">
              {[
                { label: 'Active Members', value: '50K+' },
                { label: 'Partner Gyms', value: '1,200+' },
                { label: 'Certified Trainers', value: '800+' },
                { label: 'Workouts Logged', value: '2M+' }
              ].map((stat, idx) => (
                <div key={idx} className={`text-center ${idx % 2 === 0 ? 'pr-8' : 'pl-8 md:pl-0'} ${idx > 0 && idx % 2 === 0 ? 'pl-8 border-l-0 md:border-l' : ''}`}>
                  <div className="text-4xl md:text-5xl font-extrabold text-[#34483F] mb-2 tracking-tight">{stat.value}</div>
                  <div className="text-[#4A514D] font-medium text-sm md:text-base uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-[#34483F]/10 border border-[#34483F]/30 rounded-full px-4 py-1.5 text-[#34483F] text-xs font-bold uppercase tracking-widest mb-5">
                <span>SaaS Platform Pricing for Gyms</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Power Your Gym. Choose Your Plan.</h2>
              <p className="text-[#4A514D] mb-8 max-w-xl mx-auto">All plans give your gym access to the AI GYM platform. Scale as your gym grows.</p>
              
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <span className={`text-sm font-semibold transition-colors ${!isAnnual ? 'text-[#202522]' : 'text-[#A8ADA9]'}`}>Monthly</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  aria-pressed={isAnnual}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#34483F] focus:ring-offset-2 ${isAnnual ? 'bg-[#34483F]' : 'bg-[#CBD5E1]'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isAnnual ? 'translate-x-9' : 'translate-x-1'}`} />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold transition-colors ${isAnnual ? 'text-[#202522]' : 'text-[#A8ADA9]'}`}>Annual</span>
                  {isAnnual ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 text-xs px-3 py-1 rounded-full font-bold">🎁 2 months FREE — Save up to 25%</span>
                  ) : (
                    <span className="text-xs bg-[#F5F3EE] text-[#8FA89B] border border-[#DCD9CD] px-3 py-1 rounded-full">Switch to annual & save up to 25%</span>
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
                  defaultBorder: 'border-[#DCD9CD] border-dashed',
                  selBorder: 'border-[#8FA89B]',
                  selBar: 'bg-[#8FA89B]',
                  priceColor: 'text-[#202522]',
                  checkColor: 'text-[#8FA89B]',
                  btnDefault: 'bg-white border-2 border-[#DCD9CD] text-[#202522] hover:border-[#34483F]',
                  btnSelected: 'bg-[#8FA89B] text-white',
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
                  defaultBorder: 'border-[#DCD9CD]',
                  selBorder: 'border-[#8FA89B]',
                  selBar: 'bg-[#8FA89B]',
                  priceColor: 'text-[#8FA89B]',
                  checkColor: 'text-[#8FA89B]',
                  btnDefault: 'bg-white border-2 border-[#DCD9CD] text-[#202522] hover:border-[#8FA89B]',
                  btnSelected: 'bg-[#8FA89B] text-white',
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
                  defaultBorder: 'border-[#34483F] border-2',
                  selBorder: 'border-[#34483F]',
                  selBar: 'bg-[#34483F]',
                  priceColor: 'text-[#34483F]',
                  checkColor: 'text-[#34483F]',
                  btnDefault: 'bg-[#34483F] text-white hover:bg-[#C6A77D] shadow-lg shadow-green-200',
                  btnSelected: 'bg-[#34483F] text-white hover:bg-[#C6A77D]',
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
                  defaultBorder: 'border-purple-200',
                  selBorder: 'border-purple-500',
                  selBar: 'bg-purple-500',
                  priceColor: 'text-purple-600',
                  checkColor: 'text-purple-500',
                  btnDefault: 'bg-white border-2 border-purple-200 text-purple-700 hover:border-purple-500',
                  btnSelected: 'bg-purple-600 text-white',
                }
              ].map((plan, idx) => {
                const isSelected = selectedPlan === plan.key;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPlan(isSelected ? null : plan.key)}
                    className={`relative flex flex-col bg-white rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden border-2
                      ${
                        isSelected
                          ? `${(plan as any).selBorder} shadow-xl -translate-y-2`
                          : `${(plan as any).defaultBorder} hover:-translate-y-1 hover:shadow-lg`
                      }`}
                  >
                    {/* Green accent bar when selected */}
                    {isSelected && (
                      <div className={`h-1.5 w-full ${(plan as any).selBar}`} />
                    )}

                    {plan.popular && (
                      <div className="bg-[#34483F] text-white text-[10px] font-extrabold text-center py-1.5 uppercase tracking-widest">
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
                        <h3 className="text-base font-bold text-[#202522]">{plan.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          plan.popular ? 'bg-[#34483F]/10 text-[#34483F]' : 'bg-[#F5F3EE] text-[#8FA89B]'
                        }`}>{plan.badge}</span>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-black ${(plan as any).priceColor}`}>{plan.price}</span>
                          <span className="text-[#4A514D] text-sm">{plan.period}</span>
                        </div>
                        {(plan as any).annualTotal && <p className="text-[#4A514D] text-xs mt-0.5">{(plan as any).annualTotal}</p>}
                        {plan.savings && <p className="text-green-600 text-xs mt-1 font-semibold">{plan.savings}</p>}
                        {!isAnnual && !plan.trial && (
                          <p className="text-[#A8ADA9] text-xs mt-0.5">or save 25% with annual</p>
                        )}
                      </div>

                      <div className="bg-[#F2EFE8] rounded-xl px-3 py-2 mb-4 border border-[#DCD9CD]">
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5 text-[#4A514D]">Platform Limits</p>
                        <p className="text-xs text-[#202522] font-medium">{plan.limits}</p>
                      </div>

                      <ul className="space-y-1.5 mb-4 flex-1">
                        {plan.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2 text-xs text-[#202522]">
                            <CheckCircle size={13} className={`shrink-0 mt-0.5 ${(plan as any).checkColor}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.locked.map((feature, fIdx) => (
                          <li key={`locked-${fIdx}`} className="flex items-start gap-2 text-xs text-[#CBD5E1]">
                            <XCircle size={13} className="shrink-0 mt-0.5 text-[#E8E5DA]" />
                            <span className="line-through">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        to="/register/gym-owner"
                        onClick={e => e.stopPropagation()}
                        className={`w-full py-3 rounded-xl text-center font-bold transition-all text-sm block ${
                          isSelected
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
        <section className="border-t border-[#DCD9CD] bg-[#FFFFFF] py-24" id="testimonials">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Don't Just Take Our Word For It</h2>
              <p className="text-[#4A514D]">See what our community is saying about AI GYM.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Alex Johnson', role: 'Premium Member', text: 'The AI workout plans adjusted exactly to my home equipment. I lost 15lbs in two months without feeling overworked.' },
                { name: 'Sarah Miller', role: 'Certified Trainer', text: 'As a trainer, this platform helps me manage all my clients efficiently. The AI handles the basics while I focus on form and motivation.' },
                { name: 'David Chen', role: 'Gym Owner', text: 'Since listing our gym on AI GYM, our member acquisition has tripled. The management dashboard is incredibly intuitive.' }
              ].map((review, idx) => (
                <div key={idx} className="bg-[#FFFFFF] border border-[#DCD9CD] p-8 rounded-2xl relative">
                  <Quote className="absolute top-8 right-8 text-[#E8E5DA]" size={48} />
                  <div className="flex items-center space-x-1 mb-4 text-[#34483F]">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-[#4A514D] italic mb-6 relative z-10 leading-relaxed">"{review.text}"</p>
                  <div>
                    <h4 className="font-bold text-[#202522]">{review.name}</h4>
                    <span className="text-xs text-[#34483F] uppercase tracking-wider font-semibold">{review.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Detailed Footer */}
      <footer className="border-t border-[#DCD9CD] bg-[#FFFFFF] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              {/* Footer logo — scrolls to top */}
              <button onClick={scrollToTop} className="flex items-center space-x-2 mb-4 group">
                <div className="w-8 h-8 bg-[#34483F] rounded-sm flex items-center justify-center">
                  <Activity className="text-black" size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#34483F]">AI GYM</span>
              </button>
              <p className="text-[#4A514D] text-sm leading-relaxed mb-6">
                The ultimate fitness ecosystem combining AI intelligence with human expertise for unmatched results.
              </p>
              <div className="flex space-x-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#4A514D] hover:text-[#34483F] transition-colors"><FaInstagram size={20} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#4A514D] hover:text-[#34483F] transition-colors"><FaTwitter size={20} /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#4A514D] hover:text-[#34483F] transition-colors"><FaFacebook size={20} /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#4A514D] hover:text-[#34483F] transition-colors"><FaYoutube size={20} /></a>
              </div>
            </div>

            <div>
              <h4 className="text-[#202522] font-semibold mb-4">Navigate</h4>
              <ul className="space-y-2 text-sm text-[#4A514D]">
                <li><button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsFeaturesOpen(true); }} className="hover:text-[#34483F] transition-colors">Features</button></li>
                <li><button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTourJourney('select'); setTourStep(1); setIsTourOpen(true); }} className="hover:text-[#34483F] transition-colors">Video Tour</button></li>
                <li><a href="#gyms" className="hover:text-[#34483F] transition-colors">Gyms</a></li>
                <li><a href="#pricing" className="hover:text-[#34483F] transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#202522] font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#4A514D]">
                <li><Link to="/about" className="hover:text-[#34483F] transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-[#34483F] transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-[#34483F] transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-[#34483F] transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#202522] font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-[#4A514D]">
                <li><Link to="/login" className="hover:text-[#34483F] transition-colors">Log In</Link></li>
                <li><Link to="/register/customer" className="hover:text-[#34483F] transition-colors">Sign In (Register)</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-[#34483F] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="hover:text-[#34483F] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#DCD9CD] pt-8 text-center text-sm text-[#4A514D]">
            <p>&copy; {new Date().getFullYear()} AI GYM Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm" onClick={() => setActiveVideo(null)}>
          <div 
            className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-[#DCD9CD] shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-[#34483F] text-white hover:text-black rounded-full flex items-center justify-center transition-colors"
            >
              <X size={24} />
            </button>
            <iframe 
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`} 
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Features Modal */}
      {isFeaturesOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0F172A]/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsFeaturesOpen(false)}>
          <div className="bg-[#FFFFFF] rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-[#DCD9CD]">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#202522]">Everything You Need for a Smarter Fitness Journey</h2>
              <button onClick={() => setIsFeaturesOpen(false)} className="p-2 text-[#4A514D] hover:bg-[#F5F3EE] rounded-full transition-colors">
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
                  <div key={tab.id} onClick={() => setActiveFeatureTab(tab.id as any)} className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${activeFeatureTab === tab.id ? 'border-[#34483F] bg-[#F5F3EE] shadow-lg shadow-[#34483F]/10' : 'border-transparent bg-[#F2EFE8] hover:border-[#DCD9CD]'}`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-xl ${activeFeatureTab === tab.id ? 'bg-[#34483F] text-white' : 'bg-[#E8E5DA] text-[#4A514D]'}`}>
                        <tab.icon size={24} />
                      </div>
                      <h3 className={`text-lg font-bold ${activeFeatureTab === tab.id ? 'text-[#34483F]' : 'text-[#202522]'}`}>{tab.title}</h3>
                    </div>
                    {activeFeatureTab === tab.id && (
                      <ul className="space-y-2 mt-4 animate-in slide-in-from-top-2 duration-300">
                        {tab.items.map((item, idx) => (
                          <li key={idx} className={`flex items-start space-x-2 text-sm transition-colors duration-300 ${featureSlideIndex === idx ? 'text-[#34483F] font-bold' : 'text-[#4A514D]'}`}>
                            <CheckCircle size={16} className={`${featureSlideIndex === idx ? 'text-[#34483F]' : 'text-[#A8ADA9]'} shrink-0 mt-0.5 transition-colors`} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Preview Area */}
              <div className="w-full lg:w-2/3 bg-[#F2EFE8] rounded-2xl border border-[#DCD9CD] flex items-center justify-center p-8 relative overflow-hidden">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#0F172A]/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsTourOpen(false)}>
          <div className="relative w-full max-w-6xl bg-[#202522] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(22,163,74,0.15)] flex flex-col h-[85vh] border border-[#334155]" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#334155] bg-[#0F172A] shrink-0">
              <div className="flex items-center space-x-3">
                <PlayCircle className="text-[#34483F]" size={20} />
                <span className="font-bold text-white text-sm tracking-wide uppercase">
                  {tourJourney === 'select' ? 'Choose Your Journey' : tourJourney === 'customer' ? 'Customer Journey' : 'Gym Owner Journey'}
                </span>
              </div>
              <button onClick={() => setIsTourOpen(false)} className="text-[#A8ADA9] hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Slide Area */}
            <div className="flex-1 relative overflow-y-auto flex items-center justify-center p-8 bg-gradient-to-br from-[#202522] to-[#0F172A]">
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
