import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star, MapPin, Search, Navigation, Filter, Check, Activity, Loader2, PlayCircle, Volume2, VolumeX, Menu, X, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import { CustomerEnquiryModal } from '../../components/CustomerEnquiryModal';

// Each slide has: a YouTube video ID (gym-specific) and matching title/description text
const HERO_SLIDES = [
  {
    videoId: 'cbKkB3POqaY',     // gym workout motivational
    title: 'Unleash Your',
    highlight: 'Inner Beast',
    subtitle: 'Find world-class gyms with elite equipment, certified trainers, and a community that pushes you further.',
  },
  {
    videoId: 'vc1E5CfRfos',     // gym tour / fitness centre
    title: 'Discover Premium',
    highlight: 'Fitness Centres',
    subtitle: 'Explore gyms with cutting-edge facilities, AC-equipped workout zones, and flexible membership plans.',
  },
  {
    videoId: '4wEDDHDpHjE',     // strength training / powerlifting
    title: 'Train Harder,',
    highlight: 'Achieve More',
    subtitle: 'Connect with professional trainers, track your progress, and reach your fitness goals faster than ever.',
  },
];

const GymMarketplace = () => {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationCity, setLocationCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [slideIdx, setSlideIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [enquiryGym, setEnquiryGym] = useState<{ id: string, name: string } | null>(null);
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();

  // If navigated here with openEnquiry state (from landing page "Enquire Now"), scroll to gyms
  useEffect(() => {
    if ((location.state as any)?.openEnquiry) {
      // Wait for gyms to load then scroll
      const tryScroll = (attempts = 0) => {
        const el = document.getElementById('gym-results');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else if (attempts < 10) {
          setTimeout(() => tryScroll(attempts + 1), 300);
        }
      };
      setTimeout(() => tryScroll(), 1200);
    }
  }, [location.state]);

  // Auto-cycle slides every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx(i => (i + 1) % HERO_SLIDES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchGyms(''); }, []);

  const fetchGyms = async (query: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      const res = await api.get(`/gyms/public?${params.toString()}`);
      setGyms(res.data.gyms || []);
    } catch (err) {
      console.error('Error fetching gyms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGyms(searchQuery);
    // Scroll to results section
    document.getElementById('gym-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode using OpenStreetMap Nominatim (free, no API key)
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geoData = await geoRes.json();
          const city =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
            geoData.address?.county ||
            '';
          if (city) {
            setLocationCity(city);
            setSearchQuery(city);
            fetchGyms(city);
            document.getElementById('gym-results')?.scrollIntoView({ behavior: 'smooth' });
          } else {
            alert('Could not detect your city. Please search manually.');
          }
        } catch {
          alert('Location detected but could not find nearby gyms. Please search manually.');
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          alert('Location access denied. Please allow location access in your browser settings and try again.');
        } else {
          alert('Could not get your location. Please search manually.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const toggleMute = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    // Reload with toggled mute parameter
    const newMuted = !muted;
    setMuted(newMuted);
    const slide = HERO_SLIDES[slideIdx];
    iframe.src = buildYouTubeURL(slide.videoId, newMuted);
  };

  const buildYouTubeURL = (videoId: string, isMuted: boolean) =>
    `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&iv_load_policy=3&start=5`;

  const scrollToGyms = () => {
    document.getElementById('gym-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentSlide = HERO_SLIDES[slideIdx];

  return (
    <div className="min-h-screen bg-[#F0FDFA]">

      {/* ===== HERO VIDEO SECTION ===== */}
      <div className="relative w-full h-screen overflow-hidden">

        {/* YouTube Video Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
          <iframe
            ref={iframeRef}
            key={`${slideIdx}-${muted}`}
            src={buildYouTubeURL(currentSlide.videoId, muted)}
            title="Gym Background Video"
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
            className="absolute"
            style={{
              width: '150vw',
              height: '150vh',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              border: 'none',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Strong dark gradient overlays — ensures text is always readable */}
        <div className="absolute inset-0 bg-black/65 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#F8FAFC] z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-[1]" />
        {/* Gold glow at center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.07)_0%,_transparent_65%)] z-[1] pointer-events-none" />

        {/* Slide transition indicator dots — bottom left */}
        <div className="absolute bottom-10 left-8 z-20 flex items-center gap-3">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`rounded-full transition-all duration-500 ${i === slideIdx ? 'w-8 h-2 bg-[#16A34A]' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`}
            />
          ))}
        </div>

        {/* Volume Control */}
        <button
          onClick={toggleMute}
          className="absolute bottom-10 right-8 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#1E293B] hover:bg-white/20 transition-all"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* ===== HERO CONTENT ===== */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">

          {/* Slide label badge */}
          <div
            key={`badge-${slideIdx}`}
            className="inline-flex items-center gap-2 bg-[#16A34A]/20 backdrop-blur-md border border-[#16A34A]/50 text-[#16A34A] text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase"
            style={{ animation: 'fadeInUp 0.7s ease' }}
          >
            <Star size={12} className="fill-current" />
            {slideIdx === 0 ? 'Motivation & Drive' : slideIdx === 1 ? 'Premium Facilities' : 'Professional Training'}
          </div>

          {/* Main Headline — changes with slide */}
          <h1
            key={`title-${slideIdx}`}
            className="text-5xl md:text-7xl xl:text-8xl font-extrabold text-[#1E293B] leading-tight tracking-tight drop-shadow-2xl mb-4"
            style={{ animation: 'fadeInUp 0.8s ease' }}
          >
            {currentSlide.title}
            <br />
            <span className="text-[#16A34A] relative inline-block">
              {currentSlide.highlight}
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#16A34A]/30 rounded-full blur-sm" />
            </span>
          </h1>

          {/* Subtitle — changes with slide */}
          <p
            key={`sub-${slideIdx}`}
            className="text-[#d0d0d0] text-base md:text-xl max-w-2xl mb-10 leading-relaxed font-light"
            style={{ animation: 'fadeInUp 0.9s ease' }}
          >
            {currentSlide.subtitle}
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-3xl"
            style={{ animation: 'fadeInUp 1s ease' }}
          >
            <div className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl p-2 shadow-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 text-[#475569]" size={20} />
                <input
                  type="text"
                  placeholder="Search gym, area, city or pincode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-4 py-3 text-[#1E293B] placeholder-[#888] outline-none text-base"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-[#16A34A] text-[#1E293B] font-extrabold rounded-xl hover:bg-[#f0c84a] transition-all shadow-[0_0_30px_rgba(212,175,55,0.5)] whitespace-nowrap text-sm tracking-wide"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick action pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-7" style={{ animation: 'fadeInUp 1.1s ease' }}>
            <button
              onClick={handleUseLocation}
              disabled={locationLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-[#1E293B] rounded-full hover:bg-white/20 transition-all text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {locationLoading ? (
                <><Loader2 size={15} className="animate-spin text-[#16A34A]" /> Detecting location...</>
              ) : (
                <><Navigation size={15} className="text-[#16A34A]" /> Use My Location</>
              )}
            </button>
            <div className="h-4 w-px bg-white/20" />
            <div className="text-sm text-[#475569]">
              <span className="text-[#1E293B] font-bold text-lg">{gyms.length > 0 ? `${gyms.length}+` : '—'}</span> Gyms Listed
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="text-sm text-[#475569]">
              <span className="text-[#1E293B] font-bold text-lg">100%</span> Verified
            </div>
          </div>
        </div>

        {/* Scroll Down Arrow */}
        <button
          onClick={scrollToGyms}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-[#475569] hover:text-[#16A34A] transition transition-colors"
          style={{ animation: 'bounce 2s infinite' }}
        >
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold">Explore Gyms</span>
          <ChevronDown size={22} />
        </button>
      </div>

      {/* Fade-in animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-8px); }
        }
      `}</style>

      {/* ===== GYM RESULTS SECTION ===== */}
      <div id="gym-results" className="max-w-7xl mx-auto px-4 py-16">

        {/* Sticky Search Bar */}
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-3 mb-10 shadow-xl sticky top-20 z-20">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={20} />
              <input
                type="text"
                placeholder="Search gym, area, city or pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e as any)}
                className="w-full bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl pl-12 pr-4 py-3 text-[#1E293B] focus:outline-none focus:border-[#16A34A] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleUseLocation}
              title="Near Me"
              disabled={locationLoading}
              className="shrink-0 p-3 bg-[#FFFFFF] border border-[#CCFBF1] text-[#475569] hover:text-[#16A34A] hover:border-[#16A34A] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {locationLoading ? (
                <Loader2 size={18} className="animate-spin text-[#16A34A]" />
              ) : (
                <Navigation size={18} />
              )}
              <span className="hidden lg:inline text-sm font-medium whitespace-nowrap">
                {locationLoading ? 'Detecting...' : 'Near Me'}
              </span>
            </button>
            <button
              type="submit"
              className="shrink-0 px-7 py-3 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors whitespace-nowrap text-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Header */}
        <div id="gym-results" className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1E293B]">
              {loading ? 'Searching...' : `${gyms.length} Gym${gyms.length !== 1 ? 's' : ''} Found`}
            </h2>
            <p className="text-[#475569] text-sm mt-1">
              {locationCity
                ? <span>Gyms near <span className="text-[#16A34A] font-semibold">{locationCity}</span></span>
                : 'Verified fitness centres ready for you'
              }
            </p>
          </div>
          {locationCity && (
            <button
              onClick={() => { setLocationCity(''); setSearchQuery(''); fetchGyms(''); }}
              className="text-xs text-[#475569] hover:text-[#16A34A] border border-[#CCFBF1] px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear Location ✕
            </button>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-28 gap-4">
            <Loader2 className="animate-spin text-[#16A34A]" size={48} />
            <p className="text-[#475569]">Finding the best gyms for you...</p>
          </div>
        ) : gyms.length === 0 ? (
          <div className="text-center py-28 bg-[#FFFFFF] rounded-2xl border border-[#CCFBF1]">
            <MapPin size={56} className="mx-auto text-[#E2E8F0] mb-4" />
            <h3 className="text-2xl font-bold text-[#1E293B] mb-2">No Gyms Found</h3>
            <p className="text-[#475569]">Try adjusting your search or filters to find gyms in your area.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => (
              <div
                key={gym._id}
                className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden hover:border-[#16A34A]/60 hover:shadow-[0_0_35px_rgba(212,175,55,0.1)] transition-all duration-400 group flex flex-col"
              >
                {/* Card image */}
                <div className="h-52 bg-[#FFFFFF] relative overflow-hidden">
                  {gym.logo ? (
                    <img
                      src={gym.logo}
                      alt={gym.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#FFFFFF]">
                      <Activity size={52} className="text-[#2a2a2a]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1 border border-white/10">
                    <Star size={13} className="text-[#16A34A] fill-[#EF4444]" />
                    <span className="text-white text-xs font-bold">{gym.rating || 4.5}</span>
                    {gym.reviewCount > 0 && <span className="text-white/70 text-[10px] ml-0.5">({gym.reviewCount})</span>}
                  </div>

                  {/* Gym type badge */}
                  {gym.gymType && (
                    <div className="absolute top-3 left-3 bg-[#16A34A] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow">
                      {gym.gymType}
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-[#1E293B] group-hover:text-[#16A34A] transition transition-colors mb-2 leading-snug">
                    {gym.name}
                  </h3>
                  <div className="flex items-start text-[#475569] text-sm mb-4">
                    <MapPin size={14} className="mr-1.5 shrink-0 mt-0.5 text-[#16A34A]" />
                    <span className="line-clamp-1">{gym.location?.address}, {gym.location?.city}</span>
                  </div>

                  {/* Facility tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {gym.facilities?.slice(0, 3).map((facility: string, idx: number) => (
                      <span key={idx} className="bg-[#FFFFFF] text-[#475569] text-xs px-2.5 py-1 rounded-lg border border-[#2e2e2e]">
                        {facility}
                      </span>
                    ))}
                    {gym.facilities?.length > 3 && (
                      <span className="bg-[#16A34A]/10 text-[#16A34A] text-xs px-2.5 py-1 rounded-lg border border-[#16A34A]/30 font-medium">
                        +{gym.facilities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Price + CTA */}
                  <div className="mt-auto pt-4 border-t border-[#2a2a2a] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-0.5">Starting from</p>
                      <p className="text-xl font-extrabold text-[#1E293B]">
                        ₹{gym.subscriptionPlans?.[0]?.price || '0'}
                        <span className="text-xs font-normal text-[#475569] ml-1">
                          /{gym.subscriptionPlans?.[0]?.duration || 'mo'}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/gyms/${gym._id}`}
                        className="px-5 py-2 text-center bg-[#FFFFFF] text-[#1E293B] hover:bg-[#16A34A] hover:text-white rounded-xl text-sm font-bold transition-all border border-[#CCFBF1] hover:border-[#16A34A]"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => setEnquiryGym({ id: gym._id, name: gym.name })}
                        className="px-5 py-2 text-center bg-[#16A34A] text-white hover:bg-[#15803D] rounded-xl text-sm font-bold transition-all border border-[#16A34A]"
                      >
                        Enquire Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomerEnquiryModal
        isOpen={!!enquiryGym}
        onClose={() => setEnquiryGym(null)}
        gymId={enquiryGym?.id || ''}
        gymName={enquiryGym?.name || ''}
      />
    </div>
  );
};

export default GymMarketplace;
