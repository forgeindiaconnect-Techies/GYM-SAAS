import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Star, Activity, CheckCircle, Phone, Mail, Globe, ArrowLeft, 
  Loader2, ShieldCheck, Dumbbell, Navigation, ExternalLink, MessageSquare, 
  ThumbsUp, X, Sparkles, MessageCircle, Target, Zap, Crown, Leaf, TrendingUp, Users, Cpu
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerEnquiryModal } from '../../components/CustomerEnquiryModal';
import { isSubscriptionActive } from '../../utils/routeHelpers';

const BADGE_CONFIG: Record<string, { icon: any; accent: string; bg: string }> = {
  'Weight Loss':       { icon: Target,    accent: '#B91C1C', bg: 'rgba(248, 113, 113,0.1)'   },
  'Muscle Gain':       { icon: Dumbbell,  accent: '#F97316', bg: 'rgba(183,110,121,0.1)'  },
  'Strength':          { icon: Zap,       accent: '#F97316', bg: 'rgba(183,110,121,0.1)'  },
  'General Fitness':   { icon: Activity,  accent: '#15803D', bg: 'rgba(52, 211, 153,0.1)'   },
  'Bodybuilding':      { icon: Crown,     accent: '#9A3412', bg: 'rgba(234,88,12,0.12)'  },
  'Yoga':              { icon: Leaf,      accent: '#15803D', bg: 'rgba(16,185,129,0.1)'  },
  'CrossFit':          { icon: TrendingUp,accent: '#B45309', bg: 'rgba(251, 191, 36,0.1)'  },
  'Personal Training': { icon: Users,     accent: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  'Online Coaching':   { icon: Cpu,       accent: '#0EA5E9', bg: 'rgba(14,165,233,0.1)'  },
};

const GymDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [mainGym, setMainGym] = useState<any>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnquiry, setShowEnquiry] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'trainer' | 'gym'>('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formType, setFormType] = useState<'gym' | 'trainer'>('trainer');
  const [formTrainer, setFormTrainer] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const gym = selectedBranch ? {
    ...mainGym,
    name: `${mainGym?.name} - ${selectedBranch.branchName}`,
    location: selectedBranch.location,
    phone: selectedBranch.phone || mainGym?.phone,
    email: selectedBranch.email || mainGym?.email,
    facilities: selectedBranch.facilities,
    memberCapacity: selectedBranch.memberCapacity,
    trainerCapacity: selectedBranch.trainerCapacity,
    subscriptionPlans: selectedBranch.subscriptionPlans,
    equipment: [], 
    acDetails: null, 
  } : mainGym;

  useEffect(() => {
    fetchGymDetails();
  }, [id]);

  const fetchGymDetails = async () => {
    try {
      setLoading(true);
      try {
        const res = await api.get(`/gyms/public/${id}`);
        setMainGym(res.data.gym);
        setTrainers(res.data.trainers || []);
        setBranches(res.data.branches || []);
        setReviews(res.data.reviews || []);
        setRatingStats(res.data.ratingStats || null);
        if (res.data.branches?.length > 0) {
          setSelectedBranch(res.data.branches[0]);
        }
      } catch (pubErr: any) {
        // If public fails (gym is PENDING), try admin endpoint for admins
        const resAdmin = await api.get(`/gyms/${id}`);
        setMainGym(resAdmin.data.gym);
        setTrainers([]);
        setBranches([]);
        setReviews([]);
      }

      // Fetch Gym Package Plans (matching user requirement)
      try {
        const pkgRes = await api.get('/gym-packages/public', { params: { gymId: id } });
        if (pkgRes.data?.success && Array.isArray(pkgRes.data.packages)) {
          setPackages(pkgRes.data.packages);
        }
      } catch (pkgErr) {
        console.warn('Could not load gym packages:', pkgErr);
      }
    } catch (err) {
      console.error('Error fetching gym details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a verified member review.');
      navigate('/login');
      return;
    }
    if (!formComment.trim()) {
      alert('Please write your review feedback.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.post(`/gyms/${id}/reviews`, {
        rating: formRating,
        review: formComment,
        type: formType,
        trainerName: formType === 'trainer' ? formTrainer : undefined
      });

      if (res.data.success) {
        const newRev = res.data.review;
        const updatedReviews = [newRev, ...reviews];
        setReviews(updatedReviews);
        if (res.data.gymRating) {
          setMainGym((prev: any) => ({ ...prev, rating: res.data.gymRating, reviewCount: res.data.reviewCount }));
        }
        setShowReviewModal(false);
        setFormComment('');
        alert('Thank you! Your review has been submitted.');
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (reviewFilter === 'trainer') return r.type === 'trainer';
    if (reviewFilter === 'gym') return r.type === 'gym';
    return true;
  });

  const handleJoin = (plan: any) => {
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
      const planName = plan?.name?.toLowerCase() || '';
      const isTrial = planName.includes('trial') || Number(plan?.price || 0) === 0;
      if (isTrial && isSubscriptionActive(user.subscriptionStatus)) {
        alert('You already have an active membership / free trial.');
        sessionStorage.removeItem('checkout_intent');
        navigate('/member/dashboard');
        return;
      }
      navigate(`/gyms/${id}/checkout`, { state: { plan, gym, branch: selectedBranch } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center">
        <Loader2 className="animate-spin text-[#EA580C]" size={40} />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center text-[#111827]">
        <h2 className="text-2xl font-bold mb-4">Gym not found</h2>
        <button onClick={() => navigate(-1)} className="text-[#EA580C] hover:underline flex items-center"><ArrowLeft size={16} className="mr-2" /> Back to Marketplace</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-0 pb-24 relative selection:bg-[#C2410C] selection:text-[#111827]">
      {/* Hero Section */}
      <div className="h-[40vh] md:h-[50vh] relative bg-[#FFFFFF]">
        {gym.logo ? (
          <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#FFFFFF]">
            <Activity size={100} className="text-[#F8FAFC]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <button onClick={() => navigate('/portal/customer')} className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15 inline-flex items-center gap-2 mb-4 cursor-pointer">
                <ArrowLeft size={16} /> <span>Back to Customer</span>
              </button>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {branches.length > 0 && (
                  <select
                    value={selectedBranch?._id || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedBranch(val ? branches.find(b => b._id === val) : null);
                    }}
                    className="bg-[#FFFFFF] border border-[#E2E8F0] text-[#111827] text-sm rounded-lg focus:ring-[#F97316] focus:border-[#FDBA74] block p-1.5 px-3 outline-none font-bold cursor-pointer"
                  >
                    <option value="">Main Branch</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.branchName}</option>
                    ))}
                  </select>
                )}
                {gym.gymType && (
                  <span className="px-3 py-1 bg-[#C2410C] text-white font-bold text-xs font-bold rounded-full">
                    {gym.gymType}
                  </span>
                )}
                <div 
                  onClick={() => {
                    const el = document.getElementById('customer-reviews');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center text-[#EA580C] bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 cursor-pointer hover:bg-black/80 transition-all shadow-sm"
                  title="View customer reviews and ratings"
                >
                  <Star size={14} className="fill-amber-400 text-amber-400 mr-1.5" />
                  <span className="text-sm font-bold text-white">
                    {ratingStats?.averageRating ? Number(ratingStats.averageRating).toFixed(1) : (gym.rating ? Number(gym.rating).toFixed(1) : '4.5')}
                  </span>
                  <span className="text-xs text-white/80 font-medium ml-1.5">
                    ({reviews.length || gym.reviewCount || 0} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#111827] mb-2 leading-tight tracking-tight">
                {gym.name}
              </h1>
              <div className="flex items-center text-[#64748B] text-lg">
                <MapPin size={18} className="mr-2 text-[#EA580C]" />
                {gym.location?.address}, {gym.location?.city}, {gym.location?.state}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowEnquiry(true)}
                className="px-8 py-4 bg-[#C2410C] text-white font-bold rounded-xl hover:bg-[#9A3412] transition-all shadow-[0_0_20px_rgba(183,110,121,0.25)] whitespace-nowrap cursor-pointer"
              >
                Enquire Now
              </button>
              <button 
                onClick={() => {
                  const plansSection = document.getElementById('membership-plans');
                  if (plansSection) plansSection.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-[#C2410C] text-white font-bold rounded-xl hover:bg-[#9A3412] transition-all shadow-[0_0_20px_rgba(183,110,121,0.25)] whitespace-nowrap cursor-pointer"
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
            <h2 className="text-2xl font-bold text-[#111827] mb-4 border-b border-[#E2E8F0] pb-4">About the Gym</h2>
            <p className="text-[#64748B] leading-relaxed text-lg whitespace-pre-wrap">
              {gym.description || 'Welcome to our premium fitness center. We provide top-of-the-line equipment, professional trainers, and a motivating atmosphere to help you achieve your fitness goals.'}
            </p>
          </section>

          {/* Facilities */}
          <section>
            <h2 className="text-2xl font-bold text-[#111827] mb-6 border-b border-[#E2E8F0] pb-4">Facilities & Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gym.facilities?.map((facility: string, idx: number) => (
                <div key={idx} className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle className="text-[#EA580C] shrink-0" size={20} />
                  <span className="text-[#111827] font-medium">{facility}</span>
                </div>
              ))}
              {(!gym.facilities || gym.facilities.length === 0) && (
                <p className="text-[#64748B] col-span-full">Facilities information not provided.</p>
              )}
            </div>
          </section>

          {/* Equipment & Operations */}
          {(gym.equipment?.length > 0 || gym.acDetails) && (
            <section>
              <h2 className="text-2xl font-bold text-[#111827] mb-6 border-b border-[#E2E8F0] pb-4">Equipment & Infrastructure</h2>
              
              <div className="space-y-8">
                {/* Equipment */}
                {gym.equipment?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#EA580C] mb-4">Available Equipment</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gym.equipment.map((eq: any, i: number) => (
                        <div key={i} className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-[#111827]">{eq.name}</p>
                            <span className="bg-[#FFFFFF] text-[#EA580C] text-xs px-2 py-0.5 rounded font-bold">x{eq.quantity}</span>
                          </div>
                          <p className="text-xs text-[#64748B]">{eq.category} • {eq.brand || 'Standard'} • {eq.condition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Infrastructure */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {gym.acDetails && (
                    <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-xl">
                      <h3 className="text-lg font-bold text-[#111827] mb-2">Air Conditioning</h3>
                      <p className="text-[#64748B] text-sm"><span className="text-[#111827] font-medium">Type:</span> {gym.acDetails.type || 'Not Specified'}</p>
                      {gym.acDetails.areas?.length > 0 && (
                        <p className="text-[#64748B] text-sm mt-1"><span className="text-[#111827] font-medium">Cooled Areas:</span> {gym.acDetails.areas.join(', ')}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-xl">
                    <h3 className="text-lg font-bold text-[#111827] mb-2">Capacity</h3>
                    <p className="text-[#64748B] text-sm mb-1"><span className="text-[#111827] font-medium">Members Capacity:</span> {gym.memberCapacity || 'Not Specified'}</p>
                    <p className="text-[#64748B] text-sm"><span className="text-[#111827] font-medium">Trainers Capacity:</span> {gym.trainerCapacity || 'Not Specified'}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Trainers */}
          <section id="gym-trainers">
            <div className="flex items-center justify-between mb-6 border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111827]">Our Top Trainers</h2>
                <p className="text-xs text-[#64748B] mt-0.5">Certified experts dedicated to your fitness transformation</p>
              </div>
              <span className="text-xs font-bold text-[#EA580C] bg-[#F8FAFC] px-3 py-1 rounded-full border border-[#E2E8F0]">
                {trainers.length} {trainers.length === 1 ? 'Trainer' : 'Trainers'} Available
              </span>
            </div>
            {trainers.length === 0 ? (
              <p className="text-[#64748B]">No trainers listed yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {trainers.map((trainer) => (
                  <div key={trainer._id} className="bg-[#FFFFFF] border border-[#E2E8F0] p-5 rounded-2xl flex gap-4 items-start hover:border-[#FFEDD5] transition-all shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-[#FFFFFF] border border-[#E2E8F0] overflow-hidden shrink-0">
                      {trainer.profilePhoto ? (
                        <img src={trainer.profilePhoto} alt={trainer.name || trainer.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#EA580C] bg-[#F8FAFC] font-bold text-xl">
                          {trainer.firstName?.[0] || trainer.name?.[0] || 'T'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-lg font-bold text-[#111827] truncate">
                          {trainer.name || `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim()}
                        </h4>
                      </div>
                      <p className="text-[#EA580C] text-xs font-bold uppercase tracking-wider mb-1">
                        {trainer.specialization || 'Fitness Coach'}
                      </p>
                      <p className="text-[#64748B] text-xs leading-relaxed line-clamp-2 mb-2">
                        {trainer.bio || 'Dedicated to helping you reach your peak physical potential.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E2E8F0]">
                        <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Star size={11} className="fill-amber-500 text-amber-500 mr-1" />
                          {trainer.averageRating ? Number(trainer.averageRating).toFixed(1) : '5.0'} 
                          <span className="text-[10px] text-amber-800 ml-1">({trainer.totalReviews || 0} reviews)</span>
                        </span>
                        {trainer.experienceYears && (
                          <span className="text-[11px] font-medium text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md">
                            {trainer.experienceYears} yrs experience
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Customer Reviews & Trainer Ratings */}
          <section id="customer-reviews" className="pt-4 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#E2E8F0] pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#111827] flex items-center gap-2">
                  Customer Reviews & Trainer Ratings
                  <span className="text-xs bg-[#FFF7ED] text-[#EA580C] font-bold px-2.5 py-0.5 rounded-full border border-[#FFEDD5]">
                    {reviews.length} Verified {reviews.length === 1 ? 'Review' : 'Reviews'}
                  </span>
                </h2>
                <p className="text-sm text-[#64748B] mt-1">Real ratings & feedback from verified members and training clients</p>
              </div>
              <button
                onClick={() => {
                  if (!user) {
                    alert('Please log in to leave a review.');
                    navigate('/login');
                    return;
                  }
                  if (trainers.length > 0 && !formTrainer) {
                    setFormTrainer(trainers[0].name || `${trainers[0].firstName} ${trainers[0].lastName}`);
                  }
                  setShowReviewModal(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#C2410C] text-white font-bold hover:bg-[#9A3412] font-semibold text-sm rounded-xl transition-all shadow-sm shrink-0"
              >
                <Star size={15} className="fill-white" /> Write a Review
              </button>
            </div>

            {/* Rating Summary Card */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 mb-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Left: Big Score */}
                <div className="flex flex-col items-center justify-center text-center p-5 bg-gradient-to-b from-orange-50/60 to-orange-100/40 rounded-2xl border border-[#E2E8F0]">
                  <span className="text-5xl font-black text-[#111827] mb-1">
                    {ratingStats?.averageRating ? Number(ratingStats.averageRating).toFixed(1) : (gym.rating ? Number(gym.rating).toFixed(1) : '4.5')}
                  </span>
                  <div className="flex items-center gap-1 my-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const curRating = ratingStats?.averageRating || gym.rating || 4.5;
                      const isFilled = star <= Math.round(curRating);
                      return (
                        <Star
                          key={star}
                          size={18}
                          className={isFilled ? "text-amber-500 fill-amber-500" : "text-[#64748B]"}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-[#64748B]">
                    Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </span>
                </div>

                {/* Center: Star Breakdown Bars */}
                <div className="md:col-span-2 space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingStats?.ratingBreakdown?.[stars] || reviews.filter((r: any) => Math.round(Number(r.rating)) === stars).length;
                    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-bold text-[#111827] flex items-center gap-1">
                          {stars} <Star size={12} className="fill-amber-500 text-amber-500" />
                        </span>
                        <div className="flex-1 h-2.5 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#E2E8F0]">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-[#EA580C] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-14 text-right font-semibold text-[#64748B]">
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'all' ? 'bg-[#FFFFFF] text-white shadow-sm' : 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#64748B] hover:text-[#C2410C]'}`}
              >
                All Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setReviewFilter('trainer')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'trainer' ? 'bg-[#FFFFFF] text-white shadow-sm' : 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#64748B] hover:text-[#C2410C]'}`}
              >
                Trainer Feedback ({reviews.filter((r: any) => r.type === 'trainer').length})
              </button>
              <button
                onClick={() => setReviewFilter('gym')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'gym' ? 'bg-[#FFFFFF] text-white shadow-sm' : 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#64748B] hover:text-[#C2410C]'}`}
              >
                Gym Reviews ({reviews.filter((r: any) => r.type === 'gym').length})
              </button>
            </div>

            {/* Review Cards List */}
            {filteredReviews.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 text-center">
                <MessageSquare className="mx-auto text-[#F8FAFC] mb-3" size={36} />
                <h4 className="text-base font-bold text-[#111827]">No reviews in this category yet</h4>
                <p className="text-xs text-[#64748B] mt-1 mb-4">Be the first to share your thoughts and experience!</p>
                <button
                  onClick={() => {
                    if (!user) {
                      alert('Please log in to leave a review.');
                      navigate('/login');
                      return;
                    }
                    setShowReviewModal(true);
                  }}
                  className="px-4 py-2 bg-[#C2410C] text-white font-bold font-semibold text-xs rounded-xl hover:bg-[#9A3412] transition-colors"
                >
                  Write a Review
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((rev: any) => (
                  <div key={rev._id} className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 hover:border-[#FFEDD5] transition-all shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-[#EA580C] text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden shrink-0">
                          {rev.userPhoto ? (
                            <img src={rev.userPhoto} alt={rev.userName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{rev.userName?.[0]?.toUpperCase() || 'M'}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#111827] text-sm">{rev.userName}</h4>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#EA580C] bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
                              <ShieldCheck size={11} className="text-[#EA580C]" /> Verified Member
                            </span>
                          </div>
                          <span className="text-xs text-[#64748B]">
                            {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {rev.type === 'trainer' && rev.trainerName ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] bg-[#F8FAFC] px-3 py-1 rounded-lg border border-[#E2E8F0]">
                            <Dumbbell size={13} className="text-[#EA580C]" /> Trainer: {rev.trainerName}
                            {rev.trainerSpecialization && <span className="text-[10px] opacity-75">({rev.trainerSpecialization})</span>}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#111827] bg-[#F8FAFC] px-3 py-1 rounded-lg border border-[#E2E8F0]">
                            Gym Feedback
                          </span>
                        )}
                        {rev.mode && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                            {rev.mode}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={star <= Number(rev.rating) ? "text-amber-500 fill-amber-500" : "text-[#64748B]"}
                        />
                      ))}
                      <span className="text-xs font-bold text-[#111827] ml-1.5">{rev.rating}.0</span>
                    </div>

                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 text-sm text-[#111827] font-medium leading-relaxed">
                      "{rev.review}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Membership Plans */}
          <section id="membership-plans" className="pt-8 scroll-mt-24">
            <h2 className="text-3xl font-bold text-[#111827] mb-2">Membership Plans</h2>
            <p className="text-[#64748B] mb-8">Choose the perfect plan that fits your goals and budget.</p>

            {packages.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {packages.map((pkg: any) => {
                  const badge = BADGE_CONFIG[pkg.fitnessGoal] || BADGE_CONFIG['General Fitness'] || { icon: Dumbbell, accent: '#F97316', bg: 'rgba(183,110,121,0.1)' };
                  const Icon = badge.icon;
                  const price = pkg.monthlyPrice ?? pkg.price ?? 0;
                  const duration = pkg.duration || '1 Month';
                  const featuresList: string[] = Array.isArray(pkg.features)
                    ? pkg.features
                    : (typeof pkg.features === 'string' ? pkg.features.split(',') : []);

                  return (
                    <div key={pkg._id} className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-2xl relative flex flex-col hover:border-[#FDBA74] transition-all hover:shadow-md">
                      {pkg.isPopular && (
                        <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#C2410C] text-white font-bold px-3 py-1 rounded-full text-[10px] font-black shadow-lg uppercase tracking-wider">
                          POPULAR
                        </div>
                      )}
                      
                      {/* Fitness Goal Badge & Icon */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: badge.bg }}>
                          <Icon size={20} style={{ color: badge.accent }} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full" style={{ color: badge.accent, backgroundColor: badge.bg }}>
                            {pkg.fitnessGoal || 'General Fitness'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-[#111827] mb-1.5 leading-snug">{pkg.name}</h3>
                      {pkg.description && (
                        <p className="text-xs text-[#64748B] mb-3 line-clamp-2 leading-relaxed">{pkg.description}</p>
                      )}

                      <div className="flex items-baseline mb-3">
                        <span className="text-3xl font-extrabold text-[#111827]">₹{price}</span>
                        <span className="text-xs font-semibold text-[#64748B] ml-1.5">/ {duration.toLowerCase().includes('month') ? 'month' : duration}</span>
                      </div>

                      {/* Training type and duration pills */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#F8FAFC] text-[#111827]">
                          {pkg.trainingType || 'Offline'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#F8FAFC] text-[#111827]">
                          {duration}
                        </span>
                      </div>

                      {/* Features list */}
                      <div className="flex-1 mt-2 border-t border-[#E2E8F0] pt-3">
                        <p className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-2.5">Features Included:</p>
                        <ul className="space-y-2">
                          {featuresList.map((f: string, i: number) => (
                            <li key={i} className="flex items-start text-xs text-[#64748B] leading-snug">
                              <CheckCircle size={14} className="text-[#EA580C] mr-2 shrink-0 mt-0.5" />
                              <span>{f.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button 
                        onClick={() => handleJoin({
                          ...pkg,
                          price: pkg.monthlyPrice ?? pkg.price,
                          name: pkg.name
                        })}
                        className="w-full mt-6 py-3 rounded-xl font-bold transition-all text-white shadow-sm hover:opacity-95 active:scale-95 cursor-pointer"
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
            ) : (!gym.subscriptionPlans || gym.subscriptionPlans.length === 0) ? (
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-8 rounded-2xl text-center">
                <Dumbbell className="mx-auto text-[#F8FAFC] mb-4" size={48} />
                <p className="text-[#111827] font-bold text-lg">No plans available online.</p>
                <p className="text-[#64748B]">Please contact the gym directly for pricing.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {gym.subscriptionPlans.map((plan: any, idx: number) => (
                  <div key={idx} className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-2xl relative flex flex-col hover:border-[#FDBA74] transition-colors">
                    {idx === 1 && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#C2410C] text-white font-bold px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        POPULAR
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-[#111827] mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-3xl font-extrabold text-[#EA580C]">₹{plan.price}</span>
                      <span className="text-[#64748B] ml-2">/ {plan.duration}</span>
                    </div>
                    
                    <div className="flex-1 mt-4">
                      <p className="text-sm font-medium text-[#111827] mb-3">Includes:</p>
                      <ul className="space-y-3">
                        {plan.features?.split(',').map((f: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-[#64748B]">
                            <CheckCircle size={16} className="text-[#EA580C] mr-2 shrink-0 mt-0.5" />
                            <span>{f.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      onClick={() => handleJoin(plan)}
                      className="w-full mt-8 py-3 rounded-xl font-bold transition-all bg-[#C2410C] text-white font-bold hover:bg-[#9A3412] cursor-pointer"
                    >
                      {Number(plan.price) === 0 || plan.name?.toLowerCase().includes('trial')
                        ? 'Start Free Trial'
                        : `Choose ${plan.name} • Pay Now`}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6 relative">
          <div className="sticky top-24 space-y-6">
            {/* Quick Info Card */}
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[#111827] mb-6">Gym Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#EA580C] shrink-0 mt-0.5" size={18} />
                  <div className="text-[#64748B] text-sm flex-1">
                    <span className="text-[#111827] block font-medium mb-1">Location & Address</span>
                    <p className="text-xs text-[#111827] font-medium leading-relaxed mb-3">
                      {gym.location?.address && <>{gym.location.address}<br /></>}
                      {gym.location?.area && <>{gym.location.area}<br /></>}
                      {gym.location?.city}, {gym.location?.state} {gym.location?.pinCode}
                    </p>
                    {(() => {
                      const fullLoc = [gym.location?.address, gym.location?.area, gym.location?.city, gym.location?.state, gym.location?.pinCode].filter(Boolean).join(', ');
                      const mapUrl = (gym.location?.latitude && gym.location?.longitude)
                        ? `https://www.google.com/maps?q=${gym.location.latitude},${gym.location.longitude}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullLoc || gym.name)}`;
                      return (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C2410C] text-white font-bold hover:bg-[#9A3412] rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <Navigation size={13} /> View Map & Directions <ExternalLink size={12} />
                        </a>
                      );
                    })()}
                  </div>
                </div>
                
                {(gym.email || gym.phone) && (
                  <>
                    <div className="w-full h-px bg-[#F8FAFC] my-4"></div>
                    {gym.phone && (
                      <div className="flex items-center gap-3 text-[#64748B] text-sm">
                        <Phone className="shrink-0 text-[#EA580C]" size={18} />
                        <a href={`tel:${gym.phone}`} className="hover:text-[#EA580C] transition transition-colors font-medium">{gym.phone}</a>
                      </div>
                    )}
                    {gym.email && (
                      <div className="flex items-center gap-3 text-[#64748B] text-sm mt-3">
                        <Mail className="shrink-0 text-[#EA580C]" size={18} />
                        <a href={`mailto:${gym.email}`} className="hover:text-[#EA580C] transition transition-colors font-medium">{gym.email}</a>
                      </div>
                    )}
                    {gym.website && (
                      <div className="flex items-center gap-3 text-[#64748B] text-sm mt-3">
                        <Globe className="shrink-0 text-[#EA580C]" size={18} />
                        <a href={gym.website} target="_blank" rel="noreferrer" className="hover:text-[#EA580C] transition transition-colors font-medium">Visit Website</a>
                      </div>
                    )}
                  </>
                )}

                <div className="w-full h-px bg-[#F8FAFC] my-4"></div>
                
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={18} />
                  <div className="text-[#64748B] text-sm flex-1">
                    <span className="text-[#111827] block font-medium mb-1 flex items-center gap-2">
                      Verified Partner
                      {gym.ownerId?.subscriptionPlan && gym.ownerId.subscriptionPlan !== 'FREE_TRIAL' && (
                        <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-wide flex items-center gap-1">
                          <Star size={10} className="fill-amber-500" />
                          {gym.ownerId.subscriptionPlan}
                        </span>
                      )}
                    </span>
                    This gym is an officially approved partner of the Gymora network.
                  </div>
                </div>
              </div>
            </div>
            
            {/* Branches Card */}
            {branches.length > 0 && (
              <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#111827] mb-4">Other Branches</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {branches.map((branch: any) => {
                    const branchLocStr = [branch.location?.address, branch.location?.area, branch.location?.city, branch.location?.state].filter(Boolean).join(', ');
                    const branchMapUrl = (branch.location?.latitude && branch.location?.longitude)
                      ? `https://www.google.com/maps?q=${branch.location.latitude},${branch.location.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branchLocStr || branch.branchName)}`;

                    return (
                      <div 
                        key={branch._id} 
                        onClick={() => { setSelectedBranch(branch); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${selectedBranch?._id === branch._id ? 'bg-[#FFF7ED] border-[#FDBA74]' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#FFEDD5]'}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="text-[#EA580C] shrink-0" size={14} />
                            <h4 className="font-bold text-[#111827] text-sm leading-tight">{branch.branchName}</h4>
                          </div>
                          <a
                            href={branchMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-bold text-[#EA580C] hover:underline flex items-center gap-0.5 bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E2E8F0]"
                            title="View location on Google Maps"
                          >
                            Map <ExternalLink size={9} />
                          </a>
                        </div>
                        <div className="pl-5">
                          <p className="text-xs text-[#64748B] mb-1">{branch.location?.address}, {branch.location?.city}</p>
                          {(branch.phone || branch.email) && (
                            <div className="flex flex-col gap-1 mt-2">
                              {branch.phone && (
                                <div className="text-xs text-[#EA580C] flex items-center gap-1.5"><Phone size={10} /> {branch.phone}</div>
                              )}
                              {branch.email && (
                                <div className="text-xs text-[#EA580C] flex items-center gap-1.5"><Mail size={10} /> {branch.email}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <CustomerEnquiryModal
        isOpen={showEnquiry}
        onClose={() => setShowEnquiry(false)}
        gymId={gym._id}
        gymName={gym.name}
      />

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8F0] relative">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 text-[#64748B] hover:text-[#111827] p-1.5 rounded-xl hover:bg-[#FFF7ED] transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-[#EA580C] mb-1">
              <Star size={18} className="fill-[#F97316]" />
              <span className="text-xs font-bold uppercase tracking-wider">Verified Feedback</span>
            </div>
            <h3 className="text-2xl font-black text-[#111827] mb-1">Write a Review</h3>
            <p className="text-xs text-[#64748B] mb-5">Share your experience with {gym.name} or your personal trainer.</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">Review Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setFormType('trainer'); }}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${formType === 'trainer' ? 'bg-[#C2410C] text-white border-[#FDBA74] shadow-md' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#111827] hover:bg-[#FFF7ED]'}`}
                  >
                    <Dumbbell size={16} />
                    <span>Personal Trainer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType('gym'); }}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${formType === 'gym' ? 'bg-[#C2410C] text-white border-[#FDBA74] shadow-md' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#111827] hover:bg-[#FFF7ED]'}`}
                  >
                    <Activity size={16} />
                    <span>Gym Facilities</span>
                  </button>
                </div>
              </div>

              {formType === 'trainer' && (
                <div>
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">Select Trainer</label>
                  {trainers.length > 0 ? (
                    <select
                      value={formTrainer}
                      onChange={(e) => setFormTrainer(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#111827] font-semibold outline-none focus:border-[#FDBA74] cursor-pointer"
                      required
                    >
                      {trainers.map((tr: any) => {
                        const trName = tr.name || `${tr.firstName || ''} ${tr.lastName || ''}`.trim();
                        return (
                          <option key={tr._id} value={trName}>
                            {trName} — {tr.specialization || 'Fitness Coach'}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Trainer Name (e.g. Naveen)"
                      value={formTrainer}
                      onChange={(e) => setFormTrainer(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#111827] outline-none focus:border-[#FDBA74]"
                      required
                    />
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">Overall Rating</label>
                <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormRating(star)}
                        className="p-1 hover:scale-115 transition-transform"
                      >
                        <Star
                          size={28}
                          className={star <= formRating ? "text-amber-500 fill-amber-500" : "text-[#64748B]"}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="ml-3 font-extrabold text-base text-[#111827]">{formRating}.0 / 5.0</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">Your Review Feedback</label>
                <textarea
                  rows={3}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Share details of your workout experience, personal coaching quality, facilities, or results..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#111827] outline-none focus:border-[#FDBA74] resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#64748B] font-semibold text-xs hover:bg-[#FFF7ED] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-[#C2410C] text-white font-bold font-bold text-xs rounded-xl hover:bg-[#9A3412] transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} className="fill-white" />}
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymDetails;
