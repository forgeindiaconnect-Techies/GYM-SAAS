import { useState, useEffect } from 'react';
import { 
  Star, Send, CheckCircle2, AlertCircle, Calendar, Clock, RefreshCw, 
  ChevronRight, Building2, Dumbbell, MapPin, ShieldCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface Session {
  _id: string;
  trainerId: {
    _id: string;
    name: string;
    specialization?: string;
    averageRating?: number;
  } | null;
  date: string;
  startTime: string;
  endTime: string;
  mode: string;
  status: string;
  customerRating?: number;
  customerReview?: string;
}

const StarRating = ({
  value,
  onChange,
  interactive = true,
  size = 32
}: {
  value: number;
  onChange?: (v: number) => void;
  interactive?: boolean;
  size?: number;
}) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
        >
          <Star
            size={size}
            fill={(hovered || value) >= s ? '#F59E0B' : 'none'}
            stroke={(hovered || value) >= s ? '#F59E0B' : '#D1D5DB'}
            strokeWidth={1.5}
            className="transition-colors duration-100"
          />
        </button>
      ))}
    </div>
  );
};

const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

const MemberSessionReview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Tab: 'trainers' or 'gym'
  const [activeTab, setActiveTab] = useState<'trainers' | 'gym'>('trainers');

  // Trainer sessions review state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Gym review state
  const [gym, setGym] = useState<any>(null);
  const [loadingGym, setLoadingGym] = useState(false);
  const [gymRating, setGymRating] = useState(5);
  const [gymReview, setGymReview] = useState('');
  const [submittingGym, setSubmittingGym] = useState(false);
  const [gymSuccess, setGymSuccess] = useState(false);
  const [gymError, setGymError] = useState('');
  const [existingGymReview, setExistingGymReview] = useState<any>(null);

  useEffect(() => {
    fetchSessions();
    fetchGym();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-sessions/member');
      if (res.data.success) {
        // Only completed sessions
        const completed = (res.data.sessions || []).filter(
          (s: Session) => s.status === 'Completed'
        );
        setSessions(completed);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchGym = async () => {
    try {
      setLoadingGym(true);
      const res = await api.get('/gyms/my-gym');
      if (res.data.success && res.data.gym) {
        const g = res.data.gym;
        setGym(g);
        // Check if user already reviewed this gym
        if (g.reviews && user) {
          const myRev = g.reviews.find((r: any) => 
            (r.userId && (r.userId.toString() === user.id || r.userId.toString() === (user as any)?._id)) ||
            (r.userName && r.userName.toLowerCase() === `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase())
          );
          if (myRev) {
            setExistingGymReview(myRev);
            setGymRating(myRev.rating || 5);
            setGymReview(myRev.review || '');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching gym:', err);
    } finally {
      setLoadingGym(false);
    }
  };

  const handleSelectSession = (s: Session) => {
    setSelectedSession(s);
    setRating(s.customerRating || 0);
    setReview(s.customerReview || '');
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedSession || rating === 0) {
      setError('Please select a star rating before submitting.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      await api.post(`/trainer-sessions/${selectedSession._id}/rate`, {
        rating,
        review: review.trim()
      });
      setSuccess(true);
      // Update local state
      setSessions(prev =>
        prev.map(s =>
          s._id === selectedSession._id
            ? { ...s, customerRating: rating, customerReview: review.trim() }
            : s
        )
      );
      setSelectedSession(prev => prev ? { ...prev, customerRating: rating, customerReview: review.trim() } : prev);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitGymReview = async () => {
    if (!gym || gymRating === 0) {
      setGymError('Please select a star rating.');
      return;
    }
    if (!gymReview.trim()) {
      setGymError('Please enter your review feedback.');
      return;
    }
    try {
      setSubmittingGym(true);
      setGymError('');
      const res = await api.post(`/gyms/${gym._id}/reviews`, {
        rating: gymRating,
        review: gymReview.trim(),
        type: 'gym'
      });
      if (res.data.success) {
        setGymSuccess(true);
        const newRev = res.data.review;
        setExistingGymReview(newRev);
        setGym((prev: any) => {
          if (!prev) return prev;
          const prevReviews = prev.reviews || [];
          const filtered = prevReviews.filter((r: any) => 
            !(r.userId && user && (r.userId.toString() === user.id || r.userId.toString() === (user as any)?._id))
          );
          return {
            ...prev,
            rating: res.data.gymRating || prev.rating,
            reviewCount: res.data.reviewCount || prev.reviewCount,
            reviews: [newRev, ...filtered]
          };
        });
      }
    } catch (err: any) {
      setGymError(err.response?.data?.message || 'Failed to submit gym review.');
    } finally {
      setSubmittingGym(false);
    }
  };

  const pendingReviews = sessions.filter(s => !s.customerRating);
  const completedReviews = sessions.filter(s => !!s.customerRating);

  if (loading && loadingGym) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#F97316] border-t-transparent animate-spin" />
        <p className="text-[#78716C] font-medium">Loading review and rating details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">

      {/* Header with Separate Trainers & Gym Toggle Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E5E4] pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#292524] tracking-tight">Review & Ratings</h1>
          <p className="text-[#78716C] text-sm mt-1">Share your experience and reviews for your trainers and gym</p>
        </div>

        {/* Separate Tab Buttons: Trainers and Gym */}
        <div className="inline-flex items-center p-1.5 bg-stone-100/80 border border-[#E7E5E4] rounded-2xl shadow-sm gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('trainers')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'trainers'
                ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/25'
                : 'text-[#78716C] hover:text-[#292524] hover:bg-white/60'
            }`}
          >
            <Dumbbell size={16} />
            <span>Trainers</span>
            {pendingReviews.length > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                activeTab === 'trainers' ? 'bg-white text-[#F97316]' : 'bg-orange-100 text-[#F97316]'
              }`}>
                {pendingReviews.length} new
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('gym');
              if (!gym) fetchGym();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'gym'
                ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/25'
                : 'text-[#78716C] hover:text-[#292524] hover:bg-white/60'
            }`}
          >
            <Building2 size={16} />
            <span>Gym</span>
            {gym?.rating && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 ${
                activeTab === 'gym' ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'
              }`}>
                <Star size={10} className="fill-amber-500" /> {gym.rating}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Trainers Content */}
      {activeTab === 'trainers' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in">

          {/* Session List */}
          <div className="lg:col-span-2 space-y-3">
            {pendingReviews.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2 px-1">
                  Awaiting Your Review ({pendingReviews.length})
                </h2>
                {pendingReviews.map(s => (
                  <button
                    key={s._id}
                    onClick={() => handleSelectSession(s)}
                    className={`w-full text-left p-4 rounded-xl border transition-all mb-2 ${
                      selectedSession?._id === s._id
                        ? 'bg-[#F97316]/5 border-[#F97316] shadow'
                        : 'bg-white border-[#E7E5E4] hover:border-[#FED7AA] hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[#292524]">
                        {s.trainerId?.name || 'Your Trainer'}
                      </span>
                      <ChevronRight size={14} className="text-[#78716C]" />
                    </div>
                    <p className="text-xs text-[#78716C]">{s.trainerId?.specialization || 'Fitness Trainer'}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#78716C]">
                      <span className="flex items-center gap-1"><Calendar size={11} />{s.date}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{s.startTime}</span>
                      <span className={`px-1.5 py-0.5 rounded-full font-semibold text-[10px] ${
                        s.mode === 'Online' ? 'bg-blue-50 text-blue-600' : 'bg-[#FFFDF8] text-[#78716C]'
                      }`}>{s.mode}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {completedReviews.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2 px-1">
                  Reviewed ({completedReviews.length})
                </h2>
                {completedReviews.map(s => (
                  <button
                    key={s._id}
                    onClick={() => handleSelectSession(s)}
                    className={`w-full text-left p-4 rounded-xl border transition-all mb-2 ${
                      selectedSession?._id === s._id
                        ? 'bg-[#F97316]/5 border-[#F97316]'
                        : 'bg-[#F8FAF9] border-[#E7E5E4] hover:border-[#FED7AA]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[#292524]">
                        {s.trainerId?.name || 'Your Trainer'}
                      </span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(st => (
                          <Star key={st} size={11} fill={st <= (s.customerRating||0) ? '#F59E0B' : 'none'} stroke={st <= (s.customerRating||0) ? '#F59E0B' : '#D1D5DB'} strokeWidth={1.5} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#78716C]">
                      <Calendar size={11} />
                      <span>{s.date}</span>
                      <CheckCircle2 size={11} className="text-emerald-500 ml-auto" />
                      <span className="text-emerald-600 font-semibold">Reviewed</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {sessions.length === 0 && (
              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-8 text-center shadow-sm">
                <Calendar size={36} className="mx-auto text-[#78716C] mb-3" />
                <p className="font-bold text-[#78716C]">No Completed Sessions</p>
                <p className="text-xs text-[#78716C] mt-1">Complete a training session first to leave a trainer review.</p>
              </div>
            )}
          </div>

          {/* Trainer Rating Form */}
          <div className="lg:col-span-3">
            {!selectedSession ? (
              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center shadow-sm h-full flex flex-col items-center justify-center">
                <Star size={48} className="text-[#E7E5E4] mb-4" />
                <h3 className="text-lg font-bold text-[#78716C] mb-2">Select a Session</h3>
                <p className="text-sm text-[#78716C]">Pick a completed session from the left to rate your trainer.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-7 shadow-sm space-y-6">

                {/* Trainer Info */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#292524] to-[#F97316] rounded-xl text-white">
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg">
                    {selectedSession.trainerId?.name?.[0] || 'T'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base">{selectedSession.trainerId?.name || 'Your Trainer'}</p>
                    <p className="text-xs text-[#E7E5E4]">{selectedSession.trainerId?.specialization || 'Fitness Trainer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#E7E5E4]">{selectedSession.date}</p>
                    <p className="text-xs text-[#E7E5E4]">{selectedSession.startTime} – {selectedSession.endTime}</p>
                    <span className="mt-1 inline-block px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-semibold">
                      {selectedSession.mode}
                    </span>
                  </div>
                </div>

                {/* Success State */}
                {success && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-emerald-700 font-bold text-sm">Review Submitted!</p>
                      <p className="text-emerald-600 text-xs">Thank you for your feedback. Your trainer can now see your rating.</p>
                    </div>
                  </div>
                )}

                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-bold text-[#292524] mb-3">
                    How would you rate this session?
                  </label>
                  <StarRating value={rating} onChange={r => { setRating(r); setSuccess(false); }} size={36} />
                  {rating > 0 && (
                    <p className="mt-2 text-sm font-semibold text-[#F97316]">
                      {ratingLabels[rating]}
                    </p>
                  )}
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-bold text-[#292524] mb-2">
                    Write a review <span className="text-[#78716C] font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={review}
                    onChange={e => { setReview(e.target.value); setSuccess(false); }}
                    placeholder="Share details about your experience — training quality, communication, punctuality..."
                    className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 text-sm text-[#292524] resize-none placeholder:text-[#78716C] transition-all"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle size={15} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || rating === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-200 text-sm"
                  >
                    {submitting ? (
                      <><RefreshCw size={16} className="animate-spin" /> Submitting...</>
                    ) : (
                      <><Send size={16} /> {selectedSession.customerRating ? 'Update Review' : 'Submit Review'}</>
                    )}
                  </button>
                  <button
                    onClick={() => navigate('/member/dashboard')}
                    className="px-5 py-3 border border-[#E7E5E4] text-[#78716C] font-semibold rounded-xl hover:bg-[#FFFDF8] transition-colors text-sm"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gym Content */}
      {activeTab === 'gym' && (
        <div className="space-y-6 animate-fade-in">
          {loadingGym ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-9 h-9 rounded-full border-4 border-[#F97316] border-t-transparent animate-spin" />
              <p className="text-[#78716C] text-sm font-medium">Loading your gym details...</p>
            </div>
          ) : !gym ? (
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-10 text-center shadow-sm">
              <Building2 size={42} className="mx-auto text-[#EA580C] mb-3" />
              <h3 className="text-lg font-bold text-[#292524]">No Gym Assigned</h3>
              <p className="text-xs text-[#78716C] mt-1">You are not currently enrolled in a gym.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Gym Info Card (Left) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#F97316] font-black text-xl shrink-0 overflow-hidden">
                      {gym.logo ? (
                        <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#292524] leading-tight">{gym.name}</h3>
                      <p className="text-xs text-[#78716C] flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-[#F97316]" /> {gym.location?.city || ''}, {gym.location?.state || ''}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 mb-4 flex items-center justify-between">
                    <span className="text-xs text-[#78716C] font-semibold">Overall Rating</span>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-[#292524]">
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                      <span>{gym.rating ? Number(gym.rating).toFixed(1) : '4.5'}</span>
                      <span className="text-xs font-normal text-[#78716C]">({gym.reviewCount || gym.reviews?.length || 0} reviews)</span>
                    </div>
                  </div>

                  {gym.location?.address && (
                    <div className="text-xs text-[#78716C] mb-4">
                      <span className="font-semibold text-[#292524] block mb-0.5">Address:</span>
                      {gym.location.address}
                    </div>
                  )}

                  {gym.facilities?.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-[#292524] block mb-2">Amenities & Facilities:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {gym.facilities.slice(0, 6).map((fac: string, idx: number) => (
                          <span key={idx} className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                            {fac}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Existing Review Badge Card */}
                {existingGymReview && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>You have reviewed this gym</span>
                    </div>
                    <div className="flex items-center gap-1 my-1.5">
                      {[1, 2, 3, 4, 5].map(st => (
                        <Star key={st} size={13} fill={st <= existingGymReview.rating ? '#F59E0B' : 'none'} stroke={st <= existingGymReview.rating ? '#F59E0B' : '#D1D5DB'} strokeWidth={1.5} />
                      ))}
                      <span className="text-xs font-bold text-emerald-900 ml-1.5">{existingGymReview.rating}.0</span>
                    </div>
                    <p className="text-xs text-emerald-700 italic">"{existingGymReview.review}"</p>
                    <p className="text-[10px] text-emerald-600 mt-2 font-medium">You can update your gym review anytime using the form on the right.</p>
                  </div>
                )}
              </div>

              {/* Gym Review Form (Right) */}
              <div className="lg:col-span-3">
                <div className="bg-white border border-[#E7E5E4] rounded-2xl p-7 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#292524]">
                      {existingGymReview ? 'Update Your Gym Review' : 'Rate & Review Your Gym'}
                    </h3>
                    <p className="text-xs text-[#78716C] mt-0.5">
                      Share your experience regarding {gym.name}'s equipment, facilities, staff, and workout atmosphere.
                    </p>
                  </div>

                  {gymSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-emerald-700 font-bold text-sm">Gym Review Submitted!</p>
                        <p className="text-emerald-600 text-xs">Your feedback has been saved and will be displayed on the gym's public page.</p>
                      </div>
                    </div>
                  )}

                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-bold text-[#292524] mb-3">
                      How would you rate {gym.name}?
                    </label>
                    <StarRating value={gymRating} onChange={r => { setGymRating(r); setGymSuccess(false); }} size={36} />
                    {gymRating > 0 && (
                      <p className="mt-2 text-sm font-semibold text-[#F97316]">
                        {ratingLabels[gymRating]}
                      </p>
                    )}
                  </div>

                  {/* Review Text */}
                  <div>
                    <label className="block text-sm font-bold text-[#292524] mb-2">
                      Review Feedback
                    </label>
                    <textarea
                      rows={4}
                      value={gymReview}
                      onChange={e => { setGymReview(e.target.value); setGymSuccess(false); }}
                      placeholder="Share details about gym cleanliness, equipment quality, staff friendliness, air conditioning, and overall environment..."
                      className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 text-sm text-[#292524] resize-none placeholder:text-[#78716C] transition-all"
                    />
                  </div>

                  {gymError && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle size={15} />
                      <span>{gymError}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmitGymReview}
                      disabled={submittingGym || gymRating === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-200 text-sm"
                    >
                      {submittingGym ? (
                        <><RefreshCw size={16} className="animate-spin" /> Submitting...</>
                      ) : (
                        <><Send size={16} /> {existingGymReview ? 'Update Gym Review' : 'Submit Gym Review'}</>
                      )}
                    </button>
                    <button
                      onClick={() => navigate('/member/dashboard')}
                      className="px-5 py-3 border border-[#E7E5E4] text-[#78716C] font-semibold rounded-xl hover:bg-[#FFFDF8] transition-colors text-sm"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MemberSessionReview;
