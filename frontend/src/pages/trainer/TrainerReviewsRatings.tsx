import { useState, useEffect } from 'react';
import {
  Star, MessageSquare, TrendingUp, Award, RefreshCw,
  Calendar, ChevronDown, Filter, User
} from 'lucide-react';
import api from '../../utils/api';

interface Review {
  _id: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
  } | null;
  customerRating: number;
  customerReview?: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: string;
  status: string;
  updatedAt: string;
}

interface Summary {
  totalReviews: number;
  avgRating: number;
  ratingBreakdown: { star: number; count: number }[];
}

const StarDisplay = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        size={size}
        fill={s <= rating ? '#D99A27' : 'none'}
        stroke={s <= rating ? '#D99A27' : '#C1D0D0'}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

const TrainerReviewsRatings = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStar, setFilterStar] = useState<number | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/trainer-sessions/trainer/reviews');
      if (res.data.success) {
        setReviews(res.data.reviews || []);
        setSummary(res.data.summary || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews
    .filter(r => filterStar === 'all' || r.customerRating === filterStar)
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortOrder === 'highest') return b.customerRating - a.customerRating;
      return a.customerRating - b.customerRating;
    });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-[#2DD4BF]';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-500';
  };

  const getInitials = (r: Review) => {
    const fn = r.customerId?.firstName?.[0] || '?';
    const ln = r.customerId?.lastName?.[0] || '';
    return (fn + ln).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#2DD4BF] border-t-transparent animate-spin" />
        <p className="text-[#9AAEAE] font-medium">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#F5FAFA] tracking-tight">Reviews & Ratings</h1>
          <p className="text-[#9AAEAE] text-sm mt-1">Customer feedback from your completed sessions</p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-4 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-sm font-medium text-[#9AAEAE] hover:bg-[#0E1415] transition-colors shadow-sm"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Overall Rating */}
          <div className="bg-gradient-to-br from-[#141D1E] to-[#2DD4BF] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#141D1E]/5 rounded-full -mr-10 -mt-10" />
            <Award size={22} className="text-yellow-300 mb-3" />
            <div className={`text-5xl font-black mb-1 ${summary.avgRating >= 4 ? 'text-yellow-300' : 'text-white'}`}>
              {summary.avgRating > 0 ? summary.avgRating.toFixed(1) : '—'}
            </div>
            <StarDisplay rating={Math.round(summary.avgRating)} size={18} />
            <p className="text-[#2A3A3A] text-sm mt-2">Average Rating</p>
          </div>

          {/* Total Reviews */}
          <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 shadow-sm">
            <MessageSquare size={22} className="text-[#2DD4BF] mb-3" />
            <div className="text-4xl font-black text-[#F5FAFA] mb-1">{summary.totalReviews}</div>
            <p className="text-[#9AAEAE] text-sm font-medium">Total Reviews</p>
            <p className="text-xs text-[#9AAEAE] mt-1">From completed sessions</p>
          </div>

          {/* Star Breakdown */}
          <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-[#2DD4BF]" />
              <span className="text-sm font-bold text-[#F5FAFA]">Rating Breakdown</span>
            </div>
            <div className="space-y-2">
              {summary.ratingBreakdown.map(({ star, count }) => {
                const pct = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-[#9AAEAE] font-semibold">{star}</span>
                    <Star size={11} fill="#D99A27" stroke="#D99A27" />
                    <div className="flex-1 bg-[#0E1415] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-[#9AAEAE] font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-[#141D1E] border border-[#2A3A3A] rounded-2xl px-5 py-4 shadow-sm">
        <Filter size={15} className="text-[#9AAEAE] shrink-0" />
        <span className="text-sm font-semibold text-[#9AAEAE] mr-1">Filter:</span>
        {(['all', 5, 4, 3, 2, 1] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStar(s)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filterStar === s
                ? 'bg-[#2DD4BF] text-white border-[#2DD4BF] shadow'
                : 'bg-[#0E1415] text-[#9AAEAE] border-[#2A3A3A] hover:border-[#2DD4BF] hover:text-[#2DD4BF]'
            }`}
          >
            {s === 'all' ? 'All Stars' : (
              <><Star size={11} fill={filterStar === s ? 'white' : '#D99A27'} stroke={filterStar === s ? 'white' : '#D99A27'} /> {s}</>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <ChevronDown size={14} className="text-[#9AAEAE]" />
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as any)}
            className="text-xs font-medium text-[#9AAEAE] bg-transparent border-none outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#0E1415] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star size={32} className="text-[#9AAEAE]" />
          </div>
          <h3 className="text-lg font-bold text-[#9AAEAE] mb-2">No Reviews Yet</h3>
          <p className="text-[#9AAEAE] text-sm max-w-sm mx-auto">
            Once customers complete a session and leave a rating, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div
              key={review._id}
              className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] flex items-center justify-center text-[#06201D] font-bold font-bold text-base shrink-0 shadow">
                  {review.customerId ? getInitials(review) : <User size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="font-bold text-[#F5FAFA] text-base">
                        {review.customerId
                          ? `${review.customerId.firstName} ${review.customerId.lastName}`
                          : 'Anonymous Member'}
                      </p>
                      <p className="text-xs text-[#9AAEAE]">{review.customerId?.email || ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StarDisplay rating={review.customerRating} size={16} />
                      <span className={`text-lg font-black ${getRatingColor(review.customerRating)}`}>
                        {review.customerRating}/5
                      </span>
                    </div>
                  </div>

                  {/* Review text */}
                  {review.customerReview && (
                    <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-xl p-4 mb-3">
                      <p className="text-sm text-[#F5FAFA] leading-relaxed italic">
                        "{review.customerReview}"
                      </p>
                    </div>
                  )}

                  {/* Session meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#9AAEAE]">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {review.date} · {review.startTime}–{review.endTime}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold border text-[10px] ${
                      review.mode === 'Online'
                        ? 'bg-[#1B2728] border-[#2A3A3A] text-[#2DD4BF]'
                        : 'bg-[#0E1415] border-[#2A3A3A] text-[#9AAEAE]'
                    }`}>
                      {review.mode}
                    </span>
                    <span className="ml-auto text-[#9AAEAE]">
                      Rated on {new Date(review.updatedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainerReviewsRatings;
