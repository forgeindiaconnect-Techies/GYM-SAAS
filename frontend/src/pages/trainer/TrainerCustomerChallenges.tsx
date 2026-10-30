import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Award,
  CheckCircle2,
  Clock,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Flame,
  Dumbbell
} from 'lucide-react';
import api from '../../utils/api';

interface Participant {
  _id: string;
  challengeId: {
    _id: string;
    title: string;
    challengeType: string;
    targetValue: number;
    targetUnit: string;
    startDate: string;
    endDate: string;
    badgeName: string;
    status: string;
  };
  customerId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
    phone?: string;
  };
  currentProgress: number;
  targetValue: number;
  completed: boolean;
  completedAt?: string;
  pointsEarned: number;
  streakDays: number;
  trainerFeedback?: string;
  trainerFeedbackAt?: string;
  verifiedByTrainerId?: any;
  updatedAt: string;
}

export default function TrainerCustomerChallenges() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Verify / Feedback Modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [verificationNote, setVerificationNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Message banner
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTrainerProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/challenges/trainer/progress');
      if (res.data?.success) {
        setParticipants(res.data.participants || []);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load customer challenge progress' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainerProgress();
  }, []);

  const openVerifyModal = (p: Participant) => {
    setSelectedParticipant(p);
    setFeedbackText(p.trainerFeedback || '');
    setVerificationNote('');
    setVerifyModalOpen(true);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParticipant) return;

    try {
      setSubmitting(true);
      await api.post('/challenges/trainer/verify-workout', {
        participantId: selectedParticipant._id,
        feedback: feedbackText,
        verificationNote: verificationNote || 'Verified by assigned trainer'
      });

      setMessage({ type: 'success', text: 'Workout verified and customer feedback submitted!' });
      setVerifyModalOpen(false);
      fetchTrainerProgress();
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit verification' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter
  const filteredParticipants = participants.filter(p => {
    const custName = `${p.customerId?.firstName || ''} ${p.customerId?.lastName || ''}`.toLowerCase();
    const chTitle = (p.challengeId?.title || '').toLowerCase();
    const matchesSearch = custName.includes(searchQuery.toLowerCase()) || chTitle.includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'COMPLETED' && p.completed) ||
      (statusFilter === 'IN_PROGRESS' && !p.completed);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6" style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC' }}>
            <Trophy className="w-7 h-7" style={{ color: '#F97316' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#FFFFFF' }}>
              Customer Challenge Progress
            </h1>
            <p className="text-sm" style={{ color: '#64748B' }}>
              Monitor and verify assigned client progress, attendance milestones, and provide coaching feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#EA580C]'
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

      {/* Search & Filters */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: '#E2E8F0' }}>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by customer or challenge..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none"
            style={{ borderColor: '#E2E8F0' }}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold" style={{ color: '#64748B' }}>FILTER:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border bg-[#FFFFFF] focus:outline-none"
            style={{ borderColor: '#E2E8F0', color: '#FFFFFF' }}
          >
            <option value="ALL">All Participants</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed Goal</option>
          </select>
        </div>
      </div>

      {/* Participants Table / Cards */}
      {loading ? (
        <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border" style={{ borderColor: '#E2E8F0' }}>
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#F97316', borderTopColor: 'transparent' }} />
          <p className="mt-2 text-xs text-[#64748B]">Loading assigned customer challenge records...</p>
        </div>
      ) : filteredParticipants.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border" style={{ borderColor: '#E2E8F0' }}>
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-bold" style={{ color: '#FFFFFF' }}>No Customer Progress Found</h3>
          <p className="text-sm max-w-sm mx-auto mt-1" style={{ color: '#64748B' }}>
            When clients enrolled in your training sessions participate in gym challenges, their progress will display here.
          </p>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b text-xs uppercase bg-[#F8FAFC]" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Challenge</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Streak</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Feedback</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#E2E8F0' }}>
                {filteredParticipants.map(p => {
                  const progressPct = Math.min(100, Math.round((p.currentProgress / (p.targetValue || 1)) * 100));

                  return (
                    <tr key={p._id} className="hover:bg-[#FFF7ED]/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold" style={{ color: '#FFFFFF' }}>
                          {p.customerId?.firstName || 'Client'} {p.customerId?.lastName || ''}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {p.customerId?.email}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-xs text-[#111827]">
                          {p.challengeId?.title || 'Challenge'}
                        </div>
                        <span className="text-[11px] text-[#64748B]">
                          Type: {p.challengeId?.challengeType}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs" style={{ color: '#FFFFFF' }}>
                            {p.currentProgress} / {p.targetValue}
                          </span>
                          <div className="w-16 h-2 bg-[#F8FAFC] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${progressPct}%`, backgroundColor: '#F97316' }}
                            />
                          </div>
                          <span className="text-[11px] text-[#64748B]">{progressPct}%</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-xs text-amber-600">
                        🔥 {p.streakDays || 0}d
                      </td>

                      <td className="py-3 px-4 font-bold text-xs text-[#EA580C]">
                        +{p.pointsEarned} pts
                      </td>

                      <td className="py-3 px-4">
                        {p.completed ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F8FAFC] text-[#EA580C]">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F8FAFC] text-[#EA580C]">
                            In Progress
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs max-w-[200px]">
                        {p.trainerFeedback ? (
                          <span className="text-[#111827] italic line-clamp-1" title={p.trainerFeedback}>
                            "{p.trainerFeedback}"
                          </span>
                        ) : (
                          <span className="text-[#64748B]">No feedback yet</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openVerifyModal(p)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition hover:bg-[#FFF7ED] flex items-center gap-1.5 ml-auto"
                          style={{ borderColor: '#E2E8F0', color: '#F97316' }}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Verify & Feedback
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VERIFY & FEEDBACK MODAL */}
      {verifyModalOpen && selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-md p-6 shadow-2xl border" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>
                  Verify Workout & Add Feedback
                </h3>
                <p className="text-xs text-[#64748B]">
                  Client: {selectedParticipant.customerId?.firstName} {selectedParticipant.customerId?.lastName}
                </p>
              </div>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#FFF7ED] text-[#64748B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border text-xs space-y-1" style={{ borderColor: '#F8FAFC' }}>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Challenge:</span>
                  <span className="font-bold text-[#111827]">{selectedParticipant.challengeId?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Current Progress:</span>
                  <span className="font-bold text-[#EA580C]">
                    {selectedParticipant.currentProgress} / {selectedParticipant.targetValue}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-[#111827]">
                  Verification Note / Workout Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Completed chest & triceps session with good form"
                  value={verificationNote}
                  onChange={e => setVerificationNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  style={{ borderColor: '#E2E8F0' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-[#111827]">
                  Coaching Feedback for Client
                </label>
                <textarea
                  rows={3}
                  placeholder="Great consistency! Keep up the tempo for the remaining sessions..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-sm"
                  style={{ borderColor: '#E2E8F0' }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t" style={{ borderColor: '#E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold text-[#111827] hover:bg-[#FFF7ED]"
                  style={{ borderColor: '#E2E8F0' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow bg-[#C2410C] hover:opacity-90"
                >
                  {submitting ? 'Submitting...' : 'Submit Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
