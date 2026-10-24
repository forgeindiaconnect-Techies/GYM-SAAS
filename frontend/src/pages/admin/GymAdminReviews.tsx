import { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Building2,
  Dumbbell,
  Search,
  Filter,
  Calendar,
  Award,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';
import api from '../../utils/api';

interface GymReviewItem {
  _id: string;
  userId?: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  review: string;
  type: string;
  gymName?: string;
  createdAt: string;
}

interface TrainerReviewItem {
  _id: string;
  customerId?: string;
  customerName: string;
  customerPhoto?: string;
  customerEmail?: string;
  trainerId?: string;
  trainerName: string;
  trainerPhoto?: string;
  trainerSpecialization?: string;
  rating: number;
  review: string;
  sessionMode?: string;
  bookingId?: string;
  sessionDate?: string;
  createdAt: string;
}

interface ReviewsResponse {
  success: boolean;
  gym: {
    _id: string;
    name: string;
    logo?: string;
    rating: number;
    reviewCount: number;
  };
  summary: {
    gym: {
      totalReviews: number;
      averageRating: number;
      breakdown: Record<number, number>;
    };
    trainer: {
      totalReviews: number;
      averageRating: number;
      breakdown: Record<number, number>;
    };
    totalReviewsCount: number;
  };
  gymReviews: GymReviewItem[];
  trainerReviews: TrainerReviewItem[];
}

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-stone-200 text-[#C1D0D0]'
          }
        />
      ))}
    </div>
  );
};

