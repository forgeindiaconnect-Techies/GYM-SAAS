import React, { useState, useEffect } from 'react';
import {
  Award,
  Trophy,
  IndianRupee,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Gift,
  Users,
  Calendar,
  X,
  Activity,
  History,
  FileCheck,
  Video,
  MapPin,
  TrendingUp,
  Percent
} from 'lucide-react';
import api from '../../utils/api';

interface TrainerStats {
  completedSessionsCount: number;
  averageRating: number;
  ratingCount: number;
  assignedCustomersCount: number;
}

interface AssignedClient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  workoutCompletionPercentage: number | null;
  dietAdherencePercentage: number | null;
  completedSessionsWithTrainer: number;
}

interface TrainerPerformanceData {
  completedSessionsCount: number;
  onlineSessionsCount: number;
  inPersonSessionsCount: number;
  punctualityStatus: string;
  averageRating: number;
  totalRatingsCount: number;
  assignedClientsCount: number;
  reviewedPlansCount: number;
  totalBonusApproved: number;
  totalBonusPaid: number;
  assignedClients: AssignedClient[];
  reviews: Array<{
    rating: number;
    review?: string;
    clientName: string;
    date: string;
  }>;
}

interface TrainerReward {
  _id: string;
  title: string;
  description: string;
  category: string;
  bonusAmount: number;
  currency: string;
  minCompletedSessions: number;
  minAverageRating: number;
  minReviewedPlans?: number;
  termsAndConditions?: string;
  requireApproval: boolean;
  isEligible: boolean;
  eligibilityReasons: string[];
  alreadyClaimed: boolean;
}

interface Claim {
  _id: string;
  rewardId: {
    _id: string;
    title: string;
    category: string;
    bonusAmount: number;
    currency: string;
  };
  claimCode: string;
  claimStatus: 'Pending' | 'Approved' | 'Rejected' | 'Redeemed' | 'Expired';
  rejectionReason?: string;
  financialPayoutStatus: 'Not Applicable' | 'Pending' | 'Paid';
  financialPayoutReference?: string;
  financialPayoutDate?: string;
  createdAt: string;
}

