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
              ? 'fill-amber-400 text-[#B45309]'
              : 'fill-stone-200 text-[#111827]'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#FB923C] text-[#FFFFFF] font-bold shadow-md shadow-orange-500/15">
              <Star className="w-5 h-5 fill-white" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
              Review & Rating
            </h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Real customer reviews & feedback for <span className="font-semibold text-[#111827]">{data?.gym?.name || 'your gym'}</span> and personal trainers.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gym Rating Card */}
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Gym Average Rating
            </span>
            <span className="p-2 bg-[#F8FAFC] text-[#EA580C] rounded-xl">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#111827]">{gymStats.averageRating || '0.0'}</span>
            <span className="text-sm font-semibold text-[#64748B]">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={gymStats.averageRating || 0} size={14} />
            <span className="text-xs text-[#64748B] font-medium">({gymStats.totalReviews} reviews)</span>
          </div>
        </div>

        {/* Trainer Rating Card */}
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Trainer Average Rating
            </span>
            <span className="p-2 bg-[#F8FAFC] text-[#EA580C] rounded-xl">
              <Dumbbell className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#111827]">{trainerStats.averageRating || '0.0'}</span>
            <span className="text-sm font-semibold text-[#64748B]">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={trainerStats.averageRating || 0} size={14} />
            <span className="text-xs text-[#64748B] font-medium">({trainerStats.totalReviews} reviews)</span>
          </div>
        </div>

        {/* Total Feedback Card */}
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Customer Reviews
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#111827]">{totalReviewsCount}</span>
            <span className="text-xs font-medium text-[#64748B]">Total Entries</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#EA580C] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Member Feedback</span>
          </div>
        </div>

        {/* Satisfaction Rate Card */}
        <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-100/50 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Positive Feedback
            </span>
            <span className="p-2 bg-[#F8FAFC] text-[#EA580C] rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#111827]">
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
            <span className="text-xs font-medium text-[#64748B]">4★ & 5★ ratings</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#EA580C] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High Satisfaction</span>
          </div>
        </div>
      </div>

      {/* Main Tab Buttons (Customer review about gym, Customer review about trainers) */}
      <div className="bg-[#FFFFFF] rounded-2xl p-2 border border-[#E2E8F0]/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8FAFC]/80 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('gym');
              setStarFilter('all');
            }}
            className={`flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'gym'
                ? 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-md shadow-orange-500/15'
                : 'text-[#64748B] hover:text-[#111827] hover:bg-[#FFF7ED]/50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Customer Review About Gym</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'gym' ? 'bg-[#FFFFFF]/20 text-white' : 'bg-[#F8FAFC] text-[#64748B]'
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
                ? 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-md shadow-orange-500/15'
                : 'text-[#64748B] hover:text-[#111827] hover:bg-[#FFF7ED]/50'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Customer Review About Trainers</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'trainer' ? 'bg-[#FFFFFF]/20 text-white' : 'bg-[#F8FAFC] text-[#64748B]'
              }`}
            >
              {trainerStats.totalReviews}
            </span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs font-semibold text-[#64748B] hidden md:inline">Sort:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="text-xs font-semibold text-[#111827] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 py-2 outline-none focus:border-[#FDBA74]"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rating (5★ → 1★)</option>
            <option value="lowest">Lowest Rating (1★ → 5★)</option>
          </select>
        </div>
      </div>

      {/* Filter and Breakdown Section */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 md:p-5 border border-[#E2E8F0] shadow-sm space-y-4">
        {/* Search and Star Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeTab === 'gym'
                  ? 'Search by member name or review keyword...'
                  : 'Search by customer, trainer name, or specialty...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#111827] placeholder-stone-400 focus:outline-none focus:border-[#FDBA74] transition-all"
            />
          </div>

          {/* Star Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-[#64748B] mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#EA580C]" /> Filter:
            </span>
            <button
              onClick={() => setStarFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                starFilter === 'all'
                  ? 'bg-[#C2410C] text-white border-[#C2410C] shadow-sm shadow-orange-500/15'
                  : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] border-[#E2E8F0]'
              }`}
            >
              All Stars
            </button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button
                key={s}
                onClick={() => setStarFilter(s)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  starFilter === s
                    ? 'bg-[#C2410C] text-white border-[#C2410C] shadow-sm shadow-orange-500/15'
                    : 'bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] border-[#E2E8F0]'
                }`}
              >
                <span>{s}</span>
                <Star className={`w-3 h-3 ${starFilter === s ? 'fill-white text-white' : 'fill-amber-400 text-[#B45309]'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Rating Breakdown Bar */}
        <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = (currentBreakdown as any)?.[star] || 0;
            const pct = currentTotal > 0 ? Math.round((count / currentTotal) * 100) : 0;
            return (
              <div
                key={star}
                onClick={() => setStarFilter(starFilter === star ? 'all' : star)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  starFilter === star
                    ? 'border-[#FDBA74] bg-[#FFF7ED] ring-1 ring-[#F97316]'
                    : 'border-[#E2E8F0] bg-[#FFF7ED] hover:border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#111827] mb-1">
                  <div className="flex items-center gap-1">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-[#B45309]" />
                  </div>
                  <span className="text-[#64748B] font-semibold">{count}</span>
                </div>
                <div className="w-full h-1.5 bg-[#F8FAFC] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-[#EA580C] rounded-full transition-all duration-500"
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
        <div className="bg-[#FFFFFF] rounded-2xl p-16 border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#FDBA74] border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-[#64748B]">Loading reviews and ratings...</p>
        </div>
      ) : activeTab === 'gym' ? (
        /* ============================================================ */
        /* TAB 1: CUSTOMER REVIEW ABOUT GYM                              */
        /* ============================================================ */
        filteredGymReviews.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl p-14 border border-[#E2E8F0] shadow-sm text-center space-y-3">
            <div className="w-14 h-14 bg-[#F8FAFC] text-[#EA580C] rounded-2xl flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">No Gym Reviews Found</h3>
            <p className="text-sm text-[#64748B] max-w-md mx-auto">
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
                className="mt-2 px-4 py-2 bg-[#111827] text-white rounded-xl text-xs font-bold hover:bg-[#1F2937] transition-all cursor-pointer"
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
                  className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
                >
                  {/* Top Bar: Member & Rating */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {rev.userPhoto ? (
                        <img
                          src={rev.userPhoto}
                          alt={rev.userName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#E2E8F0]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#FB923C] text-[#FFFFFF] font-bold font-bold flex items-center justify-center text-sm shadow-sm">
                          {initials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-[#111827]">{rev.userName}</h4>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F8FAFC] text-[#EA580C] text-[10px] font-bold rounded-full border border-[#E2E8F0]">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(rev.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-[#B45309]" />
                        <span className="text-xs font-black text-amber-800">{Number(rev.rating).toFixed(1)}</span>
                      </div>
                      <div className="mt-1">
                        <StarRating rating={rev.rating} size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="bg-[#F8FAFC]/70 rounded-xl p-4 border border-[#E2E8F0] text-[#111827] text-sm leading-relaxed italic relative">
                    <span className="text-[#64748B] font-serif text-2xl absolute -top-1 left-2 select-none">“</span>
                    <p className="pl-4 pr-1">{rev.review}</p>
                  </div>

                  {/* Bottom Footer Badge */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E2E8F0] text-[#64748B]">
                    <span className="flex items-center gap-1 text-[#EA580C] font-semibold">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{rev.gymName || data?.gym?.name || 'Perfect Fitness Studio'}</span>
                    </span>
                    <span className="text-[#64748B]">Gym Experience Review</span>
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
          <div className="bg-[#FFFFFF] rounded-2xl p-14 border border-[#E2E8F0] shadow-sm text-center space-y-3">
            <div className="w-14 h-14 bg-[#F8FAFC] text-[#EA580C] rounded-2xl flex items-center justify-center mx-auto">
              <Dumbbell className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#111827]">No Trainer Reviews Found</h3>
            <p className="text-sm text-[#64748B] max-w-md mx-auto">
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
                className="mt-2 px-4 py-2 bg-[#111827] text-white rounded-xl text-xs font-bold hover:bg-[#1F2937] transition-all cursor-pointer"
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
                  className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Bar: Customer & Trainer Info */}
                  <div className="flex items-start justify-between gap-3">
                    {/* Customer */}
                    <div className="flex items-center gap-3">
                      {rev.customerPhoto ? (
                        <img
                          src={rev.customerPhoto}
                          alt={rev.customerName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-[#E2E8F0]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#C2410C] text-[#FFFFFF] font-bold font-bold flex items-center justify-center text-sm shadow-sm">
                          {custInitials}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-[#111827]">{rev.customerName}</h4>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F8FAFC] text-[#EA580C] text-[10px] font-bold rounded-full border border-[#E2E8F0]">
                            Member
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(rev.createdAt || rev.sessionDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-[#B45309]" />
                        <span className="text-xs font-black text-amber-800">{Number(rev.rating).toFixed(1)}</span>
                      </div>
                      <div className="mt-1">
                        <StarRating rating={rev.rating} size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Trainer Highlight Box */}
                  <div className="bg-[#FFF7ED] border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {rev.trainerPhoto ? (
                        <img
                          src={rev.trainerPhoto}
                          alt={rev.trainerName}
                          className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0]"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#C2410C] text-white font-bold text-xs font-bold flex items-center justify-center">
                          {trainerInitials}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                          <span>Trainer: {rev.trainerName}</span>
                        </div>
                        <span className="text-[11px] text-[#64748B] font-medium">
                          {rev.trainerSpecialization || 'Personal Fitness Coach'}
                        </span>
                      </div>
                    </div>

                    {rev.sessionMode && (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-1 bg-[#FFFFFF] text-[#EA580C] rounded-lg border border-[#E2E8F0] shadow-2xs">
                        {rev.sessionMode}
                      </span>
                    )}
                  </div>

                  {/* Customer Review Text */}
                  <div className="bg-[#F8FAFC]/70 rounded-xl p-4 border border-[#E2E8F0] text-[#111827] text-sm leading-relaxed italic relative">
                    <span className="text-[#64748B] font-serif text-2xl absolute -top-1 left-2 select-none">“</span>
                    <p className="pl-4 pr-1">{rev.review}</p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E2E8F0] text-[#64748B]">
                    <span className="flex items-center gap-1 text-[#EA580C] font-semibold">
                      <Award className="w-3.5 h-3.5" />
                      <span>Trainer Feedback</span>
                    </span>
                    {rev.bookingId ? (
                      <span className="text-[#64748B] font-mono text-[11px]">ID: {rev.bookingId}</span>
                    ) : (
                      <span className="text-[#64748B]">Verified Session</span>
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
