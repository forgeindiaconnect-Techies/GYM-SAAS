import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, Phone, Mail, Globe, CheckCircle2, Calendar, Dumbbell,
  Wind, Star, Navigation, ExternalLink, Target, Zap, Activity, Crown,
  Leaf, TrendingUp, Users, Cpu
} from 'lucide-react';
import api from '../../utils/api';

const BADGE_CONFIG: Record<string, { icon: any; accent: string; bg: string }> = {
  'Weight Loss':       { icon: Target,    accent: '#C43D4D', bg: 'rgba(239,68,68,0.1)'   },
  'Muscle Gain':       { icon: Dumbbell,  accent: '#A991D4', bg: 'rgba(249,115,22,0.1)'  },
  'Strength':          { icon: Zap,       accent: '#6366F1', bg: 'rgba(99,102,241,0.1)'  },
  'General Fitness':   { icon: Activity,  accent: '#27845A', bg: 'rgba(34,197,94,0.1)'   },
  'Bodybuilding':      { icon: Crown,     accent: '#967CC5', bg: 'rgba(234,88,12,0.12)'  },
  'Yoga':              { icon: Leaf,      accent: '#27845A', bg: 'rgba(16,185,129,0.1)'  },
  'CrossFit':          { icon: TrendingUp,accent: '#B77916', bg: 'rgba(245,158,11,0.1)'  },
  'Personal Training': { icon: Users,     accent: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  'Online Coaching':   { icon: Cpu,       accent: '#0EA5E9', bg: 'rgba(14,165,233,0.1)'  },
};

const defaultPackages = [
  {
    _id: 'default-pkg-strength',
    name: 'Strength',
    fitnessGoal: 'Strength',
    description: 'Improve your physical strength, power, and performance through resistance training and progressive overload.',
    trainingType: 'Offline',
    duration: '1 Month',
    monthlyPrice: 399,
    features: [
      'Strength-focused workout programs',
      'Progressive resistance training',
      'Strength performance tracking'
    ]
  },
  {
    _id: 'default-pkg-muscle',
    name: 'Muscle Gain',
    fitnessGoal: 'Muscle Gain',
    description: 'Build muscle mass and improve your physique with targeted strength training and progressive workouts.',
    trainingType: 'Online',
    duration: '1 Month',
    monthlyPrice: 599,
    features: [
      'Muscle-building workout programs',
      'Strength training',
      'Progressive overload training',
      'Muscle development progress tracking'
    ]
  },
  {
    _id: 'default-pkg-weightloss',
    name: 'weight Loss',
    fitnessGoal: 'Weight Loss',
    description: 'Focus on burning calories, reducing body fat, and improving overall fitness through structured workouts.',
    trainingType: 'Hybrid',
    duration: '1 Month',
    monthlyPrice: 499,
    features: [
      'Fat-loss workout programs',
      'Cardio training',
      'Strength training',
      'Weight and progress tracking'
    ]
  }
];

const MemberGymProfile = () => {
  const navigate = useNavigate();
  const [gym, setGym] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await api.get('/gyms/my-gym');
        const gymData = res.data.gym;
        setGym(gymData);

        if (gymData?._id) {
          try {
            const pkgRes = await api.get('/gym-packages/public', { params: { gymId: gymData._id } });
            if (pkgRes.data?.success && Array.isArray(pkgRes.data.packages) && pkgRes.data.packages.length > 0) {
              setPackages(pkgRes.data.packages);
              const pop = pkgRes.data.packages.find((p: any) => p.isPopular) || pkgRes.data.packages[0];
              setSelectedPlanId(pop._id);
            } else {
              setSelectedPlanId(defaultPackages[0]._id);
            }
          } catch (pkgErr) {
            console.warn('Could not load gym packages:', pkgErr);
            setSelectedPlanId(defaultPackages[0]._id);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch gym details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGym();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20 text-[#6B5E78]">Loading gym details...</div>;
  }

  if (error) {
    return (
      <div className="bg-[#E9DFF4]/10 border border-[#E9DFF4]/30 text-teal-400 p-4 rounded-xl text-sm max-w-3xl mx-auto">
        {error}
      </div>
    );
  }

  if (!gym) {
    return <div className="text-center py-20 text-[#6B5E78]">You are not assigned to any specific gym yet.</div>;
  }

  // Combine services and facilities, removing duplicates
  const allAmenities = Array.from(new Set([...(gym.services || []), ...(gym.facilities || [])]));

  const memberFullLoc = [gym.location?.address, gym.location?.area, gym.location?.city, gym.location?.state, gym.location?.pinCode].filter(Boolean).join(', ');
  const memberMapUrl = (gym.location?.latitude && gym.location?.longitude)
    ? `https://www.google.com/maps?q=${gym.location.latitude},${gym.location.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(memberFullLoc || gym.name)}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="bg-white border border-[#E5DDEB] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#F7F4FA] border border-[#E5DDEB] rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            {gym.logo ? (
              <img src={gym.logo} alt={gym.name} className="w-full h-full object-contain p-2" />
            ) : (
              <Building2 className="text-[#6B5E78]" size={42} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#292431] tracking-tight">{gym.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2.5">
                  <span className="bg-red-50 text-[#C43D4D] px-3 py-1 rounded-full font-bold text-xs tracking-wide uppercase border border-red-100">
                    {gym.gymType || 'Commercial'}
                  </span>
                  {gym.trainingMode && (
                    <span className="bg-orange-50 text-[#A991D4] px-3 py-1 rounded-full font-bold text-xs tracking-wide uppercase border border-orange-100">
                      {gym.trainingMode === 'both' ? 'Online & Offline' : gym.trainingMode}
                    </span>
                  )}
                  {gym.establishedYear && (
                    <span className="text-[#6B5E78] text-xs font-semibold flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                      <Calendar size={13} /> Est. {gym.establishedYear}
                    </span>
                  )}
                  {gym.rating && (
                    <span className="text-yellow-700 text-xs font-bold flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-200">
                      <Star size={13} className="fill-yellow-500 text-yellow-500" /> {gym.rating} ({gym.reviewCount || 0})
                    </span>
                  )}
                </div>
              </div>
              {gym.location?.city && (
                <a
                  href={memberMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#A991D4] bg-[#A991D4]/10 hover:bg-[#A991D4] hover:text-[#292431] border border-[#A991D4]/30 px-3.5 py-2 rounded-xl transition-all self-center sm:self-start shadow-2xs"
                  title="Click to open location in Google Maps"
                >
                  <MapPin size={14} />
                  <span>{gym.location.city}{gym.location.state ? `, ${gym.location.state}` : ''}</span>
                  <ExternalLink size={11} className="ml-0.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery - Symmetrically and evenly aligned based on count */}
      {gym.images && gym.images.length > 0 && (
        <div>
          {gym.images.length === 1 && (
            <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-[#E5DDEB] shadow-xs h-64 sm:h-80 md:h-96">
              <img 
                src={gym.images[0]} 
                alt={`${gym.name} gallery`} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
              />
            </div>
          )}

          {gym.images.length === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gym.images.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  className="rounded-2xl md:rounded-3xl overflow-hidden border border-[#E5DDEB] shadow-xs h-64 md:h-80"
                >
                  <img 
                    src={img} 
                    alt={`${gym.name} gallery ${idx + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              ))}
            </div>
          )}

          {gym.images.length === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {gym.images.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  className="rounded-2xl overflow-hidden border border-[#E5DDEB] shadow-xs h-64 md:h-72"
                >
                  <img 
                    src={img} 
                    alt={`${gym.name} gallery ${idx + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              ))}
            </div>
          )}

          {gym.images.length >= 4 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gym.images.slice(0, 4).map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  className="rounded-2xl overflow-hidden border border-[#E5DDEB] shadow-xs h-48 md:h-60"
                >
                  <img 
                    src={img} 
                    alt={`${gym.name} gallery ${idx + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* About */}
          {gym.description && (
            <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#292431]">
                <Building2 className="text-[#A991D4]" size={20} />
                About the Gym
              </h2>
              <p className="text-[#6B5E78] leading-relaxed whitespace-pre-wrap text-sm md:text-base">{gym.description}</p>
            </div>
          )}

          {/* Amenities & Services */}
          {allAmenities.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-[#292431]">
                <CheckCircle2 className="text-[#A991D4]" size={20} />
                Amenities & Services
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {allAmenities.map((amenity, idx) => (
                  <span key={idx} className="bg-[#F7F4FA] border border-[#E5DDEB] text-[#6B5E78] px-3.5 py-1.5 rounded-xl text-sm font-medium">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment & AC Details */}
          {(gym.equipment?.length > 0 || gym.acDetails) && (
            <div className="grid sm:grid-cols-2 gap-6">
              {gym.equipment?.length > 0 && (
                <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl md:rounded-3xl p-6 shadow-xs">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#292431]">
                    <Dumbbell className="text-[#A991D4]" size={18} />
                    Equipment
                  </h2>
                  <ul className="space-y-2.5">
                    {gym.equipment.slice(0, 5).map((eq: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                        <span className="text-[#6B5E78] font-medium">{eq.name}</span>
                        <span className="bg-gray-100 text-[#292431] px-2 py-0.5 rounded-md font-semibold text-xs">{eq.quantity}</span>
                      </li>
                    ))}
                    {gym.equipment.length > 5 && (
                      <li className="text-sm text-[#A991D4] font-semibold pt-2 text-center">
                        + {gym.equipment.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {gym.acDetails && (
                <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl md:rounded-3xl p-6 shadow-xs h-fit">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#292431]">
                    <Wind className="text-[#A991D4]" size={18} />
                    AC Details
                  </h2>
                  <p className="text-[#6B5E78] font-medium mb-3">{gym.acDetails.type}</p>
                  {gym.acDetails.areas?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {gym.acDetails.areas.map((area: string, idx: number) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md font-medium">
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Available Package Plans */}
          <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#292431]">
              <Calendar className="text-[#A991D4]" size={20} />
              Available Plans
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(packages.length > 0 ? packages : defaultPackages).map((pkg: any) => {
                const badge = BADGE_CONFIG[pkg.fitnessGoal] || BADGE_CONFIG['General Fitness'] || { icon: Dumbbell, accent: '#A991D4', bg: 'rgba(249,115,22,0.1)' };
                const Icon = badge.icon;
                const price = pkg.monthlyPrice ?? pkg.price ?? 0;
                const duration = pkg.duration || '1 Month';
                const featuresList: string[] = Array.isArray(pkg.features)
                  ? pkg.features
                  : (typeof pkg.features === 'string' ? pkg.features.split(',').map((f: string) => f.trim()).filter(Boolean) : []);
                const isSelected = selectedPlanId === pkg._id;

                return (
                  <div
                    key={pkg._id}
                    onClick={() => setSelectedPlanId(pkg._id)}
                    className={`bg-white rounded-2xl p-6 relative flex flex-col justify-between transition-all duration-200 cursor-pointer border-2 ${
                      isSelected
                        ? 'border-[#A991D4] shadow-md shadow-purple-900/10'
                        : 'border-[#E5DDEB] hover:border-[#A991D4]/50 shadow-2xs'
                    }`}
                  >
                    {pkg.isPopular && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#A991D4] text-[#292431] px-3 py-1 rounded-full text-[10px] font-black shadow-lg uppercase tracking-wider">
                        POPULAR
                      </div>
                    )}

                    <div>
                      {/* Fitness Goal Badge & Icon */}
                      <div className="flex items-center gap-2.5 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: badge.bg }}
                        >
                          <Icon size={18} style={{ color: badge.accent }} />
                        </div>
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                          style={{ color: badge.accent, backgroundColor: badge.bg }}
                        >
                          {pkg.fitnessGoal || pkg.name}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-[#292431] mb-1.5 leading-snug">{pkg.name}</h3>
                      {pkg.description && (
                        <p className="text-xs text-[#6B5E78] mb-3 line-clamp-2 leading-relaxed">{pkg.description}</p>
                      )}

                      <div className="flex items-baseline mb-3">
                        <span className="text-3xl font-extrabold text-[#292431]">₹{price}</span>
                        <span className="text-xs font-semibold text-[#6B5E78] ml-1.5">/ {duration.toLowerCase().includes('month') ? 'month' : duration}</span>
                      </div>

                      {/* Training type and duration pills */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-stone-100 text-stone-700">
                          {pkg.trainingType || 'Offline'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-stone-100 text-stone-700">
                          {duration}
                        </span>
                      </div>

                      {/* Features list */}
                      <div className="border-t border-stone-100 pt-3 mb-6">
                        <p className="text-xs font-bold text-[#292431] uppercase tracking-wider mb-2.5">FEATURES INCLUDED:</p>
                        <ul className="space-y-2">
                          {featuresList.map((f: string, i: number) => (
                            <li key={i} className="flex items-start text-xs text-[#6B5E78] leading-snug">
                              <CheckCircle2 size={14} className="text-[#A991D4] mr-2 shrink-0 mt-0.5" />
                              <span>{f.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (gym?._id) {
                          navigate(`/gyms/${gym._id}/checkout`, {
                            state: {
                              plan: {
                                ...pkg,
                                price: pkg.monthlyPrice ?? pkg.price,
                                name: pkg.name
                              },
                              gym
                            }
                          });
                        }
                      }}
                      className="w-full py-3 rounded-xl font-bold transition-all text-white shadow-sm hover:opacity-95 active:scale-95 cursor-pointer text-sm"
                      style={{ backgroundColor: badge.accent }}
                    >
                      {Number(price) === 0 || pkg.name?.toLowerCase().includes('trial')
                        ? 'Start Free Trial'
                        : `Choose ${pkg.name} • Pay Now`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl md:rounded-3xl p-6 shadow-xs">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#292431]">
              <Phone className="text-[#A991D4]" size={18} />
              Contact Info
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F7F4FA] border border-[#E5DDEB] flex items-center justify-center text-[#6B5E78] shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-[#6B5E78] uppercase tracking-wider font-semibold mb-0.5">Email</p>
                  <p className="text-[#292431] text-sm font-medium break-all">{gym.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F7F4FA] border border-[#E5DDEB] flex items-center justify-center text-[#6B5E78] shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs text-[#6B5E78] uppercase tracking-wider font-semibold mb-0.5">Phone</p>
                  <p className="text-[#292431] text-sm font-medium">{gym.phone || 'N/A'}</p>
                </div>
              </div>
              {gym.website && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F7F4FA] border border-[#E5DDEB] flex items-center justify-center text-[#6B5E78] shrink-0">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-[#6B5E78] uppercase tracking-wider font-semibold mb-0.5">Website</p>
                    <a href={gym.website} target="_blank" rel="noopener noreferrer" className="text-[#A991D4] hover:underline text-sm font-medium break-all">
                      {gym.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-[#FFFFFF] border border-[#E5DDEB] rounded-2xl md:rounded-3xl p-6 shadow-xs">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#292431]">
              <MapPin className="text-[#A991D4]" size={18} />
              Location Details
            </h2>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F7F4FA] border border-[#E5DDEB] flex items-center justify-center text-[#6B5E78] shrink-0">
                <MapPin size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#6B5E78] uppercase tracking-wider font-semibold mb-0.5">Address</p>
                <p className="text-[#292431] text-sm font-medium leading-relaxed mb-3">
                  {gym.location?.address && <>{gym.location.address}<br /></>}
                  {gym.location?.area && <>{gym.location.area}<br /></>}
                  {gym.location?.city}, {gym.location?.state} {gym.location?.pinCode}
                </p>
                <a
                  href={memberMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#A991D4] text-[#292431] hover:bg-[#967CC5] rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Navigation size={13} /> View Map & Directions <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberGymProfile;
