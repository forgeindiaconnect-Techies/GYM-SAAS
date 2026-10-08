import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, CheckCircle2, Calendar, Dumbbell, Wind, Star } from 'lucide-react';
import api from '../../utils/api';

const MemberGymProfile = () => {
  const [gym, setGym] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await api.get('/gyms/my-gym');
        setGym(res.data.gym);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch gym details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchGym();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center py-20 text-[#78716C]">Loading gym details...</div>;
  }

  if (error) {
    return (
      <div className="bg-[#FED7AA]/10 border border-[#FED7AA]/30 text-teal-400 p-4 rounded-xl text-sm max-w-3xl mx-auto">
        {error}
      </div>
    );
  }

  if (!gym) {
    return <div className="text-center py-20 text-[#78716C]">You are not assigned to any specific gym yet.</div>;
  }

  // Combine services and facilities, removing duplicates
  const allAmenities = Array.from(new Set([...(gym.services || []), ...(gym.facilities || [])]));

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#FFFDF8] border border-[#E7E5E4] rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            {gym.logo ? (
              <img src={gym.logo} alt={gym.name} className="w-full h-full object-contain p-2" />
            ) : (
              <Building2 className="text-[#78716C]" size={42} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#292524] tracking-tight">{gym.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2.5">
                  <span className="bg-red-50 text-[#EF4444] px-3 py-1 rounded-full font-bold text-xs tracking-wide uppercase border border-red-100">
                    {gym.gymType || 'Commercial'}
                  </span>
                  {gym.trainingMode && (
                    <span className="bg-orange-50 text-[#F97316] px-3 py-1 rounded-full font-bold text-xs tracking-wide uppercase border border-orange-100">
                      {gym.trainingMode === 'both' ? 'Online & Offline' : gym.trainingMode}
                    </span>
                  )}
                  {gym.establishedYear && (
                    <span className="text-[#78716C] text-xs font-semibold flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
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
                <div className="flex items-center gap-1.5 text-xs font-medium text-[#78716C] bg-[#FFFDF8] border border-[#E7E5E4] px-3 py-2 rounded-xl self-center sm:self-start">
                  <MapPin size={14} className="text-[#F97316]" />
                  <span>{gym.location.city}{gym.location.state ? `, ${gym.location.state}` : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery - Symmetrically and evenly aligned based on count */}
      {gym.images && gym.images.length > 0 && (
        <div>
          {gym.images.length === 1 && (
            <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-[#E7E5E4] shadow-xs h-64 sm:h-80 md:h-96">
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
                  className="rounded-2xl md:rounded-3xl overflow-hidden border border-[#E7E5E4] shadow-xs h-64 md:h-80"
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
                  className="rounded-2xl overflow-hidden border border-[#E7E5E4] shadow-xs h-64 md:h-72"
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
                  className="rounded-2xl overflow-hidden border border-[#E7E5E4] shadow-xs h-48 md:h-60"
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
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#292524]">
                <Building2 className="text-[#F97316]" size={20} />
                About the Gym
              </h2>
              <p className="text-[#78716C] leading-relaxed whitespace-pre-wrap text-sm md:text-base">{gym.description}</p>
            </div>
          )}

          {/* Amenities & Services */}
          {allAmenities.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-[#292524]">
                <CheckCircle2 className="text-[#F97316]" size={20} />
                Amenities & Services
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {allAmenities.map((amenity, idx) => (
                  <span key={idx} className="bg-[#FFFDF8] border border-[#E7E5E4] text-[#78716C] px-3.5 py-1.5 rounded-xl text-sm font-medium">
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
                <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 shadow-xs">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#292524]">
                    <Dumbbell className="text-[#F97316]" size={18} />
                    Equipment
                  </h2>
                  <ul className="space-y-2.5">
                    {gym.equipment.slice(0, 5).map((eq: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center text-sm py-1 border-b border-gray-50 last:border-0">
                        <span className="text-[#78716C] font-medium">{eq.name}</span>
                        <span className="bg-gray-100 text-[#292524] px-2 py-0.5 rounded-md font-semibold text-xs">{eq.quantity}</span>
                      </li>
                    ))}
                    {gym.equipment.length > 5 && (
                      <li className="text-sm text-[#F97316] font-semibold pt-2 text-center">
                        + {gym.equipment.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {gym.acDetails && (
                <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 shadow-xs h-fit">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#292524]">
                    <Wind className="text-[#F97316]" size={18} />
                    AC Details
                  </h2>
                  <p className="text-[#78716C] font-medium mb-3">{gym.acDetails.type}</p>
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

          {/* Subscription Plans */}
          {gym.subscriptionPlans && gym.subscriptionPlans.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xs">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#292524]">
                <Calendar className="text-[#F97316]" size={20} />
                Available Plans
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {gym.subscriptionPlans.map((plan: any, idx: number) => {
                  const featureList = plan.features 
                    ? plan.features.split(',').map((f: string) => f.trim()).filter(Boolean)
                    : (plan.featuresList || []);

                  return (
                    <div key={idx} className="border border-[#E7E5E4] rounded-2xl p-5 hover:border-[#F97316] transition-colors group flex flex-col h-full bg-white relative overflow-hidden shadow-2xs">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#292524] text-lg capitalize mb-1">{plan.name || plan.planName}</h3>
                        <p className="text-xs text-[#78716C] mb-3 font-medium">{plan.duration}</p>
                        
                        <div className="mb-4 flex items-baseline gap-1">
                          <span className="text-[#F97316] font-black text-2xl">₹{plan.price || plan.finalPrice || plan.monthly || 0}</span>
                        </div>

                        {featureList.length > 0 ? (
                          <ul className="space-y-2">
                            {featureList.map((feature: string, fIdx: number) => (
                              <li key={fIdx} className="flex items-start gap-2 text-xs text-[#78716C]">
                                <CheckCircle2 className="text-[#F97316] shrink-0 mt-0.5" size={14} />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-[#78716C] italic">Standard gym facility access.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 shadow-xs">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#292524]">
              <Phone className="text-[#F97316]" size={18} />
              Contact Info
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFFDF8] border border-[#E7E5E4] flex items-center justify-center text-[#78716C] shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-xs text-[#78716C] uppercase tracking-wider font-semibold mb-0.5">Email</p>
                  <p className="text-[#292524] text-sm font-medium break-all">{gym.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFFDF8] border border-[#E7E5E4] flex items-center justify-center text-[#78716C] shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs text-[#78716C] uppercase tracking-wider font-semibold mb-0.5">Phone</p>
                  <p className="text-[#292524] text-sm font-medium">{gym.phone || 'N/A'}</p>
                </div>
              </div>
              {gym.website && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FFFDF8] border border-[#E7E5E4] flex items-center justify-center text-[#78716C] shrink-0">
                    <Globe size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-[#78716C] uppercase tracking-wider font-semibold mb-0.5">Website</p>
                    <a href={gym.website} target="_blank" rel="noopener noreferrer" className="text-[#F97316] hover:underline text-sm font-medium break-all">
                      {gym.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl md:rounded-3xl p-6 shadow-xs">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#292524]">
              <MapPin className="text-[#F97316]" size={18} />
              Location
            </h2>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFFDF8] border border-[#E7E5E4] flex items-center justify-center text-[#78716C] shrink-0">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs text-[#78716C] uppercase tracking-wider font-semibold mb-0.5">Address</p>
                <p className="text-[#292524] text-sm font-medium leading-relaxed">
                  {gym.location?.address}<br />
                  {gym.location?.area && <>{gym.location.area}<br /></>}
                  {gym.location?.city}, {gym.location?.state} {gym.location?.pinCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberGymProfile;
