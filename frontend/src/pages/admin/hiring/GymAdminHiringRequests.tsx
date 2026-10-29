import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Briefcase,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  DollarSign,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Send,
  X
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
  trainerId: any;
  trainerName: string;
  trainerEmail?: string;
  trainerPhone?: string;
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

export default function GymAdminHiringRequests() {
  const [requests, setRequests] = useState<HiringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [selectedReq, setSelectedReq] = useState<HiringRequest | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);

  // Negotiation Form
  const [counterSalary, setCounterSalary] = useState('');
  const [counterPtFee, setCounterPtFee] = useState('');
  const [counterTerms, setCounterTerms] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
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
      const res = await axios.get('http://localhost:5600/api/hiring/owner/hiring-requests', {
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

  const handleConfirmHiring = async (requestId: string) => {
    setSubmittingAction(true);
    setActionSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5600/api/hiring/owner/hiring-requests/${requestId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setActionSuccessMsg('🎉 Trainer successfully hired! Added to your gym trainer roster.');
        setTimeout(() => {
          setConfirmModalOpen(false);
          setSelectedReq(null);
          setActionSuccessMsg('');
          fetchRequests();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to confirm hiring terms.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSendCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    setSubmittingAction(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5600/api/hiring/owner/hiring-requests/${selectedReq._id}/negotiate`,
        {
          proposedSalary: counterSalary ? Number(counterSalary) : undefined,
          proposedPtFee: counterPtFee ? Number(counterPtFee) : undefined,
          proposedTerms: counterTerms || undefined,
          message: counterMessage || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setActionSuccessMsg('Counter proposal dispatched to candidate!');
        setTimeout(() => {
          setNegotiateModalOpen(false);
          setActionSuccessMsg('');
          fetchRequests();
        }, 1200);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit counter proposal.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Under Review
          </span>
        );
      case 'Negotiating':
        return (
          <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <MessageSquare className="w-3 h-3" />
            Negotiating
          </span>
        );
      case 'Accepted':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-full flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-3 h-3" />
            Candidate Accepted (Awaiting Confirmation)
          </span>
        );
      case 'Confirmed':
        return (
          <span className="px-2.5 py-1 bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 text-xs font-bold rounded-full flex items-center gap-1.5">
            <UserCheck className="w-3 h-3" />
            Hired & Onboarded
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <XCircle className="w-3 h-3" />
            Declined
          </span>
        );
      case 'Withdrawn':
        return (
          <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/30 text-xs font-medium rounded-full">
            Withdrawn
          </span>
        );
      default:
        return <span className="px-2.5 py-1 bg-slate-800 text-slate-400 text-xs rounded-full">{status}</span>;
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      r.trainerName?.toLowerCase().includes(term) ||
      r.role?.toLowerCase().includes(term) ||
      r.employmentType?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-[#2DD4BF]" />
            Trainer Hiring Requests
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track direct hiring proposals sent to fitness coaches, review counter-negotiations, and finalize employment contracts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/hiring/trainers"
            className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Browse More Trainers
          </Link>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Dispatched', count: requests.length, color: 'text-white' },
          { label: 'Pending Review', count: requests.filter(r => r.status === 'Pending').length, color: 'text-amber-400' },
          { label: 'In Negotiation', count: requests.filter(r => r.status === 'Negotiating').length, color: 'text-purple-400' },
          { label: 'Accepted (Ready to Confirm)', count: requests.filter(r => r.status === 'Accepted').length, color: 'text-emerald-400' },
          { label: 'Hired & Active', count: requests.filter(r => r.status === 'Confirmed').length, color: 'text-[#2DD4BF]' }
        ].map((s, idx) => (
          <div key={idx} className="bg-[#0E1415] border border-[#2A3A3A] p-4 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{s.label}</span>
            <span className={`text-2xl font-bold mt-1 font-mono block ${s.color}`}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#0E1415] p-4 rounded-2xl border border-[#2A3A3A] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by trainer or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#2DD4BF]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'Pending', 'Negotiating', 'Accepted', 'Confirmed', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-[#2DD4BF] text-black shadow-md shadow-[#2DD4BF]/20'
                  : 'bg-[#141D1E] text-slate-400 hover:text-white border border-[#2A3A3A]'
              }`}
            >
              {status === 'ALL' ? 'All Requests' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Request Cards */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#2DD4BF] border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Fetching hiring requests from database...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-16 text-center bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <Briefcase className="w-12 h-12 text-[#2DD4BF]/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No hiring requests match your filter</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
            Discover verified personal trainers, functional coaches, and group fitness experts in our directory and initiate direct hiring proposals.
          </p>
          <Link
            to="/admin/hiring/trainers"
            className="px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#5EEAD4] text-black font-semibold rounded-xl text-sm inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Explore Trainer Profiles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const hasCounter = req.negotiationHistory && req.negotiationHistory.length > 0;
            const lastNegotiation = hasCounter ? req.negotiationHistory[req.negotiationHistory.length - 1] : null;

            return (
              <div
                key={req._id}
                className={`bg-[#0E1415] border rounded-2xl p-5 transition-all ${
                  req.status === 'Accepted'
                    ? 'border-emerald-500/40 bg-gradient-to-r from-[#0E1415] via-[#0E1415] to-emerald-950/20 shadow-lg shadow-emerald-950/30'
                    : req.status === 'Confirmed'
                    ? 'border-[#2DD4BF]/30'
                    : 'border-[#2A3A3A] hover:border-slate-600'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Trainer Details & Role */}
                  <div className="flex items-start gap-4">
                    <div className="w-13 h-13 rounded-2xl bg-[#141D1E] border border-[#2A3A3A] flex items-center justify-center text-lg font-bold text-[#2DD4BF] shrink-0">
                      {req.trainerName ? req.trainerName[0].toUpperCase() : 'T'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-white">{req.trainerName}</h3>
                        {getStatusBadge(req.status)}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                        <span className="font-semibold text-[#2DD4BF]">{req.role}</span>
                        <span>•</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#141D1E] border border-[#2A3A3A] text-slate-300">
                          {req.employmentType}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          Joining: {req.expectedJoiningDate || 'Immediate'}
                        </span>
                      </div>

                      {req.workingHours && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Hours: {req.workingHours}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Compensation breakdown (Monthly vs PT Fee) */}
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
                        Personal Training Fee
                      </span>
                      <span className="text-base font-bold text-[#2DD4BF] font-mono flex items-center gap-0.5">
                        ₹{(req.personalTrainingFee || 0).toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal">/session</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    {/* View Details */}
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setViewModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-[#141D1E] hover:bg-[#1B2728] text-slate-200 border border-[#2A3A3A] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      Details & History
                    </button>

                    {/* If Trainer Accepted: Owner Confirm button */}
                    {req.status === 'Accepted' && (
                      <button
                        onClick={() => {
                          setSelectedReq(req);
                          setConfirmModalOpen(true);
                        }}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
                      >
                        <UserCheck className="w-4 h-4" />
                        Confirm Hiring Terms
                      </button>
                    )}

                    {/* If Negotiating or Pending: Owner can counter */}
                    {(req.status === 'Negotiating' || req.status === 'Pending') && (
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
                        Counter / Negotiate
                      </button>
                    )}

                    {/* If Confirmed: Link to Gym Roster */}
                    {req.status === 'Confirmed' && (
                      <Link
                        to="/admin/trainers"
                        className="px-3.5 py-2 bg-[#2DD4BF]/15 hover:bg-[#2DD4BF]/25 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Gym Roster
                      </Link>
                    )}
                  </div>
                </div>

                {/* Sub-banner if recent negotiation item */}
                {lastNegotiation && req.status === 'Negotiating' && (
                  <div className="mt-4 pt-3 border-t border-[#2A3A3A] flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-purple-300">
                      <Sparkles className="w-3.5 h-3.5" />
                      Latest update by {lastNegotiation.senderRole === 'TRAINER' ? req.trainerName : 'You'}:
                      {lastNegotiation.proposedSalary && (
                        <span className="font-mono font-bold text-white"> ₹{lastNegotiation.proposedSalary.toLocaleString()}/mo</span>
                      )}
                      {lastNegotiation.message && ` - "${lastNegotiation.message}"`}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(lastNegotiation.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-emerald-500/50 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3A3A]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-bold">Confirm Final Hiring Terms</h3>
              </div>
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">{actionSuccessMsg}</h4>
                <p className="text-xs text-slate-400">Redirecting and refreshing rosters...</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <p className="text-sm text-slate-300">
                  <strong className="text-white">{selectedReq.trainerName}</strong> has officially accepted your direct hiring proposal for the position of <strong className="text-[#2DD4BF]">{selectedReq.role}</strong>.
                </p>

                <div className="bg-[#141D1E] p-4 rounded-xl border border-[#2A3A3A] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="font-semibold text-white">{selectedReq.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Employment Type:</span>
                    <span className="font-semibold text-white">{selectedReq.employmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Compensation:</span>
                    <span className="font-bold text-white font-mono">₹{selectedReq.offeredCompensation?.toLocaleString()} / month</span>
                  </div>
                  {selectedReq.personalTrainingFee ? (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Per-Session PT Fee:</span>
                      <span className="font-bold text-[#2DD4BF] font-mono">₹{selectedReq.personalTrainingFee.toLocaleString()} / session</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Earliest Joining Date:</span>
                    <span className="font-semibold text-white">{selectedReq.expectedJoiningDate || 'Immediate'}</span>
                  </div>
                </div>

                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl text-xs text-teal-300">
                  ⚡ <strong>Automated Roster Integration:</strong> Confirming this hire immediately associates this trainer with your gym's official trainer database. No duplicate trainer account is created.
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    onClick={() => setConfirmModalOpen(false)}
                    className="px-4 py-2 bg-[#141D1E] text-slate-300 rounded-xl text-xs font-semibold hover:bg-[#1B2728]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmHiring(selectedReq._id)}
                    disabled={submittingAction}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {submittingAction ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    Confirm & Add to Gym Roster
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Counter Negotiation Modal */}
      {negotiateModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-purple-500/40 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3A3A]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold">Propose Counter-Terms to {selectedReq.trainerName}</h3>
              </div>
              <button
                onClick={() => setNegotiateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-purple-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">{actionSuccessMsg}</h4>
              </div>
            ) : (
              <form onSubmit={handleSendCounterOffer} className="space-y-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Proposed Monthly Salary (₹)
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
                      Per-Session PT Fee (₹, Optional)
                    </label>
                    <input
                      type="number"
                      value={counterPtFee}
                      onChange={(e) => setCounterPtFee(e.target.value)}
                      placeholder="e.g. 600"
                      className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white text-sm focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Updated Terms / Schedule Expectations
                  </label>
                  <textarea
                    rows={2}
                    value={counterTerms}
                    onChange={(e) => setCounterTerms(e.target.value)}
                    placeholder="e.g. 5 days/week morning shift, commission on supplements..."
                    className="w-full px-3 py-2 bg-[#141D1E] border border-[#2A3A3A] rounded-xl text-white text-sm focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Message to Candidate
                  </label>
                  <textarea
                    rows={3}
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                    placeholder="Explain the revised compensation structure or answer their counter question..."
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
                    Send Counter Offer
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Details & Negotiation History Modal */}
      {viewModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#2A3A3A]">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Hiring Request: {selectedReq.trainerName}</span>
                </h3>
                <span className="text-xs text-[#2DD4BF] font-semibold">{selectedReq.role}</span>
              </div>
              <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-white">
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
                    ₹{selectedReq.offeredCompensation?.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Personal Training Fee:</span>
                  <span className="font-bold text-[#2DD4BF] font-mono mt-1 block">
                    ₹{(selectedReq.personalTrainingFee || 0).toLocaleString()} / session
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Working Hours:</span>
                  <span className="text-slate-300 mt-1 block">{selectedReq.workingHours || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Earliest Joining Date:</span>
                  <span className="text-slate-300 mt-1 block">{selectedReq.expectedJoiningDate || 'Immediate'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 mb-1">Job Responsibilities</h4>
                <p className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] text-slate-300 whitespace-pre-line">
                  {selectedReq.jobResponsibilities}
                </p>
              </div>

              {selectedReq.additionalTerms && (
                <div>
                  <h4 className="font-bold text-slate-300 mb-1">Additional Terms</h4>
                  <p className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] text-slate-300">
                    {selectedReq.additionalTerms}
                  </p>
                </div>
              )}

              {/* Negotiation Thread History */}
              <div className="pt-2">
                <h4 className="font-bold text-white mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-[#2DD4BF]" />
                  Negotiation & Counter-Offer Thread
                </h4>

                {(!selectedReq.negotiationHistory || selectedReq.negotiationHistory.length === 0) ? (
                  <p className="text-slate-500 italic bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A]">
                    No counter-negotiations recorded yet. Request is currently with original terms.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedReq.negotiationHistory.map((item, idx) => {
                      const isOwner = item.senderRole === 'GYM_OWNER';
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border ${
                            isOwner
                              ? 'bg-[#141D1E] border-slate-700 ml-6'
                              : 'bg-purple-950/20 border-purple-500/30 mr-6'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`font-bold text-xs ${isOwner ? 'text-teal-300' : 'text-purple-300'}`}>
                              {isOwner ? 'You (Gym Owner)' : `${selectedReq.trainerName} (Trainer)`}
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
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-[#141D1E] text-slate-300 rounded-xl text-xs font-semibold hover:bg-[#1B2728]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
