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
    return <div className="flex justify-center py-20 text-[#4A514D]">Loading gym details...</div>;
  }

  if (error) {
    return (
      <div className="bg-[#8FA89B]/10 border border-[#8FA89B]/30 text-teal-400 p-4 rounded-xl text-sm max-w-3xl mx-auto">
        {error}
      </div>
    );
  }

  if (!gym) {
    return <div className="text-center py-20 text-[#4A514D]">You are not assigned to any specific gym yet.</div>;
  }

  // Combine services and facilities, removing duplicates
  const allAmenities = Array.from(new Set([...(gym.services || []), ...(gym.facilities || [])]));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 border-b border-[#DCD9CD] pb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <div className="w-32 h-32 bg-[#FFFFFF] border-4 border-white rounded-3xl flex items-center justify-center overflow-hidden shrink-0 shadow-2xl">
            {gym.logo ? (
              <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="text-[#A8ADA9]" size={48} />
            )}
          </div>
          <div className="pt-2">
            <h1 className="text-4xl font-black text-[#202522] tracking-tight">{gym.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
              <span className="bg-red-50 text-[#EF4444] px-3 py-1 rounded-full font-bold text-xs tracking-wide uppercase border border-red-100">
                {gym.gymType || 'Fitness Facility'}
              </span>
              {gym.trainingMode && (
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold text-xs tracking-wide uppercase border border-blue-100">
                  {gym.trainingMode === 'both' ? 'Online & Offline' : gym.trainingMode}
                </span>
              )}
              {gym.establishedYear && (
                <span className="text-[#727975] text-sm font-medium flex items-center gap-1">
                  <Calendar size={14} /> Est. {gym.establishedYear}
                </span>
              )}
              {gym.rating && (
                <span className="text-yellow-600 text-sm font-medium flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" /> {gym.rating} ({gym.reviewCount || 0})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {gym.images && gym.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {gym.images.slice(0, 4).map((img: string, idx: number) => (
            <div key={idx} className={`rounded-2xl overflow-hidden border border-[#E8E5DA] shadow-sm ${idx === 0 ? 'col-span-2 row-span-2 h-64 md:h-80' : 'h-32 md:h-38'}`}>
              <img src={img} alt={`${gym.name} gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          {gym.description && (
            <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#202522]">
                <Building2 className="text-[#34483F]" size={20} />
                About the Gym
              </h2>
              <p className="text-[#4A514D] leading-relaxed whitespace-pre-wrap">{gym.description}</p>
            </div>
          )}

          {/* Amenities & Services */}
          {allAmenities.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#202522]">
                <CheckCircle2 className="text-[#34483F]" size={20} />
                Amenities & Services
              </h2>
              <div className="flex flex-wrap gap-3">
                {allAmenities.map((amenity, idx) => (
                  <span key={idx} className="bg-[#F2EFE8] border border-[#E8E5DA] text-[#4A514D] px-4 py-2 rounded-xl text-sm font-medium">
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
                <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-3xl p-6 shadow-xl">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#202522]">
                    <Dumbbell className="text-[#34483F]" size={18} />
                    Equipment
                  </h2>
                  <ul className="space-y-3">
                    {gym.equipment.slice(0, 5).map((eq: any, idx: number) => (
                      <li key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-[#4A514D] font-medium">{eq.name}</span>
                        <span className="bg-[#F1F5F9] text-[#727975] px-2 py-0.5 rounded-md">{eq.quantity}</span>
                      </li>
                    ))}
                    {gym.equipment.length > 5 && (
                      <li className="text-sm text-[#34483F] font-semibold pt-2 text-center">
                        + {gym.equipment.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {gym.acDetails && (
                <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-3xl p-6 shadow-xl h-fit">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#202522]">
                    <Wind className="text-[#34483F]" size={18} />
                    AC Details
                  </h2>
                  <p className="text-[#4A514D] font-medium mb-3">{gym.acDetails.type}</p>
                  {gym.acDetails.areas?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {gym.acDetails.areas.map((area: string, idx: number) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-md">
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
            <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-3xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#202522]">
                <Calendar className="text-[#34483F]" size={20} />
                Available Plans
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {gym.subscriptionPlans.map((plan: any, idx: number) => {
                  const featureList = plan.features 
                    ? plan.features.split(',').map((f: string) => f.trim()).filter(Boolean)
                    : (plan.featuresList || []);

                  return (
                    <div key={idx} className="border border-[#E8E5DA] rounded-2xl p-6 hover:border-[#34483F] transition-colors group flex flex-col h-full bg-white relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#34483F] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#202522] text-xl capitalize mb-1">{plan.name || plan.planName}</h3>
                        <p className="text-sm text-[#727975] mb-4 font-medium">{plan.duration}</p>
                        
                        <div className="mb-6 flex items-baseline gap-1">
                          <span className="text-[#34483F] font-black text-3xl">₹{plan.price || plan.finalPrice || plan.monthly || 0}</span>
                        </div>

                        {featureList.length > 0 ? (
                          <ul className="space-y-3">
                            {featureList.map((feature: string, fIdx: number) => (
                              <li key={fIdx} className="flex items-start gap-2 text-sm text-[#4A514D]">
                                <CheckCircle2 className="text-[#34483F] shrink-0 mt-0.5" size={16} />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-[#727975] italic">No specific features listed.</p>
                        )}
                      </div>
                      
                      <button className="mt-6 w-full py-2.5 bg-[#F1F5F9] text-[#202522] font-semibold rounded-xl group-hover:bg-[#34483F] group-hover:text-white transition-colors">
                        Select Plan
                      </button>
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
          <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#202522]">
              <Phone className="text-[#34483F]" size={18} />
              Contact Info
            </h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F2EFE8] flex items-center justify-center text-[#4A514D] shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs text-[#727975] uppercase tracking-wider font-semibold mb-0.5">Email</p>
                  <p className="text-[#202522] font-medium break-all">{gym.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F2EFE8] flex items-center justify-center text-[#4A514D] shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-xs text-[#727975] uppercase tracking-wider font-semibold mb-0.5">Phone</p>
                  <p className="text-[#202522] font-medium">{gym.phone || 'N/A'}</p>
                </div>
              </div>
              {gym.website && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F2EFE8] flex items-center justify-center text-[#4A514D] shrink-0">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-[#727975] uppercase tracking-wider font-semibold mb-0.5">Website</p>
                    <a href={gym.website} target="_blank" rel="noopener noreferrer" className="text-[#34483F] hover:underline font-medium break-all">
                      {gym.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#202522]">
              <MapPin className="text-[#34483F]" size={18} />
              Location
            </h2>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#F2EFE8] flex items-center justify-center text-[#4A514D] shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-[#727975] uppercase tracking-wider font-semibold mb-0.5">Address</p>
                <p className="text-[#202522] font-medium leading-relaxed">
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