export default function GymAdminReviews() {
  const [activeTab, setActiveTab] = useState<'gym' | 'trainer'>('gym');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest');

  const fetchReviews = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/gyms/owner/reviews');
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reviews & ratings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Filtered Gym Reviews
  const filteredGymReviews = useMemo(() => {
    if (!data?.gymReviews) return [];
    return data.gymReviews
      .filter((r) => {
        const matchesStar = starFilter === 'all' || Math.round(r.rating) === starFilter;
        const matchesSearch =
          r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.review?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStar && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === 'highest') return b.rating - a.rating;
        if (sortOrder === 'lowest') return a.rating - b.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [data?.gymReviews, starFilter, searchTerm, sortOrder]);

  // Filtered Trainer Reviews
  const filteredTrainerReviews = useMemo(() => {
    if (!data?.trainerReviews) return [];
    return data.trainerReviews
      .filter((r) => {
        const matchesStar = starFilter === 'all' || Math.round(r.rating) === starFilter;
        const matchesSearch =
          r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.trainerSpecialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.review?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStar && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === 'highest') return b.rating - a.rating;
        if (sortOrder === 'lowest') return a.rating - b.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [data?.trainerReviews, starFilter, searchTerm, sortOrder]);

  // Quick stats
  const gymStats = data?.summary?.gym || { totalReviews: 0, averageRating: 0, breakdown: {} };
  const trainerStats = data?.summary?.trainer || { totalReviews: 0, averageRating: 0, breakdown: {} };
  const totalReviewsCount = data?.summary?.totalReviewsCount || 0;

  // Breakdown for currently active tab
  const currentBreakdown = activeTab === 'gym' ? gymStats.breakdown : trainerStats.breakdown;
  const currentTotal = activeTab === 'gym' ? gymStats.totalReviews : trainerStats.totalReviews;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2A3A3A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-[#2DD4BF] to-[#FB923C] text-[#06201D] font-bold shadow-md shadow-[#2DD4BF]/20">
              <Star className="w-5 h-5 fill-white" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5FAFA] tracking-tight">
              Review & Rating
            </h1>
          </div>
          <p className="text-sm text-[#9AAEAE] mt-1">
            Real customer reviews & feedback for <span className="font-semibold text-[#F5FAFA]">{data?.gym?.name || 'your gym'}</span> and personal trainers.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gym Rating Card */}
        <div className="bg-[#141D1E] rounded-2xl p-5 border border-[#2A3A3A] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9AAEAE]">
              Gym Average Rating
            </span>
            <span className="p-2 bg-[#1B2728] text-[#2DD4BF] rounded-xl">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#F5FAFA]">{gymStats.averageRating || '0.0'}</span>
            <span className="text-sm font-semibold text-[#9AAEAE]">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={gymStats.averageRating || 0} size={14} />
            <span className="text-xs text-[#9AAEAE] font-medium">({gymStats.totalReviews} reviews)</span>
          </div>
        </div>

        {/* Trainer Rating Card */}
        <div className="bg-[#141D1E] rounded-2xl p-5 border border-[#2A3A3A] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9AAEAE]">
              Trainer Average Rating
            </span>
            <span className="p-2 bg-[#1B2728] text-[#2DD4BF] rounded-xl">
              <Dumbbell className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#F5FAFA]">{trainerStats.averageRating || '0.0'}</span>
            <span className="text-sm font-semibold text-[#9AAEAE]">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={trainerStats.averageRating || 0} size={14} />
            <span className="text-xs text-[#9AAEAE] font-medium">({trainerStats.totalReviews} reviews)</span>
          </div>
        </div>

        {/* Total Feedback Card */}
        <div className="bg-[#141D1E] rounded-2xl p-5 border border-[#2A3A3A] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9AAEAE]">
              Total Customer Reviews
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#F5FAFA]">{totalReviewsCount}</span>
            <span className="text-xs font-medium text-[#9AAEAE]">Total Entries</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#2DD4BF] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Member Feedback</span>
          </div>
        </div>

        {/* Satisfaction Rate Card */}
        <div className="bg-[#141D1E] rounded-2xl p-5 border border-[#2A3A3A] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9AAEAE]">
              Positive Feedback
            </span>
            <span className="p-2 bg-[#0E1415] text-[#2DD4BF] rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#F5FAFA]">
              {totalReviewsCount > 0
                ? `${Math.round(
                    (((gymStats.breakdown[5] || 0) +
                      (gymStats.breakdown[4] || 0) +
                      (trainerStats.breakdown[5] || 0) +
                      (trainerStats.breakdown[4] || 0)) /
                      totalReviewsCount) *
                      100
                  )}%`
                : '100%'}
            </span>
            <span className="text-xs font-medium text-[#9AAEAE]">4★ & 5★ ratings</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#2DD4BF] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High Satisfaction</span>
          </div>
        </div>
      </div>

      {/* Main Tab Buttons (Customer review about gym, Customer review about trainers) */}
      <div className="bg-[#141D1E] rounded-2xl p-2 border border-[#2A3A3A]/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#1B2728]/80 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('gym');
              setStarFilter('all');
            }}
            className={`flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'gym'
                ? 'bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] text-white shadow-md shadow-[#2DD4BF]/25'
                : 'text-[#9AAEAE] hover:text-[#F5FAFA] hover:bg-[#1B2728]/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Customer Review About Gym</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'gym' ? 'bg-[#141D1E]/20 text-white' : 'bg-[#1B2728] text-[#9AAEAE]'
              }`}
            >
              {gymStats.totalReviews}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('trainer');
              setStarFilter('all');
            }}
            className={`flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'trainer'
                ? 'bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] text-white shadow-md shadow-[#2DD4BF]/25'
                : 'text-[#9AAEAE] hover:text-[#F5FAFA] hover:bg-[#1B2728]/50'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Customer Review About Trainers</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'trainer' ? 'bg-[#141D1E]/20 text-white' : 'bg-[#1B2728] text-[#9AAEAE]'
              }`}
            >
              {trainerStats.totalReviews}
            </span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs font-semibold text-[#9AAEAE] hidden md:inline">Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="text-xs font-semibold text-[#F5FAFA] bg-[#1B2728] border border-[#2A3A3A] rounded-lg px-2.5 py-2 outline-none focus:border-[#2DD4BF]"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating (5★ → 1★)</option>
            <option value="lowest">Lowest Rating (1★ → 5★)</option>
          </select>
        </div>
      </div>

      {/* Filter and Breakdown Section */}
      <div className="bg-[#141D1E] rounded-2xl p-4 md:p-5 border border-[#2A3A3A] shadow-sm space-y-4">
        {/* Search and Star Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9AAEAE] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'gym'
                  ? 'Search by member name or review keyword...'
                  : 'Search by customer, trainer name, or specialty...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#1B2728] border border-[#2A3A3A] rounded-xl text-sm text-[#F5FAFA] placeholder-stone-400 focus:outline-none focus:border-[#2DD4BF] transition-all"
            />
          </div>

          {/* Star Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-[#9AAEAE] mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              onClick={() => setStarFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                starFilter === 'all'
                  ? 'bg-[#0E1415] text-white shadow-sm'
                  : 'bg-[#1B2728] text-[#9AAEAE] hover:bg-[#1B2728]'
              }`}
            >
              All Stars
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                onClick={() => setStarFilter(s)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  starFilter === s
                    ? 'bg-[#2DD4BF] text-white shadow-sm shadow-[#2DD4BF]/20'
                    : 'bg-[#1B2728] text-[#9AAEAE] hover:bg-[#1B2728]'
                }`}
              >
                <span>{s}</span>
                <Star className={`w-3 h-3 ${starFilter === s ? 'fill-white' : 'fill-amber-400 text-amber-400'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Rating Breakdown Bar */}
        <div className="pt-3 border-t border-[#2A3A3A] grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = (currentBreakdown as any)?.[star] || 0;
            const pct = currentTotal > 0 ? Math.round((count / currentTotal) * 100) : 0;
            return (
              <div
                key={star}
                onClick={() => setStarFilter(starFilter === star ? 'all' : star)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  starFilter === star
                    ? 'border-[#2DD4BF] bg-[#1B2728]/50 ring-1 ring-[#2DD4BF]'
                    : 'border-[#2A3A3A] bg-[#1B2728]/60 hover:border-[#2A3A3A]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#F5FAFA] mb-1">
                  <div className="flex items-center gap-1">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="text-[#9AAEAE] font-semibold">{count}</span>
                </div>
                <div className="w-full h-1.5 bg-[#1B2728] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-[#2DD4BF] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-[#141D1E] rounded-2xl p-16 border border-[#2A3A3A] shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#2DD4BF] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-[#9AAEAE]">Loading reviews and ratings...</p>
        </div>
      ) : activeTab === 'gym' ? (
        /* ============================================================ */
        /* TAB 1: CUSTOMER REVIEW ABOUT GYM                              */
        /* ============================================================ */
        filteredGymReviews.length === 0 ? (
          <div className="bg-[#141D1E] rounded-2xl p-14 border border-[#2A3A3A] shadow-sm text-center space-y-3">
            <div className="w-14 h-14 bg-[#1B2728] text-[#2DD4BF] rounded-2xl flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#F5FAFA]">No Gym Reviews Found</h3>
            <p className="text-sm text-[#9AAEAE] max-w-md mx-auto">
              {searchTerm || starFilter !== 'all'
                ? 'No customer reviews matched your search or rating filters. Try resetting the filters.'
                : 'No customer reviews have been submitted for this gym yet. When members submit feedback, it will appear here.'}
            </p>
            {(searchTerm || starFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStarFilter('all');
                }}
                className="mt-2 px-4 py-2 bg-[#0E1415] text-white rounded-xl text-xs font-bold hover:bg-[#0E1415] transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGymReviews.map((rev) => {
              const initials = (rev.userName || 'M')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={rev._id}
                  className="bg-[#141D1E] rounded-2xl p-6 border border-[#2A3A3A] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
                >
                  {/* Top Bar: Member & Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {rev.userPhoto ? (
                        <img
                          src={rev.userPhoto}
                          alt={rev.userName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#2A3A3A]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2DD4BF] to-[#FB923C] text-[#06201D] font-bold font-bold flex items-center justify-center text-sm shadow-sm">
                          {initials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-[#F5FAFA]">{rev.userName}</h4>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1B2728] text-[#2DD4BF] text-[10px] font-bold rounded-full border border-[#2A3A3A]">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#9AAEAE] mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(rev.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-amber-800">{Number(rev.rating).toFixed(1)}</span>
                      </div>
                      <div className="mt-1">
                        <StarRating rating={rev.rating} size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="bg-[#1B2728]/70 rounded-xl p-4 border border-[#2A3A3A] text-[#F5FAFA] text-sm leading-relaxed italic relative">
                    <span className="text-[#9AAEAE] font-serif text-2xl absolute -top-1 left-2 select-none">“</span>
                    <p className="pl-4 pr-1">{rev.review}</p>
                  </div>

                  {/* Bottom Footer Badge */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2A3A3A] text-[#9AAEAE]">
                    <span className="flex items-center gap-1 text-[#2DD4BF] font-semibold">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{rev.gymName || data?.gym?.name || 'Perfect Fitness Studio'}</span>
                    </span>
                    <span className="text-[#9AAEAE]">Gym Experience Review</span>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ============================================================ */
        /* TAB 2: CUSTOMER REVIEW ABOUT TRAINERS                         */
        /* ============================================================ */
        filteredTrainerReviews.length === 0 ? (
          <div className="bg-[#141D1E] rounded-2xl p-14 border border-[#2A3A3A] shadow-sm text-center space-y-3">
            <div className="w-14 h-14 bg-[#1B2728] text-[#2DD4BF] rounded-2xl flex items-center justify-center mx-auto">
              <Dumbbell className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#F5FAFA]">No Trainer Reviews Found</h3>
            <p className="text-sm text-[#9AAEAE] max-w-md mx-auto">
              {searchTerm || starFilter !== 'all'
                ? 'No customer reviews for trainers matched your filters. Try clearing the search or star rating.'
                : 'No trainer reviews have been recorded yet. When members rate their personal training sessions, they will be shown here.'}
            </p>
            {(searchTerm || starFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStarFilter('all');
                }}
                className="mt-2 px-4 py-2 bg-[#0E1415] text-white rounded-xl text-xs font-bold hover:bg-[#0E1415] transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTrainerReviews.map((rev) => {
              const custInitials = (rev.customerName || 'M')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              const trainerInitials = (rev.trainerName || 'T')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={rev._id}
                  className="bg-[#141D1E] rounded-2xl p-6 border border-[#2A3A3A] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Bar: Customer & Trainer Info */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Customer */}
                    <div className="flex items-center gap-3">
                      {rev.customerPhoto ? (
                        <img
                          src={rev.customerPhoto}
                          alt={rev.customerName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#2A3A3A]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold font-bold flex items-center justify-center text-sm shadow-sm">
                          {custInitials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-[#F5FAFA]">{rev.customerName}</h4>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1B2728] text-[#2DD4BF] text-[10px] font-bold rounded-full border border-[#2A3A3A]">
                            Member
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#9AAEAE] mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(rev.createdAt || rev.sessionDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black text-amber-800">{Number(rev.rating).toFixed(1)}</span>
                      </div>
                      <div className="mt-1">
                        <StarRating rating={rev.rating} size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Trainer Highlight Box */}
                  <div className="bg-[#1B2728]/60 border border-[#2A3A3A] rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {rev.trainerPhoto ? (
                        <img
                          src={rev.trainerPhoto}
                          alt={rev.trainerName}
                          className="w-9 h-9 rounded-full object-cover border border-[#2A3A3A]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#2DD4BF] text-[#06201D] font-bold text-xs font-bold flex items-center justify-center">
                          {trainerInitials}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-[#F5FAFA] flex items-center gap-1.5">
                          <span>Trainer: {rev.trainerName}</span>
                        </div>
                        <span className="text-[11px] text-[#9AAEAE] font-medium">
                          {rev.trainerSpecialization || 'Personal Fitness Coach'}
                        </span>
                      </div>
                    </div>

                    {rev.sessionMode && (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 bg-[#141D1E] text-[#2DD4BF] rounded-lg border border-[#2A3A3A] shadow-2xs">
                        {rev.sessionMode}
                      </span>
                    )}
                  </div>

                  {/* Customer Review Text */}
                  <div className="bg-[#1B2728]/70 rounded-xl p-4 border border-[#2A3A3A] text-[#F5FAFA] text-sm leading-relaxed italic relative">
                    <span className="text-[#9AAEAE] font-serif text-2xl absolute -top-1 left-2 select-none">“</span>
                    <p className="pl-4 pr-1">{rev.review}</p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#2A3A3A] text-[#9AAEAE]">
                    <span className="flex items-center gap-1 text-[#2DD4BF] font-semibold">
                      <Award className="w-3.5 h-3.5" />
                      <span>Trainer Feedback</span>
                    </span>
                    {rev.bookingId ? (
                      <span className="text-[#9AAEAE] font-mono text-[11px]">ID: {rev.bookingId}</span>
                    ) : (
                      <span className="text-[#9AAEAE]">Verified Session</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
