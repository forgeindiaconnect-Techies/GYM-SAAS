import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  Send,
  AlertCircle,
  X,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';

interface NegotiationItem {
  senderRole: 'GYM_OWNER' | 'TRAINER';
  proposedSalary?: number;
  proposedPtFee?: number;
  proposedTerms?: string;
  message?: string;
  timestamp: string;
}

interface HiringRequest {
  _id: string;
  gymId: any;
  gymName: string;
  gymLocation?: string;
  role: string;
  employmentType: string;
  offeredCompensation: number;
  personalTrainingFee?: number;
  workingHours?: string;
  jobResponsibilities: string;
  requiredExpertise?: string[];
  expectedJoiningDate: string;
  additionalTerms?: string;
  message?: string;
  status: 'Pending' | 'Negotiating' | 'Accepted' | 'Confirmed' | 'Rejected' | 'Withdrawn';
  declineReason?: string;
  negotiationHistory: NegotiationItem[];
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TrainerHiringRequests() {
  const [requests, setRequests] = useState<HiringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [selectedReq, setSelectedReq] = useState<HiringRequest | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);

  // Form states
  const [counterSalary, setCounterSalary] = useState('');
  const [counterPtFee, setCounterPtFee] = useState('');
  const [counterTerms, setCounterTerms] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5600/api/hiring/trainer/hiring-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setRequests(res.data.requests || res.data.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load hiring requests:', err);
      setError(err.response?.data?.message || 'Failed to load hiring requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (action: 'ACCEPT' | 'REJECT' | 'NEGOTIATE', extraPayload: any = {}) => {
    if (!selectedReq) return;
    setSubmittingAction(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5600/api/hiring/trainer/hiring-requests/${selectedReq._id}/respond`,
        {
          action,
          ...extraPayload
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setActionSuccessMsg(
          action === 'ACCEPT'
            ? '🎉 Hiring request accepted! Gym owner has been notified to confirm final onboarding.'
            : action === 'NEGOTIATE'
            ? 'Counter proposal dispatched to gym owner.'
            : 'Hiring proposal declined.'
        );

        setTimeout(() => {
          setNegotiateModalOpen(false);
          setDeclineModalOpen(false);
          setActionSuccessMsg('');
          fetchRequests();
        }, 1200);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process response.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Action Required
          </span>
        );
      case 'Negotiating':
        return (
          <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-full flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Under Negotiation
          </span>
        );
      case 'Accepted':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Accepted (Awaiting Owner Confirmation)
          </span>
        );
      case 'Confirmed':
        return (
          <span className="px-2.5 py-1 bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 text-xs font-bold rounded-full flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            Employment Confirmed & Active
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-full flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Declined
          </span>
        );
      default:
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs rounded-full">{status}</span>;
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-[#2DD4BF]" />
            Direct Hiring Proposals
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review direct employment offers sent to you by verified gym owners, negotiate compensation terms, and accept placements.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'Pending', 'Negotiating', 'Accepted', 'Confirmed', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === status
                ? 'bg-[#2DD4BF] text-black shadow-md shadow-[#2DD4BF]/20'
                : 'bg-[#0E1415] text-slate-400 hover:text-white border border-[#2A3A3A]'
            }`}
          >
            {status === 'ALL' ? `All Requests (${requests.length})` : status}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#2DD4BF] border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Loading your direct hiring proposals...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-16 text-center bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <Building2 className="w-12 h-12 text-[#2DD4BF]/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No hiring requests found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            When gym owners discover your profile and wish to hire you directly, their formal compensation offers and job terms will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isActionable = req.status === 'Pending' || req.status === 'Negotiating';
            return (
              <div
                key={req._id}
                className={`bg-[#0E1415] border rounded-2xl p-5 transition-all ${
                  req.status === 'Pending'
                    ? 'border-amber-500/30'
                    : req.status === 'Confirmed'
                    ? 'border-[#2DD4BF]/40'
                    : 'border-[#2A3A3A]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Gym & Role Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#141D1E] border border-[#2A3A3A] flex items-center justify-center text-xl font-bold text-[#2DD4BF] shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-white">
                          {req.gymName || (req.gymId as any)?.name || 'Gym'}
                        </h3>
                        {getStatusBadge(req.status)}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                        <span className="font-semibold text-[#2DD4BF] text-sm">{req.role}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#141D1E] border border-[#2A3A3A] text-slate-300">
                          {req.employmentType}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {req.gymLocation || (req.gymId as any)?.location?.address || 'Bangalore'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Joining: {req.expectedJoiningDate || 'Immediate'}
                        </span>
                        {req.workingHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {req.workingHours}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Compensation Breakdown */}
                  <div className="bg-[#141D1E] p-3.5 rounded-xl border border-[#2A3A3A] flex flex-wrap sm:flex-nowrap items-center gap-4 lg:min-w-[320px]">
                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        Monthly Salary
                      </span>
                      <span className="text-base font-bold text-white font-mono flex items-center gap-0.5">
                        ₹{req.offeredCompensation?.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                      </span>
                    </div>

                    <div className="w-px h-8 bg-[#2A3A3A] hidden sm:block" />

                    <div className="flex-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                        PT Session Fee
                      </span>
                      <span className="text-base font-bold text-[#2DD4BF] font-mono flex items-center gap-0.5">
                        ₹{(req.personalTrainingFee || 0).toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal">/session</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setDetailsModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-[#141D1E] hover:bg-[#1B2728] text-slate-200 border border-[#2A3A3A] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      View Details
                    </button>

                    {isActionable && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            if (window.confirm(`Accept direct hiring offer from ${req.gymName} for ₹${req.offeredCompensation.toLocaleString()}/month?`)) {
                              handleRespond('ACCEPT');
                            }
                          }}
                          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accept Offer
                        </button>

                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setCounterSalary(String(req.offeredCompensation));
                            setCounterPtFee(String(req.personalTrainingFee || ''));
                            setCounterTerms(req.additionalTerms || '');
                            setCounterMessage('');
                            setNegotiateModalOpen(true);
                          }}
                          className="px-3.5 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                          Negotiate
                        </button>

                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setDeclineReason('');
                            setDeclineModalOpen(true);
                          }}
                          className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Decline
                        </button>
                      </>
                    )}

                    {req.status === 'Confirmed' && (
                      <span className="px-3 py-1.5 bg-teal-500/10 text-teal-300 border border-teal-500/30 text-xs font-semibold rounded-xl flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
                        Active Coaching Post
                      </span>
                    )}
                  </div>
                </div>

                {req.message && (
                  <div className="mt-3 text-xs text-slate-300 bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] italic">
                    <span className="font-semibold text-slate-400 not-italic block mb-0.5">Message from Gym Owner:</span>
                    "{req.message}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Details & Negotiation History Modal */}
      {detailsModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3A3A]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Hiring Offer from {selectedReq.gymName}</span>
                </h3>
                <span className="text-xs text-[#2DD4BF] font-semibold">{selectedReq.role}</span>
              </div>
              <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 py-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#141D1E] p-4 rounded-xl border border-[#2A3A3A]">
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedReq.status)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Employment Type:</span>
                  <span className="font-semibold text-white mt-1 block">{selectedReq.employmentType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Offered Monthly Salary:</span>
                  <span className="font-bold text-white font-mono mt-1 block">
                    ₹{selectedReq.offeredCompensation?.toLocaleString()} / month
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">PT Session Fee:</span>
                  <span className="font-bold text-[#2DD4BF] font-mono mt-1 block">
                    ₹{(selectedReq.personalTrainingFee || 0).toLocaleString()} / session
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Working Schedule:</span>
                  <span className="text-slate-300 mt-1 block">{selectedReq.workingHours || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Expected Joining Date:</span>
                  <span className="text-slate-300 mt-1 block">{selectedReq.expectedJoiningDate || 'Immediate'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 mb-1">Responsibilities</h4>
                <p className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] text-slate-300 whitespace-pre-line">
                  {selectedReq.jobResponsibilities}
                </p>
              </div>

              {selectedReq.additionalTerms && (
                <div>
                  <h4 className="font-bold text-slate-300 mb-1">Terms & Conditions</h4>
                  <p className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] text-slate-300">
                    {selectedReq.additionalTerms}
                  </p>
                </div>
              )}

              {/* Negotiation History */}
              <div className="pt-2">
                <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#2DD4BF]" />
                  Negotiation History
                </h4>

                {(!selectedReq.negotiationHistory || selectedReq.negotiationHistory.length === 0) ? (
                  <p className="text-slate-500 italic bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                    No counter negotiations yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedReq.negotiationHistory.map((item, idx) => {
                      const isMe = item.senderRole === 'TRAINER';
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border ${
                            isMe
                              ? 'bg-purple-950/20 border-purple-500/30 ml-6'
                              : 'bg-[#141D1E] border-slate-700 mr-6'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`font-bold text-xs ${isMe ? 'text-purple-300' : 'text-teal-300'}`}>
                              {isMe ? 'You (Trainer)' : `${selectedReq.gymName} (Gym Owner)`}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>

                          {item.proposedSalary && (
                            <p className="text-white font-mono font-semibold">
                              Proposed Salary: ₹{item.proposedSalary.toLocaleString()} / mo
                              {item.proposedPtFee ? ` • PT Fee: ₹${item.proposedPtFee}/session` : ''}
                            </p>
                          )}
                          {item.proposedTerms && (
                            <p className="text-slate-300 mt-1">Terms: {item.proposedTerms}</p>
                          )}
                          {item.message && (
                            <p className="text-slate-400 italic mt-1 bg-black/20 p-2 rounded-lg">
                              "{item.message}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#2A3A3A]">
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 bg-[#141D1E] text-slate-300 rounded-xl text-xs font-semibold hover:bg-[#1B2728]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trainer Negotiation Modal */}
      {negotiateModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-purple-500/40 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3A3A]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold">Propose Counter-Terms to {selectedReq.gymName}</h3>
              </div>
              <button onClick={() => setNegotiateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-purple-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">{actionSuccessMsg}</h4>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRespond('NEGOTIATE', {
                    proposedSalary: counterSalary ? Number(counterSalary) : undefined,
                    proposedPtFee: counterPtFee ? Number(counterPtFee) : undefined,
                    proposedTerms: counterTerms || undefined,
                    message: counterMessage || undefined
                  });
                }}
                className="space-y-4 py-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Counter Monthly Salary (₹)
                    </label>
                    <input
                      type="number"
                      value={counterSalary}
                      onChange={(e) => setCounterSalary(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white text-sm focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Counter PT Session Fee (₹, Optional)
                    </label>
                    <input
                      type="number"
                      value={counterPtFee}
                      onChange={(e) => setCounterPtFee(e.target.value)}
                      placeholder="e.g. 750"
                      className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white text-sm focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Proposed Adjustments to Terms
                  </label>
                  <textarea
                    rows={2}
                    value={counterTerms}
                    onChange={(e) => setCounterTerms(e.target.value)}
                    placeholder="e.g. Can commit to 6 hours daily, prefer afternoon batch..."
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white text-sm focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Note to Gym Owner
                  </label>
                  <textarea
                    rows={3}
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                    placeholder="Share your reasoning or request clarifications..."
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white text-sm focus:border-purple-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setNegotiateModalOpen(false)}
                    className="px-4 py-2 bg-[#141D1E] text-slate-300 rounded-xl text-xs font-semibold hover:bg-[#1B2728]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAction}
                    className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20"
                  >
                    {submittingAction ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Counter Proposal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {declineModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-rose-500/40 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#2A3A3A]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                Decline Hiring Request
              </h3>
              <button onClick={() => setDeclineModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-slate-300">
                Are you sure you want to decline the hiring offer from <strong>{selectedReq.gymName}</strong> for the role of <strong>{selectedReq.role}</strong>?
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Reason for declining (Optional)
                </label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Already committed to another gym, schedule clash..."
                  className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white text-xs focus:border-rose-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#2A3A3A]">
              <button
                type="button"
                onClick={() => setDeclineModalOpen(false)}
                className="px-4 py-2 bg-[#141D1E] text-slate-300 rounded-xl text-xs font-semibold hover:bg-[#1B2728]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={() => handleRespond('REJECT', { declineReason })}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                {submittingAction ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
