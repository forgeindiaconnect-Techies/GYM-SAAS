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
  'Weight Loss':       { icon: Target,    accent: '#C43D35', bg: 'rgba(239,68,68,0.1)'   },
  'Muscle Gain':       { icon: Dumbbell,  accent: '#6366F1', bg: 'rgba(22,125,120,0.1)'  },
  'Strength':          { icon: Zap,       accent: '#6366F1', bg: 'rgba(99,102,241,0.1)'  },
  'General Fitness':   { icon: Activity,  accent: '#27845A', bg: 'rgba(34,197,94,0.1)'   },
  'Bodybuilding':      { icon: Crown,     accent: '#4F46E5', bg: 'rgba(234,88,12,0.12)'  },
  'Yoga':              { icon: Leaf,      accent: '#27845A', bg: 'rgba(16,185,129,0.1)'  },
  'CrossFit':          { icon: TrendingUp,accent: '#D99A27', bg: 'rgba(245,158,11,0.1)'  },
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
      <div className="min-h-screen bg-[#0B0B12] flex justify-center items-center">
        <Loader2 className="animate-spin text-[#6366F1]" size={40} />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#0B0B12] flex flex-col justify-center items-center text-[#11111F]">
        <h2 className="text-2xl font-bold mb-4">Gym not found</h2>
        <button onClick={() => navigate(-1)} className="text-[#6366F1] hover:underline flex items-center"><ArrowLeft size={16} className="mr-2" /> Back to Marketplace</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B12] pt-20 pb-24 relative selection:bg-[#6366F1] selection:text-[#11111F]">
      {/* Hero Section */}
      <div className="h-[40vh] md:h-[50vh] relative bg-[#FFFFFF]">
        {gym.logo ? (
          <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#FFFFFF]">
            <Activity size={100} className="text-[#17172A]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-[#0B0B12]/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <button onClick={() => navigate('/')} className="text-[#A1A1AA] hover:text-[#6366F1] flex items-center text-sm font-medium mb-4 transition-colors">
                <ArrowLeft size={16} className="mr-2" /> Back to Search
              </button>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {branches.length > 0 && (
                  <select
                    value={selectedBranch?._id || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedBranch(val ? branches.find(b => b._id === val) : null);
                    }}
                    className="bg-[#FFFFFF] border border-[#292940] text-[#11111F] text-sm rounded-lg focus:ring-[#6366F1] focus:border-[#6366F1] block p-1.5 px-3 outline-none font-bold cursor-pointer"
                  >
                    <option value="">Main Branch</option>
                    {branches.map(b => (
                      <option key={b._id} value={b._id}>{b.branchName}</option>
                    ))}
                  </select>
                )}
                {gym.gymType && (
                  <span className="px-3 py-1 bg-[#6366F1] text-white text-xs font-bold rounded-full">
                    {gym.gymType}
                  </span>
                )}
                <div 
                  onClick={() => {
                    const el = document.getElementById('customer-reviews');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center text-[#6366F1] bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 cursor-pointer hover:bg-black/80 transition-all shadow-sm"
                  title="View customer reviews and ratings"
                >
                  <Star size={14} className="fill-amber-400 text-amber-400 mr-1.5" />
                  <span className="text-sm font-bold text-white">
                    {ratingStats?.averageRating ? Number(ratingStats.averageRating).toFixed(1) : (gym.rating ? Number(gym.rating).toFixed(1) : '4.5')}
                  </span>
                  <span className="text-xs text-stone-300 ml-1.5">
                    ({reviews.length || gym.reviewCount || 0} {reviews.length === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-[#11111F] mb-2 leading-tight tracking-tight">
                {gym.name}
              </h1>
              <div className="flex items-center text-[#A1A1AA] text-lg">
                <MapPin size={18} className="mr-2 text-[#6366F1]" />
                {gym.location?.address}, {gym.location?.city}, {gym.location?.state}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowEnquiry(true)}
                className="px-8 py-4 bg-[#0B0B12] border border-[#17172A] text-[#11111F] font-bold rounded-xl hover:bg-[#0B0B12] transition-all whitespace-nowrap"
              >
                Enquire Now
              </button>
              <button 
                onClick={() => {
                  const plansSection = document.getElementById('membership-plans');
                  if (plansSection) plansSection.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-[#6366F1] text-white font-bold rounded-xl hover:bg-[#4F46E5] transition-all shadow-[0_0_20px_rgba(22,125,120,0.25)] whitespace-nowrap"
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
            <h2 className="text-2xl font-bold text-[#11111F] mb-4 border-b border-[#292940] pb-4">About the Gym</h2>
            <p className="text-[#A1A1AA] leading-relaxed text-lg whitespace-pre-wrap">
              {gym.description || 'Welcome to our premium fitness center. We provide top-of-the-line equipment, professional trainers, and a motivating atmosphere to help you achieve your fitness goals.'}
            </p>
          </section>

          {/* Facilities */}
          <section>
            <h2 className="text-2xl font-bold text-[#11111F] mb-6 border-b border-[#292940] pb-4">Facilities & Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gym.facilities?.map((facility: string, idx: number) => (
                <div key={idx} className="bg-[#FFFFFF] border border-[#292940] p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle className="text-[#6366F1] shrink-0" size={20} />
                  <span className="text-[#11111F] font-medium">{facility}</span>
                </div>
              ))}
              {(!gym.facilities || gym.facilities.length === 0) && (
                <p className="text-[#A1A1AA] col-span-full">Facilities information not provided.</p>
              )}
            </div>
          </section>

          {/* Equipment & Operations */}
          {(gym.equipment?.length > 0 || gym.acDetails) && (
            <section>
              <h2 className="text-2xl font-bold text-[#11111F] mb-6 border-b border-[#292940] pb-4">Equipment & Infrastructure</h2>
              
              <div className="space-y-8">
                {/* Equipment */}
                {gym.equipment?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#6366F1] mb-4">Available Equipment</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gym.equipment.map((eq: any, i: number) => (
                        <div key={i} className="bg-[#FFFFFF] border border-[#292940] p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-[#11111F]">{eq.name}</p>
                            <span className="bg-[#FFFFFF] text-[#6366F1] text-xs px-2 py-0.5 rounded font-bold">x{eq.quantity}</span>
                          </div>
                          <p className="text-xs text-[#A1A1AA]">{eq.category} • {eq.brand || 'Standard'} • {eq.condition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Infrastructure */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {gym.acDetails && (
                    <div className="bg-[#FFFFFF] border border-[#292940] p-5 rounded-xl">
                      <h3 className="text-lg font-bold text-[#11111F] mb-2">Air Conditioning</h3>
                      <p className="text-[#A1A1AA] text-sm"><span className="text-[#11111F] font-medium">Type:</span> {gym.acDetails.type || 'Not Specified'}</p>
                      {gym.acDetails.areas?.length > 0 && (
                        <p className="text-[#A1A1AA] text-sm mt-1"><span className="text-[#11111F] font-medium">Cooled Areas:</span> {gym.acDetails.areas.join(', ')}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-[#FFFFFF] border border-[#292940] p-5 rounded-xl">
                    <h3 className="text-lg font-bold text-[#11111F] mb-2">Capacity</h3>
                    <p className="text-[#A1A1AA] text-sm mb-1"><span className="text-[#11111F] font-medium">Members Capacity:</span> {gym.memberCapacity || 'Not Specified'}</p>
                    <p className="text-[#A1A1AA] text-sm"><span className="text-[#11111F] font-medium">Trainers Capacity:</span> {gym.trainerCapacity || 'Not Specified'}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Trainers */}
          <section id="gym-trainers">
            <div className="flex items-center justify-between mb-6 border-b border-[#292940] pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#11111F]">Our Top Trainers</h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">Certified experts dedicated to your fitness transformation</p>
              </div>
              <span className="text-xs font-bold text-[#6366F1] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                {trainers.length} {trainers.length === 1 ? 'Trainer' : 'Trainers'} Available
              </span>
            </div>
            {trainers.length === 0 ? (
              <p className="text-[#A1A1AA]">No trainers listed yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {trainers.map((trainer) => (
                  <div key={trainer._id} className="bg-[#FFFFFF] border border-[#292940] p-5 rounded-2xl flex gap-4 items-start hover:border-[#6366F1]/40 transition-all shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-[#FFFFFF] border border-[#292940] overflow-hidden shrink-0">
                      {trainer.profilePhoto ? (
                        <img src={trainer.profilePhoto} alt={trainer.name || trainer.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6366F1] bg-orange-50 font-bold text-xl">
                          {trainer.firstName?.[0] || trainer.name?.[0] || 'T'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-lg font-bold text-[#11111F] truncate">
                          {trainer.name || `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim()}
                        </h4>
                      </div>
                      <p className="text-[#6366F1] text-xs font-bold uppercase tracking-wider mb-1">
                        {trainer.specialization || 'Fitness Coach'}
                      </p>
                      <p className="text-[#A1A1AA] text-xs leading-relaxed line-clamp-2 mb-2">
                        {trainer.bio || 'Dedicated to helping you reach your peak physical potential.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100">
                        <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Star size={11} className="fill-amber-500 text-amber-500 mr-1" />
                          {trainer.averageRating ? Number(trainer.averageRating).toFixed(1) : '5.0'} 
                          <span className="text-[10px] text-amber-800 ml-1">({trainer.totalReviews || 0} reviews)</span>
                        </span>
                        {trainer.experienceYears && (
                          <span className="text-[11px] font-medium text-[#A1A1AA] bg-stone-100 px-2 py-0.5 rounded-md">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#292940] pb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#11111F] flex items-center gap-2">
                  Customer Reviews & Trainer Ratings
                  <span className="text-xs bg-[#6366F1]/10 text-[#6366F1] font-bold px-2.5 py-0.5 rounded-full border border-[#6366F1]/20">
                    {reviews.length} Verified {reviews.length === 1 ? 'Review' : 'Reviews'}
                  </span>
                </h2>
                <p className="text-sm text-[#A1A1AA] mt-1">Real ratings & feedback from verified members and training clients</p>
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#6366F1] text-white hover:bg-[#4F46E5] font-semibold text-sm rounded-xl transition-all shadow-sm shrink-0"
              >
                <Star size={15} className="fill-white" /> Write a Review
              </button>
            </div>

            {/* Rating Summary Card */}
            <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-6 mb-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Left: Big Score */}
                <div className="flex flex-col items-center justify-center text-center p-5 bg-gradient-to-b from-orange-50/60 to-orange-100/40 rounded-2xl border border-orange-100">
                  <span className="text-5xl font-black text-[#11111F] mb-1">
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
                          className={isFilled ? "text-amber-500 fill-amber-500" : "text-stone-300"}
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-[#A1A1AA]">
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
                        <span className="w-12 font-bold text-[#11111F] flex items-center gap-1">
                          {stars} <Star size={12} className="fill-amber-500 text-amber-500" />
                        </span>
                        <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-[#6366F1] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-14 text-right font-semibold text-[#A1A1AA]">
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
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'all' ? 'bg-[#11111F] text-white shadow-sm' : 'bg-white border border-[#292940] text-[#A1A1AA] hover:text-[#11111F]'}`}
              >
                All Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setReviewFilter('trainer')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'trainer' ? 'bg-[#11111F] text-white shadow-sm' : 'bg-white border border-[#292940] text-[#A1A1AA] hover:text-[#11111F]'}`}
              >
                Trainer Feedback ({reviews.filter((r: any) => r.type === 'trainer').length})
              </button>
              <button
                onClick={() => setReviewFilter('gym')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${reviewFilter === 'gym' ? 'bg-[#11111F] text-white shadow-sm' : 'bg-white border border-[#292940] text-[#A1A1AA] hover:text-[#11111F]'}`}
              >
                Gym Reviews ({reviews.filter((r: any) => r.type === 'gym').length})
              </button>
            </div>

            {/* Review Cards List */}
            {filteredReviews.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-8 text-center">
                <MessageSquare className="mx-auto text-[#17172A] mb-3" size={36} />
                <h4 className="text-base font-bold text-[#11111F]">No reviews in this category yet</h4>
                <p className="text-xs text-[#A1A1AA] mt-1 mb-4">Be the first to share your thoughts and experience!</p>
                <button
                  onClick={() => {
                    if (!user) {
                      alert('Please log in to leave a review.');
                      navigate('/login');
                      return;
                    }
                    setShowReviewModal(true);
                  }}
                  className="px-4 py-2 bg-[#6366F1] text-white font-semibold text-xs rounded-xl hover:bg-[#4F46E5] transition-colors"
                >
                  Write a Review
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((rev: any) => (
                  <div key={rev._id} className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-5 hover:border-[#6366F1]/40 transition-all shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-[#6366F1] text-white font-bold flex items-center justify-center text-sm shadow-sm overflow-hidden shrink-0">
                          {rev.userPhoto ? (
                            <img src={rev.userPhoto} alt={rev.userName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{rev.userName?.[0]?.toUpperCase() || 'M'}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#11111F] text-sm">{rev.userName}</h4>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <ShieldCheck size={11} className="text-emerald-600" /> Verified Member
                            </span>
                          </div>
                          <span className="text-xs text-[#A1A1AA]">
                            {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {rev.type === 'trainer' && rev.trainerName ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200">
                            <Dumbbell size={13} className="text-[#6366F1]" /> Trainer: {rev.trainerName}
                            {rev.trainerSpecialization && <span className="text-[10px] opacity-75">({rev.trainerSpecialization})</span>}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200">
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
                          className={star <= Number(rev.rating) ? "text-amber-500 fill-amber-500" : "text-stone-300"}
                        />
                      ))}
                      <span className="text-xs font-bold text-[#11111F] ml-1.5">{rev.rating}.0</span>
                    </div>

                    <div className="bg-[#0B0B12] border border-[#292940] rounded-xl p-3.5 text-sm text-[#11111F] font-medium leading-relaxed">
                      "{rev.review}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Membership Plans */}
          <section id="membership-plans" className="pt-8 scroll-mt-24">
            <h2 className="text-3xl font-bold text-[#11111F] mb-2">Membership Plans</h2>
            <p className="text-[#A1A1AA] mb-8">Choose the perfect plan that fits your goals and budget.</p>

            {packages.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {packages.map((pkg: any) => {
                  const badge = BADGE_CONFIG[pkg.fitnessGoal] || BADGE_CONFIG['General Fitness'] || { icon: Dumbbell, accent: '#6366F1', bg: 'rgba(22,125,120,0.1)' };
                  const Icon = badge.icon;
                  const price = pkg.monthlyPrice ?? pkg.price ?? 0;
                  const duration = pkg.duration || '1 Month';
                  const featuresList: string[] = Array.isArray(pkg.features)
                    ? pkg.features
                    : (typeof pkg.features === 'string' ? pkg.features.split(',') : []);

                  return (
                    <div key={pkg._id} className="bg-[#FFFFFF] border border-[#292940] p-6 rounded-2xl relative flex flex-col hover:border-[#6366F1] transition-all hover:shadow-md">
                      {pkg.isPopular && (
                        <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#6366F1] text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg uppercase tracking-wider">
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

                      <h3 className="text-xl font-bold text-[#11111F] mb-1.5 leading-snug">{pkg.name}</h3>
                      {pkg.description && (
                        <p className="text-xs text-[#A1A1AA] mb-3 line-clamp-2 leading-relaxed">{pkg.description}</p>
                      )}

                      <div className="flex items-baseline mb-3">
                        <span className="text-3xl font-extrabold text-[#11111F]">₹{price}</span>
                        <span className="text-xs font-semibold text-[#A1A1AA] ml-1.5">/ {duration.toLowerCase().includes('month') ? 'month' : duration}</span>
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
                      <div className="flex-1 mt-2 border-t border-stone-100 pt-3">
                        <p className="text-xs font-bold text-[#11111F] uppercase tracking-wider mb-2.5">Features Included:</p>
                        <ul className="space-y-2">
                          {featuresList.map((f: string, i: number) => (
                            <li key={i} className="flex items-start text-xs text-[#A1A1AA] leading-snug">
                              <CheckCircle size={14} className="text-[#6366F1] mr-2 shrink-0 mt-0.5" />
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
              <div className="bg-[#FFFFFF] border border-[#292940] p-8 rounded-2xl text-center">
                <Dumbbell className="mx-auto text-[#17172A] mb-4" size={48} />
                <p className="text-[#11111F] font-bold text-lg">No plans available online.</p>
                <p className="text-[#A1A1AA]">Please contact the gym directly for pricing.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                {gym.subscriptionPlans.map((plan: any, idx: number) => (
                  <div key={idx} className="bg-[#FFFFFF] border border-[#292940] p-6 rounded-2xl relative flex flex-col hover:border-[#6366F1] transition-colors">
                    {idx === 1 && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#6366F1] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        POPULAR
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-[#11111F] mb-2">{plan.name}</h3>
                    <div className="flex items-baseline mb-4">
                      <span className="text-3xl font-extrabold text-[#6366F1]">₹{plan.price}</span>
                      <span className="text-[#A1A1AA] ml-2">/ {plan.duration}</span>
                    </div>
                    
                    <div className="flex-1 mt-4">
                      <p className="text-sm font-medium text-[#11111F] mb-3">Includes:</p>
                      <ul className="space-y-3">
                        {plan.features?.split(',').map((f: string, i: number) => (
                          <li key={i} className="flex items-start text-sm text-[#A1A1AA]">
                            <CheckCircle size={16} className="text-[#6366F1] mr-2 shrink-0 mt-0.5" />
                            <span>{f.trim()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      onClick={() => handleJoin(plan)}
                      className="w-full mt-8 py-3 rounded-xl font-bold transition-all bg-[#6366F1] text-white hover:bg-[#4F46E5] cursor-pointer"
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
            <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[#11111F] mb-6">Gym Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-[#6366F1] shrink-0 mt-0.5" size={18} />
                  <div className="text-[#A1A1AA] text-sm flex-1">
                    <span className="text-[#11111F] block font-medium mb-1">Location & Address</span>
                    <p className="text-xs text-[#11111F] font-medium leading-relaxed mb-3">
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
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#6366F1] text-white hover:bg-[#4F46E5] rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          <Navigation size={13} /> View Map & Directions <ExternalLink size={12} />
                        </a>
                      );
                    })()}
                  </div>
                </div>
                
                {(gym.email || gym.phone) && (
                  <>
                    <div className="w-full h-px bg-[#17172A] my-4"></div>
                    {gym.phone && (
                      <div className="flex items-center gap-3 text-[#A1A1AA] text-sm">
                        <Phone className="shrink-0 text-[#6366F1]" size={18} />
                        <a href={`tel:${gym.phone}`} className="hover:text-[#6366F1] transition transition-colors font-medium">{gym.phone}</a>
                      </div>
                    )}
                    {gym.email && (
                      <div className="flex items-center gap-3 text-[#A1A1AA] text-sm mt-3">
                        <Mail className="shrink-0 text-[#6366F1]" size={18} />
                        <a href={`mailto:${gym.email}`} className="hover:text-[#6366F1] transition transition-colors font-medium">{gym.email}</a>
                      </div>
                    )}
                    {gym.website && (
                      <div className="flex items-center gap-3 text-[#A1A1AA] text-sm mt-3">
                        <Globe className="shrink-0 text-[#6366F1]" size={18} />
                        <a href={gym.website} target="_blank" rel="noreferrer" className="hover:text-[#6366F1] transition transition-colors font-medium">Visit Website</a>
                      </div>
                    )}
                  </>
                )}

                <div className="w-full h-px bg-[#17172A] my-4"></div>
                
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-green-500 shrink-0 mt-0.5" size={18} />
                  <div className="text-[#A1A1AA] text-sm flex-1">
                    <span className="text-[#11111F] block font-medium mb-1 flex items-center gap-2">
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
              <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#11111F] mb-4">Other Branches</h3>
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
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${selectedBranch?._id === branch._id ? 'bg-[#6366F1]/10 border-[#6366F1]' : 'bg-[#0B0B12] border-[#292940] hover:border-[#6366F1]/50'}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="text-[#6366F1] shrink-0" size={14} />
                            <h4 className="font-bold text-[#11111F] text-sm leading-tight">{branch.branchName}</h4>
                          </div>
                          <a
                            href={branchMapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-bold text-[#6366F1] hover:underline flex items-center gap-0.5 bg-white px-2 py-0.5 rounded border border-[#292940]"
                            title="View location on Google Maps"
                          >
                            Map <ExternalLink size={9} />
                          </a>
                        </div>
                        <div className="pl-5">
                          <p className="text-xs text-[#A1A1AA] mb-1">{branch.location?.address}, {branch.location?.city}</p>
                          {(branch.phone || branch.email) && (
                            <div className="flex flex-col gap-1 mt-2">
                              {branch.phone && (
                                <div className="text-xs text-[#6366F1] flex items-center gap-1.5"><Phone size={10} /> {branch.phone}</div>
                              )}
                              {branch.email && (
                                <div className="text-xs text-[#6366F1] flex items-center gap-1.5"><Mail size={10} /> {branch.email}</div>
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-100 relative">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-[#6366F1] mb-1">
              <Star size={18} className="fill-[#6366F1]" />
              <span className="text-xs font-bold uppercase tracking-wider">Verified Feedback</span>
            </div>
            <h3 className="text-2xl font-black text-[#11111F] mb-1">Write a Review</h3>
            <p className="text-xs text-[#A1A1AA] mb-5">Share your experience with {gym.name} or your personal trainer.</p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Review Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setFormType('trainer'); }}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${formType === 'trainer' ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-md' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'}`}
                  >
                    <Dumbbell size={16} />
                    <span>Personal Trainer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType('gym'); }}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${formType === 'gym' ? 'bg-[#6366F1] text-white border-[#6366F1] shadow-md' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'}`}
                  >
                    <Activity size={16} />
                    <span>Gym Facilities</span>
                  </button>
                </div>
              </div>

              {formType === 'trainer' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Select Trainer</label>
                  {trainers.length > 0 ? (
                    <select
                      value={formTrainer}
                      onChange={(e) => setFormTrainer(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 font-semibold outline-none focus:border-[#6366F1] cursor-pointer"
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
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 outline-none focus:border-[#6366F1]"
                      required
                    />
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">Overall Rating</label>
                <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
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
                          className={star <= formRating ? "text-amber-500 fill-amber-500" : "text-stone-300"}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="ml-3 font-extrabold text-base text-[#11111F]">{formRating}.0 / 5.0</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Your Review Feedback</label>
                <textarea
                  rows={3}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder="Share details of your workout experience, personal coaching quality, facilities, or results..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-stone-800 outline-none focus:border-[#6366F1] resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-xs hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-6 py-2.5 bg-[#6366F1] text-white font-bold text-xs rounded-xl hover:bg-[#4F46E5] transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
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
