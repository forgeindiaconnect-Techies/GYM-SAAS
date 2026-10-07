import { useState, useEffect } from 'react';
import { Star, Send, CheckCircle2, AlertCircle, Calendar, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

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
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSessions();
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

  const pendingReviews = sessions.filter(s => !s.customerRating);
  const completedReviews = sessions.filter(s => !!s.customerRating);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-[#F97316] border-t-transparent animate-spin" />
        <p className="text-[#78716C] font-medium">Loading your sessions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Rate Your Trainer</h1>
        <p className="text-[#78716C] text-sm mt-1">Share your experience from completed training sessions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

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
              <p className="text-xs text-[#78716C] mt-1">Complete a session first to leave a review.</p>
            </div>
          )}
        </div>

        {/* Rating Form */}
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
    </div>
  );
};

export default MemberSessionReview;