export default function TrainerRewards() {
  const [activeTab, setActiveTab] = useState<'performance' | 'clients' | 'rewards' | 'claims'>('performance');
  const [stats, setStats] = useState<TrainerStats>({
    completedSessionsCount: 0,
    averageRating: 5.0,
    ratingCount: 0,
    assignedCustomersCount: 0
  });
  const [perfData, setPerfData] = useState<TrainerPerformanceData | null>(null);
  const [rewards, setRewards] = useState<TrainerReward[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);

  // Message banner
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTrainerData = async () => {
    try {
      setLoading(true);
      const [rewardRes, perfRes] = await Promise.allSettled([
        api.get('/rewards/trainer'),
        api.get('/performance/my-trainer-performance')
      ]);

      if (rewardRes.status === 'fulfilled' && rewardRes.value.data?.success) {
        setStats(rewardRes.value.data.stats || {
          completedSessionsCount: 0,
          averageRating: 5.0,
          ratingCount: 0,
          assignedCustomersCount: 0
        });
        setRewards(rewardRes.value.data.rewards || []);
        setClaims(rewardRes.value.data.claims || []);
      }

      if (perfRes.status === 'fulfilled' && perfRes.value.data?.success) {
        setPerfData(perfRes.value.data.performance || null);
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load trainer performance & rewards' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainerData();
  }, []);

  const handleClaimReward = async (rewardId: string) => {
    try {
      setRequestingId(rewardId);
      const res = await api.post('/rewards/trainer/claim', { rewardId });
      setMessage({ type: 'success', text: res.data?.message || 'Reward requested successfully!' });
      fetchTrainerData();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to request reward' });
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6" style={{ backgroundColor: '#E8EFF0', minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ borderColor: '#D9E2E3' }}>
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl" style={{ backgroundColor: '#D8EAE7' }}>
            <Award className="w-8 h-8" style={{ color: '#167D78' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#344B4A' }}>
              Trainer Performance & Rewards
            </h1>
            <p className="text-sm" style={{ color: '#697778' }}>
              Verified session records, assigned client progress, gym recognition awards, and financial bonuses.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-gray-100 border text-xs font-semibold" style={{ borderColor: '#D9E2E3' }}>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'performance' ? 'bg-[#167D78] text-white shadow-sm' : 'text-gray-600 hover:text-black'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Performance Summary
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'clients' ? 'bg-[#167D78] text-white shadow-sm' : 'text-gray-600 hover:text-black'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Assigned Clients ({perfData?.assignedClients?.length || stats.assignedCustomersCount || 0})
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'rewards' ? 'bg-[#167D78] text-white shadow-sm' : 'text-gray-600 hover:text-black'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            Available Rewards ({rewards.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'claims' ? 'bg-[#167D78] text-white shadow-sm' : 'text-gray-600 hover:text-black'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Claims & Bonuses ({claims.length})
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#697778' }}>Completed Sessions</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#D8EAE7', color: '#167D78' }}>
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: '#344B4A' }}>
            {perfData?.completedSessionsCount ?? stats.completedSessionsCount}
          </div>
          <p className="text-xs mt-1" style={{ color: '#697778' }}>
            {perfData ? `${perfData.inPersonSessionsCount} in-person • ${perfData.onlineSessionsCount} online` : 'Verified attendance sessions'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#697778' }}>Average Rating</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#FEF3C7', color: '#D99A27' }}>
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: '#D99A27' }}>
            {perfData?.averageRating ?? stats.averageRating} ⭐
          </div>
          <p className="text-xs mt-1" style={{ color: '#697778' }}>
            From {perfData?.totalRatingsCount ?? stats.ratingCount} client reviews
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#697778' }}>Assigned Clients</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#D8EAE7', color: '#167D78' }}>
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold" style={{ color: '#167D78' }}>
            {perfData?.assignedClientsCount ?? stats.assignedCustomersCount}
          </div>
          <p className="text-xs mt-1" style={{ color: '#697778' }}>Active gym client relationships</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border shadow-sm" style={{ borderColor: '#D9E2E3' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: '#697778' }}>Paid Bonuses</span>
            <span className="p-2 rounded-lg" style={{ backgroundColor: '#D1FAE5', color: '#27845A' }}>
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-bold text-[#27845A]">
            ₹{perfData?.totalBonusPaid || 0}
          </div>
          <p className="text-xs mt-1" style={{ color: '#697778' }}>
            ₹{perfData?.totalBonusApproved || 0} approved total
          </p>
        </div>
      </div>

      {/* TAB 1: PERFORMANCE SUMMARY */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operational Quality */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: '#D9E2E3' }}>
              <h2 className="text-lg font-bold" style={{ color: '#344B4A' }}>
                Operational Performance & Records
              </h2>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-bold text-gray-800">Punctuality Status</div>
                      <div className="text-xs text-gray-500">Based on verified start time timestamps</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    {perfData?.punctualityStatus || 'Not available'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-bold text-gray-800">Reviewed & Approved Plans</div>
                      <div className="text-xs text-gray-500">Workout and diet plan reviews completed</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    {perfData?.reviewedPlansCount || 0} Plans
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="text-sm font-bold text-gray-800">Online vs In-Person Ratio</div>
                      <div className="text-xs text-gray-500">Distribution of completed training sessions</div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {perfData?.onlineSessionsCount || 0} Online / {perfData?.inPersonSessionsCount || 0} Offline
                  </span>
                </div>
              </div>
            </div>

            {/* Client Reviews */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: '#D9E2E3' }}>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold" style={{ color: '#344B4A' }}>
                  Customer Reviews & Feedback
                </h2>
                <span className="text-xs text-gray-500">Verified client ratings</span>
              </div>

              {(!perfData?.reviews || perfData.reviews.length === 0) ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No written feedback received yet from assigned clients.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {perfData.reviews.map((r, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-gray-50 border space-y-1.5" style={{ borderColor: '#E8EFF0' }}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-800">{r.clientName}</span>
                        <div className="flex items-center text-amber-500 font-bold">
                          {'★'.repeat(r.rating)}
                          <span className="text-gray-400 text-[11px] ml-1.5">
                            {r.date ? new Date(r.date).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </div>
                      {r.review && <p className="text-xs text-gray-600 italic">"{r.review}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNED CLIENTS PROGRESS */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: '#D9E2E3' }}>
            <div>
              <h2 className="text-lg font-bold" style={{ color: '#344B4A' }}>
                Assigned Clients & Verified Progress
              </h2>
              <p className="text-xs text-gray-500">
                Performance derived strictly from actual recorded workouts, check-ins, and completed sessions.
              </p>
            </div>

            {(!perfData?.assignedClients || perfData.assignedClients.length === 0) ? (
              <div className="text-center py-16 text-gray-400 text-sm">
                No active clients assigned currently.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase bg-gray-50" style={{ borderColor: '#D9E2E3', color: '#697778' }}>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Workout Completion</th>
                      <th className="py-3 px-4">Diet Adherence</th>
                      <th className="py-3 px-4">Completed Sessions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#D9E2E3' }}>
                    {perfData.assignedClients.map(client => (
                      <tr key={client._id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold text-sm shrink-0">
                              {client.profilePicture ? (
                                <img src={client.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                `${client.firstName?.[0] || 'C'}${client.lastName?.[0] || ''}`
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-gray-900">
                                {client.firstName} {client.lastName}
                              </div>
                              <div className="text-[11px] text-gray-400">{client.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          {client.workoutCompletionPercentage !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${client.workoutCompletionPercentage}%`,
                                    backgroundColor: client.workoutCompletionPercentage >= 70 ? '#27845A' : '#167D78'
                                  }}
                                />
                              </div>
                              <span className="font-bold text-gray-700">{client.workoutCompletionPercentage}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No Workouts</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          {client.dietAdherencePercentage !== null ? (
                            <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800">
                              {client.dietAdherencePercentage}% adherence
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">No Check-ins</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs font-bold text-gray-800">
                          {client.completedSessionsWithTrainer} Sessions
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AVAILABLE REWARDS */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#344B4A' }}>
              Available Performance Rewards & Bonuses
            </h2>
            <p className="text-xs text-gray-500">
              Rewards configured by your gym owner with transparent performance targets.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#167D78', borderTopColor: 'transparent' }} />
              <p className="mt-2 text-xs text-gray-500">Loading trainer rewards...</p>
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border" style={{ borderColor: '#D9E2E3' }}>
              <Gift className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <h3 className="text-base font-bold" style={{ color: '#344B4A' }}>No Trainer Rewards Configured</h3>
              <p className="text-sm max-w-sm mx-auto mt-1" style={{ color: '#697778' }}>
                Your gym owner has not published any trainer performance rewards yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map(reward => {
                const canClaim = reward.isEligible && !reward.alreadyClaimed;

                return (
                  <div
                    key={reward._id}
                    className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                    style={{ borderColor: '#D9E2E3' }}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-purple-50 text-purple-800">
                          {reward.category}
                        </span>

                        {reward.bonusAmount > 0 && (
                          <span className="text-xs font-bold text-[#27845A]">
                            ₹{reward.bonusAmount} {reward.currency}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-base leading-tight" style={{ color: '#344B4A' }}>
                          {reward.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {reward.description}
                        </p>
                      </div>

                      {/* Criteria Box */}
                      <div className="p-3 rounded-xl bg-gray-50 text-xs space-y-1.5 border" style={{ borderColor: '#E8EFF0' }}>
                        <div className="font-bold text-gray-700">Required Performance:</div>
                        {reward.minCompletedSessions > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Min Sessions:</span>
                            <span className="font-semibold">{reward.minCompletedSessions} completed sessions</span>
                          </div>
                        )}
                        {reward.minAverageRating > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Min Rating:</span>
                            <span className="font-semibold">{reward.minAverageRating}⭐ rating</span>
                          </div>
                        )}
                        {(reward.minReviewedPlans || 0) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Reviewed Plans:</span>
                            <span className="font-semibold">{reward.minReviewedPlans} plans approved</span>
                          </div>
                        )}
                      </div>

                      {/* Eligibility Status */}
                      {reward.isEligible ? (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>You meet all criteria for this reward!</span>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                          <div className="font-semibold">Criteria not yet met:</div>
                          <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                            {reward.eligibilityReasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t flex justify-end" style={{ borderColor: '#D9E2E3' }}>
                      {reward.alreadyClaimed ? (
                        <span className="text-xs text-gray-400 font-semibold">Already Requested</span>
                      ) : (
                        <button
                          onClick={() => handleClaimReward(reward._id)}
                          disabled={!canClaim || requestingId === reward._id}
                          className={`px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow ${
                            canClaim ? 'bg-[#167D78] hover:opacity-90' : 'bg-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {requestingId === reward._id ? 'Submitting...' : 'Request Reward'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CLAIMS & BONUSES */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#344B4A' }}>
              My Claims & Bonus Payout History
            </h2>
            <p className="text-xs text-gray-500">
              Track status of requested bonuses, gym owner approvals, and recorded financial payouts.
            </p>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border text-sm text-gray-400" style={{ borderColor: '#D9E2E3' }}>
              No reward requests submitted yet.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#D9E2E3' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase bg-gray-50" style={{ borderColor: '#D9E2E3', color: '#697778' }}>
                      <th className="py-3 px-4">Reward</th>
                      <th className="py-3 px-4">Claim Code</th>
                      <th className="py-3 px-4">Approval Status</th>
                      <th className="py-3 px-4">Bonus Amount</th>
                      <th className="py-3 px-4">Financial Payout Status</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#D9E2E3' }}>
                    {claims.map(claim => (
                      <tr key={claim._id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-xs" style={{ color: '#344B4A' }}>
                            {claim.rewardId?.title || 'Reward'}
                          </div>
                          <span className="text-[11px] text-gray-400">{claim.rewardId?.category}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100">
                            {claim.claimCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              claim.claimStatus === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : claim.claimStatus === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {claim.claimStatus}
                          </span>
                          {claim.rejectionReason && (
                            <span className="block text-[11px] text-red-600 mt-1 max-w-[150px] truncate">
                              {claim.rejectionReason}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs font-bold text-[#27845A]">
                          {claim.rewardId?.bonusAmount ? `₹${claim.rewardId.bonusAmount}` : '—'}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          {claim.financialPayoutStatus === 'Paid' ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                                Paid
                              </span>
                              {claim.financialPayoutReference && (
                                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                  Ref: {claim.financialPayoutReference}
                                </div>
                              )}
                              {claim.financialPayoutDate && (
                                <div className="text-[10px] text-gray-400">
                                  {new Date(claim.financialPayoutDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          ) : claim.financialPayoutStatus === 'Pending' ? (
                            <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">
                              Payment Pending
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-gray-500">
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
