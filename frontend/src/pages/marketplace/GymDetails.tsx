import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Activity, CheckCircle, Clock, Users, Phone, Mail, Globe, ArrowLeft, Loader2, ShieldCheck, Dumbbell } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerEnquiryModal } from '../../components/CustomerEnquiryModal';

const GymDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [gym, setGym] = useState<any>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEnquiry, setShowEnquiry] = useState(false);

  useEffect(() => {
    fetchGymDetails();
  }, [id]);

  const fetchGymDetails = async () => {
    try {
      setLoading(true);
      try {
        const res = await api.get(`/gyms/public/${id}`);
        setGym(res.data.gym);
        setTrainers(res.data.trainers || []);
        setBranches(res.data.branches || []);
        if (res.data.branches?.length > 0) {
          setSelectedBranch(res.data.branches[0]);
        }
      } catch (pubErr: any) {
        // If public fails (gym is PENDING), try admin endpoint for admins
        const resAdmin = await api.get(`/gyms/${id}`);
        setGym(resAdmin.data.gym);
        setTrainers([]);
        setBranches([]);
      }
    } catch (err) {
      console.error('Error fetching gym details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (plan: any) => {
    if (branches.length > 0 && !selectedBranch) {
      alert("Please select a branch first.");
      return;
    }

    if (!user) {
      // Store checkout intent so we can return here after login
      sessionStorage.setItem('checkout_intent', JSON.stringify({ 
        gymId: id, 
        branchId: selectedBranch?._id,
        plan,
        gym
      }));
      navigate('/register/customer');
    } else if (user.role !== 'MEMBER') {
      if (window.confirm(`You are currently logged in as a ${user.role}. To register as a new customer and see the registration flow, you must log out first. Log out now?`)) {
        logout();
        sessionStorage.setItem('checkout_intent', JSON.stringify({ 
          gymId: id, 
          branchId: selectedBranch?._id,
          plan,
          gym
        }));
        navigate('/register/customer');
      }
    } else {
      navigate(`/gyms/${id}/checkout`, { state: { plan, gym, branch: selectedBranch } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] flex justify-center items-center">
        <Loader2 className="animate-spin text-[#34483F]" size={40} />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] flex flex-col justify-center items-center text-[#202522]">
        <h2 className="text-2xl font-bold mb-4">Gym not found</h2>
        <button onClick={() => navigate(-1)} className="text-[#34483F] hover:underline flex items-center"><ArrowLeft size={16} className="mr-2" /> Back to Marketplace</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EE] pt-20 pb-24 relative selection:bg-[#34483F] selection:text-black">
      {/* Hero Section */}
      <div className="h-[40vh] md:h-[50vh] relative bg-[#FFFFFF]">
        {gym.logo ? (
          <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#FFFFFF]">
            <Activity size={100} className="text-[#E8E5DA]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F2EFE8] via-[#F2EFE8]/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <button onClick={() => navigate('/')} className="text-[#4A514D] hover:text-[#34483F] flex items-center text-sm font-medium mb-4 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back to Search
              </button>
              <div className="flex items-center gap-3 mb-3">
                {gym.gymType && (
                  <span className="px-3 py-1 bg-[#34483F] text-white text-xs font-bold rounded-full">
                    {gym.gymType}
                  </span>
                )}
                <div className="flex items-center text-[#34483F] bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  <Star size={14} className="fill-current mr-1" />
                  <span className="text-sm font-bold text-[#202522]">{gym.rating || 4.5}</span>
                  {gym.reviewCount > 0 && (
                    <span className="text-xs text-[#4A514D] ml-1">({gym.reviewCount})</span>
                  )}
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#202522] mb-2 leading-tight tracking-tight">
                {gym.name}
              </h1>
              <div className="flex items-center text-[#4A514D] text-lg">
                <MapPin size={18} className="mr-2 text-[#34483F]" />
                {gym.location?.address}, {gym.location?.city}, {gym.location?.state}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowEnquiry(true)}
                className="px-8 py-4 bg-[#F2EFE8] border border-[#E8E5DA] text-[#202522] font-bold rounded-xl hover:bg-[#F1F5F9] transition-all whitespace-nowrap"
              >
                Enquire Now
              </button>
              <button 
                onClick={() => {
                  const plansSection = document.getElementById('membership-plans');
                  if (plansSection) plansSection.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-[#34483F] text-[#202522] font-bold rounded-xl hover:bg-[#C6A77D] transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] whitespace-nowrap"
              >
                View Plans to Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* About */}
          <section>
            <h2 className="text-2xl font-bold text-[#202522] mb-4 border-b border-[#DCD9CD] pb-4">About the Gym</h2>
            <p className="text-[#4A514D] leading-relaxed text-lg whitespace-pre-wrap">
              {gym.description || 'Welcome to our premium fitness center. We provide top-of-the-line equipment, professional trainers, and a motivating atmosphere to help you achieve your fitness goals.'}
            </p>
          </section>

          {/* Facilities */}
          <section>
            <h2 className="text-2xl font-bold text-[#202522] mb-6 border-b border-[#DCD9CD] pb-4">Facilities & Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gym.facilities?.map((facility: string, idx: number) => (
                <div key={idx} className="bg-[#FFFFFF] border border-[#DCD9CD] p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle className="text-[#34483F] shrink-0" size={20} />
                  <span className="text-[#202522] font-medium">{facility}</span>
                </div>
              ))}
              {(!gym.facilities || gym.facilities.length === 0) && (
                <p className="text-[#4A514D] col-span-full">Facilities information not provided.</p>
              )}
            </div>
          </section>

          {/* Equipment & Operations */}
          {(gym.equipment?.length > 0 || gym.acDetails) && (
            <section>
              <h2 className="text-2xl font-bold text-[#202522] mb-6 border-b border-[#DCD9CD] pb-4">Equipment & Infrastructure</h2>
              
              <div className="space-y-8">
                {/* Equipment */}
                {gym.equipment?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#34483F] mb-4">Available Equipment</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gym.equipment.map((eq: any, i: number) => (
                        <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-[#202522]">{eq.name}</p>
                            <span className="bg-[#FFFFFF] text-[#34483F] text-xs px-2 py-0.5 rounded font-bold">x{eq.quantity}</span>
                          </div>
                          <p className="text-xs text-[#4A514D]">{eq.category} • {eq.brand || 'Standard'} • {eq.condition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Infrastructure */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {gym.acDetails && (
                    <div className="bg-[#FFFFFF] border border-[#DCD9CD] p-5 rounded-xl">
                      <h3 className="text-lg font-bold text-[#202522] mb-2">Air Conditioning</h3>
                      <p className="text-[#4A514D] text-sm"><span className="text-[#202522] font-medium">Type:</span> {gym.acDetails.type || 'Not Specified'}</p>
                      {gym.acDetails.areas?.length > 0 && (
                        <p className="text-[#4A514D] text-sm mt-1"><span className="text-[#202522] font-medium">Cooled Areas:</span> {gym.acDetails.areas.join(', ')}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-[#FFFFFF] border border-[#DCD9CD] p-5 rounded-xl">
                    <h3 className="text-lg font-bold text-[#202522] mb-2">Capacity</h3>
                    <p className="text-[#4A514D] text-sm mb-1"><span className="text-[#202522] font-medium">Members Capacity:</span> {gym.memberCapacity || 'Not Specified'}</p>
                    <p className="text-[#4A514D] text-sm"><span className="text-[#202522] font-medium">Trainers Capacity:</span> {gym.trainerCapacity || 'Not Specified'}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Trainers */}
          <section>
            <h2 className="text-2xl font-bold text-[#202522] mb-6 border-b border-[#DCD9CD] pb-4">Our Top Trainers</h2>
            {trainers.length === 0 ? (
              <p className="text-[#4A514D]">No trainers listed yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {trainers.map((trainer) => (
                  <div key={trainer._id} className="bg-[#FFFFFF] border border-[#DCD9CD] p-5 rounded-2xl flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-full bg-[#FFFFFF] border border-[#DCD9CD] overflow-hidden shrink-0">
                      {trainer.profilePhoto ? (
                        <img src={trainer.profilePhoto} alt={trainer.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#4A514D] font-bold text-xl">
                          {trainer.firstName[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#202522]">{trainer.firstName} {trainer.lastName}</h4>
                      <p className="text-[#34483F] text-sm font-medium mb-1">{trainer.specialization || 'Fitness Coach'}</p>
                      <p className="text-[#4A514D] text-xs leading-relaxed line-clamp-2">{trainer.bio || 'Dedicated to helping you reach your peak physical potential.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Membership Plans */}
          <section id="membership-plans" className="pt-8 scroll-mt-24">
            <h2 className="text-3xl font-bold text-[#202522] mb-2">Membership Plans</h2>
            <p className="text-[#4A514D] mb-8">Choose the perfect plan that fits your goals and budget.</p>

            {/* Branch Selection */}
            {branches.length > 0 && (
              <div className="mb-8 p-6 bg-white border border-[#DCD9CD] rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-[#202522] mb-4">Select your preferred branch</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {branches.map((b) => (
                    <button
                      key={b._id}
                      onClick={() => setSelectedBranch(b)}
                      className={`p-4 text-left rounded-xl border transition-all ${selectedBranch?._id === b._id ? 'border-[#34483F] bg-[#34483F]/5 ring-2 ring-[#34483F]/20' : 'border-slate-200 hover:border-[#34483F]/50 bg-white'}`}
                    >
                      <div className="font-bold text-[#202522] mb-1">{b.name}</div>
                      <div className="text-sm text-[#4A514D] truncate">
                        {b.address?.city || 'Local Branch'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {(!gym.subscriptionPlans || gym.subscriptionPlans.length === 0) ? (
              <div className="bg-[#FFFFFF] border border-[#DCD9CD] p-8 rounded-2xl text-center">
                <Dumbbell className="mx-auto text-[#E8E5DA] mb-4" size={48} />
                <p className="text-[#202522] font-bold text-lg">No plans available online.</p>
                <p className="text-[#4A514D]">Please contact the gym directly for pricing.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {gym.subscriptionPlans.map((plan: any, idx: number) => (
                  <div key={idx} className="bg-[#FFFFFF] border border-[#DCD9CD] p-6 rounded-2xl relative flex flex-col hover:border-[#34483F] transition-colors">
                    {idx === 1 && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#34483F] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        POPULAR
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-[#202522] mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-3xl font-extrabold text-[#34483F]">₹{plan.price}</span>
                      <span className="text-[#4A514D] ml-2">/ {plan.duration}</span>
                    </div>
                    
                    <div className="flex-1 mt-4">
                      <p className="text-sm font-medium text-[#202522] mb-3">Includes:</p>
                      <ul className="space-y-3">
                        {plan.features?.split(',').map((f: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-[#4A514D]">
                            <CheckCircle size={16} className="text-[#34483F] mr-2 shrink-0 mt-0.5" />
                            <span>{f.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      onClick={() => handleJoin(plan)}
                      className="w-full mt-8 py-3 rounded-xl font-bold transition-all bg-[#34483F] text-white hover:bg-[#C6A77D]"
                    >
                      Pay Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          
          {/* Quick Info Card */}
          <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6 sticky top-24">
            <h3 className="text-lg font-bold text-[#202522] mb-6">Gym Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-[#4A514D] shrink-0 mt-0.5" size={18} />
                <div className="text-[#4A514D] text-sm">
                  <span className="text-[#202522] block font-medium mb-1">Address</span>
                  {gym.location?.address}<br />
                  {gym.location?.city}, {gym.location?.state} {gym.location?.pinCode}
                </div>
              </div>
              
              {(gym.email || gym.phone) && (
                <>
                  <div className="w-full h-px bg-[#E8E5DA] my-4"></div>
                  {gym.phone && (
                    <div className="flex items-center gap-3 text-[#4A514D] text-sm">
                      <Phone className="shrink-0" size={18} />
                      <a href={`tel:${gym.phone}`} className="hover:text-[#34483F] transition transition-colors">{gym.phone}</a>
                    </div>
                  )}
                  {gym.email && (
                    <div className="flex items-center gap-3 text-[#4A514D] text-sm mt-3">
                      <Mail className="shrink-0" size={18} />
                      <a href={`mailto:${gym.email}`} className="hover:text-[#34483F] transition transition-colors">{gym.email}</a>
                    </div>
                  )}
                  {gym.website && (
                    <div className="flex items-center gap-3 text-[#4A514D] text-sm mt-3">
                      <Globe className="shrink-0" size={18} />
                      <a href={gym.website} target="_blank" rel="noreferrer" className="hover:text-[#34483F] transition transition-colors">Visit Website</a>
                    </div>
                  )}
                </>
              )}

              <div className="w-full h-px bg-[#E8E5DA] my-4"></div>
              
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={18} />
                <div className="text-[#4A514D] text-sm flex-1">
                  <span className="text-[#202522] block font-medium mb-1 flex items-center gap-2">
                    Verified Partner
                    {gym.ownerId?.subscriptionPlan && gym.ownerId.subscriptionPlan !== 'FREE_TRIAL' && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wide flex items-center gap-1">
                        <Star size={10} className="fill-amber-500" />
                        {gym.ownerId.subscriptionPlan}
                      </span>
                    )}
                  </span>
                  This gym is an officially approved partner of the AI GYM network.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CustomerEnquiryModal
        isOpen={showEnquiry}
        onClose={() => setShowEnquiry(false)}
        gymId={gym._id}
        gymName={gym.name}
      />
    </div>
  );
};

export default GymDetails;
