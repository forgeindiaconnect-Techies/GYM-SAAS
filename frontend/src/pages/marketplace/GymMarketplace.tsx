import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Star, MapPin, Search, Navigation, Activity, Loader2, Volume2, VolumeX, ChevronDown, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';
import { CustomerEnquiryModal } from '../../components/CustomerEnquiryModal';

// Each slide has: a YouTube video ID (gym-specific) and matching title/description text
const HERO_SLIDES = [
  {
    badge: 'Professional Training',
    videoId: 'auQHRD8MPys',     // strength training / powerlifting
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
  const [enquiryGym, setEnquiryGym] = useState<{ id: string, name: string } | null>(null);
  const [expandedFacilities, setExpandedFacilities] = useState<Record<string, boolean>>({});
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const location = useLocation();

  const returnPath: string = (location.state as any)?.from || '/portal/customer';
  const returnLabel: string = (location.state as any)?.fromLabel || (returnPath === '/' ? 'Back to Home' : 'Back to Customer');

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
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.state]);


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
    `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&iv_load_policy=3&playsinline=1&vq=hd1080&start=5`;

  const scrollToGyms = () => {
    document.getElementById('gym-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentSlide = HERO_SLIDES[slideIdx];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ===== HERO VIDEO SECTION ===== */}
      <div className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between">

        {/* Floating Top Header */}
        <header className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-8 py-5 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/70 via-black/25 to-transparent pt-safe">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15">
              <Activity className="text-[#FFFFFF]" size={22} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-[#EA580C] transition-colors drop-shadow-md">Gymora</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              to={returnPath} 
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15 flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>{returnLabel}</span>
            </Link>
          </div>
        </header>

        {/* YouTube Video Background with Enhanced Brightness & Clarity */}
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-[#0A0A0A]">
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
              filter: 'brightness(1.18) contrast(1.08) saturate(1.12)',
            }}
          />
        </div>

        {/* Soft, light overlays that preserve maximum video clarity and brightness */}
        <div className="absolute inset-0 bg-black/20 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-[#F8FAFC]/95 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/25 z-[1]" />
        {/* Subtle orange accent glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(234,88,12,0.06)_0%,_transparent_70%)] z-[1] pointer-events-none" />

        {/* Slide transition indicator dots — bottom left */}
        {HERO_SLIDES.length > 1 && (
          <div className="absolute bottom-10 left-8 z-20 flex items-center gap-3">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`rounded-full transition-all duration-500 ${i === slideIdx ? 'w-8 h-2 bg-[#C2410C]' : 'w-2 h-2 bg-[#FFFFFF]/30 hover:bg-[#FFFFFF]/60'}`}
              />
            ))}
          </div>
        )}

        {/* Volume Control */}
        <button
          onClick={toggleMute}
          className="absolute bottom-10 right-8 z-20 p-3 rounded-full bg-[#FFFFFF]/80 backdrop-blur-md border border-white/40 text-[#111827] hover:bg-white hover:text-[#EA580C] transition-all shadow-lg cursor-pointer"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* ===== HERO CONTENT ===== */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-28 sm:pt-32 md:pt-36 pb-20 sm:pb-24 max-w-5xl mx-auto my-auto w-full">

          {/* Slide label badge — comfortably spaced down */}
          <div
            key={`badge-${slideIdx}`}
            className="inline-flex items-center gap-2 bg-[#FFFFFF]/90 backdrop-blur-md border border-white/80 text-[#C2410C] text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-full mb-6 tracking-widest uppercase shadow-xl"
            style={{ animation: 'fadeInUp 0.7s ease' }}
          >
            <Star size={14} className="fill-current text-[#EA580C]" />
            <span>{currentSlide.badge}</span>
          </div>

          {/* Main Headline — pure white with drop shadows over bright video */}
          <h1
            key={`title-${slideIdx}`}
            className="text-4xl sm:text-6xl md:text-7xl font-black !text-[#FFFFFF] leading-[1.15] tracking-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)] mb-4 max-w-4xl"
            style={{ animation: 'fadeInUp 0.8s ease' }}
          >
            <span className="!text-[#FFFFFF] drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)]">{currentSlide.title}</span>
            <br />
            <span className="text-[#FF7A1A] drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)] relative inline-block font-black">
              {currentSlide.highlight}
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-[#FF7A1A]/90 rounded-full blur-xs" />
            </span>
          </h1>

          {/* Subtitle — crisp and readable with drop shadow */}
          <p
            key={`sub-${slideIdx}`}
            className="!text-[#FFFFFF] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] text-sm sm:text-base md:text-lg max-w-2xl mb-8 leading-relaxed font-semibold"
            style={{ animation: 'fadeInUp 0.9s ease' }}
          >
            {currentSlide.subtitle}
          </p>

          {/* Search Bar — solid white frosted card */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-3xl"
            style={{ animation: 'fadeInUp 1s ease' }}
          >
            <div className="flex flex-col sm:flex-row gap-2 bg-[#FFFFFF]/95 backdrop-blur-xl border border-white rounded-2xl p-2 shadow-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 text-[#64748B]" size={20} />
                <input
                  type="text"
                  placeholder="Search gym, area, city or pincode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-12 pr-4 py-3 text-[#111827] placeholder-[#64748B] outline-none text-base font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-extrabold rounded-xl transition-all shadow-md shadow-orange-500/25 whitespace-nowrap text-sm tracking-wide cursor-pointer"
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
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] backdrop-blur-md border border-white text-[#111827] rounded-full transition-all text-sm font-semibold shadow-lg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {locationLoading ? (
                <><Loader2 size={15} className="animate-spin text-[#EA580C]" /> Detecting location...</>
              ) : (
                <><Navigation size={15} className="text-[#EA580C]" /> Use My Location</>
              )}
            </button>
            <div className="h-4 w-px bg-white/40" />
            <div className="text-sm !text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] font-medium">
              <span className="!text-white font-bold text-lg">{gyms.length > 0 ? `${gyms.length}+` : '—'}</span> Gyms Listed
            </div>
            <div className="h-4 w-px bg-white/40" />
            <div className="text-sm !text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] font-medium">
              <span className="!text-white font-bold text-lg">100%</span> Verified
            </div>
          </div>
        </div>

        {/* Scroll Down Arrow */}
        <button
          onClick={scrollToGyms}
          className="relative z-20 mx-auto pb-6 flex flex-col items-center gap-1.5 text-white/70 hover:text-[#EA580C] transition-colors cursor-pointer"
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

        {/* Search Bar (Static in page flow) */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-3 mb-10 shadow-sm relative">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" size={20} />
              <input
                type="text"
                placeholder="Search gym, area, city or pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e as any)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-3 text-[#111827] placeholder:text-[#64748B] focus:outline-none focus:border-[#FDBA74] transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={handleUseLocation}
              title="Near Me"
              disabled={locationLoading}
              className="shrink-0 p-3 bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] hover:text-[#EA580C] hover:border-[#FDBA74] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {locationLoading ? (
                <Loader2 size={18} className="animate-spin text-[#EA580C]" />
              ) : (
                <Navigation size={18} />
              )}
              <span className="hidden lg:inline text-sm font-medium whitespace-nowrap">
                {locationLoading ? 'Detecting...' : 'Near Me'}
              </span>
            </button>
            <button
              type="submit"
              className="shrink-0 px-7 py-3 bg-[#C2410C] text-white font-extrabold rounded-xl hover:bg-[#9A3412] transition-colors whitespace-nowrap text-sm cursor-pointer shadow-md shadow-orange-500/15"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results Header */}
        <div id="gym-results" className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#111827]">
              {loading ? 'Searching...' : `${gyms.length} Gym${gyms.length !== 1 ? 's' : ''} Found`}
            </h2>
            <p className="text-[#64748B] text-sm mt-1">
              {locationCity
                ? <span>Gyms near <span className="text-[#EA580C] font-semibold">{locationCity}</span></span>
                : 'Verified fitness centres ready for you'
              }
            </p>
          </div>
          {locationCity && (
            <button
              onClick={() => { setLocationCity(''); setSearchQuery(''); fetchGyms(''); }}
              className="text-xs text-[#64748B] hover:text-[#EA580C] border border-[#E2E8F0] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Clear Location ✕
            </button>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-28 gap-4">
            <Loader2 className="animate-spin text-[#EA580C]" size={48} />
            <p className="text-[#64748B]">Finding the best gyms for you...</p>
          </div>
        ) : gyms.length === 0 ? (
          <div className="text-center py-28 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0]">
            <MapPin size={56} className="mx-auto text-[#64748B] mb-4" />
            <h3 className="text-2xl font-bold text-[#111827] mb-2">No Gyms Found</h3>
            <p className="text-[#64748B]">Try adjusting your search or filters to find gyms in your area.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map((gym) => (
              <div
                key={gym._id}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden hover:border-[#FFEDD5] hover:shadow-[0_0_35px_rgba(183,110,121,0.15)] transition-all duration-300 group flex flex-col"
              >
                {/* Card image */}
                <div className="h-52 bg-[#F8FAFC] relative overflow-hidden">
                  {gym.logo ? (
                    <img
                      src={gym.logo}
                      alt={gym.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFC]">
                      <Activity size={52} className="text-[#EA580C]/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1 border border-white/10">
                    <Star size={13} className="text-[#EA580C] fill-[#F97316]" />
                    <span className="text-[#111827] text-xs font-bold">{gym.rating || 4.5}</span>
                    {gym.reviewCount > 0 && <span className="text-[#111827] text-[10px] ml-0.5">({gym.reviewCount})</span>}
                  </div>

                  {/* Gym type badge */}
                  {gym.gymType && (
                    <div className="absolute top-3 left-3 bg-[#C2410C] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md">
                      {gym.gymType}
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors mb-2 leading-snug">
                      {gym.name}
                    </h3>
                    <div className="flex items-start text-[#111827] text-sm mb-3">
                      <MapPin size={14} className="mr-1.5 shrink-0 mt-0.5 text-[#EA580C]" />
                      <span className="line-clamp-2 text-xs font-medium text-[#111827]">
                        {[
                          gym.location?.address,
                          gym.location?.area,
                          gym.location?.city,
                          gym.location?.pinCode
                        ].filter(Boolean).join(', ') || 'Address not specified'}
                      </span>
                    </div>

                    {gym.branches && gym.branches.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-[#64748B] mb-1.5 uppercase tracking-wider">Other Branches:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {gym.branches.map((branch: any) => (
                            <span key={branch._id} className="bg-[#F8FAFC] text-[#EA580C] text-[10px] font-bold px-2 py-1 rounded-md border border-[#E2E8F0] flex items-center gap-1">
                              <MapPin size={10} /> {branch.location?.area || branch.location?.city || branch.branchName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Facility tags */}
                    <div className="flex flex-wrap gap-2 mb-6 items-center">
                      {(expandedFacilities[gym._id]
                        ? (gym.facilities || [])
                        : (gym.facilities || []).slice(0, 3)
                      ).map((facility: string, idx: number) => (
                        <span key={idx} className="bg-[#F8FAFC] text-[#111827] text-xs px-2.5 py-1 rounded-lg border border-[#E2E8F0] shadow-xs">
                          {facility}
                        </span>
                      ))}
                      {gym.facilities && gym.facilities.length > 3 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedFacilities(prev => ({
                              ...prev,
                              [gym._id]: !prev[gym._id]
                            }));
                          }}
                          className="bg-[#FFF7ED] hover:bg-[#FFF7ED] text-[#EA580C] text-xs px-2.5 py-1 rounded-lg border border-[#FFEDD5] font-semibold transition-colors cursor-pointer select-none inline-flex items-center gap-1 active:scale-95"
                          title={expandedFacilities[gym._id] ? "Show fewer facilities" : "Click to view all facilities"}
                        >
                          {expandedFacilities[gym._id]
                            ? 'Show less'
                            : `+${gym.facilities.length - 3} more`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="mt-auto pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-[#64748B] uppercase tracking-widest mb-0.5 font-bold">Starting from</p>
                      <p className="text-xl font-extrabold text-[#111827]">
                        ₹{gym.subscriptionPlans?.[0]?.price || '0'}
                        <span className="text-xs font-normal text-[#64748B] ml-1">
                          /{gym.subscriptionPlans?.[0]?.duration || 'mo'}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link
                        to={`/gyms/${gym._id}`}
                        className="px-4 py-2 text-center bg-[#F8FAFC] text-[#111827] hover:bg-[#C2410C] hover:text-[#FFFFFF] font-bold rounded-xl text-xs sm:text-sm transition-all border border-[#E2E8F0] hover:border-[#FDBA74] cursor-pointer"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => setEnquiryGym({ id: gym._id, name: gym.name })}
                        className="px-4 py-2 text-center bg-[#C2410C] text-white font-bold hover:bg-[#9A3412] rounded-xl text-xs sm:text-sm transition-all border border-[#FDBA74] cursor-pointer shadow-md shadow-orange-500/15"
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
